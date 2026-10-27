/**
 * PerfilPage — "Perfil del negocio" (specs/2026-10-ajustes.md §4.2, fase 3).
 * Página completa con tarjetas de información; cada "Editar" abre un panel derecho. La validación de
 * correo y celular, y el cambio de datos de facturación electrónica, son simulados.
 */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Check, ChevronLeft, ImageIcon, Info } from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import { Toggle } from '../../../components/items/Toggle';
import { SelectField } from '../../../components/items/FormField';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import { EMAIL_RE, calcularDV } from '../../../utils/ajustes';
import type { PerfilNegocio } from '../../../types/ajustes';
import { FONT, FooterDerecho, REQUERIDO, SidePanel, inputErr } from './PanelUi';

const OPCIONES = {
  tipoPersona: ['Persona Jurídica', 'Persona Natural'],
  departamentoCiudad: ['Bogotá / BOGOTÁ, D.C.', 'Antioquia / MEDELLÍN', 'Valle del Cauca / CALI', 'Atlántico / BARRANQUILLA', 'Bolívar / CARTAGENA', 'Quindío / ARMENIA', 'Santander / BUCARAMANGA'],
  tipoDocumento: ['NIT', 'Cédula de ciudadanía', 'Cédula de extranjería', 'Pasaporte'],
  responsabilidadFiscal: ['No aplica - Otros *', 'O-13 Gran contribuyente', 'O-15 Autorretenedor', 'O-23 Agente de retención IVA', 'O-47 Régimen simple de tributación'],
  regimenFiscal: ['IVA e INC', 'No responsable de IVA', 'Régimen simple de tributación'],
} as const;

const card: React.CSSProperties = {
  backgroundColor: 'var(--black-0)', borderRadius: 'var(--radius-12)', boxShadow: 'var(--shadow-4)', padding: '20px 24px',
};
const tituloCard: React.CSSProperties = { fontFamily: FONT, fontSize: 15, fontWeight: 700, color: 'var(--blue-100)', margin: '0 0 12px' };
const etiqueta: React.CSSProperties = { fontFamily: FONT, fontSize: 11, color: 'var(--black-60)', margin: 0 };
const valor: React.CSSProperties = { fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--black-100)', margin: '2px 0 0', lineHeight: '18px' };
const botonGris: React.CSSProperties = {
  width: '100%', height: 40, borderRadius: 'var(--radius-8)', border: 'none', cursor: 'pointer', backgroundColor: 'var(--blue-10)',
  fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--blue-100)',
};
const errorStyle: React.CSSProperties = { fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' };
const labelPanel: React.CSSProperties = { display: 'block', fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'var(--blue-100)', marginBottom: 6 };

function Dato({ label, children, borde = true }: { label: string; children: React.ReactNode; borde?: boolean }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: borde ? '1px solid var(--black-10)' : 'none' }}>
      <p style={etiqueta}>{label}</p>
      <p style={valor}>{children}</p>
    </div>
  );
}

type PanelAbierto = 'general' | 'adicional' | 'celular' | 'correo' | 'fe' | null;

export function PerfilPage() {
  const navigate = useNavigate();
  const { ajustes, updateAjustes } = useAjustes();
  const p = ajustes.perfil;
  const [panel, setPanel] = useState<PanelAbierto>(null);
  const [confirmaLogo, setConfirmaLogo] = useState(false);
  const archivo = useRef<HTMLInputElement>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [borrador, setBorrador] = useState<PerfilNegocio>(p);

  const abrir = (que: Exclude<PanelAbierto, null>) => { setBorrador(p); setErrores({}); setPanel(que); };
  const cerrar = () => setPanel(null);
  const guardarPerfil = (patch: Partial<PerfilNegocio>, mensaje: string) => {
    updateAjustes(prev => ({ ...prev, perfil: { ...prev.perfil, ...patch } }));
    toast.success(mensaje);
    cerrar();
  };
  const set = <K extends keyof PerfilNegocio>(k: K) => (v: PerfilNegocio[K]) => setBorrador(b => ({ ...b, [k]: v }));

  // ── Guardados por panel ──
  const guardarGeneral = () => {
    const e: Record<string, string> = {};
    const nit = borrador.nit.replace(/\D/g, '');
    if (!borrador.nombre.trim()) e.nombre = REQUERIDO;
    if (!nit) e.nit = REQUERIDO; else if (nit.length < 6 || nit.length > 10) e.nit = 'El NIT debe tener entre 6 y 10 dígitos';
    if (!borrador.direccion.trim()) e.direccion = REQUERIDO;
    setErrores(e);
    if (Object.keys(e).length) return;
    guardarPerfil({ nombre: borrador.nombre.trim(), nit, direccion: borrador.direccion.trim() }, 'Información general actualizada');
  };
  const guardarAdicional = () => guardarPerfil({ leyenda: borrador.leyenda.trim(), paginaWeb: borrador.paginaWeb.trim() }, 'Información adicional actualizada');
  const validarCelular = () => {
    const cel = borrador.celular.replace(/\D/g, '');
    if (cel.length < 7 || cel.length > 10) { setErrores({ celular: 'Ingresa un número de celular válido' }); return; }
    guardarPerfil({ celular: cel, celularValidado: true }, 'Número de celular validado (simulado)');
  };
  const validarCorreo = () => {
    if (!EMAIL_RE.test(borrador.correo.trim())) { setErrores({ correo: 'Ingresa un correo válido' }); return; }
    guardarPerfil({ correo: borrador.correo.trim(), correoValidado: true }, 'Correo validado (simulado)');
  };
  const guardarFE = () => {
    const faltan = (['tipoPersona', 'departamentoCiudad', 'tipoDocumento', 'responsabilidadFiscal', 'regimenFiscal'] as const).some(k => !borrador[k]);
    if (faltan) { setErrores({ fe: REQUERIDO }); return; }
    guardarPerfil({
      tipoPersona: borrador.tipoPersona, departamentoCiudad: borrador.departamentoCiudad, tipoDocumento: borrador.tipoDocumento,
      responsabilidadFiscal: borrador.responsabilidadFiscal, regimenFiscal: borrador.regimenFiscal,
    }, 'Información de facturación electrónica actualizada');
  };

  const cargarLogo = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('Elige una imagen (PNG o JPG)'); return; }
    if (f.size > 300_000) { toast.error('La imagen pesa más de 300 KB'); return; }
    const lector = new FileReader();
    lector.onload = () => { updateAjustes(prev => ({ ...prev, perfil: { ...prev.perfil, logo: String(lector.result) } })); toast.success('Logo actualizado'); };
    lector.readAsDataURL(f);
  };

  const botonValidar = (validado: boolean, onClick: () => void) => validado
    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--green-100, #1F8F5F)' }}><Check size={14} /> Validado</span>
    : <button type="button" onClick={onClick} style={{ ...botonGris, width: 104, height: 36 }}>Validar</button>;

  const opciones = (k: keyof typeof OPCIONES) => OPCIONES[k].map(o => ({ value: o, label: o }));

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24 }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <button type="button" onClick={() => navigate('/ajustes')} aria-label="Volver a Ajustes" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
            <ChevronLeft size={22} color="var(--blue-100)" />
          </button>
          <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: 'var(--blue-100)', margin: 0 }}>Perfil del negocio</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
          {/* ── Columna izquierda ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section style={card} aria-label="Información general">
              <h2 style={tituloCard}>Información general</h2>
              <Dato label="Nombre de la empresa">{p.nombre}</Dato>
              <Dato label="NIT">{p.nit} - {calcularDV(p.nit)}</Dato>
              <Dato label="Dirección">{p.direccion}</Dato>
              <div style={{ marginTop: 12 }}><button type="button" style={botonGris} onClick={() => abrir('general')}>Editar</button></div>
            </section>

            <section style={card} aria-label="Información de contacto">
              <h2 style={tituloCard}>Información de contacto</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--black-10)' }}>
                <Dato label="Número de celular" borde={false}>+57 {p.celular}</Dato>
                {botonValidar(p.celularValidado, () => abrir('celular'))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Dato label="Correo electrónico" borde={false}>{p.correo}</Dato>
                {botonValidar(p.correoValidado, () => abrir('correo'))}
              </div>
            </section>

            <section style={card} aria-label="Información adicional">
              <h2 style={tituloCard}>Información adicional</h2>
              <Dato label="Leyenda o datos adicionales"><span style={{ fontWeight: 500, color: 'var(--black-60)' }}>{p.leyenda || '—'}</span></Dato>
              <Dato label="Página Web" borde={false}><span style={{ fontWeight: 500, color: 'var(--black-60)' }}>{p.paginaWeb || '—'}</span></Dato>
              <div style={{ marginTop: 12 }}><button type="button" style={botonGris} onClick={() => abrir('adicional')}>Editar</button></div>
            </section>
            <p style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontFamily: FONT, fontSize: 11, color: 'var(--black-60)', margin: 0 }}>
              <Info size={14} color="var(--blue-100)" style={{ flexShrink: 0 }} />
              Esta información se podrá ver en todos tus documentos de ingresos y gastos (Facturas de Venta/Compra).
            </p>
          </div>

          {/* ── Columna derecha ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section style={card} aria-label="Logo">
              <div style={{ height: 120, borderRadius: 'var(--radius-8)', backgroundColor: 'var(--blue-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {p.logo
                  ? <img src={p.logo} alt="Logo del negocio" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  : <ImageIcon size={36} color="var(--blue-40)" />}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="button" style={botonGris} onClick={() => archivo.current?.click()}>Editar</button>
                <button type="button" style={{ ...botonGris, opacity: p.logo ? 1 : 0.5, cursor: p.logo ? 'pointer' : 'not-allowed' }} disabled={!p.logo} onClick={() => setConfirmaLogo(true)}>Eliminar</button>
              </div>
              <input ref={archivo} type="file" accept="image/*" hidden onChange={e => { cargarLogo(e.target.files?.[0]); e.target.value = ''; }} />
              <p style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontFamily: FONT, fontSize: 11, color: 'var(--black-60)', margin: '12px 0 0' }}>
                <Info size={14} color="var(--blue-100)" style={{ flexShrink: 0 }} />
                Tu logo se podrá ver en todos tus documentos de ingresos y gastos (Facturas de Venta/Compra).
              </p>
            </section>

            <section style={card} aria-label="Facturación Electrónica">
              <h2 style={tituloCard}>Facturación Electrónica</h2>
              <Toggle checked={p.facturacionElectronica} ariaLabel="Facturación electrónica"
                onChange={v => { updateAjustes(prev => ({ ...prev, perfil: { ...prev.perfil, facturacionElectronica: v } })); toast.success(v ? 'Facturación electrónica activada' : 'Facturación electrónica desactivada'); }} />
              <p style={{ fontFamily: FONT, fontSize: 11, color: 'var(--black-40)', margin: '12px 0 4px', lineHeight: '16px' }}>Tu plan incluye cantidad ilimitada de Documentos Electrónicos durante su vigencia</p>
              <p style={{ fontFamily: FONT, fontSize: 11, color: 'var(--black-40)', margin: '0 0 8px', lineHeight: '16px' }}>Al activar, puedes generar el documento de facturación electrónica en todas tus ventas.</p>
              <Dato label="Tipo de persona">{p.tipoPersona}</Dato>
              <Dato label="Departamento / Ciudad">{p.departamentoCiudad}</Dato>
              <Dato label="Responsabilidad fiscal">{p.responsabilidadFiscal}</Dato>
              <Dato label="Régimen fiscal" borde={false}>{p.regimenFiscal}</Dato>
              <div style={{ marginTop: 12 }}><button type="button" style={botonGris} onClick={() => abrir('fe')}>Editar</button></div>
            </section>
          </div>
        </div>
      </div>

      {panel === 'general' && (
        <SidePanel variant="right" title="Información general" onClose={cerrar}
          footer={<FooterDerecho onCancel={cerrar} onSave={guardarGeneral} saveLabel="Guardar" canSave={!!borrador.nombre.trim()} />}>
          <label style={labelPanel}>Nombre de la empresa <span style={{ color: 'var(--coral-100)' }}>*</span></label>
          <input className="merlin-input-filled" style={inputErr(errores.nombre)} value={borrador.nombre} onChange={e => set('nombre')(e.target.value)} />
          {errores.nombre && <p style={errorStyle}>{errores.nombre}</p>}
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={labelPanel}>NIT <span style={{ color: 'var(--coral-100)' }}>*</span></label>
              <input className="merlin-input-filled" style={inputErr(errores.nit)} inputMode="numeric" value={borrador.nit} onChange={e => set('nit')(e.target.value.replace(/\D/g, ''))} />
              {errores.nit && <p style={errorStyle}>{errores.nit}</p>}
            </div>
            <div style={{ width: 80 }}>
              <label style={labelPanel}>DV</label>
              <input className="merlin-input-filled" readOnly disabled value={borrador.nit ? calcularDV(borrador.nit) : ''} aria-label="Dígito de verificación" />
            </div>
          </div>
          <label style={{ ...labelPanel, marginTop: 18 }}>Dirección <span style={{ color: 'var(--coral-100)' }}>*</span></label>
          <input className="merlin-input-filled" style={inputErr(errores.direccion)} value={borrador.direccion} onChange={e => set('direccion')(e.target.value)} />
          {errores.direccion && <p style={errorStyle}>{errores.direccion}</p>}
        </SidePanel>
      )}

      {panel === 'adicional' && (
        <SidePanel variant="right" title="Información adicional" onClose={cerrar}
          footer={<FooterDerecho onCancel={cerrar} onSave={guardarAdicional} saveLabel="Guardar" />}>
          <label style={labelPanel}>Leyenda o datos adicionales</label>
          <textarea className="merlin-input-filled" rows={5} value={borrador.leyenda} onChange={e => set('leyenda')(e.target.value)} />
          <label style={{ ...labelPanel, marginTop: 18 }}>Página Web</label>
          <input className="merlin-input-filled" value={borrador.paginaWeb} onChange={e => set('paginaWeb')(e.target.value)} />
        </SidePanel>
      )}

      {panel === 'celular' && (
        <SidePanel variant="right" title="Valida tu número de celular" onClose={cerrar}
          footer={<FooterDerecho onCancel={cerrar} onSave={validarCelular} saveLabel="Validar" />}>
          <label style={labelPanel}>Número de celular</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 'var(--radius-8)', backgroundColor: 'var(--blue-10)', fontFamily: FONT, fontSize: 14 }}>+57</span>
            <input className="merlin-input-filled" style={inputErr(errores.celular)} inputMode="numeric" value={borrador.celular} onChange={e => set('celular')(e.target.value.replace(/\D/g, ''))} />
          </div>
          {errores.celular ? <p style={errorStyle}>{errores.celular}</p> : <p style={{ fontFamily: FONT, fontSize: 11, color: 'var(--black-40)', margin: '6px 0 0' }}>Enviamos un código de validación a tu número de celular.</p>}
        </SidePanel>
      )}

      {panel === 'correo' && (
        <SidePanel variant="right" title="Valida tu correo electrónico" onClose={cerrar}
          footer={<FooterDerecho onCancel={cerrar} onSave={validarCorreo} saveLabel="Validar" />}>
          <label style={labelPanel}>Correo electrónico</label>
          <input className="merlin-input-filled" style={inputErr(errores.correo)} type="email" value={borrador.correo} onChange={e => set('correo')(e.target.value)} />
          {errores.correo ? <p style={errorStyle}>{errores.correo}</p> : <p style={{ fontFamily: FONT, fontSize: 11, color: 'var(--black-40)', margin: '6px 0 0' }}>Enviamos un código de validación a tu correo.</p>}
        </SidePanel>
      )}

      {panel === 'fe' && (
        <SidePanel variant="right" title="Información para Facturación Electrónica" onClose={cerrar}
          footer={<FooterDerecho onCancel={cerrar} onSave={guardarFE} saveLabel="Guardar" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <SelectField label="Tipo de persona" required clearable value={borrador.tipoPersona} onChange={set('tipoPersona')} options={opciones('tipoPersona')} />
            <SelectField label="Departamento / Ciudad" required clearable value={borrador.departamentoCiudad} onChange={set('departamentoCiudad')} options={opciones('departamentoCiudad')} />
            <SelectField label="Tipo de documento" required clearable value={borrador.tipoDocumento} onChange={set('tipoDocumento')} options={opciones('tipoDocumento')} />
            <SelectField label="Responsabilidad fiscal" required clearable value={borrador.responsabilidadFiscal} onChange={set('responsabilidadFiscal')} options={opciones('responsabilidadFiscal')} />
            <SelectField label="Régimen fiscal" required clearable value={borrador.regimenFiscal} onChange={set('regimenFiscal')} options={opciones('regimenFiscal')} />
            {errores.fe && <p style={errorStyle}>Completa todos los campos obligatorios</p>}
          </div>
        </SidePanel>
      )}

      {confirmaLogo && (
        <ConfirmDeleteModal title="Eliminar logo" message="¿Eliminar el logo? Dejará de verse en tus documentos."
          onCancel={() => setConfirmaLogo(false)}
          onConfirm={() => { updateAjustes(prev => ({ ...prev, perfil: { ...prev.perfil, logo: null } })); setConfirmaLogo(false); toast.success('Logo eliminado'); }} />
      )}
    </div>
  );
}
