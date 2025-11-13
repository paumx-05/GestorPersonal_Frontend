# Integración Endpoints: Categorías

## Objetivo
Crear todas las rutas REST API necesarias para la gestión de categorías personalizadas, permitiendo crear, leer, actualizar y eliminar categorías, así como filtrar por tipo (gastos, ingresos, ambos).

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos (Modelo `Categoria` ya existe)
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

### Paso 1: Crear Controlador de Categorías

**Archivo a crear:** `src/controllers/categoria.controller.ts`

**Funciones a implementar:**

```typescript
// Obtener todas las categorías del usuario
export const getCategorias = async (req: AuthRequest, res: Response): Promise<void>

// Obtener categorías por tipo
export const getCategoriasByTipo = async (req: AuthRequest, res: Response): Promise<void>

// Crear una nueva categoría
export const createCategoria = async (req: AuthRequest, res: Response): Promise<void>

// Actualizar una categoría existente
export const updateCategoria = async (req: AuthRequest, res: Response): Promise<void>

// Eliminar una categoría
export const deleteCategoria = async (req: AuthRequest, res: Response): Promise<void>
```

**Lógica de cada función:**
- `getCategorias`: Filtrar por `userId` (del token), retornar todas las categorías del usuario
- `getCategoriasByTipo`: Filtrar por `userId` y `tipo` ('gastos', 'ingresos', 'ambos')
- `createCategoria`: Validar que el nombre sea único por usuario, asignar `userId` del token, guardar en BD
- `updateCategoria`: Verificar que la categoría pertenezca al usuario, validar nombre único, actualizar campos
- `deleteCategoria`: Verificar que la categoría pertenezca al usuario, eliminar de BD

**Validaciones:**
- `nombre`: Requerido, string no vacío, trim, único por usuario
- `tipo`: Requerido, enum: `['gastos', 'ingresos', 'ambos']`
- Validar que no se dupliquen nombres de categorías del mismo usuario

---

### Paso 2: Crear Rutas de Categorías

**Archivo a crear:** `src/routes/categoria.routes.ts`

**Endpoints a implementar:**

```typescript
GET    /api/categorias                    - Obtener todas las categorías del usuario
GET    /api/categorias/tipo/:tipo         - Obtener categorías por tipo
POST   /api/categorias                    - Crear una nueva categoría
PUT    /api/categorias/:id                - Actualizar una categoría existente
DELETE /api/categorias/:id                - Eliminar una categoría
```

**Estructura de rutas:**

```typescript
import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import * as categoriaController from '../controllers/categoria.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/', authenticate, categoriaController.getCategorias);
router.get('/tipo/:tipo', authenticate, categoriaController.getCategoriasByTipo);
router.post('/', authenticate, categoriaController.createCategoria);
router.put('/:id', authenticate, categoriaController.updateCategoria);
router.delete('/:id', authenticate, categoriaController.deleteCategoria);

export default router;
```

---

### Paso 3: Validaciones y Manejo de Errores

**Validaciones a implementar en el controlador:**

```typescript
// Validar tipo
const tiposValidos = ['gastos', 'ingresos', 'ambos'];
if (!tiposValidos.includes(tipo)) {
  res.status(400).json({
    success: false,
    error: 'Tipo inválido. Debe ser: gastos, ingresos o ambos'
  });
  return;
}

// Validar nombre
if (!nombre || nombre.trim().length === 0) {
  res.status(400).json({
    success: false,
    error: 'El nombre es requerido'
  });
  return;
}

// Validar nombre único por usuario
const categoriaExistente = await Categoria.findOne({
  userId,
  nombre: nombre.trim()
});

if (categoriaExistente && categoriaExistente._id.toString() !== id) {
  res.status(409).json({
    success: false,
    error: 'Ya existe una categoría con ese nombre'
  });
  return;
}
```

**Manejo de errores:**
- Usar try-catch en todas las funciones async
- Respuestas consistentes: `{ success: boolean, data?: any, error?: string, message?: string }`
- Códigos HTTP apropiados: 200 (éxito), 201 (creado), 400 (bad request), 401 (no autorizado), 404 (no encontrado), 409 (conflicto - duplicado), 500 (error servidor)

---

### Paso 4: Integrar Rutas en Server

**Archivo a modificar:** `src/server.ts`

**Cambios a realizar:**

```typescript
// 1. Importar las rutas
import { categoriaRoutes } from './routes/categoria.routes';

// 2. Agregar después de las rutas existentes
app.use('/api/categorias', categoriaRoutes);

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
      presupuestos: '/api/presupuestos',
      categorias: '/api/categorias',  // ← Agregar esta línea
      example: '/api/example'
    },
    timestamp: new Date().toISOString()
  });
});
```

---

### Paso 5: Testing y Documentación

**Testing con Postman/Thunder Client:**

1. **Obtener todas las categorías:**
   ```
   GET http://localhost:4444/api/categorias
   Headers: Authorization: Bearer <token>
   ```

2. **Obtener categorías por tipo:**
   ```
   GET http://localhost:4444/api/categorias/tipo/gastos
   Headers: Authorization: Bearer <token>
   ```

3. **Crear categoría:**
   ```
   POST http://localhost:4444/api/categorias
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "nombre": "Entretenimiento",
     "tipo": "gastos"
   }
   ```

4. **Actualizar categoría:**
   ```
   PUT http://localhost:4444/api/categorias/:id
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "nombre": "Entretenimiento Actualizado",
     "tipo": "ambos"
   }
   ```

5. **Eliminar categoría:**
   ```
   DELETE http://localhost:4444/api/categorias/:id
   Headers: Authorization: Bearer <token>
   ```

**Estructura de respuestas esperadas:**

```typescript
// GET /api/categorias
{
  success: true,
  data: [
    {
      _id: string,
      userId: string,
      nombre: string,
      tipo: 'gastos' | 'ingresos' | 'ambos',
      createdAt: string (ISO)
    }
  ]
}

// GET /api/categorias/tipo/:tipo
{
  success: true,
  data: [
    {
      _id: string,
      userId: string,
      nombre: string,
      tipo: string,
      createdAt: string (ISO)
    }
  ]
}

// POST /api/categorias
{
  success: true,
  data: {
    _id: string,
    userId: string,
    nombre: string,
    tipo: string,
    createdAt: string (ISO)
  },
  message: "Categoría creada exitosamente"
}

// PUT /api/categorias/:id
{
  success: true,
  data: {
    _id: string,
    userId: string,
    nombre: string,
    tipo: string,
    createdAt: string (ISO)
  },
  message: "Categoría actualizada exitosamente"
}

// DELETE /api/categorias/:id
{
  success: true,
  message: "Categoría eliminada exitosamente"
}
```

---

## 📁 Estructura de Archivos

```
src/
├── controllers/
│   └── categoria.controller.ts         ✅ (nuevo)
├── routes/
│   └── categoria.routes.ts              ✅ (nuevo)
├── models/
│   └── Categoria.model.ts               ✅ (ya existe)
└── server.ts                            ✅ (modificar - registrar rutas)
```

---

## 📝 Notas Técnicas

- Todas las rutas protegidas con middleware `authenticate`
- Usar `AuthRequest` para acceder a `req.user.userId`
- Validar que el tipo esté en el enum del modelo
- El índice único compuesto `{ userId, nombre }` previene duplicados automáticamente
- Verificar que el usuario solo acceda a sus propias categorías
- Validar nombre único por usuario antes de crear/actualizar
- Manejar errores con try-catch y respuestas consistentes
- El campo `tipo` determina dónde se puede usar la categoría (gastos, ingresos o ambos)

---

## ✅ Checklist de Verificación

- [ ] Controlador creado con todas las funciones
- [ ] Rutas creadas y conectadas al controlador
- [ ] Todas las rutas protegidas con middleware `authenticate`
- [ ] Validaciones implementadas (nombre único, tipo válido)
- [ ] Manejo de errores consistente
- [ ] Rutas registradas en `server.ts`
- [ ] Endpoint raíz actualizado
- [ ] Testing completo con Postman/Thunder Client
- [ ] Verificar que usuarios solo accedan a sus propias categorías
- [ ] Verificar validación de nombres duplicados
- [ ] Verificar filtrado por tipo
- [ ] Documentación de endpoints completa


