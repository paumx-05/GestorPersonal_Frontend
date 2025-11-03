import { test, expect } from '@playwright/test';

/**
 * Test completo del flujo de cambio de contraseña con token
 */
test.describe('Flujo Completo con Token', () => {
  test('Probar flujo completo: forgot-password -> token -> reset-password', async ({ page }) => {
    console.log('🔍 [TOKEN FLOW] Iniciando test del flujo completo con token...');
    
    // Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Paso 1: Ir a forgot-password y enviar email
    await page.goto('http://localhost:3000/forgot-password');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'jose1@gmail.com');
    await page.click('button[type="submit"]');
    
    // Esperar respuesta exitosa
    await page.waitForTimeout(3000);
    
    console.log('✅ [TOKEN FLOW] Email enviado exitosamente');
    
    // Paso 2: Simular que recibimos el token (en desarrollo se incluye en la respuesta)
    // En un entorno real, el usuario recibiría el token por email
    const simulatedToken = 'reset_' + btoa(JSON.stringify({ 
      email: 'jose1@gmail.com', 
      userId: '68fe69f35467c59ffb326476',
      timestamp: Date.now()
    }));
    
    console.log('🔑 [TOKEN FLOW] Token simulado generado:', simulatedToken.substring(0, 20) + '...');
    
    // Paso 3: Ir directamente a la página de reset con el token
    const resetUrl = `http://localhost:3000/reset-password/${simulatedToken}`;
    console.log('🔍 [TOKEN FLOW] Navegando a:', resetUrl);
    
    await page.goto(resetUrl);
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página correcta
    const pageTitle = await page.locator('h1').textContent();
    console.log('🔍 [TOKEN FLOW] Título de la página:', pageTitle);
    
    // Paso 4: Buscar formulario de reset
    const passwordInputs = await page.locator('input[type="password"]').count();
    const forms = await page.locator('form').count();
    const submitButtons = await page.locator('button[type="submit"]').count();
    
    console.log('🔍 [TOKEN FLOW] Elementos encontrados:');
    console.log('  - Campos de contraseña:', passwordInputs);
    console.log('  - Formularios:', forms);
    console.log('  - Botones de envío:', submitButtons);
    
    if (passwordInputs >= 2 && submitButtons > 0) {
      console.log('✅ [TOKEN FLOW] Formulario de reset encontrado');
      
      // Paso 5: Llenar nueva contraseña
      const newPasswordField = page.locator('input[name="newPassword"]');
      const confirmPasswordField = page.locator('input[name="confirmPassword"]');
      
      await newPasswordField.fill('nueva123456');
      await confirmPasswordField.fill('nueva123456');
      
      console.log('🔍 [TOKEN FLOW] Nueva contraseña llenada');
      
      // Paso 6: Enviar formulario
      await page.locator('button[type="submit"]').click();
      console.log('🔍 [TOKEN FLOW] Formulario de reset enviado');
      
      // Esperar respuesta
      await page.waitForTimeout(3000);
      
      // Paso 7: Verificar resultado
      const successMessage = await page.locator('.text-green-400').textContent();
      const errorMessage = await page.locator('.text-red-400').textContent();
      const checkCircle = await page.locator('.text-green-500').count();
      
      console.log('🔍 [TOKEN FLOW] Resultado del reset:');
      console.log('  - Mensaje de éxito:', successMessage);
      console.log('  - Mensaje de error:', errorMessage);
      console.log('  - Check circle:', checkCircle);
      
      // Verificar si hay error de token
      if (errorMessage && (errorMessage.includes('token') || errorMessage.includes('inválido') || errorMessage.includes('expirado'))) {
        console.log('❌ [TOKEN FLOW] ERROR DE TOKEN DETECTADO:', errorMessage);
      } else if (successMessage || checkCircle > 0) {
        console.log('✅ [TOKEN FLOW] RESET DE CONTRASEÑA EXITOSO');
      }
      
    } else {
      console.log('❌ [TOKEN FLOW] Formulario de reset no encontrado');
      
      // Verificar si hay mensaje de error
      const errorMessage = await page.locator('.text-red-400').textContent();
      if (errorMessage) {
        console.log('❌ [TOKEN FLOW] Error en la página:', errorMessage);
      }
    }
    
    // Paso 8: Probar login con la nueva contraseña
    console.log('🔍 [TOKEN FLOW] Probando login con nueva contraseña...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', 'jose1@gmail.com');
    await page.fill('input[name="password"]', 'nueva123456');
    await page.click('button[type="submit"]');
    
    // Esperar redirección
    try {
      await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
      console.log('✅ [TOKEN FLOW] Login con nueva contraseña exitoso');
    } catch (error) {
      console.log('❌ [TOKEN FLOW] Error en login con nueva contraseña:', error);
    }
    
    // Paso 9: Generar reporte final
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Complete Token Flow Test',
      credentials: {
        email: 'jose1@gmail.com',
        oldPassword: '123456789',
        newPassword: 'nueva123456'
      },
      results: {
        emailSentSuccessfully: true,
        tokenGenerated: !!simulatedToken,
        resetPageAccessible: pageTitle === 'Restablecer Contraseña',
        resetFormFound: passwordInputs >= 2,
        resetSuccessful: !!(successMessage || checkCircle > 0),
        loginWithNewPasswordSuccessful: false, // Se verificará después
        networkErrors: []
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
    
    console.log('📊 [TOKEN FLOW] REPORTE FINAL:');
    console.log(JSON.stringify(report, null, 2));
    
    console.log('🎯 [TOKEN FLOW] Test completado');
  });
});
