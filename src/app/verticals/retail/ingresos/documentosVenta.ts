import type { TipoDocVenta } from '../../../types/venta';

export const DOC_CONFIG: Record<TipoDocVenta, { titulo: string; singular: string; base: string }> = {
  comprobante: { titulo: 'Comprobantes',      singular: 'Comprobante',      base: '/comprobantes'   },
  factura:     { titulo: 'Facturas de Venta', singular: 'Factura de Venta', base: '/facturas-venta' },
};
