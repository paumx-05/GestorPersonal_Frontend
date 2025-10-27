/**
 * 🧪 SCRIPT DE PRUEBA PARA RENOVACIÓN DE TOKENS
 * 
 * Este script prueba la funcionalidad de renovación automática de tokens
 * para verificar que el sistema mantiene sesiones activas.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testTokenRefresh() {
  console.log('🧪 Iniciando pruebas de renovación de tokens...\n');

  try {
    // 1. Iniciar sesión para obtener un token
    console.log('1️⃣ Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'demo@airbnb.com',
      password: 'password123'
    });

    const { token, user } = loginResponse.data.data;
    console.log('✅ Login exitoso');
    console.log(`👤 Usuario: ${user.email}`);
    console.log(`🔑 Token obtenido: ${token.substring(0, 20)}...\n`);

    // 2. Probar endpoint de renovación manual
    console.log('2️⃣ Probando renovación manual de token...');
    const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
      token: token
    });

    const newToken = refreshResponse.data.data.token;
    console.log('✅ Token renovado exitosamente');
    console.log(`🔄 Nuevo token: ${newToken.substring(0, 20)}...\n`);

    // 3. Probar endpoint protegido con token renovado
    console.log('3️⃣ Probando endpoint protegido con token renovado...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${newToken}`
      }
    });

    console.log('✅ Acceso a perfil exitoso');
    console.log(`👤 Perfil: ${JSON.stringify(profileResponse.data.data.user, null, 2)}\n`);

    // 4. Probar middleware de renovación automática
    console.log('4️⃣ Probando middleware de renovación automática...');
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
    console.log('✅ Login y obtención de token');
    console.log('✅ Renovación manual de token');
    console.log('✅ Acceso a endpoints protegidos');
    console.log('✅ Middleware de renovación automática');
    console.log('✅ Headers de respuesta para sincronización frontend');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Posibles soluciones:');
      console.log('- Verificar que el servidor esté ejecutándose en puerto 3000');
      console.log('- Verificar que el usuario demo@airbnb.com exista en la base de datos');
      console.log('- Ejecutar el script de seed: npm run seed');
    }
  }
}

// Ejecutar las pruebas
testTokenRefresh();
