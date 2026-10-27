/**
 * ReporteRetailPage — resuelve `/reportes/retail/:id` al reporte correspondiente (specs/2026-10-reportes-retail.md §3).
 * Un id desconocido o aún sin construir vuelve a la pantalla de Reportes.
 */
import React from 'react';
import { Navigate, useParams } from 'react-router';
import {
  ReporteCuentasPorPagar, ReporteDocumentosSoporte, ReporteFacturasCompra, ReporteItemsComprados,
} from './ReportesCompras';
import {
  ReporteComprobantes, ReporteComprobantesMensuales, ReporteComprobantesVendedor, ReporteFacturasVenta,
} from './ReportesVentas';
import {
  ReporteCierreCaja, ReporteCierreGerencial, ReporteCotizaciones, ReporteIngresosEgresos, ReporteNotasCredito, ReporteNotasDebito,
} from './ReportesCaja';
import { ReporteCuentasPorCobrar, ReporteInventarios, ReporteListaContactos, ReporteListaItems } from './ReportesAdmin';

const REPORTES: Record<string, React.ComponentType> = {
  'facturas-compra': ReporteFacturasCompra,
  'items-comprados': ReporteItemsComprados,
  'cuentas-pagar': ReporteCuentasPorPagar,
  'documentos-soporte': ReporteDocumentosSoporte,
  comprobantes: ReporteComprobantes,
  'comprobantes-mensuales': ReporteComprobantesMensuales,
  'comprobantes-vendedor': ReporteComprobantesVendedor,
  'facturas-venta': ReporteFacturasVenta,
  'lista-items': ReporteListaItems,
  inventarios: ReporteInventarios,
  'lista-contactos': ReporteListaContactos,
  'cuentas-cobrar': ReporteCuentasPorCobrar,
  cotizaciones: ReporteCotizaciones,
  'notas-credito': ReporteNotasCredito,
  'notas-debito': ReporteNotasDebito,
  'ingresos-egresos': ReporteIngresosEgresos,
  'cierre-caja': ReporteCierreCaja,
  'cierre-caja-gerencial': ReporteCierreGerencial,
};

export function ReporteRetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const Reporte = REPORTES[id];
  return Reporte ? <Reporte key={id} /> : <Navigate to="/reportes" replace />;
}
