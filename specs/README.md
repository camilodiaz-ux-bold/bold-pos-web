# Specs de producto — Bold POS (Retail y Restaurantes)

Specs de producto tipo PRD para features del prototipo `bold-pos-web`. Distinto de `src/imports/*.md`, que son prompts puntuales de Figma-to-code, no documentos de producto.

Cada spec tiene su propio campo "Estado" en la tabla de encabezado. Una vez marcado `✅ Implementado`, el archivo se congela — no se edita más. Si aparece un cambio de alcance después, se escribe un spec nuevo que referencia al anterior como antecedente.

## Índice

| Fecha | Spec | Estado | Resumen |
|---|---|---|---|
| 2026-10 | [2026-10-selector-vertical.md](./2026-10-selector-vertical.md) | ✅ Implementado | Selector de vertical Retail / Restaurantes (solo en Inicio): registro de módulos core vs. exclusivos, menú y rutas por vertical, datos propios de Retail por fases. |
| 2026-09 | [2026-09-checkout-factura.md](./2026-09-checkout-factura.md) | Listo para implementación | Checkout: al pagar se abre el panel lateral "Venta Completada" (Imprimir factura / Nueva venta) y la factura se imprime como ticket de 80 mm con los combos desglosados. Complementa §7.5 de `2026-09-combos.md`. |
| 2026-09 | [2026-09-combos-conversion-irreversible.md](./2026-09-combos-conversion-irreversible.md) | ✅ Implementado | Revierte §9 de `2026-09-combos.md`: un combo ya guardado no se puede volver a convertir en ítem normal — el toggle "Es un combo" se bloquea al editarlo. |
| 2026-09 | [2026-09-combos-categoria-venta.md](./2026-09-combos-categoria-venta.md) | ✅ Implementado | Revierte §5.5 de `2026-09-combos.md`: la categoría de venta de un combo es su categoría administrativa (`categoriaId`), no un chip "Combos" forzado siempre. |
| 2026-09 | [2026-09-combos-disponibilidad.md](./2026-09-combos-disponibilidad.md) | ✅ Implementado | Revierte §5.6 de `2026-09-combos.md`: un combo ya no puede activar existencias propias — su disponibilidad depende de sus componentes, no de un número manual inconexo. |
| 2026-09 | [2026-09-combos.md](./2026-09-combos.md) | ✅ Implementado | Motor de productos compuestos (Combos): agrupar productos existentes a precio fijo, vendible en Mostrador y Mesas, integrado al módulo de gestión de Items (`/items`). Base reutilizable para Recetas (Q1 2027). |

## Convención

- Nombre de archivo: `AAAA-MM-nombre-feature.md`.
- La tabla de encabezado de cada spec incluye el campo **Vertical**: `Core`, `Retail` o `Restaurantes`.
- Cada spec nuevo agrega una fila arriba, con fecha, link y un resumen de una línea.
- El estado válido es uno de: `Draft`, `Listo para implementación`, `✅ Implementado`, `Superado por [spec-x]`.
