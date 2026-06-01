const CRM_STORAGE_KEY = 'crmOrders';
const RATING_STORAGE_KEY = 'orderRatings';
const ORDER_STATUSES = ['new', 'confirmed', 'processing', 'courier', 'delivered', 'cancelled'];
let adminProducts = [];
let chatThreads = [];
let selectedChatThreadId = null;
let selectedChatMessages = [];
let adminChatPollTimer = null;

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

document.addEventListener('DOMContentLoaded', async () => {
    await window.FishSite?.init?.();
    if (!guardAdminAccess()) return;

    loadAdminUser();
    setupAdminNavigation();
    await loadCrmData();
    renderAdminCrm();
});

window.addEventListener('beforeunload', stopAdminChatPolling);

function guardAdminAccess() {
    const user = window.FishSite?.getCurrentUser?.();

    if (user?.role === 'admin') {
        return true;
    }

    sessionStorage.setItem('adminAccessDenied', 'true');
    window.location.href = '../index.html';
    return false;
}

function loadAdminUser() {
    const user = window.FishSite?.getCurrentUser?.() || {};

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
        window.FishSite?.logout?.();
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
    document.getElementById('adminProductForm')?.addEventListener('submit', handleProductSubmit);
    document.getElementById('adminProductReset')?.addEventListener('click', resetProductForm);
    document.getElementById('adminProductImageFile')?.addEventListener('change', handleProductImageUpload);
    document.getElementById('adminChatRefresh')?.addEventListener('click', loadAndRenderAdminChat);
    document.getElementById('adminChatForm')?.addEventListener('submit', handleAdminChatSubmit);
}

async function loadCrmData() {
    if (window.FishSite?.request) {
        try {
            const overview = await window.FishSite.request('/admin/overview');
            crmOrders = overview.orders || [];
            adminProducts = await window.FishSite.request('/admin/products');
            chatThreads = await window.FishSite.request('/admin/chat/threads');
            orderRatings = Object.fromEntries((overview.ratings || []).map(item => [
                item.order_number,
                { rating: item.rating, comment: item.comment, createdAt: item.created_at }
            ]));
        } catch {
            crmOrders = defaultCrmOrders;
            orderRatings = defaultRatings;
        }
    } else {
        crmOrders = defaultCrmOrders;
        orderRatings = defaultRatings;
    }
}

function renderAdminCrm() {
    renderMetrics();
    renderPipeline();
    renderRatingFeed();
    renderOrdersTable();
    renderClients();
    renderRatingList();
    renderProductsTable();
    renderChatThreads();
}

function showAdminView(viewName) {
    document.querySelectorAll('.admin-view').forEach(view => {
        view.classList.toggle('active', view.id === `admin-view-${viewName}`);
    });
    if (viewName === 'chat') {
        loadAndRenderAdminChat();
        startAdminChatPolling();
    } else {
        stopAdminChatPolling();
    }
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
    const statuses = ORDER_STATUSES;

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
                        ${ORDER_STATUSES.map(status => `
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
        select.addEventListener('change', async event => {
            const order = crmOrders.find(item => item.id === event.target.dataset.orderId);
            if (!order) return;

            const nextStatus = event.target.value;
            try {
                const updatedOrder = await window.FishSite.request('/admin/orders/status', {
                    method: 'POST',
                    body: JSON.stringify({ orderId: order.id, status: nextStatus })
                });
                Object.assign(order, updatedOrder);
            } catch {
                order.status = nextStatus;
                persistOrders();
            }
            renderAdminCrm();
        });
    });

    tbody.querySelectorAll('.admin-note-btn').forEach(button => {
        button.addEventListener('click', () => editManagerNote(button.dataset.orderId));
    });
}

function renderProductsTable() {
    const tbody = document.getElementById('adminProductsBody');
    if (!tbody) return;

    if (!adminProducts.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">Товары пока не загружены.</td></tr>';
        return;
    }

    tbody.innerHTML = adminProducts.map(product => `
        <tr>
            <td>
                <strong>${product.name}</strong>
                <div class="small-text">${product.active ? 'Активен' : 'Скрыт'} · популярность ${product.popularity || 0}</div>
            </td>
            <td>${getCategoryText(product.category)}</td>
            <td>${Number(product.price).toLocaleString()} руб.</td>
            <td>${Number(product.stock || 0).toLocaleString('ru-RU')} </td>
            <td>
                <button class="btn btn-outline admin-product-edit" type="button" data-product-id="${product.id}">
                    <i class="fas fa-pen"></i> Изменить
                </button>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.admin-product-edit').forEach(button => {
        button.addEventListener('click', () => fillProductForm(button.dataset.productId));
    });
}

function fillProductForm(productId) {
    const product = adminProducts.find(item => Number(item.id) === Number(productId));
    if (!product) return;

    document.getElementById('adminProductId').value = product.id;
    document.getElementById('adminProductName').value = product.name || '';
    document.getElementById('adminProductCategory').value = product.category || 'fresh';
    document.getElementById('adminProductPrice').value = product.price || 0;
    document.getElementById('adminProductStock').value = product.stock || 0;
    document.getElementById('adminProductPopularity').value = product.popularity || 0;
    document.getElementById('adminProductImage').value = product.image || '';
    document.getElementById('adminProductDescription').value = product.description || '';
    document.getElementById('adminProductWeight').value = product.weight || '';
    document.getElementById('adminProductOrigin').value = product.origin || '';
    document.getElementById('adminProductStorage').value = product.storage || '';
    document.getElementById('adminProductPopular').checked = Boolean(product.popular);
    document.getElementById('adminProductActive').checked = product.active !== false;
}

function resetProductForm() {
    document.getElementById('adminProductForm')?.reset();
    document.getElementById('adminProductId').value = '';
    document.getElementById('adminProductActive').checked = true;
}

async function handleProductSubmit(event) {
    event.preventDefault();
    const payload = {
        id: Number(document.getElementById('adminProductId').value) || undefined,
        name: document.getElementById('adminProductName').value,
        category: document.getElementById('adminProductCategory').value,
        price: Number(document.getElementById('adminProductPrice').value),
        stock: Number(document.getElementById('adminProductStock').value),
        popularity: Number(document.getElementById('adminProductPopularity').value),
        image: document.getElementById('adminProductImage').value,
        description: document.getElementById('adminProductDescription').value,
        weight: document.getElementById('adminProductWeight').value,
        origin: document.getElementById('adminProductOrigin').value,
        storage: document.getElementById('adminProductStorage').value,
        popular: document.getElementById('adminProductPopular').checked,
        active: document.getElementById('adminProductActive').checked
    };

    const savedProduct = await window.FishSite.request('/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    const existingIndex = adminProducts.findIndex(item => Number(item.id) === Number(savedProduct.id));
    if (existingIndex >= 0) {
        adminProducts[existingIndex] = savedProduct;
    } else {
        adminProducts.unshift(savedProduct);
    }
    resetProductForm();
    renderProductsTable();
}

async function handleProductImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 5 МБ.');
        event.target.value = '';
        return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    const result = await window.FishSite.request('/admin/products/upload-image', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, dataUrl })
    });
    document.getElementById('adminProductImage').value = result.path;
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function getCategoryText(category) {
    return {
        fresh: 'Охлажденная рыба',
        frozen: 'Замороженная рыба',
        seafood: 'Морепродукты',
        fillets: 'Филе и стейки'
    }[category] || category;
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

async function loadAndRenderAdminChat() {
    try {
        chatThreads = await window.FishSite.request('/admin/chat/threads');
        renderChatThreads();
        if (selectedChatThreadId && chatThreads.some(thread => Number(thread.id) === Number(selectedChatThreadId))) {
            await selectChatThread(selectedChatThreadId);
        } else if (chatThreads.length) {
            await selectChatThread(chatThreads[0].id);
        } else {
            selectedChatThreadId = null;
            selectedChatMessages = [];
            renderChatConversation();
        }
    } catch {
        renderChatError('Не удалось загрузить диалоги.');
    }
}

function startAdminChatPolling() {
    stopAdminChatPolling();
    adminChatPollTimer = window.setInterval(async () => {
        const chatView = document.getElementById('admin-view-chat');
        if (!chatView?.classList.contains('active')) {
            stopAdminChatPolling();
            return;
        }
        await loadAndRenderAdminChat();
    }, 7000);
}

function stopAdminChatPolling() {
    if (!adminChatPollTimer) return;
    window.clearInterval(adminChatPollTimer);
    adminChatPollTimer = null;
}

function renderChatThreads() {
    const container = document.getElementById('adminChatThreads');
    if (!container) return;

    if (!chatThreads.length) {
        container.innerHTML = '<p class="admin-empty">Диалогов пока нет.</p>';
        return;
    }

    container.innerHTML = chatThreads.map(thread => `
        <button class="admin-chat-thread ${Number(thread.id) === Number(selectedChatThreadId) ? 'active' : ''}" type="button" data-thread-id="${thread.id}">
            <span>
                <strong>${escapeHtml(thread.customerName || 'Гость сайта')}</strong>
                <small>${thread.customerEmail ? escapeHtml(thread.customerEmail) : 'Гость без email'}</small>
            </span>
            <em class="admin-chat-status ${thread.status === 'open' ? 'open' : 'closed'}">${thread.status === 'open' ? 'Открыт' : 'Закрыт'}</em>
            ${thread.unreadAdmin ? `<b>${thread.unreadAdmin}</b>` : ''}
        </button>
    `).join('');

    container.querySelectorAll('.admin-chat-thread').forEach(button => {
        button.addEventListener('click', () => selectChatThread(button.dataset.threadId));
    });
}

async function selectChatThread(threadId) {
    selectedChatThreadId = Number(threadId);
    try {
        const data = await window.FishSite.request(`/admin/chat/messages?threadId=${encodeURIComponent(selectedChatThreadId)}`);
        selectedChatMessages = data.messages || [];
        const index = chatThreads.findIndex(thread => Number(thread.id) === Number(data.thread?.id));
        if (index >= 0) chatThreads[index] = data.thread;
        renderChatThreads();
        renderChatConversation(data.thread);
    } catch {
        renderChatError('Не удалось открыть диалог.');
    }
}

function renderChatConversation(thread = chatThreads.find(item => Number(item.id) === Number(selectedChatThreadId))) {
    const head = document.getElementById('adminChatHead');
    const messages = document.getElementById('adminChatMessages');
    const input = document.getElementById('adminChatInput');
    const send = document.getElementById('adminChatSend');
    if (!head || !messages || !input || !send) return;

    if (!thread) {
        head.innerHTML = '<span>Выберите диалог</span><strong>Сообщения появятся здесь</strong>';
        messages.innerHTML = '<p class="admin-empty">Нет активного диалога.</p>';
        input.disabled = true;
        send.disabled = true;
        return;
    }

    head.innerHTML = `
        <span>${thread.status === 'open' ? 'Открытый диалог' : 'Закрытый диалог'}</span>
        <strong>${escapeHtml(thread.customerName || 'Гость сайта')}</strong>
        <small>${thread.customerEmail ? escapeHtml(thread.customerEmail) : 'Без email'} · #${thread.id}</small>
    `;

    messages.innerHTML = selectedChatMessages.length
        ? selectedChatMessages.map(message => `
            <div class="admin-chat-message ${message.senderRole === 'admin' ? 'admin' : 'customer'}">
                <span>${message.senderRole === 'admin' ? 'Консультант' : 'Клиент'}</span>
                <p>${escapeHtml(message.body)}</p>
                <small>${formatChatDate(message.createdAt)}</small>
            </div>
        `).join('')
        : '<p class="admin-empty">Сообщений пока нет.</p>';
    messages.scrollTop = messages.scrollHeight;
    input.disabled = thread.status !== 'open';
    send.disabled = thread.status !== 'open';
}

async function handleAdminChatSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('adminChatInput');
    const message = input?.value.trim();
    if (!selectedChatThreadId || !message) return;

    input.disabled = true;
    try {
        await window.FishSite.request('/admin/chat/messages', {
            method: 'POST',
            body: JSON.stringify({ threadId: selectedChatThreadId, message })
        });
        input.value = '';
        await selectChatThread(selectedChatThreadId);
    } catch {
        alert('Не удалось отправить сообщение.');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

function renderChatError(message) {
    const container = document.getElementById('adminChatMessages');
    if (container) container.innerHTML = `<p class="admin-empty">${escapeHtml(message)}</p>`;
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
    // Manager notes are kept in memory in this demo until a dedicated CRM API is added.
}

function getStatusText(status) {
    const statusMap = {
        new: 'Новый',
        confirmed: 'Подтвержден',
        processing: 'Собирается',
        courier: 'Передан курьеру',
        delivered: 'Доставлен',
        cancelled: 'Отменен'
    };

    return statusMap[status] || status;
}

function renderStars(rating) {
    return Array.from({ length: 5 }, (_, index) => index < Number(rating) ? '★' : '☆').join('');
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[character]));
}

function formatChatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
