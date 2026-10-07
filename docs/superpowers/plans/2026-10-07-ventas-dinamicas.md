# Ventas dinámicas + Comprobantes / Facturas de Venta (Retail) — Plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan checkbox (`- [ ]`).

**Objetivo:** que las ventas cobradas en el prototipo aparezcan en Ingresos, de la más reciente a la más antigua y con detalle real. Restaurantes conserva su módulo Ventas, ahora con número `ORD####`. Retail lo reemplaza por **Comprobantes** y **Facturas de Venta**.

**Arquitectura:** un store `ventasStore` (Context + `localStorage`, una clave por vertical, igual que `itemsStore`) arranca con datos sembrados y recibe cada venta que Mesas o Mostrador cobra, mediante `registrarVenta(sale)` en `onConfirmPay`. Las páginas de listado y detalle leen solo del store. En Restaurantes, el número de comanda pasa a ser un consecutivo global compartido por Mesas y Mostrador; ese mismo número es el `ORD####` de la venta. En Retail, el checkout suma el selector "Tipo de documento", que decide si la venta es un comprobante (consecutivo propio) o una factura (`SETT`).

**Stack:** React 18 + TypeScript + Vite, React Router v7, Context + `localStorage`, estilos con variables CSS de Merlin.

**Verticales:** el store, el orden, los datos dinámicos y el detalle real son **Core**. ORD y el módulo Ventas son de **Restaurantes**. Comprobantes, Facturas de Venta y el selector del checkout son de **Retail**.

---

## Decisiones ya tomadas (con el usuario)

| # | Decisión |
|---|---|
| D1 | Las ventas son dinámicas en ambas verticales y se ordenan por fecha de emisión, de la más reciente a la más antigua. |
| D2 | En Restaurantes, `ORD####` es **el mismo número de la comanda**. |
| D3 | La comanda usa un **consecutivo global** compartido por Mesas y Mostrador (forma A), así que nunca se repite. |
| D4 | En Retail no hay ORD. El comprobante usa `No. 3763…` y la factura usa `SETT …`. |
| D5 | En Retail, el checkout tiene el selector "Tipo de documento" (Factura electrónica / Comprobante). Restaurantes no cambia: siempre factura. |
| D6 | En Retail, Ingresos queda: Recibos, Comprobantes, Facturas de Venta, Cotizaciones, Notas crédito y Notas débito. Restaurantes no cambia. |
| D8 | "Cotizaciones" aparece en el menú solo en Retail y es solo visual: al hacer clic muestra el toast `Cotizaciones` (patrón de los demás ítems pendientes, `toast.info`). Sin ruta ni página. |
| D7 | Los filtros de los listados funcionan. No hay botón de "restablecer demo". |

## Decisiones propias del plan (para validar en la revisión)

- **P1 · Saltos en el consecutivo:** el número se reserva al crear una orden de Mostrador o al primer envío/cobro de una Mesa. Una orden que no se cobra deja un hueco (ORD0012 → ORD0014), como pasa con una orden anulada en un POS real. En desarrollo, el StrictMode de React también puede generar saltos al crear las órdenes iniciales de Mostrador.
- **P2 · Formato visible:** la factura impresa y el listado de Ventas muestran `ORD0011`. La comanda de cocina y las pestañas de Mostrador conservan su formato actual (`#011`), con el mismo número.
- **P3 · Comprobante sin desglose de impuestos:** como en la foto de referencia, el detalle y el ticket del comprobante muestran Subtotal / Descuento / Total, sin filas de IVA. La factura sí desglosa el IVA.
- **P4 · Una tarifa de IVA:** el checkout usa una sola tarifa (19 %). La columna "Impuesto" de la factura muestra "IVA 19%" en todas las líneas. No se modela IVA por ítem.
- **P5 · Ventas sembradas:**
  - Restaurantes: `ORD0001`–`ORD0010`, que reemplazan a `O-001`–`O-010`. El consecutivo arranca en 11.
  - Retail: comprobantes `3753`–`3762` (el siguiente es 3763) y facturas `SETT 2400410`–`SETT 2400417` (el siguiente es `SETT 2400418`, el inicio actual de `INVOICE_SEQ_START`).
  - Todas con fechas entre el 28-sep y el 6-oct de 2026.
- **P6 · Rutas:** en Retail, `/ventas` y `/ventas/:id` redirigen a `/comprobantes`. Las rutas existentes no se modifican; la redirección vive dentro de las páginas.

---

## Mapa de archivos

**Crear**
| Archivo | Responsabilidad |
|---|---|
| `specs/2026-10-ventas-dinamicas.md` | Spec Core / Restaurantes (ventas dinámicas, orden, ORD, consecutivo de comanda). |
| `specs/2026-10-comprobantes-facturas-retail.md` | Spec Retail (menú, listados, detalles, selector del checkout). |
| `src/app/utils/orderNumber.ts` | Consecutivo global de comanda / ORD (`nextOrderNumber`, `formatOrderNumber`). |
| `src/app/utils/ventas.ts` | Funciones puras: `ventaFromSale`, `saleFromVenta`, `filterVentas`, etiquetas por vertical, formato de fechas y moneda. |
| `src/app/data/ventasSeed.ts` | Ventas sembradas de Restaurantes. |
| `src/app/data/retail/ventasSeed.ts` | Comprobantes y facturas sembrados de Retail. |
| `src/app/store/ventasStore.tsx` | Store de ventas (`ventas`, `getVenta`, `registrarVenta`). |
| `src/app/components/ventas/VentaBadge.tsx` | Badge de estado reutilizado por todos los listados y detalles. |
| `src/app/components/ventas/ventasStyles.ts` | Estilos compartidos de tabla, filtros y tarjetas. |
| `src/app/verticals/retail/ingresos/documentosVenta.ts` | Configuración por tipo (título, ruta base, columnas). |
| `src/app/verticals/retail/ingresos/DocumentosVentaListPage.tsx` | Listado de Comprobantes o de Facturas de Venta. |
| `src/app/verticals/retail/ingresos/DocumentoVentaDetallePage.tsx` | Detalle de un comprobante o de una factura. |

**Modificar**
| Archivo | Cambio |
|---|---|
| `src/app/types/venta.ts` | Nuevo modelo `Venta`. Se eliminan `VentaRow`, `Pedido`, `PedidoProducto` y los tipos de pago viejos. |
| `src/app/utils/invoice.ts` | `CompletedSale.tipoDoc`, `SaleItem.note` y `nextComprobanteNumber()`. |
| `src/app/data/verticalCatalog.ts` | `ventasStorageKey` y `buildSeedVentas` por vertical. |
| `src/app/components/RootLayout.tsx` | `<VentasProvider key={vertical}>`. |
| `src/app/components/MesasView.tsx` | `orderSeq` desde `nextOrderNumber()`, `openCheckout()`, `registrarVenta`. |
| `src/app/pages/HomePage.tsx` | Número de orden global (Restaurantes) y `registrarVenta`. |
| `src/app/components/CheckoutDrawer.tsx` | Selector "Tipo de documento" en Retail y número según el tipo. |
| `src/app/components/InvoiceTicket.tsx` | Título y campos DIAN según `tipoDoc`. |
| `src/app/components/SaleCompletedPanel.tsx` | Texto "Imprimir comprobante" o "Imprimir factura". |
| `src/app/pages/VentasPage.tsx` | Lee del store, filtros funcionales y redirección en Retail. |
| `src/app/pages/PedidoDetallePage.tsx` | Detalle desde `Venta` (ítems, pagos y totales reales) y redirección en Retail. |
| `src/app/vertical/modules.ts` | Módulos `ventas` (Restaurantes), `comprobantes` y `facturas-venta` (Retail). |
| `src/app/App.tsx` | Cuatro rutas nuevas envueltas en `VerticalRoute`. |
| `src/app/components/BoldNavBar.tsx` | Sub-ítems Comprobantes y Facturas de Venta, `OWNED_ROUTES` y sección activa. |
| `specs/README.md` | Dos filas nuevas en el índice. |

**Eliminar:** `src/app/data/retail/ventasMocks.ts` (lo reemplaza `data/retail/ventasSeed.ts`).

## Cómo se verifica (aplica a todas las tareas)

El repo **no tiene runner de tests** y `tsc` ya arrastra 55 errores en otros archivos. Cada tarea se verifica así:

1. **Tipos:** `npx tsc --noEmit -p . 2>&1 | grep -E "<archivos de la tarea>"` debe devolver **vacío**.
2. **Build:** `npm run build` termina sin errores.
3. **Navegador** (desde la Tarea 5): `preview_start` en `http://localhost:5173/bold-pos-web/` y la revisión que indique cada tarea.

No se agrega un framework de tests (YAGNI, es un prototipo). La lógica crítica (`ventaFromSale`, `filterVentas`, `nextOrderNumber`) son funciones puras y se revisan en el navegador con `javascript_tool` cuando haga falta.

---

### Tarea 0: Branch y specs

**Archivos:** crear los dos specs y modificar `specs/README.md`.

- [ ] **Paso 1: Crear la branch**
```bash
git fetch origin && git checkout -b bn-feature/ventas-dinamicas origin/main
```
- [ ] **Paso 2: Escribir `specs/2026-10-ventas-dinamicas.md`**. Encabezado: Fecha 2026-10, **Vertical: Core** (con secciones solo para Restaurantes), Estado "Listo para implementación", antecedente `2026-10-selector-vertical.md`. Contenido: D1, D2, D3, P1, P2 y P5 (Restaurantes); el modelo `Venta` (Tarea 1); el flujo cobro → `registrarVenta` → listado; columnas y filtros de `/ventas`; los campos del detalle `/ventas/:id`.
- [ ] **Paso 3: Escribir `specs/2026-10-comprobantes-facturas-retail.md`**. Encabezado: **Vertical: Retail**, Estado "Listo para implementación", antecedentes `2026-10-ventas-dinamicas.md` y `2026-09-checkout-factura.md`. Contenido: D4–D7, P3, P4 y P6; la diferencia entre comprobante (no va a la DIAN) y factura electrónica (va a la DIAN, con CUFE y desglose de IVA); columnas, filtros y detalle de cada tipo (Tareas 9 y 10); el selector del checkout (Tarea 6).
- [ ] **Paso 4: Agregar las dos filas arriba del índice en `specs/README.md`.**
- [ ] **Paso 5: Commit**
```bash
git add specs/ && git commit -m "docs(specs): ventas dinámicas y comprobantes/facturas de Retail"
```

---

### Tarea 1: Modelo `Venta` y utilidades puras

**Archivos:** modificar `src/app/types/venta.ts` y `src/app/utils/invoice.ts`; crear `src/app/utils/orderNumber.ts` y `src/app/utils/ventas.ts`.

- [ ] **Paso 1: Reemplazar el contenido de `types/venta.ts`.** Los tipos viejos se borran en la Tarea 11; hasta entonces conviven.

```ts
/**
 * venta.ts — Modelo de una venta registrada (specs/2026-10-ventas-dinamicas.md).
 * Una sola forma para ambas verticales: Restaurantes la muestra en /ventas,
 * Retail en /comprobantes y /facturas-venta según `tipoDoc`.
 */
import type { SaleItem } from '../utils/invoice';

export type TipoDocVenta = 'comprobante' | 'factura';
export type EstadoVenta  = 'pagada' | 'no-pagada' | 'abierta' | 'cancelada';
export type EstadoDian   = 'aceptada' | 'pendiente';

export interface VentaPago {
  method: string;
  amount: number;
  /** Pago dividido por persona (Restaurantes). */
  persona?: string;
}

export interface Venta {
  /** Id interno único: lo usa la ruta del detalle. */
  id: string;
  /** Número visible: 'ORD0011' (Restaurantes) · '3763' (comprobante) · 'SETT 2400418' (factura Retail). */
  numero: string;
  tipoDoc: TipoDocVenta;
  /** Restaurantes: número de la factura electrónica asociada a la orden ('SETT 2400418'). */
  numeroDocumento?: string;
  /** Epoch ms de la emisión (= cobro). Define el orden del listado. */
  emitidaEn: number;
  /** Epoch ms de la apertura de la mesa/orden (Restaurantes). */
  abiertaEn?: number;
  /** Ventas de contado: igual a emitidaEn. */
  vencimiento: number;
  zona?: string;
  mesa?: string;
  personas?: number;
  cliente: string;
  vendedor: string;
  emitidoPor: string;
  sucursal: string;
  turno: number;
  resolucion: string;
  items: SaleItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
  pagos: VentaPago[];
  cambio: number;
  /** Lo que falta por pagar (0 si está pagada). */
  saldo: number;
  formaPago: 'Contado' | 'Crédito';
  estado: EstadoVenta;
  /** Solo facturas. */
  dian?: EstadoDian;
  /** Solo facturas. */
  cufe?: string;
  /** Código del recibo de caja ('8428'). */
  recibo: string;
  note: string;
}
```

- [ ] **Paso 2: En `utils/invoice.ts`:** agregar `note?: string` a `SaleItem` y `tipoDoc: 'comprobante' | 'factura'` a `CompletedSale`; luego el consecutivo de comprobantes debajo de `nextInvoiceNumber`:

```ts
const COMPROBANTE_SEQ_KEY = 'bold-pos:comprobante-seq:v1';
/** Primer comprobante que se emite: los sembrados de Retail llegan a 3762. */
export const COMPROBANTE_SEQ_START = 3763;

/** Siguiente número de comprobante de Retail ("3763", luego "3764"…). Persistido en localStorage. */
export function nextComprobanteNumber(): string {
  let n = COMPROBANTE_SEQ_START;
  try {
    const last = parseInt(localStorage.getItem(COMPROBANTE_SEQ_KEY) ?? '', 10);
    if (Number.isFinite(last) && last >= COMPROBANTE_SEQ_START) n = last + 1;
    localStorage.setItem(COMPROBANTE_SEQ_KEY, String(n));
  } catch { /* storage no disponible: se usa el inicial */ }
  return String(n);
}
```

- [ ] **Paso 3: Crear `utils/orderNumber.ts`**

```ts
/**
 * orderNumber.ts — Consecutivo global de comanda / orden de Restaurantes
 * (specs/2026-10-ventas-dinamicas.md). Mesas y Mostrador lo comparten, así que
 * un número nunca se repite. El mismo número es el "ORD####" de la venta.
 * Llamarlo solo desde handlers de eventos: nunca dentro de render ni de
 * updaters de setState (StrictMode los ejecuta dos veces).
 */
const ORDER_SEQ_KEY = 'bold-pos:order-seq:v1';
/** ORD0001–ORD0010 son las ventas sembradas (data/ventasSeed.ts). */
export const ORDER_SEQ_START = 11;

export function nextOrderNumber(): number {
  let n = ORDER_SEQ_START;
  try {
    const last = parseInt(localStorage.getItem(ORDER_SEQ_KEY) ?? '', 10);
    if (Number.isFinite(last) && last >= ORDER_SEQ_START) n = last + 1;
    localStorage.setItem(ORDER_SEQ_KEY, String(n));
  } catch { /* storage no disponible */ }
  return n;
}

export function formatOrderNumber(n: number): string {
  return `ORD${String(n).padStart(4, '0')}`;
}
```

- [ ] **Paso 4: Crear `utils/ventas.ts`** con estas funciones puras:

```ts
import type { CompletedSale } from './invoice';
import type { Venta, VentaPago, EstadoVenta, EstadoDian } from '../types/venta';
import type { Vertical } from '../vertical';

/** Datos de la venta que no están en CompletedSale (los da quien cobra). */
export interface VentaContexto {
  zona?: string;
  mesa?: string;
  personas?: number;
  abiertaEn?: number;
}

/** Datos fijos de la sesión del prototipo por vertical (sucursal, turno abierto, usuario). */
export const SESION_VENTAS: Record<Vertical, { sucursal: string; turno: number; emitidoPor: string }> = {
  restaurantes: { sucursal: 'Principal',          turno: 529, emitidoPor: 'Juan Pérez' },
  retail:       { sucursal: 'Hub Ciudad del Río', turno: 529, emitidoPor: 'Wendell Nazar' },
};

/** CUFE mock determinista (96 hex) a partir del número y la fecha. */
export function mockCufe(seed: string): string {
  let h = 0x811c9dc5;
  let out = '';
  for (let round = 0; out.length < 96; round++) {
    for (const ch of `${seed}:${round}`) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
    out += h.toString(16).padStart(8, '0');
  }
  return out.slice(0, 96);
}

export function ventaFromSale(sale: CompletedSale, vertical: Vertical, recibo: string, ctx: VentaContexto = {}): Venta {
  const sesion = SESION_VENTAS[vertical];
  const restaurantes = vertical === 'restaurantes';
  const esFactura = sale.tipoDoc === 'factura';
  const pagos: VentaPago[] = sale.payEntries.map(p => ({ method: p.method, amount: p.amount }));
  return {
    id: `v-${sale.paidAt}-${Math.random().toString(36).slice(2, 7)}`,
    numero: restaurantes ? sale.orderRef : sale.invoiceNumber,
    tipoDoc: sale.tipoDoc,
    numeroDocumento: restaurantes ? sale.invoiceNumber : undefined,
    emitidaEn: sale.paidAt,
    abiertaEn: ctx.abiertaEn,
    vencimiento: sale.paidAt,
    zona: ctx.zona,
    mesa: ctx.mesa,
    personas: ctx.personas,
    cliente: sale.cliente,
    vendedor: sale.vendedor,
    emitidoPor: sesion.emitidoPor,
    sucursal: sesion.sucursal,
    turno: sesion.turno,
    resolucion: esFactura ? sale.resolucion : '---',
    items: sale.items,
    subtotal: sale.subtotal,
    taxRate: sale.taxRate,
    tax: sale.tax,
    tip: sale.tip,
    discount: sale.discount,
    total: sale.total,
    pagos,
    cambio: sale.cambio,
    saldo: 0,
    formaPago: 'Contado',
    estado: 'pagada',
    dian: esFactura ? 'aceptada' : undefined,
    cufe: esFactura ? mockCufe(`${sale.invoiceNumber}|${sale.paidAt}`) : undefined,
    recibo,
    note: sale.note,
  };
}

/** Reconstruye una CompletedSale para reimprimir el ticket desde el detalle. */
export function saleFromVenta(v: Venta): CompletedSale {
  return {
    title: v.mesa ? `Mesa ${v.mesa}` : v.numero,
    orderRef: v.numero.startsWith('ORD') ? v.numero : '',
    invoiceNumber: v.numeroDocumento ?? v.numero,
    tipoDoc: v.tipoDoc,
    items: v.items,
    subtotal: v.subtotal, taxRate: v.taxRate, tax: v.tax,
    tip: v.tip, tipLabel: 'Propina', discount: v.discount, total: v.total,
    payEntries: v.pagos.map(p => ({ method: p.method, amount: p.amount })),
    cambio: v.cambio,
    cliente: v.cliente,
    vendedor: v.vendedor,
    vendedorLabel: v.mesa !== undefined ? 'Mesero' : 'Vendedor',
    resolucion: v.resolucion,
    note: v.note,
    paidAt: v.emitidaEn,
  };
}

// ── Etiquetas ─────────────────────────────────────────────────────────────────
export type BadgeVariant = 'success' | 'warning' | 'error' | 'info';

/** Restaurantes conserva sus textos (Pagado/Abierto/Cancelado). Retail usa los del POS real (Pagada/No pagada). */
export function estadoLabel(estado: EstadoVenta, vertical: Vertical): { label: string; variant: BadgeVariant } {
  const rest = vertical === 'restaurantes';
  switch (estado) {
    case 'pagada':    return { label: rest ? 'Pagado' : 'Pagada', variant: 'success' };
    case 'no-pagada': return { label: 'No pagada', variant: 'warning' };
    case 'abierta':   return { label: 'Abierto', variant: 'warning' };
    case 'cancelada': return { label: rest ? 'Cancelado' : 'Anulada', variant: 'error' };
  }
}

export function dianLabel(dian: EstadoDian | undefined, vertical: Vertical): { label: string; variant: BadgeVariant } | null {
  if (!dian) return null;
  if (dian === 'pendiente') return { label: 'Pendiente', variant: 'info' };
  return { label: vertical === 'restaurantes' ? 'Enviada' : 'Aceptada', variant: 'success' };
}

export function tipoDocLabel(v: Venta): string {
  return v.tipoDoc === 'factura' ? 'Factura electrónica' : 'Comprobante';
}

export function metodoPagoLabel(v: Venta): string {
  const metodos = Array.from(new Set(v.pagos.map(p => p.method)));
  return metodos.length > 1 ? 'Pago mixto' : (metodos[0] ?? '---');
}

// ── Formato ───────────────────────────────────────────────────────────────────
export const fmtCOP = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`;

/** '06/10/2026 16:01' */
export function fmtFechaHora(ms: number): string {
  const d = new Date(ms);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 'yyyy-mm-dd' local, para comparar con <input type="date">. */
export function isoDia(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Filtros ───────────────────────────────────────────────────────────────────
/** '' o 'Todos' = sin filtro. */
export interface FiltrosVenta {
  numero?: string;
  desde?: string;      // yyyy-mm-dd
  hasta?: string;      // yyyy-mm-dd
  estado?: EstadoVenta | '';
  dian?: EstadoDian | '';
  tipoDoc?: 'comprobante' | 'factura' | '';
  vendedor?: string;
  cliente?: string;
  zona?: string;
  mesa?: string;
  metodoPago?: string;
  notas?: string;
}

const activo = (v?: string) => !!v && v !== 'Todos';

export function filterVentas(ventas: Venta[], f: FiltrosVenta): Venta[] {
  const q = f.numero?.trim().toLowerCase();
  const notas = f.notas?.trim().toLowerCase();
  return ventas.filter(v =>
    (!q || v.numero.toLowerCase().includes(q) || (v.numeroDocumento ?? '').toLowerCase().includes(q)) &&
    (!f.desde || isoDia(v.emitidaEn) >= f.desde) &&
    (!f.hasta || isoDia(v.emitidaEn) <= f.hasta) &&
    (!f.estado || v.estado === f.estado) &&
    (!f.dian || v.dian === f.dian) &&
    (!f.tipoDoc || v.tipoDoc === f.tipoDoc) &&
    (!activo(f.vendedor) || v.vendedor === f.vendedor) &&
    (!activo(f.cliente) || v.cliente === f.cliente) &&
    (!activo(f.zona) || v.zona === f.zona) &&
    (!activo(f.mesa) || v.mesa === f.mesa) &&
    (!activo(f.metodoPago) || v.pagos.some(p => p.method === f.metodoPago)) &&
    (!notas || v.note.toLowerCase().includes(notas)),
  );
}

/** Valores únicos de un campo, para armar las opciones de un filtro. */
export function opciones(ventas: Venta[], get: (v: Venta) => string | undefined): string[] {
  return Array.from(new Set(ventas.map(get).filter((x): x is string => !!x))).sort();
}
```

- [ ] **Paso 5: Verificar tipos.** `npx tsc --noEmit -p . 2>&1 | grep -E "utils/(ventas|orderNumber|invoice)|types/venta"`. Lo esperado: errores **solo** en los llamadores de `CompletedSale` por el campo `tipoDoc` que falta (`CheckoutDrawer.tsx`). Se resuelven en la Tarea 6. Para no dejar el build roto, en este paso se agrega `tipoDoc: 'factura'` al objeto de `finalizePay` en `CheckoutDrawer.tsx:423`; la Tarea 6 lo vuelve dinámico.
- [ ] **Paso 6: Commit** `feat(ventas): modelo Venta, consecutivos de orden y comprobante, utilidades`

---

### Tarea 2: Datos sembrados por vertical

**Archivos:** crear `src/app/data/ventasSeed.ts` y `src/app/data/retail/ventasSeed.ts`; modificar `src/app/data/verticalCatalog.ts`.

- [ ] **Paso 1: Helper de semilla.** Cada archivo define una función `seed()` que recibe ítems y calcula los totales, para que siempre cuadren:

```ts
const TAX = 0.19;
const at = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).getTime(); // octubre = 9 (sep = 8)

function seed(base: Omit<Venta, 'subtotal' | 'tax' | 'taxRate' | 'tip' | 'total' | 'discount' | 'vencimiento' | 'pagos' | 'cambio' | 'saldo' | 'formaPago'>
  & { tipRate?: number; pagos?: VentaPago[]; recibido?: number; pagado?: number }): Venta {
  const subtotal = base.items.reduce((s, i) => s + Math.round(i.price * (1 - (i.discount ?? 0) / 100)) * i.quantity, 0);
  const tax   = Math.round(subtotal * TAX);
  const tip   = Math.round(subtotal * (base.tipRate ?? 0));
  const total = subtotal + tax + tip;
  const pagado = base.pagado ?? (base.estado === 'pagada' ? total : 0);
  const pagos = base.pagos ?? (pagado > 0 ? [{ method: 'Efectivo', amount: pagado }] : []);
  return {
    ...base, subtotal, tax, taxRate: TAX, tip, discount: 0, total,
    vencimiento: base.emitidaEn, pagos,
    cambio: base.recibido ? base.recibido - total : 0,
    saldo: total - pagado, formaPago: 'Contado',
  };
}
```

- [ ] **Paso 2: `data/ventasSeed.ts` (Restaurantes).** `export function buildRestaurantSeedVentas(): Venta[]` con 10 ventas `ORD0001`–`ORD0010` (id = el mismo número). Ítems del catálogo de Restaurantes (`productCatalog.ts`, ids 101–184, `id: String(productId)`), `tipRate: 0.10`, zonas/mesas y meseros de las filas actuales de `VentasPage.tsx`, y fechas del 6-oct-2026 entre 12:00 y 21:00. La mezcla de estados de hoy se conserva:
  - ORD0003 y ORD0007: `abierta` (pagos vacíos).
  - ORD0005: `cancelada`.
  - ORD0006: factura con `dian: 'pendiente'`.
  - Una venta con `pagos` mixto (Efectivo + Tarjeta) y una con pago dividido por `persona`.
  - Las facturas (`tipoDoc: 'factura'`) llevan `numeroDocumento: 'SETT 24004xx'`, `resolucion` y `cufe: mockCufe(numero)`. Los comprobantes llevan `resolucion: '---'`.
- [ ] **Paso 3: `data/retail/ventasSeed.ts` (Retail).** `export function buildRetailSeedVentas(): Venta[]` con datos tomados de las fotos:
  - 10 comprobantes `3753`–`3762` (id `c-3753`…), clientes `Daniel Aycardy`, `David`, `Consumidor final`, `Comercial Andina SAS (NIT: 901.555.777)`, sucursal `Hub Ciudad del Río`, turnos 520–528, `emitidoPor: 'Wendell Nazar'`. El `3755` va `no-pagada`, con total de $5,000 y saldo de $3,000 (`pagado: 2000`), como en la foto.
  - 8 facturas `SETT 2400410`–`SETT 2400417` (id `f-2400410`…): `dian: 'aceptada'`, salvo `SETT 2400410`, que va `pendiente` y `no-pagada`. Cada una con `cufe` y `resolucion: 'Resolution - Retail Demo 2026'`.
  - Ítems del catálogo Retail (ids 201+, p. ej. Camiseta Básica Algodón, Jean Slim Azul Oscuro, Gorra Visera Curva); métodos de pago Efectivo, Nequi y Tarjeta; recibos `8410`–`8428`; fechas del 28-sep al 6-oct de 2026.
- [ ] **Paso 4: `verticalCatalog.ts`.** Agregar a `VerticalCatalog`:
```ts
  /** Clave de localStorage del store de Ventas — separada por vertical. */
  ventasStorageKey: string;
  buildSeedVentas: () => Venta[];
```
  Restaurantes: `'bold-pos:ventas:restaurantes:v1'` y `buildRestaurantSeedVentas`. Retail: `'bold-pos:ventas:retail:v1'` y `buildRetailSeedVentas`.
- [ ] **Paso 5: Verificar tipos** (`grep -E "ventasSeed|verticalCatalog"` vacío) y **commit** `feat(ventas): ventas sembradas de Restaurantes y Retail`.

---

### Tarea 3: Store de ventas

**Archivos:** crear `src/app/store/ventasStore.tsx`; modificar `src/app/components/RootLayout.tsx:130-134` y `:224-226`.

- [ ] **Paso 1: Crear el store** (mismo patrón que `itemsStore.tsx`):

```tsx
/**
 * ventasStore.tsx — Ventas registradas (specs/2026-10-ventas-dinamicas.md).
 * Arranca con las ventas sembradas de la vertical y suma cada venta cobrada
 * en Mesas/Mostrador. Persistido en localStorage por vertical; el provider se
 * remonta al cambiar de vertical (key en RootLayout). Versionado en vez de
 * migración: si cambia el shape de Venta, se bumpea la clave en verticalCatalog.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Venta } from '../types/venta';
import type { CompletedSale } from '../utils/invoice';
import { ventaFromSale, type VentaContexto } from '../utils/ventas';
import { getVerticalCatalog } from '../data/verticalCatalog';
import { useVertical, type Vertical } from '../vertical';

function loadVentas(vertical: Vertical): Venta[] {
  const { ventasStorageKey, buildSeedVentas } = getVerticalCatalog(vertical);
  try {
    const raw = localStorage.getItem(ventasStorageKey);
    if (raw) return JSON.parse(raw) as Venta[];
  } catch { /* ignore */ }
  const seed = buildSeedVentas();
  saveVentas(vertical, seed);
  return seed;
}

function saveVentas(vertical: Vertical, ventas: Venta[]): void {
  try {
    localStorage.setItem(getVerticalCatalog(vertical).ventasStorageKey, JSON.stringify(ventas));
  } catch { /* ignore */ }
}

interface VentasCtx {
  /** Ordenadas por emisión: la más reciente primero. */
  ventas: Venta[];
  getVenta: (id: string) => Venta | undefined;
  registrarVenta: (sale: CompletedSale, ctx?: VentaContexto) => Venta;
}

const VentasContext = createContext<VentasCtx | null>(null);

export function VentasProvider({ children }: { children: React.ReactNode }) {
  const { vertical } = useVertical();
  const [raw, setRaw] = useState<Venta[]>(() => loadVentas(vertical));

  const ventas = useMemo(() => [...raw].sort((a, b) => b.emitidaEn - a.emitidaEn), [raw]);

  const getVenta = useCallback((id: string) => raw.find(v => v.id === id), [raw]);

  const registrarVenta = useCallback((sale: CompletedSale, ctx?: VentaContexto) => {
    // El recibo se calcula fuera del updater para que StrictMode no lo duplique.
    const recibo = String(Math.max(0, ...raw.map(v => parseInt(v.recibo, 10) || 0)) + 1);
    const venta = ventaFromSale(sale, vertical, recibo, ctx);
    setRaw(prev => {
      const next = [...prev, venta];
      saveVentas(vertical, next);
      return next;
    });
    return venta;
  }, [raw, vertical]);

  return (
    <VentasContext.Provider value={{ ventas, getVenta, registrarVenta }}>
      {children}
    </VentasContext.Provider>
  );
}

export function useVentas(): VentasCtx {
  const ctx = useContext(VentasContext);
  if (!ctx) throw new Error('useVentas debe usarse dentro de <VentasProvider>');
  return ctx;
}
```

- [ ] **Paso 2: `RootLayout.tsx`.** Envolver justo dentro de `<ItemsProvider key={vertical}>` con `<VentasProvider key={vertical}>` y cerrar antes de `</ItemsProvider>`.
- [ ] **Paso 3: Verificar tipos y build.** En el navegador, `localStorage.getItem('bold-pos:ventas:restaurantes:v1')` devuelve 10 ventas después de cargar `/`.
- [ ] **Paso 4: Commit** `feat(ventas): store de ventas persistido por vertical`

---

### Tarea 4: Consecutivo global de comanda (Restaurantes, forma A)

**Archivos:** modificar `src/app/components/MesasView.tsx` y `src/app/pages/HomePage.tsx`.

- [ ] **Paso 1: MesasView, envío a cocina.** Antes del `setTables` de `sendComanda` (~línea 1458): `const seq = selectedTable.orderSeq ?? nextOrderNumber();`. Dentro del updater, cambiar `orderSeq: t.orderSeq ?? (Date.now() % 1000)` por `orderSeq: seq`.
- [ ] **Paso 2: MesasView, cobro sin comanda.** Crear un helper y usarlo en las dos llamadas a `setShowCheckout(true)` (líneas 1733 y 3045):
```ts
/** Abre el cobro; si la mesa nunca envió comanda, le asigna su número de orden ahora. */
const openCheckout = (table: MesaTable) => {
  if (table.orderSeq == null) {
    const seq = nextOrderNumber();
    setTables(prev => prev.map(t => t.id === table.id ? { ...t, orderSeq: seq } : t));
  }
  setShowCheckout(true);
};
```
  Llamadas: `openCheckout(table)` en el `case 'pagar'` (línea 1733) y `openCheckout(selectedTable)` en el botón Cobrar del panel (línea 3045).
- [ ] **Paso 3: MesasView, quitar fallbacks.**
  - `orderRef` del `CheckoutDrawer` (línea 1811): `orderRef={selectedTable.orderSeq != null ? formatOrderNumber(selectedTable.orderSeq) : undefined}`.
  - `KitchenTicketPreviewModal` (líneas 1783 y 2396): pasar `orderSeq={selectedTable.orderSeq}` sin el fallback de `charCodeAt`. La vista previa de una comanda que todavía no se envió no muestra número.
- [ ] **Paso 4: HomePage, solo Restaurantes (`kitchen === true`).**
  - `buildInitialOrders(vertical)` (Restaurantes): HomePage se remonta al navegar y reconstruye sus 7 órdenes iniciales, así que pedir 7 números nuevos por montaje inflaría el ORD. En su lugar, un "slate" persistido: `utils/orderNumber.ts` suma `getMostradorSlate(count): number[]`, que lee `localStorage['bold-pos:mostrador-slate:v1']` (arreglo de números) y, si falta o tiene menos de `count`, reserva con `nextOrderNumber()` los que falten y lo guarda; y `replaceMostradorSlateEntry(index, n)`. Las 7 órdenes iniciales toman sus números del slate (`String(n).padStart(3,'0')`); al cobrar una orden inicial, su número nuevo (`nextOrderNumber()`) reemplaza esa entrada del slate. Las órdenes creadas con `addOrder` consumen un número nuevo y no se persisten en el slate. Retail no cambia.
  - `addOrder`: `const nextNum = kitchen ? String(nextOrderNumber()).padStart(3, '0') : <lógica actual>`.
  - `onConfirmPay` (línea 409): calcular antes del `setOrders` `const nuevoNumero = kitchen ? String(nextOrderNumber()).padStart(3, '0') : activeOrder.number;` y en el reset de la orden poner `number: nuevoNumero`.
  - `orderRef` del `CheckoutDrawer` (línea 407): `kitchen ? formatOrderNumber(parseInt(activeOrder.number, 10)) : \`#${activeOrder.number}\``.
- [ ] **Paso 5: Verificar en el navegador (Restaurantes).**
  - Mostrador: las pestañas muestran números consecutivos.
  - Al cobrar la orden activa, esa pestaña toma un número nuevo y no repite el anterior.
  - Mesas: al enviar comanda o cobrar, el número sigue el mismo consecutivo que Mostrador.
- [ ] **Paso 6: Commit** `feat(restaurantes): consecutivo global de comanda compartido por Mesas y Mostrador`

---

### Tarea 5: Registrar la venta al cobrar

**Archivos:** modificar `src/app/pages/HomePage.tsx:409` y `src/app/components/MesasView.tsx:1812`.

- [ ] **Paso 1: HomePage.** `const { registrarVenta } = useVentas();` y, dentro de `onConfirmPay`, antes de `setCompletedSale(sale)`:
```ts
registrarVenta(sale, kitchen ? { zona: 'Mostrador', abiertaEn: activeOrder.firstComandaSentAt } : {});
```
- [ ] **Paso 2: MesasView.** Igual, con el contexto de la mesa:
```ts
registrarVenta(sale, {
  zona: selectedTable.zone,
  mesa: selectedTable.name,
  personas: selectedTable.guests,
  abiertaEn: selectedTable.openedAtTimestamp,
});
```
- [ ] **Paso 3: Verificar.** Cobrar una venta en Mostrador. `JSON.parse(localStorage.getItem('bold-pos:ventas:restaurantes:v1')).length` pasa de 10 a 11 y la última tiene `numero: 'ORD00xx'`.
- [ ] **Paso 4: Commit** `feat(ventas): registrar la venta al confirmar el pago en Mesas y Mostrador`

---

### Tarea 6: Selector "Tipo de documento" en el checkout de Retail

**Archivos:** modificar `src/app/components/CheckoutDrawer.tsx`, `src/app/components/InvoiceTicket.tsx` y `src/app/components/SaleCompletedPanel.tsx`.

- [ ] **Paso 1: CheckoutDrawer, estado** (junto a `resolucion`, ~línea 293):
```ts
const [tipoDoc, setTipoDoc] = useState<'factura' | 'comprobante'>('factura');
```
- [ ] **Paso 2: CheckoutDrawer, UI** (fila de la línea ~456). Solo en Retail, entre Vendedor y Resolución:
```tsx
{retail && (
  <SelectField
    label="Tipo de documento"
    value={tipoDoc === 'factura' ? 'Factura electrónica' : 'Comprobante'}
    onChange={v => setTipoDoc(v === 'Comprobante' ? 'comprobante' : 'factura')}
    options={['Factura electrónica', 'Comprobante']}
  />
)}
```
  La Resolución se muestra solo si `!retail || tipoDoc === 'factura'`, porque un comprobante no lleva resolución DIAN.
- [ ] **Paso 3: CheckoutDrawer, `finalizePay`.**
```ts
const docTipo = retail ? tipoDoc : 'factura';
const invoiceNumber = docTipo === 'comprobante' ? nextComprobanteNumber() : nextInvoiceNumber();
// … en el objeto: tipoDoc: docTipo,
```
- [ ] **Paso 4: InvoiceTicket.** Agregar `tipoDoc` a `InvoiceData`, con `tipoDoc: sale.tipoDoc` en `buildInvoiceData`. Si es comprobante:
  - el título dice "Comprobante de Venta" en lugar de "Factura Electrónica de Venta";
  - se ocultan "Fecha validación", la resolución y el CUFE (si el ticket los imprime);
  - en los totales no aparece el IVA (P3).
- [ ] **Paso 5: SaleCompletedPanel.** El texto del botón y de los toasts depende de `sale.tipoDoc`: "Imprimir comprobante" o "Imprimir factura".
- [ ] **Paso 6: Verificar (Retail).**
  - Cobrar como Comprobante: el ticket dice "Comprobante de Venta No. 3763" y el store guarda `tipoDoc: 'comprobante', numero: '3763'`.
  - Cobrar como Factura: `SETT 24004xx`.
  - En Restaurantes, el checkout se ve igual que antes.
- [ ] **Paso 7: Commit** `feat(retail): selector comprobante / factura electrónica en el checkout`

---

### Tarea 7: Restaurantes — Ventas y detalle desde el store

**Archivos:** crear `src/app/components/ventas/VentaBadge.tsx` y `src/app/components/ventas/ventasStyles.ts`; modificar `src/app/pages/VentasPage.tsx` y `src/app/pages/PedidoDetallePage.tsx`; modificar `src/app/vertical/modules.ts`.

- [ ] **Paso 1: `modules.ts`.** Agregar a `EXCLUSIVE_MODULES`:
```ts
  ventas: ['restaurantes'],
  // Solo Retail
  comprobantes: ['retail'],
  'facturas-venta': ['retail'],
  cotizaciones: ['retail'],
```
  Efecto: el sub-ítem de menú `id: 'ventas'` desaparece solo en Retail, porque el filtro del menú ya usa `has(s.moduleId ?? s.id)`.
- [ ] **Paso 2: `VentaBadge.tsx`.** Mueve aquí el `StatusBadge` actual de `VentasPage.tsx:25-37`, con las variantes `success | warning | error | info`, todas con variables `--feedback-*`. Para `info` se usan `--blue-10` de fondo, `--blue-100` de texto y `--blue-20` de borde. Se usa así: `<VentaBadge {...estadoLabel(v.estado, vertical)} />`.
- [ ] **Paso 3: `ventasStyles.ts`.** Exporta `labelStyle`, `filterGroup`, `filterInput`, `tdStyle`, `thStyle`, `sectionCard`, `sectionTitle` y `font()`, movidos de `VentasPage.tsx` y `PedidoDetallePage.tsx`. Los hex hardcodeados (`#C7CBE0`, `#606060`, `#1E1E1E`, `#FFFFFF`) se cambian por las variables equivalentes (`--black-20`, `--black-60`, `--black-100`, `--black-0`), según lo que defina `MERLIN-SYSTEM.md`.
- [ ] **Paso 4: `VentasPage.tsx`.**
  - Si `!has('ventas')`, devuelve `<Navigate to="/comprobantes" replace />`, después de llamar a todos los hooks.
  - `const { ventas } = useVentas();` y el estado `filtros: FiltrosVenta`. Las filas salen de `filterVentas(ventas, filtros)`, que ya vienen de la más reciente a la más antigua.
  - Columnas iguales a las de hoy: No. Orden (`v.numero`), Hora Inicio (`fmtFechaHora(v.abiertaEn ?? v.emitidaEn)`), Hora Cierre (`fmtFechaHora(v.emitidaEn)`), Zona, Mesa (`?? '---'`), Usuario (`v.vendedor`), Total (`fmtCOP`), Tipo de documento (`tipoDocLabel`), Estado y Estado DIAN.
  - Cada filtro queda controlado: Buscar por No. Orden; Fecha (`desde` = `hasta` = el día elegido); Estado (Todos / Pagado / Abierto / Cancelado); Usuario, Zona y Mesa con `opciones()`; Tipo de documento; Estado DIAN (Todos / Enviada / Pendiente).
  - El clic en una fila navega a `/ventas/${v.id}`.
  - Sin resultados: una fila "No hay ventas con estos filtros".
  - Arriba de la tabla: "Mostrando N de M".
- [ ] **Paso 5: `PedidoDetallePage.tsx`.** Se mantiene la UI actual con las mismas secciones, pero los datos salen de `getVenta(id)`:
  - Se eliminan `PEDIDOS`, `PRODUCTOS` y `RESTAURANT_TOTALES`. Si el id no existe, se muestra un estado vacío "Venta no encontrada" con un botón Volver.
  - Encabezado: "Orden No. {v.numero}" y el badge de estado.
  - El botón "Imprimir recibo" llama a `printInvoice(buildInvoiceData(saleFromVenta(v)))`.
  - Información general: No. Documento (`numeroDocumento ?? '---'`), Tipo de documento, Resolución, CUFE, Mesa, Zona, Sucursal, Personas, Hora apertura, Hora cierre y Duración (calculada de `emitidaEn - abiertaEn` en minutos; `---` si falta).
  - Productos: `v.items`, con la nota en cursiva y el desglose del combo como texto secundario (`comboComponents`).
  - Método de pago:
    - pagos vacíos → "Pago no realizado";
    - con `persona` → lista por persona;
    - más de uno → mixto;
    - uno → método y total, más Monto recibido y Cambio si es Efectivo con `cambio > 0`.
  - Totales: Subtotal, Descuento, IVA 19%, Propina (si `tip > 0`) y Total.
  - Si `!has('ventas')`, devuelve `<Navigate to="/comprobantes" replace />`.
- [ ] **Paso 6: Verificar (Restaurantes).**
  - `/ventas` muestra las nuevas arriba, con prefijo `ORD`, y los filtros responden.
  - La venta recién cobrada abre su detalle con los ítems, el pago y los totales reales.
  - Una venta sembrada (ORD0010) también abre bien.
  - Ninguna columna ni filtro se perdió respecto de la versión anterior.
- [ ] **Paso 7: Commit** `feat(restaurantes): Ventas y detalle de orden dinámicos con prefijo ORD`

---

### Tarea 8: Retail — rutas y menú

**Archivos:** modificar `src/app/App.tsx` y `src/app/components/BoldNavBar.tsx`.

- [ ] **Paso 1: `App.tsx`.** Agregar debajo de `ventas/:id`, sin tocar las rutas existentes:
```tsx
{ path: 'comprobantes',        element: <VerticalRoute module="comprobantes"><DocumentosVentaListPage tipo="comprobante" /></VerticalRoute> },
{ path: 'comprobantes/:id',    element: <VerticalRoute module="comprobantes"><DocumentoVentaDetallePage tipo="comprobante" /></VerticalRoute> },
{ path: 'facturas-venta',      element: <VerticalRoute module="facturas-venta"><DocumentosVentaListPage tipo="factura" /></VerticalRoute> },
{ path: 'facturas-venta/:id',  element: <VerticalRoute module="facturas-venta"><DocumentoVentaDetallePage tipo="factura" /></VerticalRoute> },
```
  En este paso se crean las dos páginas como stub (`return null`) para que el build compile. Se implementan en las Tareas 9 y 10.
- [ ] **Paso 2: `BoldNavBar.tsx`.**
  - `OWNED_ROUTES = ['/ventas', '/items', '/comprobantes', '/facturas-venta']`.
  - En los sub-ítems de Ingresos, después de `recibos`:
```tsx
{ id: 'comprobantes',  label: 'Comprobantes',      icon: <IcComprobantes size={16} />, active: pathname.startsWith('/comprobantes'),   onClick: () => navigate('/comprobantes') },
{ id: 'facturasventa', moduleId: 'facturas-venta', label: 'Facturas de Venta', icon: <IcFacturas size={16} />, active: pathname.startsWith('/facturas-venta'), onClick: () => navigate('/facturas-venta') },
```
  - Cotizaciones, solo visual, después de `facturasventa` (usa `IcCotizaciones`, ya importable de `BoldPosIcons`; el filtro del menú la oculta en Restaurantes porque `cotizaciones` es exclusivo de Retail):
```tsx
{ id: 'cotizaciones', label: 'Cotizaciones', icon: <IcCotizaciones size={16} />, active: false, onClick: () => toast.info('Cotizaciones') },
```
  - Ventas cambia a `active: pathname.startsWith('/ventas')`.
  - En `isSectionActive`, la sección `ingresos` queda en `item.subItems?.some(sub => sub.active)`, porque los sub-ítems ya cubren las tres rutas.
- [ ] **Paso 3: Verificar.**
  - En Restaurantes, el menú de Ingresos es idéntico al de antes (Ventas, Recibos, Notas crédito, Notas débito).
  - En Retail, el menú es Recibos, Comprobantes, Facturas de Venta, Cotizaciones, Notas crédito y Notas débito; Cotizaciones solo muestra el toast "Cotizaciones".
  - En Restaurantes no aparece Cotizaciones.
  - En Retail, `/ventas` redirige a `/comprobantes`.
  - En Restaurantes, `/comprobantes` redirige a `/inicio`.
- [ ] **Paso 4: Commit** `feat(retail): menú Ingresos con Comprobantes, Facturas de Venta y Cotizaciones (visual)`

---

### Tarea 9: Retail — listados de Comprobantes y Facturas de Venta

**Archivos:** crear `src/app/verticals/retail/ingresos/documentosVenta.ts`; implementar `DocumentosVentaListPage.tsx`.

- [ ] **Paso 1: Configuración `documentosVenta.ts`.**
```ts
import type { TipoDocVenta } from '../../../types/venta';

export const DOC_CONFIG: Record<TipoDocVenta, { titulo: string; singular: string; base: string }> = {
  comprobante: { titulo: 'Comprobantes',      singular: 'Comprobante',      base: '/comprobantes'   },
  factura:     { titulo: 'Facturas de Venta', singular: 'Factura de Venta', base: '/facturas-venta' },
};
```
- [ ] **Paso 2: `DocumentosVentaListPage({ tipo })`.** Misma estructura visual que `VentasPage`: encabezado con flecha atrás, filtros con `ventasStyles` y la tabla blanca con `radius 16`.
  - **Encabezado:** título de `DOC_CONFIG` a la izquierda y botón primario "Nueva venta" a la derecha, que lleva a `/` (Mostrador).
  - **Datos:** `ventas.filter(v => v.tipoDoc === tipo)` y luego `filterVentas`.
  - **Filtros (Comprobantes):** Buscar por código · Cliente · Estado de pago (Todos / Pagada / No pagada) · Vendedor · Desde · Hasta · Buscar por notas.
  - **Filtros (Facturas):** los mismos, más Estado DIAN (Todos / Aceptada / Pendiente) y Forma de pago (Todos / Efectivo / Nequi / Tarjeta…, con `opciones()` sobre `pagos`).
  - **Columnas (Comprobantes):** No. · Cliente · Fecha de emisión · Fecha de vencimiento · Estado · Total · Saldo.
  - **Columnas (Facturas):** No. · Cliente · Fecha de emisión · Fecha de vencimiento · Estado DIAN · Forma de pago (`v.formaPago`, "Contado") · Estado · Total · Saldo.
  - Total y Saldo se alinean a la derecha. El saldo mayor a 0 va en `--feedback-warning-200`.
  - Arriba de la tabla: "Mostrando N de M". Sin resultados: "No hay {titulo} con estos filtros".
  - El clic en una fila navega a `${base}/${v.id}`.
- [ ] **Paso 3: Verificar (Retail).**
  - Ambos listados muestran los sembrados, del más reciente al más antiguo.
  - Una venta nueva cobrada como comprobante aparece primero en Comprobantes y no en Facturas, y al revés.
  - Los filtros funcionan, incluido el rango de fechas.
  - El `3755` aparece "No pagada" con saldo de $3,000.
- [ ] **Paso 4: Commit** `feat(retail): listados de Comprobantes y Facturas de Venta`

---

### Tarea 10: Retail — detalle de Comprobante y Factura

**Archivos:** implementar `src/app/verticals/retail/ingresos/DocumentoVentaDetallePage.tsx`.

- [ ] **Paso 1: Datos.** `const v = getVenta(id)`. Si no existe o `v.tipoDoc !== tipo`, se muestra "Documento no encontrado" con un botón Volver a `base`.
- [ ] **Paso 2: Encabezado.**
  - Flecha atrás, "{singular} No. {v.numero}" y badges: Estado; en factura, también Estado DIAN y "Contado".
  - Acciones con botones outline de radio 32: **Imprimir** (`printInvoice(buildInvoiceData(saleFromVenta(v)))`) y **Enviar** (`toast.info`). En factura, además, **Verificar en la DIAN** (`toast.info`).
- [ ] **Paso 3: Tarjeta "Información"** en dos columnas con `InfoRow`:
  - Izquierda: Cliente · Sucursal · Fecha de emisión · Fecha de vencimiento · Método de pago (`metodoPagoLabel`).
  - Derecha: Empresa (`INVOICE_ISSUER.razonSocial`) · Emitido por · Registrada en Turno No. · Vendedor.
  - En factura, una fila completa más: Resolución y **CUFE** (monoespaciado y con `word-break: break-all`).
- [ ] **Paso 4: Tarjeta "Ítems".**
  - Columnas: Cantidad · Ítem (código `itemCode(item.id)` en `--blue-100` + " - " + nombre) · Precio unit. · Descuento ("Ninguno" o `n %`) · [Factura: Impuesto "IVA 19%"] · Total.
  - El desglose del combo va como texto secundario. Al pie: "Total ítems: N" (suma de cantidades).
- [ ] **Paso 5: Notas y Totales lado a lado.**
  - Notas: tarjeta con `v.note`, o "Sin notas" en `--black-60`.
  - Totales del comprobante: Subtotal (`total + discount`) · Descuento · Total.
  - Totales de la factura: Subtotal · Descuento · IVA 19% · Total.
- [ ] **Paso 6: Tarjeta "Recibos".**
  - Columnas: Código (`v.recibo`) · Estado (badge del estado de la venta) · Total (lo pagado = `total - saldo`) · [Factura: Saldo a favor (`cambio`, o $0)] · Método de pago · Fecha (`fmtFechaHora(emitidaEn)`).
  - Sin pagos: "Sin recibos registrados".
- [ ] **Paso 7: Verificar (Retail).**
  - El detalle del comprobante recién cobrado coincide con lo cobrado: ítems, totales, método y recibo.
  - En la factura aparecen CUFE, impuesto e IVA.
  - Imprimir genera el ticket correcto según el tipo.
- [ ] **Paso 8: Commit** `feat(retail): detalle de Comprobante y Factura de Venta`

---

### Tarea 11: Limpieza

- [ ] **Paso 1:** borrar `src/app/data/retail/ventasMocks.ts` y, en `types/venta.ts`, los tipos viejos (`VentaRow`, `Pedido`, `PedidoProducto`, `PagoMixtoItem`, `PagoDivididoPersona`, `EstadoVariant`, `DianVariant`).
- [ ] **Paso 2:** `grep -rn "ventasMocks\|VentaRow\|PedidoProducto\|RETAIL_PEDIDO" src/` debe devolver vacío.
- [ ] **Paso 3:** `npx tsc --noEmit -p . 2>&1 | grep -c "error TS"` debe dar **≤ 55** (sin errores nuevos) y `rm -rf dist && npm run build` debe terminar en OK.
- [ ] **Paso 4: Commit** `chore(ventas): eliminar mocks estáticos de ventas`

---

### Tarea 12: Verificación final end-to-end

- [ ] **Restaurantes:**
  1. En Mostrador, cobrar la orden activa: la venta aparece primera en `/ventas` con su `ORD`, que coincide con el número de la pestaña o comanda.
  2. En Mesas, enviar comanda a una mesa y cobrarla: el siguiente `ORD`, con zona y mesa correctas.
  3. Recargar: las ventas persisten.
  4. El menú de Ingresos y el Dashboard están intactos.
- [ ] **Retail:**
  1. Cobrar en Mostrador como Comprobante y como Factura.
  2. Cada venta aparece primera en su listado y su detalle es correcto.
  3. El menú muestra Comprobantes y Facturas de Venta.
  4. `/ventas` redirige.
- [ ] **Cambio de vertical:** con el selector de Inicio, cada vertical conserva sus propias ventas.
- [ ] **Capturas** de `/ventas` (Restaurantes), `/comprobantes`, `/facturas-venta` y los dos detalles (Retail).
- [ ] **Specs:** los dos pasan a `✅ Implementado` en su encabezado y en el README (un solo commit).
- [ ] **PR:** según el CLAUDE.md, primero a `develop` (`gh pr create --base develop`) y, una vez validado, otro a `main`.

---

## Riesgos y cómo se mitigan

| Riesgo | Mitigación |
|---|---|
| Los efectos secundarios (consecutivos) dentro de render o de updaters se duplican con StrictMode. | `nextOrderNumber`, `nextInvoiceNumber`, `nextComprobanteNumber` y el cálculo del recibo se llaman solo en handlers, nunca dentro de `setState(prev => …)`. |
| Mostrador de Restaurantes cambia la numeración visible de sus pestañas. | Se acepta por la forma A. Se revisa en la Tarea 4, paso 5. |
| `MesasView.tsx` (3,000 líneas) y `HomePage.tsx` son delicados. | Cambios puntuales en las líneas indicadas; sin refactors. Se verifica en el navegador en cada tarea. |
| Datos viejos en `localStorage` de otros navegadores. | Las claves nuevas (`:v1`) no chocan con nada existente. |
| `Dashboard.tsx` (Restaurantes) no se toca. | Ninguna tarea lo modifica. |
