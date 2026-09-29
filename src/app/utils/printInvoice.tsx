/**
 * printInvoice — imprime la factura como ticket 80 mm.
 * Renderiza InvoiceTicket a HTML estático dentro de un iframe oculto y llama a
 * print() sobre ese iframe, así el diálogo de impresión solo ve el ticket y no
 * la app (no hace falta @media print global ni librerías).
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InvoiceTicket } from '../components/InvoiceTicket';
import type { InvoiceData } from './invoice';

let activeFrame: HTMLIFrameElement | null = null;

function removeFrame(frame: HTMLIFrameElement) {
  frame.remove();
  if (activeFrame === frame) activeFrame = null;
}

export function printInvoice(invoice: InvoiceData): void {
  if (activeFrame) removeFrame(activeFrame);

  const markup = renderToStaticMarkup(<InvoiceTicket invoice={invoice} />);
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">`
    + `<title>Factura ${invoice.number}</title>`
    + `<style>@page{size:80mm auto;margin:0}html,body{margin:0;padding:0;background:#fff}`
    + `body{padding:4mm 0 10mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>`
    + `</head><body>${markup}</body></html>`;

  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) { removeFrame(frame); return; }
    win.addEventListener('afterprint', () => removeFrame(frame));
    win.focus();
    win.print();
  };
  frame.srcdoc = html;
  activeFrame = frame;
  document.body.appendChild(frame);
}
