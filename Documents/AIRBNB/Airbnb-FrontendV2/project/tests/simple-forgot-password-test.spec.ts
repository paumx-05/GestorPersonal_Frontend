import { test, expect } from '@playwright/test';

/**
 * Test simple para verificar el flujo de forgot-password
 */
test.describe('Test Simple Forgot Password', () => {
  test('Verificar respuesta del formulario forgot-password', async ({ page }) => {
    console.log('🔍 [SIMPLE TEST] Iniciando test simple...');
    
    // Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Capturar errores de red
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`[NETWORK ERROR] ${response.status()} - ${response.url()}`);
      }
    });
    
    // Paso 1: Ir a forgot-password
    await page.goto('http://localhost:3000/forgot-password');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 [SIMPLE TEST] Página cargada');
    
    // Paso 2: Llenar y enviar formulario
    await page.fill('input[type="email"]', 'jose1@gmail.com');
    console.log('🔍 [SIMPLE TEST] Email llenado');
    
    // Paso 3: Enviar formulario y esperar respuesta
    await page.click('button[type="submit"]');
    console.log('🔍 [SIMPLE TEST] Formulario enviado');
    
    // Esperar un poco para que se procese
    await page.waitForTimeout(2000);
    
    // Paso 4: Verificar qué elementos están en la página
    const pageContent = await page.locator('body').textContent();
    console.log('🔍 [SIMPLE TEST] Contenido de la página:');
    console.log(pageContent?.substring(0, 500));
    
    // Paso 5: Buscar elementos específicos
    const successElements = await page.locator('.text-green-400, .text-green-500').count();
    const errorElements = await page.locator('.text-red-400, .text-red-500').count();
    const checkCircles = await page.locator('.text-green-500').count();
    
    console.log('🔍 [SIMPLE TEST] Elementos encontrados:');
    console.log('  - Elementos de éxito:', successElements);
    console.log('  - Elementos de error:', errorElements);
    console.log('  - Check circles:', checkCircles);
    
    // Paso 6: Verificar si hay mensajes de éxito o error
    if (successElements > 0) {
      const successText = await page.locator('.text-green-400, .text-green-500').first().textContent();
      console.log('✅ [SIMPLE TEST] Mensaje de éxito encontrado:', successText);
    }
    
    if (errorElements > 0) {
      const errorText = await page.locator('.text-red-400, .text-red-500').first().textContent();
      console.log('❌ [SIMPLE TEST] Mensaje de error encontrado:', errorText);
    }
    
    // Paso 7: Verificar si hay un enlace o botón para continuar
    const links = await page.locator('a').count();
    const buttons = await page.locator('button').count();
    
    console.log('🔍 [SIMPLE TEST] Elementos interactivos:');
    console.log('  - Enlaces:', links);
    console.log('  - Botones:', buttons);
    
    // Paso 8: Obtener todos los textos de enlaces y botones
    const linkTexts = await page.locator('a').allTextContents();
    const buttonTexts = await page.locator('button').allTextContents();
    
    console.log('🔍 [SIMPLE TEST] Textos de enlaces:');
    linkTexts.forEach((text, index) => {
      if (text.trim()) {
        console.log(`  - Enlace ${index}: "${text.trim()}"`);
      }
    });
    
    console.log('🔍 [SIMPLE TEST] Textos de botones:');
    buttonTexts.forEach((text, index) => {
      if (text.trim()) {
        console.log(`  - Botón ${index}: "${text.trim()}"`);
      }
    });
    
    // Paso 9: Generar reporte
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Simple Forgot Password Test',
      results: {
        successElements: successElements,
        errorElements: errorElements,
        checkCircles: checkCircles,
        links: links,
        buttons: buttons,
        networkErrors: networkErrors
      },
      consoleLogs: consoleLogs.filter(log => 
        log.includes('password') || 
        log.includes('token') || 
        log.includes('error') || 
        log.includes('success') ||
        log.includes('jose') ||
        log.includes('forgot') ||
        log.includes('reset')
      )
    };
    
    console.log('📊 [SIMPLE TEST] REPORTE FINAL:');
    console.log(JSON.stringify(report, null, 2));
    
    console.log('🎯 [SIMPLE TEST] Test completado');
  });
});
