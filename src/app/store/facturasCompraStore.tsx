/**
 * facturasCompraStore.tsx — Store de Facturas de compra (specs/2026-10-facturas-compra.md).
 *
 * Mismo patrón que itemsStore/contactosStore: hidratación en el initializer de useState,
 * persistencia en localStorage en cada mutación, createContext + hook que lanza fuera del provider.
 * Incluye los ajustes de las "herramientas del prototipo" (§9), compartidos entre pantallas.
 * `usarImpuestos` ya no es una herramienta del prototipo: viene de Ajustes → Facturas de compra (specs/2026-10-ajustes.md §5).
 */
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { AnulacionFacturaCompra, FacturaCompra, FacturaCompraDraft, PagoFacturaCompra } from '../types/facturaCompra';
import { FACTURAS_STORAGE_KEY, USUARIO_DEMO, buildSeedFacturas } from '../data/facturasCompraSeed';
import { ahoraPrototipo, numeroFactura, siguienteNumero } from '../utils/facturasCompra';
import { sucursalPrincipal } from '../utils/ajustes';
import { useAjustes } from './ajustesStore';

const SETTINGS_KEY = 'bold-pos:compras-settings:v1';

export interface ComprasSettings {
  usarImpuestos: boolean;
  usarDS: boolean;
  stepMode: boolean;
}

const DEFAULT_SETTINGS: ComprasSettings = { usarImpuestos: false, usarDS: false, stepMode: true };

function loadFacturas(): FacturaCompra[] {
  try {
    const raw = localStorage.getItem(FACTURAS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FacturaCompra[];
  } catch {
    /* ignore */
  }
  const seed = buildSeedFacturas();
  saveFacturas(seed);
  return seed;
}

function saveFacturas(list: FacturaCompra[]): void {
  try {
    localStorage.setItem(FACTURAS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function loadSettings(): ComprasSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<ComprasSettings>) };
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

interface FacturasCompraContextValue {
  facturas: FacturaCompra[];
  getFactura: (id: string) => FacturaCompra | undefined;
  createFactura: (draft: FacturaCompraDraft) => FacturaCompra;
  reportarPago: (id: string, pago: Omit<PagoFacturaCompra, 'fecha' | 'reportadoPor'>) => void;
  anularFactura: (id: string, observacion: string) => void;
  convertirEnDS: (id: string) => string;
  /** Relee localStorage — usado por el botón "Refrescar" del listado. */
  refresh: () => void;
  settings: ComprasSettings;
  setSetting: <K extends keyof ComprasSettings>(key: K, value: ComprasSettings[K]) => void;
}

const FacturasCompraContext = createContext<FacturasCompraContextValue | null>(null);

export function FacturasCompraProvider({ children }: { children: React.ReactNode }) {
  const [facturas, setFacturas] = useState<FacturaCompra[]>(loadFacturas);
  const { ajustes, setFacturasCompra, updateAjustes } = useAjustes();
  const ajustesRef = useRef(ajustes);
  ajustesRef.current = ajustes;
  const [tools, setTools] = useState<ComprasSettings>(loadSettings);
  const settings = useMemo<ComprasSettings>(
    () => ({ ...tools, usarImpuestos: ajustes.facturasCompra.usarImpuestos }),
    [tools, ajustes.facturasCompra.usarImpuestos],
  );

  const commit = useCallback((updater: (prev: FacturaCompra[]) => FacturaCompra[]) => {
    setFacturas(prev => {
      const next = updater(prev);
      saveFacturas(next);
      return next;
    });
  }, []);

  const getFactura = useCallback((id: string) => facturas.find(f => f.id === id), [facturas]);

  const createFactura = useCallback((draft: FacturaCompraDraft): FacturaCompra => {
    let created!: FacturaCompra;
    // Ajustes → Numeración: si el usuario fijó el "siguiente número de factura de compra", se usa y luego avanza.
    const principal = sucursalPrincipal(ajustesRef.current);
    const fijado = ajustesRef.current.numeracionNoElectronica[principal.id]?.facturaCompra ?? null;
    commit(prev => {
      const numero = fijado !== null ? numeroFactura(fijado) : siguienteNumero(prev);
      created = {
        ...draft, id: `fc-${Date.now()}`, numero, fechaRegistro: ahoraPrototipo(),
        ds: null, pago: null, anulacion: null,
      };
      return [created, ...prev];
    });
    if (fijado !== null) {
      updateAjustes(prev => ({
        ...prev,
        numeracionNoElectronica: {
          ...prev.numeracionNoElectronica,
          [principal.id]: { ...prev.numeracionNoElectronica[principal.id], facturaCompra: fijado + 1 },
        },
      }));
    }
    return created;
  }, [commit, updateAjustes]);

  const reportarPago = useCallback((id: string, pago: Omit<PagoFacturaCompra, 'fecha' | 'reportadoPor'>) => {
    commit(prev => prev.map(f => (f.id === id ? { ...f, pago: { ...pago, fecha: ahoraPrototipo(), reportadoPor: USUARIO_DEMO } } : f)));
  }, [commit]);

  const anularFactura = useCallback((id: string, observacion: string) => {
    const anulacion: AnulacionFacturaCompra = { por: USUARIO_DEMO, fecha: ahoraPrototipo(), observacion };
    commit(prev => prev.map(f => (f.id === id ? { ...f, anulacion } : f)));
  }, [commit]);

  const convertirEnDS = useCallback((id: string): string => {
    const numero = `SEDS-${Math.floor(10000000 + Math.random() * 89999999)}`;
    commit(prev => prev.map(f => (f.id === id ? { ...f, ds: { numero } } : f)));
    return numero;
  }, [commit]);

  const refresh = useCallback(() => setFacturas(loadFacturas()), []);

  const setSetting = useCallback(<K extends keyof ComprasSettings>(key: K, value: ComprasSettings[K]) => {
    if (key === 'usarImpuestos') {
      setFacturasCompra({ usarImpuestos: value as boolean });
      return;
    }
    setTools(prev => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [setFacturasCompra]);

  return (
    <FacturasCompraContext.Provider value={{ facturas, getFactura, createFactura, reportarPago, anularFactura, convertirEnDS, refresh, settings, setSetting }}>
      {children}
    </FacturasCompraContext.Provider>
  );
}

export function useFacturasCompra(): FacturasCompraContextValue {
  const ctx = useContext(FacturasCompraContext);
  if (!ctx) throw new Error('useFacturasCompra debe usarse dentro de <FacturasCompraProvider>');
  return ctx;
}
