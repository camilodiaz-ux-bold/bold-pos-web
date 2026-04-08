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
    bg:        '#F4FDF9',
    border:    'none',
    nameColor: '#1B5E20',
    infoColor: '#1B5E20',
    iconColor: '#1B5E20',
    opacity:   1,
    cursor:    'pointer',
  },
  OCUPADA: {
    bg:        '#FFEEF0',
    border:    'none',
    nameColor: '#FF2947',
    infoColor: '#FF2947',
    iconColor: '#FF2947',
    opacity:   1,
    cursor:    'pointer',
  },
  CUENTA_SOLICITADA: {
    bg:        '#FFEEF0',
    border:    'none',
    nameColor: '#FF2947',
    infoColor: '#FF2947',
    iconColor: '#FF2947',
    opacity:   1,
    cursor:    'pointer',
  },
  INHABILITADA: {
    bg:        '#FAFAFA',
    border:    '1.5px solid #E0E0E0',
    nameColor: '#AAAAAA',
    infoColor: '#AAAAAA',
    iconColor: '#AAAAAA',
    opacity:   1,
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

  const selectedBorder =
    table.status === 'DISPONIBLE'        ? '2px solid #2E7D32' :
    table.status === 'OCUPADA'           ? '2px solid #FF2947' :
    table.status === 'CUENTA_SOLICITADA' ? '2px solid #FF2947' :
    '1.5px solid #BDBDBD';

  return (
    <button
      onClick={onClick}
      style={{
        position:       'relative',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        height:         120,
        padding:        12,
        borderRadius:   12,
        background:     s.bg,
        border:         isSelected ? selectedBorder : s.border,
        boxShadow:      '0 1px 3px rgba(0,0,0,0.04)',
        cursor:         'pointer',
        opacity:        s.opacity,
        transition:     'box-shadow 0.15s ease, transform 0.15s ease',
        gap:            4,
        width:          '100%',
        boxSizing:      'border-box',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Pulse dot — CUENTA_SOLICITADA only */}
      {table.status === 'CUENTA_SOLICITADA' && (
        <span className="pulse-dot" style={{
          position: 'absolute', top: 8, right: 8,
          width: 10, height: 10, borderRadius: '50%',
          backgroundColor: '#FF2947',
        }} />
      )}
      {/* ── Nombre de mesa — elemento principal ── */}
      <span style={{
        fontSize:   18,
        fontWeight: 500,
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
              fontSize: 13, fontWeight: 500,
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
          fontSize: 10, fontWeight: 500, letterSpacing: '0.5px',
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

  // Sort by gridIndex from useMesas; fall back to original array position.
  const sortedTables = [...tables].sort((a, b) => {
    const ai = mesas.find(m => m.id === a.id)?.gridIndex ?? tables.indexOf(a);
    const bi = mesas.find(m => m.id === b.id)?.gridIndex ?? tables.indexOf(b);
    return ai - bi;
  });

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

  // Merge status for all tables (habilitada config applied)
  const mergedTables = sortedTables.map(table => {
    const cfg = mesas.find(m => m.id === table.id);
    return {
      ...table,
      name:     cfg?.nombre    ?? table.name,
      capacity: cfg?.capacidad ?? table.capacity,
      status:   (cfg && !cfg.habilitada) ? 'INHABILITADA' as const : table.status,
    };
  });

  // Compute counts
  const counts = mergedTables.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const TAGS = [
    { label: 'Disponibles',       status: 'DISPONIBLE',        border: '#2E7D32', bg: '#F4FDF9', text: '#2E7D32', showDot: false },
    { label: 'Ocupadas',          status: 'OCUPADA',           border: '#FF2947', bg: '#FFEEF0', text: '#FF2947', showDot: false },
    { label: 'Cuenta solicitada', status: 'CUENTA_SOLICITADA', border: '#FF2947', bg: '#FFEEF0', text: '#FF2947', showDot: true  },
    { label: 'Inhabilitadas',     status: 'INHABILITADA',      border: '#BDBDBD', bg: '#FAFAFA', text: '#9E9E9E', showDot: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap:                 16,
        padding:             24,
        backgroundColor:     '#FFFFFF',
        flex:                1,
      }}>
        {mergedTables.map(merged => (
          <MesaCard
            key={merged.id}
            table={merged}
            isSelected={merged.id === selectedTableId}
            onClick={() => onSelectMesa(merged.id)}
          />
        ))}
      </div>

      {/* ── Leyenda inferior — pill tags ── */}
      <div style={{
        position:        'sticky',
        bottom:          0,
        borderTop:       '1px solid #E0E0E0',
        backgroundColor: '#fff',
        padding:         '12px 24px',
        display:         'flex',
        alignItems:      'center',
        gap:             12,
        flexWrap:        'wrap',
      }}>
        {TAGS.map(item => (
          <div key={item.status} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            borderRadius: 999,
            padding: '4px 12px',
            border: `1.5px solid ${item.border}`,
            backgroundColor: item.bg,
          }}>
            {item.showDot && (
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: '#FF2947',
                flexShrink: 0,
                display: 'inline-block',
              }} />
            )}
            <span style={{ fontFamily: FONT, fontSize: 12, color: item.text, whiteSpace: 'nowrap' }}>
              {item.label} ({counts[item.status] ?? 0})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
