# SPEC — Ajustes a Alertas de Stock

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Vertical** | Core (Retail y Restaurantes) |
| **Ruta** | `/items/alertas-stock`, `/items/alertas-stock/actualizacion-masiva` y `/items/alertas-stock/actualizacion-masiva/plantilla` |
| **Antecedentes** | `2026-10-alertas-stock.md` (✅, PR #49 sin unir), `2026-10-variantes-modelo.md` |

## Qué cambia

Seis ajustes sobre Alertas de Stock tras revisarlo. El spec original queda congelado; aquí va lo nuevo. Fase 1 = puntos 1 a 5; fase 2 = punto 6.

## 1. Vista "Todas las sucursales"

Sin filtro de sucursal:

- La celda **Sucursal** de **cada** registro dice siempre `Todas (N)`, también cuando N = 1 y también en la fila padre de un ítem con variantes (N = sucursales en las que alguna de sus variantes está habilitada). Hoy con N = 1 mostraba el nombre suelto.
- La columna **Existencia desaparece** (encabezado y celdas). La suma entre sucursales no ayuda a decidir un stock bajo.
- Como la existencia ya no se ve, la alerta disparada se señala con un punto coral junto a `Todas (N)` y tooltip "Stock en o por debajo del mínimo en K de N sucursales". *(Propuesta mía; sin esto se perdería el resaltado.)*
- El aviso fijo se conserva, con el texto ajustado al punto 3.

Con filtro de sucursal: la celda Sucursal muestra su nombre, la columna **Existencia vuelve** y el aviso no aparece.

## 2. Activar la alerta pone el stock bajo en 0

El check de **Alerta** ya no se deshabilita cuando falta el stock bajo. Al activarlo:

- Las sucursales en alcance que **no tenían** stock bajo quedan en `stockBajo = 0`; las que ya tenían uno lo conservan. Así un check nunca queda "activo sin umbral".
- El input de Stock bajo pasa a mostrar `0` (o "Varios" si las sucursales difieren).
- Toast: "Alerta activada en … (stock bajo en 0 donde no estaba definido)". Con una sola sucursal: "Alerta activada — «Nombre» (stock bajo en 0)".
- Desactivar la alerta **conserva** el stock bajo. Borrar el stock bajo (input vacío + chulito) sigue apagando la alerta.
- Aplica igual en la lista y en el modal. Con stock bajo 0 la alerta se dispara solo si la existencia es 0 o negativa.

## 3. Botón "Sucursales" en vez de ⋮

- La columna de acciones tiene un botón **Sucursales** (`btn btn-cancel btn--sm`) en lugar del menú ⋮. Abre el mismo modal, que pasa a titularse "Sucursales".
- Sigue estando en ítems simples y en cada variante; la fila padre con variantes no lo lleva.
- Texto del aviso: "… Para definir valores distintos por sucursal, usa el botón Sucursales o filtra por sucursal."
- Se elimina `MenuFila`.

## 4. Modal: columna "Habilitada"

El modal lista **todas** las sucursales del comercio, con una columna nueva **después de Sucursal**:

`Sucursal · Habilitada · Existencia · Stock bajo · Alerta`

- **Habilitada** (check) = la sucursal tiene disponibilidad del ítem o de la variante, igual que "Sucursales con disponibilidad" del formulario de ítem.
- Deshabilitada: existencia `—`, stock bajo y alerta deshabilitados y vacíos.
- Deshabilitar **quita** la sucursal de `sucursales` del ítem o de la variante (se pierden su existencia y su umbral), como ya hace el formulario al desmarcarla. Si la existencia es distinta de 0 se pide confirmación: "Al deshabilitar «Sucursal» se perderá su existencia (N unidades)."
- Volver a habilitar crea la sucursal con existencia 0 y sin umbral.
- Siempre debe quedar al menos una habilitada: el check de la última se bloquea con tooltip "El ítem debe tener al menos una sucursal".
- Modelo: `itemsStore.setSucursalHabilitada(itemId, { sucursalId, variantId?, habilitada })`. No cambia el tipo de datos; usa `ItemSucursal`.
- Efecto en la lista: `Todas (N)` cuenta las habilitadas, y el ítem sale del filtro de una sucursal donde ya no está.

## 5. Columna Existencia

- Los números van **alineados a la derecha**, con el encabezado también a la derecha y cifras tabulares. Aplica a la lista (cuando la columna se ve), al modal y al "Existencia total" de su cabecera.
- Todo valor negativo se muestra con el signo menos (`-4`) y **en rojo**, haya o no alerta. Los valores en rojo por alerta disparada (existencia positiva ≤ stock bajo) se mantienen.

## 6. Actualización masiva

### 6.1 Pantalla inicial

El título del banner pasa a **"Edita de forma masiva las alertas de stock de tus ítems"**. El resto se conserva. "Iniciar edición masiva" navega al paso siguiente (antes mostraba un toast).

### 6.2 Paso "Descarga la plantilla" (`/items/alertas-stock/actualizacion-masiva/plantilla`)

Réplica del paso que sigue en el POS real (`/#/retail/inventory/item/bulk-update`, tras "Iniciar edición masiva", relevado en solo lectura sin descargar nada):

- Tarjeta blanca de ancho completo con flecha de volver (a la pantalla inicial) a la izquierda, título "Edición masiva de ítems" centrado y X a la derecha (vuelve a `/items/alertas-stock`).
- Ícono de documento con flecha de descarga, título **"Descarga la plantilla con tus alertas de stock"** y texto "Descarga y edita las alertas de stock en la plantilla de Excel".
- Tarjeta clicable con ícono de Excel: **"Plantilla de alertas de stock"** — "Esta plantilla contiene tus ítems con su stock bajo y alerta, listos para ser actualizados." y un ícono de descarga a la derecha. *(Los textos del real hablan de "ítems"; los adapté a alertas de stock.)*
- Enlace coral "Ya tengo la plantilla actualizada": solo visual, toast "Próximamente" (el paso de carga no está en este alcance).

### 6.3 Modal "Descargar plantilla"

Al hacer clic en la tarjeta de descarga se abre un modal con dos elecciones y los botones Cancelar / Descargar:

- **Sucursales**: "Todas las sucursales" (por defecto) o "Una sucursal", que muestra un select con las sucursales.
- **Contenido**: "Todos los ítems" (por defecto) o "Solo los que hoy tienen alerta de stock activa".
- Si la combinación no tiene filas (ej. nadie tiene alerta activa), se muestra "No hay ítems para descargar con esta selección" y Descargar queda deshabilitado.
- **Descargar genera un `.xlsx` real** con la librería `xlsx` que el repo ya usa (`generateVentasAsyncXlsx.ts`). Hoja "Alertas de stock", una fila por unidad (ítem simple o variante) por sucursal habilitada: `Código · Nombre · Variante · Sucursal · Existencia · Stock bajo · Alerta (Sí/No)`. "Solo alerta activa" deja las filas con alerta = Sí. Nombre del archivo: `alertas-stock-<todas|nombre-sucursal>-AAAA-MM-DD.xlsx`. Toast "Plantilla descargada" y el modal se cierra.
- La carga y el procesamiento del Excel editado quedan fuera de alcance.

## Código afectado

`AlertasStockPage.tsx`, `VerSucursalesModal.tsx`, `AlertaControles.tsx`, `ActualizacionMasivaAlertasPage.tsx`, `utils/alertasStock.ts`, `store/itemsStore.tsx`, `App.tsx`; se elimina `MenuFila.tsx`. Nuevos: `PlantillaAlertasPage.tsx`, `DescargarPlantillaModal.tsx` y `utils/generateAlertasStockXlsx.ts`. La semilla no cambia.

## Fases

1. **Puntos 1 a 5**: vista "Todas", check que pone 0, botón Sucursales, columna Habilitada, columna Existencia.
2. **Punto 6**: título, paso de plantilla, modal de descarga y generación del `.xlsx`.

Cada fase se prueba en el navegador antes de pasar a la siguiente.

## Supuestos a confirmar

1. "La cantidad entre paréntesis" = el `(N)` de `Todas (N)` en cada registro (incluido N = 1).
2. "Habilitada" = disponibilidad de la sucursal (quitarla del ítem), no un interruptor aparte de la alerta.
3. Punto 5: hoy los negativos ya muestran el signo menos; el cambio concreto es alinear a la derecha y poner en rojo todo negativo. Dime si te referías a otra cosa.
4. La descarga genera un Excel real (no solo un toast).
5. Los textos del paso de descarga se adaptan a "alertas de stock".
6. Rama: este trabajo se apila sobre `bn-feature/alertas-stock` (PR #49 aún sin unir); su PR iría con base en esa rama.
