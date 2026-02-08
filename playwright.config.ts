import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para qa-ecommerce-showcase
 * 
 * Decisiones de configuración:
 * - Baseurl: localhost:3000 (app e-commerce local)
 * - Browsers: Chromium, Firefox, WebKit (cross-browser completo)
 * - Screenshots/videos: Solo on failure (debugging)
 * - Retries: 0 en local, 2 en CI (tests flaky detection)
 */

export default defineConfig({
  // Carpeta donde están los tests
  testDir: './tests',

  // Timeout por test (30 segundos)
  timeout: 30 * 1000,

  // Tests en paralelo (full parallelization)
  fullyParallel: true,

  // Fallar build si quedan tests con .only
  forbidOnly: !!process.env.CI,

  // Reintentos en caso de fallo
  retries: process.env.CI ? 2 : 0,

  // Workers (tests en paralelo)
  // En CI: 1 worker, en local: según CPU
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html'], // HTML report interactivo
    ['list'], // Output en consola
  ],

  // Configuración compartida para todos los tests
  use: {
    // Base URL de la app (cambiaremos cuando tengamos la app en Hostinger)
    baseURL: 'https://olive-jackal-150841.hostingersite.com/index.html',

    // Trace solo on failure (debugging visual)
    trace: 'on-first-retry',

    // Screenshots solo en failures
    screenshot: 'only-on-failure',

    // Videos solo en failures
    video: 'retain-on-failure',
  },

  // Configuración de proyectos (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile (comentado por ahora, lo activaremos después)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Servidor local (cuando tengamos la app local, lo descomentamos)
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});