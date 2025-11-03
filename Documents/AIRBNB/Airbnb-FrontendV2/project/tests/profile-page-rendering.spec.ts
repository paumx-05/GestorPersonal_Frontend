import { test, expect } from '@playwright/test';

/**
 * Test para verificar si la página de perfil se está renderizando correctamente
 */

test.describe('Profile Page Rendering Test', () => {
  test('Verificar que la página de perfil se renderiza completamente', async ({ page }) => {
    console.log('🔍 [PROFILE TEST] Iniciando test de renderizado de página de perfil...');
    
    // Capturar errores de JavaScript
    const jsErrors: string[] = [];
    page.on('pageerror', error => {
      jsErrors.push(`[PAGE ERROR] ${error.message}`);
    });
    
    // Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
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
    
    console.log('🔍 [PROFILE TEST] Realizando login...');
    await page.fill('input[name="email"]', 'jose1@gmail.com');
    await page.fill('input[name="password"]', '123456789');
    await page.click('button[type="submit"]');
    
    // Esperar redirección
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✅ [PROFILE TEST] Login exitoso');
    
    // Paso 3: Ir al perfil
    console.log('🔍 [PROFILE TEST] Navegando al perfil...');
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    
    // Esperar más tiempo para el renderizado
    await page.waitForTimeout(3000);
    
    // Paso 4: Verificar elementos básicos de la página
    console.log('🔍 [PROFILE TEST] Verificando elementos de la página...');
    
    // Verificar título
    const title = await page.locator('h1').textContent();
    console.log('🔍 [PROFILE TEST] Título de la página:', title);
    
    // Verificar si hay texto "Mi Perfil"
    const profileTitle = await page.locator('text=Mi Perfil').count();
    console.log('🔍 [PROFILE TEST] Texto "Mi Perfil" encontrado:', profileTitle);
    
    // Verificar si hay texto "DEBUG"
    const debugText = await page.locator('text=DEBUG').count();
    console.log('🔍 [PROFILE TEST] Texto "DEBUG" encontrado:', debugText);
    
    // Verificar si hay texto "ChangePasswordForm debería estar aquí"
    const debugChangePassword = await page.locator('text=ChangePasswordForm debería estar aquí').count();
    console.log('🔍 [PROFILE TEST] Texto debug de ChangePasswordForm encontrado:', debugChangePassword);
    
    // Verificar si hay cards
    const cards = await page.locator('[class*="Card"]').count();
    console.log('🔍 [PROFILE TEST] Cards encontradas:', cards);
    
    // Verificar si hay botones
    const buttons = await page.locator('button').count();
    console.log('🔍 [PROFILE TEST] Botones encontrados:', buttons);
    
    // Verificar si hay formularios
    const forms = await page.locator('form').count();
    console.log('🔍 [PROFILE TEST] Formularios encontrados:', forms);
    
    // Verificar si hay inputs
    const inputs = await page.locator('input').count();
    console.log('🔍 [PROFILE TEST] Inputs encontrados:', inputs);
    
    // Paso 5: Verificar errores
    console.log('🔍 [PROFILE TEST] Errores de JavaScript:', jsErrors.length);
    if (jsErrors.length > 0) {
      console.log('❌ [PROFILE TEST] Errores encontrados:');
      jsErrors.forEach(error => console.log('  -', error));
    }
    
    // Paso 6: Generar reporte
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Profile Page Rendering Test',
      results: {
        pageTitle: title,
        profileTitleFound: profileTitle > 0,
        debugTextFound: debugText > 0,
        debugChangePasswordFound: debugChangePassword > 0,
        cardsFound: cards,
        buttonsFound: buttons,
        formsFound: forms,
        inputsFound: inputs,
        jsErrors: jsErrors,
        consoleLogs: consoleLogs.filter(log => 
          log.includes('profile') || 
          log.includes('error') || 
          log.includes('ChangePassword') ||
          log.includes('render')
        )
      }
    };
    
    console.log('📊 [PROFILE TEST] REPORTE DE RENDERIZADO:');
    console.log(JSON.stringify(report, null, 2));
    
    // Guardar reporte
    await page.evaluate((report) => {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'profile-page-rendering-report.json';
      a.click();
      URL.revokeObjectURL(url);
    }, report);
    
    console.log('🎯 [PROFILE TEST] Test completado');
  });
});
