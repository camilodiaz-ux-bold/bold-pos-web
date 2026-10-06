# SPEC — "Listas de precios" y "Variantes disponibles" en el formulario de ítem (Retail)
### Bold POS — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | Listo para implementación |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Octubre 2026 |
| **Vertical** | Retail |
| **Antecedente** | [`specs/2026-10-combos-variantes-retail.md`](./2026-10-combos-variantes-retail.md) |

---

## 1. Qué cambia

El formulario de ítem (`/items/nuevo` y edición) de **Retail** suma dos secciones del POS Retail real. Son **solo visuales**: no tienen lógica ni se guardan. Restaurantes no cambia.

- **Listas de precios:** toggle dentro de la card "Precio total de venta", debajo de Costo. Siempre apagado; al hacer clic muestra el toast `Listas de precios — próximamente`.
- **Variantes disponibles:** card nueva debajo de "Precio total de venta", con el botón "Agregar variante". Al hacer clic muestra el toast `Variantes — próximamente`.

Los toasts son los mismos `toast.info('… — próximamente')` que ya usan los módulos no desarrollados del prototipo.

## 2. Validación: un combo no puede tener variantes

Si "Es un combo" está activo, el botón "Agregar variante" queda **deshabilitado** (gris, `cursor: not-allowed`, tooltip "Un combo no puede tener variantes") y la card muestra una nota: *"Un combo no puede tener variantes: se arma con productos existentes (puedes elegir sus variantes en "Componentes del combo"). Desactiva "Es un combo" si quieres agregarlas."*

Al desactivar el combo la nota desaparece y el botón se habilita. Un combo ya guardado tiene el toggle bloqueado, por lo que siempre ve la nota.

## 3. Módulos

Se registra `listas-precios` como módulo exclusivo de Retail en `src/app/vertical/modules.ts`; "Variantes disponibles" usa el módulo `variantes` ya existente.

## 4. Fuera de alcance

- Lógica de listas de precios y creación de variantes desde el formulario.
