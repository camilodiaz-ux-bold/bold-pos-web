/**
 * ActualizacionMasivaAlertasPage — "Edición masiva de ítems", réplica visual de
 * `/#/retail/inventory/item/bulk-update` del POS real (specs/2026-10-alertas-stock.md §4).
 * "Iniciar edición masiva" lleva al paso de descarga de la plantilla (PlantillaAlertasPage).
 */
import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Download, FileText, FileUp } from 'lucide-react';

const FONT = "'Montserrat', sans-serif";

function Paso({ icono, titulo, texto }: { icono: React.ReactNode; titulo: string; texto: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 260 }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}>{icono}</div>
      <div>
        <p style={{ margin: 0, fontFamily: FONT, fontSize: 14, fontWeight: 700, color: 'var(--black-100)' }}>{titulo}</p>
        <p style={{ margin: '4px 0 0', fontFamily: FONT, fontSize: 13, color: 'var(--black-60)' }}>{texto}</p>
      </div>
    </div>
  );
}

export function ActualizacionMasivaAlertasPage() {
  const navigate = useNavigate();
  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button" onClick={() => navigate('/items/alertas-stock')} aria-label="Volver"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8,
            border: '1px solid var(--blue-20)', backgroundColor: '#fff', cursor: 'pointer', flexShrink: 0,
          }}
          className="hover:bg-[var(--blue-10)] transition-colors"
        >
          <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
        </button>
        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--blue-100)', margin: 0 }}>
          Edición masiva de ítems
        </p>
      </div>

      {/* Banner */}
      <div
        style={{
          borderRadius: 20, padding: '40px 48px', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
          background: 'linear-gradient(90deg, var(--blue-100) 0%, var(--coral-100) 100%)',
        }}
      >
        <div
          style={{
            width: 96, height: 112, borderRadius: 12, backgroundColor: 'var(--blue-20)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}
        >
          <FileText size={52} color="var(--blue-100)" strokeWidth={1.5} />
          <span
            style={{
              position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%',
              backgroundColor: 'var(--coral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid var(--blue-20)',
            }}
          >
            <FileUp size={20} color="var(--black-0)" />
          </span>
        </div>
        <div style={{ minWidth: 260, flex: 1 }}>
          <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)', color: 'var(--black-0)', fontFamily: FONT, fontSize: 12, fontWeight: 600 }}>
            Ítems
          </span>
          <h2 style={{ margin: '12px 0 0', fontFamily: FONT, fontSize: 28, fontWeight: 700, lineHeight: '36px', color: 'var(--black-0)' }}>
            Edita de forma masiva las alertas de stock de tus ítems
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ margin: 0, fontFamily: FONT, fontSize: 14, fontWeight: 700, color: 'var(--black-60)' }}>
          Edita tus ítems de forma masiva en 2 pasos
        </h3>
        <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <Paso
            icono={<Download size={22} color="var(--blue-100)" />}
            titulo="Descarga la plantilla y edita tus ítems"
            texto="Edita los ítems en la plantilla de Excel."
          />
          <Paso
            icono={<FileText size={22} color="var(--blue-100)" />}
            titulo="Carga la plantilla"
            texto="Sube tu archivo de plantilla Excel con los ítems editados."
          />
        </div>
      </div>

      <div>
        <button className="btn btn-primary" onClick={() => navigate('/items/alertas-stock/actualizacion-masiva/plantilla')}>
          Iniciar edición masiva
        </button>
      </div>
    </div>
  );
}
