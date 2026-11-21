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
  const ordenes = ventas.map(v => ({ ...v, modo: 'mesa' as const, ...(v.estado === 'cancelada' ? { saldo: 0 } : {}) }));
  return [...ordenes, ...buildRestaurantSeedDocumentos()];
}

// ─── Comprobantes y facturas de ejemplo para Devoluciones (specs/2026-11-devoluciones-v3.md §2) ──────────────
// Mismos ids y casos de uso que Retail (retail/ventasSeed.ts), con ítems del catálogo de Restaurantes.
// La sucursal es la primera de Ajustes (Hub Ciudad del Rio), que es la del usuario de la sesión.

const CLI = {
  cf: 'Consumidor final',
  laura: 'Laura Gómez',
  carlos: 'Carlos Mendoza',
  andina: 'Comercial Andina SAS (NIT: 901.555.777)',
};

function itemDescuento(productId: number, quantity: number, discount: number): SaleItem {
  return { ...item(productId, quantity), discount };
}

export function buildRestaurantSeedDocumentos(): Venta[] {
  const comun = { emitidoPor: 'Juan Pérez', vendedor: 'Juan Pérez', sucursal: 'Hub Ciudad del Rio', turno: 527, note: '', recibo: '' };
  const mk = (tipo: 'comprobante' | 'factura', numero: number, d: number, h: number, m: number, items: SaleItem[], cliente: string,
    patch: Partial<Venta> = {}, estado: Venta['estado'] = 'pagada', ejemplo = false): Venta => {
    const num = tipo === 'factura' ? `SETT ${numero}` : String(numero);
    const base = seed({
      ...comun, id: `${tipo === 'factura' ? 'f' : 'c'}-${numero}`, numero: num, tipoDoc: tipo,
      resolucion: tipo === 'factura' ? RESOLUCION : '---', emitidaEn: at(d, h, m),
      cliente, items, estado, ...(tipo === 'factura' ? { dian: 'aceptada' as const, cufe: mockCufe(num) } : {}),
    });
    return { ...base, ...patch, ...(ejemplo ? { ejemplo: true } : {}) };
  };
  const ej = (tipo: 'comprobante' | 'factura', numero: number, d: number, h: number, items: SaleItem[], cliente: string, patch: Partial<Venta> = {}, estado: Venta['estado'] = 'pagada') =>
    mk(tipo, numero, d, h, 20, items, cliente, patch, estado, true);

  const regulares: Venta[] = [
    mk('comprobante', 3753, 1, 12, 10, [item(111, 1), item(121, 1)], CLI.cf),
    mk('comprobante', 3754, 2, 13, 30, [item(101, 1), item(131, 2)], CLI.laura),
    mk('comprobante', 3755, 3, 14, 15, [item(133, 2), item(122, 1)], CLI.cf),
    mk('comprobante', 3756, 4, 19, 40, [item(112, 1), item(136, 1), item(158, 1)], CLI.andina),
    mk('comprobante', 3757, 5, 20, 5, [item(116, 1), item(147, 1)], CLI.cf),
    mk('comprobante', 3758, 5, 21, 10, [item(138, 1), item(124, 1), item(145, 1)], CLI.carlos),
    mk('factura', 2400410, 1, 14, 30, [item(139, 2), item(128, 1)], CLI.andina),
    mk('factura', 2400411, 2, 16, 15, [item(106, 1), item(125, 1)], CLI.laura),
    mk('factura', 2400412, 3, 10, 40, [item(132, 1)], CLI.andina),
    mk('factura', 2400413, 4, 9, 55, [item(151, 2), item(153, 1)], CLI.carlos),
    mk('factura', 2400414, 5, 15, 25, [item(142, 2)], CLI.andina),
    mk('factura', 2400415, 6, 11, 5, [item(104, 1), item(143, 1)], CLI.cf),
  ];

  const anulada = ej('comprobante', 3763, 7, 11, [item(111, 2), item(121, 2)], CLI.cf, { pagos: [], saldo: 0 }, 'cancelada');
  const notaTotal = ej('factura', 2400418, 7, 15, [item(133, 2), item(122, 1), item(152, 1)], CLI.andina, { notaCreditoTotal: true });
  const credito = ej('comprobante', 3764, 8, 10, [item(101, 2), item(131, 1)], CLI.andina, {}, 'no-pagada');
  const facturaCredito = ej('factura', 2400422, 9, 19, [item(112, 2), item(136, 1)], CLI.laura, { formaPago: 'Crédito' }, 'no-pagada');
  const varios = ej('comprobante', 3765, 8, 14, [item(138, 2), item(124, 1), item(145, 2)], CLI.carlos);
  const descuento = ej('factura', 2400419, 8, 16, [itemDescuento(139, 2, 10), itemDescuento(128, 1, 10), item(151, 2)], CLI.laura);
  const propina = ej('comprobante', 3766, 9, 12, [item(106, 2), item(125, 1), item(153, 2)], CLI.cf);
  const sinInv = ej('factura', 2400420, 9, 13, [{ id: '0', name: 'Servicio adicional', price: 4202, quantity: 2 }, item(142, 2), item(147, 1)], CLI.carlos);
  const yaDev = ej('factura', 2400421, 9, 17, [item(104, 2), item(143, 3), item(116, 1)], CLI.andina);
  const conflicto = ej('comprobante', 3767, 9, 18, [item(103, 2), item(156, 1), item(158, 3)], CLI.laura);

  const conPropina: Venta = { ...propina, tip: 8000, total: propina.total + 8000, pagos: propina.pagos.map((p, i) => (i === 0 ? { ...p, amount: p.amount + 8000 } : p)) };
  return [
    ...regulares, anulada, notaTotal, credito, facturaCredito, mixto(varios, 100000), descuento, conPropina, sinInv, yaDev, conflicto,
  ];
}
