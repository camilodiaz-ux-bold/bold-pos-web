CONTEXTO: Este es el Onboarding de Bold POS Restaurantes V1. Necesitamos agregar dos elementos: una card en la pantalla final para descargar la App Bold POS que abre un modal con QRs, y una nueva pregunta sobre cantidad de empleados dentro del flujo. El usuario adjuntará el modal de descarga para recrearlo exactamente igual.
OBJETIVO: Agregar card de descarga de app en pantalla final con su modal, y agregar nueva pantalla de pregunta sobre empleados en el Checkpoint 2.
NO MODIFICAR: Los checkpoints y pasos existentes excepto donde se indique. Los estilos y componentes ya establecidos.
CAMBIOS A REALIZAR:
Cambio 1 - Agregar card de descarga en pantalla final:
En la pantalla final del Onboarding donde está el video, agregar una card debajo del video o del contenido principal.
La card debe tener:
Ícono de celular o app a la izquierda.
Título Descarga la App Bold POS en texto peso semibold.
Descripción Escanea el QR y gestiona tu negocio desde el celular en texto gris más pequeño.
Flecha o chevron a la derecha indicando que es clickeable.
Fondo blanco o crema claro, border-radius, padding interno adecuado.
Al hacer click en la card, debe abrir un modal.
Cambio 2 - Crear modal de descarga de app:
El modal debe recrearse exactamente igual al que el usuario adjuntará como referencia.
Estructura del modal:
Header con título Descarga la App Bold POS centrado y botón X para cerrar a la derecha.
Contenido principal con dos códigos QR lado a lado, uno para App Store y otro para Google Play. Los QRs están dentro de un contenedor con fondo crema o gris claro.
Debajo de cada QR, los badges oficiales de Download on the App Store y Disponible en Google Play.
Texto descriptivo debajo Escanea el QR y gestiona tu negocio desde el celular.
Sección inferior con tres cards pequeñas en fila horizontal mostrando beneficios de la app:
Card 1: Ícono de gráfica, título Tus ventas del día, descripción Recibe tu cierre diario automáticamente al final del día en tu celular.
Card 2: Ícono de factura, título Vende y factura, descripción Gestiona las ventas de tu negocio desde cualquier lugar.
Card 3: Ícono de dinero, título Flujo de caja, descripción Conoce tus ingresos y gastos de 1 o más tiendas en tiempo real.
Botón Entendido centrado en la parte inferior del modal para cerrar.
El modal debe tener overlay oscuro de fondo, centrado en pantalla, border-radius, sombra elevada.
Cambio 3 - Agregar pantalla de cantidad de empleados:
Crear una nueva pantalla dentro del Checkpoint 2 como Paso 2.3, después de Datos de tu restaurante.
La pantalla debe seguir exactamente el estilo del Onboarding con header, fondo gradiente, y footer con barra de progreso.
Contenido centrado:
Título ¿Cuántos empleados tiene tu negocio? en el estilo de títulos del Onboarding.
Subtítulo Elige una opción en texto gris.
Lista vertical de 4 opciones tipo pill con selección única, usando el mismo estilo de las opciones de tipo de restaurante:
Opción 1: De 0 a 10 empleados
Opción 2: De 11 a 25 empleados
Opción 3: De 26 a 100 empleados
Opción 4: 100 o más empleados
Cada opción tiene radio button circular a la derecha.
Estado default con fondo claro y texto oscuro.
Estado seleccionado con borde de color y texto de color, radio button lleno.
Footer con link Atrás a la izquierda, barra de progreso actualizada, botón Continuar a la derecha.
Cambio 4 - Ajustar barra de progreso:
La barra de progreso del Checkpoint 2 ahora tiene 3 pasos internos en lugar de 2.
Verificar que la navegación conecte correctamente:
Paso 2.2 Datos de tu restaurante, botón Continuar lleva a Paso 2.3.
Paso 2.3 Cuántos empleados, botón Continuar lleva a Checkpoint 3.
Paso 2.3 Cuántos empleados, botón Atrás lleva a Paso 2.2.
RESUMEN: Agregar card de descarga de app en la pantalla final que abre un modal con QRs de App Store y Google Play, badges, beneficios y botón Entendido, recreando exactamente el diseño que el usuario adjuntará. Agregar nueva pantalla Paso 2.3 ¿Cuántos empleados tiene tu negocio? con 4 rangos de opciones tipo pill dentro del Checkpoint 2, usando el mismo estilo de UI del Onboarding existente.