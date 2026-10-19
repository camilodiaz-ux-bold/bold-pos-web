/**
 * FacturaCompraFormPage — Nueva factura de compra (specs/2026-10-facturas-compra.md §6).
 * Estado y validación con useState, sin librerías de formularios (como ItemFormPage).
 * El cálculo bidireccional Cantidad × Precio ↔ Total ocurre dentro de los handlers, nunca
 * en un useEffect que observe ambos campos (evita un bucle de escritura mutua).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { AlertTriangle, ArrowLeft, Info, Plus, Trash2 } from 'lucide-react';
import { useContactos } from '../../store/contactosStore';
import { useFacturasCompra } from '../../store/facturasCompraStore';
import { useItems } from '../../store/itemsStore';
import type { ImpuestoCompra, ItemFacturaCompra } from '../../types/facturaCompra';
import { IMPUESTOS_COMPRA, METODOS_PAGO, RETENCIONES_OPCIONES, SUCURSAL_ACTUAL, TURNO_ACTUAL } from '../../data/facturasCompraSeed';
import { FECHA_PROTOTIPO, calcularTotales, fmtMonto, tasaImpuesto } from '../../utils/facturasCompra';
import { fmtDocumento } from '../../utils/contactos';
import { FieldLabel, SelectField, TextAreaField, TextField } from '../../components/items/FormField';
import { sectionCard, tdStyle, thStyle } from '../../components/ventas/ventasStyles';
import { Combobox } from '../../components/compras/Combobox';
import { CenterModal, ModalIcon } from '../../components/compras/CenterModal';
import { SiNo } from '../../components/compras/FacturaCompraModals';
import { CrearItemDrawer } from '../../components/compras/CrearItemDrawer';
import { CrearProveedorDrawer } from '../../components/compras/CrearProveedorDrawer';
import { PrototypeComprasTools } from '../../components/compras/PrototypeComprasTools';

const FONT = "'Montserrat', sans-serif";
const right: React.CSSProperties = { textAlign: 'right', paddingRight: 16 };

interface Linea {
  key: string;
  itemId: string;
  cantidad: number;
  precio: number;
  impuesto: ImpuestoCompra;
  total: number;
}

let lineaSeq = 0;
/** Fila nueva: Cantidad 1, Precio aleatorio entre $ 10.000 y $ 500.000, Exento (specs §6.3). */
function nuevaLinea(): Linea {
  const precio = Math.floor(Math.random() * (500000 - 10000 + 1)) + 10000;
  return { key: `l${++lineaSeq}`, itemId: '', cantidad: 1, precio, impuesto: 'Exento', total: precio };
}

/** Input numérico con miles `es-CO`: guarda un número, muestra '' si es 0. */
function NumInput({ value, onChange, ariaLabel, minWidth }: { value: number; onChange: (n: number) => void; ariaLabel: string; minWidth?: number }) {
  return (
    <input
      inputMode="numeric"
      aria-label={ariaLabel}
      className="merlin-input-filled"
      style={{ minWidth, textAlign: 'right' }}
      placeholder="0"
      value={value ? value.toLocaleString('es-CO') : ''}
      onChange={e => onChange(parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)}
    />
  );
}

type Errors = Partial<Record<'proveedor' | 'fechaEmision' | 'metodoPago' | 'fechaVencimiento' | 'items', string>>;

export function FacturaCompraFormPage() {
  const navigate = useNavigate();
  const { contactos } = useContactos();
  const { items: catalogo } = useItems();
  const { createFactura, settings } = useFacturasCompra();
  const { usarImpuestos, stepMode } = settings;

  const [step, setStep] = useState<1 | 3>(stepMode ? 1 : 3);
  const [numeroProveedor, setNumeroProveedor] = useState('');
  const [fechaEmision, setFechaEmision] = useState(FECHA_PROTOTIPO);
  const [proveedorId, setProveedorId] = useState('');
  const [afectaInventario, setAfectaInventario] = useState(true);
  const [formaPago, setFormaPago] = useState<'Crédito' | 'Contado'>('Crédito');
  const [metodoPago, setMetodoPago] = useState('');
  const [asociarTurno, setAsociarTurno] = useState(true);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [lineas, setLineas] = useState<Linea[]>(() => [nuevaLinea()]);
  const [retencionPct, setRetencionPct] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [modal, setModal] = useState<'salir' | 'guardar' | 'crearProveedor' | null>(null);
  const [drawerItem, setDrawerItem] = useState<string | null>(null); // key de la fila que abrió "Crear ítem"
  const [pulse, setPulse] = useState<'strong' | 'subtle' | null>('strong');
  const lineasRef = useRef(lineas);
  lineasRef.current = lineas;

  // Animación del botón "Agregar ítem": pulso fuerte al cargar, luego uno sutil cada 6 s.
  useEffect(() => {
    const off = setTimeout(() => setPulse(null), 1700);
    const every = setInterval(() => { setPulse('subtle'); setTimeout(() => setPulse(null), 900); }, 6000);
    return () => { clearTimeout(off); clearInterval(every); };
  }, []);

  const proveedores = useMemo(
    () => contactos.filter(c => c.esProveedor && c.activo).map(c => ({ id: c.id, label: `${c.nombre} - ${fmtDocumento(c.numeroDocumento)}` })),
    [contactos],
  );
  const itemsDisponibles = useMemo(() => catalogo.filter(i => i.activo && !i.esCombo), [catalogo]);
  const itemOptions = useMemo(() => itemsDisponibles.map(i => ({ id: i.id, label: `${i.nombre} - ${i.codigo}` })), [itemsDisponibles]);

  // ─── Cálculos ──────────────────────────────────────────────────────────────

  const subtotal = lineas.reduce((s, l) => s + l.total, 0);
  const impuestos = Math.round(lineas.reduce((s, l) => s + l.total * tasaImpuesto(l.impuesto), 0));
  const retenciones = usarImpuestos ? Math.round(subtotal * retencionPct / 100) : 0;
  const total = subtotal + (usarImpuestos ? impuestos - retenciones : 0);

  const updateLinea = (key: string, patch: Partial<Linea>) =>
    setLineas(prev => prev.map(l => (l.key === key ? { ...l, ...patch } : l)));

  const setCantidad = (l: Linea, cantidad: number) => updateLinea(l.key, { cantidad, total: cantidad * l.precio });
  const setPrecio = (l: Linea, precio: number) => updateLinea(l.key, { precio, total: l.cantidad * precio });
  const setTotal = (l: Linea, nuevoTotal: number) =>
    updateLinea(l.key, { total: nuevoTotal, ...(l.cantidad > 0 ? { precio: Math.round(nuevoTotal / l.cantidad) } : {}) });

  // ─── Validación y guardado ─────────────────────────────────────────────────

  const validar = (conItems: boolean): Errors => {
    const req = 'Campo obligatorio';
    const e: Errors = {};
    if (!proveedorId) e.proveedor = req;
    if (!fechaEmision) e.fechaEmision = req;
    if (formaPago === 'Contado' && !metodoPago) e.metodoPago = req;
    if (formaPago === 'Crédito' && !fechaVencimiento) e.fechaVencimiento = req;
    if (conItems && lineas.some(l => !l.itemId)) e.items = 'Selecciona un ítem en cada fila';
    return e;
  };

  const intentarGuardar = () => {
    const e = validar(true);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (step === 1 && !e.proveedor && !e.fechaEmision && !e.metodoPago && !e.fechaVencimiento) setStep(3);
      toast.error('Revisa los campos marcados');
      return;
    }
    setModal('guardar');
  };

  const continuar = () => {
    const e = validar(false);
    setErrors(e);
    if (Object.keys(e).length > 0) { toast.error('Revisa los campos marcados'); return; }
    setStep(3);
  };

  const confirmarGuardar = () => {
    const items: ItemFacturaCompra[] = lineas.map(l => {
      const it = itemsDisponibles.find(i => i.id === l.itemId)!;
      return { nombre: it.nombre, codigo: it.codigo, cantidad: l.cantidad, precio: l.precio, impuesto: l.impuesto, inventariable: it.manejaExistencias };
    });
    const creada = createFactura({
      proveedorId, numeroProveedor: numeroProveedor.trim(), sucursal: SUCURSAL_ACTUAL, fechaEmision, formaPago,
      metodoPago: formaPago === 'Contado' ? metodoPago : null,
      turno: formaPago === 'Contado' && asociarTurno ? TURNO_ACTUAL : null,
      afectaInventario, fechaVencimiento: formaPago === 'Crédito' ? fechaVencimiento : null,
      items, retenciones, observaciones: observaciones.trim(),
    });
    toast.success(`Factura ${creada.numero} creada`);
    navigate('/facturas-compra');
  };

  // ─── Piezas ────────────────────────────────────────────────────────────────

  const errorText = (msg?: string) => msg ? <p style={{ fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' }}>{msg}</p> : null;

  const wizard1 = step === 1;
  const gridCols = wizard1 ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))';

  const fila1 = (
    <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 16, marginBottom: 16 }}>
      <TextField label="No. factura del proveedor" value={numeroProveedor} onChange={setNumeroProveedor} placeholder="Ingresa el número de factura" />
      <div>
        <FieldLabel required>Fecha de emisión</FieldLabel>
        <input type="date" className="merlin-input-filled" value={fechaEmision}
          style={errors.fechaEmision ? { borderColor: 'var(--coral-100)' } : undefined}
          onChange={e => { setFechaEmision(e.target.value); setErrors(er => ({ ...er, fechaEmision: undefined })); }} />
        {errorText(errors.fechaEmision)}
      </div>
      <div>
        <FieldLabel required>Proveedor</FieldLabel>
        <Combobox
          options={proveedores} value={proveedorId} invalid={!!errors.proveedor} placeholder="Seleccionar proveedor"
          onChange={id => { setProveedorId(id); setErrors(er => ({ ...er, proveedor: undefined })); }}
          pinned={{ label: '+ Crear proveedor', onClick: () => setModal('crearProveedor') }}
        />
        {errorText(errors.proveedor)}
      </div>
      <div>
        <FieldLabel>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Afectar inventario
            <span title="Selecciona si los ítems de esta factura deben ingresarse automáticamente a tu inventario" style={{ display: 'inline-flex' }}>
              <Info size={13} color="var(--black-60)" />
            </span>
          </span>
        </FieldLabel>
        <SiNo value={afectaInventario} onChange={setAfectaInventario} name="afectarInventario" />
      </div>
    </div>
  );

  const fila2 = (
    <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 16 }}>
      <SelectField
        label="Forma de pago" required value={formaPago}
        onChange={v => { setFormaPago(v as 'Crédito' | 'Contado'); setErrors(e => ({ ...e, metodoPago: undefined, fechaVencimiento: undefined })); }}
        options={[{ value: 'Crédito', label: 'Crédito' }, { value: 'Contado', label: 'Contado' }]}
      />
      {formaPago === 'Contado' && (
        <>
          <SelectField
            label="Método de pago" required value={metodoPago} placeholder="Seleccionar método de pago" error={errors.metodoPago}
            onChange={v => { setMetodoPago(v); setErrors(e => ({ ...e, metodoPago: undefined })); }}
            options={METODOS_PAGO.map(m => ({ value: m, label: m }))}
          />
          <div>
            <FieldLabel>{`Asociar al turno No. ${TURNO_ACTUAL}`}</FieldLabel>
            <SiNo value={asociarTurno} onChange={setAsociarTurno} name="asociarTurno" />
          </div>
        </>
      )}
      {formaPago === 'Crédito' && (
        <div>
          <FieldLabel required>Fecha de vencimiento</FieldLabel>
          <input type="date" className="merlin-input-filled" value={fechaVencimiento}
            style={errors.fechaVencimiento ? { borderColor: 'var(--coral-100)' } : undefined}
            onChange={e => { setFechaVencimiento(e.target.value); setErrors(er => ({ ...er, fechaVencimiento: undefined })); }} />
          {errorText(errors.fechaVencimiento)}
        </div>
      )}
    </div>
  );

  const sumRow = (label: string, value: string, strong?: boolean) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: strong ? '10px 0 0' : '5px 0', marginTop: strong ? 6 : 0,
      borderTop: strong ? '1px solid var(--black-10)' : 'none', fontFamily: FONT, fontSize: strong ? 15 : 13,
      fontWeight: strong ? 700 : 400, color: strong ? 'var(--blue-100)' : 'var(--black-100)',
    }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );

  return (
    <div style={{
      flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto',
      padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <style>{`
        @keyframes agregarItemPulseStrong { 0%,100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--blue-100) 55%, transparent); transform: scale(1); } 50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--blue-100) 0%, transparent); transform: scale(1.05); } }
        @keyframes agregarItemPulseSubtle { 0%,100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--blue-100) 30%, transparent); } 50% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--blue-100) 0%, transparent); } }
      `}</style>

      {/* ── Encabezado (siempre visible) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setModal('salir')}
          aria-label="Volver a facturas de compra"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8,
            border: '1px solid var(--blue-20)', backgroundColor: 'var(--black-0)', cursor: 'pointer', flexShrink: 0,
          }}
          className="hover:bg-[var(--blue-10)] transition-colors"
        >
          <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
        </button>
        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0, flex: 1 }}>
          Nueva factura de compra
        </p>
        <button className="btn btn-secondary" style={{ height: 40, padding: '8px 16px', borderRadius: 12 }} onClick={() => setModal('salir')}>Cancelar</button>
        <button className="btn btn-primary" style={{ height: 40, padding: '8px 16px', borderRadius: 12 }} onClick={intentarGuardar}>Guardar</button>
      </div>

      {/* ── Datos generales ── */}
      <div style={{ ...sectionCard, ...(wizard1 ? { maxWidth: 720, width: '100%', alignSelf: 'center', marginTop: 24 } : {}) }}>
        {fila1}
        {fila2}
      </div>

      {wizard1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button className="btn btn-secondary" style={{ borderRadius: 12 }} onClick={() => setStep(3)}>Omitir</button>
          <button className="btn btn-primary" style={{ borderRadius: 12 }} onClick={continuar}>Continuar</button>
        </div>
      )}

      {!wizard1 && (
        <>
          {/* ── Ítems ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: 'var(--blue-100)' }}>Ítems para tu factura</span>
            <button
              onClick={() => { setLineas([nuevaLinea()]); setErrors(e => ({ ...e, items: undefined })); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Trash2 size={12} /> Eliminar todos
            </button>
          </div>

          <div style={{ backgroundColor: 'var(--black-0)', borderRadius: 16, padding: '12px 20px 16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, minWidth: 260 }}>Ítem</th>
                  <th style={{ ...thStyle, width: 110, ...right }}>Cantidad</th>
                  <th style={{ ...thStyle, width: 130, ...right }}>Precio</th>
                  {usarImpuestos && <th style={{ ...thStyle, width: 170 }}>Impuesto</th>}
                  <th style={{ ...thStyle, width: 130, ...right }}>Total</th>
                  <th style={{ ...thStyle, width: 36 }} />
                </tr>
              </thead>
              <tbody>
                {lineas.map((l, idx) => {
                  const item = itemsDisponibles.find(i => i.id === l.itemId);
                  return (
                    <tr key={l.key} style={{ borderBottom: idx === lineas.length - 1 ? 'none' : '1px solid var(--black-10)' }}>
                      <td style={{ ...tdStyle, paddingRight: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Combobox
                            style={{ flex: 1 }}
                            options={itemOptions} value={l.itemId} placeholder="Buscar ítem"
                            invalid={!!errors.items && !l.itemId}
                            onChange={id => { updateLinea(l.key, { itemId: id }); setErrors(e => ({ ...e, items: undefined })); }}
                            pinned={{ label: '+ Crear ítem', onClick: () => setDrawerItem(l.key) }}
                          />
                          {item && !item.manejaExistencias && (
                            <span title="Este producto no está configurado como inventariable" style={{ display: 'inline-flex' }}>
                              <AlertTriangle size={16} color="var(--black-40)" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, paddingRight: 12 }}><NumInput ariaLabel="Cantidad" value={l.cantidad} onChange={n => setCantidad(l, n)} minWidth={68} /></td>
                      <td style={{ ...tdStyle, paddingRight: 12 }}><NumInput ariaLabel="Precio" value={l.precio} onChange={n => setPrecio(l, n)} /></td>
                      {usarImpuestos && (
                        <td style={{ ...tdStyle, paddingRight: 12 }}>
                          <select
                            aria-label="Impuesto" className="merlin-input-filled" value={l.impuesto}
                            onChange={e => updateLinea(l.key, { impuesto: e.target.value as ImpuestoCompra })}
                          >
                            {IMPUESTOS_COMPRA.map(i => <option key={i.value}>{i.value}</option>)}
                          </select>
                        </td>
                      )}
                      <td style={{ ...tdStyle, paddingRight: 12 }}><NumInput ariaLabel="Total" value={l.total} onChange={n => setTotal(l, n)} /></td>
                      <td style={{ ...tdStyle, paddingRight: 0 }}>
                        <button
                          aria-label="Eliminar fila" title="Eliminar"
                          onClick={() => setLineas(prev => prev.length > 1 ? prev.filter(x => x.key !== l.key) : [nuevaLinea()])}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
                        >
                          <Trash2 size={16} color="var(--black-60)" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {errorText(errors.items)}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <button
                className="btn btn-secondary" style={{ padding: '8px 16px', animation: pulse ? `agregarItemPulse${pulse === 'strong' ? 'Strong 0.55s 3' : 'Subtle 0.9s 1'}` : undefined }}
                onClick={() => setLineas(prev => [...prev, nuevaLinea()])}
              >
                <Plus size={14} /> Agregar ítem
              </button>
              <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: 'var(--black-60)' }}>Total items {lineas.length}</span>
            </div>
          </div>

          {/* ── Retención global ── */}
          {usarImpuestos && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 280 }}>
                <SelectField
                  label="Aplicar retención" value={String(retencionPct)} onChange={v => setRetencionPct(Number(v))}
                  options={RETENCIONES_OPCIONES.map(r => ({ value: String(r.value), label: r.label }))}
                />
              </div>
            </div>
          )}

          {/* ── Observaciones y resumen ── */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <TextAreaField label="Observaciones de la factura" value={observaciones} onChange={setObservaciones} placeholder="Escribe aquí tus observaciones" rows={5} />
              <PrototypeComprasTools show={['usarImpuestos']} />
            </div>
            <div style={{ width: 280, flexShrink: 0 }}>
              <div style={{ height: 25 }} />
              <div style={{ ...sectionCard, padding: '16px 20px' }}>
                {sumRow('Subtotal', fmtMonto(subtotal))}
                {usarImpuestos && sumRow('Impuestos', fmtMonto(impuestos))}
                {usarImpuestos && sumRow('Retenciones', `- ${fmtMonto(retenciones)}`)}
                {sumRow('Total', fmtMonto(total), true)}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Modales y drawers ── */}
      {modal === 'salir' && (
        <CenterModal
          icon={<ModalIcon tone="warning"><AlertTriangle size={22} /></ModalIcon>}
          title="¿Seguro que quieres salir?"
          subtitle="Si sales ahora, perderás los datos que ingresaste en esta factura."
          onClose={() => setModal(null)}
          actions={(
            <>
              <button className="btn btn-primary" onClick={() => navigate('/facturas-compra')}>Salir</button>
              <button className="btn btn-cancel" onClick={() => setModal(null)}>Seguir editando</button>
            </>
          )}
        />
      )}
      {modal === 'guardar' && (
        <CenterModal
          title="¿Estás seguro que quieres guardar esta factura?"
          subtitle={`Se registrará una factura de compra por ${fmtMonto(total)}.`}
          onClose={() => setModal(null)}
          actions={(
            <>
              <button className="btn btn-primary" onClick={confirmarGuardar}>Sí, guardar</button>
              <button className="btn btn-cancel" onClick={() => setModal(null)}>Cancelar</button>
            </>
          )}
        />
      )}
      {modal === 'crearProveedor' && (
        <CrearProveedorDrawer
          onClose={() => setModal(null)}
          onCreated={c => { setProveedorId(c.id); setErrors(e => ({ ...e, proveedor: undefined })); setModal(null); }}
        />
      )}
      {drawerItem && (
        <CrearItemDrawer
          onClose={() => setDrawerItem(null)}
          onCreated={item => {
            const fila = lineasRef.current.find(l => l.key === drawerItem);
            if (fila) updateLinea(fila.key, { itemId: item.id });
            setDrawerItem(null);
          }}
        />
      )}
    </div>
  );
}
