# 📋 Quick Reference - Reviews API

## 🔗 Endpoints Principales

### 1. GET Reviews (Recomendado)
```
GET /api/reviews?propertyId={id}&page=1&limit=10&sort=newest
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "averageRating": 4.8
  }
}
```

### 2. POST Crear Review
```
POST /api/reviews
Authorization: Bearer <token>
```
**Body:**
```json
{
  "propertyId": "prop_123",
  "rating": 5,
  "comment": "Excelente..." // opcional
}
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Review creada exitosamente",
  "data": { "review": {...} }
}
```

### 3. PUT Actualizar Review
```
PUT /api/reviews/{reviewId}
Authorization: Bearer <token>
```
**Body:**
```json
{
  "rating": 4,
  "comment": "Actualizado..."
}
```

### 4. DELETE Eliminar Review
```
DELETE /api/reviews/{reviewId}
Authorization: Bearer <token>
```

### 5. GET Estadísticas
```
GET /api/reviews/property/{propertyId}/stats
```

---

## ✅ Validaciones

- **rating:** Requerido, número entre 1-5
- **comment:** Opcional, si se proporciona: 10-1000 caracteres
- **propertyId:** Requerido para crear review

---

## 📝 Ejemplo JavaScript Básico

```javascript
// Obtener reviews
const response = await fetch('/api/reviews?propertyId=123&page=1&limit=10&sort=newest');
const { data } = await response.json();
console.log(data.reviews, data.averageRating);

// Crear review
await fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    propertyId: '123',
    rating: 5,
    comment: 'Excelente lugar!'
  })
});
```

---

## 🔄 Valores de Sort

- `newest` - Más recientes (default)
- `oldest` - Más antiguas
- `highest` - Mayor rating
- `lowest` - Menor rating

---

## 📚 Documentación Completa

Ver: `docs/FRONTEND_REVIEWS_API.md`
Ejemplos: `docs/frontend/reviews-api-example.js`
React: `docs/frontend/react-reviews-example.tsx`

