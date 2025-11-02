# 🛒 Guía de Integración del Carrito - Frontend

## ⚠️ Problema Identificado

Si el carrito aparece vacío después de hacer logout y login, el problema está en el **frontend**, no en el backend.

## ✅ Verificación del Backend

El backend está funcionando correctamente:
- Los items se guardan en MongoDB Atlas
- Los items persisten después de logout/login
- El endpoint `GET /api/cart` devuelve los items correctamente

## 🔍 Problemas Comunes del Frontend

### 1. **Token no se está enviando en las peticiones**

**Problema**: Después de hacer login, el token no se está guardando o no se está enviando en el header `Authorization`.

**Solución**:
```javascript
// Después de login exitoso
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();

if (data.success && data.data.token) {
  // GUARDAR el token
  localStorage.setItem('authToken', data.data.token);
  
  // También guardar en sessionStorage si prefieres
  sessionStorage.setItem('authToken', data.data.token);
}
```

### 2. **Token no se incluye en las peticiones al carrito**

**Problema**: Las peticiones a `/api/cart` no incluyen el header `Authorization`.

**Solución**:
```javascript
// Al obtener el carrito
const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

if (!token) {
  // Redirigir al login
  window.location.href = '/login';
  return;
}

const response = await fetch('/api/cart', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // ⚠️ IMPORTANTE: Incluir el token
  }
});

const cartData = await response.json();

if (cartData.success) {
  console.log('Items en carrito:', cartData.data.items);
  // Mostrar items en la UI
} else {
  console.error('Error obteniendo carrito:', cartData.error);
}
```

### 3. **Token se elimina al hacer logout**

**Problema**: El token se está eliminando correctamente, pero no se está recuperando al hacer login de nuevo.

**Solución**:
```javascript
// Función de logout
function logout() {
  // Limpiar token
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  
  // Llamar al endpoint de logout (opcional)
  fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  }).catch(() => {
    // Ignorar errores en logout
  });
  
  // Redirigir al login
  window.location.href = '/login';
}
```

### 4. **Token no se actualiza después de login**

**Problema**: El frontend no está actualizando el token después de hacer login.

**Solución**:
```javascript
// Función de login
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success && data.data.token) {
      // ⚠️ ACTUALIZAR el token
      localStorage.setItem('authToken', data.data.token);
      
      // Guardar información del usuario
      if (data.data.user) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      // Redirigir o actualizar la UI
      window.location.href = '/dashboard';
      
      return true;
    } else {
      console.error('Error en login:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
```

## 📋 Checklist para el Frontend

Verifica que:

- [ ] El token se guarda en `localStorage` o `sessionStorage` después del login
- [ ] El token se envía en el header `Authorization: Bearer <token>` en todas las peticiones al carrito
- [ ] El token se elimina al hacer logout
- [ ] El token se actualiza después de un nuevo login
- [ ] Las peticiones incluyen el header `Content-Type: application/json`
- [ ] Se maneja el caso cuando el token está expirado (401/403)

## 🔧 Ejemplo Completo de Integración

```javascript
// utils/api.js

const API_BASE_URL = 'http://localhost:5000/api';

// Función helper para hacer peticiones autenticadas
async function authenticatedFetch(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Si el token expiró, redirigir al login
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    return null;
  }

  return response.json();
}

// Obtener carrito
export async function getCart() {
  try {
    const data = await authenticatedFetch('/cart');
    
    if (data && data.success) {
      return data.data.items || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    return [];
  }
}

// Agregar al carrito
export async function addToCart(item) {
  try {
    const data = await authenticatedFetch('/cart/add', {
      method: 'POST',
      body: JSON.stringify(item)
    });
    
    return data;
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    throw error;
  }
}

// Login
export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success && data.data.token) {
    localStorage.setItem('authToken', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data;
  }

  throw new Error(data.error?.message || 'Error en login');
}
```

## 🧪 Prueba Rápida

Para verificar si el problema es del frontend:

1. Abre las herramientas de desarrollo (F12)
2. Ve a la pestaña "Network" (Red)
3. Haz login
4. Intenta obtener el carrito
5. Verifica que la petición a `/api/cart` incluye:
   - Header: `Authorization: Bearer <token>`
   - Status: `200 OK`
   - Response body contiene `{ success: true, data: { items: [...] } }`

Si la petición no incluye el header `Authorization`, ese es el problema.

## 📞 Endpoints del Carrito

### GET /api/cart
**Headers requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Carrito obtenido exitosamente",
  "data": {
    "userId": "69010e9b129fce550a26ccb0",
    "items": [
      {
        "id": "690740c84617b9aa73627f6a",
        "propertyId": "690678bdf18d52f969578eda",
        "checkIn": "2025-12-02T00:00:00.000Z",
        "checkOut": "2025-12-05T00:00:00.000Z",
        "guests": 2,
        "totalPrice": 357,
        "expiresAt": "2025-12-02T00:00:00.000Z"
      }
    ],
    "totalItems": 1,
    "totalPrice": 357,
    "lastUpdated": "2025-11-02T12:30:16.000Z"
  }
}
```

### POST /api/cart/add
**Headers requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "propertyId": "690678bdf18d52f969578eda",
  "checkIn": "2025-12-02",
  "checkOut": "2025-12-05",
  "guests": 2,
  "pricePerNight": 95
}
```

## ✅ Solución Rápida

Si el carrito aparece vacío, verifica:

1. ¿El token se está guardando después del login?
   ```javascript
   console.log('Token:', localStorage.getItem('authToken'));
   ```

2. ¿El token se está enviando en las peticiones?
   - Abre DevTools > Network
   - Busca la petición a `/api/cart`
   - Verifica que tenga el header `Authorization`

3. ¿El userId es el mismo antes y después del login?
   - El backend usa el `userId` del token JWT
   - Si cambia el userId, verás un carrito diferente

## 🐛 Debugging

Agrega estos logs en tu frontend:

```javascript
// Al hacer login
console.log('Login response:', data);
console.log('Token guardado:', localStorage.getItem('authToken'));
console.log('User ID:', data.data.user.id);

// Al obtener carrito
console.log('Token usado:', localStorage.getItem('authToken'));
console.log('Cart response:', cartData);
console.log('Items recibidos:', cartData.data?.items);
```

Si ves que el token está presente pero el carrito está vacío, el problema puede ser:
- El userId en el token no coincide con el userId de los items en la BD
- Los items expiraron (aunque ahora duran 30 días)
- Hay un error en el parsing de la respuesta

