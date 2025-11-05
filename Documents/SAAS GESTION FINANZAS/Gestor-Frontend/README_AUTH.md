# Sistema de Autenticación

Este proyecto implementa un sistema de autenticación preparado para integración con backend JWT, siguiendo el patrón MVC (Modelo-Vista-Controlador).

## Estructura MVC

### 📁 Models (`models/auth.ts`)
Define las interfaces y tipos relacionados con autenticación:
- `Usuario`: Información del usuario
- `LoginRequest`: Datos para login
- `RegisterRequest`: Datos para registro
- `AuthResponse`: Respuesta del backend con token JWT
- `AuthError`: Manejo de errores

### 🔧 Services (`services/auth.service.ts`)
Capa de servicio que maneja las llamadas HTTP al backend:
- `authService.login()`: Autenticación con backend
- `authService.register()`: Registro de nuevo usuario
- `authService.getCurrentUser()`: Obtener usuario actual
- `authService.refreshToken()`: Refrescar token JWT
- `authService.logout()`: Cerrar sesión

### 🎮 Controllers (`controllers/auth.controller.ts`)
Lógica de negocio y orquestación:
- `authController.login()`: Maneja login con fallback a mock
- `authController.register()`: Maneja registro con fallback a mock
- `authController.isAuthenticated()`: Verifica autenticación
- `authController.logout()`: Cierra sesión
- `authController.refreshTokenIfNeeded()`: Refresca token si es necesario

### 🔐 Utils (`utils/jwt.ts`)
Utilidades para manejar JWT:
- `saveToken()`: Guarda token en localStorage
- `getToken()`: Obtiene token del localStorage
- `decodeToken()`: Decodifica token JWT
- `isTokenExpired()`: Verifica si el token está expirado
- `isTokenValid()`: Verifica si el token es válido
- `clearTokens()`: Limpia todos los tokens

### 🛡️ Middleware (`middleware/routeProtection.tsx`)
Protección de rutas:
- `ProtectedRoute`: Componente HOC que protege rutas
- `useAuth()`: Hook para verificar autenticación en componentes

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Si no se configura, el sistema usa `http://localhost:3001/api` por defecto.

## Flujo de Autenticación

### Login
1. Usuario ingresa credenciales en `/login`
2. `authController.login()` intenta autenticar con backend
3. Si el backend no está disponible, usa autenticación mock como fallback
4. Si es exitoso, guarda el token JWT y redirige a `/dashboard`

### Registro
1. Usuario completa formulario en `/register`
2. `authController.register()` intenta registrar con backend
3. Si el backend no está disponible, usa autenticación mock como fallback
4. Si es exitoso, guarda el token JWT y redirige a `/dashboard`

### Protección de Rutas
- Todas las rutas en `/dashboard/*` están protegidas mediante `ProtectedRoute`
- Si el usuario no está autenticado, se redirige a `/login`
- El token se valida automáticamente y se refresca si es necesario

## Integración con Backend

### Endpoints Esperados

El backend debe implementar los siguientes endpoints:

#### POST `/auth/login`
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "usuario": {
    "id": "user-id",
    "nombre": "Nombre Usuario",
    "email": "usuario@example.com"
  },
  "expiresIn": 3600
}
```

#### POST `/auth/register`
```json
{
  "nombre": "Nombre Usuario",
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "usuario": {
    "id": "user-id",
    "nombre": "Nombre Usuario",
    "email": "usuario@example.com"
  },
  "expiresIn": 3600
}
```

#### GET `/auth/me`
Requiere header: `Authorization: Bearer <token>`

**Respuesta exitosa (200):**
```json
{
  "usuario": {
    "id": "user-id",
    "nombre": "Nombre Usuario",
    "email": "usuario@example.com"
  }
}
```

#### POST `/auth/refresh`
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 3600
}
```

#### POST `/auth/logout`
Requiere header: `Authorization: Bearer <token>`

**Respuesta exitosa (200):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

## Fallback a Mock

Si el backend no está disponible (error 500 o conexión fallida), el sistema automáticamente usa autenticación mock almacenada en localStorage. Esto permite desarrollo y testing sin necesidad del backend.

## Uso en Componentes

### Verificar Autenticación
```typescript
import { useAuth } from '@/middleware/routeProtection'

function MyComponent() {
  const { isAuthenticated, usuario, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>No autenticado</div>
  }
  
  return <div>Hola {usuario?.nombre}</div>
}
```

### Proteger una Ruta Manualmente
```typescript
import { ProtectedRoute } from '@/middleware/routeProtection'

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Contenido protegido</div>
    </ProtectedRoute>
  )
}
```

## Características

✅ Soporte completo para JWT
✅ Fallback automático a autenticación mock
✅ Protección de rutas automática
✅ Refresh token automático
✅ Manejo de errores robusto
✅ Código escalable y mantenible
✅ Sigue patrón MVC
✅ Sin sobre-ingeniería

