import { useState } from 'react';
import type { Plan, ApplicationData } from '@/lib/index';

interface PaymentState {
  isProcessing: boolean;
  error: string | null;
  success: boolean;
}

interface UsePaymentReturn {
  processPayment: (data: ApplicationData, plan: Plan) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
  success: boolean;
  resetPayment: () => void;
}

// Extend Window interface to include Square
declare global {
  interface Window {
    Square?: {
      payments: (applicationId: string, locationId: string) => {
        card: () => Promise<{
          attach: (selector: string) => Promise<void>;
          tokenize: () => Promise<{
            status: string;
            token?: string;
          }>;
        }>;
      };
    };
  }
}

export function usePayment(): UsePaymentReturn {
  const [state, setState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
    success: false
  });

  const processPayment = async (data: ApplicationData, plan: Plan) => {
    setState({ isProcessing: true, error: null, success: false });

    try {
      const squareApplicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
      const squareLocationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

      if (!squareApplicationId || !squareLocationId) {
        throw new Error('Square設定が見つかりません。管理者にお問い合わせください。');
      }

      if (!window.Square) {
        throw new Error('Square決済システムの読み込みに失敗しました。ページを再読み込みしてください。');
      }

      const payments = window.Square.payments(squareApplicationId, squareLocationId);
      const card = await payments.card();
      await card.attach('#card-container');

      const result = await card.tokenize();
      if (result.status === 'OK' && result.token) {
        const paymentData = {
          sourceId: result.token,
          amount: plan.price * 100,
          currency: plan.currency,
          applicationData: data,
          planId: plan.id
        };

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(paymentData)
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '決済処理に失敗しました。');
        }

        const paymentResult = await response.json();

        if (paymentResult.success) {
          setState({ isProcessing: false, error: null, success: true });
        } else {
          throw new Error(paymentResult.error || '決済処理に失敗しました。');
        }
      } else {
        throw new Error('カード情報の検証に失敗しました。入力内容をご確認ください。');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました。';
      setState({ isProcessing: false, error: errorMessage, success: false });
      throw err;
    }
  };

  const resetPayment = () => {
    setState({ isProcessing: false, error: null, success: false });
  };

  return {
    processPayment,
    isProcessing: state.isProcessing,
    error: state.error,
    success: state.success,
    resetPayment
  };
}
