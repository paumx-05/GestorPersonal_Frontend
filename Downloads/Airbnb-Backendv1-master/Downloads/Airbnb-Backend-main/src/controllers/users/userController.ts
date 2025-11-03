/**
 * CONTROLADOR DE USUARIOS - CRUD COMPLETO
 * Implementa operaciones CRUD para gestión de usuarios
 * Usa mock data en memoria (sin MongoDB)
 */

import { Request, Response } from 'express';
import {
  createUser,
  findUserById,
  findUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserStats,
  removePasswordFromUser,
  CreateUserData,
  UpdateUserData
} from '../../models';

// =============================================================================
// INTERFACES Y TIPOS
// =============================================================================

interface UserResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// =============================================================================
// OPERACIONES CRUD
// =============================================================================

/**
 * GET /api/users
 * Obtener lista de usuarios con paginación y filtros
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query as PaginationParams;
    
    // Obtener todos los usuarios
    const allUsers = await getAllUsers();
    
    // Aplicar filtro de búsqueda si existe
    let filteredUsers = allUsers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Aplicar paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Remover contraseñas de la respuesta
    const safeUsers = paginatedUsers.map(user => removePasswordFromUser(user));
    
    const response: UserResponse = {
      success: true,
      data: {
        users: safeUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / limit)
        }
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en getUsers:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * GET /api/users/:id
 * Obtener usuario específico por ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID de usuario requerido'
      });
      return;
    }
    
    const user = await findUserById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }
    
    // Remover contraseña de la respuesta
    const safeUser = removePasswordFromUser(user);
    
    const response: UserResponse = {
      success: true,
      data: { user: safeUser }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * POST /api/users
 * Crear nuevo usuario
 */
export const createNewUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password, avatar } = req.body;
    
    // Validar campos requeridos
    if (!email || !name || !password) {
      res.status(400).json({
        success: false,
        error: 'Email, nombre y contraseña son requeridos'
      });
      return;
    }
    
    // Preparar datos del usuario
    const userData: CreateUserData = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      password,
      avatar: avatar?.trim() || undefined
    };
    
    // Crear usuario usando el modelo
    const user = await createUser(userData);
    
    // Remover contraseña de la respuesta
    const safeUser = removePasswordFromUser(user);
    
    const response: UserResponse = {
      success: true,
      data: { user: safeUser },
      message: 'Usuario creado exitosamente'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error en createNewUser:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    res.status(error instanceof Error && error.message.includes('email') ? 400 : 500).json({
      success: false,
      error: errorMessage
    });
  }
};

/**
 * PUT /api/users/:id
 * Actualizar usuario completo
 */
export const updateUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, avatar, isActive } = req.body;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID de usuario requerido'
      });
      return;
    }
    
    // Verificar que el usuario existe
    const existingUser = await findUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }
    
    // Preparar datos de actualización
    const updateData: UpdateUserData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (avatar !== undefined) updateData.avatar = avatar?.trim() || undefined;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Actualizar usuario
    const user = await updateUser(id, updateData);
    
    // Remover contraseña de la respuesta
    const safeUser = removePasswordFromUser(user);
    
    const response: UserResponse = {
      success: true,
      data: { user: safeUser },
      message: 'Usuario actualizado exitosamente'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en updateUserById:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    res.status(error instanceof Error && error.message.includes('encontrado') ? 404 : 500).json({
      success: false,
      error: errorMessage
    });
  }
};

/**
 * PATCH /api/users/:id
 * Actualizar usuario parcialmente
 */
export const patchUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID de usuario requerido'
      });
      return;
    }
    
    // Verificar que el usuario existe
    const existingUser = await findUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }
    
    // Preparar datos de actualización (solo campos presentes)
    const updateData: UpdateUserData = {};
    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.email !== undefined) updateData.email = updates.email.trim().toLowerCase();
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar?.trim() || undefined;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    
    // Actualizar usuario
    const user = await updateUser(id, updateData);
    
    // Remover contraseña de la respuesta
    const safeUser = removePasswordFromUser(user);
    
    const response: UserResponse = {
      success: true,
      data: { user: safeUser },
      message: 'Usuario actualizado exitosamente'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en patchUserById:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    res.status(error instanceof Error && error.message.includes('encontrado') ? 404 : 500).json({
      success: false,
      error: errorMessage
    });
  }
};

/**
 * DELETE /api/users/:id
 * Eliminar usuario (soft delete)
 */
export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID de usuario requerido'
      });
      return;
    }
    
    // Verificar que el usuario existe
    const existingUser = await findUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }
    
    // Eliminar usuario (soft delete)
    await deleteUser(id);
    
    const response: UserResponse = {
      success: true,
      message: 'Usuario eliminado exitosamente'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en deleteUserById:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    res.status(error instanceof Error && error.message.includes('encontrado') ? 404 : 500).json({
      success: false,
      error: errorMessage
    });
  }
};

/**
 * GET /api/users/me
 * Obtener perfil del usuario autenticado
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }
    
    const user = await findUserById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }
    
    // Remover contraseña de la respuesta
    const safeUser = removePasswordFromUser(user);
    
    // Asegurar que el campo role siempre esté presente
    const userWithRole = {
      ...safeUser,
      role: user.role || 'user'
    };
    
    const response: UserResponse = {
      success: true,
      data: userWithRole
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * GET /api/users/stats
 * Obtener estadísticas de usuarios
 */
export const getUserStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getUserStats();
    
    const response: UserResponse = {
      success: true,
      data: {
        total: stats.total,
        active: stats.active,
        inactive: stats.inactive,
        totalUsers: stats.total // Alias para compatibilidad
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en getUserStatistics:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * PATCH /api/users/:id/role
 * Actualizar rol del usuario (solo admin)
 */
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID de usuario requerido'
      });
      return;
    }
    
    if (!role || !['user', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Rol inválido. Debe ser "user" o "admin"'
      });
      return;
    }
    
    // Verificar que el usuario existe
    const existingUser = await findUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }
    
    // Actualizar rol del usuario
    const updateData: UpdateUserData = { role: role as 'user' | 'admin' };
    const user = await updateUser(id, updateData);
    
    // Remover contraseña de la respuesta
    const safeUser = removePasswordFromUser(user);
    
    const response: UserResponse = {
      success: true,
      data: { user: safeUser },
      message: `Rol del usuario actualizado a "${role}" exitosamente`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en updateUserRole:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    res.status(error instanceof Error && error.message.includes('encontrado') ? 404 : 500).json({
      success: false,
      error: errorMessage
    });
  }
};
