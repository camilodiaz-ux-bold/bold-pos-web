/**
 * AlertasStockPage — Items → Alertas de Stock (specs/2026-10-alertas-stock.md). Lista compacta de ítems
 * inventariables donde se define el "stock bajo" y se activa la alerta por ítem, variante y sucursal.
 * Sin filtro de sucursal la edición aplica a todas las sucursales de la unidad (con aviso claro).
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, Info, Search, Store, Tag } from 'lucide-react';
import { useItems } from '../../store/itemsStore';
import type { Item, ItemSucursal, ItemVariante } from '../../types/item';
import { getVarianteLabel, getVariantes, itemEnSucursal } from '../../types/item';
import { SUCURSALES } from '../../data/itemsCatalogs';
import { formatExistencia } from '../../utils/format';
import {
  esAlertable, prioridadAlerta, resumirAlerta, unidadesDe, variantesAlertables, type ResumenAlerta,
} from '../../utils/alertasStock';
import { useCatalog } from '../../vertical';
import { FilterPillInput, FilterPillSelect } from '../../components/items/FilterPill';
import { AlertaCheck, SegmentedSwitch, StockBajoInput } from '../../components/items/alertas/AlertaControles';
import { MenuFila } from '../../components/items/alertas/MenuFila';
import { VerSucursalesModal } from '../../components/items/alertas/VerSucursalesModal';

const FONT = "'Montserrat', sans-serif";
const PAGE_SIZE = 25;

type Orden = 'alfabetico' | 'alerta';
type Vista = 'todo' | 'alertas';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const porNombre = (a: Item, b: Item) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
const nombreSucursal = (id: string) => SUCURSALES.find(s => s.id === id)?.label ?? id;

const thStyle: React.CSSProperties = {
  padding: '10px 12px 10px 0', textAlign: 'left', fontFamily: FONT, fontWeight: 700, fontSize: 12,
  color: 'var(--black-100)', borderBottom: '2px solid var(--black-10)', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '8px 12px 8px 0', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)',
  borderBottom: '1px solid var(--black-10)', verticalAlign: 'middle',
};

/** Una fila de la lista: un ítem simple, una variante o el padre de sus variantes (sin controles). */
interface Unidad {
  key: string;
  itemId: string;
  variantId?: string;
  codigo: string;
  nombre: string;
  /** Nombre completo para los toasts. */
  titulo: string;
  sucursales: ItemSucursal[];
  hijo?: boolean;
}

export function AlertasStockPage() {
  const navigate = useNavigate();
  const { items, setAlertaStock } = useItems();
  const { catDefs } = useCatalog();
  const [sucursalId, setSucursalId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<Orden>('alfabetico');
  const [vista, setVista] = useState<Vista>('todo');
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<{ itemId: string; variantId?: string } | null>(null);

  const suc = sucursalId || undefined;
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(0); };

  const filas = useMemo(() => {
    const q = norm(busqueda.trim());
    const soloAlertas = vista === 'alertas';
    const out: Array<{ item: Item; variantes?: ItemVariante[] }> = [];
    for (const item of items) {
      if (!esAlertable(item)) continue;
      if (categoriaId && item.categoriaId !== categoriaId) continue;
      if (suc && !itemEnSucursal(item, suc)) continue;
      const coincide = (nombre: string, codigo: string) => !q || norm(nombre).includes(q) || norm(codigo).includes(q);
      if (getVariantes(item)) {
        const padreCoincide = coincide(item.nombre, item.codigo);
        const variantes = variantesAlertables(item, suc).filter(v =>
          (padreCoincide || coincide(`${item.nombre} ${getVarianteLabel(v)}`, v.codigo))
          && (!soloAlertas || resumirAlerta(v.sucursales, suc).activa));
        if (variantes.length > 0) out.push({ item, variantes });
      } else {
        if (!coincide(item.nombre, item.codigo)) continue;
        if (soloAlertas && !resumirAlerta(item.sucursales, suc).activa) continue;
        out.push({ item });
      }
    }
    return out.sort((a, b) => {
      if (orden === 'alerta') {
        const d = prioridadAlerta(a.item, suc) - prioridadAlerta(b.item, suc);
        if (d !== 0) return d;
      }
      return porNombre(a.item, b.item);
    });
  }, [items, categoriaId, suc, busqueda, orden, vista]);

  const totalPages = Math.max(1, Math.ceil(filas.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pagina = filas.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const toggleExpandido = (id: string) => setExpandidos(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const guardarUmbral = (u: Unidad, r: ResumenAlerta, valor: number | null) => {
    const ids = r.alcance.map(s => s.sucursalId);
    setAlertaStock(u.itemId, { sucursalIds: ids, variantId: u.variantId, stockBajo: valor });
    toast.success(
      ids.length > 1
        ? `Stock bajo ${valor === null ? 'borrado' : 'guardado'} en las ${ids.length} sucursales de «${u.titulo}»`
        : `Stock bajo ${valor === null ? 'borrado' : 'guardado'} — «${u.titulo}»`,
    );
  };
  const cambiarAlerta = (u: Unidad, r: ResumenAlerta, activa: boolean) => {
    const ids = r.alcance.map(s => s.sucursalId);
    setAlertaStock(u.itemId, { sucursalIds: ids, variantId: u.variantId, alerta: activa });
    const verbo = activa ? 'activada' : 'inactivada';
    toast.success(ids.length > 1 ? `Alerta ${verbo} en las ${ids.length} sucursales de «${u.titulo}»` : `Alerta ${verbo} — «${u.titulo}»`);
  };

  const renderUnidad = (u: Unidad) => {
    const r = resumirAlerta(u.sucursales, suc);
    const n = r.alcance.length;
    const multi = !suc && n > 1;
    const aviso = multi ? `Se aplica a las ${n} sucursales` : undefined;
    const sucursalTxt = suc ? nombreSucursal(suc) : n > 1 ? `Todas (${n})` : n === 1 ? nombreSucursal(r.alcance[0].sucursalId) : '—';
    return (
      <tr key={u.key} style={{ backgroundColor: u.hijo ? 'var(--blue-10)' : undefined }}>
        <td style={{ ...tdStyle, width: 36 }} />
        <td style={{ ...tdStyle, width: 120 }}>{u.codigo}</td>
        <td style={{ ...tdStyle, fontWeight: 700, paddingLeft: u.hijo ? 16 : 0 }}>{u.nombre}</td>
        <td style={{ ...tdStyle, width: 150 }}>{sucursalTxt}</td>
        <td style={{ ...tdStyle, width: 100, fontWeight: 700, color: r.disparada ? 'var(--coral-100)' : undefined }}>
          {formatExistencia(r.existencia)}
        </td>
        <td style={{ ...tdStyle, width: 150 }}>
          <StockBajoInput
            valor={r.stockBajo}
            onGuardar={v => guardarUmbral(u, r, v)}
            title={aviso}
            ariaLabel={`Stock bajo de ${u.titulo}`}
          />
        </td>
        <td style={{ ...tdStyle, width: 80 }}>
          <AlertaCheck
            valor={r.alerta}
            disabled={!r.alertable}
            onChange={v => cambiarAlerta(u, r, v)}
            title={!r.alertable ? 'Define el stock bajo para activar la alerta' : aviso}
            ariaLabel={`Alerta de ${u.titulo}`}
          />
        </td>
        <td style={{ ...tdStyle, width: 44, paddingRight: 0 }}>
          <MenuFila ariaLabel={`Más acciones de ${u.titulo}`} onVerSucursales={() => setModal({ itemId: u.itemId, variantId: u.variantId })} />
        </td>
      </tr>
    );
  };

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0 }}>
          Alertas de Stock
        </p>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-outline-coral" onClick={() => navigate('/items/alertas-stock/actualizacion-masiva')}>
            Actualización masiva
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 220 }}>
          <FilterPillSelect
            icon={<Store size={16} color="var(--blue-50)" />}
            placeholder="Todas las sucursales"
            value={sucursalId}
            onChange={reset(setSucursalId)}
            options={SUCURSALES.map(s => ({ value: s.id, label: s.label }))}
          />
        </div>
        <div style={{ width: 220 }}>
          <FilterPillSelect
            icon={<Tag size={16} color="var(--blue-50)" />}
            placeholder="Todas las categorías"
            value={categoriaId}
            onChange={reset(setCategoriaId)}
            options={catDefs.map(c => ({ value: c.id, label: c.name }))}
          />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <FilterPillInput
            icon={<Search size={16} color="var(--blue-50)" />}
            placeholder="Buscar por nombre"
            value={busqueda}
            onChange={reset(setBusqueda)}
          />
        </div>
      </div>

      {/* Switches */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
        <SegmentedSwitch<Orden>
          ariaLabel="Orden"
          value={orden}
          onChange={reset(setOrden)}
          options={[{ value: 'alfabetico', label: 'Alfabético' }, { value: 'alerta', label: 'Por alerta' }]}
        />
        <SegmentedSwitch<Vista>
          ariaLabel="Vista"
          value={vista}
          onChange={reset(setVista)}
          options={[{ value: 'todo', label: 'Ver todo' }, { value: 'alertas', label: 'Solo alertas activas' }]}
        />
      </div>

      {/* Aviso: sin filtro de sucursal, la edición aplica a todas las sucursales */}
      {!suc && (
        <div
          role="note"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 8,
            backgroundColor: 'var(--blue-20)', color: 'var(--black-100)', fontSize: 12, lineHeight: '18px',
          }}
        >
          <Info size={16} color="var(--blue-100)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Estás viendo todas las sucursales. El stock bajo y la alerta que cambies se aplicarán a todas las sucursales del ítem.
            Para definir valores distintos por sucursal, usa ⋮ → Ver sucursales o filtra por sucursal.
          </span>
        </div>
      )}

      {/* Tabla */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '12px 20px 8px 20px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--black-60)', fontFamily: FONT, paddingBottom: 8 }}>
          Mostrando {pagina.length} de {filas.length}
        </span>

        {filas.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">Ningún ítem coincide con los filtros</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 800 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 36 }} />
                  <th style={{ ...thStyle, width: 120 }}>Código</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={{ ...thStyle, width: 150 }}>Sucursal</th>
                  <th style={{ ...thStyle, width: 100 }}>Existencia</th>
                  <th style={{ ...thStyle, width: 150 }}>Stock bajo</th>
                  <th style={{ ...thStyle, width: 80 }}>Alerta</th>
                  <th style={{ ...thStyle, width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {pagina.map(({ item, variantes }) => {
                  if (!variantes) {
                    return renderUnidad({
                      key: item.id, itemId: item.id, codigo: item.codigo, nombre: item.nombre, titulo: item.nombre, sucursales: item.sucursales,
                    });
                  }
                  const abierto = expandidos.has(item.id);
                  const existencia = variantes.reduce((a, v) => a + resumirAlerta(v.sucursales, suc).existencia, 0);
                  const disparada = unidadesDe(item, suc).some(u => resumirAlerta(u, suc).disparada);
                  return (
                    <React.Fragment key={item.id}>
                      <tr>
                        <td style={tdStyle}>
                          <button
                            type="button"
                            onClick={() => toggleExpandido(item.id)}
                            aria-label={abierto ? 'Contraer variantes' : 'Expandir variantes'}
                            aria-expanded={abierto}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--blue-100)' }}
                          >
                            {abierto ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                        </td>
                        <td style={tdStyle}>{item.codigo}</td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{item.nombre}</td>
                        <td style={tdStyle}>{suc ? nombreSucursal(suc) : 'Todas'}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: disparada ? 'var(--coral-100)' : undefined }}>{formatExistencia(existencia)}</td>
                        <td style={tdStyle} />
                        <td style={tdStyle} />
                        <td style={tdStyle} />
                      </tr>
                      {abierto && variantes.map(v => renderUnidad({
                        key: `${item.id}-${v.id}`, itemId: item.id, variantId: v.id, codigo: v.codigo, nombre: getVarianteLabel(v),
                        titulo: `${item.nombre} - ${getVarianteLabel(v)}`, sucursales: v.sucursales, hijo: true,
                      }))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, padding: '12px 0', fontSize: 13 }}>
            <button className="btn btn-cancel btn--sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Anterior</button>
            <span>{safePage + 1} / {totalPages}</span>
            <button className="btn btn-cancel btn--sm" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>Siguiente</button>
          </div>
        )}
      </div>

      {modal && <VerSucursalesModal itemId={modal.itemId} variantId={modal.variantId} onClose={() => setModal(null)} />}
    </div>
  );
}
