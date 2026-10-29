/**
 * variantesStore.tsx — Catálogo "Variantes de inventario" (tipos de variante: Color, Talla…), solo Retail.
 * specs/2026-10-variantes-modelo.md §1. Mismo patrón que itemsStore: hidratación en el initializer,
 * persistencia en localStorage en cada mutación y hook que lanza fuera del provider.
 *
 * Además expone `useProductVariants()`: las variantes de los ítems con la forma que ya consumen combos
 * y reportes (`Record<productId, ProductVariants>`), derivadas de `Item.variantes` (nunca guardadas aparte).
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { VarianteTipo } from '../types/item';
import { getExistenciaVariante, getVarianteLabel, getVariantes } from '../types/item';
import { SEED_VARIANTE_TIPOS } from '../data/retail/variantesCatalogo';
import type { ProductVariants } from '../data/retail/productVariants';
import { useItems } from './itemsStore';
import { useVertical } from '../vertical';

const LS_KEY = 'bold-pos:variantes-catalogo:v1';

function loadTipos(): VarianteTipo[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as VarianteTipo[];
  } catch {
    /* ignore */
  }
  return SEED_VARIANTE_TIPOS;
}

function saveTipos(tipos: VarianteTipo[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(tipos));
  } catch {
    /* ignore */
  }
}

type TipoDraft = Pick<VarianteTipo, 'nombre' | 'opciones'>;

interface VariantesContextValue {
  tipos: VarianteTipo[];
  getTipo: (id: string) => VarianteTipo | undefined;
  createTipo: (draft: TipoDraft) => VarianteTipo;
  updateTipo: (id: string, draft: TipoDraft) => void;
  deleteTipo: (id: string) => void;
  toggleTipoActivo: (id: string) => void;
}

const VariantesContext = createContext<VariantesContextValue | null>(null);

export function VariantesProvider({ children }: { children: React.ReactNode }) {
  const [tipos, setTipos] = useState<VarianteTipo[]>(loadTipos);

  const update = useCallback((updater: (prev: VarianteTipo[]) => VarianteTipo[]) => {
    setTipos(prev => {
      const next = updater(prev);
      saveTipos(next);
      return next;
    });
  }, []);

  const getTipo = useCallback((id: string) => tipos.find(t => t.id === id), [tipos]);

  const createTipo = useCallback((draft: TipoDraft): VarianteTipo => {
    const created: VarianteTipo = { id: crypto.randomUUID(), nombre: draft.nombre.trim(), opciones: draft.opciones, activo: true };
    update(prev => [created, ...prev]);
    return created;
  }, [update]);

  const updateTipo = useCallback((id: string, draft: TipoDraft) => {
    update(prev => prev.map(t => (t.id === id ? { ...t, nombre: draft.nombre.trim(), opciones: draft.opciones } : t)));
  }, [update]);

  const deleteTipo = useCallback((id: string) => {
    update(prev => prev.filter(t => t.id !== id));
  }, [update]);

  const toggleTipoActivo = useCallback((id: string) => {
    update(prev => prev.map(t => (t.id === id ? { ...t, activo: !t.activo } : t)));
  }, [update]);

  return (
    <VariantesContext.Provider value={{ tipos, getTipo, createTipo, updateTipo, deleteTipo, toggleTipoActivo }}>
      {children}
    </VariantesContext.Provider>
  );
}

export function useVariantesCatalogo(): VariantesContextValue {
  const ctx = useContext(VariantesContext);
  if (!ctx) throw new Error('useVariantesCatalogo must be used inside <VariantesProvider>');
  return ctx;
}

/**
 * Variantes **activas** de los ítems con variantes, por `catalogProductId`, con la forma
 * `ProductVariants` (precio, código, costo y existencia total). Vacío fuera de Retail.
 */
export function useProductVariants(): Record<number, ProductVariants> {
  const { items } = useItems();
  const { tipos } = useVariantesCatalogo();
  const { has } = useVertical();
  return useMemo(() => {
    const out: Record<number, ProductVariants> = {};
    if (!has('variantes')) return out;
    for (const item of items) {
      const variantes = getVariantes(item);
      if (!variantes || item.catalogProductId === undefined) continue;
      out[item.catalogProductId] = {
        tipos: (item.tiposVariante ?? []).map(t => ({
          nombre: tipos.find(x => x.id === t.tipoId)?.nombre ?? t.tipoId,
          opciones: t.opcionesActivas,
        })),
        variantes: variantes.filter(v => v.activo).map(v => ({
          id: v.id,
          opciones: v.opciones,
          label: getVarianteLabel(v),
          price: v.precioTotal,
          codigo: v.codigo,
          costo: v.costo,
          existencia: getExistenciaVariante(v),
        })),
      };
    }
    return out;
  }, [items, tipos, has]);
}
