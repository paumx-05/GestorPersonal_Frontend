import { Request, Response } from 'express';
import { findUserById, updateUser, updateUserPassword, hashPassword, comparePassword } from '../../models';
import { validateName, validatePassword } from '../../utils/validation';
import { UserSettingsModel } from '../../models/schemas/UserSettingsSchema';

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

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          bio: (user as any).bio,
          location: (user as any).location,
          phone: (user as any).phone,
          role: (user as any).role,
          isActive: user.isActive,
          createdAt: user.createdAt
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

// PUT /api/profile
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