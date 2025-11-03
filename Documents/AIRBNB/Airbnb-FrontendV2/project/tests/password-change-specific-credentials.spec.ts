import { test, expect } from '@playwright/test';

/**
 * Test específico para diagnosticar el problema de cambio de contraseña
 * Usa las credenciales específicas: jose1@gmail.com / 123456789
 * Verifica el flujo de "olvidaste tu contraseña"
 */

test.describe('Password Change Flow - Specific Credentials Test', () => {
  test('Diagnosticar problema con credenciales específicas y flujo olvidaste contraseña', async ({ page }) => {
    console.log('🔍 [SPECIFIC TEST] Iniciando diagnóstico con credenciales específicas...');
    
    // Paso 1: Limpiar storage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Paso 2: Ir a login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Paso 3: Interceptar peticiones de red
    const networkRequests: any[] = [];
    const networkResponses: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('localhost:5000')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('localhost:5000')) {
        networkResponses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
      }
    });
    
    // Paso 4: Probar login con credenciales específicas
    console.log('🔍 [SPECIFIC TEST] Probando login con jose1@gmail.com...');
    await page.fill('input[name="email"]', 'jose1@gmail.com');
    await page.fill('input[name="password"]', '123456789');
    
    // Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    await page.click('button[type="submit"]');
    
    // Paso 5: Esperar respuesta
    await page.waitForTimeout(3000);
    
    // Paso 6: Verificar resultado del login
    const currentUrl = page.url();
    console.log('🔍 [SPECIFIC TEST] URL después del login:', currentUrl);
    
    const token = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
    console.log('🔍 [SPECIFIC TEST] Token guardado:', token ? 'SÍ' : 'NO');
    
    if (token) {
      console.log('🔍 [SPECIFIC TEST] Token (primeros 20 chars):', token.substring(0, 20) + '...');
    }
    
    // Paso 7: Si el login falló, probar crear nuevo usuario
    if (!token || currentUrl.includes('/login')) {
      console.log('❌ [SPECIFIC TEST] Login falló, probando crear nuevo usuario...');
      
      // Ir a registro
      await page.goto('http://localhost:3000/register');
      await page.waitForLoadState('networkidle');
      
      // Llenar formulario de registro
      await page.fill('input[name="name"]', 'Jose Test');
      await page.fill('input[name="email"]', 'jose1@gmail.com');
      await page.fill('input[name="password"]', '123456789');
      await page.fill('input[name="confirmPassword"]', '123456789');
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const registerUrl = page.url();
      console.log('🔍 [SPECIFIC TEST] URL después del registro:', registerUrl);
      
      const tokenAfterRegister = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
      console.log('🔍 [SPECIFIC TEST] Token después del registro:', tokenAfterRegister ? 'SÍ' : 'NO');
      
      if (tokenAfterRegister) {
        console.log('✅ [SPECIFIC TEST] Registro exitoso, continuando con el test...');
      } else {
        console.log('❌ [SPECIFIC TEST] Registro también falló');
      }
    }
    
    // Paso 8: Probar flujo de "olvidaste tu contraseña"
    console.log('🔍 [SPECIFIC TEST] Probando flujo de olvidaste tu contraseña...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Buscar enlace "¿Olvidaste tu contraseña?"
    const forgotPasswordLink = page.locator('a[href="/forgot-password"]');
    await expect(forgotPasswordLink).toBeVisible();
    console.log('✅ [SPECIFIC TEST] Enlace olvidaste contraseña encontrado');
    
    // Hacer clic en el enlace
    await forgotPasswordLink.click();
    await page.waitForLoadState('networkidle');
    
    const forgotPasswordUrl = page.url();
    console.log('🔍 [SPECIFIC TEST] URL de olvidaste contraseña:', forgotPasswordUrl);
    
    // Paso 9: Buscar formulario de cambio de contraseña en esta página
    console.log('🔍 [SPECIFIC TEST] Buscando formulario de cambio de contraseña...');
    
    // Buscar diferentes tipos de formularios
    const passwordForms = await page.locator('form').count();
    console.log('🔍 [SPECIFIC TEST] Formularios encontrados:', passwordForms);
    
    // Buscar campos de contraseña
    const passwordInputs = await page.locator('input[type="password"]').count();
    console.log('🔍 [SPECIFIC TEST] Campos de contraseña encontrados:', passwordInputs);
    
    // Buscar texto relacionado con cambio de contraseña
    const changePasswordText = await page.locator('text=Cambiar contraseña').count();
    const resetPasswordText = await page.locator('text=Reset').count();
    const newPasswordText = await page.locator('text=Nueva contraseña').count();
    
    console.log('🔍 [SPECIFIC TEST] Texto "Cambiar contraseña":', changePasswordText);
    console.log('🔍 [SPECIFIC TEST] Texto "Reset":', resetPasswordText);
    console.log('🔍 [SPECIFIC TEST] Texto "Nueva contraseña":', newPasswordText);
    
    // Paso 10: Si encontramos formulario, probarlo
    if (passwordInputs > 0) {
      console.log('🔍 [SPECIFIC TEST] Formulario encontrado, probando cambio de contraseña...');
      
      // Intentar llenar el formulario si tiene los campos necesarios
      const currentPasswordField = page.locator('input[type="password"]').first();
      const newPasswordField = page.locator('input[type="password"]').nth(1);
      const confirmPasswordField = page.locator('input[type="password"]').nth(2);
      
      if (await currentPasswordField.isVisible()) {
        await currentPasswordField.fill('123456789');
        console.log('🔍 [SPECIFIC TEST] Contraseña actual llenada');
      }
      
      if (await newPasswordField.isVisible()) {
        await newPasswordField.fill('nueva123456');
        console.log('🔍 [SPECIFIC TEST] Nueva contraseña llenada');
      }
      
      if (await confirmPasswordField.isVisible()) {
        await confirmPasswordField.fill('nueva123456');
        console.log('🔍 [SPECIFIC TEST] Confirmación de contraseña llenada');
      }
      
      // Buscar botón de envío
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        console.log('🔍 [SPECIFIC TEST] Enviando formulario...');
        await submitButton.click();
        await page.waitForTimeout(3000);
        
        // Verificar resultado
        const errorMessage = await page.locator('.text-red-400, .error, [role="alert"]').textContent();
        const successMessage = await page.locator('.text-green-400, .success, [role="status"]').textContent();
        
        console.log('🔍 [SPECIFIC TEST] Mensaje de error:', errorMessage);
        console.log('🔍 [SPECIFIC TEST] Mensaje de éxito:', successMessage);
      }
    }
    
    // Paso 11: Generar reporte completo
    const diagnosis = {
      timestamp: new Date().toISOString(),
      testName: 'Password Change Flow - Specific Credentials Test',
      credentials: {
        email: 'jose1@gmail.com',
        password: '123456789'
      },
      results: {
        loginSuccessful: !!token,
        tokenPresent: !!token,
        forgotPasswordLinkFound: true,
        forgotPasswordPageAccessible: !forgotPasswordUrl.includes('/login'),
        passwordFormsFound: passwordForms,
        passwordInputsFound: passwordInputs,
        changePasswordTextFound: changePasswordText,
        resetPasswordTextFound: resetPasswordText,
        newPasswordTextFound: newPasswordText
      },
      networkRequests: networkRequests,
      networkResponses: networkResponses,
      consoleLogs: consoleLogs.filter(log => 
        log.includes('password') || 
        log.includes('token') || 
        log.includes('error') || 
        log.includes('success') ||
        log.includes('jose')
      )
    };
    
    console.log('📊 [SPECIFIC TEST] DIAGNÓSTICO COMPLETO:');
    console.log(JSON.stringify(diagnosis, null, 2));
    
    // Guardar reporte
    await page.evaluate((diagnosis) => {
      const blob = new Blob([JSON.stringify(diagnosis, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'password-change-specific-credentials-diagnosis.json';
      a.click();
      URL.revokeObjectURL(url);
    }, diagnosis);
    
    console.log('🎯 [SPECIFIC TEST] Test completado');
  });
});
