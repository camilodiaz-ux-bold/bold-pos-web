/**
 * CheckoutDrawer — pantalla completa dos columnas (Prompt 1/4)
 * Figma: bU77l4k96jRMtG70DUWSqt / node 26419:17405
 * Propina y métodos de cobro: placeholders (Prompts 2 y 3).
 */

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronDown, ChevronUp,
  Printer, Plus, CheckCircle2, Send,
} from 'lucide-react';
import { toast } from 'sonner';

const MFONT = 'Montserrat, sans-serif';

// ─── Public types ─────────────────────────────────────────────────────────────

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

// ─── Internal types ───────────────────────────────────────────────────────────

type Phase = 'checkout' | 'completed';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatOpenTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function formatElapsed(ts: number): string {
  const min = Math.floor((Date.now() - ts) / 60_000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

const HSep = () => (
  <div style={{ height: 1, background: '#F0F0F0', flexShrink: 0 }} />
);

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 14, fontWeight: 600, color: '#121E6C', fontFamily: MFONT, lineHeight: '20px', display: 'block', marginBottom: 4 }}>
      {children}
    </span>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', height: 40, boxSizing: 'border-box',
            borderRadius: 12, border: 'none', background: '#F7F8FB',
            fontFamily: MFONT, fontSize: 14, fontWeight: 500, color: '#1E1E1E',
            padding: '0 36px 0 12px', outline: 'none', appearance: 'none', cursor: 'pointer',
          }}
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

// ─── Main component ───────────────────────────────────────────────────────────

export function CheckoutDrawer({
  title, subtitle, guests, openedAtTimestamp,
  items, onClose, onConfirmPay, hideSendToKitchen = false,
}: CheckoutDrawerProps) {

  // ── Phase ──────────────────────────────────────────────────────────────────
  const [phase, setPhase]           = useState<Phase>('checkout');
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [comandaSentAfterPay, setComandaSentAfterPay] = useState(false);

  // ── Nota ──────────────────────────────────────────────────────────────────
  const [orderNote, setOrderNote] = useState('');

  // ── Campos de la orden ────────────────────────────────────────────────────
  const [vendedor,  setVendedor]  = useState('Carlos Méndez');
  const [resolucion, setResolucion] = useState('Resolution - Rest Demo 2026');

  // Cliente combobox
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

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = useMemo(
    () => items.reduce((s, i) => {
      const unitPrice = i.discount ? Math.round(i.price * (1 - i.discount / 100)) : i.price;
      return s + unitPrice * i.quantity;
    }, 0),
    [items],
  );
  const tax        = Math.round(subtotal * 0.19);
  const tipAmount  = 0;   // placeholder — Prompt 2
  const discount   = 0;   // placeholder — Prompt 2
  const grandTotal = subtotal + tax + tipAmount - discount;

  // ── Actions ────────────────────────────────────────────────────────────────
  const finalizePay = () => {
    const now = new Date();
    setCompletedAt(now);
    setPhase('completed');
    toast.success(`Pago registrado · ${title} · $${grandTotal.toLocaleString('es-CO')}`, { duration: 5000 });
    onConfirmPay('Pendiente', grandTotal);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // LEFT PANEL — form content
  // ════════════════════════════════════════════════════════════════════════════

  const leftContent = phase === 'completed' ? (

    /* ── Completed screen ── */
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, padding: '32px 24px' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: '#F4FDF9', border: '4px solid #6CDCAB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
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
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', maxWidth: 320, height: 44, borderRadius: 32,
            background: comandaSentAfterPay ? '#F4FDF9' : '#FF2947',
            border: comandaSentAfterPay ? '1px solid #6CDCAB' : 'none',
            color: comandaSentAfterPay ? '#1B8959' : '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: MFONT,
          }}
        >
          <Send size={14} />
          {comandaSentAfterPay ? 'Comanda enviada' : 'Enviar comanda a cocina'}
        </button>
      )}
    </div>

  ) : (

    /* ── Checkout form ── */
    <>
      {/* ── Vendedor | Resolución | Cliente ── */}
      <div style={{ padding: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 16 }}>

          <SelectField
            label="Vendedor"
            value={vendedor}
            onChange={setVendedor}
            options={['Carlos Méndez', 'Laura Torres', 'Miguel García', 'Ana Ruiz']}
          />

          <SelectField
            label="Resolución"
            value={resolucion}
            onChange={setResolucion}
            options={[
              'Resolution - Rest Demo 2026',
              'Resolution Terraza - 9876543210',
              'Resolution Mostrador - 1122334455',
            ]}
          />

          {/* ── Cliente combobox ── */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, position: 'relative' }}>
            <FieldLabel>Cliente</FieldLabel>
            <div
              onClick={() => { setClienteOpen(o => !o); setShowAddCliente(false); }}
              style={{
                height: 40, borderRadius: 12, background: '#F7F8FB',
                border: 'none', display: 'flex', alignItems: 'center',
                padding: '0 36px 0 12px', cursor: 'pointer',
                position: 'relative', userSelect: 'none',
                fontFamily: MFONT, fontSize: 14, fontWeight: 500, color: '#1E1E1E',
              }}
            >
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cliente}</span>
              {clienteOpen
                ? <ChevronUp   size={16} color="#606060" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                : <ChevronDown size={16} color="#606060" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              }
            </div>

            {clienteOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 299 }} onClick={() => { setClienteOpen(false); setShowAddCliente(false); }} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                  zIndex: 300, background: '#fff',
                  border: '1px solid #C7CBE0', borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden',
                }}>
                  {clientesList.map(c => (
                    <div
                      key={c}
                      onClick={() => { setCliente(c); setClienteOpen(false); setShowAddCliente(false); }}
                      style={{ padding: '10px 14px', fontSize: 14, fontFamily: MFONT, cursor: 'pointer', color: '#1E1E1E', background: cliente === c ? '#F5F6FA' : '#fff' }}
                      onMouseEnter={e => { if (cliente !== c) (e.currentTarget as HTMLDivElement).style.background = '#F5F6FA'; }}
                      onMouseLeave={e => { if (cliente !== c) (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                    >{c}</div>
                  ))}
                  <div style={{ height: 1, background: '#F0F0F0' }} />
                  {!showAddCliente ? (
                    <div
                      onClick={e => { e.stopPropagation(); setShowAddCliente(true); }}
                      style={{ padding: '10px 14px', fontSize: 14, fontWeight: 500, color: '#121E6C', cursor: 'pointer', fontFamily: MFONT, display: 'flex', alignItems: 'center', gap: 6 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F5F6FA'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                    >
                      <Plus size={13} color="#121E6C" /> Agregar cliente nuevo
                    </div>
                  ) : (
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }} onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus value={newClienteNombre}
                        onChange={e => setNewClienteNombre(e.target.value)}
                        placeholder="Nombre o razón social"
                        style={{ width: '100%', height: 36, borderRadius: 8, border: '1.5px solid #C7CBE0', background: '#F7F8FB', fontFamily: MFONT, fontSize: 13, color: '#1E1E1E', padding: '0 10px', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#C7CBE0')}
                      />
                      <input
                        value={newClienteNit}
                        onChange={e => setNewClienteNit(e.target.value)}
                        placeholder="NIT / CC"
                        style={{ width: '100%', height: 36, borderRadius: 8, border: '1.5px solid #C7CBE0', background: '#F7F8FB', fontFamily: MFONT, fontSize: 13, color: '#1E1E1E', padding: '0 10px', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#C7CBE0')}
                      />
                      <button
                        onClick={() => {
                          if (!newClienteNombre.trim()) return;
                          const label = newClienteNit.trim()
                            ? `${newClienteNombre.trim()} (NIT: ${newClienteNit.trim()})`
                            : newClienteNombre.trim();
                          setClientesList(prev => [...prev, label]);
                          setCliente(label);
                          setClienteOpen(false); setShowAddCliente(false);
                          setNewClienteNombre(''); setNewClienteNit('');
                        }}
                        style={{ height: 36, borderRadius: 8, border: 'none', background: '#FF2947', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: MFONT }}
                      >Guardar</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <HSep />

      {/* ── Propina — placeholder (Prompt 2) ── */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#606060', fontFamily: MFONT }}>Propina</span>
        <button
          onClick={() => {}}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: MFONT, fontSize: 12, fontWeight: 600, color: '#FF2947', textDecoration: 'underline', textUnderlineOffset: 2 }}
        >
          <Plus size={14} color="#FF2947" /> Agregar Propina
        </button>
      </div>

      <HSep />

      {/* ── Métodos de cobro — placeholder (Prompt 3) ── */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#606060', fontFamily: MFONT }}>¿Cómo quieres cobrar?</span>
        <button
          onClick={() => {}}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: MFONT, fontSize: 12, fontWeight: 600, color: '#FF2947', textDecoration: 'underline', textUnderlineOffset: 2 }}
        >
          <Plus size={14} color="#FF2947" /> Agregar método de cobro
        </button>
      </div>

      <HSep />

      {/* ── Nota de la orden ── */}
      <div style={{ padding: 16, flexShrink: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#121E6C', fontFamily: MFONT, marginBottom: 4, lineHeight: '20px' }}>
          Nota de la orden{' '}
          <span style={{ fontSize: 12, fontWeight: 400, color: '#606060' }}>(Opcional)</span>
        </p>
        <div style={{ background: '#F7F8FB', borderRadius: 12, padding: 12 }}>
          <textarea
            value={orderNote}
            onChange={e => setOrderNote(e.target.value)}
            rows={4}
            placeholder="Agrega una nota general de la orden"
            style={{
              width: '100%', border: 'none', outline: 'none',
              background: 'transparent', resize: 'none',
              fontFamily: MFONT, fontSize: 14, fontWeight: 300,
              color: orderNote ? '#1E1E1E' : '#606060',
              lineHeight: '20px', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER — full-screen two-column
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#F7F8FB', fontFamily: MFONT,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', flex: 1, gap: 16, padding: 16, overflow: 'hidden', minHeight: 0 }}>

        {/* ══════════════════════════════════════════════════════════════════
            PANEL IZQUIERDO — formulario scrolleable
            ══════════════════════════════════════════════════════════════ */}
        <div style={{
          flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
          background: '#fff', borderRadius: 16, overflow: 'hidden',
        }}>

          {/* Header nav */}
          <div style={{ padding: '8px 16px', flexShrink: 0, borderBottom: '1px solid #F0F0F0' }}>
            <button
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 0', fontFamily: MFONT,
              }}
            >
              <ChevronLeft size={20} color="#121E6C" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#121E6C', lineHeight: '20px' }}>Checkout</span>
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {leftContent}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            PANEL DERECHO — resumen fijo
            ══════════════════════════════════════════════════════════════ */}
        <div style={{
          width: 379, flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: '#fff', borderRadius: 16, overflow: 'hidden',
        }}>

          {/* ── Información de la mesa ── */}
          <div style={{ padding: 16, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Título + badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#121E6C', margin: 0, fontFamily: MFONT, lineHeight: '20px' }}>
                {title}
              </h2>
              <span style={{
                background: '#FEF1F3', color: '#FF2947', borderRadius: 100,
                padding: '4px 12px', fontSize: 12, fontWeight: 500, fontFamily: MFONT,
                lineHeight: '16px', whiteSpace: 'nowrap',
              }}>
                Checkout
              </span>
            </div>

            {/* Filas de info (solo cuando hay datos de mesa) */}
            {(subtitle || guests != null || openedAtTimestamp) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {subtitle       && <InfoRow label="Espacio"          value={subtitle} />}
                {guests   != null && <InfoRow label="Personas"         value={String(guests)} />}
                {openedAtTimestamp && <InfoRow label="Hora de apertura" value={formatOpenTime(openedAtTimestamp)} />}
                {openedAtTimestamp && <InfoRow label="Tiempo en mesa"   value={formatElapsed(openedAtTimestamp)} />}
              </div>
            )}

            {/* Pre-cuenta */}
            <button
              onClick={() => toast.info('Documento enviado a impresora')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', height: 40, borderRadius: 12,
                background: '#F1F2F6', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: '#121E6C', fontFamily: MFONT,
              }}
            >
              <Printer size={16} color="#121E6C" /> Pre - cuenta
            </button>
          </div>

          <HSep />

          {/* ── Lista de productos (scrolleable) ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', minHeight: 0 }}>

            {/* Encabezado lista */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, paddingBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '20px' }}>
                Pedido
              </span>
              <span style={{ fontSize: 14, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '20px' }}>
                {items.length} producto{items.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 12 }}>
              {items.map(item => {
                const unit      = item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
                const lineTotal = unit * item.quantity;
                return (
                  <div key={item.id} style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#1E1E1E', margin: 0, fontFamily: MFONT, lineHeight: '20px' }}>
                        {item.name}
                        {(item.discount ?? 0) > 0 && (
                          <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: '#1B8959' }}>
                            −{item.discount}%
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 400, color: '#1E1E1E', margin: 0, fontFamily: MFONT, lineHeight: '20px' }}>
                        ${lineTotal.toLocaleString('es-CO')}
                      </p>
                      {item.note && (
                        <p style={{ fontSize: 11, color: '#606060', fontStyle: 'italic', margin: 0, fontFamily: MFONT }}>
                          {item.note}
                        </p>
                      )}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '20px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      x{item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <HSep />

          {/* ── Totales ── */}
          <div style={{ padding: 16, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 400, color: '#606060', fontFamily: MFONT, lineHeight: '20px' }}>Subtotal</span>
              <span style={{ fontSize: 14, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '20px' }}>${subtotal.toLocaleString('es-CO')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 400, color: '#606060', fontFamily: MFONT, lineHeight: '20px' }}>IVA (19%)</span>
              <span style={{ fontSize: 14, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '20px' }}>${tax.toLocaleString('es-CO')}</span>
            </div>

            {tipAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 400, color: '#606060', fontFamily: MFONT, lineHeight: '20px' }}>Propina 10%</span>
                <span style={{ fontSize: 14, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '20px' }}>${tipAmount.toLocaleString('es-CO')}</span>
              </div>
            )}

            {/* Descuento + CTA Agregar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 14, fontFamily: MFONT, color: '#606060', lineHeight: '20px' }}>
                Descuento{' '}
                <span
                  style={{ color: '#121E6C', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer' }}
                  onClick={() => {}}
                >
                  Agregar
                </span>
              </p>
              <span style={{ fontSize: 14, fontWeight: 400, color: '#1E1E1E', fontFamily: MFONT }}>$0</span>
            </div>

            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              paddingTop: 12, marginTop: 4, borderTop: '1px solid #F0F0F0',
            }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '24px' }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#1E1E1E', fontFamily: MFONT, lineHeight: '24px' }}>
                ${grandTotal.toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* ── Botones de acción ── */}
          <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, height: 44, borderRadius: 32,
                border: '1px solid #FF2947', background: '#fff',
                color: '#FF2947', fontSize: 16, fontWeight: 500,
                cursor: 'pointer', fontFamily: MFONT,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={phase === 'completed' ? onClose : finalizePay}
              style={{
                flex: 1, height: 44, borderRadius: 32,
                border: 'none', background: '#FF2947',
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', fontFamily: MFONT,
              }}
            >
              {phase === 'completed' ? 'Finalizar orden' : 'Confirmar pago'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
