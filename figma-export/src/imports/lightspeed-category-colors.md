Perfecto, vamos con el modelo LightSpeed. Aquí está el prompt:

CONTEXTO

Bold POS Restaurantes V1. Iteración sobre Vista Categorías en Mostrador y Mesas. Ya tenemos layout de dos columnas con sidebar de categorías y productos a la derecha. Ahora queremos implementar lógica de colores estilo LightSpeed donde los productos heredan el color de su categoría.

OBJETIVO

Implementar sistema de colores unificado donde productos heredan color de su categoría. Mejorar legibilidad, contraste y espaciados para lectura rápida en operación.

NO MODIFICAR

Vista Mesas (mapa de mesas), Gestionar Mesas (configuración), flujo de Checkout, navegación principal, barra de tabs de órdenes, Vista Grid con fotos, arquitectura general. Solo ajustes visuales en Vista Categorías.

CAMBIOS A REALIZAR

Cambio 1 - Productos heredan color de categoría: En Vista Categorías, cada producto tiene fondo con el color de su categoría. Productos de Entradas Frías tienen fondo azul, productos de Carnes tienen fondo rojo, etc. Usar tonos suaves/pastel del color (20-30% opacidad o tinte claro) para que el texto sea legible.

Cambio 2 - Contraste y legibilidad: Nombre del producto en texto oscuro (negro o gris muy oscuro #1F2937) sobre fondo de color claro. Precio en el color sólido de la categoría (más saturado). Tamaño de fuente grande para nombre (18-20px), precio secundario (14-16px). Alto contraste para lectura rápida.

Cambio 3 - Espaciado unificado: Espaciado entre categorías en sidebar igual al espaciado entre productos en el grid. Gap consistente de 12-16px entre elementos. Padding interno de categorías y productos similar.

Cambio 4 - Sidebar de categorías: Estado selected: color sólido 100% con texto blanco. Estado default: color al 40-50% opacidad con texto oscuro. Mismo espaciado que el grid de productos.

Cambio 5 - Eliminar indicador redundante: Quitar el dot de color y texto "● Entradas Frías - 8 productos" arriba del grid. Ya no es necesario porque los productos tienen el color de la categoría y el sidebar indica cuál está seleccionada.

SISTEMA DE COLORES UNIFICADO

Entradas Frías: Categoría #3B82F6 (azul), Productos fondo #DBEAFE (azul claro), Precio #2563EB (azul oscuro)

Entradas Calientes: Categoría #F97316 (naranja), Productos fondo #FFEDD5 (naranja claro), Precio #EA580C (naranja oscuro)

Pastas & Risottos: Categoría #EAB308 (amarillo), Productos fondo #FEF9C3 (amarillo claro), Precio #CA8A04 (amarillo oscuro)

Carnes: Categoría #EF4444 (rojo), Productos fondo #FEE2E2 (rojo claro), Precio #DC2626 (rojo oscuro)

Pescados: Categoría #0EA5E9 (celeste), Productos fondo #E0F2FE (celeste claro), Precio #0284C7 (celeste oscuro)

Postres: Categoría #EC4899 (rosa), Productos fondo #FCE7F3 (rosa claro), Precio #DB2777 (rosa oscuro)

Bebidas: Categoría #10B981 (verde), Productos fondo #D1FAE5 (verde claro), Precio #059669 (verde oscuro)

EJEMPLO VISUAL

Producto "Carpaccio de Wagyu" en categoría Entradas Frías: Fondo #DBEAFE (azul claro), Nombre "Carpaccio de Wagyu" en #1F2937 (gris oscuro), Precio "$112.000" en #2563EB (azul).

APLICAR EN

Vista Categorías en Mostrador y Vista Categorías en Mesas (agregar productos a mesa). Vista Grid con fotos NO cambia.

RESUMEN

Productos heredan color de su categoría (fondo claro). Texto oscuro sobre fondo claro para contraste. Precio en color saturado de la categoría. Espaciados unificados entre sidebar y grid. Sistema de 3 tonos por categoría (sólido, claro, oscuro).