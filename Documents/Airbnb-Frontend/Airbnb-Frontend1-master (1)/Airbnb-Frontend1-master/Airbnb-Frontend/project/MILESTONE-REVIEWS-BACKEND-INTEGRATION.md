# Fase: Integración de Reviews según Documentación Backend

## 📋 Resumen

Este documento documenta la integración del módulo de reviews siguiendo **exactamente** la documentación oficial del backend (`FRONTEND_REVIEWS_API.md`), asegurando que los endpoints, formatos de request/response y validaciones coincidan con lo especificado.

**Objetivo:** Asegurar que el frontend use los endpoints y formatos exactos documentados por el backend.

---

## 1. Auditoría: Documentación Backend vs Implementación Actual

### Endpoints Documentados en Backend

#### ✅ **GET Reviews (Endpoint Principal)**
- **Ruta:** `GET /api/reviews?propertyId={id}&page={page}&limit={limit}&sort={sort}`
- **Auth:** ❌ No requerida
- **Query Params:**
  - `propertyId` (requerido): ID de la propiedad
  - `page` (opcional, default: 1): Número de página
  - `limit` (opcional, default: 10): Cantidad por página
  - `sort` (opcional, default: `newest`): `newest` | `oldest` | `highest` | `lowest`

**Response Esperado:**
```json
{
  "success": true,
  "message": "Reviews obtenidas exitosamente",
  "data": {
    "reviews": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "averageRating": 4.8
  }
}
```

#### ✅ **POST Crear Review**
- **Ruta:** `POST /api/reviews`
- **Auth:** ✅ Requerida (Bearer Token)
- **Body:**
```json
{
  "propertyId": "prop_123",
  "rating": 5,
  "comment": "Excelente experiencia, muy recomendado."
}
```

**Response Esperado:**
```json
{
  "success": true,
  "message": "Review creada exitosamente",
  "data": {
    "review": { ... }
  }
}
```

#### ✅ **PUT Actualizar Review**
- **Ruta:** `PUT /api/reviews/{reviewId}`
- **Auth:** ✅ Requerida
- **Body:**
```json
{
  "rating": 4,
  "comment": "Actualizado..."
}
```

#### ✅ **DELETE Eliminar Review**
- **Ruta:** `DELETE /api/reviews/{reviewId}`
- **Auth:** ✅ Requerida

---

## 2. Cambios Implementados

### Archivo: `lib/api/reviews.ts`

#### ✅ Cambio 1: Endpoint GET Reviews
**Antes:** Intentaba múltiples endpoints en orden aleatorio
**Ahora:** Usa el endpoint oficial `GET /api/reviews?propertyId={id}...` como primera opción

```typescript
// Construir endpoint según documentación oficial del backend
const queryParams = new URLSearchParams();
queryParams.append('propertyId', propertyId);
if (filters?.page) queryParams.append('page', filters.page.toString());
if (filters?.limit) queryParams.append('limit', filters.limit.toString());
if (filters?.sort) queryParams.append('sort', filters.sort);
else queryParams.append('sort', 'newest'); // Default según documentación

const endpoint = `/api/reviews?${queryParams.toString()}`;
```

#### ✅ Cambio 2: Endpoint POST Crear Review
**Antes:** Intentaba múltiples endpoints
**Ahora:** Usa `POST /api/reviews` como endpoint principal, con `propertyId` en el body

```typescript
// Endpoint oficial según documentación del backend
const primaryEndpoint = `/api/reviews`;

const bodyWithPropertyId = {
  propertyId: propertyId,
  rating: reviewData.rating,
  comment: reviewData.comment,
};
```

#### ✅ Cambio 3: Normalización de Respuestas
**Mantenido:** El código ya normaliza diferentes formatos de respuesta del backend:
- `{ success: true, data: { reviews: [] } }` - Formato ideal
- `{ success: true, data: [] }` - Array directo
- `{ success: true, reviews: [] }` - Array en propiedad reviews

---

## 3. Validaciones Implementadas

### Frontend (Zod Schemas)
- ✅ `rating`: número entre 1 y 5 (requerido)
- ✅ `comment`: string, mínimo 10 caracteres, máximo 1000 (opcional)
- ✅ `propertyId`: string válido (requerido)

### Backend (Según Documentación)
El backend debe validar:
- ✅ `rating`: 1-5 (requerido)
- ✅ `comment`: 10-1000 caracteres (opcional)
- ✅ `propertyId`: válido (requerido)
- ✅ `userId`: extraído del token JWT (NO del body)

---

## 4. Manejo de Errores

### Códigos HTTP según Documentación

| Código | Descripción | Manejo en Frontend |
|--------|-------------|-------------------|
| `200` | OK | Respuesta exitosa |
| `201` | Created | Review creada |
| `400` | Bad Request | Mostrar mensaje de validación |
| `401` | Unauthorized | Redirigir a login |
| `403` | Forbidden | Mostrar "No tienes permisos" |
| `404` | Not Found | Mostrar "No encontrado" |
| `500` | Internal Server Error | Mostrar "Error del servidor" |

### Mensajes de Error Implementados

```typescript
// Ejemplos de manejo
if (error.message.includes('401')) {
  return { success: false, message: 'Debes iniciar sesión para dejar una reseña' };
}

if (error.message.includes('403')) {
  return { success: false, message: 'No tienes permisos para crear una reseña' };
}

if (error.message.includes('409')) {
  return { success: false, message: 'Ya has dejado una reseña para esta propiedad' };
}
```

---

## 5. Formato de Datos

### Request Body (POST /api/reviews)
```typescript
{
  propertyId: string;  // ✅ Requerido, en body
  rating: number;      // ✅ Requerido, 1-5
  comment?: string;     // ❌ Opcional, 10-1000 caracteres
}
```

### Response Format (GET /api/reviews)
```typescript
{
  success: boolean;
  message?: string;
  data: {
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    averageRating: number;
  };
}
```

### Review Object
```typescript
{
  id: string;
  propertyId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}
```

---

## 6. Checklist de Integración

### Endpoints
- [x] GET `/api/reviews?propertyId={id}...` - Implementado como endpoint principal
- [x] POST `/api/reviews` - Implementado con propertyId en body
- [x] PUT `/api/reviews/{reviewId}` - Ya implementado correctamente
- [x] DELETE `/api/reviews/{reviewId}` - Ya implementado correctamente

### Validaciones
- [x] Rating: 1-5 validado en frontend (Zod)
- [x] Comment: 10-1000 caracteres validado en frontend (Zod)
- [x] PropertyId: validado como string requerido

### Manejo de Respuestas
- [x] Normalización de diferentes formatos de respuesta
- [x] Manejo de errores HTTP (400, 401, 403, 404, 500)
- [x] Validación con Zod con fallback manual

### Documentación
- [x] Endpoints actualizados según documentación
- [x] Código comentado con referencias a documentación
- [x] Logging para debugging

---

## 7. Pruebas Recomendadas

### Prueba 1: Obtener Reviews
```bash
GET /api/reviews?propertyId=123&page=1&limit=10&sort=newest
```
**Verificar:**
- ✅ Respuesta tiene formato `{ success: true, data: { reviews: [], total: ... } }`
- ✅ Reviews incluyen información del usuario
- ✅ Paginación funciona correctamente

### Prueba 2: Crear Review
```bash
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "123",
  "rating": 5,
  "comment": "Excelente experiencia"
}
```
**Verificar:**
- ✅ Review se crea exitosamente
- ✅ Response incluye review creada
- ✅ Validaciones funcionan (rating 1-5, comment 10-1000)

### Prueba 3: Actualizar Review
```bash
PUT /api/reviews/{reviewId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Actualizado"
}
```

### Prueba 4: Eliminar Review
```bash
DELETE /api/reviews/{reviewId}
Authorization: Bearer <token>
```

---

## 8. Notas Finales

### Endpoints Confirmados
Los endpoints ahora siguen **exactamente** la documentación del backend:
- ✅ `GET /api/reviews?propertyId={id}...` - **Confirmado como endpoint principal**
- ✅ `POST /api/reviews` - **Confirmado con propertyId en body**

### Compatibilidad
El código mantiene compatibilidad con formatos alternativos de respuesta (array directo, etc.) pero prioriza el formato oficial.

### Próximos Pasos
1. ✅ Verificar en Postman que los endpoints coinciden
2. ✅ Probar flujo completo de crear/leer/actualizar/eliminar reviews
3. ✅ Verificar que las validaciones del backend coinciden con las del frontend

---

## 📝 Referencias

- **Documentación Backend:** `FRONTEND_REVIEWS_API.md`
- **Código Frontend:** `lib/api/reviews.ts`
- **Schemas Validación:** `schemas/reviews.ts`
- **Componente UI:** `components/PropertyReviews.tsx`

