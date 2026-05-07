# 🛒 Integración Wompi en PinArt - Análisis y Estrategia

## 📊 Análisis de Tu Cuenta Wompi

### Información Actual:
```
✅ Negocio: PinArt
✅ Estado: Activo
✅ Formas de Pago Habilitadas:
   - 💳 Tarjeta de Crédito/Débito
   - 🏦 Puntos Banco Agrícola
   - 📊 Cuotas Banco Agrícola
   - ₿ Bitcoin
   - ⚡ Quick Pay
   - 💬 Nequi

✅ Enlace de Prueba: https://s.wompi.sv/1423317x-Q
✅ Widget disponible: Sí
✅ Web Checkout disponible: Sí
✅ Webhooks configurados: Sí
✅ Notificaciones: Email + SMS
✅ Moneda: USD (por defecto en El Salvador)
```

---

## 🎯 Opciones de Integración Wompi

### **Opción 1: Widget (RECOMENDADA - La más simple)**
```html
<div class="wompi_button_widget" 
     data-url-pago="https://pagos.wompi.sv/IntentoPago/Redirect?id=..." 
     data-render="widget">
</div>
<script src="https://pagos.wompi.sv/js/wompi.pagos.js"></script>
```
**Ventajas:**
- ✅ Más fácil de implementar
- ✅ Se abre en modal
- ✅ Experiencia fluida
- ✅ Sin redirecciones

### **Opción 2: Web Checkout (Recomendada para flujos complejos)**
```html
<form method="GET" action="https://pagos.wompi.sv/IntentoPago/Redirect">
  <input name="id" value="4ecdf991-0f77-4b18-a3a5-d61e3d82b516" />
  <button type="submit">Pagar con Wompi</button>
</form>
```
**Ventajas:**
- ✅ Experiencia de checkout más control
- ✅ Customizable
- ✅ Buena compatibilidad

### **Opción 3: Botón "Pagar con Wompi" (Opción visual)**
- Botón estándar con logo de Wompi
- Se redirige a la página de pago

---

## 🔧 Estrategia de Integración para PinArt

### Flujo Propuesto:

```
1. Cliente selecciona pines (ACTUAL ✅)
           ↓
2. Cliente abre carrito (ACTUAL ✅)
           ↓
3. Cliente completa info personal
   - Nombre ✅ (YA EXISTE)
   - Teléfono ✅ (YA EXISTE)
   - EMAIL (NUEVO) ← Necesario para Wompi
           ↓
4. OPCIÓN A: Pagar por WhatsApp (ACTUAL)
   OPCIÓN B: Pagar con Wompi (NUEVO)
           ↓
5. Si elige Wompi:
   - Se genera link de pago dinámico
   - Se abre widget/checkout
   - Cliente paga
           ↓
6. Wompi envía webhook al servidor
           ↓
7. Server verifica pago
           ↓
8. Pedido se marca como "Pagado"
           ↓
9. Admin recibe notificación
           ↓
10. Cliente recibe confirmación
```

---

## 🚀 Ventajas de Usar Wompi en PinArt

### Para TI (Admin):
✅ **Pagos Garantizados**: No depende de que el cliente pague por WhatsApp  
✅ **Automático**: Los pagos se confirman instantáneamente  
✅ **Seguro**: Cumple normas PCI DSS  
✅ **Reportes**: Dashboard en Wompi  
✅ **Múltiples métodos**: Tus clientes tienen opciones  
✅ **Comisiones**: ~3% por transacción  

### Para el Cliente:
✅ **Seguro**: Los datos de tarjeta no pasan por tu servidor  
✅ **Rápido**: Confirmación al instante  
✅ **Opciones**: Tarjeta, Bitcoin, Nequi, etc.  
✅ **Cupones**: Banco Agrícola ofrece cuotas  

---

## 📋 Lo que Necesitas en PinArt

### 1. **Campo de Email en el Carrito** (NUEVO)
- Capturar email del cliente
- Requerido para Wompi
- Para enviar confirmación de pago

### 2. **Módulo de Checkout Mejorado** (NUEVO)
```typescript
interface CheckoutData {
  client_name: string;        // Actual
  client_phone: string;       // Actual
  client_email: string;       // NUEVO
  items: OrderItem[];
  total: number;
  payment_method: 'whatsapp' | 'wompi';  // NUEVO
}
```

### 3. **Generador de Links Wompi Dinámicos** (NUEVO)
```typescript
async function generateWompiPaymentLink(pedido: Order) {
  // Usa la API de Wompi para generar link único
  // O usa un link template con parámetros
}
```

### 4. **Webhook Receiver** (NUEVO)
```typescript
POST /api/webhooks/wompi
{
  evento: "pago_exitoso",
  referencia_pedido: "abc123",
  monto: 150.00,
  timestamp: "2026-05-07T14:32:00Z"
}
```

### 5. **Actualizar Pedido en DB** (MODIFICADO)
```sql
ALTER TABLE pedidos ADD COLUMN (
  payment_method: 'whatsapp' | 'wompi',
  payment_id: string,
  payment_status: 'pending' | 'completed' | 'failed',
  payment_date: timestamptz
);
```

---

## 🔐 Datos Sensibles Wompi (IMPORTANTE)

### Necesitarás:
- 🔑 **Merchant ID**: Identificador de tu negocio
- 🔑 **API Key**: Para operaciones backend
- 🔑 **Secret Key**: Para webhooks
- 🔑 **Public Key**: Para el frontend

**Estos deben ir en `.env.local`:**
```
NEXT_PUBLIC_WOMPI_MERCHANT_ID=tu_merchant_id
WOMPI_API_KEY=tu_api_key_secreta
WOMPI_WEBHOOK_SECRET=tu_webhook_secret
```

---

## 📱 Opciones de Implementación

### **Opción A: SIMPLE (Recomendada para comenzar)**
- Widget de Wompi en modal
- Sin backend complejo
- Link estático o dinámico simple
- Confirmación manual del admin

### **Opción B: PROFESIONAL (A futuro)**
- Generación de links dinámicos con API Wompi
- Webhook receiver en Next.js
- Auto-confirmación de pagos
- Notificaciones automáticas
- Reporte de transacciones

### **Opción C: HÍBRIDA (Recomendada)**
- Widget Wompi para pagos
- WhatsApp como alternativa
- Ambas opciones en carrito
- Cliente elige su método preferido

---

## 💳 Configuración en Wompi Recomendada

### Para PinArt:
```
✅ Activar: Tarjeta de Crédito/Débito
✅ Activar: Nequi (muy popular)
✅ Activar: Bitcoin (diferenciador)
⚠️  Considerar: Cuotas Banco Agrícola

❌ No necesitas: Puntos Banco Agrícola

Monto editable: NO (por seguridad)
Cantidad editable: NO (por seguridad)
Cantidad por defecto: 1
Minutos disponibles: 60 (OK)
Límite intentos fallidos: 3
```

---

## 🎯 Plan de Implementación (Fase a Fase)

### **FASE 1: Setup (HOY)**
1. Crear cuenta en Wompi ✅ (YA TIENES)
2. Obtener credenciales
3. Probar con enlace estático
4. Validar webhook

### **FASE 2: Integración Simple**
1. Agregar campo email en carrito
2. Agregar botón "Pagar con Wompi"
3. Mostrar widget Wompi en modal
4. Capturar confirmación manual

### **FASE 3: Automatización**
1. Crear API para generar links
2. Implementar webhook receiver
3. Auto-actualizar estado de pedidos
4. Auto-notificar al admin

### **FASE 4: Analytics**
1. Dashboard de transacciones
2. Reporte de conversión
3. Análisis de métodos de pago
4. Comparativa WhatsApp vs Wompi

---

## 📊 Comparativa: WhatsApp vs Wompi

| Aspecto | WhatsApp | Wompi |
|---------|----------|-------|
| **Seguridad** | Manual | Automática (PCI DSS) |
| **Confirmación** | Manual | Instantánea |
| **Métodos pago** | 1 (transferencia) | 6+ |
| **Comisión** | 0% | ~3% |
| **Automatización** | Baja | Alta |
| **Experiencia** | Casual | Profesional |
| **Ideal para** | Contacto directo | Pagos automatizados |

---

## 🚀 Próximos Pasos Recomendados

1. **Verificar credenciales de Wompi:**
   - Ir a Dashboard Wompi
   - Copiar Merchant ID
   - Generar API Keys
   - Configurar Webhook URL

2. **Crear estructura Backend:**
   - Endpoint para generar links
   - Endpoint para recibir webhooks
   - Funciones de actualización de DB

3. **Modificar Frontend:**
   - Agregar email en Carrito
   - Agregar opción de pago
   - Integrar widget Wompi

4. **Testear:**
   - Pago con tarjeta de prueba
   - Pago con Nequi
   - Pago con Bitcoin (opcional)
   - Verificar webhooks

---

## 📞 Soporte

**Documentación Wompi:** https://developers.wompi.sv  
**Contacto Wompi:** support@wompi.sv  

¿Quieres que comencemos con la **FASE 1: Setup**?

Necesitaremos:
1. ✅ Credenciales de Wompi
2. ✅ URL de webhook para Wompi
3. ✅ Decidir si comenzamos SIMPLE u HÍBRIDA
