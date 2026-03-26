Perfecto, aquí está el prompt reformateado con ese estilo:

---

CONTEXTO

Bold POS Restaurantes V1. Iteración sobre Vista Categorías en Mostrador. Actualmente tenemos Vista Categorías con bloques de colores y drill-down funcionando. Ahora queremos cambiar a layout de dos columnas estilo Toast POS.

OBJETIVO

Reorganizar Vista Categorías con categorías fijas a la izquierda y productos a la derecha. Sincronizar los 56 productos en todas las vistas del sistema donde aparezca catálogo de productos.

NO MODIFICAR

Vista Mesas (mapa de mesas), Gestionar Mesas (configuración), flujo de Checkout, estructura del panel "Detalle de orden", navegación principal (tabs Mesas/Mostrador, sidebar), barra de tabs de órdenes (#001, #002), toggle de vistas (iconos grid/categorías), Vista Grid con fotos. Solo modificar layout interno de Vista Categorías y actualizar catálogo de productos.

CAMBIOS A REALIZAR

Cambio 1 - Layout Vista Categorías: Dos columnas. Columna izquierda (ancho fijo 200px) con lista vertical de 7 categorías como botones apilados, siempre visibles. Categoría activa con fondo de color sólido, las demás con fondo gris claro o borde sutil. Columna derecha (resto del espacio) con productos de la categoría seleccionada en grid 3-4 columnas, cada producto muestra nombre + precio. Click en categoría izquierda cambia productos a la derecha. Sin botón "Volver". Por default Entradas Frías seleccionada.

Cambio 2 - Sincronizar productos en todas las vistas: Los mismos 56 productos en Vista Mostrador (Categorías y Grid) y Vista Mesas (Agregar productos a mesa). Mismas 7 categorías y productos.

Cambio 3 - Descripción en Detalle de orden: Al agregar producto a una orden, mostrar debajo del nombre su descripción en texto pequeño gris.

CATEGORÍAS

Entradas Frías (#60A5FA azul), Entradas Calientes (#F97316 naranja), Pastas & Risottos (#FBBF24 amarillo), Carnes (#EF4444 rojo), Pescados (#3B82F6 azul marino), Postres (#EC4899 rosa), Bebidas (#10B981 verde).

PRODUCTOS

Entradas Frías (8): Carpaccio de Wagyu $112,000 "Láminas finas de res A5 con emulsión de trufa" | Tartar de Atún Bluefin $104,000 "Atún con aguacate y perlas de soja" | Ceviche de Corvina Real $96,000 "Leche de tigre al ají amarillo y camote" | Burrata Ahumada $88,000 "Tomates heirloom confitados y pesto de pistacho" | Ostras Fine de Claire $128,000 "Seis unidades con mignonette y caviar cítrico" | Gazpacho de Cerezas $72,000 "Sopa fría con nieve de queso de cabra" | Foie Gras en Brioche $120,000 "Mousse de foie con mermelada de higos" | Ensalada de Centollo $116,000 "Carne de centollo con mayonesa de plancton"

Entradas Calientes (8): Vieiras Selladas $108,000 "Puré de coliflor tostada y aire de azafrán" | Pulpo a la Brasa $100,000 "Marinado en pimentón con espuma de patata" | Huevo a Baja Temperatura $84,000 "Con setas silvestres y crema de foie" | Ravioli de Langosta $112,000 "Relleno de bogavante con bisque de corales" | Tuétano Rostizado $92,000 "Con ensalada de perejil y masa madre" | Sopa de Cebolla Moderna $76,000 "Caldo clarificado con nube de Gruyère" | Langostinos al Josper $104,000 "Mantequilla de ajo negro y lima kaffir" | Mollejas de Ternera $96,000 "Crujientes con puré de manzana ácida"

Pastas & Risottos (8): Risotto de Trufa Blanca $180,000 "Arroz Carnaroli con láminas de trufa blanca" | Tagliatelle de Cacao $128,000 "Pasta de cacao con ragú de jabalí" | Gnocchi de Calabaza $112,000 "Salvia frita y mantequilla avellanada" | Risotto de Frutti di Mare $152,000 "Mariscos premium e infusión de tomate" | Pappardelle con Cordero $136,000 "Estofado de 12 horas y romero" | Agnolotti del Plin $120,000 "Rellenos de tres carnes con salsa de asado" | Risotto de Espárragos $116,000 "Guisantes lágrima y emulsión de hierbabuena" | Linguine con Caviar $220,000 "Crema de limón Amalfi y caviar Ossetra"

Carnes (9): Solomillo Wellington $192,000 "Filete en hojaldre con duxelle de setas" | Costillar de Cordero $184,000 "Costra de hierbas y ratatouille" | Entrecot Dry Aged $208,000 "Madurado 45 días con patatas fondant" | Pato a la Naranja 2.0 $168,000 "Puré de zanahoria al jengibre y Grand Marnier" | Cochinillo Confitado $176,000 "Piel crujiente con puré de piña asada" | Short Rib al Vino Tinto $160,000 "Braseado 24 horas con puré de colinabo" | Codorniz Rellena $152,000 "Rellena de frutos secos con reducción de uvas" | Tomahawk $440,000 "1.2kg a la parrilla con mantequilla de hierbas" | Tournedó Rossini $232,000 "Solomillo con foie gras y trufa negra"

Pescados (8): Bacalao Negro Gindara $192,000 "Marinado en miso con bok choy" | Lubina en Sal de Mar $180,000 "Filete salvaje con verduras baby" | Salmón Escocés $152,000 "Costra de sésamo y puré de guisantes" | Turbot (Rodaballo) $208,000 "Salsa de champagne y uvas peladas" | Bogavante Thermidor $260,000 "Gratinado con mostaza antigua y brandy" | Atún Rojo en Costra $168,000 "Sellado tataki con gel de ponzu" | Merluza de Pincho $144,000 "Confitada con pil-pil de sus pieles" | Lenguado Meunière $176,000 "Mantequilla noisette y alcaparras"

Postres (9): Esfera de Chocolate Oro $72,000 "Valrhona fundido con salsa de caramelo" | Soufflé de Grand Marnier $64,000 "Horneado con crema inglesa de vainilla" | Tarta Tatín de Manzana $60,000 "Manzanas caramelizadas con helado de nata" | Panna Cotta de Lavanda $56,000 "Con flores frescas y panal de abeja" | Texturas de Avellana $68,000 "Gianduja con praliné crujiente" | Degustación de Quesos $88,000 "Cinco quesos europeos con miel de trufa" | Lemon Pie Deconstruido $56,000 "Crema de limón Meyer y merengue italiano" | Tiramisú de Autor $60,000 "Mascarpone artesano y café Cold Brew" | Sorbetes Artesanales $48,000 "Trío de sabores de temporada"

Bebidas (6): Limonada de Lavanda $36,000 "Limonada artesanal infusionada con flores frescas" | Agua de Piedra $32,000 "Agua mineral de manantial premium 750ml" | Infusión de Rooibos $40,000 "Té sin teína con trozos de fruta orgánica" | Mocktail de Pepino $48,000 "Refresco botánico sin alcohol macerado en frío" | Ginger Beer Artesanal $36,000 "Elaborada en casa con fermentación natural" | Néctar de Pera $44,000 "Zumo natural especiado con cardamomo verde"

RESUMEN

Layout dos columnas en Vista Categorías (categorías izquierda, productos derecha). Mismos 56 productos en Mostrador y Mesas. Descripciones visibles en Detalle de orden. No tocar mapa de mesas, gestión, checkout ni arquitectura general.