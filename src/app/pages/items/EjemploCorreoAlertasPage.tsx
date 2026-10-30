/**
 * EjemploCorreoAlertasPage — "Ejemplo de correo" de Alertas de Stock (specs/2026-10-alertas-stock-correo.md): referencia visual
 * para quien maqueta el correo. No se envía ni se guarda nada; los datos son de muestra (data/alertasCorreoEjemplo.ts).
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useCatalog, useVertical } from '../../vertical';
import {
  CORREO_MAX_FILAS, CORREO_TOTAL_ALERTAS, filasCorreoEjemplo, type CasoAlerta,
} from '../../data/alertasCorreoEjemplo';
import { formatExistencia } from '../../utils/format';

const FONT = "'Montserrat', sans-serif";

/** Color del número que falta para el mínimo: rojo (negativa, agotado), coral (por debajo) y ámbar (en el mínimo). */
const CASO_COLOR: Record<CasoAlerta, string> = {
  negativa: 'var(--coral-100)',
  agotado: 'var(--coral-100)',
  debajo: 'var(--coral-100)',
  minimo: 'var(--feedback-warning-150)',
};

/** Banner corporativo pendiente: marcador del diseño corporativo (arriba y al pie del correo). */
function BannerCorporativo() {
  return (
    <div
      role="img"
      aria-label="Banner corporativo pendiente"
      style={{ backgroundColor: 'var(--blue-100)', padding: '28px 24px', textAlign: 'center', fontFamily: FONT }}
    >
      <p style={{ margin: 0, fontSize: 32, fontWeight: 700, lineHeight: '40px', color: 'var(--black-0)' }}>Bold POS</p>
      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Pendiente diseño corporativo</p>
    </div>
  );
}

export function EjemploCorreoAlertasPage() {
  const navigate = useNavigate();
  const { allProducts } = useCatalog();
  const { config } = useVertical();
  const comercio = config.businessName;
  const filas = useMemo(() => filasCorreoEjemplo(allProducts), [allProducts]);
  const restantes = CORREO_TOTAL_ALERTAS - Math.min(CORREO_MAX_FILAS, filas.length);
  const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  const asunto = `Tienes ${CORREO_TOTAL_ALERTAS} ítems con alerta de stock bajo`;

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Franja: es solo una referencia */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button" aria-label="Volver" onClick={() => navigate('/items/alertas-stock')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8,
            border: '1px solid var(--blue-20)', backgroundColor: '#fff', cursor: 'pointer', flexShrink: 0,
          }}
          className="hover:bg-[var(--blue-10)] transition-colors"
        >
          <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
        </button>
        <p style={{ margin: 0, fontFamily: FONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)' }}>
          Ejemplo de correo
        </p>
        <span style={{ padding: '3px 12px', borderRadius: 999, backgroundColor: 'var(--blue-20)', color: 'var(--blue-100)', fontFamily: FONT, fontSize: 12, fontWeight: 700 }}>
          Solo referencia
        </span>
        <span style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-60)' }}>No se envía ningún correo.</span>
      </div>

      {/* Marco de bandeja de correo */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px 24px 32px' }}>
        <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 22, fontWeight: 700, color: 'var(--black-100)' }}>{asunto}</h1>
        <div style={{ margin: '12px 0 24px', paddingBottom: 16, borderBottom: '1px solid var(--black-10)', fontFamily: FONT, fontSize: 13, color: 'var(--black-60)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span><strong style={{ color: 'var(--black-100)' }}>De:</strong> Bold POS</span>
          <span><strong style={{ color: 'var(--black-100)' }}>Para:</strong> {comercio}</span>
          <span><strong style={{ color: 'var(--black-100)' }}>Fecha:</strong> {fecha}</span>
        </div>

        {/* Cuerpo del correo */}
        <div style={{ maxWidth: 600, margin: '0 auto', border: '1px solid var(--black-10)', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' }}>
          <BannerCorporativo />
          <div style={{ padding: '32px 32px 28px', fontFamily: FONT, color: 'var(--black-100)' }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hola, {comercio}:</p>
            <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: '22px' }}>
              Algunos de tus ítems llegaron a su <strong>stock bajo</strong>: la existencia mínima que definiste para cada uno.
              Te avisamos para que puedas reabastecerlos a tiempo y no perder ventas.
            </p>

            <h2 style={{ margin: '28px 0 12px', fontSize: 15, fontWeight: 700 }}>Los {Math.min(CORREO_MAX_FILAS, filas.length)} ítems más críticos</h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filas.map((f, i) => {
                return (
                  <div key={i} style={{ padding: '12px 0', borderTop: '1px solid var(--black-10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{f.nombre}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--black-60)' }}>{f.sucursal}</p>
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--black-60)' }}>
                        Existencia <strong style={{ color: f.existencia <= 0 ? 'var(--coral-100)' : 'var(--black-100)' }}>{formatExistencia(f.existencia)}</strong>
                        {' · '}Stock bajo <strong style={{ color: 'var(--black-100)' }}>{formatExistencia(f.stockBajo)}</strong>
                      </p>
                    </div>
                    {/* Unidades que faltan para completar el mínimo */}
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, lineHeight: '32px', color: CASO_COLOR[f.caso], fontVariantNumeric: 'tabular-nums' }}>
                        {formatExistencia(f.faltan)}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--black-60)' }}>para el mínimo</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {restantes > 0 && (
              <p style={{ margin: '16px 0 0', paddingTop: 16, borderTop: '1px solid var(--black-10)', fontSize: 14 }}>
                Tienes <strong>{restantes} ítems más</strong> en alerta.
              </p>
            )}

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button type="button" className="btn btn-primary" onClick={() => navigate('/items/alertas-stock')}>
                Ver todas las alertas
              </button>
            </div>

            <p style={{ margin: '28px 0 0', fontSize: 12, lineHeight: '18px', color: 'var(--black-60)' }}>
              Recibes este correo porque tienes alertas de stock bajo activas. Puedes cambiar el stock bajo de cada ítem o desactivar la alerta
              desde Items → Alertas de Stock.
            </p>
          </div>

          <BannerCorporativo />
        </div>
      </div>
    </div>
  );
}
