import React, { useState } from 'react';
import svgPaths from '../../imports/svg-uu1cgrdgob';
import {
  Grid2X2, Users, Send, Scissors, Percent,
  MapPin, Smartphone, BarChart3, FileText, Check,
} from 'lucide-react';

// ─── Merlin design-system tokens (shared with LoginScreen) ────────────────────

const MERLIN_INPUT: React.CSSProperties = {
  width: '100%', height: 48,
  backgroundColor: '#fff',
  border: '1px solid #E5E7EB',
  borderRadius: 12,
  padding: '0 14px',
  fontSize: 14, color: '#1E1E1E',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Montserrat, Inter, sans-serif',
  transition: 'border-color 0.15s',
};

const MERLIN_LABEL: React.CSSProperties = {
  display: 'block', marginBottom: 6,
  fontSize: 14, fontWeight: 600, color: '#121E6C',
  fontFamily: 'Montserrat, Inter, sans-serif',
};

function onFocusMerlin(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = '#121E6C'; }
function onBlurMerlin(e: React.FocusEvent<HTMLInputElement>)  { e.target.style.borderColor = '#E5E7EB'; }

// ─── Bold gradient logo ───────────────────────────────────────────────────────

function BoldLogoGradient({ width = 90, height = 39 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 71.0066 31" fill="none">
      <defs>
        <linearGradient id="boldGradSignup" x1="71.0066" x2="-1.77164e-06" y1="15.5" y2="15.5" gradientUnits="userSpaceOnUse">
          <stop offset="0.045" stopColor="#EE424E" />
          <stop offset="0.8"   stopColor="#121E6C" />
        </linearGradient>
      </defs>
      <path d={svgPaths.p26322370} fill="url(#boldGradSignup)" />
    </svg>
  );
}

// ─── BoldPOS label ────────────────────────────────────────────────────────────

function BoldPOSLabel() {
  return (
    <svg width="67" height="13" viewBox="0 0 53 10" fill="none">
      <clipPath id="clipBoldPosSignup"><rect width="53" height="10" fill="white" /></clipPath>
      <g clipPath="url(#clipBoldPosSignup)">
        <path d={svgPaths.p34f4d500} fill="#121E6C" />
        <path d={svgPaths.p39bab080} fill="#121E6C" />
        <path d={svgPaths.pac48a00}  fill="#121E6C" />
        <path d={svgPaths.p1197b700} fill="#121E6C" />
        <path d={svgPaths.p25924600} fill="#121E6C" />
        <path d={svgPaths.p3af20780} fill="#121E6C" />
        <path d={svgPaths.p1c4dc500} fill="#121E6C" />
      </g>
    </svg>
  );
}

// ─── Colombia flag ────────────────────────────────────────────────────────────

function ColombiaFlag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <clipPath id="flagCircleS"><circle cx="10" cy="10" r="10" /></clipPath>
      <g clipPath="url(#flagCircleS)">
        <rect x="0" y="0"  width="20" height="10" fill="#FCD116" />
        <rect x="0" y="10" width="20" height="5"  fill="#003893" />
        <rect x="0" y="15" width="20" height="5"  fill="#CE1126" />
      </g>
    </svg>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────

interface FeatureProps { icon: React.ReactNode; label: string; sub?: string; }

function Feature({ icon, label, sub }: FeatureProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 24, height: 24, color: '#1E1E1E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 12, color: '#1E1E1E', lineHeight: '16px', fontFamily: 'Montserrat, Inter, sans-serif' }}>
          {label}
        </span>
        {sub && (
          <span style={{ fontSize: 11, color: '#606060', lineHeight: '14px', fontFamily: 'Montserrat, Inter, sans-serif', textDecoration: 'line-through' }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Reusable Merlin field ────────────────────────────────────────────────────

interface MerlinFieldProps {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

function MerlinField({ label, placeholder, type = 'text', value, onChange, required = true }: MerlinFieldProps) {
  return (
    <div style={{ flex: '1 0 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <label style={MERLIN_LABEL}>
        {label}{required && <span style={{ color: '#E63946' }}> *</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={MERLIN_INPUT}
        onFocus={onFocusMerlin}
        onBlur={onBlurMerlin}
      />
    </div>
  );
}

// ─── Feature list ─────────────────────────────────────────────────────────────

const RESTAURANT_FEATURES: FeatureProps[] = [
  { icon: <Grid2X2 size={20} />,    label: 'Hasta 25 mesas' },
  { icon: <Users size={20} />,      label: '3 Usuarios incluidos' },
  { icon: <Send size={20} />,       label: 'Comandas a cocina ilimitadas' },
  { icon: <Scissors size={20} />,   label: 'División de cuentas' },
  { icon: <Percent size={20} />,    label: 'Propinas configurables' },
  { icon: <MapPin size={20} />,     label: '3 Zonas (Salón, Terraza, Barra)' },
  { icon: <Smartphone size={20} />, label: 'App móvil para meseros' },
  { icon: <BarChart3 size={20} />,  label: 'Reportes de ventas y productos' },
  { icon: <FileText size={20} />,   label: 'Facturación electrónica ilimitada', sub: '200 facturas al mes' },
];

// ─── Main component ───────────────────────────────────────────────────────────

interface SignupScreenProps { onGoToLogin: () => void; onSignupComplete?: () => void; }

export function SignupScreen({ onGoToLogin, onSignupComplete }: SignupScreenProps) {
  const [restaurantName, setRestaurantName] = useState('');
  const [firstName, setFirstName]           = useState('');
  const [lastName, setLastName]             = useState('');
  const [phone, setPhone]                   = useState('');
  const [email, setEmail]                   = useState('');
  const [termsAccepted, setTermsAccepted]   = useState(false);
  const [submitted, setSubmitted]           = useState(false);
  const [phoneFocused, setPhoneFocused]     = useState(false);

  const canSubmit =
    restaurantName.trim() !== '' && firstName.trim() !== '' &&
    lastName.trim() !== '' && phone.trim() !== '' &&
    email.trim() !== '' && termsAccepted;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      if (onSignupComplete) {
        // Go directly to onboarding
        onSignupComplete();
      } else {
        setSubmitted(true);
        setTimeout(() => onGoToLogin(), 1800);
      }
    }
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundColor: '#F7F8FB',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: 'Montserrat, Inter, sans-serif',
    }}>

      {/* ════════════════════ Left column: form ════════════════════ */}
      <div style={{
        width: '56%', height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '0 72px',
        overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{
          paddingTop: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <BoldLogoGradient width={90} height={39} />
          <BoldPOSLabel />
        </div>

        {/* Form — centered vertically */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          paddingBottom: 40, paddingTop: 16,
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0F1729', margin: '0 0 8px', lineHeight: 1.2 }}>
            Crea tu cuenta
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#6B7280', fontWeight: 400 }}>
            POS Restaurantes gratis 15 días
          </p>

          {/* ── Success ── */}
          {submitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                backgroundColor: '#ECFDF5', border: '3px solid #6EE7B7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={28} color="#10B981" />
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1E1E1E', textAlign: 'center', margin: 0 }}>
                ¡Cuenta creada exitosamente!
              </p>
              <p style={{ fontSize: 14, color: '#606060', textAlign: 'center', margin: 0 }}>
                Redirigiendo al inicio de sesión…
              </p>
            </div>

          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* ── Nombre del restaurante ── */}
              <div style={{ marginBottom: 20 }}>
                <label style={MERLIN_LABEL}>
                  Nombre del restaurante <span style={{ color: '#E63946' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nombre del restaurante"
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  style={MERLIN_INPUT}
                  onFocus={onFocusMerlin}
                  onBlur={onBlurMerlin}
                />
              </div>

              {/* ── Nombres · Apellidos ── */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <MerlinField label="Nombres"   placeholder="Nombres"   value={firstName} onChange={setFirstName} />
                <MerlinField label="Apellidos" placeholder="Apellidos" value={lastName}  onChange={setLastName}  />
              </div>

              {/* ── Teléfono · Correo ── */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>

                {/* Teléfono celular — flag + prefix integrated inside Merlin box */}
                <div style={{ flex: '1 0 0', minWidth: 0 }}>
                  <label style={MERLIN_LABEL}>
                    Teléfono celular <span style={{ color: '#E63946' }}>*</span>
                  </label>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    height: 48,
                    backgroundColor: '#fff',
                    border: `1px solid ${phoneFocused ? '#121E6C' : '#E5E7EB'}`,
                    borderRadius: 12,
                    overflow: 'hidden',
                    transition: 'border-color 0.15s',
                    boxSizing: 'border-box',
                  }}>
                    {/* Country code pill */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '0 12px',
                      borderRight: '1px solid #E5E7EB',
                      height: '100%', flexShrink: 0,
                    }}>
                      <ColombiaFlag size={20} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#1E1E1E', fontFamily: 'Montserrat, Inter, sans-serif', whiteSpace: 'nowrap' }}>
                        +57
                      </span>
                    </div>
                    {/* Number input — no own border, inherits from wrapper */}
                    <input
                      type="tel"
                      placeholder="Número de celular"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onFocus={() => setPhoneFocused(true)}
                      onBlur={() => setPhoneFocused(false)}
                      style={{
                        flex: 1, height: '100%',
                        border: 'none', outline: 'none',
                        backgroundColor: 'transparent',
                        fontSize: 14, color: '#1E1E1E',
                        padding: '0 12px',
                        fontFamily: 'Montserrat, Inter, sans-serif',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Correo electrónico */}
                <MerlinField
                  label="Correo electrónico"
                  placeholder="Correo"
                  type="email"
                  value={email}
                  onChange={setEmail}
                />
              </div>

              {/* ── Términos y condiciones ── */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <button
                  type="button"
                  onClick={() => setTermsAccepted(v => !v)}
                  style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${termsAccepted ? '#121E6C' : '#9CA3AF'}`,
                    backgroundColor: termsAccepted ? '#121E6C' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                    marginRight: 10,
                  }}
                >
                  {termsAccepted && (
                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                      <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span style={{ fontSize: 14, color: '#374151', fontWeight: 400, fontFamily: 'Montserrat, Inter, sans-serif' }}>
                  Aceptar términos y condiciones{'  '}
                  <button
                    type="button"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 14, fontWeight: 600, color: '#121E6C',
                      textDecoration: 'underline', padding: 0, fontFamily: 'inherit',
                    }}
                  >
                    Ver documento
                  </button>
                </span>
              </div>

              {/* ── Crear cuenta ── */}
              <div style={{ marginBottom: 24 }}>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    width: 200, height: 44,
                    borderRadius: 22, border: 'none',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    backgroundColor: canSubmit ? '#F87171' : '#FCA5A5',
                    color: '#fff', fontSize: 16, fontWeight: 600,
                    fontFamily: 'Montserrat, Inter, sans-serif',
                    transition: 'background-color 0.15s, opacity 0.15s',
                    opacity: canSubmit ? 1 : 0.8,
                  }}
                  onMouseEnter={e => canSubmit && ((e.target as HTMLButtonElement).style.backgroundColor = '#EF4444')}
                  onMouseLeave={e => canSubmit && ((e.target as HTMLButtonElement).style.backgroundColor = '#F87171')}
                >
                  Crear cuenta
                </button>
              </div>

              {/* ── Ya tienes cuenta ── */}
              <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>
                ¿Ya tienes cuenta Bold POS?{' '}
                <button
                  type="button"
                  onClick={onGoToLogin}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 400, color: '#121E6C',
                    textDecoration: 'underline', padding: 0, fontFamily: 'inherit',
                  }}
                >
                  Inicia sesión
                </button>
              </p>

            </form>
          )}
        </div>
      </div>

      {/* ════════════════════ Right column: plan card ════════════════════ */}
      <div style={{
        width: '44%', height: '100%',
        backgroundColor: '#F7F8FB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 40px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: 24,
          padding: 52,
          width: '100%', maxWidth: 436,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: 28,
          boxSizing: 'border-box',
        }}>

          {/* Badge + trial */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'linear-gradient(-90deg, #EE424E 4.5%, #121E6C 80%)',
              borderRadius: 8, padding: '4px 10px', alignSelf: 'flex-start',
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5L9.545 5.77L14.02 6.1L10.68 9.03L11.78 13.38L8 11.02L4.22 13.38L5.32 9.03L1.98 6.1L6.455 5.77L8 1.5Z" fill="white" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Montserrat, Inter, sans-serif' }}>
                POS Restaurantes
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 16, color: '#606060', fontFamily: 'Montserrat, Inter, sans-serif' }}>
              Prueba gratis por 15 días
            </p>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            <span style={{ fontSize: 44, fontWeight: 400, color: '#1E1E1E', lineHeight: '60px', fontFamily: 'Montserrat, Inter, sans-serif' }}>
              $890.000
            </span>
            <span style={{ fontSize: 12, color: '#1E1E1E', lineHeight: '16px', marginBottom: 10, fontFamily: 'Montserrat, Inter, sans-serif' }}>
              /año
            </span>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {RESTAURANT_FEATURES.map((f, i) => (
              <Feature key={i} {...f} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}