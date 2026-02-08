import { test as base, Page } from '@playwright/test';

type Fixtures = {
    authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
    authenticatedPage: async ({ page }, use) => {
        // Setup: Login
        await page.goto('/login.html');
        await page.fill('[data-testid="login-email"]', 'test@test.com');
        await page.fill('[data-testid="login-password"]', 'test123');
        await page.click('[data-testid="login-submit"]');
        await page.waitForURL('/index.html');

        // Usar la página ya logueada
        await use(page);

        // Teardown (si necesario)
        // await page.close();
    },
});

export { expect } from '@playwright/test';