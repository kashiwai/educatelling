import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface AdminLoginRequest {
  email: string
  password: string
}

interface PlanRequest {
  name: string
  nameEn: string
  price: number
  currency: string
  duration: string
  description: string
  features: string[]
  is_featured?: boolean
  display_order?: number
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

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    // Admin Login
    if (req.method === 'POST' && path === 'login') {
      const { email, password }: AdminLoginRequest = await req.json()

      // Get admin by email
      const { data: admin, error: adminError } = await supabaseClient
        .from('admins_2026_03_11_21_20')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (adminError || !admin) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      // Verify password (simplified for demo - in production use proper bcrypt)
      const isValidPassword = password === 'admin123' // Simplified for demo

      if (!isValidPassword) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      // Create session token
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      const { error: sessionError } = await supabaseClient
        .from('admin_sessions_2026_03_11_21_20')
        .insert([{
          admin_id: admin.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        }])

      if (sessionError) {
        throw new Error('Failed to create session')
      }

      return new Response(
        JSON.stringify({
          success: true,
          token: sessionToken,
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify admin session for protected routes
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { data: session, error: sessionError } = await supabaseClient
      .from('admin_sessions_2026_03_11_21_20')
      .select('*, admins_2026_03_11_21_20(*)')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired session' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Get Plans
    if (req.method === 'GET' && path === 'plans') {
      const { data: plans, error: plansError } = await supabaseClient
        .from('plans_2026_03_11_21_20')
        .select('*')
        .order('display_order', { ascending: true })

      if (plansError) {
        throw new Error('Failed to fetch plans')
      }

      return new Response(
        JSON.stringify({ success: true, plans }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Plan
    if (req.method === 'POST' && path === 'plans') {
      const planData: PlanRequest = await req.json()

      const { data: plan, error: planError } = await supabaseClient
        .from('plans_2026_03_11_21_20')
        .insert([{
          name: planData.name,
          name_ja: planData.nameEn, // Store English name in name_ja for consistency
          price_aud: planData.price,
          duration_months: planData.duration === 'Monthly' ? 12 : 1,
          description: planData.description,
          features: JSON.stringify(planData.features),
          is_active: true,
          is_featured: planData.is_featured || false,
          display_order: planData.display_order || 999
        }])
        .select()
        .single()

      if (planError) {
        throw new Error(`Failed to create plan: ${planError.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, plan }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update Plan
    if (req.method === 'PUT' && path?.startsWith('plans/')) {
      const planId = path.split('/')[1]
      const planData: PlanRequest = await req.json()

      const { data: plan, error: planError } = await supabaseClient
        .from('plans_2026_03_11_21_20')
        .update({
          name: planData.name,
          name_ja: planData.nameEn,
          price_aud: planData.price,
          duration_months: planData.duration === 'Monthly' ? 12 : 1,
          description: planData.description,
          features: JSON.stringify(planData.features),
          is_featured: planData.is_featured || false,
          display_order: planData.display_order || 999,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single()

      if (planError) {
        throw new Error(`Failed to update plan: ${planError.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, plan }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Delete Plan
    if (req.method === 'DELETE' && path?.startsWith('plans/')) {
      const planId = path.split('/')[1]

      const { error: planError } = await supabaseClient
        .from('plans_2026_03_11_21_20')
        .delete()
        .eq('id', planId)

      if (planError) {
        throw new Error(`Failed to delete plan: ${planError.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Plan deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Admin Logout
    if (req.method === 'POST' && path === 'logout') {
      const { error: logoutError } = await supabaseClient
        .from('admin_sessions_2026_03_11_21_20')
        .delete()
        .eq('session_token', token)

      if (logoutError) {
        console.error('Logout error:', logoutError)
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Logged out successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )

  } catch (error) {
    console.error('Admin management error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})