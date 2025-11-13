# Integración Endpoints: Amigos

## Objetivo
Crear todas las rutas REST API necesarias para la gestión de amigos, permitiendo crear, leer, actualizar, eliminar y buscar amigos, así como gestionar estados (activo, pendiente, bloqueado).

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos (Modelo `Amigo` ya existe)
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

### Paso 1: Crear Controlador de Amigos

**Archivo a crear:** `src/controllers/amigo.controller.ts`

**Funciones a implementar:**

```typescript
// Obtener todos los amigos del usuario
export const getAmigos = async (req: AuthRequest, res: Response): Promise<void>

// Obtener un amigo por ID
export const getAmigoById = async (req: AuthRequest, res: Response): Promise<void>

// Buscar amigos por nombre o email
export const searchAmigos = async (req: AuthRequest, res: Response): Promise<void>

// Obtener amigos por estado
export const getAmigosByEstado = async (req: AuthRequest, res: Response): Promise<void>

// Crear un nuevo amigo
export const createAmigo = async (req: AuthRequest, res: Response): Promise<void>

// Actualizar un amigo existente
export const updateAmigo = async (req: AuthRequest, res: Response): Promise<void>

// Actualizar estado de un amigo
export const updateEstadoAmigo = async (req: AuthRequest, res: Response): Promise<void>

// Eliminar un amigo
export const deleteAmigo = async (req: AuthRequest, res: Response): Promise<void>
```

**Lógica de cada función:**
- `getAmigos`: Filtrar por `userId` (del token), retornar todos los amigos
- `getAmigoById`: Verificar que el amigo pertenezca al usuario, retornar amigo específico
- `searchAmigos`: Buscar por nombre o email usando regex case-insensitive
- `getAmigosByEstado`: Filtrar por `userId` y `estado` ('activo', 'pendiente', 'bloqueado')
- `createAmigo`: Validar email único por usuario, asignar `userId` del token, guardar en BD
- `updateAmigo`: Verificar que el amigo pertenezca al usuario, actualizar campos permitidos
- `updateEstadoAmigo`: Actualizar solo el campo `estado` del amigo
- `deleteAmigo`: Verificar que el amigo pertenezca al usuario, eliminar de BD

**Validaciones:**
- `nombre`: Requerido, string no vacío, trim
- `email`: Requerido, formato email válido, único por usuario
- `estado`: Opcional, enum: `['activo', 'pendiente', 'bloqueado']`, default: 'activo'
- `avatar`: Opcional, URL válida si se proporciona
- `fechaAmistad`: Opcional, fecha válida, default: Date.now()

---

### Paso 2: Crear Rutas de Amigos

**Archivo a crear:** `src/routes/amigo.routes.ts`

**Endpoints a implementar:**

```typescript
GET    /api/amigos                    - Obtener todos los amigos
GET    /api/amigos/:id                 - Obtener un amigo por ID
GET    /api/amigos/search?q=            - Buscar amigos por nombre o email
GET    /api/amigos/estado/:estado      - Obtener amigos por estado
POST   /api/amigos                    - Crear un nuevo amigo
PUT    /api/amigos/:id                 - Actualizar un amigo existente
PUT    /api/amigos/:id/estado          - Actualizar estado de un amigo
DELETE /api/amigos/:id                 - Eliminar un amigo
```

**Estructura de rutas:**

```typescript
import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import * as amigoController from '../controllers/amigo.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/', authenticate, amigoController.getAmigos);
router.get('/search', authenticate, amigoController.searchAmigos);
router.get('/estado/:estado', authenticate, amigoController.getAmigosByEstado);
router.get('/:id', authenticate, amigoController.getAmigoById);
router.post('/', authenticate, amigoController.createAmigo);
router.put('/:id', authenticate, amigoController.updateAmigo);
router.put('/:id/estado', authenticate, amigoController.updateEstadoAmigo);
router.delete('/:id', authenticate, amigoController.deleteAmigo);

export default router;
```

---

### Paso 3: Validaciones y Manejo de Errores

**Validaciones a implementar en el controlador:**

```typescript
// Validar estado
const estadosValidos = ['activo', 'pendiente', 'bloqueado'];
if (estado && !estadosValidos.includes(estado)) {
  res.status(400).json({
    success: false,
    error: 'Estado inválido. Debe ser: activo, pendiente o bloqueado'
  });
  return;
}

// Validar email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || !emailRegex.test(email)) {
  res.status(400).json({
    success: false,
    error: 'Email inválido'
  });
  return;
}

// Validar email único por usuario
const amigoExistente = await Amigo.findOne({
  userId,
  email: email.toLowerCase().trim()
});

if (amigoExistente && amigoExistente._id.toString() !== id) {
  res.status(409).json({
    success: false,
    error: 'Ya existe un amigo con ese email'
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
```

**Búsqueda de amigos:**

```typescript
// Buscar por nombre o email
const query = req.query.q as string;
if (!query || query.trim().length === 0) {
  res.status(400).json({
    success: false,
    error: 'Parámetro de búsqueda requerido'
  });
  return;
}

const amigos = await Amigo.find({
  userId,
  $or: [
    { nombre: { $regex: query, $options: 'i' } },
    { email: { $regex: query, $options: 'i' } }
  ]
});
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
import { amigoRoutes } from './routes/amigo.routes';

// 2. Agregar después de las rutas existentes
app.use('/api/amigos', amigoRoutes);

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
      categorias: '/api/categorias',
      dashboard: '/api/dashboard',
      amigos: '/api/amigos',  // ← Agregar esta línea
      example: '/api/example'
    },
    timestamp: new Date().toISOString()
  });
});
```

---

### Paso 5: Testing y Documentación

**Testing con Postman/Thunder Client:**

1. **Obtener todos los amigos:**
   ```
   GET http://localhost:4444/api/amigos
   Headers: Authorization: Bearer <token>
   ```

2. **Obtener amigo por ID:**
   ```
   GET http://localhost:4444/api/amigos/:id
   Headers: Authorization: Bearer <token>
   ```

3. **Buscar amigos:**
   ```
   GET http://localhost:4444/api/amigos/search?q=juan
   Headers: Authorization: Bearer <token>
   ```

4. **Obtener amigos por estado:**
   ```
   GET http://localhost:4444/api/amigos/estado/activo
   Headers: Authorization: Bearer <token>
   ```

5. **Crear amigo:**
   ```
   POST http://localhost:4444/api/amigos
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "nombre": "Juan Pérez",
     "email": "juan.perez@example.com",
     "estado": "activo"
   }
   ```

6. **Actualizar amigo:**
   ```
   PUT http://localhost:4444/api/amigos/:id
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "nombre": "Juan Pérez Actualizado",
     "avatar": "https://example.com/avatar.jpg"
   }
   ```

7. **Actualizar estado:**
   ```
   PUT http://localhost:4444/api/amigos/:id/estado
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "estado": "bloqueado"
   }
   ```

8. **Eliminar amigo:**
   ```
   DELETE http://localhost:4444/api/amigos/:id
   Headers: Authorization: Bearer <token>
   ```

**Estructura de respuestas esperadas:**

```typescript
// GET /api/amigos
{
  success: true,
  data: [
    {
      _id: string,
      userId: string,
      nombre: string,
      email: string,
      avatar?: string,
      estado: 'activo' | 'pendiente' | 'bloqueado',
      fechaAmistad: string (ISO),
      createdAt: string (ISO)
    }
  ]
}

// GET /api/amigos/:id
{
  success: true,
  data: {
    _id: string,
    userId: string,
    nombre: string,
    email: string,
    avatar?: string,
    estado: string,
    fechaAmistad: string (ISO),
    createdAt: string (ISO)
  }
}

// GET /api/amigos/search?q=
{
  success: true,
  data: [ /* array de amigos encontrados */ ]
}

// POST /api/amigos
{
  success: true,
  data: { /* objeto amigo creado */ },
  message: "Amigo creado exitosamente"
}

// PUT /api/amigos/:id
{
  success: true,
  data: { /* objeto amigo actualizado */ },
  message: "Amigo actualizado exitosamente"
}

// PUT /api/amigos/:id/estado
{
  success: true,
  data: { /* objeto amigo con estado actualizado */ },
  message: "Estado actualizado exitosamente"
}

// DELETE /api/amigos/:id
{
  success: true,
  message: "Amigo eliminado exitosamente"
}
```

---

## 📁 Estructura de Archivos

```
src/
├── controllers/
│   └── amigo.controller.ts            ✅ (nuevo)
├── routes/
│   └── amigo.routes.ts                ✅ (nuevo)
├── models/
│   └── Amigo.model.ts                 ✅ (ya existe)
└── server.ts                          ✅ (modificar - registrar rutas)
```

---

## 📝 Notas Técnicas

- Todas las rutas protegidas con middleware `authenticate`
- Usar `AuthRequest` para acceder a `req.user.userId`
- Validar que el estado esté en el enum del modelo
- El índice único compuesto `{ userId, email }` previene duplicados automáticamente
- Verificar que el usuario solo acceda a sus propios amigos
- Validar email único por usuario antes de crear/actualizar
- La búsqueda usa regex case-insensitive para mayor flexibilidad
- Manejar errores con try-catch y respuestas consistentes
- El campo `fechaAmistad` se establece automáticamente al crear

---

## ✅ Checklist de Verificación

- [ ] Controlador creado con todas las funciones
- [ ] Rutas creadas y conectadas al controlador
- [ ] Todas las rutas protegidas con middleware `authenticate`
- [ ] Validaciones implementadas (email único, estado válido)
- [ ] Búsqueda por nombre/email funcionando
- [ ] Filtrado por estado funcionando
- [ ] Manejo de errores consistente
- [ ] Rutas registradas en `server.ts`
- [ ] Endpoint raíz actualizado
- [ ] Testing completo con Postman/Thunder Client
- [ ] Verificar que usuarios solo accedan a sus propios amigos
- [ ] Verificar validación de email duplicado
- [ ] Documentación de endpoints completa


