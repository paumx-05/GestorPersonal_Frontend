/**
 * 📘 Reviews API - Helper Functions
 * 
 * Este archivo contiene funciones helper listas para usar
 * que facilitan la integración con la API de Reviews.
 * 
 * Uso:
 * 1. Copia este archivo a tu proyecto frontend
 * 2. Ajusta la función getAuthToken() según tu sistema de autenticación
 * 3. Importa las funciones que necesites
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

/**
 * Obtiene el token de autenticación
 * Ajusta esto según tu sistema de autenticación
 */
function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

/**
 * Realiza una petición HTTP con manejo de errores
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.error?.message || 'Error en la petición');
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (error) {
    // Manejo de errores específicos
    if (error.status === 401) {
      // Token inválido o expirado
      console.error('Sesión expirada. Redirigir a login.');
      // Aquí puedes agregar lógica para redirigir al login
      // window.location.href = '/login';
    }
    
    throw error;
  }
}

/**
 * Valida una review antes de enviarla
 */
function validateReview(rating, comment = null) {
  const errors = [];
  
  // Validar rating
  if (!rating || typeof rating !== 'number') {
    errors.push('El rating es requerido');
  } else if (rating < 1 || rating > 5) {
    errors.push('El rating debe estar entre 1 y 5');
  }
  
  // Validar comment (opcional pero si se proporciona, debe cumplir requisitos)
  if (comment !== null && comment !== undefined && comment !== '') {
    const commentStr = String(comment).trim();
    if (commentStr.length < 10) {
      errors.push('El comentario debe tener al menos 10 caracteres');
    }
    if (commentStr.length > 1000) {
      errors.push('El comentario no puede exceder 1000 caracteres');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// =============================================================================
// ENDPOINTS DE REVIEWS
// =============================================================================

/**
 * Obtiene las reviews de una propiedad
 * 
 * @param {string} propertyId - ID de la propiedad
 * @param {Object} options - Opciones de paginación y ordenamiento
 * @param {number} options.page - Número de página (default: 1)
 * @param {number} options.limit - Cantidad por página (default: 10)
 * @param {string} options.sort - Orden: 'newest', 'oldest', 'highest', 'lowest' (default: 'newest')
 * @returns {Promise<Object>} { reviews, total, page, limit, averageRating }
 */
export async function getPropertyReviews(propertyId, options = {}) {
  if (!propertyId) {
    throw new Error('propertyId es requerido');
  }
  
  const { page = 1, limit = 10, sort = 'newest' } = options;
  
  const params = new URLSearchParams({
    propertyId,
    page: String(page),
    limit: String(limit),
    sort
  });
  
  const data = await apiRequest(`/api/reviews?${params.toString()}`);
  
  return data.data; // { reviews, total, page, limit, averageRating }
}

/**
 * Obtiene las reviews de una propiedad (método alternativo)
 * Usa el endpoint /api/reviews/property/:id
 * 
 * @param {string} propertyId - ID de la propiedad
 * @param {Object} options - Opciones de paginación y ordenamiento
 * @returns {Promise<Object>} { reviews, total, page, limit, averageRating }
 */
export async function getPropertyReviewsAlt(propertyId, options = {}) {
  if (!propertyId) {
    throw new Error('propertyId es requerido');
  }
  
  const { page = 1, limit = 10, sort = 'newest' } = options;
  
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort
  });
  
  const data = await apiRequest(`/api/reviews/property/${propertyId}?${params.toString()}`);
  
  return data.data;
}

/**
 * Obtiene las estadísticas de reviews de una propiedad
 * 
 * @param {string} propertyId - ID de la propiedad
 * @returns {Promise<Object>} { propertyId, totalReviews, averageRating, categoryAverages }
 */
export async function getReviewStats(propertyId) {
  if (!propertyId) {
    throw new Error('propertyId es requerido');
  }
  
  const data = await apiRequest(`/api/reviews/property/${propertyId}/stats`);
  
  return data.data;
}

/**
 * Crea una nueva review
 * 
 * @param {Object} reviewData - Datos de la review
 * @param {string} reviewData.propertyId - ID de la propiedad
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Comentario (opcional, 10-1000 caracteres)
 * @returns {Promise<Object>} Review creada
 */
export async function createReview(reviewData) {
  const { propertyId, rating, comment } = reviewData;
  
  // Validar datos
  const validation = validateReview(rating, comment);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // Preparar body - solo incluir comment si tiene contenido
  const body = {
    propertyId,
    rating
  };
  
  // Solo agregar comment si tiene contenido (no vacío después de trim)
  if (comment && String(comment).trim().length > 0) {
    body.comment = String(comment).trim();
  }
  
  const data = await apiRequest('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  
  return data.data.review;
}

/**
 * Actualiza una review existente
 * 
 * @param {string} reviewId - ID de la review
 * @param {Object} updates - Campos a actualizar
 * @param {number} updates.rating - Nuevo rating (opcional, 1-5)
 * @param {string} updates.comment - Nuevo comentario (opcional, 10-1000 caracteres)
 * @returns {Promise<Object>} Review actualizada
 */
export async function updateReview(reviewId, updates) {
  if (!reviewId) {
    throw new Error('reviewId es requerido');
  }
  
  const { rating, comment } = updates;
  
  // Validar si se proporcionan datos
  if (rating !== undefined) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('El rating debe estar entre 1 y 5');
    }
  }
  
  if (comment !== undefined && comment !== null && comment !== '') {
    const commentStr = String(comment).trim();
    if (commentStr.length < 10) {
      throw new Error('El comentario debe tener al menos 10 caracteres');
    }
    if (commentStr.length > 1000) {
      throw new Error('El comentario no puede exceder 1000 caracteres');
    }
  }
  
  // Preparar body - solo incluir campos que tienen valores
  const body = {};
  if (rating !== undefined) {
    body.rating = rating;
  }
  
  // Solo agregar comment si tiene contenido (no vacío después de trim)
  if (comment !== undefined && comment !== null) {
    const commentTrimmed = String(comment).trim();
    if (commentTrimmed.length > 0) {
      body.comment = commentTrimmed;
    }
  }
  
  const data = await apiRequest(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  
  return data.data.review;
}

/**
 * Elimina una review
 * 
 * @param {string} reviewId - ID de la review a eliminar
 * @returns {Promise<boolean>} true si se eliminó exitosamente
 */
export async function deleteReview(reviewId) {
  if (!reviewId) {
    throw new Error('reviewId es requerido');
  }
  
  await apiRequest(`/api/reviews/${reviewId}`, {
    method: 'DELETE'
  });
  
  return true;
}

/**
 * Obtiene las reviews de un usuario
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Array de reviews
 */
export async function getUserReviews(userId) {
  if (!userId) {
    throw new Error('userId es requerido');
  }
  
  const data = await apiRequest(`/api/reviews/user/${userId}`);
  
  return data.data;
}

// =============================================================================
// FUNCIONES UTILITARIAS
// =============================================================================

/**
 * Formatea un rating para mostrar (ej: 4.5 -> "4.5" o "4.5 ⭐")
 */
export function formatRating(rating) {
  if (typeof rating !== 'number') {
    return '0.0';
  }
  return rating.toFixed(1);
}

/**
 * Genera un array de estrellas para mostrar el rating
 */
export function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return {
    full: fullStars,
    half: hasHalfStar ? 1 : 0,
    empty: emptyStars
  };
}

/**
 * Formatea una fecha para mostrar (ej: "Hace 2 días", "15 de enero 2024")
 */
export function formatReviewDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Hoy';
  } else if (diffDays === 1) {
    return 'Ayer';
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

/**
 * Calcula el número total de páginas basado en total y limit
 */
export function calculateTotalPages(total, limit) {
  return Math.ceil(total / limit);
}

// =============================================================================
// EJEMPLOS DE USO
// =============================================================================

// Ejemplo 1: Obtener reviews de una propiedad
async function example1() {
  try {
    const reviewsData = await getPropertyReviews('prop_123', {
      page: 1,
      limit: 10,
      sort: 'newest'
    });
    
    console.log(`Total reviews: ${reviewsData.total}`);
    console.log(`Rating promedio: ${reviewsData.averageRating}`);
    console.log(`Reviews:`, reviewsData.reviews);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejemplo 2: Crear una review
async function example2() {
  try {
    const newReview = await createReview({
      propertyId: 'prop_123',
      rating: 5,
      comment: 'Excelente experiencia, muy recomendado.'
    });
    
    console.log('Review creada:', newReview);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejemplo 3: Actualizar una review
async function example3() {
  try {
    const updatedReview = await updateReview('review_123', {
      rating: 4,
      comment: 'Actualizado: Muy bueno pero podría mejorar.'
    });
    
    console.log('Review actualizada:', updatedReview);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejemplo 4: Eliminar una review
async function example4() {
  try {
    await deleteReview('review_123');
    console.log('Review eliminada exitosamente');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejemplo 5: Obtener estadísticas
async function example5() {
  try {
    const stats = await getReviewStats('prop_123');
    console.log(`Rating promedio: ${stats.averageRating}`);
    console.log(`Total reviews: ${stats.totalReviews}`);
    console.log(`Categorías:`, stats.categoryAverages);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Exportar todas las funciones
export default {
  getPropertyReviews,
  getPropertyReviewsAlt,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  formatRating,
  generateStars,
  formatReviewDate,
  calculateTotalPages,
  validateReview
};

