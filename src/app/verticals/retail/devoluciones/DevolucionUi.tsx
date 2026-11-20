/**
 * DevolucionUi — piezas compartidas de las vistas de devolución (specs/2026-11-devoluciones-v2.md §3 y §4): estilos, avisos,
 * campos de solo lectura, los campos propios de la devolución (inventario, motivo, método de pago, justificación) y los totales.
 */
import React from 'react';
import { AlertTriangle, CircleAlert } from 'lucide-react';
import { formatCOP } from '../../../utils/format';
import { VALIDACION } from '../../../utils/devoluciones';

export const FONT = "'Montserrat', sans-serif";

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const fmtFechaCorta = (ms: number) => { const d = new Date(ms); return `${d.getDate()} de ${MES[d.getMonth()]} de ${d.getFullYear()}`; };
export const soloDigitos = (s: string) => s.replace(/\D/g, '');
export const num = (s: string) => (s === '' ? 0 : parseInt(s, 10));
/** Valor digitado con separador de miles ("1250000" → "1.250.000"). */
export const miles = (s: string) => (s === '' ? '' : num(s).toLocaleString('es-CO'));

export const labelStyle: React.CSSProperties = { display: 'block', fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--black-60)', marginBottom: 4 };
export const errStyle: React.CSSProperties = { fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' };
export const thStyle: React.CSSProperties = { padding: '10px 10px 10px 0', textAlign: 'left', fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'var(--black-100)', borderBottom: '2px solid var(--black-10)', lineHeight: '16px', verticalAlign: 'bottom' };
export const tdStyle: React.CSSProperties = { padding: '10px 10px 10px 0', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', verticalAlign: 'top' };
export const inputStyle: React.CSSProperties = { width: '100%', height: 36, boxSizing: 'border-box', padding: '0 10px', borderRadius: 8, border: '1.5px solid var(--black-10)', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', backgroundColor: '#fff', outline: 'none' };
export const selectStyle: React.CSSProperties = { ...inputStyle, height: 40, cursor: 'pointer' };
export const bordeError = (hayError: boolean): string => (hayError ? 'var(--coral-100)' : 'var(--black-10)');

export function Banner({ tipo, children }: { tipo: 'error' | 'aviso'; children: React.ReactNode }) {
  // Error: coral. Advertencia: fondo amarillo (token de feedback warning).
  const color = tipo === 'error' ? 'var(--coral-100)' : 'var(--feedback-warning-150)';
  const Icono = tipo === 'error' ? CircleAlert : AlertTriangle;
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, backgroundColor: tipo === 'error' ? 'var(--coral-10)' : 'var(--feedback-warning-10)' }}>
      <Icono size={16} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)' }}>{children}</span>
    </div>
  );
}

/** Dato precargado de la cabecera, en solo lectura. */
export function CampoLectura({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <span style={labelStyle}>{label}</span>
      <div title={valor} style={{ height: 40, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 12px', borderRadius: 8, backgroundColor: 'var(--blue-10)', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {valor || '--'}
      </div>
    </div>
  );
}

interface DatosProps {
  inventario: 'si' | 'no';
  onInventario: (v: 'si' | 'no') => void;
  motivos: { id: string; nombre: string }[];
  motivoId: string;
  onMotivo: (v: string) => void;
  metodos: string[];
  metodoPago: string;
  onMetodo: (v: string) => void;
  justificacion: string;
  onJustificacion: (v: string) => void;
  errJustificacion: string | null;
  intento: boolean;
}

/** Ítems seleccionados que no manejan inventario en la sucursal: va debajo de "Total items", no junto a la pregunta de inventario. */
export function AvisosSinInventario({ nombres }: { nombres: string[] }) {
  if (nombres.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {nombres.map(n => <Banner key={n} tipo="aviso">{n}: Este ítem no maneja inventario en esta sucursal.</Banner>)}
    </div>
  );
}

/** Datos propios de la devolución (inventario, motivo, método de pago, justificación) en un contenedor con borde; iguales en Factura, Comprobante y Sin Documento. */
export function DatosDevolucion(p: DatosProps) {
  // Contenedor con borde: inventario arriba; motivo, método de pago y justificación (input sencillo) en una sola línea de 3 columnas.
  return (
      <div style={{ width: '100%', boxSizing: 'border-box', minWidth: 0, border: '1.5px solid var(--blue-30)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: '#fff' }}>
        <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Datos de la devolución</p>

        {/* Siempre visible, también antes de elegir ítems */}
          <div>
            <span style={{ ...labelStyle, fontSize: 13, color: 'var(--black-100)' }}>Ingreso al Inventario</span>
            <div role="radiogroup" aria-label="Ingreso al Inventario" style={{ display: 'flex', gap: 24 }}>
              {(['si', 'no'] as const).map(o => (
                <label key={o} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <input type="radio" name="inventario" checked={p.inventario === o} onChange={() => p.onInventario(o)} style={{ accentColor: 'var(--blue-100)' }} />
                  {o === 'si' ? 'Sí' : 'No'}
                </label>
              ))}
            </div>
          </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, alignItems: 'start' }}>
          <div>
            <label htmlFor="dev-motivo" style={labelStyle}>Motivo de la devolución *</label>
            <select id="dev-motivo" value={p.motivoId} onChange={e => p.onMotivo(e.target.value)} style={{ ...selectStyle, borderColor: bordeError(p.intento && !p.motivoId) }}>
              <option value="">Selecciona un motivo</option>
              {p.motivos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            {p.intento && !p.motivoId && <p style={errStyle}>{VALIDACION.motivo}</p>}
          </div>
          <div>
            <label htmlFor="dev-metodo" style={labelStyle}>Método de pago *</label>
            <select id="dev-metodo" value={p.metodoPago} onChange={e => p.onMetodo(e.target.value)} style={{ ...selectStyle, borderColor: bordeError(p.intento && !p.metodoPago) }}>
              <option value="">Selecciona un método de pago</option>
              {p.metodos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {p.intento && !p.metodoPago && <p style={errStyle}>{VALIDACION.metodo}</p>}
          </div>
          <div>
            <label htmlFor="dev-justificacion" style={labelStyle}>Justificación *</label>
            <input id="dev-justificacion" type="text" value={p.justificacion} maxLength={250} onChange={e => p.onJustificacion(e.target.value)}
              style={{ ...selectStyle, cursor: 'text', borderColor: bordeError(p.intento && !!p.errJustificacion) }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>{p.intento && p.errJustificacion ? <span style={errStyle}>{p.errJustificacion}</span> : null}</span>
              <span style={{ fontFamily: FONT, fontSize: 12, color: 'var(--black-60)', marginTop: 4, whiteSpace: 'nowrap' }}>{p.justificacion.length}/250</span>
            </div>
          </div>
        </div>
        {p.metodoPago === 'Efectivo' && <Banner tipo="aviso">Antes de continuar revisa el efectivo disponible en caja.</Banner>}
      </div>

  );
}

interface TotalesProps {
  conImpuesto: boolean;
  subtotal: number;
  descuento: number;
  impuestos: { id: string; etiqueta: string; monto: number }[];
  total: number;
}

/** Totales (solo con lo devuelto), alineados a la derecha. */
export function TotalesDevolucion(p: TotalesProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ flex: '0 1 320px', marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 6, fontFamily: FONT, fontSize: 13, color: 'var(--black-100)', minWidth: 240 }}>
        {p.conImpuesto && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{formatCOP(p.subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Descuento</span><span>{formatCOP(p.descuento)}</span></div>
            {p.impuestos.map(i => <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{i.etiqueta}</span><span>{formatCOP(i.monto)}</span></div>)}
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, paddingTop: p.conImpuesto ? 6 : 0, borderTop: p.conImpuesto ? '1px solid var(--black-10)' : 'none' }}>
          <span>Total</span><span>{formatCOP(p.total)}</span>
        </div>
      </div>
    </div>
  );
}
