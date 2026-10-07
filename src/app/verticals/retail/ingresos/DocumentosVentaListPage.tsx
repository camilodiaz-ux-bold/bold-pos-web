import React from 'react';
import type { TipoDocVenta } from '../../../types/venta';
import { DOC_CONFIG } from './documentosVenta';

// Stub: se implementa en una tarea posterior del plan.
export function DocumentosVentaListPage({ tipo }: { tipo: TipoDocVenta }) {
  return (
    <div style={{ padding: 24, fontFamily: 'Montserrat, sans-serif' }}>
      <h1 style={{ color: 'var(--black-100)', fontSize: 24, fontWeight: 700 }}>{DOC_CONFIG[tipo].titulo}</h1>
    </div>
  );
}
