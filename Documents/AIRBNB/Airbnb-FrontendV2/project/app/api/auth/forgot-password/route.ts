import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/forgot-password
 * Maneja la solicitud de recuperación de contraseña
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validar datos requeridos
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Email inválido' },
        { status: 400 }
      );
    }

    console.log('🔄 [ForgotPassword] Solicitando reset para:', email);

    // 🚨 MODO DEMO TEMPORAL - Para probar el flujo de forgot-password
    const DEMO_MODE = process.env.NODE_ENV === 'development';
    
    if (DEMO_MODE) {
      console.log('🎭 [ForgotPassword] MODO DEMO ACTIVADO - Simulando envío exitoso');
      
      // Generar token JWT estándar (como el del error original)
      const jwtHeader = btoa(JSON.stringify({
        alg: "HS256",
        typ: "JWT"
      }));
      
      const jwtPayload = btoa(JSON.stringify({
        userId: '68fe69f35467c59ffb326476',
        email: email,
        type: "password-reset",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
      }));
      
      const jwtSignature = "BPh83MomtXmFK6L4d04iFYRKYLqHUXFL1m8HafGJAlg"; // Signature del token original
      
      const resetToken = `${jwtHeader}.${jwtPayload}.${jwtSignature}`;

      console.log('🔑 [ForgotPassword] Token generado:', resetToken.substring(0, 20) + '...');
      console.log('📧 [ForgotPassword] Email simulado enviado a:', email);
      console.log('🔗 [ForgotPassword] Enlace de reset:', `http://localhost:3000/reset-password/${resetToken}`);

      return NextResponse.json({
        success: true,
        message: 'Email de recuperación enviado exitosamente (modo demo)',
        debug: {
          token: resetToken,
          resetUrl: `http://localhost:3000/reset-password/${resetToken}`
        }
      });
    }

    // Llamada real al backend para forgot-password
    try {
      console.log('🔄 [ForgotPassword] Llamando al backend real...');
      
      const forgotResponse = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      console.log('📥 [ForgotPassword] Status del backend:', forgotResponse.status);

      if (forgotResponse.ok) {
        const forgotData = await forgotResponse.json();
        console.log('✅ [ForgotPassword] Respuesta del backend:', forgotData);
        
        return NextResponse.json({
          success: true,
          message: 'Email de recuperación enviado exitosamente'
        });
      } else {
        const errorData = await forgotResponse.json();
        console.log('❌ [ForgotPassword] Error del backend:', errorData);
        
        return NextResponse.json({
          success: false,
          message: errorData.message || 'Error al enviar el email de recuperación'
        }, { status: forgotResponse.status });
      }

    } catch (backendError) {
      console.error('💥 [ForgotPassword] Error llamando al backend:', backendError);
      return NextResponse.json({
        success: false,
        message: 'Error de conexión con el servidor'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('💥 [ForgotPassword] Error procesando request:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
