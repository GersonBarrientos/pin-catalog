import PinGrid from '@/components/PinGrid';
import CartSidebar from '@/components/CartSidebar';
import PinModal from '@/components/PinModal';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 relative selection:bg-pink-500/30 selection:text-pink-200">
      <header className="mb-12 flex justify-between items-center glass-panel rounded-3xl p-6 md:px-10 mt-4 mx-auto max-w-7xl relative z-20">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient animated-bg drop-shadow-lg">
            Catálogo de Pines
          </h1>
          <p className="text-slate-300 mt-2 font-medium">Encuentra tus accesorios favoritos</p>
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
