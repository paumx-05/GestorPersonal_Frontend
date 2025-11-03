# Fase: Módulo de Reviews (Reseñas)

## 📋 Resumen

Este documento planifica la integración completa del módulo de **reviews/reseñas** para propiedades, reemplazando cualquier mock existente y conectando con el backend real mediante los endpoints documentados en Postman.

**Objetivo:** Implementar una sección de reviews completa en las páginas de detalle de propiedades, permitiendo a los usuarios ver, crear y gestionar reseñas.

---

## 1. Auditoría del módulo (mock actual)

### Archivos actuales relacionados:
- `components/PropertyDetail.tsx` - Página principal de detalle (líneas 136-138 muestran rating y reviewCount, pero no hay componente de reviews)
- `lib/api/properties.ts` - Servicio de propiedades (incluye `rating` y `reviewCount` en interfaz `Property`)
- `components/HostInfo.tsx` - Muestra información del host y amenidades, pero NO incluye reviews

### Estado actual:
- ✅ **Rating y reviewCount** se muestran en el header de la propiedad (línea 136-138 de PropertyDetail.tsx)
- ❌ **NO existe componente de reviews** para mostrar reseñas individuales
- ❌ **NO hay mock de reviews** (solo se muestran números agregados)
- ❌ **NO hay integración con backend** para reviews

### Mapa de estados UI necesarios:
- **Loading:** Skeleton/spinner mientras carga reviews
- **Success:** Lista de reviews con paginación
- **Empty:** Mensaje cuando no hay reviews ("Sé el primero en dejar una reseña")
- **Error:** Mensaje de error con botón de reintento
- **Formulario crear review:** Modal o sección para crear nueva review (requiere autenticación)

---

## 2. Revisión de Postman → Contrato

### Endpoints esperados (ajustar según tu documentación):

#### **GET /api/properties/:propertyId/reviews**
**Descripción:** Obtener todas las reviews de una propiedad

**Método:** `GET`

**Auth:** ❌ Opcional (público para leer)

**Headers:**
```
Content-Type: application/json
```

**Query Params (opcionales):**
- `page`: número de página (default: 1)
- `limit`: cantidad por página (default: 10)
- `sort`: `newest` | `oldest` | `highest` | `lowest` (default: newest)

**Response Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "507f1f77bcf86cd799439011",
        "propertyId": "507f191e810c19729de860ea",
        "userId": "507f1f77bcf86cd799439012",
        "user": {
          "id": "507f1f77bcf86cd799439012",
          "name": "Juan Pérez",
          "avatar": "https://example.com/avatar.jpg"
        },
        "rating": 5,
        "comment": "Excelente ubicación, muy limpio y el host fue muy atento.",
        "createdAt": "2024-12-02T10:00:00.000Z",
        "updatedAt": "2024-12-02T10:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "averageRating": 4.8
  }
}
```

**Errores:**
- `404 Not Found`: Propiedad no encontrada
- `500 Internal Server Error`: Error del servidor

---

#### **POST /api/properties/:propertyId/reviews**
**Descripción:** Crear una nueva review para una propiedad

**Método:** `POST`

**Auth:** ✅ Requerida (JWT token)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excelente experiencia, muy recomendado."
}
```

**Validaciones:**
- `rating`: número entre 1 y 5 (requerido)
- `comment`: string, mínimo 10 caracteres, máximo 1000 caracteres (opcional pero recomendado)

**Response Esperado (201 Created):**
```json
{
  "success": true,
  "message": "Review creada exitosamente",
  "data": {
    "review": {
      "id": "507f1f77bcf86cd799439011",
      "propertyId": "507f191e810c19729de860ea",
      "userId": "507f1f77bcf86cd799439012",
      "rating": 5,
      "comment": "Excelente experiencia, muy recomendado.",
      "createdAt": "2024-12-02T10:00:00.000Z"
    }
  }
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos (rating fuera de rango, comment muy corto/largo)
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Usuario no puede crear review (ej: no ha reservado la propiedad)
- `404 Not Found`: Propiedad no encontrada
- `409 Conflict`: Usuario ya creó una review para esta propiedad

---

#### **PUT /api/reviews/:reviewId**
**Descripción:** Actualizar una review existente (solo el autor)

**Método:** `PUT`

**Auth:** ✅ Requerida (JWT token)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Actualizado: Muy bueno pero podría mejorar."
}
```

**Response Esperado (200 OK):**
```json
{
  "success": true,
  "message": "Review actualizada exitosamente",
  "data": {
    "review": {
      "id": "507f1f77bcf86cd799439011",
      "rating": 4,
      "comment": "Actualizado: Muy bueno pero podría mejorar.",
      "updatedAt": "2024-12-02T11:00:00.000Z"
    }
  }
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: Token inválido
- `403 Forbidden`: Usuario no es el autor de la review
- `404 Not Found`: Review no encontrada

---

#### **DELETE /api/reviews/:reviewId**
**Descripción:** Eliminar una review (solo el autor o admin)

**Método:** `DELETE`

**Auth:** ✅ Requerida (JWT token)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response Esperado (200 OK):**
```json
{
  "success": true,
  "message": "Review eliminada exitosamente"
}
```

**Errores:**
- `401 Unauthorized`: Token inválido
- `403 Forbidden`: Usuario no tiene permisos
- `404 Not Found`: Review no encontrada

---

### Riesgos identificados:
- **Límites de tasa:** Verificar si hay rate limiting en POST reviews
- **Paginación:** Backend debe soportar paginación para grandes volúmenes
- **Validación de permisos:** ¿Solo usuarios que reservaron pueden crear reviews?
- **Timeouts:** Requests pueden tardar con muchas reviews (implementar paginación cliente)
- **CORS:** Verificar headers CORS en backend para POST/PUT/DELETE

---

## 3. Plan de integración

### Flujo de datos:
```
PropertyDetail.tsx 
  → PropertyReviews (componente)
    → useReviews hook (opcional)
      → reviewService.getReviews(propertyId)
        → apiClient.get('/api/properties/:id/reviews')
          → Backend MongoDB
```

### Decisiones técnicas:

1. **Cliente HTTP:** Usar `apiClient` existente en `lib/api/config.ts`
2. **Validación:** Zod schemas en `schemas/reviews.ts`
3. **Estado:** React hooks (`useState`, `useEffect`) - sin React Query inicialmente (agregar si es necesario)
4. **Paginación:** Cliente-side con botones "Cargar más" o paginación numérica
5. **Cache:** localStorage para cache simple de reviews (opcional)
6. **Reintentos:** Reintento automático con `apiClient` (ya implementado)
7. **Toast notifications:** Usar sistema existente si hay, sino `console.log` + mensajes en UI

### Esquemas Zod propuestos:

```typescript
// schemas/reviews.ts
import { z } from 'zod';

export const ReviewSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  userId: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
  }),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
});

export const ReviewsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    reviews: z.array(ReviewSchema),
    total: z.number(),
    page: z.number().optional(),
    limit: z.number().optional(),
    averageRating: z.number().optional(),
  }),
  message: z.string().optional(),
});
```

### Estrategia de errores:
- **Errores de red:** Mostrar mensaje "Error de conexión" con botón de reintento
- **404:** Mensaje "Propiedad no encontrada" o "No hay reviews aún"
- **401/403:** Mostrar mensaje "Inicia sesión para dejar una reseña" o "No tienes permisos"
- **400:** Mostrar errores de validación específicos en el formulario
- **Timeout:** Reintentar automáticamente 1 vez, luego mostrar error

### Estados vacíos:
- **Sin reviews:** Mostrar mensaje amigable "Sé el primero en dejar una reseña" con botón para crear (si está autenticado)
- **Formulario vacío:** Validación en tiempo real antes de enviar

### Flags/Toggles:
- `NEXT_PUBLIC_REVIEWS_ENABLED=true` (opcional, por si se quiere deshabilitar)
- Endpoint configurable: `NEXT_PUBLIC_REVIEWS_ENDPOINT=/api/properties/:id/reviews`

---

## 4. Implementación (tareas)

### Paso 1: Crear servicio de API
- [ ] Crear `lib/api/reviews.ts` con:
  - `getReviews(propertyId, filters?)` - GET reviews con paginación
  - `createReview(propertyId, data)` - POST crear review
  - `updateReview(reviewId, data)` - PUT actualizar review
  - `deleteReview(reviewId)` - DELETE eliminar review
  - Tipos TypeScript exportados (`Review`, `CreateReviewRequest`, etc.)

### Paso 2: Crear schemas de validación
- [ ] Crear `schemas/reviews.ts` con:
  - `ReviewSchema` - Validación de review individual
  - `CreateReviewSchema` - Validación para crear review
  - `ReviewsResponseSchema` - Validación de respuesta del backend

### Paso 3: Crear componente PropertyReviews
- [ ] Crear `components/PropertyReviews.tsx` con:
  - Lista de reviews con paginación
  - Formulario para crear review (solo si está autenticado)
  - Botones editar/eliminar (solo para el autor)
  - Estados: loading, empty, error, success
  - UI moderna con estrellas para rating

### Paso 4: Integrar en PropertyDetail
- [ ] Editar `components/PropertyDetail.tsx`:
  - Importar `PropertyReviews`
  - Agregar sección después de `HostInfo`
  - Pasar `propertyId` como prop

### Paso 5: Testing y documentación
- [ ] Probar endpoints en Postman primero
- [ ] Probar flujo completo en navegador
- [ ] Verificar manejo de errores
- [ ] Generar `report-reviews.md`

---

## 5. Checklist Doc

- [ ] Sin usos de mock en código activo (solo si es necesario para desarrollo)
- [ ] Contratos tipados y validados (Zod/TS) con opcionalidad correcta
- [ ] Estados de UI completos (loading/empty/error/success)
- [ ] Errores manejados con mensajes útiles y trazabilidad mínima
- [ ] Flags/toggles para alternar endpoints si es necesario
- [ ] Documentación `report-reviews.md` generada y clara
- [ ] Telemetría mínima habilitada (logs de consola con prefijos `[reviewService]`)

---

## 6. report-reviews.md (contenido propuesto)

```markdown
# Reviews: Reporte de Integración

## Resumen
Integración completa del módulo de reviews/reseñas para propiedades...

## Endpoints
[Documentar endpoints usados]

## Cambios en Frontend
[Lista de archivos modificados/creados]

## Tipos/Validaciones
[Esquemas Zod y tipos TypeScript]

## Estados y Errores
[Estrategia de manejo de errores implementada]

## Observabilidad
[Logs y telemetría]

## Riesgos y Next Steps
[Riesgos identificados y próximos pasos]
```

---

## 📝 Notas importantes

⚠️ **Ajustar endpoints según tu documentación de Postman**
- Si los endpoints son diferentes, actualizar en `lib/api/reviews.ts`
- Verificar autenticación requerida para cada endpoint
- Confirmar estructura de request/response en Postman

⚠️ **Validación de permisos**
- Verificar si solo usuarios que reservaron pueden crear reviews
- Ajustar lógica en frontend según reglas del backend

⚠️ **Paginación**
- Si el backend no soporta paginación, implementar paginación cliente-side
- Considerar límite máximo de reviews a cargar (ej: 50)

