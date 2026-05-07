"use client";

import { useCartStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase/client';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CheckoutForm from './CheckoutForm';

export default function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, clearCart, setIsOpen } = useCartStore();
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.precio, 0);
  const supabase = createClient();

  const handleCheckoutSuccess = async (method: 'whatsapp' | 'wompi') => {
    // Aquí se crea el pedido cuando el usuario confirma el pago
    // Este código se puede mover al servidor para más seguridad
    clearCart();
    setIsOpen(false);
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
            <CheckoutForm 
              total={total} 
              items={items.map(item => ({
                nombre: item.nombre,
                cantidad: 1,
                precio: item.precio
              }))}
              onSuccess={handleCheckoutSuccess}
            />
          )}

          {items.length === 0 && (
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-lg bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </>
  );
}
