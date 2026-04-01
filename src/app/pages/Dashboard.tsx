/**
 * Dashboard — /inicio
 * ─────────────────────────────────────────────────────────────────────────────
 * Vista de métricas principales para el dueño del restaurante.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { TrendingUp, Receipt, Users, Clock, ChevronDown, ShoppingBag, MapPin, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:       '#f7f8fb',
  white:    '#ffffff',
  black100: '#1e1e1e',
  black60:  '#606060',
  black40:  '#969696',
  blue100:  '#121e6c',
  blue60:   '#3e4983',   // Merlin blue/60
  blueBg:   'rgba(18,30,108,0.07)',  // Merlin icon tint (circular)
  border:   '#d2d4e1',  // Merlin blue/20 (was #E8E9F0)
  brandRed: '#C73C53',  // Merlin Brand/Full/20 — chart accent
};

const FONT = 'Montserrat, sans-serif';

type Period  = 'today' | 'week' | 'month' | 'custom';
type Channel = 'all' | 'mesas' | 'mostrador';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCOP(n: number) {
  return '$' + n.toLocaleString('es-CO');
}

function getDateLabel(period: Period, from: string, to: string): string {
  if (period === 'today')  return 'Hoy, 25 mar';
  if (period === 'week')   return 'Lun 24 – Dom 30 mar';
  if (period === 'month')  return '1 – 31 marzo 2026';
  if (from && to) {
    const fmt = (d: string) => {
      const parts = d.split('-');
      const months = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${parseInt(parts[2])} ${months[parseInt(parts[1])]}`;
    };
    return `${fmt(from)} – ${fmt(to)}`;
  }
  return 'Últimos 7 días';
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

function Card({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        backgroundColor: C.white,
        borderRadius: 16,
        padding: 20,
        border: `1px solid ${C.border}`,
        boxShadow: hovered ? '0 4px 16px rgba(18,30,108,0.08)' : 'none',
        transition: 'box-shadow 0.15s ease',
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  children,
  mb = 16,
  subtitle,
}: {
  children: React.ReactNode;
  mb?: number;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: mb }}>
      <p style={{
        fontSize: 14, fontWeight: 600, color: C.black100,
        fontFamily: FONT, margin: 0, lineHeight: '20px',
      }}>
        {children}
      </p>
      {subtitle && (
        <p style={{ fontSize: 11, color: C.black40, fontFamily: FONT, margin: '2px 0 0' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  value,
  label,
  badge,
  badgeColor,
  note,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  badge: string;
  badgeColor: 'green' | 'red' | 'yellow';
  note?: string;
}) {
  const palette = {
    green:  { bg: '#D1FAE5', text: '#0F6E56' },
    red:    { bg: '#FEE2E2', text: '#DC2626' },
    yellow: { bg: '#FEF9C3', text: '#854F0B' },
  }[badgeColor];

  return (
    <Card style={{ flex: 1, minWidth: 180 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 12,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          backgroundColor: C.blueBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} color={C.blue100} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 500, fontFamily: FONT,
          backgroundColor: palette.bg, color: palette.text,
          padding: '4px 10px', borderRadius: 100,
          lineHeight: '16px',
        }}>
          {badge}
        </span>
      </div>
      <div style={{
        fontSize: 24, fontWeight: 600, color: C.black100,
        fontFamily: FONT, lineHeight: '32px', marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 14, color: C.black100, fontFamily: FONT, lineHeight: '20px' }}>
        {label}
      </div>
      {note && (
        <div style={{ fontSize: 10, color: '#909090', fontFamily: FONT, marginTop: 4 }}>
          {note}
        </div>
      )}
    </Card>
  );
}

function ZoneBar({
  label, filled, total, pct,
}: {
  label: string; filled: number; total: number; pct: number;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: C.black100, fontFamily: FONT }}>
          {label}
        </span>
        <span style={{ fontSize: 13, color: C.black60, fontFamily: FONT }}>
          {filled}/{total} mesas
        </span>
      </div>
      <div style={{ height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          backgroundColor: C.blue100, borderRadius: 4,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

// ─── Custom Recharts tooltips ─────────────────────────────────────────────────

function HourlyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: C.white, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '8px 12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.10)', fontFamily: FONT,
    }}>
      <p style={{ fontSize: 12, color: C.black60, margin: 0, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: C.blue100, margin: 0 }}>
        {formatCOP(payload[0].value)}
      </p>
    </div>
  );
}

function WeeklyTooltip({ active, payload, label, labels }: any) {
  if (!active || !payload?.length) return null;
  const L = labels ?? { actual: 'Esta semana', pasada: 'Sem. pasada' };
  return (
    <div style={{
      backgroundColor: C.white, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '8px 12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.10)', fontFamily: FONT,
    }}>
      <p style={{ fontSize: 12, color: C.black60, margin: 0, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) =>
        p.value ? (
          <p key={p.name} style={{ fontSize: 13, fontWeight: 600, color: p.color, margin: 0 }}>
            {L[p.name] ?? p.name}: {formatCOP(p.value)}
          </p>
        ) : null
      )}
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

type KpiEntry = {
  ventas: number; ventasLabel: string;
  vBadge: string; vBadgeColor: 'green' | 'red' | 'yellow';
  ticket: number;
  tBadge: string; tBadgeColor: 'green' | 'red' | 'yellow';
  count: number; countLabel: string; countIcon: 'users' | 'bag';
  mBadge: string; mBadgeColor: 'green' | 'red' | 'yellow';
  tiempo: string; tiempoLabel: string;
  tiempoBadge: string; tiempoBadgeColor: 'green' | 'red' | 'yellow';
};

const KPI_DATA: Record<Period, Record<Channel, KpiEntry>> = {
  today: {
    all: {
      ventas: 2450000, ventasLabel: 'Ventas del día',
      vBadge: '+12% vs sem. pasada', vBadgeColor: 'green',
      ticket: 72000,
      tBadge: '-3% vs sem. pasada',  tBadgeColor: 'red',
      count: 73, countLabel: 'Transacciones', countIcon: 'users',
      mBadge: '+8 vs sem. pasada',   mBadgeColor: 'green',
      tiempo: '32 min', tiempoLabel: 'Tiempo promedio',
      tiempoBadge: '-5 min',         tiempoBadgeColor: 'green',
    },
    mesas: {
      ventas: 1680000, ventasLabel: 'Ventas del día',
      vBadge: '+10% vs sem. pasada', vBadgeColor: 'green',
      ticket: 85000,
      tBadge: '-3% vs sem. pasada',  tBadgeColor: 'red',
      count: 28, countLabel: 'Mesas atendidas', countIcon: 'users',
      mBadge: '+5 vs sem. pasada',   mBadgeColor: 'green',
      tiempo: '47 min', tiempoLabel: 'Tiempo promedio en mesa',
      tiempoBadge: '-8 min',         tiempoBadgeColor: 'green',
    },
    mostrador: {
      ventas: 770000, ventasLabel: 'Ventas del día',
      vBadge: '+15% vs sem. pasada', vBadgeColor: 'green',
      ticket: 52000,
      tBadge: '-1% vs sem. pasada',  tBadgeColor: 'red',
      count: 45, countLabel: 'Órdenes completadas', countIcon: 'bag',
      mBadge: '+12 vs sem. pasada',  mBadgeColor: 'green',
      tiempo: '12 min', tiempoLabel: 'Tiempo promedio por orden',
      tiempoBadge: '-2 min',         tiempoBadgeColor: 'green',
    },
  },
  week: {
    all: {
      ventas: 14200000, ventasLabel: 'Ventas de la semana',
      vBadge: '+8% vs sem. pasada',  vBadgeColor: 'green',
      ticket: 70000,
      tBadge: '-2% vs sem. pasada',  tBadgeColor: 'red',
      count: 440, countLabel: 'Transacciones', countIcon: 'users',
      mBadge: '+22 vs sem. pasada',  mBadgeColor: 'green',
      tiempo: '30 min', tiempoLabel: 'Tiempo promedio',
      tiempoBadge: '+1 min',         tiempoBadgeColor: 'yellow',
    },
    mesas: {
      ventas: 9700000, ventasLabel: 'Ventas de la semana',
      vBadge: '+7% vs sem. pasada',  vBadgeColor: 'green',
      ticket: 82000,
      tBadge: '-2% vs sem. pasada',  tBadgeColor: 'red',
      count: 168, countLabel: 'Mesas atendidas', countIcon: 'users',
      mBadge: '+18 vs sem. pasada',  mBadgeColor: 'green',
      tiempo: '52 min', tiempoLabel: 'Tiempo promedio en mesa',
      tiempoBadge: '+3 min',         tiempoBadgeColor: 'yellow',
    },
    mostrador: {
      ventas: 4500000, ventasLabel: 'Ventas de la semana',
      vBadge: '+10% vs sem. pasada', vBadgeColor: 'green',
      ticket: 51000,
      tBadge: '-1% vs sem. pasada',  tBadgeColor: 'red',
      count: 272, countLabel: 'Órdenes completadas', countIcon: 'bag',
      mBadge: '+28 vs sem. pasada',  mBadgeColor: 'green',
      tiempo: '11 min', tiempoLabel: 'Tiempo promedio por orden',
      tiempoBadge: '-1 min',         tiempoBadgeColor: 'green',
    },
  },
  month: {
    all: {
      ventas: 58500000, ventasLabel: 'Ventas del mes',
      vBadge: '+15% vs mes pasado',  vBadgeColor: 'green',
      ticket: 68000,
      tBadge: '-5% vs mes pasado',   tBadgeColor: 'red',
      count: 1860, countLabel: 'Transacciones', countIcon: 'users',
      mBadge: '+90 vs mes pasado',   mBadgeColor: 'green',
      tiempo: '31 min', tiempoLabel: 'Tiempo promedio',
      tiempoBadge: '-2 min',         tiempoBadgeColor: 'green',
    },
    mesas: {
      ventas: 40000000, ventasLabel: 'Ventas del mes',
      vBadge: '+14% vs mes pasado',  vBadgeColor: 'green',
      ticket: 79000,
      tBadge: '-5% vs mes pasado',   tBadgeColor: 'red',
      count: 720, countLabel: 'Mesas atendidas', countIcon: 'users',
      mBadge: '+45 vs mes pasado',   mBadgeColor: 'green',
      tiempo: '49 min', tiempoLabel: 'Tiempo promedio en mesa',
      tiempoBadge: '-1 min',         tiempoBadgeColor: 'green',
    },
    mostrador: {
      ventas: 18500000, ventasLabel: 'Ventas del mes',
      vBadge: '+17% vs mes pasado',  vBadgeColor: 'green',
      ticket: 50000,
      tBadge: '-2% vs mes pasado',   tBadgeColor: 'red',
      count: 1140, countLabel: 'Órdenes completadas', countIcon: 'bag',
      mBadge: '+80 vs mes pasado',   mBadgeColor: 'green',
      tiempo: '11 min', tiempoLabel: 'Tiempo promedio por orden',
      tiempoBadge: '-1 min',         tiempoBadgeColor: 'green',
    },
  },
  custom: {
    all: {
      ventas: 2450000, ventasLabel: 'Ventas del período',
      vBadge: '+12% vs período ant.', vBadgeColor: 'green',
      ticket: 72000,
      tBadge: '-3% vs período ant.',  tBadgeColor: 'red',
      count: 73, countLabel: 'Transacciones', countIcon: 'users',
      mBadge: '+8 vs período ant.',   mBadgeColor: 'green',
      tiempo: '32 min', tiempoLabel: 'Tiempo promedio',
      tiempoBadge: '-5 min',          tiempoBadgeColor: 'green',
    },
    mesas: {
      ventas: 1680000, ventasLabel: 'Ventas del período',
      vBadge: '+10% vs período ant.', vBadgeColor: 'green',
      ticket: 85000,
      tBadge: '-3% vs período ant.',  tBadgeColor: 'red',
      count: 28, countLabel: 'Mesas atendidas', countIcon: 'users',
      mBadge: '+5 vs período ant.',   mBadgeColor: 'green',
      tiempo: '47 min', tiempoLabel: 'Tiempo promedio en mesa',
      tiempoBadge: '-8 min',          tiempoBadgeColor: 'green',
    },
    mostrador: {
      ventas: 770000, ventasLabel: 'Ventas del período',
      vBadge: '+15% vs período ant.', vBadgeColor: 'green',
      ticket: 52000,
      tBadge: '-1% vs período ant.',  tBadgeColor: 'red',
      count: 45, countLabel: 'Órdenes completadas', countIcon: 'bag',
      mBadge: '+12 vs período ant.',  mBadgeColor: 'green',
      tiempo: '12 min', tiempoLabel: 'Tiempo promedio por orden',
      tiempoBadge: '-2 min',          tiempoBadgeColor: 'green',
    },
  },
};

const BAR_DATA: Record<Period, Record<Channel, { x: string; ventas: number }[]>> = {
  today: {
    all:       [
      { x: '9am',  ventas: 120000 }, { x: '10am', ventas: 85000  },
      { x: '11am', ventas: 340000 }, { x: '12pm', ventas: 520000 },
      { x: '1pm',  ventas: 480000 }, { x: '2pm',  ventas: 380000 },
      { x: '3pm',  ventas: 290000 }, { x: '4pm',  ventas: 235000 },
    ],
    mesas:     [
      { x: '9am',  ventas: 80000  }, { x: '10am', ventas: 58000  },
      { x: '11am', ventas: 230000 }, { x: '12pm', ventas: 350000 },
      { x: '1pm',  ventas: 320000 }, { x: '2pm',  ventas: 255000 },
      { x: '3pm',  ventas: 195000 }, { x: '4pm',  ventas: 160000 },
    ],
    mostrador: [
      { x: '9am',  ventas: 40000  }, { x: '10am', ventas: 27000  },
      { x: '11am', ventas: 110000 }, { x: '12pm', ventas: 170000 },
      { x: '1pm',  ventas: 160000 }, { x: '2pm',  ventas: 125000 },
      { x: '3pm',  ventas: 95000  }, { x: '4pm',  ventas: 75000  },
    ],
  },
  week: {
    all:       [
      { x: 'Lun 24', ventas: 1800000 }, { x: 'Mar 25', ventas: 2100000 },
      { x: 'Mié 26', ventas: 1950000 }, { x: 'Jue 27', ventas: 2450000 },
      { x: 'Vie 28', ventas: 2800000 }, { x: 'Sáb 29', ventas: 3200000 },
      { x: 'Dom 30', ventas: 2900000 },
    ],
    mesas:     [
      { x: 'Lun 24', ventas: 1200000 }, { x: 'Mar 25', ventas: 1400000 },
      { x: 'Mié 26', ventas: 1300000 }, { x: 'Jue 27', ventas: 1650000 },
      { x: 'Vie 28', ventas: 1900000 }, { x: 'Sáb 29', ventas: 2150000 },
      { x: 'Dom 30', ventas: 1950000 },
    ],
    mostrador: [
      { x: 'Lun 24', ventas: 600000  }, { x: 'Mar 25', ventas: 700000  },
      { x: 'Mié 26', ventas: 650000  }, { x: 'Jue 27', ventas: 800000  },
      { x: 'Vie 28', ventas: 900000  }, { x: 'Sáb 29', ventas: 1050000 },
      { x: 'Dom 30', ventas: 950000  },
    ],
  },
  month: {
    all:       [
      { x: 'Sem 1', ventas: 13500000 }, { x: 'Sem 2', ventas: 15200000 },
      { x: 'Sem 3', ventas: 14800000 }, { x: 'Sem 4', ventas: 15000000 },
    ],
    mesas:     [
      { x: 'Sem 1', ventas: 9200000  }, { x: 'Sem 2', ventas: 10300000 },
      { x: 'Sem 3', ventas: 10100000 }, { x: 'Sem 4', ventas: 10200000 },
    ],
    mostrador: [
      { x: 'Sem 1', ventas: 4300000 }, { x: 'Sem 2', ventas: 4900000 },
      { x: 'Sem 3', ventas: 4700000 }, { x: 'Sem 4', ventas: 4800000 },
    ],
  },
  custom: {
    all:       [
      { x: '9am',  ventas: 120000 }, { x: '10am', ventas: 85000  },
      { x: '11am', ventas: 340000 }, { x: '12pm', ventas: 520000 },
      { x: '1pm',  ventas: 480000 }, { x: '2pm',  ventas: 380000 },
      { x: '3pm',  ventas: 290000 }, { x: '4pm',  ventas: 235000 },
    ],
    mesas:     [
      { x: '9am',  ventas: 80000  }, { x: '10am', ventas: 58000  },
      { x: '11am', ventas: 230000 }, { x: '12pm', ventas: 350000 },
      { x: '1pm',  ventas: 320000 }, { x: '2pm',  ventas: 255000 },
      { x: '3pm',  ventas: 195000 }, { x: '4pm',  ventas: 160000 },
    ],
    mostrador: [
      { x: '9am',  ventas: 40000  }, { x: '10am', ventas: 27000  },
      { x: '11am', ventas: 110000 }, { x: '12pm', ventas: 170000 },
      { x: '1pm',  ventas: 160000 }, { x: '2pm',  ventas: 125000 },
      { x: '3pm',  ventas: 95000  }, { x: '4pm',  ventas: 75000  },
    ],
  },
};

const BAR_TITLE: Record<Period, string> = {
  today:  'Ventas por hora',
  week:   'Ventas por día',
  month:  'Ventas por semana',
  custom: 'Ventas por hora',
};

// Line chart data — static per period type (not filtered by channel)
const weeklyData = [
  { day: 'Lun 24', actual: 1800000, pasada: 1650000 },
  { day: 'Mar 25', actual: 2100000, pasada: 1900000 },
  { day: 'Mié 26', actual: 1950000, pasada: 2200000 },
  { day: 'Jue 27', actual: 2450000, pasada: 2100000 },
  { day: 'Vie 28', actual: null,    pasada: 2800000  },
  { day: 'Sáb 29', actual: null,    pasada: 3200000  },
  { day: 'Dom 30', actual: null,    pasada: 2900000  },
];

const monthlyLineData = [
  { day: 'Sem 1', actual: 12500000, pasada: 11800000 },
  { day: 'Sem 2', actual: 14200000, pasada: 13500000 },
  { day: 'Sem 3', actual: 15800000, pasada: 14200000 },
  { day: 'Sem 4', actual: 16000000, pasada: 15000000 },
];

type Product = { name: string; revenue: number; units: number };

const TOP_PRODUCTS: Record<Channel, Product[]> = {
  all: [
    { name: 'Costillas BBQ',     revenue: 480000, units: 12 },
    { name: 'Pizza Pepperoni',   revenue: 320000, units: 8  },
    { name: 'Iced Latte XL',     revenue: 175000, units: 7  },
    { name: 'Cerveza Artesanal', revenue: 144000, units: 12 },
    { name: 'Tiramisú',          revenue: 90000,  units: 6  },
  ],
  mesas: [
    { name: 'Costillas BBQ',     revenue: 360000, units: 9  },
    { name: 'Pizza Pepperoni',   revenue: 240000, units: 6  },
    { name: 'Cerveza Artesanal', revenue: 120000, units: 10 },
    { name: 'Vino de la Casa',   revenue: 110000, units: 4  },
    { name: 'Tiramisú',          revenue: 75000,  units: 5  },
  ],
  mostrador: [
    { name: 'Iced Latte XL',       revenue: 175000, units: 7 },
    { name: 'Cappuccino Doble',     revenue: 130000, units: 5 },
    { name: 'Costillas BBQ',        revenue: 120000, units: 3 },
    { name: 'Brownie Caliente',     revenue: 88000,  units: 4 },
    { name: 'Ensalada César',       revenue: 80000,  units: 3 },
  ],
};

// Split view data shown when channel === 'all' (two subsections inside Top 5 card)
const TOP_PRODUCTS_SPLIT = {
  mesas: [
    { name: 'Costillas BBQ',        revenue: 360000, units: 9  },
    { name: 'Risotto Trufa',        revenue: 280000, units: 4  },
    { name: 'Solomillo Wellington', revenue: 240000, units: 3  },
    { name: 'Vino Malbec',          revenue: 150000, units: 5  },
    { name: 'Tiramisú',             revenue: 72000,  units: 5  },
  ],
  mostrador: [
    { name: 'Iced Latte XL',    revenue: 175000, units: 7  },
    { name: 'Cappuccino Doble', revenue: 130000, units: 5  },
    { name: 'Pizza Pepperoni',  revenue: 120000, units: 3  },
    { name: 'Brownie Caliente', revenue: 88000,  units: 4  },
    { name: 'Café Americano',   revenue: 45000,  units: 15 },
  ],
};

const BRANCHES = [
  { value: 'all',       label: 'Todas las sucursales' },
  { value: 'principal', label: 'Sucursal Principal'   },
  { value: 'norte',     label: 'Sucursal Norte'       },
  { value: 'centro',    label: 'Sucursal Centro'      },
];

const PERIODS: { value: Period; label: string }[] = [
  { value: 'today',  label: 'Hoy'          },
  { value: 'week',   label: 'Esta semana'  },
  { value: 'month',  label: 'Este mes'     },
  { value: 'custom', label: 'Personalizado'},
];

// ─── Custom period bar chart helper ──────────────────────────────────────────

const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DAYS_SHORT   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

/** Returns "Lun 24" (same month) or "24 mar" (cross-month) */
function formatDayLabel(d: Date, sameMonth: boolean): string {
  return sameMonth
    ? `${DAYS_SHORT[d.getDay()]} ${d.getDate()}`
    : `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

function getCustomBarData(
  from: string,
  to: string,
  channel: Channel,
): { data: { x: string; ventas: number }[]; title: string } {
  const fromDate = new Date(from + 'T00:00:00');
  const toDate   = new Date(to   + 'T00:00:00');
  const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;

  // ── 1 day → hourly ──────────────────────────────────────────────────────
  if (diffDays <= 1) {
    return {
      data:  BAR_DATA.today[channel],
      title: 'Ventas por hora',
    };
  }

  // ── 2–14 days → one bar per day ─────────────────────────────────────────
  if (diffDays <= 14) {
    const base      = channel === 'mostrador' ? 600000  : channel === 'mesas' ? 1100000 : 1500000;
    const range     = channel === 'mostrador' ? 700000  : channel === 'mesas' ? 1000000 : 1400000;
    const sameMonth = fromDate.getMonth() === toDate.getMonth();
    const data      = Array.from({ length: diffDays }, (_, i) => {
      const d    = new Date(fromDate); d.setDate(d.getDate() + i);
      const seed = (d.getDate() * 7 + d.getMonth() * 31 + i * 17) % 100;
      return {
        x:      formatDayLabel(d, sameMonth),
        ventas: base + Math.floor((seed / 100) * range),
      };
    });
    return { data, title: 'Ventas por día' };
  }

  // ── 15–60 days → one bar per week ───────────────────────────────────────
  if (diffDays <= 60) {
    const numWeeks = Math.ceil(diffDays / 7);
    const base     = channel === 'mostrador' ? 3500000  : channel === 'mesas' ? 7000000  : 10000000;
    const range    = channel === 'mostrador' ? 1800000  : channel === 'mesas' ? 3200000  : 6000000;
    const data     = Array.from({ length: numWeeks }, (_, w) => {
      const seed = (w * 13 + 37) % 100;
      return {
        x:      `Sem ${w + 1}`,
        ventas: base + Math.floor((seed / 100) * range),
      };
    });
    return { data, title: 'Ventas por semana' };
  }

  // ── 60+ days → one bar per month ─────────────────────────────────────────
  const monthBase  = channel === 'mostrador' ? 15000000 : channel === 'mesas' ? 28000000 : 40000000;
  const monthRange = channel === 'mostrador' ? 8000000  : channel === 'mesas' ? 14000000 : 20000000;
  const monthData: { x: string; ventas: number }[] = [];
  const cur = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const end = new Date(toDate.getFullYear(),   toDate.getMonth(),   1);
  while (cur <= end) {
    const seed = (cur.getMonth() * 11 + cur.getFullYear() * 7) % 100;
    const label = MONTHS_SHORT[cur.getMonth()];
    monthData.push({
      x:      label.charAt(0).toUpperCase() + label.slice(1),
      ventas: monthBase + Math.floor((seed / 100) * monthRange),
    });
    cur.setMonth(cur.getMonth() + 1);
  }
  return { data: monthData, title: 'Ventas por mes' };
}

type LineRow = { day: string; actual: number | null; pasada: number };
type LineResult = { data: LineRow[]; title: string; labels: { actual: string; pasada: string } };

function getCustomLineData(from: string, to: string): LineResult {
  if (!from || !to) {
    return { data: weeklyData as LineRow[], title: 'Últimos 7 días', labels: { actual: 'Esta semana', pasada: 'Sem. pasada' } };
  }

  const fromDate = new Date(from + 'T00:00:00');
  const toDate   = new Date(to   + 'T00:00:00');
  const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
  const labels   = { actual: 'Este período', pasada: 'Período anterior' };

  // 1 day → hourly comparison vs same day last week
  if (diffDays <= 1) {
    const hourly = [85000, 65000, 320000, 520000, 480000, 380000, 290000, 210000];
    return {
      data:   ['9am','10am','11am','12pm','1pm','2pm','3pm','4pm'].map((h, i) => ({
        day:    h,
        actual: hourly[i],
        pasada: Math.floor(hourly[i] * (0.82 + (i * 3 % 15) / 100)),
      })),
      title:  'Comparativo diario',
      labels,
    };
  }

  // 2–14 days → one point per day
  if (diffDays <= 14) {
    const sameMonth = fromDate.getMonth() === toDate.getMonth();
    return {
      data: Array.from({ length: diffDays }, (_, i) => {
        const d    = new Date(fromDate); d.setDate(d.getDate() + i);
        const seed = (d.getDate() * 7 + d.getMonth() * 31 + i * 17) % 100;
        const actual = 1500000 + Math.floor((seed / 100) * 1300000);
        return {
          day:    formatDayLabel(d, sameMonth),
          actual,
          pasada: Math.floor(actual * (0.82 + (seed % 18) / 100)),
        };
      }),
      title: 'Comparativo del período',
      labels,
    };
  }

  // 15–60 days → one point per week
  if (diffDays <= 60) {
    const numWeeks = Math.ceil(diffDays / 7);
    return {
      data: Array.from({ length: numWeeks }, (_, w) => {
        const seed   = (w * 13 + 41) % 100;
        const actual = 3500000 + Math.floor((seed / 100) * 2000000);
        return {
          day:    `Sem ${w + 1}`,
          actual,
          pasada: Math.floor(actual * (0.85 + (seed % 15) / 100)),
        };
      }),
      title: 'Comparativo del período',
      labels,
    };
  }

  // 60+ days → one point per month
  const numMonths = Math.ceil(diffDays / 30);
  return {
    data: Array.from({ length: numMonths }, (_, m) => {
      const d    = new Date(fromDate); d.setMonth(d.getMonth() + m);
      const seed = (d.getMonth() * 11 + m * 7) % 100;
      const actual = 12000000 + Math.floor((seed / 100) * 8000000);
      return {
        day:    MONTHS_SHORT[d.getMonth()],
        actual,
        pasada: Math.floor(actual * (0.85 + (seed % 15) / 100)),
      };
    }),
    title: 'Comparativo del período',
    labels,
  };
}

// ─── Custom period KPI helper ─────────────────────────────────────────────────

function getCustomKpi(from: string, to: string, channel: Channel): KpiEntry {
  if (!from || !to) return KPI_DATA.custom[channel];

  const fromDate = new Date(from + 'T00:00:00');
  const toDate   = new Date(to   + 'T00:00:00');
  const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;

  const base = channel === 'mostrador'
    ? { ventas: 770000,  count: 45, ticket: 52000, tiempo: '12 min', tiempoLabel: 'Tiempo promedio por orden',  countLabel: 'Órdenes completadas', countIcon: 'bag'   as const }
    : channel === 'mesas'
    ? { ventas: 1680000, count: 28, ticket: 85000, tiempo: '47 min', tiempoLabel: 'Tiempo promedio en mesa',    countLabel: 'Mesas atendidas',      countIcon: 'users' as const }
    : { ventas: 2450000, count: 73, ticket: 72000, tiempo: '32 min', tiempoLabel: 'Tiempo promedio',             countLabel: 'Transacciones',        countIcon: 'users' as const };

  const totalVentas = base.ventas * diffDays;
  const totalCount  = base.count  * diffDays;

  // Deterministic mock badge percentages based on start date
  const seed  = (fromDate.getDate() + fromDate.getMonth() * 3) % 20;
  const vPct  = 5 + seed;
  const cPct  = 3 + (seed % 10);
  const tPct  = 1 + (seed % 5);

  return {
    ventas:           totalVentas,
    ventasLabel:      'Ventas del período',
    vBadge:           `+${vPct}% vs período ant.`,
    vBadgeColor:      'green',
    ticket:           base.ticket,
    tBadge:           `-${tPct}% vs período ant.`,
    tBadgeColor:      'red',
    count:            totalCount,
    countLabel:       base.countLabel,
    countIcon:        base.countIcon,
    mBadge:           `+${cPct}% vs período ant.`,
    mBadgeColor:      'green',
    tiempo:           base.tiempo,
    tiempoLabel:      base.tiempoLabel,
    tiempoBadge:      '-2 min',
    tiempoBadgeColor: 'green',
  };
}

function ProductList({ items }: { items: Product[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((p, i) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            backgroundColor: C.blue100, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, fontFamily: FONT, flexShrink: 0,
          }}>
            {i + 1}
          </div>
          <span style={{ flex: 1, fontSize: 14, color: C.black100, fontFamily: FONT }}>
            {p.name}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.black100, fontFamily: FONT }}>
            {formatCOP(p.revenue)}
          </span>
          <span style={{ fontSize: 12, color: C.black40, fontFamily: FONT, minWidth: 52, textAlign: 'right' }}>
            {p.units} uds.
          </span>
        </div>
      ))}
    </div>
  );
}


// ─── Main component ───────────────────────────────────────────────────────────

export function Dashboard() {
  const [period,      setPeriod]     = useState<Period>('today');
  const [channel,     setChannel]    = useState<Channel>('mesas');
  const [channelOpen, setChannelOpen] = useState(false);
  const [branch,      setBranch]     = useState('principal');
  const [branchOpen,  setBranchOpen] = useState(false);
  const [customFrom,    setCustomFrom]    = useState('');
  const [customTo,      setCustomTo]      = useState('');
  const [refreshCount,  setRefreshCount]  = useState(0);

  const kpi = period === 'custom' && customFrom && customTo
    ? getCustomKpi(customFrom, customTo, channel)
    : KPI_DATA[period][channel];

  // Bar chart: for custom period, derive data from the selected date range
  const _customBar = period === 'custom' && customFrom && customTo
    ? getCustomBarData(customFrom, customTo, channel)
    : null;
  const barData  = _customBar ? _customBar.data  : BAR_DATA[period][channel];
  const barTitle = _customBar ? _customBar.title : BAR_TITLE[period];
  const countIcon = kpi.countIcon === 'bag' ? ShoppingBag : Users;
  const products  = TOP_PRODUCTS[channel];

  // Date context label shown as subtitle in each card
  const dateLabel = getDateLabel(period, customFrom, customTo);

  // Line chart: override for custom period based on selected range
  const _customLine = period === 'custom'
    ? getCustomLineData(customFrom, customTo)
    : null;
  const lineData   = _customLine ? _customLine.data
    : period === 'month' ? monthlyLineData : weeklyData;
  const lineTitle  = _customLine ? _customLine.title
    : period === 'month' ? 'Comparativo mensual'
    : period === 'week'  ? 'Comparativo semanal'
    : 'Últimos 7 días';
  const lineLabels = _customLine ? _customLine.labels
    : period === 'month' ? { actual: 'Este mes',    pasada: 'Mes pasado'  }
    :                      { actual: 'Esta semana', pasada: 'Sem. pasada' };

  // Top 5 title — dynamic by channel + period
  const top5Title = 'Top productos';

  // Ocupacion card title
  const ocupTitle = channel === 'mostrador' ? 'Órdenes del día'
    : (period === 'today' || period === 'custom') ? 'Ocupación actual'
    : 'Ocupación promedio';

  // Branch display name
  const branchName = BRANCHES.find(b => b.value === branch)?.label ?? 'Sucursal Principal';

  const dateInputStyle: React.CSSProperties = {
    border: `1px solid ${C.border}`, borderRadius: 8,
    padding: '6px 10px', fontSize: 13, fontFamily: FONT,
    color: C.black100, backgroundColor: C.white,
    outline: 'none', cursor: 'pointer',
  };

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      backgroundColor: 'transparent',
      padding: '24px 24px 0 24px',
      fontFamily: FONT,
      scrollbarWidth: 'none' as const,
    }}>
      <div style={{ width: '100%' }}>

        {/* ═══════════════════════════════════════
            HEADER
            ═══════════════════════════════════════ */}
        <div style={{ marginBottom: 24 }}>

          {/* Row 1: Title only */}
          <h1 style={{
            fontSize: 20, fontWeight: 700, color: C.blue100,
            fontFamily: FONT, margin: '0 0 14px', lineHeight: '28px',
          }}>
            Restaurante Demo
          </h1>

          {/* Row 2: [Channel dropdown + Branch dropdown] ← → [Period tabs] */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          }}>

            {/* Left group: channel + branch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

              {/* ── Channel dropdown ── */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setChannelOpen(o => !o)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    minWidth: 120, padding: '8px 12px',
                    backgroundColor: C.white,
                    border: `1px solid ${channelOpen ? C.blue100 : C.border}`,
                    borderRadius: 8, cursor: 'pointer',
                    fontSize: 14, fontWeight: 500, color: C.black100,
                    fontFamily: FONT, transition: 'border-color 0.15s ease', outline: 'none',
                  }}
                  onMouseEnter={e => { if (!channelOpen) (e.currentTarget as HTMLButtonElement).style.borderColor = C.blue100; }}
                  onMouseLeave={e => { if (!channelOpen) (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
                >
                  <span style={{ flex: 1, textAlign: 'left' }}>
                    {channel === 'mesas' ? 'Mesas' : channel === 'mostrador' ? 'Mostrador' : 'Todo'}
                  </span>
                  <ChevronDown
                    size={14} color={C.black60}
                    style={{ transition: 'transform 0.15s ease', transform: channelOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
                  />
                </button>
                {channelOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setChannelOpen(false)} />
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 101,
                      backgroundColor: C.white, borderRadius: 8, padding: '4px 0',
                      boxShadow: '0px 4px 12px rgba(0,0,0,0.10)', minWidth: 140,
                    }}>
                      {([
                        { value: 'mesas',     label: 'Mesas'     },
                        { value: 'mostrador', label: 'Mostrador' },
                        { value: 'all',       label: 'Todo'      },
                      ] as const).map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => { setChannel(opt.value); setChannelOpen(false); }}
                          style={{
                            padding: '10px 16px', cursor: 'pointer',
                            fontSize: 14, fontFamily: FONT,
                            fontWeight: channel === opt.value ? 500 : 400, color: C.black100,
                            backgroundColor: channel === opt.value ? '#f1f2f6' : 'transparent',
                            transition: 'background-color 0.1s ease',
                          }}
                          onMouseEnter={e => { if (channel !== opt.value) (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f7f8fb'; }}
                          onMouseLeave={e => { if (channel !== opt.value) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* ── Branch dropdown ── */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setBranchOpen(o => !o)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    minWidth: 120, padding: '8px 12px',
                    backgroundColor: C.white,
                    border: `1px solid ${branchOpen ? C.blue100 : C.border}`,
                    borderRadius: 8, cursor: 'pointer',
                    fontSize: 14, fontWeight: 500, color: C.black100,
                    fontFamily: FONT, transition: 'border-color 0.15s ease', outline: 'none',
                  }}
                  onMouseEnter={e => { if (!branchOpen) (e.currentTarget as HTMLButtonElement).style.borderColor = C.blue100; }}
                  onMouseLeave={e => { if (!branchOpen) (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
                >
                  <MapPin size={14} color={C.black60} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{branchName}</span>
                  <ChevronDown
                    size={14} color={C.black60}
                    style={{ transition: 'transform 0.15s ease', transform: branchOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
                  />
                </button>
                {branchOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setBranchOpen(false)} />
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 101,
                      backgroundColor: C.white, borderRadius: 8, padding: '4px 0',
                      boxShadow: '0px 4px 12px rgba(0,0,0,0.10)', minWidth: 200,
                    }}>
                      {BRANCHES.map(b => (
                        <div
                          key={b.value}
                          onClick={() => { setBranch(b.value); setBranchOpen(false); }}
                          style={{
                            padding: '10px 16px', cursor: 'pointer',
                            fontSize: 14, fontFamily: FONT,
                            fontWeight: branch === b.value ? 500 : 400, color: C.black100,
                            backgroundColor: branch === b.value ? '#f1f2f6' : 'transparent',
                            transition: 'background-color 0.1s ease',
                          }}
                          onMouseEnter={e => { if (branch !== b.value) (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f7f8fb'; }}
                          onMouseLeave={e => { if (branch !== b.value) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
                        >
                          {b.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Recargar + period tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Recargar button */}
            <button
              onClick={() => setRefreshCount(c => c + 1)}
              title={`Refrescado ${refreshCount} veces`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                border: '1.5px solid #121E6C', background: '#fff',
                fontSize: 13, fontWeight: 600, color: '#121E6C',
                fontFamily: FONT, cursor: 'pointer', transition: 'background 150ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F1F2F6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
            >
              <RefreshCw size={14} color="#121E6C" /> Recargar
            </button>

            {/* Period tabs */}
            <div style={{
              display: 'flex', gap: 2,
              backgroundColor: C.border, borderRadius: 10, padding: 3,
            }}>
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: 'none', cursor: 'pointer',
                    fontSize: 13, fontFamily: FONT,
                    fontWeight: period === p.value ? 600 : 400,
                    backgroundColor: period === p.value ? C.white : 'transparent',
                    color: period === p.value ? C.blue100 : C.black60,
                    boxShadow: period === p.value ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            </div>{/* end right group */}
          </div>

          {/* Row 3: Custom date inputs — right-aligned */}
          {period === 'custom' && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center',
              flexWrap: 'wrap', marginTop: 10, justifyContent: 'flex-end',
            }}>
              <span style={{ fontSize: 13, color: C.black60, fontFamily: FONT }}>Desde</span>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={dateInputStyle} />
              <span style={{ fontSize: 13, color: C.black60, fontFamily: FONT }}>Hasta</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} style={dateInputStyle} />
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════
            FILA 1 · KPIs
            ═══════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <KpiCard
            icon={TrendingUp}
            value={formatCOP(kpi.ventas)}
            label={kpi.ventasLabel}
            badge={kpi.vBadge}
            badgeColor={kpi.vBadgeColor}
            note="No incluye propinas"
          />
          <KpiCard
            icon={Receipt}
            value={formatCOP(kpi.ticket)}
            label="Ticket promedio"
            badge={kpi.tBadge}
            badgeColor={kpi.tBadgeColor}
            note="No incluye propinas"
          />
          <KpiCard
            icon={countIcon}
            value={String(kpi.count)}
            label={kpi.countLabel}
            badge={kpi.mBadge}
            badgeColor={kpi.mBadgeColor}
          />
          {channel !== 'all' && (
            <KpiCard
              icon={Clock}
              value={kpi.tiempo}
              label={kpi.tiempoLabel}
              badge={kpi.tiempoBadge}
              badgeColor={kpi.tiempoBadgeColor}
            />
          )}
        </div>

        {/* ═══════════════════════════════════════
            FILA 2 · Ocupación + Top 5 productos
            ═══════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'stretch' }}>

          {/* Ocupación / Órdenes card — content driven by global channel tab */}
          <Card style={{ flex: 1, minWidth: 300 }}>
            {/* Header: dynamic title + dynamic badge */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 16,
            }}>
              <SectionTitle mb={0} subtitle={dateLabel}>
                {ocupTitle}
              </SectionTitle>
              {channel === 'mostrador' ? (
                <span style={{
                  fontSize: 12, fontWeight: 700, fontFamily: FONT,
                  backgroundColor: '#FEF9C3', color: '#854F0B',
                  borderRadius: 20, padding: '3px 10px',
                }}>
                  8 activas
                </span>
              ) : (
                <span style={{
                  fontSize: 12, fontWeight: 700, fontFamily: FONT,
                  backgroundColor: C.blue100, color: '#fff',
                  borderRadius: 20, padding: '3px 10px',
                }}>
                  34%
                </span>
              )}
            </div>

            {/* channel === 'all': two sections stacked */}
            {channel === 'all' && (
              <>
                {/* MESAS section */}
                <p style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.5px', color: C.black60, fontFamily: FONT,
                  margin: '0 0 10px',
                }}>
                  Mesas
                </p>
                <ZoneBar label="Salón"   filled={16} total={35} pct={45} />
                <ZoneBar label="Terraza" filled={3}  total={8}  pct={37} />
                <ZoneBar label="Barra"   filled={1}  total={2}  pct={50} />
                <p style={{ fontSize: 13, color: C.black60, fontFamily: FONT, margin: '0 0 12px' }}>
                  20 ocupadas · 24 activas · 1 inhabilitada
                </p>

                <div style={{ borderTop: `1px solid ${C.border}`, margin: '0 0 12px' }} />

                {/* MOSTRADOR section */}
                <p style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.5px', color: C.black60, fontFamily: FONT,
                  margin: '0 0 10px',
                }}>
                  Mostrador
                </p>
                {[
                  { label: 'Borrador',             count: 2, dot: '#969696' },
                  { label: 'En preparación',       count: 4, dot: '#EAB308' },
                  { label: 'Listas para entregar', count: 2, dot: '#10B981' },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: row.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: C.black100, fontFamily: FONT }}>{row.label}</span>
                    </div>
                    <span style={{ fontSize: 14, color: C.black100, fontFamily: FONT, fontWeight: 500 }}>{row.count}</span>
                  </div>
                ))}
                <div style={{
                  paddingTop: 12, borderTop: `1px solid ${C.border}`,
                  fontSize: 13, color: C.black60, fontFamily: FONT,
                }}>
                  Ticket promedio: $52,000 · Tiempo prom: 12 min
                </div>
              </>
            )}

            {/* channel === 'mesas': zone bars only */}
            {channel === 'mesas' && (
              <>
                <ZoneBar label="Salón"   filled={16} total={35} pct={45} />
                <ZoneBar label="Terraza" filled={3}  total={8}  pct={37} />
                <ZoneBar label="Barra"   filled={1}  total={2}  pct={50} />
                <div style={{
                  marginTop: 4, paddingTop: 12,
                  borderTop: `1px solid ${C.border}`,
                  fontSize: 13, color: C.black60, fontFamily: FONT,
                }}>
                  20 ocupadas · 24 activas · 1 inhabilitada
                </div>
              </>
            )}

            {/* channel === 'mostrador': orders breakdown */}
            {channel === 'mostrador' && (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: 10,
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.5px', color: C.black60, fontFamily: FONT,
                  }}>
                    Activas
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: C.black100, fontFamily: FONT }}>
                    8
                  </span>
                </div>
                {[
                  { label: 'Borrador',             count: 2, dot: '#969696' },
                  { label: 'En preparación',       count: 4, dot: '#EAB308' },
                  { label: 'Listas para entregar', count: 2, dot: '#10B981' },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: row.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: C.black100, fontFamily: FONT }}>{row.label}</span>
                    </div>
                    <span style={{ fontSize: 14, color: C.black100, fontFamily: FONT, fontWeight: 500 }}>{row.count}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${C.border}`, margin: '4px 0 12px' }} />
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: 4,
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.5px', color: C.black60, fontFamily: FONT,
                  }}>
                    Completadas hoy
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: C.black100, fontFamily: FONT }}>
                    37
                  </span>
                </div>
                <div style={{
                  marginTop: 8, paddingTop: 12,
                  borderTop: `1px solid ${C.border}`,
                  fontSize: 13, color: C.black60, fontFamily: FONT,
                }}>
                  Ticket promedio: $52,000 · Tiempo prom: 12 min
                </div>
              </>
            )}
          </Card>

          {/* Top 5 productos */}
          <Card style={{ flex: 1, minWidth: 300 }}>
            <SectionTitle subtitle={dateLabel}>{top5Title}</SectionTitle>

            {/* channel !== 'all': single list */}
            {channel !== 'all' && <ProductList items={products} />}

            {/* channel === 'all': split into Mesas + Mostrador sections */}
            {channel === 'all' && (
              <>
                {/* MESAS sub-section */}
                <p style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.5px', color: C.black60, fontFamily: FONT,
                  margin: '0 0 10px',
                }}>
                  Mesas
                </p>
                <ProductList items={TOP_PRODUCTS_SPLIT.mesas} />

                <div style={{ borderTop: `1px solid ${C.border}`, margin: '16px 0' }} />

                {/* MOSTRADOR sub-section */}
                <p style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.5px', color: C.black60, fontFamily: FONT,
                  margin: '0 0 10px',
                }}>
                  Mostrador
                </p>
                <ProductList items={TOP_PRODUCTS_SPLIT.mostrador} />
              </>
            )}
          </Card>
        </div>

        {/* ═══════════════════════════════════════
            FILA 3 · Gráficas
            ═══════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>

          {/* Ventas (hora / día / semana depending on period) — 60% */}
          <Card style={{ flex: 3, minWidth: 300 }}>
            <SectionTitle subtitle={dateLabel}>{barTitle}</SectionTitle>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={barData}
                margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis
                  dataKey="x"
                  interval="preserveStartEnd"
                  tickFormatter={(v: string) =>
                    barData.length > 12 && v.startsWith('Sem ')
                      ? 'S' + v.slice(4)
                      : v
                  }
                  tick={{ fontSize: 12, fill: C.black60, fontFamily: FONT }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tickFormatter={v =>
                    v >= 1000000
                      ? `$${(v / 1000000).toFixed(1)}M`
                      : `$${(v / 1000).toFixed(0)}k`
                  }
                  tick={{ fontSize: 11, fill: C.black60, fontFamily: FONT }}
                  axisLine={false} tickLine={false} width={52}
                />
                <Tooltip content={<HourlyTooltip />} cursor={{ fill: C.border }} />
                <Bar dataKey="ventas" fill={C.blue100} radius={[4, 4, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Comparativo — 40% */}
          <Card style={{ flex: 2, minWidth: 260 }}>
            <SectionTitle subtitle={dateLabel}>{lineTitle}</SectionTitle>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart
                data={lineData}
                margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: C.black60, fontFamily: FONT }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 11, fill: C.black60, fontFamily: FONT }}
                  axisLine={false} tickLine={false} width={44}
                />
                <Tooltip content={<WeeklyTooltip labels={lineLabels} />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, fontFamily: FONT, paddingTop: 4 }}
                  formatter={v => lineLabels[v as keyof typeof lineLabels] ?? v}
                />
                <Line
                  type="monotone" dataKey="actual"
                  stroke={C.brandRed} strokeWidth={2}
                  dot={{ r: 3, fill: C.brandRed }}
                  connectNulls={false} name="actual"
                />
                <Line
                  type="monotone" dataKey="pasada"
                  stroke={C.blue60} strokeWidth={2}
                  dot={{ r: 3, fill: C.blue60 }}
                  strokeDasharray="4 3" name="pasada"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

      </div>
    </div>
  );
}
