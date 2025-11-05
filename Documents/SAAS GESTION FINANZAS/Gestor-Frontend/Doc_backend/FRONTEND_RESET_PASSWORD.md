# Integración Frontend - Reset de Contraseña

## 📋 Guía Completa para el Frontend

Este documento explica cómo integrar las funcionalidades de **forgot password** y **reset password** en el frontend.

---

## 🔗 Endpoints Disponibles

### Base URL
```
http://localhost:4444
```

### 1. Solicitar Reset de Contraseña
```
POST /api/auth/forgot-password
```
**No requiere autenticación**

### 2. Restablecer Contraseña
```
POST /api/auth/reset-password
```
**No requiere autenticación**

---

## 📝 Endpoint 1: Forgot Password

### Request

**URL:** `POST /api/auth/forgot-password`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "email": "usuario@example.com"
}
```

### Response (Desarrollo)

**Status:** `200 OK`

**Body:**
```json
{
  "success": true,
  "message": "Si el email existe, se ha enviado un enlace para restablecer la contraseña",
  "resetToken": "abc123def456ghi789...",
  "resetLink": "http://localhost:3000/reset-password?token=abc123def456ghi789...",
  "note": "⚠️ En producción, este token se enviaría por email"
}
```

### Response (Producción)

**Status:** `200 OK`

**Body:**
```json
{
  "success": true,
  "message": "Si el email existe, se ha enviado un enlace para restablecer la contraseña"
}
```

**Nota:** En producción, el token NO se devuelve en la respuesta. Se envía por email.

---

## 📝 Endpoint 2: Reset Password

### Request

**URL:** `POST /api/auth/reset-password`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "token": "abc123def456ghi789...",
  "newPassword": "nuevaPassword123"
}
```

### Response (Éxito)

**Status:** `200 OK`

**Body:**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente"
}
```

### Response (Error - Token Inválido)

**Status:** `400 Bad Request`

**Body:**
```json
{
  "success": false,
  "error": "Token inválido o expirado"
}
```

### Response (Error - Contraseña Inválida)

**Status:** `400 Bad Request`

**Body:**
```json
{
  "success": false,
  "error": "La contraseña debe tener al menos 6 caracteres"
}
```

---

## 💻 Implementación en el Frontend

### Ejemplo 1: Función de Forgot Password

```typescript
// services/auth.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444';

export const forgotPassword = async (email: string): Promise<{
  success: boolean;
  message: string;
  resetToken?: string;
  resetLink?: string;
}> => {
  try {
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

    return data;
  } catch (error: any) {
    console.error('Error en forgotPassword:', error);
    throw error;
  }
};
```

### Ejemplo 2: Función de Reset Password

```typescript
// services/auth.service.ts
export const resetPassword = async (
  token: string, 
  newPassword: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al restablecer la contraseña');
    }

    return data;
  } catch (error: any) {
    console.error('Error en resetPassword:', error);
    throw error;
  }
};
```

---

## 🔄 Flujo Completo de Recuperación

### Paso 1: Página de Forgot Password

```typescript
// pages/forgot-password.tsx o components/ForgotPassword.tsx
import { useState } from 'react';
import { forgotPassword } from '../services/auth.service';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await forgotPassword(email);
      
      // Mostrar mensaje de éxito
      setMessage(result.message);
      
      // En desarrollo, mostrar el token (opcional)
      if (process.env.NODE_ENV === 'development' && result.resetToken) {
        console.log('Token de reset:', result.resetToken);
        console.log('Enlace completo:', result.resetLink);
        
        // Opcional: Guardar token en localStorage para testing
        localStorage.setItem('resetToken', result.resetToken);
      }
      
      // Redirigir a página de éxito o mostrar instrucciones
      // En producción, el usuario recibirá el email
      
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Recuperar Contraseña</h2>
      
      {message && (
        <div className="success-message">
          {message}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
      </button>
    </form>
  );
};
```

### Paso 2: Página de Reset Password

```typescript
// pages/reset-password.tsx o components/ResetPassword.tsx
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // o useRouter de react-router
import { resetPassword } from '../services/auth.service';

export const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Obtener token de la URL o localStorage
  useEffect(() => {
    // Intentar obtener token de la URL (query parameter)
    const tokenFromUrl = searchParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      // En desarrollo, intentar obtener de localStorage
      const storedToken = localStorage.getItem('resetToken');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud mínima
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!token) {
      setError('Token no válido. Por favor, solicita un nuevo enlace de recuperación.');
      return;
    }

    setLoading(true);

    try {
      // Decodificar token si viene de URL (puede estar codificado)
      const cleanToken = decodeURIComponent(token);
      
      const result = await resetPassword(cleanToken, newPassword);
      
      setMessage(result.message);
      
      // Limpiar token de localStorage si existe
      localStorage.removeItem('resetToken');
      
      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Restablecer Contraseña</h2>
      
      {message && (
        <div className="success-message">
          {message}
          <p>Redirigiendo al login...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
          {error.includes('Token inválido') && (
            <button onClick={() => router.push('/forgot-password')}>
              Solicitar nuevo enlace
            </button>
          )}
        </div>
      )}
      
      {!token && (
        <div className="error-message">
          No se encontró un token válido. Por favor, solicita un nuevo enlace.
          <button onClick={() => router.push('/forgot-password')}>
            Ir a recuperar contraseña
          </button>
        </div>
      )}
      
      {token && (
        <>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
          </button>
        </>
      )}
    </form>
  );
};
```

---

## 🔑 Manejo del Token

### Opción 1: Token desde URL (Producción)

Cuando el usuario hace clic en el enlace del email:

```
http://tu-frontend.com/reset-password?token=abc123def456...
```

El frontend debe extraer el token de la URL:

```typescript
// Next.js
const searchParams = useSearchParams();
const token = searchParams.get('token');

// React Router
const [searchParams] = useSearchParams();
const token = searchParams.get('token');

// Vanilla JS
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
```

### Opción 2: Token en Desarrollo

En desarrollo, el token viene en la respuesta del endpoint. Puedes:

1. **Guardarlo en localStorage** (solo para testing):
```typescript
if (result.resetToken) {
  localStorage.setItem('resetToken', result.resetToken);
}
```

2. **Mostrarlo en consola**:
```typescript
console.log('Token:', result.resetToken);
```

3. **Copiarlo al clipboard**:
```typescript
navigator.clipboard.writeText(result.resetToken);
```

### Decodificar Token de URL

Si el token viene en la URL, puede estar codificado. Siempre decodifícalo:

```typescript
const tokenFromUrl = searchParams.get('token');
const cleanToken = decodeURIComponent(tokenFromUrl || '');
```

---

## 🎨 Ejemplo Completo con React Hook Form

```typescript
// components/ForgotPasswordForm.tsx
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../services/auth.service';

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const result = await forgotPassword(data.email);
      
      // Mostrar mensaje de éxito
      alert(result.message);
      
      // En desarrollo, mostrar token
      if (process.env.NODE_ENV === 'development' && result.resetToken) {
        console.log('Token:', result.resetToken);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="email"
        placeholder="Email"
        {...register('email', {
          required: 'Email es requerido',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email inválido'
          }
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
      </button>
    </form>
  );
};
```

```typescript
// components/ResetPasswordForm.tsx
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { resetPassword } from '../services/auth.service';

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<ResetPasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      alert('Token no válido');
      return;
    }

    try {
      const cleanToken = decodeURIComponent(token);
      await resetPassword(cleanToken, data.newPassword);
      alert('Contraseña restablecida exitosamente');
      router.push('/login');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="password"
        placeholder="Nueva contraseña"
        {...register('newPassword', {
          required: 'Contraseña es requerida',
          minLength: {
            value: 6,
            message: 'La contraseña debe tener al menos 6 caracteres'
          }
        })}
      />
      {errors.newPassword && <span>{errors.newPassword.message}</span>}
      
      <input
        type="password"
        placeholder="Confirmar contraseña"
        {...register('confirmPassword', {
          required: 'Confirma tu contraseña',
          validate: (value) => 
            value === newPassword || 'Las contraseñas no coinciden'
        })}
      />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      
      <button type="submit" disabled={isSubmitting || !token}>
        {isSubmitting ? 'Restableciendo...' : 'Restablecer contraseña'}
      </button>
    </form>
  );
};
```

---

## 🛡️ Manejo de Errores

### Errores Comunes y Cómo Manejarlos

#### Error: Token Inválido o Expirado

```typescript
try {
  await resetPassword(token, newPassword);
} catch (error: any) {
  if (error.message.includes('Token inválido') || error.message.includes('expirado')) {
    // Mostrar mensaje y opción para solicitar nuevo token
    setError('El enlace de recuperación ha expirado. Por favor, solicita un nuevo enlace.');
    setShowRequestNewLink(true);
  }
}
```

#### Error: Contraseña Muy Corta

```typescript
if (newPassword.length < 6) {
  setError('La contraseña debe tener al menos 6 caracteres');
  return;
}
```

#### Error: Token No Encontrado en URL

```typescript
useEffect(() => {
  const token = searchParams.get('token');
  if (!token) {
    setError('Token no encontrado. Por favor, verifica el enlace del email.');
    setShowRequestNewLink(true);
  }
}, []);
```

---

## 🔄 Flujo de Navegación Recomendado

```
1. Usuario en Login
   ↓ (click en "Olvidé mi contraseña")
2. Página Forgot Password
   ↓ (envía email)
3. Muestra mensaje de éxito
   ↓ (en producción, usuario recibe email)
4. Usuario hace clic en enlace del email
   ↓ (redirige a /reset-password?token=...)
5. Página Reset Password
   ↓ (envía nueva contraseña)
6. Muestra mensaje de éxito
   ↓ (redirige después de 2 segundos)
7. Página Login
```

---

## 📱 Ejemplo con React Router

```typescript
// App.tsx o router configuration
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

```typescript
// pages/ResetPasswordPage.tsx
import { useSearchParams, useNavigate } from 'react-router-dom';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // ... resto del código
};
```

---

## 🧪 Testing en Desarrollo

### Desarrollo

1. **Hacer request de forgot-password:**
   - El token viene en la respuesta JSON
   - También se guarda en `reset-token.txt` en el servidor
   - Se muestra en la consola del servidor

2. **Usar el token para reset:**
   - Copiar el token de la respuesta
   - Enviarlo en el request de reset-password

### Producción

1. **Usuario solicita reset:**
   - Recibe email con enlace
   - No ve el token directamente

2. **Usuario hace clic en enlace:**
   - Se redirige a `/reset-password?token=...`
   - El frontend extrae el token de la URL
   - Envía el token al backend

---

## ✅ Checklist de Implementación

- [ ] Crear servicio `auth.service.ts` con funciones `forgotPassword` y `resetPassword`
- [ ] Crear página/componente de Forgot Password
- [ ] Crear página/componente de Reset Password
- [ ] Manejar extracción de token de URL
- [ ] Validar contraseñas (longitud mínima, coincidencia)
- [ ] Manejar errores (token inválido, expirado, etc.)
- [ ] Mostrar mensajes de éxito/error al usuario
- [ ] Redirigir a login después de reset exitoso
- [ ] Agregar enlace "Olvidé mi contraseña" en página de login
- [ ] Probar flujo completo en desarrollo
- [ ] Configurar variables de entorno (API_URL)

---

## 🔧 Variables de Entorno

```env
# .env.local o .env
NEXT_PUBLIC_API_URL=http://localhost:4444
```

O en Vite:

```env
# .env
VITE_API_URL=http://localhost:4444
```

---

## 📝 Notas Importantes

1. **Token en Desarrollo:**
   - El token se devuelve en la respuesta JSON
   - Úsalo solo para testing
   - En producción, el token NO se devuelve

2. **Token en URL:**
   - Siempre decodifica el token: `decodeURIComponent(token)`
   - El token puede tener caracteres especiales codificados

3. **Seguridad:**
   - No almacenes tokens en localStorage en producción
   - Los tokens expiran en 1 hora
   - Cada token solo se puede usar una vez

4. **Validaciones Frontend:**
   - Validar email antes de enviar
   - Validar contraseña (mínimo 6 caracteres)
   - Validar que las contraseñas coincidan
   - Mostrar mensajes claros al usuario

5. **Experiencia de Usuario:**
   - Mostrar loading states
   - Mostrar mensajes de éxito/error claros
   - Redirigir automáticamente después de éxito
   - Ofrecer opción de solicitar nuevo enlace si el token expiró

---

## 🚀 Ejemplo de Integración Completa

```typescript
// hooks/useResetPassword.ts
import { useState } from 'react';
import { forgotPassword, resetPassword } from '../services/auth.service';

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await forgotPassword(email);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const performReset = async (token: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const cleanToken = decodeURIComponent(token);
      const result = await resetPassword(cleanToken, newPassword);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    requestReset,
    performReset,
    loading,
    error
  };
};
```

```typescript
// Uso del hook
const { requestReset, performReset, loading, error } = useResetPassword();

// En el componente
const handleForgotPassword = async () => {
  await requestReset(email);
};

const handleReset = async () => {
  await performReset(token, newPassword);
};
```

---

**Última actualización:** Guía completa para integración frontend de reset password

