import { test, expect } from '@playwright/test';

/**
 * Test para capturar errores de JavaScript que impiden el renderizado del componente
 */

test.describe('JavaScript Errors Detection Test', () => {
  test('Capturar errores de JavaScript en la página de perfil', async ({ page }) => {
    console.log('🔍 [ERROR TEST] Iniciando test de detección de errores...');
    
    // Capturar todos los errores de JavaScript
    const jsErrors: string[] = [];
    page.on('pageerror', error => {
      jsErrors.push(`[PAGE ERROR] ${error.message}`);
    });
    
    // Capturar errores de consola
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[CONSOLE ERROR] ${msg.text()}`);
      }
    });
    
    // Capturar errores de red
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`[NETWORK ERROR] ${response.status()} - ${response.url()}`);
      }
    });
    
    // Paso 1: Limpiar storage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Paso 2: Hacer login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 [ERROR TEST] Realizando login...');
    await page.fill('input[name="email"]', 'jose1@gmail.com');
    await page.fill('input[name="password"]', '123456789');
    await page.click('button[type="submit"]');
    
    // Esperar redirección
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✅ [ERROR TEST] Login exitoso');
    
    // Paso 3: Ir al perfil y capturar errores
    console.log('🔍 [ERROR TEST] Navegando al perfil...');
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    
    // Esperar un poco más para capturar errores de renderizado
    await page.waitForTimeout(2000);
    
    // Paso 4: Verificar si hay errores
    console.log('🔍 [ERROR TEST] Errores de JavaScript encontrados:', jsErrors.length);
    console.log('🔍 [ERROR TEST] Errores de consola encontrados:', consoleErrors.length);
    console.log('🔍 [ERROR TEST] Errores de red encontrados:', networkErrors.length);
    
    // Mostrar errores
    if (jsErrors.length > 0) {
      console.log('❌ [ERROR TEST] Errores de JavaScript:');
      jsErrors.forEach(error => console.log('  -', error));
    }
    
    if (consoleErrors.length > 0) {
      console.log('❌ [ERROR TEST] Errores de consola:');
      consoleErrors.forEach(error => console.log('  -', error));
    }
    
    if (networkErrors.length > 0) {
      console.log('❌ [ERROR TEST] Errores de red:');
      networkErrors.forEach(error => console.log('  -', error));
    }
    
    // Paso 5: Verificar si el componente se renderiza después de los errores
    const changePasswordText = await page.locator('text=Cambiar contraseña').count();
    const forms = await page.locator('form').count();
    const passwordInputs = await page.locator('input[type="password"]').count();
    
    console.log('🔍 [ERROR TEST] Componente encontrado después de errores:');
    console.log('  - Texto "Cambiar contraseña":', changePasswordText);
    console.log('  - Formularios:', forms);
    console.log('  - Campos de contraseña:', passwordInputs);
    
    // Paso 6: Generar reporte
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'JavaScript Errors Detection Test',
      results: {
        jsErrors: jsErrors,
        consoleErrors: consoleErrors,
        networkErrors: networkErrors,
        componentRenderStatus: {
          changePasswordTextFound: changePasswordText > 0,
          formsFound: forms > 0,
          passwordInputsFound: passwordInputs > 0
        }
      }
    };
    
    console.log('📊 [ERROR TEST] REPORTE DE ERRORES:');
    console.log(JSON.stringify(report, null, 2));
    
    // Guardar reporte
    await page.evaluate((report) => {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'javascript-errors-detection-report.json';
      a.click();
      URL.revokeObjectURL(url);
    }, report);
    
    console.log('🎯 [ERROR TEST] Test completado');
  });
});
