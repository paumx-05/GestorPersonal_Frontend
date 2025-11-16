// Esquemas Zod para validación de categorías
// Valida requests y responses del backend

import { z } from 'zod'

// Schema para respuesta del backend (wrapper estándar)
export const BackendResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

// Schema para tipo de categoría (valores permitidos)
export const TipoCategoriaSchema = z.enum(['gastos', 'ingresos', 'ambos'], {
  errorMap: () => ({ message: 'El tipo debe ser: gastos, ingresos o ambos' })
})

// Schema para categoría del backend
export const CategoriaSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipo: TipoCategoriaSchema,
  createdAt: z.string(), // ISO date string
})

// Schema para request de crear categoría
export const CreateCategoriaRequestSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').trim(),
  tipo: TipoCategoriaSchema,
})

// Schema para request de actualizar categoría (todos opcionales)
export const UpdateCategoriaRequestSchema = z.object({
  nombre: z.string().min(1).trim().optional(),
  tipo: TipoCategoriaSchema.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Debe proporcionar al menos un campo para actualizar' }
)

// Schema para respuesta de obtener todas las categorías
export const CategoriasResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CategoriaSchema),
})

// Schema para respuesta de crear/actualizar categoría
export const CategoriaResponseSchema = BackendResponseSchema(CategoriaSchema)

// Schema para respuesta de eliminar categoría
export const DeleteCategoriaResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

// Tipos TypeScript derivados
export type TipoCategoria = z.infer<typeof TipoCategoriaSchema>
export type Categoria = z.infer<typeof CategoriaSchema>
export type CreateCategoriaRequest = z.infer<typeof CreateCategoriaRequestSchema>
export type UpdateCategoriaRequest = z.infer<typeof UpdateCategoriaRequestSchema>
export type CategoriasResponse = z.infer<typeof CategoriasResponseSchema>
export type CategoriaResponse = z.infer<typeof CategoriaResponseSchema>
export type DeleteCategoriaResponse = z.infer<typeof DeleteCategoriaResponseSchema>

