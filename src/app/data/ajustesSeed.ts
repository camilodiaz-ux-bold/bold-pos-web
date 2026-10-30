/** Valores iniciales de Ajustes (specs/2026-10-ajustes.md §8). Sin datos reales del staging. */
import type { AjustesState, MetodoPago, NumeracionNoElectronica, Rol, Sucursal } from '../types/ajustes';
import { TODOS_LOS_PERMISOS } from './permisosCatalogo';
import { METODOS_PAGO, SUCURSALES_COMPRA } from './facturasCompraSeed';

export const AJUSTES_STORAGE_KEY = 'bold-pos:ajustes:v1';

/** Clave previa de las "herramientas del prototipo" de compras; solo se lee para migrar `usarImpuestos`. */
export const COMPRAS_SETTINGS_LEGACY_KEY = 'bold-pos:compras-settings:v1';

/** Tope de sucursales del plan simulado: al llegar a él, "Nueva" muestra el aviso "¡Contáctanos!". */
export const LIMITE_SUCURSALES = 7;

const METODOS_POR_DEFECTO = ['Bold', 'Efectivo', 'Credibanco', 'Daviplata', 'Nequi', 'Redeban', 'Transferencia bancaria', 'Otro'];

// Todos habilitados para no cambiar lo que ya ofrecía el formulario de facturas de compra.
const METODOS: MetodoPago[] = METODOS_PAGO.map((nombre, i) => ({
  id: `mp-${i + 1}`, nombre, habilitado: true, porDefecto: METODOS_POR_DEFECTO.includes(nombre),
}));

const CIUDADES = ['Bogotá', 'Bogotá', 'Bogotá', 'Armenia', 'Medellín', 'Medellín'];
const SUCURSALES: Sucursal[] = SUCURSALES_COMPRA.map((nombre, i) => ({
  id: `suc-${i + 1}`, nombre, direccion: `Calle ${10 + i * 5} # ${20 + i}-${30 + i}`, ciudad: CIUDADES[i] ?? 'Bogotá',
  correo: '', siguienteCotizacion: 100 + i * 25, papelDefecto: 'Todos los formatos',
}));

export const numeracionInicial = (i: number): NumeracionNoElectronica => ({
  comprobante: 3700 + i * 40, recibo: 8400 + i * 30, gasto: 440 + i * 10, cotizacion: 780 + i * 25, facturaCompra: null,
});

const PERMISOS_VENDEDOR = TODOS_LOS_PERMISOS.filter(id =>
  /^(ingresos|cotizaciones)\./.test(id)
  || ['contactos.ver-contactos', 'contactos.crear-contactos', 'items.ver-items', 'items.modificar-precio-en-venta'].includes(id));
const PERMISOS_CONTADOR = TODOS_LOS_PERMISOS.filter(id =>
  /^(gastos|ingresos-reportes|documentos-electronicos|administrativos)\./.test(id) || id === 'empresa.ver-ajustes');

const ROLES: Rol[] = [
  { id: 'rol-admin', nombre: 'Administrador', permisos: TODOS_LOS_PERMISOS },
  { id: 'rol-vendedor', nombre: 'Vendedor', permisos: PERMISOS_VENDEDOR },
  { id: 'rol-contador', nombre: 'Contador', permisos: PERMISOS_CONTADOR },
];

export const AJUSTES_DEFAULT: AjustesState = {
  pos: {
    clienteDefectoId: 'ctc-1',
    documentoDefecto: 'comprobante',
    condicionPago: 'Contado/Crédito',
    controlTurnos: true,
    venderSinExistencias: false,
    controlMesas: true,
    unificarPrecioTotal: true,
    idComercioBold: 'VC0000DEMO',
  },
  facturasCompra: {
    // Se conservan los valores con que ya se comportaba el prototipo de compras.
    afectaInventario: true,
    usarImpuestos: false,
    condicionPago: 'Crédito / Contado',
  },
  impuestos: [
    { id: 'imp-1', nombre: 'Excluido', tipo: 'IVA', tarifa: 0 },
    { id: 'imp-2', nombre: 'Bienes y Servicios al 5%', tipo: 'IVA', tarifa: 5 },
    { id: 'imp-3', nombre: 'Tarifa general', tipo: 'IVA', tarifa: 19 },
    { id: 'imp-4', nombre: 'Exento', tipo: 'IVA', tarifa: 0 },
    { id: 'imp-5', nombre: 'Tarifa general', tipo: 'INC', tarifa: 8 },
  ],
  descuentos: [
    { id: 'dsc-1', nombre: 'Descuento 3%', tasa: 3 },
    { id: 'dsc-2', nombre: 'Descuento de tarjeta', tasa: 4.5 },
    { id: 'dsc-3', nombre: 'Cliente preferencial', tasa: 5 },
    { id: 'dsc-4', nombre: 'Descuento 10%', tasa: 10 },
    { id: 'dsc-5', nombre: 'Pronto pago', tasa: 15 },
  ],
  metodosPago: METODOS,
  categoriasGastos: [
    { id: 'cg-1', nombre: 'Servicios públicos', padreId: null },
    { id: 'cg-2', nombre: 'Nómina', padreId: null },
    { id: 'cg-3', nombre: 'Mantenimiento y reparaciones', padreId: null },
    { id: 'cg-4', nombre: 'Mercadeo', padreId: null },
    { id: 'cg-5', nombre: 'Arriendo', padreId: null },
    { id: 'cg-6', nombre: 'Compra de inventario', padreId: null },
    { id: 'cg-7', nombre: 'Transporte', padreId: null },
    { id: 'cg-8', nombre: 'Transportadora', padreId: 'cg-7' },
    { id: 'cg-9', nombre: 'Otros', padreId: null },
  ],
  vendedores: [
    { id: 'V001', nombre: 'Camila Rojas' },
    { id: 'V002', nombre: 'Mario Arias' },
    { id: 'V003', nombre: 'Laura Pineda' },
    { id: 'V004', nombre: 'Daniel Ramos' },
  ],
  sucursales: SUCURSALES,
  tipoCosteo: 'promedio',
  integraciones: {
    smartPro: { activa: true, llave: 'DEMO-SMARTPRO-0000-0000' },
    linkPago: { activa: true, llave: 'DEMO-LINKPAGO-0000-0000' },
  },
  numeracionNoElectronica: Object.fromEntries(SUCURSALES.map((s, i) => [s.id, numeracionInicial(i)])),
  perfil: {
    nombre: 'Tienda Demo S.A.S',
    nit: '900123456',
    direccion: 'Calle 100 # 10-20, Bogotá, Colombia.',
    celular: '3001234567',
    celularValidado: false,
    correo: 'contacto@tiendademo.co',
    correoValidado: false,
    leyenda: 'Esta factura se asimila en todos sus efectos legales a una letra de cambio según Art. 774 del Código de Comercio. Garantía 15 días. Sin factura no se realizan cambios ni garantía.',
    paginaWeb: 'www.tiendademo.co',
    logo: null,
    facturacionElectronica: true,
    tipoPersona: 'Persona Jurídica',
    departamentoCiudad: 'Bogotá / BOGOTÁ, D.C.',
    tipoDocumento: 'NIT',
    responsabilidadFiscal: 'No aplica - Otros *',
    regimenFiscal: 'IVA e INC',
  },
  numeraciones: [
    { id: 'num-1', tipo: 'factura', nombre: 'Resolución factura de venta', prefijo: 'FEV', sucursalId: 'suc-1', consecutivo: 1500 },
    { id: 'num-2', tipo: 'notaDebito', nombre: 'Nota débito', prefijo: 'NDB', sucursalId: 'suc-1', consecutivo: 77 },
    { id: 'num-3', tipo: 'notaCredito', nombre: 'Nota crédito', prefijo: 'NCR', sucursalId: 'suc-1', consecutivo: 390 },
    { id: 'num-4', tipo: 'notaCredito', nombre: 'Nota crédito sede Norte', prefijo: 'NCN', sucursalId: 'suc-2', consecutivo: 1 },
    { id: 'num-5', tipo: 'documentoSoporte', nombre: 'Documento soporte', prefijo: 'SEDS', sucursalId: 'suc-1', consecutivo: 984000 },
  ],
  roles: ROLES,
  usuarios: [
    { id: 'usr-1', nombre: 'Rafael', apellido: 'Arango', correo: 'admin@tiendademo.co', rolId: 'rol-admin', sucursalId: 'suc-1', inventarioSucursalIds: SUCURSALES.map(s => s.id), activo: true, principal: true },
    { id: 'usr-2', nombre: 'Camila', apellido: 'Rojas', correo: 'camila.rojas@tiendademo.co', rolId: 'rol-vendedor', sucursalId: 'suc-1', inventarioSucursalIds: ['suc-1'], activo: true },
    { id: 'usr-3', nombre: 'Laura', apellido: 'Pineda', correo: 'laura.pineda@tiendademo.co', rolId: 'rol-contador', sucursalId: 'suc-2', inventarioSucursalIds: ['suc-1', 'suc-2'], activo: true },
    { id: 'usr-4', nombre: 'Mario', apellido: 'Arias', correo: 'mario.arias@tiendademo.co', rolId: 'rol-vendedor', sucursalId: 'suc-3', inventarioSucursalIds: ['suc-3'], activo: false },
  ],
  listasPrecios: [
    { id: 'lp-1', nombre: 'Precio VIP - Precio Diferencial', tipo: 'valor', porcentaje: 0, rolIds: ['rol-admin'] },
    { id: 'lp-2', nombre: 'Mayorista', tipo: 'porcentaje', porcentaje: 80, rolIds: ['rol-admin', 'rol-vendedor'] },
    { id: 'lp-3', nombre: 'Factura', tipo: 'valor', porcentaje: 0, rolIds: ['rol-admin'] },
  ],
  categoriasItems: [
    { id: 'ci-0', nombre: 'Ventas', descripcion: '', padreId: null },
    { id: 'ci-1', nombre: 'Camisetas & Tops', descripcion: '', padreId: 'ci-0' },
    { id: 'ci-2', nombre: 'Pantalones & Jeans', descripcion: '', padreId: 'ci-0' },
    { id: 'ci-3', nombre: 'Chaquetas & Abrigos', descripcion: '', padreId: 'ci-0' },
    { id: 'ci-4', nombre: 'Calzado', descripcion: '', padreId: 'ci-0' },
    { id: 'ci-5', nombre: 'Deportivo', descripcion: '', padreId: 'ci-4' },
    { id: 'ci-6', nombre: 'Accesorios', descripcion: '', padreId: 'ci-0' },
    { id: 'ci-7', nombre: 'Cuidado Personal', descripcion: '', padreId: 'ci-0' },
  ],
  alertasStockBajo: { correosAdicionales: [], frecuencia: 'lunes' },
};
