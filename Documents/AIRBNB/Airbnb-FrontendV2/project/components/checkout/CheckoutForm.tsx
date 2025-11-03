'use client';

import { useState } from 'react';
import { User, Mail, Phone, CreditCard, Calendar, MessageSquare } from 'lucide-react';
import { type GuestInfo } from '@/lib/reservation-mock';

interface CheckoutFormProps {
  onSubmit: (guestInfo: GuestInfo) => void;
}

export default function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const [formData, setFormData] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'credit',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validaciones básicas
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.length < 2 ? 'Debe tener al menos 2 caracteres' : '';
      case 'email':
        return !value.includes('@') ? 'Email válido requerido' : '';
      case 'phone':
        return value.length < 10 ? 'Número de teléfono válido requerido' : '';
      case 'cardNumber':
        return value.replace(/\s/g, '').length < 16 ? 'Número de tarjeta válido requerido' : '';
      case 'expiryDate':
        return !value.match(/^(0[1-9]|1[0-2])\/\d{2}$/) ? 'Formato MM/AA requerido' : '';
      case 'cvv':
        return value.length < 3 ? 'CVV válido requerido' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Formatear número de tarjeta con espacios
    let formattedValue = value;
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    
    // Formatear fecha de expiración
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Validar campo en tiempo real
    const error = validateField(name, formattedValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validar todos los campos
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'specialRequests') return; // Campo opcional
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información personal */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Información del huésped
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tu nombre"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tu apellido"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>
      </section>

      {/* Información de contacto */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Información de contacto
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>
      </section>

      {/* Información de pago */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Información de pago
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de pago
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
            >
              <option value="credit">Tarjeta de crédito</option>
              <option value="debit">Tarjeta de débito</option>
            </select>
          </div>

          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número de tarjeta *
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de expiración *
              </label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="MM/AA"
                maxLength={5}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                CVV *
              </label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent ${
                  errors.cvv ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123"
                maxLength={4}
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Solicitudes especiales */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Solicitudes especiales (opcional)
        </h3>
        
        <div>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
            placeholder="¿Hay algo que el anfitrión deba saber? (ej: llegada tardía, necesidades especiales, etc.)"
          />
        </div>
      </section>

      {/* Botón de envío */}
      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#FF385C] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#E31C5F] focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Procesando reserva...
            </div>
          ) : (
            `Confirmar reserva por $${formData.paymentMethod === 'credit' ? '1,300' : '1,300'}`
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          Al confirmar, aceptas nuestros términos de servicio y política de cancelación
        </p>
      </div>
    </form>
  );
}
