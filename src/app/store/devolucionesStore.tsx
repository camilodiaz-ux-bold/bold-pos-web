/**
 * devolucionesStore.tsx — Devoluciones registradas (specs/2026-11-devoluciones.md §3).
 * Una fila por ítem devuelto. Hidratación en el initializer, persistencia en localStorage (`bold-pos:devoluciones:v1`).
 * Para volver a la semilla, borrar esa clave.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Devolucion } from '../types/devolucion';
import { buildSeedDevoluciones, DEVOLUCIONES_STORAGE_KEY, DEVOLUCION_NUMERO_INICIAL } from '../data/devolucionesSeed';

function load(): Devolucion[] {
  try {
    const raw = localStorage.getItem(DEVOLUCIONES_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Devolucion[];
  } catch { /* ignore */ }
  const seed = buildSeedDevoluciones();
  save(seed);
  return seed;
}

function save(filas: Devolucion[]): void {
  try { localStorage.setItem(DEVOLUCIONES_STORAGE_KEY, JSON.stringify(filas)); } catch { /* ignore */ }
}

/** 'Dev-234' → 234 */
export const numeroDeDevolucion = (numero: string): number => parseInt(numero.replace(/\D/g, ''), 10) || 0;

interface DevolucionesCtx {
  /** Más reciente primero (por fecha; a igual fecha, el número más alto). */
  devoluciones: Devolucion[];
  /** Todas las filas de una misma devolución (`Dev-234`). */
  filasDe: (numero: string) => Devolucion[];
  /** Devoluciones (números distintos) que salieron de un documento. */
  devolucionesDeVenta: (ventaId: string) => Devolucion[];
  /** Siguiente número `Dev-N`. */
  siguienteNumero: () => string;
  /** Agrega las filas de una devolución nueva. */
  agregar: (filas: Devolucion[]) => void;
}

const DevolucionesContext = createContext<DevolucionesCtx | null>(null);

export function DevolucionesProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<Devolucion[]>(load);

  const devoluciones = useMemo(
    () => [...raw].sort((a, b) => b.fecha - a.fecha || numeroDeDevolucion(b.numero) - numeroDeDevolucion(a.numero)),
    [raw],
  );

  const filasDe = useCallback((numero: string) => raw.filter(d => d.numero === numero), [raw]);
  const devolucionesDeVenta = useCallback((ventaId: string) => raw.filter(d => d.ventaId === ventaId), [raw]);

  const siguienteNumero = useCallback(
    () => `Dev-${Math.max(DEVOLUCION_NUMERO_INICIAL - 1, ...raw.map(d => numeroDeDevolucion(d.numero))) + 1}`,
    [raw],
  );

  const agregar = useCallback((filas: Devolucion[]) => {
    setRaw(prev => {
      const next = [...prev, ...filas];
      save(next);
      return next;
    });
  }, []);

  return (
    <DevolucionesContext.Provider value={{ devoluciones, filasDe, devolucionesDeVenta, siguienteNumero, agregar }}>
      {children}
    </DevolucionesContext.Provider>
  );
}

export function useDevoluciones(): DevolucionesCtx {
  const ctx = useContext(DevolucionesContext);
  if (!ctx) throw new Error('useDevoluciones debe usarse dentro de <DevolucionesProvider>');
  return ctx;
}
