/**
 * VentasAsyncReport — reporte "Ventas Async".
 *
 * Mismos filtros que el reporte síncrono "Ventas", pero en vez de mostrar
 * datos en vivo, encola un job que se resuelve en segundo plano (ver
 * asyncReportsStore) y mantiene un historial descargable persistente.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Download, RotateCcw } from 'lucide-react';
import { FilterDropdown, StatusBadge } from '../../pages/ReporteDetallePage';
import { useAsyncReports, type AsyncReportJob } from '../../store/asyncReportsStore';

const ESTADO_OPTIONS  = ['Todos', 'Pagada', 'No Pagada', 'Anulada'];
const USUARIO_OPTIONS = ['Todos', 'Carlos Pérez', 'Laura Gómez', 'Miguel Torres', 'Ana Ruiz'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatElapsed(fromTs: number, nowTs: number): string {
  const minutes = Math.max(0, Math.round((nowTs - fromTs) / 60_000));
  if (minutes < 1) return '<1 min';
  return `${minutes} min`;
}

function summarizeFilters(job: AsyncReportJob): string {
  const parts: string[] = [];
  if (job.filters.estado !== 'Todos')  parts.push(`Estado: ${job.filters.estado}`);
  if (job.filters.usuario !== 'Todos') parts.push(`Usuario: ${job.filters.usuario}`);
  if (job.filters.includeTip)          parts.push('Con propina');
  return parts.length ? parts.join(' · ') : 'Sin filtros';
}

// ─── Modal de confirmación ────────────────────────────────────────────────────

function ConfirmRetryModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div style={{
        backgroundColor: '#fff', borderRadius: 24, padding: 32,
        width: 380, display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
      }}>
        <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--black-100)', textAlign: 'center', margin: 0, marginBottom: 8 }}>
          ¿Reintentar generación?
        </h2>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, color: 'var(--black-60)', textAlign: 'center', margin: 0, marginBottom: 24 }}>
          Se volverá a generar este reporte con los mismos filtros.
        </p>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, height: 44, borderRadius: 22, border: '1px solid var(--blue-20)', background: '#fff', color: 'var(--black-100)', fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, height: 44, borderRadius: 22, border: 'none', background: 'var(--coral-100)', color: '#fff', fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function VentasAsyncReport() {
  const navigate = useNavigate();
  const { jobs, requestReport, retryReport, downloadReport } = useAsyncReports();

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [estado,     setEstado]     = useState('Todos');
  const [usuario,    setUsuario]    = useState('Todos');
  const [includeTip, setIncludeTip] = useState(false);

  const [confirmRetryId, setConfirmRetryId] = useState<string | null>(null);

  // Tick cada segundo mientras haya algún job "en proceso" (tiempo transcurrido).
  const hasProcessing = jobs.some(j => j.status === 'processing');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!hasProcessing) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [hasProcessing]);

  const canGenerate = fechaDesde !== '' && fechaHasta !== '';

  const handleGenerar = () => {
    if (!canGenerate) return;
    requestReport(fechaDesde, fechaHasta, { estado, usuario, includeTip });
  };

  const handleRegenerar = (job: AsyncReportJob) => {
    requestReport(job.rangeFrom, job.rangeTo, job.filters);
  };

  const sortedJobs = [...jobs].sort((a, b) => b.requestedAt - a.requestedAt);

  return (
    <div style={{
      flex: 1,
      backgroundColor: 'var(--blue-10)',
      overflowY: 'auto',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/reportes')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8,
            border: '1px solid var(--blue-20)',
            backgroundColor: '#fff',
            cursor: 'pointer', flexShrink: 0,
          }}
          className="hover:bg-[var(--blue-10)] transition-colors"
        >
          <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
        </button>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0 }}>
          Ventas
        </p>
      </div>

      {/* ── Panel de filtros + generar ── */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="date"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
            style={{
              height: 36, paddingLeft: 12, paddingRight: 12,
              border: '1px solid var(--blue-20)', borderRadius: 8,
              fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 500,
              color: fechaDesde ? 'var(--black-100)' : 'var(--black-40)',
              outline: 'none', cursor: 'pointer', minWidth: 130,
            }}
          />
          <input
            type="date"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
            style={{
              height: 36, paddingLeft: 12, paddingRight: 12,
              border: '1px solid var(--blue-20)', borderRadius: 8,
              fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 500,
              color: fechaHasta ? 'var(--black-100)' : 'var(--black-40)',
              outline: 'none', cursor: 'pointer', minWidth: 130,
            }}
          />
          <FilterDropdown label="Usuario" options={USUARIO_OPTIONS} value={usuario} onChange={setUsuario} />
          <FilterDropdown label="Estado"  options={ESTADO_OPTIONS}  value={estado}  onChange={setEstado} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--black-60)', fontFamily: "'Montserrat', sans-serif", cursor: 'pointer', marginLeft: 8 }}>
            <input
              type="checkbox"
              checked={includeTip}
              onChange={e => setIncludeTip(e.target.checked)}
              style={{ width: 14, height: 14, cursor: 'pointer', accentColor: '#121E6C' }}
            />
            Incluir propina en el reporte
          </label>
        </div>

        <div>
          <button
            onClick={handleGenerar}
            disabled={!canGenerate}
            style={{
              height: 40, padding: '0 20px', borderRadius: 20, border: 'none',
              background: canGenerate ? 'var(--coral-100)' : 'var(--black-10)',
              color: canGenerate ? '#fff' : 'var(--black-40)',
              fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 600,
              cursor: canGenerate ? 'pointer' : 'not-allowed',
            }}
          >
            Generar reporte
          </button>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: 'var(--black-60)', margin: '8px 0 0' }}>
            Este reporte se genera en segundo plano y puede tardar de 1 a 5 minutos. Te notificaremos cuando esté listo.
          </p>
        </div>
      </div>

      {/* ── Historial ── */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '20px 20px 8px 20px', display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--black-100)', margin: '0 0 12px' }}>
          Historial de reportes generados
        </p>

        {sortedJobs.length === 0 ? (
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: 'var(--black-60)', padding: '24px 0' }}>
            Aún no has generado ningún reporte. Usa el formulario de arriba para comenzar.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Solicitado', 'Rango del reporte', 'Filtros', 'Estado', 'Vence', 'Acción'].map(label => (
                    <th key={label} style={{
                      padding: '12px 16px 12px 0', textAlign: 'left',
                      fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 13,
                      color: 'var(--black-100)', borderBottom: '2px solid var(--black-10)', whiteSpace: 'nowrap',
                    }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedJobs.map((job, idx) => (
                  <tr key={job.id} style={{ borderBottom: idx === sortedJobs.length - 1 ? 'none' : '1px solid var(--black-10)' }}>
                    <td style={cellStyle}>{formatDateTime(job.requestedAt)}</td>
                    <td style={cellStyle}>{job.rangeFrom} – {job.rangeTo}</td>
                    <td style={{ ...cellStyle, color: 'var(--black-60)' }}>{summarizeFilters(job)}</td>
                    <td style={cellStyle}>
                      {job.status === 'processing' && <StatusBadge label={`En proceso · ${formatElapsed(job.requestedAt, now)}`} variant="warning" />}
                      {job.status === 'ready'      && <StatusBadge label="Listo" variant="success" />}
                      {job.status === 'error'      && <StatusBadge label="Error" variant="error" />}
                      {job.status === 'expired'    && <StatusBadge label="Expirado" variant="neutral" />}
                    </td>
                    <td style={{ ...cellStyle, color: 'var(--black-60)' }}>
                      {job.status === 'ready' && job.expiresAt ? new Date(job.expiresAt).toLocaleDateString('es-CO') : '—'}
                    </td>
                    <td style={cellStyle}>
                      {job.status === 'ready' && (
                        <button onClick={() => downloadReport(job.id)} style={actionButtonStyle}>
                          <Download size={14} /> Descargar
                        </button>
                      )}
                      {job.status === 'error' && (
                        <button onClick={() => setConfirmRetryId(job.id)} style={actionButtonStyle}>
                          <RotateCcw size={14} /> Reintentar
                        </button>
                      )}
                      {job.status === 'expired' && (
                        <button onClick={() => handleRegenerar(job)} style={actionButtonStyle}>
                          <RotateCcw size={14} /> Regenerar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmRetryId && (
        <ConfirmRetryModal
          onCancel={() => setConfirmRetryId(null)}
          onConfirm={() => { retryReport(confirmRetryId); setConfirmRetryId(null); }}
        />
      )}
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  padding: '14px 16px 14px 0',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--black-100)',
};

const actionButtonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  height: 32, padding: '0 12px', borderRadius: 16,
  border: '1.5px solid #121E6C', background: '#fff',
  fontSize: 13, fontWeight: 600, color: '#121E6C',
  fontFamily: "'Montserrat', sans-serif", cursor: 'pointer',
};
