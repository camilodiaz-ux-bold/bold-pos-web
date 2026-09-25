/**
 * itemsStore.tsx — Store del módulo ITEMS → Lista de ítems.
 *
 * Sigue el mismo patrón que asyncReportsStore.tsx: hidratación en el
 * initializer de useState, persistencia en localStorage en cada mutación,
 * createContext<T|null>(null) + hook que lanza Error fuera del provider.
 *
 * Versionado en vez de migración: si el shape de Item cambia durante el
 * desarrollo, se bumpea LS_KEY (…:v1 → …:v2) y se re-siembra. Aceptable
 * para un prototipo; sube la versión implica perder los ítems creados
 * por el usuario en ese navegador.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Item, ItemDraft } from '../types/item';
import { buildSeedItems } from '../data/itemsSeed';

// v1 → v2: Item ganó esCombo/componentes/comboSaleId (specs/2026-09-combos.md §6.1).
const LS_KEY = 'bold-pos:items:v2';

function generateAutoCode(): string {
  return `I-${Date.now()}`;
}

/** Próximo id de venta para un combo nuevo — rango reservado ≥ 9000, ver types/item.ts. */
function nextComboSaleId(items: Item[]): number {
  const existing = items.map(i => i.comboSaleId ?? 0);
  return Math.max(8999, ...existing) + 1;
}

function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Item[];
      // Normalización defensiva: esCombo es requerido en el tipo.
      return parsed.map(item => ({ ...item, esCombo: !!item.esCombo }));
    }
  } catch {
    /* ignore */
  }
  const seed = buildSeedItems();
  saveItems(seed);
  return seed;
}

function saveItems(items: Item[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

interface ItemsContextValue {
  items: Item[];
  getItem: (id: string) => Item | undefined;
  createItem: (draft: ItemDraft) => Item;
  updateItem: (id: string, draft: ItemDraft) => void;
  deleteItem: (id: string) => void;
  toggleActivo: (id: string) => void;
  /** Relee localStorage — usado por el botón "Refrescar" del listado. */
  refresh: () => void;
  resetToSeed: () => void;
}

const ItemsContext = createContext<ItemsContextValue | null>(null);

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>(() => loadItems());

  const updateItems = useCallback((updater: (prev: Item[]) => Item[]) => {
    setItems(prev => {
      const next = updater(prev);
      saveItems(next);
      return next;
    });
  }, []);

  const getItem = useCallback((id: string) => items.find(i => i.id === id), [items]);

  const createItem = useCallback((draft: ItemDraft): Item => {
    const now = Date.now();
    const id = crypto.randomUUID();
    let created!: Item;
    updateItems(prev => {
      created = {
        ...draft,
        id,
        codigo: draft.codigo.trim() || generateAutoCode(),
        comboSaleId: draft.esCombo ? nextComboSaleId(prev) : undefined,
        creadoEn: now,
        actualizadoEn: now,
      };
      return [created, ...prev];
    });
    return created;
  }, [updateItems]);

  const updateItem = useCallback((id: string, draft: ItemDraft) => {
    updateItems(prev => prev.map(item => item.id === id
      ? {
          ...item,
          ...draft,
          codigo: draft.codigo.trim() || item.codigo,
          // Conserva el comboSaleId existente (§9: desmarcar un combo no lo pierde);
          // asigna uno nuevo solo si se marca esCombo por primera vez.
          comboSaleId: item.comboSaleId ?? (draft.esCombo ? nextComboSaleId(prev) : undefined),
          actualizadoEn: Date.now(),
        }
      : item,
    ));
  }, [updateItems]);

  const deleteItem = useCallback((id: string) => {
    updateItems(prev => prev.filter(item => item.id !== id));
  }, [updateItems]);

  const toggleActivo = useCallback((id: string) => {
    updateItems(prev => prev.map(item => item.id === id
      ? { ...item, activo: !item.activo, actualizadoEn: Date.now() }
      : item,
    ));
  }, [updateItems]);

  const refresh = useCallback(() => {
    updateItems(() => loadItems());
  }, [updateItems]);

  const resetToSeed = useCallback(() => {
    updateItems(() => buildSeedItems());
  }, [updateItems]);

  return (
    <ItemsContext.Provider value={{ items, getItem, createItem, updateItem, deleteItem, toggleActivo, refresh, resetToSeed }}>
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems(): ItemsContextValue {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error('useItems must be used inside <ItemsProvider>');
  return ctx;
}
