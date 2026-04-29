import { create } from 'zustand';

export interface PinItem {
  uuid: string;
  slug: string;
  nombre: string;
  descripcion: string;
  image_url: string;
  precio: number;
  stock_disponible: number;
  estado: 'disponible' | 'reservado' | 'agotado';
}

interface CartStore {
  items: PinItem[];
  isOpen: boolean;
  addItem: (item: PinItem) => void;
  removeItem: (uuid: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  isOpen: false,
  addItem: (item) => set((state) => {
    // Evitar duplicados
    if (state.items.find(i => i.uuid === item.uuid)) return state;
    return { items: [...state.items, item], isOpen: true };
  }),
  removeItem: (uuid) => set((state) => ({
    items: state.items.filter(item => item.uuid !== uuid)
  })),
  clearCart: () => set({ items: [] }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (isOpen) => set({ isOpen })
}));

interface ModalStore {
  selectedPin: PinItem | null;
  openModal: (pin: PinItem) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  selectedPin: null,
  openModal: (pin) => set({ selectedPin: pin }),
  closeModal: () => set({ selectedPin: null })
}));
