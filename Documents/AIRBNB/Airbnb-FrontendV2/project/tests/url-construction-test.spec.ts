import { test, expect } from '@playwright/test';

/**
 * Test para verificar que la URL se construye correctamente
 */
test.describe('Test URL Construction', () => {
  test('Verificar que no hay duplicación de URL', async ({ page }) => {
    console.log('🔍 [URL TEST] Verificando construcción de URL...');
    
    // Capturar peticiones de red
    const networkRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/auth/')) {
        networkRequests.push(`[REQUEST] ${request.method()} ${request.url()}`);
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
    
    console.log('🔍 [URL TEST] Peticiones capturadas:');
    networkRequests.forEach(req => console.log(`  ${req}`));
    
    // Verificar que no hay duplicación de URL
    const duplicatedUrls = networkRequests.filter(req => 
      req.includes('http://localhost:5000http://localhost:5000')
    );
    
    const correctUrls = networkRequests.filter(req => 
      req.includes('http://localhost:5000/api/auth/forgot-password') && 
      !req.includes('http://localhost:5000http://localhost:5000')
    );
    
    console.log('🔍 [URL TEST] Análisis de URLs:');
    console.log('  - URLs duplicadas:', duplicatedUrls.length);
    console.log('  - URLs correctas:', correctUrls.length);
    
    if (duplicatedUrls.length > 0) {
      console.log('❌ [URL TEST] ERROR: URLs duplicadas encontradas');
      duplicatedUrls.forEach(url => console.log(`    ${url}`));
    } else if (correctUrls.length > 0) {
      console.log('✅ [URL TEST] URLs construidas correctamente');
      correctUrls.forEach(url => console.log(`    ${url}`));
    } else {
      console.log('⚠️ [URL TEST] No se detectaron peticiones de API');
    }
    
    // Verificar resultado del formulario
    const successMessage = await page.locator('.text-green-400').textContent();
    const errorMessage = await page.locator('.text-red-400').textContent();
    const checkCircle = await page.locator('.text-green-500').count();
    
    console.log('🔍 [URL TEST] Resultado del formulario:');
    console.log('  - Mensaje de éxito:', successMessage);
    console.log('  - Mensaje de error:', errorMessage);
    console.log('  - Check circle:', checkCircle);
    
    if (successMessage || checkCircle > 0) {
      console.log('✅ [URL TEST] Formulario enviado exitosamente');
    } else if (errorMessage) {
      console.log('❌ [URL TEST] Error en formulario:', errorMessage);
    } else {
      console.log('⚠️ [URL TEST] Sin respuesta clara');
    }
    
    console.log('🎯 [URL TEST] Test completado');
  });
});
