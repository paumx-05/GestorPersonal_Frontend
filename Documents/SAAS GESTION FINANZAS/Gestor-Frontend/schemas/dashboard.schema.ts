// Esquemas Zod para validación de dashboard
// Valida requests y responses del backend según dashboard-integracion.md

import { z } from 'zod'

// Schema para respuesta del backend (wrapper estándar)
export const BackendResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

// Schema para resumen del mes actual
export const ResumenMesActualSchema = z.object({
  mes: z.string(),
  ingresos: z.number().min(0),
  gastos: z.number().min(0),
  balance: z.number(),
  porcentajeGastado: z.number().min(0).max(100),
})

// Schema para gasto reciente
export const GastoRecienteSchema = z.object({
  _id: z.string(),
  descripcion: z.string(),
  monto: z.number().positive(),
  categoria: z.string(),
  fecha: z.string(), // ISO date string
  mes: z.string(),
})

// Schema para gasto por categoría
export const GastoPorCategoriaSchema = z.object({
  categoria: z.string(),
  monto: z.number().min(0),
  porcentaje: z.number().min(0).max(100),
})

// Schema para cambio financiero
export const CambioFinancieroSchema = z.object({
  valor: z.number(),
  porcentaje: z.number(),
  tipo: z.enum(['aumento', 'disminucion']),
})

// Schema para datos mensuales
export const DatosMensualesSchema = z.object({
  ingresos: z.number().min(0),
  gastos: z.number().min(0),
  balance: z.number(),
})

// Schema para comparativa mensual
export const ComparativaMensualSchema = z.object({
  mesActual: DatosMensualesSchema,
  mesAnterior: DatosMensualesSchema,
  cambios: z.object({
    ingresos: CambioFinancieroSchema,
    gastos: CambioFinancieroSchema,
    balance: CambioFinancieroSchema,
  }),
})

// Schema para tipo de alerta
export const TipoAlertaSchema = z.enum(['info', 'success', 'warning', 'error'])

// Schema para alerta financiera
export const AlertaFinancieraSchema = z.object({
  tipo: TipoAlertaSchema,
  titulo: z.string(),
  mensaje: z.string(),
})

// Schemas de respuesta del backend
export const ResumenResponseSchema = BackendResponseSchema(ResumenMesActualSchema)

export const GastosRecientesResponseSchema = BackendResponseSchema(
  z.array(GastoRecienteSchema)
)

export const GastosPorCategoriaResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(GastoPorCategoriaSchema),
  total: z.number().min(0),
})

export const ComparativaResponseSchema = BackendResponseSchema(ComparativaMensualSchema)

export const AlertasResponseSchema = BackendResponseSchema(
  z.array(AlertaFinancieraSchema)
)

