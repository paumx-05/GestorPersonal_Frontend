/**
 * 🧪 SCRIPT DE PRUEBAS QA PARA API AIRBNB BACKEND
 * Colección: USUARIOS (CRUD)
 * 
 * Este script prueba los endpoints de gestión de usuarios
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
let createdUserId = '';

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
      ? `Headers presentes` 
      : `Faltan: ${missingHeaders.join(', ')}`
  );

  return allPresent;
}

/**
 * PRUEBA 0: Login para obtener token de admin
 */
async function test0_Login() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}SETUP: Login como Admin${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const hasToken = response.body?.data?.token || response.body?.token;
    if (hasToken) {
      authToken = hasToken;
      console.log(`${colors.green}✓ Token de admin obtenido exitosamente${colors.reset}\n`);
    } else {
      console.log(`${colors.red}✗ No se pudo obtener el token de admin${colors.reset}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error en login: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

/**
 * PRUEBA 1: Listar Usuarios (GET /api/users)
 */
async function test1_ListUsers() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 1: Listar Usuarios${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('GET', '/api/users?page=1&limit=10', null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'GET /api/users - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'GET /api/users');

    const users = response.body?.data?.users || response.body?.users || response.body?.data;
    logTest(
      'GET /api/users - Devuelve lista de usuarios',
      Array.isArray(users),
      users ? `${users.length} usuarios encontrados` : 'Sin datos'
    );

    logTest(
      'GET /api/users - Incluye paginación',
      !!(response.body?.data?.pagination || response.body?.pagination),
      'Datos de paginación presentes'
    );

  } catch (error) {
    logTest('GET /api/users - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 2: Obtener Estadísticas de Usuarios (GET /api/users/stats)
 */
async function test2_UserStats() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 2: Estadísticas de Usuarios${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('GET', '/api/users/stats', null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'GET /api/users/stats - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'GET /api/users/stats');

    const stats = response.body?.data || response.body;
    logTest(
      'GET /api/users/stats - Devuelve estadísticas',
      !!(stats && (stats.total !== undefined || stats.totalUsers !== undefined)),
      stats ? `Total usuarios: ${stats.total || stats.totalUsers || 'N/A'}` : 'Sin datos'
    );

  } catch (error) {
    logTest('GET /api/users/stats - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 3: Crear Usuario (POST /api/users)
 */
async function test3_CreateUser() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 3: Crear Usuario${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const newUser = {
    email: `testuser_${Date.now()}@airbnb.com`,
    name: 'Usuario Test QA',
    password: 'TestPassword123!',
    avatar: 'https://via.placeholder.com/150'
  };

  try {
    const response = await makeRequest('POST', '/api/users', newUser, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'POST /api/users - Responde correctamente',
      response.status === 200 || response.status === 201,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'POST /api/users');

    const userData = response.body?.data?.user || response.body?.user || response.body?.data;
    logTest(
      'POST /api/users - Devuelve datos del usuario creado',
      !!userData,
      userData?.email || 'Sin datos'
    );

    if (userData && userData.id) {
      createdUserId = userData.id;
      logTest(
        'POST /api/users - Usuario tiene ID asignado',
        true,
        `ID: ${createdUserId}`
      );
    } else if (userData && userData._id) {
      createdUserId = userData._id;
      logTest(
        'POST /api/users - Usuario tiene ID asignado',
        true,
        `ID: ${createdUserId}`
      );
    }

  } catch (error) {
    logTest('POST /api/users - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 4: Obtener Usuario por ID (GET /api/users/:id)
 */
async function test4_GetUserById() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 4: Obtener Usuario por ID${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  if (!createdUserId) {
    logTest('GET /api/users/:id - ID no disponible', false, 'Usuario no fue creado en prueba anterior');
    return;
  }

  try {
    const response = await makeRequest('GET', `/api/users/${createdUserId}`, null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'GET /api/users/:id - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'GET /api/users/:id');

    const userData = response.body?.data?.user || response.body?.user || response.body?.data;
    logTest(
      'GET /api/users/:id - Devuelve datos del usuario',
      !!userData,
      userData?.email || 'Sin datos'
    );

    logTest(
      'GET /api/users/:id - ID coincide con el solicitado',
      userData?.id === createdUserId || userData?._id === createdUserId,
      `ID: ${userData?.id || userData?._id}`
    );

  } catch (error) {
    logTest('GET /api/users/:id - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 5: Actualizar Usuario (PUT /api/users/:id)
 */
async function test5_UpdateUser() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 5: Actualizar Usuario${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  if (!createdUserId) {
    logTest('PUT /api/users/:id - ID no disponible', false, 'Usuario no fue creado');
    return;
  }

  const updateData = {
    name: 'Usuario Test QA Actualizado',
    avatar: 'https://via.placeholder.com/200'
  };

  try {
    const response = await makeRequest('PUT', `/api/users/${createdUserId}`, updateData, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'PUT /api/users/:id - Responde correctamente',
      response.status === 200,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'PUT /api/users/:id');

    const userData = response.body?.data?.user || response.body?.user || response.body?.data;
    logTest(
      'PUT /api/users/:id - Devuelve datos actualizados',
      !!userData,
      userData?.name || 'Sin datos'
    );

    logTest(
      'PUT /api/users/:id - Nombre actualizado correctamente',
      userData?.name === updateData.name,
      `Nombre: ${userData?.name}`
    );

  } catch (error) {
    logTest('PUT /api/users/:id - Error en la petición', false, error.message);
  }
}

/**
 * PRUEBA 6: Eliminar Usuario (DELETE /api/users/:id)
 */
async function test6_DeleteUser() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}PRUEBA 6: Eliminar Usuario${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  if (!createdUserId) {
    logTest('DELETE /api/users/:id - ID no disponible', false, 'Usuario no fue creado');
    return;
  }

  try {
    const response = await makeRequest('DELETE', `/api/users/${createdUserId}`, null, {
      'Authorization': `Bearer ${authToken}`
    });

    logTest(
      'DELETE /api/users/:id - Responde correctamente',
      response.status === 200 || response.status === 204,
      `Status: ${response.status}`
    );

    verifyHeaders(response.headers, 'DELETE /api/users/:id');

    logTest(
      'DELETE /api/users/:id - Mensaje de confirmación',
      !!(response.body?.message || response.body?.data?.message || response.status === 204),
      response.body?.message || response.body?.data?.message || 'Usuario eliminado'
    );

  } catch (error) {
    logTest('DELETE /api/users/:id - Error en la petición', false, error.message);
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
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';
    
    await mongoose.connect(MONGODB_URI);
    logTest('Conexión a MongoDB', true, 'Conectado exitosamente');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Verificar usuario admin existe
    const adminUser = await User.findOne({ email: ADMIN_EMAIL });
    logTest(
      'Usuario admin existe en BD',
      !!adminUser,
      adminUser ? `ID: ${adminUser._id}` : 'No encontrado'
    );

    // Contar usuarios totales
    const userCount = await User.countDocuments();
    logTest(
      'Total de usuarios en BD',
      userCount > 0,
      `Total: ${userCount} usuarios`
    );

    // Verificar que el usuario de prueba fue eliminado
    if (createdUserId) {
      const deletedUser = await User.findById(createdUserId);
      logTest(
        'Usuario de prueba eliminado correctamente',
        !deletedUser || deletedUser.isActive === false,
        deletedUser ? 'Usuario aún existe (soft delete)' : 'Usuario eliminado de BD'
      );
    }

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
  console.log(`${colors.cyan}║  Colección: USUARIOS (CRUD)           ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════╝${colors.reset}\n`);

  await test0_Login();
  await test1_ListUsers();
  await test2_UserStats();
  await test3_CreateUser();
  await test4_GetUserById();
  await test5_UpdateUser();
  await test6_DeleteUser();
  await test7_VerifyDatabase();

  const report = generateReport();

  // Guardar reporte en archivo JSON
  const fs = require('fs');
  fs.writeFileSync('test-usuarios-results.json', JSON.stringify(report, null, 2));
  console.log(`${colors.cyan}Reporte guardado en: test-usuarios-results.json${colors.reset}\n`);

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

