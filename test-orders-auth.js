const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ukjixltzjjrsgmhjwjqy.supabase.co';
const supabaseAnonKey = 'sb_publishable_iI3lTBB23zZmGduvf_GuJw_LFepdfA5';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  console.log("1. Creando usuario temporal para tener auth.role() = 'authenticated'...");
  const tempEmail = `test${Date.now()}@test.com`;
  
  // Register
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: tempEmail,
    password: 'password123'
  });
  
  if (signUpError) {
    console.error("SignUp Error:", signUpError.message);
  } else {
    console.log("User created:", signUpData.user.id);
  }
  
  console.log("2. Consultando pedidos...");
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select('*');
    
  if (pedidosError) {
    console.error("Fetch Error:", pedidosError.message);
  } else {
    console.log("Pedidos totales:", pedidos.length);
    const countByEstado = pedidos.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {});
    console.log("Estados:", countByEstado);
    
    // Print the names of the recent orders to match user's screenshot
    console.log("Nombres recientes:", pedidos.slice(0, 10).map(p => p.cliente_nombre).join(', '));
  }
  
  console.log("3. Consultando inventario...");
  const { data: inv } = await supabase.from('inventario').select('nombre, stock_disponible');
  console.log("Inventario sample:", inv?.slice(0, 3));
}

testFetch();
