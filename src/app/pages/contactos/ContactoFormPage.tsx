/**
 * ContactoFormPage — Nuevo contacto / Editar contacto para clientes y proveedores
 * (specs/2026-10-proveedores.md §6 y 2026-10-clientes.md).
 * Una sola página para ambos modos; el modo se deriva de si la ruta trae :id.
 * Estado y validación con useState, sin librerías de formularios (como ItemFormPage).
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useContactos } from '../../store/contactosStore';
import { useFacturasCompra } from '../../store/facturasCompraStore';
import type { Contacto, ContactoDraft } from '../../types/contacto';
import { emptyContactoDraft, normalizarContacto, validarContacto, type ContactoErrors } from '../../utils/contactos';
import { BADGE_ESTADO, estadoFactura, fmtFecha, fmtMonto, ordenarFacturas, valorFactura } from '../../utils/facturasCompra';
import { ContactoFormFields } from '../../components/contactos/ContactoFormFields';
import { VentaBadge } from '../../components/ventas/VentaBadge';
import { sectionCard, tdStyle, thStyle } from '../../components/ventas/ventasStyles';
import { CONTACTO_CONFIG, type TipoContacto } from './contactosConfig';

function toDraft(p: Contacto): ContactoDraft {
  const { id, ...draft } = p;
  void id;
  return draft;
}

type TabId = 'comprobantes' | 'ventas' | 'actividad' | 'compras';

const right: React.CSSProperties = { textAlign: 'right', paddingRight: 16 };

export function ContactoFormPage({ tipo }: { tipo: TipoContacto }) {
  const navigate = useNavigate();
  const cfg = CONTACTO_CONFIG[tipo];
  const { id } = useParams<{ id?: string }>();
  const { getContacto, createContacto, updateContacto } = useContactos();
  const { facturas, settings } = useFacturasCompra();
  const editing = id ? getContacto(id) : undefined;
  const isEdit = !!id;

  const [form, setForm] = useState<ContactoDraft>(() => (editing ? toDraft(editing) : emptyContactoDraft(tipo)));
  const [errors, setErrors] = useState<ContactoErrors>({});
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

  const handleSave = () => {
    const e = validarContacto(form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('Revisa los campos marcados');
      return;
    }
    const draft = normalizarContacto(form);
    if (isEdit && id) {
      updateContacto(id, draft);
      toast.success('Contacto actualizado');
    } else {
      createContacto(draft);
      toast.success('Contacto creado');
    }
    navigate(cfg.base);
  };

  const facturasProveedor = id ? ordenarFacturas(facturas.filter(f => f.proveedorId === id), 'creacion') : [];

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

      <ContactoFormFields form={form} set={set} errors={errors} showActivo={isEdit} />

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
                  {facturasProveedor.length === 0 && (
                    <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--black-60)', padding: '24px 0' }}>
                      No se encontraron registros
                    </td></tr>
                  )}
                  {facturasProveedor.map((f, idx) => {
                    const estado = estadoFactura(f);
                    return (
                      <tr
                        key={f.id}
                        onClick={() => navigate(`/facturas-compra/${f.id}`)}
                        style={{ borderBottom: idx === facturasProveedor.length - 1 ? 'none' : '1px solid var(--black-10)', cursor: 'pointer' }}
                        className="hover:bg-[var(--blue-10)] transition-colors"
                      >
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{f.numero}</td>
                        <td style={tdStyle}>{f.afectaInventario ? 'Sí' : 'No'}</td>
                        <td style={tdStyle}>{f.items.length}</td>
                        <td style={{ ...tdStyle, ...right }}>{fmtMonto(valorFactura(f, settings.usarImpuestos))}</td>
                        <td style={tdStyle}>{f.formaPago}</td>
                        <td style={tdStyle}>{f.fechaVencimiento ? fmtFecha(f.fechaVencimiento) : '---'}</td>
                        <td style={tdStyle}><VentaBadge label={estado} variant={BADGE_ESTADO[estado]} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
