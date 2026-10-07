/**
 * ventasStore.tsx — Ventas registradas (specs/2026-10-ventas-dinamicas.md).
 * Arranca con las ventas sembradas de la vertical y suma cada venta cobrada
 * en Mesas/Mostrador. Persistido en localStorage por vertical; el provider se
 * remonta al cambiar de vertical (key en RootLayout). Versionado en vez de
 * migración: si cambia el shape de Venta, se bumpea la clave en verticalCatalog.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Venta } from '../types/venta';
import type { CompletedSale } from '../utils/invoice';
import { ventaFromSale, type VentaContexto } from '../utils/ventas';
import { getVerticalCatalog } from '../data/verticalCatalog';
import { useVertical, type Vertical } from '../vertical';

function loadVentas(vertical: Vertical): Venta[] {
  const { ventasStorageKey, buildSeedVentas } = getVerticalCatalog(vertical);
  try {
    const raw = localStorage.getItem(ventasStorageKey);
    if (raw) return JSON.parse(raw) as Venta[];
  } catch { /* ignore */ }
  const seed = buildSeedVentas();
  saveVentas(vertical, seed);
  return seed;
}

function saveVentas(vertical: Vertical, ventas: Venta[]): void {
  try {
    localStorage.setItem(getVerticalCatalog(vertical).ventasStorageKey, JSON.stringify(ventas));
  } catch { /* ignore */ }
}

interface VentasCtx {
  /** Ordenadas por emisión: la más reciente primero. */
  ventas: Venta[];
  getVenta: (id: string) => Venta | undefined;
  registrarVenta: (sale: CompletedSale, ctx?: VentaContexto) => Venta;
}

const VentasContext = createContext<VentasCtx | null>(null);

export function VentasProvider({ children }: { children: React.ReactNode }) {
  const { vertical } = useVertical();
  const [raw, setRaw] = useState<Venta[]>(() => loadVentas(vertical));

  const ventas = useMemo(() => [...raw].sort((a, b) => b.emitidaEn - a.emitidaEn), [raw]);

  const getVenta = useCallback((id: string) => raw.find(v => v.id === id), [raw]);

  const registrarVenta = useCallback((sale: CompletedSale, ctx?: VentaContexto) => {
    // El recibo se calcula fuera del updater para que StrictMode no lo duplique.
    const recibo = String(Math.max(0, ...raw.map(v => parseInt(v.recibo, 10) || 0)) + 1);
    const venta = ventaFromSale(sale, vertical, recibo, ctx);
    setRaw(prev => {
      const next = [...prev, venta];
      saveVentas(vertical, next);
      return next;
    });
    return venta;
  }, [raw, vertical]);

  return (
    <VentasContext.Provider value={{ ventas, getVenta, registrarVenta }}>
      {children}
    </VentasContext.Provider>
  );
}

export function useVentas(): VentasCtx {
  const ctx = useContext(VentasContext);
  if (!ctx) throw new Error('useVentas debe usarse dentro de <VentasProvider>');
  return ctx;
}
