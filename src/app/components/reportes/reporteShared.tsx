/**
 * reporteShared.tsx — piezas de pantalla compartidas por los reportes de ítems
 * (Ventas por ítems y Ganancias por ítems).
 */
import React from 'react';
import { toast } from 'sonner';
import { isoDia } from '../../utils/ventas';
import { fmtReporte } from '../../utils/ventasPorItems';

export const MFONT = "'Montserrat', sans-serif";
export const TIPO_OPTIONS = ['Todos', 'Ítems', 'Combos'];
export const PAGE_SIZES = [10, 25, 50];

export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function primerDiaDelMes(): string {
  const d = new Date();
  return isoDia(new Date(d.getFullYear(), d.getMonth(), 1).getTime());
}

export const inputStyle: React.CSSProperties = {
  width: '100%', height: 36, padding: '0 12px', boxSizing: 'border-box',
  border: '1px solid var(--blue-20)', borderRadius: 8, backgroundColor: '#fff',
  fontFamily: MFONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', outline: 'none',
};

/** Select a todo el ancho de la celda de la grilla. */
export function Field({ children }: { children: React.ReactNode }) {
  return <div className="[&>div]:w-full [&_select]:w-full">{children}</div>;
}

export function PillButton({ label, bg, icon }: { label: string; bg: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={() => toast.info('Próximamente')}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 24px',
        borderRadius: 18, border: 'none', backgroundColor: bg, color: '#fff',
        fontFamily: MFONT, fontSize: 12, fontWeight: 700, cursor: 'pointer',
      }}
      className="hover:opacity-90 transition-opacity"
    >
      {label}{icon}
    </button>
  );
}

export function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 12, padding: '10px 16px', minWidth: 300, textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <p style={{ fontFamily: MFONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', margin: 0 }}>{label}</p>
      <p style={{ fontFamily: MFONT, fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>{fmtReporte(value)}</p>
    </div>
  );
}
