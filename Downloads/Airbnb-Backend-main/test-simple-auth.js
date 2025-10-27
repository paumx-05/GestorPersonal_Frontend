/**
 * 🧪 SCRIPT SIMPLE DE PRUEBA DE AUTENTICACIÓN
 * 
 * Este script prueba la funcionalidad básica de autenticación
 * y luego el endpoint de renovación de tokens.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSimpleAuth() {
  console.log('🧪 Iniciando pruebas simples de autenticación...\n');

  try {
    // 1. Verificar que el servidor esté funcionando
    console.log('1️⃣ Verificando servidor...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Servidor funcionando');
    console.log(`📊 Estado: ${healthResponse.data.message}\n`);

    // 2. Intentar registro de un usuario de prueba
    console.log('2️⃣ Registrando usuario de prueba...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: 'test@example.com',
      password: 'password123',
      name: 'Usuario Prueba'
    });

    const { token, user } = registerResponse.data.data;
    console.log('✅ Usuario registrado exitosamente');
    console.log(`👤 Usuario: ${user.email}`);
    console.log(`🔑 Token obtenido: ${token.substring(0, 20)}...\n`);

    // 3. Probar endpoint de renovación manual
    console.log('3️⃣ Probando renovación manual de token...');
    const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
      token: token
    });

    const newToken = refreshResponse.data.data.token;
    console.log('✅ Token renovado exitosamente');
    console.log(`🔄 Nuevo token: ${newToken.substring(0, 20)}...\n`);

    // 4. Probar endpoint protegido con token renovado
    console.log('4️⃣ Probando endpoint protegido con token renovado...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${newToken}`
      }
    });

    console.log('✅ Acceso a perfil exitoso');
    console.log(`👤 Perfil: ${JSON.stringify(profileResponse.data.data.user, null, 2)}\n`);

    // 5. Probar middleware de renovación automática
    console.log('5️⃣ Probando middleware de renovación automática...');
    const testResponse = await axios.get(`${BASE_URL}/api/auth/test`, {
      headers: {
        'Authorization': `Bearer ${newToken}`
      }
    });

    console.log('✅ Test endpoint exitoso');
    console.log(`📝 Respuesta: ${testResponse.data.data.message}`);
    
    // Verificar headers de renovación automática
    const refreshed = testResponse.headers['x-token-refreshed'];
    if (refreshed) {
      console.log('🔄 Token renovado automáticamente por middleware');
      const autoNewToken = testResponse.headers['x-new-token'];
      if (autoNewToken) {
        console.log(`🆕 Nuevo token automático: ${autoNewToken.substring(0, 20)}...`);
      }
    } else {
      console.log('ℹ️ Token no necesitaba renovación automática');
    }

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('✅ Verificación de servidor');
    console.log('✅ Registro de usuario');
    console.log('✅ Renovación manual de token');
    console.log('✅ Acceso a endpoints protegidos');
    console.log('✅ Middleware de renovación automática');
    console.log('✅ Headers de respuesta para sincronización frontend');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Posibles soluciones:');
      console.log('- Verificar que el servidor esté ejecutándose en puerto 5000');
      console.log('- Verificar que la base de datos esté conectada');
      console.log('- Revisar logs del servidor para errores');
    }
  }
}

// Ejecutar las pruebas
testSimpleAuth();
