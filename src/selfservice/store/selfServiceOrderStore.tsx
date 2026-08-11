import React, { createContext, useContext, useMemo, useState } from 'react';
import { SELF_SERVICE_PLANS } from '../data/plans';
import { EMPTY_BUSINESS_INFO } from '../types';
import type { SelfServiceBusinessInfo, SelfServicePlan } from '../types';

interface SelfServiceOrderContextValue {
  selectedPlan: SelfServicePlan | null;
  selectPlan: (planId: string) => void;
  businessInfo: SelfServiceBusinessInfo;
  setBusinessInfo: (info: SelfServiceBusinessInfo) => void;
  confirmedAt: number | null;
  confirmOrder: () => void;
  reset: () => void;
}

const SelfServiceOrderContext = createContext<SelfServiceOrderContextValue | null>(null);

export function SelfServiceOrderProvider({ children }: { children: React.ReactNode }) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [businessInfo, setBusinessInfo] = useState<SelfServiceBusinessInfo>(EMPTY_BUSINESS_INFO);
  const [confirmedAt, setConfirmedAt] = useState<number | null>(null);

  const value = useMemo<SelfServiceOrderContextValue>(() => ({
    selectedPlan: SELF_SERVICE_PLANS.find(p => p.id === selectedPlanId) ?? null,
    selectPlan: (planId: string) => setSelectedPlanId(planId),
    businessInfo,
    setBusinessInfo,
    confirmedAt,
    confirmOrder: () => setConfirmedAt(Date.now()),
    reset: () => {
      setSelectedPlanId(null);
      setBusinessInfo(EMPTY_BUSINESS_INFO);
      setConfirmedAt(null);
    },
  }), [selectedPlanId, businessInfo, confirmedAt]);

  return (
    <SelfServiceOrderContext.Provider value={value}>
      {children}
    </SelfServiceOrderContext.Provider>
  );
}

export function useSelfServiceOrder(): SelfServiceOrderContextValue {
  const ctx = useContext(SelfServiceOrderContext);
  if (!ctx) throw new Error('useSelfServiceOrder debe usarse dentro de SelfServiceOrderProvider');
  return ctx;
}
