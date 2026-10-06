CONTEXTO: Este es el sistema Bold POS Restaurantes. Necesitamos diseñar un modal de preview que simula cómo se verá el ticket impreso de comanda de cocina. Este modal aparece cuando el usuario presiona Enviar comanda y sirve como confirmación antes de enviar e imprimir. El ticket tiene el formato típico de impresora térmica de 80mm de ancho.
OBJETIVO: Crear un modal de confirmación con preview del ticket de comanda de cocina que muestre exactamente cómo saldrá impreso, con todos los datos relevantes para que cocina prepare los platos.
NO MODIFICAR: El panel lateral de Detalle de orden o Pedido Mesa. El mapa de mesas. La grilla de productos. Los botones de acción existentes. El header de la aplicación.
CAMBIOS A REALIZAR:
Crear un modal centrado en pantalla con fondo overlay oscuro semitransparente en color negro al 50% de opacidad. El modal debe tener fondo blanco, border-radius de 12px, y sombra elevada. El ancho del modal debe ser de 400px.
En la parte superior del modal, incluir un header con el título Enviar comanda a cocina en texto negro peso semibold tamaño 18px, alineado a la izquierda. A la derecha del título, un botón de cerrar con icono X en color gris.
Debajo del header, incluir un texto descriptivo que diga Se imprimirá el siguiente ticket en cocina en color gris tamaño 14px.
El preview del ticket debe estar contenido en un rectángulo centrado dentro del modal que simula el papel térmico. Este rectángulo debe tener fondo color crema muy claro hexadecimal F9F7F4, borde de 1px en color gris claro hexadecimal E5E5E5, y una sombra sutil interior que simule el papel. El ancho del ticket debe ser de 280px para simular el papel de 80mm a escala.
Contenido del ticket de comanda de cocina de arriba hacia abajo:
Línea 1: Texto COMANDA DE COCINA centrado, en mayúsculas, peso bold, tamaño 14px, color negro.
Línea 2: Una línea de separación usando caracteres de igual, por ejemplo veinte signos de igual centrados.
Línea 3: A la izquierda el texto Mesa: seguido del número de mesa por ejemplo S07. A la derecha la hora por ejemplo 11:22 p.m. Ambos en tamaño 12px color negro.
Línea 4: Texto Mesero: seguido de las iniciales del mesero por ejemplo RA. Alineado a la izquierda, tamaño 12px color negro.
Línea 5: Texto Personas: seguido del número por ejemplo 2. Alineado a la izquierda, tamaño 12px color negro.
Línea 6: Una línea de separación usando guiones, por ejemplo veinte guiones centrados.
Línea 7 en adelante: Lista de productos. Cada producto ocupa dos líneas. La primera línea muestra la cantidad seguida de dos espacios y el nombre del producto, por ejemplo 2 Ceviche de Corvina Real en tamaño 12px peso semibold. La segunda línea muestra la nota del producto si existe, indentada con cuatro espacios y precedida por una flecha, por ejemplo cuatro espacios flecha Sin ají, en tamaño 11px color gris oscuro.
Después de listar todos los productos, otra línea de separación con guiones.
Línea final: Texto Enviado: seguido de la fecha y hora actual por ejemplo 03 Mar 2026 11:22 p.m. Centrado, tamaño 11px color gris.
Debajo del preview del ticket, dentro del modal pero fuera del rectángulo del ticket, incluir dos botones de acción.
Botón secundario a la izquierda con texto Cancelar, estilo outline con borde gris, fondo transparente, texto gris oscuro, ancho del 48% del espacio disponible.
Botón primario a la derecha con texto Enviar e imprimir con un icono de impresora a la izquierda del texto, fondo rojo Bold hexadecimal E63946, texto blanco, ancho del 48% del espacio disponible.
Los datos de ejemplo para el ticket deben ser: Mesa S07, Mesero RA, 2 personas, productos: 1 Solomillo Wellington, 2 Ceviche de Corvina Real con nota Sin ají, 1 Risotto de Trufa Blanca.
RESUMEN: Modal de confirmación de envío de comanda con preview de ticket térmico simulado mostrando mesa, mesero, personas, lista de productos con notas, y botones para cancelar o enviar e imprimir.