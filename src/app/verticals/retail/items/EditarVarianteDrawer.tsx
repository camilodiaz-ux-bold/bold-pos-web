/**
 * EditarVarianteDrawer — panel lateral "Editar variante" del formulario de ítem: precio, código, costo y,
 * si el ítem maneja existencias, las sucursales con disponibilidad y su existencia
 * (specs/2026-10-variantes-modelo.md §2). Guarda en el borrador del formulario; se persiste con el ítem.
 */
import React, { useState } from 'react';
import type { ItemSucursal, ItemVariante, SucursalId } from '../../../types/item';
import { getVarianteLabel } from '../../../types/item';
import { SUCURSALES } from '../../../data/itemsCatalogs';
import { parseCOP } from '../../../utils/format';
import { Drawer } from '../../../components/compras/Drawer';
import { FieldLabel, TextField } from '../../../components/items/FormField';
import { Toggle } from '../../../components/items/Toggle';

interface Props {
  variante: ItemVariante;
  itemNombre: string;
  /** Nombres de los tipos del ítem, para el chip de la cabecera. */
  tiposNombres: string[];
  impuestoLabel: string;
  impuestoRate: number;
  /** Con "Mismo precio en todas las variantes" el precio se edita en la card, no aquí. */
  precioBloqueado: boolean;
  manejaExistencias: boolean;
  unidadLabel: string;
  codigosUsados: Set<string>;
  onClose: () => void;
  onSave: (v: ItemVariante) => void;
}

export function EditarVarianteDrawer({
  variante, itemNombre, tiposNombres, impuestoLabel, impuestoRate, precioBloqueado,
  manejaExistencias, unidadLabel, codigosUsados, onClose, onSave,
}: Props) {
  const [activo, setActivo] = useState(variante.activo);
  const [baseRaw, setBaseRaw] = useState(String(variante.precioBase));
  const [totalRaw, setTotalRaw] = useState(String(variante.precioTotal));
  const [codigo, setCodigo] = useState(variante.codigo);
  const [costoRaw, setCostoRaw] = useState(variante.costo ? String(variante.costo) : '');
  const [sucursales, setSucursales] = useState<Record<string, string>>(
    Object.fromEntries(variante.sucursales.map(s => [s.sucursalId, String(s.existencia)])),
  );
  // Alerta de stock bajo por sucursal (specs/2026-10-alertas-stock-disponibilidad.md §1).
  const [stockBajo, setStockBajo] = useState<Record<string, string>>(
    Object.fromEntries(variante.sucursales.filter(s => s.stockBajo !== undefined).map(s => [s.sucursalId, String(s.stockBajo)])),
  );
  const [alertas, setAlertas] = useState<Record<string, boolean>>(
    Object.fromEntries(variante.sucursales.filter(s => s.alerta).map(s => [s.sucursalId, true])),
  );
  const cambiarStockBajo = (id: string, raw: string) => {
    setStockBajo(prev => ({ ...prev, [id]: raw }));
    if (raw.trim() === '') setAlertas(prev => ({ ...prev, [id]: false }));
  };
  const cambiarAlerta = (id: string, activa: boolean) => {
    setAlertas(prev => ({ ...prev, [id]: activa }));
    // Activar sin valor lo deja en 0, como en Alertas de Stock.
    if (activa && (stockBajo[id] ?? '').trim() === '') setStockBajo(prev => ({ ...prev, [id]: '0' }));
  };

  const setBase = (raw: string) => {
    setBaseRaw(raw);
    setTotalRaw(String(Math.round(parseCOP(raw) * (1 + impuestoRate))));
  };
  const setTotal = (raw: string) => {
    setTotalRaw(raw);
    setBaseRaw(String(Math.round(parseCOP(raw) / (1 + impuestoRate))));
  };
  const toggleSucursal = (id: SucursalId) => {
    if (id in sucursales) {
      // Quitar la sucursal descarta también su stock bajo y su alerta.
      setSucursales(prev => { const n = { ...prev }; delete n[id]; return n; });
      setStockBajo(prev => { const n = { ...prev }; delete n[id]; return n; });
      setAlertas(prev => { const n = { ...prev }; delete n[id]; return n; });
    } else {
      setSucursales(prev => ({ ...prev, [id]: '0' }));
    }
  };

  const codigoRepetido = codigo.trim() !== '' && codigo.trim() !== variante.codigo && codigosUsados.has(codigo.trim());
  const sucursalIds = Object.keys(sucursales);
  const existenciasOk = !manejaExistencias || (sucursalIds.length > 0 && sucursalIds.every(id => Number.isInteger(parseInt(sucursales[id], 10))));
  const stockBajoOk = !manejaExistencias || sucursalIds.every(id => { const raw = (stockBajo[id] ?? '').trim(); return raw === '' || /^\d+$/.test(raw); });
  const canSave = parseCOP(baseRaw) > 0 && !codigoRepetido && existenciasOk && stockBajoOk;

  const guardar = () => {
    const usados = new Set(codigosUsados);
    let codigoFinal = codigo.trim();
    if (!codigoFinal) {
      do { codigoFinal = String(Math.floor(10_000_000 + Math.random() * 90_000_000)); } while (usados.has(codigoFinal));
    }
    const sucursalesFinal: ItemSucursal[] = manejaExistencias
      ? SUCURSALES.filter(s => s.id in sucursales).map((s): ItemSucursal => {
          const umbral = (stockBajo[s.id] ?? '').trim();
          return {
            sucursalId: s.id,
            existencia: parseInt(sucursales[s.id], 10) || 0,
            // Sin stock bajo no hay alerta: no se guarda ninguno de los dos.
            ...(umbral !== '' ? { stockBajo: parseInt(umbral, 10), alerta: !!alertas[s.id] } : {}),
          };
        })
      : [];
    onSave({
      ...variante,
      activo,
      precioBase: parseCOP(baseRaw),
      precioTotal: parseCOP(totalRaw),
      codigo: codigoFinal,
      costo: parseCOP(costoRaw),
      sucursales: sucursalesFinal,
    });
  };

  return (
    <Drawer
      title="Editar variante"
      width={640}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-cancel" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary" disabled={!canSave} onClick={guardar}>Guardar</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--black-10)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--black-60)' }}>{itemNombre}</p>
            <p style={{ margin: '4px 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--black-100)' }}>{getVarianteLabel(variante)}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tiposNombres.map(n => (
                <span key={n} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, backgroundColor: 'var(--black-10)', color: 'var(--black-60)' }}>{n}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <Toggle checked={activo} onChange={setActivo} ariaLabel="Variante activa" />
            <span style={{ fontSize: 11, color: activo ? 'var(--green-100, var(--black-60))' : 'var(--black-40)' }}>{activo ? 'Ítem activo' : 'Ítem inactivo'}</span>
          </div>
        </div>

        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--black-100)' }}>Precio total de venta</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <TextField label="Precio base" required type="number" value={baseRaw} onChange={setBase} disabled={precioBloqueado} />
          <TextField label="Impuesto" required value={impuestoLabel} onChange={() => undefined} disabled />
          <TextField label="Precio total de venta" required type="number" value={totalRaw} onChange={setTotal} disabled={precioBloqueado} />
        </div>
        {precioBloqueado && (
          <p style={{ fontSize: 12, color: 'var(--black-40)', margin: '-8px 0 0' }}>
            El precio se edita en "Mismo precio en todas las variantes".
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextField
            label="Código" value={codigo} onChange={setCodigo} placeholder="Ingresa el código"
            error={codigoRepetido ? 'Ya hay una variante con ese código' : undefined}
          />
          <TextField label="Costo" type="number" value={costoRaw} onChange={setCostoRaw} placeholder="0" helper="Ingresa el valor que te cuesta este ítem" />
        </div>

        {manejaExistencias && (
          <div style={{ borderTop: '1px solid var(--black-10)', paddingTop: 16 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: 'var(--black-100)' }}>Disponibilidad</h4>
            <FieldLabel required>Sucursales con disponibilidad</FieldLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {SUCURSALES.map(s => {
                const checked = s.id in sucursales;
                return (
                  <div key={s.id}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--black-100)' }}>
                      <input
                        type="checkbox" checked={checked} onChange={() => toggleSucursal(s.id)}
                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--blue-100)' }}
                      />
                      {s.label}
                    </label>
                    {checked && (
                      <div style={{ marginTop: 8, marginLeft: 24 }}>
                        <FieldLabel required>Existencias ({unidadLabel})</FieldLabel>
                        <input
                          type="number" value={sucursales[s.id]} className="merlin-input-filled"
                          onChange={e => setSucursales(prev => ({ ...prev, [s.id]: e.target.value }))}
                        />
                        <div style={{ marginTop: 12 }}>
                          <FieldLabel>Stock bajo ({unidadLabel})</FieldLabel>
                          <input
                            type="number" min={0} value={stockBajo[s.id] ?? ''} placeholder="Sin definir" className="merlin-input-filled"
                            aria-label={`Stock bajo en ${s.label}`}
                            onChange={e => cambiarStockBajo(s.id, e.target.value)}
                          />
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer', fontSize: 13, color: 'var(--black-100)' }}>
                            <input
                              type="checkbox" checked={!!alertas[s.id]} onChange={e => cambiarAlerta(s.id, e.target.checked)}
                              aria-label={`Activar alerta de stock bajo en ${s.label}`}
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
            {sucursalIds.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--coral-100)', margin: '8px 0 0' }}>Selecciona al menos una sucursal</p>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
