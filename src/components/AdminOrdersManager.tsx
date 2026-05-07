"use client";

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Check, X, Eye, Download, Send, Loader } from 'lucide-react';
import { downloadInvoicePDF, sendInvoiceViaWhatsApp } from '@/lib/invoice-generator';

interface PedidoDetailed {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  items: Array<{
    uuid: string;
    nombre: string;
    precio: number;
    cantidad: number;
    imageUrl?: string;
  }>;
  total: number;
  estado: 'pendiente' | 'completado' | 'cancelado';
  created_at: string;
}

interface AdminOrdersManagerProps {
  initialPedidos: any[];
  pins: any[];
}

export default function AdminOrdersManager({ initialPedidos, pins }: AdminOrdersManagerProps) {
  const [pedidos, setPedidos] = useState<PedidoDetailed[]>(
    initialPedidos.map((p: any) => ({
      ...p,
      items: (p.items || []).map((item: any) => {
        const pin = pins.find(pin => pin.uuid === item.uuid);
        return {
          ...item,
          imageUrl: pin?.image_url,
        };
      }),
    }))
  );

  const [selectedPedido, setSelectedPedido] = useState<PedidoDetailed | null>(null);
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: string }>({});
  const supabase = createClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-pedidos-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setPedidos(current =>
            current.map(p =>
              p.id === payload.new.id ? { ...payload.new as PedidoDetailed, items: enrichItems(payload.new.items) } : p
            )
          );
        } else if (payload.eventType === 'INSERT') {
          const newPedido = { ...payload.new as PedidoDetailed, items: enrichItems(payload.new.items) };
          setPedidos(current => [newPedido, ...current]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const enrichItems = (items: any[]) => {
    return (items || []).map((item: any) => {
      const pin = pins.find(pin => pin.uuid === item.uuid);
      return {
        ...item,
        imageUrl: pin?.image_url,
      };
    });
  };

  const handleUpdateStatus = async (pedidoId: string, newStatus: 'completado' | 'cancelado', items?: any) => {
    setLoadingActions(prev => ({ ...prev, [pedidoId]: newStatus }));
    try {
      await supabase
        .from('pedidos')
        .update({ estado: newStatus })
        .eq('id', pedidoId);

      // Si se cancela, devolver stock al inventario
      if (newStatus === 'cancelado' && items) {
        for (const item of items) {
          const { data: inv } = await supabase.from('inventario').select('stock_disponible').eq('uuid', item.uuid).single();
          if (inv) {
            await supabase.from('inventario').update({
              stock_disponible: inv.stock_disponible + (item.cantidad || 1),
              estado: 'disponible',
            }).eq('uuid', item.uuid);
          }
        }
      }
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[pedidoId];
        return newState;
      });
    }
  };

  const handleDownloadInvoice = async (pedido: PedidoDetailed) => {
    try {
      await downloadInvoicePDF({
        pedidoId: pedido.id,
        clienteName: pedido.cliente_nombre,
        clientePhone: pedido.cliente_telefono,
        items: pedido.items,
        total: pedido.total,
        fecha: pedido.created_at,
        numeroFactura: pedido.id.substring(0, 8).toUpperCase(),
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar la factura');
    }
  };

  const handleSendInvoiceWhatsApp = async (pedido: PedidoDetailed) => {
    try {
      await sendInvoiceViaWhatsApp(
        {
          pedidoId: pedido.id,
          clienteName: pedido.cliente_nombre,
          clientePhone: pedido.cliente_telefono,
          items: pedido.items,
          total: pedido.total,
          fecha: pedido.created_at,
          numeroFactura: pedido.id.substring(0, 8).toUpperCase(),
        },
        pedido.cliente_telefono
      );
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
    }
  };

  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const pedidosCompletados = pedidos.filter(p => p.estado === 'completado');

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border-amber-500/20 bg-amber-500/5">
          <p className="text-amber-400 text-sm font-semibold">Órdenes Pendientes</p>
          <p className="text-3xl font-black text-amber-400 mt-1">{pedidosPendientes.length}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border-emerald-500/20 bg-emerald-500/5">
          <p className="text-emerald-400 text-sm font-semibold">Órdenes Completadas</p>
          <p className="text-3xl font-black text-emerald-400 mt-1">{pedidosCompletados.length}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border-blue-500/20 bg-blue-500/5">
          <p className="text-blue-400 text-sm font-semibold">Total de Órdenes</p>
          <p className="text-3xl font-black text-blue-400 mt-1">{pedidos.length}</p>
        </div>
      </div>

      {/* Órdenes Pendientes */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Órdenes Pendientes ({pedidosPendientes.length})</h3>

        {pedidosPendientes.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl text-center border-2 border-dashed border-slate-700">
            <p className="text-slate-400">No hay órdenes pendientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pedidosPendientes.map(pedido => (
              <div key={pedido.id} className="glass-panel p-6 rounded-xl border border-slate-700 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-700">
                  <div>
                    <h4 className="text-lg font-bold text-white">{pedido.cliente_nombre}</h4>
                    <p className="text-slate-400 text-sm mt-1">📞 {pedido.cliente_telefono}</p>
                    <p className="text-slate-500 text-xs mt-1">{new Date(pedido.created_at).toLocaleString()}</p>
                  </div>
                  <p className="text-emerald-400 font-black text-xl">${pedido.total.toFixed(2)}</p>
                </div>

                {/* Items con imágenes */}
                <div className="mb-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-400 uppercase">Productos:</p>
                  {pedido.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-slate-800/50 p-3 rounded-lg">
                      {item.imageUrl && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.imageUrl} alt={item.nombre} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{item.nombre}</p>
                        <p className="text-slate-400 text-xs">{item.cantidad}x @ ${item.precio.toFixed(2)}</p>
                      </div>
                      <p className="text-emerald-400 font-bold text-sm flex-shrink-0">${(item.cantidad * item.precio).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(pedido.id, 'completado')}
                      disabled={!!loadingActions[pedido.id]}
                      className="flex-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {loadingActions[pedido.id] === 'completado' ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      Completar
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(pedido.id, 'cancelado', pedido.items)}
                      disabled={!!loadingActions[pedido.id]}
                      className="flex-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {loadingActions[pedido.id] === 'cancelado' ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <X size={16} />
                      )}
                      Cancelar
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadInvoice(pedido)}
                      className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm"
                    >
                      <Download size={14} /> PDF
                    </button>
                    <button
                      onClick={() => handleSendInvoiceWhatsApp(pedido)}
                      className="flex-1 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white border border-green-500/30 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm"
                    >
                      <Send size={14} /> WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Órdenes Completadas */}
      {pedidosCompletados.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Órdenes Completadas ({pedidosCompletados.length})</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pedidosCompletados.slice(0, 6).map(pedido => (
              <div key={pedido.id} className="glass-panel p-4 rounded-xl border border-slate-700 bg-slate-800/30">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{pedido.cliente_nombre}</h4>
                    <p className="text-slate-500 text-xs">{new Date(pedido.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">${pedido.total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleDownloadInvoice(pedido)}
                    className="flex-1 text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-1 rounded flex items-center justify-center gap-1"
                  >
                    <Download size={12} /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
