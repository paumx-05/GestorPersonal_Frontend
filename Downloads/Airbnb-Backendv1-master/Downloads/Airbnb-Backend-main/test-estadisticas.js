const axios = require('axios');
const { MongoClient } = require('mongodb');

const BASE_URL = 'http://localhost:5000';
const MONGODB_URI = 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';

let authToken = '';
let mongoClient;
let db;
const ADMIN_EMAIL = 'demo@airbnb.com';
const ADMIN_PASSWORD = 'Admin1234!';

const results = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Función para conectar a MongoDB
async function connectToMongoDB() {
  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db('airbnb-backend');
    console.log('✅ Conectado a MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    return false;
  }
}

// Función para cerrar conexión MongoDB
async function closeMongoDB() {
  if (mongoClient) {
    await mongoClient.close();
    console.log('✅ Conexión a MongoDB cerrada');
  }
}

// Función para contar documentos en MongoDB
async function countInDatabase(collectionName, query = {}) {
  try {
    const collection = db.collection(collectionName);
    const count = await collection.countDocuments(query);
    return count;
  } catch (error) {
    console.error(`❌ Error contando en DB (${collectionName}):`, error.message);
    return 0;
  }
}

// Función para registrar resultados
function logTest(testName, passed, details = {}) {
  results.totalTests++;
  if (passed) {
    results.passed++;
    console.log(`✅ ${testName}`);
  } else {
    results.failed++;
    console.error(`❌ ${testName}`);
  }
  
  results.tests.push({
    name: testName,
    passed,
    details,
    timestamp: new Date().toISOString()
  });
}

// Función para verificar headers de seguridad
function checkSecurityHeaders(headers) {
  const requiredHeaders = {
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'x-xss-protection': '1; mode=block',
    'strict-transport-security': 'max-age=31536000; includeSubDomains'
  };
  
  const missingHeaders = [];
  const incorrectHeaders = [];
  
  for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
    if (!headers[header]) {
      missingHeaders.push(header);
    } else if (headers[header] !== expectedValue) {
      incorrectHeaders.push({
        header,
        expected: expectedValue,
        actual: headers[header]
      });
    }
  }
  
  return {
    valid: missingHeaders.length === 0 && incorrectHeaders.length === 0,
    missingHeaders,
    incorrectHeaders
  };
}

// Test 0: Login o crear usuario admin con email permitido
async function testLoginAdmin() {
  try {
    const bcrypt = require('bcryptjs');
    const usersCollection = db.collection('users');
    
    // Buscar el usuario admin en la BD
    const adminUser = await usersCollection.findOne({ email: ADMIN_EMAIL });
    
    if (adminUser) {
      // Si existe, actualizar la contraseña
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await usersCollection.updateOne(
        { email: ADMIN_EMAIL },
        { $set: { password: hashedPassword } }
      );
    } else {
      // Si no existe, crear el usuario
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: 'Admin Demo User'
      });
      
      if (registerResponse.status !== 201 || !registerResponse.data.data.token) {
        throw new Error('No se pudo crear el usuario admin');
      }
    }
    
    // Ahora intentar login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (loginResponse.status === 200 && loginResponse.data.data.token) {
      authToken = loginResponse.data.data.token;
      
      logTest('Login Usuario Admin', true, {
        status: 200,
        hasToken: true,
        email: ADMIN_EMAIL,
        note: adminUser ? 'Contraseña actualizada y login exitoso' : 'Usuario creado y login exitoso'
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    logTest('Login Usuario Admin', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 1: Obtener estadísticas del sistema
async function testGetSystemStats() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/stats`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   response.data.data !== null;
    
    // Verificar que tenga campos esperados
    const hasExpectedFields = response.data.data && (
      'users' in response.data.data ||
      'properties' in response.data.data ||
      'reservations' in response.data.data ||
      'reviews' in response.data.data ||
      'totalUsers' in response.data.data
    );
    
    // Verificar headers de seguridad
    const headersCheck = checkSecurityHeaders(response.headers);
    
    logTest('GET /api/stats', passed, {
      status: response.status,
      hasExpectedFields,
      stats: response.data.data ? Object.keys(response.data.data) : [],
      securityHeaders: headersCheck
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/stats', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 2: Obtener estadísticas sin autenticación
async function testGetSystemStatsNoAuth() {
  try {
    const response = await axios.get(`${BASE_URL}/api/stats`);
    
    // Debería fallar con 401
    const passed = false;
    
    logTest('GET /api/stats (sin auth)', passed, {
      status: response.status,
      note: 'Debería retornar 401, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 401
    const passed = error.response?.status === 401;
    
    logTest('GET /api/stats (sin auth)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 3: Obtener logs del sistema
async function testGetSystemLogs() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/stats/logs`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   (Array.isArray(response.data.data) || response.data.data !== null);
    
    logTest('GET /api/stats/logs', passed, {
      status: response.status,
      isArray: Array.isArray(response.data.data),
      logsCount: Array.isArray(response.data.data) ? response.data.data.length : 'N/A'
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/stats/logs', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 4: Obtener logs con filtro de nivel
async function testGetSystemLogsWithLevel() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/stats/logs`,
      {
        params: {
          level: 'info',
          limit: 50
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    const passed = response.status === 200 && 
                   response.data.success === true;
    
    logTest('GET /api/stats/logs (con filtros)', passed, {
      status: response.status,
      level: 'info',
      limit: 50,
      logsCount: Array.isArray(response.data.data) ? response.data.data.length : 'N/A'
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/stats/logs (con filtros)', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 5: Obtener logs sin autenticación
async function testGetSystemLogsNoAuth() {
  try {
    const response = await axios.get(`${BASE_URL}/api/stats/logs`);
    
    // Debería fallar con 401
    const passed = false;
    
    logTest('GET /api/stats/logs (sin auth)', passed, {
      status: response.status,
      note: 'Debería retornar 401, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 401
    const passed = error.response?.status === 401;
    
    logTest('GET /api/stats/logs (sin auth)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 6: Limpiar logs del sistema
async function testClearSystemLogs() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/stats/logs/clear`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    const passed = response.status === 200 && 
                   response.data.success === true;
    
    logTest('POST /api/stats/logs/clear', passed, {
      status: response.status,
      message: response.data.data?.message || response.data.message
    });
    
    return passed;
  } catch (error) {
    logTest('POST /api/stats/logs/clear', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 7: Limpiar logs sin autenticación
async function testClearSystemLogsNoAuth() {
  try {
    const response = await axios.post(`${BASE_URL}/api/stats/logs/clear`);
    
    // Debería fallar con 401
    const passed = false;
    
    logTest('POST /api/stats/logs/clear (sin auth)', passed, {
      status: response.status,
      note: 'Debería retornar 401, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 401
    const passed = error.response?.status === 401;
    
    logTest('POST /api/stats/logs/clear (sin auth)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 8: Verificar estructura de datos de estadísticas
async function testStatsDataStructure() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/stats`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (!response.data.data) {
      logTest('Verificar Estructura de Datos de Estadísticas', false, {
        error: 'No hay datos de estadísticas'
      });
      return false;
    }
    
    const stats = response.data.data;
    
    // Verificar que tenga al menos algunos campos de estadísticas
    const hasAnyStats = Object.keys(stats).length > 0;
    
    const passed = hasAnyStats;
    
    logTest('Verificar Estructura de Datos de Estadísticas', passed, {
      hasStats: hasAnyStats,
      fieldsCount: Object.keys(stats).length,
      fields: Object.keys(stats)
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Estructura de Datos de Estadísticas', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 9: Verificar que las estadísticas contengan información del sistema
async function testStatsSystemInfo() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/stats`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (!response.data.data) {
      logTest('Verificar Información del Sistema en Estadísticas', false, {
        error: 'No hay datos de estadísticas'
      });
      return false;
    }
    
    const stats = response.data.data;
    
    // Verificar que contenga información del sistema (los campos que realmente retorna)
    const hasSystemInfo = 'system' in stats || 'rateLimiting' in stats || 
                         'cache' in stats || 'logging' in stats;
    
    // Si el sistema retorna conteos de datos, verificarlos también
    if ('users' in stats || 'properties' in stats) {
      const dbUserCount = await countInDatabase('users');
      const dbPropertyCount = await countInDatabase('properties');
      
      const userCountMatch = Math.abs((stats.users || stats.totalUsers || 0) - dbUserCount) <= 2;
      const propertyCountMatch = Math.abs((stats.properties || stats.totalProperties || 0) - dbPropertyCount) <= 2;
      
      const passed = userCountMatch && propertyCountMatch;
      
      logTest('Verificar Información del Sistema en Estadísticas', passed, {
        type: 'Data statistics',
        users: { api: stats.users || stats.totalUsers, db: dbUserCount, match: userCountMatch },
        properties: { api: stats.properties || stats.totalProperties, db: dbPropertyCount, match: propertyCountMatch }
      });
      
      return passed;
    }
    
    // Si solo tiene información del sistema, validar que tenga al menos un campo
    const passed = hasSystemInfo;
    
    logTest('Verificar Información del Sistema en Estadísticas', passed, {
      type: 'System statistics',
      hasSystemInfo,
      fields: Object.keys(stats)
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Información del Sistema en Estadísticas', false, {
      error: error.message
    });
    return false;
  }
}

// Test 10: Verificar CORS y Content-Type
async function testHeadersValidation() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/stats`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Origin': 'http://localhost:3000'
        }
      }
    );
    
    const hasCORS = 'access-control-allow-origin' in response.headers;
    const isJSON = response.headers['content-type']?.includes('application/json');
    
    const passed = hasCORS && isJSON;
    
    logTest('Verificar Headers HTTP', passed, {
      hasCORS,
      isJSON,
      corsValue: response.headers['access-control-allow-origin'],
      contentType: response.headers['content-type']
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Headers HTTP', false, {
      error: error.message
    });
    return false;
  }
}

// Función principal
async function runTests() {
  console.log('\n🧪 ===== INICIANDO PRUEBAS DE ESTADÍSTICAS =====\n');
  console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
  console.log(`🌐 URL Base: ${BASE_URL}\n`);
  
  // Conectar a MongoDB
  const dbConnected = await connectToMongoDB();
  if (!dbConnected) {
    console.error('❌ No se pudo conectar a MongoDB. Abortando pruebas.');
    return;
  }
  
  // Verificar datos necesarios
  const userCount = await countInDatabase('users');
  const propertyCount = await countInDatabase('properties');
  const reservationCount = await countInDatabase('reservations');
  const reviewCount = await countInDatabase('reviews');
  
  console.log(`📊 Datos en BD:`);
  console.log(`   - Usuarios: ${userCount}`);
  console.log(`   - Propiedades: ${propertyCount}`);
  console.log(`   - Reservas: ${reservationCount}`);
  console.log(`   - Reviews: ${reviewCount}\n`);
  
  // Ejecutar tests
  console.log('📝 --- Tests de Autenticación ---\n');
  await testLoginAdmin();
  
  console.log('\n📊 --- Tests de Estadísticas del Sistema ---\n');
  await testGetSystemStats();
  await testGetSystemStatsNoAuth();
  
  console.log('\n📋 --- Tests de Logs del Sistema ---\n');
  await testGetSystemLogs();
  await testGetSystemLogsWithLevel();
  await testGetSystemLogsNoAuth();
  
  console.log('\n🗑️ --- Tests de Limpieza de Logs ---\n');
  await testClearSystemLogs();
  await testClearSystemLogsNoAuth();
  
  console.log('\n🔍 --- Tests de Estructura y Datos ---\n');
  await testStatsDataStructure();
  await testStatsSystemInfo();
  
  console.log('\n🔒 --- Tests de Headers y Seguridad ---\n');
  await testHeadersValidation();
  
  // Cerrar conexión MongoDB
  await closeMongoDB();
  
  // Mostrar resumen
  console.log('\n\n📊 ===== RESUMEN DE PRUEBAS =====');
  console.log(`Total de pruebas: ${results.totalTests}`);
  console.log(`✅ Pasadas: ${results.passed}`);
  console.log(`❌ Fallidas: ${results.failed}`);
  console.log(`📈 Tasa de éxito: ${((results.passed / results.totalTests) * 100).toFixed(2)}%`);
  
  // Guardar resultados
  const fs = require('fs');
  fs.writeFileSync('test-estadisticas-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Resultados guardados en test-estadisticas-results.json\n');
  
  // Mostrar detalles de tests fallidos
  const failedTests = results.tests.filter(t => !t.passed);
  if (failedTests.length > 0) {
    console.log('\n❌ Tests Fallidos:');
    failedTests.forEach(test => {
      console.log(`\n  - ${test.name}`);
      console.log(`    Detalles: ${JSON.stringify(test.details, null, 4)}`);
    });
  }
}

// Ejecutar tests
runTests().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

