# 🔧 Guía de Integración de Stripe - Backend

## 📋 RESUMEN EJECUTIVO

**Problema:** El backend devuelve `clientSecret` mock (`pi_mock_...`) que no funciona con Stripe.js.

**Solución:** Usar la API real de Stripe para crear Payment Intents y devolver el `clientSecret` real.

**Acción requerida:** Implementar los endpoints usando `stripe.paymentIntents.create()` y devolver `paymentIntent.client_secret` (NO valores mock).

---

## ⚠️ PROBLEMA ACTUAL

El backend está devolviendo un `clientSecret` con formato mock (`pi_mock_...`) que **NO es válido** para Stripe.js en el frontend. Stripe requiere un `clientSecret` real generado por su API.

**Error actual:**
```
Invalid value for stripe.confirmCardPayment intent secret: 
value should be a client secret of the form ${id}_secret_${secret}. 
You specified: pi_mock_1762626109106_secret_yu8zsj.
```

---

## 📋 REQUISITOS

### 1. Instalación de Stripe

```bash
npm install stripe
# o
yarn add stripe
```

### 2. Variables de Entorno

Agregar en el archivo `.env` del backend:

```env
# Stripe Secret Key (NUNCA exponer esta clave en el frontend)
STRIPE_SECRET_KEY=sk_test_51SRF80BKr0sSqmIZYTdA95PzpoGwrJ9SRepCx70oDiZixvSxRGbGos40M2BQCCeuLY0vYnCYmkjavPYhU3wh0VsG00ehrDIg4J

# Stripe Publishable Key (esta se usa en el frontend)
STRIPE_PUBLISHABLE_KEY=pk_test_51SRF80BKr0sSqmIZYTdA95PzpoGwrJ9SRepCx70oDiZixvSxRGbGos40M2BQCCeuLY0vYnCYmkjavPYhU3wh0VsG00ehrDIg4J
```

**⚠️ IMPORTANTE:** 
- La `STRIPE_SECRET_KEY` solo debe estar en el backend
- La `STRIPE_PUBLISHABLE_KEY` puede estar en el frontend
- **NUNCA** uses valores mock o hardcodeados

---

## 🎯 ENDPOINT: Crear Payment Intent

### Ruta: `POST /api/payments/checkout/create-intent`

### Request Body:

```json
{
  "propertyId": "prop_123",
  "checkIn": "2024-03-15",
  "checkOut": "2024-03-20",
  "guests": 2,
  "reservationId": "optional_reservation_id" // Opcional
}
```

### Implementación Correcta:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/checkout/create-intent
async function createPaymentIntent(req, res) {
  try {
    const { propertyId, checkIn, checkOut, guests, reservationId } = req.body;
    const userId = req.user.id; // Del middleware de autenticación

    // 1. Validar datos de entrada
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: propertyId, checkIn, checkOut, guests'
      });
    }

    // 2. Obtener la propiedad y calcular el precio total
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }

    // 3. Calcular el precio total (usar la misma lógica que en /calculate)
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const totalNights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const subtotal = property.pricePerNight * totalNights;
    const cleaningFee = Math.round(subtotal * 0.05);
    const serviceFee = Math.round(subtotal * 0.08);
    const taxes = Math.round(subtotal * 0.12);
    const total = subtotal + cleaningFee + serviceFee + taxes;

    // 4. Convertir a centavos (Stripe usa centavos)
    const amountInCents = Math.round(total * 100);

    // 5. Crear Payment Intent con Stripe REAL
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        propertyId: propertyId,
        userId: userId,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: guests.toString(),
        reservationId: reservationId || null
      },
      // Opcional: configurar métodos de pago permitidos
      payment_method_types: ['card'],
    });

    // 6. IMPORTANTE: Usar el client_secret REAL de Stripe
    // NO crear valores mock como "pi_mock_..."
    const clientSecret = paymentIntent.client_secret;
    const paymentIntentId = paymentIntent.id;

    // 7. Validar que el clientSecret tenga el formato correcto
    if (!clientSecret || !clientSecret.includes('_secret_')) {
      console.error('❌ Error: Stripe no devolvió un clientSecret válido');
      return res.status(500).json({
        success: false,
        message: 'Error creando payment intent'
      });
    }

    // 8. Guardar el Payment Intent en la base de datos (opcional pero recomendado)
    await PaymentIntent.create({
      paymentIntentId: paymentIntentId,
      userId: userId,
      propertyId: propertyId,
      amount: total,
      amountInCents: amountInCents,
      currency: 'usd',
      status: paymentIntent.status,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests
    });

    // 9. Devolver respuesta
    return res.status(200).json({
      success: true,
      data: {
        clientSecret: clientSecret, // ✅ Este es el REAL de Stripe
        paymentIntentId: paymentIntentId
      }
    });

  } catch (error) {
    console.error('❌ Error creando payment intent:', error);
    
    // Si es un error de Stripe, devolver mensaje más específico
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear payment intent'
    });
  }
}
```

---

## 🎯 ENDPOINT: Confirmar Pago

### Ruta: `POST /api/payments/checkout/confirm`

### Request Body:

```json
{
  "paymentIntentId": "pi_1AbCdEfGhIjKlMnOpQrStUvWxYz",
  "checkIn": "2024-03-15",
  "checkOut": "2024-03-20",
  "guests": 2,
  "guestInfo": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "+1234567890",
    "specialRequests": "Llegada tardía después de las 8 PM"
  }
}
```

### Implementación Correcta:

```javascript
// POST /api/payments/checkout/confirm
async function confirmPayment(req, res) {
  try {
    const { paymentIntentId, checkIn, checkOut, guests, guestInfo } = req.body;
    const userId = req.user.id;

    // 1. Validar datos
    if (!paymentIntentId || !checkIn || !checkOut || !guests || !guestInfo) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }

    // 2. Verificar el Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 3. Validar que el Payment Intent pertenezca al usuario
    if (paymentIntent.metadata.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para este payment intent'
      });
    }

    // 4. Verificar que el pago fue exitoso
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `El pago no fue exitoso. Estado: ${paymentIntent.status}`
      });
    }

    // 5. Crear la reserva en la base de datos
    const reservation = await Reservation.create({
      userId: userId,
      propertyId: paymentIntent.metadata.propertyId,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests,
      totalPrice: paymentIntent.amount / 100, // Convertir de centavos a dólares
      status: 'confirmed',
      paymentIntentId: paymentIntentId,
      guestInfo: guestInfo
    });

    // 6. Crear registro de transacción
    const transaction = await Transaction.create({
      userId: userId,
      reservationId: reservation.id,
      paymentIntentId: paymentIntentId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'completed',
      stripePaymentIntentId: paymentIntentId
    });

    // 7. Actualizar el Payment Intent en la BD
    await PaymentIntent.updateOne(
      { paymentIntentId: paymentIntentId },
      { 
        status: 'succeeded',
        reservationId: reservation.id,
        transactionId: transaction.id
      }
    );

    // 8. Devolver respuesta
    return res.status(200).json({
      success: true,
      data: {
        reservationId: reservation.id,
        bookingId: reservation.id, // Puede ser el mismo o diferente
        transactionId: transaction.id
      }
    });

  } catch (error) {
    console.error('❌ Error confirmando pago:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al confirmar pago'
    });
  }
}
```

---

## 🎯 ENDPOINT: Calcular Checkout

### Ruta: `POST /api/payments/checkout/calculate`

### Request Body:

```json
{
  "propertyId": "prop_123",
  "checkIn": "2024-03-15",
  "checkOut": "2024-03-20",
  "guests": 2
}
```

### Response:

```json
{
  "success": true,
  "data": {
    "subtotal": 750,
    "cleaningFee": 37.5,
    "serviceFee": 60,
    "taxes": 90,
    "total": 937.5,
    "totalNights": 5
  }
}
```

---

## ✅ VALIDACIONES IMPORTANTES

### 1. Formato del Client Secret

El `clientSecret` que devuelve Stripe debe tener el formato:
```
pi_1AbCdEfGhIjKlMnOpQrStUvWxYz_secret_...
```

**❌ INCORRECTO:**
- `pi_mock_1762626109106_secret_yu8zsj` (mock)
- `pi_test_...` (no existe este formato)
- Cualquier valor hardcodeado

**✅ CORRECTO:**
- `pi_1AbCdEfGhIjKlMnOpQrStUvWxYz_secret_...` (real de Stripe)

### 2. Verificación del Client Secret

Antes de devolver el `clientSecret`, verificar:

```javascript
// Validar que el clientSecret tenga el formato correcto
if (!paymentIntent.client_secret || !paymentIntent.client_secret.includes('_secret_')) {
  throw new Error('Stripe no devolvió un clientSecret válido');
}

// Validar que NO sea un mock
if (paymentIntent.client_secret.includes('_mock_') || 
    paymentIntent.client_secret.startsWith('pi_mock')) {
  throw new Error('El clientSecret es un mock. Usa Stripe real.');
}
```

---

## 🧪 PRUEBAS

### Tarjetas de Prueba de Stripe

Para testing, usa estas tarjetas (con Stripe en modo test):

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 0002` | Tarjeta rechazada |
| `4000 0000 0000 9995` | Fondos insuficientes |

**Cualquier fecha futura y cualquier CVC de 3 dígitos funcionará.**

---

## 📤 FORMATO DE RESPUESTAS ESPERADAS

### Respuesta de `create-intent` (ÉXITO):

```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1AbCdEfGhIjKlMnOpQrStUvWxYz_secret_xyz123abc456",
    "paymentIntentId": "pi_1AbCdEfGhIjKlMnOpQrStUvWxYz"
  }
}
```

**⚠️ IMPORTANTE:** 
- El `clientSecret` debe ser el valor REAL que devuelve Stripe
- Debe contener `_secret_` en el string
- NO debe contener `_mock_` o empezar con `pi_mock`

### Respuesta de `create-intent` (ERROR):

```json
{
  "success": false,
  "message": "Error creando payment intent: [descripción del error]"
}
```

### Respuesta de `confirm` (ÉXITO):

```json
{
  "success": true,
  "data": {
    "reservationId": "res_123456789",
    "bookingId": "res_123456789",
    "transactionId": "trans_123456789"
  }
}
```

### Respuesta de `confirm` (ERROR):

```json
{
  "success": false,
  "message": "El pago no fue exitoso. Estado: requires_payment_method"
}
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Instalar `stripe` en el backend
- [ ] Agregar `STRIPE_SECRET_KEY` en variables de entorno
- [ ] Implementar endpoint `/api/payments/checkout/create-intent` usando Stripe real
- [ ] Implementar endpoint `/api/payments/checkout/confirm` usando Stripe real
- [ ] Verificar que el `clientSecret` tenga el formato correcto
- [ ] Eliminar cualquier código mock o hardcodeado
- [ ] Probar con tarjetas de prueba de Stripe
- [ ] Verificar que los errores se manejen correctamente

---

## 🔍 DEBUGGING

### Logs Recomendados

```javascript
// Al crear el Payment Intent
console.log('🔍 Creando Payment Intent con Stripe...');
console.log('💰 Monto:', amountInCents, 'centavos');
console.log('✅ Payment Intent creado:', paymentIntent.id);
console.log('🔑 Client Secret (primeros 30 chars):', paymentIntent.client_secret.substring(0, 30) + '...');

// Al confirmar el pago
console.log('🔍 Verificando Payment Intent:', paymentIntentId);
console.log('✅ Estado del pago:', paymentIntent.status);
console.log('💰 Monto pagado:', paymentIntent.amount / 100);
```

---

## ⚠️ ERRORES COMUNES

### 1. Usar valores mock
```javascript
// ❌ INCORRECTO
const clientSecret = `pi_mock_${Date.now()}_secret_${Math.random()}`;

// ✅ CORRECTO
const paymentIntent = await stripe.paymentIntents.create({...});
const clientSecret = paymentIntent.client_secret;
```

### 2. No convertir a centavos
```javascript
// ❌ INCORRECTO
amount: 100 // Stripe espera centavos

// ✅ CORRECTO
amount: 10000 // $100.00 en centavos
```

### 3. No validar el clientSecret
```javascript
// ❌ INCORRECTO
return { clientSecret: paymentIntent.client_secret };

// ✅ CORRECTO
if (!paymentIntent.client_secret || !paymentIntent.client_secret.includes('_secret_')) {
  throw new Error('ClientSecret inválido');
}
return { clientSecret: paymentIntent.client_secret };
```

---

## 📞 SOPORTE

Si tienes problemas:

1. Verifica que `STRIPE_SECRET_KEY` esté configurada correctamente
2. Verifica que estés usando la clave de **test** o **producción** según corresponda
3. Revisa los logs del servidor para ver errores de Stripe
4. Consulta la [documentación oficial de Stripe](https://stripe.com/docs/api/payment_intents)

---

## 🎯 RESUMEN

**Lo más importante:**

1. ✅ Usa `stripe.paymentIntents.create()` para crear Payment Intents REALES
2. ✅ Devuelve `paymentIntent.client_secret` (NO valores mock)
3. ✅ Convierte los montos a centavos antes de enviar a Stripe
4. ✅ Valida que el `clientSecret` tenga el formato correcto
5. ✅ Maneja errores de Stripe apropiadamente

**El frontend ya está listo y esperando un `clientSecret` real de Stripe.**

