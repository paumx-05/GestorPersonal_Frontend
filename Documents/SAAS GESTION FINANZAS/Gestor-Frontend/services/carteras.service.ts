// Servicio de carteras
// Maneja las llamadas HTTP al backend para carteras
// Integración completa con backend MongoDB

import { API_CONFIG } from '@/config/api'
import type { 
  CreateCarteraRequest,
  UpdateCarteraRequest,
  BackendCarterasResponse,
  BackendCarteraResponse,
  BackendDeleteCarteraResponse,
  BackendOperacionSaldoResponse,
  BackendTransferenciaResponse,
  BackendTransaccionesResponse,
  BackendSaldoResponse,
  BackendError,
  CarteraError,
  Cartera,
  TransaccionCartera,
  DepositarCarteraRequest,
  RetirarCarteraRequest,
  TransferirCarteraRequest
} from '@/models/carteras'
import { 
  CarterasResponseSchema,
  CarteraResponseSchema,
  DeleteCarteraResponseSchema,
  CreateCarteraRequestSchema,
  UpdateCarteraRequestSchema,
  DepositarCarteraRequestSchema,
  RetirarCarteraRequestSchema,
  TransferirCarteraRequestSchema,
  OperacionSaldoResponseSchema,
  TransferenciaResponseSchema,
  TransaccionesResponseSchema,
  SaldoResponseSchema
} from '@/schemas/carteras.schema'
import { BackendErrorSchema } from '@/schemas/auth.schema'
import { getToken, clearTokens, decodeToken } from '@/utils/jwt'
import { z } from 'zod'

// Telemetría básica: logs de red y latencia
const logRequest = (endpoint: string, method: string, startTime: number) => {
  const duration = Date.now() - startTime
  console.log(`[CARTERAS API] ${method} ${endpoint} - ${duration}ms`)
}

const logError = (endpoint: string, method: string, status: number, error: string) => {
  console.error(`[CARTERAS API ERROR] ${method} ${endpoint} - ${status}: ${error}`)
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
        console.log('[CARTERAS API] Token decodificado:', {
          userId: decoded.userId,
          email: decoded.email,
          exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
        })
      } else {
        console.log('[CARTERAS API] Token no pudo ser decodificado')
      }
    } catch (e) {
      console.log('[CARTERAS API] Error al decodificar token:', e)
    }
  } else {
    console.warn('[CARTERAS API] No hay token disponible')
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
      console.log('[CARTERAS API DEBUG]', {
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
      console.error('[CARTERAS API] Error al parsear respuesta JSON:', responseText)
      throw {
        message: 'Respuesta inválida del servidor',
        status: response.status,
      } as CarteraError
    }
    
    // Log de request
    logRequest(endpoint, options.method || 'GET', startTime)
    
    if (!response.ok) {
      // Intentar parsear como error del backend
      const errorData = BackendErrorSchema.safeParse(data)
      
      const error: CarteraError = {
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
      console.log('[CARTERAS API] Validando respuesta con schema:', data)
      const validated = schema.safeParse(data)
      if (!validated.success) {
        console.error('[CARTERAS VALIDATION ERROR]', {
          issues: validated.error.issues,
          data: data,
        })
        throw {
          message: `Respuesta del servidor inválida: ${validated.error.issues[0]?.message || 'Error de validación'}`,
          status: response.status,
        } as CarteraError
      }
      console.log('[CARTERAS API] Validación exitosa:', validated.data)
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
      } as CarteraError
    }
    
    throw error
  }
}

/**
 * Servicio de carteras
 */
export const carterasService = {
  /**
   * Obtiene todas las carteras del usuario autenticado
   */
  async getCarteras(): Promise<Cartera[]> {
    const response = await fetchAPI<BackendCarterasResponse>(
      API_CONFIG.ENDPOINTS.CARTERAS.GET_ALL,
      {
        method: 'GET',
      },
      CarterasResponseSchema
    )
    
    // Log para depuración
    console.log('[CARTERAS SERVICE] Respuesta del backend:', {
      cantidadCarteras: response.data?.length || 0,
      carteras: response.data,
    })
    
    return response.data || []
  },

  /**
   * Obtiene una cartera por ID
   */
  async getCarteraById(id: string): Promise<Cartera> {
    const response = await fetchAPI<BackendCarteraResponse>(
      API_CONFIG.ENDPOINTS.CARTERAS.GET_BY_ID(id),
      {
        method: 'GET',
      },
      CarteraResponseSchema
    )
    
    return response.data
  },

  /**
   * Crea una nueva cartera
   */
  async createCartera(carteraData: CreateCarteraRequest): Promise<Cartera> {
    // Validar request
    const validated = CreateCarteraRequestSchema.safeParse(carteraData)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as CarteraError
    }
    
    console.log('[CARTERAS SERVICE] Creando cartera:', {
      nombre: validated.data.nombre,
      descripcion: validated.data.descripcion,
    })
    
    const response = await fetchAPI<BackendCarteraResponse>(
      API_CONFIG.ENDPOINTS.CARTERAS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      CarteraResponseSchema
    )
    
    console.log('[CARTERAS SERVICE] Cartera creada exitosamente:', {
      id: response.data._id,
      userId: response.data.userId,
      nombre: response.data.nombre
    })
    
    return response.data
  },

  /**
   * Actualiza una cartera existente
   */
  async updateCartera(id: string, carteraData: UpdateCarteraRequest): Promise<Cartera> {
    // Validar request
    const validated = UpdateCarteraRequestSchema.safeParse(carteraData)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as CarteraError
    }
    
    const response = await fetchAPI<BackendCarteraResponse>(
      API_CONFIG.ENDPOINTS.CARTERAS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(validated.data),
      },
      CarteraResponseSchema
    )
    
    return response.data
  },

  /**
   * Elimina una cartera
   * @param id - ID de la cartera a eliminar
   * @param deleteData - Si es true, elimina todos los datos asociados (gastos, ingresos, presupuestos). Si es false, mantiene los datos pero los desasocia (default: false)
   */
  async deleteCartera(id: string, deleteData: boolean = false): Promise<void> {
    await fetchAPI<BackendDeleteCarteraResponse>(
      API_CONFIG.ENDPOINTS.CARTERAS.DELETE(id, deleteData),
      {
        method: 'DELETE',
      },
      DeleteCarteraResponseSchema
    )
  },

  /**
   * Deposita dinero en una cartera
   * @param id - ID de la cartera
   * @param data - Datos del depósito (monto, concepto, fecha)
   */
  async depositar(id: string, data: DepositarCarteraRequest): Promise<{ cartera: Cartera; transaccion: TransaccionCartera }> {
    // Validar request
    const validated = DepositarCarteraRequestSchema.safeParse(data)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as CarteraError
    }

    const response = await fetchAPI<BackendOperacionSaldoResponse>(
      API_CONFIG.ENDPOINTS.CARTERAS.DEPOSITAR(id),
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      OperacionSaldoResponseSchema
    )

    return response.data
  },

  /**
   * Retira dinero de una cartera
   * @param id - ID de la cartera
   * @param data - Datos del retiro (monto, concepto, fecha)
   */
  async retirar(id: string, data: RetirarCarteraRequest): Promise<{ cartera: Cartera; transaccion: TransaccionCartera }> {
    // Validar request
    const validated = RetirarCarteraRequestSchema.safeParse(data)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as CarteraError
    }

    const response = await fetchAPI<BackendOperacionSaldoResponse>(
      API_CONFIG.ENDPOINTS.CARTERAS.RETIRAR(id),
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      OperacionSaldoResponseSchema
    )

    return response.data
  },

  /**
   * Transfiere dinero entre carteras
   * @param data - Datos de la transferencia (origen, destino, monto, concepto, fecha)
   */
  async transferir(data: TransferirCarteraRequest): Promise<{ carteraOrigen: Cartera; carteraDestino: Cartera; transaccion: TransaccionCartera }> {
    // Validar request
    const validated = TransferirCarteraRequestSchema.safeParse(data)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as CarteraError
    }

    const response = await fetchAPI<BackendTransferenciaResponse>(
      API_CONFIG.ENDPOINTS.CARTERAS.TRANSFERIR,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      TransferenciaResponseSchema
    )

    return response.data
  },

  /**
   * Obtiene el historial de transacciones de una cartera
   * @param id - ID de la cartera
   */
  async getTransacciones(id: string): Promise<TransaccionCartera[]> {
    const response = await fetchAPI<BackendTransaccionesResponse>(
      API_CONFIG.ENDPOINTS.CARTERAS.GET_TRANSACCIONES(id),
      {
        method: 'GET',
      },
      TransaccionesResponseSchema
    )

    return response.data || []
  },

  /**
   * Obtiene el saldo actualizado de una cartera
   * @param id - ID de la cartera
   */
  async getSaldo(id: string): Promise<{ saldo: number; saldoContable: number; diferencia: number; ultimaActualizacion: string }> {
    const response = await fetchAPI<BackendSaldoResponse>(
      API_CONFIG.ENDPOINTS.CARTERAS.GET_SALDO(id),
      {
        method: 'GET',
      },
      SaldoResponseSchema
    )

    return response.data
  },

  /**
   * Sincroniza el saldo de una cartera con los gastos e ingresos registrados
   * @param id - ID de la cartera
   */
  async sincronizar(id: string): Promise<Cartera> {
    const response = await fetchAPI<BackendCarteraResponse>(
      API_CONFIG.ENDPOINTS.CARTERAS.SINCRONIZAR(id),
      {
        method: 'POST',
      },
      CarteraResponseSchema
    )

    return response.data
  },
}

