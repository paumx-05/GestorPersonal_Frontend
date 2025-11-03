'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, Users, Home, ArrowLeft } from 'lucide-react';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('reservationId');
  const propertyId = searchParams.get('propertyId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Volver al inicio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Icono de éxito */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          {/* Título de confirmación */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Reserva confirmada!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Tu reserva ha sido procesada exitosamente. Recibirás un email de confirmación pronto.
          </p>

          {/* Información de la reserva */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles de la reserva</h2>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Fechas</p>
                  <p className="text-gray-600">
                    {checkIn && formatDate(checkIn)} - {checkOut && formatDate(checkOut)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Huéspedes</p>
                  <p className="text-gray-600">2 huéspedes</p>
                </div>
              </div>

              <div className="flex items-center">
                <Home className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">ID de reserva</p>
                  <p className="text-gray-600 font-mono">{reservationId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Próximos pasos */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Próximos pasos</h3>
            <ul className="text-left text-blue-800 space-y-2">
              <li>• Recibirás un email de confirmación con todos los detalles</li>
              <li>• El anfitrión te contactará 24 horas antes del check-in</li>
              <li>• Puedes gestionar tu reserva desde tu perfil</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/profile"
              className="inline-flex items-center px-6 py-3 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
            >
              Ver mis reservas
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Explorar más propiedades
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">¿Necesitas ayuda? Contacta a nuestro equipo de soporte.</p>
            <div className="flex justify-center space-x-6">
              <Link href="/help" className="hover:text-gray-900 transition-colors">
                Centro de ayuda
              </Link>
              <Link href="/contact" className="hover:text-gray-900 transition-colors">
                Contactar soporte
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
