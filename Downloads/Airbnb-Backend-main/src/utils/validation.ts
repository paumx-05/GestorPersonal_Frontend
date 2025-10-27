export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return Boolean(password && password.length >= 6);
};

export const validateName = (name: string): boolean => {
  return Boolean(name && name.trim().length >= 2);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): string[] => {
  const missingFields: string[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missingFields.push(field);
    }
  });
  
  return missingFields;
};

export const validateStringLength = (value: string, min: number, max?: number): boolean => {
  if (value.length < min) return false;
  if (max && value.length > max) return false;
  return true;
};
