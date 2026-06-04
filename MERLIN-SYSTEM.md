# Merlin Design System — Referencia Unificada
> Combina `MERLIN-TOKENS.md` (v1.5.1 · APP) y `MERLIN-WEB.md` (WEB/Dashboard)
> Última actualización: 2026-06-03
> Fuente Figma: `iVTvOaS6i0rqRoOq3ZJZH2`

---

## 1. COLORES

### 1.1 Paleta completa con CSS variables

```css
:root {
  /* ── Brand Blue ── */
  --blue-hover:   #091144;
  --blue-100:     #121e6c;   /* Títulos, CTAs secundarios, labels */
  --blue-80:      #1f2a74;
  --blue-60:      #3e4983;
  --blue-50:      #6c759f;
  --blue-40:      #969bbd;
  --blue-30:      #babdd3;   /* Deshabilitado / subtle */
  --blue-20:      #d2d4e1;
  --blue-10:      #f1f2f6;   /* Fondo botón Tertiary */

  /* ── Coral / CTA ── */
  --coral-hover:  #e4102e;
  --coral-100:    #ff2947;   /* CTA primario, destructivo, ocupado */
  --coral-60:     #f48990;   /* (WEB) / #ffb2bc (APP) — deshabilitado fondo */
  --coral-30:     #fcdfe2;   /* (WEB) / #ffdfe4 (APP) — deshabilitado texto */
  --coral-10:     #fef1f3;

  /* ── Neutrals ── */
  --black-100:    #1e1e1e;   /* Texto body principal */
  --black-60:     #606060;   /* Placeholder, helper text */
  --black-40:     #969696;   /* Texto deshabilitado, helper alt */
  --black-10:     #f3f3f3;   /* Hover state inputs */
  --black-0:      #ffffff;   /* Fondo cards, botón secondary, white */

  /* ── Background ── */
  --background-page: #f7f8fb;  /* Fondo pantalla, inputs activos */

  /* ── Gradientes ── */
  --gradient-horizontal: linear-gradient(to right, #121e6c, #ee424e);
  --gradient-vertical:   linear-gradient(to bottom, #ee424e, #121e6c);

  /* ── Feedback / Error ── */
  --error-200:    #610017;
  --error-150:    #910022;   /* Border y texto de error */
  --error-100:    #c31a2f;
  --error-10:     #fbf3f5;

  /* ── Feedback / Warning ── */
  --warning-200:  #5b3100;
  --warning-150:  #a16b00;
  --warning-100:  #ffc217;
  --warning-10:   #fff3d1;

  /* ── Feedback / Success ── */
  --success-200:  #0b3b26;
  --success-150:  #1b8959;
  --success-100:  #6cdcab;
  --success-10:   #f4fdf9;

  /* ── Feedback / Informative ── */
  --info-200:     #052d65;
  --info-150:     #0a53a5;
  --info-100:     #227ad1;
  --info-10:      #f1f9ff;
}
```

### 1.2 Mapa semántico rápido

| Uso | Token | Valor |
|---|---|---|
| CTA primario / botón principal | `--coral-100` | `#ff2947` |
| Hover CTA | `--coral-hover` | `#e4102e` |
| Títulos / labels / nav | `--blue-100` | `#121e6c` |
| Texto body | `--black-100` | `#1e1e1e` |
| Placeholder / helper | `--black-60` | `#606060` |
| Texto deshabilitado | `--black-40` | `#969696` |
| Fondo página | `--background-page` | `#f7f8fb` |
| Hover inputs | `--black-10` | `#f3f3f3` |
| White / cards | `--black-0` | `#ffffff` |
| Error | `--error-150` | `#910022` |
| Pending | `--black-100` | `#1e1e1e` |

---

## 2. TIPOGRAFÍA

**Font family única:** `Montserrat` — nunca usar SF Pro ni system fonts en web.

```css
:root {
  --font-family: 'Montserrat', sans-serif;

  /* Tamaños */
  --font-size-xxxl: 48px;   /* WEB Header Desktop */
  --font-size-xl:   28px;   /* WEB Title Desktop */
  --font-size-s:    16px;   /* WEB Subtitle / Body / APP Title */
  --font-size-xs:   14px;   /* APP Body / botones / inputs / labels */
  --font-size-xxs:  12px;   /* Caption / link small */

  /* Line heights */
  --font-height-xxl: 52px;
  --font-height-lg:  32px;
  --font-height-s:   24px;
  --font-height-xs:  20px;
  --font-height-xxs: 16px;

  /* Pesos */
  --font-weight-regular:  400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;
}
```

### 2.1 Estilos de texto — WEB Desktop

| Nivel | Size | Weight | Line-Height |
|---|---|---|---|
| Header | 48px | 500 | 52px |
| Title | 28px | 400 | 32px |
| Subtitle | 16px | 600 | 24px |
| Body | 16px | 400 | 24px |
| Caption | 12px | 700 | 16px |

### 2.2 Estilos de texto — WEB Tablet

| Nivel | Size | Weight | Line-Height |
|---|---|---|---|
| Header | 32px | 500 | 40px |
| Title | 24px | 400 | 28px |
| Subtitle | 16px | 600 | 20px |
| Body | 16px | 400 | 20px |
| Caption | 12px | 700 | 16px |

### 2.3 Estilos de texto — WEB Mobile / APP

| Nivel | Size | Weight | Line-Height |
|---|---|---|---|
| Header | 24px | 500 | 32px |
| Title | 20px | 400 | 28px |
| Subtitle/APP Title | 16px | 600/700 | 20px |
| Body | 14px | 400–700 | 20px |
| Caption | 12px | 400/600/700 | 14–16px |
| Link/Small | 12px | 600 | 16px |

---

## 3. ESPACIADO

Escala base de espaciado (usar múltiplos de 4px):

```
4px · 8px · 12px · 16px · 20px · 24px · 28px · 32px · 40px · 44px · 48px · 64px · 88px
```

| Concepto | Valor |
|---|---|
| Margen lateral safe area | 16px |
| Contenido útil (APP) | 343px |
| Safe area width (APP) | 375px |
| Gap entre cards/secciones | 24px |
| Gap entre elementos internos | 16px |
| Gap label → campo | 4px |
| Gap icono → texto | 8–16px |
| Padding card interno | 16px |
| Padding drop up | 24px 16px 20px |
| Padding botón action | 8px 16px |
| Padding botón default | 24px 25px |

---

## 4. BORDER RADIUS

```css
:root {
  --radius-sm:   12px;   /* Inputs, botones Action */
  --radius-md:   16px;   /* Cards, alerts, toasts */
  --radius-lg:   18px;
  --radius-xl:   20px;
  --radius-pill: 32px;   /* Botones WEB default, drop up top */
  --radius-full: 100px;  /* Botones APP default, tags */
}
```

---

## 5. SOMBRAS

```css
:root {
  --shadow-2:      0px 4px 12px 0px rgba(18, 30, 108, 0.08);
  --shadow-4:      0px 4px 16px 0px rgba(18, 30, 108, 0.08);
  --shadow-8:      0px 8px 20px 0px rgba(18, 30, 108, 0.08);
  --shadow-12:     0px 12px 28px 0px rgba(18, 30, 108, 0.08);
  --shadow-dropup: 0px -4px 8px rgba(0, 0, 0, 0.12);
}
```

---

## 6. BOTONES

### 6.1 Variantes de color (APP y WEB)

| Variante | Fondo | Texto | Border |
|---|---|---|---|
| Primary | `#ff2947` | `#ffffff` | — |
| Secondary | `#ffffff` | `#ff2947` | — |
| Tertiary | `#f1f2f6` | `#121e6c` | — |
| Text Primary | — | `#ff2947` | underline |
| Text Secondary | — | `#121e6c` | underline |
| Primary Disabled | `#ffb2bc` | `#ffdfe4` | — |
| Secondary Disabled | `#ffffff` | `#ffb2bc` | — |

### 6.2 Dimensiones WEB

| Tamaño | Height | Padding H | Font Size | Border Radius |
|---|---|---|---|---|
| L (Desktop) | 48px | 24px | 16px | 32px (pill) |
| M (Tablet) | 40px | 24px | 16px | 32px (pill) |
| S (Mobile) | 40px | 24px | 16px | 32px (pill) |
| Floating Default | 44px | — | — | 32px |
| Floating Small | 40px | — | — | 32px |

### 6.3 Dimensiones APP

| Tipo | Height | Border Radius | Padding | Font |
|---|---|---|---|---|
| Default | **48px** ← inmutable | 100px (pill) | 24px 25px | 16px / Medium 500 |
| Action | 40px | 12px | 8px 16px | 14px / Semibold 600 |

### 6.4 Reglas críticas

- APP Default: máximo **2 por pantalla**. Para más acciones usar APP Action.
- Texto en **normal** (sin UPPERCASE).
- Botón fijo (fixed=true): ocupa 375px full width.
- No usar botones APP en contexto WEB y viceversa.

---

## 7. TEXT INPUTS

### 7.1 Estados

| Estado | Fondo | Border | Texto | Opacidad |
|---|---|---|---|---|
| Active | `#f7f8fb` | ninguno | `#606060` | 100% |
| Hover | `#f3f3f3` | ninguno | `#606060` | 100% |
| Filled | `#f7f8fb` | ninguno | `#1e1e1e` | 100% |
| Error | `#ffffff` | 1px `#910022` | `#1e1e1e` | 100% |
| Disabled | `#f7f8fb` | ninguno | `#606060` | 50% |
| Open (dropdown) | `#f7f8fb` | ninguno | `#606060` | 100% |

### 7.2 Dimensiones

```
Width:              339px (safe area 375px − 18px margen × 2)
Height (SAS):       88px  (label + campo)
Height (Naked):     40px
Height (Contained): 48px
Border-radius:      12px
Padding campo:      12px
Gap label → campo:  4px

Label:       SemiBold 14px / #121e6c
Placeholder: Regular 14px / #606060
Filled:      Medium 14px / #1e1e1e
Helper:      Regular 12px / #969696
Error:       Regular 12px / #910022
```

### 7.3 Regla label / placeholder

> **Label** = qué se le pide al usuario.
> **Placeholder** = instrucción aclaratoria o ejemplo.
> Nunca repetir el mismo texto en los dos.

---

## 8. COMPONENTES UI

### 8.1 Alert

| Variante | Fondo | Border |
|---|---|---|
| Warning | `#fff3d1` | `#ffc217` |
| Info | — | — |

```
Width: 343px · Height: 64px · Radius: 16px
Font: 12px / 16px / Regular / #1e1e1e
Gap: 12px · Padding: 12px
```

### 8.2 Toast Notification

Todas las variantes usan fondo `#3f3f3f` (dark).

```
Width: 351px · Height: 64px · Radius: 16px
Font: 12px / 16px / SemiBold / #ffffff
Padding: 12px · Gap: 12px
Variantes: Success · Warning · Error · Info · Pending
```

### 8.3 Tags

| Variante | Fondo | Border | Texto |
|---|---|---|---|
| Success | `#f4fdf9` | `#1b8959` | `#1b8959` |
| Warning | `#fff3d1` | `#ffc217` | `#ffc217` |
| Error | `#fbf3f5` | `#910022` | `#910022` |

```
Large: 44px · Padding H: 16px · Font: 14px / SemiBold
Small: 32px
Border-radius: 100px (pill)
Variantes: Default · Contained · Naked
Estados: Default · Selected · Disabled
```

### 8.4 Drop Ups (APP)

```
Overlay:          rgba(30, 30, 30, 0.70)
Sheet bg:         #ffffff
Border-radius:    32px 32px 0 0
Shadow:           0px -4px 8px rgba(0,0,0,0.12)
Padding:          24px 16px 20px
Handle:           4px alto · 36px ancho · #d1d3d9 · radius 2px

Header:
  Altura: ~52px · Padding H: 16px · Gap: 20px
  Título: Bold 16px / #121e6c

Footer botones:
  Padding: 24px top + 20px bottom
  Width: 339px (fixed)
```

| Variante | Node ID |
|---|---|
| Feedback | `5042:10533` |
| Illustration | `5042:10568` |
| Selection (List/Grid) | `5042:10671` |
| Input | `49946:4951` |
| Informative | `15826:5249` |
| Search | `44850:6867` |

### 8.5 Otros componentes

| Componente | Dimensión clave |
|---|---|
| Checkbox | 32px × 24px |
| Dropdown | 194px × 32px |
| Toggle (sin label) | 52px × 28px |
| Toggle (con label) | 69px × 56px |
| Search bar | height 40px |
| Icon estándar | 24×24px |
| Icon small (chevrons) | 20×20px |

---

## 9. ICONOS CATALOGADOS

| Nombre | Node ID | Tamaño |
|---|---|---|
| `ic_credit` | `82:2209` | 24×24 |
| `ic_star` | `82:2273` | 24×24 |
| `ic_chevron` | `199:1182` | 20×20 |
| `ic_error` | `7438:22283` | 24×24 |
| `ic_check_contained` | `7438:22277` | 24×24 |
| `ic_tooltip` | `1409:8656` | 24×24 |
| `ic_close_navigation` | `34493:26538` | 24×24 |
| `ic_bullet` | `32941:1576` | 16×16 |
| `ic_close/Bold/Small` | `32941:1583` | 16×16 |
| `ic_feedback` | `5042:10466` | 48×48 |

---

## 10. REGLAS DE USO

| Regla | Detalle |
|---|---|
| Font única | Solo `Montserrat`. Nunca SF Pro ni system font en web |
| Botones APP ≠ WEB | APP: texto normal, pill 100px. WEB: pill 32px. No mezclar |
| Altura botón APP Default | `48px` — nunca modificar |
| Máximo botones por pantalla | 2 APP Button/Default; más → usar Action |
| Inputs width | `339px` dentro del safe area `375px` |
| Drop ups | Siempre desde abajo con overlay, nunca centrados |
| Label ≠ Placeholder | No repetir el mismo texto en los dos campos |
| Botón fijo | Si `fixed=true` → full width 375px |
| Dark mode | Solo el prototipo ChatBot lo usa — la app principal es light |
| Gradiente | Solo para elementos decorativos de marca, no en UI funcional |

---

## 11. NOTAS DE IMPLEMENTACIÓN — bolbot POS

### Color primario actual vs Merlin oficial
El proyecto usaba `#E8194B` (coral Bold v1). Merlin usa `#ff2947`. Al migrar:
- Reemplazar `--color-primary` por `--coral-100: #ff2947`
- El hover correcto es `--coral-hover: #e4102e` (no `#C41540`)

### Fuente
El proyecto usa Tailwind CDN. Agregar Montserrat vía Google Fonts en el `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Pendientes de extracción desde Figma
| Componente | Estado |
|---|---|
| Cards | Pendiente |
| Tabs | Pendiente |
| Tags (completo) | Parcial |
| Colors page completa | Pendiente |
| Tipografía page completa | Parcial |
