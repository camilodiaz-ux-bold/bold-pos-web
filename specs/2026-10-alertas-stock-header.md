# SPEC — Ícono de stock bajo en el header

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Vertical** | Core (Retail y Restaurantes) |
| **Ruta destino** | `/items/alertas-stock` |
| **Antecedentes** | `2026-10-alertas-stock.md`, `2026-10-alertas-stock-disponibilidad.md` |

## Qué cambia

En la barra superior (`BoldTopBar`), junto a la campana de notificaciones, aparece un **ícono de stock bajo** con un círculo rojo que muestra cuántos ítems están en stock bajo. Al hacer clic lleva a la lista de Alertas de Stock.

## Comportamiento

- **Ubicación**: a la izquierda de la campana, con el mismo tamaño (24 px), color y separación (16 px). Orden en el header: nombre del comercio · ícono de stock bajo · campana · avatar.
- **Ícono**: `PackageMinus` de lucide (una caja con un signo menos), para no confundirlo con la campana.
- **Círculo rojo**: mismo estilo que el de la campana (`--coral-100`, texto blanco, 16 px, borde blanco) en la esquina superior derecha, con el número de ítems. Muestra `9+` desde 10, igual que la campana.
- **Tooltip**: "Tienes ítems con alerta de Stock bajo".
- **Clic**: navega a `/items/alertas-stock`.
- **Cuándo se ve**: solo cuando hay al menos un ítem en stock bajo. Con 0 no se muestra el ícono (el tooltip dejaría de ser cierto). El número se actualiza solo al cambiar el inventario o las alertas.
- Accesible: es un botón con `aria-label` igual al tooltip y el número.

## Qué cuenta como "ítem en stock bajo"

Un **ítem** (no una variante ni una sucursal) cuenta una vez si tiene la alerta activa y su existencia está en el stock bajo o por debajo, en al menos una de sus sucursales o, si tiene variantes, en alguna de ellas. Solo ítems inventariables, activos y no combos, los mismos de la lista de Alertas de Stock. Es el mismo criterio que pinta de rojo la existencia en esa lista.

- Se calcula en vivo del inventario (`itemsStore`) con la lógica de `utils/alertasStock.ts` (nueva función `contarItemsEnStockBajo`). No es un dato de muestra.
- Con los datos sembrados de Retail el número inicial sale de las alertas de ejemplo; Restaurantes no trae alertas, así que allí no se ve hasta que se configure una.

## Código afectado

`BoldNavBar.tsx` (`BoldTopBar`), `utils/alertasStock.ts`. Sin cambios en el store ni en la semilla.

## Fases

Una sola.

## Supuestos a confirmar

1. El número es de **ítems** (un ítem con varias variantes o sucursales en alerta cuenta una vez), no de unidades ni de sucursales.
2. Con 0 ítems en stock bajo el ícono **se oculta** en lugar de mostrarse sin círculo.
3. Ícono `PackageMinus`.
4. Va sobre la misma rama apilada (`bn-feature/alertas-stock-ajustes`), cuyos cambios recientes aún no están commiteados.
