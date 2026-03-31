import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const pathSegments = url.pathname.split('/').filter(segment => segment !== '')
    const action = pathSegments[pathSegments.length - 1] // Get the last segment

    console.log('Request path:', url.pathname)
    console.log('Action:', action)
    console.log('Method:', req.method)

    // Parse request body for non-GET requests
    let requestBody: any = null
    if (req.method !== 'GET') {
      try {
        requestBody = await req.json()
      } catch (e) {
        // Body might be empty for some requests
      }
    }

    // Admin Login
    if (req.method === 'POST' && !requestBody?.planId && !requestBody?.email) {
      // This is likely a logout request
      const authHeader = req.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const { error: logoutError } = await supabaseClient
          .from('admin_sessions_2026_03_11_21_20')
          .delete()
          .eq('session_token', token)

        return new Response(
          JSON.stringify({ success: true, message: 'Logged out successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (req.method === 'POST' && requestBody?.email) {
      const { email, password }: AdminLoginRequest = requestBody
      console.log('Login attempt for:', email)

      // Get admin by email
      const { data: admin, error: adminError } = await supabaseClient
        .from('admins_2026_03_11_21_20')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      console.log('Admin query result:', { admin, adminError })

      if (adminError || !admin) {
        console.log('Admin not found or error:', adminError)
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      // Verify password (simplified for demo)
      const isValidPassword = password === 'admin123'

      if (!isValidPassword) {
        console.log('Invalid password')
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
        console.log('Session creation error:', sessionError)
        throw new Error('Failed to create session')
      }

      console.log('Login successful')
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

    // For all other routes, verify admin session
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - No token' }),
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
      console.log('Session verification failed:', sessionError)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired session' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Get Plans
    if (req.method === 'GET') {
      const { data: plans, error: plansError } = await supabaseClient
        .from('plans_2026_03_11_21_20')
        .select('*')
        .order('display_order', { ascending: true })

      if (plansError) {
        console.log('Plans fetch error:', plansError)
        throw new Error('Failed to fetch plans')
      }

      return new Response(
        JSON.stringify({ success: true, plans }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Plan
    if (req.method === 'POST' && requestBody && !requestBody.email && !requestBody.planId) {
      const planData: PlanRequest = requestBody

      const { data: plan, error: planError } = await supabaseClient
        .from('plans_2026_03_11_21_20')
        .insert([{
          name: planData.name,
          name_ja: planData.nameEn,
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
        console.log('Plan creation error:', planError)
        throw new Error(`Failed to create plan: ${planError.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, plan }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update Plan
    if (req.method === 'PUT' && requestBody?.planId) {
      const { planId, ...planData } = requestBody
      console.log('Updating plan:', planId, planData)

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
        console.log('Plan update error:', planError)
        throw new Error(`Failed to update plan: ${planError.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, plan }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Delete Plan
    if (req.method === 'DELETE' && requestBody?.planId) {
      const { planId } = requestBody
      console.log('Deleting plan:', planId)

      const { error: planError } = await supabaseClient
        .from('plans_2026_03_11_21_20')
        .delete()
        .eq('id', planId)

      if (planError) {
        console.log('Plan deletion error:', planError)
        throw new Error(`Failed to delete plan: ${planError.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Plan deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }



    console.log('No matching route found')
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