
PROMPT PARA FIGMA MAKE - SIMPLIFICAR MAPA DE MESAS Y COLORES
CONTEXTO: Este es Bold POS Restaurantes V1. En la vista de venta con mesas, el mapa muestra las mesas con tags de estado dentro de cada mesa (Disponible, Ocupada, Cuenta solicitada) y las convenciones en la parte inferior son muy pequeñas. Necesitamos simplificar la visualización de las mesas y mejorar las convenciones usando los colores oficiales de Bold.
OBJETIVO: Simplificar la información mostrada en cada mesa eliminando los tags de estado, mejorar las convenciones de la parte inferior con mayor altura y formato de tags, y usar los colores oficiales de Bold para cada estado.
NO MODIFICAR: La vista de Gestionar mesas, los cambios solo aplican a la vista de venta con mesas. La estructura del panel lateral derecho de detalle de mesa. Los tabs de zonas (Salón, Terraza, Barra). El botón Gestionar mesas.
CAMBIOS A REALIZAR:
Cambio 1 - Simplificar información en cada mesa:
Eliminar el tag de estado (Disponible, Ocupada, Cuenta solicitada) que aparece dentro de cada mesa.
El estado de la mesa se debe identificar únicamente por el color de fondo de la mesa, no por un tag de texto.
La información que se mantiene en cada mesa:
Número de mesa (S01, S02, etc.) como identificador principal.
Ícono de personas con cantidad de comensales si la mesa está ocupada.
Ícono de reloj con tiempo en mesa si la mesa está ocupada.
Monto total del pedido si la mesa está ocupada.
Las mesas disponibles solo muestran el número de mesa y la capacidad de personas.
Cambio 2 - Actualizar colores de estados con paleta Bold:
Usar los colores oficiales de Bold para cada estado de mesa:
Estado Disponible: Color verde Success de Bold. Fondo de mesa hexadecimal F4FDF9 que es Success/10. Borde o acento hexadecimal 1B8959 que es Success/150.
Estado Ocupada: Color coral de Bold. Fondo de mesa hexadecimal FEF1F3 que es Coral/10. Borde o acento hexadecimal FF2947 que es Coral/100.
Estado Cuenta solicitada: Color amarillo Warning de Bold. Fondo de mesa hexadecimal FFF3D1 que es Warning/10. Borde o acento hexadecimal FFC217 que es Warning/100.
Los colores deben aplicarse de forma sutil como fondo de la mesa con un borde más saturado del mismo tono para diferenciar claramente cada estado.
Cambio 3 - Mejorar convenciones en la parte inferior:
Ampliar la altura de la barra de convenciones en la parte inferior del mapa para que tenga más presencia visual. La altura actual es muy pequeña, aumentar a aproximadamente 48px o 56px.
Cambiar el formato de las convenciones de puntos con texto a formato de tags:
Cada convención debe ser un tag con fondo del color del estado y texto del nombre del estado.
Tag Disponible: Fondo verde claro hexadecimal F4FDF9, borde verde hexadecimal 1B8959, texto verde oscuro hexadecimal 0B3B26.
Tag Ocupada: Fondo coral claro hexadecimal FEF1F3, borde coral hexadecimal FF2947, texto coral oscuro hexadecimal E4102E.
Tag Cuenta solicitada: Fondo amarillo claro hexadecimal FFF3D1, borde amarillo hexadecimal FFC217, texto amarillo oscuro hexadecimal 5B3100.
Los tags deben tener padding horizontal de 12px, padding vertical de 6px, border-radius de 6px, y separación entre ellos de 16px.
Cambio 4 - Ajustar conteo de mesas:
El conteo de mesas disponibles y activas en la parte inferior derecha debe mantener el formato pero usar los colores actualizados.
Disponibles: Punto verde hexadecimal 1B8959 seguido del número.
Activas: Punto coral hexadecimal FF2947 seguido del número. Activas incluye ocupadas y cuenta solicitada.
Cambio 5 - Aplicar solo en vista de venta:
Todos estos cambios aplican únicamente a la vista de venta con mesas, que es la vista operativa donde el mesero o cajero ve el mapa para gestionar pedidos.
La vista de Gestionar mesas que se accede desde el botón superior derecho debe mantener su diseño actual con los tags dentro de cada mesa, ya que es una vista de configuración donde se necesita ver claramente el estado de cada mesa.
RESUMEN: Simplificar las mesas eliminando los tags de estado internos y usando solo el color de fondo para identificar el estado. Actualizar colores a la paleta oficial de Bold con verde Success para disponible, coral para ocupada, y amarillo Warning para cuenta solicitada. Ampliar la barra de convenciones inferior y cambiar a formato de tags con los colores correspondientes. Aplicar cambios solo en la vista de venta con mesas, no en gestionar mesas.