/**
 * devolucionesSeed.ts — Devoluciones de ejemplo (specs/2026-11-devoluciones.md §3). DATOS DE EJEMPLO:
 * se arman de forma determinista sobre las ventas sembradas de Retail (Factura y Comprobante) y sobre
 * el catálogo Retail (Sin Documento), entre el 07/10 y el 16/11 de 2026. Pasan de 50 filas para ver la paginación.
 */
import type { Devolucion, TipoDevolucion } from '../types/devolucion';
import type { Venta } from '../types/venta';
import { buildRetailSeedVentas, VENTA_EJEMPLO_YA_DEVUELTO, VENTAS_EJEMPLO_DEVOLUCION } from './retail/ventasSeed';
import { RETAIL_ALL_PRODUCTS } from './retail/productCatalog';

export const DEVOLUCIONES_STORAGE_KEY = 'bold-pos:devoluciones:v2';
/** Primer número de devolución de la semilla (Dev-201). */
export const DEVOLUCION_NUMERO_INICIAL = 201;

const RESPONSABLES = ['Wendell Nazar', 'Rafael Arango', 'Camila Rojas', 'Laura Pineda'];
const METODOS = ['Efectivo', 'Nequi', 'Tarjeta', 'Transferencia bancaria', 'Daviplata'];
const SUCURSALES_SIN_DOC = ['suc-1', 'suc-2', 'suc-3'];
const JUSTIFICACIONES: Record<string, string> = {
  'mot-1': 'El cliente reporta una costura abierta en el producto.',
  'mot-2': 'Se entregó una referencia distinta a la solicitada.',
  'mot-3': 'La talla no corresponde a la que el cliente necesitaba.',
  'mot-4': 'El cliente decidió no quedarse con el producto.',
  'mot-5': 'Se registró en la venta un ítem que el cliente no compró.',
  'mot-6': 'Devolución acordada con el cliente en tienda.',
};
const MOTIVOS = Object.keys(JUSTIFICACIONES);

/** Generador pseudoaleatorio fijo (LCG): la semilla siempre es la misma. */
function lcg(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

const DIA = 86_400_000;
const INICIO = new Date(2026, 9, 7, 9, 0).getTime();
const FIN = new Date(2026, 10, 16, 19, 0).getTime();

interface Def { fecha: number; tipo: TipoDevolucion; venta?: Venta; lineas: { itemId: string; nombre: string; categoriaId: string; cantidad: number; valor: number }[] }

export function buildSeedDevoluciones(): Devolucion[] {
  const rnd = lcg(20261117);
  const todas = buildRetailSeedVentas();
  // Los documentos de ejemplo de Devoluciones se dejan limpios, salvo el de "Ya devuelto" (más abajo).
  const ventas = todas.filter(v => v.estado === 'pagada' && !VENTAS_EJEMPLO_DEVOLUCION.includes(v.id));
  const defs: Def[] = [];

  // Factura / Comprobante: una devolución por cada dos documentos; un ítem por documento (a veces dos). Un ítem se devuelve una sola vez.
  ventas.forEach((v, i) => {
    if (i % 2 !== 0) return;
    const tomar = v.items.length > 1 && i % 4 === 0 ? 2 : 1;
    const lineas = v.items.slice(0, tomar).map((it, j) => {
      const prod = RETAIL_ALL_PRODUCTS.find(p => String(p.id) === it.id);
      const unit = Math.round(it.price * (1 - (it.discount ?? 0) / 100) * (1 + v.taxRate));
      return { itemId: it.id, nombre: it.name, categoriaId: prod?.catId ?? 'accesorios', cantidad: Math.min(it.quantity, 1 + ((i + j) % 3)), valor: unit };
    });
    const fecha = Math.min(FIN, v.emitidaEn + (1 + Math.floor(rnd() * 9)) * DIA + Math.floor(rnd() * 6) * 3_600_000);
    defs.push({ fecha, tipo: v.tipoDoc, venta: v, lineas });
  });

  // Documento de ejemplo con un ítem ya devuelto: la primera línea de la factura 2400421.
  const yaDev = todas.find(v => v.id === VENTA_EJEMPLO_YA_DEVUELTO);
  if (yaDev) {
    const it = yaDev.items[0];
    const prod = RETAIL_ALL_PRODUCTS.find(p => String(p.id) === it.id);
    defs.push({
      fecha: Math.min(FIN, yaDev.emitidaEn + 2 * DIA), tipo: 'factura', venta: yaDev,
      lineas: [{ itemId: it.id, nombre: it.name, categoriaId: prod?.catId ?? 'accesorios', cantidad: 1, valor: Math.round(it.price * (1 + yaDev.taxRate)) }],
    });
  }

  // Sin Documento: ítems libres del catálogo.
  const catalogo = RETAIL_ALL_PRODUCTS.filter(p => p.catId !== 'combos');
  for (let k = 0; k < 32; k++) {
    const n = 1 + Math.floor(rnd() * 2);
    const usados = new Set<number>();
    const lineas: Def['lineas'] = [];
    while (lineas.length < n) {
      const p = catalogo[Math.floor(rnd() * catalogo.length)];
      if (usados.has(p.id)) continue;
      usados.add(p.id);
      const cantidad = 1 + Math.floor(rnd() * 4);
      const valor = Math.round((p.price * (0.7 + rnd() * 0.5)) / 100) * 100;
      lineas.push({ itemId: String(p.id), nombre: p.name, categoriaId: p.catId, cantidad, valor });
    }
    defs.push({ fecha: INICIO + Math.floor(rnd() * (FIN - INICIO)), tipo: 'sinDocumento', lineas });
  }

  defs.sort((a, b) => a.fecha - b.fecha);

  const filas: Devolucion[] = [];
  defs.forEach((d, idx) => {
    const numero = `Dev-${DEVOLUCION_NUMERO_INICIAL + idx}`;
    const motivoId = MOTIVOS[Math.floor(rnd() * MOTIVOS.length)];
    const metodoPago = d.venta?.pagos[0]?.method ?? METODOS[Math.floor(rnd() * METODOS.length)];
    const responsable = RESPONSABLES[Math.floor(rnd() * RESPONSABLES.length)];
    const sucursalId = d.venta ? 'suc-1' : SUCURSALES_SIN_DOC[Math.floor(rnd() * SUCURSALES_SIN_DOC.length)];
    const ingresaInventario = rnd() > 0.4;
    const turno = 520 + (idx % 10);
    d.lineas.forEach((l, j) => {
      filas.push({
        id: `dev-${numero}-${j}`, numero, fecha: d.fecha, sucursalId, turno, responsable, tipo: d.tipo,
        ...(d.venta ? { ventaId: d.venta.id, numeroDocumento: d.venta.numero, fechaVenta: d.venta.emitidaEn, valorVenta: d.venta.total } : {}),
        itemId: l.itemId, nombre: l.nombre, categoriaId: l.categoriaId, cantidad: l.cantidad,
        ...(d.tipo === 'factura' ? { impuestoId: 'iva-19', tasaImpuesto: 0.19 } : {}),
        valorDevolucion: l.valor * l.cantidad, metodoPago, motivoId, justificacion: JUSTIFICACIONES[motivoId],
        ingresaInventario,
        ...(d.tipo === 'factura' ? { notaCredito: `NCR ${390 + idx}`, estadoDian: idx % 5 === 0 ? 'rechazada' as const : idx % 7 === 0 ? 'pendiente' as const : 'aceptada' as const } : {}),
        ejemplo: true,
      });
    });
  });
  return filas;
}
