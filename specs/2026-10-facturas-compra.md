# Facturas de compra (Egresos) y Facturas de compra / Cuentas por pagar en el dashboard de Retail

| Campo | Valor |
|---|---|
| Fecha | 2026-10 |
| Estado | Listo para implementación |
| Vertical | Core (módulo) · Retail (sección del dashboard) |
| Antecedentes | Prototipo `saas-purchasing` (`index.html`, `nueva-factura-compra.html`, `ver-factura-compra-*.html`, `home.html`) · `2026-10-proveedores.md` · `2026-10-clientes.md` · [`2026-10-dashboard-retail.md`](./2026-10-dashboard-retail.md) (✅ Implementado, congelado: este spec lo amplía) |

## 1. Contexto

Facturas de compra es el módulo central de `saas-purchasing`: listado, creación (con modo por pasos), cinco variantes de detalle y varios modales. Este spec lo migra a `bold-pos-web` (React + TS + Merlin) dentro del menú **Egresos**, y agrega al dashboard de Retail la sección **Cuentas por pagar** que el prototipo tenía al final de su Home.

En el prototipo cada pantalla era HTML estático con datos copiados a mano, y sus números no coincidían entre sí. Aquí hay **un solo modelo** y todo se deriva de él (§4).

## 2. Alcance

Entra:
- `/facturas-compra` (listado), `/facturas-compra/nueva` (creación), `/facturas-compra/:id` (detalle).
- Entrada **Facturas de compra** en Egresos.
- Acciones con efecto real sobre el store: crear, reportar pago, anular, convertir en Documento Soporte.
- Drawers de creación de ítem y de proveedor dentro del formulario.
- Secciones **Facturas de compra** y **Cuentas por pagar** (cards y gráfica) en el dashboard de Retail.
- "Herramientas del prototipo" (§9): los tres switches casi invisibles del prototipo.

No entra (fases siguientes): reportes (Facturas de compra, Ítems comprados, Cuentas por pagar), Ajustes → Facturas de compra, Documentos soporte como módulo, vista de Turno. Descargar / Imprimir / Enviar por correo / Duplicar quedan como toast "próximamente", igual que en el prototipo (solo visuales).

## 3. Reglas de diseño y de código

- Merlin: Montserrat, solo variables CSS; reutilizar `FormField`, `Toggle`, `VentaBadge`, `ventasStyles` y las clases `btn btn-primary|secondary|cancel`. No se copian los estilos del prototipo (`--navy`, `--red`…).
- Fechas `DD/MM/YYYY` en toda la UI (el prototipo mezclaba `DD / mmm / YYYY`); miles con `es-CO`, como el resto de `bold-pos-web`, salvo el dashboard de Retail, que usa `en-US` (`$ 1,815,700`) y conserva su formato.
- Rutas nuevas **agregadas**, sin tocar basename ni rutas existentes. Al ser Core no se registra en `modules.ts`.
- Los ítems del formulario salen de `itemsStore` (los de la vertical activa, activos y no combos), no de una lista fija.

## 4. Modelo y datos (decisiones de reconciliación)

`FacturaCompra`: `id`, `numero` (`FC-011`), `proveedorId` (contacto), `numeroProveedor`, `sucursal`, `fechaEmision`, `fechaRegistro`, `formaPago` (`Contado` | `Crédito`), `metodoPago`, `turno`, `afectaInventario`, `fechaVencimiento`, `items[]` (nombre, código, cantidad, precio, impuesto, inventariable), `retenciones` (monto), `observaciones`, `ds` (`{ numero }` | null), `pago` (crédito pagado) y `anulacion`.

Derivados, nunca guardados:
- **Subtotal** = suma de `cantidad × precio`. **Impuestos** = suma por línea según su impuesto (Exento 0 %, IVA 5 %, IVA 19 %, Excluido 0 %). **Total** = Subtotal + Impuestos − Retenciones.
- **Estado de pago**: `Anulada` si tiene anulación · `Pagado` si es Contado o tiene pago · `Vencido` si es Crédito sin pago y su vencimiento es anterior a la fecha de referencia · `No pagado` en otro caso.
- **Ítems** = número de líneas ("Total items N" del prototipo).

Fecha de referencia ("hoy"): **14/07/2026**, constante `FECHA_PROTOTIPO` en `utils/facturasCompra.ts`. El prototipo la usaba implícitamente (los banners "faltan 32 días" y "hace 24 días" cuadran con ese día, y es la fecha por defecto del formulario). Con el reloj real todas las facturas aparecerían vencidas.

Datos sembrados — 11 facturas FC-001…FC-011:
- FC-004…FC-008 conservan sus datos de las páginas de detalle del prototipo (ítems, fechas, observaciones, pago, anulación).
- FC-001, 002, 003, 009, 010 y 011 no tenían detalle; se les generan líneas con los ítems del prototipo para **respetar el valor total de su fila del listado**. Fechas de emisión/registro, números de factura del proveedor y números de DS de 001, 003 y 009 son inventados.
- Para FC-004…FC-008 el listado muestra ahora el total que sale de sus ítems (p. ej. FC-005: $ 132.000 en vez de los $ 540.000 de la fila del prototipo, que no coincidía con su propia página). Las cifras de "Ítems" también pasan de ser un número suelto a contar líneas.
- Los 5 proveedores de las facturas se agregan como contactos sembrados (solo proveedor, NIT 900.123.456 … 900.567.890, correos de ejemplo).
- FC-007: la fecha de emisión es la de su página de detalle (12/06/2026), no la del listado.

Consecuencia sobre Proveedores: `comprasUltimos6Meses` y `cuentasPorPagar` dejan de ser campos del contacto y se calculan desde las facturas (compras no anuladas de los últimos 6 meses · crédito sin pagar). La pestaña "Facturas de compra" del perfil lista las facturas reales del proveedor y reemplaza las filas de ejemplo. Los 6 contactos originales quedan en 0 / 0 y sin facturas.

Los contactos suben su clave a `bold-pos:contactos:v2` (nuevo shape y proveedores sembrados). Clave `localStorage` de facturas: `bold-pos:facturas-compra:v1`; ajustes del prototipo en `bold-pos:compras-settings:v1`.

## 5. Listado

- Encabezado: flecha atrás, "Facturas de compra", botón "Nueva factura de compra".
- Filtros que **sí filtran**: No. de factura, Proveedor (combobox filtrable, formato "Nombre - NIT"), Forma de pago, Estado de pago (Pagado · No pagado · Vencido · Anulada), Sucursal, Desde / Hasta (fecha de emisión).
- **Ordenar por**: *Fecha de creación* (No. de factura descendente) o *Prioridad de pago* (Vencido → No pagado → Pagado → Anulada; dentro de cada grupo, vencimiento ascendente y sin fecha al final).
- Barra de resultados: "Mostrando X de Y", Refrescar y Limpiar filtros.
- Columnas: No. factura (link) · Proveedor · Inventario (ícono + tooltip) · Ítems · Valor total (derecha) · Forma de pago · Fecha de vencimiento (`---` en Contado) · Estado de pago · DS (solo con el switch DS, tooltip "Esta factura también fue creada como Documento Soporte").
- Los badges **No pagado** y **Vencido** son clicables y abren *Reportar el pago*.
- El valor total sigue el switch "Usar impuestos y retenciones": apagado = Subtotal, encendido = Total con impuestos y retenciones.

## 6. Creación

Formulario en dos filas de campos y tabla de ítems.

1. **Fila 1**: No. factura del proveedor (opcional) · Fecha de emisión* (por defecto la fecha de referencia) · Proveedor* (combobox con la opción fija "+ Crear proveedor" que abre el drawer) · Afectar inventario (Sí/No, por defecto Sí, con tooltip).
2. **Fila 2**: Forma de pago* (por defecto Crédito). **Contado** muestra Método de pago* (Bold, Efectivo, Credibanco, Daviplata, Nequi, Redeban, Transferencia bancaria, QR Bold, QR Bancolombia, Otro) y "Asociar al turno No. 499" (Sí/No, por defecto Sí). **Crédito** muestra Fecha de vencimiento* (sin valor por defecto).
3. **Ítems**: "Eliminar todos"; tabla Ítem · Cantidad · Precio · Impuesto (solo con el switch) · Total · eliminar. El Ítem es un combobox filtrable con la opción fija "+ Crear ítem" (drawer) y un ícono gris de advertencia ("Este producto no está configurado como inventariable") cuando el ítem no maneja existencias. Cálculo bidireccional: cambiar Cantidad o Precio recalcula Total; cambiar Total recalcula Precio. "Agregar ítem" agrega una fila con Cantidad 1, Precio aleatorio entre $ 10.000 y $ 500.000 y Exento, y pulsa con una animación de atención. Contador "Total items N".
4. **Retención global** ("Aplicar retención": Sin retención, 2 %, 2,5 %, 5 %, 6 %), solo con el switch, en su propia fila sobre Observaciones/Resumen. El monto = Subtotal × %.
5. **Observaciones** y **Resumen** (Subtotal, Impuestos y Retenciones solo con el switch, Total), recalculado en cada cambio.

Validación al Guardar: Proveedor, Fecha de emisión, Método de pago (Contado) o Fecha de vencimiento (Crédito), y que cada fila tenga un ítem. Los campos inválidos se marcan en rojo y no se guarda. Si todo está bien se abre *"¿Estás seguro que quieres guardar esta factura?"*; confirmar crea la factura (Contado → `Pagado`; Crédito → `No pagado`), muestra toast y vuelve al listado. El número es el siguiente `FC-NNN`.

Cancelar abre el modal de salida ("Salir" vuelve al listado, "Seguir editando" cierra).

**Modo por pasos** (switch "Step mode", activo por defecto): el formulario arranca en el paso 1, que muestra solo los datos generales (centrados, dos columnas). "Continuar" valida igual que Guardar antes de pasar al paso 2 (formulario completo); "Omitir" pasa sin validar. El encabezado con Cancelar y Guardar queda siempre visible. Con el switch apagado el formulario se muestra completo desde el inicio.

**Drawer Crear ítem**: Nombre*, Categoría*, Descripción, Código, Unidad*, Referencia, Precio base* + Impuesto* = Precio total de venta (solo lectura), Costo (deshabilitado). Crea un ítem inventariable en `itemsStore` y lo selecciona en la fila que lo abrió.

**Drawer Crear proveedor**: el mismo formulario de contacto de Proveedores (mismos campos y validación), en el panel lateral; al guardar crea el contacto y lo selecciona.

## 7. Detalle

Una sola pantalla, cuyo contenido depende de la factura. Encabezado: flecha atrás, "Factura de compra No. FC-XXX" y el badge de estado (aquí "Vencida" en femenino).

- **Barra de acciones**: Descargar, Imprimir, Enviar por correo, Duplicar (toast), **Convertir en Documento Soporte** (solo con el switch DS y si la factura no tiene DS ni está anulada) y **Anular** (no aparece si ya está anulada).
- **Banner de pago** (Crédito sin pagar): azul "Fecha de pago: DD/MM/YYYY (faltan N días)" o rosado "Vencido desde DD/MM/YYYY (hace N días)", con el botón *Reportar el pago*.
- **Dos cards**: Sucursal, No. factura del proveedor, Proveedor (link al perfil), Fecha de emisión · Fecha de registro (con hora), Forma de pago, Método de pago (**solo Contado**), Turno asociado (link con modal, `---` si no hay), Afectar inventario, Documento soporte (link con modal, `---` si no hay; solo con el switch DS).
- **Pagada a crédito**: card "Detalle del pago" a todo el ancho con fondo suave: Fecha de vencimiento original, Pagado el, Turno asociado · Reportado por, Observación del pago.
- **Anulada**: card "Detalle de anulación": Anulada por, Anulada el, Observación de anulación.
- **Ítems**: tabla de solo lectura (Impuesto solo con el switch; ícono de advertencia en no inventariables) y "Total items N".
- **Observaciones y Resumen** (mismas reglas de los switches).

Modales:
- **Reportar el pago**: factura, fecha de vencimiento con badge de estado, "Valor que reportarás como pagado" (el Total, con impuestos y retenciones según el switch), Método de pago* (mismas 10 opciones), "¿Asociar este pago al turno No. 499?" (Sí/No, por defecto No) y Observación. Guardar marca la factura como pagada (estado, "Pagado el" y "Reportado por" quedan registrados).
- **Anular factura**: aviso "Esta acción afectará tu inventario actual y el reporte de gastos en el turno 499", advertencia ámbar con los productos que quedarían con inventario negativo (solo si la factura afectó inventario e incluye ítems inventariables), Observación de anulación. Confirmar anula la factura.
- **Convertir en Documento Soporte**: Resolución* (Resolución 002239423), Tipo de operación* (Individual, Acumulado semanal), Fecha* (por defecto la fecha de referencia) y Notas. Guardar asigna un número `SEDS-…` a la factura y abre *"Documento Soporte creado exitosamente"*.
- **Turno No. 499** y **Documento Soporte SEDS-…**: modales informativos ("Esto debe dirigir al ver … — esa vista aún no está construida").

## 8. Dashboard de Retail — Facturas de compra y Cuentas por pagar

Diseño tomado de la captura del POS Retail real (reemplaza el diseño del prototipo `home.html`). Se agregan tres piezas a `RetailDashboard`, calculadas desde el store de facturas:

- **Columna izquierda**, bajo "Cuentas por cobrar":
  - Sección **Facturas de compra**, dos cards: *Facturas De Compra (Crédito)* y *Facturas De Compra (Contado)*, cada una con el valor y "N facturas". Cuentan las facturas no anuladas emitidas en el período del selector del dashboard (Día = hoy, Semana = últimos 7 días, Mes = últimos 30, contados hacia atrás desde la fecha de referencia).
  - Sección **Cuentas por pagar**, dos cards: *Total De Cuentas Por Pagar* (créditos sin pagar y no anulados, con "N facturas") y *Total De Cuentas Vencidas* (valor en rojo, con "N facturas"). No dependen del período.
- **Columna derecha**, bajo "Clientes": sección **Cuentas por pagar** con una card "Cuentas Por Pagar Siguientes Semanas": 4 barras, una por semana que empieza el día siguiente a la fecha de referencia, con etiqueta `d/m - d/m` (p. ej. `15/7 - 21/7`), eje de montos con el mismo `niceAxis` y tooltip con monto y cantidad de facturas.
- Los montos siguen el switch "Usar impuestos y retenciones". Restaurantes no cambia.

## 9. Herramientas del prototipo

Tres switches casi invisibles (`opacity` baja, más visibles al pasar el mouse), compartidos y persistentes en `bold-pos:compras-settings:v1`:
- **Usar impuestos y retenciones** (apagado por defecto): oculta/muestra la columna Impuesto, la retención global y las filas Impuestos/Retenciones, y cambia el valor que muestran el Resumen, el Total del listado y el dashboard.
- **DS** (apagado por defecto): columna DS del listado, fila "Documento soporte" y botón "Convertir en Documento Soporte" del detalle.
- **Step mode** (activo por defecto): modo por pasos de la creación.

Viven al pie del listado; el de impuestos también al pie de la creación y del detalle, y DS también al pie del detalle.

## 10. Criterios de aceptación

- `npm run build` sin errores de TypeScript.
- El listado muestra las 11 facturas, los filtros reducen el conteo y "Prioridad de pago" ordena Vencido → No pagado → Pagado → Anulada.
- Se puede crear una factura Contado y una Crédito; aparecen arriba del listado con su estado y su detalle abre.
- Reportar el pago cambia una factura Vencida/No pagada a Pagado y actualiza el dashboard y el contador "Cuentas por pagar" de Proveedores.
- Anular cambia el estado a Anulada, oculta el botón Anular y muestra el detalle de anulación.
- Convertir en DS (con el switch) asigna número y el link abre el modal informativo.
- El dashboard de Retail muestra las secciones Facturas de compra y Cuentas por pagar (cards y gráfica) y se actualiza al crear/pagar facturas; Restaurantes no cambia.
- Sin colores hex ni tipografías fuera de Merlin en los archivos nuevos.
