import { test, expect } from '@playwright/test';

/**
 * Test para analizar el formato del token
 */
test.describe('Análisis del Formato del Token', () => {
  test('Analizar formato del token generado y enviado', async ({ page }) => {
    console.log('🔍 [TOKEN ANALYSIS] Analizando formato del token...');
    
    // Capturar logs de consola
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Capturar peticiones y respuestas
    const networkRequests: string[] = [];
    const networkResponses: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/auth/')) {
        networkRequests.push(`[REQUEST] ${request.method()} ${request.url()}`);
        // Capturar el body de la petición
        request.postData().then(data => {
          if (data) {
            networkRequests.push(`[BODY] ${data}`);
          }
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/auth/')) {
        networkResponses.push(`[RESPONSE] ${response.status()} ${response.url()}`);
        // Capturar el body de la respuesta
        response.text().then(text => {
          networkResponses.push(`[RESPONSE_BODY] ${text}`);
        });
      }
    });
    
    // Paso 1: Generar token de prueba
    const testEmail = 'jose1@gmail.com';
    const testUserId = '68fe69f35467c59ffb326476';
    const testTimestamp = Date.now();
    
    // Token que estamos generando actualmente
    const currentToken = `reset_${btoa(JSON.stringify({ 
      email: testEmail, 
      userId: testUserId,
      timestamp: testTimestamp
    }))}`;
    
    console.log('🔍 [TOKEN ANALYSIS] Token generado:');
    console.log('  - Formato completo:', currentToken);
    console.log('  - Longitud:', currentToken.length);
    console.log('  - Prefijo:', currentToken.substring(0, 6));
    console.log('  - Payload (primeros 50 chars):', currentToken.substring(6, 56));
    
    // Decodificar el payload para verificar
    try {
      const payload = currentToken.replace('reset_', '');
      const decoded = JSON.parse(atob(payload));
      console.log('🔍 [TOKEN ANALYSIS] Payload decodificado:');
      console.log('  - Email:', decoded.email);
      console.log('  - UserId:', decoded.userId);
      console.log('  - Timestamp:', decoded.timestamp);
      console.log('  - Tipo:', decoded.type || 'undefined');
    } catch (error) {
      console.log('❌ [TOKEN ANALYSIS] Error decodificando token:', error);
    }
    
    // Paso 2: Probar diferentes formatos de token
    const tokenFormats = [
      {
        name: 'Formato actual',
        token: currentToken
      },
      {
        name: 'JWT estándar',
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Impvc2UxQGdtYWlsLmNvbSIsInVzZXJJZCI6IjY4ZmU2OWYzNTQ2NzdjNTlmZmIzMjY0NzYiLCJ0eXBlIjoicGFzc3dvcmQtcmVzZXQiLCJpYXQiOjE3NjE1MDY1MzcsImV4cCI6MTc2MTU5MjkzN30.BPh83MomtXmFK6L4d04iFYRKYLqHUXFL1m8HafGJAlg`
      },
      {
        name: 'Token simple',
        token: 'simple-reset-token-123'
      },
      {
        name: 'Token con UUID',
        token: 'reset-' + '123e4567-e89b-12d3-a456-426614174000'
      }
    ];
    
    console.log('🔍 [TOKEN ANALYSIS] Probando diferentes formatos:');
    
    for (const format of tokenFormats) {
      console.log(`\n🔍 [TOKEN ANALYSIS] Probando: ${format.name}`);
      console.log(`  - Token: ${format.token.substring(0, 50)}...`);
      
      // Ir a reset-password con este token
      await page.goto(`http://localhost:3000/reset-password/${format.token}`);
      await page.waitForLoadState('networkidle');
      
      // Verificar si la página carga correctamente
      const pageTitle = await page.locator('h1').textContent();
      console.log(`  - Título de página: ${pageTitle}`);
      
      // Si hay formulario, probarlo
      const passwordInputs = await page.locator('input[type="password"]').count();
      if (passwordInputs >= 2) {
        console.log(`  - Formulario encontrado: ${passwordInputs} campos`);
        
        // Llenar formulario
        await page.locator('input[name="newPassword"]').fill('nueva123456');
        await page.locator('input[name="confirmPassword"]').fill('nueva123456');
        await page.locator('button[type="submit"]').click();
        
        // Esperar respuesta
        await page.waitForTimeout(3000);
        
        // Verificar resultado
        const successMessage = await page.locator('.text-green-400').textContent();
        const errorMessage = await page.locator('.text-red-400').textContent();
        
        console.log(`  - Resultado: ${successMessage || errorMessage || 'Sin respuesta'}`);
        
        if (successMessage) {
          console.log(`✅ [TOKEN ANALYSIS] ${format.name} FUNCIONA`);
          break;
        } else if (errorMessage) {
          console.log(`❌ [TOKEN ANALYSIS] ${format.name} falla: ${errorMessage}`);
        }
      } else {
        console.log(`  - Formulario no encontrado`);
      }
    }
    
    // Paso 3: Analizar peticiones capturadas
    console.log('\n🔍 [TOKEN ANALYSIS] Peticiones capturadas:');
    networkRequests.forEach(req => console.log(`  ${req}`));
    
    console.log('\n🔍 [TOKEN ANALYSIS] Respuestas capturadas:');
    networkResponses.forEach(res => console.log(`  ${res}`));
    
    // Paso 4: Generar reporte
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Token Format Analysis',
      tokenFormats: tokenFormats.map(f => ({
        name: f.name,
        token: f.token.substring(0, 50) + '...',
        length: f.token.length
      })),
      networkRequests: networkRequests,
      networkResponses: networkResponses,
      consoleLogs: consoleLogs.filter(log => 
        log.includes('token') || 
        log.includes('TOKEN') ||
        log.includes('analysis') ||
        log.includes('ANALYSIS')
      )
    };
    
    console.log('\n📊 [TOKEN ANALYSIS] REPORTE FINAL:');
    console.log(JSON.stringify(report, null, 2));
    
    console.log('\n🎯 [TOKEN ANALYSIS] Análisis completado');
  });
});
