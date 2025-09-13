'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AirbnbProperty, mockProperties } from '@/lib/mockData';
import PropertyGallery from './PropertyGallery';
import HostInfo from './HostInfo';
import ReservationSidebar from './ReservationSidebar';

interface PropertyDetailProps {
  propertyId: string;
}

const PropertyDetail = ({ propertyId }: PropertyDetailProps) => {
  const [property, setProperty] = useState<AirbnbProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getPropertyById = (id: string): AirbnbProperty | undefined => {
    return mockProperties.find(prop => prop.id === id);
  };

  useEffect(() => {
    const propertyData = getPropertyById(propertyId);
    setProperty(propertyData || null);
    setLoading(false);
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando detalles de la propiedad...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Propiedad no encontrada</h2>
          <p className="text-gray-600">La propiedad que buscas no existe o ha sido eliminada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a resultados
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
        <div className="flex items-center gap-4 text-gray-600">
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="font-medium">{property.rating}</span>
            <span>({property.reviewCount} reseñas)</span>
          </span>
          <span>•</span>
          <span>{property.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <PropertyGallery 
            images={[property.imageUrl]} 
            title={property.title} 
          />
          <HostInfo 
            host={property.host} 
            description={property.description}
            amenities={property.amenities}
          />
        </div>
        <div className="lg:col-span-1">
          <ReservationSidebar property={property} />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
