const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

const BASE_URL = 'http://localhost:5000';
const MONGODB_URI = 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';

let authToken = '';
let mongoClient;
let db;
let testUserId = '';
let testUserEmail = `test.reviews.${Date.now()}@demo.com`;
let testPropertyId = '';
let testReservationId = '';
let testReviewId = '';

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
      name: 'Test User Reviews'
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

// Test 1: Obtener reviews de propiedad (público)
async function testGetPropertyReviews() {
  try {
    // Obtener una propiedad de la BD
    const property = await db.collection('properties').findOne({});
    
    if (!property) {
      logTest('GET /api/reviews/property/:id', false, {
        error: 'No hay propiedades en la base de datos'
      });
      return false;
    }
    
    testPropertyId = property._id.toString();
    
    const response = await axios.get(`${BASE_URL}/api/reviews/property/${testPropertyId}`);
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    // Verificar headers de seguridad
    const headersCheck = checkSecurityHeaders(response.headers);
    
    logTest('GET /api/reviews/property/:id', passed, {
      status: response.status,
      propertyId: testPropertyId,
      reviewsCount: response.data.data?.length || 0,
      isArray: Array.isArray(response.data.data),
      securityHeaders: headersCheck
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/reviews/property/:id', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 2: Obtener estadísticas de reviews de propiedad
async function testGetPropertyReviewStats() {
  try {
    const response = await axios.get(`${BASE_URL}/api/reviews/property/${testPropertyId}/stats`);
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   response.data.data !== null;
    
    // Verificar que tenga campos esperados
    const hasExpectedFields = response.data.data && (
      'averageRating' in response.data.data ||
      'totalReviews' in response.data.data ||
      'average' in response.data.data ||
      'total' in response.data.data
    );
    
    logTest('GET /api/reviews/property/:id/stats', passed, {
      status: response.status,
      hasExpectedFields,
      data: response.data.data
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/reviews/property/:id/stats', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 3: Crear review
async function testCreateReview() {
  try {
    // Crear el review directamente (reservationId es opcional)
    const reviewData = {
      propertyId: testPropertyId,
      rating: 5,
      comment: 'Excelente lugar, muy recomendado'
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/reviews`,
      reviewData,
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
      testReviewId = response.data.data._id || response.data.data.id;
    }
    
    // Verificar headers de seguridad
    const headersCheck = checkSecurityHeaders(response.headers);
    
    // Verificar en BD
    let dbReview = null;
    if (testReviewId) {
      dbReview = await verifyInDatabase('reviews', { 
        _id: new ObjectId(testReviewId) 
      });
    }
    
    logTest('POST /api/reviews', passed, {
      status: response.status,
      reviewId: testReviewId,
      hasData: !!response.data.data,
      securityHeaders: headersCheck,
      dbVerification: !!dbReview
    });
    
    return passed;
  } catch (error) {
    logTest('POST /api/reviews', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 4: Crear review sin autenticación
async function testCreateReviewNoAuth() {
  try {
    const reviewData = {
      propertyId: testPropertyId,
      rating: 4,
      comment: 'Buen lugar'
    };
    
    const response = await axios.post(`${BASE_URL}/api/reviews`, reviewData);
    
    // Debería fallar con 401
    const passed = false;
    
    logTest('POST /api/reviews (sin auth)', passed, {
      status: response.status,
      note: 'Debería retornar 401, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 401
    const passed = error.response?.status === 401;
    
    logTest('POST /api/reviews (sin auth)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 5: Crear review con datos inválidos
async function testCreateReviewInvalidData() {
  try {
    const invalidData = {
      propertyId: 'invalid-id',
      rating: 10, // Rating fuera de rango (debería ser 1-5)
      comment: '' // Comentario vacío
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/reviews`,
      invalidData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    // Debería fallar con 400
    const passed = false;
    
    logTest('POST /api/reviews (datos inválidos)', passed, {
      status: response.status,
      note: 'Debería retornar 400, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 400
    const passed = error.response?.status === 400;
    
    logTest('POST /api/reviews (datos inválidos)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 6: Obtener reviews de usuario
async function testGetUserReviews() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/reviews/user/${testUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    // Verificar que incluya el review creado
    const includesTestReview = response.data.data.some(
      r => (r._id === testReviewId || r.id === testReviewId)
    );
    
    logTest('GET /api/reviews/user/:id', passed, {
      status: response.status,
      reviewsCount: response.data.data?.length || 0,
      includesTestReview
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/reviews/user/:id', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 7: Actualizar review
async function testUpdateReview() {
  try {
    if (!testReviewId) {
      logTest('PUT /api/reviews/:id', false, {
        error: 'No se creó un review de prueba'
      });
      return false;
    }
    
    const updateData = {
      rating: 4,
      comment: 'Muy bueno, pero podría mejorar'
    };
    
    const response = await axios.put(
      `${BASE_URL}/api/reviews/${testReviewId}`,
      updateData,
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
    const dbReview = await verifyInDatabase('reviews', { 
      _id: new ObjectId(testReviewId) 
    });
    
    const ratingUpdated = dbReview?.rating === 4;
    const commentUpdated = dbReview?.comment === 'Muy bueno, pero podría mejorar';
    
    logTest('PUT /api/reviews/:id', passed, {
      status: response.status,
      ratingUpdated,
      commentUpdated
    });
    
    return passed;
  } catch (error) {
    logTest('PUT /api/reviews/:id', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 8: Actualizar review con rating inválido
async function testUpdateReviewInvalidRating() {
  try {
    if (!testReviewId) {
      logTest('PUT /api/reviews/:id (rating inválido)', false, {
        error: 'No se creó un review de prueba'
      });
      return false;
    }
    
    const invalidData = {
      rating: 6 // Fuera de rango 1-5
    };
    
    const response = await axios.put(
      `${BASE_URL}/api/reviews/${testReviewId}`,
      invalidData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    // Debería fallar con 400
    const passed = false;
    
    logTest('PUT /api/reviews/:id (rating inválido)', passed, {
      status: response.status,
      note: 'Debería retornar 400, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 400
    const passed = error.response?.status === 400;
    
    logTest('PUT /api/reviews/:id (rating inválido)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 9: Obtener estadísticas generales de reviews
async function testGetReviewStats() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/reviews/stats`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   response.data.data !== null;
    
    logTest('GET /api/reviews/stats', passed, {
      status: response.status,
      hasData: !!response.data.data,
      data: response.data.data
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/reviews/stats', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 10: Verificar estructura de datos de review
async function testReviewDataStructure() {
  try {
    const response = await axios.get(`${BASE_URL}/api/reviews/property/${testPropertyId}`);
    
    if (!response.data.data || response.data.data.length === 0) {
      logTest('Verificar Estructura de Datos de Review', false, {
        error: 'No hay reviews para verificar'
      });
      return false;
    }
    
    const review = response.data.data[0];
    
    // Verificar campos esperados
    const requiredFields = ['_id', 'propertyId', 'userId', 'rating', 'comment'];
    const recommendedFields = ['createdAt', 'updatedAt'];
    
    const missingRequired = requiredFields.filter(field => {
      // Aceptar tanto _id como id
      if (field === '_id') {
        return !('_id' in review || 'id' in review);
      }
      return !(field in review);
    });
    const presentRecommended = recommendedFields.filter(field => field in review);
    
    const passed = missingRequired.length === 0;
    
    logTest('Verificar Estructura de Datos de Review', passed, {
      hasAllRequired: missingRequired.length === 0,
      missingRequired,
      presentRecommended,
      recommendedFieldsCount: `${presentRecommended.length}/${recommendedFields.length}`,
      totalFields: Object.keys(review).length
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Estructura de Datos de Review', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 11: Verificar consistencia con BD
async function testDatabaseConsistency() {
  try {
    if (!testReviewId) {
      logTest('Verificar Consistencia con BD', false, {
        error: 'No hay review de prueba'
      });
      return false;
    }
    
    const response = await axios.get(`${BASE_URL}/api/reviews/property/${testPropertyId}`);
    
    const apiReview = response.data.data.find(
      r => (r._id === testReviewId || r.id === testReviewId)
    );
    
    if (!apiReview) {
      logTest('Verificar Consistencia con BD', false, {
        error: 'No se encontró el review en la respuesta de la API'
      });
      return false;
    }
    
    const dbReview = await verifyInDatabase('reviews', { 
      _id: new ObjectId(testReviewId) 
    });
    
    if (!dbReview) {
      logTest('Verificar Consistencia con BD', false, {
        error: 'No se encontró el review en la BD'
      });
      return false;
    }
    
    // Comparar campos críticos
    const ratingMatches = apiReview.rating === dbReview.rating;
    const commentMatches = apiReview.comment === dbReview.comment;
    const propertyIdMatches = apiReview.propertyId === (dbReview.propertyId?.toString() || dbReview.propertyId);
    
    const passed = ratingMatches && commentMatches && propertyIdMatches;
    
    logTest('Verificar Consistencia con BD', passed, {
      ratingMatches,
      commentMatches,
      propertyIdMatches,
      apiData: {
        rating: apiReview.rating,
        comment: apiReview.comment,
        propertyId: apiReview.propertyId
      },
      dbData: {
        rating: dbReview.rating,
        comment: dbReview.comment,
        propertyId: dbReview.propertyId?.toString() || dbReview.propertyId
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

// Test 12: Eliminar review
async function testDeleteReview() {
  try {
    if (!testReviewId) {
      logTest('DELETE /api/reviews/:id', false, {
        error: 'No se creó un review de prueba'
      });
      return false;
    }
    
    const response = await axios.delete(
      `${BASE_URL}/api/reviews/${testReviewId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    const passed = response.status === 200 && 
                   response.data.success === true;
    
    // Verificar que se eliminó de la BD
    const dbReview = await verifyInDatabase('reviews', { 
      _id: new ObjectId(testReviewId) 
    });
    
    const deletedFromDB = !dbReview;
    
    logTest('DELETE /api/reviews/:id', passed, {
      status: response.status,
      deletedFromDB
    });
    
    return passed;
  } catch (error) {
    logTest('DELETE /api/reviews/:id', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 13: Verificar CORS y Content-Type
async function testHeadersValidation() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/reviews/property/${testPropertyId}`,
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
  console.log('\n🧪 ===== INICIANDO PRUEBAS DE REVIEWS =====\n');
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
  
  const reviewCount = await countInDatabase('reviews');
  console.log(`📊 Total de reviews en BD: ${reviewCount}\n`);
  
  if (propertyCount === 0) {
    console.log('⚠️  Advertencia: No hay propiedades en la base de datos. Algunos tests pueden fallar.\n');
  }
  
  // Ejecutar tests
  console.log('📝 --- Tests de Autenticación ---\n');
  await testRegisterUser();
  
  console.log('\n📋 --- Tests de Consulta de Reviews ---\n');
  await testGetPropertyReviews();
  await testGetPropertyReviewStats();
  
  console.log('\n✍️ --- Tests de Creación de Reviews ---\n');
  await testCreateReview();
  await testCreateReviewNoAuth();
  await testCreateReviewInvalidData();
  
  console.log('\n👤 --- Tests de Reviews de Usuario ---\n');
  await testGetUserReviews();
  
  console.log('\n📝 --- Tests de Actualización de Reviews ---\n');
  await testUpdateReview();
  await testUpdateReviewInvalidRating();
  
  console.log('\n📊 --- Tests de Estadísticas ---\n');
  await testGetReviewStats();
  
  console.log('\n🔍 --- Tests de Estructura y Datos ---\n');
  await testReviewDataStructure();
  await testDatabaseConsistency();
  
  console.log('\n🗑️ --- Tests de Eliminación ---\n');
  await testDeleteReview();
  
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
  fs.writeFileSync('test-reviews-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Resultados guardados en test-reviews-results.json\n');
  
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

