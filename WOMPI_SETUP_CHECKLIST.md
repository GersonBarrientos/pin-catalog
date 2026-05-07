# 🚀 Integración Wompi - Próximos Pasos

## ✅ Ya Implementado

✅ **Hook `useWompiPayment`** - Maneja la lógica de pagos  
✅ **Componente `CheckoutForm`** - Formulario mejorado con ambas opciones de pago  
✅ **CartSidebar Actualizado** - Ahora usa CheckoutForm  
✅ **API Route Webhook** - Recibe notificaciones de Wompi  
✅ **Documentación Wompi** - Guía completa de integración  

---

## 📋 Pasos Para Activar Wompi

### **PASO 1: Obtener Credenciales de Wompi**

1. Accede a tu Dashboard de Wompi
   - URL: https://app.wompi.sv

2. Ve a **Configuración** → **Mi Negocio**
   - Copia tu **Merchant ID**

3. Ve a **Configuración** → **API**
   - Copia tu **Public Key** (NEXT_PUBLIC)
   - Copia tu **Secret Key** (SECRETA)

4. Ve a **Configuración** → **Webhooks**
   - Copia el **Secret Key** del webhook

### **PASO 2: Configurar Variables de Entorno**

En tu archivo `.env.local` (o `.env.local.example`):

```env
# Wompi Configuration
NEXT_PUBLIC_WOMPI_MERCHANT_ID=abc123def456
WOMPI_API_KEY=sk_live_123456789abcdef
WOMPI_WEBHOOK_SECRET=webhook_secret_xyz
WOMPI_PUBLIC_KEY=pk_live_abcdef123456
```

### **PASO 3: Configurar Webhook en Wompi**

1. En Dashboard Wompi → **Configuración** → **Webhooks**

2. Agrega una nueva URL:
   ```
   https://tudominio.com/api/webhooks/wompi
   ```

3. Eventos a habilitar:
   - ✅ `pago_exitoso`
   - ✅ `pago_fallido`
   - ✅ `pago_pendiente`

4. Copia el **Secret** generado
   - Pégalo en `WOMPI_WEBHOOK_SECRET`

### **PASO 4: Actualizar Base de Datos**

Si aún no has agregado estos campos a tu tabla `pedidos`:

```sql
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS (
  payment_method VARCHAR(50),           -- 'whatsapp' o 'wompi'
  payment_id VARCHAR(255),              -- ID de transacción Wompi
  payment_status VARCHAR(50),           -- 'pending', 'completed', 'failed'
  payment_date TIMESTAMPTZ              -- Fecha del pago
);
```

O ejecuta en Supabase SQL Editor:

```sql
ALTER TABLE public.pedidos
ADD COLUMN payment_method text,
ADD COLUMN payment_id text,
ADD COLUMN payment_status text,
ADD COLUMN payment_date timestamptz;
```

### **PASO 5: Probar en Desarrollo**

#### **Opción A: Local (sin webhooks)**
```bash
npm run dev
# Accede a http://localhost:3000
# Prueba el flujo de compra
# Los webhooks no llegarán, pero el workflow funciona
```

#### **Opción B: Con Ngrok (webhooks locales)**

1. Instala ngrok:
   ```bash
   npm install -g ngrok
   ```

2. En otra terminal, expone tu puerto 3000:
   ```bash
   ngrok http 3000
   ```

3. Copia la URL de ngrok: `https://xxxxx.ngrok.io`

4. Configura el webhook en Wompi:
   ```
   https://xxxxx.ngrok.io/api/webhooks/wompi
   ```

5. Prueba los pagos: Los webhooks llegarán en tiempo real

### **PASO 6: Datos de Prueba**

**Tarjeta Crédito:**
```
4111 1111 1111 1111
12/25
123
```

**Nequi:**
```
70123456
1234 (PIN)
```

**Bitcoin:** (Solo red de prueba)

---

## 🔧 Mejoras Pendientes

Estas son opcionales pero recomendadas:

### 1. **Endpoint para Generar Links Dinámicos**
```typescript
// POST /api/wompi/create-payment
// Genera un link único para cada pedido
```

### 2. **Confirmación Automática de Pagos**
- El webhook actualiza el pedido
- Email automático al cliente
- SMS de confirmación

### 3. **Reporte de Transacciones**
- Dashboard mostrando pagos Wompi vs WhatsApp
- Análisis de conversion rate

### 4. **Manejo de Errores**
- Reintentar pago
- Cambiar método de pago
- Validaciones mejoradas

---

## 🧪 Cómo Probar Ahora

### **SIN Credenciales de Wompi (Solo WhatsApp)**

El sitio funciona completamente sin Wompi. Los clientes pueden:

1. Agregar pines al carrito ✅
2. Completar nombre y email ✅
3. Seleccionar **"WhatsApp"** ✅
4. Pagar por WhatsApp ✅

El botón de Wompi estará disponible una vez que agregues las credenciales.

### **CON Credenciales de Wompi**

1. Agrega las variables de entorno
2. Reinicia: `npm run dev`
3. Los clientes verán dos botones:
   - 💬 **WhatsApp** (funcionaba antes)
   - 💳 **Wompi** (nuevo)

---

## 📊 Flujo Completo Wompi

```
Cliente compra pines
    ↓
Click "Wompi" en carrito
    ↓
Llena: nombre, teléfono, email
    ↓
Se abre ventana de Wompi
    ↓
Cliente elige método de pago:
   - Tarjeta de crédito
   - Nequi
   - Bitcoin
   - Cuotas Banco Agrícola
    ↓
Pago se procesa
    ↓
Wompi envía webhook a tu servidor
    ↓
Server verifica pago
    ↓
Pedido se marca como "completado"
    ↓
Cliente recibe email de confirmación
    ↓
Admin ve pedido completado en dashboard
    ↓
Admin puede generar factura
    ↓
Admin puede enviar por WhatsApp
```

---

## ⚠️ Cosas Importantes

### Seguridad
- ✅ NUNCA expongas `WOMPI_API_KEY` en el frontend
- ✅ NUNCA subas `.env.local` a GitHub
- ✅ Verifica siempre la firma del webhook
- ✅ Usa HTTPS en producción

### Testing
- ✅ Prueba con tarjetas de prueba en modo sandbox
- ✅ Verifica que los webhooks lleguen
- ✅ Prueba en móvil (es donde va a estar)

### Producción
- ✅ Obtén credenciales de producción en Wompi
- ✅ Cambia a modo LIVE
- ✅ Configura HTTPS
- ✅ Prueba con pequeños montos reales

---

## 📞 Soporte

**Si tienes problemas:**

1. **Webhooks no llegan:**
   - Verifica URL en Wompi
   - Comprueba que el servidor está activo
   - Revisa logs de Wompi

2. **Pago no se procesa:**
   - Verifica credenciales en `.env.local`
   - Comprueba modo sandbox vs producción
   - Revisa consola del navegador (F12)

3. **Email no llega:**
   - Configura SMTP
   - Verifica email del cliente
   - Revisa spam

**Contacto Wompi:** support@wompi.sv  
**Documentación:** https://developers.wompi.sv

---

## ✅ Checklist Final

- [ ] Credenciales de Wompi obtenidas
- [ ] Variables de entorno configuradas
- [ ] Base de datos actualizada
- [ ] Webhook configurado en Wompi
- [ ] Probado en desarrollo con ngrok
- [ ] Probado pago de prueba
- [ ] Email de confirmación funciona
- [ ] Dashboard admin actualizado
- [ ] HTTPS configurado (producción)
- [ ] Documentación actualizada

¡Listo para recibir pagos con Wompi! 🎉
