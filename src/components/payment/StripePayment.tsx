import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface StripePaymentProps {
  amount: number;
  currency: string;
  itemName: string;
  itemPrice: string;
  publishableKey: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (msg: string) => void;
}

function CheckoutForm({ itemPrice, onSuccess, onError }: {
  itemPrice: string;
  onSuccess: (id: string) => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setLocalError('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });

    if (error) {
      setLocalError(error.message ?? 'Payment failed.');
      onError(error.message ?? 'Payment failed.');
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {localError && (
        <Alert variant="destructive">
          <AlertDescription>{localError}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={!stripe || loading} className="w-full" size="lg">
        {loading
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
          : `Pay ${itemPrice}`}
      </Button>
    </form>
  );
}

export function StripePayment({ amount, currency, itemName, itemPrice, publishableKey, onSuccess, onError }: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [started, setStarted] = useState(false);

  const stripePromise = loadStripe(publishableKey);

  const startPayment = async () => {
    setLoadingIntent(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-payment-intent', {
        body: {
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          description: itemName,
        },
      });
      if (error || !data?.client_secret) {
        throw new Error(error?.message ?? 'Failed to initialize payment.');
      }
      setClientSecret(data.client_secret);
      setStarted(true);
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoadingIntent(false);
    }
  };

  if (!started) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm font-medium text-slate-600 mb-1">Amount</p>
          <p className="text-2xl font-bold text-slate-800">{itemPrice}</p>
        </div>
        <Button onClick={startPayment} disabled={loadingIntent} className="w-full" size="lg">
          {loadingIntent
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</>
            : `Pay by Card — ${itemPrice}`}
        </Button>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: 'stripe' } }}
    >
      <CheckoutForm itemPrice={itemPrice} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
