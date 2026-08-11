import React from 'react';

const STEPS = ['Elige tu plan', 'Resumen', 'Confirmación'];

/**
 * Barra de progreso segmentada — mismo patrón visual que el stepper de
 * OnboardingFlow (segmentos pill rellenos en --coral-100 sobre --black-10),
 * simplificado a 3 pasos fijos sin sub-pasos.
 */
export function StepProgress({ currentStep }: { currentStep: 0 | 1 | 2 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 480 }}>
      <div style={{ display: 'flex', gap: 6, width: '100%' }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 100,
              backgroundColor: 'var(--black-10)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: i <= currentStep ? '100%' : '0%',
                backgroundColor: 'var(--coral-100)',
                borderRadius: 100,
                transition: 'width 250ms ease-out',
              }}
            />
          </div>
        ))}
      </div>
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--black-60)' }}>
        Paso {currentStep + 1} de {STEPS.length} · {STEPS[currentStep]}
      </span>
    </div>
  );
}
