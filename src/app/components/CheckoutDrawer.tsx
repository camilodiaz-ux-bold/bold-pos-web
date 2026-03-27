import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Printer, CreditCard, CheckCircle2, Minus, Plus,
  AlertTriangle, Users, Banknote, ArrowLeftRight, Layers,
  Check, Send,
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
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed';

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
    <div className="flex items-center gap-2 mb-[14px]">
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--black-40)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      {hint}
    </div>
  );
}

function MoneyInput({
  value, onChange, placeholder, autoFocus,
}: { value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--black-40)] pointer-events-none">$</span>
      <input
        type="number" min={0}
        placeholder={placeholder ?? '0'}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        className="pos-input pl-8 font-semibold"
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

  // ── Comanda post-pago ─────────────────────────────────────────────────────
  const [comandaSentAfterPay, setComandaSentAfterPay] = useState(false);

  // ── B. Dividir cuenta ─────────────────────────────────────────────────────
  const [splitBill,    setSplitBill]    = useState(false);
  const [splitMode,    setSplitMode]    = useState<SplitMode>('equal');
  const [splitPersons, setSplitPersons] = useState(2);

  // ── E. Montos personalizados ──────────────────────────────────────────────
  const [customAmounts, setCustomAmounts] = useState<number[]>([0, 0]);

  // Split payment progress
  const [paidAccounts,   setPaidAccounts]   = useState<Set<number>>(new Set());
  const [currentAccount, setCurrentAccount] = useState(1);

  // ── C. Propina ────────────────────────────────────────────────────────────
  const [tipMode,   setTipMode]   = useState<TipMode>('10');
  const [tipManual, setTipManual] = useState('');

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
  const tax             = Math.round(subtotal * 0.19);
  const subtotalWithTax = subtotal + tax;

  const tipAmount = useMemo(() => {
    if (tipMode === '0')  return 0;
    if (tipMode === '10') return Math.round(subtotalWithTax * 0.10);
    const n = parseFloat(tipManual.replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : Math.round(n);
  }, [tipMode, tipManual, subtotalWithTax]);

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
  }, [splitBill, splitMode, splitPersons, numAccounts]);

  // Reset customAmounts to zero when switching TO custom mode
  useEffect(() => {
    if (splitMode === 'custom') {
      setCustomAmounts(Array(splitPersons).fill(0));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitMode]);

  // Resize customAmounts array when splitPersons changes (preserves existing values)
  useEffect(() => {
    if (splitMode === 'custom') {
      setCustomAmounts(prev => Array.from({ length: splitPersons }, (_, i) => prev[i] ?? 0));
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
        <div className="flex items-start justify-between shrink-0" style={{ padding: '20px 24px', borderBottom: '1px solid var(--black-10)' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--black-40)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Checkout</p>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--black-100)', lineHeight: 1.1 }}>{title}</h2>
            {(subtitle || meta) && (
              <p style={{ fontSize: 13, color: 'var(--black-60)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                {subtitle && <span>{subtitle}</span>}
                {subtitle && meta && <span style={{ color: 'var(--black-40)' }}>·</span>}
                {meta && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {meta}</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0" style={{ marginTop: 2 }}>
            <button
              onClick={() => toast.info('Documento enviado a impresora')}
              className="btn btn-secondary btn--sm"
            >
              <Printer size={12} /> Imprimir pre-cuenta
            </button>
            <button onClick={onClose} className="btn btn--icon" style={{ color: 'var(--black-40)' }}>
              <X size={18} />
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
          {phase === 'completed' ? (
            <div className="flex flex-col items-center px-7 py-10 gap-6">
              {/* Big checkmark */}
              <div className="w-20 h-20 rounded-full bg-[var(--feedback-success-10)] border-4 border-[var(--feedback-success-100)] flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 size={40} className="text-[var(--feedback-success-150)]" />
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-[var(--black-100)] mb-1">Pago completado</h3>
                <p className="text-sm text-[var(--black-60)]">{title} ha sido pagada correctamente</p>
              </div>

              {/* Summary card */}
              <div className="w-full bg-[var(--blue-10)] rounded-[var(--radius-16)] border border-[var(--black-10)] p-5">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-[11px] font-semibold text-[var(--black-40)] uppercase tracking-wide">Total cobrado</span>
                  <span className="text-[24px] font-extrabold text-[var(--black-100)]">${grandTotal.toLocaleString()}</span>
                </div>
                <div className="border-t border-[var(--black-10)] pt-4 flex flex-col gap-2">
                  <Row label="Método" value={paymentDisplay} />
                  {subtitle && <Row label="Ubicación" value={subtitle} />}
                  <Row label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
                  <Row label="IVA 19%" value={`$${tax.toLocaleString()}`} />
                  {tipAmount > 0 && <Row label="Propina" value={`+$${tipAmount.toLocaleString()}`} colored="blue" />}
                </div>
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-3">

                {/* ── Comanda a cocina — solo Mostrador (Mesas ya la enviaron durante el servicio) ── */}
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
                      className={cn(
                        'btn w-full',
                        comandaSentAfterPay
                          ? 'btn-secondary'
                          : 'btn-primary',
                      )}
                      style={{ padding: '12px 20px' }}
                    >
                      <Send size={15} />
                      {comandaSentAfterPay ? 'Reenviar comanda' : 'Enviar comanda'}
                    </button>
                  </div>
                )}

                {/* ── Imprimir factura ── */}
                <button
                  onClick={() => toast.info('Documento enviado a impresora')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left group transition-all"
                  style={{ border: '1.5px solid var(--black-10)', borderRadius: 'var(--radius-8)', background: '#fff', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-10)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: 'var(--blue-10)', borderRadius: 'var(--radius-8)' }}>
                    <Printer size={16} style={{ color: 'var(--blue-100)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--black-100)' }}>Imprimir factura</p>
                    <p style={{ fontSize: 11, color: 'var(--black-60)' }}>Enviar a impresora fiscal</p>
                  </div>
                </button>

                {/* ── Cerrar orden ── */}
                <button onClick={onClose} className="btn btn-cancel w-full">
                  Cerrar orden
                </button>
              </div>
            </div>

          ) : (

            /* ═══════════════════════════════════════════════════
               PHASE: CHECKOUT
               ═══════════════════════════════════════════════════ */
            <>
              {/* ─── 1. RESUMEN DEL PEDIDO ─── */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--black-10)' }}>
                <SectionLabel label="Resumen del pedido"
                  hint={<span style={{ fontSize: 10, fontWeight: 700, color: 'var(--black-40)', background: 'var(--blue-10)', padding: '2px 8px', borderRadius: 10 }}>{items.length} ítem{items.length !== 1 ? 's' : ''}</span>}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 14, color: 'var(--black-100)' }}>{item.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--black-40)' }}>× {item.quantity}</span>
                        </div>
                        {item.note && <p style={{ fontSize: 10, color: 'var(--black-60)', fontStyle: 'italic', marginTop: 2 }}>{item.note}</p>}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--black-100)', flexShrink: 0 }}>
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--black-60)' }}>
                    <span>Subtotal</span><span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--black-60)' }}>
                    <span>IVA 19%</span><span>${tax.toLocaleString()}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--blue-100)', fontWeight: 600 }}>
                      <span>Propina {tipMode === '10' ? '(10%)' : '(Manual)'}</span>
                      <span>+${tipAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, marginTop: 4, borderTop: '2px solid var(--black-100)' }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--black-100)' }}>Total</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--black-100)' }}>${grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* ─── 2. DIVIDIR CUENTA ─── */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--black-10)' }}>
              <SectionLabel label="¿Dividir cuenta?"
                hint={splitBill ? (
                  <span className="text-[10px] font-bold text-[var(--blue-100)] bg-[var(--blue-10)] border border-[var(--black-10)] px-2 py-0.5 rounded-full">
                    {splitPersons} personas
                  </span>
                ) : undefined}
              />

              {/* Toggle */}
              <div className="flex items-center gap-2 mb-5">
                {(['No', 'Sí'] as const).map(opt => (
                  <button key={opt}
                    onClick={() => setSplitBill(opt === 'Sí')}
                    style={{
                      padding: '8px 24px',
                      borderRadius: 'var(--radius-8)',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      transition: 'all 150ms ease',
                      ...((opt === 'No') === !splitBill
                        ? { background: 'var(--blue-100)', color: '#fff', borderColor: 'var(--blue-100)' }
                        : { background: '#fff', color: 'var(--black-60)', borderColor: 'var(--black-10)' })
                    }}
                  >{opt}</button>
                ))}
              </div>

              {splitBill && (
                <div className="flex flex-col gap-4">
                  {/* Mode tabs */}
                  <div className="flex gap-2">
                    {([['equal', 'Partes iguales'], ['custom', 'Personalizado']] as [SplitMode, string][]).map(([m, l]) => (
                      <button key={m}
                        onClick={() => setSplitMode(m)}
                        className={cn('flex-1 py-2.5 rounded-[var(--radius-12)] border-2 text-xs font-semibold transition-all',
                          splitMode === m ? 'border-[var(--blue-100)] bg-[var(--blue-10)] text-[var(--blue-100)]' : 'border-[var(--black-10)] text-[var(--black-60)] hover:border-[var(--blue-100)]')}
                      >{l}</button>
                    ))}
                  </div>

                  {/* ── Partes iguales ── */}
                  {splitMode === 'equal' && (
                    <div className="flex flex-col gap-3">
                      {/* Stepper */}
                      <div className="flex items-center justify-between bg-[var(--blue-10)] rounded-[var(--radius-16)] px-4 py-3 border border-[var(--black-10)]">
                        <span className="text-xs font-bold text-[var(--black-60)]">Número de personas</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setSplitPersons(p => Math.max(2, p - 1))} disabled={splitPersons <= 2}
                            className={cn('w-7 h-7 rounded-full border flex items-center justify-center transition-all',
                              splitPersons > 2 ? 'border-[var(--black-10)] hover:border-[var(--blue-100)] hover:text-[var(--blue-100)]' : 'border-[var(--black-10)] text-[var(--black-40)] cursor-not-allowed')}>
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm font-black text-[var(--black-100)]">{splitPersons}</span>
                          <button onClick={() => setSplitPersons(p => p + 1)}
                            className="w-7 h-7 rounded-full border border-[var(--black-10)] flex items-center justify-center hover:border-[var(--blue-100)] hover:text-[var(--blue-100)] transition-all">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Person cards — show payment status */}
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: Math.min(splitPersons, 8) }).map((_, i) => {
                          const idx     = i + 1;
                          const isPaid  = paidAccounts.has(idx);
                          const isCurrent = !isPaid && currentAccount === idx;
                          return (
                            <button key={i}
                              onClick={() => !isPaid && setCurrentAccount(idx)}
                              className={cn('p-3 rounded-[var(--radius-16)] border-2 text-center transition-all',
                                isPaid      ? 'bg-[var(--feedback-success-10)] border-[var(--feedback-success-100)] cursor-default' :
                                isCurrent   ? 'bg-[var(--blue-10)] border-blue-400 ring-2 ring-blue-200 ring-offset-1' :
                                              'bg-[var(--blue-10)] border-[var(--black-10)] hover:border-[var(--black-10)] cursor-pointer')}
                            >
                              <p className={cn('text-[9px] font-black uppercase tracking-widest mb-1',
                                isPaid ? 'text-[var(--feedback-success-150)]' : isCurrent ? 'text-[var(--blue-100)]' : 'text-[var(--black-40)]')}>
                                {isPaid ? '✓ Pagada' : isCurrent ? '→ Cobrando' : `Persona ${idx}`}
                              </p>
                              <p className={cn('text-sm font-black',
                                isPaid ? 'text-[var(--feedback-success-200)] line-through opacity-60' : isCurrent ? 'text-[var(--blue-100)]' : 'text-[var(--black-100)]')}>
                                ${amountForPerson(i).toLocaleString()}
                              </p>
                            </button>
                          );
                        })}
                        {splitPersons > 8 && (
                          <div className="col-span-2 text-center text-[11px] font-bold text-[var(--black-40)] py-1">
                            + {splitPersons - 8} personas más · ${perPersonFloor.toLocaleString()} c/u
                          </div>
                        )}
                      </div>

                      {perPersonRemainder > 0 && (
                        <p className="text-[10px] text-[var(--feedback-warning-100)] font-bold text-center">
                          * Ajuste por redondeo: Persona {splitPersons} paga ${(perPersonFloor + perPersonRemainder).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── Personalizado ── */}
                  {splitMode === 'custom' && (
                    <div className="flex flex-col gap-3">
                      {/* Stepper */}
                      <div className="flex items-center justify-between bg-[var(--blue-10)] rounded-[var(--radius-16)] px-4 py-3 border border-[var(--black-10)]">
                        <span className="text-xs font-bold text-[var(--black-60)]">Número de personas</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setSplitPersons(p => Math.max(2, p - 1))} disabled={splitPersons <= 2}
                            className={cn('w-7 h-7 rounded-full border flex items-center justify-center transition-all',
                              splitPersons > 2 ? 'border-[var(--black-10)] hover:border-[var(--blue-100)] hover:text-[var(--blue-100)]' : 'border-[var(--black-10)] text-[var(--black-40)] cursor-not-allowed')}>
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm font-black text-[var(--black-100)]">{splitPersons}</span>
                          <button onClick={() => setSplitPersons(p => Math.min(8, p + 1))}
                            className="w-7 h-7 rounded-full border border-[var(--black-10)] flex items-center justify-center hover:border-[var(--blue-100)] hover:text-[var(--blue-100)] transition-all">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Person rows with custom amount inputs */}
                      <div className="flex flex-col" style={{ gap: 12 }}>
                        {Array.from({ length: splitPersons }).map((_, i) => {
                          const idx = i + 1;
                          const amount = customAmounts[i] ?? 0;
                          return (
                            <CustomPersonRow
                              key={idx}
                              label={`Persona ${idx}`}
                              value={amount}
                              onChange={val => setCustomAmounts(prev => {
                                const next = [...prev];
                                next[i] = val;
                                return next;
                              })}
                            />
                          );
                        })}
                      </div>

                      {/* Validation row */}
                      <div style={{ marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--black-10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, color: 'var(--black-60)' }}>
                          Total asignado: <strong>${customTotal.toLocaleString()}</strong>
                        </span>
                        {customDiff === 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#059669' }}>
                            <CheckCircle2 size={14} />
                            <span style={{ fontSize: 13, fontWeight: 600 }}>Correcto</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--coral-100)' }}>
                            <AlertTriangle size={14} />
                            <span style={{ fontSize: 13, fontWeight: 600 }}>
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

              {/* ─── 3. PROPINA ─── */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--black-10)' }}>
              <SectionLabel label="Propina"
                hint={tipAmount > 0 ? (
                  <span className="text-[10px] font-bold text-[var(--blue-100)] bg-[var(--blue-10)] border border-[var(--black-10)] px-2 py-0.5 rounded-full">
                    +${tipAmount.toLocaleString()}
                  </span>
                ) : undefined}
              />

              <div className="flex gap-6 mb-3">
                {([['0', '0%'], ['10', 'Sugerida 10%'], ['manual', 'Manual']] as [TipMode, string][]).map(([m, l]) => (
                  <button key={m}
                    onClick={() => setTipMode(m)}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: tipMode === m ? '2px solid var(--blue-100)' : '2px solid transparent',
                      paddingBottom: 4,
                      fontSize: 14,
                      fontWeight: tipMode === m ? 700 : 400,
                      color: tipMode === m ? 'var(--blue-100)' : 'var(--black-60)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      whiteSpace: 'nowrap',
                    }}
                  >{l}</button>
                ))}
              </div>

              {tipMode === 'manual' && (
                <div className="mb-3">
                  <MoneyInput value={tipManual} onChange={setTipManual} placeholder="0" autoFocus />
                </div>
              )}

              <p style={{ fontSize: 10, color: 'var(--black-40)', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>ℹ</span>
                La propina no afecta la base del IVA. Se suma directamente al total.
              </p>
              </div>{/* end propina section */}

              {/* ─── 4. MÉTODO DE PAGO ─── */}
              <div style={{ padding: '20px 24px' }}>
              <SectionLabel label="Método de pago" />

              {/* Split progress tracker (when split is active) */}
              {splitBill && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-[var(--black-60)] uppercase tracking-wide">
                      Pagadas: {paidAccounts.size} de {totalSplits}
                    </p>
                    {!allAccountsPaid && (
                      <p className="text-[10px] font-bold text-[var(--black-60)]">
                        Restante por cobrar: ${remainingAfterPaid.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
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
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-16)] border-2 transition-all text-left',
                            isPaid    ? 'border-[var(--feedback-success-100)] bg-[var(--feedback-success-10)] cursor-default' :
                            isCurrent ? 'border-blue-400 bg-[var(--blue-10)] ring-2 ring-blue-200 ring-offset-1' :
                                        'border-[var(--black-10)] bg-[var(--blue-10)] hover:border-[var(--black-10)] hover:bg-[var(--blue-10)]/50 cursor-pointer',
                          )}
                        >
                          {isPaid ? (
                            <div className="w-5 h-5 rounded-full bg-[var(--feedback-success-150)] flex items-center justify-center shrink-0">
                              <Check size={11} className="text-white" strokeWidth={3} />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-5 h-5 rounded-full bg-[var(--blue-100)] flex items-center justify-center shrink-0 text-white">
                              <span className="text-[9px] font-black">→</span>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-[var(--black-10)] flex items-center justify-center shrink-0 bg-white" />
                          )}

                          <div className="flex-1">
                            <p className={cn('text-xs font-bold',
                              isPaid ? 'text-[var(--feedback-success-200)] line-through' : isCurrent ? 'text-[var(--blue-100)]' : 'text-[var(--black-60)]')}>
                              {label}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className={cn('text-sm font-black',
                              isPaid ? 'text-[var(--feedback-success-150)]' : isCurrent ? 'text-[var(--blue-100)]' : 'text-[var(--black-60)]')}>
                              ${amount.toLocaleString()}
                            </p>
                            <p className={cn('text-[9px] font-bold',
                              isPaid ? 'text-[var(--feedback-success-100)]' : isCurrent ? 'text-[var(--blue-100)]' : 'text-[var(--black-40)]')}>
                              {isPaid ? 'Pagada' : isCurrent ? 'Cobrando ahora' : 'Pendiente'}
                            </p>
                          </div>
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
                    <p className="text-[10px] font-black text-[var(--black-40)] uppercase tracking-wide mb-3">
                      Método para {splitLabel}
                    </p>
                  )}

                  {/* Method selector cards */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {([
                      ['cash',     <Banknote size={15} />,       'Efectivo'],
                      ['card',     <CreditCard size={15} />,     'Tarjeta'],
                      ['transfer', <ArrowLeftRight size={15} />, 'Transferencia'],
                      ['mixed',    <Layers size={15} />,         'Mixto'],
                    ] as [PaymentMethod, React.ReactNode, string][]).map(([m, icon, label]) => (
                      <button key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={cn('flex items-center gap-2 px-4 py-3 rounded-[var(--radius-12)] border-[1.5px] text-sm font-semibold transition-all',
                          paymentMethod === m ? 'border-[var(--blue-100)] bg-[var(--blue-10)] text-[var(--blue-100)]' : 'border-[var(--black-10)] text-[var(--black-60)] hover:border-[var(--blue-100)] hover:bg-[var(--blue-10)]')}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>

                  {/* ── Efectivo ── */}
                  {paymentMethod === 'cash' && (
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[10px] font-black text-[var(--black-40)] uppercase tracking-wide block mb-2">Monto recibido</label>
                        <MoneyInput value={cashReceived} onChange={setCashReceived} placeholder={currentAmountToPay.toLocaleString()} autoFocus />
                      </div>
                      <div className={cn('flex items-center justify-between px-4 py-3 rounded-[var(--radius-16)] border-2 transition-all',
                        cashNum >= currentAmountToPay && cashNum > 0 ? 'bg-[var(--feedback-success-10)] border-[var(--feedback-success-100)]' :
                        cashNum > 0 ? 'bg-[var(--coral-10)] border-red-300' : 'bg-[var(--blue-10)] border-[var(--black-10)]')}
                      >
                        <span className={cn('text-xs font-black uppercase tracking-wide',
                          cashNum >= currentAmountToPay && cashNum > 0 ? 'text-[var(--feedback-success-200)]' : cashNum > 0 ? 'text-[var(--coral-100)]' : 'text-[var(--black-40)]')}>
                          {cashNum >= currentAmountToPay && cashNum > 0 ? 'Cambio' : cashNum > 0 ? 'Faltan' : 'Cambio'}
                        </span>
                        <span className={cn('text-xl font-black',
                          cashNum >= currentAmountToPay && cashNum > 0 ? 'text-[var(--feedback-success-200)]' : cashNum > 0 ? 'text-[var(--coral-100)]' : 'text-[var(--black-40)]')}>
                          ${cashNum > 0 ? Math.abs(cashChange).toLocaleString() : '—'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── Tarjeta ── */}
                  {paymentMethod === 'card' && (
                    <div className="payment-option payment-option--active w-full" style={{ justifyContent: 'center', gap: 8 }}>
                      <CreditCard size={16} className="shrink-0" /> Terminal conectada (simulado)
                    </div>
                  )}

                  {/* ── Transferencia ── */}
                  {paymentMethod === 'transfer' && (
                    <div className="flex flex-col gap-3">
                      <div className="payment-option payment-option--active w-full" style={{ justifyContent: 'center', gap: 8 }}>
                        <ArrowLeftRight size={16} className="shrink-0" /> Confirma la recepción antes de proceder
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => setTransferConfirmed(!transferConfirmed)}
                          className={cn('w-5 h-5 rounded-[var(--radius-8)] border-2 flex items-center justify-center transition-all shrink-0',
                            transferConfirmed ? 'bg-[var(--feedback-success-150)] border-[var(--feedback-success-150)]' : 'border-[var(--black-10)] group-hover:border-[var(--feedback-success-150)]')}
                        >
                          {transferConfirmed && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-bold text-[var(--black-60)]">Transferencia confirmada</span>
                      </label>
                    </div>
                  )}

                  {/* ── Mixto ── */}
                  {paymentMethod === 'mixed' && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3">
                        {([
                          [<Banknote size={14} />,       'Efectivo',      mixCash,     setMixCash],
                          [<CreditCard size={14} />,     'Tarjeta',       mixCard,     setMixCard],
                          [<ArrowLeftRight size={14} />, 'Transferencia', mixTransfer, setMixTransfer],
                        ] as [React.ReactNode, string, string, (v: string) => void][]).map(([icon, label, value, setter]) => (
                          <div key={label}>
                            <label className="flex items-center gap-1.5 text-[10px] font-black text-[var(--black-40)] uppercase tracking-wide mb-1.5">{icon} {label}</label>
                            <MoneyInput value={value} onChange={setter} />
                          </div>
                        ))}
                      </div>

                      {/* Summary bar */}
                      <div className="bg-[var(--blue-10)] rounded-[var(--radius-16)] border border-[var(--black-10)] overflow-hidden">
                        <div className="grid grid-cols-3 divide-x divide-[var(--black-10)]">
                          {[
                            { l: 'Total',  v: currentAmountToPay, cls: 'text-[var(--black-100)]' },
                            { l: 'Pagado', v: totalMixedPaid, cls: totalMixedPaid >= currentAmountToPay ? 'text-[var(--feedback-success-200)]' : 'text-[var(--black-100)]' },
                            { l: mixRemaining > 0 ? 'Falta' : 'Cambio', v: Math.abs(mixRemaining > 0 ? mixRemaining : mixChange), cls: mixRemaining > 0 ? 'text-[var(--coral-100)]' : 'text-[var(--feedback-success-200)]' },
                          ].map(({ l, v, cls }) => (
                            <div key={l} className="p-3 text-center">
                              <p className="text-[9px] font-black text-[var(--black-40)] uppercase tracking-wider mb-1">{l}</p>
                              <p className={cn('text-sm font-black', cls)}>${v.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                        <div className="h-1 bg-[var(--black-10)]">
                          <div className={cn('h-full transition-all duration-300', totalMixedPaid >= currentAmountToPay ? 'bg-[var(--feedback-success-150)]' : 'bg-[var(--blue-100)]')}
                            style={{ width: `${Math.min(100, (totalMixedPaid / Math.max(1, currentAmountToPay)) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {totalMixedPaid > currentAmountToPay && mixCashNum === 0 && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-16)] bg-[var(--feedback-warning-10)] border border-[var(--feedback-warning-10)] text-xs font-bold text-[var(--feedback-warning-150)]">
                          <AlertTriangle size={13} /> El cambio requiere efectivo
                        </div>
                      )}
                      {totalMixedPaid > currentAmountToPay && mixCashNum > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-16)] bg-[var(--feedback-success-10)] border border-[var(--feedback-success-100)] text-xs font-bold text-[var(--feedback-success-200)]">
                          <CheckCircle2 size={13} /> Cambio en efectivo: ${mixChange.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Bottom spacer */}
              <div className="h-4" />
              </div>{/* end payment section */}
            </>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────
            FOOTER — sticky
            ───────────────────────────────────────────────────── */}
        <div className="bg-white shrink-0 flex flex-col" style={{ padding: '16px 24px', borderTop: '1px solid var(--black-10)', gap: 8 }}>

          {phase === 'completed' ? (
            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 16, fontWeight: 700 }}>
              Cerrar y volver
            </button>
          ) : (
            <>
              {/* Total a cobrar row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div>
                  {splitBill && !allAccountsPaid ? (
                    <>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--black-40)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{splitLabel}</p>
                      <p style={{ fontSize: 11, color: 'var(--black-40)' }}>Pagadas {paidAccounts.size} de {totalSplits}</p>
                    </>
                  ) : splitBill && allAccountsPaid ? (
                    <>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>✓ Todas las cuentas pagadas</p>
                      <p style={{ fontSize: 11, color: 'var(--black-40)' }}>Listo para finalizar</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, color: 'var(--black-60)' }}>Total a cobrar</p>
                      {tipAmount > 0 && <p style={{ fontSize: 11, color: 'var(--black-40)' }}>Inc. propina ${tipAmount.toLocaleString()}</p>}
                    </>
                  )}
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--black-100)' }}>
                  ${(splitBill && !allAccountsPaid ? currentAmountToPay : grandTotal).toLocaleString()}
                </span>
              </div>

              {/* Disabled reason */}
              {!btnEnabled && disabledReason && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-16)] bg-[var(--feedback-warning-10)] border border-[var(--feedback-warning-10)] text-xs font-bold text-[var(--feedback-warning-150)]">
                  <AlertTriangle size={12} /> {disabledReason}
                </div>
              )}

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={!btnEnabled}
                className={cn(
                  'btn w-full',
                  btnEnabled
                    ? allAccountsPaid && splitBill
                      ? 'bg-[var(--feedback-success-150)] text-white hover:opacity-90'
                      : 'btn-primary'
                    : 'btn-primary opacity-50 cursor-not-allowed',
                )}
                style={{ padding: 14, fontSize: 16, fontWeight: 700, borderRadius: 'var(--radius-8)' }}
              >
                <CheckCircle2 size={18} />
                {allAccountsPaid && splitBill
                  ? 'Finalizar pago'
                  : splitBill
                    ? `Confirmar pago · ${splitLabel}`
                    : 'Confirmar pago'}
              </button>

              {/* Cancel ghost */}
              <button onClick={onClose} className="btn btn-ghost w-full" style={{ padding: 10, color: 'var(--black-60)' }}>
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

function CustomPersonRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, color: 'var(--black-60)', fontWeight: 500 }}>{label}</span>
      <div style={{ position: 'relative', width: 140 }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--black-40)', pointerEvents: 'none', fontSize: 14, fontWeight: 500,
        }}>$</span>
        <input
          type="number" min={0}
          value={value || ''}
          placeholder="0"
          onChange={e => onChange(parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', height: 44,
            backgroundColor: '#fff',
            border: focused ? '1.5px solid var(--blue-100)' : '1.5px solid var(--black-10)',
            boxShadow: focused ? '0 0 0 3px var(--blue-10)' : 'none',
            borderRadius: 'var(--radius-8)',
            paddingLeft: 28, paddingRight: 12,
            textAlign: 'right',
            fontSize: 16, fontWeight: 600, color: 'var(--black-100)',
            outline: 'none',
            fontFamily: "'Montserrat', sans-serif",
            transition: 'border 150ms ease, box-shadow 150ms ease',
          }}
        />
      </div>
    </div>
  );
}

// ─── Small display helper ─────────────────────────────────────────────────────

function Row({ label, value, colored }: { label: string; value: string; colored?: 'blue' }) {
  return (
    <div className={cn('flex justify-between text-xs font-bold', colored === 'blue' ? 'text-[var(--blue-100)]' : 'text-[var(--black-60)]')}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}