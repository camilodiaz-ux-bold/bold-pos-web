# Proveedores (lista, nuevo y perfil)

| Campo | Valor |
|---|---|
| Fecha | 2026-10 |
| Estado | Listo para implementación |
| Vertical | Core |
| Antecedente | Prototipo HTML `saas-purchasing` (`proveedores.html`, `nuevo-proveedor.html`, `perfil-proveedor.html`) |

## 1. Contexto

El módulo de compras se construyó primero como prototipo HTML/CSS/JS vanilla en `andres-bold/saas-purchasing` (branding Bold SAS, paleta propia). Este spec migra **solo Proveedores** a `bold-pos-web` como piloto del resto del módulo (facturas de compra, reportes, ajustes). Se reconstruye en React + TypeScript con el design system Merlin y los patrones del repo; **no** se copian los estilos del prototipo.

## 2. Alcance

Entra:
- Lista de proveedores en `/proveedores`.
- Formulario "Nuevo contacto" en `/proveedores/nuevo`.
- Perfil / "Editar contacto" en `/proveedores/:id/editar`.
- Entrada de menú Contactos → Proveedores.
- Store propio con persistencia en `localStorage`.

No entra (fases siguientes):
- Facturas de compra reales: la pestaña "Facturas de compra" del perfil muestra filas de ejemplo estáticas, sin link al detalle ni modal "Reportar el pago".
- Clientes: el submenú "Clientes" queda como toast "próximamente".
- Importar proveedores: botón solo visual (toast).
- Conexión real de "Compras últimos 6 meses" y "Cuentas por pagar" con facturas: son números del propio proveedor (sembrados; 0 al crear).

## 3. Reglas de diseño y de código

- Merlin: Montserrat, solo variables CSS (`--blue-*`, `--black-*`, `--coral-*`, `--feedback-*`). Nada de hex del prototipo (`#0D1B4B`, `#DC2626`…).
- Reutilizar: `TextField`/`SelectField`/`TextAreaField` (`components/items/FormField`), `Toggle`, `ConfirmDeleteModal`, `ventasStyles`.
- Sentence case, sin emojis, formato de miles `es-CO` (punto) como el resto de `bold-pos-web`; fechas `DD/MM/YYYY`.
- Rutas nuevas **agregadas**, sin tocar basename ni rutas existentes. Al ser Core no se registra en `modules.ts`.

## 4. Modelo

`Proveedor`: `id`, `nombre`, `esCliente`, `esProveedor`, `activo`, `correo`, `celular`, `telefono1`, `telefono2`, `observaciones`, `tipoPersona`, `tipoDocumento`, `numeroDocumento`, `responsabilidadFiscal`, `regimenFiscal`, `vendedor`, `descuento`, `pais`, `ciudad`, `direccion`, `comprasUltimos6Meses`, `cuentasPorPagar`.

Clave `localStorage`: `bold-pos:contactos:v1`. Si cambia el shape se sube la versión.

## 5. Lista (`/proveedores`)

- Encabezado: flecha atrás, título "Proveedores", botones "Importar" (outline, toast) y "Nuevo proveedor".
- Filtros: nombre, número de documento / NIT, correo, celular, teléfono, estado (Todos / Activo / Inactivo). Todos filtran de verdad (substring, sin distinguir mayúsculas; documento y teléfonos comparan solo dígitos).
- Barra de resultados: "Mostrando X de Y", Refrescar (relee el store) y Limpiar filtros.
- Columnas: Nombre · Compras últimos 6 meses (centrada) · Cuentas por pagar (centrada) · No. documento (derecha) · Correo electrónico · Estado (badge) · Activo (toggle) · Eliminar.
- La fila completa navega al perfil; el toggle y el botón eliminar no navegan.
- Eliminar pide confirmación (`ConfirmDeleteModal`).
- Solo se listan contactos con `esProveedor`.

## 6. Formulario (`/proveedores/nuevo` y `/proveedores/:id/editar`)

Una sola página para ambos modos (como `ItemFormPage`). Cuatro cards numeradas:

1. **Nombre y tipo de contacto**: Nombre y apellidos / Razón social*, Tipo de contacto* (checkboxes Cliente y Proveedor, ambos marcables; en nuevo arranca Proveedor), y en edición el toggle Activo.
2. **Datos básicos**: Correo electrónico*, Celular, Teléfono 1, Teléfono 2, Observaciones.
3. **Datos fiscales y comerciales**: Tipo de persona*, Tipo de documento* (NIT, Cédula de ciudadanía, Cédula de extranjería), Número de documento / NIT*, DV (solo lectura, se calcula con el algoritmo de la DIAN cuando el documento es NIT; vacío en otros casos), Responsabilidad fiscal, Régimen fiscal, Vendedor, Descuento.
4. **Datos de ubicación**: País (Colombia), Departamento / Ciudad (lista corta de ejemplo, el prototipo origen no traía opciones), Dirección.

Validación al guardar: los campos con `*` son obligatorios, el correo debe tener formato válido, y Tipo de contacto exige al menos un checkbox. Los errores se muestran bajo cada campo y no se navega hasta corregirlos. Guardar muestra toast y vuelve a la lista. Cancelar vuelve sin guardar. Un `:id` inexistente vuelve a la lista con toast de error.

Solo en edición, debajo del formulario, pestañas pill: **Comprobantes**, **Facturas de venta**, **Actividad del contacto** (las tres con "No se encontraron registros") y **Facturas de compra** (tabla de ejemplo, ver §2: No. factura, Inventario, Ítems, Valor total, Forma de pago, Fecha de vencimiento, Estado de pago).

## 7. Menú

"Contactos" pasa de un toast a un submenú con **Clientes** (toast) y **Proveedores** (`/proveedores`). Activo mientras la ruta empiece por `/proveedores`.

## 8. Criterios de aceptación

- Con `npm run build` sin errores de TypeScript.
- En Restaurantes y en Retail el menú muestra Contactos → Proveedores y las tres pantallas funcionan igual.
- Crear, editar, activar/desactivar y eliminar un proveedor persiste al recargar.
- Los filtros de la lista reducen el conteo "Mostrando X de Y".
- No quedan colores hex ni tipografías fuera de Merlin en los archivos nuevos.
