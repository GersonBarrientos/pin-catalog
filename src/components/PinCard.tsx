"use client";

import { PinItem, useModalStore, useCartStore } from '@/store/useStore';
import { ShoppingCart, Eye } from 'lucide-react';

interface PinCardProps {
  pin: PinItem;
}

export default function PinCard({ pin }: PinCardProps) {
  const openModal = useModalStore((state) => state.openModal);
  const addItem = useCartStore((state) => state.addItem);

  const isAvailable = pin.estado === 'disponible' && pin.stock_disponible > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAvailable) {
      addItem(pin);
    }
  };

  return (
    <div 
      className="glass-card overflow-hidden group cursor-pointer"
      onClick={() => openModal(pin)}
    >
      <div className="aspect-[4/3] bg-slate-900/50 relative overflow-hidden">
        {pin.image_url ? (
          <img 
            src={pin.image_url} 
            alt={pin.nombre} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-900 font-medium">
            Sin Imagen
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {pin.estado === 'reservado' && (
            <span className="px-3 py-1 bg-amber-500/90 text-amber-50 text-xs font-bold rounded-full backdrop-blur-md shadow-lg">
              Reservado
            </span>
          )}
          {pin.estado === 'agotado' && (
            <span className="px-3 py-1 bg-rose-500/90 text-rose-50 text-xs font-bold rounded-full backdrop-blur-md shadow-lg">
              Agotado
            </span>
          )}
          {isAvailable && (
            <span className="px-3 py-1 bg-emerald-500/90 text-emerald-50 text-xs font-bold rounded-full backdrop-blur-md shadow-lg">
              Disponible
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-slate-100 mb-1 group-hover:text-pink-400 transition-colors">
          {pin.nombre}
        </h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {pin.descripcion || 'Sin descripción'}
        </p>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-black text-white drop-shadow-md">
            ${pin.precio}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); openModal(pin); }}
              className="p-2 bg-slate-700/50 hover:bg-slate-600 rounded-full text-slate-200 transition-colors backdrop-blur-md"
              title="Ver detalles"
            >
              <Eye size={18} />
            </button>
            <button 
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`p-2 rounded-full flex items-center justify-center transition-all ${
                isAvailable 
                  ? 'bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white shadow-lg shadow-pink-500/30 hover:scale-110' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title={isAvailable ? "Añadir al carrito" : "No disponible"}
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
