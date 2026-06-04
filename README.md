# Bold POS Restaurantes — WEB

Dashboard administrativo web para la vertical de restaurantes de Bold POS. Dirigido al dueño o administrador del restaurante.

## Descripción
Adaptación de Bold POS Retail hacia una experiencia especializada para restaurantes. Permite visualizar ventas, ocupación de mesas, productos top y reportes desde un dashboard web.

## Stack
- React 18 + TypeScript + Vite + Tailwind CSS
- MUI + Radix UI + Lucide React + Recharts
- Fuente: Montserrat
- Deploy: GitHub Pages

## URLs
- Producción: https://camilodiaz-ux-bold.github.io/bold-pos-web/
- Local: http://localhost:5174/

## Cómo correr el proyecto localmente
npm install
npm run dev

## Cómo hacer deploy
git add -A && git commit -m "descripción" && git push origin main

GitHub Actions despliega automáticamente en ~2 minutos.

## Estructura principal
src/
  app/
    pages/        → Dashboard, Reportes, Home
    components/   → Layout, NavBar, TopNav, Panels

## Diseño
- Figma: https://www.figma.com/design/bU77l4k96jRMtG70DUWSqt/POS-Restaurantes-V1
- Design System: Merlin (Bold) — ver MERLIN-SYSTEM.md