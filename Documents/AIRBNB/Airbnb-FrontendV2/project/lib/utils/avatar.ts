/**
 * Utilidad para construir URLs de avatar usando el proxy
 * Esto evita problemas de CORS al cargar imágenes desde el backend
 */

/**
 * Convierte una URL de avatar del backend a URL del proxy de Next.js
 * @param avatarUrl - URL del avatar (relativa, localhost:5000, o externa)
 * @returns URL del proxy o URL original si es externa
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string | undefined {
  if (!avatarUrl) {
    return undefined;
  }
  
  // Si ya es una URL del proxy, devolverla tal cual
  if (avatarUrl.includes('/api/proxy/avatar')) {
    return avatarUrl;
  }
  
  // Si es una URL relativa (empieza con /), usar el proxy
  if (avatarUrl.startsWith('/')) {
    return `/api/proxy/avatar?path=${encodeURIComponent(avatarUrl)}`;
  }
  
  // Si es URL del backend local, convertir a proxy
  if (avatarUrl.startsWith('http://localhost:5000/') || avatarUrl.startsWith('http://127.0.0.1:5000/')) {
    const path = avatarUrl.replace(/^https?:\/\/[^/]+/, '');
    return `/api/proxy/avatar?path=${encodeURIComponent(path)}`;
  }
  
  // Si no tiene protocolo, usar proxy
  if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
    const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
    return `/api/proxy/avatar?path=${encodeURIComponent(path)}`;
  }
  
  // Si es una URL externa completa (https://...), usar directamente
  return avatarUrl;
}

