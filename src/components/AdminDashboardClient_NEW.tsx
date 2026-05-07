"use client";

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, BarChart3, Package, Users, TrendingUp, Settings
} from 'lucide-react';

import { PinItem } from '@/store/useStore';
import AdminOrdersManager from './AdminOrdersManager';
import AdminStats from './AdminStats';
import AdminCatalogManager from './AdminCatalogManager';

type Tab = 'pedidos' | 'catalogo' | 'estadisticas' | 'clientes';

interface AdminDashboardClientProps {
  initialPedidos: any[];
  initialPins: PinItem[];
}

export default function AdminDashboardClient({ initialPedidos, initialPins }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('pedidos');
  const [pedidos, setPedidos] = useState(initialPedidos);
  const [pins, setPins] = useState(initialPins);
  const [userEmail, setUserEmail] = useState<string>('');
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Obtener email del usuario autenticado
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, [supabase]);

  // Realtime - Pedidos
  useEffect(() => {
    let isSubscribed = true;

    const setupSubscription = async () => {
      const channel = supabase
        .channel('dashboard-pedidos')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
          if (isSubscribed) {
            if (payload.eventType === 'UPDATE') {
              setPedidos(current => current.map(p => p.id === payload.new.id ? payload.new : p));
            } else if (payload.eventType === 'INSERT') {
              setPedidos(current => [payload.new, ...current]);
            }
          }
        })
        .subscribe();

      return channel;
    };

    let channel: any;
    setupSubscription().then(ch => { channel = ch; });

    return () => {
      isSubscribed = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Realtime - Inventario
  useEffect(() => {
    let isSubscribed = true;

    const setupSubscription = async () => {
      const channel = supabase
        .channel('dashboard-inventario')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventario' }, (payload) => {
          if (isSubscribed) {
            if (payload.eventType === 'UPDATE') {
              setPins(current => current.map(p => p.uuid === payload.new.uuid ? (payload.new as PinItem) : p));
            } else if (payload.eventType === 'INSERT') {
              setPins(current => [(payload.new as PinItem), ...current]);
            } else if (payload.eventType === 'DELETE') {
              setPins(current => current.filter(p => p.uuid !== payload.old.uuid));
            }
          }
        })
        .subscribe();

      return channel;
    };

    let channel: any;
    setupSubscription().then(ch => { channel = ch; });

    return () => {
      isSubscribed = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const tabs = [
    { id: 'pedidos' as Tab, label: 'Órdenes', icon: Package },
    { id: 'estadisticas' as Tab, label: 'Estadísticas', icon: BarChart3 },
    { id: 'catalogo' as Tab, label: 'Inventario', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-slate-400 mt-2">Bienvenido a PinArt • Gestión de Negocio</p>
            {userEmail && (
              <p className="text-slate-500 text-sm mt-1">📧 {userEmail}</p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-rose-500/25"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="mb-8 flex gap-2 md:gap-4 overflow-x-auto pb-4 md:pb-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <main className="animate-in fade-in duration-300">
        {activeTab === 'pedidos' && (
          <AdminOrdersManager initialPedidos={pedidos} pins={pins} />
        )}

        {activeTab === 'estadisticas' && (
          <AdminStats pedidos={pedidos} pins={pins} />
        )}

        {activeTab === 'catalogo' && (
          <AdminCatalogManager initialPins={pins} />
        )}
      </main>

      {/* Footer Info */}
      <footer className="mt-12 pt-8 border-t border-slate-700/50 text-center text-slate-500 text-sm">
        <p>PinArt © {new Date().getFullYear()} • Sistema de Gestión de Negocio</p>
        <p className="mt-2 text-xs">Última actualización: {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}
