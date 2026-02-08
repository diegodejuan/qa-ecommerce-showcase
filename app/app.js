/* ========================================
   TechHub E-Commerce - Application Logic
   ======================================== */

// --- State Management ---
const Store = {
  getCart() {
    return JSON.parse(localStorage.getItem('techhub_cart') || '[]');
  },

  saveCart(cart) {
    localStorage.setItem('techhub_cart', JSON.stringify(cart));
    this.updateCartCount();
  },

  addToCart(product, quantity = 1) {
    const cart = this.getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: Math.min(quantity, product.stock),
        stock: product.stock
      });
    }

    this.saveCart(cart);
    Toast.show(`${product.name} agregado al carrito`, 'success');
  },

  removeFromCart(productId) {
    const cart = this.getCart().filter(item => item.id !== productId);
    this.saveCart(cart);
  },

  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, Math.min(quantity, item.stock));
      this.saveCart(cart);
    }
  },

  clearCart() {
    localStorage.removeItem('techhub_cart');
    this.updateCartCount();
  },

  getCartTotal() {
    return this.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getCartCount() {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  updateCartCount() {
    const countElements = document.querySelectorAll('[data-testid="cart-count"]');
    const count = this.getCartCount();
    countElements.forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  },

  // Auth
  getUser() {
    return JSON.parse(localStorage.getItem('techhub_user') || 'null');
  },

  login(email, name) {
    const user = { email, name, loggedInAt: new Date().toISOString() };
    localStorage.setItem('techhub_user', JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem('techhub_user');
  },

  isLoggedIn() {
    return this.getUser() !== null;
  }
};

// --- Toast Notifications ---
const Toast = {
  show(message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('data-testid', 'toast-notification');
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    // Auto-hide
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// --- Product Loading ---
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('Error cargando productos');
    return await response.json();
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

// --- Navigation ---
function initNavigation() {
  const menuBtn = document.querySelector('[data-testid="menu-toggle"]');
  const nav = document.querySelector('[data-testid="main-nav"]');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('header__nav--open');
      const isOpen = nav.classList.contains('header__nav--open');
      menuBtn.setAttribute('aria-expanded', isOpen);
    });
  }

  // Update auth link
  updateAuthLink();

  // Update cart count on every page
  Store.updateCartCount();
}

function updateAuthLink() {
  const authLink = document.querySelector('[data-testid="auth-link"]');
  if (!authLink) return;

  if (Store.isLoggedIn()) {
    const user = Store.getUser();
    authLink.textContent = user.name || user.email;
    authLink.href = '#';
    authLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Cerrar sesion?')) {
        Store.logout();
        window.location.reload();
      }
    });
  } else {
    authLink.textContent = 'Login';
    authLink.href = 'login.html';
  }
}

// --- Homepage ---
async function initHomepage() {
  const grid = document.querySelector('[data-testid="products-grid"]');
  const searchInput = document.querySelector('[data-testid="search-input"]');
  const categoryFilter = document.querySelector('[data-testid="category-filter"]');
  const priceFilter = document.querySelector('[data-testid="price-filter"]');
  const loadingEl = document.querySelector('[data-testid="loading"]');

  if (!grid) return;

  const products = await loadProducts();

  if (loadingEl) loadingEl.style.display = 'none';

  function renderProducts(filteredProducts) {
    if (filteredProducts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" data-testid="no-results" style="grid-column: 1 / -1;">
          <div class="empty-state__icon">&#128269;</div>
          <h2 class="empty-state__title">No se encontraron productos</h2>
          <p class="empty-state__text">Intenta con otros filtros de busqueda</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filteredProducts.map(product => {
      let stockClass = '';
      let stockText = `En stock (${product.stock})`;

      if (product.stock === 0) {
        stockClass = 'product-card__stock--out';
        stockText = 'Sin stock';
      } else if (product.stock <= 10) {
        stockClass = 'product-card__stock--low';
        stockText = `Quedan ${product.stock}`;
      }

      return `
        <article class="product-card" data-testid="product-card-${product.id}" data-product-id="${product.id}">
          <a href="product.html?id=${product.id}">
            <img class="product-card__image" src="${product.image}" alt="${product.name}" data-testid="product-image-${product.id}">
          </a>
          <div class="product-card__body">
            <span class="product-card__category" data-testid="product-category-${product.id}">${product.category}</span>
            <a href="product.html?id=${product.id}">
              <h3 class="product-card__name" data-testid="product-name-${product.id}">${product.name}</h3>
            </a>
            <p class="product-card__description" data-testid="product-description-${product.id}">${product.description}</p>
            <div class="product-card__footer">
              <span class="product-card__price" data-testid="product-price-${product.id}">${product.price.toFixed(2)} &euro;</span>
              <span class="product-card__stock ${stockClass}" data-testid="product-stock-${product.id}">${stockText}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function filterProducts() {
    const search = (searchInput?.value || '').toLowerCase().trim();
    const category = categoryFilter?.value || 'all';
    const priceRange = priceFilter?.value || 'all';

    let filtered = products;

    // Search filter
    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    // Price filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(p => {
        if (max) return p.price >= min && p.price <= max;
        return p.price >= min;
      });
    }

    renderProducts(filtered);
  }

  // Event listeners
  searchInput?.addEventListener('input', filterProducts);
  categoryFilter?.addEventListener('change', filterProducts);
  priceFilter?.addEventListener('change', filterProducts);

  // Initial render
  filterProducts();
}

// --- Product Detail ---
async function initProductDetail() {
  const container = document.querySelector('[data-testid="product-detail"]');
  const loadingEl = document.querySelector('[data-testid="loading"]');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));

  if (!productId) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">&#128533;</div>
        <h2 class="empty-state__title">Producto no encontrado</h2>
        <p class="empty-state__text">El producto que buscas no existe</p>
        <a href="index.html" class="btn btn--primary">Volver a la tienda</a>
      </div>
    `;
    if (loadingEl) loadingEl.style.display = 'none';
    return;
  }

  const products = await loadProducts();
  const product = products.find(p => p.id === productId);

  if (loadingEl) loadingEl.style.display = 'none';

  if (!product) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">&#128533;</div>
        <h2 class="empty-state__title">Producto no encontrado</h2>
        <p class="empty-state__text">El producto con ID ${productId} no existe</p>
        <a href="index.html" class="btn btn--primary">Volver a la tienda</a>
      </div>
    `;
    return;
  }

  // Update page title
  document.title = `${product.name} - TechHub`;

  let stockClass = '';
  let stockText = `En stock (${product.stock} disponibles)`;
  const isAvailable = product.stock > 0;

  if (product.stock === 0) {
    stockClass = 'product-card__stock--out';
    stockText = 'Sin stock';
  } else if (product.stock <= 10) {
    stockClass = 'product-card__stock--low';
    stockText = `Solo quedan ${product.stock} unidades`;
  }

  container.innerHTML = `
    <img class="product-detail__image" src="${product.image}" alt="${product.name}" data-testid="detail-product-image">
    <div class="product-detail__info">
      <span class="product-detail__category" data-testid="detail-product-category">${product.category}</span>
      <h1 class="product-detail__name" data-testid="detail-product-name">${product.name}</h1>
      <span class="product-detail__price" data-testid="detail-product-price">${product.price.toFixed(2)} &euro;</span>
      <p class="product-detail__description" data-testid="detail-product-description">${product.description}</p>
      <p class="product-detail__stock ${stockClass}" data-testid="detail-product-stock">${stockText}</p>
      <div class="product-detail__quantity">
        <label for="quantity">Cantidad:</label>
        <input type="number" id="quantity" name="quantity" value="1" min="1" max="${product.stock}"
               data-testid="quantity-input" ${!isAvailable ? 'disabled' : ''}>
      </div>
      <div class="product-detail__actions">
        <button class="btn btn--primary btn--full" data-testid="add-to-cart-btn" ${!isAvailable ? 'disabled' : ''}>
          &#128722; Agregar al carrito
        </button>
      </div>
    </div>
  `;

  // Add to cart handler
  const addBtn = container.querySelector('[data-testid="add-to-cart-btn"]');
  const quantityInput = container.querySelector('[data-testid="quantity-input"]');

  addBtn?.addEventListener('click', () => {
    const quantity = parseInt(quantityInput.value) || 1;
    Store.addToCart(product, quantity);
  });
}

// --- Cart Page ---
function initCart() {
  const cartContainer = document.querySelector('[data-testid="cart-items"]');
  const summaryContainer = document.querySelector('[data-testid="cart-summary"]');
  const emptyState = document.querySelector('[data-testid="cart-empty"]');
  const cartContent = document.querySelector('[data-testid="cart-content"]');

  if (!cartContainer) return;

  function renderCart() {
    const cart = Store.getCart();

    if (cart.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (cartContent) cartContent.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';

    // Render items
    cartContainer.innerHTML = cart.map(item => `
      <div class="cart-item" data-testid="cart-item-${item.id}" data-product-id="${item.id}">
        <img class="cart-item__image" src="${item.image}" alt="${item.name}">
        <div class="cart-item__info">
          <span class="cart-item__name" data-testid="cart-item-name-${item.id}">${item.name}</span>
          <span class="cart-item__price" data-testid="cart-item-price-${item.id}">${item.price.toFixed(2)} &euro;</span>
        </div>
        <div class="cart-item__actions">
          <div class="cart-item__quantity">
            <button class="cart-item__quantity-btn" data-testid="decrease-qty-${item.id}" data-action="decrease" data-id="${item.id}" aria-label="Disminuir cantidad">-</button>
            <span class="cart-item__quantity-value" data-testid="cart-item-qty-${item.id}">${item.quantity}</span>
            <button class="cart-item__quantity-btn" data-testid="increase-qty-${item.id}" data-action="increase" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
          </div>
          <button class="cart-item__remove" data-testid="remove-item-${item.id}" data-action="remove" data-id="${item.id}" aria-label="Eliminar ${item.name}">&#10005;</button>
        </div>
      </div>
    `).join('');

    // Render summary
    const subtotal = Store.getCartTotal();
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.21;
    const total = subtotal + shipping + tax;

    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <h3 class="cart-summary__title">Resumen del pedido</h3>
        <div class="cart-summary__row">
          <span>Subtotal</span>
          <span data-testid="cart-subtotal">${subtotal.toFixed(2)} &euro;</span>
        </div>
        <div class="cart-summary__row">
          <span>Envio</span>
          <span data-testid="cart-shipping">${shipping === 0 ? 'Gratis' : shipping.toFixed(2) + ' \u20ac'}</span>
        </div>
        <div class="cart-summary__row">
          <span>IVA (21%)</span>
          <span data-testid="cart-tax">${tax.toFixed(2)} &euro;</span>
        </div>
        <div class="cart-summary__row cart-summary__row--total">
          <span>Total</span>
          <span data-testid="cart-total">${total.toFixed(2)} &euro;</span>
        </div>
        <a href="checkout.html" class="btn btn--primary btn--full" data-testid="checkout-btn" style="margin-top: 1.5rem;">
          Proceder al pago
        </a>
        <button class="btn btn--secondary btn--full" data-testid="clear-cart-btn" style="margin-top: 0.5rem;">
          Vaciar carrito
        </button>
      `;
    }

    // Event delegation for cart actions
    cartContainer.addEventListener('click', handleCartAction);
    summaryContainer?.querySelector('[data-testid="clear-cart-btn"]')?.addEventListener('click', () => {
      if (confirm('Estas seguro de vaciar el carrito?')) {
        Store.clearCart();
        renderCart();
      }
    });
  }

  function handleCartAction(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id);
    const cart = Store.getCart();
    const item = cart.find(i => i.id === id);

    if (!item) return;

    switch (action) {
      case 'increase':
        Store.updateQuantity(id, item.quantity + 1);
        break;
      case 'decrease':
        if (item.quantity <= 1) {
          Store.removeFromCart(id);
        } else {
          Store.updateQuantity(id, item.quantity - 1);
        }
        break;
      case 'remove':
        Store.removeFromCart(id);
        Toast.show('Producto eliminado del carrito', 'success');
        break;
    }

    renderCart();
  }

  renderCart();
}

// --- Login Page ---
function initLogin() {
  const loginForm = document.querySelector('[data-testid="login-form"]');
  const registerForm = document.querySelector('[data-testid="register-form"]');
  const loginTab = document.querySelector('[data-testid="login-tab"]');
  const registerTab = document.querySelector('[data-testid="register-tab"]');

  if (!loginForm) return;

  // Redirect if already logged in
  if (Store.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  // Tab switching
  loginTab?.addEventListener('click', () => {
    loginTab.classList.add('form-tabs__tab--active');
    registerTab?.classList.remove('form-tabs__tab--active');
    loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
  });

  registerTab?.addEventListener('click', () => {
    registerTab.classList.add('form-tabs__tab--active');
    loginTab?.classList.remove('form-tabs__tab--active');
    if (registerForm) registerForm.style.display = 'block';
    loginForm.style.display = 'none';
  });

  // Login form handler
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('[data-testid="login-email"]')?.value;
    const password = loginForm.querySelector('[data-testid="login-password"]')?.value;

    // Reset errors
    loginForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('form-group--error'));

    let hasError = false;

    if (!email || !email.includes('@')) {
      loginForm.querySelector('[data-testid="login-email"]')?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }

    if (!password || password.length < 3) {
      loginForm.querySelector('[data-testid="login-password"]')?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }

    if (hasError) return;

    // Fake login - always succeeds
    const name = email.split('@')[0];
    Store.login(email, name);
    Toast.show('Bienvenido, ' + name + '!', 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  });

  // Register form handler
  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = registerForm.querySelector('[data-testid="register-name"]')?.value;
    const email = registerForm.querySelector('[data-testid="register-email"]')?.value;
    const password = registerForm.querySelector('[data-testid="register-password"]')?.value;

    // Reset errors
    registerForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('form-group--error'));

    let hasError = false;

    if (!name || name.length < 2) {
      registerForm.querySelector('[data-testid="register-name"]')?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }

    if (!email || !email.includes('@')) {
      registerForm.querySelector('[data-testid="register-email"]')?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }

    if (!password || password.length < 6) {
      registerForm.querySelector('[data-testid="register-password"]')?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }

    if (hasError) return;

    // Fake register
    Store.login(email, name);
    Toast.show('Cuenta creada! Bienvenido, ' + name, 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  });
}

// --- Checkout Page ---
function initCheckout() {
  const checkoutForm = document.querySelector('[data-testid="checkout-form"]');
  const orderSummary = document.querySelector('[data-testid="order-summary"]');
  const checkoutContent = document.querySelector('[data-testid="checkout-content"]');
  const successMessage = document.querySelector('[data-testid="checkout-success"]');

  if (!checkoutForm) return;

  const cart = Store.getCart();

  // Redirect if cart is empty
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  // Pre-fill if logged in
  const user = Store.getUser();
  if (user) {
    const emailInput = checkoutForm.querySelector('[data-testid="checkout-email"]');
    const nameInput = checkoutForm.querySelector('[data-testid="checkout-name"]');
    if (emailInput) emailInput.value = user.email;
    if (nameInput) nameInput.value = user.name;
  }

  // Render order summary
  if (orderSummary) {
    const subtotal = Store.getCartTotal();
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.21;
    const total = subtotal + shipping + tax;

    orderSummary.innerHTML = `
      <h3 class="order-summary__title">Tu pedido</h3>
      ${cart.map(item => `
        <div class="order-summary__item" data-testid="summary-item-${item.id}">
          <span class="order-summary__item-name">${item.name}</span>
          <span class="order-summary__item-qty">x${item.quantity}</span>
          <span class="order-summary__item-price">${(item.price * item.quantity).toFixed(2)} &euro;</span>
        </div>
      `).join('')}
      <div class="cart-summary__row" style="margin-top: 1rem;">
        <span>Subtotal</span>
        <span data-testid="checkout-subtotal">${subtotal.toFixed(2)} &euro;</span>
      </div>
      <div class="cart-summary__row">
        <span>Envio</span>
        <span data-testid="checkout-shipping">${shipping === 0 ? 'Gratis' : shipping.toFixed(2) + ' \u20ac'}</span>
      </div>
      <div class="cart-summary__row">
        <span>IVA (21%)</span>
        <span data-testid="checkout-tax">${tax.toFixed(2)} &euro;</span>
      </div>
      <div class="cart-summary__row cart-summary__row--total">
        <span>Total</span>
        <span data-testid="checkout-total">${total.toFixed(2)} &euro;</span>
      </div>
    `;
  }

  // Checkout form handler
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset errors
    checkoutForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('form-group--error'));

    const fields = {
      name: checkoutForm.querySelector('[data-testid="checkout-name"]'),
      email: checkoutForm.querySelector('[data-testid="checkout-email"]'),
      address: checkoutForm.querySelector('[data-testid="checkout-address"]'),
      city: checkoutForm.querySelector('[data-testid="checkout-city"]'),
      zip: checkoutForm.querySelector('[data-testid="checkout-zip"]'),
      cardNumber: checkoutForm.querySelector('[data-testid="checkout-card-number"]'),
      cardExpiry: checkoutForm.querySelector('[data-testid="checkout-card-expiry"]'),
      cardCvc: checkoutForm.querySelector('[data-testid="checkout-card-cvc"]')
    };

    let hasError = false;

    // Validation
    if (!fields.name?.value || fields.name.value.length < 2) {
      fields.name?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }
    if (!fields.email?.value || !fields.email.value.includes('@')) {
      fields.email?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }
    if (!fields.address?.value || fields.address.value.length < 5) {
      fields.address?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }
    if (!fields.city?.value || fields.city.value.length < 2) {
      fields.city?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }
    if (!fields.zip?.value || fields.zip.value.length < 4) {
      fields.zip?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }
    if (!fields.cardNumber?.value || fields.cardNumber.value.replace(/\s/g, '').length < 13) {
      fields.cardNumber?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }
    if (!fields.cardExpiry?.value || !/^\d{2}\/\d{2}$/.test(fields.cardExpiry.value)) {
      fields.cardExpiry?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }
    if (!fields.cardCvc?.value || fields.cardCvc.value.length < 3) {
      fields.cardCvc?.closest('.form-group')?.classList.add('form-group--error');
      hasError = true;
    }

    if (hasError) {
      Toast.show('Por favor, completa todos los campos correctamente', 'error');
      return;
    }

    // Simulate order placement
    const orderId = 'TH-' + Date.now().toString(36).toUpperCase();

    // Show success
    if (checkoutContent) checkoutContent.style.display = 'none';
    if (successMessage) {
      successMessage.style.display = 'block';
      const orderIdEl = successMessage.querySelector('[data-testid="order-id"]');
      if (orderIdEl) orderIdEl.textContent = orderId;
    }

    // Clear cart
    Store.clearCart();
    Toast.show('Pedido realizado con exito!', 'success');
  });
}

// --- Page Router ---
function initPage() {
  initNavigation();

  const page = document.body.dataset.page;

  switch (page) {
    case 'home':
      initHomepage();
      break;
    case 'product':
      initProductDetail();
      break;
    case 'cart':
      initCart();
      break;
    case 'login':
      initLogin();
      break;
    case 'checkout':
      initCheckout();
      break;
  }
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', initPage);
