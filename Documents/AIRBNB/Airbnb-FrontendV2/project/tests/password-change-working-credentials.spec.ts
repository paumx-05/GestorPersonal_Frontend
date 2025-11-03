import { test, expect } from '@playwright/test';

/**
 * Test específico para verificar el flujo de cambio de contraseña
 * Usa las credenciales que funcionan: jose1@gmail.com / 123456789
 * Verifica el flujo de "olvidaste tu contraseña"
 */

test.describe('Password Change Flow - Working Credentials Test', () => {
  test('Verificar flujo completo de cambio de contraseña con credenciales que funcionan', async ({ page }) => {
    console.log('🔍 [WORKING TEST] Iniciando test con credenciales que funcionan...');
    
    // Paso 1: Limpiar storage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Paso 2: Ir a login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Paso 3: Hacer login con credenciales que funcionan
    console.log('🔍 [WORKING TEST] Realizando login con jose1@gmail.com...');
    await page.fill('input[name="email"]', 'jose1@gmail.com');
    await page.fill('input[name="password"]', '123456789');
    
    // Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    await page.click('button[type="submit"]');
    
    // Paso 4: Esperar redirección exitosa
    try {
      await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
      console.log('✅ [WORKING TEST] Login exitoso - redirigido a home');
    } catch (error) {
      console.log('❌ [WORKING TEST] No se redirigió a home, verificando URL actual...');
      const currentUrl = page.url();
      console.log('🔍 [WORKING TEST] URL actual:', currentUrl);
    }
    
    // Paso 5: Verificar token
    const token = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
    console.log('🔍 [WORKING TEST] Token guardado:', token ? 'SÍ' : 'NO');
    
    if (token) {
      console.log('🔍 [WORKING TEST] Token (primeros 20 chars):', token.substring(0, 20) + '...');
    }
    
    // Paso 6: Ir al perfil para verificar acceso
    console.log('🔍 [WORKING TEST] Navegando al perfil...');
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    
    const profileUrl = page.url();
    console.log('🔍 [WORKING TEST] URL del perfil:', profileUrl);
    
    // Verificar que no fuimos redirigidos al login
    expect(profileUrl).not.toContain('/login');
    console.log('✅ [WORKING TEST] Acceso al perfil exitoso');
    
    // Paso 7: Buscar formulario de cambio de contraseña en el perfil
    console.log('🔍 [WORKING TEST] Buscando formulario de cambio de contraseña en el perfil...');
    const changePasswordForm = page.locator('form').filter({ hasText: 'Cambiar contraseña' });
    
    if (await changePasswordForm.isVisible()) {
      console.log('✅ [WORKING TEST] Formulario de cambio de contraseña encontrado en el perfil!');
      
      // Probar el formulario
      await page.fill('input[id="current-password"]', '123456789');
      await page.fill('input[id="new-password"]', 'nueva123456');
      await page.fill('input[id="confirm-password"]', 'nueva123456');
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const errorMessage = await page.locator('.text-red-400').textContent();
      const successMessage = await page.locator('.text-green-400').textContent();
      
      console.log('🔍 [WORKING TEST] Mensaje de error:', errorMessage);
      console.log('🔍 [WORKING TEST] Mensaje de éxito:', successMessage);
      
      if (errorMessage && errorMessage.includes('token')) {
        console.log('❌ [WORKING TEST] ERROR DE TOKEN DETECTADO:', errorMessage);
      }
    } else {
      console.log('❌ [WORKING TEST] Formulario de cambio de contraseña NO encontrado en el perfil');
    }
    
    // Paso 8: Probar flujo de "olvidaste tu contraseña"
    console.log('🔍 [WORKING TEST] Probando flujo de olvidaste tu contraseña...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Buscar enlace por texto
    const forgotPasswordLink = page.locator('text=¿Olvidaste tu contraseña?');
    await expect(forgotPasswordLink).toBeVisible();
    console.log('✅ [WORKING TEST] Enlace olvidaste contraseña encontrado');
    
    // Hacer clic en el enlace
    await forgotPasswordLink.click();
    await page.waitForLoadState('networkidle');
    
    const forgotPasswordUrl = page.url();
    console.log('🔍 [WORKING TEST] URL de olvidaste contraseña:', forgotPasswordUrl);
    
    // Paso 9: Buscar formulario de cambio de contraseña en esta página
    console.log('🔍 [WORKING TEST] Buscando formulario de cambio de contraseña en olvidaste contraseña...');
    
    // Buscar diferentes tipos de formularios
    const passwordForms = await page.locator('form').count();
    console.log('🔍 [WORKING TEST] Formularios encontrados:', passwordForms);
    
    // Buscar campos de contraseña
    const passwordInputs = await page.locator('input[type="password"]').count();
    console.log('🔍 [WORKING TEST] Campos de contraseña encontrados:', passwordInputs);
    
    // Buscar texto relacionado con cambio de contraseña
    const changePasswordText = await page.locator('text=Cambiar contraseña').count();
    const resetPasswordText = await page.locator('text=Reset').count();
    const newPasswordText = await page.locator('text=Nueva contraseña').count();
    const forgotPasswordText = await page.locator('text=olvidaste').count();
    
    console.log('🔍 [WORKING TEST] Texto "Cambiar contraseña":', changePasswordText);
    console.log('🔍 [WORKING TEST] Texto "Reset":', resetPasswordText);
    console.log('🔍 [WORKING TEST] Texto "Nueva contraseña":', newPasswordText);
    console.log('🔍 [WORKING TEST] Texto "olvidaste":', forgotPasswordText);
    
    // Paso 10: Si encontramos formulario, probarlo
    if (passwordInputs > 0) {
      console.log('🔍 [WORKING TEST] Formulario encontrado, probando cambio de contraseña...');
      
      // Intentar llenar el formulario si tiene los campos necesarios
      const currentPasswordField = page.locator('input[type="password"]').first();
      const newPasswordField = page.locator('input[type="password"]').nth(1);
      const confirmPasswordField = page.locator('input[type="password"]').nth(2);
      
      if (await currentPasswordField.isVisible()) {
        await currentPasswordField.fill('123456789');
        console.log('🔍 [WORKING TEST] Contraseña actual llenada');
      }
      
      if (await newPasswordField.isVisible()) {
        await newPasswordField.fill('nueva123456');
        console.log('🔍 [WORKING TEST] Nueva contraseña llenada');
      }
      
      if (await confirmPasswordField.isVisible()) {
        await confirmPasswordField.fill('nueva123456');
        console.log('🔍 [WORKING TEST] Confirmación de contraseña llenada');
      }
      
      // Buscar botón de envío
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        console.log('🔍 [WORKING TEST] Enviando formulario...');
        await submitButton.click();
        await page.waitForTimeout(3000);
        
        // Verificar resultado
        const errorMessage = await page.locator('.text-red-400, .error, [role="alert"]').textContent();
        const successMessage = await page.locator('.text-green-400, .success, [role="status"]').textContent();
        
        console.log('🔍 [WORKING TEST] Mensaje de error:', errorMessage);
        console.log('🔍 [WORKING TEST] Mensaje de éxito:', successMessage);
        
        if (errorMessage && errorMessage.includes('token')) {
          console.log('❌ [WORKING TEST] ERROR DE TOKEN DETECTADO EN OLVIDASTE CONTRASEÑA:', errorMessage);
        }
      }
    }
    
    // Paso 11: Generar reporte completo
    const diagnosis = {
      timestamp: new Date().toISOString(),
      testName: 'Password Change Flow - Working Credentials Test',
      credentials: {
        email: 'jose1@gmail.com',
        password: '123456789'
      },
      results: {
        loginSuccessful: !!token,
        tokenPresent: !!token,
        profileAccessible: !profileUrl.includes('/login'),
        changePasswordFormInProfile: await changePasswordForm.isVisible(),
        forgotPasswordLinkFound: true,
        forgotPasswordPageAccessible: !forgotPasswordUrl.includes('/login'),
        passwordFormsFound: passwordForms,
        passwordInputsFound: passwordInputs,
        changePasswordTextFound: changePasswordText,
        resetPasswordTextFound: resetPasswordText,
        newPasswordTextFound: newPasswordText,
        forgotPasswordTextFound: forgotPasswordText
      },
      consoleLogs: consoleLogs.filter(log => 
        log.includes('password') || 
        log.includes('token') || 
        log.includes('error') || 
        log.includes('success') ||
        log.includes('jose') ||
        log.includes('invalid') ||
        log.includes('expired')
      )
    };
    
    console.log('📊 [WORKING TEST] DIAGNÓSTICO COMPLETO:');
    console.log(JSON.stringify(diagnosis, null, 2));
    
    // Guardar reporte
    await page.evaluate((diagnosis) => {
      const blob = new Blob([JSON.stringify(diagnosis, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'password-change-working-credentials-diagnosis.json';
      a.click();
      URL.revokeObjectURL(url);
    }, diagnosis);
    
    console.log('🎯 [WORKING TEST] Test completado');
  });
});
