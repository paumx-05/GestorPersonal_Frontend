// Controlador de carteras
// Lógica de negocio y orquestación de las carteras
// Integración completa con backend MongoDB

import { carterasService } from '@/services/carteras.service'
import type { 
  CreateCarteraRequest, 
  UpdateCarteraRequest, 
  DepositarCarteraRequest,
  RetirarCarteraRequest,
  TransferirCarteraRequest,
  CarteraError,
  Cartera,
  TransaccionCartera
} from '@/models/carteras'

/**
 * Controlador de carteras
 */
export const carterasController = {
  /**
   * Obtiene todas las carteras del usuario autenticado
   */
  async getCarteras(): Promise<{ success: boolean; carteras?: any[]; error?: string }> {
    try {
      const carteras = await carterasService.getCarteras()
      return {
        success: true,
        carteras,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al obtener carteras'
      
      if (error.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        }
      }
      
      if (error.status === 0) {
        return {
          success: false,
          error: 'Error de conexión. Verifica que el servidor esté disponible.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  /**
   * Obtiene una cartera por ID
   */
  async getCarteraById(id: string): Promise<{ success: boolean; cartera?: any; error?: string }> {
    try {
      const cartera = await carterasService.getCarteraById(id)
      return {
        success: true,
        cartera,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al obtener cartera'
      
      if (error.status === 404) {
        return {
          success: false,
          error: 'Cartera no encontrada',
        }
      }
      
      if (error.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  /**
   * Crea una nueva cartera
   */
  async createCartera(data: CreateCarteraRequest): Promise<{ success: boolean; cartera?: any; error?: string }> {
    try {
      const cartera = await carterasService.createCartera(data)
      return {
        success: true,
        cartera,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al crear cartera'
      
      if (error.status === 400) {
        return {
          success: false,
          error: errorMessage,
        }
      }
      
      if (error.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  /**
   * Actualiza una cartera existente
   */
  async updateCartera(id: string, data: UpdateCarteraRequest): Promise<{ success: boolean; cartera?: any; error?: string }> {
    try {
      const cartera = await carterasService.updateCartera(id, data)
      return {
        success: true,
        cartera,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al actualizar cartera'
      
      if (error.status === 404) {
        return {
          success: false,
          error: 'Cartera no encontrada',
        }
      }
      
      if (error.status === 400) {
        return {
          success: false,
          error: errorMessage,
        }
      }
      
      if (error.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  /**
   * Elimina una cartera
   * @param id - ID de la cartera a eliminar
   * @param deleteData - Si es true, elimina todos los datos asociados. Si es false, mantiene los datos pero los desasocia (default: false)
   */
  async deleteCartera(id: string, deleteData: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      await carterasService.deleteCartera(id, deleteData)
      return {
        success: true,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al eliminar cartera'
      
      if (error.status === 404) {
        return {
          success: false,
          error: 'Cartera no encontrada',
        }
      }
      
      if (error.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  /**
   * Deposita dinero en una cartera
   */
  async depositar(id: string, data: DepositarCarteraRequest): Promise<{ 
    success: boolean; 
    cartera?: Cartera; 
    transaccion?: TransaccionCartera;
    error?: string 
  }> {
    try {
      const result = await carterasService.depositar(id, data)
      return {
        success: true,
        cartera: result.cartera,
        transaccion: result.transaccion,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al depositar en cartera'
      
      if (error.status === 404) {
        return {
          success: false,
          error: 'Cartera no encontrada',
        }
      }
      
      if (error.status === 400) {
        return {
          success: false,
          error: errorMessage,
        }
      }
      
      if (error.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  /**
   * Retira dinero de una cartera
   */
  async retirar(id: string, data: RetirarCarteraRequest): Promise<{ 
    success: boolean; 
    cartera?: Cartera; 
    transaccion?: TransaccionCartera;
    error?: string 
  }> {
    try {
      const result = await carterasService.retirar(id, data)
      return {
        success: true,
        cartera: result.cartera,
        transaccion: result.transaccion,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al retirar de cartera'
      
      if (error.status === 404) {
        return {
          success: false,
          error: 'Cartera no encontrada',
        }
      }
      
      if (error.status === 400) {
        return {
          success: false,
          error: errorMessage,
        }
      }
      
      if (error.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  /**
   * Transfiere dinero entre carteras
   */
  async transferir(data: TransferirCarteraRequest): Promise<{ 
    success: boolean; 
    carteraOrigen?: Cartera; 
    carteraDestino?: Cartera;
    transaccion?: TransaccionCartera;
    error?: string 
  }> {
    try {
      const result = await carterasService.transferir(data)
      return {
        success: true,
        carteraOrigen: result.carteraOrigen,
        carteraDestino: result.carteraDestino,
        transaccion: result.transaccion,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al transferir entre carteras'
      
      if (error.status === 404) {
        return {
          success: false,
          error: 'Una o ambas carteras no fueron encontradas',
        }
      }
      
      if (error.status === 400) {
        return {
          success: false,
          error: errorMessage,
        }
      }
      
      if (error.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  /**
   * Obtiene el historial de transacciones de una cartera
   */
  async getTransacciones(id: string): Promise<{ success: boolean; transacciones?: TransaccionCartera[]; error?: string }> {
    try {
      const transacciones = await carterasService.getTransacciones(id)
      return {
        success: true,
        transacciones,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al obtener transacciones'
      
      if (error.status === 404) {
        return {
          success: false,
          error: 'Cartera no encontrada',
        }
      }
      
      if (error.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  /**
   * Obtiene el saldo actualizado de una cartera
   */
  async getSaldo(id: string): Promise<{ 
    success: boolean; 
    saldo?: { saldo: number; saldoContable: number; diferencia: number; ultimaActualizacion: string };
    error?: string 
  }> {
    try {
      const saldo = await carterasService.getSaldo(id)
      return {
        success: true,
        saldo,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al obtener saldo'
      
      if (error.status === 404) {
        return {
          success: false,
          error: 'Cartera no encontrada',
        }
      }
      
      if (error.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },

  /**
   * Sincroniza el saldo de una cartera con gastos e ingresos
   */
  async sincronizar(id: string): Promise<{ success: boolean; cartera?: Cartera; error?: string }> {
    try {
      const cartera = await carterasService.sincronizar(id)
      return {
        success: true,
        cartera,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al sincronizar cartera'
      
      if (error.status === 404) {
        return {
          success: false,
          error: 'Cartera no encontrada',
        }
      }
      
      if (error.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  },
}

