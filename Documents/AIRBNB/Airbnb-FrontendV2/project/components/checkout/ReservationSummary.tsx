'use client';

import { Calendar, Users, Home, Shield, CreditCard } from 'lucide-react';
import { type Property, type ReservationData } from '@/lib/reservation-mock';

interface ReservationSummaryProps {
  property: Property;
  reservationData: ReservationData;
}

export default function ReservationSummary({ property, reservationData }: ReservationSummaryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Imagen de la propiedad */}
      <div className="mb-4">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      {/* Título y ubicación */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{property.title}</h3>
        <p className="text-gray-600 text-sm">{property.location}</p>
      </div>

      {/* Detalles de la reserva */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          <div>
            <p className="font-medium text-gray-900">Check-in</p>
            <p className="text-gray-600">{formatDate(reservationData.checkIn)}</p>
          </div>
        </div>

        <div className="flex items-center text-sm">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          <div>
            <p className="font-medium text-gray-900">Check-out</p>
            <p className="text-gray-600">{formatDate(reservationData.checkOut)}</p>
          </div>
        </div>

        <div className="flex items-center text-sm">
          <Users className="w-4 h-4 text-gray-500 mr-2" />
          <div>
            <p className="font-medium text-gray-900">Huéspedes</p>
            <p className="text-gray-600">{reservationData.guests} huésped{reservationData.guests > 1 ? 'es' : ''}</p>
          </div>
        </div>

        <div className="flex items-center text-sm">
          <Home className="w-4 h-4 text-gray-500 mr-2" />
          <div>
            <p className="font-medium text-gray-900">Propiedad</p>
            <p className="text-gray-600">{property.bedrooms} habitaciones, {property.bathrooms} baños</p>
          </div>
        </div>
      </div>

      {/* Desglose de precios */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Desglose de precios</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              ${property.pricePerNight} × {reservationData.totalNights} noche{reservationData.totalNights > 1 ? 's' : ''}
            </span>
            <span className="text-gray-900">{formatCurrency(reservationData.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Tarifa de limpieza</span>
            <span className="text-gray-900">{formatCurrency(reservationData.cleaningFee)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Tarifa de servicio</span>
            <span className="text-gray-900">{formatCurrency(reservationData.serviceFee)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Impuestos</span>
            <span className="text-gray-900">{formatCurrency(reservationData.taxes)}</span>
          </div>

          <div className="border-t border-gray-200 pt-2 mt-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-semibold text-gray-900 text-lg">{formatCurrency(reservationData.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información de seguridad */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-start space-x-2 text-xs text-gray-600">
          <Shield className="w-4 h-4 mt-0.5 text-green-600" />
          <div>
            <p className="font-medium text-gray-900 mb-1">Tu reserva está protegida</p>
            <p>Cancelación gratuita hasta 24 horas antes del check-in. Política de reembolso completa disponible.</p>
          </div>
        </div>
      </div>

      {/* Información de pago */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-start space-x-2 text-xs text-gray-600">
          <CreditCard className="w-4 h-4 mt-0.5 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900 mb-1">Pago seguro</p>
            <p>Tu información de pago está encriptada y protegida con tecnología SSL.</p>
          </div>
        </div>
      </div>

      {/* Comodidades de la propiedad */}
      {property.amenities && property.amenities.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Comodidades incluidas</h4>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((amenity, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Política de cancelación */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="text-xs text-gray-600">
          <p className="font-medium text-gray-900 mb-1">Política de cancelación</p>
          <ul className="space-y-1">
            <li>• Cancelación gratuita hasta 24 horas antes del check-in</li>
            <li>• Reembolso del 50% si cancelas dentro de 24 horas</li>
            <li>• No hay reembolso para cancelaciones de último minuto</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
