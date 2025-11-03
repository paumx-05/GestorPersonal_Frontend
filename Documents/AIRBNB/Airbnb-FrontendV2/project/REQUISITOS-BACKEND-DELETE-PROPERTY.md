# Requisitos del Backend: Eliminar Propiedades

## 🚨 Problema Actual

El frontend está intentando eliminar propiedades usando:
```
DELETE /api/host/properties/:id
```

Pero el backend devuelve **404 Not Found**, lo que significa que este endpoint no existe.

## ✅ Endpoint Requerido

El backend DEBE implementar uno de estos endpoints:

### Opción 1 (Recomendada para Host):
```
DELETE /api/host/properties/:id
```
- **Método:** DELETE
- **Auth:** Requerida (JWT token)
- **Permisos:** 
  - Usuario normal: Solo puede eliminar sus propias propiedades
  - Admin: Puede eliminar cualquier propiedad (incluso de otros usuarios)

### Opción 2 (Endpoint Público):
```
DELETE /api/properties/:id
```
- **Método:** DELETE
- **Auth:** Requerida (JWT token)
- **Permisos:** Similar a Opción 1

### Opción 3 (Endpoint Admin):
```
DELETE /api/admin/properties/:id
```
- **Método:** DELETE
- **Auth:** Requerida (JWT token con role='admin')
- **Permisos:** Solo admin puede eliminar propiedades

## 📋 Request Esperado

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL:**
```
DELETE /api/host/properties/69067251a573d79509dbecc5
```

**Body:** No requerido (el ID está en la URL)

## 📋 Response Esperado

### Éxito (200 OK):
```json
{
  "success": true,
  "message": "Propiedad eliminada exitosamente"
}
```

### Error - Propiedad no encontrada (404):
```json
{
  "success": false,
  "message": "Propiedad no encontrada"
}
```

### Error - Sin permisos (403):
```json
{
  "success": false,
  "message": "No tienes permisos para eliminar esta propiedad"
}
```

### Error - No autenticado (401):
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

## 🔧 Verificación del Backend

**Para verificar si el endpoint existe:**

1. Abre Postman
2. Busca la colección de endpoints de propiedades
3. Busca un endpoint DELETE para eliminar propiedades
4. Verifica:
   - ✅ ¿Cuál es el path exacto?
   - ✅ ¿Requiere autenticación?
   - ✅ ¿Qué permisos se necesitan?
   - ✅ ¿Qué formato de respuesta devuelve?

## 📝 Para el Backend

**El backend debe:**

1. **Implementar el endpoint DELETE** para eliminar propiedades
2. **Verificar autenticación** (JWT token válido)
3. **Verificar permisos:**
   - Si el usuario es admin (`role: 'admin'`), permitir eliminar cualquier propiedad
   - Si el usuario es normal (`role: 'user'`), solo permitir eliminar sus propias propiedades
4. **Devolver respuesta en formato:**
   ```json
   {
     "success": true/false,
     "message": "..."
   }
   ```

## 🔍 Debugging en el Frontend

El frontend ahora:
- ✅ Intenta primero con `/api/host/properties/:id`
- ✅ Si recibe 404, intenta con `/api/properties/:id` como alternativa
- ✅ Muestra logs detallados en consola
- ✅ Muestra mensajes de error específicos al usuario

**Logs que verás en consola:**
```
🔄 [propertyService] Enviando DELETE a: /api/host/properties/<id>
⚠️ [propertyService] Endpoint /api/host/properties/:id devolvió 404, intentando /api/properties/:id...
```

## 🎯 Instrucciones para el Backend

**VERIFICA EN TU DOCUMENTACIÓN DE POSTMAN:**

1. ¿Existe un endpoint DELETE para eliminar propiedades?
2. ¿Cuál es el path exacto? (puede ser `/api/host/properties/:id`, `/api/properties/:id`, u otro)
3. ¿Requiere algún parámetro adicional?
4. ¿Qué permisos necesita? (admin puede eliminar cualquier propiedad)

**Una vez que sepas el endpoint correcto:**

1. Si es diferente a `/api/host/properties/:id`, configura en `.env.local`:
   ```
   NEXT_PUBLIC_PROPERTIES_DELETE_ENDPOINT=/ruta/correcta/:id
   ```

2. O actualiza el código en `lib/api/properties.ts` línea 565 para usar el endpoint correcto.

## ⚠️ Nota Importante

El frontend está configurado para intentar múltiples endpoints si el primero falla con 404, pero **es mejor que el backend implemente el endpoint correcto** para evitar confusiones.

