// Utilidades para manejar gastos en localStorage
// Funciones simples para guardar, obtener y eliminar gastos por mes

import { getUsuarioActual } from './auth'

export interface Gasto {
  id: string
  descripcion: string
  monto: number
  fecha: string
  mes: string
  categoria: string
  dividido?: Array<{
    amigoId: string
    amigoNombre: string
    montoDividido: number
    pagado: boolean
  }>
}

// Lista de categorías predefinidas para gastos
export const categoriasGastos = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Compras',
  'Restaurantes',
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
  return `gastos-${usuarioId}-${mes}`
}

// Función para obtener todos los gastos de un mes
export function getGastos(mes: string, userId?: string): Gasto[] {
  if (typeof window === 'undefined') return []
  
  const key = getStorageKey(mes, userId)
  const gastosJson = localStorage.getItem(key)
  
  if (!gastosJson) {
    return []
  }
  
  return JSON.parse(gastosJson)
}

// Función para guardar gastos de un mes
export function saveGastos(mes: string, gastos: Gasto[], userId?: string): void {
  if (typeof window === 'undefined') return
  
  const key = getStorageKey(mes, userId)
  localStorage.setItem(key, JSON.stringify(gastos))
}

// Función para agregar un nuevo gasto
export function addGasto(mes: string, gasto: Omit<Gasto, 'id'>, userId?: string): void {
  const gastos = getGastos(mes, userId)
  const nuevoGasto: Gasto = {
    ...gasto,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }
  gastos.push(nuevoGasto)
  saveGastos(mes, gastos, userId)
}

// Función para eliminar un gasto
export function deleteGasto(mes: string, id: string, userId?: string): void {
  const gastos = getGastos(mes, userId)
  const gastosFiltrados = gastos.filter(gasto => gasto.id !== id)
  saveGastos(mes, gastosFiltrados, userId)
}

// Función para obtener el total de gastos de un mes
export function getTotalGastos(mes: string, userId?: string): number {
  const gastos = getGastos(mes, userId)
  return gastos.reduce((total, gasto) => total + gasto.monto, 0)
}

// Función para obtener gastos por categoría
export function getGastosPorCategoria(mes: string, categoria: string, userId?: string): Gasto[] {
  const gastos = getGastos(mes, userId)
  return gastos.filter(gasto => gasto.categoria === categoria)
}

// Función para obtener el total de gastos por categoría
export function getTotalPorCategoria(mes: string, categoria: string, userId?: string): number {
  const gastos = getGastosPorCategoria(mes, categoria, userId)
  return gastos.reduce((total, gasto) => total + gasto.monto, 0)
}

// Función para obtener resumen por categorías
export function getResumenPorCategorias(mes: string, userId?: string): { [categoria: string]: number } {
  const gastos = getGastos(mes, userId)
  const resumen: { [categoria: string]: number } = {}
  
  gastos.forEach(gasto => {
    if (resumen[gasto.categoria]) {
      resumen[gasto.categoria] += gasto.monto
    } else {
      resumen[gasto.categoria] = gasto.monto
    }
  })
  
  return resumen
}

