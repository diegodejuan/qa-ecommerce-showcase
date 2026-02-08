import { test, expect } from './fixtures';

test.describe('Checkout Flow', () => {

    test('should complete a full purchase flow', async ({ authenticatedPage }) => {
        const productId = 1;

        await test.step('Add product to cart', async () => {
            await authenticatedPage.goto(`/product.html?id=${productId}`);
            await authenticatedPage.click('[data-testid="add-to-cart-btn"]');
            // Wait for toast notification for feedback
            await expect(authenticatedPage.locator('[data-testid="toast-notification"]')).toBeVisible();
            await expect(authenticatedPage.locator('[data-testid="toast-notification"]')).toContainText('agregado al carrito');
        });

        await test.step('Go to cart and proceed to checkout', async () => {
            await authenticatedPage.goto('/cart.html');
            await expect(authenticatedPage.locator(`[data-testid="cart-item-${productId}"]`)).toBeVisible();
            await authenticatedPage.click('[data-testid="checkout-btn"]');
            await expect(authenticatedPage).toHaveURL(/\/checkout.html/);
        });

        await test.step('Verify user data is pre-filled', async () => {
            // Since we are using authenticatedPage, name and email should be pre-filled
            const name = await authenticatedPage.inputValue('[data-testid="checkout-name"]');
            const email = await authenticatedPage.inputValue('[data-testid="checkout-email"]');
            expect(name).not.toBe('');
            expect(email).not.toBe('');
        });

        await test.step('Fill shipping and payment details', async () => {
            await authenticatedPage.fill('[data-testid="checkout-address"]', 'Calle Falsa 123');
            await authenticatedPage.fill('[data-testid="checkout-city"]', 'Madrid');
            await authenticatedPage.fill('[data-testid="checkout-zip"]', '28001');
            await authenticatedPage.fill('[data-testid="checkout-card-number"]', '1234 5678 9012 3456');
            await authenticatedPage.fill('[data-testid="checkout-card-expiry"]', '12/26');
            await authenticatedPage.fill('[data-testid="checkout-card-cvc"]', '123');
        });

        await test.step('Confirm order and verify success', async () => {
            await authenticatedPage.click('[data-testid="place-order-btn"]');

            await expect(authenticatedPage.locator('[data-testid="checkout-success"]')).toBeVisible();
            await expect(authenticatedPage.locator('[data-testid="success-title"]')).toHaveText('Pedido confirmado!');

            const orderId = await authenticatedPage.textContent('[data-testid="order-id"]');
            expect(orderId).toMatch(/^TH-[A-Z0-9]+$/);
        });
    });

    test('should show validation errors in checkout form', async ({ authenticatedPage }) => {
        await test.step('Navigate to checkout with items', async () => {
            // Add something to cart first
            await authenticatedPage.goto('/product.html?id=1');
            await authenticatedPage.click('[data-testid="add-to-cart-btn"]');
            await authenticatedPage.goto('/checkout.html');
        });

        await test.step('Attempt to submit empty form', async () => {
            // Clear pre-filled fields to force errors
            await authenticatedPage.fill('[data-testid="checkout-name"]', '');
            await authenticatedPage.fill('[data-testid="checkout-email"]', '');

            await authenticatedPage.click('[data-testid="place-order-btn"]');
        });

        await test.step('Verify error messages', async () => {
            // The app uses .form-group--error class to show errors
            const errorGroups = authenticatedPage.locator('.form-group--error');
            await expect(errorGroups).not.toHaveCount(0);
            await expect(authenticatedPage.locator('[data-testid="toast-notification"]')).toBeVisible();
            await expect(authenticatedPage.locator('[data-testid="toast-notification"]')).toContainText('completa todos los campos');
        });
    });
});
