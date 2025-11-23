# Integración Frontend: Endpoints de Carteras

## Objetivo
Este documento describe cómo integrar los endpoints de carteras del backend con el frontend, incluyendo el sistema completo de gestión de múltiples carteras por usuario, formatos de datos, ejemplos de implementación y funciones helper.

---

## 🎯 Flujo del Sistema de Carteras

El sistema de carteras funciona de la siguiente manera:

1. **Obtener todas las carteras** → Ver todas las carteras del usuario
2. **Obtener cartera por ID** → Ver detalles de una cartera específica
3. **Crear cartera** → Registrar una nueva cartera personalizada
4. **Actualizar cartera** → Modificar una cartera existente
5. **Eliminar cartera** → Eliminar una cartera (con opción de mantener o eliminar datos asociados)

**Importante:** Los usuarios solo pueden acceder a sus propias carteras. Todas las operaciones están protegidas por autenticación.

---

## 🏗️ Estructura del Backend (MVC)

### Endpoints Disponibles

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints de Carteras

### 1. Obtener Todas las Carteras

**Endpoint:**
```
GET /api/carteras
```

**Descripción:** Obtiene todas las carteras del usuario autenticado, ordenadas por fecha de creación descendente (más recientes primero).

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
      "nombre": "Personal",
      "descripcion": "Cartera para gastos personales",
      "createdAt": "2024-11-15T10:00:00.000Z",
      "updatedAt": "2024-11-15T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439012",
      "nombre": "Trabajo",
      "descripcion": "Cartera para gastos de trabajo",
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    }
  ]
}
```

**Campos de respuesta:**
- `_id`: ID único de la cartera
- `userId`: ID del usuario propietario
- `nombre`: Nombre de la cartera (máximo 100 caracteres)
- `descripcion`: Descripción opcional de la cartera (máximo 500 caracteres)
- `createdAt`: Fecha de creación en formato ISO
- `updatedAt`: Fecha de última actualización en formato ISO

**Errores posibles:**
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface Cartera {
  _id: string;
  userId: string;
  nombre: string;
  descripcion?: string;
  createdAt: string;
  updatedAt: string;
}

const getCarteras = async (): Promise<Cartera[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/carteras',
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
    throw new Error(error.error || 'Error al obtener carteras');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 2. Obtener Cartera por ID

**Endpoint:**
```
GET /api/carteras/:id
```

**Descripción:** Obtiene una cartera específica por su ID. Solo se puede acceder a carteras propias.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, requerido): ID de la cartera a obtener

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "nombre": "Personal",
    "descripcion": "Cartera para gastos personales",
    "createdAt": "2024-11-15T10:00:00.000Z",
    "updatedAt": "2024-11-15T10:00:00.000Z"
  }
}
```

**Errores posibles:**
- `400`: ID de cartera inválido
- `401`: Usuario no autenticado
- `404`: Cartera no encontrada
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
const getCarteraById = async (id: string): Promise<Cartera> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/carteras/${id}`,
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
    throw new Error(error.error || 'Error al obtener cartera');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 3. Crear Cartera

**Endpoint:**
```
POST /api/carteras
```

**Descripción:** Crea una nueva cartera para el usuario autenticado. El nombre debe ser único por usuario.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nombre": "Personal",
  "descripcion": "Cartera para gastos personales"
}
```

**Campos del body:**
- `nombre` (string, requerido): Nombre de la cartera (máximo 100 caracteres, no puede estar vacío)
- `descripcion` (string, opcional): Descripción de la cartera (máximo 500 caracteres)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "nombre": "Personal",
    "descripcion": "Cartera para gastos personales",
    "createdAt": "2024-11-15T10:00:00.000Z",
    "updatedAt": "2024-11-15T10:00:00.000Z"
  },
  "message": "Cartera creada exitosamente"
}
```

**Errores posibles:**
- `400`: Campos inválidos (nombre vacío, excede límites de caracteres)
- `401`: Usuario no autenticado
- `409`: Ya existe una cartera con ese nombre
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface CreateCarteraData {
  nombre: string;
  descripcion?: string;
}

const createCartera = async (data: CreateCarteraData): Promise<Cartera> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/carteras',
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
    throw new Error(error.error || 'Error al crear cartera');
  }

  const result = await response.json();
  return result.data;
};

// Uso
try {
  const nuevaCartera = await createCartera({
    nombre: 'Personal',
    descripcion: 'Cartera para gastos personales'
  });
  console.log('Cartera creada:', nuevaCartera);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

### 4. Actualizar Cartera

**Endpoint:**
```
PUT /api/carteras/:id
```

**Descripción:** Actualiza una cartera existente. Se puede actualizar el nombre y/o la descripción. El nombre debe seguir siendo único por usuario.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, requerido): ID de la cartera a actualizar

**Body (JSON):**
```json
{
  "nombre": "Personal Actualizado",
  "descripcion": "Nueva descripción"
}
```

**Campos del body (todos opcionales, pero al menos uno requerido):**
- `nombre` (string, opcional): Nuevo nombre de la cartera (máximo 100 caracteres)
- `descripcion` (string, opcional): Nueva descripción (máximo 500 caracteres, puede ser null para eliminar)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "nombre": "Personal Actualizado",
    "descripcion": "Nueva descripción",
    "createdAt": "2024-11-15T10:00:00.000Z",
    "updatedAt": "2024-11-15T11:00:00.000Z"
  },
  "message": "Cartera actualizada exitosamente"
}
```

**Errores posibles:**
- `400`: ID inválido, campos inválidos, o no se proporcionó ningún campo para actualizar
- `401`: Usuario no autenticado
- `404`: Cartera no encontrada
- `409`: Ya existe una cartera con ese nombre
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface UpdateCarteraData {
  nombre?: string;
  descripcion?: string | null;
}

const updateCartera = async (
  id: string, 
  data: UpdateCarteraData
): Promise<Cartera> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/carteras/${id}`,
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
    throw new Error(error.error || 'Error al actualizar cartera');
  }

  const result = await response.json();
  return result.data;
};

// Uso
try {
  const carteraActualizada = await updateCartera('507f1f77bcf86cd799439011', {
    nombre: 'Personal Actualizado',
    descripcion: 'Nueva descripción'
  });
  console.log('Cartera actualizada:', carteraActualizada);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

### 5. Eliminar Cartera

**Endpoint:**
```
DELETE /api/carteras/:id?deleteData=true|false
```

**Descripción:** Elimina una cartera. Opcionalmente puede eliminar o mantener los datos asociados (gastos, ingresos, presupuestos).

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, requerido): ID de la cartera a eliminar

**Query Parameters:**
- `deleteData` (boolean, opcional): 
  - `true`: Elimina todos los gastos, ingresos y presupuestos asociados a la cartera
  - `false` (default): Mantiene los datos pero los desasocia de la cartera (carteraId = null)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cartera eliminada exitosamente"
}
```

**Errores posibles:**
- `400`: ID de cartera inválido
- `401`: Usuario no autenticado
- `404`: Cartera no encontrada
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
const deleteCartera = async (
  id: string, 
  deleteData: boolean = false
): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/carteras/${id}?deleteData=${deleteData}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar cartera');
  }
};

// Uso - Eliminar cartera manteniendo los datos
try {
  await deleteCartera('507f1f77bcf86cd799439011', false);
  console.log('Cartera eliminada, datos mantenidos');
} catch (error) {
  console.error('Error:', error.message);
}

// Uso - Eliminar cartera y todos sus datos
try {
  await deleteCartera('507f1f77bcf86cd799439011', true);
  console.log('Cartera y datos eliminados');
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🔗 Integración con Gastos, Ingresos y Presupuestos

### Filtrar por Cartera

Todos los endpoints de gastos, ingresos y presupuestos ahora aceptan un query parameter opcional `carteraId` para filtrar los resultados por cartera.

**Ejemplo - Obtener gastos de un mes filtrados por cartera:**
```typescript
const getGastosByMes = async (
  mes: string, 
  carteraId?: string
): Promise<Gasto[]> => {
  const token = localStorage.getItem('token');
  const url = carteraId 
    ? `http://localhost:4444/api/gastos/${mes}?carteraId=${carteraId}`
    : `http://localhost:4444/api/gastos/${mes}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener gastos');
  }

  const result = await response.json();
  return result.data;
};

// Uso - Obtener todos los gastos del mes
const todosLosGastos = await getGastosByMes('noviembre');

// Uso - Obtener solo los gastos de una cartera específica
const gastosCartera = await getGastosByMes('noviembre', '507f1f77bcf86cd799439011');
```

### Crear con Cartera

Al crear gastos, ingresos o presupuestos, puedes asociarlos a una cartera incluyendo el campo `carteraId` en el body.

**Ejemplo - Crear gasto con cartera:**
```typescript
const createGasto = async (data: {
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
  mes: string;
  carteraId?: string;
  dividido?: any[];
}): Promise<Gasto> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/gastos',
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
    throw new Error(error.error || 'Error al crear gasto');
  }

  const result = await response.json();
  return result.data;
};

// Uso - Crear gasto sin cartera
const gastoSinCartera = await createGasto({
  descripcion: 'Compra supermercado',
  monto: 150.50,
  fecha: '2024-11-15T10:00:00Z',
  categoria: 'Alimentación',
  mes: 'noviembre'
});

// Uso - Crear gasto con cartera
const gastoConCartera = await createGasto({
  descripcion: 'Compra supermercado',
  monto: 150.50,
  fecha: '2024-11-15T10:00:00Z',
  categoria: 'Alimentación',
  mes: 'noviembre',
  carteraId: '507f1f77bcf86cd799439011'
});
```

---

## 🛠️ Funciones Helper Recomendadas

### 1. Gestión de Carteras

```typescript
// Servicio completo de carteras
export const carteraService = {
  // Obtener todas las carteras
  getAll: async (): Promise<Cartera[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4444/api/carteras', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al obtener carteras');
    const result = await response.json();
    return result.data;
  },

  // Obtener cartera por ID
  getById: async (id: string): Promise<Cartera> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:4444/api/carteras/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al obtener cartera');
    const result = await response.json();
    return result.data;
  },

  // Crear cartera
  create: async (data: CreateCarteraData): Promise<Cartera> => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4444/api/carteras', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear cartera');
    }
    const result = await response.json();
    return result.data;
  },

  // Actualizar cartera
  update: async (id: string, data: UpdateCarteraData): Promise<Cartera> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:4444/api/carteras/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar cartera');
    }
    const result = await response.json();
    return result.data;
  },

  // Eliminar cartera
  delete: async (id: string, deleteData: boolean = false): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:4444/api/carteras/${id}?deleteData=${deleteData}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar cartera');
    }
  }
};
```

### 2. Helper para Filtrar por Cartera

```typescript
// Helper para construir URLs con filtro de cartera
export const buildUrlWithCartera = (
  baseUrl: string, 
  carteraId?: string
): string => {
  if (!carteraId) return baseUrl;
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}carteraId=${carteraId}`;
};

// Uso
const url = buildUrlWithCartera(
  'http://localhost:4444/api/gastos/noviembre',
  '507f1f77bcf86cd799439011'
);
// Resultado: http://localhost:4444/api/gastos/noviembre?carteraId=507f1f77bcf86cd799439011
```

---

## 📝 Notas Importantes

### Retrocompatibilidad

- El campo `carteraId` es **opcional** en todos los modelos (gastos, ingresos, presupuestos)
- Los datos existentes sin `carteraId` se consideran parte de la "cartera por defecto" (null)
- Todos los endpoints funcionan correctamente con o sin `carteraId`

### Validaciones

1. **Nombre único:** No puede haber dos carteras con el mismo nombre para el mismo usuario
2. **Límites de caracteres:**
   - Nombre: máximo 100 caracteres
   - Descripción: máximo 500 caracteres
3. **Validación de carteraId:** Si se proporciona `carteraId` en cualquier endpoint, debe:
   - Ser un ObjectId válido
   - Existir en la base de datos
   - Pertenecer al usuario autenticado

### Manejo de Errores

```typescript
try {
  const carteras = await carteraService.getAll();
} catch (error) {
  if (error.message.includes('409')) {
    // Conflicto: nombre duplicado
    console.error('Ya existe una cartera con ese nombre');
  } else if (error.message.includes('404')) {
    // No encontrado
    console.error('Cartera no encontrada');
  } else if (error.message.includes('401')) {
    // No autenticado
    console.error('Sesión expirada, por favor inicia sesión');
    // Redirigir a login
  } else {
    // Error genérico
    console.error('Error:', error.message);
  }
}
```

---

## 🎨 Ejemplos de Uso en Componentes React

### Componente de Lista de Carteras

```typescript
import React, { useState, useEffect } from 'react';
import { carteraService } from '../services/carteraService';

const CarterasList: React.FC = () => {
  const [carteras, setCarteras] = useState<Cartera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCarteras();
  }, []);

  const loadCarteras = async () => {
    try {
      setLoading(true);
      const data = await carteraService.getAll();
      setCarteras(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cartera?')) return;
    
    try {
      await carteraService.delete(id, false);
      await loadCarteras();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div>Cargando carteras...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Mis Carteras</h2>
      {carteras.map(cartera => (
        <div key={cartera._id}>
          <h3>{cartera.nombre}</h3>
          <p>{cartera.descripcion || 'Sin descripción'}</p>
          <button onClick={() => handleDelete(cartera._id)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Componente de Selector de Cartera

```typescript
import React, { useState, useEffect } from 'react';
import { carteraService } from '../services/carteraService';

interface CarteraSelectorProps {
  value?: string;
  onChange: (carteraId: string | null) => void;
}

const CarteraSelector: React.FC<CarteraSelectorProps> = ({ value, onChange }) => {
  const [carteras, setCarteras] = useState<Cartera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCarteras();
  }, []);

  const loadCarteras = async () => {
    try {
      const data = await carteraService.getAll();
      setCarteras(data);
    } catch (err) {
      console.error('Error al cargar carteras:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <select disabled><option>Cargando...</option></select>;

  return (
    <select 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">Sin cartera</option>
      {carteras.map(cartera => (
        <option key={cartera._id} value={cartera._id}>
          {cartera.nombre}
        </option>
      ))}
    </select>
  );
};
```

---

## ✅ Checklist de Integración

- [ ] Crear servicio de carteras (`carteraService`)
- [ ] Implementar componente de lista de carteras
- [ ] Implementar formulario de creación/edición de carteras
- [ ] Agregar selector de cartera en formularios de gastos/ingresos/presupuestos
- [ ] Implementar filtrado por cartera en listas de gastos/ingresos/presupuestos
- [ ] Manejar errores de validación (nombre duplicado, etc.)
- [ ] Implementar confirmación antes de eliminar cartera
- [ ] Mostrar cartera asociada en detalles de gastos/ingresos/presupuestos
- [ ] Actualizar dashboard para mostrar datos por cartera
- [ ] Probar todos los flujos de usuario

---

**Última actualización:** 2024-11-16

