// Esquemas Zod para validación de presupuestos
// Valida requests y responses del backend

import { z } from 'zod'

// Schema para respuesta del backend (wrapper estándar)
export const BackendResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

// Schema para mes válido (valores permitidos)
export const MesValidoSchema = z.enum([
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
], {
  errorMap: () => ({ message: 'El mes debe ser uno de los 12 meses válidos en español' })
})

// Schema para presupuesto del backend
export const PresupuestoSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  mes: MesValidoSchema,
  categoria: z.string().min(1, 'La categoría es requerida'),
  monto: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  porcentaje: z.number().min(0).max(100).optional(),
  totalIngresos: z.number().min(0, 'El total de ingresos debe ser mayor o igual a 0'),
  createdAt: z.string(), // ISO date string
})

// Schema para request de crear/actualizar presupuesto (upsert)
export const CreatePresupuestoRequestSchema = z.object({
  mes: MesValidoSchema,
  categoria: z.string().min(1, 'La categoría es requerida').trim(),
  monto: z.number().min(0).optional(),
  porcentaje: z.number().min(0).max(100).optional(),
  totalIngresos: z.number().min(0.01, 'El total de ingresos debe ser mayor a 0'),
}).refine(
  (data) => data.monto !== undefined || data.porcentaje !== undefined,
  { message: 'Debe proporcionar al menos monto o porcentaje' }
)

// Schema para request de actualizar presupuesto (todos opcionales)
export const UpdatePresupuestoRequestSchema = z.object({
  monto: z.number().min(0).optional(),
  porcentaje: z.number().min(0).max(100).optional(),
  totalIngresos: z.number().min(0.01).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Debe proporcionar al menos un campo para actualizar' }
)

// Schema para respuesta de obtener presupuestos del mes
export const PresupuestosResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PresupuestoSchema),
})

// Schema para respuesta de crear/actualizar presupuesto
export const PresupuestoResponseSchema = BackendResponseSchema(PresupuestoSchema)

// Schema para respuesta de eliminar presupuesto
export const DeletePresupuestoResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

// Schema para respuesta de total presupuestado
export const TotalPresupuestoResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    mes: MesValidoSchema,
    total: z.number().min(0),
  }),
})

// Schema para presupuesto resumen
export const PresupuestoResumenSchema = z.object({
  categoria: z.string(),
  monto: z.number(),
  porcentaje: z.number(),
})

// Schema para resumen completo
export const ResumenPresupuestosSchema = z.object({
  mes: MesValidoSchema,
  totalIngresos: z.number(),
  totalPresupuestado: z.number(),
  ahorro: z.number(),
  porcentajePresupuestado: z.number(),
  presupuestos: z.array(PresupuestoResumenSchema),
})

// Schema para respuesta de resumen
export const ResumenPresupuestosResponseSchema = z.object({
  success: z.boolean(),
  data: ResumenPresupuestosSchema,
})

// Tipos TypeScript derivados
export type MesValido = z.infer<typeof MesValidoSchema>
export type Presupuesto = z.infer<typeof PresupuestoSchema>
export type CreatePresupuestoRequest = z.infer<typeof CreatePresupuestoRequestSchema>
export type UpdatePresupuestoRequest = z.infer<typeof UpdatePresupuestoRequestSchema>
export type PresupuestosResponse = z.infer<typeof PresupuestosResponseSchema>
export type PresupuestoResponse = z.infer<typeof PresupuestoResponseSchema>
export type DeletePresupuestoResponse = z.infer<typeof DeletePresupuestoResponseSchema>
export type TotalPresupuestoResponse = z.infer<typeof TotalPresupuestoResponseSchema>
export type ResumenPresupuestos = z.infer<typeof ResumenPresupuestosSchema>
export type PresupuestoResumen = z.infer<typeof PresupuestoResumenSchema>
export type ResumenPresupuestosResponse = z.infer<typeof ResumenPresupuestosResponseSchema>

