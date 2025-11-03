# 🚀 Airbnb Backend API - Ejemplos de Uso Completos

## 📋 **INFORMACIÓN BÁSICA**

- **Base URL**: `http://localhost:5000`
- **Formato**: JSON
- **Autenticación**: `Authorization: Bearer <token>`

---

## 🔐 **EJEMPLOS DE AUTENTICACIÓN**

### **1. Registrar Usuario**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@airbnb.com",
    "password": "password123",
    "name": "Usuario Demo"
  }'
```

**Respuesta exitosa (201)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "demo@airbnb.com",
      "name": "Usuario Demo",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **2. Iniciar Sesión**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@airbnb.com",
    "password": "password123"
  }'
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "demo@airbnb.com",
      "name": "Usuario Demo",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **3. Obtener Perfil (usando token)**

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "demo@airbnb.com",
      "name": "Usuario Demo",
      "avatar": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## 🔍 **EJEMPLOS DE BÚSQUEDA**

### **1. Buscar Propiedades**

```bash
curl -X GET "http://localhost:5000/api/search/properties?location=Paris&guests=2&checkIn=2024-03-01&checkOut=2024-03-05&minPrice=50&maxPrice=200"
```

**Respuesta exitosa (200)**:
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
        "image": "https://example.com/image.jpg",
        "location": "París, Francia",
        "amenities": ["WiFi", "Cocina", "Estacionamiento"]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### **2. Obtener Sugerencias de Búsqueda**

```bash
curl -X GET "http://localhost:5000/api/search/suggestions?q=Paris"
```

**Respuesta exitosa (200)**:
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

### **3. Verificar Disponibilidad**

```bash
curl -X GET "http://localhost:5000/api/reservations/check-availability?propertyId=prop_123&checkIn=2024-02-01&checkOut=2024-02-05&guests=2"
```

**Respuesta exitosa (200)**:
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

## 🛒 **EJEMPLOS DE CARRITO**

### **1. Agregar al Carrito**

```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123",
    "checkIn": "2024-02-01",
    "checkOut": "2024-02-05",
    "guests": 2
  }'
```

**Respuesta exitosa (201)**:
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

### **2. Obtener Carrito**

```bash
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (200)**:
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

### **3. Actualizar Item del Carrito**

```bash
curl -X PUT http://localhost:5000/api/cart/update/item_123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "checkIn": "2024-02-02",
    "checkOut": "2024-02-06",
    "guests": 3
  }'
```

### **4. Eliminar Item del Carrito**

```bash
curl -X DELETE http://localhost:5000/api/cart/remove/item_123 \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (200)**:
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

## 💳 **EJEMPLOS DE PAGOS**

### **1. Calcular Checkout**

```bash
curl -X POST http://localhost:5000/api/payments/checkout/calculate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "propertyId": "prop_123",
        "checkIn": "2024-02-01",
        "checkOut": "2024-02-05",
        "guests": 2
      }
    ]
  }'
```

**Respuesta exitosa (200)**:
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

### **2. Procesar Pago**

```bash
curl -X POST http://localhost:5000/api/payments/checkout/process \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Respuesta exitosa (200)**:
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

### **3. Historial de Transacciones**

```bash
curl -X GET http://localhost:5000/api/payments/transactions \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (200)**:
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

## 📅 **EJEMPLOS DE RESERVAS**

### **1. Crear Reserva**

```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123",
    "checkIn": "2024-02-01",
    "checkOut": "2024-02-05",
    "guests": 2,
    "totalPrice": 600,
    "paymentMethod": "credit_card"
  }'
```

**Respuesta exitosa (201)**:
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

### **2. Obtener Mis Reservas**

```bash
curl -X GET http://localhost:5000/api/reservations/my-reservations \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (200)**:
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
          "image": "https://example.com/image.jpg"
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

### **3. Actualizar Estado de Reserva**

```bash
curl -X PATCH http://localhost:5000/api/reservations/res_123/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Estado de reserva actualizado exitosamente",
  "data": {
    "id": "res_123",
    "status": "confirmed",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## ❤️ **EJEMPLOS DE FAVORITOS**

### **1. Agregar a Favoritos**

```bash
curl -X POST http://localhost:5000/api/favorites \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123"
  }'
```

**Respuesta exitosa (201)**:
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

### **2. Obtener Favoritos**

```bash
curl -X GET http://localhost:5000/api/favorites \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Favoritos obtenidos exitosamente",
  "data": {
    "favorites": [
      {
        "propertyId": "prop_123",
        "property": {
          "id": "prop_123",
          "title": "Hermosa Casa en la Playa",
          "price": 150,
          "rating": 4.5,
          "image": "https://example.com/image.jpg"
        },
        "addedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

### **3. Crear Wishlist**

```bash
curl -X POST http://localhost:5000/api/favorites/wishlists \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Wishlist de Vacaciones",
    "description": "Lugares que quiero visitar",
    "isPublic": false
  }'
```

**Respuesta exitosa (201)**:
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

### **4. Agregar Propiedad a Wishlist**

```bash
curl -X POST http://localhost:5000/api/favorites/wishlists/1/properties \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123"
  }'
```

---

## 🏠 **EJEMPLOS DE HOST**

### **1. Crear Propiedad**

```bash
curl -X POST http://localhost:5000/api/host/properties \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hermosa Casa en la Playa",
    "description": "Casa frente al mar con vista espectacular",
    "address": "Playa del Carmen, México",
    "price": 150,
    "bedrooms": 3,
    "bathrooms": 2,
    "guests": 6,
    "amenities": ["WiFi", "Piscina", "Estacionamiento"]
  }'
```

**Respuesta exitosa (201)**:
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

### **2. Obtener Propiedades del Host**

```bash
curl -X GET http://localhost:5000/api/host/properties \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (200)**:
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

### **3. Obtener Reservas de Propiedad**

```bash
curl -X GET http://localhost:5000/api/host/properties/1/reservations \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Reservaciones obtenidas exitosamente",
  "data": {
    "reservations": [
      {
        "id": "res_123",
        "guestId": "2",
        "guest": {
          "id": "2",
          "name": "María García",
          "email": "maria@example.com"
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

### **4. Estadísticas del Host**

```bash
curl -X GET http://localhost:5000/api/host/stats \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "data": {
    "totalProperties": 5,
    "totalReservations": 25,
    "totalRevenue": 15000,
    "averageRating": 4.5,
    "occupancyRate": 0.75,
    "monthlyStats": {
      "currentMonth": {
        "reservations": 5,
        "revenue": 3000
      },
      "lastMonth": {
        "reservations": 8,
        "revenue": 4800
      }
    }
  }
}
```

---

## ⭐ **EJEMPLOS DE REVIEWS**

### **1. Crear Review**

```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123",
    "rating": 5,
    "comment": "Excelente lugar, muy recomendado. La casa estaba impecable y la ubicación es perfecta.",
    "reservationId": "res_123"
  }'
```

**Respuesta exitosa (201)**:
```json
{
  "success": true,
  "message": "Review creada exitosamente",
  "data": {
    "id": "1",
    "propertyId": "prop_123",
    "userId": "1",
    "rating": 5,
    "comment": "Excelente lugar, muy recomendado. La casa estaba impecable y la ubicación es perfecta.",
    "user": {
      "id": "1",
      "name": "Usuario Demo",
      "avatar": null
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### **2. Obtener Reviews de Propiedad**

```bash
curl -X GET http://localhost:5000/api/reviews/property/prop_123
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Reviews obtenidas exitosamente",
  "data": {
    "reviews": [
      {
        "id": "1",
        "rating": 5,
        "comment": "Excelente lugar, muy recomendado. La casa estaba impecable y la ubicación es perfecta.",
        "user": {
          "id": "1",
          "name": "Usuario Demo",
          "avatar": null
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "averageRating": 5
  }
}
```

### **3. Estadísticas de Reviews**

```bash
curl -X GET http://localhost:5000/api/reviews/property/prop_123/stats
```

**Respuesta exitosa (200)**:
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
    },
    "recentReviews": [
      {
        "id": "1",
        "rating": 5,
        "comment": "Excelente lugar...",
        "user": {
          "name": "Usuario Demo"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 🔔 **EJEMPLOS DE NOTIFICACIONES**

### **1. Obtener Notificaciones**

```bash
curl -X GET "http://localhost:5000/api/notifications?limit=10" \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (200)**:
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
        "message": "Tienes una nueva reserva en tu propiedad Casa de Playa",
        "isRead": false,
        "priority": "high",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "data": {
          "reservationId": "res_123",
          "propertyId": "prop_123",
          "guestName": "María García"
        }
      }
    ],
    "total": 1,
    "unreadCount": 1
  }
}
```

### **2. Marcar como Leída**

```bash
curl -X PATCH http://localhost:5000/api/notifications/1/read \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Notificación marcada como leída exitosamente"
}
```

### **3. Marcar Todas como Leídas**

```bash
curl -X PATCH http://localhost:5000/api/notifications/mark-all-read \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leídas",
  "data": {
    "markedCount": 5
  }
}
```

### **4. Actualizar Configuración de Notificaciones**

```bash
curl -X PUT http://localhost:5000/api/notifications/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": true,
    "push": true,
    "sound": false,
    "marketing": false,
    "propertyUpdates": true,
    "searchAlerts": true,
    "muteAll": false
  }'
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Configuración de notificaciones actualizada exitosamente",
  "data": {
    "email": true,
    "push": true,
    "sound": false,
    "marketing": false,
    "propertyUpdates": true,
    "searchAlerts": true,
    "muteAll": false,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 👤 **EJEMPLOS DE PERFIL**

### **1. Actualizar Perfil**

```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Viajero apasionado y amante de la naturaleza",
    "location": "Ciudad de México, México",
    "phone": "+52 55 1234 5678",
    "dateOfBirth": "1990-05-15"
  }'
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "user": {
      "id": "1",
      "name": "Juan Pérez",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Viajero apasionado y amante de la naturaleza",
      "location": "Ciudad de México, México",
      "phone": "+52 55 1234 5678",
      "dateOfBirth": "1990-05-15",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### **2. Cambiar Contraseña**

```bash
curl -X POST http://localhost:5000/api/profile/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente"
}
```

### **3. Actualizar Configuración del Perfil**

```bash
curl -X PUT http://localhost:5000/api/profile/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "es",
    "currency": "MXN",
    "timezone": "America/Mexico_City",
    "emailNotifications": true,
    "smsNotifications": false,
    "marketingEmails": false
  }'
```

---

## 📊 **EJEMPLOS DE ESTADÍSTICAS (ADMIN)**

### **1. Estadísticas del Sistema**

```bash
curl -X GET http://localhost:5000/api/stats \
  -H "Authorization: Bearer <admin_token>"
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "data": {
    "system": {
      "uptime": 86400,
      "memory": {
        "used": "150MB",
        "total": "512MB",
        "percentage": 29.3
      },
      "nodeVersion": "v18.0.0",
      "platform": "linux",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "rateLimiting": {
      "totalRequests": 1000,
      "blockedRequests": 5,
      "averageRequestsPerMinute": 25
    },
    "cache": {
      "hitRate": 0.85,
      "totalKeys": 150,
      "memoryUsage": "10MB"
    },
    "logging": {
      "totalLogs": 5000,
      "errorLogs": 25,
      "warningLogs": 100
    }
  }
}
```

### **2. Ver Logs del Sistema**

```bash
curl -X GET "http://localhost:5000/api/stats/logs?level=error&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2024-01-15T10:25:00.000Z",
        "level": "error",
        "message": "Database connection failed",
        "details": {
          "error": "Connection timeout",
          "userId": "1",
          "endpoint": "/api/auth/login"
        }
      }
    ],
    "total": 1,
    "level": "error"
  }
}
```

---

## 🚀 **FLUJO COMPLETO DE EJEMPLO**

### **Escenario: Usuario busca, reserva y califica una propiedad**

#### **Paso 1: Registro/Login**
```bash
# Registrar usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123",
    "name": "Usuario Ejemplo"
  }'
```

#### **Paso 2: Buscar Propiedades**
```bash
# Buscar propiedades en París
curl -X GET "http://localhost:5000/api/search/properties?location=Paris&guests=2&checkIn=2024-03-01&checkOut=2024-03-05" \
  -H "Authorization: Bearer <token>"
```

#### **Paso 3: Ver Detalles de Propiedad**
```bash
# Obtener detalles de una propiedad específica
curl -X GET http://localhost:5000/api/properties/prop_123 \
  -H "Authorization: Bearer <token>"
```

#### **Paso 4: Verificar Disponibilidad**
```bash
# Verificar disponibilidad
curl -X GET "http://localhost:5000/api/reservations/check-availability?propertyId=prop_123&checkIn=2024-03-01&checkOut=2024-03-05&guests=2" \
  -H "Authorization: Bearer <token>"
```

#### **Paso 5: Agregar al Carrito**
```bash
# Agregar al carrito
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123",
    "checkIn": "2024-03-01",
    "checkOut": "2024-03-05",
    "guests": 2
  }'
```

#### **Paso 6: Calcular Total**
```bash
# Calcular total del checkout
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
```

#### **Paso 7: Procesar Pago**
```bash
# Procesar pago
curl -X POST http://localhost:5000/api/payments/checkout/process \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

#### **Paso 8: Crear Reserva**
```bash
# Crear reserva
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

#### **Paso 9: Agregar a Favoritos (opcional)**
```bash
# Agregar a favoritos
curl -X POST http://localhost:5000/api/favorites \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123"
  }'
```

#### **Paso 10: Después del viaje - Crear Review**
```bash
# Crear review
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123",
    "rating": 5,
    "comment": "Excelente experiencia, la casa superó nuestras expectativas. Muy recomendado!",
    "reservationId": "res_123"
  }'
```

---

## ❌ **EJEMPLOS DE ERRORES**

### **Error de Validación (400)**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "email_invalido",
    "password": "123",
    "name": "A"
  }'
```

**Respuesta de error (400)**:
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
      },
      {
        "field": "name",
        "message": "Nombre debe tener mínimo 2 caracteres"
      }
    ]
  }
}
```

### **No Autenticado (401)**
```bash
curl -X GET http://localhost:5000/api/auth/me
```

**Respuesta de error (401)**:
```json
{
  "success": false,
  "error": {
    "message": "Token de acceso requerido"
  }
}
```

### **No Encontrado (404)**
```bash
curl -X GET http://localhost:5000/api/users/999 \
  -H "Authorization: Bearer <token>"
```

**Respuesta de error (404)**:
```json
{
  "success": false,
  "error": {
    "message": "Usuario no encontrado"
  }
}
```

### **Conflicto (409)**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@airbnb.com",
    "password": "password123",
    "name": "Usuario Demo"
  }'
```

**Respuesta de error (409)**:
```json
{
  "success": false,
  "error": {
    "message": "Usuario ya existe"
  }
}
```

---

## 🔧 **CONFIGURACIÓN PARA POSTMAN**

### **Variables de Entorno**
```json
{
  "base_url": "http://localhost:5000",
  "auth_token": "",
  "user_id": "",
  "property_id": "",
  "reservation_id": ""
}
```

### **Pre-request Script**
```javascript
// Auto-set auth token for authenticated endpoints
if (pm.environment.get("auth_token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("auth_token")
    });
}
```

### **Tests Script**
```javascript
// Auto-extract token from login/register responses
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    if (response.success && response.data && response.data.token) {
        pm.environment.set("auth_token", response.data.token);
        console.log("Token guardado automáticamente");
    }
}

// Auto-extract user ID
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    if (response.success && response.data && response.data.user && response.data.user.id) {
        pm.environment.set("user_id", response.data.user.id);
    }
}
```

---

**Última actualización**: 2024-01-15  
**Versión**: 1.0.0
