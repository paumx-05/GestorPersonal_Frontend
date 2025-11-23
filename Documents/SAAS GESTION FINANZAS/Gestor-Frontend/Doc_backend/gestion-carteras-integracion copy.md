# Integración Frontend: Gestión de Carteras con Saldos y Transferencias

## 📋 Objetivo

Este documento describe cómo integrar el sistema completo de **Gestión de Carteras** con capacidades avanzadas de manejo de saldos, transferencias entre carteras, y seguimiento de transacciones desde el frontend.

---

## 🎯 Características Principales

- ✅ **Gestión completa de carteras** (CRUD básico)
- 🆕 **Saldo dinámico** con campo `saldo`, `saldoInicial`, `moneda`
- 🆕 **Operaciones de saldo**: Depositar y retirar capital
- 🆕 **Transferencias** entre carteras del mismo usuario
- 🆕 **Historial de transacciones** completo y auditable
- 🆕 **Sincronización automática** con gastos e ingresos
- 🆕 **Multi-moneda** con soporte para diferentes divisas
- 🆕 **Saldo contable vs manual** para reconciliación

---

## 🏗️ Estructura del Backend

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints Disponibles

### 1. **Obtener Todas las Carteras**

**Endpoint:** `GET /api/carteras`

**Descripción:** Obtiene todas las carteras del usuario autenticado.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6745a1b2c3d4e5f678901234",
      "userId": "6745a1b2c3d4e5f678901230",
      "nombre": "Personal",
      "descripcion": "Cartera personal",
      "saldo": 1500.00,
      "saldoInicial": 1000.00,
      "moneda": "EUR",
      "icono": "💳",
      "color": "#3b82f6",
      "activa": true,
      "createdAt": "2024-11-20T10:00:00.000Z",
      "updatedAt": "2024-11-23T10:00:00.000Z"
    }
  ]
}
```

---

### 2. **Obtener Cartera por ID**

**Endpoint:** `GET /api/carteras/:id`

**Descripción:** Obtiene los detalles de una cartera específica.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "6745a1b2c3d4e5f678901234",
    "userId": "6745a1b2c3d4e5f678901230",
    "nombre": "Personal",
    "descripcion": "Cartera personal",
    "saldo": 1500.00,
    "saldoInicial": 1000.00,
    "moneda": "EUR",
    "icono": "💳",
    "color": "#3b82f6",
    "activa": true,
    "createdAt": "2024-11-20T10:00:00.000Z",
    "updatedAt": "2024-11-23T10:00:00.000Z"
  }
}
```

---

### 3. **Crear Cartera**

**Endpoint:** `POST /api/carteras`

**Body (JSON):**
```json
{
  "nombre": "Personal",
  "descripcion": "Cartera personal",
  "saldoInicial": 1000.00,
  "moneda": "EUR",
  "icono": "💳",
  "color": "#3b82f6"
}
```

**Campos:**
- `nombre` (requerido): Nombre de la cartera (máx. 100 caracteres)
- `descripcion` (opcional): Descripción (máx. 500 caracteres)
- `saldoInicial` (opcional): Saldo inicial (default: 0)
- `moneda` (opcional): Moneda (default: 'EUR', valores: EUR, USD, GBP, JPY, CHF, CAD, AUD, MXN)
- `icono` (opcional): Icono emoji (default: '💳', máx. 10 caracteres)
- `color` (opcional): Color hexadecimal (default: '#3b82f6')

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "6745a1b2c3d4e5f678901234",
    "userId": "6745a1b2c3d4e5f678901230",
    "nombre": "Personal",
    "descripcion": "Cartera personal",
    "saldo": 1000.00,
    "saldoInicial": 1000.00,
    "moneda": "EUR",
    "icono": "💳",
    "color": "#3b82f6",
    "activa": true,
    "createdAt": "2024-11-20T10:00:00.000Z",
    "updatedAt": "2024-11-20T10:00:00.000Z"
  },
  "message": "Cartera creada exitosamente"
}
```

---

### 4. **Actualizar Cartera**

**Endpoint:** `PUT /api/carteras/:id`

**Body (JSON):**
```json
{
  "nombre": "Personal Actualizado",
  "descripcion": "Nueva descripción",
  "saldoInicial": 1500.00,
  "moneda": "USD",
  "icono": "💰",
  "color": "#10b981",
  "activa": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "6745a1b2c3d4e5f678901234",
    "userId": "6745a1b2c3d4e5f678901230",
    "nombre": "Personal Actualizado",
    "descripcion": "Nueva descripción",
    "saldo": 1500.00,
    "saldoInicial": 1500.00,
    "moneda": "USD",
    "icono": "💰",
    "color": "#10b981",
    "activa": true,
    "createdAt": "2024-11-20T10:00:00.000Z",
    "updatedAt": "2024-11-23T10:00:00.000Z"
  },
  "message": "Cartera actualizada exitosamente"
}
```

---

### 5. **Eliminar Cartera**

**Endpoint:** `DELETE /api/carteras/:id?deleteData=true`

**Query Parameters:**
- `deleteData` (opcional): Si es `true`, elimina todos los gastos, ingresos y presupuestos asociados. Si es `false` o no se proporciona, solo desvincula la cartera.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cartera eliminada exitosamente"
}
```

---

### 6. **Depositar en Cartera** 🆕

**Endpoint:** `POST /api/carteras/:id/depositar`

**Descripción:** Añade capital a una cartera específica.

**Body (JSON):**
```json
{
  "monto": 500.00,
  "concepto": "Ingreso inicial de ahorros",
  "fecha": "2024-11-23T10:00:00.000Z"
}
```

**Campos:**
- `monto` (requerido): Cantidad a depositar (debe ser positivo)
- `concepto` (requerido): Descripción del depósito (máx. 200 caracteres)
- `fecha` (opcional): Fecha del depósito (default: ahora, no puede ser futura)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cartera": {
      "_id": "6745a1b2c3d4e5f678901234",
      "saldo": 1500.00,
      "nombre": "Personal"
    },
    "transaccion": {
      "_id": "6745a1b2c3d4e5f678901235",
      "tipo": "deposito",
      "carteraDestinoId": "6745a1b2c3d4e5f678901234",
      "monto": 500.00,
      "concepto": "Ingreso inicial de ahorros",
      "fecha": "2024-11-23T10:00:00.000Z"
    }
  },
  "message": "Depósito realizado exitosamente"
}
```

**Errores:**
- `400`: Datos inválidos (monto negativo, concepto vacío, fecha futura)
- `404`: Cartera no encontrada
- `500`: Error del servidor

---

### 7. **Retirar de Cartera** 🆕

**Endpoint:** `POST /api/carteras/:id/retirar`

**Descripción:** Retira capital de una cartera específica.

**Body (JSON):**
```json
{
  "monto": 200.00,
  "concepto": "Retiro para efectivo",
  "fecha": "2024-11-23T10:00:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cartera": {
      "_id": "6745a1b2c3d4e5f678901234",
      "saldo": 1300.00,
      "nombre": "Personal"
    },
    "transaccion": {
      "_id": "6745a1b2c3d4e5f678901236",
      "tipo": "retiro",
      "carteraOrigenId": "6745a1b2c3d4e5f678901234",
      "monto": 200.00,
      "concepto": "Retiro para efectivo",
      "fecha": "2024-11-23T10:00:00.000Z"
    }
  },
  "message": "Retiro realizado exitosamente"
}
```

**Errores:**
- `400`: Saldo insuficiente, datos inválidos
- `404`: Cartera no encontrada
- `500`: Error del servidor

---

### 8. **Transferir entre Carteras** 🆕

**Endpoint:** `POST /api/carteras/transferir`

**Descripción:** Transfiere capital entre dos carteras del mismo usuario.

**Body (JSON):**
```json
{
  "carteraOrigenId": "6745a1b2c3d4e5f678901234",
  "carteraDestinoId": "6745a1b2c3d4e5f678901237",
  "monto": 300.00,
  "concepto": "Reorganización de fondos",
  "fecha": "2024-11-23T10:00:00.000Z"
}
```

**Campos:**
- `carteraOrigenId` (requerido): ID de la cartera origen
- `carteraDestinoId` (requerido): ID de la cartera destino
- `monto` (requerido): Cantidad a transferir (debe ser positivo)
- `concepto` (requerido): Descripción de la transferencia (máx. 200 caracteres)
- `fecha` (opcional): Fecha de la transferencia (default: ahora)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "carteraOrigen": {
      "_id": "6745a1b2c3d4e5f678901234",
      "saldo": 1000.00,
      "nombre": "Personal"
    },
    "carteraDestino": {
      "_id": "6745a1b2c3d4e5f678901237",
      "saldo": 800.00,
      "nombre": "Ahorros"
    },
    "transaccion": {
      "_id": "6745a1b2c3d4e5f678901238",
      "tipo": "transferencia",
      "carteraOrigenId": "6745a1b2c3d4e5f678901234",
      "carteraDestinoId": "6745a1b2c3d4e5f678901237",
      "monto": 300.00,
      "concepto": "Reorganización de fondos",
      "fecha": "2024-11-23T10:00:00.000Z"
    }
  },
  "message": "Transferencia realizada exitosamente"
}
```

**Errores:**
- `400`: Saldo insuficiente, carteras iguales, datos inválidos
- `404`: Una o ambas carteras no encontradas
- `500`: Error del servidor

---

### 9. **Obtener Transacciones de Cartera** 🆕

**Endpoint:** `GET /api/carteras/:id/transacciones`

**Descripción:** Obtiene el historial completo de transacciones de una cartera.

**Query Parameters (opcionales):**
- `tipo`: Filtrar por tipo (`deposito`, `retiro`, `transferencia`, `gasto`, `ingreso`, `ajuste`)
- `fechaDesde`: Fecha desde (ISO string)
- `fechaHasta`: Fecha hasta (ISO string)
- `limit`: Número de resultados (default: 100, max: 500)
- `offset`: Paginación (default: 0)

**Ejemplo:**
```
GET /api/carteras/6745a1b2c3d4e5f678901234/transacciones?tipo=deposito&limit=50&offset=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6745a1b2c3d4e5f678901238",
      "userId": "6745a1b2c3d4e5f678901230",
      "tipo": "transferencia",
      "carteraOrigenId": "6745a1b2c3d4e5f678901234",
      "carteraDestinoId": "6745a1b2c3d4e5f678901237",
      "monto": 300.00,
      "concepto": "Reorganización de fondos",
      "fecha": "2024-11-23T10:00:00.000Z",
      "createdAt": "2024-11-23T10:00:00.000Z",
      "updatedAt": "2024-11-23T10:00:00.000Z"
    }
  ]
}
```

---

### 10. **Obtener Saldo Actualizado** 🆕

**Endpoint:** `GET /api/carteras/:id/saldo`

**Descripción:** Obtiene el saldo actual de la cartera con información de reconciliación.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "saldo": 1500.00,
    "saldoContable": 1480.00,
    "diferencia": 20.00,
    "ultimaActualizacion": "2024-11-23T10:00:00.000Z"
  }
}
```

**Campos:**
- `saldo`: Saldo manual actual de la cartera
- `saldoContable`: Saldo calculado desde `saldoInicial` + transacciones + gastos/ingresos
- `diferencia`: Diferencia entre saldo manual y contable (para detectar discrepancias)
- `ultimaActualizacion`: Fecha de última modificación

---

### 11. **Sincronizar Saldo** 🆕

**Endpoint:** `POST /api/carteras/:id/sincronizar`

**Descripción:** Recalcula el saldo de la cartera basándose en todas las transacciones, gastos e ingresos registrados.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "6745a1b2c3d4e5f678901234",
    "saldo": 1480.00,
    "nombre": "Personal"
  },
  "message": "Saldo sincronizado exitosamente"
}
```

**Lógica de Cálculo:**
```
saldoSincronizado = saldoInicial 
                  + Σ(transacciones tipo 'deposito' o 'ingreso')
                  - Σ(transacciones tipo 'retiro' o 'gasto')
                  + Σ(transferencias entrantes)
                  - Σ(transferencias salientes)
```

---

## 💻 Ejemplos de Implementación Frontend

### TypeScript Interfaces

```typescript
interface Cartera {
  _id: string;
  userId: string;
  nombre: string;
  descripcion?: string;
  saldo: number;
  saldoInicial: number;
  moneda: string;
  icono: string;
  color: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TransaccionCartera {
  _id: string;
  userId: string;
  tipo: 'deposito' | 'retiro' | 'transferencia' | 'ajuste' | 'gasto' | 'ingreso';
  carteraOrigenId?: string;
  carteraDestinoId?: string;
  monto: number;
  montoOrigen?: number;
  montoDestino?: number;
  concepto: string;
  fecha: string;
  referenciaId?: string;
  metadata?: {
    gastosAfectados?: string[];
    ingresosAfectados?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface SaldoInfo {
  saldo: number;
  saldoContable: number;
  diferencia: number;
  ultimaActualizacion: string;
}
```

### Función Helper para API Calls

```typescript
const API_BASE_URL = 'http://localhost:4444/api/carteras';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Obtener todas las carteras
export const getCarteras = async (): Promise<Cartera[]> => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener carteras');
  }
  
  const data = await response.json();
  return data.data;
};

// Crear cartera
export const createCartera = async (carteraData: {
  nombre: string;
  descripcion?: string;
  saldoInicial?: number;
  moneda?: string;
  icono?: string;
  color?: string;
}): Promise<Cartera> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(carteraData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear cartera');
  }
  
  const data = await response.json();
  return data.data;
};

// Depositar
export const depositar = async (
  carteraId: string,
  monto: number,
  concepto: string,
  fecha?: string
): Promise<{ cartera: Cartera; transaccion: TransaccionCartera }> => {
  const response = await fetch(`${API_BASE_URL}/${carteraId}/depositar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ monto, concepto, fecha })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al realizar depósito');
  }
  
  const data = await response.json();
  return data.data;
};

// Retirar
export const retirar = async (
  carteraId: string,
  monto: number,
  concepto: string,
  fecha?: string
): Promise<{ cartera: Cartera; transaccion: TransaccionCartera }> => {
  const response = await fetch(`${API_BASE_URL}/${carteraId}/retirar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ monto, concepto, fecha })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al realizar retiro');
  }
  
  const data = await response.json();
  return data.data;
};

// Transferir
export const transferir = async (
  carteraOrigenId: string,
  carteraDestinoId: string,
  monto: number,
  concepto: string,
  fecha?: string
): Promise<{
  carteraOrigen: Cartera;
  carteraDestino: Cartera;
  transaccion: TransaccionCartera;
}> => {
  const response = await fetch(`${API_BASE_URL}/transferir`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      carteraOrigenId,
      carteraDestinoId,
      monto,
      concepto,
      fecha
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al realizar transferencia');
  }
  
  const data = await response.json();
  return data.data;
};

// Obtener transacciones
export const getTransacciones = async (
  carteraId: string,
  filters?: {
    tipo?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    limit?: number;
    offset?: number;
  }
): Promise<TransaccionCartera[]> => {
  const params = new URLSearchParams();
  if (filters?.tipo) params.append('tipo', filters.tipo);
  if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
  if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/${carteraId}/transacciones${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener transacciones');
  }
  
  const data = await response.json();
  return data.data;
};

// Obtener saldo
export const getSaldo = async (carteraId: string): Promise<SaldoInfo> => {
  const response = await fetch(`${API_BASE_URL}/${carteraId}/saldo`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener saldo');
  }
  
  const data = await response.json();
  return data.data;
};

// Sincronizar saldo
export const sincronizarSaldo = async (carteraId: string): Promise<Cartera> => {
  const response = await fetch(`${API_BASE_URL}/${carteraId}/sincronizar`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al sincronizar saldo');
  }
  
  const data = await response.json();
  return data.data;
};
```

### Ejemplo de Uso en React

```typescript
import { useState, useEffect } from 'react';
import { getCarteras, depositar, retirar, transferir, getTransacciones } from './api/carteras';

const CarterasComponent = () => {
  const [carteras, setCarteras] = useState<Cartera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCarteras();
  }, []);

  const loadCarteras = async () => {
    try {
      setLoading(true);
      const data = await getCarteras();
      setCarteras(data);
    } catch (error) {
      console.error('Error al cargar carteras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositar = async (carteraId: string, monto: number, concepto: string) => {
    try {
      await depositar(carteraId, monto, concepto);
      await loadCarteras(); // Recargar carteras
      alert('Depósito realizado exitosamente');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleRetirar = async (carteraId: string, monto: number, concepto: string) => {
    try {
      await retirar(carteraId, monto, concepto);
      await loadCarteras();
      alert('Retiro realizado exitosamente');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleTransferir = async (
    origenId: string,
    destinoId: string,
    monto: number,
    concepto: string
  ) => {
    try {
      await transferir(origenId, destinoId, monto, concepto);
      await loadCarteras();
      alert('Transferencia realizada exitosamente');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Mis Carteras</h1>
      {carteras.map(cartera => (
        <div key={cartera._id}>
          <h2>{cartera.nombre} - {cartera.saldo} {cartera.moneda}</h2>
          <button onClick={() => handleDepositar(cartera._id, 100, 'Depósito de prueba')}>
            Depositar 100
          </button>
          <button onClick={() => handleRetirar(cartera._id, 50, 'Retiro de prueba')}>
            Retirar 50
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## ⚠️ Validaciones Importantes

1. **Monto**: Debe ser un número positivo
2. **Concepto**: Requerido, máximo 200 caracteres
3. **Fecha**: No puede ser futura
4. **Saldo suficiente**: Para retiros y transferencias, el saldo debe ser suficiente
5. **Carteras diferentes**: No se puede transferir a la misma cartera
6. **Moneda**: Solo valores válidos: EUR, USD, GBP, JPY, CHF, CAD, AUD, MXN
7. **Color**: Debe ser un código hexadecimal válido (ej: #3b82f6)

---

## 🔐 Seguridad

- Todas las rutas requieren autenticación JWT
- Los usuarios solo pueden acceder a sus propias carteras
- Las transacciones son atómicas (se ejecutan en transacciones de base de datos)
- Validación de saldo suficiente antes de retiros/transferencias

---

## 📝 Notas Técnicas

- Los saldos se actualizan automáticamente al realizar operaciones
- Las transacciones se registran para auditoría completa
- El saldo contable permite detectar discrepancias
- La sincronización recalcula el saldo desde todas las transacciones
- Los gastos e ingresos pueden estar vinculados a carteras (se sincronizan automáticamente)

---

## ✅ Checklist de Integración

- [ ] Implementar interfaces TypeScript
- [ ] Crear funciones helper para API calls
- [ ] Implementar UI para listar carteras
- [ ] Implementar formulario de creación de cartera
- [ ] Implementar formulario de depósito
- [ ] Implementar formulario de retiro
- [ ] Implementar formulario de transferencia
- [ ] Implementar vista de historial de transacciones
- [ ] Implementar vista de saldo y reconciliación
- [ ] Implementar función de sincronización
- [ ] Manejar errores y validaciones
- [ ] Agregar loading states
- [ ] Agregar confirmaciones para operaciones críticas

---

**Última actualización:** 2024-11-23  
**Versión del Documento:** 2.0

