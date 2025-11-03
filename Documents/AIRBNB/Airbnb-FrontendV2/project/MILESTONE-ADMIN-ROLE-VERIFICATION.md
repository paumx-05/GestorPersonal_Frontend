# Milestone: Verificación Correcta de Rol de Admin

## 🎯 Objetivo
Implementar una verificación robusta del rol de admin basada en el campo `role` que viene del backend, eliminando el "arreglo" temporal que solo verifica el email `admin@airbnb.com`.

## 📋 Fase 1: Auditoría del Sistema Actual

### 1.1 Archivos Involucrados
- ✅ `context/AuthContext.tsx` - Maneja el estado de autenticación y el objeto `user`
- ✅ `components/auth/UserMenu.tsx` - Verifica el rol para mostrar menú de admin
- ✅ `lib/api/auth.ts` - Servicio de autenticación que guarda el usuario
- ✅ `lib/api/admin.ts` - Servicio que verifica el rol de admin
- ✅ `app/admin/properties/page.tsx` - Verifica admin antes de mostrar contenido

### 1.2 Estado Actual del Mock/Arreglo
**Problema identificado:**
- ❌ Verificación temporal por email `admin@airbnb.com` en múltiples lugares
- ❌ No usa el campo `role` que viene del backend de forma consistente
- ❌ Múltiples puntos de verificación con lógica duplicada
- ❌ No escalable: solo funciona para un email específico

**Ubicaciones del arreglo:**
1. `components/auth/UserMenu.tsx` líneas 58-64, 75-80, 115-118, 142-145, 166-169
2. `lib/api/admin.ts` líneas 233-238
3. `app/admin/properties/page.tsx` líneas 103-106, 117-120, 153-158, 168-173

### 1.3 Flujo Actual de Datos
```
Login → Backend (/api/auth/login)
  ↓
Backend devuelve: { success: true, data: { user: {...}, token: "..." } }
  ↓
authService.login() guarda user en localStorage
  ↓
AuthContext actualiza estado con user
  ↓
UserMenu verifica rol:
  1. Verifica email === 'admin@airbnb.com' (ARREGLO)
  2. Verifica localStorage (parsedUser.role)
  3. Verifica user.role del contexto
  4. Llama a adminService.checkAdminRole() (backend)
```

## 📋 Fase 2: Revisión de Postman/Backend

### 2.1 Endpoints Relevantes

**Login:**
- `POST /api/auth/login`
- **Request:** `{ email, password }`
- **Response esperado:** 
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "...",
        "email": "...",
        "name": "...",
        "role": "admin" | "user",  // ← ESTE CAMPO ES CRÍTICO
        ...
      },
      "token": "..."
    }
  }
  ```

**Verificación de usuario autenticado:**
- `GET /api/auth/me`
- `GET /api/users/me`
- **Response esperado:**
  ```json
  {
    "success": true,
    "user": {
      "id": "...",
      "email": "...",
      "name": "...",
      "role": "admin" | "user",  // ← DEBE INCLUIR EL ROL
      ...
    }
  }
  ```

### 2.2 Contrato Esperado

**Campo `role` en User:**
- Tipo: `'admin' | 'user'`
- Ubicación: `user.role` (directamente en el objeto user)
- Requerido: Sí (debe estar presente en todas las respuestas)

### 2.3 Riesgos Identificados
- ⚠️ El backend podría no devolver `role` en todas las respuestas
- ⚠️ El `role` podría estar en diferentes ubicaciones: `response.user.role`, `response.data.user.role`, `response.data.role`
- ⚠️ Si el backend no devuelve el rol, no habrá fallback válido

## 📋 Fase 3: Plan de Integración

### 3.1 Flujo de Datos Correcto
```
Login → Backend devuelve user con role
  ↓
authService.login() guarda user completo (incluyendo role)
  ↓
AuthContext actualiza user con role
  ↓
Componentes verifican: user.role === 'admin'
  ↓
Si role no está disponible, llamar a /api/auth/me o /api/users/me
```

### 3.2 Decisiones Técnicas

1. **Fuente de verdad:** El campo `user.role` del contexto de autenticación
2. **Fallback:** Si `user.role` no está disponible, hacer petición a `/api/auth/me`
3. **Cache:** Usar `user.role` del contexto, solo verificar backend si falta
4. **Validación:** Asegurar que el backend siempre devuelva `role` en login y en `/api/auth/me`

### 3.3 Esquemas y Tipos

**Interfaz User (lib/api/auth.ts):**
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  role: 'admin' | 'user'; // ← DEBE SER REQUERIDO, NO OPCIONAL
}
```

### 3.4 Estrategia de Errores

1. **Si `user.role` no está disponible:**
   - Hacer petición a `/api/auth/me` para obtener el perfil completo
   - Extraer `role` de la respuesta
   - Actualizar el contexto con el rol obtenido

2. **Si el backend no devuelve `role`:**
   - Mostrar error en consola
   - Asumir `role: 'user'` por defecto
   - No mostrar funciones de admin

3. **Mensajes de error:**
   - Consola: "⚠️ El backend no devolvió el campo 'role' en la respuesta"
   - Usuario: No mostrar errores, simplemente no mostrar funciones de admin

## 📋 Fase 4: Implementación

### Tareas Concretas

#### Tarea 1: Asegurar que `role` sea requerido en la interfaz User
- [ ] Editar `lib/api/auth.ts`: Cambiar `role?: 'admin' | 'user'` a `role: 'admin' | 'user'`
- [ ] Asegurar que el login guarde el `role` correctamente

#### Tarea 2: Actualizar AuthContext para manejar el rol
- [ ] Editar `context/AuthContext.tsx`: Asegurar que `user.role` se guarde correctamente
- [ ] Verificar que `checkAuthStatus()` preserve el `role`

#### Tarea 3: Refactorizar UserMenu para usar solo `user.role`
- [ ] Editar `components/auth/UserMenu.tsx`: Eliminar todas las verificaciones por email
- [ ] Usar solo `user?.role === 'admin'` como verificación principal
- [ ] Si `user.role` no está disponible, hacer fallback a backend

#### Tarea 4: Refactorizar adminService.checkAdminRole()
- [ ] Editar `lib/api/admin.ts`: Simplificar para extraer `role` correctamente
- [ ] Eliminar fallback por email

#### Tarea 5: Refactorizar app/admin/properties/page.tsx
- [ ] Editar `app/admin/properties/page.tsx`: Usar `user?.role === 'admin'`
- [ ] Eliminar verificaciones por email

### 4.1 Archivos a Modificar

1. `lib/api/auth.ts` - Interfaz User y guardado de rol
2. `context/AuthContext.tsx` - Preservar role en el contexto
3. `components/auth/UserMenu.tsx` - Verificación basada en role
4. `lib/api/admin.ts` - Simplificar verificación
5. `app/admin/properties/page.tsx` - Verificación basada en role

## 📋 Fase 5: Requisitos del Backend

### Lo que el Backend DEBE hacer:

1. **En `POST /api/auth/login`:**
   - Debe devolver el campo `role` en el objeto `user`
   - Formato: `{ success: true, data: { user: { ..., role: 'admin' | 'user' }, token: '...' } }`

2. **En `GET /api/auth/me`:**
   - Debe devolver el campo `role` en el objeto `user`
   - Formato: `{ success: true, user: { ..., role: 'admin' | 'user' } }` o `{ success: true, data: { user: { ..., role: 'admin' | 'user' } } }`

3. **En `GET /api/users/me`:**
   - Debe devolver el campo `role` en el objeto usuario
   - Formato similar al anterior

### Verificación del Backend:

**Instrucciones para el Backend:**
1. Asegurar que el modelo de Usuario tenga el campo `role` con valores `'admin'` o `'user'`
2. Asegurar que en `POST /api/auth/login` se incluya `role` en la respuesta
3. Asegurar que en `GET /api/auth/me` se incluya `role` en la respuesta
4. Asegurar que en `GET /api/users/me` se incluya `role` en la respuesta
5. El campo `role` debe estar al mismo nivel que `email`, `name`, etc. en el objeto `user`

## 📋 Fase 6: Checklist de Implementación

- [ ] Interfaz User actualizada con `role: 'admin' | 'user'` (no opcional)
- [ ] `authService.login()` guarda correctamente el `role`
- [ ] `AuthContext` preserva el `role` en el estado
- [ ] `UserMenu` verifica solo con `user?.role === 'admin'`
- [ ] `adminService.checkAdminRole()` simplificado
- [ ] `app/admin/properties/page.tsx` verifica solo con `user?.role === 'admin'`
- [ ] Eliminadas todas las verificaciones por email `admin@airbnb.com`
- [ ] Backend verificado que devuelve `role` en login y `/api/auth/me`
- [ ] Pruebas manuales realizadas
- [ ] Documentación actualizada

