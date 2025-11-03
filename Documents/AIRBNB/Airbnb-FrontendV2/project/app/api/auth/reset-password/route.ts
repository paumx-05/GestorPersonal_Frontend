import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/auth/reset-password
 * Maneja la redirección a la página de reset password con el token
 * 
 * GET /api/auth/reset-password?token=reset_xxx
 * Redirige a: /reset-password/[token]
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validar que existe el token
    if (!token) {
      return NextResponse.redirect(new URL('/forgot-password?error=no-token', request.url));
    }

    // Validar formato básico del token
    if (!token.startsWith('reset_')) {
      return NextResponse.redirect(new URL('/forgot-password?error=invalid-token', request.url));
    }

    // Redirigir a la página de reset password con el token
    const resetUrl = new URL(`/reset-password/${token}`, request.url);
    return NextResponse.redirect(resetUrl);

  } catch (error) {
    console.error('Error en /api/auth/reset-password:', error);
    return NextResponse.redirect(new URL('/forgot-password?error=server-error', request.url));
  }
}

/**
 * POST /api/auth/reset-password
 * Maneja el reset de contraseña (llamada desde el frontend)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // Validar datos requeridos
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato del token
    if (!token.startsWith('reset_')) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Decodificar el token para obtener el email del usuario
    try {
      const tokenPayload = token.replace('reset_', '');
      const decodedToken = JSON.parse(atob(tokenPayload));
      const userEmail = decodedToken.email;
      
      console.log('🔄 [ResetPassword] Token decodificado, email:', userEmail);
      
      // 🚨 MODO DEMO TEMPORAL - Para probar el flujo de reset de contraseña
      const DEMO_MODE = process.env.NODE_ENV === 'development';
      
      if (DEMO_MODE) {
        console.log('🎭 [ResetPassword] MODO DEMO ACTIVADO - Simulando reset exitoso');
        
        // Simular validación de token
        if (!userEmail || !userEmail.includes('@')) {
          return NextResponse.json({
            success: false,
            message: 'Token inválido'
          }, { status: 400 });
        }
        
        // Simular cambio exitoso
        console.log('✅ [ResetPassword] Contraseña actualizada exitosamente (modo demo)');
        return NextResponse.json({
          success: true,
          message: 'Contraseña restablecida exitosamente (modo demo)'
        });
      }

      // Llamada real al backend para reset de contraseña
      console.log('🔄 [ResetPassword] Llamando al backend real...');
      
      const resetResponse = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword
        })
      });

      console.log('📥 [ResetPassword] Status del backend:', resetResponse.status);

      if (resetResponse.ok) {
        const resetData = await resetResponse.json();
        console.log('✅ [ResetPassword] Respuesta del backend:', resetData);
        
        return NextResponse.json({
          success: true,
          message: 'Contraseña restablecida exitosamente'
        });
      } else {
        const errorData = await resetResponse.json();
        console.log('❌ [ResetPassword] Error del backend:', errorData);
        
        return NextResponse.json({
          success: false,
          message: errorData.message || 'Error al restablecer la contraseña'
        }, { status: resetResponse.status });
      }

    } catch (tokenError) {
      console.error('💥 [ResetPassword] Error decodificando token:', tokenError);
      return NextResponse.json({
        success: false,
        message: 'Token inválido o corrupto'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error en POST /api/auth/reset-password:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
