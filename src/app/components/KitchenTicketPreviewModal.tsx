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

  const printItems    = items.filter(i => i.quantity > 0);
  const diffItems     = useMemo(() => computeDiffItems(printItems), [items]);
  const modifiedItems = useMemo(() => computeModifiedItems(printItems), [items]);
  const hasNothingNew = isResend && diffItems.length === 0 && modifiedItems.length === 0;

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
            {isResend ? 'Reenviar comanda a cocina' : 'Enviar comanda a cocina'}
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
          {isResend
            ? 'Se imprimirán solo los productos nuevos o modificados'
            : 'Se imprimirá el siguiente ticket en cocina'}
        </p>

        {/* ── Preview del ticket ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-1 flex justify-center">
          <div
            style={{
              width: 280,
              backgroundColor: '#F9F7F4',
              border: '1px solid var(--black-10)',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)',
              borderRadius: 4,
              padding: '18px 0',
              ...MONO,
            }}
          >
            {/* ─ Encabezado del ticket ─ */}
            {isResend ? (
              <div
                style={{
                  backgroundColor: '#FEF3C7',
                  padding: '6px 16px',
                  marginBottom: 4,
                  textAlign: 'center',
                }}
              >
                <span style={{ ...TXT.bold, fontSize: 14 }}>COMANDA ADICIONAL</span>
              </div>
            ) : (
              <p style={{ ...TXT.bold, fontSize: 14, textAlign: 'center', marginBottom: 4, paddingInline: 16 }}>
                COMANDA DE COCINA
              </p>
            )}

            {/* ─ Separador ==== ─ */}
            <p style={{ ...TXT.sep, marginBottom: 8, paddingInline: 16 }}>
              {'===================='}
            </p>

            {/* ─ Identificador + hora ─ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, paddingInline: 16 }}>
              <span style={TXT.base}>{headerLabel}: {headerValue}</span>
              <span style={TXT.base}>{timeStr}</span>
            </div>

            {/* ─ Staff ─ */}
            <p style={{ ...TXT.base, marginBottom: 2, paddingInline: 16 }}>
              {staffLabel}: RA
            </p>

            {/* ─ Personas (solo mesas) ─ */}
            {showPersonas && (
              <p style={{ ...TXT.base, marginBottom: isResend ? 2 : 8, paddingInline: 16 }}>
                Personas: {guests ?? '—'}
              </p>
            )}

            {/* ─ Referencia comanda original (solo reenvío) ─ */}
            {isResend && (
              <p style={{ ...TXT.base, marginBottom: 8, paddingInline: 16, ...(!showPersonas && { marginTop: 6 }) }}>
                Comanda original: {originalComandaTime}
              </p>
            )}

            {/* ─ Separador --- ─ */}
            <p style={{ ...TXT.sep, marginBottom: 10, paddingInline: 16 }}>
              {'--------------------'}
            </p>

            {/* ─ Productos ─ */}
            <div style={{ paddingInline: 16 }}>
              {isResend ? (
                hasNothingNew ? (
                  <p style={{ ...TXT.small, textAlign: 'center', marginBottom: 10 }}>
                    (sin productos nuevos)
                  </p>
                ) : (
                  <>
                    {/* ── Nuevos / cantidad adicional ── */}
                    {diffItems.length > 0 && (
                      <>
                        <p style={{ ...TXT.bold, fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>
                          NUEVOS:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: modifiedItems.length > 0 ? 12 : 10 }}>
                          {diffItems.map(({ item, isNew, delta }) => {
                            const qtyLabel = isNew ? String(item.quantity) : `+${delta}`;
                            return (
                              <div key={item.id}>
                                <p style={{ ...TXT.bold, fontWeight: 600 }}>
                                  {qtyLabel.padEnd(3, ' ')} {item.name}
                                </p>
                                {item.note && item.note.trim() && (
                                  <p style={{ ...TXT.small, paddingLeft: 6, marginTop: 2 }}>
                                    {'    '}&#x2192;{'  '}{item.note}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* ── Modificaciones de nota ── */}
                    {modifiedItems.length > 0 && (
                      <>
                        {/* separador entre secciones */}
                        {diffItems.length > 0 && (
                          <p style={{ ...TXT.sep, marginBottom: 8 }}>
                            {'- - - - - - - - - -'}
                          </p>
                        )}
                        <p style={{ ...TXT.bold, fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>
                          MODIFICACIONES:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                          {modifiedItems.map(({ item }) => (
                            <div key={item.id}>
                              <p style={{ ...TXT.bold, fontWeight: 600 }}>
                                * {item.name}
                              </p>
                              <p style={{ ...TXT.small, paddingLeft: 6, marginTop: 2 }}>
                                {'    '}Nota: {item.note}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )
              ) : (
                printItems.length === 0 ? (
                  <p style={{ ...TXT.small, textAlign: 'center', marginBottom: 10 }}>
                    (sin productos)
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                    {printItems.map(item => (
                      <div key={item.id}>
                        <p style={{ ...TXT.bold, fontWeight: 600 }}>
                          {String(item.quantity).padEnd(3, ' ')} {item.name}
                        </p>
                        {item.note && item.note.trim() && (
                          <p style={{ ...TXT.small, paddingLeft: 6, marginTop: 2 }}>
                            {'    '}&#x2192;{'  '}{item.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* ─ Separador --- ─ */}
            <p style={{ ...TXT.sep, marginBottom: 8, paddingInline: 16 }}>
              {'--------------------'}
            </p>

            {/* ─ Timestamp enviado ─ */}
            <p style={{ ...TXT.small, textAlign: 'center', paddingInline: 16 }}>
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
            Enviar e imprimir
          </button>
        </div>
      </div>
    </div>
  );
}