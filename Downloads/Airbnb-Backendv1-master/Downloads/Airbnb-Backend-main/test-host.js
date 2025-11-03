/**
 * 🧪 SCRIPT DE TESTING - COLECCIÓN DE HOST
 * Prueba exhaustiva de todos los endpoints de Host (Gestión de Propiedades)
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
let createdPropertyId = '';
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

// 2. Crear Propiedad
async function testCreateProperty() {
  try {
    const propertyData = {
      title: 'Casa de Prueba QA - Host',
      description: 'Hermosa casa para testing de endpoints de host',
      location: 'Calle de Prueba 123, Ciudad QA',
      pricePerNight: 150,
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      propertyType: 'house',
      amenities: ['WiFi', 'Piscina', 'Estacionamiento', 'Cocina']
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/host/properties`,
      propertyData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success && (response.status === 201 || response.status === 200)) {
      const property = response.data.data.property || response.data.data;
      createdPropertyId = property.id || property._id;
      
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 500));
      const dbRecord = await verifyInDatabase('host_properties', { 
        title: propertyData.title
      });
      
      if (dbRecord) {
        addTestResult(
          '2. Crear Propiedad',
          'PASSED',
          { 
            message: 'Propiedad creada correctamente',
            propertyId: createdPropertyId,
            title: propertyData.title,
            dbVerified: true,
            headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
          },
          response.headers
        );
        return createdPropertyId;
      } else {
        addTestResult('2. Crear Propiedad', 'FAILED', { error: 'No se verificó en BD' });
        return null;
      }
    } else {
      addTestResult('2. Crear Propiedad', 'FAILED', { error: 'Respuesta no exitosa' });
      return null;
    }
  } catch (error) {
    addTestResult('2. Crear Propiedad', 'FAILED', { 
      error: error.response?.data?.error?.message || error.response?.data?.message || error.message,
      status: error.response?.status,
      fullError: error.response?.data
    });
    return null;
  }
}

// 3. Obtener Propiedades del Host
async function testGetHostProperties() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/host/properties`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const properties = response.data.data.properties || response.data.data;
      addTestResult(
        '3. Obtener Propiedades del Host',
        'PASSED',
        { 
          message: `Se obtuvieron ${properties.length} propiedades`,
          count: properties.length,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return properties;
    } else {
      addTestResult('3. Obtener Propiedades del Host', 'FAILED', { error: 'Respuesta no exitosa' });
      return [];
    }
  } catch (error) {
    addTestResult('3. Obtener Propiedades del Host', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return [];
  }
}

// 4. Obtener Propiedad Específica
async function testGetSpecificProperty(propertyId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/host/properties/${propertyId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const property = response.data.data.property || response.data.data;
      addTestResult(
        '4. Obtener Propiedad Específica',
        'PASSED',
        { 
          message: 'Propiedad obtenida correctamente',
          propertyId,
          title: property.title,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return property;
    } else {
      addTestResult('4. Obtener Propiedad Específica', 'FAILED', { error: 'Respuesta no exitosa' });
      return null;
    }
  } catch (error) {
    addTestResult('4. Obtener Propiedad Específica', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return null;
  }
}

// 5. Actualizar Propiedad
async function testUpdateProperty(propertyId) {
  try {
    const updateData = {
      title: 'Casa de Prueba QA - Actualizada',
      description: 'Descripción actualizada para testing',
      pricePerNight: 200
    };
    
    const response = await axios.put(
      `${BASE_URL}/api/host/properties/${propertyId}`,
      updateData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 500));
      const dbRecord = await verifyInDatabase('host_properties', { 
        title: updateData.title
      });
      
      if (dbRecord && dbRecord.pricePerNight === updateData.pricePerNight) {
        addTestResult(
          '5. Actualizar Propiedad',
          'PASSED',
          { 
            message: 'Propiedad actualizada correctamente',
            propertyId,
            newTitle: updateData.title,
            newPrice: updateData.pricePerNight,
            dbVerified: true,
            headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
          },
          response.headers
        );
        return true;
      } else {
        addTestResult('5. Actualizar Propiedad', 'FAILED', { 
          error: 'No se verificó actualización en BD',
          dbRecord: dbRecord ? 'Existe pero no coincide' : 'No encontrado'
        });
        return false;
      }
    } else {
      addTestResult('5. Actualizar Propiedad', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('5. Actualizar Propiedad', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return false;
  }
}

// 6. Obtener Reservas de Propiedad
async function testGetPropertyReservations(propertyId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/host/properties/${propertyId}/reservations`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const reservations = response.data.data.reservations || response.data.data;
      addTestResult(
        '6. Obtener Reservas de Propiedad',
        'PASSED',
        { 
          message: `Se obtuvieron ${reservations.length} reservas`,
          propertyId,
          count: reservations.length,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return reservations;
    } else {
      addTestResult('6. Obtener Reservas de Propiedad', 'FAILED', { error: 'Respuesta no exitosa' });
      return [];
    }
  } catch (error) {
    addTestResult('6. Obtener Reservas de Propiedad', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return [];
  }
}

// 7. Obtener Reviews de Propiedad
async function testGetPropertyReviews(propertyId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/host/properties/${propertyId}/reviews`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const reviews = response.data.data.reviews || response.data.data;
      addTestResult(
        '7. Obtener Reviews de Propiedad',
        'PASSED',
        { 
          message: `Se obtuvieron ${reviews.length} reviews`,
          propertyId,
          count: reviews.length,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return reviews;
    } else {
      addTestResult('7. Obtener Reviews de Propiedad', 'FAILED', { error: 'Respuesta no exitosa' });
      return [];
    }
  } catch (error) {
    addTestResult('7. Obtener Reviews de Propiedad', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return [];
  }
}

// 8. Obtener Estadísticas del Host
async function testGetHostStats() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/host/stats`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const stats = response.data.data.stats || response.data.data;
      addTestResult(
        '8. Obtener Estadísticas del Host',
        'PASSED',
        { 
          message: 'Estadísticas obtenidas correctamente',
          stats: stats,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return stats;
    } else {
      addTestResult('8. Obtener Estadísticas del Host', 'FAILED', { error: 'Respuesta no exitosa' });
      return null;
    }
  } catch (error) {
    addTestResult('8. Obtener Estadísticas del Host', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return null;
  }
}

// 9. Eliminar Propiedad
async function testDeleteProperty(propertyId) {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/host/properties/${propertyId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Intentar con diferentes formatos de ID
      let dbRecord = null;
      try {
        dbRecord = await verifyInDatabase('host_properties', { 
          _id: new ObjectId(propertyId)
        });
      } catch (err) {
        // Si falla con ObjectId, intentar como string
        dbRecord = await verifyInDatabase('host_properties', { 
          _id: propertyId
        });
      }
      
      const verified = dbRecord === null;
      
      addTestResult(
        '9. Eliminar Propiedad',
        verified ? 'PASSED' : 'FAILED',
        { 
          message: verified ? 'Propiedad eliminada correctamente' : 'Aún existe en BD',
          propertyId,
          dbVerified: verified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return verified;
    } else {
      addTestResult('9. Eliminar Propiedad', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('9. Eliminar Propiedad', 'FAILED', { 
      error: error.response?.data?.message || error.message 
    });
    return false;
  }
}

// Función principal
async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DE LA COLECCIÓN DE HOST\n');
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
  
  // 2. Crear Propiedad
  const propertyId = await testCreateProperty();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Si se creó la propiedad, continuar con los demás tests
  if (propertyId) {
    // 3. Obtener Propiedades del Host
    await testGetHostProperties();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Obtener Propiedad Específica
    await testGetSpecificProperty(propertyId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. Actualizar Propiedad
    await testUpdateProperty(propertyId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 6. Obtener Reservas de Propiedad
    await testGetPropertyReservations(propertyId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 7. Obtener Reviews de Propiedad
    await testGetPropertyReviews(propertyId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 8. Obtener Estadísticas del Host
    await testGetHostStats();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 9. Eliminar Propiedad
    await testDeleteProperty(propertyId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    console.log('⚠️  No se pudo crear propiedad, saltando tests que dependen de ella');
    // Aún así obtener estadísticas del host
    await testGetHostStats();
  }
  
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
    'test-host-results.json',
    JSON.stringify(testResults, null, 2)
  );
  console.log('\n💾 Resultados guardados en test-host-results.json');
}

// Ejecutar tests
runTests().catch(error => {
  console.error('❌ Error fatal:', error);
  saveResults();
  process.exit(1);
});

