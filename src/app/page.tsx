import PinGrid from '@/components/PinGrid';
import CartSidebar from '@/components/CartSidebar';
import PinModal from '@/components/PinModal';

export default function Home() {
  return (
    <main className="min-h-screen p-8 relative">
      <header className="mb-12 flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
            PinCatalog
          </h1>
          <p className="text-slate-400 mt-2">Colección exclusiva en tiempo real</p>
        </div>
        <CartSidebar />
      </header>

      <PinGrid />
      <PinModal />
    </main>
  );
}
