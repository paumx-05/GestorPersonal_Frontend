import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API Route para servir avatares del backend
 * Esto evita problemas de CORS al cargar imágenes desde otro origen
 * 
 * Uso: /api/proxy/avatar?path=/uploads/avatars/avatar.jpg
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      );
    }
    
    // Construir URL completa del backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    // Asegurar que el path empiece con /
    const avatarPath = path.startsWith('/') ? path : `/${path}`;
    const backendUrl = `${baseUrl}${avatarPath}`;
    
    console.log('🔍 [avatar-proxy] Fetching avatar from:', backendUrl);
    
    // Obtener token de autenticación si está disponible (opcional para imágenes públicas)
    const authHeader = request.headers.get('authorization');
    
    // Fetch de la imagen desde el backend
    const response = await fetch(backendUrl, {
      headers: authHeader ? {
        'Authorization': authHeader
      } : {},
      // No seguir redirects automáticamente para evitar loops
      redirect: 'follow'
    });
    
    if (!response.ok) {
      console.error('❌ [avatar-proxy] Error fetching avatar:', response.status);
      return new NextResponse(null, { status: response.status });
    }
    
    // Obtener el buffer de la imagen
    const imageBuffer = await response.arrayBuffer();
    
    // Obtener el content-type de la respuesta del backend
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Devolver la imagen con headers apropiados
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        // Headers CORS para permitir carga desde cualquier origen
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('💥 [avatar-proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch avatar' },
      { status: 500 }
    );
  }
}

