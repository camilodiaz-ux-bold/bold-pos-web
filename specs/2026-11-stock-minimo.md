# SPEC — Stock mínimo: renombre y alineación con las épicas de producto

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Vertical** | Core (Retail y Restaurantes), salvo Ajustes y el permiso (Retail) |
| **Antecedentes** | Specs `2026-10-alertas-stock*` (✅, congelados). Fuente: `2026-11-01 - Stock minimo/EPIC-1…EPIC-4` (fuera del repo) |

## 1. Renombre "Stock bajo" → "Stock mínimo"

- **Textos visibles**: columnas, labels de input, aria-labels, toasts, aviso azul, Excel, correo de ejemplo, panel de Ajustes, tooltip del header.
- **Identificadores**: `stockBajo` → `stockMinimo`, `alertasStockBajo` → `alertasStockMinimo`, `HEADER_STOCK_BAJO_EJEMPLO` → `HEADER_STOCK_MINIMO_EJEMPLO`, `PanelAlertasStockBajo` → `PanelAlertasStockMinimo`, `contarItemsEnStockBajo` → `contarItemsEnStockMinimo` y derivados.
- **Datos guardados**: la clave de ítems sube a `bold-pos:items:retail:v8` (la semilla ya usa el campo nuevo). La de Restaurantes (`bold-pos:items:v3`) sube igual si guarda el campo. En `bold-pos:ajustes:v1` el campo viejo se migra al leer (`alertasStockBajo` → `alertasStockMinimo`).
- **Nombre del módulo**: submenú, título de la página y botón del header pasan a **"Alertas Stock mínimo"**. En Ajustes → Inventarios: **"Alertas Stock mínimo"**. "Lista de Items" sigue sin marcarse activa dentro del módulo.

## 2. Botón "Gestionar stock mínimo" en la Lista de ítems

En el encabezado de `/items`, junto a "Actualización masiva", "Importar" y "Nuevo ítem": botón `btn-outline-coral` **"Gestionar stock mínimo"** que navega a `/items/alertas-stock`.

## 3. Cambios de contenido (según las épicas)

**Ajustes → Alertas Stock mínimo (EPIC 1)**
- Nota del correo: "Correo del comercio. Puedes cambiarlo en el perfil."
- Toast: "Alertas de stock mínimo guardadas". Con "No enviar": "No recibirás correos de alertas de stock mínimo."
- Explicación: "Recibe por correo un resumen de los ítems que llegaron a su stock mínimo, para que puedas reabastecerlos a tiempo. Elige a quién se envía y cada cuánto."

**Correo de ejemplo (EPIC 1)**
- Asunto: "Tienes N ítems con alerta de stock mínimo".
- Introducción: "Algunos de tus ítems llegaron al stock mínimo que definiste o quedaron por debajo. Te avisamos para que puedas reabastecerlos a tiempo y no perder ventas."
- Fila: "Existencia {X} · Stock mínimo {Y}"; leyenda "para el mínimo".
- Pie: "Recibes este correo porque tienes alertas de stock mínimo activas. Puedes cambiar el stock mínimo de cada ítem o desactivar la alerta desde Ítems → Alertas de Stock."
- Botón "Ver todas las alertas" → la lista. Banners corporativos siguen pendientes. Sigue siendo solo visual.

**Header (EPIC 1)**
- Tooltip: "Tienes ítems con alerta de Stock mínimo".
- El número **sigue fijo en 73** (constante, 1–99, `99+` desde 100). No pasa a conteo real; el ícono siempre se ve. Clic → lista.

**Lista (EPIC 3)**
- Nueva confirmación **"¿Aplicar a todas las sucursales?"** ("El cambio de alerta de Stock mínimo se aplicará a las N sucursales." · Cancelar / Aplicar). Aparece sin filtro de sucursal, si el ítem está en más de una sucursal, al guardar el stock mínimo o cambiar la alerta. Con una sola sucursal guarda directo. Cancelar no guarda.
- Toasts y aviso azul con "stock mínimo".
- Columna "Stock mínimo" y modal Sucursales con la misma columna.

**Formulario de ítem y Editar variante (EPIC 2)**: label "Stock mínimo (Unidades)", placeholder "0", aria-labels y mensajes con el nuevo nombre. Reglas sin cambios.

**Actualización masiva (EPIC 4)**
- Excel: columna `Stock mínimo` (antes `Stock bajo`); texto de la tarjeta de plantilla y del paso 1 con el nuevo nombre.
- **Modal "Revisa la carga de tu plantilla"** (solo ejemplo): al elegir un archivo en el selector (`.xlsx`/`.xls`) se abre con **datos de muestra fijos** (no se lee el archivo): "{N} registros correctos" y "{M} registros con error", los primeros 3 errores como "Fila {n}: {motivo}" (motivos: "Código y sucursal no encontrados", "El stock mínimo debe ser un número entero mayor o igual a 0", "La alerta debe ser Sí o No"), y "¿Estás seguro de continuar? Solo se actualizarán los registros correctos." Botones Cancelar / Continuar; "Continuar" muestra un toast de ejemplo y **no modifica ningún dato**. "Continuar" se deshabilita si los correctos son 0 (se prueba con una variante de muestra).

## 4. Permiso "Gestionar alertas Stock mínimo"

- Se agrega al catálogo de permisos (Productos → Ítems) con el label **"Gestionar alertas Stock mínimo"**.
- **Sin efecto**: aparece en la matriz de Roles, pero está activo por defecto en todos los roles (existentes y nuevos) y no se aplica en ningún control. No hay controles ocultos ni deshabilitados por él.

## 5. Fuera de alcance

- Sucursales inactivas (el prototipo solo tiene Principal y Secundaria; no existe estado activo).
- Conteo real del header; lectura real del `.xlsx` cargado; envío real de correos.
- Los specs `2026-10-alertas-stock*` no se editan (congelados).

## 6. Verificación

`npm run build` sin errores nuevos; probar en el navegador: botón de Lista de ítems, textos en cada pantalla, confirmación al aplicar a todas, modal de carga, permiso en Roles activo, ítems de la clave v8 con las 6 alertas de ejemplo.
