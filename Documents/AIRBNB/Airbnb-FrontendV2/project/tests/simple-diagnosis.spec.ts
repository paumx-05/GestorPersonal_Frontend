import { test, expect } from '@playwright/test';

/**
 * Test simple para diagnosticar el problema específico
 */

test.describe('Reset Password - Simple Diagnosis', () => {
  const BASE_URL = 'http://localhost:3000';
  const TEST_EMAIL = 'test@example.com';

  test('Simple Backend Test', async ({ page }) => {
    console.log('🔍 [Simple Test] Iniciando test simple del backend');
    
    // Crear un token de prueba
    const testToken = 'reset_' + btoa(JSON.stringify({ 
      email: TEST_EMAIL, 
      timestamp: Date.now() 
    }));
    
    // Navegar a la página de reset
    await page.goto(`${BASE_URL}/reset-password/${testToken}`);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ [Simple Test] Página cargada');
    
    // Ejecutar el test simple del backend
    const testButton = page.locator('button:has-text("Test Backend")');
    await testButton.click();
    
    // Esperar resultado
    await page.waitForTimeout(3000);
    
    // Capturar resultado
    const resultText = page.locator('pre').textContent();
    const result = await resultText;
    
    console.log('🔍 [Simple Test] Resultado del test:', result);
    
    // Verificar que el resultado contiene información útil
    expect(result).toBeTruthy();
    
    // Capturar screenshot
    await page.screenshot({ path: 'simple-backend-test.png', fullPage: true });
    console.log('📸 [Simple Test] Screenshot capturado');
  });

  test('Check Console Errors', async ({ page }) => {
    console.log('🔍 [Console Test] Verificando errores en consola');
    
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ [Console Test] Error en consola:', msg.text());
      }
    });
    
    const testToken = 'reset_' + btoa(JSON.stringify({ 
      email: TEST_EMAIL, 
      timestamp: Date.now() 
    }));
    
    await page.goto(`${BASE_URL}/reset-password/${testToken}`);
    await page.waitForLoadState('networkidle');
    
    // Esperar un poco para capturar errores
    await page.waitForTimeout(2000);
    
    console.log('🔍 [Console Test] Errores encontrados:', consoleErrors.length);
    
    if (consoleErrors.length > 0) {
      console.log('❌ [Console Test] Errores en consola:', consoleErrors);
    } else {
      console.log('✅ [Console Test] No hay errores en consola');
    }
  });

  test('Network Requests Check', async ({ page }) => {
    console.log('🔍 [Network Test] Verificando requests de red');
    
    const requests: string[] = [];
    const responses: string[] = [];
    
    page.on('request', request => {
      requests.push(`${request.method()} ${request.url()}`);
      console.log('📤 [Network Test] Request:', request.method(), request.url());
    });
    
    page.on('response', response => {
      responses.push(`${response.status()} ${response.url()}`);
      console.log('📥 [Network Test] Response:', response.status(), response.url());
    });
    
    const testToken = 'reset_' + btoa(JSON.stringify({ 
      email: TEST_EMAIL, 
      timestamp: Date.now() 
    }));
    
    await page.goto(`${BASE_URL}/reset-password/${testToken}`);
    await page.waitForLoadState('networkidle');
    
    // Ejecutar test del backend
    const testButton = page.locator('button:has-text("Test Backend")');
    await testButton.click();
    
    await page.waitForTimeout(3000);
    
    console.log('🔍 [Network Test] Total requests:', requests.length);
    console.log('🔍 [Network Test] Total responses:', responses.length);
    
    // Verificar que hay requests al backend
    const backendRequests = requests.filter(req => req.includes('localhost:5000'));
    console.log('🔍 [Network Test] Requests al backend:', backendRequests);
    
    expect(backendRequests.length).toBeGreaterThan(0);
  });
});
