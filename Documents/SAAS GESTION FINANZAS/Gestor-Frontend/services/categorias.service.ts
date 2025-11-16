// Servicio de categorías
// Maneja las llamadas HTTP al backend para categorías
// Integración completa con backend MongoDB

import { API_CONFIG } from '@/config/api'
import type { 
  CreateCategoriaRequest,
  UpdateCategoriaRequest,
  BackendCategoriasResponse,
  BackendCategoriaResponse,
  BackendDeleteCategoriaResponse,
  BackendError,
  CategoriaError,
  Categoria,
  TipoCategoria
} from '@/models/categorias'
import { 
  CategoriasResponseSchema,
  CategoriaResponseSchema,
  DeleteCategoriaResponseSchema,
  CreateCategoriaRequestSchema,
  UpdateCategoriaRequestSchema
} from '@/schemas/categorias.schema'
import { BackendErrorSchema } from '@/schemas/auth.schema'
import { getToken, clearTokens, decodeToken } from '@/utils/jwt'
import { z } from 'zod'

// Telemetría básica: logs de red y latencia
const logRequest = (endpoint: string, method: string, startTime: number) => {
  const duration = Date.now() - startTime
  console.log(`[CATEGORIAS API] ${method} ${endpoint} - ${duration}ms`)
}

const logError = (endpoint: string, method: string, status: number, error: string) => {
  console.error(`[CATEGORIAS API ERROR] ${method} ${endpoint} - ${status}: ${error}`)
}

/**
 * Realiza una petición HTTP al backend con manejo de errores y validación
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const token = getToken()
  const startTime = Date.now()
  
  // Log del token para depuración
  if (token) {
    try {
      const decoded = decodeToken(token)
      if (decoded) {
        console.log('[CATEGORIAS API] Token decodificado:', {
          userId: decoded.userId,
          email: decoded.email,
          exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
        })
      } else {
        console.log('[CATEGORIAS API] Token no pudo ser decodificado (puede ser mock)')
      }
    } catch (e) {
      console.log('[CATEGORIAS API] Error al decodificar token:', e)
    }
  } else {
    console.warn('[CATEGORIAS API] No hay token disponible')
  }
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  // Agregar token de autenticación si existe
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }
  
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    }
    
    // Log detallado del request (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('[CATEGORIAS API DEBUG]', {
        method: options.method || 'GET',
        url,
        headers: requestOptions.headers,
        body: options.body ? JSON.parse(options.body as string) : undefined,
      })
    }
    
    const response = await fetch(url, requestOptions)
    
    // Log de respuesta cruda
    const responseText = await response.text()
    let data: any
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('[CATEGORIAS API] Error al parsear respuesta JSON:', responseText)
      throw {
        message: 'Respuesta inválida del servidor',
        status: response.status,
      } as CategoriaError
    }
    
    // Log de request
    logRequest(endpoint, options.method || 'GET', startTime)
    
    if (!response.ok) {
      // Intentar parsear como error del backend
      const errorData = BackendErrorSchema.safeParse(data)
      
      const error: CategoriaError = {
        message: errorData.success 
          ? errorData.data.error 
          : data.error || data.message || `Error ${response.status}: ${response.statusText}`,
        status: response.status,
      }
      
      logError(endpoint, options.method || 'GET', response.status, error.message)
      
      // Si es 401, limpiar tokens automáticamente
      if (response.status === 401) {
        clearTokens()
      }
      
      throw error
    }
    
    // Validar respuesta con schema si se proporciona
    if (schema) {
      console.log('[CATEGORIAS API] Validando respuesta con schema:', data)
      const validated = schema.safeParse(data)
      if (!validated.success) {
        console.error('[CATEGORIAS VALIDATION ERROR]', {
          issues: validated.error.issues,
          data: data,
        })
        throw {
          message: `Respuesta del servidor inválida: ${validated.error.issues[0]?.message || 'Error de validación'}`,
          status: response.status,
        } as CategoriaError
      }
      console.log('[CATEGORIAS API] Validación exitosa:', validated.data)
      return validated.data
    }
    
    return data
  } catch (error: any) {
    logError(endpoint, options.method || 'GET', error.status || 0, error.message || 'Network error')
    
    // Si es error de timeout o red
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw {
        message: 'Error de conexión. Verifica que el servidor esté disponible.',
        status: 0,
      } as CategoriaError
    }
    
    throw error
  }
}

/**
 * Servicio de categorías
 */
export const categoriasService = {
  /**
   * Obtiene todas las categorías del usuario autenticado
   */
  async getAllCategorias(): Promise<Categoria[]> {
    const response = await fetchAPI<BackendCategoriasResponse>(
      API_CONFIG.ENDPOINTS.CATEGORIAS.GET_ALL,
      {
        method: 'GET',
      },
      CategoriasResponseSchema
    )
    
    console.log('[CATEGORIAS SERVICE] Respuesta del backend:', {
      cantidadCategorias: response.data?.length || 0,
      categorias: response.data,
    })
    
    return response.data || []
  },

  /**
   * Obtiene categorías filtradas por tipo
   */
  async getCategoriasByTipo(tipo: TipoCategoria): Promise<Categoria[]> {
    const response = await fetchAPI<BackendCategoriasResponse>(
      API_CONFIG.ENDPOINTS.CATEGORIAS.GET_BY_TIPO(tipo),
      {
        method: 'GET',
      },
      CategoriasResponseSchema
    )
    
    console.log('[CATEGORIAS SERVICE] Respuesta del backend (por tipo):', {
      tipo,
      cantidadCategorias: response.data?.length || 0,
      categorias: response.data,
    })
    
    return response.data || []
  },

  /**
   * Crea una nueva categoría
   */
  async createCategoria(categoriaData: CreateCategoriaRequest): Promise<Categoria> {
    // Validar request
    const validated = CreateCategoriaRequestSchema.safeParse(categoriaData)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as CategoriaError
    }
    
    console.log('[CATEGORIAS SERVICE] Creando categoría:', {
      nombre: validated.data.nombre,
      tipo: validated.data.tipo,
    })
    
    const response = await fetchAPI<BackendCategoriaResponse>(
      API_CONFIG.ENDPOINTS.CATEGORIAS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      CategoriaResponseSchema
    )
    
    console.log('[CATEGORIAS SERVICE] Categoría creada exitosamente:', {
      id: response.data._id,
      userId: response.data.userId,
      nombre: response.data.nombre
    })
    
    return response.data
  },

  /**
   * Actualiza una categoría existente
   */
  async updateCategoria(id: string, categoriaData: UpdateCategoriaRequest): Promise<Categoria> {
    // Validar request
    const validated = UpdateCategoriaRequestSchema.safeParse(categoriaData)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as CategoriaError
    }
    
    const response = await fetchAPI<BackendCategoriaResponse>(
      API_CONFIG.ENDPOINTS.CATEGORIAS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(validated.data),
      },
      CategoriaResponseSchema
    )
    
    return response.data
  },

  /**
   * Elimina una categoría
   */
  async deleteCategoria(id: string): Promise<void> {
    await fetchAPI<BackendDeleteCategoriaResponse>(
      API_CONFIG.ENDPOINTS.CATEGORIAS.DELETE(id),
      {
        method: 'DELETE',
      },
      DeleteCategoriaResponseSchema
    )
  },
}

