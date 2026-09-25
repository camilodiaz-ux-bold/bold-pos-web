/**
 * ListaItemsPage — módulo ITEMS → Lista de ítems. Orquesta filtros, tabla,
 * paginación y las acciones de fila/lote. La lógica pesada de UI vive en
 * components/items/*; esta página solo coordina estado y datos.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Plus, RefreshCw, Trash2, Package, SearchX } from 'lucide-react';
import { useItems } from '../../store/itemsStore';
import type { Item } from '../../types/item';
import { ItemsFilterBar, EMPTY_FILTERS, type ItemsFilters } from '../../components/items/ItemsFilterBar';
import { ItemsTable } from '../../components/items/ItemsTable';
import { ConfirmDeleteModal } from '../../components/items/ConfirmDeleteModal';

const PAGE_SIZE = 25;

function normalizeText(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function matchesFilters(item: Item, f: ItemsFilters): boolean {
  if (f.tipo === 'inventariable' && !item.manejaExistencias) return false;
  if (f.tipo === 'no-inventariable' && item.manejaExistencias) return false;
  if (f.nombre && !normalizeText(item.nombre).includes(normalizeText(f.nombre))) return false;
  if (f.codigo && !normalizeText(item.codigo).includes(normalizeText(f.codigo))) return false;
  if (f.descripcion && !normalizeText(item.descripcion).includes(normalizeText(f.descripcion))) return false;
  if (f.referencia && !normalizeText(item.referencia).includes(normalizeText(f.referencia))) return false;
  if (f.sucursalId && !item.sucursales.some(s => s.sucursalId === f.sucursalId)) return false;
  if (f.estado === 'activo' && !item.activo) return false;
  if (f.estado === 'inactivo' && item.activo) return false;
  if (f.unidadId && item.unidadId !== f.unidadId) return false;
  if (f.categoriaId && item.categoriaId !== f.categoriaId) return false;
  return true;
}

export function ListaItemsPage() {
  const navigate = useNavigate();
  const { items, toggleActivo, deleteItem, refresh } = useItems();

  const [filters, setFilters] = useState<ItemsFilters>(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);

  const setFilter = <K extends keyof ItemsFilters>(key: K, value: ItemsFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(0);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const filtered = useMemo(() => items.filter(item => matchesFilters(item, filters)), [items, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    setSelectedIds(prev => {
      const allSelected = pageRows.every(r => prev.has(r.id));
      const next = new Set(prev);
      pageRows.forEach(r => (allSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  };

  const handleToggleActivo = (id: string) => {
    toggleActivo(id);
    toast.success('Estado actualizado');
  };

  const handleRefresh = () => {
    refresh();
    toast.success('Lista actualizada');
  };

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      deleteItem(pendingDelete.id);
      toast.success(`"${pendingDelete.nombre}" eliminado`);
      setPendingDelete(null);
    }
  };

  const handleConfirmBulkDelete = () => {
    selectedIds.forEach(id => deleteItem(id));
    toast.success(`${selectedIds.size} ítem(s) eliminados`);
    setSelectedIds(new Set());
    setPendingBulkDelete(false);
  };

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0 }}>
          Lista de ítems
        </p>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <button className="btn btn-outline-coral" onClick={() => toast.info('Actualización masiva — próximamente')}>
            Actualización masiva
          </button>
          <button className="btn btn-outline-coral" onClick={() => toast.info('Importar — próximamente')}>
            Importar
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/items/nuevo')}>
            <Plus size={16} /> Nuevo ítem
          </button>
        </div>
      </div>

      {/* Filtros */}
      <ItemsFilterBar
        filters={filters}
        setFilter={setFilter}
        expanded={expanded}
        onToggleExpanded={() => setExpanded(e => !e)}
      />

      {/* Card blanca: barra de resultados + tabla + paginación */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '16px 20px 8px 20px', display: 'flex', flexDirection: 'column' }}>

        {/* Barra de resultados / selección */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: 12, borderBottom: '1px solid var(--black-10)',
        }}>
          {selectedIds.size > 0 ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--black-100)' }}>
                {selectedIds.size} ítem(s) seleccionado(s)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={() => { selectedIds.forEach(id => toggleActivo(id)); toast.success('Estados actualizados'); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--blue-100)', padding: 0 }}
                >
                  Activar / Desactivar
                </button>
                <button
                  onClick={() => setPendingBulkDelete(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--coral-100)', padding: 0 }}
                >
                  <Trash2 size={14} /> Eliminar
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--black-60)', padding: 0 }}
                >
                  Limpiar selección
                </button>
              </div>
            </>
          ) : (
            <>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--black-60)', fontFamily: "'Montserrat', sans-serif" }}>
                Mostrando {pageRows.length} de {filtered.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={handleRefresh}
                  className="hover:opacity-70 transition-opacity"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--blue-100)', padding: 0 }}
                >
                  <RefreshCw size={14} strokeWidth={2} /> Refrescar
                </button>
                <button
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="hover:opacity-70 transition-opacity"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                    cursor: hasActiveFilters ? 'pointer' : 'default', fontSize: 13, fontWeight: 600,
                    color: hasActiveFilters ? 'var(--black-60)' : 'var(--black-40)', padding: 0,
                  }}
                >
                  <Trash2 size={14} strokeWidth={2} /> Limpiar filtros
                </button>
              </div>
            </>
          )}
        </div>

        {/* Tabla o estado vacío */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              {items.length === 0 ? <Package size={28} /> : <SearchX size={28} />}
            </div>
            <p className="empty-state__title">
              {items.length === 0 ? 'Aún no tienes ítems' : 'Ningún ítem coincide con los filtros'}
            </p>
            {items.length === 0 ? (
              <button className="btn btn-primary btn--sm" onClick={() => navigate('/items/nuevo')}>Crear ítem</button>
            ) : (
              <button className="btn btn-cancel btn--sm" onClick={clearFilters}>Limpiar filtros</button>
            )}
          </div>
        ) : (
          <ItemsTable
            rows={pageRows}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAllOnPage}
            onToggleActivo={handleToggleActivo}
            onEdit={id => navigate(`/items/${id}/editar`)}
            onDeleteRequest={setPendingDelete}
          />
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={safePage === 0}
              style={{ fontSize: 13, fontWeight: 600, color: safePage === 0 ? 'var(--black-40)' : 'var(--blue-100)', background: 'none', border: 'none', cursor: safePage === 0 ? 'default' : 'pointer' }}
            >
              Anterior
            </button>
            <span style={{ fontSize: 13, color: 'var(--black-60)' }}>{safePage + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              style={{ fontSize: 13, fontWeight: 600, color: safePage === totalPages - 1 ? 'var(--black-40)' : 'var(--blue-100)', background: 'none', border: 'none', cursor: safePage === totalPages - 1 ? 'default' : 'pointer' }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDeleteModal
          title="¿Eliminar este ítem?"
          message={`"${pendingDelete.nombre}" se eliminará permanentemente de la lista.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {pendingBulkDelete && (
        <ConfirmDeleteModal
          title="¿Eliminar los ítems seleccionados?"
          message={`Se eliminarán ${selectedIds.size} ítem(s) permanentemente.`}
          onCancel={() => setPendingBulkDelete(false)}
          onConfirm={handleConfirmBulkDelete}
        />
      )}
    </div>
  );
}
