import PinGrid from '@/components/PinGrid';
import CartSidebar from '@/components/CartSidebar';
import PinModal from '@/components/PinModal';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 relative selection:bg-teal-500/30 selection:text-teal-900">
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
          <CartSidebar />
        </div>
      </header>

      <div className="max-w-7xl mx-auto relative z-10">
        <PinGrid />
      </div>
      <PinModal />
    </main>
  );
}
