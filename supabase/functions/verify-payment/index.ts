import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MONNIFY_BASE_URL = Deno.env.get('MONNIFY_BASE_URL') ?? 'https://api.monnify.com';

async function getMonnifyAccessToken(): Promise<string> {
  const apiKey = Deno.env.get('MONNIFY_API_KEY')!;
  const secretKey = Deno.env.get('MONNIFY_SECRET_KEY')!;
  const credentials = btoa(`${apiKey}:${secretKey}`);

  const res = await fetch(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}` },
  });
  const data = await res.json();
  if (!data.requestSuccessful) throw new Error('Could not authenticate with Monnify');
  return data.responseBody.accessToken;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transaction_reference, verification_id } = await req.json();
    if (!transaction_reference || !verification_id) {
      return new Response(JSON.stringify({ error: 'Missing transaction_reference or verification_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = await getMonnifyAccessToken();

    const statusRes = await fetch(
      `${MONNIFY_BASE_URL}/api/v2/transactions/${encodeURIComponent(transaction_reference)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const statusData = await statusRes.json();

    if (!statusData.requestSuccessful || statusData.responseBody?.paymentStatus !== 'PAID') {
      return new Response(JSON.stringify({ error: 'Payment not verified' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const amountPaid = statusData.responseBody.amountPaid;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabase
      .from('business_verifications')
      .update({
        payment_status: 'paid',
        payment_reference: transaction_reference,
        amount_paid: amountPaid,
      })
      .eq('id', verification_id)
      .eq('payment_status', 'unpaid');

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
