# Clientes (lista, nuevo y perfil) y Contactos unificados

| Campo | Valor |
|---|---|
| Fecha | 2026-10 |
| Estado | Listo para implementación |
| Vertical | Core |
| Antecedente | `2026-10-proveedores.md` y el prototipo `saas-purchasing` (`clientes.html`) |

## 1. Contexto

`saas-purchasing` tiene `clientes.html` con la misma estructura que Proveedores, y su formulario de contacto ya permite marcar Cliente y/o Proveedor. En vez de duplicar código, Clientes y Proveedores pasan a ser dos vistas del mismo modelo **Contacto**.

## 2. Alcance

Entra:
- `/clientes`, `/clientes/nuevo`, `/clientes/:id/editar`.
- Refactor: `Proveedor` → `Contacto`; store, tipos, datos y utilidades renombrados (`contactosStore`, `types/contacto`, `data/contactosSeed`, `utils/contactos`). Páginas compartidas `ContactosListPage` y `ContactoFormPage` con prop `tipo` y configuración en `pages/contactos/contactosConfig.ts`.
- Menú Contactos → Clientes navega a `/clientes`.
- Corrección del ícono de Contactos (`IcUsuarios` / `IcUsuariosFill`), que se dibujaba como una mancha.

No entra: facturas de venta del cliente (las pestañas del perfil quedan vacías), Importar (toast).

## 3. Diferencias respecto a Proveedores

- Lista: sin columnas "Compras últimos 6 meses" ni "Cuentas por pagar". Columnas: Nombre · No. documento · Correo · Estado · Activo · Eliminar.
- Lista de clientes = contactos con `esCliente`. Lista de proveedores = contactos con `esProveedor`.
- Formulario: en `/clientes/nuevo` el tipo de contacto arranca en Cliente (en proveedores, Proveedor). Mismas validaciones.
- Perfil: pestañas Comprobantes, Facturas de venta y Actividad del contacto. La pestaña "Facturas de compra" es solo de proveedores.
- Eliminar borra el contacto completo; si es cliente y proveedor, el modal avisa que se elimina también del otro listado.
- Un contacto con ambos tipos aparece en las dos listas; desmarcar un tipo en el formulario lo saca de esa lista.

## 4. Datos

- Clave `localStorage`: `bold-pos:contactos:v2` (reemplaza `bold-pos:proveedores:v1`, que solo existió en el PR del piloto).
- Los 6 contactos de ejemplo del prototipo se siembran como cliente y proveedor a la vez (en el prototipo ambas listas traen los mismos nombres). Ids `ctc-N`.

## 5. Criterios de aceptación

- `npm run build` sin errores de TypeScript.
- Proveedores sigue funcionando igual que en `2026-10-proveedores.md`.
- Un cliente creado en `/clientes` aparece en esa lista y no en Proveedores, y al revés.
- El ícono de Contactos se ve nítido en estado normal y activo, con el menú expandido y colapsado.
