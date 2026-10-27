/**
 * ReportesVentas — reportes de ventas de Retail (specs/2026-10-reportes-retail.md §5.1 y §5.2):
 * Comprobantes, Comprobantes Mensuales, Comprobantes por Vendedor y Facturas de Venta.
 * Se derivan de ventasStore (cálculo en utils/reportesVentas.ts). El filtro "lista de precios" es solo visual.
 */
import React, { useMemo } from 'react';
import { useAjustes } from '../../../store/ajustesStore';
import { useVentas } from '../../../store/ventasStore';
import { VentaBadge } from '../../../components/ventas/VentaBadge';
import { fmtFechaHora, isoDia, opciones } from '../../../utils/ventas';
import {
  aniosConComprobantes, filasMensuales, filasPorVendedor, filasVentas, resumenVentas,
  type FiltrosReporteMensual, type FiltrosReporteVentas, type FilaVentaReporte,
} from '../../../utils/reportesVentas';
import { FiltroFechas, FiltroSelect, FiltroTexto, ReporteShell, fmtDinero, useFiltrosReporte, type Columna } from './ReporteShell';

const INICIO_VENTAS = '2026-09-01';
const hoy = () => isoDia(Date.now());
const fecha = (ms: number) => fmtFechaHora(ms).slice(0, 10);

const ESTADOS = ['Todos', 'No pagada', 'Pagada', 'Anulada'];
const ESTADOS_PAGO_FACTURA = ['Todos', 'No pagada', 'Pagada'];
const ESTADOS_DIAN = ['Todos', 'Borrador', 'Pendiente', 'Aceptada', 'Rechazada'];

const badgeEstado = (e: string) => <VentaBadge label={e} variant={e === 'Pagada' ? 'success' : e === 'Anulada' ? 'error' : 'warning'} />;

/** Opciones de cliente, vendedor, usuario y sucursal que existen en las ventas. */
function useOpcionesVentas() {
  const { ventas } = useVentas();
  return useMemo(() => {
    const docs = ventas.filter(v => v.estado !== 'abierta');
    return {
      ventas,
      clientes: ['Todos', ...opciones(docs, v => v.cliente)],
      vendedores: ['Todos', ...opciones(docs, v => v.vendedor)],
      usuarios: ['Todos', ...opciones(docs, v => v.emitidoPor)],
      sucursales: ['Todos', ...opciones(docs, v => v.sucursal)],
    };
  }, [ventas]);
}

function useListasPrecios(): string[] {
  const { ajustes } = useAjustes();
  return ['Todos', ...ajustes.listasPrecios.map(l => l.nombre)];
}

// ─── Comprobantes y Facturas de Venta ────────────────────────────────────────

function ReporteVentasDocumento({ tipo }: { tipo: 'comprobante' | 'factura' }) {
  const o = useOpcionesVentas();
  const listas = useListasPrecios();
  const esFactura = tipo === 'factura';
  const inicial = useMemo<FiltrosReporteVentas>(() => ({
    estado: 'Todos', estadoDian: 'Todos', cliente: 'Todos', vendedor: 'Todos', usuario: 'Todos', sucursal: 'Todos', codigo: '',
    desde: INICIO_VENTAS, hasta: hoy(),
  }), []);
  const r = useFiltrosReporte(inicial);
  // Solo visual: las ventas no guardan lista de precios.
  const [lista, setLista] = React.useState('Todos');

  const filas = useMemo(() => (r.aplicados ? filasVentas(o.ventas, tipo, r.aplicados) : []), [r.aplicados, o.ventas, tipo]);
  const resumen = resumenVentas(filas);

  const columnas: Columna<FilaVentaReporte>[] = esFactura
    ? [
      { label: 'Fecha', render: f => fecha(f.fecha) },
      { label: 'No. Factura', render: f => f.codigo },
      { label: 'Cliente', render: f => f.cliente },
      { label: 'Subtotal', render: f => fmtDinero(f.subtotal) },
      { label: 'Descuento', render: f => fmtDinero(f.descuento) },
      { label: 'Total', render: f => fmtDinero(f.total) },
      { label: 'Estado de Pago', render: f => badgeEstado(f.estado) },
      { label: 'Estado DIAN', render: f => f.estadoDian },
    ]
    : [
      { label: 'Fecha', render: f => fecha(f.fecha) },
      { label: 'Código', render: f => f.codigo },
      { label: 'Cliente', render: f => f.cliente },
      { label: 'Subtotal', render: f => fmtDinero(f.subtotal) },
      { label: 'Descuento', render: f => fmtDinero(f.descuento) },
      { label: 'Total', render: f => fmtDinero(f.total) },
      { label: 'Estado', render: f => badgeEstado(f.estado) },
    ];

  return (
    <ReporteShell
      titulo={esFactura ? 'Reporte de Facturas de Venta' : 'Reporte de Comprobantes'}
      generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={() => { r.limpiar(); setLista('Todos'); }}
      generarLabel="GENERAR REPORTE" excelLabel="EXCEL"
      filtros={<>
        <FiltroFechas desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
        {esFactura
          ? <FiltroSelect label="Estado DIAN" options={ESTADOS_DIAN} value={r.filtros.estadoDian} onChange={r.set('estadoDian')} />
          : <FiltroSelect label="Estado..." options={ESTADOS} value={r.filtros.estado} onChange={r.set('estado')} />}
        {esFactura && <FiltroSelect label="Estado de pago..." options={ESTADOS_PAGO_FACTURA} value={r.filtros.estado} onChange={r.set('estado')} />}
        <FiltroSelect label="Selecciona cliente..." options={o.clientes} value={r.filtros.cliente} onChange={r.set('cliente')} />
        <FiltroSelect label="Selecciona vendedor..." options={o.vendedores} value={r.filtros.vendedor} onChange={r.set('vendedor')} />
        <FiltroSelect label="Selecciona usuario..." options={o.usuarios} value={r.filtros.usuario} onChange={r.set('usuario')} />
        <FiltroSelect label="Selecciona sucursal..." options={o.sucursales} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
        <FiltroTexto placeholder="Filtrar por código..." value={r.filtros.codigo} onChange={r.set('codigo')} />
        <FiltroSelect label="Buscar por lista de precios" options={listas} value={lista} onChange={setLista} />
      </>}
      tarjetas={esFactura
        ? [{ label: 'Total', value: fmtDinero(resumen.total) }]
        : [{ label: 'Subtotal', value: fmtDinero(resumen.subtotal) }, { label: 'Descuento', value: fmtDinero(resumen.descuento) }, { label: 'Total', value: fmtDinero(resumen.total) }]}
      columnas={columnas} filas={filas} rowKey={f => f.id}
    />
  );
}

export const ReporteComprobantes = () => <ReporteVentasDocumento tipo="comprobante" />;
export const ReporteFacturasVenta = () => <ReporteVentasDocumento tipo="factura" />;

// ─── Comprobantes Mensuales ──────────────────────────────────────────────────

export function ReporteComprobantesMensuales() {
  const o = useOpcionesVentas();
  const anios = useMemo(() => aniosConComprobantes(o.ventas, new Date().getFullYear()), [o.ventas]);
  const inicial = useMemo<FiltrosReporteMensual>(() => ({ anio: String(new Date().getFullYear()), estado: 'Todos', cliente: 'Todos', vendedor: 'Todos', usuario: 'Todos', sucursal: 'Todos' }), []);
  const r = useFiltrosReporte(inicial);

  const filas = useMemo(() => (r.aplicados ? filasMensuales(o.ventas, r.aplicados) : []), [r.aplicados, o.ventas]);
  const suma = (k: 'subtotal' | 'descuento' | 'total' | 'saldo') => filas.reduce((s, f) => s + f[k], 0);

  const columnas: Columna<(typeof filas)[number]>[] = [
    { label: 'Mes', render: f => f.mes },
    { label: 'Subtotal', render: f => fmtDinero(f.subtotal) },
    { label: 'Descuento', render: f => fmtDinero(f.descuento) },
    { label: 'Total', render: f => fmtDinero(f.total) },
    { label: 'Saldo', render: f => fmtDinero(f.saldo) },
  ];

  return (
    <ReporteShell
      titulo="Reporte de Comprobantes Mensuales" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      generarLabel="GENERAR" excelLabel="EXPORTAR"
      filtros={<>
        <FiltroSelect label="Año" options={anios} value={r.filtros.anio} onChange={r.set('anio')} />
        <FiltroSelect label="Estado..." options={ESTADOS} value={r.filtros.estado} onChange={r.set('estado')} />
        <FiltroSelect label="Selecciona cliente..." options={o.clientes} value={r.filtros.cliente} onChange={r.set('cliente')} />
        <FiltroSelect label="Selecciona vendedor..." options={o.vendedores} value={r.filtros.vendedor} onChange={r.set('vendedor')} />
        <FiltroSelect label="Selecciona usuario..." options={o.usuarios} value={r.filtros.usuario} onChange={r.set('usuario')} />
        <FiltroSelect label="Selecciona sucursal..." options={o.sucursales} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
      </>}
      tarjetas={[
        { label: 'Subtotal', value: fmtDinero(suma('subtotal')) }, { label: 'Descuento', value: fmtDinero(suma('descuento')) },
        { label: 'Total', value: fmtDinero(suma('total')) }, { label: 'Saldo', value: fmtDinero(suma('saldo')) },
      ]}
      columnas={columnas} filas={filas} rowKey={f => f.mes}
    />
  );
}

// ─── Comprobantes por Vendedor ───────────────────────────────────────────────

export function ReporteComprobantesVendedor() {
  const { ventas } = useVentas();
  const { ajustes } = useAjustes();
  const inicial = useMemo(() => ({ desde: INICIO_VENTAS, hasta: hoy() }), []);
  const r = useFiltrosReporte(inicial);

  const filas = useMemo(
    () => (r.aplicados ? filasPorVendedor(ventas, ajustes.vendedores.map(v => v.nombre), r.aplicados.desde, r.aplicados.hasta) : []),
    [r.aplicados, ventas, ajustes.vendedores],
  );

  const columnas: Columna<(typeof filas)[number]>[] = [
    { label: 'Nombre', render: f => f.nombre },
    { label: 'Comprobantes', render: f => f.comprobantes },
    { label: 'Subtotal', render: f => fmtDinero(f.subtotal) },
    { label: 'Total', render: f => fmtDinero(f.total) },
  ];

  return (
    <ReporteShell
      titulo="Reporte Comprobantes por Vendedor" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      generarLabel="GENERAR" excelLabel="EXPORTAR"
      filtros={<FiltroFechas desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />}
      tarjetas={[
        { label: 'Subtotal', value: fmtDinero(filas.reduce((s, f) => s + f.subtotal, 0)) },
        { label: 'Total', value: fmtDinero(filas.reduce((s, f) => s + f.total, 0)) },
      ]}
      columnas={columnas} filas={filas} rowKey={f => f.nombre}
    />
  );
}
