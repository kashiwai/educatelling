import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface Product {
  id?: string
  name: string
  name_en: string
  description: string
  price_aud: number
  currency: string
  category: string
  image_url?: string
  is_active: boolean
  is_featured: boolean
  display_order: number
  stock_quantity: number
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
    const method = req.method
    console.log('Product management request:', method, url.pathname)

    // Parse request body for non-GET requests
    let requestBody: any = null
    if (method !== 'GET') {
      try {
        requestBody = await req.json()
      } catch (e) {
        console.log('No request body or invalid JSON')
      }
    }

    // Verify admin authentication for write operations
    if (method !== 'GET') {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing or invalid authorization header' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const token = authHeader.substring(7)
      
      // Verify admin session
      const { data: session, error: sessionError } = await supabaseClient
        .from('admin_sessions_2026_03_11_21_20')
        .select('admin_id')
        .eq('session_token', token)
        .single()

      if (sessionError || !session) {
        console.log('Invalid admin session:', sessionError)
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid or expired session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // GET - Fetch all products (public access for active products, admin access for all)
    if (method === 'GET') {
      const authHeader = req.headers.get('Authorization')
      const isAdmin = authHeader && authHeader.startsWith('Bearer ')
      
      let query = supabaseClient
        .from('products_2026_03_11_22_20')
        .select('*')
        .order('display_order', { ascending: true })

      // If not admin, only show active products
      if (!isAdmin) {
        query = query.eq('is_active', true)
      }

      const { data: products, error: productsError } = await query

      if (productsError) {
        console.log('Products fetch error:', productsError)
        throw new Error('Failed to fetch products')
      }

      return new Response(
        JSON.stringify({ success: true, products }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST - Create new product
    if (method === 'POST' && requestBody) {
      const productData: Product = requestBody
      console.log('Creating product:', productData)

      const { data: product, error: productError } = await supabaseClient
        .from('products_2026_03_11_22_20')
        .insert({
          name: productData.name,
          name_en: productData.name_en,
          description: productData.description,
          price_aud: productData.price_aud,
          currency: productData.currency || 'AUD',
          category: productData.category,
          image_url: productData.image_url,
          is_active: productData.is_active !== undefined ? productData.is_active : true,
          is_featured: productData.is_featured || false,
          display_order: productData.display_order || 999,
          stock_quantity: productData.stock_quantity || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (productError) {
        console.log('Product creation error:', productError)
        throw new Error(`Failed to create product: ${productError.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, product }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT - Update product
    if (method === 'PUT' && requestBody?.productId) {
      const { productId, ...productData } = requestBody
      console.log('Updating product:', productId, productData)

      const { data: product, error: productError } = await supabaseClient
        .from('products_2026_03_11_22_20')
        .update({
          name: productData.name,
          name_en: productData.name_en,
          description: productData.description,
          price_aud: productData.price_aud,
          currency: productData.currency || 'AUD',
          category: productData.category,
          image_url: productData.image_url,
          is_active: productData.is_active !== undefined ? productData.is_active : true,
          is_featured: productData.is_featured || false,
          display_order: productData.display_order || 999,
          stock_quantity: productData.stock_quantity || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single()

      if (productError) {
        console.log('Product update error:', productError)
        throw new Error(`Failed to update product: ${productError.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, product }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE - Delete product
    if (method === 'DELETE' && requestBody?.productId) {
      const { productId } = requestBody
      console.log('Deleting product:', productId)

      const { error: productError } = await supabaseClient
        .from('products_2026_03_11_22_20')
        .delete()
        .eq('id', productId)

      if (productError) {
        console.log('Product deletion error:', productError)
        throw new Error(`Failed to delete product: ${productError.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Product deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request method or missing data' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Product management error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})