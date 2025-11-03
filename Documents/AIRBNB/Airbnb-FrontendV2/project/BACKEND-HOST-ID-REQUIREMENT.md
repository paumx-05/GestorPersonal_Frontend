# 📋 Requerimiento Backend: hostId en Respuesta de Propiedades

## 🎯 Objetivo

Para implementar la validación de que un usuario no pueda dejar una review a su propia propiedad, el frontend necesita el `hostId` (ID del dueño) en la respuesta del endpoint de propiedades.

## 📍 Endpoint Afectado

**GET `/api/properties/:id`**

## ✅ Respuesta Esperada

El backend debe incluir el `hostId` o `userId` del dueño en la respuesta:

```json
{
  "success": true,
  "data": {
    "id": "prop_123",
    "title": "Casa moderna...",
    "host": {
      "name": "Juan Pérez",
      "avatar": "/uploads/avatars/user_789.jpg",
      "isSuperhost": true
    },
    "hostId": "6909010e9b129fce550a26ccb0",  // ✅ REQUERIDO
    // ... otros campos ...
  }
}
```

**O alternativamente:**

```json
{
  "success": true,
  "data": {
    "id": "prop_123",
    "userId": "6909010e9b129fce550a26ccb0",  // ✅ Alternativa aceptable
    // ... otros campos ...
  }
}
```

## 🔍 Campos Aceptados

El frontend buscará en este orden:
1. `hostId` (preferido)
2. `userId` (alternativo)

## 📝 Nota

Si el backend ya incluye esta información en la respuesta, el frontend funcionará automáticamente. Si no, el frontend intentará validar desde el backend cuando se intente crear la review (el backend debería rechazar la review si el usuario es el dueño).

---

**Prioridad:** Media (el frontend tiene validación adicional, pero esto mejora la UX)

