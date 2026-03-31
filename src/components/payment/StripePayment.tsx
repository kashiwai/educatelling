import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StripePaymentProps {
  amount: number;
  currency: string;
  publishableKey: string;
  itemName: string;
  onSuccess: (paymentId: string) => void;
  onError: (msg: string) => void;
}

declare global {
  interface Window { Stripe?: any; }
}

export function StripePayment({ amount, currency, publishableKey, itemName, onSuccess, onError }: StripePaymentProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!publishableKey) {
      onError('Stripe Publishable Key が設定されていません。管理画面で設定してください。');
      return;
    }

    const load = async () => {
      if (!window.Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        document.body.appendChild(script);
        await new Promise(r => script.onload = r);
      }
      const s = window.Stripe(publishableKey);
      const elements = s.elements();
      const c = elements.create('card', { style: { base: { fontSize: '16px' } } });
      if (cardRef.current) c.mount(cardRef.current);
      c.on('change', (e: any) => setLocalError(e.error?.message || ''));
      setStripe(s);
      setCard(c);
    };
    load();
  }, [publishableKey]);

  const handlePay = async () => {
    if (!stripe || !card) return;
    setProcessing(true);
    setLocalError('');

    // Supabase Edge Function で PaymentIntent を作成
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ amount: Math.round(amount * 100), currency: currency.toLowerCase(), itemName }),
        }
      );
      const { clientSecret, error: fnError } = await resp.json();
      if (fnError) throw new Error(fnError);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) throw new Error(result.error.message);
      onSuccess(result.paymentIntent.id);
    } catch (e: any) {
      const msg = e.message || '決済に失敗しました。';
      setLocalError(msg);
      onError(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div ref={cardRef} className="p-4 border rounded-lg bg-white min-h-[50px]" />
      {localError && (
        <Alert variant="destructive">
          <AlertDescription>{localError}</AlertDescription>
        </Alert>
      )}
      <Button onClick={handlePay} disabled={!card || processing} className="w-full" size="lg">
        {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />処理中...</> : `AUD $${amount.toLocaleString()} を支払う`}
      </Button>
    </div>
  );
}
