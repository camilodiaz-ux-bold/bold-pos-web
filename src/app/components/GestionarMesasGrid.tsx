/**
 * GestionarMesasGrid
 * ─────────────────────────────────────────────────────────────────────────────
 * Vista grid de gestión de mesas. 4 columnas, estilo config. Drag & drop nativo.
 * Panel lateral con estilos MERLin: inputs con fondo #F7F8FB / border-radius 12px,
 * labels estáticas en 14px/600/navy, botones pill, toggle custom.
 */
import React, { useState, useRef } from 'react';
import { Plus, Pencil, Users, X, Trash2, ChevronDown } from 'lucide-react';
import { useMesas } from '../hooks/useMesas';
import type { Mesa } from '../types/mesa';

// ─── Design tokens ────────────────────────────────────────────────────────────

const FONT        = 'Montserrat, var(--font-family, sans-serif)';
const NAVY        = '#121E6C';
const CORAL       = '#FF2947';
const INPUT_BG    = '#F7F8FB';
const LABEL_COLOR = '#121E6C';
const GRAY_60     = '#606060';
const BORDER_LIGHT = '#C7CBE0';

const AVAILABLE_ZONES = ['Salón', 'Terraza', 'Barra'];

// ─── Edit panel state ─────────────────────────────────────────────────────────

interface EditState {
  mode:          'edit' | 'new';
  id:            string | null;
  nombre:        string;
  zona:          string;
  capacidad:     number;
  habilitada:    boolean;
  confirmDelete: boolean;
  errors:        { nombre?: boolean; capacidad?: boolean };
}

function blankEdit(): EditState {
  return {
    mode: 'new', id: null, nombre: '', zona: 'Salón',
    capacidad: 4, habilitada: true, confirmDelete: false, errors: {},
  };
}

function editFromMesa(mesa: Mesa): EditState {
  return {
    mode: 'edit', id: mesa.id, nombre: mesa.nombre, zona: mesa.zona,
    capacidad: mesa.capacidad, habilitada: mesa.habilitada,
    confirmDelete: false, errors: {},
  };
}

// ─── Sub-components: MERLin-style field ───────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'block', marginBottom: 4,
      fontSize: 14, fontWeight: 600, fontFamily: FONT,
      color: LABEL_COLOR, lineHeight: '20px',
    }}>{children}</span>
  );
}

function TextInput({
  value, onChange, placeholder, hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hasError?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', height: 40, boxSizing: 'border-box',
        borderRadius: 12, border: hasError
          ? `1.5px solid ${CORAL}`
          : focused ? `1.5px solid ${NAVY}` : `1.5px solid ${BORDER_LIGHT}`,
        background: INPUT_BG, fontFamily: FONT, fontSize: 14,
        color: '#1E1E1E', padding: '0 12px', outline: 'none',
        transition: 'border-color 200ms',
      }}
    />
  );
}

function NumberInput({
  value, onChange, min, max, hasError,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  hasError?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', height: 40, boxSizing: 'border-box',
        borderRadius: 12, border: hasError
          ? `1.5px solid ${CORAL}`
          : focused ? `1.5px solid ${NAVY}` : `1.5px solid ${BORDER_LIGHT}`,
        background: INPUT_BG, fontFamily: FONT, fontSize: 14,
        color: '#1E1E1E', padding: '0 12px', outline: 'none',
        transition: 'border-color 200ms',
      }}
    />
  );
}

function SelectInput({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 40, boxSizing: 'border-box',
          borderRadius: 12, border: focused ? `1.5px solid ${NAVY}` : `1.5px solid ${BORDER_LIGHT}`,
          background: INPUT_BG, fontFamily: FONT, fontSize: 14,
          color: '#1E1E1E', padding: '0 36px 0 12px',
          outline: 'none', appearance: 'none', cursor: 'pointer',
          transition: 'border-color 200ms',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown
        size={16} color={GRAY_60}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      />
    </div>
  );
}

function ToggleSwitch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: 40, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: on ? NAVY : BORDER_LIGHT,
          position: 'relative', transition: 'background 200ms', flexShrink: 0, padding: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transition: 'left 200ms',
          left: on ? 18 : 2,
        }} />
      </button>
      <span style={{ fontSize: 14, color: GRAY_60, fontFamily: FONT }}>
        {on ? 'Habilitada' : 'Deshabilitada'}
      </span>
    </div>
  );
}

// ─── GestionarMesasGrid ───────────────────────────────────────────────────────

export function GestionarMesasGrid() {
  const { mesas, updateMesa, addMesa, deleteMesa, reorderMesas } = useMesas();

  const zones = ['Todas', ...new Set(mesas.map(m => m.zona))];
  const [activeZone, setActiveZone] = useState<string>('Todas');
  const [editPanel,  setEditPanel]  = useState<EditState | null>(null);
  const dragId = useRef<string | null>(null);

  const filtered = [...mesas]
    .filter(m => activeZone === 'Todas' || m.zona === activeZone)
    .sort((a, b) => a.gridIndex - b.gridIndex);

  // ── Drag & drop ────────────────────────────────────────────────────────────
  const handleDragStart = (id: string) => { dragId.current = id; };
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop      = (targetId: string) => {
    if (dragId.current && dragId.current !== targetId) {
      reorderMesas(dragId.current, targetId);
    }
    dragId.current = null;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!editPanel) return;
    const errors: EditState['errors'] = {};
    if (!editPanel.nombre.trim()) errors.nombre = true;
    if (editPanel.capacidad < 1)  errors.capacidad = true;
    if (Object.keys(errors).length) {
      setEditPanel(p => p ? { ...p, errors } : p);
      return;
    }
    if (editPanel.mode === 'new') {
      addMesa({
        id:              `m${Date.now()}`,
        nombre:          editPanel.nombre.trim(),
        zona:            editPanel.zona,
        capacidad:       editPanel.capacidad,
        habilitada:      editPanel.habilitada,
        estado:          'disponible',
        personas:        0,
        tiempoOcupacion: '',
      });
    } else if (editPanel.id) {
      updateMesa(editPanel.id, {
        nombre:     editPanel.nombre.trim(),
        zona:       editPanel.zona,
        capacidad:  editPanel.capacidad,
        habilitada: editPanel.habilitada,
      });
    }
    setEditPanel(null);
  };

  const handleDelete = () => {
    if (!editPanel?.id) return;
    deleteMesa(editPanel.id);
    setEditPanel(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative', background: '#fff' }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        padding: '8px 20px', borderBottom: '1px solid var(--black-10)', background: '#fff',
      }}>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          {zones.map(z => (
            <button key={z} onClick={() => setActiveZone(z)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', border: 'none', fontFamily: FONT,
              background: activeZone === z ? NAVY : 'var(--blue-10)',
              color:      activeZone === z ? '#fff' : 'var(--black-60)',
            }}>{z}</button>
          ))}
        </div>
        <button
          onClick={() => setEditPanel(blankEdit())}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', border: `1.5px solid ${NAVY}`, background: '#fff', color: NAVY,
            fontFamily: FONT,
          }}
        >
          <Plus size={14} /> Agregar mesa
        </button>
      </div>

      {/* ── Grid ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 200, color: 'var(--black-40)', fontSize: 13, fontFamily: FONT,
          }}>
            No hay mesas en esta zona.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {filtered.map(mesa => (
              <MesaConfigCard
                key={mesa.id}
                mesa={mesa}
                onEdit={() => setEditPanel(editFromMesa(mesa))}
                onDragStart={() => handleDragStart(mesa.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(mesa.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Edit panel ── */}
      {editPanel && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setEditPanel(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 999 }}
          />

          {/* Panel — MERLin lateral panel style */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
            background: '#fff', zIndex: 1000,
            display: 'flex', flexDirection: 'column',
            borderRadius: '20px 0 0 20px',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
            animation: 'slideInRight 250ms ease-out',
          }}>

            {/* ── Header ── */}
            <div style={{
              height: 56, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 20px',
              borderBottom: '1px solid #E8E8E8',
            }}>
              <span style={{
                fontSize: 16, fontWeight: 600, fontFamily: FONT, color: '#1E1E1E', lineHeight: '20px',
              }}>
                {editPanel.mode === 'new' ? 'Nueva mesa' : 'Editar mesa'}
              </span>
              <button
                onClick={() => setEditPanel(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 6 }}
              >
                <X size={20} color={GRAY_60} />
              </button>
            </div>

            {/* ── Body (scrollable) ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Nombre */}
              <div>
                <FieldLabel>Nombre de la mesa</FieldLabel>
                <TextInput
                  value={editPanel.nombre}
                  onChange={v => setEditPanel(p => p ? { ...p, nombre: v, errors: { ...p.errors, nombre: false } } : p)}
                  placeholder="Ej: Mesa 1"
                  hasError={editPanel.errors.nombre}
                />
                {editPanel.errors.nombre && (
                  <span style={{ fontSize: 12, color: CORAL, fontFamily: FONT, marginTop: 4, display: 'block' }}>
                    El nombre es requerido.
                  </span>
                )}
              </div>

              {/* Zona */}
              <div>
                <FieldLabel>Zona</FieldLabel>
                <SelectInput
                  value={editPanel.zona}
                  onChange={v => setEditPanel(p => p ? { ...p, zona: v } : p)}
                  options={AVAILABLE_ZONES}
                />
              </div>

              {/* Capacidad */}
              <div>
                <FieldLabel>Capacidad</FieldLabel>
                <NumberInput
                  value={editPanel.capacidad}
                  onChange={v => setEditPanel(p => p ? { ...p, capacidad: v, errors: { ...p.errors, capacidad: false } } : p)}
                  min={1}
                  max={20}
                  hasError={editPanel.errors.capacidad}
                />
                {editPanel.errors.capacidad && (
                  <span style={{ fontSize: 12, color: CORAL, fontFamily: FONT, marginTop: 4, display: 'block' }}>
                    La capacidad mínima es 1.
                  </span>
                )}
              </div>

              {/* Estado / Toggle */}
              <div>
                <FieldLabel>Estado de la mesa</FieldLabel>
                <ToggleSwitch
                  on={editPanel.habilitada}
                  onToggle={() => setEditPanel(p => p ? { ...p, habilitada: !p.habilitada } : p)}
                  label={editPanel.habilitada ? 'Habilitada' : 'Deshabilitada'}
                />
              </div>

              {/* Delete (edit mode only) */}
              {editPanel.mode === 'edit' && (
                <>
                  <div style={{ height: 1, background: '#F0F0F0', margin: '0 0' }} />
                  {editPanel.confirmDelete ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <span style={{ fontSize: 13, color: GRAY_60, fontFamily: FONT }}>
                        ¿Confirmar eliminación?
                      </span>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button
                          onClick={handleDelete}
                          style={{
                            flex: 1, height: 36, borderRadius: 8, border: 'none',
                            background: CORAL, color: '#fff', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', fontFamily: FONT,
                          }}
                        >Sí, eliminar</button>
                        <button
                          onClick={() => setEditPanel(p => p ? { ...p, confirmDelete: false } : p)}
                          style={{
                            flex: 1, height: 36, borderRadius: 8, border: `1.5px solid ${BORDER_LIGHT}`,
                            background: '#fff', color: GRAY_60, fontSize: 13,
                            cursor: 'pointer', fontFamily: FONT,
                          }}
                        >Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditPanel(p => p ? { ...p, confirmDelete: true } : p)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: CORAL, fontSize: 14, fontWeight: 600, fontFamily: FONT,
                        padding: '8px 0',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      <Trash2 size={16} /> Eliminar mesa
                    </button>
                  )}
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div style={{
              height: 72, flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '0 20px',
              borderTop: '1px solid #E8E8E8', background: '#fff',
            }}>
              <button
                onClick={() => setEditPanel(null)}
                style={{
                  flex: 1, height: 40, borderRadius: 32,
                  border: `1.5px solid ${BORDER_LIGHT}`, background: '#fff',
                  color: GRAY_60, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: FONT,
                }}
              >Cancelar</button>
              <button
                onClick={handleSave}
                style={{
                  flex: 1, height: 40, borderRadius: 32, border: 'none',
                  background: NAVY, color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: FONT,
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#0D1550')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = NAVY)}
              >
                {editPanel.mode === 'new' ? 'Crear mesa' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          {/* Keyframe animation */}
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(360px); }
              to   { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

// ─── MesaConfigCard ───────────────────────────────────────────────────────────

function MesaConfigCard({
  mesa, onEdit, onDragStart, onDragOver, onDrop,
}: {
  mesa:        Mesa;
  onEdit:      () => void;
  onDragStart: () => void;
  onDragOver:  (e: React.DragEvent) => void;
  onDrop:      () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [hovered,  setHovered]  = useState(false);

  const bg     = mesa.habilitada ? '#F1F2F6' : '#F5F5F5';
  const border = mesa.habilitada ? '1.5px solid #C7CBE0' : '1.5px dashed #C0C0C0';
  const nameColor = mesa.habilitada ? '#1E1E1E' : '#AAAAAA';

  return (
    <div
      draggable
      onDragStart={() => { setDragging(true); onDragStart(); }}
      onDragEnd={() => setDragging(false)}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onEdit}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        height: 110, padding: 12, borderRadius: 12, background: bg, border,
        cursor: 'pointer',
        opacity:    dragging ? 0.5 : (mesa.habilitada ? 1 : 0.7),
        transition: 'box-shadow 0.15s ease, transform 0.15s ease, opacity 0.15s ease',
        boxShadow:  hovered && !dragging ? '0 2px 8px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform:  hovered && !dragging ? 'translateY(-1px)' : 'translateY(0)',
        gap: 4,
      }}
    >
      {hovered && !dragging && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 24, height: 24, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Pencil size={12} color={GRAY_60} />
        </div>
      )}
      <span style={{ fontSize: 18, fontWeight: 700, color: nameColor, fontFamily: FONT, lineHeight: '22px', marginBottom: 4 }}>
        {mesa.nombre}
      </span>
      {mesa.habilitada && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#606060', fontFamily: FONT }}>
          <Users size={12} color="#606060" />{mesa.capacidad}
        </span>
      )}
      {!mesa.habilitada && (
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', color: '#AAAAAA', fontFamily: FONT, textTransform: 'uppercase' }}>
          Inhabilitada
        </span>
      )}
    </div>
  );
}
