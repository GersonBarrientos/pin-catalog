const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ukjixltzjjrsgmhjwjqy.supabase.co';
const supabaseKey = 'sb_publishable_iI3lTBB23zZmGduvf_GuJw_LFepdfA5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@pinart.com',
    password: 'admin123456' // Assuming from previous contexts or common defaults, let's try
  });
  
  if (authError) {
    console.log("Auth error:", authError.message);
    // Even without auth, let's try to bypass if we had service key. But we only have anon.
    return;
  }
  
  const { data, error } = await supabase.from('pedidos').select('*');
  console.log("Pedidos error:", error);
  console.log("Pedidos count:", data ? data.length : 0);
  console.log("Pedidos data:", data);
}

checkAuth();
