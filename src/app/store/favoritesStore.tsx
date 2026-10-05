/**
 * favoritesStore.tsx — Estado global compartido de productos favoritos.
 *
 * Permite sincronizar favoriteIds entre MostradorCatalog y MesaProductSelector
 * sin prop-drilling. Inicializa desde los favoritos del catálogo de la vertical activa
 * (el provider se remonta al cambiar de vertical — key en RootLayout).
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useCatalog } from '../vertical';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface FavoritesContextValue {
  favoriteIds:    Set<number>;
  toggleFavorite: (id: number, e: React.MouseEvent | React.KeyboardEvent) => void;
  isFavorite:     (id: number) => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { favoriteIds: initialFavoriteIds } = useCatalog();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(
    () => new Set(initialFavoriteIds),
  );

  const toggleFavorite = useCallback(
    (id: number, e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    },
    [],
  );

  const isFavorite = useCallback((id: number) => favoriteIds.has(id), [favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
}
