/**
 * SaleCompletedPanel — panel lateral "Venta Completada" que aparece sobre
 * Mesas/Mostrador al confirmar el pago (ver specs/2026-09-checkout-factura.md).
 * Solo "Imprimir factura" y "Nueva venta" tienen lógica; correo, WhatsApp y
 * caja registradora son visuales (toast), como el "Enviar" que había antes.
 * Al abrirse, el diálogo de impresión de la factura se dispara solo; el botón
 * "Imprimir factura" queda para reimprimir.
 */
import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Mail, MessageCircle, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { buildInvoiceData, resolveCustomer, type CompletedSale } from '../utils/invoice';
import { printInvoice } from '../utils/printInvoice';

const MFONT = 'Montserrat, sans-serif';

const fieldStyle: React.CSSProperties = {
  flex: 1, minWidth: 0, height: 52, padding: '0 16px', border: 'none', outline: 'none', borderRadius: 'var(--radius-12)',
  background: 'var(--black-10)', color: 'var(--black-100)', fontFamily: MFONT, fontSize: 14,
};

const linkStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
  color: 'var(--blue-100)', fontFamily: MFONT, fontSize: 14, fontWeight: 700, textDecoration: 'underline',
};

interface Props {
  sale: CompletedSale;
  onNewSale: () => void;
}

export function SaleCompletedPanel({ sale, onNewSale }: Props) {
  const customer = resolveCustomer(sale.cliente);
  const [email, setEmail] = useState(customer.correo);
  const [phone, setPhone] = useState(customer.telefono);

  // Impresión automática al abrir el panel (una sola vez por venta, aun con StrictMode).
  const autoPrinted = useRef(false);
  useEffect(() => {
    if (autoPrinted.current) return;
    autoPrinted.current = true;
    printInvoice(buildInvoiceData(sale));
  }, [sale]);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.45)' }} />
      <aside
        role="dialog"
        aria-label="Venta completada"
        style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(560px, 100%)', zIndex: 401, background: 'var(--black-0)', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(18,30,108,0.12)', fontFamily: MFONT }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 0' }}>
          <h2 style={{ margin: 0, textAlign: 'center', fontSize: 18, fontWeight: 700, color: 'var(--blue-100)' }}>Venta Completada</h2>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '28px 0 20px' }}>
            <CheckCircle2 size={64} color="var(--feedback-success-100)" />
          </div>
          <p style={{ margin: '0 0 32px', textAlign: 'center', fontSize: 40, fontWeight: 700, color: 'var(--blue-100)' }}>
            $ {sale.total.toLocaleString('es-CO')}
          </p>

          <label style={{ display: 'block', margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: 'var(--blue-100)' }}>Escribe un correo electrónico</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} style={fieldStyle} />
            <button style={linkStyle} onClick={() => toast.info('Factura enviada por correo')}><Mail size={20} /> Enviar</button>
          </div>

          <label style={{ display: 'block', margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: 'var(--blue-100)' }}>Escribe el número de teléfono del cliente</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <input value={phone} onChange={e => setPhone(e.target.value)} style={fieldStyle} />
            <button style={linkStyle} onClick={() => toast.info('Factura enviada por WhatsApp')}><MessageCircle size={20} /> Enviar</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            <button style={linkStyle} onClick={() => toast.info('Buscar contactos de WhatsApp')}><MessageCircle size={20} /> O busca en tus contactos guardados en whatsapp</button>
            <button style={linkStyle} onClick={() => toast.info('Abriendo caja registradora')}><Receipt size={20} /> Abrir caja registradora</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, padding: 32, flexShrink: 0 }}>
          <button
            onClick={() => printInvoice(buildInvoiceData(sale))}
            style={{ flex: 1, height: 52, borderRadius: 32, border: '1.5px solid var(--coral-100)', background: 'var(--black-0)', color: 'var(--coral-100)', fontFamily: MFONT, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            Imprimir factura
          </button>
          <button
            onClick={onNewSale}
            style={{ flex: 1, height: 52, borderRadius: 32, border: 'none', background: 'var(--coral-100)', color: 'var(--black-0)', fontFamily: MFONT, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            Nueva venta
          </button>
        </div>
      </aside>
    </>
  );
}
