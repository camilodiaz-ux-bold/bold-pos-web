export interface SelfServicePlan {
  id: string;
  name: string;
  target: string;
  priceMonthly: number;
  features: string[];
  recommended?: boolean;
}

export interface SelfServiceBusinessInfo {
  businessName: string;
  taxId: string;
  phone: string;
  email: string;
}

export const EMPTY_BUSINESS_INFO: SelfServiceBusinessInfo = {
  businessName: '',
  taxId: '',
  phone: '',
  email: '',
};
