import { test, expect } from '@playwright/test';

test.describe('Product Catalog', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/index.html');
    });

    test('should search for products', async ({ page }) => {
        await test.step('Type search query', async () => {
            await page.fill('[data-testid="search-input"]', 'Laptop');
        });

        await test.step('Verify search results', async () => {
            const products = page.locator('[data-testid^="product-card-"]');
            // ProBook, UltraBook, GameStation, AND Auriculares ProSound (mentions Laptop in description)
            await expect(products).toHaveCount(4);
            await expect(page.locator('[data-testid="product-name-1"]')).toContainText('Laptop');
        });
    });

    test('should filter products by category', async ({ page }) => {
        await test.step('Select category filter', async () => {
            await page.selectOption('[data-testid="category-filter"]', 'Smartphones');
        });

        await test.step('Verify category results', async () => {
            const products = page.locator('[data-testid^="product-card-"]');
            await expect(products).toHaveCount(3); // Based on products.json: X200, Lite S10, Mini Z5
            await expect(page.locator('[data-testid="product-category-4"]')).toHaveText('Smartphones');
        });
    });

    test('should view product detail and verify info', async ({ page }) => {
        const productId = 1;
        const productName = 'ProBook Laptop 15';

        await test.step('Click on a product card', async () => {
            await page.click(`[data-testid="product-card-${productId}"] a`);
            await expect(page).toHaveURL(new RegExp(`product.html\\?id=${productId}`));
        });

        await test.step('Verify product details', async () => {
            await expect(page.locator('[data-testid="detail-product-name"]')).toHaveText(productName);
            await expect(page.locator('[data-testid="detail-product-category"]')).toHaveText('Laptops');
            await expect(page.locator('[data-testid="detail-product-price"]')).toContainText('1299.99');
            await expect(page.locator('[data-testid="detail-product-description"]')).toBeVisible();
            await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeEnabled();
        });
    });

    test('should show no results message', async ({ page }) => {
        await test.step('Search for non-existent product', async () => {
            await page.fill('[data-testid="search-input"]', 'NonExistentProductXYZ');
        });

        await test.step('Verify no results message', async () => {
            await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
            await expect(page.locator('[data-testid="no-results"] h2')).toHaveText('No se encontraron productos');
        });
    });
});
