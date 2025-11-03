/**
 * Utilidades para manejar imágenes de propiedades
 * Ayuda a seleccionar diferentes imágenes para previews y evitar que todas muestren la misma
 */

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
  
  // Fallback a imageUrl si existe
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  
  // Fallback final a imagen por defecto
  return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
}

