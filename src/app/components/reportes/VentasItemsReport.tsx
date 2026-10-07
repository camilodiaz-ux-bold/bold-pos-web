/**
 * VentasItemsReport — reporte "Ventas por ítems" (specs/2026-10-reporte-ventas-items.md).
 * Réplica del reporte real de Bold POS, con los datos de ventasStore. Los combos
 * son una fila propia (columna Tipo). Generar/Imprimir/Exportar y los filtros de
 * sucursal, usuario, lista de precios y variante son solo visuales.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, ChevronsUpDown, FileSpreadsheet } from 'lucide-react';
import { FilterDropdown } from '../../pages/ReporteDetallePage';
import { useVentas } from '../../store/ventasStore';
import { useItems } from '../../store/itemsStore';
import { useCatalog, useVertical } from '../../vertical';
import { SESION_VENTAS, isoDia, opciones } from '../../utils/ventas';
import {
  MFONT, TIPO_OPTIONS, PAGE_SIZES, norm, primerDiaDelMes, inputStyle, Field, PillButton, SummaryCard,
} from './reporteShared';
import {
  agregarVentasPorItems, fmtReporte, ventaIncluida, type VentasItemsFila,
} from '../../utils/ventasPorItems';

type SortKey = 'codigo' | 'cantidad' | 'subtotal' | 'total';

function fmtActualizacion(ts: number): string {
  const d = new Date(ts);
  const p = (x: number) => String(x).padStart(2, '0');
  const mes = d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
  return `${d.getDate()} ${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function VentasItemsReport() {
  const navigate = useNavigate();
  const { vertical, has } = useVertical();
  const { ventas } = useVentas();
  const { items } = useItems();
  const { allProducts, catDefs } = useCatalog();
  const sesion = SESION_VENTAS[vertical];

  // Filtros funcionales
  const [desde, setDesde] = useState(primerDiaDelMes);
  const [hasta, setHasta] = useState(() => isoDia(Date.now()));
  const [vendedor, setVendedor] = useState('Todos');
  const [cliente, setCliente] = useState('Todos');
  const [categoria, setCategoria] = useState('Todos');
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('Todos');
  // Filtros solo visuales
  const [sucursal, setSucursal] = useState('Todos');
  const [usuario, setUsuario] = useState('Todos');
  const [lista, setLista] = useState('Todos');
  const [variante, setVariante] = useState('Todos');

  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'subtotal', dir: 'desc' });
  const [actualizadoEn, setActualizadoEn] = useState(() => Date.now());

  useEffect(() => {
    setActualizadoEn(Date.now());
    setPage(0);
  }, [desde, hasta, vendedor, cliente, categoria, nombre, tipo, pageSize]);

  // Ventas del rango (antes de agregar)
  const ventasRango = useMemo(
    () => ventas.filter(v => ventaIncluida(v) && (!desde || isoDia(v.emitidaEn) >= desde) && (!hasta || isoDia(v.emitidaEn) <= hasta)),
    [ventas, desde, hasta],
  );
  const vendedores = useMemo(() => ['Todos', ...opciones(ventasRango, v => v.vendedor)], [ventasRango]);
  const clientes   = useMemo(() => ['Todos', ...opciones(ventasRango, v => v.cliente)], [ventasRango]);

  const filasRango = useMemo(() => {
    const filtradas = ventasRango.filter(v =>
      (vendedor === 'Todos' || v.vendedor === vendedor) && (cliente === 'Todos' || v.cliente === cliente));
    return agregarVentasPorItems(filtradas, { allProducts, catDefs, items });
  }, [ventasRango, vendedor, cliente, allProducts, catDefs, items]);

  const categorias = useMemo(
    () => ['Todos', ...Array.from(new Set(filasRango.map(f => f.categoria).filter(c => c !== '-'))).sort()],
    [filasRango],
  );

  const filas = useMemo(() => {
    const q = norm(nombre.trim());
    const out = filasRango.filter(f =>
      (categoria === 'Todos' || f.categoria === categoria) &&
      (!q || norm(f.producto).includes(q) || norm(f.codigo).includes(q)) &&
      (tipo === 'Todos' || (tipo === 'Combos' ? f.tipo === 'Combo' : f.tipo === 'Ítem')));
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...out].sort((a, b) => {
      const x = a[sort.key], y = b[sort.key];
      return (typeof x === 'string' ? x.localeCompare(y as string) : x - (y as number)) * dir;
    });
  }, [filasRango, categoria, nombre, tipo, sort]);

  const subtotal = filas.reduce((s, f) => s + f.subtotal, 0);
  const total = filas.reduce((s, f) => s + f.total, 0);

  const pages = Math.max(1, Math.ceil(filas.length / pageSize));
  const pageSafe = Math.min(page, pages - 1);
  const visibles = filas.slice(pageSafe * pageSize, pageSafe * pageSize + pageSize);

  const toggleSort = (key: SortKey) =>
    setSort(s => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));

  const th: React.CSSProperties = {
    padding: '12px 16px 12px 0', textAlign: 'left', fontFamily: MFONT, fontWeight: 700, fontSize: 13,
    color: 'var(--black-100)', borderBottom: '2px solid var(--black-10)', whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = {
    padding: '14px 16px 14px 0', fontFamily: MFONT, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
    color: 'var(--black-100)', lineHeight: '18px',
  };

  const SortTh = ({ k, label }: { k: SortKey; label: string }) => {
    const active = sort.key === k;
    const Icon = !active ? ChevronsUpDown : sort.dir === 'asc' ? ChevronUp : ChevronDown;
    return (
      <th style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort(k)}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {label}
          <Icon size={12} color={active ? 'var(--blue-100)' : 'var(--black-40)'} />
        </span>
      </th>
    );
  };

  const vacio = ventasRango.length === 0
    ? 'No hay ventas en este rango de fechas'
    : 'No hay ítems con estos filtros';

  const columnas = has('variantes') ? 8 : 7;

  return (
    <div style={{
      flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/reportes')}
          aria-label="Volver"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36,
            borderRadius: 8, border: '1px solid var(--blue-20)', backgroundColor: '#fff', cursor: 'pointer', flexShrink: 0,
          }}
          className="hover:bg-[var(--blue-10)] transition-colors"
        >
          <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
        </button>
        <p style={{ fontFamily: MFONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0 }}>
          Reporte de Ventas por Ítems{' '}
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--blue-100)' }}>(Comprobantes + Facturas de Venta)</span>
        </p>
      </div>

      {/* ── Filtros ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...inputStyle, padding: '0 10px' }}>
          <Calendar size={14} color="var(--blue-100)" />
          <input type="date" aria-label="Desde" value={desde} onChange={e => setDesde(e.target.value)}
            style={{ border: 'none', outline: 'none', fontFamily: MFONT, fontSize: 13, flex: 1, minWidth: 0, background: 'transparent' }} />
          <span style={{ color: 'var(--black-40)' }}>–</span>
          <input type="date" aria-label="Hasta" value={hasta} onChange={e => setHasta(e.target.value)}
            style={{ border: 'none', outline: 'none', fontFamily: MFONT, fontSize: 13, flex: 1, minWidth: 0, background: 'transparent' }} />
        </div>
        <Field><FilterDropdown label="Todas las sucursales" options={['Todos', sesion.sucursal]} value={sucursal} onChange={setSucursal} /></Field>
        <Field><FilterDropdown label="Selecciona vendedor…" options={vendedores} value={vendedor} onChange={setVendedor} /></Field>
        <Field><FilterDropdown label="Todos los clientes" options={clientes} value={cliente} onChange={setCliente} /></Field>

        <Field><FilterDropdown label="Todas las categorías" options={categorias} value={categoria} onChange={setCategoria} /></Field>
        <input type="text" placeholder="Filtrar por nombre del ítem" value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
        <Field><FilterDropdown label="Selecciona usuario…" options={['Todos', sesion.emitidoPor]} value={usuario} onChange={setUsuario} /></Field>
        <Field><FilterDropdown label="Buscar por lista de precios" options={['Todos']} value={lista} onChange={setLista} /></Field>

        <Field><FilterDropdown label="Buscar por variante" options={['Todos']} value={variante} onChange={setVariante} /></Field>
        <Field><FilterDropdown label="Tipo: Todos" options={TIPO_OPTIONS} value={tipo} onChange={setTipo} /></Field>
      </div>

      {/* ── Botones (solo visuales) ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
        <PillButton label="GENERAR" bg="var(--blue-100)" />
        <PillButton label="IMPRIMIR" bg="var(--blue-100)" />
        <PillButton label="EXPORTAR" bg="var(--coral-100)" icon={<FileSpreadsheet size={14} />} />
      </div>

      {/* ── Tarjetas ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
        <SummaryCard label="Subtotal" value={subtotal} />
        <SummaryCard label="Total" value={total} />
      </div>

      {/* ── Tabla ── */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '20px 20px 12px 20px', display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontFamily: MFONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', margin: '0 0 6px' }}>
          Última actualización del reporte a las: {fmtActualizacion(actualizadoEn)}
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: MFONT, fontSize: 12, color: 'var(--blue-100)', marginBottom: 12 }}>
          Mostrar
          <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
            style={{ height: 26, border: '1px solid var(--blue-20)', borderRadius: 4, fontFamily: MFONT, fontSize: 12, color: 'var(--black-100)', background: '#fff' }}>
            {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          registros
        </label>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <SortTh k="codigo" label="Código" />
                <th style={th}>Producto</th>
                <th style={th}>Tipo</th>
                {has('variantes') && <th style={th}>Variante</th>}
                <th style={th}>Categoría</th>
                <SortTh k="cantidad" label="Cantidad Vendida" />
                <SortTh k="subtotal" label="Subtotal" />
                <SortTh k="total" label="Total" />
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan={columnas} style={{ ...td, textAlign: 'center', color: 'var(--black-60)', padding: '32px 0' }}>{vacio}</td>
                </tr>
              ) : visibles.map((f: VentasItemsFila, idx) => (
                <tr key={f.key}
                  style={{ borderBottom: idx === visibles.length - 1 ? 'none' : '1px solid var(--black-10)' }}
                  className="hover:bg-[var(--blue-10)] transition-colors">
                  <td style={td}>{f.codigo}</td>
                  <td style={td}>{f.producto}</td>
                  <td style={td}>
                    {f.tipo === 'Combo' ? (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 100,
                        backgroundColor: 'var(--coral-10)', color: 'var(--coral-100)', lineHeight: '14px',
                      }}>Combo</span>
                    ) : 'Ítem'}
                  </td>
                  {has('variantes') && <td style={td}>-</td>}
                  <td style={td}>{f.categoria}</td>
                  <td style={td}>{f.cantidad}</td>
                  <td style={td}>{fmtReporte(f.subtotal)}</td>
                  <td style={td}>{fmtReporte(f.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filas.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--black-10)' }}>
            <span style={{ fontFamily: MFONT, fontSize: 12, color: 'var(--black-60)' }}>
              Mostrando {pageSafe * pageSize + 1} a {Math.min(filas.length, (pageSafe + 1) * pageSize)} de {filas.length} registros
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[{ label: 'Anterior', to: pageSafe - 1, off: pageSafe === 0 }, { label: 'Siguiente', to: pageSafe + 1, off: pageSafe >= pages - 1 }].map(b => (
                <button key={b.label} disabled={b.off} onClick={() => setPage(b.to)}
                  style={{
                    height: 28, padding: '0 12px', borderRadius: 14, border: '1px solid var(--blue-20)', backgroundColor: '#fff',
                    fontFamily: MFONT, fontSize: 12, fontWeight: 600,
                    color: b.off ? 'var(--black-40)' : 'var(--blue-100)', cursor: b.off ? 'not-allowed' : 'pointer',
                  }}>
                  {b.label}
                </button>
              ))}
              <span style={{ fontFamily: MFONT, fontSize: 12, color: 'var(--black-60)' }}>{pageSafe + 1} / {pages}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
