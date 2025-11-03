/**
 * 👤 MODELO DE AUTENTICACIÓN DE USUARIO
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Modelo avanzado de autenticación de usuario con encriptación real de contraseñas usando bcryptjs.
 * Preparado para integración futura con MongoDB/Mongoose. Implementa gestión integral de usuarios
 * con validaciones de negocio, manejo seguro de contraseñas y operaciones CRUD completas.
 * 
 * 🔧 CARACTERÍSTICAS PRINCIPALES:
 * - Encriptación real de contraseñas con bcryptjs (12 rondas de sal)
 * - Validaciones de lógica de negocio
 * - Interfaz compatible con MongoDB/Mongoose
 * - Operaciones CRUD completas con manejo de errores
 * - Utilidades de seguridad de contraseñas
 */

import bcrypt from 'bcryptjs';
import { User } from '../../types/auth';

// =============================================================================
// 🔧 TIPOS SIMPLIFICADOS
// =============================================================================

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  avatar?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  avatar?: string;
  isActive?: boolean;
  role?: 'user' | 'admin';
}

// =============================================================================
// 🔐 CONFIGURACIÓN DE ENCRIPTACIÓN DE CONTRASEÑAS
// =============================================================================

/**
 * 🔒 Configuración para hash de contraseñas
 * SALT_ROUNDS: Número de rondas para hash bcrypt (recomendado: 10-12)
 */
const SALT_ROUNDS = 12;

// =============================================================================
// 💾 BASE DE DATOS TEMPORAL EN MEMORIA
// =============================================================================
// TODO: Reemplazar con MongoDB/Mongoose cuando esté disponible

interface UserDB {
  users: User[];
  nextId: number;
}

const userDB: UserDB = {
  users: [
    {
      id: '1',
      email: 'demo@airbnb.com',
      name: 'Usuario Demo',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7z7KZz4q7e', // bcrypt hash real
      avatar: 'https://via.placeholder.com/150',
      createdAt: new Date().toISOString(),
      isActive: true,
      role: 'user'
    }
  ],
  nextId: 2
};

// =============================================================================
// 🔐 FUNCIONES DE ENCRIPTACIÓN DE CONTRASEÑAS
// =============================================================================

/**
 * 🔐 Encripta una contraseña usando bcrypt
 * @param password - Contraseña en texto plano
 * @returns Promise con la contraseña hasheada
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error('Error al encriptar contraseña');
  }
};

/**
 * 🔍 Compara una contraseña con su hash
 * @param password - Contraseña en texto plano
 * @param hash - Hash almacenado
 * @returns Promise con true si coinciden, false si no
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error al comparar contraseña');
  }
};

// =============================================================================
// ✅ VALIDACIONES DE NEGOCIO
// =============================================================================

/**
 * ✅ Valida que el email no esté ya registrado
 * @param email - Email a validar
 * @param excludeUserId - ID de usuario a excluir de la validación (para actualizaciones)
 * @returns true si el email está disponible
 */
export const isEmailAvailable = (email: string, excludeUserId?: string): boolean => {
  const existingUser = userDB.users.find(
    user => user.email.toLowerCase() === email.toLowerCase() && user.id !== excludeUserId
  );
  return !existingUser;
};

/**
 * ✅ Valida la fortaleza de la contraseña
 * @param password - Contraseña a validar
 * @returns true si la contraseña es válida
 */
export const isPasswordValid = (password: string): boolean => {
  // Simplified: minimum 8 characters
  return Boolean(password && password.length >= 8);
};

// =============================================================================
// 📋 FUNCIONES CRUD
// =============================================================================

/**
 * 🔍 Busca un usuario por dirección de email
 * @param email - Dirección de email del usuario
 * @returns Usuario encontrado o null
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = userDB.users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
    return user || null;
  } catch (error) {
    throw new Error('Error al buscar usuario por email');
  }
};

/**
 * 🔍 Busca un usuario por ID
 * @param id - ID del usuario
 * @returns Usuario encontrado o null
 */
export const findUserById = async (id: string): Promise<User | null> => {
  try {
    const user = userDB.users.find(user => user.id === id);
    return user || null;
  } catch (error) {
    throw new Error('Error al buscar usuario por ID');
  }
};

/**
 * ➕ Crea un nuevo usuario con validación y encriptación
 * @param userData - Datos del usuario a crear
 * @returns Usuario creado o lanza error si falla
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    // Validate email availability
    if (!isEmailAvailable(userData.email)) {
      throw new Error('El email ya está registrado');
    }

    // Validate password
    if (!isPasswordValid(userData.password)) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Encrypt password
    const hashedPassword = await hashPassword(userData.password);

    // Create new user
    const newUser: User = {
      id: userDB.nextId.toString(),
      email: userData.email.toLowerCase(),
      name: userData.name.trim(),
      password: hashedPassword,
      avatar: userData.avatar,
      createdAt: new Date().toISOString(),
      isActive: true,
      role: 'user'
    };

    userDB.users.push(newUser);
    userDB.nextId++;

    return newUser;
  } catch (error) {
    throw new Error(`Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * ✏️ Actualiza un usuario existente
 * @param id - ID del usuario a actualizar
 * @param updates - Datos a actualizar
 * @returns Usuario actualizado o lanza error si falla
 */
export const updateUser = async (id: string, updates: UpdateUserData): Promise<User> => {
  try {
    const userIndex = userDB.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    // Validate email if being updated
    if (updates.email && !isEmailAvailable(updates.email, id)) {
      throw new Error('El email ya está registrado');
    }

    // Apply updates
    if (updates.name) userDB.users[userIndex].name = updates.name.trim();
    if (updates.email) userDB.users[userIndex].email = updates.email.toLowerCase();
    if (updates.avatar !== undefined) userDB.users[userIndex].avatar = updates.avatar;
    if (updates.isActive !== undefined) userDB.users[userIndex].isActive = updates.isActive;
    if (updates.role !== undefined) userDB.users[userIndex].role = updates.role;
    
    // Update profile fields
    if ((updates as any).bio !== undefined) (userDB.users[userIndex] as any).bio = (updates as any).bio;
    if ((updates as any).location !== undefined) (userDB.users[userIndex] as any).location = (updates as any).location;
    if ((updates as any).phone !== undefined) (userDB.users[userIndex] as any).phone = (updates as any).phone;

    return userDB.users[userIndex];
  } catch (error) {
    throw new Error(`Error al actualizar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * 🗑️ Elimina un usuario (eliminación suave)
 * @param id - ID del usuario a eliminar
 * @returns Usuario marcado como inactivo o lanza error si falla
 */
export const deleteUser = async (id: string): Promise<User> => {
  try {
    const userIndex = userDB.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    // Soft delete: mark as inactive
    userDB.users[userIndex].isActive = false;

    return userDB.users[userIndex];
  } catch (error) {
    throw new Error(`Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * 📋 Obtiene todos los usuarios activos
 * @returns Lista de usuarios activos (sin contraseñas)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    return userDB.users
      .filter(user => user.isActive)
      .map(user => ({
        ...user,
        password: '***' // Hide password in responses
      }));
  } catch (error) {
    throw new Error('Error al obtener usuarios');
  }
};

/**
 * 🔐 Verifica las credenciales del usuario
 * @param email - Dirección de email del usuario
 * @param password - Contraseña en texto plano
 * @returns Usuario si las credenciales son válidas, null si no
 */
export const verifyCredentials = async (email: string, password: string): Promise<User | null> => {
  try {
    const user = await findUserByEmail(email);
    
    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }

    return user;
  } catch (error) {
    throw new Error('Error al verificar credenciales');
  }
};

// =============================================================================
// 🛠️ FUNCIONES DE UTILIDAD
// =============================================================================

/**
 * 🔒 Remueve la contraseña del objeto usuario
 * @param user - Usuario con contraseña
 * @returns Usuario sin contraseña
 */
export const removePasswordFromUser = (user: User): Omit<User, 'password'> => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * 📊 Obtiene estadísticas de usuarios
 * @returns Estadísticas básicas de usuarios
 */
export const getUserStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
}> => {
  try {
    const total = userDB.users.length;
    const active = userDB.users.filter(user => user.isActive).length;
    const inactive = total - active;

    return { total, active, inactive };
  } catch (error) {
    throw new Error('Error al obtener estadísticas de usuarios');
  }
};

/**
 * 🔐 Actualiza la contraseña de un usuario
 * @param id - ID del usuario
 * @param newPassword - Nueva contraseña en texto plano
 * @returns Usuario actualizado o lanza error si falla
 */
export const updateUserPassword = async (id: string, newPassword: string): Promise<User> => {
  try {
    const userIndex = userDB.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    // Validate and hash new password
    if (!isPasswordValid(newPassword)) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    userDB.users[userIndex].password = await hashPassword(newPassword);

    return userDB.users[userIndex];
  } catch (error) {
    throw new Error(`Error al actualizar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// =============================================================================
// 🍃 PREPARACIÓN PARA MONGODB
// =============================================================================
// TODO: Implementar cuando MongoDB esté disponible

/**
 * Esquema de Mongoose para MongoDB (preparado para el futuro)
 * 
 * import mongoose, { Document, Schema } from 'mongoose';
 * 
 * interface IUser extends Document {
 *   email: string;
 *   name: string;
 *   password: string;
 *   avatar?: string;
 *   createdAt: Date;
 *   isActive: boolean;
 * }
 * 
 * const UserSchema = new Schema<IUser>({
 *   email: { type: String, required: true, unique: true, lowercase: true },
 *   name: { type: String, required: true, trim: true },
 *   password: { type: String, required: true },
 *   avatar: { type: String },
 *   createdAt: { type: Date, default: Date.now },
 *   isActive: { type: Boolean, default: true }
 * });
 * 
 * export const UserModel = mongoose.model<IUser>('User', UserSchema);
 */
