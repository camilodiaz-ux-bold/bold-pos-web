/**
 * ReportesPage — /reportes
 * Renders the full Reportes module (4 categories) inside the shared layout shell.
 */
import React from 'react';
import { ReportesPanel } from '../components/ReportesPanel';

export function ReportesPage() {
  return (
    <div className="flex-1 flex overflow-hidden">
      <ReportesPanel />
    </div>
  );
}
