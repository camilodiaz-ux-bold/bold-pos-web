import React from 'react';
import { Check } from 'lucide-react';
import type { SelfServicePlan } from '../types';
import { formatCOP } from '../utils/format';

/**
 * Tarjeta de plan — patrón de selección tomado de SelectionCard
 * (src/app/components/OnboardingFlow.tsx): borde coral 2px + check circle
 * cuando está seleccionada. Toda la tarjeta es el target de click, sin
 * botón "Seleccionar" propio — el CTA de avance vive en la barra inferior
 * fija de la página (ver PlanSelectionPage), para tener un solo lugar de
 * decisión de "continuar" en vez del botón de doble función del prototipo.
 */
export function PlanCard({
  plan, selected, onSelect,
}: {
  plan: SelfServicePlan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        flex: 1,
        minWidth: 240,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        border: `2px solid ${selected ? 'var(--coral-100)' : 'transparent'}`,
        borderRadius: 16,
        padding: 24,
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        boxShadow: selected ? '0 0 0 1px rgba(255,41,71,0.1)' : '0 2px 8px rgba(18,30,108,0.06)',
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--coral-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={13} color="#fff" strokeWidth={3} />
        </div>
      )}

      {plan.recommended && (
        <span style={{
          alignSelf: 'flex-start', marginBottom: 12,
          background: 'var(--coral-10)', color: 'var(--coral-100)',
          borderRadius: 100, padding: '4px 12px',
          fontSize: 12, fontWeight: 600, lineHeight: '16px',
        }}>
          Recomendado
        </span>
      )}

      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--blue-100)' }}>{plan.name}</h3>
      <p style={{ margin: '4px 0 16px', fontSize: 13, fontWeight: 400, color: 'var(--black-60)' }}>{plan.target}</p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--black-100)' }}>{formatCOP(plan.priceMonthly)}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--black-60)' }}>/mes</span>
      </div>

      <div style={{ height: 1, background: 'var(--black-10)', marginBottom: 16 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plan.features.map(feature => (
          <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Check size={15} color="var(--feedback-success-150)" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--black-100)', lineHeight: '18px' }}>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
