# Integración Backend 1: Rutas de Gestión Financiera

## Objetivo
Crear todas las rutas REST API necesarias para soportar las funcionalidades del Milestone 2 del frontend, incluyendo gestión de gastos, ingresos, presupuestos, categorías y dashboard.

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos
- **Express.js**: Framework web
- **TypeScript**: Lenguaje de programación
- **REST API**: Estándares REST con métodos HTTP apropiados

### Estándares API
- Métodos HTTP correctos (GET, POST, PUT, DELETE)
- Nomenclatura consistente de endpoints
- Respuestas JSON estructuradas
- Códigos de estado HTTP apropiados
- Autenticación con JWT en todas las rutas protegidas

---

## 📝 Pasos de Implementación

### Paso 1: Crear Rutas y Controladores de Gastos

**Archivos a crear:**
- `src/controllers/gasto.controller.ts`
- `src/routes/gasto.routes.ts`

**Endpoints a implementar:**

```
GET    /api/gastos/:mes                    - Obtener todos los gastos de un mes
POST   /api/gastos                          - Crear un nuevo gasto
PUT    /api/gastos/:id                      - Actualizar un gasto existente
DELETE /api/gastos/:id                      - Eliminar un gasto
GET    /api/gastos/:mes/total               - Obtener total de gastos del mes
GET    /api/gastos/:mes/categoria/:categoria - Obtener gastos por categoría
```

**Funciones del controlador:**
- `getGastosByMes`: Obtener gastos filtrados por mes y userId
- `createGasto`: Crear nuevo gasto con validaciones
- `updateGasto`: Actualizar gasto existente (solo del usuario autenticado)
- `deleteGasto`: Eliminar gasto (solo del usuario autenticado)
- `getTotalGastosByMes`: Calcular total de gastos del mes
- `getGastosByCategoria`: Filtrar gastos por categoría

**Validaciones necesarias:**
- `mes`: Debe ser uno de los 12 meses válidos (enum del modelo)
- `descripcion`: Requerido, string no vacío
- `monto`: Requerido, número mayor a 0
- `fecha`: Requerido, fecha válida
- `categoria`: Requerido, string no vacío
- `userId`: Se obtiene automáticamente del token JWT

**Estructura de respuesta:**
```typescript
// GET /api/gastos/:mes
{
  success: true,
  data: [
    {
      id: string,
      descripcion: string,
      monto: number,
      fecha: string (ISO),
      categoria: string,
      mes: string,
      dividido?: Array,
      createdAt: string (ISO)
    }
  ],
  total?: number
}

// POST /api/gastos
{
  success: true,
  data: { /* objeto gasto creado */ },
  message: "Gasto creado exitosamente"
}
```

**Notas técnicas:**
- Todas las rutas protegidas con middleware `authenticate`
- Usar `AuthRequest` para acceder a `req.user.userId`
- Validar que el mes esté en el enum: `['enero', 'febrero', ..., 'diciembre']`
- Ordenar gastos por fecha (más antiguos primero)
- Manejar errores con try-catch y respuestas consistentes

---

### Paso 2: Crear Rutas y Controladores de Ingresos

**Archivos a crear:**
- `src/controllers/ingreso.controller.ts`
- `src/routes/ingreso.routes.ts`

**Endpoints a implementar:**

```
GET    /api/ingresos/:mes                    - Obtener todos los ingresos de un mes
POST   /api/ingresos                         - Crear un nuevo ingreso
PUT    /api/ingresos/:id                     - Actualizar un ingreso existente
DELETE /api/ingresos/:id                     - Eliminar un ingreso
GET    /api/ingresos/:mes/total              - Obtener total de ingresos del mes
GET    /api/ingresos/:mes/categoria/:categoria - Obtener ingresos por categoría
```

**Funciones del controlador:**
- `getIngresosByMes`: Obtener ingresos filtrados por mes y userId
- `createIngreso`: Crear nuevo ingreso con validaciones
- `updateIngreso`: Actualizar ingreso existente (solo del usuario autenticado)
- `deleteIngreso`: Eliminar ingreso (solo del usuario autenticado)
- `getTotalIngresosByMes`: Calcular total de ingresos del mes
- `getIngresosByCategoria`: Filtrar ingresos por categoría

**Validaciones necesarias:**
- Mismas validaciones que gastos (mes, descripcion, monto, fecha, categoria)
- `userId`: Se obtiene automáticamente del token JWT

**Estructura de respuesta:**
```typescript
// Similar a gastos pero para ingresos
{
  success: true,
  data: [ /* array de ingresos */ ],
  total?: number
}
```

**Notas técnicas:**
- Seguir el mismo patrón que gastos.controller.ts
- Reutilizar lógica de validación donde sea posible
- Mantener consistencia en nombres de funciones y respuestas

---

### Paso 3: Crear Rutas y Controladores de Presupuestos

**Archivos a crear:**
- `src/controllers/presupuesto.controller.ts`
- `src/routes/presupuesto.routes.ts`

**Endpoints a implementar:**

```
GET    /api/presupuestos/:mes                    - Obtener todos los presupuestos de un mes
POST   /api/presupuestos                          - Crear/actualizar un presupuesto
PUT    /api/presupuestos/:id                      - Actualizar un presupuesto existente
DELETE /api/presupuestos/:mes/:categoria          - Eliminar presupuesto por mes y categoría
GET    /api/presupuestos/:mes/total               - Obtener total presupuestado del mes
GET    /api/presupuestos/:mes/resumen              - Obtener resumen con distribución y porcentajes
```

**Funciones del controlador:**
- `getPresupuestosByMes`: Obtener presupuestos del mes con cálculos de porcentaje
- `createOrUpdatePresupuesto`: Crear o actualizar presupuesto (usar upsert)
- `updatePresupuesto`: Actualizar presupuesto existente
- `deletePresupuesto`: Eliminar presupuesto por mes y categoría
- `getTotalPresupuestosByMes`: Calcular total presupuestado
- `getResumenPresupuestos`: Obtener resumen completo con distribución y porcentajes

**Validaciones necesarias:**
- `mes`: Debe ser uno de los 12 meses válidos
- `categoria`: Requerido, string no vacío
- `monto`: Requerido si no se envía porcentaje, número >= 0
- `porcentaje`: Opcional, número entre 0 y 100
- `totalIngresos`: Requerido para calcular porcentajes
- Validar que `monto + porcentaje` no exceda límites razonables
- Si se envía `porcentaje`, calcular `monto` automáticamente
- Si se envía `monto`, calcular `porcentaje` automáticamente

**Lógica especial:**
- Usar `findOneAndUpdate` con `upsert: true` para crear/actualizar
- Calcular porcentaje: `(monto / totalIngresos) * 100`
- Calcular monto: `(porcentaje / 100) * totalIngresos`
- Validar que la suma de porcentajes no exceda 100% (opcional, solo warning)

**Estructura de respuesta:**
```typescript
// GET /api/presupuestos/:mes
{
  success: true,
  data: [
    {
      id: string,
      mes: string,
      categoria: string,
      monto: number,
      porcentaje: number,
      totalIngresos: number,
      createdAt: string (ISO)
    }
  ],
  total: number,
  totalPorcentaje: number
}

// GET /api/presupuestos/:mes/resumen
{
  success: true,
  data: {
    presupuestos: [ /* array de presupuestos */ ],
    totalPresupuestado: number,
    totalIngresos: number,
    ahorro: number,
    porcentajePresupuestado: number,
    distribucion: [
      {
        categoria: string,
        monto: number,
        porcentaje: number
      }
    ]
  }
}
```

**Notas técnicas:**
- El modelo tiene índice único compuesto: `userId + mes + categoria`
- Manejar error de duplicado al crear presupuesto existente
- Actualizar `totalIngresos` cuando cambien los ingresos del mes

---

### Paso 4: Crear Rutas y Controladores de Categorías

**Archivos a crear:**
- `src/controllers/categoria.controller.ts`
- `src/routes/categoria.routes.ts`

**Endpoints a implementar:**

```
GET    /api/categorias                    - Obtener todas las categorías del usuario
GET    /api/categorias/:tipo              - Obtener categorías por tipo (gastos/ingresos/ambos)
POST   /api/categorias                    - Crear una nueva categoría
PUT    /api/categorias/:id                - Actualizar una categoría existente
DELETE /api/categorias/:id                - Eliminar una categoría
GET    /api/categorias/nombres/:tipo      - Obtener solo nombres de categorías por tipo
```

**Funciones del controlador:**
- `getCategorias`: Obtener todas las categorías del usuario
- `getCategoriasByTipo`: Filtrar categorías por tipo
- `createCategoria`: Crear nueva categoría con validación de duplicados
- `updateCategoria`: Actualizar categoría existente
- `deleteCategoria`: Eliminar categoría (validar que no esté en uso)
- `getNombresCategoriasByTipo`: Obtener solo array de nombres

**Validaciones necesarias:**
- `nombre`: Requerido, string no vacío, único por usuario
- `tipo`: Requerido, debe ser 'gastos', 'ingresos' o 'ambos'
- Validar que el nombre no esté duplicado para el mismo usuario
- Antes de eliminar, verificar que no esté en uso:
  - No debe tener gastos asociados
  - No debe tener ingresos asociados
  - No debe tener presupuestos asociados

**Categorías por defecto:**
- Si el usuario no tiene categorías, inicializar con categorías predefinidas:
  - **Gastos**: Alimentación, Transporte, Vivienda, Servicios, Entretenimiento, Salud, Educación, Compras, Restaurantes, Otros
  - **Ingresos**: Salario, Freelance, Inversiones, Ventas, Alquileres, Regalos, Otros

**Estructura de respuesta:**
```typescript
// GET /api/categorias
{
  success: true,
  data: [
    {
      id: string,
      nombre: string,
      tipo: 'gastos' | 'ingresos' | 'ambos',
      createdAt: string (ISO)
    }
  ]
}

// GET /api/categorias/nombres/:tipo
{
  success: true,
  data: ['Alimentación', 'Transporte', 'Vivienda', ...]
}
```

**Notas técnicas:**
- El modelo tiene índice único compuesto: `userId + nombre`
- Manejar error de duplicado al crear categoría existente
- Función helper para verificar si categoría está en uso antes de eliminar
- Inicializar categorías por defecto en `getCategorias` si el usuario no tiene ninguna

---

### Paso 5: Crear Rutas de Dashboard y Registrar Todas las Rutas

**Archivos a crear:**
- `src/controllers/dashboard.controller.ts`
- `src/routes/dashboard.routes.ts`

**Archivos a modificar:**
- `src/server.ts` - Registrar todas las nuevas rutas

**Endpoints a implementar:**

```
GET    /api/dashboard/:mes                          - Obtener resumen completo del mes
GET    /api/dashboard/:mes/metricas                 - Obtener métricas del mes
GET    /api/dashboard/:mes/gastos-recientes         - Obtener gastos recientes (últimos 7)
GET    /api/dashboard/:mes/distribucion-categorias  - Obtener distribución de gastos por categorías
```

**Funciones del controlador:**
- `getDashboardResumen`: Resumen completo del mes (agregar datos de múltiples fuentes)
- `getMetricas`: Métricas del mes (ingresos, gastos, balance, porcentajes, comparación)
- `getGastosRecientes`: Últimos 7 gastos del mes ordenados por fecha
- `getDistribucionCategorias`: Distribución de gastos agrupados por categoría

**Datos a agregar en `getDashboardResumen`:**
- Total de ingresos del mes
- Total de gastos del mes
- Balance (ingresos - gastos)
- Porcentaje gastado (gastos / ingresos * 100)
- Lista de gastos recientes (últimos 7)
- Distribución de gastos por categorías (top 3)
- Presupuestos configurados
- Comparación con mes anterior (opcional)

**Datos a incluir en `getMetricas`:**
- Ingresos del mes actual
- Gastos del mes actual
- Balance del mes actual
- Porcentaje gastado
- Comparación con mes anterior:
  - Cambio en ingresos (monto y porcentaje)
  - Cambio en gastos (monto y porcentaje)
  - Cambio en balance (monto y porcentaje)

**Estructura de respuesta:**
```typescript
// GET /api/dashboard/:mes
{
  success: true,
  data: {
    mes: string,
    ingresos: {
      total: number,
      cantidad: number
    },
    gastos: {
      total: number,
      cantidad: number
    },
    balance: number,
    porcentajeGastado: number,
    gastosRecientes: [ /* últimos 7 gastos */ ],
    distribucionCategorias: [
      {
        categoria: string,
        total: number,
        porcentaje: number
      }
    ],
    presupuestos: {
      total: number,
      cantidad: number,
      porcentajePresupuestado: number
    }
  }
}

// GET /api/dashboard/:mes/metricas
{
  success: true,
  data: {
    mesActual: {
      ingresos: number,
      gastos: number,
      balance: number,
      porcentajeGastado: number
    },
    mesAnterior: {
      ingresos: number,
      gastos: number,
      balance: number
    },
    comparacion: {
      ingresos: {
        cambio: number,
        porcentaje: number,
        tendencia: 'up' | 'down'
      },
      gastos: {
        cambio: number,
        porcentaje: number,
        tendencia: 'up' | 'down'
      },
      balance: {
        cambio: number,
        porcentaje: number,
        tendencia: 'up' | 'down'
      }
    }
  }
}
```

**Modificaciones en `server.ts`:**
```typescript
// Agregar imports
import { gastoRoutes } from './routes/gasto.routes';
import { ingresoRoutes } from './routes/ingreso.routes';
import { presupuestoRoutes } from './routes/presupuesto.routes';
import { categoriaRoutes } from './routes/categoria.routes';
import { dashboardRoutes } from './routes/dashboard.routes';

// Agregar rutas después de las rutas existentes
app.use('/api/gastos', gastoRoutes);
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/presupuestos', presupuestoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Actualizar endpoint raíz con nuevas rutas
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Bienvenido al API del Gestor Backend',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      gastos: '/api/gastos',
      ingresos: '/api/ingresos',
      presupuestos: '/api/presupuestos',
      categorias: '/api/categorias',
      dashboard: '/api/dashboard',
      example: '/api/example'
    },
    timestamp: new Date().toISOString()
  });
});
```

**Notas técnicas:**
- Optimizar consultas para evitar múltiples llamadas a la BD
- Usar `Promise.all()` para consultas paralelas cuando sea posible
- Calcular mes anterior basándose en el mes actual
- Manejar casos donde no hay datos del mes anterior
- Ordenar gastos recientes por fecha descendente (más recientes primero)

---

## 📁 Estructura de Archivos a Crear

```
src/
├── controllers/
│   ├── gasto.controller.ts          ✅ (nuevo)
│   ├── ingreso.controller.ts         ✅ (nuevo)
│   ├── presupuesto.controller.ts    ✅ (nuevo)
│   ├── categoria.controller.ts       ✅ (nuevo)
│   └── dashboard.controller.ts       ✅ (nuevo)
│
├── routes/
│   ├── gasto.routes.ts               ✅ (nuevo)
│   ├── ingreso.routes.ts            ✅ (nuevo)
│   ├── presupuesto.routes.ts        ✅ (nuevo)
│   ├── categoria.routes.ts           ✅ (nuevo)
│   └── dashboard.routes.ts           ✅ (nuevo)
│
└── server.ts                         ✅ (modificar - registrar rutas)
```

---

## ✅ Checklist de Verificación

### Validaciones Generales
- [ ] Todas las rutas protegidas con middleware `authenticate`
- [ ] Validación de datos de entrada en todos los endpoints
- [ ] Manejo de errores consistente con try-catch
- [ ] Respuestas JSON estructuradas con `success`, `data`, `error`, `message`
- [ ] Códigos de estado HTTP correctos (200, 201, 400, 401, 404, 500)
- [ ] `userId` se obtiene automáticamente del token JWT
- [ ] Validación de que los recursos pertenecen al usuario autenticado

### Validaciones Específicas
- [ ] Validar que `mes` esté en el enum de 12 meses
- [ ] Validar campos requeridos (descripcion, monto, fecha, categoria)
- [ ] Validar que `monto` sea mayor a 0
- [ ] Validar que `fecha` sea una fecha válida
- [ ] Validar que `categoria` no esté vacía
- [ ] Validar que `tipo` de categoría sea válido ('gastos', 'ingresos', 'ambos')
- [ ] Validar que nombres de categorías no estén duplicados por usuario
- [ ] Validar que porcentajes de presupuestos estén entre 0 y 100

### Funcionalidades
- [ ] CRUD completo de gastos funcionando
- [ ] CRUD completo de ingresos funcionando
- [ ] CRUD completo de presupuestos funcionando
- [ ] CRUD completo de categorías funcionando
- [ ] Dashboard con resumen completo funcionando
- [ ] Cálculo de totales funcionando
- [ ] Filtrado por mes funcionando
- [ ] Filtrado por categoría funcionando
- [ ] Cálculo de porcentajes en presupuestos funcionando
- [ ] Inicialización de categorías por defecto funcionando

### Integración
- [ ] Todas las rutas registradas en `server.ts`
- [ ] Endpoint raíz actualizado con nuevas rutas
- [ ] Sin errores de compilación TypeScript
- [ ] Sin errores de linting
- [ ] Servidor inicia correctamente

---

## 📝 Notas Técnicas

### Patrón de Código a Seguir

**Estructura de controlador:**
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Modelo } from '../models/Modelo.model';

export const funcionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validaciones
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Lógica de negocio
    // ...

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      data: /* datos */
    });
  } catch (error: any) {
    console.error('Error en funcionController:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud'
    });
  }
};
```

**Estructura de rutas:**
```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as controller from '../controllers/controller.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Definir rutas
router.get('/:mes', controller.getByMes);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as controllerRoutes };
```

### Validación de Meses

Crear función helper para validar meses:
```typescript
const MESES_VALIDOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const validarMes = (mes: string): boolean => {
  return MESES_VALIDOS.includes(mes.toLowerCase());
};
```

### Cálculo de Mes Anterior

Función helper para obtener mes anterior:
```typescript
const obtenerMesAnterior = (mes: string): string => {
  const indice = MESES_VALIDOS.indexOf(mes.toLowerCase());
  if (indice === 0) {
    return MESES_VALIDOS[11]; // Diciembre del año anterior
  }
  return MESES_VALIDOS[indice - 1];
};
```

### Manejo de Errores

- Errores de validación: 400 Bad Request
- Errores de autenticación: 401 Unauthorized
- Recursos no encontrados: 404 Not Found
- Errores de servidor: 500 Internal Server Error
- Conflictos (duplicados): 409 Conflict

### Respuestas Consistentes

**Éxito:**
```typescript
{
  success: true,
  data: { /* datos */ },
  message?: string
}
```

**Error:**
```typescript
{
  success: false,
  error: string,
  message?: string
}
```

---

## 🚀 Orden de Implementación Recomendado

1. **Paso 1**: Gastos (base para entender el patrón)
2. **Paso 2**: Ingresos (similar a gastos, refuerza el patrón)
3. **Paso 4**: Categorías (necesario para validaciones de gastos/ingresos)
4. **Paso 3**: Presupuestos (usa categorías y requiere lógica más compleja)
5. **Paso 5**: Dashboard (agrega datos de todos los anteriores)

---

## 📚 Referencias

- Modelos existentes: `src/models/Gasto.model.ts`, `Ingreso.model.ts`, `Presupuesto.model.ts`, `Categoria.model.ts`
- Controladores de referencia: `src/controllers/auth.controller.ts`, `user.controller.ts`
- Middleware de autenticación: `src/middleware/auth.middleware.ts`
- Rutas de referencia: `src/routes/auth.routes.ts`, `users.routes.ts`

---

## 🎯 Criterios de Aceptación

- ✅ Todas las rutas implementadas y funcionando
- ✅ Validaciones completas en todos los endpoints
- ✅ Autenticación funcionando en todas las rutas protegidas
- ✅ Respuestas JSON consistentes
- ✅ Códigos de estado HTTP correctos
- ✅ Sin errores de compilación
- ✅ Servidor inicia correctamente
- ✅ Endpoints documentados en código (comentarios)
- ✅ Código simple y fácil de entender (junior-level)
- ✅ Arquitectura MVC respetada

---

## 📝 Próximos Pasos (Fuera de este Milestone)

- Agregar paginación en listados largos
- Implementar búsqueda y filtros avanzados
- Agregar validación de esquemas con Joi o Zod
- Implementar tests unitarios
- Agregar documentación con Swagger/OpenAPI
- Optimizar consultas con índices adicionales
- Implementar caché para consultas frecuentes

