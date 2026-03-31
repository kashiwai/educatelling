import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface PaymentRequest {
  applicationData: {
    name: string
    email: string
    child_age: number
    current_level: string
    selected_plan: string
    phone?: string
    message?: string
  }
  planId: string
  amount: number
  nonce: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { applicationData, planId, amount, nonce }: PaymentRequest = await req.json()

    // Square API設定
    const squareApplicationId = Deno.env.get('SQUARE_APPLICATION_ID')
    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN')
    
    if (!squareApplicationId || !squareAccessToken) {
      throw new Error('Square API credentials not configured')
    }

    // 1. 申し込み情報をデータベースに保存
    const { data: application, error: appError } = await supabaseClient
      .from('applications_2026_03_11_21_20')
      .insert([applicationData])
      .select()
      .single()

    if (appError) {
      throw new Error(`Application creation failed: ${appError.message}`)
    }

    // 2. Square決済処理
    const paymentRequest = {
      source_id: nonce,
      amount_money: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'AUD'
      },
      idempotency_key: crypto.randomUUID(),
      location_id: Deno.env.get('SQUARE_LOCATION_ID') || 'main',
      note: `Payment for ${applicationData.selected_plan} - ${applicationData.name}`,
      buyer_email_address: applicationData.email
    }

    const squareResponse = await fetch('https://connect.squareupsandbox.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18'
      },
      body: JSON.stringify(paymentRequest)
    })

    const squareResult = await squareResponse.json()

    if (!squareResponse.ok) {
      throw new Error(`Square payment failed: ${JSON.stringify(squareResult.errors)}`)
    }

    // 3. 決済記録をデータベースに保存
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments_2026_03_11_21_20')
      .insert([{
        application_id: application.id,
        square_payment_id: squareResult.payment.id,
        amount_aud: amount,
        currency: 'AUD',
        status: squareResult.payment.status === 'COMPLETED' ? 'completed' : 'pending',
        payment_method: 'square'
      }])
      .select()
      .single()

    if (paymentError) {
      console.error('Payment record creation failed:', paymentError)
      // 決済は成功したが記録に失敗した場合のログ
    }

    // 4. 申し込み状況を更新
    if (squareResult.payment.status === 'COMPLETED') {
      await supabaseClient
        .from('applications_2026_03_11_21_20')
        .update({ status: 'approved' })
        .eq('id', application.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        application_id: application.id,
        payment_id: squareResult.payment.id,
        status: squareResult.payment.status,
        message: 'Payment processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Payment processing failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})