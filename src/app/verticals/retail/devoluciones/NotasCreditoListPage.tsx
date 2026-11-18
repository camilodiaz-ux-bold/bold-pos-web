/**
 * NotasCreditoListPage — Ingresos → Notas crédito (`/notas-credito`). Réplica del listado del POS real
 * (pos.stg.bold.co/#/retail/income/credit-note): filtros (código, estado DIAN, fechas, tipo, motivo y cliente), contador
 * "Mostrando X de Y" y una fila por nota con el día grande, número, cliente, fecha de emisión, estado y valor.
 * Las notas salen de las devoluciones de tipo Factura (un solo modelo); clic en una fila abre su ver.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { CalendarDays } from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import { useVentas } from '../../../store/ventasStore';
import { FilterPillInput, FilterPillSelect } from '../../../components/items/FilterPill';
import type { Devolucion } from '../../../types/devolucion';
import { isoDia } from '../../../utils/ventas';
import { totalDevolucion } from '../../../utils/devoluciones';

const FONT = "'Montserrat', sans-serif";
const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const DIA_MS = 86_400_000;

type EstadoDian = NonNullable<Devolucion['estadoDian']>;
const ESTADOS: { value: EstadoDian; label: string }[] = [
  { value: 'aceptada', label: 'Aceptada' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'rechazada', label: 'Rechazada' },
];
const COLOR_ESTADO: Record<EstadoDian, { texto: string; fondo: string }> = {
  aceptada: { texto: '#1b8959', fondo: '#f4fdf9' },
  pendiente: { texto: 'var(--blue-100)', fondo: 'var(--blue-10)' },
  rechazada: { texto: 'var(--coral-100)', fondo: 'var(--coral-10)' },
};
/** Las notas crédito del prototipo salen de una factura, así que todas son "con referencia". */
const TIPO_CON_REFERENCIA = 'con-referencia';

interface NotaCredito { numero: string; devolucion: string; fecha: number; cliente: string; total: number; estado: EstadoDian; motivoId: string }

const dineroReal = (n: number) => `$ ${Math.round(n).toLocaleString('en-US')}`;

export function NotasCreditoListPage() {
  const navigate = useNavigate();
  const { ajustes } = useAjustes();
  const { devoluciones } = useDevoluciones();
  const { ventas } = useVentas();

  const hoy = Date.now();
  const desdeDefecto = isoDia(hoy - 90 * DIA_MS);
  const hastaDefecto = isoDia(hoy);
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState(desdeDefecto);
  const [hasta, setHasta] = useState(hastaDefecto);
  const [tipo, setTipo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [cliente, setCliente] = useState('');

  // Una nota por devolución de Factura.
  const notas: NotaCredito[] = useMemo(() => {
    const porNumero = new Map<string, Devolucion[]>();
    devoluciones.filter(d => d.tipo === 'factura' && d.notaCredito).forEach(d => porNumero.set(d.numero, [...(porNumero.get(d.numero) ?? []), d]));
    return [...porNumero.values()].map(filas => {
      const d = filas[0];
      const venta = ventas.find(v => v.id === d.ventaId);
      return {
        numero: d.notaCredito!, devolucion: d.numero, fecha: d.fecha, cliente: venta?.cliente ?? '—',
        total: totalDevolucion(filas), estado: d.estadoDian ?? 'aceptada', motivoId: d.motivoId,
      };
    }).sort((a, b) => b.fecha - a.fecha);
  }, [devoluciones, ventas]);

  const clientes = useMemo(() => [...new Set(notas.map(n => n.cliente))].sort((a, b) => a.localeCompare(b, 'es')), [notas]);

  const filtradas = notas.filter(n => {
    const dia = isoDia(n.fecha);
    if (codigo.trim() && !n.numero.toLowerCase().includes(codigo.trim().toLowerCase())) return false;
    if (estado && n.estado !== estado) return false;
    if (desde && dia < desde) return false;
    if (hasta && dia > hasta) return false;
    if (tipo && tipo !== TIPO_CON_REFERENCIA) return false;
    if (motivo && n.motivoId !== motivo) return false;
    if (cliente && n.cliente !== cliente) return false;
    return true;
  });

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0 }}>Notas Crédito</p>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary" onClick={() => toast.info('Nuevo — próximamente')}>Nuevo</button>
        </div>
      </div>

      {/* Filtros: dos filas de tres, como en el real */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
        <FilterPillInput placeholder="Buscar por código" value={codigo} onChange={setCodigo} />
        <FilterPillSelect placeholder="Estado DIAN" value={estado} onChange={setEstado} options={ESTADOS} />
        <div className="filter-pill" title="Rango de fechas">
          <CalendarDays size={16} color="var(--blue-50)" />
          <input type="date" value={desde} aria-label="Desde" onChange={e => setDesde(e.target.value)}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT, fontSize: 13, fontWeight: 500 }} />
          <span style={{ color: 'var(--black-40)' }}>-</span>
          <input type="date" value={hasta} aria-label="Hasta" onChange={e => setHasta(e.target.value)}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT, fontSize: 13, fontWeight: 500 }} />
        </div>
        <FilterPillSelect placeholder="Elige el tipo" value={tipo} onChange={setTipo}
          options={[{ value: TIPO_CON_REFERENCIA, label: 'Nota crédito con referencia' }, { value: 'sin-referencia', label: 'Nota crédito sin referencia' }]} />
        <FilterPillSelect placeholder="Elige un motivo" value={motivo} onChange={setMotivo}
          options={ajustes.motivosDevolucion.map(m => ({ value: m.id, label: m.nombre }))} />
        <FilterPillSelect placeholder="Todos los clientes" value={cliente} onChange={setCliente} options={clientes.map(c => ({ value: c, label: c }))} />
      </div>

      <div>
        <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: 'var(--black-60)', margin: '0 0 8px' }}>Mostrando {filtradas.length} de {notas.length}</p>
        <div style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }}>
          {filtradas.length === 0 ? (
            <p style={{ fontFamily: FONT, fontSize: 14, color: 'var(--black-60)', textAlign: 'center', padding: '40px 0', margin: 0 }}>
              {notas.length === 0 ? 'Aún no hay notas crédito.' : 'No hay resultados para los filtros o la búsqueda.'}
            </p>
          ) : filtradas.map(n => {
            const f = new Date(n.fecha);
            const color = COLOR_ESTADO[n.estado];
            return (
              <button
                key={n.numero} onClick={() => navigate(`/notas-credito/${n.devolucion}`)}
                className="hover:bg-[var(--blue-10)] transition-colors"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 24, padding: '12px 24px', border: 'none', borderBottom: '1px solid var(--black-10)', backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: FONT }}
              >
                <div style={{ width: 90, textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 28, lineHeight: '32px', color: 'var(--black-100)' }}>{f.getDate()}</div>
                  <div style={{ fontSize: 11, color: 'var(--black-60)' }}>{MESES[f.getMonth()]} {f.getFullYear()}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: '20px', color: 'var(--black-100)' }}>
                  <div style={{ fontWeight: 700 }}>No. - {n.numero}</div>
                  <div>{n.cliente}</div>
                  <div>Fecha de Emisión: {isoDia(n.fecha)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, fontSize: 13 }}>
                  <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: color.texto, backgroundColor: color.fondo }}>
                    {ESTADOS.find(e => e.value === n.estado)?.label}
                  </span>
                  <div style={{ color: color.texto, marginTop: 2 }}>{dineroReal(n.total)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
