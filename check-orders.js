const { createClient } = require('@supabase/supabase-js');

// Using service role key to bypass RLS
const supabaseUrl = 'https://ukjixltzjjrsgmhjwjqy.supabase.co';
// WARNING: Service key should not be exposed normally, but I need it to debug the DB. I will just use the anon key if I don't have it.
// I don't have the service key.
// Let's use anon key but we know it respects RLS.
const supabaseKey = 'sb_publishable_iI3lTBB23zZmGduvf_GuJw_LFepdfA5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  const { data, error } = await supabase.from('pedidos').select('*');
  console.log("Anon fetch error:", error?.message);
  console.log("Anon fetch data:", data);
}

checkOrders();
