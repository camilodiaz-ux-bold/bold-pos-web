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
type SplitMode     = 'equal' | 'items' | 'custom';
type TipMode       = '0' | '10' | 'manual';
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed';

// ─── Palette for up to 6 split accounts ──────────────────────────────────────

const ACCT = [
  { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200',       active: 'bg-blue-600 border-blue-600 text-white',      idle: 'border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500',       progress: 'border-blue-300 bg-blue-50',    progressDot: 'bg-blue-500' },
  { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', active: 'bg-emerald-600 border-emerald-600 text-white', idle: 'border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-500', progress: 'border-emerald-300 bg-emerald-50', progressDot: 'bg-emerald-500' },
  { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200',    active: 'bg-amber-500 border-amber-500 text-white',     idle: 'border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500',   progress: 'border-amber-300 bg-amber-50',   progressDot: 'bg-amber-500' },
  { dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 border-violet-200', active: 'bg-violet-600 border-violet-600 text-white',   idle: 'border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-500', progress: 'border-violet-300 bg-violet-50', progressDot: 'bg-violet-500' },
  { dot: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 border-rose-200',       active: 'bg-rose-600 border-rose-600 text-white',       idle: 'border-gray-200 text-gray-400 hover:border-rose-300 hover:text-rose-500',     progress: 'border-rose-300 bg-rose-50',     progressDot: 'bg-rose-500' },
  { dot: 'bg-teal-500',    badge: 'bg-teal-50 text-teal-700 border-teal-200',       active: 'bg-teal-600 border-teal-600 text-white',       idle: 'border-gray-200 text-gray-400 hover:border-teal-300 hover:text-teal-500',     progress: 'border-teal-300 bg-teal-50',     progressDot: 'bg-teal-500' },
];

const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', mixed: 'Mixto',
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Divider() {
  return <div className="border-t border-gray-100 my-7" />;
}

function SectionLabel({ label, hint }: { label: string; hint?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      {hint}
    </div>
  );
}

function MoneyInput({
  value, onChange, placeholder, autoFocus,
}: { value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">$</span>
      <input
        type="number" min={0}
        placeholder={placeholder ?? '0'}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
  const [splitBill,       setSplitBill]       = useState(false);
  const [splitMode,       setSplitMode]       = useState<SplitMode>('equal');
  const [splitPersons,    setSplitPersons]    = useState(2);
  const [numAccounts,     setNumAccounts]     = useState(2);
  const [itemAssignments, setItemAssignments] = useState<Record<string, number>>({});

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

  // ── Computed: split (by items) ─────────────────────────────────────────────

  const accountItemSubtotals = useMemo(() => {
    const t: Record<number, number> = {};
    items.forEach(item => {
      const a = itemAssignments[item.id];
      if (a) t[a] = (t[a] ?? 0) + item.price * item.quantity;
    });
    return t;
  }, [items, itemAssignments]);

  const assignedSubtotal = useMemo(
    () => Object.values(accountItemSubtotals).reduce((a, b) => a + b, 0),
    [accountItemSubtotals],
  );

  const unassignedAmount = subtotal - assignedSubtotal;
  const allItemsAssigned = unassignedAmount <= 0;

  // Per-account grand total: item subtotal + proportional tax + proportional tip
  const accountGrandTotals = useMemo(() => {
    const totals: Record<number, number> = {};
    Object.entries(accountItemSubtotals).forEach(([acct, itemSub]) => {
      const ratio = subtotal > 0 ? itemSub / subtotal : 0;
      totals[Number(acct)] = Math.round(itemSub + tax * ratio + tipAmount * ratio);
    });
    return totals;
  }, [accountItemSubtotals, subtotal, tax, tipAmount]);

  // ── Computed: split progress ───────────────────────────────────────────────

  const totalSplits = splitMode === 'equal' || splitMode === 'custom' ? splitPersons : numAccounts;

  const amountForAccount = (idx: number) => // 1-based
    splitMode === 'equal'  ? amountForPerson(idx - 1) :
    splitMode === 'custom' ? (customAmounts[idx - 1] ?? 0) :
    (accountGrandTotals[idx] ?? 0);

  const paidTotal = useMemo(() => {
    let total = 0;
    paidAccounts.forEach(idx => { total += amountForAccount(idx); });
    return total;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidAccounts, splitMode, splitPersons, grandTotal, accountGrandTotals]);

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
    if (splitBill && splitMode === 'items' && !allItemsAssigned) return false;
    if (paymentMethod === 'cash')     return cashNum >= currentAmountToPay;
    if (paymentMethod === 'transfer') return transferConfirmed;
    if (paymentMethod === 'mixed')    return totalMixedPaid >= currentAmountToPay;
    return true; // card
  }, [splitBill, splitMode, customValid, allItemsAssigned, paymentMethod, cashNum, currentAmountToPay, transferConfirmed, totalMixedPaid]);

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

  const toggleAssign = (itemId: string, acct: number) => {
    setItemAssignments(prev => ({ ...prev, [itemId]: prev[itemId] === acct ? 0 : acct }));
  };

  const changeNumAccounts = (n: number) => {
    const clamped = Math.max(2, Math.min(6, n));
    if (clamped < numAccounts) {
      setItemAssignments(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => { if (next[id] > clamped) next[id] = 0; });
        return next;
      });
    }
    setNumAccounts(clamped);
  };

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
    if (splitBill && splitMode === 'items' && !allItemsAssigned)
      return 'Asigna todos los ítems antes de continuar';
    if (paymentMethod === 'cash' && cashNum === 0)
      return 'Ingresa el monto recibido';
    if (paymentMethod === 'cash' && cashNum < currentAmountToPay)
      return `Faltan $${(currentAmountToPay - cashNum).toLocaleString()} para completar`;
    if (paymentMethod === 'transfer' && !transferConfirmed)
      return 'Confirma la transferencia recibida';
    if (paymentMethod === 'mixed' && totalMixedPaid < currentAmountToPay)
      return `Faltan $${mixRemaining.toLocaleString()} por cubrir en pago mixto`;
    return null;
  }, [allAccountsPaid, splitBill, splitMode, allItemsAssigned, paymentMethod, cashNum, currentAmountToPay, transferConfirmed, totalMixedPaid, mixRemaining]);

  // ── Display strings ────────────────────────────────────────────────────────

  const splitLabel = splitMode === 'equal'
    ? `Persona ${currentAccount}`
    : `Cta. ${currentAccount}`;

  const paymentDisplay = splitBill
    ? `Dividido · ${totalSplits} ${splitMode === 'equal' ? 'personas' : 'cuentas'}`
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
        className="fixed right-0 top-0 bottom-0 z-[210] w-[520px] bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >

        {/* ─────────────────────────────────────────────────────
            HEADER — sticky
            ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-7 pt-5 pb-4 border-b border-gray-100 bg-white shrink-0">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Checkout</p>
            <h2 className="text-[26px] font-black text-gray-900 leading-none tracking-tight">{title}</h2>
            {(subtitle || meta) && (
              <p className="text-xs font-bold text-gray-500 mt-1.5 flex items-center gap-2">
                {subtitle && <span>{subtitle}</span>}
                {subtitle && meta && <span className="text-gray-300">·</span>}
                {meta && <span className="flex items-center gap-1"><Users size={11} /> {meta}</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <button
              onClick={() => toast.info('Documento enviado a impresora')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-violet-600 hover:bg-violet-50 border border-violet-200 transition-all whitespace-nowrap"
            >
              <Printer size={12} /> Imprimir pre-cuenta
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
            >
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
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 size={40} className="text-emerald-600" />
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 mb-1">Pago completado</h3>
                <p className="text-sm text-gray-500">{title} ha sido pagada correctamente</p>
              </div>

              {/* Summary card */}
              <div className="w-full bg-gray-50 rounded-2xl border border-gray-200 p-5">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total cobrado</span>
                  <span className="text-2xl font-black text-gray-900">${grandTotal.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex flex-col gap-2">
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
                    'rounded-2xl border p-4 flex flex-col gap-3 transition-all',
                    comandaSentAfterPay
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-blue-50 border-blue-100',
                  )}>
                    <div className="flex items-center gap-2">
                      {comandaSentAfterPay
                        ? <CheckCircle2 size={14} className="text-emerald-600" />
                        : <Send size={14} className="text-blue-600" />
                      }
                      <p className={cn('text-xs font-black uppercase tracking-wider',
                        comandaSentAfterPay ? 'text-emerald-700' : 'text-blue-700',
                      )}>
                        {comandaSentAfterPay ? 'Comanda enviada a cocina' : 'Enviar comanda a cocina'}
                      </p>
                    </div>
                    {!comandaSentAfterPay && (
                      <p className="text-[11px] text-blue-600 leading-snug">
                        Los ítems de esta orden serán enviados a cocina para su preparación.
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setComandaSentAfterPay(true);
                        toast.success(comandaSentAfterPay ? 'Comanda reenviada a cocina' : 'Comanda enviada a cocina');
                      }}
                      className={cn(
                        'w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all',
                        comandaSentAfterPay
                          ? 'border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-blue-700 text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800',
                      )}
                    >
                      <Send size={15} />
                      {comandaSentAfterPay ? 'Reenviar comanda' : 'Enviar comanda'}
                    </button>
                  </div>
                )}

                {/* ── Imprimir factura ── */}
                <button
                  onClick={() => toast.info('Documento enviado a impresora')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors shrink-0">
                    <Printer size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Imprimir factura</p>
                    <p className="text-[10px] text-gray-400">Enviar a impresora fiscal</p>
                  </div>
                </button>

                {/* ── Cerrar orden ── */}
                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cerrar orden
                </button>
              </div>
            </div>

          ) : (

            /* ═══════════════════════════════════════════════════
               PHASE: CHECKOUT
               ═══════════════════════════════════════════════════ */
            <div className="px-7 py-6">

              {/* ─── 1. RESUMEN DEL PEDIDO (always visible) ─── */}
              <SectionLabel label="Resumen del pedido"
                hint={<span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{items.length} ítem{items.length !== 1 ? 's' : ''}</span>}
              />

              <div className="flex flex-col gap-3 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-gray-800">{item.name}</span>
                        <span className="text-[11px] font-bold text-gray-400">× {item.quantity}</span>
                      </div>
                      {item.note && <p className="text-[10px] text-gray-400 italic mt-0.5">{item.note}</p>}
                    </div>
                    <span className="text-sm font-bold text-gray-700 shrink-0">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex flex-col gap-1.5">
                <Row label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
                <Row label="IVA 19%" value={`$${tax.toLocaleString()}`} />
                {tipAmount > 0 && <Row label={`Propina ${tipMode === '10' ? '(10%)' : '(Manual)'}`} value={`+$${tipAmount.toLocaleString()}`} colored="blue" />}
                <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-gray-200">
                  <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-black text-gray-900">${grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Divider />

              {/* ─── 2. DIVIDIR CUENTA ─── */}
              <SectionLabel label="¿Dividir cuenta?"
                hint={splitBill ? (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    {splitMode === 'equal' ? `${splitPersons} personas` : allItemsAssigned ? 'Asignado ✓' : 'Pendiente'}
                  </span>
                ) : undefined}
              />

              {/* Toggle */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-xl w-fit mb-5">
                {(['No', 'Sí'] as const).map(opt => (
                  <button key={opt}
                    onClick={() => setSplitBill(opt === 'Sí')}
                    className={cn('px-5 py-2 rounded-lg text-xs font-bold transition-all',
                      (opt === 'No') === !splitBill ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
                  >{opt}</button>
                ))}
              </div>

              {splitBill && (
                <div className="flex flex-col gap-4">
                  {/* Mode tabs */}
                  <div className="flex gap-2">
                    {([['equal', 'Partes iguales'], ['items', 'Por ítems'], ['custom', 'Personalizado']] as [SplitMode, string][]).map(([m, l]) => (
                      <button key={m}
                        onClick={() => setSplitMode(m)}
                        className={cn('flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all',
                          splitMode === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}
                      >{l}</button>
                    ))}
                  </div>

                  {/* ── Partes iguales ── */}
                  {splitMode === 'equal' && (
                    <div className="flex flex-col gap-3">
                      {/* Stepper */}
                      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <span className="text-xs font-bold text-gray-700">Número de personas</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setSplitPersons(p => Math.max(2, p - 1))} disabled={splitPersons <= 2}
                            className={cn('w-7 h-7 rounded-full border flex items-center justify-center transition-all',
                              splitPersons > 2 ? 'border-gray-300 hover:border-blue-400 hover:text-blue-600' : 'border-gray-100 text-gray-300 cursor-not-allowed')}>
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm font-black text-gray-900">{splitPersons}</span>
                          <button onClick={() => setSplitPersons(p => p + 1)}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition-all">
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
                              className={cn('p-3 rounded-xl border-2 text-center transition-all',
                                isPaid      ? 'bg-emerald-50 border-emerald-200 cursor-default' :
                                isCurrent   ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 ring-offset-1' :
                                              'bg-gray-50 border-gray-100 hover:border-blue-200 cursor-pointer')}
                            >
                              <p className={cn('text-[9px] font-black uppercase tracking-widest mb-1',
                                isPaid ? 'text-emerald-500' : isCurrent ? 'text-blue-500' : 'text-gray-400')}>
                                {isPaid ? '✓ Pagada' : isCurrent ? '→ Cobrando' : `Persona ${idx}`}
                              </p>
                              <p className={cn('text-sm font-black',
                                isPaid ? 'text-emerald-700 line-through opacity-60' : isCurrent ? 'text-blue-900' : 'text-gray-800')}>
                                ${amountForPerson(i).toLocaleString()}
                              </p>
                            </button>
                          );
                        })}
                        {splitPersons > 8 && (
                          <div className="col-span-2 text-center text-[11px] font-bold text-gray-400 py-1">
                            + {splitPersons - 8} personas más · ${perPersonFloor.toLocaleString()} c/u
                          </div>
                        )}
                      </div>

                      {perPersonRemainder > 0 && (
                        <p className="text-[10px] text-amber-600 font-bold text-center">
                          * Ajuste por redondeo: Persona {splitPersons} paga ${(perPersonFloor + perPersonRemainder).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── Por ítems ── */}
                  {splitMode === 'items' && (
                    <div className="flex flex-col gap-3">
                      {/* Account legend + count control */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {Array.from({ length: numAccounts }).map((_, i) => {
                            const idx    = i + 1;
                            const isPaid = paidAccounts.has(idx);
                            const c      = ACCT[i];
                            return (
                              <button key={i}
                                onClick={() => !isPaid && setCurrentAccount(idx)}
                                className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all',
                                  isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  currentAccount === idx ? c.active + ' scale-105' : c.badge)}
                              >
                                {isPaid ? <Check size={9} /> : <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />}
                                Cta. {idx}
                                {accountGrandTotals[idx] != null && (
                                  <span className="opacity-70">${accountGrandTotals[idx].toLocaleString()}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {[[-1, numAccounts <= 2], [1, numAccounts >= 6]].map(([delta, disabled]) => (
                            <button key={delta}
                              onClick={() => changeNumAccounts(numAccounts + (delta as number))}
                              disabled={disabled as boolean}
                              className={cn('w-6 h-6 rounded border text-[10px] font-black flex items-center justify-center transition-all',
                                !(disabled as boolean) ? 'border-gray-300 text-gray-600 hover:border-gray-400' : 'border-gray-100 text-gray-300 cursor-not-allowed')}
                            >
                              {(delta as number) > 0 ? <Plus size={10} /> : <Minus size={10} />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Items assignment table */}
                      <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                        {items.map((item, idx) => {
                          const assigned  = itemAssignments[item.id] ?? 0;
                          const acctColor = assigned > 0 ? ACCT[assigned - 1] : null;
                          return (
                            <div key={item.id}
                              className={cn('flex items-center gap-3 px-4 py-3', idx < items.length - 1 && 'border-b border-gray-100')}
                            >
                              <div className={cn('w-1.5 h-1.5 rounded-full shrink-0 transition-all', acctColor ? acctColor.dot : 'bg-gray-200')} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{item.quantity}× {item.name}</p>
                                <p className="text-[10px] text-gray-400">${(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {Array.from({ length: numAccounts }).map((_, i) => {
                                  const acct = i + 1;
                                  const c    = ACCT[i];
                                  return (
                                    <button key={acct}
                                      onClick={() => toggleAssign(item.id, acct)}
                                      className={cn('w-7 h-7 rounded-lg text-[10px] font-black border-2 transition-all',
                                        assigned === acct ? c.active : c.idle)}
                                    >{acct}</button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Validation */}
                      {allItemsAssigned ? (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={13} />
                          Todos los ítems asignados · ${assignedSubtotal.toLocaleString()} (sin impuestos)
                        </div>
                      ) : (
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                          <div className="flex items-center gap-1.5"><AlertTriangle size={13} /> Faltan ítems por asignar</div>
                          <span className="text-[10px] opacity-80">${assignedSubtotal.toLocaleString()} / ${subtotal.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Personalizado ── */}
                  {splitMode === 'custom' && (
                    <div className="flex flex-col gap-3">
                      {/* Stepper */}
                      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <span className="text-xs font-bold text-gray-700">Número de personas</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setSplitPersons(p => Math.max(2, p - 1))} disabled={splitPersons <= 2}
                            className={cn('w-7 h-7 rounded-full border flex items-center justify-center transition-all',
                              splitPersons > 2 ? 'border-gray-300 hover:border-blue-400 hover:text-blue-600' : 'border-gray-100 text-gray-300 cursor-not-allowed')}>
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm font-black text-gray-900">{splitPersons}</span>
                          <button onClick={() => setSplitPersons(p => Math.min(8, p + 1))}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition-all">
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
                      <div style={{ marginTop: 4, paddingTop: 12, borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, color: '#374151' }}>
                          Total asignado: <strong>${customTotal.toLocaleString()}</strong>
                        </span>
                        {customDiff === 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#10B981' }}>
                            <CheckCircle2 size={14} />
                            <span style={{ fontSize: 13, fontWeight: 600 }}>Correcto</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#EF4444' }}>
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

              <Divider />

              {/* ─── 3. PROPINA (always visible) ─── */}
              <SectionLabel label="Propina"
                hint={tipAmount > 0 ? (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    +${tipAmount.toLocaleString()}
                  </span>
                ) : undefined}
              />

              <div className="flex gap-2 mb-3">
                {([['0', '0%'], ['10', 'Sugerida 10%'], ['manual', 'Manual']] as [TipMode, string][]).map(([m, l]) => (
                  <button key={m}
                    onClick={() => setTipMode(m)}
                    className={cn('flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all whitespace-nowrap',
                      tipMode === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300')}
                  >{l}</button>
                ))}
              </div>

              {tipMode === 'manual' && (
                <div className="mb-3">
                  <MoneyInput value={tipManual} onChange={setTipManual} placeholder="0" autoFocus />
                </div>
              )}

              <p className="text-[10px] text-gray-400 flex items-start gap-1">
                <span className="shrink-0 mt-0.5">ℹ</span>
                La propina no afecta la base del IVA. Se suma directamente al total.
              </p>

              <Divider />

              {/* ─── 4. MÉTODO DE PAGO (always visible) ─── */}
              <SectionLabel label="Método de pago" />

              {/* Split progress tracker (when split is active) */}
              {splitBill && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide">
                      Pagadas: {paidAccounts.size} de {totalSplits}
                    </p>
                    {!allAccountsPaid && (
                      <p className="text-[10px] font-bold text-gray-500">
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
                      const c         = splitMode === 'items' ? ACCT[i] : undefined;
                      const label     = splitMode === 'equal' ? `Persona ${idx}` : `Cta. ${idx}`;

                      return (
                        <button key={idx}
                          onClick={() => !isPaid && setCurrentAccount(idx)}
                          disabled={isPaid}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all text-left',
                            isPaid    ? 'border-emerald-200 bg-emerald-50 cursor-default' :
                            isCurrent ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200 ring-offset-1' :
                                        'border-gray-200 bg-gray-50 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer',
                          )}
                        >
                          {isPaid ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                              <Check size={11} className="text-white" strokeWidth={3} />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 text-white">
                              <span className="text-[9px] font-black">→</span>
                            </div>
                          ) : (
                            <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 bg-white',
                              c ? c.dot.replace('bg-', 'border-') : 'border-gray-300')} />
                          )}

                          <div className="flex-1">
                            <p className={cn('text-xs font-bold',
                              isPaid ? 'text-emerald-700 line-through' : isCurrent ? 'text-blue-800' : 'text-gray-700')}>
                              {label}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className={cn('text-sm font-black',
                              isPaid ? 'text-emerald-600' : isCurrent ? 'text-blue-900' : 'text-gray-700')}>
                              ${amount.toLocaleString()}
                            </p>
                            <p className={cn('text-[9px] font-bold',
                              isPaid ? 'text-emerald-400' : isCurrent ? 'text-blue-400' : 'text-gray-300')}>
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
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-3">
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
                        className={cn('flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all',
                          paymentMethod === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50')}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>

                  {/* ── Efectivo ── */}
                  {paymentMethod === 'cash' && (
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide block mb-2">Monto recibido</label>
                        <MoneyInput value={cashReceived} onChange={setCashReceived} placeholder={currentAmountToPay.toLocaleString()} autoFocus />
                      </div>
                      <div className={cn('flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all',
                        cashNum >= currentAmountToPay && cashNum > 0 ? 'bg-emerald-50 border-emerald-300' :
                        cashNum > 0 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-100')}
                      >
                        <span className={cn('text-xs font-black uppercase tracking-wide',
                          cashNum >= currentAmountToPay && cashNum > 0 ? 'text-emerald-700' : cashNum > 0 ? 'text-red-700' : 'text-gray-400')}>
                          {cashNum >= currentAmountToPay && cashNum > 0 ? 'Cambio' : cashNum > 0 ? 'Faltan' : 'Cambio'}
                        </span>
                        <span className={cn('text-xl font-black',
                          cashNum >= currentAmountToPay && cashNum > 0 ? 'text-emerald-900' : cashNum > 0 ? 'text-red-900' : 'text-gray-300')}>
                          ${cashNum > 0 ? Math.abs(cashChange).toLocaleString() : '—'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── Tarjeta ── */}
                  {paymentMethod === 'card' && (
                    <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs font-bold text-blue-700">
                      <CreditCard size={16} className="shrink-0" /> Terminal conectada (simulado)
                    </div>
                  )}

                  {/* ── Transferencia ── */}
                  {paymentMethod === 'transfer' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs font-bold text-blue-700">
                        <ArrowLeftRight size={16} className="shrink-0" /> Confirma la recepción antes de proceder
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => setTransferConfirmed(!transferConfirmed)}
                          className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
                            transferConfirmed ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 group-hover:border-emerald-400')}
                        >
                          {transferConfirmed && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-bold text-gray-700">Transferencia confirmada</span>
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
                            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1.5">{icon} {label}</label>
                            <MoneyInput value={value} onChange={setter} />
                          </div>
                        ))}
                      </div>

                      {/* Summary bar */}
                      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-3 divide-x divide-gray-200">
                          {[
                            { l: 'Total',  v: currentAmountToPay, cls: 'text-gray-900' },
                            { l: 'Pagado', v: totalMixedPaid, cls: totalMixedPaid >= currentAmountToPay ? 'text-emerald-700' : 'text-gray-900' },
                            { l: mixRemaining > 0 ? 'Falta' : 'Cambio', v: Math.abs(mixRemaining > 0 ? mixRemaining : mixChange), cls: mixRemaining > 0 ? 'text-red-700' : 'text-emerald-700' },
                          ].map(({ l, v, cls }) => (
                            <div key={l} className="p-3 text-center">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">{l}</p>
                              <p className={cn('text-sm font-black', cls)}>${v.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                        <div className="h-1 bg-gray-200">
                          <div className={cn('h-full transition-all duration-300', totalMixedPaid >= currentAmountToPay ? 'bg-emerald-500' : 'bg-blue-500')}
                            style={{ width: `${Math.min(100, (totalMixedPaid / Math.max(1, currentAmountToPay)) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {totalMixedPaid > currentAmountToPay && mixCashNum === 0 && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                          <AlertTriangle size={13} /> El cambio requiere efectivo
                        </div>
                      )}
                      {totalMixedPaid > currentAmountToPay && mixCashNum > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={13} /> Cambio en efectivo: ${mixChange.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Bottom spacer */}
              <div className="h-6" />
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────
            FOOTER — sticky
            ───────────────────────────────────────────────────── */}
        <div className="border-t border-gray-200 bg-white px-6 pt-4 pb-5 flex flex-col gap-3 shrink-0">

          {phase === 'completed' ? (
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-gray-900 text-white font-black hover:bg-gray-800 flex items-center justify-center gap-2 transition-all"
            >
              Cerrar y volver
            </button>
          ) : (
            <>
              {/* Total / progress pill */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                {splitBill && !allAccountsPaid ? (
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{splitLabel}</p>
                    <p className="text-[10px] font-bold text-gray-400">Pagadas {paidAccounts.size} de {totalSplits}</p>
                  </div>
                ) : splitBill && allAccountsPaid ? (
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">✓ Todas las cuentas pagadas</p>
                    <p className="text-[10px] font-bold text-gray-400">Listo para finalizar</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total a cobrar</p>
                    {tipAmount > 0 && <p className="text-[9px] text-gray-400 font-bold mt-0.5">Inc. propina ${tipAmount.toLocaleString()}</p>}
                  </div>
                )}
                <span className="text-2xl font-black text-gray-900">
                  ${(splitBill && !allAccountsPaid ? currentAmountToPay : grandTotal).toLocaleString()}
                </span>
              </div>

              {/* Disabled reason */}
              {!btnEnabled && disabledReason && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                  <AlertTriangle size={12} /> {disabledReason}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!btnEnabled}
                  className={cn(
                    'flex-[2] py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-sm',
                    btnEnabled
                      ? allAccountsPaid && splitBill
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-500/20'
                        : 'bg-[#FF4D4D] text-white hover:bg-[#E64545] shadow-xl shadow-red-500/25'
                      : customModeInvalid
                        ? 'bg-[#FF4D4D] text-white opacity-50 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                  )}
                >
                  <CheckCircle2 size={18} />
                  {allAccountsPaid && splitBill
                    ? 'Finalizar pago'
                    : splitBill
                      ? `Confirmar pago · ${splitLabel}`
                      : 'Confirmar pago'}
                </button>
              </div>

              <p className="text-center text-[10px] text-gray-400">
                Al confirmar se registra el pago en el sistema.
              </p>
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
      <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{label}</span>
      <div style={{ position: 'relative', width: 140 }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: '#9CA3AF', pointerEvents: 'none', fontSize: 14, fontWeight: 500,
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
            border: focused ? '2px solid #3B82F6' : '1px solid #D1D5DB',
            borderRadius: 8,
            paddingLeft: 28, paddingRight: 12,
            textAlign: 'right',
            fontSize: 16, fontWeight: 600, color: '#111',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}

// ─── Small display helper ─────────────────────────────────────────────────────

function Row({ label, value, colored }: { label: string; value: string; colored?: 'blue' }) {
  return (
    <div className={cn('flex justify-between text-xs font-bold', colored === 'blue' ? 'text-blue-600' : 'text-gray-500')}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}