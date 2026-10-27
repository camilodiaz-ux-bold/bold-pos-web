/**
 * reportesRetail — catálogo de los 20 reportes de Retail y su ruta (specs/2026-10-reportes-retail.md §3).
 * `ruta` ausente = reporte aún sin construir (la pantalla muestra "Próximamente").
 */

export interface ReporteRetail { id: string; label: string; ruta?: string }
export interface GrupoReportes { titulo: string; reportes: ReporteRetail[] }

const R = (id: string) => `/reportes/retail/${id}`;

export const GRUPOS_REPORTES_RETAIL: GrupoReportes[] = [
  {
    titulo: 'Ventas',
    reportes: [
      { id: 'comprobantes', label: 'Comprobantes', ruta: R('comprobantes') },
      { id: 'comprobantes-mensuales', label: 'Comprobantes Mensuales', ruta: R('comprobantes-mensuales') },
      // Ya existentes: viven en la ruta core de reportes por historia.
      { id: 'ventas-items', label: 'Ventas por Ítems', ruta: '/reportes/restaurantes/ventas-items' },
      { id: 'ganancias-items', label: 'Ganancias por Ítems', ruta: '/reportes/restaurantes/ganancias-items' },
      { id: 'comprobantes-vendedor', label: 'Comprobantes por Vendedor', ruta: R('comprobantes-vendedor') },
      { id: 'cotizaciones', label: 'Cotizaciones', ruta: R('cotizaciones') },
    ],
  },
  {
    titulo: 'Documentos Electrónicos',
    reportes: [
      { id: 'facturas-venta', label: 'Facturas de Venta', ruta: R('facturas-venta') },
      { id: 'notas-credito', label: 'Notas Crédito', ruta: R('notas-credito') },
      { id: 'notas-debito', label: 'Notas Debito', ruta: R('notas-debito') },
      { id: 'documentos-soporte', label: 'Documentos soporte', ruta: R('documentos-soporte') },
    ],
  },
  {
    titulo: 'Administrativos',
    reportes: [
      { id: 'cierre-caja', label: 'Cierre de Caja', ruta: R('cierre-caja') },
      { id: 'cierre-caja-gerencial', label: 'Cierre de Caja Gerencial', ruta: R('cierre-caja-gerencial') },
      { id: 'lista-items', label: 'Lista de Ítems', ruta: R('lista-items') },
      { id: 'inventarios', label: 'Inventarios', ruta: R('inventarios') },
      { id: 'ingresos-egresos', label: 'Ingresos y Egresos', ruta: R('ingresos-egresos') },
      { id: 'cuentas-cobrar', label: 'Cuentas por Cobrar', ruta: R('cuentas-cobrar') },
      { id: 'lista-contactos', label: 'Lista de Contactos', ruta: R('lista-contactos') },
      { id: 'facturas-compra', label: 'Facturas de Compra', ruta: R('facturas-compra') },
      { id: 'items-comprados', label: 'Ítems Comprados', ruta: R('items-comprados') },
      { id: 'cuentas-pagar', label: 'Cuentas por Pagar', ruta: R('cuentas-pagar') },
    ],
  },
];
