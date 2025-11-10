# 💳 Ejemplos de cURL para Checkout con Stripe

Esta guía contiene ejemplos de cURL para probar las nuevas rutas de checkout implementadas.

## 📋 Prerequisitos

1. **Obtener Token de Autenticación**
   Primero necesitas hacer login para obtener un token JWT:

```bash
# 1. Login para obtener token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@airbnb.com",
    "password": "password123"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "demo@airbnb.com",
      "name": "Usuario Demo"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Guarda el token** de la respuesta para usarlo en los siguientes requests.

---

## 🛒 Rutas de Checkout

### 1. Calcular Precio del Checkout

Calcula el precio total de una reserva incluyendo impuestos y fees.

```bash
curl -X POST http://localhost:5000/api/payments/checkout/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "propertyId": "prop_123",
    "checkIn": "2024-03-15",
    "checkOut": "2024-03-20",
    "guests": 2
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "pricing": {
      "nights": 5,
      "basePrice": 100,
      "subtotal": 500,
      "cleaningFee": 25,
      "serviceFee": 50,
      "taxes": 57.5,
      "total": 632.5,
      "currency": "USD"
    },
    "breakdown": {
      "nights": 5,
      "basePrice": 100,
      "subtotal": 500,
      "cleaningFee": 25,
      "serviceFee": 50,
      "taxes": 57.5,
      "total": 632.5,
      "currency": "USD"
    }
  }
}
```

---

### 2. Crear Payment Intent

Crea un Payment Intent en Stripe (o simulado) para iniciar el proceso de pago.

```bash
curl -X POST http://localhost:5000/api/payments/checkout/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "propertyId": "prop_123",
    "checkIn": "2024-03-15",
    "checkOut": "2024-03-20",
    "guests": 2,
    "reservationId": "optional_reservation_id"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_mock_1234567890_secret_abc123",
    "paymentIntentId": "pi_mock_1234567890",
    "transactionId": "transaction_id",
    "amount": 632.5,
    "currency": "USD",
    "pricing": {
      "nights": 5,
      "basePrice": 100,
      "subtotal": 500,
      "cleaningFee": 25,
      "serviceFee": 50,
      "taxes": 57.5,
      "total": 632.5
    },
    "message": "Payment Intent creado exitosamente. Usa clientSecret en Stripe.js para procesar el pago."
  }
}
```

**Nota:** Guarda el `paymentIntentId` y `clientSecret` para el siguiente paso.

---

### 3. Confirmar Pago y Crear Booking

Confirma el pago después de procesarlo con Stripe.js y crea/actualiza la reserva.

**Opción A: Crear nueva reserva**

```bash
curl -X POST http://localhost:5000/api/payments/checkout/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "paymentIntentId": "pi_mock_1234567890",
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
  }'
```

**Opción B: Actualizar reserva existente**

```bash
curl -X POST http://localhost:5000/api/payments/checkout/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "paymentIntentId": "pi_mock_1234567890",
    "reservationId": "existing_reservation_id",
    "guestInfo": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@example.com",
      "phone": "+1234567890"
    }
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "reservation": {
      "id": "reservation_id",
      "userId": "user_id",
      "propertyId": "prop_123",
      "hostId": "host-1",
      "checkIn": "2024-03-15T00:00:00.000Z",
      "checkOut": "2024-03-20T00:00:00.000Z",
      "guests": 2,
      "totalPrice": 632.5,
      "status": "confirmed",
      "paymentStatus": "paid",
      "specialRequests": "Llegada tardía después de las 8 PM",
      "createdAt": "2024-03-01T10:00:00.000Z",
      "updatedAt": "2024-03-01T10:00:00.000Z"
    },
    "transaction": {
      "id": "transaction_id",
      "userId": "user_id",
      "propertyId": "prop_123",
      "reservationId": "reservation_id",
      "amount": 632.5,
      "currency": "USD",
      "status": "completed",
      "transactionId": "pi_mock_1234567890",
      "description": "Reserva de propiedad prop_123 - 2024-03-15 a 2024-03-20",
      "createdAt": "2024-03-01T10:00:00.000Z",
      "updatedAt": "2024-03-01T10:00:00.000Z"
    },
    "message": "Pago confirmado y reserva creada exitosamente"
  }
}
```

---

## 🔄 Flujo Completo de Ejemplo

Aquí tienes un ejemplo completo del flujo de checkout:

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@airbnb.com","password":"password123"}' \
  | jq -r '.data.token')

echo "Token obtenido: $TOKEN"

# 2. Calcular precio
curl -X POST http://localhost:5000/api/payments/checkout/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "propertyId": "prop_123",
    "checkIn": "2024-03-15",
    "checkOut": "2024-03-20",
    "guests": 2
  }' | jq '.'

# 3. Crear Payment Intent
PAYMENT_INTENT=$(curl -s -X POST http://localhost:5000/api/payments/checkout/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "propertyId": "prop_123",
    "checkIn": "2024-03-15",
    "checkOut": "2024-03-20",
    "guests": 2
  }' | jq -r '.data.paymentIntentId')

echo "Payment Intent ID: $PAYMENT_INTENT"

# 4. Confirmar pago (después de procesar con Stripe.js en el frontend)
curl -X POST http://localhost:5000/api/payments/checkout/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"paymentIntentId\": \"$PAYMENT_INTENT\",
    \"checkIn\": \"2024-03-15\",
    \"checkOut\": \"2024-03-20\",
    \"guests\": 2,
    \"guestInfo\": {
      \"firstName\": \"Juan\",
      \"lastName\": \"Pérez\",
      \"email\": \"juan@example.com\",
      \"phone\": \"+1234567890\"
    }
  }" | jq '.'
```

---

## ⚠️ Códigos de Error Comunes

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Usuario no autenticado"
  }
}
```
**Solución:** Verifica que el token esté incluido en el header `Authorization: Bearer <token>`

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Faltan datos requeridos: propertyId, checkIn, checkOut, guests"
  }
}
```
**Solución:** Verifica que todos los campos requeridos estén presentes en el body

### 400 Propiedad no disponible
```json
{
  "success": false,
  "error": {
    "message": "Propiedad no disponible para las fechas seleccionadas"
  }
}
```
**Solución:** Selecciona otras fechas o verifica la disponibilidad primero

### 404 Payment Intent no encontrado
```json
{
  "success": false,
  "error": {
    "message": "Payment Intent no encontrado"
  }
}
```
**Solución:** Verifica que el `paymentIntentId` sea correcto y pertenezca al usuario autenticado

---

## 📝 Notas Importantes

1. **Token de Autenticación**: Todas las rutas de checkout requieren autenticación excepto `/api/payments/checkout/calculate` (aunque actualmente también requiere auth).

2. **Formato de Fechas**: Usa formato ISO 8601 o `YYYY-MM-DD` para las fechas.

3. **Payment Intent**: Actualmente se está usando un mock. Cuando se integre Stripe real, el `clientSecret` será válido para usar con Stripe.js.

4. **Variables de Entorno**: Asegúrate de que el servidor esté corriendo en `http://localhost:5000` o ajusta la URL según tu configuración.

---

## 🧪 Testing con Variables

Puedes crear un script bash para facilitar las pruebas:

```bash
#!/bin/bash

# Configuración
BASE_URL="http://localhost:5000"
EMAIL="demo@airbnb.com"
PASSWORD="password123"
PROPERTY_ID="prop_123"
CHECK_IN="2024-03-15"
CHECK_OUT="2024-03-20"
GUESTS=2

# 1. Login
echo "🔐 Obteniendo token..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Error al obtener token"
  exit 1
fi

echo "✅ Token obtenido"

# 2. Calcular precio
echo "💰 Calculando precio..."
curl -s -X POST "$BASE_URL/api/payments/checkout/calculate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"propertyId\": \"$PROPERTY_ID\",
    \"checkIn\": \"$CHECK_IN\",
    \"checkOut\": \"$CHECK_OUT\",
    \"guests\": $GUESTS
  }" | jq '.'

# 3. Crear Payment Intent
echo "💳 Creando Payment Intent..."
PAYMENT_INTENT=$(curl -s -X POST "$BASE_URL/api/payments/checkout/create-intent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"propertyId\": \"$PROPERTY_ID\",
    \"checkIn\": \"$CHECK_IN\",
    \"checkOut\": \"$CHECK_OUT\",
    \"guests\": $GUESTS
  }" | jq -r '.data.paymentIntentId')

echo "✅ Payment Intent creado: $PAYMENT_INTENT"

# 4. Confirmar pago
echo "✅ Confirmando pago y creando booking..."
curl -s -X POST "$BASE_URL/api/payments/checkout/confirm" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"paymentIntentId\": \"$PAYMENT_INTENT\",
    \"checkIn\": \"$CHECK_IN\",
    \"checkOut\": \"$CHECK_OUT\",
    \"guests\": $GUESTS,
    \"guestInfo\": {
      \"firstName\": \"Juan\",
      \"lastName\": \"Pérez\",
      \"email\": \"juan@example.com\",
      \"phone\": \"+1234567890\"
    }
  }" | jq '.'

echo "🎉 Proceso completado!"
```

Guarda este script como `test-checkout.sh`, dale permisos de ejecución (`chmod +x test-checkout.sh`) y ejecútalo.

