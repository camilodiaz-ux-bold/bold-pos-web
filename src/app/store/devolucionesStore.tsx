/**
 * devolucionesStore.tsx — Devoluciones registradas (specs/2026-11-devoluciones.md §3).
 * Una fila por ítem devuelto. Hidratación en el initializer, persistencia en localStorage (`bold-pos:devoluciones:v1`).
 * Para volver a la semilla, borrar esa clave.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Devolucion, NotaPendiente } from '../types/devolucion';
import { buildSeedDevoluciones, DEVOLUCIONES_STORAGE_KEYS, DEVOLUCION_NUMERO_INICIAL, PENDIENTES_STORAGE_KEYS } from '../data/devolucionesSeed';
import { useVertical, type Vertical } from '../vertical';

function load(vertical: Vertical): Devolucion[] {
  try {
    const raw = localStorage.getItem(DEVOLUCIONES_STORAGE_KEYS[vertical]);
    if (raw) return JSON.parse(raw) as Devolucion[];
  } catch { /* ignore */ }
  const seed = buildSeedDevoluciones(vertical);
  save(vertical, seed);
  return seed;
}

function save(vertical: Vertical, filas: Devolucion[]): void {
  try { localStorage.setItem(DEVOLUCIONES_STORAGE_KEYS[vertical], JSON.stringify(filas)); } catch { /* ignore */ }
}

/** Notas crédito emitidas que esperan la DIAN (specs/2026-11-devoluciones-v2.md §3). Una clave por vertical. */
function loadPendientes(vertical: Vertical): NotaPendiente[] {
  try {
    const raw = localStorage.getItem(PENDIENTES_STORAGE_KEYS[vertical]);
    if (raw) return JSON.parse(raw) as NotaPendiente[];
  } catch { /* ignore */ }
  return [];
}

function savePendientes(vertical: Vertical, p: NotaPendiente[]): void {
  try { localStorage.setItem(PENDIENTES_STORAGE_KEYS[vertical], JSON.stringify(p)); } catch { /* ignore */ }
}

/** '234' → 234 (también acepta el formato anterior 'Dev-234') */
export const numeroDeDevolucion = (numero: string): number => parseInt(numero.replace(/\D/g, ''), 10) || 0;

interface DevolucionesCtx {
  /** Más reciente primero (por fecha; a igual fecha, el número más alto). */
  devoluciones: Devolucion[];
  /** Todas las filas de una misma devolución (`234`). */
  filasDe: (numero: string) => Devolucion[];
  /** Devoluciones (números distintos) que salieron de un documento. */
  devolucionesDeVenta: (ventaId: string) => Devolucion[];
  /** Siguiente número de devolución (solo el número). */
  siguienteNumero: () => string;
  /** Siguiente número de nota crédito (`NCR 430`). */
  siguienteNotaCredito: () => string;
  /** Agrega las filas de una devolución nueva. */
  agregar: (filas: Devolucion[]) => void;
  /** Notas crédito emitidas que esperan la aceptación de la DIAN. */
  pendientes: NotaPendiente[];
  /** Emite una nota crédito: queda pendiente hasta que la DIAN responde. */
  emitirNota: (nota: NotaPendiente) => void;
  /** Saca una nota de pendientes (aceptada o rechazada). */
  quitarPendiente: (id: string) => void;
}

const DevolucionesContext = createContext<DevolucionesCtx | null>(null);

export function DevolucionesProvider({ children }: { children: React.ReactNode }) {
  const { vertical } = useVertical();
  const [raw, setRaw] = useState<Devolucion[]>(() => load(vertical));
  const [pendientes, setPendientes] = useState<NotaPendiente[]>(() => loadPendientes(vertical));

  const devoluciones = useMemo(
    () => [...raw].sort((a, b) => b.fecha - a.fecha || numeroDeDevolucion(b.numero) - numeroDeDevolucion(a.numero)),
    [raw],
  );

  const filasDe = useCallback((numero: string) => raw.filter(d => d.numero === numero), [raw]);
  const devolucionesDeVenta = useCallback((ventaId: string) => raw.filter(d => d.ventaId === ventaId), [raw]);

  const siguienteNumero = useCallback(
    () => String(Math.max(DEVOLUCION_NUMERO_INICIAL - 1, ...raw.map(d => numeroDeDevolucion(d.numero))) + 1),
    [raw],
  );

  const siguienteNotaCredito = useCallback(() => {
    const numeros = [...raw.map(d => d.notaCredito), ...pendientes.map(p => p.notaCredito)];
    const max = Math.max(389, ...numeros.map(n => parseInt((n ?? '').replace(/\D/g, ''), 10) || 0));
    return `NCR ${max + 1}`;
  }, [raw, pendientes]);

  const agregar = useCallback((filas: Devolucion[]) => {
    setRaw(prev => {
      const next = [...prev, ...filas];
      save(vertical, next);
      return next;
    });
  }, [vertical]);

  const emitirNota = useCallback((nota: NotaPendiente) => {
    setPendientes(prev => { const next = [...prev, nota]; savePendientes(vertical, next); return next; });
  }, [vertical]);

  const quitarPendiente = useCallback((id: string) => {
    setPendientes(prev => { const next = prev.filter(p => p.id !== id); savePendientes(vertical, next); return next; });
  }, [vertical]);

  return (
    <DevolucionesContext.Provider value={{ devoluciones, filasDe, devolucionesDeVenta, siguienteNumero, siguienteNotaCredito, agregar, pendientes, emitirNota, quitarPendiente }}>
      {children}
    </DevolucionesContext.Provider>
  );
}

export function useDevoluciones(): DevolucionesCtx {
  const ctx = useContext(DevolucionesContext);
  if (!ctx) throw new Error('useDevoluciones debe usarse dentro de <DevolucionesProvider>');
  return ctx;
}
