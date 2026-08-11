import type { SelfServicePlan } from '../types';

/**
 * Fuente de datos: vertical "Restaurantes" de saas-selfservice/planes.html
 * (planes rest-esencial / rest-avanzado / rest-ilimitado), simplificada para
 * el slice 1: sin personalización de sucursales/usuarios ni addons — solo
 * el feature set base de cada plan. Precios y contenido son mock data.
 */
export const SELF_SERVICE_PLANS: SelfServicePlan[] = [
  {
    id: 'rest-esencial',
    name: 'Esencial',
    target: 'Para restaurantes que arrancan',
    priceMonthly: 99000,
    features: [
      'Hasta 10 mesas',
      '1 sucursal · 1 usuario',
      '100 comprobantes de venta/mes',
      'Gestión de comandas',
      'App móvil (Android y iOS)',
    ],
  },
  {
    id: 'rest-avanzado',
    name: 'Avanzado',
    target: 'Para restaurantes en crecimiento',
    priceMonthly: 169000,
    recommended: true,
    features: [
      'Mesas ilimitadas',
      '2 sucursales · 2 usuarios',
      '500 comprobantes de venta/mes',
      'Comandas y división de cuentas',
      'Pantalla de cocina (KDS)',
      'Cierre de turno automático',
    ],
  },
  {
    id: 'rest-ilimitado',
    name: 'Ilimitado',
    target: 'Para cadenas y grupos',
    priceMonthly: 279000,
    features: [
      'Sucursales y mesas ilimitadas',
      'Usuarios ilimitados',
      'Comprobantes ilimitados',
      'KDS y comandas completo',
      'Reportes consolidados',
      'Integración con domicilios',
    ],
  },
];
