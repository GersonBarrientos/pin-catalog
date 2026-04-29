const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:S%25%23%2Fybsf2444@db.ukjixltzjjrsgmhjwjqy.supabase.co:5432/postgres';

async function applySql() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Conectado a la base de datos de Supabase.');

    const sqlPath = path.join(__dirname, 'update.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando update.sql...');
    await client.query(sql);
    console.log('SQL ejecutado correctamente. Base de datos actualizada con la arquitectura de Pedidos.');

  } catch (error) {
    console.error('Error aplicando SQL:', error);
  } finally {
    await client.end();
  }
}

applySql();
