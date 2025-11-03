import { Request, Response } from 'express';
import { findUserById, updateUser, updateUserPassword, hashPassword, comparePassword } from '../../models';
import { validateName, validatePassword } from '../../utils/validation';
import { UserSettingsModel } from '../../models/schemas/UserSettingsSchema';
import { UserModel } from '../../models/schemas/UserSchema';
import path from 'path';
import fs from 'fs';

// GET /api/profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Obtener datos directamente de MongoDB para asegurar valores actualizados (name, avatar)
    const fullUserDoc = await UserModel.findById(userId);
    
    if (!fullUserDoc) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    // Usar datos directamente de MongoDB para asegurar name y avatar actualizados
    res.json({
      success: true,
      data: {
        user: {
          id: String(fullUserDoc._id),
          email: fullUserDoc.email,
          name: fullUserDoc.name || '', // Asegurar que name siempre existe
          avatar: fullUserDoc.avatar || null,
          description: fullUserDoc.description || null,
          bio: (fullUserDoc as any).bio || null,
          location: (fullUserDoc as any).location || null,
          phone: (fullUserDoc as any).phone || null,
          role: fullUserDoc.role || 'user',
          isActive: fullUserDoc.isActive !== false,
          createdAt: fullUserDoc.createdAt?.toISOString() || new Date().toISOString()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo perfil' }
    });
  }
};

// PATCH /api/profile - Endpoint unificado según requisitos del frontend
export const patchProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Token de autorización requerido'
      });
      return;
    }

    // Obtener usuario
    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Determinar tipo de contenido
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
    
    const updateData: any = {};
    const errors: Array<{ field: string; message: string }> = [];

    // Procesar name (si viene en request)
    // Con FormData, req.body.name puede venir como string
    // Con JSON, req.body.name viene directamente
    let nameValue = req.body.name;
    if (nameValue !== undefined) {
      // Convertir a string y trim si es necesario
      if (typeof nameValue !== 'string') {
        nameValue = String(nameValue);
      }
      const name = nameValue.trim();
      if (name && name.length > 0 && name.length <= 100) {
        updateData.name = name;
      } else if (name && name.length > 100) {
        errors.push({
          field: 'name',
          message: 'El nombre debe tener entre 1 y 100 caracteres'
        });
      } else if (req.body.name !== null && req.body.name !== '') {
        errors.push({
          field: 'name',
          message: 'El nombre no puede estar vacío'
        });
      }
    }

    // Procesar description (si viene en request)
    if (req.body.description !== undefined) {
      // Convertir a string si es necesario (FormData siempre envía strings)
      let descValue = req.body.description;
      if (descValue === null || descValue === '') {
        updateData.description = null;
      } else {
        if (typeof descValue !== 'string') {
          descValue = String(descValue);
        }
        const description = descValue.trim();
        if (description.length <= 500) {
          updateData.description = description || null;
        } else {
          errors.push({
            field: 'description',
            message: 'La descripción no puede exceder 500 caracteres'
          });
        }
      }
    }

    // Procesar avatar
    // Si viene archivo en req.file (multer), procesarlo
    if ((req as any).file) {
      const file = (req as any).file;
      
      // Validar tipo MIME
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        errors.push({
          field: 'avatar',
          message: 'Formato de imagen no válido. Use JPG, PNG o WebP'
        });
      }

      // Validar tamaño (ya validado por multer, pero verificamos)
      if (file.size > 5 * 1024 * 1024) {
        errors.push({
          field: 'avatar',
          message: 'El archivo excede el tamaño máximo de 5MB'
        });
      }

      if (errors.length === 0) {
        // Generar URL del avatar
        // En producción, aquí subirías a Cloudinary/S3 y obtendrías la URL
        // Por ahora, usamos la ruta relativa (el servidor estático la sirve)
        const protocol = req.protocol;
        const host = req.get('host');
        const avatarUrl = `${protocol}://${host}/uploads/avatars/${file.filename}`;
        updateData.avatar = avatarUrl;

        // Eliminar avatar anterior si existe
        if (user.avatar) {
          let oldAvatarPath: string;
          // Manejar URLs absolutas y relativas
          if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
            // Extraer el nombre del archivo de la URL
            const fileName = user.avatar.split('/').pop();
            if (fileName) {
              oldAvatarPath = path.join(process.cwd(), 'uploads', 'avatars', fileName);
            } else {
              oldAvatarPath = '';
            }
          } else if (user.avatar.startsWith('/uploads/avatars/')) {
            oldAvatarPath = path.join(process.cwd(), user.avatar);
          } else {
            // Asumir que es solo el nombre del archivo
            oldAvatarPath = path.join(process.cwd(), 'uploads', 'avatars', user.avatar);
          }
          
          if (oldAvatarPath && fs.existsSync(oldAvatarPath)) {
            try {
              fs.unlinkSync(oldAvatarPath);
            } catch (err) {
              console.error('Error eliminando avatar anterior:', err);
              // No fallar si no se puede eliminar
            }
          }
        }
      }
    } else if (req.body.avatar !== undefined) {
      // Si viene como URL string (base64 o URL)
      if (typeof req.body.avatar === 'string') {
        if (req.body.avatar.startsWith('data:image/')) {
          // Base64 - aquí podrías procesarlo y guardarlo
          // Por simplicidad, rechazamos base64 por ahora o lo guardamos
          updateData.avatar = req.body.avatar; // O procesar base64
        } else {
          updateData.avatar = req.body.avatar;
        }
      }
    }

    // Si hay errores, retornarlos
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
      return;
    }

    // Verificar que hay algo que actualizar
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No hay campos válidos para actualizar'
      });
      return;
    }

    // Actualizar usuario en MongoDB
    const updatedUser = await updateUser(userId, updateData);
    
    if (!updatedUser) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
      return;
    }

    // Obtener usuario completo directamente de MongoDB para asegurar datos actualizados
    // Esto garantiza que obtenemos los valores más recientes de name, avatar, description
    const fullUserDoc = await UserModel.findById(userId);
    
    if (!fullUserDoc) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }
    
    // Retornar respuesta exitosa según formato especificado
    // Usar datos directamente de MongoDB para asegurar valores actualizados
    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: String(fullUserDoc._id),
        name: fullUserDoc.name || '', // Asegurar que name siempre existe y está actualizado
        email: fullUserDoc.email,
        description: fullUserDoc.description || null,
        avatar: fullUserDoc.avatar || null, // Asegurar que avatar está actualizado
        updatedAt: (fullUserDoc as any).updatedAt?.toISOString() || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// PUT /api/profile (mantener para compatibilidad)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { name, avatar, bio, location, phone } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    // Validaciones
    if (name && !validateName(name)) {
      res.status(400).json({
        success: false,
        error: { message: 'Nombre debe tener mínimo 2 caracteres' }
      });
      return;
    }

    // Actualizar datos
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (avatar) updateData.avatar = avatar;
    if (bio) updateData.bio = bio.trim();
    if (location) updateData.location = location.trim();
    if (phone) updateData.phone = phone.trim();

    const updatedUser = await updateUser(userId, updateData);
    
    if (!updatedUser) {
      res.status(500).json({
        success: false,
        error: { message: 'Error actualizando perfil' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          avatar: updatedUser.avatar,
          bio: (updatedUser as any).bio,
          location: (updatedUser as any).location,
          phone: (updatedUser as any).phone,
          createdAt: updatedUser.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando perfil' }
    });
  }
};

// POST /api/profile/change-password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validaciones
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: { message: 'Contraseña actual y nueva contraseña son requeridas' }
      });
      return;
    }

    // Validar confirmación de contraseña
    if (confirmPassword && newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        error: { message: 'Las contraseñas no coinciden' }
      });
      return;
    }

    if (!validatePassword(newPassword)) {
      res.status(400).json({
        success: false,
        error: { message: 'Nueva contraseña debe tener mínimo 8 caracteres' }
      });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        success: false,
        error: { message: 'La nueva contraseña debe ser diferente a la actual' }
      });
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    // Verificar contraseña actual
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: { message: 'Contraseña actual incorrecta' }
      });
      return;
    }

    // Actualizar contraseña
    const hashedNewPassword = await hashPassword(newPassword);
    await updateUserPassword(userId, hashedNewPassword);

    res.json({
      success: true,
      data: { message: 'Contraseña actualizada exitosamente' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error cambiando contraseña' }
    });
  }
};

// GET /api/profile/settings
export const getProfileSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    // Obtener configuración de BD o crear valores por defecto
    let userSettings = await UserSettingsModel.findOne({ userId });
    
    if (!userSettings) {
      // Crear configuración por defecto si no existe
      userSettings = await UserSettingsModel.create({
        userId,
        notifications: {
          email: true,
          push: true,
          sound: true,
          marketing: false,
          propertyUpdates: true,
          searchAlerts: true,
          muteAll: false
        },
        privacy: {
          showProfile: true,
          showEmail: false,
          showPhone: false,
          showLocation: true
        },
        preferences: {
          language: 'es',
          timezone: 'America/Mexico_City',
          currency: 'MXN',
          theme: 'light'
        }
      });
    }

    res.json({
      success: true,
      data: { 
        settings: {
          notifications: userSettings.notifications,
          privacy: userSettings.privacy,
          preferences: userSettings.preferences
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo configuración' }
    });
  }
};

// PUT /api/profile/settings
export const updateProfileSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { notifications, privacy, preferences } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Preparar actualización
    const updateData: any = {};
    
    if (notifications) {
      updateData['notifications.email'] = Boolean(notifications.email);
      updateData['notifications.push'] = Boolean(notifications.push);
      updateData['notifications.sound'] = Boolean(notifications.sound);
      updateData['notifications.marketing'] = Boolean(notifications.marketing);
      updateData['notifications.propertyUpdates'] = Boolean(notifications.propertyUpdates);
      updateData['notifications.searchAlerts'] = Boolean(notifications.searchAlerts);
      updateData['notifications.muteAll'] = Boolean(notifications.muteAll);
    }
    
    if (privacy) {
      updateData['privacy.showProfile'] = Boolean(privacy.showProfile);
      updateData['privacy.showEmail'] = Boolean(privacy.showEmail);
      updateData['privacy.showPhone'] = Boolean(privacy.showPhone);
      updateData['privacy.showLocation'] = Boolean(privacy.showLocation);
    }
    
    if (preferences) {
      if (preferences.language) updateData['preferences.language'] = preferences.language;
      if (preferences.timezone) updateData['preferences.timezone'] = preferences.timezone;
      if (preferences.currency) updateData['preferences.currency'] = preferences.currency;
      if (preferences.theme) updateData['preferences.theme'] = preferences.theme;
    }

    // Actualizar o crear en BD
    const userSettings = await UserSettingsModel.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: { 
        settings: {
          notifications: userSettings.notifications,
          privacy: userSettings.privacy,
          preferences: userSettings.preferences
        },
        message: 'Configuración actualizada exitosamente'
      }
    });
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando configuración' }
    });
  }
};