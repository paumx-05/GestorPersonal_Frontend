# 📘 Guía de Integración: Actualización de Perfil de Usuario

## 📋 Tabla de Contenidos
- [Resumen](#resumen)
- [Endpoint](#endpoint)
- [Autenticación](#autenticación)
- [Formatos de Request](#formatos-de-request)
- [Validaciones](#validaciones)
- [Ejemplos de Código](#ejemplos-de-código)
- [Manejo de Respuestas](#manejo-de-respuestas)
- [Manejo de Errores](#manejo-de-errores)
- [Casos de Uso Completos](#casos-de-uso-completos)
- [Testing](#testing)

---

## 🎯 Resumen

El endpoint `PATCH /api/profile` permite actualizar el perfil del usuario autenticado. Soporta actualización de:
- **Nombre** (`name`)
- **Descripción/Bio** (`description`)
- **Avatar/Foto de perfil** (`avatar`)

**Características principales:**
- ✅ Soporta actualización parcial (solo envía los campos que deseas actualizar)
- ✅ Acepta JSON y FormData (multipart/form-data)
- ✅ Validaciones completas según especificaciones
- ✅ Subida de imágenes con validación automática
- ✅ Eliminación automática del avatar anterior

---

## 🔗 Endpoint

```
PATCH /api/profile
```

**Base URL:** `http://localhost:5000` (o tu URL de producción)

**URL completa:** `http://localhost:5000/api/profile`

---

## 🔐 Autenticación

**Requerida:** Sí (JWT Bearer Token)

**Header requerido:**
```http
Authorization: Bearer <tu-jwt-token>
```

El token se obtiene al hacer login o registro.

---

## 📤 Formatos de Request

### Opción 1: JSON (para name y description)

**Content-Type:** `application/json`

**Ejemplo:**
```json
{
  "name": "Juan Pérez",
  "description": "Amante de los viajes y la aventura. Me encanta conocer nuevos lugares."
}
```

### Opción 2: FormData (para avatar o todos los campos)

**Content-Type:** `multipart/form-data`

**Campos disponibles:**
- `name` (string, opcional)
- `description` (string, opcional)
- `avatar` (File, opcional)

---

## ✅ Validaciones

### Campo `name`
- **Tipo:** `string`
- **Longitud:** 1-100 caracteres
- **Requerido:** No (solo si se envía, debe ser válido)
- **Trim:** Se eliminan espacios al inicio y final

### Campo `description`
- **Tipo:** `string`
- **Longitud:** 0-500 caracteres (puede estar vacío o ser `null`)
- **Requerido:** No
- **Trim:** Se eliminan espacios al inicio y final
- **Permite:** `null`, cadena vacía `""`, o contenido (máximo 500 caracteres)

### Campo `avatar`
- **Tipo:** `File` (multipart/form-data)
- **Formatos permitidos:** `image/jpeg`, `image/png`, `image/webp`
- **Tamaño máximo:** **5MB** (5,242,880 bytes)
- **Dimensiones:** Recomendado máximo 2000x2000px
- **Nota:** Si envías base64, debe comenzar con `data:image/...`

---

## 💻 Ejemplos de Código

### JavaScript/Fetch API

#### Ejemplo 1: Actualizar solo nombre y descripción (JSON)

```javascript
async function updateProfile(name, description) {
  try {
    const token = localStorage.getItem('authToken'); // O tu método de obtener token
    
    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        description: description
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Manejar errores
      if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach(error => {
          console.error(`${error.field}: ${error.message}`);
        });
      }
      throw new Error(data.message || 'Error al actualizar perfil');
    }

    console.log('Perfil actualizado:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
updateProfile('Juan Pérez', 'Amante de los viajes...')
  .then(user => {
    console.log('Usuario actualizado:', user);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

#### Ejemplo 2: Actualizar avatar (FormData)

```javascript
async function updateAvatar(file) {
  try {
    const token = localStorage.getItem('authToken');
    
    // Validar archivo antes de enviar
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('El archivo excede el tamaño máximo de 5MB');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato de imagen no válido. Use JPG, PNG o WebP');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
        // NO incluir 'Content-Type' - el navegador lo hace automáticamente con FormData
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach(error => {
          console.error(`${error.field}: ${error.message}`);
        });
      }
      throw new Error(data.message || 'Error al actualizar avatar');
    }

    console.log('Avatar actualizado:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso con input file
const fileInput = document.querySelector('#avatar-input');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const result = await updateAvatar(file);
      console.log('Avatar URL:', result.avatar);
      // Actualizar imagen en la UI
      document.querySelector('#user-avatar').src = result.avatar;
    } catch (error) {
      alert(error.message);
    }
  }
});
```

#### Ejemplo 3: Actualizar todos los campos (FormData)

```javascript
async function updateFullProfile(name, description, avatarFile) {
  try {
    const token = localStorage.getItem('authToken');
    
    const formData = new FormData();
    
    if (name) formData.append('name', name);
    if (description !== undefined) formData.append('description', description || '');
    if (avatarFile) formData.append('avatar', avatarFile);

    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(e => `${e.field}: ${e.message}`).join('\n');
        alert(errorMessages);
      }
      throw new Error(data.message || 'Error al actualizar perfil');
    }

    return data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### React/TypeScript

#### Hook personalizado para actualizar perfil

```typescript
// hooks/useProfileUpdate.ts
import { useState } from 'react';

interface ProfileUpdateData {
  name?: string;
  description?: string;
  avatar?: File;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  description: string | null;
  avatar: string | null;
  updatedAt: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: ProfileData;
  errors?: ValidationError[];
}

export function useProfileUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const updateProfile = async (data: ProfileUpdateData): Promise<ProfileData | null> => {
    setLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      let body: FormData | string;
      let headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      };

      // Determinar si hay archivo para usar FormData
      if (data.avatar) {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description !== undefined) {
          formData.append('description', data.description || '');
        }
        formData.append('avatar', data.avatar);
        body = formData;
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

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          setValidationErrors(result.errors);
          const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join(', ');
          setError(errorMessages);
        } else {
          setError(result.message || 'Error al actualizar perfil');
        }
        return null;
      }

      return result.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    loading,
    error,
    validationErrors
  };
}
```

#### Componente React de ejemplo

```tsx
// components/ProfileUpdateForm.tsx
import React, { useState } from 'react';
import { useProfileUpdate } from '../hooks/useProfileUpdate';

export const ProfileUpdateForm: React.FC = () => {
  const { updateProfile, loading, error, validationErrors } = useProfileUpdate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validación del lado del cliente
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo excede el tamaño máximo de 5MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Formato de imagen no válido. Use JPG, PNG o WebP');
        return;
      }

      setAvatarFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await updateProfile({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(avatarFile && { avatar: avatarFile })
    });

    if (result) {
      alert('Perfil actualizado exitosamente!');
      // Resetear formulario o actualizar estado global
      setName('');
      setDescription('');
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-update-form">
      <h2>Actualizar Perfil</h2>

      {/* Nombre */}
      <div className="form-group">
        <label htmlFor="name">Nombre</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre completo"
          maxLength={100}
          disabled={loading}
        />
        {validationErrors.find(e => e.field === 'name') && (
          <span className="error">
            {validationErrors.find(e => e.field === 'name')?.message}
          </span>
        )}
      </div>

      {/* Descripción */}
      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Cuéntanos sobre ti..."
          maxLength={500}
          rows={4}
          disabled={loading}
        />
        <small>{description.length}/500 caracteres</small>
        {validationErrors.find(e => e.field === 'description') && (
          <span className="error">
            {validationErrors.find(e => e.field === 'description')?.message}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="form-group">
        <label htmlFor="avatar">Avatar</label>
        <input
          type="file"
          id="avatar"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={loading}
        />
        {avatarPreview && (
          <div className="avatar-preview">
            <img src={avatarPreview} alt="Preview" width="150" />
          </div>
        )}
        <small>Formato: JPG, PNG o WebP. Máximo 5MB</small>
        {validationErrors.find(e => e.field === 'avatar') && (
          <span className="error">
            {validationErrors.find(e => e.field === 'avatar')?.message}
          </span>
        )}
      </div>

      {/* Error general */}
      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Botón submit */}
      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  );
};
```

### Axios (Alternativa)

```javascript
import axios from 'axios';

// Configurar axios con token por defecto
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Actualizar perfil con JSON
export async function updateProfileJSON(name, description) {
  try {
    const response = await api.patch('/profile', {
      name,
      description
    });
    return response.data.data;
  } catch (error) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      errors.forEach(err => {
        console.error(`${err.field}: ${err.message}`);
      });
    }
    throw error;
  }
}

// Actualizar avatar con FormData
export async function updateAvatar(file) {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.patch('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data;
  } catch (error) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      errors.forEach(err => {
        console.error(`${err.field}: ${err.message}`);
      });
    }
    throw error;
  }
}
```

---

## 📥 Manejo de Respuestas

### Respuesta exitosa (200 OK)

```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "description": "Amante de los viajes y la aventura...",
    "avatar": "http://localhost:5000/uploads/avatars/avatar-123-1705315800000.jpg",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Uso en el código:**
```javascript
const response = await updateProfile(...);
if (response) {
  console.log('ID:', response.id);
  console.log('Nombre:', response.name);
  console.log('Email:', response.email);
  console.log('Descripción:', response.description);
  console.log('Avatar URL:', response.avatar);
  console.log('Actualizado:', response.updatedAt);
  
  // Actualizar UI
  setUserName(response.name);
  setUserDescription(response.description);
  setUserAvatar(response.avatar);
}
```

---

## ❌ Manejo de Errores

### Error de validación (400 Bad Request)

```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "name",
      "message": "El nombre debe tener entre 1 y 100 caracteres"
    },
    {
      "field": "description",
      "message": "La descripción no puede exceder 500 caracteres"
    },
    {
      "field": "avatar",
      "message": "El archivo excede el tamaño máximo de 5MB"
    }
  ]
}
```

**Manejo en código:**
```javascript
try {
  const result = await updateProfile(...);
} catch (error) {
  if (error.response?.status === 400 && error.response?.data?.errors) {
    const errors = error.response.data.errors;
    
    // Mostrar errores por campo
    errors.forEach(err => {
      const fieldElement = document.querySelector(`#${err.field}`);
      if (fieldElement) {
        fieldElement.classList.add('error');
        // Mostrar mensaje de error
      }
      console.error(`${err.field}: ${err.message}`);
    });
  }
}
```

### Error de autenticación (401 Unauthorized)

```json
{
  "success": false,
  "message": "Token de autorización requerido"
}
```

**Manejo:**
```javascript
if (response.status === 401) {
  // Redirigir a login o refrescar token
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}
```

### Error - Usuario no encontrado (404 Not Found)

```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

### Error del servidor (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

**Manejo completo de errores:**
```javascript
async function updateProfileWithErrorHandling(data) {
  try {
    const result = await updateProfile(data);
    return { success: true, data: result };
  } catch (error) {
    if (error.response) {
      // Error de respuesta del servidor
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 400:
          return {
            success: false,
            type: 'validation',
            errors: errorData.errors || [],
            message: errorData.message
          };
        case 401:
          return {
            success: false,
            type: 'authentication',
            message: 'Sesión expirada. Por favor, inicia sesión nuevamente.'
          };
        case 404:
          return {
            success: false,
            type: 'not_found',
            message: 'Usuario no encontrado'
          };
        case 500:
          return {
            success: false,
            type: 'server',
            message: 'Error del servidor. Por favor, intenta más tarde.'
          };
        default:
          return {
            success: false,
            type: 'unknown',
            message: errorData.message || 'Error desconocido'
          };
      }
    } else {
      // Error de red u otro
      return {
        success: false,
        type: 'network',
        message: 'Error de conexión. Verifica tu internet.'
      };
    }
  }
}
```

---

## 🎯 Casos de Uso Completos

### Caso 1: Actualizar solo el nombre

```javascript
// Usuario cambia su nombre
const result = await updateProfile({
  name: 'Nuevo Nombre'
});
```

### Caso 2: Actualizar solo la descripción

```javascript
// Usuario actualiza su bio
const result = await updateProfile({
  description: 'Nueva descripción sobre mí...'
});
```

### Caso 3: Eliminar descripción (ponerla vacía)

```javascript
// Usuario quiere eliminar su descripción
const result = await updateProfile({
  description: '' // o null
});
```

### Caso 4: Actualizar solo el avatar

```javascript
// Usuario sube nueva foto de perfil
const fileInput = document.querySelector('#avatar-input');
const file = fileInput.files[0];

const result = await updateProfile({
  avatar: file
});

// Actualizar imagen en UI
document.querySelector('#user-avatar').src = result.avatar;
```

### Caso 5: Actualizar todo a la vez

```javascript
// Usuario actualiza nombre, descripción y avatar
const fileInput = document.querySelector('#avatar-input');
const file = fileInput.files[0];

const result = await updateProfile({
  name: 'Nuevo Nombre',
  description: 'Nueva descripción',
  avatar: file
});
```

---

## 🧪 Testing

### Ejemplo con Postman

1. **Configurar autenticación:**
   - Headers → Authorization → Bearer Token
   - Pegar tu JWT token

2. **Actualizar nombre (JSON):**
   - Method: `PATCH`
   - URL: `http://localhost:5000/api/profile`
   - Headers:
     - `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "name": "Juan Pérez"
     }
     ```

3. **Actualizar avatar (FormData):**
   - Method: `PATCH`
   - URL: `http://localhost:5000/api/profile`
   - Body → form-data:
     - Key: `avatar`, Type: `File`, Value: [seleccionar archivo]

### Ejemplo con cURL

```bash
# Actualizar nombre y descripción
curl -X PATCH http://localhost:5000/api/profile \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "description": "Amante de los viajes..."
  }'

# Actualizar avatar
curl -X PATCH http://localhost:5000/api/profile \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -F "avatar=@/ruta/a/imagen.jpg"
```

---

## 📝 Notas Importantes

1. **Token JWT:** Siempre incluye el token en el header `Authorization`. Sin él, recibirás un 401.

2. **Content-Type con FormData:** Cuando uses FormData, NO incluyas el header `Content-Type` manualmente. El navegador lo hará automáticamente con el boundary correcto.

3. **Actualización parcial:** Solo envía los campos que deseas actualizar. No es necesario enviar todos los campos.

4. **Descripción vacía:** Para eliminar la descripción, envía `""` (cadena vacía) o `null`.

5. **URLs de avatar:** Las URLs de avatar devueltas son absolutas y apuntan al servidor. Úsalas directamente en `<img src="...">`.

6. **Tamaño de archivo:** Valida el tamaño del archivo en el frontend antes de enviarlo para mejor UX, aunque el backend también lo validará.

7. **Preview de imagen:** Crea un preview local de la imagen antes de subirla usando `FileReader` para mejor experiencia de usuario.

---

## 🔗 Endpoints Relacionados

- `GET /api/profile` - Obtener perfil actual
- `POST /api/profile/change-password` - Cambiar contraseña
- `GET /api/auth/me` - Información del usuario autenticado

---

## ✅ Checklist de Integración

- [ ] Configurar URL base del API
- [ ] Implementar almacenamiento de JWT token
- [ ] Crear función helper para hacer requests autenticados
- [ ] Implementar formulario de actualización de perfil
- [ ] Agregar validaciones del lado del cliente
- [ ] Manejar errores de validación y mostrarlos en UI
- [ ] Implementar preview de imagen antes de subir
- [ ] Mostrar estados de carga (loading)
- [ ] Actualizar UI después de actualización exitosa
- [ ] Probar todos los casos de uso
- [ ] Manejar expiración de token (401)

---

**Última actualización:** 2024-01-15  
**Versión del API:** 1.0.0

