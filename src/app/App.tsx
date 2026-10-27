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
import { AjustesProvider } from './store/ajustesStore';
import { ContactosProvider } from './store/contactosStore';
import { FacturasCompraProvider } from './store/facturasCompraStore';
import { FacturasCompraListPage } from './pages/compras/FacturasCompraListPage';
import { FacturaCompraFormPage } from './pages/compras/FacturaCompraFormPage';
import { FacturaCompraDetallePage } from './pages/compras/FacturaCompraDetallePage';
import { ContactosListPage } from './pages/contactos/ContactosListPage';
import { ContactoFormPage } from './pages/contactos/ContactoFormPage';
import { DocumentosVentaListPage } from './verticals/retail/ingresos/DocumentosVentaListPage';
import { DocumentoVentaDetallePage } from './verticals/retail/ingresos/DocumentoVentaDetallePage';
import { AjustesPage } from './verticals/retail/ajustes/AjustesPage';
import { PerfilPage } from './verticals/retail/ajustes/PerfilPage';

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
      { path: 'ajustes',               element: <VerticalRoute module="ajustes"><AjustesPage /></VerticalRoute> },
      { path: 'ajustes/perfil',        element: <VerticalRoute module="ajustes"><PerfilPage /></VerticalRoute> },
      { path: 'facturas-compra',        Component: FacturasCompraListPage },
      { path: 'facturas-compra/nueva',  Component: FacturaCompraFormPage },
      { path: 'facturas-compra/:id',    Component: FacturaCompraDetallePage },
      { path: 'clientes',                element: <ContactosListPage key="cliente" tipo="cliente" /> },
      { path: 'clientes/nuevo',          element: <ContactoFormPage key="cliente" tipo="cliente" /> },
      { path: 'clientes/:id/editar',     element: <ContactoFormPage key="cliente" tipo="cliente" /> },
      { path: 'proveedores',             element: <ContactosListPage key="proveedor" tipo="proveedor" /> },
      { path: 'proveedores/nuevo',       element: <ContactoFormPage key="proveedor" tipo="proveedor" /> },
      { path: 'proveedores/:id/editar',  element: <ContactoFormPage key="proveedor" tipo="proveedor" /> },
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
      <AjustesProvider>
        <ContactosProvider>
          <FacturasCompraProvider>
            <RouterProvider router={router} />
          </FacturasCompraProvider>
        </ContactosProvider>
      </AjustesProvider>
    </VerticalProvider>
  );
}
