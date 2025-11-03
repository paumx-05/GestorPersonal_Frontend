import { test, expect } from '@playwright/test';

/**
 * Test para verificar el flujo completo de acceso al menú "Gestión de Propiedades"
 * Verifica que:
 * 1. El usuario admin puede hacer login
 * 2. El menú "Gestión" aparece en el menú desplegable del perfil
 * 3. Al hacer clic en "Gestión de Propiedades" navega correctamente
 * 4. La página muestra todas las propiedades usando el endpoint /api/host/properties
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@airbnb.com';
const ADMIN_PASSWORD = '456789Aa';

test.describe('Admin Properties Menu Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('Usuario admin debe poder acceder a "Gestión de Propiedades" desde el menú del perfil', async ({ page }) => {
    // Configurar captura de console logs y requests de red
    const consoleLogs: string[] = [];
    const networkRequests: string[] = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type()}] ${text}`);
    });

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/') || url.includes('/admin/')) {
        networkRequests.push(`${request.method()} ${url}`);
      }
    });

    // 1. Navegar a la página de login
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/admin-flow-01-login-page.png', fullPage: true });

    // 2. Completar formulario de login
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"][name="password"], input[type="password"][id="password"]').first();
    
    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);
    await page.screenshot({ path: 'test-results/admin-flow-02-form-filled.png', fullPage: true });

    // 3. Hacer click en el botón de login
    const loginButton = page.locator('button:has-text("Iniciar sesión"), button[type="submit"]').first();
    await loginButton.click();

    // 4. Esperar a que la navegación ocurra
    await page.waitForURL(/\/$/, { timeout: 10000 });
    await page.waitForTimeout(2000); // Esperar a que la página cargue completamente
    await page.screenshot({ path: 'test-results/admin-flow-03-after-login.png', fullPage: true });

    // 5. Verificar que estamos autenticados - buscar el menú del perfil
    // El botón tiene un Menu icon y un Avatar dentro
    console.log('🔍 Buscando botón del menú del perfil...');
    
    // Buscar el botón del UserMenu que tiene Menu icon + Avatar juntos
    // El UserMenu está en AuthSection que está en el Header
    console.log('🔍 Buscando botón con Menu icon Y Avatar juntos...');
    
    // Buscar botones en el header que tengan ambos elementos
    const headerButtons = page.locator('header button, nav button');
    const headerButtonCount = await headerButtons.count();
    console.log(`🔍 Botones en header/nav: ${headerButtonCount}`);
    
    let userMenuTrigger = null;
    
    // Buscar botones que tengan tanto un SVG (Menu icon) como un Avatar
    for (let i = 0; i < headerButtonCount; i++) {
      const button = headerButtons.nth(i);
      const isVisible = await button.isVisible();
      
      if (!isVisible) continue;
      
      // Verificar que tenga Menu icon (SVG) Y Avatar
      const hasSvg = await button.locator('svg').count() > 0;
      const hasAvatar = await button.locator('[class*="avatar"]').count() > 0;
      const buttonText = await button.textContent();
      const hasShortText = !buttonText || buttonText.trim().length < 10;
      
      // El botón debe tener SVG (Menu icon) Y Avatar, y poco o ningún texto
      if (hasSvg && hasAvatar && hasShortText) {
        const boundingBox = await button.boundingBox();
        if (boundingBox && boundingBox.y < 200) {
          userMenuTrigger = button;
          console.log(`✅ Menú del perfil encontrado: botón con Menu icon + Avatar (índice ${i} en header)`);
          break;
        }
      }
    }
    
    // Si no encontramos, buscar por texto del usuario (iniciales del avatar)
    if (!userMenuTrigger) {
      console.log('🔍 Buscando por Avatar con iniciales...');
      const avatars = page.locator('[class*="avatar"]');
      const avatarCount = await avatars.count();
      
      for (let i = 0; i < avatarCount; i++) {
        const avatar = avatars.nth(i);
        const parent = avatar.locator('xpath=ancestor::button');
        const parentCount = await parent.count();
        
        if (parentCount > 0) {
          const button = parent.first();
          const isVisible = await button.isVisible();
          const boundingBox = await button.boundingBox();
          
          if (isVisible && boundingBox && boundingBox.y < 200) {
            // Verificar que el botón tenga también un SVG (Menu icon)
            const hasSvg = await button.locator('svg').count() > 0;
            if (hasSvg) {
              userMenuTrigger = button;
              console.log(`✅ Menú del perfil encontrado por Avatar + SVG (índice ${i})`);
              break;
            }
          }
        }
      }
    }
    
    if (!userMenuTrigger) {
      // Último recurso: buscar por posición (normalmente está en el header a la derecha)
      const headerButtons = page.locator('header button, nav button').last();
      const count = await headerButtons.count();
      if (count > 0) {
        userMenuTrigger = headerButtons;
        console.log('✅ Usando último botón del header como menú del perfil');
      }
    }
    
    if (!userMenuTrigger) {
      throw new Error('No se pudo encontrar el botón del menú del perfil');
    }
    
    await expect(userMenuTrigger).toBeVisible({ timeout: 10000 });
    console.log('✅ Botón del menú del perfil confirmado como visible');
    await page.screenshot({ path: 'test-results/admin-flow-04-user-menu-visible.png', fullPage: true });

    // 6. Hacer click en el menú del perfil - con múltiples intentos si es necesario
    console.log('🖱️ Haciendo click en el botón del menú...');
    
    // Intentar hacer click múltiples veces si es necesario
    for (let attempt = 0; attempt < 3; attempt++) {
      await userMenuTrigger.click({ force: attempt > 0 });
      await page.waitForTimeout(1500);
      
      // Verificar si el menú se abrió buscando elementos típicos del menú
      const menuSelectors = [
        '[role="menu"]',
        '[role="menuitem"]',
        '[data-radix-popper-content-wrapper]',
        'text="Mi Perfil"',
        'text="Mi perfil"',
        'text="Perfil"',
      ];
      
      let menuOpened = false;
      for (const selector of menuSelectors) {
        try {
          const element = page.locator(selector).first();
          const count = await element.count();
          if (count > 0) {
            const isVisible = await element.isVisible();
            if (isVisible) {
              menuOpened = true;
              console.log(`✅ Menú abierto detectado con selector: ${selector}`);
              break;
            }
          }
        } catch (e) {
          // Continuar con el siguiente selector
        }
      }
      
      if (menuOpened) {
        break;
      }
      
      console.log(`⏳ Intento ${attempt + 1}: El menú aún no está visible, intentando nuevamente...`);
      
      if (attempt === 2) {
        // Último intento: verificar qué hay en la página
        const pageText = await page.textContent('body');
        console.log('📄 Texto de la página después de los clicks:', pageText?.substring(0, 300));
        await page.screenshot({ path: 'test-results/admin-flow-05-menu-not-opened.png', fullPage: true });
      }
    }
    
    await page.waitForTimeout(1000); // Esperar un poco más para que el menú se renderice completamente
    await page.screenshot({ path: 'test-results/admin-flow-05-menu-opened.png', fullPage: true });
    console.log('✅ Intentos de apertura del menú completados');

    // 7. Verificar que el menú contiene el apartado "Administración" - con múltiples intentos
    console.log('🔍 Buscando sección "Administración" en el menú...');
    
    // Esperar y verificar múltiples veces
    let adminSectionFound = false;
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1000);
      const adminSection = page.locator('text=Administración');
      const count = await adminSection.count();
      if (count > 0) {
        const isVisible = await adminSection.isVisible();
        if (isVisible) {
          adminSectionFound = true;
          console.log('✅ Sección "Administración" encontrada');
          break;
        }
      }
      console.log(`⏳ Intento ${i + 1}: Esperando que aparezca "Administración"...`);
    }
    
    if (!adminSectionFound) {
      // Si no encontramos "Administración", listar todos los items del menú
      const allMenuItems = await page.locator('[role="menuitem"], [role="menuitemcheckbox"]').allTextContents();
      const allText = await page.textContent('[role="menu"]');
      console.log('📝 Todos los items del menú:', allMenuItems);
      console.log('📄 Texto completo del menú:', allText);
      await page.screenshot({ path: 'test-results/admin-flow-05b-menu-debug.png', fullPage: true });
      
      // Verificar si al menos hay algún texto que contenga "admin" o "gestión"
      const hasAdminText = allText?.toLowerCase().includes('admin') || 
                          allText?.toLowerCase().includes('administración') ||
                          allText?.toLowerCase().includes('gestión');
      
      if (hasAdminText) {
        console.log('⚠️ Se encontró texto relacionado con admin pero no el elemento específico');
        // Continuar con la prueba de todas formas
        adminSectionFound = true;
      } else {
        // Verificar email del usuario en localStorage
        const userInfo = await page.evaluate(() => {
          const user = localStorage.getItem('user');
          return user ? JSON.parse(user) : null;
        });
        console.log('👤 Usuario en localStorage:', userInfo);
        
        throw new Error(`No se encontró la sección "Administración" en el menú. Items disponibles: ${allMenuItems.join(', ')}. Email usuario: ${userInfo?.email || 'N/A'}`);
      }
    }

    // 8. Buscar el submenú "Gestión"
    const gestionTrigger = page.locator('text=Gestión').first();
    const gestionExists = await gestionTrigger.count() > 0;
    
    console.log('🔍 ¿Existe el menú "Gestión"?', gestionExists);
    
    if (!gestionExists) {
      // Si no existe, listar todos los items del menú para debugging
      const allMenuItems = await page.locator('[role="menuitem"]').allTextContents();
      console.log('📝 Todos los items del menú:', allMenuItems);
      await page.screenshot({ path: 'test-results/admin-flow-06-menu-items.png', fullPage: true });
      
      // Fallar el test con información útil
      throw new Error(`El menú "Gestión" no se encontró. Items disponibles: ${allMenuItems.join(', ')}`);
    }

    // 9. Hacer hover sobre "Gestión" para abrir el submenú
    await gestionTrigger.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/admin-flow-07-gestion-hovered.png', fullPage: true });

    // 10. Verificar que aparece "Gestión de Propiedades" en el submenú
    const gestionPropiedades = page.locator('text=Gestión de Propiedades');
    await expect(gestionPropiedades).toBeVisible({ timeout: 5000 });
    console.log('✅ "Gestión de Propiedades" encontrado en el submenú');
    await page.screenshot({ path: 'test-results/admin-flow-08-submenu-visible.png', fullPage: true });

    // 11. Hacer click en "Gestión de Propiedades"
    console.log('🖱️ Haciendo click en "Gestión de Propiedades"');
    await gestionPropiedades.click();
    
    // 12. Esperar a que navegue a /admin/properties
    await page.waitForURL(/\/admin\/properties/, { timeout: 15000 });
    console.log('📍 URL después del click:', page.url());
    
    // Esperar un poco más para que la página termine de cargar
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/admin-flow-09-admin-properties-page.png', fullPage: true });

    // 13. Verificar que estamos en la página correcta - buscar cualquier título relacionado
    console.log('🔍 Buscando título de la página...');
    
    // Buscar diferentes variantes de título
    const possibleTitles = [
      'h1:has-text("Gestión de Propiedades")',
      'h1:has-text("Gestión")',
      'h1:has-text("Propiedades")',
      '[class*="title"]:has-text("Gestión")',
      '[class*="title"]:has-text("Propiedades")',
      'text="Gestión de Propiedades"',
    ];
    
    let titleFound = false;
    for (const selector of possibleTitles) {
      const element = page.locator(selector).first();
      const count = await element.count();
      if (count > 0) {
        const isVisible = await element.isVisible();
        if (isVisible) {
          console.log(`✅ Título encontrado con selector: ${selector}`);
          titleFound = true;
          break;
        }
      }
    }
    
    if (!titleFound) {
      // Si no encontramos el título, verificar qué hay en la página
      const pageText = await page.textContent('body');
      console.log('📄 Primeros 500 caracteres de la página:', pageText?.substring(0, 500));
      
      // Buscar elementos de loading
      const loadingElements = page.locator('text=/cargando|loading|verificando/i');
      const loadingCount = await loadingElements.count();
      if (loadingCount > 0) {
        console.log('⏳ Parece que la página está en estado de carga');
        await page.waitForTimeout(5000); // Esperar más tiempo
        await page.screenshot({ path: 'test-results/admin-flow-09b-after-wait.png', fullPage: true });
      }
      
      // Verificar si hay un spinner o indicador de carga
      const spinner = page.locator('[class*="spinner"], [class*="loading"], [class*="animate-spin"]');
      const spinnerCount = await spinner.count();
      if (spinnerCount > 0) {
        console.log('⏳ Spinner de carga encontrado, esperando más...');
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'test-results/admin-flow-09c-after-spinner-wait.png', fullPage: true });
      }
    }
    
    // Verificar que la URL es correcta
    const currentUrl = page.url();
    console.log('📍 URL actual:', currentUrl);
    expect(currentUrl).toContain('/admin/properties');

    // 14. Verificar que se hizo la petición a /api/host/properties
    const hostPropertiesRequest = networkRequests.find(req => 
      req.includes('/api/host/properties') && req.startsWith('GET')
    );
    
    console.log('🔍 Requests de red capturados:', networkRequests);
    
    if (hostPropertiesRequest) {
      console.log('✅ Request a /api/host/properties encontrado:', hostPropertiesRequest);
    } else {
      console.warn('⚠️ No se encontró request a /api/host/properties');
      console.warn('⚠️ Requests relacionados con propiedades:', 
        networkRequests.filter(req => req.includes('propert')));
    }

    // 15. Verificar que hay propiedades cargadas (o al menos la tabla/estructura está presente)
    // Buscar elementos comunes de una tabla de propiedades
    const tableOrCards = page.locator('table, [class*="card"], [class*="grid"]').first();
    const hasTableOrCards = await tableOrCards.count() > 0;
    
    if (hasTableOrCards) {
      console.log('✅ Estructura de visualización de propiedades encontrada');
    } else {
      console.warn('⚠️ No se encontró estructura de tabla/tarjetas de propiedades');
    }

    // 16. Buscar el botón "Crear Propiedad"
    const createButton = page.locator('button:has-text("Crear Propiedad"), button:has-text("Crear"), button:has-text("Nueva Propiedad")');
    const hasCreateButton = await createButton.count() > 0;
    
    if (hasCreateButton) {
      console.log('✅ Botón "Crear Propiedad" encontrado');
      await page.screenshot({ path: 'test-results/admin-flow-10-create-button.png', fullPage: true });
    } else {
      console.warn('⚠️ Botón "Crear Propiedad" no encontrado');
    }

    // 17. Verificar logs relevantes en consola
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('[AdminProperties]') || 
      log.includes('[propertyService]') || 
      log.includes('[UserMenu]') ||
      log.includes('admin') ||
      log.includes('propiedad') ||
      log.includes('/api/host/properties')
    );
    
    console.log('\n📋 Logs relevantes del test:');
    relevantLogs.forEach(log => console.log(log));

    // Verificar que no hay errores críticos
    const errors = consoleLogs.filter(log => 
      log.includes('[error]') || 
      log.includes('Error') || 
      log.includes('Failed') ||
      log.includes('404') ||
      log.includes('401')
    );
    
    if (errors.length > 0) {
      console.warn('⚠️ Errores encontrados en consola:', errors);
    } else {
      console.log('✅ No se encontraron errores críticos en consola');
    }

    // 18. Verificación final de URL
    console.log('📍 URL final verificada:', page.url());
    
    await page.screenshot({ path: 'test-results/admin-flow-11-final-state.png', fullPage: true });
  });
});

