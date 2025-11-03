# Requisitos del Backend para el Campo `role`

## 📋 Resumen

El frontend ahora está configurado para usar **únicamente** el campo `role` del backend para determinar si un usuario es administrador. Se han eliminado todos los "arreglos" temporales que verificaban el email `admin@airbnb.com`.

## ✅ Lo que el Backend DEBE hacer

### 1. Modelo de Usuario

El modelo de Usuario en MongoDB debe incluir el campo `role`:

```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  password: String, // hasheado
  role: String, // DEBE SER: 'admin' o 'user'
  avatar: String (opcional),
  createdAt: Date,
  // ... otros campos
}
```

### 2. Endpoint POST /api/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response DEBE incluir:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin",  // ← OBLIGATORIO: "admin" o "user"
      "avatar": "...",
      "createdAt": "..."
    },
    "token": "jwt-token-here"
  }
}
```

**⚠️ IMPORTANTE:** El campo `role` debe estar presente en el objeto `user`. Si falta, el frontend mostrará un error en consola y asignará `role: 'user'` por defecto (temporalmente).

### 3. Endpoint GET /api/auth/me

**Response DEBE incluir:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",  // ← OBLIGATORIO: "admin" o "user"
    "avatar": "...",
    "createdAt": "..."
  }
}
```

**O también puede ser:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin",  // ← OBLIGATORIO
      // ...
    }
  }
}
```

### 4. Endpoint GET /api/users/me

**Response DEBE incluir:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",  // ← OBLIGATORIO: "admin" o "user"
    // ... otros campos
  }
}
```

**O también puede ser:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",  // ← OBLIGATORIO
    // ...
  }
}
```

## 🔍 Verificación

### Cómo verificar si el backend está devolviendo el campo `role`:

1. **Login:**
   - Hacer login con cualquier usuario
   - Abrir la consola del navegador (F12)
   - Buscar el log: `🔍 [authService] Rol del usuario: ...`
   - Si dice "NO ESPECIFICADO", el backend NO está devolviendo el campo `role`

2. **Verificación de Admin:**
   - Si el usuario es admin, deberías ver en consola:
     ```
     ✅ [UserMenu] Usuario es admin según user.role del contexto
     ```
   - Si no aparece, verifica que el campo `role: 'admin'` esté presente en la respuesta del backend

3. **Errores en Consola:**
   - Si ves: `❌ [authService] ERROR: El backend NO devolvió el campo "role"`, el backend necesita ser corregido

## 📝 Checklist para el Backend

- [ ] El modelo de Usuario tiene el campo `role` (tipo: String, valores: 'admin' o 'user')
- [ ] `POST /api/auth/login` devuelve `role` en el objeto `user`
- [ ] `GET /api/auth/me` devuelve `role` en el objeto `user`
- [ ] `GET /api/users/me` devuelve `role` en el objeto usuario
- [ ] Los usuarios nuevos se crean con `role: 'user'` por defecto
- [ ] Solo usuarios existentes con `role: 'admin'` pueden acceder a funciones de admin

## 🚨 Si el Backend NO devuelve el campo `role`

**Síntomas:**
- El menú de administración no aparece para usuarios admin
- Errores en consola indicando que `role` no está presente
- Los usuarios admin no pueden acceder a `/admin/properties`

**Solución:**
1. Asegurar que el modelo de Usuario incluya `role`
2. Modificar los endpoints para incluir `role` en las respuestas
3. Verificar que al crear usuarios se asigne `role: 'user'` por defecto
4. Para convertir un usuario existente en admin, actualizar su `role: 'admin'` en la base de datos

## 📧 Ejemplo de Usuario Admin en MongoDB

```json
{
  "_id": ObjectId("..."),
  "email": "admin@airbnb.com",
  "name": "Admin User",
  "password": "$2b$10$...", // hasheado
  "role": "admin",  // ← Esto es lo que verifica el frontend
  "avatar": "...",
  "createdAt": ISODate("...")
}
```

## 📧 Ejemplo de Usuario Normal en MongoDB

```json
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "name": "Regular User",
  "password": "$2b$10$...", // hasheado
  "role": "user",  // ← Valor por defecto para usuarios normales
  "avatar": "...",
  "createdAt": ISODate("...")
}
```

## 🎯 Resumen Final

**El frontend ahora depende COMPLETAMENTE del campo `role` del backend.**

**Sin este campo, las funciones de administración NO funcionarán.**

**El backend debe garantizar que:**
1. Todos los usuarios tengan el campo `role`
2. Los endpoints devuelvan `role` en las respuestas
3. Los valores sean `'admin'` o `'user'`

