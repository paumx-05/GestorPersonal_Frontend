import { CheckoutData, PaymentValidationResult } from '../types/payments';

export const validateCheckoutData = (data: CheckoutData): PaymentValidationResult => {
  const errors: string[] = [];

  // Validar datos de la propiedad
  if (!data.propertyId) {
    errors.push('ID de propiedad requerido');
  }

  // Validar fechas
  const checkInDate = new Date(data.checkIn);
  const checkOutDate = new Date(data.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    errors.push('La fecha de check-in no puede ser en el pasado');
  }

  if (checkOutDate <= checkInDate) {
    errors.push('La fecha de check-out debe ser posterior al check-in');
  }

  if (data.guests < 1 || data.guests > 16) {
    errors.push('Número de huéspedes inválido (1-16)');
  }

  // Validar información del huésped
  if (!data.guestInfo.firstName || data.guestInfo.firstName.trim().length < 2) {
    errors.push('Nombre requerido (mínimo 2 caracteres)');
  }

  if (!data.guestInfo.lastName || data.guestInfo.lastName.trim().length < 2) {
    errors.push('Apellido requerido (mínimo 2 caracteres)');
  }

  if (!data.guestInfo.email || !isValidEmail(data.guestInfo.email)) {
    errors.push('Email inválido');
  }

  if (!data.guestInfo.phone || !isValidPhone(data.guestInfo.phone)) {
    errors.push('Teléfono inválido');
  }

  // Validar información de pago
  const paymentValidation = validatePaymentInfo(data.paymentInfo);
  errors.push(...paymentValidation.errors);

  // Validar dirección de facturación
  const addressValidation = validateBillingAddress(data.paymentInfo.billingAddress);
  errors.push(...addressValidation.errors);

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePaymentInfo = (paymentInfo: CheckoutData['paymentInfo']): PaymentValidationResult => {
  const errors: string[] = [];

  // Validar número de tarjeta
  const cardNumber = paymentInfo.cardNumber.replace(/\s/g, '');
  if (!isValidCardNumber(cardNumber)) {
    errors.push('Número de tarjeta inválido');
  }

  // Validar fecha de expiración
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  if (paymentInfo.expiryYear < currentYear || 
      (paymentInfo.expiryYear === currentYear && paymentInfo.expiryMonth < currentMonth)) {
    errors.push('Tarjeta expirada');
  }

  if (paymentInfo.expiryMonth < 1 || paymentInfo.expiryMonth > 12) {
    errors.push('Mes de expiración inválido');
  }

  // Validar CVV
  if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
    errors.push('CVV inválido');
  }

  // Validar nombre del titular
  if (!paymentInfo.cardholderName || paymentInfo.cardholderName.trim().length < 2) {
    errors.push('Nombre del titular requerido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateBillingAddress = (address: CheckoutData['paymentInfo']['billingAddress']): PaymentValidationResult => {
  const errors: string[] = [];

  if (!address.street || address.street.trim().length < 5) {
    errors.push('Dirección requerida (mínimo 5 caracteres)');
  }

  if (!address.city || address.city.trim().length < 2) {
    errors.push('Ciudad requerida');
  }

  if (!address.state || address.state.trim().length < 2) {
    errors.push('Estado requerido');
  }

  if (!address.zipCode || !/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
    errors.push('Código postal inválido');
  }

  if (!address.country || address.country.trim().length < 2) {
    errors.push('País requerido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Funciones auxiliares
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const isValidCardNumber = (cardNumber: string): boolean => {
  // Implementar algoritmo de Luhn
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};
