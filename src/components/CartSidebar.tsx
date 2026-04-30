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
      
      // Usamos window.location.href en lugar de window.open para evitar que los 
      // navegadores móviles bloqueen la ventana emergente tras una llamada asíncrona (await)
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
        className="relative p-3 bg-white hover:bg-gray-50 rounded-full transition-colors border border-gray-200 shadow-sm"
      >
        <ShoppingCart className="text-gray-700" size={24} />
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

      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <ShoppingCart size={20} className="text-rose-500" />
            Tu Pedido
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-400 my-auto">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.uuid} className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="w-16 h-16 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
                  {item.image_url && <img src={item.image_url} alt={item.nombre} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm line-clamp-1 text-gray-900">{item.nombre}</h4>
                  <p className="text-gray-900 font-bold">${item.precio}</p>
                </div>
                <button 
                  onClick={() => removeItem(item.uuid)}
                  className="text-gray-400 hover:text-rose-500 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm">
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
                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none text-sm transition-all"
              />
              <input 
                type="tel" 
                placeholder="Tu Teléfono" 
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none text-sm transition-all"
              />
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 font-medium">Total a pagar:</span>
            <span className="text-2xl font-black text-gray-900">${total}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || isProcessing}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              items.length > 0 && !isProcessing
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
