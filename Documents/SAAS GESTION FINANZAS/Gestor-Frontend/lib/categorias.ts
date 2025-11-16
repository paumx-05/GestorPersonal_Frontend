// Utilidades para manejar categorías personalizadas
// Integración con backend MongoDB - NO USAR MOCK
// Permite crear, editar y eliminar categorías propias

import { categoriasService } from '@/services/categorias.service'
import type { Categoria as BackendCategoria, TipoCategoria as BackendTipoCategoria } from '@/models/categorias'

// Interfaz local para compatibilidad con código existente
export interface Categoria {
  id: string
  nombre: string
  tipo: 'gasto' | 'ingreso' | 'ambos'
  color?: string
  fechaCreacion: string
}

// Categorías por defecto para referencia (ya no se usan para inicializar)
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

export const categoriasIngresosDefault = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Ventas',
  'Alquileres',
  'Regalos',
  'Otros'
]

/**
 * Convierte tipo de categoría del backend (plural) al formato local (singular)
 */
function adaptTipoFromBackend(tipo: BackendTipoCategoria): 'gasto' | 'ingreso' | 'ambos' {
  if (tipo === 'gastos') return 'gasto'
  if (tipo === 'ingresos') return 'ingreso'
  return 'ambos'
}

/**
 * Convierte tipo de categoría del formato local (singular) al backend (plural)
 */
function adaptTipoToBackend(tipo: 'gasto' | 'ingreso' | 'ambos'): BackendTipoCategoria {
  if (tipo === 'gasto') return 'gastos'
  if (tipo === 'ingreso') return 'ingresos'
  return 'ambos'
}

/**
 * Adapta una categoría del backend al formato local
 */
function adaptCategoriaFromBackend(backendCategoria: BackendCategoria): Categoria {
  return {
    id: backendCategoria._id,
    nombre: backendCategoria.nombre,
    tipo: adaptTipoFromBackend(backendCategoria.tipo),
    fechaCreacion: backendCategoria.createdAt,
  }
}

/**
 * Obtiene todas las categorías del usuario autenticado desde el backend
 */
export async function getCategorias(userId?: string): Promise<Categoria[]> {
  try {
    const backendCategorias = await categoriasService.getAllCategorias()
    return backendCategorias.map(adaptCategoriaFromBackend)
  } catch (error: any) {
    console.error('[CATEGORIAS] Error al obtener categorías:', error)
    // Retornar array vacío en caso de error para no romper la UI
    return []
  }
}

/**
 * Obtiene categorías filtradas por tipo desde el backend
 */
export async function getCategoriasPorTipo(
  tipo: 'gasto' | 'ingreso' | 'ambos',
  userId?: string
): Promise<Categoria[]> {
  try {
    const backendTipo = adaptTipoToBackend(tipo)
    const backendCategorias = await categoriasService.getCategoriasByTipo(backendTipo)
    
    // Si el tipo es 'ambos', también incluir categorías de tipo 'ambos' del backend
    // El backend ya filtra correctamente, pero para asegurar compatibilidad:
    const categorias = backendCategorias.map(adaptCategoriaFromBackend)
    
    // Si el tipo local es 'ambos', incluir todas
    if (tipo === 'ambos') {
      return categorias
    }
    
    // Filtrar para incluir solo las del tipo solicitado o 'ambos'
    return categorias.filter(c => c.tipo === tipo || c.tipo === 'ambos')
  } catch (error: any) {
    console.error('[CATEGORIAS] Error al obtener categorías por tipo:', error)
    return []
  }
}

/**
 * Obtiene solo los nombres de categorías por tipo (para compatibilidad con código existente)
 */
export async function getNombresCategoriasPorTipo(
  tipo: 'gasto' | 'ingreso',
  userId?: string
): Promise<string[]> {
  const categorias = await getCategoriasPorTipo(tipo, userId)
  return categorias.map(c => c.nombre)
}

/**
 * Crea una nueva categoría en el backend
 */
export async function addCategoria(
  categoria: Omit<Categoria, 'id' | 'fechaCreacion'>,
  userId?: string
): Promise<Categoria> {
  try {
    const backendCategoria = await categoriasService.createCategoria({
      nombre: categoria.nombre.trim(),
      tipo: adaptTipoToBackend(categoria.tipo),
    })
    
    return adaptCategoriaFromBackend(backendCategoria)
  } catch (error: any) {
    console.error('[CATEGORIAS] Error al crear categoría:', error)
    throw new Error(error.message || 'Error al crear la categoría')
  }
}

/**
 * Actualiza una categoría existente en el backend
 */
export async function updateCategoria(
  id: string,
  categoria: Partial<Categoria>,
  userId?: string
): Promise<Categoria> {
  try {
    const updateData: any = {}
    
    if (categoria.nombre !== undefined) {
      updateData.nombre = categoria.nombre.trim()
    }
    
    if (categoria.tipo !== undefined) {
      updateData.tipo = adaptTipoToBackend(categoria.tipo)
    }
    
    const backendCategoria = await categoriasService.updateCategoria(id, updateData)
    return adaptCategoriaFromBackend(backendCategoria)
  } catch (error: any) {
    console.error('[CATEGORIAS] Error al actualizar categoría:', error)
    throw new Error(error.message || 'Error al actualizar la categoría')
  }
}

/**
 * Elimina una categoría del backend
 */
export async function deleteCategoria(id: string, userId?: string): Promise<void> {
  try {
    await categoriasService.deleteCategoria(id)
  } catch (error: any) {
    console.error('[CATEGORIAS] Error al eliminar categoría:', error)
    throw new Error(error.message || 'Error al eliminar la categoría')
  }
}

// Funciones deprecadas - mantenidas solo para compatibilidad pero ya no usan localStorage
// Estas funciones ahora son wrappers async que llaman a las funciones del backend

/**
 * @deprecated Esta función ya no guarda en localStorage, usa el backend
 * Mantenida solo para compatibilidad
 */
export function saveCategorias(categorias: Categoria[], userId?: string): void {
  console.warn('[CATEGORIAS] saveCategorias está deprecada. Las categorías se guardan automáticamente en el backend.')
  // No hacer nada - las categorías se guardan en el backend
}
