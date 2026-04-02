import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InquiryForm } from '@/components/InquiryForm';
import { StripePayment } from './StripePayment';
import { getPaymentSettings } from '@/hooks/usePaymentSettings';

interface CartItem {
  id: string;
  title: string;
  priceLabel: string;
  price: number;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totalAmount: number;
  currency: string;
  onSuccess?: () => void;
}

export function PaymentModal({ open, onClose, items, totalAmount, currency, onSuccess }: PaymentModalProps) {
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [error, setError] = useState('');
  const settings = getPaymentSettings();

  const itemNames = items.map(i => i.title).join(', ');
  const totalLabel = `${currency} $${totalAmount.toLocaleString()}`;

  const handleSuccess = (id: string) => {
    setPaymentId(id);
    setPaymentDone(true);
    setError('');
    onSuccess?.();
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
          <div className="bg-muted/50 rounded-lg p-3 text-sm mb-2 space-y-1">
            {items.map(item => (
              <div key={item.id} className="flex justify-between">
                <span className="font-medium truncate mr-2">{item.title}</span>
                <span className="text-muted-foreground shrink-0">{item.priceLabel}</span>
              </div>
            ))}
            {items.length > 1 && (
              <div className="flex justify-between border-t pt-1 mt-1 font-semibold">
                <span>Total</span>
                <span className="text-primary">{totalLabel}</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!paymentDone && (
          <StripePayment
            amount={totalAmount}
            currency={currency}
            itemName={itemNames}
            itemPrice={totalLabel}
            publishableKey={settings.stripe_publishable_key}
            onSuccess={handleSuccess}
            onError={setError}
          />
        )}

        {paymentDone && (
          <InquiryForm
            itemNames={itemNames}
            itemPrice={totalLabel}
            paymentId={paymentId}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
