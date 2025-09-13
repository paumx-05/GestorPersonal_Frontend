'use client';

import { useState } from 'react';

// Interfaz para las props del componente de galería
interface PropertyGalleryProps {
  images: string[];
  title: string;
}

// Componente de galería de imágenes con navegación
const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  const [currentImage, setCurrentImage] = useState(0);

  // Función para navegar a la siguiente imagen
  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  // Función para navegar a la imagen anterior
  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // Función para cambiar imagen haciendo clic en thumbnail
  const selectImage = (index: number) => {
    setCurrentImage(index);
  };

  return (
    <div className="property-gallery">
      {/* Imagen principal con botones de navegación */}
      <div className="relative mb-4">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden">
          <img 
            src={images[currentImage]} 
            alt={`${title} - Imagen ${currentImage + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Botones de navegación (solo si hay más de una imagen) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
              aria-label="Imagen anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
              aria-label="Imagen siguiente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Indicador de imagen actual */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails (solo si hay más de una imagen) */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentImage 
                  ? 'border-gray-900 ring-2 ring-gray-300' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <img 
                src={image} 
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyGallery;
