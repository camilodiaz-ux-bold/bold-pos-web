/**
 * ReportesCaja — Cotizaciones, Notas Crédito, Notas Débito, Ingresos y Egresos, Cierre de Caja y Cierre de Caja
 * Gerencial (specs/2026-10-reportes-retail.md §5.1–§5.3). Cotizaciones, notas, recibos y gastos salen de las
 * semillas PROVISIONALES de data/retail/reportesSeed.ts; las ventas, de ventasStore. Lista de precios es solo visual.
 */
import React, { useMemo, useState } from 'react';
import { useAjustes } from '../../../store/ajustesStore';
import { useContactos } from '../../../store/contactosStore';
import { useItems } from '../../../store/itemsStore';
import { useVentas } from '../../../store/ventasStore';
import { useCatalog } from '../../../vertical';
import { VentaBadge } from '../../../components/ventas/VentaBadge';
import { agregarGananciasPorItems } from '../../../utils/gananciasPorItems';
import { isoDia, opciones } from '../../../utils/ventas';
import { metodosHabilitados } from '../../../utils/ajustes';
import { cotizacionesSeed, gastosSeed, notasSeed, recibosSeed, type Cotizacion, type NotaElectronica } from '../../../data/retail/reportesSeed';
import {
  cierreCaja, cierreGerencial, filasCotizaciones, filasIngresosEgresos, filasNotas, fmtFechaCierre, resumenCotizaciones, resumenIngresosEgresos,
  type FiltrosCierre, type FiltrosCotizaciones, type FiltrosGerencial, type FiltrosIngresosEgresos, type FiltrosNotas, type TotalesPorMetodo,
} from '../../../utils/reportesCaja';
import {
  FiltroCheck, FiltroFechas, FiltroRadio, FiltroSelect, FiltroTexto, MFONT, ReporteShell, fmtDinero, opcionesTodos, useFiltrosReporte, type Columna,
} from './ReporteShell';

const INICIO = '2026-09-01';
const hoy = () => isoDia(Date.now());
const fecha = (ms: number) => isoDia(ms).split('-').reverse().join('/');

/** Datos y opciones compartidos: ventas reales + semillas provisionales armadas con los nombres del prototipo. */
function useDatosCaja() {
  const { ventas } = useVentas();
  const { contactos } = useContactos();
  const { ajustes } = useAjustes();

  return useMemo(() => {
    const docs = ventas.filter(v => v.estado !== 'abierta');
    const clientes = opciones(docs, v => v.cliente);
    const usuarios = opciones(docs, v => v.emitidoPor);
    const vendedores = Array.from(new Set([...ajustes.vendedores.map(v => v.nombre), ...opciones(docs, v => v.vendedor)]));
    const sucursales = ajustes.sucursales.map(s => s.nombre);
    return {
      ventas, sucursales, usuarios, vendedores, clientes,
      cotizaciones: cotizacionesSeed({ clientes, vendedores, sucursales, usuarios }),
      notas: notasSeed(ventas),
      recibos: recibosSeed(ventas),
      gastos: gastosSeed({
        proveedores: contactos.filter(c => c.esProveedor).map(c => c.nombre), categorias: ajustes.categoriasGastos.map(c => c.nombre),
        metodos: metodosHabilitados(ajustes), usuarios, sucursales,
      }),
      metodos: metodosHabilitados(ajustes),
      listasPrecios: ajustes.listasPrecios.map(l => l.nombre),
    };
  }, [ventas, contactos, ajustes]);
}

// ─── Cotizaciones ────────────────────────────────────────────────────────────

const COT_INICIAL: FiltrosCotizaciones = { estado: 'Todos', cliente: 'Todos', vendedor: 'Todos', usuario: 'Todos', sucursal: 'Todos', codigo: '', desde: INICIO, hasta: '' };

export function ReporteCotizaciones() {
  const d = useDatosCaja();
  const [lista, setLista] = useState('Todos');
  const inicial = useMemo(() => ({ ...COT_INICIAL, hasta: hoy() }), []);
  const r = useFiltrosReporte(inicial);

  const filas = useMemo(() => (r.aplicados ? filasCotizaciones(d.cotizaciones, r.aplicados) : []), [r.aplicados, d.cotizaciones]);
  const resumen = resumenCotizaciones(filas);

  const columnas: Columna<Cotizacion>[] = [
    { label: 'Fecha', render: c => fecha(c.fecha) },
    { label: 'Código', render: c => c.codigo },
    { label: 'Sucursal', render: c => c.sucursal },
    { label: 'Usuario', render: c => c.usuario },
    { label: 'Vendedor', render: c => c.vendedor },
    { label: 'Cliente', render: c => c.cliente },
    { label: 'Descuento', render: c => (c.descuento ? fmtDinero(c.descuento) : '--') },
    { label: 'Subtotal', render: c => fmtDinero(c.subtotal) },
    { label: 'Total', render: c => fmtDinero(c.total) },
    { label: 'Estado', render: c => <VentaBadge label={c.estado} variant={c.estado === 'Anulada' ? 'error' : c.estado === 'No facturada' ? 'warning' : 'success'} /> },
  ];

  return (
    <ReporteShell
      titulo="Reporte Cotizaciones" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      generarLabel="GENERAR" excelLabel="EXPORTAR" sinLimpiar
      filtros={<>
        <FiltroFechas desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
        <FiltroSelect label="Todos..." options={['Todos', 'No facturada', 'Facturada', 'Anulada', 'Pagada']} value={r.filtros.estado} onChange={r.set('estado')} />
        <FiltroSelect label="Todos los clientes" options={opcionesTodos(d.cotizaciones.map(c => c.cliente))} value={r.filtros.cliente} onChange={r.set('cliente')} />
        <FiltroSelect label="Selecciona vendedor..." options={opcionesTodos(d.cotizaciones.map(c => c.vendedor))} value={r.filtros.vendedor} onChange={r.set('vendedor')} />
        <FiltroSelect label="Todos los usuarios" options={opcionesTodos(d.cotizaciones.map(c => c.usuario))} value={r.filtros.usuario} onChange={r.set('usuario')} />
        <FiltroSelect label="Todas las sucursales" options={['Todos', ...d.sucursales]} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
        <FiltroTexto placeholder="Buscar por código" value={r.filtros.codigo} onChange={r.set('codigo')} />
        <FiltroSelect label="Buscar por lista de precios" options={['Todos', ...d.listasPrecios]} value={lista} onChange={setLista} />
      </>}
      tarjetas={[
        { label: 'Descuento', value: fmtDinero(resumen.descuento) }, { label: 'Subtotal', value: fmtDinero(resumen.subtotal) }, { label: 'Total', value: fmtDinero(resumen.total) },
      ]}
      columnas={columnas} filas={filas} rowKey={c => c.id}
    />
  );
}

// ─── Notas crédito y débito ──────────────────────────────────────────────────

function ReporteNotas({ tipo }: { tipo: 'credito' | 'debito' }) {
  const d = useDatosCaja();
  const credito = tipo === 'credito';
  const inicial = useMemo<FiltrosNotas>(() => ({ estadoDian: 'Todos', cliente: 'Todos', vendedor: 'Todos', usuario: 'Todos', sucursal: 'Todos', codigo: '', desde: INICIO, hasta: hoy() }), []);
  const r = useFiltrosReporte(inicial);

  const filas = useMemo(() => (r.aplicados ? filasNotas(d.notas, tipo, r.aplicados) : []), [r.aplicados, d.notas, tipo]);
  const propias = d.notas.filter(n => n.tipo === tipo);

  const columnas: Columna<NotaElectronica>[] = [
    { label: 'Fecha', render: n => fecha(n.fecha) },
    { label: credito ? 'No. NC' : 'No. ND', render: n => n.numero },
    { label: 'No. Factura', render: n => n.factura },
    { label: 'Cliente', render: n => n.cliente },
    { label: 'Subtotal', render: n => fmtDinero(n.subtotal) },
    { label: 'Descuento', render: n => fmtDinero(n.descuento) },
    { label: 'Total', render: n => fmtDinero(n.total) },
    { label: 'Estado DIAN', render: n => <VentaBadge label={n.estadoDian} variant={n.estadoDian === 'Aceptada' ? 'success' : n.estadoDian === 'Rechazada' ? 'error' : 'warning'} /> },
  ];

  return (
    <ReporteShell
      titulo={credito ? 'Reporte de Notas Crédito' : 'Reporte de Notas Debito'} generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      generarLabel="GENERAR REPORTE" excelLabel="EXCEL"
      filtros={<>
        <FiltroFechas desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
        <FiltroSelect label="Estado DIAN" options={['Todos', 'Pendiente', 'Aceptada', 'Rechazada']} value={r.filtros.estadoDian} onChange={r.set('estadoDian')} />
        <FiltroSelect label="Selecciona cliente..." options={opcionesTodos(propias.map(n => n.cliente))} value={r.filtros.cliente} onChange={r.set('cliente')} />
        <FiltroSelect label="Selecciona vendedor..." options={opcionesTodos(propias.map(n => n.vendedor))} value={r.filtros.vendedor} onChange={r.set('vendedor')} />
        <FiltroSelect label="Selecciona usuario..." options={opcionesTodos(propias.map(n => n.usuario))} value={r.filtros.usuario} onChange={r.set('usuario')} />
        <FiltroSelect label="Selecciona sucursal..." options={['Todos', ...d.sucursales]} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
        <FiltroTexto placeholder="Filtrar por código..." value={r.filtros.codigo} onChange={r.set('codigo')} />
      </>}
      tarjetas={[{ label: 'Total', value: fmtDinero(filas.filter(n => n.estadoDian !== 'Rechazada').reduce((s, n) => s + n.total, 0)) }]}
      columnas={columnas} filas={filas} rowKey={n => n.id}
    />
  );
}

export const ReporteNotasCredito = () => <ReporteNotas tipo="credito" />;
export const ReporteNotasDebito = () => <ReporteNotas tipo="debito" />;

// ─── Ingresos y Egresos ──────────────────────────────────────────────────────

export function ReporteIngresosEgresos() {
  const d = useDatosCaja();
  const inicial = useMemo<FiltrosIngresosEgresos>(() => ({ cliente: 'Todos', metodo: 'Todos', estado: 'Todos', tipoPago: 'Todos', usuario: 'Todos', desde: INICIO, hasta: hoy() }), []);
  const r = useFiltrosReporte(inicial);

  const filas = useMemo(() => (r.aplicados ? filasIngresosEgresos(d.recibos, d.gastos, r.aplicados) : []), [r.aplicados, d.recibos, d.gastos]);
  const resumen = resumenIngresosEgresos(filas);
  const contactos = useMemo(() => opcionesTodos([...d.recibos.map(x => x.cliente), ...d.gastos.map(g => g.proveedor)]), [d.recibos, d.gastos]);

  const columnas: Columna<(typeof filas)[number]>[] = [
    { label: 'Número', render: f => f.numero },
    { label: 'Fecha', render: f => fecha(f.fecha) },
    { label: 'Contacto', render: f => f.contacto },
    { label: 'Descripción', render: f => f.descripcion },
    { label: 'Método de Pago', render: f => f.metodo },
    { label: 'Categoría/Descripción', render: f => f.categoria },
    { label: 'Entrada', render: f => fmtDinero(f.entrada) },
    { label: 'Salida', render: f => fmtDinero(f.salida) },
    { label: 'Total Anulado', render: f => fmtDinero(f.totalAnulado) },
    { label: 'Estado', render: f => <VentaBadge label={f.estado} variant={f.estado === 'Activo' ? 'success' : 'error'} /> },
  ];

  return (
    <ReporteShell
      titulo="Reporte Ingresos y Egresos" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      generarLabel="GENERAR" excelLabel="EXPORTAR" sinLimpiar
      filtros={<>
        <FiltroFechas desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
        <FiltroSelect label="Todos los clientes" options={contactos} value={r.filtros.cliente} onChange={r.set('cliente')} />
        <FiltroSelect label="Todos los métodos de pago..." options={['Todos', ...d.metodos]} value={r.filtros.metodo} onChange={r.set('metodo')} />
        <FiltroSelect label="Todos los estados" options={['Todos', 'Activo', 'Anulado']} value={r.filtros.estado} onChange={r.set('estado')} />
        <FiltroRadio label="Tipo de Pago" value={r.filtros.tipoPago} options={['Todos', 'Recibos', 'Gastos']} onChange={r.set('tipoPago')} />
        <FiltroSelect label="Todos los usuarios" options={opcionesTodos([...d.recibos.map(x => x.usuario), ...d.gastos.map(g => g.usuario)])} value={r.filtros.usuario} onChange={r.set('usuario')} />
      </>}
      tarjetas={[
        { label: 'Total Ingresos', value: fmtDinero(resumen.ingresos) }, { label: 'Total Egresos', value: fmtDinero(resumen.egresos) },
        { label: 'Total Saldo', value: fmtDinero(resumen.saldo) }, { label: 'Total Anulados', value: fmtDinero(resumen.anulados) },
      ]}
      columnas={columnas} filas={filas} rowKey={f => f.id}
    />
  );
}

// ─── Cierre de Caja ──────────────────────────────────────────────────────────

const th: React.CSSProperties = { padding: '10px 14px 10px 0', textAlign: 'left', fontFamily: MFONT, fontWeight: 700, fontSize: 12, color: 'var(--black-100)', borderBottom: '2px solid var(--black-10)', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '9px 14px 9px 0', fontFamily: MFONT, fontSize: 12, color: 'var(--black-100)', borderBottom: '1px solid var(--black-10)', verticalAlign: 'top' };
const titulo: React.CSSProperties = { fontFamily: MFONT, fontSize: 15, fontWeight: 700, color: 'var(--blue-100)', margin: '20px 0 8px' };

const metodosTexto = (pagos: { metodo: string; monto: number }[]) => (pagos.length ? pagos.map(p => `${p.metodo}: ${fmtDinero(p.monto)}`).join(' , ') : '—');

function Linea({ label, value, fuerte }: { label: string; value: string; fuerte?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, padding: '6px 0', maxWidth: 420, fontFamily: MFONT, fontSize: 13, fontWeight: fuerte ? 700 : 500 }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

function Metodos({ lista, prefijo = '' }: { lista: TotalesPorMetodo; prefijo?: string }) {
  return <>{lista.map(([m, v]) => <Linea key={m} label={`${prefijo}${m}`} value={fmtDinero(v)} />)}</>;
}

export function ReporteCierreCaja() {
  const d = useDatosCaja();
  const inicial = useMemo<FiltrosCierre>(() => ({ usuario: 'Todos', sucursal: 'Todos', detallado: false, desde: INICIO, hasta: hoy() }), []);
  const r = useFiltrosReporte(inicial);
  const c = useMemo(() => (r.aplicados ? cierreCaja(d.ventas, d.recibos, r.aplicados) : null), [r.aplicados, d.ventas, d.recibos]);
  const detallado = !!r.aplicados?.detallado;

  return (
    <ReporteShell
      titulo="Reporte Cierre de Caja" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      generarLabel="GENERAR" excelLabel="EXCEL" sinLimpiar tarjetas={[]} columnas={[]} filas={[]} rowKey={() => ''}
      filtros={<>
        <FiltroFechas desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
        <FiltroSelect label="Todos los usuarios" options={['Todos', ...d.usuarios]} value={r.filtros.usuario} onChange={r.set('usuario')} />
        <FiltroSelect label="Todas las sucursales" options={['Todos', ...d.sucursales]} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
        <FiltroCheck label="Reporte Detallado" checked={r.filtros.detallado} onChange={r.set('detallado')} />
      </>}
      cuerpo={c && (
        <div style={{ overflowX: 'auto' }}>
          <h2 style={{ ...titulo, textAlign: 'center', margin: '8px 0 8px' }}>Ventas</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Documento', 'Fecha', 'Cliente', 'Método de Pago', 'Usuario', 'Total'].map(h => <th key={h} style={th}>{h}</th>)}
              {detallado && <th style={th}>Ítems</th>}
            </tr></thead>
            <tbody>
              {c.ventas.length === 0 && <tr><td colSpan={detallado ? 7 : 6} style={{ ...td, textAlign: 'center', color: 'var(--black-60)', padding: '24px 0' }}>No hay ventas con estos filtros</td></tr>}
              {c.ventas.map(v => (
                <tr key={v.id}>
                  <td style={td}>{v.documento}{v.anulada && <span style={{ color: 'var(--coral-100)', marginLeft: 6, fontSize: 10 }}>Anulada</span>}</td>
                  <td style={td}>{fmtFechaCierre(v.fecha)}</td><td style={td}>{v.cliente}</td><td style={td}>{metodosTexto(v.pagos)}</td>
                  <td style={td}>{v.usuario}</td><td style={{ ...td, fontWeight: 700 }}>{fmtDinero(v.total)}</td>
                  {detallado && <td style={td}>{v.detalle}</td>}
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={titulo}>Rango de Comprobantes - {c.rangoComprobantes.cantidad} Comprobantes</h3>
          <Linea label="Inicial" value={c.rangoComprobantes.inicial} /><Linea label="Final" value={c.rangoComprobantes.final} />
          <h3 style={titulo}>Rango de Facturas de Venta - {c.rangoFacturas.cantidad} Facturas de Venta</h3>
          <Linea label="Inicial" value={c.rangoFacturas.inicial} /><Linea label="Final" value={c.rangoFacturas.final} />

          <h3 style={titulo}>Total Comprobantes + Facturas de Ventas</h3>
          <Linea label="Total" value={fmtDinero(c.totalVentas)} fuerte />
          <Metodos lista={c.porMetodoVentas} />

          <h2 style={{ ...titulo, textAlign: 'center', margin: '28px 0 8px' }}>Recibos</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Documento', 'No. Recibo', 'Fecha', 'Cliente', 'Método de Pago', 'Usuario', 'Total'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {c.recibos.length === 0 && <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--black-60)', padding: '24px 0' }}>No hay recibos con estos filtros</td></tr>}
              {c.recibos.map(x => (
                <tr key={x.id}>
                  <td style={td}>{x.documento}</td><td style={td}>{x.numero}</td><td style={td}>{fecha(x.fecha)}</td><td style={td}>{x.cliente}</td>
                  <td style={td}>{x.metodo}</td><td style={td}>{x.usuario}</td><td style={{ ...td, fontWeight: 700 }}>{fmtDinero(x.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12 }}><Metodos lista={c.porMetodoRecibos} /><Linea label="Total Recibos" value={fmtDinero(c.totalRecibos)} fuerte /></div>

          <h3 style={titulo}>Total Comprobantes + Facturas de Ventas + Recibos</h3>
          <Linea label="Total" value={fmtDinero(c.totalGeneral)} fuerte />
          <Metodos lista={c.porMetodoGeneral} prefijo="Total " />
        </div>
      )}
    />
  );
}

// ─── Cierre de Caja Gerencial ────────────────────────────────────────────────

export function ReporteCierreGerencial() {
  const d = useDatosCaja();
  const { items } = useItems();
  const { allProducts, catDefs } = useCatalog();
  const inicial = useMemo<FiltrosGerencial>(() => ({ usuario: 'Todos', sucursal: 'Todos', desde: INICIO, hasta: hoy() }), []);
  const r = useFiltrosReporte(inicial);

  // Mismo costo que "Ganancias por ítems": costo del ítem × cantidad vendida.
  const costoDe = (vs: typeof d.ventas) => agregarGananciasPorItems(vs, { allProducts, catDefs, items }).reduce((s, f) => s + f.totalCostos, 0);
  const g = useMemo(
    () => (r.aplicados ? cierreGerencial(d.ventas, d.sucursales, r.aplicados, costoDe) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [r.aplicados, d.ventas, d.sucursales, items, allProducts, catDefs],
  );

  const bloque = (titulo2: string, n: number, lista: { sucursal: string; rango: { inicial: string; final: string; cantidad: number } }[]) => (
    <div style={{ flex: '1 1 280px', border: '1px solid var(--black-10)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontFamily: MFONT, fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>{titulo2} <span style={{ fontWeight: 500 }}>({n})</span></h3>
      {lista.map(x => (
        <div key={x.sucursal} style={{ fontFamily: MFONT, fontSize: 12, marginBottom: 8 }}>
          <strong>{x.sucursal}{x.rango.cantidad ? ` (${x.rango.cantidad})` : ''}</strong>
          <div>Inicial: {x.rango.inicial}</div><div>Final: {x.rango.final}</div>
        </div>
      ))}
    </div>
  );

  return (
    <ReporteShell
      titulo="Reporte Cierre de Caja Gerencial" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      generarLabel="GENERAR" excelLabel="EXCEL" sinLimpiar tarjetas={[]} columnas={[]} filas={[]} rowKey={() => ''}
      filtros={<>
        <FiltroFechas desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
        <FiltroSelect label="Todos los usuarios" options={['Todos', ...d.usuarios]} value={r.filtros.usuario} onChange={r.set('usuario')} />
        <FiltroSelect label="Todas las sucursales" options={['Todos', ...d.sucursales]} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
      </>}
      cuerpo={g && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Sucursal', 'Comprobantes + Facturas de Venta', 'Costos', 'Utilidad bruta'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {g.filas.map(f => (
                  <tr key={f.sucursal}><td style={td}>{f.sucursal}</td><td style={td}>{fmtDinero(f.ventas)}</td><td style={td}>{fmtDinero(f.costos)}</td><td style={td}>{fmtDinero(f.utilidad)}</td></tr>
                ))}
                <tr>
                  <td style={{ ...td, fontWeight: 700 }}>Totales</td>
                  <td style={{ ...td, fontWeight: 700 }}>{fmtDinero(g.totales.ventas)}</td><td style={{ ...td, fontWeight: 700 }}>{fmtDinero(g.totales.costos)}</td><td style={{ ...td, fontWeight: 700 }}>{fmtDinero(g.totales.utilidad)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 20 }}>
            {bloque('Rango de Comprobantes', g.rangosComprobantes.reduce((s, x) => s + x.rango.cantidad, 0), g.rangosComprobantes)}
            {bloque('Rango de Facturas de Venta', g.rangosFacturas.reduce((s, x) => s + x.rango.cantidad, 0), g.rangosFacturas)}
          </div>
        </>
      )}
    />
  );
}
