# Integración de Autenticación - Frontend con Backend

## 📋 Objetivo

Este documento describe cómo integrar el sistema de autenticación del backend con el frontend, incluyendo todos los endpoints, formatos de datos y ejemplos de implementación.

---

## 🏗️ Estructura del Backend (MVC)

### Arquitectura Actual

```
src/
├── models/
│   └── User.model.ts          # Modelo de usuario (MongoDB/Mongoose)
├── controllers/
│   ├── auth.controller.ts     # Lógica de autenticación
│   └── user.controller.ts     # Lógica de gestión de usuario
├── routes/
│   ├── auth.routes.ts         # Rutas de autenticación
│   └── users.routes.ts       # Rutas de usuario (protegidas)
├── middleware/
│   └── auth.middleware.ts    # Middleware de autenticación JWT
├── utils/
│   └── jwt.utils.ts          # Utilidades JWT (generar/verificar tokens)
└── config/
    └── database.ts           # Configuración MongoDB
```

### Flujo de Datos (MVC)

1. **Request** → Frontend envía request a `routes/`
2. **Middleware** → `auth.middleware.ts` valida token JWT (si es necesario)
3. **Controller** → `auth.controller.ts` procesa la lógica de negocio
4. **Model** → `User.model.ts` interactúa con MongoDB
5. **Response** → Backend devuelve respuesta JSON al frontend

---

## 🔐 Endpoints de Autenticación

### Base URL
```
http://localhost:4444
```

### Endpoints Disponibles

#### 1. Registro de Usuario
```
POST /api/auth/register
```
**No requiere autenticación**

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "nombre": "Nombre del Usuario",
  "descripcion": "Descripción opcional"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com",
      "nombre": "Nombre del Usuario",
      "descripcion": "Descripción opcional",
      "avatar": null,
      "role": "regular",
      "fechaCreacion": "2025-11-05T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Usuario registrado exitosamente"
}
```

**Errores posibles:**
- `400` - Datos faltantes o inválidos
- `409` - Email ya registrado
- `500` - Error del servidor

---

#### 2. Inicio de Sesión
```
POST /api/auth/login
```
**No requiere autenticación**

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com",
      "nombre": "Nombre del Usuario",
      "descripcion": "Descripción opcional",
      "avatar": null,
      "role": "regular",
      "fechaCreacion": "2025-11-05T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login exitoso"
}
```

**Errores posibles:**
- `400` - Email o contraseña faltantes
- `401` - Credenciales inválidas
- `500` - Error del servidor

---

#### 3. Obtener Usuario Autenticado
```
GET /api/auth/me
```
**Requiere autenticación** (token JWT)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "nombre": "Nombre del Usuario",
    "descripcion": "Descripción opcional",
    "avatar": null,
    "role": "regular",
    "fechaCreacion": "2025-11-05T10:00:00.000Z"
  }
}
```

**Errores posibles:**
- `401` - Token no válido o faltante
- `404` - Usuario no encontrado
- `500` - Error del servidor

---

#### 4. Cerrar Sesión
```
POST /api/auth/logout
```
**Requiere autenticación** (token JWT)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

**Nota:** El logout se maneja principalmente en el frontend eliminando el token del localStorage/sessionStorage.

---

#### 5. Solicitar Reset de Contraseña
```
POST /api/auth/forgot-password
```
**No requiere autenticación**

**Request Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Si el email existe, se ha enviado un enlace para restablecer la contraseña",
  "resetToken": "abc123def456...", // Solo en desarrollo
  "note": "⚠️ En producción, este token se enviaría por email"
}
```

**Nota:** En desarrollo, el token se devuelve en la respuesta. En producción, se enviaría por email.

---

#### 6. Restablecer Contraseña
```
POST /api/auth/reset-password
```
**No requiere autenticación**

**Request Body:**
```json
{
  "token": "abc123def456...",
  "newPassword": "nuevaPassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente"
}
```

**Errores posibles:**
- `400` - Token inválido o expirado, contraseña inválida
- `404` - Usuario no encontrado
- `500` - Error del servidor

---

## 👤 Endpoints de Usuario

### Base URL
```
http://localhost:4444
```

#### 1. Obtener Perfil
```
GET /api/users/profile
```
**Requiere autenticación**

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "nombre": "Nombre del Usuario",
    "descripcion": "Descripción opcional",
    "avatar": null,
    "role": "regular",
    "fechaCreacion": "2025-11-05T10:00:00.000Z"
  }
}
```

---

#### 2. Actualizar Perfil
```
PUT /api/users/profile
```
**Requiere autenticación**

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "Nombre Actualizado",
  "descripcion": "Nueva descripción",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Nota:** Todos los campos son opcionales. Solo se actualizan los campos enviados.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "nombre": "Nombre Actualizado",
    "descripcion": "Nueva descripción",
    "avatar": "https://example.com/avatar.jpg",
    "role": "regular",
    "fechaCreacion": "2025-11-05T10:00:00.000Z"
  },
  "message": "Perfil actualizado exitosamente"
}
```

---

## 🔑 Manejo de Tokens JWT en el Frontend

### Almacenamiento del Token

**Recomendado:** Usar `localStorage` para persistir el token entre sesiones.

```typescript
// Guardar token después de login/register
localStorage.setItem('authToken', token);

// Obtener token para enviarlo en requests
const token = localStorage.getItem('authToken');

// Eliminar token al hacer logout
localStorage.removeItem('authToken');
```

### Enviar Token en Requests

**Headers requeridos:**
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Validar Token

El token JWT tiene una expiración de **7 días** por defecto. El frontend debe:
1. Verificar si el token existe antes de hacer requests protegidos
2. Manejar errores 401 (token inválido/expirado)
3. Redirigir al login si el token es inválido

---

## 📝 Ejemplos de Integración Frontend

### Ejemplo 1: Función de Registro

```typescript
// services/auth.service.ts
const API_URL = 'http://localhost:4444';

export const register = async (userData: {
  email: string;
  password: string;
  nombre: string;
  descripcion?: string;
}) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al registrar usuario');
  }

  // Guardar token
  if (data.data?.token) {
    localStorage.setItem('authToken', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }

  return data;
};
```

### Ejemplo 2: Función de Login

```typescript
// services/auth.service.ts
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }

  // Guardar token y usuario
  if (data.data?.token) {
    localStorage.setItem('authToken', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }

  return data;
};
```

### Ejemplo 3: Función de Logout

```typescript
// services/auth.service.ts
export const logout = async () => {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // Eliminar datos locales
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
```

### Ejemplo 4: Función para Obtener Usuario Autenticado

```typescript
// services/auth.service.ts
export const getCurrentUser = async () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    // Si el token es inválido, limpiar localStorage
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    throw new Error(data.error || 'Error al obtener usuario');
  }

  return data.data;
};
```

### Ejemplo 5: Función para Actualizar Perfil

```typescript
// services/user.service.ts
export const updateProfile = async (updates: {
  nombre?: string;
  descripcion?: string;
  avatar?: string;
}) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_URL}/api/users/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar perfil');
  }

  // Actualizar usuario en localStorage
  if (data.data) {
    localStorage.setItem('user', JSON.stringify(data.data));
  }

  return data;
};
```

### Ejemplo 6: Función para Forgot Password

```typescript
// services/auth.service.ts
export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al procesar la solicitud');
  }

  // En desarrollo, el token viene en la respuesta
  if (data.resetToken) {
    return data.resetToken; // Para usar en reset-password
  }

  return data;
};
```

### Ejemplo 7: Función para Reset Password

```typescript
// services/auth.service.ts
export const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token, newPassword })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al restablecer contraseña');
  }

  return data;
};
```

---

## 🔄 Flujo Completo de Autenticación

### 1. Registro de Usuario

```
Frontend                    Backend
    |                          |
    |-- POST /register ------->|
    |   { email, password,    |
    |     nombre, descripcion }|
    |                          |
    |<-- 201 Created ----------|
    |   { user, token }       |
    |                          |
    | [Guardar token en        |
    |  localStorage]           |
```

### 2. Login de Usuario

```
Frontend                    Backend
    |                          |
    |-- POST /login ---------->|
    |   { email, password }   |
    |                          |
    |<-- 200 OK --------------|
    |   { user, token }       |
    |                          |
    | [Guardar token en        |
    |  localStorage]           |
```

### 3. Acceso a Rutas Protegidas

```
Frontend                    Backend
    |                          |
    |-- GET /me -------------->|
    |   Authorization: Bearer  |
    |   <token>               |
    |                          |
    | [Middleware valida       |
    |  token JWT]             |
    |                          |
    | [Controller obtiene      |
    |  usuario de MongoDB]    |
    |                          |
    |<-- 200 OK --------------|
    |   { user }              |
```

### 4. Logout

```
Frontend                    Backend
    |                          |
    |-- POST /logout --------->|
    |   Authorization: Bearer  |
    |   <token>               |
    |                          |
    |<-- 200 OK --------------|
    |   { message }           |
    |                          |
    | [Eliminar token de       |
    |  localStorage]           |
```

---

## 🛡️ Manejo de Errores

### Errores Comunes y Cómo Manejarlos

#### Error 401: Unauthorized
```typescript
if (response.status === 401) {
  // Token inválido o expirado
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  // Redirigir al login
  window.location.href = '/login';
}
```

#### Error 409: Conflict (Email duplicado)
```typescript
if (response.status === 409) {
  // Mostrar mensaje: "El email ya está registrado"
  alert(data.error);
}
```

#### Error 400: Bad Request
```typescript
if (response.status === 400) {
  // Mostrar mensaje de validación
  alert(data.error);
}
```

#### Error 500: Internal Server Error
```typescript
if (response.status === 500) {
  // Mostrar mensaje genérico
  alert('Error del servidor. Por favor, intenta más tarde.');
}
```

---

## 📋 Checklist de Integración

### Frontend debe implementar:

- [ ] Servicio de autenticación (`auth.service.ts`)
- [ ] Guardar token JWT en `localStorage` después de login/register
- [ ] Incluir token en header `Authorization` para requests protegidos
- [ ] Manejar errores 401 (token inválido) redirigiendo al login
- [ ] Validar token antes de hacer requests protegidos
- [ ] Limpiar token al hacer logout
- [ ] Función para verificar si el usuario está autenticado
- [ ] Protección de rutas (solo accesibles si hay token válido)

### Ejemplo de Función Helper

```typescript
// utils/auth.utils.ts
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getCurrentUser = (): any | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const clearAuth = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
```

---

## 🔧 Configuración del Frontend

### Variables de Entorno

Crear archivo `.env.local` o `.env` en el frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:4444
```

### Ejemplo de Configuración

```typescript
// config/api.config.ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444',
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      me: '/api/auth/me',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password'
    },
    users: {
      profile: '/api/users/profile'
    }
  }
};
```

---

## 🎯 Formato de Respuestas Estándar

### Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje opcional"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": "Mensaje de error",
  "message": "Mensaje adicional (solo en desarrollo)"
}
```

---

## 🔍 Validaciones del Backend

### Validaciones Aplicadas

1. **Email:**
   - Formato válido (regex)
   - Requerido
   - Normalizado a minúsculas
   - Único en la base de datos

2. **Password:**
   - Mínimo 6 caracteres
   - Requerido
   - Hasheado con bcrypt antes de guardar

3. **Nombre:**
   - Requerido
   - Trim aplicado

4. **Token JWT:**
   - Validado en cada request protegido
   - Expira en 7 días (configurable)
   - Formato: `Bearer <token>`

---

## 📡 CORS y Configuración

El backend está configurado para aceptar requests desde cualquier origen:

```typescript
app.use(cors());
```

Si necesitas restringir el origen, puedes configurarlo en `server.ts`:

```typescript
app.use(cors({
  origin: 'http://localhost:3000', // URL del frontend
  credentials: true
}));
```

---

## 🧪 Testing con Postman

### Colección de Postman

Importar el archivo `postman-collection.json` que incluye:
- Todos los endpoints de autenticación
- Scripts automáticos para guardar tokens
- Variables de entorno preconfiguradas

### Variables de Postman

- `base_url`: `http://localhost:4444`
- `auth_token`: Se guarda automáticamente al hacer login
- `reset_token`: Se guarda automáticamente al hacer forgot-password

---

## 📝 Notas Importantes

1. **Tokens JWT:**
   - Expiran en 7 días
   - Se deben incluir en el header `Authorization: Bearer <token>`
   - Si el token expira, el usuario debe hacer login nuevamente

2. **Seguridad:**
   - Las contraseñas nunca se devuelven en las respuestas
   - Los emails se normalizan a minúsculas
   - Los tokens de reset expiran en 1 hora

3. **Base de Datos:**
   - Los usuarios se guardan en MongoDB Atlas
   - La colección se llama `users`
   - El campo `email` es único

4. **Roles:**
   - `regular`: Usuario normal
   - `admin`: Usuario administrador

---

## 🚀 Próximos Pasos

Una vez integrada la autenticación, puedes:
1. Integrar los endpoints de gastos e ingresos
2. Implementar la gestión de categorías
3. Agregar funcionalidad de presupuestos
4. Implementar sistema de amigos y chat

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica que el servidor esté corriendo en `http://localhost:4444`
2. Verifica que MongoDB esté conectado (ver mensaje en consola)
3. Revisa los logs del servidor para ver errores específicos
4. Verifica que el token JWT esté siendo enviado correctamente

---

**Última actualización:** Integración completa de autenticación con MongoDB Atlas

