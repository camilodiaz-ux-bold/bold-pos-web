# SPEC — Menú lateral siempre abierto y selector de vertical en el perfil

| | |
|---|---|
| **Estado** | ✅ Implementado |
| **Vertical** | Core (afecta a Retail y Restaurantes) |
| **Antecedentes** | `2026-10-selector-vertical.md` (✅, congelado: el selector vivía solo en Inicio) |

## 1. "Mostrador" solo en Restaurantes

- En `vertical/modules.ts` se registra `mostrador: ['restaurantes']`. El submenú **Mostrador** de "Punto de venta" desaparece en Retail, que conserva **Turnos**.
- "Nueva venta" en Retail sigue abriendo la pantalla de venta (el Mostrador interno, ruta `/`); lo que cambia es solo la entrada de menú. En esa pantalla, "Punto de venta" queda resaltado sin ningún submenú activo.
- Restaurantes no cambia: Mesas, Mostrador y Turnos.

## 2. Menú lateral izquierdo

- **Por defecto abierto, siempre.** Se elimina el colapso automático al entrar a Mesas, Mostrador o Turnos (hoy el menú se cierra solo en esas pantallas).
- **Todos los submenús desplegados** por defecto (Punto de venta, Ingresos, Egresos, Items, Contactos).
- **Recoger y desplegar** cada submenú con el chevron de su encabezado (ya existe, solo cambia el default).
- **Esconder el menú completo** con la flecha de arriba, que lo lleva a la barra angosta de íconos de hoy (con sus flyouts); la flecha de esa barra lo vuelve a abrir.
- Las preferencias del usuario (menú recogido, submenús recogidos) se **conservan al navegar y al cambiar de vertical**; se guardan en memoria, así que al recargar la página vuelve al default (todo abierto).

## 3. Selector de vertical en el perfil

- Se **elimina** `PrototypeVerticalSwitcher` de Inicio de Restaurantes (`pages/Dashboard.tsx`) y de Retail (`pages/dashboard/RetailDashboard.tsx`), y el componente deja de existir.
- Al hacer clic en el avatar "RA" (esquina superior derecha) el menú del perfil muestra, debajo del nombre y antes de "Legal y privacidad", un bloque **"Vertical del prototipo"** con dos opciones, **Retail** y **Restaurantes**; la activa va marcada con un check. Es una herramienta del prototipo, no del producto; se distingue con la etiqueta del bloque.
- Al elegir la otra vertical: toast "Vertical: …" y el menú se cierra.

## 4. Qué pasa con la pantalla al cambiar de vertical

Regla: se evalúa la ruta actual contra los módulos de la vertical nueva.

- Si el módulo de la ruta **existe** en la vertical nueva (o es core), el usuario **se queda en la misma pantalla**.
- Si **no existe**, va al **Inicio de la vertical nueva** (`/inicio`, que muestra el dashboard propio de cada vertical).

| Ruta | Módulo | Retail | Restaurantes |
|---|---|---|---|
| `/` (Mostrador / Mesas) | core (Mesas solo Restaurantes; en Retail siempre Mostrador) | queda | queda |
| `/turnos`, `/inicio`, `/items`, `/items/nuevo`, `/items/:id/editar`, `/items/alertas-stock…`, `/clientes…`, `/proveedores…`, `/facturas-compra…`, `/reportes` | core | queda | queda |
| `/ventas`, `/ventas/:id` | `ventas` | → Inicio | queda |
| `/comprobantes…`, `/facturas-venta…`, `/ajustes…`, `/items/variantes`, `/items/devoluciones` | Retail | queda | → Inicio |
| `/reportes/retail/:id` | `reportes-retail` | queda | → Inicio |
| `/reportes/restaurantes/:id` | core o `reportes-restaurantes` según el reporte | queda (el guard actual redirige a `/reportes` si el reporte es exclusivo de Restaurantes) | queda |

La asignación ruta → módulo vive en una función (`vertical/`), no en el menú.

## 5. Fuera de alcance

Cambiar el contenido de los menús de cada vertical (salvo Mostrador), los dashboards de Inicio, la persistencia del menú tras recargar, o el comportamiento de la barra de íconos.

## 6. Verificación

`npm run build` y prueba en el navegador: menú abierto al entrar a Mostrador/Turnos, colapsar un submenú y esconder el menú, cambiar de vertical desde el avatar en una pantalla compartida (se queda) y en una exclusiva (va al Inicio), y confirmar que Inicio ya no muestra el selector.
