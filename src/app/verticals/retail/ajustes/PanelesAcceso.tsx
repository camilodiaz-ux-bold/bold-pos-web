/**
 * PanelesAcceso — Usuarios y Roles (specs/2026-10-ajustes.md §4.5, fase 3).
 * Las contraseñas solo se validan: el prototipo no las guarda. Los roles no restringen la navegación (§9).
 */
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAjustes } from '../../../store/ajustesStore';
import { Toggle } from '../../../components/items/Toggle';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import { PERMISOS_CATALOGO, TODOS_LOS_PERMISOS, etiquetaGrupo } from '../../../data/permisosCatalogo';
import { EMAIL_RE } from '../../../utils/ajustes';
import type { Rol, UsuarioAjustes } from '../../../types/ajustes';
import {
  AccionesFila, BotonNuevo, FONT, FooterDerecho, FooterForm, FooterLista, FormRow, REQUERIDO, SidePanel, inputErr, td, th,
} from './PanelUi';

interface PanelProps { onClose: () => void }

// ─── Usuarios ────────────────────────────────────────────────────────────────

interface FormUsuario {
  sucursalId: string; inventario: string[]; nombre: string; apellido: string; correo: string;
  password: string; confirmar: string; rolId: string; activo: boolean;
}
const VACIO: FormUsuario = { sucursalId: '', inventario: [], nombre: '', apellido: '', correo: '', password: '', confirmar: '', rolId: '', activo: true };

const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function UsuariosPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const [editando, setEditando] = useState<{ id: string | null } | null>(null);
  const [form, setForm] = useState<FormUsuario>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<keyof FormUsuario, string>>>({});
  const [aEliminar, setAEliminar] = useState<UsuarioAjustes | null>(null);

  const set = <K extends keyof FormUsuario>(k: K) => (v: FormUsuario[K]) => setForm(f => ({ ...f, [k]: v }));
  const nombreRol = (id: string) => ajustes.roles.find(r => r.id === id)?.nombre ?? '—';

  const abrir = (u: UsuarioAjustes | null) => {
    setForm(u ? {
      sucursalId: u.sucursalId, inventario: u.inventarioSucursalIds, nombre: u.nombre, apellido: u.apellido, correo: u.correo,
      password: '', confirmar: '', rolId: u.rolId, activo: u.activo,
    } : VACIO);
    setErrores({});
    setEditando({ id: u?.id ?? null });
  };

  const guardar = () => {
    const e: typeof errores = {};
    const correo = form.correo.trim();
    if (!form.sucursalId) e.sucursalId = REQUERIDO;
    if (form.inventario.length === 0) e.inventario = 'Elige al menos una sucursal';
    if (!form.nombre.trim()) e.nombre = REQUERIDO;
    if (!correo) e.correo = REQUERIDO;
    else if (!EMAIL_RE.test(correo)) e.correo = 'Ingresa un correo válido';
    else if (ajustes.usuarios.some(u => u.correo.toLowerCase() === correo.toLowerCase() && u.id !== editando?.id)) e.correo = 'Ya existe un usuario con este correo';
    const pedirClave = !editando?.id || form.password !== '' || form.confirmar !== '';
    if (pedirClave) {
      if (!form.password) e.password = REQUERIDO;
      else if (!PASSWORD_RE.test(form.password)) e.password = 'Mínimo 8 caracteres, con un carácter especial, una mayúscula y un número';
      if (!form.confirmar) e.confirmar = REQUERIDO;
      else if (form.confirmar !== form.password) e.confirmar = 'Las contraseñas no coinciden';
    }
    if (!form.rolId) e.rolId = REQUERIDO;
    setErrores(e);
    if (Object.keys(e).length) return;
    const datos = {
      nombre: form.nombre.trim(), apellido: form.apellido.trim(), correo, rolId: form.rolId, sucursalId: form.sucursalId,
      inventarioSucursalIds: form.inventario, activo: form.activo,
    };
    updateAjustes(prev => ({
      ...prev,
      usuarios: editando?.id
        ? prev.usuarios.map(u => (u.id === editando.id ? { ...u, ...datos } : u))
        : [...prev.usuarios, { id: `usr-${Date.now()}`, ...datos }],
    }));
    toast.success(editando?.id ? 'Usuario actualizado' : 'Usuario creado');
    setEditando(null);
  };

  const eliminar = () => {
    if (!aEliminar) return;
    updateAjustes(prev => ({ ...prev, usuarios: prev.usuarios.filter(u => u.id !== aEliminar.id) }));
    toast.success('Usuario eliminado');
    setAEliminar(null);
  };

  const toggleSucursal = (id: string) =>
    set('inventario')(form.inventario.includes(id) ? form.inventario.filter(x => x !== id) : [...form.inventario, id]);

  return (
    <>
      <SidePanel
        variant="left" title="Usuarios" onClose={editando ? () => setEditando(null) : onClose}
        subtitle="Usuarios que tendrán acceso al sistema dependiendo sus roles asignados."
        footer={editando ? <FooterForm onCancel={() => setEditando(null)} onSave={guardar} /> : <FooterLista onCancel={onClose} />}
      >
        {editando ? (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <FormRow label="Sucursal" required error={errores.sucursalId}>
              <select className="merlin-input-filled" style={inputErr(errores.sucursalId)} value={form.sucursalId} onChange={e => set('sucursalId')(e.target.value)}>
                <option value="" disabled>Selecciona...</option>
                {ajustes.sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </FormRow>
            <FormRow label="Acceso a inventarios de" required error={errores.inventario}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>
                {ajustes.sucursales.map(s => (
                  <label key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 13, color: 'var(--black-60)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.inventario.includes(s.id)} onChange={() => toggleSucursal(s.id)}
                      style={{ width: 16, height: 16, accentColor: 'var(--coral-100)' }} />
                    {s.nombre}
                  </label>
                ))}
              </div>
            </FormRow>
            <FormRow label="Nombre" required error={errores.nombre}>
              <input className="merlin-input-filled" style={inputErr(errores.nombre)} placeholder="Ingresa nombre" value={form.nombre} onChange={e => set('nombre')(e.target.value)} />
            </FormRow>
            <FormRow label="Apellido">
              <input className="merlin-input-filled" placeholder="Ingresa apellido" value={form.apellido} onChange={e => set('apellido')(e.target.value)} />
            </FormRow>
            <FormRow label="Correo" required error={errores.correo}>
              <input className="merlin-input-filled" style={inputErr(errores.correo)} type="email" placeholder="Ingresa correo" value={form.correo} onChange={e => set('correo')(e.target.value)} />
            </FormRow>
            <FormRow label="Contraseña" required={!editando.id} error={errores.password}
              helper={errores.password ? undefined : 'Debe contener como mínimo 8 caracteres, incluyendo un carácter especial, una mayúscula y un número'}>
              <input className="merlin-input-filled" style={inputErr(errores.password)} type="password" autoComplete="new-password" placeholder="Ingresa contraseña"
                value={form.password} onChange={e => set('password')(e.target.value)} />
            </FormRow>
            <FormRow label="Confirmar Contraseña" required={!editando.id} error={errores.confirmar}>
              <input className="merlin-input-filled" style={inputErr(errores.confirmar)} type="password" autoComplete="new-password" placeholder="Ingresa contraseña"
                value={form.confirmar} onChange={e => set('confirmar')(e.target.value)} />
            </FormRow>
            <FormRow label="Rol" required error={errores.rolId}>
              <select className="merlin-input-filled" style={inputErr(errores.rolId)} value={form.rolId} onChange={e => set('rolId')(e.target.value)}>
                <option value="" disabled>Buscar...</option>
                {ajustes.roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </FormRow>
            <FormRow label="Activo">
              <input type="checkbox" checked={form.activo} onChange={e => set('activo')(e.target.checked)}
                style={{ width: 16, height: 16, marginTop: 14, accentColor: 'var(--coral-100)' }} aria-label="Activo" />
            </FormRow>
          </div>
        ) : (
          <>
            <BotonNuevo onClick={() => abrir(null)} />
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Nombre</th><th style={th}>Apellido</th><th style={th}>Correo</th><th style={th}>Rol</th><th style={th}>Estado</th>
                  <th style={{ ...th, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ajustes.usuarios.map(u => (
                  <tr key={u.id}>
                    <td style={td}>{u.nombre}</td><td style={td}>{u.apellido}</td><td style={td}>{u.correo}</td><td style={td}>{nombreRol(u.rolId)}</td>
                    <td style={td}>
                      <span style={{
                        display: 'inline-block', padding: '2px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                        backgroundColor: u.activo ? 'var(--green-10, #E6F6EE)' : 'var(--black-10)', color: u.activo ? 'var(--green-100, #1F8F5F)' : 'var(--black-60)',
                      }}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <AccionesFila soloEditar={u.principal} onEditar={() => abrir(u)} onEliminar={() => setAEliminar(u)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </SidePanel>
      {aEliminar && (
        <ConfirmDeleteModal title="Eliminar usuario" message={`¿Eliminar a "${aEliminar.nombre} ${aEliminar.apellido}"? Perderá el acceso al sistema.`}
          onCancel={() => setAEliminar(null)} onConfirm={eliminar} />
      )}
    </>
  );
}

// ─── Roles ───────────────────────────────────────────────────────────────────

const cardGrupo: React.CSSProperties = {
  breakInside: 'avoid', backgroundColor: 'var(--black-0)', borderRadius: 'var(--radius-12)', boxShadow: 'var(--shadow-4)',
  padding: '12px 16px', marginBottom: 16,
};

function FilaPermiso({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--black-10)' }}>
      <Toggle size="sm" checked={checked} onChange={onChange} ariaLabel={label} />
      <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--blue-100)', lineHeight: '16px' }}>{label}</span>
    </div>
  );
}

export function RolesPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const [editando, setEditando] = useState<{ id: string | null } | null>(null);
  const [nombre, setNombre] = useState('');
  const [permisos, setPermisos] = useState<string[]>([]);
  const [listaIds, setListaIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [aEliminar, setAEliminar] = useState<Rol | null>(null);

  const abrir = (r: Rol | null) => {
    setNombre(r?.nombre ?? '');
    setPermisos(r?.permisos ?? []);
    setListaIds(r ? ajustes.listasPrecios.filter(l => l.rolIds.includes(r.id)).map(l => l.id) : []);
    setError('');
    setEditando({ id: r?.id ?? null });
  };

  const todos = permisos.length === TODOS_LOS_PERMISOS.length;
  const setPermiso = (id: string, on: boolean) =>
    setPermisos(p => (on ? [...p, id] : p.filter(x => x !== id)));

  const guardar = () => {
    const n = nombre.trim();
    if (!n) { setError(REQUERIDO); return; }
    if (ajustes.roles.some(r => r.nombre.toLowerCase() === n.toLowerCase() && r.id !== editando?.id)) { setError('Ya existe un rol con este nombre'); return; }
    const id = editando?.id ?? `rol-${Date.now()}`;
    updateAjustes(prev => ({
      ...prev,
      roles: editando?.id
        ? prev.roles.map(r => (r.id === id ? { ...r, nombre: n, permisos } : r))
        : [...prev.roles, { id, nombre: n, permisos }],
      listasPrecios: prev.listasPrecios.map(l => {
        const sin = l.rolIds.filter(x => x !== id);
        return { ...l, rolIds: listaIds.includes(l.id) ? [...sin, id] : sin };
      }),
    }));
    toast.success(editando?.id ? 'Rol actualizado' : 'Rol creado');
    setEditando(null);
  };

  const intentarEliminar = (r: Rol) => {
    if (ajustes.usuarios.some(u => u.rolId === r.id)) { toast.error('Este rol está asignado a usuarios: reasígnalos antes de eliminarlo'); return; }
    setAEliminar(r);
  };

  const eliminar = () => {
    if (!aEliminar) return;
    updateAjustes(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r.id !== aEliminar.id),
      listasPrecios: prev.listasPrecios.map(l => ({ ...l, rolIds: l.rolIds.filter(x => x !== aEliminar.id) })),
    }));
    toast.success('Rol eliminado');
    setAEliminar(null);
  };

  return (
    <>
      <SidePanel
        variant="right" width={1160} title={editando ? (editando.id ? 'Actualizar rol' : 'Crear rol') : 'Roles'}
        onClose={editando ? () => setEditando(null) : onClose}
        footer={editando
          ? <FooterDerecho onCancel={() => setEditando(null)} onSave={guardar} saveLabel={editando.id ? 'Guardar' : 'Crear'} canSave={!!nombre.trim()} />
          : <FooterDerecho onCancel={onClose} onSave={() => abrir(null)} saveLabel="Nuevo" />}
      >
        {editando ? (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, borderBottom: '1px solid var(--black-10)', paddingBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'var(--blue-100)', marginBottom: 6 }}>Nombre <span style={{ color: 'var(--coral-100)' }}>*</span></label>
                <input className="merlin-input-filled" style={inputErr(error)} placeholder="Nombre del rol" value={nombre}
                  onChange={e => { setNombre(e.target.value); setError(''); }} />
                {error && <p style={{ fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' }}>{error}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'var(--blue-100)' }}>Todos los accesos</span>
                <Toggle checked={todos} onChange={v => setPermisos(v ? [...TODOS_LOS_PERMISOS] : [])} ariaLabel="Todos los accesos" />
              </div>
            </div>
            {PERMISOS_CATALOGO.map(sec => (
              <section key={sec.nombre} style={{ marginTop: 20 }}>
                <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: 'var(--blue-100)', margin: '0 0 12px' }}>{sec.nombre}</h3>
                <div style={{ columnCount: 3, columnGap: 16 }}>
                  {sec.grupos.map(g => (
                    <div key={g.nombre} style={cardGrupo}>
                      <h4 style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--black-100)', margin: '0 0 6px' }}>{etiquetaGrupo(g.nombre)}</h4>
                      {g.permisos.map(p => (
                        <FilaPermiso key={p.id} label={p.label} checked={permisos.includes(p.id)} onChange={v => setPermiso(p.id, v)} />
                      ))}
                    </div>
                  ))}
                  {sec.nombre === 'Productos' && (
                    <div style={cardGrupo}>
                      <h4 style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--black-100)', margin: '0 0 6px' }}>Listas de precios asociadas al rol</h4>
                      {ajustes.listasPrecios.map(l => (
                        <FilaPermiso key={l.id} label={l.nombre} checked={listaIds.includes(l.id)}
                          onChange={v => setListaIds(ids => (v ? [...ids, l.id] : ids.filter(x => x !== l.id)))} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Nombre del rol</th><th style={{ ...th, textAlign: 'right' }}>Acciones</th></tr></thead>
              <tbody>
                {ajustes.roles.map(r => (
                  <tr key={r.id}>
                    <td style={td}>{r.nombre}</td>
                    <td style={{ ...td, textAlign: 'right' }}><AccionesFila onEditar={() => abrir(r)} onEliminar={() => intentarEliminar(r)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </SidePanel>
      {aEliminar && (
        <ConfirmDeleteModal title="Eliminar rol" message={`¿Eliminar el rol "${aEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onCancel={() => setAEliminar(null)} onConfirm={eliminar} />
      )}
    </>
  );
}
