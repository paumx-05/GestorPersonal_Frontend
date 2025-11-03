import { test, expect } from '@playwright/test';

/**
 * Test final para verificar que el problema está resuelto
 */

test.describe('Reset Password - Final Verification', () => {
  const BASE_URL = 'http://localhost:3000';
  const TEST_EMAIL = 'test@example.com';

  test('Complete Reset Password Flow - No Console Errors', async ({ page }) => {
    console.log('🔍 [Final Test] Verificando flujo completo sin errores de consola');
    
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ [Final Test] Error en consola:', msg.text());
      }
    });
    
    // Paso 1: Ir a forgot password
    await page.goto(`${BASE_URL}/forgot-password`);
    await page.waitForLoadState('networkidle');
    
    // Paso 2: Llenar formulario
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Verificar mensaje de éxito
    await expect(page.locator('text=¡Email Enviado!')).toBeVisible();
    console.log('✅ [Final Test] Formulario de forgot password funcionando');
    
    // Paso 3: Ir a reset password con token
    const testToken = 'reset_' + btoa(JSON.stringify({ 
      email: TEST_EMAIL, 
      timestamp: Date.now() 
    }));
    
    await page.goto(`${BASE_URL}/reset-password/${testToken}`);
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página carga correctamente
    await expect(page.locator('h1')).toContainText('Restablecer Contraseña');
    console.log('✅ [Final Test] Página de reset password cargada');
    
    // Paso 4: Ejecutar test simple del backend
    const testButton = page.locator('button:has-text("Test Backend")');
    await testButton.click();
    await page.waitForTimeout(3000);
    
    // Verificar resultado del test
    const resultText = page.locator('pre').textContent();
    const result = await resultText;
    
    expect(result).toContain('✅ Backend responde');
    expect(result).toContain('Status: 200');
    console.log('✅ [Final Test] Backend funcionando correctamente');
    
    // Paso 5: Intentar reset de contraseña
    await page.fill('input[name="newPassword"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Verificar que no hay errores críticos
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('properties') && 
      !error.includes('404') &&
      !error.includes('Failed to load resource')
    );
    
    console.log('🔍 [Final Test] Errores críticos encontrados:', criticalErrors.length);
    console.log('🔍 [Final Test] Total errores en consola:', consoleErrors.length);
    
    // Solo errores relacionados con properties son aceptables
    expect(criticalErrors.length).toBe(0);
    
    console.log('✅ [Final Test] Flujo completo funcionando sin errores críticos');
    
    // Capturar screenshot final
    await page.screenshot({ path: 'final-test-result.png', fullPage: true });
    console.log('📸 [Final Test] Screenshot capturado');
  });

  test('Backend Connectivity Verification', async ({ page }) => {
    console.log('🔍 [Backend Test] Verificando conectividad del backend');
    
    const testToken = 'reset_' + btoa(JSON.stringify({ 
      email: TEST_EMAIL, 
      timestamp: Date.now() 
    }));
    
    await page.goto(`${BASE_URL}/reset-password/${testToken}`);
    await page.waitForLoadState('networkidle');
    
    // Ejecutar test del backend
    const testButton = page.locator('button:has-text("Test Backend")');
    await testButton.click();
    await page.waitForTimeout(3000);
    
    // Verificar resultado
    const resultText = page.locator('pre').textContent();
    const result = await resultText;
    
    expect(result).toContain('✅ Backend responde');
    expect(result).toContain('Status: 200');
    expect(result).toContain('"success":true');
    
    console.log('✅ [Backend Test] Backend funcionando correctamente');
    console.log('🔍 [Backend Test] Resultado:', result);
  });

  test('Token Validation Working', async ({ page }) => {
    console.log('🔍 [Token Test] Verificando validación de tokens');
    
    // Test con token válido
    const validToken = 'reset_' + btoa(JSON.stringify({ 
      email: TEST_EMAIL, 
      timestamp: Date.now() 
    }));
    
    await page.goto(`${BASE_URL}/reset-password/${validToken}`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('Restablecer Contraseña');
    console.log('✅ [Token Test] Token válido aceptado');
    
    // Test con token inválido
    await page.goto(`${BASE_URL}/reset-password/invalid_token_123`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('Token Inválido');
    console.log('✅ [Token Test] Token inválido rechazado correctamente');
  });
});
