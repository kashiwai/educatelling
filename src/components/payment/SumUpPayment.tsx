import { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface SumUpPaymentProps {
  amount: number;
  currency: string;
  itemName: string;
  itemPrice: string;
  merchantCode: string;
  onError: (msg: string) => void;
}

export function SumUpPayment({ amount, currency, itemName, itemPrice, merchantCode, onError }: SumUpPaymentProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!merchantCode) {
      onError('SumUp Merchant Code が設定されていません。管理画面で設定してください。');
      return;
    }

    setLoading(true);
    try {
      const checkoutRef = `OJK-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const returnUrl = `${window.location.origin}/?sumup_paid=1&sumup_ref=${encodeURIComponent(checkoutRef)}&sumup_item=${encodeURIComponent(itemName)}&sumup_price=${encodeURIComponent(itemPrice)}`;

      const { data, error } = await supabase.functions.invoke('create-sumup-checkout', {
        body: {
          amount,
          currency,
          description: itemName,
          checkout_reference: checkoutRef,
          merchant_code: merchantCode,
          return_url: returnUrl,
        },
      });

      if (error || !data?.checkout_url) {
        throw new Error(error?.message || 'SumUp チェックアウトの作成に失敗しました。');
      }

      // SumUp 決済ページへリダイレクト
      window.location.href = data.checkout_url;
    } catch (err: any) {
      onError(err.message || 'SumUp 決済の開始に失敗しました。');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p>SumUp の安全な決済ページへ移動して、カード情報を入力してください。</p>
        <p className="mt-1">決済完了後、自動的にこのページに戻ります。</p>
      </div>
      <Button
        onClick={handlePay}
        disabled={loading}
        className="w-full"
        size="lg"
        style={{ backgroundColor: '#00b9ff', color: 'white' }}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />SumUp へ接続中...</>
        ) : (
          <><CreditCard className="w-4 h-4 mr-2" />SumUp で支払う — {itemPrice}</>
        )}
      </Button>
    </div>
  );
}
