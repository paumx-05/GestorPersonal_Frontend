# Integración Frontend: Endpoints de Categorías

## Objetivo
Este documento describe cómo integrar los endpoints de categorías del backend con el frontend, incluyendo el sistema completo de gestión de categorías personalizadas, formatos de datos, ejemplos de implementación y funciones helper.

---

## 🎯 Flujo del Sistema de Categorías

El sistema de categorías funciona de la siguiente manera:

1. **Obtener todas las categorías** → Ver todas las categorías del usuario
2. **Obtener categorías por tipo** → Filtrar categorías por tipo (gastos, ingresos, ambos)
3. **Crear categoría** → Registrar una nueva categoría personalizada
4. **Actualizar categoría** → Modificar una categoría existente
5. **Eliminar categoría** → Eliminar una categoría específica

**Importante:** Los usuarios solo pueden acceder a sus propias categorías. Todas las operaciones están protegidas por autenticación.

---

## 🏗️ Estructura del Backend (MVC)

### Endpoints Disponibles

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints de Categorías

### 1. Obtener Todas las Categorías

**Endpoint:**
```
GET /api/categorias
```

**Descripción:** Obtiene todas las categorías del usuario autenticado, ordenadas alfabéticamente por nombre.

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
      "nombre": "Alimentación",
      "tipo": "gastos",
      "createdAt": "2024-11-01T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439012",
      "nombre": "Salario",
      "tipo": "ingresos",
      "createdAt": "2024-11-01T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439012",
      "nombre": "Transferencias",
      "tipo": "ambos",
      "createdAt": "2024-11-01T10:00:00.000Z"
    }
  ]
}
```

**Campos de respuesta:**
- `_id`: ID único de la categoría
- `userId`: ID del usuario propietario
- `nombre`: Nombre de la categoría
- `tipo`: Tipo de categoría (`'gastos'`, `'ingresos'`, `'ambos'`)
- `createdAt`: Fecha de creación en formato ISO

**Errores posibles:**
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface Categoria {
  _id: string;
  userId: string;
  nombre: string;
  tipo: 'gastos' | 'ingresos' | 'ambos';
  createdAt: string;
}

const getCategorias = async (): Promise<Categoria[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/categorias',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener categorías');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 2. Obtener Categorías por Tipo

**Endpoint:**
```
GET /api/categorias/tipo/:tipo
```

**Descripción:** Obtiene todas las categorías del usuario autenticado filtradas por tipo específico (gastos, ingresos o ambos).

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `tipo` (string, requerido): Tipo de categoría (`'gastos'`, `'ingresos'`, `'ambos'`)

**Ejemplos de uso:**
```
GET /api/categorias/tipo/gastos
GET /api/categorias/tipo/ingresos
GET /api/categorias/tipo/ambos
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "nombre": "Alimentación",
      "tipo": "gastos",
      "createdAt": "2024-11-01T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439012",
      "nombre": "Transporte",
      "tipo": "gastos",
      "createdAt": "2024-11-02T10:00:00.000Z"
    }
  ]
}
```

**Errores posibles:**
- `400`: Tipo inválido (debe ser: gastos, ingresos o ambos)
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
type TipoCategoria = 'gastos' | 'ingresos' | 'ambos';

const getCategoriasByTipo = async (tipo: TipoCategoria): Promise<Categoria[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/categorias/tipo/${tipo}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Tipo de categoría inválido');
    }
    throw new Error(error.error || 'Error al obtener categorías');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 3. Crear Categoría

**Endpoint:**
```
POST /api/categorias
```

**Descripción:** Crea una nueva categoría personalizada para el usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "Entretenimiento",
  "tipo": "gastos"
}
```

**Campos requeridos:**
- `nombre` (string): Nombre de la categoría (debe ser único por usuario)
- `tipo` (string): Tipo de categoría (`'gastos'`, `'ingresos'`, `'ambos'`)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "userId": "507f1f77bcf86cd799439012",
    "nombre": "Entretenimiento",
    "tipo": "gastos",
    "createdAt": "2024-11-01T10:00:00.000Z"
  },
  "message": "Categoría creada exitosamente"
}
```

**Errores posibles:**
- `400`: Nombre requerido, tipo inválido
- `401`: Usuario no autenticado
- `409`: Ya existe una categoría con ese nombre (conflicto)
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface CreateCategoriaRequest {
  nombre: string;
  tipo: TipoCategoria;
}

const createCategoria = async (data: CreateCategoriaRequest): Promise<Categoria> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/categorias',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Datos inválidos');
    }
    if (response.status === 409) {
      throw new Error(error.error || 'Ya existe una categoría con ese nombre');
    }
    throw new Error(error.error || 'Error al crear categoría');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 4. Actualizar Categoría Existente

**Endpoint:**
```
PUT /api/categorias/:id
```

**Descripción:** Actualiza una categoría existente del usuario autenticado. Solo se actualizan los campos proporcionados.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, requerido): ID de la categoría a actualizar

**Request Body (todos los campos son opcionales):**
```json
{
  "nombre": "Entretenimiento Actualizado",
  "tipo": "ambos"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Categoría actualizada exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "userId": "507f1f77bcf86cd799439012",
    "nombre": "Entretenimiento Actualizado",
    "tipo": "ambos",
    "createdAt": "2024-11-01T10:00:00.000Z"
  }
}
```

**Errores posibles:**
- `400`: ID inválido, nombre vacío, tipo inválido
- `401`: Usuario no autenticado
- `404`: Categoría no encontrada o no pertenece al usuario
- `409`: Ya existe una categoría con ese nombre (conflicto)
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface UpdateCategoriaRequest {
  nombre?: string;
  tipo?: TipoCategoria;
}

const updateCategoria = async (
  id: string,
  data: UpdateCategoriaRequest
): Promise<Categoria> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/categorias/${id}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Datos inválidos');
    }
    if (response.status === 404) {
      throw new Error('Categoría no encontrada');
    }
    if (response.status === 409) {
      throw new Error(error.error || 'Ya existe una categoría con ese nombre');
    }
    throw new Error(error.error || 'Error al actualizar categoría');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 5. Eliminar Categoría

**Endpoint:**
```
DELETE /api/categorias/:id
```

**Descripción:** Elimina una categoría específica del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, requerido): ID de la categoría a eliminar

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Categoría eliminada exitosamente"
}
```

**Errores posibles:**
- `400`: ID inválido
- `401`: Usuario no autenticado
- `404`: Categoría no encontrada o no pertenece al usuario
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
const deleteCategoria = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/categorias/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('ID de categoría inválido');
    }
    if (response.status === 404) {
      throw new Error('Categoría no encontrada');
    }
    throw new Error('Error al eliminar categoría');
  }
};
```

---

## 🔧 Servicio Completo de Categorías

Aquí tienes un servicio completo con todas las funciones helper:

```typescript
// services/categorias.service.ts

const API_BASE_URL = 'http://localhost:4444';

export type TipoCategoria = 'gastos' | 'ingresos' | 'ambos';

export interface Categoria {
  _id: string;
  userId: string;
  nombre: string;
  tipo: TipoCategoria;
  createdAt: string;
}

export interface CreateCategoriaRequest {
  nombre: string;
  tipo: TipoCategoria;
}

export interface UpdateCategoriaRequest {
  nombre?: string;
  tipo?: TipoCategoria;
}

// Obtener token de autenticación
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Manejar errores de respuesta
const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }
  return response.json();
};

// Obtener todas las categorías
export const getCategorias = async (): Promise<Categoria[]> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/categorias`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await handleResponse(response);
  return result.data;
};

// Obtener categorías por tipo
export const getCategoriasByTipo = async (tipo: TipoCategoria): Promise<Categoria[]> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/categorias/tipo/${tipo}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await handleResponse(response);
  return result.data;
};

// Crear categoría
export const createCategoria = async (data: CreateCategoriaRequest): Promise<Categoria> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/categorias`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await handleResponse(response);
  return result.data;
};

// Actualizar categoría
export const updateCategoria = async (
  id: string,
  data: UpdateCategoriaRequest
): Promise<Categoria> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/categorias/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await handleResponse(response);
  return result.data;
};

// Eliminar categoría
export const deleteCategoria = async (id: string): Promise<void> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/categorias/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  await handleResponse(response);
};
```

---

## 🎨 Ejemplo de Componente React Completo

```typescript
// CategoriasList.tsx

import React, { useState, useEffect } from 'react';
import {
  getCategorias,
  getCategoriasByTipo,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  Categoria,
  TipoCategoria
} from './services/categorias.service';

const CategoriasList: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState<TipoCategoria | 'todos'>('todos');
  const [showForm, setShowForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'gastos' as TipoCategoria
  });

  useEffect(() => {
    cargarCategorias();
  }, [tipoFiltro]);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      let data: Categoria[];
      
      if (tipoFiltro === 'todos') {
        data = await getCategorias();
      } else {
        data = await getCategoriasByTipo(tipoFiltro);
      }
      
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createCategoria(formData);
      setFormData({ nombre: '', tipo: 'gastos' });
      setShowForm(false);
      cargarCategorias();
    } catch (error) {
      console.error('Error al crear categoría:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleUpdate = async () => {
    if (!editingCategoria) return;
    
    try {
      await updateCategoria(editingCategoria._id, formData);
      setFormData({ nombre: '', tipo: 'gastos' });
      setEditingCategoria(null);
      cargarCategorias();
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) {
      return;
    }
    
    try {
      await deleteCategoria(id);
      cargarCategorias();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      tipo: categoria.tipo
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ nombre: '', tipo: 'gastos' });
    setEditingCategoria(null);
    setShowForm(false);
  };

  if (loading) {
    return <div>Cargando categorías...</div>;
  }

  return (
    <div className="categorias-container">
      <div className="header">
        <h1>Mis Categorías</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nueva Categoría'}
        </button>
      </div>

      <div className="filtros">
        <select 
          value={tipoFiltro} 
          onChange={(e) => setTipoFiltro(e.target.value as TipoCategoria | 'todos')}
        >
          <option value="todos">Todas las categorías</option>
          <option value="gastos">Gastos</option>
          <option value="ingresos">Ingresos</option>
          <option value="ambos">Ambos</option>
        </select>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Alimentación"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Tipo:</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoCategoria })}
            >
              <option value="gastos">Gastos</option>
              <option value="ingresos">Ingresos</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button onClick={editingCategoria ? handleUpdate : handleCreate}>
              {editingCategoria ? 'Actualizar' : 'Crear'}
            </button>
            <button onClick={handleCancel}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="categorias-list">
        {categorias.length === 0 ? (
          <p>No hay categorías {tipoFiltro !== 'todos' ? `de tipo "${tipoFiltro}"` : ''}</p>
        ) : (
          categorias.map((categoria) => (
            <div key={categoria._id} className="categoria-item">
              <div className="categoria-header">
                <h3>{categoria.nombre}</h3>
                <span className={`badge badge-${categoria.tipo}`}>
                  {categoria.tipo}
                </span>
              </div>
              <p className="categoria-date">
                Creada: {new Date(categoria.createdAt).toLocaleDateString()}
              </p>
              <div className="categoria-actions">
                <button onClick={() => handleEdit(categoria)}>
                  Editar
                </button>
                <button onClick={() => handleDelete(categoria._id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoriasList;
```

---

## 📝 Tipos de Categoría

El sistema acepta los siguientes tipos de categoría:

1. **`gastos`**: Categoría solo para gastos
2. **`ingresos`**: Categoría solo para ingresos
3. **`ambos`**: Categoría que se puede usar tanto para gastos como para ingresos

**Nota:** El backend valida automáticamente que el tipo sea uno de estos valores válidos.

---

## ✅ Checklist de Integración

- [ ] Instalar dependencias necesarias (si usas fetch, axios, etc.)
- [ ] Configurar la URL base del API
- [ ] Implementar el sistema de autenticación (token JWT)
- [ ] Crear el servicio de categorías con todas las funciones
- [ ] Crear componentes de UI para mostrar categorías
- [ ] Implementar filtro por tipo
- [ ] Implementar formulario de creación/edición
- [ ] Manejar estados de carga y errores
- [ ] Validar nombres únicos antes de crear/actualizar
- [ ] Probar todos los endpoints
- [ ] Manejar errores de conflicto (409) cuando hay nombres duplicados

---

## 🔍 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren un token JWT válido en el header `Authorization: Bearer <token>`

2. **Ordenamiento**: Las categorías siempre se devuelven ordenadas alfabéticamente por nombre

3. **Validación de Tipo**: El backend valida que el tipo sea uno de: `'gastos'`, `'ingresos'`, `'ambos'`

4. **Validación de Nombre**: 
   - El nombre es requerido y no puede estar vacío
   - El nombre debe ser único por usuario
   - El backend normaliza automáticamente con trim (elimina espacios al inicio y final)

5. **Seguridad**: Los usuarios solo pueden acceder a sus propias categorías. El backend valida automáticamente la propiedad

6. **Normalización**: El backend normaliza automáticamente:
   - Nombre con trim (elimina espacios al inicio y final)
   - Tipo a minúsculas

7. **Manejo de Errores**: Siempre maneja los errores apropiadamente y muestra mensajes claros al usuario:
   - `400`: Datos inválidos (nombre vacío, tipo inválido)
   - `401`: Usuario no autenticado
   - `404`: Categoría no encontrada
   - `409`: Conflicto - ya existe una categoría con ese nombre
   - `500`: Error del servidor

8. **Actualización Parcial**: Al actualizar una categoría, solo se actualizan los campos proporcionados. Los demás campos se mantienen igual

9. **Índice Único**: El backend tiene un índice único compuesto `{ userId, nombre }` que previene automáticamente duplicados. Si intentas crear una categoría con un nombre que ya existe, recibirás un error 409

10. **Uso en Gastos/Ingresos**: Las categorías se pueden usar al crear gastos o ingresos. Asegúrate de que el tipo de categoría sea compatible:
    - Para crear un gasto, usa categorías de tipo `'gastos'` o `'ambos'`
    - Para crear un ingreso, usa categorías de tipo `'ingresos'` o `'ambos'`

---

## 📚 Recursos Adicionales

- Documentación del backend: `integracion_endpoints/categorias.md`
- Modelo de datos: `src/models/Categoria.model.ts`
- Controlador: `src/controllers/categoria.controller.ts`
- Rutas: `src/routes/categoria.routes.ts`

---

## 🎨 Ejemplo de Selector de Categorías

```typescript
// CategoriaSelector.tsx

import React, { useState, useEffect } from 'react';
import { getCategoriasByTipo, Categoria, TipoCategoria } from './services/categorias.service';

interface CategoriaSelectorProps {
  tipo: TipoCategoria;
  value?: string;
  onChange: (categoriaId: string) => void;
  placeholder?: string;
}

const CategoriaSelector: React.FC<CategoriaSelectorProps> = ({
  tipo,
  value,
  onChange,
  placeholder = 'Selecciona una categoría'
}) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setLoading(true);
        // Obtener categorías del tipo específico y también las de tipo "ambos"
        const [categoriasTipo, categoriasAmbos] = await Promise.all([
          getCategoriasByTipo(tipo),
          getCategoriasByTipo('ambos')
        ]);
        
        // Combinar y eliminar duplicados
        const todas = [...categoriasTipo, ...categoriasAmbos];
        const unicas = todas.filter((cat, index, self) =>
          index === self.findIndex(c => c._id === cat._id)
        );
        
        setCategorias(unicas);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarCategorias();
  }, [tipo]);

  if (loading) {
    return <select disabled><option>Cargando...</option></select>;
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {categorias.map((categoria) => (
        <option key={categoria._id} value={categoria.nombre}>
          {categoria.nombre}
        </option>
      ))}
    </select>
  );
};

export default CategoriaSelector;
```

---

## 🔄 Ejemplo de Hook Personalizado

```typescript
// hooks/useCategorias.ts

import { useState, useEffect } from 'react';
import {
  getCategorias,
  getCategoriasByTipo,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  Categoria,
  TipoCategoria,
  CreateCategoriaRequest
} from '../services/categorias.service';

export const useCategorias = (tipo?: TipoCategoria) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = tipo 
        ? await getCategoriasByTipo(tipo)
        : await getCategorias();
      setCategorias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, [tipo]);

  const crearCategoria = async (data: CreateCategoriaRequest) => {
    try {
      const nueva = await createCategoria(data);
      setCategorias([...categorias, nueva]);
      return nueva;
    } catch (err) {
      throw err;
    }
  };

  const actualizarCategoria = async (id: string, data: Partial<Categoria>) => {
    try {
      const actualizada = await updateCategoria(id, data);
      setCategorias(categorias.map(cat => 
        cat._id === id ? actualizada : cat
      ));
      return actualizada;
    } catch (err) {
      throw err;
    }
  };

  const eliminarCategoria = async (id: string) => {
    try {
      await deleteCategoria(id);
      setCategorias(categorias.filter(cat => cat._id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    categorias,
    loading,
    error,
    cargarCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
  };
};
```

**Uso del hook:**
```typescript
// En un componente
const { categorias, loading, crearCategoria } = useCategorias('gastos');

// O para todas las categorías
const { categorias, loading } = useCategorias();
```

---

¡Listo para integrar! 🚀

