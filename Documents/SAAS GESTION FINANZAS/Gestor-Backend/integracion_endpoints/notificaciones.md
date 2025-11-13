# Integración Endpoints: Notificaciones

## Objetivo
Crear todas las rutas REST API necesarias para la gestión de notificaciones, permitiendo crear, leer, marcar como leídas y eliminar notificaciones, con filtrado por tipo.

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos (Modelo `Notificacion` ya existe)
- **Express.js**: Framework web
- **TypeScript**: Lenguaje de programación
- **REST API**: Estándares REST con métodos HTTP apropiados

---

## 📝 Pasos de Implementación

### Paso 1: Crear Controlador de Notificaciones

**Archivo a crear:** `src/controllers/notificacion.controller.ts`

**Funciones a implementar:**
- `getNotificaciones`: Obtener todas las notificaciones, filtrar por `leida` y `tipo` (query params)
- `getNotificacionById`: Obtener notificación específica por ID
- `createNotificacion`: Crear nueva notificación (tipo, titulo, mensaje)
- `markAsLeida`: Marcar notificación como leída
- `markAllAsLeidas`: Marcar todas las notificaciones como leídas
- `deleteNotificacion`: Eliminar notificación por ID
- `deleteAllNotificaciones`: Eliminar todas las notificaciones del usuario

**Validaciones:**
- `tipo`: Requerido, enum: `['info', 'success', 'warning', 'error']`
- `titulo`: Requerido, string no vacío
- `mensaje`: Requerido, string no vacío
- `leida`: Opcional, boolean, default: false

---

### Paso 2: Crear Rutas de Notificaciones

**Archivo a crear:** `src/routes/notificacion.routes.ts`

**Endpoints:**
```
GET    /api/notificaciones                    - Obtener todas (query: ?leida=true/false&tipo=info)
GET    /api/notificaciones/:id                 - Obtener notificación por ID
GET    /api/notificaciones/tipo/:tipo          - Obtener por tipo
POST   /api/notificaciones                    - Crear nueva notificación
PUT    /api/notificaciones/:id/leida           - Marcar como leída
PUT    /api/notificaciones/leer-todas          - Marcar todas como leídas
DELETE /api/notificaciones/:id                 - Eliminar notificación
DELETE /api/notificaciones                     - Eliminar todas
```

---

### Paso 3: Validaciones y Manejo de Errores

**Validaciones:**
- Validar tipo (enum: info, success, warning, error)
- Validar campos requeridos (titulo, mensaje)
- Verificar que la notificación pertenezca al usuario antes de actualizar/eliminar
- Ordenar notificaciones por fecha descendente (más recientes primero)

**Manejo de errores:**
- Respuestas consistentes: `{ success: boolean, data?: any, error?: string, message?: string }`
- Códigos HTTP: 200, 201, 400, 401, 404, 500

---

### Paso 4: Integrar Rutas en Server

**Archivo a modificar:** `src/server.ts`

```typescript
import { notificacionRoutes } from './routes/notificacion.routes';
app.use('/api/notificaciones', notificacionRoutes);
// Actualizar endpoint raíz
```

---

### Paso 5: Testing y Documentación

**Ejemplos de request/response:**

```typescript
// GET /api/notificaciones?leida=false&tipo=error
{
  success: true,
  data: [
    {
      _id: string,
      userId: string,
      tipo: 'info' | 'success' | 'warning' | 'error',
      titulo: string,
      mensaje: string,
      leida: boolean,
      createdAt: string (ISO)
    }
  ]
}

// POST /api/notificaciones
{
  "tipo": "warning",
  "titulo": "Presupuesto excedido",
  "mensaje": "Has excedido el presupuesto de Alimentación"
}
```

---

## ✅ Checklist de Verificación

- [ ] Controlador creado con todas las funciones
- [ ] Rutas creadas y protegidas con `authenticate`
- [ ] Validaciones implementadas (tipo válido)
- [ ] Filtrado por estado leída y tipo funcionando
- [ ] Rutas registradas en `server.ts`
- [ ] Testing completo
- [ ] Verificar que usuarios solo accedan a sus propias notificaciones


