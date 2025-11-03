'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Property, getLocationString } from '@/lib/api/properties';
import { useReservationCart } from '@/context/ReservationCartContext';

// Interfaz para las props del componente de sidebar de reserva
interface ReservationSidebarProps {
  property: Property;
}

// Componente de sidebar de reserva y disponibilidad
const ReservationSidebar = ({ property }: ReservationSidebarProps) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const { addToCart, isInCart } = useReservationCart();

  // Función para calcular el precio total basado en fechas y huéspedes
  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return 0;
    
    return nights * property.pricePerNight;
  };

  // Función para calcular impuestos (10% del total)
  const calculateTaxes = () => {
    const total = calculateTotal();
    return Math.round(total * 0.1);
  };

  // Función para calcular el total final con impuestos
  const calculateFinalTotal = () => {
    return calculateTotal() + calculateTaxes();
  };

  // Función para manejar la reserva - navega al checkout
  const handleReservation = () => {
    if (!checkIn || !checkOut) {
      alert('Por favor selecciona las fechas de check-in y check-out');
      return;
    }
    
    if (guests > property.maxGuests) {
      alert(`El máximo de huéspedes para esta propiedad es ${property.maxGuests}`);
      return;
    }
    
    // Navegar al checkout con los datos de la reserva
    const params = new URLSearchParams({
      propertyId: property.id,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests.toString()
    });
    
    router.push(`/checkout?${params.toString()}`);
  };

  // Función para agregar al carrito
  const handleAddToCart = async () => {
    if (!checkIn || !checkOut) {
      alert('Por favor selecciona las fechas de check-in y check-out');
      return;
    }
    
    if (guests > property.maxGuests) {
      alert(`El máximo de huéspedes para esta propiedad es ${property.maxGuests}`);
      return;
    }

    setIsAddingToCart(true);
    
    try {
      // El backend espera solo estos campos según la documentación:
      // { propertyId, checkIn, checkOut, guests, pricePerNight }
      const cartItem = {
        propertyId: property.id,
        checkIn,
        checkOut,
        guests,
        pricePerNight: property.pricePerNight,
      };

      await addToCart(cartItem);
      
      // Mostrar confirmación
      alert('¡Reserva agregada al carrito!');
      
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      alert('Error al agregar la reserva al carrito');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Función para calcular noches
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? nights : 0;
  };

  // Función para obtener la fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Función para obtener la fecha máxima (1 año desde hoy)
  const getMaxDate = () => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return oneYearFromNow.toISOString().split('T')[0];
  };

  const total = calculateTotal();
  const taxes = calculateTaxes();
  const finalTotal = calculateFinalTotal();

  return (
    <div className="reservation-sidebar bg-white border border-gray-200 rounded-2xl p-6 sticky top-6">
      {/* Sección de precio y rating */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-gray-900">€{property.pricePerNight}</span>
          <span className="text-gray-600">por noche</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="font-medium">{property.rating}</span>
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-600 underline cursor-pointer">
            {property.reviewCount} reseñas
          </span>
        </div>
      </div>

      {/* Selectores de fecha y huéspedes */}
      <div className="space-y-4 mb-6">
        {/* Selector de fechas */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in
            </label>
            <input 
              type="date" 
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out
            </label>
            <input 
              type="date" 
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || getMinDate()}
              max={getMaxDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Selector de huéspedes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Huéspedes
          </label>
          <select 
            value={guests} 
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: property.maxGuests }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} huésped{i + 1 > 1 ? 'es' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="space-y-3">
        {/* Botón de agregar al carrito */}
        {checkIn && checkOut && (
          <button 
            onClick={handleAddToCart}
            disabled={isAddingToCart || isInCart(property.id, checkIn, checkOut)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isAddingToCart
                ? 'bg-blue-500 text-white cursor-not-allowed'
                : isInCart(property.id, checkIn, checkOut)
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isAddingToCart 
              ? 'Agregando...' 
              : isInCart(property.id, checkIn, checkOut)
              ? '✓ En el carrito'
              : '🛒 Guardar en el Carrito'
            }
          </button>
        )}

        {/* Botón de reserva */}
        <button 
          onClick={handleReservation}
          disabled={!checkIn || !checkOut}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            checkIn && checkOut
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {checkIn && checkOut ? `Reservar - €${finalTotal}` : 'Selecciona fechas'}
        </button>
      </div>

      {/* Desglose de precios (solo si hay fechas seleccionadas) */}
      {checkIn && checkOut && total > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>€{property.pricePerNight} × {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} noches</span>
              <span>€{total}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Impuestos</span>
              <span>€{taxes}</span>
            </div>
            
            <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>€{finalTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
        <div className="space-y-2">
          <p>• Cancelación gratuita hasta 24 horas antes</p>
          <p>• No se requiere depósito de seguridad</p>
          {property.instantBook && (
            <p className="text-green-600 font-medium">• Reserva instantánea disponible</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationSidebar;
