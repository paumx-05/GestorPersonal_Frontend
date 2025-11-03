# Fix: Persistencia del Nombre en el Perfil

## 🔴 Problema Identificado

**Síntoma:** 
- ✅ La descripción se guarda correctamente al reiniciar la página
- ❌ El nombre NO se guarda correctamente al reiniciar la página
- ⏳ El avatar está pendiente de probar

**Comportamiento:**
1. Usuario actualiza el nombre en el perfil
2. Se guarda en MongoDB correctamente
3. Al reiniciar la página, el nombre vuelve al valor anterior (no se mantiene)

---

## 🔍 Análisis del Problema

### Causa Raíz

El merge inteligente implementado en `checkAuthStatus()` y `getProfile()` **solo preservaba `description` y `avatar`**, pero **NO preservaba `name`**.

**Flujo problemático:**
```
1. Usuario actualiza nombre → PATCH /api/profile
   ↓
2. Backend guarda en MongoDB ✅
   ↓
3. Frontend: updateUser({ name: "Nuevo Nombre" }) ✅
   ↓
4. localStorage actualizado ✅
   ↓
5. Usuario reinicia página
   ↓
6. checkAuthStatus() → GET /api/auth/me
   ↓
7. Backend devuelve usuario (posiblemente con nombre viejo o vacío)
   ↓
8. ❌ Merge NO preservaba name → Se sobrescribe con valor del backend
```

---

## ✅ Solución Implementada

### 1. Merge Inteligente para `name` en `checkAuthStatus()`

**Archivo:** `lib/api/auth.ts`

**Antes:**
```typescript
const mergedUser: User = {
  ...backendUser,
  // Solo description y avatar tenían merge
  description: ...,
  avatar: ...,
};
```

**Después:**
```typescript
const mergedUser: User = {
  ...backendUser,
  // ✅ Ahora también name tiene merge
  name: backendUser.name && backendUser.name.trim() 
    ? backendUser.name.trim() 
    : (cachedUser?.name || backendUser.name || 'Usuario'),
  description: ...,
  avatar: ...,
};
```

**Lógica:**
- Si el backend devuelve un nombre válido (no vacío), se usa ese
- Si el backend devuelve nombre vacío o undefined, se preserva el nombre local (cached)
- Si no hay nombre local, se usa el del backend o "Usuario" por defecto

### 2. Merge Inteligente para `name` en `getProfile()`

**Archivo:** `lib/api/auth.ts`

Misma lógica aplicada también en `getProfile()` para mantener consistencia.

### 3. Logs de Diagnóstico Mejorados

Agregados logs específicos para verificar el campo `name`:

```typescript
console.log('🔍 [authService] Usuario después del merge:');
console.log('  - name (backend):', backendUser.name);
console.log('  - name (cached):', cachedUser?.name);
console.log('  - name (final):', mergedUser.name);
```

---

## 🔍 Verificación del Backend

### Posibles Causas del Problema

1. **Backend no devuelve `name` actualizado en `GET /api/auth/me`**
   - El backend puede estar devolviendo el nombre viejo
   - Verificar que el endpoint devuelva el nombre actualizado de MongoDB

2. **Backend devuelve `name` vacío o `null`**
   - El merge preservará el nombre local en este caso

3. **Problema de sincronización**
   - El nombre se actualiza en MongoDB, pero `GET /api/auth/me` no lee el valor actualizado
   - Puede ser un problema de caché o de lectura de la base de datos

### Cómo Verificar

**En la consola del navegador:**
1. Actualiza el nombre del perfil
2. Reinicia la página (F5)
3. Verifica los logs:
   ```
   🔍 [authService] Usuario después del merge:
     - name (backend): [valor que devuelve el backend]
     - name (cached): [valor que estaba en localStorage]
     - name (final): [valor final después del merge]
   ```

**En MongoDB Atlas:**
1. Conecta a MongoDB Atlas
2. Busca el documento del usuario:
   ```javascript
   db.users.findOne({ email: "tu@email.com" })
   ```
3. Verifica que el campo `name` tenga el valor actualizado:
   ```javascript
   {
     _id: ObjectId("..."),
     name: "Nombre Actualizado", // ✅ Debe ser el valor actualizado
     // ...
   }
   ```

---

## 📊 Comparación: Descripción vs Nombre

### ¿Por qué la descripción funciona pero el nombre no?

**Descripción:**
- ✅ Merge preserva `description` si el backend no la devuelve
- ✅ Si el backend la devuelve (incluso como `null`), se usa esa

**Nombre (Antes del fix):**
- ❌ Merge NO preservaba `name`
- ❌ Si el backend devolvía nombre viejo/vacío, se sobrescribía el local

**Nombre (Después del fix):**
- ✅ Merge preserva `name` si el backend no lo devuelve válidamente
- ✅ Si el backend devuelve nombre válido, se usa ese (fuente de verdad)

---

## 🧪 Pruebas

### Test 1: Actualizar Nombre

1. Inicia sesión
2. Ve a `/profile`
3. Actualiza el nombre (ej: "Nuevo Nombre")
4. Verifica que se guarda correctamente
5. **Reinicia la página (F5)**
6. Verifica que el nombre persiste ✅

### Test 2: Verificar Logs

1. Abre DevTools → Console
2. Actualiza el nombre
3. Reinicia la página
4. Busca los logs:
   ```
   🔍 [authService] Usuario después del merge:
     - name (backend): ...
     - name (cached): ...
     - name (final): ...
   ```
5. Verifica que el `name (final)` sea el correcto

### Test 3: Verificar MongoDB

1. Actualiza el nombre en el perfil
2. Verifica en MongoDB que se guardó:
   ```javascript
   db.users.findOne({ email: "tu@email.com" }, { name: 1 })
   ```
3. Debe mostrar el nombre actualizado

---

## 🔧 Requisitos para el Backend

### Endpoint: GET /api/auth/me

El backend **DEBE** devolver el campo `name` actualizado:

```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "...",
    "name": "Nombre Actualizado", // ⚠️ DEBE ser el valor actualizado de MongoDB
    "description": "...",
    "avatar": "...",
    "role": "user"
  }
}
```

### Endpoint: POST /api/auth/login

El backend **DEBE** devolver el campo `name` actualizado:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Nombre Actualizado", // ⚠️ DEBE ser el valor actualizado
      "email": "...",
      // ...
    },
    "token": "..."
  }
}
```

### Posibles Problemas del Backend

1. **No está leyendo el `name` actualizado de MongoDB**
   - Verificar que el query del backend lea todos los campos del usuario
   - Verificar que no haya caché que devuelva valores viejos

2. **Está devolviendo `name` vacío o `null`**
   - El merge preservará el nombre local en este caso
   - Pero es mejor que el backend devuelva el valor correcto

3. **Problema de sincronización**
   - El `name` se actualiza en MongoDB, pero `GET /api/auth/me` lee un valor en caché
   - Verificar si hay caché en el backend que deba invalidarse

---

## 📝 Archivos Modificados

1. **`lib/api/auth.ts`**
   - `checkAuthStatus()`: Agregado merge para `name`
   - `getProfile()`: Agregado merge para `name`
   - `login()`: Agregados logs de verificación para `name`

---

## ✅ Resultado Esperado

**ANTES:**
- Actualizar nombre → Se guarda en MongoDB ✅
- Reiniciar página → Nombre vuelve al valor anterior ❌

**DESPUÉS:**
- Actualizar nombre → Se guarda en MongoDB ✅
- Reiniciar página → Nombre persiste correctamente ✅

---

## 🚨 Nota Importante

El merge es una **solución temporal defensiva**. El backend debería ser la **fuente de verdad** y devolver siempre el valor correcto de `name`. Si el backend devuelve un nombre válido, el merge usará ese valor. Solo preserva el nombre local si el backend no lo devuelve válidamente.

---

**Fecha:** 2024-01-15  
**Estado:** ✅ **FIX IMPLEMENTADO**  
**Prioridad:** 🔴 **ALTA**

