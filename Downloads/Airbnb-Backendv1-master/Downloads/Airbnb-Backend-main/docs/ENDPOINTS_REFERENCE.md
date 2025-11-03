# 🚀 Airbnb Backend API - Referencia Rápida de Endpoints

## 📋 **INFORMACIÓN BÁSICA**

- **Base URL**: `http://localhost:5000`
- **Autenticación**: `Authorization: Bearer <token>`
- **Formato**: JSON

---

## 🔐 **AUTENTICACIÓN** (`/api/auth`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Registrar nuevo usuario |
| POST | `/api/auth/login` | ❌ | Iniciar sesión |
| POST | `/api/auth/logout` | ❌ | Cerrar sesión |
| GET | `/api/auth/me` | ✅ | Obtener perfil del usuario |
| POST | `/api/auth/forgot-password` | ❌ | Solicitar recuperación de contraseña |
| POST | `/api/auth/reset-password` | ❌ | Restablecer contraseña |
| GET | `/api/auth/test` | ⚪ | Ruta de prueba (auth opcional) |

---

## 👥 **USUARIOS** (`/api/users`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/users` | ✅ | Listar usuarios (paginado) |
| GET | `/api/users/stats` | ✅ | Estadísticas de usuarios |
| GET | `/api/users/:id` | ✅ | Obtener usuario por ID |
| POST | `/api/users` | ✅ | Crear nuevo usuario |
| PUT | `/api/users/:id` | ✅ | Actualizar usuario |
| DELETE | `/api/users/:id` | ✅ | Eliminar usuario (soft delete) |

**Query Params para GET /api/users:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Usuarios por página (default: 10, max: 100)
- `search` (opcional): Buscar por nombre o email

---

## 🛒 **CARRITO** (`/api/cart`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/cart` | ✅ | Obtener carrito del usuario |
| POST | `/api/cart/add` | ✅ | Agregar item al carrito |
| DELETE | `/api/cart/remove/:itemId` | ✅ | Eliminar item del carrito |
| PUT | `/api/cart/update/:itemId` | ✅ | Actualizar item del carrito |
| DELETE | `/api/cart/clear` | ✅ | Limpiar carrito completo |
| GET | `/api/cart/summary` | ✅ | Resumen del carrito |
| GET | `/api/cart/item/:itemId` | ✅ | Obtener item específico |
| POST | `/api/cart/check-availability` | ✅ | Verificar disponibilidad |
| GET | `/api/cart/stats` | ✅ | Estadísticas del carrito (admin) |

---

## ❤️ **FAVORITOS** (`/api/favorites`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/favorites` | ✅ | Agregar a favoritos |
| DELETE | `/api/favorites/:propertyId` | ✅ | Remover de favoritos |
| GET | `/api/favorites` | ✅ | Obtener favoritos del usuario |
| GET | `/api/favorites/:propertyId/status` | ✅ | Verificar estado de favorito |
| POST | `/api/favorites/wishlists` | ✅ | Crear wishlist |
| GET | `/api/favorites/wishlists` | ✅ | Obtener wishlists del usuario |
| GET | `/api/favorites/wishlists/public` | ❌ | Obtener wishlists públicas |
| GET | `/api/favorites/wishlists/:id` | ✅ | Obtener wishlist específica |
| PUT | `/api/favorites/wishlists/:id` | ✅ | Actualizar wishlist |
| DELETE | `/api/favorites/wishlists/:id` | ✅ | Eliminar wishlist |
| POST | `/api/favorites/wishlists/:id/properties` | ✅ | Agregar propiedad a wishlist |
| DELETE | `/api/favorites/wishlists/:id/properties/:propertyId` | ✅ | Remover propiedad de wishlist |
| GET | `/api/favorites/stats` | ✅ | Estadísticas de favoritos |

---

## 🏠 **HOST** (`/api/host`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/host/properties` | ✅ | Obtener propiedades del host |
| POST | `/api/host/properties` | ✅ | Crear nueva propiedad |
| GET | `/api/host/properties/:id` | ✅ | Obtener propiedad específica |
| PUT | `/api/host/properties/:id` | ✅ | Actualizar propiedad |
| DELETE | `/api/host/properties/:id` | ✅ | Eliminar propiedad |
| GET | `/api/host/properties/:id/reservations` | ✅ | Reservas de propiedad |
| GET | `/api/host/properties/:id/reviews` | ✅ | Reviews de propiedad |
| GET | `/api/host/stats` | ✅ | Estadísticas del host |

---

## 🔔 **NOTIFICACIONES** (`/api/notifications`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/notifications` | ✅ | Obtener notificaciones |
| PATCH | `/api/notifications/:id/read` | ✅ | Marcar como leída |
| PATCH | `/api/notifications/mark-all-read` | ✅ | Marcar todas como leídas |
| DELETE | `/api/notifications/:id` | ✅ | Eliminar notificación |
| DELETE | `/api/notifications/clear-all` | ✅ | Limpiar todas las notificaciones |
| POST | `/api/notifications/test` | ✅ | Crear notificación de prueba |
| GET | `/api/notifications/settings` | ✅ | Obtener configuración |
| PUT | `/api/notifications/settings` | ✅ | Actualizar configuración |

**Query Params para GET /api/notifications:**
- `limit` (opcional): Número de notificaciones (default: 50)
- `type` (opcional): Filtrar por tipo

---

## 💳 **PAGOS** (`/api/payments`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/payments/checkout/calculate` | ✅ | Calcular total del checkout |
| POST | `/api/payments/checkout/process` | ✅ | Procesar pago |
| GET | `/api/payments/methods` | ✅ | Métodos de pago disponibles |
| GET | `/api/payments/transactions` | ✅ | Historial de transacciones |
| GET | `/api/payments/transactions/:id` | ✅ | Transacción específica |
| POST | `/api/payments/transactions/:id/refund` | ✅ | Procesar reembolso |

---

## 👤 **PERFIL** (`/api/profile`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| PUT | `/api/profile` | ✅ | Actualizar perfil |
| POST | `/api/profile/change-password` | ✅ | Cambiar contraseña |
| GET | `/api/profile/settings` | ✅ | Obtener configuración |
| PUT | `/api/profile/settings` | ✅ | Actualizar configuración |

---

## 🏘️ **PROPIEDADES** (`/api/properties`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/properties/:id` | ❌ | Obtener propiedad específica |
| GET | `/api/properties/popular` | ❌ | Propiedades populares |

**Query Params para GET /api/properties/popular:**
- `limit` (opcional): Número de propiedades (default: 10)

---

## 📅 **RESERVAS** (`/api/reservations`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/reservations/check-availability` | ❌ | Verificar disponibilidad |
| POST | `/api/reservations` | ✅ | Crear nueva reserva |
| GET | `/api/reservations/my-reservations` | ✅ | Mis reservas |
| PATCH | `/api/reservations/:id/status` | ✅ | Actualizar estado de reserva |

**Query Params para GET /api/reservations/check-availability:**
- `propertyId`: ID de la propiedad
- `checkIn`: Fecha de entrada (YYYY-MM-DD)
- `checkOut`: Fecha de salida (YYYY-MM-DD)
- `guests`: Número de huéspedes

**Estados de reserva:** `pending`, `confirmed`, `cancelled`, `completed`

---

## ⭐ **REVIEWS** (`/api/reviews`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/reviews/property/:id` | ❌ | Reviews de una propiedad |
| GET | `/api/reviews/property/:id/stats` | ❌ | Estadísticas de reviews |
| POST | `/api/reviews` | ✅ | Crear nueva review |
| GET | `/api/reviews/user/:id` | ✅ | Reviews de un usuario |
| GET | `/api/reviews/stats` | ✅ | Estadísticas generales |
| PUT | `/api/reviews/:id` | ✅ | Actualizar review |
| DELETE | `/api/reviews/:id` | ✅ | Eliminar review |

---

## 🔍 **BÚSQUEDA** (`/api/search`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/search/properties` | ❌ | Buscar propiedades |
| GET | `/api/search/suggestions` | ❌ | Sugerencias de búsqueda |
| GET | `/api/search/filters` | ❌ | Filtros disponibles |

**Query Params para GET /api/search/properties:**
- `location` (opcional): Ubicación a buscar
- `checkIn` (opcional): Fecha de entrada
- `checkOut` (opcional): Fecha de salida
- `guests` (opcional): Número de huéspedes
- `minPrice` (opcional): Precio mínimo
- `maxPrice` (opcional): Precio máximo
- `amenities` (opcional): Amenidades separadas por coma
- `page` (opcional): Página
- `limit` (opcional): Resultados por página

**Query Params para GET /api/search/suggestions:**
- `q`: Término de búsqueda

---

## 📊 **ESTADÍSTICAS** (`/api/stats`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/stats` | ✅ | Estadísticas del sistema (admin) |
| GET | `/api/stats/logs` | ✅ | Ver logs del sistema (admin) |
| POST | `/api/stats/logs/clear` | ✅ | Limpiar logs (admin) |

**Query Params para GET /api/stats/logs:**
- `level` (opcional): Nivel de log (`info`, `warn`, `error`)
- `limit` (opcional): Número de logs (default: 50)

---

## 🔧 **UTILIDADES**

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Información general de la API |
| GET | `/api/health` | ❌ | Health check del servidor |

---

## 📝 **LEGENDA DE AUTENTICACIÓN**

- ✅ **Requerida**: Endpoint requiere token de autenticación
- ❌ **No requerida**: Endpoint público, no requiere autenticación
- ⚪ **Opcional**: Endpoint funciona con o sin autenticación

---

## 🚀 **FLUJOS COMUNES**

### **Flujo de Autenticación**
1. `POST /api/auth/register` o `POST /api/auth/login`
2. Guardar token de la respuesta
3. Usar token en header `Authorization: Bearer <token>`

### **Flujo de Reserva**
1. `GET /api/search/properties` - Buscar propiedades
2. `GET /api/reservations/check-availability` - Verificar disponibilidad
3. `POST /api/cart/add` - Agregar al carrito
4. `POST /api/payments/checkout/calculate` - Calcular total
5. `POST /api/payments/checkout/process` - Procesar pago
6. `POST /api/reservations` - Crear reserva

### **Flujo de Host**
1. `POST /api/host/properties` - Crear propiedad
2. `GET /api/host/properties/:id/reservations` - Ver reservas
3. `GET /api/host/properties/:id/reviews` - Ver reviews
4. `GET /api/host/stats` - Ver estadísticas

---

## ❌ **CÓDIGOS DE ERROR COMUNES**

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Éxito |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Error de validación |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: usuario ya existe) |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error interno del servidor |

---

**Última actualización**: 2024-01-15  
**Versión**: 1.0.0
