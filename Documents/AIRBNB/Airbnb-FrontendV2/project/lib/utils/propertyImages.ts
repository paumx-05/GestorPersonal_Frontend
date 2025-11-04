/**
 * Utilidades para manejar imágenes de propiedades
 * Ayuda a seleccionar diferentes imágenes para previews y evitar que todas muestren la misma
 */

// Lista de imágenes de Unsplash relacionadas con alojamientos/casas
// Cada imagen es diferente para que las propiedades se vean más reales
const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758c7faeb96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1508009603885-50cf7c579365?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504297050568-910d24c426d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504983376253-026713002a1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068feae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

/**
 * Obtiene una imagen para preview de una propiedad
 * Si hay múltiples imágenes, selecciona una diferente basada en el ID de la propiedad
 * Esto evita que todas las propiedades muestren la misma imagen
 * 
 * @param propertyId - ID de la propiedad (para generar un índice consistente)
 * @param images - Array de imágenes de la propiedad
 * @param imageUrl - URL de imagen única (fallback)
 * @returns URL de la imagen a mostrar
 */
export function getPropertyPreviewImage(
  propertyId: string,
  images?: string[],
  imageUrl?: string
): string {
  // Si hay array de imágenes, seleccionar una basada en el ID
  if (images && images.length > 0) {
    // Convertir el ID a un número usando hash simple
    const hash = propertyId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    // Usar el hash para seleccionar un índice consistente
    const imageIndex = hash % images.length;
    const selectedImage = images[imageIndex];
    
    // Filtrar imágenes vacías o inválidas
    if (selectedImage && selectedImage.trim() !== '') {
      return selectedImage;
    }
    
    // Si la imagen seleccionada es inválida, buscar la primera válida
    const validImage = images.find(img => img && img.trim() !== '');
    if (validImage) {
      return validImage;
    }
  }
  
  // Si hay imageUrl válida, usarla
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  
  // Seleccionar una imagen diferente de la lista basada en el ID de la propiedad
  // Esto asegura que cada propiedad tenga una imagen diferente y consistente
  const hash = propertyId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const imageIndex = hash % PROPERTY_IMAGES.length;
  return PROPERTY_IMAGES[imageIndex];
}

