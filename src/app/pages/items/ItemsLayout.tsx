/**
 * ItemsLayout — route layout del módulo ITEMS.
 *
 * Ya no monta ItemsProvider aquí: se movió a RootLayout (junto a
 * FavoritesProvider/MesasStoreProvider) porque Mostrador y Mesas —que viven
 * bajo `/`, no bajo `/items`— necesitan useItems() para vender combos (ver
 * src/app/utils/comboBridge.ts y specs/2026-09-combos.md §5.3). Se conserva
 * este archivo como passthrough para no tocar la definición de rutas en
 * App.tsx.
 */
import { Outlet } from 'react-router';

export function ItemsLayout() {
  return <Outlet />;
}
