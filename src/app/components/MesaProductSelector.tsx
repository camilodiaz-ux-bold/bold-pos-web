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
  Search, Plus, ChevronLeft, ChevronRight,
  Trash2, Receipt, Send, Users, Clock,
  Utensils, CheckCircle2, RefreshCw, Minus, X, Star,
  MessageSquare, Pencil, ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MesaTable } from './MesasView';
import { CAT_DEFS, CAT_PRODUCTS, ALL_CATALOG_PRODUCTS, FAVORITE_PRODUCTS } from '../data/productCatalog';
import type { CatalogProduct } from '../data/productCatalog';
import { useFavorites } from '../store/favoritesStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Catálogo — usa fuente compartida de 56 productos ────────────────────────

type Product = CatalogProduct & { image: string; category: string };

function toProduct(p: CatalogProduct): Product {
  const def = CAT_DEFS.find(c => c.id === p.catId)!;
  return { ...p, image: p.image ?? '', category: def.name };
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
  const [modalState,       setModalState]       = useState<ModalState>(null);

  const { favoriteIds, toggleFavorite } = useFavorites();

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

      {/* ══════════ BARRA DE CONTEXTO ══════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          height: 44, padding: '0 16px', flexShrink: 0,
          background: '#fff', borderBottom: '1px solid #F0F0F0',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        {/* ← Volver a Mesas */}
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 13, fontWeight: 500, color: '#121E6C',
            whiteSpace: 'nowrap', fontFamily: 'Montserrat, sans-serif',
          }}
        >
          <ChevronLeft size={14} /> Volver a Mesas
        </button>

        {/* Separador */}
        <span style={{ color: '#C7CBE0', fontSize: 13, userSelect: 'none' }}>·</span>

        {/* "Agregando a" */}
        <span style={{ fontSize: 13, fontWeight: 400, color: '#606060' }}>Agregando a</span>

        {/* Badge mesa */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#FF2947', borderRadius: 4, padding: '2px 8px',
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'Montserrat, sans-serif' }}>
            Mesa {table.name}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' }}>
            · {table.zone}
          </span>
        </div>

        {/* Hora */}
        {openTimeLabel && (
          <span style={{ fontSize: 12, fontWeight: 400, color: '#606060' }}>{openTimeLabel}</span>
        )}

        {/* Badge ítems en pedido */}
        {totalItems > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
            background: '#FFF0F2', border: '1px solid #FF2947', borderRadius: 10,
            padding: '1px 8px',
          }}>
            <ShoppingBag size={11} color="#FF2947" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FF2947', fontFamily: 'Montserrat, sans-serif' }}>
              {totalItems} ítem{totalItems !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ══════════ LAYOUT PRINCIPAL ═══════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Columna izquierda: catálogo de productos ────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--blue-10)]">

          {/* Buscador */}
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
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              Vista categorías — sidebar + bloques sin imagen
              ══════════════════════════════════════════════════════════════ */}
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
                          className="relative text-left flex flex-col rounded-[var(--radius-16)] transition-all active:scale-[0.97] hover:brightness-95 cursor-pointer"
                          style={{ backgroundColor: def.lightBg, padding: '10px 12px', gap: '4px', height: '96px' }}
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
                            style={{ color: 'var(--black-100)', fontSize: '15px', fontWeight: 600 }}
                          >
                            {item.name}
                          </span>
                          <span
                            style={{ color: 'var(--black-100)', fontSize: '13px', fontWeight: 500 }}
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
          </div>

        {/* ── Panel derecho: Pedido Mesa X ────────────────────────────────── */}
        <div style={{ width: 380, background: '#fff', borderLeft: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

          {/* Header del panel */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0', flexShrink: 0, fontFamily: 'Montserrat, sans-serif' }}>
            {/* Fila 1: título + badge estado */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1E1E1E', margin: 0 }}>
                Pedido Mesa {table.name}
              </h2>
              {table.status === 'OCUPADA' && (
                <span style={{
                  background: '#FFF0F2', border: '1px solid #FF2947', color: '#FF2947',
                  borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 700,
                  whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Montserrat, sans-serif',
                }}>OCUPADA</span>
              )}
              {table.status === 'CUENTA_SOLICITADA' && (
                <span style={{
                  background: '#FFF3D1', border: '1px solid #FFC217', color: '#A16B00',
                  borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 700,
                  whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Montserrat, sans-serif',
                }}>CUENTA SOLICITADA</span>
              )}
            </div>

            {/* Fila 2: meta en una línea */}
            <p style={{ fontSize: 12, fontWeight: 400, color: '#606060', margin: '4px 0 0 0', lineHeight: '18px' }}>
              {[
                table.zone,
                `Mesa para ${table.capacity}`,
                table.guests != null ? `${table.guests} en mesa` : null,
                openTimeLabel ?? null,
              ].filter(Boolean).join(' · ')}
            </p>

            {/* Fila 3: Volver al mapa */}
            <button
              onClick={onBack}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontSize: 12, fontWeight: 500, color: '#121E6C', marginTop: 6,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              <ChevronLeft size={12} /> Volver al mapa
            </button>

          </div>

          {/* Indicador de estado de comanda — compacto, fuera del header */}
          {table.items.length > 0 && isComandaSent && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', flexShrink: 0,
              fontFamily: 'Montserrat, sans-serif',
              ...(hasPendingChanges
                ? { background: '#FFFBF0', color: '#B38900' }
                : { background: '#F0FDF4', color: '#059669' }),
            }}>
              {hasPendingChanges
                ? <><Clock size={12} /><span style={{ fontSize: 12, fontWeight: 400 }}>Cambios pendientes de envío</span></>
                : <><CheckCircle2 size={12} /><span style={{ fontSize: 12, fontWeight: 400 }}>Todos los ítems enviados a cocina</span></>
              }
            </div>
          )}

          {/* Lista de ítems */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {table.items.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: '#C7CBE0', paddingBottom: 40 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F1F2F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Utensils size={24} style={{ opacity: 0.3 }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#606060', fontFamily: 'Montserrat, sans-serif' }}>Pedido vacío</p>
                  <p style={{ fontSize: 12, color: '#C7CBE0', marginTop: 4, fontFamily: 'Montserrat, sans-serif' }}>Selecciona productos del catálogo</p>
                </div>
              </div>
            ) : (
              <div>
                {table.items.map(item => (
                  <div key={item.id} style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0F0', fontFamily: 'Montserrat, sans-serif' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1E1E1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#FF2947', marginTop: 2 }}>
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>

                        {/* Nota */}
                        {item.note ? (
                          <button
                            onClick={() => setModalState({ mode: 'edit', itemId: item.id, itemName: item.name, note: item.note ?? '' })}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <Pencil size={11} style={{ color: '#606060', flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontStyle: 'italic', color: '#606060', fontFamily: 'Montserrat, sans-serif' }}>
                              {item.note}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setModalState({ mode: 'edit', itemId: item.id, itemName: item.name, note: '' })}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <Pencil size={11} style={{ color: '#606060' }} />
                            <span style={{ fontSize: 11, fontWeight: 400, color: '#606060', fontFamily: 'Montserrat, sans-serif' }}>
                              + Agregar nota
                            </span>
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {/* Qty controls */}
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #F0F0F0', borderRadius: 6, height: 28, overflow: 'hidden' }}>
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#606060' }}
                          >
                            <ChevronLeft size={13} />
                          </button>
                          <span style={{ minWidth: 28, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#606060' }}
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                        {/* Trash */}
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#C7CBE0', transition: 'color 150ms', marginLeft: 2 }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#FF2947')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#C7CBE0')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer: totales + CTAs */}
          <div style={{ borderTop: '1px solid #F0F0F0', flexShrink: 0, fontFamily: 'Montserrat, sans-serif' }}>
            {/* Totales */}
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#606060' }}>Subtotal</span>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#1E1E1E' }}>${subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#606060' }}>IVA 19%</span>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#1E1E1E' }}>${Math.round(tax).toLocaleString()}</span>
              </div>
              <div style={{ height: 1, background: '#F0F0F0', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1E1E1E' }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1E1E1E' }}>${Math.round(total).toLocaleString()}</span>
              </div>
            </div>

            {/* CTAs */}
            {table.items.length > 0 && (
              <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(!isComandaSent || hasPendingChanges) ? (
                  <>
                    {/* Estado A: comanda no enviada o hay cambios pendientes → Enviar comanda + link Solicitar */}
                    <button
                      onClick={() => onOpenKitchenPreview ? onOpenKitchenPreview() : sendToKitchen()}
                      style={{
                        width: '100%', height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: '#FF2947', color: '#fff', fontSize: 14, fontWeight: 700,
                        fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8,
                      }}
                    >
                      <Send size={16} /> Enviar comanda
                    </button>
                    <button
                      onClick={requestBill}
                      style={{
                        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 500, color: '#FF2947',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '6px 0', fontFamily: 'Montserrat, sans-serif',
                      }}
                    >
                      <Receipt size={14} color="#FF2947" /> Solicitar cuenta
                    </button>
                  </>
                ) : (
                  <>
                    {/* Estado B: comanda enviada sin cambios → Solicitar cuenta (coral) + link Reenviar */}
                    <button
                      onClick={requestBill}
                      style={{
                        width: '100%', height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: '#FF2947', color: '#fff', fontSize: 14, fontWeight: 700,
                        fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8,
                      }}
                    >
                      <Receipt size={16} /> Solicitar cuenta
                    </button>
                    <button
                      onClick={() => onOpenKitchenPreview ? onOpenKitchenPreview() : sendToKitchen()}
                      style={{
                        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 500, color: '#FF2947',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '6px 0', fontFamily: 'Montserrat, sans-serif',
                      }}
                    >
                      <RefreshCw size={13} color="#FF2947" /> Reenviar comanda
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}