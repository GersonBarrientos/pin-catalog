import PinGrid from '@/components/PinGrid';
import CartSidebar from '@/components/CartSidebar';
import PinModal from '@/components/PinModal';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 relative selection:bg-teal-500/30 selection:text-teal-900">
      <header className="mb-12 flex justify-between items-center glass-panel rounded-3xl p-6 md:px-10 mt-4 mx-auto max-w-7xl relative z-20">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="PinArt Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain rounded-full bg-white shadow-sm" />
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient animated-bg drop-shadow-sm">
              Catálogo de Pines
            </h1>
            <p className="text-teal-700/70 mt-2 font-bold">Encuentra tus accesorios favoritos</p>
          </div>
        </div>
        <CartSidebar />
      </header>

      <div className="max-w-7xl mx-auto relative z-10">
        <PinGrid />
      </div>
      <PinModal />
    </main>
  );
}
