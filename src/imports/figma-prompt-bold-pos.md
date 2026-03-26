Perfecto, vamos con un prompt completo que cubra:

Íconos del toggle mejor representados
Dropdown desde avatar con perfil/cerrar sesión
Modal de confirmación de turno abierto
Pantalla de Login en alta fidelidad


PROMPT PARA FIGMA MAKE
CONTEXTO: Este es el prototipo de Bold POS Restaurantes V1. Tenemos el TopBar con un toggle de íconos para cambiar entre Mesas y Mostrador, pero los íconos actuales no representan claramente cada modo. También necesitamos implementar el flujo completo de cerrar sesión: desde el avatar se despliega un menú con opciones de perfil, al seleccionar cerrar sesión aparece un modal de confirmación si hay turno abierto, y finalmente se llega a la pantalla de Login. La pantalla de Login debe estar en alta fidelidad siguiendo el diseño actual de Bold POS.
OBJETIVO: Mejorar los íconos del toggle Mesas/Mostrador para que sean más representativos de cada modo. Implementar el flujo completo de cerrar sesión incluyendo el dropdown de perfil, modal de confirmación, y pantalla de Login en alta fidelidad.
NO MODIFICAR: El NavBar lateral con su estructura y contenido actual. El área central de contenido con mapa de mesas o grilla de productos. El panel lateral derecho de detalle de orden o detalle de mesa. Los flujos de checkout existentes. Los modales de comanda y pre-cuenta existentes.
CAMBIOS A REALIZAR:
Cambio 1 - Mejorar íconos del toggle Mesas/Mostrador:
En el toggle ubicado en el TopBar después del logo de Bold, reemplazar los íconos actuales por íconos más representativos de cada modo operativo.
El ícono de Mesas debe representar claramente el concepto de mesas de restaurante. Puede ser un ícono de vista superior de una mesa con sillas alrededor, o un ícono de layout con múltiples mesas distribuidas, o un ícono de mesa redonda con mantel. El ícono debe comunicar servicio a la mesa, atención en salón, restaurante con mesas. El usuario proporcionará el asset del ícono.
El ícono de Mostrador debe representar claramente el concepto de venta rápida en mostrador. Puede ser un ícono de caja registradora, o un ícono de mostrador con persona atendiendo, o un ícono de ticket de venta, o un ícono de terminal de punto de venta. El ícono debe comunicar venta rápida, autoservicio, caja, mostrador. El usuario proporcionará el asset del ícono.
Ambos íconos deben tener el mismo tamaño de 20px por 20px y el mismo peso visual para mantener balance en el toggle. El ícono activo se muestra en color azul oscuro hexadecimal 0F1729 con fondo blanco y sombra sutil. El ícono inactivo se muestra en color gris hexadecimal 9CA3AF con fondo transparente.
Cambio 2 - Crear dropdown de perfil desde el avatar:
Cuando el usuario hace click en el avatar circular ubicado en el extremo derecho del TopBar, debe aparecer un dropdown o card flotante debajo del avatar, alineado a la derecha.
El dropdown debe tener las siguientes características visuales: Fondo blanco. Ancho de 220px. Border-radius de 12px. Sombra media con valores aproximados de 0px 4px 16px rgba 0 0 0 0.12. Borde de 1px color gris muy claro hexadecimal F3F4F6.
El contenido del dropdown de arriba hacia abajo:
Sección de perfil en la parte superior con padding de 16px: Avatar circular grande de 56px de diámetro centrado horizontalmente, con fondo azul oscuro hexadecimal 0F1729 y las iniciales del usuario en blanco tamaño 20px peso semibold. Debajo del avatar con separación de 12px, el nombre completo del usuario por ejemplo Ramiro Ramos centrado, color azul oscuro hexadecimal 0F1729, peso semibold, tamaño 16px.
Línea separadora horizontal de 1px color gris claro hexadecimal E5E7EB con margen vertical de 8px.
Lista de opciones con padding horizontal de 8px:
Primera opción: Ícono de documento o escudo a la izquierda tamaño 20px color gris hexadecimal 6B7280, texto Legal y privacidad color azul oscuro hexadecimal 0F1729 tamaño 14px peso regular. Padding vertical de 12px, padding horizontal de 8px. Border-radius de 8px. Estado hover con fondo gris muy claro hexadecimal F9FAFB.
Línea separadora horizontal de 1px color gris claro hexadecimal E5E7EB con margen vertical de 4px.
Segunda opción: Ícono de power off o salida a la izquierda tamaño 20px color gris hexadecimal 6B7280, texto Cerrar sesión color azul oscuro hexadecimal 0F1729 tamaño 14px peso regular. Padding vertical de 12px, padding horizontal de 8px. Border-radius de 8px. Estado hover con fondo gris muy claro hexadecimal F9FAFB.
Padding inferior del dropdown de 8px.
El dropdown debe cerrarse si el usuario hace click fuera de él.
Cambio 3 - Crear modal de confirmación de turno abierto:
Cuando el usuario hace click en Cerrar sesión y tiene un turno abierto, debe aparecer un modal de confirmación centrado en pantalla.
El modal debe tener overlay de fondo oscuro con color negro al 50% de opacidad cubriendo toda la pantalla.
El modal en sí debe tener las siguientes características: Fondo blanco. Ancho de 400px. Border-radius de 24px. Padding de 40px. Centrado vertical y horizontalmente en la pantalla. Sombra elevada.
Contenido del modal de arriba hacia abajo centrado:
Ícono de alerta circular con fondo amarillo hexadecimal FCD34D, diámetro de 64px, conteniendo un signo de exclamación en blanco centrado. Este ícono representa una advertencia.
Debajo del ícono con separación de 24px, título Actualmente tienes un turno abierto en color azul oscuro hexadecimal 0F1729, peso bold, tamaño 22px, centrado.
Debajo del título con separación de 12px, subtítulo ¿Deseas cerrar sesión? en color gris hexadecimal 6B7280, peso regular, tamaño 16px, centrado.
Debajo del subtítulo con separación de 32px, dos botones apilados verticalmente con separación de 12px entre ellos:
Primer botón Cerrar turno: Estilo outline con borde de 2px color rojo hexadecimal E63946, fondo transparente, texto Cerrar turno en color rojo hexadecimal E63946, peso semibold, tamaño 16px. Ancho completo del área de contenido. Altura de 52px. Border-radius de 26px que es la mitad de la altura para crear efecto de pill o cápsula redondeada.
Segundo botón Cerrar sesión: Estilo primario con fondo rojo hexadecimal E63946, texto Cerrar sesión en color blanco, peso semibold, tamaño 16px. Ancho completo del área de contenido. Altura de 52px. Border-radius de 26px para efecto de pill redondeada.
Cambio 4 - Crear pantalla de Login en alta fidelidad:
Cuando el usuario confirma cerrar sesión, debe llegar a la pantalla de Login. Esta pantalla debe diseñarse en alta fidelidad siguiendo el diseño actual de Bold POS.
La pantalla de Login ocupa el 100% del viewport. Fondo de color gris muy claro o blanco hueso hexadecimal F8FAFC.
Layout de dos columnas en desktop:
Columna izquierda ocupando aproximadamente el 45% del ancho:
En la esquina superior izquierda con padding de 32px, el logo de Bold. El usuario proporcionará el asset del logo.
En el centro superior de la columna pero alineado más hacia el centro de la pantalla completa, el texto BoldPOS como título de producto en color azul oscuro hexadecimal 0F1729, peso semibold, tamaño 18px.
Contenido del formulario con padding izquierdo de aproximadamente 80px y padding derecho de 40px, centrado verticalmente en la columna:
Título Inicia sesión en color azul oscuro hexadecimal 0F1729, peso bold, tamaño 32px, alineado a la izquierda.
Separación de 32px.
Campo de correo electrónico: Label Correo electrónico con asterisco rojo indicando campo requerido, en color azul oscuro peso medium tamaño 14px. Input de texto debajo con placeholder ej: correo@gmail.com en color gris claro, borde inferior de 1px color gris hexadecimal D1D5DB, sin bordes laterales ni superior, altura de 48px, tamaño de texto 16px. Sin fondo o fondo transparente.
Separación de 24px.
Campo de contraseña: Label Contraseña con asterisco rojo, en color azul oscuro peso medium tamaño 14px. Input de tipo password debajo con placeholder Escribe tu contraseña en color gris claro, borde inferior de 1px color gris, altura de 48px. A la derecha dentro del input, ícono de ojo tachado para mostrar/ocultar contraseña, color gris hexadecimal 9CA3AF, tamaño 20px, clickeable.
Separación de 16px.
Link de recuperación: Texto ¿Olvidaste tu contraseña? en color gris hexadecimal 6B7280 tamaño 14px, seguido de link Recupérala aquí en color azul hexadecimal 3B82F6 tamaño 14px con underline, clickeable.
Separación de 24px.
Componente reCAPTCHA: Rectángulo con borde de 1px color gris, border-radius de 4px, padding de 12px. Dentro, a la izquierda un checkbox cuadrado con borde gris. A la derecha del checkbox, texto No soy un robot en color gris oscuro tamaño 14px. En el extremo derecho, el logo de reCAPTCHA con el texto reCAPTCHA arriba y Privacidad - Condiciones abajo en tamaño muy pequeño. El usuario puede proporcionar el asset del reCAPTCHA o usar un placeholder representativo.
Separación de 24px.
Botón de iniciar sesión: Fondo rojo claro o rosa hexadecimal F87171 con opacidad reducida indicando estado deshabilitado hasta que se completen los campos. Texto Iniciar sesión en color blanco, peso semibold, tamaño 16px. Ancho de aproximadamente 180px, no ancho completo. Altura de 44px. Border-radius de 22px para efecto pill. Alineado a la izquierda.
Separación de 24px.
Texto de registro: ¿Aún no tienes cuenta Bold POS? en color gris hexadecimal 6B7280 tamaño 14px, seguido de link Crea tu cuenta en color azul hexadecimal 3B82F6 tamaño 14px con underline, clickeable.
Columna derecha ocupando aproximadamente el 55% del ancho:
Fondo que puede ser ligeramente diferente o con gradiente sutil para diferenciar de la columna izquierda.
Contenido centrado vertical y horizontalmente:
Mockup de dispositivo móvil mostrando la app de Bold POS. El mockup debe ser un teléfono con marco oscuro o negro, pantalla mostrando la interfaz de la app Bold POS con el home que incluye el resumen de ventas, herramientas, y botón de nueva venta. El usuario proporcionará el asset del mockup del teléfono.
A la derecha del mockup del teléfono, parcialmente visible y en segundo plano, una vista de la interfaz web o tablet mostrando el catálogo de productos, creando una composición visual que muestra Bold POS en múltiples dispositivos.
Cambio 5 - Conectar el flujo completo:
El flujo debe conectarse de la siguiente manera:
Click en avatar en TopBar abre el dropdown de perfil.
Click en Cerrar sesión en el dropdown abre el modal de confirmación de turno abierto.
Click en Cerrar turno en el modal cierra el turno y luego cierra sesión, navegando a la pantalla de Login.
Click en Cerrar sesión en el modal cierra sesión directamente sin cerrar turno, navegando a la pantalla de Login.
Click fuera del dropdown lo cierra sin acción.
Click fuera del modal no lo cierra ya que requiere una acción explícita.
RESUMEN: Mejorar íconos del toggle Mesas/Mostrador para que representen mejor cada modo operativo, el usuario proporcionará los assets. Crear dropdown de perfil que aparece al hacer click en el avatar mostrando nombre del usuario, opción Legal y privacidad, y opción Cerrar sesión. Crear modal de confirmación cuando hay turno abierto con ícono de alerta amarillo, mensaje de advertencia, y botones Cerrar turno outline y Cerrar sesión primario rojo, ambos con estilo pill redondeado. Crear pantalla de Login en alta fidelidad con layout de dos columnas, formulario con campos de correo y contraseña con bordes inferiores, reCAPTCHA, botón pill de iniciar sesión, y mockup de dispositivos móviles a la derecha, el usuario proporcionará assets del logo y mockups.