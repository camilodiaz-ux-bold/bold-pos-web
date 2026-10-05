/**
 * retail/dashboardMocks.ts — Mocks del Dashboard (/inicio) para la vertical Retail.
 * Productos del catálogo Retail (data/retail/productCatalog.ts).
 */

export interface RetailTopProduct { name: string; revenue: number; units: number }

export const RETAIL_TOP_PRODUCTS: RetailTopProduct[] = [
  { name: 'Tenis Running Pro',       revenue: 329900, units: 1 },
  { name: 'Jean Slim Azul Oscuro',   revenue: 319800, units: 2 },
  { name: 'Camiseta Básica Algodón', revenue: 229500, units: 5 },
  { name: 'Chaqueta Jean Clásica',   revenue: 199900, units: 1 },
  { name: 'Gorra Visera Curva',      revenue: 149700, units: 3 },
];

/** Ventas del día por método de pago (suma 45 ventas completadas, como el KPI del canal Mostrador). */
export const RETAIL_PAYMENT_BREAKDOWN = [
  { label: 'Efectivo',      count: 14, dot: '#10B981' },
  { label: 'Tarjeta',       count: 19, dot: '#EAB308' },
  { label: 'Nequi',         count: 8,  dot: '#969696' },
  { label: 'Transferencia', count: 4,  dot: '#121E6C' },
];
