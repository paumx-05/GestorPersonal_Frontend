const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

const BASE_URL = 'http://localhost:5000';
const MONGODB_URI = 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';

let authToken = '';
let mongoClient;
let db;
let testUserId = '';
let testUserEmail = `test.properties.${Date.now()}@demo.com`;

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
      name: 'Test User Properties'
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

// Test 1: Obtener Propiedad Específica (GET /api/properties/:id)
async function testGetProperty() {
  try {
    // Primero verificar si hay propiedades en la BD
    const propertyCount = await countInDatabase('properties');
    
    if (propertyCount === 0) {
      logTest('GET /api/properties/:id', false, {
        error: 'No hay propiedades en la base de datos para probar'
      });
      return false;
    }
    
    // Obtener la primera propiedad disponible
    const firstProperty = await db.collection('properties').findOne({});
    const propertyId = firstProperty._id.toString();
    
    const response = await axios.get(`${BASE_URL}/api/properties/${propertyId}`);
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   response.data.data !== null;
    
    // Verificar headers de seguridad
    const headersCheck = checkSecurityHeaders(response.headers);
    
    // Verificar en BD
    const dbProperty = await verifyInDatabase('properties', { _id: firstProperty._id });
    
    logTest('GET /api/properties/:id', passed, {
      status: response.status,
      propertyId,
      hasData: !!response.data.data,
      securityHeaders: headersCheck,
      dbVerification: !!dbProperty,
      propertyTitle: response.data.data?.title
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/properties/:id', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 2: Obtener Propiedad con ID inválido
async function testGetPropertyInvalidId() {
  try {
    const invalidId = '000000000000000000000000'; // ObjectId válido pero inexistente
    const response = await axios.get(`${BASE_URL}/api/properties/${invalidId}`);
    
    // Si llegamos aquí, la respuesta fue exitosa, lo cual no es correcto
    const passed = false;
    
    logTest('GET /api/properties/:id (ID inválido)', passed, {
      status: response.status,
      note: 'Debería retornar 404, pero retornó ' + response.status,
      data: response.data
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 404
    const passed = error.response?.status === 404 || error.response?.status === 400;
    
    logTest('GET /api/properties/:id (ID inválido)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message,
      correct: passed ? 'Correctamente retorna error' : 'No retorna el código esperado'
    });
    
    return passed;
  }
}

// Test 3: Obtener Propiedad con ID malformado
async function testGetPropertyMalformedId() {
  try {
    const malformedId = 'not-a-valid-id';
    const response = await axios.get(`${BASE_URL}/api/properties/${malformedId}`);
    
    const passed = false;
    
    logTest('GET /api/properties/:id (ID malformado)', passed, {
      status: response.status,
      note: 'Debería retornar 400, pero retornó ' + response.status
    });
    
    return passed;
  } catch (error) {
    // Es correcto que falle con 400
    const passed = error.response?.status === 400;
    
    logTest('GET /api/properties/:id (ID malformado)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 4: Propiedades Populares (GET /api/properties/popular)
async function testGetPopularProperties() {
  try {
    const response = await axios.get(`${BASE_URL}/api/properties/popular?limit=10`);
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    // Verificar headers de seguridad
    const headersCheck = checkSecurityHeaders(response.headers);
    
    // Verificar que haya propiedades en la BD
    const propertyCount = await countInDatabase('properties');
    
    logTest('GET /api/properties/popular', passed, {
      status: response.status,
      propertiesReturned: response.data.data?.length || 0,
      isArray: Array.isArray(response.data.data),
      securityHeaders: headersCheck,
      totalPropertiesInDB: propertyCount,
      sampleProperty: response.data.data?.[0] ? {
        id: response.data.data[0]._id,
        title: response.data.data[0].title,
        price: response.data.data[0].price
      } : null
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/properties/popular', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 5: Propiedades Populares sin query params
async function testGetPopularPropertiesNoParams() {
  try {
    const response = await axios.get(`${BASE_URL}/api/properties/popular`);
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    logTest('GET /api/properties/popular (sin params)', passed, {
      status: response.status,
      propertiesReturned: response.data.data?.length || 0,
      isArray: Array.isArray(response.data.data),
      hasDefaultLimit: response.data.data?.length > 0
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/properties/popular (sin params)', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 6: Propiedades Populares con límite personalizado
async function testGetPopularPropertiesWithLimit() {
  try {
    const limit = 3;
    const response = await axios.get(`${BASE_URL}/api/properties/popular?limit=${limit}`);
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data) &&
                   response.data.data.length <= limit;
    
    logTest('GET /api/properties/popular (límite=3)', passed, {
      status: response.status,
      requestedLimit: limit,
      propertiesReturned: response.data.data?.length || 0,
      respectsLimit: response.data.data?.length <= limit
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/properties/popular (límite=3)', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 7: Verificar estructura de datos de propiedad
async function testPropertyDataStructure() {
  try {
    // Obtener la primera propiedad disponible
    const firstProperty = await db.collection('properties').findOne({});
    
    if (!firstProperty) {
      logTest('Verificar Estructura de Datos de Propiedad', false, {
        error: 'No hay propiedades en la base de datos'
      });
      return false;
    }
    
    const propertyId = firstProperty._id.toString();
    const response = await axios.get(`${BASE_URL}/api/properties/${propertyId}`);
    
    const property = response.data.data;
    
    // Verificar campos esperados
    const requiredFields = ['_id', 'title', 'description', 'price'];
    const recommendedFields = ['address', 'bedrooms', 'bathrooms', 'guests', 'amenities', 'images'];
    
    const missingRequired = requiredFields.filter(field => !(field in property));
    const presentRecommended = recommendedFields.filter(field => field in property);
    
    const passed = missingRequired.length === 0;
    
    logTest('Verificar Estructura de Datos de Propiedad', passed, {
      hasAllRequired: missingRequired.length === 0,
      missingRequired,
      presentRecommended,
      recommendedFieldsCount: `${presentRecommended.length}/${recommendedFields.length}`,
      totalFields: Object.keys(property).length
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Estructura de Datos de Propiedad', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 8: Verificar CORS headers
async function testCORSHeaders() {
  try {
    const response = await axios.get(`${BASE_URL}/api/properties/popular`, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    const hasCORS = 'access-control-allow-origin' in response.headers;
    
    const passed = hasCORS;
    
    logTest('Verificar CORS Headers', passed, {
      hasCORSHeader: hasCORS,
      corsValue: response.headers['access-control-allow-origin']
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar CORS Headers', false, {
      error: error.message
    });
    return false;
  }
}

// Test 9: Verificar Content-Type headers
async function testContentTypeHeaders() {
  try {
    const response = await axios.get(`${BASE_URL}/api/properties/popular`);
    
    const isJSON = response.headers['content-type']?.includes('application/json');
    
    const passed = isJSON;
    
    logTest('Verificar Content-Type JSON', passed, {
      contentType: response.headers['content-type'],
      isJSON
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Content-Type JSON', false, {
      error: error.message
    });
    return false;
  }
}

// Test 10: Verificar que las propiedades en BD coincidan con las devueltas
async function testDatabaseConsistency() {
  try {
    const firstProperty = await db.collection('properties').findOne({});
    
    if (!firstProperty) {
      logTest('Verificar Consistencia con BD', false, {
        error: 'No hay propiedades en la base de datos'
      });
      return false;
    }
    
    const propertyId = firstProperty._id.toString();
    const response = await axios.get(`${BASE_URL}/api/properties/${propertyId}`);
    
    const apiProperty = response.data.data;
    
    // Comparar campos básicos
    const titleMatches = apiProperty.title === firstProperty.title;
    const priceMatches = apiProperty.price === (firstProperty.pricePerNight || firstProperty.price);
    const descriptionMatches = apiProperty.description === firstProperty.description;
    
    const passed = titleMatches && priceMatches && descriptionMatches;
    
    logTest('Verificar Consistencia con BD', passed, {
      titleMatches,
      priceMatches,
      descriptionMatches,
      apiData: {
        title: apiProperty.title,
        price: apiProperty.price
      },
      dbData: {
        title: firstProperty.title,
        price: firstProperty.pricePerNight || firstProperty.price
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

// Test 11: Verificar paginación implícita en popular
async function testPopularPropertiesPagination() {
  try {
    const response1 = await axios.get(`${BASE_URL}/api/properties/popular?limit=100`);
    const totalProperties = await countInDatabase('properties');
    
    const returned = response1.data.data?.length || 0;
    const shouldBeLimited = returned <= 100;
    
    const passed = response1.status === 200 && shouldBeLimited;
    
    logTest('Verificar Paginación/Límite en Popular', passed, {
      status: response1.status,
      totalInDB: totalProperties,
      returned,
      respectsMaxLimit: shouldBeLimited
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Paginación/Límite en Popular', false, {
      error: error.message
    });
    return false;
  }
}

// Función principal
async function runTests() {
  console.log('\n🧪 ===== INICIANDO PRUEBAS DE PROPIEDADES =====\n');
  console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
  console.log(`🌐 URL Base: ${BASE_URL}\n`);
  
  // Conectar a MongoDB
  const dbConnected = await connectToMongoDB();
  if (!dbConnected) {
    console.error('❌ No se pudo conectar a MongoDB. Abortando pruebas.');
    return;
  }
  
  // Verificar cuántas propiedades hay en la BD
  const propertyCount = await countInDatabase('properties');
  console.log(`📊 Total de propiedades en BD: ${propertyCount}\n`);
  
  if (propertyCount === 0) {
    console.log('⚠️  Advertencia: No hay propiedades en la base de datos. Algunos tests pueden fallar.\n');
  }
  
  // Ejecutar tests
  console.log('📝 --- Tests de Autenticación ---\n');
  await testRegisterUser();
  
  console.log('\n📋 --- Tests de Propiedades Individuales ---\n');
  await testGetProperty();
  await testGetPropertyInvalidId();
  await testGetPropertyMalformedId();
  
  console.log('\n🌟 --- Tests de Propiedades Populares ---\n');
  await testGetPopularProperties();
  await testGetPopularPropertiesNoParams();
  await testGetPopularPropertiesWithLimit();
  
  console.log('\n🔍 --- Tests de Estructura y Datos ---\n');
  await testPropertyDataStructure();
  await testDatabaseConsistency();
  await testPopularPropertiesPagination();
  
  console.log('\n🔒 --- Tests de Headers y Seguridad ---\n');
  await testCORSHeaders();
  await testContentTypeHeaders();
  
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
  fs.writeFileSync('test-propiedades-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Resultados guardados en test-propiedades-results.json\n');
  
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

