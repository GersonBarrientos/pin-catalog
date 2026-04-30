import PinGrid from '@/components/PinGrid';
import CartSidebar from '@/components/CartSidebar';
import PinModal from '@/components/PinModal';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] p-4 md:p-8 relative selection:bg-rose-200">
      <header className="mb-12 flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Catálogo de Pines
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Encuentra tus accesorios favoritos</p>
        </div>
        <CartSidebar />
      </header>

      <PinGrid />
      <PinModal />
    </main>
  );
}
