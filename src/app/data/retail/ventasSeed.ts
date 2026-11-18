/**
 * retail/ventasSeed.ts — Ventas sembradas de Retail: comprobantes 3753–3762 y
 * facturas SETT 2400410–2400417, del 28-sep al 6-oct de 2026.
 * Los totales salen de los ítems (seed) para que siempre cuadren.
 */
import type { Venta, VentaPago, EstadoVenta } from '../../types/venta';
import type { SaleItem } from '../../utils/invoice';
import { mockCufe } from '../../utils/ventas';
import { RETAIL_ALL_PRODUCTS } from './productCatalog';

const TAX = 0.19;
const RESOLUCION = 'Resolution - Retail Demo 2026';
// month: 0-based (septiembre = 8, octubre = 9).
const at = (month: number, d: number, h: number, m: number) => new Date(2026, month, d, h, m).getTime();
/** Turno por día (el 529 es el turno abierto de la sesión). */
const TURNO_DIA: Record<string, number> = { '8-28': 520, '8-29': 521, '8-30': 522, '9-1': 523, '9-2': 524, '9-3': 525, '9-4': 526, '9-5': 527, '9-6': 528 };

type SeedBase = Omit<Venta, 'subtotal' | 'tax' | 'taxRate' | 'tip' | 'total' | 'discount' | 'vencimiento' | 'pagos' | 'cambio' | 'saldo' | 'formaPago'>
  & { pagos?: VentaPago[]; recibido?: number; pagado?: number };

function seed(base: SeedBase): Venta {
  const { pagos: pagosIn, recibido, pagado: pagadoIn, ...rest } = base;
  const subtotal = rest.items.reduce((s, i) => s + Math.round(i.price * (1 - (i.discount ?? 0) / 100)) * i.quantity, 0);
  const tax = Math.round(subtotal * TAX);
  const total = subtotal + tax;
  const pagado = pagadoIn ?? (rest.estado === 'pagada' ? total : 0);
  const pagos = pagosIn ?? (pagado > 0 ? [{ method: 'Efectivo', amount: pagado }] : []);
  return {
    ...rest, subtotal, tax, taxRate: TAX, tip: 0, discount: 0, total,
    vencimiento: rest.emitidaEn, pagos,
    cambio: recibido ? recibido - total : 0,
    saldo: total - pagado, formaPago: 'Contado',
  };
}

/** Ítem del catálogo Retail (id = String(productId), precio real). */
function item(productId: number, quantity: number, discount?: number): SaleItem {
  const p = RETAIL_ALL_PRODUCTS.find(x => x.id === productId);
  if (!p) throw new Error(`ventasSeed: producto ${productId} no existe en el catálogo Retail`);
  return { id: String(productId), name: p.name, price: p.price, quantity, ...(discount ? { discount } : {}) };
}

interface Def {
  mes: number; dia: number; h: number; m: number;
  cliente: string; items: SaleItem[]; metodo?: string; estado?: EstadoVenta;
  pagado?: number; dian?: 'aceptada' | 'pendiente'; recibido?: number;
}

const CLIENTES = {
  daniel: 'Daniel aycardy 2',
  david: 'David',
  cf: 'Consumidor final',
  andina: 'Comercial Andina SAS (NIT: 901.555.777)',
};

/** Identificación de los clientes de ejemplo de las ventas (para buscar documentos por cliente en Devoluciones). */
export const DOCUMENTO_CLIENTES_EJEMPLO: Record<string, string> = {
  [CLIENTES.daniel]: '1017234567',
  [CLIENTES.david]: '79456123',
  [CLIENTES.cf]: '222222222222',
  [CLIENTES.andina]: '901555777',
};

// Comprobantes 3753 → 3762 (el número más alto es el más reciente).
const COMPROBANTES: Def[] = [
  { mes: 8, dia: 28, h: 10, m: 12, cliente: CLIENTES.cf,     items: [item(211, 2), item(256, 1)] },
  { mes: 8, dia: 29, h: 11, m: 40, cliente: CLIENTES.david,  items: [item(221, 1)], metodo: 'Nequi' },
  // 3755: total $5,000, saldo $3,000 (subtotal 4202 + IVA 798). Ítem suelto de $4,202.
  { mes: 8, dia: 30, h: 9,  m: 25, cliente: CLIENTES.daniel, items: [{ id: '0', name: 'Ajuste de prenda', price: 4202, quantity: 1 }], estado: 'no-pagada', pagado: 2000 },
  { mes: 9, dia: 1,  h: 15, m: 5,  cliente: CLIENTES.cf,     items: [item(251, 1), item(264, 2)], metodo: 'Tarjeta' },
  { mes: 9, dia: 2,  h: 12, m: 30, cliente: CLIENTES.daniel, items: [item(233, 1), item(223, 1)], recibido: 300000 },
  { mes: 9, dia: 2,  h: 17, m: 45, cliente: CLIENTES.david,  items: [item(241, 1)], metodo: 'Tarjeta' },
  { mes: 9, dia: 3,  h: 10, m: 50, cliente: CLIENTES.cf,     items: [item(214, 3)], metodo: 'Nequi' },
  { mes: 9, dia: 4,  h: 16, m: 20, cliente: CLIENTES.andina, items: [item(224, 2), item(252, 1)], metodo: 'Tarjeta' },
  { mes: 9, dia: 5,  h: 13, m: 10, cliente: CLIENTES.cf,     items: [item(213, 1), item(256, 2)] },
  { mes: 9, dia: 6,  h: 11, m: 35, cliente: CLIENTES.daniel, items: [item(222, 1), item(212, 1)], metodo: 'Nequi' },
];

// Facturas SETT 2400410 → 2400417.
const FACTURAS: Def[] = [
  { mes: 8, dia: 28, h: 14, m: 30, cliente: CLIENTES.andina, items: [item(215, 2), item(235, 1)], estado: 'no-pagada', dian: 'pendiente' },
  { mes: 8, dia: 29, h: 16, m: 15, cliente: CLIENTES.daniel, items: [item(242, 1)], metodo: 'Tarjeta' },
  { mes: 9, dia: 1,  h: 10, m: 40, cliente: CLIENTES.andina, items: [item(231, 3), item(221, 2)], metodo: 'Tarjeta' },
  { mes: 9, dia: 2,  h: 9,  m: 55, cliente: CLIENTES.david,  items: [item(254, 1), item(255, 1)], metodo: 'Nequi' },
  { mes: 9, dia: 3,  h: 15, m: 25, cliente: CLIENTES.andina, items: [item(243, 2)], metodo: 'Tarjeta' },
  { mes: 9, dia: 4,  h: 11, m: 5,  cliente: CLIENTES.daniel, items: [item(232, 1), item(225, 1)] },
  { mes: 9, dia: 5,  h: 17, m: 10, cliente: CLIENTES.andina, items: [item(245, 2), item(257, 1)], metodo: 'Tarjeta' },
  { mes: 9, dia: 6,  h: 14, m: 45, cliente: CLIENTES.cf,     items: [item(261, 1), item(262, 2)], metodo: 'Nequi' },
];

/** Ids de los documentos de ejemplo de Devoluciones (specs/2026-11-devoluciones.md §10, D7). */
export const VENTA_EJEMPLO_ANULADA = 'c-3763';
export const VENTA_EJEMPLO_NOTA_CREDITO_TOTAL = 'f-2400418';
export const VENTA_EJEMPLO_CREDITO = 'c-3764';
export const VENTA_EJEMPLO_VARIOS_PAGOS = 'c-3765';
export const VENTA_EJEMPLO_DESCUENTO = 'f-2400419';
export const VENTA_EJEMPLO_PROPINA = 'c-3766';
export const VENTA_EJEMPLO_SIN_INVENTARIO = 'f-2400420';
/** Factura con un ítem ya devuelto (la devolución previa está en la semilla de devoluciones). */
export const VENTA_EJEMPLO_YA_DEVUELTO = 'f-2400421';
/** Comprobante cuya primera devolución dispara el conflicto "otro usuario ya devolvió el ítem" (D8). */
export const VENTA_EJEMPLO_CONFLICTO = 'c-3767';
export const VENTAS_EJEMPLO_DEVOLUCION = [
  VENTA_EJEMPLO_ANULADA, VENTA_EJEMPLO_NOTA_CREDITO_TOTAL, VENTA_EJEMPLO_CREDITO, VENTA_EJEMPLO_VARIOS_PAGOS,
  VENTA_EJEMPLO_DESCUENTO, VENTA_EJEMPLO_PROPINA, VENTA_EJEMPLO_SIN_INVENTARIO, VENTA_EJEMPLO_YA_DEVUELTO, VENTA_EJEMPLO_CONFLICTO,
];

/**
 * Documentos de ejemplo para recorrer los bloqueos y avisos de Devoluciones: anulado, con nota crédito total,
 * a crédito no pagado, varios medios de pago, con descuento, con propina, con un ítem sin inventario y dos
 * documentos libres (uno con un ítem ya devuelto y otro para el conflicto). Son DATOS DE EJEMPLO.
 */
function ejemplosDevolucion(comun: { vendedor: string; emitidoPor: string; sucursal: string; note: string }): Venta[] {
  const mk = (tipo: 'comprobante' | 'factura', numero: number, d: number, h: number, items: SaleItem[], cliente: string,
    patch: Partial<Venta> = {}, estado: EstadoVenta = 'pagada'): Venta => {
    const num = tipo === 'factura' ? `SETT ${numero}` : String(numero);
    const base = seed({
      ...comun, id: `${tipo === 'factura' ? 'f' : 'c'}-${numero}`, numero: num, tipoDoc: tipo,
      resolucion: tipo === 'factura' ? RESOLUCION : '---', recibo: '', emitidaEn: at(9, d, h, 20), turno: 527,
      cliente, items, estado, ...(tipo === 'factura' ? { dian: 'aceptada' as const, cufe: mockCufe(num) } : {}),
    });
    return { ...base, ...patch, ejemplo: true };
  };
  const conPagos = (v: Venta, pagos: VentaPago[]): Venta => ({ ...v, pagos });
  const conPropina = (v: Venta, tip: number): Venta => ({
    ...v, tip, total: v.total + tip, pagos: v.pagos.map((p, i) => (i === 0 ? { ...p, amount: p.amount + tip } : p)),
  });
  const credito = mk('comprobante', 3764, 8, 10, [item(223, 3), item(214, 2)], CLIENTES.andina, {}, 'no-pagada');

  const anulada = mk('comprobante', 3763, 7, 11, [item(212, 3), item(221, 2)], CLIENTES.cf, { pagos: [], saldo: 0 }, 'cancelada');
  const notaTotal = mk('factura', 2400418, 7, 15, [item(224, 4), item(256, 2), item(213, 1)], CLIENTES.andina, { notaCreditoTotal: true });
  const varios = mk('comprobante', 3765, 8, 14, [item(222, 2), item(213, 3), item(211, 2)], CLIENTES.daniel);
  const descuento = mk('factura', 2400419, 8, 16, [item(231, 3, 10), item(225, 2, 10), item(214, 4)], CLIENTES.david);
  const propina = mk('comprobante', 3766, 9, 12, [item(214, 2), item(251, 3), item(216, 2)], CLIENTES.cf);
  const sinInv = mk('factura', 2400420, 9, 13, [{ id: '0', name: 'Ajuste de prenda', price: 4202, quantity: 2 }, item(215, 3), item(245, 2)], CLIENTES.daniel);
  const yaDev = mk('factura', 2400421, 9, 17, [item(242, 2), item(243, 4), item(245, 3)], CLIENTES.andina);
  const conflicto = mk('comprobante', 3767, 9, 18, [item(216, 3), item(226, 2), item(257, 5)], CLIENTES.david);

  return [
    anulada, notaTotal, credito,
    conPagos(varios, [{ method: 'Efectivo', amount: 100000 }, { method: 'Nequi', amount: varios.total - 100000 }]),
    descuento, conPropina(propina, 8000), sinInv, yaDev, conflicto,
  ];
}

export function buildRetailSeedVentas(): Venta[] {
  const comun = { vendedor: 'Wendell Nazar', emitidoPor: 'Wendell Nazar', sucursal: 'Hub Ciudad del Río', note: '' };
  const turno = (d: Def) => TURNO_DIA[`${d.mes}-${d.dia}`];

  const comprobantes = COMPROBANTES.map((d, i) => {
    const numero = String(3753 + i);
    return seed({
      ...comun, id: `c-${numero}`, numero, tipoDoc: 'comprobante', resolucion: '---', recibo: '',
      emitidaEn: at(d.mes, d.dia, d.h, d.m), turno: turno(d), cliente: d.cliente, items: d.items,
      estado: d.estado ?? 'pagada', pagado: d.pagado, recibido: d.recibido,
    });
  });

  const facturas = FACTURAS.map((d, i) => {
    const sett = 2400410 + i;
    const numero = `SETT ${sett}`;
    return seed({
      ...comun, id: `f-${sett}`, numero, tipoDoc: 'factura', resolucion: RESOLUCION, recibo: '',
      emitidaEn: at(d.mes, d.dia, d.h, d.m), turno: turno(d), cliente: d.cliente, items: d.items,
      estado: d.estado ?? 'pagada', pagado: d.pagado, recibido: d.recibido,
      dian: d.dian ?? 'aceptada', cufe: mockCufe(numero),
    });
  });

  // Método de pago por venta (el seed usa Efectivo por defecto).
  const metodos = [...COMPROBANTES, ...FACTURAS];
  const todas = [...comprobantes, ...facturas].map((v, i) => {
    const metodo = metodos[i].metodo;
    return metodo && v.pagos.length > 0 ? { ...v, pagos: v.pagos.map(p => ({ ...p, method: metodo })) } : v;
  });

  // Recibos 8410, 8411… en orden cronológico (a más reciente, número más alto).
  const porFecha = [...todas, ...ejemplosDevolucion(comun)].sort((a, b) => a.emitidaEn - b.emitidaEn || a.id.localeCompare(b.id));
  const recibos = new Map(porFecha.map((v, i) => [v.id, String(8410 + i)]));
  return [...todas, ...ejemplosDevolucion(comun)].map(v => ({ ...v, recibo: recibos.get(v.id)! }));
}
