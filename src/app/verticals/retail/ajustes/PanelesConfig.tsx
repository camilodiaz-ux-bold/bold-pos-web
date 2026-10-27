/**
 * PanelesConfig — paneles de Ajustes de configuración (specs/2026-10-ajustes.md §4):
 * Métodos de pago, Categorías de gastos, Tipos de costeo, Impuestos e Integraciones.
 */
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Check, CreditCard, Link2 } from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import { Toggle } from '../../../components/items/Toggle';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import type { CategoriaGasto, IntegracionId, MetodoPago, TipoCosteo } from '../../../types/ajustes';
import { fmtTasa } from '../../../utils/ajustes';
import {
  AccionesFila, BotonNuevo, FONT, FooterDerecho, FooterForm, FooterLista, REQUERIDO, SidePanel, td, th,
} from './PanelUi';

interface PanelProps { onClose: () => void }

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--blue-100)', marginBottom: 6 };
const helperStyle: React.CSSProperties = { fontFamily: FONT, fontSize: 11, color: 'var(--black-40)', margin: '4px 0 0' };
const errorStyle: React.CSSProperties = { fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' };

// ─── Métodos de pago ─────────────────────────────────────────────────────────

export function MetodosPagoPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const [sub, setSub] = useState<{ id: string | null } | null>(null);
  const [aEliminar, setAEliminar] = useState<MetodoPago | null>(null);
  const [nombre, setNombre] = useState('');
  const [habilitado, setHabilitado] = useState(true);
  const [error, setError] = useState('');

  const abrir = (m: MetodoPago | null) => {
    setNombre(m?.nombre ?? '');
    setHabilitado(m?.habilitado ?? true);
    setError('');
    setSub({ id: m?.id ?? null });
  };

  const guardar = () => {
    const n = nombre.trim();
    if (!n) { setError(REQUERIDO); return; }
    if (ajustes.metodosPago.some(m => m.nombre.toLowerCase() === n.toLowerCase() && m.id !== sub?.id)) {
      setError('Ya existe un método de pago con este nombre');
      return;
    }
    updateAjustes(prev => ({
      ...prev,
      metodosPago: sub?.id
        ? prev.metodosPago.map(m => (m.id === sub.id ? { ...m, nombre: n, habilitado } : m))
        : [...prev.metodosPago, { id: `mp-${Date.now()}`, nombre: n, habilitado, porDefecto: false }],
    }));
    toast.success(sub?.id ? 'Método de pago actualizado' : 'Método de pago agregado');
    setSub(null);
  };

  const toggle = (id: string, v: boolean) =>
    updateAjustes(prev => ({ ...prev, metodosPago: prev.metodosPago.map(m => (m.id === id ? { ...m, habilitado: v } : m)) }));

  const eliminar = () => {
    if (!aEliminar) return;
    updateAjustes(prev => ({ ...prev, metodosPago: prev.metodosPago.filter(m => m.id !== aEliminar.id) }));
    toast.success('Método de pago eliminado');
    setAEliminar(null);
  };

  return (
    <>
      <SidePanel
        variant="left" title="Métodos de pago" onClose={onClose}
        subtitle="Métodos de pago utilizados al momento de pagar una Venta/Compra."
        footer={<FooterLista onCancel={onClose} />}
      >
        <BotonNuevo onClick={() => abrir(null)} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Nombre</th><th style={{ ...th, textAlign: 'right' }}>Acciones</th></tr></thead>
          <tbody>
            {ajustes.metodosPago.map(m => (
              <tr key={m.id}>
                <td style={td}>{m.nombre}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                    <Toggle size="sm" checked={m.habilitado} onChange={v => toggle(m.id, v)} ariaLabel={`Habilitar ${m.nombre}`} />
                    <AccionesFila bloqueada={m.porDefecto} onEditar={() => abrir(m)} onEliminar={() => setAEliminar(m)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SidePanel>

      {sub && (
        <SidePanel
          variant="right" title={sub.id ? 'Edita el método de pago' : 'Agrega un nuevo método de pago'} onClose={() => setSub(null)}
          footer={<FooterDerecho onCancel={() => setSub(null)} onSave={guardar} canSave={!!nombre.trim()} saveLabel={sub.id ? 'Guardar cambios' : 'Agregar método'} />}
        >
          <label style={labelStyle}>Nombre<span style={{ color: 'var(--coral-100)' }}> *</span></label>
          <input className="merlin-input-filled" placeholder="Escribe un nombre fácil de recordar" value={nombre}
            style={error ? { borderColor: 'var(--coral-100)' } : undefined}
            onChange={e => { setNombre(e.target.value); setError(''); }} />
          {error ? <p style={errorStyle}>{error}</p> : <p style={helperStyle}>Usa este método de pago cuando hagas una venta o una compra</p>}
          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>Habilitar método de pago</label>
            <Toggle checked={habilitado} onChange={setHabilitado} ariaLabel="Habilitar método de pago" />
          </div>
        </SidePanel>
      )}
      {aEliminar && (
        <ConfirmDeleteModal title="Eliminar método de pago" message={`¿Eliminar "${aEliminar.nombre}"? Las facturas ya registradas conservan su método.`}
          onCancel={() => setAEliminar(null)} onConfirm={eliminar} />
      )}
    </>
  );
}

// ─── Categorías de gastos ────────────────────────────────────────────────────

export function CategoriasGastosPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const [sub, setSub] = useState<{ id: string | null } | null>(null);
  const [aEliminar, setAEliminar] = useState<CategoriaGasto | null>(null);
  const [nombre, setNombre] = useState('');
  const [padreId, setPadreId] = useState('');
  const [error, setError] = useState('');

  // Orden jerárquico: cada principal seguida de sus subcategorías.
  const filas = useMemo(() => {
    const principales = ajustes.categoriasGastos.filter(c => !c.padreId);
    return principales.flatMap(p => [
      { cat: p, nivel: 0 },
      ...ajustes.categoriasGastos.filter(c => c.padreId === p.id).map(c => ({ cat: c, nivel: 1 })),
    ]);
  }, [ajustes.categoriasGastos]);

  const tieneHijas = (id: string | null) => !!id && ajustes.categoriasGastos.some(c => c.padreId === id);
  const opcionesPadre = ajustes.categoriasGastos.filter(c => !c.padreId && c.id !== sub?.id);

  const abrir = (c: CategoriaGasto | null) => {
    setNombre(c?.nombre ?? '');
    setPadreId(c?.padreId ?? '');
    setError('');
    setSub({ id: c?.id ?? null });
  };

  const guardar = () => {
    const n = nombre.trim();
    if (!n) { setError(REQUERIDO); return; }
    if (ajustes.categoriasGastos.some(c => c.nombre.toLowerCase() === n.toLowerCase() && (c.padreId ?? '') === padreId && c.id !== sub?.id)) {
      setError('Ya existe una categoría con este nombre en ese grupo');
      return;
    }
    updateAjustes(prev => ({
      ...prev,
      categoriasGastos: sub?.id
        ? prev.categoriasGastos.map(c => (c.id === sub.id ? { ...c, nombre: n, padreId: padreId || null } : c))
        : [...prev.categoriasGastos, { id: `cg-${Date.now()}`, nombre: n, padreId: padreId || null }],
    }));
    toast.success(sub?.id ? 'Categoría actualizada' : 'Categoría agregada');
    setSub(null);
  };

  const eliminar = () => {
    if (!aEliminar) return;
    updateAjustes(prev => ({
      ...prev,
      categoriasGastos: prev.categoriasGastos.filter(c => c.id !== aEliminar.id && c.padreId !== aEliminar.id),
    }));
    toast.success('Categoría eliminada');
    setAEliminar(null);
  };

  return (
    <>
      <SidePanel variant="left" title="Categorías de Gastos" onClose={onClose} footer={<FooterLista onCancel={onClose} />}>
        <BotonNuevo onClick={() => abrir(null)} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Nombre</th><th style={{ ...th, textAlign: 'right' }}>Acciones</th></tr></thead>
          <tbody>
            {filas.map(({ cat, nivel }) => (
              <tr key={cat.id}>
                <td style={{ ...td, paddingLeft: nivel ? 24 : 8 }}>{nivel ? '- ' : ''}{cat.nombre}</td>
                <td style={{ ...td, textAlign: 'right' }}><AccionesFila onEditar={() => abrir(cat)} onEliminar={() => setAEliminar(cat)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SidePanel>

      {sub && (
        <SidePanel
          variant="right" title={sub.id ? 'Edita la categoría de gasto' : 'Agrega una nueva categoría de gasto'} onClose={() => setSub(null)}
          footer={<FooterDerecho onCancel={() => setSub(null)} onSave={guardar} canSave={!!nombre.trim()} saveLabel={sub.id ? 'Guardar cambios' : 'Agregar categoría'} />}
        >
          <label style={labelStyle}>Nombre de la categoría<span style={{ color: 'var(--coral-100)' }}> *</span></label>
          <input className="merlin-input-filled" placeholder="Escribe un nombre fácil de recordar" value={nombre}
            style={error ? { borderColor: 'var(--coral-100)' } : undefined}
            onChange={e => { setNombre(e.target.value); setError(''); }} />
          {error ? <p style={errorStyle}>{error}</p> : <p style={helperStyle}>Ej. Transporte de empleados, Empaque, Mantenimiento</p>}
          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>Categoría principal (Opcional)</label>
            <select className="merlin-input-filled" value={padreId} disabled={tieneHijas(sub.id)} onChange={e => setPadreId(e.target.value)}>
              <option value="">Categorías</option>
              {opcionesPadre.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <p style={helperStyle}>
              {tieneHijas(sub.id)
                ? 'Esta categoría ya tiene subcategorías, por eso no puede colgar de otra.'
                : 'Agrúpala bajo una categoría existente para organizar mejor tus gastos'}
            </p>
          </div>
        </SidePanel>
      )}
      {aEliminar && (
        <ConfirmDeleteModal
          title="Eliminar categoría"
          message={tieneHijas(aEliminar.id)
            ? `¿Eliminar "${aEliminar.nombre}" y sus subcategorías? Esta acción no se puede deshacer.`
            : `¿Eliminar "${aEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onCancel={() => setAEliminar(null)} onConfirm={eliminar}
        />
      )}
    </>
  );
}

// ─── Tipos de costeo ─────────────────────────────────────────────────────────

const COSTEOS: { value: TipoCosteo; titulo: string; texto: string }[] = [
  { value: 'promedio', titulo: 'Costo promedio', texto: 'Se determina un promedio, sumando los valores existentes en el inventario con los valores de las nuevas compras.' },
  { value: 'ultimo', titulo: 'Último precio', texto: 'Se toma el precio de costo de la última compra o entrada que se realizó en el inventario como el precio de costo actual del producto.' },
];

export function TiposCosteoPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const [tipo, setTipo] = useState<TipoCosteo>(ajustes.tipoCosteo);

  const guardar = () => {
    updateAjustes(prev => ({ ...prev, tipoCosteo: tipo }));
    toast.success('Tipo de costeo guardado');
    onClose();
  };

  return (
    <SidePanel
      variant="left" title="Tipo de costeo" onClose={onClose}
      subtitle="Elige el método de costeo que mejor se adapte a tu empresa."
      footer={<FooterForm onCancel={onClose} onSave={guardar} canSave={tipo !== ajustes.tipoCosteo} />}
    >
      <div role="radiogroup" aria-label="Tipo de costeo" style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {COSTEOS.map(c => {
          const on = tipo === c.value;
          return (
            <button
              key={c.value} type="button" role="radio" aria-checked={on} onClick={() => setTipo(c.value)}
              style={{ flex: 1, minWidth: 240, display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1, boxSizing: 'border-box',
                border: `1.5px solid ${on ? 'var(--coral-100)' : 'var(--blue-40)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {on && <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--coral-100)' }} />}
              </span>
              <span>
                <span style={{ display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--black-100)' }}>{c.titulo}</span>
                <span style={{ display: 'block', fontFamily: FONT, fontSize: 12, color: 'var(--black-60)', marginTop: 4, lineHeight: '17px' }}>{c.texto}</span>
              </span>
            </button>
          );
        })}
      </div>
    </SidePanel>
  );
}

// ─── Impuestos (solo lectura) ────────────────────────────────────────────────

export function ImpuestosPanel({ onClose }: PanelProps) {
  const { ajustes } = useAjustes();
  return (
    <SidePanel
      variant="left" title="Impuestos" onClose={onClose}
      subtitle="Impuestos que aplica tu negocio al momento de facturar."
      footer={<FooterLista onCancel={onClose} />}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Nombre</th><th style={th}>Tipo</th><th style={th}>Tarifa</th></tr></thead>
        <tbody>
          {ajustes.impuestos.map(i => (
            <tr key={i.id}><td style={td}>{i.nombre}</td><td style={td}>{i.tipo}</td><td style={td}>{fmtTasa(i.tarifa)}</td></tr>
          ))}
        </tbody>
      </table>
    </SidePanel>
  );
}

// ─── Integraciones ───────────────────────────────────────────────────────────

const INTEGRACIONES: Record<IntegracionId, {
  titulo: string; descripcion: string; conectado: string; desconectado: string; texto: string; icon: React.ReactNode;
}> = {
  smartPro: {
    titulo: 'Integra para vender con tu datáfono Bold Smart PRO',
    descripcion: 'Registra automáticamente en Bold POS las ventas realizadas desde tu datáfono Smart PRO.',
    conectado: '¡Tu datáfono Smart PRO está conectado!', desconectado: 'Tu datáfono Smart PRO no está conectado',
    texto: 'Todas las ventas que procesas con tu datáfono Smart PRO se registran al instante en Bold POS.',
    icon: <CreditCard size={44} color="var(--blue-100)" strokeWidth={1.4} />,
  },
  linkPago: {
    titulo: 'Integra y cobra con Link de pago Bold',
    descripcion: 'Genera links de pago para tus cotizaciones.',
    conectado: '¡Tu Link de pago Bold está conectado!', desconectado: 'Tu Link de pago Bold no está conectado',
    texto: 'Activa en tus presupuestos y facturas de venta links de pago que tus clientes pueden usar para pagar al instante.',
    icon: <Link2 size={44} color="var(--blue-100)" strokeWidth={1.4} />,
  },
};

function Estado({ activa }: { activa: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 11, color: 'var(--black-60)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: activa ? 'var(--green-100, #2BB673)' : 'var(--black-40)' }} />
      {activa ? 'Integración activa' : 'Integración inactiva'}
    </span>
  );
}

export function IntegracionesPanel({ onClose }: PanelProps) {
  const { ajustes, updateAjustes } = useAjustes();
  const [detalle, setDetalle] = useState<IntegracionId | null>(null);

  const setActiva = (id: IntegracionId, activa: boolean) => {
    updateAjustes(prev => ({ ...prev, integraciones: { ...prev.integraciones, [id]: { ...prev.integraciones[id], activa } } }));
    toast.success(activa ? 'Integración habilitada' : 'Integración deshabilitada');
  };

  if (detalle) {
    const cfg = INTEGRACIONES[detalle];
    const it = ajustes.integraciones[detalle];
    return (
      <SidePanel
        variant="right" title={it.activa ? cfg.conectado : cfg.desconectado} onClose={() => setDetalle(null)}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '16px 32px' }}>
            <button
              type="button" onClick={() => setActiva(detalle, !it.activa)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--coral-100)' }}
            >
              {it.activa ? 'Deshabilitar integración' : 'Habilitar integración'}
            </button>
            <button type="button" onClick={() => setDetalle(null)} className="btn btn-primary" style={{ borderRadius: 999, minWidth: 120, height: 40, fontSize: 13 }}>Salir</button>
          </div>
        }
      >
        <button type="button" onClick={() => setDetalle(null)} aria-label="Volver" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', marginBottom: 8 }}>
          <ChevronLeft size={20} color="var(--blue-100)" />
        </button>
        <p style={{ fontFamily: FONT, fontSize: 12, color: 'var(--black-60)', margin: '0 0 24px' }}>{cfg.texto}</p>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 28px' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: 'var(--blue-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {cfg.icon}
            {it.activa && (
              <span style={{ position: 'absolute', right: 4, top: 4, width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--green-100, #2BB673)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={16} color="var(--black-0)" strokeWidth={3} />
              </span>
            )}
          </div>
        </div>
        <label style={labelStyle}>Llave de integración <span style={{ color: 'var(--coral-100)' }}>*</span></label>
        <input className="merlin-input-filled" readOnly value={it.llave} aria-label="Llave de integración" />
        <div style={{ marginTop: 10 }}><Estado activa={it.activa} /></div>
      </SidePanel>
    );
  }

  return (
    <SidePanel
      variant="right" title="Integraciones disponibles" onClose={onClose}
      subtitle="Conecta y simplifica tus cobros en Bold POS"
      footer={<FooterDerecho onCancel={onClose} hideSave />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(Object.keys(INTEGRACIONES) as IntegracionId[]).map(id => {
          const cfg = INTEGRACIONES[id];
          return (
            <button
              key={id} type="button" onClick={() => setDetalle(id)}
              className="hover:bg-[var(--blue-20)] transition-colors"
              style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%', cursor: 'pointer', border: 'none', borderRadius: 'var(--radius-12)', backgroundColor: 'var(--blue-10)', padding: 16 }}
            >
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--blue-100)' }}>{cfg.titulo}</span>
                <span style={{ display: 'block', fontFamily: FONT, fontSize: 12, color: 'var(--black-60)', margin: '4px 0 8px', lineHeight: '17px' }}>{cfg.descripcion}</span>
                <Estado activa={ajustes.integraciones[id].activa} />
              </span>
              <ChevronRight size={18} color="var(--blue-100)" />
            </button>
          );
        })}
      </div>
    </SidePanel>
  );
}
