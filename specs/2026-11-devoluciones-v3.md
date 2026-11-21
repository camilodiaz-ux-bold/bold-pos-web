# SPEC — Devoluciones v3 (Restaurantes, lista, modal, bloqueo por crédito y ver de la nota crédito)

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Vertical** | Core (el módulo pasa a existir en Retail y en Restaurantes) |
| **Fuente** | Pedido del 21/11 (texto pegado en el chat, 7 puntos). Decisión de alcance de Restaurantes confirmada por el usuario el 21/11. |
| **Antecedentes** | `2026-11-devoluciones-v2.md` (congelado). Este spec lo reemplaza en lo que se indica; lo que no se menciona sigue igual. |

## 1. Alcance

1. **Restaurantes**: el módulo Devoluciones funciona igual que en Retail.
2. **Lista**: sin filtro "Categorías"; columna Ítem con "{n} ítems".
3. **Modal "Registrar Devolución"**: la búsqueda no bloquea ningún documento.
4. **Nota Crédito Electrónica (Devolución)**: nuevo título; la venta a crédito sin pago completo pasa de aviso a bloqueo.
5. **Devolución (Comprobante)**: mismo bloqueo.
6. **Ver de factura y de comprobante**: los botones no se ocultan por crédito sin pago completo.
7. **Ver de la nota crédito**: enlaces a la factura y a la devolución.

## 2. Restaurantes (punto 1)

Decisión del usuario: en Restaurantes se agregan los módulos **devoluciones, facturas de venta, comprobantes y notas crédito**, con documentos de ejemplo propios (ítems de Restaurantes), y el funcionamiento es el mismo de Retail. El **reporte de Devoluciones** también va en Restaurantes. **Ajustes no se agrega** a Restaurantes (respuesta del 21/11).

- **Módulos** (`vertical/modules.ts`): `devoluciones`, `comprobantes` y `facturas-venta` dejan de ser exclusivos de Retail (pasan a core). Sin cambios en `ventas` (Restaurantes) ni en `cotizaciones`.
- **Menú**: Ítems → Devoluciones, y en Ingresos: Comprobantes, Facturas de Venta y Notas crédito aparecen en las dos verticales (respuesta 3), junto a "Ventas" en Restaurantes.
- **Rutas**: se abren a Restaurantes todas las de §4 de v2 más `/notas-credito[/:numero]`, `/items/devoluciones[/:numero]`, `/facturas-venta[/:id]` y `/comprobantes[/:id]`. `moduloDeRuta` se actualiza para que cambiar de vertical conserve la pantalla.
- **Datos de ejemplo de Restaurantes**: `buildRestaurantSeedVentas` suma comprobantes y facturas con ítems del catálogo de Restaurantes y los mismos 9 casos de uso de Retail (anulado, nota crédito total, a crédito, descuento, sin inventario, ya devuelto, conflicto, etc.), más la factura a crédito del punto 4. La semilla de devoluciones (números 201…) se vuelve por vertical, con ítems de cada una (incluidas las de 2+ ítems). Las claves de localStorage de devoluciones y pendientes pasan a ser por vertical.
- **Ajustes**: sin cambios; el módulo `ajustes` sigue solo en Retail y el menú Ajustes no aparece en Restaurantes. Los motivos de devolución y el consecutivo de devolución de Restaurantes usan los valores iniciales de la semilla (sin pantalla para editarlos).
- **Reporte**: el informe de Devoluciones se agrega al menú **Reportes → sección Administrativos** de Restaurantes, con los datos de Restaurantes. Ruta `/reportes/restaurantes/devoluciones` (reutiliza la pantalla del informe; el guard `ReporteDetalleRoute` lo deja pasar).
- **Fuera de cambio**: el selector "Caso de uso" y los datos de ejemplo de Retail.

## 3. Lista de devoluciones (punto 2)

- Se elimina el filtro "Categorías". Orden de filtros: Sucursales, Motivo, Tipo de devolución, Rango de fechas.
- Columna **Ítem**: un solo ítem → su nombre; varios → "{n} ítems" (también en devoluciones totales). Semilla con varios: 207, 212 y 218.
- Se elimina el campo de categoría de la lógica del filtro y de los datos **solo si ningún otro lugar lo usa** (se verifica al implementar; detalle y reporte ya no lo muestran).

## 4. Modal "Registrar Devolución" (punto 3)

- La búsqueda trae los documentos que coinciden **de la sucursal de la sesión** (se mantiene ese filtro; confirmado el 21/11) y no omite ninguno por su estado: anulados, con nota crédito total, a crédito sin pago completo y con todos los ítems devueltos.
- Los bloqueos y validaciones se muestran siempre después, en la vista a la que lleva "Siguiente".
- Orden: fecha de creación descendente; máximo 20 resultados.
- El resto del modal no cambia.

## 5. Nota Crédito Electrónica (Devolución) y Devolución (Comprobante) (puntos 4 y 5)

- Título "Nota Crédito Electrónica (Devolución)" en `/facturas-venta/:id/devolucion`, `/notas-credito/nueva` y `/notas-credito/nueva?origen=sin-documento`. El de comprobante sigue "Devolución (Comprobante)".
- **Crédito sin pago completo = bloqueo** (antes aviso): fondo coral arriba, igual que "Este documento está anulado…". Texto literal: "Esta venta es a crédito y aún no se ha completado el pago. No es posible registrar una devolución." Reemplaza a `MSG_CREDITO_NO_PAGADO`. "Confirmar devolución" queda deshabilitado; la vista abre y muestra datos e ítems.
- Siguen amarillos: "Este documento tiene descuento." y el aviso de Efectivo.
- **Selector "Caso de uso"**: el comprobante `c-3764` pasa de "(avisa)" a **"(bloquea)"** y se agrega una **factura a crédito sin pago completo** (semilla nueva en Retail y en Restaurantes, id propuesto `f-2400422`, pendiente de confirmar que no choca con la numeración).
- En `/notas-credito/nueva` con referencia, elegir esa factura también bloquea.

## 6. Ver de factura y de comprobante (punto 6)

- El crédito sin pago completo deja de ocultar "Hacer devolución" y "Anular": aparecen y abren la vista de devolución con el bloqueo de §5.
- Siguen ocultos solo con documento anulado, nota crédito total o todos los ítems devueltos. "Anular" además con devolución parcial previa.
- Se verifica con `c-3764` y la factura nueva.

## 7. Ver de la nota crédito (punto 7)

- Se agregan dos enlaces en la zona de datos de la cabecera, juntos, con etiquetas:
  - **Factura a la que hace referencia**: el número de la factura; abre `/facturas-venta/:id`.
  - **Devolución a la que hace referencia**: el número de la devolución; abre `/items/devoluciones/:numero`.
- El texto del enlace es solo el número. Se quita el enlace "Ver devolución" de esta pantalla.
- Nota de Sin Documento (p. ej. `/notas-credito/209`): solo el enlace de la devolución.
- Nota de devolución total: "Este documento fue devuelto en su totalidad." queda como texto, sin enlace.
- Notas anteriores (sin devolución): sin ninguno de los dos enlaces.
- Los ver de factura y de comprobante conservan "Ver devolución" (sección "Ítems devueltos" e indicador de devolución total).

## 8. Fases (se aprueban una a una)

1. ✅ **Lista, modal y bloqueo por crédito** (puntos 2, 3, 4, 5 y 6) en Retail: son cambios chicos y se prueban primero donde ya hay datos. Incluye la factura a crédito de ejemplo y el selector.
2. ✅ **Ver de la nota crédito** (punto 7) en Retail.
3. ✅ **Restaurantes** (punto 1): módulos, menú, rutas, semillas propias (ventas y devoluciones), reporte de Devoluciones en Reportes → Administrativos, y verificación de las fases 1 y 2 con `?vertical=restaurantes`.

- **Nota de la fase 1**: el modal conserva el filtro por sucursal (decisión del 21/11); solo se quitó la restricción por estado del documento. La factura de ejemplo quedó como `f-2400422`; la clave de ventas Retail pasó a `bold-pos:ventas:retail:v4`.

- **Nota de la fase 2**: la semilla ahora da nota crédito también a las devoluciones Sin Documento (antes solo a las de Factura), para que `/notas-credito/209` exista; aparecen en la lista de Notas crédito como "sin referencia". La clave de devoluciones pasó a `bold-pos:devoluciones:v9`. El indicador de devolución total del ver de la nota crédito va solo como texto (`DevueltoTotalAviso` con `conEnlace={false}`).

- **Notas de la fase 3**: `devoluciones`, `comprobantes` y `facturas-venta` pasaron a core (`modules.ts`). La semilla de Restaurantes suma 12 documentos regulares (6 comprobantes 3753–3758, 6 facturas SETT 2400410–2400415) y los 10 de ejemplo con los **mismos ids** que Retail (`c-3763`, `f-2400418`, `f-2400422`…), con ítems del catálogo de Restaurantes, sucursal "Hub Ciudad del Rio" (la del usuario de la sesión en Ajustes) y clientes Laura Gómez y Carlos Mendoza (identificación y correo de ejemplo agregados a los mapas de `retail/ventasSeed.ts`). Claves nuevas: ventas `bold-pos:ventas:restaurantes:v5`, devoluciones `bold-pos:devoluciones:restaurantes:v1`, pendientes `…-pendientes:restaurantes:v1` y conflicto de demo por vertical; el provider se remonta al cambiar de vertical. `itemDeLinea` también reconoce los ítems sembrados de Restaurantes (`seed-{id}`). El informe sale en Reportes → Administrativos → Devoluciones (`/reportes/restaurantes/devoluciones`, reutiliza `ReporteDevoluciones`).
- **Por validar (fase 3)**: (a) las órdenes `ORD…` de Mesas con tipo comprobante o factura también salen en las listas de Comprobantes y Facturas de Venta de Restaurantes y se pueden devolver; la semilla de devoluciones solo usa los documentos `c-`/`f-`. (b) En Restaurantes los motivos de devolución y el consecutivo quedan en sus valores iniciales (no hay pantalla de Ajustes); los textos de justificación de la semilla y los motivos "Talla o tamaño incorrecto" son los de Retail. (c) Los ítems sembrados de Restaurantes salen casi todos "sin inventario" en la vista de devolución.

## 9. Verificación

`npm run build` y prueba en el navegador, en Retail y en Restaurantes: lista (filtros y "{n} ítems"), modal con documentos anulados / con nota total / a crédito / ya devueltos, bloqueo de crédito en Factura, Comprobante y Sin referencia con la factura nueva, botones en el ver de `c-3764` y de la factura nueva, enlaces en `/notas-credito/208`, `/206` y `/209`, reporte en Restaurantes. Para volver a la semilla, borrar las claves de devoluciones, pendientes, ventas y ajustes.

## 10. Respuestas (21/11)

1. Ajustes: **no se agrega** a Restaurantes.
2. Reporte: **sí**, en el menú Reportes, sección Administrativos.
3. Comprobantes y Facturas de venta: **en Ingresos**.
