/**
 * ItemsLayout — route layout del módulo ITEMS.
 *
 * Monta ItemsProvider aquí (no en RootLayout, junto a los otros 4 stores)
 * para que el catálogo sembrado de Items solo se escriba en localStorage
 * la primera vez que el usuario visita /items, no en cada carga de la app.
 */
import { Outlet } from 'react-router';
import { ItemsProvider } from '../../store/itemsStore';

export function ItemsLayout() {
  return (
    <ItemsProvider>
      <Outlet />
    </ItemsProvider>
  );
}
