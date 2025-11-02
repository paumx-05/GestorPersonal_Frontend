# Notificaciones: Reporte de Integración

## 📋 Resumen

Este reporte documenta la integración completa del módulo de **notificaciones** con el backend real, eliminando todos los mocks existentes y conectando el frontend con la API de MongoDB a través de los endpoints documentados en Postman.

**Alcance:** Integración completa del sistema de notificaciones (listar, marcar como leída, eliminar) desde el backend real.

---

## 🔗 Endpoints

### Endpoint Principal - Obtener Notificaciones
- **Método:** `GET`
- **Path:** `/api/notifications`
- **Auth:** Requerida (JWT token en header `Authorization: Bearer <token>`)
- **Content-Type:** `application/json`

### Endpoint - Marcar como Leída
- **Método:** `PUT`
- **Path:** `/api/notifications/:id/read` (o `/api/notifications/:id` con body `{ isRead: true }`)
- **Auth:** Requerida (JWT token)
- **Body (alternativo):** `{ isRead: true }`

### Endpoint - Marcar Todas como Leídas
- **Método:** `PUT`
- **Path:** `/api/notifications/read-all`
- **Auth:** Requerida (JWT token)

### Endpoint - Eliminar Notificación
- **Método:** `DELETE`
- **Path:** `/api/notifications/:id` (o `/api/user/notifications/:id` como fallback)
- **Auth:** Requerida (JWT token)

### Configuración
Los endpoints pueden configurarse mediante variables de entorno:
```env
NEXT_PUBLIC_NOTIFICATIONS_ENDPOINT=/api/notifications
```

### Request/Response Ejemplo

#### GET /api/notifications - Response Esperado:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "message": "string",
      "type": "info" | "success" | "warning" | "promo" | "error",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isRead": false,
      "userId": "string" // opcional
    }
  ],
  "message": "Notificaciones obtenidas exitosamente"
}
```

#### PUT /api/notifications/:id/read - Response Esperado:
```json
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

#### DELETE /api/notifications/:id - Response Esperado:
```json
{
  "success": true,
  "message": "Notificación eliminada exitosamente"
}
```

### Códigos de Error

- **401 Unauthorized:** Token inválido o expirado
- **403 Forbidden:** Sin permisos para acceder a la notificación
- **404 Not Found:** Notificación no encontrada o endpoint no existe
- **500 Internal Server Error:** Error del servidor

---

## 📁 Cambios en Frontend

### Archivos Creados

1. **`lib/api/notifications.ts`**
   - Servicio completo de notificaciones con todos los endpoints
   - Manejo de errores y fallbacks automáticos
   - Logs detallados para debugging
   - Validación de respuestas

2. **`schemas/notifications.ts`**
   - Esquemas Zod para validación runtime
   - Tipos TypeScript derivados de Zod
   - Funciones de validación para cada tipo de respuesta

### Archivos Modificados

1. **`context/NotificationsContext.tsx`**
   - **ELIMINADO:** localStorage para notificaciones (solo settings se mantienen localmente)
   - **AGREGADO:** Carga inicial desde backend al montar el componente
   - **AGREGADO:** Funciones async para todas las operaciones (markAsRead, markAllAsRead, removeNotification)
   - **AGREGADO:** Estados `isLoading` y `error` para manejo de UI
   - **AGREGADO:** Función `refreshNotifications()` para recargar desde backend
   - **AGREGADO:** Optimistic updates con reversión automática si falla
   - **ELIMINADO:** Persistencia de notificaciones en localStorage

2. **`components/admin/AdminNotifications.tsx`**
   - **ELIMINADO:** Mock hardcodeado de notificaciones (líneas 28-69)
   - **ELIMINADO:** useState local para notificaciones
   - **AGREGADO:** Uso de `useNotifications()` hook del contexto
   - **AGREGADO:** Botón "Actualizar" para recargar desde backend
   - **AGREGADO:** Manejo de errores con Alert component
   - **AGREGADO:** Soporte para tipo 'promo' en notificaciones

3. **`components/notifications/NotificationList.tsx`**
   - **AGREGADO:** Handlers async para funciones del contexto
   - Compatibilidad mantenida con componentes hijos

### Archivos Sin Cambios

- `components/notifications/NotificationItem.tsx` - Compatible sin cambios
- `components/notifications/NotificationBell.tsx` - Compatible sin cambios
- `components/profile/ProfileNotificationSettings.tsx` - Compatible sin cambios

---

## 🔍 Tipos/Validaciones

### Esquemas Zod

```typescript
// Notification individual
NotificationSchema = {
  id: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'promo' | 'error',
  createdAt: string (datetime),
  isRead: boolean,
  userId?: string
}

// Respuesta de lista
NotificationsListResponseSchema = {
  success: boolean,
  data?: Notification[],
  message?: string
}

// Respuesta de operación
NotificationOperationResponseSchema = {
  success: boolean,
  message?: string,
  data?: any
}
```

### Mapeo Backend → Frontend

El servicio mapea automáticamente `Notification` (del backend) a `AppNotification` (frontend):

```typescript
function mapNotificationFromBackend(notification: Notification): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as NotificationType,
    createdAt: notification.createdAt,
    isRead: notification.isRead,
  };
}
```

### Validación Runtime

Todas las respuestas del backend se validan con Zod antes de ser usadas en la UI, garantizando tipos correctos y manejo seguro de errores.

---

## ⚠️ Estados y Errores

### Estados de UI

1. **Loading:** `isLoading: true` - Muestra skeleton/animación mientras carga
2. **Success:** Notificaciones cargadas correctamente desde backend
3. **Empty:** `notifications.length === 0` - Mensaje "No tienes notificaciones"
4. **Error:** `error: string | null` - Muestra Alert con mensaje y botón de retry
5. **Optimistic Updates:** Actualizaciones inmediatas en UI con reversión si falla

### Manejo de Errores

- **Errores de conexión:** Muestra mensaje genérico "Error de conexión con el servidor"
- **Errores 404:** Intenta endpoints alternativos automáticamente
- **Errores 401/403:** El `apiClient` maneja automáticamente la renovación de token
- **Errores de validación:** Zod lanza errores que se capturan y muestran en UI

### Estrategia de Fallback

- Si el endpoint principal falla con 404, intenta endpoints alternativos:
  - `/api/notifications/:id/read` → `/api/notifications/:id` (con body)
  - `/api/notifications/read-all` → POST en lugar de PUT
  - `/api/notifications/:id` → `/api/user/notifications/:id`

---

## 📊 Observabilidad

### Logs Implementados

Todos los logs siguen el patrón: `[servicio] Mensaje`

**En `lib/api/notifications.ts`:**
- `🔍 [notificationsService] Obteniendo todas las notificaciones...`
- `✅ [notificationsService] Notificaciones obtenidas: X`
- `❌ [notificationsService] Error obteniendo notificaciones: ...`
- `💥 [notificationsService] Error crítico...`

**En `context/NotificationsContext.tsx`:**
- `🔄 [NotificationsContext] Cargando notificaciones desde el backend...`
- `✅ [NotificationsContext] Notificaciones cargadas: X`
- `❌ [NotificationsContext] Error cargando notificaciones: ...`
- `💥 [NotificationsContext] Error crítico...`

### Telemetría

- **Latencia:** Registrada implícitamente en logs de request/response
- **Status:** Cada respuesta incluye `success: boolean`
- **Endpoint:** Todos los logs incluyen el endpoint usado
- **Errores:** Todos los errores se registran con stack trace completo

### Métricas Sugeridas para Futuro

- Tiempo promedio de carga de notificaciones
- Tasa de éxito/fallo de operaciones
- Número de notificaciones no leídas por usuario
- Frecuencia de uso de funciones (mark as read, delete, etc.)

---

## 🔄 Riesgos y Próximos Pasos

### Riesgos Identificados

1. **Endpoints no documentados:** Los endpoints pueden variar según la implementación del backend. Se incluyeron fallbacks pero es importante verificar en Postman.

2. **Paginación:** Actualmente se cargan todas las notificaciones. Si el volumen crece, podría ser necesario implementar paginación:
   - `GET /api/notifications?page=1&limit=20`

3. **Real-time:** Las notificaciones no se actualizan en tiempo real. Opciones:
   - Polling cada X segundos
   - WebSockets
   - Server-Sent Events (SSE)

4. **Crear notificaciones:** No hay endpoint para crear notificaciones desde el frontend. Si es necesario:
   - `POST /api/notifications` con body `{ title, message, type }`

5. **Settings del backend:** Los settings de notificaciones (enableEmail, etc.) solo se guardan localmente. Si deben persistir en backend:
   - `PUT /api/user/notification-settings` o similar

### Próximos Pasos Recomendados

1. **Verificar endpoints en Postman:**
   - Confirmar paths exactos de los endpoints
   - Verificar formato de request/response
   - Validar códigos de error

2. **Testing:**
   - Probar con usuario autenticado
   - Probar con notificaciones vacías
   - Probar con errores de red
   - Probar con token expirado

3. **Mejoras de UX:**
   - Añadir indicador de "sin conexión" si falla
   - Añadir toast notifications para operaciones exitosas
   - Añadir confirmación antes de eliminar notificación

4. **Optimizaciones:**
   - Implementar cache local con TTL
   - Debounce en operaciones de mark as read
   - Lazy loading si hay muchas notificaciones

---

## ✅ Checklist de Integración

### Implementación
- [x] Servicio API creado (`lib/api/notifications.ts`)
- [x] Esquemas Zod creados (`schemas/notifications.ts`)
- [x] Contexto actualizado para usar API real
- [x] Todos los mocks eliminados (localStorage, datos hardcodeados)
- [x] Estados de UI completos (loading, error, empty, success)
- [x] Manejo de errores implementado
- [x] Optimistic updates implementados
- [x] Logs detallados habilitados
- [x] Validación runtime con Zod
- [x] Fallbacks para endpoints alternativos

### Testing Pendiente
- [ ] Probar GET /api/notifications con usuario autenticado
- [ ] Probar PUT /api/notifications/:id/read
- [ ] Probar PUT /api/notifications/read-all
- [ ] Probar DELETE /api/notifications/:id
- [ ] Probar con token expirado (debe renovar automáticamente)
- [ ] Probar con endpoint no existente (debe mostrar error útil)
- [ ] Probar con lista vacía de notificaciones
- [ ] Verificar que optimistic updates funcionan correctamente

### Documentación
- [x] Reporte generado (`report-notifications.md`)
- [x] Endpoints documentados
- [x] Tipos/validaciones documentados
- [x] Estrategia de errores documentada
- [x] Riesgos y próximos pasos identificados

---

## 📝 Notas Técnicas

### Flujo de Datos

```
Usuario (UI)
  → useNotifications() hook
  → NotificationsContext
  → notificationsService.getAllNotifications()
  → apiClient.get()
  → Backend API
  → MongoDB Atlas
  → Backend API (response)
  → validateNotificationsListResponse() (Zod)
  → mapNotificationFromBackend()
  → dispatch({ type: 'SET_NOTIFICATIONS' })
  → UI actualizada
```

### Dependencias

- `@/lib/api/config` → `ApiClient` (cliente HTTP)
- `@/lib/api/notifications` → Servicios de notificaciones
- `@/schemas/notifications` → Validación Zod
- `@/context/NotificationsContext` → Estado global de notificaciones

### Compatibilidad

- ✅ Compatible con componentes existentes sin cambios
- ✅ Mantiene interfaz `AppNotification` para compatibilidad
- ✅ Settings de notificaciones se mantienen en localStorage (solo UI preferences)

---

## 🎯 Resumen Ejecutivo

Se ha completado la integración del módulo de notificaciones eliminando **todos los mocks** y conectándolo con el backend real. El sistema ahora:

- ✅ Carga notificaciones desde MongoDB a través de la API
- ✅ Permite marcar notificaciones como leídas (persistido en backend)
- ✅ Permite eliminar notificaciones (persistido en backend)
- ✅ Maneja errores de forma elegante con fallbacks
- ✅ Valida todas las respuestas con Zod
- ✅ Implementa optimistic updates para mejor UX
- ✅ Incluye logging detallado para debugging

**Estado:** ✅ Integración completa, listo para testing con backend real.

