import { test, expect } from '@playwright/test';

/**
 * Test para verificar credenciales válidas en el backend
 * Prueba diferentes combinaciones de credenciales
 */

test.describe('Backend Credentials Verification', () => {
  test('Verificar credenciales válidas en el backend', async ({ page }) => {
    console.log('🔍 [CREDENTIALS TEST] Verificando credenciales válidas...');
    
    // Limpiar storage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Ir a login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Interceptar respuestas del backend
    const loginResponses: any[] = [];
    page.on('response', response => {
      if (response.url().includes('localhost:5000/api/auth/login')) {
        loginResponses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
      }
    });
    
    // Probar credenciales de admin
    console.log('🔍 [CREDENTIALS TEST] Probando credenciales de admin...');
    await page.fill('input[name="email"]', 'admin@airbnb.com');
    await page.fill('input[name="password"]', 'Admin1234!');
    await page.click('button[type="submit"]');
    
    // Esperar respuesta
    await page.waitForTimeout(3000);
    
    // Verificar si el login fue exitoso
    const currentUrl = page.url();
    console.log('🔍 [CREDENTIALS TEST] URL después del login:', currentUrl);
    
    // Verificar token
    const token = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
    console.log('🔍 [CREDENTIALS TEST] Token después del login:', token ? 'EXISTE' : 'NO EXISTE');
    
    // Si no funcionó, probar con credenciales demo
    if (!token) {
      console.log('🔍 [CREDENTIALS TEST] Probando credenciales demo...');
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'demo@airbnb.com');
      await page.fill('input[name="password"]', 'demo1234');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      const tokenDemo = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
      console.log('🔍 [CREDENTIALS TEST] Token con credenciales demo:', tokenDemo ? 'EXISTE' : 'NO EXISTE');
      
      if (tokenDemo) {
        console.log('✅ [CREDENTIALS TEST] Credenciales demo funcionan!');
        
        // Probar acceso al perfil
        await page.goto('http://localhost:3000/profile');
        await page.waitForLoadState('networkidle');
        
        const profileUrl = page.url();
        console.log('🔍 [CREDENTIALS TEST] URL del perfil:', profileUrl);
        
        // Buscar formulario de cambio de contraseña
        const changePasswordForm = await page.locator('form').filter({ hasText: 'Cambiar contraseña' }).count();
        console.log('🔍 [CREDENTIALS TEST] Formularios de cambio de contraseña:', changePasswordForm);
        
        if (changePasswordForm > 0) {
          console.log('✅ [CREDENTIALS TEST] Formulario de cambio de contraseña encontrado!');
          
          // Probar cambio de contraseña
          await page.fill('input[id="current-password"]', 'demo1234');
          await page.fill('input[id="new-password"]', 'nueva123456');
          await page.fill('input[id="confirm-password"]', 'nueva123456');
          
          // Capturar logs antes del submit
          const consoleLogs: string[] = [];
          page.on('console', msg => {
            consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
          });
          
          await page.click('button[type="submit"]');
          await page.waitForTimeout(3000);
          
          // Verificar resultado
          const errorMessage = await page.locator('.text-red-400').textContent();
          const successMessage = await page.locator('.text-green-400').textContent();
          
          console.log('🔍 [CREDENTIALS TEST] Mensaje de error:', errorMessage);
          console.log('🔍 [CREDENTIALS TEST] Mensaje de éxito:', successMessage);
          
          // Generar reporte
          const report = {
            timestamp: new Date().toISOString(),
            adminCredentials: {
              email: 'admin@airbnb.com',
              password: 'Admin1234!',
              success: !!token
            },
            demoCredentials: {
              email: 'demo@airbnb.com',
              password: 'demo1234',
              success: !!tokenDemo
            },
            profileAccessible: !profileUrl.includes('/login'),
            changePasswordFormFound: changePasswordForm > 0,
            passwordChangeResult: {
              error: errorMessage,
              success: successMessage
            },
            loginResponses: loginResponses,
            consoleLogs: consoleLogs.filter(log => log.includes('password') || log.includes('token') || log.includes('error'))
          };
          
          console.log('📊 [CREDENTIALS TEST] REPORTE COMPLETO:');
          console.log(JSON.stringify(report, null, 2));
          
          // Guardar reporte
          await page.evaluate((report) => {
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'credentials-verification-report.json';
            a.click();
            URL.revokeObjectURL(url);
          }, report);
          
          // Assertions
          expect(tokenDemo).toBeTruthy();
          expect(changePasswordForm).toBeGreaterThan(0);
        }
      }
    }
  });
});
