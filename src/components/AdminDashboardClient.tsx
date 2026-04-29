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
    // Actualizar estado en DB
    await supabase
      .from('pedidos')
      .update({ estado: newStatus })
      .eq('id', pedidoId);
      
    // Si se cancela, debemos devolver el stock al inventario
    if (newStatus === 'cancelado' && items) {
       for (const item of items) {
          // Leer el inventario actual
          const { data: inv } = await supabase.from('inventario').select('stock_disponible').eq('uuid', item.uuid).single();
          if (inv) {
              await supabase.from('inventario').update({
                  stock_disponible: inv.stock_disponible + item.cantidad,
                  estado: 'disponible' // Si estaba agotado, ahora hay 1
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
    <div className="min-h-screen bg-slate-900 p-8">
      <header className="mb-8 flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
          <p className="text-slate-400 mt-1">Gestiona los pedidos y el inventario.</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-slate-700"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </header>

      <nav className="flex gap-4 mb-8 border-b border-slate-800 pb-4">
        <button 
          onClick={() => setActiveTab('pedidos')} 
          className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'pedidos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Gestión de Pedidos
        </button>
        <button 
          onClick={() => setActiveTab('catalogo')} 
          className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'catalogo' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Inventario (Catálogo)
        </button>
      </nav>

      {activeTab === 'pedidos' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border-amber-500/20 bg-amber-500/5">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Pedidos Pendientes</h3>
          <p className="text-4xl font-black text-amber-400">{pedidosPendientes.length}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-emerald-500/20 bg-emerald-500/5">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Ventas Completadas</h3>
          <p className="text-4xl font-black text-emerald-400">{pedidosCompletados.length}</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-8 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Package className="text-blue-400" />
          Pedidos Recientes
        </h2>
        
        {pedidosPendientes.length === 0 ? (
          <div className="text-slate-500 text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
            No hay pedidos pendientes.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pedidosPendientes.map(pedido => (
              <div key={pedido.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <User size={16} className="text-blue-400" /> {pedido.cliente_nombre}
                    </h3>
                    <p className="text-slate-400 flex items-center gap-2 mt-1">
                       <Phone size={14} /> {pedido.cliente_telefono}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-black text-xl">${pedido.total}</span>
                    <p className="text-xs text-slate-500 mt-1">{new Date(pedido.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-6 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase">Productos Solicitados:</h4>
                  {pedido.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-200 text-sm bg-slate-900/50 p-2 rounded">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span>${item.precio}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto flex gap-3">
                  <button 
                    onClick={() => handleUpdate(pedido.id, 'completado')}
                    className="flex-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                    title="Marcar como entregado y pagado"
                  >
                    <Check size={18} /> Pago Confirmado
                  </button>
                  <button 
                    onClick={() => handleUpdate(pedido.id, 'cancelado', pedido.items)}
                    className="flex-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                    title="Cancelar pedido y devolver al inventario"
                  >
                    <X size={18} /> Cancelar y Devolver
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
