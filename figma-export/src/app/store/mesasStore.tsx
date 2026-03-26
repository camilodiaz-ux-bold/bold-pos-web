/**
 * mesasStore.tsx — Estado global compartido para configuración de mesas.
 *
 * Fuente de verdad única para layout/identidad de mesas.
 * - GestionarMesasView: lee y escribe (vía setMesasConfig al guardar)
 * - MesasView: solo lee (para obtener posiciones, formas, zonas)
 *
 * El estado OPERACIONAL (status DISPONIBLE/OCUPADA, items, timers)
 * vive exclusivamente en MesasView.
 */

import React, { createContext, useContext, useState } from 'react';

// ─── Tipos canónicos ──────────────────────────────────────────────────────────

export type MesaCategory    = 'Mesa' | 'Barra';
export type MesaShape       = 'Rectangular' | 'Redonda';
export type MesaConfigStatus = 'Activa' | 'Fuera de servicio';

/** Config completa de una mesa (layout + identidad). Sin estado operativo. */
export interface MesaConfig {
  id:          string;
  name:        string;
  zone:        string;
  capacity:    number;
  category:    MesaCategory;
  shape:       MesaShape | null;     // null ↔ Barra
  status:      MesaConfigStatus;
  rotationDeg: number;               // 0 | 90 | 180 | 270
  x:           number;
  y:           number;
  w:           number;               // ancho visual (GestionarMesasView)
  h:           number;               // alto  visual (GestionarMesasView)
}

// ─── Auto-sizing compartido ───────────────────────────────────────────────────
// Misma lógica que usaba GestionarMesasView, ahora centralizada aquí.

export function getMesaConfigDims(
  category: MesaCategory,
  shape:    MesaShape | null,
  capacity: number,
): { w: number; h: number } {
  if (category === 'Barra') return { w: Math.max(90, 28 + capacity * 20), h: 50 };
  if (shape === 'Redonda') {
    if (capacity <= 4) return { w: 80,  h: 80  };
    if (capacity <= 6) return { w: 100, h: 100 };
    if (capacity <= 8) return { w: 120, h: 120 };
    return                    { w: 140, h: 140 };
  }
  // Rectangular
  if (capacity <= 4)  return { w: 90,  h: 80  };
  if (capacity <= 6)  return { w: 120, h: 90  };
  if (capacity <= 8)  return { w: 140, h: 100 };
  if (capacity <= 12) return { w: 180, h: 110 };
  return                    { w: 200, h: 120 };
}

// ─── Helpers para construir config ────────────────────────────────────────────

const R  = (cap: number) => ({ ...getMesaConfigDims('Mesa',  'Redonda',     cap), rotationDeg: 0   });
const M  = (cap: number) => ({ ...getMesaConfigDims('Mesa',  'Rectangular', cap), rotationDeg: 0   });
const BH = (cap: number) => ({ ...getMesaConfigDims('Barra', null,          cap), rotationDeg: 0   });
const BV = (cap: number) => ({ ...getMesaConfigDims('Barra', null,          cap), rotationDeg: 90  });

// ─── Datos iniciales (única fuente de verdad) ─────────────────────────────────
//
// SALÓN  — 35 mesas  (layout tipo restaurante real con pasillos)
//   ESPERA      4 mesas  (top-left, aireado)
//   CENTRO     18 mesas  (grid 4 cols × 4 rows + 2 redondas)
//   VENTANA     8 mesas  (columna derecha con pasillo longitudinal)
//   FAMILIAR    5 mesas  (franja inferior: 4×6p + 1×12p)
// TERRAZA —  8 mesas  (redondas 4p, 2 filas aireadas)
// BARRA   —  2 barras (B01: 12p vertical, B02: 5p horizontal)

export const INITIAL_MESAS_CONFIG: MesaConfig[] = [

  // ═══════════════════════════════════════════════════════
  // SALÓN — ESPERA (top-left, espacio amplio, zona tranquila)
  // ═══════════════════════════════════════════════════════
  { id:'s01', name:'S01', zone:'Salón', capacity:2,  category:'Mesa',  shape:'Redonda',     status:'Fuera de servicio', x:60,  y:60,  ...R(2)  },
  { id:'s02', name:'S02', zone:'Salón', capacity:2,  category:'Mesa',  shape:'Redonda',     status:'Activa', x:200, y:60,  ...R(2)  },
  { id:'s03', name:'S03', zone:'Salón', capacity:4,  category:'Mesa',  shape:'Rectangular', status:'Activa', x:60,  y:225, ...M(4)  },
  { id:'s04', name:'S04', zone:'Salón', capacity:4,  category:'Mesa',  shape:'Rectangular', status:'Activa', x:235, y:225, ...M(4)  },

  // ═══════════════════════════════════════════════════════
  // SALÓN — CENTRO (grid con pasillos horizontales y verticales)
  // 4 columnas × 4 filas rect 4p + 2 redondas al final
  // Pasillos: ~70px entre columnas, ~55px entre filas
  // ═══════════════════════════════════════════════════════
  // Fila 1  (y=60)
  { id:'s05', name:'S05', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:400, y:60,  ...M(4) },
  { id:'s06', name:'S06', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:555, y:60,  ...M(4) },
  { id:'s07', name:'S07', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:710, y:60,  ...M(4) },
  { id:'s08', name:'S08', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:865, y:60,  ...M(4) },
  // Fila 2  (y=215)
  { id:'s09', name:'S09', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:400, y:215, ...M(4) },
  { id:'s10', name:'S10', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:555, y:215, ...M(4) },
  { id:'s11', name:'S11', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:710, y:215, ...M(4) },
  { id:'s12', name:'S12', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:865, y:215, ...M(4) },
  // Fila 3  (y=370)
  { id:'s13', name:'S13', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:400, y:370, ...M(4) },
  { id:'s14', name:'S14', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:555, y:370, ...M(4) },
  { id:'s15', name:'S15', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:710, y:370, ...M(4) },
  { id:'s16', name:'S16', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:865, y:370, ...M(4) },
  // Fila 4  (y=525)
  { id:'s17', name:'S17', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:400, y:525, ...M(4) },
  { id:'s18', name:'S18', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:555, y:525, ...M(4) },
  { id:'s19', name:'S19', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:710, y:525, ...M(4) },
  { id:'s22', name:'S22', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:865, y:525, ...M(4) },
  // Redondas al final del bloque centro (y=680)
  { id:'s20', name:'S20', zone:'Salón', capacity:4, category:'Mesa', shape:'Redonda', status:'Activa', x:400, y:680, ...R(4) },
  { id:'s21', name:'S21', zone:'Salón', capacity:4, category:'Mesa', shape:'Redonda', status:'Activa', x:555, y:680, ...R(4) },

  // ═══════════════════════════════════════════════════════
  // SALÓN — VENTANA / LATERAL (2 columnas, pasillo a la izquierda)
  // ═══════════════════════════════════════════════════════
  { id:'s23', name:'S23', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:1015, y:60,  ...M(4) },
  { id:'s24', name:'S24', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:1015, y:215, ...M(4) },
  { id:'s25', name:'S25', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:1015, y:370, ...M(4) },
  { id:'s26', name:'S26', zone:'Salón', capacity:6, category:'Mesa', shape:'Rectangular', status:'Activa', x:1015, y:525, ...M(6) },
  { id:'s27', name:'S27', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:1190, y:60,  ...M(4) },
  { id:'s28', name:'S28', zone:'Salón', capacity:6, category:'Mesa', shape:'Rectangular', status:'Activa', x:1190, y:215, ...M(6) },
  { id:'s29', name:'S29', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:1190, y:370, ...M(4) },
  { id:'s30', name:'S30', zone:'Salón', capacity:4, category:'Mesa', shape:'Rectangular', status:'Activa', x:1190, y:525, ...M(4) },

  // ═══════════════════════════════════════════════════════
  // SALÓN — FAMILIAR / GRUPOS (franja inferior, pasillo amplio alrededor)
  // ═══════════════════════════════════════════════════════
  { id:'s31', name:'S31', zone:'Salón', capacity:6,  category:'Mesa', shape:'Rectangular', status:'Activa', x:60,  y:810, ...M(6)  },
  { id:'s32', name:'S32', zone:'Salón', capacity:6,  category:'Mesa', shape:'Rectangular', status:'Activa', x:235, y:810, ...M(6)  },
  { id:'s33', name:'S33', zone:'Salón', capacity:6,  category:'Mesa', shape:'Rectangular', status:'Activa', x:410, y:810, ...M(6)  },
  { id:'s34', name:'S34', zone:'Salón', capacity:6,  category:'Mesa', shape:'Rectangular', status:'Activa', x:585, y:810, ...M(6)  },
  { id:'s35', name:'S35', zone:'Salón', capacity:12, category:'Mesa', shape:'Rectangular', status:'Activa', x:775, y:800, ...M(12) },

  // ═══════════════════════════════════════════════════════
  // TERRAZA — 8 mesas redondas 4p (distribución aireada, 2 filas)
  // ═══════════════════════════════════════════════════════
  { id:'t01', name:'T01', zone:'Terraza', capacity:4, category:'Mesa', shape:'Redonda', status:'Activa', x:80,  y:80,  ...R(4) },
  { id:'t02', name:'T02', zone:'Terraza', capacity:4, category:'Mesa', shape:'Redonda', status:'Activa', x:270, y:80,  ...R(4) },
  { id:'t03', name:'T03', zone:'Terraza', capacity:4, category:'Mesa', shape:'Redonda', status:'Activa', x:460, y:80,  ...R(4) },
  { id:'t04', name:'T04', zone:'Terraza', capacity:4, category:'Mesa', shape:'Redonda', status:'Activa', x:650, y:80,  ...R(4) },
  { id:'t05', name:'T05', zone:'Terraza', capacity:4, category:'Mesa', shape:'Redonda', status:'Activa', x:80,  y:290, ...R(4) },
  { id:'t06', name:'T06', zone:'Terraza', capacity:4, category:'Mesa', shape:'Redonda', status:'Activa', x:270, y:290, ...R(4) },
  { id:'t07', name:'T07', zone:'Terraza', capacity:4, category:'Mesa', shape:'Redonda', status:'Activa', x:460, y:290, ...R(4) },
  { id:'t08', name:'T08', zone:'Terraza', capacity:4, category:'Mesa', shape:'Redonda', status:'Activa', x:650, y:290, ...R(4) },

  // ═══════════════════════════════════════════════════════
  // BARRA — B01: 12p vertical (90°) | B02: 5p horizontal (0°)
  // Espacio frontal libre (pasillo) para atención
  // ═══════════════════════════════════════════════════════
  { id:'bar01', name:'B01', zone:'Barra', capacity:12, category:'Barra', shape:null, status:'Activa', x:80,  y:60,  ...BV(12) },
  { id:'bar02', name:'B02', zone:'Barra', capacity:5,  category:'Barra', shape:null, status:'Activa', x:260, y:240, ...BH(5)  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

// Zonas únicas derivadas de la config inicial (fuente de verdad)
const INITIAL_ZONES_CONFIG: string[] = [...new Set(INITIAL_MESAS_CONFIG.map(m => m.zone))];

interface MesasStoreCtx {
  mesasConfig:    MesaConfig[];
  setMesasConfig: (cfg: MesaConfig[]) => void;
  zonesConfig:    string[];
  setZonesConfig: (zones: string[]) => void;
}

const MesasStoreContext = createContext<MesasStoreCtx | null>(null);

export function MesasStoreProvider({ children }: { children: React.ReactNode }) {
  const [mesasConfig, setMesasConfig] = useState<MesaConfig[]>(INITIAL_MESAS_CONFIG);
  const [zonesConfig, setZonesConfig] = useState<string[]>(INITIAL_ZONES_CONFIG);
  return (
    <MesasStoreContext.Provider value={{ mesasConfig, setMesasConfig, zonesConfig, setZonesConfig }}>
      {children}
    </MesasStoreContext.Provider>
  );
}

export function useMesasStore(): MesasStoreCtx {
  const ctx = useContext(MesasStoreContext);
  if (!ctx) throw new Error('useMesasStore debe usarse dentro de <MesasStoreProvider>');
  return ctx;
}