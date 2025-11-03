'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Users, MapPin } from 'lucide-react';
import Link from 'next/link';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import ReservationSummary from '@/components/checkout/ReservationSummary';
import { getPropertyById, calculateReservationCost, type Property, type ReservationData, type GuestInfo } from '@/lib/reservation-mock';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener datos de la reserva desde los parámetros de URL
    const propertyId = searchParams.get('propertyId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = parseInt(searchParams.get('guests') || '1');

    if (!propertyId || !checkIn || !checkOut) {
      // Redirigir a home si faltan datos esenciales
      router.push('/');
      return;
    }

    // Buscar la propiedad
    const foundProperty = getPropertyById(propertyId);
    if (!foundProperty) {
      router.push('/');
      return;
    }

    setProperty(foundProperty);

    // Calcular datos de la reserva
    const calculatedData = calculateReservationCost(foundProperty, checkIn, checkOut, guests);
    setReservationData(calculatedData);
    setIsLoading(false);
  }, [searchParams, router]);

  const handleReservationSubmit = async (guestInfo: GuestInfo) => {
    if (!reservationData) return;

    // Aquí se procesaría la reserva
    // Por ahora, redirigimos a una página de confirmación
    const params = new URLSearchParams({
      reservationId: `RES-${Date.now()}`,
      propertyId: reservationData.propertyId,
      checkIn: reservationData.checkIn,
      checkOut: reservationData.checkOut
    });
    
    router.push(`/confirmation?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos de la reserva...</p>
        </div>
      </div>
    );
  }

  if (!property || !reservationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">No se pudieron cargar los datos de la reserva.</p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href={`/detail/${property.id}`}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Volver a la propiedad</span>
            </Link>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date(reservationData.checkIn).toLocaleDateString()} - {new Date(reservationData.checkOut).toLocaleDateString()}</span>
              <Users className="w-4 h-4 ml-4" />
              <span>{reservationData.guests} huésped{reservationData.guests > 1 ? 'es' : ''}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario - 2 columnas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Completa tu reserva
              </h1>
              
              {/* Información de la propiedad */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h2 className="font-semibold text-gray-900 mb-2">{property.title}</h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{property.bedrooms} habitaciones</span>
                  <span>{property.bathrooms} baños</span>
                  <span>Hasta {property.guests} huéspedes</span>
                </div>
              </div>

              <CheckoutForm onSubmit={handleReservationSubmit} />
            </div>
          </div>

          {/* Sidebar de resumen - 1 columna */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ReservationSummary 
                property={property}
                reservationData={reservationData}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer simple */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">© 2024 Airbnb Clone. Todos los derechos reservados.</p>
            <div className="flex justify-center space-x-6">
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Términos de servicio
              </Link>
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Política de privacidad
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
