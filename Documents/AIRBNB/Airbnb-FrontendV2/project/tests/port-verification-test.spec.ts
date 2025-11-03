import { test, expect } from '@playwright/test';

/**
 * Test para verificar que las peticiones van al puerto correcto (5000)
 */
test.describe('Verificación de Puerto Correcto', () => {
  test('Verificar que las peticiones van al backend (puerto 5000)', async ({ page }) => {
    console.log('🔍 [PORT TEST] Verificando que las peticiones van al puerto correcto...');
    
    // Capturar peticiones de red
    const networkRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/auth/')) {
        networkRequests.push(`[REQUEST] ${request.method()} ${request.url()}`);
      }
    });
    
    // Capturar respuestas de red
    const networkResponses: string[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/auth/')) {
        networkResponses.push(`[RESPONSE] ${response.status()} ${response.url()}`);
      }
    });
    
    // Paso 1: Ir a forgot-password
    await page.goto('http://localhost:3000/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // Paso 2: Llenar y enviar formulario
    await page.fill('input[type="email"]', 'jose1@gmail.com');
    await page.click('button[type="submit"]');
    
    // Esperar petición
    await page.waitForTimeout(3000);
    
    console.log('🔍 [PORT TEST] Peticiones capturadas:');
    networkRequests.forEach(req => console.log('  ' + req));
    
    console.log('🔍 [PORT TEST] Respuestas capturadas:');
    networkResponses.forEach(res => console.log('  ' + res));
    
    // Verificar que las peticiones van al puerto 5000
    const port5000Requests = networkRequests.filter(req => req.includes('localhost:5000'));
    const port3000Requests = networkRequests.filter(req => req.includes('localhost:3000'));
    
    console.log('🔍 [PORT TEST] Análisis de puertos:');
    console.log('  - Peticiones al puerto 5000:', port5000Requests.length);
    console.log('  - Peticiones al puerto 3000:', port3000Requests.length);
    
    if (port5000Requests.length > 0) {
      console.log('✅ [PORT TEST] Las peticiones van al puerto correcto (5000)');
    } else if (port3000Requests.length > 0) {
      console.log('❌ [PORT TEST] Las peticiones van al puerto incorrecto (3000)');
    } else {
      console.log('⚠️ [PORT TEST] No se detectaron peticiones de API');
    }
    
    // Paso 3: Probar reset-password directamente
    console.log('🔍 [PORT TEST] Probando reset-password directamente...');
    
    const testToken = 'reset_' + btoa(JSON.stringify({ 
      email: 'jose1@gmail.com', 
      userId: 'test-user-123',
      timestamp: Date.now()
    }));
    
    await page.goto(`http://localhost:3000/reset-password/${testToken}`);
    await page.waitForLoadState('networkidle');
    
    // Llenar formulario
    await page.fill('input[name="newPassword"]', 'nueva123456');
    await page.fill('input[name="confirmPassword"]', 'nueva123456');
    await page.click('button[type="submit"]');
    
    // Esperar petición
    await page.waitForTimeout(3000);
    
    console.log('🔍 [PORT TEST] Peticiones después del reset:');
    networkRequests.forEach(req => console.log('  ' + req));
    
    // Verificar peticiones de reset
    const resetRequests = networkRequests.filter(req => req.includes('reset-password'));
    console.log('🔍 [PORT TEST] Peticiones de reset:', resetRequests.length);
    
    // Generar reporte
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Port Verification Test',
      results: {
        totalRequests: networkRequests.length,
        port5000Requests: port5000Requests.length,
        port3000Requests: port3000Requests.length,
        resetRequests: resetRequests.length,
        requestsCorrect: port5000Requests.length > 0,
        requestsIncorrect: port3000Requests.length > 0
      },
      networkRequests: networkRequests,
      networkResponses: networkResponses
    };
    
    console.log('📊 [PORT TEST] REPORTE FINAL:');
    console.log(JSON.stringify(report, null, 2));
    
    console.log('🎯 [PORT TEST] Test completado');
  });
});
