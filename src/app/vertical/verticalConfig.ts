/**
 * Configuración por vertical: textos y valores que cambian entre Retail y
 * Restaurantes pero no son módulos (para módulos ver modules.ts).
 */
import type { Vertical } from './modules';

export interface VerticalConfig {
  /** Nombre del negocio demo que se muestra en TopBar y Dashboard. */
  businessName: string;
  plan: string;
  /** Sub-modo del POS en la ruta `/`. */
  defaultPosMode: 'Mesas' | 'Mostrador';
}

export const VERTICAL_CONFIG: Record<Vertical, VerticalConfig> = {
  retail: {
    businessName: 'Tienda Demo',
    plan: 'Plan Plus',
    defaultPosMode: 'Mostrador',
  },
  restaurantes: {
    businessName: 'Restaurante Demo',
    plan: 'Plan Plus',
    defaultPosMode: 'Mesas',
  },
};
