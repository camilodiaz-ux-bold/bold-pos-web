import React from 'react';
import { useNavigate } from 'react-router';
import { SELF_SERVICE_PLANS } from '../data/plans';
import { useSelfServiceOrder } from '../store/selfServiceOrderStore';
import { PlanCard } from '../components/PlanCard';
import { StepProgress } from '../components/StepProgress';
import { formatCOP } from '../utils/format';

export function PlanSelectionPage() {
  const navigate = useNavigate();
  const { selectedPlan, selectPlan } = useSelfServiceOrder();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%', maxWidth: 960 }}>
      <StepProgress currentStep={0} />

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--blue-100)' }}>Elige el plan para tu restaurante</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 400, color: 'var(--black-60)' }}>
          Todos los planes incluyen soporte y actualizaciones. Puedes cambiar de plan cuando quieras.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, width: '100%', flexWrap: 'wrap' }}>
        {SELF_SERVICE_PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selectedPlan?.id === plan.id}
            onSelect={() => selectPlan(plan.id)}
          />
        ))}
      </div>

      {/* Barra fija de avance — único CTA de continuar, siempre visible */}
      <div style={{
        position: 'sticky', bottom: 16, marginTop: 8,
        width: '100%', maxWidth: 640,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        background: '#fff', borderRadius: 100, padding: '10px 10px 10px 24px',
        boxShadow: '0 8px 24px rgba(18,30,108,0.12)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--black-60)' }}>
          {selectedPlan
            ? <>Plan <strong style={{ color: 'var(--black-100)' }}>{selectedPlan.name}</strong> · {formatCOP(selectedPlan.priceMonthly)}/mes</>
            : 'Selecciona un plan para continuar'}
        </span>
        <button
          onClick={() => selectedPlan && navigate('/self-service/resumen')}
          disabled={!selectedPlan}
          style={{
            height: 44, minWidth: 140, padding: '0 24px',
            borderRadius: 32, border: 'none',
            backgroundColor: selectedPlan ? 'var(--coral-100)' : 'var(--coral-60)',
            color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: selectedPlan ? 'pointer' : 'not-allowed',
            opacity: selectedPlan ? 1 : 0.7,
            transition: 'opacity 150ms, background-color 150ms',
            flexShrink: 0,
          }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
