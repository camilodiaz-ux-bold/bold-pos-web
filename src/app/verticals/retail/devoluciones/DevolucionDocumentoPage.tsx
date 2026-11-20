/**
 * DevolucionDocumentoPage — devolución de un documento de venta (specs/2026-11-devoluciones-v2.md §3.A y §4).
 * Factura: réplica de "Nota Crédito Electrónica" con referencia, con el documento precargado y en solo lectura;
 * Comprobante: copia "Devolución" (sin tipo de nota, motivo de la nota ni forma de pago; sin DIAN, fase 4).
 * Al confirmar en Factura se emite la nota crédito y queda pendiente de la DIAN (`NotasDianResolver`).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useAjustes } from '../../../store/ajustesStore';
import { useContactos } from '../../../store/contactosStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import { useItems } from '../../../store/itemsStore';
import { useVentas } from '../../../store/ventasStore';
import { useCatalog } from '../../../vertical';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import { PrototypeToolsBar } from '../../../components/PrototypeToolsBar';
import type { AlcanceDevolucion, Devolucion, TipoDevolucion } from '../../../types/devolucion';
import { formatCOP } from '../../../utils/format';
import { isoDia, SESION_VENTAS } from '../../../utils/ventas';
import { useTurnoAbierto } from '../../../utils/turno';
import { escribirSimularRechazo, leerSimularRechazo, useSimularRechazo } from '../../../utils/simulacionDian';
import {
  MOTIVO_NOTA_PARCIAL, MOTIVO_NOTA_TOTAL, VALIDACION, clienteDeDevolucion, documentoDeCliente, errorJustificacion,
  estadoDocumentoDevolucion, etiquetaImpuesto, lineasDeDocumento, mismaSucursal, resumirImpuestos, sucursalDeItems, usuarioSesion, validarDocumento,
} from '../../../utils/devoluciones';
import type { LineaDevolucion } from '../../../utils/devoluciones';
import { AbrirTurnoModal } from './AbrirTurnoModal';
import { SelectorCasoDevolucion } from './SelectorCasoDevolucion';
import { useAplicarDevolucion } from './NotasDianResolver';
import { VENTA_EJEMPLO_CONFLICTO } from '../../../data/retail/ventasSeed';
import { Banner, CampoLectura, AvisosSinInventario, DatosDevolucion, FONT, TotalesDevolucion, errStyle, fmtFechaCorta, inputStyle, labelStyle, miles, num, soloDigitos, tdStyle, thStyle } from './DevolucionUi';

/** Tiempo que la DIAN tarda en responder (simulado). */
const DIAN_MS = 3000;
const CONFLICTO_KEY = 'bold-pos:devoluciones-conflicto-demo:v1';
const conflictoDemoDisparado = (): boolean => { try { return localStorage.getItem(CONFLICTO_KEY) === '1'; } catch { return false; } };
export const MSG_CONFLICTO = 'Este ítem ya fue devuelto. Actualiza la información e inténtalo de nuevo.';

interface Fila { marcado: boolean; cantidad: string; valor: string; valorEditado: boolean }

type TipoDocumento = Extract<TipoDevolucion, 'factura' | 'comprobante'>;

/** Se vuelve a montar al cambiar de documento o de alcance (lo hace el selector de casos del prototipo). */
export function DevolucionDocumentoPage({ tipo }: { tipo: TipoDocumento }) {
  const { id = '' } = useParams<{ id: string }>();
  const [query] = useSearchParams();
  return <DevolucionDocumentoView key={`${tipo}-${id}-${query.get('alcance') ?? ''}`} tipo={tipo} />;
}

function DevolucionDocumentoView({ tipo }: { tipo: TipoDocumento }) {
  const { id = '' } = useParams<{ id: string }>();
  const [query] = useSearchParams();
  const navigate = useNavigate();
  const { ajustes } = useAjustes();
  const { ventas } = useVentas();
  const { devoluciones, pendientes, siguienteNotaCredito, siguienteNumero, emitirNota, agregar } = useDevoluciones();
  const aplicar = useAplicarDevolucion();
  const { items } = useItems();
  const { allProducts } = useCatalog();
  const { contactos } = useContactos();
  const [turnoAbierto, setTurnoAbierto] = useTurnoAbierto();
  const [simularRechazo, setSimularRechazo] = useSimularRechazo();

  const venta = ventas.find(v => v.id === id && v.tipoDoc === tipo) ?? null;
  const esFactura = tipo === 'factura';
  /** Solo la Factura discrimina impuestos. */
  const conImpuesto = esFactura;

  const usuario = usuarioSesion(ajustes);
  const responsable = `${usuario.nombre} ${usuario.apellido}`;
  const sucursalId = useMemo(
    () => (venta ? ajustes.sucursales.find(s => mismaSucursal(s.nombre, venta.sucursal))?.id ?? usuario.sucursalId : usuario.sucursalId),
    [venta, ajustes.sucursales, usuario.sucursalId],
  );
  const sucursalItems = sucursalDeItems(sucursalId);

  const estado = useMemo(() => (venta ? estadoDocumentoDevolucion(venta, devoluciones, pendientes) : null), [venta, devoluciones, pendientes]);
  const validacion = venta && estado ? validarDocumento(venta, estado) : null;
  const bloqueado = !venta || (validacion?.bloqueos.length ?? 0) > 0;

  const lineas: LineaDevolucion[] = useMemo(
    () => (venta ? lineasDeDocumento(venta, items, sucursalItems, pid => allProducts.find(p => String(p.id) === pid)?.catId ?? 'accesorios', conImpuesto) : []),
    [venta, items, sucursalItems, allProducts, conImpuesto],
  );
  const yaDevuelto = (l: LineaDevolucion) => !!estado?.itemsDevueltos.has(l.itemId);

  // "Total" no está disponible si el documento ya tuvo alguna devolución (aunque haya sido parcial).
  const totalDeshabilitado = !!estado?.huboDevolucion;
  const [alcance, setAlcance] = useState<AlcanceDevolucion>(query.get('alcance') === 'total' && !totalDeshabilitado ? 'total' : 'parcial');
  const [filas, setFilas] = useState<Record<string, Fila>>({});
  const [inventario, setInventario] = useState<'si' | 'no'>('si');
  const [motivoId, setMotivoId] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [intento, setIntento] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [conflicto, setConflicto] = useState('');
  const [abriendoTurno, setAbriendoTurno] = useState(false);

  // Con turnos en la cuenta y sin turno abierto, primero se abre el turno (§3.A, punto 13).
  useEffect(() => {
    if (ajustes.pos.controlTurnos && !turnoAbierto) setAbriendoTurno(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const salir = () => { if (window.history.length > 1) navigate(-1); else navigate('/items/devoluciones'); };

  const esTotal = alcance === 'total';
  const vacio = (l: LineaDevolucion): Fila => ({ marcado: false, cantidad: String(l.cantidadVendida), valor: String(l.valorVenta), valorEditado: false });
  /** Con alcance Total todo va marcado, completo y sin editar. */
  const datos = (l: LineaDevolucion): Fila =>
    esTotal ? { marcado: !yaDevuelto(l), cantidad: String(l.cantidadVendida), valor: String(l.valorVenta), valorEditado: false } : (filas[l.key] ?? vacio(l));
  const setFila = (l: LineaDevolucion, patch: Partial<Fila>) => setFilas(p => ({ ...p, [l.key]: { ...datos(l), ...patch } }));
  const cambiarCantidad = (l: LineaDevolucion, texto: string) => {
    let c = soloDigitos(texto);
    if (num(c) > l.cantidadVendida) c = String(l.cantidadVendida);
    const f = datos(l);
    setFila(l, { cantidad: c, ...(f.valorEditado ? {} : { valor: String(l.unitario * num(c)) }) });
  };
  const cambiarAlcance = (a: AlcanceDevolucion) => { setAlcance(a); setFilas({}); setIntento(false); setConflicto(''); };

  const seleccionadas = lineas.filter(l => datos(l).marcado && !yaDevuelto(l));
  const errorLinea = (l: LineaDevolucion): { cantidad?: string; valor?: string } => {
    const f = datos(l);
    const mayorVenta = num(f.valor) > l.unitario * num(f.cantidad);
    return {
      cantidad: num(f.cantidad) > 0 ? undefined : VALIDACION.cantidad,
      valor: num(f.valor) <= 0 ? VALIDACION.valor : mayorVenta ? VALIDACION.valorMayorVenta : undefined,
    };
  };

  const motivosActivos = [...ajustes.motivosDevolucion].filter(m => m.activo).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  const hayInventario = seleccionadas.some(l => l.maneja);
  const sinInventario = seleccionadas.filter(l => !l.maneja);
  const resumen = resumirImpuestos(seleccionadas.map(l => ({ impuestoId: l.impuestoId, tasa: l.tasa, valor: num(datos(l).valor) })));
  const errJustificacion = errorJustificacion(justificacion);

  const confirmar = () => {
    setIntento(true);
    if (!venta || bloqueado || procesando) return;
    if (seleccionadas.length === 0) return;
    if (seleccionadas.some(l => errorLinea(l).cantidad || errorLinea(l).valor)) return;
    if (!motivoId || !metodoPago || errJustificacion) return;

    // Conflicto: otro usuario ya devolvió alguno de los ítems.
    if (seleccionadas.some(yaDevuelto)) { setFilas({}); setConflicto(MSG_CONFLICTO); return; }

    // Conflicto simulado (S3): en el comprobante de ejemplo, la primera vez "otro usuario" ya devolvió el primer ítem.
    if (!esFactura && venta.id === VENTA_EJEMPLO_CONFLICTO && !conflictoDemoDisparado()) {
      const l = seleccionadas[0];
      try { localStorage.setItem(CONFLICTO_KEY, '1'); } catch { /* ignore */ }
      agregar([{
        id: `dev-conflicto-${Date.now()}`, numero: siguienteNumero(), fecha: Date.now(), sucursalId, turno: SESION_VENTAS.retail.turno, responsable: 'Camila Rojas',
        tipo, ventaId: venta.id, numeroDocumento: venta.numero, fechaVenta: venta.emitidaEn, valorVenta: venta.total,
        itemId: l.itemId, nombre: l.nombre, categoriaId: l.categoriaId, cantidad: 1, valorVentaItem: l.unitario, cantidadVendida: l.cantidadVendida, valorVentaLinea: l.valorVenta, valorDevolucion: l.unitario,
        metodoPago: 'Efectivo', motivoId: 'mot-4', justificacion: 'Devolución registrada por otro usuario.', ingresaInventario: false,
        alcance: 'parcial', clienteNombre: venta.cliente.replace(/\s*\(\s*NIT:[^)]*\)/i, '').trim(), estadoDian: 'aceptada', ejemplo: true,
      }]);
      setAlcance('parcial'); setFilas({}); setIntento(false); setConflicto(MSG_CONFLICTO);
      return;
    }

    setProcesando(true);
    const ahora = Date.now();
    const notaCredito = siguienteNotaCredito();
    const ingresa = hayInventario && inventario === 'si';
    const motivoNotaDian = esTotal ? MOTIVO_NOTA_TOTAL : MOTIVO_NOTA_PARCIAL;
    const clienteNombre = venta.cliente.replace(/\s*\(\s*NIT:[^)]*\)/i, '').trim();
    const clienteDocumento = documentoDeCliente(venta, contactos) || undefined;
    const nuevas: Omit<Devolucion, 'numero' | 'fecha'>[] = seleccionadas.map((l, j) => ({
      id: `dev-${ahora}-${j}`, sucursalId, turno: SESION_VENTAS.retail.turno, responsable, tipo,
      ventaId: venta.id, numeroDocumento: venta.numero, fechaVenta: venta.emitidaEn, valorVenta: venta.total,
      itemId: l.itemId, nombre: l.nombre, categoriaId: l.categoriaId, cantidad: num(datos(l).cantidad),
      valorVentaItem: l.unitario * num(datos(l).cantidad), cantidadVendida: l.cantidadVendida, valorVentaLinea: l.valorVenta, valorDevolucion: num(datos(l).valor),
      ...(conImpuesto ? { impuestoId: l.impuestoId, tasaImpuesto: l.tasa } : {}),
      metodoPago, motivoId, justificacion: justificacion.trim(), ingresaInventario: ingresa && l.maneja,
      ...(esFactura ? { notaCredito, motivoNotaDian } : {}),
      alcance, clienteNombre, ...(clienteDocumento ? { clienteDocumento } : {}),
    }));
    const inventarioNota = ingresa ? seleccionadas.filter(l => l.maneja && l.itemRefId).map(l => ({ itemId: l.itemRefId as string, cantidad: num(datos(l).cantidad) })) : [];

    // Comprobante: sin DIAN, la devolución se crea al confirmar.
    if (!esFactura) {
      aplicar({ filas: nuevas, inventario: inventarioNota, sucursalId, sucursalItemsId: sucursalItems });
      navigate(`/comprobantes/${venta.id}`);
      return;
    }

    // "Simular rechazo de la DIAN": la siguiente nota se rechaza y la herramienta se apaga sola.
    const rechazar = leerSimularRechazo();
    if (rechazar) escribirSimularRechazo(false);
    emitirNota({
      id: `nota-${ahora}`, ventaId: venta.id, notaCredito, alcance, sucursalId, creadaEn: ahora, resuelveEn: ahora + DIAN_MS, rechazar,
      filas: nuevas, inventario: inventarioNota, sucursalItemsId: sucursalItems,
    });
    navigate(`/facturas-venta/${venta.id}`);
  };

  const titulo = esFactura ? 'Nota Crédito Electrónica' : 'Devolución (Comprobante)';

  if (!venta) {
    return (
      <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: 'var(--black-100)', margin: 0 }}>No se encontró el documento.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/items/devoluciones')}>Volver a Devoluciones</button>
      </div>
    );
  }

  const motivoNota = esTotal ? MOTIVO_NOTA_TOTAL : MOTIVO_NOTA_PARCIAL;
  const cabecera = esFactura ? (
    <>
      <CampoLectura label="Tipo de nota de crédito" valor="Nota crédito con referencia" />
      <CampoLectura label="Fecha de Emisión" valor={fmtFechaCorta(Date.now())} />
      <CampoLectura label="Fecha de Factura de Venta" valor={fmtFechaCorta(venta.emitidaEn)} />
      <CampoLectura label="Motivo de la nota de crédito" valor={motivoNota} />
      <CampoLectura label="Cliente" valor={clienteDeDevolucion({ clienteNombre: venta.cliente.replace(/\s*\(\s*NIT:[^)]*\)/i, '').trim() })} />
      <CampoLectura label="Factura de venta" valor={`${venta.numero} - ${isoDia(venta.emitidaEn)}`} />
      <CampoLectura label="Descuento" valor={venta.discount > 0 ? formatCOP(venta.discount) : ''} />
      <CampoLectura label="Lista de precios" valor="General" />
      <CampoLectura label="Vendedor" valor={venta.vendedor} />
    </>
  ) : (
    <>
      <CampoLectura label="Cliente" valor={venta.cliente.replace(/\s*\(\s*NIT:[^)]*\)/i, '').trim()} />
      <CampoLectura label="Vendedor" valor={venta.vendedor} />
      <CampoLectura label="Lista de precios" valor="General" />
      <CampoLectura label="Descuento" valor={venta.discount > 0 ? formatCOP(venta.discount) : ''} />
      <CampoLectura label="Fecha de Emisión" valor={fmtFechaCorta(Date.now())} />
      <CampoLectura label={`Fecha del comprobante ${venta.numero}`} valor={fmtFechaCorta(venta.emitidaEn)} />
    </>
  );

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1200, margin: '0 auto 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>{titulo}</h1>
          <button onClick={() => setSaliendo(true)} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--black-60)' }}>
            <X size={22} />
          </button>
        </div>

        {/* Avisos y bloqueos del documento, arriba de la vista */}
        {(validacion?.bloqueos.length || validacion?.avisos.length || conflicto) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {conflicto && <Banner tipo="error">{conflicto}</Banner>}
            {validacion?.bloqueos.map(m => <Banner key={m} tipo="error">{m}</Banner>)}
            {validacion?.avisos.map(m => <Banner key={m} tipo="aviso">{m}</Banner>)}
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>{cabecera}</div>

        {/* Datos de la devolución, antes del alcance */}
        <DatosDevolucion
          inventario={inventario} onInventario={setInventario}
          motivos={motivosActivos} motivoId={motivoId} onMotivo={setMotivoId}
          metodos={ajustes.metodosPago.map(m => m.nombre)} metodoPago={metodoPago} onMetodo={setMetodoPago}
          justificacion={justificacion} onJustificacion={setJustificacion} errJustificacion={errJustificacion} intento={intento}
        />

        {/* Alcance de la devolución */}
        <div>
          <span style={{ ...labelStyle, fontSize: 13, color: 'var(--black-100)' }}>Alcance de la devolución</span>
          <div role="radiogroup" aria-label="Alcance de la devolución" style={{ display: 'flex', gap: 24 }}>
            {(['parcial', 'total'] as AlcanceDevolucion[]).map(a => {
              const deshabilitado = bloqueado || (a === 'total' && totalDeshabilitado);
              return (
                <label key={a} title={a === 'total' && totalDeshabilitado ? 'Este documento ya tuvo una devolución.' : undefined}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 13, fontWeight: 600, color: deshabilitado ? 'var(--black-40)' : 'var(--black-100)', cursor: deshabilitado ? 'not-allowed' : 'pointer' }}>
                  <input type="radio" name="alcance" checked={alcance === a} disabled={deshabilitado} onChange={() => cambiarAlcance(a)} style={{ accentColor: 'var(--blue-100)' }} />
                  {a === 'parcial' ? 'Parcial' : 'Total / Anular'}
                </label>
              );
            })}
          </div>
        </div>

        {/* Tabla de ítems: columnas del documento informativas + 3 columnas de devolución */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: conImpuesto ? 1120 : 980 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 36 }} />
                <th style={{ ...thStyle, width: 200 }}>Ítem</th>
                <th style={{ ...thStyle, width: 100 }}>Referencia</th>
                <th style={{ ...thStyle, width: 70 }}>Cantidad</th>
                {conImpuesto && <th style={{ ...thStyle, width: 110 }}>Impuesto</th>}
                <th style={{ ...thStyle, width: 100 }}>Precio</th>
                <th style={{ ...thStyle, width: 90 }}>Descuento</th>
                <th style={{ ...thStyle, width: 110 }}>Total</th>
                <th style={{ ...thStyle, width: 110 }}>Cantidad a devolver</th>
                <th style={{ ...thStyle, width: 150 }}>Valor de devolución</th>
              </tr>
            </thead>
            <tbody>
              {lineas.map(l => {
                const devuelto = yaDevuelto(l);
                const f = datos(l);
                const editable = f.marcado && !esTotal && !bloqueado;
                const err = f.marcado && !devuelto ? errorLinea(l) : {};
                const mostrarValorErr = err.valor && (err.valor === VALIDACION.valorMayorVenta || intento);
                const gris = devuelto ? { color: 'var(--black-40)' } : {};
                return (
                  <tr key={l.key} style={{ borderBottom: '1px solid var(--black-10)' }}>
                    <td style={tdStyle}>
                      <input type="checkbox" aria-label={`Devolver ${l.nombre}`} checked={f.marcado && !devuelto} disabled={devuelto || esTotal || bloqueado}
                        onChange={e => setFila(l, { marcado: e.target.checked })} style={{ accentColor: 'var(--blue-100)', width: 16, height: 16 }} />
                    </td>
                    <td style={{ ...tdStyle, ...gris }}>
                      {l.nombre}
                      {devuelto && <span style={{ display: 'block', marginTop: 2, fontSize: 11, fontWeight: 700, color: 'var(--coral-100)' }}>Ya devuelto</span>}
                    </td>
                    <td style={{ ...tdStyle, ...gris }}>{l.referencia || '--'}</td>
                    <td style={{ ...tdStyle, ...gris }}>{l.cantidadVendida}</td>
                    {conImpuesto && <td style={{ ...tdStyle, ...gris }}>{etiquetaImpuesto(l.impuestoId)}</td>}
                    <td style={{ ...tdStyle, ...gris }}>{formatCOP(l.precio)}</td>
                    <td style={{ ...tdStyle, ...gris }}>{l.descuento > 0 ? `${l.descuento}%` : '--'}</td>
                    <td style={{ ...tdStyle, ...gris }}>{formatCOP(l.valorVenta)}</td>
                    <td style={tdStyle}>
                      <input aria-label={`Cantidad a devolver de ${l.nombre}`} inputMode="numeric" disabled={!editable} value={f.marcado && !devuelto ? f.cantidad : ''}
                        onChange={e => cambiarCantidad(l, e.target.value)} style={{ ...inputStyle, ...(editable ? {} : { backgroundColor: 'var(--blue-10)' }), borderColor: intento && err.cantidad ? 'var(--coral-100)' : 'var(--black-10)' }} />
                      {intento && err.cantidad && <p style={errStyle}>{err.cantidad}</p>}
                    </td>
                    <td style={tdStyle}>
                      <input aria-label={`Valor de devolución de ${l.nombre}`} inputMode="numeric" disabled={!editable} value={f.marcado && !devuelto ? miles(f.valor) : ''}
                        onChange={e => setFila(l, { valor: soloDigitos(e.target.value), valorEditado: true })} style={{ ...inputStyle, ...(editable ? {} : { backgroundColor: 'var(--blue-10)' }), borderColor: mostrarValorErr ? 'var(--coral-100)' : 'var(--black-10)' }} />
                      {mostrarValorErr && <p style={errStyle}>{err.valor}</p>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <span style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-60)' }}>Total items {lineas.length}</span>
        <AvisosSinInventario nombres={sinInventario.map(l => l.nombre)} />
        {intento && seleccionadas.length === 0 && !bloqueado && <p style={errStyle}>Selecciona al menos un ítem para devolver.</p>}

        <TotalesDevolucion conImpuesto={conImpuesto} subtotal={resumen.subtotal} descuento={0} impuestos={resumen.impuestos} total={resumen.total} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 12, borderTop: '1px solid var(--black-10)' }}>
          <button className="btn btn-cancel" onClick={() => setSaliendo(true)}>Cancelar</button>
          <button className="btn btn-primary" onClick={confirmar} disabled={bloqueado || procesando}>Confirmar devolución</button>
        </div>
      </div>

      {/* Herramientas del prototipo (barra fija abajo) */}
      <PrototypeToolsBar>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <SelectorCasoDevolucion actual={`${tipo}-${esTotal ? 'total' : 'parcial'}`} ventaId={venta?.id} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--black-60)', cursor: 'pointer' }}>
          <input type="checkbox" checked={!turnoAbierto} onChange={e => setTurnoAbierto(!e.target.checked)} style={{ accentColor: 'var(--blue-100)' }} />
          Simular que no hay turno abierto
        </label>
        {esFactura && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--black-60)', cursor: 'pointer' }}>
            <input type="checkbox" checked={simularRechazo} onChange={e => setSimularRechazo(e.target.checked)} style={{ accentColor: 'var(--blue-100)' }} />
            Simular rechazo de la DIAN
          </label>
        )}
          </div>
        </div>
      </PrototypeToolsBar>

      {abriendoTurno && (
        <AbrirTurnoModal
          sucursal={ajustes.sucursales.find(s => s.id === sucursalId)?.nombre ?? ''}
          onCancel={() => { setAbriendoTurno(false); salir(); }}
          onOpen={() => { setTurnoAbierto(true); setAbriendoTurno(false); }}
        />
      )}
      {saliendo && (
        <ConfirmDeleteModal
          title="¿Salir de la devolución?" message="Si sales, se perderá la información ingresada."
          confirmLabel="Salir" cancelLabel="Continuar" onCancel={() => setSaliendo(false)} onConfirm={salir}
        />
      )}
    </div>
  );
}
