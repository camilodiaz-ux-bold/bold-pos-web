# SPEC — Alertas de Stock (Items → submenú)

| | |
|---|---|
| **Estado** | Draft |
| **Vertical** | Core (Retail y Restaurantes) — ver pregunta 1 |
| **Ruta** | `/items/alertas-stock` y `/items/alertas-stock/actualizacion-masiva` |
| **Antecedentes** | `2026-10-items-variantes-lista.md`, `2026-10-items-crear-tabs.md` |

## Qué cambia

Un submenú nuevo **"Alertas de Stock"**, última posición dentro de **Items** (después de "Variantes de inventario"). Abre una lista compacta de ítems donde el comercio define, por ítem y sucursal, el nivel de **stock bajo** y activa o inactiva la **alerta**. Es un módulo del prototipo: no existe en el POS real, así que el diseño sale de lo pedido y se construye con Merlin y los componentes del repo (`FilterPill`, `Toggle`, clases `btn`).

## 1. Lista

Una fila por ítem inventariable (`manejaExistencias`, no combo) y activo. Los combos y los no inventariables no aparecen: no tienen existencia propia.

| Columna | Comportamiento |
|---|---|
| Desplegable | Solo si el ítem tiene variantes (Retail), igual que `/items`: chevron que abre una fila por variante. |
| Código | Texto. |
| Nombre | Texto. |
| Sucursal | Con filtro de sucursal: su nombre. Sin filtro: "Todas (N)". |
| Existencia | Número. Con filtro, la de esa sucursal; sin filtro, la suma. Puede ser negativa (como en `/items`). |
| Stock bajo | Input numérico (entero ≥ 0). Al escribir, aparece junto al input un botón chulito (✓); al darle clic guarda y el chulito desaparece. Escape o salir sin guardar descarta el cambio. |
| Alerta | Check que activa/inactiva la alerta; guarda al instante. Deshabilitado mientras el ítem no tenga "Stock bajo" definido. |
| ⋮ | Menú de 3 puntos con una opción: **Ver sucursales**. |

- **Fila resaltada**: si la alerta está activa y `existencia ≤ stock bajo`, la existencia se muestra en rojo (token de error de Merlin). Es el único "disparo" de la alerta en el prototipo; no hay notificaciones.
- **Sin filtro de sucursal (fila "Todas")**: el input de Stock bajo y el check de Alerta aplican a **todas** las sucursales del ítem. Si las sucursales tienen valores distintos, el input muestra "Varios" como placeholder y el check queda en estado intermedio. Para que el usuario sepa que esto pasará, se avisa en cuatro puntos:
  1. **Aviso fijo sobre la tabla** (solo mientras no hay filtro de sucursal): "Estás viendo todas las sucursales. El stock bajo y la alerta que cambies se aplicarán a todas las sucursales del ítem. Para definir valores distintos por sucursal, usa ⋮ → Ver sucursales o filtra por sucursal." Desaparece al elegir una sucursal.
  2. **Tooltip** en el input y en el check de las filas "Todas": "Se aplica a las N sucursales".
  3. **Toast al guardar**: "Stock bajo guardado en las N sucursales de «Nombre»" (o "Alerta activada/inactivada en las N sucursales…").
  4. La celda Sucursal dice "Todas (N)", no un nombre suelto.
- Con filtro de sucursal, editar afecta solo esa sucursal; no se muestra el aviso.
- Valores distintos por sucursal: se editan una a una en el modal "Ver sucursales" (§3).
- **Filas de variante (Retail)**: muestran código y nombre de la variante, existencia, y su propio Stock bajo y Alerta, con la misma regla de "Todas" / sucursal y los mismos avisos. Cada variante tiene además su propio ⋮ → Ver sucursales. La fila padre no tiene input ni check: su existencia es la suma de las variantes.
- Paginación de 25 como `/items`. Estado vacío: "Ningún ítem coincide con los filtros".

## 2. Header

- **Filtros** (en fila, con `FilterPill`): Sucursal (select), Categoría (select), Buscar por nombre (input; también acepta código).
- **Dos switches**:
  - *Orden*: **Alfabético** (default, A→Z por nombre) | **Por alerta**. "Por alerta" pone primero los ítems con alerta activa y existencia ≤ stock bajo, luego los de alerta activa, luego el resto; dentro de cada grupo, alfabético.
  - *Vista*: **Ver todo** (default) | **Solo alertas activas** (solo ítems con la alerta activa).
- **Actualización masiva**: botón secundario arriba a la derecha; navega a `/items/alertas-stock/actualizacion-masiva`.

## 3. Modal "Ver sucursales"

- Parte superior: datos del ítem (imagen/miniatura, nombre, código, categoría, existencia total).
- Debajo, lista con una fila por sucursal en la que el ítem maneja existencia: **Sucursal · Existencia · Stock bajo (input con chulito, como en la lista) · Alerta (check)**.
- Es el lugar para definir **valores distintos por sucursal**: cada fila se guarda por separado, sin tocar las otras. Una nota al pie lo dice: "Aquí cada sucursal se edita por separado."
- Se abre desde el ⋮ de un ítem simple o de una variante (en una variante, la parte superior muestra ítem padre + variante). El ⋮ del ítem padre con variantes no ofrece "Ver sucursales": sus sucursales se ven por variante.
- Cierra con X o clic fuera. Los cambios guardados se reflejan en la lista al instante.

## 4. Actualización masiva

Pantalla réplica de `pos.stg.bold.co/#/retail/inventory/item/bulk-update` (leída en solo lectura; el flujo posterior al botón no se pudo relevar sin ejecutarlo):

- Flecha de volver + título "Edición masiva de ítems".
- Banner con degradado azul → rojo de Merlin, chip "Ítems", título "Edita de forma masiva los ítems de tu negocio" e ícono de documento con flecha.
- "Edita tus ítems de forma masiva en 2 pasos": ① "Descarga la plantilla y edita tus ítems" ("Edita los ítems en la plantilla de Excel.") ② "Carga la plantilla" ("Sube tu archivo de plantilla Excel con los ítems editados.").
- Botón primario "Iniciar edición masiva".
- **Solo visual**: el botón muestra un toast "Próximamente" (patrón del repo para botones sin lógica, ver `BoldNavBar`). No genera ni procesa Excel.

## Modelo de datos

Un solo modelo; la lista, el modal y futuros reportes derivan de él.

- `ItemSucursal` suma `stockBajo?: number` y `alerta?: boolean` (default: sin definir / `false`).
- **Variantes con sucursales**: dependen de `2026-10-variantes-modelo.md` (Draft), que convierte las variantes en parte de `Item` con `sucursales: ItemSucursal[]` y existencia real por sucursal, como el POS real. Alertas de Stock **no** define un modelo propio para ellas: `stockBajo` y `alerta` viven en el `ItemSucursal` de cada variante, igual que en el ítem. Este spec se implementa **después** de la fase 1 de ese spec.
- `itemsStore` expone `setAlertaStock(itemId, { sucursalIds, variantId?, stockBajo?, alerta? })`; `sucursalIds` trae todas las del ítem (o de la variante) en modo "Todas" o una sola con filtro/modal.
- Persiste con el resto de ítems (clave de ítems existente); borrar esa clave vuelve a la semilla.
- La semilla no trae alertas definidas, salvo 3 a 4 ítems con alerta activa y existencia por debajo del mínimo para poder ver el resaltado y el orden "Por alerta".

## Menú y rutas

- `BoldNavBar`: nuevo subitem `alertasstock` ("Alertas de Stock", ícono `BellRing` de lucide) al final de Items, activo con `pathname.startsWith('/items/alertas-stock')`.
- "Lista de Items" deja de marcarse activa en `/items/alertas-stock*` (hoy usa `startsWith('/items')`).
- `App.tsx`: dos rutas hijas de `items` (`alertas-stock`, `alertas-stock/actualizacion-masiva`), declaradas antes de `:id/editar`.
- `/items/alertas-stock` queda dentro de `OWNED_ROUTES` por el `/items` ya listado.

## Fases

1. **Datos + menú + lista**: modelo, store, subitem, ruta, tabla compacta con edición de Stock bajo y Alerta, filtros, switches y resaltado.
2. **Modal "Ver sucursales" y Actualización masiva**: modal con datos del ítem y pantalla visual.

Cada fase se prueba en el navegador antes de pasar a la siguiente.

## Decisiones confirmadas

1. **Vertical**: Core (Retail y Restaurantes).
2. **Fila "Todas"**: una fila por ítem; sin filtro de sucursal la edición aplica a todas las sucursales y la UI lo avisa claramente (§1). Los valores distintos por sucursal se editan en el modal "Ver sucursales".
3. **Variantes**: cada variante con su propia alerta y sus sucursales, como el POS real. La existencia por sucursal de las variantes es provisional (ver Modelo de datos).
4. **Combos y no inventariables**: excluidos de la lista.
