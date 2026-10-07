# SPEC — Comprobantes y Facturas de Venta (Retail)
### Bold POS — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | Listo para implementación |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Octubre 2026 |
| **Vertical** | Retail |
| **Antecedentes** | [`specs/2026-10-ventas-dinamicas.md`](./2026-10-ventas-dinamicas.md) — modelo `Venta`, store y flujo de registro. [`specs/2026-09-checkout-factura.md`](./2026-09-checkout-factura.md) — checkout, panel "Venta Completada" y ticket de 80 mm. |

---

## 1. Qué cambia

En Retail, el módulo Ventas de Restaurantes se reemplaza por dos listados de Ingresos: **Comprobantes** y **Facturas de Venta**. Lo que se cobra en el checkout aparece ahí, primero el más reciente, con un detalle real. El checkout suma un selector para elegir qué documento se emite. Restaurantes no cambia.

## 2. Comprobante vs. factura electrónica

| | Comprobante | Factura electrónica |
|---|---|---|
| ¿Va a la DIAN? | No | Sí |
| Número | `No. 3763…` (consecutivo propio) | `SETT …` (consecutivo de facturas) |
| Resolución | No lleva (`---`) | Sí |
| CUFE | No | Sí |
| Estado DIAN | No | Aceptada / Pendiente |
| Impuestos | IVA solo si es mayor a 0 (P3) | IVA desglosado, 19 % (P4) |
| Listado | `/comprobantes` | `/facturas-venta` |

## 3. Decisiones

| # | Decisión |
|---|---|
| D4 | En Retail no hay ORD. El comprobante usa `No. 3763…` y la factura usa `SETT …`. |
| D5 | En Retail, el checkout tiene el selector "Tipo de documento" (Factura electrónica / Comprobante). Restaurantes no cambia: siempre factura. |
| D6 | En Retail, Ingresos queda: Recibos, Comprobantes, Facturas de Venta, Cotizaciones, Notas crédito y Notas débito. Restaurantes no cambia. |
| D8 | "Cotizaciones" aparece en el menú solo en Retail y es solo visual: al hacer clic muestra el toast `Cotizaciones` (patrón de los demás ítems pendientes). Sin ruta ni página. |

### Decisiones propias del spec (a validar en la revisión)

- **P3 · IVA en el comprobante solo si es mayor a 0.** El detalle y el ticket del comprobante muestran Subtotal / Descuento / IVA / Total, de modo que la suma cuadra; la fila de IVA se omite cuando el impuesto es 0 (como en el POS real), dejando Subtotal / Descuento / Total. La factura siempre desglosa el IVA.
- **P4 · Una tarifa de IVA.** El checkout usa una sola tarifa (19 %). La columna "Impuesto" de la factura muestra "IVA 19%" en todas las líneas. No se modela IVA por ítem.
- **P6 · Rutas.** En Retail, `/ventas` y `/ventas/:id` redirigen a `/comprobantes`. Las rutas existentes no se modifican; la redirección vive dentro de las páginas.

## 4. Menú y rutas

**Menú de Ingresos (Retail):** Recibos, Comprobantes, Facturas de Venta, Cotizaciones, Notas crédito y Notas débito. Ventas desaparece. Cotizaciones solo muestra el toast `Cotizaciones` (D8). En Restaurantes el menú es el de siempre (Ventas, Recibos, Notas crédito, Notas débito) y Cotizaciones no aparece.

**Rutas nuevas** (módulos exclusivos de Retail, envueltas en `VerticalRoute`; se registran `comprobantes` y `facturas-venta` en `modules.ts`, y `cotizaciones` para ocultar el ítem en Restaurantes):

| Ruta | Pantalla |
|---|---|
| `/comprobantes` | Listado de comprobantes |
| `/comprobantes/:id` | Detalle de un comprobante |
| `/facturas-venta` | Listado de facturas de venta |
| `/facturas-venta/:id` | Detalle de una factura |

Redirecciones: en Retail, `/ventas` y `/ventas/:id` llevan a `/comprobantes`. En Restaurantes, las rutas nuevas redirigen a `/inicio`. La sección Ingresos del menú queda activa en cualquiera de las rutas de sus sub-ítems.

## 5. Selector "Tipo de documento" en el checkout

- Solo en Retail, entre Vendedor y Resolución. Opciones: **Factura electrónica** (por defecto) y **Comprobante**.
- La Resolución se muestra solo si el tipo es factura (un comprobante no lleva resolución DIAN).
- Al cobrar:
  - Comprobante: número `3763`, `3764`… (consecutivo propio; el primero es 3763 porque los sembrados llegan a 3762).
  - Factura: `SETT 24004xx`, con el consecutivo de facturas actual.
- Ticket impreso (80 mm):
  - Comprobante: título "Comprobante de Venta No. 3763"; sin fecha de validación, base imponible, resolución ni CUFE; con fila de IVA solo si el impuesto es mayor a 0 (P3).
  - Factura: igual que hoy (ver `2026-09-checkout-factura.md`).
- Panel "Venta Completada": el botón y los toasts dicen "Imprimir comprobante" o "Imprimir factura" según el tipo.
- En Restaurantes el checkout no cambia: sin selector, siempre factura.

## 6. Listados

Misma estructura visual que el listado de Ventas de Restaurantes: encabezado con flecha atrás, filtros y tabla blanca. Título a la izquierda y botón primario "Nueva venta" a la derecha, que lleva a `/` (Mostrador).

Cada listado solo trae las ventas de su tipo, de la más reciente a la más antigua. Arriba de la tabla: "Mostrando N de M". Sin resultados: "No hay {Comprobantes | Facturas de Venta} con estos filtros". El clic en una fila abre su detalle. Total y Saldo van alineados a la derecha; un saldo mayor a 0 se resalta con el color de advertencia del sistema.

### 6.1 Comprobantes (`/comprobantes`)

- **Columnas:** No. · Cliente · Fecha de emisión · Fecha de vencimiento · Estado · Total · Saldo.
- **Filtros:** Buscar por código · Cliente · Estado de pago (Todos / Pagada / No pagada) · Vendedor · Desde · Hasta · Buscar por notas.

### 6.2 Facturas de Venta (`/facturas-venta`)

- **Columnas:** No. · Cliente · Fecha de emisión · Fecha de vencimiento · Estado DIAN · Forma de pago (Contado) · Estado · Total · Saldo.
- **Filtros:** los mismos de Comprobantes, más Estado DIAN (Todos / Aceptada / Pendiente) y Forma de pago (Todos y los métodos presentes en las ventas: Efectivo, Nequi, Tarjeta…).

Todos los filtros funcionan (D7), incluido el rango de fechas.

## 7. Detalle

Si el id no existe o el documento no es del tipo de la ruta: "Documento no encontrado" con botón Volver al listado.

**Encabezado:** flecha atrás, "{Comprobante | Factura de Venta} No. {numero}" y badges: Estado; en factura, además Estado DIAN y "Contado". Acciones (botones outline):

- **Imprimir:** abre el ticket del tipo correspondiente.
- **Enviar:** toast informativo.
- **Verificar en la DIAN:** solo en factura, toast informativo.

**Tarjeta "Información"** (dos columnas):

- Izquierda: Cliente · Sucursal · Fecha de emisión · Fecha de vencimiento · Método de pago (el método, o "Pago mixto" si hay más de uno).
- Derecha: Empresa · Emitido por · Registrada en Turno No. · Vendedor.
- Solo factura, una fila completa más: Resolución y **CUFE** (monoespaciado, con corte de línea para que no desborde).

**Tarjeta "Ítems":**

- Columnas: Cantidad · Ítem (código en el color de acento + " - " + nombre) · Precio unit. · Descuento ("Ninguno" o `n %`) · [solo factura: Impuesto "IVA 19%"] · Total.
- El desglose del combo va como texto secundario. Al pie: "Total ítems: N" (suma de cantidades).

**Notas y Totales** lado a lado:

- Notas: el texto de la venta, o "Sin notas" en gris.
- Totales del comprobante: Subtotal · Descuento · IVA 19% (solo si el impuesto es mayor a 0) · Total.
- Totales de la factura: Subtotal · Descuento · IVA 19% · Total.

**Tarjeta "Recibos":**

- Columnas: Código · Estado · Total (lo efectivamente pagado = total menos saldo) · [solo factura: Saldo a favor (el cambio, o $0)] · Método de pago · Fecha.
- Sin pagos: "Sin recibos registrados".

## 8. Datos sembrados (P5, parte Retail)

Todas con fechas entre el 28-sep y el 6-oct de 2026, ítems del catálogo Retail (ids 201+), métodos de pago Efectivo, Nequi y Tarjeta, y recibos `8410`–`8428`. Sucursal `Hub Ciudad del Río`, emitido por `Wendell Nazar`.

- **Comprobantes:** `3753`–`3762` (el siguiente es 3763), turnos 520–528. Clientes: Daniel Aycardy, David, Consumidor final y Comercial Andina SAS (NIT: 901.555.777). El `3755` es "No pagada", con total de $5,000 y saldo de $3,000 (pagado $2,000).
- **Facturas:** `SETT 2400410`–`SETT 2400417` (el siguiente es `SETT 2400418`, el inicio actual del consecutivo de facturas). Todas con CUFE y resolución "Resolution - Retail Demo 2026". Todas aceptadas por la DIAN, salvo `SETT 2400410`, que está pendiente y "No pagada".

## 9. Qué NO cambia en Restaurantes

- El menú de Ingresos (Ventas, Recibos, Notas crédito, Notas débito) y la ausencia de Cotizaciones.
- El checkout: sin selector, siempre factura; los números siguen siendo `ORD####` para la orden y `SETT …` para la factura.
- El módulo Ventas (`/ventas`, `/ventas/:id`) y el Dashboard.
- Las rutas `/comprobantes` y `/facturas-venta` no existen para esa vertical (redirigen a `/inicio`).

## 10. Fuera de alcance

- Cotizaciones como pantalla (solo ítem de menú con toast, D8).
- Anular comprobantes o facturas, notas crédito/débito asociadas y cobros de saldo pendiente.
- IVA por ítem y otras tarifas distintas de 19 % (P4).
- Envío real a la DIAN o por correo: "Enviar" y "Verificar en la DIAN" son solo toasts.
