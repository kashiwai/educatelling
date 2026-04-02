import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InquiryForm } from '@/components/InquiryForm';
import { StripePayment } from './StripePayment';
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {paymentDone ? 'Application Form' : 'Secure Checkout'}
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

        {!paymentDone && (
          <StripePayment
            amount={amount}
            currency={currency}
            itemName={itemName}
            itemPrice={itemPrice}
            publishableKey={settings.stripe_publishable_key}
            onSuccess={handleSuccess}
            onError={setError}
          />
        )}

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
