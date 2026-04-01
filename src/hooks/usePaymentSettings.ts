export type PaymentProvider = 'paypal' | 'sumup';

export interface PaymentSettings {
  active_provider: PaymentProvider;
  paypal_client_id: string;
  sumup_payment_link: string;
}

const STORAGE_KEY = 'payment_settings';

const defaults: PaymentSettings = {
  active_provider: 'paypal',
  paypal_client_id: '',
  sumup_payment_link: '',
};

export function getPaymentSettings(): PaymentSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaults, ...JSON.parse(stored) };
  } catch (_) {}
  return defaults;
}

export function savePaymentSettings(settings: PaymentSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
