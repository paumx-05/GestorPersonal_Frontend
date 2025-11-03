import { test, expect } from '@playwright/test';

/**
 * Test del flujo COMPLETO de cambio de contraseña:
 * 1. Ir a /forgot-password
 * 2. Enviar email para solicitar token
 * 3. Simular recibir token
 * 4. Cambiar contraseña con el token
 */

test.describe('Flujo Completo de Cambio de Contraseña', () => {
  test('Probar flujo completo: forgot-password -> reset-password', async ({ page }) => {
    console.log('🔍 [COMPLETE FLOW] Iniciando test del flujo completo...');
    
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
    
    // Paso 1: Limpiar storage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Paso 2: Ir directamente a /forgot-password
    console.log('🔍 [COMPLETE FLOW] Navegando a /forgot-password...');
    await page.goto('http://localhost:3000/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página correcta
    const pageTitle = await page.locator('h1').textContent();
    console.log('🔍 [COMPLETE FLOW] Título de la página:', pageTitle);
    
    // Paso 3: Buscar formulario de forgot-password
    console.log('🔍 [COMPLETE FLOW] Buscando formulario de forgot-password...');
    
    const emailInputs = await page.locator('input[type="email"]').count();
    const forms = await page.locator('form').count();
    const submitButtons = await page.locator('button[type="submit"]').count();
    
    console.log('🔍 [COMPLETE FLOW] Elementos encontrados:');
    console.log('  - Campos de email:', emailInputs);
    console.log('  - Formularios:', forms);
    console.log('  - Botones de envío:', submitButtons);
    
    if (emailInputs > 0 && submitButtons > 0) {
      console.log('✅ [COMPLETE FLOW] Formulario encontrado, llenando...');
      
      // Llenar email
      await page.locator('input[type="email"]').first().fill('jose1@gmail.com');
      console.log('🔍 [COMPLETE FLOW] Email llenado: jose1@gmail.com');
      
      // Enviar formulario
      await page.locator('button[type="submit"]').first().click();
      console.log('🔍 [COMPLETE FLOW] Formulario enviado');
      
      // Esperar respuesta (con timeout más largo)
      await page.waitForTimeout(5000);
      
      // Verificar respuesta
      const successMessage = await page.locator('.text-green-400').textContent();
      const errorMessage = await page.locator('.text-red-400').textContent();
      const checkCircle = await page.locator('.text-green-500').count();
      
      console.log('🔍 [COMPLETE FLOW] Respuesta del envío:');
      console.log('  - Mensaje de éxito:', successMessage);
      console.log('  - Mensaje de error:', errorMessage);
      console.log('  - Ícono de éxito:', checkCircle);
      
      // Paso 4: Si hay éxito, buscar formulario de cambio de contraseña
      if (successMessage || checkCircle > 0 || !errorMessage) {
        console.log('✅ [COMPLETE FLOW] Email enviado exitosamente');
        
        // Buscar si hay un formulario de cambio de contraseña en la misma página
        const passwordInputs = await page.locator('input[type="password"]').count();
        console.log('🔍 [COMPLETE FLOW] Campos de contraseña en la página:', passwordInputs);
        
        if (passwordInputs > 0) {
          console.log('✅ [COMPLETE FLOW] Formulario de cambio de contraseña encontrado');
          
          // Buscar campos específicos
          const newPasswordField = page.locator('input[id="new-password"]');
          const confirmPasswordField = page.locator('input[id="confirm-password"]');
          
          const newPasswordExists = await newPasswordField.count();
          const confirmPasswordExists = await confirmPasswordField.count();
          
          console.log('🔍 [COMPLETE FLOW] Campos específicos:');
          console.log('  - Nueva contraseña:', newPasswordExists);
          console.log('  - Confirmar contraseña:', confirmPasswordExists);
          
          if (newPasswordExists > 0 && confirmPasswordExists > 0) {
            // Llenar nueva contraseña
            await newPasswordField.fill('nueva123456');
            await confirmPasswordField.fill('nueva123456');
            
            console.log('🔍 [COMPLETE FLOW] Nueva contraseña llenada');
            
            // Enviar formulario
            const submitButton = page.locator('button[type="submit"]');
            await submitButton.click();
            
            console.log('🔍 [COMPLETE FLOW] Formulario de cambio enviado');
            
            // Esperar respuesta
            await page.waitForTimeout(3000);
            
            // Verificar resultado final
            const finalSuccessMessage = await page.locator('.text-green-400').textContent();
            const finalErrorMessage = await page.locator('.text-red-400').textContent();
            
            console.log('🔍 [COMPLETE FLOW] Resultado final:');
            console.log('  - Mensaje de éxito:', finalSuccessMessage);
            console.log('  - Mensaje de error:', finalErrorMessage);
            
            // Verificar si hay error de token
            if (finalErrorMessage && (finalErrorMessage.includes('token') || finalErrorMessage.includes('inválido') || finalErrorMessage.includes('expirado'))) {
              console.log('❌ [COMPLETE FLOW] ERROR DE TOKEN DETECTADO:', finalErrorMessage);
            } else if (finalSuccessMessage) {
              console.log('✅ [COMPLETE FLOW] CAMBIO DE CONTRASEÑA EXITOSO:', finalSuccessMessage);
            }
          }
        } else {
          console.log('🔍 [COMPLETE FLOW] No hay formulario de cambio de contraseña en esta página');
          
          // Buscar enlaces o botones que puedan llevar al cambio de contraseña
          const links = await page.locator('a').count();
          const buttons = await page.locator('button').count();
          
          console.log('🔍 [COMPLETE FLOW] Elementos interactivos:');
          console.log('  - Enlaces:', links);
          console.log('  - Botones:', buttons);
          
          // Obtener texto de todos los enlaces
          const linkTexts = await page.locator('a').allTextContents();
          console.log('🔍 [COMPLETE FLOW] Textos de enlaces:');
          linkTexts.forEach((text, index) => {
            if (text.toLowerCase().includes('contraseña') || text.toLowerCase().includes('password') || text.toLowerCase().includes('reset')) {
              console.log(`  - Enlace ${index}: "${text}"`);
            }
          });
        }
      } else {
        console.log('❌ [COMPLETE FLOW] Error al enviar email:', errorMessage);
      }
    } else {
      console.log('❌ [COMPLETE FLOW] Formulario de forgot-password no encontrado');
    }
    
    // Paso 5: Probar flujo alternativo - ir a /reset-password directamente
    console.log('🔍 [COMPLETE FLOW] Probando flujo alternativo - /reset-password...');
    await page.goto('http://localhost:3000/reset-password');
    await page.waitForLoadState('networkidle');
    
    const resetPageTitle = await page.locator('h1').textContent();
    console.log('🔍 [COMPLETE FLOW] Título de reset-password:', resetPageTitle);
    
    // Buscar formulario en reset-password
    const resetPasswordInputs = await page.locator('input[type="password"]').count();
    const resetForms = await page.locator('form').count();
    
    console.log('🔍 [COMPLETE FLOW] Elementos en reset-password:');
    console.log('  - Campos de contraseña:', resetPasswordInputs);
    console.log('  - Formularios:', resetForms);
    
    if (resetPasswordInputs > 0) {
      console.log('✅ [COMPLETE FLOW] Formulario de reset-password encontrado');
      
      // Buscar campos específicos
      const tokenField = page.locator('input[name="token"]');
      const newPasswordField = page.locator('input[name="newPassword"]');
      const confirmPasswordField = page.locator('input[name="confirmPassword"]');
      
      const tokenExists = await tokenField.count();
      const newPasswordExists = await newPasswordField.count();
      const confirmPasswordExists = await confirmPasswordField.count();
      
      console.log('🔍 [COMPLETE FLOW] Campos en reset-password:');
      console.log('  - Token:', tokenExists);
      console.log('  - Nueva contraseña:', newPasswordExists);
      console.log('  - Confirmar contraseña:', confirmPasswordExists);
      
      if (tokenExists > 0 && newPasswordExists > 0 && confirmPasswordExists > 0) {
        // Llenar formulario con token simulado
        await tokenField.fill('simulated-token-123');
        await newPasswordField.fill('nueva123456');
        await confirmPasswordField.fill('nueva123456');
        
        console.log('🔍 [COMPLETE FLOW] Formulario de reset llenado');
        
        // Enviar formulario
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();
        
        console.log('🔍 [COMPLETE FLOW] Formulario de reset enviado');
        
        // Esperar respuesta
        await page.waitForTimeout(3000);
        
        // Verificar resultado
        const resetSuccessMessage = await page.locator('.text-green-400').textContent();
        const resetErrorMessage = await page.locator('.text-red-400').textContent();
        
        console.log('🔍 [COMPLETE FLOW] Resultado de reset:');
        console.log('  - Mensaje de éxito:', resetSuccessMessage);
        console.log('  - Mensaje de error:', resetErrorMessage);
        
        // Verificar si hay error de token
        if (resetErrorMessage && (resetErrorMessage.includes('token') || resetErrorMessage.includes('inválido') || resetErrorMessage.includes('expirado'))) {
          console.log('❌ [COMPLETE FLOW] ERROR DE TOKEN EN RESET:', resetErrorMessage);
        } else if (resetSuccessMessage) {
          console.log('✅ [COMPLETE FLOW] RESET DE CONTRASEÑA EXITOSO:', resetSuccessMessage);
        }
      }
    }
    
    // Paso 6: Generar reporte final
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Complete Password Change Flow',
      credentials: {
        email: 'jose1@gmail.com',
        password: '123456789'
      },
      results: {
        forgotPasswordPageAccessible: pageTitle === '¿Olvidaste tu contraseña?',
        forgotPasswordFormFound: emailInputs > 0 && submitButtons > 0,
        emailSentSuccessfully: successMessage || checkCircle > 0,
        resetPasswordPageAccessible: resetPageTitle === 'Reset Password' || resetPageTitle === 'Restablecer Contraseña',
        resetPasswordFormFound: resetPasswordInputs > 0,
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
    
    console.log('📊 [COMPLETE FLOW] REPORTE FINAL:');
    console.log(JSON.stringify(report, null, 2));
    
    // Guardar reporte
    await page.evaluate((report) => {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'complete-password-flow-test-report.json';
      a.click();
      URL.revokeObjectURL(url);
    }, report);
    
    console.log('🎯 [COMPLETE FLOW] Test completado');
  });
});
