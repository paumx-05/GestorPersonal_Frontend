const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

const BASE_URL = 'http://localhost:5000';
const MONGODB_URI = 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';

let authToken = '';
let mongoClient;
let db;
let testUserId = '';
let testUserEmail = `test.reservations.${Date.now()}@demo.com`;
let testPropertyId = '';
let testReservationId = '';

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

// Función para verificar datos en MongoDB
async function verifyInDatabase(collectionName, query) {
  try {
    const collection = db.collection(collectionName);
    const result = await collection.findOne(query);
    return result;
  } catch (error) {
    console.error(`❌ Error verificando en DB (${collectionName}):`, error.message);
    return null;
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

// Test 0: Registrar usuario de prueba
async function testRegisterUser() {
  try {
    const userData = {
      email: testUserEmail,
      password: 'TestPassword123!',
      name: 'Test User Reservations'
    };
    
    const response = await axios.post(`${BASE_URL}/api/auth/register`, userData);
    
    const passed = response.status === 201 && 
                   response.data.success === true && 
                   response.data.data.token;
    
    if (passed) {
      authToken = response.data.data.token;
      testUserId = response.data.data.user._id || response.data.data.user.id;
    }
    
    logTest('Registrar Usuario de Prueba', passed, {
      status: response.status,
      hasToken: !!response.data.data.token,
      userId: testUserId
    });
    
    return passed;
  } catch (error) {
    logTest('Registrar Usuario de Prueba', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 1: Verificar Disponibilidad (público)
async function testCheckAvailability() {
  try {
    // Obtener una propiedad de la BD
    const property = await db.collection('properties').findOne({});
    
    if (!property) {
      logTest('GET /api/reservations/check-availability', false, {
        error: 'No hay propiedades en la base de datos'
      });
      return false;
    }
    
    testPropertyId = property._id.toString();
    
    const checkIn = '2026-06-01';
    const checkOut = '2026-06-05';
    const guests = 2;
    
    const response = await axios.get(
      `${BASE_URL}/api/reservations/check-availability?propertyId=${testPropertyId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    );
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   'available' in response.data.data;
    
    // Verificar headers de seguridad
    const headersCheck = checkSecurityHeaders(response.headers);
    
    logTest('GET /api/reservations/check-availability', passed, {
      status: response.status,
      available: response.data.data?.available,
      propertyId: testPropertyId,
      securityHeaders: headersCheck
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/reservations/check-availability', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 2: Verificar Disponibilidad sin parámetros requeridos
async function testCheckAvailabilityMissingParams() {
  try {
    const response = await axios.get(`${BASE_URL}/api/reservations/check-availability`);
    
    // Debería fallar con 400
    const passed = false;
    
    logTest('GET /api/reservations/check-availability (sin params)', passed, {
      status: response.status,
      note: 'Debería retornar 400, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 400
    const passed = error.response?.status === 400;
    
    logTest('GET /api/reservations/check-availability (sin params)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message,
      correct: passed ? 'Correctamente valida parámetros' : 'No valida correctamente'
    });
    
    return passed;
  }
}

// Test 3: Crear Reserva
async function testCreateReservation() {
  try {
    const reservationData = {
      propertyId: testPropertyId,
      checkIn: '2026-07-01',
      checkOut: '2026-07-05',
      guests: 2,
      totalPrice: 380,
      paymentMethod: 'credit_card'
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/reservations`,
      reservationData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const passed = (response.status === 200 || response.status === 201) && 
                   response.data.success === true &&
                   response.data.data !== null;
    
    if (passed && response.data.data) {
      testReservationId = response.data.data._id || response.data.data.id;
    }
    
    // Verificar headers de seguridad
    const headersCheck = checkSecurityHeaders(response.headers);
    
    // Verificar en BD
    let dbReservation = null;
    if (testReservationId) {
      dbReservation = await verifyInDatabase('reservations', { 
        _id: new ObjectId(testReservationId) 
      });
    }
    
    logTest('POST /api/reservations', passed, {
      status: response.status,
      reservationId: testReservationId,
      hasData: !!response.data.data,
      securityHeaders: headersCheck,
      dbVerification: !!dbReservation
    });
    
    return passed;
  } catch (error) {
    logTest('POST /api/reservations', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 4: Crear Reserva sin autenticación
async function testCreateReservationNoAuth() {
  try {
    const reservationData = {
      propertyId: testPropertyId,
      checkIn: '2026-06-10',
      checkOut: '2026-06-15',
      guests: 2,
      totalPrice: 475
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/reservations`,
      reservationData
    );
    
    // Debería fallar con 401
    const passed = false;
    
    logTest('POST /api/reservations (sin auth)', passed, {
      status: response.status,
      note: 'Debería retornar 401, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 401
    const passed = error.response?.status === 401;
    
    logTest('POST /api/reservations (sin auth)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 5: Crear Reserva con datos inválidos
async function testCreateReservationInvalidData() {
  try {
    const invalidData = {
      propertyId: 'invalid-id',
      checkIn: 'not-a-date',
      checkOut: '2026-05-31', // Antes del checkIn
      guests: -1 // Número negativo
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/reservations`,
      invalidData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    // Debería fallar con 400
    const passed = false;
    
    logTest('POST /api/reservations (datos inválidos)', passed, {
      status: response.status,
      note: 'Debería retornar 400, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 400
    const passed = error.response?.status === 400;
    
    logTest('POST /api/reservations (datos inválidos)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 6: Obtener Mis Reservas
async function testGetMyReservations() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/reservations/my-reservations`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    // Verificar headers de seguridad
    const headersCheck = checkSecurityHeaders(response.headers);
    
    // Verificar que incluya la reserva creada
    const includesTestReservation = response.data.data.some(
      r => r._id === testReservationId || r.id === testReservationId
    );
    
    logTest('GET /api/reservations/my-reservations', passed, {
      status: response.status,
      reservationsCount: response.data.data?.length || 0,
      isArray: Array.isArray(response.data.data),
      includesTestReservation,
      securityHeaders: headersCheck
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/reservations/my-reservations', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 7: Obtener Mis Reservas sin autenticación
async function testGetMyReservationsNoAuth() {
  try {
    const response = await axios.get(`${BASE_URL}/api/reservations/my-reservations`);
    
    // Debería fallar con 401
    const passed = false;
    
    logTest('GET /api/reservations/my-reservations (sin auth)', passed, {
      status: response.status,
      note: 'Debería retornar 401, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 401
    const passed = error.response?.status === 401;
    
    logTest('GET /api/reservations/my-reservations (sin auth)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 8: Actualizar Estado de Reserva
async function testUpdateReservationStatus() {
  try {
    if (!testReservationId) {
      logTest('PATCH /api/reservations/:id/status', false, {
        error: 'No se creó una reserva de prueba'
      });
      return false;
    }
    
    const response = await axios.patch(
      `${BASE_URL}/api/reservations/${testReservationId}/status`,
      { status: 'confirmed' },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const passed = response.status === 200 && 
                   response.data.success === true;
    
    // Verificar en BD
    const dbReservation = await verifyInDatabase('reservations', { 
      _id: new ObjectId(testReservationId) 
    });
    
    const statusUpdated = dbReservation?.status === 'confirmed';
    
    logTest('PATCH /api/reservations/:id/status', passed, {
      status: response.status,
      dbStatusUpdated: statusUpdated,
      newStatus: dbReservation?.status
    });
    
    return passed;
  } catch (error) {
    logTest('PATCH /api/reservations/:id/status', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 9: Actualizar Estado con valor inválido
async function testUpdateReservationStatusInvalid() {
  try {
    if (!testReservationId) {
      logTest('PATCH /api/reservations/:id/status (estado inválido)', false, {
        error: 'No se creó una reserva de prueba'
      });
      return false;
    }
    
    const response = await axios.patch(
      `${BASE_URL}/api/reservations/${testReservationId}/status`,
      { status: 'invalid_status' },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    // Debería fallar con 400
    const passed = false;
    
    logTest('PATCH /api/reservations/:id/status (estado inválido)', passed, {
      status: response.status,
      note: 'Debería retornar 400, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 400
    const passed = error.response?.status === 400;
    
    logTest('PATCH /api/reservations/:id/status (estado inválido)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 10: Verificar estructura de datos de reserva
async function testReservationDataStructure() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/reservations/my-reservations`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (!response.data.data || response.data.data.length === 0) {
      logTest('Verificar Estructura de Datos de Reserva', false, {
        error: 'No hay reservas para verificar'
      });
      return false;
    }
    
    const reservation = response.data.data[0];
    
    // Verificar campos esperados
    const requiredFields = ['_id', 'propertyId', 'userId', 'checkIn', 'checkOut', 'guests', 'status'];
    const recommendedFields = ['totalPrice', 'createdAt', 'updatedAt'];
    
    const missingRequired = requiredFields.filter(field => {
      // Aceptar tanto _id como id
      if (field === '_id') {
        return !('_id' in reservation || 'id' in reservation);
      }
      return !(field in reservation);
    });
    const presentRecommended = recommendedFields.filter(field => field in reservation);
    
    const passed = missingRequired.length === 0;
    
    logTest('Verificar Estructura de Datos de Reserva', passed, {
      hasAllRequired: missingRequired.length === 0,
      missingRequired,
      presentRecommended,
      recommendedFieldsCount: `${presentRecommended.length}/${recommendedFields.length}`,
      totalFields: Object.keys(reservation).length
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Estructura de Datos de Reserva', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 11: Verificar consistencia con BD
async function testDatabaseConsistency() {
  try {
    if (!testReservationId) {
      logTest('Verificar Consistencia con BD', false, {
        error: 'No hay reserva de prueba'
      });
      return false;
    }
    
    const response = await axios.get(
      `${BASE_URL}/api/reservations/my-reservations`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    const apiReservation = response.data.data.find(
      r => (r._id === testReservationId || r.id === testReservationId)
    );
    
    if (!apiReservation) {
      logTest('Verificar Consistencia con BD', false, {
        error: 'No se encontró la reserva en la respuesta de la API'
      });
      return false;
    }
    
    const dbReservation = await verifyInDatabase('reservations', { 
      _id: new ObjectId(testReservationId) 
    });
    
    if (!dbReservation) {
      logTest('Verificar Consistencia con BD', false, {
        error: 'No se encontró la reserva en la BD'
      });
      return false;
    }
    
    // Comparar campos críticos
    const propertyIdMatches = apiReservation.propertyId === (dbReservation.propertyId?.toString() || dbReservation.propertyId);
    const guestsMatch = apiReservation.guests === dbReservation.guests;
    const statusMatches = apiReservation.status === dbReservation.status;
    
    const passed = propertyIdMatches && guestsMatch && statusMatches;
    
    logTest('Verificar Consistencia con BD', passed, {
      propertyIdMatches,
      guestsMatch,
      statusMatches,
      apiData: {
        propertyId: apiReservation.propertyId,
        guests: apiReservation.guests,
        status: apiReservation.status
      },
      dbData: {
        propertyId: dbReservation.propertyId?.toString() || dbReservation.propertyId,
        guests: dbReservation.guests,
        status: dbReservation.status
      }
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Consistencia con BD', false, {
      error: error.message
    });
    return false;
  }
}

// Test 12: Verificar CORS y Content-Type
async function testHeadersValidation() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/reservations/check-availability?propertyId=${testPropertyId}&checkIn=2026-06-01&checkOut=2026-06-05&guests=2`,
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

// Función principal
async function runTests() {
  console.log('\n🧪 ===== INICIANDO PRUEBAS DE RESERVAS =====\n');
  console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
  console.log(`🌐 URL Base: ${BASE_URL}\n`);
  
  // Conectar a MongoDB
  const dbConnected = await connectToMongoDB();
  if (!dbConnected) {
    console.error('❌ No se pudo conectar a MongoDB. Abortando pruebas.');
    return;
  }
  
  // Verificar datos necesarios
  const propertyCount = await countInDatabase('properties');
  console.log(`📊 Total de propiedades en BD: ${propertyCount}`);
  
  const reservationCount = await countInDatabase('reservations');
  console.log(`📊 Total de reservas en BD: ${reservationCount}\n`);
  
  if (propertyCount === 0) {
    console.log('⚠️  Advertencia: No hay propiedades en la base de datos. Algunos tests pueden fallar.\n');
  }
  
  // Ejecutar tests
  console.log('📝 --- Tests de Autenticación ---\n');
  await testRegisterUser();
  
  console.log('\n🔍 --- Tests de Disponibilidad ---\n');
  await testCheckAvailability();
  await testCheckAvailabilityMissingParams();
  
  console.log('\n📝 --- Tests de Creación de Reservas ---\n');
  await testCreateReservation();
  await testCreateReservationNoAuth();
  await testCreateReservationInvalidData();
  
  console.log('\n📋 --- Tests de Consulta de Reservas ---\n');
  await testGetMyReservations();
  await testGetMyReservationsNoAuth();
  
  console.log('\n✏️ --- Tests de Actualización de Reservas ---\n');
  await testUpdateReservationStatus();
  await testUpdateReservationStatusInvalid();
  
  console.log('\n🔍 --- Tests de Estructura y Datos ---\n');
  await testReservationDataStructure();
  await testDatabaseConsistency();
  
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
  fs.writeFileSync('test-reservas-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Resultados guardados en test-reservas-results.json\n');
  
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

