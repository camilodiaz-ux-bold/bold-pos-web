CONTEXTO: Este es Bold POS Restaurantes V1. Después de que el usuario crea su cuenta, debe pasar por un flujo de Onboarding para configurar su restaurante antes de poder operar. El Onboarding está dividido en 4 secciones principales, cada una con una pantalla de Checkpoint que introduce la sección, seguida de los pasos específicos. El usuario adjuntará pantallas de referencia del Onboarding actual de Bold POS para que Figma Make reconozca y replique los componentes, estilos, fondos, tipografías, espaciados, y patrones de UI.
OBJETIVO: Crear el flujo completo de Onboarding para Bold POS Restaurantes con 4 Checkpoints y sus respectivos pasos, siguiendo exactamente los estilos y componentes de las pantallas de referencia adjuntas.
NO MODIFICAR: Las pantallas de Inicia sesión y Crea tu cuenta existentes.
PANTALLAS A CREAR:

CHECKPOINT 1 - Configura tu negocio
Layout de dos columnas como las pantallas de checkpoint de referencia.
Columna izquierda: Imagen ilustrativa grande que represente configuración de negocio o restaurante. Puede ser una ilustración de un restaurante, una persona configurando algo, o un mockup. El usuario proporcionará el asset.
Columna derecha: Indicador Paso 1/4 en texto pequeño gris. Título grande Configura tu negocio. Descripción Vamos a personalizar Bold POS según el tipo de negocio que tienes y cómo opera.
Footer con barra de progreso de 4 segmentos con el primero activo en rojo, link Atrás a la izquierda, botón Continuar a la derecha.

PASO 1.1 - Selección de Vertical
Mismo layout base con header con logo Bold, botón Ayuda y botón X, fondo gradiente sutil.
Contenido centrado con título ¿Qué tipo de negocio tienes? y subtítulo Esto nos ayuda a configurar tu experiencia.
Grid de 3 cards seleccionables en una fila horizontal:
Card 1: Ícono representativo de restaurante como cubiertos o plato, título Restaurantes, descripción Mesas, comandas, cocina y servicio.
Card 2: Ícono de tienda o bolsa de compras, título Retail, descripción Inventario, ventas y facturación.
Card 3: Ícono de rayo o simplificado, título Lite, descripción Solo cobros rápidos.
Las cards deben tener estado default con fondo claro y borde sutil, y estado seleccionado con borde de color rojo o destacado y un check en la esquina superior derecha, igual que las pantallas de referencia de selección múltiple.
Footer con barra de progreso de 4 segmentos con el primero activo, link Atrás, botón Continuar.

PASO 1.2 - Modalidad Operativa
Mismo layout base con header, fondo gradiente y footer.
Contenido centrado con título ¿Cómo opera tu restaurante? y subtítulo Puedes cambiarlo después en configuración.
Grid de 3 cards seleccionables en una fila horizontal:
Card 1: Ícono de mesa con sillas vista desde arriba o lateral, título Mesas, descripción Servicio a la mesa con meseros.
Card 2: Ícono de mostrador, caja registradora o ticket, título Mostrador, descripción Venta rápida y autoservicio.
Card 3: Ícono combinado que represente ambos modos, título Mixto, descripción Mesas y mostrador juntos.
Estado default y seleccionado igual que el paso anterior.
Footer con barra de progreso de 4 segmentos con el primero activo ya que aún estamos en la sección 1.

CHECKPOINT 2 - Cuéntanos de tu restaurante
Layout de dos columnas como las pantallas de checkpoint de referencia.
Columna izquierda: Imagen ilustrativa que represente un restaurante, puede ser una foto estilizada de un local, mesas, o una ilustración. El usuario proporcionará el asset.
Columna derecha: Indicador Paso 2/4 en texto pequeño gris. Título grande Cuéntanos de tu restaurante. Descripción Esta información nos ayuda a personalizar tu experiencia y aparecerá en tus documentos.
Footer con barra de progreso de 4 segmentos con el primero completado en rojo y el segundo activo en rojo, link Atrás, botón Continuar.

PASO 2.1 - Tipo de Restaurante
Mismo layout base con header, fondo gradiente y footer.
Contenido centrado con título ¿Qué tipo de restaurante es? y subtítulo Selecciona el que mejor describa tu negocio.
Lista vertical de opciones tipo pill o botón seleccionable con selección única, centradas en la pantalla:
Opción 1: Restaurante casual
Opción 2: Restaurante de mantel
Opción 3: Café o cafetería
Opción 4: Bar o gastrobar
Opción 5: Panadería o pastelería
Opción 6: Comida rápida
Opción 7: Otro
Las opciones deben tener estado default con fondo claro o crema y texto oscuro, y estado seleccionado con borde rojo y texto rojo, igual que las pantallas de referencia de selección de tipo de documento.
Footer con barra de progreso de 4 segmentos con el primero completado y el segundo activo.

PASO 2.2 - Datos del Restaurante
Mismo layout base con header, fondo gradiente y footer.
Contenido centrado con título Datos de tu restaurante y subtítulo Esta información aparecerá en tus facturas y recibos.
Formulario con campos verticales usando los estilos de input de las pantallas de referencia del sistema Merlin:
Campo 1: Label Ciudad con asterisco indicando requerido, componente dropdown con placeholder Selecciona una ciudad, flecha hacia abajo a la derecha, al hacer click despliega lista de ciudades de Colombia.
Campo 2: Label Dirección con asterisco, input de texto con placeholder Dirección del restaurante.
Campo 3: Label NIT con texto opcional entre paréntesis, input de texto con placeholder NIT si aplica.
Los inputs deben usar el estilo del sistema con fondo blanco, borde completo de 1px gris claro, border-radius redondeado.
Footer con barra de progreso de 4 segmentos con el primero completado y el segundo activo.

CHECKPOINT 3 - Personaliza tu experiencia
Layout de dos columnas como las pantallas de checkpoint de referencia.
Columna izquierda: Imagen ilustrativa que represente personalización o configuración, puede ser una ilustración de controles, sliders, o una persona ajustando opciones. El usuario proporcionará el asset.
Columna derecha: Indicador Paso 3/4 en texto pequeño gris. Título grande Personaliza tu experiencia. Descripción Configura las opciones básicas para que Bold POS funcione como tu restaurante lo necesita.
Footer con barra de progreso de 4 segmentos con los dos primeros completados en rojo y el tercero activo en rojo.

PASO 3.1 - Configuración Inicial
Mismo layout base con header, fondo gradiente y footer.
Contenido centrado con título Configuración inicial y subtítulo Puedes modificar todo esto después en ajustes.
Sección 1 - Propina sugerida:
Label de sección Propina sugerida en texto peso semibold.
Texto descriptivo Se mostrará como opción por defecto al cobrar en texto gris más pequeño.
Grupo de 3 botones tipo toggle o segmented control en fila horizontal con las opciones: 0%, 10%, 15%. La opción 10% debe estar seleccionada por defecto con fondo de color y texto destacado. Las opciones no seleccionadas tienen fondo claro y texto gris.
Texto informativo pequeño en gris La propina no afecta la base del IVA.
Separación vertical de 32px.
Sección 2 - Zonas del restaurante:
Label de sección Zonas de tu restaurante en texto peso semibold.
Texto descriptivo Organiza tus mesas por zonas. Puedes agregar más después en texto gris más pequeño.
Mostrar 3 chips o tags editables con las zonas por defecto: Salón, Terraza, Barra. Cada chip tiene un ícono X a la derecha para eliminar la zona. Los chips tienen fondo gris claro, texto oscuro, border-radius pill.
Debajo de los chips, un botón o link con ícono de más + Agregar zona en color azul para añadir nuevas zonas.
Footer con barra de progreso de 4 segmentos con los dos primeros completados y el tercero activo.

CHECKPOINT 4 - ¡Listo para operar!
Layout de dos columnas como las pantallas de checkpoint de referencia pero con estilo de celebración o éxito.
Columna izquierda: Imagen ilustrativa o mockup que muestre la interfaz de Bold POS Restaurantes funcionando, puede ser el mapa de mesas con mesas en diferentes estados, o una composición de la app. El usuario proporcionará el asset.
Columna derecha: Indicador Paso 4/4 en texto pequeño gris o un ícono de check de éxito. Título grande ¡Tu restaurante está listo! Descripción Ya puedes empezar a gestionar pedidos, mesas y cobros con Bold POS Restaurantes.
Opción adicional: Checkbox con label Ver tutorial de inicio y descripción pequeña en gris Aprende a usar las funciones principales en 2 minutos. El checkbox está desmarcado por defecto.
Footer sin barra de progreso o con barra completa en rojo, sin link Atrás, solo botón principal Comenzar o Ir a mi restaurante centrado o alineado a la derecha. Este botón lleva al usuario a la Home correspondiente según la modalidad seleccionada: si eligió Mesas va al mapa de mesas, si eligió Mostrador va a la vista de órdenes, si eligió Mixto va al mapa de mesas con el toggle disponible.

REGLAS GENERALES PARA TODAS LAS PANTALLAS:
Usar exactamente los mismos componentes, estilos, fondos, tipografías, colores, espaciados, border-radius, sombras, íconos y patrones de UI de las pantallas de referencia que el usuario adjuntará.
El header debe ser consistente en todas las pantallas con logo Bold símbolo a la izquierda, botón Ayuda con ícono a la derecha, y botón X para cerrar.
El footer debe ser consistente con link Atrás en texto con underline a la izquierda, barra de progreso segmentada de 4 partes en el centro, y botón Continuar estilo pill rojo a la derecha.
La barra de progreso debe reflejar el checkpoint actual: segmentos completados en rojo sólido, segmento actual en rojo sólido, segmentos pendientes en gris claro.
Las pantallas de Checkpoint tienen layout de dos columnas con imagen a la izquierda y contenido a la derecha.
Las pantallas de Pasos tienen contenido centrado con las opciones o formularios.
Las transiciones deben conectarse correctamente: Continuar avanza al siguiente paso o checkpoint, Atrás regresa al anterior.
El botón Continuar debe estar visualmente deshabilitado con opacidad reducida si no se ha completado una selección obligatoria.
El botón X en el header permite salir del Onboarding, puede mostrar un modal de confirmación preguntando si está seguro de salir.
RESUMEN: Crear flujo de Onboarding con 4 Checkpoints principales: 1) Configura tu negocio con pasos de vertical y modalidad, 2) Cuéntanos de tu restaurante con pasos de tipo y datos, 3) Personaliza tu experiencia con configuración de propina y zonas, 4) Listo para operar como pantalla final. Cada checkpoint tiene pantalla introductoria con imagen y descripción seguida de sus pasos específicos. Usar exactamente los estilos y componentes de las pantallas de referencia adjuntas.