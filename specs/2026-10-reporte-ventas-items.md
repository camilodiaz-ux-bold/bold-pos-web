# SPEC — Reporte "Ventas por ítems" (con Combos)
### Bold POS — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.1 |
| **Fecha** | Octubre 2026 |
| **Vertical** | Core (Retail y Restaurantes) |
| **Autor** | Producto — Bryan Nazar |
| **Antecedentes** | [`2026-09-combos.md`](./2026-09-combos.md) (motor de combos) · [`2026-09-combos-categoria-venta.md`](./2026-09-combos-categoria-venta.md) (la categoría del combo es libre) · [`2026-10-ventas-dinamicas.md`](./2026-10-ventas-dinamicas.md) (las ventas cobradas se registran en `ventasStore`) |
| **Base visual** | Reporte real de Bold POS `pos.stg.bold.co/#/retail/reports/sales-by-item`, cuenta con Facturación Electrónica (7-oct-2026) |

> **Cierre:** este documento queda congelado en la v1.1. No se vuelve a editar. Al terminar la implementación, su estado pasa a `✅ Implementado`. Cualquier cambio de alcance posterior se escribe como un spec nuevo en `specs/` que referencia a este como antecedente.

> **Nota para quien implemente (Claude Code):** leer `CLAUDE.md` y los tres specs antecedentes antes de empezar. Este spec no repite sus reglas (Merlin, `useVertical()`/`has()`, `useCatalog()`, flujo de Git `develop` → `main`). Confirmar cada archivo con `grep` antes de editarlo: los nombres y líneas citados aquí se tomaron del repo en el commit `751b781`.

---

## 1. Resumen

Hoy "Ventas por ítems" aparece en Reportes → "Reportes de ventas", pero al hacer clic solo muestra un `toast.info`. Este spec lo construye desde cero como réplica del reporte real de Bold POS, con datos reales del prototipo: lee las ventas cobradas de `ventasStore` y muestra, por cada producto, **cuántas unidades se vendieron, su subtotal y su total**.

Los combos aparecen como **una línea propia**, igual que cualquier ítem, sin desglose de componentes (modelo de Fudo). La única diferencia frente al reporte real es una columna nueva, **Tipo**, que indica si la fila es un **Ítem** o un **Combo**, y su filtro correspondiente.

La pregunta que responde el reporte es: *¿qué vendí, cuántas unidades y por cuánto?*

---

## 2. Decisiones de producto

| # | Decisión |
|---|---|
| D1 | Un combo vendido es **una fila propia** del reporte, con su cantidad, subtotal y total. No se desglosa en sus componentes ni se reparte su precio entre ellos (modelo Fudo). |
| D2 | Las unidades de un producto que salieron **dentro de un combo no suman** en la fila de ese producto. La fila "Ceviche" solo cuenta los ceviches vendidos sueltos. |
| D3 | Columna nueva **Tipo**: `Ítem` o `Combo`. Es la forma de distinguir los combos, porque su categoría es libre y un combo puede quedar dentro de "Carnes" o "Sushi". |
| D4 | Filtro nuevo **Tipo**: Todos / Ítems / Combos. Con Tipo = Combos, las tarjetas Subtotal y Total muestran directamente cuánto se vendió en combos. |
| D5 | El reporte es **Core**: funciona igual en Retail y Restaurantes, con los datos de cada vertical. |
| D6 | **Réplica del reporte real:** mismo título, misma grilla de filtros, mismos botones, mismas tarjetas (Subtotal y Total) y mismas columnas (Subtotal y Total), más Tipo. |
| D7 | **Botones solo visuales:** Generar, Imprimir y Exportar se muestran igual que en el real, pero en el prototipo no tienen funcionalidad (toast "Próximamente"). Los filtros se aplican en vivo. |
| D8 | **Tolerancia de redondeo aceptada:** la suma de la columna Total puede diferir en $1–$2 por venta del total cobrado (ver §5.4). |

### Decisiones propias del spec (a validar en la revisión)

- **P1 · Qué ventas cuentan.** Se incluyen comprobantes y facturas (de ahí el título "Comprobantes + Facturas de Venta") con estado `pagada` o `no-pagada` (en Retail, una venta a crédito ya es una venta emitida). Se excluyen `abierta` (aún no se cobra) y `cancelada`.
- **P2 · Combos sembrados.** Se agregan dos ventas sembradas con combos en Restaurantes, para que el reporte muestre combos desde el primer render (§8.3).

---

## 3. Alcance

### 3.1 P0 — necesario para cerrar

| # | Funcionalidad |
|---|---|
| 1 | Pantalla del reporte, accesible desde Reportes → "Ventas por ítems", en ambas verticales. |
| 2 | Tabla agregada por producto: Código, Producto, **Tipo**, Variante (solo Retail), Categoría, Cantidad vendida, Subtotal, Total. |
| 3 | Combos como fila propia, con el badge "Combo" en la columna Tipo (D1, D3). |
| 4 | Tarjetas de resumen: Subtotal y Total. |
| 5 | Grilla completa de filtros del reporte real más el filtro Tipo. Funcionales: Fecha, Vendedor, Cliente, Categoría, Nombre del ítem y Tipo. Solo visuales: Sucursales, Usuario, Lista de precios y Variante (§6.2). |
| 6 | Botones Generar, Imprimir y Exportar, solo visuales (D7). |
| 7 | Orden por defecto por Subtotal descendente; ordenamiento por encabezado; selector "Mostrar 10 / 25 / 50 registros" y paginación. |
| 8 | `SaleItem` guarda explícitamente `productId` e `isCombo`, para agrupar sin depender del nombre (§8.1). |

### 3.2 P1 — si hay tiempo

| # | Funcionalidad |
|---|---|
| 9 | Ventas sembradas con combos en Restaurantes (P2, §8.3). |

### 3.3 Fuera de alcance

| Excluido | Por qué |
|---|---|
| Desglose de componentes de un combo dentro del reporte (fila expandible, columna "unidades en combos") | Decisión D1. Se reevalúa si los usuarios lo piden (§13). |
| Funcionalidad de Generar, Imprimir y Exportar | D7. Por ahora solo visuales. |
| Datos reales en la columna Variante | Las ventas del prototipo no guardan la variante vendida. La columna se muestra en Retail con "-". |
| Funcionalidad de los filtros Sucursales, Usuario, Lista de precios y Variante | El prototipo tiene una sola sucursal, una sesión fija y no registra listas de precios ni variantes en la venta. |
| Propina dentro del Total | La propina no pertenece a ningún ítem; el reporte real (Retail) tampoco la incluye. |
| Costo, utilidad y margen por ítem | Es el reporte "Ganancias por ítems", que sigue como placeholder. |

---

## 4. Ubicación y navegación

- **Entrada:** `ReportesPanel.tsx`, categoría "Reportes de ventas", ítem `id: 'ventas-items'` ("Ventas por ítems"). Hoy cae en `toast.info(item.label)`.
- **Ruta:** se reutiliza la ruta existente `/reportes/restaurantes/:id` con `id = 'ventas-items'`. Es la misma convención que ya usan los reportes core "Ventas (Legacy)" y "Ventas *Async" (ver comentario en `ReporteDetallePage.tsx`). **No se crea ni modifica ninguna ruta del router.**
- **Guard:** `ventas-items` no se agrega a `RESTAURANT_ONLY_REPORTS`, así que el reporte funciona también en Retail.

Cambios concretos:

```tsx
// ReportesPanel.tsx — CategoryCard, en la cadena de onClick:
: item.id === 'ventas-items'
  ? () => navigate('/reportes/restaurantes/ventas-items')

// ReporteDetallePage.tsx — junto al early return de rest-ventas-async:
if (id === 'ventas-items') return <VentasItemsReport />;
```

---

## 5. Fuente de datos y reglas de cálculo

### 5.1 Origen

`useVentas().ventas` (`store/ventasStore.tsx`). Cada `Venta` trae `items: SaleItem[]`, `emitidaEn`, `vendedor`, `cliente`, `taxRate` y `estado`. El store ya está separado por vertical.

Para resolver código, categoría y tipo de cada línea se usan:

- `useCatalog()` → `allProducts` y `catDefs` (productos y categorías de la vertical activa).
- `useItems()` → `items` (para el código del ítem y para los combos: `comboSaleId`, `codigo`, `categoriaId`, `esCombo`).

### 5.2 Ventas incluidas

1. `tipoDoc` ∈ { `comprobante`, `factura` } y `estado` ∈ { `pagada`, `no-pagada` } (P1).
2. `emitidaEn` dentro del rango de fechas del filtro (inclusive, día completo en hora local).
3. Si hay filtro de Vendedor: `venta.vendedor === filtro`.
4. Si hay filtro de Cliente: `venta.cliente === filtro`.

### 5.3 Identidad de una línea (clave de agrupación)

Por cada `SaleItem` de las ventas incluidas se calcula una clave:

| Caso | Clave |
|---|---|
| La línea trae `productId` (ventas nuevas, §8.1) | `String(productId)` |
| La línea no trae `productId` pero `id` es numérico (ventas sembradas: `id = String(productId)`) | `id` |
| Ninguno de los anteriores (ej. línea libre de Retail "Ajuste de prenda", `id: '0'`) | `name:${name}` |

Los combos usan su `comboSaleId` (≥ 9000) como `productId`, así que nunca colisionan con productos del catálogo (Restaurantes 101–184, Retail 201+).

### 5.4 Fila agregada

Por cada clave:

| Campo | Regla |
|---|---|
| Cantidad vendida | Σ `quantity` |
| Subtotal | Σ subtotal de línea, con subtotal de línea = `round(price × (1 − (discount ?? 0) / 100)) × quantity`. Es la misma fórmula del `subtotal` del checkout (`CheckoutDrawer.tsx`) y de las ventas sembradas. |
| Total | Σ `round(subtotalLínea × (1 + venta.taxRate))`. Subtotal más IVA, **sin propina**. |
| Tipo | `Combo` si alguna línea tiene `isCombo`, o `comboComponents` no vacío, o su `productId` coincide con el `comboSaleId` de un Item. Si no, `Ítem`. |
| Producto | Nombre actual: del Item combo (`nombre`) o del producto del catálogo (`name`). Si ya no existe, el nombre de la **línea vendida más reciente**. |
| Código | Combo: `Item.codigo` del combo. Ítem: `codigo` del Item sembrado desde ese producto (`id === 'seed-' + productId` en Restaurantes, o `catalogProductId === productId` en Retail). Si no se encuentra: `-`. |
| Variante (solo Retail) | `-` (fuera de alcance, §3.3). |
| Categoría | Combo: nombre de la categoría de `Item.categoriaId` (libre, ver antecedente). Ítem: nombre de la categoría del producto (`catId`) en `catDefs`. Si no se resuelve: `-`. |

Las unidades dentro de un combo **no** se suman a la fila del producto componente (D2). El reporte ignora `comboComponents` para todo lo que no sea detectar el tipo.

**Tolerancia de redondeo (D8).** El checkout calcula el IVA sobre el subtotal completo de la venta (`round(subtotal × taxRate)`), mientras que el reporte lo calcula línea por línea. Por eso la suma de la columna Total puede diferir del `subtotal + tax` de las ventas en $1–$2 por venta. Se acepta para el prototipo. La suma de la columna Subtotal sí cuadra exacta, porque el checkout hoy no aplica descuentos a toda la orden (`discount = 0`).

### 5.5 Tarjetas de resumen

Se calculan sobre las filas **después** de aplicar todos los filtros:

| Tarjeta | Valor |
|---|---|
| Subtotal | Σ Subtotal de las filas. |
| Total | Σ Total de las filas. |

---

## 6. Pantalla

Réplica del reporte real (base visual del encabezado de este spec). Para estilos de inputs, selects, badges y tabla, reutilizar lo que ya existe en `ReporteDetallePage.tsx` (`FilterDropdown`, `StatusBadge`, estilos de tabla del reporte Legacy). Todo con variables de Merlin.

### 6.1 Encabezado

- Flecha **Volver** → `/reportes` (igual que los demás reportes del prototipo).
- Título: **"Reporte de Ventas por Ítems"** seguido, en tamaño menor y color `--blue-100`, de **"(Comprobantes + Facturas de Venta)"**.

### 6.2 Filtros

Grilla de 4 columnas, en el mismo orden que el reporte real, más el filtro Tipo en la última fila:

| Fila | Columna 1 | Columna 2 | Columna 3 | Columna 4 |
|---|---|---|---|---|
| 1 | Rango de fechas | Todas las sucursales | Selecciona vendedor… | Todos los clientes |
| 2 | Todas las categorías | Filtrar por nombre del ítem | Selecciona usuario… | Buscar por lista de precios |
| 3 | Buscar por variante | **Tipo: Todos / Ítems / Combos** | | |

| Filtro | Comportamiento | Default |
|---|---|---|
| Rango de fechas | Funcional. Muestra `AAAA-MM-DD - AAAA-MM-DD` con ícono de calendario, como el real. Puede implementarse con dos inputs `type="date"`. | Primer día del mes actual → hoy |
| Todas las sucursales | **Visual.** Una sola opción: la sucursal de la sesión (`SESION_VENTAS[vertical].sucursal`). | Todas |
| Selecciona vendedor… | Funcional. Opciones: valores de `venta.vendedor` en el rango. | Todos |
| Todos los clientes | Funcional. Opciones: valores de `venta.cliente` en el rango. | Todos |
| Todas las categorías | Funcional. Opciones: categorías presentes en las filas del rango. | Todas |
| Filtrar por nombre del ítem | Funcional. Texto libre; filtra por nombre o código, sin distinguir mayúsculas ni tildes. | vacío |
| Selecciona usuario… | **Visual.** Una sola opción: `SESION_VENTAS[vertical].emitidoPor`. | vacío |
| Buscar por lista de precios | **Visual.** Sin opciones reales (placeholder). | vacío |
| Buscar por variante | **Visual.** Sin opciones reales (placeholder). | vacío |
| Tipo | Funcional (D4). | Todos |

Los filtros **visuales** se ven y abren igual que los funcionales, pero no cambian los resultados. Los funcionales se aplican **en vivo** (D7). Fecha, Vendedor y Cliente filtran las ventas antes de agregar; Categoría, Nombre y Tipo filtran las filas agregadas.

### 6.3 Botones (solo visuales, D7)

Fila centrada debajo de los filtros, con el mismo estilo del real: **GENERAR** y **IMPRIMIR** como botones pill navy (`--blue-100`), **EXPORTAR** como botón pill coral (`--coral-100`) con ícono de Excel. Los tres muestran `toast.info('Próximamente')` al hacer clic.

### 6.4 Tarjetas

Dos tarjetas centradas debajo de los botones, como en el real: **Subtotal** y **Total**, con el valor en negrita (§5.5).

### 6.5 Tabla

Encima de la tabla, dentro de la misma tarjeta blanca:

- "Última actualización del reporte a las: {fecha y hora}", con la hora del último cambio de filtros (o de la carga de la pantalla).
- Selector "Mostrar [10 | 25 | 50] registros" (default 25).

| Columna | Contenido | Ordenable |
|---|---|---|
| Código | Código del ítem o `-` | Sí |
| Producto | Nombre | No |
| **Tipo** | `Ítem` como texto normal. `Combo` como badge pill (fondo `--coral-10`, texto `--coral-100`, el mismo estilo del badge "Combo" de `ItemsTable.tsx`) | No |
| Variante | Solo si `has('variantes')` (Retail). Siempre `-` | No |
| Categoría | Nombre de la categoría o `-` | No |
| Cantidad Vendida | Número entero simple, ej. `4` | Sí |
| Subtotal | `$ 486,000` (formato del real: `$`, espacio, coma de miles; decimales solo si el valor no es entero) | Sí |
| Total | Mismo formato que Subtotal | Sí |

- **Orden por defecto:** Subtotal, de mayor a menor. Clic en un encabezado ordenable alterna ascendente/descendente, con el indicador de flechas del real.
- Paginación al pie de la tabla.

### 6.6 Estados

| Estado | Qué se muestra |
|---|---|
| No hay ventas en el rango | "No hay ventas en este rango de fechas". Tarjetas en `$ 0`. |
| Hay ventas pero los filtros no dejan filas | "No hay ítems con estos filtros". Tarjetas en `$ 0`. |

---

## 7. Exportar

Fuera de alcance por ahora (D7): el botón EXPORTAR es solo visual. Cuando se active, el patrón a seguir es `utils/generateVentasAsyncXlsx.ts` (librería `xlsx`, ya instalada), exportando todas las filas filtradas con las mismas columnas de la tabla, incluida Tipo.

---

## 8. Cambios de modelo y datos

### 8.1 `SaleItem` guarda `productId` e `isCombo` (`utils/invoice.ts`)

Hoy `SaleItem` no declara `productId`. En la práctica, las ventas nuevas sí lo guardan, porque `CheckoutDrawer` pasa las líneas de Mesas (`TableItem`) y Mostrador (`OrderItem`) tal cual y `ventasStore` las serializa completas. Pero eso es accidental y no está tipado. Se formaliza:

```ts
export interface SaleItem {
  id: string;
  /** Id del producto vendido: catálogo (101–184 / 201+) o comboSaleId (≥ 9000). Ausente en ventas sembradas antiguas y líneas libres. */
  productId?: number;
  /** true si la línea es un combo. */
  isCombo?: boolean;
  // ...campos existentes sin cambios
}
```

- Agregar los mismos dos campos opcionales a `CheckoutItem` (`CheckoutDrawer.tsx`).
- En `ventaFromSale` (`utils/ventas.ts`), mapear las líneas explícitamente para conservar `productId` e `isCombo`, en vez de depender de que los objetos traigan campos extra.
- Las ventas ya guardadas en `localStorage` sin `productId` siguen funcionando por la regla de fallback de §5.3.

### 8.2 Helper de agregación (archivo nuevo)

`utils/ventasPorItems.ts`, una función pura y sin hooks, para que sea fácil de probar:

```ts
export interface VentasItemsFila {
  key: string;
  codigo: string;          // '-' si no se resuelve
  producto: string;
  tipo: 'Ítem' | 'Combo';
  categoria: string;       // '-' si no se resuelve
  cantidad: number;
  subtotal: number;
  total: number;           // subtotal + IVA, sin propina
}

export function agregarVentasPorItems(
  ventas: Venta[],
  ctx: { allProducts: CatalogProduct[]; catDefs: CatDef[]; items: Item[] },
): VentasItemsFila[];
```

El componente aplica primero los filtros de ventas (fecha, vendedor, cliente), llama a `agregarVentasPorItems`, y luego aplica los filtros de filas (categoría, nombre, tipo), el orden y la paginación.

### 8.3 Ventas sembradas con combos (P1, Restaurantes)

En `data/ventasSeed.ts`, agregar dos ventas pagadas el 6-oct-2026 que incluyan combos sembrados (`SEED_COMBOS` de `itemsSeed.ts`, exportarlo si hace falta):

| Venta | Líneas |
|---|---|
| `ORD0011` | 1 × Combo Ejecutivo Mediodía (9001, $250.000) + 1 × Ceviche de Corvina Real (103) suelto |
| `ORD0012` | 2 × Combo Sushi para Compartir (9002, $190.000) |

Cada línea de combo lleva `productId`, `isCombo: true` y `comboComponents` resueltos, con la misma forma que produce el checkout.

**Efectos colaterales a resolver en el mismo PR:**

- El consecutivo de comanda arranca hoy en 11 (`2026-10-ventas-dinamicas.md` §5). Con dos ventas sembradas más, debe arrancar en **13**.
- Hay que **bumpear la clave** de `localStorage` de ventas de Restaurantes (`bold-pos:ventas:restaurantes:v2` → `v3`, en `verticalCatalog.ts`) para que la semilla nueva se cargue. Esto borra las ventas de prueba que cada persona haya registrado en su navegador (ver §14).
- Revisar el consecutivo `SETT` si alguna de las dos ventas es factura.

Como el spec de Ventas dinámicas está congelado (`✅ Implementado`), este cambio de semilla queda documentado aquí, no allá.

---

## 9. Archivos

| Archivo | Cambio |
|---|---|
| `components/reportes/VentasItemsReport.tsx` | **Nuevo.** La pantalla completa (§6). |
| `utils/ventasPorItems.ts` | **Nuevo.** Agregación pura (§8.2). |
| `components/ReportesPanel.tsx` | Navegación del ítem `ventas-items` (§4). |
| `pages/ReporteDetallePage.tsx` | Early return a `VentasItemsReport` (§4). |
| `utils/invoice.ts` | `SaleItem.productId?`, `SaleItem.isCombo?` (§8.1). |
| `components/CheckoutDrawer.tsx` | `CheckoutItem.productId?`, `CheckoutItem.isCombo?` (§8.1). |
| `utils/ventas.ts` | `ventaFromSale` conserva `productId` e `isCombo` (§8.1). |
| `data/ventasSeed.ts`, `data/itemsSeed.ts`, `data/verticalCatalog.ts`, `utils/orderNumber.ts` | Solo si se hace P1 (§8.3). Confirmar con `grep` dónde vive el inicio del consecutivo. |
| `specs/README.md` | Agregar la fila de este spec al índice. |

---

## 10. Casos borde

| Caso | Comportamiento esperado |
|---|---|
| Se vende un combo y el mismo producto suelto en la misma venta | Dos filas: el combo (Tipo Combo) y el producto (Tipo Ítem). El producto suelto no suma las unidades que van dentro del combo (D2). |
| El combo se editó después de venderlo (otro precio o nombre) | Subtotal y Total suman lo que realmente se cobró en cada venta. El nombre que se muestra es el actual del Item. |
| El combo se desactivó o se eliminó en `/items` | Sigue apareciendo con sus ventas del rango. Si el Item ya no existe: nombre de la última línea vendida, Código `-`, Categoría `-`, Tipo `Combo` (detectado por `isCombo`/`comboComponents`). |
| Un producto se vendió con distintos descuentos de línea | Una sola fila; Subtotal y Total suman cada línea con su propio descuento. |
| Venta abierta o cancelada | No se cuenta (P1). |
| Línea libre sin producto del catálogo (Retail: "Ajuste de prenda") | Fila propia agrupada por nombre, Tipo `Ítem`, Código `-`. |
| Venta sembrada sin `productId` | Se agrupa por `id` numérico (§5.3), sin diferencia visible. |
| Filtro Tipo = Combos y no hay combos en el rango | "No hay ítems con estos filtros". |
| Se cambia un filtro visual (sucursal, usuario, lista de precios, variante) | No cambia ningún resultado. |
| Clic en Generar, Imprimir o Exportar | Toast "Próximamente"; no cambia nada. |
| Cambio de vertical con el selector de Inicio | El reporte muestra solo las ventas y el catálogo de la vertical activa. La columna Variante aparece solo en Retail. |

---

## 11. Criterios de aceptación

- [ ] Reportes → "Ventas por ítems" abre el reporte en Restaurantes **y** en Retail (ya no muestra un toast).
- [ ] El título dice "Reporte de Ventas por Ítems (Comprobantes + Facturas de Venta)".
- [ ] La grilla de filtros replica la del reporte real, más el filtro Tipo; los filtros funcionales cambian los resultados en vivo y los visuales no.
- [ ] Generar, Imprimir y Exportar se ven como en el real y solo muestran un toast.
- [ ] Las tarjetas Subtotal y Total se recalculan al cambiar cualquier filtro funcional.
- [ ] La tabla muestra Código, Producto, Tipo, Variante (solo Retail), Categoría, Cantidad Vendida, Subtotal y Total, ordenada por Subtotal descendente.
- [ ] Un combo vendido aparece como **una sola fila** con Tipo **Combo** (badge coral), su cantidad, subtotal y total.
- [ ] Las unidades de un producto vendidas dentro de un combo **no** aparecen en la fila de ese producto.
- [ ] El filtro Tipo = Combos deja solo combos y las tarjetas muestran lo vendido en combos; Tipo = Ítems deja solo ítems.
- [ ] Sin filtros de categoría/nombre/tipo, la tarjeta Subtotal es igual a la suma de los `subtotal` de las ventas incluidas. La tarjeta Total puede diferir de la suma de `subtotal + tax` en $1–$2 por venta (D8).
- [ ] La Cantidad Vendida se muestra como número simple, sin "(Unidades)".
- [ ] Una venta nueva cobrada en Mesas o Mostrador aparece en el reporte sin recargar la página.
- [ ] No se rompe ningún flujo existente: checkout, factura impresa, listado y detalle de Ventas, reportes Legacy y Async.

### Escenario de prueba manual

1. En Restaurantes, cobrar en Mostrador: 1 × Combo Ejecutivo Mediodía + 1 × Ceviche de Corvina Real.
2. Abrir Reportes → Ventas por ítems con el rango por defecto.
3. Esperado: fila "Combo Ejecutivo Mediodía" · Tipo Combo · 1 · Subtotal $ 250,000 · Total $ 297,500; fila "Ceviche de Corvina Real" · Tipo Ítem · 1 · Subtotal $ 96,000 · Total $ 114,240 (cantidad 1, no 2).
4. Filtrar Tipo = Combos: queda solo la fila del combo y las tarjetas muestran Subtotal $ 250,000 y Total $ 297,500.

---

## 12. Plan de implementación

Una sola branch `bn-feature/reporte-ventas-items`, PR a `develop` y luego a `main`, según `CLAUDE.md`. Orden sugerido de commits:

1. Modelo: `SaleItem`/`CheckoutItem` y `ventaFromSale` (§8.1).
2. Agregación pura `ventasPorItems.ts` (§8.2).
3. Pantalla `VentasItemsReport.tsx` y navegación (§4, §6).
4. P1: ventas sembradas con combos y ajustes de consecutivo y clave (§8.3).

---

## 13. Backlog futuro

- **Funcionalidad de Generar, Imprimir y Exportar** (D7). Exportar seguiría el patrón de `generateVentasAsyncXlsx.ts` con datos reales.
- **Desglose de combos (v2):** si los usuarios piden ver cuántas unidades de un producto salieron dentro de combos, evaluar el modelo Square/Toast (componentes a precio de lista + línea "Descuento por combos") o una vista separada "Combos". La señal para reabrirlo son solicitudes o tickets de soporte pidiéndolo.
- **Columna Variante con datos reales** en Retail, cuando el checkout registre la variante vendida.
- **Filtros de Sucursales, Usuario, Lista de precios y Variante funcionales**, cuando el prototipo tenga esos datos.
- **IVA por ítem:** hoy el prototipo usa una sola tasa por venta. Cuando cada ítem tenga su propio impuesto (como en el reporte real, donde hay ítems con Subtotal = Total), el Total de la fila debe usar la tasa del ítem.
- **Ganancias por ítems:** mismo agregado, sumando costo y margen.

---

## 14. Preguntas abiertas

1. **Bumpear la clave de ventas (§8.3).** Cargar las ventas sembradas con combos borra las ventas de prueba guardadas en cada navegador. Si eso es un problema para demos en curso, se puede dejar P1 fuera y demostrar el reporte vendiendo un combo en vivo.

---

## 15. Referencias

- Reporte real de Bold POS (base visual): `pos.stg.bold.co/#/retail/reports/sales-by-item`, cuenta con Facturación Electrónica, 7-oct-2026. Título "Reporte de Ventas por Ítems (Comprobantes + Facturas de Venta)"; 10 filtros en grilla de 4 columnas; botones Generar, Imprimir y Exportar; tarjetas Subtotal y Total; columnas Código, Producto, Variante, Categoría, Cantidad Vendida, Subtotal y Total; orden por Subtotal descendente; "Mostrar 25 registros".
- Benchmark: Fudo, reporte "Productos" — el combo aparece como una línea propia, sin desglose.
- Archivos leídos para este spec (commit `751b781`): `components/ReportesPanel.tsx`, `pages/ReporteDetallePage.tsx`, `components/reportes/VentasAsyncReport.tsx`, `utils/generateVentasAsyncXlsx.ts`, `store/ventasStore.tsx`, `types/venta.ts`, `utils/ventas.ts`, `utils/invoice.ts`, `utils/comboBridge.ts`, `components/CheckoutDrawer.tsx`, `components/MesaProductSelector.tsx`, `components/MesasView.tsx`, `pages/HomePage.tsx`, `types/item.ts`, `data/itemsSeed.ts`, `data/ventasSeed.ts`, `data/retail/ventasSeed.ts`, `data/verticalCatalog.ts`, `vertical/modules.ts`, `components/items/ItemsTable.tsx`, `CLAUDE.md`, `specs/README.md`.
