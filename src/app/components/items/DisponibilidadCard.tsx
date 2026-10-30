/**
 * DisponibilidadCard — card "Disponibilidad" del formulario de ítem:
 * toggle de existencias + checkboxes de sucursal + input de existencia por
 * sucursal marcada (solo si el toggle está ON) + stock bajo y alerta por sucursal + total.
 *
 * Para un combo (existenciasDisabled=true), el toggle de existencias se
 * oculta pero las sucursales siguen siendo seleccionables — un combo
 * puede estar activo en unas sucursales y no en otras, aunque no maneje
 * un número de existencia propio.
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
  /** Alerta de stock bajo por sucursal marcada (specs/2026-10-alertas-stock-disponibilidad.md §1). */
  stockBajo: Partial<Record<SucursalId, string>>;
  onChangeStockBajo: (id: SucursalId, raw: string) => void;
  alertas: Partial<Record<SucursalId, boolean>>;
  onChangeAlerta: (id: SucursalId, activa: boolean) => void;
  unidadLabel: string;
  sucursalesError?: string;
  /** Un combo no maneja existencias propias — oculta el toggle pero deja la sección
   * de sucursales editable (specs/2026-09-combos-disponibilidad.md, specs/2026-10-items-crear-tabs.md). */
  existenciasDisabled?: boolean;
}

export function DisponibilidadCard({
  manejaExistencias,
  onToggleManeja,
  sucursalIds,
  onToggleSucursal,
  existencias,
  onChangeExistencia,
  stockBajo,
  onChangeStockBajo,
  alertas,
  onChangeAlerta,
  unidadLabel,
  sucursalesError,
  existenciasDisabled,
}: DisponibilidadCardProps) {
  const total = manejaExistencias
    ? sucursalIds.reduce((acc, id) => acc + (parseInt(existencias[id] ?? '0', 10) || 0), 0)
    : 0;

  return (
    <div style={{ backgroundColor: 'var(--black-0)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Disponibilidad</h3>

      {!existenciasDisabled && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Toggle checked={manejaExistencias} onChange={onToggleManeja} ariaLabel="Ítem con existencias" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--black-100)' }}>
              Ítem con existencias ({unidadLabel})
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--black-40)', margin: '6px 0 0' }}>
            Al activar, puedes agregar la disponibilidad del ítem por sucursal.
          </p>
        </div>
      )}

      <div style={existenciasDisabled ? undefined : { borderTop: '1px solid var(--black-10)', paddingTop: 16 }}>
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
                    <div style={{ marginTop: 12 }}>
                      <FieldLabel>Stock bajo ({unidadLabel})</FieldLabel>
                      <input
                        type="number"
                        min={0}
                        aria-label={`Stock bajo en ${s.label}`}
                        value={stockBajo[s.id] ?? ''}
                        placeholder="Sin definir"
                        onChange={e => onChangeStockBajo(s.id, e.target.value)}
                        className="merlin-input-filled"
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer', fontSize: 13, color: 'var(--black-100)' }}>
                        <input
                          type="checkbox"
                          aria-label={`Activar alerta de stock bajo en ${s.label}`}
                          checked={!!alertas[s.id]}
                          onChange={e => onChangeAlerta(s.id, e.target.checked)}
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--blue-100)' }}
                        />
                        Activar alerta de stock bajo
                      </label>
                    </div>
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
