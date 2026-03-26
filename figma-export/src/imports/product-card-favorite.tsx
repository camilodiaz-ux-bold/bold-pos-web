CONTEXTO

Bold POS Restaurantes V1. Ajuste en las cards de productos en Vista Grid (con imágenes). Necesitamos agregar la funcionalidad de marcar/desmarcar favoritos directamente desde cada card.

OBJETIVO

Agregar icono de estrella en cada card de producto para marcar o desmarcar como favorito con un tap.

NO MODIFICAR

Vista Mesas (mapa), Gestionar Mesas, Vista Categorías (drill-down con colores), sidebar de categorías, modal de producto, flujo de checkout, navegación principal, panel Detalle de orden. Solo ajustar las cards de productos en Vista Grid.

CAMBIOS A REALIZAR

Cambio 1 - Agregar icono estrella en cada card: En todas las cards de productos de la Vista Grid, agregar un icono de estrella en la esquina superior derecha de la imagen (o de la card). Posición: sobre la imagen, esquina superior derecha con un pequeño padding.

Cambio 2 - Estados del icono estrella: Estado desmarcado (no favorito): estrella con borde/outline, sin relleno, color gris o blanco con sombra sutil para visibilidad sobre la imagen. Estado marcado (favorito): estrella con relleno sólido, color amarillo/dorado (#FBBF24) o azul Bold.

Cambio 3 - Interacción: Click o tap en la estrella marca/desmarca el producto como favorito. Esta acción NO abre el modal de producto (solo el click en el resto de la card abre el modal). La estrella es un touch target independiente.

Cambio 4 - Aplicar en ambas vistas: Vista Grid en Mostrador y Vista Grid en Mesas (agregar productos a mesa).

CARD DE PRODUCTO ACTUAL

[Imagen]
[+ icono agregar]
$Precio
Nombre producto
CATEGORÍA

CARD DE PRODUCTO DESPUÉS DEL CAMBIO

[Imagen -------- ☆] ← estrella en esquina superior derecha
[+ icono agregar]
$Precio
Nombre producto
CATEGORÍA

ESTADOS VISUALES DE LA ESTRELLA

No favorito: ☆ (outline, gris/blanco)
Favorito: ★ (relleno, amarillo #FBBF24)

COMPORTAMIENTO

Tap en estrella → toggle estado favorito (no abre modal)
Tap en resto de card → abre modal de producto

RESUMEN

Agregar icono estrella en esquina superior derecha de cada card en Vista Grid. Tap en estrella marca/desmarca favorito sin abrir modal. Aplicar en Mostrador y Mesas. No tocar Vista Categorías (drill-down).