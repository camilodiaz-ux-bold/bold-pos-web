/**
 * imprimirTabla — imprime un reporte tabular (título, filtros aplicados, columnas y filas) desde un iframe oculto,
 * sin abrir ventanas emergentes. Usado por el informe de devoluciones (specs/2026-11-devoluciones.md §9).
 */
export interface ReporteImprimible {
  titulo: string;
  /** Líneas con los filtros aplicados ("Fecha: 2026-08-20 a 2026-11-18"). */
  filtros: string[];
  /** Líneas de resumen (p. ej. "Total devoluciones: 12"). */
  resumen: string[];
  columnas: string[];
  filas: string[][];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function imprimirTabla(r: ReporteImprimible): void {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(r.titulo)}</title>
<style>
  @page { size: landscape; margin: 12mm; }
  body { font-family: Montserrat, Arial, sans-serif; color: #1e1e1e; font-size: 11px; }
  h1 { font-size: 16px; margin: 0 0 6px; }
  p { margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { text-align: left; padding: 5px 6px; border-bottom: 1px solid #ddd; }
  th { border-bottom: 2px solid #1e1e1e; }
</style></head><body>
<h1>${esc(r.titulo)}</h1>
${r.filtros.map(f => `<p>${esc(f)}</p>`).join('')}
${r.resumen.map(f => `<p><strong>${esc(f)}</strong></p>`).join('')}
<table><thead><tr>${r.columnas.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
<tbody>${r.filas.map(f => `<tr>${f.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc || !iframe.contentWindow) { iframe.remove(); return; }
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 1000);
  }, 100);
}
