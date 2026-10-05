/**
 * verticalStore — vertical activa del prototipo (Retail | Restaurantes)
 * ─────────────────────────────────────────────────────────────────────────────
 * - Persistida en localStorage; default 'restaurantes' (comportamiento previo).
 * - `?vertical=retail|restaurantes` en la URL fija la vertical (links de demo);
 *   el parámetro se quita de la URL tras leerlo.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { VERTICALS, verticalHasModule, type Vertical } from './modules';
import { VERTICAL_CONFIG, type VerticalConfig } from './verticalConfig';

const LS_KEY = 'bold-pos-vertical';
const DEFAULT_VERTICAL: Vertical = 'restaurantes';

const isVertical = (v: unknown): v is Vertical => VERTICALS.includes(v as Vertical);

function readInitialVertical(): Vertical {
  try {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get('vertical');
    if (isVertical(fromUrl)) {
      localStorage.setItem(LS_KEY, fromUrl);
      url.searchParams.delete('vertical');
      window.history.replaceState(window.history.state, '', url.toString());
      return fromUrl;
    }
    const stored = localStorage.getItem(LS_KEY);
    if (isVertical(stored)) return stored;
  } catch {
    /* localStorage/URL no disponibles: usar el default */
  }
  return DEFAULT_VERTICAL;
}

interface VerticalContextValue {
  vertical: Vertical;
  setVertical: (v: Vertical) => void;
  config: VerticalConfig;
  /** true si el módulo existe en la vertical activa (core o exclusivo de ella). */
  has: (moduleId: string) => boolean;
}

const VerticalContext = createContext<VerticalContextValue | null>(null);

export function VerticalProvider({ children }: { children: React.ReactNode }) {
  const [vertical, setVerticalState] = useState<Vertical>(readInitialVertical);

  const setVertical = useCallback((v: Vertical) => {
    setVerticalState(v);
    try { localStorage.setItem(LS_KEY, v); } catch { /* ignore */ }
  }, []);

  const value = useMemo<VerticalContextValue>(() => ({
    vertical,
    setVertical,
    config: VERTICAL_CONFIG[vertical],
    has: (moduleId: string) => verticalHasModule(vertical, moduleId),
  }), [vertical, setVertical]);

  return <VerticalContext.Provider value={value}>{children}</VerticalContext.Provider>;
}

export function useVertical(): VerticalContextValue {
  const ctx = useContext(VerticalContext);
  if (!ctx) throw new Error('useVertical debe usarse dentro de <VerticalProvider>');
  return ctx;
}
