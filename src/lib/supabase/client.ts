import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Manejo de fallback para entorno de desarrollo sin variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';
  if (supabaseUrl.includes('placeholder') || supabaseAnonKey === 'placeholder_key') {
    console.warn('[Supabase] Variables de entorno faltantes o con valores por defecto. Revisa .env.local');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
