import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type',
};

const ADMIN_SECRET = Deno.env.get('ADMIN_SECRET') ?? 'opal-admin-2026';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Auth check for write operations
  if (req.method !== 'GET') {
    const auth = req.headers.get('Authorization');
    if (!auth || auth !== `Bearer ${ADMIN_SECRET}`) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let body: any = null;
  if (req.method !== 'GET') {
    body = await req.json().catch(() => null);
  }

  if (req.method === 'POST' && body) {
    const { data, error } = await supabase
      .from('plans_2026_03_11_21_20')
      .insert({
        name: body.name,
        name_ja: body.name_ja ?? body.name,
        price_aud: body.price_aud,
        duration_months: body.duration_months ?? 1,
        description: body.description ?? '',
        features: body.features ?? [],
        is_active: body.is_active ?? true,
        is_featured: body.is_featured ?? false,
        display_order: body.display_order ?? 999,
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true, plan: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'PUT' && body?.planId) {
    const { planId, ...fields } = body;
    const { data, error } = await supabase
      .from('plans_2026_03_11_21_20')
      .update({
        name: fields.name,
        name_ja: fields.name_ja ?? fields.name,
        price_aud: fields.price_aud,
        duration_months: fields.duration_months ?? 1,
        description: fields.description ?? '',
        features: fields.features ?? [],
        is_active: fields.is_active ?? true,
        is_featured: fields.is_featured ?? false,
        display_order: fields.display_order ?? 999,
      })
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true, plan: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'DELETE' && body?.planId) {
    const { error } = await supabase
      .from('plans_2026_03_11_21_20')
      .delete()
      .eq('id', body.planId);

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
    status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
