import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface InvoiceData {
  pedidoId: string;
  clienteName: string;
  clientePhone: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
    imageUrl?: string;
  }>;
  total: number;
  fecha: string;
  numeroFactura?: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  // Crear un elemento HTML temporal con los datos de la factura
  const invoiceHTML = `
    <div style="width: 210mm; height: 297mm; padding: 20mm; font-family: Arial, sans-serif; background: white; color: #000;">
      <div style="border: 2px solid #1f2937; padding: 20px; border-radius: 8px;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">PinArt</h1>
          <p style="color: #666; margin: 5px 0 0 0; font-size: 12px;">Tienda de Pines Premium</p>
        </div>

        <!-- Invoice Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <p style="margin: 0; color: #666; font-size: 12px;">FACTURA #</p>
            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 16px;">${data.numeroFactura || data.pedidoId.substring(0, 8).toUpperCase()}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; color: #666; font-size: 12px;">FECHA</p>
            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 16px;">${new Date(data.fecha).toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <!-- Client Info -->
        <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0; color: #666; font-size: 11px; font-weight: bold;">CLIENTE</p>
          <p style="margin: 8px 0 0 0; font-weight: bold; font-size: 14px;">${data.clienteName}</p>
          <p style="margin: 3px 0 0 0; color: #666; font-size: 12px;">Teléfono: ${data.clientePhone}</p>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #3b82f6; color: white;">
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: bold; border-radius: 6px 0 0 0;">PRODUCTO</th>
                <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: bold;">CANTIDAD</th>
                <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: bold;">PRECIO UNIT.</th>
                <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: bold; border-radius: 0 6px 0 0;">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map((item, idx) => `
                <tr style="border-bottom: 1px solid #e5e7eb; ${idx % 2 === 0 ? 'background: #f9fafb;' : ''}">
                  <td style="padding: 12px; font-size: 12px; font-weight: 500;">${item.nombre}</td>
                  <td style="padding: 12px; text-align: center; font-size: 12px;">${item.cantidad}</td>
                  <td style="padding: 12px; text-align: right; font-size: 12px;">$${item.precio.toFixed(2)}</td>
                  <td style="padding: 12px; text-align: right; font-size: 12px; font-weight: bold;">$${(item.cantidad * item.precio).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
          <div style="width: 300px; border-top: 2px solid #3b82f6; padding-top: 15px;">
            <div style="display: grid; grid-template-columns: 1fr 100px; gap: 10px; margin-bottom: 10px;">
              <p style="margin: 0; text-align: right; color: #666; font-size: 12px;">Subtotal:</p>
              <p style="margin: 0; text-align: right; font-size: 12px;">$${(data.total).toFixed(2)}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 100px; gap: 10px;">
              <p style="margin: 0; text-align: right; color: #666; font-size: 12px;">IVA (0%):</p>
              <p style="margin: 0; text-align: right; font-size: 12px;">$0.00</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 100px; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 2px solid #3b82f6;">
              <p style="margin: 0; text-align: right; font-weight: bold; font-size: 14px;">TOTAL:</p>
              <p style="margin: 0; text-align: right; font-weight: bold; font-size: 18px; color: #3b82f6;">$${data.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; color: #666; font-size: 11px;">
          <p style="margin: 0;">Gracias por tu compra en PinArt</p>
          <p style="margin: 5px 0 0 0;">¡Esperamos que disfrutes tus pines!</p>
          <p style="margin: 10px 0 0 0; font-size: 10px; color: #999;">Generado automáticamente - ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  `;

  // Crear elemento temporal
  const element = document.createElement('div');
  element.innerHTML = invoiceHTML;
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '-9999px';
  document.body.appendChild(element);

  try {
    // Convertir HTML a canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    // Crear PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    return pdf.output('blob');
  } finally {
    document.body.removeChild(element);
  }
}

export async function downloadInvoicePDF(data: InvoiceData): Promise<void> {
  const blob = await generateInvoicePDF(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Factura-${data.numeroFactura || data.pedidoId.substring(0, 8)}-${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function sendInvoiceViaWhatsApp(
  data: InvoiceData,
  phoneNumber: string
): Promise<void> {
  const message = encodeURIComponent(
    `Hola ${data.clienteName},\n\n` +
    `Aquí está tu factura de PinArt:\n\n` +
    `📋 Factura: ${data.numeroFactura || data.pedidoId.substring(0, 8)}\n` +
    `📅 Fecha: ${new Date(data.fecha).toLocaleDateString('es-ES')}\n\n` +
    `📦 Productos:\n${data.items.map(item => `  • ${item.cantidad}x ${item.nombre}: $${(item.cantidad * item.precio).toFixed(2)}`).join('\n')}\n\n` +
    `💰 Total: $${data.total.toFixed(2)}\n\n` +
    `¡Gracias por tu compra en PinArt!\n` +
    `📞 Estamos disponibles para cualquier duda.`
  );

  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;
  window.open(whatsappUrl, '_blank');
}
