// Общие функции для всех страниц ЛК
function loadUserData() {
    const userData = window.FishSite?.getCurrentUser?.() || {
        name: "Ольга Ивановна",
        email: "olga@example.com",
        initials: "ОИ",
        role: "customer"
    };
    
    // Обновляем данные на всех страницах
    const userNameElements = document.querySelectorAll('#user-name, #profile-name');
    const userEmailElements = document.querySelectorAll('#user-email, #profile-email');
    const userAvatarElements = document.querySelectorAll('#user-avatar, #profile-avatar');
    
    userNameElements.forEach(el => el.textContent = userData.name);
    userEmailElements.forEach(el => el.textContent = userData.email);
    userAvatarElements.forEach(el => el.textContent = userData.initials);
    updateAdminAccountLinks(userData);
    
    return userData;
}

function updateAdminAccountLinks(userData) {
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
        
        // Закрытие меню при клике вне его
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

// Функции для личного кабинета
async function getAccountOrders() {
    const userData = window.FishSite?.getCurrentUser?.();
    if (window.FishSite?.request && userData?.email) {
        try {
            return await window.FishSite.request(`/orders?email=${encodeURIComponent(userData.email)}`);
        } catch {
            return [];
        }
    }
    return [];
}

async function loadAccountStats() {
    const favorites = window.FishSite?.getFavoriteIds?.() || [];
    const orders = await getAccountOrders();
    
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

async function loadRecentOrders() {
    const orders = await getAccountOrders();
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
                ${(order.items || order.products || []).map(item => `
                    <div class="order-item">
                        <div class="order-item-image">${window.FishSite?.formatProductImage ? window.FishSite.formatProductImage(item, 'order-product-art') : item.image}</div>
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-quantity">${item.quantity} кг</div>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">${order.total} руб.</div>
                <div class="order-actions">
                    <a href="orders.html?order=${encodeURIComponent(order.id)}" class="btn btn-outline">Подробнее</a>
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
        'confirmed': 'Подтвержден',
        'processing': 'Собирается',
        'courier': 'Передан курьеру',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
}

async function loadAccountNotifications() {
    const accountContent = document.querySelector('.account-content');
    if (!accountContent || !window.FishSite?.request) return;

    let notifications = [];
    try {
        notifications = await window.FishSite.request('/notifications');
    } catch {
        return;
    }

    const panel = document.createElement('section');
    panel.className = 'account-orders-panel account-notifications-panel';
    panel.innerHTML = `
        <div class="account-orders-head">
            <div>
                <span>Notifications</span>
                <h3>Уведомления</h3>
            </div>
        </div>
        ${notifications.length ? notifications.slice(0, 5).map(item => `
            <article class="notification-card ${item.is_read ? '' : 'unread'}">
                <strong>${item.title}</strong>
                <p>${item.message}</p>
                <span>${item.created_at}</span>
            </article>
        `).join('') : '<p class="empty-state">Новых уведомлений пока нет.</p>'}
    `;
    accountContent.prepend(panel);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    await window.FishSite?.init?.();
    // Проверяем авторизацию
    const user = window.FishSite?.getCurrentUser?.();
    if (!user) {
        window.location.href = '/';
        return;
    }
    
    // Загружаем данные пользователя
    loadUserData();
    setupNavigation();
    await loadAccountStats();
    await loadRecentOrders();
    await loadAccountNotifications();
});
