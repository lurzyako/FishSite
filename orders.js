// orders.js - Логика для страницы заказов с переключателем режима

// Данные заказов (клиентские)
const ordersData = [
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
const adminOrdersData = [
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
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupNavigation();
    updateCartCount();
    updateOrderStats();
    renderOrders();
    updatePagination();
    
    // Инициализируем кнопку переключения режима
    initModeSwitcher();
    
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
});

// Инициализация переключателя режима
function initModeSwitcher() {
    // Сначала показываем кнопку переключения (для всех пользователей)
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
    const userData = JSON.parse(localStorage.getItem('user')) || {
        name: "Ольга Ивановна",
        email: "olga@example.com",
        initials: "ОИ"
    };
    
    const userNameElements = document.querySelectorAll('#user-name, #profile-name');
    const userEmailElements = document.querySelectorAll('#user-email, #profile-email');
    const userAvatarElements = document.querySelectorAll('#user-avatar, #profile-avatar');
    
    userNameElements.forEach(el => el.textContent = userData.name);
    userEmailElements.forEach(el => el.textContent = userData.email);
    userAvatarElements.forEach(el => el.textContent = userData.initials);
    
    return userData;
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
            localStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
            window.location.href = 'index.html';
        });
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
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
                <a href="index.html#catalog" class="btn btn-primary">Сделать первый заказ</a>
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
    
    orderCard.innerHTML = `
        <div class="order-header">
            <div>
                <div class="order-id">Заказ #${order.id}</div>
                <div class="order-date">${formattedDate}</div>
            </div>
            <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
        </div>
        
        <div class="order-products">
            ${order.products.slice(0, 3).map(product => `
                <div class="product-item">
                    <div class="product-icon">${product.image}</div>
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
            ${order.products.length > 3 ? `
                <div class="product-item" style="justify-content: center; background: transparent;">
                    <span style="color: var(--text-light);">+ еще ${order.products.length - 3} товаров</span>
                </div>
            ` : ''}
        </div>
        
        <div class="order-details">
            <div class="detail-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${order.address}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-clock"></i>
                <span>${order.deliveryTime}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-credit-card"></i>
                <span>${order.paymentMethod}</span>
            </div>
        </div>
        
        <div class="order-total">
            <div class="total-label">Итого к оплате</div>
            <div class="total-amount">${order.total.toLocaleString()} руб.</div>
        </div>
        
        <div class="order-actions">
            <button class="btn btn-outline" onclick="viewOrderDetails('${order.id}')">
                <i class="fas fa-eye"></i> Подробнее
            </button>
            ${order.status === 'delivered' ? `
                <button class="btn btn-primary" onclick="repeatOrder('${order.id}')">
                    <i class="fas fa-redo"></i> Повторить
                </button>
            ` : order.status === 'new' || order.status === 'processing' ? `
                <button class="btn btn-secondary" onclick="cancelOrder('${order.id}')">
                    <i class="fas fa-times"></i> Отменить
                </button>
            ` : ''}
            <button class="btn btn-outline" onclick="trackOrder('${order.id}')">
                <i class="fas fa-truck"></i> Отследить
            </button>
        </div>
    `;
    
    return orderCard;
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
        'processing': 'В обработке',
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
                            <div class="product-icon">${product.image}</div>
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

function closeOrderDetailsModal() {
    orderDetailsModal.classList.remove('active');
    document.body.style.overflow = '';
}

function getStepIcon(stepIndex) {
    const icons = ['shopping-cart', 'box', 'shipping-fast', 'check-circle'];
    return icons[stepIndex] || 'circle';
}

function repeatOrder(orderId) {
    const allOrders = isAdminMode ? adminOrdersData : ordersData;
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    order.products.forEach(product => {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
                unit: product.unit,
                image: product.image
            });
        }
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
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