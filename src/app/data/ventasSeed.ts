/**
 * ventasSeed.ts — Ventas sembradas de Restaurantes (ORD0001–ORD0012, 6-oct-2026).
 * Los totales salen de los ítems (seed) para que siempre cuadren.
 * Retail tiene su propia semilla en retail/ventasSeed.ts.
 */
import type { Venta, VentaPago } from '../types/venta';
import type { SaleItem } from '../utils/invoice';
import { mockCufe } from '../utils/ventas';
import { resolveComboComponents } from '../utils/comboBridge';
import { ALL_CATALOG_PRODUCTS } from './productCatalog';
import { SEED_COMBOS } from './itemsSeed';

const TAX = 0.19;
const RESOLUCION = 'Resolution test SP - Resolution 1234509752467';
const at = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).getTime(); // octubre = 9

type SeedBase = Omit<Venta, 'subtotal' | 'tax' | 'taxRate' | 'tip' | 'total' | 'discount' | 'vencimiento' | 'pagos' | 'cambio' | 'saldo' | 'formaPago'>
  & { tipRate?: number; pagos?: VentaPago[]; recibido?: number; pagado?: number };

function seed(base: SeedBase): Venta {
  const { tipRate, pagos: pagosIn, recibido, pagado: pagadoIn, ...rest } = base;
  const subtotal = rest.items.reduce((s, i) => s + Math.round(i.price * (1 - (i.discount ?? 0) / 100)) * i.quantity, 0);
  const tax = Math.round(subtotal * TAX);
  const tip = Math.round(subtotal * (tipRate ?? 0));
  const total = subtotal + tax + tip;
  const pagado = pagadoIn ?? (rest.estado === 'pagada' ? total : 0);
  const pagos = pagosIn ?? (pagado > 0 ? [{ method: 'Efectivo', amount: pagado }] : []);
  return {
    ...rest, subtotal, tax, taxRate: TAX, tip, discount: 0, total,
    vencimiento: rest.emitidaEn, pagos,
    cambio: recibido ? recibido - total : 0,
    saldo: total - pagado, formaPago: 'Contado',
  };
}

/** Ítem del catálogo de Restaurantes (id = String(productId), precio real). */
function item(productId: number, quantity: number, note?: string): SaleItem {
  const p = ALL_CATALOG_PRODUCTS.find(x => x.id === productId);
  if (!p) throw new Error(`ventasSeed: producto ${productId} no existe en el catálogo de Restaurantes`);
  return { id: String(productId), name: p.name, price: p.price, quantity, ...(note ? { note } : {}) };
}

/** Combo sembrado (comboSaleId ≥ 9000), con la misma forma que produce el checkout. */
function combo(comboSaleId: number, quantity: number): SaleItem {
  const c = SEED_COMBOS.find(x => x.comboSaleId === comboSaleId);
  if (!c) throw new Error(`ventasSeed: combo ${comboSaleId} no existe en SEED_COMBOS`);
  return {
    id: String(comboSaleId), productId: comboSaleId, isCombo: true,
    name: c.nombre, price: c.precioTotal, quantity,
    comboComponents: resolveComboComponents(c as Parameters<typeof resolveComboComponents>[0]),
  };
}

/** Pago mixto: `efectivo` en efectivo y el resto con tarjeta. */
function mixto(v: Venta, efectivo: number): Venta {
  return { ...v, pagos: [{ method: 'Efectivo', amount: efectivo }, { method: 'Tarjeta', amount: v.total - efectivo }] };
}

/** Pago dividido por persona: la última persona paga el resto. */
function dividido(v: Venta, partes: { persona: string; method: string; amount: number }[]): Venta {
  const previos = partes.slice(0, -1).reduce((s, p) => s + p.amount, 0);
  const ult = partes[partes.length - 1];
  return { ...v, pagos: [...partes.slice(0, -1), { ...ult, amount: v.total - previos }] };
}

export function buildRestaurantSeedVentas(): Venta[] {
  const base = { tipRate: 0.10, emitidoPor: 'Juan Pérez', sucursal: 'Principal', turno: 528, note: '' };
  const num = (n: number) => `ORD${String(n).padStart(4, '0')}`;
  const rec = (n: number) => String(8399 + n);
  // Factura electrónica emitida: SETT 24004xx + resolución + CUFE.
  const factura = (n: number, sett: number) => ({
    tipoDoc: 'factura' as const,
    numeroDocumento: `SETT 2400${sett}`,
    resolucion: RESOLUCION,
    dian: 'aceptada' as const,
    cufe: mockCufe(num(n)),
  });
  const comprobante = { tipoDoc: 'comprobante' as const, resolucion: '---' };

  const ventas: Venta[] = [
    seed({ ...base, id: num(1), numero: num(1), ...comprobante, recibo: rec(1),
      emitidaEn: at(6, 13, 5), abiertaEn: at(6, 12, 5), zona: 'Salón', mesa: 'S04', personas: 2,
      cliente: 'Consumidor final', vendedor: 'Carlos Pérez', estado: 'pagada',
      items: [item(111, 1), item(121, 1), item(152, 1)], recibido: 500000 }),
    seed({ ...base, id: num(2), numero: num(2), ...factura(2, 401), recibo: rec(2),
      emitidaEn: at(6, 14, 20), abiertaEn: at(6, 13, 10), zona: 'Salón', mesa: 'S07', personas: 3,
      cliente: 'Laura Gómez', vendedor: 'Laura Gómez', estado: 'pagada',
      items: [item(101, 1), item(131, 2), item(153, 1)] }),
    seed({ ...base, id: num(3), numero: num(3), ...comprobante, recibo: rec(3),
      emitidaEn: at(6, 15, 10), abiertaEn: at(6, 14, 15), zona: 'Salón', mesa: 'S02', personas: 2,
      cliente: 'Consumidor final', vendedor: 'Miguel Torres', estado: 'abierta',
      items: [item(103, 1), item(142, 1)] }),
    seed({ ...base, id: num(4), numero: num(4), ...comprobante, recibo: rec(4),
      emitidaEn: at(6, 16, 5), abiertaEn: at(6, 14, 55), zona: 'Salón', mesa: 'S05', personas: 4,
      cliente: 'Consumidor final', vendedor: 'Ana Ruiz', estado: 'pagada',
      items: [item(133, 2), item(122, 1), item(156, 1)], recibido: 1000000 }),
    seed({ ...base, id: num(5), numero: num(5), ...comprobante, recibo: rec(5),
      emitidaEn: at(6, 16, 50), abiertaEn: at(6, 16, 5), zona: 'Terraza', mesa: 'T02', personas: 2,
      cliente: 'Consumidor final', vendedor: 'Carlos Pérez', estado: 'cancelada',
      items: [item(104, 1), item(143, 1)], note: 'Cancelada por el cliente' }),
    seed({ ...base, id: num(6), numero: num(6), ...factura(6, 402), dian: 'pendiente', recibo: rec(6),
      emitidaEn: at(6, 17, 40), abiertaEn: at(6, 16, 40), zona: 'Terraza', mesa: 'T05', personas: 2,
      cliente: 'Comercial Andina SAS (NIT: 901.555.777)', vendedor: 'Laura Gómez', estado: 'pagada',
      items: [item(112, 1), item(136, 1), item(158, 1)] }),
    seed({ ...base, id: num(7), numero: num(7), ...comprobante, recibo: rec(7),
      emitidaEn: at(6, 18, 25), abiertaEn: at(6, 17, 20), zona: 'Terraza', mesa: 'T04', personas: 3,
      cliente: 'Consumidor final', vendedor: 'Miguel Torres', estado: 'abierta',
      items: [item(132, 1), item(125, 1), item(106, 1)] }),
    seed({ ...base, id: num(8), numero: num(8), ...comprobante, recibo: rec(8),
      emitidaEn: at(6, 19, 15), abiertaEn: at(6, 18, 5), zona: 'Terraza', mesa: 'T06', personas: 2,
      cliente: 'Consumidor final', vendedor: 'Ana Ruiz', estado: 'pagada',
      items: [item(116, 1), item(147, 1)], recibido: 400000 }),
    // Pago mixto (Efectivo + Tarjeta).
    mixto(seed({ ...base, id: num(9), numero: num(9), ...comprobante, recibo: rec(9),
      emitidaEn: at(6, 20, 10), abiertaEn: at(6, 18, 40), zona: 'Salón', mesa: 'S06', personas: 4,
      cliente: 'Consumidor final', vendedor: 'Laura Gómez', estado: 'pagada',
      items: [item(138, 1), item(124, 1), item(145, 1)] }), 300000),
    // Pago dividido por persona.
    dividido(seed({ ...base, id: num(10), numero: num(10), ...factura(10, 403), recibo: rec(10),
      emitidaEn: at(6, 20, 55), abiertaEn: at(6, 19, 20), zona: 'Terraza', mesa: 'T08', personas: 4,
      cliente: 'Consumidor final', vendedor: 'Miguel Torres', estado: 'pagada',
      items: [item(139, 2), item(128, 1), item(105, 1), item(151, 2)] }), [
      { persona: 'Persona 1', method: 'Efectivo', amount: 300000 },
      { persona: 'Persona 2', method: 'Tarjeta',  amount: 300000 },
      { persona: 'Persona 3', method: 'Tarjeta',  amount: 300000 },
      { persona: 'Persona 4', method: 'Nequi',    amount: 0 },
    ]),
    // Ventas con combos (specs/2026-10-reporte-ventas-items.md §8.3).
    seed({ ...base, id: num(11), numero: num(11), ...comprobante, recibo: rec(11),
      emitidaEn: at(6, 21, 30), abiertaEn: at(6, 20, 40), zona: 'Salón', mesa: 'S03', personas: 2,
      cliente: 'Consumidor final', vendedor: 'Carlos Pérez', estado: 'pagada',
      items: [combo(9001, 1), item(103, 1)] }),
    seed({ ...base, id: num(12), numero: num(12), ...comprobante, recibo: rec(12),
      emitidaEn: at(6, 21, 50), abiertaEn: at(6, 20, 55), zona: 'Terraza', mesa: 'T03', personas: 4,
      cliente: 'Consumidor final', vendedor: 'Ana Ruiz', estado: 'pagada',
      items: [combo(9002, 2)] }),
  ];
  // Una orden cancelada no deja saldo por cobrar.
  return ventas.map(v => (v.estado === 'cancelada' ? { ...v, saldo: 0 } : v));
}
