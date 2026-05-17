const CRM_STORAGE_KEY = 'crmOrders';
const RATING_STORAGE_KEY = 'orderRatings';

const defaultCrmOrders = [
    {
        id: 'FISH-001245',
        date: '15 января 2024',
        status: 'delivered',
        customer: 'Иван Иванов',
        phone: '+7 (999) 123-45-67',
        email: 'client@example.com',
        total: 3250,
        address: 'г. Екатеринбург, ул. Репина, д. 15, кв. 42',
        paymentMethod: 'Картой при получении',
        managerNote: 'Постоянный клиент, любит охлажденную рыбу.'
    },
    {
        id: 'FISH-001244',
        date: '14 января 2024',
        status: 'processing',
        customer: 'Иван Иванов',
        phone: '+7 (999) 123-45-67',
        email: 'client@example.com',
        total: 3490,
        address: 'г. Екатеринбург, ул. Репина, д. 15, кв. 42',
        paymentMethod: 'Онлайн оплата',
        managerNote: 'Проверить временное окно до 18:00.'
    },
    {
        id: 'FISH-001241',
        date: '11 января 2024',
        status: 'delivered',
        customer: 'Ольга Петрова',
        phone: '+7 (999) 876-54-32',
        email: 'olga@example.com',
        total: 1150,
        address: 'г. Екатеринбург, ул. Кирова, д. 8, кв. 7',
        paymentMethod: 'Онлайн оплата',
        managerNote: 'Предлагать икру и морепродукты.'
    },
    {
        id: 'FISH-001240',
        date: '10 января 2024',
        status: 'new',
        customer: 'Алексей Смирнов',
        phone: '+7 (999) 555-44-33',
        email: 'alex@example.com',
        total: 1650,
        address: 'г. Екатеринбург, ул. Свердлова, д. 20, кв. 15',
        paymentMethod: 'Картой при получении',
        managerNote: 'Новый клиент, уточнить удобный способ связи.'
    }
];

const defaultRatings = {
    'FISH-001245': {
        rating: 5,
        comment: 'Все приехало холодным и аккуратно упакованным.',
        createdAt: '2024-01-16T09:30:00.000Z'
    },
    'FISH-001241': {
        rating: 4,
        comment: 'Хорошая упаковка, хотелось бы больше вариантов времени.',
        createdAt: '2024-01-12T12:20:00.000Z'
    }
};

let crmOrders = [];
let orderRatings = {};

document.addEventListener('DOMContentLoaded', () => {
    if (!guardAdminAccess()) return;

    loadAdminUser();
    setupAdminNavigation();
    loadCrmData();
    renderAdminCrm();
});

function guardAdminAccess() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (user?.role === 'admin') {
        return true;
    }

    sessionStorage.setItem('adminAccessDenied', 'true');
    window.location.href = '../index.html';
    return false;
}

function loadAdminUser() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    document.querySelectorAll('#user-name').forEach(element => {
        element.textContent = user.name || 'Администратор';
    });

    document.querySelectorAll('#user-email').forEach(element => {
        element.textContent = user.email || 'admin@fishsite.local';
    });

    document.querySelectorAll('#user-avatar').forEach(element => {
        element.textContent = user.initials || 'АД';
    });
}

function setupAdminNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    const userAvatar = document.getElementById('user-avatar');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    const navButtons = document.querySelectorAll('.admin-nav-btn');

    mobileMenuToggle?.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        nav?.classList.toggle('active');
    });

    userAvatar?.addEventListener('click', event => {
        event.stopPropagation();
        userDropdown?.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        userDropdown?.classList.remove('active');
    });

    logoutBtn?.addEventListener('click', event => {
        event.preventDefault();
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        window.location.href = '../index.html';
    });

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            showAdminView(button.dataset.adminView);
        });
    });

    document.getElementById('adminOrderSearch')?.addEventListener('input', renderOrdersTable);
}

function loadCrmData() {
    crmOrders = JSON.parse(localStorage.getItem(CRM_STORAGE_KEY) || 'null') || defaultCrmOrders;
    orderRatings = JSON.parse(localStorage.getItem(RATING_STORAGE_KEY) || 'null') || defaultRatings;

    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(crmOrders));
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(orderRatings));
}

function renderAdminCrm() {
    renderMetrics();
    renderPipeline();
    renderRatingFeed();
    renderOrdersTable();
    renderClients();
    renderRatingList();
}

function showAdminView(viewName) {
    document.querySelectorAll('.admin-view').forEach(view => {
        view.classList.toggle('active', view.id === `admin-view-${viewName}`);
    });
}

function renderMetrics() {
    const totalRevenue = crmOrders.reduce((sum, order) => sum + order.total, 0);
    const activeOrders = crmOrders.filter(order => ['new', 'processing'].includes(order.status)).length;
    const deliveredOrders = crmOrders.filter(order => order.status === 'delivered').length;
    const ratings = Object.values(orderRatings);
    const averageRating = ratings.length
        ? (ratings.reduce((sum, item) => sum + Number(item.rating), 0) / ratings.length).toFixed(1)
        : '0.0';

    const metrics = [
        { label: 'Выручка', value: `${totalRevenue.toLocaleString()} руб.`, icon: 'fa-ruble-sign' },
        { label: 'Активные заказы', value: activeOrders, icon: 'fa-box-open' },
        { label: 'Доставлено', value: deliveredOrders, icon: 'fa-check-circle' },
        { label: 'Средняя оценка', value: averageRating, icon: 'fa-star' }
    ];

    document.getElementById('adminMetrics').innerHTML = metrics.map(metric => `
        <article class="admin-metric-card">
            <i class="fas ${metric.icon}"></i>
            <span>${metric.label}</span>
            <strong>${metric.value}</strong>
        </article>
    `).join('');
}

function renderPipeline() {
    const statuses = ['new', 'processing', 'delivered', 'cancelled'];

    document.getElementById('adminPipeline').innerHTML = statuses.map(status => {
        const count = crmOrders.filter(order => order.status === status).length;
        return `
            <div class="admin-pipeline-row">
                <span class="order-status status-${status}">${getStatusText(status)}</span>
                <strong>${count}</strong>
            </div>
        `;
    }).join('');
}

function renderRatingFeed() {
    const feed = getRatingItems().slice(0, 3);
    const container = document.getElementById('adminRatingFeed');

    if (!feed.length) {
        container.innerHTML = '<p class="admin-empty">Оценок пока нет.</p>';
        return;
    }

    container.innerHTML = feed.map(item => renderRatingItem(item)).join('');
}

function renderOrdersTable() {
    const tbody = document.getElementById('adminOrdersBody');
    if (!tbody) return;

    const search = document.getElementById('adminOrderSearch')?.value.trim().toLowerCase() || '';
    const visibleOrders = crmOrders.filter(order => {
        if (!search) return true;
        return [order.id, order.customer, order.phone, order.email]
            .some(value => value.toLowerCase().includes(search));
    });

    tbody.innerHTML = visibleOrders.map(order => {
        const rating = orderRatings[order.id];
        return `
            <tr>
                <td>
                    <strong>${order.id}</strong>
                    <div class="small-text">${order.date}</div>
                </td>
                <td>
                    <strong>${order.customer}</strong>
                    <div class="small-text">${order.phone}</div>
                </td>
                <td>${order.total.toLocaleString()} руб.</td>
                <td>
                    <select class="admin-status-select" data-order-id="${order.id}">
                        ${['new', 'processing', 'delivered', 'cancelled'].map(status => `
                            <option value="${status}" ${order.status === status ? 'selected' : ''}>${getStatusText(status)}</option>
                        `).join('')}
                    </select>
                </td>
                <td>${rating ? `${renderStars(rating.rating)} <span class="small-text">${rating.rating}/5</span>` : '<span class="small-text">Нет оценки</span>'}</td>
                <td>
                    <button class="btn btn-outline admin-note-btn" type="button" data-order-id="${order.id}">
                        <i class="fas fa-pen"></i> Заметка
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.admin-status-select').forEach(select => {
        select.addEventListener('change', event => {
            const order = crmOrders.find(item => item.id === event.target.dataset.orderId);
            if (!order) return;

            order.status = event.target.value;
            persistOrders();
            renderAdminCrm();
        });
    });

    tbody.querySelectorAll('.admin-note-btn').forEach(button => {
        button.addEventListener('click', () => editManagerNote(button.dataset.orderId));
    });
}

function renderClients() {
    const clients = crmOrders.reduce((acc, order) => {
        if (!acc[order.email]) {
            acc[order.email] = {
                name: order.customer,
                email: order.email,
                phone: order.phone,
                orders: 0,
                total: 0,
                notes: []
            };
        }

        acc[order.email].orders += 1;
        acc[order.email].total += order.total;
        if (order.managerNote) acc[order.email].notes.push(order.managerNote);
        return acc;
    }, {});

    document.getElementById('adminClientList').innerHTML = Object.values(clients).map(client => `
        <article class="admin-client-card">
            <div>
                <span>Клиент</span>
                <h3>${client.name}</h3>
                <p>${client.phone} · ${client.email}</p>
            </div>
            <div class="admin-client-stats">
                <strong>${client.orders}</strong>
                <span>заказа</span>
            </div>
            <div class="admin-client-stats">
                <strong>${client.total.toLocaleString()} руб.</strong>
                <span>оборот</span>
            </div>
            <p class="admin-client-note">${client.notes[0] || 'Заметок пока нет.'}</p>
        </article>
    `).join('');
}

function renderRatingList() {
    const items = getRatingItems();
    const container = document.getElementById('adminRatingList');

    if (!items.length) {
        container.innerHTML = '<p class="admin-empty">Клиенты еще не оценивали заказы.</p>';
        return;
    }

    container.innerHTML = items.map(item => renderRatingItem(item)).join('');
}

function getRatingItems() {
    return Object.entries(orderRatings)
        .map(([orderId, rating]) => {
            const order = crmOrders.find(item => item.id === orderId);
            return order ? { ...rating, order } : null;
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderRatingItem(item) {
    return `
        <article class="admin-rating-card">
            <div>
                <span>${item.order.id} · ${item.order.customer}</span>
                <strong>${renderStars(item.rating)} ${item.rating}/5</strong>
            </div>
            <p>${item.comment || 'Без комментария.'}</p>
        </article>
    `;
}

function editManagerNote(orderId) {
    const order = crmOrders.find(item => item.id === orderId);
    if (!order) return;

    const note = window.prompt(`Внутренняя заметка по заказу ${order.id}`, order.managerNote || '');
    if (note === null) return;

    order.managerNote = note.trim();
    persistOrders();
    renderAdminCrm();
}

function persistOrders() {
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(crmOrders));
}

function getStatusText(status) {
    const statusMap = {
        new: 'Новый',
        processing: 'В обработке',
        delivered: 'Доставлен',
        cancelled: 'Отменен'
    };

    return statusMap[status] || status;
}

function renderStars(rating) {
    return Array.from({ length: 5 }, (_, index) => index < Number(rating) ? '★' : '☆').join('');
}
