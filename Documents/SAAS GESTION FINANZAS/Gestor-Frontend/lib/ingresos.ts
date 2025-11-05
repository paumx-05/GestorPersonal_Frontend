// Utilidades para manejar ingresos en localStorage
// Funciones simples para guardar, obtener y eliminar ingresos por mes

import type { Gasto } from './gastos'
import { getUsuarioActual } from './auth'

export interface Ingreso {
  id: string
  descripcion: string
  monto: number
  fecha: string
  mes: string
  categoria: string
}

// Lista de categorías predefinidas para ingresos
export const categoriasIngresos = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Ventas',
  'Alquileres',
  'Regalos',
  'Otros'
]

// Función para obtener la clave de localStorage para un mes
function getStorageKey(mes: string, userId?: string): string {
  let usuarioId = userId
  if (!usuarioId && typeof window !== 'undefined') {
    const usuario = getUsuarioActual()
    usuarioId = usuario?.id
  }
  usuarioId = usuarioId || 'default'
  return `ingresos-${usuarioId}-${mes}`
}

// Función para obtener todos los ingresos de un mes
export function getIngresos(mes: string, userId?: string): Ingreso[] {
  if (typeof window === 'undefined') return []
  
  const key = getStorageKey(mes, userId)
  const ingresosJson = localStorage.getItem(key)
  
  if (!ingresosJson) {
    return []
  }
  
  return JSON.parse(ingresosJson)
}

// Función para guardar ingresos de un mes
export function saveIngresos(mes: string, ingresos: Ingreso[], userId?: string): void {
  if (typeof window === 'undefined') return
  
  const key = getStorageKey(mes, userId)
  localStorage.setItem(key, JSON.stringify(ingresos))
}

// Función para agregar un nuevo ingreso
export function addIngreso(mes: string, ingreso: Omit<Ingreso, 'id'>, userId?: string): void {
  const ingresos = getIngresos(mes, userId)
  const nuevoIngreso: Ingreso = {
    ...ingreso,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }
  ingresos.push(nuevoIngreso)
  saveIngresos(mes, ingresos, userId)
}

// Función para eliminar un ingreso
export function deleteIngreso(mes: string, id: string, userId?: string): void {
  const ingresos = getIngresos(mes, userId)
  const ingresosFiltrados = ingresos.filter(ingreso => ingreso.id !== id)
  saveIngresos(mes, ingresosFiltrados, userId)
}

// Función para obtener el total de ingresos de un mes
export function getTotalIngresos(mes: string, userId?: string): number {
  const ingresos = getIngresos(mes, userId)
  return ingresos.reduce((total, ingreso) => total + ingreso.monto, 0)
}

// Función para obtener ingresos por categoría
export function getIngresosPorCategoria(mes: string, categoria: string, userId?: string): Ingreso[] {
  const ingresos = getIngresos(mes, userId)
  return ingresos.filter(ingreso => ingreso.categoria === categoria)
}

// Función para obtener el total de ingresos por categoría
export function getTotalPorCategoria(mes: string, categoria: string, userId?: string): number {
  const ingresos = getIngresosPorCategoria(mes, categoria, userId)
  return ingresos.reduce((total, ingreso) => total + ingreso.monto, 0)
}

// Función para obtener resumen por categorías
export function getResumenPorCategorias(mes: string, userId?: string): { [categoria: string]: number } {
  const ingresos = getIngresos(mes, userId)
  const resumen: { [categoria: string]: number } = {}
  
  ingresos.forEach(ingreso => {
    if (resumen[ingreso.categoria]) {
      resumen[ingreso.categoria] += ingreso.monto
    } else {
      resumen[ingreso.categoria] = ingreso.monto
    }
  })
  
  return resumen
}

