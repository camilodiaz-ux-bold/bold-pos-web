/**
 * RootLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared layout for all pages:
 *  - Auth screens (Login / Signup / Onboarding)
 *  - Logout modal
 *  - BoldTopBar + BoldNavBar
 *  - <Outlet /> for page content
 *  - QA badge
 *
 * Navigation between pages is handled here via useNavigate:
 *   'Reportes' → /reportes
 *   'Mesas' | 'Mostrador' → /
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { BoldNavBar, BoldTopBar } from './BoldNavBar';
import { MesasStoreProvider } from '../store/mesasStore';
import { FavoritesProvider } from '../store/favoritesStore';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';
import { OnboardingFlow } from './OnboardingFlow';

// ─── Outlet context type (consumed by child pages) ───────────────────────────

export type RootOutletContext = {
  subMode: 'Mesas' | 'Mostrador';
};

// ─── App-wide mode type ───────────────────────────────────────────────────────

type AppMode = 'Mesas' | 'Mostrador' | 'Reportes' | 'Inicio' | 'Turnos';

// ─── Component ───────────────────────────────────────────────────────────────

export function RootLayout() {
  // The sub-mode toggled within the Home page (Mesas ↔ Mostrador)
  const [subMode, setSubMode] = useState<'Mesas' | 'Mostrador'>('Mesas');

  // Auth state
  const [isLoggedIn, setIsLoggedIn]         = useState(true);
  const [authScreen, setAuthScreen]         = useState<'login' | 'signup'>('login');
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();

  // Derive activeMode from current URL
  const activeMode: AppMode =
    location.pathname.startsWith('/reportes') ? 'Reportes' :
    location.pathname === '/inicio'            ? 'Inicio'   :
    location.pathname === '/turnos'            ? 'Turnos'   : subMode;

  const handleModeChange = (mode: AppMode) => {
    if (mode === 'Reportes') {
      navigate('/reportes');
    } else if (mode === 'Inicio') {
      navigate('/inicio');
    } else if (mode === 'Turnos') {
      navigate('/turnos');
    } else {
      setSubMode(mode);
      if (location.pathname !== '/') navigate('/');
    }
  };

  const handleLogoutRequest = () => setShowLogoutModal(true);
  const handleLogoutConfirm = () => { setShowLogoutModal(false); setIsLoggedIn(false); };

  // ── Auth: Login / Signup ─────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <FavoritesProvider>
      <MesasStoreProvider>
        <Toaster position="top-center" richColors />
        {authScreen === 'login' ? (
          <LoginScreen
            onLogin={() => setIsLoggedIn(true)}
            onGoToSignup={() => setAuthScreen('signup')}
          />
        ) : (
          <SignupScreen
            onGoToLogin={() => setAuthScreen('login')}
            onSignupComplete={() => { setIsLoggedIn(true); setOnboardingDone(false); }}
          />
        )}
      </MesasStoreProvider>
      </FavoritesProvider>
    );
  }

  // ── Auth: Onboarding ─────────────────────────────────────────────────────
  if (!onboardingDone) {
    return (
      <FavoritesProvider>
      <MesasStoreProvider>
        <Toaster position="top-center" richColors />
        <OnboardingFlow onComplete={() => setOnboardingDone(true)} />
      </MesasStoreProvider>
      </FavoritesProvider>
    );
  }

  // ── Main app shell ───────────────────────────────────────────────────────
  return (
    <FavoritesProvider>
    <MesasStoreProvider>
    <div className="flex flex-col h-screen w-full bg-[var(--blue-10)] overflow-hidden ">
      <Toaster position="top-center" richColors />

      {/* ════════════════════════════════════════════════════
          Modal: Cerrar sesión / Turno abierto
          ════════════════════════════════════════════════════ */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div style={{
            backgroundColor: '#fff', borderRadius: 24, padding: 40,
            width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          }}>
            {/* Alert icon */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              backgroundColor: '#FCD34D',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24, flexShrink: 0,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v5M12 16.5v.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black-100)', textAlign: 'center', margin: 0, marginBottom: 12 }}>
              Actualmente tienes un turno abierto
            </h2>
            <p style={{ fontSize: 16, color: "var(--black-60)", textAlign: 'center', margin: 0, marginBottom: 32 }}>
              ¿Deseas cerrar sesión?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              <button
                onClick={handleLogoutConfirm}
                style={{
                  width: '100%', height: 52, borderRadius: 26,
                  border: '2px solid var(--coral-100)', background: 'transparent',
                  color: 'var(--coral-100)', fontSize: 16, fontWeight: 600, cursor: 'pointer',
                }}
                onMouseEnter={e => ((e.target as HTMLButtonElement).style.backgroundColor = 'rgba(230,57,70,0.06)')}
                onMouseLeave={e => ((e.target as HTMLButtonElement).style.backgroundColor = 'transparent')}
              >
                Cerrar turno
              </button>
              <button
                onClick={handleLogoutConfirm}
                style={{
                  width: '100%', height: 52, borderRadius: 26,
                  border: 'none', background: 'var(--coral-100)',
                  color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(230,57,70,0.35)',
                }}
                onMouseEnter={e => ((e.target as HTMLButtonElement).style.backgroundColor = '#D03040')}
                onMouseLeave={e => ((e.target as HTMLButtonElement).style.backgroundColor = 'var(--coral-100)')}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TopBar ── */}
      <BoldTopBar
        activeMode={activeMode}
        onModeChange={handleModeChange}
        onLogoutRequest={handleLogoutRequest}
      />

      {/* ── Body: NavBar + page content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', paddingTop: 8, paddingLeft: 8, paddingBottom: 8, gap: 8 }}>
        <BoldNavBar activeMode={activeMode} onModeChange={handleModeChange} />

        {/* Main content column — pages render inside here */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Outlet context={{ subMode } as RootOutletContext} />
        </div>
      </div>

      {/* QA badge */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
        <div className="bg-[var(--blue-100)] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
          <CheckCircle size={14} /> QA – Bold POS v1
        </div>
      </div>

    </div>
    </MesasStoreProvider>
    </FavoritesProvider>
  );
}