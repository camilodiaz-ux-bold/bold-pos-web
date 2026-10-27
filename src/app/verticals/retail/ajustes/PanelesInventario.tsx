/**
 * PanelesInventario — Lista de precios y Categorías de ítems (specs/2026-10-ajustes.md §4.6, fase 3).
 * Ambos viven en el store de Ajustes; el módulo de ítems todavía no los consume (ver spec §7).
 */
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, Info, Plus, X } from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import { aNumero } from '../../../utils/ajustes';
import type { CategoriaItem, ListaPrecios, TipoListaPrecios } from '../../../types/ajustes';
import { AccionesFila, FONT, FooterDerecho, REQUERIDO, SidePanel, inputErr } from './PanelUi';

interface PanelProps { onClose: () => void }

const MAX_LISTAS = 3;

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'var(--blue-100)', marginBottom: 6 };
const errorStyle: React.CSSProperties = { fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' };
const botonSecundario: React.CSSProperties = {
  flex: 1, height: 36, borderRadius: 'var(--radius-8)', border: 'none', cursor: 'pointer', backgroundColor: 'var(--blue-10)',
  fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--blue-100)',
};

// ─── Lista de precios ────────────────────────────────────────────────────────

interface FormLista { nombre: string; tipo: TipoListaPrecios; porcentaje: string; rolIds: string[] }

export function ListaPreciosPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const [editando, setEditando] = useState<{ id: string | null } | null>(null);
  const [form, setForm] = useState<FormLista>({ nombre: '', tipo: 'valor', porcentaje: '', rolIds: [] });
  const [errores, setErrores] = useState<Partial<Record<'nombre' | 'porcentaje' | 'rolIds', string>>>({});
  const [aEliminar, setAEliminar] = useState<ListaPrecios | null>(null);

  const listas = ajustes.listasPrecios;
  const nombreRol = (id: string) => ajustes.roles.find(r => r.id === id)?.nombre ?? id;

  const abrir = (l: ListaPrecios | null) => {
    setForm(l
      ? { nombre: l.nombre, tipo: l.tipo, porcentaje: l.tipo === 'porcentaje' ? String(l.porcentaje) : '', rolIds: l.rolIds }
      : { nombre: '', tipo: 'valor', porcentaje: '', rolIds: [] });
    setErrores({});
    setEditando({ id: l?.id ?? null });
  };

  const guardar = () => {
    const e: typeof errores = {};
    const n = form.nombre.trim();
    const pct = aNumero(form.porcentaje);
    if (!n) e.nombre = REQUERIDO;
    else if (listas.some(l => l.nombre.toLowerCase() === n.toLowerCase() && l.id !== editando?.id)) e.nombre = 'Ya existe una lista con este nombre';
    if (form.tipo === 'porcentaje') {
      if (!form.porcentaje.trim()) e.porcentaje = REQUERIDO;
      else if (Number.isNaN(pct) || pct <= 0 || pct > 100) e.porcentaje = 'Ingresa un porcentaje entre 1 y 100';
    }
    if (form.rolIds.length === 0) e.rolIds = 'Asocia al menos un rol';
    setErrores(e);
    if (Object.keys(e).length) return;
    const datos = { nombre: n, tipo: form.tipo, porcentaje: form.tipo === 'porcentaje' ? pct : 0, rolIds: form.rolIds };
    updateAjustes(prev => ({
      ...prev,
      listasPrecios: editando?.id
        ? prev.listasPrecios.map(l => (l.id === editando.id ? { ...l, ...datos } : l))
        : [...prev.listasPrecios, { id: `lp-${Date.now()}`, ...datos }],
    }));
    toast.success(editando?.id ? 'Lista de precios actualizada' : 'Lista de precios creada');
    setEditando(null);
  };

  const eliminar = () => {
    if (!aEliminar) return;
    updateAjustes(prev => ({ ...prev, listasPrecios: prev.listasPrecios.filter(l => l.id !== aEliminar.id) }));
    toast.success('Lista de precios eliminada');
    setAEliminar(null);
  };

  const rolesDisponibles = ajustes.roles.filter(r => !form.rolIds.includes(r.id));
  const TEXTO = 'Esta lista te permitirá aplicar precios diferentes al vender los ítems, sin tener que editarlos uno a uno.';

  return (
    <>
      <SidePanel
        variant="right" title={editando ? (editando.id ? 'Actualizar lista de precios' : 'Crear lista de precios') : 'Lista de precios'}
        subtitle={TEXTO} onClose={editando ? () => setEditando(null) : onClose}
        footer={editando
          ? <FooterDerecho onCancel={() => setEditando(null)} onSave={guardar} saveLabel={editando.id ? 'Guardar' : 'Crear lista'} />
          : <FooterDerecho onCancel={onClose} onSave={() => abrir(null)} saveLabel="Nueva lista" hideSave={listas.length >= MAX_LISTAS} />}
      >
        {editando ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>Nombre de la lista de precios <span style={{ color: 'var(--coral-100)' }}>*</span></label>
              <input className="merlin-input-filled" style={inputErr(errores.nombre)} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
              {errores.nombre && <p style={errorStyle}>{errores.nombre}</p>}
            </div>
            <div role="radiogroup" aria-label="Tipo de lista precios">
              <label style={labelStyle}>Tipo de lista precios</label>
              <div style={{ display: 'flex', gap: 40 }}>
                {([['valor', 'Valor en pesos'], ['porcentaje', 'Porcentaje']] as [TipoListaPrecios, string][]).map(([v, l]) => (
                  <button key={v} type="button" role="radio" aria-checked={form.tipo === v} onClick={() => setForm(f => ({ ...f, tipo: v }))}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', boxSizing: 'border-box', border: `1.5px solid ${form.tipo === v ? 'var(--coral-100)' : 'var(--blue-40)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {form.tipo === v && <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--coral-100)' }} />}
                    </span>
                    <span style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-100)' }}>{l}</span>
                  </button>
                ))}
              </div>
            </div>
            {form.tipo === 'porcentaje' && (
              <div>
                <label style={labelStyle}>Valor del porcentaje <span style={{ color: 'var(--coral-100)' }}>*</span></label>
                <input className="merlin-input-filled" style={inputErr(errores.porcentaje)} inputMode="decimal" value={form.porcentaje}
                  onChange={e => setForm(f => ({ ...f, porcentaje: e.target.value.replace(/[^\d.,]/g, '') }))} />
                {errores.porcentaje && <p style={errorStyle}>{errores.porcentaje}</p>}
              </div>
            )}
            <div>
              <label style={labelStyle}>Roles asociados <span style={{ color: 'var(--coral-100)' }}>*</span></label>
              <select className="merlin-input-filled" style={inputErr(errores.rolIds)} value=""
                onChange={e => e.target.value && setForm(f => ({ ...f, rolIds: [...f.rolIds, e.target.value] }))}>
                <option value="" disabled>{rolesDisponibles.length ? 'Selecciona un rol' : 'Todos los roles están asociados'}</option>
                {rolesDisponibles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              {errores.rolIds && <p style={errorStyle}>{errores.rolIds}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {form.rolIds.map(id => (
                  <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, border: '1px solid var(--coral-100)', color: 'var(--coral-100)', fontFamily: FONT, fontSize: 11 }}>
                    {nombreRol(id)}
                    <button type="button" aria-label={`Quitar ${nombreRol(id)}`} onClick={() => setForm(f => ({ ...f, rolIds: f.rolIds.filter(x => x !== id) }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <X size={12} color="var(--coral-100)" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--blue-100)', margin: '0 0 12px' }}>
              {listas.length} {listas.length === 1 ? 'lista de precios creada' : 'listas de precios creadas'}
            </p>
            <div style={{ backgroundColor: 'var(--blue-10)', borderRadius: 'var(--radius-12)', padding: '4px 16px' }}>
              {listas.map((l, i) => (
                <div key={l.id} style={{ padding: '16px 0', borderTop: i === 0 ? 'none' : '1px solid var(--blue-20)' }}>
                  <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>{l.nombre}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontSize: 11, color: 'var(--black-60)', marginTop: 8 }}>
                    <span>Tipo de lista precios</span><span>{l.tipo === 'valor' ? 'Valor en pesos' : 'Porcentaje'}</span>
                  </div>
                  {l.tipo === 'porcentaje' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontSize: 11, color: 'var(--black-60)', marginTop: 4 }}>
                      <span>Porcentaje asignado</span><span>{String(l.porcentaje).replace('.', ',')} %</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                    <button type="button" style={botonSecundario} onClick={() => abrir(l)}>Editar</button>
                    <button type="button" style={botonSecundario} onClick={() => setAEliminar(l)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 11, color: 'var(--black-60)', margin: '12px 0 0' }}>
              <Info size={13} color="var(--blue-100)" /> Puedes crear hasta {MAX_LISTAS} listas de precios
            </p>
          </>
        )}
      </SidePanel>
      {aEliminar && (
        <ConfirmDeleteModal title="Eliminar lista de precios" message={`¿Eliminar "${aEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onCancel={() => setAEliminar(null)} onConfirm={eliminar} />
      )}
    </>
  );
}

// ─── Categorías de ítems ─────────────────────────────────────────────────────

export function CategoriasItemsPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const cats = ajustes.categoriasItems;
  const [cerradas, setCerradas] = useState<Set<string>>(new Set());
  const [editando, setEditando] = useState<{ id: string | null } | null>(null);
  const [padreId, setPadreId] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [subs, setSubs] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [aEliminar, setAEliminar] = useState<CategoriaItem | null>(null);

  const hijas = (id: string | null) => cats.filter(c => c.padreId === id);
  const descendientes = (id: string): string[] => hijas(id).flatMap(h => [h.id, ...descendientes(h.id)]);

  // Lista plana en orden de árbol, con nivel, para pintar y para el select de categoría principal.
  const plano = useMemo(() => {
    const out: { cat: CategoriaItem; nivel: number }[] = [];
    const visitar = (padre: string | null, nivel: number) => {
      cats.filter(c => c.padreId === padre).forEach(c => { out.push({ cat: c, nivel }); visitar(c.id, nivel + 1); });
    };
    visitar(null, 0);
    return out;
  }, [cats]);

  const visibles = plano.filter(({ cat }) => {
    let p = cat.padreId;
    while (p) { if (cerradas.has(p)) return false; p = cats.find(c => c.id === p)?.padreId ?? null; }
    return true;
  });

  const abrir = (c: CategoriaItem | null) => {
    setPadreId(c?.padreId ?? '');
    setNombre(c?.nombre ?? '');
    setDescripcion(c?.descripcion ?? '');
    setSubs([]);
    setError('');
    setEditando({ id: c?.id ?? null });
  };

  const guardar = () => {
    const n = nombre.trim();
    if (!n) { setError(REQUERIDO); return; }
    const hermanas = cats.filter(c => (c.padreId ?? '') === padreId && c.id !== editando?.id);
    if (hermanas.some(c => c.nombre.toLowerCase() === n.toLowerCase())) { setError('Ya existe una categoría con este nombre en ese grupo'); return; }
    const id = editando?.id ?? `ci-${Date.now()}`;
    const nuevasSubs = subs.map(s => s.trim()).filter(Boolean);
    updateAjustes(prev => {
      const base = editando?.id
        ? prev.categoriasItems.map(c => (c.id === id ? { ...c, nombre: n, descripcion: descripcion.trim(), padreId: padreId || null } : c))
        : [...prev.categoriasItems, { id, nombre: n, descripcion: descripcion.trim(), padreId: padreId || null }];
      return {
        ...prev,
        categoriasItems: [...base, ...nuevasSubs.map((s, i) => ({ id: `ci-${Date.now()}-${i}`, nombre: s, descripcion: '', padreId: id }))],
      };
    });
    toast.success(editando?.id ? 'Categoría actualizada' : 'Categoría creada');
    setEditando(null);
  };

  const eliminar = () => {
    if (!aEliminar) return;
    const ids = new Set([aEliminar.id, ...descendientes(aEliminar.id)]);
    updateAjustes(prev => ({ ...prev, categoriasItems: prev.categoriasItems.filter(c => !ids.has(c.id)) }));
    toast.success('Categoría eliminada');
    setAEliminar(null);
  };

  const excluidas = editando?.id ? new Set([editando.id, ...descendientes(editando.id)]) : new Set<string>();

  return (
    <>
      <SidePanel
        variant="right" title="Categorías de ítems" onClose={editando ? () => setEditando(null) : onClose}
        footer={editando
          ? <FooterDerecho onCancel={() => setEditando(null)} onSave={guardar} saveLabel="Guardar" canSave={!!nombre.trim()} />
          : <FooterDerecho onCancel={onClose} onSave={() => abrir(null)} saveLabel="Nuevo" />}
      >
        {editando ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Categoría principal</label>
              <select className="merlin-input-filled" value={padreId} onChange={e => setPadreId(e.target.value)}>
                <option value="">Ninguna</option>
                {plano.filter(({ cat }) => !excluidas.has(cat.id)).map(({ cat, nivel }) => (
                  <option key={cat.id} value={cat.id}>{`${'— '.repeat(nivel)}${cat.nombre}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Nombre de la categoría <span style={{ color: 'var(--coral-100)' }}>*</span></label>
              <input className="merlin-input-filled" style={inputErr(error)} placeholder="Ingresa un nombre para la categoría" value={nombre}
                onChange={e => { setNombre(e.target.value); setError(''); }} />
              {error && <p style={errorStyle}>{error}</p>}
            </div>
            <div>
              <label style={labelStyle}>Descripción</label>
              <input className="merlin-input-filled" placeholder="Ingresa una descripción para la categoría" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ ...labelStyle, margin: 0, fontSize: 13 }}>Sub-categorías</span>
                <button type="button" aria-label="Agregar sub-categoría" onClick={() => setSubs(s => [...s, ''])}
                  style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={14} color="var(--black-0)" />
                </button>
              </div>
              {subs.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input className="merlin-input-filled" placeholder="Nombre de la sub-categoría" value={s}
                    onChange={e => setSubs(arr => arr.map((x, j) => (j === i ? e.target.value : x)))} />
                  <button type="button" aria-label="Quitar" onClick={() => setSubs(arr => arr.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} color="var(--black-60)" /></button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {visibles.map(({ cat, nivel }) => {
              const tieneHijas = hijas(cat.id).length > 0;
              const cerrada = cerradas.has(cat.id);
              return (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', paddingLeft: nivel * 24 }}>
                  <button
                    type="button" aria-label={cerrada ? 'Expandir' : 'Contraer'} disabled={!tieneHijas}
                    onClick={() => setCerradas(s => { const n = new Set(s); if (n.has(cat.id)) n.delete(cat.id); else n.add(cat.id); return n; })}
                    style={{ width: 20, height: 20, background: 'none', border: 'none', cursor: tieneHijas ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  >
                    {tieneHijas && (cerrada ? <ChevronRight size={14} color="var(--blue-100)" /> : <ChevronDown size={14} color="var(--blue-100)" />)}
                  </button>
                  <span style={{ flex: 1, fontFamily: FONT, fontSize: 13, color: 'var(--black-100)' }}>- {cat.nombre}</span>
                  <AccionesFila onEditar={() => abrir(cat)} onEliminar={() => setAEliminar(cat)} />
                </div>
              );
            })}
          </div>
        )}
      </SidePanel>
      {aEliminar && (
        <ConfirmDeleteModal
          title="Eliminar categoría"
          message={hijas(aEliminar.id).length ? `¿Eliminar "${aEliminar.nombre}" y todas sus sub-categorías?` : `¿Eliminar "${aEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onCancel={() => setAEliminar(null)} onConfirm={eliminar}
        />
      )}
    </>
  );
}
