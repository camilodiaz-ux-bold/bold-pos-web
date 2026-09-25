/**
 * ItemsFilterBar — fila de filtros del listado. 9 filtros en 3 filas: la
 * primera siempre visible ("Buscar por tipo" + "Buscar por nombre" + link
 * "Ver más/menos filtros"), las otras dos se expanden bajo ese link.
 */
import React from 'react';
import { Package, Search, Hash, FileText, Tag, Store, CircleDot, Ruler, ChevronDown } from 'lucide-react';
import { FilterPillSelect, FilterPillInput } from './FilterPill';
import { CAT_DEFS } from '../../data/productCatalog';
import { UNIDADES, SUCURSALES } from '../../data/itemsCatalogs';

export interface ItemsFilters {
  tipo: '' | 'inventariable' | 'no-inventariable';
  nombre: string;
  codigo: string;
  descripcion: string;
  referencia: string;
  sucursalId: string;
  estado: '' | 'activo' | 'inactivo';
  unidadId: string;
  categoriaId: string;
}

export const EMPTY_FILTERS: ItemsFilters = {
  tipo: '', nombre: '', codigo: '', descripcion: '', referencia: '',
  sucursalId: '', estado: '', unidadId: '', categoriaId: '',
};

interface ItemsFilterBarProps {
  filters: ItemsFilters;
  setFilter: <K extends keyof ItemsFilters>(key: K, value: ItemsFilters[K]) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

const TIPO_OPTIONS = [
  { value: 'inventariable', label: 'Inventariable' },
  { value: 'no-inventariable', label: 'No inventariable' },
];

const ESTADO_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

export function ItemsFilterBar({ filters, setFilter, expanded, onToggleExpanded }: ItemsFilterBarProps) {
  const unidadOptions = UNIDADES.map(u => ({ value: u.id, label: u.label }));
  const sucursalOptions = SUCURSALES.map(s => ({ value: s.id, label: s.label }));
  const categoriaOptions = CAT_DEFS.map(c => ({ value: c.id, label: c.name }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 220 }}>
          <FilterPillSelect
            icon={<Package size={16} color="var(--blue-50)" />}
            placeholder="Buscar por tipo"
            value={filters.tipo}
            onChange={v => setFilter('tipo', v as ItemsFilters['tipo'])}
            options={TIPO_OPTIONS}
          />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <FilterPillInput
            icon={<Search size={16} color="var(--blue-50)" />}
            placeholder="Buscar por nombre"
            value={filters.nombre}
            onChange={v => setFilter('nombre', v)}
          />
        </div>
        <button
          type="button"
          onClick={onToggleExpanded}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--blue-100)',
            whiteSpace: 'nowrap', fontFamily: "'Montserrat', sans-serif",
          }}
        >
          {expanded ? 'Ver menos filtros' : 'Ver más filtros'}
          <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} />
        </button>
      </div>

      {expanded && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <FilterPillInput icon={<Hash size={16} color="var(--blue-50)" />} placeholder="Buscar por código" value={filters.codigo} onChange={v => setFilter('codigo', v)} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <FilterPillInput icon={<FileText size={16} color="var(--blue-50)" />} placeholder="Buscar por descripción" value={filters.descripcion} onChange={v => setFilter('descripcion', v)} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <FilterPillInput icon={<Tag size={16} color="var(--blue-50)" />} placeholder="Buscar por referencia" value={filters.referencia} onChange={v => setFilter('referencia', v)} />
            </div>
            <div style={{ width: 220 }}>
              <FilterPillSelect icon={<Store size={16} color="var(--blue-50)" />} placeholder="Buscar por sucursal" value={filters.sucursalId} onChange={v => setFilter('sucursalId', v)} options={sucursalOptions} />
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ width: 200 }}>
              <FilterPillSelect icon={<CircleDot size={16} color="var(--blue-50)" />} placeholder="Buscar por estado" value={filters.estado} onChange={v => setFilter('estado', v as ItemsFilters['estado'])} options={ESTADO_OPTIONS} />
            </div>
            <div style={{ width: 200 }}>
              <FilterPillSelect icon={<Ruler size={16} color="var(--blue-50)" />} placeholder="Buscar por unidad" value={filters.unidadId} onChange={v => setFilter('unidadId', v)} options={unidadOptions} />
            </div>
            <div style={{ width: 220 }}>
              <FilterPillSelect icon={<Tag size={16} color="var(--blue-50)" />} placeholder="Buscar por categoría" value={filters.categoriaId} onChange={v => setFilter('categoriaId', v)} options={categoriaOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
