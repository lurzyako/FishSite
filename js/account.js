// Общие функции для всех страниц ЛК
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user')) || {
        name: "Ольга Ивановна",
        email: "olga@example.com",
        initials: "ОИ"
    };
    
    // Обновляем данные на всех страницах
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
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
            window.location.href = '../index.html';
        });
    }
}

// Функции для личного кабинета
function loadAccountStats() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Обновляем статистику
    document.getElementById('total-favorites').textContent = favorites.length;
    document.getElementById('total-orders').textContent = orders.length;
    
    // Считаем общую сумму заказов
    const totalSpent = orders.reduce((total, order) => total + order.total, 0);
    document.getElementById('total-spent').textContent = totalSpent.toLocaleString();
    
    // Считаем количество доставок
    const deliveries = orders.filter(order => order.status === 'delivered').length;
    document.getElementById('total-deliveries').textContent = deliveries;
}

function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const recentOrdersContainer = document.getElementById('recent-orders');
    
    if (!recentOrdersContainer) return;
    
    recentOrdersContainer.innerHTML = '';
    
    if (orders.length === 0) {
        recentOrdersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Заказов пока нет</h3>
                <p>Совершите свой первый заказ и он появится здесь</p>
                <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
            </div>
        `;
        return;
    }
    
    // Показываем последние 3 заказа
    const recentOrders = orders.slice(0, 3);
    
    recentOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-number">Заказ #${order.id}</div>
                    <div class="order-date">${order.date}</div>
                </div>
                <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <div class="order-item-image">${item.image}</div>
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-quantity">${item.quantity} кг</div>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">${order.total} руб.</div>
                <div class="order-actions">
                    <a href="order-details.html?id=${order.id}" class="btn btn-outline">Подробнее</a>
                    <button class="btn btn-primary">Повторить заказ</button>
                </div>
            </div>
        `;
        
        recentOrdersContainer.appendChild(orderCard);
    });
}

function getStatusText(status) {
    const statusMap = {
        'new': 'Новый',
        'processing': 'В обработке',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = '../index.html';
        return;
    }
    
    // Загружаем данные пользователя
    loadUserData();
    setupNavigation();
    loadAccountStats();
    loadRecentOrders();
});
