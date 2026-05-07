const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ukjixltzjjrsgmhjwjqy.supabase.co';
const supabaseKey = 'sb_publishable_iI3lTBB23zZmGduvf_GuJw_LFepdfA5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRPC() {
  console.log("Fetching inventario...");
  const { data: inv, error: invErr } = await supabase.from('inventario').select('*').eq('estado', 'disponible').limit(1);
  if (invErr || !inv || inv.length === 0) {
    console.log("No pins found or error:", invErr);
    return;
  }
  
  const pin = inv[0];
  console.log("Pin to buy:", pin.nombre, pin.uuid);
  
  const itemsParaDB = [{
    uuid: pin.uuid,
    nombre: pin.nombre,
    precio: pin.precio,
    cantidad: 1
  }];

  console.log("Calling RPC...");
  const { data, error } = await supabase.rpc('crear_pedido', {
    p_cliente_nombre: 'Test User',
    p_cliente_telefono: '12345678',
    p_items: itemsParaDB,
    p_total: pin.precio
  });
  
  console.log("RPC result data:", data);
  console.log("RPC result error:", error);
}

testRPC();
