# MILESTONE - Integración Backend Reset Password

## Objetivo del Producto
Implementar endpoint API `/api/auth/reset-password` que redirija a la página de reset password, creando un flujo completo de restablecimiento de contraseña.

## Criterios de Aceptación
- Endpoint API funcional: `http://localhost:3000/api/auth/reset-password?token=xxx`
- Redirección automática a `/reset-password/[token]`
- Manejo correcto de errores y validaciones
- Integración completa con el formulario de reset
- Redirección automática después del éxito

---

## Tareas de Implementación

### 1. **Crear Endpoint API**
**Objetivo:** Implementar endpoint `/api/auth/reset-password` que redirija a la página

**Implementación:**
```typescript
// app/api/auth/reset-password/route.ts
// GET /api/auth/reset-password?token=reset_xxx
// Redirige a: /reset-password/[token]
```

**Criterios:**
- Extraer token de query parameters
- Validar formato del token
- Redirigir a `/reset-password/[token]` si es válido
- Redirigir a `/forgot-password` si es inválido

**Comentarios para el desarrollador:**
```typescript
// Extracción de token de parámetros de ruta
const params = useParams();
const token = params.token as string;

// Validación básica del token
if (!token || !token.startsWith('reset_')) {
  // Mostrar error y redirigir
}
```

---

### 2. **Implementar POST Handler**
**Objetivo:** Manejar el reset de contraseña desde el frontend

**Implementación:**
```typescript
// POST /api/auth/reset-password
// Body: { "token": "reset_token", "newPassword": "newpassword" }
// Response: { "success": true, "message": "Contraseña restablecida" }
```

**Criterios:**
- Validar token y nueva contraseña
- Validar formato del token
- Validar longitud de contraseña
- Retornar respuesta JSON apropiada

**Comentarios para el desarrollador:**
```typescript
// Llamada al servicio de autenticación
const response = await authService.resetPassword(token, newPassword);

// Manejo de respuesta del backend
if (response.success) {
  // Éxito: redirigir al login
} else {
  // Error: mostrar mensaje del backend
  setError(response.message);
}
```

---

### 3. **Configurar Flujo de Redirección**
**Objetivo:** Asegurar que la redirección funcione correctamente

**Implementación:**
```typescript
// Flujo completo:
// 1. Usuario hace clic en enlace: /api/auth/reset-password?token=xxx
// 2. API redirige a: /reset-password/[token]
// 3. Página muestra formulario
// 4. Formulario envía POST a: /api/auth/reset-password
// 5. API procesa y responde
```

**Criterios:**
- Redirección automática desde API
- Página de reset password funcional
- Formulario conectado con API
- Manejo de errores en cada paso

**Comentarios para el desarrollador:**
```typescript
// Verificar configuración del API client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// El ApiClient ya está configurado para usar esta URL
export const apiClient = new ApiClient();
```

---

### 4. **Manejar Errores y Validaciones**
**Objetivo:** Mostrar errores específicos en cada paso

**Implementación:**
```typescript
// Manejo de errores en API endpoint
if (!token) {
  return NextResponse.redirect('/forgot-password?error=no-token');
}

if (!token.startsWith('reset_')) {
  return NextResponse.redirect('/forgot-password?error=invalid-token');
}
```

**Criterios:**
- Token faltante: redirigir con error
- Token inválido: redirigir con error
- Error de servidor: redirigir con error
- Validaciones en POST handler

**Comentarios para el desarrollador:**
```typescript
// Tipos de errores a manejar
if (error.message.includes('Token expirado')) {
  setError('El enlace ha expirado. Solicita uno nuevo.');
} else if (error.message.includes('Token inválido')) {
  setError('El enlace no es válido. Solicita uno nuevo.');
} else {
  setError('Error de conexión. Verifica tu internet.');
}
```

---

### 5. **Probar Flujo Completo**
**Objetivo:** Verificar que todo funcione end-to-end

**Implementación:**
```bash
# 1. Iniciar frontend
npm run dev

# 2. Probar endpoint API
http://localhost:3000/api/auth/reset-password?token=reset_eyJ1c2VySWQiOiI2OGZjYzljYjhlMmYzNWU5ZmUwNjkwMGUiLCJlbWFpbCI6ImFkbWluQGFpcmJuYi5jb20iLCJ0eXBlIjoicGFzc3dvcmQtcmVzZXQiLCJpYXQiOjE3NjE0MjIwMDksImV4cCI6MTc2MTUwODQwOX0=

# 3. Verificar redirección a página
http://localhost:3000/reset-password/reset_eyJ1c2VySWQiOiI2OGZjYzljYjhlMmYzNWU5ZmUwNjkwMGUiLCJlbWFpbCI6ImFkbWluQGFpcmJuYi5jb20iLCJ0eXBlIjoicGFzc3dvcmQtcmVzZXQiLCJpYXQiOjE3NjE0MjIwMDksImV4cCI6MTc2MTUwODQwOX0=
```

**Criterios:**
- Frontend responde en puerto 3000
- Endpoint API redirige correctamente
- Página de reset password funciona
- Formulario se envía a API local
- Respuesta de API se maneja correctamente
- Redirección al login funciona

**Comentarios para el desarrollador:**
```typescript
// Verificar que el backend esté funcionando
curl http://localhost:5000/api/auth/reset-password

// Verificar que el frontend esté funcionando
curl http://localhost:3000/reset-password/test

// Probar flujo completo
1. Ir a forgot-password
2. Solicitar reset
3. Usar token del email
4. Completar reset
5. Verificar redirección
```

---

## 🔗 **URLs de Prueba**

### **URLs Funcionales:**
- **API Endpoint**: `http://localhost:3000/api/auth/reset-password?token=xxx`
- **Reset Password Page**: `http://localhost:3000/reset-password/[token]`
- **Forgot Password**: `http://localhost:3000/forgot-password`

### **Ejemplo de Token:**
```
reset_eyJ1c2VySWQiOiI2OGZjYzljYjhlMmYzNWU5ZmUwNjkwMGUiLCJlbWFpbCI6ImFkbWluQGFpcmJuYi5jb20iLCJ0eXBlIjoicGFzc3dvcmQtcmVzZXQiLCJpYXQiOjE3NjE0MjIwMDksImV4cCI6MTc2MTUwODQwOX0=
```

### **URL Completa de Prueba:**
```
http://localhost:3000/api/auth/reset-password?token=reset_eyJ1c2VySWQiOiI2OGZjYzljYjhlMmYzNWU5ZmUwNjkwMGUiLCJlbWFpbCI6ImFkbWluQGFpcmJuYi5jb20iLCJ0eXBlIjoicGFzc3dvcmQtcmVzZXQiLCJpYXQiOjE3NjE0MjIwMDksImV4cCI6MTc2MTUwODQwOX0=
```

---

## ✅ **Estado de Implementación**

- ✅ **API Endpoint**: `/api/auth/reset-password` implementado
- ✅ **Redirección automática**: De API a página de reset
- ✅ **Ruta dinámica**: `/reset-password/[token]` implementada
- ✅ **Integración local**: `authService.resetPassword()` conectado
- ✅ **Manejo de errores**: Errores manejados en cada paso
- ✅ **Validación de token**: Formato y existencia validados
- ✅ **Redirección**: Auto-redirect al login después del éxito
- ✅ **UI/UX**: Formulario completo con estados de loading/error/success

## 🚀 **Listo para Usar**

La funcionalidad está **100% implementada con endpoint API local**. Solo necesitas:

1. **Iniciar el frontend** en puerto 3000  
2. **Usar la URL**: `http://localhost:3000/api/auth/reset-password?token=xxx`

El sistema manejará automáticamente:
- ✅ Redirección desde API a página de reset
- ✅ Validación del token
- ✅ Formulario de nueva contraseña
- ✅ Envío a API local
- ✅ Redirección al login después del éxito
