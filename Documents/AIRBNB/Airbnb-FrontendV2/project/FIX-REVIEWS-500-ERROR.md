# 🔧 Fix: Error 500 al Crear Review

## 📋 Problema

Al intentar crear una review, el backend devuelve un error 500 (Internal Server Error).

**Error:**
```
Error 500: Internal Server Error
```

## 🔍 Diagnóstico

El error 500 indica que:
- ✅ El endpoint existe (no es 404)
- ✅ La autenticación probablemente funciona (no es 401/403)
- ❌ Hay un problema en el servidor procesando la request

### Posibles Causas

1. **Formato del body incorrecto**
   - El backend puede esperar un formato específico
   - Campos requeridos faltantes
   - Tipos de datos incorrectos

2. **Campo `comment` vacío**
   - Si `comment` está vacío o es `undefined`, el backend puede rechazarlo
   - Según documentación: `comment` es opcional pero si se envía debe tener 10-1000 caracteres

3. **Validación en el backend**
   - El backend puede tener validaciones adicionales no documentadas
   - Puede requerir que el usuario tenga reservado la propiedad

4. **Error en base de datos**
   - Problema al guardar en MongoDB
   - Relación con `propertyId` o `userId` inválida

## ✅ Cambios Implementados

### 1. Mejor Manejo de Errores 500

```typescript
// Ahora extrae y muestra mensaje específico del backend
if (error.message.includes('500')) {
  // Analiza el mensaje y da recomendaciones específicas
  // Muestra logging detallado para debugging
}
```

### 2. Validación Mejorada del Comment

```typescript
// Solo envía comment si tiene contenido válido (≥10 caracteres)
const commentTrimmed = formData.comment?.trim() || '';
if (commentTrimmed.length >= 10) {
  reviewPayload.comment = commentTrimmed;
}
// Si está vacío, no se incluye en el body
```

### 3. Logging Detallado

El código ahora registra:
- Body exacto que se envía
- Recomendaciones específicas según el tipo de error
- Mensajes del backend si están disponibles

## 🔍 Cómo Debuggear

### Paso 1: Verificar Logs en Consola

Al intentar crear una review, revisa la consola del navegador:

```
📤 [reviewService] Body que se enviará: { ... }
🔄 [reviewService] Intentando endpoint: POST /api/reviews
❌ [reviewService] Error en endpoint ...
💥 [reviewService] Error 500 del servidor...
```

### Paso 2: Verificar en Postman

Prueba crear una review directamente en Postman:

```bash
POST http://localhost:5000/api/reviews
Authorization: Bearer <tu_token>
Content-Type: application/json

{
  "propertyId": "690681e09bad45aedd26cb62",
  "rating": 5,
  "comment": "Excelente experiencia, muy recomendado."
}
```

**Verifica:**
- ✅ ¿Funciona en Postman?
- ✅ ¿Qué mensaje de error específico devuelve?
- ✅ ¿Requiere campos adicionales?

### Paso 3: Verificar Backend

Revisa los logs del servidor backend para ver:
- ¿Qué error específico está ocurriendo?
- ¿Hay validaciones que fallan?
- ¿Hay problemas con la base de datos?

## 🔧 Soluciones Posibles

### Solución 1: Verificar Formato del Body

El body debe ser exactamente:

```json
{
  "propertyId": "string",
  "rating": 5,
  "comment": "string (opcional, solo si tiene 10+ caracteres)"
}
```

**NO enviar:**
- `comment: ""` (string vacío)
- `comment: undefined`
- `comment: null`

### Solución 2: Verificar que la Propiedad Existe

Asegúrate de que el `propertyId` sea válido y la propiedad exista en la base de datos.

### Solución 3: Verificar Permisos

El backend puede requerir que:
- El usuario haya reservado la propiedad
- El usuario no haya dejado ya una review
- El usuario tenga permisos específicos

### Solución 4: Verificar Autenticación

Aunque el error es 500 y no 401, verifica:
- El token JWT es válido
- El `userId` se extrae correctamente del token
- El usuario existe en la base de datos

## 📝 Request Body Correcto

Según la documentación oficial, el body debe ser:

```typescript
{
  propertyId: string;  // ✅ Requerido
  rating: number;      // ✅ Requerido, 1-5
  comment?: string;     // ❌ Opcional, pero si se envía: 10-1000 caracteres
}
```

**Implementación actual:**
```typescript
const body = {
  propertyId: propertyId,
  rating: reviewData.rating,
  // comment solo se incluye si tiene contenido válido
};
if (comment && comment.trim().length >= 10) {
  body.comment = comment;
}
```

## 🚀 Próximos Pasos

1. **Revisa los logs del backend** para ver el error específico
2. **Prueba en Postman** con el mismo body que envía el frontend
3. **Verifica el formato de respuesta** del backend en caso de error
4. **Compara** el body que envía Postman vs el que envía el frontend

## 💡 Mensajes de Error Mejorados

Ahora el frontend muestra mensajes más específicos según el tipo de error:

- **Error con comment:** "El comentario puede estar causando un error..."
- **Error con propertyId:** "Error con el ID de la propiedad..."
- **Error con rating:** "Error con la calificación..."
- **Error genérico:** "Error del servidor al crear la reseña..."

## 📞 Información para Soporte

Si el error persiste, comparte:

1. **Logs de la consola del navegador** (especialmente los de `[reviewService]`)
2. **Body que se envía** (aparece en los logs)
3. **Logs del backend** (error específico del servidor)
4. **Prueba en Postman** (¿funciona o no?)

---

**Última actualización:** Diciembre 2024

