/**
 * 📚 EJEMPLOS DE USO DEL MODELO DE USUARIO
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Demostraciones de ejemplos de uso para el modelo user.ts. Muestra cómo usar el
 * nuevo modelo de autenticación de usuario con manejo adecuado de errores y mejores prácticas.
 * 
 * ⚠️ IMPORTANTE: Este es solo un archivo de ejemplo para propósitos de documentación.
 * No usar este archivo en producción.
 */

import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyCredentials,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserStats,
  removePasswordFromUser,
  CreateUserData,
  UpdateUserData
} from './user';

/**
 * ➕ Ejemplo de creación de un nuevo usuario
 */
export const exampleCreateUser = async (): Promise<void> => {
  try {
    const userData: CreateUserData = {
      email: 'nuevo@ejemplo.com',
      name: 'Usuario Nuevo',
      password: 'Password123', // Must meet security requirements
      avatar: 'https://via.placeholder.com/150'
    };

    const user = await createUser(userData);
    console.log('✅ Usuario creado:', removePasswordFromUser(user));
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
};

/**
 * 🔐 Ejemplo de verificación de credenciales
 */
export const exampleVerifyCredentials = async (): Promise<void> => {
  try {
    const email = 'demo@airbnb.com';
    const password = 'demo123'; // Demo user password

    const user = await verifyCredentials(email, password);
    
    if (user) {
      console.log('✅ Credenciales válidas:', removePasswordFromUser(user));
    } else {
      console.log('❌ Credenciales inválidas');
    }
  } catch (error) {
    console.error('Error inesperado:', error);
  }
};

/**
 * ✏️ Ejemplo de actualización de un usuario
 */
export const exampleUpdateUser = async (): Promise<void> => {
  try {
    const userId = '1'; // Demo user ID
    const updates: UpdateUserData = {
      name: 'Usuario Demo Actualizado',
      avatar: 'https://via.placeholder.com/200'
    };

    const user = await updateUser(userId, updates);
    console.log('✅ Usuario actualizado:', removePasswordFromUser(user));
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
};

/**
 * 📊 Ejemplo de obtención de estadísticas de usuarios
 */
export const exampleGetStats = async (): Promise<void> => {
  try {
    const stats = await getUserStats();
    console.log('📊 Estadísticas de usuarios:', stats);
  } catch (error) {
    console.error('Error inesperado:', error);
  }
};

/**
 * 🚀 Ejecuta todos los ejemplos del modelo de usuario
 */
export const runAllExamples = async (): Promise<void> => {
  console.log('🚀 Ejecutando ejemplos del modelo User...\n');
  
  await exampleCreateUser();
  console.log('');
  
  await exampleVerifyCredentials();
  console.log('');
  
  await exampleUpdateUser();
  console.log('');
  
  await exampleGetStats();
  console.log('');
  
  console.log('✅ Todos los ejemplos completados');
};
