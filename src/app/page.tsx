"use client";

import PinGrid from '@/components/PinGrid';
import CartSidebar from '@/components/CartSidebar';
import PinModal from '@/components/PinModal';
import { useCartStore } from '@/store/useStore';

export default function Home() {
  const isOpen = useCartStore(state => state.isOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 selection:bg-teal-500/30 selection:text-teal-900">
      {/* Main Catalog Area - Transitions its width based on Cart state */}
      <main className={`transition-all duration-300 ease-in-out flex flex-col relative ${isOpen ? 'w-full lg:w-[60%]' : 'w-full'}`}>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
      <header className="mb-8 flex flex-row justify-between items-center glass-panel rounded-2xl md:rounded-3xl p-4 md:p-6 mx-auto max-w-7xl gap-3 relative z-20">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo.png" alt="PinArt Logo" className="h-12 w-12 md:h-16 md:w-16 object-contain rounded-full bg-white shadow-sm shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight text-gradient animated-bg drop-shadow-sm truncate">
              Catálogo de Pines
            </h1>
            <p className="text-teal-700/70 text-[10px] sm:text-xs md:text-sm font-bold truncate">Encuentra tus accesorios favoritos</p>
          </div>
        </div>
        <div className="shrink-0 flex items-center">
          <button 
            onClick={() => useCartStore.getState().toggleCart()}
            className="relative p-3 bg-white hover:bg-teal-50 rounded-full transition-all border border-teal-100 shadow-sm hover:shadow-md hover:scale-105 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-700 group-hover:text-teal-600 transition-colors"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <CartBadge />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto relative z-10">
        <PinGrid />
      </div>
      <PinModal />
        </div>
      </main>
      
      {/* Sidebar container for Desktop Split View */}
      {isOpen && (
        <aside className="hidden lg:block w-[40%] border-l border-teal-100 bg-white relative z-50 shadow-2xl">
          <CartSidebar />
        </aside>
      )}
      
      {/* Mobile Sidebar overlay */}
      <div className="lg:hidden">
        <CartSidebar />
      </div>
    </div>
  );
}

function CartBadge() {
  const items = useCartStore(state => state.items);
  if (items.length === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
      {items.length}
    </span>
  );
}
