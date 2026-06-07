// orders.js - Логика для страницы заказов с переключателем режима

// Данные заказов (клиентские)
let ordersData = [
    {
        id: "FISH-001245",
        date: "15 января 2024",
        status: "delivered",
        customer: "Иван Иванов",
        phone: "+7 (999) 123-45-67",
        email: "client@example.com",
        products: [
            { 
                id: 1,
                name: "Сёмга свежая", 
                price: 1200, 
                quantity: 1, 
                unit: "кг",
                image: "🐟",
                total: 1200
            },
            { 
                id: 3,
                name: "Креветки тигровые", 
                price: 1900, 
                quantity: 0.5, 
                unit: "кг",
                image: "🦐",
                total: 950
            },
            { 
                id: 4,
                name: "Кальмар", 
                price: 650, 
                quantity: 1, 
                unit: "кг",
                image: "🦑",
                total: 650
            },
            { 
                id: 6,
                name: "Мидии", 
                price: 450, 
                quantity: 1, 
                unit: "кг",
                image: "🐚",
                total: 450
            }
        ],
        total: 3250,
        address: "г. Екатеринбург, ул. Репина, д. 15, кв. 42",
        deliveryTime: "14:30",
        deliveryDate: "15.01.2024",
        paymentMethod: "Картой при получении",
        notes: "Позвонить за 15 минут до доставки",
        tracking: [
            { step: "Заказ принят", time: "15.01.2024 10:00", completed: true },
            { step: "Сборка заказа", time: "15.01.2024 11:30", completed: true },
            { step: "Передан курьеру", time: "15.01.2024 13:45", completed: true },
            { step: "Доставлен", time: "15.01.2024 14:30", completed: true }
        ]
    },
    {
        id: "FISH-001244",
        date: "14 января 2024",
        status: "processing",
        customer: "Иван Иванов",
        phone: "+7 (999) 123-45-67",
        email: "client@example.com",
        products: [
            { 
                id: 2,
                name: "Форель радужная", 
                price: 890, 
                quantity: 1, 
                unit: "кг",
                image: "🐟",
                total: 890
            },
            { 
                id: 11,
                name: "Икра лососевая", 
                price: 2500, 
                quantity: 0.1, 
                unit: "кг",
                image: "🥫",
                total: 2500
            },
            { 
                id: 999,
                name: "Лимон для рыбы", 
                price: 50, 
                quantity: 2, 
                unit: "шт",
                image: "🍋",
                total: 100
            }
        ],
        total: 3490,
        address: "г. Екатеринбург, ул. Репина, д. 15, кв. 42",
        deliveryTime: "18:00",
        deliveryDate: "14.01.2024",
        paymentMethod: "Онлайн оплата",
        notes: "Доставить до 18:00",
        tracking: [
            { step: "Заказ принят", time: "14.01.2024 16:00", completed: true },
            { step: "Сборка заказа", time: "14.01.2024 17:30", completed: true },
            { step: "Передан курьеру", time: "14.01.2024 18:00", completed: false },
            { step: "Доставлен", time: "Ожидается", completed: false }
        ]
    },
    {
        id: "FISH-001243",
        date: "13 января 2024",
        status: "new",
        customer: "Иван Иванов",
        phone: "+7 (999) 123-45-67",
        email: "client@example.com",
        products: [
            { 
                id: 7,
                name: "Тунец стейк", 
                price: 1875, 
                quantity: 0.8, 
                unit: "кг",
                image: "🐟",
                total: 1500
            },
            { 
                id: 8,
                name: "Осьминог", 
                price: 1200, 
                quantity: 1, 
                unit: "кг",
                image: "🐙",
                total: 1200
            },
            { 
                id: 999,
                name: "Устрицы", 
                price: 350, 
                quantity: 6, 
                unit: "шт",
                image: "🦪",
                total: 350
            }
        ],
        total: 3050,
        address: "г. Екатеринбург, ул. Репина, д. 15, кв. 42",
        deliveryTime: "20:00",
        deliveryDate: "13.01.2024",
        paymentMethod: "Наличными при получении",
        notes: "Оставить у двери",
        tracking: [
            { step: "Заказ принят", time: "13.01.2024 18:30", completed: true },
            { step: "Сборка заказа", time: "В процессе", completed: false },
            { step: "Передан курьеру", time: "Ожидается", completed: false },
            { step: "Доставлен", time: "Ожидается", completed: false }
        ]
    },
    {
        id: "FISH-001242",
        date: "12 января 2024",
        status: "cancelled",
        customer: "Иван Иванов",
        phone: "+7 (999) 123-45-67",
        email: "client@example.com",
        products: [
            { 
                id: 9,
                name: "Дорадо", 
                price: 950, 
                quantity: 1, 
                unit: "кг",
                image: "🐟",
                total: 950
            },
            { 
                id: 3,
                name: "Креветки тигровые", 
                price: 1900, 
                quantity: 0.5, 
                unit: "кг",
                image: "🦐",
                total: 950
            }
        ],
        total: 1900,
        address: "г. Екатеринбург, ул. Репина, д. 15, кв. 42",
        deliveryTime: "19:00",
        deliveryDate: "12.01.2024",
        paymentMethod: "Картой при получении",
        notes: "Отменен по просьбе клиента",
        tracking: [
            { step: "Заказ принят", time: "12.01.2024 16:00", completed: true },
            { step: "Отменен", time: "12.01.2024 17:30", completed: true }
        ]
    }
];

// Данные для админского режима (все заказы)
let adminOrdersData = [
    ...ordersData,
    {
        id: "FISH-001241",
        date: "11 января 2024",
        status: "delivered",
        customer: "Ольга Петрова",
        phone: "+7 (999) 876-54-32",
        email: "olga@example.com",
        products: [
            { 
                id: 11,
                name: "Икра лососевая", 
                price: 2500, 
                quantity: 0.2, 
                unit: "кг",
                image: "🥫",
                total: 500
            },
            { 
                id: 4,
                name: "Кальмар", 
                price: 650, 
                quantity: 1, 
                unit: "кг",
                image: "🦑",
                total: 650
            }
        ],
        total: 1150,
        address: "г. Екатеринбург, ул. Кирова, д. 8, кв. 7",
        deliveryTime: "15:00",
        deliveryDate: "11.01.2024",
        paymentMethod: "Онлайн оплата",
        notes: "",
        tracking: [
            { step: "Заказ принят", time: "11.01.2024 12:00", completed: true },
            { step: "Сборка заказа", time: "11.01.2024 13:30", completed: true },
            { step: "Передан курьеру", time: "11.01.2024 14:45", completed: true },
            { step: "Доставлен", time: "11.01.2024 15:30", completed: true }
        ]
    },
    {
        id: "FISH-001240",
        date: "10 января 2024",
        status: "processing",
        customer: "Алексей Смирнов",
        phone: "+7 (999) 555-44-33",
        email: "alex@example.com",
        products: [
            { 
                id: 6,
                name: "Мидии", 
                price: 450, 
                quantity: 2, 
                unit: "кг",
                image: "🐚",
                total: 900
            },
            { 
                id: 10,
                name: "Камбала", 
                price: 750, 
                quantity: 1, 
                unit: "кг",
                image: "🐟",
                total: 750
            }
        ],
        total: 1650,
        address: "г. Екатеринбург, ул. Свердлова, д. 20, кв. 15",
        deliveryTime: "17:00",
        deliveryDate: "10.01.2024",
        paymentMethod: "Картой при получении",
        notes: "Позвонить за час",
        tracking: [
            { step: "Заказ принят", time: "10.01.2024 14:00", completed: true },
            { step: "Сборка заказа", time: "10.01.2024 15:30", completed: true },
            { step: "Передан курьеру", time: "В процессе", completed: false },
            { step: "Доставлен", time: "Ожидается", completed: false }
        ]
    }
];

// Переменные для режимов
let isAdminMode = false;
let orderRatings = {};

// Переменные для пагинации
let currentPage = 1;
const ordersPerPage = 2;
let currentFilter = 'all';
let currentSearch = '';

// DOM элементы
const ordersContainer = document.getElementById('ordersContainer');
const filterTabs = document.querySelectorAll('.filter-tab');
const searchInput = document.getElementById('orderSearch');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbers = document.getElementById('pageNumbers');
const orderDetailsModal = document.getElementById('orderDetailsModal');
const orderDetailsContent = document.getElementById('orderDetailsContent');
const repeatOrderBtn = document.getElementById('repeatOrderBtn');

// Элементы для переключения режима
const modeSwitcher = document.getElementById('modeSwitcher');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const modePanel = document.getElementById('modePanel');
const adminFilters = document.getElementById('adminFilters');
const adminOrdersTable = document.getElementById('adminOrdersTable');
const adminOrdersTableBody = document.getElementById('adminOrdersTableBody');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    await window.FishSite?.init?.();
    if (!window.FishSite?.getCurrentUser?.()) {
        window.location.href = '/';
        return;
    }
    loadUserData();
    await loadOrdersFromApi();
    setupNavigation();
    updateCartCount();
    updateOrderStats();
    renderOrders();
    updatePagination();
    openOrderFromQuery();
    
    // Инициализируем кнопку переключения режима
    initModeSwitcher();
    initOrderSupportChat();
    
    // Обработчики фильтров
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.filter;
            currentPage = 1;
            renderOrders();
            updatePagination();
        });
    });
    
    // Обработчик поиска
    searchInput.addEventListener('input', function() {
        currentSearch = this.value.toLowerCase();
        currentPage = 1;
        renderOrders();
        updatePagination();
    });
    
    // Обработчики пагинации
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    
    // Обработчики модального окна
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeOrderDetailsModal);
    });
    
    orderDetailsModal.addEventListener('click', function(e) {
        if (e.target === orderDetailsModal) {
            closeOrderDetailsModal();
        }
    });
    
    // Обработчик повторения заказа
    repeatOrderBtn.addEventListener('click', repeatCurrentOrder);

    initOrderRatingModal();
});

function openOrderFromQuery() {
    const orderId = new URLSearchParams(window.location.search).get('order');
    if (!orderId) return;

    window.setTimeout(() => viewOrderDetails(orderId), 0);
}

async function loadOrdersFromApi() {
    if (!window.FishSite?.request) return;
    const userData = window.FishSite?.getCurrentUser?.();
    try {
        const email = encodeURIComponent(userData?.email || 'olga@example.com');
        ordersData = await window.FishSite.request(`/orders?email=${email}`);
        if (userData?.role === 'admin') {
            adminOrdersData = await window.FishSite.request('/admin/orders');
            const overview = await window.FishSite.request('/admin/overview');
            orderRatings = Object.fromEntries((overview.ratings || []).map(item => [
                item.order_number,
                { rating: item.rating, comment: item.comment, createdAt: item.created_at }
            ]));
        } else {
            adminOrdersData = ordersData;
        }
    } catch (error) {
        showNotification('API заказов недоступен, показаны демо-заказы', 'warning');
    }
}

// Инициализация переключателя режима
function initModeSwitcher() {
    const userData = window.FishSite?.getCurrentUser?.();
    const isAdmin = userData?.role === 'admin';

    if (!isAdmin) {
        if (modeSwitcher) modeSwitcher.style.display = 'none';
        if (modePanel) modePanel.style.display = 'none';
        if (adminFilters) adminFilters.style.display = 'none';
        if (adminOrdersTable) adminOrdersTable.style.display = 'none';
        return;
    }

    if (toggleModeBtn) {
        toggleModeBtn.innerHTML = '<i class="fas fa-user-shield"></i> Админский режим';
        toggleModeBtn.style.display = 'block';
        modeSwitcher.style.display = 'flex';
        
        // Обработчик переключения режима
        toggleModeBtn.addEventListener('click', toggleMode);
    }
}

// Переключение режима
function toggleMode() {
    if (!isAdminMode) {
        // Включаем админский режим
        enterAdminMode();
    } else {
        // Выключаем админский режим
        exitAdminMode();
    }
}

// Вход в админский режим
function enterAdminMode() {
    isAdminMode = true;
    
    // Показываем админские элементы
    if (modePanel) modePanel.style.display = 'block';
    if (adminFilters) adminFilters.style.display = 'block';
    if (adminOrdersTable) adminOrdersTable.style.display = 'block';
    
    // Скрываем клиентские элементы
    if (ordersContainer) ordersContainer.style.display = 'none';
    if (document.querySelector('.pagination')) document.querySelector('.pagination').style.display = 'none';
    if (document.querySelector('.order-stats')) document.querySelector('.order-stats').style.display = 'none';
    
    // Обновляем текст кнопки
    if (toggleModeBtn) {
        toggleModeBtn.innerHTML = '<i class="fas fa-user"></i> Клиентский режим';
    }
    
    // Загружаем админские заказы
    renderAdminOrders();
    
    showNotification('Вы вошли в админский режим', 'info');
}

// Выход из админского режима
function exitAdminMode() {
    isAdminMode = false;
    
    // Скрываем админские элементы
    if (modePanel) modePanel.style.display = 'none';
    if (adminFilters) adminFilters.style.display = 'none';
    if (adminOrdersTable) adminOrdersTable.style.display = 'none';
    
    // Показываем клиентские элементы
    if (ordersContainer) ordersContainer.style.display = 'block';
    if (document.querySelector('.pagination')) document.querySelector('.pagination').style.display = 'flex';
    if (document.querySelector('.order-stats')) document.querySelector('.order-stats').style.display = 'grid';
    
    // Обновляем текст кнопки
    if (toggleModeBtn) {
        toggleModeBtn.innerHTML = '<i class="fas fa-user-shield"></i> Админский режим';
    }
    
    // Обновляем клиентские заказы
    renderOrders();
    updatePagination();
    
    showNotification('Вы перешли в клиентский режим', 'info');
}

// Рендер админских заказов
function renderAdminOrders() {
    if (!adminOrdersTableBody) return;
    
    adminOrdersTableBody.innerHTML = '';
    
    adminOrdersData.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${order.id}</strong>
                <div class="small-text">${order.deliveryDate} ${order.deliveryTime}</div>
            </td>
            <td>${order.date}</td>
            <td>
                <div class="customer-info">
                    <strong>${order.customer}</strong>
                    <div class="small-text">${order.email}</div>
                </div>
            </td>
            <td>${order.phone}</td>
            <td>
                <strong>${order.total.toLocaleString()} руб.</strong>
                <div class="small-text">${order.paymentMethod}</div>
            </td>
            <td>
                <span class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </span>
            </td>
        `;
        adminOrdersTableBody.appendChild(row);
    });
}

// Функции из account.js
function loadUserData() {
    const userData = window.FishSite?.getCurrentUser?.() || {
        name: "Ольга Ивановна",
        email: "olga@example.com",
        initials: "ОИ",
        role: "customer"
    };
    
    const userNameElements = document.querySelectorAll('#user-name, #profile-name');
    const userEmailElements = document.querySelectorAll('#user-email, #profile-email');
    const userAvatarElements = document.querySelectorAll('#user-avatar, #profile-avatar');
    const userRoleElements = document.querySelectorAll('#user-role');
    
    userNameElements.forEach(el => el.textContent = userData.name);
    userEmailElements.forEach(el => el.textContent = userData.email);
    userAvatarElements.forEach(el => el.textContent = userData.initials);
    userRoleElements.forEach(el => el.textContent = userData.role === 'admin' ? 'Администратор' : 'Клиент');
    updateAdminOrdersLinks(userData);
    
    return userData;
}

function updateAdminOrdersLinks(userData) {
    const userLinks = document.querySelector('.user-links');
    const accountMenu = document.querySelector('.account-menu');

    if (userData.role !== 'admin') return;

    if (userLinks && !userLinks.querySelector('.admin-dashboard-link')) {
        const adminLink = document.createElement('a');
        adminLink.href = 'admin.html';
        adminLink.className = 'admin-dashboard-link';
        adminLink.innerHTML = '<i class="fas fa-chart-line"></i> CRM админа';
        userLinks.insertBefore(adminLink, userLinks.firstChild);
    }

    if (accountMenu && !accountMenu.querySelector('.admin-dashboard-link')) {
        const adminMenuLink = document.createElement('a');
        adminMenuLink.href = 'admin.html';
        adminMenuLink.className = 'account-menu-item admin-dashboard-link';
        adminMenuLink.innerHTML = '<i class="fas fa-chart-line"></i><span>CRM админа</span>';
        accountMenu.appendChild(adminMenuLink);
    }
}

function setupNavigation() {
    // Мобильное меню
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
    
    // Меню пользователя
    const userAvatar = document.getElementById('user-avatar');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.FishSite?.logout?.();
            window.location.href = '/';
        });
    }
}

function updateCartCount() {
    const cart = window.FishSite?.getCart ? window.FishSite.getCart() : [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = cartCount;
    });
}

// Рендер клиентских заказов
function renderOrders() {
    let filteredOrders = ordersData.filter(order => {
        // Применяем фильтр по статусу
        if (currentFilter !== 'all' && order.status !== currentFilter) {
            return false;
        }
        
        // Применяем поиск
        if (currentSearch) {
            const searchInId = order.id.toLowerCase().includes(currentSearch);
            const searchInProducts = order.products.some(product => 
                product.name.toLowerCase().includes(currentSearch)
            );
            return searchInId || searchInProducts;
        }
        
        return true;
    });
    
    // Сортируем по дате (новые сначала)
    filteredOrders.sort((a, b) => {
        return new Date(b.deliveryDate.split('.').reverse().join('-')) - 
               new Date(a.deliveryDate.split('.').reverse().join('-'));
    });
    
    // Пагинация
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    // Очищаем контейнер
    ordersContainer.innerHTML = '';
    
    if (paginatedOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Заказы не найдены</h3>
                <p>${getEmptyStateMessage()}</p>
                <a href="catalog.html" class="btn btn-primary">Сделать первый заказ</a>
            </div>
        `;
        return;
    }
    
    // Рендерим заказы
    paginatedOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersContainer.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = `order-card ${order.status}`;
    orderCard.dataset.id = order.id;
    
    // Форматируем дату
    const formattedDate = new Date(order.deliveryDate.split('.').reverse().join('-')).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const shownProducts = order.products.slice(0, 3);
    const extraProductsCount = order.products.length - shownProducts.length;

    orderCard.innerHTML = `
        <div class="order-card-main">
            <div class="order-header">
                <div>
                    <span class="order-card-label">Заказ</span>
                    <div class="order-id">#${order.id}</div>
                    <div class="order-date">${formattedDate} · доставка ${order.deliveryTime}</div>
                </div>
                <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
            </div>

            <div class="order-card-body">
                <div class="order-products">
                    ${shownProducts.map(product => `
                        <div class="product-item">
                            <div class="product-icon">${window.FishSite?.formatProductImage ? window.FishSite.formatProductImage(product, 'order-product-art') : product.image}</div>
                            <div class="product-info">
                                <div class="product-name">${product.name}</div>
                                <div class="product-meta">
                                    <span>${product.quantity} ${product.unit}</span>
                                    <span>${product.price} руб./${product.unit === 'шт' ? 'шт' : 'кг'}</span>
                                </div>
                            </div>
                            <div class="product-price">${product.total} руб.</div>
                        </div>
                    `).join('')}
                    ${extraProductsCount > 0 ? `
                        <div class="product-item order-products-more">
                            <span>+ еще ${extraProductsCount} товаров</span>
                        </div>
                    ` : ''}
                </div>

                <aside class="order-side-panel">
                    <div class="order-total">
                        <div class="total-label">Итого</div>
                        <div class="total-amount">${order.total.toLocaleString()} руб.</div>
                    </div>
                    <div class="order-details">
                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${order.address}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-credit-card"></i>
                            <span>${order.paymentMethod}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>

        ${renderOrderRatingSummary(order.id)}
        
        <div class="order-actions">
            <button class="btn btn-outline" onclick="viewOrderDetails('${order.id}')">
                <i class="fas fa-eye"></i> Подробнее
            </button>
            ${order.status === 'delivered' ? `
                <button class="btn btn-primary" onclick="repeatOrder('${order.id}')">
                    <i class="fas fa-redo"></i> Повторить
                </button>
                <button class="btn btn-secondary" onclick="openRatingModal('${order.id}')">
                    <i class="fas fa-star"></i> ${orderRatings[order.id] ? 'Изменить оценку' : 'Оценить заказ'}
                </button>
            ` : order.status === 'new' || order.status === 'processing' ? `
                <button class="btn btn-secondary" onclick="cancelOrder('${order.id}')">
                    <i class="fas fa-times"></i> Отменить
                </button>
            ` : ''}
            <button class="btn btn-outline" onclick="trackOrder('${order.id}')">
                <i class="fas fa-truck"></i> Отследить
            </button>
            <button class="btn btn-outline order-support-btn" onclick="openOrderSupportChat('${order.id}')">
                <i class="fas fa-headset"></i> Чат с поддержкой по заказу
            </button>
        </div>
    `;
    
    return orderCard;
}

function renderOrderRatingSummary(orderId) {
    const rating = orderRatings[orderId];
    if (!rating) {
        return '';
    }

    return `
        <div class="order-rating-summary">
            <span>${renderStars(rating.rating)}</span>
            <strong>${rating.rating}/5</strong>
            <p>${rating.comment || 'Спасибо за оценку заказа.'}</p>
        </div>
    `;
}

// Обновление статистики
function updateOrderStats() {
    const totalOrders = ordersData.length;
    const completedOrders = ordersData.filter(order => order.status === 'delivered').length;
    const activeOrders = ordersData.filter(order => order.status === 'new' || order.status === 'processing').length;
    const totalSpent = ordersData
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0);
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('activeOrders').textContent = activeOrders;
    document.getElementById('totalSpent').textContent = totalSpent.toLocaleString();
}

// Пагинация
function updatePagination() {
    const filteredOrders = ordersData.filter(order => {
        if (currentFilter !== 'all' && order.status !== currentFilter) {
            return false;
        }
        
        if (currentSearch) {
            const searchInId = order.id.toLowerCase().includes(currentSearch);
            const searchInProducts = order.products.some(product => 
                product.name.toLowerCase().includes(currentSearch)
            );
            return searchInId || searchInProducts;
        }
        
        return true;
    });
    
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    
    // Обновляем кнопки
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Обновляем номера страниц
    pageNumbers.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Показываем максимум 5 страниц
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
    }
    
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => {
            currentPage = i;
            renderOrders();
            updatePagination();
        });
        pageNumbers.appendChild(pageNumber);
    }
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderOrders();
        updatePagination();
    }
}

function goToNextPage() {
    const filteredOrders = ordersData.filter(order => {
        if (currentFilter !== 'all' && order.status !== currentFilter) {
            return false;
        }
        
        if (currentSearch) {
            const searchInId = order.id.toLowerCase().includes(currentSearch);
            const searchInProducts = order.products.some(product => 
                product.name.toLowerCase().includes(currentSearch)
            );
            return searchInId || searchInProducts;
        }
        
        return true;
    });
    
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    
    if (currentPage < totalPages) {
        currentPage++;
        renderOrders();
        updatePagination();
    }
}

// Вспомогательные функции
function getStatusText(status) {
    const statusMap = {
        'new': 'Новый',
        'confirmed': 'Подтвержден',
        'processing': 'Собирается',
        'courier': 'Передан курьеру',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
}

function getEmptyStateMessage() {
    if (currentFilter !== 'all') {
        return `У вас нет заказов со статусом "${getStatusText(currentFilter)}"`;
    }
    
    if (currentSearch) {
        return 'Заказы по вашему запросу не найдены';
    }
    
    return 'У вас пока нет заказов. Сделайте свой первый заказ!';
}

// Функции для работы с заказами
function viewOrderDetails(orderId) {
    const allOrders = isAdminMode ? adminOrdersData : ordersData;
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const formattedDate = new Date(order.deliveryDate.split('.').reverse().join('-')).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Добавляем информацию о клиенте в админском режиме
    const customerInfo = isAdminMode ? `
        <div class="info-section">
            <h4><i class="fas fa-user-circle"></i> Информация о клиенте</h4>
            <p><strong>Имя:</strong> ${order.customer}</p>
            <p><strong>Телефон:</strong> ${order.phone}</p>
            <p><strong>Email:</strong> ${order.email}</p>
        </div>
    ` : '';
    
    orderDetailsContent.innerHTML = `
        <div class="order-details-content">
            <div class="order-details-header">
                <div>
                    <h3>Заказ #${order.id}</h3>
                    <p>${formattedDate} • ${order.deliveryTime}</p>
                </div>
                <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
            </div>
            
            ${customerInfo}
            
            <div class="order-details-products">
                <h4>Состав заказа</h4>
                ${order.products.map(product => `
                    <div class="product-item">
                        <div class="product-info">
                            <div class="product-icon">${window.FishSite?.formatProductImage ? window.FishSite.formatProductImage(product, 'order-product-art') : product.image}</div>
                            <div>
                                <div class="product-name">${product.name}</div>
                                <div class="product-meta">
                                    <span>${product.quantity} ${product.unit} × ${product.price} руб.</span>
                                </div>
                            </div>
                        </div>
                        <div class="product-price">${product.total} руб.</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-details-total">
                <div class="total-label">Итого к оплате</div>
                <div class="total-amount">${order.total.toLocaleString()} руб.</div>
            </div>
            
            <div class="tracking-info">
                <h3><i class="fas fa-truck"></i> Отслеживание доставки</h3>
                <div class="tracking-steps">
                    ${order.tracking.map((step, index) => `
                        <div class="tracking-step ${step.completed ? 'active' : ''}">
                            <div class="step-icon">
                                <i class="fas fa-${getStepIcon(index)}"></i>
                            </div>
                            <div>
                                <div class="step-label">${step.step}</div>
                                <div class="step-time">${step.time}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${order.statusHistory?.length ? `
                <div class="tracking-info order-status-history">
                    <h3><i class="fas fa-clock-rotate-left"></i> История статусов</h3>
                    <div class="tracking-steps">
                        ${order.statusHistory.map(item => `
                            <div class="tracking-step active">
                                <div class="step-icon"><i class="fas fa-circle-check"></i></div>
                                <div>
                                    <div class="step-label">${item.label}</div>
                                    <div class="step-time">${item.createdAt}${item.comment ? ` • ${item.comment}` : ''}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${order.status === 'delivered' ? renderOrderRatingDetails(order.id) : ''}
            
            <div class="order-info-grid">
                <div class="info-section">
                    <h4><i class="fas fa-map-marker-alt"></i> Адрес доставки</h4>
                    <p>${order.address}</p>
                </div>
                
                <div class="info-section">
                    <h4><i class="fas fa-credit-card"></i> Информация об оплате</h4>
                    <p><strong>Способ оплаты:</strong> ${order.paymentMethod}</p>
                    <p><strong>Статус оплаты:</strong> ${order.status === 'cancelled' ? 'Возврат' : 'Оплачен'}</p>
                </div>
                
                ${order.notes ? `
                    <div class="info-section">
                        <h4><i class="fas fa-sticky-note"></i> Примечание</h4>
                        <p>${order.notes}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Сохраняем ID заказа для кнопки повторения
    repeatOrderBtn.dataset.orderId = orderId;
    
    // Показываем модальное окно
    orderDetailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function renderOrderRatingDetails(orderId) {
    const rating = orderRatings[orderId];

    if (!rating) {
        return `
            <div class="order-rating-details">
                <h3><i class="fas fa-star"></i> Оценка заказа</h3>
                <p>Поделитесь впечатлением о продукте, упаковке и доставке.</p>
                <button class="btn btn-primary" type="button" onclick="openRatingModal('${orderId}')">
                    Оценить заказ
                </button>
            </div>
        `;
    }

    return `
        <div class="order-rating-details">
            <h3><i class="fas fa-star"></i> Ваша оценка</h3>
            <div class="order-rating-summary in-modal">
                <span>${renderStars(rating.rating)}</span>
                <strong>${rating.rating}/5</strong>
                <p>${rating.comment || 'Комментарий не указан.'}</p>
            </div>
            <button class="btn btn-outline" type="button" onclick="openRatingModal('${orderId}')">
                Изменить оценку
            </button>
        </div>
    `;
}

function closeOrderDetailsModal() {
    orderDetailsModal.classList.remove('active');
    document.body.style.overflow = '';
}

function getStepIcon(stepIndex) {
    const icons = ['shopping-cart', 'box', 'shipping-fast', 'check-circle'];
    return icons[stepIndex] || 'circle';
}

async function repeatOrder(orderId) {
    const allOrders = isAdminMode ? adminOrdersData : ordersData;
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    for (const product of order.products) {
        await window.FishSite?.addToCart?.(product, product.quantity);
    }
    updateCartCount();
    
    showNotification('Товары добавлены в корзину! Вы можете перейти к оформлению заказа.');
}

function repeatCurrentOrder() {
    const orderId = repeatOrderBtn.dataset.orderId;
    repeatOrder(orderId);
    closeOrderDetailsModal();
}

function cancelOrder(orderId) {
    if (!confirm('Вы уверены, что хотите отменить этот заказ?')) return;
    
    const allOrders = isAdminMode ? adminOrdersData : ordersData;
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        allOrders[orderIndex].status = 'cancelled';
        showNotification('Заказ отменен');
        
        if (isAdminMode) {
            renderAdminOrders();
        } else {
            renderOrders();
            updateOrderStats();
            updatePagination();
        }
    }
}

function trackOrder(orderId) {
    const allOrders = isAdminMode ? adminOrdersData : ordersData;
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    viewOrderDetails(orderId);
    
    setTimeout(() => {
        const trackingSection = document.querySelector('.tracking-info');
        if (trackingSection) {
            trackingSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

function initOrderSupportChat() {
    if (document.querySelector('.consultant-chat-widget')) return;

    const widget = document.createElement('div');
    widget.className = 'consultant-chat-widget order-support-widget';
    widget.innerHTML = `
        <section class="consultant-chat-panel" aria-label="Чат с поддержкой по заказу" aria-hidden="true">
            <header class="consultant-chat-header">
                <div class="consultant-avatar" aria-hidden="true">
                    <i class="fas fa-headset"></i>
                </div>
                <div>
                    <span>Order support</span>
                    <strong>Поддержка по заказу</strong>
                </div>
                <button class="consultant-chat-close" type="button" aria-label="Закрыть чат">
                    <i class="fas fa-times"></i>
                </button>
            </header>
            <div class="consultant-chat-body" id="orderSupportChatBody">
                <div class="consultant-message consultant-message-bot">
                    Напишите вопрос или откройте чат из карточки заказа, чтобы мы сразу увидели его номер.
                </div>
            </div>
            <form class="consultant-chat-form" id="orderSupportChatForm">
                <label class="sr-only" for="orderSupportMessage">Сообщение в поддержку</label>
                <input id="orderSupportMessage" type="text" placeholder="Напишите вопрос по заказу..." autocomplete="off">
                <button type="submit" aria-label="Отправить сообщение">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </form>
        </section>

        <button class="consultant-chat-trigger" type="button" aria-label="Открыть чат с поддержкой">
            <i class="fas fa-headset"></i>
            <span class="consultant-chat-dot" aria-hidden="true"></span>
        </button>
    `;

    document.body.appendChild(widget);

    const panel = widget.querySelector('.consultant-chat-panel');
    const trigger = widget.querySelector('.consultant-chat-trigger');
    const closeButton = widget.querySelector('.consultant-chat-close');
    const form = widget.querySelector('#orderSupportChatForm');
    const input = widget.querySelector('#orderSupportMessage');

    trigger.addEventListener('click', () => openOrderSupportChat());
    closeButton.addEventListener('click', closeOrderSupportChat);

    form.addEventListener('submit', event => {
        event.preventDefault();
        sendOrderSupportMessage(input.value);
        input.value = '';
    });

    panel.setAttribute('aria-hidden', 'true');
}

function openOrderSupportChat(orderId = '') {
    const widget = document.querySelector('.order-support-widget');
    if (!widget) return;

    widget.classList.add('chat-open');
    widget.querySelector('.consultant-chat-panel')?.setAttribute('aria-hidden', 'false');

    if (orderId) {
        const order = ordersData.find(item => item.id === orderId);
        const message = `Здравствуйте, нужна помощь по заказу #${orderId}${order ? ` от ${order.deliveryDate}` : ''}.`;
        sendOrderSupportMessage(message, true);
    }

    window.setTimeout(() => {
        document.getElementById('orderSupportMessage')?.focus();
    }, 120);
}

function closeOrderSupportChat() {
    const widget = document.querySelector('.order-support-widget');
    widget?.classList.remove('chat-open');
    widget?.querySelector('.consultant-chat-panel')?.setAttribute('aria-hidden', 'true');
}

function sendOrderSupportMessage(message, skipDuplicate = false) {
    const cleanMessage = message.trim();
    const body = document.getElementById('orderSupportChatBody');
    if (!cleanMessage || !body) return;

    if (skipDuplicate) {
        const userMessages = [...body.querySelectorAll('.consultant-message-user')];
        const lastUserMessage = userMessages[userMessages.length - 1];
        if (lastUserMessage?.textContent === cleanMessage) return;
    }

    addOrderSupportChatMessage(cleanMessage, 'user');

    window.setTimeout(() => {
        addOrderSupportChatMessage('Спасибо, номер заказа передан консультанту. Мы проверим статус и ответим здесь.', 'bot');
    }, 420);
}

function addOrderSupportChatMessage(message, type) {
    const body = document.getElementById('orderSupportChatBody');
    if (!body) return;

    const messageElement = document.createElement('div');
    messageElement.className = `consultant-message consultant-message-${type}`;
    messageElement.textContent = message;
    body.appendChild(messageElement);
    body.scrollTop = body.scrollHeight;
}

function initOrderRatingModal() {
    if (document.getElementById('orderRatingModal')) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'orderRatingModal';
    modal.innerHTML = `
        <div class="modal-content order-rating-modal-content">
            <div class="modal-header">
                <h2>Оценка заказа</h2>
                <button class="close-modal" type="button" data-close-rating>&times;</button>
            </div>
            <div class="modal-body">
                <form id="orderRatingForm" class="order-rating-form">
                    <input type="hidden" id="ratingOrderId">
                    <div class="rating-stars" aria-label="Оценка заказа">
                        ${[1, 2, 3, 4, 5].map(value => `
                            <button type="button" class="rating-star" data-rating="${value}" aria-label="${value} из 5">
                                <i class="fas fa-star"></i>
                            </button>
                        `).join('')}
                    </div>
                    <p class="rating-helper">Оцените свежесть продукта, упаковку и доставку.</p>
                    <div class="form-group">
                        <label for="ratingComment">Комментарий</label>
                        <textarea id="ratingComment" rows="4" placeholder="Что понравилось или что можно улучшить?"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Сохранить оценку</button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('[data-close-rating]').forEach(button => {
        button.addEventListener('click', closeRatingModal);
    });

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeRatingModal();
        }
    });

    modal.querySelectorAll('.rating-star').forEach(button => {
        button.addEventListener('click', () => setRatingValue(Number(button.dataset.rating)));
    });

    modal.querySelector('#orderRatingForm').addEventListener('submit', event => {
        event.preventDefault();
        saveOrderRating();
    });
}

function openRatingModal(orderId) {
    const order = ordersData.find(item => item.id === orderId);
    if (!order || order.status !== 'delivered') {
        showNotification('Оценить можно только доставленный заказ', 'warning');
        return;
    }

    const modal = document.getElementById('orderRatingModal');
    const currentRating = orderRatings[orderId] || { rating: 5, comment: '' };

    document.getElementById('ratingOrderId').value = orderId;
    document.getElementById('ratingComment').value = currentRating.comment || '';
    modal.dataset.rating = currentRating.rating;
    setRatingValue(Number(currentRating.rating));

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRatingModal() {
    const modal = document.getElementById('orderRatingModal');
    modal?.classList.remove('active');
    document.body.style.overflow = orderDetailsModal.classList.contains('active') ? 'hidden' : '';
}

function setRatingValue(value) {
    const modal = document.getElementById('orderRatingModal');
    modal.dataset.rating = value;

    modal.querySelectorAll('.rating-star').forEach(button => {
        button.classList.toggle('active', Number(button.dataset.rating) <= value);
    });
}

function saveOrderRating() {
    const modal = document.getElementById('orderRatingModal');
    const orderId = document.getElementById('ratingOrderId').value;
    const rating = Number(modal.dataset.rating || 5);
    const comment = document.getElementById('ratingComment').value.trim();

    orderRatings[orderId] = {
        rating,
        comment,
        createdAt: orderRatings[orderId]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    window.FishSite?.request?.('/order-ratings', {
        method: 'POST',
        body: JSON.stringify({ orderId, rating, comment })
    }).catch(() => {});
    closeRatingModal();
    renderOrders();
    updatePagination();

    if (orderDetailsModal.classList.contains('active')) {
        viewOrderDetails(orderId);
    }

    showNotification('Спасибо, оценка заказа сохранена!');
}

function renderStars(rating) {
    return Array.from({ length: 5 }, (_, index) => index < Number(rating) ? '★' : '☆').join('');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else if (type === 'warning') {
        notification.style.background = '#FF9800';
    } else if (type === 'info') {
        notification.style.background = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем CSS для переключателя режима
const modeStyles = document.createElement('style');
modeStyles.textContent = `
    .mode-switcher {
        display: flex;
        align-items: center;
        margin-right: 15px;
    }
    
    .mode-switcher .btn-sm {
        padding: 8px 15px;
        font-size: 0.9rem;
        border-radius: 20px;
    }
    
    .mode-switcher .btn-sm i {
        margin-right: 5px;
    }
    
    .mode-panel {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        box-shadow: var(--shadow);
    }
    
    .mode-info {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .mode-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    .mode-badge.admin-mode {
        background: rgba(255, 255, 255, 0.3);
    }
    
    .mode-description {
        opacity: 0.9;
        font-size: 0.9rem;
    }
    
    .admin-filters {
        background: var(--white);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        box-shadow: var(--shadow);
    }
    
    .filters-row {
        display: flex;
        gap: 15px;
        align-items: center;
        flex-wrap: wrap;
    }
    
    .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .filter-group label {
        font-weight: 500;
        color: var(--text-dark);
        white-space: nowrap;
        font-size: 0.9rem;
    }
    
    .filter-select {
        padding: 8px 12px;
        border: 1px solid var(--gray-light);
        border-radius: 6px;
        background: var(--white);
        min-width: 150px;
        font-size: 0.9rem;
    }
    
    .admin-orders-table {
        margin-top: 20px;
    }
    
    .table-container {
        overflow-x: auto;
        background: var(--white);
        border-radius: 12px;
        box-shadow: var(--shadow);
        margin-bottom: 20px;
    }
    
    .orders-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 800px;
    }
    
    .orders-table th {
        background: var(--background-light);
        padding: 15px;
        text-align: left;
        font-weight: 600;
        color: var(--text-dark);
        border-bottom: 2px solid var(--gray-light);
        font-size: 0.9rem;
    }
    
    .orders-table td {
        padding: 15px;
        border-bottom: 1px solid var(--gray-light);
        font-size: 0.9rem;
    }
    
    .orders-table tr:hover {
        background: var(--background-light);
    }
    
    .orders-table .small-text {
        font-size: 0.85rem;
        color: var(--text-light);
        margin-top: 4px;
    }
    
    .customer-info {
        line-height: 1.4;
    }
    
    @media (max-width: 768px) {
        .mode-switcher {
            margin-right: 10px;
        }
        
        .mode-switcher .btn-sm {
            padding: 6px 12px;
            font-size: 0.8rem;
        }
        
        .filters-row {
            flex-direction: column;
            align-items: stretch;
        }
        
        .filter-group {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .filter-select {
            width: 100%;
        }
        
        .orders-table th,
        .orders-table td {
            padding: 10px;
            font-size: 0.85rem;
        }
    }
`;
document.head.appendChild(modeStyles);
