# CLAUDE.md — Bold POS Restaurantes WEB

## Qué es este proyecto
Dashboard administrativo web del sistema Bold POS Restaurantes V1. Está dirigido al dueño o administrador del restaurante, no al mesero. Es una adaptación de Bold POS Retail, no un producto nuevo desde cero. Este es un prototipo visual no el proyecto real.

## Stack técnico
- React 18 + TypeScript + Vite + Tailwind CSS
- MUI + Radix UI + Lucide React + Recharts
- Fuente: Montserrat (Google Fonts)
- Router: React Router v7 con basename: import.meta.env.BASE_URL
- Deploy: GitHub Pages via GitHub Actions (push a main)
- Puerto local: http://localhost:5173/bold-pos-web/

## Rutas
/ → HomePage
/inicio → Dashboard
/turnos → TurnosPage
/ventas → VentasPage
/ventas/:id → PedidoDetallePage
/reportes → ReportesPage
/reportes/restaurantes/:id → ReporteDetallePage
/items → ListaItemsPage
/items/nuevo → ItemFormPage (crear)
/items/:id/editar → ItemFormPage (editar)

## Design System — Merlin
- Fuente siempre Montserrat
- Nunca hardcodear colores, usar siempre variables CSS del sistema
- Variables clave: --blue-10, --blue-20, --blue-100, --black-10, --black-100
- Referencia visual en MERLIN-SYSTEM.md

## Specs de producto
- Los specs viven en `specs/`, con la convención descrita en `specs/README.md`.
- Nombre de archivo: `AAAA-MM-nombre-feature.md`. Cada spec nuevo agrega su fila al índice del README.
- Antes de implementar una feature, leer su spec completo en `specs/` — complementa a este CLAUDE.md, no lo reemplaza.
- Un spec marcado `✅ Implementado` se congela: no se edita más. Un cambio de alcance posterior se escribe como spec nuevo que referencia al anterior como antecedente.

## Reglas críticas
- NO modificar el router ni el basename
- NO hardcodear colores ni tipografías fuera del design system
- NO tocar vite.config.ts ni deploy.yml salvo que se indique explícitamente
- Antes de editar cualquier componente, confirmar el archivo correcto con grep
- Si existe un spec en `specs/` para lo que se está construyendo, ese spec manda sobre supuestos propios
- NO hacer push directo a `main` ni a `develop` — ver "Flujo de Git" abajo

## Flujo de Git
- `main` y `develop` son ramas protegidas: **jamás** se les hace push directo (un push a `main` dispara deploy automático a producción vía GitHub Actions).
- Todo trabajo se hace en una branch nueva (`bn-feature/...`, `bn-fix/...`, etc.), creada desde `origin/main` actualizado.
- Flujo de integración, siempre en este orden:
  1. PR desde la branch de trabajo → `develop`.
  2. Una vez validado en `develop`, otro PR desde la **misma branch de trabajo** → `main`.
- No cerrar/mergear una branch de trabajo hasta tener ambos PRs (develop y main) aprobados.

## Comandos útiles
npm install && npm run dev        → Dev server
rm -rf dist && npm run build      → Build limpio
git checkout -b bn-feature/mi-cambio origin/main → Nueva branch de trabajo
gh pr create --base develop      → Abrir PR hacia develop
gh pr create --base main         → Abrir PR hacia main (después de validar en develop)