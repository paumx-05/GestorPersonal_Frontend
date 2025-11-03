# 📘 Guía de Implementación - Sistema de Reseñas (Reviews) para Frontend

## 📋 Tabla de Contenidos

1. [Reglas de Negocio](#reglas-de-negocio)
2. [Endpoints de la API](#endpoints-de-la-api)
3. [Implementación Paso a Paso](#implementación-paso-a-paso)
4. [Actualización de Estadísticas](#actualización-de-estadísticas)
5. [Ejemplos de Código](#ejemplos-de-código)
6. [Manejo de Errores](#manejo-de-errores)
7. [Checklist de Implementación](#checklist-de-implementación)

---

## 🎯 Reglas de Negocio

### ⚠️ Reglas Críticas que DEBES Implementarrrrr

1. **❌ No puedes crear una review de tu propia propiedad**
   - Si `property.host.id` (o `property.hostId`) coincide con `currentUser.id`, **NO mostrar el formulario de review**
   - Mostrar mensaje: "No puedes dejar una reseña de tu propia propiedad"

2. **❌ No puedes crear más de una review por propiedad**
   - Antes de mostrar el formulario, verificar si el usuario ya tiene una review
   - Si ya existe una review del usuario, mostrar opción de "Editar" o "Eliminar" en lugar de "Crear nueva"
   - El backend devuelve `409 Conflict` si intentas crear una segunda review

3. **✅ Actualizar estadísticas después de crear/editar/eliminar**
   - Después de cualquier operación (crear, editar, eliminar review), **DEBES actualizar**:
     - El rating promedio (estrellas) en la propiedad
     - El número total de reviews
   - Esto debe actualizarse en **dos lugares**:
     - **Página de detalle de propiedad** (donde se muestran todas las reviews)
     - **Preview/tarjeta de propiedad** (en listados, búsquedas, etc.)

---

## 🔗 Endpoints de la API

### Endpoints Públicos (No requieren autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/reviews?propertyId={id}&page={page}&limit={limit}&sort={sort}` | Obtener reviews de una propiedad |
| `GET` | `/api/reviews/property/{propertyId}/stats` | Obtener estadísticas (rating promedio, total reviews) |

### Endpoints Protegidos (Requieren autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/reviews` | Crear nueva review |
| `PUT` | `/api/reviews/{reviewId}` | Actualizar review existente |
| `DELETE` | `/api/reviews/{reviewId}` | Eliminar review |
| `GET` | `/api/properties/{propertyId}` | Obtener información completa de la propiedad (incluye `host.id` y estadísticas) |

---

## 📖 Implementación Paso a Paso

### Paso 1: Verificar si el usuario puede crear una review

**Antes de mostrar el formulario de review, verifica:**

```javascript
async function canUserCreateReview(propertyId, currentUserId) {
  try {
    // 1. Obtener la propiedad para verificar si es del usuario
    const propertyResponse = await fetch(`/api/properties/${propertyId}`);
    const propertyData = await propertyResponse.json();
    
    if (!propertyData.success) {
      return { canCreate: false, reason: 'Propiedad no encontrada' };
    }
    
    const property = propertyData.data;
    
    // 2. Verificar si la propiedad es del usuario actual
    const hostId = property.hostId || property.host?.id;
    if (hostId === currentUserId) {
      return { 
        canCreate: false, 
        reason: 'No puedes dejar una reseña de tu propia propiedad' 
      };
    }
    
    // 3. Verificar si el usuario ya tiene una review para esta propiedad
    const reviewsResponse = await fetch(
      `/api/reviews?propertyId=${propertyId}&page=1&limit=100&sort=newest`
    );
    const reviewsData = await reviewsResponse.json();
    
    if (reviewsData.success) {
      const userReview = reviewsData.data.reviews.find(
        review => review.userId === currentUserId
      );
      
      if (userReview) {
        return { 
          canCreate: false, 
          reason: 'Ya has dejado una reseña para esta propiedad',
          existingReview: userReview // Para poder editarla/eliminarla
        };
      }
    }
    
    return { canCreate: true };
  } catch (error) {
    console.error('Error verificando permisos:', error);
    return { canCreate: false, reason: 'Error al verificar permisos' };
  }
}
```

### Paso 2: Obtener estadísticas actualizadas

```javascript
async function getPropertyStats(propertyId) {
  try {
    const response = await fetch(`/api/reviews/property/${propertyId}/stats`);
    const data = await response.json();
    
    if (data.success) {
      return {
        averageRating: data.data.averageRating,
        totalReviews: data.data.totalReviews
      };
    }
    
    return { averageRating: 0, totalReviews: 0 };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { averageRating: 0, totalReviews: 0 };
  }
}
```

### Paso 3: Crear una review

```javascript
async function createReview(propertyId, rating, comment = null) {
  try {
    const token = localStorage.getItem('authToken');
    
    // Preparar body (no incluir comment si está vacío)
    const body = {
      propertyId,
      rating
    };
    
    // Solo agregar comment si tiene contenido real (mínimo 10 caracteres)
    if (comment && String(comment).trim().length >= 10) {
      body.comment = String(comment).trim();
    }
    
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Manejar errores específicos
      if (response.status === 409) {
        throw new Error('Ya has dejado una reseña para esta propiedad');
      }
      if (response.status === 401) {
        throw new Error('Debes iniciar sesión para dejar una reseña');
      }
      throw new Error(data.error?.message || 'Error al crear la reseña');
    }
    
    return data.data.review;
  } catch (error) {
    console.error('Error creando review:', error);
    throw error;
  }
}
```

### Paso 4: Actualizar estadísticas después de crear/editar/eliminar

**IMPORTANTE:** Después de cualquier operación sobre reviews, debes actualizar las estadísticas en:

1. **Página de detalle de propiedad** (donde se muestran las reviews)
2. **Preview/tarjeta de propiedad** (en listados)

```javascript
async function refreshPropertyStats(propertyId) {
  try {
    // Obtener estadísticas actualizadas
    const stats = await getPropertyStats(propertyId);
    
    // Actualizar en la página de detalle
    updateDetailPageStats(stats);
    
    // Actualizar en los previews/tarjetas de propiedad
    updatePropertyPreview(propertyId, stats);
    
    return stats;
  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
  }
}

function updateDetailPageStats(stats) {
  // Actualizar rating (estrellas)
  const ratingElement = document.querySelector('[data-property-rating]');
  if (ratingElement) {
    ratingElement.textContent = stats.averageRating.toFixed(1);
    // También actualizar las estrellas visuales si las tienes
    updateStarRating(stats.averageRating);
  }
  
  // Actualizar número de reviews
  const reviewCountElement = document.querySelector('[data-property-review-count]');
  if (reviewCountElement) {
    reviewCountElement.textContent = `${stats.totalReviews} ${stats.totalReviews === 1 ? 'reseña' : 'reseñas'}`;
  }
}

function updatePropertyPreview(propertyId, stats) {
  // Buscar todas las tarjetas/previews de esta propiedad en la página
  const previewElements = document.querySelectorAll(`[data-property-id="${propertyId}"]`);
  
  previewElements.forEach(element => {
    // Actualizar rating en el preview
    const ratingEl = element.querySelector('[data-property-rating]');
    if (ratingEl) {
      ratingEl.textContent = stats.averageRating.toFixed(1);
    }
    
    // Actualizar número de reviews en el preview
    const reviewCountEl = element.querySelector('[data-property-review-count]');
    if (reviewCountEl) {
      reviewCountEl.textContent = `${stats.totalReviews} ${stats.totalReviews === 1 ? 'reseña' : 'reseñas'}`;
    }
  });
}
```

---

## 🔄 Actualización de Estadísticas

### Flujo Completo: Crear Review → Actualizar Estadísticas

```javascript
async function handleCreateReview(propertyId, rating, comment) {
  try {
    // 1. Crear la review
    const newReview = await createReview(propertyId, rating, comment);
    
    // 2. Actualizar estadísticas inmediatamente
    await refreshPropertyStats(propertyId);
    
    // 3. Recargar la lista de reviews para mostrar la nueva
    await reloadReviewsList(propertyId);
    
    // 4. Mostrar mensaje de éxito
    showSuccessMessage('¡Reseña creada exitosamente!');
    
    return newReview;
  } catch (error) {
    showErrorMessage(error.message);
    throw error;
  }
}
```

### Flujo Completo: Eliminar Review → Actualizar Estadísticas

```javascript
async function handleDeleteReview(reviewId, propertyId) {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al eliminar la reseña');
    }
    
    // Actualizar estadísticas después de eliminar
    await refreshPropertyStats(propertyId);
    
    // Recargar lista de reviews
    await reloadReviewsList(propertyId);
    
    showSuccessMessage('Reseña eliminada exitosamente');
  } catch (error) {
    showErrorMessage(error.message);
    throw error;
  }
}
```

### Flujo Completo: Actualizar Review → Actualizar Estadísticas

```javascript
async function handleUpdateReview(reviewId, propertyId, rating, comment) {
  try {
    const token = localStorage.getItem('authToken');
    
    const body = {};
    if (rating !== undefined) body.rating = rating;
    if (comment && String(comment).trim().length >= 10) {
      body.comment = String(comment).trim();
    }
    
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al actualizar la reseña');
    }
    
    // Actualizar estadísticas después de editar
    await refreshPropertyStats(propertyId);
    
    // Recargar lista de reviews
    await reloadReviewsList(propertyId);
    
    showSuccessMessage('Reseña actualizada exitosamente');
  } catch (error) {
    showErrorMessage(error.message);
    throw error;
  }
}
```

---

## 💻 Ejemplos de Código

### Ejemplo Completo: React Component

```jsx
import React, { useState, useEffect } from 'react';

function PropertyReviews({ propertyId, currentUserId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [canCreate, setCanCreate] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [property, setProperty] = useState(null);
  
  useEffect(() => {
    loadProperty();
    loadReviews();
    loadStats();
    checkCanCreateReview();
  }, [propertyId, currentUserId]);
  
  async function loadProperty() {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      const data = await response.json();
      if (data.success) {
        setProperty(data.data);
      }
    } catch (error) {
      console.error('Error cargando propiedad:', error);
    }
  }
  
  async function loadReviews() {
    try {
      const response = await fetch(
        `/api/reviews?propertyId=${propertyId}&page=1&limit=10&sort=newest`
      );
      const data = await response.json();
      if (data.success) {
        setReviews(data.data.reviews);
      }
    } catch (error) {
      console.error('Error cargando reviews:', error);
    }
  }
  
  async function loadStats() {
    try {
      const response = await fetch(`/api/reviews/property/${propertyId}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats({
          averageRating: data.data.averageRating,
          totalReviews: data.data.totalReviews
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }
  
  async function checkCanCreateReview() {
    if (!property || !currentUserId) return;
    
    // Verificar si la propiedad es del usuario
    const hostId = property.hostId || property.host?.id;
    if (hostId === currentUserId) {
      setCanCreate(false);
      return;
    }
    
    // Verificar si ya tiene una review
    const userReview = reviews.find(r => r.userId === currentUserId);
    if (userReview) {
      setCanCreate(false);
      setExistingReview(userReview);
      return;
    }
    
    setCanCreate(true);
  }
  
  async function handleCreateReview(rating, comment) {
    try {
      const token = localStorage.getItem('authToken');
      
      const body = { propertyId, rating };
      if (comment && comment.trim().length >= 10) {
        body.comment = comment.trim();
      }
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          alert('Ya has dejado una reseña para esta propiedad');
          return;
        }
        throw new Error(data.error?.message || 'Error al crear la reseña');
      }
      
      // Actualizar estadísticas y reviews
      await loadStats();
      await loadReviews();
      await checkCanCreateReview();
      
      alert('¡Reseña creada exitosamente!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }
  
  async function handleDeleteReview(reviewId) {
    if (!confirm('¿Estás seguro de eliminar esta reseña?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al eliminar la reseña');
      }
      
      // Actualizar estadísticas y reviews
      await loadStats();
      await loadReviews();
      await checkCanCreateReview();
      
      alert('Reseña eliminada exitosamente');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }
  
  return (
    <div className="property-reviews">
      {/* Estadísticas */}
      <div className="reviews-stats">
        <div className="rating">
          <span className="stars">⭐</span>
          <span data-property-rating>{stats.averageRating.toFixed(1)}</span>
        </div>
        <div className="review-count">
          <span data-property-review-count>
            {stats.totalReviews} {stats.totalReviews === 1 ? 'reseña' : 'reseñas'}
          </span>
        </div>
      </div>
      
      {/* Mensaje si es propietario */}
      {property && (property.hostId || property.host?.id) === currentUserId && (
        <div className="alert alert-info">
          No puedes dejar una reseña de tu propia propiedad
        </div>
      )}
      
      {/* Mensaje si ya tiene review */}
      {existingReview && (
        <div className="alert alert-warning">
          Ya has dejado una reseña para esta propiedad
          <button onClick={() => handleDeleteReview(existingReview.id)}>
            Eliminar mi reseña
          </button>
        </div>
      )}
      
      {/* Formulario de creación (solo si puede crear) */}
      {canCreate && currentUserId && (
        <ReviewForm onSubmit={handleCreateReview} />
      )}
      
      {/* Lista de reviews */}
      <div className="reviews-list">
        {reviews.map(review => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            currentUserId={currentUserId}
            onDelete={handleDeleteReview}
          />
        ))}
      </div>
    </div>
  );
}

export default PropertyReviews;
```

### Ejemplo: Actualizar Preview de Propiedad

```javascript
// Función para actualizar todas las tarjetas de propiedad en la página
function updateAllPropertyPreviews(propertyId, newStats) {
  // Buscar todas las instancias de esta propiedad en la página
  const propertyCards = document.querySelectorAll(
    `[data-property-id="${propertyId}"]`
  );
  
  propertyCards.forEach(card => {
    // Actualizar rating
    const ratingEl = card.querySelector('[data-property-rating]');
    if (ratingEl) {
      ratingEl.textContent = newStats.averageRating.toFixed(1);
      // También actualizar estrellas visuales
      updateStarDisplay(ratingEl, newStats.averageRating);
    }
    
    // Actualizar número de reviews
    const reviewCountEl = card.querySelector('[data-property-review-count]');
    if (reviewCountEl) {
      reviewCountEl.textContent = 
        `${newStats.totalReviews} ${newStats.totalReviews === 1 ? 'reseña' : 'reseñas'}`;
    }
  });
}

// Usar después de crear/editar/eliminar review
async function onReviewChange(propertyId) {
  // Obtener estadísticas actualizadas
  const stats = await getPropertyStats(propertyId);
  
  // Actualizar en la página de detalle
  updateDetailStats(stats);
  
  // Actualizar en todos los previews
  updateAllPropertyPreviews(propertyId, stats);
}
```

---

## ⚠️ Manejo de Errores

### Códigos de Error Comunes

| Código | Significado | Acción |
|--------|-------------|--------|
| `400` | Datos inválidos | Validar datos antes de enviar |
| `401` | No autenticado | Redirigir a login |
| `403` | Sin permisos | Mostrar mensaje apropiado |
| `409` | Review duplicada | Ya existe una review del usuario |
| `404` | No encontrado | Propiedad o review no existe |
| `500` | Error del servidor | Mostrar mensaje genérico |

### Ejemplo de Manejo de Errores

```javascript
async function safeCreateReview(propertyId, rating, comment) {
  try {
    // Validar antes de enviar
    if (rating < 1 || rating > 5) {
      throw new Error('El rating debe estar entre 1 y 5');
    }
    
    if (comment && comment.trim().length < 10) {
      throw new Error('El comentario debe tener al menos 10 caracteres');
    }
    
    const review = await createReview(propertyId, rating, comment);
    return { success: true, review };
  } catch (error) {
    // Manejar diferentes tipos de errores
    if (error.message.includes('409') || error.message.includes('duplicada')) {
      return { 
        success: false, 
        error: 'Ya has dejado una reseña para esta propiedad' 
      };
    }
    
    if (error.message.includes('401') || error.message.includes('autenticado')) {
      return { 
        success: false, 
        error: 'Debes iniciar sesión para dejar una reseña',
        redirectToLogin: true
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'Error al crear la reseña' 
    };
  }
}
```

---

## ✅ Checklist de Implementación

### Verificaciones Previas

- [ ] Verificar que `property.host.id` (o `property.hostId`) no coincida con `currentUser.id`
- [ ] Verificar que el usuario no tenga ya una review para esta propiedad
- [ ] Ocultar formulario de creación si no puede crear review
- [ ] Mostrar mensaje apropiado si es propietario o ya tiene review

### Creación de Review

- [ ] Validar rating (1-5) antes de enviar
- [ ] Validar comentario (10-1000 caracteres) si se proporciona
- [ ] No incluir `comment` en el body si está vacío
- [ ] Manejar error 409 (review duplicada)
- [ ] Manejar error 401 (no autenticado)

### Actualización de Estadísticas

- [ ] **Actualizar estadísticas después de crear review**
- [ ] **Actualizar estadísticas después de editar review**
- [ ] **Actualizar estadísticas después de eliminar review**
- [ ] **Actualizar en página de detalle**
- [ ] **Actualizar en previews/tarjetas de propiedad**

### UI/UX

- [ ] Mostrar rating promedio (estrellas) actualizado
- [ ] Mostrar número total de reviews actualizado
- [ ] Mostrar mensajes de éxito/error
- [ ] Recargar lista de reviews después de operaciones
- [ ] Permitir editar/eliminar solo las propias reviews

### Validaciones

- [ ] Rating entre 1 y 5
- [ ] Comentario entre 10 y 1000 caracteres (si se proporciona)
- [ ] No crear review de propia propiedad
- [ ] No crear más de una review por propiedad

---

## 📝 Notas Importantes

1. **El backend NO valida si eres propietario de la propiedad**, esa validación debe hacerse en el frontend antes de mostrar el formulario.

2. **El backend SÍ valida si ya tienes una review** y devuelve `409 Conflict` si intentas crear una segunda.

3. **Las estadísticas se calculan automáticamente** en el backend cuando llamas a `/api/reviews/property/{id}/stats`, pero **DEBES llamarlo después de cada operación** para obtener los valores actualizados.

4. **Las propiedades tienen campos `rating` y `reviewCount`** que pueden estar desactualizados. **Siempre usa las estadísticas del endpoint `/api/reviews/property/{id}/stats`** para obtener valores precisos.

5. **Después de crear/editar/eliminar una review**, actualiza las estadísticas en:
   - La página de detalle de la propiedad
   - Todos los previews/tarjetas de esa propiedad en la página

---

## 🔗 Referencias

- **Documentación completa de API**: `docs/FRONTEND_REVIEWS_API.md`
- **Quick Reference**: `docs/frontend/REVIEWS_QUICK_REFERENCE.md`
- **Fix de Reviews Duplicadas**: `BACKEND-FIX-REVIEWS-DUPLICATE-409.md`

---

**Última actualización**: 2025-01-27  
**Versión**: 1.0.0

