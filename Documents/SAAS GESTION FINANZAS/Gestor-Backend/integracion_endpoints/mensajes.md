# Integración Endpoints: Mensajes

## Objetivo
Crear todas las rutas REST API necesarias para la gestión de mensajes, permitiendo crear, leer, marcar como leídos y eliminar mensajes.

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos (Modelo `Mensaje` ya existe)
- **Express.js**: Framework web
- **TypeScript**: Lenguaje de programación
- **REST API**: Estándares REST con métodos HTTP apropiados

---

## 📝 Pasos de Implementación

### Paso 1: Crear Controlador de Mensajes

**Archivo a crear:** `src/controllers/mensaje.controller.ts`

**Funciones a implementar:**
- `getMensajes`: Obtener todos los mensajes del usuario, filtrar por `leido` (query param)
- `getMensajeById`: Obtener mensaje específico por ID
- `createMensaje`: Crear nuevo mensaje (remitente, asunto, contenido)
- `markAsLeido`: Marcar mensaje como leído
- `markAllAsLeidos`: Marcar todos los mensajes como leídos
- `deleteMensaje`: Eliminar mensaje por ID
- `deleteAllMensajes`: Eliminar todos los mensajes del usuario

**Validaciones:**
- `remitente`: Requerido, string no vacío
- `asunto`: Requerido, string no vacío
- `contenido`: Requerido, string no vacío
- `leido`: Opcional, boolean, default: false

---

### Paso 2: Crear Rutas de Mensajes

**Archivo a crear:** `src/routes/mensaje.routes.ts`

**Endpoints:**
```
GET    /api/mensajes                    - Obtener todos los mensajes (query: ?leido=true/false)
GET    /api/mensajes/:id                 - Obtener mensaje por ID
POST   /api/mensajes                    - Crear nuevo mensaje
PUT    /api/mensajes/:id/leido           - Marcar como leído
PUT    /api/mensajes/leer-todos          - Marcar todos como leídos
DELETE /api/mensajes/:id                 - Eliminar mensaje
DELETE /api/mensajes                     - Eliminar todos los mensajes
```

---

### Paso 3: Validaciones y Manejo de Errores

**Validaciones:**
- Validar campos requeridos (remitente, asunto, contenido)
- Verificar que el mensaje pertenezca al usuario antes de actualizar/eliminar
- Ordenar mensajes por fecha descendente (más recientes primero)

**Manejo de errores:**
- Respuestas consistentes: `{ success: boolean, data?: any, error?: string, message?: string }`
- Códigos HTTP: 200, 201, 400, 401, 404, 500

---

### Paso 4: Integrar Rutas en Server

**Archivo a modificar:** `src/server.ts`

```typescript
import { mensajeRoutes } from './routes/mensaje.routes';
app.use('/api/mensajes', mensajeRoutes);
// Actualizar endpoint raíz
```

---

### Paso 5: Testing y Documentación

**Ejemplos de request/response:**

```typescript
// GET /api/mensajes?leido=false
{
  success: true,
  data: [
    {
      _id: string,
      userId: string,
      remitente: string,
      asunto: string,
      contenido: string,
      leido: boolean,
      createdAt: string (ISO)
    }
  ]
}

// POST /api/mensajes
{
  "remitente": "Sistema",
  "asunto": "Recordatorio de pago",
  "contenido": "Debes pagar 30€ por el gasto..."
}
```

---

## ✅ Checklist de Verificación

- [ ] Controlador creado con todas las funciones
- [ ] Rutas creadas y protegidas con `authenticate`
- [ ] Validaciones implementadas
- [ ] Filtrado por estado leído funcionando
- [ ] Rutas registradas en `server.ts`
- [ ] Testing completo
- [ ] Verificar que usuarios solo accedan a sus propios mensajes


