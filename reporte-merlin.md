# Reporte de Adopción — Design System Merlin en Bold POS Restaurantes Web

_Generado el 24 de marzo de 2026_

---

## Resumen ejecutivo

De los **12 componentes** definidos en el DS Merlin (MERLIN-WEB.md), el proyecto tiene **6 implementados** (algunos parcialmente), **4 presentes como scaffolding shadcn** sin alineación completa con las especificaciones Merlin, y **2 componentes compuestos pendientes** identificados en la sección "PENDIENTES UI".

**Adopción estimada: ~50 % de los componentes del DS están activos en el proyecto.**

---

## Tokens de diseño

Los tokens de color, tipografía, espaciado, border-radius y sombras de Merlin están **completamente implementados** como CSS custom properties en `src/styles/tokens.css`.

Todos los componentes del proyecto consumen estos tokens directamente (por ejemplo, `var(--coral-100)`, `var(--blue-100)`, `var(--feedback-warning-10)`, etc.). Esta es la base más sólida del proyecto.

---

## Componentes YA implementados

### 1. Button ✅ (parcial)

**Dónde se usa:** LoginScreen, SignupScreen, RootLayout (modal logout), MesasView, CheckoutDrawer, OnboardingFlow.

Los botones usan los colores correctos de Merlin: Primary con `coral-100`, Secondary con borde `coral-100` fondo transparente, y variantes de texto con `blue-100`. Sin embargo, el `border-radius` en uso es `8px` (`--radius-8`) en vez del `32px` (pill) especificado en el DS. Existe también el componente `ui/button.tsx` (shadcn) pero sus variantes no siguen la nomenclatura Merlin.

**Pendiente:** migrar a `border-radius: 32px` y formalizar las variantes Primary, Secondary, Tertiary, Text Primary y Text Secondary.

---

### 2. Toast Notification ✅

**Dónde se usa:** RootLayout (Toaster global), MesasView, GestionarMesasView, CheckoutDrawer, MesaProductSelector, BoldNavBar, ReportesPanel.

Implementado mediante la librería `sonner`. Se disparan toasts de tipo Success, Warning y Error usando `toast()` en múltiples flujos: envío de comanda, acciones de mesa, errores de pago. Los colores base coinciden con la especificación Merlin.

---

### 3. Text Input ✅ (parcial)

**Dónde se usa:** LoginScreen y SignupScreen (campos de email, contraseña, datos del restaurante).

Existe un estilo `merlinInput` definido inline en LoginScreen que implementa los atributos del DS: fuente Montserrat, border `black-10`, focus con `blue-100` y shadow `blue-10`. También existe `ui/input.tsx` (shadcn). No se está respetando el height de 88px (SAS) o los 48px (Contained) del DS — se usa un padding personalizado más compacto.

---

### 4. Search Bar ✅ (parcial)

**Dónde se usa:** MostradorCatalog (buscador de productos), MesaProductSelector (búsqueda al agregar items a una mesa), GestionarMesasView (búsqueda de mesas).

Implementado como input con ícono de lupa (lucide-react). Funcional, pero construido de forma ad hoc, sin seguir las especificaciones del DS (height 40px, estados Default/Selected/Filled/Error, variantes Background/White).

---

### 5. Tags / Status Badge ✅ (parcial)

**Dónde se usa:** MesasView (estados de mesa: Disponible, Ocupada, Cuenta solicitada, Inhabilitada), CheckoutDrawer (badges de cuenta en split), BoldNavBar.

Los tags de estado de mesa usan los colores Merlin correctos (coral, blue, feedback) a través de CSS classes `status-badge`. También existe `ui/badge.tsx` (shadcn). Sin embargo no siguen la especificación formal del DS (height 44px Large / 32px Small, border-radius 100px pill, variantes Default/Contained/Naked).

---

### 6. Icons ✅

**Dónde se usa:** En todo el proyecto.

Se usa `lucide-react` como librería de íconos de forma consistente en todos los componentes. Cubre la categoría Icons del DS.

---

## Componentes presentes como scaffolding (sin alineación Merlin)

Estos archivos existen en `src/app/components/ui/` (generados por shadcn) pero no se usan activamente en las vistas principales o no siguen las especificaciones de Merlin:

- **Checkbox** (`ui/checkbox.tsx`) — El DS especifica 32×24px. El componente shadcn no está siendo consumido en las vistas actuales; LoginScreen tiene un checkbox inline propio.
- **Dropdown** (`ui/dropdown-menu.tsx` / `ui/select.tsx`) — Scaffolding shadcn, sin uso activo siguiendo spec Merlin (194×32px, estados Default/Hover/Disabled).
- **Toggle Switch** (`ui/switch.tsx`) — Scaffolding shadcn presente pero no usado con las dimensiones del DS (52×28px sin label / 69×56px con label).
- **Radiobutton** (`ui/radio-group.tsx`) — Scaffolding shadcn, sin uso activo.
- **Tooltip** (`ui/tooltip.tsx`) — Scaffolding shadcn, sin uso verificado en vistas principales.
- **Alert** (`ui/alert.tsx`) — Scaffolding shadcn. El modal de logout en RootLayout implementa una alerta visual, pero no usa el componente formal del DS (343px × 64px, border-radius 16px, variantes Warning/Info).

---

## Componentes del DS NO implementados (pendientes formales)

Identificados en la sección "PENDIENTES UI — COMENTARIOS LAURA" del MERLIN-WEB.md:

| Componente | Vista donde aplica | Descripción |
|---|---|---|
| **TABS** | Vista Mesas (Salón / Terraza / Barra) | Actualmente es una implementación custom. Debe reemplazarse por el componente Tabs del DS con indicador de número. |
| **Card Mesa** | Vista Mesas | Las cards del mapa de mesas son SVG custom. El DS define variantes: plantilla, disponible, ocupada, deshabilitada, cuenta solicitada. |
| **Etiqueta Mesa** | Vista Mesas | El badge "OCUPADA" sobre la card de mesa debe usar el componente Etiqueta Mesa del DS. |
| **Menu / Panel** | Sidebar izquierdo (Vista Mesas) | El sidebar de navegación izquierdo debe migrar al componente WEB Menu/Panel del DS. |
| **Counter (Text Input)** | Panel lateral de mesa | El contador de cantidad de items se implementa de forma inline. Debe usar Text Input/Counter del DS. |
| **Card/Selection** | Gestionar Mesas (forma y orientación) | Las opciones de forma/orientación de mesa deben usar WEB Card/Selection del DS. |
| **Card Producto** | Vista Productos (Mostrador y Mesas) | Las product cards son implementaciones custom. El DS define componente PRODUCTOS con variantes Menú/Dashboard, colores por categoría y estados Default/Seleccionada. |

---

## Conclusión

El proyecto tiene una base sólida de tokens Merlin aplicados y funcionalidades core como Toasts y Buttons activos. El trabajo pendiente más crítico es la implementación de los componentes compuestos específicos de la experiencia de restaurante: Cards de Mesa, Tabs de zona, Cards de Producto y el Panel/Sidebar, que actualmente son soluciones ad hoc que no consumen los componentes formales del DS.
