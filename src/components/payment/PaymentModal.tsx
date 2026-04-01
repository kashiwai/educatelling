import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InquiryForm } from '@/components/InquiryForm';
import { PayPalPayment } from './PayPalPayment';
import { SumUpPayment } from './SumUpPayment';
import { getPaymentSettings } from '@/hooks/usePaymentSettings';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  itemName: string;
  itemPrice: string;
  amount: number;
  currency: string;
}

export function PaymentModal({ open, onClose, itemName, itemPrice, amount, currency }: PaymentModalProps) {
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [error, setError] = useState('');
  const settings = getPaymentSettings();

  const handleSuccess = (id: string) => {
    setPaymentId(id);
    setPaymentDone(true);
    setError('');
  };

  const handleClose = () => {
    setPaymentDone(false);
    setPaymentId('');
    setError('');
    onClose();
  };

  const providerLabel: Record<string, string> = {
    paypal: 'PayPal',
    sumup: 'SumUp',
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {paymentDone ? '申し込みフォーム' : `決済 — ${providerLabel[settings.active_provider]}`}
          </DialogTitle>
        </DialogHeader>

        {/* 商品情報 */}
        {!paymentDone && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm mb-4">
            <span className="font-semibold">{itemName}</span>
            <span className="text-muted-foreground ml-2">{itemPrice}</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: 決済 */}
        {!paymentDone && (
          <>
            {settings.active_provider === 'paypal' && (
              <PayPalPayment
                amount={amount}
                currency={currency}
                clientId={settings.paypal_client_id}
                onSuccess={handleSuccess}
                onError={setError}
              />
            )}
            {settings.active_provider === 'sumup' && (
              <SumUpPayment
                amount={amount}
                currency={currency}
                itemName={itemName}
                itemPrice={itemPrice}
                merchantCode={settings.sumup_merchant_code}
                onError={setError}
              />
            )}
          </>
        )}

        {/* Step 2: 決済完了後 → 問い合わせフォーム */}
        {paymentDone && (
          <InquiryForm
            itemName={itemName}
            itemPrice={itemPrice}
            paymentId={paymentId}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
