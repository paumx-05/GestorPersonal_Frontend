# Integración Endpoints: Ingresos

## Objetivo
Crear todas las rutas REST API necesarias para la gestión de ingresos mensuales, permitiendo crear, leer, actualizar y eliminar ingresos, así como obtener totales y filtrar por categoría.

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos (Modelo `Ingreso` ya existe)
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

### Paso 1: Crear Controlador de Ingresos

**Archivo a crear:** `src/controllers/ingreso.controller.ts`

**Funciones a implementar:**

```typescript
// Obtener todos los ingresos de un mes
export const getIngresosByMes = async (req: AuthRequest, res: Response): Promise<void>

// Crear un nuevo ingreso
export const createIngreso = async (req: AuthRequest, res: Response): Promise<void>

// Actualizar un ingreso existente
export const updateIngreso = async (req: AuthRequest, res: Response): Promise<void>

// Eliminar un ingreso
export const deleteIngreso = async (req: AuthRequest, res: Response): Promise<void>

// Obtener total de ingresos del mes
export const getTotalIngresosByMes = async (req: AuthRequest, res: Response): Promise<void>

// Obtener ingresos por categoría
export const getIngresosByCategoria = async (req: AuthRequest, res: Response): Promise<void>
```

**Lógica de cada función:**
- `getIngresosByMes`: Filtrar por `userId` (del token) y `mes` (parámetro), ordenar por fecha ascendente
- `createIngreso`: Validar campos requeridos, asignar `userId` del token, guardar en BD
- `updateIngreso`: Verificar que el ingreso pertenezca al usuario, actualizar campos permitidos
- `deleteIngreso`: Verificar que el ingreso pertenezca al usuario, eliminar de BD
- `getTotalIngresosByMes`: Sumar todos los montos de ingresos del mes del usuario
- `getIngresosByCategoria`: Filtrar por `userId`, `mes` y `categoria`

**Validaciones:**
- `mes`: Debe ser uno de: `['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']`
- `descripcion`: Requerido, string no vacío, trim
- `monto`: Requerido, número > 0
- `fecha`: Requerido, fecha válida (Date o ISO string)
- `categoria`: Requerido, string no vacío

**Nota:** Reutilizar la misma estructura y lógica del controlador de gastos, adaptando nombres y modelo.

---

### Paso 2: Crear Rutas de Ingresos

**Archivo a crear:** `src/routes/ingreso.routes.ts`

**Endpoints a implementar:**

```typescript
GET    /api/ingresos/:mes                    - Obtener todos los ingresos de un mes
POST   /api/ingresos                          - Crear un nuevo ingreso
PUT    /api/ingresos/:id                      - Actualizar un ingreso existente
DELETE /api/ingresos/:id                      - Eliminar un ingreso
GET    /api/ingresos/:mes/total               - Obtener total de ingresos del mes
GET    /api/ingresos/:mes/categoria/:categoria - Obtener ingresos por categoría
```

**Estructura de rutas:**

```typescript
import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import * as ingresoController from '../controllers/ingreso.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/:mes', authenticate, ingresoController.getIngresosByMes);
router.post('/', authenticate, ingresoController.createIngreso);
router.put('/:id', authenticate, ingresoController.updateIngreso);
router.delete('/:id', authenticate, ingresoController.deleteIngreso);
router.get('/:mes/total', authenticate, ingresoController.getTotalIngresosByMes);
router.get('/:mes/categoria/:categoria', authenticate, ingresoController.getIngresosByCategoria);

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
import { ingresoRoutes } from './routes/ingreso.routes';

// 2. Agregar después de las rutas existentes
app.use('/api/ingresos', ingresoRoutes);

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
      ingresos: '/api/ingresos',  // ← Agregar esta línea
      example: '/api/example'
    },
    timestamp: new Date().toISOString()
  });
});
```

---

### Paso 5: Testing y Documentación

**Testing con Postman/Thunder Client:**

1. **Obtener ingresos del mes:**
   ```
   GET http://localhost:4444/api/ingresos/noviembre
   Headers: Authorization: Bearer <token>
   ```

2. **Crear ingreso:**
   ```
   POST http://localhost:4444/api/ingresos
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "descripcion": "Salario mensual",
     "monto": 2500.00,
     "fecha": "2024-11-01T10:00:00Z",
     "categoria": "Salario",
     "mes": "noviembre"
   }
   ```

3. **Actualizar ingreso:**
   ```
   PUT http://localhost:4444/api/ingresos/:id
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "descripcion": "Salario mensual actualizado",
     "monto": 2600.00
   }
   ```

4. **Eliminar ingreso:**
   ```
   DELETE http://localhost:4444/api/ingresos/:id
   Headers: Authorization: Bearer <token>
   ```

5. **Obtener total del mes:**
   ```
   GET http://localhost:4444/api/ingresos/noviembre/total
   Headers: Authorization: Bearer <token>
   ```

6. **Obtener ingresos por categoría:**
   ```
   GET http://localhost:4444/api/ingresos/noviembre/categoria/Salario
   Headers: Authorization: Bearer <token>
   ```

**Estructura de respuestas esperadas:**

```typescript
// GET /api/ingresos/:mes
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
      createdAt: string (ISO)
    }
  ],
  total?: number
}

// POST /api/ingresos
{
  success: true,
  data: { /* objeto ingreso creado */ },
  message: "Ingreso creado exitosamente"
}

// PUT /api/ingresos/:id
{
  success: true,
  data: { /* objeto ingreso actualizado */ },
  message: "Ingreso actualizado exitosamente"
}

// DELETE /api/ingresos/:id
{
  success: true,
  message: "Ingreso eliminado exitosamente"
}

// GET /api/ingresos/:mes/total
{
  success: true,
  data: {
    mes: string,
    total: number
  }
}

// GET /api/ingresos/:mes/categoria/:categoria
{
  success: true,
  data: [ /* array de ingresos filtrados */ ],
  total?: number
}
```

---

## 📁 Estructura de Archivos

```
src/
├── controllers/
│   └── ingreso.controller.ts         ✅ (nuevo)
├── routes/
│   └── ingreso.routes.ts            ✅ (nuevo)
├── models/
│   └── Ingreso.model.ts              ✅ (ya existe)
└── server.ts                         ✅ (modificar - registrar rutas)
```

---

## 📝 Notas Técnicas

- Todas las rutas protegidas con middleware `authenticate`
- Usar `AuthRequest` para acceder a `req.user.userId`
- Validar que el mes esté en el enum del modelo
- Ordenar ingresos por fecha ascendente (más antiguos primero)
- Manejar errores con try-catch y respuestas consistentes
- Verificar que el usuario solo acceda a sus propios ingresos
- Reutilizar estructura similar al controlador de gastos para mantener consistencia
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
- [ ] Verificar que usuarios solo accedan a sus propios ingresos
- [ ] Documentación de endpoints completa
- [ ] Consistencia con estructura de gastos


