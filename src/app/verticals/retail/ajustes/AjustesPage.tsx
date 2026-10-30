/**
 * AjustesPage — grilla de Ajustes del POS Retail (specs/2026-10-ajustes.md §3, fase 1).
 *
 * Grilla de tarjetas + formularios "Configuración POS" y "Facturas de compra". Cada fila de sección abre su panel
 * lateral (Paneles*.tsx); Perfil navega a su página completa (`/ajustes/perfil`).
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  BadgePercent, BellRing, Calculator, ChevronRight, CircleDollarSign, CircleUser, Coins, CreditCard, FileText,
  Hash, Info, KeyRound, Plug, Receipt, ShieldCheck, Store, Tags, UserRound, Users, type LucideIcon,
} from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import { useContactos } from '../../../store/contactosStore';
import { SelectField } from '../../../components/items/FormField';
import {
  CategoriasGastosPanel, ImpuestosPanel, IntegracionesPanel, MetodosPagoPanel, TiposCosteoPanel,
} from './PanelesConfig';
import { HabilitacionDianPanel, NumeracionesPanel } from './PanelesFacturacion';
import { AlertasStockBajoPanel } from './PanelAlertasStockBajo';
import { RolesPanel, UsuariosPanel } from './PanelesAcceso';
import { CategoriasItemsPanel, ListaPreciosPanel } from './PanelesInventario';
import { DescuentosPanel, NumeracionNoElectronicaPanel, SucursalesPanel, VendedoresPanel } from './PanelesListas';
import type {
  CondicionPagoCompra, CondicionPagoPOS, ConfigFacturasCompra, ConfigPOS, DocumentoDefecto,
} from '../../../types/ajustes';

const FONT = "'Montserrat', sans-serif";

// ─── Piezas de la grilla ─────────────────────────────────────────────────────

const card: React.CSSProperties = {
  backgroundColor: 'var(--black-0)', borderRadius: 'var(--radius-12)', boxShadow: 'var(--shadow-4)',
  padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0,
};

const cardTitle: React.CSSProperties = {
  fontFamily: FONT, fontSize: 15, fontWeight: 700, color: 'var(--blue-100)', margin: 0,
};

interface Seccion {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/** Paneles ya implementados, por id de sección. */
const PANELES: Record<string, React.ComponentType<{ onClose: () => void }>> = {
  numeraciones: NumeracionesPanel,
  'habilitacion-dian': HabilitacionDianPanel,
  usuarios: UsuariosPanel,
  roles: RolesPanel,
  'listas-precios': ListaPreciosPanel,
  'categorias-items': CategoriasItemsPanel,
  'numeracion-no-electronica': NumeracionNoElectronicaPanel,
  sucursales: SucursalesPanel,
  impuestos: ImpuestosPanel,
  descuentos: DescuentosPanel,
  'metodos-pago': MetodosPagoPanel,
  'categorias-gastos': CategoriasGastosPanel,
  integraciones: IntegracionesPanel,
  vendedores: VendedoresPanel,
  'tipos-costeo': TiposCosteoPanel,
  'alertas-stock-bajo': AlertasStockBajoPanel,
};

const ico = (Icon: LucideIcon) =>
  <Icon size={18} color="var(--blue-60)" strokeWidth={1.6} />;

const EMPRESA: Seccion[] = [
  { id: 'perfil', label: 'Perfil', icon: ico(CircleUser) },
  { id: 'numeracion-no-electronica', label: 'Numeración documentos no electrónicos', icon: ico(FileText) },
  { id: 'sucursales', label: 'Sucursales', icon: ico(Store) },
];
const FACTURACION: Seccion[] = [
  { id: 'impuestos', label: 'Impuestos', icon: ico(Receipt) },
  { id: 'numeraciones', label: 'Numeraciones', icon: ico(Hash) },
  { id: 'habilitacion-dian', label: 'Habilitación DIAN (Facturación Electrónica)', icon: ico(ShieldCheck) },
];
const OTROS: Seccion[] = [
  { id: 'descuentos', label: 'Descuentos', icon: ico(BadgePercent) },
  { id: 'metodos-pago', label: 'Métodos de pago', icon: ico(CreditCard) },
  { id: 'categorias-gastos', label: 'Categorías de Gastos', icon: ico(Coins) },
  { id: 'integraciones', label: 'Integraciones', icon: ico(Plug) },
];
const ACCESOS: Seccion[] = [
  { id: 'vendedores', label: 'Vendedores', icon: ico(UserRound) },
  { id: 'usuarios', label: 'Usuarios', icon: ico(Users) },
  { id: 'roles', label: 'Roles', icon: ico(KeyRound) },
];
const INVENTARIOS: Seccion[] = [
  { id: 'tipos-costeo', label: 'Tipos de costeo', icon: ico(Calculator) },
  { id: 'categorias-items', label: 'Categorías de ítems', icon: ico(Tags) },
  { id: 'listas-precios', label: 'Lista de precios', icon: ico(CircleDollarSign) },
  { id: 'alertas-stock-bajo', label: 'Alertas stock bajo', icon: ico(BellRing) },
];

function SeccionCard({ titulo, secciones, onAbrir }: { titulo: string; secciones: Seccion[]; onAbrir: (s: Seccion) => void }) {
  return (
    <section style={card} aria-label={titulo}>
      <h2 style={cardTitle}>{titulo}</h2>
      <div>
        {secciones.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onAbrir(s)}
            className="hover:bg-[var(--blue-10)] transition-colors"
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
              background: 'none', border: 'none', cursor: 'pointer', padding: '12px 4px',
              borderTop: i === 0 ? 'none' : '1px solid var(--black-10)',
            }}
          >
            {s.icon}
            <span style={{ flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', lineHeight: '18px' }}>
              {s.label}
            </span>
            <ChevronRight size={18} color="var(--blue-60)" strokeWidth={1.8} />
          </button>
        ))}
      </div>
    </section>
  );
}

function ValidaDatosCard() {
  return (
    <section style={card} aria-label="Valida tus datos">
      <h2 style={cardTitle}>Valida tus datos</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0' }}>
        <svg width="64" height="72" viewBox="0 0 64 72" aria-hidden="true">
          <circle cx="32" cy="22" r="16" fill="var(--blue-30)" />
          <path d="M6 70c0-16 11-26 26-26s26 10 26 26z" fill="var(--blue-100)" />
          <path d="M32 44c-9 0-16 6-19 14h38c-3-8-10-14-19-14z" fill="var(--coral-100)" opacity="0.9" />
        </svg>
        <p style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-60)', textAlign: 'center', margin: 0, lineHeight: '18px' }}>
          Valida tu correo y teléfono de contacto para mantener tu cuenta segura.
        </p>
      </div>
      <button
        type="button"
        onClick={() => toast.success('Correo y teléfono validados (simulado)')}
        className="btn"
        style={{ width: '100%', padding: '12px 20px', fontSize: 14, backgroundColor: 'var(--blue-10)', color: 'var(--blue-100)' }}
      >
        Validar
      </button>
    </section>
  );
}

// ─── Controles de formulario ─────────────────────────────────────────────────

const preguntaStyle: React.CSSProperties = {
  fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--black-100)', margin: 0, lineHeight: '18px',
};

function Radio({ checked, label, onSelect }: { checked: boolean; label: string; onSelect: () => void }) {
  return (
    <button
      type="button" role="radio" aria-checked={checked} onClick={onSelect}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <span style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box',
        border: `1.5px solid ${checked ? 'var(--coral-100)' : 'var(--blue-40)'}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--coral-100)' }} />}
      </span>
      <span style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-100)' }}>{label}</span>
    </button>
  );
}

function RadioGroup<T extends string | boolean>({
  pregunta, value, options, onChange, ayuda,
}: {
  pregunta: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ayuda?: string;
}) {
  return (
    <div role="radiogroup" aria-label={pregunta} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ ...preguntaStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
        {pregunta}
        {ayuda && (
          <span title={ayuda} style={{ display: 'inline-flex', cursor: 'help' }}>
            <Info size={14} color="var(--blue-100)" aria-label={ayuda} />
          </span>
        )}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {options.map(o => (
          <Radio key={String(o.value)} checked={value === o.value} label={o.label} onSelect={() => onChange(o.value)} />
        ))}
      </div>
    </div>
  );
}

const SI_NO = [{ value: true, label: 'Sí' }, { value: false, label: 'No' }];

function GuardarButton({ disabled }: { disabled: boolean }) {
  return (
    <button
      type="submit" disabled={disabled}
      className={disabled ? 'btn' : 'btn btn-primary'}
      style={disabled
        ? { width: '100%', padding: '12px 20px', fontSize: 14, backgroundColor: 'var(--blue-10)', color: 'var(--black-40)', cursor: 'not-allowed' }
        : { width: '100%' }}
    >
      Guardar
    </button>
  );
}

// ─── Configuración POS ───────────────────────────────────────────────────────

function ConfiguracionPOSCard() {
  const { ajustes, setPos } = useAjustes();
  const { contactos } = useContactos();
  const [draft, setDraft] = useState<ConfigPOS>(ajustes.pos);
  const [error, setError] = useState('');

  const clientes = useMemo(
    () => contactos.filter(c => c.esCliente && c.activo).map(c => ({ value: c.id, label: c.nombre })),
    [contactos],
  );
  const dirty = JSON.stringify(draft) !== JSON.stringify(ajustes.pos);
  const set = <K extends keyof ConfigPOS>(key: K) => (value: ConfigPOS[K]) => setDraft(d => ({ ...d, [key]: value }));

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.clienteDefectoId) { setError('Este campo es requerido'); return; }
    setError('');
    setPos(draft);
    toast.success('Configuración POS guardada');
  };

  return (
    <section style={card} aria-label="Configuración POS">
      <h2 style={cardTitle}>Configuración POS</h2>
      <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SelectField
          label="Cliente por defecto al vender" required clearable
          value={draft.clienteDefectoId} options={clientes} error={error}
          onChange={v => { set('clienteDefectoId')(v); if (v) setError(''); }}
        />
        <SelectField
          label="Documento por defecto al vender" required
          value={draft.documentoDefecto} onChange={v => set('documentoDefecto')(v as DocumentoDefecto)}
          options={[{ value: 'comprobante', label: 'Comprobante' }, { value: 'factura', label: 'Factura electrónica de venta' }]}
        />
        <RadioGroup<CondicionPagoPOS>
          pregunta="Condición de pago*" value={draft.condicionPago} onChange={set('condicionPago')}
          options={[{ value: 'Contado', label: 'Contado' }, { value: 'Contado/Crédito', label: 'Contado/Crédito' }]}
        />
        <RadioGroup pregunta="¿Deseas llevar un control de turnos?" value={draft.controlTurnos} options={SI_NO} onChange={set('controlTurnos')} />
        <RadioGroup pregunta="¿Deseas vender sin existencias de inventario?" value={draft.venderSinExistencias} options={SI_NO} onChange={set('venderSinExistencias')} />
        <RadioGroup pregunta="¿Deseas llevar el control de órdenes / mesas en tus ventas?" value={draft.controlMesas} options={SI_NO} onChange={set('controlMesas')} />
        <RadioGroup
          pregunta="Unificar precio total entre Factura Electrónica y Comprobante de Venta"
          value={draft.unificarPrecioTotal} options={SI_NO} onChange={set('unificarPrecioTotal')}
        />
        <p style={{ ...preguntaStyle, fontWeight: 500 }}>
          ID comercio en Bold: <strong style={{ fontWeight: 700 }}>{draft.idComercioBold}</strong>
        </p>
        <GuardarButton disabled={!dirty} />
      </form>
    </section>
  );
}

// ─── Facturas de compra ──────────────────────────────────────────────────────

function FacturasCompraCard() {
  const { ajustes, setFacturasCompra } = useAjustes();
  const [draft, setDraft] = useState<ConfigFacturasCompra>(ajustes.facturasCompra);
  const dirty = JSON.stringify(draft) !== JSON.stringify(ajustes.facturasCompra);
  const set = <K extends keyof ConfigFacturasCompra>(key: K) => (value: ConfigFacturasCompra[K]) =>
    setDraft(d => ({ ...d, [key]: value }));

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setFacturasCompra(draft);
    toast.success('Ajustes de facturas de compra guardados');
  };

  return (
    <section style={{ ...card, alignSelf: 'start' }} aria-label="Facturas de compra">
      <h2 style={cardTitle}>Facturas de compra</h2>
      <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <RadioGroup
          pregunta="Afectación de inventarios" value={draft.afectaInventario} onChange={set('afectaInventario')}
          options={[{ value: true, label: 'Sí afecta' }, { value: false, label: 'No afecta' }]}
          ayuda="Define si las facturas de compra nuevas suman al inventario de forma predeterminada."
        />
        <RadioGroup
          pregunta="Uso de impuestos y retenciones" value={draft.usarImpuestos} options={SI_NO} onChange={set('usarImpuestos')}
          ayuda="Si lo activas, las facturas de compra muestran impuestos y retenciones en el formulario, el detalle y los totales."
        />
        <RadioGroup<CondicionPagoCompra>
          pregunta="Condición de pago" value={draft.condicionPago} onChange={set('condicionPago')}
          options={[{ value: 'Crédito', label: 'Crédito' }, { value: 'Contado', label: 'Contado' }, { value: 'Crédito / Contado', label: 'Crédito / Contado' }]}
          ayuda="Forma de pago con la que arranca una factura de compra nueva."
        />
        <GuardarButton disabled={!dirty} />
      </form>
    </section>
  );
}

// ─── Página ──────────────────────────────────────────────────────────────────

export function AjustesPage() {
  const navigate = useNavigate();
  const [abierta, setAbierta] = useState<string | null>(null);
  const abrir = (s: Seccion) => {
    if (s.id === 'perfil') navigate('/ajustes/perfil');
    else setAbierta(s.id);
  };
  const Panel = abierta ? PANELES[abierta] : null;
  return (
    <div style={{
      flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto',
      padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--blue-100)', margin: 0 }}>
        Ajustes
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, alignItems: 'start' }}>
        <ValidaDatosCard />
        <SeccionCard titulo="Empresa" secciones={EMPRESA} onAbrir={abrir} />
        <SeccionCard titulo="Facturación" secciones={FACTURACION} onAbrir={abrir} />
        <SeccionCard titulo="Otros Ajustes" secciones={OTROS} onAbrir={abrir} />
        <SeccionCard titulo="Accesos y roles" secciones={ACCESOS} onAbrir={abrir} />
        <SeccionCard titulo="Inventarios" secciones={INVENTARIOS} onAbrir={abrir} />
        <ConfiguracionPOSCard />
        <FacturasCompraCard />
      </div>
      {Panel && <Panel onClose={() => setAbierta(null)} />}
    </div>
  );
}
