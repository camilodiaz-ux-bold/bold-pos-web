# MERLIN-WEB

## COLORS

### Gradient
| Token | Value |
|---|---|
| gradient-horizontal | Blue/100 #121E6C → Coral/100 #EE424E (left to right) |
| gradient-vertical | Coral/100 #EE424E (top) → Blue/100 #121E6C (bottom) |

### Blue
| Token | Hex |
|---|---|
| Blue/Hover | #091144 |
| Blue/100 | #121E6C |
| Blue/80 | #1F2A74 |
| Blue/60 | #3E4983 |
| Blue/50 | #6C759F |
| Blue/40 | #969BBD |
| Blue/30 | #BABDD3 |
| Blue/20 | #D2D4E1 |
| Blue/10 | #F1F2F6 |

### Coral
| Token | Hex |
|---|---|
| Coral/Hover | #E4102E |
| Coral/100 | #FF2947 |
| Coral/60 | #F48990 |
| Coral/30 | #FCDFE2 |
| Coral/10 | #FEF1F3 |

### Black
| Token | Hex |
|---|---|
| Black/100 | #1E1E1E |
| Black/60 | #606060 |
| Black/40 | #969696 |
| Black/10 | #F3F3F3 |
| Black/0 | #FFFFFF |

### Background
| Token | Hex |
|---|---|
| Background/Page | #F7F8FB |

### Feedback — Error
| Token | Hex |
|---|---|
| Feedback/Error/200 | #610017 |
| Feedback/Error/150 | #910022 |
| Feedback/Error/100 | #C31A2F |
| Feedback/Error/10 | #FBF3F5 |

### Feedback — Warning
| Token | Hex |
|---|---|
| Feedback/Warning/200 | #5B3100 |
| Feedback/Warning/150 | #A16B00 |
| Feedback/Warning/100 | #FFC217 |
| Feedback/Warning/10 | #FFF3D1 |

### Feedback — Success
| Token | Hex |
|---|---|
| Feedback/Success/200 | #0B3B26 |
| Feedback/Success/150 | #1B8959 |
| Feedback/Success/100 | #6CDCAB |
| Feedback/Success/10 | #F4FDF9 |

### Feedback — Informative
| Token | Hex |
|---|---|
| Feedback/Informative/200 | #052D65 |
| Feedback/Informative/150 | #0A53A5 |
| Feedback/Informative/100 | #227AD1 |
| Feedback/Informative/10 | #F1F9FF |

### Pending
| Token | Hex |
|---|---|
| Pending (primary) | Black/100 #1E1E1E |

---

## TYPOGRAPHY

**Font/Family/Main:** Montserrat

### WEB Desktop (Large)
| Level | Token | Size | Line-Height | Weight |
|---|---|---|---|---|
| Header | [WEB]/Header/Large | 48px (Font/Size/xxxl) | 52px (Font/Height/xxl) | 500 |
| Title | [WEB]/Title/Large | 28px (Font/Size/xl) | 32px (Font/Height/lg) | 400 |
| Subtitle | [WEB]/Subtitle/Large | 16px (Font/Size/s) | 24px (Font/Height/s) | 600 |
| Body | [WEB]/Body/Large | 16px (Font/Size/s) | 24px (Font/Height/s) | 400 |
| Caption | [WEB]/Caption/Bold | 12px (Font/Size/xxs) | 16px (Font/Height/xxs) | 700 |

### WEB Tablet (Medium)
| Level | Size | Line-Height | Weight |
|---|---|---|---|
| Header | 32px | 40px | 500 |
| Title | 24px | 28px | 400 |
| Subtitle | 16px | 20px | 600 |
| Body | 16px | 20px | 400 |
| Caption | 12px | 16px | 700 |

### WEB Mobile (Small)
| Level | Size | Line-Height | Weight |
|---|---|---|---|
| Header | 24px | 32px | 500 |
| Title | 20px | 28px | 400 |
| Subtitle | 14px | 20px | 600 |
| Body | 14px | 20px | 400 |
| Caption | 12px | 14px | 700 |

### Font Size Tokens
| Token | Value |
|---|---|
| Font/Size/xxxl | 48px |
| Font/Size/xl | 28px |
| Font/Size/s | 16px |
| Font/Size/xxs | 12px |

### Font Height Tokens
| Token | Value |
|---|---|
| Font/Height/xxl | 52px |
| Font/Height/lg | 32px |
| Font/Height/s | 24px |
| Font/Height/xs | 20px |
| Font/Height/xxs | 16px |

---

## SPACING

(Derived from component usage)

| Value |
|---|
| 4px |
| 8px |
| 12px |
| 16px |
| 20px |
| 24px |
| 28px |
| 32px |
| 40px |
| 44px |
| 48px |
| 64px |
| 88px |

---

## BORDER RADIUS

| Name | Value |
|---|---|
| sm | 12px |
| md | 16px |
| lg | 18px |
| xl | 20px |
| pill | 32px |
| full | 100px |

---

## SHADOWS

Shadow color base: rgba(18, 30, 108, 0.08)

| Token | Value |
|---|---|
| Blue shadow/2 | 0px 4px 12px 0px rgba(18,30,108,0.08) |
| Blue shadow/4 | 0px 4px 16px 0px rgba(18,30,108,0.08) |
| Blue shadow/8 | 0px 8px 20px 0px rgba(18,30,108,0.08) |
| Blue shadow/12 | 0px 12px 28px 0px rgba(18,30,108,0.08) |

---

## COMPONENTS

### Button
**Node:** [WEB] Button

| Variant | Background | Text | Border |
|---|---|---|---|
| Primary | coral/100 (#FF2947) | black/0 (#FFFFFF) | — |
| Secondary | black/0 (#FFFFFF) | coral/100 (#FF2947) | — |
| Tertiary | background/page (#F7F8FB) | blue/100 (#121E6C) | — |
| Text Primary | — | coral/100 (#FF2947) | — |
| Text Secondary | — | blue/100 (#121E6C) | — |

| Size | Height | Padding H | Padding V | Font Size | Line Height |
|---|---|---|---|---|---|
| L (Desktop) | 48px | 24px | 12px | 16px | 20px |
| M (Tablet) | 40px | 24px | 12px | 16px | 20px |
| S (Mobile) | 40px | 24px | 12px | 16px | 20px |

| Floating Size | Height/Width |
|---|---|
| Default | 44px |
| Small | 40px |

- border-radius: 32px (pill)
- font-weight: 500 (Medium)
- states: Default, Hover, Focus, Disabled

---

### Alert
**Node:** [WEB/APP] Alert

| Variant | Background | Border |
|---|---|---|
| Warning | feedback/warning/10 (#FFF3D1) | feedback/warning/100 (#FFC217) |
| Info | — | — |

- width: 343px
- height: 64px
- border-radius: 16px
- font: 12px / 16px, 400, black/100 (#1E1E1E)
- gap: 12px
- padding: 12px

---

### Toast Notification
**Node:** [WEB/APP] Toast Notification

| Variant | Background |
|---|---|
| Success | #3F3F3F |
| Warning | #3F3F3F |
| Error | #3F3F3F |
| Info | #3F3F3F |
| Pending | #3F3F3F |

- width: 351px
- height: 64px
- border-radius: 16px
- font: 12px / 16px, 600, black/0 (#FFFFFF)
- padding: 12px
- gap: 12px

---

### Tags
**Node:** [WEB/APP] Tag

| Feedback | Background | Border | Text |
|---|---|---|---|
| Default | — | — | — |
| Success | feedback/success/10 (#F4FDF9) | feedback/success/150 (#1B8959) | feedback/success/150 (#1B8959) |
| Warning | feedback/warning/10 (#FFF3D1) | feedback/warning/100 (#FFC217) | feedback/warning/100 (#FFC217) |
| Error | feedback/error/10 (#FBF3F5) | feedback/error/150 (#910022) | feedback/error/150 (#910022) |
| Info | — | — | — |
| Pending | — | — | — |

| Size | Height | Padding H | Padding V | Font Size | Font Weight |
|---|---|---|---|---|---|
| Large | 44px | 16px | 12px | 14px | 600 |
| Small | 32px | — | — | — | 600 |

- border-radius: 100px (full pill)
- variants: Default, Contained, Naked
- states: Default, Selected, Disabled

---

### Text Input
**Node:** [WEB/APP] Text inputs

| Type | States | Height (SAS) | Height (Naked) | Height (Contained) |
|---|---|---|---|---|
| Input | Active, Filled, Hover, Disabled, Filled-Disabled, Error | 88px | 40px | 48px |
| Dropdown | Active, Filled, Hover, Disabled, Filled-Disabled, Error, Open | 88px | 40px | 48px |
| Phone | Active, Filled, Hover, Disabled, Filled-Disabled, Error | 88px | 40px | — |

- small variant height: 40px (contained/naked)

---

### Search Bar
**Node:** [WEB/APP] Search bar

- states: Default, Selected, Filled, Error
- color variants: Background, White
- height: 40px
- predictive search: On, Off

---

### Checkbox
**Node:** [WEB] Checkbox

- states: On, Off
- size: 32px × 24px

---

### Dropdown
**Node:** [APP / WEB] Dropdown

- states: Default, Hover, Disabled
- open: True, False
- size: 194px × 32px

---

### Toggle Switch
**Node:** [APP / WEB] Toggle switch

- states: On, Off
- label: On, Off
- size (no label): 52px × 28px
- size (with label): 69px × 56px

---

### Radiobutton
**Node:** [APP / WEB] Radiobutton
- section ID: 24630:13396

---

### Tooltip
**Node:** [APP / WEB] Tooltip
- section ID: 24630:16404

---

### Icons
**Node:** [APP / WEB] Icons
- section ID: 24630:12058

---

## PENDIENTES UI - COMENTARIOS LAURA

### VISTA MESAS
- Tabs Salón/Terraza/Barra → reemplazar por componente TABS + Indicador del DS (variantes: con número, sin número / estados: Default, Seleccionada)
- Cards de mesa → componente MESA del DS (variantes: plantilla, disponible, ocupada, deshabilitada, cuenta solicitada / estados: Default, Seleccionada / momentos: Default, En configuración / formas: Cuadrada, Redonda)
- Mesa seleccionada debe resaltarse en el mapa y en el panel lateral simultáneamente
- Badge OCUPADA → componente ETIQUETA MESA del DS
- Botones del panel lateral → WEB Button del DS
- Botones de navegación del panel → componente propio (boolean: con icono/sin icono / estados: Default, Click, Hover)
- Sidebar izquierdo → WEB Menu/Panel del DS
- Tags de estado footer → WEB/APP Tag del DS
- Contador de cantidad → Text input/Counter del DS
- Toast de confirmación (comanda enviada) → WEB/APP Toast Notification del DS

### GESTIONAR MESAS
- Campo nombre → Text inputs del DS
- Selector de zona → evaluar integrar componente Tags dentro del dropdown
- Forma y Orientación → WEB Card/Selection del DS (evaluar si requiere variantes nuevas)

### VISTA PRODUCTOS
- Cards de producto → componente PRODUCTOS del DS
  Variantes: Producto principal (Menú) y Producto agregado (Dashboard)
  Colores por categoría: Entrada fría, Entrada caliente, Pastas, Carnes, Pescados, Postres, Bebidas (8-10 lógicas)
  Estados: Default, Seleccionada
  Adicionales: favoritos (estrella) y cantidad (globo)

## Drawer Lateral de Producto

Panel deslizante de edición de un ítem del pedido. Se abre al hacer click en cualquier ítem ya agregado en el panel lateral del pedido (mesa OCUPADA). El click directo en una card del catálogo siempre agrega el producto al pedido sin abrir el drawer.

### Contenedor
- `position: fixed`, `right: 0`, `top: 0`, `height: 100vh`, `width: min(549px, 100vw)`
- `backgroundColor: white`, `boxShadow: -4px 0 24px rgba(0,0,0,0.14)`, `zIndex: 1100`
- `display: flex`, `flexDirection: column`
- Overlay detrás: `rgba(0,0,0,0.32)`, `zIndex: 1099`

### Header (fijo, no hace scroll)
- Altura: `72px`, `padding: 0 24px`
- `display: flex`, `alignItems: center`, `justifyContent: space-between`
- `borderBottom: 2px solid #F0F0F0`
- **Lado izquierdo:** rectángulo de color de categoría (`8px × 32px`, `borderRadius: 4px`, color sólido de `catDef.color`) + nombre del producto (`20px / 700 / #1E1E1E / Montserrat`) + nombre de categoría debajo (`12px / 500`, color de la categoría)
- **Lado derecho:** botón X (`X` de Lucide, `22px`, `#606060`, sin borde, fondo transparente)

### Body (scrolleable)
- `flex: 1`, `overflowY: auto`, `padding: 24px`, `gap: 16px`
- **Estilo MERLin** para todos los inputs: `border: 1px solid #E0E0E0`, `background: #F5F5F5`, `borderRadius: 8px`, `padding: 10px 12px`, `fontSize: 15px`, `fontFamily: Montserrat`
- **Labels:** `12px / 600 / #1E1E1E`

**Campos en orden:**
1. **Fila 1** — grid 2 columnas, `gap: 16px`: Campo "Cantidad" (`input[type=number]`, mín 1) + Campo "Descuento" (`select`: Sin descuento, 5%, 10%, 15%, 20%)
2. **Precio unitario** — `input[type=number]`. Label incluye precio total calculado a la derecha: `"Total: $XX.XXX"` (`11px / #606060`)
3. **Separador** — `1px solid #F0F0F0`
4. **Nota para cocina** — `textarea`, `minHeight: 80px`, placeholder `"Ej: sin cebolla, término 3/4, salsa aparte..."`. Label con ícono `ChefHat` (`13px`) a la izquierda

### Footer (fijo)
- `padding: 16px 24px`, `borderTop: 1px solid #F0F0F0`, `gap: 12px`
- **Botón "Eliminar del pedido":** `flex: 1`, `height: 44px`, `borderRadius: 8px`, `border: 1.5px solid #FF2947`, fondo blanco, texto `#FF2947`, `14px / 600`, ícono `Trash2 14px`
- **Botón "Guardar cambios":** `flex: 1`, `height: 44px`, `borderRadius: 8px`, fondo `#121E6C`, texto blanco, `14px / 600`, ícono `Check 14px`
- Al guardar: actualiza `quantity`, `price`, `note` del ítem y cierra el drawer

### Nota en panel del pedido
- Cuando el ítem tiene nota, se muestra debajo del precio: `11px / italic / #606060`
- `whiteSpace: nowrap`, `overflow: hidden`, `textOverflow: ellipsis` (máximo 1 línea)
- Si no hay nota, no se muestra nada
- La nota solo se gestiona desde el drawer (no hay edición inline)
