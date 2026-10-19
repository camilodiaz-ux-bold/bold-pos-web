import type { FacturaCompra, ImpuestoCompra, ItemFacturaCompra } from '../types/facturaCompra';

export const FACTURAS_STORAGE_KEY = 'bold-pos:facturas-compra:v1';

export const USUARIO_DEMO = 'Rafael Arango';
export const SUCURSAL_ACTUAL = 'Hub Ciudad del Rio';
export const TURNO_ACTUAL = '499';
export const RESOLUCION_DS = 'Resolución 002239423';

export const SUCURSALES_COMPRA = [
  'Hub Ciudad del Rio', 'Bold POS Renovación', 'Hub Keneddy', 'Hub Armenia', 'Test Sucursal 1', 'Distribuciones envigado',
];

export const METODOS_PAGO = [
  'Bold', 'Efectivo', 'Credibanco', 'Daviplata', 'Nequi', 'Redeban', 'Transferencia bancaria', 'QR Bold', 'QR Bancolombia', 'Otro',
];

export const IMPUESTOS_COMPRA: { value: ImpuestoCompra; rate: number }[] = [
  { value: 'Exento', rate: 0 },
  { value: 'IVA 19,00%', rate: 0.19 },
  { value: 'IVA 5,00%', rate: 0.05 },
  { value: 'Excluido', rate: 0 },
];

export const RETENCIONES_OPCIONES = [
  { value: 0, label: 'Sin retención' },
  { value: 2, label: '2,00%' },
  { value: 2.5, label: '2,50%' },
  { value: 5, label: '5,00%' },
  { value: 6, label: '6,00%' },
];

export const TIPOS_OPERACION_DS = ['Individual', 'Acumulado semanal'];

// ─── Proveedores de las facturas (se siembran también como contactos) ────────

export const PROVEEDORES_COMPRA = [
  { id: 'ctc-7',  nombre: 'Distribuciones Bogotá S.A.S', nit: '900123456', correo: 'compras@distribucionesbogota.co' },
  { id: 'ctc-8',  nombre: 'Proveedora Nacional Ltda',     nit: '900234567', correo: 'ventas@proveedoranacional.co' },
  { id: 'ctc-9',  nombre: 'Importaciones del Valle',      nit: '900345678', correo: 'contacto@importacionesvalle.co' },
  { id: 'ctc-10', nombre: 'Suministros Andinos',          nit: '900456789', correo: 'pedidos@suministrosandinos.co' },
  { id: 'ctc-11', nombre: 'Comercializadora Andina SAS',  nit: '900567890', correo: 'facturacion@comercializadoraandina.co' },
];

// ─── Facturas sembradas ──────────────────────────────────────────────────────

const L = (nombre: string, codigo: string, cantidad: number, precio: number, impuesto: ImpuestoCompra = 'Exento', inventariable = true): ItemFacturaCompra =>
  ({ nombre, codigo, cantidad, precio, impuesto, inventariable });

const AGUA = (c: number, p: number, i?: ImpuestoCompra) => L('Agua de linos', '7703670237372', c, p, i);
const FULL = (c: number, p: number, i?: ImpuestoCompra) => L('Full fresh', '7702856009710', c, p, i);
const JUGUETE = (c: number, p: number, i?: ImpuestoCompra) => L('Juguete de colección', 'I-17836347800', c, p, i);
const REV = (c: number, p: number, i?: ImpuestoCompra) => L('Nuevo item Rev Aleja', 'I-17838214400', c, p, i);
const FIRULAIS = (c: number, p: number, i?: ImpuestoCompra) => L('Firulais de colección', 'I-17837206600', c, p, i);
const TRANSPORTE = (c: number, p: number, i?: ImpuestoCompra) => L('Servicio de transporte de mercancía', 'SRV-001', c, p, i, false);

const base = {
  sucursal: SUCURSAL_ACTUAL, observaciones: '', ds: null, pago: null, anulacion: null,
  metodoPago: null, turno: null, fechaVencimiento: null, retenciones: 0, afectaInventario: true,
} satisfies Partial<FacturaCompra>;

export function buildSeedFacturas(): FacturaCompra[] {
  const f: FacturaCompra[] = [
    {
      ...base, id: 'fc-011', numero: 'FC-011', proveedorId: 'ctc-11', numeroProveedor: 'FV-5521',
      fechaEmision: '2026-06-15', fechaRegistro: '2026-06-15T10:00', formaPago: 'Crédito', fechaVencimiento: '2026-07-01',
      items: [AGUA(20, 5000), FULL(15, 8200), REV(11, 17000)],
    },
    {
      ...base, id: 'fc-010', numero: 'FC-010', proveedorId: 'ctc-10', numeroProveedor: 'SA-1190',
      fechaEmision: '2026-07-10', fechaRegistro: '2026-07-10T09:05', formaPago: 'Crédito', fechaVencimiento: '2026-08-10',
      afectaInventario: false, items: [FIRULAIS(5, 45000), TRANSPORTE(1, 100000)],
    },
    {
      ...base, id: 'fc-009', numero: 'FC-009', proveedorId: 'ctc-9', numeroProveedor: 'IV-7710',
      fechaEmision: '2026-07-02', fechaRegistro: '2026-07-02T15:20', formaPago: 'Crédito', fechaVencimiento: '2026-08-02',
      ds: { numero: 'SEDS-50017744' }, items: [AGUA(10, 2950), FULL(5, 8200), JUGUETE(4, 32000)],
    },
    {
      ...base, id: 'fc-008', numero: 'FC-008', proveedorId: 'ctc-7', numeroProveedor: 'A-04521',
      fechaEmision: '2026-07-14', fechaRegistro: '2026-07-14T09:24', formaPago: 'Contado', metodoPago: 'Bold', turno: TURNO_ACTUAL,
      ds: { numero: 'SEDS-45353453' }, items: [AGUA(24, 2500, 'IVA 19,00%'), FULL(10, 8200)],
    },
    {
      ...base, id: 'fc-007', numero: 'FC-007', proveedorId: 'ctc-10', numeroProveedor: '0045521',
      fechaEmision: '2026-06-12', fechaRegistro: '2026-06-12T11:52', formaPago: 'Crédito', fechaVencimiento: '2026-06-20',
      retenciones: 5625, items: [FIRULAIS(5, 45000, 'IVA 5,00%'), TRANSPORTE(1, 150000, 'Excluido')],
    },
    {
      ...base, id: 'fc-006', numero: 'FC-006', proveedorId: 'ctc-11', numeroProveedor: 'FV-3391',
      fechaEmision: '2026-07-05', fechaRegistro: '2026-07-05T08:37', formaPago: 'Crédito', fechaVencimiento: '2026-08-05',
      retenciones: 7680, ds: { numero: 'SEDS-88210437' }, items: [FULL(12, 8200), JUGUETE(4, 32000, 'IVA 19,00%')],
      pago: {
        fecha: '2026-07-10T15:45', metodo: 'Transferencia bancaria', turno: TURNO_ACTUAL, reportadoPor: 'Wendell Nazar',
        observacion: 'Proveedor confirmó pago anticipado por transferencia, se adjunta comprobante en el correo.',
      },
    },
    {
      ...base, id: 'fc-005', numero: 'FC-005', proveedorId: 'ctc-8', numeroProveedor: 'FE-8823',
      fechaEmision: '2026-07-09', fechaRegistro: '2026-07-09T14:40', formaPago: 'Crédito', fechaVencimiento: '2026-08-15',
      retenciones: 5760, items: [JUGUETE(3, 32000, 'IVA 19,00%'), REV(2, 18000, 'IVA 5,00%')],
    },
    {
      ...base, id: 'fc-004', numero: 'FC-004', proveedorId: 'ctc-7', numeroProveedor: 'A-09983',
      fechaEmision: '2026-07-07', fechaRegistro: '2026-07-08T09:15', formaPago: 'Contado', metodoPago: 'Efectivo', turno: TURNO_ACTUAL,
      retenciones: 7680, items: [FULL(5, 8200), JUGUETE(4, 32000, 'IVA 19,00%')],
      anulacion: {
        por: 'Andrés Lizarazo', fecha: '2026-07-12T16:10',
        observacion: 'Se anuló por error en la cantidad registrada del ítem principal; se reingresará correctamente.',
      },
    },
    {
      ...base, id: 'fc-003', numero: 'FC-003', proveedorId: 'ctc-9', numeroProveedor: 'IV-6402',
      fechaEmision: '2026-06-02', fechaRegistro: '2026-06-02T10:30', formaPago: 'Contado', metodoPago: 'Transferencia bancaria', turno: TURNO_ACTUAL,
      ds: { numero: 'SEDS-61204455' }, items: [FIRULAIS(20, 45000), JUGUETE(30, 32000), REV(25, 18000)],
    },
    {
      ...base, id: 'fc-002', numero: 'FC-002', proveedorId: 'ctc-10', numeroProveedor: 'SA-0871',
      fechaEmision: '2026-05-20', fechaRegistro: '2026-05-20T16:10', formaPago: 'Contado', metodoPago: 'Efectivo',
      afectaInventario: false, items: [FIRULAIS(1, 45000), TRANSPORTE(1, 170000)],
    },
    {
      ...base, id: 'fc-001', numero: 'FC-001', proveedorId: 'ctc-9', numeroProveedor: 'IV-5120',
      fechaEmision: '2026-05-04', fechaRegistro: '2026-05-04T09:00', formaPago: 'Contado', metodoPago: 'Efectivo', turno: TURNO_ACTUAL,
      ds: { numero: 'SEDS-33987120' }, items: [AGUA(40, 2500), FULL(25, 8200), FIRULAIS(7, 45000)],
    },
  ];
  return f;
}
