/**
 * 📸 MIDDLEWARE DE SUBIDA DE AVATAR
 * 
 * 📝 DESCRIPCIÓN:
 * Middleware para manejar la subida de archivos de avatar usando multer.
 * Soporta formatos: JPEG, PNG, WebP
 * Tamaño máximo: 5MB
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../../config/environment';

// Crear directorio de uploads si no existe
const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp-userId-extension
    const userId = (req as any).user?.userId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `avatar-${userId}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

// Filtro de archivos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no válido. Use JPG, PNG o WebP'));
  }
};

// Configuración de multer
const multerInstance = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Middleware condicional: solo procesa si es multipart/form-data
export const uploadAvatar = (req: any, res: any, next: any) => {
  const contentType = req.headers['content-type'] || '';
  
  // Solo usar multer si es multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    multerInstance.single('avatar')(req, res, (err: any) => {
      if (err) {
        return next(err);
      }
      next();
    });
  } else {
    // Si no es multipart, continuar sin procesar archivo
    next();
  }
};

/**
 * Middleware para manejar errores de multer
 * Solo se ejecuta si hay un error (cuando next(err) es llamado)
 */
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  // Si no hay error, continuar
  if (!err) {
    return next();
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'El archivo excede el tamaño máximo de 5MB',
        errors: [
          {
            field: 'avatar',
            message: 'El archivo excede el tamaño máximo de 5MB'
          }
        ]
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Error al subir archivo',
      errors: [
        {
          field: 'avatar',
          message: err.message
        }
      ]
    });
  }
  
  // Errores de validación de tipo de archivo
  if (err.message && err.message.includes('Formato de imagen')) {
    return res.status(400).json({
      success: false,
      message: 'Error al procesar archivo',
      errors: [
        {
          field: 'avatar',
          message: err.message || 'Formato de imagen no válido'
        }
      ]
    });
  }
  
  // Para otros errores, pasar al siguiente middleware de errores
  next(err);
};

