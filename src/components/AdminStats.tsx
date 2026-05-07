"use client";

import { SalesMetrics, calculateSalesMetrics, downloadMetricsAsCSV } from '@/lib/sales-metrics';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, Package, AlertCircle } from 'lucide-react';

interface AdminStatsProps {
  pedidos: any[];
  pins: any[];
}

export default function AdminStats({ pedidos, pins }: AdminStatsProps) {
  const metrics = calculateSalesMetrics(pedidos, pins);

  const handleExportCSV = () => {
    downloadMetricsAsCSV(metrics);
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Estadísticas y Reportes</h2>
          <p className="text-slate-400 text-sm mt-1">Análisis de ventas y gestión del negocio</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
        >
          <Download size={18} /> Exportar CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-xl border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold">Total de Ventas</p>
              <p className="text-3xl font-black text-blue-400 mt-2">${metrics.totalSales.toFixed(2)}</p>
            </div>
            <DollarSign className="text-blue-400/30" size={32} />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold">Órdenes Completadas</p>
              <p className="text-3xl font-black text-emerald-400 mt-2">{metrics.completedOrders}</p>
            </div>
            <Package className="text-emerald-400/30" size={32} />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold">Ticket Promedio</p>
              <p className="text-3xl font-black text-amber-400 mt-2">${metrics.averageOrderValue.toFixed(2)}</p>
            </div>
            <TrendingUp className="text-amber-400/30" size={32} />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold">Productos Sin Stock</p>
              <p className="text-3xl font-black text-rose-400 mt-2">{metrics.outOfStockItems}</p>
            </div>
            <AlertCircle className="text-rose-400/30" size={32} />
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-white font-semibold mb-4">Estado de Órdenes</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Pendientes</span>
              <span className="font-bold text-amber-400">{metrics.pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Completadas</span>
              <span className="font-bold text-emerald-400">{metrics.completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Canceladas</span>
              <span className="font-bold text-rose-400">{metrics.canceledOrders}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-white font-semibold mb-4">Inventario</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Valor Total</span>
              <span className="font-bold text-blue-400">${metrics.inventoryValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total de Pines</span>
              <span className="font-bold text-white">{pins.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Sin Stock</span>
              <span className="font-bold text-rose-400">{metrics.outOfStockItems}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-white font-semibold mb-4">Resumen</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Órdenes</span>
              <span className="font-bold text-white">{metrics.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Tasa Completada</span>
              <span className="font-bold text-emerald-400">
                {((metrics.completedOrders / (metrics.totalOrders || 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Tasa Cancelada</span>
              <span className="font-bold text-rose-400">
                {((metrics.canceledOrders / (metrics.totalOrders || 1)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {metrics.dailySales.length > 0 && (
        <div className="glass-panel p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-white font-semibold mb-4">Ventas Diarias (Últimos 30 días)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="fecha" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="ordenes" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Products */}
      {metrics.topProducts.length > 0 && (
        <div className="glass-panel p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-white font-semibold mb-4">Top 5 Productos Más Vendidos</h3>
          <div className="space-y-3">
            {metrics.topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-white font-semibold">{product.nombre}</p>
                  <p className="text-slate-400 text-sm">Cantidad: {product.cantidad}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold">${product.ingresos.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Sales */}
      {metrics.monthlySales.length > 0 && (
        <div className="glass-panel p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-white font-semibold mb-4">Ventas por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="ventas" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="ordenes" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
