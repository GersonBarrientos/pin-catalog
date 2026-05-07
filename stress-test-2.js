const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ukjixltzjjrsgmhjwjqy.supabase.co';
const supabaseKey = 'sb_publishable_iI3lTBB23zZmGduvf_GuJw_LFepdfA5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addStockAndTest() {
  console.log("Preparando el entorno...");
  
  // Agregar stock a un pin
  const { data: invList } = await supabase.from('inventario').select('*').limit(1);
  const pin = invList[0];
  
  console.log(`Inyectando 20 unidades de stock artificial a: ${pin.nombre}`);
  await supabase.from('inventario').update({ stock_disponible: 20, estado: 'disponible' }).eq('uuid', pin.uuid);
  
  console.log("ATACANDO CON 150 COMPRAS SIMULTÁNEAS EN EL MISMO MILISEGUNDO...");

  const itemsParaDB = [{
    uuid: pin.uuid,
    nombre: pin.nombre,
    precio: pin.precio,
    cantidad: 1
  }];

  const promises = [];
  for (let i = 0; i < 150; i++) {
    promises.push(
      supabase.rpc('crear_pedido', {
        p_cliente_nombre: `Bot Masivo #${i}`,
        p_cliente_telefono: `000000${i}`,
        p_items: itemsParaDB,
        p_total: pin.precio
      })
    );
  }

  const results = await Promise.allSettled(promises);
  
  let successful = 0;
  let failed = 0;
  let errors = {};

  results.forEach(res => {
    if (res.status === 'fulfilled' && !res.value.error) {
      successful++;
    } else {
      failed++;
      const errMessage = res.status === 'fulfilled' ? res.value.error.message : res.reason.message;
      errors[errMessage] = (errors[errMessage] || 0) + 1;
    }
  });

  console.log("=========================================");
  console.log(`RESULTADOS DEL ESTRÉS MASIVO FASE 2:`);
  console.log(`Peticiones exitosas (Pedidos creados reales): ${successful}`);
  console.log(`Peticiones fallidas (Rechazadas por la barrera atómica): ${failed}`);
  console.log(`Errores reportados:`, Object.keys(errors).map(k => `${k} (${errors[k]} veces)`).join(', '));

  const { data: postInv } = await supabase.from('inventario').select('stock_disponible, estado').eq('uuid', pin.uuid).single();
  
  console.log("=========================================");
  console.log(`ESTADO FINAL:`);
  console.log(`Stock Real que sobrevivió: ${postInv.stock_disponible}`);
  console.log(`Estado Final: ${postInv.estado}`);
}

addStockAndTest();
