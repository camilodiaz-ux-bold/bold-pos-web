/**
 * MesasGridView
 * ─────────────────────────────────────────────────────────────────────────────
 * Vista alternativa de mesas en grid (4 columnas). Fondos tenues con bordes
 * de color, contenido centrado, nombre grande como elemento principal.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import { Users, Clock } from 'lucide-react';
import type { MesaTable, TableStatus } from './MesasView';
import { useMesas } from '../hooks/useMesas';

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

function calcTotal(items: MesaTable['items']): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function formatCOP(n: number): string {
  return '$' + n.toLocaleString('es-CO');
}

// ─── Card style config per status ─────────────────────────────────────────────

const STATUS_STYLE: Record<TableStatus, {
  bg:          string;
  border:      string;
  nameColor:   string;
  infoColor:   string;
  iconColor:   string;
  opacity:     number;
  cursor:      string;
}> = {
  DISPONIBLE: {
    bg:        '#F1F2F6',
    border:    '1.5px solid #C7CBE0',
    nameColor: '#1E1E1E',
    infoColor: '#606060',
    iconColor: '#606060',
    opacity:   1,
    cursor:    'pointer',
  },
  OCUPADA: {
    bg:        '#FFF0F2',
    border:    '1.5px solid #FF2947',
    nameColor: '#FF2947',
    infoColor: '#FF2947',
    iconColor: '#FF2947',
    opacity:   1,
    cursor:    'pointer',
  },
  CUENTA_SOLICITADA: {
    bg:        '#FFFBF0',
    border:    '1.5px solid #FFC217',
    nameColor: '#B38900',
    infoColor: '#B38900',
    iconColor: '#B38900',
    opacity:   1,
    cursor:    'pointer',
  },
  INHABILITADA: {
    bg:        '#F5F5F5',
    border:    '1.5px dashed #C0C0C0',
    nameColor: '#AAAAAA',
    infoColor: '#AAAAAA',
    iconColor: '#AAAAAA',
    opacity:   0.7,
    cursor:    'default',
  },
};

const FONT = 'var(--font-family, Montserrat, sans-serif)';

// ─── MesaCard ─────────────────────────────────────────────────────────────────

function MesaCard({
  table,
  isSelected,
  onClick,
}: {
  table:      MesaTable;
  isSelected: boolean;
  onClick:    () => void;
}) {
  const s        = STATUS_STYLE[table.status];
  const isActive = table.status === 'OCUPADA' || table.status === 'CUENTA_SOLICITADA';
  const disabled = table.status === 'INHABILITADA';

  const elapsed = isActive && table.openedAtTimestamp
    ? formatElapsed(table.openedAtTimestamp, table.frozenElapsedMs)
    : null;

  const total = isActive && table.items.length > 0 ? calcTotal(table.items) : null;

  const selectedBorder = '3px solid #121E6C';
  const selectedShadow = '0 0 0 1px #121E6C';

  return (
    <button
      onClick={onClick}
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        height:         110,
        padding:        12,
        borderRadius:   12,
        background:     s.bg,
        border:         isSelected ? selectedBorder : s.border,
        boxShadow:      isSelected ? selectedShadow : '0 1px 3px rgba(0,0,0,0.04)',
        cursor:         s.cursor,
        opacity:        s.opacity,
        transition:     'box-shadow 0.15s ease, transform 0.15s ease',
        gap:            4,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            isSelected ? selectedShadow : '0 2px 8px rgba(0,0,0,0.10)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          isSelected ? selectedShadow : '0 1px 3px rgba(0,0,0,0.04)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
      }}
    >
      {/* ── Nombre de mesa — elemento principal ── */}
      <span style={{
        fontSize:   18,
        fontWeight: 700,
        lineHeight: '22px',
        color:      s.nameColor,
        fontFamily: FONT,
        marginBottom: 4,
      }}>
        {table.name}
      </span>

      {/* ── Info secundaria según estado ── */}

      {/* DISPONIBLE: capacidad */}
      {table.status === 'DISPONIBLE' && (
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          fontSize: 12, color: s.infoColor, fontFamily: FONT,
        }}>
          <Users size={12} color={s.iconColor} />
          {table.capacity}
        </span>
      )}

      {/* OCUPADA / CUENTA_SOLICITADA: personas + tiempo, luego total */}
      {isActive && (
        <>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 12, color: s.infoColor, fontFamily: FONT,
          }}>
            {table.guests != null && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Users size={12} color={s.iconColor} />
                {table.guests}
              </span>
            )}
            {elapsed && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={12} color={s.iconColor} />
                {elapsed}
              </span>
            )}
          </span>
          {total !== null && (
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: s.infoColor, fontFamily: FONT,
            }}>
              {formatCOP(total)}
            </span>
          )}
        </>
      )}

      {/* INHABILITADA */}
      {disabled && (
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.5px',
          color: s.infoColor, fontFamily: FONT,
          textTransform: 'uppercase',
        }}>
          Inhabilitada
        </span>
      )}
    </button>
  );
}

// ─── MesasGridView ────────────────────────────────────────────────────────────

interface MesasGridViewProps {
  tables:          MesaTable[];
  selectedTableId: string | null;
  onSelectMesa:    (id: string) => void;
}

export function MesasGridView({ tables, selectedTableId, onSelectMesa }: MesasGridViewProps) {
  const { mesas } = useMesas();

  // Build a gridIndex lookup keyed by mesa id; fall back to original array index.
  const gridIndexOf = (id: string, fallback: number): number => {
    const m = mesas.find(m => m.id === id);
    return m ? m.gridIndex : fallback;
  };

  const sortedTables = [...tables].sort(
    (a, b) => gridIndexOf(a.id, tables.indexOf(a)) - gridIndexOf(b.id, tables.indexOf(b)),
  );

  if (!sortedTables.length) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 200, color: 'var(--black-40)',
        fontSize: 13, fontFamily: FONT,
      }}>
        No hay mesas en esta zona.
      </div>
    );
  }

  return (
    <div style={{
      display:               'grid',
      gridTemplateColumns:   'repeat(4, 1fr)',
      gap:                   12,
      paddingBottom:         8,
    }}>
      {sortedTables.map(table => (
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
