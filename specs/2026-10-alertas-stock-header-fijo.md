# SPEC — Número fijo en el ícono de stock bajo del header (prototipo)

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Vertical** | Core (Retail y Restaurantes) |
| **Antecedentes** | `2026-10-alertas-stock-header.md` (✅) |

## Qué cambia

El ícono de stock bajo del header deja de calcular el número del inventario. Para el prototipo muestra un **número fijo de ejemplo: 73**, aunque no sea real, para que quien revise el diseño siempre vea cómo se ve el círculo.

- El número sale de una constante (`HEADER_STOCK_BAJO_EJEMPLO`, en `data/alertasCorreoEjemplo.ts`). Se cambia en un solo lugar y acepta cualquier valor de 1 a 99+ (desde 100 muestra `99+`).
- El ícono **siempre se ve** (ya no se oculta con 0), en Retail y en Restaurantes.
- Tooltip inmediato y clic a `/items/alertas-stock`: sin cambios.
- La función `contarItemsEnStockBajo` se conserva en `utils/alertasStock.ts` para volver al número real cuando se quiera.
- El número ya no coincide con la lista de Alertas de Stock ni con el correo de ejemplo (que usa 34): es solo visual.
