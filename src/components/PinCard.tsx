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
      className="bg-white rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-gray-200 border border-gray-100"
      onClick={() => openModal(pin)}
    >
      <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
        {pin.image_url ? (
          <img 
            src={pin.image_url} 
            alt={pin.nombre} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 font-medium">
            Sin Imagen
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {pin.estado === 'reservado' && (
            <span className="px-3 py-1 bg-amber-500/90 text-amber-50 text-xs font-bold rounded-full backdrop-blur-sm">
              Reservado
            </span>
          )}
          {pin.estado === 'agotado' && (
            <span className="px-3 py-1 bg-rose-500/90 text-rose-50 text-xs font-bold rounded-full backdrop-blur-sm">
              Agotado
            </span>
          )}
          {isAvailable && (
            <span className="px-3 py-1 bg-emerald-500/90 text-emerald-50 text-xs font-bold rounded-full backdrop-blur-sm">
              Disponible
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-rose-500 transition-colors">
          {pin.nombre}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {pin.descripcion || 'Sin descripción'}
        </p>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-black text-gray-900">
            ${pin.precio}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); openModal(pin); }}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
              title="Ver detalles"
            >
              <Eye size={18} />
            </button>
            <button 
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                isAvailable 
                  ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-md shadow-gray-900/20' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
