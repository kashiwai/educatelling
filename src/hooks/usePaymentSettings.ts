export type PaymentProvider = 'stripe' | 'paypal' | 'square';

export interface PaymentSettings {
  active_provider: PaymentProvider;
  stripe_publishable_key: string;
  paypal_client_id: string;
  square_app_id: string;
  square_location_id: string;
}

const STORAGE_KEY = 'payment_settings';

const defaults: PaymentSettings = {
  active_provider: 'paypal',
  stripe_publishable_key: '',
  paypal_client_id: '',
  square_app_id: '',
  square_location_id: '',
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
