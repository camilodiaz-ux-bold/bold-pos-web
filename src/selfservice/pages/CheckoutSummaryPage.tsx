import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { useSelfServiceOrder } from '../store/selfServiceOrderStore';
import { StepProgress } from '../components/StepProgress';
import { TextField } from '../components/TextField';
import { formatCOP } from '../utils/format';

export function CheckoutSummaryPage() {
  const navigate = useNavigate();
  const { selectedPlan, businessInfo, setBusinessInfo, confirmOrder } = useSelfServiceOrder();

  // Sin plan seleccionado no hay nada que resumir — no simulamos error, volvemos al origen
  useEffect(() => {
    if (!selectedPlan) navigate('/self-service', { replace: true });
  }, [selectedPlan, navigate]);

  if (!selectedPlan) return null;

  const canContinue = businessInfo.businessName.trim().length > 0 && businessInfo.email.trim().length > 0;

  const handleConfirm = () => {
    if (!canContinue) return;
    confirmOrder();
    toast.success(`Plan ${selectedPlan.name} confirmado`);
    navigate('/self-service/confirmacion');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%', maxWidth: 860 }}>
      <StepProgress currentStep={1} />

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--blue-100)' }}>Resumen de tu plan</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 400, color: 'var(--black-60)' }}>
          Cuéntanos sobre tu negocio para dejar tu cuenta lista.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, width: '100%', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Datos del negocio ── */}
        <div style={{ flex: 2, minWidth: 320, background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(18,30,108,0.06)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--black-100)' }}>Datos del negocio</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField
              label="Nombre del negocio"
              value={businessInfo.businessName}
              onChange={v => setBusinessInfo({ ...businessInfo, businessName: v })}
              placeholder="Ej. Restaurante El Cielo"
            />
            <div style={{ display: 'flex', gap: 16 }}>
              <TextField
                label="NIT / Cédula"
                value={businessInfo.taxId}
                onChange={v => setBusinessInfo({ ...businessInfo, taxId: v })}
                placeholder="900.123.456-7"
              />
              <TextField
                label="Celular"
                value={businessInfo.phone}
                onChange={v => setBusinessInfo({ ...businessInfo, phone: v })}
                placeholder="300 123 4567"
              />
            </div>
            <TextField
              label="Correo electrónico"
              value={businessInfo.email}
              onChange={v => setBusinessInfo({ ...businessInfo, email: v })}
              placeholder="nombre@negocio.com"
              type="email"
            />
          </div>
        </div>

        {/* ── Resumen del plan ── */}
        <div style={{ flex: 1, minWidth: 280, background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(18,30,108,0.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--black-100)' }}>Plan {selectedPlan.name}</h2>
            <span style={{ background: 'var(--coral-10)', color: 'var(--coral-100)', borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
              {selectedPlan.target}
            </span>
          </div>

          <div style={{ height: 1, background: 'var(--black-10)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedPlan.features.map(feature => (
              <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Check size={14} color="var(--feedback-success-150)" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--black-100)', lineHeight: '18px' }}>{feature}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--black-10)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)' }}>Total mensual</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--black-100)' }}>{formatCOP(selectedPlan.priceMonthly)}</span>
          </div>
        </div>
      </div>

      {/* ── Acciones ── */}
      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 420 }}>
        <button
          onClick={() => navigate('/self-service')}
          style={{
            flex: 1, height: 48, borderRadius: 32,
            border: '1.5px solid var(--coral-100)', background: '#fff',
            color: 'var(--coral-100)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Atrás
        </button>
        <button
          onClick={handleConfirm}
          disabled={!canContinue}
          style={{
            flex: 1, height: 48, borderRadius: 32, border: 'none',
            backgroundColor: canContinue ? 'var(--coral-100)' : 'var(--coral-60)',
            color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: canContinue ? 'pointer' : 'not-allowed',
            opacity: canContinue ? 1 : 0.7,
          }}
        >
          Confirmar y continuar
        </button>
      </div>
    </div>
  );
}
