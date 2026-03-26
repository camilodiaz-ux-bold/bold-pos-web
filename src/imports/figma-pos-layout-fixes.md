
PROMPT PARA FIGMA MAKE
CONTEXTO: Este es el prototipo de Bold POS Restaurantes V1. El dropdown de perfil que aparece al hacer click en el avatar tiene problemas de layout: se está superponiendo incorrectamente sobre el panel de Detalle de orden y no está bien contenido. También necesitamos cambiar el ícono de Mesas en el toggle del TopBar por un ícono de mesa con sillas como el que el usuario proporcionará como referencia.
OBJETIVO: Corregir el posicionamiento y layout del dropdown de perfil para que aparezca correctamente sin superponerse de forma incorrecta. Cambiar el ícono de Mesas por uno que muestre una mesa con sillas de restaurante.
NO MODIFICAR: El contenido interno del dropdown que incluye el avatar, nombre, Legal y privacidad, y Cerrar sesión. El NavBar lateral. El área central de contenido. El panel de Detalle de orden excepto donde se superpone el dropdown.
CAMBIOS A REALIZAR:
Cambio 1 - Corregir posicionamiento del dropdown de perfil:
El dropdown de perfil actualmente se está superponiendo de manera incorrecta sobre el panel de Detalle de orden. Necesita corregirse de la siguiente manera:
El dropdown debe aparecer como una capa flotante con z-index máximo, completamente por encima de todos los elementos de la interfaz, no parcialmente detrás de algunos elementos.
El dropdown debe estar posicionado de la siguiente forma: Su borde superior debe estar aproximadamente 8px debajo del borde inferior del avatar. Su borde derecho debe estar alineado con el borde derecho del avatar, con un margen mínimo de 16px desde el borde derecho de la ventana.
El dropdown debe tener fondo blanco sólido opaco, no transparente. Sombra pronunciada para que se vea claramente elevado sobre el contenido. Por ejemplo sombra con valores 0px 8px 24px rgba 0 0 0 0.15. Border-radius de 12px en todas las esquinas.
Agregar una pequeña flecha o triángulo apuntando hacia arriba en la parte superior del dropdown, alineado con el centro del avatar, para indicar visualmente de dónde proviene el dropdown. El triángulo debe ser del mismo color blanco que el fondo del dropdown.
El dropdown no debe empujar ni mover otros elementos de la interfaz. Debe flotar por encima de todo. Cuando esté abierto, el panel de Detalle de orden y todos los demás elementos deben permanecer en su posición original, solo visualmente cubiertos parcialmente por el dropdown si se superponen.
Cambio 2 - Cambiar ícono de Mesas en el toggle del TopBar:
Reemplazar el ícono actual de Mesas en el toggle del TopBar por un ícono que muestre claramente una mesa de restaurante con sillas.
El ícono debe representar una mesa vista de frente o en perspectiva con dos sillas a los lados, similar a la imagen de referencia que el usuario proporcionará. El diseño debe ser lineal o con relleno sólido dependiendo del asset proporcionado. Tamaño de 20px por 20px para mantener consistencia con el otro ícono del toggle.
El usuario proporcionará el asset del ícono de mesa con sillas para reemplazar el actual.
Cambio 3 - Actualizar el mismo ícono en el NavBar lateral:
En el NavBar lateral, el ítem de Mesas dentro de la sección de navegación debe usar el mismo ícono de mesa con sillas que se usa en el toggle del TopBar. Esto mantiene consistencia visual en toda la interfaz.
RESUMEN: Corregir el dropdown de perfil para que flote correctamente por encima de todos los elementos con z-index máximo, sombra pronunciada, y una pequeña flecha indicadora. Cambiar el ícono de Mesas tanto en el toggle del TopBar como en el NavBar lateral por un ícono de mesa con sillas de restaurante que el usuario proporcionará.