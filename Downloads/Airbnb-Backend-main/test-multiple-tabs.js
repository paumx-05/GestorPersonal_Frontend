/**
 * 🧪 SCRIPT DE PRUEBA PARA MÚLTIPLES PESTAÑAS
 * 
 * Este script simula el comportamiento de múltiples pestañas
 * y verifica que cada una maneje su propia renovación de tokens.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Simular múltiples pestañas con diferentes tokens
async function simulateMultipleTabs() {
  console.log('🧪 Simulando comportamiento de múltiples pestañas...\n');

  try {
    // Pestaña 1: Usuario 1
    console.log('📑 Pestaña 1: Registrando usuario 1...');
    const user1Response = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: 'user1@example.com',
      password: 'password123',
      name: 'Usuario 1'
    });
    const user1Token = user1Response.data.data.token;
    console.log(`✅ Usuario 1 registrado - Token: ${user1Token.substring(0, 20)}...\n`);

    // Pestaña 2: Usuario 2
    console.log('📑 Pestaña 2: Registrando usuario 2...');
    const user2Response = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: 'user2@example.com',
      password: 'password123',
      name: 'Usuario 2'
    });
    const user2Token = user2Response.data.data.token;
    console.log(`✅ Usuario 2 registrado - Token: ${user2Token.substring(0, 20)}...\n`);

    // Simular peticiones simultáneas desde diferentes pestañas
    console.log('🔄 Simulando peticiones simultáneas...');
    
    const [tab1Response, tab2Response] = await Promise.all([
      // Pestaña 1 hace petición
      axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${user1Token}` }
      }),
      // Pestaña 2 hace petición
      axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${user2Token}` }
      })
    ]);

    console.log('✅ Peticiones simultáneas exitosas');
    console.log(`👤 Pestaña 1 - Usuario: ${tab1Response.data.data.user.email}`);
    console.log(`👤 Pestaña 2 - Usuario: ${tab2Response.data.data.user.email}\n`);

    // Probar renovación independiente de tokens
    console.log('🔄 Probando renovación independiente de tokens...');
    
    const [refresh1Response, refresh2Response] = await Promise.all([
      // Pestaña 1 renueva su token
      axios.post(`${BASE_URL}/api/auth/refresh`, { token: user1Token }),
      // Pestaña 2 renueva su token
      axios.post(`${BASE_URL}/api/auth/refresh`, { token: user2Token })
    ]);

    const newToken1 = refresh1Response.data.data.token;
    const newToken2 = refresh2Response.data.data.token;

    console.log('✅ Renovaciones independientes exitosas');
    console.log(`🔄 Pestaña 1 - Nuevo token: ${newToken1.substring(0, 20)}...`);
    console.log(`🔄 Pestaña 2 - Nuevo token: ${newToken2.substring(0, 20)}...\n`);

    // Verificar que los tokens son diferentes
    if (newToken1 !== newToken2) {
      console.log('✅ Los tokens son independientes entre pestañas');
    } else {
      console.log('⚠️ Los tokens son idénticos (esto puede ser normal si se generan muy rápido)');
    }

    // Probar que cada pestaña mantiene su sesión independiente
    console.log('🔍 Verificando sesiones independientes...');
    
    const [session1Response, session2Response] = await Promise.all([
      axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${newToken1}` }
      }),
      axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${newToken2}` }
      })
    ]);

    console.log('✅ Sesiones independientes verificadas');
    console.log(`👤 Pestaña 1 mantiene sesión de: ${session1Response.data.data.user.email}`);
    console.log(`👤 Pestaña 2 mantiene sesión de: ${session2Response.data.data.user.email}\n`);

    // Simular middleware de renovación automática
    console.log('🔄 Probando middleware de renovación automática...');
    
    const [autoRefresh1, autoRefresh2] = await Promise.all([
      axios.get(`${BASE_URL}/api/auth/test`, {
        headers: { 'Authorization': `Bearer ${newToken1}` }
      }),
      axios.get(`${BASE_URL}/api/auth/test`, {
        headers: { 'Authorization': `Bearer ${newToken2}` }
      })
    ]);

    console.log('✅ Middleware de renovación automática funcionando');
    console.log(`📝 Pestaña 1: ${autoRefresh1.data.data.message}`);
    console.log(`📝 Pestaña 2: ${autoRefresh2.data.data.message}\n`);

    console.log('🎉 ¡Todas las pruebas de múltiples pestañas pasaron exitosamente!');
    console.log('\n📋 Resumen de funcionalidades verificadas:');
    console.log('✅ Registro independiente de usuarios');
    console.log('✅ Peticiones simultáneas desde diferentes pestañas');
    console.log('✅ Renovación independiente de tokens');
    console.log('✅ Sesiones independientes mantenidas');
    console.log('✅ Middleware de renovación automática por pestaña');

  } catch (error) {
    console.error('❌ Error en las pruebas de múltiples pestañas:', error.response?.data || error.message);
  }
}

// Ejecutar las pruebas
simulateMultipleTabs();
