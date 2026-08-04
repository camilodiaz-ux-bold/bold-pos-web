/**
 * notificationsStore.tsx — Centro de notificaciones genérico de la app.
 *
 * No está acoplado a ninguna feature: cualquier parte de la app puede hacer
 * push() de una notificación (éxito o error) que aparecerá en la campana
 * del TopBar. Hoy la alimenta asyncReportsStore, pero está pensado para
 * reutilizarse con futuros eventos del sistema.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AppNotification {
  id:        string;
  title:     string;
  message:   string;
  timestamp: number;
  read:      boolean;
  kind:      'success' | 'error';
  action?:     { label: string; onClick: () => void };
  onRowClick?: () => void;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount:   number;
  push:          (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markRead:      (id: string) => void;
  markAllRead:   () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const push = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [
      { ...n, id: crypto.randomUUID(), timestamp: Date.now(), read: false },
      ...prev,
    ]);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, push, markRead, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>');
  return ctx;
}
