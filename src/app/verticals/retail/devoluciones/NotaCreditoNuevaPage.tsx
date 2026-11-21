/**
 * NotaCreditoNuevaPage — "Nota Crédito Electrónica" sin documento de origen (`/notas-credito/nueva`;
 * specs/2026-11-devoluciones-v2.md §3.B). Desde "Registrar Devolución → Sin Documento" el tipo llega bloqueado en
 * "sin referencia"; desde "Nuevo" de la lista de notas crédito el tipo es editable: "con referencia" pide cliente y factura
 * y sigue en la vista de la factura (`DevolucionDocumentoPage`). Al confirmar se emite la nota y queda pendiente de la DIAN.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAjustes } from '../../../store/ajustesStore';
import { useContactos } from '../../../store/contactosStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import { useItems } from '../../../store/itemsStore';
import { useVentas } from '../../../store/ventasStore';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import { PrototypeToolsBar } from '../../../components/PrototypeToolsBar';
import { IMPUESTOS, getImpuesto } from '../../../data/itemsCatalogs';
import { getVarianteLabel, getVariantes } from '../../../types/item';
import type { Devolucion } from '../../../types/devolucion';
import { isoDia, SESION_VENTAS } from '../../../utils/ventas';
import { useVertical } from '../../../vertical';
import { useTurnoAbierto } from '../../../utils/turno';
import { escribirSimularRechazo, leerSimularRechazo, useSimularRechazo } from '../../../utils/simulacionDian';
import {
  MOTIVOS_NOTA_DIAN, VALIDACION, errorJustificacion, etiquetaImpuesto, manejaInventarioEn, mismaSucursal,
  resumirImpuestos, sucursalDeItems, usuarioSesion,
} from '../../../utils/devoluciones';
import { AbrirTurnoModal } from './AbrirTurnoModal';
import { SelectorCasoDevolucion } from './SelectorCasoDevolucion';
import {
  Banner, CampoLectura, AvisosSinInventario, DatosDevolucion, TotalesDevolucion, bordeError, errStyle, fmtFechaCorta, inputStyle, labelStyle, miles, num, selectStyle, soloDigitos, tdStyle, thStyle,
} from './DevolucionUi';
import { formatCOP } from '../../../utils/format';

import { FONT } from './DevolucionUi';

const DIAN_MS = 3000;
const TIPO_CON = 'con';
const TIPO_SIN = 'sin';
const DESCUENTOS = [0, 5, 10, 15, 20];

/** Un ítem (o variante) del catálogo que se puede agregar a la nota. */
interface Entrada {
  key: string;
  nombre: string;
  referencia: string;
  /** Precio de venta con impuesto. */
  precio: number;
  impuestoId: string;
  maneja: boolean;
  itemRefId: string;
  variantId?: string;
}

/** Fila de la tabla: una entrada del catálogo con cantidad, descuento, impuesto y valor editables. */
interface FilaNota { id: number; entrada: string; cantidad: string; descuento: number; impuestoId: string; valor: string; valorEditado: boolean }

const valorInicial = (e: Entrada, cantidad: number, descuento: number) => Math.round(e.precio * (1 - descuento / 100)) * cantidad;

export function NotaCreditoNuevaPage() {
  const { vertical } = useVertical();
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const { ajustes } = useAjustes();
  const { contactos } = useContactos();
  const { ventas } = useVentas();
  const { items } = useItems();
  const { siguienteNotaCredito, emitirNota } = useDevoluciones();
  const [turnoAbierto, setTurnoAbierto] = useTurnoAbierto();
  const [simularRechazo, setSimularRechazo] = useSimularRechazo();

  const bloqueado = query.get('origen') === 'sin-documento';
  const usuario = usuarioSesion(ajustes);
  const responsable = `${usuario.nombre} ${usuario.apellido}`;
  const sucursalSesion = ajustes.sucursales.find(s => s.id === usuario.sucursalId);
  const sucursalId = usuario.sucursalId;
  const sucursalItems = sucursalDeItems(sucursalId);

  const [tipoNota, setTipoNota] = useState<'' | typeof TIPO_CON | typeof TIPO_SIN>(bloqueado ? TIPO_SIN : '');
  const [clienteId, setClienteId] = useState('');
  /** "Con referencia": cliente (nombre tal como está en las facturas) y factura elegida. */
  const [clienteRef, setClienteRef] = useState('');
  const [facturaId, setFacturaId] = useState('');
  const [mesFactura, setMesFactura] = useState(() => isoDia(Date.now()));
  const [motivoNota, setMotivoNota] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [descuentoGeneral, setDescuentoGeneral] = useState(0);
  const [formaPago, setFormaPago] = useState<'' | 'Crédito' | 'Contado'>('');
  const [filas, setFilas] = useState<FilaNota[]>([]);
  const [inventario, setInventario] = useState<'si' | 'no'>('si');
  const [motivoId, setMotivoId] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [intento, setIntento] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [abriendoTurno, setAbriendoTurno] = useState(false);

  useEffect(() => {
    if (ajustes.pos.controlTurnos && !turnoAbierto) setAbriendoTurno(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const salir = () => { if (window.history.length > 1) navigate(-1); else navigate('/items/devoluciones'); };

  // ── Catálogo: ítems activos, sin combos; cada variante es una entrada ────────
  const catalogo: Entrada[] = useMemo(() => {
    const out: Entrada[] = [];
    items.filter(i => i.activo && !i.esCombo).forEach(i => {
      const vars = getVariantes(i);
      if (vars) {
        vars.filter(v => v.activo).forEach(v => out.push({
          key: `${i.id}::${v.id}`, nombre: `${i.nombre} - ${getVarianteLabel(v)}`, referencia: i.referencia, precio: v.precioTotal,
          impuestoId: i.impuestoId, maneja: i.manejaExistencias && v.sucursales.some(s => s.sucursalId === sucursalItems), itemRefId: i.id, variantId: v.id,
        }));
      } else {
        out.push({ key: i.id, nombre: i.nombre, referencia: i.referencia, precio: i.precioTotal, impuestoId: i.impuestoId, maneja: manejaInventarioEn(i, sucursalItems), itemRefId: i.id });
      }
    });
    return out.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [items, sucursalItems]);
  const entradaDe = (key: string) => catalogo.find(e => e.key === key);

  const clientes = useMemo(() => contactos.filter(c => c.esCliente && c.activo).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })), [contactos]);
  const cliente = clientes.find(c => c.id === clienteId);
  // "Con referencia": los clientes y sus facturas salen de las facturas pagadas de la sucursal de la sesión.
  const facturasSesion = useMemo(
    () => (sucursalSesion ? ventas.filter(v => v.tipoDoc === 'factura' && v.estado === 'pagada' && mismaSucursal(sucursalSesion.nombre, v.sucursal)).sort((a, b) => b.emitidaEn - a.emitidaEn) : []),
    [ventas, sucursalSesion],
  );
  const clientesConFactura = useMemo(() => [...new Set(facturasSesion.map(v => v.cliente))].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })), [facturasSesion]);
  const facturasDelCliente = facturasSesion.filter(v => v.cliente === clienteRef);

  // ── Filas ────────────────────────────────────────────────────────────────
  const agregarFila = () => setFilas(p => [...p, { id: Date.now() + p.length, entrada: '', cantidad: '1', descuento: 0, impuestoId: '', valor: '', valorEditado: false }]);
  const quitarFila = (id: number) => setFilas(p => p.filter(f => f.id !== id));
  const patchFila = (id: number, patch: Partial<FilaNota>) => setFilas(p => p.map(f => (f.id === id ? { ...f, ...patch } : f)));
  const elegirEntrada = (f: FilaNota, key: string) => {
    const e = entradaDe(key);
    if (!e) { patchFila(f.id, { entrada: '', valor: '', impuestoId: '' }); return; }
    patchFila(f.id, { entrada: key, impuestoId: e.impuestoId, valor: String(valorInicial(e, num(f.cantidad) || 1, f.descuento)), valorEditado: false });
  };
  const cambiarCantidad = (f: FilaNota, texto: string) => {
    const c = soloDigitos(texto);
    const e = entradaDe(f.entrada);
    patchFila(f.id, { cantidad: c, ...(e && !f.valorEditado ? { valor: String(valorInicial(e, num(c), f.descuento)) } : {}) });
  };
  const cambiarDescuento = (f: FilaNota, d: number) => {
    const e = entradaDe(f.entrada);
    patchFila(f.id, { descuento: d, ...(e && !f.valorEditado ? { valor: String(valorInicial(e, num(f.cantidad), d)) } : {}) });
  };
  const errorFila = (f: FilaNota): { item?: string; cantidad?: string; valor?: string } => ({
    item: f.entrada ? undefined : 'Selecciona un ítem.',
    cantidad: num(f.cantidad) > 0 ? undefined : VALIDACION.cantidad,
    valor: num(f.valor) > 0 ? undefined : VALIDACION.valor,
  });

  // ── Totales: el descuento general reduce cada línea; se muestran antes y después ─
  const validas = filas.filter(f => f.entrada);
  const factorGeneral = 1 - descuentoGeneral / 100;
  const efectivo = (f: FilaNota) => Math.round(num(f.valor) * factorGeneral);
  const tasaDe = (f: FilaNota) => getImpuesto(f.impuestoId)?.rate ?? 0;
  const bruto = resumirImpuestos(validas.map(f => ({ impuestoId: f.impuestoId, tasa: tasaDe(f), valor: num(f.valor) })));
  const neto = resumirImpuestos(validas.map(f => ({ impuestoId: f.impuestoId, tasa: tasaDe(f), valor: efectivo(f) })));

  const motivosActivos = [...ajustes.motivosDevolucion].filter(m => m.activo).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  const hayInventario = validas.some(f => entradaDe(f.entrada)?.maneja);
  const sinInventario = validas.filter(f => !entradaDe(f.entrada)?.maneja).map(f => entradaDe(f.entrada)?.nombre ?? '');
  const errJustificacion = errorJustificacion(justificacion);

  const errCliente = !clienteId;
  const errMotivoNota = !motivoNota;
  const errForma = !formaPago;

  const confirmar = () => {
    setIntento(true);
    if (procesando) return;
    if (errCliente || errMotivoNota || errForma) return;
    if (validas.length === 0) return;
    if (filas.some(f => { const e = errorFila(f); return e.item || e.cantidad || e.valor; })) return;
    if (!motivoId || !metodoPago || errJustificacion) return;

    setProcesando(true);
    const ahora = Date.now();
    const notaCredito = siguienteNotaCredito();
    const ingresa = hayInventario && inventario === 'si';
    const nuevas: Omit<Devolucion, 'numero' | 'fecha'>[] = validas.map((f, j) => {
      const e = entradaDe(f.entrada)!;
      return {
        id: `dev-${ahora}-${j}`, sucursalId, turno: SESION_VENTAS[vertical].turno, responsable, tipo: 'sinDocumento',
        itemId: e.key, nombre: e.nombre, cantidad: num(f.cantidad), valorDevolucion: efectivo(f),
        impuestoId: f.impuestoId, tasaImpuesto: tasaDe(f), metodoPago, motivoId, justificacion: justificacion.trim(),
        ingresaInventario: ingresa && e.maneja, notaCredito, motivoNotaDian: motivoNota, formaPagoNota: formaPago as 'Crédito' | 'Contado',
        clienteNombre: cliente!.nombre, ...(cliente!.numeroDocumento ? { clienteDocumento: cliente!.numeroDocumento } : {}),
      };
    });
    const inventarioNota = ingresa
      ? validas.filter(f => entradaDe(f.entrada)?.maneja).map(f => { const e = entradaDe(f.entrada)!; return { itemId: e.itemRefId, cantidad: num(f.cantidad), ...(e.variantId ? { variantId: e.variantId } : {}) }; })
      : [];
    const rechazar = leerSimularRechazo();
    if (rechazar) escribirSimularRechazo(false);
    emitirNota({
      id: `nota-${ahora}`, notaCredito, sucursalId, creadaEn: ahora, resuelveEn: ahora + DIAN_MS, rechazar,
      filas: nuevas, inventario: inventarioNota, sucursalItemsId: sucursalItems,
    });
    navigate('/items/devoluciones');
  };

  const fechaEmision = fmtFechaCorta(Date.now());
  const sinReferencia = tipoNota === TIPO_SIN;

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1200, margin: '0 auto 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Nota Crédito Electrónica (Devolución)</h1>
          <button onClick={() => setSaliendo(true)} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--black-60)' }}><X size={22} /></button>
        </div>

        {/* Cabecera */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          <div>
            <label htmlFor="nc-tipo" style={labelStyle}>Tipo de nota de crédito *</label>
            <select id="nc-tipo" value={tipoNota} disabled={bloqueado} onChange={e => setTipoNota(e.target.value as typeof tipoNota)} style={{ ...selectStyle, ...(bloqueado ? { backgroundColor: 'var(--blue-10)' } : {}) }}>
              <option value="">Elige el tipo de nota de crédito</option>
              <option value={TIPO_CON}>Nota crédito con referencia</option>
              <option value={TIPO_SIN}>Nota crédito sin referencia</option>
            </select>
          </div>
          <CampoLectura label="Fecha de Emisión" valor={fechaEmision} />
          {sinReferencia ? (
            <div>
              <label htmlFor="nc-mes" style={labelStyle}>Mes de Factura de Venta *</label>
              <input id="nc-mes" type="date" value={mesFactura} onChange={e => setMesFactura(e.target.value)} style={selectStyle} />
            </div>
          ) : <span />}

          {tipoNota === TIPO_CON && (
            <>
              <div>
                <label htmlFor="nc-cliente-ref" style={labelStyle}>Cliente *</label>
                <select id="nc-cliente-ref" value={clienteRef} onChange={e => { setClienteRef(e.target.value); setFacturaId(''); }} style={selectStyle}>
                  <option value="">Elige el cliente...</option>
                  {clientesConFactura.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="nc-factura" style={labelStyle}>Factura de venta *</label>
                <select id="nc-factura" value={facturaId} disabled={!clienteRef} onChange={e => { setFacturaId(e.target.value); if (e.target.value) navigate(`/facturas-venta/${e.target.value}/devolucion`); }} style={selectStyle}>
                  <option value="">{clienteRef && facturasDelCliente.length === 0 ? 'No se han encontrado facturas de venta' : 'Buscar factura...'}</option>
                  {facturasDelCliente.map(v => <option key={v.id} value={v.id}>{v.numero} - {isoDia(v.emitidaEn)}</option>)}
                </select>
              </div>
              <span />
            </>
          )}

          {sinReferencia && (
            <>
              <div>
                <label htmlFor="nc-motivo-nota" style={labelStyle}>Motivo de la nota de crédito *</label>
                <select id="nc-motivo-nota" value={motivoNota} onChange={e => setMotivoNota(e.target.value)} style={{ ...selectStyle, borderColor: bordeError(intento && errMotivoNota) }}>
                  <option value="">Elige un motivo para la nota de crédito</option>
                  {MOTIVOS_NOTA_DIAN.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {intento && errMotivoNota && <p style={errStyle}>Selecciona un motivo para la nota de crédito.</p>}
              </div>
              <div>
                <label htmlFor="nc-cliente" style={labelStyle}>Cliente *</label>
                <select id="nc-cliente" value={clienteId} onChange={e => setClienteId(e.target.value)} style={{ ...selectStyle, borderColor: bordeError(intento && errCliente) }}>
                  <option value="">Elige el cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}{c.numeroDocumento ? ` - ${c.numeroDocumento}` : ''}</option>)}
                </select>
                {intento && errCliente && <p style={errStyle}>Selecciona un cliente.</p>}
              </div>
              <div>
                <label htmlFor="nc-vendedor" style={labelStyle}>Vendedor</label>
                <select id="nc-vendedor" value={vendedor} onChange={e => setVendedor(e.target.value)} style={selectStyle}>
                  <option value="">Ninguno</option>
                  {ajustes.vendedores.map(v => <option key={v.id} value={v.nombre}>{v.nombre}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="nc-descuento" style={labelStyle}>Descuento</label>
                <select id="nc-descuento" value={descuentoGeneral} onChange={e => setDescuentoGeneral(Number(e.target.value))} style={selectStyle}>
                  {DESCUENTOS.map(d => <option key={d} value={d}>{d === 0 ? 'Elige el descuento...' : `${d} %`}</option>)}
                </select>
              </div>
              <CampoLectura label="Lista de precios" valor="General" />
              <div>
                <label htmlFor="nc-forma" style={labelStyle}>Forma de Pago *</label>
                <select id="nc-forma" value={formaPago} onChange={e => setFormaPago(e.target.value as typeof formaPago)} style={{ ...selectStyle, borderColor: bordeError(intento && errForma) }}>
                  <option value="">Elige una forma de pago...</option>
                  <option value="Crédito">Crédito</option>
                  <option value="Contado">Contado</option>
                </select>
                {intento && errForma && <p style={errStyle}>Selecciona una forma de pago.</p>}
              </div>
            </>
          )}
        </div>

        {tipoNota === '' && <Banner tipo="aviso">Elige el tipo de nota de crédito para continuar.</Banner>}

        {sinReferencia && (
          <>
            {/* Datos de la devolución, antes de la tabla */}
            <DatosDevolucion
              inventario={inventario} onInventario={setInventario}
              motivos={motivosActivos} motivoId={motivoId} onMotivo={setMotivoId}
              metodos={ajustes.metodosPago.map(m => m.nombre)} metodoPago={metodoPago} onMetodo={setMetodoPago}
              justificacion={justificacion} onJustificacion={setJustificacion} errJustificacion={errJustificacion} intento={intento}
            />

            {/* Tabla de la vista real: se agregan y se quitan filas */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 1040 }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 240 }}>Ítem</th>
                    <th style={{ ...thStyle, width: 110 }}>Referencia</th>
                    <th style={{ ...thStyle, width: 90 }}>Cantidad</th>
                    <th style={{ ...thStyle, width: 130 }}>Impuesto</th>
                    <th style={{ ...thStyle, width: 110 }}>Precio</th>
                    <th style={{ ...thStyle, width: 110 }}>Descuento</th>
                    <th style={{ ...thStyle, width: 140 }}>Total</th>
                    <th style={{ ...thStyle, width: 44 }} />
                  </tr>
                </thead>
                <tbody>
                  {filas.map(f => {
                    const e = entradaDe(f.entrada);
                    const err = errorFila(f);
                    const base = e && num(f.cantidad) > 0 ? Math.round(num(f.valor) / (1 + tasaDe(f)) / num(f.cantidad)) : 0;
                    return (
                      <tr key={f.id} style={{ borderBottom: '1px solid var(--black-10)' }}>
                        <td style={tdStyle}>
                          <select aria-label="Ítem" value={f.entrada} onChange={ev => elegirEntrada(f, ev.target.value)} style={{ ...selectStyle, height: 36, borderColor: bordeError(intento && !!err.item) }}>
                            <option value="">Elige un ítem...</option>
                            {catalogo.map(c => {
                              const usado = filas.some(o => o.id !== f.id && o.entrada === c.key);
                              return <option key={c.key} value={c.key} disabled={usado}>{c.nombre}{usado ? ' (Ya agregado)' : ''}</option>;
                            })}
                          </select>
                          {intento && err.item && <p style={errStyle}>{err.item}</p>}
                        </td>
                        <td style={tdStyle}>{e?.referencia || '--'}</td>
                        <td style={tdStyle}>
                          <input aria-label="Cantidad" inputMode="numeric" value={f.cantidad} onChange={ev => cambiarCantidad(f, ev.target.value)} style={{ ...inputStyle, borderColor: bordeError(intento && !!err.cantidad) }} />
                          {intento && err.cantidad && <p style={errStyle}>{err.cantidad}</p>}
                        </td>
                        <td style={tdStyle}>
                          <select aria-label="Impuesto" value={f.impuestoId} disabled={!e} onChange={ev => patchFila(f.id, { impuestoId: ev.target.value })} style={{ ...selectStyle, height: 36 }}>
                            {!e && <option value="">--</option>}
                            {IMPUESTOS.map(i => <option key={i.id} value={i.id}>{etiquetaImpuesto(i.id)}</option>)}
                          </select>
                        </td>
                        <td style={tdStyle}>{e ? formatCOP(base) : '--'}</td>
                        <td style={tdStyle}>
                          <select aria-label="Descuento de la línea" value={f.descuento} disabled={!e} onChange={ev => cambiarDescuento(f, Number(ev.target.value))} style={{ ...selectStyle, height: 36 }}>
                            {DESCUENTOS.map(d => <option key={d} value={d}>{d === 0 ? 'Ninguno' : `${d} %`}</option>)}
                          </select>
                        </td>
                        <td style={tdStyle}>
                          <input aria-label="Valor de devolución" inputMode="numeric" disabled={!e} value={miles(f.valor)} onChange={ev => patchFila(f.id, { valor: soloDigitos(ev.target.value), valorEditado: true })}
                            style={{ ...inputStyle, ...(e ? {} : { backgroundColor: 'var(--blue-10)' }), borderColor: bordeError(intento && !!err.valor && !!e) }} />
                          {intento && e && err.valor && <p style={errStyle}>{err.valor}</p>}
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => quitarFila(f.id)} aria-label="Quitar ítem" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--coral-100)' }}><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button className="btn btn-secondary" onClick={agregarFila} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> Agregar</button>
              <span style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-60)' }}>Total items {validas.length}</span>
            </div>
            <AvisosSinInventario nombres={sinInventario} />
            {intento && validas.length === 0 && <p style={errStyle}>Selecciona al menos un ítem para devolver.</p>}

            <TotalesDevolucion conImpuesto subtotal={bruto.subtotal} descuento={bruto.subtotal - neto.subtotal} impuestos={neto.impuestos} total={neto.total} />
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 12, borderTop: '1px solid var(--black-10)' }}>
          <button className="btn btn-cancel" onClick={() => setSaliendo(true)}>Cancelar</button>
          <button className="btn btn-primary" onClick={confirmar} disabled={!sinReferencia || procesando}>Confirmar devolución</button>
        </div>
      </div>

      <PrototypeToolsBar>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <SelectorCasoDevolucion actual={sinReferencia ? 'sin-referencia' : ''} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--black-60)', cursor: 'pointer' }}>
          <input type="checkbox" checked={!turnoAbierto} onChange={e => setTurnoAbierto(!e.target.checked)} style={{ accentColor: 'var(--blue-100)' }} />
          Simular que no hay turno abierto
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--black-60)', cursor: 'pointer' }}>
          <input type="checkbox" checked={simularRechazo} onChange={e => setSimularRechazo(e.target.checked)} style={{ accentColor: 'var(--blue-100)' }} />
          Simular rechazo de la DIAN
        </label>
          </div>
        </div>
      </PrototypeToolsBar>

      {abriendoTurno && (
        <AbrirTurnoModal sucursal={sucursalSesion?.nombre ?? ''} onCancel={() => { setAbriendoTurno(false); salir(); }} onOpen={() => { setTurnoAbierto(true); setAbriendoTurno(false); }} />
      )}
      {saliendo && (
        <ConfirmDeleteModal title="¿Salir de la devolución?" message="Si sales, se perderá la información ingresada." confirmLabel="Salir" cancelLabel="Continuar" onCancel={() => setSaliendo(false)} onConfirm={salir} />
      )}
    </div>
  );
}
