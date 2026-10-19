/**
 * contactosStore.tsx — Store de Contactos: clientes y proveedores (specs/2026-10-proveedores.md y 2026-10-clientes.md).
 *
 * Mismo patrón que itemsStore.tsx: hidratación en el initializer de useState,
 * persistencia en localStorage en cada mutación, createContext<T|null>(null) +
 * hook que lanza Error fuera del provider. Los contactos son core (iguales en
 * ambas verticales), por eso el provider vive en App.tsx y no depende de la vertical.
 */
import React, { createContext, useCallback, useContext, useState } from 'react';
import type { Contacto, ContactoDraft } from '../types/contacto';
import { CONTACTOS_STORAGE_KEY, buildSeedContactos } from '../data/contactosSeed';

function save(list: Contacto[]): void {
  try {
    localStorage.setItem(CONTACTOS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function load(): Contacto[] {
  try {
    const raw = localStorage.getItem(CONTACTOS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Contacto[];
  } catch {
    /* ignore */
  }
  const seed = buildSeedContactos();
  save(seed);
  return seed;
}

interface ContactosContextValue {
  contactos: Contacto[];
  getContacto: (id: string) => Contacto | undefined;
  createContacto: (draft: ContactoDraft) => Contacto;
  updateContacto: (id: string, draft: ContactoDraft) => void;
  deleteContacto: (id: string) => void;
  toggleActivo: (id: string) => void;
  /** Relee localStorage — usado por el botón "Refrescar" del listado. */
  refresh: () => void;
}

const ContactosContext = createContext<ContactosContextValue | null>(null);

export function ContactosProvider({ children }: { children: React.ReactNode }) {
  const [contactos, setContactoes] = useState<Contacto[]>(load);

  const commit = useCallback((updater: (prev: Contacto[]) => Contacto[]) => {
    setContactoes(prev => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  const getContacto = useCallback((id: string) => contactos.find(p => p.id === id), [contactos]);

  const createContacto = useCallback((draft: ContactoDraft): Contacto => {
    const nuevo: Contacto = { ...draft, id: `ctc-${Date.now()}`, comprasUltimos6Meses: 0, cuentasPorPagar: 0 };
    commit(prev => [nuevo, ...prev]);
    return nuevo;
  }, [commit]);

  const updateContacto = useCallback((id: string, draft: ContactoDraft) => {
    commit(prev => prev.map(p => (p.id === id ? { ...p, ...draft } : p)));
  }, [commit]);

  const deleteContacto = useCallback((id: string) => {
    commit(prev => prev.filter(p => p.id !== id));
  }, [commit]);

  const toggleActivo = useCallback((id: string) => {
    commit(prev => prev.map(p => (p.id === id ? { ...p, activo: !p.activo } : p)));
  }, [commit]);

  const refresh = useCallback(() => setContactoes(load()), []);

  return (
    <ContactosContext.Provider value={{ contactos, getContacto, createContacto, updateContacto, deleteContacto, toggleActivo, refresh }}>
      {children}
    </ContactosContext.Provider>
  );
}

export function useContactos(): ContactosContextValue {
  const ctx = useContext(ContactosContext);
  if (!ctx) throw new Error('useContactos debe usarse dentro de <ContactosProvider>');
  return ctx;
}
