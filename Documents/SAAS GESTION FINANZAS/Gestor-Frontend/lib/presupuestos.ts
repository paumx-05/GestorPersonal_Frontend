// Utilidades para manejar presupuestos mensuales por categorías
// Integración completa con backend MongoDB - NO USAR MOCK
// Mantiene compatibilidad con la interfaz anterior para no romper componentes existentes

import { presupuestosService } from '@/services/presupuestos.service'
import type { MesValido } from '@/models/presupuestos'

// Interfaz compatible con componentes existentes (formato simplificado)
export interface Presupuesto {
  categoria: string
  monto: number
  porcentaje: number // Porcentaje del total de ingresos del mes
}

export interface PresupuestoMensual {
  mes: string
  totalIngresos: number
  presupuestos: Presupuesto[]
}

// Cache simple para evitar múltiples llamadas
let presupuestosCache: Map<string, Presupuesto[]> = new Map()
let totalCache: Map<string, number> = new Map()

// Función helper para validar mes
function validateMes(mes: string): MesValido {
  const mesesValidos: MesValido[] = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]
  if (mesesValidos.includes(mes as MesValido)) {
    return mes as MesValido
  }
  throw new Error(`Mes inválido: ${mes}. Debe ser uno de: ${mesesValidos.join(', ')}`)
}

// Función para convertir presupuesto del backend al formato local
function adaptPresupuesto(backendPresupuesto: any): Presupuesto {
  return {
    categoria: backendPresupuesto.categoria,
    monto: backendPresupuesto.monto,
    porcentaje: backendPresupuesto.porcentaje || 0
  }
}

// Función para obtener presupuestos de un mes (async - ahora usa API real)
export async function getPresupuestos(mes: string, userId?: string, forceRefresh: boolean = false): Promise<Presupuesto[]> {
  if (typeof window === 'undefined') return []
  
  try {
    const mesValido = validateMes(mes)
    const cacheKey = `${mes}-${userId || 'default'}`
    
    // Si se fuerza la recarga, limpiar cache primero
    if (forceRefresh) {
      presupuestosCache.delete(cacheKey)
      totalCache.delete(cacheKey)
    }
    
    // Verificar cache solo si no se fuerza la recarga
    if (!forceRefresh && presupuestosCache.has(cacheKey)) {
      return presupuestosCache.get(cacheKey)!
    }
    
    // Llamar al servicio real
    const backendPresupuestos = await presupuestosService.getPresupuestosByMes(mesValido)
    const presupuestos = backendPresupuestos.map(adaptPresupuesto)
    
    // Actualizar cache
    presupuestosCache.set(cacheKey, presupuestos)
    
    return presupuestos
  } catch (error) {
    console.error('Error al obtener presupuestos:', error)
    // En caso de error, retornar array vacío para no romper la UI
    return []
  }
}

// Función para guardar presupuestos de un mes (deprecated - usar setPresupuesto)
export function savePresupuestos(mes: string, presupuestos: Presupuesto[], userId?: string): void {
  console.warn('savePresupuestos está deprecated. Usar setPresupuesto con el servicio real.')
}

// Función para agregar o actualizar un presupuesto (async - ahora usa API real)
export async function setPresupuesto(
  mes: string, 
  categoria: string, 
  monto: number, 
  totalIngresos: number, 
  userId?: string
): Promise<void> {
  if (typeof window === 'undefined') return
  
  try {
    const mesValido = validateMes(mes)
    
    // Llamar al servicio real (upsert)
    await presupuestosService.createOrUpdatePresupuesto({
      mes: mesValido,
      categoria,
      monto,
      totalIngresos
    })
    
    // Limpiar cache para forzar recarga
    const cacheKey = `${mes}-${userId || 'default'}`
    presupuestosCache.delete(cacheKey)
    totalCache.delete(cacheKey)
  } catch (error) {
    console.error('Error al crear/actualizar presupuesto:', error)
    throw error
  }
}

// Función para eliminar un presupuesto (async - ahora usa API real)
export async function deletePresupuesto(mes: string, categoria: string, userId?: string): Promise<void> {
  if (typeof window === 'undefined') return
  
  try {
    const mesValido = validateMes(mes)
    
    // Llamar al servicio real
    await presupuestosService.deletePresupuesto(mesValido, categoria)
    
    // Limpiar cache
    const cacheKey = `${mes}-${userId || 'default'}`
    presupuestosCache.delete(cacheKey)
    totalCache.delete(cacheKey)
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error)
    throw error
  }
}

// Función para obtener el total de presupuestos de un mes (async - ahora usa API real)
export async function getTotalPresupuestos(mes: string, userId?: string, forceRefresh: boolean = false): Promise<number> {
  if (typeof window === 'undefined') return 0
  
  try {
    const mesValido = validateMes(mes)
    const cacheKey = `${mes}-${userId || 'default'}`
    
    // Si se fuerza la recarga, limpiar cache primero
    if (forceRefresh) {
      totalCache.delete(cacheKey)
    }
    
    // Verificar cache solo si no se fuerza la recarga
    if (!forceRefresh && totalCache.has(cacheKey)) {
      return totalCache.get(cacheKey)!
    }
    
    // Llamar al servicio real
    const total = await presupuestosService.getTotalByMes(mesValido)
    
    // Actualizar cache
    totalCache.set(cacheKey, total)
    
    return total
  } catch (error) {
    console.error('Error al obtener total de presupuestos:', error)
    // En caso de error, calcular desde presupuestos locales si están en cache
    const cacheKey = `${mes}-${userId || 'default'}`
    const presupuestos = presupuestosCache.get(cacheKey) || []
    return presupuestos.reduce((total, p) => total + p.monto, 0)
  }
}

// Función para actualizar porcentajes basándose en el total de ingresos
// Nota: El backend calcula porcentajes automáticamente, esta función es solo para compatibilidad
export function actualizarPorcentajes(mes: string, totalIngresos: number, userId?: string): void {
  // El backend ya calcula porcentajes automáticamente
  // Esta función se mantiene para compatibilidad pero no hace nada
  // Los porcentajes se actualizan automáticamente cuando se recargan los presupuestos
  console.log('actualizarPorcentajes: Los porcentajes se calculan automáticamente en el backend')
}

// Función para obtener el presupuesto de una categoría específica (async)
export async function getPresupuestoPorCategoria(
  mes: string, 
  categoria: string, 
  userId?: string
): Promise<Presupuesto | null> {
  const presupuestos = await getPresupuestos(mes, userId)
  const presupuesto = presupuestos.find(p => p.categoria === categoria)
  return presupuesto || null
}

// Función para limpiar cache (útil para forzar recarga)
export function clearPresupuestosCache(mes?: string, userId?: string): void {
  if (mes) {
    const cacheKey = `${mes}-${userId || 'default'}`
    presupuestosCache.delete(cacheKey)
    totalCache.delete(cacheKey)
  } else {
    presupuestosCache.clear()
    totalCache.clear()
  }
}

