import Header from '@/components/Header';
import OfferTopBar from '@/components/OfferTopBar';
import CategoryTabs from '@/components/CategoryTabs';
import MainContent from '@/components/MainContent';
import AirbnbSearchModule from '@/components/AirbnbSearchModule';
import AirbnbFilters from '@/components/AirbnbFilters';
import AirbnbResults from '@/components/AirbnbResults';

/**
 * Main Landing Page Component - Página principal siguiendo diseño de referencia
 * Features: Header con búsqueda, tabs de categorías, grid de propiedades y mapa
 * Architecture: Layout exacto de la imagen de referencia de Airbnb
 * 
 * TODO: Agregar SEO metadata y datos estructurados
 * FIXME: Implementar boundaries de error para producción
 * TODO: Agregar tracking de analytics para interacciones de usuario
 */

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
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
      <section className="bg-gradient-to-r from-red-500 to-red-600 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Encuentra tu próximo alojamiento
            </h1>
            <p className="text-xl text-red-100">
              Descubre lugares únicos para quedarte en todo el mundo
            </p>
          </div>
          
          {/* Módulo de Búsqueda Airbnb */}
          <AirbnbSearchModule />
        </div>
      </section>
      
      {/* Sección de Resultados con Filtros */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Filtros Airbnb */}
          <AirbnbFilters />
          
          {/* Resultados Airbnb */}
          <AirbnbResults />
        </div>
      </section>
      
      {/* Category Filters */}
      <CategoryTabs />
      
      {/* Main Content: Properties + Map */}
      <MainContent />
    </main>
  );
}