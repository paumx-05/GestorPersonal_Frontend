# MILESTONE - Sistema de Reset Password con Token

## Objetivo del Producto
Implementar funcionalidad completa de restablecimiento de contraseña que procese tokens de recuperación enviados por email, permitiendo a los usuarios crear nuevas contraseñas de forma segura.

## Criterios de Aceptación
- Los usuarios pueden acceder a la página de reset con token válido
- Formulario seguro para nueva contraseña con validaciones
- Manejo de errores para tokens inválidos o expirados
- Redirección automática al login después del éxito
- Interfaz simple y comprensible para cualquier usuario

---

## Tareas de Implementación

### 1. **Crear Página de Reset Password**
**Objetivo:** Implementar página que procese el token de la URL

**Implementación:**
```typescript
// app/reset-password/[token]/page.tsx
// URL: /reset-password/reset_eyJ1c2VySWQiOiI2OGZjYzljYjhlMmYzNWU5ZmUwNjkwMGUiLCJlbWFpbCI6ImFkbWluQGFpcmJuYi5jb20iLCJ0eXBlIjoicGFzc3dvcmQtcmVzZXQiLCJpYXQiOjE3NjE0MjIwMDksImV4cCI6MTc2MTUwODQwOX0=
```

**Criterios:**
- Extraer token de parámetros de ruta dinámica
- Validar formato del token
- Mostrar formulario solo si token es válido
- Redirigir si no hay token o es inválido

**Comentarios para el desarrollador:**
```typescript
// Función principal para extraer token
function extractTokenFromURL() {
  // 1. Obtener parámetros de ruta con useParams()
  // 2. Validar que existe 'token' en params
  // 3. Validar formato del token
  // 4. Retornar token o null
}
```

---

### 2. **Crear Componente ResetPasswordForm**
**Objetivo:** Formulario seguro para nueva contraseña

**Implementación:**
```typescript
// components/auth/ResetPasswordForm.tsx
// Props: { token: string, onSuccess: () => void }
```

**Criterios:**
- Campo para nueva contraseña (mínimo 6 caracteres)
- Campo para confirmar contraseña
- Validación en tiempo real
- Botón de envío con loading state
- Manejo de errores del backend

**Comentarios para el desarrollador:**
```typescript
// Estados del formulario
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');

// Función de envío
async function handleSubmit() {
  // 1. Validar contraseñas coinciden
  // 2. Llamar authService.resetPassword()
  // 3. Manejar respuesta
  // 4. Redirigir al éxito
}
```

---

### 3. **Implementar Validación del Token**
**Objetivo:** Verificar que el token es válido antes de mostrar formulario

**Implementación:**
```typescript
// Validación del token en la página
useEffect(() => {
  if (!token) {
    router.push('/forgot-password');
    return;
  }
  
  // Opcional: validar token con backend
  validateToken(token);
}, [token]);
```

**Criterios:**
- Verificar que token existe en URL
- Validar formato básico del token
- Mostrar error si token es inválido
- Redirigir a forgot-password si no hay token

**Comentarios para el desarrollador:**
```typescript
// Función de validación
function validateToken(token: string) {
  // 1. Verificar que no esté vacío
  // 2. Verificar formato básico
  // 3. Opcional: validar con backend
  // 4. Retornar true/false
}
```

---

### 4. **Agregar Redirección Automática**
**Objetivo:** Redirigir al login después del éxito

**Implementación:**
```typescript
// En ResetPasswordForm después del éxito
if (response.success) {
  setIsSuccess(true);
  setTimeout(() => {
    onSuccess(); // Redirige a /login
  }, 2000);
}
```

**Criterios:**
- Mostrar mensaje de éxito
- Auto-redirección después de 2 segundos
- Botón manual para ir al login
- Limpiar formulario después del éxito

**Comentarios para el desarrollador:**
```typescript
// Manejo del éxito
function handleSuccess() {
  // 1. Mostrar mensaje de éxito
  // 2. Iniciar timer de redirección
  // 3. Limpiar formulario
  // 4. Redirigir a login
}
```

---

### 5. **Integrar con Sistema de Autenticación**
**Objetivo:** Conectar con authService existente

**Implementación:**
```typescript
// Usar authService.resetPassword() existente
const response = await authService.resetPassword(token, newPassword);
```

**Criterios:**
- Usar authService.resetPassword() existente
- Manejar errores de la API
- Mostrar mensajes de error apropiados
- Integrar con AuthContext si es necesario

**Comentarios para el desarrollador:**
```typescript
// Integración con authService
import { authService } from '@/lib/api/auth';

// Llamada al servicio
const response = await authService.resetPassword(token, newPassword);
if (response.success) {
  // Manejar éxito
} else {
  // Manejar error
  setError(response.message);
}
```
