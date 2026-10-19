/**
 * Modales del módulo Facturas de compra (specs/2026-10-facturas-compra.md §6 y §7):
 * Reportar el pago, Anular, Convertir en Documento Soporte y el modal informativo
 * (Turno / Documento soporte, vistas aún no construidas).
 */
import React, { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import type { FacturaCompra } from '../../types/facturaCompra';
import { useFacturasCompra } from '../../store/facturasCompraStore';
import { METODOS_PAGO, RESOLUCION_DS, TIPOS_OPERACION_DS, TURNO_ACTUAL } from '../../data/facturasCompraSeed';
import { BADGE_ESTADO, FECHA_PROTOTIPO, estadoFactura, fmtFecha, fmtMonto, valorFactura } from '../../utils/facturasCompra';
import { FieldLabel, SelectField, TextAreaField } from '../items/FormField';
import { VentaBadge } from '../ventas/VentaBadge';
import { CenterModal, ModalIcon } from './CenterModal';

const FONT = "'Montserrat', sans-serif";

const opciones = (labels: string[]) => labels.map(l => ({ value: l, label: l }));

// ─── Informativo ─────────────────────────────────────────────────────────────

export function InfoModal({ title, destino, onClose }: { title: string; destino: string; onClose: () => void }) {
  return (
    <CenterModal
      title={title}
      icon={<ModalIcon tone="info"><FileText size={22} /></ModalIcon>}
      subtitle={`Esto debe dirigir al ver ${destino} — esa vista aún no está construida.`}
      onClose={onClose}
      actions={<button className="btn btn-secondary" onClick={onClose}>Entendido</button>}
    />
  );
}

// ─── Reportar el pago ────────────────────────────────────────────────────────

export function ReportarPagoModal({ factura, onClose }: { factura: FacturaCompra; onClose: () => void }) {
  const { reportarPago, settings } = useFacturasCompra();
  const [metodo, setMetodo] = useState('');
  const [asociarTurno, setAsociarTurno] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState('');
  const estado = estadoFactura(factura);

  const guardar = () => {
    if (!metodo) { setError('Selecciona un método de pago'); return; }
    reportarPago(factura.id, { metodo, turno: asociarTurno ? TURNO_ACTUAL : null, observacion: observacion.trim() });
    toast.success(`Pago de ${factura.numero} reportado`);
    onClose();
  };

  return (
    <CenterModal
      wide
      title="Reportar el pago"
      subtitle={<>Confirma los datos de este pago para la factura <strong style={{ color: 'var(--black-100)' }}>{factura.numero}</strong>.</>}
      onClose={onClose}
      actionsRow
      actions={(
        <>
          <button className="btn btn-cancel flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary flex-1" onClick={guardar}>Guardar</button>
        </>
      )}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontFamily: FONT, fontSize: 13, color: 'var(--black-60)' }}>
        <span>Fecha de vencimiento: <strong style={{ color: 'var(--black-100)' }}>{factura.fechaVencimiento ? fmtFecha(factura.fechaVencimiento) : '---'}</strong></span>
        <VentaBadge label={estado} variant={BADGE_ESTADO[estado]} />
      </div>
      <div style={{ backgroundColor: 'var(--blue-10)', borderRadius: 8, padding: '12px 16px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-60)' }}>Valor que reportarás como pagado</span>
        <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: 'var(--blue-100)' }}>{fmtMonto(valorFactura(factura, settings.usarImpuestos))}</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <SelectField label="Método de pago" required value={metodo} onChange={v => { setMetodo(v); setError(''); }}
          options={opciones(METODOS_PAGO)} placeholder="Seleccionar método de pago" error={error} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <FieldLabel>{`¿Deseas asociar este pago al turno No. ${TURNO_ACTUAL}?`}</FieldLabel>
        <SiNo value={asociarTurno} onChange={setAsociarTurno} name="asociarPagoTurno" />
      </div>
      <div style={{ marginBottom: 20 }}>
        <TextAreaField label="Observación del pago" value={observacion} onChange={setObservacion} placeholder="Escribe aquí una observación del pago" />
      </div>
    </CenterModal>
  );
}

/** Radio Sí / No. */
export function SiNo({ value, onChange, name }: { value: boolean; onChange: (v: boolean) => void; name: string }) {
  return (
    <div role="radiogroup" style={{ display: 'flex', gap: 20, padding: '6px 0' }}>
      {[true, false].map(v => (
        <label key={String(v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: FONT, fontSize: 14, color: 'var(--black-100)' }}>
          <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} style={{ width: 16, height: 16, accentColor: 'var(--blue-100)' }} />
          {v ? 'Sí' : 'No'}
        </label>
      ))}
    </div>
  );
}

// ─── Anular ──────────────────────────────────────────────────────────────────

export function AnularModal({ factura, onClose }: { factura: FacturaCompra; onClose: () => void }) {
  const { anularFactura } = useFacturasCompra();
  const [observacion, setObservacion] = useState('');
  const negativos = factura.afectaInventario ? factura.items.filter(i => i.inventariable) : [];

  return (
    <CenterModal
      wide
      icon={<ModalIcon tone="warning"><AlertTriangle size={22} /></ModalIcon>}
      title="¿Estás seguro que quieres anular esta factura?"
      subtitle={`Esta acción afectará tu inventario actual y el reporte de gastos en el turno ${TURNO_ACTUAL}.`}
      onClose={onClose}
      actions={(
        <>
          <button className="btn btn-primary" onClick={() => { anularFactura(factura.id, observacion.trim()); toast.success(`${factura.numero} anulada`); onClose(); }}>
            Sí, anular factura
          </button>
          <button className="btn btn-cancel" onClick={onClose}>Cancelar</button>
        </>
      )}
    >
      {negativos.length > 0 && (
        <div style={{
          backgroundColor: 'var(--feedback-warning-10)', border: '1px solid var(--feedback-warning-100)', borderRadius: 8,
          padding: '10px 14px', marginBottom: 16, fontFamily: FONT, fontSize: 13, lineHeight: '20px', color: 'var(--feedback-warning-200)',
        }}>
          <strong>Advertencia:</strong> los siguientes productos quedarán con inventario negativo: {negativos.map(i => `${i.nombre} - ${i.codigo}`).join(', ')}.
        </div>
      )}
      <div style={{ marginBottom: 20 }}>
        <TextAreaField label="Observación de anulación" value={observacion} onChange={setObservacion} placeholder="Escribe aquí el motivo de la anulación" />
      </div>
    </CenterModal>
  );
}

// ─── Convertir en Documento Soporte ──────────────────────────────────────────

export function ConvertirDSModal({ factura, onClose }: { factura: FacturaCompra; onClose: () => void }) {
  const { convertirEnDS } = useFacturasCompra();
  const [resolucion, setResolucion] = useState('');
  const [tipo, setTipo] = useState('');
  const [fecha, setFecha] = useState(FECHA_PROTOTIPO);
  const [notas, setNotas] = useState('');
  const [errors, setErrors] = useState<{ resolucion?: string; tipo?: string; fecha?: string }>({});
  const [creado, setCreado] = useState<string | null>(null);

  if (creado) {
    return (
      <CenterModal
        icon={<ModalIcon tone="success"><CheckCircle2 size={24} /></ModalIcon>}
        title="Documento Soporte creado exitosamente"
        subtitle="La factura de compra ahora también existe como Documento Soporte."
        onClose={onClose}
        actions={<button className="btn btn-primary" onClick={onClose}>Entendido</button>}
      />
    );
  }

  const guardar = () => {
    const e: typeof errors = {};
    if (!resolucion) e.resolucion = 'Campo obligatorio';
    if (!tipo) e.tipo = 'Campo obligatorio';
    if (!fecha) e.fecha = 'Campo obligatorio';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setCreado(convertirEnDS(factura.id));
  };

  return (
    <CenterModal
      wide
      title="Convertir en Documento Soporte"
      subtitle="Se creará un Documento Soporte a partir de esta factura de compra, que será enviado a la DIAN."
      onClose={onClose}
      actionsRow
      actions={(
        <>
          <button className="btn btn-cancel flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary flex-1" onClick={guardar}>Guardar</button>
        </>
      )}
    >
      <div style={{ marginBottom: 16 }}>
        <SelectField label="Resolución" required value={resolucion} onChange={v => { setResolucion(v); setErrors(e => ({ ...e, resolucion: undefined })); }}
          options={opciones([RESOLUCION_DS])} placeholder="Seleccionar resolución" error={errors.resolucion} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <SelectField label="Tipo de operación" required value={tipo} onChange={v => { setTipo(v); setErrors(e => ({ ...e, tipo: undefined })); }}
          options={opciones(TIPOS_OPERACION_DS)} placeholder="Seleccionar tipo de operación" error={errors.tipo} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <FieldLabel required>Fecha</FieldLabel>
        <input type="date" className="merlin-input-filled" value={fecha} onChange={e => { setFecha(e.target.value); setErrors(er => ({ ...er, fecha: undefined })); }}
          style={errors.fecha ? { borderColor: 'var(--coral-100)' } : undefined} />
        {errors.fecha && <p style={{ fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' }}>{errors.fecha}</p>}
      </div>
      <div style={{ marginBottom: 20 }}>
        <TextAreaField label="Notas de documento soporte" value={notas} onChange={setNotas} placeholder="Escribe aquí notas adicionales del documento soporte" />
      </div>
    </CenterModal>
  );
}
