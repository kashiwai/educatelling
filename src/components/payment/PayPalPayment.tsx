import { useState } from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PayPalPaymentProps {
  amount: number;
  currency: string;
  username: string;
  itemPrice: string;
  onSuccess: (ref: string) => void;
  onError: (msg: string) => void;
}

export function PayPalPayment({ amount, username, itemPrice, onSuccess, onError }: PayPalPaymentProps) {
  const [linkOpened, setLinkOpened] = useState(false);

  const paypalUrl = username
    ? `https://paypal.me/${username}/${amount}`
    : '';

  const handleOpenLink = () => {
    if (!paypalUrl) {
      onError('PayPal.me username is not configured. Please contact the administrator.');
      return;
    }
    window.open(paypalUrl, '_blank', 'noopener,noreferrer');
    setLinkOpened(true);
  };

  const handleConfirmPayment = () => {
    onSuccess(`PAYPAL-${Date.now()}`);
  };

  return (
    <div className="space-y-4">
      {/* Amount display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-700 mb-1">Amount to pay</p>
        <p className="text-2xl font-bold text-blue-800">{itemPrice}</p>
        <p className="text-xs text-blue-600 mt-1">The amount is pre-filled on the PayPal page.</p>
      </div>

      {/* Step 1: Open PayPal.me */}
      <Button
        onClick={handleOpenLink}
        className="w-full"
        size="lg"
        style={{ backgroundColor: '#003087', color: 'white' }}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Pay with PayPal — {itemPrice}
      </Button>

      {/* Step 2: Confirm after payment */}
      {linkOpened && (
        <div className="space-y-3 pt-2 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Once your payment is complete on PayPal, click the button below.
          </p>
          <Button
            onClick={handleConfirmPayment}
            variant="outline"
            className="w-full border-green-500 text-green-700 hover:bg-green-50"
            size="lg"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            I have completed payment
          </Button>
        </div>
      )}
    </div>
  );
}
