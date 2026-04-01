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
  itemId: string;
  itemName: string;
  itemPrice: string;
  amount: number;
  currency: string;
}

export function PaymentModal({ open, onClose, itemId, itemName, itemPrice, amount, currency }: PaymentModalProps) {
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<'paypal' | 'sumup' | null>(null);
  const settings = getPaymentSettings();

  const sumupLink = settings.sumup_links[itemId] ?? '';
  const hasSumUp = !!sumupLink;

  const handleSuccess = (id: string) => {
    setPaymentId(id);
    setPaymentDone(true);
    setError('');
  };

  const handleClose = () => {
    setPaymentDone(false);
    setPaymentId('');
    setError('');
    setSelected(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {paymentDone ? 'Application Form' : 'Checkout'}
          </DialogTitle>
        </DialogHeader>

        {!paymentDone && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm mb-2">
            <span className="font-semibold">{itemName}</span>
            <span className="text-muted-foreground ml-2">{itemPrice}</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: choose payment method */}
        {!paymentDone && !selected && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">Choose a payment method</p>

            {/* PayPal — always shown */}
            <button
              onClick={() => setSelected('paypal')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 border-[#003087] hover:bg-[#003087]/5 transition-colors"
            >
              <div className="text-left">
                <p className="font-semibold text-[#003087]">PayPal</p>
                <p className="text-xs text-muted-foreground">Pay via PayPal.me — fast &amp; secure</p>
              </div>
              <span className="text-2xl">🅿️</span>
            </button>

            {/* SumUp — shown only if link is configured */}
            {hasSumUp && (
              <button
                onClick={() => setSelected('sumup')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 border-[#00b9ff] hover:bg-[#00b9ff]/5 transition-colors"
              >
                <div className="text-left">
                  <p className="font-semibold text-[#00b9ff]">SumUp</p>
                  <p className="text-xs text-muted-foreground">Pay by card via SumUp</p>
                </div>
                <span className="text-2xl">💳</span>
              </button>
            )}
          </div>
        )}

        {/* Step 2: payment */}
        {!paymentDone && selected === 'paypal' && (
          <div className="space-y-3">
            <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:underline">
              ← Back
            </button>
            <PayPalPayment
              amount={amount}
              currency={currency}
              username={settings.paypal_me_username}
              itemPrice={itemPrice}
              onSuccess={handleSuccess}
              onError={setError}
            />
          </div>
        )}

        {!paymentDone && selected === 'sumup' && (
          <div className="space-y-3">
            <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:underline">
              ← Back
            </button>
            <SumUpPayment
              itemId={itemId}
              itemName={itemName}
              itemPrice={itemPrice}
              paymentLink={sumupLink}
              onSuccess={handleSuccess}
              onError={setError}
            />
          </div>
        )}

        {/* Step 3: inquiry form */}
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
