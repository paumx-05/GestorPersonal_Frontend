# 📚 API DOCUMENTATION - USUARIOS CRUD

## 🎯 **DESCRIPCIÓN**
API RESTful completa para la gestión de usuarios (CRUD) implementada con arquitectura MVC, usando mock data en memoria.

## 🔐 **AUTENTICACIÓN**
Todos los endpoints requieren autenticación via JWT token en el header:
```
Authorization: Bearer <token>
```

## 📋 **ENDPOINTS DISPONIBLES**

### **1. LISTAR USUARIOS**
```http
GET /api/users
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Usuarios por página (default: 10, max: 100)
- `search` (opcional): Buscar por nombre o email

**Ejemplo:**
```bash
GET /api/users?page=1&limit=5&search=admin
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "1",
        "email": "admin@airbnb.com",
        "name": "Admin User",
        "avatar": "https://via.placeholder.com/150",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

### **2. OBTENER USUARIO POR ID**
```http
GET /api/users/:id
```

**Parámetros:**
- `id` (requerido): ID del usuario

**Ejemplo:**
```bash
GET /api/users/1
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@airbnb.com",
      "name": "Admin User",
      "avatar": "https://via.placeholder.com/150",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isActive": true
    }
  }
}
```

---

### **3. CREAR USUARIO**
```http
POST /api/users
```

**Body (JSON):**
```json
{
  "email": "nuevo@ejemplo.com",
  "name": "Usuario Nuevo",
  "password": "Password123",
  "avatar": "https://via.placeholder.com/150"
}
```

**Validaciones:**
- `email`: Formato válido y único
- `name`: 2-50 caracteres
- `password`: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
- `avatar`: URL válida (opcional)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "2",
      "email": "nuevo@ejemplo.com",
      "name": "Usuario Nuevo",
      "avatar": "https://via.placeholder.com/150",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isActive": true
    }
  },
  "message": "Usuario creado exitosamente"
}
```

---

### **4. ACTUALIZAR USUARIO COMPLETO**
```http
PUT /api/users/:id
```

**Parámetros:**
- `id` (requerido): ID del usuario

**Body (JSON):**
```json
{
  "name": "Usuario Actualizado",
  "email": "actualizado@ejemplo.com",
  "avatar": "https://via.placeholder.com/200",
  "isActive": true
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "actualizado@ejemplo.com",
      "name": "Usuario Actualizado",
      "avatar": "https://via.placeholder.com/200",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isActive": true
    }
  },
  "message": "Usuario actualizado exitosamente"
}
```

---

### **5. ACTUALIZAR USUARIO PARCIAL**
```http
PATCH /api/users/:id
```

**Parámetros:**
- `id` (requerido): ID del usuario

**Body (JSON) - Solo campos a actualizar:**
```json
{
  "name": "Solo Nombre Actualizado"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@airbnb.com",
      "name": "Solo Nombre Actualizado",
      "avatar": "https://via.placeholder.com/150",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isActive": true
    }
  },
  "message": "Usuario actualizado exitosamente"
}
```

---

### **6. ELIMINAR USUARIO**
```http
DELETE /api/users/:id
```

**Parámetros:**
- `id` (requerido): ID del usuario

**Ejemplo:**
```bash
DELETE /api/users/1
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

**Nota:** La eliminación es "soft delete" - el usuario se marca como inactivo pero no se elimina físicamente.

---

### **7. ESTADÍSTICAS DE USUARIOS**
```http
GET /api/users/stats
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total": 10,
      "active": 8,
      "inactive": 2
    }
  }
}
```

---

## ❌ **MANEJO DE ERRORES**

### **Errores de Validación (400)**
```json
{
  "success": false,
  "error": "Datos de validación inválidos",
  "details": [
    {
      "field": "email",
      "message": "Formato de email inválido"
    },
    {
      "field": "password",
      "message": "Contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número"
    }
  ]
}
```

### **Usuario No Encontrado (404)**
```json
{
  "success": false,
  "error": "Usuario no encontrado"
}
```

### **Error del Servidor (500)**
```json
{
  "success": false,
  "error": "Error interno del servidor"
}
```

---

## 🧪 **EJEMPLOS DE USO**

### **Obtener Token de Autenticación**
```bash
# 1. Registrarse
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ejemplo.com",
    "name": "Admin",
    "password": "Password123"
  }'

# 2. Hacer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ejemplo.com",
    "password": "Password123"
  }'
```

### **Usar Token en Requests**
```bash
# Listar usuarios
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <tu-token-aqui>"

# Crear usuario
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer <tu-token-aqui>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@ejemplo.com",
    "name": "Usuario Nuevo",
    "password": "Password123"
  }'
```

---

## 📝 **NOTAS IMPORTANTES**

1. **Seguridad**: Las contraseñas se encriptan con bcrypt antes de almacenarse
2. **Mock Data**: Los datos se almacenan en memoria (se pierden al reiniciar el servidor)
3. **Soft Delete**: Los usuarios eliminados se marcan como inactivos
4. **Paginación**: Máximo 100 usuarios por página
5. **Búsqueda**: Busca en nombre y email (case insensitive)
6. **Sanitización**: Todos los inputs se sanitizan automáticamente

---

## 🚀 **PRÓXIMOS PASOS**

- [ ] Integración con MongoDB
- [ ] Cache con Redis
- [ ] Rate limiting avanzado
- [ ] Logs de auditoría
- [ ] Tests automatizados
