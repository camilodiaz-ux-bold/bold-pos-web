/**
 * PlantillaAlertasPage — paso "Descarga la plantilla" de la Actualización masiva de Alertas de Stock, réplica del paso que sigue
 * a "Iniciar edición masiva" en el POS real (specs/2026-10-alertas-stock-ajustes.md §6.2). La tarjeta de descarga abre
 * el modal de descarga; "Ya tengo la plantilla actualizada" abre el selector de archivos (no se sube nada).
 */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Download, FileDown, FileSpreadsheet, X } from 'lucide-react';
import { DescargarPlantillaModal } from '../../components/items/alertas/DescargarPlantillaModal';

const FONT = "'Montserrat', sans-serif";

const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8,
  border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
};

export function PlantillaAlertasPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const archivoRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '20px 24px 56px', minHeight: 460 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button" aria-label="Volver" onClick={() => navigate('/items/alertas-stock/actualizacion-masiva')}
            style={iconBtn} className="hover:bg-[var(--blue-10)] transition-colors"
          >
            <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
          </button>
          <p style={{ margin: 0, fontFamily: FONT, fontWeight: 700, fontSize: 14, color: 'var(--blue-100)' }}>Edición masiva de alertas de stock</p>
          <button
            type="button" aria-label="Cerrar" onClick={() => navigate('/items/alertas-stock')}
            style={iconBtn} className="hover:bg-[var(--blue-10)] transition-colors"
          >
            <X size={18} color="var(--blue-100)" strokeWidth={1.8} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 24 }}>
          <div style={{ width: 72, height: 80, borderRadius: 10, backgroundColor: 'var(--blue-20)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <FileDown size={36} color="var(--blue-100)" strokeWidth={1.5} />
          </div>
          <h2 style={{ margin: '20px 0 0', fontFamily: FONT, fontSize: 20, fontWeight: 700, color: 'var(--blue-100)' }}>
            Descarga la plantilla con tus alertas de stock
          </h2>
          <p style={{ margin: '24px 0 0', fontFamily: FONT, fontSize: 14, color: 'var(--black-100)' }}>
            Descarga y edita las alertas de stock en la plantilla de Excel
          </p>

          <button
            type="button"
            onClick={() => setModal(true)}
            style={{
              marginTop: 24, width: 'min(340px, 100%)', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
              padding: '14px 16px', borderRadius: 12, border: 'none', backgroundColor: 'var(--blue-10)', cursor: 'pointer',
            }}
            className="hover:opacity-90 transition-opacity"
          >
            <FileSpreadsheet size={22} color="var(--blue-100)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--black-100)' }}>Plantilla de alertas de stock</span>
              <span style={{ display: 'block', marginTop: 2, fontFamily: FONT, fontSize: 12, color: 'var(--black-60)' }}>
                Esta plantilla contiene tus ítems con su stock bajo y alerta, listos para ser actualizados.
              </span>
            </span>
            <Download size={20} color="var(--blue-100)" style={{ flexShrink: 0 }} />
          </button>

          {/* Solo abre el selector de archivos: no se lee, procesa ni sube nada (spec alertas-stock-disponibilidad §6). */}
          <input
            ref={archivoRef}
            type="file"
            accept=".xlsx,.xls"
            aria-label="Seleccionar plantilla actualizada"
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files?.length) toast.info('Carga de la plantilla — próximamente');
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => archivoRef.current?.click()}
            style={{ marginTop: 28, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--coral-100)' }}
          >
            Ya tengo la plantilla actualizada
          </button>
        </div>
      </div>

      {modal && <DescargarPlantillaModal onClose={() => setModal(false)} />}
    </div>
  );
}
