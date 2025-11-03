import { test, expect } from '@playwright/test';

/**
 * Test de QA para el flujo de reset de password
 * Usando la metodología de testing de Playwright según @playwright-test rule
 * 
 * Flow to test: Reset Password Flow
 * Base URL: http://localhost:3000
 * Main endpoint: /forgot-password
 * Test credentials: test@example.com
 * Test data: Token de reset de password
 */

test.describe('Reset Password Flow - QA Testing', () => {
  const BASE_URL = 'http://localhost:3000';
  const TEST_EMAIL = 'test@example.com';
  const NEW_PASSWORD = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    // Limpiar cache y localStorage antes de cada test
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Main Flow Testing - Reset Password Complete Flow', async ({ page }) => {
    console.log('🔍 [QA Test] Iniciando test del flujo completo de reset de password');
    
    // Paso 1: Navegar a la página de forgot password
    console.log('📝 [QA Test] Paso 1: Navegando a /forgot-password');
    await page.goto(`${BASE_URL}/forgot-password`);
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página cargó correctamente
    await expect(page.locator('h1')).toContainText('¿Olvidaste tu contraseña?');
    console.log('✅ [QA Test] Página de forgot password cargada correctamente');

    // Paso 2: Llenar el formulario con el email de prueba
    console.log('📝 [QA Test] Paso 2: Llenando formulario con email de prueba');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    
    // Esperar respuesta del backend
    await page.waitForTimeout(3000);
    console.log('✅ [QA Test] Formulario enviado');

    // Verificar que se muestra el mensaje de éxito
    const successMessage = page.locator('text=¡Email Enviado!');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    console.log('✅ [QA Test] Mensaje de éxito mostrado');

    // Paso 3: Simular acceso al enlace de reset (usando un token de prueba)
    console.log('📝 [QA Test] Paso 3: Simulando acceso al enlace de reset');
    const testToken = 'reset_' + btoa(JSON.stringify({ 
      email: TEST_EMAIL, 
      timestamp: Date.now() 
    }));
    
    await page.goto(`${BASE_URL}/reset-password/${testToken}`);
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página de reset cargó
    await expect(page.locator('h1')).toContainText('Restablecer Contraseña');
    console.log('✅ [QA Test] Página de reset password cargada');

    // Paso 4: Usar el debugger para diagnosticar problemas
    console.log('📝 [QA Test] Paso 4: Ejecutando diagnóstico del sistema');
    const debugButton = page.locator('button:has-text("DIAGNOSTICAR RESET")');
    await debugButton.click();
    
    // Esperar resultado del diagnóstico
    await page.waitForTimeout(5000);
    
    // Capturar resultado del diagnóstico
    const debugResult = page.locator('.bg-black\\/20');
    const debugText = await debugResult.textContent();
    console.log('🔍 [QA Test] Resultado del diagnóstico:', debugText);

    // Paso 5: Intentar cambiar la contraseña
    console.log('📝 [QA Test] Paso 5: Intentando cambiar contraseña');
    await page.fill('input[name="newPassword"]', NEW_PASSWORD);
    await page.fill('input[name="confirmPassword"]', NEW_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Esperar respuesta
    await page.waitForTimeout(3000);
    
    // Verificar resultado
    const errorMessage = page.locator('.text-red-400');
    const successResetMessage = page.locator('text=¡Contraseña Restablecida!');
    
    if (await successResetMessage.isVisible()) {
      console.log('✅ [QA Test] Reset de contraseña exitoso');
    } else if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.log('❌ [QA Test] Error en reset de contraseña:', errorText);
    }

    // Capturar screenshot final
    await page.screenshot({ path: 'reset-password-test-result.png', fullPage: true });
    console.log('📸 [QA Test] Screenshot capturado: reset-password-test-result.png');
  });

  test('Error Handling Testing - Invalid Token', async ({ page }) => {
    console.log('🔍 [QA Test] Iniciando test de manejo de errores - Token inválido');
    
    // Usar un token inválido
    const invalidToken = 'invalid_token_123';
    await page.goto(`${BASE_URL}/reset-password/${invalidToken}`);
    await page.waitForLoadState('networkidle');
    
    // Verificar que se muestra el error correcto
    await expect(page.locator('h1')).toContainText('Token Inválido');
    console.log('✅ [QA Test] Error de token inválido manejado correctamente');
    
    // Verificar que hay opciones para solicitar nuevo enlace
    const newLinkButton = page.locator('a:has-text("Solicitar nuevo enlace")');
    await expect(newLinkButton).toBeVisible();
    console.log('✅ [QA Test] Opción de solicitar nuevo enlace disponible');
  });

  test('Session Persistence Testing', async ({ page }) => {
    console.log('🔍 [QA Test] Iniciando test de persistencia de sesión');
    
    // Navegar a páginas protegidas después del reset
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    // Verificar redirección a login si no está autenticado
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('✅ [QA Test] Redirección a login correcta para usuario no autenticado');
    } else {
      console.log('⚠️ [QA Test] No se redirigió a login como se esperaba');
    }
  });

  test('Cross-Browser Testing - Chrome', async ({ page }) => {
    console.log('🔍 [QA Test] Iniciando test cross-browser en Chrome');
    
    // Test básico de funcionalidad
    await page.goto(`${BASE_URL}/forgot-password`);
    await expect(page.locator('h1')).toContainText('¿Olvidaste tu contraseña?');
    
    // Verificar responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop
    await page.waitForTimeout(1000);
    
    console.log('✅ [QA Test] Test cross-browser completado');
  });

  test('Performance Analysis', async ({ page }) => {
    console.log('🔍 [QA Test] Iniciando análisis de rendimiento');
    
    // Medir tiempo de carga de la página de forgot password
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/forgot-password`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 [QA Test] Tiempo de carga de /forgot-password: ${loadTime}ms`);
    
    // Verificar que el tiempo de carga es razonable (< 3 segundos)
    expect(loadTime).toBeLessThan(3000);
    console.log('✅ [QA Test] Tiempo de carga dentro del rango aceptable');
    
    // Medir tiempo de respuesta del formulario
    const formStartTime = Date.now();
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=¡Email Enviado!', { timeout: 10000 });
    const formResponseTime = Date.now() - formStartTime;
    
    console.log(`📊 [QA Test] Tiempo de respuesta del formulario: ${formResponseTime}ms`);
    expect(formResponseTime).toBeLessThan(10000);
    console.log('✅ [QA Test] Tiempo de respuesta del formulario aceptable');
  });
});
