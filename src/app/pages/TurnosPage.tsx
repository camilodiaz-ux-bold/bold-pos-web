/**
 * TurnosPage — /turnos
 * ─────────────────────────────────────────────────────────────────────────────
 * Módulo de Turnos fiel al Retail de Bold POS (ref: pos.bold.co).
 * PRD: Propinas como línea discriminada en Resumen. Tab Detalle completo
 * con 5 secciones: Ingresos, Ingresos no relacionados, Egresos,
 * Resumen del turno (cuadre de caja + resultado neto) y Transacciones anuladas.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { Calendar, Clock, ChevronRight, ChevronLeft, Sun, HandCoins, TrendingUp } from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:          '#f7f8fb',   // --background/page
  white:       '#ffffff',
  blue100:     '#121e6c',   // --blue/100
  blue60:      '#3e4983',   // --blue/60
  blue20:      '#d2d4e1',   // --blue/20
  blue10:      '#f1f2f6',   // --blue/10
  black100:    '#1e1e1e',   // --black/100
  black80:     '#3d3d3d',   // --black/80
  black60:     '#606060',   // --black/60
  black40:     '#969696',   // --black/40
  coral100:    '#ff2947',   // --coral/100
  successBg:   '#f4fdf9',   // --feedback/success/10
  successText: '#1b8959',   // --feedback/success/150
  divider:     '#e8e9f0',
  shadow:      '0 2px 12px rgba(18,30,108,0.08)',
  shadowMd:    '0 4px 20px rgba(18,30,108,0.10)',
};
const FONT = 'Montserrat, sans-serif';

// ─── Types ────────────────────────────────────────────────────────────────────

type TurnoEstado = 'abierto' | 'cerrado';

interface IngresoItem  { metodo: string; monto: number; }
interface EgresoItem   { categoria: string; metodo: string; monto: number; }

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

interface TurnoDetalleData {
  numVentas:              number;
  ventasRegistradas:      number;
  ingresos:               IngresoItem[];
  ingresosNoRelacionados: IngresoItem[];
  egresos:                EgresoItem[];
  saldoInicial:           number;
  egresosEfectivo:        number;
  ventasCredito:          number;
}

interface Turno {
  id:      number;
  cajero:  string;
  tienda:  string;
  estado:  TurnoEstado;
  inicio:  string;   // "26 / Mar / 2026 - 8:00:00 am"
  cierre?: string;
  ventas:  TurnoVentas;
  detalle: TurnoDetalleData;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const DETALLE_16: TurnoDetalleData = {
  numVentas:         19,
  ventasRegistradas: 3_400_000,
  ingresos: [
    { metodo: 'Efectivo',               monto: 1_500_000 },
    { metodo: 'Bold',                   monto:   800_000 },
    { metodo: 'Transferencia bancaria', monto:   400_000 },
    { metodo: 'Nequi',                  monto:   300_000 },
    { metodo: 'Daviplata',              monto:   150_000 },
    { metodo: 'Credibanko',             monto:   250_000 },
  ],
  ingresosNoRelacionados: [
    { metodo: 'Transferencia bancaria', monto: 50_000 },
    { metodo: 'Nequi',                  monto: 30_000 },
  ],
  egresos: [
    { categoria: 'Reposición Papelería',   metodo: 'Efectivo',               monto:  80_000 },
    { categoria: 'Servicio de mensajería', metodo: 'Nequi',                  monto:  70_000 },
    { categoria: 'Compra de insumos',      metodo: 'Transferencia bancaria', monto: 100_000 },
  ],
  saldoInicial:    300_000,
  egresosEfectivo:  80_000,
  ventasCredito:   500_000,
};

const DETALLE_CERRADO = (ef: number, tar: number): TurnoDetalleData => ({
  numVentas:         14,
  ventasRegistradas: ef + tar,
  ingresos: [
    { metodo: 'Efectivo',               monto: ef },
    { metodo: 'Transferencia bancaria', monto: Math.round(tar * 0.6) },
    { metodo: 'Nequi',                  monto: Math.round(tar * 0.4) },
  ],
  ingresosNoRelacionados: [
    { metodo: 'Nequi', monto: 20_000 },
  ],
  egresos: [
    { categoria: 'Reposición Papelería', metodo: 'Efectivo', monto: 50_000 },
    { categoria: 'Compra de insumos',    metodo: 'Nequi',    monto: 40_000 },
  ],
  saldoInicial:    200_000,
  egresosEfectivo:  50_000,
  ventasCredito:   300_000,
});

const MOCK_TURNOS: Turno[] = [
  {
    id: 16, cajero: 'Carlos Méndez', tienda: 'Principal',
    estado: 'abierto',
    inicio: '26 / Mar / 2026 - 8:00:00 am',
    ventas: {
      brutas: 1_250_000, descuentos: 45_000, netas: 1_205_000,
      iva: 192_000, propinas: 87_500, total: 1_484_500,
      efectivo: 850_000, tarjeta: 634_500,
    },
    detalle: DETALLE_16,
  },
  {
    id: 15, cajero: 'Laura Torres', tienda: 'Principal',
    estado: 'cerrado',
    inicio: '25 / Mar / 2026 - 8:00:00 am',
    cierre: '25 / Mar / 2026 - 4:00:00 pm',
    ventas: {
      brutas: 980_000, descuentos: 32_000, netas: 948_000,
      iva: 151_680, propinas: 65_000, total: 1_164_680,
      efectivo: 700_000, tarjeta: 464_680,
    },
    detalle: DETALLE_CERRADO(700_000, 464_680),
  },
  {
    id: 14, cajero: 'Mario García', tienda: 'Principal',
    estado: 'cerrado',
    inicio: '24 / Mar / 2026 - 9:00:00 am',
    cierre: '24 / Mar / 2026 - 5:00:00 pm',
    ventas: {
      brutas: 1_100_000, descuentos: 55_000, netas: 1_045_000,
      iva: 167_200, propinas: 72_000, total: 1_284_200,
      efectivo: 620_000, tarjeta: 664_200,
    },
    detalle: DETALLE_CERRADO(620_000, 664_200),
  },
  {
    id: 13, cajero: 'Carlos Méndez', tienda: 'Principal',
    estado: 'cerrado',
    inicio: '23 / Mar / 2026 - 8:30:00 am',
    cierre: '23 / Mar / 2026 - 4:30:00 pm',
    ventas: {
      brutas: 875_000, descuentos: 28_000, netas: 847_000,
      iva: 135_520, propinas: 58_000, total: 1_040_520,
      efectivo: 580_000, tarjeta: 460_520,
    },
    detalle: DETALLE_CERRADO(580_000, 460_520),
  },
];

const PAGE_SIZE = 9;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cop(n: number): string {
  return '$' + n.toLocaleString('es-CO');
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.blue100, fontFamily: FONT, margin: 0 }}>
        {children}
      </h3>
      {right}
    </div>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      backgroundColor: C.white, borderRadius: 14,
      border: `1px solid ${C.divider}`, padding: 16,
      boxShadow: C.shadow, ...style,
    }}>
      {children}
    </div>
  );
}

function TableNote({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11, color: C.black60, fontFamily: FONT,
      margin: '10px 0 0', fontStyle: 'italic', lineHeight: '16px',
    }}>
      {children}
    </p>
  );
}

// ─── Summary row (Resumen tab) ────────────────────────────────────────────────

function SummaryRow({
  label, value, bold = false, labelColor, highlight = false,
}: {
  label: string; value: string; bold?: boolean;
  labelColor?: string; highlight?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '9px 0',
      ...(highlight ? {
        backgroundColor: C.blue10, borderRadius: 8,
        padding: '10px 12px', margin: '2px -12px',
      } : {}),
    }}>
      <span style={{
        fontSize: bold ? 13 : 12,
        fontWeight: bold ? 700 : 400,
        color: labelColor ?? (bold ? C.black100 : C.black80),
        fontFamily: FONT, lineHeight: '18px',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: bold ? 13 : 12,
        fontWeight: bold ? 700 : 600,
        color: C.black100,
        fontFamily: FONT, lineHeight: '18px',
      }}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: C.divider }} />;
}

// ─── Detail table (Detalle tab) ───────────────────────────────────────────────

function DetailTable({
  headers,
  rows,
  totalLabel,
  totalValue,
  note,
}: {
  headers: string[];
  rows: (string | number)[][];
  totalLabel: string;
  totalValue: string;
  note?: string;
}) {
  const colCount = headers.length;
  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: colCount === 2 ? '1fr auto' : '1fr 1fr auto',
        gap: '0 16px',
        padding: '6px 0',
        borderBottom: `1px solid ${C.divider}`,
        marginBottom: 4,
      }}>
        {headers.map((h, i) => (
          <span key={i} style={{
            fontSize: 11, fontWeight: 600, color: C.black40,
            fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.4px',
            textAlign: i === headers.length - 1 ? 'right' : 'left',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {rows.map((row, ri) => (
        <React.Fragment key={ri}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: colCount === 2 ? '1fr auto' : '1fr 1fr auto',
            gap: '0 16px',
            padding: '9px 0',
          }}>
            {row.map((cell, ci) => (
              <span key={ci} style={{
                fontSize: 12, fontWeight: 400, color: C.black100,
                fontFamily: FONT, lineHeight: '18px',
                textAlign: ci === row.length - 1 ? 'right' : 'left',
              }}>
                {typeof cell === 'number' ? cop(cell) : cell}
              </span>
            ))}
          </div>
          {ri < rows.length - 1 && <Divider />}
        </React.Fragment>
      ))}

      {/* Total */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 0', borderTop: `1px solid ${C.divider}`, marginTop: 4,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.black100, fontFamily: FONT }}>{totalLabel}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.black100, fontFamily: FONT }}>{totalValue}</span>
      </div>

      {note && <TableNote>{note}</TableNote>}
    </div>
  );
}

// ─── Cuadre row (Resumen del turno inside Detalle) ────────────────────────────

function CuadreRow({
  label, value, bold = false, highlight = false,
}: {
  label: string; value: string; bold?: boolean; highlight?: boolean;
}) {
  return (
    <>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '9px 0',
        ...(highlight ? {
          backgroundColor: C.blue10, borderRadius: 8,
          padding: '10px 12px', margin: '4px -12px',
        } : {}),
      }}>
        <span style={{
          fontSize: bold ? 13 : 12,
          fontWeight: bold ? 700 : 400,
          color: bold ? C.black100 : C.black80,
          fontFamily: FONT, lineHeight: '18px',
        }}>
          {label}
        </span>
        <span style={{
          fontSize: bold ? 13 : 12,
          fontWeight: bold ? 700 : 600,
          color: C.black100, fontFamily: FONT,
        }}>
          {value}
        </span>
      </div>
      {!highlight && <Divider />}
    </>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ estado }: { estado: TurnoEstado }) {
  const open = estado === 'abierto';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      backgroundColor: open ? C.successBg : '#f3f4f6',
      borderRadius: 100, padding: '3px 10px',
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        backgroundColor: open ? C.successText : C.black40,
      }} />
      <span style={{
        fontSize: 12, fontWeight: open ? 600 : 400,
        color: open ? C.successText : C.black60,
        fontFamily: FONT, lineHeight: '18px',
      }}>
        {open ? 'Abierto' : 'Cerrado'}
      </span>
    </div>
  );
}

// ─── Left panel item ──────────────────────────────────────────────────────────

function TurnoListItem({
  turno, isSelected, onClick,
}: { turno: Turno; isSelected: boolean; onClick: () => void }) {
  const open = turno.estado === 'abierto';

  // Subtext under badge: for open show "8:00 am", for closed show "25 / Mar / 2026"
  const badgeSub = open
    ? turno.inicio.split(' - ')[1]           // "8:00:00 am"
    : turno.inicio.split(' - ')[0];          // "25 / Mar / 2026"

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 12px',
        backgroundColor: isSelected ? C.blue100 : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        transition: 'background-color 0.15s',
        borderRadius: 10,
      }}
      onMouseOver={e => {
        if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blue10;
      }}
      onMouseOut={e => {
        if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
      }}
    >
      {/* Left: text info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: isSelected ? C.white : C.black100,
          fontFamily: FONT, lineHeight: '16px',
        }}>
          Turno No. {turno.id}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 400,
          color: isSelected ? 'rgba(255,255,255,0.9)' : C.black100,
          fontFamily: FONT, lineHeight: '16px',
        }}>
          {turno.cajero}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 400,
          color: isSelected ? 'rgba(255,255,255,0.65)' : C.black60,
          fontFamily: FONT, lineHeight: '14px',
        }}>
          {turno.tienda}
        </span>
      </div>

      {/* Right: badge + sub-date */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        {isSelected ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 100, padding: '3px 10px',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, backgroundColor: C.white }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.white, fontFamily: FONT }}>
              {open ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
        ) : (
          <StatusBadge estado={turno.estado} />
        )}
        <span style={{
          fontSize: 10, fontWeight: 400,
          color: isSelected ? 'rgba(255,255,255,0.65)' : C.black40,
          fontFamily: FONT, lineHeight: '14px', textAlign: 'right',
        }}>
          {badgeSub}
        </span>
      </div>

      {/* Chevron */}
      <ChevronRight size={14} color={isSelected ? 'rgba(255,255,255,0.6)' : C.black40} style={{ flexShrink: 0 }} />
    </button>
  );
}

// ─── Tab: Resumen ─────────────────────────────────────────────────────────────

function TabResumen({ turno }: { turno: Turno }) {
  const v = turno.ventas;
  const d = turno.detalle;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Resumen de ventas ── */}
      <SectionTitle>Resumen de ventas</SectionTitle>
      <Card style={{ padding: '16px 20px' }}>

        {/* Inicio del turno — fila destacada */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0 12px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.blue100, fontFamily: FONT }}>Inicio del turno</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.blue100, fontFamily: FONT }}>{turno.inicio}</span>
        </div>
        {turno.cierre && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 12px' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.blue100, fontFamily: FONT }}>Cierre del turno</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.blue100, fontFamily: FONT }}>{turno.cierre}</span>
          </div>
        )}

        <Divider />

        <SummaryRow label="Ventas brutas"        value={cop(v.brutas)} />
        <Divider />
        <SummaryRow label="Descuentos"           value={`-${cop(v.descuentos)}`} labelColor={C.black60} />
        <Divider />
        <SummaryRow label="Ventas netas"         value={cop(v.netas)} bold />
        <Divider />
        <SummaryRow label="Impuestos (IVA 19%)"  value={cop(v.iva)} />
        <Divider />
        {/* ── Propinas — línea discriminada (requisito PRD) ── */}
        <SummaryRow label="Propinas"             value={cop(v.propinas)} />
        <Divider />
        <SummaryRow label="Total cobrado"        value={cop(v.total)} bold />
      </Card>

      {/* ── Medios de pago ── */}
      <SectionTitle>Medios de pago</SectionTitle>
      <Card style={{ padding: '16px 20px' }}>
        {d.ingresos.map((ing, i) => (
          <React.Fragment key={ing.metodo}>
            <SummaryRow label={ing.metodo} value={cop(ing.monto)} />
            {i < d.ingresos.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        <Divider />
        <SummaryRow label="Total" value={cop(d.ventasRegistradas)} bold />
      </Card>
    </div>
  );
}

// ─── Tab: Detalle ─────────────────────────────────────────────────────────────

function TabDetalle({ turno }: { turno: Turno }) {
  const d = turno.detalle;

  const totalIngresos       = d.ingresos.reduce((s, r) => s + r.monto, 0);
  const totalNoRelacionados = d.ingresosNoRelacionados.reduce((s, r) => s + r.monto, 0);
  const totalEgresos        = d.egresos.reduce((s, r) => s + r.monto, 0);
  const resultadoNeto       = totalIngresos + totalNoRelacionados - totalEgresos;
  const efectivoEsperado    = d.ingresos.find(i => i.metodo === 'Efectivo')?.monto ?? 0
                              + d.saldoInicial - d.egresosEfectivo;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── 1. Ingresos recibidos ── */}
      <div>
        <SectionTitle>Ingresos recibidos ({d.numVentas} ventas)</SectionTitle>
        <Card>
          <DetailTable
            headers={['Método de cobro', 'Monto']}
            rows={d.ingresos.map(i => [i.metodo, i.monto])}
            totalLabel="Total ingresos"
            totalValue={cop(totalIngresos)}
            note={`Saldo inicial en caja (antes del turno): ${cop(d.saldoInicial)}`}
          />
        </Card>
      </div>

      {/* ── 2. Ingresos no relacionados ── */}
      <div>
        <SectionTitle>Ingresos no relacionados a ventas del turno</SectionTitle>
        <Card>
          <DetailTable
            headers={['Método de cobro', 'Monto']}
            rows={d.ingresosNoRelacionados.map(i => [i.metodo, i.monto])}
            totalLabel="Subtotal ventas no relacionadas al turno"
            totalValue={cop(totalNoRelacionados)}
            note="Ingresos adicionales no relacionados directamente con ventas del turno. (Abonos)"
          />
        </Card>
      </div>

      {/* ── 3. Egresos ── */}
      <div>
        <SectionTitle
          right={
            <button style={{
              fontSize: 12, fontWeight: 600, color: C.blue60,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: FONT, padding: 0,
            }}>
              + Agregar gasto
            </button>
          }
        >
          Egresos ({d.egresos.length} gastos)
        </SectionTitle>
        <Card>
          <DetailTable
            headers={['Categoría', 'Método de pago', 'Monto']}
            rows={d.egresos.map(e => [e.categoria, e.metodo, e.monto])}
            totalLabel="Total de egresos"
            totalValue={cop(totalEgresos)}
          />
        </Card>
      </div>

      {/* ── 4. Resumen del turno ── */}
      <div>
        <SectionTitle>Resumen del turno No. {turno.id}</SectionTitle>
        <Card style={{ padding: '16px 20px' }}>

          {/* Cuadre de caja */}
          <p style={{ fontSize: 11, fontWeight: 600, color: C.black40, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>
            Cuadre de caja
          </p>

          <CuadreRow label="Ventas cobradas en efectivo"                value={cop(d.ingresos.find(i => i.metodo === 'Efectivo')?.monto ?? 0)} />
          <CuadreRow label="Ingreso en efectivo no relacionado al turno" value="—" />
          <CuadreRow label="Saldo inicial en caja"                      value={cop(d.saldoInicial)} />
          <CuadreRow label="Egresos en efectivo"                        value={cop(d.egresosEfectivo)} />
          <CuadreRow label="Efectivo esperado en caja"                  value={cop(efectivoEsperado)} bold />
          <CuadreRow label="Efectivo contado"                           value="—" />
          <CuadreRow label="Diferencia de caja"                         value="—" />
          <CuadreRow label="Efectivo final en caja"                     value="—" />

          <div style={{ height: 8 }} />
          <div style={{ height: 1, backgroundColor: C.blue20, margin: '4px 0 12px' }} />

          {/* Métricas generales */}
          <p style={{ fontSize: 11, fontWeight: 600, color: C.black40, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>
            Métricas del turno
          </p>

          <CuadreRow label="Número de ventas realizadas"         value={String(d.numVentas)} />
          <CuadreRow label="Ventas registradas"                  value={cop(d.ventasRegistradas)} />
          <CuadreRow label="Ingresos no relacionados al turno"   value={cop(totalNoRelacionados)} />
          <CuadreRow label="Número de gastos ingresados"         value={String(d.egresos.length)} />
          <CuadreRow label="Gastos realizados"                   value={cop(totalEgresos)} />
          <CuadreRow label="Ventas realizadas a crédito"         value={cop(d.ventasCredito)} />

          {/* Resultado neto — fila destacada */}
          <div style={{ height: 4 }} />
          <div style={{
            backgroundColor: C.blue100, borderRadius: 10,
            padding: '12px 14px', margin: '6px 0 4px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.white, fontFamily: FONT }}>
              Resultado neto del turno
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.white, fontFamily: FONT }}>
              {cop(resultadoNeto)}
            </span>
          </div>
          <p style={{ fontSize: 11, color: C.black60, fontFamily: FONT, margin: '6px 0 0', lineHeight: '16px' }}>
            ({cop(totalIngresos)} ingresos + {cop(totalNoRelacionados)} no relacionados − {cop(totalEgresos)} egresos = {cop(resultadoNeto)})
          </p>
        </Card>
      </div>

      {/* ── 5. Transacciones anuladas ── */}
      <div>
        <SectionTitle>Transacciones anuladas</SectionTitle>
        <Card>
          <DetailTable
            headers={['Tipo de anulación', 'Monto']}
            rows={[
              ['Ventas anuladas',  0],
              ['Recibos anulados', 0],
            ]}
            totalLabel="Total anulaciones"
            totalValue={cop(0)}
          />
        </Card>
      </div>
    </div>
  );
}

// ─── Right panel: turno detail ────────────────────────────────────────────────

function TurnoDetail({ turno }: { turno: Turno }) {
  const [tab, setTab] = useState<'resumen' | 'detalle'>('resumen');
  const d = turno.detalle;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 24 }}>

      {/* ── Title row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.blue100, fontFamily: FONT, margin: 0, lineHeight: '26px' }}>
            Turno No. {turno.id}
          </h1>
          <span style={{ fontSize: 13, color: C.black60, fontFamily: FONT }}>
            {turno.tienda} · {turno.cajero}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {(['Historial', 'Agregar gasto'] as const).map(label => (
            <button key={label} style={{
              fontSize: 12, fontWeight: 500, color: C.blue60,
              backgroundColor: C.white, border: `1px solid ${C.blue20}`,
              borderRadius: 100, padding: '6px 14px', cursor: 'pointer',
              fontFamily: FONT,
            }}>
              {label}
            </button>
          ))}
          {turno.estado === 'abierto' && (
            <button style={{
              fontSize: 12, fontWeight: 700, color: C.white,
              backgroundColor: C.coral100, border: 'none',
              borderRadius: 100, padding: '6px 18px', cursor: 'pointer',
              fontFamily: FONT,
            }}>
              Cerrar Turno
            </button>
          )}
        </div>
      </div>

      {/* ── Info cards ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>

        {/* Card 1: Fechas */}
        <Card style={{ flex: '1 0 200px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Calendar size={20} color={C.blue100} />
            <StatusBadge estado={turno.estado} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: C.black40, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.4px', margin: '0 0 2px' }}>
                Inicio del turno
              </p>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.black100, fontFamily: FONT, margin: 0 }}>
                {turno.inicio}
              </p>
            </div>
            {turno.cierre && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: C.black40, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.4px', margin: '0 0 2px' }}>
                  Cierre del turno
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.black100, fontFamily: FONT, margin: 0 }}>
                  {turno.cierre}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Card 2: Ventas registradas */}
        <Card style={{ flex: '1 0 180px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {turno.estado === 'abierto'
              ? <Sun size={20} color="#f59e0b" />
              : <Clock size={20} color={C.black60} />
            }
            <span style={{ fontSize: 10, fontWeight: 600, color: C.black40, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Ventas registradas
            </span>
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.black100, fontFamily: FONT, margin: '0 0 2px', lineHeight: '26px' }}>
              {cop(d.ventasRegistradas)}
            </p>
            <p style={{ fontSize: 12, color: C.black60, fontFamily: FONT, margin: 0 }}>
              {d.numVentas} ventas
            </p>
            <p style={{ fontSize: 10, color: '#909090', fontFamily: FONT, margin: '4px 0 0' }}>
              No incluye propinas
            </p>
          </div>
        </Card>

        {/* Card 3: Total propinas */}
        <Card style={{ flex: '1 0 160px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <HandCoins size={20} color={C.blue100} />
            <span style={{ fontSize: 10, fontWeight: 600, color: C.black40, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total propinas
            </span>
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.black100, fontFamily: FONT, margin: '0 0 2px', lineHeight: '26px' }}>
              {cop(turno.ventas.propinas)}
            </p>
          </div>
        </Card>

        {/* Card 4: Total con propinas */}
        <Card style={{ flex: '1 0 180px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <TrendingUp size={20} color={C.successText} />
            <span style={{ fontSize: 10, fontWeight: 600, color: C.black40, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total con propinas
            </span>
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.black100, fontFamily: FONT, margin: '0 0 2px', lineHeight: '26px' }}>
              {cop(d.ventasRegistradas + turno.ventas.propinas)}
            </p>
            <p style={{ fontSize: 10, color: '#909090', fontFamily: FONT, margin: '4px 0 0' }}>
              Ventas {cop(d.ventasRegistradas)} + Propinas {cop(turno.ventas.propinas)}
            </p>
          </div>
        </Card>

        {/* Card 3: Cajero */}
        <Card style={{ flex: '1 0 160px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: C.black40, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
            Cajero
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.black100, fontFamily: FONT, margin: '2px 0 0', lineHeight: '20px' }}>
            {turno.cajero}
          </p>
          <p style={{ fontSize: 12, color: C.black60, fontFamily: FONT, margin: 0 }}>
            {turno.tienda}
          </p>
        </Card>

        {/* Card 4 (solo abierto): Efectivo en caja */}
        {turno.estado === 'abierto' && (
          <Card style={{ flex: '1 0 160px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: C.black40, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
              Efectivo en caja
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.black100, fontFamily: FONT, margin: '2px 0 0', lineHeight: '20px' }}>
              {cop(turno.ventas.efectivo)}
            </p>
            <p style={{ fontSize: 12, color: C.black60, fontFamily: FONT, margin: 0 }}>
              Saldo inicial: {cop(d.saldoInicial)}
            </p>
          </Card>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: 4, height: 38,
        border: `1px solid ${C.blue100}`, borderRadius: 100,
        padding: 3, width: 'fit-content',
      }}>
        {(['resumen', 'detalle'] as const).map(t => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                height: '100%', padding: '0 22px', borderRadius: 100,
                backgroundColor: active ? C.blue100 : 'transparent',
                border: 'none',
                color: active ? C.white : C.blue100,
                fontSize: 12, fontWeight: active ? 700 : 500,
                fontFamily: FONT, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      {tab === 'resumen' ? <TabResumen turno={turno} /> : <TabDetalle turno={turno} />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TurnosPage() {
  const [selectedId, setSelectedId] = useState<number>(MOCK_TURNOS[0].id);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(MOCK_TURNOS.length / PAGE_SIZE);
  const paginated  = MOCK_TURNOS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const selected   = MOCK_TURNOS.find(t => t.id === selectedId) ?? MOCK_TURNOS[0];

  return (
    <div style={{ flex: 1, display: 'flex', gap: 12, overflow: 'hidden' }}>

      {/* ── Left panel ── */}
      <div style={{
        width: 280, flexShrink: 0,
        backgroundColor: C.white, borderRadius: 16,
        boxShadow: C.shadowMd,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 16px 12px', borderBottom: `1px solid ${C.divider}`, flexShrink: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.blue100, fontFamily: FONT, margin: 0 }}>
            Turnos
          </h2>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {paginated.map((turno, idx) => (
            <React.Fragment key={turno.id}>
              <TurnoListItem
                turno={turno}
                isSelected={turno.id === selectedId}
                onClick={() => setSelectedId(turno.id)}
              />
              {idx < paginated.length - 1 && (
                <div style={{ height: 1, backgroundColor: C.divider, margin: '1px 6px' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Pagination (visible only if >9 turnos) */}
        {totalPages > 1 && (
          <div style={{
            flexShrink: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '10px 12px',
            borderTop: `1px solid ${C.divider}`,
          }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: page === 0 ? C.black40 : C.blue100,
                background: 'none', border: 'none', cursor: page === 0 ? 'default' : 'pointer',
                fontFamily: FONT, padding: 4,
              }}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span style={{ fontSize: 11, color: C.black60, fontFamily: FONT }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: page === totalPages - 1 ? C.black40 : C.blue100,
                background: 'none', border: 'none', cursor: page === totalPages - 1 ? 'default' : 'pointer',
                fontFamily: FONT, padding: 4,
              }}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 2 }}>
        <TurnoDetail key={selected.id} turno={selected} />
      </div>
    </div>
  );
}
