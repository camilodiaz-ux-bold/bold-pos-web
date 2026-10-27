# Reportes de Retail (réplica de los 20 reportes del POS real)

| Campo | Valor |
|---|---|
| Fecha | 2026-10 |
| Estado | ✅ Implementado |
| Vertical | Retail |
| Antecedente | `2026-10-reporte-ventas-items.md`, `2026-10-reporte-ganancias-items.md`, `2026-10-facturas-compra.md`, `2026-10-comprobantes-facturas-retail.md` y `2026-10-ajustes.md` |
| Dependencia | La branch `bn-feature/reportes` está **apilada sobre `bn-feature/ajustes`** (PR #40, aún sin unir): los filtros de sucursal, vendedor, categorías y métodos de pago leen de `ajustesStore`. El PR de este spec debe avisarlo y no puede unirse antes que el de Ajustes. |

## 1. Contexto

El POS Retail real (`#/retail/reports`) tiene **20 reportes** en 3 grupos: Ventas (6), Documentos Electrónicos (4) y Administrativos (10). El prototipo muestra la pantalla de Restaurantes y solo tiene 2 reportes de Retail (Ventas por ítems y Ganancias por ítems). Este spec replica los 18 restantes y la pantalla de Reportes de Retail, con el mismo diseño y la misma estructura.

Fuente: recorrido en solo lectura del staging el 2026-10-26. No se copian datos reales.

## 2. Alcance

Entra:
- Pantalla `/reportes` de Retail con las 3 columnas reales. Restaurantes conserva la suya.
- Los 18 reportes nuevos (§5), con filtros, botones, tarjetas de resumen, tabla y paginación como el real.
- Componentes compartidos del reporte (§4) y reutilización de los de `components/reportes/`.
- Semillas provisionales para los reportes cuyo módulo aún no existe (§7).

No entra:
- Que IMPRIMIR / EXCEL / EXPORTAR generen archivos: siguen siendo botones visuales (toast "Próximamente"), como en los reportes ya hechos.
- Los módulos de Recibos, Gastos, Cotizaciones y Notas crédito/débito (sus propios specs). Las semillas de §7 existen solo para alimentar los reportes y los reemplazan esos módulos cuando se construyan.
- Los dos reportes ya implementados: se enlazan tal cual (`ventas-items`, `ganancias-items`).

## 3. Pantalla de Reportes (Retail)

Grilla de 3 tarjetas blancas con título y lista de enlaces, en este orden:

| Tarjeta | Reportes (en este orden) |
|---|---|
| Ventas | Comprobantes · Comprobantes Mensuales · Ventas por Ítems · Ganancias por Ítems · Comprobantes por Vendedor · Cotizaciones |
| Documentos Electrónicos | Facturas de Venta · Notas Crédito · Notas Debito · Documentos soporte |
| Administrativos | Cierre de Caja · Cierre de Caja Gerencial · Lista de Ítems · Inventarios · Ingresos y Egresos · Cuentas por Cobrar · Lista de Contactos · Facturas de Compra · Ítems Comprados · Cuentas por Pagar |

Se reconstruye con Merlin (variables CSS, Montserrat) siguiendo el estilo de `ReportesPanel`; no se copian los enlaces rojos con viñeta del real. El módulo se registra como `reportes-retail` (solo Retail) en `vertical/modules.ts` y la pantalla decide con `has('reportes-retail')`.

Rutas nuevas, envueltas en `VerticalRoute module="reportes-retail"`: `/reportes/retail/:id`. Ids y equivalencia con el real:

| Id | Reporte | Slug del real |
|---|---|---|
| `comprobantes` | Comprobantes | `sales` |
| `comprobantes-mensuales` | Comprobantes Mensuales | `monthly-sales` |
| `comprobantes-vendedor` | Comprobantes por Vendedor | `sales-by-seller` |
| `cotizaciones` | Cotizaciones | `estimates` |
| `facturas-venta` | Facturas de Venta | `e-invoices` |
| `notas-credito` | Notas Crédito | `credit-notes` |
| `notas-debito` | Notas Débito | `debit-notes` |
| `documentos-soporte` | Documentos soporte | `support-document` |
| `cierre-caja` | Cierre de Caja | `cash-closing` |
| `cierre-caja-gerencial` | Cierre de Caja Gerencial | `cash-closing/management` |
| `lista-items` | Lista de Ítems | `item` |
| `inventarios` | Inventarios | `inventory` |
| `ingresos-egresos` | Ingresos y Egresos | `payment` |
| `cuentas-cobrar` | Cuentas por Cobrar | `payable-accounts/receivables` |
| `lista-contactos` | Lista de Contactos | `contact` |
| `facturas-compra` | Facturas de Compra | `purchase-bills-report` |
| `items-comprados` | Ítems Comprados | `purchased-items-report` |
| `cuentas-pagar` | Cuentas por Pagar | `accounts-payable-report` |

Ventas por Ítems y Ganancias por Ítems siguen en sus rutas actuales (`/reportes/restaurantes/ventas-items` y `/ganancias-items`); el enlace de la tarjeta Ventas apunta allí.

## 4. Estructura común del reporte

Todos los reportes del real siguen el mismo esqueleto; se construye una sola vez (`verticals/retail/reportes/ReporteShell.tsx` y piezas) y cada reporte solo declara filtros, tarjetas, columnas y cómo calcula las filas:

1. **Título** del reporte con botón volver a `/reportes`.
2. **Filtros** en grilla de 4 columnas (rango de fechas con selector de calendario, selects con búsqueda, campos de texto, casillas). Cada reporte tiene los suyos (§5).
3. **Botones**: "GENERAR REPORTE" (o "GENERAR"), "LIMPIAR FILTROS", "IMPRIMIR", "EXCEL" (en algunos "GENERAR EXCEL" / "EXPORTAR"). Los tres últimos son visuales.
4. **Tarjetas de resumen** (3 a 7 según el reporte).
5. **Tabla** con selector "Mostrar 25 / 50 / 100 / 250 / 500", la línea "Última actualización del reporte a las: …" arriba y abajo, y paginación PRIMERA · ANTERIOR · 1 2 … · SIGUIENTE · ÚLTIMA. Valores ausentes se muestran `N/A` (columnas de impuestos) o `--`.

**Comportamiento de generación (como el real):** al entrar el reporte está vacío (tarjetas en `$ 0`, tabla solo con encabezados) y solo se llena al pulsar "GENERAR REPORTE". "LIMPIAR FILTROS" restablece los filtros y vacía el reporte. Los filtros se aplican al generar, no mientras se escribe.

Rango de fechas por defecto: abarca los datos sembrados del reporte (compras: `01/01/2026` hasta `FECHA_PROTOTIPO` 14/07/2026; ventas y derivados: `01/09/2026` hasta hoy), porque ambos conjuntos de datos usan referencias de fecha distintas. El usuario puede cambiarlo.

## 5. Los reportes

Los filtros "Todos…" arrancan en "Todos". Las columnas y tarjetas replican el real.

### 5.1 Ventas

**Comprobantes** — Filtros: rango de fechas, Estado (No pagada · Pagada · Anulada), Cliente, Vendedor, Usuario, Sucursal, "Filtrar por código", "Buscar por lista de precios". Tarjetas: Subtotal · Descuento · Total. Columnas: Fecha · Código · Cliente · Subtotal · Descuento · Total · Estado. Fuente: `ventasStore`, `tipoDoc = comprobante`. El Total incluye impuestos, igual que el listado de Comprobantes; las anuladas aparecen en la tabla pero no suman en las tarjetas. "Buscar por lista de precios" es solo visual (las ventas no guardan lista de precios).

**Comprobantes Mensuales** — Filtros: Año, Estado, Cliente, Vendedor, Usuario, Sucursal. Botones: GENERAR · IMPRIMIR · LIMPIAR FILTROS · EXPORTAR. Tarjetas: Subtotal · Descuento · Total · Saldo. Tabla: una fila por mes (Enero–Diciembre) con Subtotal · Descuento · Total · Saldo, sin paginación. Fuente: comprobantes agrupados por mes de emisión.

**Comprobantes por Vendedor** — Filtro: solo rango de fechas. Botones: GENERAR · IMPRIMIR · EXPORTAR. Tarjetas: Subtotal · Total. Columnas: Nombre · Comprobantes · Subtotal · Total. Lista a **todos** los vendedores de Ajustes, también los de 0 comprobantes, más los vendedores que aparecen en las ventas y no están en el catálogo (las ventas sembradas traen nombres propios, p. ej. el de la sesión).

**Cotizaciones** — Filtros: rango, Estado (No facturada · Facturada · Anulada · Pagada), Cliente, Vendedor, Usuario, Sucursal, código, lista de precios. Tarjetas: Descuento · Subtotal · Total. Columnas: Fecha · Código · Sucursal · Usuario · Vendedor · Cliente · Descuento · Subtotal · Total · Estado. Paginada. Fuente: semilla provisional (§7).

### 5.2 Documentos electrónicos

**Facturas de Venta** — Filtros: rango, Estado DIAN (Borrador · Pendiente · Aceptada · Rechazada), Estado de pago, Cliente, Vendedor, Usuario, Sucursal, código, lista de precios. Tarjeta: Total. Columnas: Fecha · No. Factura · Cliente · Subtotal · Descuento · Total · Estado de Pago · Estado DIAN. Fuente: `ventasStore`, `tipoDoc = factura`.

**Notas Crédito / Notas Débito** — Filtros: rango, Estado DIAN, Cliente, Vendedor, Usuario, Sucursal, código. Tarjeta: Total. Columnas: Fecha · No. NC (o No. ND) · No. Factura · Cliente · Subtotal · Descuento · Total · Estado DIAN. Fuente: semilla provisional con facturas existentes (§7).

**Documentos soporte** — Filtros: rango, Estado DIAN, Estado de pago, Proveedor, Sucursal. Tarjetas: IVA 19% · Descuento · Subtotal · Total · IVA 5% · IVA Excluido · IVA 0%. Columnas: Fecha · N° Documento · Proveedor · Subtotal · Descuento · IVA 19.00% · IVA 5.00% · IVA Excluido · IVA 0.00% · Total · Estado DIAN · Estado de pago. Fuente: facturas de compra con `ds` asociado.

### 5.3 Administrativos

**Cierre de Caja** — Filtros: rango, Usuario, Sucursal, casilla "Reporte Detallado". Botones: GENERAR · IMPRIMIR · EXCEL. Salida en secciones: **Ventas** (Documento · Fecha · Cliente · Método de Pago · Usuario · Total), rangos inicial/final de comprobantes y de facturas, **Total Comprobantes + Facturas de Ventas** con su desglose por método de pago, **Recibos** (Documento · No. Recibo · Fecha · Cliente · Método de Pago · Usuario · Total) con su desglose, y los totales con recibos. Fuente: pagos de `ventasStore` + recibos de la semilla (§7).

**Cierre de Caja Gerencial** — Filtros: rango, Usuario, Sucursal. Tabla Sucursal · Comprobantes + Facturas de Venta · Costos · Utilidad bruta, con fila de Totales; debajo, tarjetas "Rango de Comprobantes (N)" y "Rango de Facturas de Venta (N)" con Inicial y Final por sucursal. Las sucursales salen de Ajustes (se cruzan con las de las ventas sin distinguir tildes: "Río" y "Rio"). Ventas = comprobantes + facturas con IVA; costos = costo del ítem × cantidad vendida (misma regla que Ganancias por ítems); utilidad bruta = ventas sin IVA − costos.

**Lista de Ítems** — Filtros: Tipo, Categoría, Estado, Sucursal, lista de precios. Tarjetas: Cantidad · Precio de Costo · Precio de Venta. Columnas: Código · Nombre · Variante · Descripción · Referencia · Tipo · Categoría · Cantidad · Precio Costo · Precio Venta. Fuente: `itemsStore` (las variantes salen como fila propia). Las tarjetas son valoración de inventario: Cantidad = existencias, Costo y Venta = precio × existencia. El filtro Sucursal usa las sucursales del módulo de ítems (Sucursal Principal / Secundaria), no las de Ajustes, porque así guarda `Item` sus existencias; con él, los ítems sin variantes muestran la existencia de esa sucursal y las variantes conservan su suma. "Buscar por lista de precios" es solo visual.

**Inventarios** — Filtros: Categoría, Estado, Sucursal, fecha de corte, lista de precios, casilla "Mostrar productos sin existencias" (marcada por defecto). Tarjetas: Cantidad · Costo Inventario · Venta Inventario. Columnas: Código · Ítem · Variante · Descripción · Referencia · Tipo · Categoría · Precio Costo · Precio Venta · Existencia · Costo Inventario · Venta Inventario. Fuente: `itemsStore`; solo ítems con existencias (sin combos ni no inventariables). "Fecha de corte" y "lista de precios" son solo visuales: no hay historial de existencias.

**Ingresos y Egresos** — Filtros: rango, Cliente, Método de pago, Estado, Tipo de pago (Todos · Recibos · Gastos), Usuario. Botones: GENERAR · IMPRIMIR · EXPORTAR. Tarjetas: Total Ingresos · Total Egresos · Total Saldo · Total Anulados. Columnas: Número · Fecha · Contacto · Descripción · Método de Pago · Categoría/Descripción · Entrada · Salida · Total Anulado · Estado. Fuente: recibos y gastos de la semilla (§7); un anulado muestra su valor en "Total Anulado" y no suma en Entrada/Salida; las categorías de gasto salen de Ajustes.

**Cuentas por Cobrar** — Filtros: rango, Sucursal, Cliente, casilla "Reporte detallado". Tarjetas: Crédito Total · Saldo Pendiente · Saldo Vencido. Tabla bajo el encabezado "Fecha de Reporte - <fecha>": Nombre · Crédito Total · Saldo Pendiente · Saldo Vencido, con fila Total (en modo detallado, una fila por documento). Fuente: documentos de venta no anulados con saldo (crédito o pago parcial). Saldo vencido = el que ya pasó su fecha de vencimiento al momento de generar. Nota: la sección "Cuentas por cobrar" del dashboard de Inicio usa datos de ejemplo propios (`dashboardRetailMocks`) y no coincide con este reporte; unificarlas es trabajo aparte.

**Lista de Contactos** — Filtros: Tipo (Cliente · Proveedor), Estado. Botones: GENERAR · EXCEL. Columnas: Fecha de creación · Número de documento / NIT · Nombre · Tipo · Correo electrónico · Celular · Dirección · Estado. Fuente: `contactosStore`. Los contactos del prototipo no guardan fecha de creación: los creados desde la app la toman del id y los sembrados muestran `—`.

**Facturas de Compra** — Filtros: Proveedor, Estado de pago, Sucursal, Fecha de emisión. Botones: GENERAR REPORTE · LIMPIAR FILTROS · IMPRIMIR · GENERAR EXCEL. Tarjetas: Total Facturas · Valor Total · Pendiente De Pago. Columnas (16): No. Factura · Proveedor · Fecha de emisión · Inventario (✓/✗) · Valor total · Forma de pago · Subtotal · IVA 19.00% · IVA 5.00% · IVA 0.00% · IVA Excluido · Retención · Fecha de vencimiento · Estado de Pago · Doc. soporte · Sucursal. Fuente: `facturasCompraStore`; el valor y las columnas de impuestos respetan "Uso de impuestos y retenciones" de Ajustes (con la opción en No, los impuestos y la retención se muestran `N/A`).

**Ítems Comprados** — Filtros: Categorías, Producto, Proveedores, Fecha de emisión. Tarjetas: Items Comprados · Proveedores · Valor Total. Columnas: No. Factura · Producto · Categoría · Proveedor · Cantidad · Precio unitario · Valor total · Fecha de emisión. Una fila por línea de factura no anulada.

**Cuentas por Pagar** — Filtros: Proveedor, Sucursal, Fecha de vencimiento (rango). Tarjetas: Pagos Vencidos · Pagos Siguientes 7 Días · Pagos Siguientes 30 Días · Todas Las Cuentas Por Pagar. Columnas: Proveedor · Deuda total · Deuda Pendiente · Deuda Vencida. Se deriva de las mismas funciones que el dashboard (`cuentasPorPagar`, `semanasPorPagar`) para que **las cifras coincidan** con Inicio y Proveedores.

## 6. Reglas de datos (un solo modelo)

- Todo se deriva de los stores existentes; los reportes no guardan datos propios. Una factura de compra, un comprobante o un ítem creado después aparece al generar de nuevo.
- Coherencia entre pantallas: Total de Cuentas por Pagar = tarjeta del dashboard; Facturas de compra del reporte = listado de Egresos con los mismos filtros; Comprobantes y Facturas de Venta del reporte = sus listados de Ingresos.
- Los filtros de Sucursal, Vendedor, Categoría y Método de pago leen de `ajustesStore`.
- Fecha de referencia: compras usa `FECHA_PROTOTIPO` (14/07/2026) para vencimientos; ventas usa el reloj real. No se mezclan en un mismo reporte, salvo Cierre de Caja Gerencial, que solo usa ventas.

## 7. Semillas provisionales

Para los reportes sin módulo se agrega `data/retail/reportesSeed.ts`, marcado en su encabezado como **provisional** (lo reemplazan los specs de Recibos, Gastos, Cotizaciones y Notas):

| Dato | Cantidad aprox. | Cómo se construye |
|---|---|---|
| Cotizaciones | 12 | Estados No facturada, Facturada, Anulada y Pagada; vendedores, clientes y sucursales de Ajustes/contactos; totales plausibles |
| Notas crédito | 6 | Referencian facturas de venta existentes; estados DIAN variados |
| Notas débito | 3 | Ídem |
| Recibos | 10 | Abonos del 50 % a comprobantes y facturas ya pagados, un día después de la venta; uno de cada cinco anulado |
| Gastos | 8 | Categorías de gasto de Ajustes, métodos de pago habilitados y proveedores del módulo |

Notas y recibos se construyen sobre las ventas existentes (cliente, factura y usuario coherentes) y cotizaciones y gastos con los clientes, vendedores, sucursales, categorías y métodos de Ajustes. Todo es determinista. Estas semillas se leen solo desde los reportes y no aparecen en ninguna otra pantalla (no existe aún un listado de Cotizaciones, Notas, Recibos ni Gastos en el prototipo).

## 8. Fases

1. **Fase 1 (implementada) — Estructura común y Compras:** pantalla de Reportes de Retail, `ReporteShell` y piezas, y los reportes Facturas de Compra, Ítems Comprados, Cuentas por Pagar y Documentos soporte.
2. **Fase 2 (implementada) — Ventas:** Comprobantes, Comprobantes Mensuales, Comprobantes por Vendedor y Facturas de Venta.
3. **Fase 3 (implementada) — Administrativos con datos existentes:** Lista de Ítems, Inventarios, Lista de Contactos y Cuentas por Cobrar.
4. **Fase 4 (implementada) — Reportes con semillas:** Cotizaciones, Notas Crédito, Notas Débito, Ingresos y Egresos, Cierre de Caja y Cierre de Caja Gerencial.

## 9. Preguntas abiertas

- **IMPRIMIR/EXCEL:** ¿se quedan visuales (propuesta) o se implementa al menos la exportación a Excel de los reportes de compras? Ya existe `generateVentasAsyncXlsx` como base.
- **Reportes por rol:** el real tiene un permiso por reporte (Ajustes → Roles). ¿El prototipo debe ocultar los reportes según el rol? (Propuesta: no; Roles solo guarda, como se decidió en Ajustes.)

## 10. Criterios de aceptación

- `npm run build` sin errores de TypeScript nuevos en los archivos tocados.
- `/reportes` de Retail muestra las 3 tarjetas con los 20 reportes en el orden del real; Restaurantes no cambia.
- Cada reporte nace vacío, se llena al generar y respeta sus filtros; "Limpiar filtros" lo vacía.
- Las cifras de Cuentas por Pagar, Facturas de Compra y Facturas/Comprobantes de Venta coinciden con el dashboard y los listados.
- Con "Uso de impuestos y retenciones" en No, los reportes de compras muestran los impuestos como `N/A`.
- El PR declara su dependencia de `bn-feature/ajustes` (PR #40).
