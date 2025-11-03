import { test, expect } from '@playwright/test';

// Configuración de pruebas para el módulo de usuarios
test.describe('User Module Integration Tests', () => {
  
  // Configuración base
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('http://localhost:3000');
    
    // Limpiar localStorage y cookies
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    });
  });

  test.describe('Authentication Flow', () => {
    
    test('should register a new user successfully', async ({ page }) => {
      // Navegar a la página de registro
      await page.goto('http://localhost:3000/register');
      
      // Llenar el formulario de registro
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'testuser@example.com');
      await page.fill('input[name="password"]', 'TestPass123');
      await page.fill('input[name="confirmPassword"]', 'TestPass123');
      
      // Enviar el formulario
      await page.click('button[type="submit"]');
      
      // Verificar redirección exitosa
      await expect(page).toHaveURL(/.*profile.*/);
      
      // Verificar que el usuario está autenticado
      await expect(page.locator('text=Test User')).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
      // Navegar a la página de login
      await page.goto('http://localhost:3000/login');
      
      // Llenar el formulario de login
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      
      // Enviar el formulario
      await page.click('button[type="submit"]');
      
      // Verificar redirección exitosa
      await expect(page).toHaveURL(/.*profile.*/);
      
      // Verificar que el usuario está autenticado
      await expect(page.locator('text=admin@airbnb.com')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
      // Navegar a la página de login
      await page.goto('http://localhost:3000/login');
      
      // Llenar el formulario con credenciales inválidas
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      
      // Enviar el formulario
      await page.click('button[type="submit"]');
      
      // Verificar que se muestra un mensaje de error
      await expect(page.locator('text=Error')).toBeVisible();
      
      // Verificar que permanece en la página de login
      await expect(page).toHaveURL(/.*login.*/);
    });

    test('should logout successfully', async ({ page }) => {
      // Login primero
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      // Esperar a que se complete el login
      await expect(page).toHaveURL(/.*profile.*/);
      
      // Hacer logout
      await page.click('button[data-testid="logout-button"]');
      
      // Verificar redirección al login
      await expect(page).toHaveURL(/.*login.*/);
    });
  });

  test.describe('Property Search and Details', () => {
    
    test('should search properties successfully', async ({ page }) => {
      // Navegar a la página principal
      await page.goto('http://localhost:3000');
      
      // Llenar el formulario de búsqueda
      await page.fill('input[placeholder*="location"]', 'Madrid');
      await page.fill('input[type="date"][name="checkIn"]', '2025-02-01');
      await page.fill('input[type="date"][name="checkOut"]', '2025-02-05');
      
      // Enviar la búsqueda
      await page.click('button[type="submit"]');
      
      // Verificar que se muestran resultados
      await expect(page.locator('[data-testid="property-card"]')).toBeVisible();
    });

    test('should display property details', async ({ page }) => {
      // Navegar directamente a una página de detalle
      await page.goto('http://localhost:3000/detail/madrid-1');
      
      // Verificar que se carga la información de la propiedad
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=Madrid')).toBeVisible();
      
      // Verificar que se muestra el sidebar de reserva
      await expect(page.locator('[data-testid="reservation-sidebar"]')).toBeVisible();
    });

    test('should add property to cart', async ({ page }) => {
      // Navegar a una página de detalle
      await page.goto('http://localhost:3000/detail/madrid-1');
      
      // Esperar a que se cargue la página
      await expect(page.locator('h1')).toBeVisible();
      
      // Llenar fechas de reserva
      await page.fill('input[name="checkIn"]', '2025-02-01');
      await page.fill('input[name="checkOut"]', '2025-02-05');
      await page.selectOption('select[name="guests"]', '2');
      
      // Agregar al carrito
      await page.click('button[data-testid="add-to-cart"]');
      
      // Verificar que se muestra confirmación
      await expect(page.locator('text=Added to cart')).toBeVisible();
    });
  });

  test.describe('Reservation Flow', () => {
    
    test('should complete reservation process', async ({ page }) => {
      // Login primero
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      // Navegar al carrito
      await page.goto('http://localhost:3000/cart');
      
      // Verificar que se muestra el carrito
      await expect(page.locator('text=Reservation Cart')).toBeVisible();
      
      // Proceder al checkout
      await page.click('button[data-testid="proceed-to-checkout"]');
      
      // Verificar que se navega al checkout
      await expect(page).toHaveURL(/.*checkout.*/);
    });

    test('should display reservation summary', async ({ page }) => {
      // Navegar al checkout
      await page.goto('http://localhost:3000/checkout');
      
      // Verificar que se muestra el resumen de la reserva
      await expect(page.locator('[data-testid="reservation-summary"]')).toBeVisible();
      
      // Verificar que se muestran los detalles de pago
      await expect(page.locator('text=Payment Details')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    
    test('should handle network errors gracefully', async ({ page }) => {
      // Interceptar requests para simular error de red
      await page.route('**/api/**', route => {
        route.abort('failed');
      });
      
      // Intentar hacer login
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      // Verificar que se muestra mensaje de error de conexión
      await expect(page.locator('text=Connection error')).toBeVisible();
    });

    test('should show loading states', async ({ page }) => {
      // Interceptar requests para simular delay
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      // Intentar hacer login
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      // Verificar que se muestra estado de carga
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });
  });

  test.describe('Session Persistence', () => {
    
    test('should maintain session after page reload', async ({ page }) => {
      // Login primero
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'admin@airbnb.com');
      await page.fill('input[name="password"]', 'Admin1234!');
      await page.click('button[type="submit"]');
      
      // Esperar a que se complete el login
      await expect(page).toHaveURL(/.*profile.*/);
      
      // Recargar la página
      await page.reload();
      
      // Verificar que el usuario sigue autenticado
      await expect(page.locator('text=admin@airbnb.com')).toBeVisible();
    });

    test('should redirect to login when not authenticated', async ({ page }) => {
      // Intentar acceder a una página protegida sin estar autenticado
      await page.goto('http://localhost:3000/profile');
      
      // Verificar que se redirige al login
      await expect(page).toHaveURL(/.*login.*/);
    });
  });
});
