"use client";

import { useModalStore, useCartStore } from '@/store/useStore';
import { X, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';

export default function PinModal() {
  const { selectedPin, closeModal } = useModalStore();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  if (!selectedPin) return null;

  const isAvailable = selectedPin.estado === 'disponible' && selectedPin.stock_disponible > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 animate-in fade-in zoom-in duration-300">
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 z-20 backdrop-blur-md transition-colors shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Image Area */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-50 relative">
          {selectedPin.image_url ? (
            <img 
              src={selectedPin.image_url} 
              alt={selectedPin.nombre} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
              Imagen no disponible
            </div>
          )}
        </div>

        {/* Details Area */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 ${
              selectedPin.estado === 'disponible' ? 'bg-emerald-500/20 text-emerald-400' :
              selectedPin.estado === 'reservado' ? 'bg-amber-500/20 text-amber-400' :
              'bg-rose-500/20 text-rose-400'
            }`}>
              {selectedPin.estado}
            </span>
            <span className="text-slate-500 text-sm ml-3">
              Stock: {selectedPin.stock_disponible}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {selectedPin.nombre}
          </h2>
          
          <p className="text-gray-500 leading-relaxed mb-8">
            {selectedPin.descripcion || 'Este pin es exclusivo y no tiene descripción en este momento.'}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <span className="text-4xl font-black text-gray-900">
              ${selectedPin.precio}
            </span>
            
            <button
              onClick={() => {
                if (isAvailable) {
                  addItem(selectedPin);
                  closeModal();
                }
              }}
              disabled={!isAvailable}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                isAvailable
                  ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 hover:-translate-y-1'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingBag size={20} />
              {isAvailable ? 'Añadir al Carrito' : 'No Disponible'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
