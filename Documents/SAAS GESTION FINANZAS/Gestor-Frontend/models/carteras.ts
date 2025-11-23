// Modelos de carteras
// Define las interfaces y tipos relacionados con carteras
// Alineados con la respuesta del backend

export interface Cartera {
  _id: string
  userId: string
  nombre: string
  descripcion?: string
  saldo: number // Balance actual de la cartera
  saldoInicial: number // Capital inicial de la cartera
  moneda: string // 'EUR', 'USD', etc.
  icono?: string // emoji o nombre de icono
  color?: string // color hex para UI
  activa: boolean // Si la cartera está activa o archivada
  createdAt: string // ISO date string
  updatedAt?: string // ISO date string
}

// Tipo de transacción de cartera
export type TipoTransaccion = 'deposito' | 'retiro' | 'transferencia' | 'ajuste' | 'gasto' | 'ingreso'

// Transacción de cartera
export interface TransaccionCartera {
  _id: string
  userId: string
  tipo: TipoTransaccion
  carteraOrigenId?: string | null // null para depósitos/ajustes
  carteraDestinoId?: string | null // null para retiros/ajustes
  monto: number
  montoOrigen?: number // para conversión de moneda
  montoDestino?: number // para conversión de moneda
  concepto: string
  fecha: string // ISO date string
  referenciaId?: string // ID del gasto/ingreso que generó esto
  metadata?: {
    gastosAfectados?: string[]
    ingresosAfectados?: string[]
  }
  createdAt: string // ISO date string
  updatedAt?: string // ISO date string
}

// Request para crear una cartera
export interface CreateCarteraRequest {
  nombre: string
  descripcion?: string
  saldoInicial?: number // Capital inicial (default: 0)
  moneda?: string // Default: 'EUR'
  icono?: string
  color?: string
}

// Request para actualizar una cartera (todos los campos opcionales)
// descripcion puede ser null para eliminar la descripción
export interface UpdateCarteraRequest {
  nombre?: string
  descripcion?: string | null
  icono?: string
  color?: string
  activa?: boolean
}

// Request para depositar en una cartera
export interface DepositarCarteraRequest {
  monto: number
  concepto: string
  fecha?: string // ISO date string, default: ahora
}

// Request para retirar de una cartera
export interface RetirarCarteraRequest {
  monto: number
  concepto: string
  fecha?: string // ISO date string, default: ahora
}

// Request para transferir entre carteras
export interface TransferirCarteraRequest {
  carteraOrigenId: string
  carteraDestinoId: string
  monto: number
  concepto: string
  fecha?: string // ISO date string, default: ahora
}

// Respuesta del backend para obtener todas las carteras
export interface BackendCarterasResponse {
  success: boolean
  data: Cartera[]
}

// Respuesta del backend para obtener una cartera
export interface BackendCarteraResponse {
  success: boolean
  data: Cartera
  message?: string
}

// Respuesta del backend para eliminar cartera
export interface BackendDeleteCarteraResponse {
  success: boolean
  message: string
}

// Respuesta del backend para operaciones de saldo
export interface BackendOperacionSaldoResponse {
  success: boolean
  data: {
    cartera: Cartera
    transaccion: TransaccionCartera
  }
  message: string
}

// Respuesta del backend para transferencias
export interface BackendTransferenciaResponse {
  success: boolean
  data: {
    carteraOrigen: Cartera
    carteraDestino: Cartera
    transaccion: TransaccionCartera
  }
  message: string
}

// Respuesta del backend para obtener transacciones
export interface BackendTransaccionesResponse {
  success: boolean
  data: TransaccionCartera[]
}

// Respuesta del backend para obtener saldo
export interface BackendSaldoResponse {
  success: boolean
  data: {
    saldo: number
    saldoContable: number
    diferencia: number
    ultimaActualizacion: string
  }
}

// Error del backend (reutilizado de auth)
export interface BackendError {
  success: false
  error: string
  message?: string
}

// Error personalizado para carteras
export interface CarteraError {
  message: string
  status?: number
}

