import { test, expect } from '@playwright/test';

/**
 * Test completo para probar el cambio de contraseña del usuario jose1@gmail.com
 * Incluye login, acceso al perfil, y cambio de contraseña
 */

test.describe('Password Change Test - jose1@gmail.com', () => {
  test('Probar cambio de contraseña completo para jose1@gmail.com', async ({ page }) => {
    console.log('🔍 [PASSWORD CHANGE TEST] Iniciando test de cambio de contraseña...');
    
    // Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Capturar errores de red
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (!response.ok() && response.url().includes('change-password')) {
        networkErrors.push(`[NETWORK ERROR] ${response.status()} - ${response.url()}`);
      }
    });
    
    // Paso 1: Limpiar storage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Paso 2: Ir a login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Paso 3: Hacer login con jose1@gmail.com
    console.log('🔍 [PASSWORD CHANGE TEST] Realizando login con jose1@gmail.com...');
    await page.fill('input[name="email"]', 'jose1@gmail.com');
    await page.fill('input[name="password"]', '123456789');
    await page.click('button[type="submit"]');
    
    // Esperar redirección exitosa
    try {
      await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
      console.log('✅ [PASSWORD CHANGE TEST] Login exitoso');
    } catch (error) {
      console.log('❌ [PASSWORD CHANGE TEST] Error en login:', error);
      return;
    }
    
    // Paso 4: Verificar token
    const token = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
    console.log('🔍 [PASSWORD CHANGE TEST] Token guardado:', token ? 'SÍ' : 'NO');
    
    if (token) {
      console.log('🔍 [PASSWORD CHANGE TEST] Token (primeros 20 chars):', token.substring(0, 20) + '...');
    }
    
    // Paso 5: Ir al perfil
    console.log('🔍 [PASSWORD CHANGE TEST] Navegando al perfil...');
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    
    // Esperar más tiempo para el renderizado
    await page.waitForTimeout(3000);
    
    // Paso 6: Verificar que estamos en la página de perfil
    const currentUrl = page.url();
    console.log('🔍 [PASSWORD CHANGE TEST] URL actual:', currentUrl);
    
    // Paso 7: Buscar el formulario de cambio de contraseña
    console.log('🔍 [PASSWORD CHANGE TEST] Buscando formulario de cambio de contraseña...');
    
    // Buscar por diferentes métodos
    const changePasswordText = await page.locator('text=Cambiar contraseña').count();
    const forms = await page.locator('form').count();
    const passwordInputs = await page.locator('input[type="password"]').count();
    
    console.log('🔍 [PASSWORD CHANGE TEST] Elementos encontrados:');
    console.log('  - Texto "Cambiar contraseña":', changePasswordText);
    console.log('  - Formularios:', forms);
    console.log('  - Campos de contraseña:', passwordInputs);
    
    // Paso 8: Si encontramos el formulario, probarlo
    if (passwordInputs > 0) {
      console.log('✅ [PASSWORD CHANGE TEST] Formulario encontrado, probando cambio de contraseña...');
      
      // Buscar campos específicos
      const currentPasswordField = page.locator('input[id="current-password"]');
      const newPasswordField = page.locator('input[id="new-password"]');
      const confirmPasswordField = page.locator('input[id="confirm-password"]');
      
      const currentPasswordExists = await currentPasswordField.count();
      const newPasswordExists = await newPasswordField.count();
      const confirmPasswordExists = await confirmPasswordField.count();
      
      console.log('🔍 [PASSWORD CHANGE TEST] Campos específicos:');
      console.log('  - Contraseña actual:', currentPasswordExists);
      console.log('  - Nueva contraseña:', newPasswordExists);
      console.log('  - Confirmar contraseña:', confirmPasswordExists);
      
      if (currentPasswordExists > 0 && newPasswordExists > 0 && confirmPasswordExists > 0) {
        // Llenar el formulario
        await currentPasswordField.fill('123456789');
        await newPasswordField.fill('nueva123456');
        await confirmPasswordField.fill('nueva123456');
        
        console.log('🔍 [PASSWORD CHANGE TEST] Formulario llenado');
        
        // Enviar formulario
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();
        
        console.log('🔍 [PASSWORD CHANGE TEST] Formulario enviado');
        
        // Esperar respuesta
        await page.waitForTimeout(3000);
        
        // Verificar resultado
        const errorMessage = await page.locator('.text-red-400').textContent();
        const successMessage = await page.locator('.text-green-400').textContent();
        
        console.log('🔍 [PASSWORD CHANGE TEST] Resultado:');
        console.log('  - Mensaje de error:', errorMessage);
        console.log('  - Mensaje de éxito:', successMessage);
        
        // Verificar si hay error de token
        if (errorMessage && (errorMessage.includes('token') || errorMessage.includes('inválido') || errorMessage.includes('expirado'))) {
          console.log('❌ [PASSWORD CHANGE TEST] ERROR DE TOKEN DETECTADO:', errorMessage);
        } else if (successMessage) {
          console.log('✅ [PASSWORD CHANGE TEST] CAMBIO DE CONTRASEÑA EXITOSO:', successMessage);
        }
        
      } else {
        console.log('❌ [PASSWORD CHANGE TEST] Campos específicos no encontrados');
      }
    } else {
      console.log('❌ [PASSWORD CHANGE TEST] Formulario de cambio de contraseña no encontrado');
      
      // Buscar en la página actual qué elementos están disponibles
      const allText = await page.locator('body').textContent();
      console.log('🔍 [PASSWORD CHANGE TEST] Contenido de la página:');
      console.log(allText?.substring(0, 500) + '...');
    }
    
    // Paso 9: Probar flujo alternativo - "Olvidaste tu contraseña"
    console.log('🔍 [PASSWORD CHANGE TEST] Probando flujo alternativo...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Buscar enlace "¿Olvidaste tu contraseña?"
    const forgotPasswordLink = page.locator('text=¿Olvidaste tu contraseña?');
    const forgotPasswordCount = await forgotPasswordLink.count();
    
    console.log('🔍 [PASSWORD CHANGE TEST] Enlace olvidaste contraseña encontrado:', forgotPasswordCount);
    
    if (forgotPasswordCount > 0) {
      await forgotPasswordLink.click();
      await page.waitForLoadState('networkidle');
      
      const forgotPasswordUrl = page.url();
      console.log('🔍 [PASSWORD CHANGE TEST] URL olvidaste contraseña:', forgotPasswordUrl);
      
      // Buscar formulario en esta página
      const forgotPasswordForms = await page.locator('form').count();
      const forgotPasswordInputs = await page.locator('input[type="password"]').count();
      
      console.log('🔍 [PASSWORD CHANGE TEST] En olvidaste contraseña:');
      console.log('  - Formularios:', forgotPasswordForms);
      console.log('  - Campos de contraseña:', forgotPasswordInputs);
    }
    
    // Paso 10: Generar reporte final
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Password Change Test - jose1@gmail.com',
      credentials: {
        email: 'jose1@gmail.com',
        password: '123456789'
      },
      results: {
        loginSuccessful: !!token,
        tokenPresent: !!token,
        profileAccessible: !currentUrl.includes('/login'),
        changePasswordFormFound: passwordInputs > 0,
        changePasswordTextFound: changePasswordText > 0,
        formsFound: forms,
        passwordInputsFound: passwordInputs,
        forgotPasswordLinkFound: forgotPasswordCount > 0,
        networkErrors: networkErrors
      },
      consoleLogs: consoleLogs.filter(log => 
        log.includes('password') || 
        log.includes('token') || 
        log.includes('error') || 
        log.includes('success') ||
        log.includes('jose') ||
        log.includes('ChangePassword')
      )
    };
    
    console.log('📊 [PASSWORD CHANGE TEST] REPORTE FINAL:');
    console.log(JSON.stringify(report, null, 2));
    
    // Guardar reporte
    await page.evaluate((report) => {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'password-change-test-jose1-report.json';
      a.click();
      URL.revokeObjectURL(url);
    }, report);
    
    console.log('🎯 [PASSWORD CHANGE TEST] Test completado');
  });
});
