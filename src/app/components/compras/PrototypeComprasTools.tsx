/**
 * PrototypeComprasTools — los switches casi invisibles del prototipo (specs/2026-10-facturas-compra.md §9):
 * "Usar impuestos y retenciones", "DS" y "Step mode". Son herramientas de demo, no producto; están
 * compartidos y persisten en el store. Cada pantalla muestra solo los que le aplican.
 */
import React from 'react';
import { useFacturasCompra, type ComprasSettings } from '../../store/facturasCompraStore';
import { Toggle } from '../items/Toggle';

const LABELS: Record<keyof ComprasSettings, string> = {
  usarImpuestos: 'Usar impuestos y retenciones',
  usarDS: 'DS',
  stepMode: 'Step mode',
};

export function PrototypeComprasTools({ show }: { show: (keyof ComprasSettings)[] }) {
  const { settings, setSetting } = useFacturasCompra();
  return (
    <div
      className="opacity-[0.18] hover:opacity-90 focus-within:opacity-90 transition-opacity"
      style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 10, flexWrap: 'wrap' }}
      aria-label="Herramientas del prototipo"
    >
      {show.map(key => (
        <label key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <Toggle size="sm" checked={settings[key]} onChange={v => setSetting(key, v)} ariaLabel={LABELS[key]} />
          <span style={{ fontSize: 10, color: 'var(--black-60)', fontFamily: "'Montserrat', sans-serif" }}>{LABELS[key]}</span>
        </label>
      ))}
    </div>
  );
}
