/**
 * ReporteDevoluciones — Reportes → Administrativos → Devoluciones (specs/2026-11-devoluciones.md §9).
 * Filtros: fecha, sucursal y tipo de documento. Cards "Total devoluciones" (cantidad de devoluciones) y "Valor total"
 * (suma del valor de devolución de las filas filtradas). Una fila por ítem devuelto. Botones: Generar reporte,
 * Limpiar filtros (vuelve al default), Imprimir y Descargar (Excel). Sin permiso propio: usa el general de reportes.
 */
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { useAjustes } from '../../../store/ajustesStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import type { Devolucion } from '../../../types/devolucion';
import { TIPO_DEVOLUCION_LABEL } from '../../../types/devolucion';
import { fmtFechaHora, isoDia } from '../../../utils/ventas';
import { sucursalesDelUsuario } from '../../../utils/devoluciones';
import { imprimirTabla, type ReporteImprimible } from '../../../utils/imprimirTabla';
import { descargarDevolucionesXlsx } from '../../../utils/generateDevolucionesXlsx';
import { FiltroFechas, FiltroSelect, ReporteShell, fmtDinero, useFiltrosReporte, type Columna } from './ReporteShell';

const DIA_MS = 86_400_000;
const GUION = '-';
const TIPOS = ['Todos', ...Object.values(TIPO_DEVOLUCION_LABEL)];

interface Filtros { desde: string; hasta: string; sucursal: string; tipo: string }

export function ReporteDevoluciones() {
  const { ajustes } = useAjustes();
  const { devoluciones } = useDevoluciones();
  const sucursalesUsuario = useMemo(() => sucursalesDelUsuario(ajustes), [ajustes]);

  // Default: últimos 90 días, todas las sucursales a las que tiene acceso (o la única) y todos los tipos.
  const inicial = useMemo<Filtros>(() => ({
    desde: isoDia(Date.now() - 90 * DIA_MS), hasta: isoDia(Date.now()),
    sucursal: sucursalesUsuario.length === 1 ? sucursalesUsuario[0].nombre : 'Todos', tipo: 'Todos',
  }), [sucursalesUsuario]);
  const r = useFiltrosReporte<Filtros>(inicial);

  const sucursalNombre = (id: string) => ajustes.sucursales.find(s => s.id === id)?.nombre ?? id;
  const motivoNombre = (id: string) => ajustes.motivosDevolucion.find(m => m.id === id)?.nombre ?? id;

  const filas: Devolucion[] = useMemo(() => {
    const f = r.aplicados;
    if (!f) return [];
    const permitidas = new Set(sucursalesUsuario.map(s => s.id));
    return devoluciones
      .filter(d => {
        if (!permitidas.has(d.sucursalId)) return false;
        if (f.sucursal !== 'Todos' && sucursalNombre(d.sucursalId) !== f.sucursal) return false;
        if (f.tipo !== 'Todos' && TIPO_DEVOLUCION_LABEL[d.tipo] !== f.tipo) return false;
        const dia = isoDia(d.fecha);
        return (!f.desde || dia >= f.desde) && (!f.hasta || dia <= f.hasta);
      })
      .sort((a, b) => b.fecha - a.fecha || Number(b.numero) - Number(a.numero));
  }, [r.aplicados, devoluciones, sucursalesUsuario]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalDevoluciones = new Set(filas.map(d => d.numero)).size;
  const valorTotal = filas.reduce((s, d) => s + d.valorDevolucion, 0);

  // Columnas, en este orden. En Sin Documento, documento, fecha de venta y valor de venta van con guion.
  const textoColumnas = [
    'Número de devolución', 'Fecha', 'Producto', 'Tipo', 'Número de documento', 'Fecha de venta', 'Valor de venta', 'Valor devolución',
    'Método de pago', 'Motivo', 'Responsable',
  ];
  const celdas = (d: Devolucion): string[] => [
    d.numero, fmtFechaHora(d.fecha), d.nombre, TIPO_DEVOLUCION_LABEL[d.tipo],
    d.numeroDocumento ?? GUION, d.fechaVenta ? fmtFechaHora(d.fechaVenta) : GUION,
    d.valorVentaItem != null ? fmtDinero(d.valorVentaItem) : GUION, fmtDinero(d.valorDevolucion),
    d.metodoPago, motivoNombre(d.motivoId), d.responsable,
  ];
  const columnas: Columna<Devolucion>[] = textoColumnas.map((label, i) => ({
    label, render: d => celdas(d)[i], align: i === 6 || i === 7 ? 'right' : 'left',
  }));

  // Reporte para imprimir y descargar: mismas columnas y los filtros aplicados.
  const reporte = (): ReporteImprimible | null => {
    const f = r.aplicados;
    if (!f) { toast.info('Genera el reporte primero.'); return null; }
    return {
      titulo: 'Reporte de devoluciones',
      filtros: [`Fecha: ${f.desde || '—'} a ${f.hasta || '—'}`, `Sucursal: ${f.sucursal}`, `Tipo de documento: ${f.tipo}`],
      resumen: [`Total devoluciones: ${totalDevoluciones}`, `Valor total: ${fmtDinero(valorTotal)}`],
      columnas: textoColumnas, filas: filas.map(celdas),
    };
  };
  const imprimir = () => { const rep = reporte(); if (rep) imprimirTabla(rep); };
  const descargar = () => {
    const rep = reporte();
    if (rep) descargarDevolucionesXlsx(rep, `Devoluciones_${isoDia(Date.now())}.xlsx`);
  };

  return (
    <ReporteShell
      titulo="Devoluciones" generado={!!r.aplicados} actualizadoEn={r.actualizadoEn} onGenerar={r.generar} onLimpiar={r.limpiar}
      generarLabel="GENERAR REPORTE" excelLabel="DESCARGAR" onImprimir={imprimir} onExcel={descargar}
      mensajeVacio="No hay resultados para los filtros o la búsqueda."
      filtros={<>
        <FiltroFechas label="Fecha" desde={r.filtros.desde} hasta={r.filtros.hasta} onDesde={r.set('desde')} onHasta={r.set('hasta')} />
        <FiltroSelect label="Todas las sucursales" options={['Todos', ...sucursalesUsuario.map(s => s.nombre)]} value={r.filtros.sucursal} onChange={r.set('sucursal')} />
        <FiltroSelect label="Todos los tipos de documento" options={TIPOS} value={r.filtros.tipo} onChange={r.set('tipo')} />
      </>}
      tarjetas={[
        { label: 'Total devoluciones', value: String(totalDevoluciones) },
        { label: 'Valor total', value: fmtDinero(valorTotal) },
      ]}
      columnas={columnas} filas={filas} rowKey={d => d.id}
    />
  );
}
