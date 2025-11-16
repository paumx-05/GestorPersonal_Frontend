# Integración Frontend: Endpoints de Dashboard

## Objetivo
Este documento describe cómo integrar los endpoints de dashboard del backend con el frontend, proporcionando resúmenes del mes actual, gastos recientes, distribución por categorías, comparativas mensuales y alertas financieras.

---

## 🎯 Flujo del Sistema de Dashboard

El sistema de dashboard proporciona información consolidada para visualizar el estado financiero del usuario:

1. **Resumen del mes actual** → Totales de ingresos, gastos, balance y porcentaje gastado
2. **Gastos recientes** → Últimos 7 gastos del mes actual
3. **Gastos por categoría** → Top 3 categorías con más gastos
4. **Comparativa mensual** → Comparación entre mes actual y mes anterior
5. **Alertas financieras** → Alertas dinámicas según situación financiera

**Importante:** Los usuarios solo pueden acceder a sus propios datos. Todas las operaciones están protegidas por autenticación.

**Características especiales:**
- **Cálculo automático**: Todos los cálculos se realizan en el backend
- **Mes actual automático**: El sistema detecta automáticamente el mes actual
- **Alertas dinámicas**: Las alertas se generan según la situación financiera real
- **Optimización**: Consultas paralelas para mejor rendimiento

---

## 🏗️ Estructura del Backend (MVC)

### Endpoints Disponibles

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints de Dashboard

### 1. Obtener Resumen del Mes Actual

**Endpoint:**
```
GET /api/dashboard/resumen
```

**Descripción:** Obtiene un resumen completo del mes actual con totales de ingresos, gastos, balance y porcentaje gastado.

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/dashboard/resumen
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "mes": "noviembre",
    "ingresos": 2500.00,
    "gastos": 1800.50,
    "balance": 699.50,
    "porcentajeGastado": 72.02
  }
}
```

**Campos de respuesta:**
- `mes`: Mes actual en español (ej: `'noviembre'`)
- `ingresos`: Total de ingresos del mes actual
- `gastos`: Total de gastos del mes actual
- `balance`: Diferencia entre ingresos y gastos (ingresos - gastos)
- `porcentajeGastado`: Porcentaje de ingresos que se ha gastado (0-100)

**Errores posibles:**
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface ResumenMesActual {
  mes: string;
  ingresos: number;
  gastos: number;
  balance: number;
  porcentajeGastado: number;
}

const getResumenMesActual = async (): Promise<ResumenMesActual> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/dashboard/resumen',
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
    throw new Error(error.error || 'Error al obtener resumen del mes actual');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 2. Obtener Gastos Recientes

**Endpoint:**
```
GET /api/dashboard/gastos-recientes
```

**Descripción:** Obtiene los últimos 7 gastos del mes actual, ordenados por fecha descendente (más recientes primero).

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/dashboard/gastos-recientes
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "descripcion": "Compra en supermercado",
      "monto": 85.50,
      "categoria": "Alimentación",
      "fecha": "2024-11-15T10:30:00.000Z",
      "mes": "noviembre"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "descripcion": "Gasolina",
      "monto": 45.00,
      "categoria": "Transporte",
      "fecha": "2024-11-14T08:15:00.000Z",
      "mes": "noviembre"
    }
  ]
}
```

**Campos de respuesta:**
- `_id`: ID único del gasto
- `descripcion`: Descripción del gasto
- `monto`: Monto del gasto
- `categoria`: Categoría del gasto
- `fecha`: Fecha del gasto en formato ISO
- `mes`: Mes del gasto en español

**Nota:** Si hay menos de 7 gastos en el mes, se devuelven todos los disponibles.

**Errores posibles:**
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface GastoReciente {
  _id: string;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
  mes: string;
}

const getGastosRecientes = async (): Promise<GastoReciente[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/dashboard/gastos-recientes',
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
    throw new Error(error.error || 'Error al obtener gastos recientes');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 3. Obtener Gastos por Categoría (Top 3)

**Endpoint:**
```
GET /api/dashboard/gastos-categoria
```

**Descripción:** Obtiene las top 3 categorías con más gastos del mes actual, incluyendo monto y porcentaje del total.

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/dashboard/gastos-categoria
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "categoria": "Alimentación",
      "monto": 650.00,
      "porcentaje": 36.11
    },
    {
      "categoria": "Transporte",
      "monto": 450.50,
      "porcentaje": 25.03
    },
    {
      "categoria": "Entretenimiento",
      "monto": 300.00,
      "porcentaje": 16.67
    }
  ],
  "total": 1800.50
}
```

**Campos de respuesta:**
- `data`: Array con las top 3 categorías
  - `categoria`: Nombre de la categoría
  - `monto`: Total gastado en esa categoría
  - `porcentaje`: Porcentaje del total de gastos
- `total`: Total de gastos del mes actual

**Nota:** Si hay menos de 3 categorías, se devuelven todas las disponibles.

**Errores posibles:**
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface GastoPorCategoria {
  categoria: string;
  monto: number;
  porcentaje: number;
}

interface GastosPorCategoriaResponse {
  data: GastoPorCategoria[];
  total: number;
}

const getGastosPorCategoria = async (): Promise<GastosPorCategoriaResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/dashboard/gastos-categoria',
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
    throw new Error(error.error || 'Error al obtener gastos por categoría');
  }

  const result = await response.json();
  return {
    data: result.data,
    total: result.total
  };
};
```

---

### 4. Obtener Comparativa Mensual

**Endpoint:**
```
GET /api/dashboard/comparativa
```

**Descripción:** Compara los datos financieros del mes actual con el mes anterior, mostrando cambios en ingresos, gastos y balance.

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/dashboard/comparativa
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "mesActual": {
      "ingresos": 2500.00,
      "gastos": 1800.50,
      "balance": 699.50
    },
    "mesAnterior": {
      "ingresos": 2300.00,
      "gastos": 1950.00,
      "balance": 350.00
    },
    "cambios": {
      "ingresos": {
        "valor": 200.00,
        "porcentaje": 8.70,
        "tipo": "aumento"
      },
      "gastos": {
        "valor": -149.50,
        "porcentaje": -7.67,
        "tipo": "disminucion"
      },
      "balance": {
        "valor": 349.50,
        "porcentaje": 99.86,
        "tipo": "aumento"
      }
    }
  }
}
```

**Campos de respuesta:**
- `mesActual`: Datos del mes actual
  - `ingresos`: Total de ingresos
  - `gastos`: Total de gastos
  - `balance`: Balance (ingresos - gastos)
- `mesAnterior`: Datos del mes anterior (misma estructura)
- `cambios`: Cambios entre meses
  - `ingresos`, `gastos`, `balance`: Cada uno contiene:
    - `valor`: Diferencia absoluta (actual - anterior)
    - `porcentaje`: Porcentaje de cambio
    - `tipo`: `'aumento'` o `'disminucion'`

**Nota:** Si no hay datos del mes anterior, los valores serán 0.

**Errores posibles:**
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface CambioFinanciero {
  valor: number;
  porcentaje: number;
  tipo: 'aumento' | 'disminucion';
}

interface DatosMensuales {
  ingresos: number;
  gastos: number;
  balance: number;
}

interface ComparativaMensual {
  mesActual: DatosMensuales;
  mesAnterior: DatosMensuales;
  cambios: {
    ingresos: CambioFinanciero;
    gastos: CambioFinanciero;
    balance: CambioFinanciero;
  };
}

const getComparativaMensual = async (): Promise<ComparativaMensual> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/dashboard/comparativa',
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
    throw new Error(error.error || 'Error al obtener comparativa mensual');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 5. Obtener Alertas Financieras

**Endpoint:**
```
GET /api/dashboard/alertas
```

**Descripción:** Obtiene alertas financieras dinámicas basadas en la situación actual del usuario (balance negativo, presupuesto excedido, etc.).

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/dashboard/alertas
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "tipo": "error",
      "titulo": "Balance negativo",
      "mensaje": "Los gastos superan los ingresos en 150.50€"
    },
    {
      "tipo": "warning",
      "titulo": "Presupuesto excedido: Alimentación",
      "mensaje": "Has superado el presupuesto en 50.00€"
    },
    {
      "tipo": "info",
      "titulo": "Sin ingresos registrados",
      "mensaje": "No hay ingresos registrados para este mes"
    },
    {
      "tipo": "success",
      "titulo": "Excelente gestión",
      "mensaje": "Has ahorrado 699.50€ este mes (27.98% de tus ingresos)"
    }
  ]
}
```

**Tipos de alertas:**
- `info`: Información general
- `success`: Situación positiva
- `warning`: Advertencia
- `error`: Error crítico

**Alertas posibles:**
1. **Sin ingresos registrados**: Si no hay ingresos en el mes actual
2. **Balance negativo**: Si los gastos superan los ingresos
3. **Gastos elevados**: Si se ha gastado más del 90% de los ingresos
4. **Presupuesto excedido**: Si alguna categoría supera su presupuesto
5. **Excelente gestión**: Si el balance es positivo y el porcentaje gastado es menor al 50%

**Campos de respuesta:**
- `tipo`: Tipo de alerta (`'info'`, `'success'`, `'warning'`, `'error'`)
- `titulo`: Título de la alerta
- `mensaje`: Mensaje descriptivo de la alerta

**Nota:** El array puede estar vacío si no hay alertas que mostrar.

**Errores posibles:**
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
type TipoAlerta = 'info' | 'success' | 'warning' | 'error';

interface AlertaFinanciera {
  tipo: TipoAlerta;
  titulo: string;
  mensaje: string;
}

const getAlertasFinancieras = async (): Promise<AlertaFinanciera[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/dashboard/alertas',
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
    throw new Error(error.error || 'Error al obtener alertas financieras');
  }

  const result = await response.json();
  return result.data;
};
```

---

## 🔧 Funciones Helper para el Frontend

### Función para Formatear Moneda

```typescript
const formatearMoneda = (monto: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(monto);
};

// Ejemplo: formatearMoneda(1234.56) => "1.234,56 €"
```

### Función para Formatear Porcentaje

```typescript
const formatearPorcentaje = (porcentaje: number): string => {
  return `${porcentaje.toFixed(2)}%`;
};

// Ejemplo: formatearPorcentaje(72.02) => "72.02%"
```

### Función para Obtener Color según Tipo de Alerta

```typescript
const getColorAlerta = (tipo: TipoAlerta): string => {
  const colores = {
    info: '#3b82f6',      // Azul
    success: '#10b981',   // Verde
    warning: '#f59e0b',   // Amarillo/Naranja
    error: '#ef4444'      // Rojo
  };
  return colores[tipo];
};
```

### Función para Obtener Icono según Tipo de Alerta

```typescript
const getIconoAlerta = (tipo: TipoAlerta): string => {
  const iconos = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  return iconos[tipo];
};
```

### Función para Formatear Fecha

```typescript
const formatearFecha = (fechaISO: string): string => {
  const fecha = new Date(fechaISO);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(fecha);
};

// Ejemplo: formatearFecha("2024-11-15T10:30:00.000Z") => "15 de noviembre de 2024"
```

### Función para Obtener Nombre del Mes en Español

```typescript
const obtenerNombreMes = (mes: string): string => {
  const meses: { [key: string]: string } = {
    enero: 'Enero',
    febrero: 'Febrero',
    marzo: 'Marzo',
    abril: 'Abril',
    mayo: 'Mayo',
    junio: 'Junio',
    julio: 'Julio',
    agosto: 'Agosto',
    septiembre: 'Septiembre',
    octubre: 'Octubre',
    noviembre: 'Noviembre',
    diciembre: 'Diciembre'
  };
  return meses[mes.toLowerCase()] || mes;
};
```

---

## 📱 Ejemplo de Implementación Completa (React)

```typescript
import { useState, useEffect } from 'react';

// Tipos
interface ResumenMesActual {
  mes: string;
  ingresos: number;
  gastos: number;
  balance: number;
  porcentajeGastado: number;
}

interface GastoReciente {
  _id: string;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
  mes: string;
}

interface GastoPorCategoria {
  categoria: string;
  monto: number;
  porcentaje: number;
}

interface AlertaFinanciera {
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
}

// Componente Dashboard
const Dashboard = () => {
  const [resumen, setResumen] = useState<ResumenMesActual | null>(null);
  const [gastosRecientes, setGastosRecientes] = useState<GastoReciente[]>([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<GastoPorCategoria[]>([]);
  const [alertas, setAlertas] = useState<AlertaFinanciera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Cargar todos los datos en paralelo
        const [resumenRes, gastosRes, categoriasRes, alertasRes] = await Promise.all([
          fetch('http://localhost:4444/api/dashboard/resumen', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:4444/api/dashboard/gastos-recientes', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:4444/api/dashboard/gastos-categoria', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:4444/api/dashboard/alertas', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const resumenData = await resumenRes.json();
        const gastosData = await gastosRes.json();
        const categoriasData = await categoriasRes.json();
        const alertasData = await alertasRes.json();

        setResumen(resumenData.data);
        setGastosRecientes(gastosData.data);
        setGastosPorCategoria(categoriasData.data);
        setAlertas(alertasData.data);
      } catch (error) {
        console.error('Error al cargar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, []);

  if (loading) {
    return <div>Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard Financiero</h1>
      
      {/* Resumen del mes */}
      {resumen && (
        <div className="resumen">
          <h2>Resumen de {resumen.mes}</h2>
          <p>Ingresos: {resumen.ingresos.toFixed(2)}€</p>
          <p>Gastos: {resumen.gastos.toFixed(2)}€</p>
          <p>Balance: {resumen.balance.toFixed(2)}€</p>
          <p>Porcentaje gastado: {resumen.porcentajeGastado.toFixed(2)}%</p>
        </div>
      )}

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="alertas">
          <h2>Alertas</h2>
          {alertas.map((alerta, index) => (
            <div key={index} className={`alerta alerta-${alerta.tipo}`}>
              <h3>{alerta.titulo}</h3>
              <p>{alerta.mensaje}</p>
            </div>
          ))}
        </div>
      )}

      {/* Gastos por categoría */}
      {gastosPorCategoria.length > 0 && (
        <div className="gastos-categoria">
          <h2>Top 3 Categorías</h2>
          {gastosPorCategoria.map((item, index) => (
            <div key={index}>
              <p>{item.categoria}: {item.monto.toFixed(2)}€ ({item.porcentaje.toFixed(2)}%)</p>
            </div>
          ))}
        </div>
      )}

      {/* Gastos recientes */}
      {gastosRecientes.length > 0 && (
        <div className="gastos-recientes">
          <h2>Gastos Recientes</h2>
          {gastosRecientes.map((gasto) => (
            <div key={gasto._id}>
              <p>{gasto.descripcion} - {gasto.monto.toFixed(2)}€ ({gasto.categoria})</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
```

---

## 🎨 Ejemplo de Implementación con Vue.js

```vue
<template>
  <div class="dashboard">
    <h1>Dashboard Financiero</h1>
    
    <!-- Resumen del mes -->
    <div v-if="resumen" class="resumen">
      <h2>Resumen de {{ resumen.mes }}</h2>
      <p>Ingresos: {{ resumen.ingresos.toFixed(2) }}€</p>
      <p>Gastos: {{ resumen.gastos.toFixed(2) }}€</p>
      <p>Balance: {{ resumen.balance.toFixed(2) }}€</p>
      <p>Porcentaje gastado: {{ resumen.porcentajeGastado.toFixed(2) }}%</p>
    </div>

    <!-- Alertas -->
    <div v-if="alertas.length > 0" class="alertas">
      <h2>Alertas</h2>
      <div 
        v-for="(alerta, index) in alertas" 
        :key="index" 
        :class="['alerta', `alerta-${alerta.tipo}`]"
      >
        <h3>{{ alerta.titulo }}</h3>
        <p>{{ alerta.mensaje }}</p>
      </div>
    </div>

    <!-- Gastos por categoría -->
    <div v-if="gastosPorCategoria.length > 0" class="gastos-categoria">
      <h2>Top 3 Categorías</h2>
      <div v-for="(item, index) in gastosPorCategoria" :key="index">
        <p>{{ item.categoria }}: {{ item.monto.toFixed(2) }}€ ({{ item.porcentaje.toFixed(2) }}%)</p>
      </div>
    </div>

    <!-- Gastos recientes -->
    <div v-if="gastosRecientes.length > 0" class="gastos-recientes">
      <h2>Gastos Recientes</h2>
      <div v-for="gasto in gastosRecientes" :key="gasto._id">
        <p>{{ gasto.descripcion }} - {{ gasto.monto.toFixed(2) }}€ ({{ gasto.categoria }})</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface ResumenMesActual {
  mes: string;
  ingresos: number;
  gastos: number;
  balance: number;
  porcentajeGastado: number;
}

interface GastoReciente {
  _id: string;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
  mes: string;
}

interface GastoPorCategoria {
  categoria: string;
  monto: number;
  porcentaje: number;
}

interface AlertaFinanciera {
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
}

const resumen = ref<ResumenMesActual | null>(null);
const gastosRecientes = ref<GastoReciente[]>([]);
const gastosPorCategoria = ref<GastoPorCategoria[]>([]);
const alertas = ref<AlertaFinanciera[]>([]);

const cargarDashboard = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const [resumenRes, gastosRes, categoriasRes, alertasRes] = await Promise.all([
      fetch('http://localhost:4444/api/dashboard/resumen', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:4444/api/dashboard/gastos-recientes', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:4444/api/dashboard/gastos-categoria', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:4444/api/dashboard/alertas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    const resumenData = await resumenRes.json();
    const gastosData = await gastosRes.json();
    const categoriasData = await categoriasRes.json();
    const alertasData = await alertasRes.json();

    resumen.value = resumenData.data;
    gastosRecientes.value = gastosData.data;
    gastosPorCategoria.value = categoriasData.data;
    alertas.value = alertasData.data;
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
  }
};

onMounted(() => {
  cargarDashboard();
});
</script>
```

---

## 🔄 Manejo de Errores

### Ejemplo de Manejo de Errores Global

```typescript
const manejarErrorDashboard = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    }
    if (error.message.includes('500')) {
      return 'Error del servidor. Por favor, intenta más tarde.';
    }
    return error.message;
  }
  return 'Error desconocido al cargar el dashboard';
};
```

---

## 📊 Consideraciones de Rendimiento

1. **Carga paralela**: Cargar todos los endpoints en paralelo usando `Promise.all()` para mejor rendimiento
2. **Caché**: Considerar implementar caché en el frontend para evitar llamadas innecesarias
3. **Actualización**: Actualizar el dashboard periódicamente o después de acciones importantes (crear gasto, ingreso, etc.)
4. **Loading states**: Mostrar estados de carga mientras se obtienen los datos

---

## ✅ Checklist de Integración

- [ ] Configurar base URL del backend
- [ ] Implementar función de autenticación (obtener token)
- [ ] Crear funciones para cada endpoint
- [ ] Implementar manejo de errores
- [ ] Crear componentes de UI para mostrar los datos
- [ ] Implementar funciones helper (formateo, colores, etc.)
- [ ] Agregar estados de carga
- [ ] Probar todos los endpoints
- [ ] Manejar casos edge (sin datos, errores, etc.)
- [ ] Optimizar rendimiento (carga paralela, caché)

---

## 📝 Notas Adicionales

- Todos los cálculos se realizan en el backend, el frontend solo muestra los datos
- El mes actual se detecta automáticamente en el backend
- Las alertas se generan dinámicamente según la situación financiera
- Los datos están siempre filtrados por usuario (usando el token JWT)
- Los montos se devuelven como números, formatear en el frontend según necesidad
- Las fechas se devuelven en formato ISO 8601

---

## 🔗 Endpoints Relacionados

Para una experiencia completa del dashboard, también puedes usar:
- `/api/ingresos/:mes` - Obtener ingresos del mes
- `/api/gastos/:mes` - Obtener gastos del mes
- `/api/presupuestos/:mes` - Obtener presupuestos del mes
- `/api/categorias` - Obtener categorías disponibles

---

**Última actualización:** Noviembre 2024

