/**
 * ReportesPanel
 * ─────────────────────────────────────────────────────────────────────────────
 * Vista de Reportes para Bold POS Restaurantes V1.
 * Layout de 2 columnas. Categorías: Administrativos, Ventas,
 * Documentos electrónicos y Restaurantes (nueva).
 * Sigue exactamente los mismos patrones visuales del diseño Figma.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import {
  ChevronRight,
  LockKeyhole,
  KeyRound,
  List,
  Package,
  ArrowLeftRight,
  CircleDollarSign,
  Users,
  FileText,
  FileCheck,
  FileX,
  FileMinus,
  FileArchive,
  TrendingUp,
  BarChart2,
  ShoppingCart,
  Tag,
  Receipt,
  Clock,
  Wallet,
  CalendarRange,
} from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ReportItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ReportCategory {
  id: string;
  title: string;
  items: ReportItem[];
}

// ─── Datos de categorías ──────────────────────────────────────────────────────

const ICON_COLOR = 'var(--blue-100)';
const ICON_SIZE  = 18;

const CATEGORIES: ReportCategory[] = [
  {
    id: 'administrativos',
    title: 'Administrativos',
    items: [
      { id: 'cierre-caja',          label: 'Cierre de caja',          icon: <LockKeyhole      size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'cierre-caja-gerencial', label: 'Cierre de caja gerencial', icon: <KeyRound         size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'lista-items',          label: 'Lista de ítems',           icon: <List             size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'inventarios',          label: 'Inventarios',              icon: <Package          size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'ingresos-egresos',     label: 'Ingresos y egresos',       icon: <ArrowLeftRight   size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'cuentas-cobrar',       label: 'Cuentas por cobrar',       icon: <CircleDollarSign size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'lista-contactos',      label: 'Lista de contactos',       icon: <Users            size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
    ],
  },
  {
    id: 'ventas',
    title: 'Ventas',
    items: [
      { id: 'comprobantes',            label: 'Comprobantes',             icon: <FileText    size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'comprobantes-mensuales',  label: 'Comprobantes mensuales',   icon: <FileCheck   size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'ventas-items',            label: 'Ventas por ítems',         icon: <ShoppingCart size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'ganancias-items',         label: 'Ganancias por ítems',      icon: <TrendingUp  size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'comprobantes-vendedor',   label: 'Comprobantes por vendedor', icon: <BarChart2   size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'cotizaciones',            label: 'Cotizaciones',              icon: <Tag         size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
    ],
  },
  {
    id: 'documentos',
    title: 'Documentos electrónicos',
    items: [
      { id: 'facturas-venta',     label: 'Facturas de venta',   icon: <FileText   size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'notas-credito',      label: 'Notas crédito',       icon: <FileCheck  size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'notas-debito',       label: 'Notas debito',        icon: <FileMinus  size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'documentos-soporte', label: 'Documentos soporte',  icon: <FileArchive size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
    ],
  },
  {
    id: 'restaurantes',
    title: 'Restaurantes',
    items: [
      { id: 'rest-ventas',         label: 'Ventas',               icon: <Receipt       size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'rest-ocupacion',      label: 'Ocupación y Tiempos',  icon: <Clock         size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'rest-propinas',       label: 'Propinas y Recaudo',   icon: <Wallet        size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
      { id: 'rest-propinas-turno', label: 'Propinas en Turnos',   icon: <CalendarRange size={ICON_SIZE} color={ICON_COLOR} strokeWidth={1.8} /> },
    ],
  },
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ReportRow({
  item,
  isLast,
  onClick,
}: {
  item: ReportItem;
  isLast: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 0',
        height: 56,
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--black-10)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
      className="hover:bg-[var(--blue-10)] transition-colors"
    >
      {/* Icon */}
      <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.icon}
      </div>

      {/* Label */}
      <span style={{
        flex: 1,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '20px',
        color: 'var(--black-100)',
      }}>
        {item.label}
      </span>

      {/* Chevron */}
      <ChevronRight size={18} color="#6C759F" strokeWidth={1.8} style={{ flexShrink: 0 }} />
    </button>
  );
}

function CategoryCard({ category, isRestaurantes }: { category: ReportCategory; isRestaurantes?: boolean }) {
  const navigate = useNavigate();

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 16,
      flex: '1 0 0',
      minWidth: 0,
      padding: '20px 20px 8px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignSelf: 'flex-start',
    }}>
      {/* Category header */}
      <p style={{
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 700,
        fontSize: 18,
        lineHeight: '24px',
        color: 'var(--black-100)',
        margin: 0,
      }}>
        {category.title}
      </p>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {category.items.map((item, idx) => (
          <ReportRow
            key={item.id}
            item={item}
            isLast={idx === category.items.length - 1}
            onClick={isRestaurantes
              ? () => navigate('/reportes/restaurantes/' + item.id)
              : () => toast.info(item.label)
            }
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReportesPanel() {
  // Categorías split: col izquierda [0,2,3], col derecha [1]
  // Fila 1: Administrativos (izq) | Ventas (der)
  // Fila 2: Documentos electrónicos (izq) | Restaurantes (der)

  return (
    <div style={{
      flex: 1,
      backgroundColor: 'var(--blue-10)',
      padding: '24px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      {/* Page title */}
      <p style={{
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 700,
        fontSize: 20,
        lineHeight: '28px',
        color: 'var(--black-100)',
        marginBottom: 20,
      }}>
        Reportes
      </p>

      {/* Grid de categorías */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Fila 1: Administrativos | Ventas */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <CategoryCard category={CATEGORIES[0]} /> {/* Administrativos */}
          <CategoryCard category={CATEGORIES[1]} /> {/* Ventas */}
        </div>

        {/* Fila 2: Documentos electrónicos | Restaurantes */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <CategoryCard category={CATEGORIES[2]} /> {/* Documentos electrónicos */}
          <CategoryCard category={CATEGORIES[3]} isRestaurantes /> {/* Restaurantes (nuevo) */}
        </div>

      </div>
    </div>
  );
}
