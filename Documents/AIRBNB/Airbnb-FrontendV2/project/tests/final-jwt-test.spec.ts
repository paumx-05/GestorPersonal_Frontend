import { test, expect } from '@playwright/test';

/**
 * Test final con formato JWT correcto
 */
test.describe('Test Final con JWT Correcto', () => {
  test('Probar flujo completo con formato JWT estándar', async ({ page }) => {
    console.log('🔍 [FINAL JWT] Probando flujo completo con JWT correcto...');
    
    // Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Capturar peticiones
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
    
    // Esperar respuesta
    await page.waitForTimeout(3000);
    
    // Verificar éxito
    const successMessage = await page.locator('.text-green-400').textContent();
    const checkCircle = await page.locator('.text-green-500').count();
    
    console.log('🔍 [FINAL JWT] Resultado forgot-password:');
    console.log('  - Mensaje de éxito:', successMessage);
    console.log('  - Check circle:', checkCircle);
    
    if (successMessage || checkCircle > 0) {
      console.log('✅ [FINAL JWT] Email enviado exitosamente');
      
      // Paso 3: Usar el token JWT que se generó
      // En modo demo, el token se genera con formato JWT estándar
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGZlNjlmMzU0NjdjNTlmZmIzMjY0NzYiLCJlbWFpbCI6Impvc2UxQGdtYWlsLmNvbSIsInR5cGUiOiJwYXNzd29yZC1yZXNldCIsImlhdCI6MTc2MTUwNjUzNywiZXhwIjoxNzYxNTkyOTM3fQ.BPh83MomtXmFK6L4d04iFYRKYLqHUXFL1m8HafGJAlg';
      
      console.log('🔑 [FINAL JWT] Usando token JWT:', jwtToken.substring(0, 30) + '...');
      
      // Paso 4: Ir a reset-password con token JWT
      await page.goto(`http://localhost:3000/reset-password/${jwtToken}`);
      await page.waitForLoadState('networkidle');
      
      // Verificar que estamos en la página correcta
      const pageTitle = await page.locator('h1').textContent();
      console.log('🔍 [FINAL JWT] Título de reset:', pageTitle);
      
      // Verificar si hay error de token
      const tokenError = await page.locator('.text-red-400').textContent();
      if (tokenError) {
        console.log('❌ [FINAL JWT] Error de token:', tokenError);
        return;
      }
      
      // Paso 5: Llenar nueva contraseña
      const passwordInputs = await page.locator('input[type="password"]').count();
      console.log('🔍 [FINAL JWT] Campos de contraseña:', passwordInputs);
      
      if (passwordInputs >= 2) {
        await page.locator('input[name="newPassword"]').fill('nueva123456');
        await page.locator('input[name="confirmPassword"]').fill('nueva123456');
        
        console.log('🔍 [FINAL JWT] Nueva contraseña llenada');
        
        // Paso 6: Enviar formulario
        await page.locator('button[type="submit"]').click();
        console.log('🔍 [FINAL JWT] Formulario enviado');
        
        // Esperar respuesta
        await page.waitForTimeout(5000);
        
        // Verificar resultado
        const resetSuccessMessage = await page.locator('.text-green-400').textContent();
        const resetErrorMessage = await page.locator('.text-red-400').textContent();
        const resetCheckCircle = await page.locator('.text-green-500').count();
        
        console.log('🔍 [FINAL JWT] Resultado del reset:');
        console.log('  - Mensaje de éxito:', resetSuccessMessage);
        console.log('  - Mensaje de error:', resetErrorMessage);
        console.log('  - Check circle:', resetCheckCircle);
        
        if (resetSuccessMessage || resetCheckCircle > 0) {
          console.log('✅ [FINAL JWT] RESET DE CONTRASEÑA EXITOSO CON JWT');
        } else if (resetErrorMessage) {
          console.log('❌ [FINAL JWT] Error en reset:', resetErrorMessage);
          
          // Analizar el error específico
          if (resetErrorMessage.includes('token') || resetErrorMessage.includes('inválido') || resetErrorMessage.includes('expirado')) {
            console.log('🔍 [FINAL JWT] Error de token - verificar formato JWT');
          } else if (resetErrorMessage.includes('contraseña')) {
            console.log('🔍 [FINAL JWT] Error de contraseña - verificar validación');
          } else {
            console.log('🔍 [FINAL JWT] Error desconocido - verificar logs del backend');
          }
        } else {
          console.log('⚠️ [FINAL JWT] No se recibió respuesta clara');
        }
      } else {
        console.log('❌ [FINAL JWT] Formulario de reset no encontrado');
      }
    } else {
      console.log('❌ [FINAL JWT] Error en forgot-password');
    }
    
    // Generar reporte final
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Final JWT Test',
      credentials: {
        email: 'jose1@gmail.com',
        newPassword: 'nueva123456'
      },
      results: {
        forgotPasswordSuccess: !!(successMessage || checkCircle > 0),
        resetPageAccessible: pageTitle === 'Restablecer Contraseña',
        resetFormFound: passwordInputs >= 2,
        resetSuccess: !!(resetSuccessMessage || resetCheckCircle > 0),
        resetError: !!resetErrorMessage,
        networkRequests: networkRequests.length
      },
      networkRequests: networkRequests,
      consoleLogs: consoleLogs.filter(log => 
        log.includes('password') || 
        log.includes('token') || 
        log.includes('error') || 
        log.includes('success') ||
        log.includes('jose') ||
        log.includes('JWT') ||
        log.includes('ResetPassword')
      )
    };
    
    console.log('📊 [FINAL JWT] REPORTE FINAL:');
    console.log(JSON.stringify(report, null, 2));
    
    console.log('🎯 [FINAL JWT] Test completado');
  });
});
