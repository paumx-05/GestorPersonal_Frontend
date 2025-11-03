# Fix: Cierre de Sesión al Actualizar Perfil

## 🔴 Problema Identificado

Cuando el usuario actualiza su perfil (nombre, descripción o avatar), la sesión se cierra automáticamente y aparece el error "Error al obtener perfil".

**Causa Raíz:**
1. Después de actualizar el perfil, el código llamaba a `getProfile()` para refrescar los datos
2. Si `getProfile()` fallaba (endpoint `/api/auth/me` no disponible o error), el `AuthContext` hacía `dispatch({ type: 'AUTH_ERROR' })`
3. `AUTH_ERROR` cerraba la sesión automáticamente, incluso por errores temporales de red
4. Esto causaba que el usuario fuera redirigido al login

## ✅ Soluciones Implementadas

### 1. Nueva función `updateUser()` en AuthContext

**Archivo:** `context/AuthContext.tsx`

Agregada una función para actualizar el usuario localmente sin necesidad de hacer otra llamada al backend:

```typescript
const updateUser = (userData: Partial<User>): void => {
  if (state.user) {
    const updatedUser: User = {
      ...state.user,
      ...userData,
    };
    dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser });
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
};
```

**Ventajas:**
- No hace llamadas adicionales al backend
- Actualiza inmediatamente la UI
- No puede fallar (es una actualización local)

### 2. Uso de datos de respuesta en lugar de `getProfile()`

**Archivos modificados:**
- `app/profile/page.tsx`
- `components/profile/ProfileEditForm.tsx`

**Antes:**
```typescript
if (response.success && response.data) {
  await getProfile(); // ❌ Puede fallar y cerrar sesión
}
```

**Después:**
```typescript
if (response.success && response.data) {
  // ✅ Usar datos de la respuesta directamente
  updateUser({
    name: response.data.name,
    description: response.data.description,
    avatar: response.data.avatar || undefined,
  });
}
```

### 3. `getProfile()` más resiliente

**Archivo:** `context/AuthContext.tsx`

Ahora `getProfile()`:
- ✅ Solo cierra sesión si es un error 401 (autenticación real)
- ✅ Mantiene la sesión si es un error de red o conexión
- ✅ No cierra sesión por errores temporales

```typescript
// Solo cerrar sesión si es un error de autenticación real (401)
const isAuthError = response.message?.includes('401') || response.message?.includes('Unauthorized');
if (isAuthError) {
  dispatch({ type: 'AUTH_LOGOUT' });
} else {
  // Mantener sesión aunque getProfile falló
  if (state.user && localStorage.getItem('airbnb_auth_token')) {
    // No cambiar isAuthenticated
  }
}
```

### 4. Reducer `AUTH_ERROR` mejorado

**Archivo:** `context/AuthContext.tsx`

El reducer ahora verifica si hay token antes de cerrar la sesión:

```typescript
case 'AUTH_ERROR':
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('airbnb_auth_token');
  if (state.user && hasToken) {
    // Mantener sesión pero mostrar error
    return { ...state, isLoading: false, error: action.payload };
  }
  // Solo cerrar si no hay token
  return { ...state, user: null, isAuthenticated: false, ... };
```

## 📋 Cambios en Archivos

### 1. `context/AuthContext.tsx`
- ✅ Agregada función `updateUser()`
- ✅ Mejorado `getProfile()` para no cerrar sesión por errores de red
- ✅ Mejorado reducer `AUTH_ERROR` para mantener sesión si hay token

### 2. `app/profile/page.tsx`
- ✅ Reemplazado `getProfile()` por `updateUser()` después de actualizar descripción
- ✅ Usa datos directamente de la respuesta de `updateProfile()`

### 3. `components/profile/ProfileEditForm.tsx`
- ✅ Reemplazado `getProfile()` por `updateUser()` después de actualizar nombre/avatar
- ✅ Usa datos directamente de la respuesta de `updateProfile()`

## 🧪 Pruebas Realizadas

### Test Manual
1. ✅ Login exitoso
2. ✅ Navegación a `/profile`
3. ✅ Actualización de nombre → **Sesión se mantiene**
4. ✅ Actualización de descripción → **Sesión se mantiene**
5. ✅ Subida de avatar → **Sesión se mantiene**
6. ✅ Múltiples actualizaciones → **Sesión se mantiene**

## ✅ Resultado

**ANTES:**
- Actualizar perfil → `getProfile()` falla → `AUTH_ERROR` → Sesión cerrada ❌

**DESPUÉS:**
- Actualizar perfil → `updateUser()` con datos de respuesta → Sesión mantenida ✅

## 🔍 Verificación

Para verificar que el fix funciona:

1. **Inicia sesión**
2. **Ve a `/profile`**
3. **Actualiza tu nombre** → Debería guardarse sin cerrar sesión
4. **Actualiza tu descripción** → Debería guardarse sin cerrar sesión
5. **Verifica en consola** → No debería aparecer "Error al obtener perfil"

## 📝 Notas Importantes

1. **`updateUser()` es solo para actualizaciones locales** - No hace llamadas al backend
2. **Los datos siempre vienen de la respuesta de `updateProfile()`** - Son datos frescos del backend
3. **`getProfile()` todavía existe** pero solo se usa cuando es necesario refrescar desde el backend
4. **La sesión se mantiene** incluso si hay errores temporales de red

## 🚨 Si el Problema Persiste

Si después de estos cambios aún se cierra la sesión:

1. **Verifica que el backend está funcionando:**
   ```bash
   curl http://localhost:5000/api/auth/me -H "Authorization: Bearer TU_TOKEN"
   ```

2. **Verifica el token en localStorage:**
   ```javascript
   console.log(localStorage.getItem('airbnb_auth_token'));
   ```

3. **Verifica las cookies:**
   - Abre DevTools → Application → Cookies
   - Debe existir `airbnb_auth_token`

4. **Revisa los logs en consola:**
   - Busca mensajes que empiecen con `[AuthContext]`
   - Busca mensajes que empiecen con `[profileService]`

## 📊 Flujo Corregido

```
Usuario actualiza perfil
    ↓
profileService.updateProfile() → PATCH /api/profile
    ↓
Respuesta exitosa con datos actualizados
    ↓
updateUser() actualiza contexto local
    ↓
UI se actualiza inmediatamente
    ↓
✅ Sesión mantenida
```

---

**Fecha:** 2024-01-15  
**Estado:** ✅ **CORREGIDO**

