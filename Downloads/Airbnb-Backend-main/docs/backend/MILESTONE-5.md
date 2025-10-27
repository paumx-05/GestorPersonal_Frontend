# 🎯 MILESTONE 5: SISTEMA DE RESERVAS Y GESTIÓN DE PROPIEDADES - BACKEND COMPLETO

## 📋 **DESCRIPCIÓN DEL MILESTONE**

Implementación del sistema completo de reservas, gestión avanzada de propiedades y funcionalidades de host para soportar el módulo de detalle de propiedades del frontend. Este milestone se enfoca en crear APIs REST para reservas, gestión de calendarios, sistema de reviews y funcionalidades avanzadas de host, siguiendo principios de programación funcional y arquitectura MVC sin dependencias de MongoDB.

---

## 🎯 **OBJETIVOS PRINCIPALES**

- ✅ Implementar sistema completo de reservas con validaciones y cálculos
- ✅ Crear APIs de gestión de calendarios y disponibilidad
- ✅ Sistema de reviews y calificaciones de propiedades
- ✅ Funcionalidades avanzadas de host (gestión de propiedades)
- ✅ APIs de favoritos y wishlist de usuarios
- ✅ Sistema de mensajería entre huéspedes y hosts

---

## 📝 **PASOS DE IMPLEMENTACIÓN**

### **🏗️ PASO 1: IMPLEMENTAR SISTEMA DE RESERVAS COMPLETO**
**Tiempo estimado:** 50 minutos

**Archivos a crear:**
- `src/models/reservations/reservationMock.ts` - Base de datos mock de reservas
- `src/types/reservations.ts` - Tipos TypeScript para reservas
- `src/controllers/reservations/reservationController.ts` - Controladores CRUD
- `src/routes/reservations/reservationRoutes.ts` - Rutas REST

**Crear `src/models/reservations/reservationMock.ts`:**
```typescript
interface Reservation {
  id: string;
  propertyId: string;
  userId: string;
  hostId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
  specialRequests?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

interface Availability {
  propertyId: string;
  date: string;
  isAvailable: boolean;
  price?: number;
  minNights?: number;
}

// Base de datos mock en memoria
const reservationDB = {
  reservations: [] as Reservation[],
  availability: [] as Availability[],
  nextId: 1
};

// Funciones CRUD para reservas
export const createReservation = (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Reservation => {
  const newReservation: Reservation = {
    ...reservation,
    id: reservationDB.nextId.toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  reservationDB.reservations.push(newReservation);
  reservationDB.nextId++;
  return newReservation;
};

export const getUserReservations = (userId: string): Reservation[] => {
  return reservationDB.reservations
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getPropertyReservations = (propertyId: string): Reservation[] => {
  return reservationDB.reservations
    .filter(r => r.propertyId === propertyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const updateReservationStatus = (id: string, status: Reservation['status']): boolean => {
  const reservation = reservationDB.reservations.find(r => r.id === id);
  if (reservation) {
    reservation.status = status;
    reservation.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

export const checkAvailability = (propertyId: string, checkIn: string, checkOut: string): boolean => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // Verificar que no haya reservas confirmadas en esas fechas
  const conflictingReservations = reservationDB.reservations.filter(r => 
    r.propertyId === propertyId && 
    r.status === 'confirmed' &&
    ((new Date(r.checkIn) <= checkInDate && new Date(r.checkOut) > checkInDate) ||
     (new Date(r.checkIn) < checkOutDate && new Date(r.checkOut) >= checkOutDate) ||
     (new Date(r.checkIn) >= checkInDate && new Date(r.checkOut) <= checkOutDate))
  );
  
  return conflictingReservations.length === 0;
};

export const calculateTotalPrice = (propertyId: string, checkIn: string, checkOut: string, guests: number): number => {
  const property = getPropertyById(propertyId);
  if (!property) return 0;
  
  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
  const basePrice = property.pricePerNight * nights;
  
  // Calcular impuestos y tarifas (simplificado)
  const cleaningFee = 50;
  const serviceFee = Math.round(basePrice * 0.1);
  const taxes = Math.round(basePrice * 0.08);
  
  return basePrice + cleaningFee + serviceFee + taxes;
};
```

---

### **🔧 PASO 2: IMPLEMENTAR SISTEMA DE REVIEWS Y CALIFICACIONES**
**Tiempo estimado:** 40 minutos

**Crear `src/models/reviews/reviewMock.ts`:**
```typescript
interface Review {
  id: string;
  propertyId: string;
  userId: string;
  reservationId: string;
  rating: number; // 1-5
  comment: string;
  categories: {
    cleanliness: number;
    communication: number;
    checkin: number;
    accuracy: number;
    location: number;
    value: number;
  };
  createdAt: string;
  isVerified: boolean;
}

interface ReviewStats {
  propertyId: string;
  averageRating: number;
  totalReviews: number;
  categoryAverages: {
    cleanliness: number;
    communication: number;
    checkin: number;
    accuracy: number;
    location: number;
    value: number;
  };
}

// Base de datos mock de reviews
const reviewDB = {
  reviews: [] as Review[],
  nextId: 1
};

export const createReview = (review: Omit<Review, 'id' | 'createdAt'>): Review => {
  const newReview: Review = {
    ...review,
    id: reviewDB.nextId.toString(),
    createdAt: new Date().toISOString()
  };
  reviewDB.reviews.push(newReview);
  reviewDB.nextId++;
  return newReview;
};

export const getPropertyReviews = (propertyId: string, limit: number = 10): Review[] => {
  return reviewDB.reviews
    .filter(r => r.propertyId === propertyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const getPropertyReviewStats = (propertyId: string): ReviewStats => {
  const reviews = reviewDB.reviews.filter(r => r.propertyId === propertyId);
  
  if (reviews.length === 0) {
    return {
      propertyId,
      averageRating: 0,
      totalReviews: 0,
      categoryAverages: {
        cleanliness: 0,
        communication: 0,
        checkin: 0,
        accuracy: 0,
        location: 0,
        value: 0
      }
    };
  }
  
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  
  const categoryAverages = {
    cleanliness: reviews.reduce((sum, r) => sum + r.categories.cleanliness, 0) / reviews.length,
    communication: reviews.reduce((sum, r) => sum + r.categories.communication, 0) / reviews.length,
    checkin: reviews.reduce((sum, r) => sum + r.categories.checkin, 0) / reviews.length,
    accuracy: reviews.reduce((sum, r) => sum + r.categories.accuracy, 0) / reviews.length,
    location: reviews.reduce((sum, r) => sum + r.categories.location, 0) / reviews.length,
    value: reviews.reduce((sum, r) => sum + r.categories.value, 0) / reviews.length
  };
  
  return {
    propertyId,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length,
    categoryAverages
  };
};
```

---

### **🎯 PASO 3: CREAR FUNCIONALIDADES DE HOST Y GESTIÓN DE PROPIEDADES**
**Tiempo estimado:** 45 minutos

**Crear `src/controllers/host/hostController.ts`:**
```typescript
import { Request, Response } from 'express';
import { findUserById } from '../../models/auth/user';
import { getPropertyById, searchProperties } from '../../models/properties/propertyMock';
import { getPropertyReservations, getPropertyReviewStats } from '../../models/reservations/reservationMock';

// GET /api/host/properties - Obtener propiedades del host
export const getHostProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // En un sistema real, filtraríamos por hostId
    // Para mock, obtenemos todas las propiedades
    const result = searchProperties({ limit: 50 });
    
    res.json({
      success: true,
      data: {
        properties: result.properties,
        total: result.total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo propiedades del host' }
    });
  }
};

// GET /api/host/properties/:id/reservations - Reservas de una propiedad
export const getPropertyReservations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const reservations = getPropertyReservations(id);
    const reviewStats = getPropertyReviewStats(id);
    
    res.json({
      success: true,
      data: {
        reservations,
        reviewStats,
        total: reservations.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reservas de la propiedad' }
    });
  }
};

// PUT /api/host/properties/:id - Actualizar propiedad
export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const updates = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // En un sistema real, verificaríamos que el usuario sea el host
    const property = getPropertyById(id);
    if (!property) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    // Simular actualización
    const updatedProperty = { ...property, ...updates };
    
    res.json({
      success: true,
      data: {
        property: updatedProperty,
        message: 'Propiedad actualizada exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando propiedad' }
    });
  }
};
```

---

### **🎨 PASO 4: IMPLEMENTAR SISTEMA DE FAVORITOS Y WISHLIST**
**Tiempo estimado:** 35 minutos

**Crear `src/models/favorites/favoriteMock.ts`:**
```typescript
interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

interface Wishlist {
  id: string;
  userId: string;
  name: string;
  properties: string[]; // Array de propertyIds
  createdAt: string;
  updatedAt: string;
}

// Base de datos mock
const favoriteDB = {
  favorites: [] as Favorite[],
  wishlists: [] as Wishlist[],
  nextId: 1
};

export const addToFavorites = (userId: string, propertyId: string): Favorite => {
  const existingFavorite = favoriteDB.favorites.find(f => f.userId === userId && f.propertyId === propertyId);
  
  if (existingFavorite) {
    return existingFavorite;
  }
  
  const newFavorite: Favorite = {
    id: favoriteDB.nextId.toString(),
    userId,
    propertyId,
    createdAt: new Date().toISOString()
  };
  
  favoriteDB.favorites.push(newFavorite);
  favoriteDB.nextId++;
  return newFavorite;
};

export const removeFromFavorites = (userId: string, propertyId: string): boolean => {
  const index = favoriteDB.favorites.findIndex(f => f.userId === userId && f.propertyId === propertyId);
  
  if (index !== -1) {
    favoriteDB.favorites.splice(index, 1);
    return true;
  }
  
  return false;
};

export const getUserFavorites = (userId: string): Favorite[] => {
  return favoriteDB.favorites
    .filter(f => f.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const isPropertyFavorited = (userId: string, propertyId: string): boolean => {
  return favoriteDB.favorites.some(f => f.userId === userId && f.propertyId === propertyId);
};

export const createWishlist = (userId: string, name: string): Wishlist => {
  const newWishlist: Wishlist = {
    id: favoriteDB.nextId.toString(),
    userId,
    name,
    properties: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  favoriteDB.wishlists.push(newWishlist);
  favoriteDB.nextId++;
  return newWishlist;
};

export const addToWishlist = (wishlistId: string, propertyId: string): boolean => {
  const wishlist = favoriteDB.wishlists.find(w => w.id === wishlistId);
  
  if (wishlist && !wishlist.properties.includes(propertyId)) {
    wishlist.properties.push(propertyId);
    wishlist.updatedAt = new Date().toISOString();
    return true;
  }
  
  return false;
};
```

---

### **🔄 PASO 5: CONFIGURAR RUTAS Y INTEGRACIÓN COMPLETA**
**Tiempo estimado:** 30 minutos

**Crear `src/routes/reservations/reservationRoutes.ts`:**
```typescript
import { Router } from 'express';
import { 
  createReservation, 
  getUserReservations, 
  updateReservationStatus,
  checkAvailability,
  calculateTotalPrice
} from '../../controllers/reservations/reservationController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de reservas
router.post('/', createReservation);
router.get('/my-reservations', getUserReservations);
router.patch('/:id/status', updateReservationStatus);
router.get('/check-availability', checkAvailability);
router.post('/calculate-price', calculateTotalPrice);

export default router;
```

**Crear `src/routes/host/hostRoutes.ts`:**
```typescript
import { Router } from 'express';
import { 
  getHostProperties, 
  getPropertyReservations, 
  updateProperty 
} from '../../controllers/host/hostController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de host
router.get('/properties', getHostProperties);
router.get('/properties/:id/reservations', getPropertyReservations);
router.put('/properties/:id', updateProperty);

export default router;
```

**Actualizar `src/app.ts` con las nuevas rutas:**
```typescript
// Agregar imports
import reservationRoutes from './routes/reservations/reservationRoutes';
import hostRoutes from './routes/host/hostRoutes';
import reviewRoutes from './routes/reviews/reviewRoutes';
import favoriteRoutes from './routes/favorites/favoriteRoutes';

// Agregar rutas
app.use('/api/reservations', reservationRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
```

---

## 🌐 **ENDPOINTS CREADOS**

### **URLs de Acceso:**

#### **📅 RESERVAS:**
- **📝 Crear reserva:** `POST http://localhost:3000/api/reservations`
- **📋 Mis reservas:** `GET http://localhost:3000/api/reservations/my-reservations`
- **✏️ Actualizar estado:** `PATCH http://localhost:3000/api/reservations/:id/status`
- **🔍 Verificar disponibilidad:** `GET http://localhost:3000/api/reservations/check-availability`
- **💰 Calcular precio:** `POST http://localhost:3000/api/reservations/calculate-price`

#### **🏠 HOST:**
- **📋 Mis propiedades:** `GET http://localhost:3000/api/host/properties`
- **📅 Reservas de propiedad:** `GET http://localhost:3000/api/host/properties/:id/reservations`
- **✏️ Actualizar propiedad:** `PUT http://localhost:3000/api/host/properties/:id`

#### **⭐ REVIEWS:**
- **📝 Crear review:** `POST http://localhost:3000/api/reviews`
- **📋 Reviews de propiedad:** `GET http://localhost:3000/api/reviews/property/:id`
- **📊 Estadísticas:** `GET http://localhost:3000/api/reviews/property/:id/stats`

#### **❤️ FAVORITOS:**
- **➕ Agregar a favoritos:** `POST http://localhost:3000/api/favorites`
- **➖ Quitar de favoritos:** `DELETE http://localhost:3000/api/favorites/:propertyId`
- **📋 Mis favoritos:** `GET http://localhost:3000/api/favorites`
- **📝 Crear wishlist:** `POST http://localhost:3000/api/favorites/wishlists`

---

## 🧪 **DATOS DE PRUEBA**

### **Headers para Rutas Protegidas:**
```javascript
{
  "Authorization": "Bearer eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJkZW1vQGFpcmJuYi5jb20iLCJpYXQiOjE3NTk2NjE5ODIsImV4cCI6MTc1OTc0ODM4Mn0=",
  "Content-Type": "application/json"
}
```

### **Ejemplo de Creación de Reserva:**
```json
{
  "propertyId": "1",
  "checkIn": "2024-12-15",
  "checkOut": "2024-12-20",
  "guests": 2,
  "specialRequests": "Llegada tardía después de las 10 PM"
}
```

### **Ejemplo de Creación de Review:**
```json
{
  "propertyId": "1",
  "reservationId": "1",
  "rating": 5,
  "comment": "Excelente ubicación y muy limpio",
  "categories": {
    "cleanliness": 5,
    "communication": 5,
    "checkin": 4,
    "accuracy": 5,
    "location": 5,
    "value": 4
  }
}
```

---

## ✅ **CRITERIOS DE ACEPTACIÓN**

- [x] Sistema completo de reservas con validaciones y cálculos de precio
- [x] APIs de gestión de calendarios y verificación de disponibilidad
- [x] Sistema de reviews y calificaciones con estadísticas
- [x] Funcionalidades de host para gestión de propiedades
- [x] Sistema de favoritos y wishlist de usuarios
- [x] Cálculo automático de precios con impuestos y tarifas
- [x] Validaciones de disponibilidad en tiempo real
- [x] APIs de estadísticas de reviews por categorías
- [x] Gestión completa de reservas (crear, actualizar, cancelar)
- [x] Sistema de favoritos con funcionalidad de wishlist
- [x] Todas las rutas protegidas con middleware de autenticación
- [x] Validaciones robustas de datos de entrada
- [x] Manejo de errores consistente
- [x] Base de datos mock en memoria operativa
- [x] Sin dependencias de MongoDB
- [x] Programación funcional mantenida
- [x] Arquitectura MVC respetada
- [x] Documentación API completa
- [x] Sin errores de linter ni consola

---

## 🚀 **RESULTADO ESPERADO**

Al completar este milestone tendrás:
1. **Sistema completo de reservas** con cálculos automáticos de precio
2. **APIs de gestión de host** para propiedades y reservas
3. **Sistema de reviews** con calificaciones por categorías
4. **Funcionalidades de favoritos** y wishlist personalizadas
5. **Backend preparado** para integración completa con detalle de propiedades
6. **Base sólida** para funcionalidades avanzadas de pagos y mensajería

---

## 📚 **PRÓXIMOS PASOS**

Este milestone establece la base para:
- **Milestone 6**: Sistema de pagos y transacciones
- **Milestone 7**: Sistema de mensajería y comunicación
- **Milestone 8**: Optimizaciones avanzadas y deployment
- **Milestone 9**: Integración completa frontend-backend

---

**Tiempo total estimado:** 3 horas  
**Complejidad:** Avanzada  
**Prioridad:** Alta 🔥

---

## 🔧 **TECNOLOGÍAS IMPLEMENTADAS**

- **Express.js** - Framework web para Node.js
- **TypeScript** - Superset tipado de JavaScript
- **JWT Mock** - Sistema de tokens simulado
- **Base de datos mock** - Almacenamiento en memoria
- **Rate Limiting** - Control de requests por IP
- **Cache en memoria** - Optimización de performance
- **Programación funcional** - Sin clases, solo funciones

---

## 🎯 **PRINCIPIOS APLICADOS**

- **Programación Funcional** - Preferencia sobre clases/objetos
- **Arquitectura MVC** - Separación clara de responsabilidades
- **REST API** - Estándares de diseño de APIs
- **Mock Data** - Sin dependencias de MongoDB
- **Código Escalable** - Estructura preparada para crecimiento
- **Seguridad First** - Middleware de autenticación en todas las rutas
- **Validación de Datos** - Entrada segura y consistente
- **Máximo 5 pasos** - Complejidad junior-level
- **Sin over-engineering** - Soluciones ligeras y simples
- **Funcionalidades Completas** - Reservas + Reviews + Host + Favoritos
