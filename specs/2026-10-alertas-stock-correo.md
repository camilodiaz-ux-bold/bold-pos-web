# SPEC — Orden por sucursal y "Ejemplo de correo" de Alertas de Stock

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Vertical** | Core (Retail y Restaurantes) |
| **Rutas** | `/items/alertas-stock` y `/items/alertas-stock/ejemplo-correo` |
| **Antecedentes** | `2026-10-alertas-stock.md`, `2026-10-alertas-stock-ajustes.md`, `2026-10-alertas-stock-disponibilidad.md` |

## Qué cambia

1. El switch de orden se deshabilita en la vista "Todas las sucursales".
2. Nuevo botón **"Ejemplo de correo"** en el header de Alertas de Stock que abre una pantalla con un correo de ejemplo. Es una referencia para el equipo que lo va a maquetar: **no se envía ni se guarda nada**.

## 1. Switch de orden con "Todas las sucursales"

La criticidad (existencia − stock bajo) es por sucursal, así que no tiene sentido ordenar por alerta mientras se ven todas.

- Sin filtro de sucursal: el switch **Orden** queda deshabilitado en **Alfabético** y la opción "Por alerta" no se puede elegir (cursor `not-allowed`, tooltip "Filtra por una sucursal para ordenar por alerta").
- Con filtro de sucursal, el switch funciona como hoy.
- Si estaba en "Por alerta" y el usuario quita el filtro de sucursal, vuelve solo a "Alfabético". Al elegir de nuevo una sucursal arranca en "Alfabético".
- El switch **Vista** (Ver todo / Solo alertas activas) no cambia.

## 2. "Ejemplo de correo"

### Botón y pantalla

- Botón secundario **"Ejemplo de correo"** en el header de la lista, a la izquierda de "Actualización masiva". Navega a `/items/alertas-stock/ejemplo-correo`.
- Pantalla con una franja superior: flecha de volver (a la lista), el rótulo "Ejemplo de correo — no se envía ningún correo" y un chip "Solo referencia".
- Debajo, un marco de bandeja de correo: asunto grande, remitente, destinatario y fecha, y el cuerpo del correo en una tarjeta centrada de 600 px, como se vería en el cliente de correo.

### Contenido (borrador; el equipo lo ajusta)

El texto es una propuesta mía a partir de tu esqueleto, para que lo pongas en borrador.

- **Asunto**: "Tienes 34 ítems con alerta de stock bajo"
- **Remitente / destinatario**: "Bold POS" · para "{nombre del comercio}". Fecha: la de hoy.
- **Saludo**: "Hola, {nombre del comercio}:"
- **Introducción**: "Algunos de tus ítems llegaron a su **stock bajo**: la existencia mínima que definiste para cada uno. Te avisamos para que puedas reabastecerlos a tiempo y no perder ventas."
- **Título de la lista**: "Los 10 ítems más críticos". Hasta 10 filas, de la más crítica a la menos (existencia − stock bajo). Cada fila muestra:
  - Nombre del ítem (y variante cuando aplica) y sucursal.
  - **El caso**, como etiqueta de color: *Existencia negativa* (existencia < 0, rojo), *Agotado* (= 0, rojo), *Por debajo del mínimo* (existencia < stock bajo, coral) o *En el mínimo* (existencia = stock bajo, ámbar).
  - "Existencia {X} · Stock bajo {Y}" y, cuando falte, "Faltan {N} para el mínimo".
- **Texto de continuación**: "Tienes **24 ítems más** en alerta."
- **Botón** "Ver todas las alertas": lleva a `/items/alertas-stock`.
- **Pie de texto**: "Recibes este correo porque tienes alertas de stock bajo activas. Puedes cambiar el stock bajo de cada ítem o desactivar la alerta desde Items → Alertas de Stock."
- **Footer tipo banner** (cierra la tarjeta del correo, de borde a borde): fondo azul de Merlin (`--blue-100`), **"Bold POS"** en grande (texto blanco, Montserrat bold, ~32 px, centrado) y debajo, en pequeño y atenuado, **"Pendiente diseño corporativo"**. Es un marcador para que el equipo sepa que ahí va el footer corporativo; no lleva logo ni enlaces.

### Datos del ejemplo

- Es un **ejemplo con datos de muestra**: 34 ítems en alerta en total, 10 visibles y "24 más" (34 − 10). Los nombres salen del catálogo de la vertical activa (Retail o Restaurantes) para que se vea creíble; las existencias y los stock bajo son valores fijos de muestra que cubren los cuatro casos. **No se calculan del inventario real.**
- El nombre del comercio sale de la configuración de la vertical (hoy "Tienda Demo").
- Sin lógica de envío ni de plantillas: solo visual.

## Código afectado

`AlertasStockPage.tsx` (botón y switch deshabilitado), `AlertaControles.tsx` (`SegmentedSwitch` con opciones deshabilitables), `App.tsx` (ruta). Nuevos: `EjemploCorreoAlertasPage.tsx` y los datos de muestra en `data/alertasCorreoEjemplo.ts`.

## Fases

Una sola: ambos puntos.

## Supuestos a confirmar

1. El correo es solo visual y con datos de muestra (34 / 10 / 24 fijos), no calculado del inventario real.
2. El texto del correo es un borrador mío; lo ajustas tú.
3. El botón "Ver todas las alertas" navega a la lista dentro del prototipo (no es un enlace real de correo).
4. Esto va sobre la misma rama apilada (`bn-feature/alertas-stock-ajustes`), cuyos cambios recientes aún no están commiteados; conviene commitearlos antes.
