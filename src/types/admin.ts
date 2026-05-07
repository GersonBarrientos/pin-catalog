// Tipos compartidos para PinArt Admin

export interface Order {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  items: OrderItem[];
  total: number;
  estado: OrderStatus;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  uuid: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imageUrl?: string;
}

export type OrderStatus = 'pendiente' | 'completado' | 'cancelado';

export interface Pin {
  uuid: string;
  slug: string;
  nombre: string;
  descripcion: string;
  image_url: string;
  precio: number;
  stock_disponible: number;
  estado: PinStatus;
  created_at: string;
  updated_at?: string;
}

export type PinStatus = 'disponible' | 'reservado' | 'agotado';

export interface Invoice {
  pedidoId: string;
  clienteName: string;
  clientePhone: string;
  items: InvoiceItem[];
  total: number;
  fecha: string;
  numeroFactura: string;
}

export interface InvoiceItem {
  nombre: string;
  cantidad: number;
  precio: number;
  imageUrl?: string;
}

export interface SalesStats {
  totalSales: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  canceledOrders: number;
  averageOrderValue: number;
  topProducts: TopProduct[];
  monthlySales: MonthlySales[];
  dailySales: DailySales[];
  inventoryValue: number;
  outOfStockItems: number;
}

export interface TopProduct {
  nombre: string;
  cantidad: number;
  ingresos: number;
}

export interface MonthlySales {
  mes: string;
  ventas: number;
  ordenes: number;
}

export interface DailySales {
  fecha: string;
  ventas: number;
  ordenes: number;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}
