'use client';

import { Heart, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Property Card Component - Card de propiedad siguiendo diseño de referencia
 * TODO: Implementar funcionalidad de wishlist para el corazón
 * FIXME: Agregar lazy loading para imágenes y manejo de errores
 */

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  guests?: number;
  description: string;
}

export default function PropertyCard({
  id,
  title,
  location,
  price,
  rating,
  image,
  guests,
  description
}: PropertyCardProps) {
  const router = useRouter();

  // Función para navegar al detalle de la propiedad
  const handleCardClick = () => {
    router.push(`/detail/${id}`);
  };

  return (
    <div className="group cursor-pointer" onClick={handleCardClick}>
      {/* Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Wishlist button */}
        <button 
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 transition-transform duration-200"
          onClick={(e) => {
            e.stopPropagation(); // Evitar que se active la navegación
            // TODO: Implementar funcionalidad de wishlist
            console.log('Añadir a favoritos:', id);
          }}
        >
          <Heart className="h-5 w-5 text-white drop-shadow-lg hover:fill-[#FF385C] hover:text-[#FF385C] transition-colors duration-200" />
        </button>

        {/* Image indicators */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i === 0 ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1">
        {/* Location and Rating */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium text-sm truncate flex-1 mr-2">
            {title}
          </h3>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Star className="h-3 w-3 fill-white text-white" />
            <span className="text-white text-sm font-medium">{rating}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm">
          {description}
        </p>

        {/* Guests info */}
        {guests && (
          <p className="text-slate-400 text-sm">
            {guests}-10 pers.
          </p>
        )}

        {/* Price */}
        <div className="pt-1">
          <span className="text-white font-semibold">${price}</span>
          <span className="text-slate-400 text-sm"> total before taxes</span>
        </div>
      </div>
    </div>
  );
}