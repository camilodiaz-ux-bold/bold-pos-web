# SPEC — Selector de vertical (Retail / Restaurantes)
### Bold POS — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | Listo para implementación |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Octubre 2026 |
| **Vertical** | Core (infraestructura del prototipo) |
| **Antecedente** | [`specs/2026-09-combos.md`](./2026-09-combos.md) — Combos es un módulo core y permanece en ambas verticales; la diferencia combos + variantes en Retail se especifica en otra sesión. |

---

## 1. Objetivo

Bold POS tiene dos verticales: **Retail** (la principal) y **Restaurantes**. Comparten módulos core (facturación electrónica, inventarios, ventas, gastos, facturas de compra, parte de reportes, combos) y tienen módulos exclusivos (Variantes solo en Retail; Mesas, Propinas y reportes de restaurantes solo en Restaurantes).

El prototipo debe poder mostrar cualquiera de las dos, con el menú, las vistas y los datos propios de cada una, para prototipar cada feature en la vertical que le corresponde.

## 2. Selector

- Vive **solo en Inicio** (`/inicio`), en la cabecera, a la derecha del nombre del negocio.
- Estilo de herramienta de prototipo (borde punteado + etiqueta "Prototipo · Vertical") para que no parezca UI del producto.
- Control segmentado `Retail | Restaurantes`. Cambiar muestra un toast y refresca menú y vistas de inmediato.
- La elección persiste en `localStorage['bold-pos-vertical']`. Default: `restaurantes`.
- **Links de demo:** `?vertical=retail` o `?vertical=restaurantes` fijan la vertical, la guardan y quitan el parámetro de la URL.
- El onboarding ya pide la vertical (`restaurantes | retail | documentos`): al completarlo se fija la elegida. `documentos` no tiene vertical propia y mantiene la actual.

## 3. Registro de módulos

`src/app/vertical/modules.ts` es la única fuente de verdad. Todo módulo que no figure ahí es **core** (ambas verticales).

| Módulo | Retail | Restaurantes |
|---|:---:|:---:|
| Core (ventas, items, combos, inventario, gastos, reportes generales, turnos, mostrador…) | ✅ | ✅ |
| `mesas` | — | ✅ |
| `propinas` | — | ✅ |
| `reportes-restaurantes` | — | ✅ |
| `variantes` | ✅ | — |

Las vistas consultan `useVertical().has(moduleId)`; no se usa `if (vertical === …)` salvo para textos o íconos.

## 4. Comportamiento por vertical

- **Menú lateral:** se ocultan los sub-items de módulos que la vertical no tiene, y los padres que quedan vacíos. En Retail, "Punto de venta" solo tiene Mostrador y Turnos; "Variantes de inventario" aparece solo en Retail.
- **TopBar / Dashboard:** nombre del negocio según la vertical (`Tienda Demo` / `Restaurante Demo`). Ícono de Items: `Package` en Retail, `UtensilsCrossed` en Restaurantes.
- **POS (`/`):** en Retail es siempre Mostrador; no existe Mesas, comandas ni cocina.
- **Rutas:** las rutas de módulos exclusivos se envuelven con `<VerticalRoute module="…">`; si la vertical activa no tiene el módulo, redirige a `/inicio`. Nunca se cambia el `basename` ni las rutas existentes.
- **Propinas:** solo Restaurantes.

## 5. Fases

1. **(Esta)** Infraestructura, selector, filtrado de menú, guard de rutas, onboarding, documentación.
2. **(Implementada)** Datos Retail propios (`src/app/data/retail/`: catálogo POS e items seed de una tienda de ropa y accesorios, con 2 combos de ejemplo); `useCatalog()` entrega categorías, productos, favoritos, unidades e impuestos de la vertical activa (Retail sin INC, porciones ni botellas); `ItemsProvider` y `FavoritesProvider` se remontan con `key={vertical}`; localStorage de ítems separado (`bold-pos:items:retail:v1`); Mostrador con catálogo Retail y órdenes iniciales Retail. Los mocks de ventas se pasan a la fase 3, junto con las columnas de `/ventas`.
3. Adaptación de vistas compartidas: Ventas/Pedido (sin Mesa/Zona), Dashboard (KPIs Retail, sin filtro de canal Mesas), ReportesPanel (sin categoría Restaurantes), Turnos/Checkout (sin propinas), factura (sin mesa/mesero).
4. Primer módulo exclusivo de Retail: Variantes (spec propio).

## 6. Convenciones

- Features exclusivas nuevas: `src/app/verticals/retail/…` o `src/app/verticals/restaurantes/…`. Lo core sigue en `pages/` y `components/`.
- El código existente no se migra en masa; se mueve solo cuando se toque.
- Todo spec nuevo declara su campo **Vertical** (`Core | Retail | Restaurantes`) en la tabla de encabezado.

## 7. Fuera de alcance

- Textos de Login, Signup y Onboarding: se dejan genéricos, sin adaptarse por vertical.
- Diferencia combos vs. variantes en Retail.
