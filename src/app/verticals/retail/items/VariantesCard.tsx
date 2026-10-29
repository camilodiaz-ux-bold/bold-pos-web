/**
 * VariantesCard — card "Variantes disponibles" del formulario de ítem (Retail), réplica del POS real:
 * toggles, impuesto para todas las variantes, "Variantes activas" (tipos con chips de opciones) y tabla
 * de variantes con filtros, paginación y panel "Editar variante" (specs/2026-10-variantes-modelo.md §2).
 * Presentacional: el estado vive en ItemFormPage.
 */
import React, { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { ItemTipoVariante, ItemVariante, VarianteTipo } from '../../../types/item';
import { getVarianteLabel } from '../../../types/item';
import { formatCOP } from '../../../utils/format';
import { ordenarOpciones } from '../../../utils/variantes';
import { FieldLabel, SelectField, TextField } from '../../../components/items/FormField';
import { Toggle } from '../../../components/items/Toggle';
import { EditarVarianteDrawer } from './EditarVarianteDrawer';
import { CrearVarianteDrawer } from './CrearVarianteDrawer';

const PAGE_SIZE = 10;

interface Props {
  tiposCatalogo: VarianteTipo[];
  tiposVariante: ItemTipoVariante[];
  variantes: ItemVariante[];
  manejaExistencias: boolean;
  onToggleManeja: (v: boolean) => void;
  mismoPrecio: boolean;
  onToggleMismoPrecio: (v: boolean) => void;
  precioBaseRaw: string;
  precioTotalRaw: string;
  onChangePrecioBase: (raw: string) => void;
  onChangePrecioTotal: (raw: string) => void;
  impuestoId: string;
  impuestoOptions: { value: string; label: string }[];
  impuestoRate: number;
  onChangeImpuesto: (id: string) => void;
  unidadLabel: string;
  itemNombre: string;
  /** `reiniciar`: se cambió de tipo, las variantes existentes se descartan. */
  onChangeTipos: (tipos: ItemTipoVariante[], reiniciar?: boolean) => void;
  onToggleVarianteActivo: (id: string) => void;
  onUpdateVariante: (v: ItemVariante) => void;
  onCrearTipo: (draft: { nombre: string; opciones: string[] }) => VarianteTipo;
  onQuitarVariantes: () => void;
}

const th: React.CSSProperties = {
  padding: '12px 12px 12px 0', textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--black-100)',
  borderBottom: '1px solid var(--black-10)', whiteSpace: 'nowrap', fontFamily: "'Montserrat', sans-serif",
};
const td: React.CSSProperties = {
  padding: '12px 12px 12px 0', fontSize: 13, fontWeight: 500, color: 'var(--black-100)',
  borderBottom: '1px solid var(--black-10)', verticalAlign: 'middle', fontFamily: "'Montserrat', sans-serif",
};

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={active}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
        fontSize: 12, fontWeight: 600, fontFamily: "'Montserrat', sans-serif",
        border: `1px solid ${active ? 'var(--coral-100)' : 'var(--black-10)'}`,
        backgroundColor: active ? 'var(--coral-10)' : 'var(--black-10)',
        color: active ? 'var(--coral-100)' : 'var(--black-60)',
      }}
    >
      {label}
      {active && <span aria-hidden>×</span>}
    </button>
  );
}

export function VariantesCard(p: Props) {
  const [editando, setEditando] = useState<ItemVariante | null>(null);
  const [creandoTipo, setCreandoTipo] = useState(false);
  const [segundoAbierto, setSegundoAbierto] = useState(p.tiposVariante.length > 1);
  const [filtros, setFiltros] = useState<Record<number, string>>({});
  const [page, setPage] = useState(0);

  const tipoDe = (id: string) => p.tiposCatalogo.find(t => t.id === id);
  const tipoOptions = (slot: number) =>
    p.tiposCatalogo
      .filter(t => (t.activo || p.tiposVariante[slot]?.tipoId === t.id) && !p.tiposVariante.some((x, i) => i !== slot && x.tipoId === t.id))
      .map(t => ({ value: t.id, label: t.nombre }));

  const elegirTipo = (slot: number, tipoId: string, recien?: VarianteTipo) => {
    const tipo = recien ?? tipoDe(tipoId);
    if (!tipo) return;
    const nuevo: ItemTipoVariante = { tipoId, opcionesActivas: [...tipo.opciones] };
    const tipos = [...p.tiposVariante];
    tipos[slot] = nuevo;
    setFiltros({});
    setPage(0);
    p.onChangeTipos(tipos, true);
  };

  const toggleOpcion = (slot: number, opcion: string) => {
    const actual = p.tiposVariante[slot];
    const tipo = tipoDe(actual.tipoId);
    const activa = actual.opcionesActivas.includes(opcion);
    if (activa && actual.opcionesActivas.length === 1) return; // al menos una opción por tipo
    const opcionesActivas = ordenarOpciones(
      tipo,
      activa ? actual.opcionesActivas.filter(o => o !== opcion) : [...actual.opcionesActivas, opcion],
    );
    const tipos = p.tiposVariante.map((t, i) => (i === slot ? { ...t, opcionesActivas } : t));
    setPage(0);
    p.onChangeTipos(tipos);
  };

  const quitarSegundo = () => {
    setSegundoAbierto(false);
    setFiltros({});
    p.onChangeTipos(p.tiposVariante.slice(0, 1), true);
  };

  const creado = (draft: { nombre: string; opciones: string[] }) => {
    const tipo = p.onCrearTipo(draft);
    setCreandoTipo(false);
    if (p.tiposVariante.length === 0) elegirTipo(0, tipo.id, tipo);
    else if (segundoAbierto && p.tiposVariante.length === 1) elegirTipo(1, tipo.id, tipo);
  };

  // Filtro por opción de cada tipo: la fila debe coincidir con todos los filtros puestos.
  const filtradas = useMemo(
    () => p.variantes.filter(v => p.tiposVariante.every((_, i) => !filtros[i] || v.opciones[i] === filtros[i])),
    [p.variantes, p.tiposVariante, filtros],
  );
  const totalPages = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const filas = filtradas.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const hayFiltros = Object.values(filtros).some(Boolean);
  const total = p.variantes.filter(v => v.activo).reduce((a, v) => a + v.sucursales.reduce((x, s) => x + s.existencia, 0), 0);

  const impuestoLabel = p.impuestoOptions.find(o => o.value === p.impuestoId)?.label ?? '';
  const slots = segundoAbierto || p.tiposVariante.length > 1 ? 2 : 1;
  const hayOtroTipo = p.tiposCatalogo.some(t => t.activo && !p.tiposVariante.some(x => x.tipoId === t.id));

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Variantes disponibles</h3>
        <button
          type="button" onClick={p.onQuitarVariantes}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--blue-100)', fontFamily: "'Montserrat', sans-serif" }}
        >
          Quitar variantes
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <FieldLabel>Variantes con existencias</FieldLabel>
          <Toggle checked={p.manejaExistencias} onChange={p.onToggleManeja} ariaLabel="Variantes con existencias" />
          <p style={{ fontSize: 12, color: 'var(--black-40)', margin: '6px 0 0' }}>Al activar, puedes agregar la disponibilidad del ítem por sucursal.</p>
        </div>
        <div>
          <FieldLabel>Mismo precio en todas las variantes</FieldLabel>
          <Toggle checked={p.mismoPrecio} onChange={p.onToggleMismoPrecio} ariaLabel="Mismo precio en todas las variantes" />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--black-10)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--black-100)' }}>
          {p.mismoPrecio ? 'Precio e impuesto para todas las variantes' : 'Impuesto para todas las variantes'}
        </h4>
        {p.mismoPrecio ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 12, alignItems: 'end' }}>
            <TextField label="Precio base" required type="number" value={p.precioBaseRaw} onChange={p.onChangePrecioBase} placeholder="0" />
            <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--black-40)', paddingBottom: 10 }}>+</span>
            <SelectField label="Impuesto" required value={p.impuestoId} onChange={p.onChangeImpuesto} options={p.impuestoOptions} placeholder="Buscar..." />
            <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--black-40)', paddingBottom: 10 }}>=</span>
            <TextField label="Precio total de venta" required type="number" value={p.precioTotalRaw} onChange={p.onChangePrecioTotal} placeholder="0" />
          </div>
        ) : (
          <div style={{ maxWidth: 360 }}>
            <SelectField label="Impuesto" required value={p.impuestoId} onChange={p.onChangeImpuesto} options={p.impuestoOptions} placeholder="Buscar..." />
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--black-10)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--black-100)' }}>Variantes activas</h4>
          {p.manejaExistencias && (
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--black-100)' }}>Total: {total.toLocaleString('es-CO')} ({p.unidadLabel})</span>
          )}
        </div>

        {Array.from({ length: slots }, (_, slot) => {
          const t = p.tiposVariante[slot];
          const tipo = t ? tipoDe(t.tipoId) : undefined;
          return (
            <div key={slot} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <SelectField
                    label={`Variante ${slot + 1}`} required={slot === 0} value={t?.tipoId ?? ''}
                    onChange={v => elegirTipo(slot, v)} options={tipoOptions(slot)} placeholder="Selecciona una variante"
                  />
                </div>
                {slot === 1 && (
                  <button
                    type="button" aria-label="Quitar segunda variante" onClick={quitarSegundo}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10, display: 'flex' }}
                  >
                    <Trash2 size={16} color="var(--black-60)" />
                  </button>
                )}
              </div>
              {tipo && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {tipo.opciones.map(o => (
                    <Chip key={o} label={o} active={t.opcionesActivas.includes(o)} onClick={() => toggleOpcion(slot, o)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {slots === 1 && p.tiposVariante.length === 1 && hayOtroTipo && (
          <div>
            <button
              type="button" onClick={() => setSegundoAbierto(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 600, color: 'var(--blue-100)', fontFamily: "'Montserrat', sans-serif" }}
            >
              Agregar segunda variante
            </button>
          </div>
        )}

        <button
          type="button" onClick={() => setCreandoTipo(true)}
          style={{
            maxWidth: 560, padding: '12px 16px', borderRadius: 8, border: 'none', backgroundColor: 'var(--black-10)',
            color: 'var(--black-100)', fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Crear variante
        </button>

        {p.variantes.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {p.tiposVariante.map((t, i) => {
                const tipo = tipoDe(t.tipoId);
                return (
                  <div key={t.tipoId} style={{ minWidth: 160 }}>
                    <select
                      aria-label={`Filtrar por ${tipo?.nombre ?? 'variante'}`}
                      value={filtros[i] ?? ''}
                      onChange={e => { setFiltros(prev => ({ ...prev, [i]: e.target.value })); setPage(0); }}
                      className="merlin-input-filled" style={{ borderRadius: 999, padding: '8px 16px' }}
                    >
                      <option value="">{tipo?.nombre ?? 'Variante'}</option>
                      {t.opcionesActivas.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                );
              })}
              <span style={{ fontSize: 12, color: 'var(--black-60)' }}>Mostrando {filtradas.length} de {p.variantes.length}</span>
              {hayFiltros && (
                <button
                  type="button" onClick={() => { setFiltros({}); setPage(0); }}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--blue-100)', textDecoration: 'underline', fontFamily: "'Montserrat', sans-serif" }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: 36 }} />
                    <th style={th}>Variante</th>
                    <th style={th}>Precio de venta</th>
                    <th style={th}>Código</th>
                    <th style={th}>Precio de costo</th>
                    <th style={th}>Existencia</th>
                    <th style={{ ...th, width: 80 }} />
                  </tr>
                </thead>
                <tbody>
                  {filas.map(v => (
                    <tr key={v.id} style={{ opacity: v.activo ? 1 : 0.55 }}>
                      <td style={td}>
                        <input
                          type="checkbox" checked={v.activo} onChange={() => p.onToggleVarianteActivo(v.id)}
                          aria-label={`Variante ${getVarianteLabel(v)} activa`}
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--coral-100)' }}
                        />
                      </td>
                      <td style={td}>{getVarianteLabel(v)}</td>
                      <td style={td}>
                        {formatCOP(v.precioTotal)}
                        <div style={{ fontSize: 11, color: 'var(--black-60)' }}>{impuestoLabel}</div>
                      </td>
                      <td style={td}>{v.codigo}</td>
                      <td style={td}>{formatCOP(v.costo)}</td>
                      <td style={td}>{p.manejaExistencias ? v.sucursales.reduce((a, s) => a + s.existencia, 0).toLocaleString('es-CO') : '—'}</td>
                      <td style={td}>
                        <button type="button" className="btn btn-cancel btn--sm" onClick={() => setEditando(v)}>Editar</button>
                      </td>
                    </tr>
                  ))}
                  {filas.length === 0 && (
                    <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--black-60)' }}>Ninguna variante coincide con los filtros</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, fontSize: 13 }}>
                <button type="button" className="btn btn-cancel btn--sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Anterior</button>
                <span>{safePage + 1} / {totalPages}</span>
                <button type="button" className="btn btn-cancel btn--sm" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>Siguiente</button>
              </div>
            )}
          </>
        )}
        {p.variantes.length === 0 && p.tiposVariante.length > 0 && (
          <p style={{ fontSize: 13, color: 'var(--black-60)', margin: 0 }}>Activa al menos una opción para generar las variantes.</p>
        )}
      </div>

      {editando && (
        <EditarVarianteDrawer
          variante={editando}
          itemNombre={p.itemNombre || 'Ítem sin nombre'}
          tiposNombres={p.tiposVariante.map(t => tipoDe(t.tipoId)?.nombre ?? t.tipoId)}
          impuestoLabel={impuestoLabel}
          impuestoRate={p.impuestoRate}
          precioBloqueado={p.mismoPrecio}
          manejaExistencias={p.manejaExistencias}
          unidadLabel={p.unidadLabel}
          codigosUsados={new Set(p.variantes.filter(x => x.id !== editando.id).map(x => x.codigo))}
          onClose={() => setEditando(null)}
          onSave={v => { p.onUpdateVariante(v); setEditando(null); }}
        />
      )}
      {creandoTipo && <CrearVarianteDrawer onClose={() => setCreandoTipo(false)} onSave={creado} />}
    </div>
  );
}
