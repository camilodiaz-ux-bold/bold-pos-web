# SPEC — Combos: la categoría de venta es la categoría administrativa
### Bold POS Restaurantes — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Septiembre 2026 |
| **Autor** | Producto — Bold POS Restaurantes |
| **Antecedente** | [`specs/2026-09-combos.md`](./2026-09-combos.md) (v2.0, ✅ Implementado) — este documento **supersede puntualmente su §5.5**, el resto del spec original sigue vigente sin cambios |

> **Nota:** `2026-09-combos.md` está congelado y no se reabre (convención de `specs/README.md`). Este spec nuevo documenta un cambio de alcance descubierto después de implementarlo.

---

## 1. Qué cambia

**Antes (spec original §5.5):** un combo siempre se vendía agrupado bajo una categoría de venta fija, "Combos", en Mostrador y Mesas — sin importar qué categoría administrativa (`categoriaId`) se le hubiera asignado en `/items`. `comboItemToCatalogProduct` forzaba `catId: 'combos'` incondicionalmente.

**Ahora:** la categoría de venta de un combo **es la misma que su categoría administrativa**. Un combo con `categoriaId: 'desayunos'` aparece en Mostrador/Mesas bajo el chip "Desayunos", mezclado con los productos individuales de esa categoría — no bajo un chip "Combos" aparte. "Combos" sigue existiendo como categoría de venta legítima, pero solo se puebla con los combos a los que el admin le asignó explícitamente esa categoría (por ejemplo, un combo que no encaja en ninguna categoría de ingredientes puntual).

## 2. Por qué

La versión anterior generaba una duplicidad de taxonomías sin beneficio real: el admin elegía una categoría administrativa en el formulario (ej. "Desayunos" para un combo de desayuno), pero esa elección no tenía ningún efecto en dónde se vendía — el combo terminaba siempre en un cajón aparte ("Combos"), separado de los demás productos de desayuno. Esto es confuso y le resta valor a la categorización: el admin invierte esfuerzo en una elección que el punto de venta ignora.

Alinear ambas categorías tiene ventajas prácticas concretas:
- Un mesero armando un pedido de desayuno encuentra el combo de desayuno junto a los demás productos de esa categoría, sin tener que acordarse de revisar un chip aparte.
- Lo que el admin configura en `/items` deja de ser puramente decorativo.
- "Combos" sigue disponible como categoría explícita para el caso genuino de un combo que mezcla ingredientes de varias categorías y no encaja en ninguna en particular.

## 3. Implementación

- **`src/app/utils/comboBridge.ts`** — `comboItemToCatalogProduct`: `catId: item.categoriaId` en vez de `'combos'` fijo. Se agrega `isSellableCombo(p): p is SellableCombo`, un type guard para identificar un combo vendible sin depender de su `catId` (necesario porque antes se usaba `catId === 'combos'` como proxy de "es un combo", proxy que dejó de ser válido).
- **`src/app/components/MostradorCatalog.tsx`** y **`MesaProductSelector.tsx`** — el merge de combos con el catálogo estático (`byCat`/`byCatMesa`) ya no vuelca todos los combos bajo la clave `'combos'`; cada combo se inyecta en el bucket de su propio `catId`. La tarjeta de producto usa `isSellableCombo(item)` (no `catId === 'combos'`) para decidir si mostrar el badge "Combo" y la segunda línea de descripción — así se ven igual sin importar bajo qué categoría se estén mostrando.
- **`src/app/pages/HomePage.tsx`** y **`MesaProductSelector.tsx`** — el flag `isCombo` de una línea de orden se calcula a partir de si el producto trae `comboComponents` (no de su `catId`), por la misma razón.
- **`src/app/data/productCatalog.ts`** — comentario de la entrada `'combos'` en `CAT_DEFS` actualizado: ya no dice "no es una categoría administrativa", ahora es una categoría administrativa legítima y también de venta.
- **Sin cambios** en `ItemFormPage.tsx`: "Combos" ya estaba disponible como opción en el selector de categoría del formulario (agregado en la Etapa 1 de la implementación original) — con este cambio, esa opción pasa de ser redundante a tener efecto real.

## 4. Fuera de alcance

- No se agregó ningún mecanismo para que un combo aparezca en **más de una** categoría de venta a la vez. Un combo vive en exactamente una categoría de venta: la que el admin le asignó.
- La búsqueda y los favoritos no se ven afectados — ya operaban sobre la lista completa de productos (`allProducts`/`allProductsMesa`), sin filtrar por categoría.

## 5. Verificación

- Un combo con `categoriaId: 'entradas-frias'` aparece en el chip "Entradas Frías" de Mostrador y Mesas, mezclado con los productos individuales de esa categoría, con badge "Combo" y descripción visibles.
- Un combo con `categoriaId: 'combos'` aparece en el chip "Combos".
- El chip "Combos" no muestra nada si ningún combo tiene esa categoría asignada ("Sin productos en esta categoría").
- Buscar un combo por nombre lo encuentra sin importar su categoría.
