# 🐛 Guía de Debugging del Carrito

## Problema: Carrito vacío después de logout/login

### ✅ Verificaciones del Backend

El backend está funcionando correctamente según las pruebas:
- Los items se guardan en MongoDB Atlas
- Los items persisten después de logout/login
- El endpoint `/api/cart` devuelve los items correctamente cuando se envía el token

### 🔍 Pasos para Debugging

#### 1. Verificar que el token se envía correctamente

Abre las DevTools del navegador (F12) y ve a la pestaña "Network". Luego:

1. Haz login
2. Busca la petición a `/api/auth/login`
3. Verifica que en la respuesta recibas un `token`
4. Copia ese token

#### 2. Verificar el token en las peticiones al carrito

1. Intenta obtener el carrito desde el frontend
2. Busca la petición a `/api/cart` en la pestaña Network
3. Verifica que en "Request Headers" aparezca:
   ```
   Authorization: Bearer <tu-token>
   ```
4. Si NO aparece, ese es el problema

#### 3. Probar directamente con curl/Postman

Si tienes el token, prueba directamente:

```bash
# Reemplaza <TU_TOKEN> con el token real
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -H "Content-Type: application/json"
```

Si esto funciona y devuelve items, el problema está 100% en el frontend.

#### 4. Verificar los logs del servidor

El backend ahora tiene logs mejorados. Verifica en la consola del servidor:

```
🛒 [CART] Obteniendo carrito para usuario: { userId: '...', userEmail: '...' }
✅ [CART] Carrito obtenido: { totalItems: X, totalPrice: Y, itemsCount: Z }
```

Si ves estos logs, el backend está recibiendo las peticiones correctamente.

### 📋 Checklist para el Frontend

- [ ] El token se guarda después del login en `localStorage` o `sessionStorage`
- [ ] El token se incluye en TODAS las peticiones al carrito con el header `Authorization: Bearer <token>`
- [ ] El token no se elimina accidentalmente antes de obtener el carrito
- [ ] Se maneja correctamente cuando el token expira (401/403)
- [ ] El `userId` del token es el mismo antes y después del login

### 🔧 Solución Rápida

Si el carrito aparece vacío, agrega estos logs en tu frontend:

```javascript
// Después de login
console.log('Token recibido:', data.data.token);
localStorage.setItem('authToken', data.data.token);
console.log('Token guardado:', localStorage.getItem('authToken'));

// Antes de obtener el carrito
const token = localStorage.getItem('authToken');
console.log('Token a enviar:', token);
console.log('Headers:', {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});
```

### 📊 Estructura de Respuesta del API

Si el carrito tiene items, el API devuelve:

```json
{
  "success": true,
  "message": "Carrito obtenido exitosamente",
  "data": {
    "userId": "69010e9b129fce550a26ccb0",
    "items": [
      {
        "id": "...",
        "propertyId": "...",
        "checkIn": "2025-12-02T00:00:00.000Z",
        "checkOut": "2025-12-05T00:00:00.000Z",
        "guests": 2,
        "totalPrice": 357
      }
    ],
    "totalItems": 1,
    "totalPrice": 357
  }
}
```

Si `items` es un array vacío `[]`, significa:
1. No hay items en la BD para ese userId (verifica que el userId del token sea correcto)
2. Los items expiraron (ahora duran 30 días o hasta el check-in)
3. Hay un problema con la consulta en la BD

### 🚨 Problemas Comunes

#### Problema 1: Token no se envía
**Síntoma**: La petición a `/api/cart` no tiene el header `Authorization`
**Solución**: Asegúrate de incluir el token en todas las peticiones autenticadas

#### Problema 2: Token diferente después de login
**Síntoma**: El userId cambia después de logout/login
**Solución**: Verifica que estés haciendo login con el mismo usuario

#### Problema 3: Token expirado
**Síntoma**: Recibes 401 o 403
**Solución**: Implementa renovación de token o redirige al login

#### Problema 4: Items expirados
**Síntoma**: Los items desaparecen después de mucho tiempo
**Solución**: Normal, los items ahora expiran en 30 días o hasta el check-in

