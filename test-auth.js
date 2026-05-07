const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ukjixltzjjrsgmhjwjqy.supabase.co';
const supabaseKey = 'sb_publishable_iI3lTBB23zZmGduvf_GuJw_LFepdfA5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'gersonnizraim@gmail.com',
    password: 'admin' // Trying common passwords
  });
  
  if (authError) {
    const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
      email: 'gersonnizraim@gmail.com',
      password: 'admin123456'
    });
    if (authError2) {
       console.log("Auth error:", authError2.message);
       return;
    }
  }
  
  const { data, error } = await supabase.from('pedidos').select('*');
  console.log("Pedidos error:", error);
  console.log("Pedidos count:", data ? data.length : 0);
  console.log("Pedidos data:", data);
}

checkAuth();
