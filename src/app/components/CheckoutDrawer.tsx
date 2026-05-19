/**
 * CheckoutDrawer — pantalla completa dos columnas (Prompt 2/4)
 * Figma: bU77l4k96jRMtG70DUWSqt / nodes 26419-17407 + 26407-17774
 * Lógica completa: propina 10%, métodos de cobro, dividir, cambio/pendiente, validaciones.
 */

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronDown, ChevronUp,
  Printer, Plus, CheckCircle2, Send,
  Banknote, CreditCard, Smartphone, ArrowLeftRight,
  Monitor, X, Trash2, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

const MFONT = 'Montserrat, sans-serif';

// ─── Payment methods catalog ──────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { id: 'Efectivo',        label: 'Efectivo',        Icon: Banknote        },
  { id: 'Tarjeta Débito',  label: 'Tarjeta Débito',  Icon: CreditCard      },
  { id: 'Tarjeta Crédito', label: 'Tarjeta Crédito', Icon: CreditCard      },
  { id: 'Transferencia',   label: 'Transferencia',   Icon: ArrowLeftRight  },
  { id: 'Nequi',           label: 'Nequi',           Icon: Smartphone      },
  { id: 'DaviPlata',       label: 'DaviPlata',       Icon: Smartphone      },
  { id: 'Datáfono Caja 1', label: 'Datáfono Caja 1', Icon: Monitor         },
  { id: 'Datáfono Caja 2', label: 'Datáfono Caja 2', Icon: Monitor         },
  { id: 'Addi',            label: 'Addi',            Icon: CreditCard      },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CheckoutItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  note?: string;
  discount?: number;
}

export interface CheckoutDrawerProps {
  title: string;
  subtitle?: string;
  /** @deprecated use guests + openedAtTimestamp for mesa context */
  meta?: string;
  guests?: number;
  openedAtTimestamp?: number;
  items: CheckoutItem[];
  onClose: () => void;
  onConfirmPay: (method: string, total: number) => void;
  hideSendToKitchen?: boolean;
}

type Phase = 'checkout' | 'completed';

interface PayRow {
  id: string;
  method: string;
  amount: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string { return Math.random().toString(36).slice(2, 9); }

function formatOpenTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatElapsed(ts: number): string {
  const min = Math.floor((Date.now() - ts) / 60_000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60); const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function fmtCOP(n: number): string { return n.toLocaleString('es-CO'); }

function distrib(total: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(total / n);
  const rem  = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i === n - 1 ? rem : 0));
}

// ─── Tiny components ──────────────────────────────────────────────────────────

const HSep = () => <div style={{ height: 1, background: '#F0F0F0', flexShrink: 0 }} />;

function SectionBar({ label, cta, onCta }: { label: string; cta: string; onCta: () => void }) {
  return (
    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#969696', fontFamily: MFONT, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <button
        onClick={onCta}
        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: MFONT, fontSize: 12, fontWeight: 600, color: '#FF2947', textDecoration: 'underline', textUnderlineOffset: 2 }}
      >
        <Plus size={14} color="#FF2947" /> {cta}
      </button>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 52, height: 28, borderRadius: 14, flexShrink: 0, border: 'none', cursor: 'pointer',
        background: on ? '#FF2947' : '#C7CBE0', position: 'relative', transition: 'background 200ms',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: on ? 25 : 3, width: 22, height: 22,
        borderRadius: '50%', background: '#fff', transition: 'left 200ms',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 14, fontWeight: 600, color: '#121E6C', fontFamily: MFONT, lineHeight: '20px', display: 'block', marginBottom: 4 }}>
      {children}
    </span>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', height: 40, boxSizing: 'border-box', borderRadius: 12, border: '1.5px solid #C7CBE0', background: '#F7F8FB', fontFamily: MFONT, fontSize: 14, fontWeight: 500, color: '#1E1E1E', padding: '0 36px 0 12px', outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'border-color 150ms ease' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
          onBlur={e => (e.currentTarget.style.borderColor = '#C7CBE0')}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} color="#606060" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '20px' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '20px', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

// A single tip or payment row: [method select] [amount input] [trash]
function PayRowLine({
  row, amountReadonly, amountDisplayValue, onMethod, onAmount, onDelete,
}: {
  row: PayRow;
  amountReadonly?: boolean;
  amountDisplayValue?: number;
  onMethod: (m: string) => void;
  onAmount: (v: string) => void;
  onDelete: () => void;
}) {
  const methods = PAYMENT_METHODS.map(m => m.id);
  const displayStr = amountReadonly && amountDisplayValue != null
    ? String(amountDisplayValue)
    : row.amount;

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', padding: '0 16px 12px' }}>
      {/* Method */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <FieldLabel>Método de cobro</FieldLabel>
        <div style={{ position: 'relative' }}>
          <select value={row.method} onChange={e => onMethod(e.target.value)}
            style={{ width: '100%', height: 40, boxSizing: 'border-box', borderRadius: 12, border: '1.5px solid #C7CBE0', background: '#F7F8FB', fontFamily: MFONT, fontSize: 14, fontWeight: 500, color: '#1E1E1E', padding: '0 36px 0 12px', outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'border-color 150ms ease' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
            onBlur={e => (e.currentTarget.style.borderColor = '#C7CBE0')}
          >
            {methods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown size={16} color="#606060" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Amount */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <FieldLabel>{amountReadonly ? 'Monto' : 'Monto recibido'}</FieldLabel>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: amountReadonly ? '#969696' : '#606060', fontFamily: MFONT, pointerEvents: 'none' }}>$</span>
          <input
            type="number" min={0}
            readOnly={amountReadonly}
            value={displayStr}
            onChange={e => onAmount(e.target.value)}
            placeholder="0"
            style={{ width: '100%', height: 40, boxSizing: 'border-box', borderRadius: 12, border: '1.5px solid #C7CBE0', background: amountReadonly ? '#F3F3F3' : '#F7F8FB', fontFamily: MFONT, fontSize: 14, fontWeight: 500, color: amountReadonly ? '#969696' : '#1E1E1E', padding: '0 12px 0 28px', outline: 'none', transition: 'border-color 150ms ease' }}
            onFocus={e => { if (!amountReadonly) e.currentTarget.style.borderColor = '#121E6C'; }}
            onBlur={e => (e.currentTarget.style.borderColor = '#C7CBE0')}
          />
        </div>
      </div>

      {/* Trash */}
      <button onClick={onDelete}
        style={{ height: 40, width: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1.5px solid #C7CBE0', borderRadius: 12, cursor: 'pointer', color: '#969696', transition: 'all 150ms ease', marginBottom: 0 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#FF2947'; (e.currentTarget as HTMLButtonElement).style.color = '#FF2947'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#C7CBE0'; (e.currentTarget as HTMLButtonElement).style.color = '#969696'; }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

// Warning banner (yellow)
function WarnBanner({ children }: { children: string }) {
  return (
    <div style={{ margin: '0 16px 8px', padding: '10px 12px', background: '#FFF3D1', border: '1px solid #FFC217', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <AlertTriangle size={14} color="#A16B00" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: '#5B3100', fontFamily: MFONT, lineHeight: '18px' }}>{children}</span>
    </div>
  );
}

// Method selector panel (fixed overlay)
function MethodPanel({ title, onSelect, onClose }: { title: string; onSelect: (m: string) => void; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 420, zIndex: 401, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(18,30,108,0.12)' }}>

        {/* Header */}
        <div style={{ padding: '24px 24px 16px', flexShrink: 0, borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#606060', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1E1E1E', margin: 0, fontFamily: MFONT }}>{title}</h2>
        </div>

        {/* Grid 3 cols */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {PAYMENT_METHODS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => { onSelect(id); onClose(); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 8px', borderRadius: 12, border: '1.5px solid #E0E0E0', background: '#fff', cursor: 'pointer', transition: 'all 150ms ease', fontFamily: MFONT, minHeight: 108 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#121E6C'; (e.currentTarget as HTMLButtonElement).style.background = '#F1F2F6'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E0E0E0'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
              >
                <Icon size={32} color="#121E6C" />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#1E1E1E', textAlign: 'center', lineHeight: '16px' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CheckoutDrawer({
  title, subtitle, guests, openedAtTimestamp,
  items, onClose, onConfirmPay, hideSendToKitchen = false,
}: CheckoutDrawerProps) {

  // ── Phase ──────────────────────────────────────────────────────────────────
  const [phase, setPhase]               = useState<Phase>('checkout');
  const [completedAt, setCompletedAt]   = useState<Date | null>(null);
  const [comandaSentAfterPay, setComandaSentAfterPay] = useState(false);

  // ── Form fields ────────────────────────────────────────────────────────────
  const [orderNote,   setOrderNote]   = useState('');
  const [vendedor,    setVendedor]    = useState('Carlos Méndez');
  const [resolucion,  setResolucion]  = useState('Resolution - Rest Demo 2026');

  const [cliente,          setCliente]          = useState('Consumidor final');
  const [clienteOpen,      setClienteOpen]      = useState(false);
  const [clientesList,     setClientesList]     = useState(['Consumidor final', 'Restaurante El Cielo', 'Inversiones Tech SAS', 'Juan Pérez (NIT: 900.123.456)', 'María González']);
  const [showAddCliente,   setShowAddCliente]   = useState(false);
  const [newClienteNombre, setNewClienteNombre] = useState('');
  const [newClienteNit,    setNewClienteNit]    = useState('');

  // ── Propina state ──────────────────────────────────────────────────────────
  const [tipRows,   setTipRows]   = useState<PayRow[]>([]);
  const [tipAuto,   setTipAuto]   = useState(true);   // toggle "Propina con el 10%"
  const [methodPanel, setMethodPanel] = useState<'tip' | 'pay' | null>(null);

  // ── Cobro state ────────────────────────────────────────────────────────────
  const [payRows,     setPayRows]     = useState<PayRow[]>([]);
  const [splitEqual,  setSplitEqual]  = useState(false);

  // ── Base totals ────────────────────────────────────────────────────────────
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (i.discount ? Math.round(i.price * (1 - i.discount / 100)) : i.price) * i.quantity, 0),
    [items],
  );
  const tax      = Math.round(subtotal * 0.19);
  const discount = 0; // Prompt 3

  // ── Tip calculation ────────────────────────────────────────────────────────
  const tipAutoTotal    = Math.round(subtotal * 0.10);
  const tipAutoAmounts  = useMemo(() => distrib(tipAutoTotal, tipRows.length), [tipAutoTotal, tipRows.length]);

  const tipTotal = useMemo(() => {
    if (tipRows.length === 0) return 0;
    if (tipAuto) return tipAutoTotal;
    return tipRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  }, [tipRows, tipAuto, tipAutoTotal]);

  const grandTotal = subtotal + tax + tipTotal - discount;

  // ── Pay calculation ────────────────────────────────────────────────────────
  const payEqualAmounts = useMemo(() => distrib(grandTotal, payRows.length), [grandTotal, payRows.length]);

  const totalRecibido = useMemo(() => {
    if (splitEqual) return payRows.length > 0 ? grandTotal : 0;
    return payRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  }, [payRows, splitEqual, grandTotal]);

  const pendiente = Math.max(0, grandTotal - totalRecibido);
  const cambio    = Math.max(0, totalRecibido - grandTotal);

  // ── Tip validation ─────────────────────────────────────────────────────────
  const tipWarning = useMemo<string | null>(() => {
    if (tipRows.length === 0 || payRows.length === 0) return null;
    const payMethods = new Set(payRows.map(r => r.method));

    // Case 1 — method not found in any cobro row
    for (const r of tipRows) {
      if (!payMethods.has(r.method)) {
        return 'Cobra la propina con el mismo método que usaste para el pago';
      }
    }

    // Case 2 — method exists but coverage is insufficient
    const tipMethods = [...new Set(tipRows.map(r => r.method))];
    for (const m of tipMethods) {
      const tipAmt = tipAuto
        ? tipRows.filter(r => r.method === m).length * (tipAutoTotal / tipRows.length) // proportional
        : tipRows.filter(r => r.method === m).reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
      const payAmt = splitEqual
        ? (payRows.filter(r => r.method === m).length / payRows.length) * grandTotal
        : payRows.filter(r => r.method === m).reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
      if (tipAmt > payAmt + 0.01) {
        return 'El monto de la propina debe quedar cubierto por los métodos de cobro';
      }
    }
    return null;
  }, [tipRows, payRows, tipAuto, tipAutoTotal, splitEqual, grandTotal]);

  const canConfirm = phase === 'completed' || (payRows.length > 0 && pendiente === 0 && !tipWarning);

  // ── Tip actions ────────────────────────────────────────────────────────────
  const addTipRow = (method: string) => setTipRows(prev => [...prev, { id: uid(), method, amount: '' }]);

  const deleteTipRow = (id: string) => {
    setTipRows(prev => {
      const next = prev.filter(r => r.id !== id);
      if (next.length === 0) setTipAuto(true);
      return next;
    });
  };

  const updateTipMethod = (id: string, method: string) =>
    setTipRows(prev => prev.map(r => r.id === id ? { ...r, method } : r));

  const updateTipAmount = (id: string, amount: string) =>
    setTipRows(prev => prev.map(r => r.id === id ? { ...r, amount } : r));

  // ── Pay actions ────────────────────────────────────────────────────────────
  const addPayRow = (method: string) => {
    setPayRows(prev => [...prev, { id: uid(), method, amount: '' }]);
  };

  const deletePayRow = (id: string) => {
    setPayRows(prev => {
      const next = prev.filter(r => r.id !== id);
      if (next.length < 2) setSplitEqual(false);
      return next;
    });
  };

  const updatePayMethod = (id: string, method: string) =>
    setPayRows(prev => prev.map(r => r.id === id ? { ...r, method } : r));

  const updatePayAmount = (id: string, amount: string) =>
    setPayRows(prev => prev.map(r => r.id === id ? { ...r, amount } : r));

  // ── Confirm ────────────────────────────────────────────────────────────────
  const finalizePay = () => {
    if (!canConfirm) return;
    const methods = [...new Set(payRows.map(r => r.method))].join(', ') || 'Pendiente';
    setCompletedAt(new Date());
    setPhase('completed');
    toast.success(`Pago registrado · ${title} · $${fmtCOP(grandTotal)}`, { duration: 5000 });
    onConfirmPay(methods, grandTotal);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // LEFT PANEL
  // ════════════════════════════════════════════════════════════════════════════

  const leftContent = phase === 'completed' ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, padding: '32px 24px' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F4FDF9', border: '4px solid #6CDCAB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle2 size={40} color="#1B8959" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E1E1E', margin: 0, fontFamily: MFONT }}>Pago completado</h3>
        {completedAt && (
          <p style={{ fontSize: 13, color: '#606060', marginTop: 4, fontFamily: MFONT }}>
            {title} · {completedAt.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })} {completedAt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      {!hideSendToKitchen && (
        <button
          onClick={() => { setComandaSentAfterPay(true); toast.success('Comanda enviada a cocina'); }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', maxWidth: 320, height: 44, borderRadius: 32, background: comandaSentAfterPay ? '#F4FDF9' : '#FF2947', border: comandaSentAfterPay ? '1px solid #6CDCAB' : 'none', color: comandaSentAfterPay ? '#1B8959' : '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: MFONT }}
        >
          <Send size={14} />{comandaSentAfterPay ? 'Comanda enviada' : 'Enviar comanda a cocina'}
        </button>
      )}
    </div>
  ) : (
    <>
      {/* ── Vendedor | Resolución | Cliente ── */}
      <div style={{ padding: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <SelectField label="Vendedor" value={vendedor} onChange={setVendedor} options={['Carlos Méndez', 'Laura Torres', 'Miguel García', 'Ana Ruiz']} />
          <SelectField label="Resolución" value={resolucion} onChange={setResolucion} options={['Resolution - Rest Demo 2026', 'Resolution Terraza - 9876543210', 'Resolution Mostrador - 1122334455']} />

          {/* Cliente combobox */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, position: 'relative' }}>
            <FieldLabel>Cliente</FieldLabel>
            <div onClick={() => { setClienteOpen(o => !o); setShowAddCliente(false); }}
              style={{ height: 40, borderRadius: 12, background: '#F7F8FB', border: clienteOpen ? '1.5px solid #121E6C' : '1.5px solid #C7CBE0', display: 'flex', alignItems: 'center', padding: '0 36px 0 12px', cursor: 'pointer', position: 'relative', userSelect: 'none', fontFamily: MFONT, fontSize: 14, fontWeight: 500, color: '#1E1E1E', transition: 'border-color 150ms ease' }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cliente}</span>
              {clienteOpen ? <ChevronUp size={16} color="#606060" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} /> : <ChevronDown size={16} color="#606060" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
            </div>
            {clienteOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 299 }} onClick={() => { setClienteOpen(false); setShowAddCliente(false); }} />
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 300, background: '#fff', border: '1px solid #C7CBE0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  {clientesList.map(c => (
                    <div key={c} onClick={() => { setCliente(c); setClienteOpen(false); setShowAddCliente(false); }}
                      style={{ padding: '10px 14px', fontSize: 14, fontFamily: MFONT, cursor: 'pointer', color: '#1E1E1E', background: cliente === c ? '#F5F6FA' : '#fff' }}
                      onMouseEnter={e => { if (cliente !== c) (e.currentTarget as HTMLDivElement).style.background = '#F5F6FA'; }}
                      onMouseLeave={e => { if (cliente !== c) (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                    >{c}</div>
                  ))}
                  <div style={{ height: 1, background: '#F0F0F0' }} />
                  {!showAddCliente ? (
                    <div onClick={e => { e.stopPropagation(); setShowAddCliente(true); }}
                      style={{ padding: '10px 14px', fontSize: 14, fontWeight: 500, color: '#121E6C', cursor: 'pointer', fontFamily: MFONT, display: 'flex', alignItems: 'center', gap: 6 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F5F6FA'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                    >
                      <Plus size={13} color="#121E6C" /> Agregar cliente nuevo
                    </div>
                  ) : (
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }} onClick={e => e.stopPropagation()}>
                      <input autoFocus value={newClienteNombre} onChange={e => setNewClienteNombre(e.target.value)} placeholder="Nombre o razón social"
                        style={{ width: '100%', height: 36, borderRadius: 8, border: '1.5px solid #C7CBE0', background: '#F7F8FB', fontFamily: MFONT, fontSize: 13, color: '#1E1E1E', padding: '0 10px', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')} onBlur={e => (e.currentTarget.style.borderColor = '#C7CBE0')} />
                      <input value={newClienteNit} onChange={e => setNewClienteNit(e.target.value)} placeholder="NIT / CC"
                        style={{ width: '100%', height: 36, borderRadius: 8, border: '1.5px solid #C7CBE0', background: '#F7F8FB', fontFamily: MFONT, fontSize: 13, color: '#1E1E1E', padding: '0 10px', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')} onBlur={e => (e.currentTarget.style.borderColor = '#C7CBE0')} />
                      <button onClick={() => {
                        if (!newClienteNombre.trim()) return;
                        const label = newClienteNit.trim() ? `${newClienteNombre.trim()} (NIT: ${newClienteNit.trim()})` : newClienteNombre.trim();
                        setClientesList(prev => [...prev, label]); setCliente(label); setClienteOpen(false); setShowAddCliente(false); setNewClienteNombre(''); setNewClienteNit('');
                      }} style={{ height: 36, borderRadius: 8, border: 'none', background: '#FF2947', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: MFONT }}>Guardar</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <HSep />

      {/* ══════════════════════════════════════════════════════
          SECCIÓN PROPINA
          ══════════════════════════════════════════════════ */}
      <SectionBar label="Propina" cta="Agregar Propina" onCta={() => setMethodPanel('tip')} />

      {tipRows.length > 0 && (
        <>
          {/* Toggle 10% */}
          <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <Toggle on={tipAuto} onChange={setTipAuto} />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1E1E1E', fontFamily: MFONT }}>Propina con el 10%</span>
          </div>

          {/* Validation banner */}
          {tipWarning && <WarnBanner>{tipWarning}</WarnBanner>}

          {/* Tip rows */}
          {tipRows.map((row, i) => (
            <PayRowLine
              key={row.id}
              row={row}
              amountReadonly={tipAuto}
              amountDisplayValue={tipAuto ? tipAutoAmounts[i] : undefined}
              onMethod={m => updateTipMethod(row.id, m)}
              onAmount={v => updateTipAmount(row.id, v)}
              onDelete={() => deleteTipRow(row.id)}
            />
          ))}
        </>
      )}

      <HSep />

      {/* ══════════════════════════════════════════════════════
          SECCIÓN COBRO
          ══════════════════════════════════════════════════ */}
      <SectionBar label="¿Cómo quieres cobrar?" cta="Agregar método de cobro" onCta={() => setMethodPanel('pay')} />

      {payRows.length >= 2 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Toggle on={splitEqual} onChange={setSplitEqual} />
          <span style={{ fontSize: 14, fontWeight: 500, color: '#1E1E1E', fontFamily: MFONT }}>Dividir cobro en partes iguales</span>
        </div>
      )}

      {payRows.map((row, i) => (
        <PayRowLine
          key={row.id}
          row={row}
          amountReadonly={splitEqual}
          amountDisplayValue={splitEqual ? payEqualAmounts[i] : undefined}
          onMethod={m => updatePayMethod(row.id, m)}
          onAmount={v => updatePayAmount(row.id, v)}
          onDelete={() => deletePayRow(row.id)}
        />
      ))}

      {/* Cambio / Pendiente */}
      {payRows.length > 0 && (cambio > 0 || pendiente > 0) && (
        <div style={{
          margin: '0 16px 12px',
          padding: '10px 14px',
          borderRadius: 12,
          border: `1px solid ${cambio > 0 ? '#6CDCAB' : '#C7CBE0'}`,
          background: cambio > 0 ? '#F4FDF9' : '#F7F8FB',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: cambio > 0 ? '#1B8959' : '#1E1E1E', fontFamily: MFONT }}>
            {cambio > 0 ? 'Cambio' : 'Pendiente'}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: cambio > 0 ? '#1B8959' : '#1E1E1E', fontFamily: MFONT }}>
            ${fmtCOP(cambio > 0 ? cambio : pendiente)}
          </span>
        </div>
      )}

      <HSep />

      {/* ── Nota de la orden ── */}
      <div style={{ padding: 16, flexShrink: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#121E6C', fontFamily: MFONT, marginBottom: 4, lineHeight: '20px' }}>
          Nota de la orden{' '}
          <span style={{ fontSize: 12, fontWeight: 400, color: '#606060' }}>(Opcional)</span>
        </p>
        <div style={{ background: '#F7F8FB', borderRadius: 12, padding: 12 }}>
          <textarea value={orderNote} onChange={e => setOrderNote(e.target.value)} rows={4} placeholder="Agrega una nota general de la orden"
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', resize: 'none', fontFamily: MFONT, fontSize: 14, fontWeight: 300, color: orderNote ? '#1E1E1E' : '#606060', lineHeight: '20px', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    </>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, background: 'transparent', fontFamily: MFONT }}>

      {/* Method selector panel */}
      {methodPanel && (
        <MethodPanel
          title={methodPanel === 'tip' ? 'Agregar propina' : 'Agregar método de cobro'}
          onSelect={methodPanel === 'tip' ? addTipRow : addPayRow}
          onClose={() => setMethodPanel(null)}
        />
      )}

      <div style={{ display: 'flex', flex: 1, gap: 16, padding: 16, overflow: 'hidden', minHeight: 0 }}>

        {/* ── PANEL IZQUIERDO ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '8px 16px', flexShrink: 0, borderBottom: '1px solid #F0F0F0' }}>
            <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontFamily: MFONT }}>
              <ChevronLeft size={20} color="#121E6C" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#121E6C', lineHeight: '20px' }}>Checkout</span>
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {leftContent}
          </div>
        </div>

        {/* ── PANEL DERECHO ── */}
        <div style={{ width: 379, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, overflow: 'hidden' }}>

          {/* Mesa info */}
          <div style={{ padding: 16, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#121E6C', margin: 0, fontFamily: MFONT, lineHeight: '20px' }}>{title}</h2>
              <span style={{ background: '#FEF1F3', color: '#FF2947', borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 500, fontFamily: MFONT, lineHeight: '16px', whiteSpace: 'nowrap' }}>Checkout</span>
            </div>
            {(subtitle || guests != null || openedAtTimestamp) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {subtitle           && <InfoRow label="Espacio"          value={subtitle} />}
                {guests    != null  && <InfoRow label="Personas"         value={String(guests)} />}
                {openedAtTimestamp  && <InfoRow label="Hora de apertura" value={formatOpenTime(openedAtTimestamp)} />}
                {openedAtTimestamp  && <InfoRow label="Tiempo en mesa"   value={formatElapsed(openedAtTimestamp)} />}
              </div>
            )}
            <button onClick={() => toast.info('Documento enviado a impresora')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 40, borderRadius: 12, background: '#F1F2F6', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#121E6C', fontFamily: MFONT }}>
              <Printer size={16} color="#121E6C" /> Pre - cuenta
            </button>
          </div>

          <HSep />

          {/* Items list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, paddingBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#969696', fontFamily: MFONT, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pedido</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#969696', fontFamily: MFONT }}>· {items.length} producto{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 12 }}>
              {items.map(item => {
                const unit = item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
                return (
                  <div key={item.id} style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1E1E1E', margin: 0, fontFamily: MFONT, lineHeight: '20px' }}>
                        {item.name}
                        {(item.discount ?? 0) > 0 && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: '#1B8959' }}>−{item.discount}%</span>}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1E1E1E', margin: 0, fontFamily: MFONT, lineHeight: '20px' }}>${fmtCOP(unit * item.quantity)}</p>
                      {item.note && <p style={{ fontSize: 11, color: '#606060', fontStyle: 'italic', margin: 0, fontFamily: MFONT }}>{item.note}</p>}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '20px', whiteSpace: 'nowrap', flexShrink: 0 }}>x{item.quantity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <HSep />

          {/* Totals */}
          <div style={{ padding: 16, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontSize: 13, fontWeight: 400, color: '#606060', fontFamily: MFONT }}>Subtotal</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT }}>${fmtCOP(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontSize: 13, fontWeight: 400, color: '#606060', fontFamily: MFONT }}>IVA 19%</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT }}>${fmtCOP(tax)}</span>
            </div>
            {tipTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#606060', fontFamily: MFONT }}>
                  {tipAuto && tipRows.length > 0 ? 'Propina (10%)' : 'Propina'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT }}>${fmtCOP(tipTotal)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <p style={{ margin: 0, fontSize: 13, fontFamily: MFONT, color: '#606060' }}>
                Descuento{' '}
                <span style={{ color: '#121E6C', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer' }} onClick={() => {}}>Agregar</span>
              </p>
              <span style={{ fontSize: 13, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT }}>$0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, marginTop: 4, borderTop: '1px solid #F0F0F0' }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '24px' }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '24px' }}>${fmtCOP(grandTotal)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={onClose}
              style={{ flex: 1, height: 44, borderRadius: 32, border: '1px solid #FF2947', background: '#fff', color: '#FF2947', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: MFONT }}>
              Cancelar
            </button>
            <button
              onClick={phase === 'completed' ? onClose : finalizePay}
              disabled={!canConfirm}
              style={{ flex: 1, height: 44, borderRadius: 32, border: 'none', background: canConfirm ? '#FF2947' : '#FCDDE1', color: '#fff', fontSize: 16, fontWeight: 700, cursor: canConfirm ? 'pointer' : 'not-allowed', fontFamily: MFONT, transition: 'background 200ms' }}>
              {phase === 'completed' ? 'Finalizar orden' : 'Confirmar pago'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
