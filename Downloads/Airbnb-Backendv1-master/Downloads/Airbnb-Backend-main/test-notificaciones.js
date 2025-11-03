/**
 * 🧪 SCRIPT DE TESTING - COLECCIÓN DE NOTIFICACIONES
 * Prueba exhaustiva de todos los endpoints de Notificaciones
 */

const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000';
const MONGODB_URI = 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';

// Credenciales de admin
const ADMIN_CREDENTIALS = {
  email: 'admin@demo.com',
  password: 'Admin1234!'
};

let authToken = '';
let currentUserId = '';
let createdNotificationId = '';
let testResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Función para agregar resultado de test
function addTestResult(name, status, details, headers = {}) {
  testResults.totalTests++;
  if (status === 'PASSED') testResults.passed++;
  else testResults.failed++;
  
  testResults.tests.push({
    name,
    status,
    details,
    headers: {
      'content-type': headers['content-type'] || 'N/A',
      'x-powered-by': headers['x-powered-by'] || 'N/A',
      'access-control-allow-origin': headers['access-control-allow-origin'] || 'N/A'
    },
    timestamp: new Date().toISOString()
  });
  
  console.log(`${status === 'PASSED' ? '✅' : '❌'} ${name}`);
}

// Función para verificar encabezados de seguridad
function verifySecurityHeaders(headers) {
  const issues = [];
  
  if (!headers['x-content-type-options']) {
    issues.push('Falta header X-Content-Type-Options');
  }
  
  if (!headers['x-frame-options']) {
    issues.push('Falta header X-Frame-Options');
  }
  
  if (!headers['content-type'] || !headers['content-type'].includes('application/json')) {
    issues.push('Content-Type no es application/json');
  }
  
  return issues;
}

// Función para verificar en la base de datos
async function verifyInDatabase(collectionName, query) {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('airbnb-backend');
    const collection = db.collection(collectionName);
    const result = await collection.findOne(query);
    return result;
  } catch (error) {
    console.error('Error verificando en BD:', error.message);
    return null;
  } finally {
    await client.close();
  }
}

// Función para contar documentos en la base de datos
async function countInDatabase(collectionName, query = {}) {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('airbnb-backend');
    const collection = db.collection(collectionName);
    const count = await collection.countDocuments(query);
    return count;
  } catch (error) {
    console.error('Error contando en BD:', error.message);
    return 0;
  } finally {
    await client.close();
  }
}

// Función para obtener documentos de la base de datos
async function findInDatabase(collectionName, query = {}, options = {}) {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('airbnb-backend');
    const collection = db.collection(collectionName);
    const results = await collection.find(query, options).toArray();
    return results;
  } catch (error) {
    console.error('Error buscando en BD:', error.message);
    return [];
  } finally {
    await client.close();
  }
}

// Esperar a que el servidor esté listo
async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ Servidor listo\n');
      return true;
    } catch (error) {
      console.log(`⏳ Esperando servidor... (intento ${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// 1. Login de Admin
async function testLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      currentUserId = response.data.data.user.id;
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
    addTestResult('1. Login de Admin', 'FAILED', { error: error.message });
    return false;
  }
}

// 2. Obtener Notificaciones
async function testGetNotifications() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/notifications?limit=50`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const notifications = response.data.data.notifications || response.data.data;
      addTestResult(
        '2. Obtener Notificaciones',
        'PASSED',
        { 
          message: `Se obtuvieron ${notifications.length} notificaciones`,
          count: notifications.length,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return notifications;
    } else {
      addTestResult('2. Obtener Notificaciones', 'FAILED', { error: 'Respuesta no exitosa' });
      return [];
    }
  } catch (error) {
    addTestResult('2. Obtener Notificaciones', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return [];
  }
}

// 3. Crear Notificación de Prueba
async function testCreateTestNotification() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/notifications/test`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const notification = response.data.data.notification || response.data.data;
      createdNotificationId = notification.id || notification._id;
      
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 500));
      const dbRecord = await verifyInDatabase('notifications', { 
        userId: currentUserId,
        type: 'system'
      });
      
      if (dbRecord) {
        addTestResult(
          '3. Crear Notificación de Prueba',
          'PASSED',
          { 
            message: 'Notificación de prueba creada correctamente',
            notificationId: createdNotificationId,
            type: 'test',
            dbVerified: true,
            headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
          },
          response.headers
        );
        return createdNotificationId;
      } else {
        addTestResult('3. Crear Notificación de Prueba', 'FAILED', { 
          error: 'No se verificó en BD',
          notificationId: createdNotificationId
        });
        return null;
      }
    } else {
      addTestResult('3. Crear Notificación de Prueba', 'FAILED', { error: 'Respuesta no exitosa' });
      return null;
    }
  } catch (error) {
    addTestResult('3. Crear Notificación de Prueba', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return null;
  }
}

// 4. Marcar Notificación como Leída
async function testMarkNotificationAsRead(notificationId) {
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/notifications/${notificationId}/read`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let dbRecord = null;
      try {
        dbRecord = await verifyInDatabase('notifications', { 
          _id: new ObjectId(notificationId)
        });
      } catch (err) {
        dbRecord = await verifyInDatabase('notifications', { 
          _id: notificationId
        });
      }
      
      const verified = dbRecord && dbRecord.isRead === true;
      
      addTestResult(
        '4. Marcar Notificación como Leída',
        verified ? 'PASSED' : 'FAILED',
        { 
          message: verified ? 'Notificación marcada como leída correctamente' : 'No se verificó en BD',
          notificationId,
          isRead: dbRecord?.isRead,
          dbVerified: verified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return verified;
    } else {
      addTestResult('4. Marcar Notificación como Leída', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('4. Marcar Notificación como Leída', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return false;
  }
}

// 5. Marcar Todas las Notificaciones como Leídas
async function testMarkAllNotificationsAsRead() {
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/notifications/mark-all-read`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD que todas las notificaciones del usuario están leídas
      await new Promise(resolve => setTimeout(resolve, 500));
      const unreadCount = await countInDatabase('notifications', { 
        userId: currentUserId,
        isRead: false
      });
      
      const verified = unreadCount === 0;
      
      addTestResult(
        '5. Marcar Todas como Leídas',
        verified ? 'PASSED' : 'FAILED',
        { 
          message: verified ? 'Todas las notificaciones marcadas como leídas' : `Aún quedan ${unreadCount} sin leer`,
          unreadCount,
          dbVerified: verified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return verified;
    } else {
      addTestResult('5. Marcar Todas como Leídas', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('5. Marcar Todas como Leídas', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return false;
  }
}

// 6. Obtener Configuración de Notificaciones
async function testGetNotificationSettings() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/notifications/settings`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const settings = response.data.data.settings || response.data.data;
      addTestResult(
        '6. Obtener Configuración de Notificaciones',
        'PASSED',
        { 
          message: 'Configuración obtenida correctamente',
          settings: settings,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return settings;
    } else {
      addTestResult('6. Obtener Configuración de Notificaciones', 'FAILED', { error: 'Respuesta no exitosa' });
      return null;
    }
  } catch (error) {
    addTestResult('6. Obtener Configuración de Notificaciones', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return null;
  }
}

// 7. Actualizar Configuración de Notificaciones
async function testUpdateNotificationSettings() {
  try {
    const settingsData = {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      marketingEmails: false
    };
    
    const response = await axios.put(
      `${BASE_URL}/api/notifications/settings`,
      settingsData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 500));
      const dbRecord = await verifyInDatabase('notification_settings', { 
        userId: currentUserId
      });
      
      const verified = dbRecord && 
                       dbRecord.emailNotifications === settingsData.emailNotifications && 
                       dbRecord.smsNotifications === settingsData.smsNotifications;
      
      addTestResult(
        '7. Actualizar Configuración de Notificaciones',
        verified ? 'PASSED' : 'FAILED',
        { 
          message: verified ? 'Configuración actualizada correctamente' : 'No se verificó en BD',
          settings: settingsData,
          dbVerified: verified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return verified;
    } else {
      addTestResult('7. Actualizar Configuración de Notificaciones', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('7. Actualizar Configuración de Notificaciones', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return false;
  }
}

// 8. Eliminar Notificación Específica
async function testDeleteNotification(notificationId) {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/notifications/${notificationId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let dbRecord = null;
      try {
        dbRecord = await verifyInDatabase('notifications', { 
          _id: new ObjectId(notificationId)
        });
      } catch (err) {
        dbRecord = await verifyInDatabase('notifications', { 
          _id: notificationId
        });
      }
      
      const verified = dbRecord === null;
      
      addTestResult(
        '8. Eliminar Notificación',
        verified ? 'PASSED' : 'FAILED',
        { 
          message: verified ? 'Notificación eliminada correctamente' : 'Aún existe en BD',
          notificationId,
          dbVerified: verified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return verified;
    } else {
      addTestResult('8. Eliminar Notificación', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('8. Eliminar Notificación', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return false;
  }
}

// 9. Limpiar Todas las Notificaciones
async function testClearAllNotifications() {
  try {
    // Crear una notificación de prueba primero para asegurar que haya algo que eliminar
    await axios.post(
      `${BASE_URL}/api/notifications/test`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = await axios.delete(
      `${BASE_URL}/api/notifications/clear-all`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 1000));
      const count = await countInDatabase('notifications', { 
        userId: currentUserId
      });
      
      const verified = count === 0;
      
      addTestResult(
        '9. Limpiar Todas las Notificaciones',
        verified ? 'PASSED' : 'FAILED',
        { 
          message: verified ? 'Todas las notificaciones eliminadas' : `Aún quedan ${count} notificaciones`,
          remainingCount: count,
          dbVerified: verified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return verified;
    } else {
      addTestResult('9. Limpiar Todas las Notificaciones', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('9. Limpiar Todas las Notificaciones', 'FAILED', { 
      error: error.response?.data?.error?.message || error.response?.data?.message || error.message 
    });
    return false;
  }
}

// Función principal
async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DE LA COLECCIÓN DE NOTIFICACIONES\n');
  console.log('='.repeat(60));
  
  // Esperar a que el servidor esté listo
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.error('❌ El servidor no está disponible');
    process.exit(1);
  }
  
  // 1. Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.error('❌ No se pudo hacer login, abortando tests');
    saveResults();
    process.exit(1);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 2. Obtener Notificaciones
  const notifications = await testGetNotifications();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 3. Crear Notificación de Prueba
  const notificationId = await testCreateTestNotification();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 4. Marcar Notificación como Leída (si se creó)
  if (notificationId) {
    await testMarkNotificationAsRead(notificationId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 5. Marcar Todas como Leídas
  await testMarkAllNotificationsAsRead();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 6. Obtener Configuración de Notificaciones
  await testGetNotificationSettings();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 7. Actualizar Configuración de Notificaciones
  await testUpdateNotificationSettings();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 8. Eliminar Notificación Específica (si se creó)
  if (notificationId) {
    await testDeleteNotification(notificationId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 9. Limpiar Todas las Notificaciones
  await testClearAllNotifications();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Guardar resultados
  saveResults();
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  console.log(`Total de pruebas: ${testResults.totalTests}`);
  console.log(`✅ Exitosas: ${testResults.passed}`);
  console.log(`❌ Fallidas: ${testResults.failed}`);
  console.log(`📈 Porcentaje de éxito: ${((testResults.passed / testResults.totalTests) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Guardar resultados en archivo JSON
function saveResults() {
  fs.writeFileSync(
    'test-notificaciones-results.json',
    JSON.stringify(testResults, null, 2)
  );
  console.log('\n💾 Resultados guardados en test-notificaciones-results.json');
}

// Ejecutar tests
runTests().catch(error => {
  console.error('❌ Error fatal:', error);
  saveResults();
  process.exit(1);
});

