import { test, expect } from '@playwright/test';

/**
 * QA Testing - Reset Password Flow Investigation
 * Testing the complete reset password flow to identify database save issues
 */

test.describe('Reset Password Flow - Complete Investigation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear browser cache and localStorage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Step 1: Verify Backend Connectivity', async ({ page }) => {
    console.log('🔍 [QA] Testing backend connectivity...');
    
    // Navigate to forgot password page
    await page.goto('http://localhost:3000/forgot-password');
    
    // Check if page loads correctly
    await expect(page.locator('h1')).toContainText('Recuperar Contraseña');
    
    // Test backend connection
    const response = await page.request.get('http://localhost:5000/api/auth/forgot-password');
    console.log('📡 [QA] Backend response status:', response.status());
    
    if (response.status() !== 200) {
      console.log('❌ [QA] Backend not accessible - Status:', response.status());
    } else {
      console.log('✅ [QA] Backend is accessible');
    }
  });

  test('Step 2: Test Forgot Password Flow', async ({ page }) => {
    console.log('🔍 [QA] Testing forgot password flow...');
    
    await page.goto('http://localhost:3000/forgot-password');
    
    // Fill email
    await page.fill('input[name="email"]', 'ana1@gmail.com');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Check for success message
    const successMessage = page.locator('text=Email enviado');
    if (await successMessage.isVisible()) {
      console.log('✅ [QA] Forgot password email sent successfully');
    } else {
      console.log('❌ [QA] Forgot password failed');
    }
  });

  test('Step 3: Test Reset Password with Valid Token', async ({ page }) => {
    console.log('🔍 [QA] Testing reset password with valid token...');
    
    // First, get a valid token by going through forgot password
    await page.goto('http://localhost:3000/forgot-password');
    await page.fill('input[name="email"]', 'ana1@gmail.com');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Navigate to reset password page with a test token
    // Note: In real scenario, user would get this token via email
    const testToken = 'reset_test_token_123';
    await page.goto(`http://localhost:3000/reset-password/${testToken}`);
    
    // Check if page loads
    await expect(page.locator('h1')).toContainText('Restablecer Contraseña');
    
    // Fill new password
    await page.fill('input[name="newPassword"]', 'nueva_password_123');
    await page.fill('input[name="confirmPassword"]', 'nueva_password_123');
    
    // Monitor network requests
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/reset-password') && 
      response.request().method() === 'POST'
    );
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for response
    const response = await responsePromise;
    const responseData = await response.json();
    
    console.log('📡 [QA] Reset password response status:', response.status());
    console.log('📡 [QA] Reset password response data:', responseData);
    
    // Check response
    if (response.status() === 200 && responseData.success) {
      console.log('✅ [QA] Password reset successful');
    } else {
      console.log('❌ [QA] Password reset failed:', responseData.message);
    }
  });

  test('Step 4: Test Backend Endpoint Directly', async ({ page }) => {
    console.log('🔍 [QA] Testing backend endpoint directly...');
    
    // Test the backend endpoint directly
    const response = await page.request.post('http://localhost:5000/api/auth/reset-password', {
      data: {
        token: 'reset_test_token_123',
        newPassword: 'nueva_password_123'
      }
    });
    
    console.log('📡 [QA] Direct backend response status:', response.status());
    
    if (response.status() === 404) {
      console.log('❌ [QA] CRITICAL: Backend endpoint /api/auth/reset-password does not exist');
    } else if (response.status() === 500) {
      console.log('❌ [QA] CRITICAL: Backend endpoint exists but has server error');
    } else {
      console.log('✅ [QA] Backend endpoint exists and responds');
    }
    
    const responseData = await response.json();
    console.log('📡 [QA] Direct backend response data:', responseData);
  });

  test('Step 5: Test Database Save Issue', async ({ page }) => {
    console.log('🔍 [QA] Testing database save issue...');
    
    // Navigate to reset password page
    await page.goto('http://localhost:3000/reset-password/reset_test_token_123');
    
    // Fill form
    await page.fill('input[name="newPassword"]', 'nueva_password_123');
    await page.fill('input[name="confirmPassword"]', 'nueva_password_123');
    
    // Monitor console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for processing
    await page.waitForTimeout(3000);
    
    // Check console logs for errors
    console.log('📋 [QA] Console logs during reset:');
    consoleLogs.forEach(log => {
      console.log(log);
      if (log.includes('Error') || log.includes('error')) {
        console.log('❌ [QA] Error found in console:', log);
      }
    });
    
    // Check for error messages on page
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.log('❌ [QA] Error message displayed:', errorText);
    }
  });

  test('Step 6: Verify Password Actually Changed', async ({ page }) => {
    console.log('🔍 [QA] Verifying password actually changed...');
    
    // Try to login with old password
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'ana1@gmail.com');
    await page.fill('input[name="password"]', '123456789'); // Old password
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Check if login failed (which would indicate password changed)
    const errorMessage = page.locator('text=Credenciales inválidas');
    if (await errorMessage.isVisible()) {
      console.log('✅ [QA] Old password no longer works - password was changed');
    } else {
      console.log('❌ [QA] Old password still works - password was NOT changed');
    }
    
    // Try to login with new password
    await page.fill('input[name="password"]', 'nueva_password_123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Check if login succeeded
    const successIndicator = page.locator('text=Dashboard') || page.locator('[data-testid="user-menu"]');
    if (await successIndicator.isVisible()) {
      console.log('✅ [QA] New password works - password was successfully changed');
    } else {
      console.log('❌ [QA] New password does not work - password change failed');
    }
  });

  test('Step 7: Network Analysis', async ({ page }) => {
    console.log('🔍 [QA] Analyzing network requests...');
    
    // Start network monitoring
    const requests: any[] = [];
    const responses: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('reset-password')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('reset-password')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
      }
    });
    
    // Perform reset password flow
    await page.goto('http://localhost:3000/reset-password/reset_test_token_123');
    await page.fill('input[name="newPassword"]', 'nueva_password_123');
    await page.fill('input[name="confirmPassword"]', 'nueva_password_123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    // Analyze requests and responses
    console.log('📡 [QA] Network Analysis:');
    console.log('Requests:', requests);
    console.log('Responses:', responses);
    
    // Check for specific issues
    responses.forEach(response => {
      if (response.status === 404) {
        console.log('❌ [QA] CRITICAL: 404 error - endpoint not found');
      } else if (response.status === 500) {
        console.log('❌ [QA] CRITICAL: 500 error - server error');
      } else if (response.status >= 400) {
        console.log('❌ [QA] Error status:', response.status);
      }
    });
  });
});
