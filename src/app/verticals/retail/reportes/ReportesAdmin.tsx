/**
 * ReportesAdmin — reportes administrativos de Retail (specs/2026-10-reportes-retail.md §5.3):
 * Lista de Ítems, Inventarios, Lista de Contactos y Cuentas por Cobrar.
 * Se derivan de itemsStore, contactosStore y ventasStore (cálculo en utils/reportesAdmin.ts).
 * Los filtros de lista de precios y fecha de corte son solo visuales (no hay datos históricos ni listas por ítem).
 */
import React, { useCallback, useMemo, useState } from 'react';
import { useAjustes } from '../../../store/ajustesStore';
import { useContactos } from '../../../store/contactosStore';
import { useItems } from '../../../store/itemsStore';
import { useVentas } from '../../../store/ventasStore';
import { useCatalog } from '../../../vertical';
import { SUCURSALES } from '../../../data/itemsCatalogs';
import { isoDia, opciones } from '../../../utils/ventas';
import {
  cuentasPorCobrar, filasContactos, filasInventario, filasItems,
  type FiltrosReporteCxC, type FiltrosReporteContactos, type FiltrosReporteItemsAdmin,
} from '../../../utils/reportesAdmin';
import {
  FiltroCheck, FiltroFechas, FiltroSelect, MFONT, ReporteShell, fmtDinero, opcionesTodos, useFiltrosReporte, type Columna,
} from './ReporteShell';

const SUCURSALES_ITEMS = ['Todos', ...SUCURSALES.map(s => s.label)];
const cantidad = (n: number | null) => (n === null ? '—' : String(n));

function useListasPrecios(): string[] {
  const { ajustes } = useAjustes();
  return ['Todos', ...ajustes.listasPrecios.map(l => l.nombre)];
}

/** Filas de ítems y categorías, compartidas por Lista de Ítems e Inventarios. */
function useDatosItems() {
  const { items } = useItems();
  const { catDefs } = useCatalog();
  const categoriaDe = useCallback((id: string) => catDefs.find(c => c.id === id)?.name ?? '—', [catDefs]);
  const categorias = useMemo(() => opcionesTodos(catDefs.map(c => c.name)), [catDefs]);
  return { items, categoriaDe, categorias };
}

// ─── Lista de Ítems ──────────────────────────────────────────────────────────

const ITEMS_INICIAL: FiltrosReporteItemsAdmin = { tipo: 'Todos', categoria: 'Todos', estado: 'Todos', sucursal: 'Todos', sinExistencias: true };

export function ReporteListaItems() {
  const d = useDatosItems();
  const listas = useListasPrecios();
  const [lista, setLista] = useState('Todos');
  const r = useFiltrosReporte(ITEMS_INICIAL);

  const filas = useMemo(
    () => (r.aplicados ? filasItems(d.items, d.categoriaDe, r.aplicados) : []),
    [r.aplicados, d.items, d.categoriaDe],
  );
  const conCantidad = filas.filter(f => f.cantidad !== null);

  const columnas: Columna<(typeof filas)[number]>[] = [
    { label: 'Código', render: f => f.codigo },
    { label: 'Nombre', render: f => f.nombre },
    { label: 'Variante', render: f => f.variante },
    { label: 'Descripción', render: f => f.descripcion || '—' },
    { label: 'Referencia', render: f => f.referencia || '—' },
    { label: 'Tipo', render: f => f.tipo },
    { label: 'Categoría', render: f => f.categoria },
    { label: 'Cantidad', render: f => cantidad(f.cantidad) },
    { label: 'Precio Costo', render: f => fmtDinero(f.costo) },
    { label: 'Precio Venta', render: f => fmtDinero(f.precio) },
  ];

  return (
    <ReporteShell
      titulo="Lista de Ítems" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar}
      onLimpiar={() => { r.limpiar(); setLista('Todos'); }} generarLabel="GENERAR" excelLabel="EXCEL"
      filtros={<>
        <FiltroSelect label="Todos los tipos" options={['Todos', 'Inventariable', 'No inventariable', 'Combo']} value={r.filtros.tipo} onChange={r.set('tipo')} />
        <FiltroSelect label="Todas las categorías" options={d.categorias} value={r.filtros.categoria} onChange={r.set('categoria')} />
        <FiltroSelect label="Todos los estados" options={['Todos', 'Activo', 'Inactivo']} value={r.filtros.estado} onChange={r.set('estado')} />
        <FiltroSelect label="Todas las sucursales" options={SUCURSALES_ITEMS} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
        <FiltroSelect label="Buscar por lista de precios" options={listas} value={lista} onChange={setLista} />
      </>}
      tarjetas={[
        { label: 'Cantidad', value: String(conCantidad.reduce((s, f) => s + (f.cantidad ?? 0), 0)) },
        { label: 'Precio de Costo', value: fmtDinero(conCantidad.reduce((s, f) => s + f.costo * (f.cantidad ?? 0), 0)) },
        { label: 'Precio de Venta', value: fmtDinero(conCantidad.reduce((s, f) => s + f.precio * (f.cantidad ?? 0), 0)) },
      ]}
      columnas={columnas} filas={filas} rowKey={f => f.key}
    />
  );
}

// ─── Inventarios ─────────────────────────────────────────────────────────────

export function ReporteInventarios() {
  const d = useDatosItems();
  const listas = useListasPrecios();
  const [lista, setLista] = useState('Todos');
  const [corte, setCorte] = useState(() => isoDia(Date.now()));
  const r = useFiltrosReporte(ITEMS_INICIAL);

  const filas = useMemo(() => {
    if (!r.aplicados) return [];
    return filasInventario(filasItems(d.items, d.categoriaDe, { ...r.aplicados, tipo: 'Todos' }), r.aplicados);
  }, [r.aplicados, d.items, d.categoriaDe]);

  const columnas: Columna<(typeof filas)[number]>[] = [
    { label: 'Código', render: f => f.codigo },
    { label: 'Ítem', render: f => f.nombre },
    { label: 'Variante', render: f => f.variante },
    { label: 'Descripción', render: f => f.descripcion || '—' },
    { label: 'Referencia', render: f => f.referencia || '—' },
    { label: 'Tipo', render: f => f.tipo },
    { label: 'Categoría', render: f => f.categoria },
    { label: 'Precio Costo', render: f => fmtDinero(f.costo) },
    { label: 'Precio Venta', render: f => fmtDinero(f.precio) },
    { label: 'Existencia', render: f => cantidad(f.cantidad) },
    { label: 'Costo Inventario', render: f => fmtDinero(f.costoInventario) },
    { label: 'Venta Inventario', render: f => fmtDinero(f.ventaInventario) },
  ];

  return (
    <ReporteShell
      titulo="Reporte Inventario" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar}
      onLimpiar={() => { r.limpiar(); setLista('Todos'); setCorte(isoDia(Date.now())); }} generarLabel="GENERAR" excelLabel="EXCEL"
      filtros={<>
        <FiltroSelect label="Todas las categorías" options={d.categorias} value={r.filtros.categoria} onChange={r.set('categoria')} />
        <FiltroSelect label="Todos los estados" options={['Todos', 'Activo', 'Inactivo']} value={r.filtros.estado} onChange={r.set('estado')} />
        <FiltroSelect label="Todas las sucursales" options={SUCURSALES_ITEMS} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
        <input type="date" aria-label="Fecha de corte" value={corte} onChange={e => setCorte(e.target.value)}
          style={{ height: 36, padding: '0 12px', border: '1px solid var(--blue-20)', borderRadius: 8, backgroundColor: 'var(--black-0)', fontFamily: MFONT, fontSize: 13 }} />
        <FiltroSelect label="Buscar por lista de precios" options={listas} value={lista} onChange={setLista} />
        <FiltroCheck label="Mostrar productos sin existencias" checked={r.filtros.sinExistencias} onChange={r.set('sinExistencias')} />
      </>}
      tarjetas={[
        { label: 'Cantidad', value: String(filas.reduce((s, f) => s + (f.cantidad ?? 0), 0)) },
        { label: 'Costo Inventario', value: fmtDinero(filas.reduce((s, f) => s + f.costoInventario, 0)) },
        { label: 'Venta Inventario', value: fmtDinero(filas.reduce((s, f) => s + f.ventaInventario, 0)) },
      ]}
      columnas={columnas} filas={filas} rowKey={f => f.key}
    />
  );
}

// ─── Lista de Contactos ──────────────────────────────────────────────────────

const CONTACTOS_INICIAL: FiltrosReporteContactos = { tipo: 'Todos', estado: 'Todos' };

export function ReporteListaContactos() {
  const { contactos } = useContactos();
  const r = useFiltrosReporte(CONTACTOS_INICIAL);

  const filas = useMemo(() => (r.aplicados ? filasContactos(contactos, r.aplicados) : []), [r.aplicados, contactos]);

  const columnas: Columna<(typeof filas)[number]>[] = [
    { label: 'Fecha de creación', render: f => f.creacion },
    { label: 'Número de documento / NIT', render: f => f.documento },
    { label: 'Nombre', render: f => f.nombre },
    { label: 'Tipo', render: f => f.tipo },
    { label: 'Correo electrónico', render: f => f.correo },
    { label: 'Celular', render: f => f.celular },
    { label: 'Dirección', render: f => f.direccion },
    { label: 'Estado', render: f => f.estado },
  ];

  return (
    <ReporteShell
      titulo="Reporte Contactos" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      generarLabel="GENERAR" excelLabel="EXCEL" sinLimpiar sinImprimir
      filtros={<>
        <FiltroSelect label="Todos los tipos" options={['Todos', 'Cliente', 'Proveedor']} value={r.filtros.tipo} onChange={r.set('tipo')} />
        <FiltroSelect label="Todos los estados" options={['Todos', 'Activo', 'Inactivo']} value={r.filtros.estado} onChange={r.set('estado')} />
      </>}
      tarjetas={[]} columnas={columnas} filas={filas} rowKey={f => f.id}
    />
  );
}

// ─── Cuentas por Cobrar ──────────────────────────────────────────────────────

/** "Oct 26, 2026" — encabezado de la tabla, como el real. */
const fechaReporte = (ms: number) => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fechaCorta = (ms: number | null) => (ms === null ? '—' : isoDia(ms).split('-').reverse().join('/'));

export function ReporteCuentasPorCobrar() {
  const { ventas } = useVentas();
  const inicial = useMemo<FiltrosReporteCxC>(() => ({ sucursal: 'Todos', cliente: 'Todos', detallado: false, desde: '2026-09-01', hasta: isoDia(Date.now()) }), []);
  const r = useFiltrosReporte(inicial);

  const o = useMemo(() => {
    const docs = ventas.filter(v => v.estado !== 'abierta');
    return { sucursales: ['Todos', ...opciones(docs, v => v.sucursal)], clientes: ['Todos', ...opciones(docs, v => v.cliente)] };
  }, [ventas]);

  const filas = useMemo(() => (r.aplicados ? cuentasPorCobrar(ventas, r.aplicados, r.actualizadoEn ?? Date.now()) : []), [r.aplicados, r.actualizadoEn, ventas]);
  const suma = (k: 'creditoTotal' | 'saldoPendiente' | 'saldoVencido') => filas.reduce((s, f) => s + f[k], 0);
  const detallado = !!r.aplicados?.detallado;

  const columnas: Columna<(typeof filas)[number]>[] = [
    { label: 'Nombre', render: f => f.nombre },
    ...(detallado ? [
      { label: 'Documento', render: (f: (typeof filas)[number]) => f.documento },
      { label: 'Fecha de emisión', render: (f: (typeof filas)[number]) => fechaCorta(f.emision) },
      { label: 'Fecha de vencimiento', render: (f: (typeof filas)[number]) => fechaCorta(f.vencimiento) },
    ] : []),
    { label: 'Crédito Total', render: f => fmtDinero(f.creditoTotal) },
    { label: 'Saldo Pendiente', render: f => fmtDinero(f.saldoPendiente) },
    { label: 'Saldo Vencido', render: f => fmtDinero(f.saldoVencido) },
  ];

  const celda: React.CSSProperties = { padding: '12px 16px 12px 0', fontFamily: MFONT, fontSize: 13, fontWeight: 700, color: 'var(--black-100)', whiteSpace: 'nowrap' };
  const pie = filas.length > 0 && (
    <tr>
      <td style={celda}>Total</td>
      {detallado && <><td style={celda} /><td style={celda} /><td style={celda} /></>}
      <td style={celda}>{fmtDinero(suma('creditoTotal'))}</td>
      <td style={celda}>{fmtDinero(suma('saldoPendiente'))}</td>
      <td style={celda}>{fmtDinero(suma('saldoVencido'))}</td>
    </tr>
  );

  return (
    <ReporteShell
      titulo="Reporte Cuentas por Cobrar" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      generarLabel="GENERAR" excelLabel="EXCEL"
      tituloTabla={r.actualizadoEn ? `Fecha de Reporte - ${fechaReporte(r.actualizadoEn)}` : undefined}
      filtros={<>
        <FiltroFechas desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
        <FiltroSelect label="Todas las sucursales" options={o.sucursales} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
        <FiltroSelect label="Todos los clientes" options={o.clientes} value={r.filtros.cliente} onChange={r.set('cliente')} />
        <FiltroCheck label="Reporte detallado" checked={r.filtros.detallado} onChange={r.set('detallado')} />
      </>}
      tarjetas={[
        { label: 'Crédito Total', value: fmtDinero(suma('creditoTotal')) },
        { label: 'Saldo Pendiente', value: fmtDinero(suma('saldoPendiente')) },
        { label: 'Saldo Vencido', value: fmtDinero(suma('saldoVencido')) },
      ]}
      columnas={columnas} filas={filas} rowKey={f => f.key} pie={pie}
    />
  );
}
