/**
 * ContactoFormPage — Nuevo contacto / Editar contacto para clientes y proveedores (specs/2026-10-proveedores.md §6 y 2026-10-clientes.md).
 * Una sola página para ambos modos; el modo se deriva de si la ruta trae :id.
 * Estado y validación con useState, sin librerías de formularios (como ItemFormPage).
 */
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useContactos } from '../../store/contactosStore';
import type { FacturaCompraDemo, Contacto, ContactoDraft, TipoDocumento, TipoPersona } from '../../types/contacto';
import {
  CIUDAD_OPCIONES, DESCUENTO_OPCIONES, FACTURAS_COMPRA_DEMO, PAIS_OPCIONES, REGIMEN_FISCAL_OPCIONES,
  RESPONSABILIDAD_FISCAL_OPCIONES, TIPO_DOCUMENTO_OPCIONES, TIPO_PERSONA_OPCIONES, VENDEDOR_OPCIONES,
} from '../../data/contactosSeed';
import { EMAIL_RE, calcularDV, soloDigitos } from '../../utils/contactos';
import { formatCOP } from '../../utils/format';
import { FieldLabel, SelectField, TextAreaField, TextField } from '../../components/items/FormField';
import { Toggle } from '../../components/items/Toggle';
import { VentaBadge } from '../../components/ventas/VentaBadge';
import { sectionCard, sectionTitle, tdStyle, thStyle } from '../../components/ventas/ventasStyles';
import type { BadgeVariant } from '../../utils/ventas';
import { CONTACTO_CONFIG, type TipoContacto } from './contactosConfig';

const emptyDraft = (tipo: TipoContacto): ContactoDraft => ({
  nombre: '', esCliente: tipo === 'cliente', esProveedor: tipo === 'proveedor', activo: true,
  correo: '', celular: '', telefono1: '', telefono2: '', observaciones: '',
  tipoPersona: '', tipoDocumento: '', numeroDocumento: '',
  responsabilidadFiscal: '', regimenFiscal: '', vendedor: '', descuento: '',
  pais: 'Colombia', ciudad: '', direccion: '',
});

function toDraft(p: Contacto): ContactoDraft {
  const { id, comprasUltimos6Meses, cuentasPorPagar, ...draft } = p;
  void id; void comprasUltimos6Meses; void cuentasPorPagar;
  return draft;
}

type Errors = Partial<Record<'nombre' | 'tipoContacto' | 'correo' | 'tipoPersona' | 'tipoDocumento' | 'numeroDocumento', string>>;

const grid = (columns: string): React.CSSProperties => ({
  display: 'grid', gridTemplateColumns: columns, gap: 16, marginBottom: 16,
});

const ESTADO_BADGE: Record<FacturaCompraDemo['estado'], BadgeVariant> = {
  Pagado: 'success', 'No pagado': 'warning', Vencido: 'error', Anulada: 'info',
};

type TabId = 'comprobantes' | 'ventas' | 'actividad' | 'compras';

const right: React.CSSProperties = { textAlign: 'right', paddingRight: 16 };

export function ContactoFormPage({ tipo }: { tipo: TipoContacto }) {
  const navigate = useNavigate();
  const cfg = CONTACTO_CONFIG[tipo];
  const { id } = useParams<{ id?: string }>();
  const { getContacto, createContacto, updateContacto } = useContactos();
  const editing = id ? getContacto(id) : undefined;
  const isEdit = !!id;

  const [form, setForm] = useState<ContactoDraft>(() => (editing ? toDraft(editing) : emptyDraft(tipo)));
  const [errors, setErrors] = useState<Errors>({});
  const [tab, setTab] = useState<TabId>('comprobantes');

  // Un :id inexistente vuelve a la lista (specs §6).
  React.useEffect(() => {
    if (isEdit && !editing) {
      toast.error(`No encontramos ese ${tipo}`);
      navigate(cfg.base, { replace: true });
    }
  }, [isEdit, editing, navigate, cfg.base, tipo]);

  const set = <K extends keyof ContactoDraft>(key: K) => (value: ContactoDraft[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined, ...(key === 'esCliente' || key === 'esProveedor' ? { tipoContacto: undefined } : {}) }));
  };

  const dv = useMemo(
    () => (form.tipoDocumento === 'nit' ? calcularDV(form.numeroDocumento) : ''),
    [form.tipoDocumento, form.numeroDocumento],
  );

  const validate = (): Errors => {
    const e: Errors = {};
    const req = 'Campo obligatorio';
    if (!form.nombre.trim()) e.nombre = req;
    if (!form.esCliente && !form.esProveedor) e.tipoContacto = 'Selecciona al menos un tipo de contacto';
    if (!form.correo.trim()) e.correo = req;
    else if (!EMAIL_RE.test(form.correo.trim())) e.correo = 'Ingresa un correo válido';
    if (!form.tipoPersona) e.tipoPersona = req;
    if (!form.tipoDocumento) e.tipoDocumento = req;
    if (!soloDigitos(form.numeroDocumento)) e.numeroDocumento = req;
    return e;
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('Revisa los campos marcados');
      return;
    }
    const draft: ContactoDraft = {
      ...form,
      nombre: form.nombre.trim(),
      correo: form.correo.trim(),
      numeroDocumento: soloDigitos(form.numeroDocumento),
    };
    if (isEdit && id) {
      updateContacto(id, draft);
      toast.success('Contacto actualizado');
    } else {
      createContacto(draft);
      toast.success('Contacto creado');
    }
    navigate(cfg.base);
  };

  const facturas = (id && FACTURAS_COMPRA_DEMO[id]) || [];

  const checkbox = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 500, color: 'var(--black-100)',
    }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ width: 16, height: 16, accentColor: 'var(--blue-100)' }} />
      {label}
    </label>
  );

  const card = (title: string, children: React.ReactNode) => (
    <div style={sectionCard}>
      <p style={sectionTitle}>{title}</p>
      {children}
    </div>
  );

  const emptyTable = (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>{['Código', 'Fecha de emisión', 'Saldo', 'Total', 'Estado'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
      </thead>
      <tbody>
        <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--black-60)', padding: '24px 0' }}>
          No se encontraron registros
        </td></tr>
      </tbody>
    </table>
  );

  return (
    <div style={{
      flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto',
      padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
    }}>

      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(cfg.base)}
          aria-label={`Volver a ${cfg.titulo.toLowerCase()}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8,
            border: '1px solid var(--blue-20)', backgroundColor: 'var(--black-0)',
            cursor: 'pointer', flexShrink: 0,
          }}
          className="hover:bg-[var(--blue-10)] transition-colors"
        >
          <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
        </button>
        <p style={{
          fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 20,
          lineHeight: '28px', color: 'var(--black-100)', margin: 0, flex: 1,
        }}>
          {isEdit ? 'Editar contacto' : 'Nuevo contacto'}
        </p>
        <button
          onClick={() => navigate(cfg.base)}
          style={{
            height: 40, padding: '8px 16px', borderRadius: 12, cursor: 'pointer',
            border: '1.5px solid var(--blue-100)', backgroundColor: 'var(--black-0)', color: 'var(--blue-100)',
            fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700,
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          style={{
            height: 40, padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            backgroundColor: 'var(--blue-100)', color: 'var(--black-0)',
            fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700,
          }}
        >
          {isEdit ? 'Actualizar contacto' : 'Crear contacto'}
        </button>
      </div>

      {/* ── 1. Nombre y tipo de contacto ── */}
      {card('1. Nombre y tipo de contacto', (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 280 }}>
            <TextField label="Nombre y apellidos / Razón social" required value={form.nombre}
              onChange={set('nombre')} placeholder="Ingresa el nombre" error={errors.nombre} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <FieldLabel required>Tipo de contacto</FieldLabel>
            <div style={{ display: 'flex', gap: 20, padding: '10px 0' }}>
              {checkbox('Cliente', form.esCliente, set('esCliente'))}
              {checkbox('Proveedor', form.esProveedor, set('esProveedor'))}
            </div>
            {errors.tipoContacto && (
              <p style={{ fontSize: 12, color: 'var(--coral-100)', margin: '0' }}>{errors.tipoContacto}</p>
            )}
          </div>
          {isEdit && (
            <div>
              <FieldLabel>Activo</FieldLabel>
              <div style={{ padding: '8px 0' }}>
                <Toggle checked={form.activo} onChange={set('activo')} ariaLabel="Activo" />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* ── 2. Datos básicos ── */}
      {card('2. Datos básicos', (
        <>
          <div style={grid('1fr 1fr')}>
            <TextField label="Correo electrónico" required value={form.correo} onChange={set('correo')}
              placeholder="Ejemplo: nombre@gmail.com" error={errors.correo} />
            <TextField label="Número de celular" value={form.celular} onChange={set('celular')}
              placeholder="Ejemplo: 3123456789" />
          </div>
          <div style={grid('1fr 1fr')}>
            <TextField label="Teléfono 1" value={form.telefono1} onChange={set('telefono1')} placeholder="#" />
            <TextField label="Teléfono 2" value={form.telefono2} onChange={set('telefono2')} placeholder="#" />
          </div>
          <TextAreaField label="Observaciones" value={form.observaciones} onChange={set('observaciones')}
            placeholder="Agrega notas u observaciones adicionales." />
        </>
      ))}

      {/* ── 3. Datos fiscales y comerciales ── */}
      {card('3. Datos fiscales y comerciales', (
        <>
          <div style={grid('1fr 1fr')}>
            <SelectField label="Tipo de persona" required value={form.tipoPersona}
              onChange={v => set('tipoPersona')(v as TipoPersona)} options={TIPO_PERSONA_OPCIONES}
              placeholder="Buscar..." error={errors.tipoPersona} />
            <SelectField label="Tipo de documento" required value={form.tipoDocumento}
              onChange={v => set('tipoDocumento')(v as TipoDocumento)} options={TIPO_DOCUMENTO_OPCIONES}
              placeholder="Buscar..." error={errors.tipoDocumento} />
          </div>
          <div style={grid('2fr 1fr 2fr')}>
            <TextField label="Número de documento / NIT" required value={form.numeroDocumento}
              onChange={set('numeroDocumento')} placeholder="Ingresa el número de identificación"
              error={errors.numeroDocumento} />
            <TextField label="DV" value={dv} onChange={() => undefined} disabled />
            <SelectField label="Responsabilidad fiscal" value={form.responsabilidadFiscal}
              onChange={set('responsabilidadFiscal')} options={RESPONSABILIDAD_FISCAL_OPCIONES}
              placeholder="Buscar..." clearable />
          </div>
          <div style={grid('1fr 1fr')}>
            <SelectField label="Régimen fiscal" value={form.regimenFiscal} onChange={set('regimenFiscal')}
              options={REGIMEN_FISCAL_OPCIONES} placeholder="Buscar..." clearable />
            <SelectField label="Vendedor" value={form.vendedor} onChange={set('vendedor')}
              options={VENDEDOR_OPCIONES} placeholder="Buscar..." clearable />
          </div>
          <div style={grid('1fr 1fr')}>
            <SelectField label="Descuento" value={form.descuento} onChange={set('descuento')}
              options={DESCUENTO_OPCIONES} placeholder="Buscar..." clearable />
          </div>
        </>
      ))}

      {/* ── 4. Datos de ubicación ── */}
      {card('4. Datos de ubicación', (
        <>
          <div style={grid('1fr 1fr')}>
            <SelectField label="País" value={form.pais} onChange={set('pais')} options={PAIS_OPCIONES} />
            <SelectField label="Departamento / Ciudad" value={form.ciudad} onChange={set('ciudad')}
              options={CIUDAD_OPCIONES} placeholder="Buscar..." clearable />
          </div>
          <TextAreaField label="Dirección" value={form.direccion} onChange={set('direccion')}
            placeholder="Ingresa la dirección" />
        </>
      ))}

      {/* ── Pestañas del perfil (solo edición) ── */}
      {isEdit && (
        <>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }} role="tablist">
            {cfg.tabs.map(t => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  style={{
                    height: 36, padding: '0 20px', borderRadius: 100, cursor: 'pointer',
                    border: '1.5px solid var(--blue-100)',
                    backgroundColor: active ? 'var(--blue-100)' : 'var(--black-0)',
                    color: active ? 'var(--black-0)' : 'var(--blue-100)',
                    fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 600,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div style={{ ...sectionCard, padding: '20px 20px 4px' }}>
            {tab !== 'compras' && emptyTable}
            {tab === 'compras' && (
              <>
                <p style={{ fontSize: 12, color: 'var(--black-60)', margin: '0 0 8px', fontFamily: "'Montserrat', sans-serif" }}>
                  Datos de ejemplo: el módulo de facturas de compra aún no está migrado.
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {[
                        { l: 'No. factura' }, { l: 'Inventario' }, { l: 'Ítems' }, { l: 'Valor total', r: true },
                        { l: 'Forma de pago' }, { l: 'Fecha de vencimiento' }, { l: 'Estado de pago' },
                      ].map(c => <th key={c.l} style={{ ...thStyle, ...(c.r ? right : {}) }}>{c.l}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {facturas.length === 0 && (
                      <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--black-60)', padding: '24px 0' }}>
                        No se encontraron registros
                      </td></tr>
                    )}
                    {facturas.map((f, idx) => (
                      <tr key={f.numero} style={{ borderBottom: idx === facturas.length - 1 ? 'none' : '1px solid var(--black-10)' }}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{f.numero}</td>
                        <td style={tdStyle}>{f.inventario ? 'Sí' : 'No'}</td>
                        <td style={tdStyle}>{f.items}</td>
                        <td style={{ ...tdStyle, ...right }}>{formatCOP(f.total)}</td>
                        <td style={tdStyle}>{f.formaPago}</td>
                        <td style={tdStyle}>{f.vencimiento ?? '---'}</td>
                        <td style={tdStyle}><VentaBadge label={f.estado} variant={ESTADO_BADGE[f.estado]} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
