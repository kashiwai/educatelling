import { useState } from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SumUpPaymentProps {
  itemId: string;
  itemName: string;
  itemPrice: string;
  paymentLink: string;
  onSuccess: (ref: string) => void;
  onError: (msg: string) => void;
}

export function SumUpPayment({ itemName, itemPrice, paymentLink, onSuccess, onError }: SumUpPaymentProps) {
  const [linkOpened, setLinkOpened] = useState(false);

  const handleOpenLink = () => {
    if (!paymentLink) {
      onError('SumUp payment link is not configured for this item. Please contact the administrator.');
      return;
    }
    window.open(paymentLink, '_blank', 'noopener,noreferrer');
    setLinkOpened(true);
  };

  const handleConfirmPayment = () => {
    onSuccess(`SUMUP-${Date.now()}`);
  };

  return (
    <div className="space-y-4">
      {/* Amount display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-700 mb-1">Amount to pay</p>
        <p className="text-2xl font-bold text-blue-800">{itemPrice}</p>
        <p className="text-xs text-blue-600 mt-1">Please enter this amount on the SumUp payment page.</p>
      </div>

      {/* Step 1: Open SumUp link */}
      <Button
        onClick={handleOpenLink}
        className="w-full"
        size="lg"
        style={{ backgroundColor: '#00b9ff', color: 'white' }}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Pay with SumUp — {itemPrice}
      </Button>

      {/* Step 2: Confirm after payment */}
      {linkOpened && (
        <div className="space-y-3 pt-2 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Once your payment is complete on SumUp, click the button below.
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
