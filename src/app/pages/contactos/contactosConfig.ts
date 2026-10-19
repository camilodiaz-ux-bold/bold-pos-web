/** Configuración por tipo de contacto: Clientes y Proveedores comparten lista y formulario. */
export type TipoContacto = 'cliente' | 'proveedor';

export interface ContactoConfig {
  titulo: string;
  nuevo: string;
  base: string;
  /** Campo de `Contacto` que lo hace pertenecer a este listado. */
  flag: 'esCliente' | 'esProveedor';
  /** Solo proveedores muestran compras y cuentas por pagar. */
  conCompras: boolean;
  /** Pestañas del perfil, en orden. */
  tabs: { id: 'comprobantes' | 'ventas' | 'actividad' | 'compras'; label: string }[];
}

const TABS_BASE: ContactoConfig['tabs'] = [
  { id: 'comprobantes', label: 'Comprobantes' },
  { id: 'ventas', label: 'Facturas de venta' },
  { id: 'actividad', label: 'Actividad del contacto' },
];

export const CONTACTO_CONFIG: Record<TipoContacto, ContactoConfig> = {
  proveedor: {
    titulo: 'Proveedores', nuevo: 'Nuevo proveedor', base: '/proveedores', flag: 'esProveedor', conCompras: true,
    tabs: [...TABS_BASE, { id: 'compras', label: 'Facturas de compra' }],
  },
  cliente: {
    titulo: 'Clientes', nuevo: 'Nuevo cliente', base: '/clientes', flag: 'esCliente', conCompras: false,
    tabs: TABS_BASE,
  },
};
