const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

// ============================================================
// CONFIGURACIÓN
// ============================================================
const BASE_URL = 'http://localhost:5000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';

// Credenciales de admin
const ADMIN_CREDENTIALS = {
  email: 'admin@demo.com',
  password: 'Admin1234!'
};

// Variables globales
let authToken = '';
let currentUserId = '';
let mongoClient = null;
let db = null;
const testResults = [];

// IDs de prueba
let createdTransactionId = null;
let createdPropertyId = '65f0cc30cc30cc30cc30cc30'; // ID de propiedad de prueba

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================

// Conectar a MongoDB
async function connectToDatabase() {
  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db();
    console.log('✅ Conectado a MongoDB para verificaciones\n');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    throw error;
  }
}

// Cerrar conexión a MongoDB
async function closeDatabaseConnection() {
  if (mongoClient) {
    await mongoClient.close();
    console.log('\n✅ Conexión a MongoDB cerrada');
  }
}

// Verificar que un documento existe en la base de datos
async function verifyInDatabase(collection, query) {
  try {
    const result = await db.collection(collection).findOne(query);
    return result !== null;
  } catch (error) {
    console.error(`Error verificando en ${collection}:`, error.message);
    return false;
  }
}

// Contar documentos en la base de datos
async function countInDatabase(collection, query) {
  try {
    const count = await db.collection(collection).countDocuments(query);
    return count;
  } catch (error) {
    console.error(`Error contando en ${collection}:`, error.message);
    return 0;
  }
}

// Obtener un documento de la base de datos
async function getFromDatabase(collection, query) {
  try {
    const result = await db.collection(collection).findOne(query);
    return result;
  } catch (error) {
    console.error(`Error obteniendo de ${collection}:`, error.message);
    return null;
  }
}

// Verificar headers de seguridad
function verifySecurityHeaders(headers) {
  const issues = [];
  
  if (!headers['content-type'] || !headers['content-type'].includes('application/json')) {
    issues.push('Content-Type incorrecto o ausente');
  }
  
  if (!headers['x-powered-by']) {
    issues.push('X-Powered-By ausente');
  }
  
  if (!headers['access-control-allow-origin']) {
    issues.push('Access-Control-Allow-Origin ausente');
  }
  
  return issues;
}

// Agregar resultado de test
function addTestResult(testName, status, details = {}, headers = {}) {
  const result = {
    name: testName,
    status,
    details,
    headers: {
      'content-type': headers['content-type'] || 'N/A',
      'x-powered-by': headers['x-powered-by'] || 'N/A',
      'access-control-allow-origin': headers['access-control-allow-origin'] || 'N/A'
    },
    timestamp: new Date().toISOString()
  };
  
  testResults.push(result);
  
  // Mostrar resultado en consola
  const icon = status === 'PASSED' ? '✅' : '❌';
  console.log(`${icon} ${testName}`);
}

// Guardar resultados en archivo JSON
function saveResults() {
  const summary = {
    timestamp: new Date().toISOString(),
    totalTests: testResults.length,
    passed: testResults.filter(t => t.status === 'PASSED').length,
    failed: testResults.filter(t => t.status === 'FAILED').length,
    tests: testResults
  };
  
  fs.writeFileSync(
    'test-pagos-results.json',
    JSON.stringify(summary, null, 2)
  );
  
  console.log('\n💾 Resultados guardados en test-pagos-results.json');
}

// Esperar servidor
async function waitForServer(maxAttempts = 10) {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ Servidor listo\n');
      return true;
    } catch (error) {
      console.log(`⏳ Esperando servidor... (intento ${i}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  console.error('❌ El servidor no está disponible');
  return false;
}

// ============================================================
// TESTS
// ============================================================

// 1. Login de Admin
async function testLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      currentUserId = response.data.data.user?.id || response.data.data.user?._id;
      
      addTestResult(
        '1. Login de Admin',
        'PASSED',
        { message: 'Login exitoso', userId: currentUserId },
        response.headers
      );
      return true;
    } else {
      addTestResult('1. Login de Admin', 'FAILED', { error: 'No se recibió token' });
      return false;
    }
  } catch (error) {
    addTestResult('1. Login de Admin', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return false;
  }
}

// 2. Calcular Costo del Checkout
async function testCalculateCheckout() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/payments/checkout/calculate`,
      {
        propertyId: createdPropertyId,
        checkIn: '2024-03-01',
        checkOut: '2024-03-05',
        guests: 2
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success && response.data.data) {
      const { subtotal, serviceFee, taxes, total } = response.data.data;
      
      addTestResult(
        '2. Calcular Costo del Checkout',
        'PASSED',
        { 
          message: 'Cálculo realizado correctamente',
          subtotal,
          serviceFee,
          taxes,
          total,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return true;
    } else {
      addTestResult('2. Calcular Costo del Checkout', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('2. Calcular Costo del Checkout', 'FAILED', { 
      error: error.response?.data?.error?.message || error.response?.data?.message || error.message,
      status: error.response?.status
    });
    return false;
  }
}

// 3. Procesar Pago
async function testProcessPayment() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/payments/checkout/process`,
      {
        propertyId: createdPropertyId,
        checkIn: '2024-03-01',
        checkOut: '2024-03-05',
        guests: 2,
        guestInfo: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+1234567890',
          specialRequests: 'Test payment'
        },
        paymentInfo: {
          cardNumber: '4111111111111111',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123',
          cardholderName: 'Test User',
          billingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        }
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success && response.data.data) {
      const transaction = response.data.data.transaction || response.data.data;
      createdTransactionId = transaction.id || transaction._id || transaction.transactionId;
      
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let dbVerified = false;
      if (createdTransactionId) {
        dbVerified = await verifyInDatabase('transactions', { 
          transactionId: createdTransactionId 
        }) || await verifyInDatabase('transactions', { 
          _id: new ObjectId(createdTransactionId) 
        });
      }
      
      addTestResult(
        '3. Procesar Pago',
        dbVerified ? 'PASSED' : 'FAILED',
        { 
          message: dbVerified ? 'Pago procesado y verificado en BD' : 'Pago procesado pero no verificado en BD',
          transactionId: createdTransactionId,
          status: transaction.status,
          amount: transaction.amount,
          dbVerified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return createdTransactionId;
    } else {
      addTestResult('3. Procesar Pago', 'FAILED', { error: 'Respuesta no exitosa' });
      return null;
    }
  } catch (error) {
    addTestResult('3. Procesar Pago', 'FAILED', { 
      error: error.response?.data?.error?.message || error.response?.data?.message || error.message,
      status: error.response?.status,
      fullError: error.response?.data
    });
    return null;
  }
}

// 4. Obtener Métodos de Pago
async function testGetPaymentMethods() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/payments/methods`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success && response.data.data) {
      const methods = response.data.data.methods || response.data.data;
      const methodsList = Array.isArray(methods) ? methods : (typeof methods === 'object' ? Object.keys(methods) : []);
      
      addTestResult(
        '4. Obtener Métodos de Pago',
        'PASSED',
        { 
          message: `${methodsList.length || 0} métodos de pago disponibles`,
          methods: methodsList.length > 0 ? (Array.isArray(methods) ? methodsList.map(m => m.type || m) : methodsList) : methods,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return true;
    } else {
      addTestResult('4. Obtener Métodos de Pago', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('4. Obtener Métodos de Pago', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return false;
  }
}

// 5. Obtener Historial de Transacciones
async function testGetTransactions() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/payments/transactions`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const transactions = response.data.data.transactions || response.data.data || [];
      
      addTestResult(
        '5. Obtener Historial de Transacciones',
        'PASSED',
        { 
          message: `Se obtuvieron ${transactions.length} transacciones`,
          count: transactions.length,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return true;
    } else {
      addTestResult('5. Obtener Historial de Transacciones', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('5. Obtener Historial de Transacciones', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return false;
  }
}

// 6. Obtener Transacción Específica
async function testGetTransaction(transactionId) {
  if (!transactionId) {
    addTestResult('6. Obtener Transacción Específica', 'FAILED', { 
      error: 'No hay ID de transacción disponible' 
    });
    return false;
  }
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/payments/transactions/${transactionId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success && response.data.data) {
      const transaction = response.data.data.transaction || response.data.data;
      
      addTestResult(
        '6. Obtener Transacción Específica',
        'PASSED',
        { 
          message: 'Transacción obtenida correctamente',
          transactionId: transaction.id || transaction._id || transaction.transactionId,
          status: transaction.status,
          amount: transaction.amount,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return true;
    } else {
      addTestResult('6. Obtener Transacción Específica', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('6. Obtener Transacción Específica', 'FAILED', { 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    });
    return false;
  }
}

// 7. Procesar Reembolso
async function testProcessRefund(transactionId) {
  if (!transactionId) {
    addTestResult('7. Procesar Reembolso', 'FAILED', { 
      error: 'No hay ID de transacción disponible' 
    });
    return false;
  }
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/payments/transactions/${transactionId}/refund`,
      { reason: 'Test refund' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dbRecord = await getFromDatabase('transactions', { 
        transactionId: transactionId 
      }) || await getFromDatabase('transactions', { 
        _id: new ObjectId(transactionId) 
      });
      
      const dbVerified = dbRecord && dbRecord.status === 'refunded';
      
      addTestResult(
        '7. Procesar Reembolso',
        dbVerified ? 'PASSED' : 'FAILED',
        { 
          message: dbVerified ? 'Reembolso procesado y verificado en BD' : 'Reembolso procesado pero no verificado en BD',
          transactionId,
          dbStatus: dbRecord?.status,
          dbVerified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return dbVerified;
    } else {
      addTestResult('7. Procesar Reembolso', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('7. Procesar Reembolso', 'FAILED', { 
      error: error.response?.data?.error?.message || error.response?.data?.message || error.message,
      status: error.response?.status
    });
    return false;
  }
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DE LA COLECCIÓN DE PAGOS\n');
  console.log('='.repeat(60));
  
  try {
    // Esperar a que el servidor esté listo
    const serverReady = await waitForServer();
    if (!serverReady) {
      process.exit(1);
    }
    
    // Conectar a MongoDB
    await connectToDatabase();
    
    // Ejecutar tests en secuencia
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.error('\n❌ Login falló. No se pueden ejecutar más tests.');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testCalculateCheckout();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    let transactionId = await testProcessPayment();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testGetPaymentMethods();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testGetTransactions();
    
    // Si no se pudo crear una transacción en el test 3, intentar obtener una existente
    if (!transactionId) {
      const response = await axios.get(
        `${BASE_URL}/api/payments/transactions`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const transactions = response.data.data?.transactions || response.data.data || [];
      if (transactions.length > 0) {
        transactionId = transactions[0].id || transactions[0]._id || transactions[0].transactionId;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testGetTransaction(transactionId);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testProcessRefund(transactionId);
    
  } catch (error) {
    console.error('\n❌ Error durante la ejecución de tests:', error.message);
  } finally {
    // Guardar resultados
    saveResults();
    
    // Cerrar conexión a MongoDB
    await closeDatabaseConnection();
    
    // Mostrar resumen
    const passed = testResults.filter(t => t.status === 'PASSED').length;
    const failed = testResults.filter(t => t.status === 'FAILED').length;
    const total = testResults.length;
    const percentage = ((passed / total) * 100).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('='.repeat(60));
    console.log(`Total de pruebas: ${total}`);
    console.log(`✅ Exitosas: ${passed}`);
    console.log(`❌ Fallidas: ${failed}`);
    console.log(`📈 Porcentaje de éxito: ${percentage}%`);
    console.log('='.repeat(60));
    
    // Exit code basado en resultados
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Ejecutar tests
runTests();

