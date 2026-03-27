/**
 * useMesas — único punto de acceso al estado de mesas en la vista Grid.
 *
 * Fuente de verdad: localStorage['bold-pos-mesas'].
 * Inicializa con datos derivados de INITIAL_MESAS_CONFIG si no hay datos guardados.
 * Escucha el evento 'storage' para sincronizar entre pestañas.
 */
import { useState, useEffect } from 'react';
import type { Mesa } from '../types/mesa';
import { INITIAL_MESAS_CONFIG } from '../store/mesasStore';

const LS_KEY = 'bold-pos-mesas';

// ─── Defaults ────────────────────────────────────────────────────────────────

export function buildDefaultMesas(): Mesa[] {
  return INITIAL_MESAS_CONFIG.map((mc, i) => ({
    id:              mc.id,
    nombre:          mc.name,
    zona:            mc.zone,
    capacidad:       mc.capacity,
    habilitada:      mc.status === 'Activa',
    estado:          'disponible' as const,
    gridIndex:       i,
    personas:        0,
    tiempoOcupacion: '',
  }));
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadFromStorage(): Mesa[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Mesa[];
  } catch { /* ignore */ }
  return buildDefaultMesas();
}

function saveToStorage(mesas: Mesa[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(mesas));
  } catch { /* ignore */ }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMesas() {
  // Lazy initializer: reads localStorage once on mount, falls back to defaults.
  const [mesas, setMesas] = useState<Mesa[]>(() => {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? (JSON.parse(saved) as Mesa[]) : buildDefaultMesas();
  });

  // Sync across browser tabs via storage event.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === LS_KEY && e.newValue) {
        try { setMesas(JSON.parse(e.newValue) as Mesa[]); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // ── Mutations — each writes to localStorage THEN updates React state ───────

  const updateMesa = (id: string, changes: Partial<Omit<Mesa, 'id'>>) => {
    setMesas(prev => {
      const next = prev.map(m => m.id === id ? { ...m, ...changes } : m);
      saveToStorage(next);
      return next;
    });
  };

  const addMesa = (mesa: Omit<Mesa, 'gridIndex'>) => {
    setMesas(prev => {
      const maxIndex = prev.reduce((mx, m) => Math.max(mx, m.gridIndex), -1);
      const newMesa: Mesa = { ...mesa, gridIndex: maxIndex + 1 };
      const next = [...prev, newMesa];
      saveToStorage(next);
      return next;
    });
  };

  const deleteMesa = (id: string) => {
    setMesas(prev => {
      const next = prev.filter(m => m.id !== id);
      saveToStorage(next);
      return next;
    });
  };

  /** Intercambia los gridIndex de dos mesas y persiste. */
  const reorderMesas = (idOrigin: string, idDest: string) => {
    setMesas(prev => {
      const origin = prev.find(m => m.id === idOrigin);
      const dest   = prev.find(m => m.id === idDest);
      if (!origin || !dest) return prev;
      const next = prev.map(m => {
        if (m.id === idOrigin) return { ...m, gridIndex: dest.gridIndex };
        if (m.id === idDest)   return { ...m, gridIndex: origin.gridIndex };
        return m;
      });
      saveToStorage(next);
      return next;
    });
  };

  /** Borra localStorage y restaura los datos por defecto. Útil para debug. */
  const resetMesas = () => {
    const defaults = buildDefaultMesas();
    saveToStorage(defaults);
    setMesas(defaults);
  };

  return { mesas, updateMesa, addMesa, deleteMesa, reorderMesas, resetMesas };
}
