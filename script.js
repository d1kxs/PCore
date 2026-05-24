// ========== ДАННЫЕ (LOCAL STORAGE) ==========
let cart = JSON.parse(localStorage.getItem('pc_cart')) || [];
let fav = JSON.parse(localStorage.getItem('pc_fav')) || [];
let compare = JSON.parse(localStorage.getItem('pc_compare')) || [];

// ========== DOM ЭЛЕМЕНТЫ ==========
const cartCount = document.getElementById('cart-count');
const favCount = document.getElementById('favorite-count');
const compareCount = document.getElementById('compare-count');

const cartModal = document.getElementById('cart-modal');
const favModal = document.getElementById('fav-modal');
const compareModal = document.getElementById('compare-modal');
const loginModal = document.getElementById('login-modal');
const orderModal = document.getElementById('order-modal');
const navMenu = document.getElementById('nav');

// ========== СИНХРОНИЗАЦИЯ И СОХРАНЕНИЕ ==========
function saveData() {
  localStorage.setItem('pc_cart', JSON.stringify(cart));
  localStorage.setItem('pc_fav', JSON.stringify(fav));
  localStorage.setItem('pc_compare', JSON.stringify(compare));
  updateCounters();
}

function updateCounters() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCount) cartCount.textContent = totalItems;
  if (favCount) favCount.textContent = fav.length;
  if (compareCount) compareCount.textContent = compare.length;
}

// ========== КОРЗИНА ==========
function addToCart(title, price) {
  const existing = cart.find((item) => item.title === title);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ title, price, qty: 1 });
  }
  saveData();
  showToast(`Товар "${title}" добавлен в корзину`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveData();
  renderCartModal();
}

function updateQty(index, change) {
  if (cart[index].qty + change > 0) {
    cart[index].qty += change;
  } else {
    cart.splice(index, 1);
  }
  saveData();
  renderCartModal();
}

function renderCartModal() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
    return;
  }

  // Сначала выводим список товаров
  const itemsHTML = cart
    .map(
      (item, i) => `
    <div class="cart-item">
      <span>${item.title}</span>
      <div class="qty">
        <button onclick="updateQty(${i}, -1)">-</button>
        <span>${item.qty}</span>
        <button onclick="updateQty(${i}, 1)">+</button>
      </div>
      <button class="delete" onclick="removeFromCart(${i})">Удалить</button>
    </div>
  `
    )
    .join('');

  container.innerHTML = itemsHTML;

  // Безопасное добавление кнопки оформления (не ломает разметку флекс-элементов)
  const orderBtn = document.createElement('button');
  orderBtn.textContent = 'Оформить заказ';
  orderBtn.className = 'submit-btn';
  orderBtn.style.margin = '20px auto 0 auto';
  orderBtn.style.display = 'block';
  orderBtn.onclick = () => {
    closeAllModals();
    openModal(orderModal);
  };
  container.appendChild(orderBtn);
}

// ========== ИЗБРАННОЕ ==========
function addToFav(title, btn) {
  const index = fav.indexOf(title);

  if (index !== -1) {
    fav.splice(index, 1);
    saveData();
    if (btn) btn.classList.remove('active');
    showToast('Удалено из избранного');
  } else {
    fav.push(title);
    saveData();
    if (btn) btn.classList.add('active');
    showToast('Добавлено в избранное');
  }
}

function removeFromFav(index) {
  fav.splice(index, 1);
  saveData();
  renderFavModal();
  restoreButtonsState();
}

function renderFavModal() {
  const container = document.getElementById('fav-items');
  if (!container) return;

  if (fav.length === 0) {
    container.innerHTML = '<div class="empty-cart">Избранное пусто</div>';
    return;
  }

  container.innerHTML = fav
    .map(
      (item, i) => `
    <div class="fav-item">
      <span>${item}</span>
      <button class="delete" onclick="removeFromFav(${i})">Удалить</button>
    </div>
  `
    )
    .join('');
}

// ========== СРАВНЕНИЕ ==========
function addToCompare(title, btn) {
  const index = compare.indexOf(title);

  if (index !== -1) {
    compare.splice(index, 1);
    saveData();
    if (btn) btn.classList.remove('active');
    showToast('Удалено из сравнения');
  } else {
    compare.push(title);
    saveData();
    if (btn) btn.classList.add('active');
    showToast('Добавлено к сравнению');
  }
}

function removeFromCompare(index) {
  compare.splice(index, 1);
  saveData();
  renderCompareModal();
  restoreButtonsState();
}

function renderCompareModal() {
  const container = document.getElementById('compare-items');
  if (!container) return;

  if (compare.length === 0) {
    container.innerHTML = '<div class="empty-cart">Список сравнения пуст</div>';
    return;
  }

  container.innerHTML = compare
    .map(
      (item, i) => `
    <div class="fav-item">
      <span>${item}</span>
      <button class="delete" onclick="removeFromCompare(${i})">Удалить</button>
    </div>
  `
    )
    .join('');
}

// ========== МОДАЛЬНЫЕ ОКНА ==========
function openModal(modal) {
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.style.display = 'none';
  });
  document.body.style.overflow = '';
}

function closeMobileMenu() {
  if (navMenu) navMenu.classList.remove('active');
}

// ========== ВСПОЛЫВАЮЩИЕ УВЕДОМЛЕНИЯ (TOAST) ==========
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #00d4ff;
    color: #0a0e1a;
    padding: 12px 24px;
    border-radius: 30px;
    font-weight: bold;
    z-index: 2000;
    animation: fadeInUp 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Добавляем анимацию для уведомлений в head
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
document.head.appendChild(style);

// ========== ФИЛЬТРАЦИЯ И ПОИСК ==========
function filterProducts() {
  const searchInput = document.getElementById('catalog-search');
  if (!searchInput) return;

  const searchValue = searchInput.value.toLowerCase();
  const activeCategoryBtn = document.querySelector('.category-btn.active');
  const activeCategory = activeCategoryBtn
    ? activeCategoryBtn.dataset.category
    : 'all';

  document.querySelectorAll('.product-card').forEach((card) => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const desc = card.querySelector('p').textContent.toLowerCase();
    const category = card.dataset.category;

    const matchesSearch =
      title.includes(searchValue) || desc.includes(searchValue);
    const matchesCategory =
      activeCategory === 'all' || category === activeCategory;

    // Используем пустую строку '', чтобы восстановить дефолтные flex/grid свойства отображения CSS
    card.style.display = matchesSearch && matchesCategory ? '' : 'none';
  });
}

// ========== ОТПРАВКА ФОРМ ==========
document.getElementById('submit-order')?.addEventListener('click', () => {
  const name = document.getElementById('name')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const address = document.getElementById('address')?.value.trim();

  if (!name || !phone || !address) {
    showToast('Заполните все поля');
    return;
  }

  cart = [];
  saveData();
  closeAllModals();
  showToast(`Заказ оформлен! Спасибо, ${name}!`);
  renderCartModal();
});

document.getElementById('submit-login')?.addEventListener('click', () => {
  const email = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value.trim();

  if (!email || !password) {
    showToast('Введите e-mail и пароль');
    return;
  }

  closeAllModals();
  showToast('Вы успешно вошли в систему');
});

// ========== ВОССТАНОВЛЕНИЕ СОСТОЯНИЯ КНОПОК ПРИ ЗАГРУЗКЕ ==========
function restoreButtonsState() {
  document.querySelectorAll('.product-card').forEach((card) => {
    const title = card.querySelector('h3')?.textContent;
    if (!title) return;

    const favBtn = card.querySelector('.add-favorite');
    const compareBtn = card.querySelector('.add-compare');

    if (favBtn) {
      if (fav.includes(title)) {
        favBtn.classList.add('active');
      } else {
        favBtn.classList.remove('active');
      }
    }

    if (compareBtn) {
      if (compare.includes(title)) {
        compareBtn.classList.add('active');
      } else {
        compareBtn.classList.remove('active');
      }
    }
  });
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ КАРТОЧЕК ==========
document.querySelectorAll('.add-cart').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    const title = card.querySelector('h3').textContent;
    const price = card.querySelector('.price').textContent;
    addToCart(title, price);
  });
});

document.querySelectorAll('.add-favorite').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    const title = card.querySelector('h3').textContent;
    addToFav(title, btn);
  });
});

document.querySelectorAll('.add-compare').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    const title = card.querySelector('h3').textContent;
    addToCompare(title, btn);
  });
});

// ========== ОБРАБОТЧИКИ НАВИГАЦИИ И МОДАЛОК ==========
document.getElementById('cart-open-btn')?.addEventListener('click', () => {
  closeMobileMenu();
  renderCartModal();
  openModal(cartModal);
});

document.getElementById('fav-open-btn')?.addEventListener('click', () => {
  closeMobileMenu();
  renderFavModal();
  openModal(favModal);
});

document.getElementById('compare-open-btn')?.addEventListener('click', () => {
  closeMobileMenu();
  renderCompareModal();
  openModal(compareModal);
});

document.getElementById('login-open-btn')?.addEventListener('click', () => {
  closeMobileMenu();
  openModal(loginModal);
});

document.querySelectorAll('.close-modal').forEach((btn) => {
  btn.addEventListener('click', closeAllModals);
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    closeAllModals();
  }
});

// Категории
document.querySelectorAll('.category-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document
      .querySelectorAll('.category-btn')
      .forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    filterProducts();
  });
});

// Поиск
document
  .getElementById('catalog-search')
  ?.addEventListener('input', filterProducts);

// Бургер меню
document.getElementById('burger')?.addEventListener('click', () => {
  if (navMenu) navMenu.classList.toggle('active');
});

// Ссылки мобильного меню
document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => {
    closeMobileMenu();
  });
});

// ========== ИНИЦИАЛИЗАЦИЯ ==========
updateCounters();
restoreButtonsState();
filterProducts();
