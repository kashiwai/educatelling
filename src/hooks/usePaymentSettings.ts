export interface PaymentSettings {
  // PayPal.me username (e.g. "educatelling" → https://paypal.me/educatelling/150)
  paypal_me_username: string;
  // key: item ID (e.g. "plan-uuid" or "product-uuid"), value: SumUp payment link URL
  sumup_links: Record<string, string>;
}

const STORAGE_KEY = 'payment_settings';

const SUMUP_BASE = 'https://pay.sumup.com/b2c/';

const defaults: PaymentSettings = {
  paypal_me_username: 'educatelling',
  sumup_links: {
    // Plans
    'plan-aca6fe38-0d3d-4a78-b469-aeeadce4903b': SUMUP_BASE + 'XF2OLHR3Y1', // Starter $912
    'plan-7dec0bba-88e9-48e7-b8a5-afa2ce2c994e': SUMUP_BASE + 'X9LCNNJZGB', // Standard $2,735
    'plan-e462e4db-cf7a-47b5-8edb-b28f9ee65e70': SUMUP_BASE + 'XS70052FM6', // Premium $4,558
    'plan-483f85c1-d95c-4081-8ac6-35c28d6da077': SUMUP_BASE + 'XHD2YFILEA', // JLPT+Japan $9,115
    'plan-dd4ff3ed-7a80-4878-aa09-590ae94f17e3': SUMUP_BASE + 'X9XHXILOFP', // 2-Week Tour $13,673
    'plan-c954bf5b-0a08-4ec7-aa4d-98f7741a4b9d': SUMUP_BASE + 'XIQKXPAAZ1', // 1-Month Tour $18,230
    // Products
    'product-7bb81d47-875e-4eb7-a239-43badd4038f7': SUMUP_BASE + 'X8XOED5G49', // Beginner Kit $22,788
    'product-0cc2f2a0-f081-4ee5-aeeb-7a39cc527e57': SUMUP_BASE + 'XVZDQC8T9P', // Intermediate Kit $27,345
    'product-445711a1-b259-441c-be19-d201fce47f6f': SUMUP_BASE + 'XPFBF2P6YL', // JLPT N5 $31,903
    // product-9198c9ce (JLPT N4 $36,460) — SumUp link pending
    'product-756a5583-6212-4b1b-afb5-c091600b9f42': SUMUP_BASE + 'XS1MGH6D2L', // Culture Kit $41,018
    'product-b7f2882f-2c50-4c84-9ba0-c6f8ca59cd1e': SUMUP_BASE + 'XKX5UAO37M', // Online Lesson $45,575
  },
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
