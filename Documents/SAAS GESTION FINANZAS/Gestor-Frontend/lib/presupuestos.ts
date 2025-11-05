// Utilidades para manejar presupuestos mensuales por categorías
// Permite definir cuánto se quiere gastar en cada categoría por mes

import { getUsuarioActual } from './auth'

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

// Función para obtener la clave de localStorage para un mes
function getStorageKey(mes: string, userId?: string): string {
  let usuarioId = userId
  if (!usuarioId && typeof window !== 'undefined') {
    const usuario = getUsuarioActual()
    usuarioId = usuario?.id
  }
  usuarioId = usuarioId || 'default'
  return `presupuestos-${usuarioId}-${mes}`
}

// Función para obtener presupuestos de un mes
export function getPresupuestos(mes: string, userId?: string): Presupuesto[] {
  if (typeof window === 'undefined') return []
  
  const key = getStorageKey(mes, userId)
  const presupuestosJson = localStorage.getItem(key)
  
  if (!presupuestosJson) {
    return []
  }
  
  return JSON.parse(presupuestosJson)
}

// Función para guardar presupuestos de un mes
export function savePresupuestos(mes: string, presupuestos: Presupuesto[], userId?: string): void {
  if (typeof window === 'undefined') return
  
  const key = getStorageKey(mes, userId)
  localStorage.setItem(key, JSON.stringify(presupuestos))
}

// Función para agregar o actualizar un presupuesto
export function setPresupuesto(mes: string, categoria: string, monto: number, totalIngresos: number, userId?: string): void {
  const presupuestos = getPresupuestos(mes, userId)
  const porcentaje = totalIngresos > 0 ? (monto / totalIngresos) * 100 : 0
  
  // Buscar si ya existe un presupuesto para esta categoría
  const index = presupuestos.findIndex(p => p.categoria === categoria)
  
  const nuevoPresupuesto: Presupuesto = {
    categoria,
    monto,
    porcentaje
  }
  
  if (index >= 0) {
    // Actualizar existente
    presupuestos[index] = nuevoPresupuesto
  } else {
    // Agregar nuevo
    presupuestos.push(nuevoPresupuesto)
  }
  
  savePresupuestos(mes, presupuestos, userId)
}

// Función para eliminar un presupuesto
export function deletePresupuesto(mes: string, categoria: string, userId?: string): void {
  const presupuestos = getPresupuestos(mes, userId)
  const presupuestosFiltrados = presupuestos.filter(p => p.categoria !== categoria)
  savePresupuestos(mes, presupuestosFiltrados, userId)
}

// Función para obtener el total de presupuestos de un mes
export function getTotalPresupuestos(mes: string, userId?: string): number {
  const presupuestos = getPresupuestos(mes, userId)
  return presupuestos.reduce((total, p) => total + p.monto, 0)
}

// Función para actualizar porcentajes basándose en el total de ingresos
export function actualizarPorcentajes(mes: string, totalIngresos: number, userId?: string): void {
  const presupuestos = getPresupuestos(mes, userId)
  const presupuestosActualizados = presupuestos.map(p => ({
    ...p,
    porcentaje: totalIngresos > 0 ? (p.monto / totalIngresos) * 100 : 0
  }))
  savePresupuestos(mes, presupuestosActualizados, userId)
}

// Función para obtener el presupuesto de una categoría específica
export function getPresupuestoPorCategoria(mes: string, categoria: string, userId?: string): Presupuesto | null {
  const presupuestos = getPresupuestos(mes, userId)
  const presupuesto = presupuestos.find(p => p.categoria === categoria)
  return presupuesto || null
}

