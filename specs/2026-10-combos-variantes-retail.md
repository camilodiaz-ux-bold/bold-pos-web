# SPEC — Variantes en los componentes de un Combo (Retail)
### Bold POS — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | Listo para implementación |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Octubre 2026 |
| **Vertical** | Retail |
| **Antecedente** | [`specs/2026-09-combos.md`](./2026-09-combos.md) (✅ Implementado) — Restaurantes conserva el comportamiento de ese spec sin cambios. |

---

## 1. Qué cambia

En el POS Retail real un ítem puede tener hasta 2 tipos de variante (ej. Talla × Color) y cada combinación (Azul / S, Negro / M…) es un SKU con precio, código, costo y existencia propios.

En **Retail**, al armar un combo (`/items/nuevo` con "Es un combo"), si un componente es un producto con variantes hay que elegir **la combinación exacta**. En **Restaurantes** no cambia nada.

## 2. Comportamiento

- Los productos con variantes aparecen en el buscador como "N variantes · desde $X". Al hacer clic se despliega la lista de combinaciones (Variante, Precio de venta, Código, Existencia) y se elige una.
- Los productos sin variantes se agregan como hoy.
- El mismo producto puede entrar varias veces con variantes distintas; cada variante cuenta como un componente para el mínimo de 2. No se puede repetir la misma variante.
- La fila del componente muestra la variante y su código, y el precio c/u es el de la variante. La "Suma individual" usa el precio de la variante.
- Un componente de un producto con variantes sin variante elegida bloquea el guardado.
- En Mostrador, Checkout y factura el componente se nombra "Producto — Azul / S".

## 3. Datos

- `ItemComboComponente.variantId?: string` (ausente = producto entero).
- Variantes mock en `src/app/data/retail/productVariants.ts` (ids 211, 221, 233, 241, 251). `useCatalog().productVariants` las expone; Restaurantes recibe `{}`.
- Se usa el módulo `variantes` (solo Retail) vía `has('variantes')`.
- La clave de storage de Items de Retail sube a `bold-pos:items:retail:v2` para resembrar el combo de ejemplo con variantes.

## 4. Fuera de alcance

- UI para crear o editar variantes en el formulario de un ítem normal.
- Vender productos sueltos con variante en Mostrador.
- Descontar existencias por variante al vender un combo.
