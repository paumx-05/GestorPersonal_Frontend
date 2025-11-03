/**
 * 🎯 INTERFAZ DE REPOSITORIO DE USUARIO
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Interfaz que define el contrato para todas las operaciones de usuario.
 * Garantiza compatibilidad entre implementaciones Mock y MongoDB.
 * 
 * 🔧 CARACTERÍSTICAS:
 * - Define todas las funciones existentes del modelo User
 * - Mantiene compatibilidad total con la API actual
 * - Permite implementaciones Mock y MongoDB
 */

import { User, CreateUserData, UpdateUserData } from '../../types/auth';

export interface IUserRepository {
  // 🔍 FUNCIONES DE BÚSQUEDA
  findById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  
  // ➕ FUNCIONES DE CREACIÓN
  createUser(userData: CreateUserData): Promise<User>;
  
  // ✏️ FUNCIONES DE ACTUALIZACIÓN
  updateUser(id: string, updates: UpdateUserData): Promise<User>;
  updateUserPassword(id: string, newPassword: string): Promise<User>;
  
  // 🗑️ FUNCIONES DE ELIMINACIÓN
  deleteUser(id: string): Promise<User>;
  
  // 📋 FUNCIONES DE LISTADO
  getAllUsers(): Promise<User[]>;
  
  // 🔐 FUNCIONES DE AUTENTICACIÓN
  verifyCredentials(email: string, password: string): Promise<User | null>;
  
  // 🔒 FUNCIONES DE ENCRIPTACIÓN
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  isPasswordValid(password: string): boolean;
  
  // ✅ FUNCIONES DE VALIDACIÓN
  isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean>;
  
  // 🛠️ FUNCIONES DE UTILIDAD
  removePasswordFromUser(user: User): Omit<User, 'password'>;
  
  // 📊 FUNCIONES DE ESTADÍSTICAS
  getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }>;
}
