import type { Contacto, ContactoDraft } from '../types/contacto';

/** Solo dígitos — para comparar documentos y teléfonos sin importar el formato. */
export const soloDigitos = (v: string) => v.replace(/\D/g, '');

/** '1077974723' → '1.077.974.723' */
export const fmtDocumento = (v: string) => (v ? Number(v).toLocaleString('es-CO') : '');

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Dígito de verificación de un NIT (algoritmo módulo 11 de la DIAN). */
export function calcularDV(nit: string): string {
  const d = soloDigitos(nit);
  if (!d) return '';
  const pesos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let suma = 0;
  for (let i = 0; i < d.length && i < pesos.length; i++) suma += Number(d[d.length - 1 - i]) * pesos[i];
  const r = suma % 11;
  return String(r > 1 ? 11 - r : r);
}

export interface FiltrosContacto {
  nombre: string; documento: string; correo: string; celular: string; telefono: string;
  estado: 'Todos' | 'Activo' | 'Inactivo';
}

export const FILTROS_VACIOS: FiltrosContacto = {
  nombre: '', documento: '', correo: '', celular: '', telefono: '', estado: 'Todos',
};

const incluye = (valor: string, buscado: string) => valor.toLowerCase().includes(buscado.trim().toLowerCase());

export function filterContactos(lista: Contacto[], f: FiltrosContacto): Contacto[] {
  const doc = soloDigitos(f.documento);
  const cel = soloDigitos(f.celular);
  const tel = soloDigitos(f.telefono);
  return lista.filter(p =>
    (!f.nombre.trim() || incluye(p.nombre, f.nombre)) &&
    (!doc || soloDigitos(p.numeroDocumento).includes(doc)) &&
    (!f.correo.trim() || incluye(p.correo, f.correo)) &&
    (!cel || soloDigitos(p.celular).includes(cel)) &&
    (!tel || soloDigitos(`${p.telefono1}${p.telefono2}`).includes(tel)) &&
    (f.estado === 'Todos' || (f.estado === 'Activo') === p.activo),
  );
}

export type ContactoErrors = Partial<Record<'nombre' | 'tipoContacto' | 'correo' | 'tipoPersona' | 'tipoDocumento' | 'numeroDocumento', string>>;

/** Validación de obligatorios del formulario de contacto (specs/2026-10-proveedores.md §6). */
export function validarContacto(form: ContactoDraft): ContactoErrors {
  const e: ContactoErrors = {};
  const req = 'Campo obligatorio';
  if (!form.nombre.trim()) e.nombre = req;
  if (!form.esCliente && !form.esProveedor) e.tipoContacto = 'Selecciona al menos un tipo de contacto';
  if (!form.correo.trim()) e.correo = req;
  else if (!EMAIL_RE.test(form.correo.trim())) e.correo = 'Ingresa un correo válido';
  if (!form.tipoPersona) e.tipoPersona = req;
  if (!form.tipoDocumento) e.tipoDocumento = req;
  if (!soloDigitos(form.numeroDocumento)) e.numeroDocumento = req;
  return e;
}

/** Normaliza un borrador antes de guardarlo. */
export const normalizarContacto = (form: ContactoDraft): ContactoDraft => ({
  ...form, nombre: form.nombre.trim(), correo: form.correo.trim(), numeroDocumento: soloDigitos(form.numeroDocumento),
});

export const emptyContactoDraft = (tipo: 'cliente' | 'proveedor'): ContactoDraft => ({
  nombre: '', esCliente: tipo === 'cliente', esProveedor: tipo === 'proveedor', activo: true,
  correo: '', celular: '', telefono1: '', telefono2: '', observaciones: '',
  tipoPersona: '', tipoDocumento: '', numeroDocumento: '',
  responsabilidadFiscal: '', regimenFiscal: '', vendedor: '', descuento: '',
  pais: 'Colombia', ciudad: '', direccion: '',
});
