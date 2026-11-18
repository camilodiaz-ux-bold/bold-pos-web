/**
 * PrototypeComprasTools — los switches del prototipo (specs/2026-10-facturas-compra.md §9):
 * "Usar impuestos y retenciones", "DS" y "Step mode". Son herramientas de demo, no producto; están
 * compartidos y persisten en el store. Cada pantalla muestra solo los que le aplican. Van en la barra fija de abajo (PrototypeToolsBar).
 */
import React from 'react';
import { useFacturasCompra, type ComprasSettings } from '../../store/facturasCompraStore';
import { Toggle } from '../items/Toggle';
import { PrototypeToolsBar } from '../PrototypeToolsBar';

const LABELS: Record<keyof ComprasSettings, string> = {
  usarImpuestos: 'Usar impuestos y retenciones',
  usarDS: 'DS',
  stepMode: 'Step mode',
};

export function PrototypeComprasTools({ show }: { show: (keyof ComprasSettings)[] }) {
  const { settings, setSetting } = useFacturasCompra();
  return (
    <PrototypeToolsBar>
      {show.map(key => (
        <label key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <Toggle size="sm" checked={settings[key]} onChange={v => setSetting(key, v)} ariaLabel={LABELS[key]} />
          <span style={{ fontSize: 12, color: 'var(--black-60)', fontFamily: "'Montserrat', sans-serif" }}>{LABELS[key]}</span>
        </label>
      ))}
    </PrototypeToolsBar>
  );
}
