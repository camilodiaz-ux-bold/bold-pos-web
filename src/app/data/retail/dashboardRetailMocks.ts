/**
 * retail/dashboardRetailMocks.ts — Datos del Dashboard de Inicio de Retail
 * (replica del dashboard del POS Retail real: "Dashboard - Movimientos de Semana").
 * Valores de la semana; los demás períodos se derivan con PERIOD_FACTOR.
 */

export type RetailPeriod = 'Día' | 'Semana' | 'Mes';

export const RETAIL_PERIODS: RetailPeriod[] = ['Día', 'Semana', 'Mes'];

/** Multiplicador sobre los valores de la semana (mock). */
export const PERIOD_FACTOR: Record<RetailPeriod, number> = { 'Día': 0.2, 'Semana': 1, 'Mes': 4 };

export interface RetailStat {
  label: string;
  value: number;
  caption?: string;
  icon: 'comprobantes' | 'costos' | 'utilidad' | 'ingresos' | 'gastos' | 'flujo' | 'saldos' | 'cobrado' | 'cxc';
  tone?: 'success' | 'danger';
}

export interface RetailStatSection {
  title: string;
  stats: RetailStat[];
}

export const RETAIL_STAT_SECTIONS: RetailStatSection[] = [
  {
    title: 'Utilidad bruta',
    stats: [
      { label: 'Ventas Totales',   value: 1_815_700, caption: 'Comprobantes',            icon: 'comprobantes' },
      { label: 'Costos De Venta',  value: 487_051,   caption: 'Costo De Items De Venta', icon: 'costos' },
      { label: 'Utilidad Bruta',   value: 1_328_649,                                      icon: 'utilidad', tone: 'success' },
    ],
  },
  {
    title: 'Flujo de caja',
    stats: [
      { label: 'Ingresos',      value: 700_000, caption: 'Recibos',            icon: 'ingresos' },
      { label: 'Gastos',        value: 120_000, caption: 'Gastos realizados',  icon: 'gastos' },
      { label: 'Flujo De Caja', value: 580_000,                                icon: 'flujo' },
    ],
  },
  {
    title: 'Cuentas por cobrar',
    stats: [
      { label: 'Saldos Esta Semana',     value: 1_115_700, caption: 'Crédito nuevo otorgado',       icon: 'saldos' },
      { label: 'Cobrado Esta Semana',    value: 0,         caption: 'Crédito viejo recuperado',     icon: 'cobrado' },
      { label: 'CXC Total Acumuladas',   value: 1_115_700, caption: 'Total de crédito pendiente',   icon: 'cxc', tone: 'danger' },
    ],
  },
];

export interface RetailBarDatum { name: string; valor: number; cantidad: number }

/** Ítems más vendidos (nombres tal como se ven truncados en el dashboard real). */
export const RETAIL_TOP_ITEMS: RetailBarDatum[] = [
  { name: 'Puyaso...', valor: 540_000, cantidad: 12 },
  { name: 'Famili...', valor: 515_000, cantidad: 10 },
  { name: 'Ensala...', valor: 250_000, cantidad: 8 },
  { name: 'Faber-...', valor: 100_000, cantidad: 3 },
  { name: 'Savita...', valor: 80_000,  cantidad: 2 },
];

/** Mejores clientes: `cantidad` = número de compras. */
export const RETAIL_TOP_CLIENTS: RetailBarDatum[] = [
  { name: 'Nahin ...', valor: 1_500_000, cantidad: 3 },
  { name: 'Consum...', valor: 315_700,   cantidad: 9 },
];
