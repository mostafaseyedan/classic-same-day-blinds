import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    // GET: fetch recent backups
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('daily_backups')
        .select('id, backup_date, backup_type, record_count, size_bytes, status, triggered_by, notes, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, backups: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST: create a new backup
    if (req.method === 'POST') {
      const body = await req.json();
      const { backup_type, data, triggered_by, notes } = body;

      if (!data) {
        return new Response(JSON.stringify({ error: 'No data provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const dataStr = JSON.stringify(data);
      const sizeBytes = new TextEncoder().encode(dataStr).length;
      const productsCount = Array.isArray(data.products) ? data.products.length : 0;
      const ordersCount = Array.isArray(data.orders) ? data.orders.length : 0;
      const recordCount = productsCount + ordersCount;

      const today = new Date().toISOString().slice(0, 10);

      // Upsert: one backup per type per day
      const { data: existing } = await supabase
        .from('daily_backups')
        .select('id')
        .eq('backup_date', today)
        .eq('backup_type', backup_type ?? 'full')
        .maybeSingle();

      let insertError;

      if (existing) {
        // Update existing backup for today
        const { error } = await supabase
          .from('daily_backups')
          .update({
            data,
            record_count: recordCount,
            size_bytes: sizeBytes,
            status: 'completed',
            triggered_by: triggered_by ?? 'manual',
            notes: notes ?? `${productsCount} products, ${ordersCount} orders`,
          })
          .eq('id', existing.id);
        insertError = error;
      } else {
        // Insert new backup record
        const { error } = await supabase.from('daily_backups').insert({
          backup_date: today,
          backup_type: backup_type ?? 'full',
          data,
          record_count: recordCount,
          size_bytes: sizeBytes,
          status: 'completed',
          triggered_by: triggered_by ?? 'manual',
          notes: notes ?? `${productsCount} products, ${ordersCount} orders`,
        });
        insertError = error;
      }

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({
          success: true,
          message: existing ? 'Backup updated for today' : 'Backup created',
          record_count: recordCount,
          size_bytes: sizeBytes,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Backup error:', err);
    return new Response(JSON.stringify({ error: err?.message ?? 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
