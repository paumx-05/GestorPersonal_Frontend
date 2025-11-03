// src/utils/cartValidation.ts
// Validaciones para el sistema de carrito de reservas

import { CartValidationResult, AddToCartRequest, UpdateCartItemRequest, AvailabilityCheckRequest } from '../types/cart';

// Función para validar fechas
export const validateDates = (checkIn: string, checkOut: string): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Verificar que las fechas sean válidas
  if (isNaN(checkInDate.getTime())) {
    errors.push('Fecha de check-in inválida');
  }
  
  if (isNaN(checkOutDate.getTime())) {
    errors.push('Fecha de check-out inválida');
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }
  
  // Verificar que check-in no sea en el pasado
  if (checkInDate < today) {
    errors.push('La fecha de check-in no puede ser en el pasado');
  }
  
  // Verificar que check-out sea después de check-in
  if (checkOutDate <= checkInDate) {
    errors.push('La fecha de check-out debe ser después de la fecha de check-in');
  }
  
  // Verificar duración mínima de estancia
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  if (nights < 1) {
    errors.push('La estancia debe ser de al menos 1 noche');
  }
  
  // Verificar duración máxima de estancia
  if (nights > 30) {
    warnings.push('La estancia es muy larga (más de 30 noches)');
  }
  
  // Verificar que no sea más de 6 meses en el futuro
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  if (checkInDate > sixMonthsFromNow) {
    warnings.push('La fecha de check-in es muy lejana (más de 6 meses)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Función para validar número de huéspedes
export const validateGuests = (guests: number, maxGuests: number = 8): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!Number.isInteger(guests) || guests < 1) {
    errors.push('El número de huéspedes debe ser un número entero mayor a 0');
  }
  
  if (guests > maxGuests) {
    errors.push(`El número de huéspedes no puede exceder ${maxGuests}`);
  }
  
  if (guests > 6) {
    warnings.push('Número alto de huéspedes, verificar capacidad de la propiedad');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Función para validar precio por noche
export const validatePrice = (pricePerNight: number): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (typeof pricePerNight !== 'number' || pricePerNight <= 0) {
    errors.push('El precio por noche debe ser un número mayor a 0');
  }
  
  if (pricePerNight > 1000) {
    warnings.push('Precio muy alto por noche');
  }
  
  if (pricePerNight < 20) {
    warnings.push('Precio muy bajo por noche');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Función para validar ID de propiedad
export const validatePropertyId = (propertyId: string): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!propertyId || typeof propertyId !== 'string') {
    errors.push('ID de propiedad es requerido');
  }
  
  if (propertyId.length < 1) {
    errors.push('ID de propiedad no puede estar vacío');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Función para validar request de agregar al carrito
export const validateAddToCartRequest = (request: AddToCartRequest): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validar propiedad
  const propertyValidation = validatePropertyId(request.propertyId);
  errors.push(...propertyValidation.errors);
  warnings.push(...propertyValidation.warnings);
  
  // Validar fechas
  const datesValidation = validateDates(request.checkIn, request.checkOut);
  errors.push(...datesValidation.errors);
  warnings.push(...datesValidation.warnings);
  
  // Validar huéspedes
  const guestsValidation = validateGuests(request.guests);
  errors.push(...guestsValidation.errors);
  warnings.push(...guestsValidation.warnings);
  
  // Validar precio
  const priceValidation = validatePrice(request.pricePerNight);
  errors.push(...priceValidation.errors);
  warnings.push(...priceValidation.warnings);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Función para validar request de actualización
export const validateUpdateCartItemRequest = (request: UpdateCartItemRequest): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Si se proporcionan fechas, validarlas
  if (request.checkIn && request.checkOut) {
    const datesValidation = validateDates(request.checkIn, request.checkOut);
    errors.push(...datesValidation.errors);
    warnings.push(...datesValidation.warnings);
  }
  
  // Si se proporciona número de huéspedes, validarlo
  if (request.guests !== undefined) {
    const guestsValidation = validateGuests(request.guests);
    errors.push(...guestsValidation.errors);
    warnings.push(...guestsValidation.warnings);
  }
  
  // Si se proporciona precio, validarlo
  if (request.pricePerNight !== undefined) {
    const priceValidation = validatePrice(request.pricePerNight);
    errors.push(...priceValidation.errors);
    warnings.push(...priceValidation.warnings);
  }
  
  // Verificar que al menos un campo sea proporcionado
  if (!request.checkIn && !request.checkOut && request.guests === undefined && request.pricePerNight === undefined) {
    errors.push('Al menos un campo debe ser proporcionado para actualizar');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Función para validar request de verificación de disponibilidad
export const validateAvailabilityRequest = (request: AvailabilityCheckRequest): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validar propiedad
  const propertyValidation = validatePropertyId(request.propertyId);
  errors.push(...propertyValidation.errors);
  warnings.push(...propertyValidation.warnings);
  
  // Validar fechas
  const datesValidation = validateDates(request.checkIn, request.checkOut);
  errors.push(...datesValidation.errors);
  warnings.push(...datesValidation.warnings);
  
  // Validar huéspedes
  const guestsValidation = validateGuests(request.guests);
  errors.push(...guestsValidation.errors);
  warnings.push(...guestsValidation.warnings);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Función para validar ID de usuario
export const validateUserId = (userId: string): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!userId || typeof userId !== 'string') {
    errors.push('ID de usuario es requerido');
  }
  
  if (userId.length < 1) {
    errors.push('ID de usuario no puede estar vacío');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Función para validar ID de item del carrito
export const validateCartItemId = (itemId: string): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!itemId || typeof itemId !== 'string') {
    errors.push('ID de item del carrito es requerido');
  }
  
  if (itemId.length < 1) {
    errors.push('ID de item del carrito no puede estar vacío');
  }
  
  if (!itemId.startsWith('cart_')) {
    warnings.push('ID de item del carrito tiene formato inesperado');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Función para calcular días entre fechas
export const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Función para verificar si una fecha está en el futuro
export const isDateInFuture = (date: string): boolean => {
  const checkDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkDate >= today;
};

// Función para formatear fecha para display
export const formatDateForDisplay = (date: string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para obtener días restantes hasta expiración
export const getDaysUntilExpiration = (expiresAt: string): number => {
  const expirationDate = new Date(expiresAt);
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
