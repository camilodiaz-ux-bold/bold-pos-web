/**
 * Guard de rutas exclusivas de una vertical: si el módulo no existe en la
 * vertical activa, redirige a /inicio.
 */
import React from 'react';
import { Navigate } from 'react-router';
import { useVertical } from './verticalStore';

export function VerticalRoute({ module, children }: { module: string; children: React.ReactNode }) {
  const { has } = useVertical();
  return has(module) ? <>{children}</> : <Navigate to="/inicio" replace />;
}
