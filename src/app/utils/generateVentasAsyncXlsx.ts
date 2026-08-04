/**
 * generateVentasAsyncXlsx — genera y descarga un .xlsx real con datos mock
 * determinísticos para un job del reporte "Ventas Async" (mismas columnas
 * que el reporte síncrono "Ventas" en ReporteDetallePage).
 */

import * as XLSX from 'xlsx';
import type { AsyncReportJob } from '../store/asyncReportsStore';

const MESEROS = ['Carlos Pérez', 'Laura Gómez', 'Miguel Torres', 'Ana Ruiz'];
const FORMAS_PAGO = ['Efectivo', 'Tarjeta', 'Nequi', 'Daviplata'];
const ESTADOS: Array<{ label: string }> = [{ label: 'Pagada' }, { label: 'Pendiente' }, { label: 'Cancelada' }];

/** PRNG determinístico (mulberry32) — misma seed produce siempre las mismas filas. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}

export function generateVentasAsyncXlsx(job: AsyncReportJob): void {
  const rand = mulberry32(hashSeed(job.id));
  const rowCount = 15 + Math.floor(rand() * 20);

  const rows = Array.from({ length: rowCount }, (_, i) => {
    const subtotal   = Math.round((50_000 + rand() * 200_000) / 100) * 100;
    const descuento  = rand() > 0.7 ? Math.round(subtotal * 0.05 / 100) * 100 : 0;
    const impuestos  = Math.round(subtotal * 0.19 / 100) * 100;
    const total      = subtotal - descuento + impuestos;
    const propina    = job.filters.includeTip ? Math.round(subtotal * 0.1 / 100) * 100 : 0;
    const estado     = ESTADOS[Math.floor(rand() * ESTADOS.length)].label;

    const row: Record<string, string | number> = {
      'No. Documento':     `V-${(100000 + Math.floor(rand() * 899999))}`,
      'Fecha':             job.rangeFrom,
      'Usuario':           MESEROS[Math.floor(rand() * MESEROS.length)],
      'Forma de pago':     FORMAS_PAGO[Math.floor(rand() * FORMAS_PAGO.length)],
      'Subtotal':          subtotal,
      'Descuento':         descuento,
      'Impuestos':         impuestos,
      'Total sin propina': total,
      'Estado':            estado,
    };
    if (job.filters.includeTip) {
      row['Propina'] = propina;
      row['Total con propina'] = total + propina;
    }
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook  = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

  const filename = `Ventas_Async_${job.rangeFrom}_a_${job.rangeTo}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
