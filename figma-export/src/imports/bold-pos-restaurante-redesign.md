CONTEXTO: Este es el prototipo de Bold POS Restaurantes V1. Actualmente tiene un TopBar con toggle de texto Mesas/Mostrador y un NavBar lateral simplificado con solo íconos genéricos. Necesitamos alinear la navegación al layout real de Bold POS que tiene un NavBar colapsable con dos estados y un TopBar con información del negocio. El toggle Mesas/Mostrador se mantiene en el TopBar pero cambia de texto a solo íconos para ser más compacto.
OBJETIVO: Rediseñar el NavBar lateral y el TopBar del prototipo de Restaurantes para que coincida con el layout y comportamiento del Bold POS actual, manteniendo el toggle de navegación entre Mesas y Mostrador en el TopBar pero usando solo íconos en lugar de texto.
NO MODIFICAR: El contenido del área central donde se muestra el mapa de mesas o la grilla de productos. El panel lateral derecho de detalle de mesa o detalle de orden. Los estados de las mesas y sus cards. Las tabs de órdenes en vista Mostrador. El checkout y sus flujos. Los modales existentes.
CAMBIOS A REALIZAR:
Cambio 1 - Rediseño del TopBar:
El TopBar no debe tener fondo, es transparente, permitiendo que se vea el fondo general de la aplicación. Altura de 60px.
En el extremo izquierdo, el logo de Bold en color azul oscuro hexadecimal 0F1729, con el diseño de letras "bold" donde la "o" tiene el punto rojo característico de la marca.
Inmediatamente después del logo, con separación de 24px, ubicar el toggle de navegación entre Mesas y Mostrador. Este toggle debe ser un segmented control compacto con solo íconos, sin texto.
El toggle debe tener las siguientes características: Fondo gris muy claro hexadecimal F3F4F6 como contenedor, border-radius de 8px, padding de 4px. Dentro del contenedor, dos botones de ícono uno al lado del otro.
El primer botón es para Mesas, usando un ícono que represente un layout de mesas o una mesa vista desde arriba, tamaño del ícono 20px.
El segundo botón es para Mostrador, usando un ícono que represente un ticket, recibo, o punto de venta, tamaño del ícono 20px.
Cada botón de ícono debe tener padding de 8px. El botón activo debe tener fondo blanco, sombra sutil, border-radius de 6px, y el ícono en color azul oscuro hexadecimal 0F1729. El botón inactivo debe tener fondo transparente, sin sombra, y el ícono en color gris hexadecimal 9CA3AF.
Cuando el usuario hace click en el botón inactivo, este se vuelve activo y el otro pasa a inactivo, cambiando la vista entre Mesas y Mostrador.
En el extremo derecho del TopBar, mostrar una fila horizontal con los siguientes elementos de derecha a izquierda con separación de 16px entre cada uno:
Primero el avatar circular del usuario con fondo azul oscuro hexadecimal 0F1729, diámetro de 40px, mostrando las iniciales del usuario en blanco por ejemplo RA.
Segundo un ícono de campana para notificaciones, color gris hexadecimal 6B7280, tamaño 24px, clickeable.
Tercero la información del negocio mostrando el nombre del comercio por ejemplo Restaurante Demo seguido de un guión y el plan por ejemplo Plan Plus. El nombre del comercio en color azul oscuro hexadecimal 0F1729 peso semibold tamaño 14px. El texto del plan en color gris hexadecimal 6B7280 peso regular tamaño 14px.
Cambio 2 - Rediseño del NavBar lateral estructura general:
El NavBar lateral debe tener fondo blanco con border-radius de 16px en las esquinas superior derecha e inferior derecha, y sombra sutil. Debe estar separado del borde izquierdo de la pantalla por 0px, es decir pegado al borde izquierdo pero con el border-radius visible en el lado derecho.
El NavBar tiene dos estados: expandido con ancho de 240px y colapsado con ancho de 64px.
Cambio 3 - NavBar lateral en estado expandido:
En la parte superior del NavBar expandido, crear un header con padding de 16px que contenga:
Primera línea con el nombre completo del usuario por ejemplo Ramiro Ramos en color azul oscuro hexadecimal 0F1729, peso semibold, tamaño 14px. A la derecha de esta línea, un botón para colapsar el menú representado por un ícono de corchete angular apuntando a la izquierda, color gris hexadecimal 6B7280, tamaño 20px, clickeable.
Segunda línea con el rol del usuario por ejemplo Administrador en color gris hexadecimal 6B7280, peso regular, tamaño 12px.
Debajo del header con separación de 16px, agregar un selector de sucursal con padding horizontal de 16px. El selector debe tener fondo gris muy claro hexadecimal F3F4F6, border-radius de 8px, padding vertical de 10px y horizontal de 12px, y mostrar un ícono de ubicación o local a la izquierda en color gris, seguido del nombre de la sucursal por ejemplo Sede Centro en color azul oscuro peso medium tamaño 13px, y un ícono de flecha hacia abajo a la derecha indicando que es un dropdown desplegable.
Debajo del selector de sucursal con separación de 16px, agregar un botón de acción primaria con padding horizontal de 16px. El botón debe ocupar el ancho disponible, tener fondo rojo Bold hexadecimal E63946, texto blanco, border-radius de 8px, padding vertical de 12px, ícono de más a la izquierda del texto con tamaño 18px, y el texto Nuevo pedido en peso semibold tamaño 14px centrado.
Debajo del botón con separación de 24px, mostrar el menú de navegación con los siguientes ítems:
Ítem HOME: Ícono de casa a la izquierda tamaño 20px, texto HOME en mayúsculas color gris oscuro hexadecimal 374151 peso medium tamaño 13px, sin submenú. Padding vertical de 12px, padding horizontal de 16px.
Ítem OPERACIÓN: Ícono de caja registradora o punto de venta a la izquierda tamaño 20px, texto OPERACIÓN en mayúsculas, flecha hacia abajo a la derecha indicando submenú expandible. Al expandir mostrar subítems indentados 40px desde la izquierda con padding vertical de 10px:

Subítem Mesas con ícono de layout de mesas pequeño
Subítem Mostrador con ícono de ticket pequeño
Subítem Turnos con ícono de reloj pequeño

Ítem COCINA: Ícono de campana de servicio a la izquierda, texto COCINA en mayúsculas, flecha expandible. Al expandir mostrar:

Subítem Comandas con ícono de lista

Ítem CATÁLOGO: Ícono de etiqueta a la izquierda, texto CATÁLOGO en mayúsculas, flecha expandible. Al expandir mostrar:

Subítem Productos
Subítem Categorías

Ítem Reportes: Ícono de gráfica de barras a la izquierda, texto Reportes sin mayúsculas, sin submenú.
Ítem Ajustes: Ícono de engranaje a la izquierda, texto Ajustes, sin submenú. Este ítem debe posicionarse en la parte inferior del NavBar, separado visualmente del resto con un espacio o línea divisoria sutil.
Estados de los ítems del menú: Default con ícono y texto en gris oscuro. Hover con fondo gris muy claro hexadecimal F9FAFB. Activo con fondo azul muy claro hexadecimal EFF6FF, ícono y texto en azul hexadecimal 3B82F6, y línea vertical de 3px en azul en el borde izquierdo del ítem.
Cambio 4 - NavBar lateral en estado colapsado:
Ancho de 64px, mismo fondo blanco con border-radius y sombra.
En la parte superior, mostrar el botón para expandir con ícono de corchete angular apuntando a la derecha, centrado horizontalmente, padding vertical de 20px.
Debajo, el botón de acción primaria reducido a un círculo rojo de 44px de diámetro con el ícono de más en blanco centrado.
Debajo, los íconos del menú apilados verticalmente, cada uno centrado horizontalmente dentro del ancho de 64px, con padding vertical de 14px entre cada uno:

Ícono casa para HOME
Ícono caja para OPERACIÓN
Ícono campana de servicio para COCINA
Ícono etiqueta para CATÁLOGO
Ícono gráfica para Reportes

En la parte inferior, ícono de engranaje para Ajustes.
El ícono del ítem activo debe mostrarse en color azul hexadecimal 3B82F6 con un indicador visual como un punto o línea.
Cuando el usuario hace hover sobre un ícono en estado colapsado, mostrar un tooltip flyout a la derecha con fondo blanco, sombra media, border-radius de 8px, padding de 12px, mostrando el nombre del ítem y sus subítems si los tiene como lista clickeable.
Cambio 5 - Aplicar en ambas vistas Mesas y Mostrador:
El TopBar con el toggle de íconos debe aparecer idéntico tanto en la vista de Mesas como en la vista de Mostrador. Cuando el usuario está en Mesas, el primer ícono del toggle (mesas) debe mostrarse activo. Cuando está en Mostrador, el segundo ícono (ticket) debe mostrarse activo.
El NavBar lateral con sus dos estados expandido y colapsado debe funcionar igual en ambas vistas.
Cuando el usuario está en vista Mesas, el ítem OPERACIÓN del NavBar debe estar expandido y el subítem Mesas debe mostrarse como activo.
Cuando el usuario está en vista Mostrador, el ítem OPERACIÓN del NavBar debe estar expandido y el subítem Mostrador debe mostrarse como activo.
Cambio 6 - Datos de ejemplo:
Nombre usuario: Ramiro Ramos
Rol: Administrador
Sucursal: Sede Centro
Nombre comercio: Restaurante Demo
Plan: Plan Plus
Iniciales avatar: RA
RESUMEN: Rediseñar TopBar sin fondo manteniendo toggle Mesas/Mostrador pero cambiándolo de texto a solo íconos en un segmented control compacto después del logo, agregar info del negocio y avatar a la derecha. Rediseñar NavBar lateral con fondo blanco y border-radius, dos estados expandido 240px y colapsado 64px, header con usuario y rol, selector de sucursal, botón Nuevo pedido, menú jerárquico con HOME, OPERACIÓN con subítems Mesas Mostrador Turnos, COCINA con Comandas, CATÁLOGO con Productos y Categorías, Reportes y Ajustes. Hover en estado colapsado muestra tooltip flyout. Aplicar consistentemente en ambas vistas.