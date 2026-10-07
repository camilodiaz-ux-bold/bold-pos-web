import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { RootLayout } from './components/RootLayout';
import { HomePage } from './pages/HomePage';
import { ReportesPage } from './pages/ReportesPage';
import { ReporteDetalleRoute } from './pages/ReporteDetallePage';
import { Dashboard } from './pages/Dashboard';
import { TurnosPage } from './pages/TurnosPage';
import { VentasPage } from './pages/VentasPage';
import { PedidoDetallePage } from './pages/PedidoDetallePage';
import { ItemsLayout } from './pages/items/ItemsLayout';
import { ListaItemsPage } from './pages/items/ListaItemsPage';
import { ItemFormPage } from './pages/items/ItemFormPage';
import { StatusPage } from '../pages/StatusPage';
import { MakersLanding } from '../pages/MakersLanding';
import { VerticalProvider, VerticalRoute } from './vertical';
import { DocumentosVentaListPage } from './verticals/retail/ingresos/DocumentosVentaListPage';
import { DocumentoVentaDetallePage } from './verticals/retail/ingresos/DocumentoVentaDetallePage';

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'reportes', Component: ReportesPage },
      { path: 'reportes/restaurantes/:id', Component: ReporteDetalleRoute },
      { path: 'inicio', Component: Dashboard },
      { path: 'turnos', Component: TurnosPage },
      { path: 'ventas', Component: VentasPage },
      { path: 'ventas/:id', Component: PedidoDetallePage },
      { path: 'comprobantes',        element: <VerticalRoute module="comprobantes"><DocumentosVentaListPage key="comprobante" tipo="comprobante" /></VerticalRoute> },
      { path: 'comprobantes/:id',    element: <VerticalRoute module="comprobantes"><DocumentoVentaDetallePage key="comprobante" tipo="comprobante" /></VerticalRoute> },
      { path: 'facturas-venta',      element: <VerticalRoute module="facturas-venta"><DocumentosVentaListPage key="factura" tipo="factura" /></VerticalRoute> },
      { path: 'facturas-venta/:id',  element: <VerticalRoute module="facturas-venta"><DocumentoVentaDetallePage key="factura" tipo="factura" /></VerticalRoute> },
      {
        path: 'items',
        Component: ItemsLayout,
        children: [
          { index: true, Component: ListaItemsPage },
          { path: 'nuevo', Component: ItemFormPage },
          { path: ':id/editar', Component: ItemFormPage },
        ],
      },
    ],
  },
  { path: '/status', Component: StatusPage },
  { path: '/makers', Component: MakersLanding },
], { basename: import.meta.env.BASE_URL });

export default function App() {
  return (
    <VerticalProvider>
      <RouterProvider router={router} />
    </VerticalProvider>
  );
}
