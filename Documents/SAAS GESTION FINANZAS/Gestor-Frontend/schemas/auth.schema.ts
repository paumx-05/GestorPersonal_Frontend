// Esquemas Zod para validación de autenticación
// Valida requests y responses del backend

import { z } from 'zod'

// Schema para respuesta del backend (wrapper estándar)
export const BackendResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

// Schema para usuario del backend
export const BackendUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  role: z.enum(['regular', 'admin']).default('regular'),
  fechaCreacion: z.string(), // ISO date string
})

// Schema para respuesta de login/register
export const AuthResponseDataSchema = z.object({
  user: BackendUserSchema,
  token: z.string(),
})

export const AuthResponseSchema = BackendResponseSchema(AuthResponseDataSchema)

// Schema para respuesta de /me
export const MeResponseSchema = BackendResponseSchema(BackendUserSchema)

// Schema para respuesta de logout
export const LogoutResponseSchema = BackendResponseSchema(
  z.object({
    message: z.string(),
  })
)

// Schema para request de login
export const LoginRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

// Schema para request de register
export const RegisterRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
})

// Schema para error del backend
export const BackendErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string().optional(),
})

// Schema para request de forgot password
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Email inválido'),
})

// Schema para request de reset password
export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, 'Token es requerido'),
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

// Schema para respuesta de forgot password
// Nota: El backend devuelve el formato directamente, no dentro de "data"
// En desarrollo incluye resetToken y resetLink, en producción solo message
export const ForgotPasswordResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  resetToken: z.string().optional(), // Solo en desarrollo
  resetLink: z.string().optional(), // Solo en desarrollo - enlace completo con token
  note: z.string().optional(),
})

// Schema para respuesta de reset password
// Nota: El backend devuelve el formato directamente, no dentro de "data"
export const ResetPasswordResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
})

// Tipos TypeScript derivados
export type BackendUser = z.infer<typeof BackendUserSchema>
export type AuthResponseData = z.infer<typeof AuthResponseDataSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type MeResponse = z.infer<typeof MeResponseSchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
export type BackendError = z.infer<typeof BackendErrorSchema>
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>
export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponseSchema>
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>

