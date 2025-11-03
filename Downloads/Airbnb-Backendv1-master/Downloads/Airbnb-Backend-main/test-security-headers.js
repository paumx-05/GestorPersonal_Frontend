/**
 * 🔒 SCRIPT DE PRUEBAS PARA HEADERS DE SEGURIDAD
 * 
 * Verifica que todos los headers de seguridad estándar estén presentes
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Headers de seguridad esperados
const expectedHeaders = {
  'x-powered-by': 'Express/Node.js',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'x-xss-protection': '1; mode=block',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  'content-security-policy': /default-src 'self'/,
  'x-dns-prefetch-control': 'off',
  'x-download-options': 'noopen',
  'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'pragma': 'no-cache',
  'expires': '0'
};

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

// Resultados
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  headers: []
};

/**
 * Función para hacer peticiones HTTP
 */
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    http.get(url, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers
      });
      
      // Consumir la respuesta para liberar recursos
      res.resume();
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Verificar headers de seguridad
 */
async function testSecurityHeaders() {
  console.log(`\n${colors.cyan}╔═══════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  🔒 PRUEBAS DE HEADERS DE SEGURIDAD              ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    const response = await makeRequest('/');
    
    console.log(`${colors.blue}Status Code:${colors.reset} ${response.status}\n`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}VERIFICACIÓN DE HEADERS DE SEGURIDAD${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);

    // Verificar cada header esperado
    for (const [headerName, expectedValue] of Object.entries(expectedHeaders)) {
      const actualValue = response.headers[headerName.toLowerCase()];
      
      if (!actualValue) {
        console.log(`${colors.red}✗${colors.reset} ${colors.yellow}${headerName}${colors.reset}`);
        console.log(`  ${colors.red}Falta este header${colors.reset}\n`);
        results.failed++;
        results.headers.push({
          name: headerName,
          status: 'missing',
          expected: expectedValue,
          actual: null
        });
      } else if (expectedValue instanceof RegExp) {
        // Verificar con regex
        if (expectedValue.test(actualValue)) {
          console.log(`${colors.green}✓${colors.reset} ${colors.yellow}${headerName}${colors.reset}`);
          console.log(`  ${colors.cyan}${actualValue}${colors.reset}\n`);
          results.passed++;
          results.headers.push({
            name: headerName,
            status: 'present',
            expected: expectedValue.toString(),
            actual: actualValue
          });
        } else {
          console.log(`${colors.red}✗${colors.reset} ${colors.yellow}${headerName}${colors.reset}`);
          console.log(`  ${colors.red}Valor no coincide con el patrón esperado${colors.reset}`);
          console.log(`  ${colors.cyan}Actual: ${actualValue}${colors.reset}\n`);
          results.failed++;
          results.headers.push({
            name: headerName,
            status: 'invalid',
            expected: expectedValue.toString(),
            actual: actualValue
          });
        }
      } else {
        // Verificar valor exacto
        if (actualValue.toLowerCase() === expectedValue.toLowerCase()) {
          console.log(`${colors.green}✓${colors.reset} ${colors.yellow}${headerName}${colors.reset}`);
          console.log(`  ${colors.cyan}${actualValue}${colors.reset}\n`);
          results.passed++;
          results.headers.push({
            name: headerName,
            status: 'present',
            expected: expectedValue,
            actual: actualValue
          });
        } else {
          console.log(`${colors.yellow}⚠${colors.reset} ${colors.yellow}${headerName}${colors.reset}`);
          console.log(`  ${colors.yellow}Esperado: ${expectedValue}${colors.reset}`);
          console.log(`  ${colors.cyan}Actual: ${actualValue}${colors.reset}\n`);
          results.warnings++;
          results.headers.push({
            name: headerName,
            status: 'different',
            expected: expectedValue,
            actual: actualValue
          });
        }
      }
    }

    // Mostrar headers adicionales de Helmet
    console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}HEADERS ADICIONALES DE HELMET${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);

    const helmetHeaders = [
      'x-dns-prefetch-control',
      'x-frame-options',
      'strict-transport-security',
      'x-download-options',
      'x-content-type-options',
      'x-permitted-cross-domain-policies'
    ];

    for (const headerName of helmetHeaders) {
      const value = response.headers[headerName];
      if (value) {
        console.log(`${colors.green}✓${colors.reset} ${colors.yellow}${headerName}${colors.reset}`);
        console.log(`  ${colors.cyan}${value}${colors.reset}\n`);
      }
    }

    // Headers CORS
    console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}HEADERS CORS${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);

    const corsHeaders = Object.keys(response.headers).filter(h => 
      h.startsWith('access-control-')
    );

    if (corsHeaders.length > 0) {
      corsHeaders.forEach(headerName => {
        console.log(`${colors.green}✓${colors.reset} ${colors.yellow}${headerName}${colors.reset}`);
        console.log(`  ${colors.cyan}${response.headers[headerName]}${colors.reset}\n`);
      });
    } else {
      console.log(`${colors.yellow}⚠ No se encontraron headers CORS${colors.reset}\n`);
    }

    // Resumen
    console.log(`${colors.magenta}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.magenta}RESUMEN${colors.reset}`);
    console.log(`${colors.magenta}═══════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.green}✓ Headers correctos:${colors.reset} ${results.passed}`);
    console.log(`${colors.yellow}⚠ Headers con advertencias:${colors.reset} ${results.warnings}`);
    console.log(`${colors.red}✗ Headers faltantes/incorrectos:${colors.reset} ${results.failed}`);
    console.log(`${colors.blue}📊 Total verificado:${colors.reset} ${results.passed + results.warnings + results.failed}\n`);

    const successRate = ((results.passed / (results.passed + results.warnings + results.failed)) * 100).toFixed(2);
    console.log(`${colors.cyan}Tasa de éxito:${colors.reset} ${successRate}%\n`);

    // Guardar resultados
    const fs = require('fs');
    fs.writeFileSync('test-security-results.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        passed: results.passed,
        warnings: results.warnings,
        failed: results.failed,
        total: results.passed + results.warnings + results.failed,
        successRate: `${successRate}%`
      },
      headers: results.headers,
      allHeaders: response.headers
    }, null, 2));

    console.log(`${colors.cyan}Resultados guardados en: test-security-results.json${colors.reset}\n`);

    // Veredicto final
    if (results.failed === 0) {
      console.log(`${colors.green}╔═══════════════════════════════════════════════════╗${colors.reset}`);
      console.log(`${colors.green}║  ✅ TODOS LOS HEADERS DE SEGURIDAD PRESENTES     ║${colors.reset}`);
      console.log(`${colors.green}╚═══════════════════════════════════════════════════╝${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}╔═══════════════════════════════════════════════════╗${colors.reset}`);
      console.log(`${colors.yellow}║  ⚠ ALGUNOS HEADERS DE SEGURIDAD FALTAN           ║${colors.reset}`);
      console.log(`${colors.yellow}╚═══════════════════════════════════════════════════╝${colors.reset}\n`);
    }

  } catch (error) {
    console.error(`${colors.red}Error al realizar la prueba:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas
testSecurityHeaders()
  .then(() => {
    console.log(`${colors.green}✓ Pruebas completadas exitosamente${colors.reset}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}✗ Error:${colors.reset}`, error);
    process.exit(1);
  });

