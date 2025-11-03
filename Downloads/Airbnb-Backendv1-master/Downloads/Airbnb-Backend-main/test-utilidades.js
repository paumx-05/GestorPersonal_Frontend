const axios = require('axios');
const { MongoClient } = require('mongodb');

const BASE_URL = 'http://localhost:5000';
const MONGODB_URI = 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';

let mongoClient;
let db;

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

// Test 1: Información de la API (endpoint raíz)
async function testApiInfo() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    
    const passed = response.status === 200 && 
                   response.data !== null;
    
    // Verificar que tenga información básica de la API
    const hasApiInfo = response.data && (
      'name' in response.data ||
      'version' in response.data ||
      'description' in response.data ||
      'message' in response.data
    );
    
    // Verificar headers de seguridad
    const headersCheck = checkSecurityHeaders(response.headers);
    
    logTest('GET / (Información de la API)', passed, {
      status: response.status,
      hasApiInfo,
      responseKeys: response.data ? Object.keys(response.data) : [],
      securityHeaders: headersCheck
    });
    
    return passed;
  } catch (error) {
    logTest('GET / (Información de la API)', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 2: Health Check
async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    const passed = response.status === 200 && 
                   response.data !== null;
    
    // Verificar que tenga información de salud del sistema
    const hasHealthInfo = response.data && (
      'status' in response.data ||
      'health' in response.data ||
      'uptime' in response.data ||
      'message' in response.data
    );
    
    // Verificar headers de seguridad
    const headersCheck = checkSecurityHeaders(response.headers);
    
    logTest('GET /api/health', passed, {
      status: response.status,
      hasHealthInfo,
      responseKeys: response.data ? Object.keys(response.data) : [],
      securityHeaders: headersCheck
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/health', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 3: Verificar estructura de datos de información de API
async function testApiInfoStructure() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    
    if (!response.data) {
      logTest('Verificar Estructura de Información de API', false, {
        error: 'No hay datos de respuesta'
      });
      return false;
    }
    
    const data = response.data;
    
    // Verificar que tenga al menos algunos campos esperados
    const hasExpectedFields = Object.keys(data).length > 0;
    
    const passed = hasExpectedFields;
    
    logTest('Verificar Estructura de Información de API', passed, {
      hasFields: hasExpectedFields,
      fieldsCount: Object.keys(data).length,
      fields: Object.keys(data),
      sampleData: data
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Estructura de Información de API', false, {
      error: error.message
    });
    return false;
  }
}

// Test 4: Verificar estructura de datos de health check
async function testHealthCheckStructure() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    if (!response.data) {
      logTest('Verificar Estructura de Health Check', false, {
        error: 'No hay datos de respuesta'
      });
      return false;
    }
    
    const data = response.data;
    
    // Verificar que tenga información de salud
    const hasHealthFields = Object.keys(data).length > 0;
    
    const passed = hasHealthFields;
    
    logTest('Verificar Estructura de Health Check', passed, {
      hasHealthFields,
      fieldsCount: Object.keys(data).length,
      fields: Object.keys(data),
      sampleData: data
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Estructura de Health Check', false, {
      error: error.message
    });
    return false;
  }
}

// Test 5: Verificar CORS y Content-Type
async function testHeadersValidation() {
  try {
    const response = await axios.get(
      `${BASE_URL}/`,
      {
        headers: {
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

// Test 6: Verificar que los endpoints son públicos (no requieren autenticación)
async function testPublicEndpoints() {
  try {
    // Probar ambos endpoints sin autenticación
    const apiInfoResponse = await axios.get(`${BASE_URL}/`);
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    
    const apiInfoPassed = apiInfoResponse.status === 200;
    const healthPassed = healthResponse.status === 200;
    
    const passed = apiInfoPassed && healthPassed;
    
    logTest('Verificar Endpoints Públicos', passed, {
      apiInfo: { status: apiInfoResponse.status, passed: apiInfoPassed },
      health: { status: healthResponse.status, passed: healthPassed }
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Endpoints Públicos', false, {
      error: error.message
    });
    return false;
  }
}

// Test 7: Verificar tiempo de respuesta
async function testResponseTime() {
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}/api/health`);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    const isFast = responseTime < 1000; // Menos de 1 segundo
    
    const passed = response.status === 200 && isFast;
    
    logTest('Verificar Tiempo de Respuesta', passed, {
      status: response.status,
      responseTime: `${responseTime}ms`,
      isFast,
      threshold: '1000ms'
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Tiempo de Respuesta', false, {
      error: error.message
    });
    return false;
  }
}

// Test 8: Verificar disponibilidad del servidor
async function testServerAvailability() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    const passed = response.status === 200;
    
    logTest('Verificar Disponibilidad del Servidor', passed, {
      status: response.status,
      serverUp: passed
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Disponibilidad del Servidor', false, {
      error: error.message,
      serverUp: false
    });
    return false;
  }
}

// Función principal
async function runTests() {
  console.log('\n🧪 ===== INICIANDO PRUEBAS DE UTILIDADES =====\n');
  console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
  console.log(`🌐 URL Base: ${BASE_URL}\n`);
  
  // Conectar a MongoDB
  const dbConnected = await connectToMongoDB();
  if (!dbConnected) {
    console.error('❌ No se pudo conectar a MongoDB. Abortando pruebas.');
    return;
  }
  
  // Verificar datos en BD
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
  console.log('🌐 --- Tests de Endpoints Públicos ---\n');
  await testApiInfo();
  await testHealthCheck();
  
  console.log('\n🔍 --- Tests de Estructura y Datos ---\n');
  await testApiInfoStructure();
  await testHealthCheckStructure();
  
  console.log('\n🔒 --- Tests de Headers y Seguridad ---\n');
  await testHeadersValidation();
  
  console.log('\n🌍 --- Tests de Disponibilidad ---\n');
  await testPublicEndpoints();
  await testResponseTime();
  await testServerAvailability();
  
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
  fs.writeFileSync('test-utilidades-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Resultados guardados en test-utilidades-results.json\n');
  
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
