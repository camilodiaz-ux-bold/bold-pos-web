CONTEXTO
Estamos en el prototipo de Bold POS Restaurantes V1 trabajando el panel lateral derecho de detalle de mesa en la Vista de Venta con Mesas. Actualmente cuando una mesa está ocupada, el panel muestra "Salón · 4 personas" pero no diferencia entre la capacidad total de la mesa y las personas que realmente están sentadas. Esta información es importante para el mesero porque una mesa de 6 puede tener solo 2 personas, y esto afecta el servicio y posibles adiciones.
OBJETIVO
Mostrar de forma clara y diferenciada la capacidad de la mesa y las personas sentadas en el panel de detalle, adaptando la información según el estado de la mesa para que el mesero tenga contexto completo en cada situación.
NO MODIFICAR
La estructura general del panel de detalle de mesa. El nombre de la mesa y badge de estado. Los botones Cambiar mesa y Cancelar y liberar. La sección de pedido con productos. El botón Enviar comanda y el cálculo de totales. La hora de apertura y tiempo en mesa para estados ocupada y cuenta solicitada.
CAMBIOS A REALIZAR
Cambio 1 - Estado Ocupada: En la línea de información debajo del nombre de mesa, mostrar "Salón · Capacidad: 4 · Personas: 3" separando claramente la capacidad máxima de la mesa y cuántas personas están actualmente. Usar el ícono de personas existente para ambos valores o diferenciar con ícono de silla para capacidad e ícono de personas para ocupación actual.
Cambio 2 - Estado Cuenta solicitada: Mismo formato que Ocupada mostrando "Zona · Capacidad: X · Personas: Y" ya que la mesa sigue con comensales esperando pagar.
Cambio 3 - Estado Disponible: Mostrar solo la capacidad de la mesa "Salón · Capacidad: 4" ya que no hay personas sentadas. No mostrar el campo de personas. Agregar texto secundario "Mesa lista para servicio" en color Black/40 #969696.
Cambio 4 - Estado Inhabilitada: Mostrar solo la capacidad "Salón · Capacidad: 4" con el texto secundario "Mesa no disponible para servicio" en color Black/40 #969696. Incluir enlace "Habilitar en Gestión de mesas" en color Blue/80 #1F2A74.
Cambio 5 - Aplicar en navegación de productos: Cuando el usuario está en el nivel de agregar productos a una mesa ocupada, el panel derecho del pedido debe mantener visible la información de "Capacidad: X · Personas: Y" en el encabezado del pedido para contexto continuo.
FORMATO VISUAL POR ESTADO
Ocupada: Mesa S09 [OCUPADA] / Salón · Capacidad: 4 · Personas: 3 / Abierta a las 06:06 p.m. / Tiempo en mesa: 17 min
Cuenta solicitada: Mesa S09 [CUENTA SOLICITADA] / Salón · Capacidad: 4 · Personas: 3 / Abierta a las 05:30 p.m. / Tiempo en mesa: 53 min
Disponible: Mesa S09 [DISPONIBLE] / Salón · Capacidad: 4 / Mesa lista para servicio
Inhabilitada: Mesa S09 [INHABILITADA] / Salón · Capacidad: 4 / Mesa no disponible para servicio / Habilitar en Gestión de mesas
RESUMEN
Diferenciar capacidad de mesa y personas sentadas en el panel de detalle para estados Ocupada y Cuenta solicitada, mostrar solo capacidad para Disponible e Inhabilitada con textos de contexto apropiados para cada estado.