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
      const itemList = items.map(i => `- ${i.nombre} ($${i.precio})`).join('\n');
      const textRaw = `¡Hola! Soy *${clienteNombre}* y quiero confirmar mi pedido:\n\n${itemList}\n\n*Total: $${total}*\nMi teléfono es: ${clienteTelefono}\n\nPor favor envíame los detalles de pago.`;
      
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textRaw)}`;
      
      clearCart();
      setIsOpen(false);
      setClienteNombre('');
      setClienteTelefono('');
      
      window.location.href = waUrl;

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
        className="relative p-3 bg-white hover:bg-teal-50 rounded-full transition-all border border-teal-100 shadow-sm hover:shadow-md hover:scale-105 group"
      >
        <ShoppingCart className="text-teal-700 group-hover:text-teal-600 transition-colors" size={26} />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-teal-100 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        <div className="p-6 border-b border-teal-100 flex justify-between items-center bg-teal-50/50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-teal-800">
            <ShoppingCart size={22} className="text-teal-500" />
            Tu Pedido
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="text-center text-slate-400 my-auto">
              <ShoppingCart size={56} className="mx-auto mb-4 opacity-30 text-teal-200" />
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-sm mt-2 opacity-70">¡Agrega algunos pines hermosos!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.uuid} className="flex gap-4 p-4 rounded-2xl bg-white border border-teal-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-xl bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100">
                  {item.image_url && <img src={item.image_url} alt={item.nombre} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm line-clamp-1 text-slate-800">{item.nombre}</h4>
                  <p className="text-teal-600 font-black mt-1">${item.precio}</p>
                </div>
                <button 
                  onClick={() => removeItem(item.uuid)}
                  className="text-slate-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all h-fit"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-teal-100 bg-teal-50/50">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
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
                className="w-full bg-white border border-teal-100 rounded-xl p-3.5 text-slate-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none text-sm transition-all shadow-sm placeholder:text-slate-400"
              />
              <input 
                type="tel" 
                placeholder="Tu Teléfono" 
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                className="w-full bg-white border border-teal-100 rounded-xl p-3.5 text-slate-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none text-sm transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>
          )}

          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-teal-100 shadow-sm">
            <span className="text-slate-500 font-bold">Total a pagar:</span>
            <span className="text-2xl font-black text-teal-700">${total}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || isProcessing}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
              items.length > 0 && !isProcessing
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white shadow-teal-500/30 hover:scale-[1.02]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
            }`}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
