/**
 * HomePage — /
 * ─────────────────────────────────────────────────────────────────────────────
 * Vista principal de Bold POS: Mesas y Mostrador.
 * Toda la lógica de órdenes vive aquí.
 * El subMode (Mesas | Mostrador) viene del Outlet context de RootLayout.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import {
  LayoutGrid, Plus, Printer, Settings, ChevronLeft, ChevronRight,
  MoreVertical, Trash2, CheckCircle2, Send, CreditCard,
  MessageSquare, ChevronDown, CheckCircle, X,
  Info, RotateCcw, Timer, Minus, AlertTriangle, Pencil,
  Utensils, History,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import { MesasView } from '../components/MesasView';
import { CheckoutDrawer } from '../components/CheckoutDrawer';
import { MostradorCatalog } from '../components/MostradorCatalog';
import { KitchenTicketPreviewModal, type TicketItem } from '../components/KitchenTicketPreviewModal';
import type { RootOutletContext } from '../components/RootLayout';

// ─── Utility ─────────────────────────────────────────────────────────────────

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
  customer?: string;
  isPaid: boolean;
  isDelivered?: boolean;
  requiresPreparation: boolean;
  createdAt: string;
  comandaSent?: boolean;
  hasPendingChanges?: boolean;
  firstComandaSentAt?: number;
  sentToKitchenAt?: number;
  frozenPreparationMs?: number;
}

interface Product {
  id:           number;
  name:         string;
  price:        number;
  category:     string;
  image:        string;
  description?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTE_CHIPS = [
  'Sin cebolla', 'Sin gluten', 'Término medio', 'Bien cocido',
  'Extra salsa', 'Para llevar', 'Sin sal', 'Poco picante',
];

// ─── Timer helpers ─────────────────────────────────────────────────────────────

function formatElapsedMs(fromTs: number, frozenMs?: number): string {
  const ms = frozenMs !== undefined ? frozenMs : Math.max(0, Date.now() - fromTs);
  const totalMin = Math.floor(ms / 60_000);
  if (totalMin < 1)  return '< 1 min';
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ─── Mock data factory ─────────────────────────────────────────────────────────

function buildInitialOrders(): Order[] {
  const ago = (min: number) => Date.now() - min * 60_000;
  return [
    {
      id: '1', number: '001', status: 'BORRADOR',
      items: [{ id: 'i1', productId: 3, name: 'Pizza Pepperoni Med.', price: 42000, quantity: 1 }],
      isPaid: false, requiresPreparation: true, createdAt: '10:30 AM',
    },
    {
      id: '2', number: '002', status: 'EN PREPARACIÓN',
      items: [{ id: 'i2', productId: 1, name: 'Hamb. Gourmet con Papas', price: 38000, quantity: 1, note: 'Sin cebolla', isSent: true }],
      isPaid: false, requiresPreparation: true, createdAt: '10:25 AM',
      sentToKitchenAt: ago(18), comandaSent: true, hasPendingChanges: false,
    },
    {
      id: '3', number: '003', status: 'LISTA',
      items: [{ id: 'i3', productId: 4, name: 'Iced Latte XL', price: 12500, quantity: 2, note: 'Con Stevia', isSent: true }],
      isPaid: false, requiresPreparation: true, createdAt: '10:20 AM',
      sentToKitchenAt: ago(35), frozenPreparationMs: 28 * 60_000, comandaSent: true,
    },
    { id: '4', number: '004', status: 'BORRADOR', items: [], isPaid: false, requiresPreparation: true, createdAt: '10:35 AM' },
    { id: '5', number: '005', status: 'BORRADOR', items: [], isPaid: false, requiresPreparation: true, createdAt: '10:40 AM' },
    { id: '6', number: '006', status: 'BORRADOR', items: [], isPaid: false, requiresPreparation: true, createdAt: '10:45 AM' },
    { id: '7', number: '007', status: 'BORRADOR', items: [], isPaid: false, requiresPreparation: true, createdAt: '10:50 AM' },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function toggleNoteChip(chip: string, note: string): string {
  if (note.includes(chip)) {
    return note.replace(chip, '').replace(/^[,\s]+|[,\s]+$/g, '').replace(/\s*,\s*,\s*/g, ', ').trim();
  }
  return note ? `${note}, ${chip}` : chip;
}

function AddProductModal({
  product, onConfirm, onClose,
}: {
  product: Product;
  onConfirm: (product: Product, qty: number, note: string) => void;
  onClose: () => void;
}) {
  const [quantity, setQty] = useState(1);
  const [note, setNote]   = useState('');

  return (
    <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[var(--radius-20)] shadow-2xl w-full max-w-sm animate-in slide-in-from-bottom-4 sm:zoom-in duration-200 overflow-hidden">
        <div className="flex items-start justify-between p-5 pb-0">
          <div>
            <h3 className="text-base font-bold text-[var(--black-100)]">{product.name}</h3>
            <p className="text-xs text-[var(--blue-100)] font-bold mt-0.5">${product.price.toLocaleString()}</p>
            {product.description && (
              <p className="mt-2 line-clamp-2 leading-snug" style={{ color: 'var(--black-60)', fontSize: '14px' }}>
                {product.description}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--black-10)] rounded-[var(--radius-12)] text-[var(--black-40)] shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Stepper */}
          <div className="flex items-center justify-between bg-[var(--blue-10)] rounded-[var(--radius-16)] p-3">
            <span className="text-xs font-bold text-[var(--black-40)]">Cantidad</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className={cn(
                  'w-8 h-8 rounded-full border flex items-center justify-center transition-all',
                  quantity > 1 ? 'border-[var(--black-10)] hover:border-[var(--blue-100)] hover:text-[var(--blue-100)]' : 'border-[var(--black-10)] text-[var(--black-40)] cursor-not-allowed',
                )}
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-lg font-black text-[var(--black-100)]">{quantity}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-8 h-8 rounded-full border border-[var(--black-10)] flex items-center justify-center hover:border-[var(--blue-100)] hover:text-[var(--blue-100)] transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-[var(--black-40)] mb-1.5 block">
              Notas <span className="font-medium text-[var(--black-40)]">(opcional)</span>
            </label>
            <textarea
              className="w-full resize-none rounded-[var(--radius-16)] border border-[var(--black-10)] bg-[var(--blue-10)] px-3 py-2.5 text-sm text-[var(--black-100)] placeholder-[var(--black-40)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-100)]/20 focus:border-[var(--blue-100)] transition-all"
              rows={2}
              placeholder="Ej: Sin cebolla, término medio..."
              value={note}
              onChange={e => setNote(e.target.value)}
              autoFocus
            />
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-1.5">
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

          {/* CTAs */}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-[var(--radius-16)] border border-[var(--black-10)] text-sm font-bold text-[var(--black-60)] hover:bg-[var(--blue-10)] transition-colors">
              Cancelar
            </button>
            <button
              onClick={() => { onConfirm(product, quantity, note); onClose(); }}
              className="flex-1 py-2.5 rounded-[var(--radius-16)] bg-[var(--blue-100)] text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-[var(--shadow-4)]"
            >
              Agregar a la orden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditNoteModal({
  itemName, initialNote, onSave, onClose,
}: {
  itemName: string;
  initialNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
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
          className="w-full resize-none rounded-[var(--radius-16)] border border-[var(--black-10)] bg-[var(--blue-10)] px-3 py-2.5 text-sm text-[var(--black-100)] placeholder-[var(--black-40)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-100)]/20 focus:border-[var(--blue-100)] transition-all"
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
                note.includes(chip) ? 'bg-[var(--blue-100)] text-white border-[var(--blue-100)]' : 'bg-[var(--blue-10)] text-[var(--black-60)] border-[var(--black-10)] hover:border-[var(--blue-100)] hover:text-[var(--blue-100)]',
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
            className="flex-1 py-2.5 rounded-[var(--radius-16)] bg-[var(--blue-100)] text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-[var(--shadow-4)]"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const { subMode } = useOutletContext<RootOutletContext>();

  const [orders, setOrders]         = useState<Order[]>(buildInitialOrders);
  const [activeOrderId, setActiveOrderId]     = useState('1');
  const [visibleOrderIds, setVisibleOrderIds] = useState<string[]>(['1', '2', '3', '4', '5']);

  const [showOrderList, setShowOrderList]       = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId]     = useState<string | null>(null);
  const [editNameValue, setEditNameValue]       = useState('');
  const [orderMenuId, setOrderMenuId]           = useState<string | null>(null);
  const [orderMenuPos, setOrderMenuPos]         = useState<{ top: number; left: number } | null>(null);
  const [showActionsMenu, setShowActionsMenu]   = useState(false);

  // Modals Mostrador
  const [addProductModal, setAddProductModal]             = useState<Product | null>(null);
  const [editNoteModal, setEditNoteModal]                 = useState<{ itemId: string; itemName: string; note: string } | null>(null);
  const [showMostradorCheckout, setShowMostradorCheckout] = useState(false);

  // Modal preview comanda cocina (Mostrador)
  const [showKitchenModal, setShowKitchenModal]         = useState(false);
  const [kitchenModalIsResend, setKitchenModalIsResend] = useState(false);

  // Tick para actualizar timers cada 60 s
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const activeOrder = useMemo(
    () => orders.find(o => o.id === activeOrderId) || orders[0] || null,
    [orders, activeOrderId],
  );

  const visibleOrders = useMemo(
    () => visibleOrderIds.map(id => orders.find(o => o.id === id)).filter((o): o is Order => !!o),
    [visibleOrderIds, orders],
  );

  const hiddenOrders = useMemo(
    () => orders.filter(o => !visibleOrderIds.includes(o.id)),
    [orders, visibleOrderIds],
  );

  const subtotal   = (activeOrder?.items ?? []).reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalItems = (activeOrder?.items ?? []).reduce((acc, i) => acc + i.quantity, 0);
  const tax        = subtotal * 0.19;
  const total      = subtotal + tax;

  // ── Order management ──────────────────────────────────────────────────────

  const selectOrder = (id: string) => {
    if (!visibleOrderIds.includes(id)) {
      const newVisible = [...visibleOrderIds];
      newVisible.shift();
      newVisible.push(id);
      setVisibleOrderIds(newVisible);
    }
    setActiveOrderId(id);
    setShowOrderList(false);
  };

  const deleteOrder = (id: string) => {
    const isVisible = visibleOrderIds.includes(id);
    const newOrders = orders.filter(o => o.id !== id);
    if (isVisible) {
      let newVisible = visibleOrderIds.filter(vid => vid !== id);
      const currentHidden = orders.filter(o => !visibleOrderIds.includes(o.id));
      if (currentHidden.length > 0) newVisible.push(currentHidden[0].id);
      setVisibleOrderIds(newVisible);
      if (activeOrderId === id) {
        const nextId = newVisible[newVisible.length - 1] || (newOrders[0]?.id || '');
        setActiveOrderId(nextId);
      }
    }
    setOrders(newOrders);
    setShowDeleteConfirm(null);
    setOrderMenuId(null);
    toast.error('Orden eliminada');
  };

  const addOrder = () => {
    const maxNum = orders.reduce((max, o) => Math.max(max, parseInt(o.number) || 0), 0);
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      number: nextNum,
      status: 'BORRADOR',
      items: [],
      isPaid: false,
      requiresPreparation: true,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setOrders([...orders, newOrder]);
    if (visibleOrderIds.length < 5) {
      setVisibleOrderIds([...visibleOrderIds, newOrder.id]);
      setActiveOrderId(newOrder.id);
    } else {
      toast.info(`Orden #${nextNum} agregada a "Ver órdenes"`);
    }
    toast.success(`Nueva orden #${nextNum} creada`);
  };

  const saveOrderName = () => {
    if (!editingOrderId || !editNameValue.trim()) return;
    setOrders(orders.map(o => o.id === editingOrderId ? { ...o, number: editNameValue } : o));
    setEditingOrderId(null);
    setEditNameValue('');
    toast.success('Nombre actualizado');
  };

  const openAddProductModal = (product: Product) => setAddProductModal(product);

  const confirmAddProduct = (product: Product, qty: number, note: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== activeOrderId) return order;
      const existing = order.items.find(i => i.productId === product.id && !i.isSent);
      const newItems = existing
        ? order.items.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + qty, note: note || i.note } : i)
        : [...order.items, {
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: qty,
            note: note || undefined,
            isSent: false,
            description: product.description || undefined,
          }];
      return {
        ...order,
        items: newItems,
        hasPendingChanges: order.comandaSent ? true : order.hasPendingChanges,
      };
    }));
  };

  const updateItemQuantity = (itemId: string, delta: number) => {
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

  const updateItemNote = (itemId: string, note: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== activeOrderId) return order;
      return {
        ...order,
        items: order.items.map(i => i.id === itemId ? { ...i, note: note || undefined } : i),
        hasPendingChanges: order.comandaSent ? true : order.hasPendingChanges,
      };
    }));
  };

  // ── Kitchen / Comanda ────────────────────────────────────────────────────

  const executeKitchenSend = () => {
    const now = Date.now();
    setOrders(prev => prev.map(order => {
      if (order.id !== activeOrderId) return order;
      return {
        ...order,
        status: 'EN PREPARACIÓN',
        requiresPreparation: true,
        comandaSent: true,
        hasPendingChanges: false,
        sentToKitchenAt:    order.sentToKitchenAt    ?? now,
        firstComandaSentAt: order.firstComandaSentAt ?? now,
        items: order.items.map(i => ({ ...i, isSent: true, sentQuantity: i.quantity, sentNote: i.note })),
      };
    }));
    toast.success('Comanda enviada a cocina');
  };

  const executeKitchenResend = () => {
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

  const markAsReady = () => {
    setOrders(prev => prev.map(order => {
      if (order.id !== activeOrderId) return order;
      const frozenMs = order.sentToKitchenAt ? Date.now() - order.sentToKitchenAt : undefined;
      return { ...order, status: 'LISTA', frozenPreparationMs: frozenMs };
    }));
    toast.info('Orden lista para entregar');
  };

  const markAsDelivered = () => {
    setOrders(prev => prev.map(o => o.id === activeOrderId ? { ...o, isDelivered: true, status: 'ENTREGADA' as OrderStatus } : o));
    toast.success('Orden marcada como entregada');
  };

  const deliverAndClose = () => {
    if (!activeOrder?.isPaid) {
      toast.error('La orden debe estar pagada antes de cerrarla');
      return;
    }
    let nextOrderId = '';
    setOrders(prev => {
      const updated = prev.map(order => order.id === activeOrderId ? { ...order, status: 'CERRADA' as OrderStatus } : order);
      const emptyBorrador = updated.find(o => o.status === 'BORRADOR' && o.items.length === 0);
      if (emptyBorrador) { nextOrderId = emptyBorrador.id; return updated; }
      const nextNum = (updated.length + 1).toString().padStart(3, '0');
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        number: nextNum,
        status: 'BORRADOR',
        items: [],
        isPaid: false,
        requiresPreparation: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      nextOrderId = newOrder.id;
      return [...updated, newOrder];
    });
    setActiveOrderId(nextOrderId);
    toast.success('Orden entregada y cerrada');
  };

  const handlePay = () => {
    setOrders(prev => {
      const order = prev.find(o => o.id === activeOrderId);
      if (!order) return prev;
      const updatedOrder = { ...order, isPaid: true };
      if (!order.requiresPreparation) {
        toast.success(`Pago procesado para orden #${order.number}`);
        setTimeout(() => {
          setOrders(current => {
            let nextId = '';
            const updated = current.map(o => o.id === activeOrderId ? { ...o, status: 'CERRADA' as OrderStatus } : o);
            const empty = updated.find(o => o.status === 'BORRADOR' && o.items.length === 0);
            if (empty) { nextId = empty.id; return updated; }
            const nextNum = (updated.length + 1).toString().padStart(3, '0');
            const newOrder: Order = { id: Math.random().toString(36).substr(2, 9), number: nextNum, status: 'BORRADOR', items: [], isPaid: false, requiresPreparation: false, createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            nextId = newOrder.id;
            setActiveOrderId(nextId);
            return [...updated, newOrder];
          });
        }, 800);
        return prev.map(o => o.id === activeOrderId ? updatedOrder : o);
      }
      toast.success(`Pago procesado para orden #${order.number}`);
      return prev.map(o => o.id === activeOrderId ? updatedOrder : o);
    });
  };

  // Guard: no orders
  if (!activeOrder) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ════════════════════════════════════════════════════
          Modal: Eliminar orden
          ════════════════════════════════════════════════════ */}
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

      {/* ════════════════════════════════════════════════════
          Modal: Editar nombre de orden
          ════════════════════════════════════════════════════ */}
      {editingOrderId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingOrderId(null)} />
          <div className="relative bg-white rounded-[var(--radius-20)] shadow-2xl p-6 w-full max-w-sm animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-[var(--black-100)] mb-4">Editar nombre</h3>
            <div className="mb-6">
              <label className="block text-xs font-bold text-[var(--black-40)] uppercase mb-2">Nombre de la orden</label>
              <input
                type="text"
                autoFocus
                className="w-full px-4 py-3 bg-[var(--blue-10)] border border-[var(--black-10)] rounded-[var(--radius-16)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-100)] focus:bg-white transition-all text-sm font-semibold"
                placeholder={`Orden #${orders.find(o => o.id === editingOrderId)?.number}`}
                value={editNameValue}
                onChange={e => setEditNameValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveOrderName()}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingOrderId(null)} className="flex-1 py-2 rounded-[var(--radius-12)] border border-[var(--black-10)] text-sm font-bold text-[var(--black-60)] hover:bg-[var(--blue-10)] transition-colors">Cancelar</button>
              <button onClick={saveOrderName} className="flex-1 py-2 rounded-[var(--radius-12)] bg-[var(--blue-100)] text-white text-sm font-bold hover:opacity-90 transition-colors shadow-lg shadow-[var(--shadow-4)]">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          Modal: Agregar ítem (Mostrador)
          ════════════════════════════════════════════════════ */}
      {addProductModal && (
        <AddProductModal
          product={addProductModal}
          onConfirm={confirmAddProduct}
          onClose={() => setAddProductModal(null)}
        />
      )}

      {/* ════════════════════════════════════════════════════
          Modal: Editar nota (Mostrador)
          ════════════════════════════════════════════════════ */}
      {editNoteModal && (
        <EditNoteModal
          itemName={editNoteModal.itemName}
          initialNote={editNoteModal.note}
          onSave={note => updateItemNote(editNoteModal.itemId, note)}
          onClose={() => setEditNoteModal(null)}
        />
      )}

      {/* ── Mostrador: order tabs sub-bar ── */}
      {subMode === 'Mostrador' && (
        <div className="bg-white border-b border-[var(--black-10)] flex items-center px-6 h-12 shrink-0 relative z-[100] shadow-sm">
          <div className="flex items-center h-full min-w-0">
            <div className="flex items-center gap-0.5 h-full">
              {visibleOrders.map(order => (
                <div
                  key={order.id}
                  className={cn(
                    'group px-4 h-[calc(100%-8px)] flex items-center border-b-2 cursor-pointer transition-all shrink-0 relative rounded-t-md',
                    activeOrderId === order.id
                      ? 'border-[var(--blue-100)] bg-[var(--blue-10)] text-[var(--blue-100)] font-bold'
                      : 'border-transparent text-[var(--black-40)] hover:text-[var(--black-60)] hover:bg-[var(--blue-10)]/70 font-semibold',
                  )}
                >
                  <div className="flex items-center h-full" onClick={() => selectOrder(order.id)}>
                    <span className="text-sm whitespace-nowrap">#{order.number}</span>
                    {order.items.length > 0 && <div className="ml-2 w-1.5 h-1.5 rounded-full bg-[var(--blue-100)] shrink-0" />}
                    {order.hasPendingChanges && <div className="ml-1 w-1.5 h-1.5 rounded-full bg-[var(--feedback-warning-100)] shrink-0" />}
                  </div>
                  <div className="relative ml-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setOrderMenuId(orderMenuId === order.id ? null : order.id);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setOrderMenuPos({ top: rect.bottom, left: rect.left });
                      }}
                      className={cn(
                        'p-1 rounded-[var(--radius-8)] hover:bg-[var(--blue-10)] transition-all',
                        activeOrderId === order.id || orderMenuId === order.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 text-[var(--black-40)]',
                      )}
                    >
                      <MoreVertical size={13} />
                    </button>
                    {orderMenuId === order.id && orderMenuPos && (
                      <>
                        <div className="fixed inset-0 z-[110] bg-transparent" onClick={() => setOrderMenuId(null)} />
                        <div
                          className="fixed w-44 bg-white rounded-[var(--radius-16)] shadow-2xl border border-[var(--black-10)] z-[200] overflow-hidden py-1 ring-1 ring-black/5 animate-in slide-in-from-top-2 duration-200"
                          style={{ top: orderMenuPos.top + 6, left: orderMenuPos.left - 128 }}
                        >
                          <button
                            onClick={e => { e.stopPropagation(); setEditingOrderId(order.id); setEditNameValue(order.number); setOrderMenuId(null); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-[var(--black-60)] hover:bg-[var(--blue-10)] flex items-center gap-2"
                          >
                            <Settings size={14} className="text-[var(--black-40)]" /> Editar nombre
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setShowDeleteConfirm(order.id); setOrderMenuId(null); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-[var(--coral-100)] hover:bg-[var(--coral-10)] flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Eliminar orden
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-px h-5 bg-[var(--black-10)] mx-3 shrink-0" />

            <div className="relative h-full flex items-center shrink-0">
              <button
                onClick={() => setShowOrderList(!showOrderList)}
                className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-12)] transition-all text-xs font-bold whitespace-nowrap', showOrderList ? 'bg-[var(--black-10)] text-[var(--blue-100)]' : 'hover:bg-[var(--blue-10)] text-[var(--black-40)]')}
              >
                Ver órdenes
                <span className={cn('flex items-center justify-center min-w-[16px] h-4 px-1 rounded-[var(--radius-8)] text-[9px] font-black', hiddenOrders.length > 0 ? 'bg-[var(--blue-10)] text-[var(--blue-100)]' : 'bg-[var(--black-10)] text-[var(--black-40)]')}>
                  {hiddenOrders.length}
                </span>
                <ChevronDown size={13} className={cn('transition-transform text-[var(--black-40)]', showOrderList && 'rotate-180')} />
              </button>
              {showOrderList && (
                <>
                  <div className="fixed inset-0 z-[110] bg-transparent" onClick={() => setShowOrderList(false)} />
                  <div className="fixed mt-1 w-52 bg-white rounded-[var(--radius-16)] shadow-2xl border border-[var(--black-10)] z-[200] overflow-hidden py-1 ring-1 ring-black/5 animate-in slide-in-from-top-2 duration-200"
                    style={{ top: 96, left: 'auto' }}
                  >
                    {orders.map(order => (
                      <button
                        key={order.id}
                        onClick={() => selectOrder(order.id)}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-xs hover:bg-[var(--blue-10)] flex items-center justify-between gap-2',
                          activeOrderId === order.id ? 'text-[var(--blue-100)] font-black bg-[var(--blue-10)]' : 'font-bold text-[var(--black-60)]',
                        )}
                      >
                        <span className="flex items-center gap-2">
                          #{order.number}
                          {order.items.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[var(--blue-100)]" />}
                          {order.hasPendingChanges && <div className="w-1.5 h-1.5 rounded-full bg-[var(--feedback-warning-100)]" />}
                        </span>
                        <Badge status={order.status} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={addOrder}
              className="ml-2 shrink-0 text-[var(--blue-100)] hover:text-[var(--blue-100)] text-xs font-bold flex items-center gap-1 transition-all underline underline-offset-4 decoration-2 decoration-[var(--blue-100)]/30 hover:decoration-[var(--blue-100)] whitespace-nowrap"
            >
              <Plus size={13} /> Agregar orden
            </button>
          </div>
        </div>
      )}

      {/* ── Content Area ── */}
      <div className="flex-1 flex overflow-hidden">
        {subMode === 'Mesas' ? (
          <MesasView />
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-6">
            <div className="w-24 h-24 rounded-full bg-[var(--black-10)] flex items-center justify-center">
              <LayoutGrid size={48} className="text-[var(--black-40)]" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-[var(--black-100)]">Mostrador listo</h2>
              <p className="text-[var(--black-40)] mt-1">No tienes órdenes activas en este momento.</p>
            </div>
            <button onClick={addOrder} className="px-6 py-3 bg-[var(--blue-100)] text-white rounded-[var(--radius-16)] font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[var(--shadow-4)]">
              <Plus size={20} /> Nueva orden
            </button>
          </div>
        ) : (
          <>
            {/* ── Columna central: catálogo ── */}
            <MostradorCatalog
              onAddProduct={openAddProductModal}
              activeOrderItems={activeOrder.items}
            />

            {/* ── Columna derecha: Panel de orden ── */}
            <div className="w-[400px] bg-white border-l border-[var(--black-10)] flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)] relative shrink-0">

              {/* Panel header */}
              <div className="p-6 border-b border-[var(--black-10)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--black-100)]">Detalle de orden</h2>
                    <p className="text-xs text-[var(--black-40)]">Orden #{activeOrder.number}</p>
                  </div>
                  <Badge status={activeOrder.status} />
                </div>

                {/* Banner EN PREPARACIÓN */}
                {activeOrder.status === 'EN PREPARACIÓN' && activeOrder.sentToKitchenAt && (
                  <div className="flex items-center gap-2 bg-[var(--feedback-warning-10)] border border-[var(--feedback-warning-100)] px-3 py-2 rounded-[var(--radius-16)]">
                    <Timer size={13} className="text-[var(--feedback-warning-150)] shrink-0" />
                    <span className="text-[11px] text-[var(--feedback-warning-150)] font-bold flex-1">
                      En cocina: {formatElapsedMs(activeOrder.sentToKitchenAt)}
                    </span>
                    {activeOrder.hasPendingChanges ? (
                      <span className="text-[10px] text-[var(--feedback-warning-150)] font-bold flex items-center gap-1">
                        <RotateCcw size={9} /> Cambios pendientes
                      </span>
                    ) : (
                      <button
                        onClick={() => toast.info('Comanda enviada a impresión')}
                        className="text-[10px] text-[var(--feedback-warning-150)] hover:text-[var(--feedback-warning-200, var(--feedback-warning-150))] font-bold hover:underline flex items-center gap-1"
                      >
                        <Printer size={9} /> Reimprimir
                      </button>
                    )}
                  </div>
                )}

                {/* Timer LISTA congelado */}
                {activeOrder.status === 'LISTA' && activeOrder.frozenPreparationMs !== undefined && (
                  <div className="flex items-center gap-2 bg-[var(--feedback-success-10)] border border-[var(--feedback-success-100)] px-3 py-2 rounded-[var(--radius-16)]">
                    <CheckCircle2 size={14} className="text-[var(--feedback-success-150)] shrink-0" />
                    <p className="text-[11px] text-[var(--feedback-success-200)] font-bold">
                      Tiempo total preparación: {formatElapsedMs(0, activeOrder.frozenPreparationMs)}
                    </p>
                  </div>
                )}

                {/* Acciones de cabecera */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 border border-[var(--black-10)] rounded-[var(--radius-12)] text-xs font-bold text-[var(--black-60)] flex items-center justify-center gap-2 hover:bg-[var(--blue-10)]">
                    <Info size={14} /> Consumidor final
                  </button>
                  {activeOrder.status === 'BORRADOR' && (
                    <button
                      disabled={activeOrder.items.length === 0}
                      onClick={() => { setKitchenModalIsResend(false); setShowKitchenModal(true); }}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-[var(--radius-12)] text-xs font-bold flex items-center justify-center gap-2 border transition-all',
                        activeOrder.items.length === 0
                          ? 'border-[var(--black-10)] text-[var(--black-40)] cursor-not-allowed'
                          : 'border-[var(--blue-100)] text-[var(--blue-100)] hover:bg-[var(--blue-10)]',
                      )}
                    >
                      <Send size={13} /> Enviar comanda
                    </button>
                  )}
                  {activeOrder.status === 'EN PREPARACIÓN' && activeOrder.hasPendingChanges && (
                    <button
                      onClick={() => { setKitchenModalIsResend(true); setShowKitchenModal(true); }}
                      className="flex-1 py-2 px-3 rounded-[var(--radius-12)] text-xs font-bold border border-amber-400 text-[var(--feedback-warning-150)] hover:bg-[var(--feedback-warning-10)] flex items-center justify-center gap-2 transition-all"
                    >
                      <RotateCcw size={13} /> Reenviar
                    </button>
                  )}
                  <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    className="p-2 border border-[var(--black-10)] rounded-[var(--radius-12)] text-[var(--black-60)] hover:bg-[var(--blue-10)] relative"
                  >
                    <MoreVertical size={16} />
                    {showActionsMenu && (
                      <>
                        <div className="fixed inset-0 z-[110]" onClick={() => setShowActionsMenu(false)} />
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-[var(--radius-16)] shadow-2xl border border-[var(--black-10)] z-[120] py-1 overflow-hidden animate-in fade-in zoom-in duration-100 origin-top-right">
                          <button
                            onClick={() => { toast.info('Comanda enviada a impresión'); setShowActionsMenu(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-[var(--black-60)] hover:bg-[var(--blue-10)] flex items-center gap-2"
                          >
                            <Printer size={14} className="text-[var(--black-40)]" /> Reimprimir comanda
                          </button>
                          <button
                            onClick={() => { toast.info('Cuenta enviada a impresión'); setShowActionsMenu(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-[var(--black-60)] hover:bg-[var(--blue-10)] flex items-center gap-2"
                          >
                            <Printer size={14} className="text-[var(--black-40)]" /> Reimprimir cuenta
                          </button>
                          <div className="h-px bg-[var(--blue-10)] my-1" />
                          <button
                            onClick={() => { setShowDeleteConfirm(activeOrder.id); setShowActionsMenu(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-[var(--coral-100)] hover:bg-[var(--coral-10)] flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Eliminar orden
                          </button>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {activeOrder.items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-[var(--black-40)] gap-4 mt-20">
                    <div className="w-16 h-16 rounded-full bg-[var(--blue-10)] flex items-center justify-center">
                      <Utensils size={32} className="opacity-20" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[var(--black-60)]">No hay productos aún</p>
                      <p className="text-xs">Agrega productos para comenzar</p>
                    </div>
                  </div>
                ) : (
                  activeOrder.items.map(item => (
                    <div key={item.id} className="group flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-[var(--black-100)] leading-tight">{item.name}</h4>
                          </div>
                          <p className="text-xs text-[var(--blue-100)] font-bold mt-0.5">${(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-[var(--blue-10)] rounded-[var(--radius-12)] border border-[var(--black-10)]">
                            <button onClick={() => updateItemQuantity(item.id, -1)} className="p-1.5 hover:text-[var(--blue-100)] transition-colors">
                              <ChevronLeft size={16} />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-[var(--black-100)]">{item.quantity}</span>
                            <button onClick={() => updateItemQuantity(item.id, 1)} className="p-1.5 hover:text-[var(--blue-100)] transition-colors">
                              <ChevronRight size={16} />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-[var(--black-40)] hover:text-[var(--coral-100)] transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Nota del ítem */}
                      <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-[var(--black-10)] mt-1">
                        {item.note ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-start gap-2">
                              <MessageSquare size={12} className="text-[var(--blue-100)] mt-0.5 shrink-0" />
                              <p className="text-[11px] text-[var(--black-60)] font-medium line-clamp-2">{item.note}</p>
                            </div>
                            <button
                              onClick={() => setEditNoteModal({ itemId: item.id, itemName: item.name, note: item.note ?? '' })}
                              className="text-[10px] text-[var(--blue-100)] font-bold hover:underline w-fit flex items-center gap-1"
                            >
                              <Pencil size={9} /> Editar nota
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditNoteModal({ itemId: item.id, itemName: item.name, note: '' })}
                            className="text-[10px] text-[var(--black-40)] hover:text-[var(--blue-100)] flex items-center gap-1 w-fit transition-colors"
                          >
                            <Plus size={10} /> Agregar nota
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer: totales + CTAs */}
              <div className="p-6 bg-[var(--blue-10)] border-t border-[var(--black-10)] flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-[var(--black-40)] uppercase tracking-wider">
                    <span>Subtotal</span><span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-[var(--black-40)] uppercase tracking-wider">
                    <span>IVA 19%</span><span>${Math.round(tax).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-[var(--black-100)] mt-1 pt-2 border-t border-[var(--black-10)]">
                    <span>TOTAL</span><span>${Math.round(total).toLocaleString()}</span>
                  </div>
                  {activeOrder.isPaid && (
                    <div className="flex items-center gap-2 text-[var(--feedback-success-200)] text-xs font-bold bg-[var(--feedback-success-10)] border border-[var(--feedback-success-100)] p-2 rounded-[var(--radius-12)] mt-1">
                      <CheckCircle size={14} /> ORDEN PAGADA
                    </div>
                  )}
                  {activeOrder.status === 'ENTREGADA' && !activeOrder.isPaid && (
                    <div className="flex items-center gap-2 text-[var(--blue-100)] text-xs font-bold bg-[var(--blue-10)] border border-[var(--black-10)] p-2 rounded-[var(--radius-12)] mt-1">
                      <CheckCircle2 size={14} /> Entregada · Pendiente de pago
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {/* EN PREPARACIÓN */}
                  {activeOrder.status === 'EN PREPARACIÓN' && (
                    <button
                      onClick={markAsReady}
                      className="w-full py-2.5 rounded-[var(--radius-16)] font-black flex items-center justify-center gap-2 transition-all border border-[var(--black-10)] bg-white text-[var(--black-60)] hover:bg-[var(--blue-10)] hover:border-[var(--black-10)]"
                    >
                      <CheckCircle2 size={18} className="text-[var(--feedback-success-150)]" /> Marcar como lista
                    </button>
                  )}

                  {/* LISTA */}
                  {activeOrder.status === 'LISTA' && (
                    <div className="flex flex-col gap-2">
                      {activeOrder.isPaid && (
                        <>
                          <button
                            onClick={deliverAndClose}
                            className="w-full bg-[var(--feedback-success-150)] py-3 rounded-[var(--radius-16)] text-sm font-bold text-white hover:opacity-90 flex items-center justify-center gap-2 transition-all shadow-lg shadow-[var(--shadow-4)]"
                          >
                            <History size={18} /> Entregar y cerrar
                          </button>
                          <button
                            onClick={() => toast.info('Comprobante enviado a impresión')}
                            className="text-xs font-bold text-[var(--blue-100)] hover:underline mx-auto flex items-center gap-1"
                          >
                            <Printer size={11} /> Imprimir comprobante
                          </button>
                        </>
                      )}
                      {!activeOrder.isPaid && (
                        <>
                          <button
                            onClick={markAsDelivered}
                            className="w-full border border-[var(--black-10)] bg-white py-3 rounded-[var(--radius-16)] text-sm font-bold text-[var(--black-60)] hover:bg-[var(--blue-10)] flex items-center justify-center gap-2 transition-all"
                          >
                            <CheckCircle2 size={18} className="text-[var(--feedback-success-150)]" /> Marcar como entregada
                          </button>
                          <div className="flex items-center gap-1 text-[10px] text-[var(--feedback-warning-150)] px-1 font-bold">
                            <AlertTriangle size={10} /> No se puede cerrar sin pago
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ENTREGADA */}
                  {activeOrder.status === 'ENTREGADA' && (
                    <div className="flex flex-col gap-2">
                      {activeOrder.isPaid ? (
                        <>
                          <button
                            onClick={deliverAndClose}
                            className="w-full bg-[var(--feedback-success-150)] py-3 rounded-[var(--radius-16)] text-sm font-bold text-white hover:opacity-90 flex items-center justify-center gap-2 transition-all shadow-lg shadow-[var(--shadow-4)]"
                          >
                            <History size={18} /> Cerrar orden
                          </button>
                          <button
                            onClick={() => toast.info('Comprobante enviado a impresión')}
                            className="text-xs font-bold text-[var(--blue-100)] hover:underline mx-auto flex items-center gap-1"
                          >
                            <Printer size={11} /> Imprimir comprobante
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-[var(--feedback-warning-150)] px-1 font-bold">
                          <AlertTriangle size={10} /> No se puede cerrar sin pago
                        </div>
                      )}
                    </div>
                  )}

                  {/* COBRAR */}
                  {!activeOrder.isPaid && activeOrder.status !== 'CERRADA' && (
                    <button
                      disabled={activeOrder.items.length === 0}
                      onClick={() => setShowMostradorCheckout(true)}
                      className={cn(
                        'w-full py-4 rounded-[var(--radius-16)] font-black flex flex-col items-center justify-center leading-none transition-all shadow-xl uppercase tracking-widest',
                        activeOrder.items.length === 0
                          ? 'bg-[var(--black-10)] text-[var(--black-40)] cursor-not-allowed'
                          : 'bg-[#FF4D4D] text-white hover:bg-[#E64545] shadow-[#FF4D4D]/30',
                      )}
                    >
                      <div className="flex items-center gap-2 text-base">
                        <CreditCard size={20} /> COBRAR
                      </div>
                      {totalItems > 0 && <span className="text-[10px] mt-1 opacity-80">{totalItems} ÍTEMS · ${Math.round(total).toLocaleString()}</span>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════
          Checkout Drawer — Mostrador
          ════════════════════════════════════════════════════ */}
      {showMostradorCheckout && activeOrder && (
        <CheckoutDrawer
          title={`Orden #${activeOrder.number}`}
          meta={`${activeOrder.items.length} ítem${activeOrder.items.length !== 1 ? 's' : ''}`}
          items={activeOrder.items}
          onClose={() => {
            setShowMostradorCheckout(false);
            setOrders(prev => prev.map(o =>
              o.id === activeOrderId && o.isPaid
                ? {
                    ...o,
                    items:               [],
                    status:              'BORRADOR' as OrderStatus,
                    isPaid:              false,
                    comandaSent:         false,
                    hasPendingChanges:   false,
                    firstComandaSentAt:  undefined,
                    sentToKitchenAt:     undefined,
                    frozenPreparationMs: undefined,
                  }
                : o,
            ));
          }}
          onConfirmPay={(_method, _total) => {
            setOrders(prev =>
              prev.map(o =>
                o.id === activeOrderId
                  ? { ...o, isPaid: true, status: 'CERRADA' as OrderStatus }
                  : o,
              ),
            );
          }}
        />
      )}

      {/* ════════════════════════════════════════════════════
          Modal preview ticket de cocina — Mostrador
          ════════════════════════════════════════════════════ */}
      {showKitchenModal && activeOrder && (
        <KitchenTicketPreviewModal
          headerLabel="Orden"
          headerValue={`#${activeOrder.number}`}
          showPersonas={false}
          staffLabel="Cajero"
          items={activeOrder.items as TicketItem[]}
          firstComandaSentAt={activeOrder.firstComandaSentAt}
          isResend={kitchenModalIsResend}
          onCancel={() => setShowKitchenModal(false)}
          onConfirm={() => {
            kitchenModalIsResend ? executeKitchenResend() : executeKitchenSend();
            setShowKitchenModal(false);
          }}
        />
      )}
    </>
  );
}