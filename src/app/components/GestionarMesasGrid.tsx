/**
 * GestionarMesasGrid
 * ─────────────────────────────────────────────────────────────────────────────
 * Vista grid de gestión de mesas. 4 columnas, estilo config (sin colores de
 * estado operativo). Drag & drop nativo para reordenar. Panel lateral para
 * editar/crear/eliminar mesas.
 */
import React, { useState, useRef } from 'react';
import { Plus, Pencil, Users, X, Trash2 } from 'lucide-react';
import { useMesas } from '../hooks/useMesas';
import type { Mesa } from '../types/mesa';

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT  = 'var(--font-family, Montserrat, sans-serif)';
const NAVY  = '#121E6C';
const CORAL = '#FF2947';
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
}

function blankEdit(): EditState {
  return { mode: 'new', id: null, nombre: '', zona: 'Salón', capacidad: 4, habilitada: true, confirmDelete: false };
}

function editFromMesa(mesa: Mesa): EditState {
  return {
    mode: 'edit', id: mesa.id, nombre: mesa.nombre, zona: mesa.zona,
    capacidad: mesa.capacidad, habilitada: mesa.habilitada, confirmDelete: false,
  };
}

// ─── GestionarMesasGrid ───────────────────────────────────────────────────────

export function GestionarMesasGrid() {
  const { mesas, updateMesa, addMesa, deleteMesa, reorderMesas } = useMesas();

  // Derive unique zones from mesas (preserves insertion order + adds 'Todas')
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

  // ── Save / Delete ──────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!editPanel || !editPanel.nombre.trim()) return;
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

      {/* ── Toolbar: zone tabs + agregar ── */}
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

      {/* ── Edit panel (overlay + slide-in) ── */}
      {editPanel && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setEditPanel(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)', zIndex: 200,
            }}
          />
          {/* Panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 320,
            background: '#fff', zIndex: 201,
            display: 'flex', flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          }}>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid var(--black-10)', flexShrink: 0,
            }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)', fontFamily: FONT }}>
                {editPanel.mode === 'new' ? 'Nueva mesa' : 'Editar mesa'}
              </span>
              <button onClick={() => setEditPanel(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex',
              }}>
                <X size={18} color="var(--black-60)" />
              </button>
            </div>

            {/* Form */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Nombre */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--black-60)', display: 'block', marginBottom: 6, fontFamily: FONT }}>
                  Nombre de la mesa
                </label>
                <input
                  type="text"
                  value={editPanel.nombre}
                  onChange={e => setEditPanel(p => p ? { ...p, nombre: e.target.value } : p)}
                  placeholder="Ej: Mesa 1"
                  style={{
                    width: '100%', height: 40, borderRadius: 8, border: '1.5px solid var(--black-20)',
                    padding: '0 12px', fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Zona */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--black-60)', display: 'block', marginBottom: 6, fontFamily: FONT }}>
                  Zona
                </label>
                <select
                  value={editPanel.zona}
                  onChange={e => setEditPanel(p => p ? { ...p, zona: e.target.value } : p)}
                  style={{
                    width: '100%', height: 40, borderRadius: 8, border: '1.5px solid var(--black-20)',
                    padding: '0 12px', fontSize: 14, fontFamily: FONT, outline: 'none',
                    background: '#fff', boxSizing: 'border-box', cursor: 'pointer',
                  }}
                >
                  {AVAILABLE_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>

              {/* Capacidad */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--black-60)', display: 'block', marginBottom: 6, fontFamily: FONT }}>
                  Capacidad
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={editPanel.capacidad}
                  onChange={e => setEditPanel(p => p ? {
                    ...p,
                    capacidad: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)),
                  } : p)}
                  style={{
                    width: '100%', height: 40, borderRadius: 8, border: '1.5px solid var(--black-20)',
                    padding: '0 12px', fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Habilitada toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: 'var(--black-80)', fontFamily: FONT }}>Mesa habilitada</span>
                <button
                  onClick={() => setEditPanel(p => p ? { ...p, habilitada: !p.habilitada } : p)}
                  style={{
                    width: 40, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: editPanel.habilitada ? NAVY : 'var(--black-40)',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
                    background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s',
                    left: editPanel.habilitada ? 22 : 2,
                  }} />
                </button>
              </div>

              {/* Delete (edit mode only) */}
              {editPanel.mode === 'edit' && (
                <>
                  <div style={{ height: 1, background: 'var(--black-10)' }} />
                  {editPanel.confirmDelete ? (
                    <div>
                      <p style={{ fontSize: 13, color: 'var(--black-60)', marginBottom: 10, fontFamily: FONT, margin: '0 0 10px' }}>
                        ¿Confirmar eliminación?
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleDelete} style={{
                          flex: 1, height: 36, borderRadius: 8, border: 'none',
                          background: CORAL, color: '#fff', fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', fontFamily: FONT,
                        }}>Sí, eliminar</button>
                        <button onClick={() => setEditPanel(p => p ? { ...p, confirmDelete: false } : p)} style={{
                          flex: 1, height: 36, borderRadius: 8, border: '1.5px solid var(--black-20)',
                          background: '#fff', color: 'var(--black-60)', fontSize: 13,
                          cursor: 'pointer', fontFamily: FONT,
                        }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditPanel(p => p ? { ...p, confirmDelete: true } : p)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: CORAL, fontSize: 14, fontWeight: 600, fontFamily: FONT, padding: 0,
                      }}
                    >
                      <Trash2 size={14} /> Eliminar mesa
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid var(--black-10)', flexShrink: 0,
              display: 'flex', gap: 12,
            }}>
              <button onClick={() => setEditPanel(null)} style={{
                flex: 1, height: 44, borderRadius: 10, border: '1.5px solid var(--black-20)',
                background: '#fff', color: 'var(--black-60)', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: FONT,
              }}>Cancelar</button>
              <button onClick={handleSave} style={{
                flex: 1, height: 44, borderRadius: 10, border: 'none',
                background: NAVY, color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: FONT,
              }}>
                {editPanel.mode === 'new' ? 'Crear mesa' : 'Guardar cambios'}
              </button>
            </div>
          </div>
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
        position:       'relative',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        height:         110,
        padding:        12,
        borderRadius:   12,
        background:     bg,
        border,
        cursor:         'pointer',
        opacity:        dragging ? 0.5 : (mesa.habilitada ? 1 : 0.7),
        transition:     'box-shadow 0.15s ease, transform 0.15s ease, opacity 0.15s ease',
        boxShadow:      hovered && !dragging ? '0 2px 8px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform:      hovered && !dragging ? 'translateY(-1px)' : 'translateY(0)',
        gap:            4,
      }}
    >
      {/* Pencil icon on hover */}
      {hovered && !dragging && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 24, height: 24, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Pencil size={12} color="var(--black-60)" />
        </div>
      )}

      {/* Name */}
      <span style={{
        fontSize: 18, fontWeight: 700, color: nameColor,
        fontFamily: FONT, lineHeight: '22px', marginBottom: 4,
      }}>
        {mesa.nombre}
      </span>

      {/* Capacity (enabled only) */}
      {mesa.habilitada && (
        <span style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: '#606060', fontFamily: FONT,
        }}>
          <Users size={12} color="#606060" />
          {mesa.capacidad}
        </span>
      )}

      {/* Disabled label */}
      {!mesa.habilitada && (
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.5px',
          color: '#AAAAAA', fontFamily: FONT, textTransform: 'uppercase',
        }}>
          Inhabilitada
        </span>
      )}
    </div>
  );
}
