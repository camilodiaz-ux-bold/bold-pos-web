CONTEXTO: Este es el prototipo de Bold POS Restaurantes V1. Acabamos de ajustar el NavBar lateral y el TopBar. El NavBar quedó con la altura completa desde el tope de la pantalla, pero necesitamos corregir esto para que coincida con el layout real de Bold POS donde el TopBar ocupa todo el ancho de extremo a extremo y el NavBar lateral comienza debajo del TopBar.
OBJETIVO: Ajustar la altura y posición del NavBar lateral para que comience debajo del TopBar, no desde el tope de la pantalla. El TopBar debe ocupar el ancho completo de la pantalla.
NO MODIFICAR: El contenido interno del NavBar lateral incluyendo el botón de nuevo pedido, los ítems del menú, el selector de sucursal, y la información del usuario. El contenido del TopBar incluyendo el toggle de íconos Mesas/Mostrador, la información del negocio, la campana de notificaciones y el avatar. El área central de contenido. El panel lateral derecho.
CAMBIOS A REALIZAR:
Cambio 1 - TopBar full width:
El TopBar debe ocupar el 100% del ancho de la pantalla, de extremo a extremo, desde el borde izquierdo hasta el borde derecho. El TopBar debe estar posicionado en la parte superior de la pantalla con altura de 60px. El TopBar no tiene fondo, es transparente, pero funciona como una barra de navegación superior que ocupa todo el ancho.
El logo de Bold debe estar posicionado en el extremo izquierdo del TopBar con un padding izquierdo de 16px. El usuario proporcionará el asset del logo de Bold para reemplazar el actual.
El toggle de íconos Mesas/Mostrador debe estar posicionado inmediatamente después del logo con separación de 24px.
Los elementos del lado derecho del TopBar que incluyen nombre del negocio, plan, campana de notificaciones y avatar deben permanecer alineados al extremo derecho con padding derecho de 16px.
Cambio 2 - NavBar lateral debajo del TopBar:
El NavBar lateral debe comenzar inmediatamente debajo del TopBar, es decir su borde superior debe estar alineado con el borde inferior del TopBar a 60px desde el tope de la pantalla.
La altura del NavBar lateral debe ser el alto restante de la pantalla, desde los 60px donde termina el TopBar hasta el borde inferior de la pantalla. Es decir, altura igual a 100vh menos 60px del TopBar.
El NavBar lateral debe mantener su fondo blanco con border-radius de 16px solo en las esquinas superior derecha e inferior derecha. El border-radius superior derecho ahora será visible ya que el NavBar no llega hasta el tope.
El NavBar debe tener un pequeño margen superior de 8px desde el borde inferior del TopBar para crear separación visual, y un margen izquierdo de 8px desde el borde de la pantalla. Esto hará que el NavBar se vea como un panel flotante debajo del TopBar.
En estado colapsado, el NavBar mantiene el mismo comportamiento: comienza debajo del TopBar con los mismos márgenes, solo cambia su ancho de 240px a 64px.
Cambio 3 - Ajuste del área de contenido:
El área de contenido central que contiene el mapa de mesas o la grilla de productos debe comenzar a la misma altura que el NavBar, es decir debajo del TopBar. El contenido no debe quedar detrás del TopBar.
En vista Mostrador, la barra de tabs de órdenes que muestra #001, #002, #003, etc. debe estar posicionada inmediatamente debajo del TopBar, alineada con el inicio del NavBar.
En vista Mesas, la barra de zonas que muestra Salón, Terraza, Barra debe estar posicionada inmediatamente debajo del TopBar.
RESUMEN: Ajustar layout para que el TopBar ocupe el ancho completo de la pantalla de extremo a extremo. El NavBar lateral comienza debajo del TopBar con margen superior de 8px y margen izquierdo de 8px, creando un efecto de panel flotante. El área de contenido central también comienza debajo del TopBar. El usuario proporcionará el asset del logo de Bold.