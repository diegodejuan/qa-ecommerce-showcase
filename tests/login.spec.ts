import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {

    test('should login successfully with valid credentials', async ({ page }) => {

        await test.step('Navigate to login page', async () => {
            await page.goto('/login.html');
        });

        await test.step('Fill login credentials', async () => {
            await page.fill('[data-testid="login-email"]', 'test@test.com');
            await page.fill('[data-testid="login-password"]', 'test123');
        });

        await test.step('Submit form', async () => {
            await page.click('[data-testid="login-submit"]');
        });

        await test.step('Verify successful login', async () => {
            await page.waitForURL('/index.html');
            await expect(page.locator('[data-testid="auth-link"]')).toBeVisible();
        });

    });

});