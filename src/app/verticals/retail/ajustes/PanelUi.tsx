/**
 * PanelUi — piezas compartidas de los paneles de Ajustes (specs/2026-10-ajustes.md §3).
 *
 * SidePanel: panel lateral con fondo atenuado. Variante `left` (~920 px, título centrado, pie dividido en
 * CANCELAR | GUARDAR) y `right` (~560 px, botón X, pie con "Cancelar" + acción en píldora). Escape y clic
 * en el fondo cierran solo el panel de más arriba (soporta sub-paneles apilados).
 */
import React, { useEffect, useRef } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';

export const FONT = "'Montserrat', sans-serif";

// Pila de paneles abiertos: Escape y fondo solo actúan sobre el último.
const pila: symbol[] = [];

interface SidePanelProps {
  variant: 'left' | 'right';
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
  /** Ancho propio (px) para casos como Roles. */
  width?: number;
}

export function SidePanel({ variant, title, subtitle, onClose, footer, children, width }: SidePanelProps) {
  const id = useRef(Symbol('panel'));
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const me = id.current;
    pila.push(me);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pila[pila.length - 1] === me) close.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      pila.splice(pila.indexOf(me), 1);
    };
  }, []);

  const left = variant === 'left';
  return (
    <div className="fixed inset-0" style={{ zIndex: 200 + pila.length * 10 }} role="dialog" aria-label={title}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        style={{
          position: 'absolute', top: 0, bottom: 0, [left ? 'left' : 'right']: 0,
          width: `min(${width ?? (left ? 920 : 560)}px, 100vw)`,
          backgroundColor: 'var(--black-0)', boxShadow: 'var(--shadow-12)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {!left && (
          <button
            type="button" onClick={onClose} aria-label="Cerrar"
            style={{ position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <X size={18} color="var(--blue-100)" />
          </button>
        )}
        <div style={{ padding: left ? '20px 32px 0' : '20px 32px 0', textAlign: left ? 'center' : 'center' }}>
          <h2 style={{ fontFamily: FONT, fontSize: left ? 18 : 15, fontWeight: 700, color: 'var(--blue-100)', margin: 0 }}>{title}</h2>
          {subtitle && (
            <p style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-100)', margin: '16px 0 0', lineHeight: '18px' }}>{subtitle}</p>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px' }}>{children}</div>
        <div style={{ borderTop: '1px solid var(--black-10)', flexShrink: 0 }}>{footer}</div>
      </div>
    </div>
  );
}

// ─── Pies ────────────────────────────────────────────────────────────────────

const footerText: React.CSSProperties = {
  fontFamily: FONT, fontSize: 12, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer',
  height: 56, letterSpacing: 0.4,
};

/** Pie de un panel izquierdo que solo lista: un único CANCELAR. */
export function FooterLista({ onCancel }: { onCancel: () => void }) {
  return (
    <button type="button" onClick={onCancel} style={{ ...footerText, width: '100%', color: 'var(--coral-100)' }}>CANCELAR</button>
  );
}

/** Pie de un panel izquierdo con formulario: CANCELAR | GUARDAR. */
export function FooterForm({ onCancel, onSave, canSave = true, saveLabel = 'GUARDAR' }: {
  onCancel: () => void; onSave: () => void; canSave?: boolean; saveLabel?: string;
}) {
  return (
    <div style={{ display: 'flex' }}>
      <button type="button" onClick={onCancel} style={{ ...footerText, flex: 1, color: 'var(--coral-100)' }}>CANCELAR</button>
      <button
        type="button" onClick={onSave} disabled={!canSave}
        style={{
          ...footerText, flex: 1, borderLeft: '1px solid var(--black-10)',
          color: canSave ? 'var(--coral-100)' : 'var(--black-40)', cursor: canSave ? 'pointer' : 'not-allowed',
        }}
      >
        {saveLabel}
      </button>
    </div>
  );
}

/** Pie de un panel derecho: "Cancelar" en texto y acción principal en píldora. */
export function FooterDerecho({ onCancel, onSave, saveLabel, canSave = true, hideSave }: {
  onCancel: () => void; onSave?: () => void; saveLabel?: string; canSave?: boolean; hideSave?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '16px 32px' }}>
      <button type="button" onClick={onCancel} style={{ ...footerText, height: 40, color: 'var(--coral-100)', fontWeight: 600, fontSize: 13, letterSpacing: 0 }}>
        Cancelar
      </button>
      {!hideSave && (
        <button
          type="button" onClick={onSave} disabled={!canSave}
          className={canSave ? 'btn btn-primary' : 'btn'}
          style={{
            borderRadius: 999, minWidth: 200, height: 40, padding: '0 24px', fontSize: 13,
            ...(canSave ? {} : { backgroundColor: 'var(--coral-30)', color: 'var(--black-0)', cursor: 'not-allowed' }),
          }}
        >
          {saveLabel}
        </button>
      )}
    </div>
  );
}

// ─── Tablas y formularios ────────────────────────────────────────────────────

export const th: React.CSSProperties = {
  padding: '12px 8px', textAlign: 'left', fontFamily: FONT, fontWeight: 700, fontSize: 12,
  color: 'var(--black-100)', borderBottom: '1px solid var(--black-10)', whiteSpace: 'nowrap',
};
export const td: React.CSSProperties = {
  padding: '12px 8px', fontFamily: FONT, fontSize: 13, color: 'var(--black-60)',
  borderBottom: '1px solid var(--black-10)', verticalAlign: 'middle',
};

export function BotonNuevo({ onClick, label = 'NUEVO' }: { onClick: () => void; label?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
      <button type="button" onClick={onClick} className="btn btn-primary" style={{ borderRadius: 999, padding: '8px 20px', fontSize: 11, letterSpacing: 0.4 }}>
        {label}
      </button>
    </div>
  );
}

function IconBtn({ onClick, label, disabled, children }: { onClick?: () => void; label: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
      style={{
        width: 28, height: 28, borderRadius: '50%', border: 'none', backgroundColor: 'var(--blue-10)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function AccionesFila({ onEditar, onEliminar, soloEditar, bloqueada }: {
  onEditar?: () => void; onEliminar?: () => void; soloEditar?: boolean; bloqueada?: boolean;
}) {
  return (
    <div style={{ display: 'inline-flex', gap: 8 }}>
      <IconBtn label="Editar" onClick={onEditar} disabled={bloqueada}><Pencil size={13} color="var(--blue-100)" /></IconBtn>
      {!soloEditar && <IconBtn label="Eliminar" onClick={onEliminar} disabled={bloqueada}><Trash2 size={13} color="var(--blue-100)" /></IconBtn>}
    </div>
  );
}

/** Fila de formulario del panel izquierdo: etiqueta a la izquierda y control a la derecha. */
export function FormRow({ label, required, error, helper, children }: {
  label: string; required?: boolean; error?: string; helper?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
      <label style={{ width: 240, flexShrink: 0, textAlign: 'right', paddingTop: 13, fontFamily: FONT, fontSize: 12, color: 'var(--black-60)' }}>
        {label}{required && <span style={{ color: 'var(--coral-100)' }}>*</span>}
      </label>
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
        {error
          ? <p style={{ fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' }}>{error}</p>
          : helper && <p style={{ fontFamily: FONT, fontSize: 12, color: 'var(--black-40)', margin: '4px 0 0' }}>{helper}</p>}
      </div>
    </div>
  );
}

export const inputErr = (error?: string): React.CSSProperties | undefined =>
  error ? { borderColor: 'var(--coral-100)' } : undefined;

/** Convierte un texto a número entero positivo; '' si no hay dígitos. */
export const soloDigitos = (v: string): string => v.replace(/\D/g, '');

export const REQUERIDO = 'Este campo es requerido';
