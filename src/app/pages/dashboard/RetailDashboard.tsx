/**
 * RetailDashboard — Inicio (/inicio) de la vertical Retail.
 * ─────────────────────────────────────────────────────────────────────────────
 * Réplica del dashboard del POS Retail real ("Dashboard - Movimientos de Semana"):
 * Utilidad bruta, Flujo de caja, Cuentas por cobrar, Ítems más vendidos y Mejores clientes.
 * La versión de Restaurantes vive en pages/Dashboard.tsx y no se toca.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { RefreshCw, ChevronDown, FileText, Filter, Coins, HandCoins, ShoppingCart, Banknote, Scale, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { PrototypeVerticalSwitcher } from '../../vertical';
import {
  PERIOD_FACTOR, RETAIL_PERIODS, RETAIL_STAT_SECTIONS, RETAIL_TOP_ITEMS, RETAIL_TOP_CLIENTS,
  type RetailPeriod, type RetailStat, type RetailBarDatum,
} from '../../data/retail/dashboardRetailMocks';

const FONT = "'Montserrat', sans-serif";

const STAT_ICONS: Record<RetailStat['icon'], React.ElementType> = {
  comprobantes: FileText,
  costos:       Filter,
  utilidad:     Coins,
  ingresos:     HandCoins,
  gastos:       ShoppingCart,
  flujo:        Banknote,
  saldos:       Scale,
  cobrado:      Banknote,
  cxc:          Wallet,
};

/** "$ 1,815,700" */
function money(n: number): string {
  return `$ ${Math.round(n).toLocaleString('en-US')}`;
}

/** Ejes "bonitos" (pasos 1/2/5 × 10^k, con un paso de holgura sobre el máximo): 540k → 0…600k, 1.5M → 0…2M. */
function niceAxis(max: number): { top: number; ticks: number[] } {
  if (max <= 0) return { top: 1, ticks: [0, 1] };
  const raw = max / 3;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = ([1, 2, 5, 10].find(m => m * pow >= raw) ?? 10) * pow;
  const top = (Math.floor(max / step) + 1) * step;
  return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) };
}

// ─── Piezas ───────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      margin: '0 0 12px', fontFamily: FONT, fontSize: 18, fontWeight: 700,
      color: 'var(--blue-100)', textTransform: 'uppercase', lineHeight: '24px',
    }}>
      {children}
    </h2>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: 12,
  boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
};

function StatCard({ stat, factor }: { stat: RetailStat; factor: number }) {
  const Icon = STAT_ICONS[stat.icon];
  const valueColor =
    stat.tone === 'success' ? 'var(--feedback-success-100)' :
    stat.tone === 'danger'  ? 'var(--coral-100)' : 'var(--black-100)';
  return (
    <div style={{ ...cardStyle, padding: '16px 16px 0', display: 'flex', flexDirection: 'column', minHeight: 127 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <Icon size={44} color="var(--black-40)" strokeWidth={1.2} style={{ flexShrink: 0, opacity: 0.6 }} />
        <div style={{ textAlign: 'right', minWidth: 0 }}>
          <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: 'var(--black-100)', lineHeight: '20px' }}>{stat.label}</div>
          <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: valueColor, lineHeight: '32px' }}>
            {money(stat.value * factor)}
          </div>
        </div>
      </div>
      {stat.caption && (
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--black-10)', padding: '14px 0', fontFamily: FONT, fontSize: 14, color: 'var(--black-100)' }}>
          {stat.caption}
        </div>
      )}
    </div>
  );
}

function ToggleGroup<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" style={{ display: 'inline-flex', border: '1px solid var(--blue-100)', borderRadius: 20, overflow: 'hidden' }}>
      {options.map(o => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            style={{
              padding: '6px 14px', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 600,
              backgroundColor: active ? 'var(--blue-100)' : '#fff',
              color: active ? '#fff' : 'var(--black-100)',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

type Metric = 'valor' | 'cantidad';

function BarCard({ title, toggle, data, factor, height }: {
  title: string;
  toggle: { id: Metric; label: string }[];
  data: RetailBarDatum[];
  factor: number;
  height: number;
}) {
  const [metric, setMetric] = useState<Metric>('valor');
  const chartData = data.map(d => ({ name: d.name, value: Math.round(d[metric] * factor) }));
  const axis = niceAxis(Math.max(...chartData.map(d => d.value)));
  return (
    <div style={{ ...cardStyle, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: 'var(--blue-100)' }}>{title}</span>
        <ToggleGroup options={toggle} value={metric} onChange={setMetric} />
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontFamily: FONT, fill: 'var(--black-60)' }} />
            <YAxis
              axisLine={false} tickLine={false} width={64}
              domain={[0, axis.top]} ticks={axis.ticks}
              tick={{ fontSize: 11, fontFamily: FONT, fill: 'var(--black-60)' }}
              tickFormatter={(v: number) => v.toLocaleString('en-US')}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              formatter={(v: number) => [metric === 'valor' ? money(v) : v.toLocaleString('en-US'), metric === 'valor' ? 'Valor' : 'Cantidad']}
              contentStyle={{ fontFamily: FONT, fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="value" fill="var(--blue-100)" radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function RetailDashboard() {
  const [period, setPeriod] = useState<RetailPeriod>('Semana');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const factor = PERIOD_FACTOR[period];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); toast.success('Dashboard actualizado'); }, 600);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 32px', fontFamily: FONT, scrollbarWidth: 'none' }}>

      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 20, fontWeight: 700, color: 'var(--blue-100)', lineHeight: '28px' }}>
            Dashboard - Movimientos de
          </h1>
          <button
            onClick={() => setPeriodOpen(o => !o)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 24px', border: 'none', cursor: 'pointer',
              borderRadius: 6, backgroundColor: 'var(--blue-100)', color: '#fff', fontFamily: FONT, fontSize: 12, fontWeight: 600,
            }}
          >
            {period}
            <ChevronDown size={12} />
          </button>
          {periodOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setPeriodOpen(false)} />
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 101, backgroundColor: '#fff', borderRadius: 8, padding: '4px 0', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', minWidth: 120 }}>
                {RETAIL_PERIODS.map(p => (
                  <div
                    key={p}
                    onClick={() => { setPeriod(p); setPeriodOpen(false); }}
                    style={{ padding: '10px 16px', cursor: 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: p === period ? 600 : 400, backgroundColor: p === period ? 'var(--blue-10)' : 'transparent' }}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <PrototypeVerticalSwitcher />
          <button
            onClick={handleRefresh}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', border: 'none', cursor: 'pointer',
              borderRadius: 20, backgroundColor: 'var(--black-10)', color: 'var(--black-100)', fontFamily: FONT, fontSize: 12, fontWeight: 600,
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : undefined} />
            Refrescar
          </button>
        </div>
      </div>

      {/* ── Cuerpo: stats (izq) | gráficos (der) ── */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {RETAIL_STAT_SECTIONS.map(section => (
            <section key={section.title}>
              <SectionTitle>{section.title}</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
                {section.stats.map(stat => <StatCard key={stat.label} stat={stat} factor={factor} />)}
              </div>
            </section>
          ))}
        </div>

        <div style={{ flex: '1 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section>
            <SectionTitle>Ítems</SectionTitle>
            <BarCard
              title="Ítems Más Vendidos Por"
              toggle={[{ id: 'valor', label: 'Valor' }, { id: 'cantidad', label: 'Cant.' }]}
              data={RETAIL_TOP_ITEMS} factor={factor} height={240}
            />
          </section>
          <section>
            <SectionTitle>Clientes</SectionTitle>
            <BarCard
              title="Mejores Clientes Por"
              toggle={[{ id: 'valor', label: 'Valor' }, { id: 'cantidad', label: 'Compras' }]}
              data={RETAIL_TOP_CLIENTS} factor={factor} height={240}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
