import React, { useMemo } from 'react';
import svgPaths from '../imports/svg-uu1cgrdgob';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusType = 'ok' | 'warn' | 'error' | 'maint';

interface Service {
  name: string;
  status: StatusType;
}

interface Section {
  title: string;
  services: Service[];
}

// ─── Status config (Merlin tokens) ───────────────────────────────────────────

const STATUS_CONFIG = {
  ok: {
    label: 'Operativo',
    bg: 'var(--feedback-success-10)',
    border: 'var(--feedback-success-150)',
    text: 'var(--feedback-success-150)',
    dot: 'var(--feedback-success-150)',
  },
  warn: {
    label: 'Intermitente',
    bg: 'var(--feedback-warning-10)',
    border: 'var(--feedback-warning-100)',
    text: 'var(--feedback-warning-150)',
    dot: 'var(--feedback-warning-100)',
  },
  error: {
    label: 'Incidente',
    bg: 'var(--feedback-error-10)',
    border: 'var(--feedback-error-150)',
    text: 'var(--feedback-error-150)',
    dot: 'var(--feedback-error-150)',
  },
  maint: {
    label: 'Mantenimiento',
    bg: 'var(--feedback-informative-10)',
    border: 'var(--feedback-informative-100)',
    text: 'var(--feedback-informative-150)',
    dot: 'var(--feedback-informative-100)',
  },
} as const;

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    title: 'Venta Presente — Datáfonos',
    services: [
      { name: 'Procesamiento de tarjetas físico', status: 'ok' },
      { name: 'Pagos con QR Breb físico', status: 'ok' },
      { name: 'Terminales de Pago Bold', status: 'ok' },
      { name: 'App Bold iOS/Android', status: 'ok' },
      { name: 'Proveedor sim Claro', status: 'ok' },
      { name: 'Proveedor sim Movistar', status: 'warn' },
    ],
  },
  {
    title: 'Venta No Presente — Online',
    services: [
      { name: 'Link de Pago', status: 'ok' },
      { name: 'Botón de Pagos', status: 'ok' },
      { name: 'API Online', status: 'ok' },
      { name: 'Servicio de API Integrations', status: 'ok' },
    ],
  },
  {
    title: 'Métodos de Pago — Pasarela',
    services: [
      { name: 'Tarjetas crédito/débito', status: 'ok' },
      { name: 'Pagos con PSE', status: 'warn' },
      { name: 'Pagos con Botón Bancolombia', status: 'ok' },
      { name: 'Pagos con Nequi push', status: 'ok' },
      { name: 'Pagos con QR Breb online', status: 'ok' },
    ],
  },
  {
    title: 'Soporte y Reportes',
    services: [
      { name: 'Reportes Diarios', status: 'ok' },
      { name: 'Reportes Mensuales', status: 'maint' },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function BoldLogo({ width = 71, height = 31 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 71.0066 31" fill="none">
      <defs>
        <linearGradient id="boldGradStatus" x1="71.0066" x2="-1.77164e-06" y1="15.5" y2="15.5" gradientUnits="userSpaceOnUse">
          <stop offset="0.045" stopColor="#EE424E" />
          <stop offset="0.8"   stopColor="#121E6C" />
        </linearGradient>
      </defs>
      <path d={svgPaths.p26322370} fill="url(#boldGradStatus)" />
    </svg>
  );
}

function StatusBadge({ status }: { status: StatusType }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 700,
      fontFamily: "'Montserrat', sans-serif",
      backgroundColor: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.text,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

// ─── StatusPage ───────────────────────────────────────────────────────────────

export function StatusPage() {
  const counts = useMemo(() => {
    const all = SECTIONS.flatMap(s => s.services);
    return {
      ok:    all.filter(s => s.status === 'ok').length,
      warn:  all.filter(s => s.status === 'warn').length,
      error: all.filter(s => s.status === 'error').length,
      maint: all.filter(s => s.status === 'maint').length,
    };
  }, []);

  const allOk = counts.warn === 0 && counts.error === 0 && counts.maint === 0;

  const bannerBg     = counts.error > 0 ? 'var(--feedback-error-10)'
    : counts.warn > 0 ? 'var(--feedback-warning-10)'
    : 'var(--feedback-success-10)';
  const bannerBorder = counts.error > 0 ? 'var(--feedback-error-100)'
    : counts.warn > 0 ? 'var(--feedback-warning-100)'
    : 'var(--feedback-success-100)';
  const bannerDot    = counts.error > 0 ? 'var(--feedback-error-150)'
    : counts.warn > 0 ? 'var(--feedback-warning-100)'
    : 'var(--feedback-success-150)';
  const bannerTitle  = counts.error > 0 ? 'var(--feedback-error-200)'
    : counts.warn > 0 ? 'var(--feedback-warning-200)'
    : 'var(--feedback-success-200)';
  const bannerSub    = counts.error > 0 ? 'var(--feedback-error-150)'
    : counts.warn > 0 ? 'var(--feedback-warning-150)'
    : 'var(--feedback-success-150)';

  const summaryText = [
    `${counts.ok} operativo${counts.ok !== 1 ? 's' : ''}`,
    counts.warn  > 0 ? `${counts.warn} intermitente${counts.warn > 1 ? 's' : ''}`   : null,
    counts.error > 0 ? `${counts.error} con incidente${counts.error > 1 ? 's' : ''}` : null,
    counts.maint > 0 ? `${counts.maint} en mantenimiento`                             : null,
  ].filter(Boolean).join(' · ');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background-page)',
      fontFamily: "'Montserrat', sans-serif",
    }}>
      {/* ── Header ── */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--black-10)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 24px' }}>
          <BoldLogo width={71} height={31} />
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--black-100)', lineHeight: 1.2 }}>
            Estado de servicios Bold
          </h1>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--black-40)', marginTop: 4 }}>
            Actualizado en tiempo real
          </p>
        </div>

        {/* Summary banner */}
        <div style={{
          backgroundColor: bannerBg,
          border: `1px solid ${bannerBorder}`,
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: bannerDot,
            flexShrink: 0,
          }} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: bannerTitle }}>
              {allOk
                ? 'Todos los servicios operan con normalidad'
                : 'Algunos servicios presentan novedades'}
            </p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: bannerSub, marginTop: 2 }}>
              {summaryText}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
          {(Object.entries(STATUS_CONFIG) as [StatusType, (typeof STATUS_CONFIG)[StatusType]][]).map(([key, cfg]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: cfg.dot,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--black-60)' }}>
                {cfg.label}
              </span>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {SECTIONS.map(section => (
            <div key={section.title}>
              <h2 style={{
                margin: '0 0 10px 0',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--black-40)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}>
                {section.title}
              </h2>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                boxShadow: '0px 4px 12px 0px rgba(18,30,108,0.08)',
                overflow: 'hidden',
              }}>
                {section.services.map((service, idx) => (
                  <div
                    key={service.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      borderBottom: idx < section.services.length - 1
                        ? '1px solid var(--black-10)'
                        : 'none',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--black-100)' }}>
                      {service.name}
                    </span>
                    <StatusBadge status={service.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
