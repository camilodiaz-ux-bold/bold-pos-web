# SPEC — Combos: disponibilidad/existencias
### Bold POS Restaurantes — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Septiembre 2026 |
| **Autor** | Producto — Bold POS Restaurantes |
| **Antecedente** | [`specs/2026-09-combos.md`](./2026-09-combos.md) (v2.0, ✅ Implementado) — este documento **supersede puntualmente su §5.6**, el resto del spec original sigue vigente sin cambios |

> **Nota:** `2026-09-combos.md` está congelado y no se reabre (convención de `specs/README.md`). Este spec nuevo documenta un cambio de alcance descubierto después de implementarlo: la decisión original de §5.6 sobre existencias en combos se revierte.

---

## 1. Qué cambia

**Antes (spec original §5.6):** un combo podía usar el toggle "Ítem con existencias" y la `DisponibilidadCard` completa, exactamente igual que cualquier ítem simple — sin ninguna restricción ni copy distinto.

**Ahora:** un combo **no puede activar existencias propias**. Al marcar "Es un combo" en el formulario:
- El toggle "Ítem con existencias" y el selector de sucursales dejan de estar disponibles para ese ítem.
- Se reemplaza la card "Disponibilidad" por un mensaje informativo: *"Un combo no maneja existencias propias — su disponibilidad depende de sus componentes."*
- `manejaExistencias` se fuerza a `false` y `sucursales` a `[]` al momento de guardar, sin importar el estado previo del formulario (incluye el caso borde de un ítem simple con existencias configuradas que se convierte en combo — esos datos se limpian al activar el toggle).
- La validación del formulario deja de exigir "selecciona al menos una sucursal" para un combo (antes bloqueaba el guardado incluso sin existencias reales que declarar).

## 2. Por qué

Un combo es un producto **derivado**: su disponibilidad real está acotada por el stock de sus componentes, no por un número independiente. Dejar que un admin tipee una existencia propia para el combo es un valor que no se sostiene — puede decir "50 disponibles" mientras un componente real solo tiene 3 unidades.

La razón por la que el spec original lo permitía iba por consistencia con el resto del módulo (ningún ítem de `/items` descuenta existencia al venderse, así que el número siempre es manual). Pero manual y **arbitrario/inconexo** no son lo mismo: para un ítem simple ese número al menos representa *ese* producto; para un combo no representa nada real.

**Por qué no se calcula de forma derivada (la opción "correcta"):** lo ideal sería que la disponibilidad del combo se calculara como `mín(existenciaComponente / cantidadEnCombo)` sobre cada componente. Pero `Item.componentes` referencia el catálogo de venta (`ALL_CATALOG_PRODUCTS`), no los `Item` administrables que sí tienen `existencia` (decisión deliberada del spec original, §5.2, para no acoplar los dos catálogos). No hay una relación garantizada entre un `productId` del catálogo de venta y un `Item` administrable — solo existe por convención en el seed, no como invariante si el usuario crea/edita/borra ítems libremente. Calcularlo bien exigiría la unificación de catálogos que el spec original ya pospuso explícitamente (§13, terreno de Recetas Q1 2027).

Dado ese techo, la solución elegida es la más honesta y barata disponible ahora: **no fingir un número que no se sostiene.**

## 3. Implementación

Todo el cambio vive en `src/app/pages/items/ItemFormPage.tsx`:

- `setEsCombo(next)`: al activar el toggle, limpia `manejaExistencias`/`sucursalIds`/`existencias` en el mismo `setForm`.
- `isValid`: la regla `sucursalIds.length === 0` ahora es `!form.esCombo && sucursalIds.length === 0`.
- Render: `{form.esCombo ? <mensaje informativo> : <DisponibilidadCard ... />}` en la columna derecha, mismo lugar donde iba `DisponibilidadCard`.
- `handleSave`: fuerza `manejaExistencias: false, sucursales: []` en el draft cuando `form.esCombo`, como red de seguridad adicional (no depende solo del reset en `setEsCombo`).

No se tocó `DisponibilidadCard.tsx`, `itemsStore.tsx` ni el modelo de datos (`Item.manejaExistencias`/`sucursales` siguen siendo los mismos campos; para un combo, siempre valen `false`/`[]`).

## 4. Fuera de alcance

- Calcular disponibilidad derivada de los componentes — requiere unificar `Item` y `CatalogProduct` (ver §13 del spec original).
- Cualquier cambio a cómo los ítems simples manejan existencias — sin cambios.

## 5. Verificación

- Crear/editar un combo: la card "Disponibilidad" se reemplaza por el mensaje informativo; el botón de guardar no exige sucursal.
- Convertir un ítem simple con existencias configuradas en combo: al activar el toggle, la configuración de existencias desaparece del formulario.
- Un ítem simple (no combo): sin cambios, sigue exigiendo sucursal y mostrando `DisponibilidadCard` normal.
