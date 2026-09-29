# SPEC — Combos: un combo guardado no se puede volver a convertir en ítem normal
### Bold POS Restaurantes — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Septiembre 2026 |
| **Autor** | Producto — Bold POS Restaurantes |
| **Antecedente** | [`specs/2026-09-combos.md`](./2026-09-combos.md) (v2.0, ✅ Implementado) — este documento **supersede puntualmente la fila "Un combo existente se desmarca" de su §9**, el resto del spec original sigue vigente sin cambios |

> **Nota:** `2026-09-combos.md` está congelado y no se reabre (convención de `specs/README.md`). Este spec nuevo documenta un cambio de alcance descubierto después de implementarlo.

---

## 1. Qué cambia

**Antes (spec original §9):** un combo ya guardado se podía desmarcar (`esCombo: false`) desde el formulario de edición — dejaba de venderse en Mostrador/Mesas, pero conservaba su `comboSaleId` por si se volvía a marcar después.

**Ahora:** una vez que un ítem se guarda como combo, el toggle "Es un combo" queda **deshabilitado** al editarlo — no se puede volver a convertir en un ítem normal. El toggle se ve apagado (mismo tratamiento visual que el toggle de existencias) con el texto: *"Un combo no se puede convertir en un ítem normal después de creado."*

**Lo que no cambia:**
- Un ítem **simple** todavía se puede marcar como combo al editarlo (dirección permitida, spec original §9) — el bloqueo es de una sola vía.
- Crear un ítem nuevo: el toggle es completamente interactivo, se puede activar y desactivar libremente antes de guardar por primera vez.
- Editar cualquier otro campo de un combo ya guardado (nombre, precio, componentes, sucursales, imagen, activo/inactivo) — sin cambios.

## 2. Por qué

Un combo tiene un rastro que otras entidades del prototipo ya dependen de forma irreversible: su `comboSaleId` (usado como `productId` en líneas de orden ya vendidas) y el snapshot de `comboComponents` denormalizado en pedidos históricos. Aunque técnicamente nada se rompe si se desmarca (el spec original ya contemplaba conservar el `comboSaleId`), permitir ese vaivén invita a un estado confuso: un ítem que fue combo, dejó de serlo, y podría volver a serlo — sin que quede claro en la UI qué pasó con las órdenes que se hicieron mientras sí lo era.

Tratar "es un combo" como una decisión de una sola vía, tomada en el momento de creación, es más simple de razonar y evita esa ambigüedad — consistente con que otros campos estructurales del ítem (como `comboSaleId` mismo) tampoco se pueden editar directamente desde el formulario.

## 3. Implementación

Todo el cambio vive en `src/app/pages/items/ItemFormPage.tsx`:

- `comboLocked = mode === 'edit' && !!existingItem?.esCombo` — true solo si el ítem YA era combo al entrar al formulario de edición.
- El `<Toggle>` de "Es un combo" recibe `disabled={comboLocked}`; el texto de ayuda cambia condicionalmente igual que ya hace el de existencias.
- No se tocó `itemsStore.tsx`: `updateItem` sigue aceptando un draft con `esCombo: false` si alguna otra vía lo enviara — el bloqueo vive en la UI del formulario, no en el store.

## 4. Fuera de alcance

- No se deshabilitó ningún otro campo del formulario para un combo ya guardado — solo el toggle "Es un combo".
- No se removió la lógica de `itemsStore` que conserva `comboSaleId` al desmarcar (spec original §9) — quedó como código muerto defensivo, inofensivo, por si en el futuro se decide revertir esta decisión.

## 5. Verificación

- Editar un combo ya guardado: el toggle aparece apagado y no responde al clic; el resto del formulario (nombre, componentes, sucursales, precio) se edita con normalidad.
- Editar un ítem simple: el toggle sigue interactivo, se puede marcar como combo.
- Crear un ítem nuevo: el toggle es completamente interactivo en ambas direcciones.
