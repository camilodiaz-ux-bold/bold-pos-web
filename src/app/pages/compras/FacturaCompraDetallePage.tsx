/**
 * FacturaCompraDetallePage — detalle de una factura de compra (specs/2026-10-facturas-compra.md §7).
 * Una sola pantalla: banner de pago, "Detalle del pago" y "Detalle de anulación" aparecen según la factura.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { AlertTriangle, ArrowLeft, Ban, Copy, Download, FileCheck, Mail, Printer } from 'lucide-react';
import { useContactos } from '../../store/contactosStore';
import { useFacturasCompra } from '../../store/facturasCompraStore';
import { TURNO_ACTUAL } from '../../data/facturasCompraSeed';
import {
  BADGE_ESTADO, FECHA_PROTOTIPO, calcularTotales, diffDias, estadoFactura, fmtFecha, fmtFechaHoraCompra, fmtMonto, totalLinea,
} from '../../utils/facturasCompra';
import { VentaBadge } from '../../components/ventas/VentaBadge';
import { sectionCard, tdStyle, thStyle } from '../../components/ventas/ventasStyles';
import { AnularModal, ConvertirDSModal, InfoModal, ReportarPagoModal } from '../../components/compras/FacturaCompraModals';
import { PrototypeComprasTools } from '../../components/compras/PrototypeComprasTools';

const FONT = "'Montserrat', sans-serif";
const right: React.CSSProperties = { textAlign: 'right', paddingRight: 16 };

const linkStyle: React.CSSProperties = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: 700,
  color: 'var(--blue-100)', textDecoration: 'underline', textAlign: 'right',
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--black-10)' }}>
      <span style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-60)' }}>{label}</span>
      <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: 'var(--black-100)', textAlign: 'right' }}>{children}</span>
    </div>
  );
}

function ActionButton({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 16px', borderRadius: 100, cursor: 'pointer',
        border: `1.5px solid ${danger ? 'var(--coral-100)' : 'var(--blue-100)'}`, backgroundColor: 'var(--black-0)',
        color: danger ? 'var(--coral-100)' : 'var(--blue-100)', fontFamily: FONT, fontSize: 13, fontWeight: 600,
      }}
      className="hover:bg-[var(--blue-10)] transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

type Modal = 'pago' | 'anular' | 'ds' | 'turno' | 'dsInfo' | null;

export function FacturaCompraDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { contactos } = useContactos();
  const { getFactura, settings } = useFacturasCompra();
  const [modal, setModal] = useState<Modal>(null);
  const f = id ? getFactura(id) : undefined;

  useEffect(() => {
    if (!f) {
      toast.error('No encontramos esa factura de compra');
      navigate('/facturas-compra', { replace: true });
    }
  }, [f, navigate]);
  if (!f) return null;

  const { usarImpuestos, usarDS } = settings;
  const estado = estadoFactura(f);
  const proveedor = contactos.find(c => c.id === f.proveedorId);
  const t = calcularTotales(f.items, f.retenciones);
  const totalMostrado = usarImpuestos ? t.total : t.totalSinImpuestos;
  const anulada = estado === 'Anulada';
  const pendiente = estado === 'No pagado' || estado === 'Vencido';
  const soon = (nombre: string) => () => toast.info(`${nombre}: próximamente`);
  const turnoDelPago = f.pago ? f.pago.turno : null;
  const turnoMostrado = f.pago?.turno ?? f.turno ?? TURNO_ACTUAL;

  const sumRow = (label: string, value: string, strong?: boolean) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: strong ? '10px 0 0' : '5px 0', marginTop: strong ? 6 : 0,
      borderTop: strong ? '1px solid var(--black-10)' : 'none', fontFamily: FONT, fontSize: strong ? 15 : 13,
      fontWeight: strong ? 700 : 400, color: strong ? 'var(--blue-100)' : 'var(--black-100)',
    }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );

  const turnoLink = (turno: string | null) => turno
    ? <button style={linkStyle} onClick={() => setModal('turno')}>{turno}</button>
    : '---';

  return (
    <div style={{
      flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto',
      padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
    }}>

      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/facturas-compra')}
          aria-label="Volver a facturas de compra"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8,
            border: '1px solid var(--blue-20)', backgroundColor: 'var(--black-0)', cursor: 'pointer', flexShrink: 0,
          }}
          className="hover:bg-[var(--blue-10)] transition-colors"
        >
          <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
        </button>
        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0 }}>
          Factura de compra No. {f.numero}
        </p>
        <VentaBadge label={estado === 'Vencido' ? 'Vencida' : estado} variant={BADGE_ESTADO[estado]} />
      </div>

      {/* ── Acciones ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <ActionButton icon={<Download size={16} />} label="Descargar" onClick={soon('Descargar')} />
        <ActionButton icon={<Printer size={16} />} label="Imprimir" onClick={soon('Imprimir')} />
        <ActionButton icon={<Mail size={16} />} label="Enviar por correo" onClick={soon('Enviar por correo')} />
        <ActionButton icon={<Copy size={16} />} label="Duplicar" onClick={soon('Duplicar')} />
        {usarDS && !f.ds && !anulada && (
          <ActionButton icon={<FileCheck size={16} />} label="Convertir en Documento Soporte" onClick={() => setModal('ds')} />
        )}
        {!anulada && <ActionButton icon={<Ban size={16} />} label="Anular" onClick={() => setModal('anular')} danger />}
      </div>

      {/* ── Banner de pago ── */}
      {pendiente && f.fechaVencimiento && (() => {
        const vencida = estado === 'Vencido';
        const dias = vencida ? diffDias(f.fechaVencimiento, FECHA_PROTOTIPO) : diffDias(FECHA_PROTOTIPO, f.fechaVencimiento);
        return (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 20px', borderRadius: 12,
            backgroundColor: vencida ? 'var(--feedback-error-10)' : 'var(--blue-10)',
            border: `1px solid ${vencida ? 'var(--feedback-error-100)' : 'var(--blue-20)'}`,
          }}>
            <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: vencida ? 'var(--feedback-error-150)' : 'var(--blue-100)' }}>
              {vencida
                ? `Vencido desde ${fmtFecha(f.fechaVencimiento)} (hace ${dias} ${dias === 1 ? 'día' : 'días'})`
                : `Fecha de pago: ${fmtFecha(f.fechaVencimiento)} (${dias === 0 ? 'vence hoy' : `faltan ${dias} ${dias === 1 ? 'día' : 'días'}`})`}
            </span>
            <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => setModal('pago')}>Reportar el pago</button>
          </div>
        );
      })()}

      {/* ── Datos ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div style={sectionCard}>
          <Row label="Sucursal">{f.sucursal}</Row>
          <Row label="No. factura del proveedor">{f.numeroProveedor || '---'}</Row>
          <Row label="Proveedor">
            {proveedor
              ? <button style={linkStyle} onClick={() => navigate(`/proveedores/${proveedor.id}/editar`)}>{proveedor.nombre}</button>
              : '---'}
          </Row>
          <Row label="Fecha de emisión">{fmtFecha(f.fechaEmision)}</Row>
        </div>
        <div style={sectionCard}>
          <Row label="Fecha de registro">{fmtFechaHoraCompra(f.fechaRegistro)}</Row>
          <Row label="Forma de pago">{f.formaPago}</Row>
          {f.formaPago === 'Contado' && <Row label="Método de pago">{f.metodoPago ?? '---'}</Row>}
          {!f.pago && <Row label="Turno asociado">{turnoLink(f.turno)}</Row>}
          <Row label="Afectar inventario">{f.afectaInventario ? 'Sí' : 'No'}</Row>
          {usarDS && (
            <Row label="Documento soporte">
              {f.ds ? <button style={linkStyle} onClick={() => setModal('dsInfo')}>{f.ds.numero}</button> : '---'}
            </Row>
          )}
        </div>
      </div>

      {/* ── Detalle del pago (crédito pagado) ── */}
      {f.pago && !anulada && (
        <div style={{ ...sectionCard, backgroundColor: 'var(--feedback-success-10)' }}>
          <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: 'var(--blue-100)', margin: '0 0 8px' }}>Detalle del pago</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <Row label="Fecha de vencimiento original">{f.fechaVencimiento ? fmtFecha(f.fechaVencimiento) : '---'}</Row>
              <Row label="Pagado el">{fmtFechaHoraCompra(f.pago.fecha)}</Row>
              <Row label="Turno asociado">{turnoLink(turnoDelPago)}</Row>
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <Row label="Reportado por">{f.pago.reportadoPor}</Row>
              <p style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-60)', margin: '10px 0 6px' }}>Observación del pago</p>
              <p style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-100)', backgroundColor: 'var(--black-0)', borderRadius: 6, padding: '10px 12px', margin: 0, lineHeight: '20px' }}>
                {f.pago.observacion || 'Sin observaciones registradas.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Detalle de anulación ── */}
      {f.anulacion && (
        <div style={{ ...sectionCard, maxWidth: 'calc(50% - 8px)', minWidth: 320 }}>
          <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: 'var(--blue-100)', margin: '0 0 8px' }}>Detalle de anulación</p>
          <Row label="Anulada por">{f.anulacion.por}</Row>
          <Row label="Anulada el">{fmtFechaHoraCompra(f.anulacion.fecha)}</Row>
          <p style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-60)', margin: '10px 0 6px' }}>Observación de anulación</p>
          <p style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-100)', backgroundColor: 'var(--blue-10)', borderRadius: 6, padding: '10px 12px', margin: 0, lineHeight: '20px' }}>
            {f.anulacion.observacion || 'Sin observaciones registradas.'}
          </p>
        </div>
      )}

      {/* ── Ítems ── */}
      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: 'var(--blue-100)', margin: '8px 0 -4px' }}>Ítems para tu factura</p>
      <div style={{ backgroundColor: 'var(--black-0)', borderRadius: 16, padding: '12px 20px 8px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Ítem</th>
                <th style={{ ...thStyle, width: 90 }}>Cantidad</th>
                <th style={{ ...thStyle, width: 130, ...right }}>Precio</th>
                {usarImpuestos && <th style={{ ...thStyle, width: 140 }}>Impuesto</th>}
                <th style={{ ...thStyle, width: 130, ...right }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {f.items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: idx === f.items.length - 1 ? 'none' : '1px solid var(--black-10)' }}>
                  <td style={{ ...tdStyle, paddingRight: 16 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {it.nombre} - {it.codigo}
                      {!it.inventariable && (
                        <span title="Este producto no está configurado como inventariable" style={{ display: 'inline-flex' }}>
                          <AlertTriangle size={14} color="var(--black-40)" />
                        </span>
                      )}
                    </span>
                  </td>
                  <td style={tdStyle}>{it.cantidad}</td>
                  <td style={{ ...tdStyle, ...right }}>{fmtMonto(it.precio)}</td>
                  {usarImpuestos && <td style={tdStyle}>{it.impuesto}</td>}
                  <td style={{ ...tdStyle, ...right }}>{fmtMonto(totalLinea(it))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: 'var(--black-60)', margin: 0, textAlign: 'right' }}>Total items {f.items.length}</p>

      {/* ── Observaciones y resumen ── */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--black-100)', margin: '0 0 6px' }}>Observaciones de la factura</p>
          <p style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-100)', backgroundColor: 'var(--black-0)', borderRadius: 8, padding: '10px 12px', margin: 0, lineHeight: '20px', minHeight: 60 }}>
            {f.observaciones || 'Sin observaciones registradas.'}
          </p>
        </div>
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ ...sectionCard, padding: '16px 20px' }}>
            {sumRow('Subtotal', fmtMonto(t.subtotal))}
            {usarImpuestos && sumRow('Impuestos', fmtMonto(t.impuestos))}
            {usarImpuestos && sumRow('Retenciones', `- ${fmtMonto(t.retenciones)}`)}
            {sumRow('Total', fmtMonto(totalMostrado), true)}
          </div>
        </div>
      </div>

      <PrototypeComprasTools show={['usarImpuestos', 'usarDS']} />

      {modal === 'pago' && <ReportarPagoModal factura={f} onClose={() => setModal(null)} />}
      {modal === 'anular' && <AnularModal factura={f} onClose={() => setModal(null)} />}
      {modal === 'ds' && <ConvertirDSModal factura={f} onClose={() => setModal(null)} />}
      {modal === 'turno' && <InfoModal title={`Turno No. ${turnoMostrado}`} destino={`del turno ${turnoMostrado}`} onClose={() => setModal(null)} />}
      {modal === 'dsInfo' && f.ds && <InfoModal title={`Documento Soporte ${f.ds.numero}`} destino="del Documento Soporte" onClose={() => setModal(null)} />}
    </div>
  );
}
