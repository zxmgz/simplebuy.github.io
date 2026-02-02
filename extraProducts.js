document.addEventListener('DOMContentLoaded', function () {
  try {
    const container = document.querySelector('#products .products-container');
    if (!container) return;

    const raw = localStorage.getItem('simplebuyExtraProducts');
    if (!raw) return;

    const extras = JSON.parse(raw);
    if (!Array.isArray(extras)) return;

    extras.forEach((p) => {
      const div = document.createElement('div');
      div.className = 'product';
      div.innerHTML = `
        <img src="${p.image || '../images/logo/logo%201%20mini.png'}" alt="${
        p.title || 'Product'
      }" class="product-img" data-description="${
        p.description || 'No description provided.'
      }" data-comments="${
        (p.comments && p.comments.join('|')) || ''
      }" />
        <h5 class="brand-title">SimpleBuy</h5>
        <h3 class="product-title">${p.title || 'New Product'}</h3>
        <p class="price">DH${Number(p.price || 0).toFixed(2)}</p>
        <div class="star">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
        </div>
        <a class="add-to-cart">Add to Cart</a>
      `;

      container.appendChild(div);
    });
  } catch (e) {
    console.error('Failed to load extra products from admin:', e);
  }
});
