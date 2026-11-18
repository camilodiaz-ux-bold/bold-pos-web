/**
 * generateDevolucionesXlsx — Excel del informe de devoluciones (specs/2026-11-devoluciones.md §9): título, filtros
 * aplicados, resumen y la tabla con las mismas columnas del informe. Genera y descarga un .xlsx real con la librería `xlsx`.
 */
import * as XLSX from 'xlsx';
import type { ReporteImprimible } from './imprimirTabla';

export function descargarDevolucionesXlsx(r: ReporteImprimible, nombreArchivo: string): void {
  const filas: (string | number)[][] = [
    [r.titulo],
    ...r.filtros.map(f => [f]),
    ...r.resumen.map(f => [f]),
    [],
    r.columnas,
    ...r.filas,
  ];
  const hoja = XLSX.utils.aoa_to_sheet(filas);
  hoja['!cols'] = r.columnas.map((c, i) => ({ wch: Math.min(40, Math.max(c.length, ...r.filas.map(f => (f[i] ?? '').length)) + 2) }));
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Devoluciones');
  XLSX.writeFile(libro, nombreArchivo);
}
