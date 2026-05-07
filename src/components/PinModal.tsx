"use client";

import { useModalStore, useCartStore } from '@/store/useStore';
import { X, ShoppingCart, Info, AlertTriangle } from 'lucide-react';

export default function PinModal() {
  const { selectedPin, closeModal } = useModalStore();
  const addItem = useCartStore((state) => state.addItem);

  if (!selectedPin) return null;

  const isAvailable = selectedPin.estado === 'disponible' && selectedPin.stock_disponible > 0;

  const handleAddToCart = () => {
    if (isAvailable) {
      addItem(selectedPin);
      closeModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={closeModal}
    >
      <div 
        className="bg-[#fefbf7] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-teal-100 transform transition-all animate-in fade-in zoom-in-95 duration-300 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-stone-500 hover:text-teal-600 rounded-full backdrop-blur-md transition-colors shadow-sm"
        >
          <X size={20} />
        </button>

        <div className="md:w-1/2 bg-stone-100 relative min-h-[300px] md:min-h-full flex items-center justify-center p-8">
          {selectedPin.image_url ? (
            <img 
              src={selectedPin.image_url} 
              alt={selectedPin.nombre} 
              className="w-full h-full object-contain drop-shadow-xl"
            />
          ) : (
            <div className="text-stone-400 font-medium flex flex-col items-center gap-3">
              <Info size={48} className="opacity-50" />
              <span>Imagen no disponible</span>
            </div>
          )}
        </div>

        <div className="md:w-1/2 p-5 sm:p-8 md:p-10 flex flex-col bg-[#fefbf7]">
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              {selectedPin.estado === 'reservado' && (
                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-200 text-xs font-bold rounded-full flex items-center gap-1">
                  <AlertTriangle size={12} /> Reservado
                </span>
              )}
              {selectedPin.estado === 'agotado' && (
                <span className="px-3 py-1 bg-teal-500/10 text-teal-600 border border-teal-200 text-xs font-bold rounded-full flex items-center gap-1">
                  <X size={12} /> Agotado
                </span>
              )}
              {isAvailable && (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1">
                  <ShoppingCart size={12} /> Disponible
                </span>
              )}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-800 mb-2 leading-tight">
              {selectedPin.nombre}
            </h2>
            <p className="text-4xl font-black text-teal-600 my-4">
              ${Number(selectedPin.precio).toFixed(2)}
            </p>
          </div>

          <div className="prose prose-stone prose-sm mb-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Info size={16} /> Acerca de este pin
            </h4>
            <p className="text-stone-600 leading-relaxed text-base">
              {selectedPin.descripcion || 'Este hermoso pin no tiene una descripción detallada todavía, ¡pero te aseguramos que lucirá genial en tu mochila o chaqueta!'}
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-teal-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-stone-500 font-medium">Disponibilidad en tienda:</span>
              <span className={`font-bold ${isAvailable ? 'text-teal-600' : 'text-stone-400'}`}>
                {selectedPin.stock_disponible} unidades
              </span>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg ${
                isAvailable 
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white shadow-teal-500/30 hover:scale-[1.02]' 
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200 shadow-none'
              }`}
            >
              {isAvailable && <ShoppingCart size={22} />}
              {isAvailable ? 'Añadir al Carrito' : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
