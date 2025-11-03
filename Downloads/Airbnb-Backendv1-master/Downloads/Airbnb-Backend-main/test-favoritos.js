/**
 * 🧪 SCRIPT DE TESTING - COLECCIÓN DE FAVORITOS
 * Prueba exhaustiva de todos los endpoints de Favoritos
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

// 2. Obtener propiedades disponibles para agregar a favoritos
async function getAvailableProperties() {
  try {
    const properties = await findInDatabase('properties', {}, { limit: 3 });
    
    if (properties.length > 0) {
      addTestResult(
        '2. Obtener Propiedades Disponibles',
        'PASSED',
        { message: `Se encontraron ${properties.length} propiedades`, propertyIds: properties.map(p => p._id.toString()) },
        {}
      );
      return properties.map(p => p._id.toString());
    } else {
      addTestResult('2. Obtener Propiedades Disponibles', 'FAILED', { error: 'No hay propiedades en la BD' });
      return [];
    }
  } catch (error) {
    addTestResult('2. Obtener Propiedades Disponibles', 'FAILED', { error: error.message });
    return [];
  }
}

// 3. Agregar a Favoritos
async function testAddFavorite(propertyId) {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/favorites`,
      { propertyId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 500));
      const dbRecord = await verifyInDatabase('favorites', { 
        propertyId: propertyId
      });
      
      if (dbRecord) {
        addTestResult(
          '3. Agregar a Favoritos',
          'PASSED',
          { 
            message: 'Favorito agregado correctamente',
            propertyId,
            dbVerified: true,
            headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
          },
          response.headers
        );
        return true;
      } else {
        addTestResult(
          '3. Agregar a Favoritos',
          'FAILED',
          { error: 'No se verificó en BD', propertyId }
        );
        return false;
      }
    } else {
      addTestResult('3. Agregar a Favoritos', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('3. Agregar a Favoritos', 'FAILED', { 
      error: error.response?.data?.message || error.message,
      propertyId
    });
    return false;
  }
}

// 4. Obtener Favoritos
async function testGetFavorites() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/favorites`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const favorites = response.data.data.favorites || response.data.data;
      addTestResult(
        '4. Obtener Favoritos',
        'PASSED',
        { 
          message: `Se obtuvieron ${favorites.length} favoritos`,
          count: favorites.length,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return favorites;
    } else {
      addTestResult('4. Obtener Favoritos', 'FAILED', { error: 'Respuesta no exitosa' });
      return [];
    }
  } catch (error) {
    addTestResult('4. Obtener Favoritos', 'FAILED', { error: error.response?.data?.message || error.message });
    return [];
  }
}

// 5. Verificar Estado de Favorito
async function testCheckFavoriteStatus(propertyId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/favorites/check/${propertyId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      addTestResult(
        '5. Verificar Estado de Favorito',
        'PASSED',
        { 
          message: 'Estado verificado correctamente',
          propertyId,
          isFavorite: response.data.data.isFavorite,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return response.data.data.isFavorite;
    } else {
      addTestResult('5. Verificar Estado de Favorito', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('5. Verificar Estado de Favorito', 'FAILED', { error: error.response?.data?.message || error.message });
    return false;
  }
}

// 6. Crear Wishlist
async function testCreateWishlist() {
  try {
    const wishlistData = {
      name: 'Mi Wishlist de Vacaciones QA',
      description: 'Lugares que quiero visitar - Test QA',
      isPublic: false
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/favorites/wishlists`,
      wishlistData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const wishlist = response.data.data.wishlist || response.data.data;
      const wishlistId = wishlist.id;
      
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 500));
      const dbRecord = await verifyInDatabase('wishlists', { 
        name: wishlistData.name
      });
      
      if (dbRecord) {
        addTestResult(
          '6. Crear Wishlist',
          'PASSED',
          { 
            message: 'Wishlist creada correctamente',
            wishlistId,
            name: wishlistData.name,
            dbVerified: true,
            headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
          },
          response.headers
        );
        return wishlistId;
      } else {
        addTestResult('6. Crear Wishlist', 'FAILED', { error: 'No se verificó en BD' });
        return null;
      }
    } else {
      addTestResult('6. Crear Wishlist', 'FAILED', { error: 'Respuesta no exitosa' });
      return null;
    }
  } catch (error) {
    addTestResult('6. Crear Wishlist', 'FAILED', { error: error.response?.data?.message || error.message });
    return null;
  }
}

// 7. Obtener Wishlists del Usuario
async function testGetUserWishlists() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/favorites/wishlists`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const wishlists = response.data.data.wishlists || response.data.data;
      addTestResult(
        '7. Obtener Wishlists del Usuario',
        'PASSED',
        { 
          message: `Se obtuvieron ${wishlists.length} wishlists`,
          count: wishlists.length,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return wishlists;
    } else {
      addTestResult('7. Obtener Wishlists del Usuario', 'FAILED', { error: 'Respuesta no exitosa' });
      return [];
    }
  } catch (error) {
    addTestResult('7. Obtener Wishlists del Usuario', 'FAILED', { error: error.response?.data?.message || error.message });
    return [];
  }
}

// 8. Obtener Wishlist Específica
async function testGetSpecificWishlist(wishlistId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/favorites/wishlists/${wishlistId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      addTestResult(
        '8. Obtener Wishlist Específica',
        'PASSED',
        { 
          message: 'Wishlist obtenida correctamente',
          wishlistId,
          name: response.data.data.name,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return response.data.data;
    } else {
      addTestResult('8. Obtener Wishlist Específica', 'FAILED', { error: 'Respuesta no exitosa' });
      return null;
    }
  } catch (error) {
    addTestResult('8. Obtener Wishlist Específica', 'FAILED', { error: error.response?.data?.message || error.message });
    return null;
  }
}

// 9. Actualizar Wishlist
async function testUpdateWishlist(wishlistId) {
  try {
    const updateData = {
      name: 'Wishlist Actualizada QA',
      description: 'Nueva descripción - Test QA',
      isPublic: true
    };
    
    const response = await axios.put(
      `${BASE_URL}/api/favorites/wishlists/${wishlistId}`,
      updateData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 500));
      const dbRecord = await verifyInDatabase('wishlists', { 
        name: updateData.name
      });
      
      if (dbRecord) {
        addTestResult(
          '9. Actualizar Wishlist',
          'PASSED',
          { 
            message: 'Wishlist actualizada correctamente',
            wishlistId,
            newName: updateData.name,
            dbVerified: true,
            headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
          },
          response.headers
        );
        return true;
      } else {
        addTestResult('9. Actualizar Wishlist', 'FAILED', { error: 'No se verificó en BD' });
        return false;
      }
    } else {
      addTestResult('9. Actualizar Wishlist', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('9. Actualizar Wishlist', 'FAILED', { error: error.response?.data?.message || error.message });
    return false;
  }
}

// 10. Agregar Propiedad a Wishlist
async function testAddPropertyToWishlist(wishlistId, propertyId) {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/favorites/wishlists/${wishlistId}/properties`,
      { propertyId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD - Las propiedades se guardan en el array propertyIds de la wishlist
      await new Promise(resolve => setTimeout(resolve, 500));
      const dbRecord = await verifyInDatabase('wishlists', { 
        _id: new ObjectId(wishlistId),
        propertyIds: propertyId
      });
      
      const verified = dbRecord !== null;
      
      addTestResult(
        '10. Agregar Propiedad a Wishlist',
        verified ? 'PASSED' : 'FAILED',
        { 
          message: verified ? 'Propiedad agregada correctamente' : 'No se verificó en BD',
          wishlistId,
          propertyId,
          dbVerified: verified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return verified;
    } else {
      addTestResult('10. Agregar Propiedad a Wishlist', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('10. Agregar Propiedad a Wishlist', 'FAILED', { error: error.response?.data?.message || error.message });
    return false;
  }
}

// 11. Remover Propiedad de Wishlist
async function testRemovePropertyFromWishlist(wishlistId, propertyId) {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/favorites/wishlists/${wishlistId}/properties/${propertyId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD - La propiedad NO debe estar en el array propertyIds
      await new Promise(resolve => setTimeout(resolve, 500));
      const dbRecord = await verifyInDatabase('wishlists', { 
        _id: new ObjectId(wishlistId),
        propertyIds: propertyId
      });
      
      const verified = dbRecord === null; // Debe ser null si se eliminó del array
      
      addTestResult(
        '11. Remover Propiedad de Wishlist',
        verified ? 'PASSED' : 'FAILED',
        { 
          message: verified ? 'Propiedad removida correctamente' : 'Aún existe en BD',
          wishlistId,
          propertyId,
          dbVerified: verified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return verified;
    } else {
      addTestResult('11. Remover Propiedad de Wishlist', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('11. Remover Propiedad de Wishlist', 'FAILED', { error: error.response?.data?.message || error.message });
    return false;
  }
}

// 12. Obtener Wishlists Públicas
async function testGetPublicWishlists() {
  try {
    const response = await axios.get(`${BASE_URL}/api/favorites/wishlists/public`);
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      const wishlists = response.data.data.wishlists || response.data.data;
      addTestResult(
        '12. Obtener Wishlists Públicas',
        'PASSED',
        { 
          message: `Se obtuvieron ${wishlists.length} wishlists públicas`,
          count: wishlists.length,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return wishlists;
    } else {
      addTestResult('12. Obtener Wishlists Públicas', 'FAILED', { error: 'Respuesta no exitosa' });
      return [];
    }
  } catch (error) {
    addTestResult('12. Obtener Wishlists Públicas', 'FAILED', { error: error.response?.data?.message || error.message });
    return [];
  }
}

// 13. Estadísticas de Favoritos
async function testGetFavoritesStats() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/favorites/stats`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      addTestResult(
        '13. Estadísticas de Favoritos',
        'PASSED',
        { 
          message: 'Estadísticas obtenidas correctamente',
          stats: response.data.data,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return response.data.data;
    } else {
      addTestResult('13. Estadísticas de Favoritos', 'FAILED', { error: 'Respuesta no exitosa' });
      return null;
    }
  } catch (error) {
    addTestResult('13. Estadísticas de Favoritos', 'FAILED', { error: error.response?.data?.message || error.message });
    return null;
  }
}

// 14. Remover de Favoritos
async function testRemoveFavorite(propertyId, userId) {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/favorites/${propertyId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD con userId y propertyId
      await new Promise(resolve => setTimeout(resolve, 1000));
      const count = await countInDatabase('favorites', { 
        userId: userId,
        propertyId: propertyId
      });
      
      const verified = count === 0; // Debe ser 0 si se eliminó
      
      addTestResult(
        '14. Remover de Favoritos',
        verified ? 'PASSED' : 'FAILED',
        { 
          message: verified ? 'Favorito removido correctamente' : `Aún existe en BD (count: ${count})`,
          propertyId,
          userId,
          dbVerified: verified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return verified;
    } else {
      addTestResult('14. Remover de Favoritos', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('14. Remover de Favoritos', 'FAILED', { error: error.response?.data?.message || error.message });
    return false;
  }
}

// 15. Eliminar Wishlist
async function testDeleteWishlist(wishlistId) {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/favorites/wishlists/${wishlistId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const headerIssues = verifySecurityHeaders(response.headers);
    
    if (response.data.success) {
      // Verificar en BD
      await new Promise(resolve => setTimeout(resolve, 500));
      const dbRecord = await verifyInDatabase('wishlists', { 
        _id: new ObjectId(wishlistId)
      });
      
      const verified = dbRecord === null; // Debe ser null si se eliminó
      
      addTestResult(
        '15. Eliminar Wishlist',
        verified ? 'PASSED' : 'FAILED',
        { 
          message: verified ? 'Wishlist eliminada correctamente' : 'Aún existe en BD',
          wishlistId,
          dbVerified: verified,
          headerIssues: headerIssues.length > 0 ? headerIssues : 'OK'
        },
        response.headers
      );
      return verified;
    } else {
      addTestResult('15. Eliminar Wishlist', 'FAILED', { error: 'Respuesta no exitosa' });
      return false;
    }
  } catch (error) {
    addTestResult('15. Eliminar Wishlist', 'FAILED', { error: error.response?.data?.message || error.message });
    return false;
  }
}

// Función principal
async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DE LA COLECCIÓN DE FAVORITOS\n');
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
  
  // 2. Obtener propiedades disponibles
  const propertyIds = await getAvailableProperties();
  if (propertyIds.length === 0) {
    console.error('❌ No hay propiedades disponibles para probar');
    saveResults();
    process.exit(1);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 3. Agregar a Favoritos
  const addFavoriteSuccess = await testAddFavorite(propertyIds[0]);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 4. Obtener Favoritos
  const favorites = await testGetFavorites();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 5. Verificar Estado de Favorito
  await testCheckFavoriteStatus(propertyIds[0]);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 6. Crear Wishlist
  const wishlistId = await testCreateWishlist();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 7. Obtener Wishlists del Usuario
  const userWishlists = await testGetUserWishlists();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 8. Obtener Wishlist Específica
  if (wishlistId) {
    await testGetSpecificWishlist(wishlistId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 9. Actualizar Wishlist
    await testUpdateWishlist(wishlistId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 10. Agregar Propiedad a Wishlist
    if (propertyIds.length > 0) {
      await testAddPropertyToWishlist(wishlistId, propertyIds[0]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 11. Remover Propiedad de Wishlist
      await testRemovePropertyFromWishlist(wishlistId, propertyIds[0]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 12. Obtener Wishlists Públicas
  await testGetPublicWishlists();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 13. Estadísticas de Favoritos
  await testGetFavoritesStats();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 14. Remover de Favoritos
  if (addFavoriteSuccess) {
    await testRemoveFavorite(propertyIds[0], currentUserId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 15. Eliminar Wishlist
  if (wishlistId) {
    await testDeleteWishlist(wishlistId);
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    'test-favoritos-results.json',
    JSON.stringify(testResults, null, 2)
  );
  console.log('\n💾 Resultados guardados en test-favoritos-results.json');
}

// Ejecutar tests
runTests().catch(error => {
  console.error('❌ Error fatal:', error);
  saveResults();
  process.exit(1);
});

