document.addEventListener("DOMContentLoaded", function() {
  const bar = document.getElementById("bar");
  const menuToggle = document.getElementById("menu-toggle");
  const cartIcon = document.querySelector('#cart-icon');
  const cartIconMobile = document.querySelector('#cart-mobile');
  const cart = document.querySelector('#cart');
  const closeCart = document.querySelector('#close-cart');

  // Product modal elements
  const productModal = document.querySelector('#product-modal');
  const productModalClose = document.querySelector('#product-modal-close');
  const pmImage = document.querySelector('#pm-image');
  const pmTitle = document.querySelector('#pm-title');
  const pmPrice = document.querySelector('#pm-price');
  const pmDescription = document.querySelector('#pm-description');
  const pmRating = document.querySelector('#pm-rating');
  const pmCommentsList = document.querySelector('#pm-comments-list');
  const cartContent = cart.querySelector('.cart-content');
  const totalSection = cart.querySelector('.total');
  const cartCount = document.getElementById('cart-count');

  // Login and checkout modals
  const loginModal = document.querySelector('#login-modal');
  const loginClose = document.querySelector('#login-close');
  const loginGoogle = document.querySelector('#login-google');
  const loginPaypal = document.querySelector('#login-paypal');
  const loginEmail = document.querySelector('#login-email');

  const checkoutSummary = document.querySelector('#checkout-summary');
  const checkoutSummaryClose = document.querySelector('#checkout-summary-close');
  const checkoutProducts = document.querySelector('#checkout-products');
  const shippingEl = document.querySelector('#shipping-amount');
  const taxEl = document.querySelector('#tax-amount');
  const checkoutTotalEl = document.querySelector('#checkout-total');
  const goToAddress = document.querySelector('#go-to-address');

  const USER_KEY = 'simplebuyUserLoggedIn';
  const CART_KEY = 'simplebuyCartItems';

  function isLoggedIn() {
    return localStorage.getItem(USER_KEY) === '1';
  }

  function setLoggedIn() {
    localStorage.setItem(USER_KEY, '1');
  }

  // --- Cart persistence helpers ---
  function loadCartFromStorage() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error('Failed to read cart from storage:', e);
      return [];
    }
  }

  function saveCartToStorage() {
    try {
      const cartBoxes = document.getElementsByClassName('cart-box');
      const items = [];
      for (let i = 0; i < cartBoxes.length; i++) {
        const box = cartBoxes[i];
        const titleEl = box.querySelector('.cart-product-title');
        const priceEl = box.querySelector('.cart-price');
        const qtyEl = box.querySelector('.cart-quantity');
        const imgEl = box.querySelector('.cart-img');
        if (!titleEl || !priceEl || !qtyEl || !imgEl) continue;
        const title = titleEl.innerText;
        const price = priceEl.innerText;
        const quantity = parseInt(qtyEl.value, 10) || 1;
        const image = imgEl.src;
        items.push({ title, price, quantity, image });
      }
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage:', e);
    }
  }

  function openLogin() {
    if (!loginModal) return;
    loginModal.classList.add('show');
    loginModal.setAttribute('aria-hidden', 'false');
  }

  function closeLogin() {
    if (!loginModal) return;
    loginModal.classList.remove('show');
    loginModal.setAttribute('aria-hidden', 'true');
  }

  function openCheckoutSummary() {
    if (!checkoutSummary) return;

    // Build products list from cart
    const cartBoxes = document.getElementsByClassName('cart-box');
    let subtotal = 0;
    checkoutProducts.innerHTML = '';

    for (let i = 0; i < cartBoxes.length; i++) {
      const box = cartBoxes[i];
      const titleEl = box.querySelector('.cart-product-title');
      const priceEl = box.querySelector('.cart-price');
      const qtyEl = box.querySelector('.cart-quantity');
      if (!titleEl || !priceEl || !qtyEl) continue;

      const title = titleEl.innerText;
      const price = parseFloat(priceEl.innerText.replace('DH', '')) || 0;
      const qty = parseInt(qtyEl.value, 10) || 1;
      subtotal += price * qty;

      const row = document.createElement('div');
      row.className = 'checkout-product-row';
      row.innerHTML = `<span>${title} × ${qty}</span><span>DH ${(price * qty).toFixed(2)}</span>`;
      checkoutProducts.appendChild(row);
    }

    const shipping = subtotal > 0 ? 20 : 0;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    if (shippingEl) shippingEl.textContent = `DH ${shipping.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `DH ${tax.toFixed(2)}`;
    if (checkoutTotalEl) checkoutTotalEl.textContent = `DH ${total.toFixed(2)}`;

    checkoutSummary.classList.add('show');
    checkoutSummary.setAttribute('aria-hidden', 'false');
  }

  function closeCheckoutSummary() {
    if (!checkoutSummary) return;
    checkoutSummary.classList.remove('show');
    checkoutSummary.setAttribute('aria-hidden', 'true');
  }
  // Function to handle removing items from cart
  function removeCartItem(event) {
    console.log("removeCartItem called");
    const buttonClicked = event.target;
    const cartItem = buttonClicked.closest('.cart-box');
    if (cartItem) {
      cartItem.remove();
      updateCart();
      saveCartToStorage();
    }
  }

  // Function to handle quantity changes
  function quantityChanged(event) {
    console.log("quantityChanged called");
    const input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
      input.value = 1;
    }
    updateCart();
    saveCartToStorage();
  }

  // Helper to change quantity via +/- buttons
  function changeQuantity(cartBox, delta) {
    const input = cartBox.querySelector('.cart-quantity');
    if (!input) return;
    let current = parseInt(input.value, 10);
    if (isNaN(current) || current <= 0) {
      current = 1;
    }
    current += delta;
    if (current < 1) current = 1;
    input.value = current;
    updateCart();
  }

  // Function to add items to cart
  function addCartClicked(event) {
    console.log("addCartClicked called");
    const button = event.target;
    
    // Add pulse animation
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 400);
    
    const shopProduct = button.parentElement;
    const title = shopProduct.getElementsByClassName('product-title')[0].innerText;
    const price = shopProduct.getElementsByClassName('price')[0].innerText;
    const productImg = shopProduct.getElementsByClassName('product-img')[0].src;
    addProductToCart(title, price, productImg);
  }

  function addProductToCart(title, price, productImg) {
    console.log("addProductToCart called");
    const cartItems = document.getElementsByClassName('cart-content')[0];
    const cartItemsNames = cartItems.getElementsByClassName('cart-product-title');

    for (let i = 0; i < cartItemsNames.length; i++) {
      if (cartItemsNames[i].innerText === title) {
        console.log("Product already in cart:", title);
        return;
      }
    }

    const cartShopBox = document.createElement('div');
    cartShopBox.classList.add('cart-box');
    const cartBoxContent = `
      <img src="${productImg}" alt="Product Image" class="cart-img">
      <div class="detail-box">
        <div class="cart-product-title">${title}</div>
        <div class="cart-price">${price}</div>
        <div class="star">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
        </div>
        <div class="quantity-wrapper">
          <button type="button" class="qty-btn qty-minus">-</button>
          <input type="number" value="1" class="cart-quantity">
          <button type="button" class="qty-btn qty-plus">+</button>
        </div>
      </div>
      <i class="fa-solid fa-trash-alt cart-remove"></i>
    `;
    cartShopBox.innerHTML = cartBoxContent;
    cartItems.insertBefore(cartShopBox, totalSection); // Insert new item above the total section

    const removeBtn = cartShopBox.querySelector('.cart-remove');
    const qtyInput = cartShopBox.querySelector('.cart-quantity');
    const minusBtn = cartShopBox.querySelector('.qty-minus');
    const plusBtn = cartShopBox.querySelector('.qty-plus');

    if (removeBtn) {
      removeBtn.addEventListener('click', removeCartItem);
    }
    if (qtyInput) {
      qtyInput.addEventListener('change', quantityChanged);
    }
    if (minusBtn) {
      minusBtn.addEventListener('click', function() {
        changeQuantity(cartShopBox, -1);
      });
    }
    if (plusBtn) {
      plusBtn.addEventListener('click', function() {
        changeQuantity(cartShopBox, 1);
      });
    }

    updateCart();
    saveCartToStorage();
  }

  function updateTotal() {
    console.log("updateTotal called");
    const cartBoxes = document.getElementsByClassName('cart-box');
    let total = 0;
    for (let i = 0; i < cartBoxes.length; i++) {
      const cartBox = cartBoxes[i];
      const priceElement = cartBox.querySelector('.cart-price');
      const quantityElement = cartBox.querySelector('.cart-quantity');

      if (!priceElement || !quantityElement) {
        console.error("Price or quantity element not found in cart box:", cartBox);
        continue;
      }

      const price = parseFloat(priceElement.innerText.replace("DH", ""));
      if (isNaN(price)) {
        console.error("Invalid price found:", priceElement.innerText);
        continue;
      }

      const quantity = quantityElement.value;
      if (isNaN(quantity) || quantity <= 0) {
        console.error("Invalid quantity found:", quantityElement.value);
        continue;
      }

      total += (price * quantity);
    }
    document.querySelector('.total-price').innerText = 'DH ' + total.toFixed(2);
  }

  function updateCartCount() {
    console.log("updateCartCount called");
    const cartBoxes = document.getElementsByClassName('cart-box');
    if (cartCount) {
      cartCount.innerText = cartBoxes.length;
    }
  }

  // Update cart (total, count, and icon)
  function updateCart() {
    updateTotal();
    updateCartCount();
    updateCartIcon();
  }
  
  function updateCartIcon() {
    const cartBoxes = document.getElementsByClassName("cart-box");
    let quantity = 0;
  
    for (let i = 0; i < cartBoxes.length; i++) {
      const cartBox = cartBoxes[i];
      const quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
      quantity += parseInt(quantityElement.value);
    }
    cartIcon.setAttribute("data-quantity", quantity);
    if (cartIconMobile) {
      cartIconMobile.setAttribute("data-quantity", quantity);
    }
  }
  

  function openProductModalFromImage(img) {
    if (!productModal || !img) return;
    const product = img.closest('.product');
    if (!product) return;

    const titleEl = product.querySelector('.product-title');
    const priceEl = product.querySelector('.price');
    const description = img.getAttribute('data-description') || 'No description available.';
    const commentsRaw = img.getAttribute('data-comments') || '';

    if (pmImage) pmImage.src = img.src;
    if (pmTitle && titleEl) pmTitle.textContent = titleEl.innerText;
    if (pmPrice && priceEl) pmPrice.textContent = priceEl.innerText;
    if (pmDescription) pmDescription.textContent = description;

    // rating: reuse existing stars inside product
    if (pmRating) {
      const stars = product.querySelector('.star');
      pmRating.innerHTML = stars ? stars.innerHTML : '';
    }

    // comments
    if (pmCommentsList) {
      pmCommentsList.innerHTML = '';
      if (commentsRaw.trim() !== '') {
        const parts = commentsRaw.split('|');
        parts.forEach((c) => {
          const li = document.createElement('li');
          li.textContent = c.trim();
          pmCommentsList.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.textContent = 'No customer comments yet.';
        pmCommentsList.appendChild(li);
      }
    }

    productModal.classList.add('show');
    productModal.setAttribute('aria-hidden', 'false');
  }

  function closeProductModal() {
    if (!productModal) return;
    productModal.classList.remove('show');
    productModal.setAttribute('aria-hidden', 'true');
  }

  function ready() {
    console.log("ready function called");

    // Restore cart from localStorage if any items were saved
    const savedItems = loadCartFromStorage();
    if (Array.isArray(savedItems) && savedItems.length > 0) {
      savedItems.forEach((item) => {
        const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
        // Reuse addProductToCart, then adjust quantity if needed
        addProductToCart(item.title, item.price, item.image);
        const boxes = document.getElementsByClassName('cart-box');
        const lastBox = boxes[boxes.length - 1];
        if (lastBox) {
          const qtyInput = lastBox.querySelector('.cart-quantity');
          if (qtyInput) {
            qtyInput.value = qty;
          }
        }
      });
      updateCart();
    }

    const removeCartButtons = document.getElementsByClassName('cart-remove');
    for (let i = 0; i < removeCartButtons.length; i++) {
      const button = removeCartButtons[i];
      button.addEventListener('click', removeCartItem);
    }

    const quantityInputs = document.getElementsByClassName('cart-quantity');
    for (let i = 0; i < quantityInputs.length; i++) {
      const input = quantityInputs[i];
      input.addEventListener('change', quantityChanged);
    }

    // Product detail: click on product image opens modal
    const productImages = document.getElementsByClassName('product-img');
    for (let i = 0; i < productImages.length; i++) {
      const img = productImages[i];
      img.addEventListener('click', function () {
        openProductModalFromImage(this);
      });
    }

    // Attach +/- handlers for any cart boxes that might exist on load
    const minusButtons = document.getElementsByClassName('qty-minus');
    for (let i = 0; i < minusButtons.length; i++) {
      const btn = minusButtons[i];
      btn.addEventListener('click', function() {
        const cartBox = this.closest('.cart-box');
        if (cartBox) {
          changeQuantity(cartBox, -1);
        }
      });
    }

    const plusButtons = document.getElementsByClassName('qty-plus');
    for (let i = 0; i < plusButtons.length; i++) {
      const btn = plusButtons[i];
      btn.addEventListener('click', function() {
        const cartBox = this.closest('.cart-box');
        if (cartBox) {
          changeQuantity(cartBox, 1);
        }
      });
    }

    const addCartButtons = document.getElementsByClassName('add-to-cart');
    for (let i = 0; i < addCartButtons.length; i++) {
      const button = addCartButtons[i];
      button.addEventListener('click', addCartClicked);
    }

    // Buy Now button logic (login gate)
    const buyButton = document.querySelector('.btn-buy');
    if (buyButton) {
      buyButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (!isLoggedIn()) {
          openLogin();
        } else {
          openCheckoutSummary();
        }
      });
    }
  }

  bar.addEventListener("click", function() {
    menuToggle.style.display = "flex";
    menuToggle.innerHTML = `
      <ul id="menu">
        <li><a class="active" href="#">Home</a></li>
        <li><a href="#products">Products</a></li>
        <li><a href="../about-us/about.html">About Us</a></li>
        <li><a href="../contact-page/contact.html">Contact</a></li>
        <li id="close-btn"><i class="fa-solid fa-xmark"></i></li>
      </ul>
    `;
    bar.style.display = "none";
  });

  document.addEventListener("click", function(event) {
    if (event.target.closest("#close-btn")) {
      menuToggle.style.display = "none";
      bar.style.display = "block";
    }
  });

  cartIcon.onclick = () => {
    cart.classList.add("active");
  };

  if (cartIconMobile) {
    cartIconMobile.onclick = () => {
      cart.classList.add("active");
    };
  }

  closeCart.onclick = () => {
    cart.classList.remove("active");
  };

  // Product modal close handlers
  if (productModalClose) {
    productModalClose.addEventListener('click', closeProductModal);
  }

  if (productModal) {
    productModal.addEventListener('click', function (e) {
      if (e.target === productModal) {
        closeProductModal();
      }
    });
  }

  // Login modal handlers
  if (loginClose && loginModal) {
    loginClose.addEventListener('click', closeLogin);
    loginModal.addEventListener('click', function(e) {
      if (e.target === loginModal) closeLogin();
    });
  }

  [loginGoogle, loginPaypal, loginEmail].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', function() {
      setLoggedIn();
      closeLogin();
      openCheckoutSummary();
    });
  });

  // Checkout summary handlers
  if (checkoutSummaryClose && checkoutSummary) {
    checkoutSummaryClose.addEventListener('click', closeCheckoutSummary);
    checkoutSummary.addEventListener('click', function(e) {
      if (e.target === checkoutSummary) closeCheckoutSummary();
    });
  }

  if (goToAddress) {
    goToAddress.addEventListener('click', function() {
      // For now, just close the summary. Future: open address step.
      closeCheckoutSummary();
    });
  }

  ready();

  
});
