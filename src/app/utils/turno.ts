/**
 * turno.ts — Turno abierto del prototipo (specs/2026-11-devoluciones.md §6, D4). Herramienta del prototipo:
 * permite simular "no hay turno abierto" para recorrer el modal de abrir turno. Por defecto hay turno abierto.
 */
import { useCallback, useEffect, useState } from 'react';

const KEY = 'bold-pos:turno-abierto:v1';
const EVENTO = 'bold-pos:turno-cambio';

export function leerTurnoAbierto(): boolean {
  try { return localStorage.getItem(KEY) !== 'cerrado'; } catch { return true; }
}

export function useTurnoAbierto(): [boolean, (abierto: boolean) => void] {
  const [abierto, setAbierto] = useState(leerTurnoAbierto);
  useEffect(() => {
    const sync = () => setAbierto(leerTurnoAbierto());
    window.addEventListener(EVENTO, sync);
    return () => window.removeEventListener(EVENTO, sync);
  }, []);
  const set = useCallback((v: boolean) => {
    try { localStorage.setItem(KEY, v ? 'abierto' : 'cerrado'); } catch { /* ignore */ }
    window.dispatchEvent(new Event(EVENTO));
  }, []);
  return [abierto, set];
}
