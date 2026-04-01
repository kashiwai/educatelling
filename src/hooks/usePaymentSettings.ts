export interface PaymentSettings {
  // PayPal.me username (e.g. "educatelling" → https://paypal.me/educatelling/150)
  paypal_me_username: string;
  // key: item ID (e.g. "plan-uuid" or "product-uuid"), value: SumUp payment link URL
  sumup_links: Record<string, string>;
}

const STORAGE_KEY = 'payment_settings';

const defaults: PaymentSettings = {
  paypal_me_username: 'educatelling',
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
