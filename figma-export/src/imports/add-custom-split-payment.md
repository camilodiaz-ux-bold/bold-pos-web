CONTEXTO: Este es Bold POS Restaurantes. El flujo de checkout y pago existe en dos vistas diferentes: en la vista de Mesas cuando se cobra una mesa con servicio, y en la vista de Mostrador cuando se cobra una orden de mostrador. Actualmente la sección de dividir cuenta tiene dos opciones: Partes iguales que divide el total automáticamente entre el número de personas, y Por items que permite asignar productos específicos a cada persona. Falta una tercera opción que permita al cajero ingresar montos personalizados libremente para cada persona, por ejemplo cuando un cliente dice quiero pagar $55.000 y el otro paga el resto sin necesidad de calcular partes iguales ni asignar ítems específicos.
OBJETIVO: Agregar una tercera opción de división de cuenta llamada Personalizado en ambas vistas de checkout, tanto en Mesas como en Mostrador, que permita ingresar manualmente cuánto paga cada persona con validación en tiempo real de que la suma sea igual al total de la cuenta.
NO MODIFICAR:
En vista Mesas, no modificar: El header del panel de checkout que muestra CHECKOUT, el nombre de la mesa por ejemplo Mesa S09, la zona por ejemplo Salón, y el número de personas. El botón Imprimir pre-cuenta en la esquina superior derecha. El botón X para cerrar el panel. La sección Resumen del pedido que muestra la lista de productos con cantidades y precios. Las líneas de Subtotal, IVA 19%, Propina y Total. El label ¿DIVIDIR CUENTA? con el badge que muestra el número de personas. El toggle con opciones No y Sí. El selector de Número de personas con los botones menos y más. La sección MÉTODO DE PAGO con la lista de personas y sus estados Cobrando ahora o Pendiente. Los botones de método de pago Efectivo, Tarjeta, Transferencia y Mixto. El indicador de Terminal conectada. El footer con la información de Persona, Pagadas X de Y, el monto a cobrar, el botón Cancelar y el botón Confirmar pago.
En vista Mostrador, no modificar: El header del panel de checkout que muestra CHECKOUT, el número de orden por ejemplo Orden #003. La sección de resumen de productos. Las líneas de Subtotal, IVA 19%, Propina y Total. La sección de dividir cuenta si existe. La sección de método de pago. El footer con botones Cancelar y Confirmar pago.
CAMBIOS A REALIZAR:
Cambio 1 - Agregar tercer botón de división en vista Mesas:
En la fila donde actualmente están los dos botones Partes iguales y Por items, agregar un tercer botón llamado Personalizado. Los tres botones deben redistribuirse para ocupar el ancho disponible de forma equitativa, cada botón ocupando aproximadamente el 32% del ancho con separación de 8px entre ellos.
El botón Personalizado debe tener el mismo estilo visual que Partes iguales y Por items. Cuando no está seleccionado: fondo blanco, borde de 1px color gris claro hexadecimal E5E7EB, texto color gris oscuro hexadecimal 374151, border-radius de 8px, padding vertical de 12px. Cuando está seleccionado: fondo blanco, borde de 2px color azul hexadecimal 3B82F6, texto color azul hexadecimal 3B82F6, border-radius de 8px, padding vertical de 12px.
Cambio 2 - Agregar tercer botón de división en vista Mostrador:
Aplicar exactamente el mismo cambio en el panel de checkout de la vista Mostrador. Agregar el botón Personalizado junto a Partes iguales y Por items con el mismo estilo visual y comportamiento.
Cambio 3 - Diseñar el estado seleccionado de Personalizado en vista Mesas:
Cuando el usuario selecciona la opción Personalizado en el checkout de Mesas, la sección debajo de los botones de división debe cambiar completamente para mostrar una interfaz de ingreso de montos personalizados.
Eliminar la visualización actual de cards de personas con montos fijos calculados. Reemplazar por una lista vertical de filas editables, una fila por cada persona según el número seleccionado en Número de personas.
Cada fila de persona debe contener: A la izquierda, el label Persona 1, Persona 2, Persona 3 etc. en texto color gris oscuro hexadecimal 374151, peso regular, tamaño 14px. A la derecha, un campo de input numérico para ingresar el monto.
El campo de input debe tener las siguientes características: Ancho de 140px. Altura de 44px para facilitar el tap en pantalla táctil. Fondo blanco. Borde de 1px color gris claro hexadecimal D1D5DB. Border-radius de 8px. Padding interno horizontal de 12px. Texto alineado a la derecha. Tamaño de texto 16px peso semibold color negro. Un prefijo de signo de peso $ en color gris hexadecimal 9CA3AF dentro del campo antes del valor numérico. Cuando el campo está enfocado, el borde cambia a color azul hexadecimal 3B82F6 con 2px de grosor.
El valor por defecto de cada campo de input debe ser 0, mostrándose como $0.
La separación vertical entre cada fila de persona debe ser de 12px.
Cambio 4 - Diseñar el estado seleccionado de Personalizado en vista Mostrador:
Aplicar exactamente el mismo diseño de filas editables con campos de input en el checkout de la vista Mostrador cuando se selecciona Personalizado.
Cambio 5 - Agregar fila de validación en tiempo real en ambas vistas:
Debajo de la lista de personas con sus campos de input, agregar una fila de validación con separación superior de 16px y un borde superior de 1px color gris claro hexadecimal E5E7EB para separar visualmente.
La fila de validación debe mostrar dos elementos:
A la izquierda, el texto Total asignado: seguido de la suma de todos los montos ingresados en los campos de input, formateado como moneda colombiana con signo de peso y separadores de miles, por ejemplo Total asignado: $95.557. El texto debe ser tamaño 14px color gris oscuro hexadecimal 374151.
A la derecha, el indicador de estado de validación que cambia según la situación:
Si la suma de los montos ingresados es MENOR que el total de la cuenta: Mostrar el texto Falta: seguido del monto faltante. El color debe ser rojo hexadecimal EF4444. Incluir un icono de alerta o warning pequeño antes del texto. Por ejemplo: icono de alerta, Falta: $25.000.
Si la suma de los montos ingresados es MAYOR que el total de la cuenta: Mostrar el texto Excede: seguido del monto excedente. El color debe ser rojo hexadecimal EF4444. Incluir un icono de alerta o warning pequeño antes del texto. Por ejemplo: icono de alerta, Excede: $5.000.
Si la suma de los montos ingresados es EXACTAMENTE IGUAL al total de la cuenta: Mostrar el texto Correcto con un icono de check circular antes del texto. El color debe ser verde hexadecimal 10B981. Por ejemplo: icono de check verde, Correcto.
Esta fila de validación debe aparecer en ambas vistas, Mesas y Mostrador, cuando la opción Personalizado está seleccionada.
Cambio 6 - Comportamiento del botón Confirmar pago según validación en ambas vistas:
El botón Confirmar pago en el footer del checkout debe cambiar su estado según la validación de montos cuando la opción Personalizado está activa.
Cuando la validación muestra Falta o Excede, es decir la suma no es igual al total: El botón Confirmar pago debe estar deshabilitado. Aplicar opacidad del 50% al botón completo. El cursor debe mostrar not-allowed. El botón no debe ser clickeable ni responder a hover. El texto del botón se mantiene igual pero con la opacidad reducida.
Cuando la validación muestra Correcto, es decir la suma es igual al total: El botón Confirmar pago se habilita completamente. Opacidad del 100%. El botón es clickeable y responde a hover con su estado normal. El fondo rojo Bold hexadecimal E63946 se muestra completo.
Este comportamiento debe aplicar en ambas vistas, Mesas y Mostrador.
Cambio 7 - Datos de ejemplo para vista Mesas:
Para ilustrar el estado Personalizado en la vista de Mesas, usar los siguientes datos de ejemplo:
Mesa S09, Salón, 4 personas. Total de la cuenta $230.000 incluyendo propina. Número de personas para dividir: 3.
Persona 1: Campo de input mostrando $80.000.
Persona 2: Campo de input mostrando $100.000.
Persona 3: Campo de input mostrando $50.000.
Total asignado: $230.000. Estado de validación: Correcto con check verde.
Botón Confirmar pago habilitado al 100%.
Cambio 8 - Datos de ejemplo para vista Mostrador:
Para ilustrar el estado Personalizado en la vista de Mostrador, usar los siguientes datos de ejemplo:
Orden #003. Total de la cuenta $150.000 incluyendo propina. Número de personas para dividir: 2.
Persona 1: Campo de input mostrando $90.000.
Persona 2: Campo de input mostrando $45.000.
Total asignado: $135.000. Estado de validación: Falta: $15.000 con icono de alerta en rojo.
Botón Confirmar pago deshabilitado al 50% de opacidad.
Cambio 9 - Transición entre opciones de división:
Cuando el usuario cambia de una opción de división a otra, por ejemplo de Partes iguales a Personalizado o de Personalizado a Por items, el contenido de la sección debe actualizarse inmediatamente mostrando la interfaz correspondiente a la opción seleccionada.
Si el usuario tenía montos ingresados en Personalizado y cambia a Partes iguales, los montos personalizados se pierden y se muestran los montos calculados automáticamente.
Si el usuario estaba en Partes iguales y cambia a Personalizado, los campos de input se muestran con el valor por defecto de $0, no con los valores de partes iguales precargados.
Este comportamiento aplica en ambas vistas, Mesas y Mostrador.
RESUMEN: Agregar botón Personalizado como tercera opción de división de cuenta junto a Partes iguales y Por items en ambas vistas Mesas y Mostrador. Cuando está seleccionado, mostrar campos de input editables para cada persona permitiendo ingresar montos libres. Incluir fila de validación en tiempo real que indica si la suma de montos es correcta, falta dinero o excede el total. Deshabilitar botón Confirmar pago al 50% de opacidad hasta que la suma sea exactamente igual al total de la cuenta. Aplicar todos los cambios de forma consistente en checkout de Mesas y checkout de Mostrador.