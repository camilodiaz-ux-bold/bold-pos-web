CONTEXTO

Bold POS Restaurantes V1. Iteración sobre el modal de detalle de producto. Actualmente cuando el usuario selecciona un producto aparece un modal con: nombre, precio, cantidad, notas y chips de modificadores rápidos. Falta mostrar la descripción del producto.

OBJETIVO

Agregar la descripción del producto en el modal de detalle antes de agregar a la orden. La descripción ayuda al operario a confirmar que está seleccionando el producto correcto y puede responder preguntas del cliente sobre ingredientes.

NO MODIFICAR

Vista Mesas, Gestionar Mesas, flujo de Checkout, panel "Detalle de orden", navegación principal, barra de tabs de órdenes, toggle de vistas, Vista Grid, Vista Categorías, arquitectura general. Solo modificar el modal de detalle de producto.

CAMBIO A REALIZAR

Agregar descripción del producto en el modal, ubicada entre el precio y el campo de cantidad. Texto en color gris (#6B7280), tamaño 14px, máximo 2 líneas. La descripción proviene de la base de datos de productos.

UBICACIÓN EN MODAL

Nombre del producto (título)
Precio (azul)
Descripción del producto (NUEVO - texto gris, 14px)
---
Cantidad
Notas (opcional)
Chips de modificadores
Botones Cancelar / Agregar a la orden

DESCRIPCIONES POR PRODUCTO

Entradas Frías: Carpaccio de Wagyu "Láminas finas de res A5 con emulsión de trufa" | Tartar de Atún Bluefin "Atún con aguacate y perlas de soja" | Ceviche de Corvina Real "Leche de tigre al ají amarillo y camote" | Burrata Ahumada "Tomates heirloom confitados y pesto de pistacho" | Ostras Fine de Claire "Seis unidades con mignonette y caviar cítrico" | Gazpacho de Cerezas "Sopa fría con nieve de queso de cabra" | Foie Gras en Brioche "Mousse de foie con mermelada de higos" | Ensalada de Centollo "Carne de centollo con mayonesa de plancton"

Entradas Calientes: Vieiras Selladas "Puré de coliflor tostada y aire de azafrán" | Pulpo a la Brasa "Marinado en pimentón con espuma de patata" | Huevo a Baja Temperatura "Con setas silvestres y crema de foie" | Ravioli de Langosta "Relleno de bogavante con bisque de corales" | Tuétano Rostizado "Con ensalada de perejil y masa madre" | Sopa de Cebolla Moderna "Caldo clarificado con nube de Gruyère" | Langostinos al Josper "Mantequilla de ajo negro y lima kaffir" | Mollejas de Ternera "Crujientes con puré de manzana ácida"

Pastas & Risottos: Risotto de Trufa Blanca "Arroz Carnaroli con láminas de trufa blanca" | Tagliatelle de Cacao "Pasta de cacao con ragú de jabalí" | Gnocchi de Calabaza "Salvia frita y mantequilla avellanada" | Risotto de Frutti di Mare "Mariscos premium e infusión de tomate" | Pappardelle con Cordero "Estofado de 12 horas y romero" | Agnolotti del Plin "Rellenos de tres carnes con salsa de asado" | Risotto de Espárragos "Guisantes lágrima y emulsión de hierbabuena" | Linguine con Caviar "Crema de limón Amalfi y caviar Ossetra"

Carnes: Solomillo Wellington "Filete en hojaldre con duxelle de setas" | Costillar de Cordero "Costra de hierbas y ratatouille" | Entrecot Dry Aged "Madurado 45 días con patatas fondant" | Pato a la Naranja 2.0 "Puré de zanahoria al jengibre y Grand Marnier" | Cochinillo Confitado "Piel crujiente con puré de piña asada" | Short Rib al Vino Tinto "Braseado 24 horas con puré de colinabo" | Codorniz Rellena "Rellena de frutos secos con reducción de uvas" | Tomahawk "1.2kg a la parrilla con mantequilla de hierbas" | Tournedó Rossini "Solomillo con foie gras y trufa negra"

Pescados: Bacalao Negro Gindara "Marinado en miso con bok choy" | Lubina en Sal de Mar "Filete salvaje con verduras baby" | Salmón Escocés "Costra de sésamo y puré de guisantes" | Turbot Rodaballo "Salsa de champagne y uvas peladas" | Bogavante Thermidor "Gratinado con mostaza antigua y brandy" | Atún Rojo en Costra "Sellado tataki con gel de ponzu" | Merluza de Pincho "Confitada con pil-pil de sus pieles" | Lenguado Meunière "Mantequilla noisette y alcaparras"

Postres: Esfera de Chocolate Oro "Valrhona fundido con salsa de caramelo" | Soufflé de Grand Marnier "Horneado con crema inglesa de vainilla" | Tarta Tatín de Manzana "Manzanas caramelizadas con helado de nata" | Panna Cotta de Lavanda "Con flores frescas y panal de abeja" | Texturas de Avellana "Gianduja con praliné crujiente" | Degustación de Quesos "Cinco quesos europeos con miel de trufa" | Lemon Pie Deconstruido "Crema de limón Meyer y merengue italiano" | Tiramisú de Autor "Mascarpone artesano y café Cold Brew" | Sorbetes Artesanales "Trío de sabores de temporada"

Bebidas: Limonada de Lavanda "Limonada artesanal infusionada con flores frescas" | Agua de Piedra "Agua mineral de manantial premium 750ml" | Infusión de Rooibos "Té sin teína con trozos de fruta orgánica" | Mocktail de Pepino "Refresco botánico sin alcohol macerado en frío" | Ginger Beer Artesanal "Elaborada en casa con fermentación natural" | Néctar de Pera "Zumo natural especiado con cardamomo verde"

EJEMPLO VISUAL

Modal para "Burrata Ahumada":
Burrata Ahumada
$88,000
Tomates heirloom confitados y pesto de pistacho (NUEVO)
---
Cantidad: 1
Notas (opcional)
[chips de modificadores]
[Cancelar] [Agregar a la orden]

RESUMEN

Agregar descripción del producto en el modal de detalle, entre precio y cantidad. Texto gris 14px. Usar las descripciones listadas arriba. No modificar ninguna otra parte del prototipo.