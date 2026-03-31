import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface PayPalPaymentProps {
  amount: number;
  currency: string;
  clientId: string;
  onSuccess: (orderId: string) => void;
  onError: (msg: string) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalPayment({ amount, currency, clientId, onSuccess, onError }: PayPalPaymentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (!clientId) {
      onError('PayPal Client ID が設定されていません。管理画面で設定してください。');
      return;
    }

    const scriptId = 'paypal-sdk';
    const existing = document.getElementById(scriptId);

    const renderButtons = () => {
      if (rendered.current || !containerRef.current) return;
      rendered.current = true;
      window.paypal.Buttons({
        createOrder: (_data: any, actions: any) =>
          actions.order.create({
            purchase_units: [{ amount: { value: amount.toFixed(2), currency_code: currency } }],
          }),
        onApprove: async (_data: any, actions: any) => {
          const details = await actions.order.capture();
          onSuccess(details.id);
        },
        onError: () => onError('PayPal 決済に失敗しました。'),
      }).render(containerRef.current);
    };

    if (existing) {
      if (window.paypal) renderButtons();
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
      script.onload = renderButtons;
      script.onerror = () => onError('PayPal SDK の読み込みに失敗しました。');
      document.body.appendChild(script);
    }
  }, [clientId]);

  return (
    <div>
      <div ref={containerRef} className="min-h-[50px]" />
      {!window.paypal && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
