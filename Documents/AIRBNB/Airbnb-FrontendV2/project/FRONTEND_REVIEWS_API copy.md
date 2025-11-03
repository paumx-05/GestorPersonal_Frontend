# 📘 Documentación API de Reviews - Frontend

## 📋 Tabla de Contenidos

1. [Endpoints Disponibles](#endpoints-disponibles)
2. [Formato de Respuestas](#formato-de-respuestas)
3. [Endpoints Detallados](#endpoints-detallados)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Manejo de Errores](#manejo-de-errores)
6. [Validaciones](#validaciones)
7. [Casos de Uso Comunes](#casos-de-uso-comunes)

---

## 🔗 Endpoints Disponibles

### Rutas Públicas (No requieren autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/reviews?propertyId={id}&page={page}&limit={limit}&sort={sort}` | Obtener reviews de una propiedad (Recomendado) |
| `GET` | `/api/reviews/property/{propertyId}?page={page}&limit={limit}&sort={sort}` | Obtener reviews de una propiedad (Alternativo) |
| `GET` | `/api/reviews/property/{propertyId}/stats` | Obtener estadísticas de reviews |

### Rutas Protegidas (Requieren autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/reviews` | Crear nueva review |
| `PUT` | `/api/reviews/{reviewId}` | Actualizar review existente |
| `DELETE` | `/api/reviews/{reviewId}` | Eliminar review |
| `GET` | `/api/reviews/user/{userId}` | Obtener reviews de un usuario |

---

## 📦 Formato de Respuestas

### Respuesta Exitosa Estándar

```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { ... }
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": {
    "message": "Descripción del error"
  }
}
```

---

## 📖 Endpoints Detallados

### 1. GET /api/reviews (Recomendado)

Obtiene las reviews de una propiedad con paginación, ordenamiento y estadísticas.

**URL:** `/api/reviews`

**Método:** `GET`

**Autenticación:** No requerida

**Query Parameters:**

| Parámetro | Tipo | Requerido | Valor por defecto | Descripción |
|-----------|------|-----------|-------------------|-------------|
| `propertyId` | string | ✅ Sí | - | ID de la propiedad |
| `page` | number | ❌ No | `1` | Número de página |
| `limit` | number | ❌ No | `10` | Cantidad de reviews por página |
| `sort` | string | ❌ No | `newest` | Orden: `newest`, `oldest`, `highest`, `lowest` |

**Ejemplo de Request:**

```
GET /api/reviews?propertyId=123&page=1&limit=10&sort=newest
```

**Response 200:**

```json
{
  "success": true,
  "message": "Reviews obtenidas exitosamente",
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "propertyId": "prop_456",
        "userId": "user_789",
        "user": {
          "id": "user_789",
          "name": "Juan Pérez",
          "avatar": "/uploads/avatars/user_789.jpg"
        },
        "rating": 5,
        "comment": "Excelente experiencia, muy recomendado.",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "averageRating": 4.8
  }
}
```

**Valores de `sort`:**
- `newest`: Más recientes primero (por defecto)
- `oldest`: Más antiguas primero
- `highest`: Mayor rating primero
- `lowest`: Menor rating primero

---

### 2. GET /api/reviews/property/:id (Alternativo)

Misma funcionalidad que el endpoint anterior, pero usando parámetro de ruta.

**URL:** `/api/reviews/property/{propertyId}`

**Método:** `GET`

**Autenticación:** No requerida

**Path Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `propertyId` | string | ✅ Sí | ID de la propiedad |

**Query Parameters:** Igual que el endpoint anterior (`page`, `limit`, `sort`)

**Ejemplo de Request:**

```
GET /api/reviews/property/123?page=1&limit=10&sort=highest
```

**Response:** Igual que el endpoint anterior

---

### 3. GET /api/reviews/property/:id/stats

Obtiene estadísticas de reviews de una propiedad.

**URL:** `/api/reviews/property/{propertyId}/stats`

**Método:** `GET`

**Autenticación:** No requerida

**Path Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `propertyId` | string | ✅ Sí | ID de la propiedad |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "propertyId": "prop_123",
    "totalReviews": 25,
    "averageRating": 4.5,
    "categoryAverages": {
      "cleanliness": 4.6,
      "communication": 4.5,
      "checkin": 4.4,
      "accuracy": 4.7,
      "location": 4.3,
      "value": 4.5
    }
  }
}
```

---

### 4. POST /api/reviews

Crea una nueva review para una propiedad.

**URL:** `/api/reviews`

**Método:** `POST`

**Autenticación:** ✅ Requerida (Bearer Token)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "propertyId": "prop_123",
  "rating": 5,
  "comment": "Excelente experiencia, muy recomendado."
}
```

**Body Parameters:**

| Parámetro | Tipo | Requerido | Validación | Descripción |
|-----------|------|-----------|------------|-------------|
| `propertyId` | string | ✅ Sí | - | ID de la propiedad |
| `rating` | number | ✅ Sí | 1-5 | Rating de la review |
| `comment` | string | ❌ No | 10-1000 caracteres | Comentario (opcional) |

**Nota:** El `userId` se extrae automáticamente del token JWT, no debe enviarse en el body.

**Response 201:**

```json
{
  "success": true,
  "message": "Review creada exitosamente",
  "data": {
    "review": {
      "id": "review_123",
      "propertyId": "prop_123",
      "userId": "user_789",
      "rating": 5,
      "comment": "Excelente experiencia, muy recomendado.",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Errores Comunes:**

- `400`: `propertyId` o `rating` faltantes
- `400`: Rating fuera del rango 1-5
- `400`: Comentario demasiado corto o largo (si se proporciona)
- `401`: Usuario no autenticado

---

### 5. PUT /api/reviews/:id

Actualiza una review existente.

**URL:** `/api/reviews/{reviewId}`

**Método:** `PUT`

**Autenticación:** ✅ Requerida (Bearer Token)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Path Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `reviewId` | string | ✅ Sí | ID de la review a actualizar |

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Actualizado: Muy bueno pero podría mejorar."
}
```

**Body Parameters:**

| Parámetro | Tipo | Requerido | Validación | Descripción |
|-----------|------|-----------|------------|-------------|
| `rating` | number | ❌ No | 1-5 | Nuevo rating (opcional) |
| `comment` | string | ❌ No | 10-1000 caracteres | Nuevo comentario (opcional) |

**Nota:** Solo puedes actualizar tus propias reviews.

**Response 200:**

```json
{
  "success": true,
  "message": "Review actualizada exitosamente",
  "data": {
    "review": {
      "id": "review_123",
      "rating": 4,
      "comment": "Actualizado: Muy bueno pero podría mejorar.",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

**Errores Comunes:**

- `403`: No tienes permisos para actualizar esta review
- `404`: Review no encontrada
- `400`: Rating fuera del rango 1-5
- `400`: Comentario inválido

---

### 6. DELETE /api/reviews/:id

Elimina una review.

**URL:** `/api/reviews/{reviewId}`

**Método:** `DELETE`

**Autenticación:** ✅ Requerida (Bearer Token)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `reviewId` | string | ✅ Sí | ID de la review a eliminar |

**Response 200:**

```json
{
  "success": true,
  "message": "Review eliminada exitosamente"
}
```

**Errores Comunes:**

- `403`: No tienes permisos para eliminar esta review
- `404`: Review no encontrada
- `401`: Usuario no autenticado

---

### 7. GET /api/reviews/user/:id

Obtiene las reviews escritas por un usuario.

**URL:** `/api/reviews/user/{userId}`

**Método:** `GET`

**Autenticación:** ✅ Requerida (Bearer Token)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `userId` | string | ✅ Sí | ID del usuario |

**Nota:** Solo puedes ver tus propias reviews.

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "review_123",
      "propertyId": "prop_456",
      "userId": "user_789",
      "rating": 5,
      "comment": "Excelente experiencia",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 💻 Ejemplos de Uso

### Ejemplo 1: Obtener Reviews con Paginación

```javascript
// JavaScript/TypeScript
async function getPropertyReviews(propertyId, page = 1, limit = 10, sort = 'newest') {
  try {
    const response = await fetch(
      `/api/reviews?propertyId=${propertyId}&page=${page}&limit=${limit}&sort=${sort}`
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.data; // { reviews, total, page, limit, averageRating }
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error obteniendo reviews:', error);
    throw error;
  }
}

// Uso
const reviewsData = await getPropertyReviews('prop_123', 1, 10, 'highest');
console.log(`Promedio: ${reviewsData.averageRating}`);
console.log(`Total: ${reviewsData.total}`);
console.log(`Reviews:`, reviewsData.reviews);
```

### Ejemplo 2: Crear Review

```javascript
async function createReview(propertyId, rating, comment = null) {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        propertyId,
        rating,
        comment: comment || undefined
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.review;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error creando review:', error);
    throw error;
  }
}

// Uso
const newReview = await createReview('prop_123', 5, 'Excelente lugar!');
```

### Ejemplo 3: Actualizar Review

```javascript
async function updateReview(reviewId, updates) {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.review;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error actualizando review:', error);
    throw error;
  }
}

// Uso
const updatedReview = await updateReview('review_123', {
  rating: 4,
  comment: 'Actualizado: Muy bueno'
});
```

### Ejemplo 4: Eliminar Review

```javascript
async function deleteReview(reviewId) {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return true;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error eliminando review:', error);
    throw error;
  }
}

// Uso
await deleteReview('review_123');
```

### Ejemplo 5: Obtener Estadísticas

```javascript
async function getReviewStats(propertyId) {
  try {
    const response = await fetch(`/api/reviews/property/${propertyId}/stats`);
    const data = await response.json();
    
    if (data.success) {
      return data.data; // { propertyId, totalReviews, averageRating, categoryAverages }
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
}

// Uso
const stats = await getReviewStats('prop_123');
console.log(`Rating promedio: ${stats.averageRating}`);
console.log(`Total reviews: ${stats.totalReviews}`);
```

---

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP

| Código | Descripción | Cuando ocurre |
|--------|------------|---------------|
| `200` | OK | Operación exitosa |
| `201` | Created | Review creada exitosamente |
| `400` | Bad Request | Datos inválidos o faltantes |
| `401` | Unauthorized | Token inválido o faltante |
| `403` | Forbidden | No tienes permisos |
| `404` | Not Found | Recurso no encontrado |
| `500` | Internal Server Error | Error del servidor |

### Ejemplo de Manejo de Errores

```javascript
async function handleReviewRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error(`Datos inválidos: ${data.error.message}`);
        case 401:
          // Token inválido, redirigir a login
          logout();
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        case 403:
          throw new Error('No tienes permisos para realizar esta acción');
        case 404:
          throw new Error('Review no encontrada');
        case 500:
          throw new Error('Error del servidor. Por favor, intenta más tarde.');
        default:
          throw new Error(data.error?.message || 'Error desconocido');
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error en petición:', error);
    throw error;
  }
}
```

---

## ✅ Validaciones

### Validaciones del Frontend

Antes de enviar datos al backend, valida:

#### Para crear/actualizar review:

```javascript
function validateReview(rating, comment) {
  const errors = [];
  
  // Validar rating
  if (!rating || rating < 1 || rating > 5) {
    errors.push('El rating debe estar entre 1 y 5');
  }
  
  // Validar comment (si se proporciona)
  if (comment !== null && comment !== undefined && comment !== '') {
    if (comment.length < 10) {
      errors.push('El comentario debe tener al menos 10 caracteres');
    }
    if (comment.length > 1000) {
      errors.push('El comentario no puede exceder 1000 caracteres');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Uso
const validation = validateReview(5, 'Excelente lugar');
if (!validation.isValid) {
  console.error(validation.errors);
  return;
}
```

---

## 🎯 Casos de Uso Comunes

### 1. Mostrar Reviews en una Página de Propiedad

```javascript
// React/Vue ejemplo
async function loadPropertyReviews(propertyId) {
  try {
    // Cargar estadísticas primero
    const stats = await getReviewStats(propertyId);
    
    // Luego cargar reviews con paginación
    const reviewsData = await getPropertyReviews(propertyId, 1, 10, 'newest');
    
    return {
      stats,
      reviews: reviewsData.reviews,
      pagination: {
        total: reviewsData.total,
        page: reviewsData.page,
        limit: reviewsData.limit,
        totalPages: Math.ceil(reviewsData.total / reviewsData.limit)
      }
    };
  } catch (error) {
    console.error('Error cargando reviews:', error);
    return null;
  }
}
```

### 2. Formulario de Creación de Review

```javascript
// React ejemplo
function ReviewForm({ propertyId, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar
    const validation = validateReview(rating, comment);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }
    
    setLoading(true);
    try {
      const newReview = await createReview(propertyId, rating, comment || null);
      onSubmit(newReview);
      // Reset form
      setRating(5);
      setComment('');
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Rating selector */}
      {/* Comment textarea */}
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Review'}
      </button>
    </form>
  );
}
```

### 3. Cambiar Ordenamiento de Reviews

```javascript
function ReviewList({ propertyId }) {
  const [sort, setSort] = useState('newest');
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    loadReviews();
  }, [sort]);
  
  async function loadReviews() {
    const data = await getPropertyReviews(propertyId, 1, 10, sort);
    setReviews(data.reviews);
  }
  
  return (
    <div>
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="newest">Más recientes</option>
        <option value="oldest">Más antiguas</option>
        <option value="highest">Mayor rating</option>
        <option value="lowest">Menor rating</option>
      </select>
      
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
```

### 4. Paginación de Reviews

```javascript
function PaginatedReviewList({ propertyId }) {
  const [page, setPage] = useState(1);
  const [reviewsData, setReviewsData] = useState(null);
  const limit = 10;
  
  useEffect(() => {
    loadReviews();
  }, [page]);
  
  async function loadReviews() {
    const data = await getPropertyReviews(propertyId, page, limit, 'newest');
    setReviewsData(data);
  }
  
  const totalPages = reviewsData ? Math.ceil(reviewsData.total / limit) : 0;
  
  return (
    <div>
      {reviewsData?.reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
      
      <div className="pagination">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </button>
        
        <span>Página {page} de {totalPages}</span>
        
        <button 
          disabled={page >= totalPages} 
          onClick={() => setPage(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

---

## 📝 Notas Importantes

1. **Autenticación:** Los endpoints de creación, actualización y eliminación requieren token JWT en el header `Authorization: Bearer <token>`.

2. **Comentario Opcional:** El comentario es opcional al crear una review, pero si se proporciona, debe tener entre 10 y 1000 caracteres.

3. **Permisos:** Solo puedes actualizar o eliminar tus propias reviews.

4. **Ordenamiento:** Por defecto, las reviews se ordenan por `newest` (más recientes primero).

5. **Paginación:** El límite por defecto es 10 reviews por página.

6. **Información del Usuario:** Cada review incluye información del usuario que la escribió (`user.name`, `user.avatar`), obtenida directamente de la base de datos.

7. **Ratings:** Los ratings deben ser números enteros entre 1 y 5.

---

## 🔄 Changelog

### Versión 1.0.0
- ✅ Endpoint GET `/api/reviews` con query params
- ✅ Soporte de paginación y ordenamiento
- ✅ Inclusión de información del usuario en reviews
- ✅ Comentario opcional con validación
- ✅ Formato de respuesta consistente

---

## 📞 Soporte

Si tienes problemas con la integración, verifica:

1. ✅ El token JWT es válido y está incluido en los headers
2. ✅ Los datos enviados cumplen con las validaciones
3. ✅ El formato de las respuestas coincide con lo esperado
4. ✅ Los IDs de propiedades y reviews son correctos

Para más información, consulta la documentación general de la API.

