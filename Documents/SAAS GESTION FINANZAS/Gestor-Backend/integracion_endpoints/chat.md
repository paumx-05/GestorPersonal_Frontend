# Integración Endpoints: Chat

## Objetivo
Crear todas las rutas REST API necesarias para el sistema de chat individual por amigo, permitiendo enviar mensajes, obtener historial de conversación y gestionar estados de lectura.

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos (Modelo `MensajeChat` ya existe)
- **Express.js**: Framework web
- **TypeScript**: Lenguaje de programación
- **REST API**: Estándares REST con métodos HTTP apropiados

---

## 📝 Pasos de Implementación

### Paso 1: Crear Controlador de Chat

**Archivo a crear:** `src/controllers/chat.controller.ts`

**Funciones a implementar:**
- `getMensajesByAmigo`: Obtener todos los mensajes de un chat específico (filtrar por amigoId y usuario)
- `createMensaje`: Crear nuevo mensaje en el chat (remitenteId, destinatarioId, amigoId, contenido, esSistema)
- `markAsLeido`: Marcar mensajes como leídos
- `markAllAsLeidos`: Marcar todos los mensajes de un chat como leídos
- `getChatsList`: Obtener lista de chats con último mensaje de cada uno

**Validaciones:**
- `amigoId`: Requerido, ObjectId válido, debe existir en Amigos del usuario
- `contenido`: Requerido, string no vacío
- `esSistema`: Opcional, boolean, default: false
- Verificar que el usuario sea remitente o destinatario del mensaje

---

### Paso 2: Crear Rutas de Chat

**Archivo a crear:** `src/routes/chat.routes.ts`

**Endpoints:**
```
GET    /api/chat/amigos                    - Obtener lista de chats con último mensaje
GET    /api/chat/:amigoId/mensajes         - Obtener mensajes de un chat específico
POST   /api/chat/:amigoId/mensajes         - Enviar mensaje en el chat
PUT    /api/chat/:amigoId/leer             - Marcar mensajes como leídos
PUT    /api/chat/:amigoId/leer-todos        - Marcar todos los mensajes como leídos
```

---

### Paso 3: Validaciones y Lógica de Negocio

**Validaciones:**
- Validar que el amigoId exista y pertenezca al usuario
- Validar contenido no vacío
- Verificar que el usuario sea parte de la conversación (remitente o destinatario)
- Ordenar mensajes por fecha ascendente (más antiguos primero)

**Lógica especial:**
- Los mensajes del sistema (`esSistema: true`) se crean automáticamente (ej: recordatorios de pago)
- Filtrar mensajes donde el usuario es remitente o destinatario
- Agrupar chats por amigoId para la lista de chats

---

### Paso 4: Integrar Rutas en Server

**Archivo a modificar:** `src/server.ts`

```typescript
import { chatRoutes } from './routes/chat.routes';
app.use('/api/chat', chatRoutes);
// Actualizar endpoint raíz
```

---

### Paso 5: Testing y Documentación

**Ejemplos de request/response:**

```typescript
// GET /api/chat/:amigoId/mensajes
{
  success: true,
  data: [
    {
      _id: string,
      remitenteId: string,
      destinatarioId: string,
      amigoId: string,
      contenido: string,
      esSistema: boolean,
      leido: boolean,
      createdAt: string (ISO)
    }
  ]
}

// POST /api/chat/:amigoId/mensajes
{
  "contenido": "Hola, ¿cómo estás?",
  "esSistema": false
}

// GET /api/chat/amigos
{
  success: true,
  data: [
    {
      amigoId: string,
      amigoNombre: string,
      ultimoMensaje: {
        contenido: string,
        fecha: string (ISO),
        esSistema: boolean
      },
      noLeidos: number
    }
  ]
}
```

---

## ✅ Checklist de Verificación

- [ ] Controlador creado con todas las funciones
- [ ] Rutas creadas y protegidas con `authenticate`
- [ ] Validaciones implementadas (amigoId válido)
- [ ] Verificar que usuarios solo accedan a sus propios chats
- [ ] Mensajes del sistema funcionando
- [ ] Lista de chats con último mensaje funcionando
- [ ] Rutas registradas en `server.ts`
- [ ] Testing completo
- [ ] Documentación de endpoints completa


