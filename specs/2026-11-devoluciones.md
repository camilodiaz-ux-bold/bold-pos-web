# SPEC — Devoluciones (Ítems)

| | |
|---|---|
| **Estado** | Listo para implementación (fases 1 y 2 hechas; faltan 3 a 5) |
| **Vertical** | Retail (Restaurantes no cambia) |
| **Fuente** | `PRDs/2026-11-17 - Devoluciones/Instrucciones para el prototipo.md` (fuera del repo). Los textos de interfaz son literales de ese archivo. |
| **Antecedentes** | `2026-10-ajustes` (numeración, roles), `2026-10-reportes-retail`, `2026-11-stock-minimo` (permiso sin efecto, patrón de menú) |

## 1. Alcance

Módulo para registrar la devolución de ítems vendidos: tipos **Factura** (genera nota crédito), **Comprobante** (solo registro) y **Sin Documento** (solo registro). Una fila por ítem devuelto, filas de una misma devolución comparten `Dev-N`. No se editan ni se eliminan. Sin plazo máximo. Datos simulados; reglas y textos tal cual el PRD.

Fuera de alcance (PRD §9): cambios de producto, devolución a tarjeta, motor de reglas, saldo a favor, garantías, averías, tope por rol, app/tablet, otros países, Restaurantes, **cierre de turno** y reportes de ventas existentes.

## 2. Hallazgos del repo (qué existe y qué no)

| El PRD asume | Estado en el prototipo | Propuesta |
|---|---|---|
| "Ver de la factura / comprobante" | Existe: `DocumentoVentaDetallePage` (`/facturas-venta/:id`, `/comprobantes/:id`) | Se agrega la sección "Devoluciones" (§8) |
| "Ver de la nota crédito" | **No existe.** El menú "Notas crédito" solo lanza un toast y el reporte usa semilla provisional | Ver decisión D1 |
| "Ver del turno" | `TurnosPage` con 4 turnos de ejemplo (ids 13–16, estado interno, sin ruta por turno). La sesión usa turno 529 | Ver decisión D2 |
| Historial de movimientos de inventario del ítem | **No existe** | Ver decisión D3 |
| Modal "abrir turno" | **No existe** (solo el modal de "Cerrar sesión / Turno abierto" en `RootLayout`) | Ver decisión D4 |
| Permiso "Gestionar cuenta" | No existe con ese nombre | Se usa "Editar Perfil de la Empresa" (D6) |
| Usuario con/sin permiso | Sesión fija; roles en Ajustes con catálogo de permisos | Ver decisión D5 |
| Lista de métodos de pago | `metodosPago` en Ajustes (`utils/ajustes.ts`) | Se reutiliza (todos, como pide el PRD) |
| Documento anulado / a crédito / varios pagos / descuento / propina | `Venta.estado` (`cancelada`, `no-pagada`), `pagos[]`, `discount`, `tip` | Se derivan del modelo actual |
| Nota crédito total sobre un documento | `Venta` no lo guarda | Campo opcional nuevo en la semilla (D7) |

## 3. Modelo y almacenamiento

- Nuevo tipo `Devolucion` (una **fila por ítem**): `id`, `numero` (`Dev-N`, compartido), `fecha`, `sucursal`, `turno`, `responsable`, `tipo` (`factura`|`comprobante`|`sinDocumento`), `ventaId`/`numeroDocumento`/`fechaVenta`/`valorVenta` (vacíos en Sin Documento), `itemId`, `nombre`, `categoria`, `cantidad`, `valorDevolucion`, `metodoPago`, `motivoId`, `justificacion`, `ingresaInventario`, `notaCredito` (factura).
- Nuevo store `store/devolucionesStore.tsx`, clave `bold-pos:devoluciones:v1`, con semilla de ejemplo (varios tipos, motivos, sucursales y fechas, marcada como datos de ejemplo) y el siguiente `Dev-N` según el consecutivo de Ajustes.
- Motivos en `bold-pos:ajustes:v1` (`motivosDevolucion`, con migración al leer) y consecutivo `devolucion` dentro de `numeracionNoElectronica` por sucursal.
- "Ya devuelto" se deriva del store: un ítem de un documento con alguna fila de devolución queda bloqueado entero.
- Lógica pura en `utils/devoluciones.ts` (validaciones del documento, totales, bloqueos).

## 4. Menú, rutas y permisos

- Submenú **"Devoluciones"** en Ítems (`/items/devoluciones`), módulo `devoluciones` en `vertical/modules.ts` solo para `retail`. Sin permiso para verlo.
- Permiso **"Gestionar Devoluciones"** en el grupo Ítems del catálogo (`PERMISO_DEVOLUCIONES_ID`), activo por defecto solo en los roles Admin. Sin él, "Registrar Devolución" se ve deshabilitado.
- Motivos: permiso "Editar Perfil de la Empresa" (D6). Informe: permiso general de reportes. Ambos sin efecto en el prototipo.

## 5. Lista de devoluciones

- Botón **"Registrar Devolución"**. Filtros: Sucursales (default "todas" si tiene acceso a más de una; si solo a una, esa), Categorías, Motivo, Tipo de devolución, Rango de fechas. Búsqueda solo por número de devolución o de documento.
- Tabla, una fila por ítem, más reciente primero, paginación de 50: número, fecha, producto, tipo, valor devolución, método de pago, motivo, responsable.
- Vacíos: "Aún no hay devoluciones registradas." y "No hay resultados para los filtros o la búsqueda."
- Clic en cualquier fila → **modal de detalle** con toda la información y la lista completa de ítems de esa devolución; acciones: ir al documento (factura/comprobante; no en Sin Documento), ir al turno, y, si es Factura, ver la nota crédito.

## 6. Flujo "Registrar Devolución" (modal por pasos)

- Sin volver atrás sin perder lo hecho. X o cancelar en cualquier paso → confirmación: **"¿Salir de la devolución?"** / "Si sales, se perderá la información ingresada." / "Salir" · "Continuar" (reutiliza `ConfirmDeleteModal` con `confirmVariant`).
- Si no hay turno abierto, primero el modal de abrir turno (D4). La salida de dinero y el registro cuentan en el turno actual.

**Paso 1 — tipo y documento.** Selector Factura / Comprobante / Sin Documento. Con documento: búsqueda parcial por número en las sucursales del usuario. Bloquean (textos literales del PRD): anulado, nota crédito total, venta a crédito no pagada. Solo informan: varios medios de pago, descuento, propina.

**Paso 2 — ítems (con documento).** Check por ítem; al marcarlo se habilita la cantidad. Se ven juntos valor pagado unitario (con descuento) y valor de devolución editable, sin tope, ambos > 0. Variantes como ítem normal; sin combos ni decimales; impuesto según ítem y cantidad. Ítem con devolución previa: deshabilitado, sin check, etiqueta **"Ya devuelto"**. Errores: "La cantidad debe ser mayor a cero." / "El valor de devolución debe ser mayor a cero."

**Sin Documento (§4.5 del PRD).** Agregar ítems de todo el catálogo, máximo 1 registro por ítem o variante en la devolución; cantidad y valor libres > 0; datos de documento vacíos; inventario en la sucursal del usuario.

**Paso 3 — tres preguntas + justificación.** Inventario (Sí/No para toda la devolución; por ítem sin inventario en la sucursal: "Este ítem no maneja inventario en esta sucursal."; si ninguno maneja, la pregunta no aparece), Motivo (solo activos; "Selecciona un motivo."), Método de pago (todos; "Selecciona un método de pago."), Justificación 10–250 ("Escribe una justificación." / "La justificación debe tener entre 10 y 250 caracteres."). Aviso en Factura: "Se creará una nota crédito por el valor de los ítems devueltos." Advertencia no bloqueante: "El efectivo disponible en caja es menor al valor de la devolución."

**Al confirmar.** Se guardan las filas con responsable, sucursal y turno actual; si Sí, suma stock en la sucursal del documento (Sin Documento: la del usuario) en `itemsStore` solo para ítems inventariables; Factura crea nota crédito (D1); toast **"Devolución registrada correctamente."** Conflicto simulado: "Este ítem ya fue devuelto. Actualiza la información e inténtalo de nuevo." (ver D8).

## 7. Ajustes

- **Motivos** (Ajustes → Inventarios, panel nuevo): lista alfabética; precargados Producto defectuoso (fijo), Producto equivocado, Talla o tamaño incorrecto, Cambio de opinión del cliente, Error en el registro de la venta, Otro. Crear, editar nombre, activar/inactivar, eliminar solo si no se usó ("Este motivo ya se usó en devoluciones. Puedes inactivarlo."). Nombre 5–25 caracteres; errores "El nombre debe tener entre 5 y 25 caracteres." / "Ya existe un motivo con este nombre."; toasts "Motivo creado correctamente." / "Motivo actualizado correctamente." / "Motivo eliminado correctamente."
- **Consecutivo**: campo "Siguiente Número de Devolución" en el panel "Numeración documentos no electrónicos" (mismas reglas: por sucursal, entero ≥ 1). Toast "Consecutivo de devoluciones actualizado correctamente." (D9).

## 8. Cambios en pantallas existentes

- Ver de factura y de comprobante: sección "Devoluciones" con la lista de devoluciones del documento; clic abre el modal de detalle. El documento no cambia de estado.
- Ver de la nota crédito: sin cambios (D1). Cierre de turno: sin cambios.

## 9. Informe

Reportes → Administrativos → **"Devoluciones"** (`/reportes/retail/devoluciones`, `ReporteShell`). Filtros fecha, sucursal, tipo de documento; cards "Total devoluciones" y "Valor total"; botones "Descargar" (.xlsx real), "Imprimir", "Limpiar filtros", "Generar reporte". Columnas en el orden del PRD; guion en documento, fecha y valor de venta para Sin Documento. Sin resultados: "No hay resultados para los filtros o la búsqueda."

## 10. Decisiones

| # | Decisión |
|---|---|
| D1 | **Ver de la nota crédito**: réplica del ver del POS real (`/notas-credito/:numero`, el número es el `Dev-N`). Estados Aceptada / Pendiente / Rechazada con los botones del real (Rechazada: Nuevo y Reenviar; Aceptada: Imprimir, Enviar por correo, Nuevo y Verifica en la DIAN); "Reenviar" la pasa a Aceptada. Código y referencia del ítem como en el real. Hecho en la fase 2. |
| D2 | **Ir al turno**: siempre abre el mismo turno de ejemplo (el actual del listado de `TurnosPage`), para las devoluciones de ejemplo y las nuevas. Sin ruta por turno ni cambios en sus cifras. |
| D3 | **Historial de movimientos de inventario**: en el real es el módulo "Flujo de inventario" (`#/retail/inventory/ledger`), que en el prototipo aún no existe y es un módulo aparte (pendiente). La devolución suma el stock (`itemsStore.ajustarExistencia`) y queda marcada con `ingresaInventario`; el movimiento se verá en Flujo de inventario cuando se construya. |
| D4 | **Abrir turno**: réplica del panel del real a partir del pantallazo del usuario (panel lateral derecho, "¿Con cuánto efectivo en caja estas abriendo tu turno hoy en {sucursal}?", Cancelar / Abrir turno). Interruptor de prototipo "Simular que no hay turno abierto" al pie de la lista; solo aplica si Ajustes → Configuración POS lleva control de turnos. |
| D5 | **Permiso "Gestionar Devoluciones"**: sin efecto en el prototipo. Aparece siempre activo en todos los roles (como "Gestionar alertas Stock mínimo") y "Registrar Devolución" nunca se deshabilita por permiso. Reemplaza la decisión inicial de leerlo del rol. |
| D6 | **"Gestionar cuenta"**: se usa el permiso existente **"Editar Perfil de la Empresa"** (Ajustes → Empresa). Sin efecto visible en el prototipo. |
| D7 | **Ejemplos**: se crean suficientes facturas y comprobantes de ejemplo (anulado, nota crédito total, a crédito, varios medios, descuento, propina, ítem sin inventario, ítem ya devuelto), marcados como datos de ejemplo, con `notaCreditoTotal` opcional en `Venta`. |
| D8 | **Conflicto "ya devuelto"**: un documento de ejemplo lo dispara al confirmar. |
| D9 | **Toast del consecutivo**: se deja el actual ("Numeración actualizada"). El texto "Consecutivo de devoluciones actualizado correctamente." no se usa. |
| D10 | **Efectivo en caja**: valor fijo de prototipo (constante) para la advertencia. |

## 11. Fases

Primero todo lo del módulo; después, los cambios en otras vistas.

**Dentro del módulo `/items/devoluciones`**
1. **Base y lista** ✅: tipos, store (con motivos precargados y semilla sobre las ventas sembradas), permiso "Gestionar Devoluciones", menú y ruta, lista con filtros, búsqueda y paginación, modal de detalle (el botón a la nota crédito depende de D1).
2. **Registrar devolución** ✅: documentos de ejemplo con los casos del paso 1 (D7), modal por pasos, validaciones, preguntas, justificación, inventario, creación de la nota crédito (D1), confirmación de salida, turno (D4) y conflicto (D8).

**Después, en otros módulos o vistas** (cada fase se aprueba por aparte)
3. **Ajustes**: panel de motivos en Inventarios (el módulo ya los lee del store) y campo de consecutivo en "Numeración documentos no electrónicos".
4. **Informe** en Reportes → Administrativos.
5. **Ver de factura y de comprobante**: sección con la lista de devoluciones.

## 12. Verificación

`npm run build` y prueba en el navegador de los 11 recorridos del PRD §8. Para volver a la semilla, borrar `bold-pos:devoluciones:v1` y las claves de ajustes e ítems.

## 13. Decisiones de la fase 2 (no estaban en el PRD)

- **Ingreso al inventario**: por defecto "Sí". Aplica solo a los ítems que lo manejan en la sucursal del documento; en un ítem con variantes, sin variante en la línea del documento, suma a la primera variante activa de esa sucursal. Los ítems usan solo `principal`/`secundaria`: `suc-2` → secundaria, el resto → principal.
- **Cantidad** a devolver: tope = cantidad vendida en la línea (el valor no tiene tope).
- **Advertencia de efectivo**: solo con método de pago "Efectivo" y total mayor a `EFECTIVO_CAJA_EJEMPLO` ($200.000).
- **Conflicto (D8)**: la primera vez que se confirma una devolución del comprobante 3767, "otro usuario" ya devolvió el primer ítem; se muestra el error, se vuelve al paso 2 y el ítem queda "Ya devuelto". Marca en `bold-pos:devoluciones-conflicto-demo:v1`.
- **Datos de ejemplo (D7)**: comprobantes 3763 (anulado), 3764 (a crédito), 3765 (varios medios), 3766 (propina), 3767 (conflicto) y facturas 2400418 (nota crédito total), 2400419 (descuento), 2400420 (ítem sin inventario), 2400421 (ítem ya devuelto). La clave de ventas Retail sube a `bold-pos:ventas:retail:v2`.
- **Botones del ver de la nota crédito** (Imprimir, Enviar por correo, Nuevo, Verifica en la DIAN): solo visuales, salvo Reenviar. Una nota Pendiente muestra Nuevo y Verifica en la DIAN (el real no se vio en ese estado).
- **Búsqueda del documento (paso 1)**: no filtra mientras se escribe; se escribe y se pulsa **Buscar** (o Enter). Busca por número (parcial) **o por identificación del cliente** (parcial, sin puntos ni guiones). La identificación sale del contacto con ese nombre, de una tabla de clientes de ejemplo (`DOCUMENTO_CLIENTES_EJEMPLO`) o del NIT escrito en el nombre.
- **Paso 2**: la tabla muestra "Cantidad vendida" y "Cantidad a devolver"; el valor de devolución se digita con separador de miles (`1.250.000`). Los documentos de ejemplo traen varios productos y cantidades de 2 a 5. Las claves suben a `bold-pos:ventas:retail:v3` y `bold-pos:devoluciones:v2`.
- **Tratamiento del IVA (solo Factura)**: Comprobante y Sin Documento no discriminan impuestos: sin columna Impuesto, sin desglose en el paso 3 (solo "Total a devolver") y sin `impuestoId`/`tasaImpuesto` guardados. En Factura, el impuesto lo trae cada ítem (`Item.impuestoId`: IVA 19 %, IVA 5 %, INC 8 % o Exento); si la línea del documento no corresponde a un ítem del catálogo, se usa el del documento. El **valor de devolución incluye el impuesto** (como el valor pagado) y se separa así: base = valor / (1 + tasa), impuesto = valor − base, calculado por línea según el ítem y la cantidad escogida. El paso 2 muestra el impuesto de cada línea marcada (monto y tipo); el paso 3 y el ver de la nota crédito muestran subtotal, impuestos **agrupados por tipo** ("IVA 19.00%", "IVA 5.00%", "INC 8.00%", "IVA Excluido") y total. Cada fila guarda `impuestoId` y `tasaImpuesto`; las anteriores sin dato usan IVA 19 %. El modal de detalle suma la columna Impuesto.
- **Lista de devoluciones**: la tabla no lleva la columna Motivo (el filtro Motivo se mantiene; el motivo se ve en el detalle). Columnas: número, fecha, producto, tipo, valor devolución, método de pago y responsable.
- **Modal de registro**: ancho máximo 960 px y tablas de ancho fijo; sin scroll horizontal.
