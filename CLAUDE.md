# CLAUDE.md — Bold POS Restaurantes WEB

## Qué es este proyecto
Dashboard administrativo web del sistema Bold POS Restaurantes V1. Está dirigido al dueño o administrador del restaurante, no al mesero. Es una adaptación de Bold POS Retail, no un producto nuevo desde cero.

## Stack técnico
- React 18 + TypeScript + Vite + Tailwind CSS
- MUI + Radix UI + Lucide React + Recharts
- Fuente: Montserrat (Google Fonts)
- Router: React Router v7 con basename: import.meta.env.BASE_URL
- Deploy: GitHub Pages via GitHub Actions (push a main)
- Puerto local: http://localhost:5174/

## Rutas
/ → HomePage
/inicio → Dashboard
/reportes → ReportesPage
/reportes/restaurantes/:id → ReporteDetallePage

## Design System — Merlin
- Fuente siempre Montserrat
- Nunca hardcodear colores, usar siempre variables CSS del sistema
- Variables clave: --blue-10, --blue-20, --blue-100, --black-10, --black-100
- Referencia visual en MERLIN-SYSTEM.md

## Reglas críticas
- NO modificar el router ni el basename
- NO hardcodear colores ni tipografías fuera del design system
- NO tocar vite.config.ts ni deploy.yml salvo que se indique explícitamente
- Antes de editar cualquier componente, confirmar el archivo correcto con grep

## Comandos útiles
npm install && npm run dev        → Dev server
rm -rf dist && npm run build      → Build limpio
git add -A && git commit -m "" && git push origin main → Deploy