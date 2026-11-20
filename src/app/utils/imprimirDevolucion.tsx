/**
 * imprimirDevolucion — imprime (o guarda como PDF) el detalle de una devolución en el formato ticket de Bold POS
 * (specs/2026-11-devoluciones-v2.md §7). Mismo iframe oculto que el resto de impresiones.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DevolucionTicket } from '../verticals/retail/devoluciones/DevolucionTicket';
import type { Devolucion } from '../types/devolucion';
import { imprimirHtml } from './imprimirTabla';

export function imprimirDevolucion(filas: Devolucion[], extra: { sucursal: string; motivo: string }): void {
  const markup = renderToStaticMarkup(<DevolucionTicket filas={filas} sucursal={extra.sucursal} motivo={extra.motivo} />);
  imprimirHtml(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Devolución ${filas[0].numero}</title>`
    + `<style>@page{size:80mm auto;margin:0}html,body{margin:0;padding:0;background:#fff}`
    + `body{padding:4mm 0 10mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${markup}</body></html>`);
}
