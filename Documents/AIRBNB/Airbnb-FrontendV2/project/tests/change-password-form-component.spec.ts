import { test, expect } from '@playwright/test';

/**
 * Test específico para verificar el componente ChangePasswordForm en el perfil
 * Usa las credenciales que funcionan: jose1@gmail.com / 123456789
 */

test.describe('ChangePasswordForm Component Test', () => {
  test('Verificar que el componente ChangePasswordForm se renderiza correctamente', async ({ page }) => {
    console.log('🔍 [COMPONENT TEST] Iniciando test del componente ChangePasswordForm...');
    
    // Paso 1: Limpiar storage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Paso 2: Hacer login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 [COMPONENT TEST] Realizando login...');
    await page.fill('input[name="email"]', 'jose1@gmail.com');
    await page.fill('input[name="password"]', '123456789');
    await page.click('button[type="submit"]');
    
    // Esperar redirección
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✅ [COMPONENT TEST] Login exitoso');
    
    // Paso 3: Ir al perfil
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 [COMPONENT TEST] En la página de perfil');
    
    // Paso 4: Buscar el componente ChangePasswordForm de diferentes maneras
    console.log('🔍 [COMPONENT TEST] Buscando componente ChangePasswordForm...');
    
    // Buscar por texto "Cambiar contraseña"
    const changePasswordText = page.locator('text=Cambiar contraseña');
    const changePasswordCount = await changePasswordText.count();
    console.log('🔍 [COMPONENT TEST] Texto "Cambiar contraseña" encontrado:', changePasswordCount);
    
    // Buscar por formularios
    const forms = page.locator('form');
    const formCount = await forms.count();
    console.log('🔍 [COMPONENT TEST] Formularios encontrados:', formCount);
    
    // Buscar por campos de contraseña
    const passwordInputs = page.locator('input[type="password"]');
    const passwordInputCount = await passwordInputs.count();
    console.log('🔍 [COMPONENT TEST] Campos de contraseña encontrados:', passwordInputCount);
    
    // Buscar por ID específico
    const currentPasswordField = page.locator('input[id="current-password"]');
    const newPasswordField = page.locator('input[id="new-password"]');
    const confirmPasswordField = page.locator('input[id="confirm-password"]');
    
    const currentPasswordExists = await currentPasswordField.count();
    const newPasswordExists = await newPasswordField.count();
    const confirmPasswordExists = await confirmPasswordField.count();
    
    console.log('🔍 [COMPONENT TEST] Campo contraseña actual:', currentPasswordExists);
    console.log('🔍 [COMPONENT TEST] Campo nueva contraseña:', newPasswordExists);
    console.log('🔍 [COMPONENT TEST] Campo confirmar contraseña:', confirmPasswordExists);
    
    // Paso 5: Si encontramos el formulario, probarlo
    if (currentPasswordExists > 0 && newPasswordExists > 0 && confirmPasswordExists > 0) {
      console.log('✅ [COMPONENT TEST] Formulario de cambio de contraseña encontrado!');
      
      // Capturar logs de consola
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      });
      
      // Llenar el formulario
      await currentPasswordField.fill('123456789');
      await newPasswordField.fill('nueva123456');
      await confirmPasswordField.fill('nueva123456');
      
      console.log('🔍 [COMPONENT TEST] Formulario llenado');
      
      // Enviar formulario
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      console.log('🔍 [COMPONENT TEST] Formulario enviado');
      
      // Esperar respuesta
      await page.waitForTimeout(3000);
      
      // Verificar resultado
      const errorMessage = await page.locator('.text-red-400').textContent();
      const successMessage = await page.locator('.text-green-400').textContent();
      
      console.log('🔍 [COMPONENT TEST] Mensaje de error:', errorMessage);
      console.log('🔍 [COMPONENT TEST] Mensaje de éxito:', successMessage);
      
      // Verificar si hay error de token
      if (errorMessage && (errorMessage.includes('token') || errorMessage.includes('inválido') || errorMessage.includes('expirado'))) {
        console.log('❌ [COMPONENT TEST] ERROR DE TOKEN DETECTADO:', errorMessage);
      }
      
      // Generar reporte
      const report = {
        timestamp: new Date().toISOString(),
        testName: 'ChangePasswordForm Component Test',
        results: {
          componentFound: true,
          formFieldsFound: {
            currentPassword: currentPasswordExists > 0,
            newPassword: newPasswordExists > 0,
            confirmPassword: confirmPasswordExists > 0
          },
          formSubmission: {
            errorMessage: errorMessage,
            successMessage: successMessage,
            tokenError: errorMessage && (errorMessage.includes('token') || errorMessage.includes('inválido') || errorMessage.includes('expirado'))
          }
        },
        consoleLogs: consoleLogs.filter(log => 
          log.includes('password') || 
          log.includes('token') || 
          log.includes('error') || 
          log.includes('success') ||
          log.includes('ChangePassword')
        )
      };
      
      console.log('📊 [COMPONENT TEST] REPORTE:');
      console.log(JSON.stringify(report, null, 2));
      
    } else {
      console.log('❌ [COMPONENT TEST] Formulario de cambio de contraseña NO encontrado');
      
      // Buscar posibles errores en la consola
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      });
      
      // Generar reporte de error
      const report = {
        timestamp: new Date().toISOString(),
        testName: 'ChangePasswordForm Component Test',
        results: {
          componentFound: false,
          formFieldsFound: {
            currentPassword: currentPasswordExists > 0,
            newPassword: newPasswordExists > 0,
            confirmPassword: confirmPasswordExists > 0
          },
          possibleIssues: [
            'Componente no se está renderizando',
            'Error en el componente ChangePasswordForm',
            'Problema con la importación del componente',
            'Error de autenticación que impide el renderizado'
          ]
        },
        consoleLogs: consoleLogs.filter(log => 
          log.includes('error') || 
          log.includes('ChangePassword') ||
          log.includes('component') ||
          log.includes('render')
        )
      };
      
      console.log('📊 [COMPONENT TEST] REPORTE DE ERROR:');
      console.log(JSON.stringify(report, null, 2));
    }
    
    console.log('🎯 [COMPONENT TEST] Test completado');
  });
});
