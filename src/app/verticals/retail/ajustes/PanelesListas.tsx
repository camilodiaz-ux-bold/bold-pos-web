/**
 * PanelesListas — paneles izquierdos de Ajustes con lista + formulario (specs/2026-10-ajustes.md §4):
 * Descuentos, Vendedores, Sucursales y Numeración documentos no electrónicos.
 */
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAjustes } from '../../../store/ajustesStore';
import { useFacturasCompra } from '../../../store/facturasCompraStore';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import { LIMITE_SUCURSALES, numeracionInicial } from '../../../data/ajustesSeed';
import { siguienteSecuencia } from '../../../utils/facturasCompra';
import { EMAIL_RE, aNumero, fmtTasa, sucursalPrincipal } from '../../../utils/ajustes';
import type { Descuento, PapelImpresion, Sucursal, Vendedor } from '../../../types/ajustes';
import {
  AccionesFila, BotonNuevo, FONT, FooterForm, FooterLista, FormRow, REQUERIDO, SidePanel, inputErr, soloDigitos, td, th,
} from './PanelUi';

interface PanelProps { onClose: () => void }

// ─── Descuentos ──────────────────────────────────────────────────────────────

export function DescuentosPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const [editando, setEditando] = useState<{ id: string | null } | null>(null);
  const [aEliminar, setAEliminar] = useState<Descuento | null>(null);
  const [nombre, setNombre] = useState('');
  const [tasa, setTasa] = useState('');
  const [errores, setErrores] = useState<{ nombre?: string; tasa?: string }>({});

  const abrir = (d: Descuento | null) => {
    setNombre(d?.nombre ?? '');
    setTasa(d ? String(d.tasa).replace('.', ',') : '');
    setErrores({});
    setEditando({ id: d?.id ?? null });
  };

  const guardar = () => {
    const e: typeof errores = {};
    if (!nombre.trim()) e.nombre = REQUERIDO;
    const t = aNumero(tasa);
    if (!tasa.trim()) e.tasa = REQUERIDO;
    else if (Number.isNaN(t) || t < 0 || t > 100) e.tasa = 'Ingresa un porcentaje entre 0 y 100';
    setErrores(e);
    if (Object.keys(e).length) return;
    updateAjustes(prev => ({
      ...prev,
      descuentos: editando?.id
        ? prev.descuentos.map(d => (d.id === editando.id ? { ...d, nombre: nombre.trim(), tasa: t } : d))
        : [...prev.descuentos, { id: `dsc-${Date.now()}`, nombre: nombre.trim(), tasa: t }],
    }));
    toast.success(editando?.id ? 'Descuento actualizado' : 'Descuento creado');
    setEditando(null);
  };

  const eliminar = () => {
    if (!aEliminar) return;
    updateAjustes(prev => ({ ...prev, descuentos: prev.descuentos.filter(d => d.id !== aEliminar.id) }));
    toast.success('Descuento eliminado');
    setAEliminar(null);
  };

  const lista = [...ajustes.descuentos].sort((a, b) => a.tasa - b.tasa);

  return (
    <>
      <SidePanel
        variant="left" title="Descuentos" onClose={editando ? () => setEditando(null) : onClose}
        subtitle="Descuentos a utilizar al momento de realizar un ingreso/gasto o creación de inventario."
        footer={editando
          ? <FooterForm onCancel={() => setEditando(null)} onSave={guardar} canSave={!!nombre.trim() && !!tasa.trim()} />
          : <FooterLista onCancel={onClose} />}
      >
        {editando ? (
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <FormRow label="Nombre del descuento" required error={errores.nombre}>
              <input className="merlin-input-filled" style={inputErr(errores.nombre)} placeholder="Ingresa nombre"
                value={nombre} onChange={e => setNombre(e.target.value)} />
            </FormRow>
            <FormRow label="Tasa" required error={errores.tasa} helper="Porcentaje entre 0 y 100">
              <input className="merlin-input-filled" style={inputErr(errores.tasa)} inputMode="decimal" placeholder="0"
                value={tasa} onChange={e => setTasa(e.target.value.replace(/[^\d.,]/g, ''))} />
            </FormRow>
          </div>
        ) : (
          <>
            <BotonNuevo onClick={() => abrir(null)} />
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Nombre</th><th style={th}>Descuento%</th><th style={{ ...th, textAlign: 'right' }}>Acciones</th></tr></thead>
              <tbody>
                {lista.map(d => (
                  <tr key={d.id}>
                    <td style={td}>{d.nombre}</td>
                    <td style={td}>{fmtTasa(d.tasa)}</td>
                    <td style={{ ...td, textAlign: 'right' }}><AccionesFila onEditar={() => abrir(d)} onEliminar={() => setAEliminar(d)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lista.length === 0 && <p style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-40)', textAlign: 'center', marginTop: 24 }}>Aún no hay descuentos.</p>}
          </>
        )}
      </SidePanel>
      {aEliminar && (
        <ConfirmDeleteModal title="Eliminar descuento" message={`¿Eliminar "${aEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onCancel={() => setAEliminar(null)} onConfirm={eliminar} />
      )}
    </>
  );
}

// ─── Vendedores ──────────────────────────────────────────────────────────────

export function VendedoresPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const [editando, setEditando] = useState<{ id: string | null } | null>(null);
  const [aEliminar, setAEliminar] = useState<Vendedor | null>(null);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [errores, setErrores] = useState<{ codigo?: string; nombre?: string }>({});

  const abrir = (v: Vendedor | null) => {
    setCodigo(v?.id ?? '');
    setNombre(v?.nombre ?? '');
    setErrores({});
    setEditando({ id: v?.id ?? null });
  };

  const guardar = () => {
    const e: typeof errores = {};
    const cod = codigo.trim();
    if (!cod) e.codigo = REQUERIDO;
    else if (ajustes.vendedores.some(v => v.id.toLowerCase() === cod.toLowerCase() && v.id !== editando?.id)) e.codigo = 'Ya existe un vendedor con este Id';
    if (!nombre.trim()) e.nombre = REQUERIDO;
    setErrores(e);
    if (Object.keys(e).length) return;
    updateAjustes(prev => ({
      ...prev,
      vendedores: editando?.id
        ? prev.vendedores.map(v => (v.id === editando.id ? { id: cod, nombre: nombre.trim() } : v))
        : [...prev.vendedores, { id: cod, nombre: nombre.trim() }],
    }));
    toast.success(editando?.id ? 'Vendedor actualizado' : 'Vendedor creado');
    setEditando(null);
  };

  const eliminar = () => {
    if (!aEliminar) return;
    updateAjustes(prev => ({ ...prev, vendedores: prev.vendedores.filter(v => v.id !== aEliminar.id) }));
    toast.success('Vendedor eliminado');
    setAEliminar(null);
  };

  return (
    <>
      <SidePanel
        variant="left" title="Vendedores" onClose={editando ? () => setEditando(null) : onClose}
        footer={editando
          ? <FooterForm onCancel={() => setEditando(null)} onSave={guardar} canSave={!!codigo.trim() && !!nombre.trim()} />
          : <FooterLista onCancel={onClose} />}
      >
        {editando ? (
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <FormRow label="Id" required error={errores.codigo}>
              <input className="merlin-input-filled" style={inputErr(errores.codigo)} placeholder="Ingresa un ID para tu vendedor"
                value={codigo} onChange={e => setCodigo(e.target.value)} />
            </FormRow>
            <FormRow label="Nombre Completo" required error={errores.nombre}>
              <input className="merlin-input-filled" style={inputErr(errores.nombre)} placeholder="Ingresa el nombre de tu vendedor"
                value={nombre} onChange={e => setNombre(e.target.value)} />
            </FormRow>
          </div>
        ) : (
          <>
            <BotonNuevo onClick={() => abrir(null)} />
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Id</th><th style={th}>Nombre</th><th style={{ ...th, textAlign: 'right' }}>Acciones</th></tr></thead>
              <tbody>
                {ajustes.vendedores.map(v => (
                  <tr key={v.id}>
                    <td style={td}>{v.id}</td>
                    <td style={td}>{v.nombre}</td>
                    <td style={{ ...td, textAlign: 'right' }}><AccionesFila onEditar={() => abrir(v)} onEliminar={() => setAEliminar(v)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </SidePanel>
      {aEliminar && (
        <ConfirmDeleteModal title="Eliminar vendedor" message={`¿Eliminar a "${aEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onCancel={() => setAEliminar(null)} onConfirm={eliminar} />
      )}
    </>
  );
}

// ─── Sucursales ──────────────────────────────────────────────────────────────

const PAPELES: PapelImpresion[] = ['Papel Media Página', 'Papel Carta', 'Papel Listín', 'Todos los formatos'];

interface FormSucursal {
  nombre: string; direccion: string; ciudad: string; correo: string; siguienteCotizacion: string; papelDefecto: PapelImpresion | '';
}
const VACIA: FormSucursal = { nombre: '', direccion: '', ciudad: '', correo: '', siguienteCotizacion: '', papelDefecto: '' };

export function SucursalesPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const [editando, setEditando] = useState<{ id: string | null } | null>(null);
  const [form, setForm] = useState<FormSucursal>(VACIA);
  const [errores, setErrores] = useState<Partial<Record<keyof FormSucursal, string>>>({});
  const [limite, setLimite] = useState(false);

  const set = <K extends keyof FormSucursal>(k: K) => (v: FormSucursal[K]) => setForm(f => ({ ...f, [k]: v }));

  const abrir = (s: Sucursal | null) => {
    if (!s && ajustes.sucursales.length >= LIMITE_SUCURSALES) { setLimite(true); return; }
    setForm(s ? {
      nombre: s.nombre, direccion: s.direccion, ciudad: s.ciudad, correo: s.correo,
      siguienteCotizacion: String(s.siguienteCotizacion), papelDefecto: s.papelDefecto,
    } : VACIA);
    setErrores({});
    setEditando({ id: s?.id ?? null });
  };

  const guardar = () => {
    const e: typeof errores = {};
    if (!form.nombre.trim()) e.nombre = REQUERIDO;
    if (!form.direccion.trim()) e.direccion = REQUERIDO;
    if (!form.ciudad.trim()) e.ciudad = REQUERIDO;
    if (form.correo.trim() && !EMAIL_RE.test(form.correo.trim())) e.correo = 'Ingresa un correo válido';
    if (!form.siguienteCotizacion) e.siguienteCotizacion = REQUERIDO;
    if (!form.papelDefecto) e.papelDefecto = REQUERIDO;
    setErrores(e);
    if (Object.keys(e).length) return;
    const datos = {
      nombre: form.nombre.trim(), direccion: form.direccion.trim(), ciudad: form.ciudad.trim(), correo: form.correo.trim(),
      siguienteCotizacion: Number(form.siguienteCotizacion), papelDefecto: form.papelDefecto as PapelImpresion,
    };
    updateAjustes(prev => {
      if (editando?.id) {
        return { ...prev, sucursales: prev.sucursales.map(s => (s.id === editando.id ? { ...s, ...datos } : s)) };
      }
      const id = `suc-${Date.now()}`;
      return {
        ...prev,
        sucursales: [...prev.sucursales, { id, ...datos }],
        numeracionNoElectronica: { ...prev.numeracionNoElectronica, [id]: numeracionInicial(prev.sucursales.length) },
      };
    });
    toast.success(editando?.id ? 'Sucursal actualizada' : 'Sucursal creada');
    setEditando(null);
  };

  return (
    <>
      <SidePanel
        variant="left" title="Sucursales" onClose={editando ? () => setEditando(null) : onClose}
        subtitle="Sucursales donde estás operando tus Comprobantes."
        footer={editando
          ? <FooterForm onCancel={() => setEditando(null)} onSave={guardar} />
          : <FooterLista onCancel={onClose} />}
      >
        {editando ? (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <FormRow label="Nombre" required error={errores.nombre}>
              <input className="merlin-input-filled" style={inputErr(errores.nombre)} value={form.nombre} onChange={e => set('nombre')(e.target.value)} />
            </FormRow>
            <FormRow label="Dirección" required error={errores.direccion}>
              <input className="merlin-input-filled" style={inputErr(errores.direccion)} placeholder="Dirección" value={form.direccion} onChange={e => set('direccion')(e.target.value)} />
            </FormRow>
            <FormRow label="Ciudad" required error={errores.ciudad}>
              <input className="merlin-input-filled" style={inputErr(errores.ciudad)} placeholder="Ciudad" value={form.ciudad} onChange={e => set('ciudad')(e.target.value)} />
            </FormRow>
            <FormRow label="Correo" error={errores.correo}>
              <input className="merlin-input-filled" style={inputErr(errores.correo)} type="email" placeholder="Correo de la sucursal" value={form.correo} onChange={e => set('correo')(e.target.value)} />
            </FormRow>
            <FormRow label="Siguiente Número de Cotización" required error={errores.siguienteCotizacion}>
              <input className="merlin-input-filled" style={inputErr(errores.siguienteCotizacion)} inputMode="numeric" value={form.siguienteCotizacion}
                onChange={e => set('siguienteCotizacion')(soloDigitos(e.target.value))} />
            </FormRow>
            <FormRow label="Tamaño de papel para impresión por defecto" required error={errores.papelDefecto}>
              <select className="merlin-input-filled" style={inputErr(errores.papelDefecto)} value={form.papelDefecto}
                onChange={e => set('papelDefecto')(e.target.value as PapelImpresion)}>
                <option value="" disabled>Selecciona...</option>
                {PAPELES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormRow>
          </div>
        ) : (
          <>
            <BotonNuevo onClick={() => abrir(null)} label="NUEVA" />
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Nombre</th><th style={th}>Dirección</th><th style={th}>Ciudad</th><th style={{ ...th, textAlign: 'right' }}>Acciones</th></tr></thead>
              <tbody>
                {ajustes.sucursales.map(s => (
                  <tr key={s.id}>
                    <td style={td}>{s.nombre}</td><td style={td}>{s.direccion}</td><td style={td}>{s.ciudad}</td>
                    <td style={{ ...td, textAlign: 'right' }}><AccionesFila soloEditar onEditar={() => abrir(s)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </SidePanel>
      {limite && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[var(--radius-20)] w-full max-w-sm mx-4 p-8 text-center">
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--coral-60)', color: 'var(--coral-100)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>!</div>
            <h3 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: 'var(--blue-100)', margin: '0 0 8px' }}>¡Contáctanos!</h3>
            <p style={{ fontFamily: FONT, fontSize: 14, color: 'var(--black-60)', margin: '0 0 24px' }}>
              Has llegado al límite de sucursales dentro de tu plan, ¿quieres crear más?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-cancel" onClick={() => setLimite(false)}>Cerrar</button>
              <button className="btn btn-primary" style={{ borderRadius: 999 }} onClick={() => { toast.info('Contacto comercial: próximamente'); setLimite(false); }}>
                HAZ CLICK AQUÍ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Numeración documentos no electrónicos ───────────────────────────────────

type CampoNumeracion = 'comprobante' | 'recibo' | 'gasto' | 'cotizacion' | 'facturaCompra';
const CAMPOS_NUMERACION: { key: CampoNumeracion; label: string }[] = [
  { key: 'comprobante', label: 'Siguiente Número de Comprobante' },
  { key: 'recibo', label: 'Siguiente Número de Recibo' },
  { key: 'gasto', label: 'Siguiente Número de Gasto' },
  { key: 'cotizacion', label: 'Siguiente Número de Cotización' },
  { key: 'facturaCompra', label: 'Siguiente Número de Factura de compra' },
];

export function NumeracionNoElectronicaPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const { facturas } = useFacturasCompra();
  const [sucursalId, setSucursalId] = useState('');
  const [valores, setValores] = useState<Record<CampoNumeracion, string>>({ comprobante: '', recibo: '', gasto: '', cotizacion: '', facturaCompra: '' });
  const [errores, setErrores] = useState<Partial<Record<CampoNumeracion, string>>>({});

  const principal = sucursalPrincipal(ajustes);
  // En la sucursal principal el consecutivo automático de facturas de compra sale del listado real.
  const autoFactura = (id: string) => (id === principal.id ? siguienteSecuencia(facturas) : 1);

  const elegir = (id: string) => {
    setSucursalId(id);
    const n = ajustes.numeracionNoElectronica[id];
    setValores({
      comprobante: String(n.comprobante), recibo: String(n.recibo), gasto: String(n.gasto), cotizacion: String(n.cotizacion),
      facturaCompra: String(n.facturaCompra ?? autoFactura(id)),
    });
    setErrores({});
  };

  const guardar = () => {
    const e: typeof errores = {};
    CAMPOS_NUMERACION.forEach(c => { if (!valores[c.key] || Number(valores[c.key]) < 1) e[c.key] = valores[c.key] ? 'Debe ser mayor a 0' : REQUERIDO; });
    setErrores(e);
    if (Object.keys(e).length) return;
    const actual = ajustes.numeracionNoElectronica[sucursalId];
    const factura = Number(valores.facturaCompra);
    updateAjustes(prev => ({
      ...prev,
      numeracionNoElectronica: {
        ...prev.numeracionNoElectronica,
        [sucursalId]: {
          comprobante: Number(valores.comprobante), recibo: Number(valores.recibo), gasto: Number(valores.gasto),
          cotizacion: Number(valores.cotizacion),
          // Si no se tocó el automático, sigue siendo automático.
          facturaCompra: actual.facturaCompra === null && factura === autoFactura(sucursalId) ? null : factura,
        },
      },
    }));
    toast.success('Numeración actualizada');
    onClose();
  };

  return (
    <SidePanel
      variant="left" title="Numeración documentos no electrónicos" onClose={onClose}
      subtitle="Ingresa los números con el cual vas a crear tus documentos de Ingresos/Gastos."
      footer={<FooterForm onCancel={onClose} onSave={guardar} canSave={!!sucursalId} />}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <FormRow label="Sucursal" required>
          <select className="merlin-input-filled" value={sucursalId} onChange={e => elegir(e.target.value)}>
            <option value="" disabled>Selecciona...</option>
            {ajustes.sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </FormRow>
        {sucursalId && CAMPOS_NUMERACION.map(c => (
          <FormRow key={c.key} label={c.label} required error={errores[c.key]}
            helper={c.key === 'facturaCompra' && sucursalId === principal.id ? 'Es el consecutivo con el que se crea la próxima factura de compra.' : undefined}>
            <input className="merlin-input-filled" style={inputErr(errores[c.key])} inputMode="numeric" value={valores[c.key]}
              onChange={e => setValores(v => ({ ...v, [c.key]: soloDigitos(e.target.value) }))} />
          </FormRow>
        ))}
      </div>
    </SidePanel>
  );
}
