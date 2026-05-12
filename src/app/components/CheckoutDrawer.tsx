import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Printer, CreditCard, CheckCircle2, Minus, Plus,
  AlertTriangle, Users, Banknote, ArrowLeftRight, Layers,
  Check, Send, ChevronDown, ChevronUp,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface CheckoutItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  note?: string;
  discount?: number;   // % de descuento por ítem (0-20)
}

export interface CheckoutDrawerProps {
  title: string;        // "Mesa A2" | "Orden #004"
  subtitle?: string;    // "Salón" | undefined
  meta?: string;        // "4 personas" | "3 ítems"
  items: CheckoutItem[];
  onClose: () => void;
  /** Called when payment is fully finalized — parent updates state/status */
  onConfirmPay: (method: string, total: number) => void;
  /**
   * Mesas flow: comanda was already sent during service — hide the
   * "Enviar comanda a cocina" section in the completed screen.
   * Mostrador flow: leave undefined/false so the section stays visible.
   */
  hideSendToKitchen?: boolean;
}

// ─── Internal types ───────────────────────────────────────────────────────────

type Phase         = 'checkout' | 'completed';
type SplitMode     = 'equal' | 'custom';
type TipMode       = '0' | '10' | 'manual';
type DiscountMode  = '0' | '5' | '10' | '15' | 'custom';
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed';

interface TipManualLine {
  id: string;
  method: string;
  amount: string;
}

const TIP_METHODS = ['Efectivo', 'Tarj. Débito', 'Tarj. Crédito', 'Transferencia'] as const;
const EMPTY_TIP_LINE = (): TipManualLine => ({ id: Date.now().toString() + Math.random(), method: 'Efectivo', amount: '' });

// ─── Palette for up to 6 split accounts ──────────────────────────────────────

const ACCT = [
  { dot: 'bg-[var(--blue-100)]',    badge: 'bg-[var(--blue-10)] text-[var(--blue-100)] border-[var(--black-10)]',       active: 'bg-[var(--blue-100)] border-[var(--blue-100)] text-white',      idle: 'border-[var(--black-10)] text-[var(--black-40)] hover:border-[var(--blue-100)] hover:text-[var(--blue-100)]',       progress: 'border-[var(--blue-100)] bg-[var(--blue-10)]',    progressDot: 'bg-[var(--blue-100)]' },
  { dot: 'bg-[var(--feedback-success-150)]', badge: 'bg-[var(--feedback-success-10)] text-[var(--feedback-success-200)] border-[var(--feedback-success-100)]', active: 'bg-[var(--feedback-success-150)] border-[var(--feedback-success-150)] text-white', idle: 'border-[var(--black-10)] text-[var(--black-40)] hover:border-[var(--feedback-success-100)] hover:text-[var(--feedback-success-150)]', progress: 'border-[var(--feedback-success-100)] bg-[var(--feedback-success-10)]', progressDot: 'bg-[var(--feedback-success-150)]' },
  { dot: 'bg-[var(--feedback-warning-100)]',   badge: 'bg-[var(--feedback-warning-10)] text-[var(--feedback-warning-150)] border-[var(--feedback-warning-10)]',    active: 'bg-[var(--feedback-warning-100)] border-[var(--feedback-warning-100)] text-white',     idle: 'border-[var(--black-10)] text-[var(--black-40)] hover:border-[var(--feedback-warning-100)] hover:text-[var(--feedback-warning-100)]',   progress: 'border-[var(--feedback-warning-100)] bg-[var(--feedback-warning-10)]',   progressDot: 'bg-[var(--feedback-warning-100)]' },
  { dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 border-violet-200', active: 'bg-violet-600 border-violet-600 text-white',   idle: 'border-[var(--black-10)] text-[var(--black-40)] hover:border-violet-300 hover:text-violet-500', progress: 'border-violet-300 bg-violet-50', progressDot: 'bg-violet-500' },
  { dot: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 border-rose-200',       active: 'bg-rose-600 border-rose-600 text-white',       idle: 'border-[var(--black-10)] text-[var(--black-40)] hover:border-rose-300 hover:text-rose-500',     progress: 'border-rose-300 bg-rose-50',     progressDot: 'bg-rose-500' },
  { dot: 'bg-teal-500',    badge: 'bg-teal-50 text-teal-700 border-teal-200',       active: 'bg-teal-600 border-teal-600 text-white',       idle: 'border-[var(--black-10)] text-[var(--black-40)] hover:border-teal-300 hover:text-teal-500',     progress: 'border-teal-300 bg-teal-50',     progressDot: 'bg-teal-500' },
];

const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', mixed: 'Mixto',
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function SectionLabel({ label, hint }: { label: string; hint?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: '#606060',
        textTransform: 'uppercase', letterSpacing: '1px',
        fontFamily: 'Montserrat, sans-serif', margin: 0,
      }}>{label}</p>
      {hint}
    </div>
  );
}

const Divider = () => (
  <div style={{ height: 8, background: '#F5F6FA', flexShrink: 0 }} />
);

function MoneyInput({
  value, onChange, placeholder, autoFocus,
}: { value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        color: '#606060', fontSize: 14, fontWeight: 500, pointerEvents: 'none',
        fontFamily: 'Montserrat, sans-serif',
      }}>$</span>
      <input
        type="number" min={0}
        placeholder={placeholder ?? '0'}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        style={{
          width: '100%', height: 40, boxSizing: 'border-box',
          borderRadius: 12,
          border: focused ? '1.5px solid #121E6C' : '1.5px solid #C7CBE0',
          background: '#F7F8FB',
          fontFamily: 'Montserrat, sans-serif', fontSize: 14,
          fontWeight: 600, color: '#1E1E1E',
          padding: '0 12px 0 28px',
          outline: 'none',
          transition: 'border-color 200ms',
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CheckoutDrawer({
  title, subtitle, meta, items, onClose, onConfirmPay, hideSendToKitchen = false,
}: CheckoutDrawerProps) {

  // ── Phase ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('checkout');

  // ── Completed snapshot — frozen at the moment of payment ─────────────────
  interface CompletedSnapshot {
    paidAt: Date;
    paymentDisplay: string;
    snapshotItems: CheckoutItem[];
    subtotal: number;
    itemDiscountsTotal: number;
    discountAmount: number;
    discountMode: DiscountMode;
    tax: number;
    tipAmount: number;
    grandTotal: number;
  }
  const [completedSnapshot, setCompletedSnapshot] = useState<CompletedSnapshot | null>(null);

  // ── Comanda post-pago ─────────────────────────────────────────────────────
  const [comandaSentAfterPay, setComandaSentAfterPay] = useState(false);

  // ── Nota general del pedido ───────────────────────────────────────────────
  const [orderNote, setOrderNote] = useState('');

  // ── B. Dividir cuenta ─────────────────────────────────────────────────────
  const [splitBill,    setSplitBill]    = useState(false);
  const [splitMode,    setSplitMode]    = useState<SplitMode>('equal');
  const [splitPersons, setSplitPersons] = useState(2);

  // ── E. Montos personalizados ──────────────────────────────────────────────
  const [customAmounts,  setCustomAmounts]  = useState<number[]>([0, 0]);
  const [camposEditados, setCamposEditados] = useState<Set<number>>(new Set());

  // Split payment progress
  const [paidAccounts,   setPaidAccounts]   = useState<Set<number>>(new Set());
  const [currentAccount, setCurrentAccount] = useState(1);

  // ── Vendedor ─────────────────────────────────────────────────────────────
  const [vendedor, setVendedor] = useState('Carlos Méndez');

  // ── Cliente combobox ─────────────────────────────────────────────────────
  const [cliente,          setCliente]          = useState('Consumidor final');
  const [clienteOpen,      setClienteOpen]      = useState(false);
  const [clientesList,     setClientesList]     = useState([
    'Consumidor final',
    'Restaurante El Cielo',
    'Inversiones Tech SAS',
    'Juan Pérez (NIT: 900.123.456)',
    'María González',
  ]);
  const [showAddCliente,   setShowAddCliente]   = useState(false);
  const [newClienteNombre, setNewClienteNombre] = useState('');
  const [newClienteNit,    setNewClienteNit]    = useState('');

  // ── B2. Descuento general ────────────────────────────────────────────────
  const [discountMode,   setDiscountMode]   = useState<DiscountMode>('0');
  const [discountCustom, setDiscountCustom] = useState('');

  // ── C. Propina ────────────────────────────────────────────────────────────
  const [tipMode,        setTipMode]        = useState<TipMode>('10');
  const [tipManualLines, setTipManualLines] = useState<TipManualLine[]>([EMPTY_TIP_LINE()]);

  // ── D. Método de pago ─────────────────────────────────────────────────────
  const [paymentMethod,      setPaymentMethod]      = useState<PaymentMethod>('card');
  const [cashReceived,       setCashReceived]       = useState('');
  const [transferConfirmed,  setTransferConfirmed]  = useState(false);
  const [mixCash,    setMixCash]    = useState('');
  const [mixCard,    setMixCard]    = useState('');
  const [mixTransfer, setMixTransfer] = useState('');

  // ── Computed: totals ───────────────────────────────────────────────────────

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items],
  );

  // Descuentos por ítem
  const itemDiscountsTotal = useMemo(
    () => items.reduce((s, i) => {
      const disc = i.discount ?? 0;
      return s + (disc > 0 ? Math.round(i.price * i.quantity * disc / 100) : 0);
    }, 0),
    [items],
  );
  const subtotalAfterItemDisc = subtotal - itemDiscountsTotal;

  // Descuento general de checkout
  const discountAmount = useMemo(() => {
    if (discountMode === '0') return 0;
    if (discountMode === 'custom') {
      const n = parseFloat(discountCustom.replace(/[^0-9.]/g, ''));
      return isNaN(n) ? 0 : Math.round(n);
    }
    return Math.round(subtotalAfterItemDisc * parseInt(discountMode) / 100);
  }, [discountMode, discountCustom, subtotalAfterItemDisc]);

  const taxBase         = subtotalAfterItemDisc - discountAmount;
  const tax             = Math.round(taxBase * 0.19);
  const subtotalWithTax = taxBase + tax;

  const tipAmount = useMemo(() => {
    if (tipMode === '0')  return 0;
    if (tipMode === '10') return Math.round(subtotalWithTax * 0.10);
    return tipManualLines.reduce((sum, line) => {
      const n = parseFloat(line.amount.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(n) ? 0 : Math.round(n));
    }, 0);
  }, [tipMode, tipManualLines, subtotalWithTax]);

  const grandTotal = subtotalWithTax + tipAmount;

  // ── Computed: split (equal) ────────────────────────────────────────────────

  // Floor each person, last person absorbs remainder (exact total)
  const perPersonFloor     = splitPersons > 0 ? Math.floor(grandTotal / splitPersons) : 0;
  const perPersonRemainder = grandTotal - perPersonFloor * splitPersons;
  const amountForPerson    = (i: number) => // 0-based
    i === splitPersons - 1 ? perPersonFloor + perPersonRemainder : perPersonFloor;

  // ── Computed: split progress ───────────────────────────────────────────────

  const totalSplits = splitPersons;

  const amountForAccount = (idx: number) => // 1-based
    splitMode === 'equal' ? amountForPerson(idx - 1) : (customAmounts[idx - 1] ?? 0);

  const paidTotal = useMemo(() => {
    let total = 0;
    paidAccounts.forEach(idx => { total += amountForAccount(idx); });
    return total;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidAccounts, splitMode, splitPersons, grandTotal, customAmounts]);

  const remainingAfterPaid = grandTotal - paidTotal;
  const allAccountsPaid    = paidAccounts.size >= totalSplits;

  // Amount the user is about to pay right now
  const currentAmountToPay = splitBill && !allAccountsPaid
    ? amountForAccount(currentAccount)
    : grandTotal;

  // ── Computed: cash ─────────────────────────────────────────────────────────

  const cashNum    = parseFloat(cashReceived.replace(/[^0-9.]/g, '')) || 0;
  const cashChange = cashNum - currentAmountToPay;

  // ── Computed: mixed ────────────────────────────────────────────────────────

  const mixCashNum     = parseFloat(mixCash.replace(/[^0-9.]/g, '')) || 0;
  const mixCardNum     = parseFloat(mixCard.replace(/[^0-9.]/g, '')) || 0;
  const mixTransferNum = parseFloat(mixTransfer.replace(/[^0-9.]/g, '')) || 0;
  const totalMixedPaid = mixCashNum + mixCardNum + mixTransferNum;
  const mixRemaining   = currentAmountToPay - totalMixedPaid;
  const mixChange      = totalMixedPaid - currentAmountToPay;

  // ── Computed: custom split validation ─────────────────────────────────────

  const customTotal       = customAmounts.slice(0, splitPersons).reduce((a, b) => a + b, 0);
  const customValid       = splitMode === 'custom' && customTotal === grandTotal;
  const customDiff        = grandTotal - customTotal; // >0: falta; <0: excede
  const customModeInvalid = splitBill && splitMode === 'custom' && !customValid;

  // ── Can confirm current payment ────────────────────────────────────────────

  const canConfirmCurrentPayment = useMemo(() => {
    if (splitBill && splitMode === 'custom' && !customValid) return false;
    if (paymentMethod === 'cash')     return cashNum >= currentAmountToPay;
    if (paymentMethod === 'transfer') return transferConfirmed;
    if (paymentMethod === 'mixed')    return totalMixedPaid >= currentAmountToPay;
    return true; // card
  }, [splitBill, splitMode, customValid, paymentMethod, cashNum, currentAmountToPay, transferConfirmed, totalMixedPaid]);

  // Button is active when: payment valid OR all accounts already paid
  const btnEnabled = canConfirmCurrentPayment || allAccountsPaid;

  // ── Effects ────────────────────────────────────────────────────────────────

  // Reset payment inputs when switching accounts
  useEffect(() => {
    setCashReceived('');
    setTransferConfirmed(false);
    setMixCash(''); setMixCard(''); setMixTransfer('');
  }, [currentAccount]);

  // Reset progress when split settings change
  useEffect(() => {
    setPaidAccounts(new Set());
    setCurrentAccount(1);
  }, [splitBill, splitMode, splitPersons]);

  // Helper: build an equal-split array for N persons summing exactly to total
  const buildEqualSplit = (total: number, n: number): number[] => {
    const base = Math.floor(total / n);
    const rem  = total - base * n;
    return Array.from({ length: n }, (_, i) => base + (i === n - 1 ? rem : 0));
  };

  // Pre-fill with equal split when switching TO custom mode
  useEffect(() => {
    if (splitMode === 'custom') {
      setCustomAmounts(buildEqualSplit(grandTotal, splitPersons));
      setCamposEditados(new Set());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitMode]);

  // Re-initialize when number of persons changes (in custom mode)
  useEffect(() => {
    if (splitMode === 'custom') {
      setCustomAmounts(buildEqualSplit(grandTotal, splitPersons));
      setCamposEditados(new Set());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitPersons]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const confirmOneAccount = () => {
    const updated = new Set(paidAccounts);
    updated.add(currentAccount);
    setPaidAccounts(updated);
    const next = Array.from({ length: totalSplits }, (_, i) => i + 1).find(i => !updated.has(i));
    if (next !== undefined) setCurrentAccount(next);
  };

  const finalizePay = () => {
    const method = splitBill ? 'Dividido' : METHOD_LABEL[paymentMethod];
    // Snapshot all computed values NOW — before parent clears items prop
    setCompletedSnapshot({
      paidAt: new Date(),
      paymentDisplay: splitBill ? `Dividido · ${totalSplits} personas` : METHOD_LABEL[paymentMethod],
      snapshotItems: [...items],
      subtotal,
      itemDiscountsTotal,
      discountAmount,
      discountMode,
      tax,
      tipAmount,
      grandTotal,
    });
    toast.success(
      `Pago registrado · ${title} pagada · ${method} · $${grandTotal.toLocaleString()}`,
      { duration: 5000 },
    );
    setPhase('completed');
    onConfirmPay(method, grandTotal);
  };

  const handleConfirm = () => {
    if (splitBill && !allAccountsPaid) {
      confirmOneAccount();
    } else {
      finalizePay();
    }
  };

  // ── Disabled reason text ───────────────────────────────────────────────────

  const disabledReason = useMemo((): string | null => {
    if (allAccountsPaid) return null;
    if (paymentMethod === 'cash' && cashNum === 0)
      return 'Ingresa el monto recibido';
    if (paymentMethod === 'cash' && cashNum < currentAmountToPay)
      return `Faltan $${(currentAmountToPay - cashNum).toLocaleString()} para completar`;
    if (paymentMethod === 'transfer' && !transferConfirmed)
      return 'Confirma la transferencia recibida';
    if (paymentMethod === 'mixed' && totalMixedPaid < currentAmountToPay)
      return `Faltan $${mixRemaining.toLocaleString()} por cubrir en pago mixto`;
    return null;
  }, [allAccountsPaid, paymentMethod, cashNum, currentAmountToPay, transferConfirmed, totalMixedPaid, mixRemaining]);

  // ── Display strings ────────────────────────────────────────────────────────

  const splitLabel = `Persona ${currentAccount}`;

  const paymentDisplay = splitBill
    ? `Dividido · ${totalSplits} personas`
    : METHOD_LABEL[paymentMethod];

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* Overlay — blocks all background interaction */}
      <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-[210] w-[480px] bg-white flex flex-col animate-in slide-in-from-right duration-300"
        style={{ boxShadow: 'var(--shadow-12)', borderLeft: '1px solid var(--black-10)' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ─────────────────────────────────────────────────────
            HEADER — sticky
            ───────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0, padding: '20px 24px', borderBottom: '1px solid #F0F0F0',
        }}>
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, color: '#606060',
              textTransform: 'uppercase', letterSpacing: '0.8px',
              fontFamily: 'Montserrat, sans-serif', marginBottom: 4,
            }}>Checkout</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1E1E1E', lineHeight: 1.2, fontFamily: 'Montserrat, sans-serif' }}>{title}</h2>
            {(subtitle || meta) && (
              <p style={{ fontSize: 13, color: '#606060', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Montserrat, sans-serif' }}>
                {subtitle && <span>{subtitle}</span>}
                {subtitle && meta && <span style={{ color: '#C7CBE0' }}>·</span>}
                {meta && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {meta}</span>}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 2 }}>
            <button
              onClick={() => toast.info('Documento enviado a impresora')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 32, padding: '0 12px', borderRadius: 6,
                border: '1.5px solid #C7CBE0', background: '#fff',
                fontSize: 12, fontWeight: 600, color: '#606060',
                fontFamily: 'Montserrat, sans-serif', cursor: 'pointer',
              }}
            >
              <Printer size={12} color="#606060" /> Pre-cuenta
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 6, border: '1.5px solid #F0F0F0',
                background: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <X size={16} color="#606060" />
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────
            BODY — scrollable
            ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ═══════════════════════════════════════════════════
              PHASE: COMPLETED
              ═══════════════════════════════════════════════════ */}
          {phase === 'completed' && completedSnapshot ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
              {/* Big checkmark */}
              <div className="w-20 h-20 rounded-full bg-[var(--feedback-success-10)] border-4 border-[var(--feedback-success-100)] flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 size={40} className="text-[var(--feedback-success-150)]" />
              </div>

              {/* Title + date */}
              <div style={{ textAlign: 'center', marginTop: 16, width: '100%' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E1E1E', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>Pago completado</h3>
                <p style={{ fontSize: 13, color: '#606060', marginTop: 4, fontFamily: 'Montserrat, sans-serif' }}>
                  {title} · {completedSnapshot.paidAt.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })} {completedSnapshot.paidAt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Summary card */}
              <div style={{
                width: '100%', marginTop: 24,
                background: 'var(--blue-10)', borderRadius: 16,
                border: '1px solid var(--black-10)', padding: 20,
                boxSizing: 'border-box',
              }}>
                {/* Total header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Montserrat, sans-serif' }}>Total cobrado</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif' }}>${completedSnapshot.grandTotal.toLocaleString()}</span>
                </div>

                {/* Items list */}
                <div style={{ borderTop: '1px solid #E0E4F0', paddingTop: 4, marginBottom: 4 }}>
                  {completedSnapshot.snapshotItems.map((item, idx) => {
                    const unitPrice = item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
                    const lineTotal = unitPrice * item.quantity;
                    return (
                      <div key={idx} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                        paddingTop: 8, paddingBottom: 8, borderBottom: '1px solid #F0F0F0',
                      }}>
                        <span style={{ fontSize: 12, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif', flex: 1, marginRight: 8 }}>
                          {item.quantity}× {item.name}
                          {item.discount ? <span style={{ fontSize: 10, color: '#059669', marginLeft: 4 }}>−{item.discount}%</span> : null}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap' }}>
                          ${lineTotal.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Financial rows */}
                <div>
                  <Row label="Método" value={completedSnapshot.paymentDisplay} />
                  {subtitle && <Row label="Ubicación" value={subtitle} />}
                  <Row label="Subtotal" value={`$${completedSnapshot.subtotal.toLocaleString()}`} />
                  {completedSnapshot.itemDiscountsTotal > 0 && <Row label="Descuentos por ítem" value={`-$${completedSnapshot.itemDiscountsTotal.toLocaleString()}`} colored="green" />}
                  {completedSnapshot.discountAmount > 0 && <Row label={`Descuento${completedSnapshot.discountMode !== 'custom' ? ` (${completedSnapshot.discountMode}%)` : ''}`} value={`-$${completedSnapshot.discountAmount.toLocaleString()}`} colored="green" />}
                  <Row label="IVA 19%" value={`$${completedSnapshot.tax.toLocaleString()}`} />
                  {completedSnapshot.tipAmount > 0 && <Row label="Propina" value={`+$${completedSnapshot.tipAmount.toLocaleString()}`} colored="blue" />}
                </div>
              </div>

              {/* Actions */}
              <div style={{ width: '100%', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* ── Comanda a cocina — solo Mostrador ── */}
                {!hideSendToKitchen && (
                  <div className={cn(
                    'rounded-[var(--radius-20)] border p-4 flex flex-col gap-3 transition-all',
                    comandaSentAfterPay
                      ? 'bg-[var(--feedback-success-10)] border-[var(--feedback-success-100)]'
                      : 'bg-[var(--blue-10)] border-blue-100',
                  )}>
                    <div className="flex items-center gap-2">
                      {comandaSentAfterPay
                        ? <CheckCircle2 size={14} className="text-[var(--feedback-success-150)]" />
                        : <Send size={14} className="text-[var(--blue-100)]" />
                      }
                      <p className={cn('text-xs font-black uppercase tracking-wider',
                        comandaSentAfterPay ? 'text-[var(--feedback-success-200)]' : 'text-[var(--blue-100)]',
                      )}>
                        {comandaSentAfterPay ? 'Comanda enviada a cocina' : 'Enviar comanda a cocina'}
                      </p>
                    </div>
                    {!comandaSentAfterPay && (
                      <p className="text-[11px] text-[var(--blue-100)] leading-snug">
                        Los ítems de esta orden serán enviados a cocina para su preparación.
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setComandaSentAfterPay(true);
                        toast.success(comandaSentAfterPay ? 'Comanda reenviada a cocina' : 'Comanda enviada a cocina');
                      }}
                      className={cn('btn w-full', comandaSentAfterPay ? 'btn-secondary' : 'btn-primary')}
                      style={{ padding: '12px 20px' }}
                    >
                      <Send size={15} />
                      {comandaSentAfterPay ? 'Reenviar comanda' : 'Enviar comanda'}
                    </button>
                  </div>
                )}

                {/* ── Imprimir factura — link secundario ── */}
                <button
                  onClick={() => toast.info('Documento enviado a impresora')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                    fontSize: 13, fontWeight: 400, color: '#606060',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  <Printer size={13} color="#606060" /> Imprimir factura
                </button>
              </div>
            </div>

          ) : (

            /* ═══════════════════════════════════════════════════
               PHASE: CHECKOUT
               ═══════════════════════════════════════════════════ */
            <>
              {/* ─── 0. VENDEDOR + CLIENTE ─── */}
              <div style={{ padding: '16px 24px', borderBottom: '8px solid #F5F6FA' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                  {/* ── Vendedor — MERLin SelectInput ── */}
                  <div>
                    <span style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#121E6C', lineHeight: '20px' }}>
                      Vendedor
                    </span>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={vendedor}
                        onChange={e => setVendedor(e.target.value)}
                        style={{
                          width: '100%', height: 40, boxSizing: 'border-box',
                          borderRadius: 12, border: '1.5px solid #C7CBE0',
                          background: '#F7F8FB', fontFamily: 'Montserrat, sans-serif', fontSize: 14,
                          color: '#1E1E1E', padding: '0 36px 0 12px',
                          outline: 'none', appearance: 'none', cursor: 'pointer',
                          transition: 'border-color 200ms',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#C7CBE0')}
                      >
                        <option>Carlos Méndez</option>
                        <option>Laura Torres</option>
                        <option>Miguel García</option>
                        <option>Ana Ruiz</option>
                      </select>
                      <ChevronDown size={16} color="#606060" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* ── Resolución — MERLin SelectInput ── */}
                  <div>
                    <span style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#121E6C', lineHeight: '20px' }}>
                      Resolución
                    </span>
                    <div style={{ position: 'relative' }}>
                      <select
                        defaultValue="Resolution test SP - Resolution 1234509752467"
                        style={{
                          width: '100%', height: 40, boxSizing: 'border-box',
                          borderRadius: 12, border: '1.5px solid #C7CBE0',
                          background: '#F7F8FB', fontFamily: 'Montserrat, sans-serif', fontSize: 14,
                          color: '#1E1E1E', padding: '0 36px 0 12px',
                          outline: 'none', appearance: 'none', cursor: 'pointer',
                          transition: 'border-color 200ms',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#C7CBE0')}
                      >
                        <option>Resolution test SP - Resolution 1234509752467</option>
                        <option>Resolution Terraza - Resolution 9876543210</option>
                        <option>Resolution Mostrador - Resolution 1122334455</option>
                      </select>
                      <ChevronDown size={16} color="#606060" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* ── Cliente — Combobox ── */}
                  <div style={{ position: 'relative', gridColumn: '1 / -1' }}>
                    <span style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#121E6C', lineHeight: '20px' }}>
                      Cliente
                    </span>
                    {/* Trigger */}
                    <div
                      onClick={() => { setClienteOpen(o => !o); setShowAddCliente(false); }}
                      style={{
                        width: '100%', height: 40, boxSizing: 'border-box',
                        borderRadius: 12, border: clienteOpen ? '1.5px solid #121E6C' : '1.5px solid #C7CBE0',
                        background: '#F7F8FB', fontFamily: 'Montserrat, sans-serif', fontSize: 14,
                        color: '#1E1E1E', padding: '0 36px 0 12px',
                        display: 'flex', alignItems: 'center', cursor: 'pointer',
                        transition: 'border-color 200ms', userSelect: 'none',
                        position: 'relative',
                      }}
                    >
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cliente}</span>
                      {clienteOpen
                        ? <ChevronUp   size={16} color="#606060" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        : <ChevronDown size={16} color="#606060" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      }
                    </div>

                    {/* Dropdown panel */}
                    {clienteOpen && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 1199 }} onClick={() => { setClienteOpen(false); setShowAddCliente(false); }} />
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                          zIndex: 1200, background: '#fff',
                          border: '1px solid #C7CBE0', borderRadius: 8,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          overflow: 'hidden',
                        }}>
                          {/* Existing clients */}
                          {clientesList.map(c => (
                            <div
                              key={c}
                              onClick={() => { setCliente(c); setClienteOpen(false); setShowAddCliente(false); }}
                              style={{
                                padding: '10px 14px', fontSize: 14,
                                fontFamily: 'Montserrat, sans-serif', cursor: 'pointer',
                                color: '#1E1E1E',
                                background: cliente === c ? '#F5F6FA' : '#fff',
                              }}
                              onMouseEnter={e => { if (cliente !== c) (e.currentTarget as HTMLDivElement).style.background = '#F5F6FA'; }}
                              onMouseLeave={e => { if (cliente !== c) (e.currentTarget as HTMLDivElement).style.background = cliente === c ? '#F5F6FA' : '#fff'; }}
                            >{c}</div>
                          ))}

                          {/* Separator */}
                          <div style={{ height: 1, background: '#F0F0F0' }} />

                          {/* Add new */}
                          {!showAddCliente ? (
                            <div
                              onClick={e => { e.stopPropagation(); setShowAddCliente(true); }}
                              style={{
                                padding: '10px 14px', fontSize: 14, fontWeight: 500,
                                color: '#121E6C', cursor: 'pointer',
                                fontFamily: 'Montserrat, sans-serif',
                                display: 'flex', alignItems: 'center', gap: 6,
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F5F6FA'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                            >
                              <Plus size={13} color="#121E6C" /> Agregar cliente nuevo
                            </div>
                          ) : (
                            <div
                              style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}
                              onClick={e => e.stopPropagation()}
                            >
                              <div>
                                <span style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#121E6C', lineHeight: '20px' }}>Nombre o razón social</span>
                                <input
                                  type="text" autoFocus
                                  value={newClienteNombre}
                                  onChange={e => setNewClienteNombre(e.target.value)}
                                  placeholder="Ej: Inversiones Tech SAS"
                                  style={{
                                    width: '100%', height: 40, boxSizing: 'border-box',
                                    borderRadius: 12, border: '1.5px solid #C7CBE0',
                                    background: '#F7F8FB', fontFamily: 'Montserrat, sans-serif', fontSize: 14,
                                    color: '#1E1E1E', padding: '0 12px', outline: 'none',
                                    transition: 'border-color 200ms',
                                  }}
                                  onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                                  onBlur={e => (e.currentTarget.style.borderColor = '#C7CBE0')}
                                />
                              </div>
                              <div>
                                <span style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', color: '#121E6C', lineHeight: '20px' }}>NIT / CC</span>
                                <input
                                  type="text"
                                  value={newClienteNit}
                                  onChange={e => setNewClienteNit(e.target.value)}
                                  placeholder="Ej: 900.123.456"
                                  style={{
                                    width: '100%', height: 40, boxSizing: 'border-box',
                                    borderRadius: 12, border: '1.5px solid #C7CBE0',
                                    background: '#F7F8FB', fontFamily: 'Montserrat, sans-serif', fontSize: 14,
                                    color: '#1E1E1E', padding: '0 12px', outline: 'none',
                                    transition: 'border-color 200ms',
                                  }}
                                  onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                                  onBlur={e => (e.currentTarget.style.borderColor = '#C7CBE0')}
                                />
                              </div>
                              <button
                                onClick={() => {
                                  if (!newClienteNombre.trim()) return;
                                  const label = newClienteNit.trim()
                                    ? `${newClienteNombre.trim()} (NIT: ${newClienteNit.trim()})`
                                    : newClienteNombre.trim();
                                  setClientesList(prev => [...prev, label]);
                                  setCliente(label);
                                  setClienteOpen(false);
                                  setShowAddCliente(false);
                                  setNewClienteNombre('');
                                  setNewClienteNit('');
                                }}
                                style={{
                                  height: 36, borderRadius: 8, border: 'none',
                                  background: '#FF2947', color: '#fff',
                                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                  fontFamily: 'Montserrat, sans-serif',
                                }}
                              >
                                Guardar
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>

              {/* ─── 1. RESUMEN DEL PEDIDO ─── */}
              <div style={{ padding: '16px 24px' }}>
                <SectionLabel
                  label="Resumen de la orden"
                  hint={<span style={{
                    background: '#F1F2F6', color: '#606060', borderRadius: 4,
                    padding: '1px 6px', fontSize: 11, fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif',
                  }}>{items.length} ítem{items.length !== 1 ? 's' : ''}</span>}
                />

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {items.map((item, idx) => (
                    <div key={item.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingTop: 6, paddingBottom: 6,
                      borderBottom: idx < items.length - 1 ? '1px solid #F0F0F0' : 'none',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 400, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif' }}>{item.name}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, color: '#909090',
                            background: '#F1F2F6', borderRadius: 3, padding: '1px 5px',
                            fontFamily: 'Montserrat, sans-serif',
                          }}>×{item.quantity}</span>
                          {(item.discount ?? 0) > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#059669', background: '#D1FAE5', borderRadius: 3, padding: '1px 5px', fontFamily: 'Montserrat, sans-serif' }}>
                              Desc.{item.discount}%
                            </span>
                          )}
                        </div>
                        {item.note && <p style={{ fontSize: 11, color: '#909090', fontStyle: 'italic', marginTop: 2, fontFamily: 'Montserrat, sans-serif' }}>{item.note}</p>}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1E1E1E', flexShrink: 0, fontFamily: 'Montserrat, sans-serif' }}>
                        ${(item.discount ? Math.round(item.price * (1 - item.discount/100)) * item.quantity : item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#606060', fontFamily: 'Montserrat, sans-serif' }}>Subtotal</span>
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif' }}>${subtotal.toLocaleString()}</span>
                  </div>
                  {itemDiscountsTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 400, color: '#059669', fontFamily: 'Montserrat, sans-serif' }}>Descuentos por ítem</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#059669', fontFamily: 'Montserrat, sans-serif' }}>-${itemDiscountsTotal.toLocaleString()}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 400, color: '#059669', fontFamily: 'Montserrat, sans-serif' }}>
                        Descuento{discountMode !== 'custom' ? ` (${discountMode}%)` : ''}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#059669', fontFamily: 'Montserrat, sans-serif' }}>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#606060', fontFamily: 'Montserrat, sans-serif' }}>IVA 19%</span>
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif' }}>${tax.toLocaleString()}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#121E6C', fontFamily: 'Montserrat, sans-serif' }}>Propina {tipMode === '10' ? '(10%)' : '(Manual)'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#121E6C', fontFamily: 'Montserrat, sans-serif' }}>+${tipAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    paddingTop: 10, marginTop: 4, borderTop: '1px solid #F0F0F0',
                  }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif' }}>Total</span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif' }}>${grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* ─── 2. DESCUENTO GENERAL ─── */}
              <Divider />
              <div style={{ padding: '16px 24px' }}>
                <SectionLabel
                  label="Descuento"
                  hint={discountAmount > 0 ? (
                    <span style={{
                      background: '#D1FAE5', color: '#059669', borderRadius: 4,
                      padding: '2px 8px', fontSize: 11, fontWeight: 600,
                      fontFamily: 'Montserrat, sans-serif',
                    }}>-${discountAmount.toLocaleString()}</span>
                  ) : undefined}
                />
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                  {(['0', '5', '10', '15', 'custom'] as DiscountMode[]).map(m => (
                    <button key={m}
                      onClick={() => setDiscountMode(m)}
                      style={{
                        background: 'none', border: 'none',
                        borderBottom: discountMode === m ? '2px solid #121E6C' : '2px solid transparent',
                        paddingBottom: 4, fontSize: 14,
                        fontWeight: discountMode === m ? 700 : 400,
                        color: discountMode === m ? '#121E6C' : '#606060',
                        cursor: 'pointer', transition: 'all 150ms ease',
                        fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap',
                      }}
                    >
                      {m === '0' ? 'Sin descuento' : m === 'custom' ? 'Personalizado' : `${m}%`}
                    </button>
                  ))}
                </div>
                {discountMode === 'custom' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#121E6C', fontFamily: 'Montserrat, sans-serif', lineHeight: '20px' }}>Monto</span>
                    <MoneyInput value={discountCustom} onChange={setDiscountCustom} placeholder="0" autoFocus />
                  </div>
                )}
              </div>

              {/* ─── 3. DIVIDIR CUENTA ─── */}
              <Divider />
              <div style={{ padding: '16px 24px' }}>
              <SectionLabel
                label="¿Dividir cuenta?"
                hint={splitBill ? (
                  <span style={{
                    background: '#F1F2F6', color: '#606060', borderRadius: 4,
                    padding: '1px 6px', fontSize: 11, fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif',
                  }}>{splitPersons} personas</span>
                ) : undefined}
              />

              {/* Toggle No/Sí */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {(['No', 'Sí'] as const).map(opt => (
                  <button key={opt}
                    onClick={() => setSplitBill(opt === 'Sí')}
                    style={{
                      height: 32, padding: '0 16px', borderRadius: 20,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      border: 'none', transition: 'all 150ms ease',
                      fontFamily: 'Montserrat, sans-serif',
                      ...((opt === 'No') === !splitBill
                        ? { background: '#121E6C', color: '#fff' }
                        : { background: '#F1F2F6', color: '#606060' })
                    }}
                  >{opt}</button>
                ))}
              </div>

              {splitBill && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Mode tabs — underline style */}
                  <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid #F0F0F0', paddingBottom: 0 }}>
                    {([['equal', 'Partes iguales'], ['custom', 'Personalizado']] as [SplitMode, string][]).map(([m, l]) => (
                      <button key={m}
                        onClick={() => setSplitMode(m)}
                        style={{
                          background: 'none', border: 'none',
                          borderBottom: splitMode === m ? '2px solid #121E6C' : '2px solid transparent',
                          paddingBottom: 8, marginBottom: -1,
                          fontSize: 14, fontWeight: splitMode === m ? 700 : 400,
                          color: splitMode === m ? '#121E6C' : '#606060',
                          cursor: 'pointer', transition: 'all 150ms ease',
                          fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap',
                        }}
                      >{l}</button>
                    ))}
                  </div>

                  {/* ── Partes iguales ── */}
                  {splitMode === 'equal' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                      {/* Stepper */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 8, background: '#F8F8F8',
                      }}>
                        <span style={{ fontSize: 13, color: '#606060', fontFamily: 'Montserrat, sans-serif' }}>Número de personas</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button
                            onClick={() => setSplitPersons(p => Math.max(2, p - 1))}
                            disabled={splitPersons <= 2}
                            style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: '#F1F2F6', border: 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: splitPersons <= 2 ? 'not-allowed' : 'pointer',
                              opacity: splitPersons <= 2 ? 0.4 : 1,
                            }}>
                            <Minus size={11} color="#1E1E1E" />
                          </button>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#1E1E1E', minWidth: 20, textAlign: 'center', fontFamily: 'Montserrat, sans-serif' }}>{splitPersons}</span>
                          <button
                            onClick={() => setSplitPersons(p => p + 1)}
                            style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: '#F1F2F6', border: 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            }}>
                            <Plus size={11} color="#1E1E1E" />
                          </button>
                        </div>
                      </div>

                      {/* Person cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {Array.from({ length: Math.min(splitPersons, 8) }).map((_, i) => {
                          const idx       = i + 1;
                          const isPaid    = paidAccounts.has(idx);
                          const isCurrent = !isPaid && currentAccount === idx;
                          return (
                            <button key={i}
                              onClick={() => !isPaid && setCurrentAccount(idx)}
                              style={{
                                padding: '10px 12px', borderRadius: 8, textAlign: 'center',
                                border: isCurrent ? '1.5px solid #121E6C' : isPaid ? '1.5px solid #C7CBE0' : '1.5px solid #C7CBE0',
                                background: isCurrent ? '#F1F2F6' : isPaid ? '#F8FFF8' : '#fff',
                                cursor: isPaid ? 'default' : 'pointer',
                                transition: 'all 150ms ease',
                              }}>
                              <p style={{
                                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.5px', marginBottom: 4,
                                color: isPaid ? '#059669' : isCurrent ? '#121E6C' : '#606060',
                                fontFamily: 'Montserrat, sans-serif',
                              }}>
                                {isPaid ? '✓ Pagada' : isCurrent ? '→ COBRANDO' : `Persona ${idx}`}
                              </p>
                              <p style={{
                                fontSize: 13, fontWeight: 700,
                                color: isPaid ? '#059669' : isCurrent ? '#121E6C' : '#1E1E1E',
                                textDecoration: isPaid ? 'line-through' : 'none',
                                opacity: isPaid ? 0.6 : 1,
                                fontFamily: 'Montserrat, sans-serif',
                              }}>
                                ${amountForPerson(i).toLocaleString()}
                              </p>
                            </button>
                          );
                        })}
                        {splitPersons > 8 && (
                          <div style={{
                            gridColumn: '1 / -1', textAlign: 'center',
                            fontSize: 11, color: '#909090', padding: '4px 0',
                            fontFamily: 'Montserrat, sans-serif',
                          }}>
                            + {splitPersons - 8} personas más · ${perPersonFloor.toLocaleString()} c/u
                          </div>
                        )}
                      </div>

                      {perPersonRemainder > 0 && (
                        <p style={{ fontSize: 11, color: '#909090', fontStyle: 'italic', textAlign: 'center', fontFamily: 'Montserrat, sans-serif' }}>
                          * Ajuste por redondeo: Persona {splitPersons} paga ${(perPersonFloor + perPersonRemainder).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── Personalizado ── */}
                  {splitMode === 'custom' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                      {/* Stepper */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 8, background: '#F8F8F8',
                      }}>
                        <span style={{ fontSize: 13, color: '#606060', fontFamily: 'Montserrat, sans-serif' }}>Número de personas</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button
                            onClick={() => setSplitPersons(p => Math.max(2, p - 1))}
                            disabled={splitPersons <= 2}
                            style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: '#F1F2F6', border: 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: splitPersons <= 2 ? 'not-allowed' : 'pointer',
                              opacity: splitPersons <= 2 ? 0.4 : 1,
                            }}>
                            <Minus size={11} color="#1E1E1E" />
                          </button>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#1E1E1E', minWidth: 20, textAlign: 'center', fontFamily: 'Montserrat, sans-serif' }}>{splitPersons}</span>
                          <button
                            onClick={() => setSplitPersons(p => Math.min(8, p + 1))}
                            style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: '#F1F2F6', border: 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            }}>
                            <Plus size={11} color="#1E1E1E" />
                          </button>
                        </div>
                      </div>

                      {/* Person rows */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {Array.from({ length: splitPersons }).map((_, i) => {
                          const idx    = i + 1;
                          const amount = customAmounts[i] ?? 0;
                          return (
                            <CustomPersonRow
                              key={idx}
                              label={`Persona ${idx}`}
                              value={amount}
                              isValid={customDiff === 0}
                              isError={customDiff < 0}
                              onChange={val => {
                                // Mark this field as manually edited
                                setCamposEditados(prev => new Set(prev).add(i));
                                setCustomAmounts(prev => {
                                  const next = [...prev];
                                  next[i] = val;
                                  // Identify auto fields (not manually edited, excluding current)
                                  const newEditados = new Set(camposEditados).add(i);
                                  const autoIndices = Array.from({ length: splitPersons }, (_, j) => j)
                                    .filter(j => !newEditados.has(j));
                                  if (autoIndices.length > 0) {
                                    // Remainder = total minus all manually-edited fields
                                    const editedSum = Array.from(newEditados).reduce((s, j) => s + next[j], 0);
                                    const remaining = grandTotal - editedSum;
                                    const base = Math.floor(remaining / autoIndices.length);
                                    let extra = remaining - base * autoIndices.length;
                                    for (const j of autoIndices) {
                                      next[j] = base + (extra > 0 ? 1 : 0);
                                      if (extra > 0) extra--;
                                    }
                                  }
                                  return next;
                                });
                              }}
                            />
                          );
                        })}
                      </div>

                      {/* Validation row */}
                      <div style={{
                        paddingTop: 10, borderTop: '1px solid #F0F0F0',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ fontSize: 13, color: '#606060', fontFamily: 'Montserrat, sans-serif' }}>
                          Total asignado: <strong style={{ color: '#1E1E1E' }}>${customTotal.toLocaleString()}</strong>
                        </span>
                        {customDiff === 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669' }}>
                            <CheckCircle2 size={13} />
                            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Correcto</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FF2947' }}>
                            <AlertTriangle size={13} />
                            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
                              {customDiff > 0
                                ? `Falta: $${customDiff.toLocaleString()}`
                                : `Excede: $${Math.abs(customDiff).toLocaleString()}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              </div>{/* end dividir section */}

              {/* ─── 4. PROPINA ─── */}
              <Divider />
              <div style={{ padding: '16px 24px' }}>
              <SectionLabel
                label="Propina"
                hint={tipAmount > 0 ? (
                  <span style={{
                    background: '#121E6C', color: '#fff', borderRadius: 4,
                    padding: '2px 8px', fontSize: 11, fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif',
                  }}>+${tipAmount.toLocaleString()}</span>
                ) : undefined}
              />

              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                {([['0', '0%'], ['10', 'Sugerida 10%'], ['manual', 'Manual']] as [TipMode, string][]).map(([m, l]) => (
                  <button key={m}
                    onClick={() => {
                      if (m !== 'manual' && tipMode === 'manual') setTipManualLines([EMPTY_TIP_LINE()]);
                      setTipMode(m as TipMode);
                    }}
                    style={{
                      background: 'none', border: 'none',
                      borderBottom: tipMode === m ? '2px solid #121E6C' : '2px solid transparent',
                      paddingBottom: 4,
                      fontSize: 14, fontWeight: tipMode === m ? 700 : 400,
                      color: tipMode === m ? '#121E6C' : '#606060',
                      cursor: 'pointer', transition: 'all 150ms ease',
                      whiteSpace: 'nowrap', fontFamily: 'Montserrat, sans-serif',
                    }}
                  >{l}</button>
                ))}
              </div>

              {tipMode === 'manual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {tipManualLines.map((line, idx) => (
                    <div key={line.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {/* Método de pago */}
                      <div style={{ position: 'relative', flexShrink: 0, width: 148 }}>
                        <select
                          value={line.method}
                          onChange={e => setTipManualLines(prev => prev.map(l => l.id === line.id ? { ...l, method: e.target.value } : l))}
                          style={{
                            width: '100%', height: 40, paddingLeft: 10, paddingRight: 28,
                            border: '1.5px solid #C7CBE0', borderRadius: 8,
                            fontSize: 13, fontWeight: 500, color: '#1E1E1E',
                            fontFamily: 'Montserrat, sans-serif',
                            background: '#fff', appearance: 'none', WebkitAppearance: 'none',
                            cursor: 'pointer', outline: 'none', boxSizing: 'border-box',
                          }}
                        >
                          {TIP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <ChevronDown size={14} color="#606060" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                      {/* Monto */}
                      <div style={{ flex: 1 }}>
                        <MoneyInput
                          value={line.amount}
                          onChange={v => setTipManualLines(prev => prev.map(l => l.id === line.id ? { ...l, amount: v } : l))}
                          placeholder="0"
                          autoFocus={idx === 0}
                        />
                      </div>
                      {/* Eliminar fila */}
                      <button
                        onClick={() => tipManualLines.length > 1 && setTipManualLines(prev => prev.filter(l => l.id !== line.id))}
                        disabled={tipManualLines.length === 1}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: '1px solid #E0E0E0',
                          background: tipManualLines.length === 1 ? '#F5F5F5' : '#fff',
                          cursor: tipManualLines.length === 1 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, color: tipManualLines.length === 1 ? '#CCCCCC' : '#606060',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {/* Agregar fila */}
                  <button
                    onClick={() => setTipManualLines(prev => [...prev, EMPTY_TIP_LINE()])}
                    style={{
                      alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 4,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, color: '#121E6C',
                      fontFamily: 'Montserrat, sans-serif', padding: '2px 0',
                    }}
                  >
                    <Plus size={14} /> Agregar propina
                  </button>
                </div>
              )}

              <p style={{
                fontSize: 11, fontWeight: 400, color: '#909090',
                display: 'flex', alignItems: 'flex-start', gap: 4, marginTop: 8,
                fontFamily: 'Montserrat, sans-serif',
              }}>
                <span style={{ flexShrink: 0 }}>ℹ</span>
                La propina no afecta la base del IVA. Se suma directamente al total.
              </p>
              </div>{/* end propina section */}

              {/* ─── 5. MÉTODO DE PAGO ─── */}
              <Divider />
              <div style={{ padding: '16px 24px' }}>
              <SectionLabel label="Método de pago" />

              {/* Split progress — fila de estado */}
              {splitBill && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Montserrat, sans-serif' }}>
                      Pagadas: {paidAccounts.size} de {totalSplits}
                    </p>
                    {!allAccountsPaid && (
                      <p style={{ fontSize: 11, fontWeight: 400, color: '#606060', fontFamily: 'Montserrat, sans-serif' }}>
                        Restante: ${remainingAfterPaid.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Array.from({ length: totalSplits }).map((_, i) => {
                      const idx       = i + 1;
                      const isPaid    = paidAccounts.has(idx);
                      const isCurrent = !isPaid && currentAccount === idx;
                      const amount    = amountForAccount(idx);
                      const label     = `Persona ${idx}`;

                      return (
                        <button key={idx}
                          onClick={() => !isPaid && setCurrentAccount(idx)}
                          disabled={isPaid}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 8, textAlign: 'left',
                            cursor: isPaid ? 'default' : 'pointer',
                            background: isCurrent ? '#F1F2F6' : '#F8F8F8',
                            borderLeft: isCurrent ? '3px solid #121E6C' : isPaid ? '3px solid #059669' : '3px solid transparent',
                            border: isPaid ? '1px solid #C7CBE0' : isCurrent ? '1px solid #C7CBE0' : '1px solid transparent',
                            transition: 'all 150ms ease',
                          }}
                        >
                          {/* Radio dot */}
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                            border: `2px solid ${isPaid ? '#059669' : isCurrent ? '#121E6C' : '#C7CBE0'}`,
                            background: isPaid ? '#059669' : isCurrent ? '#121E6C' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {(isPaid || isCurrent) && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                          </div>

                          <div style={{ flex: 1 }}>
                            <p style={{
                              fontSize: 13, fontWeight: 600, fontFamily: 'Montserrat, sans-serif',
                              color: isPaid ? '#059669' : isCurrent ? '#121E6C' : '#1E1E1E',
                              textDecoration: isPaid ? 'line-through' : 'none',
                            }}>{label}</p>
                            <p style={{
                              fontSize: 11, fontWeight: isPaid ? 400 : isCurrent ? 500 : 400,
                              color: isPaid ? '#059669' : isCurrent ? '#121E6C' : '#909090',
                              fontFamily: 'Montserrat, sans-serif',
                            }}>
                              {isPaid ? 'Pagada' : isCurrent ? 'Cobrando ahora' : 'Pendiente'}
                            </p>
                          </div>

                          <span style={{
                            fontSize: 14, fontWeight: 700, flexShrink: 0,
                            color: isPaid ? '#059669' : isCurrent ? '#121E6C' : '#1E1E1E',
                            fontFamily: 'Montserrat, sans-serif',
                          }}>${amount.toLocaleString()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment method form — only when accounts remain */}
              {(!splitBill || !allAccountsPaid) && (
                <>
                  {splitBill && (
                    <p style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.8px', color: '#909090',
                      marginTop: 16, marginBottom: 8,
                      borderTop: '1px solid #F0F0F0', paddingTop: 12,
                      fontFamily: 'Montserrat, sans-serif',
                    }}>Método para {splitLabel}</p>
                  )}

                  {/* Grid 2×2 de métodos */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {([
                      ['cash',     <Banknote size={14} />,       'Efectivo'],
                      ['card',     <CreditCard size={14} />,     'Tarjeta'],
                      ['transfer', <ArrowLeftRight size={14} />, 'Transferencia'],
                      ['mixed',    <Layers size={14} />,         'Mixto'],
                    ] as [PaymentMethod, React.ReactNode, string][]).map(([m, icon, label]) => {
                      const isActive = paymentMethod === m;
                      return (
                        <button key={m}
                          onClick={() => setPaymentMethod(m)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 12px', borderRadius: 8,
                            border: isActive ? '1.5px solid #121E6C' : '1.5px solid #C7CBE0',
                            background: isActive ? '#F1F2F6' : '#fff',
                            fontSize: 13, fontWeight: 500,
                            color: isActive ? '#121E6C' : '#1E1E1E',
                            fontFamily: 'Montserrat, sans-serif',
                            cursor: 'pointer', transition: 'all 150ms ease',
                          }}
                        >
                          <span style={{ color: isActive ? '#121E6C' : '#606060', display: 'flex' }}>{icon}</span>
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Efectivo ── */}
                  {paymentMethod === 'cash' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#121E6C', fontFamily: 'Montserrat, sans-serif', lineHeight: '20px' }}>Monto recibido</span>
                        <MoneyInput value={cashReceived} onChange={setCashReceived} placeholder={currentAmountToPay.toLocaleString()} autoFocus />
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 8,
                        background: cashNum >= currentAmountToPay && cashNum > 0 ? '#F0FFF4' : cashNum > 0 ? '#FFF0F2' : '#F1F2F6',
                      }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                          color: cashNum >= currentAmountToPay && cashNum > 0 ? '#059669' : cashNum > 0 ? '#FF2947' : '#606060',
                          fontFamily: 'Montserrat, sans-serif',
                        }}>
                          {cashNum >= currentAmountToPay && cashNum > 0 ? 'Cambio' : cashNum > 0 ? 'Faltan' : 'Cambio'}
                        </span>
                        <span style={{
                          fontSize: 18, fontWeight: 700,
                          color: cashNum >= currentAmountToPay && cashNum > 0 ? '#059669' : cashNum > 0 ? '#FF2947' : '#909090',
                          fontFamily: 'Montserrat, sans-serif',
                        }}>
                          ${cashNum > 0 ? Math.abs(cashChange).toLocaleString() : '—'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── Tarjeta ── */}
                  {paymentMethod === 'card' && (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '12px 16px', borderRadius: 8, background: '#F1F2F6',
                      fontSize: 13, fontWeight: 500, color: '#606060', fontFamily: 'Montserrat, sans-serif',
                    }}>
                      <CreditCard size={15} color="#606060" /> Terminal conectada (simulado)
                    </div>
                  )}

                  {/* ── Transferencia ── */}
                  {paymentMethod === 'transfer' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '12px 16px', borderRadius: 8, background: '#F1F2F6',
                        fontSize: 13, fontWeight: 500, color: '#606060', fontFamily: 'Montserrat, sans-serif',
                      }}>
                        <ArrowLeftRight size={15} color="#606060" /> Confirma la recepción antes de proceder
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                        <div
                          onClick={() => setTransferConfirmed(!transferConfirmed)}
                          style={{
                            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                            border: `2px solid ${transferConfirmed ? '#059669' : '#C7CBE0'}`,
                            background: transferConfirmed ? '#059669' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 150ms ease',
                          }}
                        >
                          {transferConfirmed && <Check size={11} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif' }}>Transferencia confirmada</span>
                      </label>
                    </div>
                  )}

                  {/* ── Mixto ── */}
                  {paymentMethod === 'mixed' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {([
                          [<Banknote size={13} />,       'Efectivo',      mixCash,     setMixCash],
                          [<CreditCard size={13} />,     'Tarjeta',       mixCard,     setMixCard],
                          [<ArrowLeftRight size={13} />, 'Transferencia', mixTransfer, setMixTransfer],
                        ] as [React.ReactNode, string, string, (v: string) => void][]).map(([icon, label, value, setter]) => (
                          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 600, color: '#121E6C', fontFamily: 'Montserrat, sans-serif', lineHeight: '20px' }}>{icon} {label}</span>
                            <MoneyInput value={value} onChange={setter} />
                          </div>
                        ))}
                      </div>

                      {/* Barra resumen mixto */}
                      <div style={{
                        background: '#F1F2F6', borderRadius: 8, padding: '12px 0',
                        display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
                      }}>
                        {[
                          { l: 'Total',  v: currentAmountToPay, color: '#1E1E1E' },
                          null,
                          { l: 'Pagado', v: totalMixedPaid, color: totalMixedPaid >= currentAmountToPay ? '#059669' : '#1E1E1E' },
                          null,
                          { l: mixRemaining > 0 ? 'Falta' : 'Cambio', v: Math.abs(mixRemaining > 0 ? mixRemaining : mixChange), color: mixRemaining > 0 ? '#FF2947' : '#059669' },
                        ].map((col, idx) =>
                          col === null ? (
                            <div key={idx} style={{ background: '#C7CBE0', width: 1 }} />
                          ) : (
                            <div key={col.l} style={{ textAlign: 'center', padding: '0 8px' }}>
                              <p style={{
                                fontSize: 10, fontWeight: 700, color: '#606060',
                                textTransform: 'uppercase', letterSpacing: '0.8px',
                                marginBottom: 4, fontFamily: 'Montserrat, sans-serif',
                              }}>{col.l}</p>
                              <p style={{ fontSize: 15, fontWeight: 700, color: col.color, fontFamily: 'Montserrat, sans-serif' }}>
                                ${col.v.toLocaleString()}
                              </p>
                            </div>
                          )
                        )}
                      </div>

                      {totalMixedPaid > currentAmountToPay && mixCashNum === 0 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 12px', borderRadius: 8,
                          background: '#FFFBF0', fontSize: 12, fontWeight: 600,
                          color: '#B38900', fontFamily: 'Montserrat, sans-serif',
                        }}>
                          <AlertTriangle size={13} color="#B38900" /> El cambio requiere efectivo
                        </div>
                      )}
                      {totalMixedPaid > currentAmountToPay && mixCashNum > 0 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 12px', borderRadius: 8,
                          background: '#F0FFF4', fontSize: 12, fontWeight: 600,
                          color: '#059669', fontFamily: 'Montserrat, sans-serif',
                        }}>
                          <CheckCircle2 size={13} color="#059669" /> Cambio en efectivo: ${mixChange.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div style={{ height: 8 }} />
              </div>{/* end payment section */}

              {/* ─── Nota del pedido ─── */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #F5F6FA' }}>
                <p style={{
                  fontSize: 12, fontWeight: 600, color: '#606060',
                  textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif',
                  marginBottom: 8,
                }}>
                  Nota de la orden{' '}
                  <span style={{ fontSize: 11, color: '#9E9E9E', fontWeight: 400, textTransform: 'none' }}>
                    (opcional)
                  </span>
                </p>
                <textarea
                  value={orderNote}
                  onChange={e => setOrderNote(e.target.value)}
                  rows={2}
                  placeholder="Agrega una nota general para el pedido..."
                  style={{
                    width: '100%', borderRadius: 10, border: '1.5px solid #C7CBE0',
                    padding: '10px 12px', fontSize: 13, fontFamily: 'Montserrat, sans-serif',
                    color: '#1E1E1E', background: '#F7F8FB', resize: 'none',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#121E6C'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#C7CBE0'; }}
                />
              </div>
            </>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────
            FOOTER — sticky
            ───────────────────────────────────────────────────── */}
        <div style={{
          background: '#fff', flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 8,
          padding: '16px 24px', borderTop: '1px solid #F0F0F0',
        }}>

          {phase === 'completed' ? (
            <button
              onClick={onClose}
              style={{
                width: '100%', height: 48, borderRadius: 8,
                background: '#121E6C', color: '#fff', border: 'none',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              Finalizar orden
            </button>
          ) : (
            <>
              {/* Total a cobrar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {splitBill && !allAccountsPaid ? (
                    <>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Montserrat, sans-serif' }}>{splitLabel}</p>
                      <p style={{ fontSize: 11, color: '#909090', fontFamily: 'Montserrat, sans-serif' }}>Pagadas {paidAccounts.size} de {totalSplits}</p>
                    </>
                  ) : splitBill && allAccountsPaid ? (
                    <>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Montserrat, sans-serif' }}>✓ Todas pagadas</p>
                      <p style={{ fontSize: 11, color: '#909090', fontFamily: 'Montserrat, sans-serif' }}>Listo para finalizar</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, color: '#606060', fontFamily: 'Montserrat, sans-serif' }}>Total a cobrar</p>
                      {tipAmount > 0 && <p style={{ fontSize: 11, color: '#909090', fontFamily: 'Montserrat, sans-serif' }}>Inc. propina ${tipAmount.toLocaleString()}</p>}
                    </>
                  )}
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#1E1E1E', fontFamily: 'Montserrat, sans-serif' }}>
                  ${(splitBill && !allAccountsPaid ? currentAmountToPay : grandTotal).toLocaleString()}
                </span>
              </div>

              {/* Razón de deshabilitado */}
              {!btnEnabled && disabledReason && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 8,
                  background: '#FFFBF0', fontSize: 12, fontWeight: 500,
                  color: '#B38900', fontFamily: 'Montserrat, sans-serif',
                }}>
                  <AlertTriangle size={12} color="#B38900" /> {disabledReason}
                </div>
              )}

              {/* Botón confirmar */}
              <button
                onClick={handleConfirm}
                disabled={!btnEnabled}
                style={{
                  width: '100%', height: 48, borderRadius: 8, border: 'none',
                  background: !btnEnabled
                    ? '#FFB3BE'
                    : allAccountsPaid && splitBill
                      ? '#059669'
                      : '#FF2947',
                  color: '#fff',
                  fontSize: 15, fontWeight: 700,
                  cursor: !btnEnabled ? 'not-allowed' : 'pointer',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 150ms ease',
                }}
              >
                <CheckCircle2 size={18} color="#fff" />
                {allAccountsPaid && splitBill
                  ? 'Finalizar pago'
                  : splitBill
                    ? `Confirmar pago · ${splitLabel}`
                    : 'Confirmar pago'}
              </button>

              {/* Cancelar */}
              <button
                onClick={onClose}
                style={{
                  width: '100%', height: 36, background: 'transparent', border: 'none',
                  fontSize: 14, fontWeight: 400, color: '#606060',
                  cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
                }}
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Custom person amount row ─────────────────────────────────────────────────

function CustomPersonRow({ label, value, onChange, isValid, isError }: {
  label: string; value: number; onChange: (v: number) => void;
  isValid?: boolean; isError?: boolean;
}) {
  const [focused,    setFocused]    = React.useState(false);
  const [localInput, setLocalInput] = React.useState('');

  // When focus is gained: show raw digits for easy editing
  const handleFocus = () => {
    setLocalInput(value > 0 ? String(value) : '');
    setFocused(true);
  };

  // When focus is lost: commit parsed value, clear local input
  const handleBlur = () => {
    const parsed = parseInt(localInput.replace(/[^0-9]/g, ''), 10) || 0;
    onChange(parsed);
    setLocalInput('');
    setFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setLocalInput(raw);
    const parsed = parseInt(raw, 10) || 0;
    onChange(parsed);
  };

  const displayValue = focused
    ? localInput
    : value > 0 ? value.toLocaleString('es-CO') : '';

  const borderColor = focused ? '#121E6C' : isValid ? '#059669' : isError ? '#FF2947' : '#C7CBE0';
  const textColor   = isValid ? '#059669' : isError ? '#FF2947' : '#1E1E1E';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: isValid ? '#059669' : '#121E6C', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ position: 'relative', width: 140, flexShrink: 0 }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: '#606060', pointerEvents: 'none', fontSize: 14, fontWeight: 500,
          fontFamily: 'Montserrat, sans-serif',
        }}>$</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder="0"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            width: '100%', height: 36, boxSizing: 'border-box',
            borderRadius: 12,
            border: `1.5px solid ${borderColor}`,
            background: isValid ? '#F0FFF4' : isError ? '#FFF0F2' : '#F7F8FB',
            fontFamily: 'Montserrat, sans-serif', fontSize: 14,
            fontWeight: 600, color: textColor,
            padding: '0 12px 0 28px', textAlign: 'right',
            outline: 'none',
            transition: 'border-color 200ms',
          }}
        />
      </div>
    </div>
  );
}

// ─── Small display helper ─────────────────────────────────────────────────────

function Row({ label, value, colored }: { label: string; value: string; colored?: 'blue' | 'green' }) {
  const color = colored === 'blue' ? 'var(--blue-100)' : colored === 'green' ? '#059669' : '#606060';
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      paddingTop: 8, paddingBottom: 8,
      borderBottom: '1px solid #F0F0F0',
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: 'Montserrat, sans-serif' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'Montserrat, sans-serif' }}>{value}</span>
    </div>
  );
}