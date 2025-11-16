// Modelos de dashboard
// Define las interfaces y tipos relacionados con el dashboard
// Alineados con la respuesta del backend según dashboard-integracion.md

// Resumen del mes actual
export interface ResumenMesActual {
  mes: string
  ingresos: number
  gastos: number
  balance: number
  porcentajeGastado: number
}

// Gasto reciente
export interface GastoReciente {
  _id: string
  descripcion: string
  monto: number
  categoria: string
  fecha: string // ISO date string
  mes: string
}

// Gasto por categoría (Top 3)
export interface GastoPorCategoria {
  categoria: string
  monto: number
  porcentaje: number
}

// Respuesta de gastos por categoría
export interface GastosPorCategoriaResponse {
  data: GastoPorCategoria[]
  total: number
}

// Cambio financiero (para comparativa)
export interface CambioFinanciero {
  valor: number
  porcentaje: number
  tipo: 'aumento' | 'disminucion'
}

// Datos mensuales
export interface DatosMensuales {
  ingresos: number
  gastos: number
  balance: number
}

// Comparativa mensual
export interface ComparativaMensual {
  mesActual: DatosMensuales
  mesAnterior: DatosMensuales
  cambios: {
    ingresos: CambioFinanciero
    gastos: CambioFinanciero
    balance: CambioFinanciero
  }
}

// Tipo de alerta
export type TipoAlerta = 'info' | 'success' | 'warning' | 'error'

// Alerta financiera
export interface AlertaFinanciera {
  tipo: TipoAlerta
  titulo: string
  mensaje: string
}

// Respuestas del backend
export interface BackendResumenResponse {
  success: boolean
  data: ResumenMesActual
}

export interface BackendGastosRecientesResponse {
  success: boolean
  data: GastoReciente[]
}

export interface BackendGastosPorCategoriaResponse {
  success: boolean
  data: GastoPorCategoria[]
  total: number
}

export interface BackendComparativaResponse {
  success: boolean
  data: ComparativaMensual
}

export interface BackendAlertasResponse {
  success: boolean
  data: AlertaFinanciera[]
}

// Errores
export interface DashboardError {
  error: string
  status?: number
}

