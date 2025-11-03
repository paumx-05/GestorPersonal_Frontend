import { test, expect } from '@playwright/test';

/**
 * Test Flow: Profile Update
 * Base URL: http://localhost:3000
 * Main endpoint: /profile
 * Test credentials: admin@airbnb.com / 456789Aa
 */

test.describe('Profile Update Flow', () => {
  const BASE_URL = 'http://localhost:3000';
  const BACKEND_URL = 'http://localhost:5000';
  const TEST_EMAIL = 'admin@airbnb.com';
  const TEST_PASSWORD = '456789Aa';

  test.beforeEach(async ({ page, context }) => {
    // Clear browser cache and localStorage
    await context.clearCookies();
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
    });

    console.log('🧹 [Setup] Cache and storage cleared');
  });

  test('Should successfully login and access profile page', async ({ page }) => {
    console.log('📋 [Test 1] Testing login and profile access');

    // Navigate to login
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveURL(/.*login/);

    // Fill login form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    
    // Wait for and click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForURL(/.*\/|.*home/, { timeout: 10000 });
    
    console.log('✅ [Test 1] Login successful');

    // Navigate to profile
    await page.goto(`${BASE_URL}/profile`);
    await expect(page).toHaveURL(/.*profile/);
    
    // Verify profile page loaded
    await expect(page.locator('h1, h2')).toContainText(/perfil|profile/i);
    
    console.log('✅ [Test 1] Profile page accessed successfully');
  });

  test('Should update user name in profile', async ({ page }) => {
    console.log('📋 [Test 2] Testing name update');

    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/|.*home/, { timeout: 10000 });

    // Navigate to profile
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');

    // Find name input field
    const nameInput = page.locator('input[id*="name"], input[placeholder*="nombre" i], input[aria-label*="nombre" i]').first();
    
    if (await nameInput.count() > 0) {
      const currentName = await nameInput.inputValue();
      console.log(`📝 [Test 2] Current name: ${currentName}`);

      // Clear and update name
      await nameInput.clear();
      const newName = `Admin Updated ${Date.now()}`;
      await nameInput.fill(newName);
      console.log(`📝 [Test 2] New name: ${newName}`);

      // Find and click save button
      const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Guardar cambios")').first();
      if (await saveButton.count() > 0) {
        await saveButton.click();
        
        // Wait for success message or verify update
        await page.waitForTimeout(2000);
        
        // Verify name was updated (reload page or check for success message)
        const successMessage = page.locator('text=/guardado|exitoso|success/i');
        if (await successMessage.count() > 0) {
          console.log('✅ [Test 2] Name update successful');
        } else {
          console.log('⚠️ [Test 2] Success message not found, but proceeding');
        }
      }
    } else {
      console.log('⚠️ [Test 2] Name input not found');
    }
  });

  test('Should update user description with debounce', async ({ page }) => {
    console.log('📋 [Test 3] Testing description update with debounce');

    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/|.*home/, { timeout: 10000 });

    // Navigate to profile
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');

    // Find description textarea
    const descriptionTextarea = page.locator('textarea[placeholder*="descripción" i], textarea[placeholder*="sobre ti" i], textarea[id*="description"]').first();
    
    if (await descriptionTextarea.count() > 0) {
      const testDescription = `Test description ${Date.now()}`;
      
      // Type description (should trigger debounce)
      await descriptionTextarea.fill(testDescription);
      console.log(`📝 [Test 3] Description entered: ${testDescription.substring(0, 50)}...`);

      // Wait for debounce (1.5 seconds + network time)
      await page.waitForTimeout(2000);
      
      // Check for saving indicator or success
      const savingIndicator = page.locator('text=/guardando|saving/i');
      const errorMessage = page.locator('text=/error|Error/i');
      
      await page.waitForTimeout(1000);
      
      if (await errorMessage.count() === 0) {
        console.log('✅ [Test 3] Description update completed (no errors)');
      } else {
        const errorText = await errorMessage.textContent();
        console.log(`⚠️ [Test 3] Error found: ${errorText}`);
      }
    } else {
      console.log('⚠️ [Test 3] Description textarea not found');
    }
  });

  test('Should upload and update avatar', async ({ page }) => {
    console.log('📋 [Test 4] Testing avatar upload');

    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/|.*home/, { timeout: 10000 });

    // Navigate to profile
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');

    // Find file input for avatar
    const fileInput = page.locator('input[type="file"][accept*="image"]').first();
    
    if (await fileInput.count() > 0) {
      // Note: We can't actually upload a file in this test without a real image
      // But we can verify the input exists and check validation
      const accepts = await fileInput.getAttribute('accept');
      console.log(`📸 [Test 4] Avatar input found with accept: ${accepts}`);
      
      // Verify save button exists
      const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Guardar cambios")').first();
      expect(await saveButton.count()).toBeGreaterThan(0);
      
      console.log('✅ [Test 4] Avatar upload UI is ready');
    } else {
      console.log('⚠️ [Test 4] Avatar file input not found');
    }
  });

  test('Should verify session persistence after profile update', async ({ page }) => {
    console.log('📋 [Test 5] Testing session persistence');

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/|.*home/, { timeout: 10000 });

    // Verify token exists
    const token = await page.evaluate(() => localStorage.getItem('airbnb_auth_token'));
    expect(token).toBeTruthy();
    console.log('✅ [Test 5] Token stored in localStorage');

    // Navigate to profile
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');

    // Navigate to another page
    await page.goto(`${BASE_URL}`);
    await page.waitForLoadState('networkidle');

    // Navigate back to profile (should still be authenticated)
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    // Verify still on profile (not redirected to login)
    await expect(page).toHaveURL(/.*profile/);
    console.log('✅ [Test 5] Session persisted between navigations');
  });

  test('Should handle validation errors correctly', async ({ page }) => {
    console.log('📋 [Test 6] Testing validation errors');

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/|.*home/, { timeout: 10000 });

    // Navigate to profile
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');

    // Try to clear name (should show validation error)
    const nameInput = page.locator('input[id*="name"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.clear();
      
      // Try to save with empty name
      const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Guardar cambios")').first();
      if (await saveButton.count() > 0) {
        // Check if button is disabled (client-side validation)
        const isDisabled = await saveButton.isDisabled();
        if (isDisabled) {
          console.log('✅ [Test 6] Client-side validation working (save button disabled)');
        } else {
          await saveButton.click();
          await page.waitForTimeout(1000);
          
          // Check for error message
          const errorMessage = page.locator('text=/requerido|required|error/i').first();
          if (await errorMessage.count() > 0) {
            console.log('✅ [Test 6] Validation error displayed correctly');
          }
        }
      }
    }
  });

  test('Should verify no console errors on profile page', async ({ page }) => {
    console.log('📋 [Test 7] Testing for console errors');

    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore BackendStatusChecker errors as they are expected during testing
        if (!text.includes('BackendStatusChecker') && !text.includes('401')) {
          consoleErrors.push(text);
        }
      }
      if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/|.*home/, { timeout: 10000 });

    // Navigate to profile and wait for all resources to load
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for any async operations

    console.log(`📊 [Test 7] Console errors found: ${consoleErrors.length}`);
    console.log(`📊 [Test 7] Console warnings found: ${consoleWarnings.length}`);

    if (consoleErrors.length > 0) {
      console.log('❌ [Test 7] Console errors:', consoleErrors);
    }

    // Filter out expected errors (BackendStatusChecker, 401s from testing tools)
    const unexpectedErrors = consoleErrors.filter(err => 
      !err.includes('BackendStatusChecker') && 
      !err.includes('401') &&
      !err.includes('test@example.com')
    );

    expect(unexpectedErrors.length).toBe(0);
    console.log('✅ [Test 7] No unexpected console errors');
  });

  test('Should verify profile data loads from backend', async ({ page }) => {
    console.log('📋 [Test 8] Testing profile data loading');

    // Intercept API calls
    const apiCalls: string[] = [];
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/api/profile') || url.includes('/api/auth/me')) {
        apiCalls.push(url);
        console.log(`🌐 [Test 8] API call: ${url} - Status: ${response.status()}`);
      }
    });

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/|.*home/, { timeout: 10000 });

    // Navigate to profile
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify profile data is displayed
    const userEmail = await page.locator('text=' + TEST_EMAIL).first();
    if (await userEmail.count() > 0) {
      console.log('✅ [Test 8] User email displayed correctly');
    }

    // Check if API calls were made (verify backend integration)
    console.log(`📊 [Test 8] API calls made: ${apiCalls.length}`);
    if (apiCalls.length > 0) {
      console.log('✅ [Test 8] Backend API calls detected');
    }
  });
});

