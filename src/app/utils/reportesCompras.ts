/**
 * reportesCompras.ts — cálculo de los reportes de compras de Retail (specs/2026-10-reportes-retail.md §5.3).
 * Funciones puras sobre las facturas de compra: los reportes no guardan datos propios.
 */
import type { FacturaCompra, ItemFacturaCompra } from '../types/facturaCompra';
import {
  FECHA_PROTOTIPO, addDias, calcularTotales, esPendiente, estadoFactura, totalLinea, valorFactura,
} from './facturasCompra';

/** Nombre del proveedor por id; '—' si no existe. */
export type NombreProveedor = (id: string) => string;

const enRango = (iso: string, desde: string, hasta: string): boolean => (!desde || iso >= desde) && (!hasta || iso <= hasta);

// ─── Desglose de impuestos por columna ───────────────────────────────────────

/** Una columna de impuesto: monto, o null si la factura no tiene líneas de ese tipo (se muestra N/A). */
export interface DesgloseImpuestos { iva19: number | null; iva5: number | null; iva0: number | null; excluido: number | null }

export function desgloseImpuestos(items: ItemFacturaCompra[]): DesgloseImpuestos {
  const d: DesgloseImpuestos = { iva19: null, iva5: null, iva0: null, excluido: null };
  const suma = (actual: number | null, v: number) => (actual ?? 0) + v;
  items.forEach(it => {
    if (it.impuesto === 'IVA 19,00%') d.iva19 = suma(d.iva19, Math.round(totalLinea(it) * 0.19));
    else if (it.impuesto === 'IVA 5,00%') d.iva5 = suma(d.iva5, Math.round(totalLinea(it) * 0.05));
    else if (it.impuesto === 'Exento') d.iva0 = suma(d.iva0, 0);
    else d.excluido = suma(d.excluido, 0);
  });
  return d;
}

// ─── Facturas de compra ──────────────────────────────────────────────────────

export interface FiltrosReporteFacturas { proveedor: string; estado: string; sucursal: string; desde: string; hasta: string }

export interface FilaFacturaCompra {
  id: string; numero: string; proveedor: string; fechaEmision: string; inventario: boolean; valorTotal: number;
  formaPago: string; subtotal: number; impuestos: DesgloseImpuestos; retencion: number | null;
  fechaVencimiento: string | null; estado: string; docSoporte: string; sucursal: string;
}

export function filasFacturasCompra(
  facturas: FacturaCompra[], nombre: NombreProveedor, f: FiltrosReporteFacturas, usarImpuestos: boolean,
): FilaFacturaCompra[] {
  return facturas
    .filter(x =>
      (f.proveedor === 'Todos' || nombre(x.proveedorId) === f.proveedor) &&
      (f.estado === 'Todos' || estadoFactura(x) === f.estado) &&
      (f.sucursal === 'Todos' || x.sucursal === f.sucursal) &&
      enRango(x.fechaEmision, f.desde, f.hasta))
    .sort((a, b) => (a.fechaEmision === b.fechaEmision ? a.numero.localeCompare(b.numero) : a.fechaEmision < b.fechaEmision ? -1 : 1))
    .map(x => ({
      id: x.id, numero: x.numero, proveedor: nombre(x.proveedorId), fechaEmision: x.fechaEmision, inventario: x.afectaInventario,
      valorTotal: valorFactura(x, usarImpuestos), formaPago: x.formaPago, subtotal: calcularTotales(x.items, 0).subtotal,
      // Con "Uso de impuestos y retenciones" en No, el reporte no muestra impuestos ni retención.
      impuestos: usarImpuestos ? desgloseImpuestos(x.items) : { iva19: null, iva5: null, iva0: null, excluido: null },
      retencion: usarImpuestos && x.retenciones > 0 ? x.retenciones : null,
      fechaVencimiento: x.formaPago === 'Crédito' ? x.fechaVencimiento : null, estado: estadoFactura(x),
      docSoporte: x.ds?.numero ?? '', sucursal: x.sucursal,
    }));
}

export interface ResumenFacturas { total: number; valorTotal: number; pendiente: number }

/** Valor total y pendiente excluyen las anuladas; "Total Facturas" cuenta todas las filas. */
export function resumenFacturasCompra(filas: FilaFacturaCompra[], facturas: FacturaCompra[], usarImpuestos: boolean): ResumenFacturas {
  const porId = new Map(facturas.map(f => [f.id, f]));
  return filas.reduce<ResumenFacturas>((r, fila) => {
    const f = porId.get(fila.id);
    if (!f || fila.estado === 'Anulada') return r;
    return { ...r, valorTotal: r.valorTotal + fila.valorTotal, pendiente: r.pendiente + (esPendiente(f) ? valorFactura(f, usarImpuestos) : 0) };
  }, { total: filas.length, valorTotal: 0, pendiente: 0 });
}

// ─── Ítems comprados ─────────────────────────────────────────────────────────

export interface FiltrosReporteItems { categoria: string; producto: string; proveedor: string; desde: string; hasta: string }

export interface FilaItemComprado {
  key: string; numero: string; producto: string; categoria: string; proveedor: string; cantidad: number;
  precio: number; valorTotal: number; fechaEmision: string;
}

/** Una fila por línea de factura no anulada. `categoriaDe` resuelve la categoría por código de ítem. */
export function filasItemsComprados(
  facturas: FacturaCompra[], nombre: NombreProveedor, categoriaDe: (codigo: string) => string, f: FiltrosReporteItems,
): FilaItemComprado[] {
  const q = f.producto.trim().toLowerCase();
  return facturas
    .filter(x => !x.anulacion && (f.proveedor === 'Todos' || nombre(x.proveedorId) === f.proveedor) && enRango(x.fechaEmision, f.desde, f.hasta))
    .sort((a, b) => (a.fechaEmision < b.fechaEmision ? 1 : a.fechaEmision > b.fechaEmision ? -1 : 0))
    .flatMap(x => x.items.map((it, i) => ({
      key: `${x.id}-${i}`, numero: x.numero, producto: `${it.nombre} - ${it.codigo}`, categoria: categoriaDe(it.codigo),
      proveedor: nombre(x.proveedorId), cantidad: it.cantidad, precio: it.precio, valorTotal: totalLinea(it), fechaEmision: x.fechaEmision,
    })))
    .filter(r => (f.categoria === 'Todos' || r.categoria === f.categoria) && (!q || r.producto.toLowerCase().includes(q)));
}

// ─── Cuentas por pagar ───────────────────────────────────────────────────────

export interface FiltrosReporteCxP { proveedor: string; sucursal: string; desde: string; hasta: string }

export interface FilaCuentaPorPagar { proveedor: string; deudaTotal: number; deudaPendiente: number; deudaVencida: number }

export interface ResumenCxP { vencidos: number; proximos7: number; proximos30: number; todas: number }

/**
 * Deuda por proveedor de las facturas pendientes (crédito sin pagar y no anulado) cuyo vencimiento cae en el rango.
 * Vencida = ya pasó la fecha de referencia; pendiente = aún no vence. Coincide con "Cuentas por pagar" del dashboard.
 */
export function cuentasPorPagarReporte(
  facturas: FacturaCompra[], nombre: NombreProveedor, f: FiltrosReporteCxP, usarImpuestos: boolean,
): { filas: FilaCuentaPorPagar[]; resumen: ResumenCxP } {
  const pendientes = facturas.filter(x =>
    esPendiente(x) && x.fechaVencimiento && enRango(x.fechaVencimiento, f.desde, f.hasta) &&
    (f.proveedor === 'Todos' || nombre(x.proveedorId) === f.proveedor) && (f.sucursal === 'Todos' || x.sucursal === f.sucursal));

  const porProveedor = new Map<string, FilaCuentaPorPagar>();
  const resumen: ResumenCxP = { vencidos: 0, proximos7: 0, proximos30: 0, todas: 0 };
  const hasta7 = addDias(FECHA_PROTOTIPO, 7);
  const hasta30 = addDias(FECHA_PROTOTIPO, 30);

  pendientes.forEach(x => {
    const valor = valorFactura(x, usarImpuestos);
    const vencida = estadoFactura(x) === 'Vencido';
    const fila = porProveedor.get(x.proveedorId) ?? { proveedor: nombre(x.proveedorId), deudaTotal: 0, deudaPendiente: 0, deudaVencida: 0 };
    fila.deudaTotal += valor;
    if (vencida) fila.deudaVencida += valor; else fila.deudaPendiente += valor;
    porProveedor.set(x.proveedorId, fila);

    resumen.todas += valor;
    if (vencida) resumen.vencidos += valor;
    else if (x.fechaVencimiento! <= hasta7) resumen.proximos7 += valor;
    else if (x.fechaVencimiento! <= hasta30) resumen.proximos30 += valor;
  });
  return { filas: [...porProveedor.values()].sort((a, b) => b.deudaTotal - a.deudaTotal), resumen };
}

// ─── Documentos soporte ──────────────────────────────────────────────────────

export interface FiltrosReporteDS { estadoDian: string; estadoPago: string; proveedor: string; sucursal: string; desde: string; hasta: string }

export interface FilaDocumentoSoporte {
  id: string; fecha: string; numero: string; proveedor: string; subtotal: number; descuento: number;
  impuestos: DesgloseImpuestos; total: number; estadoDian: string; estadoPago: string;
}

/**
 * Una fila por factura de compra convertida en Documento Soporte. El DS siempre incluye impuestos (es un
 * documento electrónico), sin importar el switch de Ajustes. El prototipo no simula rechazos: todos "Aceptado".
 */
export function filasDocumentosSoporte(facturas: FacturaCompra[], nombre: NombreProveedor, f: FiltrosReporteDS): FilaDocumentoSoporte[] {
  return facturas
    .filter(x => x.ds && !x.anulacion &&
      (f.proveedor === 'Todos' || nombre(x.proveedorId) === f.proveedor) &&
      (f.sucursal === 'Todos' || x.sucursal === f.sucursal) &&
      enRango(x.fechaEmision, f.desde, f.hasta))
    .map(x => {
      const t = calcularTotales(x.items, 0);
      return {
        id: x.id, fecha: x.fechaEmision, numero: x.ds!.numero, proveedor: nombre(x.proveedorId), subtotal: t.subtotal, descuento: 0,
        impuestos: desgloseImpuestos(x.items), total: t.subtotal + t.impuestos, estadoDian: 'Aceptado',
        estadoPago: estadoFactura(x) === 'Pagado' ? 'Pagado' : 'No pagado',
      };
    })
    .filter(r => (f.estadoDian === 'Todos' || r.estadoDian === f.estadoDian) && (f.estadoPago === 'Todos' || r.estadoPago === f.estadoPago))
    .sort((a, b) => (a.fecha === b.fecha ? a.numero.localeCompare(b.numero) : a.fecha < b.fecha ? -1 : 1));
}
