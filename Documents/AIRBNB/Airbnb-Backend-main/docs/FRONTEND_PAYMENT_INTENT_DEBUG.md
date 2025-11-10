# 🔍 Diagnóstico: Error "Failed to fetch" en Payment Intent

## ⚠️ Problema

El frontend está recibiendo el error:
```
[paymentService] Error creando payment intent: TypeError: Failed to fetch
```

Este error generalmente indica un problema de conexión entre el frontend y el backend.

---

## ✅ Verificaciones del Backend

### 1. Verificar que el servidor está corriendo

```bash
# Verificar que el servidor está activo en el puerto 5000
curl http://localhost:5000/

# Debe responder con información de la API
```

### 2. Verificar que el endpoint existe

```bash
# Probar el endpoint directamente (sin autenticación debería dar 401)
curl -X POST http://localhost:5000/api/payments/checkout/create-intent \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"test","checkIn":"2026-01-01","checkOut":"2026-01-02","guests":1}'

# Debe responder con: {"success":false,"error":{"message":"Usuario no autenticado"}}
# Si responde 404, el endpoint NO está registrado correctamente
```

### 3. Verificar que el endpoint está en la documentación de la API

```bash
# Verificar en http://localhost:5000/
# Debe incluir en la sección "payments":
#   createIntent: 'POST /api/payments/checkout/create-intent'
#   confirm: 'POST /api/payments/checkout/confirm'
```

---

## 🔍 Verificaciones del Frontend

### 1. Verificar la URL del endpoint

**Ubicación probable:** `src/services/payments.ts` o similar

**Debe ser:**
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
// o
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// El endpoint completo debe ser:
POST ${API_BASE_URL}/payments/checkout/create-intent
```

**❌ URLs incorrectas comunes:**
- `http://localhost:3000/api/payments/...` (puerto del frontend)
- `/api/payments/...` (ruta relativa sin dominio)
- `http://127.0.0.1:5000/api/...` (puede causar problemas de CORS)

### 2. Verificar que el token de autenticación se está enviando

**El request debe incluir:**
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // ← CRÍTICO
}
```

**Verificar en el código del frontend:**
```typescript
// Ejemplo correcto:
const response = await fetch('http://localhost:5000/api/payments/checkout/create-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}` // ← Debe estar presente
  },
  body: JSON.stringify({
    propertyId,
    checkIn,
    checkOut,
    guests
  })
});
```

### 3. Verificar la estructura del request body

**El body debe tener exactamente:**
```json
{
  "propertyId": "string (ID válido)",
  "checkIn": "YYYY-MM-DD",
  "checkOut": "YYYY-MM-DD",
  "guests": number
}
```

**Ejemplo de código correcto:**
```typescript
const requestBody = {
  propertyId: propertyId, // Debe ser un string, no un objeto
  checkIn: checkIn, // Formato: "2026-01-01"
  checkOut: checkOut, // Formato: "2026-01-02"
  guests: parseInt(guests) || 1 // Debe ser un número
};
```

### 4. Verificar CORS

**Si el error persiste, verificar CORS en el navegador:**

1. Abrir DevTools (F12)
2. Ir a la pestaña "Network"
3. Intentar hacer la petición
4. Buscar la petición a `/api/payments/checkout/create-intent`
5. Verificar:
   - **Status:** Debe ser 200, 400, 401, 404, 500 (NO debe ser CORS error)
   - **Request Headers:** Debe incluir `Authorization: Bearer ...`
   - **Response Headers:** Debe incluir `access-control-allow-origin: *`

**Si ves un error de CORS:**
- El backend tiene `app.use(cors())` configurado
- Verificar que el frontend está en `http://localhost:3000` (o el puerto configurado)
- Verificar que no hay un proxy mal configurado

---

## 🐛 Pasos de Debugging

### Paso 1: Verificar en la consola del navegador

```javascript
// Abrir DevTools (F12) → Console
// Ejecutar manualmente:

const testRequest = async () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/payments/checkout/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        propertyId: 'test123',
        checkIn: '2026-01-01',
        checkOut: '2026-01-02',
        guests: 1
      })
    });
    
    console.log('Status:', response.status);
    console.log('Response:', await response.json());
  } catch (error) {
    console.error('Error:', error);
  }
};

testRequest();
```

**Resultados esperados:**
- ✅ **Status 401:** Token inválido o faltante (backend funciona)
- ✅ **Status 400:** Datos inválidos (backend funciona)
- ❌ **Failed to fetch:** Problema de conexión (servidor no responde o URL incorrecta)
- ❌ **CORS error:** Problema de configuración CORS

### Paso 2: Verificar en Network Tab

1. Abrir DevTools → Network
2. Filtrar por "create-intent"
3. Hacer la petición desde la aplicación
4. Verificar:
   - **Request URL:** `http://localhost:5000/api/payments/checkout/create-intent`
   - **Request Method:** `POST`
   - **Status Code:** Cualquier código (200, 400, 401, 404, 500)
   - **Request Headers:** Incluye `Authorization`
   - **Request Payload:** Tiene `propertyId`, `checkIn`, `checkOut`, `guests`

### Paso 3: Verificar logs del backend

**En la terminal del backend, deberías ver:**
```
POST /api/payments/checkout/create-intent 401
```
o
```
POST /api/payments/checkout/create-intent 400
```

**Si NO ves ningún log:**
- El request no está llegando al backend
- Verificar URL en el frontend
- Verificar que el servidor está corriendo

---

## 🔧 Soluciones Comunes

### Problema 1: URL incorrecta

**Síntoma:** Error "Failed to fetch" inmediato

**Solución:**
```typescript
// ❌ Incorrecto
const url = '/api/payments/checkout/create-intent';

// ✅ Correcto
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const url = `${API_BASE_URL}/payments/checkout/create-intent`;
```

### Problema 2: Token no se está enviando

**Síntoma:** Status 401 o "Usuario no autenticado"

**Solución:**
```typescript
// Verificar que el token existe
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (!token) {
  console.error('No hay token de autenticación');
  // Redirigir a login
}

// Incluir en headers
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Problema 3: Servidor no está corriendo

**Síntoma:** "Failed to fetch" inmediato, sin respuesta del servidor

**Solución:**
```bash
# Verificar que el servidor está corriendo
cd backend
npm run dev
# o
npm start

# Debe mostrar: "Server running on port 5000"
```

### Problema 4: CORS bloqueado

**Síntoma:** Error de CORS en la consola del navegador

**Solución:**
El backend ya tiene `app.use(cors())` configurado. Si persiste:
1. Verificar que el frontend está en `http://localhost:3000`
2. Verificar que no hay un proxy mal configurado en `package.json` o `vite.config.js`

### Problema 5: Body mal formateado

**Síntoma:** Status 400 con "Faltan datos requeridos"

**Solución:**
```typescript
// Verificar que el body está correctamente formateado
const body = {
  propertyId: String(propertyId), // Asegurar que es string
  checkIn: checkIn, // Formato: "YYYY-MM-DD"
  checkOut: checkOut, // Formato: "YYYY-MM-DD"
  guests: Number(guests) // Asegurar que es número
};

// Enviar como JSON
body: JSON.stringify(body)
```

---

## 📋 Checklist de Verificación

- [ ] Servidor backend está corriendo en puerto 5000
- [ ] Endpoint `/api/payments/checkout/create-intent` responde (aunque sea 401)
- [ ] URL en el frontend es `http://localhost:5000/api/payments/checkout/create-intent`
- [ ] Token de autenticación se está enviando en el header `Authorization`
- [ ] Request body incluye: `propertyId`, `checkIn`, `checkOut`, `guests`
- [ ] Content-Type header es `application/json`
- [ ] No hay errores de CORS en la consola del navegador
- [ ] Los logs del backend muestran la petición entrante

---

## 🎯 Código de Ejemplo Correcto (Frontend)

```typescript
// services/payments.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const createPaymentIntent = async (data: {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}) => {
  // Obtener token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/payments/checkout/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        propertyId: data.propertyId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: data.guests
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error creando payment intent');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('[paymentService] Error creando payment intent:', error);
    throw error;
  }
};
```

---

## 📞 Si el Problema Persiste

1. **Verificar logs del backend:** Debe mostrar la petición entrante
2. **Verificar Network tab:** Ver el request completo y la respuesta
3. **Probar con curl/Postman:** Verificar que el endpoint funciona fuera del frontend
4. **Verificar variables de entorno:** Asegurar que `REACT_APP_API_URL` está configurada si se usa

---

**Última actualización:** 2025-11-10

