import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useMesasStore, type MesaConfig } from '../store/mesasStore';
import { GestionarMesasView } from './GestionarMesasView';
import {
  Users, Clock, Plus, Send, X, Utensils,
  Settings, ChevronLeft, ChevronRight,
  Trash2, MapPin, Receipt, ArrowLeftRight,
  CheckCircle2, Minus, RotateCcw, Pencil, AlertTriangle,
  MessageSquare, Timer, Printer, ZoomIn, ZoomOut, Maximize2, Info,
  LayoutGrid, Map, RefreshCw, CheckCircle, DollarSign,
  ChefHat, Check, Save,
} from 'lucide-react';
import { MesasGridView } from './MesasGridView';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MesaProductSelector } from './MesaProductSelector';
import { CheckoutDrawer } from './CheckoutDrawer';
import { KitchenTicketPreviewModal, type TicketItem } from './KitchenTicketPreviewModal';
import { CAT_DEFS, ALL_CATALOG_PRODUCTS } from '../data/productCatalog';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type TableStatus = 'DISPONIBLE' | 'OCUPADA' | 'CUENTA_SOLICITADA' | 'INHABILITADA';
export type TableZone  = string; // dinámico — derivado del store de configuración

export interface TableItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  isSent?: boolean;
  sentQuantity?: number;  // cantidad enviada en el último envío confirmado
  sentNote?: string;       // nota enviada en la comanda anterior
  description?: string;
  catId?: string;           // id de categoría del producto
  discount?: number;        // % de descuento por ítem (0-20)
}

// ─── Pending changes (modificaciones post-primera-comanda) ───────────────────

export type PendingChangeType = 'ELIMINAR' | 'CANTIDAD' | 'NOTA';

export interface PendingChange {
  type:        PendingChangeType;
  productId:   number;
  name:        string;
  prevQty:     number;
  newQty:      number;
  prevNote:    string;
  newNote:     string;
}

export interface MesaTable {
  id: string;
  name: string;
  zone: TableZone;
  status: TableStatus;
  capacity: number;
  shape: 'round' | 'rect' | 'barra';
  x: number;            // posición en el canvas
  y: number;
  rotationDeg?: number; // 0 | 90
  items: TableItem[];
  openedAtTimestamp?: number;    // Date.now() al abrir la mesa — fuente de verdad del timer
  firstComandaSentAt?: number;   // Date.now() del primer envío de comanda
  guests?: number;
  comandaSent?: boolean;
  hasPendingChanges?: boolean;
  savedPendingResend?: boolean;     // guardado en POS, aún no reenviado a cocina
  pendingChanges?: PendingChange[];  // modificaciones post-primera-comanda
  frozenElapsedMs?: number;      // ms transcurridos al momento de finalizar (congelado)
}

// ─── Timer helpers ────────────────────────────────────────────────────────────

/** Devuelve el tiempo transcurrido formateado: "5 min", "1h 12min", etc. */
function formatElapsed(openedAtTimestamp: number, frozenElapsedMs?: number): string {
  const ms = frozenElapsedMs !== undefined
    ? frozenElapsedMs
    : Math.max(0, Date.now() - openedAtTimestamp);
  const totalMin = Math.floor(ms / 60_000);
  if (totalMin < 1)  return '< 1 min';
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/** Devuelve la hora de apertura formateada: "2:15 PM" */
function formatOpenTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

// ─── Formato de líneas para ticket de ajuste ─────────────────────────────────

function formatAdjustmentLines(items: TableItem[], pendingChanges: PendingChange[]): string[] {
  const lines: string[] = [];
  // Nuevos ítems (nunca enviados)
  for (const item of items.filter(i => !i.isSent && i.quantity > 0)) {
    lines.push(`${String(item.quantity).padEnd(3)} ${item.name}`);
    if (item.note?.trim()) lines.push(`    -> ${item.note}`);
  }
  // Modificaciones a ítems ya enviados
  for (const c of pendingChanges) {
    if (c.type === 'ELIMINAR') {
      lines.push(`CANCELAR: ${c.prevQty} ${c.name}`);
    } else if (c.type === 'CANTIDAD') {
      const sign = c.newQty > c.prevQty ? '+' : '-';
      lines.push(`${sign} ${c.newQty} ${c.name} (era ${c.prevQty})`);
    } else if (c.type === 'NOTA') {
      lines.push(`NOTA ${c.name}: ${c.newNote}`);
    }
  }
  return lines;
}

// ─── Static Config ────────────────────────────────────────────────────────────
// (ZONES ya no es hardcodeado — se lee de zonesConfig del store)

const NOTE_CHIPS = [
  'Sin cebolla', 'Sin gluten', 'Término medio', 'Bien cocido',
  'Extra salsa', 'Para llevar', 'Sin sal', 'Poco picante',
];

const STATUS_CFG: Record<TableStatus, {
  label: string;
  badgeClass: string;
  dotColor: string;
}> = {
  DISPONIBLE: {
    label: 'Disponible',
    badgeClass: 'status-badge status-badge--available',
    dotColor: 'var(--blue-60)',
  },
  OCUPADA: {
    label: 'Ocupada',
    badgeClass: 'status-badge status-badge--occupied',
    dotColor: 'var(--coral-100)',
  },
  CUENTA_SOLICITADA: {
    label: 'Cuenta solicitada',
    badgeClass: 'status-badge status-badge--billing',
    dotColor: 'var(--feedback-warning-100)',
  },
  INHABILITADA: {
    label: 'Inhabilitada',
    badgeClass: 'status-badge status-badge--disabled',
    dotColor: 'var(--black-40)',
  },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Layout realista tipo restaurante: 35 Salón + 8 Terraza + 2 Barra.
// Timestamps relativos a ahora para contadores realistas en el prototipo.

function buildMockTables(): MesaTable[] {
  const ago = (min: number) => Date.now() - min * 60_000;

  /** Crea un TableItem con datos reales del catálogo */
  const it = (tableId: string, suffix: string, prodId: number, qty: number, sent = true): TableItem => {
    const prod = ALL_CATALOG_PRODUCTS.find(pr => pr.id === prodId)!;
    return {
      id:           `${tableId}-${suffix}`,
      productId:    prod.id,
      name:         prod.name,
      price:        prod.price,
      quantity:     qty,
      catId:        prod.catId,
      isSent:       sent,
      sentQuantity: sent ? qty : undefined,
    };
  };

  return [
    // ── SALÓN: ESPERA ──────────────────────────────────────────────────────────
    { id:'s01', name:'S01', zone:'Salón', status:'INHABILITADA', capacity:2, shape:'round', x:60,  y:60,  rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s02', name:'S02', zone:'Salón', status:'DISPONIBLE', capacity:2, shape:'round', x:200, y:60,  rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s03', name:'S03', zone:'Salón', status:'INHABILITADA', capacity:4, shape:'rect', x:60,  y:225, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s04', name:'S04', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:235, y:225, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    // ── SALÓN: CENTRO F1 ───────────────────────────────────────────────────────
    { id:'s05', name:'S05', zone:'Salón', status:'OCUPADA', capacity:4, shape:'rect', x:400, y:60, rotationDeg:0,
      items:[ it('s05','a',103,2), it('s05','b',131,2), it('s05','c',161,3) ],                  // Ceviche + Solomillo Wellington + Limonada
      openedAtTimestamp:ago(45), guests:3, comandaSent:true, hasPendingChanges:false },
    { id:'s06', name:'S06', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:555, y:60, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s07', name:'S07', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:710, y:60, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s08', name:'S08', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:865, y:60, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    // ── SALÓN: CENTRO F2 ───────────────────────────────────────────────────────
    { id:'s09', name:'S09', zone:'Salón', status:'OCUPADA', capacity:4, shape:'rect', x:400, y:215, rotationDeg:0,
      items:[ it('s09','a',102,2,false), it('s09','b',136,3,false) ],                            // Tartar de Atún + Short Rib (no enviados)
      openedAtTimestamp:ago(12), guests:4, comandaSent:false, hasPendingChanges:false },
    { id:'s10', name:'S10', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:555, y:215, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s11', name:'S11', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:710, y:215, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s12', name:'S12', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:865, y:215, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    // ── SALÓN: CENTRO F3 ───────────────────────────────────────────────────────
    { id:'s13', name:'S13', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:400, y:370, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s14', name:'S14', zone:'Salón', status:'OCUPADA', capacity:4, shape:'rect', x:555, y:370, rotationDeg:0,
      items:[ it('s14','a',158,2), it('s14','b',151,1), it('s14','c',161,3) ],                  // Tiramisú de Autor + Esfera de Chocolate + Limonada
      openedAtTimestamp:ago(38), guests:3, comandaSent:true, hasPendingChanges:false },
    { id:'s15', name:'S15', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:710, y:370, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s16', name:'S16', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:865, y:370, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    // ── SALÓN: CENTRO F4 ───────────────────────────────────────────────────────
    { id:'s17', name:'S17', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:400, y:525, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s18', name:'S18', zone:'Salón', status:'OCUPADA', capacity:4, shape:'rect', x:555, y:525, rotationDeg:0,
      items:[ it('s18','a',146,2), it('s18','b',103,1) ],                                        // Atún Rojo en Costra + Ceviche de Corvina
      openedAtTimestamp:ago(31), guests:2, comandaSent:true, hasPendingChanges:false },
    { id:'s19', name:'S19', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:710, y:525, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s22', name:'S22', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:865, y:525, rotationDeg:0,
      items:[], comandaSent:false, hasPendingChanges:false },
    // ── SALÓN: CENTRO Redondas ─────────────────────────────────────────────────
    { id:'s20', name:'S20', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'round', x:400, y:680, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s21', name:'S21', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'round', x:555, y:680, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    // ── SALÓN: VENTANA ─────────────────────────────────────────────────────────
    { id:'s23', name:'S23', zone:'Salón', status:'OCUPADA', capacity:4, shape:'rect', x:1015, y:60, rotationDeg:0,
      items:[ it('s23','a',138,2), it('s23','b',131,1) ],
      openedAtTimestamp:ago(30), guests:3, comandaSent:true, hasPendingChanges:false },
    { id:'s24', name:'S24', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:1015, y:215, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s25', name:'S25', zone:'Salón', status:'DISPONIBLE',        capacity:4, shape:'rect', x:1015, y:370, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s26', name:'S26', zone:'Salón', status:'DISPONIBLE', capacity:6, shape:'rect', x:1015, y:525, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s27', name:'S27', zone:'Salón', status:'DISPONIBLE', capacity:4, shape:'rect', x:1190, y:60,  rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s28', name:'S28', zone:'Salón', status:'DISPONIBLE', capacity:6, shape:'rect', x:1190, y:215, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s29', name:'S29', zone:'Salón', status:'DISPONIBLE',        capacity:4, shape:'rect', x:1190, y:370, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s30', name:'S30', zone:'Salón', status:'DISPONIBLE',         capacity:4, shape:'rect', x:1190, y:525, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    // ── SALÓN: FAMILIAR ────────────────────────────────────────────────────────
    { id:'s31', name:'S31', zone:'Salón', status:'DISPONIBLE',        capacity:6,  shape:'rect', x:60,  y:810, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s32', name:'S32', zone:'Salón', status:'DISPONIBLE', capacity:6,  shape:'rect', x:235, y:810, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s33', name:'S33', zone:'Salón', status:'DISPONIBLE',        capacity:6,  shape:'rect', x:410, y:810, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s34', name:'S34', zone:'Salón', status:'DISPONIBLE',         capacity:6,  shape:'rect', x:585, y:810, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'s35', name:'S35', zone:'Salón', status:'OCUPADA',           capacity:12, shape:'rect', x:775, y:800, rotationDeg:0,
      items:[ it('s35','a',132,4), it('s35','b',111,5), it('s35','c',124,3), it('s35','d',152,4) ], // Costillar + Vieiras + Risotto di Mare + Soufflé
      openedAtTimestamp:ago(88), guests:10, comandaSent:true, hasPendingChanges:false },
    // ── TERRAZA ────────────────────────────────────────────────────────────────
    { id:'t01', name:'T01', zone:'Terraza', status:'DISPONIBLE',        capacity:4, shape:'round', x:80,  y:80,  rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'t02', name:'T02', zone:'Terraza', status:'OCUPADA',           capacity:4, shape:'round', x:270, y:80,  rotationDeg:0,
      items:[ it('t02','a',166,4), it('t02','b',104,2) ],                                        // Néctar de Pera + Burrata Ahumada
      openedAtTimestamp:ago(15), guests:4, comandaSent:true, hasPendingChanges:false },
    { id:'t03', name:'T03', zone:'Terraza', status:'DISPONIBLE',        capacity:4, shape:'round', x:460, y:80,  rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'t04', name:'T04', zone:'Terraza', status:'OCUPADA',           capacity:4, shape:'round', x:650, y:80,  rotationDeg:0,
      items:[ it('t04','a',103,2), it('t04','b',162,3) ],                                        // Ceviche de Corvina + Agua de Piedra
      openedAtTimestamp:ago(44), guests:3, comandaSent:true, hasPendingChanges:false },
    { id:'t05', name:'T05', zone:'Terraza', status:'DISPONIBLE',        capacity:4, shape:'round', x:80,  y:290, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'t06', name:'T06', zone:'Terraza', status:'DISPONIBLE', capacity:4, shape:'round', x:270, y:290, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'t07', name:'T07', zone:'Terraza', status:'INHABILITADA',      capacity:4, shape:'round', x:460, y:290, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    { id:'t08', name:'T08', zone:'Terraza', status:'DISPONIBLE', capacity:4, shape:'round', x:650, y:290, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
    // ── BARRA ──────────────────────────────────────────────────────────────────
    { id:'bar01', name:'B01', zone:'Barra', status:'OCUPADA',    capacity:12, shape:'barra', x:80,  y:60,  rotationDeg:90,
      items:[ it('bar01','a',165,5), it('bar01','b',164,4), it('bar01','c',158,2) ],             // Ginger Beer + Mocktail + Tiramisú de Autor
      openedAtTimestamp:ago(35), guests:7, comandaSent:true, hasPendingChanges:false },
    { id:'bar02', name:'B02', zone:'Barra', status:'DISPONIBLE', capacity:5,  shape:'barra', x:260, y:240, rotationDeg:0, items:[], comandaSent:false, hasPendingChanges:false },
  ];
}

const INITIAL_TABLES  = buildMockTables();
const TABLES_LS_KEY   = 'bold-pos-tables-v2';

// ─── Store ↔ Operación: helpers de conversión ─────────────────────────────────

/** Traduce la forma canónica del store ('Rectangular'/'Redonda'/null) → shape operativo ('rect'/'round'/'barra') */
function configToOperShape(mc: MesaConfig): MesaTable['shape'] {
  if (mc.category === 'Barra') return 'barra';
  return mc.shape === 'Redonda' ? 'round' : 'rect';
}

/**
 * Combina la configuración de layout (store) con el estado operativo existente.
 * - Mesas ya existentes: actualiza posición/forma/capacidad, preserva status/items/timers.
 * - Mesas nuevas (añadidas en Gestionar): parten como DISPONIBLE, sin items.
 * - Mesas eliminadas en Gestionar: desaparecen del mapa (no incluidas en config).
 */
function syncTablesFromConfig(config: MesaConfig[], prevOp: MesaTable[]): MesaTable[] {
  return config.map(mc => {
    const shape      = configToOperShape(mc);
    const isDisabled = mc.status === 'Fuera de servicio';
    const existing   = prevOp.find(t => t.id === mc.id);
    if (existing) {
      // Actualiza propiedades de layout; preserva estado operativo íntegramente.
      // Si la configuración cambia el estado de habilitación, se refleja aquí:
      //   - Fuera de servicio → INHABILITADA (sin importar el estado actual)
      //   - Activa + era INHABILITADA → vuelve a DISPONIBLE
      let newStatus: TableStatus = existing.status;
      if (isDisabled) {
        newStatus = 'INHABILITADA';
      } else if (existing.status === 'INHABILITADA') {
        newStatus = 'DISPONIBLE';
      }
      return {
        ...existing,
        name:        mc.name,
        zone:        mc.zone as TableZone,
        capacity:    mc.capacity,
        shape,
        x:           mc.x,
        y:           mc.y,
        rotationDeg: mc.rotationDeg,
        status:      newStatus,
      };
    }
    // Mesa nueva creada en Gestionar
    return {
      id:               mc.id,
      name:             mc.name,
      zone:             mc.zone as TableZone,
      status:           isDisabled ? ('INHABILITADA' as TableStatus) : ('DISPONIBLE' as TableStatus),
      capacity:         mc.capacity,
      shape,
      x:                mc.x,
      y:                mc.y,
      rotationDeg:      mc.rotationDeg,
      items:            [],
      comandaSent:      false,
      hasPendingChanges: false,
    };
  });
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────

/** Dimensiones canónicas del shape operativo según forma y capacidad.
 *  Barra: eje largo proporcional a capacidad, eje corto fijo.
 *  Round: diámetro crece por capacidad (S→XXL).
 *  Rect: ancho y alto crecen por capacidad, proporción 3:2 aprox (S→XXL). */
function getTableSize(shape: MesaTable['shape'], capacity: number): { w: number; h: number } {
  if (shape === 'barra') return { w: Math.max(120, 44 + capacity * 22), h: 76 };
  if (shape === 'round') {
    if (capacity <= 2)  return { w: 92,  h: 92  }; // S
    if (capacity <= 4)  return { w: 112, h: 112 }; // M
    if (capacity <= 6)  return { w: 136, h: 136 }; // L
    if (capacity <= 8)  return { w: 160, h: 160 }; // XL
    return               { w: 184, h: 184 };         // XXL ≥9p
  }
  // rect
  if (capacity <= 2)  return { w: 108, h: 86  }; // S
  if (capacity <= 4)  return { w: 126, h: 98  }; // M
  if (capacity <= 6)  return { w: 152, h: 108 }; // L
  if (capacity <= 8)  return { w: 178, h: 120 }; // XL
  return               { w: 208, h: 134 };         // XXL ≥9p
}

// ─── TableChairs: sillas decorativas alrededor de cada mesa ──────────────────

const CHAIR_S  = 7;   // tamaño del punto (px)
const CHAIR_G  = 5;   // gap desde el borde de la mesa
const MAX_CHAIRS_VISIBLE = 8;

function getRectChairDots(w: number, h: number, n: number): { x: number; y: number }[] {
  // Distribución simétrica por lados. Máx 12p: 4+4+2+2=12.
  let top = 0, bot = 0, lft = 0, rgt = 0;
  if      (n <= 2)  { top = 1; bot = 1; }
  else if (n <= 4)  { top = 2; bot = 2; }
  else if (n <= 6)  { top = 3; bot = 3; }
  else if (n <= 8)  { top = 3; bot = 3; lft = 1; rgt = 1; }
  else if (n <= 10) { top = 4; bot = 4; lft = 1; rgt = 1; }
  else              { top = 4; bot = 4; lft = 2; rgt = 2; } // 12p → 4+4+2+2=12 simétrico
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < top; i++) pts.push({ x: (i+1)/(top+1)*w - CHAIR_S/2, y: -(CHAIR_G+CHAIR_S) });
  for (let i = 0; i < bot; i++) pts.push({ x: (i+1)/(bot+1)*w - CHAIR_S/2, y: h + CHAIR_G });
  for (let i = 0; i < lft; i++) pts.push({ x: -(CHAIR_G+CHAIR_S),           y: (i+1)/(lft+1)*h - CHAIR_S/2 });
  for (let i = 0; i < rgt; i++) pts.push({ x: w + CHAIR_G,                  y: (i+1)/(rgt+1)*h - CHAIR_S/2 });
  return pts;
}

function getRoundChairDots(d: number, n: number): { x: number; y: number }[] {
  const cx = d / 2, cy = d / 2, r = d / 2;
  const dist = r + CHAIR_G + CHAIR_S / 2;
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i / n) - Math.PI / 2;
    return { x: cx + dist * Math.cos(a) - CHAIR_S / 2, y: cy + dist * Math.sin(a) - CHAIR_S / 2 };
  });
}

function getBarraChairDots(w: number, h: number, n: number, isVert: boolean): { x: number; y: number }[] {
  // Barras verticales: sillas en el lado izquierdo. Horizontales: arriba.
  return Array.from({ length: n }, (_, i) => isVert
    ? { x: -(CHAIR_G + CHAIR_S), y: (i+1)/(n+1)*h - CHAIR_S/2 }
    : { x: (i+1)/(n+1)*w - CHAIR_S/2, y: -(CHAIR_G + CHAIR_S) },
  );
}

function TableChairs({
  shape, capacity, dispW, dispH, status,
}: {
  shape: MesaTable['shape']; capacity: number;
  dispW: number; dispH: number; status: TableStatus;
}) {
  // Barras usan BarChairs (componente dedicado); aquí solo round y rect.
  const isRound = shape === 'round';

  // Máx 12 puntos visibles. Para capacidades >12 se muestra "+N".
  const MAX_CHAIRS = 12;
  const showN = Math.min(capacity, MAX_CHAIRS);
  const extra = Math.max(0, capacity - MAX_CHAIRS);

  // Round: pasamos showN para que los ángulos sean equidistantes entre los visibles.
  // Rect: pasamos showN para que la distribución por lados sea correcta.
  const dots: { x: number; y: number }[] = isRound
    ? getRoundChairDots(dispW, showN)
    : getRectChairDots(dispW, dispH, showN);

  const visible = dots; // ya generamos exactamente los que queremos mostrar

  // Colores según estado (paleta Bold)
  const fillMap: Record<TableStatus, string> = {
    DISPONIBLE:        '#D2D4E1',
    OCUPADA:           '#ffd0d7',
    CUENTA_SOLICITADA: '#ffe9a0',
    INHABILITADA:      '#E0E0E0',
  };
  const strokeMap: Record<TableStatus, string> = {
    DISPONIBLE:        '#BABDD3',
    OCUPADA:           'var(--coral-100)',
    CUENTA_SOLICITADA: '#FFC217',
    INHABILITADA:      '#C0C0C0',
  };
  const fill   = fillMap[status];
  const stroke = strokeMap[status];

  const PAD = CHAIR_S + CHAIR_G + 4;
  const svgW = dispW + PAD * 2;
  const svgH = dispH + PAD * 2;

  return (
    <svg
      style={{
        position: 'absolute', left: -PAD, top: -PAD,
        width: svgW, height: svgH,
        overflow: 'visible', pointerEvents: 'none', zIndex: 0,
      }}
    >
      {visible.map((pt, i) => (
        <rect
          key={i}
          x={pt.x + PAD} y={pt.y + PAD}
          width={CHAIR_S} height={CHAIR_S}
          rx={isRound ? CHAIR_S / 2 : 2}
          fill={fill} stroke={stroke} strokeWidth={0.8}
        />
      ))}
      {extra > 0 && visible.length > 0 && (() => {
        const last = visible[visible.length - 1];
        return (
          <text
            x={last.x + PAD + CHAIR_S + 2}
            y={last.y + PAD + CHAIR_S / 2 + 1}
            fontSize={7} fill="#969696" fontWeight={700}
            dominantBaseline="middle"
          >
            +{extra}
          </text>
        );
      })()}
    </svg>
  );
}

// ─── BarChairs: puntos de atención en UN solo lado ───────────────────────────
// Para barras: hasta 12 puntos en el lado largo (izquierdo si vertical, superior si horizontal).
// Siempre uniformemente distribuidos en TODA la longitud (sin truncado artificial).

function BarChairs({
  dispW, dispH, capacity, isVert, status,
}: {
  dispW: number; dispH: number; capacity: number;
  isVert: boolean; status: TableStatus;
}) {
  const MAX_BAR = 12;
  const showN = Math.min(capacity, MAX_BAR);
  const extra = Math.max(0, capacity - MAX_BAR);

  const dots = Array.from({ length: showN }, (_, i) => {
    const t = (i + 1) / (showN + 1);
    return isVert
      ? { x: -(CHAIR_G + CHAIR_S), y: t * dispH - CHAIR_S / 2 }   // lado izquierdo
      : { x: t * dispW - CHAIR_S / 2,  y: -(CHAIR_G + CHAIR_S) }; // lado superior
  });

  const fillMap: Record<TableStatus, string> = {
    DISPONIBLE: '#D2D4E1', OCUPADA: '#ffd0d7',
    CUENTA_SOLICITADA: '#ffe9a0', INHABILITADA: '#E0E0E0',
  };
  const strokeMap: Record<TableStatus, string> = {
    DISPONIBLE: '#BABDD3', OCUPADA: 'var(--coral-100)',
    CUENTA_SOLICITADA: '#FFC217', INHABILITADA: '#C0C0C0',
  };
  const fill   = fillMap[status];
  const stroke = strokeMap[status];
  const PAD    = CHAIR_S + CHAIR_G + 4;

  return (
    <svg
      style={{
        position: 'absolute', left: -PAD, top: -PAD,
        width: dispW + PAD * 2, height: dispH + PAD * 2,
        overflow: 'visible', pointerEvents: 'none', zIndex: 0,
      }}
    >
      {dots.map((pt, i) => (
        <rect
          key={i}
          x={pt.x + PAD} y={pt.y + PAD}
          width={CHAIR_S} height={CHAIR_S}
          rx={2}
          fill={fill} stroke={stroke} strokeWidth={0.8}
        />
      ))}
      {extra > 0 && dots.length > 0 && (() => {
        const last = dots[dots.length - 1];
        return (
          <text
            x={last.x + PAD + CHAIR_S + 2}
            y={last.y + PAD + CHAIR_S / 2 + 1}
            fontSize={7} fill="#969696" fontWeight={700}
            dominantBaseline="middle"
          >
            +{extra}
          </text>
        );
      })()}
    </svg>
  );
}

// ─── Acciones rápidas por estado ─────────────────────────────────────────────

interface QuickAction { key: string; label: string; variant: 'primary' | 'secondary' }
const TABLE_QUICK_ACTIONS: Record<TableStatus, QuickAction[]> = {
  DISPONIBLE:        [],   // Sin botones — click directo abre la mesa
  OCUPADA:           [{ key: 'agregar', label: 'Agregar',      variant: 'primary'   },
                      { key: 'cuenta',  label: 'Pedir cuenta', variant: 'secondary' }],
  CUENTA_SOLICITADA: [{ key: 'pagar',   label: 'Cobrar',       variant: 'primary'   },
                      { key: 'agregar', label: 'Agregar',      variant: 'secondary' }],
  INHABILITADA:      [],   // Sin acciones — se selecciona pero no opera
};

// ─── MesaShapeVenta ──────────────────────────────────────────────────────────
// Toda la información vive DENTRO del shape. Nada flota fuera.

function OperativeTableEl({
  table, isSelected, onClick, onQuickAction, zoom,
}: {
  table: MesaTable; isSelected: boolean;
  onClick: () => void;
  onQuickAction: (action: string) => void;
  zoom: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef   = useRef<HTMLDivElement>(null);
  const leaveTimerRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cfg        = STATUS_CFG[table.status] ?? STATUS_CFG['DISPONIBLE'];
  // OperativeTableEl solo maneja rect y round (barra → BarTableEl)
  const isRound    = table.shape === 'round';
  const isDisabled = table.status === 'INHABILITADA';
  const isOcc      = table.status !== 'DISPONIBLE' && !isDisabled;
  const total   = table.items.reduce((s, i) => s + i.price * i.quantity, 0);

  // Dimensiones finales con swap w↔h para rotación 90°
  const isSwapped = (table.rotationDeg ?? 0) === 90;
  const { w: bW, h: bH } = getTableSize(table.shape, table.capacity);
  const dispW = isSwapped ? bH : bW;
  const dispH = isSwapped ? bW : bH;

  const bradius = isRound ? '50%' : '12px';

  const bgMap: Record<TableStatus, string> = {
    DISPONIBLE:        '#F1F2F6',
    OCUPADA:           '#FEF1F3',
    CUENTA_SOLICITADA: '#FFF3D1',
    INHABILITADA:      'var(--black-10)',
  };
  const bdMap: Record<TableStatus, string> = {
    DISPONIBLE:        '#BABDD3',
    OCUPADA:           'var(--coral-100)',
    CUENTA_SOLICITADA: '#FFC217',
    INHABILITADA:      '#C0C0C0',
  };

  const selBorder = isSelected ? (isDisabled ? 'var(--black-40)' : '#121E6C') : bdMap[table.status];
  const selShadow = isDisabled
    ? 'none'
    : isSelected
    ? '0px 4px 12px rgba(18,30,108,0.2)'
    : isHovered
    ? '0 4px 16px rgba(0,0,0,0.13)'
    : '0 1px 4px rgba(0,0,0,0.07)';

  // ── Tipografía responsiva al zoom ─────────────────────────────────────────
  // textScale compensa el achicado visual del canvas al hacer zoom out.
  const textScale = Math.min(1.30, Math.max(1.0, 1 / zoom));
  const nameFz   = Math.round(13 * textScale);
  const badgeFz  = Math.round( 8 * textScale);
  const metaFz   = Math.round( 9 * textScale);
  const innerGap = Math.round(3 * textScale);
  // Padding: round necesita más margen para que el contenido quede dentro del círculo.
  // Rect: padding estándar.
  const innerPad = isRound ? '18px' : '12px';

  // Hover: bridge + delay para tolerear micro-movimientos al cruzar gap mesa→menú.
  const handleMouseEnter = () => {
    clearTimeout(leaveTimerRef.current);
    setIsHovered(true);
  };
  const handleMouseLeave = (e: React.MouseEvent) => {
    // relatedTarget puede ser null u otro tipo no-Node — validar con instanceof antes de contains()
    const rt = e.relatedTarget;
    if (rt instanceof Node && containerRef.current?.contains(rt)) return;
    leaveTimerRef.current = setTimeout(() => setIsHovered(false), 200);
  };

  const quickActions = TABLE_QUICK_ACTIONS[table.status];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: table.x,
        top: table.y,
        width: dispW,
        height: dispH,
        cursor: isDisabled ? 'default' : 'pointer',
        userSelect: 'none',
        zIndex: isSelected ? 10 : isHovered ? 5 : 1,
        opacity: isDisabled ? 0.5 : 1,
      }}
      onClick={onClick}
      onMouseDown={e => e.stopPropagation()}   /* evita que el canvas inicie pan */
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Sillas decorativas (SVG overflow visible, no interactuable) ── */}
      <TableChairs
        shape={table.shape}
        capacity={table.capacity}
        dispW={dispW}
        dispH={dispH}
        status={table.status}
      />

      {/* ── Shape principal (overflow hidden, clip interno) ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          borderRadius: bradius,
          backgroundColor: bgMap[table.status],
          border: `${isSelected ? 3 : 2}px ${isDisabled ? 'dashed' : 'solid'} ${selBorder}`,
          boxShadow: selShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: innerGap,
          padding: innerPad,
          overflow: 'hidden',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {/* Nombre */}
        <div style={{
          fontSize: nameFz, fontWeight: 700,
          color: isDisabled ? 'var(--black-40)' : 'var(--black-100)',
          letterSpacing: '-0.01em', lineHeight: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: '100%', textAlign: 'center', flexShrink: 0,
          fontFamily: 'var(--font-family, Montserrat, sans-serif)',
        }}>
          {table.name}
        </div>

        {/* Personas + timer */}
        {!isDisabled && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: 3,
            fontSize: metaFz, color: 'var(--black-60)',
            maxWidth: '100%', flexShrink: 0,
          }}>
            <Users size={metaFz - 1} style={{ flexShrink: 0 }} />
            <span>{isOcc ? (table.guests ?? table.capacity) : table.capacity}</span>
            {isOcc && table.openedAtTimestamp && (
              <>
                <span style={{ color: 'var(--black-30)' }}>·</span>
                <Timer size={metaFz - 1} style={{ flexShrink: 0 }} />
                <span>{formatElapsed(table.openedAtTimestamp, table.frozenElapsedMs)}</span>
              </>
            )}
          </div>
        )}

        {/* Indicador inhabilitada */}
        {isDisabled && (
          <div style={{
            fontSize: Math.round(7 * textScale), color: 'var(--black-40)', fontWeight: 600,
            textAlign: 'center', letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            Inhabilitada
          </div>
        )}

        {/* Valor total */}
        {isOcc && total > 0 && (
          <div style={{
            fontSize: metaFz, fontWeight: 700,
            color: table.status === 'CUENTA_SOLICITADA' ? 'var(--feedback-warning-150)' : 'var(--blue-100)',
            textAlign: 'center', maxWidth: '100%', flexShrink: 0,
            fontFamily: 'var(--font-family, Montserrat, sans-serif)',
          }}>
            ${total.toLocaleString('es-CO')}
          </div>
        )}
      </div>

      {/* ── Action bar hover ──────────────────────────────────────────────────
          Wrapper transparente con paddingTop que cubre el gap mesa→menú.
          Se aplica scale(1/zoom) para que los botones se mantengan a tamaño
          fijo y legible sin importar el nivel de zoom del canvas.
          ──────────────────────────────────────────────────────────────────── */}
      {isHovered && quickActions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: dispH,
            left: '50%',
            transform: `translateX(-50%) scale(${1 / zoom})`,
            transformOrigin: 'top center',
            paddingTop: 8,
            zIndex: 20,
          }}
          onMouseEnter={handleMouseEnter}
        >
          {/* Action bar */}
          <div style={{
            display: 'flex',
            gap: 4,
            background: 'white',
            border: '1px solid var(--black-10)',
            borderRadius: 100,
            boxShadow: '0px 4px 16px rgba(0,0,0,0.14)',
            padding: '4px',
            whiteSpace: 'nowrap',
          }}>
            {quickActions.map(a => (
              <button
                key={a.key}
                onClick={e => { e.stopPropagation(); onQuickAction(a.key); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 100,
                  border: a.variant === 'secondary' ? '1.5px solid var(--coral-100)' : 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  color: a.variant === 'primary' ? 'white' : 'var(--coral-100)',
                  background: a.variant === 'primary' ? 'var(--coral-100)' : 'white',
                  cursor: 'pointer',
                  lineHeight: 1.4,
                  transition: 'opacity 0.12s',
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = '0.82')}
                onMouseOut={e  => (e.currentTarget.style.opacity = '1')}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BarTableEl ──────────────────────────────────────────────────────────────
// Render dedicado para mesas tipo Barra. Cápsula alargada con:
//   - Puntos de sillas en UN solo lado (BarChairs)
//   - Padding adaptado a los extremos redondeados del capsule
//   - Contenido centrado y legible en horizontal (0°) y vertical (90°)
//   - Hover-bridge idéntico al de OperativeTableEl

function BarTableEl({
  table, isSelected, onClick, onQuickAction, zoom,
}: {
  table: MesaTable; isSelected: boolean;
  onClick: () => void;
  onQuickAction: (action: string) => void;
  zoom: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef  = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isVert = (table.rotationDeg ?? 0) === 90;
  // getTableSize('barra', cap) = { w: longSide, h: 76 }
  // Con rot 90°: dispW = 76 (ancho estrecho), dispH = longSide (alto largo)
  const { w: bW, h: bH } = getTableSize('barra', table.capacity);
  const dispW = isVert ? bH : bW;
  const dispH = isVert ? bW : bH;

  const cfg        = STATUS_CFG[table.status] ?? STATUS_CFG['DISPONIBLE'];
  const isDisabled = table.status === 'INHABILITADA';
  const isOcc      = table.status !== 'DISPONIBLE' && !isDisabled;
  const total      = table.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const bgMap: Record<TableStatus, string> = {
    DISPONIBLE: '#F1F2F6', OCUPADA: '#FEF1F3',
    CUENTA_SOLICITADA: '#FFF3D1', INHABILITADA: 'var(--black-10)',
  };
  const bdMap: Record<TableStatus, string> = {
    DISPONIBLE: '#BABDD3', OCUPADA: 'var(--coral-100)',
    CUENTA_SOLICITADA: '#FFC217', INHABILITADA: '#C0C0C0',
  };

  const selBorder = isSelected ? (isDisabled ? 'var(--black-40)' : '#121E6C') : bdMap[table.status];
  const selShadow = isDisabled
    ? 'none'
    : isSelected
    ? '0px 4px 12px rgba(18,30,108,0.2)'
    : isHovered ? '0 4px 16px rgba(0,0,0,0.13)' : '0 1px 4px rgba(0,0,0,0.07)';

  // Tipografía responsiva al zoom (igual escala que OperativeTableEl)
  const textScale = Math.min(1.30, Math.max(1.0, 1 / zoom));
  const nameFz    = Math.round(11 * textScale);
  const badgeFz   = Math.round( 7 * textScale);
  const metaFz    = Math.round( 8 * textScale);
  const innerGap  = Math.round( 2 * textScale);

  // Padding interior: el borde del cápsula consume bH/2 ≈ 39px en el eje corto.
  // Necesitamos ese mismo margen en el eje largo para que el texto no quede
  // oculto por los extremos redondeados.
  const capEnd   = Math.floor(bH / 2) + 3; // ≈ 42px → cubre extremo del capsule
  const innerPad = isVert
    ? `${capEnd}px 5px`   // vertical: margen arriba/abajo para extremos del capsule
    : `5px ${capEnd}px`;  // horizontal: margen izq/der para extremos del capsule

  const handleMouseEnter = () => { clearTimeout(leaveTimerRef.current); setIsHovered(true); };
  const handleMouseLeave = (e: React.MouseEvent) => {
    const rt = e.relatedTarget;
    if (rt instanceof Node && containerRef.current?.contains(rt)) return;
    leaveTimerRef.current = setTimeout(() => setIsHovered(false), 200);
  };
  const quickActions = TABLE_QUICK_ACTIONS[table.status];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: table.x, top: table.y,
        width: dispW, height: dispH,
        cursor: isDisabled ? 'default' : 'pointer',
        userSelect: 'none',
        zIndex: isSelected ? 10 : isHovered ? 5 : 1,
        opacity: isDisabled ? 0.5 : 1,
      }}
      onClick={onClick}
      onMouseDown={e => e.stopPropagation()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Puntos de sillas: solo en el lado de atención ── */}
      <BarChairs
        dispW={dispW} dispH={dispH}
        capacity={table.capacity}
        isVert={isVert}
        status={table.status}
      />

      {/* ── Cápsula alargada ── */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', height: '100%',
          borderRadius: '9999px',
          backgroundColor: bgMap[table.status],
          border: `${isSelected ? 3 : 2}px ${isDisabled ? 'dashed' : 'solid'} ${selBorder}`,
          boxShadow: selShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: innerGap,
          padding: innerPad,
          overflow: 'hidden',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {/* Nombre */}
        <div style={{
          fontSize: nameFz, fontWeight: 900, color: isDisabled ? 'var(--black-40)' : '#111827',
          letterSpacing: '-0.02em', lineHeight: 1,
          whiteSpace: 'nowrap', textAlign: 'center',
          overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: '100%', flexShrink: 0,
        }}>
          {table.name}
        </div>

        {/* Ocupada / cuenta → personas + tiempo + total */}
        {isOcc ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: metaFz, color: 'var(--black-60)',
              whiteSpace: 'nowrap', overflow: 'hidden',
              maxWidth: '100%', flexShrink: 0,
            }}>
              <Users size={metaFz - 1} style={{ flexShrink: 0 }} />
              <span>{table.guests ?? table.capacity}</span>
              {table.openedAtTimestamp && (
                <>
                  <span style={{ color: 'var(--black-30)' }}>·</span>
                  <Timer size={metaFz - 1} style={{ flexShrink: 0 }} />
                  <span>{formatElapsed(table.openedAtTimestamp, table.frozenElapsedMs)}</span>
                </>
              )}
            </div>
            {total > 0 && (
              <div style={{
                fontSize: metaFz, fontWeight: 700, color: 'var(--black-100)',
                whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis', maxWidth: '100%',
                textAlign: 'center', flexShrink: 0,
              }}>
                ${total.toLocaleString('es-CO')}
              </div>
            )}
          </>
        ) : (
          /* Disponible → solo icono + capacidad */
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: metaFz, color: 'var(--black-40)',
            whiteSpace: 'nowrap', overflow: 'hidden',
            maxWidth: '100%', flexShrink: 0,
          }}>
            <Users size={metaFz - 1} style={{ flexShrink: 0 }} />
            <span>{table.capacity}</span>
          </div>
        )}
      </div>

      {/* ── Action bar con hover-bridge (igual que OperativeTableEl) ── */}
      {isHovered && quickActions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: dispH,
            left: '50%',
            transform: `translateX(-50%) scale(${1 / zoom})`,
            transformOrigin: 'top center',
            paddingTop: 8,
            zIndex: 20,
          }}
          onMouseEnter={handleMouseEnter}
        >
          <div style={{
            display: 'flex', gap: 8,
            background: 'white',
            border: '1px solid var(--black-10)',
            borderRadius: 100,
            boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
            padding: '4px',
            whiteSpace: 'nowrap',
          }}>
            {quickActions.map(a => (
              <button
                key={a.key}
                onClick={e => { e.stopPropagation(); onQuickAction(a.key); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 100,
                  border: a.variant === 'secondary' ? '1.5px solid var(--coral-100)' : 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  color: a.variant === 'primary' ? 'white' : 'var(--coral-100)',
                  background: a.variant === 'primary' ? 'var(--coral-100)' : 'white',
                  cursor: 'pointer',
                  lineHeight: 1.4,
                  transition: 'opacity 0.12s',
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = '0.82')}
                onMouseOut={e  => (e.currentTarget.style.opacity = '1')}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Edit Note Modal ──────────────────────────────────────────────────────────

function EditNoteModal({
  itemName, initialNote, onSave, onClose,
}: { itemName: string; initialNote: string; onSave: (note: string) => void; onClose: () => void }) {
  const [note, setNote] = useState(initialNote);

  const toggleChip = (chip: string) => {
    if (note.includes(chip)) {
      setNote(prev => prev.replace(chip, '').replace(/^[,\s]+|[,\s]+$/g, '').replace(/\s*,\s*,\s*/g, ', ').trim());
    } else {
      setNote(prev => prev ? `${prev}, ${chip}` : chip);
    }
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[var(--radius-20)] w-full max-w-sm animate-in slide-in-from-bottom-4 sm:zoom-in duration-200" style={{ boxShadow: '0px 8px 32px rgba(0,0,0,0.16)', padding: 32 }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[20px] font-bold text-[var(--black-100)]">Editar nota</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--blue-10)] rounded-[var(--radius-12)] text-[var(--black-40)]">
            <X size={16} />
          </button>
        </div>
        <p className="text-[12px] text-[var(--black-60)] mb-4">{itemName}</p>
        <textarea
          className="merlin-input resize-none"
          rows={3}
          placeholder="Nota del ítem (opcional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          autoFocus
        />
        <div className="flex flex-wrap gap-1.5 mt-3 mb-5">
          {NOTE_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => toggleChip(chip)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all',
                note.includes(chip)
                  ? 'bg-[var(--blue-100)] text-white border-[var(--blue-100)]'
                  : 'bg-[var(--blue-10)] text-[var(--black-60)] border-[var(--black-10)] hover:border-[var(--blue-100)] hover:text-[var(--blue-100)]',
              )}
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-cancel flex-1">
            Cancelar
          </button>
          <button
            onClick={() => { onSave(note.trim()); onClose(); }}
            className="btn btn-primary flex-1"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Panel button helpers ─────────────────────────────────────────────────────

const MFONT = 'var(--font-family, Montserrat, sans-serif)';

function PanelOutlineBtn({
  children, onClick, textColor, hoverBorderColor, icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  textColor: string;
  hoverBorderColor: string;
  icon: React.ReactNode;
}) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, height: 40, borderRadius: 8, background: '#fff', cursor: 'pointer',
        border: `1.5px solid ${hov ? hoverBorderColor : '#C7CBE0'}`,
        color: textColor, fontSize: 14, fontWeight: 600, fontFamily: MFONT,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'border-color 150ms',
      }}
    >
      {icon}{children}
    </button>
  );
}

function PanelNavyBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', height: 40, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: hov ? '#0D1550' : '#121E6C',
        color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: MFONT,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background 150ms',
      }}
    >
      {children}
    </button>
  );
}

function PanelCoralBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', height: 48, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: hov ? '#D91E34' : '#FF2947',
        color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: MFONT,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background 150ms',
      }}
    >
      {children}
    </button>
  );
}

function PanelBillBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', height: 48, borderRadius: 8, cursor: 'pointer',
        border: `1.5px solid ${hov ? '#121E6C' : '#C7CBE0'}`,
        background: '#fff',
        color: hov ? '#121E6C' : '#1E1E1E',
        fontSize: 15, fontWeight: 600, fontFamily: MFONT,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'border-color 150ms, color 150ms',
      }}
    >
      {/* Receipt icon color follows text color via CSS doesn't work for SVG — re-render on hover */}
      {React.Children.map(children, (child, i) =>
        i === 0 && React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ color?: string }>, { color: hov ? '#121E6C' : '#1E1E1E' })
          : child
      )}
    </button>
  );
}

function SmallOutlineBtn({ children, onClick, icon }: { children: React.ReactNode; onClick: () => void; icon?: React.ReactNode }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, height: 36, borderRadius: 8, background: '#fff', cursor: 'pointer',
        border: `1.5px solid ${hov ? '#121E6C' : '#C7CBE0'}`,
        color: '#1E1E1E', fontSize: 13, fontWeight: 500, fontFamily: MFONT,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'border-color 150ms',
      }}
    >
      {icon}{children}
    </button>
  );
}

function SolicitarLink({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        cursor: 'pointer', padding: '6px 0',
        fontSize: 13, fontWeight: 500, fontFamily: MFONT,
        color: hov ? '#D91E34' : '#FF2947',
        transition: 'color 150ms', userSelect: 'none',
      }}
    >
      <Receipt size={13} color={hov ? '#D91E34' : '#FF2947'} /> Solicitar cuenta
    </div>
  );
}

function ReenviarLink({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        cursor: 'pointer', padding: '6px 0',
        fontSize: 13, fontWeight: 500, fontFamily: MFONT,
        color: hov ? '#D91E34' : '#FF2947',
        transition: 'color 150ms',
        userSelect: 'none',
      }}
    >
      <><RefreshCw size={13} color={hov ? '#D91E34' : '#FF2947'} /> Reenviar comanda</>

    </div>
  );
}

// ─── MesasView ────────────────────────────────────────────────────────────────

export function MesasView() {
  // ── Fuente de verdad de layout y zonas: store compartido con GestionarMesasView
  const { mesasConfig, zonesConfig } = useMesasStore();

  // Estado operativo: se inicializa desde el store + datos mock de demo.
  // Los cambios posteriores en mesasConfig (guardados desde Gestionar mesas)
  // se sincronizan vía useEffect sin perder el estado de cada mesa.
  const [tables, setTables] = useState<MesaTable[]>(() => {
    localStorage.removeItem(TABLES_LS_KEY); // temporary: reset stale state
    let base = INITIAL_TABLES;
    try {
      const saved = localStorage.getItem(TABLES_LS_KEY);
      if (saved) base = JSON.parse(saved) as MesaTable[];
    } catch { /* ignorar */ }
    return syncTablesFromConfig(mesasConfig, base).map(t =>
      STATUS_CFG[t.status]
        ? t
        : { ...t, status: 'DISPONIBLE' as TableStatus, items: [], openedAtTimestamp: undefined, firstComandaSentAt: undefined, guests: undefined, comandaSent: false, hasPendingChanges: false, frozenElapsedMs: undefined },
    );
  });

  // Persistir cambios en el pedido de cada mesa a localStorage
  useEffect(() => {
    try { localStorage.setItem(TABLES_LS_KEY, JSON.stringify(tables)); } catch { /* ignorar */ }
  }, [tables]);
  const [selectedTableId, setSelectedTableId]   = useState<string | null>('s09');
  const [activeZone, setActiveZone]             = useState<string>(() => zonesConfig[0] ?? 'Salón');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showChangeMesa, setShowChangeMesa]     = useState(false);
  const [changeMesaTarget, setChangeMesaTarget] = useState<string | null>(null);
  const [showGuestModal, setShowGuestModal]     = useState(false);
  const [guestCount, setGuestCount]             = useState(2);
  const [showCancelModal, setShowCancelModal]   = useState(false);
  const [editNoteTarget, setEditNoteTarget]     = useState<{ itemId: string; itemName: string; note: string } | null>(null);
  const [showPrecuentaModal,    setShowPrecuentaModal]    = useState(false);
  const [showCheckout,          setShowCheckout]           = useState(false);
  const [showKitchenPreview,    setShowKitchenPreview]     = useState(false);
  const [showGestionarMesas, setShowGestionarMesas] = useState(false);
  const [confirmedMesas, setConfirmedMesas]       = useState<Set<string>>(() => new Set());
  const [comandaSentMesas, setComandaSentMesas]   = useState<Set<string>>(() => new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [editingPriceId,  setEditingPriceId]  = useState<string | null>(null);
  const [editingPriceVal, setEditingPriceVal] = useState<string>('');


  // ── Task 3: Item edit drawer ──────────────────────────────────────────────
  const [editItemTarget, setEditItemTarget] = useState<TableItem | null>(null);
  const [editItemQty, setEditItemQty]       = useState<number>(1);
  const [editItemDiscount, setEditItemDiscount] = useState<string>('0');
  const [editItemPrice, setEditItemPrice]   = useState<number>(0);
  const [editItemNote, setEditItemNote]     = useState<string>('');

  // ── Inline nota por producto ──────────────────────────────────────────────
  const [noteInputItemId, setNoteInputItemId] = useState<string | null>(null);
  const [inlineNoteText,  setInlineNoteText]  = useState('');

  // ── Task 4: Hovered item row id ───────────────────────────────────────────
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // ── Viewport: zoom + pan ──────────────────────────────────────────────────
  const ZOOM_STEPS = [0.75, 1, 1.25] as const;
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(32);
  const [panY, setPanY] = useState(32);
  const canvasRef  = useRef<HTMLDivElement>(null);
  const dragRef    = useRef<{ kind: 'none' } | { kind: 'pan'; sx: number; sy: number; spx: number; spy: number }>({ kind: 'none' });
  const liveRef    = useRef({ zoom, panX, panY });
  liveRef.current  = { zoom, panX, panY };
  // Tamaño real del viewport (para cálculo de scrollbars)
  const [vpSize, setVpSize] = useState({ w: 800, h: 480 });

  // ── Tick para actualizar contadores cada 60 s ─────────────────────────────
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Sincronizar layout y zonas cuando el store cambia ────────────────────────
  const firstSync = useRef(true);
  useEffect(() => {
    if (firstSync.current) { firstSync.current = false; return; }
    setTables(prev => syncTablesFromConfig(mesasConfig, prev));
    // Si la zona activa ya no existe en el nuevo config, ir a la primera disponible
    setActiveZone(prev => zonesConfig.includes(prev) ? prev : (zonesConfig[0] ?? prev));
  }, [mesasConfig, zonesConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pan: escuchar mousemove/mouseup globales ───────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (d.kind !== 'pan') return;
      setPanX(d.spx + e.clientX - d.sx);
      setPanY(d.spy + e.clientY - d.sy);
    };
    const onUp = () => {
      dragRef.current = { kind: 'none' };
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll (wheel/trackpad) → pan horizontal y vertical ───────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // deltaMode: 0=px, 1=lines(≈18px), 2=pages(≈300px)
      const factor = e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? 300 : 1;
      let dx = e.deltaX * factor;
      let dy = e.deltaY * factor;
      // Shift+scroll vertical → horizontal (estándar en Mac/Windows)
      if (e.shiftKey && dx === 0) { dx = dy; dy = 0; }
      setPanX(prev => prev - dx);
      setPanY(prev => prev - dy);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── ResizeObserver: tamaño real del viewport para scrollbars ──────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setVpSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    // Leer tamaño inicial
    setVpSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedTable = useMemo(
    () => tables.find(t => t.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  );

  const filteredTables = useMemo(
    () => tables.filter(t => t.zone === activeZone),
    [tables, activeZone],
  );

  const availableForChange = useMemo(
    () => tables.filter(t => t.status === 'DISPONIBLE' && t.id !== selectedTableId),
    [tables, selectedTableId],
  );

  const subtotal   = selectedTable?.items.reduce((acc, i) => acc + i.price * i.quantity, 0) ?? 0;
  const tax        = subtotal * 0.19;
  const total      = subtotal + tax;
  const totalItems = selectedTable?.items.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

  const isComandaSent       = selectedTable?.comandaSent ?? false;
  const hasPendingChanges   = selectedTable?.hasPendingChanges ?? false;
  const savedPendingResend  = selectedTable?.savedPendingResend ?? false;

  // ── Three-state button logic ───────────────────────────────────────────────
  // STATE 3: comanda has been sent (via comandaSentMesas or table.comandaSent from mock data)
  const isComandaSentForMesa = selectedTableId
    ? (comandaSentMesas.has(selectedTableId) || (selectedTable?.comandaSent ?? false))
    : false;
  // STATE 2: confirmed but comanda not yet sent
  // STATE 1: not confirmed
  const isMesaConfirmed = selectedTableId
    ? (confirmedMesas.has(selectedTableId) || isComandaSentForMesa)
    : false;

  // Counters globales para la barra de leyenda inferior
  const totalDisponibles  = tables.filter(t => t.status === 'DISPONIBLE').length;
  const totalActivas      = tables.filter(t => t.status !== 'DISPONIBLE' && t.status !== 'INHABILITADA').length;
  const totalInhabilitadas = tables.filter(t => t.status === 'INHABILITADA').length;

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleIniciarPedido = () => {
    setGuestCount(Math.min(2, selectedTable?.capacity ?? 4));
    setShowGuestModal(true);
  };

  const confirmStartOrder = (guests: number) => {
    if (!selectedTableId) return;
    const name = selectedTable?.name;
    setTables(prev =>
      prev.map(t =>
        t.id === selectedTableId
          ? { ...t, status: 'OCUPADA', openedAtTimestamp: Date.now(), firstComandaSentAt: undefined, guests, items: [], comandaSent: false, hasPendingChanges: false, frozenElapsedMs: undefined }
          : t,
      ),
    );
    setShowGuestModal(false);
    setShowProductSelector(true);
    toast.success(`Mesa ${name} abierta con ${guests} persona${guests > 1 ? 's' : ''}`);
  };

  const saveOrder = () => {
    if (!selectedTableId) return;
    setTables(prev =>
      prev.map(t =>
        t.id !== selectedTableId ? t : { ...t, hasPendingChanges: false, savedPendingResend: true },
      ),
    );
    toast.success('Cambios del pedido guardados');
  };

  const sendComanda = () => {
    if (!selectedTableId || !selectedTable) return;
    const isResend = selectedTable.comandaSent;
    if (isResend && !selectedTable.hasPendingChanges && !selectedTable.savedPendingResend) {
      toast.info('No hay cambios pendientes'); return;
    }
    const now = Date.now();
    setTables(prev =>
      prev.map(t =>
        t.id !== selectedTableId ? t : {
          ...t,
          comandaSent:         true,
          hasPendingChanges:   false,
          savedPendingResend:  false,
          pendingChanges:      [],
          firstComandaSentAt:  t.firstComandaSentAt ?? now,
          items: t.items.map(i => ({ ...i, isSent: true, sentQuantity: i.quantity, sentNote: i.note })),
        },
      ),
    );
    toast.success(isResend ? 'Ajustes enviados a cocina' : 'Comanda enviada a cocina');
  };

  const requestBill = () => {
    if (!selectedTableId) return;
    setTables(prev =>
      prev.map(t => t.id === selectedTableId ? { ...t, status: 'CUENTA_SOLICITADA' } : t),
    );
    toast.info(`Cuenta solicitada — Mesa ${selectedTable?.name}`);
  };

  const confirmCancelAndRelease = () => {
    if (!selectedTableId) return;
    const name = selectedTable?.name;
    setTables(prev =>
      prev.map(t =>
        t.id === selectedTableId
          ? { ...t, status: 'DISPONIBLE', items: [], openedAtTimestamp: undefined, firstComandaSentAt: undefined, guests: undefined, comandaSent: false, hasPendingChanges: false, frozenElapsedMs: undefined }
          : t,
      ),
    );
    setShowCancelModal(false);
    toast.success(`Pedido cancelado, Mesa ${name} disponible`);
  };

  const revertToOcupada = () => {
    if (!selectedTableId) return;
    setTables(prev =>
      prev.map(t => t.id === selectedTableId ? { ...t, status: 'OCUPADA' } : t),
    );
    toast.info('Mesa volvió a Ocupada');
  };

  const updateItemQty = (itemId: string, delta: number) => {
    if (!selectedTableId) return;
    setTables(prev =>
      prev.map(t => {
        if (t.id !== selectedTableId) return t;
        const item   = t.items.find(i => i.id === itemId);
        const newQty = Math.max(1, (item?.quantity ?? 1) + delta);
        let newPendingChanges = t.pendingChanges ?? [];
        if (item && t.comandaSent && item.isSent) {
          const sentQty = item.sentQuantity ?? item.quantity;
          // Eliminar entrada CANTIDAD anterior de este producto
          newPendingChanges = newPendingChanges.filter(
            c => !(c.productId === item.productId && c.type === 'CANTIDAD'),
          );
          if (newQty !== sentQty) {
            newPendingChanges = [...newPendingChanges, {
              type:      'CANTIDAD' as PendingChangeType,
              productId: item.productId,
              name:      item.name,
              prevQty:   sentQty,
              newQty,
              prevNote:  item.sentNote ?? '',
              newNote:   item.note ?? '',
            }];
          }
        }
        return {
          ...t,
          items:             t.items.map(i => i.id === itemId ? { ...i, quantity: newQty } : i),
          hasPendingChanges: (t.comandaSent || confirmedMesas.has(t.id)) ? true : t.hasPendingChanges,
          pendingChanges:    newPendingChanges,
        };
      }),
    );
  };

  const removeItem = (itemId: string) => {
    if (!selectedTableId) return;
    setTables(prev =>
      prev.map(t => {
        if (t.id !== selectedTableId) return t;
        const item = t.items.find(i => i.id === itemId);
        let newPendingChanges = t.pendingChanges ?? [];
        if (item && t.comandaSent && item.isSent) {
          // Ítem ya enviado a cocina → registrar como ELIMINAR
          newPendingChanges = [
            ...newPendingChanges.filter(c => c.productId !== item.productId),
            {
              type: 'ELIMINAR' as PendingChangeType,
              productId: item.productId,
              name:      item.name,
              prevQty:   item.sentQuantity ?? item.quantity,
              newQty:    0,
              prevNote:  item.sentNote ?? '',
              newNote:   '',
            },
          ];
        }
        return {
          ...t,
          items:             t.items.filter(i => i.id !== itemId),
          hasPendingChanges: (t.comandaSent || confirmedMesas.has(t.id)) ? true : t.hasPendingChanges,
          pendingChanges:    newPendingChanges,
        };
      }),
    );
  };

  // ── Confirmar pedido ──────────────────────────────────────────────────────
  const handleConfirmarPedido = () => {
    if (!selectedTableId) return;
    setConfirmedMesas(prev => new Set(prev).add(selectedTableId));
    toast.success('Pedido confirmado');
  };

  // ── Reenviar comanda: usa el mismo showKitchenPreview ─────────────────────
  const handleReenviarComanda = () => {
    if (!selectedTableId || !selectedTable) return;
    setShowKitchenPreview(true);
  };

  // ── Task 3: Save item edit ─────────────────────────────────────────────────
  const saveItemEdit = () => {
    if (!editItemTarget || !selectedTableId) return;
    const itemId  = editItemTarget.id;
    const newNote = editItemNote.trim();
    setTables(prev =>
      prev.map(t => {
        if (t.id !== selectedTableId) return t;
        const item = t.items.find(i => i.id === itemId);
        let newPendingChanges = t.pendingChanges ?? [];
        if (item && t.comandaSent && item.isSent) {
          const sentQty  = item.sentQuantity ?? item.quantity;
          const sentNote = item.sentNote ?? '';
          // CANTIDAD
          newPendingChanges = newPendingChanges.filter(
            c => !(c.productId === item.productId && c.type === 'CANTIDAD'),
          );
          if (editItemQty !== sentQty) {
            newPendingChanges = [...newPendingChanges, {
              type: 'CANTIDAD' as PendingChangeType, productId: item.productId,
              name: item.name, prevQty: sentQty, newQty: editItemQty,
              prevNote: sentNote, newNote,
            }];
          }
          // NOTA
          newPendingChanges = newPendingChanges.filter(
            c => !(c.productId === item.productId && c.type === 'NOTA'),
          );
          if (newNote && newNote !== sentNote) {
            newPendingChanges = [...newPendingChanges, {
              type: 'NOTA' as PendingChangeType, productId: item.productId,
              name: item.name, prevQty: sentQty, newQty: editItemQty,
              prevNote: sentNote, newNote,
            }];
          }
        }
        return {
          ...t,
          items: t.items.map(i =>
            i.id === itemId
              ? { ...i, quantity: editItemQty, price: editItemPrice, note: newNote || undefined, discount: parseInt(editItemDiscount) || undefined }
              : i,
          ),
          hasPendingChanges: (t.comandaSent || confirmedMesas.has(t.id)) ? true : t.hasPendingChanges,
          pendingChanges:    newPendingChanges,
        };
      }),
    );
    setEditItemTarget(null);
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    if (!selectedTableId) return;
    setTables(prev =>
      prev.map(t =>
        t.id !== selectedTableId ? t : {
          ...t,
          items: t.items.map(i => i.id === itemId ? { ...i, price: Math.max(0, newPrice) } : i),
          hasPendingChanges: (t.comandaSent || confirmedMesas.has(t.id)) ? true : t.hasPendingChanges,
        },
      ),
    );
  };

  const updateItemNote = (itemId: string, note: string) => {
    if (!selectedTableId) return;
    setTables(prev =>
      prev.map(t => {
        if (t.id !== selectedTableId) return t;
        return {
          ...t,
          items: t.items.map(i => i.id === itemId ? { ...i, note: note || undefined } : i),
          hasPendingChanges: (t.comandaSent || confirmedMesas.has(t.id)) ? true : t.hasPendingChanges,
        };
      }),
    );
  };

  const confirmChangeMesa = () => {
    if (!selectedTableId || !changeMesaTarget) return;
    const source     = tables.find(t => t.id === selectedTableId);
    const targetName = tables.find(t => t.id === changeMesaTarget)?.name;
    if (!source) return;
    setTables(prev =>
      prev.map(t => {
        if (t.id === selectedTableId)
          return { ...t, status: 'DISPONIBLE', items: [], openedAtTimestamp: undefined, firstComandaSentAt: undefined, guests: undefined, comandaSent: false, hasPendingChanges: false, frozenElapsedMs: undefined };
        if (t.id === changeMesaTarget)
          return { ...t, status: 'OCUPADA', items: source.items, openedAtTimestamp: source.openedAtTimestamp, guests: source.guests, comandaSent: source.comandaSent, hasPendingChanges: source.hasPendingChanges };
        return t;
      }),
    );
    setSelectedTableId(changeMesaTarget);
    setChangeMesaTarget(null);
    setShowChangeMesa(false);
    toast.success(`Pedido movido a mesa ${targetName}`);
  };

  // ── Zoom / Pan handlers ───────────────────────────────────────────────────
  const onBgDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, spx: panX, spy: panY };
    document.body.style.cursor     = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const zoomIn  = () => setZoom(z => ZOOM_STEPS.find(s => s > z)          ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]);
  const zoomOut = () => setZoom(z => [...ZOOM_STEPS].reverse().find(s => s < z) ?? ZOOM_STEPS[0]);

  const fitView = () => {
    if (!filteredTables.length) { setPanX(32); setPanY(32); setZoom(1); return; }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pad = 56;
    const getW = (t: MesaTable) => { const { w, h } = getTableSize(t.shape, t.capacity); return (t.rotationDeg ?? 0) === 90 ? h : w; };
    const getH = (t: MesaTable) => { const { w, h } = getTableSize(t.shape, t.capacity); return (t.rotationDeg ?? 0) === 90 ? w : h; };
    const minX = Math.min(...filteredTables.map(t => t.x));
    const minY = Math.min(...filteredTables.map(t => t.y));
    const maxX = Math.max(...filteredTables.map(t => t.x + getW(t)));
    const maxY = Math.max(...filteredTables.map(t => t.y + getH(t)));
    const ns   = Math.max(ZOOM_STEPS[0], Math.min(ZOOM_STEPS[ZOOM_STEPS.length - 1],
      Math.min((rect.width  - pad * 2) / (maxX - minX || 1),
               (rect.height - pad * 2) / (maxY - minY || 1)),
    ));
    setZoom(ns);
    setPanX(pad - minX * ns + (rect.width  - (maxX - minX) * ns) / 2 - pad);
    setPanY(pad - minY * ns + (rect.height - (maxY - minY) * ns) / 2 - pad);
  };

  // ── Acciones rápidas desde hover ─────────────────────────────────────────
  const handleQuickAction = (table: MesaTable, action: string) => {
    setSelectedTableId(table.id);
    switch (action) {
      case 'iniciar':
        setGuestCount(Math.min(2, table.capacity));
        setShowGuestModal(true);
        break;
      case 'agregar':
        setShowProductSelector(true);
        break;
      case 'cuenta':
        setTables(prev => prev.map(t => t.id === table.id ? { ...t, status: 'CUENTA_SOLICITADA' } : t));
        toast.success(`Cuenta solicitada · Mesa ${table.name}`);
        break;
      case 'pagar':
        setShowCheckout(true);
        break;
      case 'imprimir':
        setShowPrecuentaModal(true);
        break;
      case 'liberar':
        setTables(prev => prev.map(t =>
          t.id === table.id
            ? { ...t, status: 'DISPONIBLE', items: [], openedAtTimestamp: undefined, firstComandaSentAt: undefined, guests: undefined, comandaSent: false, hasPendingChanges: false, frozenElapsedMs: undefined }
            : t,
        ));
        toast.success(`Mesa ${table.name} liberada y disponible`);
        break;
    }
  };

  // ── Vista selector de productos ───────────────────────────────────────────
  if (showProductSelector && selectedTableId) {
    return (
      <>
        <MesaProductSelector
          tableId={selectedTableId}
          tables={tables}
          setTables={setTables}
          onBack={() => setShowProductSelector(false)}
          onOpenKitchenPreview={() => setShowKitchenPreview(true)}
          confirmedMesas={confirmedMesas}
          comandaSentMesas={comandaSentMesas}
          onConfirmarPedido={handleConfirmarPedido}
        />
        {showKitchenPreview && selectedTable && (() => {
          const isAdjust     = (selectedTable.comandaSent ?? false) && (selectedTable.hasPendingChanges ?? false);
          const isFullResend = (selectedTable.comandaSent ?? false) && !(selectedTable.hasPendingChanges ?? false);
          const adjLines     = isAdjust
            ? formatAdjustmentLines(selectedTable.items, selectedTable.pendingChanges ?? [])
            : undefined;
          return (
            <KitchenTicketPreviewModal
              headerLabel="Mesa"
              headerValue={selectedTable.name}
              showPersonas
              guests={selectedTable.guests}
              staffLabel="Mesero"
              items={selectedTable.items as TicketItem[]}
              firstComandaSentAt={selectedTable.firstComandaSentAt}
              isResend={isFullResend}
              title={isAdjust ? 'Comanda de ajuste — Cocina' : isFullResend ? 'Reenviar comanda a cocina' : undefined}
              subtitle={isAdjust ? 'Se enviarán los siguientes cambios a cocina' : isFullResend ? 'Se reimprimirá la última comanda enviada a cocina' : undefined}
              actionLabel={isAdjust ? 'Enviar ajuste' : isFullResend ? 'Reenviar e imprimir' : undefined}
              adjustmentLines={adjLines}
              onCancel={() => setShowKitchenPreview(false)}
              onConfirm={() => {
                sendComanda();
                if (selectedTableId) setComandaSentMesas(prev => new Set(prev).add(selectedTableId));
                setShowKitchenPreview(false);
              }}
            />
          );
        })()}
      </>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (showGestionarMesas) {
    return <GestionarMesasView onBack={() => setShowGestionarMesas(false)} />;
  }

  return (
    <>
      {/* ════════════════════════════════════════════════════
          Modal: ¿Cuántas personas?
          ════════════════════════════════════════════════════ */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowGuestModal(false)} />
          <div className="relative bg-white rounded-[var(--radius-20)] w-full max-w-xs animate-in zoom-in duration-200" style={{ boxShadow: '0px 8px 32px rgba(0,0,0,0.16)', padding: 32 }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[20px] font-bold text-[var(--black-100)]">¿Cuántas personas?</h3>
              <button onClick={() => setShowGuestModal(false)} className="p-1.5 hover:bg-[var(--blue-10)] rounded-[var(--radius-12)] text-[var(--black-40)]">
                <X size={18} />
              </button>
            </div>
            <p className="text-[12px] text-[var(--black-60)] mb-7">Mesa {selectedTable?.name} · {selectedTable?.zone}</p>
            <div className="flex items-center justify-center gap-6 mb-3">
              <button
                onClick={() => setGuestCount(c => Math.max(1, c - 1))}
                disabled={guestCount <= 1}
                className={cn(
                  'w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all',
                  guestCount > 1 ? 'border-[var(--black-10)] hover:border-[var(--blue-100)] hover:text-[var(--blue-100)]' : 'border-[var(--black-10)] text-[var(--black-40)] cursor-not-allowed',
                )}
              >
                <Minus size={18} />
              </button>
              <div className="text-center w-16">
                <div className="text-5xl font-bold text-[var(--black-100)] leading-none">{guestCount}</div>
                <div className="text-[12px] text-[var(--black-60)] mt-2">persona{guestCount !== 1 ? 's' : ''}</div>
              </div>
              <button
                onClick={() => setGuestCount(c => Math.min(selectedTable?.capacity ?? 12, c + 1))}
                disabled={guestCount >= (selectedTable?.capacity ?? 12)}
                className={cn(
                  'w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all',
                  guestCount < (selectedTable?.capacity ?? 12) ? 'border-[var(--black-10)] hover:border-[var(--blue-100)] hover:text-[var(--blue-100)]' : 'border-[var(--black-10)] text-[var(--black-40)] cursor-not-allowed',
                )}
              >
                <Plus size={18} />
              </button>
            </div>
            <p className="text-center text-[11px] text-[var(--black-40)] mb-7">
              Capacidad máx.: {selectedTable?.capacity} personas
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowGuestModal(false)} className="btn btn-cancel flex-1">
                Cancelar
              </button>
              <button onClick={() => confirmStartOrder(guestCount)} className="btn btn-primary flex-1">
                Abrir mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          Modal: Cancelar y liberar mesa
          ════════════════════════════════════════════════════ */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-[var(--radius-20)] w-full max-w-sm animate-in zoom-in duration-200" style={{ boxShadow: '0px 8px 32px rgba(0,0,0,0.16)', padding: 32 }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-[var(--radius-16)] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--coral-10)' }}>
                <AlertTriangle size={20} style={{ color: 'var(--coral-100)' }} />
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[var(--black-100)]">¿Cancelar pedido y liberar mesa?</h3>
                <p className="text-[14px] text-[var(--black-60)] mt-1">Esta acción elimina los ítems del pedido y deja la mesa disponible.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="btn btn-cancel flex-1">
                Volver
              </button>
              <button onClick={confirmCancelAndRelease} className="btn btn-primary flex-1">
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          Modal: Cambiar mesa
          ════════════════════════════════════════════════════ */}
      {showChangeMesa && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowChangeMesa(false); setChangeMesaTarget(null); }} />
          <div className="relative bg-white rounded-[var(--radius-20)] w-full max-w-md animate-in zoom-in duration-200" style={{ boxShadow: '0px 8px 32px rgba(0,0,0,0.16)', padding: 32 }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[20px] font-bold text-[var(--black-100)]">Cambiar mesa</h3>
              <button onClick={() => { setShowChangeMesa(false); setChangeMesaTarget(null); }} className="p-1.5 hover:bg-[var(--blue-10)] rounded-[var(--radius-12)] text-[var(--black-40)]">
                <X size={18} />
              </button>
            </div>
            <p className="text-[12px] text-[var(--black-60)] mb-5">
              El pedido de <span className="font-semibold text-[var(--black-100)]">Mesa {selectedTable?.name}</span> se moverá a la mesa que selecciones.
            </p>
            {availableForChange.length === 0 ? (
              <div className="py-10 text-center text-[var(--black-40)]"><p className="text-sm">No hay mesas disponibles para el cambio.</p></div>
            ) : (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {availableForChange.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setChangeMesaTarget(changeMesaTarget === t.id ? null : t.id)}
                    className={cn(
                      'py-4 px-3 rounded-[var(--radius-12)] border-2 text-center transition-all',
                      changeMesaTarget === t.id ? 'border-[var(--blue-100)] bg-[var(--blue-10)]' : 'border-[var(--black-10)] hover:border-[var(--blue-100)]/40 hover:bg-[var(--blue-10)]/30',
                    )}
                  >
                    <div className="text-[14px] font-semibold text-[var(--black-100)]">{t.name}</div>
                    <div className="text-[11px] text-[var(--black-60)] mt-1">{t.zone} · {t.capacity} pers.</div>
                    {changeMesaTarget === t.id && <div className="mt-1.5 flex justify-center"><CheckCircle size={14} className="text-[var(--blue-100)]" /></div>}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowChangeMesa(false); setChangeMesaTarget(null); }} className="btn btn-cancel flex-1">
                Cancelar
              </button>
              <button
                disabled={!changeMesaTarget}
                onClick={confirmChangeMesa}
                className={cn('btn btn-primary flex-1', !changeMesaTarget && 'opacity-40 cursor-not-allowed')}
              >
                Confirmar cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          Modal: Editar nota de ítem
          ════════════════════════════════════════════════════ */}
      {editNoteTarget && (
        <EditNoteModal
          itemName={editNoteTarget.itemName}
          initialNote={editNoteTarget.note}
          onSave={note => updateItemNote(editNoteTarget.itemId, note)}
          onClose={() => setEditNoteTarget(null)}
        />
      )}

      {/* ════════════════════════════════════════════════════
          Modal: Pre-cuenta (ticket imprimible)
          ════════════════════════════════════════════════════ */}
      {showPrecuentaModal && selectedTable && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPrecuentaModal(false)} />
          <div className="relative bg-white rounded-[var(--radius-20)] w-full max-w-sm animate-in zoom-in duration-200 overflow-hidden" style={{ boxShadow: '0px 8px 32px rgba(0,0,0,0.16)' }}>
            {/* Banner ilustrativo */}
            <div style={{ backgroundColor: 'var(--blue-10)', padding: '10px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Info size={15} style={{ color: 'var(--black-60)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: "var(--black-60)", lineHeight: 1.5, margin: 0 }}>
                Este preview es solo ilustrativo. En el producto final, la impresión se ejecuta directamente sin este paso de confirmación.
              </p>
            </div>
            {/* ── Simulación tirilla térmica ── */}
            <div style={{ padding: '16px', backgroundColor: '#fff', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 280,
                backgroundColor: '#F9F7F4',
                border: '1px solid #E5E5E5',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.06)',
                fontFamily: '"Courier New", Courier, monospace',
                padding: '16px 14px 8px',
                color: '#1a1a1a',
                maxHeight: 370,
                overflowY: 'auto',
              }}>
                <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 13, margin: 0, letterSpacing: 0.5 }}>RESTAURANTE DEMO</p>
                <p style={{ textAlign: 'center', fontSize: 10, color: '#666', margin: '2px 0 8px' }}>Calle 85 No. 11-53, Bogotá</p>
                <p style={{ textAlign: 'center', fontSize: 11, margin: '0 0 2px', letterSpacing: 1.5 }}>====================</p>
                <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12, margin: '2px 0', letterSpacing: 0.5 }}>PRE-CUENTA</p>
                <p style={{ textAlign: 'center', fontSize: 11, margin: '2px 0 6px', letterSpacing: 1.5 }}>====================</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                  <span>Mesa: {selectedTable.name}</span>
                  <span>{selectedTable.zone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                  <span>Personas: {selectedTable.guests ?? '—'}</span>
                  <span>{selectedTable.openedAtTimestamp ? formatOpenTime(selectedTable.openedAtTimestamp) : '—'}</span>
                </div>
                <p style={{ fontSize: 11, margin: '0 0 4px' }}>
                  {'Fecha: ' + new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g, '')}
                </p>
                <p style={{ textAlign: 'center', fontSize: 11, margin: '2px 0', letterSpacing: 1.5 }}>--------------------</p>
                <div style={{ display: 'flex', fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
                  <span style={{ width: 35, flexShrink: 0 }}>Cant</span>
                  <span style={{ flex: 1 }}>Descripción</span>
                  <span>Valor</span>
                </div>
                <p style={{ textAlign: 'center', fontSize: 11, margin: '2px 0 4px', letterSpacing: 1.5 }}>--------------------</p>
                {selectedTable.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ width: 35, flexShrink: 0 }}>{item.quantity}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 6 }}>{item.name}</span>
                    <span style={{ flexShrink: 0 }}>${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <p style={{ textAlign: 'center', fontSize: 11, margin: '4px 0 2px', letterSpacing: 1.5 }}>--------------------</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                  <span>SUBTOTAL</span><span>${subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                  <span>IVA 19%</span><span>${Math.round(tax).toLocaleString()}</span>
                </div>
                <p style={{ textAlign: 'center', fontSize: 11, margin: '2px 0', letterSpacing: 1.5 }}>====================</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 'bold', margin: '2px 0 10px' }}>
                  <span>TOTAL</span><span>${Math.round(total).toLocaleString()}</span>
                </div>
                <p style={{ textAlign: 'center', fontSize: 9, color: '#888', fontStyle: 'italic', margin: '0 0 6px' }}>
                  Este documento no es válido como factura
                </p>
                <p style={{ textAlign: 'center', fontSize: 10, color: '#888', margin: '0 0 8px' }}>
                  Gracias por su visita
                </p>
              </div>
            </div>
            {/* Actions */}
            <div className="p-4 flex gap-3">
              <button
                onClick={() => setShowPrecuentaModal(false)}
                className="btn btn-cancel flex-1"
              >
                Cerrar
              </button>
              <button
                onClick={() => toast.info('Documento enviado a impresora')}
                className="btn btn-primary flex-1"
                style={{ backgroundColor: 'var(--blue-100)' }}
              >
                <Printer size={15} /> Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════���════════════════════
          Columna izquierda: Mapa de mesas
          ════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--background-page)' }}>

        {/* ── Toolbar: zona tabs + gestionar ── */}
        <div className="zone-tabs shrink-0">
          {zonesConfig.map(zone => {
            const zTotal  = tables.filter(t => t.zone === zone).length;
            const zActive = tables.filter(t => t.zone === zone && t.status !== 'DISPONIBLE').length;
            return (
              <button
                key={zone}
                onClick={() => setActiveZone(zone)}
                className={cn('zone-tab', activeZone === zone && 'zone-tab--active')}
              >
                {zone}
                <span className={cn(
                  'zone-tab__counter',
                  activeZone !== zone && 'zone-tab__counter--inactive',
                )}>
                  {zActive}/{zTotal}
                </span>
              </button>
            );
          })}

          {/* ── Toggle Grid / Mapa ── */}
          <div className="ml-auto flex items-center gap-3">
            <div style={{
              display: 'flex',
              border: '1px solid var(--blue-20)',
              borderRadius: 6,
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <button
                onClick={() => setViewMode('grid')}
                title="Vista Grid"
                style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: viewMode === 'grid' ? 'var(--blue-100)' : '#ffffff',
                  border: 'none',
                  borderRight: '1px solid var(--blue-20)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                <LayoutGrid size={15} color={viewMode === 'grid' ? '#ffffff' : 'var(--black-40)'} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                title="Vista Mapa"
                style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: viewMode === 'map' ? 'var(--blue-100)' : '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                <Map size={15} color={viewMode === 'map' ? '#ffffff' : 'var(--black-40)'} />
              </button>
            </div>

            <button
              onClick={() => setShowGestionarMesas(true)}
              className="link-blue flex items-center gap-1.5"
              style={{ fontSize: 13 }}
            >
              <Settings size={13} /> Gestionar mesas
            </button>
          </div>
        </div>

        {/* ── Vista Grid (por defecto) ── */}
        {viewMode === 'grid' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-5">
            <MesasGridView
              tables={filteredTables}
              selectedTableId={selectedTableId}
              onSelectMesa={(id) => setSelectedTableId(id)}
            />
          </div>
        )}

        {/* ── CanvasMesasVenta: mapa libre de solo lectura ── */}
        {viewMode === 'map' && (
        <>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-5">

          {/* Zone header + controles de zoom */}
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <h2 className="text-[11px] font-semibold text-[var(--black-40)] uppercase tracking-wide shrink-0">{activeZone}</h2>
            <div className="flex-1 h-px bg-[var(--black-10)]" />
            <span className="text-[11px] font-medium text-[var(--black-40)] shrink-0">
              {filteredTables.filter(t => t.status === 'DISPONIBLE').length} disp. ·{' '}
              {filteredTables.filter(t => t.status !== 'DISPONIBLE').length} activas
            </span>
            {/* Zoom controls */}
            <div className="flex items-center bg-white border border-[var(--black-10)] rounded-[var(--radius-12)] overflow-hidden shrink-0">
              <button
                onClick={zoomOut}
                disabled={zoom <= ZOOM_STEPS[0]}
                className="px-2 py-1 hover:bg-[var(--blue-10)] disabled:opacity-30 disabled:cursor-not-allowed border-r border-[var(--black-10)] transition-colors"
                title="Alejar"
              >
                <ZoomOut size={12} className="text-[var(--black-40)]" />
              </button>
              <button
                onClick={() => { setZoom(1); setPanX(32); setPanY(32); }}
                className="px-2.5 py-1 text-[10px] font-semibold text-[var(--black-60)] hover:bg-[var(--blue-10)] border-r border-[var(--black-10)] min-w-[40px] text-center transition-colors"
                title="Restablecer zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={zoomIn}
                disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
                className="px-2 py-1 hover:bg-[var(--blue-10)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Acercar"
              >
                <ZoomIn size={12} className="text-[var(--black-40)]" />
              </button>
            </div>
            <button
              onClick={fitView}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-[var(--black-60)] hover:text-[var(--black-100)] bg-white border border-[var(--black-10)] rounded-[var(--radius-12)] hover:bg-[var(--blue-10)] transition-all shrink-0"
              title="Centrar mesas en pantalla"
            >
              <Maximize2 size={11} /> Centrar
            </button>
          </div>

          {/* Canvas — viewport con pan/scroll/zoom.
              Fondo: transparente → se ve el fondo neutro del área (sin tarjeta gris). */}
          <div
            ref={canvasRef}
            className="flex-1 min-h-0 overflow-hidden relative"
            style={{ cursor: 'grab' }}
            onMouseDown={onBgDown}
          >
            {/* Contenido transformado (pan + zoom) */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: 1440, height: 980,
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                transformOrigin: '0 0',
                background: 'transparent',   /* sin fondo gris — CAMBIO 1 */
                backgroundImage: 'none',
                willChange: 'transform',
              }}
            >
              {filteredTables.map(table =>
                table.shape === 'barra' ? (
                  <BarTableEl
                    key={table.id}
                    table={table}
                    isSelected={selectedTableId === table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    onQuickAction={(action) => handleQuickAction(table, action)}
                    zoom={zoom}
                  />
                ) : (
                  <OperativeTableEl
                    key={table.id}
                    table={table}
                    isSelected={selectedTableId === table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    onQuickAction={(action) => handleQuickAction(table, action)}
                    zoom={zoom}
                  />
                ),
              )}
            </div>

            {/* ── Scrollbars visuales (overlay, no interactuables por ahora) ── */}
            {(() => {
              const LW = 980 * zoom;  // ancho lógico escalado
              const LH = 580 * zoom;  // alto  lógico escalado
              const THUMB_MIN = 28;
              const PAD = 4;           // separación del borde

              // Horizontal
              const hOverflow = LW > vpSize.w;
              const hTrackW   = vpSize.w - 16;  // dejar hueco para track vertical
              const hThumbW   = Math.max(THUMB_MIN, hTrackW * Math.min(1, vpSize.w / LW));
              const hRange    = Math.max(1, LW - vpSize.w);
              const hProgress = Math.max(0, Math.min(1, (32 - panX) / hRange));
              const hThumbX   = hProgress * (hTrackW - hThumbW);

              // Vertical
              const vOverflow = LH > vpSize.h;
              const vTrackH   = vpSize.h - 16;
              const vThumbH   = Math.max(THUMB_MIN, vTrackH * Math.min(1, vpSize.h / LH));
              const vRange    = Math.max(1, LH - vpSize.h);
              const vProgress = Math.max(0, Math.min(1, (32 - panY) / vRange));
              const vThumbY   = vProgress * (vTrackH - vThumbH);

              return (
                <>
                  {/* Track horizontal */}
                  {hOverflow && (
                    <div
                      style={{
                        position: 'absolute', bottom: PAD, left: PAD,
                        width: hTrackW, height: 6,
                        background: 'rgba(0,0,0,0.07)', borderRadius: 3,
                        zIndex: 50, pointerEvents: 'none',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 0, height: '100%',
                        left: hThumbX, width: hThumbW,
                        background: 'rgba(0,0,0,0.28)', borderRadius: 3,
                        transition: 'left 0.06s linear',
                      }} />
                    </div>
                  )}
                  {/* Track vertical */}
                  {vOverflow && (
                    <div
                      style={{
                        position: 'absolute', right: PAD, top: PAD,
                        width: 6, height: vTrackH,
                        background: 'rgba(0,0,0,0.07)', borderRadius: 3,
                        zIndex: 50, pointerEvents: 'none',
                      }}
                    >
                      <div style={{
                        position: 'absolute', left: 0, width: '100%',
                        top: vThumbY, height: vThumbH,
                        background: 'rgba(0,0,0,0.28)', borderRadius: 3,
                        transition: 'top 0.06s linear',
                      }} />
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            BARRA INFERIOR DE LEYENDA — sticky al fondo del mapa
            ══════════════════════════════════════════════════════ */}
        <div className="legend-bar">
          <span className="legend-pill" style={{ background: 'var(--blue-10)', border: '1px solid var(--blue-20)', color: 'var(--blue-60)' }}>
            <span className="legend-dot" style={{ background: 'var(--blue-60)' }} />
            Disponible
          </span>
          <span className="legend-pill" style={{ background: 'var(--coral-10)', border: '1px solid var(--coral-100)', color: 'var(--coral-100)' }}>
            <span className="legend-dot" style={{ background: 'var(--coral-100)' }} />
            Ocupada
          </span>
          <span className="legend-pill" style={{ background: 'var(--feedback-warning-10)', border: '1px solid var(--feedback-warning-100)', color: 'var(--feedback-warning-150)' }}>
            <span className="legend-dot" style={{ background: 'var(--feedback-warning-100)' }} />
            Cuenta solicitada
          </span>
          {totalInhabilitadas > 0 && (
            <span className="legend-pill" style={{ background: 'var(--black-10)', border: '1px dashed var(--black-40)', color: 'var(--black-40)' }}>
              <span className="legend-dot" style={{ background: 'var(--black-40)' }} />
              Inhabilitada
            </span>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-family, Montserrat, sans-serif)', color: 'var(--black-60)' }}>
              <span className="legend-dot" style={{ background: 'var(--blue-60)' }} />
              Disponibles: <strong style={{ color: 'var(--black-100)', fontWeight: 700 }}>{totalDisponibles}</strong>
            </span>
            <span style={{ width: 1, height: 16, background: 'var(--black-10)' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-family, Montserrat, sans-serif)', color: 'var(--black-60)' }}>
              <span className="legend-dot" style={{ background: 'var(--coral-100)' }} />
              Activas: <strong style={{ color: 'var(--black-100)', fontWeight: 700 }}>{totalActivas}</strong>
            </span>
            {totalInhabilitadas > 0 && (
              <>
                <span style={{ width: 1, height: 16, background: 'var(--black-10)' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-family, Montserrat, sans-serif)', color: 'var(--black-60)' }}>
                  <span className="legend-dot" style={{ background: 'var(--black-40)' }} />
                  Inhabilitadas: <strong style={{ color: 'var(--black-100)', fontWeight: 700 }}>{totalInhabilitadas}</strong>
                </span>
              </>
            )}
          </div>
        </div>
        </> )} {/* fin viewMode === 'map' */}
      </div>

      {/* ════════════════════════════════════════════════════
          Checkout Drawer — solo CUENTA_SOLICITADA
          ════════════════════════════════════════════════════ */}
      {showCheckout && selectedTable && (
        <CheckoutDrawer
          title={`Mesa ${selectedTable.name}`}
          subtitle={selectedTable.zone}
          meta={selectedTable.guests ? `${selectedTable.guests} persona${selectedTable.guests !== 1 ? 's' : ''}` : undefined}
          items={selectedTable.items}
          hideSendToKitchen
          onClose={() => setShowCheckout(false)}
          onConfirmPay={(_method, _total) => {
            // Pago confirmado → mesa vuelve directamente a DISPONIBLE
            setTables(prev =>
              prev.map(t =>
                t.id === selectedTableId
                  ? { ...t, status: 'DISPONIBLE', items: [], openedAtTimestamp: undefined, firstComandaSentAt: undefined, guests: undefined, comandaSent: false, hasPendingChanges: false, frozenElapsedMs: undefined }
                  : t,
              ),
            );
          }}
        />
      )}

      {/* ── Modal preview ticket de cocina / ajuste / reenvío ── */}
      {showKitchenPreview && selectedTable && (() => {
        const isAdjust     = (selectedTable.comandaSent ?? false) && (selectedTable.hasPendingChanges ?? false);
        const isFullResend = (selectedTable.comandaSent ?? false) && !(selectedTable.hasPendingChanges ?? false);
        const adjLines     = isAdjust
          ? formatAdjustmentLines(selectedTable.items, selectedTable.pendingChanges ?? [])
          : undefined;
        return (
          <KitchenTicketPreviewModal
            headerLabel="Mesa"
            headerValue={selectedTable.name}
            showPersonas
            guests={selectedTable.guests}
            staffLabel="Mesero"
            items={selectedTable.items as TicketItem[]}
            firstComandaSentAt={selectedTable.firstComandaSentAt}
            isResend={isFullResend}
            title={isAdjust ? 'Comanda de ajuste — Cocina' : isFullResend ? 'Reenviar comanda a cocina' : undefined}
            subtitle={isAdjust ? 'Se enviarán los siguientes cambios a cocina' : isFullResend ? 'Se reimprimirá la última comanda enviada a cocina' : undefined}
            actionLabel={isAdjust ? 'Enviar ajuste' : isFullResend ? 'Reenviar e imprimir' : undefined}
            adjustmentLines={adjLines}
            onCancel={() => setShowKitchenPreview(false)}
            onConfirm={() => {
              sendComanda();
              if (selectedTableId) setComandaSentMesas(prev => new Set(prev).add(selectedTableId));
              setShowKitchenPreview(false);
            }}
          />
        );
      })()}


      {/* ════════════════════════════════════════════════════
          Task 3: Modal de edición de ítem
          ════════════════════════════════════════════════════ */}
      {editItemTarget && (() => {
        const catDef = CAT_DEFS.find(c => c.id === editItemTarget.catId);
        const catColor = catDef?.color ?? '#606060';
        const catName  = catDef?.name  ?? '';
        const MFONT_D  = 'var(--font-family, Montserrat, sans-serif)';
        const merlinInput: React.CSSProperties = {
          width: '100%', borderRadius: 8, border: '1px solid #E0E0E0',
          background: '#F5F5F5', fontSize: 15, padding: '10px 12px',
          outline: 'none', boxSizing: 'border-box', fontFamily: MFONT_D,
          transition: 'border-color 180ms', color: '#1E1E1E',
        };
        const labelStyle: React.CSSProperties = {
          fontSize: 12, fontWeight: 600, color: '#1E1E1E',
          fontFamily: MFONT_D, display: 'block', marginBottom: 6,
        };
        const totalCalc = editItemPrice * editItemQty;
        return (
          <>
            {/* Overlay */}
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 1099 }}
              onClick={() => setEditItemTarget(null)}
            />
            {/* Drawer lateral */}
            <div style={{
              position: 'fixed', right: 0, top: 0, height: '100vh',
              width: 'min(549px, 100vw)',
              backgroundColor: 'white',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.14)',
              zIndex: 1100,
              display: 'flex', flexDirection: 'column',
              fontFamily: MFONT_D,
            }}>
              {/* ── Header fijo 72px ── */}
              <div style={{
                height: 72, padding: '0 24px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '2px solid #F0F0F0',
              }}>
                {/* Lado izq: barra de color + nombre + categoría */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 8, height: 32, borderRadius: 4,
                    backgroundColor: catColor, flexShrink: 0,
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: 20, fontWeight: 700, color: '#1E1E1E',
                      fontFamily: MFONT_D, lineHeight: '1.2',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {editItemTarget.name}
                    </p>
                    {catName && (
                      <p style={{
                        margin: '2px 0 0', fontSize: 12, fontWeight: 500,
                        color: catColor, fontFamily: MFONT_D,
                      }}>
                        {catName}
                      </p>
                    )}
                  </div>
                </div>
                {/* Lado der: botón X */}
                <button
                  onClick={() => setEditItemTarget(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#606060', flexShrink: 0 }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* ── Body scrolleable ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Fila 1: Cantidad + Descuento */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={editItemQty}
                      onChange={e => setEditItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                      style={merlinInput}
                      onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Descuento por ítem</label>
                    <select
                      value={editItemDiscount}
                      onChange={e => setEditItemDiscount(e.target.value)}
                      style={{ ...merlinInput, cursor: 'pointer' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
                    >
                      <option value="0">Sin descuento</option>
                      <option value="5">5%</option>
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                      <option value="20">20%</option>
                    </select>
                  </div>
                </div>

                {/* Precio total */}
                <div>
                  <label style={labelStyle}>Precio total</label>
                  <div style={{
                    ...merlinInput,
                    display: 'flex', alignItems: 'center',
                    background: '#F8F8F8', color: '#1E1E1E', fontWeight: 600,
                    cursor: 'default',
                  }}>
                    ${totalCalc.toLocaleString('es-CO')}
                  </div>
                  <p style={{ fontSize: 11, color: '#909090', fontFamily: MFONT_D, marginTop: 4 }}>
                    Precio unitario: ${editItemPrice.toLocaleString('es-CO')}
                  </p>
                </div>

                {/* Separador */}
                <div style={{ height: 1, background: '#F0F0F0', margin: '0' }} />

                {/* Nota para cocina */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ChefHat size={13} color="#1E1E1E" />
                    Nota para cocina
                  </label>
                  <textarea
                    value={editItemNote}
                    onChange={e => setEditItemNote(e.target.value)}
                    placeholder="Ej: sin cebolla, término 3/4, salsa aparte..."
                    rows={3}
                    style={{
                      ...merlinInput,
                      minHeight: 80, resize: 'none',
                      padding: '10px 12px', lineHeight: '1.5',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
                  />
                </div>
              </div>

              {/* ── Footer fijo ── */}
              <div style={{
                display: 'flex', gap: 12, padding: '16px 24px',
                borderTop: '1px solid #F0F0F0', flexShrink: 0,
              }}>
                <button
                  onClick={() => {
                    removeItem(editItemTarget.id);
                    setEditItemTarget(null);
                  }}
                  style={{
                    flex: 1, height: 44, borderRadius: 8,
                    border: '1.5px solid #FF2947', color: '#FF2947',
                    background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: MFONT_D, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Trash2 size={14} color="#FF2947" />
                  Eliminar del pedido
                </button>
                <button
                  onClick={saveItemEdit}
                  style={{
                    flex: 1, height: 44, borderRadius: 8,
                    border: 'none', background: '#121E6C',
                    color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: MFONT_D, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Check size={14} color="#fff" />
                  Guardar cambios
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ════════════════════════════════════════════���═══════
          Columna derecha: Panel detalle de mesa
          ════════════════════════════════════════════════════ */}
      <div className="panel-right w-[400px] shrink-0" style={{ overflow: 'hidden' }}>

        {/* ── Sin selección ── */}
        {!selectedTable && (
          <div className="flex-1 empty-state">
            <div className="empty-state__icon">
              <MapPin size={28} style={{ opacity: 0.35 }} />
            </div>
            <p className="empty-state__title">Ninguna mesa seleccionada</p>
            <p className="empty-state__body">Toca una mesa del mapa para ver su detalle</p>
          </div>
        )}

        {/* ── Con mesa seleccionada ── */}
        {selectedTable && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* ── Panel header ── */}
            <div className="panel-header">
              {/* Título + badge inline */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1E1E1E', fontFamily: MFONT, margin: 0 }}>
                  Mesa {selectedTable.name}
                </h2>
                <span className={(STATUS_CFG[selectedTable.status] ?? STATUS_CFG['DISPONIBLE']).badgeClass}>
                  {(STATUS_CFG[selectedTable.status] ?? STATUS_CFG['DISPONIBLE']).label}
                </span>
              </div>

              {/* Meta info — grid 2 cols */}
              {(selectedTable.status === 'OCUPADA' || selectedTable.status === 'CUENTA_SOLICITADA') && (
                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                  {/* Row 1 */}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#606060', fontFamily: MFONT }}>
                    <Utensils size={11} color="#606060" /> {selectedTable.zone} · Mesa para {selectedTable.capacity}
                  </span>
                  {selectedTable.guests != null && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#606060', fontFamily: MFONT }}>
                      <Users size={11} color="#606060" /> {selectedTable.guests} personas en mesa
                    </span>
                  )}
                  {/* Row 2 */}
                  {selectedTable.openedAtTimestamp && (
                    <>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#606060', fontFamily: MFONT }}>
                        <Clock size={11} color="#606060" /> Abierta a las {formatOpenTime(selectedTable.openedAtTimestamp)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#606060', fontFamily: MFONT }}>
                        <Timer size={11} color="#606060" /> {formatElapsed(selectedTable.openedAtTimestamp)}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Meta compacta para estados sin timer */}
              {(selectedTable.status === 'DISPONIBLE') && (
                <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#606060', fontFamily: MFONT }}>
                  <Utensils size={11} color="#606060" /> {selectedTable.zone} · Mesa para {selectedTable.capacity}
                </div>
              )}

              {/* Estado inhabilitada */}
              {selectedTable.status === 'INHABILITADA' && (
                <p style={{ marginTop: 6, fontSize: 12, color: '#606060', fontFamily: MFONT }}>Mesa no disponible para servicio</p>
              )}

              {/* Acciones de mesa — solo 2 botones outline */}
              {(selectedTable.status === 'OCUPADA' || selectedTable.status === 'CUENTA_SOLICITADA') && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  {selectedTable.status === 'OCUPADA' ? (
                    <SmallOutlineBtn onClick={() => setShowChangeMesa(true)} icon={<ArrowLeftRight size={13} />}>
                      Cambiar mesa
                    </SmallOutlineBtn>
                  ) : (
                    <SmallOutlineBtn onClick={revertToOcupada} icon={<RotateCcw size={13} />}>
                      Volver a Ocupada
                    </SmallOutlineBtn>
                  )}
                  <SmallOutlineBtn onClick={() => setShowCancelModal(true)} icon={<X size={13} />}>
                    Cancelar y liberar
                  </SmallOutlineBtn>
                </div>
              )}
              {selectedTable.status === 'INHABILITADA' && (
                <button onClick={() => setShowGestionarMesas(true)} className="link-blue" style={{ marginTop: 8, fontSize: 13 }}>
                  Habilitar en Gestión de mesas →
                </button>
              )}
            </div>

            {/* ── Contenido scrollable ── */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

              {/* ── INHABILITADA ── */}
              {selectedTable.status === 'INHABILITADA' && (
                <div className="flex flex-col items-center justify-center p-10 gap-5 h-full">
                  <div
                    className="w-20 h-20 rounded-[var(--radius-20)] flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--black-10)',
                      border: '2px dashed var(--black-40)',
                    }}
                  >
                    <X size={32} style={{ color: 'var(--black-40)' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: 'var(--black-40)' }}>Mesa inhabilitada</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--black-40)', lineHeight: 1.6 }}>
                      Esta mesa no está disponible para servicio. Puedes habilitarla desde Gestión de Mesas.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGestionarMesas(true)}
                    className="btn btn-cancel flex items-center gap-2"
                  >
                    <Settings size={14} /> Ir a Gestión de Mesas
                  </button>
                </div>
              )}

              {/* ── DISPONIBLE ── */}
              {selectedTable.status === 'DISPONIBLE' && (
                <div className="empty-state" style={{ height: '100%', justifyContent: 'center' }}>
                  <div className="empty-state__icon" style={{ width: 72, height: 72, background: 'var(--feedback-success-10)', border: '1.5px solid var(--feedback-success-100)', borderRadius: 16 }}>
                    <Utensils size={28} style={{ color: 'var(--feedback-success-150)' }} />
                  </div>
                  <p className="empty-state__title" style={{ fontSize: 15 }}>Mesa disponible</p>
                  <p className="empty-state__body">Capacidad para {selectedTable.capacity} personas</p>
                  <button onClick={handleIniciarPedido} className="btn btn-primary" style={{ marginTop: 8 }}>
                    <Plus size={16} /> Iniciar pedido
                  </button>
                </div>
              )}

              {/* ── OCUPADA / CUENTA_SOLICITADA ── */}
              {(selectedTable.status === 'OCUPADA'
                || selectedTable.status === 'CUENTA_SOLICITADA') && (
                <>
                  {/* Section: PEDIDO — label inline con botón Agregar */}
                  <div className="panel-section" style={{ paddingBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* Dot indicador de cambios pendientes */}
                        {selectedTable.status === 'OCUPADA' && isComandaSent && hasPendingChanges && (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFC217', display: 'inline-block', flexShrink: 0 }} />
                        )}
                        <span className="panel-section-label" style={{ marginBottom: 0 }}>
                          Pedido · {totalItems} ítem{totalItems !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {selectedTable.status === 'OCUPADA' && (
                        <button
                          onClick={() => setShowProductSelector(true)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            height: 32, padding: '0 12px', borderRadius: 6, border: 'none',
                            background: '#121E6C', color: '#fff',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: MFONT,
                          }}
                        >
                          <Plus size={12} color="#fff" /> Agregar productos
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Indicador de estado de comanda — compacto (igual que MesaProductSelector) */}
                  {selectedTable.items.length > 0 && isComandaSent && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 16px',
                      fontFamily: MFONT,
                      ...((hasPendingChanges || savedPendingResend)
                        ? { background: '#FFFBF0', color: '#B38900' }
                        : { background: '#F0FDF4', color: '#059669' }),
                    }}>
                      {hasPendingChanges
                        ? <><Clock size={12} /><span style={{ fontSize: 12, fontWeight: 400 }}>Cambios pendientes de confirmar en el pedido</span></>
                        : savedPendingResend
                          ? <><Clock size={12} /><span style={{ fontSize: 12, fontWeight: 400 }}>Cambios guardados — pendiente reenviar comanda a cocina</span></>
                          : <><CheckCircle2 size={12} /><span style={{ fontSize: 12, fontWeight: 400 }}>Todos los ítems enviados a cocina</span></>
                      }
                    </div>
                  )}

                  {/* Lista de ítems */}
                  {selectedTable.items.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px' }}>
                      <div className="empty-state__icon">
                        <Utensils size={24} style={{ opacity: 0.35 }} />
                      </div>
                      <p className="empty-state__title">Sin ítems en el pedido</p>
                      <p className="empty-state__body">Agrega productos para comenzar</p>
                    </div>
                  ) : (
                    <div style={{ padding: '0 24px' }}>
                      {selectedTable.items.map(item => (
                        <div
                          key={item.id}
                          className="panel-item"
                          style={{
                            position: 'relative',
                            padding: '10px 12px',
                            borderBottom: '1px solid #F0F0F0',
                            backgroundColor: hoveredItemId === item.id && selectedTable.status === 'OCUPADA' ? '#F8F8F8' : 'white',
                            cursor: selectedTable.status === 'OCUPADA' ? 'pointer' : 'default',
                            transition: 'background-color 150ms',
                          }}
                          onMouseEnter={() => { if (selectedTable.status === 'OCUPADA') setHoveredItemId(item.id); }}
                          onMouseLeave={() => setHoveredItemId(null)}
                          onClick={() => {
                            if (selectedTable.status !== 'OCUPADA') return;
                            setEditItemTarget(item);
                            setEditItemQty(item.quantity);
                            setEditItemPrice(item.price);
                            setEditItemDiscount(String(item.discount ?? 0));
                            setEditItemNote(item.note ?? '');
                          }}
                        >
                          {selectedTable.status === 'OCUPADA' ? (
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1E1E1E', fontFamily: 'var(--font-family, Montserrat, sans-serif)' }}>{item.name}</p>
                              <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 500, color: '#1E1E1E', fontFamily: 'var(--font-family, Montserrat, sans-serif)' }}>
                                ${(item.discount ? Math.round(item.price * (1 - item.discount/100)) * item.quantity : item.price * item.quantity).toLocaleString()}
                              </p>
                              {(item.discount ?? 0) > 0 && (
                                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#059669', fontFamily: 'var(--font-family, Montserrat, sans-serif)' }}>
                                  Desc. {item.discount}%
                                </p>
                              )}
                              {noteInputItemId === item.id ? (
                                <input
                                  autoFocus
                                  value={inlineNoteText}
                                  onChange={e => setInlineNoteText(e.target.value)}
                                  onBlur={() => { updateItemNote(item.id, inlineNoteText); setNoteInputItemId(null); }}
                                  onKeyDown={e => { if (e.key === 'Enter') { updateItemNote(item.id, inlineNoteText); setNoteInputItemId(null); } if (e.key === 'Escape') setNoteInputItemId(null); }}
                                  onClick={e => e.stopPropagation()}
                                  placeholder="Escribe una nota..."
                                  style={{ width: '100%', border: '1px solid #C7CBE0', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontFamily: "'Montserrat', sans-serif", marginTop: 4, outline: 'none', boxSizing: 'border-box' as const }}
                                />
                              ) : item.note ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }} onClick={e => e.stopPropagation()}>
                                  <MessageSquare size={11} style={{ color: '#606060', flexShrink: 0 }} />
                                  <span style={{ fontSize: 12, color: '#606060', fontFamily: "'Montserrat', sans-serif", flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.note}</span>
                                  <button onClick={e => { e.stopPropagation(); setInlineNoteText(item.note ?? ''); setNoteInputItemId(item.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#121E6C', flexShrink: 0 }}>
                                    <Pencil size={11} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={e => { e.stopPropagation(); setInlineNoteText(''); setNoteInputItemId(item.id); }}
                                  style={{ background: 'none', border: 'none', fontSize: 12, color: '#121E6C', fontWeight: 500, fontFamily: "'Montserrat', sans-serif", cursor: 'pointer', padding: '2px 0', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                                >
                                  <MessageSquare size={12} /> Agregar nota
                                </button>
                              )}
                            </div>
                          ) : (
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1E1E1E', fontFamily: 'var(--font-family, Montserrat, sans-serif)' }}>{item.name}</p>
                              <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 500, color: '#1E1E1E', fontFamily: 'var(--font-family, Montserrat, sans-serif)' }}>
                                ${(item.discount ? Math.round(item.price * (1 - item.discount/100)) * item.quantity : item.price * item.quantity).toLocaleString()}
                              </p>
                              {(item.discount ?? 0) > 0 && (
                                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#059669', fontFamily: 'var(--font-family, Montserrat, sans-serif)' }}>
                                  Desc. {item.discount}%
                                </p>
                              )}
                              {selectedTable.status !== 'CUENTA_SOLICITADA' && (
                                noteInputItemId === item.id ? (
                                  <input
                                    autoFocus
                                    value={inlineNoteText}
                                    onChange={e => setInlineNoteText(e.target.value)}
                                    onBlur={() => { updateItemNote(item.id, inlineNoteText); setNoteInputItemId(null); }}
                                    onKeyDown={e => { if (e.key === 'Enter') { updateItemNote(item.id, inlineNoteText); setNoteInputItemId(null); } if (e.key === 'Escape') setNoteInputItemId(null); }}
                                    placeholder="Escribe una nota..."
                                    style={{ width: '100%', border: '1px solid #C7CBE0', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontFamily: "'Montserrat', sans-serif", marginTop: 4, outline: 'none', boxSizing: 'border-box' as const }}
                                  />
                                ) : item.note ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                    <MessageSquare size={11} style={{ color: '#606060', flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: '#606060', lineHeight: '18px', fontFamily: "'Montserrat', sans-serif", flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.note}</span>
                                    <button onClick={() => { setInlineNoteText(item.note ?? ''); setNoteInputItemId(item.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#121E6C', flexShrink: 0 }}>
                                      <Pencil size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => { setInlineNoteText(''); setNoteInputItemId(item.id); }}
                                    style={{ background: 'none', border: 'none', fontSize: 12, color: '#121E6C', fontWeight: 500, fontFamily: "'Montserrat', sans-serif", cursor: 'pointer', padding: '2px 0', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                                  >
                                    <MessageSquare size={12} /> Agregar nota
                                  </button>
                                )
                              )}
                            </div>
                          )}

                          {selectedTable.status === 'OCUPADA' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <div className="qty-stepper">
                                <button className="qty-stepper__btn" onClick={e => { e.stopPropagation(); updateItemQty(item.id, -1); }}>
                                  <ChevronLeft size={13} />
                                </button>
                                <span className="qty-stepper__count">{item.quantity}</span>
                                <button className="qty-stepper__btn" onClick={e => { e.stopPropagation(); updateItemQty(item.id, 1); }}>
                                  <ChevronRight size={13} />
                                </button>
                              </div>
                              <button
                                onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                                className="btn-danger btn--icon"
                                style={{ color: 'var(--black-40)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--black-40)', flexShrink: 0, fontFamily: 'var(--font-family, Montserrat, sans-serif)' }}>× {item.quantity}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ════════════════════════════════════════════════════
                Footer: totales + CTAs
                ════════════════════════════════════════════════════ */}
            {selectedTable.status !== 'DISPONIBLE' && selectedTable.status !== 'INHABILITADA' && (
              <div style={{ flexShrink: 0, borderTop: '1px solid #F0F0F0', padding: '12px 16px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Totales */}
                {selectedTable.items.length > 0 && (
                  <div style={{ marginBottom: 4 }}>
                    <div className="panel-total-row">
                      <span>Subtotal</span><span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="panel-total-row">
                      <span>IVA 19%</span><span>${Math.round(tax).toLocaleString()}</span>
                    </div>
                    <div className="panel-grand-total">
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#1E1E1E' }}>Total</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#1E1E1E' }}>${Math.round(total).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* ── OCUPADA ── */}
                {selectedTable.status === 'OCUPADA' && selectedTable.items.length > 0 && (
                  <>
                    {!isMesaConfirmed ? (
                      /* STATE 1 — no confirmado */
                      <PanelCoralBtn onClick={handleConfirmarPedido}>
                        <Send size={16} color="#fff" /> Confirmar pedido
                      </PanelCoralBtn>
                    ) : hasPendingChanges ? (
                      /* STATE 4 — cambios pendientes sin guardar (confirmado o con comanda enviada) */
                      <PanelCoralBtn onClick={saveOrder}>
                        <Save size={16} color="#fff" /> Guardar cambios del pedido
                      </PanelCoralBtn>
                    ) : !isComandaSentForMesa ? (
                      /* STATE 2 — confirmado, comanda aún no enviada, sin cambios pendientes */
                      <>
                        <PanelCoralBtn onClick={() => setShowKitchenPreview(true)}>
                          <Send size={16} color="#fff" /> Enviar comanda
                        </PanelCoralBtn>
                        <button
                          onClick={requestBill}
                          style={{
                            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 14, fontWeight: 600, color: '#FF2947',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '6px 0', fontFamily: 'Montserrat, sans-serif',
                          }}
                        >
                          <Receipt size={14} color="#FF2947" /> Solicitar cuenta
                        </button>
                      </>
                    ) : savedPendingResend ? (
                      /* STATE 4b — guardado en POS, pendiente de reenviar a cocina */
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={requestBill}
                          style={{
                            flex: 1, height: 44, borderRadius: 8, cursor: 'pointer',
                            background: 'none', border: '1.5px solid #FF2947',
                            fontSize: 13, fontWeight: 700, color: '#FF2947',
                            fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 6,
                          }}
                        >
                          <Receipt size={14} color="#FF2947" /> Solicitar cuenta
                        </button>
                        <button
                          onClick={handleReenviarComanda}
                          style={{
                            flex: 1, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: '#FF2947', color: '#fff', fontSize: 13, fontWeight: 700,
                            fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 6,
                          }}
                        >
                          <RefreshCw size={14} color="#fff" /> Reenviar comanda
                        </button>
                      </div>
                    ) : (
                      /* STATE 3 — comanda enviada, sin cambios */
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={requestBill}
                          style={{
                            flex: 1, height: 44, borderRadius: 8, cursor: 'pointer',
                            background: 'none', border: '1.5px solid #FF2947',
                            fontSize: 13, fontWeight: 700, color: '#FF2947',
                            fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 6,
                          }}
                        >
                          <Receipt size={14} color="#FF2947" /> Solicitar cuenta
                        </button>
                        <button
                          onClick={handleReenviarComanda}
                          style={{
                            flex: 1, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: '#FF2947', color: '#fff', fontSize: 13, fontWeight: 700,
                            fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 6,
                          }}
                        >
                          <RefreshCw size={14} color="#fff" /> Reenviar comanda
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* ── CUENTA_SOLICITADA ── */}
                {selectedTable.status === 'CUENTA_SOLICITADA' && (
                  <>
                    <PanelCoralBtn onClick={() => setShowCheckout(true)}>
                      <DollarSign size={16} color="#fff" /> Cobrar mesa
                    </PanelCoralBtn>
                    {selectedTable.items.some(i => i.isSent) && (
                      <ReenviarLink onClick={handleReenviarComanda} />
                    )}
                  </>
                )}

              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}