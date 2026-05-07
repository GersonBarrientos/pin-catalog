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
      <div className="aspect-[4/3] bg-white relative overflow-hidden">
        {pin.image_url ? (
          <img 
            src={pin.image_url} 
            alt={pin.nombre} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 font-medium">
            Sin Imagen
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {pin.estado === 'reservado' && (
            <span className="px-3 py-1 bg-amber-500/90 text-amber-50 text-xs font-bold rounded-full backdrop-blur-md shadow-sm border border-amber-400">
              Reservado
            </span>
          )}
          {pin.estado === 'agotado' && (
            <span className="px-3 py-1 bg-rose-500/90 text-rose-50 text-xs font-bold rounded-full backdrop-blur-md shadow-sm border border-rose-400">
              Agotado
            </span>
          )}
          {isAvailable && (
            <span className="px-3 py-1 bg-emerald-500/90 text-emerald-50 text-xs font-bold rounded-full backdrop-blur-md shadow-sm border border-emerald-400">
              Disponible
            </span>
          )}
        </div>
      </div>

      <div className="p-5 bg-white">
        <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-teal-500 transition-colors">
          {pin.nombre}
        </h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
          {pin.descripcion || 'Sin descripción'}
        </p>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-black text-teal-800 drop-shadow-sm">
            ${Number(pin.precio).toFixed(2)}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); openModal(pin); }}
              className="p-2 bg-slate-100 hover:bg-teal-50 rounded-full text-slate-600 hover:text-teal-600 transition-colors shadow-sm"
              title="Ver detalles"
            >
              <Eye size={18} />
            </button>
            {isAvailable && (
              <button 
                onClick={handleAddToCart}
                className="p-2 rounded-full flex items-center justify-center transition-all bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white shadow-md shadow-teal-500/30 hover:scale-110"
                title="Añadir al carrito"
              >
                <ShoppingCart size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
