/**
 * InvoiceTicket — factura electrónica de venta en formato ticket térmico 80 mm.
 * Basado en Factura-POS-Restaurantes.pdf. Se renderiza con renderToStaticMarkup
 * dentro de un iframe de impresión (utils/printInvoice.tsx), por eso usa solo
 * estilos inline: dentro del iframe no hay Tailwind, CSS del sistema ni variables.
 */
import React from 'react';
import svgPaths from '../../imports/svg-5yr7pr5zvq';
import { INVOICE_ISSUER } from '../data/invoiceIssuer';
import { formatInvoiceCOP, type InvoiceData } from '../utils/invoice';

const INK = '#000';
const MUTED = '#444';
const RULE = '1px solid #777';
const FONT = 'Arial, Helvetica, sans-serif';

const rule: React.CSSProperties = { borderTop: RULE, margin: '6px 0' };
const centered: React.CSSProperties = { textAlign: 'center', lineHeight: '14px' };
const headCell: React.CSSProperties = { background: '#EEE', fontWeight: 700, padding: '2px 3px' };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '38% 62%', gap: 4, padding: '1px 0' }}>
      <span>{label}</span>
      <span style={{ wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function Total({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '1px 0', fontWeight: strong ? 700 : 400 }}>
      <span style={{ fontWeight: 700 }}>{label}</span>
      <span style={{ textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export function InvoiceTicket({ invoice }: { invoice: InvoiceData }) {
  const { customer } = invoice;
  const cols = '7mm 22mm 1fr';

  return (
    <div style={{ width: '72mm', margin: '0 auto', fontFamily: FONT, fontSize: 10.5, color: INK, lineHeight: '13px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <svg width="110" height="39" viewBox="0 0 140.621 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={svgPaths.p210b6200} fill={INK} />
        </svg>
      </div>
      <div style={{ ...centered, fontWeight: 700 }}>Factura Electrónica de Venta</div>
      <div style={{ ...centered, fontWeight: 700 }}>No. {invoice.number}</div>
      <div style={centered}>{INVOICE_ISSUER.razonSocial}</div>
      <div style={centered}>NIT: {INVOICE_ISSUER.nit}</div>
      <div style={centered}>{INVOICE_ISSUER.regimen}</div>
      <div style={centered}>{INVOICE_ISSUER.contribuyente}</div>
      <div style={centered}>{INVOICE_ISSUER.direccion}</div>
      <div style={centered}>Teléfono: {INVOICE_ISSUER.telefono}</div>
      <div style={centered}>Correo: {INVOICE_ISSUER.correo}</div>
      <div style={centered}>Sitio Web: {INVOICE_ISSUER.sitioWeb}</div>
      <div style={centered}>Sucursal: {INVOICE_ISSUER.sucursal}</div>

      <div style={rule} />

      {/* Cliente */}
      <div style={{ fontWeight: 700, marginBottom: 2 }}>Datos del cliente:</div>
      <Field label="Cliente:" value={customer.nombre} />
      <Field label="Tipo de documento:" value={customer.tipoDocumento} />
      <Field label="Número de documento:" value={customer.documento} />
      <Field label="Dirección:" value={customer.direccion} />
      <Field label="Teléfono:" value={customer.telefono} />
      <Field label="Correo:" value={customer.correo} />

      <div style={rule} />

      <Field label="Fecha emisión:" value={invoice.emitidaEn} />
      <Field label="Fecha validación:" value={invoice.validadaEn} />

      <div style={rule} />

      {/* Ítems */}
      <div style={{ display: 'grid', gridTemplateColumns: cols }}>
        <div style={headCell}>#</div>
        <div style={headCell}>Cant.</div>
        <div style={headCell}>Cod - Descripción</div>
        <div style={headCell}>Unid.</div>
        <div style={headCell}>V. Unit.</div>
        <div style={headCell}>Valor</div>
      </div>
      {invoice.lines.map(line => (
        <div key={line.index} style={{ marginTop: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '0 3px' }}>
            <div>{line.index}</div>
            <div>{line.quantity.toFixed(2)}</div>
            <div style={{ wordBreak: 'break-word' }}>{line.code} - {line.name}</div>
            <div>UND</div>
            <div style={{ whiteSpace: 'nowrap' }}>{formatInvoiceCOP(line.unitPrice)}</div>
            <div style={{ textAlign: 'right' }}>{formatInvoiceCOP(line.value)}</div>
          </div>
          {line.components.map((c, i) => (
            <div key={i} style={{ padding: '1px 3px 0 29mm', fontSize: 9.5, color: MUTED, wordBreak: 'break-word' }}>
              · {c.qty} {c.name}
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 10 }}>Total items: {invoice.totalItems.toFixed(2)}</div>

      {/* Totales */}
      <div style={{ marginLeft: '28%', marginTop: 2 }}>
        <Total label="Subtotal:" value={formatInvoiceCOP(invoice.subtotal)} />
        <Total label="Base imponible:" value={formatInvoiceCOP(invoice.subtotal)} />
        <Total label={`IVA ${(invoice.taxRate * 100).toFixed(2)} %:`} value={formatInvoiceCOP(invoice.tax)} />
        <Total label="Descuento:" value={formatInvoiceCOP(invoice.discount)} />
        {invoice.tip > 0 && <Total label={`${invoice.tipLabel}:`} value={formatInvoiceCOP(invoice.tip)} />}
        <Total label="Total:" value={formatInvoiceCOP(invoice.total)} strong />
      </div>

      <div style={{ marginTop: 10 }}>Son: {invoice.totalInWords}</div>

      <div style={{ marginTop: 12 }}>Notas: {invoice.note}</div>
      {invoice.orderRef && <div style={{ marginTop: 8 }}>Orden No.: {invoice.orderRef}</div>}
      {invoice.mesa && <div>Mesa: {invoice.mesa}</div>}
      <div>{invoice.meseroLabel}: {invoice.mesero}</div>

      <div style={rule} />

      {/* Pago */}
      <div><b>Forma de pago:</b> Contado</div>
      <div><b>Medio de pago:</b> {invoice.mediosDePago}</div>
      {invoice.cambio > 0 && <div><b>Cambio:</b> {formatInvoiceCOP(invoice.cambio)}</div>}
      <div><b>Días:</b> 1</div>
    </div>
  );
}
