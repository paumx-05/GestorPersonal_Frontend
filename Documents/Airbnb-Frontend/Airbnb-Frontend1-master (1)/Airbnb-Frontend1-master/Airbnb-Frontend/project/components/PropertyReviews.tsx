'use client';

import { useState, useEffect } from 'react';
import { reviewService, type ReviewFilters } from '@/lib/api/reviews';
import { Review } from '@/schemas/reviews';
import { Star, StarHalf, Calendar, User, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getAvatarUrl } from '@/lib/utils/avatar';
import { clearRatingCache } from '@/lib/utils/propertyRatings';

interface PropertyReviewsProps {
  propertyId: string;
  propertyRating?: number; // Rating promedio de la propiedad (opcional, se puede calcular desde reviews)
  hostId?: string; // ID del dueño de la propiedad (opcional, para validar si el usuario es el dueño)
  onRatingUpdate?: (rating: number, reviewCount: number) => void; // Callback para notificar actualización de rating y reviewCount
}

/**
 * Componente para mostrar y gestionar reviews de una propiedad
 * Muestra lista de reviews, permite crear/editar/eliminar (si está autenticado)
 * NO permite crear reviews si el usuario es el dueño de la propiedad
 */
const PropertyReviews = ({ propertyId, propertyRating, hostId, onRatingUpdate }: PropertyReviewsProps) => {
  const { user, isAuthenticated: authIsAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado del formulario de creación
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const limit = 10; // Reviews por página

  // Verificar si el usuario es el dueño de la propiedad
  const isOwner = hostId && user?.id && hostId === user.id;
  
  // Determinar si el usuario puede crear reviews
  const canCreateReview = authIsAuthenticated && !isOwner;
  
  // Estado para forzar actualización de avatares en reviews
  const [avatarUpdateKey, setAvatarUpdateKey] = useState(0);
  
  // Escuchar eventos de actualización de avatar y actualizar reviews del usuario
  useEffect(() => {
    if (!authIsAuthenticated || !user?.id) return;
    
    const handleAvatarUpdate = (event: CustomEvent) => {
      console.log('🔄 [PropertyReviews] Avatar actualizado, actualizando reviews del usuario...');
      // Incrementar key para forzar re-render de avatares en reviews
      setAvatarUpdateKey(prev => prev + 1);
    };
    
    window.addEventListener('user:avatarUpdated', handleAvatarUpdate as EventListener);
    
    return () => {
      window.removeEventListener('user:avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, [authIsAuthenticated, user?.id]);

  // Cargar reviews
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters: ReviewFilters = {
          page,
          limit,
          sort: 'newest',
        };
        
        const response = await reviewService.getReviews(propertyId, filters);
        
        if (response.success && response.data) {
          setReviews(response.data.reviews);
          setTotalReviews(response.data.total);
          const newAverageRating = response.data.averageRating || 0;
          setAverageRating(newAverageRating);
          
          // Limpiar cache de ratings para que se actualicen los previews
          clearRatingCache(propertyId);
          
          // Notificar al componente padre sobre la actualización de rating y reviewCount
          if (onRatingUpdate) {
            onRatingUpdate(newAverageRating, response.data.total);
          }
          
          // Verificar si hay más páginas
          const totalPages = Math.ceil(response.data.total / limit);
          setHasMore(page < totalPages);
        } else {
          setError(response.message || 'Error cargando reviews');
        }
      } catch (error) {
        console.error('💥 [PropertyReviews] Error cargando reviews:', error);
        setError('Error de conexión al cargar reviews');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      loadReviews();
    }
  }, [propertyId, page]);

  // Componente helper para renderizar avatar de review con actualización reactiva
  const ReviewAvatar = ({ 
    review, 
    user, 
    avatarUpdateKey 
  }: { 
    review: Review; 
    user: any; 
    avatarUpdateKey: number;
  }) => {
    // Si es el usuario actual, usar su avatar actualizado del contexto
    const isCurrentUser = review.userId === user?.id;
    const avatarToUse = isCurrentUser && user?.avatar 
      ? getAvatarUrl(user.avatar, { bustCache: true, timestamp: avatarUpdateKey })
      : review.user.avatar 
        ? getAvatarUrl(review.user.avatar, { bustCache: false })
        : undefined;
    
    const [showFallback, setShowFallback] = useState(!avatarToUse);
    
    // Resetear fallback cuando cambia el avatar
    useEffect(() => {
      if (avatarToUse) {
        setShowFallback(false);
      }
    }, [avatarToUse, avatarUpdateKey]);
    
    return (
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
        {avatarToUse && !showFallback && (
          <img
            key={`${review.id}-${avatarUpdateKey}`}
            src={avatarToUse}
            alt={review.user.name}
            className="w-full h-full object-cover"
            onError={() => {
              // Fallback: mostrar icono si falla la carga
              setShowFallback(true);
            }}
          />
        )}
        {showFallback && (
          <User className="w-6 h-6 text-gray-400" />
        )}
      </div>
    );
  };

  // Función para formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Función para renderizar estrellas
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarHalf key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-5 h-5 text-gray-300" />
        );
      }
    }
    return stars;
  };

  // Manejar envío del formulario
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validación básica
    if (formData.rating < 1 || formData.rating > 5) {
      setFormError('La calificación debe ser entre 1 y 5');
      return;
    }
    
    // Validar comment: si está presente, debe tener entre 10 y 1000 caracteres
    // Si está vacío o solo espacios, no enviarlo (es opcional)
    const commentTrimmed = formData.comment?.trim() || '';
    if (commentTrimmed.length > 0 && commentTrimmed.length < 10) {
      setFormError('El comentario debe tener al menos 10 caracteres');
      return;
    }
    
    if (commentTrimmed.length > 1000) {
      setFormError('El comentario no puede tener más de 1000 caracteres');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Preparar datos según documentación oficial
      // IMPORTANTE: Solo enviar comment si tiene contenido real (sin espacios)
      // Si está vacío o solo espacios, NO incluirlo en el payload (según FRONTEND_REVIEWS_API copy 2.md)
      const reviewPayload: { rating: number; comment?: string } = {
        rating: formData.rating,
      };
      
      // Solo incluir comment si tiene contenido real y cumple validación
      // La documentación especifica: "Si comment está vacío o solo contiene espacios, no lo incluyas en el body"
      if (formData.comment) {
        const commentTrimmed = formData.comment.trim();
        // Solo agregar si tiene contenido real (más que solo espacios) y cumple validación
        if (commentTrimmed.length > 0 && commentTrimmed.length >= 10) {
          reviewPayload.comment = commentTrimmed;
        } else if (commentTrimmed.length > 0 && commentTrimmed.length < 10) {
          // Ya se validó antes, pero por seguridad no incluir si es muy corto
          console.warn('⚠️ [PropertyReviews] Comentario muy corto, no se incluirá en el payload');
        }
        // Si commentTrimmed.length === 0, no se agrega (cumple con la documentación)
      }
      
      console.log('📤 [PropertyReviews] Enviando review:', reviewPayload);
      console.log('📤 [PropertyReviews] Campos incluidos:', Object.keys(reviewPayload).join(', '));
      
      const response = await reviewService.createReview(propertyId, reviewPayload);
      
      if (response.success) {
        console.log('✅ [PropertyReviews] Review creada exitosamente, recargando lista...');
        
        // Recargar reviews para mostrar la nueva review
        setPage(1);
        setShowCreateForm(false);
        setFormData({ rating: 5, comment: '' });
        
        // Esperar un momento para que el backend procese (opcional, solo para asegurar)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Recargar lista de reviews
        const filters: ReviewFilters = { page: 1, limit, sort: 'newest' };
        const updatedResponse = await reviewService.getReviews(propertyId, filters);
        if (updatedResponse.success && updatedResponse.data) {
          setReviews(updatedResponse.data.reviews);
          setTotalReviews(updatedResponse.data.total);
          const newAverageRating = updatedResponse.data.averageRating || 0;
          setAverageRating(newAverageRating);
          
          // Limpiar cache de ratings para que se actualicen los previews
          clearRatingCache(propertyId);
          
          // Notificar al componente padre sobre la actualización de rating y reviewCount
          if (onRatingUpdate) {
            onRatingUpdate(newAverageRating, updatedResponse.data.total);
          }
          
          console.log('✅ [PropertyReviews] Lista de reviews actualizada');
        } else {
          console.warn('⚠️ [PropertyReviews] No se pudieron recargar las reviews, pero la review se guardó');
          // Aún así mostrar éxito porque la review se guardó
        }
      } else {
        setFormError(response.message || 'Error creando la reseña');
      }
    } catch (error) {
      console.error('💥 [PropertyReviews] Error creando review:', error);
      setFormError('Error de conexión al crear la reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estado de carga
  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6 py-8 border-t border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error && reviews.length === 0) {
    return (
      <div className="space-y-6 py-8 border-t border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900">Reseñas</h3>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8 border-t border-gray-200">
      {/* Header de reviews */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Reseñas {totalReviews > 0 && `(${totalReviews})`}
          </h3>
          {averageRating > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {renderStars(averageRating)}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-gray-600">basado en {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}</span>
            </div>
          )}
        </div>
        
        {/* Botón para crear review - solo si el usuario puede crear reviews */}
        {canCreateReview && !showCreateForm && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Escribir reseña
          </Button>
        )}
        
        {/* Mensaje si el usuario es el dueño */}
        {isOwner && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              No puedes dejar una reseña a tu propia propiedad
            </span>
          </div>
        )}
      </div>

      {/* Formulario de crear review */}
      {showCreateForm && canCreateReview && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Escribe tu reseña</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Calificación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        rating <= formData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Comentario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario (opcional, mínimo 10 caracteres)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Comparte tu experiencia..."
              />
              {formData.comment && formData.comment.length < 10 && (
                <p className="text-sm text-red-600 mt-1">
                  Mínimo 10 caracteres ({formData.comment.length}/10)
                </p>
              )}
            </div>
            
            {/* Error */}
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}
            
            {/* Botones */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Publicar reseña'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormError(null);
                  setFormData({ rating: 5, comment: '' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Mensaje cuando no hay reviews */}
      {reviews.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Aún no hay reseñas
          </p>
          <p className="text-gray-600 mb-4">
            Sé el primero en dejar una reseña para esta propiedad
          </p>
          {!authIsAuthenticated && (
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Inicia sesión para escribir una reseña
            </Button>
          )}
        </div>
      )}

      {/* Lista de reviews */}
      {reviews.length > 0 && (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar del usuario */}
                  <ReviewAvatar 
                    review={review}
                    user={user}
                    avatarUpdateKey={avatarUpdateKey}
                  />
                  
                  <div>
                    <p className="font-semibold text-gray-900">{review.user.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Estrellas */}
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              {/* Comentario */}
              {review.comment && (
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
          
          {/* Paginación */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600">
              Mostrando {reviews.length} de {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
            </div>
            
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={loading}
                >
                  Anterior
                </Button>
              )}
              
              {hasMore && (
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={loading}
                >
                  Siguiente
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyReviews;

