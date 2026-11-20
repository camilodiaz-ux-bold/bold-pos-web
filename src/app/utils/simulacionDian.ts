/**
 * simulacionDian.ts — Herramienta del PROTOTIPO "Simular rechazo de la DIAN" (specs/2026-11-devoluciones-v2.md, S1).
 * Si está activa, la siguiente nota crédito que se emita será rechazada; al emitirla se apaga sola.
 */
import { useCallback, useEffect, useState } from 'react';

const KEY = 'bold-pos:dian-rechazo-demo:v1';
const EVENTO = 'bold-pos:dian-rechazo-cambio';

export function leerSimularRechazo(): boolean {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}

export function escribirSimularRechazo(v: boolean): void {
  try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVENTO));
}

export function useSimularRechazo(): [boolean, (v: boolean) => void] {
  const [activo, setActivo] = useState(leerSimularRechazo);
  useEffect(() => {
    const sync = () => setActivo(leerSimularRechazo());
    window.addEventListener(EVENTO, sync);
    return () => window.removeEventListener(EVENTO, sync);
  }, []);
  const set = useCallback((v: boolean) => escribirSimularRechazo(v), []);
  return [activo, set];
}
