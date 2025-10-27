/**
 * 🧪 SCRIPT DE PRUEBAS QA PARA API AIRBNB BACKEND
 * 
 * Este script prueba los endpoints de autenticación
 * y verifica los cambios en la base de datos
 */

const https = require('https');
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
  cyan: '\x1b[36m'
};

// Resultados de las pruebas
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

let authToken = '';

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
  let missingHeaders = [];

  for (const header of requiredHeaders) {
    if (!headers[header]) {
      allPresent = false;
      missingHeaders.push(header);
    }
  }

  logTest(
    `${testName} - Encabezados correctos`,
    allPresent,
    allPresent 
      ? `Encabezados presentes: ${Object.keys(headers).join(', ')}` 
      : `Faltan encabezados: ${missingHeaders.join(', ')}`
  );

  return allPresent;
}

/**
 * PRUEBA 1: Información de la API
 */
async function test1_APIInfo() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 1: Información de la API${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('GET', '/');
    
    logTest(
      'GET / - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'GET /');

    logTest(
      'GET / - Contiene información de la API',
      response.body && response.body.message,
      response.body?.message || 'Sin mensaje'
    );
  } catch (error) {
    logTest('GET / - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 2: Login con credenciales de admin
 */
async function test2_Login() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 2: Login (Admin)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    logTest(
      'POST /api/auth/login - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'POST /api/auth/login');

    const hasToken = response.body?.data?.token || response.body?.token;
    logTest(
      'POST /api/auth/login - Devuelve token',
      !!hasToken,
      hasToken ? 'Token recibido' : 'No se recibió token'
    );

    if (hasToken) {
      authToken = hasToken;
      console.log(`  ${colors.yellow}Token guardado para pruebas subsecuentes${colors.reset}`);
    }

    logTest(
      'POST /api/auth/login - Devuelve datos de usuario',
      response.body?.data?.user || response.body?.user,
      response.body?.data?.user?.email || response.body?.user?.email || 'Sin email'
    );

    const userData = response.body?.data?.user || response.body?.user;
    logTest(
      'POST /api/auth/login - Usuario es admin',
      userData?.role === 'admin' || userData?.email === ADMIN_EMAIL,
      `Role: ${userData?.role || 'N/A'}, Email: ${userData?.email || 'N/A'}`
    );
  } catch (error) {
    logTest('POST /api/auth/login - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 3: Obtener perfil autenticado
 */
async function test3_GetProfile() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 3: Obtener Perfil${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  if (!authToken) {
    logTest('GET /api/auth/me - Token no disponible', false, 'Prueba de login falló');
    return;
  }

  try {
    const response = await makeRequest('GET', '/api/auth/me', null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'GET /api/auth/me - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'GET /api/auth/me');

    const userData = response.body?.data?.user || response.body?.user || response.body?.data;
    logTest(
      'GET /api/auth/me - Devuelve datos del usuario',
      !!userData,
      userData?.email || 'Sin datos'
    );

    logTest(
      'GET /api/auth/me - Email correcto',
      userData?.email === ADMIN_EMAIL,
      `Email: ${userData?.email || 'N/A'}`
    );
  } catch (error) {
    logTest('GET /api/auth/me - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 4: Registrar nuevo usuario
 */
async function test4_Register() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 4: Registrar Usuario${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const newUser = {
    email: `test_${Date.now()}@airbnb.com`,
    password: 'Test1234!',
    name: 'Usuario Test QA'
  };

  try {
    const response = await makeRequest('POST', '/api/auth/register', newUser);

    logTest(
      'POST /api/auth/register - Responde correctamente',
      response.status === 200 || response.status === 201,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'POST /api/auth/register');

    logTest(
      'POST /api/auth/register - Devuelve token',
      !!(response.body?.data?.token || response.body?.token),
      'Token generado para nuevo usuario'
    );

    logTest(
      'POST /api/auth/register - Devuelve datos de usuario',
      !!(response.body?.data?.user || response.body?.user),
      (response.body?.data?.user?.email || response.body?.user?.email || 'Sin email')
    );
  } catch (error) {
    logTest('POST /api/auth/register - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 5: Olvidé mi contraseña
 */
async function test5_ForgotPassword() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 5: Olvidé mi Contraseña${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('POST', '/api/auth/forgot-password', {
      email: ADMIN_EMAIL
    });

    logTest(
      'POST /api/auth/forgot-password - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'POST /api/auth/forgot-password');

    logTest(
      'POST /api/auth/forgot-password - Mensaje de confirmación',
      !!(response.body?.message || response.body?.data?.message),
      response.body?.message || response.body?.data?.message || 'Sin mensaje'
    );
  } catch (error) {
    logTest('POST /api/auth/forgot-password - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 6: Logout
 */
async function test6_Logout() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 6: Logout${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  if (!authToken) {
    logTest('POST /api/auth/logout - Token no disponible', false, 'Prueba de login falló');
    return;
  }

  try {
    const response = await makeRequest('POST', '/api/auth/logout', null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'POST /api/auth/logout - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'POST /api/auth/logout');

    logTest(
      'POST /api/auth/logout - Mensaje de confirmación',
      !!(response.body?.message || response.body?.data?.message),
      response.body?.message || response.body?.data?.message || 'Sin mensaje'
    );
  } catch (error) {
    logTest('POST /api/auth/logout - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 7: Verificar cambios en la base de datos
 */
async function test7_VerifyDatabase() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 7: Verificar Base de Datos${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    // Conectar a MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';
    
    await mongoose.connect(MONGODB_URI);
    logTest('Conexión a MongoDB', true, 'Conectado exitosamente');

    // Verificar usuario admin
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const adminUser = await User.findOne({ email: ADMIN_EMAIL });
    
    logTest(
      'Usuario admin existe en BD',
      !!adminUser,
      adminUser ? `ID: ${adminUser._id}` : 'No encontrado'
    );

    if (adminUser) {
      logTest(
        'Usuario admin tiene role correcto',
        adminUser.role === 'admin',
        `Role: ${adminUser.role}`
      );

      logTest(
        'Usuario admin está activo',
        adminUser.isActive === true,
        `isActive: ${adminUser.isActive}`
      );
    }

    // Contar usuarios registrados
    const userCount = await User.countDocuments();
    logTest(
      'Usuarios en base de datos',
      userCount >= 2,
      `Total usuarios: ${userCount}`
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
  console.log(`${colors.cyan}║  Colección: Autenticación             ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════╝${colors.reset}\n`);

  await test1_APIInfo();
  await test2_Login();
  await test3_GetProfile();
  await test4_Register();
  await test5_ForgotPassword();
  await test6_Logout();
  await test7_VerifyDatabase();

  const report = generateReport();

  // Guardar reporte en archivo JSON
  const fs = require('fs');
  fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
  console.log(`${colors.cyan}Reporte guardado en: test-results.json${colors.reset}\n`);

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

