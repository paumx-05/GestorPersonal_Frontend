// Modelos de presupuestos
// Define las interfaces y tipos relacionados con presupuestos
// Alineados con la respuesta del backend

// Tipo para meses válidos en español
export type MesValido = 
  | 'enero' 
  | 'febrero' 
  | 'marzo' 
  | 'abril' 
  | 'mayo' 
  | 'junio' 
  | 'julio' 
  | 'agosto' 
  | 'septiembre' 
  | 'octubre' 
  | 'noviembre' 
  | 'diciembre'

// Presupuesto del backend
export interface Presupuesto {
  _id: string
  userId: string
  mes: MesValido
  categoria: string
  monto: number
  porcentaje?: number
  totalIngresos: number
  createdAt: string // ISO date string
}

// Request para crear o actualizar presupuesto (upsert)
export interface CreatePresupuestoRequest {
  mes: MesValido
  categoria: string
  monto?: number
  porcentaje?: number
  totalIngresos: number
}

// Request para actualizar presupuesto existente (todos los campos opcionales)
export interface UpdatePresupuestoRequest {
  monto?: number
  porcentaje?: number
  totalIngresos?: number
}

// Respuesta del backend para obtener presupuestos del mes
export interface BackendPresupuestosResponse {
  success: boolean
  data: Presupuesto[]
}

// Respuesta del backend para crear/actualizar presupuesto
export interface BackendPresupuestoResponse {
  success: boolean
  data: Presupuesto
  message?: string
}

// Respuesta del backend para eliminar presupuesto
export interface BackendDeletePresupuestoResponse {
  success: boolean
  message: string
}

// Respuesta del backend para total presupuestado
export interface BackendTotalPresupuestoResponse {
  success: boolean
  data: {
    mes: MesValido
    total: number
  }
}

// Respuesta del backend para resumen de presupuestos
export interface PresupuestoResumen {
  categoria: string
  monto: number
  porcentaje: number
}

export interface ResumenPresupuestos {
  mes: MesValido
  totalIngresos: number
  totalPresupuestado: number
  ahorro: number
  porcentajePresupuestado: number
  presupuestos: PresupuestoResumen[]
}

export interface BackendResumenPresupuestosResponse {
  success: boolean
  data: ResumenPresupuestos
}

// Error del backend (reutilizado de auth)
export interface BackendError {
  success: false
  error: string
  message?: string
}

// Error personalizado para presupuestos
export interface PresupuestoError {
  message: string
  status?: number
}

