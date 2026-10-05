import { useMemo } from 'react';
import { getVerticalCatalog, type VerticalCatalog } from '../data/verticalCatalog';
import { useVertical } from './verticalStore';

/** Catálogo de la vertical activa (categorías, productos, favoritos, unidades, impuestos). */
export function useCatalog(): VerticalCatalog {
  const { vertical } = useVertical();
  return useMemo(() => getVerticalCatalog(vertical), [vertical]);
}
