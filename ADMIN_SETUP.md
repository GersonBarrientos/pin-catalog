# 🚀 Guía de Instalación y Uso - PinArt Admin Dashboard

## ✅ Requisitos Completados

Tu panel de administración ahora incluye:

1. ✅ **Generación de Facturas/Tickets en PDF**
2. ✅ **Visualización de Imágenes en Pedidos**
3. ✅ **Envío de Facturas por WhatsApp**
4. ✅ **Módulo de Estadísticas y Reportes**
5. ✅ **Sistema de Contabilidad y Análisis**
6. ✅ **Exportación de Reportes CSV**
7. ✅ **Dashboard Profesional**
8. ✅ **Gestión Completa del Inventario**

---

## 📦 Instalación de Dependencias

Ya hemos instalado las siguientes librerías:

```bash
npm install jspdf html2canvas date-fns recharts --save
```

**Paquetes instalados:**
- `jspdf` (^2.5.1) - Generación de PDFs
- `html2canvas` (^1.4.1) - Conversión HTML a imagen
- `date-fns` (^2.30.0) - Manipulación de fechas
- `recharts` (^2.10.3) - Gráficos React

---

## 🏃 Cómo Ejecutar la Aplicación

### 1. Instala las dependencias (si aún no lo hiciste):
```bash
cd "C:\Users\Gerson Barrientos\PinArt"
npm install
```

### 2. Inicia el servidor de desarrollo:
```bash
npm run dev
```

### 3. Accede al panel de administración:
- URL: `http://localhost:3000/admin`
- Login requerido (usa tus credenciales de Supabase)

---

## 📊 Características del Admin Panel

### **Pestaña 1: Órdenes** 📦
Gestiona todos los pedidos de clientes:

**Funcionalidades:**
- ✅ Ver órdenes pendientes con imágenes de productos
- ✅ Visualizar datos del cliente (nombre, teléfono)
- ✅ Ver imágenes de los pines en cada orden
- ✅ **Descargar PDF**: Genera factura profesional
- ✅ **Enviar por WhatsApp**: Manda resumen al cliente
- ✅ Marcar como completada o cancelar
- ✅ Si cancelas, devuelve stock automáticamente

**Botones Principales:**
```
┌─────────────┬──────────────────┐
│  Completar  │  Cancelar y Dev.  │  (Fila 1)
├─────────────┴──────────────────┤
│  Descargar PDF  │  Enviar WhatsApp │  (Fila 2)
└─────────────────────────────────┘
```

### **Pestaña 2: Estadísticas** 📈
Análisis completo de tu negocio:

**Métricas Principales:**
- 💰 Total de Ventas (dinero total)
- 🎯 Órdenes Completadas
- 📊 Ticket Promedio
- ⚠️ Productos Sin Stock

**Análisis Detallado:**
- Estado de órdenes (pendientes, completadas, canceladas)
- Valor total de inventario
- Tasa de conversión (%)
- Top 5 productos más vendidos

**Gráficos Interactivos:**
- 📉 Línea: Ventas diarias (últimos 30 días)
- 📊 Barras: Ventas por mes
- 📋 Tabla: Productos más vendidos

**Acciones:**
- ⬇️ **Exportar CSV**: Descarga datos para Excel/Sheets

### **Pestaña 3: Inventario** 📦
Gestión completa de tu catálogo:

**Funcionalidades:**
- ✅ Ver todos los pines con imágenes
- ✅ **Agregar Pin**: Nuevo producto
- ✅ **Editar**: Cambiar nombre, precio, stock, foto
- ✅ **Eliminar**: Quitar del catálogo
- ✅ Subir imágenes (almacenadas en Supabase)
- ✅ Cambios en tiempo real

---

## 🎯 Flujos de Uso Detallados

### **Flujo A: Cliente Compra → Admin Procesa**

1. **Cliente compra** en `http://localhost:3000`
   - Ve pines en grid
   - Agrega al carrito
   - Pone su nombre y teléfono
   - Confirma compra (va a WhatsApp)

2. **Admin recibe la orden**
   - Va a `http://localhost:3000/admin`
   - Entra a pestaña **Órdenes**
   - Ve nueva orden pendiente con:
     - Nombre del cliente
     - Teléfono
     - Imágenes de los productos
     - Total del pedido
     - Fecha y hora

3. **Admin genera Factura**
   - Click en **"Descargar PDF"**
   - Se descarga factura profesional:
     - Número de factura único
     - Datos del cliente
     - Tabla con productos y precios
     - Total final
     - Branding de PinArt

4. **Admin envía por WhatsApp**
   - Click en **"Enviar WhatsApp"**
   - Se abre WhatsApp automáticamente
   - Con mensaje: "Cliente, aquí está tu factura..."
   - Cliente recibe detalles

5. **Admin confirma pago**
   - Click en **"Completar"**
   - Orden se marca como entregada
   - Aparece en historial de completadas

### **Flujo B: Ver Estadísticas del Mes**

1. Admin va a **Pestaña Estadísticas**

2. Ve **4 tarjetas principales:**
   - Total de Ventas: $1,250.50
   - Órdenes Completadas: 13
   - Ticket Promedio: $96.19
   - Productos Sin Stock: 3

3. Observa **Estado General:**
   - Órdenes: 2 pendientes, 13 completadas, 1 cancelada
   - Inventario: $5,000 en stock, 3 items sin stock
   - Tasa de completadas: 86.7%

4. Analiza **Gráficos:**
   - Línea: Ventas de los últimos 30 días
   - Barras: Comparación por mes
   - Tabla: Qué productos venden más

5. **Descarga Reporte:**
   - Click en **"Exportar CSV"**
   - Se descarga `reporte-ventas-{timestamp}.csv`
   - Abre en Excel para análisis profundo

### **Flujo C: Administrar Inventario**

1. Admin va a **Pestaña Inventario**

2. **Agregar nuevo pin:**
   - Click **"Agregar Pin"**
   - Modal abierto
   - Completa:
     - Nombre: "Pin Dragonball Z"
     - Descripción: "Pin de colección"
     - Precio: 25.00
     - Stock inicial: 50
     - Sube foto
   - Click **"Guardar Pin"**

3. **Editar pin existente:**
   - Hover sobre pin
   - Click en lápiz (✏️)
   - Cambia precio, stock, foto
   - Click **"Guardar Pin"**

4. **Eliminar pin:**
   - Hover sobre pin
   - Click en papelera (🗑️)
   - Confirma
   - Pin se elimina

5. **Cambios en tiempo real:**
   - Si editas stock desde admin
   - La web pública se actualiza al instante
   - Clientes ven disponibilidad correcta

---

## 📄 Estructura de Archivos Nuevos

```
src/
├── lib/
│   ├── invoice-generator.ts      ← Generación de PDFs
│   └── sales-metrics.ts           ← Análisis de ventas
├── components/
│   ├── AdminDashboardClient.tsx   ← Main (MODIFICADO)
│   ├── AdminOrdersManager.tsx     ← Gestión de órdenes
│   ├── AdminStats.tsx             ← Estadísticas
│   └── AdminCatalogManager.tsx    ← Inventario (sin cambios)
```

---

## 🔧 Funciones Utilizables

### Generar Factura:
```typescript
import { downloadInvoicePDF } from '@/lib/invoice-generator';

await downloadInvoicePDF({
  pedidoId: 'abc123',
  clienteName: 'Gerson Barrientos',
  clientePhone: '+1234567890',
  items: [
    { nombre: 'Pin Dragon', cantidad: 2, precio: 25 }
  ],
  total: 50,
  fecha: new Date().toISOString(),
});
```

### Enviar por WhatsApp:
```typescript
import { sendInvoiceViaWhatsApp } from '@/lib/invoice-generator';

await sendInvoiceViaWhatsApp(invoiceData, '+1234567890');
```

### Calcular Métricas:
```typescript
import { calculateSalesMetrics } from '@/lib/sales-metrics';

const metrics = calculateSalesMetrics(pedidos, pins);
// Retorna: totalSales, totalOrders, topProducts, etc.
```

---

## 🚨 Troubleshooting

### Problema: Los gráficos no cargan
**Solución:** Asegúrate de que `recharts` esté instalado:
```bash
npm install recharts --save
```

### Problema: Las imágenes no aparecen en PDF
**Solución:** Verifica que las URLs de las imágenes sean accesibles
```bash
# Esto debe devolver la imagen
curl https://tu-bucket-supabase.com/imagen.jpg
```

### Problema: WhatsApp no abre
**Solución:** Verifica que el número de teléfono tenga formato internacional
```javascript
// Correcto: +11234567890 o 11234567890
// Incorrecto: (123) 456-7890
```

### Problema: PDF muy grande
**Solución:** Reduce la calidad de las imágenes en AdminOrdersManager.tsx

---

## 📱 Responsividad

El panel funciona en:
- ✅ Desktop (1920px+)
- ✅ Laptop (1366px+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

---

## 🎨 Personalización

### Cambiar colores:
Edita `src/app/globals.css`:
```css
--primary: #3b82f6;  /* Azul */
--secondary: #8b5cf6; /* Púrpura */
--accent: #ec4899;   /* Rosa */
```

### Cambiar logo:
Reemplaza en `AdminDashboardClient.tsx`:
```typescript
<h1 className="text-5xl font-black">PinArt</h1>
```

---

## 🔐 Variables de Entorno Requeridas

En `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🚀 Deploy en Producción

```bash
# Build
npm run build

# Verificar
npm start

# Deploy a Vercel
vercel deploy --prod
```

---

## 📞 Soporte & Actualizaciones

Para bugs o sugerencias:
1. Revisa la consola de desarrollador (F12)
2. Verifica los logs de Supabase
3. Prueba en modo incógnito

---

**¡Tu panel de administración está listo para usar!** 🎉

Ahora puedes:
1. ✅ Ver todas las órdenes con imágenes
2. ✅ Generar facturas PDF profesionales
3. ✅ Enviar facturas por WhatsApp
4. ✅ Analizar ventas con gráficos
5. ✅ Exportar reportes
6. ✅ Gestionar inventario completo

¡Que disfrutes administrando tu negocio! 🎊
