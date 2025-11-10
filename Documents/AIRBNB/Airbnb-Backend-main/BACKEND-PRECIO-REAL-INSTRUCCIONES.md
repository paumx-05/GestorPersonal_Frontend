# 💰 Instrucciones: Cobrar Precio Real de Propiedad en Stripe

## 📋 Objetivo

Asegurar que Stripe cobre el **precio real de cada propiedad** (no un precio fijo) con impuestos y servicios calculados correctamente.

---

## ⚠️ Problema Actual

Si Stripe está cobrando siempre **$148.50** (o cualquier precio fijo), significa que el backend tiene un precio hardcodeado en lugar de usar el precio real de la propiedad desde la base de datos.

---

## ✅ Solución: Usar Precio Real de la Propiedad

### Ubicación del Código

**Archivo del Backend:**
- `src/controllers/payments/paymentController.ts`
- Función: `createPaymentIntentController` (aproximadamente línea 426)

---

## 🔧 Implementación Correcta

### Paso 1: Obtener la Propiedad de la Base de Datos

```javascript
// ✅ CORRECTO: Obtener la propiedad desde la base de datos
const property = await Property.findById(propertyId);

if (!property) {
  return res.status(404).json({
    success: false,
    message: 'Propiedad no encontrada'
  });
}

// Verificar que la propiedad tiene un precio válido
if (!property.pricePerNight || property.pricePerNight <= 0) {
  return res.status(400).json({
    success: false,
    message: 'La propiedad no tiene un precio válido'
  });
}
```

### Paso 2: Calcular el Precio Total con Impuestos y Servicios

```javascript
// Calcular número de noches
const startDate = new Date(checkIn);
const endDate = new Date(checkOut);
const totalNights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

// ✅ CORRECTO: Usar el precio REAL de la propiedad
const pricePerNight = property.pricePerNight;  // Precio real desde la BD

// Calcular subtotal (precio por noche × número de noches)
const subtotal = pricePerNight * totalNights;

// Calcular tarifas e impuestos (redondeados a 2 decimales)
const cleaningFee = Math.round(subtotal * 0.05 * 100) / 100;  // 5% del subtotal
const serviceFee = Math.round(subtotal * 0.08 * 100) / 100;   // 8% del subtotal
const taxes = Math.round(subtotal * 0.12 * 100) / 100;        // 12% del subtotal

// Calcular total final
const total = subtotal + cleaningFee + serviceFee + taxes;

// Logs para verificación (importante para debugging)
console.log('🔍 [Backend] Cálculo de precio:');
console.log('  - Property ID:', propertyId);
console.log('  - Precio por noche (desde BD):', pricePerNight);
console.log('  - Noches:', totalNights);
console.log('  - Subtotal:', subtotal);
console.log('  - Tarifa de limpieza (5%):', cleaningFee);
console.log('  - Tarifa de servicio (8%):', serviceFee);
console.log('  - Impuestos (12%):', taxes);
console.log('  - Total:', total);
```

### Paso 3: Convertir a Centavos para Stripe

```javascript
// Stripe requiere el monto en centavos (no en dólares)
const amountInCents = Math.round(total * 100);

console.log('🔍 [Backend] Monto para Stripe (centavos):', amountInCents);
console.log('🔍 [Backend] Monto para Stripe (dólares):', amountInCents / 100);
```

### Paso 4: Crear Payment Intent con Stripe

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Crear Payment Intent con el monto calculado
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountInCents,  // ✅ Usa el total calculado (precio real + impuestos + servicios)
  currency: 'usd',
  metadata: {
    propertyId: propertyId,
    userId: userId.toString(),
    checkIn: checkIn,
    checkOut: checkOut,
    guests: guests.toString(),
    pricePerNight: pricePerNight.toString(),  // Guardar precio por noche para referencia
    totalNights: totalNights.toString(),
    subtotal: subtotal.toString(),
    cleaningFee: cleaningFee.toString(),
    serviceFee: serviceFee.toString(),
    taxes: taxes.toString(),
    total: total.toString()
  },
  payment_method_types: ['card'],
});

// Obtener el clientSecret real de Stripe
const clientSecret = paymentIntent.client_secret;
const paymentIntentId = paymentIntent.id;

console.log('✅ [Backend] Payment Intent creado en Stripe');
console.log('  - PaymentIntentId:', paymentIntentId);
console.log('  - Monto cobrado:', amountInCents / 100, 'USD');
```

---

## ❌ Código Incorrecto (NO Hacer Esto)

```javascript
// ❌ INCORRECTO: Precio fijo hardcodeado
const FIXED_PRICE = 148.50;
const subtotal = FIXED_PRICE * totalNights;

// ❌ INCORRECTO: No obtener la propiedad de la BD
const subtotal = 148.50 * totalNights;

// ❌ INCORRECTO: Usar un precio por defecto en lugar del real
const pricePerNight = property.pricePerNight || 148.50;  // Fallback incorrecto
```

---

## 📝 Código Completo del Endpoint

```javascript
// POST /api/payments/checkout/create-intent
async function createPaymentIntentController(req, res) {
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

    // 2. Obtener la propiedad desde la base de datos
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }

    // 3. Verificar que la propiedad tiene un precio válido
    if (!property.pricePerNight || property.pricePerNight <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La propiedad no tiene un precio válido'
      });
    }

    // 4. Calcular número de noches
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const totalNights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    // 5. ✅ USAR EL PRECIO REAL DE LA PROPIEDAD (NO un precio fijo)
    const pricePerNight = property.pricePerNight;

    // 6. Calcular subtotal usando el precio real
    const subtotal = pricePerNight * totalNights;

    // 7. Calcular tarifas e impuestos
    const cleaningFee = Math.round(subtotal * 0.05 * 100) / 100;  // 5% del subtotal
    const serviceFee = Math.round(subtotal * 0.08 * 100) / 100;   // 8% del subtotal
    const taxes = Math.round(subtotal * 0.12 * 100) / 100;        // 12% del subtotal

    // 8. Calcular total final
    const total = subtotal + cleaningFee + serviceFee + taxes;

    // 9. Logs para verificación (importante para debugging)
    console.log('🔍 [Backend] ============================================');
    console.log('🔍 [Backend] Creando Payment Intent');
    console.log('🔍 [Backend] Property ID:', propertyId);
    console.log('🔍 [Backend] Precio por noche (desde BD):', pricePerNight);
    console.log('🔍 [Backend] Noches:', totalNights);
    console.log('🔍 [Backend] Subtotal:', subtotal);
    console.log('🔍 [Backend] Tarifa de limpieza (5%):', cleaningFee);
    console.log('🔍 [Backend] Tarifa de servicio (8%):', serviceFee);
    console.log('🔍 [Backend] Impuestos (12%):', taxes);
    console.log('🔍 [Backend] Total:', total);
    console.log('🔍 [Backend] ============================================');

    // 10. Convertir a centavos (Stripe usa centavos)
    const amountInCents = Math.round(total * 100);

    console.log('🔍 [Backend] Monto para Stripe (centavos):', amountInCents);
    console.log('🔍 [Backend] Monto para Stripe (dólares):', amountInCents / 100);

    // 11. Crear Payment Intent con Stripe REAL
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,  // ✅ Monto calculado con precio real
      currency: 'usd',
      metadata: {
        propertyId: propertyId,
        userId: userId.toString(),
        checkIn: checkIn,
        checkOut: checkOut,
        guests: guests.toString(),
        pricePerNight: pricePerNight.toString(),
        totalNights: totalNights.toString(),
        subtotal: subtotal.toFixed(2),
        cleaningFee: cleaningFee.toFixed(2),
        serviceFee: serviceFee.toFixed(2),
        taxes: taxes.toFixed(2),
        total: total.toFixed(2),
        reservationId: reservationId || ''
      },
      payment_method_types: ['card'],
    });

    // 12. Obtener el clientSecret REAL de Stripe
    const clientSecret = paymentIntent.client_secret;
    const paymentIntentId = paymentIntent.id;

    // 13. Validar que el clientSecret tenga el formato correcto
    if (!clientSecret || !clientSecret.includes('_secret_')) {
      console.error('❌ [Backend] Error: Stripe no devolvió un clientSecret válido');
      return res.status(500).json({
        success: false,
        message: 'Error creando payment intent'
      });
    }

    // 14. Validar que NO sea un mock
    if (clientSecret.includes('_mock_') || clientSecret.startsWith('pi_mock')) {
      console.error('❌ [Backend] Error: El clientSecret es un mock. Usa Stripe real.');
      return res.status(500).json({
        success: false,
        message: 'Error: El servidor está usando datos de prueba'
      });
    }

    console.log('✅ [Backend] Payment Intent creado exitosamente');
    console.log('✅ [Backend] PaymentIntentId:', paymentIntentId);
    console.log('✅ [Backend] Monto cobrado por Stripe:', amountInCents / 100, 'USD');

    // 15. Devolver respuesta
    return res.status(200).json({
      success: true,
      data: {
        clientSecret: clientSecret,  // ✅ ClientSecret REAL de Stripe
        paymentIntentId: paymentIntentId
      }
    });

  } catch (error) {
    console.error('❌ [Backend] Error creando payment intent:', error);
    
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

## 🔍 Verificación

### 1. Verificar en los Logs del Backend

Cuando se crea un payment intent, deberías ver en los logs:

```
🔍 [Backend] ============================================
🔍 [Backend] Creando Payment Intent
🔍 [Backend] Property ID: prop_123
🔍 [Backend] Precio por noche (desde BD): 150.00  ← Debe variar según la propiedad
🔍 [Backend] Noches: 3
🔍 [Backend] Subtotal: 450.00
🔍 [Backend] Tarifa de limpieza (5%): 22.50
🔍 [Backend] Tarifa de servicio (8%): 36.00
🔍 [Backend] Impuestos (12%): 54.00
🔍 [Backend] Total: 562.50
🔍 [Backend] ============================================
🔍 [Backend] Monto para Stripe (centavos): 56250
🔍 [Backend] Monto para Stripe (dólares): 562.50
✅ [Backend] Payment Intent creado exitosamente
✅ [Backend] Monto cobrado por Stripe: 562.50 USD
```

**⚠️ Si siempre ves el mismo precio (ej: $148.50), el problema está en el cálculo.**

### 2. Verificar en Stripe Dashboard

1. Ve a tu [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navega a **Payments** → **Payment Intents**
3. Busca el Payment Intent recién creado
4. Verifica que el **Amount** varíe según la propiedad

**✅ CORRECTO:** El monto debe variar según la propiedad  
**❌ INCORRECTO:** Todos los pagos tienen el mismo monto

### 3. Probar con Diferentes Propiedades

```bash
# Propiedad 1: $100/noche, 2 noches
# Esperado: Subtotal $200, Total ~$250

# Propiedad 2: $200/noche, 3 noches  
# Esperado: Subtotal $600, Total ~$750

# Propiedad 3: $50/noche, 1 noche
# Esperado: Subtotal $50, Total ~$62.50
```

---

## 📊 Ejemplos de Cálculo

### Ejemplo 1: Propiedad de $100/noche, 2 noches

```
Precio por noche: $100.00 (desde BD)
Noches: 2
Subtotal: $100.00 × 2 = $200.00
Tarifa de limpieza (5%): $200.00 × 0.05 = $10.00
Tarifa de servicio (8%): $200.00 × 0.08 = $16.00
Impuestos (12%): $200.00 × 0.12 = $24.00
Total: $200.00 + $10.00 + $16.00 + $24.00 = $250.00
Monto para Stripe: $250.00 × 100 = 25,000 centavos
```

### Ejemplo 2: Propiedad de $200/noche, 3 noches

```
Precio por noche: $200.00 (desde BD)
Noches: 3
Subtotal: $200.00 × 3 = $600.00
Tarifa de limpieza (5%): $600.00 × 0.05 = $30.00
Tarifa de servicio (8%): $600.00 × 0.08 = $48.00
Impuestos (12%): $600.00 × 0.12 = $72.00
Total: $600.00 + $30.00 + $48.00 + $72.00 = $750.00
Monto para Stripe: $750.00 × 100 = 75,000 centavos
```

### Ejemplo 3: Propiedad de $50/noche, 1 noche

```
Precio por noche: $50.00 (desde BD)
Noches: 1
Subtotal: $50.00 × 1 = $50.00
Tarifa de limpieza (5%): $50.00 × 0.05 = $2.50
Tarifa de servicio (8%): $50.00 × 0.08 = $4.00
Impuestos (12%): $50.00 × 0.12 = $6.00
Total: $50.00 + $2.50 + $4.00 + $6.00 = $62.50
Monto para Stripe: $62.50 × 100 = 6,250 centavos
```

---

## ✅ Checklist de Verificación

Antes de considerar que está implementado correctamente, verifica:

- [ ] El código obtiene la propiedad desde la BD: `await Property.findById(propertyId)`
- [ ] El código usa `property.pricePerNight` (NO un precio fijo)
- [ ] El código calcula el subtotal: `pricePerNight * totalNights`
- [ ] El código calcula tarifa de limpieza: `subtotal * 0.05`
- [ ] El código calcula tarifa de servicio: `subtotal * 0.08`
- [ ] El código calcula impuestos: `subtotal * 0.12`
- [ ] El código calcula el total: `subtotal + cleaningFee + serviceFee + taxes`
- [ ] El código convierte a centavos: `Math.round(total * 100)`
- [ ] El código crea el Payment Intent con `amount: amountInCents`
- [ ] Los logs muestran el precio real de la propiedad (no siempre el mismo)
- [ ] Stripe Dashboard muestra montos diferentes según la propiedad

---

## 🚨 Errores Comunes

### Error 1: Precio Fijo Hardcodeado

```javascript
// ❌ INCORRECTO
const subtotal = 148.50 * totalNights;

// ✅ CORRECTO
const subtotal = property.pricePerNight * totalNights;
```

### Error 2: No Obtener la Propiedad de la BD

```javascript
// ❌ INCORRECTO
const pricePerNight = 148.50;  // Precio fijo

// ✅ CORRECTO
const property = await Property.findById(propertyId);
const pricePerNight = property.pricePerNight;
```

### Error 3: Usar Precio por Defecto

```javascript
// ❌ INCORRECTO
const pricePerNight = property.pricePerNight || 148.50;  // Fallback incorrecto

// ✅ CORRECTO
if (!property.pricePerNight || property.pricePerNight <= 0) {
  return res.status(400).json({
    success: false,
    message: 'La propiedad no tiene un precio válido'
  });
}
const pricePerNight = property.pricePerNight;
```

### Error 4: No Redondear Correctamente

```javascript
// ❌ INCORRECTO (puede tener problemas de precisión)
const cleaningFee = subtotal * 0.05;

// ✅ CORRECTO (redondeado a 2 decimales)
const cleaningFee = Math.round(subtotal * 0.05 * 100) / 100;
```

---

## 📞 Soporte

Si después de implementar estos cambios Stripe sigue cobrando siempre el mismo precio:

1. **Verifica los logs del backend:** Deben mostrar precios diferentes según la propiedad
2. **Verifica en Stripe Dashboard:** Los montos deben variar
3. **Verifica la base de datos:** Las propiedades deben tener `pricePerNight` diferentes
4. **Revisa el código:** Busca cualquier referencia a `148.50` o precios fijos

---

## 🎯 Resumen

**Lo más importante:**

1. ✅ Obtener la propiedad desde la BD: `await Property.findById(propertyId)`
2. ✅ Usar el precio real: `property.pricePerNight` (NO un precio fijo)
3. ✅ Calcular correctamente: subtotal + tarifas + impuestos
4. ✅ Convertir a centavos: `Math.round(total * 100)`
5. ✅ Crear Payment Intent con el monto calculado: `amount: amountInCents`
6. ✅ Agregar logs para verificar que el precio varía según la propiedad

**El frontend ya está correcto y envía el `propertyId`. El backend debe usar ese ID para obtener el precio real de la propiedad.**

---

**Última actualización:** 2025-11-10

