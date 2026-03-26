/**
 * TurnosPage — /turnos
 * ─────────────────────────────────────────────────────────────────────────────
 * Vista de Turnos siguiendo fielmente la estructura Retail del nodo Figma
 * POS-WEB-2.0 > 8969:8925 ("Turno abierto").
 *
 * PRD: agregar Propinas como línea discriminada en el resumen de totales,
 * tanto en turnos abiertos como en turnos cerrados.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { Calendar, ChevronRight, X } from 'lucide-react';

// ─── Design tokens (alineados con design system del proyecto) ────────────────

const C = {
  bg:           '#f7f8fb',          // --background/page
  white:        '#ffffff',
  blue100:      '#121e6c',          // --blue/100
  blue60:       '#3e4983',          // --blue/60
  blue10:       '#f1f2f6',          // --blue/10
  blue20:       '#d2d4e1',          // --blue/20
  black100:     '#1e1e1e',          // --black/100
  black80:      '#3d3d3d',          // --black/80
  black60:      '#606060',          // --black/60
  black40:      '#969696',          // --black/40
  coral100:     '#ff2947',          // --coral/100
  successBg:    '#f4fdf9',          // --feedback/success/10
  successText:  '#1b8959',          // --feedback/success/150
  closedBg:     '#f5f5f5',
  closedText:   '#606060',
  divider:      '#e8e9f0',
  shadow:       '0 4px 24px rgba(0,0,0,0.08)',
};

const FONT = 'Montserrat, sans-serif';

// ─── Types ────────────────────────────────────────────────────────────────────

type TurnoEstado = 'abierto' | 'cerrado';

interface TurnoVentas {
  brutas:     number;
  descuentos: number;
  netas:      number;
  iva:        number;
  propinas:   number;
  total:      number;
  efectivo:   number;
  tarjeta:    number;
}

interface Turno {
  id:       number;
  cajero:   string;
  tienda:   string;
  estado:   TurnoEstado;
  inicio:   string;
  cierre?:  string;
  ventas:   TurnoVentas;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TURNOS: Turno[] = [
  {
    id: 16,
    cajero: 'Carlos Méndez',
    tienda: 'Principal',
    estado: 'abierto',
    inicio: '26 / Mar / 2026 - 8:00:00 am',
    ventas: {
      brutas:     1_250_000,
      descuentos:    45_000,
      netas:      1_205_000,
      iva:          192_000,
      propinas:      87_500,
      total:      1_484_500,
      efectivo:     850_000,
      tarjeta:      634_500,
    },
  },
  {
    id: 15,
    cajero: 'Laura Torres',
    tienda: 'Principal',
    estado: 'cerrado',
    inicio: '25 / Mar / 2026 - 8:00:00 am',
    cierre: '25 / Mar / 2026 - 4:00:00 pm',
    ventas: {
      brutas:       980_000,
      descuentos:    32_000,
      netas:        948_000,
      iva:          151_680,
      propinas:      65_000,
      total:      1_164_680,
      efectivo:     700_000,
      tarjeta:      464_680,
    },
  },
  {
    id: 14,
    cajero: 'Mario García',
    tienda: 'Principal',
    estado: 'cerrado',
    inicio: '24 / Mar / 2026 - 9:00:00 am',
    cierre: '24 / Mar / 2026 - 5:00:00 pm',
    ventas: {
      brutas:     1_100_000,
      descuentos:    55_000,
      netas:      1_045_000,
      iva:          167_200,
      propinas:      72_000,
      total:      1_284_200,
      efectivo:     620_000,
      tarjeta:      664_200,
    },
  },
  {
    id: 13,
    cajero: 'Carlos Méndez',
    tienda: 'Principal',
    estado: 'cerrado',
    inicio: '23 / Mar / 2026 - 8:30:00 am',
    cierre: '23 / Mar / 2026 - 4:30:00 pm',
    ventas: {
      brutas:       875_000,
      descuentos:    28_000,
      netas:        847_000,
      iva:          135_520,
      propinas:      58_000,
      total:      1_040_520,
      efectivo:     580_000,
      tarjeta:      460_520,
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cop(n: number): string {
  return '$' + n.toLocaleString('es-CO');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ turno }: { turno: Turno }) {
  if (turno.estado === 'abierto') {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        backgroundColor: C.successBg, borderRadius: 100,
        padding: '4px 10px',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: C.successText, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: C.successText, fontFamily: FONT }}>
          Abierto
        </span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        backgroundColor: C.closedBg, borderRadius: 100,
        padding: '4px 10px',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: C.black40, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 400, color: C.black60, fontFamily: FONT }}>
          Cerrado
        </span>
      </div>
      {turno.cierre && (
        <span style={{ fontSize: 11, color: C.black40, fontFamily: FONT, paddingLeft: 4 }}>
          {turno.cierre.split(' - ')[0]}
        </span>
      )}
    </div>
  );
}

// ─── Left panel: turno list ───────────────────────────────────────────────────

function TurnoListItem({
  turno,
  isSelected,
  onClick,
}: {
  turno: Turno;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px',
        backgroundColor: isSelected ? C.blue10 : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        transition: 'background-color 0.15s',
        borderRadius: 12,
      }}
      onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blue10; }}
      onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
    >
      {/* Text info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontSize: 12, fontWeight: 600, color: C.black100,
          fontFamily: FONT, lineHeight: '16px',
        }}>
          Turno No. {turno.id}
        </span>
        <span style={{ fontSize: 12, fontWeight: 400, color: C.black100, fontFamily: FONT, lineHeight: '16px' }}>
          {turno.cajero}
        </span>
        <span style={{ fontSize: 11, fontWeight: 400, color: C.black60, fontFamily: FONT, lineHeight: '14px' }}>
          {turno.tienda}
        </span>
      </div>

      {/* Status */}
      <div style={{ flexShrink: 0 }}>
        <StatusBadge turno={turno} />
      </div>

      {/* Chevron */}
      <ChevronRight size={16} color={C.black40} style={{ flexShrink: 0 }} />
    </button>
  );
}

// ─── Summary row ──────────────────────────────────────────────────────────────

function SummaryRow({
  label, value, bold = false, color,
}: {
  label: string; value: string; bold?: boolean; color?: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0',
    }}>
      <span style={{
        fontSize: bold ? 14 : 12,
        fontWeight: bold ? 700 : 400,
        color: color ?? (bold ? C.black100 : C.black80),
        fontFamily: FONT,
        lineHeight: '20px',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: bold ? 14 : 12,
        fontWeight: bold ? 700 : 600,
        color: color ?? C.black100,
        fontFamily: FONT,
        lineHeight: '20px',
        textAlign: 'right',
      }}>
        {value}
      </span>
    </div>
  );
}

function SummaryDivider() {
  return <div style={{ height: 1, backgroundColor: C.divider, margin: '2px 0' }} />;
}

// ─── Right panel: turno detail ────────────────────────────────────────────────

function TurnoDetail({ turno }: { turno: Turno }) {
  const [tab, setTab] = useState<'resumen' | 'detalle'>('resumen');
  const v = turno.ventas;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', gap: 20,
      overflowY: 'auto', paddingRight: 4,
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          {/* Title */}
          <h1 style={{
            fontSize: 20, fontWeight: 700, color: C.blue100,
            fontFamily: FONT, lineHeight: '28px', margin: 0,
          }}>
            Turno No. {turno.id}
          </h1>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 4,
              backgroundColor: C.white, border: `1px solid ${C.blue20}`,
              borderRadius: 100, height: 36, padding: '8px 12px',
              cursor: 'pointer', fontSize: 12, fontWeight: 500,
              color: C.blue60, fontFamily: FONT,
            }}>
              Historial
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 4,
              backgroundColor: C.white, border: `1px solid ${C.blue20}`,
              borderRadius: 100, height: 36, padding: '8px 12px',
              cursor: 'pointer', fontSize: 12, fontWeight: 500,
              color: C.blue60, fontFamily: FONT,
            }}>
              Agregar gasto
            </button>
            {turno.estado === 'abierto' && (
              <button style={{
                display: 'flex', alignItems: 'center', gap: 4,
                backgroundColor: C.coral100, border: 'none',
                borderRadius: 100, height: 36, padding: '8px 20px',
                cursor: 'pointer', fontSize: 12, fontWeight: 700,
                color: C.white, fontFamily: FONT,
              }}>
                Cerrar Turno
              </button>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <p style={{
          fontSize: 14, fontWeight: 400, color: C.black100,
          fontFamily: FONT, lineHeight: '20px', margin: 0,
        }}>
          {turno.tienda} — {turno.cajero}
        </p>
      </div>

      {/* ── Info cards row ── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

        {/* Card: fechas */}
        <div style={{
          backgroundColor: C.white, borderRadius: 16, padding: 16,
          boxShadow: C.shadow, flex: '1 0 220px', display: 'flex',
          flexDirection: 'column', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Calendar size={22} color={C.blue100} />
            <StatusBadge turno={turno} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 400, color: C.black60, fontFamily: FONT, margin: 0 }}>Apertura</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.black100, fontFamily: FONT, margin: 0 }}>{turno.inicio}</p>
            </div>
            {turno.cierre && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 400, color: C.black60, fontFamily: FONT, margin: 0 }}>Cierre</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.black100, fontFamily: FONT, margin: 0 }}>{turno.cierre}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card: cajero */}
        <div style={{
          backgroundColor: C.white, borderRadius: 16, padding: 16,
          boxShadow: C.shadow, flex: '1 0 200px', display: 'flex',
          flexDirection: 'column', gap: 8,
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.black60, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
            Cajero
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.black100, fontFamily: FONT, margin: 0 }}>
            {turno.cajero}
          </p>
          <p style={{ fontSize: 12, fontWeight: 400, color: C.black60, fontFamily: FONT, margin: 0 }}>
            {turno.tienda}
          </p>
        </div>

        {/* Card: total cobrado */}
        <div style={{
          backgroundColor: C.blue100, borderRadius: 16, padding: 16,
          flex: '1 0 200px', display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
            Total cobrado
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: C.white, fontFamily: FONT, margin: 0 }}>
            {cop(v.total)}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: FONT }}>
              Efectivo {cop(v.efectivo)}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: FONT }}>
              Tarjeta {cop(v.tarjeta)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: 4, height: 40,
        backgroundColor: C.white, borderRadius: 100,
        padding: 4, width: 'fit-content',
        boxShadow: C.shadow,
      }}>
        {(['resumen', 'detalle'] as const).map(t => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                height: '100%', padding: '0 20px', borderRadius: 100,
                backgroundColor: active ? C.blue100 : 'transparent',
                border: active ? 'none' : `1px solid ${C.blue100}`,
                color: active ? C.white : C.blue100,
                fontSize: 12, fontWeight: active ? 700 : 400,
                fontFamily: FONT, cursor: 'pointer',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          );
        })}
      </div>

      {/* ── Resumen del turno ── */}
      {tab === 'resumen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Section title */}
          <h2 style={{
            fontSize: 16, fontWeight: 700, color: C.blue100,
            fontFamily: FONT, margin: 0, lineHeight: '22px',
          }}>
            Resumen de ventas
          </h2>

          {/* White table card */}
          <div style={{
            backgroundColor: C.white, borderRadius: 16,
            padding: 20, boxShadow: C.shadow,
          }}>
            {/* Header row: inicio del turno */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 0 14px',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.blue100, fontFamily: FONT }}>
                Inicio del turno
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.blue100, fontFamily: FONT }}>
                {turno.inicio}
              </span>
            </div>
            {turno.cierre && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 0 14px',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.blue100, fontFamily: FONT }}>
                  Cierre del turno
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.blue100, fontFamily: FONT }}>
                  {turno.cierre}
                </span>
              </div>
            )}

            <SummaryDivider />

            {/* Sales breakdown */}
            <SummaryRow label="Ventas brutas"         value={cop(v.brutas)} />
            <SummaryDivider />
            <SummaryRow label="Descuentos"            value={`-${cop(v.descuentos)}`} color={C.black60} />
            <SummaryDivider />
            <SummaryRow label="Ventas netas"          value={cop(v.netas)} bold />
            <SummaryDivider />
            <SummaryRow label="Impuestos (IVA 19%)"   value={cop(v.iva)} />
            <SummaryDivider />

            {/* ── Propinas — línea discriminada (nuevo requisito PRD) ── */}
            <SummaryRow label="Propinas"              value={cop(v.propinas)} />
            <SummaryDivider />

            <SummaryRow label="Total cobrado"         value={cop(v.total)} bold />
          </div>

          {/* Medios de pago */}
          <h2 style={{
            fontSize: 16, fontWeight: 700, color: C.blue100,
            fontFamily: FONT, margin: 0, lineHeight: '22px',
          }}>
            Medios de pago
          </h2>
          <div style={{
            backgroundColor: C.white, borderRadius: 16,
            padding: 20, boxShadow: C.shadow,
          }}>
            <SummaryRow label="Efectivo"  value={cop(v.efectivo)} />
            <SummaryDivider />
            <SummaryRow label="Tarjeta"   value={cop(v.tarjeta)} />
            <SummaryDivider />
            <SummaryRow label="Total"     value={cop(v.efectivo + v.tarjeta)} bold />
          </div>
        </div>
      )}

      {/* ── Detalle tab (placeholder) ── */}
      {tab === 'detalle' && (
        <div style={{
          backgroundColor: C.white, borderRadius: 16, padding: 40,
          boxShadow: C.shadow, textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: C.black60, fontFamily: FONT }}>
            Vista de detalle de transacciones próximamente.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TurnosPage() {
  const [selectedId, setSelectedId] = useState<number>(MOCK_TURNOS[0].id);

  const selectedTurno = MOCK_TURNOS.find(t => t.id === selectedId) ?? MOCK_TURNOS[0];

  return (
    <div style={{
      flex: 1, display: 'flex', gap: 12, overflow: 'hidden',
      backgroundColor: C.bg,
    }}>

      {/* ── Left panel: turno list ── */}
      <div style={{
        width: 288, flexShrink: 0,
        backgroundColor: C.white, borderRadius: 16,
        boxShadow: C.shadow,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* List header */}
        <div style={{
          padding: '20px 16px 12px',
          borderBottom: `1px solid ${C.divider}`,
          flexShrink: 0,
        }}>
          <h2 style={{
            fontSize: 16, fontWeight: 700, color: C.blue100,
            fontFamily: FONT, margin: 0, lineHeight: '22px',
          }}>
            Turnos
          </h2>
        </div>

        {/* Scrollable list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {MOCK_TURNOS.map((turno, idx) => (
            <React.Fragment key={turno.id}>
              <TurnoListItem
                turno={turno}
                isSelected={turno.id === selectedId}
                onClick={() => setSelectedId(turno.id)}
              />
              {idx < MOCK_TURNOS.length - 1 && (
                <div style={{ height: 1, backgroundColor: C.divider, margin: '2px 4px' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Right panel: turno detail ── */}
      <div style={{
        flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          flex: 1, overflowY: 'auto', paddingRight: 4,
          display: 'flex', flexDirection: 'column',
        }}>
          <TurnoDetail key={selectedTurno.id} turno={selectedTurno} />
        </div>
      </div>
    </div>
  );
}
