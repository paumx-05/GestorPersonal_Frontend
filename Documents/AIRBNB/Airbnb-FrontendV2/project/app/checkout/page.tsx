'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Users, MapPin } from 'lucide-react';
import Link from 'next/link';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import ReservationSummary from '@/components/checkout/ReservationSummary';
import { calculateReservationCost, type Property as ReservationProperty, type ReservationData, type GuestInfo } from '@/lib/reservation-mock';
import { propertyService, type Property as ApiProperty, getLocationString } from '@/lib/api/properties';
import Logo from '@/components/header/Logo';
import UserMenu from '@/components/auth/UserMenu';

// Función para convertir Property de la API a Property de reserva
const mapApiPropertyToReservationProperty = (apiProperty: ApiProperty): ReservationProperty => {
  return {
    id: apiProperty.id,
    title: apiProperty.title,
    location: getLocationString(apiProperty.location) || apiProperty.city || 'Ubicación no disponible',
    pricePerNight: apiProperty.pricePerNight,
    image: apiProperty.imageUrl || apiProperty.images?.[0] || '',
    guests: apiProperty.maxGuests,
    bedrooms: 2, // Valor por defecto, se puede obtener del backend si está disponible
    bathrooms: 1, // Valor por defecto, se puede obtener del backend si está disponible
    description: apiProperty.description,
    amenities: apiProperty.amenities || []
  };
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState<ReservationProperty | null>(null);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCheckoutData = async () => {
      // Obtener datos de la reserva desde los parámetros de URL
      const propertyId = searchParams.get('propertyId');
      const checkIn = searchParams.get('checkIn');
      const checkOut = searchParams.get('checkOut');
      const guests = parseInt(searchParams.get('guests') || '1');

      if (!propertyId || !checkIn || !checkOut) {
        // Redirigir a home si faltan datos esenciales
        console.log('❌ [CheckoutPage] Faltan parámetros esenciales');
        router.push('/');
        return;
      }

      try {
        setIsLoading(true);
        
        // Obtener la propiedad desde la API real
        console.log('🔍 [CheckoutPage] Obteniendo propiedad:', propertyId);
        const apiProperty = await propertyService.getPropertyById(propertyId);
        
        if (!apiProperty) {
          console.log('❌ [CheckoutPage] Propiedad no encontrada:', propertyId);
          router.push('/');
          return;
        }

        // Mapear la propiedad de la API al formato de reserva
        const reservationProperty = mapApiPropertyToReservationProperty(apiProperty);
        setProperty(reservationProperty);

        // Calcular datos de la reserva
        const calculatedData = calculateReservationCost(reservationProperty, checkIn, checkOut, guests);
        setReservationData(calculatedData);
        
        console.log('✅ [CheckoutPage] Datos de checkout cargados correctamente');
      } catch (error) {
        console.error('💥 [CheckoutPage] Error cargando datos:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadCheckoutData();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos de la reserva...</p>
        </div>
      </div>
    );
  }

  if (!property || !reservationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header reducido como el del perfil */}
      <header className="bg-white border-b-2 border-slate-200 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center flex-1">
              <Link href="/" className="flex-shrink-0">
                <Logo />
              </Link>
            </div>

            {/* Center - Título */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-xl font-bold text-slate-900">Finalizar Reserva</h1>
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center space-x-2 flex-1 justify-end">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal - Diseño horizontal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario - Columna izquierda */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center gap-2 mb-6">
                <Link 
                  href={`/detail/${property.id}`}
                  className="text-gray-600 hover:text-[#FF385C] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  Completa tu reserva
                </h1>
              </div>
              
              {/* Información de la propiedad */}
              <div className="mb-8 p-5 bg-gradient-to-r from-[#FF385C]/5 to-[#FF385C]/10 rounded-lg border border-[#FF385C]/20">
                <h2 className="font-semibold text-gray-900 mb-2 text-lg">{property.title}</h2>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1 text-[#FF385C]" />
                  <span className="text-sm">{property.location}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-[#FF385C]" />
                    {new Date(reservationData.checkIn).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(reservationData.checkOut).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-[#FF385C]" />
                    {reservationData.guests} huésped{reservationData.guests > 1 ? 'es' : ''}
                  </span>
                </div>
              </div>

              <CheckoutForm onSubmit={handleReservationSubmit} />
            </div>
          </div>

          {/* Sidebar de resumen - Columna derecha */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-24">
              <ReservationSummary 
                property={property}
                reservationData={reservationData}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
