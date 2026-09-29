# SPEC — Combos: disponibilidad/existencias
### Bold POS Restaurantes — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.1 — v1.0 deshabilitaba también la selección de sucursales; v1.1 la conserva (ver §1) |
| **Fecha** | Septiembre 2026 |
| **Autor** | Producto — Bold POS Restaurantes |
| **Antecedente** | [`specs/2026-09-combos.md`](./2026-09-combos.md) (v2.0, ✅ Implementado) — este documento **supersede puntualmente su §5.6**, el resto del spec original sigue vigente sin cambios |

> **Nota:** `2026-09-combos.md` está congelado y no se reabre (convención de `specs/README.md`). Este spec nuevo documenta un cambio de alcance descubierto después de implementarlo: la decisión original de §5.6 sobre existencias en combos se revierte.

---

## 1. Qué cambia

**Antes (spec original §5.6):** un combo podía usar el toggle "Ítem con existencias" y la `DisponibilidadCard` completa, exactamente igual que cualquier ítem simple — sin ninguna restricción ni copy distinto.

**Ahora:** un combo **no puede activar existencias propias**, pero sí elige en qué sucursales está activo. Al marcar "Es un combo" en el formulario:
- El toggle "Ítem con existencias" se deshabilita (aparece apagado y no clickeable), con el copy *"Un combo no maneja existencias propias — su disponibilidad depende de sus componentes."*
- La sección "Sucursales con disponibilidad" **sigue completa y editable** — un combo puede estar activo en Sucursal Principal y no en Secundaria, igual que cualquier ítem, aunque no lleve un número de existencia propio. Como el toggle de existencias está apagado, el input numérico de existencia por sucursal nunca aparece (ya dependía de `manejaExistencias`, sin cambios ahí).
- `manejaExistencias` se fuerza a `false` al momento de guardar, sin importar el estado previo del formulario (incluye el caso borde de un ítem simple con existencias configuradas que se convierte en combo — el número se limpia, la selección de sucursal no).
- La validación del formulario **sí exige** "selecciona al menos una sucursal" para un combo, igual que para cualquier ítem — la sección es de nuevo un campo real, no decorativo.

> **v1.0 → v1.1:** la primera versión de este spec ocultaba toda la card "Disponibilidad" para un combo (ni existencias ni sucursales). Se ajustó porque un combo sí necesita poder marcarse activo/inactivo por sucursal — lo único que no tiene sentido es el número de existencia, no la selección de dónde se vende.

## 2. Por qué

Un combo es un producto **derivado**: su disponibilidad real está acotada por el stock de sus componentes, no por un número independiente. Dejar que un admin tipee una existencia propia para el combo es un valor que no se sostiene — puede decir "50 disponibles" mientras un componente real solo tiene 3 unidades.

La razón por la que el spec original lo permitía iba por consistencia con el resto del módulo (ningún ítem de `/items` descuenta existencia al venderse, así que el número siempre es manual). Pero manual y **arbitrario/inconexo** no son lo mismo: para un ítem simple ese número al menos representa *ese* producto; para un combo no representa nada real.

**Por qué no se calcula de forma derivada (la opción "correcta"):** lo ideal sería que la disponibilidad del combo se calculara como `mín(existenciaComponente / cantidadEnCombo)` sobre cada componente. Pero `Item.componentes` referencia el catálogo de venta (`ALL_CATALOG_PRODUCTS`), no los `Item` administrables que sí tienen `existencia` (decisión deliberada del spec original, §5.2, para no acoplar los dos catálogos). No hay una relación garantizada entre un `productId` del catálogo de venta y un `Item` administrable — solo existe por convención en el seed, no como invariante si el usuario crea/edita/borra ítems libremente. Calcularlo bien exigiría la unificación de catálogos que el spec original ya pospuso explícitamente (§13, terreno de Recetas Q1 2027).

Dado ese techo, la solución elegida es la más honesta y barata disponible ahora: **no fingir un número que no se sostiene.**

## 3. Implementación

**`src/app/components/items/DisponibilidadCard.tsx`** — nueva prop `existenciasDisabled?: boolean`: deshabilita el `<Toggle>` de existencias (`disabled={existenciasDisabled}`) y cambia el texto de ayuda; el resto del componente (sucursales, checkboxes) no cambia.

**`src/app/pages/items/ItemFormPage.tsx`**:
- `setEsCombo(next)`: al activar el toggle, limpia `manejaExistencias`/`existencias` — **ya no limpia `sucursalIds`**, esas se conservan.
- `isValid`: la regla `sucursalIds.length === 0` vuelve a aplicar sin excepción para combos.
- Render: `<DisponibilidadCard ... existenciasDisabled={form.esCombo} />` siempre — ya no hay una card alternativa con mensaje informativo.
- `handleSave`: fuerza `manejaExistencias: false` en el draft cuando `form.esCombo` (red de seguridad), pero `sucursales` se guarda igual que para cualquier ítem — ya no se fuerza a `[]`.

## 4. Fuera de alcance

- Calcular disponibilidad derivada de los componentes — requiere unificar `Item` y `CatalogProduct` (ver §13 del spec original).
- Cualquier efecto funcional de la sucursal seleccionada sobre lo que se vende en Mostrador/Mesas — como con cualquier ítem hoy, `sucursales` es informativo/administrativo, no filtra el catálogo de venta.
- Cualquier cambio a cómo los ítems simples manejan existencias — sin cambios.

## 5. Verificación

- Crear/editar un combo: el toggle "Ítem con existencias" aparece apagado y deshabilitado con el copy explicativo; "Sucursales con disponibilidad" se puede marcar/desmarcar normalmente, sin que aparezca ningún input de existencia.
- Guardar un combo sin sucursal seleccionada: botón deshabilitado, igual que cualquier ítem.
- Convertir un ítem simple con existencias configuradas en combo: al activar el toggle, el número de existencia desaparece pero las sucursales marcadas se conservan.
- Un ítem simple (no combo): sin cambios, sigue exigiendo sucursal y con el toggle de existencias interactivo.
