# 🏠 Airbnb Backend API - Documentación Completa

## 📋 **INFORMACIÓN GENERAL**

- **Nombre**: Airbnb Backend API
- **Versión**: 1.0.0
- **Base URL**: `http://localhost:5000`
- **Formato**: JSON
- **Autenticación**: JWT Bearer Token
- **Arquitectura**: REST API con Express.js y TypeScript

---

## 🔐 **AUTENTICACIÓN**

### **Headers Requeridos**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### **Obtener Token**
1. Registrarse: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. El token se devuelve en la respuesta y debe incluirse en headers posteriores

---

## 🌐 **ENDPOINTS COMPLETOS**

### **1. 🔐 AUTENTICACIÓN** (`/api/auth`)

#### **POST** `/api/auth/register`
**Descripción**: Registrar nuevo usuario
**Autenticación**: No requerida

**Request Body**:
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "name": "Usuario Demo"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "usuario@ejemplo.com",
      "name": "Usuario Demo",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validaciones**:
- Email: Formato válido y único
- Password: Mínimo 8 caracteres
- Name: Mínimo 2 caracteres

---

#### **POST** `/api/auth/login`
**Descripción**: Iniciar sesión
**Autenticación**: No requerida

**Request Body**:
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "usuario@ejemplo.com",
      "name": "Usuario Demo",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### **POST** `/api/auth/logout`
**Descripción**: Cerrar sesión
**Autenticación**: No requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Logout exitoso"
  }
}
```

---

#### **GET** `/api/auth/me`
**Descripción**: Obtener perfil del usuario autenticado
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "usuario@ejemplo.com",
      "name": "Usuario Demo",
      "avatar": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

#### **POST** `/api/auth/forgot-password`
**Descripción**: Solicitar recuperación de contraseña
**Autenticación**: No requerida

**Request Body**:
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Si el email está registrado, recibirás instrucciones para recuperar tu contraseña"
  }
}
```

---

#### **POST** `/api/auth/reset-password`
**Descripción**: Restablecer contraseña con token
**Autenticación**: No requerida

**Request Body**:
```json
{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Contraseña restablecida exitosamente"
  }
}
```

---

#### **GET** `/api/auth/test`
**Descripción**: Ruta de prueba para verificar middleware
**Autenticación**: Opcional

---

### **2. 👥 USUARIOS** (`/api/users`)

#### **GET** `/api/users`
**Descripción**: Listar usuarios con paginación
**Autenticación**: Requerida

**Query Parameters**:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Usuarios por página (default: 10, max: 100)
- `search` (opcional): Buscar por nombre o email

**Ejemplo**: `/api/users?page=1&limit=5&search=admin`

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "1",
        "email": "admin@airbnb.com",
        "name": "Admin User",
        "avatar": "https://via.placeholder.com/150",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

#### **GET** `/api/users/stats`
**Descripción**: Obtener estadísticas de usuarios
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total": 10,
      "active": 8,
      "inactive": 2
    }
  }
}
```

---

#### **GET** `/api/users/:id`
**Descripción**: Obtener usuario específico por ID
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@airbnb.com",
      "name": "Admin User",
      "avatar": "https://via.placeholder.com/150",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isActive": true
    }
  }
}
```

---

#### **POST** `/api/users`
**Descripción**: Crear nuevo usuario
**Autenticación**: Requerida

**Request Body**:
```json
{
  "email": "nuevo@ejemplo.com",
  "name": "Usuario Nuevo",
  "password": "Password123",
  "avatar": "https://via.placeholder.com/150"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "2",
      "email": "nuevo@ejemplo.com",
      "name": "Usuario Nuevo",
      "avatar": "https://via.placeholder.com/150",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isActive": true
    }
  },
  "message": "Usuario creado exitosamente"
}
```

---

#### **PUT** `/api/users/:id`
**Descripción**: Actualizar usuario completo
**Autenticación**: Requerida

**Request Body**:
```json
{
  "name": "Usuario Actualizado",
  "email": "actualizado@ejemplo.com",
  "avatar": "https://via.placeholder.com/200",
  "isActive": true
}
```

---

#### **DELETE** `/api/users/:id`
**Descripción**: Eliminar usuario (soft delete)
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

### **3. 🛒 CARRITO** (`/api/cart`)

#### **GET** `/api/cart`
**Descripción**: Obtener carrito del usuario
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Carrito obtenido exitosamente",
  "data": {
    "userId": "1",
    "items": [
      {
        "id": "item_123",
        "propertyId": "prop_123",
        "checkIn": "2024-02-01",
        "checkOut": "2024-02-05",
        "guests": 2,
        "price": 150,
        "totalPrice": 600
      }
    ],
    "totalItems": 1,
    "totalPrice": 600
  }
}
```

---

#### **POST** `/api/cart/add`
**Descripción**: Agregar item al carrito
**Autenticación**: Requerida

**Request Body**:
```json
{
  "propertyId": "prop_123",
  "checkIn": "2024-02-01",
  "checkOut": "2024-02-05",
  "guests": 2
}
```

**Response**:
```json
{
  "success": true,
  "message": "Item agregado al carrito exitosamente",
  "data": {
    "id": "item_123",
    "propertyId": "prop_123",
    "checkIn": "2024-02-01",
    "checkOut": "2024-02-05",
    "guests": 2,
    "price": 150,
    "totalPrice": 600
  }
}
```

---

#### **DELETE** `/api/cart/remove/:itemId`
**Descripción**: Eliminar item del carrito
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Item eliminado del carrito exitosamente",
  "data": {
    "itemId": "item_123"
  }
}
```

---

#### **PUT** `/api/cart/update/:itemId`
**Descripción**: Actualizar item del carrito
**Autenticación**: Requerida

**Request Body**:
```json
{
  "checkIn": "2024-02-02",
  "checkOut": "2024-02-06",
  "guests": 3
}
```

---

#### **DELETE** `/api/cart/clear`
**Descripción**: Limpiar carrito completo
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Carrito limpiado exitosamente",
  "data": {
    "cleared": true
  }
}
```

---

#### **GET** `/api/cart/summary`
**Descripción**: Obtener resumen del carrito
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Resumen del carrito obtenido exitosamente",
  "data": {
    "totalItems": 1,
    "totalPrice": 600,
    "items": [...]
  }
}
```

---

#### **POST** `/api/cart/check-availability`
**Descripción**: Verificar disponibilidad de propiedad
**Autenticación**: Requerida

**Request Body**:
```json
{
  "propertyId": "prop_123",
  "checkIn": "2024-02-01",
  "checkOut": "2024-02-05",
  "guests": 2
}
```

**Response**:
```json
{
  "success": true,
  "message": "Propiedad disponible",
  "data": {
    "available": true,
    "message": "Las fechas están disponibles",
    "propertyId": "prop_123",
    "checkIn": "2024-02-01",
    "checkOut": "2024-02-05",
    "guests": 2
  }
}
```

---

### **4. ❤️ FAVORITOS** (`/api/favorites`)

#### **POST** `/api/favorites`
**Descripción**: Agregar propiedad a favoritos
**Autenticación**: Requerida

**Request Body**:
```json
{
  "propertyId": "prop_123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Propiedad agregada a favoritos exitosamente",
  "data": {
    "propertyId": "prop_123",
    "userId": "1",
    "addedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### **DELETE** `/api/favorites/:propertyId`
**Descripción**: Remover propiedad de favoritos
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Propiedad removida de favoritos exitosamente"
}
```

---

#### **GET** `/api/favorites`
**Descripción**: Obtener favoritos del usuario
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Favoritos obtenidos exitosamente",
  "data": {
    "favorites": [
      {
        "propertyId": "prop_123",
        "addedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

#### **GET** `/api/favorites/:propertyId/status`
**Descripción**: Verificar si propiedad está en favoritos
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "isFavorite": true,
    "propertyId": "prop_123"
  }
}
```

---

#### **POST** `/api/favorites/wishlists`
**Descripción**: Crear nueva wishlist
**Autenticación**: Requerida

**Request Body**:
```json
{
  "name": "Mi Wishlist de Vacaciones",
  "description": "Lugares que quiero visitar",
  "isPublic": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Wishlist creada exitosamente",
  "data": {
    "id": "1",
    "name": "Mi Wishlist de Vacaciones",
    "description": "Lugares que quiero visitar",
    "isPublic": false,
    "userId": "1",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### **GET** `/api/favorites/wishlists`
**Descripción**: Obtener wishlists del usuario
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Wishlists obtenidas exitosamente",
  "data": {
    "wishlists": [
      {
        "id": "1",
        "name": "Mi Wishlist de Vacaciones",
        "description": "Lugares que quiero visitar",
        "isPublic": false,
        "propertyCount": 3,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

#### **GET** `/api/favorites/wishlists/public`
**Descripción**: Obtener wishlists públicas
**Autenticación**: No requerida

---

#### **GET** `/api/favorites/wishlists/:id`
**Descripción**: Obtener wishlist específica
**Autenticación**: Requerida

---

#### **PUT** `/api/favorites/wishlists/:id`
**Descripción**: Actualizar wishlist
**Autenticación**: Requerida

**Request Body**:
```json
{
  "name": "Wishlist Actualizada",
  "description": "Nueva descripción",
  "isPublic": true
}
```

---

#### **DELETE** `/api/favorites/wishlists/:id`
**Descripción**: Eliminar wishlist
**Autenticación**: Requerida

---

#### **POST** `/api/favorites/wishlists/:id/properties`
**Descripción**: Agregar propiedad a wishlist
**Autenticación**: Requerida

**Request Body**:
```json
{
  "propertyId": "prop_123"
}
```

---

#### **DELETE** `/api/favorites/wishlists/:id/properties/:propertyId`
**Descripción**: Remover propiedad de wishlist
**Autenticación**: Requerida

---

#### **GET** `/api/favorites/stats`
**Descripción**: Obtener estadísticas de favoritos
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "totalFavorites": 10,
    "totalWishlists": 3,
    "publicWishlists": 1
  }
}
```

---

### **5. 🏠 HOST** (`/api/host`)

#### **GET** `/api/host/properties`
**Descripción**: Obtener propiedades del host
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Propiedades del host obtenidas exitosamente",
  "data": {
    "properties": [
      {
        "id": "1",
        "title": "Hermosa Casa en la Playa",
        "description": "Casa frente al mar con vista espectacular",
        "address": "Playa del Carmen, México",
        "price": 150,
        "bedrooms": 3,
        "bathrooms": 2,
        "guests": 6,
        "amenities": ["WiFi", "Piscina", "Estacionamiento"],
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

#### **POST** `/api/host/properties`
**Descripción**: Crear nueva propiedad
**Autenticación**: Requerida

**Request Body**:
```json
{
  "title": "Hermosa Casa en la Playa",
  "description": "Casa frente al mar con vista espectacular",
  "address": "Playa del Carmen, México",
  "price": 150,
  "bedrooms": 3,
  "bathrooms": 2,
  "guests": 6,
  "amenities": ["WiFi", "Piscina", "Estacionamiento"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Propiedad creada exitosamente",
  "data": {
    "id": "1",
    "title": "Hermosa Casa en la Playa",
    "description": "Casa frente al mar con vista espectacular",
    "address": "Playa del Carmen, México",
    "price": 150,
    "bedrooms": 3,
    "bathrooms": 2,
    "guests": 6,
    "amenities": ["WiFi", "Piscina", "Estacionamiento"],
    "hostId": "1",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### **GET** `/api/host/properties/:id`
**Descripción**: Obtener propiedad específica del host
**Autenticación**: Requerida

---

#### **PUT** `/api/host/properties/:id`
**Descripción**: Actualizar propiedad del host
**Autenticación**: Requerida

**Request Body**:
```json
{
  "title": "Casa Actualizada",
  "description": "Nueva descripción",
  "price": 200
}
```

---

#### **DELETE** `/api/host/properties/:id`
**Descripción**: Eliminar propiedad del host
**Autenticación**: Requerida

---

#### **GET** `/api/host/properties/:id/reservations`
**Descripción**: Obtener reservaciones de propiedad
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Reservaciones obtenidas exitosamente",
  "data": {
    "reservations": [
      {
        "id": "res_123",
        "guestId": "2",
        "checkIn": "2024-02-01",
        "checkOut": "2024-02-05",
        "guests": 2,
        "totalPrice": 600,
        "status": "confirmed",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

#### **GET** `/api/host/properties/:id/reviews`
**Descripción**: Obtener reviews de propiedad
**Autenticación**: Requerida

---

#### **GET** `/api/host/stats`
**Descripción**: Obtener estadísticas del host
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "totalProperties": 5,
    "totalReservations": 25,
    "totalRevenue": 15000,
    "averageRating": 4.5,
    "occupancyRate": 0.75
  }
}
```

---

### **6. 🔔 NOTIFICACIONES** (`/api/notifications`)

#### **GET** `/api/notifications`
**Descripción**: Obtener notificaciones del usuario
**Autenticación**: Requerida

**Query Parameters**:
- `limit` (opcional): Número de notificaciones (default: 50)
- `type` (opcional): Filtrar por tipo

**Response**:
```json
{
  "success": true,
  "message": "Notificaciones obtenidas exitosamente",
  "data": {
    "notifications": [
      {
        "id": "1",
        "type": "booking",
        "title": "Nueva Reserva",
        "message": "Tienes una nueva reserva en tu propiedad",
        "isRead": false,
        "priority": "high",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "data": {
          "reservationId": "res_123",
          "propertyId": "prop_123"
        }
      }
    ],
    "total": 1,
    "unreadCount": 1
  }
}
```

---

#### **PATCH** `/api/notifications/:id/read`
**Descripción**: Marcar notificación como leída
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Notificación marcada como leída exitosamente"
}
```

---

#### **PATCH** `/api/notifications/mark-all-read`
**Descripción**: Marcar todas las notificaciones como leídas
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leídas",
  "data": {
    "markedCount": 5
  }
}
```

---

#### **DELETE** `/api/notifications/:id`
**Descripción**: Eliminar notificación
**Autenticación**: Requerida

---

#### **DELETE** `/api/notifications/clear-all`
**Descripción**: Limpiar todas las notificaciones
**Autenticación**: Requerida

---

#### **POST** `/api/notifications/test`
**Descripción**: Crear notificación de prueba
**Autenticación**: Requerida

---

#### **GET** `/api/notifications/settings`
**Descripción**: Obtener configuración de notificaciones
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "email": true,
    "push": true,
    "sound": false,
    "marketing": false,
    "propertyUpdates": true,
    "searchAlerts": true,
    "muteAll": false
  }
}
```

---

#### **PUT** `/api/notifications/settings`
**Descripción**: Actualizar configuración de notificaciones
**Autenticación**: Requerida

**Request Body**:
```json
{
  "email": true,
  "push": true,
  "sound": false,
  "marketing": false,
  "propertyUpdates": true,
  "searchAlerts": true,
  "muteAll": false
}
```

---

### **7. 💳 PAGOS** (`/api/payments`)

#### **POST** `/api/payments/checkout/calculate`
**Descripción**: Calcular total del checkout
**Autenticación**: Requerida

**Request Body**:
```json
{
  "items": [
    {
      "propertyId": "prop_123",
      "checkIn": "2024-02-01",
      "checkOut": "2024-02-05",
      "guests": 2
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "subtotal": 600,
    "taxes": 60,
    "serviceFee": 30,
    "total": 690,
    "breakdown": {
      "nightlyRate": 150,
      "nights": 4,
      "subtotal": 600,
      "taxes": 60,
      "serviceFee": 30
    }
  }
}
```

---

#### **POST** `/api/payments/checkout/process`
**Descripción**: Procesar pago
**Autenticación**: Requerida

**Request Body**:
```json
{
  "paymentMethod": "credit_card",
  "cardDetails": {
    "number": "4111111111111111",
    "expiry": "12/25",
    "cvv": "123"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Pago procesado exitosamente",
  "data": {
    "transactionId": "txn_123",
    "status": "completed",
    "amount": 690,
    "paymentMethod": "credit_card",
    "processedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### **GET** `/api/payments/methods`
**Descripción**: Obtener métodos de pago disponibles
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": "credit_card",
        "name": "Tarjeta de Crédito",
        "enabled": true,
        "icon": "credit-card"
      },
      {
        "id": "paypal",
        "name": "PayPal",
        "enabled": true,
        "icon": "paypal"
      }
    ]
  }
}
```

---

#### **GET** `/api/payments/transactions`
**Descripción**: Obtener historial de transacciones
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Transacciones obtenidas exitosamente",
  "data": {
    "transactions": [
      {
        "id": "txn_123",
        "amount": 690,
        "status": "completed",
        "paymentMethod": "credit_card",
        "description": "Reserva en Casa de Playa",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

#### **GET** `/api/payments/transactions/:id`
**Descripción**: Obtener transacción específica
**Autenticación**: Requerida

---

#### **POST** `/api/payments/transactions/:id/refund`
**Descripción**: Procesar reembolso
**Autenticación**: Requerida

---

### **8. 👤 PERFIL** (`/api/profile`)

#### **PUT** `/api/profile`
**Descripción**: Actualizar perfil de usuario
**Autenticación**: Requerida

**Request Body**:
```json
{
  "name": "Nuevo Nombre",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Viajero apasionado",
  "location": "Ciudad de México"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "user": {
      "id": "1",
      "name": "Nuevo Nombre",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Viajero apasionado",
      "location": "Ciudad de México",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

#### **POST** `/api/profile/change-password`
**Descripción**: Cambiar contraseña
**Autenticación**: Requerida

**Request Body**:
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

---

#### **GET** `/api/profile/settings`
**Descripción**: Obtener configuración del perfil
**Autenticación**: Requerida

---

#### **PUT** `/api/profile/settings`
**Descripción**: Actualizar configuración del perfil
**Autenticación**: Requerida

**Request Body**:
```json
{
  "language": "es",
  "currency": "MXN",
  "timezone": "America/Mexico_City",
  "emailNotifications": true
}
```

---

### **9. 🏘️ PROPIEDADES** (`/api/properties`)

#### **GET** `/api/properties/:id`
**Descripción**: Obtener propiedad específica
**Autenticación**: No requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "property": {
      "id": "1",
      "title": "Hermosa Casa en la Playa",
      "description": "Casa frente al mar con vista espectacular",
      "address": "Playa del Carmen, México",
      "price": 150,
      "bedrooms": 3,
      "bathrooms": 2,
      "guests": 6,
      "amenities": ["WiFi", "Piscina", "Estacionamiento"],
      "images": ["url1", "url2"],
      "rating": 4.5,
      "reviewCount": 25,
      "host": {
        "id": "1",
        "name": "Juan Host",
        "avatar": "avatar_url"
      }
    }
  }
}
```

---

#### **GET** `/api/properties/popular`
**Descripción**: Obtener propiedades populares
**Autenticación**: No requerida

**Query Parameters**:
- `limit` (opcional): Número de propiedades (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "1",
        "title": "Hermosa Casa en la Playa",
        "price": 150,
        "rating": 4.5,
        "reviewCount": 25,
        "image": "main_image_url"
      }
    ],
    "total": 1
  }
}
```

---

### **10. 📅 RESERVAS** (`/api/reservations`)

#### **GET** `/api/reservations/check-availability`
**Descripción**: Verificar disponibilidad de fechas
**Autenticación**: No requerida

**Query Parameters**:
- `propertyId`: ID de la propiedad
- `checkIn`: Fecha de entrada (YYYY-MM-DD)
- `checkOut`: Fecha de salida (YYYY-MM-DD)
- `guests`: Número de huéspedes

**Response**:
```json
{
  "success": true,
  "data": {
    "available": true,
    "message": "Las fechas están disponibles",
    "propertyId": "prop_123",
    "checkIn": "2024-02-01",
    "checkOut": "2024-02-05",
    "guests": 2,
    "price": 150,
    "totalPrice": 600
  }
}
```

---

#### **POST** `/api/reservations`
**Descripción**: Crear nueva reserva
**Autenticación**: Requerida

**Request Body**:
```json
{
  "propertyId": "prop_123",
  "checkIn": "2024-02-01",
  "checkOut": "2024-02-05",
  "guests": 2,
  "totalPrice": 600,
  "paymentMethod": "credit_card"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Reserva creada exitosamente",
  "data": {
    "id": "res_123",
    "propertyId": "prop_123",
    "guestId": "1",
    "checkIn": "2024-02-01",
    "checkOut": "2024-02-05",
    "guests": 2,
    "totalPrice": 600,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### **GET** `/api/reservations/my-reservations`
**Descripción**: Obtener reservas del usuario
**Autenticación**: Requerida

**Response**:
```json
{
  "success": true,
  "message": "Reservas obtenidas exitosamente",
  "data": {
    "reservations": [
      {
        "id": "res_123",
        "property": {
          "id": "prop_123",
          "title": "Hermosa Casa en la Playa",
          "image": "property_image_url"
        },
        "checkIn": "2024-02-01",
        "checkOut": "2024-02-05",
        "guests": 2,
        "totalPrice": 600,
        "status": "confirmed",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

#### **PATCH** `/api/reservations/:id/status`
**Descripción**: Actualizar estado de reserva
**Autenticación**: Requerida

**Request Body**:
```json
{
  "status": "confirmed"
}
```

**Estados disponibles**: `pending`, `confirmed`, `cancelled`, `completed`

---

### **11. ⭐ REVIEWS** (`/api/reviews`)

#### **GET** `/api/reviews/property/:id`
**Descripción**: Obtener reviews de una propiedad
**Autenticación**: No requerida

**Response**:
```json
{
  "success": true,
  "message": "Reviews obtenidas exitosamente",
  "data": {
    "reviews": [
      {
        "id": "1",
        "rating": 5,
        "comment": "Excelente lugar, muy recomendado",
        "user": {
          "id": "2",
          "name": "María García",
          "avatar": "avatar_url"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "averageRating": 5
  }
}
```

---

#### **GET** `/api/reviews/property/:id/stats`
**Descripción**: Obtener estadísticas de reviews de propiedad
**Autenticación**: No requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalReviews": 25,
    "ratingDistribution": {
      "5": 15,
      "4": 7,
      "3": 2,
      "2": 1,
      "1": 0
    }
  }
}
```

---

#### **POST** `/api/reviews`
**Descripción**: Crear nueva review
**Autenticación**: Requerida

**Request Body**:
```json
{
  "propertyId": "prop_123",
  "rating": 5,
  "comment": "Excelente lugar, muy recomendado",
  "reservationId": "res_123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Review creada exitosamente",
  "data": {
    "id": "1",
    "propertyId": "prop_123",
    "userId": "1",
    "rating": 5,
    "comment": "Excelente lugar, muy recomendado",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### **GET** `/api/reviews/user/:id`
**Descripción**: Obtener reviews de un usuario
**Autenticación**: Requerida

---

#### **GET** `/api/reviews/stats`
**Descripción**: Obtener estadísticas generales de reviews
**Autenticación**: Requerida

---

#### **PUT** `/api/reviews/:id`
**Descripción**: Actualizar review
**Autenticación**: Requerida

**Request Body**:
```json
{
  "rating": 4,
  "comment": "Muy bueno, pero podría mejorar"
}
```

---

#### **DELETE** `/api/reviews/:id`
**Descripción**: Eliminar review
**Autenticación**: Requerida

---

### **12. 🔍 BÚSQUEDA** (`/api/search`)

#### **GET** `/api/search/properties`
**Descripción**: Buscar propiedades con filtros
**Autenticación**: No requerida

**Query Parameters**:
- `location` (opcional): Ubicación a buscar
- `checkIn` (opcional): Fecha de entrada
- `checkOut` (opcional): Fecha de salida
- `guests` (opcional): Número de huéspedes
- `minPrice` (opcional): Precio mínimo
- `maxPrice` (opcional): Precio máximo
- `amenities` (opcional): Amenidades separadas por coma
- `page` (opcional): Página
- `limit` (opcional): Resultados por página

**Ejemplo**: `/api/search/properties?location=Paris&guests=2&minPrice=50&maxPrice=200`

**Response**:
```json
{
  "success": true,
  "message": "Búsqueda realizada exitosamente",
  "data": {
    "properties": [
      {
        "id": "1",
        "title": "Hermosa Casa en París",
        "price": 120,
        "rating": 4.5,
        "reviewCount": 25,
        "image": "property_image_url",
        "location": "París, Francia",
        "amenities": ["WiFi", "Cocina"]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

#### **GET** `/api/search/suggestions`
**Descripción**: Obtener sugerencias de búsqueda
**Autenticación**: No requerida

**Query Parameters**:
- `q`: Término de búsqueda

**Response**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "location",
        "text": "París, Francia",
        "count": 25
      },
      {
        "type": "property",
        "text": "Casa en París",
        "count": 5
      }
    ]
  }
}
```

---

#### **GET** `/api/search/filters`
**Descripción**: Obtener filtros disponibles
**Autenticación**: No requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "amenities": [
      {
        "id": "wifi",
        "name": "WiFi",
        "count": 150
      },
      {
        "id": "pool",
        "name": "Piscina",
        "count": 75
      }
    ],
    "priceRanges": [
      {
        "min": 0,
        "max": 50,
        "count": 25
      },
      {
        "min": 50,
        "max": 100,
        "count": 100
      }
    ]
  }
}
```

---

### **13. 📊 ESTADÍSTICAS** (`/api/stats`)

#### **GET** `/api/stats`
**Descripción**: Obtener estadísticas del sistema (admin)
**Autenticación**: Requerida (Admin)

**Response**:
```json
{
  "success": true,
  "data": {
    "system": {
      "uptime": 86400,
      "memory": {
        "used": "150MB",
        "total": "512MB"
      },
      "nodeVersion": "v18.0.0",
      "platform": "linux",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "rateLimiting": {
      "totalRequests": 1000,
      "blockedRequests": 5
    },
    "cache": {
      "hitRate": 0.85,
      "totalKeys": 150
    },
    "logging": {
      "totalLogs": 5000,
      "errorLogs": 25
    }
  }
}
```

---

#### **GET** `/api/stats/logs`
**Descripción**: Ver logs del sistema (admin)
**Autenticación**: Requerida (Admin)

**Query Parameters**:
- `level` (opcional): Nivel de log (`info`, `warn`, `error`)
- `limit` (opcional): Número de logs (default: 50)

**Response**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2024-01-15T10:30:00.000Z",
        "level": "info",
        "message": "User login successful",
        "userId": "1"
      }
    ],
    "total": 1,
    "level": "info"
  }
}
```

---

#### **POST** `/api/stats/logs/clear`
**Descripción**: Limpiar logs del sistema (admin)
**Autenticación**: Requerida (Admin)

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Logs limpiados exitosamente"
  }
}
```

---

### **14. 🔧 UTILIDADES**

#### **GET** `/`
**Descripción**: Información general de la API
**Autenticación**: No requerida

**Response**:
```json
{
  "success": true,
  "message": "🏠 Airbnb Backend API - Sistema Completo",
  "data": {
    "server": "Airbnb Backend API",
    "version": "1.0.0",
    "environment": "development",
    "endpoints": {
      "auth": {
        "register": "POST /api/auth/register",
        "login": "POST /api/auth/login",
        "logout": "POST /api/auth/logout",
        "profile": "GET /api/auth/me"
      }
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### **GET** `/api/health`
**Descripción**: Health check del servidor
**Autenticación**: No requerida

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "message": "Servidor funcionando correctamente",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## ❌ **MANEJO DE ERRORES**

### **Estructura de Error**
```json
{
  "success": false,
  "error": {
    "message": "Descripción del error",
    "code": "ERROR_CODE",
    "details": {...}
  }
}
```

### **Códigos de Estado HTTP**
- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Error de validación
- `401`: No autenticado
- `403`: Sin permisos
- `404`: No encontrado
- `409`: Conflicto (ej: usuario ya existe)
- `429`: Rate limit excedido
- `500`: Error interno del servidor

### **Ejemplos de Errores**

#### **Error de Validación (400)**
```json
{
  "success": false,
  "error": {
    "message": "Datos de validación inválidos",
    "details": [
      {
        "field": "email",
        "message": "Formato de email inválido"
      },
      {
        "field": "password",
        "message": "La contraseña debe tener al menos 8 caracteres"
      }
    ]
  }
}
```

#### **No Autenticado (401)**
```json
{
  "success": false,
  "error": {
    "message": "Token de acceso requerido"
  }
}
```

#### **Sin Permisos (403)**
```json
{
  "success": false,
  "error": {
    "message": "Acceso denegado",
    "details": "Solo administradores pueden ver estadísticas"
  }
}
```

#### **No Encontrado (404)**
```json
{
  "success": false,
  "error": {
    "message": "Usuario no encontrado"
  }
}
```

#### **Conflicto (409)**
```json
{
  "success": false,
  "error": {
    "message": "Usuario ya existe"
  }
}
```

#### **Rate Limit (429)**
```json
{
  "success": false,
  "error": {
    "message": "Demasiadas solicitudes",
    "details": "Intenta nuevamente en 60 segundos"
  }
}
```

---

## 🚀 **EJEMPLOS DE USO COMPLETO**

### **Flujo de Autenticación**
```bash
# 1. Registrar usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@airbnb.com",
    "password": "password123",
    "name": "Usuario Demo"
  }'

# 2. Hacer login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@airbnb.com",
    "password": "password123"
  }'

# 3. Usar token en requests posteriores
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### **Flujo de Reserva Completo**
```bash
# 1. Buscar propiedades
curl -X GET "http://localhost:5000/api/search/properties?location=Paris&guests=2&checkIn=2024-03-01&checkOut=2024-03-05"

# 2. Verificar disponibilidad
curl -X GET "http://localhost:5000/api/reservations/check-availability?propertyId=prop_123&checkIn=2024-03-01&checkOut=2024-03-05&guests=2"

# 3. Agregar al carrito
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123",
    "checkIn": "2024-03-01",
    "checkOut": "2024-03-05",
    "guests": 2
  }'

# 4. Calcular total
curl -X POST http://localhost:5000/api/payments/checkout/calculate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "propertyId": "prop_123",
        "checkIn": "2024-03-01",
        "checkOut": "2024-03-05",
        "guests": 2
      }
    ]
  }'

# 5. Procesar pago y crear reserva
curl -X POST http://localhost:5000/api/payments/checkout/process \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "credit_card",
    "cardDetails": {
      "number": "4111111111111111",
      "expiry": "12/25",
      "cvv": "123"
    }
  }'

curl -X POST http://localhost:5000/api/reservations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123",
    "checkIn": "2024-03-01",
    "checkOut": "2024-03-05",
    "guests": 2,
    "totalPrice": 600,
    "paymentMethod": "credit_card"
  }'
```

---

## 🔧 **CONFIGURACIÓN PARA POSTMAN**

### **Variables de Entorno**
```
base_url: http://localhost:5000
auth_token: {{auth_token}}
```

### **Headers Pre-request Script**
```javascript
// Para endpoints que requieren autenticación
if (pm.environment.get("token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("token")
    });
}
```

### **Tests para Login**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.data.token) {
        pm.environment.set("token", response.data.token);
    }
}
```

---

## 📝 **NOTAS IMPORTANTES**

1. **Seguridad**: Las contraseñas se encriptan con bcrypt antes de almacenarse
2. **Mock Data**: Los datos se almacenan en memoria (se pierden al reiniciar el servidor)
3. **Soft Delete**: Los usuarios eliminados se marcan como inactivos
4. **Paginación**: Máximo 100 registros por página
5. **Búsqueda**: Busca en múltiples campos (case insensitive)
6. **Sanitización**: Todos los inputs se sanitizan automáticamente
7. **Rate Limiting**: Protección contra spam y ataques DDoS
8. **CORS**: Configurado para permitir peticiones desde diferentes dominios

---

## 🚀 **PRÓXIMOS PASOS**

- [ ] Integración con MongoDB
- [ ] Cache con Redis
- [ ] Rate limiting avanzado por usuario
- [ ] Logs de auditoría detallados
- [ ] Tests automatizados completos
- [ ] Documentación OpenAPI/Swagger
- [ ] Webhooks para notificaciones en tiempo real
- [ ] API de reportes y analytics avanzados

---

**Versión**: 1.0.0  
**Última actualización**: 2024-01-15  
**Autor**: Equipo de Desarrollo Airbnb Backend
