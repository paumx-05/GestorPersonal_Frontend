import { test, expect } from '@playwright/test';

/**
 * Test final para verificar que el flujo de cambio de contraseña funciona
 * Usa el modo demo implementado para simular autenticación
 */

test.describe('Password Change Flow - Final Test', () => {
  test('Verificar flujo completo de cambio de contraseña con modo demo', async ({ page }) => {
    console.log('🎭 [FINAL TEST] Iniciando test del flujo de cambio de contraseña con modo demo...');
    
    // Paso 1: Limpiar storage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Paso 2: Ir a login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Paso 3: Hacer login con credenciales demo
    console.log('🎭 [FINAL TEST] Realizando login con credenciales demo...');
    await page.fill('input[name="email"]', 'demo@airbnb.com');
    await page.fill('input[name="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    
    // Paso 4: Esperar redirección exitosa
    try {
      await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
      console.log('✅ [FINAL TEST] Login exitoso - redirigido a home');
    } catch (error) {
      console.log('❌ [FINAL TEST] No se redirigió a home, verificando URL actual...');
      const currentUrl = page.url();
      console.log('🔍 [FINAL TEST] URL actual:', currentUrl);
    }
    
    // Paso 5: Verificar token
    const token = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
    console.log('🔍 [FINAL TEST] Token guardado:', token ? 'SÍ' : 'NO');
    
    if (token) {
      console.log('🔍 [FINAL TEST] Token (primeros 20 chars):', token.substring(0, 20) + '...');
    }
    
    // Paso 6: Ir al perfil
    console.log('🎭 [FINAL TEST] Navegando al perfil...');
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    
    const profileUrl = page.url();
    console.log('🔍 [FINAL TEST] URL del perfil:', profileUrl);
    
    // Paso 7: Verificar que no fuimos redirigidos al login
    expect(profileUrl).not.toContain('/login');
    
    // Paso 8: Buscar formulario de cambio de contraseña
    console.log('🎭 [FINAL TEST] Buscando formulario de cambio de contraseña...');
    const changePasswordForm = page.locator('form').filter({ hasText: 'Cambiar contraseña' });
    await expect(changePasswordForm).toBeVisible();
    console.log('✅ [FINAL TEST] Formulario de cambio de contraseña encontrado!');
    
    // Paso 9: Llenar el formulario
    console.log('🎭 [FINAL TEST] Llenando formulario de cambio de contraseña...');
    await page.fill('input[id="current-password"]', 'demo1234');
    await page.fill('input[id="new-password"]', 'nueva123456');
    await page.fill('input[id="confirm-password"]', 'nueva123456');
    
    // Paso 10: Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Paso 11: Enviar formulario
    console.log('🎭 [FINAL TEST] Enviando formulario...');
    await page.click('button[type="submit"]');
    
    // Paso 12: Esperar respuesta
    await page.waitForTimeout(3000);
    
    // Paso 13: Verificar resultado
    const errorMessage = await page.locator('.text-red-400').textContent();
    const successMessage = await page.locator('.text-green-400').textContent();
    
    console.log('🔍 [FINAL TEST] Mensaje de error:', errorMessage);
    console.log('🔍 [FINAL TEST] Mensaje de éxito:', successMessage);
    
    // Paso 14: Verificar que el cambio fue exitoso
    expect(successMessage).toContain('actualizada exitosamente');
    expect(errorMessage).toBeFalsy();
    
    // Paso 15: Generar reporte final
    const finalReport = {
      timestamp: new Date().toISOString(),
      testName: 'Password Change Flow - Final Test',
      mode: 'DEMO',
      results: {
        loginSuccessful: !!token,
        tokenPresent: !!token,
        profileAccessible: !profileUrl.includes('/login'),
        changePasswordFormFound: true,
        passwordChangeSuccessful: !!successMessage,
        errorMessage: errorMessage,
        successMessage: successMessage
      },
      consoleLogs: consoleLogs.filter(log => 
        log.includes('demo') || 
        log.includes('password') || 
        log.includes('token') || 
        log.includes('success') || 
        log.includes('error')
      )
    };
    
    console.log('📊 [FINAL TEST] REPORTE FINAL:');
    console.log(JSON.stringify(finalReport, null, 2));
    
    // Guardar reporte
    await page.evaluate((report) => {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'password-change-final-test-report.json';
      a.click();
      URL.revokeObjectURL(url);
    }, finalReport);
    
    console.log('🎉 [FINAL TEST] ¡Test completado exitosamente!');
    console.log('✅ [FINAL TEST] El flujo de cambio de contraseña funciona correctamente');
  });
});
