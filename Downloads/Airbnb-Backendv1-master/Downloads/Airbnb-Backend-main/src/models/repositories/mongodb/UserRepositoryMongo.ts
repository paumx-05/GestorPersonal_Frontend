/**
 * 🎯 REPOSITORY MONGODB DE USUARIO
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Implementación MongoDB del repositorio de usuario.
 * Usa Mongoose para operaciones de base de datos.
 * 
 * 🔧 CARACTERÍSTICAS:
 * - Implementa IUserRepository
 * - Usa UserModel de Mongoose
 * - Mapeo automático entre MongoDB y tipos existentes
 * - Encriptación real con bcryptjs
 */

import { IUserRepository } from '../../interfaces/IUserRepository';
import { User, CreateUserData, UpdateUserData } from '../../../types/auth';
import { UserModel } from '../../schemas/UserSchema';
import bcrypt from 'bcryptjs';

export class UserRepositoryMongo implements IUserRepository {
  private readonly SALT_ROUNDS = 12;

  // 🔍 FUNCIONES DE BÚSQUEDA
  async findById(id: string): Promise<User | null> {
    try {
      const user = await UserModel.findById(id);
      return user ? this.mapToUser(user) : null;
    } catch (error) {
      throw new Error('Error al buscar usuario por ID');
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      return user ? this.mapToUser(user) : null;
    } catch (error) {
      throw new Error('Error al buscar usuario por email');
    }
  }

  // ➕ FUNCIONES DE CREACIÓN
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Validate email availability
      if (!(await this.isEmailAvailable(userData.email))) {
        throw new Error('El email ya está registrado');
      }

      // Validate password
      if (!this.isPasswordValid(userData.password)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }

      // Encrypt password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create new user
      const user = new UserModel({
        email: userData.email.toLowerCase(),
        name: userData.name.trim(),
        password: hashedPassword,
        avatar: userData.avatar,
        isActive: true
      });

      const savedUser = await user.save();
      return this.mapToUser(savedUser);
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // ✏️ FUNCIONES DE ACTUALIZACIÓN
  async updateUser(id: string, updates: UpdateUserData): Promise<User> {
    try {
      // Validate email if being updated
      if (updates.email && !(await this.isEmailAvailable(updates.email, id))) {
        throw new Error('El email ya está registrado');
      }

      const updateData: any = {};
      
      // Actualizar name (validar que tenga contenido y longitud válida)
      if (updates.name !== undefined) {
        const trimmedName = updates.name.trim();
        // Validar que tenga al menos 1 carácter y máximo 100
        if (trimmedName && trimmedName.length > 0 && trimmedName.length <= 100) {
          updateData.name = trimmedName;
        } else {
          // Si está vacío o muy largo, no actualizar (el controlador ya validó esto)
          // No hacer nada aquí - el controlador maneja los errores de validación
        }
      }
      
      // Actualizar email
      if (updates.email) updateData.email = updates.email.toLowerCase();
      
      // Actualizar avatar (puede ser null, string o undefined)
      if (updates.avatar !== undefined) {
        updateData.avatar = updates.avatar || null;
      }
      
      // Actualizar description (puede ser null, string vacío o undefined)
      if (updates.description !== undefined) {
        const trimmedDesc = updates.description?.trim();
        updateData.description = trimmedDesc || null;
      }
      
      // Actualizar otros campos
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
      if (updates.role !== undefined) updateData.role = updates.role;

      const user = await UserModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return this.mapToUser(user);
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async updateUserPassword(id: string, newPassword: string): Promise<User> {
    try {
      // La contraseña ya viene hasheada desde el controlador
      const user = await UserModel.findByIdAndUpdate(
        id,
        { password: newPassword },
        { new: true }
      );

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return this.mapToUser(user);
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // 🗑️ FUNCIONES DE ELIMINACIÓN
  async deleteUser(id: string): Promise<User> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return this.mapToUser(user);
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // 📋 FUNCIONES DE LISTADO
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await UserModel.find({ isActive: true });
      return users.map(user => ({
        ...this.mapToUser(user),
        password: '***' // Hide password in responses
      }));
    } catch (error) {
      throw new Error('Error al obtener usuarios');
    }
  }

  // 🔐 FUNCIONES DE AUTENTICACIÓN
  async verifyCredentials(email: string, password: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      });
      
      if (!user) {
        return null;
      }

      const isValidPassword = await this.comparePassword(password, user.password);
      
      if (!isValidPassword) {
        return null;
      }

      return this.mapToUser(user);
    } catch (error) {
      throw new Error('Error al verificar credenciales');
    }
  }

  // 🔒 FUNCIONES DE ENCRIPTACIÓN
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      throw new Error('Error al encriptar contraseña');
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Error al comparar contraseña');
    }
  }

  isPasswordValid(password: string): boolean {
    // Simplified: minimum 8 characters
    return Boolean(password && password.length >= 8);
  }

  // ✅ FUNCIONES DE VALIDACIÓN
  async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const query: any = { email: email.toLowerCase() };
      if (excludeUserId) {
        query._id = { $ne: excludeUserId };
      }
      
      const existingUser = await UserModel.findOne(query);
      return !existingUser;
    } catch (error) {
      throw new Error('Error al verificar disponibilidad del email');
    }
  }

  // 🛠️ FUNCIONES DE UTILIDAD
  removePasswordFromUser(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 📊 FUNCIONES DE ESTADÍSTICAS
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    try {
      const total = await UserModel.countDocuments();
      const active = await UserModel.countDocuments({ isActive: true });
      const inactive = total - active;

      return { total, active, inactive };
    } catch (error) {
      throw new Error('Error al obtener estadísticas de usuarios');
    }
  }

  // 🔄 FUNCIÓN DE MAPEO
  private mapToUser(mongoUser: any): User {
    // Crear objeto base
    const user: any = {
      id: mongoUser._id.toString(),
      email: mongoUser.email,
      name: mongoUser.name,
      password: mongoUser.password,
      avatar: mongoUser.avatar || undefined,
      createdAt: mongoUser.createdAt.toISOString(),
      isActive: mongoUser.isActive,
      role: mongoUser.role || 'user'
    };

    // Agregar campos opcionales si existen
    if (mongoUser.description !== undefined) {
      user.description = mongoUser.description;
    }

    return user as User;
  }
}
