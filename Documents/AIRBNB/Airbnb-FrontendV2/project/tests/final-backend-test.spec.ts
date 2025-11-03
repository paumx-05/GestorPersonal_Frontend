import { test, expect } from '@playwright/test';

/**
 * Test final del flujo completo con backend real
 */
test.describe('Flujo Final con Backend Real', () => {
  test('Probar flujo completo: forgot-password -> reset-password con backend', async ({ page }) => {
    console.log('🔍 [FINAL TEST] Iniciando test final con backend real...');
    
    // Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Capturar peticiones y respuestas
    const networkRequests: string[] = [];
    const networkResponses: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/auth/')) {
        networkRequests.push(`[REQUEST] ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/auth/')) {
        networkResponses.push(`[RESPONSE] ${response.status()} ${response.url()}`);
      }
    });
    
    // Paso 1: Ir a forgot-password
    await page.goto('http://localhost:3000/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // Paso 2: Llenar y enviar formulario
    await page.fill('input[type="email"]', 'jose1@gmail.com');
    await page.click('button[type="submit"]');
    
    // Esperar respuesta
    await page.waitForTimeout(5000);
    
    // Verificar resultado
    const successMessage = await page.locator('.text-green-400').textContent();
    const errorMessage = await page.locator('.text-red-400').textContent();
    const checkCircle = await page.locator('.text-green-500').count();
    
    console.log('🔍 [FINAL TEST] Resultado forgot-password:');
    console.log('  - Mensaje de éxito:', successMessage);
    console.log('  - Mensaje de error:', errorMessage);
    console.log('  - Check circle:', checkCircle);
    
    if (successMessage || checkCircle > 0) {
      console.log('✅ [FINAL TEST] Email enviado exitosamente');
      
      // Paso 3: Usar token real del backend (simulado)
      // En un entorno real, el usuario recibiría este token por email
      const realToken = 'reset_' + btoa(JSON.stringify({ 
        email: 'jose1@gmail.com', 
        userId: '68fe69f35467c59ffb326476',
        timestamp: Date.now(),
        type: 'password-reset',
        exp: Date.now() + 3600000 // 1 hora
      }));
      
      console.log('🔑 [FINAL TEST] Token real generado:', realToken.substring(0, 30) + '...');
      
      // Paso 4: Ir a reset-password con token real
      await page.goto(`http://localhost:3000/reset-password/${realToken}`);
      await page.waitForLoadState('networkidle');
      
      // Verificar que estamos en la página correcta
      const pageTitle = await page.locator('h1').textContent();
      console.log('🔍 [FINAL TEST] Título de reset:', pageTitle);
      
      // Paso 5: Llenar nueva contraseña
      const passwordInputs = await page.locator('input[type="password"]').count();
      console.log('🔍 [FINAL TEST] Campos de contraseña:', passwordInputs);
      
      if (passwordInputs >= 2) {
        await page.locator('input[name="newPassword"]').fill('nueva123456');
        await page.locator('input[name="confirmPassword"]').fill('nueva123456');
        
        console.log('🔍 [FINAL TEST] Nueva contraseña llenada');
        
        // Paso 6: Enviar formulario
        await page.locator('button[type="submit"]').click();
        console.log('🔍 [FINAL TEST] Formulario enviado');
        
        // Esperar respuesta
        await page.waitForTimeout(5000);
        
        // Verificar resultado
        const resetSuccessMessage = await page.locator('.text-green-400').textContent();
        const resetErrorMessage = await page.locator('.text-red-400').textContent();
        const resetCheckCircle = await page.locator('.text-green-500').count();
        
        console.log('🔍 [FINAL TEST] Resultado del reset:');
        console.log('  - Mensaje de éxito:', resetSuccessMessage);
        console.log('  - Mensaje de error:', resetErrorMessage);
        console.log('  - Check circle:', resetCheckCircle);
        
        if (resetSuccessMessage || resetCheckCircle > 0) {
          console.log('✅ [FINAL TEST] RESET DE CONTRASEÑA EXITOSO');
        } else if (resetErrorMessage) {
          console.log('❌ [FINAL TEST] Error en reset:', resetErrorMessage);
          
          // Analizar el error específico
          if (resetErrorMessage.includes('token') || resetErrorMessage.includes('inválido') || resetErrorMessage.includes('expirado')) {
            console.log('🔍 [FINAL TEST] Error de token detectado - verificar formato del token');
          } else if (resetErrorMessage.includes('contraseña')) {
            console.log('🔍 [FINAL TEST] Error de contraseña detectado - verificar validación');
          } else {
            console.log('🔍 [FINAL TEST] Error desconocido - verificar logs del backend');
          }
        } else {
          console.log('⚠️ [FINAL TEST] No se recibió respuesta clara');
        }
      } else {
        console.log('❌ [FINAL TEST] Formulario de reset no encontrado');
      }
    } else {
      console.log('❌ [FINAL TEST] Error en forgot-password:', errorMessage);
    }
    
    // Generar reporte final
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Final Backend Test',
      credentials: {
        email: 'jose1@gmail.com',
        newPassword: 'nueva123456'
      },
      results: {
        forgotPasswordSuccess: !!(successMessage || checkCircle > 0),
        forgotPasswordError: !!errorMessage,
        resetPageAccessible: pageTitle === 'Restablecer Contraseña',
        resetFormFound: passwordInputs >= 2,
        resetSuccess: !!(resetSuccessMessage || resetCheckCircle > 0),
        resetError: !!resetErrorMessage,
        networkRequests: networkRequests.length,
        networkResponses: networkResponses.length
      },
      networkRequests: networkRequests,
      networkResponses: networkResponses,
      consoleLogs: consoleLogs.filter(log => 
        log.includes('password') || 
        log.includes('token') || 
        log.includes('error') || 
        log.includes('success') ||
        log.includes('jose') ||
        log.includes('forgot') ||
        log.includes('reset') ||
        log.includes('backend')
      )
    };
    
    console.log('📊 [FINAL TEST] REPORTE FINAL:');
    console.log(JSON.stringify(report, null, 2));
    
    console.log('🎯 [FINAL TEST] Test completado');
  });
});
