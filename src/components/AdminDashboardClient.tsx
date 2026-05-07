"use client";

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, LogOut, Package, User, Phone } from 'lucide-react';

interface Pedido {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  items: { uuid: string; nombre: string; precio: number; cantidad: number }[];
  total: number;
  estado: 'pendiente' | 'completado' | 'cancelado';
  created_at: string;
}

import { PinItem } from '@/store/useStore';
import AdminCatalogManager from './AdminCatalogManager';

export default function AdminDashboardClient({ initialPedidos, initialPins }: { initialPedidos: Pedido[], initialPins: PinItem[] }) {
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos);
  const [activeTab, setActiveTab] = useState<'pedidos' | 'catalogo'>('pedidos');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel('admin-pedidos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setPedidos(current => current.map(p => p.id === payload.new.id ? payload.new as Pedido : p));
        } else if (payload.eventType === 'INSERT') {
          setPedidos(current => [payload.new as Pedido, ...current]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const pedidosCompletados = pedidos.filter(p => p.estado === 'completado');

  const handleUpdate = async (pedidoId: string, newStatus: 'completado' | 'cancelado', items?: Pedido['items']) => {
    await supabase.from('pedidos').update({ estado: newStatus }).eq('id', pedidoId);
      
    if (newStatus === 'cancelado' && items) {
       for (const item of items) {
          const { data: inv } = await supabase.from('inventario').select('stock_disponible').eq('uuid', item.uuid).single();
          if (inv) {
              await supabase.from('inventario').update({
                  stock_disponible: inv.stock_disponible + item.cantidad,
                  estado: 'disponible'
              }).eq('uuid', item.uuid);
          }
       }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center glass-panel p-6 rounded-3xl border border-teal-100 shadow-md">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <img src="/logo.png" alt="PinArt Logo" className="h-16 w-16 object-contain rounded-full shadow-sm bg-white" />
          <div>
            <h1 className="text-3xl font-extrabold text-teal-800">Panel PinArt</h1>
            <p className="text-teal-600/80 mt-1 font-medium">Administración de Boutique</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-rose-50 rounded-xl text-rose-500 font-bold transition-all border border-rose-100 shadow-sm"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </header>

      <nav className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('pedidos')} 
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'pedidos' ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-500/30' : 'bg-white/60 text-slate-500 hover:bg-white hover:text-teal-600 shadow-sm'}`}
        >
          Órdenes y Pedidos
        </button>
        <button 
          onClick={() => setActiveTab('catalogo')} 
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'catalogo' ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-500/30' : 'bg-white/60 text-slate-500 hover:bg-white hover:text-teal-600 shadow-sm'}`}
        >
          Catálogo de Pines
        </button>
      </nav>

      {activeTab === 'pedidos' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-6 border-l-4 border-l-amber-400 flex flex-col">
              <h3 className="text-amber-600 text-sm font-bold uppercase tracking-wider mb-2">Pedidos Pendientes</h3>
              <p className="text-5xl font-black text-amber-500">{pedidosPendientes.length}</p>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-emerald-400 flex flex-col">
              <h3 className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-2">Ventas Completadas</h3>
              <p className="text-5xl font-black text-emerald-500">{pedidosCompletados.length}</p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-teal-100 shadow-md">
            <h2 className="text-2xl font-bold text-teal-800 mb-6 flex items-center gap-3">
              <Package className="text-teal-500" />
              Pedidos Recientes
            </h2>
            
            {pedidosPendientes.length === 0 ? (
              <div className="text-slate-400 text-center py-16 border-2 border-dashed border-teal-100 rounded-2xl font-medium text-lg bg-white/40">
                No hay pedidos pendientes. ¡A esperar clientes!
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pedidosPendientes.map(pedido => (
                  <div key={pedido.id} className="bg-white border border-teal-50 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-5 border-b border-teal-50 pb-5">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                           <User size={18} className="text-teal-400" /> {pedido.cliente_nombre}
                        </h3>
                        <p className="text-slate-500 flex items-center gap-2 mt-2 font-medium">
                           <Phone size={16} className="text-slate-400" /> {pedido.cliente_telefono}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-teal-500 font-black text-2xl">${pedido.total}</span>
                        <p className="text-xs text-slate-400 mt-2 font-medium">{new Date(pedido.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mb-6 flex-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Productos Solicitados:</h4>
                      <div className="space-y-2">
                        {pedido.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                            <span>{item.cantidad}x {item.nombre}</span>
                            <span className="font-bold text-teal-600">${item.precio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-auto flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => handleUpdate(pedido.id, 'completado')}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                        title="Marcar como entregado y pagado"
                      >
                        <Check size={18} /> Confirmar Pago
                      </button>
                      <button 
                        onClick={() => handleUpdate(pedido.id, 'cancelado', pedido.items)}
                        className="flex-1 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-200 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                        title="Cancelar pedido y devolver al inventario"
                      >
                        <X size={18} /> Cancelar Orden
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <AdminCatalogManager initialPins={initialPins} />
      )}
    </div>
  );
}
