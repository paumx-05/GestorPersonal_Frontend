/**
 * 🧪 PRUEBA: Verificar persistencia del carrito después de logout/login
 * 
 * Este script prueba:
 * 1. Login con admin@airbnb.com
 * 2. Agregar item al carrito
 * 3. Verificar que está en MongoDB
 * 4. Hacer logout
 * 5. Hacer login de nuevo
 * 6. Verificar que el carrito se mantiene
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuración
const BASE_URL = 'http://localhost:5000';
const USER_EMAIL = 'admin@airbnb.com';
const USER_PASSWORD = '456789Aa';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

let authToken = '';
let userId = '';
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
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
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
 * PASO 1: Login inicial
 */
async function login() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 1: LOGIN INICIAL${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });

    if (response.status === 200 || response.status === 201) {
      const token = response.body?.data?.token || response.body?.token;
      const user = response.body?.data?.user || response.body?.user;
      
      if (token) {
        authToken = token;
        userId = user?.id || '';
        console.log(`${colors.green}✓${colors.reset} Login exitoso`);
        console.log(`${colors.green}✓${colors.reset} User ID: ${userId}`);
        return true;
      }
    }
    
    console.log(`${colors.red}✗${colors.reset} Error en login`);
    return false;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    return false;
  }
}

/**
 * PASO 2: Obtener propiedad
 */
async function getProperty() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 2: OBTENER PROPIEDAD${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    await mongoose.connect(MONGODB_URI);
    const Property = mongoose.model('Property', new mongoose.Schema({}, { strict: false }), 'properties');
    const property = await Property.findOne({ isActive: { $ne: false } });

    if (property) {
      propertyId = property._id.toString();
      propertyPrice = property.pricePerNight || property.price || 100;
      console.log(`${colors.green}✓${colors.reset} Propiedad: ${property.title || 'N/A'}`);
      console.log(`${colors.green}✓${colors.reset} Precio: $${propertyPrice}/noche`);
    } else {
      const apiResponse = await makeRequest('GET', '/api/properties', null, {
        'Authorization': `Bearer ${authToken}`
      });

      if (apiResponse.status === 200 && apiResponse.body?.data?.properties?.length > 0) {
        const prop = apiResponse.body.data.properties[0];
        propertyId = prop.id || prop._id;
        propertyPrice = prop.pricePerNight || prop.price || 100;
      } else {
        await mongoose.disconnect();
        return false;
      }
    }

    await mongoose.disconnect();
    return true;

  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch {}
    return false;
  }
}

/**
 * PASO 3: Agregar al carrito
 */
async function addToCart() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 3: AGREGAR AL CARRITO${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  const checkIn = futureDate.toISOString().split('T')[0];
  
  const checkOutDate = new Date(futureDate);
  checkOutDate.setDate(checkOutDate.getDate() + 3);
  const checkOut = checkOutDate.toISOString().split('T')[0];

  try {
    const response = await makeRequest('POST', '/api/cart/add', {
      propertyId: propertyId,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: 2,
      pricePerNight: propertyPrice
    }, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200 || response.status === 201) {
      const item = response.body?.data?.item || response.body?.data || response.body?.item || response.body;
      
      if (item && (item.id || item._id)) {
        cartItemId = item.id || item._id;
        console.log(`${colors.green}✓${colors.reset} Item agregado: ${cartItemId}`);
        return true;
      }
    }
    
    console.log(`${colors.red}✗${colors.reset} Error agregando al carrito`);
    console.log(JSON.stringify(response.body, null, 2));
    return false;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    return false;
  }
}

/**
 * PASO 4: Verificar en MongoDB antes de logout
 */
async function verifyInMongoBeforeLogout() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 4: VERIFICAR EN MONGODB (ANTES DE LOGOUT)${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    await mongoose.connect(MONGODB_URI);
    const CartItem = mongoose.model('CartItem', new mongoose.Schema({}, { strict: false }), 'cart_items');
    
    const items = await CartItem.find({ userId: userId });
    console.log(`${colors.cyan}Items en MongoDB para este usuario: ${items.length}${colors.reset}`);
    
    if (items.length > 0) {
      items.forEach((item, index) => {
        console.log(`\n${index + 1}. Item ID: ${item._id}`);
        console.log(`   Expira en: ${item.expiresAt}`);
        console.log(`   Creación: ${item.createdAt}`);
        const now = new Date();
        const expiresAt = new Date(item.expiresAt);
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
        console.log(`   Tiempo hasta expiración: ${hoursUntilExpiry} horas`);
      });
      
      await mongoose.disconnect();
      return true;
    } else {
      console.log(`${colors.red}✗${colors.reset} No hay items en MongoDB`);
      await mongoose.disconnect();
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch {}
    return false;
  }
}

/**
 * PASO 5: Obtener carrito antes de logout
 */
async function getCartBeforeLogout() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 5: OBTENER CARRITO (ANTES DE LOGOUT)${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('GET', '/api/cart', null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200) {
      const cart = response.body?.data || response.body;
      const items = cart?.items || [];
      
      console.log(`${colors.green}✓${colors.reset} Carrito obtenido`);
      console.log(`${colors.cyan}Total de items: ${items.length}${colors.reset}`);
      
      if (items.length > 0) {
        items.forEach((item, index) => {
          console.log(`\n${index + 1}. Item ID: ${item.id || item._id}`);
          console.log(`   Property ID: ${item.propertyId}`);
        });
        return true;
      } else {
        console.log(`${colors.yellow}⚠${colors.reset} Carrito vacío`);
        return false;
      }
    } else {
      console.log(`${colors.red}✗${colors.reset} Error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    return false;
  }
}

/**
 * PASO 6: Logout
 */
async function logout() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 6: LOGOUT${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('POST', '/api/auth/logout', null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200) {
      console.log(`${colors.green}✓${colors.reset} Logout exitoso`);
      authToken = ''; // Limpiar token
      return true;
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} Status: ${response.status}`);
      // Continuar de todos modos
      authToken = '';
      return true;
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠${colors.reset} Error: ${error.message}`);
    authToken = '';
    return true;
  }
}

/**
 * PASO 7: Login de nuevo
 */
async function loginAgain() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 7: LOGIN DE NUEVO${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });

    if (response.status === 200 || response.status === 201) {
      const token = response.body?.data?.token || response.body?.token;
      const user = response.body?.data?.user || response.body?.user;
      
      if (token) {
        authToken = token;
        const newUserId = user?.id || '';
        console.log(`${colors.green}✓${colors.reset} Login exitoso`);
        console.log(`${colors.green}✓${colors.reset} User ID: ${newUserId}`);
        
        // Verificar que sea el mismo userId
        if (newUserId === userId) {
          console.log(`${colors.green}✓${colors.reset} Mismo usuario (ID coincide)`);
        } else {
          console.log(`${colors.red}✗${colors.reset} Diferente usuario! Anterior: ${userId}, Nuevo: ${newUserId}`);
        }
        
        return true;
      }
    }
    
    console.log(`${colors.red}✗${colors.reset} Error en login`);
    return false;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    return false;
  }
}

/**
 * PASO 8: Verificar carrito después de login
 */
async function getCartAfterLogin() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 8: OBTENER CARRITO (DESPUÉS DE LOGIN)${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    const response = await makeRequest('GET', '/api/cart', null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200) {
      const cart = response.body?.data || response.body;
      const items = cart?.items || [];
      
      console.log(`${colors.cyan}Total de items en carrito: ${items.length}${colors.reset}`);
      
      if (items.length > 0) {
        console.log(`${colors.green}✓${colors.reset} ¡Carrito se mantuvo después de logout/login!`);
        items.forEach((item, index) => {
          console.log(`\n${index + 1}. Item ID: ${item.id || item._id}`);
          console.log(`   Property ID: ${item.propertyId}`);
          console.log(`   Check-in: ${item.checkIn}`);
          console.log(`   Check-out: ${item.checkOut}`);
          console.log(`   Total: $${item.totalPrice || item.total}`);
          
          if (item.id === cartItemId || item._id === cartItemId) {
            console.log(`${colors.green}   ✓ Este es el item que agregamos antes${colors.reset}`);
          }
        });
        return true;
      } else {
        console.log(`${colors.red}✗${colors.reset} ¡PROBLEMA! El carrito está vacío después de login`);
        console.log(`${colors.yellow}Esto indica que los items no se están persistiendo correctamente${colors.reset}`);
        return false;
      }
    } else {
      console.log(`${colors.red}✗${colors.reset} Error: ${response.status}`);
      console.log(JSON.stringify(response.body, null, 2));
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    return false;
  }
}

/**
 * PASO 9: Verificar en MongoDB después de login
 */
async function verifyInMongoAfterLogin() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 9: VERIFICAR EN MONGODB (DESPUÉS DE LOGIN)${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    await mongoose.connect(MONGODB_URI);
    const CartItem = mongoose.model('CartItem', new mongoose.Schema({}, { strict: false }), 'cart_items');
    
    const items = await CartItem.find({ userId: userId });
    console.log(`${colors.cyan}Items en MongoDB para este usuario: ${items.length}${colors.reset}`);
    
    if (items.length > 0) {
      console.log(`${colors.green}✓${colors.reset} Items aún están en MongoDB`);
      items.forEach((item, index) => {
        console.log(`\n${index + 1}. Item ID: ${item._id}`);
        const now = new Date();
        const expiresAt = new Date(item.expiresAt);
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
        
        if (timeUntilExpiry > 0) {
          console.log(`${colors.green}   ✓ No expirado (expira en ${hoursUntilExpiry} horas)${colors.reset}`);
        } else {
          console.log(`${colors.red}   ✗ EXPIRADO (hace ${Math.abs(hoursUntilExpiry)} horas)${colors.reset}`);
        }
      });
      
      await mongoose.disconnect();
      return true;
    } else {
      console.log(`${colors.red}✗${colors.reset} ¡PROBLEMA! No hay items en MongoDB`);
      console.log(`${colors.yellow}Los items fueron eliminados por el índice TTL${colors.reset}`);
      
      // Verificar si el item específico existe
      if (cartItemId) {
        const specificItem = await CartItem.findById(cartItemId);
        if (specificItem) {
          console.log(`${colors.yellow}El item específico todavía existe pero con diferente userId?${colors.reset}`);
        } else {
          console.log(`${colors.red}El item específico fue eliminado${colors.reset}`);
        }
      }
      
      await mongoose.disconnect();
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch {}
    return false;
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function runTest() {
  console.log(`\n${colors.magenta}${colors.bold}╔═══════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}║  PRUEBA: PERSISTENCIA DEL CARRITO        ║${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}║  DESPUÉS DE LOGOUT/LOGIN                 ║${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}╚═══════════════════════════════════════╝${colors.reset}\n`);

  const results = {};

  results.login = await login();
  if (!results.login) {
    console.log(`\n${colors.red}Error en login inicial${colors.reset}\n`);
    process.exit(1);
  }

  results.getProperty = await getProperty();
  if (!results.getProperty) {
    console.log(`\n${colors.red}Error obteniendo propiedad${colors.reset}\n`);
    process.exit(1);
  }

  results.addToCart = await addToCart();
  if (!results.addToCart) {
    console.log(`\n${colors.red}Error agregando al carrito${colors.reset}\n`);
    process.exit(1);
  }

  // Esperar un momento para que se guarde
  await new Promise(resolve => setTimeout(resolve, 500));

  results.verifyBeforeLogout = await verifyInMongoBeforeLogout();
  results.cartBeforeLogout = await getCartBeforeLogout();
  
  results.logout = await logout();
  
  // Esperar un momento
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.loginAgain = await loginAgain();
  if (!results.loginAgain) {
    console.log(`\n${colors.red}Error en login después de logout${colors.reset}\n`);
    process.exit(1);
  }

  results.cartAfterLogin = await getCartAfterLogin();
  results.verifyAfterLogin = await verifyInMongoAfterLogin();

  // Resumen
  console.log(`\n${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}RESUMEN${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  Object.entries(results).forEach(([key, value]) => {
    console.log(`${value ? colors.green : colors.red}${value ? '✓' : '✗'}${colors.reset} ${key}`);
  });

  const critical = results.cartAfterLogin && results.verifyAfterLogin;
  
  console.log(`\n${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  if (critical) {
    console.log(`${colors.green}${colors.bold}✓✓✓ CARRITO PERSISTE CORRECTAMENTE ✓✓✓${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bold}✗✗✗ PROBLEMA: CARRITO NO PERSISTE ✗✗✗${colors.reset}`);
  }
  console.log(`${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  return results;
}

runTest()
  .then((results) => {
    const critical = results.cartAfterLogin && results.verifyAfterLogin;
    process.exit(critical ? 0 : 1);
  })
  .catch((error) => {
    console.error(`${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
  });
