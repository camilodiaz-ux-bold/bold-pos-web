import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useMesasStore, type MesaConfig } from '../store/mesasStore';
import {
  ArrowLeft, Save, Plus, Trash2, ChevronUp, ChevronDown,
  LayoutGrid, Layers, SlidersHorizontal, Search, X, Copy,
  Info, MapPin, Users, ZoomIn, ZoomOut, RotateCcw, Maximize2,
  Move, TriangleAlert, Circle, Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Constants ───────────────────────────────────────────────────────────────────
const GRID      = 20;
const SCALE_MIN = 0.25;
const SCALE_MAX = 2.5;

// Chair visual constants
const CS = 7;    // chair square size (px)
const CG = 5;    // gap from table edge to chair

// ─── Types ───────────────────────────────────────────────────────────────────────
type Category    = 'Mesa' | 'Barra';
type Shape       = 'Rectangular' | 'Redonda';
type TableStatus = 'Activa' | 'Fuera de servicio';
type SectionId   = 'mapa' | 'zonas' | 'mesas' | 'tipos' | 'config';

interface CTable {
  id: string;
  name: string;
  zone: string;
  capacity: number;
  category: Category;
  shape: Shape | null;   // null for Barra
  status: TableStatus;
  rotationDeg: number;   // 0 | 90 | 180 | 270 — default 0
  x: number;
  y: number;
  w: number;             // auto-computed card width
  h: number;             // auto-computed card height
}

interface Zona     { id: string; name: string; active: boolean; }
interface TipoConf { id: string; category: Category; shape: Shape | null; label: string; active: boolean; }

type DragState =
  | { kind: 'none' }
  | { kind: 'pan';  sx: number; sy: number; spx: number; spy: number }
  | { kind: 'move'; tid: string; ox: number; oy: number };

// ─── Auto-sizing ─────────────────────────────────────────────────────────────────
function getTableDims(category: Category, shape: Shape | null, capacity: number): { w: number; h: number } {
  if (category === 'Barra') {
    return { w: Math.max(90, 28 + capacity * 20), h: 50 };
  }
  if (shape === 'Redonda') {
    if (capacity <= 4)  return { w: 80,  h: 80  };
    if (capacity <= 6)  return { w: 100, h: 100 };
    if (capacity <= 8)  return { w: 120, h: 120 };
    return                     { w: 140, h: 140 };
  }
  // Rectangular
  if (capacity <= 4)  return { w: 90,  h: 80  };
  if (capacity <= 6)  return { w: 120, h: 90  };
  if (capacity <= 8)  return { w: 140, h: 100 };
  return                     { w: 160, h: 110 };
}

function getSizeLabel(category: Category, shape: Shape | null, capacity: number): string {
  if (category === 'Barra') {
    const s = capacity <= 3 ? 'S' : capacity <= 5 ? 'M' : capacity <= 7 ? 'L' : 'XL';
    return `Auto · ${s}`;
  }
  const s = capacity <= 4 ? 'S' : capacity <= 6 ? 'M' : capacity <= 8 ? 'L' : 'XL';
  return `Auto · ${s}`;
}

// ─── Chair position helpers ───────────────────────────────────────────────────────
function getRectChairPos(w: number, h: number, n: number) {
  let top = 0, bot = 0, lft = 0, rgt = 0;
  if      (n <= 2)  { top = 1; bot = 1; }
  else if (n <= 4)  { top = 2; bot = 2; }
  else if (n <= 6)  { top = 3; bot = 3; }
  else if (n <= 8)  { top = 3; bot = 3; lft = 1; rgt = 1; }
  else if (n <= 10) { top = 4; bot = 4; lft = 1; rgt = 1; }
  else              { top = 4; bot = 4; lft = 2; rgt = 2; }

  const pts: { x: number; y: number; rx: number }[] = [];
  for (let i = 0; i < top; i++) pts.push({ x: (i+1)/(top+1)*w - CS/2, y: -(CG+CS), rx: 2 });
  for (let i = 0; i < bot; i++) pts.push({ x: (i+1)/(bot+1)*w - CS/2, y: h+CG,     rx: 2 });
  for (let i = 0; i < lft; i++) pts.push({ x: -(CG+CS), y: (i+1)/(lft+1)*h - CS/2, rx: 2 });
  for (let i = 0; i < rgt; i++) pts.push({ x: w+CG,     y: (i+1)/(rgt+1)*h - CS/2, rx: 2 });
  return pts;
}

function getRoundChairPos(d: number, n: number) {
  const cx = d / 2, cy = d / 2, r = d / 2;
  const dist = r + CG + CS / 2;
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i / n) - Math.PI / 2;
    return { x: cx + dist * Math.cos(a) - CS/2, y: cy + dist * Math.sin(a) - CS/2, rx: CS/2 };
  });
}

function getBarraChairPos(w: number, n: number) {
  return Array.from({ length: n }, (_, i) => ({
    x: (i+1)/(n+1)*w - CS/2,
    y: -(CG+CS),
    rx: 2,
  }));
}

// ─── Initial data ─────────────────────────────────────────────────────────────────
const D = (cat: Category, sh: Shape | null, cap: number) => ({ ...getTableDims(cat, sh, cap), rotationDeg: 0 });

const INIT_TABLES: CTable[] = [
  // Salón — mix of rect and round
  { id:'a1',   name:'A1',  zone:'Salón',   capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa',            x:60,  y:80,  ...D('Mesa','Rectangular',4) },
  { id:'a2',   name:'A2',  zone:'Salón',   capacity:4, category:'Mesa', shape:'Redonda',     status:'Activa',            x:200, y:80,  ...D('Mesa','Redonda',4)     },
  { id:'a3',   name:'A3',  zone:'Salón',   capacity:6, category:'Mesa', shape:'Rectangular', status:'Activa',            x:340, y:75,  ...D('Mesa','Rectangular',6) },
  { id:'a4',   name:'A4',  zone:'Salón',   capacity:2, category:'Mesa', shape:'Redonda',     status:'Activa',            x:60,  y:230, ...D('Mesa','Redonda',2)     },
  { id:'b1',   name:'B1',  zone:'Salón',   capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa',            x:200, y:225, ...D('Mesa','Rectangular',4) },
  { id:'b2',   name:'B2',  zone:'Salón',   capacity:4, category:'Mesa', shape:'Redonda',     status:'Activa',            x:360, y:225, ...D('Mesa','Redonda',4)     },
  { id:'b3',   name:'B3',  zone:'Salón',   capacity:8, category:'Mesa', shape:'Rectangular', status:'Activa',            x:530, y:130, ...D('Mesa','Rectangular',8) },
  // Terraza
  { id:'t1',   name:'T1',  zone:'Terraza', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa',            x:60,  y:80,  ...D('Mesa','Rectangular',4) },
  { id:'t2',   name:'T2',  zone:'Terraza', capacity:2, category:'Mesa', shape:'Redonda',     status:'Activa',            x:200, y:80,  ...D('Mesa','Redonda',2)     },
  { id:'t3',   name:'T3',  zone:'Terraza', capacity:4, category:'Mesa', shape:'Redonda',     status:'Activa',            x:60,  y:230, ...D('Mesa','Redonda',4)     },
  { id:'t4',   name:'T4',  zone:'Terraza', capacity:6, category:'Mesa', shape:'Rectangular', status:'Activa',            x:200, y:225, ...D('Mesa','Rectangular',6) },
  // Barra
  { id:'bar1', name:'B01', zone:'Barra',   capacity:3, category:'Barra', shape:null,         status:'Activa',            x:60,  y:80,  ...D('Barra',null,3)         },
  { id:'bar2', name:'B02', zone:'Barra',   capacity:4, category:'Barra', shape:null,         status:'Activa',            x:60,  y:185, ...D('Barra',null,4)         },
  { id:'bar3', name:'B03', zone:'Barra',   capacity:2, category:'Barra', shape:null,         status:'Fuera de servicio', x:60,  y:290, ...D('Barra',null,2)         },
];

const INIT_ZONAS: Zona[] = [
  { id:'salon',   name:'Salón',   active:true },
  { id:'terraza', name:'Terraza', active:true },
  { id:'barra',   name:'Barra',   active:true },
];

const INIT_TIPOS: TipoConf[] = [
  { id:'mesa-rect',  category:'Mesa',  shape:'Rectangular', label:'Mesa · Rectangular', active:true },
  { id:'mesa-round', category:'Mesa',  shape:'Redonda',     label:'Mesa · Redonda',     active:true },
  { id:'barra',      category:'Barra', shape:null,          label:'Barra',              active:true },
];

const NAV: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id:'mapa',   label:'Mapa',                  icon: LayoutGrid        },
  { id:'zonas',  label:'Zonas',                 icon: MapPin            },
  { id:'mesas',  label:'Mesas',                 icon: Users             },
  { id:'tipos',  label:'Tipos de mesa',         icon: Layers            },
  { id:'config', label:'Configuración general', icon: SlidersHorizontal },
];

// ─── Switch ──────────────────────────────────────────────────────────────────────
function Switch({ on, toggle, disabled }: { on: boolean; toggle?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : toggle}
      disabled={disabled}
      className={cn(
        'w-10 h-5 rounded-full relative shrink-0 transition-colors focus:outline-none',
        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
        on ? 'bg-blue-500' : 'bg-gray-300',
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all',
        on ? 'left-[22px]' : 'left-0.5',
      )} />
    </button>
  );
}

// ─── TableEl ─────────────────────────────────────────────────────────────────────
interface TableElProps {
  t: CTable;
  selected: boolean;
  onDown: (e: React.MouseEvent, t: CTable) => void;
}

function TableEl({ t, selected, onDown }: TableElProps) {
  const isRound = t.category === 'Mesa' && t.shape === 'Redonda';
  const isBarra = t.category === 'Barra';
  const isOOS   = t.status === 'Fuera de servicio';

  // Chair positions
  const chairs = isBarra
    ? getBarraChairPos(t.w, t.capacity)
    : isRound
      ? getRoundChairPos(t.w, t.capacity)
      : getRectChairPos(t.w, t.h, t.capacity);

  const chairFill   = selected ? '#bfdbfe' : isOOS ? '#f1f5f9' : '#e2e8f0';
  const chairStroke = selected ? '#60a5fa' : isOOS ? '#e2e8f0' : '#cbd5e1';

  // Card visual style
  const borderRadius = isRound ? '50%' : isBarra ? '9999px' : '10px';
  const cardBg = isOOS
    ? 'bg-gray-100 border-gray-200'
    : isBarra
      ? 'bg-amber-50 border-amber-300'
      : isRound
        ? 'bg-sky-50 border-sky-200'
        : 'bg-white border-gray-200';

  return (
    <div
      style={{
        position: 'absolute',
        left: t.x,
        top: t.y,
        width: t.w,
        height: t.h,
        userSelect: 'none',
        overflow: 'visible',
        zIndex: selected ? 10 : 1,
        transform: t.rotationDeg ? `rotate(${t.rotationDeg}deg)` : undefined,
        transformOrigin: 'center center',
      }}
      onMouseDown={e => onDown(e, t)}
    >
      {/* Chair SVG — overflow visible, no pointer events */}
      <svg
        style={{
          position: 'absolute', top: 0, left: 0,
          width: t.w, height: t.h,
          overflow: 'visible', pointerEvents: 'none', zIndex: 0,
        }}
      >
        {chairs.map((c, i) => (
          <rect
            key={i}
            x={c.x} y={c.y} width={CS} height={CS} rx={c.rx}
            fill={chairFill} stroke={chairStroke} strokeWidth={1}
          />
        ))}
      </svg>

      {/* Card */}
      <div
        style={{ position: 'relative', zIndex: 1, borderRadius, width: '100%', height: '100%' }}
        className={cn(
          'flex flex-col items-center justify-center border-2 shadow-sm cursor-grab select-none transition-all',
          cardBg,
          isOOS && 'opacity-50',
          selected && !isOOS && 'ring-2 ring-blue-500 ring-offset-2 shadow-blue-100 border-blue-300',
          !isOOS && !selected && 'hover:shadow-md hover:border-gray-300',
        )}
      >
        <span className="text-[11px] font-black text-gray-800 select-none leading-none">{t.name}</span>
        <span className="text-[9px] text-gray-400 select-none mt-0.5">{t.capacity}p</span>
        {isOOS && <span className="text-[8px] font-bold text-gray-400 select-none mt-0.5">inactiva</span>}
      </div>
    </div>
  );
}

// ─── GestionarMesasView ───────────────────────────────────────────────────────────
interface Props { onBack: () => void; }

interface NewMesaState {
  name: string; zone: string; capacity: number;
  category: Category; shape: Shape; status: TableStatus;
}

export function GestionarMesasView({ onBack }: Props) {

  // ── Store compartido con MesasView (fuente de verdad) ─────────────────────────
  const { mesasConfig, setMesasConfig, zonesConfig, setZonesConfig } = useMesasStore();

  // ── Navigation ────────────────────────────────────────────────────────────────
  const [section, setSection] = useState<SectionId>('mapa');

  // ── Data — se inicializa desde el store (única fuente de verdad) ──────────────
  const [tables, setTables] = useState<CTable[]>(() => mesasConfig as unknown as CTable[]);
  const [zonas,  setZonas]  = useState<Zona[]>(() =>
    zonesConfig.length > 0
      ? zonesConfig.map((name, i) => ({ id: `z-init-${i}`, name, active: true }))
      : INIT_ZONAS,
  );
  const [tipos,  setTipos]  = useState<TipoConf[]>(INIT_TIPOS);

  // ── Canvas state ──────────────────────────────────────────────────────────────
  const [selId,  setSelId]  = useState<string|null>(null);
  const [zone,   setZone]   = useState(() => zonesConfig[0] ?? 'Salón');
  const [scale,  setScale]  = useState(1);
  const [panX,   setPanX]   = useState(32);
  const [panY,   setPanY]   = useState(32);
  const [snap,   setSnap]   = useState(true);

  // ── Dirty tracking + snapshot original (para Descartar cambios) ──────────────
  const originalTablesRef = useRef<MesaConfig[]>(mesasConfig);   // datos al entrar
  const originalZonasRef  = useRef<string[]>(zonesConfig);        // zonas al entrar
  const savedTablesRef = useRef(JSON.stringify(mesasConfig));
  const savedZonasRef  = useRef(JSON.stringify(zonesConfig));
  const isDirty = useMemo(
    () =>
      JSON.stringify(tables) !== savedTablesRef.current ||
      JSON.stringify(zonas.filter(z => z.active).map(z => z.name)) !== savedZonasRef.current,
    [tables, zonas],
  );
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // ── Mesas section ─────────────────────────────────────────────────────────────
  const [srch,      setSrch]      = useState('');
  const [zoneF,     setZoneF]     = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [showDel,   setShowDel]   = useState(false);
  const [newM, setNewM] = useState<NewMesaState>({
    name:'', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa',
  });

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef   = useRef<DragState>({ kind:'none' });
  const liveRef   = useRef({ scale, panX, panY, snap });
  liveRef.current = { scale, panX, panY, snap };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const zoneTables = tables.filter(t => t.zone === zone);
  const selTable   = selId ? tables.find(t => t.id === selId) ?? null : null;
  const filtered   = tables.filter(t =>
    t.name.toLowerCase().includes(srch.toLowerCase()) &&
    (zoneF === 'Todas' || t.zone === zoneF)
  );

  // ── Global mouse ───────��──────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (d.kind === 'none') return;
      const { scale:s, panX:px, panY:py, snap:sn } = liveRef.current;
      const rect = canvasRef.current?.getBoundingClientRect();

      if (d.kind === 'pan') {
        setPanX(d.spx + e.clientX - d.sx);
        setPanY(d.spy + e.clientY - d.sy);
      } else if (d.kind === 'move' && rect) {
        const wx = (e.clientX - rect.left - px) / s;
        const wy = (e.clientY - rect.top  - py) / s;
        let nx = wx - d.ox;
        let ny = wy - d.oy;
        if (sn) { nx = Math.round(nx / GRID) * GRID; ny = Math.round(ny / GRID) * GRID; }
        setTables(prev => prev.map(t => t.id === d.tid ? { ...t, x:Math.max(0,nx), y:Math.max(0,ny) } : t));
      }
    };
    const onUp = () => {
      dragRef.current = { kind:'none' };
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []); // eslint-disable-line

  // ── Wheel zoom ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { scale:s, panX:px, panY:py } = liveRef.current;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const wx = (mx - px) / s, wy = (my - py) / s;
      const f  = e.deltaY < 0 ? 1.08 : 0.93;
      const ns = Math.max(SCALE_MIN, Math.min(SCALE_MAX, s * f));
      setPanX(mx - wx * ns); setPanY(my - wy * ns); setScale(ns);
    };
    el.addEventListener('wheel', onWheel, { passive:false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []); // eslint-disable-line

  // ── Canvas handlers ───────────────────────────────────────────────────────────
  const onBgDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setSelId(null);
    dragRef.current = { kind:'pan', sx:e.clientX, sy:e.clientY, spx:panX, spy:panY };
    document.body.style.cursor     = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const onTableDown = (e: React.MouseEvent, t: CTable) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    setSelId(t.id);
    const rect = canvasRef.current!.getBoundingClientRect();
    const { scale:s, panX:px, panY:py } = liveRef.current;
    const wx = (e.clientX - rect.left - px) / s;
    const wy = (e.clientY - rect.top  - py) / s;
    dragRef.current = { kind:'move', tid:t.id, ox:wx-t.x, oy:wy-t.y };
    document.body.style.cursor     = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  // ── Zoom helpers ──────────────────────────────────────────────────────────────
  const zoomIn  = () => setScale(s => Math.min(SCALE_MAX, +(s * 1.12).toFixed(3)));
  const zoomOut = () => setScale(s => Math.max(SCALE_MIN, +(s * 0.88).toFixed(3)));
  const resetV  = () => { setScale(1); setPanX(32); setPanY(32); };
  const fitView = () => {
    const zT = tables.filter(t => t.zone === zone);
    if (!zT.length) { resetV(); return; }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pad = 56;
    const minX = Math.min(...zT.map(t=>t.x)), minY = Math.min(...zT.map(t=>t.y));
    const maxX = Math.max(...zT.map(t=>t.x+t.w)), maxY = Math.max(...zT.map(t=>t.y+t.h));
    const ns = Math.max(SCALE_MIN, Math.min(SCALE_MAX,
      Math.min((rect.width-pad*2)/(maxX-minX||1), (rect.height-pad*2)/(maxY-minY||1))
    ));
    setPanX(pad - minX*ns); setPanY(pad - minY*ns); setScale(ns);
  };

  // ── Create on canvas ──────────────────────────────────────────────────────────
  const createOnCanvas = (category: Category, shape: Shape | null, capacity = 4) => {
    const { w, h } = getTableDims(category, shape, capacity);
    const rect = canvasRef.current?.getBoundingClientRect();
    const cx = rect ? (rect.width/2  - panX) / scale : 200;
    const cy = rect ? (rect.height/2 - panY) / scale : 200;
    const sx = snap ? Math.round((cx-w/2)/GRID)*GRID : cx-w/2;
    const sy = snap ? Math.round((cy-h/2)/GRID)*GRID : cy-h/2;
    const n  = tables.filter(t => t.zone === zone).length + 1;
    const pre = category === 'Barra' ? 'BAR' : zone[0].toUpperCase();
    const id  = `t-${Date.now()}`;
    setTables(p => [...p, {
      id, name:`${pre}${n}`, zone, capacity, category,
      shape: category === 'Barra' ? null : shape,
      status:'Activa', rotationDeg: 0, x:Math.max(0,sx), y:Math.max(0,sy), w, h,
    }]);
    setSelId(id);
  };

  // ── Delete / duplicate ────────────────────────────────────────────────────────
  const doDelete = () => {
    if (!selId) return;
    setTables(p => p.filter(t => t.id !== selId));
    setSelId(null); setShowDel(false);
    toast.success('Mesa eliminada del mapa');
  };
  const doDuplicate = () => {
    if (!selTable) return;
    const id = `t-${Date.now()}`;
    setTables(p => [...p, { ...selTable, id, name:`${selTable.name}*`, x:selTable.x+GRID*2, y:selTable.y+GRID*2 }]);
    setSelId(id);
    toast.success('Mesa duplicada');
  };

  // ── Update selected table property (with auto-resize) ─────────────────────────
  const upd = (field: keyof CTable, val: string | number | null) => {
    if (!selId) return;
    if (field === 'zone') {
      setTables(p => p.map(t => t.id === selId ? { ...t, zone: val as string } : t));
      setSelId(null);
      toast.info(`Mesa movida a ${val}`);
      return;
    }
    setTables(prev => prev.map(t => {
      if (t.id !== selId) return t;
      let updated: CTable = { ...t, [field]: val };
      if (field === 'category') {
        const newCat   = val as Category;
        const newShape = newCat === 'Barra' ? null : (t.shape ?? 'Rectangular');
        const { w, h } = getTableDims(newCat, newShape, t.capacity);
        updated = { ...updated, category: newCat, shape: newShape, w, h };
      } else if (field === 'shape') {
        const { w, h } = getTableDims(t.category, val as Shape, t.capacity);
        updated = { ...updated, w, h };
      } else if (field === 'capacity') {
        const { w, h } = getTableDims(t.category, t.shape, val as number);
        updated = { ...updated, w, h };
      }
      return updated;
    }));
  };

  // ── Create from modal ─────────────────────────────────────────────────────────
  const createFromModal = () => {
    if (!newM.name.trim()) { toast.error('Ingresa un nombre'); return; }
    const realShape = newM.category === 'Barra' ? null : newM.shape;
    const { w, h } = getTableDims(newM.category, realShape, newM.capacity);
    const id = `t-${Date.now()}`;
    const captZ = newM.zone, captId = id;
    const yOff = tables.filter(t => t.zone === newM.zone).length * (h + 30);
    setTables(p => [...p, {
      id, name:newM.name, zone:newM.zone, capacity:newM.capacity,
      category:newM.category, shape:realShape, status:newM.status,
      rotationDeg: 0, x:60, y:Math.max(0, 60 + yOff), w, h,
    }]);
    setShowModal(false);
    setNewM({ name:'', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa' });
    toast.success(`Mesa "${newM.name}" creada`, {
      action: { label:'Ver en mapa', onClick:() => { setSection('mapa'); setZone(captZ); setSelId(captId); } },
    });
  };

  // Sincronización silenciosa al store (sin toast) — usada al navegar atrás
  const syncToStore = () => {
    setMesasConfig(tables as unknown as MesaConfig[]);
    setZonesConfig(zonas.filter(z => z.active).map(z => z.name));
  };

  // ── beforeunload: avisa al SO si hay cambios sin guardar ─────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ── Navegación con guarda de cambios ─────────────────────────────────────────
  const guardedNav = (action: () => void) => {
    if (isDirty) {
      pendingActionRef.current = action;
      setShowUnsavedModal(true);
    } else {
      action();
    }
  };

  // Volver a Mesas: con guarda de cambios; la acción pendiente es solo onBack()
  // porque save/discard manejan el store antes de navegar.
  const handleBack = () => {
    guardedNav(onBack);
  };

  // Modal: descartar cambios → restaura el store al estado original y navega
  const handleDiscardAndLeave = () => {
    setMesasConfig(originalTablesRef.current);
    setZonesConfig(originalZonasRef.current);
    setShowUnsavedModal(false);
    pendingActionRef.current?.();
    pendingActionRef.current = null;
  };

  // Modal: guardar y salir → guarda el estado actual en el store y navega
  const handleSaveAndLeave = () => {
    setMesasConfig(tables as unknown as MesaConfig[]);
    setZonesConfig(zonas.filter(z => z.active).map(z => z.name));
    savedTablesRef.current = JSON.stringify(tables);
    savedZonasRef.current  = JSON.stringify(zonas.filter(z => z.active).map(z => z.name));
    toast.success('Cambios guardados');
    setShowUnsavedModal(false);
    pendingActionRef.current?.();
    pendingActionRef.current = null;
  };

  const save = () => {
    // Persiste en memoria → MesasView lo reflejará inmediatamente
    const savedTables = tables as unknown as MesaConfig[];
    const savedZones  = zonas.filter(z => z.active).map(z => z.name);
    setMesasConfig(savedTables);
    setZonesConfig(savedZones);
    // Actualiza snapshot original y dirty para resetear isDirty
    originalTablesRef.current = savedTables;
    originalZonasRef.current  = savedZones;
    savedTablesRef.current = JSON.stringify(tables);
    savedZonasRef.current  = JSON.stringify(savedZones);
    toast.success('Cambios guardados', {
      description: `${tables.length} mesas · ${zonas.filter(z => z.active).length} zonas activas`,
    });
  };

  // ── Grid background ───────────────────────────────────────────────────────────
  const gridStep = GRID * scale;
  const bpx = ((panX % gridStep) + gridStep) % gridStep;
  const bpy = ((panY % gridStep) + gridStep) % gridStep;

  // ── Type label helper ─────────────────────────────────────────────────────────
  const typeLabel = (t: CTable) =>
    t.category === 'Barra' ? 'Barra' : `Mesa · ${t.shape === 'Redonda' ? 'Red.' : 'Rect.'}`;

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 w-full h-full bg-white overflow-hidden">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-gray-100 h-16 flex items-center px-5 gap-4 shrink-0 shadow-sm z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
        >
          <ArrowLeft size={15} /> Volver a Mesas
        </button>
        <div className="h-5 w-px bg-gray-200" />
        <span className="text-sm font-black text-gray-900 tracking-tight">Gestionar mesas</span>
        <div className="ml-auto">
          <button
            onClick={save}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20"
          >
            <Save size={14} /> Guardar cambios
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── SIDEBAR NAV ── */}
        <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col pt-5 pb-6 px-2 gap-0.5 overflow-y-auto">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Secciones</p>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left w-full',
                section === id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800',
              )}
            >
              <Icon size={14} className={section === id ? 'text-blue-600' : 'text-gray-400'} />
              {label}
            </button>
          ))}
        </aside>

        {/* ── MAIN CONTENT ── */}
        {section === 'mapa' ? (

          /* ── MAPA: canvas + right panel ── */
          <div className="flex flex-1 min-h-0 min-w-0">

            {/* Canvas column */}
            <div className="flex flex-col flex-1 min-h-0 min-w-0">

              {/* Toolbar */}
              <div className="bg-white border-b border-gray-100 px-4 h-12 flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 mr-2">
                  <MapPin size={12} className="text-gray-400 shrink-0" />
                  {zonas.filter(z => z.active).map(z => (
                    <button
                      key={z.id}
                      onClick={() => { setZone(z.name); setSelId(null); }}
                      className={cn(
                        'px-3 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap',
                        zone === z.name ? 'bg-blue-900 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                      )}
                    >
                      {z.name}
                    </button>
                  ))}
                </div>

                <div className="flex-1" />

                <button
                  onClick={() => setSnap(s => !s)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap',
                    snap ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                  )}
                >
                  <Move size={11} /> Snap{snap ? ' ON' : ' OFF'}
                </button>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                  <button onClick={zoomOut} className="px-2 py-1.5 hover:bg-gray-200 transition-all text-gray-600"><ZoomOut size={13} /></button>
                  <button onClick={resetV} className="px-2.5 py-1.5 text-[11px] font-black text-gray-700 hover:bg-gray-200 transition-all min-w-[46px] text-center">
                    {Math.round(scale * 100)}%
                  </button>
                  <button onClick={zoomIn} className="px-2 py-1.5 hover:bg-gray-200 transition-all text-gray-600"><ZoomIn size={13} /></button>
                </div>

                <button onClick={fitView} title="Ajustar vista" className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                  <Maximize2 size={13} />
                </button>
                <button onClick={resetV} title="Restablecer zoom" className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                  <RotateCcw size={13} />
                </button>
              </div>

              {/* Canvas */}
              <div
                ref={canvasRef}
                className="flex-1 relative overflow-hidden"
                onMouseDown={onBgDown}
                style={{
                  backgroundImage: 'radial-gradient(circle, #c5c9d4 1px, transparent 1px)',
                  backgroundSize:     `${gridStep}px ${gridStep}px`,
                  backgroundPosition: `${bpx}px ${bpy}px`,
                  backgroundColor:    '#F3F4F7',
                  cursor: 'default',
                }}
              >
                {/* World transform */}
                <div
                  style={{
                    position:'absolute', top:0, left:0,
                    transformOrigin:'0 0',
                    transform:`translate(${panX}px,${panY}px) scale(${scale})`,
                  }}
                >
                  {zoneTables.map(t => (
                    <TableEl key={t.id} t={t} selected={t.id === selId} onDown={onTableDown} />
                  ))}
                </div>

                {/* Empty state */}
                {zoneTables.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto mb-3">
                        <Plus size={22} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-bold text-gray-400">Zona vacía</p>
                      <p className="text-xs text-gray-300 mt-0.5">Crea mesas desde el panel derecho.</p>
                    </div>
                  </div>
                )}

                {/* Info badge */}
                <div className="absolute bottom-3 left-3 bg-black/20 text-white text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-sm pointer-events-none">
                  {zone} · {zoneTables.length} mesa{zoneTables.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="w-[340px] shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-y-auto">
              {selTable ? (

                /* ── PROPERTIES ── */
                <div className="flex flex-col h-full">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Propiedades</p>
                    <button onClick={() => setSelId(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                      <X size={13} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 p-5 overflow-y-auto flex-1">

                    {/* Name */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Nombre</label>
                      <input
                        value={selTable.name}
                        onChange={e => upd('name', e.target.value)}
                        className="w-full px-3 py-2 text-sm font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    {/* Zona */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Zona</label>
                      <select
                        value={selTable.zone}
                        onChange={e => upd('zone', e.target.value)}
                        className="w-full px-3 py-2 text-sm font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white text-gray-700 transition-all"
                      >
                        {zonas.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                      </select>
                      {selTable.zone !== zone && (
                        <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                          <TriangleAlert size={9} /> La mesa se moverá a ese canvas.
                        </p>
                      )}
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Categoría</label>
                      <div className="flex gap-2">
                        {(['Mesa', 'Barra'] as Category[]).map(cat => (
                          <button
                            key={cat}
                            onClick={() => upd('category', cat)}
                            className={cn(
                              'flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all',
                              selTable.category === cat
                                ? 'bg-blue-50 border-blue-400 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300',
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Forma (solo si Mesa) */}
                    {selTable.category === 'Mesa' && (
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Forma</label>
                        <div className="flex gap-2">
                          {(['Rectangular', 'Redonda'] as Shape[]).map(sh => (
                            <button
                              key={sh}
                              onClick={() => upd('shape', sh)}
                              className={cn(
                                'flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5',
                                selTable.shape === sh
                                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300',
                              )}
                            >
                              {sh === 'Redonda'
                                ? <Circle size={11} />
                                : <Square size={11} />}
                              {sh}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Capacidad */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Capacidad</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => upd('capacity', Math.max(1, selTable.capacity - 1))}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all"
                        ><ChevronDown size={14} /></button>
                        <span className="text-sm font-black text-gray-800 w-8 text-center tabular-nums">{selTable.capacity}</span>
                        <button
                          onClick={() => upd('capacity', Math.min(12, selTable.capacity + 1))}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all"
                        ><ChevronUp size={14} /></button>
                        <span className="text-xs text-gray-400">personas</span>
                      </div>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Estado operativo</label>
                      <select
                        value={selTable.status}
                        onChange={e => upd('status', e.target.value)}
                        className={cn(
                          'w-full px-3 py-2 text-sm font-bold border rounded-xl focus:outline-none transition-all',
                          selTable.status === 'Activa'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-red-50 border-red-200 text-red-700',
                        )}
                      >
                        <option value="Activa">Activa</option>
                        <option value="Fuera de servicio">Fuera de servicio</option>
                      </select>
                    </div>

                    {/* Orientación */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                        Orientación
                      </label>

                      {selTable.category === 'Mesa' && selTable.shape === 'Redonda' ? (
                        /* Redonda: no aplica */
                        <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
                          <Info size={11} className="text-gray-400 shrink-0" />
                          <p className="text-[10px] text-gray-400">No aplica a mesa redonda.</p>
                        </div>
                      ) : (
                        /* Rectangular / Barra */
                        <>
                          <div className="flex gap-2">
                            {([
                              { deg: 0,  label: 'Horizontal' },
                              { deg: 90, label: 'Vertical'   },
                            ] as const).map(({ deg, label }) => {
                              const isH   = deg === 0;
                              const active = (selTable.rotationDeg ?? 0) === deg;
                              return (
                                <button
                                  key={deg}
                                  onClick={() => upd('rotationDeg', deg)}
                                  className={cn(
                                    'flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl border-2 text-[11px] font-bold transition-all',
                                    active
                                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                                      : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600',
                                  )}
                                >
                                  {/* Mini shape preview */}
                                  <div className={cn(
                                    'border-2 border-current',
                                    selTable.category === 'Barra'
                                      ? isH ? 'w-8 h-3 rounded-full' : 'w-3 h-8 rounded-full'
                                      : isH ? 'w-8 h-5 rounded' : 'w-5 h-8 rounded',
                                  )} />
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1.5">
                            Cambia la dirección de la mesa en el mapa.
                          </p>
                        </>
                      )}
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-5 pt-3 flex flex-col gap-2 border-t border-gray-100 shrink-0">
                    <button
                      onClick={doDuplicate}
                      className="flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <Copy size={13} /> Duplicar
                    </button>
                    <button
                      onClick={() => setShowDel(true)}
                      className="flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={13} /> Eliminar mesa
                    </button>
                  </div>
                </div>

              ) : (

                /* ── CREATE PANEL ── */
                <div className="flex flex-col gap-5 p-5">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                      Crear en {zone}
                    </p>
                    <div className="flex flex-col gap-2">

                      {/* Mesa Rectangular */}
                      <button
                        onClick={() => createOnCanvas('Mesa', 'Rectangular', 4)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 group transition-all text-left"
                      >
                        <div className="w-9 h-7 rounded bg-white border-2 border-gray-300 group-hover:border-blue-400 shrink-0 flex items-center justify-center transition-all">
                          <div className="w-1.5 h-1.5 rounded-sm bg-gray-300 group-hover:bg-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-700 group-hover:text-blue-700 transition-colors">Mesa Rectangular</p>
                          <p className="text-[10px] text-gray-400">4 pers. por defecto · tamaño auto</p>
                        </div>
                        <Plus size={13} className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                      </button>

                      {/* Mesa Redonda */}
                      <button
                        onClick={() => createOnCanvas('Mesa', 'Redonda', 4)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-sky-300 hover:bg-sky-50 group transition-all text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-sky-50 border-2 border-sky-200 group-hover:border-sky-400 shrink-0 transition-all" />
                        <div>
                          <p className="text-xs font-bold text-gray-700 group-hover:text-sky-700 transition-colors">Mesa Redonda</p>
                          <p className="text-[10px] text-gray-400">4 pers. por defecto · tamaño auto</p>
                        </div>
                        <Plus size={13} className="ml-auto text-gray-300 group-hover:text-sky-500 transition-colors shrink-0" />
                      </button>

                      {/* Barra */}
                      <button
                        onClick={() => createOnCanvas('Barra', null, 3)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-300 hover:bg-amber-50 group transition-all text-left"
                      >
                        <div className="w-11 h-4 rounded-full bg-amber-50 border-2 border-amber-200 group-hover:border-amber-400 shrink-0 transition-all" />
                        <div>
                          <p className="text-xs font-bold text-gray-700 group-hover:text-amber-700 transition-colors">Barra</p>
                          <p className="text-[10px] text-gray-400">3 pers. por defecto · tamaño auto</p>
                        </div>
                        <Plus size={13} className="ml-auto text-gray-300 group-hover:text-amber-500 transition-colors shrink-0" />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Controles</p>
                    <ul className="space-y-2.5">
                      {[
                        ['Clic en mesa',    'Seleccionar'],
                        ['Arrastrar mesa',  'Reposicionar'],
                        ['Arrastrar fondo', 'Desplazar vista'],
                        ['Scroll / pinch',  'Zoom in/out'],
                        ['Capacidad ±',     'Redimensiona auto'],
                      ].map(([k, v]) => (
                        <li key={k} className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">{k}</span>
                          <span className="text-[10px] text-gray-500 text-right">{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-blue-600">
                      <span className="block font-black">{zone} · {tables.filter(t => t.zone === zone).length} mesas</span>
                      {snap && <span className="text-blue-400">Snap a grilla activo.</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        ) : (
          /* ── SECCIONES TEXTO ── */
          <div className="flex-1 overflow-y-auto px-8 py-8 min-h-0">

            {/* ZONAS */}
            {section === 'zonas' && (
              <div className="max-w-2xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-base font-black text-gray-900">Zonas</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Organiza el salón en áreas diferenciadas.</p>
                  </div>
                  <button
                    onClick={() => setZonas(p => [...p, { id:`z-${Date.now()}`, name:'Nueva zona', active:true }])}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100 shrink-0"
                  >
                    <Plus size={13} /> Agregar zona
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {zonas.map(z => {
                    const cnt = tables.filter(t => t.zone === z.name).length;
                    return (
                      <div key={z.id} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <MapPin size={14} className="text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            value={z.name}
                            onChange={e => setZonas(p => p.map(x => x.id===z.id ? {...x,name:e.target.value}:x))}
                            className="w-full text-sm font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none py-0.5 transition-all"
                          />
                          <p className="text-xs text-gray-400 mt-0.5">{cnt} mesa{cnt!==1?'s':''}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-gray-400">Activa</span>
                          <Switch on={z.active} toggle={() => setZonas(p => p.map(x => x.id===z.id?{...x,active:!x.active}:x))} />
                        </div>
                        {cnt > 0 ? (
                          <div className="relative group">
                            <button disabled className="p-2 rounded-lg text-gray-200 cursor-not-allowed"><Trash2 size={14} /></button>
                            <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-20">
                              Primero elimina las mesas
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setZonas(p=>p.filter(x=>x.id!==z.id))} className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={14}/></button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MESAS */}
            {section === 'mesas' && (
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-base font-black text-gray-900">Mesas</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{tables.length} mesas configuradas.</p>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100 shrink-0"
                  >
                    <Plus size={13} /> Crear mesa
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Buscar…"
                      className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all w-44" />
                  </div>
                  <select value={zoneF} onChange={e=>setZoneF(e.target.value)}
                    className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-400 font-bold text-gray-700">
                    <option value="Todas">Todas las zonas</option>
                    {zonas.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                  </select>
                  {(srch || zoneF !== 'Todas') && (
                    <button onClick={()=>{setSrch('');setZoneF('Todas');}} className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1">
                      <X size={11} /> Limpiar
                    </button>
                  )}
                  <span className="ml-auto text-xs text-gray-400 font-bold">{filtered.length} de {tables.length}</span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                          {['Nombre','Zona','Tipo','Capacidad','Estado',''].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-xs">Sin resultados.</td></tr>
                        ) : filtered.map((m, i) => (
                          <tr key={m.id} className={cn('hover:bg-gray-50/60 transition-colors', i<filtered.length-1&&'border-b border-gray-50')}>
                            <td className="px-4 py-3">
                              <input value={m.name} onChange={e=>setTables(p=>p.map(t=>t.id===m.id?{...t,name:e.target.value}:t))}
                                className="w-20 text-xs font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none py-0.5 transition-all" />
                            </td>
                            <td className="px-4 py-3">
                              <select value={m.zone} onChange={e=>setTables(p=>p.map(t=>t.id===m.id?{...t,zone:e.target.value}:t))}
                                className="text-xs font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer">
                                {zonas.map(z=><option key={z.id} value={z.name}>{z.name}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                'text-[10px] font-bold px-2 py-0.5 rounded-lg border',
                                m.category==='Barra'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : m.shape==='Redonda'
                                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                                    : 'bg-gray-50 text-gray-700 border-gray-200',
                              )}>
                                {typeLabel(m)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <button onClick={()=>setTables(p=>p.map(t=>t.id===m.id?{...t,capacity:Math.max(1,t.capacity-1),...getTableDims(t.category,t.shape,Math.max(1,t.capacity-1))}:t))}
                                  className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all"><ChevronDown size={11}/></button>
                                <span className="w-5 text-center text-xs font-black text-gray-800 tabular-nums">{m.capacity}</span>
                                <button onClick={()=>setTables(p=>p.map(t=>t.id===m.id?{...t,capacity:Math.min(12,t.capacity+1),...getTableDims(t.category,t.shape,Math.min(12,t.capacity+1))}:t))}
                                  className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all"><ChevronUp size={11}/></button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <select value={m.status} onChange={e=>setTables(p=>p.map(t=>t.id===m.id?{...t,status:e.target.value as TableStatus}:t))}
                                className={cn('text-[10px] font-black rounded-lg px-2 py-1 border focus:outline-none cursor-pointer',
                                  m.status==='Activa'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-red-50 text-red-600 border-red-200')}>
                                <option value="Activa">Activa</option>
                                <option value="Fuera de servicio">Fuera de servicio</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button onClick={()=>{setSection('mapa');setZone(m.zone);setSelId(m.id);}}
                                  title="Ver en mapa" className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all"><Maximize2 size={12}/></button>
                                <button onClick={()=>setTables(p=>p.filter(t=>t.id!==m.id))} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={12}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TIPOS */}
            {section === 'tipos' && (
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-base font-black text-gray-900">Tipos de mesa</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Activar o desactivar los tipos disponibles para configurar.</p>
                </div>
                <div className="flex flex-col gap-3">
                  {tipos.map(tipo => {
                    const count = tables.filter(t =>
                      t.category === tipo.category && t.shape === tipo.shape
                    ).length;
                    return (
                      <div key={tipo.id} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-sm">
                        {/* Shape preview */}
                        <div className={cn(
                          'shrink-0 border-2 flex items-center justify-center',
                          tipo.category === 'Barra'
                            ? 'w-14 h-6 rounded-full bg-amber-50 border-amber-300'
                            : tipo.shape === 'Redonda'
                              ? 'w-9 h-9 rounded-full bg-sky-50 border-sky-300'
                              : 'w-10 h-9 rounded-lg bg-white border-gray-300',
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800">{tipo.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {count} mesa{count!==1?'s':''} de este tipo configuradas
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-gray-400">Activo</span>
                          <Switch on={tipo.active} toggle={() => setTipos(p => p.map(t => t.id===tipo.id?{...t,active:!t.active}:t))} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-2">
                  <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">Los tipos desactivados no se ofrecen al crear nuevas mesas. Las mesas existentes no se ven afectadas.</p>
                </div>
              </div>
            )}

            {/* CONFIG */}
            {section === 'config' && (
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-base font-black text-gray-900">Configuración general</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Ajustes globales del módulo de mesas.</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-700">Límite máximo de mesas</p>
                        <p className="text-xs text-gray-400 mt-0.5">Capacidad de referencia del sistema.</p>
                      </div>
                      <span className="text-sm font-black text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg tabular-nums">400 – 500</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-700">Total de mesas configuradas</p>
                        <p className="text-xs text-gray-400 mt-0.5">Suma de todas las zonas activas.</p>
                      </div>
                      <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg tabular-nums">{tables.length}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
                    <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Este módulo es de configuración. La operación diaria se realiza en{' '}
                      <span className="font-bold">Mesas</span> y <span className="font-bold">Mostrador</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL: Eliminar ── */}
      {showDel && selTable && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs mx-4">
            <h3 className="text-base font-black text-gray-900 mb-2">¿Eliminar mesa?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Se eliminará <span className="font-bold">"{selTable.name}"</span> del mapa de configuración. No afecta órdenes en curso.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDel(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={doDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Crear mesa ── */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-gray-900">Crear mesa</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={16} /></button>
            </div>

            <div className="flex flex-col gap-4">

              {/* Nombre */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5">Nombre / ID</label>
                <input
                  value={newM.name} onChange={e => setNewM(p => ({...p, name:e.target.value}))}
                  placeholder="Ej. A5, T3, BAR2…" autoFocus
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Zona */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5">Zona</label>
                <select value={newM.zone} onChange={e => setNewM(p => ({...p, zone:e.target.value}))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 font-bold text-gray-700 bg-white">
                  {zonas.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-2">Categoría</label>
                <div className="flex gap-2">
                  {(['Mesa', 'Barra'] as Category[]).map(cat => (
                    <button key={cat} onClick={() => setNewM(p => ({...p, category:cat}))}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all',
                        newM.category === cat ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300',
                      )}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forma (solo Mesa) */}
              {newM.category === 'Mesa' && (
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-2">Forma</label>
                  <div className="flex gap-2">
                    {(['Rectangular', 'Redonda'] as Shape[]).map(sh => (
                      <button key={sh} onClick={() => setNewM(p => ({...p, shape:sh}))}
                        className={cn(
                          'flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5',
                          newM.shape === sh ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300',
                        )}>
                        {sh === 'Redonda' ? <Circle size={11}/> : <Square size={11}/>}
                        {sh}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacidad */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-2">Capacidad</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setNewM(p => ({...p, capacity:Math.max(1,p.capacity-1)}))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all"><ChevronDown size={16}/></button>
                  <span className="text-xl font-black text-gray-800 w-8 text-center tabular-nums">{newM.capacity}</span>
                  <button onClick={() => setNewM(p => ({...p, capacity:Math.min(12,p.capacity+1)}))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all"><ChevronUp size={16}/></button>
                  <span className="text-xs text-gray-400">personas</span>
                </div>
                {/* Size preview */}
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Tamaño: <span className="font-bold text-gray-600">{getSizeLabel(newM.category, newM.category==='Barra'?null:newM.shape, newM.capacity)}</span>
                  {' '}· {(() => { const {w,h}=getTableDims(newM.category,newM.category==='Barra'?null:newM.shape,newM.capacity); return `${w}×${h}px`; })()}
                </p>
              </div>

              {/* Estado */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5">Estado operativo</label>
                <select value={newM.status} onChange={e => setNewM(p => ({...p, status:e.target.value as TableStatus}))}
                  className={cn(
                    'w-full px-3 py-2.5 text-sm font-bold border rounded-xl focus:outline-none transition-all',
                    newM.status==='Activa'?'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-red-50 border-red-200 text-red-700',
                  )}>
                  <option value="Activa">Activa</option>
                  <option value="Fuera de servicio">Fuera de servicio</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={createFromModal} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-sm">
                Crear y ubicar en mapa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: cambios sin guardar ── */}
      {showUnsavedModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowUnsavedModal(false); }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 relative">
            {/* Close X */}
            <button
              onClick={() => setShowUnsavedModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              <X size={18} />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-gray-900 pr-8">¿Salir sin guardar?</h2>

            {/* Description */}
            <p className="mt-2 text-base" style={{ color: '#606060' }}>
              Tienes cambios sin guardar que se perderán si sales ahora.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleDiscardAndLeave}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all"
              >
                Descartar cambios
              </button>
              <button
                onClick={handleSaveAndLeave}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#121E6C' }}
              >
                Guardar y salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
