import { test, expect } from '@playwright/test';

/**
 * Test del flujo corregido de cambio de contraseña
 */
test.describe('Flujo Corregido de Cambio de Contraseña', () => {
  test('Probar flujo completo con modo demo', async ({ page }) => {
    console.log('🔍 [CORRECTED FLOW] Iniciando test del flujo corregido...');
    
    // Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Paso 1: Ir a forgot-password
    await page.goto('http://localhost:3000/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // Paso 2: Llenar y enviar formulario
    await page.fill('input[type="email"]', 'jose1@gmail.com');
    await page.click('button[type="submit"]');
    
    // Esperar respuesta
    await page.waitForTimeout(3000);
    
    // Verificar éxito
    const successMessage = await page.locator('.text-green-400').textContent();
    const checkCircle = await page.locator('.text-green-500').count();
    
    console.log('🔍 [CORRECTED FLOW] Resultado forgot-password:');
    console.log('  - Mensaje de éxito:', successMessage);
    console.log('  - Check circle:', checkCircle);
    
    if (successMessage || checkCircle > 0) {
      console.log('✅ [CORRECTED FLOW] Email enviado exitosamente');
      
      // Paso 3: Simular token y ir a reset-password
      const simulatedToken = 'reset_' + btoa(JSON.stringify({ 
        email: 'jose1@gmail.com', 
        userId: 'demo-user-123',
        timestamp: Date.now()
      }));
      
      console.log('🔑 [CORRECTED FLOW] Token simulado:', simulatedToken.substring(0, 20) + '...');
      
      // Paso 4: Ir a reset-password con token
      await page.goto(`http://localhost:3000/reset-password/${simulatedToken}`);
      await page.waitForLoadState('networkidle');
      
      // Verificar que estamos en la página correcta
      const pageTitle = await page.locator('h1').textContent();
      console.log('🔍 [CORRECTED FLOW] Título de reset:', pageTitle);
      
      // Paso 5: Llenar nueva contraseña
      const passwordInputs = await page.locator('input[type="password"]').count();
      console.log('🔍 [CORRECTED FLOW] Campos de contraseña:', passwordInputs);
      
      if (passwordInputs >= 2) {
        await page.locator('input[name="newPassword"]').fill('nueva123456');
        await page.locator('input[name="confirmPassword"]').fill('nueva123456');
        
        console.log('🔍 [CORRECTED FLOW] Nueva contraseña llenada');
        
        // Paso 6: Enviar formulario
        await page.locator('button[type="submit"]').click();
        console.log('🔍 [CORRECTED FLOW] Formulario enviado');
        
        // Esperar respuesta (con timeout más corto)
        await page.waitForTimeout(5000);
        
        // Verificar resultado
        const resetSuccessMessage = await page.locator('.text-green-400').textContent();
        const resetErrorMessage = await page.locator('.text-red-400').textContent();
        const resetCheckCircle = await page.locator('.text-green-500').count();
        
        console.log('🔍 [CORRECTED FLOW] Resultado del reset:');
        console.log('  - Mensaje de éxito:', resetSuccessMessage);
        console.log('  - Mensaje de error:', resetErrorMessage);
        console.log('  - Check circle:', resetCheckCircle);
        
        if (resetSuccessMessage || resetCheckCircle > 0) {
          console.log('✅ [CORRECTED FLOW] RESET DE CONTRASEÑA EXITOSO');
        } else if (resetErrorMessage) {
          console.log('❌ [CORRECTED FLOW] Error en reset:', resetErrorMessage);
        } else {
          console.log('⚠️ [CORRECTED FLOW] No se recibió respuesta clara');
        }
      } else {
        console.log('❌ [CORRECTED FLOW] Formulario de reset no encontrado');
      }
    } else {
      console.log('❌ [CORRECTED FLOW] Error en forgot-password');
    }
    
    // Generar reporte
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Corrected Password Flow Test',
      results: {
        forgotPasswordSuccess: !!(successMessage || checkCircle > 0),
        resetPageAccessible: pageTitle === 'Restablecer Contraseña',
        resetFormFound: passwordInputs >= 2,
        resetSuccess: !!(resetSuccessMessage || resetCheckCircle > 0),
        resetError: !!resetErrorMessage
      },
      consoleLogs: consoleLogs.filter(log => 
        log.includes('password') || 
        log.includes('token') || 
        log.includes('error') || 
        log.includes('success') ||
        log.includes('demo') ||
        log.includes('forgot') ||
        log.includes('reset')
      )
    };
    
    console.log('📊 [CORRECTED FLOW] REPORTE FINAL:');
    console.log(JSON.stringify(report, null, 2));
    
    console.log('🎯 [CORRECTED FLOW] Test completado');
  });
});
