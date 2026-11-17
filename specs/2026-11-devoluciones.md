# SPEC — Devoluciones (Ítems)

| | |
|---|---|
| **Estado** | Listo para implementación (fase 1; pantallazos de D1, D3 y D4 pendientes para la fase 2) |
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
| D1 | **Ver de la nota crédito**: se copia del POS real a partir de pantallazos que entrega el usuario. Hasta entonces el botón del detalle queda sin destino. |
| D2 | **Ir al turno**: siempre abre el mismo turno de ejemplo (el actual del listado de `TurnosPage`), para las devoluciones de ejemplo y las nuevas. Sin ruta por turno ni cambios en sus cifras. |
| D3 | **Historial de movimientos de inventario**: se copia del POS real a partir de pantallazos. Hasta entonces el ingreso solo suma stock y queda marcado en la devolución. |
| D4 | **Abrir turno**: se copia del POS real a partir de pantallazos. Incluye el interruptor de prototipo para simular "sin turno abierto". |
| D5 | **Usuario sin permiso**: el permiso se lee del rol del usuario de la sesión; se prueba desactivándolo en Ajustes → Roles. |
| D6 | **"Gestionar cuenta"**: se usa el permiso existente **"Editar Perfil de la Empresa"** (Ajustes → Empresa). Sin efecto visible en el prototipo. |
| D7 | **Ejemplos**: se crean suficientes facturas y comprobantes de ejemplo (anulado, nota crédito total, a crédito, varios medios, descuento, propina, ítem sin inventario, ítem ya devuelto), marcados como datos de ejemplo, con `notaCreditoTotal` opcional en `Venta`. |
| D8 | **Conflicto "ya devuelto"**: un documento de ejemplo lo dispara al confirmar. |
| D9 | **Toast del consecutivo**: se deja el actual ("Numeración actualizada"). El texto "Consecutivo de devoluciones actualizado correctamente." no se usa. |
| D10 | **Efectivo en caja**: valor fijo de prototipo (constante) para la advertencia. |

## 11. Fases

Primero todo lo del módulo; después, los cambios en otras vistas.

**Dentro del módulo `/items/devoluciones`**
1. **Base y lista**: tipos, store (con motivos precargados y semilla sobre las ventas sembradas), permiso "Gestionar Devoluciones", menú y ruta, lista con filtros, búsqueda y paginación, modal de detalle (el botón a la nota crédito depende de D1).
2. **Registrar devolución**: documentos de ejemplo con los casos del paso 1 (D7), modal por pasos, validaciones, preguntas, justificación, inventario, creación de la nota crédito (D1), confirmación de salida, turno (D4) y conflicto (D8).

**Después, en otros módulos o vistas** (cada fase se aprueba por aparte)
3. **Ajustes**: panel de motivos en Inventarios (el módulo ya los lee del store) y campo de consecutivo en "Numeración documentos no electrónicos".
4. **Informe** en Reportes → Administrativos.
5. **Ver de factura y de comprobante**: sección con la lista de devoluciones.

## 12. Verificación

`npm run build` y prueba en el navegador de los 11 recorridos del PRD §8. Para volver a la semilla, borrar `bold-pos:devoluciones:v1` y las claves de ajustes e ítems.
