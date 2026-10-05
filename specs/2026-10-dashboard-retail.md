# SPEC — Dashboard de Inicio de Retail
### Bold POS — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Octubre 2026 |
| **Vertical** | Retail |
| **Antecedente** | [`specs/2026-10-selector-vertical.md`](./2026-10-selector-vertical.md) (✅ Implementado) — su fase 3 adaptaba el Dashboard compartido; este spec lo reemplaza por una vista propia de Retail. |

---

## 1. Qué cambia

`/inicio` tiene **dos versiones**, una por vertical:

- **Restaurantes:** el dashboard actual (`pages/Dashboard.tsx`), sin cambios.
- **Retail:** réplica del dashboard del POS Retail real (`pages/dashboard/RetailDashboard.tsx`), tomada de una captura del software.

`Dashboard` decide cuál renderizar según `useVertical().vertical`. Las adaptaciones de Retail dentro del dashboard de Restaurantes (fase 3 del spec anterior) se retiraron: ya no hacen falta.

## 2. Dashboard de Retail

Solo se replica el contenido; el sidebar y la barra superior son los del prototipo.

- **Encabezado:** "Dashboard - Movimientos de" + selector de período (Día / Semana / Mes, default Semana) y botón **Refrescar**. El selector de vertical del prototipo se muestra a su lado.
- **Utilidad bruta:** Ventas Totales ($ 1,815,700 · Comprobantes), Costos De Venta ($ 487,051 · Costo De Items De Venta), Utilidad Bruta ($ 1,328,649, en verde).
- **Flujo de caja:** Ingresos ($ 700,000 · Recibos), Gastos ($ 120,000 · Gastos realizados), Flujo De Caja ($ 580,000).
- **Cuentas por cobrar:** Saldos Esta Semana ($ 1,115,700 · Crédito nuevo otorgado), Cobrado Esta Semana ($ 0 · Crédito viejo recuperado), CXC Total Acumuladas ($ 1,115,700, en rojo · Total de crédito pendiente).
- **Ítems:** gráfico de barras "Ítems Más Vendidos Por" con toggle Valor / Cant.
- **Clientes:** gráfico de barras "Mejores Clientes Por" con toggle Valor / Compras.

Los valores de la captura corresponden a "Semana". Día y Mes escalan esos valores (×0.2 y ×4) con datos mock; los valores de Cant. y Compras son inventados (la captura solo muestra Valor).

## 3. Datos

`src/app/data/retail/dashboardRetailMocks.ts`. Los nombres de ítems y clientes se muestran truncados, tal como en la captura (`Puyaso...`, `Nahin ...`).
