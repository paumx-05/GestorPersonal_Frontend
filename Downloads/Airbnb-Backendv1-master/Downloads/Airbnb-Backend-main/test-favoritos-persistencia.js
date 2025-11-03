/**
 * 🧪 PRUEBA: Verificar persistencia de favoritos después de logout/login
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
let propertyIds = [];

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

async function getProperties() {
  console.log(`\n${colors.blue}${colors.bold}2. OBTENER PROPIEDADES${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/api/properties', null, { 'Authorization': `Bearer ${authToken}` });
    
    if (response.status === 200 && response.body?.data?.properties?.length > 0) {
      propertyIds = response.body.data.properties.slice(0, 2).map(p => p.id || p._id);
      console.log(`${colors.green}✓${colors.reset} Propiedades obtenidas: ${propertyIds.length}`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    return false;
  }
}

async function addFavorites() {
  console.log(`\n${colors.blue}${colors.bold}3. AGREGAR FAVORITOS${colors.reset}`);
  
  for (let i = 0; i < propertyIds.length; i++) {
    try {
      const response = await makeRequest('POST', '/api/favorites/add', {
        propertyId: propertyIds[i]
      }, { 'Authorization': `Bearer ${authToken}` });

      if (response.status === 200 || response.status === 201) {
        console.log(`${colors.green}✓${colors.reset} Favorito ${i + 1} agregado: ${propertyIds[i]}`);
      } else {
        console.log(`${colors.red}✗${colors.reset} Error agregando favorito ${i + 1}: ${response.status}`);
        console.log(JSON.stringify(response.body, null, 2));
      }
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    }
  }
  
  return true;
}

async function verifyInMongoDB(label) {
  console.log(`\n${colors.blue}${colors.bold}${label}${colors.reset}`);
  try {
    await mongoose.connect(MONGODB_URI);
    const Favorite = mongoose.model('Favorite', new mongoose.Schema({}, { strict: false }), 'favorites');
    
    const favorites = await Favorite.find({ userId });
    
    console.log(`${colors.cyan}Favoritos en MongoDB para userId: ${userId}${colors.reset}`);
    console.log(`   Total: ${favorites.length}`);
    
    if (favorites.length > 0) {
      favorites.forEach((fav, idx) => {
        console.log(`\n   ${idx + 1}. Favorite ID: ${fav._id}`);
        console.log(`      Property ID: ${fav.propertyId}`);
        console.log(`      User ID: ${fav.userId}`);
        console.log(`      Created: ${fav.createdAt}`);
      });
    }
    
    await mongoose.disconnect();
    return favorites.length;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Error: ${error.message}`);
    try { await mongoose.disconnect(); } catch {}
    return 0;
  }
}

async function getFavorites(label) {
  console.log(`\n${colors.blue}${colors.bold}${label}${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/api/favorites', null, { 'Authorization': `Bearer ${authToken}` });
    
    if (response.status === 200) {
      const favorites = response.body?.data?.favorites || [];
      
      console.log(`${colors.cyan}Respuesta del API:${colors.reset}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Total favoritos: ${favorites.length}`);
      
      if (favorites.length > 0) {
        console.log(`${colors.green}✓${colors.reset} Favoritos obtenidos:`);
        favorites.forEach((fav, idx) => {
          console.log(`\n   ${idx + 1}. Favorite ID: ${fav.id || fav._id}`);
          console.log(`      Property ID: ${fav.propertyId}`);
          console.log(`      Created: ${fav.createdAt}`);
        });
      } else {
        console.log(`${colors.red}✗${colors.reset} ¡Favoritos vacíos!`);
        if (response.body) {
          console.log(`${colors.yellow}Respuesta completa:${colors.reset}`);
          console.log(JSON.stringify(response.body, null, 2));
        }
      }
      
      return favorites.length;
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
  console.log(`${colors.magenta}${colors.bold}║  PRUEBA: FAVORITOS DESPUÉS DE LOGOUT     ║${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}╚═══════════════════════════════════════╝${colors.reset}`);

  if (!(await login())) process.exit(1);
  if (!(await getProperties())) process.exit(1);
  await addFavorites();

  await new Promise(r => setTimeout(r, 1000));

  const beforeLogout = await verifyInMongoDB('4. VERIFICAR EN MONGODB (ANTES LOGOUT)');
  const favsBefore = await getFavorites('5. OBTENER FAVORITOS (ANTES LOGOUT)');

  await logout();
  await new Promise(r => setTimeout(r, 500));

  if (!(await login())) process.exit(1);

  const afterLogin = await verifyInMongoDB('6. VERIFICAR EN MONGODB (DESPUÉS LOGIN)');
  const favsAfter = await getFavorites('7. OBTENER FAVORITOS (DESPUÉS LOGIN)');

  console.log(`\n${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}RESUMEN${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}═══════════════════════════════════════${colors.reset}`);
  console.log(`Favoritos en MongoDB antes logout: ${beforeLogout}`);
  console.log(`Favoritos en API antes logout: ${favsBefore}`);
  console.log(`Favoritos en MongoDB después login: ${afterLogin}`);
  console.log(`Favoritos en API después login: ${favsAfter}`);
  
  if (favsAfter === 0 && afterLogin > 0) {
    console.log(`\n${colors.red}${colors.bold}⚠ PROBLEMA DETECTADO:${colors.reset}`);
    console.log(`${colors.yellow}Hay ${afterLogin} favoritos en MongoDB, pero el API devuelve vacío`);
    console.log(`${colors.yellow}Esto sugiere un problema en la consulta o filtrado del backend${colors.reset}`);
  } else if (favsAfter === 0 && afterLogin === 0) {
    console.log(`\n${colors.red}${colors.bold}⚠ PROBLEMA DETECTADO:${colors.reset}`);
    console.log(`${colors.yellow}Los favoritos fueron eliminados de MongoDB${colors.reset}`);
  } else if (favsAfter > 0) {
    console.log(`\n${colors.green}${colors.bold}✓ TODO FUNCIONA CORRECTAMENTE${colors.reset}`);
  }
}

runTest().catch(console.error).finally(() => process.exit(0));
