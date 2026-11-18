/**
 * RegistrarDevolucionModal — flujo por pasos de "Registrar Devolución" (specs/2026-11-devoluciones.md §6).
 * Paso 1: tipo y documento · Paso 2: ítems · Paso 3: inventario, motivo, método de pago y justificación.
 * No se puede volver a un paso anterior; cerrar en cualquier paso pide confirmación.
 */
import React, { useMemo, useState } from 'react';
import { Search, Trash2, X, Info, AlertTriangle, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAjustes } from '../../../store/ajustesStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import { useItems } from '../../../store/itemsStore';
import { useVentas } from '../../../store/ventasStore';
import { useCatalog } from '../../../vertical';
import { useContactos } from '../../../store/contactosStore';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import type { Devolucion, TipoDevolucion } from '../../../types/devolucion';
import { TIPO_DEVOLUCION_LABEL } from '../../../types/devolucion';
import type { Venta } from '../../../types/venta';
import { getVarianteLabel, getVariantes } from '../../../types/item';
import { formatCOP } from '../../../utils/format';
import { fmtFechaHora, SESION_VENTAS } from '../../../utils/ventas';
import {
  EFECTIVO_CAJA_EJEMPLO, VALIDACION, desglosarImpuesto, etiquetaImpuesto, impuestoPorTasa, resumirImpuestos, coincideBusquedaDocumento, documentoDeCliente, errorJustificacion, itemDeLinea, manejaInventarioEn, mismaSucursal,
  sucursalDeItems, sucursalesDelUsuario, usuarioSesion, validarDocumento, valorUnitarioPagado,
} from '../../../utils/devoluciones';
import { getImpuesto } from '../../../data/itemsCatalogs';
import { VENTA_EJEMPLO_CONFLICTO } from '../../../data/retail/ventasSeed';

const FONT = "'Montserrat', sans-serif";
const CONFLICTO_KEY = 'bold-pos:devoluciones-conflicto-demo:v1';
export const MSG_CONFLICTO = 'Este ítem ya fue devuelto. Actualiza la información e inténtalo de nuevo.';

type Paso = 'tipo' | 'items' | 'detalle';

/** Una línea del documento o un ítem agregado en Sin Documento. */
interface Linea {
  key: string;
  itemId: string;
  nombre: string;
  categoriaId: string;
  /** Valor unitario pagado (documento) o precio del ítem (Sin Documento). */
  unitario: number;
  /** Máximo a devolver (cantidad vendida); sin tope en Sin Documento. */
  maxCantidad?: number;
  maneja: boolean;
  /** Impuesto del ítem y su tasa. */
  impuestoId: string;
  tasa: number;
  /** Para devolver el stock a una variante concreta (Sin Documento). */
  itemRefId?: string;
  variantId?: string;
}

interface Fila { marcado: boolean; cantidad: string; valor: string; valorEditado: boolean }

const soloDigitos = (s: string) => s.replace(/\D/g, '');
const num = (s: string) => (s === '' ? 0 : parseInt(s, 10));
/** Valor digitado con separador de miles ("1250000" → "1.250.000"). */
const miles = (s: string) => (s === '' ? '' : num(s).toLocaleString('es-CO'));
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--black-100)', marginBottom: 6 };
const errStyle: React.CSSProperties = { fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' };
const thStyle: React.CSSProperties = { padding: '8px 10px 8px 0', textAlign: 'left', fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'var(--black-100)', borderBottom: '2px solid var(--black-10)', whiteSpace: 'normal', lineHeight: '16px', verticalAlign: 'bottom', overflowWrap: 'anywhere' };
const tdStyle: React.CSSProperties = { padding: '10px 10px 10px 0', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', verticalAlign: 'top' };

function Banner({ tipo, children }: { tipo: 'error' | 'aviso' | 'info'; children: React.ReactNode }) {
  const color = tipo === 'error' ? 'var(--coral-100)' : 'var(--blue-100)';
  const bg = tipo === 'error' ? 'var(--coral-10)' : 'var(--blue-10)';
  const Icono = tipo === 'error' ? CircleAlert : tipo === 'aviso' ? AlertTriangle : Info;
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, backgroundColor: bg, marginTop: 8 }}>
      <Icono size={16} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)' }}>{children}</span>
    </div>
  );
}

/** Impuesto del ítem sobre el valor de devolución (que lo incluye): monto y tipo. */
function CeldaImpuesto({ linea, valor }: { linea: Linea; valor: number | null }) {
  if (valor === null) return <span style={{ color: 'var(--black-40)' }}>—</span>;
  return (
    <div>
      <div>{formatCOP(desglosarImpuesto(valor, linea.tasa).impuesto)}</div>
      <div style={{ fontSize: 11, color: 'var(--black-60)' }}>{etiquetaImpuesto(linea.impuestoId)}</div>
    </div>
  );
}

export function RegistrarDevolucionModal({ onClose }: { onClose: () => void }) {
  const { ajustes } = useAjustes();
  const { devoluciones, siguienteNumero, siguienteNotaCredito, agregar } = useDevoluciones();
  const { items, ajustarExistencia } = useItems();
  const { ventas } = useVentas();
  const { allProducts } = useCatalog();
  const { contactos } = useContactos();

  const usuario = usuarioSesion(ajustes);
  const sucursalesUsuario = useMemo(() => sucursalesDelUsuario(ajustes), [ajustes]);
  const responsable = `${usuario.nombre} ${usuario.apellido}`;

  const [paso, setPaso] = useState<Paso>('tipo');
  const [saliendo, setSaliendo] = useState(false);
  const [tipo, setTipo] = useState<TipoDevolucion>('factura');
  const [busqueda, setBusqueda] = useState('');
  /** Texto con el que se ejecutó la última búsqueda (se aplica al pulsar "Buscar"; no se filtra mientras se escribe). */
  const [consulta, setConsulta] = useState('');
  const [venta, setVenta] = useState<Venta | null>(null);
  const [filas, setFilas] = useState<Record<string, Fila>>({});
  const [agregados, setAgregados] = useState<Linea[]>([]);
  const [buscarItem, setBuscarItem] = useState('');
  const [intentoItems, setIntentoItems] = useState(false);
  const [inventario, setInventario] = useState<'si' | 'no'>('si');
  const [motivoId, setMotivoId] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [intentoDetalle, setIntentoDetalle] = useState(false);
  const [conflicto, setConflicto] = useState('');

  const conDocumento = tipo !== 'sinDocumento';
  /** Solo la Factura discrimina impuestos: Comprobante y Sin Documento no tienen tratamiento de IVA. */
  const conImpuesto = tipo === 'factura';

  // ── Sucursal del documento (o del usuario, en Sin Documento) ──────────────
  const sucursalId = useMemo(() => {
    if (conDocumento && venta) return ajustes.sucursales.find(s => mismaSucursal(s.nombre, venta.sucursal))?.id ?? usuario.sucursalId;
    return usuario.sucursalId;
  }, [conDocumento, venta, ajustes.sucursales, usuario.sucursalId]);
  const sucursalItems = sucursalDeItems(sucursalId);
  const categoriaDe = (productId: string) => allProducts.find(p => String(p.id) === productId)?.catId ?? 'accesorios';

  // ── Paso 1: documentos candidatos ─────────────────────────────────────────
  const candidatos = useMemo(() => {
    if (!conDocumento || !consulta) return [];
    return ventas
      .filter(v => v.tipoDoc === tipo && coincideBusquedaDocumento(v, consulta, contactos) && sucursalesUsuario.some(s => mismaSucursal(s.nombre, v.sucursal)))
      .slice(0, 8);
  }, [ventas, tipo, consulta, conDocumento, sucursalesUsuario, contactos]);

  const buscar = () => { setConsulta(busqueda.trim()); setVenta(null); };

  const validacion = venta ? validarDocumento(venta) : null;

  // ── Líneas del documento ──────────────────────────────────────────────────
  const lineasDocumento: Linea[] = useMemo(() => {
    if (!venta) return [];
    return venta.items.map((it, idx) => {
      // El impuesto lo trae el ítem; si la línea no corresponde a un ítem del catálogo, se usa el del documento.
      const propio = itemDeLinea(items, it);
      const imp = propio ? getImpuesto(propio.impuestoId) : undefined;
      return {
        key: String(idx), itemId: it.id, nombre: it.name, categoriaId: categoriaDe(it.id),
        unitario: valorUnitarioPagado(it, venta.taxRate), maxCantidad: it.quantity,
        maneja: manejaInventarioEn(propio, sucursalItems),
        impuestoId: imp?.id ?? impuestoPorTasa(venta.taxRate), tasa: imp?.rate ?? venta.taxRate,
      };
    });
  }, [venta, items, sucursalItems, allProducts]); // eslint-disable-line react-hooks/exhaustive-deps

  const yaDevuelto = (l: Linea) => !!venta && devoluciones.some(d => d.ventaId === venta.id && d.itemId === l.itemId);

  const lineas: Linea[] = conDocumento ? lineasDocumento : agregados;
  const seleccionadas = conDocumento ? lineas.filter(l => filas[l.key]?.marcado && !yaDevuelto(l)) : lineas;
  const datos = (l: Linea) => filas[l.key] ?? { marcado: false, cantidad: '1', valor: String(l.unitario), valorEditado: false };

  const setFila = (l: Linea, patch: Partial<Fila>) => setFilas(p => ({ ...p, [l.key]: { ...datos(l), ...patch } }));
  const cambiarCantidad = (l: Linea, texto: string) => {
    let c = soloDigitos(texto);
    if (l.maxCantidad && num(c) > l.maxCantidad) c = String(l.maxCantidad);
    const f = datos(l);
    setFila(l, { cantidad: c, ...(f.valorEditado ? {} : { valor: String(l.unitario * num(c)) }) });
  };

  // ── Sin Documento: catálogo completo ──────────────────────────────────────
  const catalogo = useMemo(() => {
    const out: Linea[] = [];
    items.filter(i => i.activo && !i.esCombo).forEach(i => {
      const vars = getVariantes(i);
      if (vars) {
        vars.filter(v => v.activo).forEach(v => out.push({
          key: `${i.id}::${v.id}`, itemId: `${i.id}::${v.id}`, nombre: `${i.nombre} - ${getVarianteLabel(v)}`, categoriaId: i.categoriaId,
          unitario: v.precioTotal, maneja: v.sucursales.some(s => s.sucursalId === sucursalItems) && i.manejaExistencias, itemRefId: i.id, variantId: v.id,
          impuestoId: i.impuestoId, tasa: getImpuesto(i.impuestoId)?.rate ?? 0,
        }));
      } else {
        out.push({ key: i.id, itemId: i.id, nombre: i.nombre, categoriaId: i.categoriaId, unitario: i.precioTotal, maneja: manejaInventarioEn(i, sucursalItems), itemRefId: i.id, impuestoId: i.impuestoId, tasa: getImpuesto(i.impuestoId)?.rate ?? 0 });
      }
    });
    return out;
  }, [items, sucursalItems]);

  const resultadosItems = useMemo(() => {
    const q = norm(buscarItem.trim());
    return q ? catalogo.filter(l => norm(l.nombre).includes(q)).slice(0, 8) : [];
  }, [catalogo, buscarItem]);

  const agregarItem = (l: Linea) => {
    if (agregados.some(a => a.key === l.key)) return;
    setAgregados(p => [...p, l]);
    setFilas(p => ({ ...p, [l.key]: { marcado: true, cantidad: '1', valor: String(l.unitario), valorEditado: false } }));
    setBuscarItem('');
  };
  const quitarItem = (l: Linea) => setAgregados(p => p.filter(a => a.key !== l.key));

  // ── Navegación de pasos ───────────────────────────────────────────────────
  const errorFila = (l: Linea): { cantidad?: string; valor?: string } => {
    const f = datos(l);
    // Con documento, el valor a devolver no puede superar el valor de venta (lo pagado por esa cantidad); menor sí se permite.
    const mayorVenta = conDocumento && num(f.valor) > l.unitario * num(f.cantidad);
    return {
      cantidad: num(f.cantidad) > 0 ? undefined : VALIDACION.cantidad,
      valor: num(f.valor) <= 0 ? VALIDACION.valor : mayorVenta ? VALIDACION.valorMayorVenta : undefined,
    };
  };

  const puedeSiguientePaso1 = !conDocumento || (!!venta && (validacion?.bloqueos.length ?? 0) === 0);

  const siguiente = () => {
    if (paso === 'tipo') { setPaso('items'); return; }
    if (paso === 'items') {
      setIntentoItems(true);
      if (seleccionadas.length === 0) return;
      if (seleccionadas.some(l => errorFila(l).cantidad || errorFila(l).valor)) return;
      setConflicto('');
      setPaso('detalle');
    }
  };

  // ── Paso 3 ────────────────────────────────────────────────────────────────
  const hayInventario = seleccionadas.some(l => l.maneja);
  const motivosActivos = [...ajustes.motivosDevolucion].filter(m => m.activo).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  const resumen = resumirImpuestos(seleccionadas.map(l => ({ impuestoId: l.impuestoId, tasa: l.tasa, valor: num(datos(l).valor) })));
  const total = resumen.total;
  const errJustificacion = errorJustificacion(justificacion);
  const sinEfectivo = metodoPago === 'Efectivo' && total > EFECTIVO_CAJA_EJEMPLO;

  const confirmar = () => {
    setIntentoDetalle(true);
    if (!motivoId || !metodoPago || errJustificacion) return;

    // Conflicto: otro usuario ya devolvió alguno de los ítems (simulado una vez en el documento de ejemplo).
    if (conDocumento && venta) {
      let demoDisparada = false;
      try { demoDisparada = localStorage.getItem(CONFLICTO_KEY) === '1'; } catch { /* ignore */ }
      if (venta.id === VENTA_EJEMPLO_CONFLICTO && !demoDisparada) {
        const l = seleccionadas[0];
        try { localStorage.setItem(CONFLICTO_KEY, '1'); } catch { /* ignore */ }
        agregar([{
          id: `dev-conflicto-${Date.now()}`, numero: siguienteNumero(), fecha: Date.now(), sucursalId, turno: SESION_VENTAS.retail.turno,
          responsable: 'Camila Rojas', tipo, ventaId: venta.id, numeroDocumento: venta.numero, fechaVenta: venta.emitidaEn, valorVenta: venta.total,
          itemId: l.itemId, nombre: l.nombre, categoriaId: l.categoriaId, cantidad: 1, valorDevolucion: l.unitario, metodoPago: 'Efectivo',
          motivoId: 'mot-4', justificacion: 'Devolución registrada por otro usuario.', ingresaInventario: false, ...(conImpuesto ? { impuestoId: l.impuestoId, tasaImpuesto: l.tasa } : {}), ejemplo: true,
        }]);
        reiniciarSeleccion();
        return;
      }
      if (seleccionadas.some(yaDevuelto)) { reiniciarSeleccion(); return; }
    }

    const numero = siguienteNumero();
    const notaCredito = tipo === 'factura' ? siguienteNotaCredito() : undefined;
    const ahora = Date.now();
    const ingresa = hayInventario && inventario === 'si';
    const nuevas: Devolucion[] = seleccionadas.map((l, j) => ({
      id: `dev-${numero}-${j}-${ahora}`, numero, fecha: ahora, sucursalId, turno: SESION_VENTAS.retail.turno, responsable, tipo,
      ...(venta && conDocumento ? { ventaId: venta.id, numeroDocumento: venta.numero, fechaVenta: venta.emitidaEn, valorVenta: venta.total } : {}),
      itemId: l.itemId, nombre: l.nombre, categoriaId: l.categoriaId, cantidad: num(datos(l).cantidad), valorDevolucion: num(datos(l).valor),
      ...(conDocumento ? { valorVentaItem: l.unitario * num(datos(l).cantidad) } : {}),
      metodoPago, motivoId, justificacion: justificacion.trim(), ingresaInventario: ingresa && l.maneja, ...(conImpuesto ? { impuestoId: l.impuestoId, tasaImpuesto: l.tasa } : {}), ...(notaCredito ? { notaCredito } : {}),
    }));
    agregar(nuevas);

    // Ingreso al inventario: suma el stock de los ítems inventariables en la sucursal del documento.
    if (ingresa) {
      seleccionadas.filter(l => l.maneja).forEach(l => {
        const cantidad = num(datos(l).cantidad);
        if (conDocumento) {
          const it = itemDeLinea(items, venta!.items[Number(l.key)]);
          if (it) ajustarExistencia(it.id, sucursalItems, cantidad);
        } else if (l.itemRefId) {
          ajustarExistencia(l.itemRefId, sucursalItems, cantidad, l.variantId);
        }
      });
    }
    toast.success('Devolución registrada correctamente.');
    onClose();
  };

  /** Tras un conflicto: se desmarcan los ítems (ya aparecen como "Ya devuelto") y se vuelve a elegirlos. */
  const reiniciarSeleccion = () => {
    setFilas({});
    setIntentoItems(false);
    setIntentoDetalle(false);
    setConflicto(MSG_CONFLICTO);
    setPaso('items');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const numeroPaso = paso === 'tipo' ? 1 : paso === 'items' ? 2 : 3;

  return (
    <>
      <div className="fixed inset-0 z-[290] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div
          role="dialog" aria-modal="true" aria-label="Registrar Devolución" className="bg-white rounded-[var(--radius-20)] w-full mx-4"
          style={{ maxWidth: 960, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px 12px' }}>
            <div>
              <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Registrar Devolución</h3>
              <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--black-60)' }}>Paso {numeroPaso} de 3</span>
            </div>
            <button onClick={() => setSaliendo(true)} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--black-60)' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: '8px 32px 16px', overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
            {conflicto && paso === 'items' && <Banner tipo="error">{conflicto}</Banner>}

            {/* ── Paso 1 ── */}
            {paso === 'tipo' && (
              <div>
                <label style={labelStyle}>Tipo de devolución</label>
                <div role="radiogroup" aria-label="Tipo de devolución" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(Object.keys(TIPO_DEVOLUCION_LABEL) as TipoDevolucion[]).map(t => (
                    <button
                      key={t} role="radio" aria-checked={tipo === t}
                      onClick={() => { setTipo(t); setBusqueda(''); setConsulta(''); setVenta(null); }}
                      style={{
                        padding: '10px 18px', borderRadius: 100, cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600,
                        border: `1.5px solid ${tipo === t ? 'var(--blue-100)' : 'var(--black-10)'}`,
                        backgroundColor: tipo === t ? 'var(--blue-10)' : '#fff', color: tipo === t ? 'var(--blue-100)' : 'var(--black-60)',
                      }}
                    >
                      {TIPO_DEVOLUCION_LABEL[t]}
                    </button>
                  ))}
                </div>

                {conDocumento ? (
                  <div style={{ marginTop: 20 }}>
                    <label style={labelStyle}>Número de {tipo === 'factura' ? 'la factura' : 'el comprobante'} o identificación del cliente</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div className="filter-pill" style={{ height: 44, flex: 1 }}>
                        <Search size={16} color="var(--blue-50)" />
                        <input
                          value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') buscar(); }}
                          placeholder="Escribe el número o la identificación del cliente"
                          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT, fontSize: 13, fontWeight: 500 }}
                        />
                      </div>
                      <button className="btn btn-primary" onClick={buscar} disabled={!busqueda.trim()} style={{ height: 44 }}>Buscar</button>
                    </div>
                    {consulta && candidatos.length === 0 && (
                      <p style={{ ...errStyle, color: 'var(--black-60)' }}>No hay resultados para los filtros o la búsqueda.</p>
                    )}
                    {candidatos.length > 0 && (
                      <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, border: '1px solid var(--black-10)', borderRadius: 12, overflow: 'hidden' }}>
                        {candidatos.map(v => (
                          <li key={v.id}>
                            <button
                              onClick={() => setVenta(v)}
                              style={{
                                width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13,
                                backgroundColor: venta?.id === v.id ? 'var(--blue-10)' : '#fff', borderBottom: '1px solid var(--black-10)',
                              }}
                            >
                              <strong>{v.numero}</strong> · {v.cliente}{documentoDeCliente(v, contactos) && !/NIT/i.test(v.cliente) && ` (${documentoDeCliente(v, contactos)})`} · {fmtFechaHora(v.emitidaEn)} · {formatCOP(v.total)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {validacion && validacion.bloqueos.map(m => <Banner key={m} tipo="error">{m}</Banner>)}
                    {validacion && validacion.avisos.map(m => <Banner key={m} tipo="aviso">{m}</Banner>)}
                  </div>
                ) : (
                  <Banner tipo="info">Sin documento: elegirás libremente los ítems a devolver y no se generará ninguna nota crédito.</Banner>
                )}
              </div>
            )}

            {/* ── Paso 2: con documento ── */}
            {paso === 'items' && conDocumento && venta && (
              <div>
                <p style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-60)', margin: '0 0 8px' }}>
                  {TIPO_DEVOLUCION_LABEL[tipo]} <strong>{venta.numero}</strong> · {fmtFechaHora(venta.emitidaEn)}
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, width: 28 }} />
                      <th style={thStyle}>Ítem</th>
                      <th style={{ ...thStyle, width: 74 }}>Cant. vendida</th>
                      <th style={{ ...thStyle, width: 84 }}>Cant. a devolver</th>
                      <th style={{ ...thStyle, width: 104 }}>Valor unitario pagado</th>
                      <th style={{ ...thStyle, width: 130 }}>Valor de devolución</th>
                      {conImpuesto && <th style={{ ...thStyle, width: 104 }}>Impuesto</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {lineasDocumento.map(l => {
                      const bloqueado = yaDevuelto(l);
                      const f = datos(l);
                      const err = errorFila(l);
                      return (
                        <tr key={l.key} style={{ borderBottom: '1px solid var(--black-10)', opacity: bloqueado ? 0.55 : 1 }}>
                          <td style={tdStyle}>
                            {!bloqueado && (
                              <input type="checkbox" checked={f.marcado} aria-label={`Devolver ${l.nombre}`}
                                onChange={e => setFila(l, { marcado: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--blue-100)' }} />
                            )}
                          </td>
                          <td style={tdStyle}>
                            {l.nombre}
                            {bloqueado && <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 100, backgroundColor: 'var(--black-10)', fontSize: 11, fontWeight: 700 }}>Ya devuelto</span>}
                          </td>
                          <td style={tdStyle}>{l.maxCantidad}</td>
                          <td style={tdStyle}>
                            <input className="merlin-input-filled" inputMode="numeric" value={f.cantidad} disabled={!f.marcado || bloqueado}
                              onChange={e => cambiarCantidad(l, e.target.value)} aria-label={`Cantidad de ${l.nombre}`} style={{ width: '100%', boxSizing: 'border-box' }} />
                            {intentoItems && f.marcado && err.cantidad && <p style={errStyle}>{err.cantidad}</p>}
                          </td>
                          <td style={tdStyle}>{formatCOP(l.unitario)}</td>
                          <td style={tdStyle}>
                            <input className="merlin-input-filled" inputMode="numeric" value={miles(f.valor)} disabled={!f.marcado || bloqueado}
                              onChange={e => setFila(l, { valor: soloDigitos(e.target.value), valorEditado: true })} aria-label={`Valor de devolución de ${l.nombre}`} style={{ width: '100%', boxSizing: 'border-box' }} />
                            {f.marcado && err.valor && (intentoItems || err.valor === VALIDACION.valorMayorVenta) && <p style={errStyle}>{err.valor}</p>}
                          </td>
                          {conImpuesto && <td style={tdStyle}><CeldaImpuesto linea={l} valor={f.marcado && !bloqueado ? num(f.valor) : null} /></td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Paso 2: Sin Documento ── */}
            {paso === 'items' && !conDocumento && (
              <div>
                <label style={labelStyle}>Agregar ítem</label>
                <div className="filter-pill" style={{ height: 44 }}>
                  <Search size={16} color="var(--blue-50)" />
                  <input value={buscarItem} onChange={e => setBuscarItem(e.target.value)} placeholder="Busca un ítem o variante del catálogo"
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT, fontSize: 13, fontWeight: 500 }} />
                </div>
                {resultadosItems.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, border: '1px solid var(--black-10)', borderRadius: 12, overflow: 'hidden' }}>
                    {resultadosItems.map(l => {
                      const ya = agregados.some(a => a.key === l.key);
                      return (
                        <li key={l.key}>
                          <button onClick={() => agregarItem(l)} disabled={ya}
                            style={{ width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', borderBottom: '1px solid var(--black-10)', cursor: ya ? 'default' : 'pointer', fontFamily: FONT, fontSize: 13, backgroundColor: '#fff', color: ya ? 'var(--black-40)' : 'var(--black-100)' }}>
                            {l.nombre} · {formatCOP(l.unitario)} {ya && '· Ya agregado'}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {agregados.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Ítem</th>
                          <th style={{ ...thStyle, width: 84 }}>Cantidad</th>
                          <th style={{ ...thStyle, width: 130 }}>Valor de devolución</th>
                          {conImpuesto && <th style={{ ...thStyle, width: 104 }}>Impuesto</th>}
                          <th style={{ ...thStyle, width: 36 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {agregados.map(l => {
                          const f = datos(l);
                          const err = errorFila(l);
                          return (
                            <tr key={l.key} style={{ borderBottom: '1px solid var(--black-10)' }}>
                              <td style={tdStyle}>{l.nombre}</td>
                              <td style={tdStyle}>
                                <input className="merlin-input-filled" inputMode="numeric" value={f.cantidad} onChange={e => cambiarCantidad(l, e.target.value)}
                                  aria-label={`Cantidad de ${l.nombre}`} style={{ width: '100%', boxSizing: 'border-box' }} />
                                {intentoItems && err.cantidad && <p style={errStyle}>{err.cantidad}</p>}
                              </td>
                              <td style={tdStyle}>
                                <input className="merlin-input-filled" inputMode="numeric" value={miles(f.valor)}
                                  onChange={e => setFila(l, { valor: soloDigitos(e.target.value), valorEditado: true })} aria-label={`Valor de devolución de ${l.nombre}`} style={{ width: '100%', boxSizing: 'border-box' }} />
                                {intentoItems && err.valor && <p style={errStyle}>{err.valor}</p>}
                              </td>
                              {conImpuesto && <td style={tdStyle}><CeldaImpuesto linea={l} valor={num(f.valor)} /></td>}
                              <td style={tdStyle}>
                                <button onClick={() => quitarItem(l)} aria-label={`Quitar ${l.nombre}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black-60)', display: 'flex' }}>
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Paso 3 ── */}
            {paso === 'detalle' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {hayInventario && (
                  <div>
                    <label style={labelStyle}>¿Los ítems devueltos ingresan al inventario?</label>
                    <div role="radiogroup" aria-label="Ingreso al inventario" style={{ display: 'flex', gap: 16 }}>
                      {(['si', 'no'] as const).map(v => (
                        <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                          <input type="radio" name="inventario" checked={inventario === v} onChange={() => setInventario(v)} style={{ accentColor: 'var(--blue-100)' }} />
                          {v === 'si' ? 'Sí' : 'No'}
                        </label>
                      ))}
                    </div>
                    {seleccionadas.filter(l => !l.maneja).map(l => (
                      <p key={l.key} style={{ fontFamily: FONT, fontSize: 12, color: 'var(--black-60)', margin: '6px 0 0' }}>
                        {l.nombre}: Este ítem no maneja inventario en esta sucursal.
                      </p>
                    ))}
                  </div>
                )}

                <div>
                  <label style={labelStyle} htmlFor="dev-motivo">Motivo</label>
                  <select id="dev-motivo" className="merlin-input-filled" value={motivoId} onChange={e => setMotivoId(e.target.value)} style={{ width: '100%' }}>
                    <option value="">Selecciona...</option>
                    {motivosActivos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                  {intentoDetalle && !motivoId && <p style={errStyle}>{VALIDACION.motivo}</p>}
                </div>

                <div>
                  <label style={labelStyle} htmlFor="dev-metodo">Método de pago</label>
                  <select id="dev-metodo" className="merlin-input-filled" value={metodoPago} onChange={e => setMetodoPago(e.target.value)} style={{ width: '100%' }}>
                    <option value="">Selecciona...</option>
                    {ajustes.metodosPago.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
                  </select>
                  {intentoDetalle && !metodoPago && <p style={errStyle}>{VALIDACION.metodo}</p>}
                  {sinEfectivo && <Banner tipo="aviso">El efectivo disponible en caja es menor al valor de la devolución.</Banner>}
                </div>

                <div>
                  <label style={labelStyle} htmlFor="dev-just">Justificación</label>
                  <textarea id="dev-just" className="merlin-input-filled" rows={3} maxLength={250} value={justificacion} onChange={e => setJustificacion(e.target.value)}
                    style={{ width: '100%', resize: 'vertical', fontFamily: FONT }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {intentoDetalle && errJustificacion ? <p style={errStyle}>{errJustificacion}</p> : <span />}
                    <span style={{ fontFamily: FONT, fontSize: 12, color: 'var(--black-60)' }}>{justificacion.length}/250</span>
                  </div>
                </div>

                {tipo === 'factura' && <Banner tipo="info">Se creará una nota crédito por el valor de los ítems devueltos.</Banner>}
                <div style={{ fontFamily: FONT, fontSize: 13, borderTop: '1px solid var(--black-10)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 320, alignSelf: 'flex-end', width: '100%' }}>
                  {conImpuesto && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{formatCOP(resumen.subtotal)}</span></div>
                      {resumen.impuestos.map(i => (
                        <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{i.etiqueta}</span><span>{formatCOP(i.monto)}</span></div>
                      ))}
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}><span>Total a devolver</span><span>{formatCOP(total)}</span></div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '12px 32px 24px', borderTop: '1px solid var(--black-10)' }}>
            <button className="btn btn-cancel" onClick={() => setSaliendo(true)}>Cancelar</button>
            {paso === 'detalle'
              ? <button className="btn btn-primary" onClick={confirmar}>Confirmar devolución</button>
              : <button className="btn btn-primary" onClick={siguiente} disabled={paso === 'tipo' ? !puedeSiguientePaso1 : seleccionadas.length === 0}>Siguiente</button>}
          </div>
        </div>
      </div>

      {saliendo && (
        <ConfirmDeleteModal
          title="¿Salir de la devolución?" message="Si sales, se perderá la información ingresada."
          confirmLabel="Salir" cancelLabel="Continuar" onCancel={() => setSaliendo(false)} onConfirm={onClose}
        />
      )}
    </>
  );
}
