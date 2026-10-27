/**
 * ReportesRetailPanel — pantalla /reportes de Retail: 3 tarjetas (Ventas, Documentos Electrónicos y
 * Administrativos) con los 20 reportes del POS real (specs/2026-10-reportes-retail.md §3).
 */
import React from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';
import { GRUPOS_REPORTES_RETAIL, type GrupoReportes } from './reportesRetail';

const FONT = "'Montserrat', sans-serif";

function GrupoCard({ grupo }: { grupo: GrupoReportes }) {
  const navigate = useNavigate();
  return (
    <section style={{ backgroundColor: 'var(--black-0)', borderRadius: 16, padding: '20px 20px 8px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, lineHeight: '24px', color: 'var(--black-100)', margin: 0 }}>{grupo.titulo}</h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {grupo.reportes.map((r, i) => (
          <button
            key={r.id} type="button"
            onClick={() => (r.ruta ? navigate(r.ruta) : toast.info(`${r.label}: próximamente`))}
            className="hover:bg-[var(--blue-10)] transition-colors"
            style={{
              display: 'flex', alignItems: 'center', gap: 12, height: 52, width: '100%', textAlign: 'left', cursor: 'pointer',
              background: 'transparent', border: 'none', borderBottom: i === grupo.reportes.length - 1 ? 'none' : '1px solid var(--black-10)',
            }}
          >
            <span style={{ flex: 1, fontFamily: FONT, fontWeight: 500, fontSize: 14, color: 'var(--black-100)' }}>{r.label}</span>
            <ChevronRight size={18} color="var(--blue-50)" strokeWidth={1.8} />
          </button>
        ))}
      </div>
    </section>
  );
}

export function ReportesRetailPanel() {
  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0 }}>Reportes</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
        {GRUPOS_REPORTES_RETAIL.map(g => <GrupoCard key={g.titulo} grupo={g} />)}
      </div>
    </div>
  );
}
