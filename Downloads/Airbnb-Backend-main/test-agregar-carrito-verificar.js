/**
 * 🧪 PRUEBA ESPECÍFICA: Agregar reserva al carrito y verificar en MongoDB Atlas
 * 
 * Este script prueba:
 * 1. Login con admin@airbnb.com / 456789Aa
 * 2. Obtener una propiedad válida
 * 3. Agregar una reserva al carrito
 * 4. Verificar que se guardó en MongoDB Atlas (colección cart_items)
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuración
const BASE_URL = 'http://localhost:5000';
const USER_EMAIL = 'admin@airbnb.com';
const USER_PASSWORD = '456789Aa';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';

// Colores para la consola
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
 * PASO 1: Login y obtener token
 */
async function login() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 1: LOGIN${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    console.log(`${colors.cyan}→ Iniciando sesión con: ${USER_EMAIL}${colors.reset}`);
    
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
        console.log(`${colors.green}✓${colors.reset} Token obtenido: ${token.substring(0, 20)}...`);
        console.log(`${colors.green}✓${colors.reset} User ID: ${userId}`);
        return true;
      } else {
        console.log(`${colors.red}✗${colors.reset} No se recibió token en la respuesta`);
        console.log(`${colors.yellow}Respuesta:${colors.reset}`, JSON.stringify(response.body, null, 2));
        return false;
      }
    } else {
      console.log(`${colors.red}✗${colors.reset} Error en login. Status: ${response.status}`);
      console.log(`${colors.yellow}Respuesta:${colors.reset}`, JSON.stringify(response.body, null, 2));
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error durante login: ${error.message}`);
    return false;
  }
}

/**
 * PASO 2: Obtener una propiedad válida de MongoDB
 */
async function getProperty() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 2: OBTENER PROPIEDAD${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    console.log(`${colors.cyan}→ Conectando a MongoDB...${colors.reset}`);
    await mongoose.connect(MONGODB_URI);
    console.log(`${colors.green}✓${colors.reset} Conectado a MongoDB Atlas`);

    // Buscar una propiedad activa
    const Property = mongoose.model('Property', new mongoose.Schema({}, { strict: false }), 'properties');
    const property = await Property.findOne({ isActive: { $ne: false } });

    if (property) {
      propertyId = property._id.toString();
      propertyPrice = property.pricePerNight || property.price || 100;
      console.log(`${colors.green}✓${colors.reset} Propiedad encontrada:`);
      console.log(`   ID: ${propertyId}`);
      console.log(`   Título: ${property.title || 'N/A'}`);
      console.log(`   Precio por noche: $${propertyPrice}`);
    } else {
      // Si no hay propiedades, intentar obtener desde la API
      console.log(`${colors.yellow}⚠${colors.reset} No se encontró propiedad en BD, intentando obtener desde API...`);
      
      const apiResponse = await makeRequest('GET', '/api/properties', null, {
        'Authorization': `Bearer ${authToken}`
      });

      if (apiResponse.status === 200 && apiResponse.body?.data?.properties?.length > 0) {
        const prop = apiResponse.body.data.properties[0];
        propertyId = prop.id || prop._id;
        propertyPrice = prop.pricePerNight || prop.price || 100;
        console.log(`${colors.green}✓${colors.reset} Propiedad obtenida desde API:`);
        console.log(`   ID: ${propertyId}`);
        console.log(`   Título: ${prop.title || 'N/A'}`);
        console.log(`   Precio por noche: $${propertyPrice}`);
      } else {
        console.log(`${colors.red}✗${colors.reset} No se pudo obtener una propiedad válida`);
        await mongoose.disconnect();
        return false;
      }
    }

    await mongoose.disconnect();
    console.log(`${colors.green}✓${colors.reset} Desconectado de MongoDB`);
    return true;

  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error obteniendo propiedad: ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch {}
    return false;
  }
}

/**
 * PASO 3: Agregar reserva al carrito
 */
async function addToCart() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 3: AGREGAR AL CARRITO${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  // Fechas: checkIn en 30 días, checkOut en 33 días (3 noches)
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
    console.log(`${colors.cyan}→ Agregando al carrito:${colors.reset}`);
    console.log(`   Propiedad ID: ${propertyId}`);
    console.log(`   Check-in: ${checkIn}`);
    console.log(`   Check-out: ${checkOut}`);
    console.log(`   Huéspedes: 2`);
    console.log(`   Precio/noche: $${propertyPrice}`);

    const response = await makeRequest('POST', '/api/cart/add', cartItem, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200 || response.status === 201) {
      const item = response.body?.data?.item || response.body?.data || response.body?.item || response.body;
      
      if (item && (item.id || item._id)) {
        cartItemId = item.id || item._id;
        console.log(`${colors.green}✓${colors.reset} Item agregado exitosamente al carrito`);
        console.log(`${colors.green}✓${colors.reset} Cart Item ID: ${cartItemId}`);
        console.log(`\n${colors.cyan}Detalles del item:${colors.reset}`);
        console.log(JSON.stringify(item, null, 2));
        return true;
      } else {
        console.log(`${colors.red}✗${colors.reset} El item fue agregado pero no se recibió ID`);
        console.log(`${colors.yellow}Respuesta completa:${colors.reset}`, JSON.stringify(response.body, null, 2));
        return false;
      }
    } else {
      console.log(`${colors.red}✗${colors.reset} Error agregando al carrito. Status: ${response.status}`);
      console.log(`${colors.yellow}Respuesta:${colors.reset}`, JSON.stringify(response.body, null, 2));
      return false;
    }

  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error durante agregar al carrito: ${error.message}`);
    return false;
  }
}

/**
 * PASO 4: Verificar en MongoDB Atlas que el item se guardó
 */
async function verifyInDatabase() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 4: VERIFICAR EN MONGODB ATLAS${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    console.log(`${colors.cyan}→ Conectando a MongoDB Atlas...${colors.reset}`);
    await mongoose.connect(MONGODB_URI);
    console.log(`${colors.green}✓${colors.reset} Conectado a MongoDB Atlas`);

    // Buscar el item en la colección cart_items
    const CartItem = mongoose.model('CartItem', new mongoose.Schema({}, { strict: false }), 'cart_items');
    
    console.log(`\n${colors.cyan}→ Buscando item en la colección 'cart_items'...${colors.reset}`);
    
    // Buscar por userId primero
    const userItems = await CartItem.find({ userId: userId }).sort({ createdAt: -1 }).limit(5);
    console.log(`\n${colors.cyan}Items encontrados para el usuario (${userId}): ${userItems.length}${colors.reset}`);
    
    let foundItem = null;
    
    if (cartItemId) {
      // Buscar por ID específico
      foundItem = await CartItem.findById(cartItemId);
      if (foundItem) {
        console.log(`${colors.green}✓${colors.reset} Item encontrado por ID: ${cartItemId}`);
      } else {
        console.log(`${colors.yellow}⚠${colors.reset} Item no encontrado por ID, buscando en los más recientes...`);
        // Buscar el más reciente que coincida con los datos
        foundItem = await CartItem.findOne({ 
          userId: userId,
          propertyId: propertyId
        }).sort({ createdAt: -1 });
      }
    } else {
      // Buscar el más reciente del usuario con esta propiedad
      foundItem = await CartItem.findOne({ 
        userId: userId,
        propertyId: propertyId
      }).sort({ createdAt: -1 });
    }

    if (foundItem) {
      console.log(`\n${colors.green}${colors.bold}═══════════════════════════════════════${colors.reset}`);
      console.log(`${colors.green}${colors.bold}✓✓✓ ITEM ENCONTRADO EN MONGODB ATLAS ✓✓✓${colors.reset}`);
      console.log(`${colors.green}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);
      
      console.log(`${colors.cyan}Detalles del item en la base de datos:${colors.reset}`);
      console.log(JSON.stringify({
        _id: foundItem._id.toString(),
        userId: foundItem.userId,
        propertyId: foundItem.propertyId,
        checkIn: foundItem.checkIn,
        checkOut: foundItem.checkOut,
        guests: foundItem.guests,
        pricePerNight: foundItem.pricePerNight,
        totalNights: foundItem.totalNights,
        subtotal: foundItem.subtotal,
        cleaningFee: foundItem.cleaningFee,
        serviceFee: foundItem.serviceFee,
        taxes: foundItem.taxes,
        total: foundItem.total,
        expiresAt: foundItem.expiresAt,
        createdAt: foundItem.createdAt,
        updatedAt: foundItem.updatedAt
      }, null, 2));
      
      // Verificaciones adicionales
      console.log(`\n${colors.cyan}Verificaciones:${colors.reset}`);
      console.log(`${colors.green}✓${colors.reset} userId coincide: ${foundItem.userId === userId ? 'Sí' : 'No'}`);
      console.log(`${colors.green}✓${colors.reset} propertyId coincide: ${foundItem.propertyId === propertyId ? 'Sí' : 'No'}`);
      console.log(`${colors.green}✓${colors.reset} Tiene precio total: ${foundItem.total ? `$${foundItem.total}` : 'No'}`);
      console.log(`${colors.green}✓${colors.reset} Tiene fecha de expiración: ${foundItem.expiresAt ? 'Sí' : 'No'}`);
      
      await mongoose.disconnect();
      return true;
    } else {
      console.log(`\n${colors.red}${colors.bold}═══════════════════════════════════════${colors.reset}`);
      console.log(`${colors.red}${colors.bold}✗✗✗ ITEM NO ENCONTRADO EN MONGODB ATLAS ✗✗✗${colors.reset}`);
      console.log(`${colors.red}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);
      
      console.log(`${colors.yellow}Items recientes del usuario en la BD:${colors.reset}`);
      if (userItems.length > 0) {
        userItems.forEach((item, index) => {
          console.log(`\n${index + 1}. Item ID: ${item._id}`);
          console.log(`   Property ID: ${item.propertyId}`);
          console.log(`   Fecha: ${item.createdAt}`);
        });
      } else {
        console.log(`   No se encontraron items para este usuario`);
      }
      
      await mongoose.disconnect();
      return false;
    }

  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error verificando en base de datos: ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch {}
    return false;
  }
}

/**
 * PASO 5: Verificar también desde la API
 */
async function verifyFromAPI() {
  console.log(`\n${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}PASO 5: VERIFICAR DESDE API${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  try {
    console.log(`${colors.cyan}→ Obteniendo carrito desde API...${colors.reset}`);
    
    const response = await makeRequest('GET', '/api/cart', null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200) {
      const cart = response.body?.data || response.body;
      const items = cart?.items || [];
      
      console.log(`${colors.green}✓${colors.reset} Carrito obtenido exitosamente`);
      console.log(`   Total de items: ${items.length}`);
      
      if (items.length > 0) {
        console.log(`\n${colors.cyan}Items en el carrito:${colors.reset}`);
        items.forEach((item, index) => {
          console.log(`\n${index + 1}. Item ID: ${item.id || item._id}`);
          console.log(`   Property ID: ${item.propertyId}`);
          console.log(`   Check-in: ${item.checkIn}`);
          console.log(`   Check-out: ${item.checkOut}`);
          console.log(`   Total: $${item.totalPrice || item.total}`);
          
          if (cartItemId && (item.id === cartItemId || item._id === cartItemId)) {
            console.log(`${colors.green}   ✓ Este es el item que acabamos de agregar${colors.reset}`);
          }
        });
        
        return true;
      } else {
        console.log(`${colors.yellow}⚠${colors.reset} El carrito está vacío`);
        return false;
      }
    } else {
      console.log(`${colors.red}✗${colors.reset} Error obteniendo carrito. Status: ${response.status}`);
      console.log(`${colors.yellow}Respuesta:${colors.reset}`, JSON.stringify(response.body, null, 2));
      return false;
    }

  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error verificando desde API: ${error.message}`);
    return false;
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function runTest() {
  console.log(`\n${colors.magenta}${colors.bold}╔═══════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}║  PRUEBA: AGREGAR RESERVA AL CARRITO    ║${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}║  Y VERIFICAR EN MONGODB ATLAS         ║${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}╚═══════════════════════════════════════╝${colors.reset}\n`);

  const results = {
    login: false,
    getProperty: false,
    addToCart: false,
    verifyInDatabase: false,
    verifyFromAPI: false
  };

  // Ejecutar pasos secuencialmente
  results.login = await login();
  if (!results.login) {
    console.log(`\n${colors.red}${colors.bold}Error: No se pudo hacer login. Abortando...${colors.reset}\n`);
    process.exit(1);
  }

  results.getProperty = await getProperty();
  if (!results.getProperty) {
    console.log(`\n${colors.red}${colors.bold}Error: No se pudo obtener una propiedad. Abortando...${colors.reset}\n`);
    process.exit(1);
  }

  results.addToCart = await addToCart();
  if (!results.addToCart) {
    console.log(`\n${colors.yellow}${colors.bold}Advertencia: No se pudo agregar al carrito, pero continuando con la verificación...${colors.reset}\n`);
  }

  // Esperar un poco para que se guarde en la BD
  console.log(`\n${colors.cyan}→ Esperando 1 segundo para que se guarde en la BD...${colors.reset}`);
  await new Promise(resolve => setTimeout(resolve, 1000));

  results.verifyInDatabase = await verifyInDatabase();
  results.verifyFromAPI = await verifyFromAPI();

  // Resumen final
  console.log(`\n${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}RESUMEN DE PRUEBA${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`${results.login ? colors.green : colors.red}${results.login ? '✓' : '✗'}${colors.reset} Login`);
  console.log(`${results.getProperty ? colors.green : colors.red}${results.getProperty ? '✓' : '✗'}${colors.reset} Obtener propiedad`);
  console.log(`${results.addToCart ? colors.green : colors.red}${results.addToCart ? '✓' : '✗'}${colors.reset} Agregar al carrito`);
  console.log(`${results.verifyInDatabase ? colors.green : colors.red}${results.verifyInDatabase ? '✓' : '✗'}${colors.reset} Verificar en MongoDB Atlas`);
  console.log(`${results.verifyFromAPI ? colors.green : colors.red}${results.verifyFromAPI ? '✓' : '✗'}${colors.reset} Verificar desde API`);

  const allPassed = Object.values(results).every(r => r);
  
  console.log(`\n${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  if (allPassed) {
    console.log(`${colors.green}${colors.bold}✓✓✓ TODAS LAS PRUEBAS PASARON ✓✓✓${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bold}⚠ ALGUNAS PRUEBAS FALLARON${colors.reset}`);
  }
  console.log(`${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

  return results;
}

// Ejecutar la prueba
runTest()
  .then((results) => {
    const allPassed = Object.values(results).every(r => r);
    process.exit(allPassed ? 0 : 1);
  })
  .catch((error) => {
    console.error(`${colors.red}${colors.bold}✗ Error ejecutando prueba:${colors.reset}`, error);
    process.exit(1);
  });
