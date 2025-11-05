// Utilidades para manejar categorías personalizadas
// Permite crear, editar y eliminar categorías propias

import { getUsuarioActual } from './auth'

export interface Categoria {
  id: string
  nombre: string
  tipo: 'gasto' | 'ingreso' | 'ambos'
  color?: string
  fechaCreacion: string
}

// Categorías por defecto para gastos
export const categoriasGastosDefault = [
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

// Categorías por defecto para ingresos
export const categoriasIngresosDefault = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Ventas',
  'Alquileres',
  'Regalos',
  'Otros'
]

// Función para obtener la clave de localStorage
function getStorageKey(userId?: string): string {
  let usuarioId = userId
  if (!usuarioId && typeof window !== 'undefined') {
    const usuario = getUsuarioActual()
    usuarioId = usuario?.id
  }
  usuarioId = usuarioId || 'default'
  return `categorias-personalizadas-${usuarioId}`
}

// Función para obtener todas las categorías personalizadas
export function getCategorias(userId?: string): Categoria[] {
  if (typeof window === 'undefined') return []
  
  const key = getStorageKey(userId)
  const categoriasJson = localStorage.getItem(key)
  
  if (!categoriasJson) {
    // Inicializar con categorías por defecto como personalizadas
    const categoriasIniciales: Categoria[] = [
      ...categoriasGastosDefault.map((nombre, index) => ({
        id: `gasto-${index}`,
        nombre,
        tipo: 'gasto' as const,
        fechaCreacion: new Date().toISOString()
      })),
      ...categoriasIngresosDefault.map((nombre, index) => ({
        id: `ingreso-${index}`,
        nombre,
        tipo: 'ingreso' as const,
        fechaCreacion: new Date().toISOString()
      }))
    ]
    saveCategorias(categoriasIniciales, userId)
    return categoriasIniciales
  }
  
  return JSON.parse(categoriasJson)
}

// Función para guardar categorías
export function saveCategorias(categorias: Categoria[], userId?: string): void {
  if (typeof window === 'undefined') return
  
  const key = getStorageKey(userId)
  localStorage.setItem(key, JSON.stringify(categorias))
}

// Función para agregar una nueva categoría
export function addCategoria(categoria: Omit<Categoria, 'id' | 'fechaCreacion'>, userId?: string): void {
  const categorias = getCategorias(userId)
  
  // Verificar que no exista una categoría con el mismo nombre y tipo
  const existe = categorias.some(
    c => c.nombre.toLowerCase() === categoria.nombre.toLowerCase() && c.tipo === categoria.tipo
  )
  
  if (existe) {
    throw new Error('Ya existe una categoría con ese nombre y tipo')
  }
  
  const nuevaCategoria: Categoria = {
    ...categoria,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    fechaCreacion: new Date().toISOString()
  }
  
  categorias.push(nuevaCategoria)
  saveCategorias(categorias, userId)
}

// Función para actualizar una categoría
export function updateCategoria(id: string, categoria: Partial<Categoria>, userId?: string): void {
  const categorias = getCategorias(userId)
  const index = categorias.findIndex(c => c.id === id)
  
  if (index === -1) {
    throw new Error('Categoría no encontrada')
  }
  
  // Verificar que no exista otra categoría con el mismo nombre y tipo
  if (categoria.nombre) {
    const existe = categorias.some(
      (c, i) => i !== index && 
      c.nombre.toLowerCase() === categoria.nombre!.toLowerCase() && 
      (categoria.tipo ? c.tipo === categoria.tipo : c.tipo === categorias[index].tipo)
    )
    
    if (existe) {
      throw new Error('Ya existe una categoría con ese nombre y tipo')
    }
  }
  
  categorias[index] = { ...categorias[index], ...categoria }
  saveCategorias(categorias, userId)
}

// Función para eliminar una categoría
export function deleteCategoria(id: string, userId?: string): void {
  const categorias = getCategorias(userId)
  const categoriasFiltradas = categorias.filter(c => c.id !== id)
  saveCategorias(categoriasFiltradas, userId)
}

// Función para obtener categorías por tipo
export function getCategoriasPorTipo(tipo: 'gasto' | 'ingreso' | 'ambos', userId?: string): Categoria[] {
  const categorias = getCategorias(userId)
  
  if (tipo === 'ambos') {
    return categorias.filter(c => c.tipo === 'ambos' || c.tipo === 'gasto' || c.tipo === 'ingreso')
  }
  
  return categorias.filter(c => c.tipo === tipo || c.tipo === 'ambos')
}

// Función para obtener solo los nombres de categorías por tipo (para compatibilidad)
export function getNombresCategoriasPorTipo(tipo: 'gasto' | 'ingreso', userId?: string): string[] {
  return getCategoriasPorTipo(tipo, userId).map(c => c.nombre)
}

