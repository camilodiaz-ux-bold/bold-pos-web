/**
 * ajustesStore.tsx — Store de Ajustes (specs/2026-10-ajustes.md §8).
 *
 * Mismo patrón que contactosStore/facturasCompraStore: hidratación en el initializer de useState,
 * persistencia en localStorage en cada mutación, createContext + hook que lanza fuera del provider.
 * Una sola clave (`bold-pos:ajustes:v1`) con todas las secciones. Las secciones de lista usan `updateAjustes`
 * con un updater puro; Configuración POS y Facturas de compra tienen setters propios.
 */
import React, { createContext, useCallback, useContext, useState } from 'react';
import type { AjustesState, ConfigFacturasCompra, ConfigPOS } from '../types/ajustes';
import { AJUSTES_DEFAULT, AJUSTES_STORAGE_KEY, COMPRAS_SETTINGS_LEGACY_KEY } from '../data/ajustesSeed';

function save(state: AjustesState): void {
  try {
    localStorage.setItem(AJUSTES_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function load(): AjustesState {
  try {
    const raw = localStorage.getItem(AJUSTES_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AjustesState>;
      return {
        ...AJUSTES_DEFAULT,
        ...saved,
        pos: { ...AJUSTES_DEFAULT.pos, ...saved.pos },
        facturasCompra: { ...AJUSTES_DEFAULT.facturasCompra, ...saved.facturasCompra },
        integraciones: { ...AJUSTES_DEFAULT.integraciones, ...saved.integraciones },
        perfil: { ...AJUSTES_DEFAULT.perfil, ...saved.perfil },
        alertasStockBajo: { ...AJUSTES_DEFAULT.alertasStockBajo, ...saved.alertasStockBajo },
      };
    }
  } catch {
    /* ignore */
  }
  // Primera vez: se migra el switch "Usar impuestos y retenciones" de las herramientas del prototipo.
  const state: AjustesState = { ...AJUSTES_DEFAULT, facturasCompra: { ...AJUSTES_DEFAULT.facturasCompra } };
  try {
    const legacy = localStorage.getItem(COMPRAS_SETTINGS_LEGACY_KEY);
    if (legacy) {
      const { usarImpuestos } = JSON.parse(legacy) as { usarImpuestos?: boolean };
      if (typeof usarImpuestos === 'boolean') state.facturasCompra.usarImpuestos = usarImpuestos;
    }
  } catch {
    /* ignore */
  }
  save(state);
  return state;
}

interface AjustesContextValue {
  ajustes: AjustesState;
  setPos: (patch: Partial<ConfigPOS>) => void;
  setFacturasCompra: (patch: Partial<ConfigFacturasCompra>) => void;
  /** Escribe cualquier sección con un updater puro (paneles de la fase 2). */
  updateAjustes: (updater: (prev: AjustesState) => AjustesState) => void;
}

const AjustesContext = createContext<AjustesContextValue | null>(null);

export function AjustesProvider({ children }: { children: React.ReactNode }) {
  const [ajustes, setAjustes] = useState<AjustesState>(load);

  const commit = useCallback((updater: (prev: AjustesState) => AjustesState) => {
    setAjustes(prev => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  const setPos = useCallback((patch: Partial<ConfigPOS>) => {
    commit(prev => ({ ...prev, pos: { ...prev.pos, ...patch } }));
  }, [commit]);

  const setFacturasCompra = useCallback((patch: Partial<ConfigFacturasCompra>) => {
    commit(prev => ({ ...prev, facturasCompra: { ...prev.facturasCompra, ...patch } }));
  }, [commit]);

  return (
    <AjustesContext.Provider value={{ ajustes, setPos, setFacturasCompra, updateAjustes: commit }}>
      {children}
    </AjustesContext.Provider>
  );
}

export function useAjustes(): AjustesContextValue {
  const ctx = useContext(AjustesContext);
  if (!ctx) throw new Error('useAjustes debe usarse dentro de <AjustesProvider>');
  return ctx;
}
