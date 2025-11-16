# Integración Frontend: Endpoints de Presupuestos

## Objetivo
Este documento describe cómo integrar los endpoints de presupuestos del backend con el frontend, incluyendo el sistema completo de gestión de presupuestos mensuales por categorías, formatos de datos, ejemplos de implementación y funciones helper.

---

## 🎯 Flujo del Sistema de Presupuestos

El sistema de presupuestos funciona de la siguiente manera:

1. **Obtener presupuestos del mes** → Ver todos los presupuestos de un mes específico
2. **Crear/actualizar presupuesto** → Registrar o actualizar un presupuesto (upsert) con monto o porcentaje
3. **Actualizar presupuesto existente** → Modificar un presupuesto por ID
4. **Eliminar presupuesto** → Eliminar un presupuesto por mes y categoría
5. **Obtener total presupuestado** → Calcular el total de todos los presupuestos del mes
6. **Obtener resumen** → Ver resumen con distribución, porcentajes y ahorro

**Importante:** Los usuarios solo pueden acceder a sus propios presupuestos. Todas las operaciones están protegidas por autenticación.

**Características especiales:**
- **Conversión automática**: Si envías un monto, se calcula el porcentaje automáticamente. Si envías un porcentaje, se calcula el monto.
- **Upsert**: El endpoint POST crea o actualiza automáticamente según mes y categoría.
- **Validación de meses**: Solo acepta los 12 meses válidos en español.

---

## 🏗️ Estructura del Backend (MVC)

### Endpoints Disponibles

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints de Presupuestos

### 1. Obtener Presupuestos del Mes

**Endpoint:**
```
GET /api/presupuestos/:mes
```

**Descripción:** Obtiene todos los presupuestos del usuario autenticado para un mes específico, ordenados por categoría. Incluye el cálculo automático de porcentajes.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `mes` (string, requerido): Mes en español (ej: `'noviembre'`, `'enero'`, `'diciembre'`)

**Meses válidos:**
`'enero'`, `'febrero'`, `'marzo'`, `'abril'`, `'mayo'`, `'junio'`, `'julio'`, `'agosto'`, `'septiembre'`, `'octubre'`, `'noviembre'`, `'diciembre'`

**Ejemplo de uso:**
```
GET /api/presupuestos/noviembre
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "mes": "noviembre",
      "categoria": "Alimentación",
      "monto": 500,
      "porcentaje": 20,
      "totalIngresos": 2500,
      "createdAt": "2024-11-01T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439012",
      "mes": "noviembre",
      "categoria": "Transporte",
      "monto": 300,
      "porcentaje": 12,
      "totalIngresos": 2500,
      "createdAt": "2024-11-01T10:00:00.000Z"
    }
  ]
}
```

**Campos de respuesta:**
- `_id`: ID único del presupuesto
- `userId`: ID del usuario propietario
- `mes`: Mes del presupuesto (en español)
- `categoria`: Nombre de la categoría
- `monto`: Monto presupuestado
- `porcentaje`: Porcentaje del total de ingresos (calculado automáticamente)
- `totalIngresos`: Total de ingresos del mes usado como referencia
- `createdAt`: Fecha de creación en formato ISO

**Errores posibles:**
- `400`: Mes inválido
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
type Mes = 'enero' | 'febrero' | 'marzo' | 'abril' | 'mayo' | 'junio' | 
           'julio' | 'agosto' | 'septiembre' | 'octubre' | 'noviembre' | 'diciembre';

interface Presupuesto {
  _id: string;
  userId: string;
  mes: Mes;
  categoria: string;
  monto: number;
  porcentaje?: number;
  totalIngresos: number;
  createdAt: string;
}

const getPresupuestosByMes = async (mes: Mes): Promise<Presupuesto[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/presupuestos/${mes}`,
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
      throw new Error(error.error || 'Mes inválido');
    }
    throw new Error(error.error || 'Error al obtener presupuestos');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 2. Crear o Actualizar Presupuesto (Upsert)

**Endpoint:**
```
POST /api/presupuestos
```

**Descripción:** Crea un nuevo presupuesto o actualiza uno existente si ya existe para ese mes y categoría. Puedes enviar monto o porcentaje (el otro se calcula automáticamente).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

**Opción 1: Con monto**
```json
{
  "mes": "noviembre",
  "categoria": "Alimentación",
  "monto": 500,
  "totalIngresos": 2500
}
```

**Opción 2: Con porcentaje**
```json
{
  "mes": "noviembre",
  "categoria": "Transporte",
  "porcentaje": 20,
  "totalIngresos": 2500
}
```

**Campos requeridos:**
- `mes` (string): Mes en español (debe ser uno de los 12 meses válidos)
- `categoria` (string): Nombre de la categoría
- `totalIngresos` (number): Total de ingresos del mes (debe ser > 0)

**Campos opcionales (debe enviarse al menos uno):**
- `monto` (number): Monto presupuestado (si se envía, se calcula el porcentaje)
- `porcentaje` (number): Porcentaje del total de ingresos (0-100, si se envía, se calcula el monto)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "mes": "noviembre",
    "categoria": "Alimentación",
    "monto": 500,
    "porcentaje": 20,
    "totalIngresos": 2500,
    "createdAt": "2024-11-01T10:00:00.000Z"
  },
  "message": "Presupuesto creado/actualizado exitosamente"
}
```

**Errores posibles:**
- `400`: Mes inválido, categoría requerida, monto/porcentaje inválido, totalIngresos inválido
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface CreatePresupuestoRequest {
  mes: Mes;
  categoria: string;
  monto?: number;
  porcentaje?: number;
  totalIngresos: number;
}

const createOrUpdatePresupuesto = async (
  data: CreatePresupuestoRequest
): Promise<Presupuesto> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/presupuestos',
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
    throw new Error(error.error || 'Error al crear/actualizar presupuesto');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 3. Actualizar Presupuesto Existente

**Endpoint:**
```
PUT /api/presupuestos/:id
```

**Descripción:** Actualiza un presupuesto existente por ID. Solo se actualizan los campos proporcionados.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, requerido): ID del presupuesto a actualizar

**Request Body (todos los campos son opcionales):**
```json
{
  "monto": 600,
  "totalIngresos": 2500
}
```

O con porcentaje:
```json
{
  "porcentaje": 25,
  "totalIngresos": 2500
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Presupuesto actualizado exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "mes": "noviembre",
    "categoria": "Alimentación",
    "monto": 600,
    "porcentaje": 24,
    "totalIngresos": 2500,
    "createdAt": "2024-11-01T10:00:00.000Z"
  }
}
```

**Errores posibles:**
- `400`: ID inválido, monto/porcentaje inválido, totalIngresos inválido
- `401`: Usuario no autenticado
- `404`: Presupuesto no encontrado o no pertenece al usuario
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface UpdatePresupuestoRequest {
  monto?: number;
  porcentaje?: number;
  totalIngresos?: number;
}

const updatePresupuesto = async (
  id: string,
  data: UpdatePresupuestoRequest
): Promise<Presupuesto> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/presupuestos/${id}`,
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
      throw new Error('Presupuesto no encontrado');
    }
    throw new Error(error.error || 'Error al actualizar presupuesto');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 4. Eliminar Presupuesto

**Endpoint:**
```
DELETE /api/presupuestos/:mes/:categoria
```

**Descripción:** Elimina un presupuesto específico del usuario autenticado por mes y categoría.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `mes` (string, requerido): Mes en español
- `categoria` (string, requerido): Nombre de la categoría (se codifica automáticamente en la URL)

**Ejemplo de uso:**
```
DELETE /api/presupuestos/noviembre/Alimentación
```

**Nota:** Si la categoría contiene espacios o caracteres especiales, asegúrate de codificarla correctamente en la URL (ej: `encodeURIComponent('Alimentación')`).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Presupuesto eliminado exitosamente"
}
```

**Errores posibles:**
- `400`: Mes inválido
- `401`: Usuario no autenticado
- `404`: Presupuesto no encontrado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
const deletePresupuesto = async (mes: Mes, categoria: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  // Codificar la categoría para la URL
  const categoriaEncoded = encodeURIComponent(categoria);
  
  const response = await fetch(
    `http://localhost:4444/api/presupuestos/${mes}/${categoriaEncoded}`,
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
    if (response.status === 400) {
      throw new Error(error.error || 'Mes inválido');
    }
    if (response.status === 404) {
      throw new Error('Presupuesto no encontrado');
    }
    throw new Error(error.error || 'Error al eliminar presupuesto');
  }
};
```

---

### 5. Obtener Total Presupuestado del Mes

**Endpoint:**
```
GET /api/presupuestos/:mes/total
```

**Descripción:** Obtiene la suma de todos los montos presupuestados para un mes específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `mes` (string, requerido): Mes en español

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "mes": "noviembre",
    "total": 1500
  }
}
```

**Errores posibles:**
- `400`: Mes inválido
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface TotalPresupuesto {
  mes: Mes;
  total: number;
}

const getTotalPresupuestosByMes = async (mes: Mes): Promise<TotalPresupuesto> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/presupuestos/${mes}/total`,
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
      throw new Error(error.error || 'Mes inválido');
    }
    throw new Error(error.error || 'Error al obtener total de presupuestos');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 6. Obtener Resumen de Presupuestos

**Endpoint:**
```
GET /api/presupuestos/:mes/resumen
```

**Descripción:** Obtiene un resumen completo de los presupuestos del mes, incluyendo distribución por categoría, porcentajes, total presupuestado y ahorro calculado.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `mes` (string, requerido): Mes en español

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "mes": "noviembre",
    "totalIngresos": 2500,
    "totalPresupuestado": 1500,
    "ahorro": 1000,
    "porcentajePresupuestado": 60,
    "presupuestos": [
      {
        "categoria": "Alimentación",
        "monto": 500,
        "porcentaje": 20
      },
      {
        "categoria": "Transporte",
        "monto": 300,
        "porcentaje": 12
      },
      {
        "categoria": "Entretenimiento",
        "monto": 700,
        "porcentaje": 28
      }
    ]
  }
}
```

**Campos de respuesta:**
- `mes`: Mes del resumen
- `totalIngresos`: Total de ingresos del mes
- `totalPresupuestado`: Suma de todos los presupuestos
- `ahorro`: Diferencia entre ingresos y presupuestado (totalIngresos - totalPresupuestado)
- `porcentajePresupuestado`: Porcentaje del total de ingresos que está presupuestado
- `presupuestos`: Array con cada presupuesto y su distribución

**Errores posibles:**
- `400`: Mes inválido
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface PresupuestoResumen {
  categoria: string;
  monto: number;
  porcentaje: number;
}

interface ResumenPresupuestos {
  mes: Mes;
  totalIngresos: number;
  totalPresupuestado: number;
  ahorro: number;
  porcentajePresupuestado: number;
  presupuestos: PresupuestoResumen[];
}

const getResumenPresupuestos = async (mes: Mes): Promise<ResumenPresupuestos> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/presupuestos/${mes}/resumen`,
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
      throw new Error(error.error || 'Mes inválido');
    }
    throw new Error(error.error || 'Error al obtener resumen de presupuestos');
  }

  const result = await response.json();
  return result.data;
};
```

---

## 🔧 Servicio Completo de Presupuestos

Aquí tienes un servicio completo con todas las funciones helper:

```typescript
// services/presupuestos.service.ts

const API_BASE_URL = 'http://localhost:4444';

export type Mes = 'enero' | 'febrero' | 'marzo' | 'abril' | 'mayo' | 'junio' | 
                  'julio' | 'agosto' | 'septiembre' | 'octubre' | 'noviembre' | 'diciembre';

export interface Presupuesto {
  _id: string;
  userId: string;
  mes: Mes;
  categoria: string;
  monto: number;
  porcentaje?: number;
  totalIngresos: number;
  createdAt: string;
}

export interface CreatePresupuestoRequest {
  mes: Mes;
  categoria: string;
  monto?: number;
  porcentaje?: number;
  totalIngresos: number;
}

export interface UpdatePresupuestoRequest {
  monto?: number;
  porcentaje?: number;
  totalIngresos?: number;
}

export interface TotalPresupuesto {
  mes: Mes;
  total: number;
}

export interface PresupuestoResumen {
  categoria: string;
  monto: number;
  porcentaje: number;
}

export interface ResumenPresupuestos {
  mes: Mes;
  totalIngresos: number;
  totalPresupuestado: number;
  ahorro: number;
  porcentajePresupuestado: number;
  presupuestos: PresupuestoResumen[];
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

// Obtener presupuestos del mes
export const getPresupuestosByMes = async (mes: Mes): Promise<Presupuesto[]> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/presupuestos/${mes}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await handleResponse(response);
  return result.data;
};

// Crear o actualizar presupuesto (upsert)
export const createOrUpdatePresupuesto = async (
  data: CreatePresupuestoRequest
): Promise<Presupuesto> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/presupuestos`, {
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

// Actualizar presupuesto existente
export const updatePresupuesto = async (
  id: string,
  data: UpdatePresupuestoRequest
): Promise<Presupuesto> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/presupuestos/${id}`, {
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

// Eliminar presupuesto
export const deletePresupuesto = async (mes: Mes, categoria: string): Promise<void> => {
  const token = getAuthToken();
  const categoriaEncoded = encodeURIComponent(categoria);
  
  const response = await fetch(
    `${API_BASE_URL}/api/presupuestos/${mes}/${categoriaEncoded}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  await handleResponse(response);
};

// Obtener total presupuestado del mes
export const getTotalPresupuestosByMes = async (mes: Mes): Promise<TotalPresupuesto> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/presupuestos/${mes}/total`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await handleResponse(response);
  return result.data;
};

// Obtener resumen de presupuestos
export const getResumenPresupuestos = async (mes: Mes): Promise<ResumenPresupuestos> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/presupuestos/${mes}/resumen`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await handleResponse(response);
  return result.data;
};
```

---

## 🎨 Ejemplo de Componente React Completo

```typescript
// PresupuestosList.tsx

import React, { useState, useEffect } from 'react';
import {
  getPresupuestosByMes,
  createOrUpdatePresupuesto,
  updatePresupuesto,
  deletePresupuesto,
  getResumenPresupuestos,
  Presupuesto,
  Mes,
  ResumenPresupuestos
} from './services/presupuestos.service';

const MESES: Mes[] = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const PresupuestosList: React.FC = () => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [resumen, setResumen] = useState<ResumenPresupuestos | null>(null);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState<Mes>('noviembre');
  const [showForm, setShowForm] = useState(false);
  const [editingPresupuesto, setEditingPresupuesto] = useState<Presupuesto | null>(null);
  const [formData, setFormData] = useState({
    categoria: '',
    monto: '',
    porcentaje: '',
    totalIngresos: ''
  });
  const [modoEntrada, setModoEntrada] = useState<'monto' | 'porcentaje'>('monto');

  useEffect(() => {
    cargarDatos();
  }, [mesSeleccionado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [presupuestosData, resumenData] = await Promise.all([
        getPresupuestosByMes(mesSeleccionado),
        getResumenPresupuestos(mesSeleccionado)
      ]);
      setPresupuestos(presupuestosData);
      setResumen(resumenData);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const data: any = {
        mes: mesSeleccionado,
        categoria: formData.categoria,
        totalIngresos: Number(formData.totalIngresos)
      };

      if (modoEntrada === 'monto') {
        data.monto = Number(formData.monto);
      } else {
        data.porcentaje = Number(formData.porcentaje);
      }

      await createOrUpdatePresupuesto(data);
      setFormData({ categoria: '', monto: '', porcentaje: '', totalIngresos: '' });
      setShowForm(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al crear presupuesto:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleUpdate = async () => {
    if (!editingPresupuesto) return;
    
    try {
      const data: any = {};
      
      if (modoEntrada === 'monto' && formData.monto) {
        data.monto = Number(formData.monto);
      } else if (modoEntrada === 'porcentaje' && formData.porcentaje) {
        data.porcentaje = Number(formData.porcentaje);
      }

      if (formData.totalIngresos) {
        data.totalIngresos = Number(formData.totalIngresos);
      }

      await updatePresupuesto(editingPresupuesto._id, data);
      setFormData({ categoria: '', monto: '', porcentaje: '', totalIngresos: '' });
      setEditingPresupuesto(null);
      setShowForm(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al actualizar presupuesto:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleDelete = async (mes: Mes, categoria: string) => {
    if (!confirm(`¿Estás seguro de eliminar el presupuesto de "${categoria}"?`)) {
      return;
    }
    
    try {
      await deletePresupuesto(mes, categoria);
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleEdit = (presupuesto: Presupuesto) => {
    setEditingPresupuesto(presupuesto);
    setFormData({
      categoria: presupuesto.categoria,
      monto: presupuesto.monto.toString(),
      porcentaje: presupuesto.porcentaje?.toString() || '',
      totalIngresos: presupuesto.totalIngresos.toString()
    });
    setModoEntrada(presupuesto.porcentaje ? 'porcentaje' : 'monto');
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ categoria: '', monto: '', porcentaje: '', totalIngresos: '' });
    setEditingPresupuesto(null);
    setShowForm(false);
  };

  if (loading) {
    return <div>Cargando presupuestos...</div>;
  }

  return (
    <div className="presupuestos-container">
      <div className="header">
        <h1>Presupuestos Mensuales</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nuevo Presupuesto'}
        </button>
      </div>

      <div className="mes-selector">
        <label>Mes:</label>
        <select 
          value={mesSeleccionado} 
          onChange={(e) => setMesSeleccionado(e.target.value as Mes)}
        >
          {MESES.map(mes => (
            <option key={mes} value={mes}>
              {mes.charAt(0).toUpperCase() + mes.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {resumen && (
        <div className="resumen-card">
          <h2>Resumen del Mes</h2>
          <div className="resumen-stats">
            <div className="stat">
              <span className="label">Total Ingresos:</span>
              <span className="value">${resumen.totalIngresos.toFixed(2)}</span>
            </div>
            <div className="stat">
              <span className="label">Total Presupuestado:</span>
              <span className="value">${resumen.totalPresupuestado.toFixed(2)}</span>
            </div>
            <div className="stat">
              <span className="label">Ahorro:</span>
              <span className="value">${resumen.ahorro.toFixed(2)}</span>
            </div>
            <div className="stat">
              <span className="label">% Presupuestado:</span>
              <span className="value">{resumen.porcentajePresupuestado.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h2>{editingPresupuesto ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</h2>
          <div className="form-group">
            <label>Categoría:</label>
            <input
              type="text"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              placeholder="Ej: Alimentación"
              disabled={!!editingPresupuesto}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Total Ingresos del Mes:</label>
            <input
              type="number"
              value={formData.totalIngresos}
              onChange={(e) => setFormData({ ...formData, totalIngresos: e.target.value })}
              placeholder="2500"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Modo de entrada:</label>
            <select
              value={modoEntrada}
              onChange={(e) => setModoEntrada(e.target.value as 'monto' | 'porcentaje')}
            >
              <option value="monto">Monto</option>
              <option value="porcentaje">Porcentaje</option>
            </select>
          </div>

          {modoEntrada === 'monto' ? (
            <div className="form-group">
              <label>Monto:</label>
              <input
                type="number"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                placeholder="500"
                min="0"
                step="0.01"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Porcentaje:</label>
              <input
                type="number"
                value={formData.porcentaje}
                onChange={(e) => setFormData({ ...formData, porcentaje: e.target.value })}
                placeholder="20"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>
          )}
          
          <div className="form-actions">
            <button onClick={editingPresupuesto ? handleUpdate : handleCreate}>
              {editingPresupuesto ? 'Actualizar' : 'Crear'}
            </button>
            <button onClick={handleCancel}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="presupuestos-list">
        {presupuestos.length === 0 ? (
          <p>No hay presupuestos para {mesSeleccionado}</p>
        ) : (
          presupuestos.map((presupuesto) => (
            <div key={presupuesto._id} className="presupuesto-item">
              <div className="presupuesto-header">
                <h3>{presupuesto.categoria}</h3>
                <span className="presupuesto-monto">
                  ${presupuesto.monto.toFixed(2)}
                </span>
              </div>
              <div className="presupuesto-details">
                <p>Porcentaje: {presupuesto.porcentaje?.toFixed(2) || 0}%</p>
                <p>Total Ingresos: ${presupuesto.totalIngresos.toFixed(2)}</p>
              </div>
              <div className="presupuesto-actions">
                <button onClick={() => handleEdit(presupuesto)}>
                  Editar
                </button>
                <button onClick={() => handleDelete(presupuesto.mes, presupuesto.categoria)}>
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

export default PresupuestosList;
```

---

## 📝 Meses Válidos

El sistema acepta los siguientes meses en español (en minúsculas):

1. `'enero'`
2. `'febrero'`
3. `'marzo'`
4. `'abril'`
5. `'mayo'`
6. `'junio'`
7. `'julio'`
8. `'agosto'`
9. `'septiembre'`
10. `'octubre'`
11. `'noviembre'`
12. `'diciembre'`

**Nota:** El backend normaliza automáticamente el mes a minúsculas y valida que sea uno de estos valores válidos.

---

## 🔄 Ejemplo de Hook Personalizado

```typescript
// hooks/usePresupuestos.ts

import { useState, useEffect } from 'react';
import {
  getPresupuestosByMes,
  createOrUpdatePresupuesto,
  updatePresupuesto,
  deletePresupuesto,
  getResumenPresupuestos,
  Presupuesto,
  Mes,
  ResumenPresupuestos,
  CreatePresupuestoRequest,
  UpdatePresupuestoRequest
} from '../services/presupuestos.service';

export const usePresupuestos = (mes: Mes) => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [resumen, setResumen] = useState<ResumenPresupuestos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [presupuestosData, resumenData] = await Promise.all([
        getPresupuestosByMes(mes),
        getResumenPresupuestos(mes)
      ]);
      setPresupuestos(presupuestosData);
      setResumen(resumenData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [mes]);

  const crearPresupuesto = async (data: CreatePresupuestoRequest) => {
    try {
      const nuevo = await createOrUpdatePresupuesto(data);
      await cargarDatos();
      return nuevo;
    } catch (err) {
      throw err;
    }
  };

  const actualizarPresupuesto = async (id: string, data: UpdatePresupuestoRequest) => {
    try {
      const actualizado = await updatePresupuesto(id, data);
      await cargarDatos();
      return actualizado;
    } catch (err) {
      throw err;
    }
  };

  const eliminarPresupuesto = async (categoria: string) => {
    try {
      await deletePresupuesto(mes, categoria);
      await cargarDatos();
    } catch (err) {
      throw err;
    }
  };

  return {
    presupuestos,
    resumen,
    loading,
    error,
    cargarDatos,
    crearPresupuesto,
    actualizarPresupuesto,
    eliminarPresupuesto
  };
};
```

**Uso del hook:**
```typescript
// En un componente
const { presupuestos, resumen, loading, crearPresupuesto } = usePresupuestos('noviembre');
```

---

## ✅ Checklist de Integración

- [ ] Instalar dependencias necesarias (si usas fetch, axios, etc.)
- [ ] Configurar la URL base del API
- [ ] Implementar el sistema de autenticación (token JWT)
- [ ] Crear el servicio de presupuestos con todas las funciones
- [ ] Crear componentes de UI para mostrar presupuestos
- [ ] Implementar selector de mes
- [ ] Implementar formulario de creación/edición con opción monto/porcentaje
- [ ] Implementar visualización de resumen con estadísticas
- [ ] Manejar estados de carga y errores
- [ ] Validar meses y datos antes de crear/actualizar
- [ ] Probar todos los endpoints
- [ ] Manejar conversión automática monto ↔ porcentaje
- [ ] Implementar codificación de categorías en URLs (para DELETE)

---

## 🔍 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren un token JWT válido en el header `Authorization: Bearer <token>`

2. **Conversión Automática**: 
   - Si envías un `monto`, el backend calcula automáticamente el `porcentaje` basado en `totalIngresos`
   - Si envías un `porcentaje`, el backend calcula automáticamente el `monto` basado en `totalIngresos`
   - Debes enviar al menos uno de los dos (monto o porcentaje)

3. **Upsert**: El endpoint POST (`createOrUpdatePresupuesto`) crea o actualiza automáticamente según mes y categoría. Si ya existe un presupuesto para esa combinación, se actualiza; si no, se crea.

4. **Validación de Mes**: El backend valida que el mes sea uno de los 12 meses válidos en español (en minúsculas)

5. **Total Ingresos**: El campo `totalIngresos` es requerido y debe ser mayor a 0. Se usa como referencia para calcular porcentajes.

6. **Validación de Porcentaje**: Si se envía porcentaje, debe estar entre 0 y 100.

7. **Seguridad**: Los usuarios solo pueden acceder a sus propios presupuestos. El backend valida automáticamente la propiedad.

8. **Normalización**: El backend normaliza automáticamente:
   - Mes a minúsculas
   - Categoría con trim (elimina espacios al inicio y final)

9. **Manejo de Errores**: Siempre maneja los errores apropiadamente y muestra mensajes claros al usuario:
   - `400`: Datos inválidos (mes inválido, categoría requerida, monto/porcentaje inválido)
   - `401`: Usuario no autenticado
   - `404`: Presupuesto no encontrado
   - `500`: Error del servidor

10. **Índice Único**: El backend tiene un índice único compuesto `{ userId, mes, categoria }` que previene automáticamente duplicados. Si intentas crear un presupuesto con una combinación que ya existe, se actualiza en lugar de crear uno nuevo.

11. **Eliminación por Mes y Categoría**: El endpoint DELETE usa mes y categoría (no ID) para identificar el presupuesto. Asegúrate de codificar correctamente la categoría en la URL con `encodeURIComponent()`.

12. **Resumen**: El resumen calcula automáticamente:
    - Total presupuestado (suma de todos los montos)
    - Ahorro (totalIngresos - totalPresupuestado)
    - Porcentaje presupuestado (porcentaje del total de ingresos que está presupuestado)

---

## 📚 Recursos Adicionales

- Documentación del backend: `integracion_endpoints/presupuestos.md`
- Modelo de datos: `src/models/Presupuesto.model.ts`
- Controlador: `src/controllers/presupuesto.controller.ts`
- Rutas: `src/routes/presupuesto.routes.ts`

---

## 🎨 Ejemplo de Gráfico de Distribución

```typescript
// PresupuestoChart.tsx

import React from 'react';
import { ResumenPresupuestos } from './services/presupuestos.service';

interface PresupuestoChartProps {
  resumen: ResumenPresupuestos;
}

const PresupuestoChart: React.FC<PresupuestoChartProps> = ({ resumen }) => {
  return (
    <div className="presupuesto-chart">
      <h3>Distribución de Presupuestos</h3>
      <div className="chart-container">
        {resumen.presupuestos.map((presupuesto, index) => {
          const width = presupuesto.porcentaje;
          return (
            <div key={index} className="chart-bar">
              <div className="bar-label">{presupuesto.categoria}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${width}%` }}
                >
                  <span className="bar-value">
                    ${presupuesto.monto.toFixed(2)} ({presupuesto.porcentaje.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chart-summary">
        <div className="summary-item">
          <span>Total Presupuestado:</span>
          <span>${resumen.totalPresupuestado.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Ahorro:</span>
          <span className={resumen.ahorro >= 0 ? 'positive' : 'negative'}>
            ${resumen.ahorro.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PresupuestoChart;
```

---

¡Listo para integrar! 🚀

