import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para protección de rutas
 * Verifica si el usuario tiene token de autenticación para acceder a rutas protegidas
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/profile'];
  
  // Rutas de autenticación que no deben ser accesibles si ya está logueado
  const authRoutes = ['/login', '/register'];
  
  // Obtener token de las cookies
  const token = request.cookies.get('airbnb_auth_token')?.value;
  
  console.log('🔍 [Middleware] Verificando ruta:', pathname);
  console.log('🔍 [Middleware] Token encontrado:', token ? 'SÍ' : 'NO');
  
  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar si la ruta actual es de autenticación
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  console.log('🔍 [Middleware] Es ruta protegida:', isProtectedRoute);
  console.log('🔍 [Middleware] Es ruta de auth:', isAuthRoute);
  
  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute && !token) {
    console.log('❌ [Middleware] Redirigiendo a login - no hay token');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si es una ruta de auth y ya hay token, redirigir al home
  if (isAuthRoute && token) {
    console.log('✅ [Middleware] Redirigiendo a home - ya autenticado');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  console.log('✅ [Middleware] Permitiendo acceso a:', pathname);
  return NextResponse.next();
}

// Configurar en qué rutas ejecutar el middleware
export const config = {
  matcher: [
    // Excluir archivos estáticos y API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


