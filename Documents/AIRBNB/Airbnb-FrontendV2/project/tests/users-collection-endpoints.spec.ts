import { test, expect } from '@playwright/test';

// Configuración de pruebas para endpoints individuales de la colección de usuarios
test.describe('Users Collection Endpoints - Individual Testing', () => {
  
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

  test.describe('GET /api/users - Get All Users', () => {
    
    test('should get all users with pagination', async ({ page }) => {
      // Configuración del test
      const testParams = {
        page: 1,
        limit: 10,
        sortBy: 'firstName',
        sortOrder: 'asc'
      };

      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/users') && 
        response.request().method() === 'GET' &&
        !response.url().includes('/api/users/')
      );
      
      // Navegar a la página de usuarios (asumiendo que existe)
      await page.goto('http://localhost:3000/admin/users');
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es exitosa
      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('users');
      expect(responseData.data).toHaveProperty('total');
      expect(responseData.data).toHaveProperty('page');
      expect(responseData.data).toHaveProperty('limit');
      
      // Verificar que se muestran los usuarios en la UI
      await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
    });

    test('should handle empty user list', async ({ page }) => {
      // Interceptar y simular respuesta vacía
      await page.route('**/api/users**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              users: [],
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0
            }
          })
        });
      });

      await page.goto('http://localhost:3000/admin/users');
      
      // Verificar que se muestra mensaje de lista vacía
      await expect(page.locator('text=No hay usuarios registrados')).toBeVisible();
    });

    test('should handle server error', async ({ page }) => {
      // Interceptar y simular error del servidor
      await page.route('**/api/users**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Error interno del servidor'
          })
        });
      });

      await page.goto('http://localhost:3000/admin/users');
      
      // Verificar que se muestra mensaje de error
      await expect(page.locator('text=Error interno del servidor')).toBeVisible();
    });
  });

  test.describe('GET /api/users/:id - Get User by ID', () => {
    
    test('should get user by valid ID', async ({ page }) => {
      const userId = 'user-123';
      
      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes(`/api/users/${userId}`) && 
        response.request().method() === 'GET'
      );
      
      // Navegar a la página de detalle del usuario
      await page.goto(`http://localhost:3000/admin/users/${userId}`);
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es exitosa
      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('id');
      expect(responseData.data).toHaveProperty('firstName');
      expect(responseData.data).toHaveProperty('lastName');
      expect(responseData.data).toHaveProperty('email');
      
      // Verificar que se muestra la información del usuario
      await expect(page.locator('[data-testid="user-detail"]')).toBeVisible();
    });

    test('should handle user not found', async ({ page }) => {
      const userId = 'non-existent-user';
      
      // Interceptar y simular usuario no encontrado
      await page.route(`**/api/users/${userId}`, route => {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Usuario no encontrado'
          })
        });
      });

      await page.goto(`http://localhost:3000/admin/users/${userId}`);
      
      // Verificar que se muestra mensaje de usuario no encontrado
      await expect(page.locator('text=Usuario no encontrado')).toBeVisible();
    });
  });

  test.describe('POST /api/users - Create User', () => {
    
    test('should create user with valid data', async ({ page }) => {
      const userData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        password: 'SecurePass123',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: {
          street: '123 Main St',
          city: 'Madrid',
          state: 'Madrid',
          country: 'España',
          zipCode: '28001'
        }
      };

      await page.goto('http://localhost:3000/admin/users/create');
      
      // Llenar el formulario de creación
      await page.fill('input[name="firstName"]', userData.firstName);
      await page.fill('input[name="lastName"]', userData.lastName);
      await page.fill('input[name="email"]', userData.email);
      await page.fill('input[name="password"]', userData.password);
      await page.fill('input[name="phone"]', userData.phone);
      await page.fill('input[name="dateOfBirth"]', userData.dateOfBirth);
      await page.selectOption('select[name="gender"]', userData.gender);
      
      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/users') && 
        response.request().method() === 'POST'
      );
      
      // Enviar el formulario
      await page.click('button[type="submit"]');
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es exitosa
      expect(response.status()).toBe(201);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('id');
      expect(responseData.data.firstName).toBe(userData.firstName);
      expect(responseData.data.lastName).toBe(userData.lastName);
      expect(responseData.data.email).toBe(userData.email);
      
      // Verificar redirección a la lista de usuarios
      await expect(page).toHaveURL(/.*admin\/users.*/);
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      const invalidUserData = {
        firstName: '', // Campo requerido vacío
        lastName: '',
        email: 'invalid-email', // Email inválido
        password: '123' // Contraseña muy corta
      };

      await page.goto('http://localhost:3000/admin/users/create');
      
      // Llenar el formulario con datos inválidos
      await page.fill('input[name="firstName"]', invalidUserData.firstName);
      await page.fill('input[name="lastName"]', invalidUserData.lastName);
      await page.fill('input[name="email"]', invalidUserData.email);
      await page.fill('input[name="password"]', invalidUserData.password);
      
      // Enviar el formulario
      await page.click('button[type="submit"]');
      
      // Verificar que se muestran errores de validación
      await expect(page.locator('text=El nombre es requerido')).toBeVisible();
      await expect(page.locator('text=El apellido es requerido')).toBeVisible();
      await expect(page.locator('text=Email inválido')).toBeVisible();
      await expect(page.locator('text=La contraseña debe tener al menos 6 caracteres')).toBeVisible();
    });

    test('should handle duplicate email error', async ({ page }) => {
      const userData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'admin@airbnb.com', // Email existente
        password: 'SecurePass123'
      };

      await page.goto('http://localhost:3000/admin/users/create');
      
      await page.fill('input[name="firstName"]', userData.firstName);
      await page.fill('input[name="lastName"]', userData.lastName);
      await page.fill('input[name="email"]', userData.email);
      await page.fill('input[name="password"]', userData.password);
      
      // Interceptar y simular error de email duplicado
      await page.route('**/api/users', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'El email ya está registrado'
          })
        });
      });
      
      await page.click('button[type="submit"]');
      
      // Verificar que se muestra mensaje de error
      await expect(page.locator('text=El email ya está registrado')).toBeVisible();
    });
  });

  test.describe('PUT /api/users/:id - Update User', () => {
    
    test('should update user with valid data', async ({ page }) => {
      const userId = 'user-123';
      const updateData = {
        firstName: 'Juan Carlos',
        lastName: 'Pérez García',
        phone: '+1234567890',
        address: {
          street: '456 New St',
          city: 'Barcelona',
          state: 'Barcelona',
          country: 'España',
          zipCode: '08001'
        }
      };

      await page.goto(`http://localhost:3000/admin/users/${userId}/edit`);
      
      // Llenar el formulario de edición
      await page.fill('input[name="firstName"]', updateData.firstName);
      await page.fill('input[name="lastName"]', updateData.lastName);
      await page.fill('input[name="phone"]', updateData.phone);
      
      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes(`/api/users/${userId}`) && 
        response.request().method() === 'PUT'
      );
      
      // Enviar el formulario
      await page.click('button[type="submit"]');
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es exitosa
      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.data.firstName).toBe(updateData.firstName);
      expect(responseData.data.lastName).toBe(updateData.lastName);
      
      // Verificar redirección a la página de detalle
      await expect(page).toHaveURL(new RegExp(`.*admin/users/${userId}.*`));
    });

    test('should handle update with invalid data', async ({ page }) => {
      const userId = 'user-123';
      
      await page.goto(`http://localhost:3000/admin/users/${userId}/edit`);
      
      // Limpiar campos requeridos
      await page.fill('input[name="firstName"]', '');
      await page.fill('input[name="lastName"]', '');
      
      await page.click('button[type="submit"]');
      
      // Verificar que se muestran errores de validación
      await expect(page.locator('text=El nombre es requerido')).toBeVisible();
      await expect(page.locator('text=El apellido es requerido')).toBeVisible();
    });
  });

  test.describe('DELETE /api/users/:id - Delete User', () => {
    
    test('should delete user successfully', async ({ page }) => {
      const userId = 'user-123';
      
      await page.goto(`http://localhost:3000/admin/users/${userId}`);
      
      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes(`/api/users/${userId}`) && 
        response.request().method() === 'DELETE'
      );
      
      // Hacer clic en el botón de eliminar
      await page.click('[data-testid="delete-user-button"]');
      
      // Confirmar la eliminación en el modal
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es exitosa
      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      
      // Verificar redirección a la lista de usuarios
      await expect(page).toHaveURL(/.*admin\/users.*/);
      
      // Verificar que se muestra mensaje de éxito
      await expect(page.locator('text=Usuario eliminado exitosamente')).toBeVisible();
    });

    test('should handle delete error', async ({ page }) => {
      const userId = 'user-123';
      
      // Interceptar y simular error al eliminar
      await page.route(`**/api/users/${userId}`, route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'No se puede eliminar el usuario'
          })
        });
      });

      await page.goto(`http://localhost:3000/admin/users/${userId}`);
      
      await page.click('[data-testid="delete-user-button"]');
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Verificar que se muestra mensaje de error
      await expect(page.locator('text=No se puede eliminar el usuario')).toBeVisible();
    });
  });

  test.describe('GET /api/users/search - Search Users', () => {
    
    test('should search users by name', async ({ page }) => {
      const searchTerm = 'Juan';
      
      await page.goto('http://localhost:3000/admin/users');
      
      // Interceptar la petición de búsqueda
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/users/search') && 
        response.request().method() === 'GET'
      );
      
      // Realizar búsqueda
      await page.fill('input[data-testid="search-input"]', searchTerm);
      await page.click('[data-testid="search-button"]');
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es exitosa
      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('users');
      
      // Verificar que se muestran resultados de búsqueda
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });

    test('should handle empty search results', async ({ page }) => {
      const searchTerm = 'NonExistentUser';
      
      // Interceptar y simular resultados vacíos
      await page.route('**/api/users/search**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              users: [],
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0
            }
          })
        });
      });

      await page.goto('http://localhost:3000/admin/users');
      
      await page.fill('input[data-testid="search-input"]', searchTerm);
      await page.click('[data-testid="search-button"]');
      
      // Verificar que se muestra mensaje de sin resultados
      await expect(page.locator('text=No se encontraron usuarios')).toBeVisible();
    });
  });

  test.describe('GET /api/users/stats - Get User Statistics', () => {
    
    test('should get user statistics', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/users');
      
      // Interceptar la petición de estadísticas
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/users/stats') && 
        response.request().method() === 'GET'
      );
      
      // Hacer clic en el botón de estadísticas
      await page.click('[data-testid="user-stats-button"]');
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es exitosa
      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('totalUsers');
      expect(responseData.data).toHaveProperty('activeUsers');
      expect(responseData.data).toHaveProperty('verifiedUsers');
      
      // Verificar que se muestran las estadísticas
      await expect(page.locator('[data-testid="user-stats-modal"]')).toBeVisible();
    });
  });

  test.describe('PATCH /api/users/:id/status - Toggle User Status', () => {
    
    test('should toggle user status successfully', async ({ page }) => {
      const userId = 'user-123';
      
      await page.goto(`http://localhost:3000/admin/users/${userId}`);
      
      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes(`/api/users/${userId}/status`) && 
        response.request().method() === 'PATCH'
      );
      
      // Hacer clic en el toggle de estado
      await page.click('[data-testid="user-status-toggle"]');
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es exitosa
      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      
      // Verificar que el estado cambió en la UI
      await expect(page.locator('[data-testid="user-status"]')).toHaveText(/Inactivo|Activo/);
    });
  });

  test.describe('PATCH /api/users/:id/verify - Verify User', () => {
    
    test('should verify user successfully', async ({ page }) => {
      const userId = 'user-123';
      
      await page.goto(`http://localhost:3000/admin/users/${userId}`);
      
      // Interceptar la petición API
      const responsePromise = page.waitForResponse(response => 
        response.url().includes(`/api/users/${userId}/verify`) && 
        response.request().method() === 'PATCH'
      );
      
      // Hacer clic en el botón de verificar
      await page.click('[data-testid="verify-user-button"]');
      
      // Esperar la respuesta de la API
      const response = await responsePromise;
      
      // Verificar que la respuesta es exitosa
      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      
      // Verificar que el estado de verificación cambió
      await expect(page.locator('[data-testid="verification-status"]')).toHaveText('Verificado');
    });
  });

  test.describe('Error Handling Testing', () => {
    
    test('should handle network errors gracefully', async ({ page }) => {
      // Interceptar todas las peticiones para simular error de red
      await page.route('**/api/users**', route => {
        route.abort('failed');
      });
      
      await page.goto('http://localhost:3000/admin/users');
      
      // Verificar que se muestra mensaje de error de conexión
      await expect(page.locator('text=Error de conexión')).toBeVisible();
    });

    test('should show loading states during API calls', async ({ page }) => {
      // Interceptar peticiones para simular delay
      await page.route('**/api/users**', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      await page.goto('http://localhost:3000/admin/users');
      
      // Verificar que se muestra estado de carga
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });
  });

  test.describe('Cross-Browser Testing', () => {
    
    test('should work in different browsers', async ({ page, browserName }) => {
      console.log(`Testing users collection in ${browserName}`);
      
      await page.goto('http://localhost:3000/admin/users');
      
      // Verificar que la página carga correctamente
      await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
      
      // Verificar que se pueden realizar acciones básicas
      await expect(page.locator('[data-testid="create-user-button"]')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    
    test('should work on mobile devices', async ({ page }) => {
      // Simular dispositivo móvil
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('http://localhost:3000/admin/users');
      
      // Verificar que la lista de usuarios es responsive
      await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
      
      // Verificar que los botones son accesibles en móvil
      await expect(page.locator('[data-testid="create-user-button"]')).toBeVisible();
    });
  });
});
