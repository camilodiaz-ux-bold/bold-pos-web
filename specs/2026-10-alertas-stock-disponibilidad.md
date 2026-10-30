# SPEC — Alerta de stock en la disponibilidad del ítem y pulido de Alertas de Stock

| | |
|---|---|
| **Estado** | Listo para implementación |
| **Vertical** | Core (Retail y Restaurantes); lo de variantes, solo Retail |
| **Rutas** | `/items/nuevo`, `/items/:id/editar`, `/items/alertas-stock`, `/items/alertas-stock/actualizacion-masiva` y `/…/plantilla` |
| **Antecedentes** | `2026-10-alertas-stock.md`, `2026-10-alertas-stock-ajustes.md`, `2026-10-variantes-modelo.md` |

## Qué cambia

Siete ajustes: uno nuevo en el formulario de ítem (módulo existente) y seis de pulido sobre Alertas de Stock. Los specs anteriores quedan congelados. Fase 1 = puntos 1 a 3 (formulario, "Disponible" y confirmación); fase 2 = puntos 4 a 7 (Alertas de Stock).

## 1. Alerta de stock bajo en la Disponibilidad del ítem

En la card **Disponibilidad** del formulario (`DisponibilidadCard`), cuando el ítem es inventariable (toggle "Ítem con existencias" activo) y una sucursal está marcada, bajo su input "Existencias (Unidades)" se agregan:

- **Stock bajo** (input numérico, entero ≥ 0, opcional) y, debajo, un **check "Activar alerta de stock bajo"**.
- Activar el check con el stock bajo vacío lo deja en **0**, como en Alertas de Stock; desactivarlo conserva el valor; borrar el valor apaga la alerta.
- Es una sola configuración por sucursal marcada: cada sucursal con su propio stock bajo y su propio check. Se guarda con "Guardar cambios" del ítem (es parte del formulario, no guarda al instante).
- No aparece para combos (no manejan existencias propias) ni cuando el toggle de existencias está apagado.
- **Variantes (Retail)**: el panel "Editar variante" suma lo mismo bajo la existencia de cada sucursal marcada. La tabla de variantes no cambia.
- Modelo: usa los campos que ya existen, `ItemSucursal.stockBajo` y `alerta`. El formulario los conserva al editar (hoy los pisaría al guardar). Sin cambios de datos ni de semilla.
- Alertas de Stock y el formulario leen y escriben lo mismo: lo que se configura en uno se ve en el otro.

## 2. Modal "Sucursales": "Habilitada" pasa a "Disponible"

Para ser coherente con "Sucursales con disponibilidad" del formulario:

- La columna y su check se llaman **Disponible** (antes "Habilitada"); mensajes y tooltips cambian en consecuencia ("{sucursal} disponible" / "{sucursal} no disponible").
- Confirmación al quitar la disponibilidad: "¿Quitar la disponibilidad en {sucursal}?" — "Se perderá su existencia ({N} unidades)." con botones Cancelar / Quitar.
- El check de Disponible usa el mismo acento (`--blue-100`) que los checks de sucursal del formulario.

## 3. Modal de confirmación roto

El modal de confirmación (`ConfirmDeleteModal`) se ve sin relleno, con el texto pegado al borde y los botones recortados (captura del usuario). Causa: depende de clases de espaciado que aquí no se aplican. Se arregla con estilos propios del componente (relleno de 32 px, ancho 400 px, botones lado a lado). Es un componente compartido: la corrección beneficia también a los demás modales de borrar y descartar del proyecto, sin cambiar su API.

## 4. Orden "Por alerta" por criticidad

El switch "Por alerta" ordena **de lo más crítico a lo menos crítico**. La métrica no se muestra:

- **Con alerta activa**: `criticidad = existencia − stock bajo` (mientras más baja, más crítico; negativa = ya disparada).
- **Sin alerta activa**: `criticidad = existencia` (compite en el mismo orden con ese valor).
- **Varias sucursales** (vista "Todas"): se toma la sucursal más crítica. Con filtro de sucursal, solo esa.
- **Ítem con variantes**: se toma la variante más crítica (la de menor valor); los hijos dentro del padre también van de más a menos crítica.
- Orden ascendente por criticidad; el empate se resuelve por nombre. "Alfabético" no cambia.

## 5. Actualización masiva: textos

- **Pantalla inicial**: chip "Alertas de stock"; "Edita las alertas de stock de tus ítems en 2 pasos"; paso 1 "Descarga la plantilla y edita tus alertas de stock" / "Edita el stock bajo y la alerta en la plantilla de Excel."; paso 2 "Carga la plantilla" / "Sube tu archivo de plantilla Excel con las alertas de stock editadas."
- **Ambas pantallas**: el encabezado pasa a "Edición masiva de alertas de stock".

## 6. "Ya tengo la plantilla actualizada" abre el selector de archivos

- Abre el selector de archivos del equipo (`<input type="file">`, `.xlsx` y `.xls`). Es el único alcance: **no se lee, procesa ni sube nada**.
- Al elegir un archivo solo se muestra un toast "Carga de la plantilla — próximamente" y el campo se limpia. *(El toast es una propuesta mía para que no parezca que no pasó nada.)*

## 7. Tono más claro para las variantes

El fondo de las filas de variante en Alertas de Stock pasa de `--blue-10` a un tono más claro (mezcla de `--blue-10` con blanco al 50 %).

## Código afectado

`DisponibilidadCard.tsx`, `ItemFormPage.tsx`, `EditarVarianteDrawer.tsx`, `VerSucursalesModal.tsx`, `ConfirmDeleteModal.tsx`, `AlertasStockPage.tsx`, `utils/alertasStock.ts`, `ActualizacionMasivaAlertasPage.tsx`, `PlantillaAlertasPage.tsx`. No hay cambios en el store ni en la semilla.

## Fases

1. **Puntos 1 a 3**: alerta en el formulario (ítem y variante), "Disponible" y modal de confirmación.
2. **Puntos 4 a 7**: orden por criticidad, textos, selector de archivos y color.

Cada fase se prueba en el navegador antes de pasar a la siguiente.

## Supuestos a confirmar

1. El control de la alerta en el formulario es un input "Stock bajo" más un check, por sucursal marcada (como en la captura, debajo de Existencias).
2. "Los demás textos de la pantalla" = los de la pantalla inicial de Actualización masiva y el encabezado de las dos pantallas.
3. Tras elegir el archivo solo hay un toast, sin leerlo.
4. Esto se hace sobre la misma rama apilada (`bn-feature/alertas-stock-ajustes`), cuyo trabajo anterior aún no está commiteado; conviene commitearlo antes para no mezclar.
