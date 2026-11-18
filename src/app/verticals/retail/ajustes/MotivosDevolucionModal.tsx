/**
 * MotivosDevolucionModal — Ajustes → Otros Ajustes → Motivos de devolución (specs/2026-11-devoluciones.md §7).
 * Modal para gestionar los motivos del registro de devoluciones: crear, editar el nombre, activar/inactivar y eliminar.
 * Reglas: lista en orden alfabético; "Producto defectuoso" es fijo (no se edita, inactiva ni elimina); nombre de 4 a 25
 * caracteres y sin repetir; un motivo ya usado no se elimina (solo se inactiva); los inactivos no se ofrecen al registrar
 * pero se conservan en las devoluciones ya hechas. Sin límite de cantidad. Permiso (sin efecto): "Editar Perfil de la Empresa".
 */
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Check, Lock, Pencil, Trash2, X } from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import { Toggle } from '../../../components/items/Toggle';
import type { MotivoDevolucion } from '../../../types/devolucion';

const FONT = "'Montserrat', sans-serif";
const MSG_LARGO = 'El nombre debe tener entre 4 y 25 caracteres.';
const MSG_DUPLICADO = 'Ya existe un motivo con este nombre.';
const MSG_USADO = 'Este motivo ya se usó en devoluciones. Puedes inactivarlo.';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function MotivosDevolucionModal({ onClose }: { onClose: () => void }) {
  const { ajustes, updateAjustes } = useAjustes();
  const { devoluciones } = useDevoluciones();
  const [nuevo, setNuevo] = useState('');
  const [errorNuevo, setErrorNuevo] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState('');
  const [errorEdicion, setErrorEdicion] = useState('');
  const [aEliminar, setAEliminar] = useState<MotivoDevolucion | null>(null);
  const [avisoUsado, setAvisoUsado] = useState('');

  const motivos = useMemo(
    () => [...ajustes.motivosDevolucion].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })),
    [ajustes.motivosDevolucion],
  );
  const usado = (id: string) => devoluciones.some(d => d.motivoId === id);

  /** Error del nombre (null si es válido); `ignorarId` deja repetir el propio nombre al editar. */
  const validar = (nombre: string, ignorarId?: string): string | null => {
    const t = nombre.trim();
    if (t.length < 4 || t.length > 25) return MSG_LARGO;
    if (motivos.some(m => m.id !== ignorarId && norm(m.nombre) === norm(t))) return MSG_DUPLICADO;
    return null;
  };

  const cambiar = (fn: (prev: MotivoDevolucion[]) => MotivoDevolucion[]) =>
    updateAjustes(prev => ({ ...prev, motivosDevolucion: fn(prev.motivosDevolucion) }));

  const crear = () => {
    const e = validar(nuevo);
    if (e) { setErrorNuevo(e); return; }
    cambiar(prev => [...prev, { id: `mot-${Date.now()}`, nombre: nuevo.trim(), activo: true }]);
    setNuevo(''); setErrorNuevo('');
    toast.success('Motivo creado correctamente.');
  };

  const guardarEdicion = (m: MotivoDevolucion) => {
    const e = validar(nombreEdicion, m.id);
    if (e) { setErrorEdicion(e); return; }
    cambiar(prev => prev.map(x => (x.id === m.id ? { ...x, nombre: nombreEdicion.trim() } : x)));
    setEditandoId(null); setErrorEdicion('');
    toast.success('Motivo actualizado correctamente.');
  };

  const alternarActivo = (m: MotivoDevolucion) => {
    if (m.fijo) return;
    cambiar(prev => prev.map(x => (x.id === m.id ? { ...x, activo: !x.activo } : x)));
    toast.success('Motivo actualizado correctamente.');
  };

  const pedirEliminar = (m: MotivoDevolucion) => {
    if (m.fijo) return;
    if (usado(m.id)) { setAvisoUsado(m.id); return; }
    setAEliminar(m);
  };

  const confirmarEliminar = () => {
    if (!aEliminar) return;
    cambiar(prev => prev.filter(x => x.id !== aEliminar.id));
    setAEliminar(null);
    toast.success('Motivo eliminado correctamente.');
  };

  const iconBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 6, color: 'var(--blue-60)' };

  return (
    <>
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div
          role="dialog" aria-modal="true" aria-label="Motivos de devolución" className="bg-white rounded-[var(--radius-20)] w-full mx-4"
          style={{ maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 8px' }}>
            <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Motivos de devolución</h3>
            <button onClick={onClose} aria-label="Cerrar" style={{ ...iconBtn, color: 'var(--black-60)' }}><X size={20} /></button>
          </div>
          <p style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-60)', margin: '0 28px 12px' }}>
            Estos son los motivos que se ofrecen al registrar una devolución. Los inactivos no aparecen al registrar, pero se conservan en las devoluciones ya hechas.
          </p>

          {/* Crear */}
          <div style={{ padding: '0 28px 12px' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="merlin-input-filled" value={nuevo} placeholder="Nombre del nuevo motivo" aria-label="Nombre del nuevo motivo"
                onChange={e => { setNuevo(e.target.value); setErrorNuevo(''); }} onKeyDown={e => { if (e.key === 'Enter') crear(); }}
                style={{ flex: 1, minWidth: 0 }}
              />
              <button className="btn btn-primary" onClick={crear}>Crear motivo</button>
            </div>
            {errorNuevo && <p role="alert" style={{ fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '6px 0 0' }}>{errorNuevo}</p>}
          </div>

          {/* Lista */}
          <ul style={{ listStyle: 'none', margin: 0, padding: '0 28px', overflowY: 'auto', flex: 1 }}>
            {motivos.map(m => {
              const editando = editandoId === m.id;
              return (
                <li key={m.id} style={{ borderTop: '1px solid var(--black-10)', padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {editando ? (
                      <input
                        className="merlin-input-filled" autoFocus value={nombreEdicion} aria-label={`Nombre del motivo ${m.nombre}`}
                        onChange={e => { setNombreEdicion(e.target.value); setErrorEdicion(''); }}
                        onKeyDown={e => { if (e.key === 'Enter') guardarEdicion(m); if (e.key === 'Escape') setEditandoId(null); }}
                        style={{ flex: 1, minWidth: 0 }}
                      />
                    ) : (
                      <span style={{ flex: 1, minWidth: 0, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: m.activo ? 'var(--black-100)' : 'var(--black-40)', overflowWrap: 'anywhere' }}>
                        {m.nombre}
                        {m.fijo && <span title="Motivo fijo: no se puede editar, inactivar ni eliminar" style={{ marginLeft: 8, display: 'inline-flex', verticalAlign: 'middle' }}><Lock size={13} color="var(--black-40)" /></span>}
                        {!m.activo && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: 'var(--black-60)' }}>Inactivo</span>}
                      </span>
                    )}

                    {editando ? (
                      <>
                        <button style={{ ...iconBtn, color: '#1b8959' }} aria-label="Guardar" onClick={() => guardarEdicion(m)}><Check size={18} /></button>
                        <button style={iconBtn} aria-label="Cancelar edición" onClick={() => { setEditandoId(null); setErrorEdicion(''); }}><X size={18} /></button>
                      </>
                    ) : (
                      <>
                        <Toggle size="sm" checked={m.activo} disabled={m.fijo} onChange={() => alternarActivo(m)} ariaLabel={`${m.activo ? 'Inactivar' : 'Activar'} ${m.nombre}`} />
                        <button style={{ ...iconBtn, opacity: m.fijo ? 0.35 : 1, cursor: m.fijo ? 'not-allowed' : 'pointer' }} aria-label={`Editar ${m.nombre}`} disabled={m.fijo}
                          onClick={() => { setEditandoId(m.id); setNombreEdicion(m.nombre); setErrorEdicion(''); setAvisoUsado(''); }}><Pencil size={16} /></button>
                        <button style={{ ...iconBtn, opacity: m.fijo ? 0.35 : 1, cursor: m.fijo ? 'not-allowed' : 'pointer' }} aria-label={`Eliminar ${m.nombre}`} disabled={m.fijo}
                          onClick={() => pedirEliminar(m)}><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                  {editando && errorEdicion && <p role="alert" style={{ fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '6px 0 0' }}>{errorEdicion}</p>}
                  {avisoUsado === m.id && <p role="alert" style={{ fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '6px 0 0' }}>{MSG_USADO}</p>}
                </li>
              );
            })}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 28px 24px', borderTop: '1px solid var(--black-10)' }}>
            <button className="btn btn-cancel" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>

      {aEliminar && (
        <ConfirmDeleteModal
          title="¿Eliminar este motivo?" message={`"${aEliminar.nombre}" se eliminará de la lista de motivos.`}
          onCancel={() => setAEliminar(null)} onConfirm={confirmarEliminar}
        />
      )}
    </>
  );
}
