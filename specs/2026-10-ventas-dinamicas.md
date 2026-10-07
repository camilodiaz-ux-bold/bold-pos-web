# SPEC — Ventas dinámicas (Core, con secciones de Restaurantes)
### Bold POS — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Octubre 2026 |
| **Vertical** | Core (con secciones propias de Restaurantes) |
| **Antecedente** | [`specs/2026-10-selector-vertical.md`](./2026-10-selector-vertical.md) — define las verticales, los módulos core vs. exclusivos y `useVertical()`. |
| **Complemento** | [`specs/2026-10-comprobantes-facturas-retail.md`](./2026-10-comprobantes-facturas-retail.md) — la parte de Retail (Comprobantes y Facturas de Venta). |

---

## 1. Qué cambia

Hoy `/ventas` y `/ventas/:id` son datos estáticos: lo que se cobra en Mesas o Mostrador no aparece en Ingresos. Este spec hace que las ventas sean dinámicas:

- Cada cobro confirmado en Mesas o Mostrador se **registra** como una venta.
- Los listados y detalles leen solo de ese registro.
- El orden es de la venta más reciente a la más antigua.
- En Restaurantes, el número visible de la venta (`ORD####`) es el número de la comanda.

La infraestructura (store, modelo, orden, detalle real) es **Core**. El módulo Ventas y el número `ORD` son de **Restaurantes**. Retail usa el mismo modelo, pero sus pantallas se describen en el spec complementario.

## 2. Decisiones

| # | Decisión |
|---|---|
| D1 | Las ventas son dinámicas en ambas verticales y se ordenan por fecha de emisión, de la más reciente a la más antigua. |
| D2 | En Restaurantes, `ORD####` es **el mismo número de la comanda**. |
| D3 | La comanda usa un **consecutivo global** compartido por Mesas y Mostrador, así que nunca se repite. |
| D7 | Los filtros de los listados funcionan. No hay botón de "restablecer demo". |

### Decisiones propias del spec (a validar en la revisión)

- **P1 · Saltos en el consecutivo.** El número se reserva al crear una orden de Mostrador o al primer envío/cobro de una Mesa. Una orden que no se cobra deja un hueco (ORD0012 → ORD0014), como pasa con una orden anulada en un POS real. En desarrollo, StrictMode de React también puede generar saltos al crear las órdenes iniciales de Mostrador.
- **P2 · Formato visible.** La factura impresa y el listado de Ventas muestran `ORD0011`. La comanda de cocina y las pestañas de Mostrador conservan su formato actual (`#011`), con el mismo número.
- **P5 · Ventas sembradas (parte Restaurantes).** `ORD0001`–`ORD0010`, que reemplazan a `O-001`–`O-010`. El consecutivo arranca en 11. Fechas del 6-oct-2026 entre 12:00 y 21:00.

## 3. Modelo `Venta`

Una sola forma para ambas verticales (`src/app/types/venta.ts`). Restaurantes la muestra en `/ventas`; Retail en `/comprobantes` y `/facturas-venta` según `tipoDoc`.

| Campo | Descripción |
|---|---|
| `id` | Id interno único; lo usa la ruta del detalle. |
| `numero` | Número visible: `ORD0011` (Restaurantes), `3763` (comprobante Retail), `SETT 2400418` (factura Retail). |
| `tipoDoc` | `comprobante` o `factura`. En Restaurantes los datos sembrados mezclan ambos tipos; las ventas nuevas (cobradas en el checkout) son siempre `factura`. |
| `numeroDocumento` | Restaurantes: número de la factura electrónica asociada a la orden (`SETT 2400418`). |
| `emitidaEn` | Epoch ms de la emisión (= cobro). Define el orden del listado. |
| `abiertaEn` | Epoch ms de la apertura de la mesa/orden (Restaurantes). |
| `vencimiento` | Ventas de contado: igual a `emitidaEn`. |
| `zona`, `mesa`, `personas` | Contexto de la mesa (Restaurantes). Mostrador usa zona "Mostrador". |
| `cliente`, `vendedor`, `emitidoPor`, `sucursal`, `turno` | Datos de la sesión y de la venta. |
| `resolucion` | Resolución DIAN; `---` en un comprobante. |
| `items` | Líneas vendidas (con nota y desglose de combo). |
| `subtotal`, `taxRate`, `tax`, `tip`, `discount`, `total` | Totales reales de lo cobrado. |
| `pagos` | Lista de `{ method, amount, persona? }`. `persona` identifica el pago dividido por persona. Vacía si no hay pago. |
| `cambio`, `saldo` | Cambio entregado y lo que falta por pagar (0 si está pagada). |
| `formaPago` | `Contado` o `Crédito`. |
| `estado` | `pagada`, `no-pagada`, `abierta` o `cancelada`. |
| `dian`, `cufe` | Solo facturas: estado DIAN (`aceptada` / `pendiente`) y CUFE. |
| `recibo` | Código del recibo de caja. |
| `note` | Notas de la venta. |

## 4. Flujo

1. El usuario cobra en Mesas o Mostrador. Al confirmar el pago, el checkout produce la venta completada.
2. `onConfirmPay` llama a `registrarVenta(sale, contexto)`: Mesas aporta zona, mesa, personas y hora de apertura; Mostrador aporta zona "Mostrador" y la hora del primer envío de comanda.
3. El store (`ventasStore`) agrega la venta, la persiste en `localStorage` con una clave **por vertical** y calcula el código de recibo.
4. Los listados y detalles leen del store, ordenados por `emitidaEn` descendente. La venta recién cobrada queda primera.
5. Al cambiar de vertical con el selector de Inicio, cada vertical conserva sus propias ventas. Los datos sembrados se cargan la primera vez.

## 5. Consecutivo global de comanda (Restaurantes)

- Un único contador, compartido por Mesas y Mostrador. El número de comanda de una orden es el `ORD####` de su venta.
- **Mostrador:** cada orden toma su número al crearse. Al cobrar, la pestaña pasa a un número nuevo y no repite el anterior.
- **Mesas:** la mesa toma su número al primer envío de comanda o, si nunca envió, al abrir el cobro.
- La vista previa de una comanda que todavía no se envió no muestra número.
- El consecutivo arranca en 11, porque `ORD0001`–`ORD0010` son las ventas sembradas.
- Formato: la factura y el listado muestran `ORD0011`; la comanda de cocina y las pestañas de Mostrador conservan `#011` (P2). Los saltos se aceptan (P1).

## 6. Listado `/ventas` (Restaurantes)

**Datos:** todas las ventas del store, de la más reciente a la más antigua. Arriba de la tabla: "Mostrando N de M". Sin resultados: "No hay ventas con estos filtros".

**Columnas** (se conservan las actuales):

| Columna | Valor |
|---|---|
| No. Orden | `numero` (`ORD####`) |
| Hora Inicio | `abiertaEn`, o `emitidaEn` si falta |
| Hora Cierre | `emitidaEn`, o `---` si la venta está abierta |
| Zona | `zona` |
| Mesa | `mesa`, o `---` |
| Usuario | `vendedor` |
| Total | `total` en COP, con coma como separador de miles (`$505,680`) |
| Tipo de documento | Factura electrónica o Comprobante (según `tipoDoc`) |
| Estado | Pagado / Abierto / Cancelado |
| Estado DIAN | Enviada / Pendiente (badge de advertencia, amarillo) |

**Filtros** (todos funcionales, D7):

- Buscar por No. Orden (también coincide con el número de documento).
- Fecha (un día: desde = hasta).
- Estado: Todos / Pagado / Abierto / Cancelado.
- Usuario, Zona y Mesa: opciones armadas con los valores presentes en las ventas.
- Tipo de documento: Todos / Comprobante / Factura electrónica.
- Estado DIAN: Todos / Enviada / Pendiente.

El clic en una fila abre `/ventas/:id`.

## 7. Detalle `/ventas/:id` (Restaurantes)

Se mantiene la UI actual y los datos salen de la venta registrada. Si el id no existe: estado vacío "Venta no encontrada" con botón Volver.

- **Encabezado:** "Orden No. {numero}", badge de estado y botón "Imprimir recibo" (reimprime el ticket de la venta).
- **Información general:** No. Documento (`numeroDocumento` o `---`), Tipo de documento, Resolución, CUFE, Mesa, Zona, Sucursal, Personas, Hora apertura, Hora cierre y Duración (cierre menos apertura en minutos; `---` si falta).
- **Productos:** las líneas reales, con la nota en cursiva y el desglose del combo como texto secundario.
- **Método de pago:**
  - sin pagos: "Pago no realizado";
  - con `persona`: lista por persona;
  - más de un método: pago mixto;
  - un método: método y total, más Monto recibido y Cambio si es Efectivo con cambio mayor a 0.
- **Totales:** Subtotal, Descuento, IVA 19%, Propina (si es mayor a 0) y Total, con los valores cobrados.

## 8. Datos sembrados (Restaurantes)

Diez ventas `ORD0001`–`ORD0010` con ítems del catálogo de Restaurantes (ids 101–184), propina del 10 %, y las zonas y mesas reales del plano (Salón: S02, S04…; Terraza: T02, T04…, no "Zona 1/2" ni "Mesa N"). Se conserva la mezcla de estados de hoy:

- Tipo de documento mezclado: `ORD0001`, `03`, `04`, `05`, `07`, `08` y `09` son Comprobante; `ORD0002`, `06` y `10` son Factura electrónica.

- `ORD0003` y `ORD0007`: abiertas (sin pagos).
- `ORD0005`: cancelada.
- `ORD0006`: factura con estado DIAN pendiente.
- Una venta con pago mixto (Efectivo + Tarjeta) y una con pago dividido por persona.
- Las facturas llevan número de documento `SETT 2400401`–`SETT 2400403`, resolución y CUFE. El primer cobro nuevo es `SETT 2400418`.
- La clave de `localStorage` de Restaurantes es `bold-pos:ventas:restaurantes:v2`.
- El badge DIAN "Pendiente" (`ORD0006`) usa la variante de advertencia.
- En `/ventas`, las ventas abiertas (`ORD0003`, `ORD0007`) muestran `---` en Hora Cierre.

## 9. Qué NO cambia en Restaurantes

- El menú: Ingresos sigue siendo Ventas, Recibos, Notas crédito y Notas débito.
- El Dashboard (`pages/Dashboard.tsx`) no se toca.
- El checkout se ve igual que hoy: sin selector de tipo de documento, siempre factura electrónica (las ventas nuevas son siempre `factura`).
- Las rutas existentes (`/ventas`, `/ventas/:id`) y el basename no se modifican.
- La comanda de cocina y las pestañas de Mostrador conservan su formato visual (`#011`).

## 10. Fuera de alcance

- Anular, editar o reabrir una venta ya cobrada.
- Ventas a crédito o cobros parciales desde el checkout (solo existen como datos sembrados en Retail).
- Un botón para restablecer los datos de demo (D7).
- Persistir ventas fuera de `localStorage`.

## 11. Limitaciones conocidas

- Las mesas sembradas con comanda ya enviada (sin `orderSeq`) no muestran "Orden #" en la vista previa de cocina hasta que se envían ajustes o se cobra la mesa.
- El consecutivo `SETT` es independiente por vertical: Restaurantes usa `bold-pos:invoice-seq:v1` y Retail `bold-pos:invoice-seq:retail:v1`. Ambos arrancan en `SETT 2400418`.
