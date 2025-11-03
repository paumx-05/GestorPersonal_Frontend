import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración específica para pruebas de la colección de usuarios
 * Basado en la regla @playwright-test
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/users-collection-endpoints.spec.ts',
  
  /* Configuración de paralelización */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter para generar reportes detallados */
  reporter: [
    ['html', { outputFolder: 'playwright-report-users-collection' }],
    ['json', { outputFile: 'test-results-users-collection.json' }],
    ['junit', { outputFile: 'test-results-users-collection.xml' }]
  ],
  
  /* Configuración global para todas las pruebas */
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    /* Configuración de timeouts */
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    /* Configuración de headers */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },

  /* Configuración de proyectos para diferentes navegadores */
  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 }
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 }
      },
    },
  ],

  /* Configuración del servidor de desarrollo */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_API_URL: 'http://localhost:5000',
    },
  },

  /* Configuración de expectativas */
  expect: {
    timeout: 10000,
  },

  /* Configuración de timeouts globales */
  timeout: 30000,
  globalTimeout: 600000,

  /* Configuración de output */
  outputDir: 'test-results-users-collection/',
  
  /* Configuración de variables de entorno para pruebas */
  env: {
    TEST_ADMIN_EMAIL: 'admin@airbnb.com',
    TEST_ADMIN_PASSWORD: 'Admin1234!',
    TEST_USER_EMAIL: 'ana1@gmail.com',
    TEST_USER_PASSWORD: '123456789',
    TEST_NEW_USER_EMAIL: 'testuser@example.com',
    TEST_NEW_USER_PASSWORD: 'TestPass123',
  },
});
