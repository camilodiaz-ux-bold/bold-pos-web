import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Toaster } from 'sonner';
import { X } from 'lucide-react';
import { SelfServiceOrderProvider } from '../store/selfServiceOrderStore';

/**
 * Layout mínimo de Self Service — deliberadamente aislado de RootLayout:
 * sin sidebar/topbar administrativo ni providers de Restaurantes
 * (FavoritesProvider/MesasStoreProvider/NotificationsProvider/AsyncReportsProvider).
 * Monta su propio Toaster porque no es descendiente del RootLayout de Restaurantes.
 */
export function SelfServiceLayout() {
  const navigate = useNavigate();

  return (
    <SelfServiceOrderProvider>
      <Toaster position="top-center" richColors />
      <div style={{ minHeight: '100vh', width: '100%', background: 'var(--background-page)', fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, padding: '0 24px', background: '#fff', borderBottom: '1px solid var(--black-10)' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--blue-100)' }}>
            Bold <span style={{ color: 'var(--coral-100)' }}>POS</span>
          </span>
          <button
            onClick={() => navigate('/')}
            aria-label="Salir"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--black-60)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px 64px' }}>
          <Outlet />
        </div>
      </div>
    </SelfServiceOrderProvider>
  );
}
