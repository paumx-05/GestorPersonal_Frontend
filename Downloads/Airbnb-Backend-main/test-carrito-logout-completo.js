/**
 * 🧪 PRUEBA COMPLETA: Verificar por qué el carrito sale vacío después de logout/login
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';
const USER_EMAIL = 'admin@airbnb.com';
const USER_PASSWORD = '456789Aa';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pablomaldonado422_db_user:eAR9cGa13mtrgWgj@clusterairbnb.0gsaxou.mongodb.net/airbnb-backend?retryWrites=true&w=majority&appName=ClusterAirBnb';

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
  blue: '\x1b[34m', cyan: '\x1b[36m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

let authToken = '';
let userId = '';
let propertyId = '';
let propertyPrice = 0;
let cartItemIds = [];

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: data ? JSON.parse(data) : null });
        } catch (error) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function login() {
  console.log(`\n${colors.blue}${colors.bold}1. LOGIN INICIAL${colors.reset}`);
  const response = await makeRequest('POST', '/api/auth/login', { email: USER_EMAIL, password: USER_PASSWORD });
  
  if (response.status === 200) {
    authToken = response.body?.data?.token || response.body?.token;
    userId = response.body?.data?.user?.id || response.body?.user?.id || '';
    console.log(`${colors.green}✓${colors.reset} Login OK - User ID: ${userId}`);
    return true;
  }
  console.log(`${colors.red}✗${colors.reset} Login falló: ${response.status}`);
  return false;
}

async function getProperty() {
  console.log(`\n${colors.blue}${colors.bold}2. OBTENER PROPIEDAD${colors.reset}`);
  try {
    await mongoose.connect(MONGODB_URI);
    const Property = mongoose.model('Property', new mongoose.Schema({}, { strict: false }), 'properties');
    const property = await Property.findOne({ isActive: { $ne: false } });
    
    if (property) {
      propertyId = property._id.toString();
      propertyPrice = property.pricePerNight || property.price || 100;
      console.log(`${colors.green}✓${colors.reset} Propiedad: ${property.title} - $${propertyPrice}`);
    }
    await mongoose.disconnect();
    return !!property;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    return false;
  }
}

async function addToCart() {
  console.log(`\n${colors.blue}${colors.bold}3. AGREGAR ITEMS AL CARRITO${colors.reset}`);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  const checkIn = futureDate.toISOString().split('T')[0];
  const checkOut = new Date(futureDate);
  checkOut.setDate(checkOut.getDate() + 3);
  const checkOutStr = checkOut.toISOString().split('T')[0];

  // Agregar 2 items
  for (let i = 0; i < 2; i++) {
    try {
      const response = await makeRequest('POST', '/api/cart/add', {
        propertyId, checkIn, checkOut: checkOutStr, guests: 2, pricePerNight: propertyPrice
      }, { 'Authorization': `Bearer ${authToken}` });

      if (response.status === 200 || response.status === 201) {
        const item = response.body?.data?.item || response.body?.data || response.body;
        if (item && (item.id || item._id)) {
          const itemId = item.id || item._id;
          cartItemIds.push(itemId);
          console.log(`${colors.green}✓${colors.reset} Item ${i + 1} agregado: ${itemId}`);
          
          // Mostrar expiresAt
          if (item.expiresAt) {
            const expiresDate = new Date(item.expiresAt);
            const now = new Date();
            const hoursUntilExpiry = Math.floor((expiresDate - now) / (1000 * 60 * 60));
            console.log(`   Expira en: ${hoursUntilExpiry} horas (${expiresDate.toISOString()})`);
          }
        }
      } else {
        console.log(`${colors.red}✗${colors.reset} Error agregando item ${i + 1}: ${response.status}`);
        console.log(JSON.stringify(response.body, null, 2));
      }
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    }
  }

  return cartItemIds.length > 0;
}

async function verifyInMongoDB(label) {
  console.log(`\n${colors.blue}${colors.bold}${label}${colors.reset}`);
  try {
    await mongoose.connect(MONGODB_URI);
    const CartItem = mongoose.model('CartItem', new mongoose.Schema({}, { strict: false }), 'cart_items');
    
    const now = new Date();
    const allItems = await CartItem.find({ userId });
    const activeItems = await CartItem.find({ userId, expiresAt: { $gt: now } });
    
    console.log(`${colors.cyan}Items en MongoDB para userId: ${userId}${colors.reset}`);
    console.log(`   Total items: ${allItems.length}`);
    console.log(`   Items activos (no expirados): ${activeItems.length}`);
    console.log(`   Items expirados: ${allItems.length - activeItems.length}`);
    
    if (allItems.length > 0) {
      allItems.forEach((item, idx) => {
        const expiresDate = new Date(item.expiresAt);
        const isExpired = expiresDate <= now;
        const hoursUntilExpiry = Math.floor((expiresDate - now) / (1000 * 60 * 60));
        
        console.log(`\n   ${idx + 1}. Item ID: ${item._id}`);
        console.log(`      ExpiresAt: ${expiresDate.toISOString()}`);
        console.log(`      ${isExpired ? colors.red + 'EXPIRADO' : colors.green + 'ACTIVO'}${colors.reset} (${Math.abs(hoursUntilExpiry)} horas)`);
        console.log(`      CreatedAt: ${item.createdAt}`);
      });
    }
    
    await mongoose.disconnect();
    return { allItems: allItems.length, activeItems: activeItems.length };
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    try { await mongoose.disconnect(); } catch {}
    return { allItems: 0, activeItems: 0 };
  }
}

async function getCart(label) {
  console.log(`\n${colors.blue}${colors.bold}${label}${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/api/cart', null, { 'Authorization': `Bearer ${authToken}` });
    
    if (response.status === 200) {
      const cart = response.body?.data || response.body;
      const items = cart?.items || [];
      
      console.log(`${colors.cyan}Respuesta del API:${colors.reset}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Items en respuesta: ${items.length}`);
      console.log(`   Total items (según API): ${cart?.totalItems || 'N/A'}`);
      console.log(`   Total price: $${cart?.totalPrice || 0}`);
      
      if (items.length > 0) {
        console.log(`${colors.green}✓${colors.reset} Carrito tiene ${items.length} items:`);
        items.forEach((item, idx) => {
          console.log(`\n   ${idx + 1}. Item ID: ${item.id || item._id}`);
          console.log(`      Property ID: ${item.propertyId}`);
          console.log(`      Check-in: ${item.checkIn}`);
          console.log(`      Total: $${item.totalPrice || item.total}`);
        });
      } else {
        console.log(`${colors.red}✗${colors.reset} ¡Carrito vacío!`);
        if (response.body) {
          console.log(`${colors.yellow}Respuesta completa:${colors.reset}`);
          console.log(JSON.stringify(response.body, null, 2));
        }
      }
      
      return items.length;
    } else {
      console.log(`${colors.red}✗${colors.reset} Error: Status ${response.status}`);
      console.log(JSON.stringify(response.body, null, 2));
      return 0;
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    return 0;
  }
}

async function logout() {
  console.log(`\n${colors.blue}${colors.bold}LOGOUT${colors.reset}`);
  try {
    await makeRequest('POST', '/api/auth/logout', null, { 'Authorization': `Bearer ${authToken}` });
    authToken = '';
    console.log(`${colors.green}✓${colors.reset} Logout OK`);
  } catch (error) {
    authToken = '';
    console.log(`${colors.yellow}⚠${colors.reset} Logout (continuando)`);
  }
}

async function runTest() {
  console.log(`\n${colors.magenta}${colors.bold}╔═══════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}║  PRUEBA: CARrito DESPUÉS DE LOGOUT     ║${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}╚═══════════════════════════════════════╝${colors.reset}`);

  if (!(await login())) process.exit(1);
  if (!(await getProperty())) process.exit(1);
  if (!(await addToCart())) process.exit(1);

  await new Promise(r => setTimeout(r, 1000));

  const beforeLogout = await verifyInMongoDB('4. VERIFICAR EN MONGODB (ANTES LOGOUT)');
  const cartBefore = await getCart('5. OBTENER CARRITO (ANTES LOGOUT)');

  await logout();
  await new Promise(r => setTimeout(r, 500));

  if (!(await login())) process.exit(1);

  const afterLogin = await verifyInMongoDB('6. VERIFICAR EN MONGODB (DESPUÉS LOGIN)');
  const cartAfter = await getCart('7. OBTENER CARRITO (DESPUÉS LOGIN)');

  console.log(`\n${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}RESUMEN${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`Items en MongoDB antes logout: ${beforeLogout.activeItems} activos`);
  console.log(`Items en carrito antes logout: ${cartBefore}`);
  console.log(`Items en MongoDB después login: ${afterLogin.activeItems} activos`);
  console.log(`Items en carrito después login: ${cartAfter}`);
  
  if (cartAfter === 0 && afterLogin.activeItems > 0) {
    console.log(`\n${colors.red}${colors.bold}⚠ PROBLEMA DETECTADO:${colors.reset}`);
    console.log(`${colors.yellow}Hay ${afterLogin.activeItems} items activos en MongoDB, pero el API devuelve carrito vacío`);
    console.log(`${colors.yellow}Esto sugiere un problema en la consulta o filtrado del backend${colors.reset}`);
  } else if (cartAfter === 0 && afterLogin.activeItems === 0) {
    console.log(`\n${colors.red}${colors.bold}⚠ PROBLEMA DETECTADO:${colors.reset}`);
    console.log(`${colors.yellow}Los items fueron eliminados de MongoDB (probablemente por TTL o expiración)${colors.reset}`);
  } else if (cartAfter > 0) {
    console.log(`\n${colors.green}${colors.bold}✓ TODO FUNCIONA CORRECTAMENTE${colors.reset}`);
  }
}

runTest().catch(console.error).finally(() => process.exit(0));
