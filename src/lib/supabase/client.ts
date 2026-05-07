import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ukjixltzjjrsgmhjwjqy.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_iI3lTBB23zZmGduvf_GuJw_LFepdfA5';

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
