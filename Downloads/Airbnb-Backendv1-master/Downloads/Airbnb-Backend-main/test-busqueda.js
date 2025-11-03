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

// Test 1: Buscar propiedades sin filtros
async function testSearchPropertiesNoFilters() {
  try {
    const response = await axios.get(`${BASE_URL}/api/search/properties`);
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    // Verificar headers de seguridad
    const headersCheck = checkSecurityHeaders(response.headers);
    
    logTest('GET /api/search/properties (sin filtros)', passed, {
      status: response.status,
      resultsCount: response.data.data?.length || 0,
      isArray: Array.isArray(response.data.data),
      securityHeaders: headersCheck
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/search/properties (sin filtros)', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 2: Buscar propiedades con filtro de ubicación
async function testSearchPropertiesByLocation() {
  try {
    // Obtener una propiedad de la BD para usar su ubicación
    const property = await db.collection('properties').findOne({});
    
    if (!property) {
      logTest('GET /api/search/properties (por ubicación)', false, {
        error: 'No hay propiedades en la base de datos'
      });
      return false;
    }
    
    const location = property.location?.city || property.location?.country || 'Paris';
    
    const response = await axios.get(`${BASE_URL}/api/search/properties`, {
      params: {
        location: location
      }
    });
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    logTest('GET /api/search/properties (por ubicación)', passed, {
      status: response.status,
      location: location,
      resultsCount: response.data.data?.length || 0
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/search/properties (por ubicación)', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 3: Buscar propiedades con filtro de huéspedes
async function testSearchPropertiesByGuests() {
  try {
    const response = await axios.get(`${BASE_URL}/api/search/properties`, {
      params: {
        guests: 2
      }
    });
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    // Verificar que las propiedades devueltas pueden alojar al menos 2 huéspedes
    const allPropertiesValid = response.data.data.every(
      prop => prop.maxGuests >= 2 || !prop.maxGuests
    );
    
    logTest('GET /api/search/properties (por huéspedes)', passed, {
      status: response.status,
      guests: 2,
      resultsCount: response.data.data?.length || 0,
      allPropertiesValid
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/search/properties (por huéspedes)', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 4: Buscar propiedades con rango de precios
async function testSearchPropertiesByPriceRange() {
  try {
    const response = await axios.get(`${BASE_URL}/api/search/properties`, {
      params: {
        minPrice: 50,
        maxPrice: 200
      }
    });
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    // Verificar que las propiedades están en el rango de precio
    const allPricesValid = response.data.data.every(
      prop => {
        const price = prop.pricePerNight || prop.price || 0;
        return price >= 50 && price <= 200;
      }
    );
    
    logTest('GET /api/search/properties (rango de precios)', passed, {
      status: response.status,
      minPrice: 50,
      maxPrice: 200,
      resultsCount: response.data.data?.length || 0,
      allPricesValid
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/search/properties (rango de precios)', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 5: Buscar propiedades con fechas
async function testSearchPropertiesByDates() {
  try {
    const response = await axios.get(`${BASE_URL}/api/search/properties`, {
      params: {
        checkIn: '2026-03-01',
        checkOut: '2026-03-05'
      }
    });
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    logTest('GET /api/search/properties (con fechas)', passed, {
      status: response.status,
      checkIn: '2026-03-01',
      checkOut: '2026-03-05',
      resultsCount: response.data.data?.length || 0
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/search/properties (con fechas)', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 6: Buscar propiedades con múltiples filtros
async function testSearchPropertiesMultipleFilters() {
  try {
    const response = await axios.get(`${BASE_URL}/api/search/properties`, {
      params: {
        guests: 2,
        minPrice: 50,
        maxPrice: 200,
        checkIn: '2026-03-01',
        checkOut: '2026-03-05'
      }
    });
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    logTest('GET /api/search/properties (múltiples filtros)', passed, {
      status: response.status,
      filters: {
        guests: 2,
        minPrice: 50,
        maxPrice: 200,
        checkIn: '2026-03-01',
        checkOut: '2026-03-05'
      },
      resultsCount: response.data.data?.length || 0
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/search/properties (múltiples filtros)', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 7: Obtener sugerencias de búsqueda
async function testSearchSuggestions() {
  try {
    const response = await axios.get(`${BASE_URL}/api/search/suggestions`, {
      params: {
        q: 'Paris'
      }
    });
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    logTest('GET /api/search/suggestions', passed, {
      status: response.status,
      query: 'Paris',
      suggestionsCount: response.data.data?.length || 0,
      isArray: Array.isArray(response.data.data)
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/search/suggestions', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 8: Obtener sugerencias sin query
async function testSearchSuggestionsNoQuery() {
  try {
    const response = await axios.get(`${BASE_URL}/api/search/suggestions`);
    
    // Debería retornar error 400 o un array vacío
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   Array.isArray(response.data.data);
    
    logTest('GET /api/search/suggestions (sin query)', passed, {
      status: response.status,
      resultsCount: response.data.data?.length || 0
    });
    
    return passed;
  } catch (error) {
    // Es aceptable que falle con 400
    const passed = error.response?.status === 400;
    
    logTest('GET /api/search/suggestions (sin query)', passed, {
      status: error.response?.status,
      error: error.response?.data?.error?.message || error.message
    });
    
    return passed;
  }
}

// Test 9: Obtener filtros disponibles
async function testGetAvailableFilters() {
  try {
    const response = await axios.get(`${BASE_URL}/api/search/filters`);
    
    const passed = response.status === 200 && 
                   response.data.success === true &&
                   response.data.data !== null;
    
    // Verificar que tiene campos esperados
    const hasExpectedFields = response.data.data && (
      'propertyTypes' in response.data.data ||
      'amenities' in response.data.data ||
      'priceRange' in response.data.data ||
      'locations' in response.data.data
    );
    
    logTest('GET /api/search/filters', passed, {
      status: response.status,
      hasExpectedFields,
      filters: response.data.data ? Object.keys(response.data.data) : []
    });
    
    return passed;
  } catch (error) {
    logTest('GET /api/search/filters', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 10: Verificar estructura de datos de búsqueda
async function testSearchDataStructure() {
  try {
    const response = await axios.get(`${BASE_URL}/api/search/properties`);
    
    if (!response.data.data || response.data.data.length === 0) {
      logTest('Verificar Estructura de Datos de Búsqueda', false, {
        error: 'No hay resultados de búsqueda para verificar'
      });
      return false;
    }
    
    const property = response.data.data[0];
    
    // Verificar campos esperados de propiedad
    const requiredFields = ['_id', 'title', 'location', 'price'];
    const recommendedFields = ['images', 'rating', 'propertyType', 'maxGuests'];
    
    const missingRequired = requiredFields.filter(field => {
      if (field === '_id') {
        return !('_id' in property || 'id' in property);
      }
      if (field === 'price') {
        return !('price' in property || 'pricePerNight' in property);
      }
      return !(field in property);
    });
    const presentRecommended = recommendedFields.filter(field => field in property);
    
    const passed = missingRequired.length === 0;
    
    logTest('Verificar Estructura de Datos de Búsqueda', passed, {
      hasAllRequired: missingRequired.length === 0,
      missingRequired,
      presentRecommended,
      recommendedFieldsCount: `${presentRecommended.length}/${recommendedFields.length}`,
      totalFields: Object.keys(property).length
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Estructura de Datos de Búsqueda', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 11: Verificar paginación (si está implementada)
async function testSearchPagination() {
  try {
    const response1 = await axios.get(`${BASE_URL}/api/search/properties`, {
      params: {
        limit: 5,
        page: 1
      }
    });
    
    const response2 = await axios.get(`${BASE_URL}/api/search/properties`, {
      params: {
        limit: 5,
        page: 2
      }
    });
    
    const passed = response1.status === 200 && 
                   response2.status === 200 &&
                   response1.data.success === true &&
                   response2.data.success === true;
    
    // Verificar que los resultados son diferentes (si hay suficientes propiedades)
    const differentResults = response1.data.data.length > 0 && 
                            response2.data.data.length > 0 &&
                            response1.data.data[0]._id !== response2.data.data[0]._id;
    
    logTest('Verificar Paginación de Búsqueda', passed, {
      page1Count: response1.data.data?.length || 0,
      page2Count: response2.data.data?.length || 0,
      differentResults
    });
    
    return passed;
  } catch (error) {
    logTest('Verificar Paginación de Búsqueda', false, {
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

// Test 12: Verificar CORS y Content-Type
async function testHeadersValidation() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/search/properties`,
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
  console.log('\n🧪 ===== INICIANDO PRUEBAS DE BÚSQUEDA =====\n');
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
  console.log(`📊 Total de propiedades en BD: ${propertyCount}\n`);
  
  if (propertyCount === 0) {
    console.log('⚠️  Advertencia: No hay propiedades en la base de datos. Algunos tests pueden fallar.\n');
  }
  
  // Ejecutar tests
  console.log('🔍 --- Tests de Búsqueda de Propiedades ---\n');
  await testSearchPropertiesNoFilters();
  await testSearchPropertiesByLocation();
  await testSearchPropertiesByGuests();
  await testSearchPropertiesByPriceRange();
  await testSearchPropertiesByDates();
  await testSearchPropertiesMultipleFilters();
  
  console.log('\n💡 --- Tests de Sugerencias ---\n');
  await testSearchSuggestions();
  await testSearchSuggestionsNoQuery();
  
  console.log('\n🎛️ --- Tests de Filtros ---\n');
  await testGetAvailableFilters();
  
  console.log('\n🔍 --- Tests de Estructura y Datos ---\n');
  await testSearchDataStructure();
  await testSearchPagination();
  
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
  fs.writeFileSync('test-busqueda-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Resultados guardados en test-busqueda-results.json\n');
  
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

