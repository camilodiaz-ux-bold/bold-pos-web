/**
 * RevisarCargaModal — modal "Revisa la carga de tu plantilla" de la Actualización masiva de Alertas Stock mínimo
 * (specs/2026-11-stock-minimo.md §3, EPIC 4). Solo ejemplo: el archivo no se lee; los resultados son muestras fijas y
 * "Continuar" no modifica ningún dato.
 */
import React from 'react';

export interface ResultadoCarga {
  correctos: number;
  /** Los primeros errores (se muestran hasta 3). `fila` es el número de fila del Excel. */
  errores: { fila: number; motivo: string }[];
  /** Total de filas con error; puede ser mayor que `errores.length`. */
  totalErrores: number;
}

const FONT = "'Montserrat', sans-serif";

/** Muestras que se alternan en cada carga para poder ver los tres estados (con errores, todo correcto, sin correctos). */
export const MUESTRAS_CARGA: ResultadoCarga[] = [
  {
    correctos: 18,
    totalErrores: 5,
    errores: [
      { fila: 4, motivo: 'Código y sucursal no encontrados' },
      { fila: 9, motivo: 'El stock mínimo debe ser un número entero mayor o igual a 0' },
      { fila: 12, motivo: 'La alerta debe ser Sí o No' },
    ],
  },
  { correctos: 24, totalErrores: 0, errores: [] },
  {
    correctos: 0,
    totalErrores: 4,
    errores: [
      { fila: 2, motivo: 'La alerta debe ser Sí o No' },
      { fila: 3, motivo: 'La alerta debe ser Sí o No' },
      { fila: 4, motivo: 'Código y sucursal no encontrados' },
    ],
  },
];

interface Props {
  resultado: ResultadoCarga;
  onCancel: () => void;
  onContinue: () => void;
}

export function RevisarCargaModal({ resultado, onCancel, onContinue }: Props) {
  const { correctos, errores, totalErrores } = resultado;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Revisa la carga de tu plantilla">
      <div className="bg-white rounded-[var(--radius-20)] w-full mx-4" style={{ maxWidth: 480, padding: 32, boxSizing: 'border-box', fontFamily: FONT }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--black-100)', margin: '0 0 16px' }}>Revisa la carga de tu plantilla</h3>

        <p style={{ margin: 0, fontSize: 14, color: 'var(--black-100)' }}>
          <strong>{correctos}</strong> registros correctos
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: totalErrores > 0 ? 'var(--coral-100)' : 'var(--black-100)' }}>
          <strong>{totalErrores}</strong> registros con error
        </p>

        {errores.length > 0 && (
          <ul style={{ margin: '12px 0 0', padding: '10px 12px 10px 28px', borderRadius: 8, backgroundColor: 'var(--blue-10)', fontSize: 12, lineHeight: '18px', color: 'var(--black-100)' }}>
            {errores.slice(0, 3).map(e => (
              <li key={e.fila}>Fila {e.fila}: {e.motivo}</li>
            ))}
          </ul>
        )}

        <p style={{ margin: '16px 0 24px', fontSize: 14, color: 'var(--black-60)' }}>
          ¿Estás seguro de continuar? Solo se actualizarán los registros correctos.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={onCancel} className="btn btn-cancel" style={{ flex: 1 }}>Cancelar</button>
          <button type="button" onClick={onContinue} className="btn btn-primary" style={{ flex: 1 }} disabled={correctos === 0}>Continuar</button>
        </div>
      </div>
    </div>
  );
}
