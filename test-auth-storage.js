const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient('https://ukjixltzjjrsgmhjwjqy.supabase.co', 'sb_publishable_iI3lTBB23zZmGduvf_GuJw_LFepdfA5');

async function test() {
  console.log("Logging in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'gersonnizraim@gmail.com',
    password: 'Germiz2006'
  });
  
  if (authError) {
    console.error("Login failed:", authError);
    return;
  }
  
  console.log("Logged in as:", authData.user.email);

  const file = fs.readFileSync('dummy.txt');
  
  console.log("Uploading file as authenticated user...");
  const { data, error } = await supabase.storage.from('pines-images').upload('test-auth-' + Date.now() + '.txt', file);
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
