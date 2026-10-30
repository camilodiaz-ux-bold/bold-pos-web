/**
 * generateAlertasStockXlsx — plantilla de Excel de Alertas de Stock (specs/2026-10-alertas-stock-ajustes.md §6.3).
 * `filasPlantilla` arma las filas (puro); `descargarPlantillaAlertas` genera y descarga un .xlsx real con la librería `xlsx`.
 */
import * as XLSX from 'xlsx';
import type { Item } from '../types/item';
import { getVarianteLabel, getVariantes } from '../types/item';
import { SUCURSALES } from '../data/itemsCatalogs';
import { esAlertable } from './alertasStock';

export interface OpcionesPlantilla {
  /** Una sucursal concreta; sin valor = todas. */
  sucursalId?: string;
  /** Solo las filas con la alerta activa. */
  soloAlertaActiva: boolean;
}

export interface FilaPlantilla {
  Código: string;
  Nombre: string;
  Variante: string;
  Sucursal: string;
  Existencia: number;
  'Stock bajo': number | '';
  Alerta: 'Sí' | 'No';
}

const nombreSucursal = (id: string) => SUCURSALES.find(s => s.id === id)?.label ?? id;

/** Una fila por unidad (ítem simple o variante activa) y por sucursal habilitada. */
export function filasPlantilla(items: Item[], { sucursalId, soloAlertaActiva }: OpcionesPlantilla): FilaPlantilla[] {
  const filas: FilaPlantilla[] = [];
  const nombres = new Intl.Collator('es', { sensitivity: 'base' });
  for (const item of [...items].filter(esAlertable).sort((a, b) => nombres.compare(a.nombre, b.nombre))) {
    const unidades = getVariantes(item)
      ? getVariantes(item)!.filter(v => v.activo).map(v => ({ codigo: v.codigo, variante: getVarianteLabel(v), sucursales: v.sucursales }))
      : [{ codigo: item.codigo, variante: '', sucursales: item.sucursales }];
    for (const u of unidades) {
      for (const s of u.sucursales) {
        if (sucursalId && s.sucursalId !== sucursalId) continue;
        if (soloAlertaActiva && !s.alerta) continue;
        filas.push({
          Código: u.codigo,
          Nombre: item.nombre,
          Variante: u.variante,
          Sucursal: nombreSucursal(s.sucursalId),
          Existencia: s.existencia,
          'Stock bajo': s.stockBajo ?? '',
          Alerta: s.alerta ? 'Sí' : 'No',
        });
      }
    }
  }
  return filas;
}

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Nombre de archivo: `alertas-stock-<todas|sucursal>-AAAA-MM-DD.xlsx`. */
export function nombreArchivoPlantilla(sucursalId?: string, hoy: Date = new Date()): string {
  const parte = sucursalId ? slug(nombreSucursal(sucursalId)) : 'todas';
  return `alertas-stock-${parte}-${hoy.toISOString().slice(0, 10)}.xlsx`;
}

export function descargarPlantillaAlertas(filas: FilaPlantilla[], sucursalId?: string): string {
  const hoja = XLSX.utils.json_to_sheet(filas);
  hoja['!cols'] = [{ wch: 16 }, { wch: 32 }, { wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 8 }];
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Alertas de stock');
  const archivo = nombreArchivoPlantilla(sucursalId);
  XLSX.writeFile(libro, archivo);
  return archivo;
}
