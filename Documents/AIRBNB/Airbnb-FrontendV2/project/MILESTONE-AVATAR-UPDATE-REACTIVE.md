# Fase: Sistema de Actualización Reactiva de Avatares

## 🎯 Objetivo
Implementar actualización automática de avatares en toda la aplicación cuando un usuario actualiza su foto de perfil, asegurando que se refleje en:
- Perfil del usuario
- Propiedades creadas por el usuario (HostInfo)
- Reviews escritas por el usuario (PropertyReviews)

---

## 1. Auditoría del Módulo (Estado Actual)

### Archivos que Muestran Avatares:
1. **`components/profile/ProfileEditForm.tsx`**
   - Actualiza avatar en el contexto con `updateUser()`
   - ✅ Actualiza el contexto AuthContext

2. **`components/HostInfo.tsx`**
   - Muestra avatar del host: `host.avatar`
   - ❌ No se actualiza automáticamente cuando el host cambia su avatar
   - ❌ No tiene cache busting

3. **`components/PropertyReviews.tsx`**
   - Muestra avatar en reviews: `review.user.avatar`
   - ❌ Los avatares vienen del backend y no se actualizan dinámicamente
   - ❌ No tiene cache busting

4. **`components/auth/UserMenu.tsx`**
   - Muestra avatar del usuario autenticado
   - ✅ Usa el contexto AuthContext (se actualiza automáticamente)

### Mapa de Estados UI:
- **Loading:** Avatar placeholder o spinner
- **Success:** Avatar cargado correctamente
- **Error:** Fallback a iniciales o icono por defecto
- **Empty:** Avatar no disponible → mostrar iniciales

### Problemas Identificados:
1. ❌ HostInfo no se actualiza cuando el host cambia su avatar
2. ❌ Reviews no se actualizan cuando el autor cambia su avatar
3. ❌ No hay cache busting para forzar recarga de imágenes
4. ❌ No hay sistema de invalidación de cache cuando se actualiza el avatar
5. ❌ Los avatares en reviews vienen del backend y no se sincronizan con cambios locales

---

## 2. Revisión de Postman → Contrato

### Endpoints Relevantes:

#### GET `/api/properties/:id`
**Response:**
```json
{
  "success": true,
  "data": {
    "host": {
      "name": "Juan Pérez",
      "avatar": "/uploads/avatars/user_789.jpg",
      "isSuperhost": true
    },
    "hostId": "6909010e9b129fce550a26ccb0"
  }
}
```

#### GET `/api/reviews?propertyId={id}`
**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [{
      "user": {
        "id": "user_789",
        "name": "Juan Pérez",
        "avatar": "/uploads/avatars/user_789.jpg"
      }
    }]
  }
}
```

#### PATCH `/api/profile`
**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Juan Pérez",
    "avatar": "/uploads/avatars/new_avatar.jpg"
  }
}
```

### Riesgos Identificados:
- ⚠️ URLs relativas vs absolutas
- ⚠️ Cache del navegador
- ⚠️ Sincronización entre frontend y backend

---

## 3. Plan de Integración

### Flujo de Datos:
```
Usuario actualiza avatar
  ↓
ProfileEditForm → profileService.updateProfile()
  ↓
Backend guarda → Responde con nueva URL
  ↓
updateUser() en AuthContext → Actualiza estado global
  ↓
Evento custom 'user:avatarUpdated' → Notifica componentes
  ↓
HostInfo + PropertyReviews → Escuchan evento → Actualizan avatares
  ↓
Cache busting → Fuerza recarga de imágenes
```

### Config Cliente:
- **React Context:** AuthContext para estado global del usuario
- **Custom Events:** Para notificar actualización de avatar
- **Cache Busting:** Query params con timestamp para forzar recarga
- **URL Helper:** Función para construir URLs completas desde relativas

### Esquemas (Zod/TS):
- ✅ Ya existe `ReviewUserSchema` en `schemas/reviews.ts`
- ✅ Ya existe `User` interface en `lib/api/auth.ts`
- ✅ Ya existe `Property` interface con `host` opcional

### Estrategia de Errores/Retry/Empty States:
- **Error loading avatar:** Fallback a iniciales o icono User
- **URL inválida:** Validación antes de renderizar
- **Cache busting:** Timestamp para forzar recarga
- **Empty state:** Iniciales del nombre o icono por defecto

### Flags/Toggles:
- No requiere flags, siempre usar datos del backend

---

## 4. Implementación (Tareas)

### Tarea 1: Helper para URLs de Avatar
- [ ] Crear `lib/utils/avatar.ts` con función `getAvatarUrl()`
  - Convierte URLs relativas a absolutas
  - Añade cache busting opcional
  - Maneja URLs inválidas

### Tarea 2: Actualizar HostInfo
- [ ] Editar `components/HostInfo.tsx`
  - Usar `getAvatarUrl()` para construir URL completa
  - Añadir cache busting si el usuario es el host
  - Escuchar evento `user:avatarUpdated` si el usuario es el host
  - Forzar re-render cuando cambia el avatar

### Tarea 3: Actualizar PropertyReviews
- [ ] Editar `components/PropertyReviews.tsx`
  - Usar `getAvatarUrl()` para avatares de reviews
  - Añadir cache busting para avatares
  - Escuchar evento `user:avatarUpdated` y actualizar reviews del usuario actual
  - Comparar `review.user.id` con `user.id` para identificar reviews propias

### Tarea 4: Mejorar ProfileEditForm
- [ ] Editar `components/profile/ProfileEditForm.tsx`
  - Después de actualizar, disparar evento `user:avatarUpdated`
  - Incluir nueva URL en el evento

### Tarea 5: Actualizar profileService
- [ ] Editar `lib/api/profile.ts`
  - Asegurar que construye URL completa del avatar
  - Añadir logging para debugging

---

## 5. Checklist Doc

- [ ] Sin usos de mock (ya usa backend real)
- [ ] Contratos tipados y validados (Zod/TS) ✅
- [ ] Estados de UI completos (loading/empty/error/success) ✅
- [ ] Errores manejados con mensajes útiles
- [ ] Sistema de actualización reactiva implementado
- [ ] Cache busting implementado
- [ ] Documentación `report-avatar-update.md` generada

---

## 6. Reporte Final

**Archivo:** `report-avatar-update.md`

**Contenido:**
- Resumen del módulo
- Cambios implementados
- Helper de URLs
- Sistema de eventos
- Cache busting
- Observabilidad

---

**Prioridad:** Alta
**Estimación:** 2-3 horas
**Dependencias:** Ninguna (usa código existente)

