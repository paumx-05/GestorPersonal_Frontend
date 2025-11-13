# Integración Endpoints: Gastos

## Objetivo
Crear todas las rutas REST API necesarias para la gestión de gastos mensuales, permitiendo crear, leer, actualizar y eliminar gastos, así como obtener totales y filtrar por categoría.

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos (Modelo `Gasto` ya existe)
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

### Paso 1: Crear Controlador de Gastos

**Archivo a crear:** `src/controllers/gasto.controller.ts`

**Funciones a implementar:**

```typescript
// Obtener todos los gastos de un mes
export const getGastosByMes = async (req: AuthRequest, res: Response): Promise<void>

// Crear un nuevo gasto
export const createGasto = async (req: AuthRequest, res: Response): Promise<void>

// Actualizar un gasto existente
export const updateGasto = async (req: AuthRequest, res: Response): Promise<void>

// Eliminar un gasto
export const deleteGasto = async (req: AuthRequest, res: Response): Promise<void>

// Obtener total de gastos del mes
export const getTotalGastosByMes = async (req: AuthRequest, res: Response): Promise<void>

// Obtener gastos por categoría
export const getGastosByCategoria = async (req: AuthRequest, res: Response): Promise<void>
```

**Lógica de cada función:**
- `getGastosByMes`: Filtrar por `userId` (del token) y `mes` (parámetro), ordenar por fecha ascendente
- `createGasto`: Validar campos requeridos, asignar `userId` del token, guardar en BD
- `updateGasto`: Verificar que el gasto pertenezca al usuario, actualizar campos permitidos
- `deleteGasto`: Verificar que el gasto pertenezca al usuario, eliminar de BD
- `getTotalGastosByMes`: Sumar todos los montos de gastos del mes del usuario
- `getGastosByCategoria`: Filtrar por `userId`, `mes` y `categoria`

**Validaciones:**
- `mes`: Debe ser uno de: `['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']`
- `descripcion`: Requerido, string no vacío, trim
- `monto`: Requerido, número > 0
- `fecha`: Requerido, fecha válida (Date o ISO string)
- `categoria`: Requerido, string no vacío
- `dividido`: Opcional, array de objetos con estructura `{ amigoId, amigoNombre, montoDividido, pagado }`

---

### Paso 2: Crear Rutas de Gastos

**Archivo a crear:** `src/routes/gasto.routes.ts`

**Endpoints a implementar:**

```typescript
GET    /api/gastos/:mes                    - Obtener todos los gastos de un mes
POST   /api/gastos                          - Crear un nuevo gasto
PUT    /api/gastos/:id                      - Actualizar un gasto existente
DELETE /api/gastos/:id                      - Eliminar un gasto
GET    /api/gastos/:mes/total               - Obtener total de gastos del mes
GET    /api/gastos/:mes/categoria/:categoria - Obtener gastos por categoría
```

**Estructura de rutas:**

```typescript
import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import * as gastoController from '../controllers/gasto.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/:mes', authenticate, gastoController.getGastosByMes);
router.post('/', authenticate, gastoController.createGasto);
router.put('/:id', authenticate, gastoController.updateGasto);
router.delete('/:id', authenticate, gastoController.deleteGasto);
router.get('/:mes/total', authenticate, gastoController.getTotalGastosByMes);
router.get('/:mes/categoria/:categoria', authenticate, gastoController.getGastosByCategoria);

export default router;
```

---

### Paso 3: Validaciones y Manejo de Errores

**Validaciones a implementar en el controlador:**

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

// Validar campos requeridos
if (!descripcion || !monto || !fecha || !categoria) {
  res.status(400).json({
    success: false,
    error: 'Todos los campos son requeridos'
  });
  return;
}

// Validar monto
if (typeof monto !== 'number' || monto <= 0) {
  res.status(400).json({
    success: false,
    error: 'El monto debe ser un número mayor a 0'
  });
  return;
}
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
import { gastoRoutes } from './routes/gasto.routes';

// 2. Agregar después de las rutas existentes
app.use('/api/gastos', gastoRoutes);

// 3. Actualizar endpoint raíz con nueva ruta
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Bienvenido al API del Gestor Backend',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      gastos: '/api/gastos',  // ← Agregar esta línea
      example: '/api/example'
    },
    timestamp: new Date().toISOString()
  });
});
```

---

### Paso 5: Testing y Documentación

**Testing con Postman/Thunder Client:**

1. **Obtener gastos del mes:**
   ```
   GET http://localhost:4444/api/gastos/noviembre
   Headers: Authorization: Bearer <token>
   ```

2. **Crear gasto:**
   ```
   POST http://localhost:4444/api/gastos
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "descripcion": "Compra supermercado",
     "monto": 150.50,
     "fecha": "2024-11-15T10:00:00Z",
     "categoria": "Alimentación",
     "mes": "noviembre"
   }
   ```

3. **Actualizar gasto:**
   ```
   PUT http://localhost:4444/api/gastos/:id
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "descripcion": "Compra supermercado actualizada",
     "monto": 160.00
   }
   ```

4. **Eliminar gasto:**
   ```
   DELETE http://localhost:4444/api/gastos/:id
   Headers: Authorization: Bearer <token>
   ```

5. **Obtener total del mes:**
   ```
   GET http://localhost:4444/api/gastos/noviembre/total
   Headers: Authorization: Bearer <token>
   ```

6. **Obtener gastos por categoría:**
   ```
   GET http://localhost:4444/api/gastos/noviembre/categoria/Alimentación
   Headers: Authorization: Bearer <token>
   ```

**Estructura de respuestas esperadas:**

```typescript
// GET /api/gastos/:mes
{
  success: true,
  data: [
    {
      _id: string,
      userId: string,
      descripcion: string,
      monto: number,
      fecha: string (ISO),
      categoria: string,
      mes: string,
      dividido?: Array<{
        amigoId: string,
        amigoNombre: string,
        montoDividido: number,
        pagado: boolean
      }>,
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

// PUT /api/gastos/:id
{
  success: true,
  data: { /* objeto gasto actualizado */ },
  message: "Gasto actualizado exitosamente"
}

// DELETE /api/gastos/:id
{
  success: true,
  message: "Gasto eliminado exitosamente"
}

// GET /api/gastos/:mes/total
{
  success: true,
  data: {
    mes: string,
    total: number
  }
}

// GET /api/gastos/:mes/categoria/:categoria
{
  success: true,
  data: [ /* array de gastos filtrados */ ],
  total?: number
}
```

---

## 📁 Estructura de Archivos

```
src/
├── controllers/
│   └── gasto.controller.ts          ✅ (nuevo)
├── routes/
│   └── gasto.routes.ts               ✅ (nuevo)
├── models/
│   └── Gasto.model.ts                ✅ (ya existe)
└── server.ts                         ✅ (modificar - registrar rutas)
```

---

## 📝 Notas Técnicas

- Todas las rutas protegidas con middleware `authenticate`
- Usar `AuthRequest` para acceder a `req.user.userId`
- Validar que el mes esté en el enum del modelo
- Ordenar gastos por fecha ascendente (más antiguos primero)
- Manejar errores con try-catch y respuestas consistentes
- Verificar que el usuario solo acceda a sus propios gastos
- El campo `dividido` es opcional y se usa para dividir gastos con amigos
- Usar `lean()` en consultas de solo lectura para mejor rendimiento
- Los índices del modelo ya están configurados para optimizar consultas

---

## ✅ Checklist de Verificación

- [ ] Controlador creado con todas las funciones
- [ ] Rutas creadas y conectadas al controlador
- [ ] Todas las rutas protegidas con middleware `authenticate`
- [ ] Validaciones implementadas
- [ ] Manejo de errores consistente
- [ ] Rutas registradas en `server.ts`
- [ ] Endpoint raíz actualizado
- [ ] Testing completo con Postman/Thunder Client
- [ ] Verificar que usuarios solo accedan a sus propios gastos
- [ ] Documentación de endpoints completa

