const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ukjixltzjjrsgmhjwjqy.supabase.co';
const supabaseKey = 'sb_publishable_iI3lTBB23zZmGduvf_GuJw_LFepdfA5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runStressTest() {
  console.log("Iniciando prueba de estrés extrema (100 compras simultáneas)...");
  
  // 1. Buscamos un pin disponible para la prueba
  const { data: inv, error: invErr } = await supabase.from('inventario').select('*').eq('estado', 'disponible').gt('stock_disponible', 0).limit(1);
  
  if (invErr || !inv || inv.length === 0) {
    console.log("No se encontraron pines con stock para romper el sistema.");
    return;
  }
  
  const pin = inv[0];
  const stockInicial = pin.stock_disponible;
  console.log(`Objetivo: ${pin.nombre} (ID: ${pin.uuid})`);
  console.log(`Stock Actual en Base de Datos: ${stockInicial} unidades.`);
  console.log(`ATACANDO: Enviando 50 peticiones de compra EXACTAMENTE al mismo milisegundo para intentar causar 'Race Conditions'...`);

  const itemsParaDB = [{
    uuid: pin.uuid,
    nombre: pin.nombre,
    precio: pin.precio,
    cantidad: 1
  }];

  // 2. Disparamos 50 compras concurrentes
  const promises = [];
  for (let i = 0; i < 50; i++) {
    promises.push(
      supabase.rpc('crear_pedido', {
        p_cliente_nombre: `Bot Tester #${i}`,
        p_cliente_telefono: `555000${i}`,
        p_items: itemsParaDB,
        p_total: pin.precio
      })
    );
  }

  // Ejecutar todas al mismo tiempo
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
  console.log(`RESULTADOS DEL ESTRÉS MASIVO:`);
  console.log(`Peticiones exitosas (Pedidos creados): ${successful}`);
  console.log(`Peticiones fallidas (Rechazadas por seguridad): ${failed}`);
  console.log(`Errores capturados por el sistema:`, errors);

  // 3. Verificamos cómo quedó la base de datos después del ataque
  const { data: postInv } = await supabase.from('inventario').select('stock_disponible, estado').eq('uuid', pin.uuid).single();
  
  console.log("=========================================");
  console.log(`ESTADO FINAL DEL PRODUCTO EN LA BASE DE DATOS:`);
  console.log(`Stock Esperado: ${Math.max(0, stockInicial - 50)} o ${Math.max(0, stockInicial - successful)}`);
  console.log(`Stock Real que sobrevivió: ${postInv.stock_disponible}`);
  console.log(`Estado Final: ${postInv.estado}`);
  
  if (postInv.stock_disponible < 0) {
    console.log("🚨 ¡ALERTA ROJA! EL SISTEMA SE ROMPIÓ. EL STOCK ES NEGATIVO.");
  } else if (successful > stockInicial) {
    console.log("🚨 ¡ALERTA ROJA! EL SISTEMA VENDIÓ MÁS DE LO QUE TENÍA.");
  } else {
    console.log("✅ ¡SISTEMA BLINDADO! La base de datos resistió el ataque masivo sin vender stock fantasma.");
  }
}

runStressTest();
