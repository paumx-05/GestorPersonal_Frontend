// Servicio de presupuestos
// Maneja las llamadas HTTP al backend para presupuestos
// Integración completa con backend MongoDB

import { API_CONFIG } from '@/config/api'
import type { 
  CreatePresupuestoRequest,
  UpdatePresupuestoRequest,
  BackendPresupuestosResponse,
  BackendPresupuestoResponse,
  BackendTotalPresupuestoResponse,
  BackendResumenPresupuestosResponse,
  BackendDeletePresupuestoResponse,
  BackendError,
  PresupuestoError,
  Presupuesto,
  MesValido,
  ResumenPresupuestos
} from '@/models/presupuestos'
import { 
  PresupuestosResponseSchema,
  PresupuestoResponseSchema,
  TotalPresupuestoResponseSchema,
  ResumenPresupuestosResponseSchema,
  DeletePresupuestoResponseSchema,
  CreatePresupuestoRequestSchema,
  UpdatePresupuestoRequestSchema
} from '@/schemas/presupuestos.schema'
import { BackendErrorSchema } from '@/schemas/auth.schema'
import { getToken, clearTokens, decodeToken } from '@/utils/jwt'
import { z } from 'zod'

// Telemetría básica: logs de red y latencia
const logRequest = (endpoint: string, method: string, startTime: number) => {
  const duration = Date.now() - startTime
  console.log(`[PRESUPUESTOS API] ${method} ${endpoint} - ${duration}ms`)
}

const logError = (endpoint: string, method: string, status: number, error: string) => {
  console.error(`[PRESUPUESTOS API ERROR] ${method} ${endpoint} - ${status}: ${error}`)
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
        console.log('[PRESUPUESTOS API] Token decodificado:', {
          userId: decoded.userId,
          email: decoded.email,
          exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
        })
      } else {
        console.log('[PRESUPUESTOS API] Token no pudo ser decodificado (puede ser mock)')
      }
    } catch (e) {
      console.log('[PRESUPUESTOS API] Error al decodificar token:', e)
    }
  } else {
    console.warn('[PRESUPUESTOS API] No hay token disponible')
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
    if (process.env.NODE_ENV === 'development' || true) {
      console.log('[PRESUPUESTOS API DEBUG]', {
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
      console.error('[PRESUPUESTOS API] Error al parsear respuesta JSON:', responseText)
      throw {
        message: 'Respuesta inválida del servidor',
        status: response.status,
      } as PresupuestoError
    }
    
    // Log de request
    logRequest(endpoint, options.method || 'GET', startTime)
    
    if (!response.ok) {
      // Intentar parsear como error del backend
      const errorData = BackendErrorSchema.safeParse(data)
      
      const error: PresupuestoError = {
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
      console.log('[PRESUPUESTOS API] Validando respuesta con schema:', data)
      const validated = schema.safeParse(data)
      if (!validated.success) {
        console.error('[PRESUPUESTOS VALIDATION ERROR]', {
          issues: validated.error.issues,
          data: data,
        })
        throw {
          message: `Respuesta del servidor inválida: ${validated.error.issues[0]?.message || 'Error de validación'}`,
          status: response.status,
        } as PresupuestoError
      }
      console.log('[PRESUPUESTOS API] Validación exitosa:', validated.data)
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
      } as PresupuestoError
    }
    
    throw error
  }
}

/**
 * Servicio de presupuestos
 */
export const presupuestosService = {
  /**
   * Obtiene todos los presupuestos de un mes específico
   */
  async getPresupuestosByMes(mes: MesValido): Promise<Presupuesto[]> {
    const response = await fetchAPI<BackendPresupuestosResponse>(
      API_CONFIG.ENDPOINTS.PRESUPUESTOS.GET_BY_MES(mes),
      {
        method: 'GET',
      },
      PresupuestosResponseSchema
    )
    
    // Log para depuración
    console.log('[PRESUPUESTOS SERVICE] Respuesta del backend:', {
      mes,
      cantidadPresupuestos: response.data?.length || 0,
      presupuestos: response.data,
    })
    
    return response.data || []
  },

  /**
   * Crea o actualiza un presupuesto (upsert)
   * Si ya existe un presupuesto para ese mes y categoría, se actualiza
   */
  async createOrUpdatePresupuesto(presupuestoData: CreatePresupuestoRequest): Promise<Presupuesto> {
    // Validar request
    const validated = CreatePresupuestoRequestSchema.safeParse(presupuestoData)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as PresupuestoError
    }
    
    const response = await fetchAPI<BackendPresupuestoResponse>(
      API_CONFIG.ENDPOINTS.PRESUPUESTOS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      PresupuestoResponseSchema
    )
    
    console.log('[PRESUPUESTOS SERVICE] Presupuesto creado/actualizado exitosamente:', {
      id: response.data._id,
      userId: response.data.userId,
      mes: response.data.mes,
      categoria: response.data.categoria
    })
    
    return response.data
  },

  /**
   * Actualiza un presupuesto existente por ID
   */
  async updatePresupuesto(id: string, presupuestoData: UpdatePresupuestoRequest): Promise<Presupuesto> {
    // Validar request
    const validated = UpdatePresupuestoRequestSchema.safeParse(presupuestoData)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as PresupuestoError
    }
    
    const response = await fetchAPI<BackendPresupuestoResponse>(
      API_CONFIG.ENDPOINTS.PRESUPUESTOS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(validated.data),
      },
      PresupuestoResponseSchema
    )
    
    console.log('[PRESUPUESTOS SERVICE] Presupuesto actualizado exitosamente:', {
      id: response.data._id,
      mes: response.data.mes,
      categoria: response.data.categoria
    })
    
    return response.data
  },

  /**
   * Elimina un presupuesto por mes y categoría
   */
  async deletePresupuesto(mes: MesValido, categoria: string): Promise<void> {
    const response = await fetchAPI<BackendDeletePresupuestoResponse>(
      API_CONFIG.ENDPOINTS.PRESUPUESTOS.DELETE(mes, categoria),
      {
        method: 'DELETE',
      },
      DeletePresupuestoResponseSchema
    )
    
    console.log('[PRESUPUESTOS SERVICE] Presupuesto eliminado exitosamente:', {
      mes,
      categoria,
      message: response.message
    })
  },

  /**
   * Obtiene el total presupuestado de un mes
   */
  async getTotalByMes(mes: MesValido): Promise<number> {
    const response = await fetchAPI<BackendTotalPresupuestoResponse>(
      API_CONFIG.ENDPOINTS.PRESUPUESTOS.GET_TOTAL(mes),
      {
        method: 'GET',
      },
      TotalPresupuestoResponseSchema
    )
    
    console.log('[PRESUPUESTOS SERVICE] Total presupuestado:', {
      mes,
      total: response.data.total
    })
    
    return response.data.total
  },

  /**
   * Obtiene el resumen completo de presupuestos de un mes
   */
  async getResumenByMes(mes: MesValido): Promise<ResumenPresupuestos> {
    const response = await fetchAPI<BackendResumenPresupuestosResponse>(
      API_CONFIG.ENDPOINTS.PRESUPUESTOS.GET_RESUMEN(mes),
      {
        method: 'GET',
      },
      ResumenPresupuestosResponseSchema
    )
    
    console.log('[PRESUPUESTOS SERVICE] Resumen obtenido:', {
      mes,
      totalIngresos: response.data.totalIngresos,
      totalPresupuestado: response.data.totalPresupuestado,
      ahorro: response.data.ahorro
    })
    
    return response.data
  },
}

