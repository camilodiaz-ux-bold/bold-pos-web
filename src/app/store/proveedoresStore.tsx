/**
 * proveedoresStore.tsx — Store del módulo Proveedores (specs/2026-10-proveedores.md).
 *
 * Mismo patrón que itemsStore.tsx: hidratación en el initializer de useState,
 * persistencia en localStorage en cada mutación, createContext<T|null>(null) +
 * hook que lanza Error fuera del provider. Los proveedores son core (iguales en
 * ambas verticales), por eso el provider vive en App.tsx y no depende de la vertical.
 */
import React, { createContext, useCallback, useContext, useState } from 'react';
import type { Proveedor, ProveedorDraft } from '../types/proveedor';
import { PROVEEDORES_STORAGE_KEY, buildSeedProveedores } from '../data/proveedoresSeed';

function save(list: Proveedor[]): void {
  try {
    localStorage.setItem(PROVEEDORES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function load(): Proveedor[] {
  try {
    const raw = localStorage.getItem(PROVEEDORES_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Proveedor[];
  } catch {
    /* ignore */
  }
  const seed = buildSeedProveedores();
  save(seed);
  return seed;
}

interface ProveedoresContextValue {
  proveedores: Proveedor[];
  getProveedor: (id: string) => Proveedor | undefined;
  createProveedor: (draft: ProveedorDraft) => Proveedor;
  updateProveedor: (id: string, draft: ProveedorDraft) => void;
  deleteProveedor: (id: string) => void;
  toggleActivo: (id: string) => void;
  /** Relee localStorage — usado por el botón "Refrescar" del listado. */
  refresh: () => void;
}

const ProveedoresContext = createContext<ProveedoresContextValue | null>(null);

export function ProveedoresProvider({ children }: { children: React.ReactNode }) {
  const [proveedores, setProveedores] = useState<Proveedor[]>(load);

  const commit = useCallback((updater: (prev: Proveedor[]) => Proveedor[]) => {
    setProveedores(prev => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  const getProveedor = useCallback((id: string) => proveedores.find(p => p.id === id), [proveedores]);

  const createProveedor = useCallback((draft: ProveedorDraft): Proveedor => {
    const nuevo: Proveedor = { ...draft, id: `prov-${Date.now()}`, comprasUltimos6Meses: 0, cuentasPorPagar: 0 };
    commit(prev => [nuevo, ...prev]);
    return nuevo;
  }, [commit]);

  const updateProveedor = useCallback((id: string, draft: ProveedorDraft) => {
    commit(prev => prev.map(p => (p.id === id ? { ...p, ...draft } : p)));
  }, [commit]);

  const deleteProveedor = useCallback((id: string) => {
    commit(prev => prev.filter(p => p.id !== id));
  }, [commit]);

  const toggleActivo = useCallback((id: string) => {
    commit(prev => prev.map(p => (p.id === id ? { ...p, activo: !p.activo } : p)));
  }, [commit]);

  const refresh = useCallback(() => setProveedores(load()), []);

  return (
    <ProveedoresContext.Provider value={{ proveedores, getProveedor, createProveedor, updateProveedor, deleteProveedor, toggleActivo, refresh }}>
      {children}
    </ProveedoresContext.Provider>
  );
}

export function useProveedores(): ProveedoresContextValue {
  const ctx = useContext(ProveedoresContext);
  if (!ctx) throw new Error('useProveedores debe usarse dentro de <ProveedoresProvider>');
  return ctx;
}
