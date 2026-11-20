# SPEC — Devoluciones v2 (devolución dentro de la nota crédito)

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Vertical** | Retail (Restaurantes no cambia) |
| **Fuente** | `2026-11-19 - Devoluciones/2026-11-19 - Cambios para el prototipo.md` (fuera del repo; los textos de interfaz son literales de ese archivo). Vista real: staging `#/retail/income/credit-note/create`, revisada el 19/11 en solo lectura. |
| **Antecedentes** | `2026-11-devoluciones.md` (v1, congelado). Este spec lo reemplaza en lo que se indica; lo que no se menciona sigue igual. |

## 1. Alcance

Cambio de fondo: se elimina la selección de ítems por pasos del modal de v1. La devolución se hace dentro de la vista **"Nota Crédito Electrónica"** (Factura y Sin Documento) o de una vista nueva **"Devolución"** (Comprobante), que reciben el documento precargado. Factura y Sin Documento crean la devolución **solo cuando la DIAN acepta** la nota crédito (estado "pendiente" simulado y rechazo simulado); Comprobante la crea al confirmar.

Fuera de alcance (pendientes del documento, §10): reporte(s) de ventas afectados y su fecha de afectación; devolución de una venta a crédito no pagada (sin aviso, sin bloqueo); otros ajustes de experiencia.

## 2. Hallazgos de la vista real (staging, 19/11)

| Elemento | Real | Decisión para el prototipo |
|---|---|---|
| Cabecera sin tipo | Tipo de nota · Fecha de Emisión (solo lectura, hoy) · Motivo · Cliente · Descuento (con botón %) · Lista de precios ("General", con X) | Réplica. |
| Con referencia | Suma **Fecha de Factura de Venta** (solo lectura), **Factura de venta** (buscador; sin facturas del cliente: "No se han encontrado facturas de venta") y **Vendedor** (por defecto "Ninguno"). Al elegir factura carga los ítems **editables** con papelera y "Agregar". | Todo precargado y en solo lectura (el real es editable: **diferencia deliberada**). Se agregan alcance, check, cantidad y valor a devolver. |
| Sin referencia | Cambia "Fecha de Factura de Venta" por **Mes de Factura de Venta** (fecha, hoy por defecto), suma **Vendedor** y **Forma de Pago** (obligatoria). | Réplica, según 3.B. |
| Motivos DIAN (6) | Devolución parcial de los bienes y/o no aceptación parcial del servicio · Anulación de factura electrónica · Rebaja o descuento parcial o total · Ajuste de precio · Descuento comercial por pronto pago · Descuento comercial por volumen de ventas | Misma lista. |
| Tabla | Ítem (con "Nuevo +"), Referencia, Cantidad, Impuesto, Precio, Descuento, Total; "Total items N"; botón AGREGAR; papelera por fila | Réplica en sin referencia; en con referencia, sin Agregar ni papelera. |
| Pie | Notas (textarea) · Subtotal, Descuento, impuestos por tipo ("IVA - 19.00%"), Total · botón **GUARDAR** (deshabilitado hasta completar) | El botón pasa a **"Confirmar devolución"**. |
| Cabecera de la vista | "Nota Crédito Electrónica" con X para cerrar, sin menú lateral oculto | Igual (se renderiza dentro del layout, como el real). |

No se vio: opciones de Forma de Pago ni el comportamiento al guardar (no se creó nada en staging).

## 3. Modelo

- Se mantiene **una fila por ítem** (`Devolucion`, filas con el mismo `numero`): el informe sigue "una fila por ítem" (§8 del documento) y la lista agrupa por `numero`. Campos nuevos por fila: `alcance` (`parcial`|`total`), `clienteNombre`, `clienteDocumento`, `ingresaInventario` ya existe. En la nota: `motivoNotaDian`, `formaPagoNota` (Sin Documento), `notas`.
- La devolución **no existe hasta que la DIAN acepta**. Una nota emitida y esperando se guarda aparte (`notasPendientes`, mismo store, clave nueva) con todo lo capturado; al aceptarse se convierte en filas de `Devolucion` (se asigna el número del consecutivo en ese momento, §9.1) y se borra de pendientes; al rechazarse se borra sin efectos.
- **Estado derivado** (un solo modelo): un documento está "Anulado" si tiene una devolución de alcance Total; "tiene devolución" si tiene filas; "nota crédito pendiente" si hay una en `notasPendientes`. `Venta.notaCreditoTotal` de la semilla sigue valiendo. Utilidad pura nueva en `utils/devoluciones.ts` (`estadoDocumentoDevolucion(venta, filas, pendientes)`).
- Claves: `bold-pos:devoluciones:v7` (filas; la v6 era la de la v1) y `bold-pos:devoluciones-pendientes:v1`. No se migra: al subir la clave se vuelve a sembrar (convención del prototipo). La semilla trae `alcance` (Parcial, y algunas Total), `clienteNombre` y `clienteDocumento`; en Sin Documento no hay alcance (se ve "--").
- Egreso (§9.2): cada devolución guarda `egreso: { turno, valor, metodoPago }` (turno abierto al aceptarse; sin turnos, el actual de la sesión). Ver pregunta 5.

## 4. Rutas

Se agregan (no se cambian las existentes), envueltas en `VerticalRoute module="devoluciones"`:

- `/notas-credito/nueva` → "Nota Crédito Electrónica" (tipo editable, desde "Nuevo" de la lista de notas).
- `/facturas-venta/:id/devolucion` → misma vista con la factura precargada y tipo bloqueado (`?alcance=total` para "Anular").
- `/comprobantes/:id/devolucion` → vista nueva "Devolución" (`?alcance=total` para "Anular").
- Sin Documento: `/notas-credito/nueva?origen=sin-documento` (tipo "sin referencia" bloqueado).

## 5. Fases (se aprueban una a una)

1. ✅ **Lista, modal de registro y detalle** (§1, §2 y §7 del documento, salvo el correo): una fila por devolución ("Varios ítems"), columna Alcance, búsqueda por identificación, filtro de categorías por al menos un ítem; modal solo con paso 1 y redirección; detalle con campos Cliente y Alcance, lista de ítems siempre y sin mención al reintento; se quita el correo automático y el correo adicional del registro. Migración del modelo (§3).
2. ✅ **Nota Crédito Electrónica con referencia** (§3.A): cabecera, alcance, tabla con check/cantidad/valor, campos nuevos, totales, avisos y bloqueos, validaciones, salida "¿Salir de la devolución?", turno, DIAN pendiente/aceptada/rechazada simulada, toasts y efectos (§9: número, egreso, inventario, anulación, concurrencia).
3. ✅ **Sin referencia** (§3.B): cabecera editable, tabla editable (ítems activos, sin combos, 1 por ítem o variante, impuesto seleccionable, sin tope), Forma de Pago.
4. ✅ **Vista "Devolución" de comprobantes** (§4): copia sin DIAN, toasts propios.
5. ✅ **Ver de factura, de comprobante y de nota crédito** (§5 y §6): botones "Hacer devolución" y "Anular" (en comprobante reemplaza "Eliminar"), reglas de visibilidad, otra sucursal, "Ver devolución" en devoluciones totales, estado "Anulado" en ver, listas, impresión y descarga, aviso de DIAN pendiente.
6. ✅ **Correo del detalle** (§7.3–7.4): botón "Enviar correo", modal "Enviar detalle de la devolución", simulación del envío con vista del correo y PDF de ejemplo con el formato actual de Bold POS.

## 6. Decisiones de diseño (supuestos míos; confirmar o corregir)

| # | Supuesto |
|---|---|
| S1 | **DIAN simulada** ✔ (respuesta 1): tras "Confirmar devolución" la nota queda "Pendiente" ~3 s y pasa a Aceptada (la devolución aparece y sale el toast). **Rechazo**: botón **"Simular rechazo de la DIAN"** en `PrototypeToolsBar` (check, fijo abajo); si está activo, la siguiente nota se rechaza; todo reinicia y los botones reaparecen. |
| S2 | **Mientras está pendiente**, el usuario sigue en el ver de la factura (con el aviso "Hay una devolución pendiente de aceptación de la DIAN.") y los botones ocultos; la aceptación ocurre aunque navegue (el temporizador vive en el store). |
| S3 | **Concurrencia (§9.6)**: un comprobante de ejemplo (3767, como v1) dispara "Este ítem ya fue devuelto. Actualiza la información e inténtalo de nuevo." al confirmar; el ítem queda "Ya devuelto". |
| S4 | **Permiso "Gestionar Devoluciones"**: sigue siempre activo y sin efecto (D5 de v1). El "modal de sin permiso" del punto 5.5 del documento no se alcanza; no se construye. |
| S5 | **Turno**: se reutiliza el panel "Abrir turno" y el check "Simular que no hay turno abierto" de v1; se abre al entrar a cualquiera de las vistas de devolución. |
| S6 | **Cliente de Sin Documento**: lista de contactos del prototipo (tipo cliente) con búsqueda por nombre o identificación, como el real. |
| S7 | **Forma de Pago (Sin Documento)** ✔ (respuesta 2): opciones **Crédito** y **Contado**; es un dato de la nota, no cambia el método de pago de la devolución. |
| S8 | **Mes de Factura de Venta**: selector de fecha, hoy por defecto; solo informativo. |
| S9 | **Motivo de la nota con alcance Total**: cambia solo a "Anulación de factura electrónica"; si el usuario vuelve a Parcial, regresa a "Devolución parcial de los bienes y/o no aceptación parcial del servicio". |
| S10 | **Cambio de alcance a Total**: marca todos los ítems con cantidad y valor completos y los deshabilita; al volver a Parcial se limpian las marcas. Total queda deshabilitado (con tooltip "Este documento ya tuvo una devolución.") si el documento tiene alguna fila. |
| S11 | **Notas crédito antiguas** del prototipo (semilla) no generan devolución; las notas derivadas de devoluciones de Factura siguen listándose igual. Las notas de Sin Documento aparecen en la lista como "sin referencia". |
| S12 | **Imprimir y descargar** un documento anulado por devolución total muestran "Anulado" (se agrega al impreso del documento, `printInvoice`). |
| S13 | **Egreso**: sin tabla de egresos en el prototipo, queda guardado en la devolución y no se muestra en ninguna vista (cierre de turno sin cambios, como pide el documento). |

## 7. Textos literales

Los de las secciones 2 a 7 y 9 del documento fuente, sin cambios. Lo que se retira: avisos y bloqueos del modal v1, "Se creará una nota crédito por el valor de los ítems devueltos.", la advertencia de efectivo anterior (reemplazada por "Antes de continuar revisa el efectivo disponible en caja." solo con método Efectivo) y el bloqueo por venta a crédito no pagada.

## 8. Verificación

`npm run build` y prueba en el navegador de: Factura parcial, Factura total (anula), rechazo DIAN, Comprobante parcial y total, Sin Documento, ítem ya devuelto, bloqueos (anulado, nota total, DIAN pendiente), otra sucursal, concurrencia, búsqueda por identificación, correo. Para volver a la semilla, borrar `bold-pos:devoluciones:v7`, `bold-pos:devoluciones-pendientes:v1`, ventas Retail y ajustes.

## 9. Respuestas a las preguntas (19/11)

1. Rechazo de la DIAN: **botón de simulación** en las herramientas del prototipo (S1).
2. Forma de Pago: **Crédito y Contado** (S7).
3. Ítems en solo lectura en con referencia: **bien**.
4. Permiso "Gestionar Devoluciones": **sigue sin efecto** (S4).
5. Egreso: **sin vista**, solo se guarda en la devolución (S13).

## 10. Aclaraciones surgidas al construir (por validar)

- **Fase 1 y las rutas de destino**: "Siguiente" del modal ya redirige a las rutas de §4, pero las vistas llegan en las fases 2 a 4; mientras tanto esas rutas muestran un aviso provisional "Esta vista se construye en la fase N". Registrar devoluciones nuevas no es posible hasta la fase 2.
- **Alcance en Sin Documento**: el documento dice que no aplica en el registro, pero pide el campo en lista y detalle; se muestra "--".
- **Semilla**: todas las devoluciones de ejemplo quedan aceptadas por la DIAN (la devolución no existe antes de la aceptación); desaparecen las notas de ejemplo "pendiente" y "rechazada" de v1.
- **Fase 2 (vista con referencia)** — `DevolucionDocumentoPage` (`/facturas-venta/:id/devolucion`, reutilizable para Comprobante en la fase 4) y `NotasDianResolver` (en el layout, resuelve la DIAN aunque se navegue). Al confirmar se vuelve al ver de la factura; el aviso "Hay una devolución pendiente de aceptación de la DIAN." en ese ver llega en la fase 5.
- **Sin campo "Notas"**: el real lo trae, pero aquí la justificación ocupa su lugar; no se replicó.
- **Descuento del pie**: queda en $0, porque el valor de devolución ya es neto (lo pagado). El descuento general de un documento (`Venta.discount`, hoy siempre 0 en la semilla) se prorratea entre las líneas, supuesto: es un monto sobre el subtotal.
- **Textos nuevos por validar**: al rechazar la DIAN sale el toast "La DIAN rechazó la nota crédito. No se registró la devolución." (el documento fuente no lo define). Al confirmar no hay toast; la respuesta tarda 3 s.
- **Documento con todos los ítems devueltos**: bloquea con "Todos los ítems de este documento ya fueron devueltos." (texto mío, por validar).
- **Conflicto de concurrencia (§9.6)**: la lógica genérica está (un ítem devuelto entre tanto limpia la selección y muestra el mensaje), pero el documento de ejemplo que la dispara es el comprobante 3767 y llega con la fase 4.
- **Notas pendientes**: no aparecen en la lista de Notas crédito (solo las aceptadas, que son devoluciones).
- **Egreso**: queda en la primera fila de la devolución (`egreso: { turno, valor, metodoPago }`), sin vista.
- **Ver de la nota crédito**: se mantienen por ahora sus estados Rechazada/Reenviar de v1 (la semilla ya no los produce); se limpian en la fase 5.

## 11. Cambio de alcance: el detalle de la devolución pasa de modal a vista

Pedido del 19/11 (después de aprobar la fase 2). Se agrega a la fase 1 y reemplaza al modal de detalle (§7 del documento fuente):

- **Ruta nueva** `/items/devoluciones/:numero` (`DevolucionDetallePage`). Diseño del ver de factura/comprobante: encabezado con flecha de volver, "Devolución No. {n}" y etiquetas de tipo y alcance; botones **Imprimir** y **Enviar por correo**; tarjetas Información, Ítems devueltos, Justificación y Totales. Las filas de la lista, "Ver devolución" (en los ver de factura, comprobante y nota crédito) y el motivo de la lista navegan a esta vista; el modal `DevolucionDetalleModal` se elimina.
- **Imprimir**: imprime datos de la devolución, lista de ítems (Ítem, Cantidad, Valor devolución) y total, con el mismo iframe oculto del informe (`utils/imprimirDevolucion.ts`).
- **Enviar por correo** (adelanta parte de la fase 6): modal "Enviar detalle de la devolución" con el correo del cliente precargado (editable o removible), "Agregar correo" hasta 3, "Enviar" y "Cancelar"; "Ingresa un correo válido."; toast "Correo enviado correctamente." (el envío es simulado y nunca falla; el toast de error del documento no se usa). El correo del cliente sale del contacto con ese nombre o, en las ventas de ejemplo, de `CORREO_CLIENTES_EJEMPLO` (Consumidor final no tiene). Quedan para la fase 6 la vista del correo y el PDF adjunto.

## 12. Fase 3 (sin referencia) — aclaraciones

- `NotaCreditoNuevaPage` en `/notas-credito/nueva` (`?origen=sin-documento` bloquea el tipo en "sin referencia"); el botón **Nuevo** de la lista de notas crédito y del ver de la nota crédito ahora abre esta ruta con el tipo editable. Con "con referencia": se elige cliente (los de las facturas pagadas de la sucursal de la sesión) y factura, y sigue en `/facturas-venta/:id/devolucion`.
- Cabecera sin referencia: Tipo de nota, Fecha de Emisión (hoy), Mes de Factura de Venta (fecha), Motivo de la nota de crédito (6 motivos DIAN, sin valor por defecto), Cliente (contactos clientes, obligatorio), Vendedor ("Ninguno" por defecto), Descuento (Ninguno, 5, 10, 15 o 20 %), Lista de precios (General) y Forma de Pago (Crédito o Contado, obligatoria). Errores míos, por validar: "Selecciona un motivo para la nota de crédito.", "Selecciona un cliente.", "Selecciona una forma de pago.", "Selecciona un ítem."
- Tabla: ítem (lista de ítems activos sin combos; cada variante es una entrada; las ya agregadas salen como "(Ya agregado)" deshabilitadas), referencia, cantidad (1), impuesto seleccionable (el del ítem por defecto), precio (base sin impuesto), descuento de línea (Ninguno, 5, 10, 15 o 20 %), total editable con separador de miles, Agregar y papelera. Valor inicial = precio de venta del ítem con descuento × cantidad; se recalcula mientras no se edite a mano. Sin tope, mayor a cero.
- Descuento general: reduce cada línea (en %); el pie muestra Subtotal (antes del descuento), Descuento, impuestos (después del descuento) y Total; cada fila guarda el valor ya con el descuento general.
- Sin Documento ahora **sí discrimina impuestos** (cambia lo de v1): cada fila guarda `impuestoId` y `tasaImpuesto`, y el detalle y los totales los muestran. Las devoluciones sin documento de la semilla no tienen impuesto y se ven sin desglose.
- Al aceptarse, la nota aparece en Notas crédito como "sin referencia" (la lista y el ver incluyen las de Sin Documento). La devolución no resta de ventas (§3.B.4) y el ingreso va a la sucursal de la sesión; con variantes suma a la variante elegida.
- Tras confirmar se vuelve a la lista de devoluciones.

## 13. Fase 4 (comprobantes) — aclaraciones

- La vista "Devolución" es la misma `DevolucionDocumentoPage` con `tipo="comprobante"` (`/comprobantes/:id/devolucion`; `?alcance=total` para "Anular"): título "Devolución"; cabecera solo con Cliente, Vendedor, Lista de precios, Descuento, Fecha de Emisión y "Fecha del comprobante {n}" (sin tipo de nota, motivo de la nota ni forma de pago); sin columna Impuesto ni desglose (solo Total); sin check de rechazo de la DIAN.
- **Sin DIAN ni nota crédito**: al confirmar se crea la devolución al instante (hook `useAplicarDevolucion`, compartido con la DIAN simulada: número del consecutivo, egreso, inventario y toast) y se vuelve al ver del comprobante. Toasts: "Devolución registrada correctamente." (Parcial) o "Comprobante anulado correctamente." (Total).
- **Conflicto (S3)**: en el comprobante 3767, la primera vez que se confirma "otro usuario" (Camila Rojas) ya devolvió el primer ítem: sale "Este ítem ya fue devuelto. Actualiza la información e inténtalo de nuevo.", el ítem queda "Ya devuelto", Total se deshabilita y la vista vuelve a Parcial. Marca en `bold-pos:devoluciones-conflicto-demo:v1` (borrarla repite el caso).
- **Venta a crédito no pagada** (comprobante 3764): no bloquea ni avisa; el egreso se guarda igual (queda pendiente definir su manejo, §10.2 del documento fuente).
- Se eliminó la pantalla provisional "Esta vista se construye en la fase N": las tres rutas de "Siguiente" ya tienen su vista.

## 14. Fase 5 (ver de factura, de comprobante y de nota crédito) — aclaraciones

- **Botones** "Hacer devolución" (alcance Parcial) y "Anular" (`?alcance=total`), después de los botones actuales, en `DocumentoVentaDetallePage`. El ver de comprobante **no tenía** botón "Eliminar" en el prototipo, así que "Anular" se agrega sin reemplazar nada.
- **Visibilidad**: ambos se ocultan con el documento anulado, con nota crédito total, con todos los ítems devueltos (un ítem con devolución parcial cuenta como devuelto entero), y en factura mientras haya una nota pendiente de la DIAN. "Anular" también se oculta si el documento ya tuvo una devolución. La venta a crédito no pagada los muestra. Si la DIAN rechaza, todo reinicia y reaparecen.
- **Otra sucursal**: aviso "Este documento es de la sucursal {sucursal}. Cambia a esa sucursal para hacer la devolución." y sin botones. La semilla no trae documentos de otra sucursal: no se pudo recorrer en el prototipo.
- **Avisos arriba del ver**: "Hay una devolución pendiente de aceptación de la DIAN." (solo factura) y, con devolución total, "Este documento fue devuelto en su totalidad." con "Ver devolución" (en lugar de la lista de ítems devueltos; con devolución parcial queda la tarjeta "Ítems devueltos" de v1). El mismo indicador sale en el ver de la nota crédito de una devolución total.
- **Estado derivado "Anulada"**: hook `useVentasConDevoluciones` (la venta guardada no cambia). El texto es el de los anulados actuales en Retail: **"Anulada"**, no "Anulado". Se ve en el ver y en las listas de facturas y de comprobantes, y el ticket que se imprime lleva el recuadro "ANULADA" (el prototipo no tiene descarga aparte: imprimir es lo único). Los reportes de ventas no cambian (pendiente del documento fuente).
- **Ver de la nota crédito**: se quitó el botón "Reenviar" (reintento de una nota rechazada), porque ya no existen notas rechazadas guardadas. Los filtros de estado DIAN de la lista de notas se conservan como en el real.
- El permiso "Gestionar Devoluciones" sigue sin efecto (S4): no hay modal de sin permiso.

## 15. Fase 6 (correo del detalle) — aclaraciones

- **Ver ejemplo del correo**: enlace en el modal "Enviar detalle de la devolución" que abre `EjemploCorreoDevolucionModal`, solo visual: De "Bold POS", Para (los correos válidos del modal), Asunto "Detalle de tu devolución"; cuerpo con el diseño Bold (logo y tarjeta) y el texto del documento fuente: "Hola, te compartimos el detalle de tu devolución realizada el {fecha de devolución}. Valor total: {valor total}. Método de pago: {método de pago}. Encuentras los ítems devueltos en el PDF adjunto. Gracias por tu confianza." (fecha en dd/mm/aaaa).
- **PDF adjunto** `Devolucion-{n}.pdf`: se puede abrir en la misma vista y "Descargar PDF" abre el diálogo de impresión del navegador (guardar como PDF). Usa el formato actual de Bold POS: el ticket de 80 mm de la factura (`DevolucionTicket`, mismo estilo que `InvoiceTicket`) con datos de la devolución, lista de ítems (Ítem, Cant., Valor devolución) y total.
- **Imprimir** del detalle ahora imprime ese mismo ticket (reemplaza la hoja con tabla de la fase 3): un solo formato para el PDF y la impresión.
- **Sin toast de error**: el documento define "No se pudo enviar el correo. Inténtalo de nuevo."; como el envío es simulado y nunca falla, ese texto no se usa. Los banners corporativos del correo no se agregaron (el documento no los pide).

## 16. Ajustes tras la revisión

- **Preguntas finales** (Factura, Comprobante y Sin Documento, componente compartido `CamposYTotales`): ahora van dentro de un contenedor con borde y el título "Datos de la devolución" (texto mío); Motivo de la devolución y Método de pago comparten línea (se apilan si no caben) y la Justificación ocupa todo el ancho. Los totales siguen a la derecha, fuera del contenedor.
- **Selector "Caso de uso"** (herramienta del prototipo, no del sistema): select fijo en `PrototypeToolsBar`, en las vistas de nota crédito y de devolución, para pasar entre Factura parcial, Factura total, Sin referencia, Comprobante parcial y Comprobante total. Elige un documento de ejemplo que sirva para el caso (Total pide uno sin devoluciones previas; mantiene el actual si sirve) y reinicia el formulario. `SelectorCasoDevolucion.tsx`.
- **Ver de la devolución, tarjeta Información**: todos los datos ocupan medio ancho, en dos columnas (izquierda: tipo de devolución, documento, nota crédito —no en comprobante—, sucursal, fecha de venta, cliente y alcance; derecha: fecha de devolución, responsable, turno, método de pago, ingreso al inventario y motivo). Se quitó el bloque inferior donde Motivo, Nota crédito y Alcance iban a todo el ancho.
- **Datos de la devolución antes del alcance**: el contenedor con borde (inventario, motivo, método de pago y justificación) sube y va antes de "Alcance de la devolución" en Factura y Comprobante; en Sin Documento (que no tiene alcance) va antes de la tabla. Los totales quedan debajo de la tabla, a la derecha (`DatosDevolucion` y `TotalesDevolucion` en `DevolucionUi.tsx`, reemplazan a `CamposYTotales`).
- **Aviso de venta a crédito no pagada** (cambia §3.A.9 del documento fuente, que decía "no muestres aviso por ahora"): solo informa, no bloquea. Texto mío, por validar: "Esta venta es a crédito y aún no ha sido pagada." (comprobante 3764).
- **Selector "Caso de uso"**: suma el grupo "Documentos con avisos o bloqueos": factura con nota crédito total, comprobante anulado, factura con un ítem ya devuelto, comprobante a crédito no pagado, comprobante con varios medios de pago, factura con descuento, comprobante con propina, factura con un ítem sin inventario y comprobante con conflicto de concurrencia. No hay caso para "pendiente de la DIAN" (solo existe unos segundos tras confirmar una factura) ni para "todos los ítems devueltos" (la semilla no tiene un documento así). Un documento al que ya se le hizo una devolución en esa sesión de pruebas cambia su aviso (p. ej. queda anulado).
- **Datos de la devolución en una línea**: dentro del contenedor, Ingreso al Inventario (cuando aplica), Motivo de la devolución y Método de pago van en una sola línea de 3 columnas, como la cabecera; la Justificación sigue a todo el ancho debajo. Sin la pregunta de inventario (ningún ítem la maneja), quedan dos columnas.
- **Ver de la devolución, ítems devueltos**: la tabla muestra por ítem Cantidad vendida, Valor de venta (de la línea completa, lo pagado), Cantidad devuelta y Valor devolución. Cada fila guarda `cantidadVendida` y `valorVentaLinea`; en Sin Documento y en datos anteriores se ve "--". La clave de devoluciones sube a `bold-pos:devoluciones:v8` (se vuelve a sembrar; la v7 de §3 queda reemplazada).
- **Justificación como input sencillo** (sin textarea) en la tercera columna: la línea de 3 columnas pasa a ser Motivo de la devolución · Método de pago · Justificación; la pregunta "Ingreso al Inventario" (cuando aplica) va arriba de esa línea. Mismas reglas: obligatoria, 10 a 250 caracteres, contador (n/250) y errores de siempre. Reemplaza lo de la línea anterior.
- **Barra del prototipo en las vistas de devolución**: el select "Caso de uso" va en la primera línea y, en la segunda, los dos checks ("Simular que no hay turno abierto" y "Simular rechazo de la DIAN").
- **Título de la vista de comprobantes**: "Devolución (Comprobante)" (el documento fuente decía "Devolución").
- **"Ingreso al Inventario" siempre visible**, también antes de elegir ítems (cambia §3.A.7 del documento fuente, que la ocultaba si ningún ítem manejaba inventario). Sigue preseleccionada en "Sí"; el ingreso solo suma a los ítems que manejan inventario en la sucursal y debajo se listan los seleccionados que no ("{ítem}: Este ítem no maneja inventario en esta sucursal.").
- **Informe de Devoluciones** (`/reportes/retail/devoluciones`): nueva columna **Sucursal** en la posición 2, después de "Número de devolución" (tabla, impresión y Excel). Columnas finales: número de devolución, sucursal, fecha devolución, producto, tipo, número de documento, fecha de venta, valor de venta, valor devolución, método de pago, motivo y responsable. Cambia §8 del documento fuente ("sin cambios").
- **Informe**: la columna "Fecha" pasa a llamarse **"Fecha devolución"**.
- **Informe**: "Fecha devolución" y "Fecha de venta" se muestran solo con la fecha (dd/mm/aaaa), sin hora, en la tabla, la impresión y el Excel.
- **Informe**: nueva columna **Turno** después de "Método de pago" (tabla, impresión y Excel). Columnas finales: número de devolución, sucursal, fecha devolución, producto, tipo, número de documento, fecha de venta, valor de venta, valor devolución, método de pago, turno, motivo y responsable.
- **Se elimina el aviso "Esta venta se pagó con varios medios de pago."** (cambia §3.A.9 del documento fuente) y su caso en el selector "Caso de uso". El comprobante de ejemplo 3765 queda en la semilla como un comprobante más.
- **Alcance de la devolución** (Factura y Comprobante): la opción "Total" se muestra como **"Total / Anular"**. El valor guardado y lo que se ve en la lista y el detalle sigue siendo "Total".
- **Tarjeta "Ítems devueltos"** (ver de factura y de comprobante; en el ver de la nota crédito ya no se muestra): nueva columna **Cantidad** (cantidad devuelta) antes de "Valor devolución". Columnas: Ítem, Fecha, Cantidad, Valor devolución, Motivo y "Ver devolución".
- **Aviso de ítems sin inventario** ("{ítem}: Este ítem no maneja inventario en esta sucursal."): ya no va junto a la pregunta "Ingreso al Inventario"; aparece debajo de "Total items N", en la tabla de ítems (Factura, Comprobante y Sin Documento). Cambia §3.A.7 del documento fuente ("se lista debajo" de la pregunta).
- **Advertencias con fondo amarillo** (token `--feedback-warning-10`, ícono `--feedback-warning-150`) en lugar del fondo gris azulado: avisos del documento (descuento, propina, crédito no pagado), "Antes de continuar revisa el efectivo disponible en caja.", "Elige el tipo de nota de crédito para continuar.", el aviso de ítems sin inventario (ahora también como recuadro) y, en el ver de factura y de comprobante, los avisos de otra sucursal y de nota pendiente de la DIAN. Los bloqueos y errores siguen en coral.
- **Se elimina el aviso "Este documento tiene propina."** (cambia §3.A.9 del documento fuente) y su caso en el selector "Caso de uso". El comprobante de ejemplo 3766 queda en la semilla como un comprobante más.
- **Ver de la nota crédito**: se quita la tarjeta rosada "Ítems devueltos" (ya está la lista de ítems de la nota). Se conserva solo el indicador "Este documento fue devuelto en su totalidad." con "Ver devolución" cuando el alcance es Total (§6.1 del documento fuente). La tarjeta sigue en el ver de factura y de comprobante.
