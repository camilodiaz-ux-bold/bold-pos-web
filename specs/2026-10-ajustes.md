# Ajustes (réplica del módulo real de Bold POS Retail)

| Campo | Valor |
|---|---|
| Fecha | 2026-10 |
| Estado | ✅ Implementado |
| Vertical | Retail |
| Antecedente | `2026-10-facturas-compra.md` (ajustes de compras), `2026-10-selector-vertical.md` (módulos por vertical) y el POS Retail real en staging (`#/retail/settings`) |

## 1. Contexto

El POS Retail real tiene un módulo **Ajustes** con 16 secciones más dos formularios de configuración (POS y Facturas de compra). El prototipo no lo tiene. Este spec lo replica con el mismo diseño y la misma estructura, para que el resto del prototipo pueda leer sus valores (costeo, documento por defecto, métodos de pago, descuentos, etc.).

Fuente: recorrido en solo lectura del staging el 2026-10-26. No se copian datos reales, llaves de integración ni credenciales.

## 2. Alcance

Entra:
- Ruta `/ajustes` (grilla de tarjetas) y `/ajustes/perfil` (página completa). Menú lateral: el ítem "Ajustes" ya existe al pie (`BoldNavBar.tsx`) pero solo muestra un toast; pasa a navegar a `/ajustes` en Retail.
- Las 16 secciones de §4 con su comportamiento de panel, tablas y formularios, con validación en línea.
- Formularios "Configuración POS" y "Facturas de compra" (§5), guardados en el store.
- Store local `ajustesStore` con persistencia (§8).
- Módulo registrado como exclusivo de Retail en `vertical/modules.ts` (`ajustes`); Restaurantes no cambia.

No entra:
- Integración real con DIAN, Bold o datáfono (todo es visual: toasts "próximamente" donde el real llama a un servicio).
- Habilitación DIAN pasos 1 y 2: en la cuenta de staging ya están completados y el stepper no es navegable, así que no se pudo ver su contenido. El prototipo los muestra como completados y solo el paso 3 es funcional.
- Que cada ajuste cambie todo el prototipo: en esta fase solo se conectan los que ya tienen consumidor (§7).
- Importar/exportar, "Valida tus datos" real (verificación de correo/celular: la tarjeta abre un modal simulado).

## 3. Diseño (réplica del real, con Merlin)

No se copian estilos del real; se reconstruye con variables CSS de Merlin, Montserrat y los componentes del repo (`FormField`, `Toggle`, `btn btn-primary|secondary|cancel`).

**Página `/ajustes`.** Título "Ajustes". Grilla de 4 columnas (colapsa a 2 y 1). Fila 1: Valida tus datos · Empresa · Facturación · Otros ajustes. Fila 2: Accesos y roles · Inventarios · Configuración POS · Facturas de compra. Tarjetas blancas con radio y sombra suave, título `--blue-100` en semibold. Cada fila de sección: ícono, texto y chevron, con separador.

**Patrones de apertura** (cada sección usa uno; ver §4):
- **Panel izquierdo** (~920 px): título centrado, texto de ayuda debajo, contenido, pie dividido en dos mitades "CANCELAR" (texto rojo) y "GUARDAR" (deshabilitado hasta que el formulario es válido). Fondo atenuado detrás.
- **Panel derecho** (~560 px): título en negrita, botón `X` arriba a la izquierda, pie con "Cancelar" (texto rojo) y acción primaria en píldora roja.
- **Panel derecho ancho** (Roles, ~1160 px): igual que el derecho, con matriz de permisos.
- **Sub-panel derecho sobre un panel izquierdo**: Métodos de pago y Categorías de gastos (el formulario "Nuevo" abre a la derecha sin cerrar la lista).
- **Página completa**: solo Perfil, con botón volver `<`.

Reglas comunes: Escape y clic en el fondo cierran el panel; "Cancelar" en un formulario vuelve a la lista y en la lista cierra. Tablas simples con cabecera semibold, botón "NUEVO" rojo arriba a la derecha, acciones con lápiz y papelera (la papelera abre confirmación antes de eliminar).

## 4. Secciones

### 4.1 Valida tus datos
Tarjeta con ilustración, texto "Valida tu correo y teléfono de contacto para mantener tu cuenta segura." y botón "Validar" (abre modal simulado que marca ambos datos como validados).

### 4.2 Empresa

**Perfil** (`/ajustes/perfil`, página completa). Columna izquierda: Información general (nombre, NIT con dígito de verificación, dirección), Información de contacto (celular y correo, cada uno con botón "Validar") e Información adicional (leyenda o datos adicionales, página web). Cada tarjeta termina en botón "Editar" que abre un panel derecho con sus campos; Nombre, NIT y Dirección son obligatorios y el DV es solo lectura. Columna derecha: logo con "Editar" y "Eliminar" y el texto "Tu logo se podrá ver en todos tus documentos de ingresos y gastos", y tarjeta **Facturación electrónica** con toggle, texto del plan, Tipo de persona, Departamento/Ciudad, Responsabilidad fiscal y Régimen fiscal, con "Editar".

**Numeración documentos no electrónicos** (panel izquierdo). Select Sucursal (obligatorio, con búsqueda). Al elegirla aparecen, con valor numérico obligatorio: Siguiente número de Comprobante, de Recibo, de Gasto, de Cotización y de Factura de compra.

**Sucursales** (panel izquierdo). Texto "Sucursales donde estás operando tus Comprobantes." Tabla Nombre · Dirección · Ciudad · Acciones (lápiz). "NUEVA" muestra el aviso "¡Contáctanos! Has llegado al límite de sucursales dentro de tu plan" cuando se supera el límite del plan simulado; si no, abre el formulario. Formulario: Nombre\*, Dirección\*, Ciudad\*, Correo, Siguiente número de cotización\*, Tamaño de papel por defecto\* (Papel Media Página, Papel Carta, Papel Listín, Todos los formatos).

### 4.3 Facturación

**Impuestos** (panel izquierdo). Solo lectura: "Impuestos que aplica tu negocio al momento de facturar." Tabla Nombre · Tipo · Tarifa (Excluido, Bienes y Servicios al 5%, Tarifa general, etc.). Sin acciones; solo "Cancelar".

**Numeraciones** (panel izquierdo). "Numeraciones que tu negocio aplica para POS, factura electrónica, notas crédito y notas débito." Tabla Tipo de documento · Nombre · Prefijo · Sucursal · Siguiente consecutivo · Acciones (lápiz y papelera). Formulario: Tipo de documento (Factura electrónica de Venta, Nota Crédito, Nota Débito, Documento Soporte). Para Factura electrónica de Venta solo se muestra el botón "Consultar en DIAN" (toast simulado). Para los demás: Sucursal\*, Nombre personalizado\*, Prefijo, Siguiente consecutivo\*.

**Habilitación DIAN (Facturación Electrónica)** (panel izquierdo). Asistente de 3 pasos con tarjeta "Guía del proceso paso a paso" arriba: 01 Datos de la empresa · 02 Envío set de pruebas · 03 Numeraciones e impuestos. Paso 3: Configuración de numeración, select Tipo de documento y "Consultar en DIAN". Botones CANCELAR / FINALIZAR. Pasos 1 y 2: la cuenta ya está habilitada, el stepper no es navegable y se muestran completados (con check) sin contenido; solo el paso 3 es funcional. "Consultar en DIAN" y "Finalizar" son simulados.

### 4.4 Otros ajustes

**Descuentos** (panel izquierdo). "Descuentos a utilizar al momento de realizar un ingreso/gasto o creación de inventario." Tabla Nombre · Descuento % · Acciones. Formulario: Nombre del descuento\*, Tasa\* (porcentaje 0–100).

**Métodos de pago** (panel izquierdo + sub-panel derecho). "Métodos de pago utilizados al momento de pagar una venta/compra." Tabla Nombre · Acciones: toggle de habilitado en todos; lápiz y papelera solo en los personalizados (los 8 por defecto —Bold, Efectivo, Credibanco, Daviplata, Nequi, Redeban, Transferencia bancaria, Otro— no se editan ni se eliminan). Sub-panel "Agrega un nuevo método de pago": Nombre\* (ayuda "Usa este método de pago cuando hagas una venta o una compra") y toggle "Habilitar método de pago". Botón "Agregar método".

**Categorías de Gastos** (panel izquierdo + sub-panel derecho). Lista jerárquica (subcategorías con prefijo "- ") con lápiz y papelera. Sub-panel "Agrega una nueva categoría de gasto": Nombre de la categoría\* (ej. Transporte de empleados, Empaque, Mantenimiento), Categoría principal (opcional, select). Botón "Agregar categoría".

**Integraciones** (panel derecho). "Integraciones disponibles. Conecta y simplifica tus cobros en Bold POS." Dos tarjetas con estado "Integración activa": *Integra para vender con tu datáfono Bold Smart PRO* y *Integra y cobra con Link de pago Bold*. Cada una abre su detalle: "¡Tu datáfono Smart PRO está conectado!" / "¡Tu Link de pago Bold está conectado!", ilustración, campo Llave de integración\* (valor simulado, nunca una llave real), estado, y botones "Deshabilitar integración" y "Salir". Deshabilitar cambia el estado a inactivo y muestra el estado de conexión.

### 4.5 Accesos y roles

**Vendedores** (panel izquierdo). Tabla Id · Nombre · Acciones. Formulario: Id\* y Nombre completo\*.

**Usuarios** (panel izquierdo). "Usuarios que tendrán acceso al sistema dependiendo sus roles asignados." Tabla Nombre · Apellido · Correo · Rol · Estado (etiqueta verde "Activo") · Acciones. El usuario administrador principal solo tiene lápiz (no se elimina). Formulario: Sucursal\*, Acceso a inventarios de\* (checkbox por sucursal), Nombre\*, Apellido, Correo\*, Contraseña\* (mínimo 8 caracteres con un carácter especial, una mayúscula y un número) y Confirmar contraseña\*, Rol\* (select con búsqueda) y checkbox Activo (marcado por defecto).

**Roles** (panel derecho ancho). Lista Nombre del rol con lápiz y papelera; "Cancelar" y "Nuevo". Editor "Actualizar rol" / "Crear rol": Nombre\*, interruptor "Todos los accesos" y matriz de permisos en columnas con un toggle por permiso, agrupada así:
- **Ajustes** → Empresa (Ver Ajustes, Editar Perfil de la Empresa, Actualizar numeración documentos no electrónicos, Usar App Móvil); Oficinas (Ver ingresos y gastos de todas las sucursales, Ver/Crear/Editar/Eliminar Sucursales); Descuentos, Métodos de pago (Ver/Crear/Editar/Eliminar); Usuarios (Ver/Crear/Editar/Eliminar Usuarios y Roles).
- **Productos** → Ítems (Ver/Crear/Editar/Eliminar Categorías de ítems; Ver/Crear/Editar/Eliminar Ítems; Modificar precio en venta; Ver precio de costo; Usar actualización masiva; Usar ajustes de inventario; Usar flujo de inventario; Cambiar fecha de ajuste de inventario; Ver/Crear/Editar/Eliminar Listas de precio; Usar Variantes de ítems) y "Listas de precios asociadas al rol" (un toggle por lista).
- **General** → Contactos (Ver/Crear/Editar/Eliminar Contactos y Vendedores); Ingresos (recibos, comprobantes: Ver/Crear/Editar/Eliminar; Facturas de Venta, Notas Crédito, Notas Débito: Ver/Crear); Cotizaciones (Ver/Crear/Editar/Eliminar); Gastos (Crear y Ver Documento Soporte; Ver/Crear/Editar/Eliminar Gastos; Crear/Editar/Eliminar Categorías de Gastos; Ver/Crear/Anular/Pagar Factura de Compra).
- **Reportes** → Ingresos (Ventas por Ítems, Ganancias por Ítems, Ver Reportes de Inicio, Comprobantes Mensuales, Cotizaciones, Comprobantes, Comprobantes por Vendedor); Documentos electrónicos (Facturas de Venta, Notas de Crédito, Notas de Débito, Documentos Soporte); Administrativos (Ítems, Contactos, Cuentas por Cobrar, Cierre de Caja, Cierre de Caja Gerencial, Inventarios, Ingresos y Egresos, Facturas de Compra).

### 4.6 Inventarios

**Tipos de costeo** (panel izquierdo). "Elige el método de costeo que mejor se adapte a tu empresa." Dos opciones tipo radio: *Costo promedio* (promedio de los valores existentes con los de las nuevas compras) y *Último precio* (el costo de la última compra o entrada). Por defecto Costo promedio.

**Categorías de ítems** (panel derecho). Árbol expandible/colapsable con lápiz y papelera por nodo; "Cancelar" y "Nuevo". Formulario: Categoría principal (select, "Ninguna" por defecto), Nombre de la categoría\*, Descripción y Sub-categorías (botón `+` que agrega filas de nombre). Se alimenta de las categorías de `/items`.

**Lista de precios** (panel derecho). "Esta lista te permitirá aplicar precios diferentes al vender los ítems, sin tener que editarlos uno a uno." Encabezado "N listas de precios creadas"; cada lista muestra nombre, tipo (Valor en pesos o Porcentaje) y porcentaje si aplica, con "Editar" y "Eliminar". Máximo 3 (texto "Puedes crear hasta 3 listas de precios"). Formulario: Nombre\*, Tipo de lista (Valor en pesos / Porcentaje), Valor del porcentaje\* (solo si es Porcentaje), Roles asociados\* (select múltiple con chips removibles).

## 5. Formularios en la grilla

**Configuración POS** (Guardar deshabilitado hasta que cambie algo):
| Campo | Opciones |
|---|---|
| Cliente por defecto al vender\* | Select con búsqueda de clientes, con limpiar |
| Documento por defecto al vender\* | Comprobante, Factura electrónica de venta |
| Condición de pago\* | Contado, Contado/Crédito |
| ¿Deseas llevar un control de turnos? | Sí / No |
| ¿Deseas vender sin existencias de inventario? | Sí / No |
| ¿Deseas llevar el control de órdenes / mesas en tus ventas? | Sí / No |
| Unificar precio total entre Factura Electrónica y Comprobante de Venta | Sí / No |
| ID comercio en Bold | Texto informativo (valor simulado) |

**Facturas de compra:**
| Campo | Opciones |
|---|---|
| Afectación de inventarios (con tooltip) | Sí afecta / No afecta |
| Uso de impuestos y retenciones (con tooltip) | Sí / No |
| Condición de pago (con tooltip) | Crédito, Contado, Crédito / Contado |

Estos dos valores sustituyen a los switches "herramientas del prototipo" de impuestos y retenciones del listado de facturas de compra (`bold-pos:compras-settings:v1`): se migra su clave y el listado pasa a leerlos del store de Ajustes.

## 6. Reglas

- Campos con `*` son obligatorios y muestran "Este campo es requerido" en línea.
- Eliminar siempre pide confirmación. No se eliminan: el usuario administrador principal, los métodos de pago por defecto, ni el cliente por defecto del POS (el modal lo indica).
- Un rol en uso por un usuario no se elimina (aviso).
- Máximo 3 listas de precios; al llegar a 3 el botón "Crear" se oculta.
- Un método de pago deshabilitado no aparece en los selectores de pago de facturas de compra ni del checkout.

## 7. Qué se conecta con el resto del prototipo

En esta fase:
- Facturas de compra: Afectación de inventarios, Uso de impuestos y retenciones y Condición de pago por defecto leen `ajustesStore`.
- Métodos de pago habilitados: alimentan los selectores de pago de facturas de compra.
- Categorías de ítems: viven solo en `ajustesStore` (semilla con los nombres de las categorías Retail). El formulario y la lista de `/items` siguen usando las categorías del catálogo (`CAT_DEFS`); unirlos requiere refactorizar el módulo de ítems y queda para un spec aparte.
- Descuentos y Vendedores: quedan disponibles como listas para formularios futuros (cotizaciones, ventas).

Fuera de esta fase: control de turnos, vender sin existencias, órdenes/mesas, costeo y listas de precios como reglas efectivas en ventas y checkout (el valor se guarda y se muestra, sin efecto).

## 8. Datos

- Clave `localStorage`: `bold-pos:ajustes:v1` (una sola clave con todas las secciones). Para volver a los datos sembrados, borrarla.
- Archivos propuestos: `src/app/verticals/retail/ajustes/` (páginas y paneles), `ajustesStore.ts`, `types/ajustes.ts`, `data/ajustesSeed.ts`.
- Semilla: valores plausibles tomados de la estructura del real (impuestos, 8 métodos de pago por defecto, ~10 descuentos, categorías de gasto, 3 listas de precios, 12 sucursales, roles y usuarios de ejemplo), sin correos, teléfonos, llaves ni NIT reales. La fecha de referencia sigue siendo 14/07/2026 (`FECHA_PROTOTIPO`).

## 9. Preguntas abiertas

- **Numeración no electrónica:** resuelto: "Siguiente número de factura de compra" alimenta el consecutivo de las facturas nuevas (en la sucursal principal).
- **Habilitación DIAN:** los pasos 1 y 2 no se pudieron relevar (ver §2). Resuelto: se muestran completados.
- **Roles/permisos:** resuelto: el prototipo solo guarda; no restringe menús ni pantallas.

## 10. Fases

1. **Fase 1 (implementada):** `/ajustes` con la grilla, Configuración POS y Facturas de compra, `ajustesStore` y migración de `compras-settings`.
2. **Fase 2 (implementada):** paneles de lista y formulario simples: Descuentos, Métodos de pago, Categorías de gastos, Vendedores, Sucursales, Tipos de costeo, Impuestos, Integraciones, Numeración no electrónica.
3. **Fase 3 (implementada):** Perfil, Numeraciones, Habilitación DIAN, Usuarios, Lista de precios, Categorías de ítems y Roles.

## 11. Criterios de aceptación

- `npm run build` sin errores de TypeScript nuevos en los archivos tocados.
- `/ajustes` replica la grilla del real: 8 tarjetas, mismas secciones y mismo orden.
- Cada sección abre con el patrón de §3 y respeta tamaños, pie de botones y validaciones.
- Crear, editar y eliminar en cada sección persiste al recargar y se revierte borrando `bold-pos:ajustes:v1`.
- Cambiar Afectación de inventarios o Uso de impuestos y retenciones en Ajustes se refleja en Facturas de compra.
- Restaurantes no cambia ni muestra Ajustes de Retail.
