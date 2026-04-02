export interface PaymentSettings {
  stripe_publishable_key: string;
  // paypal_me_username reserved — pending approval
  // sumup_links reserved — suspended
}

const STORAGE_KEY = 'payment_settings';

const defaults: PaymentSettings = {
  stripe_publishable_key: 'pk_live_51THd49P6ZSRdA7SmSHF0mgu9yRwtweUfOfs22jWKQll5e4FiknNWnOKh0pZ2AjDnJsIzLPJAJJ0LpGlINTgWsKLK00CyjHOall',
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
