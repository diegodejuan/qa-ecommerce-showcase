import { test, expect } from './fixtures';

test.describe('Cart Management', () => {

  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/index.html');
  });

  test('should add multiple products to cart', async ({ authenticatedPage }) => {
    await test.step('Add first product', async () => {
      await authenticatedPage.goto('/product.html?id=1');
      await authenticatedPage.click('[data-testid="add-to-cart-btn"]');
    });

    await test.step('Add second product', async () => {
      await authenticatedPage.goto('/product.html?id=4');
      await authenticatedPage.click('[data-testid="add-to-cart-btn"]');
    });

    await test.step('Verify cart count in header', async () => {
      const cartCount = authenticatedPage.locator('[data-testid="cart-count"]');
      await expect(cartCount).toBeVisible();
      await expect(cartCount).toHaveText('2');
    });

    await test.step('Verify items in cart page', async () => {
      await authenticatedPage.goto('/cart.html');
      await expect(authenticatedPage.locator('[data-testid="cart-item-1"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="cart-item-4"]')).toBeVisible();
    });
  });

  test('should modify product quantities', async ({ authenticatedPage }) => {
    await test.step('Add product and go to cart', async () => {
      await authenticatedPage.goto('/product.html?id=1');
      await authenticatedPage.click('[data-testid="add-to-cart-btn"]');
      await authenticatedPage.goto('/cart.html');
    });

    await test.step('Increase quantity', async () => {
      await authenticatedPage.click('[data-testid="increase-qty-1"]');
      await expect(authenticatedPage.locator('[data-testid="cart-item-qty-1"]')).toHaveText('2');
      await expect(authenticatedPage.locator('[data-testid="cart-count"]')).toHaveText('2');
    });

    await test.step('Decrease quantity', async () => {
      await authenticatedPage.click('[data-testid="decrease-qty-1"]');
      await expect(authenticatedPage.locator('[data-testid="cart-item-qty-1"]')).toHaveText('1');
      await expect(authenticatedPage.locator('[data-testid="cart-count"]')).toHaveText('1');
    });
  });

  test('should remove product from cart', async ({ authenticatedPage }) => {
    await test.step('Add product and go to cart', async () => {
      await authenticatedPage.goto('/product.html?id=1');
      await authenticatedPage.click('[data-testid="add-to-cart-btn"]');
      await authenticatedPage.goto('/cart.html');
    });

    await test.step('Remove product', async () => {
      await authenticatedPage.click('[data-testid="remove-item-1"]');
      await expect(authenticatedPage.locator('[data-testid="cart-item-1"]')).not.toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="cart-empty"]')).toBeVisible();
    });
  });

  test('should calculate totals correctly', async ({ authenticatedPage }) => {
    // Prices from products.json: 
    // ID 1: 1299.99
    // ID 8: 49.99

    await test.step('Add products with known prices', async () => {
      await authenticatedPage.goto('/product.html?id=1');
      await authenticatedPage.click('[data-testid="add-to-cart-btn"]');
      await authenticatedPage.goto('/product.html?id=8');
      await authenticatedPage.click('[data-testid="add-to-cart-btn"]');
      await authenticatedPage.goto('/cart.html');
    });

    await test.step('Verify subtotal and total', async () => {
      const subtotal = 1299.99 + 49.99; // 1349.98
      const shipping = 0; // Subtotal > 100
      const tax = subtotal * 0.21; // 283.4958 -> 283.50
      const total = subtotal + shipping + tax; // 1633.48

      await expect(authenticatedPage.locator('[data-testid="cart-subtotal"]')).toContainText('1349.98');
      await expect(authenticatedPage.locator('[data-testid="cart-shipping"]')).toHaveText('Gratis');
      await expect(authenticatedPage.locator('[data-testid="cart-total"]')).toContainText(total.toFixed(2));
    });
  });
});