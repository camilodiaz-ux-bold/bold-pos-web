# SPEC — Ítems con variantes en el listado (Retail)
### Bold POS — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | Listo para implementación |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Octubre 2026 |
| **Vertical** | Retail |
| **Antecedente** | [`specs/2026-10-combos-variantes-retail.md`](./2026-10-combos-variantes-retail.md) — de ahí salen las variantes mock. |

---

## 1. Qué cambia

En `/items` (Retail), un ítem con variantes se muestra como en el POS Retail real: una fila padre con un chevron y, al expandirla, una fila por variante. Restaurantes no cambia.

## 2. Comportamiento

- **Fila padre:** chevron en lugar del checkbox (`▸` contraído, `▾` expandido; arranca contraída). Precio `$0` y existencia = suma de sus variantes. No se puede seleccionar para acciones en lote.
- **Filas hijas:** sin checkbox; código, nombre `Padre - Azul / S`, precio, existencia, tipo, toggle Activo y lápiz propios de la variante.
- Clic en una fila (padre o hija) o en su lápiz abre la edición del ítem padre. El estado Activo de una variante es solo visual (no se persiste).
- "Mostrando N de M" cuenta ítems padre, no variantes.

## 3. Datos

- `Item.catalogProductId?: number` enlaza el ítem con `RETAIL_PRODUCT_VARIANTS`. El seed de Retail lo asigna; la clave de storage sube a `bold-pos:items:retail:v3`.

## 4. Fuera de alcance

- Crear o editar variantes desde el formulario del ítem.
- Persistir el estado Activo por variante.
