import { Request, Response } from 'express';
import { findUserByEmail, createUser, findUserById, updateUserPassword, hashPassword, comparePassword, isPasswordValid } from '../../models';
import { generateToken, refreshToken } from '../../utils/jwt';
import { validateEmail, validateName, validateRequiredFields, sanitizeInput } from '../../utils/validation';
// Removed emailMock import - using Resend directly
import { generateResetToken, verifyResetToken, invalidateResetToken, getActiveTokensCount } from '../../utils/resetToken';
import { AuthResponse } from '../../types/auth';
import { Resend } from 'resend';
import { UserModel } from '../../models/schemas/UserSchema';

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validar campos requeridos
    const missingFields = validateRequiredFields(req.body, ['email', 'password', 'name']);
    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: { message: `Campos requeridos: ${missingFields.join(', ')}` }
      });
      return;
    }

    // Sanitizar inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);

    // Validaciones
    if (!validateEmail(sanitizedEmail)) {
      res.status(400).json({
        success: false,
        error: { message: 'Email inválido' }
      });
      return;
    }

    if (!isPasswordValid(password)) {
      res.status(400).json({
        success: false,
        error: { message: 'La contraseña debe tener al menos 8 caracteres' }
      });
      return;
    }

    if (!validateName(sanitizedName)) {
      res.status(400).json({
        success: false,
        error: { message: 'Nombre debe tener mínimo 2 caracteres' }
      });
      return;
    }

    // Verificar si usuario ya existe
    const existingUser = await findUserByEmail(sanitizedEmail);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: { message: 'Usuario ya existe' }
      });
      return;
    }

    // Crear usuario - el repositorio se encarga del hash de la contraseña
    const newUser = await createUser({
      email: sanitizedEmail,
      password: password, // Enviar contraseña en texto plano
      name: sanitizedName
    });

    // Generar token
    const token = generateToken(newUser.id, newUser.email);

    const response: AuthResponse = {
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar,
          role: newUser.role || 'user'
        },
        token
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error en register:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    const missingFields = validateRequiredFields(req.body, ['email', 'password']);
    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: { message: `Campos requeridos: ${missingFields.join(', ')}` }
      });
      return;
    }

    // Sanitizar email
    const sanitizedEmail = sanitizeInput(email);

    // Validar formato de email
    if (!validateEmail(sanitizedEmail)) {
      res.status(400).json({
        success: false,
        error: { message: 'Email inválido' }
      });
      return;
    }

    // Buscar usuario para verificar credenciales
    const user = await findUserByEmail(sanitizedEmail);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Credenciales inválidas' }
      });
      return;
    }

    // Verificar password usando la función correcta
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: { message: 'Credenciales inválidas' }
      });
      return;
    }

    // Verificar si usuario está activo
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: { message: 'Cuenta desactivada' }
      });
      return;
    }

    // Obtener usuario completo directamente de MongoDB para asegurar datos actualizados (name, avatar)
    const userDoc = await UserModel.findById(user.id);
    
    if (!userDoc) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    // Generar token
    const token = generateToken(user.id, user.email);

    // Asegurar que name y avatar siempre se devuelven (pueden ser null)
    const response: AuthResponse = {
      success: true,
      data: {
        user: {
          id: String(userDoc._id),
          email: userDoc.email,
          name: userDoc.name || '', // Asegurar que name siempre existe
          avatar: userDoc.avatar || undefined, // Convertir null a undefined para compatibilidad con interfaz
          role: userDoc.role || 'user'
        },
        token
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// POST /api/auth/logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // En un sistema real, aquí invalidaríamos el token
    // Para mock, simplemente confirmamos el logout
    res.json({
      success: true,
      data: { message: 'Logout exitoso' }
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// GET /api/auth/me
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Token inválido' }
      });
      return;
    }

    // Obtener usuario directamente de MongoDB para asegurar datos actualizados
    const userDoc = await UserModel.findById(userId);
    
    if (!userDoc) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    // Asegurar que name y avatar siempre se devuelven (pueden ser null)
    res.json({
      success: true,
      data: {
        user: {
          id: String(userDoc._id),
          email: userDoc.email,
          name: userDoc.name || '', // Asegurar que name siempre existe
          avatar: userDoc.avatar || undefined, // Convertir null a undefined para compatibilidad
          description: userDoc.description || null,
          role: userDoc.role || 'user',
          createdAt: userDoc.createdAt?.toISOString() || new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    // Validar email
    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        error: { message: 'Email inválido' }
      });
      return;
    }
    
    // Buscar usuario
    const user = await findUserByEmail(email);
    
    if (user && user.isActive) {
      // Generar token de reset
      const resetToken = generateResetToken(user.id, user.email);
      
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/reset-password?token=${resetToken}`;
      
      console.log(resetLink);
      // Token generado (sin mostrar en consola)
      
      // También escribir en archivo para debugging
      const fs = require('fs');
      fs.writeFileSync('reset-token.txt', resetLink);
      
      // Enviar email usando Resend
      try {
        const resend = new Resend(process.env.RESEND_API_KEY || 're_xxxxxxxxx');
        const emailResult = await resend.emails.send({
          from: 'Airbnb <onboarding@resend.dev>',
          to: ['delivered@resend.dev'],
          subject: 'Recuperación de contraseña - Airbnb',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #FF385C;">Recuperación de contraseña</h2>
              <p>Hola,</p>
              <p>Recibiste este email porque solicitaste recuperar tu contraseña para tu cuenta de Airbnb.</p>
              <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background: #FF385C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Restablecer contraseña
                </a>
              </div>
              <p><strong>Este enlace expirará en 24 horas.</strong></p>
              <p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">
                Saludos,<br>
                El equipo de Airbnb
              </p>
            </div>
          `
        });
        
      } catch (emailError: any) {
        // No fallar el proceso por error de email
      }
    }
    
    // Siempre devolver éxito por seguridad (no revelar si email existe)
    res.json({
      success: true,
      data: {
        message: 'Si el email está registrado, recibirás instrucciones para recuperar tu contraseña'
      }
    });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    
    // Validar datos
    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: { message: 'Token y nueva contraseña son requeridos' }
      });
      return;
    }
    
    if (!isPasswordValid(newPassword)) {
      res.status(400).json({
        success: false,
        error: { message: 'La nueva contraseña debe tener al menos 8 caracteres' }
      });
      return;
    }
    
    // Verificar token
    console.log('Token recibido:', token);
    
    // Decodificar URL si es necesario
    const cleanToken = decodeURIComponent(token);
    console.log('Token limpio:', cleanToken);
    
    // Debug: verificar si el token está en memoria
    console.log('Tokens activos en memoria:', getActiveTokensCount());
    
    const decoded = verifyResetToken(cleanToken);
    console.log('Token decodificado:', decoded);
    if (!decoded) {
      res.status(400).json({
        success: false,
        error: { message: 'Token inválido o expirado' }
      });
      return;
    }
    
    // Buscar usuario
    const user = await findUserById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    // Actualizar contraseña
    const hashedPassword = await hashPassword(newPassword);
    
    const updatedUser = await updateUserPassword(user.id, hashedPassword);
    
    // Invalidar token usado
    invalidateResetToken(cleanToken);
    
    res.json({
      success: true,
      data: {
        message: 'Contraseña restablecida exitosamente'
      }
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// POST /api/auth/refresh
export const refreshTokenEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    
    // Validar que se proporcione el token
    if (!token) {
      res.status(400).json({
        success: false,
        error: { message: 'Token requerido' }
      });
      return;
    }
    
    // Intentar refrescar el token
    const newToken = refreshToken(token);
    
    if (!newToken) {
      res.status(401).json({
        success: false,
        error: { message: 'Token inválido o expirado' }
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        token: newToken,
        message: 'Token renovado exitosamente'
      }
    });
  } catch (error) {
    console.error('Error en refreshToken:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};
