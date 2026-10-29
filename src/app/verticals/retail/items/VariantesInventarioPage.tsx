/**
 * VariantesInventarioPage — módulo "Variantes de inventario" (Items, solo Retail): catálogo de tipos de
 * variante (Color, Talla…) con buscador, activar/desactivar, editar y eliminar. Réplica de
 * `/#/retail/inventory/inventory-variants` del POS real (specs/2026-10-variantes-modelo.md §4).
 */
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Search, SearchX, Trash2 } from 'lucide-react';
import type { VarianteTipo } from '../../../types/item';
import { useItems } from '../../../store/itemsStore';
import { useVariantesCatalogo } from '../../../store/variantesStore';
import { FilterPillInput } from '../../../components/items/FilterPill';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import { CrearVarianteDrawer } from './CrearVarianteDrawer';

const FONT = "'Montserrat', sans-serif";
const PAGE_SIZES = [10, 25, 50];

const thStyle: React.CSSProperties = {
  padding: '12px 16px 12px 0', textAlign: 'left', fontFamily: FONT, fontWeight: 700, fontSize: 13,
  color: 'var(--black-100)', borderBottom: '2px solid var(--black-10)', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '12px 16px 12px 0', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)',
  borderBottom: '1px solid var(--black-10)', verticalAlign: 'middle',
};

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function VariantesInventarioPage() {
  const { items } = useItems();
  const { tipos, createTipo, updateTipo, deleteTipo, toggleTipoActivo } = useVariantesCatalogo();
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [drawer, setDrawer] = useState<{ tipo?: VarianteTipo } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<VarianteTipo | null>(null);

  // Ítems que usan cada tipo — bloquea eliminar y quitar opciones en uso.
  const itemsQueUsan = (tipoId: string) => items.filter(i => i.tiposVariante?.some(t => t.tipoId === tipoId));

  const filtrados = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return tipos;
    return tipos.filter(t => norm(t.nombre).includes(q) || t.opciones.some(o => norm(o).includes(q)));
  }, [tipos, query]);
  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const filas = filtrados.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const guardar = (draft: { nombre: string; opciones: string[] }) => {
    const tipo = drawer?.tipo;
    if (!tipo) {
      createTipo(draft);
      toast.success('Variante creada');
    } else {
      const quitadas = tipo.opciones.filter(o => !draft.opciones.includes(o));
      const enUso = quitadas.find(o => itemsQueUsan(tipo.id).some(i => i.tiposVariante?.some(t => t.tipoId === tipo.id && t.opcionesActivas.includes(o))));
      if (enUso) {
        toast.error(`No puedes quitar "${enUso}": hay ítems que la usan`);
        return;
      }
      updateTipo(tipo.id, draft);
      toast.success('Variante actualizada');
    }
    setDrawer(null);
  };

  const pedirEliminar = (tipo: VarianteTipo) => {
    const usan = itemsQueUsan(tipo.id);
    if (usan.length > 0) {
      toast.error(`No puedes eliminar "${tipo.nombre}": la usan ${usan.length} ítem${usan.length === 1 ? '' : 's'}`);
      return;
    }
    setPendingDelete(tipo);
  };

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0 }}>
          Variantes de inventario
        </p>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary" onClick={() => setDrawer({})}>Nueva variante</button>
        </div>
      </div>

      <div style={{ maxWidth: 560 }}>
        <FilterPillInput
          icon={<Search size={16} color="var(--blue-50)" />}
          placeholder="Buscar por palabra clave"
          value={query}
          onChange={v => { setQuery(v); setPage(0); }}
        />
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '16px 20px 8px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 12, borderBottom: '1px solid var(--black-10)' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--black-60)', fontFamily: FONT }}>
            Mostrando {filas.length} de {filtrados.length}
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--black-60)', fontFamily: FONT, marginLeft: 'auto' }}>
            Mostrar
            <select
              value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
              className="merlin-input-filled" style={{ width: 72, padding: '4px 8px' }}
            >
              {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            ítems
          </label>
        </div>

        {filtrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><SearchX size={28} /></div>
            <p className="empty-state__title">{tipos.length === 0 ? 'Aún no tienes variantes' : 'Ninguna variante coincide con la búsqueda'}</p>
            {tipos.length === 0
              ? <button className="btn btn-primary btn--sm" onClick={() => setDrawer({})}>Nueva variante</button>
              : <button className="btn btn-cancel btn--sm" onClick={() => setQuery('')}>Limpiar búsqueda</button>}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 220 }}>Nombre</th>
                  <th style={thStyle}>Variantes</th>
                  <th style={{ ...thStyle, width: 90 }}>Activo</th>
                  <th style={{ ...thStyle, width: 100 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(t => (
                  <tr key={t.id}>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{t.nombre}</td>
                    <td style={tdStyle}>{t.opciones.join(' / ')}</td>
                    <td style={tdStyle}>
                      <input
                        type="checkbox" checked={t.activo} onChange={() => toggleTipoActivo(t.id)}
                        aria-label={`Activar/desactivar ${t.nombre}`}
                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--coral-100)' }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => setDrawer({ tipo: t })} aria-label={`Editar ${t.nombre}`}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--blue-100)' }}
                          className="hover:bg-[var(--blue-10)]"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => pedirEliminar(t)} aria-label={`Eliminar ${t.nombre}`}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--coral-100)' }}
                          className="hover:bg-[var(--coral-10)]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {drawer && <CrearVarianteDrawer tipo={drawer.tipo} onClose={() => setDrawer(null)} onSave={guardar} />}
      {pendingDelete && (
        <ConfirmDeleteModal
          title="¿Eliminar variante?"
          message={`"${pendingDelete.nombre}" se quitará del catálogo. Esta acción no se puede deshacer.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => { deleteTipo(pendingDelete.id); toast.success(`"${pendingDelete.nombre}" eliminada`); setPendingDelete(null); }}
        />
      )}
    </div>
  );
}
