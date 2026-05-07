const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ukjixltzjjrsgmhjwjqy.supabase.co';
const supabaseKey = 'sb_publishable_iI3lTBB23zZmGduvf_GuJw_LFepdfA5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
  // Check if pedidos table exists and we can select from it
  const { data, error } = await supabase.from('pedidos').select('*').limit(1);
  console.log("Pedidos error:", error);
  console.log("Pedidos data:", data);
}

checkAdmin();
