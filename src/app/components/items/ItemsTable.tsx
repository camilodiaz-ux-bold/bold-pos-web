/**
 * ItemsTable — tabla del listado de ítems. Sigue el patrón de tabla
 * canónico del proyecto (VentasPage.tsx): card blanca radius 16,
 * tableLayout:'fixed', th 13/700 con borderBottom 2px, tdStyle 13/500.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { Item } from '../../types/item';
import { getTipoLabel, getExistenciaTotal, getExistenciaVariante, getVarianteLabel, getVariantes } from '../../types/item';
import { formatCOP, formatExistencia } from '../../utils/format';
import { ItemThumb } from './ItemThumb';
import { Toggle } from './Toggle';
import { useVertical } from '../../vertical';

interface ItemsTableProps {
  rows: Item[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onToggleActivo: (id: string) => void;
  /** Activa/inactiva una variante (se guarda en el ítem). */
  onToggleVarianteActivo: (itemId: string, variantId: string) => void;
  /** Filtro de sucursal activo: las existencias se muestran solo de esa sucursal. */
  sucursalId?: string;
  onEdit: (id: string) => void;
  onDeleteRequest: (item: Item) => void;
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px 12px 0',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--black-100)',
  lineHeight: '18px',
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px 12px 0',
  textAlign: 'left',
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 700,
  fontSize: 13,
  lineHeight: '18px',
  color: 'var(--black-100)',
  borderBottom: '2px solid var(--black-10)',
  whiteSpace: 'nowrap',
};

export function ItemsTable({ rows, selectedIds, onToggleSelect, onToggleSelectAll, onToggleActivo, onToggleVarianteActivo, sucursalId, onEdit, onDeleteRequest }: ItemsTableProps) {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const { has } = useVertical();
  // Retail: un ítem con variantes es una fila padre expandible (specs/2026-10-items-variantes-lista.md);
  // las variantes viven en el ítem (specs/2026-10-variantes-modelo.md).
  const variantsOf = (item: Item) => (has('variantes') ? getVariantes(item) : undefined);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => setExpandedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Los padres con variantes no se seleccionan (como en el POS real).
  const selectable = rows.filter(r => !variantsOf(r));
  const selectedOnPage = selectable.filter(r => selectedIds.has(r.id)).length;
  const allSelected = selectable.length > 0 && selectedOnPage === selectable.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) headerCheckboxRef.current.indeterminate = someSelected;
  }, [someSelected]);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 1030 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 40 }}>
              <input
                ref={headerCheckboxRef}
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--blue-100)' }}
              />
            </th>
            <th style={{ ...thStyle, width: 56 }} />
            <th style={{ ...thStyle, width: 110 }}>Código</th>
            <th style={{ ...thStyle, width: 260, whiteSpace: 'normal' }}>Nombre / Descripción</th>
            <th style={{ ...thStyle, width: 110 }}>Referencia</th>
            <th style={{ ...thStyle, width: 100 }}>Precio</th>
            <th style={{ ...thStyle, width: 90 }}>Existencia</th>
            <th style={{ ...thStyle, width: 150 }}>Tipo de Item</th>
            <th style={{ ...thStyle, width: 70 }}>Activo</th>
            <th style={{ ...thStyle, width: 70 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((item, idx) => {
            const variantes = variantsOf(item);
            const isOpen = !!variantes && expandedIds.has(item.id);
            // Con variantes, la existencia del padre es la suma de sus variantes activas (de la sucursal filtrada, si hay).
            const existencia = getExistenciaTotal(item, sucursalId);
            const isLast = idx === rows.length - 1;
            return (
              <React.Fragment key={item.id}>
              <tr
                onClick={() => onEdit(item.id)}
                style={{ borderBottom: isLast && !isOpen ? 'none' : '1px solid var(--black-10)', cursor: 'pointer' }}
                className="hover:bg-[var(--blue-10)] transition-colors"
              >
                <td style={tdStyle} onClick={e => e.stopPropagation()}>
                  {variantes ? (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      aria-label={isOpen ? 'Contraer variantes' : 'Expandir variantes'}
                      aria-expanded={isOpen}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--blue-100)' }}
                    >
                      {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                  ) : (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => onToggleSelect(item.id)}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--blue-100)' }}
                    />
                  )}
                </td>
                <td style={tdStyle}>
                  <ItemThumb src={item.imagen} alt={item.nombre} />
                </td>
                <td style={tdStyle}>{item.codigo}</td>
                <td style={{ ...tdStyle, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</span>
                  </div>
                  {item.descripcion && (
                    <div style={{
                      fontSize: 12, fontWeight: 500, color: 'var(--black-40)', marginTop: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.descripcion}
                    </div>
                  )}
                </td>
                <td style={tdStyle}>{item.referencia || '—'}</td>
                <td style={tdStyle}>{formatCOP(variantes ? 0 : item.precioTotal)}</td>
                <td style={{ ...tdStyle, color: existencia !== null && existencia < 0 ? 'var(--coral-100)' : tdStyle.color, fontWeight: existencia !== null && existencia < 0 ? 700 : 500 }}>
                  {existencia === null ? '—' : formatExistencia(existencia)}
                </td>
                <td style={tdStyle}>{getTipoLabel(item)}</td>
                <td style={tdStyle} onClick={e => e.stopPropagation()}>
                  <Toggle size="sm" checked={item.activo} onChange={() => onToggleActivo(item.id)} ariaLabel={`Activar/desactivar ${item.nombre}`} />
                </td>
                <td style={tdStyle} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => onEdit(item.id)}
                      aria-label="Editar"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--blue-100)' }}
                      className="hover:bg-[var(--blue-10)]"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteRequest(item)}
                      aria-label="Eliminar"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--black-40)' }}
                      className="hover:bg-[var(--coral-10)]"
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--coral-100)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--black-40)')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
              {isOpen && variantes!.map((v, vi) => (
                <tr
                  key={v.id}
                  onClick={() => onEdit(item.id)}
                  style={{ borderBottom: isLast && vi === variantes!.length - 1 ? 'none' : '1px solid var(--black-10)', cursor: 'pointer' }}
                  className="hover:bg-[var(--blue-10)] transition-colors"
                >
                  <td style={tdStyle} />
                  <td style={tdStyle}><ItemThumb src={item.imagen} alt={item.nombre} /></td>
                  <td style={tdStyle}>{v.codigo}</td>
                  <td style={{ ...tdStyle, overflow: 'hidden', fontWeight: 700 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.nombre} - {getVarianteLabel(v)}
                    </span>
                  </td>
                  <td style={tdStyle} />
                  <td style={tdStyle}>{formatCOP(v.precioTotal)}</td>
                  <td style={tdStyle}>{formatExistencia(getExistenciaVariante(v, sucursalId))}</td>
                  <td style={tdStyle}>{getTipoLabel(item)}</td>
                  <td style={tdStyle} onClick={e => e.stopPropagation()}>
                    <Toggle size="sm" checked={v.activo} onChange={() => onToggleVarianteActivo(item.id, v.id)} ariaLabel={`Activar/desactivar ${item.nombre} - ${getVarianteLabel(v)}`} />
                  </td>
                  <td style={tdStyle} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onEdit(item.id)}
                      aria-label="Editar"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--blue-100)' }}
                      className="hover:bg-[var(--blue-10)]"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
