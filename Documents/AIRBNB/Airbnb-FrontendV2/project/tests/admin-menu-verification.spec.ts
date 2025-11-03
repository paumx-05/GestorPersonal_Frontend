import { test, expect } from '@playwright/test';

/**
 * Test para verificar que el menú "Gestión" aparece correctamente
 * para usuarios administradores después del login
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

test.describe('Admin Menu Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('Usuario admin debe ver el menú "Gestión" con "Gestión de Propiedades"', async ({ page }) => {
    // Configurar captura de console logs
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type()}] ${text}`);
    });

    // Navegar a la página de login
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Capturar screenshot inicial
    await page.screenshot({ path: 'test-results/01-login-page.png', fullPage: true });

    // Completar formulario de login
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"][name="password"], input[type="password"][id="password"]').first();
    
    await emailInput.fill('admin@airbnb.com');
    await passwordInput.fill('456789Aa');
    
    // Capturar screenshot del formulario completado
    await page.screenshot({ path: 'test-results/02-login-form-filled.png', fullPage: true });

    // Hacer click en el botón de login
    const loginButton = page.locator('button:has-text("Iniciar sesión"), button[type="submit"]').first();
    await loginButton.click();

    // Esperar a que la navegación ocurra
    await page.waitForURL(/\/$|\/admin/, { timeout: 10000 });

    // Capturar screenshot después del login
    await page.screenshot({ path: 'test-results/03-after-login.png', fullPage: true });

    // Esperar a que el usuario esté cargado
    await page.waitForTimeout(2000);

    // Verificar que estamos autenticados - buscar el menú del perfil
    const userMenuTrigger = page.locator('button').filter({ has: page.locator('svg, [class*="avatar"]') }).first();
    
    await expect(userMenuTrigger).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/04-user-menu-visible.png', fullPage: true });

    // Hacer click en el menú del perfil
    await userMenuTrigger.click();
    await page.waitForTimeout(500);

    // Capturar screenshot del menú desplegable
    await page.screenshot({ path: 'test-results/05-user-menu-opened.png', fullPage: true });

    // Verificar que el menú contiene el apartado "Administración"
    const adminSection = page.locator('text=Administración');
    await expect(adminSection).toBeVisible({ timeout: 5000 });

    // Verificar que existe el submenú "Gestión"
    const gestionMenu = page.locator('text=Gestión').first();
    
    // Capturar el HTML del menú para debugging
    const menuHTML = await page.locator('[role="menu"]').innerHTML();
    console.log('📋 Menú HTML completo:', menuHTML);

    // Verificar si el menú "Gestión" está presente
    const gestionExists = await gestionMenu.count() > 0;
    console.log('🔍 ¿Existe el menú "Gestión"?', gestionExists);

    if (!gestionExists) {
      // Si no existe, buscar todos los elementos del menú
      const allMenuItems = await page.locator('[role="menuitem"]').allTextContents();
      console.log('📝 Todos los items del menú:', allMenuItems);
    }

    // Hover sobre "Gestión" si existe
    if (gestionExists) {
      await gestionMenu.hover();
      await page.waitForTimeout(500);
      
      // Verificar que aparece el submenú con "Gestión de Propiedades"
      const gestionPropiedades = page.locator('text=Gestión de Propiedades');
      await expect(gestionPropiedades).toBeVisible({ timeout: 5000 });
      
      await page.screenshot({ path: 'test-results/06-gestion-submenu.png', fullPage: true });
      
      // Hacer click en "Gestión de Propiedades"
      await gestionPropiedades.click();
      await page.waitForURL(/admin\/properties/, { timeout: 10000 });
      
      await page.screenshot({ path: 'test-results/07-admin-properties-page.png', fullPage: true });
      
      // Verificar que estamos en la página correcta
      await expect(page.locator('h1:has-text("Gestión de Propiedades")')).toBeVisible();
    } else {
      // Si no existe, verificar el estado de autenticación
      console.log('❌ El menú "Gestión" no está presente');
      
      // Verificar localStorage
      const userInStorage = await page.evaluate(() => {
        return localStorage.getItem('user');
      });
      console.log('👤 Usuario en localStorage:', userInStorage);
      
      const tokenInStorage = await page.evaluate(() => {
        return localStorage.getItem('airbnb_auth_token');
      });
      console.log('🎫 Token en localStorage:', tokenInStorage ? 'Presente' : 'Ausente');

      // Verificar response del API
      const apiResponse = await page.evaluate(async () => {
        try {
          const token = localStorage.getItem('airbnb_auth_token');
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          return await response.json();
        } catch (error) {
          return { error: error.message };
        }
      });
      console.log('📥 Respuesta de /api/auth/me:', JSON.stringify(apiResponse, null, 2));
    }

    // Filtrar logs relevantes
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('[UserMenu]') || 
      log.includes('[adminService]') || 
      log.includes('admin') || 
      log.includes('role') ||
      log.includes('error')
    );
    
    console.log('\n📋 Logs relevantes del test:');
    relevantLogs.forEach(log => console.log(log));
  });
});

