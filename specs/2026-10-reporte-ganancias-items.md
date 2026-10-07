# SPEC — Reporte "Ganancias por ítems" (con Combos)
### Bold POS — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | Listo para implementación |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Octubre 2026 |
| **Vertical** | Core (Retail y Restaurantes) |
| **Autor** | Producto — Bryan Nazar |
| **Antecedentes** | [`2026-10-reporte-ventas-items.md`](./2026-10-reporte-ventas-items.md) (este reporte reutiliza su lógica y su pantalla) · [`2026-09-combos.md`](./2026-09-combos.md) (motor de combos) · [`2026-09-combos-disponibilidad.md`](./2026-09-combos-disponibilidad.md) · [`2026-10-ventas-dinamicas.md`](./2026-10-ventas-dinamicas.md) (las ventas cobradas se registran en `ventasStore`) |
| **Base visual** | Reporte real de Bold POS `pos.stg.bold.co/#/retail/reports/sales-revenue`, cuenta con Facturación Electrónica (7-oct-2026) |

> **Nota para quien implemente (Claude Code):** leer `CLAUDE.md` y `specs/2026-10-reporte-ventas-items.md` antes de empezar. Este spec **no repite** lo que ya resolvió ese reporte (grilla de filtros, botones visuales, ventas incluidas, clave de agrupación, tipo Ítem/Combo): solo documenta lo que cambia. Confirmar cada archivo con `grep` antes de editarlo: los nombres y líneas citados se tomaron del repo en el commit `fbe3fa3`.

---

## 1. Resumen

Hoy "Ganancias por ítems" aparece en Reportes → "Reportes de ventas", pero al hacer clic solo muestra un `toast.info`. Este spec lo construye como réplica del reporte real de Bold POS, con datos reales del prototipo.

Es **el mismo reporte de Ventas por ítems con tres columnas más**: Total Costos, Total Ganancias y Ganancia %. Las ventas salen de `ventasStore` y el costo sale del campo **Costo** de cada ítem en `/items`.

Los combos aparecen como **una fila propia**, con la columna **Tipo** igual que en Ventas por ítems. **El costo de un combo es el que se digita a mano en el formulario del combo**: no se calcula a partir de los costos de sus componentes.

La pregunta que responde el reporte es: *¿cuánto vendí, cuánto me costó y cuánto gané con cada ítem?*

---

## 2. Decisiones de producto

| # | Decisión |
|---|---|
| D1 | **Misma lógica que Ventas por ítems:** mismas ventas incluidas, misma clave de agrupación, misma detección de Tipo, mismo nombre, código y categoría por fila. No se reescribe: se reutiliza (§8.2). |
| D2 | **El costo de un combo es manual.** Se toma del campo `Item.costo` del combo, que el usuario digita al crearlo o editarlo. No se suma el costo de sus componentes. Un combo con costo `0` se trata como cualquier ítem sin costo (D5). |
| D3 | **Total Ventas = el Subtotal de Ventas por ítems:** valor de las líneas después del descuento de línea, antes de IVA y propina. (Comprobado contra el real: "Camisa chevignon" aparece con Subtotal $230,000 en Ventas por ítems y con Total Ventas $230,000 en Ganancias.) |
| D4 | **Total Costos = costo unitario × cantidad vendida.** El descuento de línea baja Total Ventas pero no el costo. |
| D5 | **Ganancia % = Total Ganancias ÷ Total Costos × 100** (margen sobre costo, no sobre venta). Si Total Costos es `0`, se muestra **100 %**. Es la fórmula del reporte real: se verificó con las filas de la captura (Carne para asar: $28,000 ÷ $32,000 = 87.5 %; Camiseta ggggg: –$164,300 ÷ $200,000 = –82.15 %). |
| D6 | **El costo se lee al generar el reporte, no al vender.** Si el costo de un ítem cambia después de una venta, el reporte usa el costo actual. Limitación aceptada para el prototipo (§13). |
| D7 | **Réplica del reporte real:** mismo título, misma grilla de filtros (sin Cliente ni Variante), tres tarjetas, columnas Nombre, Cantidad, Total Ventas, Total Costos, Total Ganancias y Ganancia %. Se agregan, igual que en Ventas por ítems, la columna y el filtro **Tipo**. |
| D8 | **Botones solo visuales:** GENERAR, IMPRIMIR y EXCEL se muestran como en el real, pero muestran el toast "Próximamente". Los filtros se aplican en vivo. |
| D9 | **Core:** funciona en Retail y Restaurantes, con los datos de cada vertical. |

### Decisión propia del spec (a validar en la revisión)

- **P1 · Combos sembrados con costo.** Hoy los combos sembrados tienen `costo: 0`, así que el reporte los mostraría con 100 % de ganancia. Se les asigna un costo realista (§8.3).

---

## 3. Alcance

### 3.1 P0 — necesario para cerrar

| # | Funcionalidad |
|---|---|
| 1 | Pantalla del reporte, accesible desde Reportes → "Ganancias por ítems", en ambas verticales. |
| 2 | Tabla agregada por producto: Código, Nombre, **Tipo**, Variantes (solo Retail), Categoría, Cantidad, Total Ventas, Total Costos, Total Ganancias, Ganancia %. |
| 3 | Combos como fila propia, con badge "Combo" en Tipo y costo tomado del campo manual del combo (D2). |
| 4 | Tarjetas de resumen: Total Ventas, Total Costos, Total Ganancias. |
| 5 | Filtros de la captura más Tipo. Funcionales: Fecha, Vendedor, Categoría, Nombre del ítem y Tipo. Solo visuales: Sucursal, Usuario y Lista de precios (§6.2). |
| 6 | Botones GENERAR, IMPRIMIR y EXCEL solo visuales (D8). |
| 7 | Ganancia % en verde si es ≥ 0 y en rojo si es negativa. |
| 8 | Orden por defecto por Total Ganancias descendente; ordenamiento por encabezado; selector "Mostrar 10 / 25 / 50 items" y paginación. |

### 3.2 P1 — si hay tiempo

| # | Funcionalidad |
|---|---|
| 9 | Combos sembrados con costo realista en ambas verticales (P1, §8.3). |
| 10 | Extraer a un archivo compartido los componentes de pantalla que este reporte repite de Ventas por ítems (§9). |

### 3.3 Fuera de alcance

| Excluido | Por qué |
|---|---|
| Calcular el costo de un combo a partir de sus componentes | Decisión D2. El costo del combo es manual. Ver sugerencia en §13. |
| Guardar el costo en la venta al momento de cobrar | D6. Implica agregar costo a las líneas de Mesas, Mostrador y checkout; es un cambio mayor, no necesario para el prototipo. |
| Funcionalidad de GENERAR, IMPRIMIR y EXCEL | D8. Por ahora solo visuales. |
| Datos reales en la columna Variantes y costo por variante | Las ventas del prototipo no guardan la variante vendida. La columna se muestra en Retail con "-", y el costo es el del ítem padre. |
| Funcionalidad de los filtros Sucursal, Usuario y Lista de precios | Una sola sucursal, una sesión fija y sin listas de precios en la venta. |
| Filtros de Cliente y Variante | El reporte real de Ganancias no los tiene (sí los tiene Ventas por ítems). |
| Fila "Item no registrado" del real | En el prototipo las líneas libres se agrupan por nombre, como en Ventas por ítems. |
| Propina e IVA | Ganancias se calcula sobre el valor antes de impuestos y propina. |

---

## 4. Ubicación y navegación

- **Entrada:** `ReportesPanel.tsx`, categoría "Reportes de ventas", ítem `id: 'ganancias-items'` ("Ganancias por ítems", línea ~76). Hoy cae en `toast.info(item.label)`.
- **Ruta:** igual que Ventas por ítems, se reutiliza `/reportes/restaurantes/:id` con `id = 'ganancias-items'`. **No se crea ni modifica ninguna ruta del router.**
- **Guard:** `ganancias-items` no va en `RESTAURANT_ONLY_REPORTS` (`ReporteDetallePage.tsx`), así que funciona también en Retail.

Cambios concretos:

```tsx
// ReportesPanel.tsx — en la cadena de onClick, junto a ventas-items:
: item.id === 'ganancias-items'
  ? () => navigate('/reportes/restaurantes/ganancias-items')

// ReporteDetallePage.tsx — junto al early return de ventas-items:
if (id === 'ganancias-items') return <GananciasItemsReport />;
```

Confirmar con `grep` cómo resuelve hoy el `onClick` el caso `isRestaurantes`: ese ítem debe seguir llegando al reporte nuevo en ambas verticales.

---

## 5. Fuente de datos y reglas de cálculo

### 5.1 Origen

Igual que Ventas por ítems: `useVentas().ventas`, `useCatalog()` (`allProducts`, `catDefs`) y `useItems().items`. Los ítems son además la **fuente del costo** (`Item.costo`).

### 5.2 Ventas incluidas, clave de agrupación y subtotal de línea

Sin cambios respecto a `2026-10-reporte-ventas-items.md` §5.2 y §5.3. Se reutilizan las funciones exportadas de `utils/ventasPorItems.ts`: `ventaIncluida`, `lineKey` y `subtotalLinea`. Fecha y Vendedor filtran las ventas antes de agregar; Categoría, Nombre y Tipo filtran las filas ya agregadas.

### 5.3 Costo unitario de una fila

Se resuelve con el mismo criterio con que Ventas por ítems encuentra el código del ítem:

| Caso | Costo unitario |
|---|---|
| La fila es un combo (su `productId` coincide con el `comboSaleId` de un Item) | `Item.costo` de ese combo (D2) |
| La fila es un producto del catálogo (`id === 'seed-' + productId` o `catalogProductId === productId`) | `Item.costo` de ese ítem |
| No se resuelve (línea libre, ítem eliminado) | `0` |

### 5.4 Fila agregada

| Campo | Regla |
|---|---|
| Código, Nombre, Tipo, Categoría | Igual que Ventas por ítems (el Nombre sustituye al "Producto"). |
| Cantidad | Σ `quantity` |
| Total Ventas | Σ `subtotalLinea` (D3) |
| Total Costos | `costoUnitario × Cantidad` (D4) |
| Total Ganancias | `Total Ventas − Total Costos` |
| Ganancia % | `Total Costos > 0 ? Total Ganancias ÷ Total Costos × 100 : 100` (D5). Se muestra con hasta 2 decimales y sin ceros sobrantes: `87.5 %`, `25 %`, `-82.15 %`, `100 %`. |

Las unidades dentro de un combo **no** se suman a la fila del producto componente (misma regla D2 de Ventas por ítems), y por lo mismo **el costo de los componentes no entra en la fila del producto**: el combo carga solo con su propio costo.

### 5.5 Tarjetas de resumen

Se calculan sobre las filas **después** de aplicar todos los filtros:

| Tarjeta | Valor |
|---|---|
| Total Ventas | Σ Total Ventas de las filas |
| Total Costos | Σ Total Costos de las filas |
| Total Ganancias | Σ Total Ganancias de las filas (= Total Ventas − Total Costos) |

---

## 6. Pantalla

Réplica del reporte real. Es la misma pantalla de `components/reportes/VentasItemsReport.tsx` con los cambios que siguen. Todo con variables de Merlin.

### 6.1 Encabezado

- Flecha **Volver** → `/reportes`.
- Título: **"Reporte Ganancias por Ítems"**. A diferencia de Ventas por ítems, el real no lleva subtítulo.

### 6.2 Filtros

Grilla de 4 columnas, como la captura, más Tipo:

| Fila | Columna 1 | Columna 2 | Columna 3 | Columna 4 |
|---|---|---|---|---|
| 1 | Rango de fechas | Selecciona sucursal… | Selecciona usuario… | Selecciona vendedor… |
| 2 | Todas las categorías | Filtrar por nombre del ítem | Buscar por lista de precios | **Tipo: Todos / Ítems / Combos** |

| Filtro | Comportamiento |
|---|---|
| Rango de fechas, Vendedor, Categoría, Nombre del ítem, Tipo | **Funcionales**, en vivo, con los mismos defaults y reglas que en Ventas por ítems (§6.2 de ese spec). |
| Sucursal, Usuario, Lista de precios | **Visuales.** Se abren y se ven igual que los funcionales, pero no cambian los resultados. Sucursal y Usuario muestran la opción de la sesión (`SESION_VENTAS[vertical]`). |

### 6.3 Botones (solo visuales, D8)

Fila centrada, mismo estilo del real y de Ventas por ítems: **GENERAR** e **IMPRIMIR** en `--blue-100`, **EXCEL** en `--coral-100` con ícono de Excel. Los tres muestran `toast.info('Próximamente')`.

### 6.4 Tarjetas

Tres tarjetas centradas, como en la captura: **Total Ventas**, **Total Costos** y **Total Ganancias**, con el valor en negrita (§5.5) y el formato `$ 1,907,444.26` de `fmtReporte`.

### 6.5 Tabla

Encima de la tabla, dentro de la tarjeta blanca: selector **"Mostrar [10 | 25 | 50] items"** (default 25). A diferencia de Ventas por ítems, **no** lleva la línea "Última actualización del reporte…", porque el real de Ganancias no la tiene.

| Columna | Contenido | Ordenable |
|---|---|---|
| Código | Código del ítem o `-` | Sí |
| Nombre | Nombre | No |
| **Tipo** | `Ítem` como texto normal. `Combo` como badge pill (`--coral-10` / `--coral-100`), igual que en Ventas por ítems | No |
| Variantes | Solo si `has('variantes')` (Retail). Siempre `-` | No |
| Categoría | Nombre de la categoría o `-` | No |
| Cantidad | Número entero simple | Sí |
| Total Ventas | `$ 15,000` (formato `fmtReporte`) | Sí |
| Total Costos | `$ 0` | Sí |
| Total Ganancias | `$ 15,000`; si es negativa: `$ -164,300` | Sí |
| Ganancia % | `100 %`. Verde si ≥ 0, rojo si es negativa | Sí |

- **Orden por defecto:** Total Ganancias, de mayor a menor.
- Para los colores verde y rojo, usar los tokens semánticos de éxito y error de Merlin (verificar nombres en `MERLIN-SYSTEM.md`). **No hardcodear hex.**
- Tooltip en el encabezado "Ganancia %": "Total Ganancias ÷ Total Costos. Si el ítem no tiene costo, se muestra 100 %."
- Tooltip en el encabezado "Total Costos": "Costo actual del ítem × cantidad vendida. El costo de un combo es el que se digitó al crearlo."
- Paginación al pie, igual que Ventas por ítems.

### 6.6 Estados

Los mismos de Ventas por ítems: "No hay ventas en este rango de fechas" y "No hay ítems con estos filtros". Las tres tarjetas quedan en `$ 0`.

---

## 7. Exportar

Fuera de alcance (D8): el botón EXCEL es solo visual. Cuando se active, exportaría las filas filtradas con las mismas columnas de la tabla, siguiendo el patrón de `utils/generateVentasAsyncXlsx.ts`.

---

## 8. Cambios de modelo y datos

### 8.1 Sin cambios de modelo

No hace falta tocar `SaleItem`, `CheckoutItem` ni `ventaFromSale`: `productId` e `isCombo` ya están, desde Ventas por ítems. Tampoco se agrega costo a las ventas (D6).

### 8.2 Agregación, reutilizando la lógica de Ventas por ítems (archivo nuevo + refactor)

`utils/gananciasPorItems.ts`: función pura, sin hooks.

```ts
export interface GananciasItemsFila {
  key: string;
  codigo: string;          // '-' si no se resuelve
  nombre: string;
  tipo: 'Ítem' | 'Combo';
  categoria: string;       // '-' si no se resuelve
  cantidad: number;
  totalVentas: number;     // Σ subtotalLinea
  totalCostos: number;     // costoUnitario × cantidad
  totalGanancias: number;  // totalVentas − totalCostos
  gananciaPct: number;     // totalCostos > 0 ? totalGanancias / totalCostos * 100 : 100
}

export function agregarGananciasPorItems(
  ventas: Venta[],
  ctx: { allProducts: CatalogProduct[]; catDefs: CatDef[]; items: Item[] },
): GananciasItemsFila[];
```

**Sin duplicar la resolución.** La lógica que `agregarVentasPorItems` usa para decidir código, nombre, categoría y tipo de cada fila (el bloque final del `map` en `utils/ventasPorItems.ts`) debe **extraerse a una función exportada** que ambos reportes llamen, y esa función también devuelve el `Item` resuelto (de ahí sale `Item.costo`). Es un refactor mecánico:

- Ventas por ítems **no debe cambiar de comportamiento ni de resultados**. Es criterio de aceptación (§11).
- Ganancias solo agrega el cálculo de costos y ganancia sobre esas mismas filas.

El componente aplica primero Fecha y Vendedor sobre las ventas, llama a `agregarGananciasPorItems`, y luego aplica Categoría, Nombre y Tipo, el orden y la paginación.

### 8.3 Combos sembrados con costo (P1)

Hoy los combos sembrados tienen `costo: 0`. Se propone asignarles costo, para que el reporte los muestre con valores creíbles desde el primer render:

| Vertical | Combo | Precio base | Costo propuesto | Ganancia % esperada* |
|---|---|---|---|---|
| Restaurantes | Combo Ejecutivo Mediodía (9001) | 210,084 | 105,000 | 100.08 % |
| Restaurantes | Combo Sushi para Compartir (9002) | 159,664 | 95,000 | 68.07 % |
| Restaurantes | Combo Café y Postre (9003) | 71,429 | 38,000 | 87.97 % |
| Retail | Combo Outfit Casual (9001) | 193,193 | 100,000 | 93.19 % |
| Retail | Kit Cuidado Personal (9002) | 201,597 | 110,000 | 83.27 % |

\* Calculada contra el precio base. En el reporte, Total Ventas usa el precio de la línea vendida (p. ej. $250,000 para el Combo Ejecutivo), así que el porcentaje que se ve puede ser distinto.

Archivos: `data/itemsSeed.ts` (`SEED_COMBOS`) y `data/retail/itemsSeed.ts`.

**Efecto colateral a resolver en el mismo PR:** cambiar el costo sembrado no llega a los navegadores que ya cargaron los ítems. Hay que **bumpear la clave de `localStorage`** de ítems de cada vertical en `data/verticalCatalog.ts` (`itemsStorageKey`: `bold-pos:items:v2` → `v3` en Restaurantes y `bold-pos:items:retail:v3` → `v4` en Retail) y actualizar el comentario de versiones en `store/itemsStore.tsx`. Esto **borra los ítems y combos creados a mano** en cada navegador (ver §14).

---

## 9. Archivos

| Archivo | Cambio |
|---|---|
| `components/reportes/GananciasItemsReport.tsx` | **Nuevo.** La pantalla completa (§6). |
| `utils/gananciasPorItems.ts` | **Nuevo.** Agregación pura (§8.2). |
| `utils/ventasPorItems.ts` | **Refactor sin cambio de comportamiento:** extraer y exportar la resolución de código, nombre, categoría, tipo e Item (§8.2). |
| `components/ReportesPanel.tsx` | Navegación del ítem `ganancias-items` (§4). |
| `pages/ReporteDetallePage.tsx` | Early return a `GananciasItemsReport` (§4). |
| `components/reportes/VentasItemsReport.tsx` + archivo compartido nuevo | P1 (#10): este reporte repite `PillButton`, `SummaryCard`, `Field`, `inputStyle`, `norm` y `primerDiaDelMes`. Extraerlos a un archivo compartido de `components/reportes/` y que los dos reportes los importen. Si no se hace, copiarlos sin tocar `VentasItemsReport`. |
| `data/itemsSeed.ts`, `data/retail/itemsSeed.ts`, `data/verticalCatalog.ts`, `store/itemsStore.tsx` | Solo si se hace P1 (#9, §8.3). |
| `specs/README.md` | Agregar la fila de este spec al índice. |

---

## 10. Casos borde

| Caso | Comportamiento esperado |
|---|---|
| Ítem o combo sin costo (`costo: 0`) | Total Costos `$ 0`, Total Ganancias = Total Ventas, Ganancia % `100 %`. |
| Costo mayor que la venta | Total Ganancias negativo (`$ -164,300`) y Ganancia % negativa en rojo. |
| Combo cuyo costo se digitó distinto de la suma de sus componentes | Se usa el costo digitado (D2). El reporte no avisa de la diferencia. |
| Se vende un combo y un componente suelto en la misma venta | Dos filas. El componente solo lleva su propio costo; el combo, el suyo. |
| Se cambió el costo de un ítem o combo después de venderlo | El reporte usa el costo actual (D6). |
| Un producto se vendió con distintos descuentos de línea | Una sola fila. Total Ventas suma cada línea con su descuento; el costo no cambia. |
| El combo o ítem se desactivó o se eliminó en `/items` | Sigue en el reporte. Si el Item aún existe, usa su costo; si se eliminó: costo `0`, nombre de la última línea vendida, Código y Categoría `-`. |
| Línea libre de Retail ("Ajuste de prenda") | Fila propia por nombre, Tipo `Ítem`, costo `0`. |
| Ventas abiertas o canceladas | No se cuentan (misma regla que Ventas por ítems). |
| Filtro Tipo = Combos sin combos en el rango | "No hay ítems con estos filtros". |
| Se cambia un filtro visual o se hace clic en GENERAR, IMPRIMIR o EXCEL | No cambia ningún resultado; los botones muestran "Próximamente". |
| Cambio de vertical con el selector de Inicio | Solo ventas, ítems y costos de la vertical activa. La columna Variantes aparece solo en Retail. |

---

## 11. Criterios de aceptación

- [ ] Reportes → "Ganancias por ítems" abre el reporte en Restaurantes **y** en Retail (ya no muestra un toast).
- [ ] El título dice "Reporte Ganancias por Ítems", sin subtítulo.
- [ ] La grilla de filtros tiene los de la captura más Tipo; los funcionales cambian los resultados en vivo y los visuales no.
- [ ] GENERAR, IMPRIMIR y EXCEL se ven como en el real y solo muestran un toast.
- [ ] Hay tres tarjetas (Total Ventas, Total Costos, Total Ganancias) que se recalculan al cambiar cualquier filtro funcional, y Total Ganancias = Total Ventas − Total Costos.
- [ ] La tabla muestra Código, Nombre, Tipo, Variantes (solo Retail), Categoría, Cantidad, Total Ventas, Total Costos, Total Ganancias y Ganancia %, ordenada por Total Ganancias descendente.
- [ ] Un combo vendido aparece como **una sola fila** con Tipo **Combo** y su costo es el valor digitado en el formulario del combo, no la suma de sus componentes.
- [ ] Las unidades de un producto vendidas dentro de un combo **no** suman a la fila de ese producto, ni su costo.
- [ ] Ganancia % = Total Ganancias ÷ Total Costos × 100, y `100 %` cuando el costo es `0`. Es verde si es ≥ 0 y roja si es negativa.
- [ ] Con el mismo rango y vendedor, y sin filtros de categoría, nombre y tipo, la tarjeta **Total Ventas** es igual a la tarjeta **Subtotal** de Ventas por ítems.
- [ ] Editar el costo de un ítem o combo en `/items` cambia su fila en el reporte al volver a abrirlo.
- [ ] Una venta nueva cobrada en Mesas o Mostrador aparece en el reporte sin recargar la página.
- [ ] **Ventas por ítems no cambió:** mismas filas, mismos totales y misma pantalla que antes del refactor de §8.2.
- [ ] No se rompe ningún flujo existente: checkout, factura impresa, listado y detalle de Ventas, reportes Legacy y Async.

### Escenario de prueba manual

1. En Restaurantes, abrir `/items` y confirmar el campo **Costo** del "Combo Ejecutivo Mediodía" (con P1: $105,000).
2. Cobrar en Mostrador 1 × Combo Ejecutivo Mediodía.
3. Abrir Reportes → Ganancias por ítems con el rango por defecto.
4. Esperado, fila del combo con la venta nueva y las sembradas (con P1, sumando la venta sembrada ORD0011 de 1 combo): Cantidad 2 · Total Ventas $ 500,000 · Total Costos $ 210,000 · Total Ganancias $ 290,000 · Ganancia % 138.1 % (verde).
5. Editar el costo del combo a $300,000 y volver a abrir el reporte: Total Costos $ 600,000, Total Ganancias $ -100,000 y Ganancia % -16.67 % (roja).
6. Filtrar Tipo = Combos: queda solo la fila del combo (y los de otros combos vendidos) y las tarjetas reflejan solo combos.

---

## 12. Plan de implementación

Una sola branch `bn-feature/reporte-ganancias-items`, PR a `develop` y luego a `main`, según `CLAUDE.md`. Orden sugerido de commits:

1. Refactor de `ventasPorItems.ts` (§8.2), con Ventas por ítems verificado sin cambios.
2. Agregación pura `gananciasPorItems.ts`.
3. Pantalla `GananciasItemsReport.tsx` y navegación (§4, §6).
4. P1: extracción de componentes compartidos (§9).
5. P1: combos sembrados con costo y bump de claves (§8.3).

---

## 13. Backlog futuro

- **Costo guardado en la venta (v2):** hoy el reporte lee el costo actual del ítem (D6). En el producto real, el costo debe guardarse en cada línea al cobrar, para que cambiar el costo después no reescriba la historia de ganancias. Mismo principio que ya usa `comboComponents` en la venta.
- **Costo sugerido para combos:** como el costo del combo es manual (D2), es fácil dejarlo en `0` y que el reporte muestre 100 % de ganancia. Una ayuda en el formulario ("Costo sugerido: suma de costos de los componentes") evitaría el error sin quitar la edición manual.
- **GENERAR, IMPRIMIR y EXCEL funcionales** (D8).
- **Variantes con datos reales y costo por variante** en Retail, cuando el checkout registre la variante vendida.
- **Filtros de Sucursal, Usuario y Lista de precios funcionales,** cuando el prototipo tenga esos datos.
- **Fila "Item no registrado"** como en el real, si se quiere réplica exacta de las líneas libres.
- **Ganancia sobre venta:** si Producto prefiere margen (ganancia ÷ venta) en lugar de margen sobre costo, es un cambio en D5.

---

## 14. Preguntas abiertas

1. **Combos sembrados con costo (§8.3).** Cargarlos obliga a bumpear las claves de ítems de ambas verticales, lo que borra los ítems y combos creados a mano en cada navegador. Si hay demos en curso con ítems propios, se puede dejar el P1 afuera y mostrar el reporte editando el costo de un combo en vivo.
2. **Costo actual vs. costo al vender (D6).** El spec lee el costo al generar el reporte. Si prefieren que el prototipo ya guarde el costo en la venta, hay que agregarlo a las líneas de Mesas, Mostrador y checkout, y el spec cambia de tamaño.

---

## 15. Referencias

- Reporte real de Bold POS (base visual): `pos.stg.bold.co/#/retail/reports/sales-revenue`, cuenta con Facturación Electrónica, 7-oct-2026. Título "Reporte Ganancias por Items"; 7 filtros en grilla de 4 columnas; botones GENERAR, IMPRIMIR y EXCEL; tarjetas Total Ventas, Total Costos y Total Ganancias; columnas Código, Nombre, Variantes, Categoría, Cantidad, Total Ventas, Total Costos, Total Ganancias y Ganancia %; "Mostrar 25 items".
- Verificación de fórmulas contra la captura: Ganancia % = ganancias ÷ costos (87.5 %, 25 %, 34.33 %, 23.08 %, –82.15 %), y 100 % cuando el costo es 0. Total Ventas = Subtotal de Ventas por ítems (Camisa chevignon $230,000 en ambos).
- Archivos leídos para este spec (commit `fbe3fa3`): `components/reportes/VentasItemsReport.tsx`, `utils/ventasPorItems.ts`, `components/ReportesPanel.tsx`, `pages/ReporteDetallePage.tsx`, `types/item.ts`, `data/itemsSeed.ts`, `data/retail/itemsSeed.ts`, `data/ventasSeed.ts`, `data/verticalCatalog.ts`, `pages/items/ItemFormPage.tsx`, `utils/invoice.ts`, `utils/ventas.ts`, `components/CheckoutDrawer.tsx`, `specs/README.md`, `CLAUDE.md`.
