import { useState } from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SumUpPaymentProps {
  amount: number;
  currency: string;
  itemName: string;
  itemPrice: string;
  paymentLink: string;
  onSuccess: (ref: string) => void;
  onError: (msg: string) => void;
}

export function SumUpPayment({ amount, currency, itemName, itemPrice, paymentLink, onSuccess, onError }: SumUpPaymentProps) {
  const [linkOpened, setLinkOpened] = useState(false);

  const handleOpenLink = () => {
    if (!paymentLink) {
      onError('SumUp 決済リンクが設定されていません。管理画面で設定してください。');
      return;
    }
    window.open(paymentLink, '_blank', 'noopener,noreferrer');
    setLinkOpened(true);
  };

  const handleConfirmPayment = () => {
    const ref = `SUMUP-${Date.now()}`;
    onSuccess(ref);
  };

  return (
    <div className="space-y-4">
      {/* 金額確認 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <p className="font-semibold text-blue-900 mb-1">お支払い金額</p>
        <p className="text-2xl font-bold text-blue-700">{itemPrice}</p>
        <p className="text-blue-600 text-xs mt-1">SumUp の決済ページで上記の金額をご入力ください</p>
      </div>

      {/* Step 1: SumUp リンクを開く */}
      <Button
        onClick={handleOpenLink}
        className="w-full"
        size="lg"
        style={{ backgroundColor: '#00b9ff', color: 'white' }}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        SumUp で支払う（新しいタブで開く）
      </Button>

      {/* Step 2: 支払い完了後 */}
      {linkOpened && (
        <div className="space-y-3 pt-2 border-t">
          <p className="text-sm text-muted-foreground text-center">
            SumUp での支払いが完了したら、下のボタンを押してください
          </p>
          <Button
            onClick={handleConfirmPayment}
            variant="outline"
            className="w-full border-green-500 text-green-700 hover:bg-green-50"
            size="lg"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            支払いが完了しました
          </Button>
        </div>
      )}
    </div>
  );
}
