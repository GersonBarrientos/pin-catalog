/**
 * API Route: /api/webhooks/wompi
 * 
 * Recibe notificaciones de Wompi cuando ocurre un pago
 * y actualiza el estado del pedido en la base de datos
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface WompiWebhookPayload {
  event: 'pago_exitoso' | 'pago_fallido' | 'pago_pendiente';
  reference: string;              // ID del pedido
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  transactionId: string;
}

/**
 * Verifica la integridad del webhook usando la firma
 */
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.WOMPI_WEBHOOK_SECRET;
  if (!secret) {
    console.error('WOMPI_WEBHOOK_SECRET no configurado');
    return false;
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

/**
 * POST /api/webhooks/wompi
 * Recibe y procesa webhooks de Wompi
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener payload y firma
    const payload = await request.text();
    const signature = request.headers.get('x-wompi-signature') || '';

    // Verificar integridad del webhook
    if (!verifyWebhookSignature(payload, signature)) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data: WompiWebhookPayload = JSON.parse(payload);

    const supabase = createClient();

    // Procesar según el evento
    if (data.event === 'pago_exitoso') {
      // Actualizar pedido como completado
      const { error } = await supabase
        .from('pedidos')
        .update({
          estado: 'completado',
          payment_method: 'wompi',
          payment_id: data.transactionId,
          payment_status: 'completed',
          payment_date: new Date().toISOString(),
        })
        .eq('id', data.reference);

      if (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        );
      }

      // TODO: Enviar email de confirmación al cliente
      // TODO: Notificar al admin
      // TODO: Generar factura automática

      console.log(`✅ Pedido ${data.reference} completado via Wompi`);
    } else if (data.event === 'pago_fallido') {
      // Actualizar pedido como fallido
      const { error } = await supabase
        .from('pedidos')
        .update({
          payment_status: 'failed',
          payment_id: data.transactionId,
        })
        .eq('id', data.reference);

      if (error) {
        console.error('Error updating order:', error);
      }

      // TODO: Notificar al cliente que reintentar
      console.warn(`❌ Pago fallido para pedido ${data.reference}`);
    } else if (data.event === 'pago_pendiente') {
      // Actualizar pedido como pendiente
      const { error } = await supabase
        .from('pedidos')
        .update({
          payment_status: 'pending',
          payment_id: data.transactionId,
        })
        .eq('id', data.reference);

      if (error) {
        console.error('Error updating order:', error);
      }

      console.log(`⏳ Pago pendiente para pedido ${data.reference}`);
    }

    // Retornar OK a Wompi
    return NextResponse.json(
      { success: true, message: 'Webhook processed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/wompi
 * Health check
 */
export async function GET() {
  return NextResponse.json(
    { status: 'Wompi webhook endpoint is running' },
    { status: 200 }
  );
}
