export type PaymentProvider = 'paypal' | 'sumup';

export interface PaymentSettings {
  active_provider: PaymentProvider;
  // PayPal.me username (e.g. "yuna626" → https://paypal.me/yuna626/150)
  paypal_me_username: string;
  // key: item ID (e.g. "plan-uuid" or "product-uuid"), value: SumUp payment link URL
  sumup_links: Record<string, string>;
}

const STORAGE_KEY = 'payment_settings';

const defaults: PaymentSettings = {
  active_provider: 'paypal',
  paypal_me_username: '',
  sumup_links: {},
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
