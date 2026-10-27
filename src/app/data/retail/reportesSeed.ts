/**
 * retail/reportesSeed.ts — SEMILLAS PROVISIONALES para los reportes de Retail cuyo módulo aún no existe
 * (specs/2026-10-reportes-retail.md §7): Cotizaciones, Notas Crédito, Notas Débito, Recibos y Gastos.
 *
 * Solo las leen los reportes (no hay listados de esos módulos en el prototipo). Cuando se construyan Ingresos
 * (Recibos, Notas, Cotizaciones) y Egresos (Gastos) con sus propios stores, estas funciones se reemplazan.
 * Determinista (sin Math.random): los reportes dan lo mismo en cada generación. Notas y recibos se construyen
 * sobre las ventas existentes para que cliente, factura y usuario sean coherentes con el resto del prototipo.
 */
import type { Venta } from '../../types/venta';

const at = (month: number, day: number, h = 10) => new Date(2026, month, day, h, 0).getTime();
const DIA = 86_400_000;
const rr = <T,>(lista: T[], i: number, vacio: T): T => (lista.length ? lista[i % lista.length] : vacio);

// ─── Cotizaciones ────────────────────────────────────────────────────────────

export type EstadoCotizacion = 'No facturada' | 'Facturada' | 'Anulada' | 'Pagada';

export interface Cotizacion {
  id: string; fecha: number; codigo: string; sucursal: string; usuario: string; vendedor: string; cliente: string;
  descuento: number; subtotal: number; total: number; estado: EstadoCotizacion;
}

const COTIZACIONES: { mes: number; dia: number; subtotal: number; descuento: number; estado: EstadoCotizacion }[] = [
  { mes: 8, dia: 29, subtotal: 172030, descuento: 0, estado: 'No facturada' },
  { mes: 8, dia: 29, subtotal: 100000, descuento: 0, estado: 'Facturada' },
  { mes: 8, dia: 30, subtotal: 515200, descuento: 15200, estado: 'No facturada' },
  { mes: 9, dia: 1, subtotal: 47600, descuento: 0, estado: 'Pagada' },
  { mes: 9, dia: 1, subtotal: 215000, descuento: 0, estado: 'Anulada' },
  { mes: 9, dia: 2, subtotal: 1455900, descuento: 55900, estado: 'No facturada' },
  { mes: 9, dia: 5, subtotal: 89900, descuento: 0, estado: 'Facturada' },
  { mes: 9, dia: 8, subtotal: 320000, descuento: 20000, estado: 'Pagada' },
  { mes: 9, dia: 12, subtotal: 64146, descuento: 0, estado: 'No facturada' },
  { mes: 9, dia: 15, subtotal: 4284000, descuento: 84000, estado: 'No facturada' },
  { mes: 9, dia: 20, subtotal: 111900, descuento: 0, estado: 'Facturada' },
  { mes: 9, dia: 22, subtotal: 35700, descuento: 0, estado: 'Anulada' },
];

export function cotizacionesSeed(ctx: { clientes: string[]; vendedores: string[]; sucursales: string[]; usuarios: string[] }): Cotizacion[] {
  return COTIZACIONES.map((c, i) => ({
    id: `cot-${i + 1}`, fecha: at(c.mes, c.dia, 9 + (i % 8)), codigo: String(770 + i), sucursal: rr(ctx.sucursales, i, '—'),
    usuario: rr(ctx.usuarios, i, '—'), vendedor: rr(ctx.vendedores, i + 1, '—'), cliente: rr(ctx.clientes, i, '—'),
    descuento: c.descuento, subtotal: c.subtotal, total: c.subtotal - c.descuento, estado: c.estado,
  }));
}

// ─── Notas crédito y débito ──────────────────────────────────────────────────

export type EstadoDianNota = 'Aceptada' | 'Pendiente' | 'Rechazada';

export interface NotaElectronica {
  id: string; tipo: 'credito' | 'debito'; fecha: number; numero: string; factura: string; cliente: string; sucursal: string;
  usuario: string; vendedor: string; subtotal: number; descuento: number; total: number; estadoDian: EstadoDianNota;
}

const NOTAS_CREDITO: { pct: number; dian: EstadoDianNota }[] = [
  { pct: 1, dian: 'Aceptada' }, { pct: 0.4, dian: 'Aceptada' }, { pct: 0.25, dian: 'Pendiente' },
  { pct: 0.6, dian: 'Aceptada' }, { pct: 0.1, dian: 'Rechazada' }, { pct: 0.5, dian: 'Aceptada' },
];
const NOTAS_DEBITO: { pct: number; dian: EstadoDianNota }[] = [
  { pct: 0.05, dian: 'Aceptada' }, { pct: 0.03, dian: 'Pendiente' }, { pct: 0.08, dian: 'Aceptada' },
];

/** Una nota por factura de venta existente (en orden de emisión): total = % del subtotal más el IVA de la factura. */
export function notasSeed(ventas: Venta[]): NotaElectronica[] {
  const facturas = ventas.filter(v => v.tipoDoc === 'factura' && v.estado !== 'abierta').sort((a, b) => a.emitidaEn - b.emitidaEn);
  const armar = (tipo: 'credito' | 'debito', base: typeof NOTAS_CREDITO, prefijo: string, primero: number, salto: number): NotaElectronica[] =>
    base.flatMap((n, i) => {
      const f = facturas[(i * salto) % Math.max(facturas.length, 1)];
      if (!f) return [];
      const subtotal = Math.round(f.subtotal * n.pct);
      return [{
        id: `${tipo}-${i + 1}`, tipo, fecha: f.emitidaEn + (i + 1) * DIA, numero: `${prefijo} ${primero + i}`, factura: f.numero, cliente: f.cliente,
        sucursal: f.sucursal, usuario: f.emitidoPor, vendedor: f.vendedor, subtotal, descuento: 0,
        total: Math.round(subtotal * (1 + f.taxRate)), estadoDian: n.dian,
      }];
    });
  return [...armar('credito', NOTAS_CREDITO, 'NCR', 391, 1), ...armar('debito', NOTAS_DEBITO, 'NDB', 78, 2)];
}

// ─── Recibos ─────────────────────────────────────────────────────────────────

export interface Recibo {
  id: string; numero: string; fecha: number; documento: string; cliente: string; metodo: string; usuario: string; sucursal: string;
  total: number; anulado: boolean;
}

const METODOS_RECIBO = ['Efectivo', 'Bold', 'Nequi', 'Credibanco', 'Transferencia bancaria'];

/** Recibos que abonan a documentos de venta ya existentes: 50 % del total, un día después. Uno de cada cinco, anulado. */
export function recibosSeed(ventas: Venta[]): Recibo[] {
  return ventas
    .filter(v => (v.tipoDoc === 'comprobante' || v.tipoDoc === 'factura') && v.estado === 'pagada')
    .sort((a, b) => a.emitidaEn - b.emitidaEn)
    .slice(0, 10)
    .map((v, i) => ({
      id: `rec-${i + 1}`, numero: String(8500 + i), fecha: v.emitidaEn + DIA, cliente: v.cliente, sucursal: v.sucursal, usuario: v.emitidoPor,
      documento: `${v.tipoDoc === 'factura' ? 'Factura de Venta' : 'Comprobante'} ${v.numero}`, metodo: rr(METODOS_RECIBO, i, 'Efectivo'),
      total: Math.round(v.total * 0.5), anulado: i % 5 === 4,
    }));
}

// ─── Gastos ──────────────────────────────────────────────────────────────────

export interface Gasto {
  id: string; numero: string; fecha: number; proveedor: string; descripcion: string; categoria: string; metodo: string;
  usuario: string; sucursal: string; total: number; anulado: boolean;
}

const GASTOS: { mes: number; dia: number; categoria: string; descripcion: string; total: number; anulado?: boolean }[] = [
  { mes: 8, dia: 30, categoria: 'Servicios públicos', descripcion: 'Energía septiembre', total: 380000 },
  { mes: 9, dia: 1, categoria: 'Arriendo', descripcion: 'Arriendo del local', total: 4500000 },
  { mes: 9, dia: 2, categoria: 'Nómina', descripcion: 'Quincena', total: 2800000 },
  { mes: 9, dia: 6, categoria: 'Mercadeo', descripcion: 'Pauta en redes', total: 125000 },
  { mes: 9, dia: 9, categoria: 'Mantenimiento y reparaciones', descripcion: 'Aire acondicionado', total: 210000, anulado: true },
  { mes: 9, dia: 14, categoria: 'Transporte', descripcion: 'Envío de mercancía', total: 85000 },
  { mes: 9, dia: 19, categoria: 'Compra de inventario', descripcion: 'Reposición de accesorios', total: 640000 },
  { mes: 9, dia: 22, categoria: 'Otros', descripcion: 'Papelería', total: 38000 },
];

export function gastosSeed(ctx: { proveedores: string[]; categorias: string[]; metodos: string[]; usuarios: string[]; sucursales: string[] }): Gasto[] {
  return GASTOS.map((g, i) => ({
    id: `gas-${i + 1}`, numero: String(440 + i), fecha: at(g.mes, g.dia, 11), proveedor: rr(ctx.proveedores, i, '—'), descripcion: g.descripcion,
    categoria: ctx.categorias.includes(g.categoria) ? g.categoria : rr(ctx.categorias, i, g.categoria), metodo: rr(ctx.metodos, i, 'Efectivo'),
    usuario: rr(ctx.usuarios, i, '—'), sucursal: rr(ctx.sucursales, i, '—'), total: g.total, anulado: !!g.anulado,
  }));
}
