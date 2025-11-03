import { test, expect } from '@playwright/test';

/**
 * Test específico para diagnosticar el problema del token
 * Verifica paso a paso el guardado y persistencia del token
 */

test.describe('Token Persistence Diagnosis', () => {
  test('Verificar guardado de token después del login', async ({ page }) => {
    console.log('🔍 [TOKEN TEST] Iniciando diagnóstico de persistencia de token...');
    
    // Paso 1: Limpiar todo el storage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = 'airbnb_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
    
    // Paso 2: Verificar que no hay token inicial
    const initialToken = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
    console.log('🔍 [TOKEN TEST] Token inicial:', initialToken ? 'EXISTE' : 'NO EXISTE');
    
    // Paso 3: Ir a login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Paso 4: Interceptar todas las peticiones de red
    const networkRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('localhost:5000')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });
    
    const networkResponses: any[] = [];
    page.on('response', response => {
      if (response.url().includes('localhost:5000')) {
        networkResponses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
      }
    });
    
    // Paso 5: Hacer login
    console.log('🔍 [TOKEN TEST] Realizando login...');
    await page.fill('input[name="email"]', 'ana1@gmail.com');
    await page.fill('input[name="password"]', '123456789');
    
    // Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    await page.click('button[type="submit"]');
    
    // Paso 6: Esperar y verificar redirección
    try {
      await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
      console.log('✅ [TOKEN TEST] Redirección exitosa a home');
    } catch (error) {
      console.log('❌ [TOKEN TEST] No se redirigió a home, verificando URL actual...');
      const currentUrl = page.url();
      console.log('🔍 [TOKEN TEST] URL actual:', currentUrl);
    }
    
    // Paso 7: Verificar token después del login
    await page.waitForTimeout(2000); // Esperar a que se procese el login
    const tokenAfterLogin = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
    console.log('🔍 [TOKEN TEST] Token después del login:', tokenAfterLogin ? 'EXISTE' : 'NO EXISTE');
    
    if (tokenAfterLogin) {
      console.log('🔍 [TOKEN TEST] Token (primeros 20 chars):', tokenAfterLogin.substring(0, 20) + '...');
    }
    
    // Paso 8: Verificar cookies
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(cookie => cookie.name === 'airbnb_auth_token');
    console.log('🔍 [TOKEN TEST] Cookie de auth:', authCookie ? 'EXISTE' : 'NO EXISTE');
    
    // Paso 9: Intentar acceder al perfil
    console.log('🔍 [TOKEN TEST] Intentando acceder al perfil...');
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    
    const currentUrlAfterProfile = page.url();
    console.log('🔍 [TOKEN TEST] URL después de intentar acceder al perfil:', currentUrlAfterProfile);
    
    // Paso 10: Verificar si hay formulario de cambio de contraseña
    const changePasswordForm = await page.locator('form').filter({ hasText: 'Cambiar contraseña' }).count();
    console.log('🔍 [TOKEN TEST] Formularios de cambio de contraseña encontrados:', changePasswordForm);
    
    // Paso 11: Generar reporte completo
    const diagnosis = {
      timestamp: new Date().toISOString(),
      initialToken: !!initialToken,
      tokenAfterLogin: !!tokenAfterLogin,
      tokenValue: tokenAfterLogin ? tokenAfterLogin.substring(0, 20) + '...' : null,
      authCookie: !!authCookie,
      cookieValue: authCookie ? authCookie.value.substring(0, 20) + '...' : null,
      redirectedToHome: currentUrlAfterProfile.includes('/login') ? false : true,
      profileAccessible: !currentUrlAfterProfile.includes('/login'),
      changePasswordFormFound: changePasswordForm > 0,
      networkRequests: networkRequests,
      networkResponses: networkResponses,
      consoleLogs: consoleLogs.filter(log => log.includes('auth') || log.includes('token') || log.includes('login'))
    };
    
    console.log('📊 [TOKEN TEST] DIAGNÓSTICO COMPLETO:');
    console.log(JSON.stringify(diagnosis, null, 2));
    
    // Guardar diagnóstico
    await page.evaluate((diagnosis) => {
      const blob = new Blob([JSON.stringify(diagnosis, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'token-persistence-diagnosis.json';
      a.click();
      URL.revokeObjectURL(url);
    }, diagnosis);
    
    // Assertions para el test
    expect(tokenAfterLogin).toBeTruthy();
    expect(authCookie).toBeTruthy();
    expect(changePasswordForm).toBeGreaterThan(0);
  });
});
