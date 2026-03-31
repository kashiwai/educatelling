import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SquarePaymentProps {
  amount: number;
  currency: string;
  appId: string;
  locationId: string;
  itemName: string;
  onSuccess: (paymentId: string) => void;
  onError: (msg: string) => void;
}

declare global {
  interface Window { Square?: any; }
}

export function SquarePayment({ amount, currency, appId, locationId, itemName, onSuccess, onError }: SquarePaymentProps) {
  const [card, setCard] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!appId || !locationId) {
      onError('Square の設定が不完全です。管理画面で App ID と Location ID を設定してください。');
      return;
    }

    const load = async () => {
      if (!window.Square) {
        const script = document.createElement('script');
        script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
        document.body.appendChild(script);
        await new Promise(r => script.onload = r);
      }
      try {
        const payments = window.Square.payments(appId, locationId);
        const c = await payments.card();
        await c.attach('#square-card-container');
        setCard(c);
      } catch (e: any) {
        onError('Square カードフォームの初期化に失敗しました。');
      }
    };
    load();
  }, [appId, locationId]);

  const handlePay = async () => {
    if (!card) return;
    setProcessing(true);
    setLocalError('');
    try {
      const result = await card.tokenize();
      if (result.status !== 'OK') throw new Error('カード情報の検証に失敗しました。');

      // Supabase Edge Function で Square 決済処理
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-square-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ sourceId: result.token, amount: Math.round(amount * 100), currency, itemName }),
        }
      );
      const data = await resp.json();
      if (!data.success) throw new Error(data.error || '決済失敗');
      onSuccess(data.paymentId);
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
      <div id="square-card-container" className="p-4 border rounded-lg bg-white min-h-[50px]">
        {!card && <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}
      </div>
      {localError && <Alert variant="destructive"><AlertDescription>{localError}</AlertDescription></Alert>}
      <Button onClick={handlePay} disabled={!card || processing} className="w-full" size="lg">
        {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />処理中...</> : `AUD $${amount.toLocaleString()} を支払う`}
      </Button>
    </div>
  );
}
