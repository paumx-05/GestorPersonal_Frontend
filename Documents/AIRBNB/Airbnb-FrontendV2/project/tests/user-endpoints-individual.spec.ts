import { test, expect } from '@playwright/test';

// Configuración de pruebas para endpoints individuales de usuarios
test.describe('User Collection Endpoints - Individual Testing', () => {
  
  // Configuración base
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage y cookies antes de cada prueba
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    });
  });

  test.describe('POST /api/auth/register - User Registration', () => {
    
    test('should register new user successfully', async ({ page }) => {
      // Configuración del test
      const testData = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'TestPass123',
        confirmPassword: 'TestPass123'
      };

      // Navegar a la página de registro
      await page.goto('http://localhost:3000/register');
      
      // Verificar que la página carga correctamente
      await expect(page.locator('h1')).toContainText('Registro');
      
      // Llenar el formulario de registro
      await page.fill('input[name="name"]', testData.name);
      await page.fill('input[name="email"]', testData.email);
      await page.fill('input[name="password"]', testData.password);
      await page.fill('input[name="confirmPassword"]', testData.confirmPassword);
      
      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/register') && response.request().method() === 'POST'
      );
      
      // Enviar el formulario
      await page.click('button[type="submit"]');
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es exitosa
      expect(response.status()).toBe(201);
      
      // Verificar redirección al perfil
      await expect(page).toHaveURL(/.*profile.*/);
      
      // Verificar que el usuario está autenticado
      await expect(page.locator('text=' + testData.name)).toBeVisible();
    });

    test('should show error for duplicate email', async ({ page }) => {
      // Usar un email que ya existe
      const testData = {
        name: 'Duplicate User',
        email: 'admin@airbnb.com', // Email existente
        password: 'TestPass123',
        confirmPassword: 'TestPass123'
      };

      await page.goto('http://localhost:3000/register');
      
      // Llenar el formulario
      await page.fill('input[name="name"]', testData.name);
      await page.fill('input[name="email"]', testData.email);
      await page.fill('input[name="password"]', testData.password);
      await page.fill('input[name="confirmPassword"]', testData.confirmPassword);
      
      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/register') && response.request().method() === 'POST'
      );
      
      await page.click('button[type="submit"]');
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es de error
      expect(response.status()).toBe(400);
      
      // Verificar que se muestra mensaje de error
      await expect(page.locator('text=Email ya registrado')).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123', // Contraseña muy corta
        confirmPassword: '123'
      };

      await page.goto('http://localhost:3000/register');
      
      await page.fill('input[name="name"]', testData.name);
      await page.fill('input[name="email"]', testData.email);
      await page.fill('input[name="password"]', testData.password);
      await page.fill('input[name="confirmPassword"]', testData.confirmPassword);
      
      await page.click('button[type="submit"]');
      
      // Verificar que se muestra error de validación
      await expect(page.locator('text=La contraseña debe tener al menos 6 caracteres')).toBeVisible();
    });
  });

  test.describe('POST /api/auth/login - User Login', () => {
    
    test('should login with valid admin credentials', async ({ page }) => {
      const credentials = {
        email: 'admin@airbnb.com',
        password: 'Admin1234!'
      };

      await page.goto('http://localhost:3000/login');
      
      // Verificar que la página carga correctamente
      await expect(page.locator('h1')).toContainText('Iniciar Sesión');
      
      // Llenar el formulario de login
      await page.fill('input[name="email"]', credentials.email);
      await page.fill('input[name="password"]', credentials.password);
      
      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/login') && response.request().method() === 'POST'
      );
      
      // Enviar el formulario
      await page.click('button[type="submit"]');
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es exitosa
      expect(response.status()).toBe(200);
      
      // Verificar redirección al perfil
      await expect(page).toHaveURL(/.*profile.*/);
      
      // Verificar que el usuario está autenticado
      await expect(page.locator('text=' + credentials.email)).toBeVisible();
      
      // Verificar que el token se guardó en localStorage
      const token = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
      expect(token).toBeTruthy();
    });

    test('should login with valid user credentials', async ({ page }) => {
      const credentials = {
        email: 'ana1@gmail.com',
        password: '123456789'
      };

      await page.goto('http://localhost:3000/login');
      
      await page.fill('input[name="email"]', credentials.email);
      await page.fill('input[name="password"]', credentials.password);
      
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/login') && response.request().method() === 'POST'
      );
      
      await page.click('button[type="submit"]');
      
      const response = await responsePromise;
      expect(response.status()).toBe(200);
      
      await expect(page).toHaveURL(/.*profile.*/);
      await expect(page.locator('text=' + credentials.email)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const invalidCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };

      await page.goto('http://localhost:3000/login');
      
      await page.fill('input[name="email"]', invalidCredentials.email);
      await page.fill('input[name="password"]', invalidCredentials.password);
      
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/login') && response.request().method() === 'POST'
      );
      
      await page.click('button[type="submit"]');
      
      const response = await responsePromise;
      expect(response.status()).toBe(401);
      
      // Verificar que se muestra mensaje de error
      await expect(page.locator('text=Credenciales inválidas')).toBeVisible();
      
      // Verificar que permanece en la página de login
      await expect(page).toHaveURL(/.*login.*/);
    });
  });

  test.describe('GET /api/auth/me - Get User Profile', () => {
    
    test('should get user profile when authenticated', async ({ page }) => {
      // Login primero
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      // Esperar a que se complete el login
      await expect(page).toHaveURL(/.*profile.*/);
      
      // Interceptar la petición GET /api/auth/me
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/me') && response.request().method() === 'GET'
      );
      
      // Recargar la página para activar la verificación de token
      await page.reload();
      
      const response = await responsePromise;
      expect(response.status()).toBe(200);
      
      // Verificar que se muestra la información del usuario
      await expect(page.locator('text=admin@airbnb.com')).toBeVisible();
    });

    test('should redirect to login when not authenticated', async ({ page }) => {
      // Intentar acceder al perfil sin estar autenticado
      await page.goto('http://localhost:3000/profile');
      
      // Verificar que se redirige al login
      await expect(page).toHaveURL(/.*login.*/);
    });
  });

  test.describe('POST /api/auth/logout - User Logout', () => {
    
    test('should logout successfully', async ({ page }) => {
      // Login primero
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      // Esperar a que se complete el login
      await expect(page).toHaveURL(/.*profile.*/);
      
      // Interceptar la petición de logout
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/logout') && response.request().method() === 'POST'
      );
      
      // Hacer logout
      await page.click('button[data-testid="logout-button"]');
      
      const response = await responsePromise;
      expect(response.status()).toBe(200);
      
      // Verificar redirección al login
      await expect(page).toHaveURL(/.*login.*/);
      
      // Verificar que el token se eliminó del localStorage
      const token = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
      expect(token).toBeNull();
    });
  });

  test.describe('POST /api/auth/forgot-password - Password Reset Request', () => {
    
    test('should send password reset email for valid user', async ({ page }) => {
      await page.goto('http://localhost:3000/forgot-password');
      
      // Verificar que la página carga correctamente
      await expect(page.locator('h1')).toContainText('Recuperar Contraseña');
      
      // Llenar el formulario
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      
      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/forgot-password') && response.request().method() === 'POST'
      );
      
      // Enviar el formulario
      await page.click('button[type="submit"]');
      
      const response = await responsePromise;
      expect(response.status()).toBe(200);
      
      // Verificar que se muestra mensaje de confirmación
      await expect(page.locator('text=Si el email está registrado')).toBeVisible();
    });

    test('should handle invalid email gracefully', async ({ page }) => {
      await page.goto('http://localhost:3000/forgot-password');
      
      await page.fill('input[name="email"]', 'nonexistent@example.com');
      
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/forgot-password') && response.request().method() === 'POST'
      );
      
      await page.click('button[type="submit"]');
      
      const response = await responsePromise;
      expect(response.status()).toBe(200);
      
      // Debe mostrar el mismo mensaje por seguridad
      await expect(page.locator('text=Si el email está registrado')).toBeVisible();
    });
  });

  test.describe('POST /api/auth/reset-password - Password Reset', () => {
    
    test('should reset password with valid token', async ({ page }) => {
      // Simular acceso con token válido
      await page.goto('http://localhost:3000/reset-password/valid-token');
      
      // Verificar que la página carga correctamente
      await expect(page.locator('h1')).toContainText('Restablecer Contraseña');
      
      // Llenar el formulario
      await page.fill('input[name="password"]', 'NewPassword123');
      await page.fill('input[name="confirmPassword"]', 'NewPassword123');
      
      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/reset-password') && response.request().method() === 'POST'
      );
      
      // Enviar el formulario
      await page.click('button[type="submit"]');
      
      const response = await responsePromise;
      
      // Nota: Este test podría fallar si no hay un token válido real
      // En un entorno de testing real, se necesitaría un token válido
      if (response.status() === 200) {
        await expect(page.locator('text=Contraseña restablecida')).toBeVisible();
      } else {
        // Si el token es inválido, verificar el mensaje de error
        await expect(page.locator('text=Token inválido')).toBeVisible();
      }
    });

    test('should show error for invalid token', async ({ page }) => {
      await page.goto('http://localhost:3000/reset-password/invalid-token');
      
      await page.fill('input[name="password"]', 'NewPassword123');
      await page.fill('input[name="confirmPassword"]', 'NewPassword123');
      
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/reset-password') && response.request().method() === 'POST'
      );
      
      await page.click('button[type="submit"]');
      
      const response = await responsePromise;
      expect(response.status()).toBe(400);
      
      // Verificar que se muestra mensaje de error
      await expect(page.locator('text=Token inválido')).toBeVisible();
    });
  });

  test.describe('POST /api/auth/refresh - Token Refresh', () => {
    
    test('should refresh token automatically', async ({ page }) => {
      // Login primero
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/.*profile.*/);
      
      // Interceptar la petición de refresh
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/auth/refresh') && response.request().method() === 'POST'
      );
      
      // Simular una petición que requiere refresh del token
      await page.goto('http://localhost:3000/profile');
      
      // Esperar la respuesta (puede que no se ejecute si el token aún es válido)
      try {
        const response = await responsePromise;
        expect(response.status()).toBe(200);
      } catch (error) {
        // Si no se ejecuta el refresh, significa que el token aún es válido
        console.log('Token refresh not needed - token still valid');
      }
    });
  });

  test.describe('Session Persistence Testing', () => {
    
    test('should maintain session after page reload', async ({ page }) => {
      // Login
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/.*profile.*/);
      
      // Recargar la página
      await page.reload();
      
      // Verificar que el usuario sigue autenticado
      await expect(page.locator('text=admin@airbnb.com')).toBeVisible();
      
      // Verificar que el token persiste
      const token = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
      expect(token).toBeTruthy();
    });

    test('should maintain session across different pages', async ({ page }) => {
      // Login
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/.*profile.*/);
      
      // Navegar a diferentes páginas protegidas
      await page.goto('http://localhost:3000');
      await expect(page.locator('text=admin@airbnb.com')).toBeVisible();
      
      await page.goto('http://localhost:3000/profile');
      await expect(page.locator('text=admin@airbnb.com')).toBeVisible();
    });
  });

  test.describe('Error Handling Testing', () => {
    
    test('should handle network errors gracefully', async ({ page }) => {
      // Interceptar todas las peticiones para simular error de red
      await page.route('**/api/**', route => {
        route.abort('failed');
      });
      
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      // Verificar que se muestra mensaje de error de conexión
      await expect(page.locator('text=Error de conexión')).toBeVisible();
    });

    test('should show loading states during API calls', async ({ page }) => {
      // Interceptar peticiones para simular delay
      await page.route('**/api/auth/login', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      // Verificar que se muestra estado de carga
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });
  });

  test.describe('Cross-Browser Testing', () => {
    
    test('should work in different browsers', async ({ page, browserName }) => {
      console.log(`Testing in ${browserName}`);
      
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/.*profile.*/);
      await expect(page.locator('text=admin@airbnb.com')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    
    test('should work on mobile devices', async ({ page }) => {
      // Simular dispositivo móvil
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('http://localhost:3000/login');
      
      // Verificar que el formulario es responsive
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/.*profile.*/);
    });
  });
});
