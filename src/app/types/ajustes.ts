/** Tipos del módulo Ajustes (specs/2026-10-ajustes.md). */

export type DocumentoDefecto = 'comprobante' | 'factura';
export type CondicionPagoPOS = 'Contado' | 'Contado/Crédito';
export type CondicionPagoCompra = 'Crédito' | 'Contado' | 'Crédito / Contado';

/** Formulario "Configuración POS" de la grilla de Ajustes. */
export interface ConfigPOS {
  clienteDefectoId: string;
  documentoDefecto: DocumentoDefecto;
  condicionPago: CondicionPagoPOS;
  controlTurnos: boolean;
  venderSinExistencias: boolean;
  controlMesas: boolean;
  unificarPrecioTotal: boolean;
  /** Solo informativo: no se edita. */
  idComercioBold: string;
}

/** Formulario "Facturas de compra" de la grilla de Ajustes. */
export interface ConfigFacturasCompra {
  afectaInventario: boolean;
  usarImpuestos: boolean;
  condicionPago: CondicionPagoCompra;
}

// ─── Fase 2: listas y formularios simples ────────────────────────────────────

/** Impuestos del negocio: solo lectura (§4.3). */
export interface Impuesto { id: string; nombre: string; tipo: 'IVA' | 'INC'; tarifa: number }

export interface Descuento { id: string; nombre: string; tasa: number }

export interface MetodoPago {
  id: string;
  nombre: string;
  habilitado: boolean;
  /** Los métodos por defecto no se editan ni se eliminan; solo se habilitan o deshabilitan. */
  porDefecto: boolean;
}

/** `padreId` null = categoría principal. Una sola capa de subcategorías. */
export interface CategoriaGasto { id: string; nombre: string; padreId: string | null }

export interface Vendedor { id: string; nombre: string }

export type PapelImpresion = 'Papel Media Página' | 'Papel Carta' | 'Papel Listín' | 'Todos los formatos';

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  correo: string;
  siguienteCotizacion: number;
  papelDefecto: PapelImpresion;
}

export type TipoCosteo = 'promedio' | 'ultimo';

export type IntegracionId = 'smartPro' | 'linkPago';
export interface Integracion { activa: boolean; llave: string }

/** Consecutivos de documentos no electrónicos por sucursal. `facturaCompra` null = automático. */
export interface NumeracionNoElectronica {
  comprobante: number;
  recibo: number;
  gasto: number;
  cotizacion: number;
  facturaCompra: number | null;
}

// ─── Fase 3: perfil, numeraciones, usuarios, roles, listas y categorías ──────

export interface PerfilNegocio {
  nombre: string;
  nit: string;
  direccion: string;
  celular: string;
  celularValidado: boolean;
  correo: string;
  correoValidado: boolean;
  leyenda: string;
  paginaWeb: string;
  /** Imagen en data URL; null = sin logo. */
  logo: string | null;
  facturacionElectronica: boolean;
  tipoPersona: string;
  departamentoCiudad: string;
  tipoDocumento: string;
  responsabilidadFiscal: string;
  regimenFiscal: string;
}

export type TipoDocumentoNumeracion = 'factura' | 'notaCredito' | 'notaDebito' | 'documentoSoporte';

export interface Numeracion {
  id: string;
  tipo: TipoDocumentoNumeracion;
  nombre: string;
  prefijo: string;
  sucursalId: string;
  consecutivo: number;
}

export interface Rol {
  id: string;
  nombre: string;
  /** Ids de permisos activos (ver data/permisosCatalogo.ts). */
  permisos: string[];
}

export interface UsuarioAjustes {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rolId: string;
  sucursalId: string;
  /** Sucursales cuyo inventario puede ver. */
  inventarioSucursalIds: string[];
  activo: boolean;
  /** Administrador principal de la cuenta: no se elimina. */
  principal?: boolean;
}

export type TipoListaPrecios = 'valor' | 'porcentaje';

export interface ListaPrecios {
  id: string;
  nombre: string;
  tipo: TipoListaPrecios;
  porcentaje: number;
  rolIds: string[];
}

export interface CategoriaItem { id: string; nombre: string; descripcion: string; padreId: string | null }

/** Frecuencia del correo de alertas de stock bajo (specs/2026-10-alertas-stock-correo-config.md §2). */
export type FrecuenciaAlertasStock = 'no-enviar' | 'primero-de-mes' | 'lunes' | 'lunes-a-viernes';

export interface AlertasStockBajoConfig {
  /** Hasta 3 correos además del correo del negocio (Perfil). */
  correosAdicionales: string[];
  frecuencia: FrecuenciaAlertasStock;
}

export interface AjustesState {
  pos: ConfigPOS;
  facturasCompra: ConfigFacturasCompra;
  impuestos: Impuesto[];
  descuentos: Descuento[];
  metodosPago: MetodoPago[];
  categoriasGastos: CategoriaGasto[];
  vendedores: Vendedor[];
  sucursales: Sucursal[];
  tipoCosteo: TipoCosteo;
  integraciones: Record<IntegracionId, Integracion>;
  numeracionNoElectronica: Record<string, NumeracionNoElectronica>;
  perfil: PerfilNegocio;
  numeraciones: Numeracion[];
  roles: Rol[];
  usuarios: UsuarioAjustes[];
  listasPrecios: ListaPrecios[];
  categoriasItems: CategoriaItem[];
  alertasStockBajo: AlertasStockBajoConfig;
}
