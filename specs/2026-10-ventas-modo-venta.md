# SPEC — Modo de venta en Ventas (Mostrador vs. Mesa)
### Bold POS — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Octubre 2026 |
| **Vertical** | Restaurantes |
| **Autor** | Producto — Bryan Nazar |
| **Antecedentes** | [`2026-10-ventas-dinamicas.md`](./2026-10-ventas-dinamicas.md) (modelo `Venta` y pantalla Ventas; ese spec está congelado y este lo amplía) |

## 1. Qué cambia

Las ventas de Restaurantes se hacen de dos formas: en **Mesa** (mapa de mesas) o por **Mostrador** (sin mesa). Hasta ahora Mostrador se distinguía guardando la zona `"Mostrador"`. Ahora el modo es un campo propio y la zona queda libre para las mesas.

- `Venta.modo?: 'mostrador' | 'mesa'` (solo Restaurantes; Retail no lo usa).
- Mesas registra `modo: 'mesa'` (con zona, mesa y personas); Mostrador registra `modo: 'mostrador'` **sin zona**.
- Las ventas sembradas de Restaurantes son todas `modo: 'mesa'`.

## 2. Pantalla Ventas (`/ventas`)

- Columna nueva **Modo de venta** al final de la tabla: `Mostrador` o `Mesa` (`---` si la venta no tiene modo).
- Filtro nuevo **Modo de venta** al final de la fila de filtros: `Todos | Mostrador | Mesa`.
- En ventas de Mostrador, **Zona** y **Mesa** muestran `---` (misma lógica que Mesa).

## 3. Otros usos

- El botón "Imprimir comanda" del detalle de venta se muestra cuando `modo === 'mostrador'` (antes `zona === 'Mostrador'`).

## 4. Datos persistidos

El shape de `Venta` cambió, así que se bumpea la clave de `localStorage` de ventas de Restaurantes (`bold-pos:ventas:restaurantes:v3` → `v4`), como indica `ventasStore.tsx`. Las ventas cobradas en pruebas anteriores se pierden y se vuelve a sembrar.

## 5. Fuera de alcance

Retail, reportes que agrupen por modo, y el detalle de venta (que sigue mostrando Zona `---` en Mostrador).
