# SPEC — Correo de alertas: banner y número que falta, y configuración en Ajustes

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Vertical** | Retail (la configuración vive en Ajustes, módulo `ajustes`); el correo de ejemplo es Core |
| **Rutas** | `/ajustes` (sección Inventarios) y `/items/alertas-stock/ejemplo-correo` |
| **Antecedentes** | `2026-10-alertas-stock-correo.md` (✅), `2026-10-ajustes.md` |

## Qué cambia

1. El correo de ejemplo suma un banner corporativo pendiente arriba y cambia las etiquetas de la derecha por el número que falta para el mínimo.
2. Ajustes → **Inventarios** suma la opción **"Alertas stock bajo"**: configura a quién y con qué frecuencia se envía el correo.

El spec del correo ya está congelado; esto va aparte. Todo sigue siendo visual: **no se envía ningún correo**.

## 1. Correo de ejemplo

- **Banner corporativo pendiente arriba**: igual que el del pie (fondo `--blue-100`, "Bold POS" grande en blanco y debajo "Pendiente diseño corporativo"), pegado al borde superior de la tarjeta del correo. Así el correo queda enmarcado por dos banners marcadores.
- **Lado derecho de cada fila**: las etiquetas de caso (*Existencia negativa*, *Agotado*, *Por debajo del mínimo*, *En el mínimo*) se reemplazan por **el número de unidades que faltan para completar el mínimo**, en **grande** (≈ 28 px, bold, alineado a la derecha) con una leyenda pequeña "para el mínimo" debajo.
  - El número se calcula como `stock bajo − existencia` (mínimo 0). Con existencia negativa, incluye lo que hay que cubrir para volver a 0.
  - El color del número indica la gravedad: rojo si la existencia es ≤ 0, coral si está por debajo del mínimo, ámbar si ya está en el mínimo (número 0).
- **Se mantiene** el resto: nombre del ítem, sucursal y "Existencia X · Stock bajo Y". Se quita la frase "Faltan N para el mínimo" de esa línea (ahora es el número grande) y desaparece el texto del caso junto con la etiqueta.
- Orden, "Los 10 ítems más críticos", "Tienes 24 ítems más en alerta.", el botón y los textos no cambian.

## 2. Ajustes → Inventarios → "Alertas stock bajo"

- Nuevo ítem **"Alertas stock bajo"** (ícono de campana) al final de la tarjeta Inventarios, tras "Lista de precios". Abre un panel lateral, igual que las demás secciones de Ajustes (`SidePanel` derecho: título centrado, X, pie "Cancelar" + acción en píldora).
- **Explicación breve** al inicio: "Recibe por correo un resumen de los ítems que llegaron a su stock bajo, para que puedas reabastecerlos a tiempo. Elige a quién se envía y cada cuánto." y un enlace **"Ver ejemplo del correo"** que navega a `/items/alertas-stock/ejemplo-correo`.
- **Se enviará a**: el correo del negocio (el de Ajustes → Perfil; hoy `contacto@tiendademo.co`), en solo lectura con la nota "Correo del negocio. Puedes cambiarlo en el perfil." *(Sustituye al "xxxejemplo" de tu borrador.)*
- **Correos adicionales (hasta 3)**: lista de campos de correo, cada uno con su papelera, y un botón "Agregar correo" que se deshabilita al llegar a 3. Validaciones: formato de correo válido y sin repetidos (incluido el del negocio), con mensaje bajo el campo. Los campos vacíos se ignoran al guardar.
- **Frecuencia de envío** (radios, una sola):
  - **No enviar**
  - **Enviar el primero de cada mes**
  - **Enviar cada lunes** (valor inicial)
  - **Enviar de lunes a viernes**
  Con "No enviar" aparece la nota "No recibirás correos de alertas de stock bajo."
- **Guardar** persiste en Ajustes (`bold-pos:ajustes:v1`, campo nuevo `alertasStockBajo: { correosAdicionales, frecuencia }`, con valores por defecto para quien ya tiene guardado) y muestra el toast "Alertas de stock bajo guardadas". Cancelar y la X descartan.
- No hay envío real, ni programador, ni historial.

## Código afectado

`EjemploCorreoAlertasPage.tsx`, `data/alertasCorreoEjemplo.ts` (el caso deja de mostrarse), `AjustesPage.tsx` (nueva sección y panel), `PanelesInventario.tsx` (o archivo propio) para `AlertasStockBajoPanel`, `types/ajustes.ts`, `data/ajustesSeed.ts` y `store/ajustesStore.tsx` (campo nuevo y mezcla de defaults).

## Fases

Una sola: ambos puntos.

## Supuestos a confirmar

1. "Etiquetas derechas" = las etiquetas de caso; el número grande las reemplaza (el nombre del caso desaparece).
2. El correo "xxxejemplo" es el correo del negocio de Ajustes → Perfil.
3. Es un panel lateral, como el resto de Ajustes, en vez de un modal centrado.
4. Frecuencia inicial: "Enviar cada lunes".
5. Añadí el enlace "Ver ejemplo del correo" en el panel (no lo pediste).
6. Va sobre la misma rama apilada (`bn-feature/alertas-stock-ajustes`); sus cambios recientes aún no están commiteados.
