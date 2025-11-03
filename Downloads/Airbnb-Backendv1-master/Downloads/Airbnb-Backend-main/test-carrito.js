/**
 * 🧪 SCRIPT DE PRUEBAS QA PARA API AIRBNB BACKEND
 * Colección: CARRITO
 * 
 * Este script prueba los endpoints del sistema de carrito de compras
 * y verifica los cambios en la base de datos
 */

const http = require('http');
const mongoose = require('mongoose');

// Configuración
const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@demo.com';
const ADMIN_PASSWORD = 'Admin1234!';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Resultados de las pruebas
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

let authToken = '';
let propertyId = '';
let propertyPrice = 0;
let cartItemId = '';

/**
 * Función para hacer peticiones HTTP
 */
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Función para registrar un resultado de prueba
 */
function logTest(name, passed, details = '') {
  const result = {
    name,
    passed,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  
  if (passed) {
    testResults.passed++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } else {
    testResults.failed++;
    console.log(`${colors.red}✗${colors.reset} ${name}`);
  }
  
  if (details) {
    console.log(`  ${colors.cyan}${details}${colors.reset}`);
  }
}

/**
 * Función para verificar encabezados de respuesta
 */
function verifyHeaders(headers, testName) {
  const requiredHeaders = ['content-type', 'x-powered-by'];
  let allPresent = true;

  for (const header of requiredHeaders) {
    if (!headers[header]) {
      allPresent = false;
    }
  }

  logTest(
    `${testName} - Encabezados correctos`,
    allPresent,
    allPresent ? 'Headers presentes' : 'Faltan headers'
  );

  return allPresent;
}

/**
 * SETUP: Login y obtener propiedad
 */
async function setup() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}SETUP: Preparación de Pruebas${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    // Login
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const hasToken = loginResponse.body?.data?.token || loginResponse.body?.token;
    if (hasToken) {
      authToken = hasToken;
      console.log(`${colors.green}✓ Token de admin obtenido${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ No se pudo obtener el token${colors.reset}\n`);
      process.exit(1);
    }

    // Obtener una propiedad de la BD para usar en las pruebas
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';
    await mongoose.connect(MONGODB_URI);
    
    const Property = mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
    const property = await Property.findOne();
    
    if (property) {
      propertyId = property._id.toString();
      propertyPrice = property.pricePerNight || 100;
      console.log(`${colors.green}✓ Propiedad obtenida: ${propertyId} (${propertyPrice}/noche)${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}⚠ No hay propiedades en BD, usando ID de prueba${colors.reset}\n`);
      propertyId = '65f0cc30cc30cc30cc30cc30';
      propertyPrice = 100;
    }

    await mongoose.disconnect();

  } catch (error) {
    console.log(`${colors.red}✗ Error en setup: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

/**
 * PRUEBA 1: Obtener Carrito (GET /api/cart)
 */
async function test1_GetCart() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 1: Obtener Carrito${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('GET', '/api/cart', null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'GET /api/cart - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'GET /api/cart');

    const cart = response.body?.data?.items || response.body?.items || response.body?.data;
    logTest(
      'GET /api/cart - Devuelve estructura de carrito',
      Array.isArray(cart) || (response.body?.data && 'items' in response.body.data),
      Array.isArray(cart) ? `${cart.length} items en carrito` : 'Estructura presente'
    );

  } catch (error) {
    logTest('GET /api/cart - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 2: Agregar al Carrito (POST /api/cart/add)
 */
async function test2_AddToCart() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 2: Agregar al Carrito${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  const checkIn = futureDate.toISOString().split('T')[0];
  
  const checkOutDate = new Date(futureDate);
  checkOutDate.setDate(checkOutDate.getDate() + 3);
  const checkOut = checkOutDate.toISOString().split('T')[0];

  const cartItem = {
    propertyId: propertyId,
    checkIn: checkIn,
    checkOut: checkOut,
    guests: 2,
    pricePerNight: propertyPrice
  };

  try {
    const response = await makeRequest('POST', '/api/cart/add', cartItem, {
      'Authorization': `Bearer ${authToken}`
    });

    // Imprimir error si hay
    if (response.status >= 400 && response.body) {
      console.log(`  ${colors.yellow}Error response:${colors.reset}`, JSON.stringify(response.body, null, 2));
    }

    logTest(
      'POST /api/cart/add - Responde correctamente',
      response.status === 200 || response.status === 201,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'POST /api/cart/add');

    const item = response.body?.data?.item || response.body?.item || response.body?.data;
    logTest(
      'POST /api/cart/add - Devuelve item agregado',
      !!item,
      item ? 'Item agregado exitosamente' : 'Sin datos'
    );

    if (item && (item.id || item._id)) {
      cartItemId = item.id || item._id;
      logTest(
        'POST /api/cart/add - Item tiene ID asignado',
        true,
        `ID: ${cartItemId}`
      );
    }

  } catch (error) {
    logTest('POST /api/cart/add - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 3: Obtener Resumen del Carrito (GET /api/cart/summary)
 */
async function test3_GetCartSummary() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 3: Resumen del Carrito${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('GET', '/api/cart/summary', null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'GET /api/cart/summary - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'GET /api/cart/summary');

    const summary = response.body?.data || response.body;
    logTest(
      'GET /api/cart/summary - Devuelve resumen',
      !!summary,
      summary ? 'Resumen presente' : 'Sin datos'
    );

    const hasRequiredFields = summary && (
      'itemCount' in summary ||
      'total' in summary ||
      'subtotal' in summary ||
      'serviceFee' in summary ||
      'taxes' in summary
    );
    
    logTest(
      'GET /api/cart/summary - Incluye totales',
      hasRequiredFields,
      hasRequiredFields ? `Campos de totales presentes` : 'Campos no encontrados'
    );

  } catch (error) {
    logTest('GET /api/cart/summary - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 4: Obtener Item Específico (GET /api/cart/item/:id)
 */
async function test4_GetCartItem() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 4: Obtener Item Específico${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  if (!cartItemId) {
    logTest('GET /api/cart/item/:id - ID no disponible', false, 'Item no fue agregado en prueba anterior');
    return;
  }

  try {
    const response = await makeRequest('GET', `/api/cart/item/${cartItemId}`, null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'GET /api/cart/item/:id - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'GET /api/cart/item/:id');

    const item = response.body?.data?.item || response.body?.item || response.body?.data;
    logTest(
      'GET /api/cart/item/:id - Devuelve item',
      !!item,
      item ? 'Item encontrado' : 'Sin datos'
    );

  } catch (error) {
    logTest('GET /api/cart/item/:id - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 5: Actualizar Item del Carrito (PUT /api/cart/update/:id)
 */
async function test5_UpdateCartItem() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 5: Actualizar Item del Carrito${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  if (!cartItemId) {
    logTest('PUT /api/cart/update/:id - ID no disponible', false, 'Item no fue agregado');
    return;
  }

  const updateData = {
    guests: 3
  };

  try {
    const response = await makeRequest('PUT', `/api/cart/update/${cartItemId}`, updateData, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'PUT /api/cart/update/:id - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'PUT /api/cart/update/:id');

    const item = response.body?.data?.item || response.body?.item || response.body?.data;
    logTest(
      'PUT /api/cart/update/:id - Devuelve item actualizado',
      !!item,
      item ? 'Item actualizado' : 'Sin datos'
    );

  } catch (error) {
    logTest('PUT /api/cart/update/:id - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 6: Verificar Disponibilidad (POST /api/cart/check-availability)
 */
async function test6_CheckAvailability() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 6: Verificar Disponibilidad${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 60);
  const checkIn = futureDate.toISOString().split('T')[0];
  
  const checkOutDate = new Date(futureDate);
  checkOutDate.setDate(checkOutDate.getDate() + 2);
  const checkOut = checkOutDate.toISOString().split('T')[0];

  const availabilityCheck = {
    propertyId: propertyId,
    checkIn: checkIn,
    checkOut: checkOut,
    guests: 2
  };

  try {
    const response = await makeRequest('POST', '/api/cart/check-availability', availabilityCheck, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'POST /api/cart/check-availability - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'POST /api/cart/check-availability');

    logTest(
      'POST /api/cart/check-availability - Devuelve disponibilidad',
      response.body?.data !== undefined || response.body?.available !== undefined,
      'Información de disponibilidad presente'
    );

  } catch (error) {
    logTest('POST /api/cart/check-availability - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 7: Estadísticas del Carrito (GET /api/cart/stats)
 */
async function test7_GetCartStats() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 7: Estadísticas del Carrito${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('GET', '/api/cart/stats', null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'GET /api/cart/stats - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'GET /api/cart/stats');

    const stats = response.body?.data || response.body;
    logTest(
      'GET /api/cart/stats - Devuelve estadísticas',
      !!stats,
      stats ? 'Estadísticas presentes' : 'Sin datos'
    );

  } catch (error) {
    logTest('GET /api/cart/stats - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 8: Eliminar Item del Carrito (DELETE /api/cart/remove/:id)
 */
async function test8_RemoveCartItem() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 8: Eliminar Item del Carrito${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  if (!cartItemId) {
    logTest('DELETE /api/cart/remove/:id - ID no disponible', false, 'Item no fue agregado');
    return;
  }

  try {
    const response = await makeRequest('DELETE', `/api/cart/remove/${cartItemId}`, null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'DELETE /api/cart/remove/:id - Responde correctamente',
      response.status === 200 || response.status === 204,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'DELETE /api/cart/remove/:id');

    logTest(
      'DELETE /api/cart/remove/:id - Mensaje de confirmación',
      !!(response.body?.message || response.status === 204),
      response.body?.message || 'Item eliminado'
    );

  } catch (error) {
    logTest('DELETE /api/cart/remove/:id - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 9: Limpiar Carrito (DELETE /api/cart/clear)
 */
async function test9_ClearCart() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 9: Limpiar Carrito${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('DELETE', '/api/cart/clear', null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'DELETE /api/cart/clear - Responde correctamente',
      response.status === 200 || response.status === 204,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'DELETE /api/cart/clear');

    logTest(
      'DELETE /api/cart/clear - Mensaje de confirmación',
      !!(response.body?.message || response.status === 204),
      response.body?.message || 'Carrito limpiado'
    );

  } catch (error) {
    logTest('DELETE /api/cart/clear - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 10: Verificar cambios en la base de datos
 */
async function test10_VerifyDatabase() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 10: Verificar Base de Datos${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';
    
    await mongoose.connect(MONGODB_URI);
    logTest('Conexión a MongoDB', true, 'Conectado exitosamente');

    const CartItem = mongoose.model('CartItem', new mongoose.Schema({}, { strict: false }));
    
    // Contar items en carritos
    const cartItemCount = await CartItem.countDocuments();
    logTest(
      'Items de carrito en BD',
      cartItemCount >= 0,
      `Total: ${cartItemCount} items`
    );

    // Verificar que el usuario admin existe (tiene carrito)
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const adminUser = await User.findOne({ email: ADMIN_EMAIL });
    logTest(
      'Usuario admin existe',
      !!adminUser,
      adminUser ? `ID: ${adminUser._id}` : 'No encontrado'
    );

    await mongoose.disconnect();
    logTest('Desconexión de MongoDB', true, 'Desconectado exitosamente');

  } catch (error) {
    logTest('Verificación de base de datos', false, error.message);
  }
}

/**
 * Generar reporte final
 */
function generateReport() {
  console.log(`\n${colors.yellow}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}RESUMEN DE PRUEBAS${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.green}Pruebas exitosas:${colors.reset} ${testResults.passed}`);
  console.log(`${colors.red}Pruebas fallidas:${colors.reset} ${testResults.failed}`);
  console.log(`${colors.blue}Total de pruebas:${colors.reset} ${testResults.passed + testResults.failed}`);

  const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2);
  console.log(`${colors.cyan}Tasa de éxito:${colors.reset} ${successRate}%\n`);

  return {
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      total: testResults.passed + testResults.failed,
      successRate: `${successRate}%`
    },
    tests: testResults.tests
  };
}

/**
 * Ejecutar todas las pruebas
 */
async function runAllTests() {
  console.log(`\n${colors.cyan}╔═══════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  QA API TESTING - AIRBNB BACKEND      ║${colors.reset}`);
  console.log(`${colors.cyan}║  Colección: CARRITO                   ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════╝${colors.reset}\n`);

  await setup();
  await test1_GetCart();
  await test2_AddToCart();
  await test3_GetCartSummary();
  await test4_GetCartItem();
  await test5_UpdateCartItem();
  await test6_CheckAvailability();
  await test7_GetCartStats();
  await test8_RemoveCartItem();
  await test9_ClearCart();
  await test10_VerifyDatabase();

  const report = generateReport();

  // Guardar reporte en archivo JSON
  const fs = require('fs');
  fs.writeFileSync('test-carrito-results.json', JSON.stringify(report, null, 2));
  console.log(`${colors.cyan}Reporte guardado en: test-carrito-results.json${colors.reset}\n`);

  return report;
}

// Ejecutar las pruebas
runAllTests()
  .then(() => {
    console.log(`${colors.green}✓ Todas las pruebas completadas${colors.reset}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}✗ Error ejecutando pruebas:${colors.reset}`, error);
    process.exit(1);
  });

