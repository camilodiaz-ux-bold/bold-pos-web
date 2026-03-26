import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import svgPaths from '../../imports/svg-uu1cgrdgob';
import imgMockup from 'figma:asset/af1184e75b5337326c665057de04c7738af91369.png';
import { ImageWithFallback } from './figma/ImageWithFallback';

// ─── Bold gradient logo ───────────────────────────────────────────────────────

function BoldLogoGradient({ width = 90, height = 39 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 71.0066 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boldGrad" x1="71.0066" x2="-1.77164e-06" y1="15.5" y2="15.5" gradientUnits="userSpaceOnUse">
          <stop offset="0.045" stopColor="#EE424E" />
          <stop offset="0.8" stopColor="#121E6C" />
        </linearGradient>
      </defs>
      <path d={svgPaths.p26322370} fill="url(#boldGrad)" />
    </svg>
  );
}

// ─── BoldPOS label ────────────────────────────────────────────────────────────

function BoldPOSLabel() {
  return (
    <svg width="67" height="13" viewBox="0 0 53 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <clipPath id="clipBoldPos"><rect width="53" height="10" fill="white" /></clipPath>
      <g clipPath="url(#clipBoldPos)">
        <path d={svgPaths.p34f4d500} fill="#121E6C" />
        <path d={svgPaths.p39bab080} fill="#121E6C" />
        <path d={svgPaths.pac48a00} fill="#121E6C" />
        <path d={svgPaths.p1197b700} fill="#121E6C" />
        <path d={svgPaths.p25924600} fill="#121E6C" />
        <path d={svgPaths.p3af20780} fill="#121E6C" />
        <path d={svgPaths.p1c4dc500} fill="#121E6C" />
      </g>
    </svg>
  );
}

// ─── reCAPTCHA placeholder ────────────────────────────────────────────────────

function ReCaptchaWidget({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <div style={{
      border: '1px solid #D1D5DB', borderRadius: 4, padding: '12px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: '#FAFAFA',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Checkbox */}
        <button
          onClick={onToggle}
          style={{
            width: 24, height: 24, borderRadius: 4,
            border: `2px solid ${checked ? '#4A90D9' : '#9CA3AF'}`,
            backgroundColor: checked ? '#4A90D9' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          {checked && (
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <span style={{ fontSize: 14, color: '#374151', fontWeight: 400 }}>No soy un robot</span>
      </div>
      {/* reCAPTCHA logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ width: 32, height: 32 }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="#F9F9F9"/>
            <path d="M32 12C21 12 12 21 12 32C12 43 21 52 32 52C43 52 52 43 52 32C52 21 43 12 32 12Z" fill="#4A90D9"/>
            <path d="M32 20C24.3 20 18 26.3 18 34C18 37.9 19.6 41.4 22.2 43.9L25 41.1C23.1 39.2 22 36.7 22 34C22 28.5 26.5 24 32 24C37.5 24 42 28.5 42 34C42 36.7 40.9 39.2 39 41.1L41.8 43.9C44.4 41.4 46 37.9 46 34C46 26.3 39.7 20 32 20Z" fill="white"/>
            <circle cx="32" cy="34" r="5" fill="white"/>
          </svg>
        </div>
        <span style={{ fontSize: 7, color: '#9CA3AF', lineHeight: 1.2, textAlign: 'center' }}>reCAPTCHA</span>
        <span style={{ fontSize: 6, color: '#9CA3AF', lineHeight: 1.1, textAlign: 'center' }}>Privacidad · Condiciones</span>
      </div>
    </div>
  );
}

// ─── Main LoginScreen component ───────────────────────────────────────────────

interface LoginScreenProps {
  onLogin: () => void;
  onGoToSignup?: () => void;
}

export function LoginScreen({ onLogin, onGoToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);

  const canLogin = email.trim() !== '' && password.trim() !== '' && captchaChecked;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canLogin) onLogin();
  };

  // ── Merlin input style ─────────────────────────────────────────────────────
  const merlinInput: React.CSSProperties = {
    width: '100%', height: 48,
    backgroundColor: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: '0 14px',
    fontSize: 14, color: '#1E1E1E',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Montserrat', 'Inter', sans-serif",
    transition: 'border-color 0.15s',
  };
  const merlinLabel: React.CSSProperties = {
    display: 'block', marginBottom: 6,
    fontSize: 14, fontWeight: 600, color: '#121E6C',
    fontFamily: "'Montserrat', 'Inter', sans-serif",
  };
  const onFocusMerlin  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#121E6C'; };
  const onBlurMerlin   = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#E5E7EB'; };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundColor: '#F7F8FB',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: "'Montserrat', 'Inter', sans-serif",
    }}>

      {/* ── Left column: form ── */}
      <div style={{
        width: '44%', height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '0 72px',
        overflowY: 'auto',
      }}>
        {/* Header: logo + BoldPOS label */}
        <div style={{
          paddingTop: 32, marginBottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <BoldLogoGradient width={90} height={39} />
          <BoldPOSLabel />
        </div>

        {/* Form container — centered vertically */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          paddingBottom: 40,
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: 32, fontWeight: 700, color: '#0F1729',
            margin: 0, marginBottom: 32, lineHeight: 1.2,
          }}>
            Inicia sesión
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Email field */}
            <div style={{ marginBottom: 20 }}>
              <label style={merlinLabel}>
                Correo electrónico{' '}
                <span style={{ color: '#E63946' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ej: correo@gmail.com"
                style={merlinInput}
                onFocus={onFocusMerlin}
                onBlur={onBlurMerlin}
              />
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 0 }}>
              <label style={merlinLabel}>
                Contraseña{' '}
                <span style={{ color: '#E63946' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Escribe tu contraseña"
                  style={{ ...merlinInput, paddingRight: 44 }}
                  onFocus={onFocusMerlin}
                  onBlur={onBlurMerlin}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#9CA3AF', padding: 4, display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <p style={{ margin: '14px 0 20px', fontSize: 14, color: '#6B7280' }}>
              ¿Olvidaste tu contraseña?{' '}
              <button
                type="button"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#121E6C', fontSize: 14, textDecoration: 'underline', padding: 0,
                  fontFamily: "inherit",
                }}
              >
                Recupérala aquí
              </button>
            </p>

            {/* reCAPTCHA */}
            <div style={{ marginBottom: 24 }}>
              <ReCaptchaWidget checked={captchaChecked} onToggle={() => setCaptchaChecked(!captchaChecked)} />
            </div>

            {/* Login button */}
            <div style={{ marginBottom: 24 }}>
              <button
                type="submit"
                disabled={!canLogin}
                style={{
                  width: 200, height: 44,
                  borderRadius: 22,
                  border: 'none', cursor: canLogin ? 'pointer' : 'not-allowed',
                  backgroundColor: canLogin ? '#F87171' : '#FCA5A5',
                  color: '#fff',
                  fontSize: 16, fontWeight: 600,
                  fontFamily: "inherit",
                  transition: 'background-color 0.15s, opacity 0.15s',
                  opacity: canLogin ? 1 : 0.8,
                }}
                onMouseEnter={e => canLogin && ((e.target as HTMLButtonElement).style.backgroundColor = '#EF4444')}
                onMouseLeave={e => canLogin && ((e.target as HTMLButtonElement).style.backgroundColor = '#F87171')}
              >
                Iniciar sesión
              </button>
            </div>

            {/* Register link */}
            <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>
              ¿Aún no tienes cuenta Bold POS?{' '}
              <button
                type="button"
                onClick={onGoToSignup}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#121E6C', fontSize: 14, textDecoration: 'underline', padding: 0,
                  fontFamily: "inherit",
                }}
              >
                Crea tu cuenta
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* ── Right column: mockup ── */}
      <div style={{
        width: '56%', height: '100%',
        backgroundColor: '#EEF2FB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
        borderRadius: '32px 0 0 32px',
      }}>
        {/* Subtle gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(18,30,108,0.05) 0%, rgba(238,66,78,0.05) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Mockup image */}
        <div style={{ position: 'relative', width: '90%', height: '85%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ImageWithFallback
            src={imgMockup}
            alt="Bold POS en múltiples dispositivos"
            style={{
              width: '100%', height: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
              filter: 'drop-shadow(0 24px 48px rgba(18,30,108,0.20))',
            }}
          />
        </div>

        {/* Bottom tagline */}
        <div style={{
          position: 'absolute', bottom: 40,
          left: 0, right: 0, textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 14, color: '#6B7280', fontWeight: 500 }}>
            Gestiona tu restaurante desde cualquier dispositivo
          </p>
        </div>
      </div>
    </div>
  );
}