import { test, expect } from './fixtures';

test.describe('Cart Flow', () => {
  
  test('should add product to cart when logged in', async ({ authenticatedPage }) => {
    // Ya estás logueado, página en homepage
    
    await test.step('Add product to cart', async () => {
      await authenticatedPage.locator('//*[@data-testid="product-card-1"]/a').click();
      await authenticatedPage.waitForURL("product.html?id=1");
      await authenticatedPage.locator('//button[@data-testid="add-to-cart-btn"]').click();
    });
    
    await test.step('Verify cart has item', async () => {
      await authenticatedPage.goto('/cart.html');
      const cartItems = authenticatedPage.locator('[class="cart-item"]');
      await expect(cartItems).toHaveCount(1);
    });
  });
  
});