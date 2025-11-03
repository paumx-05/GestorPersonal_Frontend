
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ProfileFlowTest_2025-10-25', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:3000');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-initial-page.png', { fullPage: true } });

    // Click element
    await page.click('a[href="/login"]');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-login-page.png', { fullPage: true } });

    // Fill input field
    await page.fill('input[type="email"]', 'admin@airbnb.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Admin1234!');

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-after-admin-login.png', { fullPage: true } });

    // Click element
    await page.click('a[href="/profile"]');

    // Click element
    await page.click('button[data-testid="user-menu-button"]');

    // Click element
    await page.click('button[id="radix-:r0:"]');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-user-menu-opened.png', { fullPage: true } });

    // Click element
    await page.click('a[href="/profile"]');

    // Click element
    await page.click('button[aria-haspopup="menu"]');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-user-menu-dropdown.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3000/profile');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-admin-profile-page.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text('Cerrar Sesión')');

    // Navigate to URL
    await page.goto('http://localhost:3000/login');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-login-page-normal-user.png', { fullPage: true } });

    // Fill input field
    await page.fill('input[type="email"]', 'ana1@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', '123456789');

    // Navigate to URL
    await page.goto('http://localhost:3000/login');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-login-page-direct.png', { fullPage: true } });

    // Fill input field
    await page.fill('input[type="email"]', 'ana1@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', '123456789');

    // Click element
    await page.click('a[href="/login"]');

    // Click element
    await page.click('a[href="/debug-auth"]');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-debug-auth-page.png', { fullPage: true } });

    // Fill input field
    await page.fill('input[type="email"]', 'ana1@gmail.com');

    // Click element
    await page.click('button:has-text('Logout')');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-after-logout.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3000/login');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-login-page-clean.png', { fullPage: true } });

    // Fill input field
    await page.fill('input[type="email"]', 'ana1@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', '123456789');

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-after-normal-user-login.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3000/profile');

    // Take screenshot
    await page.screenshot({ path: 'profile-test-normal-user-profile.png', { fullPage: true } });
});