/**
 * ReporteShell — esqueleto común de los reportes de Retail (specs/2026-10-reportes-retail.md §4).
 *
 * Replica la estructura del reporte real: título con volver, filtros, botones, tarjetas de resumen y tabla
 * paginada. Cada reporte declara sus filtros, tarjetas y columnas. El reporte nace vacío y solo se llena al
 * pulsar "GENERAR REPORTE" (`useFiltrosReporte`); IMPRIMIR y EXCEL son visuales.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, FileSpreadsheet } from 'lucide-react';
import { FilterDropdown } from '../../../pages/ReporteDetallePage';
import { MFONT, inputStyle, Field } from '../../../components/reportes/reporteShared';

export { fmtReporte as fmtDinero } from '../../../utils/ventasPorItems';
export { MFONT, inputStyle };

/** Valor ausente en columnas de impuestos. */
export const NA = 'N/A';

// ─── Estado de generación ────────────────────────────────────────────────────

/**
 * `filtros` se edita libremente; `aplicados` solo cambia al generar. Mientras `aplicados` es null el reporte
 * está vacío. "Limpiar filtros" restablece los filtros y vacía el reporte.
 */
export function useFiltrosReporte<F>(inicial: F) {
  const [filtros, setFiltros] = useState<F>(inicial);
  const [aplicados, setAplicados] = useState<F | null>(null);
  const [actualizadoEn, setActualizadoEn] = useState<number | null>(null);

  const set = useCallback(<K extends keyof F>(k: K) => (v: F[K]) => setFiltros(f => ({ ...f, [k]: v })), []);
  const generar = useCallback(() => { setAplicados(filtros); setActualizadoEn(Date.now()); }, [filtros]);
  const limpiar = useCallback(() => { setFiltros(inicial); setAplicados(null); setActualizadoEn(null); }, [inicial]);

  return { filtros, set, aplicados, actualizadoEn, generar, limpiar };
}

export function fmtActualizacion(ts: number): string {
  const d = new Date(ts);
  const p = (x: number) => String(x).padStart(2, '0');
  const mes = d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
  return `${d.getDate()} ${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// ─── Filtros ─────────────────────────────────────────────────────────────────

export function FiltroFechas({ desde, hasta, onDesde, onHasta, label }: {
  desde: string; hasta: string; onDesde: (v: string) => void; onHasta: (v: string) => void; label?: string;
}) {
  const campo: React.CSSProperties = { border: 'none', outline: 'none', fontFamily: MFONT, fontSize: 13, flex: 1, minWidth: 0, background: 'transparent' };
  return (
    <div>
      {label && <p style={{ fontFamily: MFONT, fontSize: 11, color: 'var(--black-60)', margin: '0 0 4px' }}>{label}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...inputStyle, padding: '0 10px' }}>
        <Calendar size={14} color="var(--blue-100)" />
        <input type="date" aria-label={`${label ?? 'Fecha'} desde`} value={desde} onChange={e => onDesde(e.target.value)} style={campo} />
        <span style={{ color: 'var(--black-40)' }}>–</span>
        <input type="date" aria-label={`${label ?? 'Fecha'} hasta`} value={hasta} onChange={e => onHasta(e.target.value)} style={campo} />
      </div>
    </div>
  );
}

/** Select a todo el ancho; la primera opción ("Todos") se muestra como el rótulo del filtro. */
export function FiltroSelect({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return <Field><FilterDropdown label={label} options={options} value={value} onChange={onChange} /></Field>;
}

export function FiltroTexto({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} aria-label={placeholder} />;
}

export function FiltroCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, fontFamily: MFONT, fontSize: 13, color: 'var(--black-100)', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--coral-100)' }} />
      {label}
    </label>
  );
}

export function FiltroRadio<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: MFONT, fontSize: 11, color: 'var(--black-60)' }}>{label}</span>
      <div style={{ display: 'flex', gap: 14, height: 28, alignItems: 'center' }}>
        {options.map(o => (
          <label key={o} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: MFONT, fontSize: 13, cursor: 'pointer' }}>
            <input type="radio" checked={value === o} onChange={() => onChange(o)} style={{ accentColor: 'var(--coral-100)' }} />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

/** Opciones de un select: "Todos" + valores únicos ordenados. */
export const opcionesTodos = (valores: string[]): string[] => ['Todos', ...Array.from(new Set(valores.filter(Boolean))).sort((a, b) => a.localeCompare(b))];

// ─── Botones y tarjetas ──────────────────────────────────────────────────────

function Boton({ label, bg, onClick, icon }: { label: string; bg: string; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 24px', borderRadius: 18, border: 'none',
        backgroundColor: bg, color: 'var(--black-0)', fontFamily: MFONT, fontSize: 12, fontWeight: 700, cursor: 'pointer',
      }}
      className="hover:opacity-90 transition-opacity"
    >
      {label}{icon}
    </button>
  );
}

export interface Tarjeta { label: string; value: string }

function TarjetaResumen({ label, value }: Tarjeta) {
  return (
    <div style={{ backgroundColor: 'var(--black-0)', borderRadius: 12, padding: '10px 16px', minWidth: 220, flex: '1 1 220px', maxWidth: 320, textAlign: 'center', boxShadow: 'var(--shadow-4)' }}>
      <p style={{ fontFamily: MFONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', margin: 0 }}>{label}</p>
      <p style={{ fontFamily: MFONT, fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>{value}</p>
    </div>
  );
}

// ─── Tabla ───────────────────────────────────────────────────────────────────

export interface Columna<T> {
  label: string;
  render: (fila: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

const th: React.CSSProperties = {
  padding: '12px 16px 12px 0', textAlign: 'left', fontFamily: MFONT, fontWeight: 700, fontSize: 13,
  color: 'var(--black-100)', borderBottom: '2px solid var(--black-10)', whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: '12px 16px 12px 0', fontFamily: MFONT, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
  color: 'var(--black-100)', lineHeight: '18px',
};

function Paginacion({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  const inicio = Math.max(0, Math.min(page - 2, pages - 5));
  const numeros = Array.from({ length: Math.min(5, pages) }, (_, i) => inicio + i);
  const link = (label: string, to: number, off: boolean) => (
    <button key={label} type="button" disabled={off} onClick={() => onPage(to)}
      style={{ background: 'none', border: 'none', fontFamily: MFONT, fontSize: 12, fontWeight: 600, padding: '4px 8px', cursor: off ? 'not-allowed' : 'pointer', color: off ? 'var(--black-40)' : 'var(--black-100)' }}>
      {label}
    </button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, flexWrap: 'wrap', gap: 8 }}>
      <span style={{ fontFamily: MFONT, fontSize: 12, color: 'var(--black-60)' }}>Página {page + 1} de {pages}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {link('PRIMERA', 0, page === 0)}
        {link('ANTERIOR', page - 1, page === 0)}
        {numeros.map(n => (
          <button key={n} type="button" onClick={() => onPage(n)} aria-current={n === page ? 'page' : undefined}
            style={{
              width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', fontFamily: MFONT, fontSize: 12, fontWeight: 600,
              backgroundColor: n === page ? 'var(--black-100)' : 'transparent', color: n === page ? 'var(--black-0)' : 'var(--black-100)',
            }}>
            {n + 1}
          </button>
        ))}
        {link('SIGUIENTE', page + 1, page >= pages - 1)}
        {link('ÚLTIMA', pages - 1, page >= pages - 1)}
      </div>
    </div>
  );
}

// ─── Shell ───────────────────────────────────────────────────────────────────

interface ReporteShellProps<T> {
  titulo: string;
  filtros: React.ReactNode;
  generado: boolean;
  actualizadoEn: number | null;
  onGenerar: () => void;
  onLimpiar: () => void;
  tarjetas: Tarjeta[];
  columnas: Columna<T>[];
  filas: T[];
  rowKey: (fila: T) => string;
  generarLabel?: string;
  excelLabel?: string;
  /** Filas de totales opcionales bajo la tabla (p. ej. "Total"). */
  pie?: React.ReactNode;
  /** Texto centrado sobre la tabla una vez generado (p. ej. "Fecha de Reporte - Oct 26, 2026"). */
  tituloTabla?: string;
  /** Reportes que en el real no traen "Limpiar filtros" y/o "Imprimir" (Lista de Contactos). */
  sinLimpiar?: boolean;
  sinImprimir?: boolean;
  /** Contenido propio en lugar de la tabla (Cierres de Caja); solo se muestra una vez generado. */
  cuerpo?: React.ReactNode;
}

export function ReporteShell<T>({
  titulo, filtros, generado, actualizadoEn, onGenerar, onLimpiar, tarjetas, columnas, filas, rowKey,
  generarLabel = 'GENERAR REPORTE', excelLabel = 'GENERAR EXCEL', pie, tituloTabla, sinLimpiar, sinImprimir, cuerpo,
}: ReporteShellProps<T>) {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);

  // Un reporte nuevo (o un cambio del tamaño de página) vuelve a la primera página.
  useEffect(() => { setPage(0); }, [actualizadoEn, pageSize]);

  const pages = Math.max(1, Math.ceil(filas.length / pageSize));
  const pageSafe = Math.min(page, pages - 1);
  const visibles = filas.slice(pageSafe * pageSize, pageSafe * pageSize + pageSize);
  const actualizacion = actualizadoEn
    ? <p style={{ fontFamily: MFONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', margin: '0 0 8px' }}>Última actualización del reporte a las: {fmtActualizacion(actualizadoEn)}</p>
    : null;

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button" onClick={() => navigate('/reportes')} aria-label="Volver a Reportes"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, border: '1px solid var(--blue-20)', backgroundColor: 'var(--black-0)', cursor: 'pointer', flexShrink: 0 }}
          className="hover:bg-[var(--blue-10)] transition-colors"
        >
          <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
        </button>
        <h1 style={{ fontFamily: MFONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0 }}>{titulo}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, alignItems: 'end' }}>{filtros}</div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Boton label={generarLabel} bg="var(--blue-100)" onClick={onGenerar} />
        {!sinLimpiar && <Boton label="LIMPIAR FILTROS" bg="var(--black-100)" onClick={onLimpiar} />}
        {!sinImprimir && <Boton label="IMPRIMIR" bg="var(--blue-100)" onClick={() => toast.info('Próximamente')} />}
        <Boton label={excelLabel} bg="var(--coral-100)" onClick={() => toast.info('Próximamente')} icon={<FileSpreadsheet size={14} />} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        {tarjetas.map(t => <TarjetaResumen key={t.label} {...t} />)}
      </div>

      {cuerpo !== undefined ? (generado ? <div style={{ backgroundColor: 'var(--black-0)', borderRadius: 16, padding: 20 }}>{actualizacion}{cuerpo}</div> : null) : (
      <div style={{ backgroundColor: 'var(--black-0)', borderRadius: 16, padding: '20px 20px 12px', display: 'flex', flexDirection: 'column' }}>
        {actualizacion}
        {generado && tituloTabla && <p style={{ fontFamily: MFONT, fontSize: 18, fontWeight: 500, color: 'var(--black-100)', textAlign: 'center', margin: '8px 0 12px' }}>{tituloTabla}</p>}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: MFONT, fontSize: 12, color: 'var(--blue-100)', marginBottom: 12 }}>
          Mostrar
          <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
            style={{ height: 26, border: '1px solid var(--blue-20)', borderRadius: 4, fontFamily: MFONT, fontSize: 12, color: 'var(--black-100)', background: 'var(--black-0)' }}>
            {[25, 50, 100, 250, 500].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          items
        </label>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{columnas.map(c => <th key={c.label} style={{ ...th, textAlign: c.align ?? 'left' }}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {generado && visibles.length === 0 && (
                <tr><td colSpan={columnas.length} style={{ ...td, textAlign: 'center', color: 'var(--black-60)', padding: '32px 0' }}>No hay datos con estos filtros</td></tr>
              )}
              {visibles.map((fila, idx) => (
                <tr key={rowKey(fila)} style={{ borderBottom: idx === visibles.length - 1 && !pie ? 'none' : '1px solid var(--black-10)' }} className="hover:bg-[var(--blue-10)] transition-colors">
                  {columnas.map(c => <td key={c.label} style={{ ...td, textAlign: c.align ?? 'left' }}>{c.render(fila)}</td>)}
                </tr>
              ))}
              {generado && pie}
            </tbody>
          </table>
        </div>

        {generado && actualizacion && <div style={{ marginTop: 8 }}>{actualizacion}</div>}
        {generado && filas.length > 0 && <Paginacion page={pageSafe} pages={pages} onPage={setPage} />}
        {!generado && <p style={{ fontFamily: MFONT, fontSize: 12, color: 'var(--black-60)', margin: '12px 0 0' }}>Página 1 de 0</p>}
      </div>
      )}
    </div>
  );
}
