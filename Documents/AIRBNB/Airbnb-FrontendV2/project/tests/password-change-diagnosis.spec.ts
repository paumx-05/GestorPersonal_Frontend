import { test, expect } from '@playwright/test';

/**
 * Test de diagnóstico para el flujo de cambio de contraseña
 * Identifica problemas con tokens inválidos o expirados
 */

test.describe('Password Change Flow Diagnosis', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Diagnosticar problema de token en cambio de contraseña', async ({ page }) => {
    console.log('🔍 [TEST] Iniciando diagnóstico del flujo de cambio de contraseña...');
    
    // Paso 1: Ir a la página de login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Paso 2: Hacer login con usuario de prueba
    console.log('🔍 [TEST] Realizando login...');
    await page.fill('input[type="email"]', 'ana1@gmail.com');
    await page.fill('input[type="password"]', '123456789');
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete el login
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✅ [TEST] Login completado exitosamente');
    
    // Paso 3: Verificar que el token se guardó correctamente
    const token = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
    console.log('🔍 [TEST] Token guardado:', token ? 'SÍ' : 'NO');
    if (token) {
      console.log('🔍 [TEST] Token (primeros 20 chars):', token.substring(0, 20) + '...');
    }
    
    // Paso 4: Ir al perfil para cambiar contraseña
    console.log('🔍 [TEST] Navegando al perfil...');
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    
    // Paso 5: Buscar el formulario de cambio de contraseña
    console.log('🔍 [TEST] Buscando formulario de cambio de contraseña...');
    const changePasswordForm = page.locator('form').filter({ hasText: 'Cambiar contraseña' });
    await expect(changePasswordForm).toBeVisible();
    
    // Paso 6: Llenar el formulario de cambio de contraseña
    console.log('🔍 [TEST] Llenando formulario de cambio de contraseña...');
    await page.fill('input[id="current-password"]', '123456789');
    await page.fill('input[id="new-password"]', 'nueva123456');
    await page.fill('input[id="confirm-password"]', 'nueva123456');
    
    // Paso 7: Capturar logs de consola antes del submit
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Paso 8: Enviar el formulario y capturar la respuesta
    console.log('🔍 [TEST] Enviando formulario...');
    await page.click('button[type="submit"]');
    
    // Esperar respuesta del servidor
    await page.waitForTimeout(3000);
    
    // Paso 9: Verificar si hay errores
    const errorMessage = await page.locator('.text-red-400').textContent();
    const successMessage = await page.locator('.text-green-400').textContent();
    
    console.log('🔍 [TEST] Mensaje de error:', errorMessage);
    console.log('🔍 [TEST] Mensaje de éxito:', successMessage);
    
    // Paso 10: Verificar logs de consola
    console.log('🔍 [TEST] Logs de consola capturados:');
    consoleLogs.forEach(log => console.log(log));
    
    // Paso 11: Verificar el estado del token después del intento
    const tokenAfter = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
    console.log('🔍 [TEST] Token después del intento:', tokenAfter ? 'SÍ' : 'NO');
    
    // Paso 12: Hacer una petición directa para verificar el token
    console.log('🔍 [TEST] Verificando token con petición directa...');
    const tokenVerification = await page.evaluate(async (token) => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        return {
          status: response.status,
          data: data,
          ok: response.ok
        };
      } catch (error) {
        return { error: error.message };
      }
    }, token);
    
    console.log('🔍 [TEST] Verificación de token:', tokenVerification);
    
    // Paso 13: Probar cambio de contraseña con petición directa
    console.log('🔍 [TEST] Probando cambio de contraseña con petición directa...');
    const directPasswordChange = await page.evaluate(async (token) => {
      try {
        const response = await fetch('http://localhost:5000/api/profile/change-password', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentPassword: '123456789',
            newPassword: 'nueva123456'
          })
        });
        const data = await response.json();
        return {
          status: response.status,
          data: data,
          ok: response.ok
        };
      } catch (error) {
        return { error: error.message };
      }
    }, token);
    
    console.log('🔍 [TEST] Cambio de contraseña directo:', directPasswordChange);
    
    // Generar reporte de diagnóstico
    const diagnosis = {
      timestamp: new Date().toISOString(),
      loginSuccess: !!token,
      tokenPresent: !!token,
      tokenAfterAttempt: !!tokenAfter,
      errorMessage: errorMessage,
      successMessage: successMessage,
      tokenVerification: tokenVerification,
      directPasswordChange: directPasswordChange,
      consoleLogs: consoleLogs
    };
    
    console.log('📊 [TEST] DIAGNÓSTICO COMPLETO:');
    console.log(JSON.stringify(diagnosis, null, 2));
    
    // Guardar diagnóstico en archivo
    await page.evaluate((diagnosis) => {
      const blob = new Blob([JSON.stringify(diagnosis, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'password-change-diagnosis.json';
      a.click();
      URL.revokeObjectURL(url);
    }, diagnosis);
  });
});
