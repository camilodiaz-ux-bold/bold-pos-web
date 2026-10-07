/**
 * invoice.ts — modelo de la venta completada y de la factura impresa
 * (ver specs/2026-09-checkout-factura.md). Sin JSX: el render vive en
 * components/InvoiceTicket.tsx y la impresión en utils/printInvoice.tsx.
 */
import { comboBreakdown, type ComboComponentSnapshot } from './comboBridge';
import { INVOICE_ISSUER, INVOICE_SEQ_START } from '../data/invoiceIssuer';

// ─── Venta completada (lo que produce el checkout) ────────────────────────────

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  /** Precio unitario de lista (antes del descuento de línea). */
  price: number;
  /** Descuento de línea en %, 0-20. */
  discount?: number;
  comboComponents?: ComboComponentSnapshot[];
  /** Nota de la línea. */
  note?: string;
}

export interface CompletedSale {
  /** "Mesa S14" / "Orden #001" */
  title: string;
  /** Mismo número que la comanda: "#885" en Mesas, "#001" en Mostrador. */
  orderRef: string;
  /** "SETT 2400418" — asignado una sola vez al confirmar el pago. */
  invoiceNumber: string;
  /** Retail: comprobante (consecutivo propio) o factura electrónica. Restaurantes: siempre 'factura'. */
  tipoDoc: 'comprobante' | 'factura';
  items: SaleItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  tip: number;
  tipLabel: string;
  discount: number;
  total: number;
  payEntries: { method: string; amount: number }[];
  cambio: number;
  cliente: string;
  vendedor: string;
  /** Rol de quien atiende en la factura: 'Mesero' (Restaurantes) o 'Vendedor' (Retail). Default 'Mesero'. */
  vendedorLabel?: 'Mesero' | 'Vendedor';
  resolucion: string;
  note: string;
  /** Epoch ms del pago. */
  paidAt: number;
}

// ─── Consecutivo ──────────────────────────────────────────────────────────────

const SEQ_KEY = 'bold-pos:invoice-seq:v1';

/** Siguiente número de factura ("SETT 2400418", luego 2400419…). Persistido en localStorage. */
export function nextInvoiceNumber(): string {
  let n = INVOICE_SEQ_START;
  try {
    const last = parseInt(localStorage.getItem(SEQ_KEY) ?? '', 10);
    if (Number.isFinite(last) && last >= INVOICE_SEQ_START) n = last + 1;
    localStorage.setItem(SEQ_KEY, String(n));
  } catch { /* storage no disponible: se usa el inicial */ }
  return `${INVOICE_ISSUER.prefijo} ${n}`;
}

const COMPROBANTE_SEQ_KEY = 'bold-pos:comprobante-seq:v1';
/** Primer comprobante que se emite: los sembrados de Retail llegan a 3762. */
export const COMPROBANTE_SEQ_START = 3763;

/** Siguiente número de comprobante de Retail ("3763", luego "3764"…). Persistido en localStorage. */
export function nextComprobanteNumber(): string {
  let n = COMPROBANTE_SEQ_START;
  try {
    const last = parseInt(localStorage.getItem(COMPROBANTE_SEQ_KEY) ?? '', 10);
    if (Number.isFinite(last) && last >= COMPROBANTE_SEQ_START) n = last + 1;
    localStorage.setItem(COMPROBANTE_SEQ_KEY, String(n));
  } catch { /* storage no disponible: se usa el inicial */ }
  return String(n);
}

// ─── Cliente ──────────────────────────────────────────────────────────────────

export interface InvoiceCustomer {
  nombre: string;
  tipoDocumento: string;
  documento: string;
  direccion: string;
  telefono: string;
  correo: string;
}

/**
 * El checkout guarda el cliente como string ("Nombre (NIT: 900.123.456)").
 * Los datos de contacto son mock (los de la factura de referencia).
 */
export function resolveCustomer(cliente: string): InvoiceCustomer {
  const m = cliente.match(/^(.*?)\s*\(NIT:\s*([^)]+)\)\s*$/);
  const base = { direccion: 'Cra 25', telefono: '11111111', correo: 'bold.restaurant.fe@bold.co' };
  if (m) return { nombre: m[1], tipoDocumento: 'NIT', documento: m[2].trim(), ...base };
  return { nombre: cliente, tipoDocumento: 'Cédula de Ciudadanía', documento: '222222222222', ...base };
}

// ─── Factura ──────────────────────────────────────────────────────────────────

export interface InvoiceLine {
  index: number;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  value: number;
  /** Desglose del combo (vacío si la línea no es combo). */
  components: { name: string; qty: number }[];
}

export interface InvoiceData {
  number: string;
  customer: InvoiceCustomer;
  emitidaEn: string;
  validadaEn: string;
  lines: InvoiceLine[];
  totalItems: number;
  subtotal: number;
  taxRate: number;
  tax: number;
  discount: number;
  tip: number;
  tipLabel: string;
  total: number;
  totalInWords: string;
  note: string;
  /** Vacío en Retail (no hay número de orden): la factura omite la línea "Orden No.". */
  orderRef: string;
  /** Nombre de la mesa; vacío en ventas de Mostrador. */
  mesa: string;
  mesero: string;
  /** Etiqueta del campo `mesero` en el ticket. */
  meseroLabel: 'Mesero' | 'Vendedor';
  mediosDePago: string;
  cambio: number;
}

/** Código de ítem mock estable: "I-" + 11 dígitos derivados del id. */
function itemCode(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100_000_000_000;
  return `I-${String(h).padStart(11, '0')}`;
}

/** "2026-09-29, 12:46:22-05:00" en hora de Colombia (sin depender de la zona del navegador). */
function formatInvoiceDate(ms: number): string {
  const s = new Date(ms).toLocaleString('sv-SE', { timeZone: 'America/Bogota' });
  return `${s.replace(' ', ', ')}-05:00`;
}

export function buildInvoiceData(sale: CompletedSale): InvoiceData {
  const lines: InvoiceLine[] = sale.items.map((item, i) => {
    const unitPrice = item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
    return {
      index: i + 1,
      code: itemCode(item.id),
      name: item.name,
      quantity: item.quantity,
      unitPrice,
      value: unitPrice * item.quantity,
      components: comboBreakdown(item),
    };
  });
  return {
    number: sale.invoiceNumber,
    customer: resolveCustomer(sale.cliente),
    emitidaEn: formatInvoiceDate(sale.paidAt),
    validadaEn: formatInvoiceDate(sale.paidAt + 7_000),
    lines,
    totalItems: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal: sale.subtotal,
    taxRate: sale.taxRate,
    tax: sale.tax,
    discount: sale.discount,
    tip: sale.tip,
    tipLabel: sale.tipLabel,
    total: sale.total,
    totalInWords: numberToWordsCOP(sale.total),
    note: sale.note,
    orderRef: sale.orderRef,
    mesa: sale.title.startsWith('Mesa ') ? sale.title.slice(5) : '',
    mesero: sale.vendedor,
    meseroLabel: sale.vendedorLabel ?? 'Mesero',
    mediosDePago: sale.payEntries.map(e => e.method).join(', ') || 'Pendiente',
    cambio: sale.cambio,
  };
}

// ─── Formato ──────────────────────────────────────────────────────────────────

/** "$ 100.000,00" — con decimales, como la factura de referencia. */
export function formatInvoiceCOP(n: number): string {
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '-' : ''}$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
}

const UNITS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const HUNDREDS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

function below100(n: number): string {
  if (n < 30) return UNITS[n];
  const t = Math.floor(n / 10), u = n % 10;
  return u ? `${TENS[t]} y ${UNITS[u]}` : TENS[t];
}

function below1000(n: number): string {
  if (n === 100) return 'cien';
  const h = Math.floor(n / 100), r = n % 100;
  return [HUNDREDS[h], r ? below100(r) : ''].filter(Boolean).join(' ');
}

/** "uno" → "un", "veintiuno" → "veintiún" cuando precede a mil/millones/pesos. */
function apocope(words: string): string {
  return words.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un');
}

function integerToWords(n: number): string {
  if (n === 0) return 'cero';
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (millions) parts.push(millions === 1 ? 'un millón' : `${apocope(integerToWords(millions))} millones`);
  if (thousands) parts.push(thousands === 1 ? 'mil' : `${apocope(below1000(thousands))} mil`);
  if (rest) parts.push(below1000(rest));
  return parts.join(' ');
}

const titleCase = (s: string) => s.replace(/(^|\s)\S/g, c => c.toUpperCase());

/** 112000 → "Ciento Doce Mil Pesos Con Cero Centavos" */
export function numberToWordsCOP(amount: number): string {
  const pesos = Math.floor(Math.abs(amount));
  const cents = Math.round((Math.abs(amount) - pesos) * 100);
  const deMillones = pesos >= 1_000_000 && pesos % 1_000_000 === 0 ? ' de' : '';
  const pesosWords = `${apocope(integerToWords(pesos))}${deMillones} ${pesos === 1 ? 'peso' : 'pesos'}`;
  return titleCase(`${pesosWords} con ${integerToWords(cents)} centavos`);
}
