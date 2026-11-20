/**
 * DevolucionesPage — Ítems → Devoluciones (specs/2026-11-devoluciones-v2.md §1). Lista de devoluciones (una fila
 * por devolución) con filtros, búsqueda, paginación y modal de detalle. Solo Retail.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CalendarDays, Layers, ListChecks, Search, Store, Tag, Trash2, FileText } from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import { useCatalog } from '../../../vertical';
import { FilterPillInput, FilterPillSelect } from '../../../components/items/FilterPill';
import type { TipoDevolucion } from '../../../types/devolucion';
import { ALCANCE_DEVOLUCION_LABEL, TIPO_DEVOLUCION_LABEL } from '../../../types/devolucion';
import { formatCOP } from '../../../utils/format';
import { fmtFechaHora, isoDia } from '../../../utils/ventas';
import { agruparDevoluciones, coincideBusquedaDevolucion, itemDeDevolucion, sucursalesDelUsuario, usuarioSesion } from '../../../utils/devoluciones';
import type { DevolucionAgrupada } from '../../../utils/devoluciones';
import { RegistrarDevolucionModal } from './RegistrarDevolucionModal';
import { AbrirTurnoModal } from './AbrirTurnoModal';
import { useTurnoAbierto } from '../../../utils/turno';
import { PrototypeToolsBar } from '../../../components/PrototypeToolsBar';

const FONT = "'Montserrat', sans-serif";
const PAGE_SIZE = 50;

interface Filtros { sucursalId: string; categoriaId: string; motivoId: string; tipo: '' | TipoDevolucion; desde: string; hasta: string; busqueda: string }

const thStyle: React.CSSProperties = {
  padding: '12px 16px 12px 0', textAlign: 'left', fontFamily: FONT, fontWeight: 700, fontSize: 13, lineHeight: '18px',
  color: 'var(--black-100)', borderBottom: '2px solid var(--black-10)', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = { padding: '12px 16px 12px 0', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', lineHeight: '18px' };

function DatePill({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="filter-pill">
      <CalendarDays size={16} color="var(--blue-50)" />
      <input
        type="date" value={value} aria-label={label} onChange={e => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: value ? 'var(--black-100)' : 'var(--black-40)' }}
      />
    </div>
  );
}

export function DevolucionesPage() {
  const { ajustes } = useAjustes();
  const navigate = useNavigate();
  const { devoluciones } = useDevoluciones();
  const { catDefs } = useCatalog();

  const sucursalesUsuario = useMemo(() => sucursalesDelUsuario(ajustes), [ajustes]);
  // Con más de una sucursal el default es "todas"; con una sola, esa.
  const sucursalDefault = sucursalesUsuario.length > 1 ? '' : (sucursalesUsuario[0]?.id ?? '');
  const filtrosVacios: Filtros = { sucursalId: sucursalDefault, categoriaId: '', motivoId: '', tipo: '', desde: '', hasta: '', busqueda: '' };

  const [filtros, setFiltros] = useState<Filtros>(filtrosVacios);
  const [page, setPage] = useState(0);
  const [registrando, setRegistrando] = useState(false);
  const [abriendoTurno, setAbriendoTurno] = useState(false);
  const [turnoAbierto, setTurnoAbierto] = useTurnoAbierto();

  const setFiltro = <K extends keyof Filtros>(k: K, v: Filtros[K]) => { setFiltros(p => ({ ...p, [k]: v })); setPage(0); };
  const hayFiltros = (Object.keys(filtros) as (keyof Filtros)[]).some(k => filtros[k] !== filtrosVacios[k]);

  const idsSucursales = useMemo(() => new Set(sucursalesUsuario.map(s => s.id)), [sucursalesUsuario]);
  const visibles = useMemo(() => devoluciones.filter(d => idsSucursales.has(d.sucursalId)), [devoluciones, idsSucursales]);

  // Una fila por devolución (las filas con el mismo número). La categoría coincide si algún ítem es de ella.
  const filtradas = useMemo(() => agruparDevoluciones(visibles).filter(g => {
    const d = g.base;
    if (filtros.sucursalId && d.sucursalId !== filtros.sucursalId) return false;
    if (filtros.categoriaId && !g.filas.some(f => f.categoriaId === filtros.categoriaId)) return false;
    if (filtros.motivoId && d.motivoId !== filtros.motivoId) return false;
    if (filtros.tipo && d.tipo !== filtros.tipo) return false;
    const dia = isoDia(d.fecha);
    if (filtros.desde && dia < filtros.desde) return false;
    if (filtros.hasta && dia > filtros.hasta) return false;
    return coincideBusquedaDevolucion(d, filtros.busqueda);
  }), [visibles, filtros]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const filas = filtradas.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const sinRegistros = visibles.length === 0;

  // Si la cuenta trabaja con turnos y no hay uno abierto, primero se abre el turno (specs/2026-11-devoluciones.md §6).
  const registrar = () => {
    if (ajustes.pos.controlTurnos && !turnoAbierto) setAbriendoTurno(true);
    else setRegistrando(true);
  };

  const filaDe = (g: DevolucionAgrupada) => { const d = g.base; return (
    <tr
      key={g.numero} onClick={() => navigate(`/items/devoluciones/${d.numero}`)} style={{ borderBottom: '1px solid var(--black-10)', cursor: 'pointer' }}
      className="hover:bg-[var(--blue-10)] transition-colors"
    >
      <td style={{ ...tdStyle, fontWeight: 600 }}>{d.numero}</td>
      <td style={tdStyle}>{fmtFechaHora(d.fecha)}</td>
      <td style={tdStyle}>{itemDeDevolucion(g)}</td>
      <td style={tdStyle}>{TIPO_DEVOLUCION_LABEL[d.tipo]}</td>
      <td style={tdStyle}>{d.alcance ? ALCANCE_DEVOLUCION_LABEL[d.alcance] : '--'}</td>
      <td style={tdStyle}>{formatCOP(g.total)}</td>
      <td style={tdStyle}>{d.metodoPago}</td>
      <td style={tdStyle}>{d.responsable}</td>
    </tr>
  ); };

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0 }}>Devoluciones</p>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary" onClick={registrar}>Registrar Devolución</button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <FilterPillInput
              icon={<Search size={16} color="var(--blue-50)" />} placeholder="Buscar por número de devolución, de documento o identificación del cliente"
              value={filtros.busqueda} onChange={v => setFiltro('busqueda', v)}
            />
          </div>
          <div style={{ width: 220 }}>
            <FilterPillSelect
              icon={<Store size={16} color="var(--blue-50)" />} placeholder="Todas las sucursales" value={filtros.sucursalId}
              onChange={v => setFiltro('sucursalId', v)} options={sucursalesUsuario.map(s => ({ value: s.id, label: s.nombre }))}
            />
          </div>
          <div style={{ width: 220 }}>
            <FilterPillSelect
              icon={<Tag size={16} color="var(--blue-50)" />} placeholder="Categorías" value={filtros.categoriaId}
              onChange={v => setFiltro('categoriaId', v)} options={catDefs.filter(c => c.id !== 'combos').map(c => ({ value: c.id, label: c.name }))}
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ width: 240 }}>
            <FilterPillSelect
              icon={<ListChecks size={16} color="var(--blue-50)" />} placeholder="Motivo" value={filtros.motivoId}
              onChange={v => setFiltro('motivoId', v)} options={ajustes.motivosDevolucion.map(m => ({ value: m.id, label: m.nombre }))}
            />
          </div>
          <div style={{ width: 220 }}>
            <FilterPillSelect
              icon={<FileText size={16} color="var(--blue-50)" />} placeholder="Tipo de devolución" value={filtros.tipo}
              onChange={v => setFiltro('tipo', v as Filtros['tipo'])}
              options={(Object.keys(TIPO_DEVOLUCION_LABEL) as TipoDevolucion[]).map(t => ({ value: t, label: TIPO_DEVOLUCION_LABEL[t] }))}
            />
          </div>
          <div style={{ width: 200 }}><DatePill label="Desde" value={filtros.desde} onChange={v => setFiltro('desde', v)} /></div>
          <div style={{ width: 200 }}><DatePill label="Hasta" value={filtros.hasta} onChange={v => setFiltro('hasta', v)} /></div>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '16px 20px 8px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--black-10)' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--black-60)', fontFamily: FONT }}>Mostrando {filas.length} de {filtradas.length}</span>
          <button
            onClick={() => { setFiltros(filtrosVacios); setPage(0); }} disabled={!hayFiltros}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: hayFiltros ? 'pointer' : 'default', fontSize: 13, fontWeight: 600, fontFamily: FONT, color: hayFiltros ? 'var(--black-60)' : 'var(--black-40)', padding: 0 }}
          >
            <Trash2 size={14} strokeWidth={2} /> Limpiar filtros
          </button>
        </div>

        {filtradas.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '48px 0' }}>
            <Layers size={32} color="var(--black-40)" />
            <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: 'var(--black-60)', margin: 0 }}>
              {sinRegistros ? 'Aún no hay devoluciones registradas.' : 'No hay resultados para los filtros o la búsqueda.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 940 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 100 }}>Número</th>
                  <th style={{ ...thStyle, width: 140 }}>Fecha</th>
                  <th style={{ ...thStyle, width: 240 }}>Ítem</th>
                  <th style={{ ...thStyle, width: 120 }}>Tipo</th>
                  <th style={{ ...thStyle, width: 90 }}>Alcance</th>
                  <th style={{ ...thStyle, width: 120 }}>Valor devolución</th>
                  <th style={{ ...thStyle, width: 140 }}>Método de pago</th>
                  <th style={{ ...thStyle, width: 130 }}>Responsable</th>
                </tr>
              </thead>
              <tbody>{filas.map(filaDe)}</tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
              style={{ fontSize: 13, fontWeight: 600, color: safePage === 0 ? 'var(--black-40)' : 'var(--blue-100)', background: 'none', border: 'none', cursor: safePage === 0 ? 'default' : 'pointer' }}>
              Anterior
            </button>
            <span style={{ fontSize: 13, color: 'var(--black-60)' }}>{safePage + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage === totalPages - 1}
              style={{ fontSize: 13, fontWeight: 600, color: safePage === totalPages - 1 ? 'var(--black-40)' : 'var(--blue-100)', background: 'none', border: 'none', cursor: safePage === totalPages - 1 ? 'default' : 'pointer' }}>
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Herramienta del prototipo: simular que no hay turno abierto (barra fija abajo). */}
      <PrototypeToolsBar>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--black-60)', cursor: 'pointer' }}>
          <input type="checkbox" checked={!turnoAbierto} onChange={e => setTurnoAbierto(!e.target.checked)} style={{ accentColor: 'var(--blue-100)' }} />
          Simular que no hay turno abierto
        </label>
      </PrototypeToolsBar>

      {abriendoTurno && (
        <AbrirTurnoModal sucursal={sucursalesUsuario.find(s => s.id === usuarioSesion(ajustes).sucursalId)?.nombre ?? ''} onCancel={() => setAbriendoTurno(false)} onOpen={() => { setTurnoAbierto(true); setAbriendoTurno(false); setRegistrando(true); }} />
      )}
      {registrando && <RegistrarDevolucionModal onClose={() => setRegistrando(false)} />}
    </div>
  );
}
