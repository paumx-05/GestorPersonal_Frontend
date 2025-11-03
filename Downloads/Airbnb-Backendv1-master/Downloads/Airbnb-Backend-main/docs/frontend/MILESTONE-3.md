# 🎯 MILESTONE 3: Sistema de notificaciones y personalización de perfil

## 📋 Objetivo
Crear un sistema completo de notificaciones y todos los componentes necesarios para personalizar el perfil del usuario, con persistencia mock y UX consistente.

## ✅ Primeros 5 pasos (TO-DO)

1) Implementar NotificationsContext con CRUD y persistencia
- Tipos: Notification, NotificationSettings
- Acciones: add, markAsRead, markAllAsRead, remove, clearAll
- Ajustes: updateSettings, muteAll
- Persistencia: localStorage

2) Crear componentes de notificaciones (UI)
- NotificationItem: ver, marcar leída, eliminar
- NotificationList: scrollable, acciones globales
- NotificationBell: badge con no leídos y menú desplegable

3) Integrar notificaciones en la app
- Añadir NotificationBell al `Header` solo si autenticado
- Envolver app con `NotificationsProvider` en `app/layout.tsx`

4) Añadir configuración de notificaciones en perfil
- Componente `ProfileNotificationSettings` con toggles (email, push, sonido, marketing, muteAll)
- Botón “Probar notificación”

5) Crear componentes para personalizar el perfil y conectarlos al contexto
- `ProfileEditForm`: editar nombre (email de solo lectura), guardar en contexto
- `AvatarUploader`: cambiar avatar mediante URL y reflejarlo en la UI inmediatamente
- `ChangePasswordForm`: cambio de contraseña simulado con validaciones
- Integrar los 3 en `app/profile/page.tsx` dentro de tarjetas

### Subtareas específicas (perfil)
- Añadir botón para previsualizar y guardar avatar
- Guardar avatar en `localStorage` (mock) y emitir evento `profile:avatarUpdated`
- Escuchar `profile:avatarUpdated` en `app/profile/page.tsx` para refrescar avatar mostrado
- Validar URL de imagen y fallback a iniciales
 - Añadir subida de imagen (input file) dentro de `ProfileEditForm` con previsualización
 - Convertir imagen a data URL (base64) para persistencia mock en `localStorage`
 - Botón “Usar esta imagen” que sobrescriba el avatar actual

---

## Criterios de aceptación
- Notificaciones funcionales con contador y lista interactiva
- Configuración de notificaciones persistente
- Edición de perfil (nombre) y avatar actualizan el estado del usuario
- Cambio de contraseña con validaciones client-side
- Sin errores de linter ni consola
