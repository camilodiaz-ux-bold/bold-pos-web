# Specs de producto — Bold POS Restaurantes

Specs de producto tipo PRD para features del prototipo `bold-pos-web`. Distinto de `src/imports/*.md`, que son prompts puntuales de Figma-to-code, no documentos de producto.

Cada spec tiene su propio campo "Estado" en la tabla de encabezado. Una vez marcado `✅ Implementado`, el archivo se congela — no se edita más. Si aparece un cambio de alcance después, se escribe un spec nuevo que referencia al anterior como antecedente.

## Índice

| Fecha | Spec | Estado | Resumen |
|---|---|---|---|
| 2026-09 | [2026-09-combos.md](./2026-09-combos.md) | ✅ Implementado | Motor de productos compuestos (Combos): agrupar productos existentes a precio fijo, vendible en Mostrador y Mesas, integrado al módulo de gestión de Items (`/items`). Base reutilizable para Recetas (Q1 2027). |

## Convención

- Nombre de archivo: `AAAA-MM-nombre-feature.md`.
- Cada spec nuevo agrega una fila arriba, con fecha, link y un resumen de una línea.
- El estado válido es uno de: `Draft`, `Listo para implementación`, `✅ Implementado`, `Superado por [spec-x]`.
