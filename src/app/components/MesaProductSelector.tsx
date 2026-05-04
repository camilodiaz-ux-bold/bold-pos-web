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
  Search, ChevronLeft, ChevronRight,
  Trash2, Receipt, Send, Clock, Save,
  Utensils, CheckCircle2, RefreshCw, X, Star,
  Pencil, ShoppingBag, ChefHat, Check, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MesaTable, TableItem, PendingChange, PendingChangeType } from './MesasView';
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface MesaProductSelectorProps {
  tableId:               string;
  tables:                MesaTable[];
  setTables:             React.Dispatch<React.SetStateAction<MesaTable[]>>;
  onBack:                () => void;
  onOpenKitchenPreview?: () => void;
  confirmedMesas?:       Set<string>;
  comandaSentMesas?:     Set<string>;
  onConfirmarPedido?:    () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MesaProductSelector({
  tableId, tables, setTables, onBack, onOpenKitchenPreview,
  confirmedMesas, comandaSentMesas, onConfirmarPedido,
}: MesaProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // ── Drawer de edición de ítem (igual que MesasView) ───────────────────────
  const [editItemTarget,   setEditItemTarget]   = useState<TableItem | null>(null);
  const [editItemQty,      setEditItemQty]      = useState<number>(1);
  const [editItemDiscount, setEditItemDiscount] = useState<string>('0');
  const [editItemPrice,    setEditItemPrice]    = useState<number>(0);
  const [editItemNote,     setEditItemNote]     = useState<string>('');
  const [hoveredItemId,    setHoveredItemId]    = useState<string | null>(null);
  const [noteInputItemId,  setNoteInputItemId]  = useState<string | null>(null);
  const [inlineNoteText,   setInlineNoteText]   = useState('');

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
        return {
          ...t,
          items: [
            ...t.items,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: qty,
              note: note || undefined,
              isSent: false,
              description: product.description || undefined,
              catId: product.catId,
            },
          ],
          hasPendingChanges: (t.comandaSent || (confirmedMesas?.has(t.id) ?? false)) ? true : t.hasPendingChanges,
        };
      }),
    );
  };

  const updateQty = (itemId: string, delta: number) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id !== tableId) return t;
        const item   = t.items.find(i => i.id === itemId);
        const newQty = Math.max(1, (item?.quantity ?? 1) + delta);
        let newPendingChanges = t.pendingChanges ?? [];
        if (item && t.comandaSent && item.isSent) {
          const sentQty = item.sentQuantity ?? item.quantity;
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
          hasPendingChanges: (t.comandaSent || (confirmedMesas?.has(t.id) ?? false)) ? true : t.hasPendingChanges,
          pendingChanges:    newPendingChanges,
        };
      }),
    );
  };

  const removeItem = (itemId: string) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id !== tableId) return t;
        const item = t.items.find(i => i.id === itemId);
        let newPendingChanges = t.pendingChanges ?? [];
        if (item && t.comandaSent && item.isSent) {
          newPendingChanges = [
            ...newPendingChanges.filter(c => c.productId !== item.productId),
            {
              type:      'ELIMINAR' as PendingChangeType,
              productId: item.productId,
              name:      item.name,
              prevQty:   item.sentQuantity ?? item.quantity,
              newQty:    0,
              prevNote:  item.sentNote ?? '',
              newNote:   '',
            } as PendingChange,
          ];
        }
        return {
          ...t,
          items:             t.items.filter(i => i.id !== itemId),
          hasPendingChanges: (t.comandaSent || (confirmedMesas?.has(t.id) ?? false)) ? true : t.hasPendingChanges,
          pendingChanges:    newPendingChanges,
        };
      }),
    );
  };

  const saveOrder = () => {
    setTables(prev =>
      prev.map(t =>
        t.id !== tableId ? t : { ...t, hasPendingChanges: false, savedPendingResend: true },
      ),
    );
    toast.success('Cambios del pedido guardados');
  };

  const sendToKitchen = () => {
    if (!table) return;
    const isResend = table.comandaSent;
    if (isResend && !table.hasPendingChanges && !table.savedPendingResend) { toast.info('No hay cambios pendientes'); return; }
    const now = Date.now();
    setTables(prev =>
      prev.map(t =>
        t.id !== tableId ? t : {
          ...t,
          comandaSent:        true,
          hasPendingChanges:  false,
          savedPendingResend: false,
          pendingChanges:     [],
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

  // ── Guardar edición de ítem del drawer ───────────────────────────────────

  const saveItemEdit = () => {
    if (!editItemTarget) return;
    const itemId  = editItemTarget.id;
    const newNote = editItemNote.trim();
    setTables(prev =>
      prev.map(t => {
        if (t.id !== tableId) return t;
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
          hasPendingChanges: (t.comandaSent || (confirmedMesas?.has(t.id) ?? false)) ? true : t.hasPendingChanges,
          pendingChanges:    newPendingChanges,
        };
      }),
    );
    setEditItemTarget(null);
  };

  if (!table) return null;

  const openTimeLabel = table.openedAtTimestamp
    ? new Date(table.openedAtTimestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    : null;


  const subtotal   = table.items.reduce((a, i) => a + (i.discount ? Math.round(i.price * (1 - i.discount/100)) : i.price) * i.quantity, 0);
  const tax        = subtotal * 0.19;
  const total      = subtotal + tax;
  const totalItems = table.items.reduce((a, i) => a + i.quantity, 0);
  const isComandaSent      = table.comandaSent ?? false;
  const hasPendingChanges  = table.hasPendingChanges ?? false;
  const savedPendingResend = table.savedPendingResend ?? false;

  const isComandaSentForMesa = (comandaSentMesas?.has(tableId) ?? false) || (table.comandaSent ?? false);
  const isMesaConfirmed      = (confirmedMesas?.has(tableId) ?? false) || isComandaSentForMesa;

  // ── Render ────────────────────────────────────────────────────────────────
  const MFONT = 'Montserrat, sans-serif';
  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ══════════ DRAWER DE EDICIÓN DE ÍTEM ══════════════════════════════════ */}
      {editItemTarget && (() => {
        const catDef   = CAT_DEFS.find(c => c.id === editItemTarget.catId);
        const catColor = catDef?.color ?? '#606060';
        const catName  = catDef?.name  ?? '';
        const merlinInput: React.CSSProperties = {
          width: '100%', borderRadius: 8, border: '1px solid #E0E0E0',
          background: '#F5F5F5', fontSize: 15, padding: '10px 12px',
          outline: 'none', boxSizing: 'border-box', fontFamily: MFONT,
          transition: 'border-color 180ms', color: '#1E1E1E',
        };
        const labelStyle: React.CSSProperties = {
          fontSize: 12, fontWeight: 600, color: '#1E1E1E',
          fontFamily: MFONT, display: 'block', marginBottom: 6,
        };
        const totalCalc = editItemPrice * editItemQty;
        return (
          <>
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 1099 }}
              onClick={() => setEditItemTarget(null)}
            />
            <div style={{
              position: 'fixed', right: 0, top: 0, height: '100vh',
              width: 'min(549px, 100vw)',
              backgroundColor: 'white',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.14)',
              zIndex: 1100,
              display: 'flex', flexDirection: 'column',
              fontFamily: MFONT,
            }}>
              {/* Header 72px */}
              <div style={{
                height: 72, padding: '0 24px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '2px solid #F0F0F0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 8, height: 32, borderRadius: 4, backgroundColor: catColor, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {editItemTarget.name}
                    </p>
                    {catName && (
                      <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 500, color: catColor, fontFamily: MFONT }}>
                        {catName}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => setEditItemTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#606060', flexShrink: 0 }}>
                  <X size={22} />
                </button>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Cantidad</label>
                    <input type="number" min={1} value={editItemQty}
                      onChange={e => setEditItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                      style={merlinInput}
                      onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Descuento por ítem</label>
                    <select value={editItemDiscount} onChange={e => setEditItemDiscount(e.target.value)}
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
                  <p style={{ fontSize: 11, color: '#909090', fontFamily: MFONT, marginTop: 4 }}>
                    Precio unitario: ${editItemPrice.toLocaleString('es-CO')}
                  </p>
                </div>

                <div style={{ height: 1, background: '#F0F0F0' }} />

                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ChefHat size={13} color="#1E1E1E" /> Nota para cocina
                  </label>
                  <textarea value={editItemNote} onChange={e => setEditItemNote(e.target.value)}
                    placeholder="Ej: sin cebolla, término 3/4, salsa aparte..." rows={3}
                    style={{ ...merlinInput, minHeight: 80, resize: 'none', padding: '10px 12px', lineHeight: '1.5' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
                  />
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', gap: 12, padding: '16px 24px', borderTop: '1px solid #F0F0F0', flexShrink: 0 }}>
                <button
                  onClick={() => { removeItem(editItemTarget.id); setEditItemTarget(null); }}
                  style={{ flex: 1, height: 44, borderRadius: 8, border: '1.5px solid #FF2947', color: '#FF2947', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: MFONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Trash2 size={14} color="#FF2947" /> Eliminar del pedido
                </button>
                <button
                  onClick={saveItemEdit}
                  style={{ flex: 1, height: 44, borderRadius: 8, border: 'none', background: '#121E6C', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: MFONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Check size={14} color="#fff" /> Guardar cambios
                </button>
              </div>
            </div>
          </>
        );
      })()}

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
          <div style={{ display: 'flex', alignItems: 'center', height: 56, padding: '0 24px', gap: 16, background: 'white', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#909090" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Buscar por nombre o código de producto..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 8,
                  padding: '8px 12px 8px 36px', fontSize: 14,
                  fontFamily: 'Montserrat, sans-serif', color: '#1E1E1E',
                  backgroundColor: 'white', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
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
                        borderLeft: isFavActive ? '4px solid #121e6c' : '3px solid #121e6c',
                        backgroundColor: isFavActive ? 'rgba(18,30,108,0.08)' : 'transparent',
                        color: '#121e6c',
                        fontWeight: isFavActive ? 700 : 500,
                        padding: '10px 12px',
                        borderBottom: '1px solid #F0F0F0',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <span style={{ display: 'block', fontSize: 14 }}>Favoritos</span>
                        <span style={{ display: 'block', fontSize: 11, color: '#909090', marginTop: 2 }}>
                          {favoriteIds.size} producto{favoriteIds.size !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Star size={12} style={{ flexShrink: 0 }} strokeWidth={1.5} />
                    </button>
                  );
                })()}

                {CAT_DEFS.map((cat, index) => {
                  const isActive = cat.id === activeCatMesa && !isSearchingMesa;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCatMesa(cat.id); setSearchQuery(''); }}
                      className="cat-item w-full text-left"
                      style={{
                        borderLeft: isActive ? `4px solid ${cat.color}` : `3px solid ${cat.color}`,
                        backgroundColor: isActive ? `${cat.color}1A` : 'transparent',
                        color: isActive ? cat.darkColor : cat.color,
                        fontWeight: isActive ? 700 : 500,
                        padding: '10px 12px',
                        borderBottom: index < CAT_DEFS.length - 1 ? '1px solid #F0F0F0' : undefined,
                      }}
                    >
                      <span style={{ display: 'block', fontSize: 14 }}>{cat.name}</span>
                      <span style={{ display: 'block', fontSize: 11, color: '#909090', marginTop: 2 }}>
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
                      const qty     = table.items.filter(i => i.productId === item.id).reduce((s, i) => s + i.quantity, 0);
                      const prod    = toProduct(item);
                      const isFav   = favoriteIds.has(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => addItem(prod)}
                          className="text-left rounded-[var(--radius-16)] transition-all active:scale-[0.97] hover:brightness-95 cursor-pointer"
                          style={{
                            backgroundColor: def.lightBg,
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            padding: '10px 12px 10px 16px', position: 'relative', height: '96px',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Barra vertical izquierda de categoría (4px, full height) */}
                          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, backgroundColor: def.color }} />
                          {/* Estrella favorito — absoluta, no interfiere con el texto */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => toggleFavorite(item.id, e)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleFavorite(item.id, e as unknown as React.MouseEvent); }}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer"
                            style={{
                              position: 'absolute', top: '8px', right: '8px',
                              ...(isFav
                                ? { backgroundColor: '#FFFFFF', opacity: 1, boxShadow: '0px 1px 3px rgba(0,0,0,0.12)' }
                                : { backgroundColor: '#FFFFFF', opacity: 0.6 }),
                            }}
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

                          {/* Badge cantidad — color de categoría */}
                          {qty > 0 && (
                            <div
                              className="min-w-[22px] h-5 px-1.5 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                              style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: def.color }}
                            >
                              {qty}
                            </div>
                          )}

                          {/* Nombre — arriba, con padding para no solaparse con la estrella */}
                          <span
                            style={{
                              color: 'var(--black-100)', fontSize: '15px', fontWeight: 600,
                              lineHeight: '1.2', paddingRight: '24px',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}
                          >
                            {item.name}
                          </span>

                          {/* Precio — abajo */}
                          <span style={{ color: 'var(--black-100)', fontSize: '13px', fontWeight: 500, marginTop: 'auto' }}>
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
                fontSize: 13, fontWeight: 500, color: '#121E6C', marginTop: 6,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              <ChevronLeft size={14} /> Volver al mapa
            </button>

          </div>

          {/* Indicador de estado de comanda — compacto, fuera del header */}
          {table.items.length > 0 && isComandaSent && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', flexShrink: 0,
              fontFamily: 'Montserrat, sans-serif',
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
                  <div
                    key={item.id}
                    style={{
                      padding: '10px 16px', borderBottom: '1px solid #F0F0F0',
                      fontFamily: 'Montserrat, sans-serif',
                      backgroundColor: hoveredItemId === item.id ? '#F8F8F8' : 'white',
                      cursor: 'pointer', transition: 'background-color 150ms', position: 'relative',
                    }}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    onClick={() => {
                      setEditItemTarget(item);
                      setEditItemQty(item.quantity);
                      setEditItemPrice(item.price);
                      setEditItemDiscount(String(item.discount ?? 0));
                      setEditItemNote(item.note ?? '');
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1E1E1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#1E1E1E', marginTop: 2, margin: '2px 0 0' }}>
                          ${(item.discount ? Math.round(item.price * (1 - item.discount/100)) * item.quantity : item.price * item.quantity).toLocaleString()}
                        </p>
                        {(item.discount ?? 0) > 0 && (
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#059669', fontFamily: 'Montserrat, sans-serif' }}>
                            Desc. {item.discount}%
                          </p>
                        )}
                        {noteInputItemId === item.id ? (
                          <input
                            autoFocus
                            value={inlineNoteText}
                            onChange={e => setInlineNoteText(e.target.value)}
                            onBlur={() => { setTables(prev => prev.map(t => t.id !== tableId ? t : { ...t, items: t.items.map(i => i.id === item.id ? { ...i, note: inlineNoteText || undefined } : i) })); setNoteInputItemId(null); }}
                            onKeyDown={e => { if (e.key === 'Enter') { setTables(prev => prev.map(t => t.id !== tableId ? t : { ...t, items: t.items.map(i => i.id === item.id ? { ...i, note: inlineNoteText || undefined } : i) })); setNoteInputItemId(null); } if (e.key === 'Escape') setNoteInputItemId(null); }}
                            onClick={e => e.stopPropagation()}
                            placeholder="Escribe una nota..."
                            style={{ width: '100%', border: '1px solid #C7CBE0', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontFamily: 'Montserrat, sans-serif', marginTop: 4, outline: 'none', boxSizing: 'border-box' as const }}
                          />
                        ) : item.note ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }} onClick={e => e.stopPropagation()}>
                            <MessageSquare size={11} style={{ color: '#606060', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: '#606060', fontFamily: 'Montserrat, sans-serif', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.note}</span>
                            <button onClick={e => { e.stopPropagation(); setInlineNoteText(item.note ?? ''); setNoteInputItemId(item.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#121E6C', flexShrink: 0 }}>
                              <Pencil size={11} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); setInlineNoteText(''); setNoteInputItemId(item.id); }}
                            style={{ background: 'none', border: 'none', fontSize: 12, color: '#121E6C', fontWeight: 500, fontFamily: 'Montserrat, sans-serif', cursor: 'pointer', padding: '2px 0', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                          >
                            <MessageSquare size={12} /> Agregar nota
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {/* Lápiz — solo visible en hover */}
                        {hoveredItemId === item.id && (
                          <Pencil size={11} color="#C7CBE0" style={{ flexShrink: 0 }} />
                        )}
                        {/* Qty controls */}
                        <div
                          style={{ display: 'flex', alignItems: 'center', border: '1px solid #F0F0F0', borderRadius: 6, height: 28, overflow: 'hidden' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={e => { e.stopPropagation(); updateQty(item.id, -1); }}
                            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#606060' }}
                          >
                            <ChevronLeft size={13} />
                          </button>
                          <span style={{ minWidth: 28, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); updateQty(item.id, 1); }}
                            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#606060' }}
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                        {/* Trash */}
                        <button
                          onClick={e => { e.stopPropagation(); removeItem(item.id); }}
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
                {!isMesaConfirmed ? (
                  /* STATE 1 — no confirmado */
                  <button
                    onClick={onConfirmarPedido}
                    style={{
                      width: '100%', height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: '#FF2947', color: '#fff', fontSize: 14, fontWeight: 700,
                      fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 8,
                    }}
                  >
                    <Send size={16} /> Confirmar pedido
                  </button>
                ) : hasPendingChanges ? (
                  /* STATE 4 — cambios pendientes sin guardar (confirmado o con comanda enviada) */
                  <button
                    onClick={saveOrder}
                    style={{
                      width: '100%', height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: '#FF2947', color: '#fff', fontSize: 14, fontWeight: 700,
                      fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 8,
                    }}
                  >
                    <Save size={16} /> Guardar cambios del pedido
                  </button>
                ) : !isComandaSentForMesa ? (
                  /* STATE 2 — confirmado, comanda aún no enviada, sin cambios pendientes */
                  <>
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
                      onClick={() => onOpenKitchenPreview ? onOpenKitchenPreview() : sendToKitchen()}
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
                      onClick={() => onOpenKitchenPreview ? onOpenKitchenPreview() : sendToKitchen()}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}