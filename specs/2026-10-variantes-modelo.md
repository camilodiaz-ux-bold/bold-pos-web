# SPEC — Variantes de ítem como modelo real (réplica del POS real)

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Vertical** | Retail (módulo `variantes`); Restaurantes no cambia |
| **Rutas** | `/items/nuevo`, `/items/:id/editar` (card Variantes), `/items/variantes` (módulo Variantes de inventario) |
| **Antecedentes** | `2026-10-items-variantes-lista.md`, `2026-10-listas-precios-variantes-form.md`, `2026-10-combos-variantes-retail.md`, `2026-10-items-crear-tabs.md` |

## Por qué

Hoy las variantes son una constante de solo lectura (`RETAIL_PRODUCT_VARIANTS` en `data/retail/productVariants.ts`): no se guardan, no se editan, su "Activo" es solo visual y tienen **una sola existencia**, sin sucursales. La card "Variantes" del formulario es un botón "próximamente". En el POS real (relevado en solo lectura en `/#/retail/inventory/item/update/48389` y `/#/retail/inventory/inventory-variants`) cada variante tiene precio, código, costo, activo y **existencia por sucursal**, y el ítem las crea y edita desde su formulario con tipos que salen de un catálogo.

Este spec convierte las variantes en parte del modelo de `Item`, persistidas y editables. Sirve de base a `2026-10-alertas-stock.md`, que deja de necesitar una existencia por sucursal "provisional".

## 1. Modelo

Un solo modelo; la lista, los reportes, los combos y las alertas derivan de él.

- **Catálogo de tipos de variante** (`VarianteTipo`): `{ id, nombre, opciones: string[], activo }` — ej. "Tallas": S / XS / M / L. Store propio `variantesStore` con clave `bold-pos:variantes-catalogo:v1`. Semilla: los tipos de `RETAIL_PRODUCT_VARIANTS` (Color, Talla) más Tallas y Colores.
- **`Item`** suma, solo para Retail y solo si no es combo:
  - `tiposVariante?: { tipoId: string; opcionesActivas: string[] }[]` — hasta 2 tipos, en orden (Variante 1, Variante 2).
  - `mismoPrecioVariantes: boolean` (toggle "Mismo precio en todas las variantes").
  - `variantes?: ItemVariante[]`.
- **`ItemVariante`**: `{ id, opciones: string[] (una por tipo), codigo, precioBase, precioTotal, costo, activo, sucursales: ItemSucursal[] }`. `ItemSucursal` es el mismo del ítem y trae `existencia` (y `stockBajo?`, `alerta?` de Alertas de Stock).
- **Reutiliza campos del ítem**: `manejaExistencias` es el toggle "Variantes con existencias"; `impuestoId` es el "Impuesto para todas las variantes"; `sucursales` del ítem queda vacío cuando hay variantes (la existencia vive en cada variante). **Transitorio en la fase 1**: para que el formulario actual (que aún pide sucursales) siga siendo válido, la semilla deja en `Item.sucursales` la suma por sucursal de las variantes; todo lo que se muestra se deriva de `variantes`. La fase 2 oculta ese bloque y retira el dato.
- **Derivados, nunca guardados**: existencia del padre = suma de sus variantes (activas) por sucursal; "Total: N (Unidades)"; label de la variante ("Azul / S").
- **Ids**: las variantes sembradas conservan sus ids actuales (`211-azul-s`, etc.) para que los combos que ya referencian `{ productId, variantId }` sigan funcionando. Los componentes de combo resuelven la variante desde el ítem (por `catalogProductId`), no desde la constante.
- **Persistencia**: dentro de los ítems (`itemsStore`); borrar las claves de ítems vuelve a la semilla. La semilla migra las 5 familias actuales (211, 221, 233, 241, 251) y reparte la existencia vieja entre Principal y Secundaria de forma determinista, ya como dato real de la semilla (no derivado en tiempo de ejecución).
- `RETAIL_PRODUCT_VARIANTS` queda solo como fuente de la semilla y deja de importarse desde componentes.

## 2. Formulario de ítem (pestaña "Ítem simple", Retail)

La card "Variantes" visual se reemplaza por **"Variantes disponibles"**, como la del POS real:

- Fila de dos toggles: **Variantes con existencias** (ayuda: "Al activar, puedes agregar la disponibilidad del ítem por sucursal.") y **Mismo precio en todas las variantes**.
- **Impuesto para todas las variantes**: select de impuesto, obligatorio.
- **Variantes activas** con "Total: N (Unidades)" a la derecha:
  - *Variante 1*: select con los tipos activos del catálogo. Debajo, chips con las opciones del tipo: activas en rosa con ×, inactivas en gris; clic activa/desactiva. Con la variante 1 elegida aparece "Agregar segunda variante" (máximo 2); la segunda se elige igual y las filas son el producto cartesiano de las opciones activas.
  - Botón **Crear variante**: abre un panel lateral (nombre + opciones con "+") que crea un tipo nuevo en el catálogo y lo deja elegido.
  - Un select por tipo filtra la tabla por opción (placeholder = nombre del tipo), "Mostrando N de M" y "Limpiar filtros".
  - **Tabla**: check de activa · Variante · Precio de venta (con el impuesto debajo) · Código · Precio de costo · Existencia · botón "Editar". Paginación como el real.
- **Mismo precio**: encendido, el formulario pide un solo precio de venta y todas las variantes lo copian (la columna Precio deja de ser editable por variante); apagado, cada variante tiene el suyo.
- **Panel "Editar variante"** (lateral): cabecera con nombre del ítem, etiqueta de la variante, chip del tipo y toggle de activa; Precio total de venta (base, impuesto de solo lectura, total); Código; Costo; Listas de precios (toggle visual); **Disponibilidad**: "Sucursales con disponibilidad" con un check por sucursal y, bajo cada una marcada, "Existencias (Unidades)". Cancelar / Guardar.
- Validaciones: al menos una variante activa; precio, código (opcional, se autogenera si va vacío) y costo con las mismas reglas del ítem; existencia entera por cada sucursal marcada.
- Un combo no puede tener variantes: se mantiene la nota y el bloqueo de `2026-10-listas-precios-variantes-form.md`. Con variantes, el bloque de precio y de Disponibilidad propio del ítem se ocultan (sus datos viven en las variantes).
- Cambiar un ítem con variantes a combo no se permite mientras tenga variantes activas.
- Restaurantes: la card no existe (`has('variantes')`).

## 3. Lista de ítems y reportes

- `ItemsTable`: la fila padre suma existencias de las variantes; las filas de variante muestran código, nombre, precio y existencia reales; el **toggle Activo de cada variante se guarda** (hoy es solo visual). Editar abre el formulario del ítem.
- Con filtro de sucursal, las variantes muestran su existencia en esa sucursal (hoy la ignoran).
- Reportes de Retail que abren ítems por variante (`reportesAdmin.ts`: Lista de ítems, Inventarios) leen `item.variantes` y ya filtran por sucursal sobre las variantes.

## 4. Módulo "Variantes de inventario"

Página nueva en `/items/variantes`, subitem del menú de Items ya existente (hoy muestra un toast; el menú del real lo tiene en el mismo lugar), registrada en `modules.ts` como parte de `variantes` (solo Retail):

- Título "Variantes de inventario", botón "Nueva variante" (rosa) arriba a la derecha y buscador "Buscar por palabra clave".
- Tabla: Nombre · Variantes (opciones separadas por " / ") · Activo (check) · Acciones (editar, eliminar). "Mostrando N de M" y selector de filas por página.
- Crear/editar abre el mismo panel de "Crear variante" del formulario (nombre + opciones con "+"). Eliminar pide confirmación y se bloquea con mensaje si algún ítem usa el tipo.
- Desactivar un tipo lo oculta del select de Variante 1/2 en ítems nuevos; los ítems que ya lo usan lo conservan.

## Fases

1. **Modelo y migración**: tipos, store del catálogo, campos nuevos en `Item`, semilla migrada, consumidores (lista, reportes, combos) leyendo del ítem; sin cambios de UI salvo existencia por sucursal y "Activo" persistido.
2. **Formulario**: card "Variantes disponibles", panel "Editar variante", panel "Crear variante".
3. **Módulo Variantes de inventario**: página, ruta y subitem del menú.

Cada fase se aprueba y prueba en el navegador antes de la siguiente.

## Supuestos a confirmar

Solo se relevó el POS real en lectura; estos puntos no se pudieron ver sin ejecutar acciones:

1. "Mismo precio en todas las variantes" encendido: un solo campo de precio que copian todas.
2. Cómo se agrega la segunda variante ("Agregar segunda variante"): el real lo muestra distinto o no lo permite; el prototipo ya soporta 2 tipos.
3. El select de filtro de la tabla filtra por opción del tipo.
4. Eliminar un tipo usado por un ítem se bloquea (el real puede comportarse distinto).
