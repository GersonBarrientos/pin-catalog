"use client";

import { useCartStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase/client';
import { ShoppingCart, X, Trash2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, clearCart, setIsOpen } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Datos del cliente
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');

  const total = items.reduce((sum, item) => sum + item.precio, 0);
  const supabase = createClient();

  const WHATSAPP_NUMBER = "50370425319"; 

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!clienteNombre.trim() || !clienteTelefono.trim()) {
      setError('Por favor, ingresa tu nombre y teléfono.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);

    // Formateamos los items para la base de datos
    const itemsParaDB = items.map(item => ({
      uuid: item.uuid,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: 1 // Por defecto 1 según lógica actual
    }));

    try {
      // Llamamos a la nueva función RPC
      const { data, error: rpcError } = await supabase.rpc('crear_pedido', {
        p_cliente_nombre: clienteNombre,
        p_cliente_telefono: clienteTelefono,
        p_items: itemsParaDB,
        p_total: total
      });

      if (rpcError) {
        throw new Error(rpcError.message || 'Error al procesar el pedido. Verifica el stock.');
      }

      // Mensaje enriquecido con el nombre del cliente
      const itemList = items.map(i => `- ${i.nombre} ($${i.precio})`).join('%0A');
      const text = `¡Hola! Soy *${clienteNombre}* y quiero confirmar mi pedido:%0A%0A${itemList}%0A%0A*Total: $${total}*%0AMi teléfono es: ${clienteTelefono}%0A%0APor favor envíame los detalles de pago.`;
      
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
      
      clearCart();
      setIsOpen(false);
      setClienteNombre('');
      setClienteTelefono('');
      
      window.open(waUrl, '_blank');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al confirmar la reserva.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button 
        onClick={toggleCart}
        className="relative p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors border border-slate-700"
      >
        <ShoppingCart className="text-slate-200" size={24} />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 glass-panel z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col bg-slate-900/95`}>
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-400" />
            Tu Pedido
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="text-center text-slate-500 my-auto">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.uuid} className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="w-16 h-16 rounded-lg bg-slate-700 flex-shrink-0 overflow-hidden">
                  {item.image_url && <img src={item.image_url} alt={item.nombre} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm line-clamp-1 text-slate-200">{item.nombre}</h4>
                  <p className="text-emerald-400 font-bold">${item.precio}</p>
                </div>
                <button 
                  onClick={() => removeItem(item.uuid)}
                  className="text-slate-500 hover:text-rose-400 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
              {error}
            </div>
          )}
          
          {items.length > 0 && (
            <div className="mb-6 flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Tu Nombre" 
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none text-sm"
              />
              <input 
                type="tel" 
                placeholder="Tu Teléfono" 
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-400">Total a pagar:</span>
            <span className="text-2xl font-black text-white">${total}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || isProcessing}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              items.length > 0 && !isProcessing
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 shadow-lg shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Hacer Pedido (WhatsApp)
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
