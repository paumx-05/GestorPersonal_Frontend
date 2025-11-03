# 🔧 Solución de Problemas - Actualización de Perfil

## ❌ Error: POST /api/auth/login 401 (Unauthorized)

Si estás viendo este error cuando intentas actualizar el perfil, aquí están las soluciones:

### ✅ Solución 1: Verificar que el token se está enviando

**Problema:** El token JWT no se está incluyendo en el header `Authorization`.

**Solución:**
```javascript
// Verificar que el token existe antes de hacer la petición
const token = localStorage.getItem('authToken'); // o sessionStorage

if (!token) {
  console.error('No hay token de autenticación');
  // Redirigir a login
  window.location.href = '/login';
  return;
}

// Incluir el token en el header
const response = await fetch('http://localhost:5000/api/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`, // ⚠️ IMPORTANTE: Incluir "Bearer "
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Nuevo nombre' })
});
```

### ✅ Solución 2: Verificar formato del header Authorization

**Problema:** El header Authorization no tiene el formato correcto.

**Formato incorrecto:**
```javascript
headers: {
  'Authorization': token  // ❌ FALTA "Bearer "
}
```

**Formato correcto:**
```javascript
headers: {
  'Authorization': `Bearer ${token}`  // ✅ CORRECTO
}
```

### ✅ Solución 3: Token expirado

**Problema:** El token JWT ha expirado.

**Solución:**
```javascript
async function updateProfile(data) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    // Si el token expiró, intentar refrescar
    if (response.status === 401 || response.status === 403) {
      // Intentar hacer login nuevamente o refrescar token
      const refreshResponse = await refreshAuthToken();
      if (refreshResponse) {
        // Reintentar la petición con el nuevo token
        return updateProfile(data);
      } else {
        // Redirigir a login
        window.location.href = '/login';
        return;
      }
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### ✅ Solución 4: Content-Type con FormData

**Problema:** Cuando usas FormData, no debes incluir el header `Content-Type` manualmente.

**Código incorrecto:**
```javascript
const formData = new FormData();
formData.append('avatar', file);

fetch('/api/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'  // ❌ NO incluir esto
  },
  body: formData
});
```

**Código correcto:**
```javascript
const formData = new FormData();
formData.append('avatar', file);

fetch('/api/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`
    // ✅ El navegador agregará automáticamente Content-Type con el boundary correcto
  },
  body: formData
});
```

### ✅ Solución 5: Verificar que el usuario está autenticado

**Código para verificar autenticación:**
```javascript
function isAuthenticated() {
  const token = localStorage.getItem('authToken');
  if (!token) return false;

  // Verificar si el token está expirado (decodificación básica)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (e) {
    return false;
  }
}

// Antes de hacer petición
if (!isAuthenticated()) {
  console.log('Usuario no autenticado, redirigiendo a login...');
  window.location.href = '/login';
  return;
}
```

---

## 🧪 Código de Prueba Completo

```javascript
// Función helper para hacer peticiones autenticadas
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  // Si hay FormData, NO incluir Content-Type
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  } else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Manejar token expirado
  if (response.status === 401 || response.status === 403) {
    const errorData = await response.json();
    console.error('Error de autenticación:', errorData);
    
    // Limpiar token expirado
    localStorage.removeItem('authToken');
    
    // Redirigir a login
    window.location.href = '/login';
    throw new Error('Token expirado o inválido');
  }

  return response;
}

// Ejemplo de uso
async function updateProfile(name, description) {
  try {
    const response = await authenticatedFetch('http://localhost:5000/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name, description })
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (result.errors) {
        result.errors.forEach(err => {
          console.error(`${err.field}: ${err.message}`);
        });
      }
      throw new Error(result.message || 'Error al actualizar perfil');
    }

    return result.data;
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    throw error;
  }
}
```

---

## 📋 Checklist de Depuración

- [ ] Verificar que el token existe en `localStorage` o `sessionStorage`
- [ ] Verificar que el token no está expirado
- [ ] Verificar que el header `Authorization` tiene el formato `Bearer <token>`
- [ ] Verificar que no estás incluyendo `Content-Type` manualmente cuando usas FormData
- [ ] Verificar que el método HTTP es `PATCH` (no `POST` o `PUT`)
- [ ] Verificar que la URL es correcta: `http://localhost:5000/api/profile`
- [ ] Verificar la consola del navegador para ver errores de CORS
- [ ] Verificar la pestaña Network en DevTools para ver la petición real

---

## 🔍 Cómo Depurar en el Navegador

1. **Abrir DevTools (F12)**
2. **Ir a la pestaña Network**
3. **Filtrar por "profile"**
4. **Hacer clic en la petición PATCH /api/profile**
5. **Revisar:**
   - **Headers → Request Headers:**
     - `Authorization: Bearer <token>` ✅
     - `Content-Type: application/json` (para JSON) o `multipart/form-data` (para FormData) ✅
   - **Payload:** Verificar que los datos se están enviando correctamente
   - **Response:** Ver el error del servidor

---

## 🐛 Errores Comunes y Soluciones

### Error: "Token de acceso requerido"
**Causa:** El header Authorization no se está enviando.
**Solución:** Verificar que incluyes `Authorization: Bearer ${token}` en los headers.

### Error: "Token inválido o expirado"
**Causa:** El token expiró o es inválido.
**Solución:** Hacer login nuevamente para obtener un nuevo token.

### Error: "Usuario no encontrado"
**Causa:** El userId del token no existe en la base de datos.
**Solución:** Verificar que el usuario existe o hacer login nuevamente.

### Error: CORS
**Causa:** El frontend y backend están en diferentes puertos.
**Solución:** Verificar que el backend tiene CORS configurado correctamente (debería estar configurado en `src/app.ts`).

---

## ✅ Código Final Recomendado (React/TypeScript)

```typescript
// hooks/useProfileUpdate.ts
import { useState } from 'react';

interface ProfileUpdateData {
  name?: string;
  description?: string;
  avatar?: File;
}

export function useProfileUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: ProfileUpdateData) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }

      let body: FormData | string;
      let headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      };

      // Si hay archivo, usar FormData
      if (data.avatar) {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description !== undefined) {
          formData.append('description', data.description || '');
        }
        formData.append('avatar', data.avatar);
        body = formData;
        // NO incluir Content-Type, el navegador lo hace
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description })
        });
      }

      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PATCH',
        headers,
        body
      });

      const result = await response.json();

      if (!response.ok) {
        // Si es error de autenticación, limpiar token
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
          // Opcional: redirigir a login
          // window.location.href = '/login';
        } else if (result.errors) {
          const errorMessages = result.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
          setError(errorMessages);
        } else {
          setError(result.message || 'Error al actualizar perfil');
        }
        return null;
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
}
```

---

**Última actualización:** 2024-01-15

