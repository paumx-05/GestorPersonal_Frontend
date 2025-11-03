'use client';

import { useState, useMemo } from 'react';
import { X } from 'lucide-react';

// Interfaz para las props del componente de galería
interface PropertyGalleryProps {
  images: string[];
  title: string;
}

// Componente de galería de imágenes - 4 pequeñas a la izquierda y 1 grande a la derecha
const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(0);

  // Filtrar imágenes válidas usando useMemo para evitar recálculos
  const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  
  const displayImages = useMemo(() => {
    const validImages = images.filter(img => img && img.trim() !== '');
    return validImages.length > 0 ? validImages : [defaultImage];
  }, [images]);

  // Obtener la imagen principal (la seleccionada o la primera)
  const mainImage = displayImages[selectedImage] || displayImages[0] || defaultImage;

  // Obtener las 4 imágenes pequeñas (excluyendo la seleccionada)
  const smallImages = displayImages
    .map((img, idx) => ({ img, idx }))
    .filter(({ idx }) => idx !== selectedImage)
    .slice(0, 4);

  // Abrir lightbox
  const openLightbox = (index: number) => {
    setLightboxImage(index);
    setIsLightboxOpen(true);
  };

  // Cerrar lightbox
  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Navegación en lightbox
  const lightboxNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxImage((prev) => (prev + 1) % displayImages.length);
  };

  const lightboxPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Manejar teclas en lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isLightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lightboxNext();
    if (e.key === 'ArrowLeft') lightboxPrev();
  };

  return (
    <>
      <div className="property-gallery" onKeyDown={handleKeyDown} tabIndex={0}>
        <div className="grid grid-cols-5 gap-2 h-[380px] md:h-[420px] lg:h-[450px]">
          {/* Columna izquierda: 4 imágenes pequeñas en grid 2x2 */}
          <div className="col-span-2 grid grid-rows-2 grid-cols-2 gap-2">
            {smallImages.length > 0 ? (
              smallImages.map(({ img, idx }) => (
                <div
                  key={idx}
                  className="relative rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-gray-100 group"
                  onClick={() => {
                    setSelectedImage(idx);
                  }}
                >
                  <img 
                    src={img || defaultImage} 
                    alt={`${title} - Imagen ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultImage;
                    }}
                    loading="lazy"
                  />
                  {/* Overlay para indicar que es clickeable */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                </div>
              ))
            ) : (
              // Si no hay suficientes imágenes pequeñas, mostrar espacios vacíos
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-md overflow-hidden border-2 border-gray-200 bg-gray-100"
                ></div>
              ))
            )}
          </div>

          {/* Columna derecha: Imagen grande */}
          <div 
            className="col-span-3 relative rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-gray-100 group"
            onClick={() => openLightbox(selectedImage)}
          >
            <img 
              src={mainImage} 
              alt={`${title} - Imagen principal`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultImage;
              }}
              loading="eager"
            />
            {/* Indicador de clic para ampliar */}
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              ⛶ Ampliar
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox/Modal para ver imagen completa */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/50 rounded-full p-2 hover:bg-black/70"
            aria-label="Cerrar"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Imagen grande */}
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={displayImages[lightboxImage] || defaultImage} 
              alt={`${title} - Imagen ${lightboxImage + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg border-4 border-white/20 shadow-2xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultImage;
              }}
            />

            {/* Botones de navegación en lightbox */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={lightboxPrev}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-4 text-white transition-all duration-200 hover:scale-110 border border-white/30"
                  aria-label="Imagen anterior"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={lightboxNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-4 text-white transition-all duration-200 hover:scale-110 border border-white/30"
                  aria-label="Imagen siguiente"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Contador en lightbox */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                  {lightboxImage + 1} / {displayImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyGallery;
