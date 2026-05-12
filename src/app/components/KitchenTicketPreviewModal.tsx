/**
 * KitchenTicketPreviewModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal de confirmación con preview del ticket de comanda de cocina.
 * Simula exactamente cómo saldrá el ticket en una impresora térmica de 80 mm.
 *
 * Modo inicial  → todos los productos, encabezado "COMANDA DE COCINA"
 * Modo reenvío  → encabezado "COMANDA ADICIONAL" con fondo amarillo, referencia
 *                 a la comanda original y solo productos nuevos / con incremento.
 *
 * Es genérico: acepta datos de Mesas (Mesa: S07) o Mostrador (Orden: #003).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useMemo } from 'react';
import { X, Printer, Info } from 'lucide-react';

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface TicketItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  isSent?: boolean;
  sentQuantity?: number;
  sentNote?: string;   // nota enviada en la comanda anterior
}

export interface KitchenTicketPreviewModalProps {
  /** Etiqueta de la primera línea del ticket: "Mesa" | "Orden" */
  headerLabel: string;
  /** Valor de la primera línea: "S07" | "#003" */
  headerValue: string;
  /** Si se muestra la línea de Personas (mesas: true, mostrador: false) */
  showPersonas?: boolean;
  /** Número de comensales (solo si showPersonas=true) */
  guests?: number;
  /** "Mesero" | "Cajero" */
  staffLabel?: string;
  /** Productos de la orden/mesa */
  items: TicketItem[];
  /** Timestamp del primer envío de comanda (para mostrar en reenvío) */
  firstComandaSentAt?: number;
  isResend?: boolean;
  /** Override del título del modal (default basado en isResend) */
  title?: string;
  /** Override del subtítulo (default basado en isResend) */
  subtitle?: string;
  /** Override del label del botón de acción (default "Enviar e imprimir") */
  actionLabel?: string;
  /** Líneas pre-formateadas para modo comanda de ajuste.
   *  Cuando se proveen, el ticket muestra estas líneas en lugar del listado normal. */
  adjustmentLines?: string[];
  onCancel:  () => void;
  onConfirm: () => void;
}

// ─── Helpers de formato ───────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-CO', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatFullDate(date: Date): string {
  const day    = String(date.getDate()).padStart(2, '0');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const month  = months[date.getMonth()];
  const year   = date.getFullYear();
  return `${day} ${month} ${year}  ${formatTime(date)}`;
}

// ─── Diff de ítems para reenvío ──────────────────────────────────────────────

interface DiffItem {
  item:  TicketItem;
  isNew: boolean;
  delta: number;
}

interface ModifiedItem {
  item: TicketItem;
}

function computeDiffItems(items: TicketItem[]): DiffItem[] {
  const result: DiffItem[] = [];
  for (const item of items) {
    if (!item.isSent) {
      result.push({ item, isNew: true, delta: 0 });
    } else {
      const sent  = item.sentQuantity ?? item.quantity;
      const delta = item.quantity - sent;
      if (delta > 0) result.push({ item, isNew: false, delta });
    }
  }
  return result;
}

/** Productos ya enviados que recibieron una nota nueva o distinta tras el envío */
function computeModifiedItems(items: TicketItem[]): ModifiedItem[] {
  const result: ModifiedItem[] = [];
  for (const item of items) {
    if (!item.isSent) continue;                         // productos nuevos → van en diffItems
    const currentNote = (item.note ?? '').trim();
    const prevNote    = (item.sentNote ?? '').trim();
    if (currentNote && currentNote !== prevNote) {
      result.push({ item });
    }
  }
  return result;
}

// ─── Estilos del ticket (fuente monoespaciada) ────────────────────────────────

const MONO: React.CSSProperties = {
  fontFamily: '"Courier New", Courier, monospace',
};
const TXT = {
  base:  { ...MONO, fontSize: 12, color: '#111'                               } as React.CSSProperties,
  small: { ...MONO, fontSize: 11, color: '#777'                               } as React.CSSProperties,
  sep:   { ...MONO, fontSize: 12, color: '#888', textAlign: 'center' as const },
  bold:  { ...MONO, fontSize: 12, color: '#111', fontWeight: 700              } as React.CSSProperties,
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function KitchenTicketPreviewModal({
  headerLabel,
  headerValue,
  showPersonas = true,
  guests,
  staffLabel   = 'Mesero',
  items,
  firstComandaSentAt,
  isResend     = false,
  title,
  subtitle,
  actionLabel,
  adjustmentLines,
  onCancel,
  onConfirm,
}: KitchenTicketPreviewModalProps) {
  const now         = useMemo(() => new Date(), []);
  const timeStr     = formatTime(now);
  const fullDateStr = formatFullDate(now);

  const originalComandaTime = useMemo(() =>
    firstComandaSentAt
      ? formatTime(new Date(firstComandaSentAt))
      : '—',
  [firstComandaSentAt]);

  const isAdjustMode  = adjustmentLines !== undefined;
  // En reenvío solo mostramos ítems ya enviados con cantidad enviada > 0
  const printItems    = isResend
    ? items.filter(i => i.isSent && (i.sentQuantity ?? i.quantity) > 0)
    : items.filter(i => i.quantity > 0);
  const diffItems     = useMemo(() => computeDiffItems(printItems), [items]);
  const modifiedItems = useMemo(() => computeModifiedItems(printItems), [items]);
  const hasNothingNew = !isAdjustMode && isResend && diffItems.length === 0 && modifiedItems.length === 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-[var(--radius-20)] w-[400px] max-h-[92vh] flex flex-col overflow-hidden" style={{ boxShadow: '0px 8px 32px rgba(0,0,0,0.16)' }}>

        {/* ── Banner informativo ── */}
        <div
          style={{
            backgroundColor: 'var(--blue-10)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <Info size={15} style={{ color: 'var(--black-60)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: 'var(--black-60)', lineHeight: 1.5, margin: 0 }}>
            Este preview es solo ilustrativo. En el producto final, la impresión se ejecuta directamente sin este paso de confirmación.
          </p>
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--black-100)' }}>
            {title ?? (isResend ? 'Reenviar comanda a cocina' : 'Enviar comanda a cocina')}
          </h2>
          <button
            onClick={onCancel}
            className="text-[var(--black-40)] hover:text-[var(--black-60)] transition-colors p-1 rounded-[var(--radius-12)] hover:bg-[var(--blue-10)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Subtítulo ── */}
        <p className="px-6 pb-5 shrink-0" style={{ fontSize: 14, color: 'var(--black-60)' }}>
          {subtitle ?? (isResend
            ? 'Se reimprimirá la orden completa en cocina'
            : 'Se imprimirá el siguiente ticket en cocina')}
        </p>

        {/* ── Preview del ticket ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-1 flex justify-center">
          <div
            style={{
              width: 280,
              backgroundColor: '#fff',
              border: '1px solid #E0E0E0',
              borderRadius: 8,
              padding: '24px',
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {/* ─ Encabezado del ticket ─ */}
            {isAdjustMode ? (
              <div style={{ backgroundColor: '#FFF3D1', padding: '6px 16px', marginBottom: 4, textAlign: 'center' }}>
                <span style={{ ...TXT.bold, fontSize: 14 }}>COMANDA DE AJUSTE</span>
              </div>
            ) : (
              <p style={{ ...TXT.bold, fontSize: 14, textAlign: 'center', marginBottom: 4, paddingInline: 16 }}>
                COMANDA DE COCINA
              </p>
            )}

            {/* ─ Separador ==== ─ */}
            <p style={{ ...TXT.sep, color: '#CCCCCC', display: 'block', marginTop: 8, marginBottom: 8 }}>
              {'===================='}
            </p>

            {/* ─ Identificador + hora ─ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={TXT.base}>{headerLabel}: {headerValue}</span>
              <span style={TXT.base}>{timeStr}</span>
            </div>

            {/* ─ Staff ─ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={TXT.base}>{staffLabel}: RA</span>
            </div>

            {/* ─ Personas (solo mesas) ─ */}
            {showPersonas && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={TXT.base}>Personas: {guests ?? '—'}</span>
              </div>
            )}

            {/* ─ Referencia comanda original (solo reenvío) ─ */}
            {isResend && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={TXT.base}>Comanda original: {originalComandaTime}</span>
              </div>
            )}

            {/* ─ Separador --- ─ */}
            <p style={{ ...TXT.sep, color: '#CCCCCC', display: 'block', marginTop: 8, marginBottom: 8 }}>
              {'--------------------'}
            </p>

            {/* ─ Productos ─ */}
            <div>
              {isAdjustMode ? (
                adjustmentLines!.length === 0 ? (
                  <p style={{ ...TXT.small, textAlign: 'center', marginBottom: 10 }}>
                    (sin cambios pendientes)
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                    {adjustmentLines!.map((line, i) => (
                      <p key={i} style={{ ...TXT.bold, fontWeight: 600 }}>{line}</p>
                    ))}
                  </div>
                )
              ) : printItems.length === 0 ? (
                <p style={{ ...TXT.small, textAlign: 'center', marginBottom: 10 }}>
                  (sin productos)
                </p>
              ) : (
                <div style={{ marginBottom: 4 }}>
                  {printItems.map((item, idx) => {
                    // En reenvío mostramos el snapshot de lo último enviado
                    const displayQty  = isResend ? (item.sentQuantity ?? item.quantity) : item.quantity;
                    const displayNote = isResend ? (item.sentNote ?? '') : (item.note ?? '');
                    const isLast = idx === printItems.length - 1;
                    return (
                      <div key={item.id} style={{ paddingTop: 6, paddingBottom: 6, borderBottom: isLast ? 'none' : '1px solid #F0F0F0' }}>
                        <p style={{ ...TXT.bold, fontWeight: 600 }}>
                          {String(displayQty).padEnd(3, ' ')} {item.name}
                        </p>
                        {displayNote.trim() && (
                          <p style={{ ...TXT.small, paddingLeft: 6, marginTop: 2 }}>
                            {'    '}&#x2192;{'  '}{displayNote}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─ Separador --- ─ */}
            <p style={{ ...TXT.sep, color: '#CCCCCC', display: 'block', marginTop: 8, marginBottom: 8 }}>
              {'--------------------'}
            </p>

            {/* ─ Timestamp enviado ─ */}
            <p style={{ ...TXT.small, marginTop: 12, color: '#606060', fontSize: 12, textAlign: 'center' }}>
              Enviado: {fullDateStr}
            </p>
          </div>
        </div>

        {/* ── Botones de acción ── */}
        <div className="flex items-center gap-3 px-6 py-4 shrink-0 border-t border-[var(--black-10)]">
          <button onClick={onCancel} className="btn btn-cancel flex-1">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
            <Printer size={15} />
            {actionLabel ?? 'Enviar e imprimir'}
          </button>
        </div>
      </div>
    </div>
  );
}