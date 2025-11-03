# 📋 Requisitos del Backend: API de Favoritos

## 🎯 Objetivo
El frontend necesita que el backend implemente una API completa de favoritos que guarde los datos en MongoDB Atlas y persista entre sesiones.

---

## 🔗 Endpoints Requeridos

### **1. GET /api/favorites**
**Descripción:** Obtener todos los favoritos del usuario autenticado

**Método:** `GET`

**Auth:** ✅ Requerida (JWT token en header `Authorization: Bearer <token>`)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response Esperado (200 OK):**
```json
{
  "success": true,
  "message": "Favoritos obtenidos exitosamente",
  "data": {
    "favorites": [
      {
        "id": "507f1f77bcf86cd799439011",
        "propertyId": "507f191e810c19729de860ea",
        "userId": "507f1f77bcf86cd799439012",
        "createdAt": "2024-12-02T10:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

**Errores:**
- `401 Unauthorized`: Token inválido o expirado
- `500 Internal Server Error`: Error del servidor

**Notas:**
- Debe filtrar por `userId` del token JWT
- Si el usuario no tiene favoritos, devolver array vacío: `{ "success": true, "data": { "favorites": [], "total": 0 } }`

---

### **2. POST /api/favorites/add**
**Descripción:** Agregar una propiedad a favoritos

**Método:** `POST`

**Auth:** ✅ Requerida (JWT token en header `Authorization: Bearer <token>`)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "propertyId": "507f191e810c19729de860ea"
}
```

**Response Esperado (200 OK o 201 Created):**
```json
{
  "success": true,
  "message": "Favorito agregado exitosamente",
  "data": {
    "favorite": {
      "id": "507f1f77bcf86cd799439011",
      "propertyId": "507f191e810c19729de860ea",
      "userId": "507f1f77bcf86cd799439012",
      "createdAt": "2024-12-02T10:00:00.000Z"
    }
  }
}
```

**Errores:**
- `400 Bad Request`: `propertyId` faltante o inválido
- `401 Unauthorized`: Token inválido o expirado
- `409 Conflict`: La propiedad ya está en favoritos (opcional, puede ser idempotente)
- `500 Internal Server Error`: Error del servidor

**Notas:**
- El `userId` debe extraerse del token JWT (NO del body)
- Verificar que la propiedad existe antes de agregarla
- Si ya existe, puede devolver el favorito existente (idempotente) o error 409

---

### **3. DELETE /api/favorites/remove/:propertyId**
**Descripción:** Eliminar una propiedad de favoritos

**Método:** `DELETE`

**Auth:** ✅ Requerida (JWT token en header `Authorization: Bearer <token>`)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Params:**
- `propertyId`: ID de la propiedad a eliminar

**Response Esperado (200 OK):**
```json
{
  "success": true,
  "message": "Favorito eliminado exitosamente"
}
```

**Errores:**
- `401 Unauthorized`: Token inválido o expirado
- `404 Not Found`: Favorito no encontrado
- `500 Internal Server Error`: Error del servidor

**Notas:**
- Debe verificar que el favorito pertenece al usuario del token antes de eliminar
- Si el favorito no existe, puede devolver `success: true` (idempotente) o `404`

---

### **4. GET /api/favorites/check/:propertyId**
**Descripción:** Verificar si una propiedad está en favoritos (opcional, pero útil)

**Método:** `GET`

**Auth:** ✅ Requerida (JWT token en header `Authorization: Bearer <token>`)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Params:**
- `propertyId`: ID de la propiedad a verificar

**Response Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "isFavorite": true
  }
}
```

**Errores:**
- `401 Unauthorized`: Token inválido o expirado
- `500 Internal Server Error`: Error del servidor

---

## 🗄️ Estructura de Datos en MongoDB

### **Colección: `favorites`**

**Schema:**
```javascript
{
  _id: ObjectId,           // ID único del favorito
  userId: ObjectId,        // ID del usuario (del token JWT)
  propertyId: ObjectId,    // ID de la propiedad
  createdAt: Date,         // Fecha de creación
  updatedAt: Date          // Fecha de actualización (opcional)
}
```

**Índices Recomendados:**
```javascript
// Índice único compuesto para evitar duplicados
db.favorites.createIndex({ userId: 1, propertyId: 1 }, { unique: true })

// Índice para búsquedas rápidas por usuario
db.favorites.createIndex({ userId: 1 })
```

---

## 🔐 Autenticación

**IMPORTANTE:** Todos los endpoints deben:

1. **Extraer el token del header:**
   ```
   Authorization: Bearer <JWT_TOKEN>
   ```

2. **Validar el token:**
   - Verificar que es válido
   - Verificar que no está expirado
   - Extraer el `userId` del token

3. **Usar el userId del token:**
   - NO confiar en `userId` del body
   - SIEMPRE usar el `userId` extraído del token JWT
   - Esto previene que usuarios agreguen favoritos a otras cuentas

**Ejemplo de middleware:**
```javascript
// El userId debe extraerse del token así:
const token = req.headers.authorization?.replace('Bearer ', '');
const decoded = jwt.verify(token, JWT_SECRET);
const userId = decoded.userId || decoded.id; // Depende de cómo se guarda en el token
```

---

## 📊 Validaciones Requeridas

### **POST /api/favorites/add:**
- ✅ `propertyId` es string válido
- ✅ `propertyId` existe en la colección `properties`
- ✅ El favorito no existe ya (o hacer idempotente)
- ✅ El usuario está autenticado (token válido)

### **DELETE /api/favorites/remove/:propertyId:**
- ✅ `propertyId` es string válido
- ✅ El favorito existe
- ✅ El favorito pertenece al usuario del token (seguridad)

### **GET /api/favorites:**
- ✅ El usuario está autenticado (token válido)
- ✅ Filtrar SOLO favoritos del usuario del token

---

## ⚠️ Problemas Comunes y Soluciones

### **Problema 1: Favoritos no persisten entre sesiones**
**Causa:** El backend no está guardando en MongoDB o está filtrando incorrectamente.

**Solución:**
- Verificar que `userId` se extrae correctamente del token
- Verificar que se guarda en MongoDB con el `userId` correcto
- Verificar que `GET /api/favorites` filtra por `userId` del token

### **Problema 2: Error 401 al agregar favorito**
**Causa:** Token no válido o no se envía correctamente.

**Solución:**
- Verificar que el middleware de autenticación funciona
- Verificar que el token no está expirado
- Verificar que el header `Authorization` se parsea correctamente

### **Problema 3: Favoritos de un usuario aparecen en otro**
**Causa:** No se está filtrando por `userId` del token.

**Solución:**
- SIEMPRE usar el `userId` del token, NUNCA del body
- Agregar validación para asegurar que solo se obtienen favoritos del usuario autenticado

---

## 🧪 Casos de Prueba

### **Test 1: Agregar favorito**
```bash
POST /api/favorites/add
Headers: Authorization: Bearer <TOKEN_USER_1>
Body: { "propertyId": "prop123" }

# Esperado: 200 OK con el favorito creado
# Verificar en MongoDB que se guardó con userId correcto
```

### **Test 2: Obtener favoritos**
```bash
GET /api/favorites
Headers: Authorization: Bearer <TOKEN_USER_1>

# Esperado: 200 OK con array de favoritos del usuario
# Verificar que solo devuelve favoritos del usuario del token
```

### **Test 3: Persistencia entre sesiones**
```bash
# 1. Login usuario 1 → agregar favorito
# 2. Logout
# 3. Login usuario 1 de nuevo
# 4. GET /api/favorites

# Esperado: El favorito debe aparecer
```

### **Test 4: Seguridad (no debe poder ver favoritos de otros)**
```bash
# 1. Usuario 1 agrega favorito
# 2. Usuario 2 intenta obtener favoritos con su token

# Esperado: Usuario 2 NO ve favoritos de Usuario 1
```

---

## 📝 Checklist de Implementación

- [ ] Endpoint `GET /api/favorites` implementado
- [ ] Endpoint `POST /api/favorites/add` implementado
- [ ] Endpoint `DELETE /api/favorites/remove/:propertyId` implementado
- [ ] Endpoint `GET /api/favorites/check/:propertyId` implementado (opcional)
- [ ] Todos los endpoints requieren autenticación JWT
- [ ] El `userId` se extrae del token (NO del body)
- [ ] Los favoritos se guardan en MongoDB con `userId` correcto
- [ ] `GET /api/favorites` filtra por `userId` del token
- [ ] Se valida que la propiedad existe antes de agregar
- [ ] Se evitan duplicados (índice único en MongoDB)
- [ ] Los endpoints devuelven la estructura de respuesta esperada
- [ ] Manejo de errores adecuado (401, 404, 500)

---

## 🔍 Debugging

**Si los favoritos no persisten:**

1. **Verificar en MongoDB Atlas:**
   ```javascript
   // Conectar a MongoDB y ejecutar:
   db.favorites.find({ userId: ObjectId("USER_ID_AQUI") })
   ```

2. **Verificar que el userId es correcto:**
   - El `userId` en MongoDB debe coincidir con el `userId` del token JWT
   - Si no coincide, el usuario no verá sus favoritos

3. **Verificar logs del backend:**
   - ¿Se está guardando en MongoDB?
   - ¿Qué `userId` se está usando?
   - ¿Hay errores en la base de datos?

4. **Verificar en Postman:**
   - Probar cada endpoint manualmente
   - Verificar que las respuestas coinciden con la estructura esperada
   - Verificar que el token se envía correctamente

---

## 📞 Estructura de Respuesta Alternativa

Si el backend usa una estructura diferente, puede ser:

**Opción 1 (Recomendada):**
```json
{
  "success": true,
  "data": {
    "favorite": { ... }
  }
}
```

**Opción 2:**
```json
{
  "success": true,
  "data": { ... } // El favorito directamente
}
```

**Opción 3:**
```json
{
  "success": true,
  "favorite": { ... }
}
```

El frontend está preparado para manejar estas estructuras, pero la **Opción 1** es la preferida.

---

**Última actualización:** 2024-12-02

**Contacto:** Si hay dudas sobre la implementación, verificar primero en Postman y luego revisar los logs del frontend en la consola del navegador.

