import type { Contacto } from '../types/contacto';
import { PROVEEDORES_COMPRA } from './facturasCompraSeed';

export const CONTACTOS_STORAGE_KEY = 'bold-pos:contactos:v2';

export const TIPO_PERSONA_OPCIONES = [
  { value: 'natural', label: 'Persona natural' },
  { value: 'juridica', label: 'Persona jurídica' },
];

export const TIPO_DOCUMENTO_OPCIONES = [
  { value: 'nit', label: 'NIT' },
  { value: 'cc', label: 'Cédula de ciudadanía' },
  { value: 'ce', label: 'Cédula de extranjería' },
];

const toOpciones = (labels: string[]) => labels.map(l => ({ value: l, label: l }));

export const RESPONSABILIDAD_FISCAL_OPCIONES = toOpciones(['Régimen simple', 'Régimen común']);
export const REGIMEN_FISCAL_OPCIONES = toOpciones(['Responsable de IVA', 'No responsable de IVA']);
export const VENDEDOR_OPCIONES = toOpciones(['Andrés Lizarazo', 'Wendell Nazar']);
export const DESCUENTO_OPCIONES = toOpciones(['5%', '10%']);
export const PAIS_OPCIONES = toOpciones(['Colombia']);
export const CIUDAD_OPCIONES = toOpciones([
  'Bogotá D.C.', 'Medellín (Antioquia)', 'Cali (Valle del Cauca)', 'Barranquilla (Atlántico)', 'Cartagena (Bolívar)',
]);

type SeedBase = Pick<Contacto, 'id' | 'nombre' | 'correo' | 'numeroDocumento' | 'tipoPersona' | 'tipoDocumento'>;

const base: Omit<Contacto, keyof SeedBase> = {
  esCliente: true, esProveedor: true, activo: true,
  celular: '', telefono1: '', telefono2: '', observaciones: '',
  responsabilidadFiscal: '', regimenFiscal: '', vendedor: '', descuento: '',
  pais: 'Colombia', ciudad: '', direccion: '',
};

export function buildSeedContactos(): Contacto[] {
  const seed: SeedBase[] = [
    { id: 'ctc-1', nombre: 'Gilma Florez Hernandez', correo: 'florezhernandezgilma@gmail.com', numeroDocumento: '39719859', tipoPersona: 'natural', tipoDocumento: 'cc' },
    { id: 'ctc-2', nombre: '79304228 - LECHONERÍA EL ESPLENDOR TOLIMENSE', correo: 'elesplendortolimense@gmail.com', numeroDocumento: '79304228', tipoPersona: 'juridica', tipoDocumento: 'nit' },
    { id: 'ctc-3', nombre: 'Arepas San Martin - ANDRÉS CAMILO MARTIN PALACIO', correo: 'arepassanmartin0516@gmail.com', numeroDocumento: '1077974723', tipoPersona: 'natural', tipoDocumento: 'cc' },
    { id: 'ctc-4', nombre: 'M6GLU4NXLW - Magic Tour - 21788267', correo: 'guatapemagictour@gmail.com', numeroDocumento: '21788267', tipoPersona: 'natural', tipoDocumento: 'cc' },
    { id: 'ctc-5', nombre: '1128479906 - Persianas Y Decoración Tommy', correo: 'andresfelo-23@hotmail.com', numeroDocumento: '1128479906', tipoPersona: 'natural', tipoDocumento: 'cc' },
    { id: 'ctc-6', nombre: 'Fruto de vida SAS - Andres Mauricio Ponce Aguirre', correo: 'andresponce50@gmail.com', numeroDocumento: '80872049', tipoPersona: 'juridica', tipoDocumento: 'nit' },
  ];
  const personas: Contacto[] = seed.map(s => ({ ...base, ...s }));
  // Proveedores de las facturas de compra sembradas (specs/2026-10-facturas-compra.md §4): solo proveedor.
  const empresas: Contacto[] = PROVEEDORES_COMPRA.map(p => ({
    ...base, id: p.id, nombre: p.nombre, correo: p.correo, numeroDocumento: p.nit,
    tipoPersona: 'juridica', tipoDocumento: 'nit', esCliente: false,
  }));
  return [...personas, ...empresas];
}

