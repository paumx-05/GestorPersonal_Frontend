/**
 * MIDDLEWARE DE VALIDACIÓN PARA USUARIOS
 * Valida datos de entrada para operaciones CRUD de usuarios
 */

import { Request, Response, NextFunction } from 'express';

// =============================================================================
// INTERFACES
// =============================================================================

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// =============================================================================
// FUNCIONES DE VALIDACIÓN
// =============================================================================

/**
 * Valida formato de email
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida fortaleza de contraseña
 */
const validatePassword = (password: string): boolean => {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Valida nombre de usuario
 */
const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

/**
 * Sanitiza entrada de texto
 */
const sanitizeText = (text: string): string => {
  return text.trim().replace(/[<>]/g, '');
};

// =============================================================================
// MIDDLEWARE DE VALIDACIÓN
// =============================================================================

/**
 * Valida datos para crear usuario
 */
export const validateCreateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { email, name, password } = req.body;
  const errors: ValidationError[] = [];

  // Validar campos requeridos
  if (!email) {
    errors.push({ field: 'email', message: 'Email es requerido' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Formato de email inválido' });
  }

  if (!name) {
    errors.push({ field: 'name', message: 'Nombre es requerido' });
  } else if (!validateName(name)) {
    errors.push({ field: 'name', message: 'Nombre debe tener entre 2 y 50 caracteres' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Contraseña es requerida' });
  } else if (!validatePassword(password)) {
    errors.push({ 
      field: 'password', 
      message: 'Contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número' 
    });
  }

  // Validar avatar si está presente
  if (req.body.avatar && typeof req.body.avatar !== 'string') {
    errors.push({ field: 'avatar', message: 'Avatar debe ser una URL válida' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Datos de validación inválidos',
      details: errors
    });
    return;
  }

  // Sanitizar datos
  req.body.email = sanitizeText(email).toLowerCase();
  req.body.name = sanitizeText(name);
  if (req.body.avatar) {
    req.body.avatar = sanitizeText(req.body.avatar);
  }

  next();
};

/**
 * Valida datos para actualizar usuario
 */
export const validateUpdateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { email, name, avatar, isActive } = req.body;
  const errors: ValidationError[] = [];

  // Validar email si está presente
  if (email !== undefined) {
    if (!validateEmail(email)) {
      errors.push({ field: 'email', message: 'Formato de email inválido' });
    }
  }

  // Validar nombre si está presente
  if (name !== undefined) {
    if (!validateName(name)) {
      errors.push({ field: 'name', message: 'Nombre debe tener entre 2 y 50 caracteres' });
    }
  }

  // Validar avatar si está presente
  if (avatar !== undefined && avatar !== null && typeof avatar !== 'string') {
    errors.push({ field: 'avatar', message: 'Avatar debe ser una URL válida' });
  }

  // Validar isActive si está presente
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    errors.push({ field: 'isActive', message: 'isActive debe ser un valor booleano' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Datos de validación inválidos',
      details: errors
    });
    return;
  }

  // Sanitizar datos
  if (email) {
    req.body.email = sanitizeText(email).toLowerCase();
  }
  if (name) {
    req.body.name = sanitizeText(name);
  }
  if (avatar) {
    req.body.avatar = sanitizeText(avatar);
  }

  next();
};

/**
 * Valida ID de usuario en parámetros
 */
export const validateUserId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      error: 'ID de usuario requerido'
    });
    return;
  }

  if (typeof id !== 'string' || id.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'ID de usuario inválido'
    });
    return;
  }

  req.params.id = id.trim();
  next();
};

/**
 * Valida parámetros de paginación
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const { page, limit, search } = req.query;
  const errors: ValidationError[] = [];

  // Validar page
  if (page !== undefined) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push({ field: 'page', message: 'Page debe ser un número mayor a 0' });
    } else {
      req.query.page = pageNum.toString();
    }
  }

  // Validar limit
  if (limit !== undefined) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push({ field: 'limit', message: 'Limit debe ser un número entre 1 y 100' });
    } else {
      req.query.limit = limitNum.toString();
    }
  }

  // Validar search
  if (search !== undefined && typeof search !== 'string') {
    errors.push({ field: 'search', message: 'Search debe ser una cadena de texto' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Parámetros de consulta inválidos',
      details: errors
    });
    return;
  }

  // Sanitizar search
  if (search) {
    req.query.search = sanitizeText(search as string);
  }

  next();
};
