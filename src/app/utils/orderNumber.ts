/**
 * orderNumber.ts — Consecutivo global de comanda / orden de Restaurantes
 * (specs/2026-10-ventas-dinamicas.md). Mesas y Mostrador lo comparten, así que
 * un número nunca se repite. El mismo número es el "ORD####" de la venta.
 * Llamarlo solo desde handlers de eventos: nunca dentro de render ni de
 * updaters de setState (StrictMode los ejecuta dos veces).
 */
const ORDER_SEQ_KEY = 'bold-pos:order-seq:v1';
/** ORD0001–ORD0010 son las ventas sembradas (data/ventasSeed.ts). */
export const ORDER_SEQ_START = 11;

export function nextOrderNumber(): number {
  let n = ORDER_SEQ_START;
  try {
    const last = parseInt(localStorage.getItem(ORDER_SEQ_KEY) ?? '', 10);
    if (Number.isFinite(last) && last >= ORDER_SEQ_START) n = last + 1;
    localStorage.setItem(ORDER_SEQ_KEY, String(n));
  } catch { /* storage no disponible */ }
  return n;
}

export function formatOrderNumber(n: number): string {
  return `ORD${String(n).padStart(4, '0')}`;
}
