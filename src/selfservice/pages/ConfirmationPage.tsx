import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { useSelfServiceOrder } from '../store/selfServiceOrderStore';
import { StepProgress } from '../components/StepProgress';
import { formatCOP } from '../utils/format';

export function ConfirmationPage() {
  const navigate = useNavigate();
  const { selectedPlan, businessInfo, confirmedAt, reset } = useSelfServiceOrder();

  useEffect(() => {
    if (!selectedPlan || !confirmedAt) navigate('/self-service', { replace: true });
  }, [selectedPlan, confirmedAt, navigate]);

  if (!selectedPlan || !confirmedAt) return null;

  const handleRestart = () => {
    reset();
    navigate('/self-service');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%', maxWidth: 480 }}>
      <StepProgress currentStep={2} />

      <div style={{ width: '100%', background: '#fff', borderRadius: 16, padding: '32px 24px', boxShadow: '0 8px 20px rgba(18,30,108,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--feedback-success-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          <CheckCircle2 size={26} color="var(--feedback-success-150)" />
        </div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--black-100)' }}>¡Tu plan {selectedPlan.name} está activo!</h1>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: 'var(--black-60)' }}>
          {new Date(confirmedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>

        <div style={{ width: '100%', borderTop: '1px dashed var(--black-10)', margin: '16px 0' }} />

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          <Row label="Negocio" value={businessInfo.businessName} />
          <Row label="Correo" value={businessInfo.email} />
          <Row label="Plan" value={selectedPlan.name} />
          <Row label="Total mensual" value={formatCOP(selectedPlan.priceMonthly)} bold />
        </div>

        <div style={{ width: '100%', borderTop: '1px dashed var(--black-10)', margin: '16px 0' }} />

        <p style={{ margin: 0, fontSize: 13, fontWeight: 400, color: 'var(--black-60)' }}>
          Te enviamos los detalles de tu suscripción a <strong style={{ color: 'var(--black-100)' }}>{businessInfo.email}</strong>.
        </p>
      </div>

      <button
        onClick={handleRestart}
        style={{
          height: 48, minWidth: 220, padding: '0 24px', borderRadius: 32,
          border: 'none', background: 'var(--coral-100)', color: '#fff',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}
      >
        Volver a elegir plan
      </button>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: bold ? 600 : 400, color: 'var(--black-60)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: 'var(--black-100)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
