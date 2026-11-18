/**
 * PrototypeToolsBar — contenedor único de las herramientas del PROTOTIPO (no del producto): switches, checks
 * o botones de demo. Regla general: toda herramienta de prototipo va aquí, fija abajo y por encima de todo el
 * contenido (también de los modales), nunca dentro del flujo de la página. Se dibuja en un portal para que
 * ningún contenedor con overflow o transform la recorte o la tape.
 */
import React from 'react';
import ReactDOM from 'react-dom';

export function PrototypeToolsBar({ children }: { children: React.ReactNode }) {
  return ReactDOM.createPortal(
    <div
      role="group" aria-label="Herramientas del prototipo" title="Controles del prototipo: no forman parte del producto"
      style={{
        position: 'fixed', left: '50%', bottom: 12, transform: 'translateX(-50%)', zIndex: 400,
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        maxWidth: 'calc(100vw - 32px)', padding: '6px 14px', backgroundColor: '#fff',
        border: '1.5px dashed var(--blue-20)', borderRadius: 12, boxShadow: '0 4px 16px rgba(18,30,108,0.12)',
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--black-60)' }}>Prototipo ·</span>
      {children}
    </div>,
    document.body,
  );
}
