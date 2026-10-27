/**
 * ReportesCompras — los 4 reportes de compras de Retail (specs/2026-10-reportes-retail.md §5.2 y §5.3):
 * Facturas de Compra, Ítems Comprados, Cuentas por Pagar y Documentos soporte.
 * Todos se derivan de facturasCompraStore (cálculo en utils/reportesCompras.ts).
 */
import React, { useCallback, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import { useContactos } from '../../../store/contactosStore';
import { useFacturasCompra } from '../../../store/facturasCompraStore';
import { useItems } from '../../../store/itemsStore';
import { useCatalog } from '../../../vertical';
import { VentaBadge } from '../../../components/ventas/VentaBadge';
import { BADGE_ESTADO, FECHA_PROTOTIPO, fmtFecha } from '../../../utils/facturasCompra';
import {
  cuentasPorPagarReporte, filasDocumentosSoporte, filasFacturasCompra, filasItemsComprados, resumenFacturasCompra,
  type DesgloseImpuestos,
  type FiltrosReporteCxP, type FiltrosReporteDS, type FiltrosReporteFacturas, type FiltrosReporteItems,
} from '../../../utils/reportesCompras';
import type { EstadoPagoCompra } from '../../../types/facturaCompra';
import {
  FiltroFechas, FiltroSelect, FiltroTexto, NA, ReporteShell, fmtDinero, opcionesTodos, useFiltrosReporte, type Columna,
} from './ReporteShell';

const INICIO = '2026-01-01';
const FIN_ANIO = '2026-12-31';

const ESTADOS_PAGO: string[] = ['Todos', 'Pagado', 'No pagado', 'Vencido', 'Anulada'];

/** Proveedores y nombres compartidos por los 4 reportes. */
function useProveedores() {
  const { contactos } = useContactos();
  const nombre = useCallback((id: string) => contactos.find(c => c.id === id)?.nombre ?? '—', [contactos]);
  const nombres = useMemo(() => opcionesTodos(contactos.filter(c => c.esProveedor).map(c => c.nombre)), [contactos]);
  return { nombre, nombres };
}

const dinero = (n: number | null): string => (n === null ? NA : fmtDinero(n));
const dineroGuion = (n: number | null): string => (n === null ? '--' : fmtDinero(n));

// ─── Facturas de Compra ──────────────────────────────────────────────────────

const FILTROS_FACTURAS: FiltrosReporteFacturas = { proveedor: 'Todos', estado: 'Todos', sucursal: 'Todos', desde: INICIO, hasta: FECHA_PROTOTIPO };

export function ReporteFacturasCompra() {
  const { facturas, settings } = useFacturasCompra();
  const { ajustes } = useAjustes();
  const { nombre, nombres } = useProveedores();
  const r = useFiltrosReporte(FILTROS_FACTURAS);

  const filas = useMemo(
    () => (r.aplicados ? filasFacturasCompra(facturas, nombre, r.aplicados, settings.usarImpuestos) : []),
    [r.aplicados, facturas, nombre, settings.usarImpuestos],
  );
  const resumen = resumenFacturasCompra(filas, facturas, settings.usarImpuestos);

  const columnas: Columna<(typeof filas)[number]>[] = [
    { label: 'No. Factura', render: f => f.numero },
    { label: 'Proveedor', render: f => f.proveedor },
    { label: 'Fecha de emisión', render: f => fmtFecha(f.fechaEmision) },
    { label: 'Inventario', align: 'center', render: f => (f.inventario
      ? <Check size={16} color="var(--blue-100)" aria-label="Afecta inventario" />
      : <X size={16} color="var(--coral-100)" aria-label="No afecta inventario" />) },
    { label: 'Valor total', render: f => fmtDinero(f.valorTotal) },
    { label: 'Forma de pago', render: f => f.formaPago },
    { label: 'Subtotal', render: f => fmtDinero(f.subtotal) },
    { label: 'IVA 19.00%', render: f => dinero(f.impuestos.iva19) },
    { label: 'IVA 5.00%', render: f => dinero(f.impuestos.iva5) },
    { label: 'IVA 0.00%', render: f => dinero(f.impuestos.iva0) },
    { label: 'IVA Excluido', render: f => dinero(f.impuestos.excluido) },
    { label: 'Retención', render: f => dinero(f.retencion) },
    { label: 'Fecha de vencimiento', render: f => (f.fechaVencimiento ? fmtFecha(f.fechaVencimiento) : '--') },
    { label: 'Estado de Pago', render: f => <VentaBadge label={f.estado} variant={BADGE_ESTADO[f.estado as EstadoPagoCompra]} /> },
    { label: 'Doc. soporte', render: f => f.docSoporte || '--' },
    { label: 'Sucursal', render: f => f.sucursal },
  ];

  return (
    <ReporteShell
      titulo="Reporte Facturas de Compra" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      filtros={<>
        <FiltroSelect label="Proveedor" options={nombres} value={r.filtros.proveedor} onChange={r.set('proveedor')} />
        <FiltroSelect label="Estado de pago" options={ESTADOS_PAGO} value={r.filtros.estado} onChange={r.set('estado')} />
        <FiltroSelect label="Todas las sucursales" options={['Todos', ...ajustes.sucursales.map(s => s.nombre)]} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
        <FiltroFechas label="Fecha de emisión" desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
      </>}
      tarjetas={[
        { label: 'Total Facturas', value: String(resumen.total) },
        { label: 'Valor Total', value: fmtDinero(resumen.valorTotal) },
        { label: 'Pendiente De Pago', value: fmtDinero(resumen.pendiente) },
      ]}
      columnas={columnas} filas={filas} rowKey={f => f.id}
    />
  );
}

// ─── Ítems Comprados ─────────────────────────────────────────────────────────

const FILTROS_ITEMS: FiltrosReporteItems = { categoria: 'Todos', producto: '', proveedor: 'Todos', desde: INICIO, hasta: FECHA_PROTOTIPO };

export function ReporteItemsComprados() {
  const { facturas } = useFacturasCompra();
  const { items } = useItems();
  const { catDefs } = useCatalog();
  const { nombre, nombres } = useProveedores();
  const r = useFiltrosReporte(FILTROS_ITEMS);

  // Categoría del ítem por código; lo que no está en el catálogo cuenta como "General".
  const categoriaDe = useCallback((codigo: string) => {
    const item = items.find(i => i.codigo === codigo);
    return catDefs.find(c => c.id === item?.categoriaId)?.name ?? 'General';
  }, [items, catDefs]);
  const categorias = useMemo(() => opcionesTodos([...catDefs.map(c => c.name), 'General']), [catDefs]);

  const filas = useMemo(
    () => (r.aplicados ? filasItemsComprados(facturas, nombre, categoriaDe, r.aplicados) : []),
    [r.aplicados, facturas, nombre, categoriaDe],
  );
  const proveedores = new Set(filas.map(f => f.proveedor)).size;

  const columnas: Columna<(typeof filas)[number]>[] = [
    { label: 'No. Factura', render: f => f.numero },
    { label: 'Producto', render: f => f.producto },
    { label: 'Categoría', render: f => f.categoria },
    { label: 'Proveedor', render: f => f.proveedor },
    { label: 'Cantidad', render: f => f.cantidad },
    { label: 'Precio unitario', render: f => fmtDinero(f.precio) },
    { label: 'Valor total', render: f => fmtDinero(f.valorTotal) },
    { label: 'Fecha de emisión', render: f => fmtFecha(f.fechaEmision) },
  ];

  return (
    <ReporteShell
      titulo="Reporte Ítems Comprados" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      filtros={<>
        <FiltroSelect label="Categorías" options={categorias} value={r.filtros.categoria} onChange={r.set('categoria')} />
        <FiltroTexto placeholder="Producto" value={r.filtros.producto} onChange={r.set('producto')} />
        <FiltroSelect label="Proveedores" options={nombres} value={r.filtros.proveedor} onChange={r.set('proveedor')} />
        <FiltroFechas label="Fecha de emisión" desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
      </>}
      tarjetas={[
        { label: 'Items Comprados', value: String(filas.reduce((s, f) => s + f.cantidad, 0)) },
        { label: 'Proveedores', value: String(proveedores) },
        { label: 'Valor Total', value: fmtDinero(filas.reduce((s, f) => s + f.valorTotal, 0)) },
      ]}
      columnas={columnas} filas={filas} rowKey={f => f.key}
    />
  );
}

// ─── Cuentas por Pagar ───────────────────────────────────────────────────────

const FILTROS_CXP: FiltrosReporteCxP = { proveedor: 'Todos', sucursal: 'Todos', desde: INICIO, hasta: FIN_ANIO };

export function ReporteCuentasPorPagar() {
  const { facturas, settings } = useFacturasCompra();
  const { ajustes } = useAjustes();
  const { nombre, nombres } = useProveedores();
  const r = useFiltrosReporte(FILTROS_CXP);

  const { filas, resumen } = useMemo(
    () => (r.aplicados
      ? cuentasPorPagarReporte(facturas, nombre, r.aplicados, settings.usarImpuestos)
      : { filas: [], resumen: { vencidos: 0, proximos7: 0, proximos30: 0, todas: 0 } }),
    [r.aplicados, facturas, nombre, settings.usarImpuestos],
  );

  const columnas: Columna<(typeof filas)[number]>[] = [
    { label: 'Proveedor', render: f => f.proveedor },
    { label: 'Deuda total', render: f => fmtDinero(f.deudaTotal) },
    { label: 'Deuda Pendiente', render: f => fmtDinero(f.deudaPendiente) },
    { label: 'Deuda Vencida', render: f => fmtDinero(f.deudaVencida) },
  ];

  return (
    <ReporteShell
      titulo="Reporte Cuentas por Pagar" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      filtros={<>
        <FiltroSelect label="Proveedor" options={nombres} value={r.filtros.proveedor} onChange={r.set('proveedor')} />
        <FiltroSelect label="Todas las sucursales" options={['Todos', ...ajustes.sucursales.map(s => s.nombre)]} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
        <FiltroFechas label="Fecha de vencimiento" desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
      </>}
      tarjetas={[
        { label: 'Pagos Vencidos', value: fmtDinero(resumen.vencidos) },
        { label: 'Pagos Siguientes 7 Días', value: fmtDinero(resumen.proximos7) },
        { label: 'Pagos Siguientes 30 Días', value: fmtDinero(resumen.proximos30) },
        { label: 'Todas Las Cuentas Por Pagar', value: fmtDinero(resumen.todas) },
      ]}
      columnas={columnas} filas={filas} rowKey={f => f.proveedor}
    />
  );
}

// ─── Documentos soporte ──────────────────────────────────────────────────────

const FILTROS_DS: FiltrosReporteDS = { estadoDian: 'Todos', estadoPago: 'Todos', proveedor: 'Todos', sucursal: 'Todos', desde: INICIO, hasta: FECHA_PROTOTIPO };

const sumaImpuesto = (filas: { impuestos: DesgloseImpuestos }[], k: keyof DesgloseImpuestos) =>
  filas.reduce((s, f) => s + (f.impuestos[k] ?? 0), 0);

export function ReporteDocumentosSoporte() {
  const { facturas } = useFacturasCompra();
  const { ajustes } = useAjustes();
  const { nombre, nombres } = useProveedores();
  const r = useFiltrosReporte(FILTROS_DS);

  const filas = useMemo(
    () => (r.aplicados ? filasDocumentosSoporte(facturas, nombre, r.aplicados) : []),
    [r.aplicados, facturas, nombre],
  );

  const columnas: Columna<(typeof filas)[number]>[] = [
    { label: 'Fecha', render: f => fmtFecha(f.fecha) },
    { label: 'N° Documento', render: f => f.numero },
    { label: 'Proveedor', render: f => f.proveedor },
    { label: 'Subtotal', render: f => fmtDinero(f.subtotal) },
    { label: 'Descuento', render: () => '--' },
    { label: 'IVA 19.00%', render: f => dineroGuion(f.impuestos.iva19) },
    { label: 'IVA 5.00%', render: f => dineroGuion(f.impuestos.iva5) },
    { label: 'IVA Excluido', render: f => dineroGuion(f.impuestos.excluido) },
    { label: 'IVA 0.00%', render: f => dineroGuion(f.impuestos.iva0) },
    { label: 'Total', render: f => fmtDinero(f.total) },
    { label: 'Estado DIAN', render: f => <VentaBadge label={f.estadoDian} variant="success" /> },
    { label: 'Estado de pago', render: f => <VentaBadge label={f.estadoPago} variant={f.estadoPago === 'Pagado' ? 'success' : 'warning'} /> },
  ];

  return (
    <ReporteShell
      titulo="Reporte Documento Soporte" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      filtros={<>
        <FiltroFechas label="Fecha" desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
        <FiltroSelect label="Estado DIAN" options={['Todos', 'Aceptado', 'Pendiente', 'Rechazado']} value={r.filtros.estadoDian} onChange={r.set('estadoDian')} />
        <FiltroSelect label="Estado de pago" options={['Todos', 'Pagado', 'No pagado']} value={r.filtros.estadoPago} onChange={r.set('estadoPago')} />
        <FiltroSelect label="Proveedor" options={nombres} value={r.filtros.proveedor} onChange={r.set('proveedor')} />
        <FiltroSelect label="Todas las sucursales" options={['Todos', ...ajustes.sucursales.map(s => s.nombre)]} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
      </>}
      tarjetas={[
        { label: 'IVA 19.00%', value: fmtDinero(sumaImpuesto(filas, 'iva19')) },
        { label: 'Descuento', value: fmtDinero(0) },
        { label: 'Subtotal', value: fmtDinero(filas.reduce((s, f) => s + f.subtotal, 0)) },
        { label: 'Total', value: fmtDinero(filas.reduce((s, f) => s + f.total, 0)) },
        { label: 'IVA 5.00%', value: fmtDinero(sumaImpuesto(filas, 'iva5')) },
        { label: 'IVA Excluido', value: fmtDinero(sumaImpuesto(filas, 'excluido')) },
        { label: 'IVA 0.00%', value: fmtDinero(sumaImpuesto(filas, 'iva0')) },
      ]}
      columnas={columnas} filas={filas} rowKey={f => f.id}
    />
  );
}
