import { test, expect } from '@playwright/test';

/**
 * Test simple para probar el token JWT del error original
 */
test.describe('Test Token JWT Original', () => {
  test('Probar con el token JWT del error original', async ({ page }) => {
    console.log('🔍 [JWT TEST] Probando con el token JWT del error original...');
    
    // Token del error original que mencionaste
    const originalJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGZlNjlmMzU0NjdjNTlmZmIzMjY0NzYiLCJlbWFpbCI6Impvc2UxQGdtYWlsLmNvbSIsInR5cGUiOiJwYXNzd29yZC1yZXNldCIsImlhdCI6MTc2MTUwNjUzNywiZXhwIjoxNzYxNTkyOTM3fQ.BPh83MomtXmFK6L4d04iFYRKYLqHUXFL1m8HafGJAlg';
    
    console.log('🔍 [JWT TEST] Token JWT original:');
    console.log('  - Longitud:', originalJWT.length);
    console.log('  - Partes:', originalJWT.split('.').length);
    console.log('  - Header:', originalJWT.split('.')[0]);
    console.log('  - Payload:', originalJWT.split('.')[1]);
    console.log('  - Signature:', originalJWT.split('.')[2]);
    
    // Decodificar el payload del JWT
    try {
      const payload = JSON.parse(atob(originalJWT.split('.')[1]));
      console.log('🔍 [JWT TEST] Payload decodificado:');
      console.log('  - userId:', payload.userId);
      console.log('  - email:', payload.email);
      console.log('  - type:', payload.type);
      console.log('  - iat:', payload.iat);
      console.log('  - exp:', payload.exp);
      console.log('  - Tiempo restante:', Math.floor((payload.exp * 1000 - Date.now()) / 1000), 'segundos');
    } catch (error) {
      console.log('❌ [JWT TEST] Error decodificando JWT:', error);
    }
    
    // Probar con el token JWT original
    console.log('🔍 [JWT TEST] Probando con token JWT original...');
    await page.goto(`http://localhost:3000/reset-password/${originalJWT}`);
    await page.waitForLoadState('networkidle');
    
    const pageTitle = await page.locator('h1').textContent();
    console.log('🔍 [JWT TEST] Título de página:', pageTitle);
    
    const passwordInputs = await page.locator('input[type="password"]').count();
    console.log('🔍 [JWT TEST] Campos de contraseña:', passwordInputs);
    
    if (passwordInputs >= 2) {
      console.log('✅ [JWT TEST] Formulario encontrado, probando...');
      
      await page.locator('input[name="newPassword"]').fill('nueva123456');
      await page.locator('input[name="confirmPassword"]').fill('nueva123456');
      await page.locator('button[type="submit"]').click();
      
      console.log('🔍 [JWT TEST] Formulario enviado, esperando respuesta...');
      await page.waitForTimeout(5000);
      
      const successMessage = await page.locator('.text-green-400').textContent();
      const errorMessage = await page.locator('.text-red-400').textContent();
      
      console.log('🔍 [JWT TEST] Resultado:');
      console.log('  - Mensaje de éxito:', successMessage);
      console.log('  - Mensaje de error:', errorMessage);
      
      if (successMessage) {
        console.log('✅ [JWT TEST] TOKEN JWT ORIGINAL FUNCIONA');
      } else if (errorMessage) {
        console.log('❌ [JWT TEST] Error con JWT original:', errorMessage);
      } else {
        console.log('⚠️ [JWT TEST] Sin respuesta clara');
      }
    } else {
      console.log('❌ [JWT TEST] Formulario no encontrado');
    }
    
    // Probar también con prefijo reset_
    console.log('🔍 [JWT TEST] Probando con prefijo reset_...');
    const tokenWithPrefix = `reset_${originalJWT}`;
    
    await page.goto(`http://localhost:3000/reset-password/${tokenWithPrefix}`);
    await page.waitForLoadState('networkidle');
    
    const pageTitle2 = await page.locator('h1').textContent();
    console.log('🔍 [JWT TEST] Título con prefijo:', pageTitle2);
    
    const passwordInputs2 = await page.locator('input[type="password"]').count();
    console.log('🔍 [JWT TEST] Campos con prefijo:', passwordInputs2);
    
    if (passwordInputs2 >= 2) {
      await page.locator('input[name="newPassword"]').fill('nueva123456');
      await page.locator('input[name="confirmPassword"]').fill('nueva123456');
      await page.locator('button[type="submit"]').click();
      
      await page.waitForTimeout(5000);
      
      const successMessage2 = await page.locator('.text-green-400').textContent();
      const errorMessage2 = await page.locator('.text-red-400').textContent();
      
      console.log('🔍 [JWT TEST] Resultado con prefijo:');
      console.log('  - Mensaje de éxito:', successMessage2);
      console.log('  - Mensaje de error:', errorMessage2);
      
      if (successMessage2) {
        console.log('✅ [JWT TEST] TOKEN CON PREFIJO FUNCIONA');
      } else if (errorMessage2) {
        console.log('❌ [JWT TEST] Error con prefijo:', errorMessage2);
      }
    }
    
    console.log('🎯 [JWT TEST] Test completado');
  });
});
