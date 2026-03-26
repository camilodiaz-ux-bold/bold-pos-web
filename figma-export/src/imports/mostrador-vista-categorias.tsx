CONTEXTO
Estoy trabajando en Bold POS Restaurantes V1. Tengo un prototipo funcional con:
- Vista Mesas (mapa + panel lateral)
- Vista Mostrador (tabs de órdenes + catálogo con fotos + panel "Detalle de orden")
- Gestionar Mesas
- Checkout

La vista Mostrador actual muestra productos en grid con fotos y filtros por categoría en la parte inferior.

---

OBJETIVO
Agregar una NUEVA VISTA alternativa en Mostrador llamada "Vista Categorías" que funcione con bloques de colores y navegación drill-down. Esta vista será la DEFAULT cuando el usuario entre a Mostrador.

El usuario podrá alternar entre:
- Vista Categorías (bloques de colores) → DEFAULT
- Vista Grid (fotos de productos) → Vista actual

---

NO MODIFICAR (GUARDRAILS CRÍTICOS)
- NO modificar Vista Mesas ni el mapa de mesas
- NO modificar Gestionar Mesas (configuración)
- NO modificar el panel "Detalle de orden" (panel derecho en Mostrador)
- NO modificar el flujo de Checkout
- NO modificar la navegación principal (tabs Mesas/Mostrador, sidebar)
- NO modificar la barra de tabs de órdenes (#001, #002, etc.)
- NO reorganizar la arquitectura general del layout
- Mantener consistencia con el estilo UI actual (wireframe media fidelidad)

---

CAMBIOS A REALIZAR

1. TOGGLE DE VISTAS
   - Ubicación: donde está actualmente el icono de grid (zona superior derecha del área de productos)
   - Agregar DOS iconos toggle:
     * Icono bloques/categorías (4 cuadrados grandes) → activa Vista Categorías
     * Icono grid (cuadrícula pequeña) → activa Vista Grid (actual)
   - Por default: Vista Categorías activa

2. VISTA CATEGORÍAS - NIVEL 1 (nueva)
   - Reemplaza el área donde están las fotos de productos
   - Layout: Bloques grandes de colores en grid (3-4 columnas)
   - Diseñar para TOUCH en tablet: bloques grandes, fáciles de tocar
   
   CATEGORÍAS A MOSTRAR (con colores sugeridos):
   - Entradas Frías → Azul claro (#60A5FA)
   - Entradas Calientes → Naranja (#F97316)
   - Pastas & Risottos → Amarillo (#FBBF24)
   - Carnes → Rojo (#EF4444)
   - Pescados → Azul marino (#3B82F6)
   - Postres → Rosa (#EC4899)
   - Bebidas → Verde (#10B981)
   
   Cada bloque muestra:
   - Color de fondo sólido
   - Nombre de categoría centrado (texto blanco)

3. DRILL-DOWN - NIVEL 2 (productos por categoría)
   - Al hacer click en una categoría → mostrar productos de esa categoría
   - Agregar botón "← Volver" en la parte superior del área de productos
   - Los productos son bloques de color (mismo color de su categoría pero más claro) con:
     * Nombre del producto
     * Precio en pesos colombianos
   
   PRODUCTOS POR CATEGORÍA:

   ENTRADAS FRÍAS:
   - Carpaccio de Wagyu - $112,000
   - Tartar de Atún Bluefin - $104,000
   - Ceviche de Corvina Real - $96,000
   - Burrata Ahumada - $88,000
   - Ostras Fine de Claire - $128,000
   - Gazpacho de Cerezas - $72,000
   - Foie Gras en Brioche - $120,000
   - Ensalada de Centollo - $116,000

   ENTRADAS CALIENTES:
   - Vieiras Selladas - $108,000
   - Pulpo a la Brasa - $100,000
   - Huevo a Baja Temperatura - $84,000
   - Ravioli de Langosta - $112,000
   - Tuétano Rostizado - $92,000
   - Sopa de Cebolla Moderna - $76,000
   - Langostinos al Josper - $104,000
   - Mollejas de Ternera - $96,000

   PASTAS & RISOTTOS:
   - Risotto de Trufa Blanca - $180,000
   - Tagliatelle de Cacao - $128,000
   - Gnocchi de Calabaza - $112,000
   - Risotto de Frutti di Mare - $152,000
   - Pappardelle con Cordero - $136,000
   - Agnolotti del Plin - $120,000
   - Risotto de Espárragos - $116,000
   - Linguine con Caviar - $220,000

   CARNES:
   - Solomillo Wellington - $192,000
   - Costillar de Cordero - $184,000
   - Entrecot Dry Aged - $208,000
   - Pato a la Naranja 2.0 - $168,000
   - Cochinillo Confitado - $176,000
   - Short Rib al Vino Tinto - $160,000
   - Codorniz Rellena - $152,000
   - Tomahawk - $440,000
   - Tournedó Rossini - $232,000

   PESCADOS:
   - Bacalao Negro Gindara - $192,000
   - Lubina en Sal de Mar - $180,000
   - Salmón Escocés - $152,000
   - Turbot (Rodaballo) - $208,000
   - Bogavante Thermidor - $260,000
   - Atún Rojo en Costra - $168,000
   - Merluza de Pincho - $144,000
   - Lenguado Meunière - $176,000

   POSTRES:
   - Esfera de Chocolate Oro - $72,000
   - Soufflé de Grand Marnier - $64,000
   - Tarta Tatín de Manzana - $60,000
   - Panna Cotta de Lavanda - $56,000
   - Texturas de Avellana - $68,000
   - Degustación de Quesos - $88,000
   - Lemon Pie Deconstruido - $56,000
   - Tiramisú de Autor - $60,000
   - Sorbetes Artesanales - $48,000

   BEBIDAS:
   - Limonada de Lavanda - $36,000
   - Agua de Piedra - $32,000
   - Infusión de Rooibos - $40,000
   - Mocktail de Pepino - $48,000
   - Ginger Beer Artesanal - $36,000
   - Néctar de Pera - $44,000

4. INTERACCIÓN AL SELECCIONAR PRODUCTO
   - Click en producto → se agrega al panel "Detalle de orden" (comportamiento actual, sin cambios)
   - El buscador puede mantenerse arriba (funciona en ambas vistas)

---

ESTADOS DEL PROTOTIPO

Estado 1: Vista Categorías - Nivel 1 (7 categorías en bloques de colores)
Estado 2: Vista Categorías - Nivel 2 (productos de una categoría seleccionada)
Estado 3: Vista Grid activa (vista actual con fotos de productos)

---

PRINCIPIO DE DISEÑO
Priorizar TOUCH en tablets: botones grandes que persigan al dedo, no al revés. Los bloques deben ser lo suficientemente grandes para tocar sin precisión milimétrica. Mínimo 80px de alto por bloque.

---

RESUMEN
Solo estoy agregando una vista alternativa de categorías con drill-down en Mostrador. El panel de detalle de orden, checkout, mesas y gestión de mesas NO se tocan. La arquitectura se mantiene igual. Usar los 56 productos reales listados arriba organizados en 7 categorías.