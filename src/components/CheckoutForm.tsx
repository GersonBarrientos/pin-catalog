"use client";

import { useState } from 'react';
import { Send, CreditCard, Loader, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useWompiPayment } from '@/hooks/useWompiPayment';

interface CheckoutFormProps {
  total: number;
  items: Array<{ uuid?: string; nombre: string; cantidad: number; precio: number; image_url?: string }>;
  onSuccess?: (method: 'whatsapp' | 'wompi') => void;
}

export default function CheckoutForm({ total, items, onSuccess }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { generateWompiPaymentLink, openWompiWindow } = useWompiPayment();
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError('Por favor ingresa tu nombre');
      return false;
    }
    if (!formData.telefono.trim()) {
      setError('Por favor ingresa tu teléfono');
      return false;
    }
    // Email opcional: si se provee, se puede validar en el futuro.
    return true;
  };

  // Guardar pedido en BD
  const savePedidoToDB = async (paymentMethod: 'whatsapp' | 'wompi') => {
    try {
      const { data, error: dbError } = await supabase.rpc('crear_pedido', {
        p_cliente_nombre: formData.nombre,
        p_cliente_telefono: formData.telefono,
        p_cliente_email: formData.email,
        p_items: items, // Se envía todo el array con uuid e image_url
        p_total: total,
        p_payment_method: paymentMethod,
      });

      if (dbError) {
        console.error('Error al guardar pedido:', dbError);
        setError('Error al guardar el pedido. Intenta de nuevo.');
        return null;
      }

      return data; // Retorna el ID del pedido
    } catch (err) {
      console.error('Error:', err);
      setError('Error al procesar la solicitud.');
      return null;
    }
  };

  const handleWhatsAppPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Guardar pedido primero
      const pedidoId = await savePedidoToDB('whatsapp');
      if (!pedidoId) {
        setLoading(false);
        return;
      }

      const message = encodeURIComponent(
        `Hola PinArt,\n\n` +
        `Quisiera confirmar mi compra:\n\n` +
        `👤 Nombre: ${formData.nombre}\n` +
        `📞 Teléfono: ${formData.telefono}\n` +
        `📧 Email: ${formData.email}\n\n` +
        `📦 Productos:\n${items.map(item => `• ${item.cantidad}x ${item.nombre}: $${(item.cantidad * item.precio).toFixed(2)}`).join('\n')}\n\n` +
        `💰 Total: $${total.toFixed(2)}\n\n` +
        `📋 Referencia: ${pedidoId.slice(0, 8).toUpperCase()}\n` +
        `Método de pago: WhatsApp\n` +
        `¡Espero mi confirmación!`
      );

      window.open(`https://wa.me/50370425319?text=${message}`, '_blank');
      onSuccess?.('whatsapp');
    } catch (err) {
      console.error(err);
      setError('Error al procesar WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleWompiPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Guardar pedido primero
      const pedidoId = await savePedidoToDB('wompi');
      if (!pedidoId) {
        setLoading(false);
        return;
      }

      // Generar link de pago
      const paymentLink = await generateWompiPaymentLink({
        reference: pedidoId,
        clientName: formData.nombre,
        clientEmail: formData.email,
        clientPhone: formData.telefono,
        items,
        total,
      });

      // Abrir Wompi
      openWompiWindow(paymentLink);
      onSuccess?.('wompi');
    } catch (err) {
      setError('Error al procesar pago. Intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Campos de Formulario */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-semibold text-slate-300 block mb-2">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Tu nombre completo"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-300 block mb-2">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            placeholder="+503 70425319"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-300 block mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@email.com"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Resumen de Pago */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
        <p className="text-slate-400 text-sm mb-2">Resumen:</p>
        <div className="space-y-1 mb-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-slate-300">
              <span>{item.cantidad}x {item.nombre}</span>
              <span>${(item.cantidad * item.precio).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
          <span className="font-semibold text-white">Total:</span>
          <span className="text-xl font-black text-emerald-400">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Botones de Pago */}
      <div className="grid grid-cols-2 gap-3">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsAppPayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        {/* Wompi */}
        <button
          onClick={handleWompiPayment}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <CreditCard size={18} />}
          <span className="hidden sm:inline">Wompi</span>
        </button>
      </div>

      {/* Info */}
      <div className="text-xs text-slate-400 text-center space-y-1">
        <p>🔒 Tus datos están protegidos</p>
        <p>💳 Wompi es seguro y rápido • 📞 WhatsApp es más personal</p>
      </div>
    </div>
  );
}
