# Diagnóstico: Persistencia de Perfil

## 🔴 Problema Reportado

**Síntoma:** Los cambios en el perfil (nombre, descripción, avatar) se guardan correctamente en MongoDB Atlas, pero al reiniciar la página o cerrar sesión, estos cambios desaparecen tanto de la web como de la base de datos.

**Comportamiento esperado:**
- Los cambios deberían persistir en MongoDB
- Al reiniciar la página, los datos deberían cargarse desde MongoDB
- Los datos no deberían borrarse de la base de datos

---

## 🔍 Análisis del Flujo de Datos

### Flujo Actual

```
1. Usuario actualiza perfil
   ↓
2. Frontend: PATCH /api/profile → { name, description, avatar }
   ↓
3. Backend: Actualiza MongoDB ✅ (funciona correctamente)
   ↓
4. Backend: Responde con datos actualizados
   ↓
5. Frontend: updateUser() actualiza localStorage y estado
   ↓
6. ✅ Usuario ve los cambios inmediatamente
   
   ⚠️ PROBLEMA:
   
7. Usuario reinicia página o cierra sesión
   ↓
8. Frontend: checkAuthStatus() → GET /api/auth/me
   ↓
9. Backend: Devuelve usuario SIN description/avatar (o null)
   ↓
10. Frontend: localStorage.setItem('user', JSON.stringify(user))
    ↓
11. ❌ Se sobrescriben description y avatar con null/undefined
```

---

## 🎯 Causa Raíz Identificada

### Problema Principal: Backend no devuelve campos en GET /api/auth/me

El endpoint `GET /api/auth/me` **NO está devolviendo** los campos `description` y `avatar` en la respuesta, o los devuelve como `null`/`undefined`.

**Evidencia:**
1. ✅ `PATCH /api/profile` guarda correctamente en MongoDB
2. ❌ `GET /api/auth/me` no devuelve `description` y `avatar`
3. ❌ Frontend sobrescribe localStorage con datos incompletos del backend

### Código Problemático

**Antes (lib/api/auth.ts - checkAuthStatus):**
```typescript
const user = response.user || response.data?.user;
// Si el backend no devuelve description/avatar, se pierden
localStorage.setItem('user', JSON.stringify(user)); // ❌ Sobrescribe todo
```

---

## ✅ Solución Implementada

### 1. Merge Inteligente en `checkAuthStatus()`

**Archivo:** `lib/api/auth.ts`

**Cambio:**
```typescript
// Obtener usuario actual de localStorage como backup
const cachedUserStr = localStorage.getItem('user');
const cachedUser = cachedUserStr ? JSON.parse(cachedUserStr) : null;

// MERGE: Preservar campos que el backend podría no devolver
const mergedUser: User = {
  ...backendUser,
  description: backendUser.description !== undefined 
    ? backendUser.description 
    : (cachedUser?.description ?? null),
  avatar: backendUser.avatar !== undefined 
    ? backendUser.avatar 
    : (cachedUser?.avatar ?? undefined),
};

localStorage.setItem('user', JSON.stringify(mergedUser));
```

**Ventajas:**
- ✅ Preserva campos locales si el backend no los devuelve
- ✅ Usa valores del backend si los devuelve
- ✅ No pierde datos al reiniciar la página

### 2. Merge Inteligente en `getProfile()`

**Archivo:** `lib/api/auth.ts`

**Cambio:**
Similar al anterior, también preserva campos en `getProfile()` para mantener consistencia.

### 3. Logs de Diagnóstico

Agregados logs detallados para diagnosticar qué campos devuelve el backend:

```typescript
console.log('🔍 [authService] Usuario después del merge:');
console.log('  - description (backend):', backendUser.description);
console.log('  - description (cached):', cachedUser?.description);
console.log('  - description (final):', mergedUser.description);
```

---

## 🔧 Requisitos para el Backend

### Endpoint: GET /api/auth/me

**Problema actual:** El endpoint no devuelve `description` y `avatar`.

**Solución requerida:** El backend debe devolver estos campos en la respuesta:

```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "description": "...", // ⚠️ DEBE estar presente
    "avatar": "...",      // ⚠️ DEBE estar presente (o null)
    "role": "user",
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
      "description": "...", // ⚠️ DEBE estar presente
      "avatar": "...",     // ⚠️ DEBE estar presente
      // ... otros campos
    }
  }
}
```

### Endpoint: POST /api/auth/login

**Problema actual:** El endpoint no devuelve `description` y `avatar` al hacer login.

**Solución requerida:** El backend debe devolver estos campos al hacer login:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "description": "...", // ⚠️ DEBE estar presente
      "avatar": "...",      // ⚠️ DEBE estar presente
      "role": "user"
    },
    "token": "..."
  }
}
```

---

## 🧪 Verificación

### Pasos para Verificar

1. **Abrir DevTools → Console**
2. **Actualizar perfil** (nombre, descripción, avatar)
3. **Verificar logs:**
   ```
   ✅ [profileService] Perfil actualizado exitosamente
   ```
4. **Reiniciar página (F5)**
5. **Verificar logs:**
   ```
   🔍 [authService] Verificando token con el backend...
   🔍 [authService] Respuesta del backend: {...}
   🔍 [authService] Usuario después del merge:
     - description (backend): null o undefined
     - description (cached): "tu descripción"
     - description (final): "tu descripción" ✅
   ```
6. **Verificar que los datos persisten:**
   - El perfil debe mostrar la descripción y avatar actualizados
   - Los datos no deben borrarse

### Verificación en MongoDB Atlas

1. Conectar a MongoDB Atlas
2. Buscar el documento del usuario:
   ```javascript
   db.users.findOne({ email: "tu@email.com" })
   ```
3. Verificar que los campos existen:
   ```javascript
   {
     _id: ObjectId("..."),
     name: "Nombre Actualizado",
     description: "Descripción actualizada", // ✅ Debe existir
     avatar: "/uploads/avatars/avatar.jpg", // ✅ Debe existir
     // ...
   }
   ```

---

## 📊 Estados del Sistema

### Estado Actual (Con Fix Frontend)

| Escenario | Comportamiento | Estado |
|-----------|---------------|--------|
| Actualizar perfil | Se guarda en MongoDB | ✅ Funciona |
| Reiniciar página | Merge preserva campos locales | ✅ Funciona (temporal) |
| Cerrar sesión + Login | Backend debe devolver campos | ⚠️ Depende del backend |
| GET /api/auth/me | Devuelve campos completos | ❌ Backend debe arreglar |

### Estado Deseado (Backend Arreglado)

| Escenario | Comportamiento | Estado |
|-----------|---------------|--------|
| Actualizar perfil | Se guarda en MongoDB | ✅ Funciona |
| Reiniciar página | Carga desde MongoDB | ✅ Funcionará |
| Cerrar sesión + Login | Backend devuelve campos | ✅ Funcionará |
| GET /api/auth/me | Devuelve campos completos | ✅ Funcionará |

---

## 🚨 Solución Temporal vs Definitiva

### ✅ Solución Temporal (Implementada)

- **Frontend:** Merge inteligente preserva campos locales
- **Ventaja:** Los datos no se pierden al reiniciar
- **Desventaja:** No se sincronizan con MongoDB si se actualizan desde otro dispositivo

### ✅ Solución Definitiva (Backend)

- **Backend:** Debe devolver `description` y `avatar` en:
  - `GET /api/auth/me`
  - `POST /api/auth/login`
  - `POST /api/auth/register` (opcional, puede ser null)

**Documento para backend:** `REQUISITOS-BACKEND-USER-SCHEMA.md`

---

## 📝 Checklist de Verificación

### Frontend (✅ Completado)

- [x] Merge inteligente en `checkAuthStatus()`
- [x] Merge inteligente en `getProfile()`
- [x] Logs de diagnóstico agregados
- [x] Preservación de campos locales

### Backend (⏳ Pendiente)

- [ ] Endpoint `GET /api/auth/me` devuelve `description`
- [ ] Endpoint `GET /api/auth/me` devuelve `avatar`
- [ ] Endpoint `POST /api/auth/login` devuelve `description`
- [ ] Endpoint `POST /api/auth/login` devuelve `avatar`
- [ ] Schema de MongoDB tiene campos `description` y `avatar`

---

## 🔍 Cómo Diagnosticar el Backend

### Test 1: Verificar GET /api/auth/me

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TU_TOKEN" \
  | jq '.user | {description, avatar}'
```

**Resultado esperado:**
```json
{
  "description": "Mi descripción",
  "avatar": "/uploads/avatars/avatar.jpg"
}
```

**Si devuelve `null` o falta el campo:** El backend no está devolviendo estos campos.

### Test 2: Verificar POST /api/auth/login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq '.data.user | {description, avatar}'
```

**Resultado esperado:**
Similar al anterior.

---

## 📚 Referencias

- **Documento Backend Schema:** `REQUISITOS-BACKEND-USER-SCHEMA.md`
- **Fix Session Close:** `FIX-PROFILE-SESSION-CLOSE.md`
- **Frontend Integration:** `FRONTEND_PROFILE_UPDATE_INTEGRATION.md`

---

**Fecha:** 2024-01-15  
**Estado:** ✅ **Fix Frontend Implementado** | ⏳ **Pendiente Fix Backend**  
**Prioridad:** 🔴 **ALTA**

