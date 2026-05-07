/**
 * Hook para manejar pagos con Wompi
 * Genera links de pago y gestiona el checkout
 */

import { useCallback } from 'react';

export interface WompiCheckoutData {
  reference: string;           // ID único del pedido
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  total: number;
}

export function useWompiPayment() {
  // Configuración - cambiar con tus valores reales
  const WOMPI_MERCHANT_ID = process.env.NEXT_PUBLIC_WOMPI_MERCHANT_ID;
  const WOMPI_WIDGET_URL = 'https://pagos.wompi.sv/js/wompi.pagos.js';

  /**
   * Genera un link de pago dinámico para Wompi
   * En producción, esto llamaría a tu backend que usa la API de Wompi
   */
  const generateWompiPaymentLink = useCallback(async (data: WompiCheckoutData) => {
    try {
      // En producción, llamar a tu backend:
      // const response = await fetch('/api/wompi/create-payment', {
      //   method: 'POST',
      //   body: JSON.stringify(data)
      // });
      // const { paymentLink } = await response.json();
      // return paymentLink;

      // Por ahora, usar template dinámico
      const description = data.items
        .map(item => `${item.cantidad}x ${item.nombre}`)
        .join(', ');

      const params = new URLSearchParams({
        reference: data.reference,
        amount: data.total.toString(),
        description: description,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
      });

      return `https://pagos.wompi.sv/checkout?${params.toString()}`;
    } catch (error) {
      console.error('Error generando link Wompi:', error);
      throw error;
    }
  }, [WOMPI_MERCHANT_ID]);

  /**
   * Abre el widget de Wompi
   */
  const openWompiWidget = useCallback((paymentLink: string) => {
    // Cargar script de Wompi si no está cargado
    if (!window.wompiPagos) {
      const script = document.createElement('script');
      script.src = WOMPI_WIDGET_URL;
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.wompiPagos) {
          window.wompiPagos.open(paymentLink);
        }
      };
    } else {
      window.wompiPagos.open(paymentLink);
    }
  }, [WOMPI_WIDGET_URL]);

  /**
   * Abre Wompi en nueva pestaña
   */
  const openWompiWindow = useCallback((paymentLink: string) => {
    window.open(paymentLink, '_blank', 'width=800,height=600');
  }, []);

  return {
    generateWompiPaymentLink,
    openWompiWidget,
    openWompiWindow,
  };
}

// Type augmentation para window
declare global {
  interface Window {
    wompiPagos?: {
      open: (url: string) => void;
    };
  }
}
