/**
 * DisponibilidadCard — card "Disponibilidad" del formulario de ítem:
 * toggle de existencias + checkboxes de sucursal + input de existencia por
 * sucursal marcada (solo si el toggle está ON) + total.
 */
import React from 'react';
import type { SucursalId } from '../../types/item';
import { SUCURSALES } from '../../data/itemsCatalogs';
import { Toggle } from './Toggle';
import { FieldLabel } from './FormField';

interface DisponibilidadCardProps {
  manejaExistencias: boolean;
  onToggleManeja: (next: boolean) => void;
  sucursalIds: SucursalId[];
  onToggleSucursal: (id: SucursalId) => void;
  existencias: Partial<Record<SucursalId, string>>;
  onChangeExistencia: (id: SucursalId, raw: string) => void;
  unidadLabel: string;
  sucursalesError?: string;
}

export function DisponibilidadCard({
  manejaExistencias,
  onToggleManeja,
  sucursalIds,
  onToggleSucursal,
  existencias,
  onChangeExistencia,
  unidadLabel,
  sucursalesError,
}: DisponibilidadCardProps) {
  const total = manejaExistencias
    ? sucursalIds.reduce((acc, id) => acc + (parseInt(existencias[id] ?? '0', 10) || 0), 0)
    : 0;

  return (
    <div style={{ backgroundColor: 'var(--black-0)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Disponibilidad</h3>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Toggle checked={manejaExistencias} onChange={onToggleManeja} ariaLabel="Ítem con existencias" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--black-100)' }}>
            Ítem con existencias ({unidadLabel})
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--black-40)', margin: '6px 0 0' }}>
          Al activar, puedes agregar la disponibilidad del item por sucursal.
        </p>
      </div>

      <div style={{ borderTop: '1px solid var(--black-10)', paddingTop: 16 }}>
        <FieldLabel required>Sucursales con disponibilidad</FieldLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {SUCURSALES.map(s => {
            const checked = sucursalIds.includes(s.id);
            return (
              <div key={s.id}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--black-100)' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleSucursal(s.id)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--blue-100)' }}
                  />
                  {s.label}
                </label>
                {manejaExistencias && checked && (
                  <div style={{ marginTop: 8, marginLeft: 24 }}>
                    <FieldLabel required>Existencias ({unidadLabel})</FieldLabel>
                    <input
                      type="number"
                      value={existencias[s.id] ?? ''}
                      onChange={e => onChangeExistencia(s.id, e.target.value)}
                      className="merlin-input-filled"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {sucursalesError && (
          <p style={{ fontSize: 12, color: 'var(--coral-100)', margin: '8px 0 0' }}>{sucursalesError}</p>
        )}
      </div>

      {manejaExistencias && (
        <div style={{ borderTop: '1px solid var(--black-10)', paddingTop: 16, fontSize: 14, fontWeight: 700, color: 'var(--black-100)' }}>
          Total: {total.toLocaleString('es-CO')} ({unidadLabel})
        </div>
      )}
    </div>
  );
}
