import Header from '@/components/Header';
import OfferTopBar from '@/components/OfferTopBar';
import AirbnbSearchModule from '@/components/AirbnbSearchModule';
import AirbnbFilters from '@/components/AirbnbFilters';
import AirbnbResults from '@/components/AirbnbResults';
import Footer from '@/components/Footer';
import QuickAuthDebug from '@/components/auth/QuickAuthDebug';
import Link from 'next/link';

/**
 * Main Landing Page Component - Página principal limpia y funcional
 * Features: Header con búsqueda, módulo de búsqueda Airbnb, filtros y resultados
 * Architecture: Layout simplificado enfocado en funcionalidad principal
 * 
 * TODO: Agregar SEO metadata y datos estructurados
 * FIXME: Implementar boundaries de error para producción
 * TODO: Agregar tracking de analytics para interacciones de usuario
 */

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Offer TopBar */}
      <OfferTopBar 
        emoji={true}
        discount={45}
        remainingSpots={15}
        timeLimit={120}
        offerText="¡Oferta Flash! Reserva ahora y ahorra"
      />
      
      {/* Navigation Header */}
      <Header />
      
      {/* Hero Section con Búsqueda Airbnb */}
      <section className="relative py-8 md:py-16 overflow-hidden">
        {/* Imagen de Fondo Vacacional */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          }}
        />
        
        {/* Overlay para mejorar legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"></div>
        
        {/* Contenido */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg px-2">
              Encuentra tu próximo alojamiento
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white drop-shadow-md px-4">
              Descubre lugares únicos para quedarte en todo el mundo
            </p>
          </div>
          
          {/* Módulo de Búsqueda Airbnb */}
          <AirbnbSearchModule />
        </div>
      </section>
      
      {/* Separador Visual */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      
      {/* Sección de Resultados con Filtros */}
      <section className="py-6 md:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filtros Airbnb */}
          <AirbnbFilters />
          
          {/* Resultados Airbnb */}
          <AirbnbResults />
        </div>
      </section>
      
      {/* Separador Visual */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      
      {/* Footer con Información de Contacto */}
      <Footer />
      
      {/* Quick Auth Debug - Temporal */}
      <QuickAuthDebug />
      
      {/* Debug Links */}
      <div className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-300 mb-2">Herramientas de Debug:</p>
          <div className="space-x-4">
            <Link 
              href="/debug-auth" 
              className="text-blue-400 hover:text-blue-300 underline text-sm"
            >
              🔍 Debug de Autenticación
            </Link>
            <Link 
              href="/test-token-refresh" 
              className="text-green-400 hover:text-green-300 underline text-sm"
            >
              🔄 Test Token Refresh
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}