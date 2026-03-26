import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { RootLayout } from './components/RootLayout';
import { HomePage } from './pages/HomePage';
import { ReportesPage } from './pages/ReportesPage';
import { ReporteDetallePage } from './pages/ReporteDetallePage';
import { Dashboard } from './pages/Dashboard';
import { TurnosPage } from './pages/TurnosPage';

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'reportes', Component: ReportesPage },
      { path: 'reportes/restaurantes/:id', Component: ReporteDetallePage },
      { path: 'inicio', Component: Dashboard },
      { path: 'turnos', Component: TurnosPage },
    ],
  },
], { basename: import.meta.env.BASE_URL });

export default function App() {
  return <RouterProvider router={router} />;
}
