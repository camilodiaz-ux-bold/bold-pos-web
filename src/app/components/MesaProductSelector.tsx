/**
 * MesaProductSelector
 * ─────────────────────────────────────────────────────────────────────────────
 * Vista de selección de productos contextualizada a una mesa ocupada.
 * Reutiliza el layout idéntico de Mostrador: búsqueda + categorías/grid.
 * NO modifica ningún flujo ni lógica de Mostrador.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useMemo } from 'react';
import {
  Search, LayoutGrid, Plus, ChevronLeft, ChevronRight,
  Trash2, Receipt, Send, ArrowLeft, Users, Clock,
  Utensils, CheckCircle2, RotateCcw, Minus, X, Star,
  MessageSquare, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { MesaTable } from './MesasView';
import { CAT_DEFS, CAT_PRODUCTS, ALL_CATALOG_PRODUCTS, FAVORITE_PRODUCTS } from '../data/productCatalog';
import type { CatalogProduct } from '../data/productCatalog';
import { useFavorites } from '../store/favoritesStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Icono Grid 3×3 ──────────────────────────────────────────────────────────

function Grid3Icon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1"  y="1"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="6"  y="1"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="11" y="1"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="1"  y="6"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="6"  y="6"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="11" y="6"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="1"  y="11" width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="6"  y="11" width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="11" y="11" width="4" height="4" rx="0.8" fill="currentColor" />
    </svg>
  );
}

// ─── Catálogo — usa fuente compartida de 56 productos ────────────────────────

type Product = CatalogProduct & { image: string; category: string };

function toProduct(p: CatalogProduct): Product {
  const def = CAT_DEFS.find(c => c.id === p.catId)!;
  return { ...p, image: p.image ?? '', category: def.name };
}

// Placeholder gris cuando el producto no tiene imagen
function ImagePlaceholderMesa({ catColor }: { catColor: string }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: `${catColor}15` }}
    >
      <div
        className="w-8 h-8 rounded-full opacity-30"
        style={{ backgroundColor: catColor }}
      />
    </div>
  );
}

// ─── Note chips ───────────────────────────────────────────────────────────────

const NOTE_CHIPS = [
  'Sin cebolla', 'Sin gluten', 'Término medio', 'Bien cocido',
  'Extra salsa', 'Para llevar', 'Sin sal', 'Poco picante',
];

// ─── Modal state types ────────────────────────────────────────────────────────

type ModalState =
  | { mode: 'add';  product: Product; quantity: number; note: string }
  | { mode: 'edit'; itemId: string;   itemName: string; note: string }
  | null;

// ─── Props ────────────────────────────────────────────────────────────────────

interface MesaProductSelectorProps {
  tableId:               string;
  tables:                MesaTable[];
  setTables:             React.Dispatch<React.SetStateAction<MesaTable[]>>;
  onBack:                () => void;
  onOpenKitchenPreview?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MesaProductSelector({
  tableId, tables, setTables, onBack, onOpenKitchenPreview,
}: MesaProductSelectorProps) {
  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Favoritos');
  const [addedFlash,       setAddedFlash]       = useState<number | null>(null);
  const [modalState,       setModalState]       = useState<ModalState>(null);

  const { favoriteIds, toggleFavorite } = useFavorites();

  // ── Vista toggle — default: Categorías ────────────────────────────────────
  const [mesaView,      setMesaView]      = useState<'categories' | 'grid'>('categories');
  const [activeCatMesa, setActiveCatMesa] = useState<string>('favoritos');

  // Mesa en vivo desde el estado compartido
  const table = tables.find(t => t.id === tableId);

  const isSearchingMesa  = searchQuery.trim().length > 0;
  const activeCatMesaDef = CAT_DEFS.find(c => c.id === activeCatMesa) ?? CAT_DEFS[0];

  // Productos Vista Categorías (búsqueda cruzada si hay query)
  const mesaCatProducts = useMemo(() => {
    let base: CatalogProduct[];
    if (activeCatMesa === 'favoritos') {
      base = ALL_CATALOG_PRODUCTS.filter(p => favoriteIds.has(p.id));
    } else if (isSearchingMesa) {
      base = ALL_CATALOG_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    } else {
      base = CAT_PRODUCTS[activeCatMesa] ?? [];
    }
    // Favoritos primero dentro de cada categoría
    if (!isSearchingMesa) {
      base = [
        ...base.filter(p => favoriteIds.has(p.id)),
        ...base.filter(p => !favoriteIds.has(p.id)),
      ];
    }
    return base;
  }, [activeCatMesa, searchQuery, isSearchingMesa, favoriteIds]);

  // Productos Vista Grid (filtro por categoría + búsqueda)
  const filteredProducts = useMemo(() => {
    const base = selectedCategory === 'Favoritos'
      ? ALL_CATALOG_PRODUCTS.filter(p => favoriteIds.has(p.id))
      : ALL_CATALOG_PRODUCTS.filter(p => p.catId === selectedCategory);
    const sorted = [
      ...base.filter(p => favoriteIds.has(p.id)),
      ...base.filter(p => !favoriteIds.has(p.id)),
    ];
    return sorted
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(toProduct);
  },
  [selectedCategory, searchQuery, favoriteIds]);

  // ── Acciones ──────────────────────────────────────────────────────────────

  const addItem = (product: Product, qty: number = 1, note: string = '') => {
    setTables(prev =>
      prev.map(t => {
        if (t.id !== tableId) return t;
        const existing = t.items.find(i => i.productId === product.id);
        if (existing) {
          return {
            ...t,
            items: t.items.map(i =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + qty, note: note || i.note }
                : i,
            ),
            hasPendingChanges: t.comandaSent ? true : t.hasPendingChanges,
          };
        }
        return {
          ...t,
          items: [
            ...t.items,
            {
              id: Math.random().toString(36).slice(2, 9),
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: qty,
              note: note || undefined,
              isSent: false,
              description: product.description || undefined,
            },
          ],
          hasPendingChanges: t.comandaSent ? true : t.hasPendingChanges,
        };
      }),
    );
    setAddedFlash(product.id);
    setTimeout(() => setAddedFlash(null), 700);
  };

  const updateQty = (itemId: string, delta: number) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id !== tableId) return t;
        return {
          ...t,
          items: t.items.map(i =>
            i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
          ),
          hasPendingChanges: t.comandaSent ? true : t.hasPendingChanges,
        };
      }),
    );
  };

  const removeItem = (itemId: string) => {
    setTables(prev =>
      prev.map(t =>
        t.id !== tableId ? t : {
          ...t,
          items: t.items.filter(i => i.id !== itemId),
          hasPendingChanges: t.comandaSent ? true : t.hasPendingChanges,
        },
      ),
    );
  };

  const updateNote = (itemId: string, note: string) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id !== tableId) return t;
        return {
          ...t,
          items: t.items.map(i =>
            i.id === itemId ? { ...i, note: note || undefined } : i,
          ),
          hasPendingChanges: t.comandaSent ? true : t.hasPendingChanges,
        };
      }),
    );
  };

  const sendToKitchen = () => {
    if (!table) return;
    const isResend = table.comandaSent;
    if (isResend && !table.hasPendingChanges) { toast.info('No hay cambios pendientes'); return; }
    const now = Date.now();
    setTables(prev =>
      prev.map(t =>
        t.id !== tableId ? t : {
          ...t,
          comandaSent: true,
          hasPendingChanges: false,
          firstComandaSentAt: t.firstComandaSentAt ?? now,
          items: t.items.map(i => ({ ...i, isSent: true, sentQuantity: i.quantity, sentNote: i.note })),
        },
      ),
    );
    toast.success(isResend ? 'Ajustes enviados a cocina' : `Comanda enviada a cocina — Mesa ${table.name}`);
  };

  const requestBill = () => {
    setTables(prev =>
      prev.map(t => t.id === tableId ? { ...t, status: 'CUENTA_SOLICITADA' as const } : t),
    );
    toast.info(`Cuenta solicitada — Mesa ${table?.name}`);
    onBack();
  };

  // ── Modal handlers ────────────────────────────────────────────────────────

  const openAddModal = (product: Product) => {
    setModalState({ mode: 'add', product, quantity: 1, note: '' });
  };

  const confirmAdd = () => {
    if (!modalState || modalState.mode !== 'add') return;
    addItem(modalState.product, modalState.quantity, modalState.note);
    setModalState(null);
  };

  const confirmEditNote = () => {
    if (!modalState || modalState.mode !== 'edit') return;
    updateNote(modalState.itemId, modalState.note);
    setModalState(null);
    toast.success('Nota actualizada');
    if (table?.comandaSent) toast.info('Recuerda reenviar la comanda a cocina');
  };

  const toggleChip = (chip: string) => {
    if (!modalState) return;
    const cur = modalState.note;
    const next = cur.includes(chip)
      ? cur.replace(chip, '').replace(/^[,\s]+|[,\s]+$/g, '').replace(/\s*,\s*,\s*/g, ', ').trim()
      : cur ? `${cur}, ${chip}` : chip;
    setModalState({ ...modalState, note: next });
  };

  const setModalQty = (delta: number) => {
    if (!modalState || modalState.mode !== 'add') return;
    setModalState({ ...modalState, quantity: Math.max(1, modalState.quantity + delta) });
  };

  if (!table) return null;

  const openTimeLabel = table.openedAtTimestamp
    ? new Date(table.openedAtTimestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    : null;

  // ── Estilos del banner según estado de la mesa ─────────────────────────────
  const bannerStyle = table.status === 'CUENTA_SOLICITADA'
    ? {
        bg:         '#FFF3D1',
        border:     '#FFC217',
        backColor:  '#A16B00',
        divider:    '#F0D98A',
        pillBg:     '#FDE89A',
        pillBorder: '#FFC217',
        dotColor:   '#A16B00',
        nameColor:  '#5C3D00',
        zoneColor:  '#A16B00',
        metaColor:  '#8A6200',
        clockColor: '#A16B00',
      }
    : {
        // OCUPADA (y cualquier otro estado — fallback coral)
        bg:         '#FEF1F3',
        border:     '#FCDFE2',
        backColor:  'var(--coral-100)',
        divider:    '#FCDFE2',
        pillBg:     '#FCDFE2',
        pillBorder: '#F48990',
        dotColor:   'var(--coral-100)',
        nameColor:  '#7A0A1C',
        zoneColor:  '#E4102E',
        metaColor:  '#C0364A',
        clockColor: '#E4102E',
      };

  const subtotal   = table.items.reduce((a, i) => a + i.price * i.quantity, 0);
  const tax        = subtotal * 0.19;
  const total      = subtotal + tax;
  const totalItems = table.items.reduce((a, i) => a + i.quantity, 0);
  const isComandaSent     = table.comandaSent ?? false;
  const hasPendingChanges = table.hasPendingChanges ?? false;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ══════════ MODAL ══════════════════════════════════════════════════════ */}
      {modalState && (
        <div className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalState(null)} />
          <div className="relative bg-white rounded-[var(--radius-20)] w-full max-w-sm overflow-hidden" style={{ boxShadow: '0px 8px 32px rgba(0,0,0,0.16)' }}>
            <div className="flex items-start justify-between p-5 pb-0">
              <div>
                <h3 className="text-[20px] font-bold text-[var(--black-100)]">
                  {modalState.mode === 'add' ? modalState.product.name : 'Editar nota'}
                </h3>
                {modalState.mode === 'add' && (
                  <p className="text-xs text-[var(--blue-100)] font-bold mt-0.5">${modalState.product.price.toLocaleString()}</p>
                )}
                {modalState.mode === 'edit' && (
                  <p className="text-xs text-[var(--black-40)] mt-0.5">{modalState.itemName}</p>
                )}
                {modalState.mode === 'add' && modalState.product.description && (
                  <p
                    className="mt-2 line-clamp-2 leading-snug"
                    style={{ color: 'var(--black-60)', fontSize: '14px' }}
                  >
                    {modalState.product.description}
                  </p>
                )}
              </div>
              <button onClick={() => setModalState(null)} className="btn--icon p-1.5 shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {modalState.mode === 'add' && (
                <div className="flex items-center justify-between bg-[var(--blue-10)] rounded-[var(--radius-12)] p-3">
                  <span className="text-xs font-semibold text-[var(--black-40)]">Cantidad</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setModalQty(-1)}
                      disabled={modalState.quantity <= 1}
                      className={cn('w-8 h-8 rounded-[var(--radius-12)] border-[1.5px] flex items-center justify-center transition-all border-[var(--black-10)]',
                        modalState.quantity > 1
                          ? 'text-[var(--black-60)] hover:bg-white hover:border-[var(--blue-100)] hover:text-[var(--blue-100)]'
                          : 'text-[var(--black-40)] cursor-not-allowed opacity-50',
                      )}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-lg font-bold text-[var(--black-100)]">{modalState.quantity}</span>
                    <button
                      onClick={() => setModalQty(1)}
                      className="w-8 h-8 rounded-[var(--radius-12)] border-[1.5px] border-[var(--black-10)] flex items-center justify-center text-[var(--black-60)] hover:bg-white hover:border-[var(--blue-100)] hover:text-[var(--blue-100)] transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              <div className="merlin-field">
                <label className="merlin-label">
                  Nota para cocina <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal' }}>(opcional)</span>
                </label>
                <textarea
                  className="merlin-input resize-none"
                  rows={2}
                  placeholder="Ej: Sin cebolla, extra picante..."
                  value={modalState.note}
                  onChange={e => setModalState({ ...modalState, note: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {NOTE_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => toggleChip(chip)}
                    className={cn('px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all',
                      modalState.note.includes(chip)
                        ? 'bg-[var(--blue-100)] text-white border-[var(--blue-100)]'
                        : 'bg-[var(--blue-10)] text-[var(--black-60)] border-[var(--black-10)] hover:border-[var(--blue-100)] hover:text-[var(--blue-100)]',
                    )}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setModalState(null)} className="btn btn-cancel flex-1">
                  Cancelar
                </button>
                <button
                  onClick={modalState.mode === 'add' ? confirmAdd : confirmEditNote}
                  className="btn btn-primary flex-1"
                >
                  {modalState.mode === 'add' ? 'Agregar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ BANNER DE CONTEXTO ═════════════════════════════════════════ */}
      <div
        className="flex items-center gap-3 px-6 h-11 shrink-0"
        style={{ backgroundColor: bannerStyle.bg, borderBottom: `1px solid ${bannerStyle.border}` }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold hover:opacity-75 transition-opacity whitespace-nowrap"
          style={{ color: bannerStyle.backColor }}
        >
          <ArrowLeft size={14} /> Volver a Mesas
        </button>
        <div className="w-px h-4 shrink-0" style={{ backgroundColor: bannerStyle.divider }} />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: bannerStyle.metaColor }}>Agregando a</span>
          <div
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border"
            style={{ backgroundColor: bannerStyle.pillBg, borderColor: bannerStyle.pillBorder }}
          >
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: bannerStyle.dotColor }} />
            <span className="text-xs font-semibold" style={{ color: bannerStyle.nameColor }}>Mesa {table.name}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: bannerStyle.zoneColor }}>· {table.zone}</span>
          </div>
          {openTimeLabel && (
            <span className="text-[11px] flex items-center gap-1" style={{ color: bannerStyle.clockColor }}>
              <Clock size={10} /> {openTimeLabel}
            </span>
          )}
        </div>
        {totalItems > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-orange-200 px-2.5 py-1 rounded-full shadow-sm">
              <CheckCircle2 size={12} className="text-orange-500" />
              <span className="text-[11px] font-bold text-orange-700">
                {totalItems} ítem{totalItems !== 1 ? 's' : ''} en pedido
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ LAYOUT PRINCIPAL ═══════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Columna izquierda: catálogo de productos ────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--blue-10)]">

          {/* Buscador + Toggle de vista */}
          <div className="flex items-center h-14 px-6 gap-4 bg-white border-b border-[var(--black-10)] shrink-0">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--black-40)]" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre o código de producto..."
                className="pos-input pl-10 pr-4 py-2 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Toggle Vista Categorías / Vista Grid */}
            <div className="ml-auto flex items-center gap-1 p-1 bg-[var(--blue-10)] rounded-[var(--radius-12)]">
              <button
                onClick={() => setMesaView('categories')}
                title="Vista Categorías"
                className={cn(
                  'p-1.5 rounded-[var(--radius-8)] transition-all',
                  mesaView === 'categories' ? 'bg-white shadow-sm text-[var(--blue-100)]' : 'text-[var(--black-40)] hover:text-[var(--black-60)]',
                )}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setMesaView('grid')}
                title="Vista Grid (con fotos)"
                className={cn(
                  'p-1.5 rounded-[var(--radius-8)] transition-all',
                  mesaView === 'grid' ? 'bg-white shadow-sm text-[var(--blue-100)]' : 'text-[var(--black-40)] hover:text-[var(--black-60)]',
                )}
              >
                <Grid3Icon size={16} />
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              VISTA CATEGORÍAS — dos columnas: sidebar + bloques sin imagen
              ══════════════════════════════════════════════════════════════ */}
          {mesaView === 'categories' && (
            <div className="flex-1 flex overflow-hidden">

              {/* Sidebar categorías — cat-item con color siempre visible */}
              <div className="cat-sidebar w-[200px] shrink-0 flex-col">

                {/* ── Favoritos — categoría especial (primera posición) ── */}
                {(() => {
                  const isFavActive = activeCatMesa === 'favoritos' && !isSearchingMesa;
                  return (
                    <button
                      onClick={() => { setActiveCatMesa('favoritos'); setSearchQuery(''); }}
                      className="cat-item w-full text-left flex items-center justify-between gap-2"
                      style={{
                        borderLeftColor: 'var(--black-100)',
                        background: isFavActive ? 'var(--black-10)' : '#fff',
                        color: 'var(--black-100)',
                        fontWeight: isFavActive ? 700 : 500,
                        padding: '12px 20px',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <span style={{ display: 'block', fontSize: 14 }}>Favoritos</span>
                        <span style={{ display: 'block', fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                          {favoriteIds.size} producto{favoriteIds.size !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Star size={12} style={{ flexShrink: 0 }} strokeWidth={1.5} />
                    </button>
                  );
                })()}

                {CAT_DEFS.map(cat => {
                  const isActive = cat.id === activeCatMesa && !isSearchingMesa;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCatMesa(cat.id); setSearchQuery(''); }}
                      className="cat-item w-full text-left"
                      style={{
                        borderLeftColor: cat.lineColor,
                        background: isActive ? cat.lightBg : '#fff',
                        color: cat.darkColor,
                        fontWeight: isActive ? 700 : 500,
                        padding: '12px 20px',
                      }}
                    >
                      <span style={{ display: 'block', fontSize: 14 }}>{cat.name}</span>
                      <span style={{ display: 'block', fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                        {CAT_PRODUCTS[cat.id]?.length ?? 0} productos
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bloques LightSpeed — sin imágenes, nombre grande + precio */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-3">

                {/* Encabezado — solo en modo búsqueda cruzada */}
                {isSearchingMesa && (
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <span className="text-sm font-semibold text-[var(--black-100)]">
                      {mesaCatProducts.length} resultado{mesaCatProducts.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-[var(--black-40)]">para «{searchQuery}»</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-auto text-xs font-semibold text-[var(--blue-100)] hover:underline"
                    >
                      Limpiar
                    </button>
                  </div>
                )}

                {mesaCatProducts.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {mesaCatProducts.map(item => {
                      const def     = CAT_DEFS.find(c => c.id === item.catId) ?? CAT_DEFS[0];
                      const inOrder = table.items.find(i => i.productId === item.id);
                      const qty     = inOrder?.quantity ?? 0;
                      const prod    = toProduct(item);
                      const isFav   = favoriteIds.has(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => openAddModal(prod)}
                          className="relative text-left flex flex-col justify-between p-4 min-h-[110px] rounded-[var(--radius-16)] transition-all active:scale-[0.97] hover:brightness-95 cursor-pointer"
                          style={{ backgroundColor: def.lightBg }}
                        >
                          {/* Badge cantidad en orden — esquina inferior derecha */}
                          {qty > 0 && (
                            <div
                              className="absolute bottom-2 right-2 min-w-[22px] h-5 px-1.5 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: 'var(--coral-100)' }}
                            >
                              {qty}
                            </div>
                          )}

                          {/* Estrella favorito — siempre visible, independiente del globo */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => toggleFavorite(item.id, e)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleFavorite(item.id, e as unknown as React.MouseEvent); }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer"
                            style={
                              isFav
                                ? { backgroundColor: '#FFFFFF', opacity: 1, boxShadow: '0px 1px 3px rgba(0,0,0,0.12)' }
                                : { backgroundColor: '#FFFFFF', opacity: 0.6 }
                            }
                            title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                          >
                            <Star
                              size={13}
                              strokeWidth={1.5}
                              style={{
                                display: 'block',
                                color: isFav ? 'var(--black-60)' : 'var(--black-40)',
                                fill: isFav ? 'var(--black-60)' : 'none',
                              }}
                            />
                          </div>

                          <span
                            className="leading-snug pr-8"
                            style={{ color: 'var(--black-100)', fontSize: '16px', fontWeight: 600, lineHeight: '24px' }}
                          >
                            {item.name}
                          </span>
                          <span
                            className="mt-3 block"
                            style={{ color: 'var(--black-100)', fontSize: '14px', fontWeight: 600, lineHeight: '18px' }}
                          >
                            ${item.price.toLocaleString('es-CO')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-[var(--black-40)] gap-3">
                    <Search size={40} className="opacity-20" />
                    <p className="font-medium text-sm">
                      {isSearchingMesa ? `Sin resultados para «${searchQuery}»` : 'Sin productos en esta categoría'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VISTA GRID — con fotos (51 con imagen, 5 placeholder)
              ══════════════════════════════════════════════════════════════ */}
          {mesaView === 'grid' && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {filteredProducts.map(product => {
                    const isFlashing = addedFlash === product.id;
                    const inOrder    = table.items.find(i => i.productId === product.id);
                    const qtyInOrder = inOrder?.quantity ?? 0;
                    const def        = CAT_DEFS.find(c => c.id === product.catId) ?? CAT_DEFS[0];

                    return (
                      <div
                        key={product.id}
                        onClick={() => openAddModal(product)}
                        className={cn(
                          'bg-white rounded-[var(--radius-12)] border p-2 flex flex-col gap-1.5 transition-all relative cursor-pointer active:scale-[0.97] overflow-hidden',
                          isFlashing
                            ? 'border-[var(--feedback-success-100)] shadow-lg shadow-emerald-100 scale-[1.02]'
                            : 'border-[var(--black-10)] hover:shadow-md hover:border-[var(--blue-100)]',
                        )}
                      >
                        <div className="relative h-[76px] rounded-[var(--radius-12)] overflow-hidden bg-[var(--blue-10)]">
                          {product.image ? (
                            <ImageWithFallback src={product.image} alt={product.name} className="object-cover w-full h-full" />
                          ) : (
                            <ImagePlaceholderMesa catColor={def.color} />
                          )}

                          {/* Indicador visual "+" */}
                          <div
                            className={cn(
                              'absolute bottom-1.5 right-1.5 rounded-full p-1 shadow-sm border transition-all',
                              isFlashing
                                ? 'bg-[var(--feedback-success-150)] border-emerald-500 text-white'
                                : 'bg-white border-[var(--black-10)] text-[var(--blue-100)]',
                            )}
                          >
                            <Plus size={12} />
                          </div>

                          {/* Estrella — toggle favorito (touch target independiente) */}
                          <button
                            onClick={(e) => toggleFavorite(product.id, e)}
                            className="absolute top-1.5 right-1.5 rounded-full p-1 bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-all hover:scale-110 active:scale-95"
                            title={favoriteIds.has(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                          >
                            <Star
                              size={11}
                              className={favoriteIds.has(product.id) ? 'fill-[var(--feedback-warning-100)] text-[var(--feedback-warning-100)]' : 'fill-transparent text-white'}
                              strokeWidth={favoriteIds.has(product.id) ? 1.5 : 2}
                            />
                          </button>

                          {qtyInOrder > 0 && (
                            <div className="absolute top-1.5 left-1.5 min-w-[18px] h-4 px-1 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                              {qtyInOrder}
                            </div>
                          )}
                        </div>

                        <div>
                          <p style={{ color: 'var(--blue-100)', fontSize: '11px', fontWeight: 600, lineHeight: '16px' }}>
                            ${product.price.toLocaleString()}
                          </p>
                          <h3 style={{ color: 'var(--black-100)', fontSize: '14px', fontWeight: 600, lineHeight: '20px' }} className="line-clamp-2">
                            {product.name}
                          </h3>
                        </div>
                        {/* Línea inferior de categoría — color Merlin */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-[3px]"
                          style={{ backgroundColor: def.lineColor }}
                        />
                      </div>
                    );
                  })}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-[var(--black-40)] gap-4">
                    <Search size={48} className="opacity-20" />
                    <p className="font-medium">Sin resultados para «{searchQuery}»</p>
                  </div>
                )}
              </div>

              {/* Pills de categorías — solo en Vista Grid */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-[var(--radius-16)] border border-[var(--black-10)] shadow-sm shrink-0">
                <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1">
                  <button
                    onClick={() => setSelectedCategory('Favoritos')}
                    className={cn(
                      'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
                      selectedCategory === 'Favoritos'
                        ? 'bg-[var(--feedback-warning-100)] text-white shadow-lg shadow-amber-500/30'
                        : 'bg-[var(--blue-10)] text-[var(--black-60)] hover:bg-[var(--feedback-warning-10)] hover:text-[var(--feedback-warning-100)]',
                    )}
                  >
                    <Star size={11} className={selectedCategory === 'Favoritos' ? 'fill-white' : 'fill-[var(--feedback-warning-100)]'} />
                    Favoritos
                  </button>
                  {CAT_DEFS.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        'px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all',
                        selectedCategory === cat.id ? 'text-white shadow-lg' : 'bg-[var(--blue-10)] text-[var(--black-60)] hover:opacity-80',
                      )}
                      style={selectedCategory === cat.id ? { backgroundColor: cat.color } : undefined}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Panel derecho: Pedido Mesa X ────────────────────────────────── */}
        <div className="w-[400px] bg-white border-l border-[var(--black-10)] flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)] shrink-0">

          <div className="p-6 border-b border-[var(--black-10)] shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[var(--black-100)]">Pedido Mesa {table.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-[var(--black-60)]">{table.zone}</span>
                  <span className="text-xs text-[var(--black-40)]">·</span>
                  <span className="text-xs text-[var(--black-60)]">Mesa para {table.capacity}</span>
                  {table.guests != null && (
                    <>
                      <span className="text-xs text-[var(--black-40)]">·</span>
                      <span className="text-xs flex items-center gap-1 text-[var(--black-60)]">
                        <Users size={11} /> {table.guests} en mesa
                      </span>
                    </>
                  )}
                  {openTimeLabel && (
                    <>
                      <span className="text-[var(--black-10)]">·</span>
                      <span className="text-xs text-[var(--black-40)] flex items-center gap-1">
                        <Clock size={11} /> {openTimeLabel}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {/* Badge de estado — refleja el status real de la mesa */}
              {table.status === 'OCUPADA' && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap shrink-0"
                  style={{ backgroundColor: '#FEF1F3', color: 'var(--coral-100)', borderColor: 'var(--coral-100)' }}
                >
                  OCUPADA
                </span>
              )}
              {table.status === 'CUENTA_SOLICITADA' && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap shrink-0"
                  style={{ backgroundColor: '#FFF3D1', color: '#A16B00', borderColor: '#FFC217' }}
                >
                  CUENTA SOLICITADA
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={onBack}
                className="btn btn-ghost btn--sm flex items-center gap-1.5"
              >
                <ArrowLeft size={12} /> Volver al mapa
              </button>
            </div>

            {table.items.length > 0 && isComandaSent && (
              <div className={cn(
                'flex items-center gap-1.5 mt-3 px-2.5 py-1.5 rounded-[var(--radius-12)] border text-[11px] font-bold',
                hasPendingChanges
                  ? 'bg-[var(--feedback-warning-10)] border-[var(--feedback-warning-10)] text-[var(--feedback-warning-150)]'
                  : 'bg-[var(--feedback-success-10)] border-[var(--feedback-success-100)] text-[var(--feedback-success-200)]',
              )}>
                {hasPendingChanges
                  ? <><RotateCcw size={11} /> Cambios pendientes de cocina</>
                  : <><CheckCircle2 size={11} /> Todos los ítems enviados a cocina</>
                }
              </div>
            )}
          </div>

          {/* Lista de ítems */}
          <div className="flex-1 overflow-y-auto p-5">
            {table.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--black-40)] pb-10">
                <div className="w-16 h-16 rounded-[var(--radius-20)] bg-[var(--blue-10)] flex items-center justify-center">
                  <Utensils size={28} className="opacity-20" />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-[var(--black-60)]">Pedido vacío</p>
                  <p className="text-xs mt-1 text-[var(--black-40)]">Selecciona productos del catálogo</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {table.items.map(item => (
                  <div key={item.id} className="py-3 border-b border-[var(--black-10)] last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[var(--black-100)] truncate">{item.name}</p>
                        <p className="text-xs text-[var(--blue-100)] font-bold mt-0.5">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>

                        {/* ── Nota: Estado B (con nota) o Estado A (sin nota) ── */}
                        {item.note ? (
                          /* Estado B — nota visible, clickeable para editar */
                          <button
                            onClick={() => setModalState({ mode: 'edit', itemId: item.id, itemName: item.name, note: item.note ?? '' })}
                            className="flex items-center gap-1 mt-1.5 w-full text-left group"
                            title="Toca para editar la nota"
                          >
                            <MessageSquare
                              size={11}
                              style={{ color: 'var(--black-60)', flexShrink: 0, marginTop: 1 }}
                            />
                            <span
                              className="truncate group-hover:underline"
                              style={{ fontSize: 14, color: 'var(--black-60)', lineHeight: '20px' }}
                            >
                              {item.note}
                            </span>
                          </button>
                        ) : (
                          /* Estado A — link para agregar nota */
                          <button
                            onClick={() => setModalState({ mode: 'edit', itemId: item.id, itemName: item.name, note: '' })}
                            className="flex items-center gap-1 mt-1.5 transition-opacity hover:opacity-70"
                          >
                            <Pencil size={10} style={{ color: 'var(--blue-100)' }} />
                            <span style={{ fontSize: 13, color: 'var(--blue-100)', fontWeight: 600 }}>
                              + Agregar nota
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-[var(--blue-10)] rounded-[var(--radius-12)] border border-[var(--black-10)]">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1.5 text-[var(--black-60)] hover:text-[var(--blue-100)] transition-colors">
                            <ChevronLeft size={14} />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold text-[var(--black-60)]">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1.5 text-[var(--black-60)] hover:text-[var(--blue-100)] transition-colors">
                            <ChevronRight size={14} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-[var(--black-40)] hover:text-[var(--coral-100)] transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--black-10)] bg-[var(--blue-10)] flex flex-col gap-4 shrink-0">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-[var(--black-40)] uppercase tracking-wide">
                <span>Subtotal</span><span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-[var(--black-40)] uppercase tracking-wide">
                <span>IVA 19%</span><span>${Math.round(tax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[24px] font-extrabold text-[var(--black-100)] mt-1 pt-2 border-t border-[var(--black-10)]">
                <span>TOTAL</span><span>${Math.round(total).toLocaleString()}</span>
              </div>
            </div>

            {/* Primario: Enviar / Reenviar comanda → abre preview modal */}
            {table.items.length > 0 && (
              hasPendingChanges ? (
                <button
                  onClick={() => onOpenKitchenPreview ? onOpenKitchenPreview() : sendToKitchen()}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Reenviar comanda
                </button>
              ) : !isComandaSent ? (
                <button
                  onClick={() => onOpenKitchenPreview ? onOpenKitchenPreview() : sendToKitchen()}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Enviar comanda
                </button>
              ) : (
                <div className="w-full py-3 rounded-[var(--radius-12)] border border-[var(--feedback-success-100)] bg-[var(--feedback-success-10)] text-sm font-semibold text-[var(--feedback-success-200)] flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Comanda enviada
                </div>
              )
            )}

            {/* Secundario: Solicitar cuenta */}
            {table.items.length > 0 && (
              <button
                onClick={requestBill}
                className="btn btn-ghost w-full flex items-center justify-center gap-1.5"
              >
                <Receipt size={15} /> Solicitar cuenta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}