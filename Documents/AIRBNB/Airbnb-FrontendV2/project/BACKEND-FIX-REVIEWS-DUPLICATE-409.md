# 🔧 Fix Backend: Error 409 para Reviews Duplicadas

## 📋 Problema Actual

Cuando un usuario intenta crear una **segunda review** para la misma propiedad, el backend devuelve:
- **HTTP Status:** `500 Internal Server Error`
- **Mensaje:** Error genérico del servidor

**Esto causa:**
- Confusión en el frontend (error genérico en lugar de mensaje claro)
- El frontend no puede distinguir entre un error real del servidor y un review duplicado
- Mala experiencia de usuario

## ✅ Solución

Devolver **HTTP 409 (Conflict)** cuando un usuario intenta crear una review duplicada.

## 🔧 Implementación

### Endpoint: `POST /api/reviews`

**Cuando detectes que el usuario ya tiene una review para esta propiedad:**

```javascript
// Ejemplo en Node.js/Express
if (existingReview) {
  return res.status(409).json({
    success: false,
    error: {
      message: "Ya has dejado una reseña para esta propiedad",
      code: "DUPLICATE_REVIEW"
    }
  });
}
```

### Respuesta Esperada

**Status Code:** `409 Conflict`

**Body:**
```json
{
  "success": false,
  "error": {
    "message": "Ya has dejado una reseña para esta propiedad",
    "code": "DUPLICATE_REVIEW"
  }
}
```

## 📝 Validación

**Lógica:**
1. Verificar si existe una review con `userId` (del token) y `propertyId`
2. Si existe → **409 Conflict** con mensaje claro
3. Si no existe → Continuar con la creación normal

## 🎯 Códigos HTTP Correctos

| Situación | HTTP Status | Descripción |
|-----------|-------------|-------------|
| Review creada exitosamente | `201 Created` | ✅ Nueva review guardada |
| Usuario ya tiene review | `409 Conflict` | ⚠️ Review duplicada |
| Datos inválidos (rating fuera de rango) | `400 Bad Request` | ❌ Validación fallida |
| Usuario no autenticado | `401 Unauthorized` | 🔒 Token faltante/inválido |
| Propiedad no existe | `404 Not Found` | ❌ Resource no encontrado |
| Error del servidor (DB, etc.) | `500 Internal Server Error` | 💥 Error real del servidor |

## ✅ Checklist

- [ ] Validar si existe review con `userId` + `propertyId`
- [ ] Devolver `409` en lugar de `500` para reviews duplicadas
- [ ] Mensaje claro: "Ya has dejado una reseña para esta propiedad"
- [ ] Incluir código de error `DUPLICATE_REVIEW` en la respuesta
- [ ] Mantener `500` solo para errores reales del servidor

---

**Nota:** El frontend ya está preparado para manejar el código `409` correctamente y mostrar el mensaje apropiado al usuario.

