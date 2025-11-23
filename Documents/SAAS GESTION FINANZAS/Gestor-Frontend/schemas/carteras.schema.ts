// Esquemas Zod para validación de carteras
// Valida requests y responses del backend

import { z } from 'zod'

// Schema para respuesta del backend (wrapper estándar)
export const BackendResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

// Schema para cartera del backend
export const CarteraSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  saldo: z.number(),
  saldoInicial: z.number(),
  moneda: z.string(),
  icono: z.string().optional(),
  color: z.string().optional(),
  activa: z.boolean(),
  createdAt: z.string(), // ISO date string
  updatedAt: z.string().optional(), // ISO date string
})

// Schema para transacción de cartera
export const TransaccionCarteraSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  tipo: z.enum(['deposito', 'retiro', 'transferencia', 'ajuste', 'gasto', 'ingreso']),
  carteraOrigenId: z.string().nullable().optional(),
  carteraDestinoId: z.string().nullable().optional(),
  monto: z.number(),
  montoOrigen: z.number().optional(),
  montoDestino: z.number().optional(),
  concepto: z.string(),
  fecha: z.string(),
  referenciaId: z.string().optional(),
  metadata: z.object({
    gastosAfectados: z.array(z.string()).optional(),
    ingresosAfectados: z.array(z.string()).optional(),
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

// Schema para request de crear cartera
export const CreateCarteraRequestSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  saldoInicial: z.number().min(0, 'El saldo inicial no puede ser negativo').optional(),
  moneda: z.string().default('EUR').optional(),
  icono: z.string().optional(),
  color: z.string().optional(),
})

// Schema para request de actualizar cartera (todos opcionales)
// descripcion puede ser null para eliminar la descripción
export const UpdateCarteraRequestSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().max(500).nullable().optional(),
  icono: z.string().optional(),
  color: z.string().optional(),
  activa: z.boolean().optional(),
})

// Schema para request de depositar
export const DepositarCarteraRequestSchema = z.object({
  monto: z.number().positive('El monto debe ser positivo'),
  concepto: z.string().min(1, 'El concepto es requerido').max(200),
  fecha: z.string().optional(),
})

// Schema para request de retirar
export const RetirarCarteraRequestSchema = z.object({
  monto: z.number().positive('El monto debe ser positivo'),
  concepto: z.string().min(1, 'El concepto es requerido').max(200),
  fecha: z.string().optional(),
})

// Schema para request de transferir
export const TransferirCarteraRequestSchema = z.object({
  carteraOrigenId: z.string().min(1, 'La cartera origen es requerida'),
  carteraDestinoId: z.string().min(1, 'La cartera destino es requerida'),
  monto: z.number().positive('El monto debe ser positivo'),
  concepto: z.string().min(1, 'El concepto es requerido').max(200),
  fecha: z.string().optional(),
})

// Schema para respuesta de obtener todas las carteras
export const CarterasResponseSchema = BackendResponseSchema(z.array(CarteraSchema))

// Schema para respuesta de obtener/crear/actualizar una cartera
export const CarteraResponseSchema = BackendResponseSchema(CarteraSchema)

// Schema para respuesta de eliminar cartera
export const DeleteCarteraResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

// Schema para respuesta de operación de saldo (depositar/retirar)
export const OperacionSaldoResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    cartera: CarteraSchema,
    transaccion: TransaccionCarteraSchema,
  }),
  message: z.string(),
})

// Schema para respuesta de transferencia
export const TransferenciaResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    carteraOrigen: CarteraSchema,
    carteraDestino: CarteraSchema,
    transaccion: TransaccionCarteraSchema,
  }),
  message: z.string(),
})

// Schema para respuesta de obtener transacciones
export const TransaccionesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(TransaccionCarteraSchema),
})

// Schema para respuesta de obtener saldo
export const SaldoResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    saldo: z.number(),
    saldoContable: z.number(),
    diferencia: z.number(),
    ultimaActualizacion: z.string(),
  }),
})

