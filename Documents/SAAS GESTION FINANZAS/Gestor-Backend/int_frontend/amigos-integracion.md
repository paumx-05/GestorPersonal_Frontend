# Integración Frontend: Endpoints de Amigos

## Objetivo
Este documento describe cómo integrar los endpoints de amigos del backend con el frontend, incluyendo todos los endpoints, formatos de datos, ejemplos de implementación y funciones helper.

---

## 🏗️ Estructura del Backend (MVC)

### Endpoints Disponibles

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints de Amigos

### 1. Obtener Todos los Amigos

**Endpoint:**
```
GET /api/amigos
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "nombre": "Juan Pérez",
      "email": "juan.perez@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "estado": "activo",
      "fechaAmistad": "2024-11-15T10:00:00.000Z",
      "createdAt": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

**Ejemplo de implementación (TypeScript/JavaScript):**
```typescript
const getAmigos = async (): Promise<Amigo[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4444/api/amigos', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener amigos');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 2. Obtener Amigo por ID

**Endpoint:**
```
GET /api/amigos/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "estado": "activo",
    "fechaAmistad": "2024-11-15T10:00:00.000Z",
    "createdAt": "2024-11-15T10:00:00.000Z"
  }
}
```

**Ejemplo de implementación:**
```typescript
const getAmigoById = async (id: string): Promise<Amigo> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/amigos/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error('Error al obtener amigo');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 3. Buscar Amigos

**Endpoint:**
```
GET /api/amigos/search?q=<query>
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` (string, requerido): Término de búsqueda (nombre o email)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez",
      "email": "juan.perez@example.com",
      "estado": "activo"
    }
  ]
}
```

**Ejemplo de implementación:**
```typescript
const searchAmigos = async (query: string): Promise<Amigo[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/amigos/search?q=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error al buscar amigos');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 4. Obtener Amigos por Estado

**Endpoint:**
```
GET /api/amigos/estado/:estado
```

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `estado` (string, requerido): `'activo' | 'pendiente' | 'bloqueado'`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez",
      "email": "juan.perez@example.com",
      "estado": "activo"
    }
  ]
}
```

**Ejemplo de implementación:**
```typescript
const getAmigosByEstado = async (estado: 'activo' | 'pendiente' | 'bloqueado'): Promise<Amigo[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/amigos/estado/${estado}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener amigos por estado');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 5. Crear Amigo

**Endpoint:**
```
POST /api/amigos
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@example.com",
  "avatar": "https://example.com/avatar.jpg",  // Opcional
  "estado": "activo"  // Opcional, default: "activo"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "estado": "activo",
    "fechaAmistad": "2024-11-15T10:00:00.000Z",
    "createdAt": "2024-11-15T10:00:00.000Z"
  },
  "message": "Amigo creado exitosamente"
}
```

**Errores posibles:**
- `400`: Campos requeridos faltantes o inválidos
- `409`: Ya existe un amigo con ese email

**Ejemplo de implementación:**
```typescript
interface CreateAmigoData {
  nombre: string;
  email: string;
  avatar?: string;
  estado?: 'activo' | 'pendiente' | 'bloqueado';
}

const createAmigo = async (data: CreateAmigoData): Promise<Amigo> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4444/api/amigos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error('Ya existe un amigo con ese email');
    }
    throw new Error(error.error || 'Error al crear amigo');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 6. Actualizar Amigo

**Endpoint:**
```
PUT /api/amigos/:id
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (todos los campos son opcionales):**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "email": "juan.perez.nuevo@example.com",
  "avatar": "https://example.com/nuevo-avatar.jpg",
  "estado": "bloqueado"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Pérez Actualizado",
    "email": "juan.perez.nuevo@example.com",
    "estado": "bloqueado"
  },
  "message": "Amigo actualizado exitosamente"
}
```

**Ejemplo de implementación:**
```typescript
interface UpdateAmigoData {
  nombre?: string;
  email?: string;
  avatar?: string;
  estado?: 'activo' | 'pendiente' | 'bloqueado';
}

const updateAmigo = async (id: string, data: UpdateAmigoData): Promise<Amigo> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/amigos/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    if (response.status === 409) {
      throw new Error('Ya existe un amigo con ese email');
    }
    throw new Error(error.error || 'Error al actualizar amigo');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 7. Actualizar Estado de Amigo

**Endpoint:**
```
PUT /api/amigos/:id/estado
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "estado": "bloqueado"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "estado": "bloqueado"
  },
  "message": "Estado actualizado exitosamente"
}
```

**Ejemplo de implementación:**
```typescript
const updateEstadoAmigo = async (
  id: string, 
  estado: 'activo' | 'pendiente' | 'bloqueado'
): Promise<Amigo> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/amigos/${id}/estado`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ estado })
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error(error.error || 'Error al actualizar estado');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 8. Eliminar Amigo

**Endpoint:**
```
DELETE /api/amigos/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Amigo eliminado exitosamente"
}
```

**Ejemplo de implementación:**
```typescript
const deleteAmigo = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/amigos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error('Error al eliminar amigo');
  }
};
```

---

## 🔧 Funciones Helper Completas

### Archivo: `lib/amigos.ts` (o similar en tu proyecto)

```typescript
// Tipos
export interface Amigo {
  _id: string;
  userId: string;
  nombre: string;
  email: string;
  avatar?: string;
  estado: 'activo' | 'pendiente' | 'bloqueado';
  fechaAmistad: string;
  createdAt: string;
}

export interface CreateAmigoData {
  nombre: string;
  email: string;
  avatar?: string;
  estado?: 'activo' | 'pendiente' | 'bloqueado';
}

export interface UpdateAmigoData {
  nombre?: string;
  email?: string;
  avatar?: string;
  estado?: 'activo' | 'pendiente' | 'bloqueado';
}

// Configuración
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444';

// Helper para obtener token
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper para hacer requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};

// Funciones de API
export const getAmigos = async (): Promise<Amigo[]> => {
  const response = await apiRequest('/api/amigos');
  
  if (!response.ok) {
    throw new Error('Error al obtener amigos');
  }

  const result = await response.json();
  return result.data;
};

export const getAmigoById = async (id: string): Promise<Amigo> => {
  const response = await apiRequest(`/api/amigos/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error('Error al obtener amigo');
  }

  const result = await response.json();
  return result.data;
};

export const searchAmigos = async (query: string): Promise<Amigo[]> => {
  const response = await apiRequest(
    `/api/amigos/search?q=${encodeURIComponent(query)}`
  );
  
  if (!response.ok) {
    throw new Error('Error al buscar amigos');
  }

  const result = await response.json();
  return result.data;
};

export const getAmigosByEstado = async (
  estado: 'activo' | 'pendiente' | 'bloqueado'
): Promise<Amigo[]> => {
  const response = await apiRequest(`/api/amigos/estado/${estado}`);
  
  if (!response.ok) {
    throw new Error('Error al obtener amigos por estado');
  }

  const result = await response.json();
  return result.data;
};

export const createAmigo = async (data: CreateAmigoData): Promise<Amigo> => {
  const response = await apiRequest('/api/amigos', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error('Ya existe un amigo con ese email');
    }
    throw new Error(error.error || 'Error al crear amigo');
  }

  const result = await response.json();
  return result.data;
};

export const updateAmigo = async (
  id: string,
  data: UpdateAmigoData
): Promise<Amigo> => {
  const response = await apiRequest(`/api/amigos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    if (response.status === 409) {
      throw new Error('Ya existe un amigo con ese email');
    }
    throw new Error(error.error || 'Error al actualizar amigo');
  }

  const result = await response.json();
  return result.data;
};

export const updateEstadoAmigo = async (
  id: string,
  estado: 'activo' | 'pendiente' | 'bloqueado'
): Promise<Amigo> => {
  const response = await apiRequest(`/api/amigos/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ estado })
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error(error.error || 'Error al actualizar estado');
  }

  const result = await response.json();
  return result.data;
};

export const deleteAmigo = async (id: string): Promise<void> => {
  const response = await apiRequest(`/api/amigos/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error('Error al eliminar amigo');
  }
};
```

---

## 📱 Ejemplo de Uso en Componente React/Next.js

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getAmigos, createAmigo, deleteAmigo, updateEstadoAmigo } from '@/lib/amigos';
import type { Amigo } from '@/lib/amigos';

export default function AmigosPage() {
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar amigos al montar el componente
  useEffect(() => {
    loadAmigos();
  }, []);

  const loadAmigos = async () => {
    try {
      setLoading(true);
      const data = await getAmigos();
      setAmigos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar amigos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAmigo = async (nombre: string, email: string) => {
    try {
      const nuevoAmigo = await createAmigo({ nombre, email });
      setAmigos([...amigos, nuevoAmigo]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear amigo');
    }
  };

  const handleDeleteAmigo = async (id: string) => {
    try {
      await deleteAmigo(id);
      setAmigos(amigos.filter(a => a._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar amigo');
    }
  };

  const handleUpdateEstado = async (id: string, estado: 'activo' | 'pendiente' | 'bloqueado') => {
    try {
      const amigoActualizado = await updateEstadoAmigo(id, estado);
      setAmigos(amigos.map(a => a._id === id ? amigoActualizado : a));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Mis Amigos</h1>
      {amigos.map(amigo => (
        <div key={amigo._id}>
          <h3>{amigo.nombre}</h3>
          <p>{amigo.email}</p>
          <p>Estado: {amigo.estado}</p>
          <button onClick={() => handleDeleteAmigo(amigo._id)}>
            Eliminar
          </button>
          <button onClick={() => handleUpdateEstado(amigo._id, 'bloqueado')}>
            Bloquear
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔐 Manejo de Errores

### Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos inválidos o faltantes
- **401 Unauthorized**: Token inválido o faltante
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Email duplicado
- **500 Internal Server Error**: Error del servidor

### Manejo de Errores en el Frontend

```typescript
try {
  const amigo = await createAmigo({ nombre: 'Juan', email: 'juan@example.com' });
} catch (error) {
  if (error instanceof Error) {
    // Mostrar mensaje de error al usuario
    console.error(error.message);
    
    // Manejar errores específicos
    if (error.message.includes('Ya existe un amigo')) {
      // Mostrar mensaje específico para duplicados
    } else if (error.message.includes('token')) {
      // Redirigir a login
    }
  }
}
```

---

## ✅ Checklist de Integración

- [ ] Crear archivo `lib/amigos.ts` con todas las funciones helper
- [ ] Definir tipos TypeScript para `Amigo`, `CreateAmigoData`, `UpdateAmigoData`
- [ ] Configurar `API_BASE_URL` en variables de entorno
- [ ] Implementar función `getToken()` para obtener token de localStorage
- [ ] Implementar función `apiRequest()` para requests genéricos
- [ ] Implementar todas las funciones de API (getAmigos, createAmigo, etc.)
- [ ] Actualizar componente de amigos para usar las nuevas funciones
- [ ] Reemplazar llamadas a localStorage con llamadas al API
- [ ] Manejar errores apropiadamente
- [ ] Probar todos los endpoints
- [ ] Verificar que el token se envía correctamente
- [ ] Verificar que los errores se manejan correctamente

---

## 🚀 Migración desde localStorage

Si actualmente usas localStorage para amigos, aquí está cómo migrar:

**Antes (localStorage):**
```typescript
const getAmigos = () => {
  const amigos = localStorage.getItem('amigos');
  return amigos ? JSON.parse(amigos) : [];
};
```

**Después (API):**
```typescript
import { getAmigos } from '@/lib/amigos';

const loadAmigos = async () => {
  const amigos = await getAmigos();
  // Usar amigos del API
};
```

---

## 📝 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren token JWT válido
2. **Validación de Email**: El backend valida que el email sea único por usuario
3. **Estados Válidos**: Solo se aceptan 'activo', 'pendiente', 'bloqueado'
4. **Búsqueda**: La búsqueda es case-insensitive y busca en nombre y email
5. **Errores**: Siempre manejar errores y mostrar mensajes apropiados al usuario
6. **Loading States**: Mostrar estados de carga mientras se hacen las peticiones
7. **Optimistic Updates**: Considerar actualizar la UI antes de recibir respuesta del servidor

---

## 🔗 Referencias

- [Documentación del Backend](../integracion_endpoints/amigos.md)
- [Milestone 3 Frontend](../Frontend/milestone3.md)

