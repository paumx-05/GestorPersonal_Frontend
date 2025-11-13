# Integración Endpoints: Presupuestos

## Objetivo
Crear todas las rutas REST API necesarias para la gestión de presupuestos mensuales por categorías, permitiendo crear/actualizar presupuestos con montos o porcentajes, calcular totales y obtener resúmenes con distribución.

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos (Modelo `Presupuesto` ya existe)
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

### Paso 1: Crear Controlador de Presupuestos

**Archivo a crear:** `src/controllers/presupuesto.controller.ts`

**Funciones a implementar:**

```typescript
// Obtener todos los presupuestos de un mes
export const getPresupuestosByMes = async (req: AuthRequest, res: Response): Promise<void>

// Crear o actualizar un presupuesto (upsert)
export const createOrUpdatePresupuesto = async (req: AuthRequest, res: Response): Promise<void>

// Actualizar un presupuesto existente
export const updatePresupuesto = async (req: AuthRequest, res: Response): Promise<void>

// Eliminar presupuesto por mes y categoría
export const deletePresupuesto = async (req: AuthRequest, res: Response): Promise<void>

// Obtener total presupuestado del mes
export const getTotalPresupuestosByMes = async (req: AuthRequest, res: Response): Promise<void>

// Obtener resumen con distribución y porcentajes
export const getResumenPresupuestos = async (req: AuthRequest, res: Response): Promise<void>
```

**Lógica especial de cada función:**
- `getPresupuestosByMes`: Filtrar por `userId` y `mes`, calcular porcentajes si `totalIngresos` está disponible
- `createOrUpdatePresupuesto`: Usar `findOneAndUpdate` con `upsert: true` para crear o actualizar según mes y categoría
- `updatePresupuesto`: Actualizar presupuesto existente por ID
- `deletePresupuesto`: Eliminar por `mes` y `categoria` (no por ID)
- `getTotalPresupuestosByMes`: Sumar todos los montos presupuestados del mes
- `getResumenPresupuestos`: Obtener todos los presupuestos con cálculos de porcentajes y distribución

**Lógica de conversión monto ↔ porcentaje:**
```typescript
// Si se envía monto, calcular porcentaje
if (monto && totalIngresos > 0) {
  porcentaje = (monto / totalIngresos) * 100;
}

// Si se envía porcentaje, calcular monto
if (porcentaje && totalIngresos > 0) {
  monto = (porcentaje / 100) * totalIngresos;
}
```

**Validaciones:**
- `mes`: Debe ser uno de los 12 meses válidos
- `categoria`: Requerido, string no vacío
- `monto`: Requerido si no se envía porcentaje, número >= 0
- `porcentaje`: Opcional, número entre 0 y 100
- `totalIngresos`: Requerido para calcular porcentajes
- Validar que al menos `monto` o `porcentaje` esté presente

---

### Paso 2: Crear Rutas de Presupuestos

**Archivo a crear:** `src/routes/presupuesto.routes.ts`

**Endpoints a implementar:**

```typescript
GET    /api/presupuestos/:mes                    - Obtener todos los presupuestos de un mes
POST   /api/presupuestos                          - Crear/actualizar un presupuesto (upsert)
PUT    /api/presupuestos/:id                      - Actualizar un presupuesto existente
DELETE /api/presupuestos/:mes/:categoria          - Eliminar presupuesto por mes y categoría
GET    /api/presupuestos/:mes/total               - Obtener total presupuestado del mes
GET    /api/presupuestos/:mes/resumen              - Obtener resumen con distribución y porcentajes
```

**Estructura de rutas:**

```typescript
import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import * as presupuestoController from '../controllers/presupuesto.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/:mes', authenticate, presupuestoController.getPresupuestosByMes);
router.post('/', authenticate, presupuestoController.createOrUpdatePresupuesto);
router.put('/:id', authenticate, presupuestoController.updatePresupuesto);
router.delete('/:mes/:categoria', authenticate, presupuestoController.deletePresupuesto);
router.get('/:mes/total', authenticate, presupuestoController.getTotalPresupuestosByMes);
router.get('/:mes/resumen', authenticate, presupuestoController.getResumenPresupuestos);

export default router;
```

---

### Paso 3: Validaciones y Lógica de Negocio

**Validaciones a implementar:**

```typescript
// Validar mes
const mesesValidos = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
if (!mesesValidos.includes(mes)) {
  res.status(400).json({
    success: false,
    error: 'Mes inválido'
  });
  return;
}

// Validar que monto o porcentaje esté presente
if (!monto && !porcentaje) {
  res.status(400).json({
    success: false,
    error: 'Debe proporcionar monto o porcentaje'
  });
  return;
}

// Validar totalIngresos para calcular porcentajes
if (!totalIngresos || totalIngresos <= 0) {
  res.status(400).json({
    success: false,
    error: 'totalIngresos es requerido y debe ser mayor a 0'
  });
  return;
}

// Validar porcentaje
if (porcentaje !== undefined && (porcentaje < 0 || porcentaje > 100)) {
  res.status(400).json({
    success: false,
    error: 'El porcentaje debe estar entre 0 y 100'
  });
  return;
}
```

**Lógica de upsert:**

```typescript
// Usar findOneAndUpdate con upsert para crear o actualizar
const presupuesto = await Presupuesto.findOneAndUpdate(
  { userId, mes, categoria },
  {
    userId,
    mes,
    categoria,
    monto,
    porcentaje,
    totalIngresos
  },
  {
    new: true,
    upsert: true,
    runValidators: true
  }
);
```

**Manejo de errores:**
- Usar try-catch en todas las funciones async
- Respuestas consistentes: `{ success: boolean, data?: any, error?: string, message?: string }`
- Códigos HTTP apropiados: 200 (éxito), 201 (creado), 400 (bad request), 401 (no autorizado), 404 (no encontrado), 500 (error servidor)

---

### Paso 4: Integrar Rutas en Server

**Archivo a modificar:** `src/server.ts`

**Cambios a realizar:**

```typescript
// 1. Importar las rutas
import { presupuestoRoutes } from './routes/presupuesto.routes';

// 2. Agregar después de las rutas existentes
app.use('/api/presupuestos', presupuestoRoutes);

// 3. Actualizar endpoint raíz con nueva ruta
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
      presupuestos: '/api/presupuestos',  // ← Agregar esta línea
      example: '/api/example'
    },
    timestamp: new Date().toISOString()
  });
});
```

---

### Paso 5: Testing y Documentación

**Testing con Postman/Thunder Client:**

1. **Obtener presupuestos del mes:**
   ```
   GET http://localhost:4444/api/presupuestos/noviembre
   Headers: Authorization: Bearer <token>
   ```

2. **Crear/actualizar presupuesto con monto:**
   ```
   POST http://localhost:4444/api/presupuestos
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "mes": "noviembre",
     "categoria": "Alimentación",
     "monto": 500,
     "totalIngresos": 2500
   }
   ```

3. **Crear/actualizar presupuesto con porcentaje:**
   ```
   POST http://localhost:4444/api/presupuestos
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "mes": "noviembre",
     "categoria": "Transporte",
     "porcentaje": 20,
     "totalIngresos": 2500
   }
   ```

4. **Actualizar presupuesto existente:**
   ```
   PUT http://localhost:4444/api/presupuestos/:id
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "monto": 600,
     "totalIngresos": 2500
   }
   ```

5. **Eliminar presupuesto:**
   ```
   DELETE http://localhost:4444/api/presupuestos/noviembre/Alimentación
   Headers: Authorization: Bearer <token>
   ```

6. **Obtener total presupuestado:**
   ```
   GET http://localhost:4444/api/presupuestos/noviembre/total
   Headers: Authorization: Bearer <token>
   ```

7. **Obtener resumen con distribución:**
   ```
   GET http://localhost:4444/api/presupuestos/noviembre/resumen
   Headers: Authorization: Bearer <token>
   ```

**Estructura de respuestas esperadas:**

```typescript
// GET /api/presupuestos/:mes
{
  success: true,
  data: [
    {
      _id: string,
      userId: string,
      mes: string,
      categoria: string,
      monto: number,
      porcentaje?: number,
      totalIngresos: number,
      createdAt: string (ISO)
    }
  ]
}

// POST /api/presupuestos (con monto)
{
  success: true,
  data: {
    _id: string,
    mes: string,
    categoria: string,
    monto: 500,
    porcentaje: 20,  // Calculado automáticamente
    totalIngresos: 2500,
    createdAt: string (ISO)
  },
  message: "Presupuesto creado/actualizado exitosamente"
}

// GET /api/presupuestos/:mes/total
{
  success: true,
  data: {
    mes: string,
    total: number
  }
}

// GET /api/presupuestos/:mes/resumen
{
  success: true,
  data: {
    mes: string,
    totalIngresos: number,
    totalPresupuestado: number,
    ahorro: number,
    porcentajePresupuestado: number,
    presupuestos: [
      {
        categoria: string,
        monto: number,
        porcentaje: number
      }
    ]
  }
}
```

---

## 📁 Estructura de Archivos

```
src/
├── controllers/
│   └── presupuesto.controller.ts    ✅ (nuevo)
├── routes/
│   └── presupuesto.routes.ts        ✅ (nuevo)
├── models/
│   └── Presupuesto.model.ts          ✅ (ya existe)
└── server.ts                         ✅ (modificar - registrar rutas)
```

---

## 📝 Notas Técnicas

- Todas las rutas protegidas con middleware `authenticate`
- Usar `AuthRequest` para acceder a `req.user.userId`
- Validar que el mes esté en el enum del modelo
- Usar `findOneAndUpdate` con `upsert: true` para crear/actualizar
- Calcular automáticamente porcentaje si se envía monto
- Calcular automáticamente monto si se envía porcentaje
- El índice único compuesto `{ userId, mes, categoria }` previene duplicados
- Verificar que el usuario solo acceda a sus propios presupuestos
- El campo `totalIngresos` se usa como referencia para calcular porcentajes
- Manejar errores con try-catch y respuestas consistentes

---

## ✅ Checklist de Verificación

- [ ] Controlador creado con todas las funciones
- [ ] Lógica de conversión monto ↔ porcentaje implementada
- [ ] Rutas creadas y conectadas al controlador
- [ ] Todas las rutas protegidas con middleware `authenticate`
- [ ] Validaciones implementadas
- [ ] Upsert funcionando correctamente
- [ ] Manejo de errores consistente
- [ ] Rutas registradas en `server.ts`
- [ ] Endpoint raíz actualizado
- [ ] Testing completo con Postman/Thunder Client
- [ ] Verificar creación con monto y con porcentaje
- [ ] Verificar cálculos automáticos correctos
- [ ] Verificar que usuarios solo accedan a sus propios presupuestos
- [ ] Documentación de endpoints completa


