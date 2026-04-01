import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type',
};

interface CheckoutRequest {
  amount: number;
  currency: string;
  description: string;
  checkout_reference: string;
  merchant_code: string;
  return_url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('SUMUP_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'SUMUP_API_KEY is not configured in Supabase secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: CheckoutRequest = await req.json();
    const { amount, currency, description, checkout_reference, merchant_code, return_url } = body;

    if (!amount || !currency || !checkout_reference || !merchant_code) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, currency, checkout_reference, merchant_code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SumUp Checkout API を呼び出し
    const sumupRes = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkout_reference,
        amount,
        currency,
        merchant_code,
        description: description || 'Opal Japanese Kids',
        return_url,
      }),
    });

    const sumupData = await sumupRes.json();

    if (!sumupRes.ok) {
      console.error('SumUp API error:', sumupData);
      return new Response(
        JSON.stringify({ error: sumupData.message || 'SumUp API error', details: sumupData }),
        { status: sumupRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const checkoutId = sumupData.id;
    const checkoutUrl = `https://checkout.sumup.com/pay/${checkoutId}`;

    return new Response(
      JSON.stringify({ checkout_url: checkoutUrl, checkout_id: checkoutId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
