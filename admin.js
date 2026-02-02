document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.admin-section');
  const headerTitle = document.querySelector('.main-header h2');
  const headerSubtitle = document.querySelector('.main-header .main-subtitle');

  const subtitles = {
    home: 'Overview of profits, losses and customer activity',
    products: 'Create, update and remove products in your store',
    members: 'Manage members who are allowed to access this admin interface',
    requests: 'Review and respond to the latest customer requests',
  };

  // --- Section switching ---
  function activateSection(target) {
    sections.forEach((section) => {
      const key = section.getAttribute('data-section');
      if (key === target) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    if (headerTitle) {
      // Set title to button label (capitalization already correct)
      const activeBtn = Array.from(buttons).find(
        (btn) => btn.getAttribute('data-target') === target
      );
      if (activeBtn) {
        headerTitle.textContent = activeBtn.textContent;
      }
    }

    if (headerSubtitle && subtitles[target]) {
      headerSubtitle.textContent = subtitles[target];
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const target = this.getAttribute('data-target');
      if (!target) return;

      buttons.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');

      activateSection(target);
    });
  });

  // --- Manage Products: localStorage-powered extra products ---
  const PRODUCTS_KEY = 'simplebuyExtraProducts';
  const form = document.getElementById('admin-product-form');
  const tbody = document.getElementById('admin-products-tbody');

  function loadExtraProducts() {
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error('Failed to read extra products:', e);
      return [];
    }
  }

  function saveExtraProducts(list) {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save extra products:', e);
    }
  }

  function renderAdminProducts() {
    if (!tbody) return;
    const list = loadExtraProducts();
    tbody.innerHTML = '';
    if (list.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 3;
      td.textContent = 'No extra products yet.';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    list.forEach((p, idx) => {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      const tdPrice = document.createElement('td');
      const tdActions = document.createElement('td');

      tdName.textContent = p.title || 'New Product';
      tdPrice.textContent = 'DH ' + Number(p.price || 0).toFixed(2);

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Remove';
      delBtn.addEventListener('click', function () {
        const list = loadExtraProducts();
        list.splice(idx, 1);
        saveExtraProducts(list);
        renderAdminProducts();
      });

      tdActions.appendChild(delBtn);
      tr.appendChild(tdName);
      tr.appendChild(tdPrice);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
  }

  if (form && tbody) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const title = document.getElementById('ap-title').value.trim();
      const price = document.getElementById('ap-price').value.trim();
      const image = document.getElementById('ap-image').value.trim();
      const description = document.getElementById('ap-description').value.trim();
      if (!title || !price) return;

      const list = loadExtraProducts();
      list.push({ title, price, image, description });
      saveExtraProducts(list);
      form.reset();
      renderAdminProducts();
    });

    // initial render
    renderAdminProducts();
  }

  // Ensure default state is Home
  activateSection('home');
});
