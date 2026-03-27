/**
 * MesasGridView
 * ─────────────────────────────────────────────────────────────────────────────
 * Vista alternativa de mesas en grid (4 columnas). Muestra las mismas mesas
 * con sus estados usando los mismos colores del mapa, sin sillas ni formas.
 * Se monta dentro de MesasView cuando viewMode === 'grid'.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import { Users, Clock } from 'lucide-react';
import type { MesaTable, TableStatus } from './MesasView';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(openedAtTimestamp: number, frozenElapsedMs?: number): string {
  const ms = frozenElapsedMs !== undefined
    ? frozenElapsedMs
    : Math.max(0, Date.now() - openedAtTimestamp);
  const totalMin = Math.floor(ms / 60_000);
  if (totalMin < 1)  return '< 1 min';
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ─── Card styles per status ───────────────────────────────────────────────────

const STATUS_STYLE: Record<TableStatus, {
  bg: string;
  border: string;
  nameColor: string;
  zoneColor: string;
  iconColor: string;
  infoColor: string;
}> = {
  DISPONIBLE: {
    bg:        'var(--blue-10)',
    border:    '1px solid var(--blue-20)',
    nameColor: 'var(--black-100)',
    zoneColor: 'var(--black-40)',
    iconColor: 'var(--black-40)',
    infoColor: 'var(--blue-60)',
  },
  OCUPADA: {
    bg:        'var(--coral-100)',
    border:    '1px solid var(--coral-100)',
    nameColor: '#ffffff',
    zoneColor: 'rgba(255,255,255,0.75)',
    iconColor: 'rgba(255,255,255,0.85)',
    infoColor: '#ffffff',
  },
  CUENTA_SOLICITADA: {
    bg:        'var(--feedback-warning-100)',
    border:    '1px solid var(--feedback-warning-100)',
    nameColor: 'var(--black-100)',
    zoneColor: 'var(--black-60)',
    iconColor: 'var(--black-60)',
    infoColor: 'var(--black-80)',
  },
  INHABILITADA: {
    bg:        'var(--black-10)',
    border:    '1px dashed var(--black-20, #c8c8c8)',
    nameColor: 'var(--black-40)',
    zoneColor: 'var(--black-20, #c8c8c8)',
    iconColor: 'var(--black-20, #c8c8c8)',
    infoColor: 'var(--black-40)',
  },
};

// ─── MesaCard ─────────────────────────────────────────────────────────────────

function MesaCard({
  table,
  isSelected,
  onClick,
}: {
  table: MesaTable;
  isSelected: boolean;
  onClick: () => void;
}) {
  const s = STATUS_STYLE[table.status];
  const isActive = table.status === 'OCUPADA' || table.status === 'CUENTA_SOLICITADA';

  const elapsed = isActive && table.openedAtTimestamp
    ? formatElapsed(table.openedAtTimestamp, table.frozenElapsedMs)
    : null;

  return (
    <button
      onClick={onClick}
      style={{
        display:       'flex',
        flexDirection: 'column',
        justifyContent:'space-between',
        height:        100,
        padding:       12,
        borderRadius:  10,
        background:    s.bg,
        border:        isSelected ? '3px solid var(--blue-100)' : s.border,
        cursor:        table.status === 'INHABILITADA' ? 'default' : 'pointer',
        textAlign:     'left',
        transition:    'box-shadow 0.15s, border-color 0.15s',
        boxShadow:     isSelected ? '0 0 0 1px var(--blue-100)' : '0 1px 4px rgba(0,0,0,0.06)',
      }}
      onMouseOver={e => {
        if (!isSelected && table.status !== 'INHABILITADA')
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.14)';
      }}
      onMouseOut={e => {
        if (!isSelected)
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      }}
    >
      {/* ── Row 1: nombre + zona ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
        <span style={{
          fontSize: 14, fontWeight: 700, lineHeight: '18px',
          color: s.nameColor,
          fontFamily: 'var(--font-family, Montserrat, sans-serif)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {table.name}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 500, lineHeight: '14px',
          color: s.zoneColor,
          fontFamily: 'var(--font-family, Montserrat, sans-serif)',
          whiteSpace: 'nowrap', flexShrink: 0,
          marginTop: 2,
        }}>
          {table.zone}
        </span>
      </div>

      {/* ── Row 2: info de estado ── */}
      {isActive ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Comensales */}
          {table.guests != null && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 11, fontWeight: 600,
              color: s.infoColor,
              fontFamily: 'var(--font-family, Montserrat, sans-serif)',
            }}>
              <Users size={12} color={s.iconColor} />
              {table.guests}
            </span>
          )}
          {/* Tiempo */}
          {elapsed && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 11, fontWeight: 600,
              color: s.infoColor,
              fontFamily: 'var(--font-family, Montserrat, sans-serif)',
            }}>
              <Clock size={12} color={s.iconColor} />
              {elapsed}
            </span>
          )}
          {/* Total items en cuenta */}
          {table.items.length > 0 && (
            <span style={{
              marginLeft: 'auto',
              fontSize: 10, fontWeight: 600,
              color: s.infoColor, opacity: 0.8,
              fontFamily: 'var(--font-family, Montserrat, sans-serif)',
            }}>
              {table.items.reduce((s, i) => s + i.quantity, 0)} ítem{table.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      ) : table.status === 'DISPONIBLE' ? (
        <span style={{
          fontSize: 11, fontWeight: 500,
          color: s.infoColor,
          fontFamily: 'var(--font-family, Montserrat, sans-serif)',
        }}>
          Disponible
        </span>
      ) : (
        <span style={{
          fontSize: 11, fontWeight: 500,
          color: s.infoColor,
          fontFamily: 'var(--font-family, Montserrat, sans-serif)',
        }}>
          Inhabilitada
        </span>
      )}
    </button>
  );
}

// ─── MesasGridView ────────────────────────────────────────────────────────────

interface MesasGridViewProps {
  tables:         MesaTable[];
  selectedTableId: string | null;
  onSelectMesa:   (id: string) => void;
}

export function MesasGridView({ tables, selectedTableId, onSelectMesa }: MesasGridViewProps) {
  if (!tables.length) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 200, color: 'var(--black-40)',
        fontSize: 13, fontFamily: 'var(--font-family, Montserrat, sans-serif)',
      }}>
        No hay mesas en esta zona.
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      paddingBottom: 8,
    }}>
      {tables.map(table => (
        <MesaCard
          key={table.id}
          table={table}
          isSelected={table.id === selectedTableId}
          onClick={() => onSelectMesa(table.id)}
        />
      ))}
    </div>
  );
}
