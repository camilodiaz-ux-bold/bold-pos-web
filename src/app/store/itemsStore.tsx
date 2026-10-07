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
import { getVerticalCatalog } from '../data/verticalCatalog';
import { useVertical, type Vertical } from '../vertical';

// La clave de localStorage depende de la vertical (data/verticalCatalog.ts):
// Restaurantes usa 'bold-pos:items:v3' (v1 → v2: Item ganó esCombo/componentes/
// comboSaleId, specs/2026-09-combos.md §6.1; v2 → v3: combos sembrados con costo,
// specs/2026-10-reporte-ganancias-items.md §8.3); Retail usa su propia clave (v4 por lo mismo).

function generateAutoCode(): string {
  return `I-${Date.now()}`;
}

/** Próximo id de venta para un combo nuevo — rango reservado ≥ 9000, ver types/item.ts. */
function nextComboSaleId(items: Item[]): number {
  const existing = items.map(i => i.comboSaleId ?? 0);
  return Math.max(8999, ...existing) + 1;
}

function loadItems(vertical: Vertical): Item[] {
  const { itemsStorageKey, buildSeedItems } = getVerticalCatalog(vertical);
  try {
    const raw = localStorage.getItem(itemsStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as Item[];
      // Normalización defensiva: esCombo es requerido en el tipo.
      return parsed.map(item => ({ ...item, esCombo: !!item.esCombo }));
    }
  } catch {
    /* ignore */
  }
  const seed = buildSeedItems();
  saveItems(vertical, seed);
  return seed;
}

function saveItems(vertical: Vertical, items: Item[]): void {
  try {
    localStorage.setItem(getVerticalCatalog(vertical).itemsStorageKey, JSON.stringify(items));
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
  // El provider se remonta al cambiar de vertical (key en RootLayout), así que
  // `vertical` es estable durante la vida de esta instancia.
  const { vertical } = useVertical();
  const [items, setItems] = useState<Item[]>(() => loadItems(vertical));

  const updateItems = useCallback((updater: (prev: Item[]) => Item[]) => {
    setItems(prev => {
      const next = updater(prev);
      saveItems(vertical, next);
      return next;
    });
  }, [vertical]);

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
    updateItems(() => loadItems(vertical));
  }, [updateItems, vertical]);

  const resetToSeed = useCallback(() => {
    updateItems(() => getVerticalCatalog(vertical).buildSeedItems());
  }, [updateItems, vertical]);

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
