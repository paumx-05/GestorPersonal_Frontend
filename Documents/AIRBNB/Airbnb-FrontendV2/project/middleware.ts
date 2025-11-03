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
  
  // Rutas de administración que requieren rol de admin
  const adminRoutes = ['/admin'];
  
  // Rutas de autenticación que no deben ser accesibles si ya está logueado
  const authRoutes = ['/login', '/register'];
  
  // Obtener token de las cookies
  const token = request.cookies.get('airbnb_auth_token')?.value;
  
  console.log('🔍 [Middleware] Verificando ruta:', pathname);
  console.log('🔍 [Middleware] Token encontrado:', token ? 'SÍ' : 'NO');
  
  // 🚨 MODO DEMO TEMPORAL - Reconocer tokens demo
  const DEMO_MODE = process.env.NODE_ENV === 'development';
  const isDemoToken = token && token.startsWith('demo-jwt-token-');
  
  if (DEMO_MODE && isDemoToken) {
    console.log('🎭 [Middleware] Token demo detectado - permitiendo acceso');
    return NextResponse.next();
  }
  
  // NOTA: No podemos acceder a localStorage en el middleware porque se ejecuta en el servidor
  // El token debe estar en cookies para que el middleware pueda acceder a él
  
  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar si la ruta actual es de administración
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar si la ruta actual es de autenticación
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  console.log('🔍 [Middleware] Es ruta protegida:', isProtectedRoute);
  console.log('🔍 [Middleware] Es ruta de admin:', isAdminRoute);
  console.log('🔍 [Middleware] Es ruta de auth:', isAuthRoute);
  
  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute && !token) {
    console.log('❌ [Middleware] Redirigiendo a login - no hay token');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si es una ruta de admin y no hay token, redirigir al login
  if (isAdminRoute && !token) {
    console.log('❌ [Middleware] Redirigiendo a login - ruta de admin sin token');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Permitir acceso a rutas de autenticación siempre
  // El AuthContext y las páginas se encargarán de manejar la lógica
  if (isAuthRoute) {
    console.log('✅ [Middleware] Ruta de autenticación, permitiendo acceso');
    return NextResponse.next();
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


