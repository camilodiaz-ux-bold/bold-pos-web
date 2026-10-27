/**
 * permisosCatalogo.ts — Catálogo de permisos de Roles (specs/2026-10-ajustes.md §4.5).
 * Réplica de la matriz del POS Retail real: 4 secciones → grupos → un toggle por permiso.
 * Los ids son estables (`grupo.permiso` en minúsculas sin tildes) para guardarlos en cada rol.
 */

export interface PermisoGrupo { nombre: string; permisos: { id: string; label: string }[] }
export interface PermisoSeccion { nombre: string; grupos: PermisoGrupo[] }

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const grupo = (nombre: string, labels: string[]): PermisoGrupo => ({
  nombre,
  permisos: labels.map(label => ({ id: `${slug(nombre)}.${slug(label)}`, label })),
});

/** "Ver/Crear/Editar/Eliminar X" → cuatro etiquetas. */
const vcee = (x: string, verbos = ['Ver', 'Crear', 'Editar', 'Eliminar']) => verbos.map(v => `${v} ${x}`);

export const PERMISOS_CATALOGO: PermisoSeccion[] = [
  {
    nombre: 'Ajustes',
    grupos: [
      grupo('Empresa', ['Ver Ajustes', 'Editar Perfil de la Empresa', 'Actualizar numeración documentos no electrónicos', 'Usar App Móvil']),
      grupo('Oficinas', ['Ver Ingresos y Gastos de todas las sucursales', ...vcee('Sucursales')]),
      grupo('Descuentos', vcee('Descuentos')),
      grupo('Métodos de pago', vcee('Métodos de Pago')),
      grupo('Usuarios', [...vcee('Usuarios'), ...vcee('Roles')]),
    ],
  },
  {
    nombre: 'Productos',
    grupos: [
      grupo('Ítems', [
        ...vcee('Categorías de ítems'), ...vcee('Ítems'),
        'Modificar Precio en Venta', 'Ver Precio de Costo', 'Usar actualización masiva de ítems', 'Usar ajustes de inventario',
        'Usar flujo de inventario', 'Cambiar fecha de ajuste de inventario', ...vcee('Listas de Precio'), 'Usar Variantes de Ítems',
      ]),
    ],
  },
  {
    nombre: 'General',
    grupos: [
      grupo('Contactos', [...vcee('Contactos'), ...vcee('Vendedores')]),
      grupo('Ingresos', [
        ...vcee('recibos'), ...vcee('Facturas de Venta', ['Ver', 'Crear']), ...vcee('Notas Crédito', ['Ver', 'Crear']),
        ...vcee('Notas Débito', ['Ver', 'Crear']), ...vcee('comprobantes'),
      ]),
      grupo('Cotizaciones', vcee('Cotizaciones')),
      grupo('Gastos', [
        'Crear Documento Soporte', 'Ver Documentos Soporte', ...vcee('Gastos'), ...vcee('Categorías de Gastos', ['Crear', 'Editar', 'Eliminar']),
        ...vcee('Factura de Compra', ['Ver', 'Crear', 'Anular', 'Pagar']),
      ]),
    ],
  },
  {
    nombre: 'Reportes',
    grupos: [
      grupo('Ingresos (reportes)', [
        'Reporte de Ventas por Ítems', 'Reporte de Ganancias por Ítems', 'Ver Reportes de Inicio', 'Reporte de Comprobantes Mensuales',
        'Reporte de Cotizaciones', 'Reporte de Comprobantes', 'Reporte de Comprobantes por Vendedor',
      ]),
      grupo('Documentos electrónicos', ['Reporte de Facturas de Venta', 'Reporte de Notas de Crédito', 'Reporte de Notas de Débito', 'Ver Reporte Documentos Soporte']),
      grupo('Administrativos', [
        'Reporte de Ítems', 'Reporte de Contactos', 'Reporte de Cuentas por Cobrar', 'Reporte de Cierre de Caja',
        'Reporte de Cierre de Caja Gerencial', 'Reporte de Inventarios', 'Reporte de Ingresos y Egresos', 'Reporte de Facturas de Compra',
      ]),
    ],
  },
];

export const TODOS_LOS_PERMISOS: string[] = PERMISOS_CATALOGO.flatMap(s => s.grupos.flatMap(g => g.permisos.map(p => p.id)));

/** Etiqueta visible del grupo (quita el sufijo interno que evita ids repetidos). */
export const etiquetaGrupo = (nombre: string): string => nombre.replace(' (reportes)', '');
