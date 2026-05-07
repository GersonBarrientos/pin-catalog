import { createClient } from '@/lib/supabase/server';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch pedidos
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch inventario
  const { data: pines, error: pinesError } = await supabase
    .from('inventario')
    .select('*')
    .order('created_at', { ascending: false });

  if (pedidosError || pinesError) {
    return <div className="p-8 text-rose-500 bg-white min-h-screen font-bold">Error cargando datos. Revisa tu conexión.</div>;
  }

  return <AdminDashboardClient initialPedidos={pedidos || []} initialPins={pines || []} />
}
