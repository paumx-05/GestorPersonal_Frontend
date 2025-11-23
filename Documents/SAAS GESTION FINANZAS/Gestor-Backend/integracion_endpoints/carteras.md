# Integración Endpoints: Carteras

## Objetivo
Crear todas las rutas REST API necesarias para la gestión de múltiples carteras por usuario, permitiendo crear, leer, actualizar y eliminar carteras, así como filtrar gastos, ingresos y presupuestos por cartera.

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos (Modelo `Cartera` a crear)
- **Express.js**: Framework web
- **TypeScript**: Lenguaje de programación
- **REST API**: Estándares REST con métodos HTTP apropiados

### Estándares API
- Métodos HTTP correctos (GET, POST, PUT, DELETE)
- Nomenclatura consistente de endpoints
- Respuestas JSON estructuradas
- Códigos de estado HTTP apropiados
- Autenticación con JWT en todas las rutas protegidas

### Funcionalidades Clave
- Cada usuario puede tener múltiples carteras
- Los gastos, ingresos y presupuestos pueden estar asociados a una cartera (opcional)
- Filtrado de datos por cartera en todos los endpoints relacionados
- Validación de que el usuario solo acceda a sus propias carteras
- Retrocompatibilidad: `carteraId` es opcional en todos los modelos

---

## 📝 Pasos de Implementación

### Paso 1: Crear Modelo de Cartera y Modificar Modelos Existentes

**Archivo a crear:** `src/models/Cartera.model.ts`

**Estructura del modelo:**

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ICartera extends Document {
  userId: mongoose.Types.ObjectId;
  nombre: string;
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CarteraSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El userId es requerido'],
      index: true
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices
CarteraSchema.index({ userId: 1 }); // Índice simple para búsquedas por usuario
CarteraSchema.index({ userId: 1, nombre: 1 }, { unique: true }); // Índice compuesto único para evitar duplicados

export const Cartera = mongoose.model<ICartera>('Cartera', CarteraSchema);
```

**Archivos a modificar:** `src/models/Gasto.model.ts`, `src/models/Ingreso.model.ts`, `src/models/Presupuesto.model.ts`

**Cambios a realizar en cada modelo:**

1. **Agregar campo `carteraId` a la interfaz:**
```typescript
export interface IGasto extends Document {
  userId: mongoose.Types.ObjectId;
  descripcion: string;
  monto: number;
  fecha: Date;
  categoria: string;
  mes: string;
  dividido?: IDividido[];
  carteraId?: mongoose.Types.ObjectId; // ← Agregar esta línea
  createdAt: Date;
}
```

2. **Agregar campo `carteraId` al schema:**
```typescript
const GastoSchema: Schema = new Schema(
  {
    // ... campos existentes ...
    carteraId: {
      type: Schema.Types.ObjectId,
      ref: 'Cartera',
      required: false,
      index: true
    }
  },
  // ... resto del schema ...
);
```

3. **Agregar índices compuestos:**
```typescript
// Índices existentes
GastoSchema.index({ userId: 1, mes: 1 });
GastoSchema.index({ userId: 1, categoria: 1 });
GastoSchema.index({ userId: 1, fecha: -1 });

// Nuevos índices para carteras
GastoSchema.index({ userId: 1, carteraId: 1 }); // Para búsquedas por usuario y cartera
GastoSchema.index({ userId: 1, mes: 1, carteraId: 1 }); // Para consultas por mes y cartera
```

**Nota:** Aplicar los mismos cambios a `Ingreso.model.ts` y `Presupuesto.model.ts`.

---

### Paso 2: Crear Controlador de Carteras

**Archivo a crear:** `src/controllers/cartera.controller.ts`

**Funciones a implementar:**

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Cartera } from '../models/Cartera.model';
import mongoose from 'mongoose';

// Obtener todas las carteras del usuario
export const getCarteras = async (req: AuthRequest, res: Response): Promise<void>

// Obtener una cartera por ID
export const getCarteraById = async (req: AuthRequest, res: Response): Promise<void>

// Crear una nueva cartera
export const createCartera = async (req: AuthRequest, res: Response): Promise<void>

// Actualizar una cartera existente
export const updateCartera = async (req: AuthRequest, res: Response): Promise<void>

// Eliminar una cartera
export const deleteCartera = async (req: AuthRequest, res: Response): Promise<void>
```

**Lógica de cada función:**

- `getCarteras`: Filtrar por `userId` (del token), ordenar por `createdAt` descendente (más recientes primero)
- `getCarteraById`: Verificar que la cartera pertenezca al usuario autenticado
- `createCartera`: Validar campos requeridos, verificar unicidad de nombre por usuario, asignar `userId` del token
- `updateCartera`: Verificar que la cartera pertenezca al usuario, validar unicidad de nombre si se cambia
- `deleteCartera`: Verificar que la cartera pertenezca al usuario, manejar opción `deleteData` (query param)

**Validaciones:**
- `nombre`: Requerido, no vacío, máximo 100 caracteres, trim
- `descripcion`: Opcional, máximo 500 caracteres, trim
- Unicidad: No puede haber dos carteras con el mismo nombre para el mismo usuario
- `carteraId`: Si se proporciona en otros endpoints, debe ser un ObjectId válido y pertenecer al usuario

**Ejemplo de implementación:**

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Cartera } from '../models/Cartera.model';
import { Gasto } from '../models/Gasto.model';
import { Ingreso } from '../models/Ingreso.model';
import { Presupuesto } from '../models/Presupuesto.model';
import mongoose from 'mongoose';

// Obtener todas las carteras del usuario
export const getCarteras = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const carteras = await Cartera.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: carteras.map(cartera => ({
        _id: cartera._id.toString(),
        userId: cartera.userId.toString(),
        nombre: cartera.nombre,
        descripcion: cartera.descripcion,
        createdAt: cartera.createdAt instanceof Date 
          ? cartera.createdAt.toISOString() 
          : cartera.createdAt,
        updatedAt: cartera.updatedAt instanceof Date 
          ? cartera.updatedAt.toISOString() 
          : cartera.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error en getCarteras:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener carteras'
    });
  }
};

// Obtener una cartera por ID
export const getCarteraById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    const cartera = await Cartera.findOne({ 
      _id: id, 
      userId: req.user.userId 
    }).lean();

    if (!cartera) {
      res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        _id: cartera._id.toString(),
        userId: cartera.userId.toString(),
        nombre: cartera.nombre,
        descripcion: cartera.descripcion,
        createdAt: cartera.createdAt instanceof Date 
          ? cartera.createdAt.toISOString() 
          : cartera.createdAt,
        updatedAt: cartera.updatedAt instanceof Date 
          ? cartera.updatedAt.toISOString() 
          : cartera.updatedAt
      }
    });
  } catch (error) {
    console.error('Error en getCarteraById:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener cartera'
    });
  }
};

// Crear una nueva cartera
export const createCartera = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { nombre, descripcion } = req.body;

    // Validar nombre
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      });
      return;
    }

    if (nombre.trim().length > 100) {
      res.status(400).json({
        success: false,
        error: 'El nombre no puede exceder 100 caracteres'
      });
      return;
    }

    // Validar descripción
    if (descripcion && descripcion.trim().length > 500) {
      res.status(400).json({
        success: false,
        error: 'La descripción no puede exceder 500 caracteres'
      });
      return;
    }

    // Verificar unicidad de nombre por usuario
    const existingCartera = await Cartera.findOne({
      userId: req.user.userId,
      nombre: nombre.trim()
    });

    if (existingCartera) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una cartera con ese nombre'
      });
      return;
    }

    // Crear cartera
    const nuevaCartera = await Cartera.create({
      userId: req.user.userId,
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : undefined
    });

    res.status(201).json({
      success: true,
      data: {
        _id: nuevaCartera._id.toString(),
        userId: nuevaCartera.userId.toString(),
        nombre: nuevaCartera.nombre,
        descripcion: nuevaCartera.descripcion,
        createdAt: nuevaCartera.createdAt.toISOString(),
        updatedAt: nuevaCartera.updatedAt.toISOString()
      },
      message: 'Cartera creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en createCartera:', error);
    
    // Manejar error de duplicado de MongoDB
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una cartera con ese nombre'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear cartera'
    });
  }
};

// Actualizar una cartera existente
export const updateCartera = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    // Verificar que la cartera existe y pertenece al usuario
    const cartera = await Cartera.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!cartera) {
      res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
      return;
    }

    // Validar que se proporcione al menos un campo para actualizar
    if (!nombre && descripcion === undefined) {
      res.status(400).json({
        success: false,
        error: 'Debe proporcionar al menos un campo para actualizar'
      });
      return;
    }

    // Validar nombre si se proporciona
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El nombre no puede estar vacío'
        });
        return;
      }

      if (nombre.trim().length > 100) {
        res.status(400).json({
          success: false,
          error: 'El nombre no puede exceder 100 caracteres'
        });
        return;
      }

      // Verificar unicidad si el nombre cambió
      if (nombre.trim() !== cartera.nombre) {
        const existingCartera = await Cartera.findOne({
          userId: req.user.userId,
          nombre: nombre.trim(),
          _id: { $ne: id }
        });

        if (existingCartera) {
          res.status(409).json({
            success: false,
            error: 'Ya existe una cartera con ese nombre'
          });
          return;
        }
      }

      cartera.nombre = nombre.trim();
    }

    // Validar y actualizar descripción si se proporciona
    if (descripcion !== undefined) {
      if (descripcion && descripcion.trim().length > 500) {
        res.status(400).json({
          success: false,
          error: 'La descripción no puede exceder 500 caracteres'
        });
        return;
      }

      cartera.descripcion = descripcion ? descripcion.trim() : undefined;
    }

    // Guardar cambios
    await cartera.save();

    res.status(200).json({
      success: true,
      data: {
        _id: cartera._id.toString(),
        userId: cartera.userId.toString(),
        nombre: cartera.nombre,
        descripcion: cartera.descripcion,
        createdAt: cartera.createdAt.toISOString(),
        updatedAt: cartera.updatedAt.toISOString()
      },
      message: 'Cartera actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en updateCartera:', error);
    
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una cartera con ese nombre'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar cartera'
    });
  }
};

// Eliminar una cartera
export const deleteCartera = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const deleteData = req.query.deleteData === 'true';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    // Verificar que la cartera existe y pertenece al usuario
    const cartera = await Cartera.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!cartera) {
      res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
      return;
    }

    const carteraId = cartera._id;

    if (deleteData) {
      // Eliminar todos los gastos, ingresos y presupuestos asociados
      await Promise.all([
        Gasto.deleteMany({ userId: req.user.userId, carteraId }),
        Ingreso.deleteMany({ userId: req.user.userId, carteraId }),
        Presupuesto.deleteMany({ userId: req.user.userId, carteraId })
      ]);
    } else {
      // Mantener los datos pero sin cartera (carteraId = null)
      await Promise.all([
        Gasto.updateMany(
          { userId: req.user.userId, carteraId },
          { $unset: { carteraId: '' } }
        ),
        Ingreso.updateMany(
          { userId: req.user.userId, carteraId },
          { $unset: { carteraId: '' } }
        ),
        Presupuesto.updateMany(
          { userId: req.user.userId, carteraId },
          { $unset: { carteraId: '' } }
        )
      ]);
    }

    // Eliminar la cartera
    await Cartera.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Cartera eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteCartera:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar cartera'
    });
  }
};
```

---

### Paso 3: Crear Rutas de Carteras

**Archivo a crear:** `src/routes/cartera.routes.ts`

**Endpoints a implementar:**

```typescript
GET    /api/carteras              - Obtener todas las carteras del usuario
GET    /api/carteras/:id           - Obtener una cartera por ID
POST   /api/carteras               - Crear una nueva cartera
PUT    /api/carteras/:id           - Actualizar una cartera existente
DELETE /api/carteras/:id           - Eliminar una cartera
```

**Estructura de rutas:**

```typescript
import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as carteraController from '../controllers/cartera.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/', authenticate, carteraController.getCarteras);
router.get('/:id', authenticate, carteraController.getCarteraById);
router.post('/', authenticate, carteraController.createCartera);
router.put('/:id', authenticate, carteraController.updateCartera);
router.delete('/:id', authenticate, carteraController.deleteCartera);

export default router;
```

---

### Paso 4: Modificar Controladores Existentes para Filtrar por Cartera

**Archivos a modificar:** 
- `src/controllers/gasto.controller.ts`
- `src/controllers/ingreso.controller.ts`
- `src/controllers/presupuesto.controller.ts`

**Cambios a realizar en cada controlador:**

1. **Agregar validación de `carteraId` en funciones de creación/actualización:**
```typescript
// En createGasto, createIngreso, createPresupuesto
const { descripcion, monto, fecha, categoria, mes, carteraId, ...otrosCampos } = req.body;

// Si se proporciona carteraId, validar que pertenezca al usuario
if (carteraId) {
  if (!mongoose.Types.ObjectId.isValid(carteraId)) {
    res.status(400).json({
      success: false,
      error: 'ID de cartera inválido'
    });
    return;
  }

  const cartera = await Cartera.findOne({ 
    _id: carteraId, 
    userId: req.user.userId 
  });

  if (!cartera) {
    res.status(404).json({
      success: false,
      error: 'Cartera no encontrada o no pertenece al usuario'
    });
    return;
  }
}

// Al crear el documento, incluir carteraId si se proporcionó
const nuevoGasto = await Gasto.create({
  userId: req.user.userId,
  descripcion,
  monto,
  fecha,
  categoria,
  mes,
  carteraId: carteraId || undefined,
  ...otrosCampos
});
```

2. **Agregar filtro por `carteraId` en funciones de lectura:**
```typescript
// En getGastosByMes, getIngresosByMes, getPresupuestosByMes
const { mes } = req.params;
const { carteraId } = req.query;

// Construir filtro base
const filter: any = {
  userId: req.user.userId,
  mes
};

// Agregar filtro de cartera si se proporciona
if (carteraId) {
  if (!mongoose.Types.ObjectId.isValid(carteraId as string)) {
    res.status(400).json({
      success: false,
      error: 'ID de cartera inválido'
    });
    return;
  }

  // Verificar que la cartera pertenezca al usuario
  const cartera = await Cartera.findOne({ 
    _id: carteraId, 
    userId: req.user.userId 
  });

  if (!cartera) {
    res.status(404).json({
      success: false,
      error: 'Cartera no encontrada o no pertenece al usuario'
    });
    return;
  }

  filter.carteraId = carteraId;
}

const gastos = await Gasto.find(filter)
  .sort({ fecha: 1 })
  .lean();
```

3. **Aplicar el mismo filtro en funciones de totales:**
```typescript
// En getTotalGastosByMes, getTotalIngresosByMes, getTotalPresupuestosByMes
const { mes } = req.params;
const { carteraId } = req.query;

const filter: any = {
  userId: req.user.userId,
  mes
};

if (carteraId) {
  if (!mongoose.Types.ObjectId.isValid(carteraId as string)) {
    res.status(400).json({
      success: false,
      error: 'ID de cartera inválido'
    });
    return;
  }

  const cartera = await Cartera.findOne({ 
    _id: carteraId, 
    userId: req.user.userId 
  });

  if (!cartera) {
    res.status(404).json({
      success: false,
      error: 'Cartera no encontrada o no pertenece al usuario'
    });
    return;
  }

  filter.carteraId = carteraId;
}

const total = await Gasto.aggregate([
  { $match: filter },
  { $group: { _id: null, total: { $sum: '$monto' } } }
]);
```

**Nota:** Aplicar estos cambios a todos los endpoints que filtran por mes, categoría, etc.

---

### Paso 5: Integrar Rutas en Server y Testing

**Archivo a modificar:** `src/server.ts`

**Cambios a realizar:**

```typescript
// 1. Importar las rutas
import { carteraRoutes } from './routes/cartera.routes';

// 2. Agregar después de las rutas existentes
app.use('/api/carteras', carteraRoutes);

// 3. Actualizar endpoint raíz con nueva ruta
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Bienvenido al API del Gestor Backend',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      carteras: '/api/carteras',  // ← Agregar esta línea
      gastos: '/api/gastos',
      ingresos: '/api/ingresos',
      categorias: '/api/categorias',
      presupuestos: '/api/presupuestos',
      dashboard: '/api/dashboard',
      mensajes: '/api/mensajes',
      chat: '/api/chat',
      notificaciones: '/api/notificaciones',
      example: '/api/example'
    },
    timestamp: new Date().toISOString()
  });
});
```

**Testing con Postman/Thunder Client:**

1. **Obtener todas las carteras:**
   ```
   GET http://localhost:4444/api/carteras
   Headers: Authorization: Bearer <token>
   ```

2. **Crear cartera:**
   ```
   POST http://localhost:4444/api/carteras
   Headers: 
     Authorization: Bearer <token>
     Content-Type: application/json
   Body (JSON):
   {
     "nombre": "Personal",
     "descripcion": "Cartera para gastos personales"
   }
   ```

3. **Obtener cartera por ID:**
   ```
   GET http://localhost:4444/api/carteras/:id
   Headers: Authorization: Bearer <token>
   ```

4. **Actualizar cartera:**
   ```
   PUT http://localhost:4444/api/carteras/:id
   Headers: 
     Authorization: Bearer <token>
     Content-Type: application/json
   Body (JSON):
   {
     "nombre": "Personal Actualizado",
     "descripcion": "Nueva descripción"
   }
   ```

5. **Eliminar cartera (mantener datos):**
   ```
   DELETE http://localhost:4444/api/carteras/:id?deleteData=false
   Headers: Authorization: Bearer <token>
   ```

6. **Eliminar cartera (eliminar datos):**
   ```
   DELETE http://localhost:4444/api/carteras/:id?deleteData=true
   Headers: Authorization: Bearer <token>
   ```

7. **Obtener gastos filtrados por cartera:**
   ```
   GET http://localhost:4444/api/gastos/noviembre?carteraId=507f1f77bcf86cd799439011
   Headers: Authorization: Bearer <token>
   ```

8. **Crear gasto con cartera:**
   ```
   POST http://localhost:4444/api/gastos
   Headers: 
     Authorization: Bearer <token>
     Content-Type: application/json
   Body (JSON):
   {
     "descripcion": "Compra supermercado",
     "monto": 150.50,
     "fecha": "2024-11-15T10:00:00Z",
     "categoria": "Alimentación",
     "mes": "noviembre",
     "carteraId": "507f1f77bcf86cd799439011"
   }
   ```

**Estructura de respuestas esperadas:**

```typescript
// GET /api/carteras
{
  success: true,
  data: [
    {
      _id: string,
      userId: string,
      nombre: string,
      descripcion?: string,
      createdAt: string (ISO),
      updatedAt: string (ISO)
    }
  ]
}

// POST /api/carteras
{
  success: true,
  data: { /* objeto cartera creado */ },
  message: "Cartera creada exitosamente"
}

// PUT /api/carteras/:id
{
  success: true,
  data: { /* objeto cartera actualizado */ },
  message: "Cartera actualizada exitosamente"
}

// DELETE /api/carteras/:id
{
  success: true,
  message: "Cartera eliminada exitosamente"
}
```

---

## 📁 Estructura de Archivos

```
src/
├── models/
│   ├── Cartera.model.ts          ✅ (nuevo)
│   ├── Gasto.model.ts            ✅ (modificar - agregar carteraId)
│   ├── Ingreso.model.ts          ✅ (modificar - agregar carteraId)
│   └── Presupuesto.model.ts      ✅ (modificar - agregar carteraId)
├── controllers/
│   ├── cartera.controller.ts     ✅ (nuevo)
│   ├── gasto.controller.ts        ✅ (modificar - agregar filtros)
│   ├── ingreso.controller.ts      ✅ (modificar - agregar filtros)
│   └── presupuesto.controller.ts  ✅ (modificar - agregar filtros)
├── routes/
│   └── cartera.routes.ts          ✅ (nuevo)
└── server.ts                      ✅ (modificar - registrar rutas)
```

---

## 📝 Notas Técnicas

- Todas las rutas protegidas con middleware `authenticate`
- Usar `AuthRequest` para acceder a `req.user.userId`
- Validar que `carteraId` pertenezca al usuario antes de usarlo
- El campo `carteraId` es opcional en todos los modelos para mantener retrocompatibilidad
- Los datos existentes sin `carteraId` se consideran de la "cartera por defecto" (null)
- Usar `lean()` en consultas de solo lectura para mejor rendimiento
- Los índices compuestos optimizan las consultas por usuario, mes y cartera
- Al eliminar una cartera, decidir si eliminar o mantener los datos asociados

---

## 🔒 Seguridad y Validaciones

### Validaciones de Seguridad

1. **Autenticación requerida:** Todos los endpoints requieren token JWT válido
2. **Autorización:** Los usuarios solo pueden acceder a sus propias carteras
3. **Validación de carteraId:** 
   - Si se proporciona `carteraId`, verificar que pertenezca al usuario autenticado
   - Si no pertenece al usuario, retornar error 404
4. **Unicidad de nombre:** No puede haber dos carteras con el mismo nombre para el mismo usuario

### Validaciones de Datos

**Cartera:**
- `nombre`: Requerido, no vacío, máximo 100 caracteres, trim
- `descripcion`: Opcional, máximo 500 caracteres, trim

**carteraId en Gastos/Ingresos/Presupuestos:**
- Opcional (puede ser null o undefined)
- Si se proporciona, debe ser un ObjectId válido
- Debe existir en la colección de carteras y pertenecer al usuario

---

## 🔄 Retrocompatibilidad

### Estrategia de Migración

Los datos existentes (gastos, ingresos, presupuestos) que no tienen `carteraId` se consideran parte de la "cartera por defecto" (null).

**Sin migración automática (recomendado):**
- Los datos existentes quedan con `carteraId = null`
- El frontend puede crear una cartera "Por Defecto" y asignarla manualmente si lo desea
- Los endpoints funcionan correctamente con o sin `carteraId`

**Nota:** No se requiere script de migración. El sistema funciona correctamente con datos existentes sin `carteraId`.

---

## ✅ Checklist de Verificación

- [ ] Modelo `Cartera` creado con índices apropiados
- [ ] Campo `carteraId` agregado a modelos `Gasto`, `Ingreso`, `Presupuesto`
- [ ] Índices compuestos agregados para optimizar consultas
- [ ] Controlador de carteras creado con todas las funciones
- [ ] Rutas de carteras creadas y conectadas al controlador
- [ ] Todas las rutas protegidas con middleware `authenticate`
- [ ] Validaciones implementadas (nombre único, carteraId válido)
- [ ] Manejo de errores consistente
- [ ] Controladores de gastos, ingresos y presupuestos modificados para filtrar por cartera
- [ ] Rutas registradas en `server.ts`
- [ ] Endpoint raíz actualizado
- [ ] Testing completo con Postman/Thunder Client
- [ ] Verificar que usuarios solo accedan a sus propias carteras
- [ ] Verificar filtrado por cartera en endpoints de gastos, ingresos y presupuestos
- [ ] Documentación de endpoints completa

---

**Última actualización:** 2024-11-16


