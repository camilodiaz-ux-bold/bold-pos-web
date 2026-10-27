/**
 * PanelesFacturacion — Numeraciones y Habilitación DIAN (specs/2026-10-ajustes.md §4.3, fase 3).
 * Todo es visual: "Consultar en DIAN" y "Finalizar" simulan la llamada al servicio.
 */
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Check, ChevronRight } from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import { sucursalPrincipal } from '../../../utils/ajustes';
import type { Numeracion, TipoDocumentoNumeracion } from '../../../types/ajustes';
import {
  AccionesFila, BotonNuevo, FONT, FooterForm, FooterLista, FormRow, REQUERIDO, SidePanel, inputErr, soloDigitos, td, th,
} from './PanelUi';

interface PanelProps { onClose: () => void }

const TIPOS: { value: TipoDocumentoNumeracion; label: string }[] = [
  { value: 'factura', label: 'Factura electrónica de Venta' },
  { value: 'notaCredito', label: 'Nota Crédito' },
  { value: 'notaDebito', label: 'Nota Débito' },
  { value: 'documentoSoporte', label: 'Documento Soporte' },
];
const etiquetaTipo = (t: TipoDocumentoNumeracion) => TIPOS.find(x => x.value === t)?.label ?? t;

// ─── Numeraciones ────────────────────────────────────────────────────────────

interface FormNum { tipo: TipoDocumentoNumeracion | ''; sucursalId: string; nombre: string; prefijo: string; consecutivo: string }

export function NumeracionesPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const [editando, setEditando] = useState<{ id: string | null } | null>(null);
  const [form, setForm] = useState<FormNum>({ tipo: '', sucursalId: '', nombre: '', prefijo: '', consecutivo: '' });
  const [errores, setErrores] = useState<Partial<Record<keyof FormNum, string>>>({});
  const [aEliminar, setAEliminar] = useState<Numeracion | null>(null);

  const nombreSucursal = (id: string) => ajustes.sucursales.find(s => s.id === id)?.nombre ?? '—';
  const set = <K extends keyof FormNum>(k: K) => (v: FormNum[K]) => setForm(f => ({ ...f, [k]: v }));

  const abrir = (n: Numeracion | null) => {
    setForm(n
      ? { tipo: n.tipo, sucursalId: n.sucursalId, nombre: n.nombre, prefijo: n.prefijo, consecutivo: String(n.consecutivo) }
      : { tipo: '', sucursalId: '', nombre: '', prefijo: '', consecutivo: '' });
    setErrores({});
    setEditando({ id: n?.id ?? null });
  };

  /** La numeración de la factura electrónica se consulta a la DIAN: aquí se simula con una resolución de prueba. */
  const consultarDian = () => {
    const principal = sucursalPrincipal(ajustes);
    updateAjustes(prev => ({
      ...prev,
      numeraciones: [...prev.numeraciones, {
        id: `num-${Date.now()}`, tipo: 'factura', nombre: 'Resolución DIAN (simulada)', prefijo: 'SETT', sucursalId: principal.id, consecutivo: 1,
      }],
    }));
    toast.success('Resolución consultada en la DIAN (simulado)');
    setEditando(null);
  };

  const guardar = () => {
    const e: typeof errores = {};
    if (!form.sucursalId) e.sucursalId = REQUERIDO;
    if (!form.nombre.trim()) e.nombre = REQUERIDO;
    if (!form.consecutivo || Number(form.consecutivo) < 1) e.consecutivo = form.consecutivo ? 'Debe ser mayor a 0' : REQUERIDO;
    setErrores(e);
    if (Object.keys(e).length || !form.tipo) return;
    const datos = { tipo: form.tipo, sucursalId: form.sucursalId, nombre: form.nombre.trim(), prefijo: form.prefijo.trim().toUpperCase(), consecutivo: Number(form.consecutivo) };
    updateAjustes(prev => ({
      ...prev,
      numeraciones: editando?.id
        ? prev.numeraciones.map(n => (n.id === editando.id ? { ...n, ...datos } : n))
        : [...prev.numeraciones, { id: `num-${Date.now()}`, ...datos }],
    }));
    toast.success(editando?.id ? 'Numeración actualizada' : 'Numeración creada');
    setEditando(null);
  };

  const eliminar = () => {
    if (!aEliminar) return;
    updateAjustes(prev => ({ ...prev, numeraciones: prev.numeraciones.filter(n => n.id !== aEliminar.id) }));
    toast.success('Numeración eliminada');
    setAEliminar(null);
  };

  const esFacturaNueva = editando && !editando.id && form.tipo === 'factura';

  return (
    <>
      <SidePanel
        variant="left" title="Numeraciones" onClose={editando ? () => setEditando(null) : onClose}
        subtitle="Numeraciones que tu negocio aplica para POS, factura electrónica, notas crédito y notas débito."
        footer={editando
          ? <FooterForm onCancel={() => setEditando(null)} onSave={guardar} canSave={!!form.tipo && !esFacturaNueva} />
          : <FooterLista onCancel={onClose} />}
      >
        {editando ? (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <FormRow label="Tipo de documento">
              <select className="merlin-input-filled" value={form.tipo} disabled={!!editando.id}
                onChange={e => set('tipo')(e.target.value as TipoDocumentoNumeracion)}>
                <option value="" disabled>Elige una opción</option>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FormRow>
            {esFacturaNueva && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                <button type="button" onClick={consultarDian} className="btn btn-primary" style={{ borderRadius: 999, padding: '10px 28px', fontSize: 11, letterSpacing: 0.4 }}>
                  CONSULTAR EN DIAN
                </button>
              </div>
            )}
            {form.tipo && !esFacturaNueva && (
              <div style={{ border: '1px solid var(--black-10)', borderRadius: 'var(--radius-12)', padding: '20px 24px 8px', marginTop: 12 }}>
                <p style={{ fontFamily: FONT, fontSize: 12, color: 'var(--black-60)', textAlign: 'center', margin: '0 0 20px' }}>{etiquetaTipo(form.tipo)}</p>
                <FormRow label="Sucursal" required error={errores.sucursalId}>
                  <select className="merlin-input-filled" style={inputErr(errores.sucursalId)} value={form.sucursalId} onChange={e => set('sucursalId')(e.target.value)}>
                    <option value="" disabled>Elige una opción</option>
                    {ajustes.sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </FormRow>
                <FormRow label="Nombre personalizado" required error={errores.nombre}>
                  <input className="merlin-input-filled" style={inputErr(errores.nombre)} placeholder="Ingresa nombre" value={form.nombre} onChange={e => set('nombre')(e.target.value)} />
                </FormRow>
                <FormRow label="Prefijo">
                  <input className="merlin-input-filled" placeholder="Ingresa prefijo" maxLength={6} value={form.prefijo} onChange={e => set('prefijo')(e.target.value)} />
                </FormRow>
                <FormRow label="Siguiente consecutivo" required error={errores.consecutivo}>
                  <input className="merlin-input-filled" style={inputErr(errores.consecutivo)} inputMode="numeric" placeholder="Ingresa siguiente consecutivo"
                    value={form.consecutivo} onChange={e => set('consecutivo')(soloDigitos(e.target.value))} />
                </FormRow>
              </div>
            )}
          </div>
        ) : (
          <>
            <BotonNuevo onClick={() => abrir(null)} />
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Tipo de documento</th><th style={th}>Nombre</th><th style={th}>Prefijo</th><th style={th}>Sucursal</th>
                  <th style={th}>Siguiente consecutivo</th><th style={{ ...th, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ajustes.numeraciones.map(n => (
                  <tr key={n.id}>
                    <td style={td}>{etiquetaTipo(n.tipo)}</td><td style={td}>{n.nombre}</td><td style={td}>{n.prefijo || '—'}</td>
                    <td style={td}>{nombreSucursal(n.sucursalId)}</td><td style={td}>{n.consecutivo}</td>
                    <td style={{ ...td, textAlign: 'right' }}><AccionesFila onEditar={() => abrir(n)} onEliminar={() => setAEliminar(n)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </SidePanel>
      {aEliminar && (
        <ConfirmDeleteModal title="Eliminar numeración" message={`¿Eliminar "${aEliminar.nombre}"? Los documentos ya emitidos conservan su número.`}
          onCancel={() => setAEliminar(null)} onConfirm={eliminar} />
      )}
    </>
  );
}

// ─── Habilitación DIAN ───────────────────────────────────────────────────────

const PASOS = ['Datos de la empresa', 'Envío set de pruebas', 'Numeraciones e Impuestos'];

/**
 * Asistente de 3 pasos. En el staging la cuenta ya está habilitada: el stepper no es navegable y solo el
 * paso 3 es funcional. Los pasos 1 y 2 se muestran completados (no se pudieron relevar; ver spec §9).
 */
export function HabilitacionDianPanel({ onClose }: PanelProps) {
  const [tipo, setTipo] = useState<TipoDocumentoNumeracion>('factura');

  const finalizar = () => {
    toast.success('Habilitación finalizada (simulado)');
    onClose();
  };

  return (
    <SidePanel
      variant="left" title="Habilitación Facturación Electrónica DIAN" onClose={onClose}
      footer={<FooterForm onCancel={onClose} onSave={finalizar} saveLabel="FINALIZAR" />}
    >
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <button
          type="button" onClick={() => toast.info('Guía de habilitación: próximamente')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', borderRadius: 'var(--radius-12)', backgroundColor: 'var(--blue-10)', padding: 16 }}
        >
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--black-100)' }}>Guía del proceso paso a paso</span>
            <span style={{ display: 'block', fontFamily: FONT, fontSize: 12, color: 'var(--black-60)', marginTop: 4 }}>Accede al tutorial de Habilitación de factura electrónica</span>
          </span>
          <ChevronRight size={20} color="var(--black-100)" />
        </button>

        <ol style={{ listStyle: 'none', margin: '32px 0 0', padding: 0, display: 'flex', justifyContent: 'space-between', gap: 8 }} aria-label="Pasos">
          {PASOS.map((p, i) => {
            const activo = i === 2;
            return (
              <li key={p} aria-current={activo ? 'step' : undefined} style={{ fontFamily: FONT, fontSize: 12, textAlign: 'left' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: activo ? 'var(--black-100)' : 'var(--black-40)' }}>
                  {!activo && <Check size={12} />}0{i + 1}
                </span>
                <span style={{ fontWeight: 700, color: activo ? 'var(--black-100)' : 'var(--black-40)' }}>{p}</span>
              </li>
            );
          })}
        </ol>
        <div style={{ position: 'relative', height: 1, backgroundColor: 'var(--black-10)', margin: '8px 0 24px' }}>
          <span style={{ position: 'absolute', left: '66%', top: -4, width: 9, height: 9, borderRadius: '50%', backgroundColor: 'var(--black-100)' }} />
        </div>

        <h3 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: 'var(--black-100)', textAlign: 'center', margin: 0 }}>Configuración de numeración</h3>
        <p style={{ fontFamily: FONT, fontSize: 12, color: 'var(--black-100)', margin: '8px 0 16px' }}>
          Copia el código generado en la DIAN y activa el inicio de tus pruebas.
        </p>
        <label style={{ display: 'block', fontFamily: FONT, fontSize: 12, color: 'var(--black-60)', marginBottom: 6 }}>Tipo de documento:</label>
        <select className="merlin-input-filled" style={{ maxWidth: 220 }} value={tipo} onChange={e => setTipo(e.target.value as TipoDocumentoNumeracion)}>
          {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 120 }}>
          <button
            type="button" onClick={() => toast.info(`${etiquetaTipo(tipo)}: consulta en la DIAN simulada`)}
            className="btn btn-secondary" style={{ borderRadius: 999, borderColor: 'var(--coral-100)', color: 'var(--coral-100)', padding: '10px 28px', fontSize: 11, letterSpacing: 0.4 }}
          >
            CONSULTAR EN DIAN
          </button>
        </div>
      </div>
    </SidePanel>
  );
}
