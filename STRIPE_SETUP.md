# 🚀 Configuración de Stripe para Pagos

## 📋 Pasos para Configurar los Precios

### 1. Crear Productos en Stripe Dashboard

Ve a [Stripe Dashboard > Productos](https://dashboard.stripe.com/products) y crea los siguientes productos:

#### **Producto Plus**
- **Nombre**: Plus
- **Descripción**: Plan Plus para creadores profesionales
- **Tipo**: Servicio

#### **Producto Pro** 
- **Nombre**: Pro
- **Descripción**: Plan Pro para equipos y empresas
- **Tipo**: Servicio

### 2. Crear Precios para Cada Producto

Para cada producto, crea los siguientes precios:

#### **Plus Mensual**
- **Precio**: €29.00 EUR
- **Facturación**: Recurrente - Cada mes
- **Período de prueba**: 14 días

#### **Plus Anual**
- **Precio**: €276.00 EUR (€23/mes facturado anualmente)
- **Facturación**: Recurrente - Cada año
- **Período de prueba**: 14 días

#### **Pro Mensual**
- **Precio**: €99.00 EUR
- **Facturación**: Recurrente - Cada mes
- **Período de prueba**: 14 días

#### **Pro Anual**
- **Precio**: €948.00 EUR (€79/mes facturado anualmente)
- **Facturación**: Recurrente - Cada año
- **Período de prueba**: 14 días

### 3. Actualizar Configuración

Una vez creados los precios, copia los IDs de precios de Stripe y actualiza el archivo `config/stripe-prices.ts`:

```typescript
export const STRIPE_PRICES = {
  // Reemplaza estos con tus IDs reales de Stripe
  PLUS_MONTHLY: 'price_1234567890abcdef', 
  PLUS_YEARLY: 'price_0987654321fedcba',   
  PRO_MONTHLY: 'price_abcdef1234567890',   
  PRO_YEARLY: 'price_fedcba0987654321',     
} as const;
```

### 4. Configurar Variables de Entorno

Asegúrate de tener configuradas las siguientes variables en tu `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...  # Tu clave secreta de Stripe
STRIPE_WEBHOOK_SECRET=whsec_... # Secreto del webhook
BASE_URL=http://localhost:3000  # Tu URL base
```

### 5. Configurar Webhook

1. Ve a [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Crea un nuevo webhook con la URL: `{TU_DOMINIO}/api/stripe/webhook`
3. Selecciona estos eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`

## 🧪 Testing

Para pruebas, usa estas tarjetas de test de Stripe:

- **Pago exitoso**: `4242 4242 4242 4242`
- **Pago declinado**: `4000 0000 0000 0002`
- **Requiere autenticación**: `4000 0025 0000 3155`

## ✅ Verificación

Una vez configurado todo:

1. ✅ Los productos están creados en Stripe
2. ✅ Los precios están configurados con períodos de prueba
3. ✅ Los IDs están actualizados en `stripe-prices.ts`
4. ✅ Las variables de entorno están configuradas
5. ✅ El webhook está funcionando
6. ✅ Los pagos de test funcionan correctamente

## 🚀 Ir a Producción

Para producción:

1. Cambia a las claves de producción de Stripe
2. Actualiza la URL del webhook a tu dominio de producción
3. Actualiza `BASE_URL` en las variables de entorno
4. Haz pruebas con tarjetas reales

## 📞 Soporte

Si tienes problemas:
- Revisa los logs de Stripe Dashboard
- Verifica que los webhooks estén recibiendo eventos
- Comprueba que los IDs de precios sean correctos 