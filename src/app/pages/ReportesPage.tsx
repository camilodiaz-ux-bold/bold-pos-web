/**
 * ReportesPage — /reportes
 * Restaurantes: el módulo de reportes compartido (4 categorías). Retail: las 3 tarjetas del POS real
 * (specs/2026-10-reportes-retail.md).
 */
import React from 'react';
import { ReportesPanel } from '../components/ReportesPanel';
import { ReportesRetailPanel } from '../verticals/retail/reportes/ReportesRetailPanel';
import { useVertical } from '../vertical';

export function ReportesPage() {
  const { has } = useVertical();
  return (
    <div className="flex-1 flex overflow-hidden">
      {has('reportes-retail') ? <ReportesRetailPanel /> : <ReportesPanel />}
    </div>
  );
}
