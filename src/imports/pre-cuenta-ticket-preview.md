CONTEXTO: Este es el modal de preview de pre-cuenta en Bold POS Restaurantes. Actualmente el contenido del modal se muestra con un diseño de interfaz de usuario normal con fondo blanco, header oscuro, y tipografía de sistema. Necesitamos que el preview simule cómo se verá el ticket impreso real, usando el mismo formato de tirilla de impresora térmica que usamos en el preview de comanda de cocina.
OBJETIVO: Rediseñar el contenido del modal de pre-cuenta para que simule visualmente un ticket de impresora térmica de 80mm, con tipografía monoespaciada y formato de tirilla, manteniendo el banner informativo en la parte superior.
NO MODIFICAR: El banner informativo gris en la parte superior que dice Este preview es solo ilustrativo. El overlay oscuro del fondo. Los botones Cerrar e Imprimir en la parte inferior del modal. El ancho general del modal.
CAMBIOS A REALIZAR:
Eliminar el header oscuro con fondo negro que dice PRE-CUENTA y Mesa S09 Salón. Ese estilo de header no corresponde a cómo se ve un ticket impreso.
Reemplazar todo el contenido del modal por un rectángulo que simula el papel térmico. Este rectángulo debe tener fondo color crema muy claro hexadecimal F9F7F4, borde de 1px en color gris claro hexadecimal E5E5E5, sombra sutil interior que simule el papel, y ancho de 280px centrado dentro del modal para simular el papel de 80mm a escala.
El contenido del ticket de pre-cuenta debe usar tipografía monoespaciada estilo Courier o similar para simular la impresión térmica. Todo el texto debe ser color negro o gris oscuro.
Contenido del ticket de arriba hacia abajo:
Línea 1: Nombre del restaurante por ejemplo RESTAURANTE DEMO centrado, mayúsculas, peso bold, tamaño 13px.
Línea 2: Dirección del restaurante por ejemplo Calle 85 No. 11-53 Bogotá centrado, tamaño 10px, color gris.
Línea 3: Espacio en blanco de 8px.
Línea 4: Una línea de separación usando veinte signos de igual centrados.
Línea 5: Texto PRE-CUENTA centrado, mayúsculas, peso bold, tamaño 12px.
Línea 6: Una línea de separación usando veinte signos de igual centrados.
Línea 7: Espacio en blanco de 6px.
Línea 8: A la izquierda texto Mesa: seguido del número de mesa por ejemplo S09. A la derecha texto Salón. Tamaño 11px.
Línea 9: A la izquierda texto Personas: seguido del número por ejemplo 4. A la derecha la hora de apertura por ejemplo 12:04 a.m. Tamaño 11px.
Línea 10: Texto Fecha: seguido de la fecha actual por ejemplo 04 Mar 2026. Alineado a la izquierda, tamaño 11px.
Línea 11: Una línea de separación usando veinte guiones centrados.
Línea 12: Encabezado de columnas con texto Cant a la izquierda en ancho fijo de 35px, texto Descripción en el centro, texto Valor a la derecha. Tamaño 10px, peso semibold.
Línea 13: Una línea de separación usando veinte guiones centrados.
Líneas de productos: Cada producto en una línea mostrando la cantidad alineada a la izquierda en ancho fijo de 35px, nombre del producto en el centro ocupando el espacio disponible con texto truncado si es muy largo, y precio alineado a la derecha. Tamaño 11px. Por ejemplo: 1 seguido de espacios, Costillas BBQ, seguido de espacios, $48.000. Otra línea: 2 seguido de espacios, Iced Latte XL, seguido de espacios, $25.000.
Línea de separación usando veinte guiones.
Línea de subtotal: Texto SUBTOTAL alineado a la izquierda, valor alineado a la derecha por ejemplo $73.000. Tamaño 11px.
Línea de IVA: Texto IVA 19% alineado a la izquierda, valor alineado a la derecha por ejemplo $13.870. Tamaño 11px.
Línea de separación usando veinte signos de igual.
Línea de total: Texto TOTAL alineado a la izquierda, valor alineado a la derecha por ejemplo $86.870. Tamaño 13px, peso bold.
Espacio en blanco de 10px.
Línea de mensaje legal: Texto Este documento no es válido como factura centrado, tamaño 9px, color gris, estilo italic.
Espacio en blanco de 6px.
Línea de agradecimiento: Texto Gracias por su visita centrado, tamaño 10px, color gris.
Espacio en blanco de 8px.
Debajo del rectángulo del ticket, dentro del modal, los dos botones de acción: Cerrar como botón secundario outline a la izquierda y Imprimir como botón primario con icono de impresora a la derecha. Mantener el color actual del botón Imprimir.
RESUMEN: Rediseñar el contenido del modal de pre-cuenta para que simule un ticket de impresora térmica con fondo color crema, tipografía monoespaciada, formato de tirilla con separadores de guiones y signos de igual, información del restaurante, mesa, productos con precios en columnas, subtotal, IVA, total, y mensaje de documento no válido como factura.