/**
 * HomePage — /
 * Vista principal de Bold POS: Mesas y Mostrador.
 * El subMode (Mesas | Mostrador) viene del Outlet context de RootLayout.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import {
  LayoutGrid, Plus, ChevronLeft, ChevronRight,
  Trash2, CheckCircle2, Send, CreditCard,
  MessageSquare, X, RotateCcw, Timer, Pencil, Utensils,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import { MesasView } from '../components/MesasView';
import { CheckoutDrawer } from '../components/CheckoutDrawer';
import { MostradorCatalog, type MostradorProduct } from '../components/MostradorCatalog';
import type { RootOutletContext } from '../components/RootLayout';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'BORRADOR' | 'EN PREPARACIÓN' | 'LISTA' | 'ENTREGADA' | 'CERRADA';

interface OrderItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  isSent?: boolean;
  sentQuantity?: number;
  sentNote?: string;
  description?: string;
}

interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  items: OrderItem[];
  isPaid: boolean;
  requiresPreparation: boolean;
  createdAt: string;
  comandaSent?: boolean;
  hasPendingChanges?: boolean;
  firstComandaSentAt?: number;
  sentToKitchenAt?: number;
  frozenPreparationMs?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTE_CHIPS = [
  'Sin cebolla', 'Sin gluten', 'Término medio', 'Bien cocido',
  'Extra salsa', 'Para llevar', 'Sin sal', 'Poco picante',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatElapsedMs(fromTs: number, frozenMs?: number): string {
  const ms = frozenMs !== undefined ? frozenMs : Math.max(0, Date.now() - fromTs);
  const totalMin = Math.floor(ms / 60_000);
  if (totalMin < 1)  return '< 1 min';
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function toggleNoteChip(chip: string, note: string): string {
  if (note.includes(chip)) {
    return note.replace(chip, '').replace(/^[,\s]+|[,\s]+$/g, '').replace(/\s*,\s*,\s*/g, ', ').trim();
  }
  return note ? `${note}, ${chip}` : chip;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

function buildInitialOrders(): Order[] {
  const ago = (min: number) => Date.now() - min * 60_000;
  return [
    {
      id: '1', number: '001', status: 'BORRADOR',
      items: [
        { id: 'i1a', productId: 3, name: 'Pizza Pepperoni Med.',    price: 42000, quantity: 1 },
        { id: 'i1b', productId: 4, name: 'Iced Latte XL',           price: 12500, quantity: 2 },
      ],
      isPaid: false, requiresPreparation: true, createdAt: '10:30 AM',
    },
    {
      id: '2', number: '002', status: 'EN PREPARACIÓN',
      items: [
        { id: 'i2a', productId: 1, name: 'Hamb. Gourmet con Papas', price: 38000, quantity: 1, note: 'Sin cebolla', isSent: true },
        { id: 'i2b', productId: 7, name: 'Ensalada César',          price: 28000, quantity: 1, isSent: true },
        { id: 'i2c', productId: 8, name: 'Jugo Natural de Naranja', price: 8000,  quantity: 1, isSent: true },
      ],
      isPaid: false, requiresPreparation: true, createdAt: '10:25 AM',
      sentToKitchenAt: ago(18), comandaSent: true,
    },
    {
      id: '3', number: '003', status: 'LISTA',
      items: [
        { id: 'i3a', productId: 5, name: 'Pasta Carbonara',         price: 35000, quantity: 1, isSent: true },
        { id: 'i3b', productId: 4, name: 'Iced Latte XL',           price: 12500, quantity: 2, note: 'Con Stevia', isSent: true },
      ],
      isPaid: false, requiresPreparation: true, createdAt: '10:20 AM',
      sentToKitchenAt: ago(35), frozenPreparationMs: 28 * 60_000, comandaSent: true,
    },
    { id: '4', number: '004', status: 'BORRADOR', items: [], isPaid: false, requiresPreparation: true, createdAt: '10:35 AM' },
    { id: '5', number: '005', status: 'BORRADOR', items: [], isPaid: false, requiresPreparation: true, createdAt: '10:40 AM' },
    { id: '6', number: '006', status: 'BORRADOR', items: [], isPaid: false, requiresPreparation: true, createdAt: '10:45 AM' },
    { id: '7', number: '007', status: 'BORRADOR', items: [], isPaid: false, requiresPreparation: true, createdAt: '10:50 AM' },
  ];
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const Badge = ({ status }: { status: OrderStatus }) => {
  const styles: Record<OrderStatus, string> = {
    'BORRADOR':       'bg-[var(--black-10)] text-[var(--black-60)] border-[var(--black-10)]',
    'EN PREPARACIÓN': 'bg-[var(--feedback-warning-10)] text-[var(--feedback-warning-150)] border-[var(--feedback-warning-100)]',
    'LISTA':          'bg-[var(--feedback-success-10)] text-[var(--feedback-success-150)] border-[var(--feedback-success-100)]',
    'ENTREGADA':      'bg-[var(--blue-10)] text-[var(--blue-100)] border-[var(--black-10)]',
    'CERRADA':        'bg-[var(--black-10)] text-[var(--black-40)] border-transparent',
  };
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap', styles[status])}>
      {status}
    </span>
  );
};

// ─── EditNoteModal ────────────────────────────────────────────────────────────

function EditNoteModal({ itemName, initialNote, onSave, onClose }: {
  itemName: string; initialNote: string;
  onSave: (note: string) => void; onClose: () => void;
}) {
  const [note, setNote] = useState(initialNote);
  return (
    <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[var(--radius-20)] shadow-2xl p-6 w-full max-w-sm animate-in slide-in-from-bottom-4 sm:zoom-in duration-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-[var(--black-100)]">Editar nota</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--black-10)] rounded-[var(--radius-12)] text-[var(--black-40)]"><X size={16} /></button>
        </div>
        <p className="text-xs text-[var(--black-40)] mb-4">{itemName}</p>
        <textarea
          className="merlin-input resize-none"
          rows={3}
          placeholder="Nota para cocina (opcional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          autoFocus
        />
        <div className="flex flex-wrap gap-1.5 mt-3 mb-5">
          {NOTE_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setNote(prev => toggleNoteChip(chip, prev))}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all',
                note.includes(chip)
                  ? 'bg-[var(--blue-100)] text-white border-[var(--blue-100)]'
                  : 'bg-[var(--blue-10)] text-[var(--black-60)] border-[var(--black-10)] hover:border-[var(--blue-100)] hover:text-[var(--blue-100)]',
              )}
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[var(--radius-16)] border border-[var(--black-10)] text-sm font-bold text-[var(--black-60)] hover:bg-[var(--blue-10)] transition-colors">Cancelar</button>
          <button
            onClick={() => { onSave(note.trim()); onClose(); }}
            className="flex-1 py-2.5 rounded-[var(--radius-16)] bg-[var(--blue-100)] text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dot de estado dentro de cada tab ─────────────────────────────────────────

function StatusDot({ status, active }: { status: OrderStatus; active: boolean }) {
  const color = status === 'EN PREPARACIÓN' ? '#F59E0B' : status === 'LISTA' ? '#10B981' : '#3B82F6';
  return (
    <div
      style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        backgroundColor: active ? 'rgba(255,255,255,0.8)' : color,
      }}
    />
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const { subMode } = useOutletContext<RootOutletContext>();

  const [orders, setOrders]       = useState<Order[]>(buildInitialOrders);
  const [activeOrderId, setActiveOrderId] = useState('1');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editNoteModal, setEditNoteModal] = useState<{ itemId: string; itemName: string; note: string } | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Timer tick cada 30 s para actualizar banners EN PREPARACIÓN
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const activeOrder = useMemo(
    () => orders.find(o => o.id === activeOrderId) ?? orders[0] ?? null,
    [orders, activeOrderId],
  );

  const subtotal   = (activeOrder?.items ?? []).reduce((s, i) => s + i.price * i.quantity, 0);
  const tax        = subtotal * 0.19;
  const total      = subtotal + tax;

  // ── Order management ──────────────────────────────────────────────────────

  const selectOrder = (id: string) => setActiveOrderId(id);

  const addOrder = () => {
    const maxNum  = orders.reduce((max, o) => Math.max(max, parseInt(o.number) || 0), 0);
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    const newOrder: Order = {
      id: Math.random().toString(36).slice(2, 9),
      number: nextNum,
      status: 'BORRADOR',
      items: [],
      isPaid: false,
      requiresPreparation: true,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setOrders(prev => [...prev, newOrder]);
    setActiveOrderId(newOrder.id);
    toast.success(`Nueva orden #${nextNum} creada`);
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => {
      const next = prev.filter(o => o.id !== id);
      if (activeOrderId === id) setActiveOrderId(next[0]?.id ?? '');
      return next;
    });
    setShowDeleteConfirm(null);
    toast.error('Orden eliminada');
  };

  // ── Producto — agrega directamente al panel sin modal ─────────────────────

  const addProduct = (product: MostradorProduct) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== activeOrderId) return order;
      const existing = order.items.find(i => i.productId === product.id && !i.isSent);
      const newItems = existing
        ? order.items.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...order.items, {
            id:          Math.random().toString(36).slice(2, 9),
            productId:   product.id,
            name:        product.name,
            price:       product.price,
            quantity:    1,
            isSent:      false,
            description: product.description,
          }];
      return { ...order, items: newItems, hasPendingChanges: order.comandaSent ? true : order.hasPendingChanges };
    }));
  };

  // ── Item editing ───────────────────────────────────────────────────────────

  const updateQty = (itemId: string, delta: number) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== activeOrderId) return order;
      return {
        ...order,
        items: order.items.map(i => i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i),
        hasPendingChanges: order.comandaSent ? true : order.hasPendingChanges,
      };
    }));
  };

  const removeItem = (itemId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== activeOrderId) return order;
      return {
        ...order,
        items: order.items.filter(i => i.id !== itemId),
        hasPendingChanges: order.comandaSent ? true : order.hasPendingChanges,
      };
    }));
  };

  const updateNote = (itemId: string, note: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== activeOrderId) return order;
      return {
        ...order,
        items: order.items.map(i => i.id === itemId ? { ...i, note: note || undefined } : i),
        hasPendingChanges: order.comandaSent ? true : order.hasPendingChanges,
      };
    }));
  };

  // ── Confirmar orden — BORRADOR → EN PREPARACIÓN o LISTA ───────────────────

  const confirmOrder = () => {
    const now = Date.now();
    setOrders(prev => prev.map(order => {
      if (order.id !== activeOrderId) return order;
      const nextStatus: OrderStatus = order.requiresPreparation ? 'EN PREPARACIÓN' : 'LISTA';
      return {
        ...order,
        status:             nextStatus,
        comandaSent:        true,
        hasPendingChanges:  false,
        sentToKitchenAt:    now,
        firstComandaSentAt: order.firstComandaSentAt ?? now,
        frozenPreparationMs: order.requiresPreparation ? undefined : 0,
        items: order.items.map(i => ({ ...i, isSent: true, sentQuantity: i.quantity, sentNote: i.note })),
      };
    }));
    toast.success('Orden confirmada — comanda enviada a cocina');
  };

  // ── Marcar como lista ──────────────────────────────────────────────────────

  const markAsReady = () => {
    setOrders(prev => prev.map(order => {
      if (order.id !== activeOrderId) return order;
      const frozenMs = order.sentToKitchenAt ? Date.now() - order.sentToKitchenAt : 0;
      return { ...order, status: 'LISTA' as OrderStatus, frozenPreparationMs: frozenMs };
    }));
    toast.info('Orden marcada como lista');
  };

  // ── Reenviar comanda ───────────────────────────────────────────────────────

  const resendComanda = () => {
    setOrders(prev => prev.map(order => {
      if (order.id !== activeOrderId) return order;
      return {
        ...order,
        hasPendingChanges: false,
        items: order.items.map(i => ({ ...i, isSent: true, sentQuantity: i.quantity, sentNote: i.note })),
      };
    }));
    toast.success('Ajustes enviados a cocina');
  };

  if (!activeOrder) return null;

  // ── CheckoutDrawer: early return — reemplaza toda la vista (igual que MesasView) ──
  if (showCheckout) {
    return (
      <CheckoutDrawer
        title={`Orden #${activeOrder.number}`}
        meta={`${activeOrder.items.length} ítem${activeOrder.items.length !== 1 ? 's' : ''}`}
        items={activeOrder.items}
        hideSendToKitchen
        onClose={() => setShowCheckout(false)}
        onConfirmPay={(_method, _total) => {
          setOrders(prev => prev.map(o =>
            o.id === activeOrderId
              ? { ...o, items: [], status: 'BORRADOR' as OrderStatus, isPaid: false, comandaSent: false, hasPendingChanges: false, sentToKitchenAt: undefined, firstComandaSentAt: undefined, frozenPreparationMs: undefined }
              : o,
          ));
          setShowCheckout(false);
        }}
      />
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Modal: Confirmar eliminación ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-white rounded-[var(--radius-20)] shadow-2xl p-6 w-full max-w-sm animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-[var(--black-100)] mb-2">Eliminar orden</h3>
            <p className="text-sm text-[var(--black-40)] mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 rounded-[var(--radius-12)] border border-[var(--black-10)] text-sm font-bold text-[var(--black-60)] hover:bg-[var(--blue-10)] transition-colors">Cancelar</button>
              <button onClick={() => deleteOrder(showDeleteConfirm)} className="flex-1 py-2 rounded-[var(--radius-12)] bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Editar nota de ítem ── */}
      {editNoteModal && (
        <EditNoteModal
          itemName={editNoteModal.itemName}
          initialNote={editNoteModal.note}
          onSave={note => updateNote(editNoteModal.itemId, note)}
          onClose={() => setEditNoteModal(null)}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          BARRA DE TABS — solo visible en Mostrador
          Pills con scroll horizontal, dot de estado, botón Agregar orden
          ════════════════════════════════════════════════════════════════ */}
      {subMode === 'Mostrador' && (
        <div
          style={{
            background: 'white',
            borderBottom: '1px solid #E2E4ED',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* Área scrollable de pills */}
          <div
            className="no-scrollbar"
            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', minWidth: 0 }}
          >
            {orders.map(order => {
              const isActive = activeOrderId === order.id;
              const hasItems = order.items.length > 0;
              return (
                <button
                  key={order.id}
                  onClick={() => selectOrder(order.id)}
                  style={{
                    height: 36,
                    padding: '0 14px',
                    borderRadius: 20,
                    border: isActive ? 'none' : '1px solid #E2E4ED',
                    background: isActive ? '#121E6C' : 'white',
                    color: isActive ? 'white' : '#121E6C',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 150ms ease',
                    boxShadow: isActive ? '0 2px 8px rgba(18,30,108,0.20)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  #{order.number}
                  {hasItems && <StatusDot status={order.status} active={isActive} />}
                </button>
              );
            })}
          </div>

          {/* Divisor vertical */}
          <div style={{ width: 1, height: 20, background: '#E2E4ED', flexShrink: 0 }} />

          {/* Botón Agregar orden */}
          <button
            onClick={addOrder}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#121E6C',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              padding: '4px 2px',
            }}
          >
            <Plus size={14} /> Agregar orden
          </button>
        </div>
      )}

      {/* ── Área de contenido principal ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Vista Mesas ── */}
        {subMode === 'Mesas' ? (
          <MesasView />

        /* ── Vista Mostrador — sin órdenes ── */
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-6">
            <div className="w-24 h-24 rounded-full bg-[var(--black-10)] flex items-center justify-center">
              <LayoutGrid size={48} className="text-[var(--black-40)]" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-[var(--black-100)]">Mostrador listo</h2>
              <p className="text-[var(--black-40)] mt-1">No tienes órdenes activas.</p>
            </div>
            <button onClick={addOrder} className="px-6 py-3 bg-[var(--blue-100)] text-white rounded-[var(--radius-16)] font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg">
              <Plus size={20} /> Nueva orden
            </button>
          </div>

        /* ── Vista Mostrador — con órdenes ── */
        ) : (
          <>
            {/* ── Catálogo: click directo, sin modal ── */}
            <MostradorCatalog
              onAddProduct={addProduct}
              activeOrderItems={activeOrder.items}
            />

            {/* ════════════════════════════════════════════════════════════════
                PANEL DERECHO — Detalle de orden
                Estados y CTAs clonados de la lógica de Mesas
                ════════════════════════════════════════════════════════════ */}
            <div
              style={{
                width: 380,
                background: '#fff',
                borderLeft: '1px solid #F0F0F0',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {/* ── Header ── */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1E1E1E', margin: 0 }}>
                    Orden #{activeOrder.number}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge status={activeOrder.status} />
                    <button
                      onClick={() => setShowDeleteConfirm(activeOrder.id)}
                      title="Eliminar orden"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#C7CBE0', display: 'flex', alignItems: 'center', borderRadius: 6 }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#FF2947')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#C7CBE0')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Banner EN PREPARACIÓN — timer */}
                {activeOrder.status === 'EN PREPARACIÓN' && activeOrder.sentToKitchenAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 10px', background: '#FFFBF0', borderRadius: 8 }}>
                    <Timer size={12} style={{ color: '#B38900', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#B38900' }}>
                      En cocina: {formatElapsedMs(activeOrder.sentToKitchenAt)}
                    </span>
                  </div>
                )}

                {/* Banner LISTA — tiempo de preparación */}
                {activeOrder.status === 'LISTA' && activeOrder.frozenPreparationMs !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 10px', background: '#F0FDF4', borderRadius: 8 }}>
                    <CheckCircle2 size={12} style={{ color: '#059669', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#059669' }}>
                      Lista · {formatElapsedMs(0, activeOrder.frozenPreparationMs)} de preparación
                    </span>
                  </div>
                )}
              </div>

              {/* ── Lista de ítems ── */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {activeOrder.items.length === 0 ? (
                  /* Estado vacío */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, paddingBottom: 48 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F1F2F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Utensils size={24} color="#9CA3AF" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#6B7280', margin: 0 }}>Orden vacía</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Selecciona productos del catálogo</p>
                    </div>
                  </div>
                ) : (
                  activeOrder.items.map(item => (
                    <div
                      key={item.id}
                      style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0F0' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        {/* Nombre + precio + nota */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#1E1E1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                            {item.name}
                          </p>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#1E1E1E', margin: '2px 0 0' }}>
                            ${(item.price * item.quantity).toLocaleString('es-CO')}
                          </p>
                          {/* Nota inline */}
                          {item.note ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                              <MessageSquare size={11} style={{ color: '#606060', flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: '#606060', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.note}
                              </span>
                              <button
                                onClick={() => setEditNoteModal({ itemId: item.id, itemName: item.name, note: item.note ?? '' })}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#121E6C', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                              >
                                <Pencil size={11} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditNoteModal({ itemId: item.id, itemName: item.name, note: '' })}
                              style={{ background: 'none', border: 'none', fontSize: 12, color: '#121E6C', fontWeight: 500, fontFamily: 'Montserrat, sans-serif', cursor: 'pointer', padding: '2px 0', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                            >
                              <MessageSquare size={12} /> Agregar nota
                            </button>
                          )}
                        </div>

                        {/* Controles: qty + eliminar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #F0F0F0', borderRadius: 6, height: 28, overflow: 'hidden' }}>
                            <button onClick={() => updateQty(item.id, -1)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#606060' }}>
                              <ChevronLeft size={13} />
                            </button>
                            <span style={{ minWidth: 28, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#1E1E1E' }}>
                              {item.quantity}
                            </span>
                            <button onClick={() => updateQty(item.id, 1)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#606060' }}>
                              <ChevronRight size={13} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C7CBE0', display: 'flex', alignItems: 'center', transition: 'color 150ms' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#FF2947')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#C7CBE0')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ── Footer: totales + CTAs — solo si hay ítems ── */}
              {activeOrder.items.length > 0 && (
                <div style={{ borderTop: '1px solid #F0F0F0', flexShrink: 0 }}>
                  {/* Totales */}
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#606060' }}>Subtotal</span>
                      <span style={{ fontSize: 13, color: '#1E1E1E' }}>${subtotal.toLocaleString('es-CO')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#606060' }}>IVA 19%</span>
                      <span style={{ fontSize: 13, color: '#1E1E1E' }}>${Math.round(tax).toLocaleString('es-CO')}</span>
                    </div>
                    <div style={{ height: 1, background: '#F0F0F0', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#1E1E1E' }}>Total</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#1E1E1E' }}>${Math.round(total).toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  {/* CTAs por estado */}
                  <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>

                    {/* BORRADOR → Confirmar orden (coral, envía a cocina) */}
                    {activeOrder.status === 'BORRADOR' && (
                      <button
                        onClick={confirmOrder}
                        style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#FF2947', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                        <Send size={16} /> Confirmar orden
                      </button>
                    )}

                    {/* EN PREPARACIÓN → Marcar como lista + Reenviar comanda */}
                    {activeOrder.status === 'EN PREPARACIÓN' && (
                      <>
                        <button
                          onClick={markAsReady}
                          style={{ width: '100%', height: 44, borderRadius: 8, cursor: 'pointer', background: 'none', border: '1.5px solid #E2E4ED', fontSize: 14, fontWeight: 700, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                          <CheckCircle2 size={16} style={{ color: '#059669' }} /> Marcar como lista
                        </button>
                        <button
                          onClick={resendComanda}
                          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#121E6C', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '4px 0' }}
                        >
                          <RotateCcw size={13} /> Reenviar comanda
                        </button>
                      </>
                    )}

                    {/* LISTA / ENTREGADA → Cobrar (abre CheckoutDrawer) */}
                    {(activeOrder.status === 'LISTA' || activeOrder.status === 'ENTREGADA') && (
                      <button
                        onClick={() => setShowCheckout(true)}
                        style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#FF2947', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                        <CreditCard size={16} /> Cobrar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </>
  );
}
