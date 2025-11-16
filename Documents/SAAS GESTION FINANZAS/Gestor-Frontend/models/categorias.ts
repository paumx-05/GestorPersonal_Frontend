// Modelos de categorías
// Define las interfaces y tipos relacionados con categorías
// Alineados con la respuesta del backend

export type TipoCategoria = 'gastos' | 'ingresos' | 'ambos'

// Categoría del backend
export interface Categoria {
  _id: string
  userId: string
  nombre: string
  tipo: TipoCategoria
  createdAt: string // ISO date string
}

// Request para crear una categoría
export interface CreateCategoriaRequest {
  nombre: string
  tipo: TipoCategoria
}

// Request para actualizar una categoría (todos los campos opcionales)
export interface UpdateCategoriaRequest {
  nombre?: string
  tipo?: TipoCategoria
}

// Respuesta del backend para obtener todas las categorías
export interface BackendCategoriasResponse {
  success: boolean
  data: Categoria[]
}

// Respuesta del backend para crear/actualizar categoría
export interface BackendCategoriaResponse {
  success: boolean
  data: Categoria
  message?: string
}

// Respuesta del backend para eliminar categoría
export interface BackendDeleteCategoriaResponse {
  success: boolean
  message: string
}

// Error del backend (reutilizado de auth)
export interface BackendError {
  success: false
  error: string
  message?: string
}

// Error personalizado para categorías
export interface CategoriaError {
  message: string
  status?: number
}

