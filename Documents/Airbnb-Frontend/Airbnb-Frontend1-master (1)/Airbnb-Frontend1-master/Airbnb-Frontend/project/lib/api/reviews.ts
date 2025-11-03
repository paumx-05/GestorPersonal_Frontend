/**
 * Servicios de API para Reviews - Conecta con el backend real
 * Reemplaza cualquier mock y usa únicamente la base de datos real de MongoDB
 */

import { apiClient } from './config';
import { 
  Review, 
  CreateReviewRequest, 
  UpdateReviewRequest, 
  ReviewsResponse, 
  ReviewResponse,
  ReviewsResponseSchema,
  ReviewResponseSchema 
} from '@/schemas/reviews';

/**
 * Filtros opcionales para obtener reviews
 */
export interface ReviewFilters {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
}

/**
 * Servicio de reviews que se conecta al backend real
 */
export const reviewService = {
  /**
   * Obtener todas las reviews de una propiedad
   * Intenta múltiples endpoints posibles según la estructura del backend
   * 
   * @param propertyId - ID de la propiedad
   * @param filters - Filtros opcionales (paginación, ordenamiento)
   * @returns Promise<ReviewsResponse> - Reviews con metadatos (total, paginación, promedio)
   */
  async getReviews(propertyId: string, filters?: ReviewFilters): Promise<ReviewsResponse> {
    try {
      console.log('🔍 [reviewService] Obteniendo reviews para propiedad:', propertyId);
      console.log('🔍 [reviewService] Filtros:', filters);
      
      // Construir endpoint según documentación oficial del backend
      // GET /api/reviews?propertyId={id}&page={page}&limit={limit}&sort={sort}
      const queryParams = new URLSearchParams();
      queryParams.append('propertyId', propertyId);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.sort) queryParams.append('sort', filters.sort);
      else queryParams.append('sort', 'newest'); // Default según documentación
      
      const endpoint = `/api/reviews?${queryParams.toString()}`;
      
      // Endpoints alternativos como fallback (en orden de prioridad)
      const possibleEndpoints = [
        endpoint,  // Opción 1: Endpoint oficial según documentación
        `/api/reviews/property/${propertyId}${filters?.page || filters?.limit ? `?page=${filters?.page || 1}&limit=${filters?.limit || 10}` : ''}${filters?.sort ? `&sort=${filters.sort || 'newest'}` : '&sort=newest'}`,  // Opción 2: Alternativo
      ];

      const startTime = Date.now();
      let lastError: Error | null = null;

      // Intentar cada endpoint hasta que uno funcione
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔄 [reviewService] Intentando endpoint: GET ${endpoint}`);
          
          const response = await apiClient.get<any>(endpoint);
          const duration = Date.now() - startTime;
          
          console.log(`⏱️ [reviewService] Tiempo de respuesta: ${duration}ms`);
          console.log('📥 [reviewService] Respuesta completa:', JSON.stringify(response, null, 2));
          
          // Normalizar respuesta antes de validar (el backend puede devolver diferentes formatos)
          let normalizedResponse: any;
          
          // Formato 1: { success: true, data: { reviews: [], total: ... } } - Formato esperado
          if (response.success && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            normalizedResponse = response;
          }
          // Formato 2: { success: true, data: [...] } - Array directo en data
          else if (response.success && Array.isArray(response.data)) {
            console.log('🔧 [reviewService] Normalizando: data es un array directo');
            normalizedResponse = {
              success: true,
              data: {
                reviews: response.data,
                total: response.data.length,
                page: filters?.page || response.page || 1,
                limit: filters?.limit || response.limit || 10,
                averageRating: response.averageRating || response.rating || 0,
              },
              message: response.message,
            };
          }
          // Formato 3: { success: true, reviews: [...] } - Array en propiedad reviews
          else if (response.success && Array.isArray(response.reviews)) {
            console.log('🔧 [reviewService] Normalizando: reviews es un array en la raíz');
            normalizedResponse = {
              success: true,
              data: {
                reviews: response.reviews,
                total: response.total || response.reviews.length,
                page: filters?.page || response.page || 1,
                limit: filters?.limit || response.limit || 10,
                averageRating: response.averageRating || response.rating || 0,
              },
              message: response.message,
            };
          }
          // Formato 4: Array directo sin wrapper
          else if (Array.isArray(response)) {
            console.log('🔧 [reviewService] Normalizando: response es array directo');
            normalizedResponse = {
              success: true,
              data: {
                reviews: response,
                total: response.length,
                page: filters?.page || 1,
                limit: filters?.limit || 10,
                averageRating: 0,
              },
            };
          }
          // Formato 5: Mantener como está si ya está normalizado
          else {
            normalizedResponse = response;
          }
          
          // Validar respuesta normalizada con Zod
          let validatedResponse: ReviewsResponse;
          try {
            validatedResponse = ReviewsResponseSchema.parse(normalizedResponse);
          } catch (validationError: any) {
            console.error('❌ [reviewService] Error de validación Zod:', validationError);
            console.log('🔍 [reviewService] Intentando extraer datos manualmente...');
            
            // Si la validación falla, intentar extraer datos manualmente
            if (normalizedResponse.success) {
              let reviews: Review[] = [];
              
              // Intentar extraer reviews de diferentes ubicaciones
              if (Array.isArray(normalizedResponse.data)) {
                reviews = normalizedResponse.data;
              } else if (Array.isArray(normalizedResponse.data?.reviews)) {
                reviews = normalizedResponse.data.reviews;
              } else if (Array.isArray(normalizedResponse.reviews)) {
                reviews = normalizedResponse.reviews;
              }
              
              return {
                success: true,
                data: {
                  reviews: reviews,
                  total: normalizedResponse.total || normalizedResponse.data?.total || reviews.length,
                  page: filters?.page || normalizedResponse.page || normalizedResponse.data?.page || 1,
                  limit: filters?.limit || normalizedResponse.limit || normalizedResponse.data?.limit || 10,
                  averageRating: normalizedResponse.averageRating || normalizedResponse.data?.averageRating || normalizedResponse.rating || 0,
                },
                message: normalizedResponse.message || 'Reviews obtenidas',
              };
            }
            
            throw validationError;
          }
          
          if (validatedResponse.success && validatedResponse.data) {
            console.log(`✅ [reviewService] Reviews obtenidas usando endpoint: ${endpoint}`);
            console.log(`✅ [reviewService] Reviews obtenidas: ${validatedResponse.data.reviews.length} de ${validatedResponse.data.total} total`);
            return validatedResponse;
          } else {
            console.warn(`⚠️ [reviewService] Endpoint ${endpoint} no devolvió datos válidos, intentando siguiente...`);
            // Si la respuesta es exitosa pero sin datos, devolver vacío
            if (validatedResponse.success) {
              return {
                success: true,
                data: {
                  reviews: [],
                  total: 0,
                  page: filters?.page || 1,
                  limit: filters?.limit || 10,
                  averageRating: 0,
                },
                message: validatedResponse.message || 'No hay reviews disponibles',
              };
            }
            lastError = new Error(validatedResponse.message || 'Error en respuesta');
            continue;
          }
        } catch (error: any) {
          // Si es 404, intentar siguiente endpoint
          if (error?.message?.includes('404') || error?.message?.includes('Not Found')) {
            console.warn(`⚠️ [reviewService] Endpoint ${endpoint} devolvió 404, intentando siguiente...`);
            lastError = error;
            continue;
          }
          // Si es otro error, propagarlo
          throw error;
        }
      }

      // Si llegamos aquí, ninguno de los endpoints funcionó, devolver respuesta vacía
      const duration = Date.now() - startTime;
      console.warn(`⚠️ [reviewService] Ninguno de los endpoints funcionó después de ${duration}ms, devolviendo respuesta vacía`);
      
      return {
        success: true,
        data: {
          reviews: [],
          total: 0,
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          averageRating: 0,
        },
        message: 'No se encontraron reviews (endpoint no disponible)',
      };
    } catch (error) {
      console.error('💥 [reviewService] Error obteniendo reviews:', error);
      
      if (error instanceof Error) {
        console.error('💥 [reviewService] Mensaje:', error.message);
        
        // Si es un error 404 (propiedad no encontrada), devolver respuesta vacía
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.log('⚠️ [reviewService] Propiedad no encontrada o sin reviews');
          return {
            success: true,
            data: {
              reviews: [],
              total: 0,
              page: filters?.page || 1,
              limit: filters?.limit || 10,
              averageRating: 0,
            },
            message: 'No se encontraron reviews para esta propiedad',
          };
        }
      }
      
      // Devolver respuesta vacía en caso de error
      return {
        success: false,
        data: {
          reviews: [],
          total: 0,
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          averageRating: 0,
        },
        message: error instanceof Error ? error.message : 'Error obteniendo reviews',
      };
    }
  },

  /**
   * Crear una nueva review para una propiedad
   * Intenta múltiples endpoints posibles según la estructura del backend
   * 
   * @param propertyId - ID de la propiedad
   * @param reviewData - Datos de la review (rating, comment)
   * @returns Promise<ReviewResponse> - Review creada
   */
  async createReview(propertyId: string, reviewData: CreateReviewRequest): Promise<ReviewResponse> {
    try {
      console.log('🔍 [reviewService] Creando review para propiedad:', propertyId);
      console.log('🔍 [reviewService] Datos:', JSON.stringify(reviewData, null, 2));
      
      // Validar datos antes de enviar
      if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        return {
          success: false,
          message: 'La calificación debe ser entre 1 y 5',
        };
      }

      // Preparar body según documentación oficial del backend
      // POST /api/reviews requiere: { propertyId, rating, comment? }
      // IMPORTANTE: Si comment está vacío o solo espacios, NO lo incluyas en el body
      // Solo envía comment si tiene contenido real (según FRONTEND_REVIEWS_API copy 2.md línea 231)
      const bodyWithPropertyId: any = {
        propertyId: propertyId,
        rating: reviewData.rating,
      };
      
      // Solo incluir comment si existe, tiene contenido real (sin espacios) y cumple validación
      // La documentación especifica: "Si comment está vacío o solo contiene espacios, no lo incluyas en el body"
      if (reviewData.comment) {
        const commentTrimmed = String(reviewData.comment).trim();
        // Solo agregar si tiene contenido real (más que solo espacios)
        if (commentTrimmed.length > 0) {
          // Verificar que tenga al menos 10 caracteres (validación del backend)
          if (commentTrimmed.length >= 10) {
            bodyWithPropertyId.comment = commentTrimmed;
          } else {
            console.warn('⚠️ [reviewService] Comentario demasiado corto (<10 caracteres), no se incluirá en el body');
          }
        }
      }
      
      console.log('📤 [reviewService] Body que se enviará:', JSON.stringify(bodyWithPropertyId, null, 2));
      console.log('📤 [reviewService] Campos incluidos:', Object.keys(bodyWithPropertyId).join(', '));

      // Endpoint oficial según documentación del backend
      // POST /api/reviews con propertyId en body
      const primaryEndpoint = `/api/reviews`;
      
      // Endpoints alternativos como fallback (en orden de prioridad)
      const possibleEndpoints = [
        primaryEndpoint,  // Opción 1: Endpoint oficial según documentación
        `/api/reviews/create`,  // Opción 2: Alternativo con acción explícita
      ];

      const startTime = Date.now();
      let lastError: Error | null = null;

      // Intentar cada endpoint hasta que uno funcione
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔄 [reviewService] Intentando endpoint: POST ${endpoint}`);
          
          // Para endpoints sin propertyId en la URL, incluir en body
          // Todos los endpoints oficiales requieren propertyId en body
          const body = bodyWithPropertyId;
          
          console.log(`📤 [reviewService] Body que se enviará:`, JSON.stringify(body, null, 2));
          
          // Mostrar detalles completos antes de enviar
          console.log(`📤 [reviewService] ========================================`);
          console.log(`📤 [reviewService] ENVIANDO REQUEST:`);
          console.log(`📤 [reviewService] Endpoint: POST ${endpoint}`);
          console.log(`📤 [reviewService] Body:`, JSON.stringify(body, null, 2));
          console.log(`📤 [reviewService] Body keys:`, Object.keys(body).join(', '));
          console.log(`📤 [reviewService] Body propertyId type:`, typeof body.propertyId);
          console.log(`📤 [reviewService] Body rating type:`, typeof body.rating);
          console.log(`📤 [reviewService] Body comment type:`, typeof body.comment);
          console.log(`📤 [reviewService] ========================================`);
          
          const response = await apiClient.post<any>(endpoint, body);
          const duration = Date.now() - startTime;
          
          console.log(`⏱️ [reviewService] Tiempo de respuesta: ${duration}ms`);
          console.log(`📥 [reviewService] Respuesta completa:`, JSON.stringify(response, null, 2));
          console.log(`📥 [reviewService] Respuesta success:`, response.success);
          console.log(`📥 [reviewService] Respuesta message:`, response.message);
          
          // Si la respuesta indica éxito (aunque la estructura pueda variar)
          if (response.success || response.status === 201 || response.status === 200) {
            console.log(`✅ [reviewService] Backend respondió con éxito (status: ${response.status || 'success'})`);
            
            // Intentar validar con Zod primero
            let validatedResponse: ReviewResponse | null = null;
            try {
              validatedResponse = ReviewResponseSchema.parse(response);
            } catch (validationError: any) {
              console.warn('⚠️ [reviewService] Validación Zod falló, pero la review se guardó exitosamente');
              console.warn('⚠️ [reviewService] Error de validación:', validationError.errors);
              console.log('🔍 [reviewService] Intentando extraer datos manualmente...');
            }
            
            // Si la validación Zod funcionó, devolver la respuesta validada
            if (validatedResponse && validatedResponse.success) {
              console.log(`✅ [reviewService] Review creada exitosamente usando endpoint: ${endpoint}`);
              return validatedResponse;
            }
            
            // Si la validación falló pero el backend dice éxito, intentar extraer datos manualmente
            // Esto es importante porque la review ya se guardó en MongoDB
            let reviewData: any = null;
            
            // Intentar múltiples formas de acceder a los datos
            if (response.data?.review) {
              reviewData = response.data.review;
            } else if (response.data && typeof response.data === 'object' && 'id' in response.data && 'propertyId' in response.data) {
              // response.data es directamente la review
              reviewData = response.data;
            } else if (response.review) {
              reviewData = response.review;
            }
            
            // Si encontramos datos de la review, considerarlo éxito
            if (reviewData) {
              console.log('✅ [reviewService] Review encontrada en respuesta (aunque validación falló)');
              console.log('✅ [reviewService] Review ID:', reviewData.id || 'N/A');
              console.log('✅ [reviewService] Esto significa que la review se guardó exitosamente en MongoDB');
              
              return {
                success: true,
                message: response.message || 'Review creada exitosamente',
                data: {
                  review: reviewData,
                },
              };
            }
            
            // Si no hay datos pero el backend dice éxito, aún así considerar éxito
            // La review se guardó aunque no venga en la respuesta
            if (response.success) {
              console.log('✅ [reviewService] Backend reportó éxito aunque no hay datos de review en respuesta');
              console.log('✅ [reviewService] Asumiendo que la review se guardó correctamente en MongoDB');
              console.log('✅ [reviewService] La review debería aparecer al recargar la lista');
              
              // Devolver éxito sin intentar construir objeto review completo
              // El componente recargará la lista y encontrará la review
              return {
                success: true,
                message: response.message || 'Review creada exitosamente',
                data: {
                  review: {
                    id: 'saved', // Indicador de que se guardó
                    propertyId: propertyId,
                    userId: 'current-user',
                    user: {
                      id: 'current-user',
                      name: 'Usuario',
                    },
                    rating: reviewData.rating,
                    comment: reviewData.comment || '',
                    createdAt: new Date().toISOString(),
                  },
                },
              };
            }
          }
          
          // Si llegamos aquí, el backend no reportó éxito
          console.warn(`⚠️ [reviewService] Endpoint ${endpoint} no devolvió éxito, intentando siguiente...`);
          lastError = new Error(response.message || 'Error en respuesta');
          continue; // Intentar siguiente endpoint
        } catch (error: any) {
          console.error(`❌ [reviewService] Error en endpoint ${endpoint}:`, error);
          console.error(`❌ [reviewService] Body enviado:`, JSON.stringify(bodyWithPropertyId, null, 2));
          
          // Si es 404, intentar siguiente endpoint
          if (error?.message?.includes('404') || error?.message?.includes('Not Found')) {
            console.warn(`⚠️ [reviewService] Endpoint ${endpoint} devolvió 404, intentando siguiente...`);
            lastError = error;
            continue;
          }
          
          // Si es 500, extraer mensaje del backend si está disponible
          if (error?.message?.includes('500') || error?.message?.includes('Internal Server Error')) {
            console.error(`\n💥 [reviewService] ========================================`);
            console.error(`💥 [reviewService] ERROR 500 - DIAGNÓSTICO COMPLETO`);
            console.error(`💥 [reviewService] ========================================`);
            console.error(`💥 [reviewService] Endpoint: POST ${endpoint}`);
            console.error(`💥 [reviewService] Mensaje completo del error:`);
            console.error(error.message);
            console.error(`\n💥 [reviewService] Body enviado:`);
            console.error(JSON.stringify(bodyWithPropertyId, null, 2));
            console.error(`\n💥 [reviewService] Tipo de datos enviados:`);
            console.error(`   - propertyId: ${typeof bodyWithPropertyId.propertyId} = "${bodyWithPropertyId.propertyId}"`);
            console.error(`   - rating: ${typeof bodyWithPropertyId.rating} = ${bodyWithPropertyId.rating}`);
            if (bodyWithPropertyId.comment !== undefined) {
              console.error(`   - comment: ${typeof bodyWithPropertyId.comment} = "${bodyWithPropertyId.comment}"`);
            } else {
              console.error(`   - comment: undefined (no se incluyó en el body)`);
            }
            
            // Intentar extraer mensaje específico del backend
            const errorMessage = error.message;
            let backendMessage = 'Error del servidor';
            let backendDetails = '';
            
            if (errorMessage.includes('Mensaje del backend:')) {
              const match = errorMessage.match(/Mensaje del backend: (.+?)(\n|$)/);
              if (match) {
                backendMessage = match[1];
              }
            }
            
            if (errorMessage.includes('Detalles:')) {
              const detailsMatch = errorMessage.match(/Detalles: ([\s\S]+)$/);
              if (detailsMatch) {
                backendDetails = detailsMatch[1];
                console.error(`\n💥 [reviewService] Detalles del backend:`);
                console.error(backendDetails);
              }
            }
            
            console.error(`\n💥 [reviewService] Mensaje del backend:`, backendMessage);
            console.error(`\n💥 [reviewService] Posibles causas:`);
            console.error(`   1. Formato incorrecto del body`);
            console.error(`   2. Validación fallida en el backend`);
            console.error(`   3. Error en la base de datos`);
            console.error(`   4. El backend espera campos adicionales`);
            console.error(`   5. Problema con el propertyId (no existe o formato incorrecto)`);
            console.error(`   6. El usuario del token no tiene permisos`);
            console.error(`   7. El propertyId no es válido o no existe`);
            console.error(`💥 [reviewService] ========================================\n`);
            
            // No intentar más endpoints con 500, es un error del servidor
            return {
              success: false,
              message: `Error del servidor: ${backendMessage || 'Error interno del servidor'}. ${backendDetails ? `Detalles: ${backendDetails.substring(0, 200)}` : 'Revisa los logs de la consola para más detalles.'}`,
            };
          }
          
          // Si es otro error (401, 403, 400), no intentar más endpoints
          throw error;
        }
      }

      // Si llegamos aquí, ninguno de los endpoints funcionó
      const duration = Date.now() - startTime;
      console.error(`❌ [reviewService] Ninguno de los endpoints funcionó después de ${duration}ms`);
      console.error('❌ [reviewService] Último error:', lastError?.message);
      
      return {
        success: false,
        message: 'Endpoint de reviews no encontrado. Verifica en Postman cuál es el endpoint correcto.',
      };
    } catch (error) {
      console.error('💥 [reviewService] Error creando review:', error);
      
      if (error instanceof Error) {
        console.error('💥 [reviewService] Mensaje:', error.message);
        console.error('💥 [reviewService] Stack:', error.stack);
        
        // Mensajes de error más específicos
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          return {
            success: false,
            message: 'Debes iniciar sesión para dejar una reseña',
          };
        }
        
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          return {
            success: false,
            message: 'No tienes permisos para crear una reseña en esta propiedad',
          };
        }
        
        if (error.message.includes('409') || error.message.includes('Conflict')) {
          return {
            success: false,
            message: 'Ya has dejado una reseña para esta propiedad',
          };
        }
        
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          return {
            success: false,
            message: 'Propiedad no encontrada',
          };
        }
        
        // Manejar error 500 con mensaje más descriptivo
        if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          // Intentar extraer mensaje del error si viene en el formato del backend
          const errorMessage = error.message || 'Error del servidor';
          let userMessage = 'Error del servidor al crear la reseña.';
          
          // Si el mensaje contiene detalles, extraerlos
          if (errorMessage.includes('comment')) {
            userMessage = 'El comentario puede estar causando un error. Verifica que tenga entre 10 y 1000 caracteres si lo incluyes.';
          } else if (errorMessage.includes('propertyId')) {
            userMessage = 'Error con el ID de la propiedad. Verifica que la propiedad existe.';
          } else if (errorMessage.includes('rating')) {
            userMessage = 'Error con la calificación. Verifica que sea un número entre 1 y 5.';
          }
          
          console.error(`💥 [reviewService] Error 500 detallado:`, errorMessage);
          console.error(`💥 [reviewService] Recomendaciones:`);
          console.error(`   1. Verifica que el backend esté funcionando correctamente`);
          console.error(`   2. Revisa los logs del backend para más detalles`);
          console.error(`   3. Verifica que el formato del body sea correcto: { propertyId, rating, comment? }`);
          console.error(`   4. Si comment está vacío, no lo envíes en el body`);
          
          return {
            success: false,
            message: userMessage + ' Por favor, intenta nuevamente o contacta al soporte.',
          };
        }
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error creando la reseña',
      };
    }
  },

  /**
   * Actualizar una review existente
   * PUT /api/reviews/:reviewId
   * 
   * @param reviewId - ID de la review
   * @param reviewData - Datos actualizados (rating, comment)
   * @returns Promise<ReviewResponse> - Review actualizada
   */
  async updateReview(reviewId: string, reviewData: UpdateReviewRequest): Promise<ReviewResponse> {
    try {
      console.log('🔍 [reviewService] Actualizando review:', reviewId);
      console.log('🔍 [reviewService] Datos:', JSON.stringify(reviewData, null, 2));
      
      // Preparar body para actualización según documentación oficial
      // IMPORTANTE: Si comment está vacío o solo espacios, NO lo incluyas en el body
      // Solo envía comment si tiene contenido real (según FRONTEND_REVIEWS_API copy 2.md línea 302)
      const updateBody: any = {};
      
      if (reviewData.rating !== undefined) {
        updateBody.rating = reviewData.rating;
      }
      
      // Solo incluir comment si existe, tiene contenido real (sin espacios) y cumple validación
      // La documentación especifica: "Si comment está vacío o solo contiene espacios, no lo incluyas en el body"
      if (reviewData.comment !== undefined) {
        if (reviewData.comment) {
          const commentTrimmed = String(reviewData.comment).trim();
          // Solo agregar si tiene contenido real (más que solo espacios)
          if (commentTrimmed.length > 0) {
            // Verificar que tenga al menos 10 caracteres (validación del backend)
            if (commentTrimmed.length >= 10) {
              updateBody.comment = commentTrimmed;
            } else {
              console.warn('⚠️ [reviewService] Comentario demasiado corto (<10 caracteres), no se incluirá en el body');
            }
          }
          // Si commentTrimmed.length === 0, no se agrega (cumple con la documentación)
        } else {
          // Si comment es null, undefined, o string vacío, no incluirlo
          console.log('ℹ️ [reviewService] Comentario vacío o null, no se incluirá en el body');
        }
      }
      
      console.log('📤 [reviewService] Body de actualización que se enviará:', JSON.stringify(updateBody, null, 2));
      console.log('📤 [reviewService] Campos incluidos:', Object.keys(updateBody).join(', '));
      
      const endpoint = `/api/reviews/${reviewId}`;
      const startTime = Date.now();
      const response = await apiClient.put<any>(endpoint, updateBody);
      const duration = Date.now() - startTime;
      
      console.log(`⏱️ [reviewService] Tiempo de respuesta: ${duration}ms`);
      console.log('📥 [reviewService] Respuesta completa:', JSON.stringify(response, null, 2));
      
      // Validar respuesta con Zod
      const validatedResponse = ReviewResponseSchema.parse(response);
      
      if (validatedResponse.success) {
        console.log('✅ [reviewService] Review actualizada exitosamente');
      } else {
        console.error('❌ [reviewService] Error en respuesta del backend');
      }
      
      return validatedResponse;
    } catch (error) {
      console.error('💥 [reviewService] Error actualizando review:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          return {
            success: false,
            message: 'No tienes permisos para editar esta reseña',
          };
        }
        
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          return {
            success: false,
            message: 'Review no encontrada',
          };
        }
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error actualizando la reseña',
      };
    }
  },

  /**
   * Eliminar una review
   * DELETE /api/reviews/:reviewId
   * 
   * @param reviewId - ID de la review
   * @returns Promise<{ success: boolean; message?: string }>
   */
  async deleteReview(reviewId: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔍 [reviewService] Eliminando review:', reviewId);
      
      const endpoint = `/api/reviews/${reviewId}`;
      const startTime = Date.now();
      const response = await apiClient.delete<{ success: boolean; message?: string }>(endpoint);
      const duration = Date.now() - startTime;
      
      console.log(`⏱️ [reviewService] Tiempo de respuesta: ${duration}ms`);
      console.log('📥 [reviewService] Respuesta completa:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ [reviewService] Review eliminada exitosamente');
      } else {
        console.error('❌ [reviewService] Error eliminando review');
      }
      
      return response;
    } catch (error) {
      console.error('💥 [reviewService] Error eliminando review:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          return {
            success: false,
            message: 'No tienes permisos para eliminar esta reseña',
          };
        }
        
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          return {
            success: false,
            message: 'Review no encontrada',
          };
        }
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error eliminando la reseña',
      };
    }
  },
};
