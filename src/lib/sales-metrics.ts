export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  canceledOrders: number;
  topProducts: Array<{ nombre: string; cantidad: number; ingresos: number }>;
  monthlySales: Array<{ mes: string; ventas: number; ordenes: number }>;
  dailySales: Array<{ fecha: string; ventas: number; ordenes: number }>;
  inventoryValue: number;
  outOfStockItems: number;
}

export function calculateSalesMetrics(
  pedidos: any[],
  pins: any[]
): SalesMetrics {
  const completedOrders = pedidos.filter(p => p.estado === 'completado');
  const pendingOrders = pedidos.filter(p => p.estado === 'pendiente');
  const canceledOrders = pedidos.filter(p => p.estado === 'cancelado');

  // Ventas totales
  const totalSales = completedOrders.reduce((sum, p) => sum + (p.total || 0), 0);
  
  // Promedio de venta
  const averageOrderValue = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;

  // Productos más vendidos
  const productMap: { [key: string]: { nombre: string; cantidad: number; ingresos: number } } = {};
  
  completedOrders.forEach(pedido => {
    pedido.items?.forEach((item: any) => {
      if (!productMap[item.uuid]) {
        productMap[item.uuid] = { 
          nombre: item.nombre, 
          cantidad: 0, 
          ingresos: 0 
        };
      }
      productMap[item.uuid].cantidad += item.cantidad || 1;
      productMap[item.uuid].ingresos += item.precio * item.cantidad;
    });
  });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 5);

  // Ventas por mes
  const monthlySalesMap: { [key: string]: { ventas: number; ordenes: number } } = {};
  
  completedOrders.forEach(pedido => {
    const date = new Date(pedido.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlySalesMap[monthKey]) {
      monthlySalesMap[monthKey] = { ventas: 0, ordenes: 0 };
    }
    monthlySalesMap[monthKey].ventas += pedido.total || 0;
    monthlySalesMap[monthKey].ordenes += 1;
  });

  const monthlySales = Object.entries(monthlySalesMap)
    .map(([mes, data]) => ({
      mes: mes,
      ventas: data.ventas,
      ordenes: data.ordenes
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  // Ventas por día (últimos 30 días)
  const dailySalesMap: { [key: string]: { ventas: number; ordenes: number } } = {};
  const today = new Date();
  
  completedOrders.forEach(pedido => {
    const date = new Date(pedido.created_at);
    const dayKey = date.toISOString().split('T')[0];
    
    if (!dailySalesMap[dayKey]) {
      dailySalesMap[dayKey] = { ventas: 0, ordenes: 0 };
    }
    dailySalesMap[dayKey].ventas += pedido.total || 0;
    dailySalesMap[dayKey].ordenes += 1;
  });

  const dailySales = Object.entries(dailySalesMap)
    .map(([fecha, data]) => ({
      fecha: fecha,
      ventas: data.ventas,
      ordenes: data.ordenes
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-30);

  // Valor de inventario
  const inventoryValue = pins.reduce((sum, pin) => {
    return sum + (pin.precio * pin.stock_disponible);
  }, 0);

  // Items sin stock
  const outOfStockItems = pins.filter(pin => pin.stock_disponible === 0).length;

  return {
    totalSales,
    totalOrders: pedidos.length,
    averageOrderValue,
    pendingOrders: pendingOrders.length,
    completedOrders: completedOrders.length,
    canceledOrders: canceledOrders.length,
    topProducts,
    monthlySales,
    dailySales,
    inventoryValue,
    outOfStockItems,
  };
}

export interface FinancialReport {
  periode: string;
  totalIncome: number;
  totalOrders: number;
  averageOrder: number;
  canceledOrders: number;
  canceledAmount: number;
  products: Array<{
    nombre: string;
    sold: number;
    revenue: number;
    profit: number;
  }>;
}

export function generateFinancialReport(
  pedidos: any[],
  pins: any[],
  startDate?: Date,
  endDate?: Date
): FinancialReport {
  const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate || new Date();

  const filteredOrders = pedidos.filter(p => {
    const date = new Date(p.created_at);
    return date >= start && date <= end;
  });

  const completedOrders = filteredOrders.filter(p => p.estado === 'completado');
  const canceledOrders = filteredOrders.filter(p => p.estado === 'cancelado');

  const totalIncome = completedOrders.reduce((sum, p) => sum + (p.total || 0), 0);
  const canceledAmount = canceledOrders.reduce((sum, p) => sum + (p.total || 0), 0);
  const averageOrder = completedOrders.length > 0 ? totalIncome / completedOrders.length : 0;

  // Detalles por producto
  const productDetails: { [key: string]: { nombre: string; sold: number; revenue: number } } = {};

  completedOrders.forEach(pedido => {
    pedido.items?.forEach((item: any) => {
      if (!productDetails[item.uuid]) {
        productDetails[item.uuid] = { 
          nombre: item.nombre, 
          sold: 0, 
          revenue: 0 
        };
      }
      productDetails[item.uuid].sold += item.cantidad || 1;
      productDetails[item.uuid].revenue += item.precio * item.cantidad;
    });
  });

  const products = Object.values(productDetails)
    .map(p => ({
      ...p,
      profit: p.revenue * 0.3, // Asumiendo 30% de ganancia
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    periode: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
    totalIncome,
    totalOrders: completedOrders.length,
    averageOrder,
    canceledOrders: canceledOrders.length,
    canceledAmount,
    products,
  };
}

export function exportMetricsToCSV(metrics: SalesMetrics): string {
  const lines = [
    ['REPORTE DE VENTAS DE PINART', ''],
    ['Generado:', new Date().toLocaleString()],
    [''],
    ['MÉTRICAS GENERALES'],
    ['Total de Ventas', `$${metrics.totalSales.toFixed(2)}`],
    ['Total de Órdenes', metrics.totalOrders],
    ['Órdenes Completadas', metrics.completedOrders],
    ['Órdenes Pendientes', metrics.pendingOrders],
    ['Órdenes Canceladas', metrics.canceledOrders],
    ['Venta Promedio', `$${metrics.averageOrderValue.toFixed(2)}`],
    [''],
    ['INVENTARIO'],
    ['Valor Total de Inventario', `$${metrics.inventoryValue.toFixed(2)}`],
    ['Productos Sin Stock', metrics.outOfStockItems],
    [''],
    ['PRODUCTOS TOP 5'],
    ['Producto', 'Cantidad Vendida', 'Ingresos'],
    ...metrics.topProducts.map(p => [p.nombre, p.cantidad, `$${p.ingresos.toFixed(2)}`]),
  ];

  return lines.map(line => line.join(',')).join('\n');
}

export function downloadMetricsAsCSV(metrics: SalesMetrics): void {
  const csv = exportMetricsToCSV(metrics);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-ventas-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
