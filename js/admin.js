const ORDER_STATUSES = ['new', 'confirmed', 'processing', 'courier', 'delivered', 'cancelled'];
let adminProducts = [];
let chatThreads = [];
let selectedChatThreadId = null;
let selectedChatMessages = [];
let adminChatPollTimer = null;
let adminStatistics = null;
let currentStatPeriod = '90';
let currentStatMetric = 'revenue';
let chartPointTooltip = null;

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
    window.location.href = '/';
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
    const cartIcon = document.querySelector('.cart-icon');
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
        window.location.href = '/';
    });

    cartIcon?.addEventListener('click', () => {
        window.location.href = 'catalog.html';
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
    document.querySelectorAll('.admin-stat-period-btn').forEach(button => {
        button.addEventListener('click', async () => {
            currentStatPeriod = button.dataset.statPeriod || '90';
            document.querySelectorAll('.admin-stat-period-btn').forEach(item => {
                item.classList.toggle('active', item === button);
            });
            await loadAdminStatistics(currentStatPeriod);
            renderStatistics();
        });
    });
    document.querySelectorAll('.admin-chart-mode-btn').forEach(button => {
        button.addEventListener('click', () => {
            currentStatMetric = button.dataset.statMetric || 'revenue';
            document.querySelectorAll('.admin-chart-mode-btn').forEach(item => {
                item.classList.toggle('active', item === button);
            });
            renderStatistics();
        });
    });
    document.getElementById('admin-view-statistics')?.addEventListener('click', event => {
        const target = event.target.closest('.admin-chart-hotspot');
        if (!target) return;
        selectStatHotspot(target);
        openStatDetailModal(target);
    });
    document.getElementById('admin-view-statistics')?.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const target = event.target.closest('.admin-chart-hotspot');
        if (!target) return;
        event.preventDefault();
        selectStatHotspot(target);
        openStatDetailModal(target);
    });
    document.getElementById('adminStatModalClose')?.addEventListener('click', closeStatDetailModal);
    document.getElementById('adminStatModal')?.addEventListener('click', event => {
        if (event.target.id === 'adminStatModal') closeStatDetailModal();
    });
    document.getElementById('adminStatModalBody')?.addEventListener('click', event => {
        const point = event.target.closest('.admin-stat-modal-point');
        if (!point) return;
        selectStatModalPoint(point);
    });
    document.getElementById('adminStatModalBody')?.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const point = event.target.closest('.admin-stat-modal-point');
        if (!point) return;
        event.preventDefault();
        selectStatModalPoint(point);
    });
    document.addEventListener('mouseover', event => {
        const point = event.target.closest('.admin-stat-modal-point');
        if (!point || point.contains(event.relatedTarget)) return;
        showChartPointTooltip(point);
    });
    document.addEventListener('mousemove', event => {
        if (!chartPointTooltip?.classList.contains('active')) return;
        positionChartPointTooltip(event.clientX, event.clientY);
    });
    document.addEventListener('mouseout', event => {
        const point = event.target.closest('.admin-stat-modal-point');
        if (!point || point.contains(event.relatedTarget)) return;
        hideChartPointTooltip();
    });
    document.addEventListener('focusin', event => {
        const point = event.target.closest('.admin-stat-modal-point');
        if (!point) return;
        showChartPointTooltip(point);
    });
    document.addEventListener('focusout', event => {
        const point = event.target.closest('.admin-stat-modal-point');
        if (!point) return;
        hideChartPointTooltip();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeStatDetailModal();
    });
}

async function loadCrmData() {
    if (window.FishSite?.request) {
        try {
            const overview = await window.FishSite.request('/admin/overview');
            crmOrders = overview.orders || [];
            adminProducts = await window.FishSite.request('/admin/products');
            chatThreads = await window.FishSite.request('/admin/chat/threads');
            adminStatistics = await window.FishSite.request(`/admin/statistics?period=${encodeURIComponent(currentStatPeriod)}`);
            orderRatings = Object.fromEntries((overview.ratings || []).map(item => [
                item.order_number,
                { rating: item.rating, comment: item.comment, createdAt: item.created_at }
            ]));
        } catch {
            crmOrders = [];
            adminProducts = [];
            chatThreads = [];
            adminStatistics = null;
            orderRatings = {};
            showAdminNotification('Не удалось загрузить данные CRM из базы', 'error');
        }
    } else {
        crmOrders = [];
        adminProducts = [];
        chatThreads = [];
        adminStatistics = null;
        orderRatings = {};
        showAdminNotification('API сайта недоступен', 'error');
    }
}

async function loadAdminStatistics(period = currentStatPeriod) {
    if (!window.FishSite?.request) return null;
    try {
        adminStatistics = await window.FishSite.request(`/admin/statistics?period=${encodeURIComponent(period)}`);
    } catch {
        adminStatistics = null;
    }
    return adminStatistics;
}

function renderAdminCrm() {
    renderMetrics();
    renderStatistics();
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
    } else if (viewName === 'statistics') {
        loadAdminStatistics(currentStatPeriod).then(renderStatistics);
        stopAdminChatPolling();
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

function renderStatistics() {
    const statGrid = document.getElementById('adminStatGrid');
    if (!statGrid) return;

    if (adminStatistics?.summary) {
        renderDatabaseStatistics(adminStatistics);
        return;
    }

    const orders = crmOrders.map(order => ({
        ...order,
        total: Number(order.total || 0),
        parsedDate: parseOrderDate(order.date)
    }));
    const validOrders = orders.filter(order => order.parsedDate);
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageCheck = orders.length ? Math.round(totalRevenue / orders.length) : 0;
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    const conversionRate = orders.length ? Math.round((deliveredOrders.length / orders.length) * 100) : 0;
    const ratings = Object.values(orderRatings);
    const averageRating = ratings.length
        ? (ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / ratings.length).toFixed(1)
        : '0.0';

    document.getElementById('adminStatPeriod').textContent = buildPeriodLabel(validOrders);
    updateStatInspector(
        'Сводка выбранного периода',
        `${orders.length} заказов · ${totalRevenue.toLocaleString('ru-RU')} руб.`,
        `Средний чек: ${averageCheck.toLocaleString('ru-RU')} руб. Нажмите на любой график для детализации.`
    );
    renderSummaryCharts({ orders, validOrders, ratings, totalRevenue, averageCheck, conversionRate, averageRating });

    renderRevenueChart(validOrders);
    renderStatusDonut(orders);
    renderCategoryChart(orders);
    renderPaymentChart(orders);
    renderRatingStats(ratings);
}

function selectStatHotspot(element) {
    document.querySelectorAll('.admin-chart-hotspot.is-active').forEach(item => {
        item.classList.remove('is-active');
    });
    element.classList.add('is-active');
    updateStatInspector(
        element.dataset.insightTitle || 'Показатель',
        element.dataset.insightBody || element.dataset.tooltip || '',
        element.dataset.insightMeta || 'Данные рассчитаны по выбранному периоду.'
    );
}

function updateStatInspector(title, body, meta) {
    const inspector = document.getElementById('adminStatInspector');
    if (!inspector) return;
    inspector.innerHTML = `
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(body)}</strong>
        <p>${escapeHtml(meta)}</p>
    `;
}

function updateDefaultStatInspector(statistics) {
    const summary = statistics?.summary || {};
    const ordersCount = Number(summary.orders_count || 0);
    const totalRevenue = Number(summary.revenue_rub || 0);
    const averageCheck = Number(summary.average_check_rub || 0);
    updateStatInspector(
        'Сводка выбранного периода',
        `${ordersCount} заказов · ${totalRevenue.toLocaleString('ru-RU')} руб.`,
        `Средний чек: ${averageCheck.toLocaleString('ru-RU')} руб. Нажмите на любой график для детализации.`
    );
}

function renderDatabaseStatistics(statistics) {
    const summary = statistics.summary || {};
    const timeSeries = (statistics.timeSeries || []).map(item => ({
        key: item.bucket,
        label: formatStatisticsBucket(item.bucket, statistics.bucket),
        orders: Number(item.orders_count || 0),
        revenue: Number(item.revenue_rub || 0),
        averageCheck: Number(item.average_check_rub || 0),
        delivered: Number(item.delivered_count || 0)
    }));
    const ratings = statistics.ratings || [];
    const ordersCount = Number(summary.orders_count || 0);
    const totalRevenue = Number(summary.revenue_rub || 0);
    const averageCheck = Number(summary.average_check_rub || 0);
    const deliveredCount = Number(summary.delivered_count || 0);
    const conversionRate = ordersCount ? Math.round((deliveredCount / ordersCount) * 100) : 0;
    const averageRating = Number(summary.average_rating || 0).toFixed(1);

    document.getElementById('adminStatPeriod').textContent = buildStatisticsPeriodLabel(statistics);
    updateDefaultStatInspector(statistics);
    renderSummaryCharts({
        orders: Array.from({ length: ordersCount }, (_, index) => ({ total: averageCheck, status: index < deliveredCount ? 'delivered' : 'new' })),
        validOrders: timeSeries.map(item => ({
            total: item.revenue,
            parsedDate: parseOrderDate(item.key)
        })),
        series: timeSeries,
        ratings: Array.from({ length: Number(summary.ratings_count || 0) }, () => ({ rating: averageRating })),
        totalRevenue,
        averageCheck,
        conversionRate,
        averageRating
    });

    renderRevenueChartFromSeries(timeSeries, statistics.bucket);
    renderStatusDonutFromEntries(statistics.statuses || []);
    renderCategoryChartFromEntries(statistics.categories || []);
    renderPaymentChartFromEntries(statistics.payments || []);
    renderRatingStatsFromEntries(ratings);
}

function renderSummaryCharts(stats) {
    const container = document.getElementById('adminStatGrid');
    if (!container) return;

    const orderSeries = stats.series
        ? stats.series.map(item => ({ key: item.key, label: item.label, value: item.orders }))
        : getMonthlySeries(stats.validOrders, () => 1);
    const revenueSeries = stats.series
        ? stats.series.map(item => ({ key: item.key, label: item.label, value: item.revenue }))
        : getMonthlySeries(stats.validOrders, order => order.total);
    const ratingValue = Math.min(100, Math.round((Number(stats.averageRating) / 5) * 100));
    const maxCheck = Math.max(1, stats.averageCheck, ...stats.orders.map(order => order.total));
    const averageCheckPercent = Math.min(100, Math.round((stats.averageCheck / maxCheck) * 100));

    const cards = [
        {
            key: 'orders',
            label: 'Динамика заказов',
            tooltip: `Заказов: ${stats.orders.length}`,
            meta: 'Количество заказов в выбранном периоде.',
            chart: renderSparklineSvg(orderSeries, '#0071e3')
        },
        {
            key: 'revenue',
            label: 'Динамика выручки',
            tooltip: `Выручка: ${stats.totalRevenue.toLocaleString('ru-RU')} руб.`,
            meta: 'Суммарная выручка по всем заказам выбранного периода.',
            chart: renderSparklineSvg(revenueSeries, '#0b7a75')
        },
        {
            key: 'averageCheck',
            label: 'Средний чек',
            tooltip: `Средний чек: ${stats.averageCheck.toLocaleString('ru-RU')} руб.`,
            meta: 'Средняя сумма заказа относительно максимального чека периода.',
            chart: renderGaugeSvg(averageCheckPercent, '#5ac8fa')
        },
        {
            key: 'delivery',
            label: 'Доставляемость',
            tooltip: `Доставлено: ${stats.conversionRate}% заказов`,
            meta: 'Доля заказов со статусом «Доставлен».',
            chart: renderGaugeSvg(stats.conversionRate, '#34c759')
        },
        {
            key: 'rating',
            label: 'Качество сервиса',
            tooltip: `Отзывы: ${stats.ratings.length}; средняя оценка: ${stats.averageRating}/5`,
            meta: 'Средняя оценка клиентов по отзывам.',
            chart: renderGaugeSvg(ratingValue, '#ffb020')
        }
    ];

    container.innerHTML = cards.map(card => `
        <article class="admin-stat-card admin-chart-hotspot" tabindex="0"
            data-tooltip="${escapeHtml(card.tooltip)}"
            data-insight-title="${escapeHtml(card.label)}"
            data-insight-body="${escapeHtml(card.tooltip)}"
            data-insight-meta="${escapeHtml(card.meta)}"
            data-detail-type="summary"
            data-detail-key="${escapeHtml(card.key)}">
            <span>${escapeHtml(card.label)}</span>
            <div class="admin-stat-visual">${card.chart}</div>
            <p>Наведите на график</p>
        </article>
    `).join('');
}

function renderRevenueChart(orders) {
    const container = document.getElementById('adminRevenueChart');
    if (!container) return;

    const monthMap = new Map();
    orders.forEach(order => {
        const key = getMonthKey(order.parsedDate);
        monthMap.set(key, (monthMap.get(key) || 0) + order.total);
    });

    const points = Array.from(monthMap.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .slice(-8)
        .map(([key, value]) => ({ key, value }));
    const maxValue = Math.max(1, ...points.map(point => point.value));

    if (!points.length) {
        container.innerHTML = '<p class="admin-empty">Недостаточно данных для графика.</p>';
        return;
    }

    container.innerHTML = points.map(point => `
        <div class="admin-chart-column admin-chart-hotspot" tabindex="0" data-tooltip="${escapeHtml(formatMonthKey(point.key))}: ${point.value.toLocaleString('ru-RU')} руб.">
            <div class="admin-chart-bar-wrap">
                <span class="admin-chart-bar" style="height: ${Math.max(8, Math.round(point.value / maxValue * 100))}%"></span>
            </div>
            <small>${escapeHtml(formatMonthKey(point.key))}</small>
        </div>
    `).join('');
}

function renderRevenueChartFromSeries(series, bucket) {
    const container = document.getElementById('adminRevenueChart');
    if (!container) return;

    if (!series.length) {
        container.innerHTML = '<p class="admin-empty">Недостаточно данных для графика.</p>';
        return;
    }

    const metric = getTimelineMetricConfig(currentStatMetric);
    document.getElementById('adminTimelineTitle').textContent = metric.title;
    const points = series.slice(-12).map((point, index, list) => {
        const value = metric.value(point);
        const previous = index > 0 ? metric.value(list[index - 1]) : null;
        const delta = previous === null ? null : value - previous;
        return {
            key: point.key,
            label: formatStatisticsBucket(point.key, bucket),
            value,
            body: metric.format(value),
            meta: `Заказов: ${point.orders}; выручка: ${point.revenue.toLocaleString('ru-RU')} руб.; средний чек: ${point.averageCheck.toLocaleString('ru-RU')} руб.; доставлено: ${point.delivered}`,
            delta,
            detailType: 'timeline',
            detailGroup: currentStatMetric
        };
    });
    container.innerHTML = renderInteractiveLineChart(points, {
        className: 'admin-timeline-line-chart',
        metricLabel: metric.label,
        selectedKey: points[points.length - 1]?.key,
        showPointValues: true,
        width: 940,
        height: 310,
        paddingX: 58,
        paddingTop: 38,
        paddingBottom: 62,
        includeHotspots: true
    });
}

function getTimelineMetricConfig(metric) {
    const configs = {
        revenue: {
            label: 'Выручка',
            title: 'Динамика выручки',
            value: point => Number(point.revenue || 0),
            format: value => `${Number(value).toLocaleString('ru-RU')} руб.`
        },
        orders: {
            label: 'Заказы',
            title: 'Динамика заказов',
            value: point => Number(point.orders || 0),
            format: value => `${Number(value).toLocaleString('ru-RU')} заказов`
        },
        averageCheck: {
            label: 'Средний чек',
            title: 'Динамика среднего чека',
            value: point => Number(point.averageCheck || 0),
            format: value => `${Number(value).toLocaleString('ru-RU')} руб.`
        },
        delivered: {
            label: 'Доставлено',
            title: 'Динамика доставленных заказов',
            value: point => Number(point.delivered || 0),
            format: value => `${Number(value).toLocaleString('ru-RU')} доставлено`
        }
    };
    return configs[metric] || configs.revenue;
}

function renderStatusDonutFromEntries(items) {
    const donut = document.getElementById('adminStatusDonut');
    const legend = document.getElementById('adminStatusLegend');
    if (!donut || !legend) return;

    const colors = {
        new: '#5ac8fa',
        confirmed: '#0071e3',
        processing: '#ffb020',
        courier: '#34c759',
        delivered: '#0b7a75',
        cancelled: '#ff5a5f'
    };
    const entries = items.map(item => ({
        status: item.status,
        label: getStatusText(item.status),
        count: Number(item.count || 0),
        color: colors[item.status] || '#8aa4b8',
        meta: 'Распределение заказов по текущему состоянию.',
        detailType: 'status',
        detailKey: item.status
    })).filter(item => item.count > 0);
    const total = entries.reduce((sum, item) => sum + item.count, 0);

    donut.innerHTML = renderDonutSvg(entries, total);
    legend.innerHTML = entries.map(item => {
        const percent = total ? Math.round((item.count / total) * 100) : 0;
        return `
        <div class="admin-legend-row admin-chart-hotspot" tabindex="0"
            data-tooltip="${escapeHtml(item.label)}: ${item.count} заказов, ${percent}%"
            data-insight-title="${escapeHtml(item.label)}"
            data-insight-body="${item.count} заказов · ${percent}%"
            data-insight-meta="${escapeHtml(`${item.meta} Всего в периоде: ${total} заказов.`)}"
            data-detail-type="status"
            data-detail-key="${escapeHtml(item.status)}">
            <span style="background: ${item.color}"></span>
            <p>${escapeHtml(item.label)}</p>
        </div>
        `;
    }).join('');
}

function renderCategoryChartFromEntries(items) {
    const container = document.getElementById('adminCategoryChart');
    if (!container) return;
    const totalRevenue = items.reduce((sum, item) => sum + Number(item.revenue_rub || 0), 0);
    renderHorizontalBars(
        container,
        items.map(item => ({
            label: getCategoryText(item.category),
            value: Number(item.revenue_rub || 0),
            suffix: 'руб.',
            title: getCategoryText(item.category),
            body: `${Number(item.revenue_rub || 0).toLocaleString('ru-RU')} руб. · ${formatShare(item.revenue_rub, totalRevenue)}`,
            meta: `Заказов с категорией: ${Number(item.orders_count || 0)}; количество: ${Number(item.quantity || 0).toLocaleString('ru-RU')}; доля выручки: ${formatShare(item.revenue_rub, totalRevenue)}.`,
            detailType: 'category',
            detailKey: item.category
        })).sort((a, b) => b.value - a.value)
    );
}

function renderPaymentChartFromEntries(items) {
    const container = document.getElementById('adminPaymentChart');
    if (!container) return;
    const totalOrders = items.reduce((sum, item) => sum + Number(item.count || 0), 0);
    renderHorizontalBars(
        container,
        items.map(item => ({
            label: item.label || item.payment_method || 'Не указан',
            value: Number(item.count || 0),
            suffix: 'заказов',
            title: item.label || item.payment_method || 'Не указан',
            body: `${Number(item.count || 0).toLocaleString('ru-RU')} заказов · ${formatShare(item.count, totalOrders)}`,
            meta: `Выручка по способу оплаты: ${Number(item.revenue_rub || 0).toLocaleString('ru-RU')} руб.; доля заказов: ${formatShare(item.count, totalOrders)}.`,
            detailType: 'payment',
            detailKey: item.payment_method || item.label || ''
        })).sort((a, b) => b.value - a.value)
    );
}

function renderRatingStatsFromEntries(items) {
    const container = document.getElementById('adminRatingStats');
    if (!container) return;
    const ratingMap = new Map(items.map(item => [Number(item.rating), Number(item.count || 0)]));
    const totalRatings = items.reduce((sum, item) => sum + Number(item.count || 0), 0);
    renderHorizontalBars(
        container,
        [5, 4, 3, 2, 1].map(rating => ({
            label: `${rating} ${rating === 1 ? 'звезда' : 'звезд'}`,
            value: ratingMap.get(rating) || 0,
            suffix: 'отзывов',
            title: `Оценка ${rating}/5`,
            body: `${Number(ratingMap.get(rating) || 0).toLocaleString('ru-RU')} отзывов · ${formatShare(ratingMap.get(rating), totalRatings)}`,
            meta: `Распределение клиентских оценок за выбранный период. Всего отзывов: ${totalRatings}.`,
            detailType: 'rating',
            detailKey: String(rating)
        }))
    );
}

function renderStatusDonut(orders) {
    const donut = document.getElementById('adminStatusDonut');
    const legend = document.getElementById('adminStatusLegend');
    if (!donut || !legend) return;

    const colors = {
        new: '#5ac8fa',
        confirmed: '#0071e3',
        processing: '#ffb020',
        courier: '#34c759',
        delivered: '#0b7a75',
        cancelled: '#ff5a5f'
    };
    const entries = ORDER_STATUSES.map(status => ({
        status,
        label: getStatusText(status),
        count: orders.filter(order => order.status === status).length,
        color: colors[status]
    })).filter(item => item.count > 0);
    const total = entries.reduce((sum, item) => sum + item.count, 0);

    donut.innerHTML = renderDonutSvg(entries, total);
    legend.innerHTML = entries.map(item => `
        <div class="admin-legend-row admin-chart-hotspot" tabindex="0" data-tooltip="${escapeHtml(item.label)}: ${item.count} заказов">
            <span style="background: ${item.color}"></span>
            <p>${escapeHtml(item.label)}</p>
        </div>
    `).join('');
}

function renderCategoryChart(orders) {
    const container = document.getElementById('adminCategoryChart');
    if (!container) return;

    const categoryMap = new Map();
    orders.forEach(order => {
        (order.products || order.items || []).forEach(item => {
            const key = item.category || 'other';
            const value = Number(item.total || 0);
            categoryMap.set(key, (categoryMap.get(key) || 0) + value);
        });
    });

    renderHorizontalBars(
        container,
        Array.from(categoryMap.entries()).map(([key, value]) => ({
            label: getCategoryText(key),
            value,
            suffix: 'руб.'
        })).sort((a, b) => b.value - a.value)
    );
}

function renderPaymentChart(orders) {
    const container = document.getElementById('adminPaymentChart');
    if (!container) return;

    const paymentMap = new Map();
    orders.forEach(order => {
        const key = order.paymentMethod || 'Не указан';
        paymentMap.set(key, (paymentMap.get(key) || 0) + 1);
    });

    renderHorizontalBars(
        container,
        Array.from(paymentMap.entries()).map(([label, value]) => ({
            label,
            value,
            suffix: 'заказов'
        })).sort((a, b) => b.value - a.value)
    );
}

function renderRatingStats(ratings) {
    const container = document.getElementById('adminRatingStats');
    if (!container) return;

    const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
        label: `${rating} ${rating === 1 ? 'звезда' : 'звезд'}`,
        value: ratings.filter(item => Number(item.rating) === rating).length,
        suffix: 'отзывов'
    }));
    renderHorizontalBars(container, ratingCounts);
}

function renderHorizontalBars(container, items) {
    const maxValue = Math.max(1, ...items.map(item => item.value));
    if (!items.length) {
        container.innerHTML = '<p class="admin-empty">Недостаточно данных.</p>';
        return;
    }

    const totalValue = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
    container.innerHTML = items.map(item => {
        const value = Number(item.value || 0);
        const share = formatShare(value, totalValue);
        const tooltip = `${item.label}: ${value.toLocaleString('ru-RU')} ${item.suffix || ''}, ${share}`;
        return `
        <div class="admin-horizontal-bar-row admin-chart-hotspot" tabindex="0"
            data-tooltip="${escapeHtml(tooltip)}"
            data-insight-title="${escapeHtml(item.title || item.label)}"
            data-insight-body="${escapeHtml(item.body || `${value.toLocaleString('ru-RU')} ${item.suffix || ''} · ${share}`)}"
            data-insight-meta="${escapeHtml(item.meta || `Доля от видимых данных графика: ${share}.`)}"
            data-detail-type="${escapeHtml(item.detailType || 'bar')}"
            data-detail-key="${escapeHtml(item.detailKey || item.label)}">
            <div>
                <span>${escapeHtml(item.label)}</span>
                <small>${escapeHtml(share)}</small>
            </div>
            <p><span style="width: ${Math.max(4, Math.round(value / maxValue * 100))}%"></span></p>
        </div>
        `;
    }).join('');
}

function getMonthlySeries(orders, valueGetter) {
    const monthMap = new Map();
    orders.forEach(order => {
        const key = getMonthKey(order.parsedDate);
        monthMap.set(key, (monthMap.get(key) || 0) + Number(valueGetter(order) || 0));
    });
    return Array.from(monthMap.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .slice(-8)
        .map(([key, value]) => ({ key, value }));
}

function renderSparklineSvg(points, color) {
    const width = 180;
    const height = 82;
    const padding = 10;
    const values = points.length ? points.map(point => point.value) : [0];
    const maxValue = Math.max(1, ...values);
    const step = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
    const coords = (points.length ? points : [{ key: 'empty', value: 0 }]).map((point, index) => {
        const x = points.length > 1 ? padding + index * step : width / 2;
        const y = height - padding - (point.value / maxValue) * (height - padding * 2);
        return { ...point, x, y };
    });
    const line = coords.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
    const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;

    return `
        <svg class="admin-summary-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Мини-график">
            <polygon points="${area}" fill="${color}" opacity="0.12"></polygon>
            <polyline points="${line}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
            ${coords.map(point => `
                <circle class="admin-svg-point" tabindex="0" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="5" fill="${color}">
                    <title>${escapeHtml(point.label || formatMonthKey(point.key))}: ${Number(point.value).toLocaleString('ru-RU')}</title>
                </circle>
            `).join('')}
        </svg>
    `;
}

function renderGaugeSvg(percent, color) {
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const dash = (safePercent / 100) * circumference;
    return `
        <svg class="admin-summary-svg admin-gauge-svg" viewBox="0 0 90 90" role="img" aria-label="Индикатор">
            <circle cx="45" cy="45" r="${radius}" fill="none" stroke="rgba(0,113,227,0.11)" stroke-width="12"></circle>
            <circle class="admin-gauge-progress" cx="45" cy="45" r="${radius}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round"
                stroke-dasharray="${dash.toFixed(2)} ${circumference.toFixed(2)}" transform="rotate(-90 45 45)">
                <title>${safePercent}%</title>
            </circle>
        </svg>
    `;
}

function renderDonutSvg(entries, total) {
    const radius = 68;
    const stroke = 24;
    const center = 90;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const segments = entries.map(item => {
        const length = total ? (item.count / total) * circumference : 0;
        const percent = total ? Math.round((item.count / total) * 100) : 0;
        const segment = `
            <circle class="admin-donut-segment admin-chart-hotspot" tabindex="0"
                cx="${center}" cy="${center}" r="${radius}" fill="none"
                stroke="${item.color}" stroke-width="${stroke}" stroke-linecap="round"
                stroke-dasharray="${Math.max(0.1, length - 3).toFixed(2)} ${circumference.toFixed(2)}"
                stroke-dashoffset="${(-offset).toFixed(2)}"
                transform="rotate(-90 ${center} ${center})"
                data-tooltip="${escapeHtml(item.label)}: ${item.count} заказов, ${percent}%"
                data-insight-title="${escapeHtml(item.label)}"
                data-insight-body="${item.count} заказов · ${percent}%"
                data-insight-meta="${escapeHtml(item.meta || `Всего в выбранном периоде: ${total} заказов.`)}"
                data-detail-type="${escapeHtml(item.detailType || 'donut')}"
                data-detail-key="${escapeHtml(item.detailKey || item.status || item.label)}">
                <title>${escapeHtml(item.label)}: ${item.count} заказов, ${percent}%</title>
            </circle>
        `;
        offset += length;
        return segment;
    }).join('');

    return `
        <svg class="admin-donut-svg" viewBox="0 0 180 180" role="img" aria-label="Статусы заказов">
            <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="rgba(0,113,227,0.09)" stroke-width="${stroke}"></circle>
            ${segments}
        </svg>
    `;
}

function formatShare(value, total) {
    const safeTotal = Number(total || 0);
    if (!safeTotal) return '0%';
    return `${Math.round((Number(value || 0) / safeTotal) * 100)}%`;
}

function openStatDetailModal(element) {
    const modal = document.getElementById('adminStatModal');
    const title = document.getElementById('adminStatModalTitle');
    const body = document.getElementById('adminStatModalBody');
    if (!modal || !title || !body) return;

    title.textContent = element.dataset.insightTitle || 'Детальный просмотр';
    body.innerHTML = renderStatDetailModalContent(element);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('adminStatModalClose')?.focus();
}

function closeStatDetailModal() {
    const modal = document.getElementById('adminStatModal');
    if (!modal?.classList.contains('active')) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function renderStatDetailModalContent(element) {
    const type = element.dataset.detailType || 'summary';
    const key = element.dataset.detailKey || '';
    const title = element.dataset.insightTitle || 'Показатель';
    const body = element.dataset.insightBody || element.dataset.tooltip || '';
    const meta = element.dataset.insightMeta || 'Данные рассчитаны по выбранному периоду.';
    const summary = adminStatistics?.summary || {};

    const overview = `
        <div class="admin-stat-modal-overview">
            <span>${escapeHtml(title)}</span>
            <strong>${escapeHtml(body)}</strong>
            <p>${escapeHtml(meta)}</p>
        </div>
    `;

    if (!adminStatistics?.summary) {
        return `${overview}<p class="admin-empty">Подробный режим доступен после загрузки статистики из базы данных.</p>`;
    }

    const cards = renderStatModalCards([
        ['Период', buildStatisticsPeriodLabel(adminStatistics)],
        ['Всего заказов', Number(summary.orders_count || 0).toLocaleString('ru-RU')],
        ['Выручка', `${Number(summary.revenue_rub || 0).toLocaleString('ru-RU')} руб.`],
        ['Средний чек', `${Number(summary.average_check_rub || 0).toLocaleString('ru-RU')} руб.`],
        ['Оценка', `${Number(summary.average_rating || 0).toFixed(1)}/5`]
    ]);

    if (type === 'timeline') {
        return `${overview}${cards}${renderTimelineDetail(key, element.dataset.detailGroup || currentStatMetric)}`;
    }
    if (type === 'status') {
        return `${overview}${cards}${renderDistributionDetail('Статусы заказов', adminStatistics.statuses || [], key, item => getStatusText(item.status), item => Number(item.count || 0), item => `${Number(item.count || 0).toLocaleString('ru-RU')} заказов`)}`;
    }
    if (type === 'category') {
        return `${overview}${cards}${renderDistributionDetail('Категории каталога', adminStatistics.categories || [], key, item => getCategoryText(item.category), item => Number(item.revenue_rub || 0), item => `${Number(item.revenue_rub || 0).toLocaleString('ru-RU')} руб. · ${Number(item.orders_count || 0)} заказов`)}`;
    }
    if (type === 'payment') {
        return `${overview}${cards}${renderDistributionDetail('Способы оплаты', adminStatistics.payments || [], key, item => item.label || item.payment_method || 'Не указан', item => Number(item.count || 0), item => `${Number(item.count || 0)} заказов · ${Number(item.revenue_rub || 0).toLocaleString('ru-RU')} руб.`)}`;
    }
    if (type === 'rating') {
        return `${overview}${cards}${renderRatingDetail(key)}`;
    }

    return `${overview}${cards}${renderSummaryDetail(key)}`;
}

function renderStatModalCards(items) {
    return `
        <div class="admin-stat-modal-cards">
            ${items.map(([label, value]) => `
                <div>
                    <span>${escapeHtml(label)}</span>
                    <strong>${escapeHtml(value)}</strong>
                </div>
            `).join('')}
        </div>
    `;
}

function renderTimelineDetail(key, metricName) {
    const series = (adminStatistics.timeSeries || []).map(item => ({
        key: item.bucket,
        label: formatStatisticsBucket(item.bucket, adminStatistics.bucket),
        orders: Number(item.orders_count || 0),
        revenue: Number(item.revenue_rub || 0),
        averageCheck: Number(item.average_check_rub || 0),
        delivered: Number(item.delivered_count || 0)
    }));
    const selected = series.find(item => item.key === key) || series[series.length - 1];
    const metric = getTimelineMetricConfig(metricName);
    const selectedKey = selected?.key || key;
    const points = series.map(point => ({
        key: point.key,
        label: point.label,
        value: metric.value(point),
        body: metric.format(metric.value(point)),
        meta: `Заказов: ${point.orders}; выручка: ${point.revenue.toLocaleString('ru-RU')} руб.; средний чек: ${point.averageCheck.toLocaleString('ru-RU')} руб.; доставлено: ${point.delivered}`
    }));

    return `
        <div class="admin-stat-modal-section">
            <div class="admin-stat-modal-section-head">
                <span>Timeline drill-down</span>
                <h3>${escapeHtml(selected ? selected.label : 'Период не найден')}</h3>
            </div>
            ${selected ? renderStatModalCards([
                ['Заказы', selected.orders.toLocaleString('ru-RU')],
                ['Выручка', `${selected.revenue.toLocaleString('ru-RU')} руб.`],
                ['Средний чек', `${selected.averageCheck.toLocaleString('ru-RU')} руб.`],
                ['Доставлено', selected.delivered.toLocaleString('ru-RU')]
            ]) : ''}
            ${renderStatModalLineChart(points, selectedKey, metric.label)}
        </div>
    `;
}

function renderDistributionDetail(title, items, selectedKey, labelGetter, valueGetter, detailGetter) {
    const normalized = items.map(item => ({
        raw: item,
        key: String(item.status || item.category || item.payment_method || item.label || ''),
        label: labelGetter(item),
        value: valueGetter(item),
        detail: detailGetter(item)
    })).sort((a, b) => b.value - a.value);
    const total = normalized.reduce((sum, item) => sum + item.value, 0);
    const maxValue = Math.max(1, ...normalized.map(item => item.value));

    return `
        <div class="admin-stat-modal-section">
            <div class="admin-stat-modal-section-head">
                <span>Distribution drill-down</span>
                <h3>${escapeHtml(title)}</h3>
            </div>
            <div class="admin-stat-modal-list">
                ${normalized.map(item => `
                    <div class="${item.key === selectedKey ? 'is-selected' : ''}">
                        <div>
                            <strong>${escapeHtml(item.label)}</strong>
                            <span>${escapeHtml(item.detail)} · ${formatShare(item.value, total)}</span>
                        </div>
                        <p><span style="width: ${Math.max(4, Math.round(item.value / maxValue * 100))}%"></span></p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderRatingDetail(selectedRating) {
    const items = [5, 4, 3, 2, 1].map(rating => {
        const found = (adminStatistics.ratings || []).find(item => Number(item.rating) === rating);
        return {
            rating,
            count: Number(found?.count || 0)
        };
    });
    const total = items.reduce((sum, item) => sum + item.count, 0);
    const maxValue = Math.max(1, ...items.map(item => item.count));

    return `
        <div class="admin-stat-modal-section">
            <div class="admin-stat-modal-section-head">
                <span>Rating drill-down</span>
                <h3>Распределение оценок</h3>
            </div>
            <div class="admin-stat-modal-list">
                ${items.map(item => `
                    <div class="${String(item.rating) === String(selectedRating) ? 'is-selected' : ''}">
                        <div>
                            <strong>${item.rating}/5</strong>
                            <span>${item.count.toLocaleString('ru-RU')} отзывов · ${formatShare(item.count, total)}</span>
                        </div>
                        <p><span style="width: ${Math.max(4, Math.round(item.count / maxValue * 100))}%"></span></p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderSummaryDetail(selectedKey) {
    const series = adminStatistics.timeSeries || [];
    const summaryMap = {
        orders: {
            label: 'Заказы',
            value: item => Number(item.orders_count || 0),
            format: value => `${Number(value).toLocaleString('ru-RU')} заказов`
        },
        revenue: {
            label: 'Выручка',
            value: item => Number(item.revenue_rub || 0),
            format: value => `${Number(value).toLocaleString('ru-RU')} руб.`
        },
        averageCheck: {
            label: 'Средний чек',
            value: item => Number(item.average_check_rub || 0),
            format: value => `${Number(value).toLocaleString('ru-RU')} руб.`
        },
        delivery: {
            label: 'Доставлено',
            value: item => Number(item.delivered_count || 0),
            format: value => `${Number(value).toLocaleString('ru-RU')} доставлено`
        },
        rating: {
            label: 'Оценка',
            value: () => Number(adminStatistics.summary.average_rating || 0),
            format: value => `${Number(value).toFixed(1)}/5`
        }
    };
    const metric = summaryMap[selectedKey] || summaryMap.revenue;
    const selectedPoint = series[series.length - 1];
    const points = series.map(item => {
        const value = metric.value(item);
        return {
            key: item.bucket,
            label: formatStatisticsBucket(item.bucket, adminStatistics.bucket),
            value,
            body: metric.format(value),
            meta: `Заказов: ${Number(item.orders_count || 0)}; выручка: ${Number(item.revenue_rub || 0).toLocaleString('ru-RU')} руб.; средний чек: ${Number(item.average_check_rub || 0).toLocaleString('ru-RU')} руб.; доставлено: ${Number(item.delivered_count || 0)}`
        };
    });

    return `
        <div class="admin-stat-modal-section">
            <div class="admin-stat-modal-section-head">
                <span>Summary drill-down</span>
                <h3>Динамика показателя по периоду</h3>
            </div>
            ${renderStatModalLineChart(points, selectedPoint?.bucket || points[0]?.key, metric.label)}
        </div>
    `;
}

function renderStatModalLineChart(points, selectedKey, metricLabel) {
    if (!points.length) {
        return '<p class="admin-empty">Недостаточно данных для графика.</p>';
    }

    const enrichedPoints = points.map((point, index) => {
        const previous = index > 0 ? Number(points[index - 1].value || 0) : null;
        return {
            ...point,
            delta: previous === null ? null : Number(point.value || 0) - previous
        };
    });
    const selected = enrichedPoints.find(point => point.key === selectedKey) || enrichedPoints[enrichedPoints.length - 1];

    return `
        <div class="admin-stat-modal-line-wrap">
            ${renderInteractiveLineChart(enrichedPoints, {
                className: 'admin-stat-modal-line-chart',
                metricLabel,
                selectedKey: selected.key,
                showPointValues: true,
                width: 920,
                height: 350,
                paddingX: 64,
                paddingTop: 44,
                paddingBottom: 72,
                includeHotspots: false
            })}
            <div class="admin-stat-modal-point-detail" id="adminStatModalPointDetail">
                <span>${escapeHtml(selected.label)}</span>
                <strong>${escapeHtml(selected.body)}</strong>
                <p>${escapeHtml(buildPointDetailMeta(selected))}</p>
            </div>
        </div>
    `;
}

function renderInteractiveLineChart(points, options = {}) {
    const width = options.width || 920;
    const height = options.height || 330;
    const paddingX = options.paddingX || 54;
    const paddingTop = options.paddingTop || 30;
    const paddingBottom = options.paddingBottom || 68;
    const values = points.map(point => Number(point.value || 0));
    const rawMax = Math.max(1, ...values);
    const rawMin = Math.min(0, ...values);
    const headroom = Math.max(1, Math.round((rawMax - rawMin) * 0.12));
    const maxValue = rawMax + headroom;
    const minValue = rawMin;
    const range = Math.max(1, maxValue - minValue);
    const chartBottom = height - paddingBottom;
    const chartHeight = height - paddingTop - paddingBottom;
    const step = points.length > 1 ? (width - paddingX * 2) / (points.length - 1) : 0;
    const coords = points.map((point, index) => {
        const x = points.length > 1 ? paddingX + index * step : width / 2;
        const y = chartBottom - ((Number(point.value || 0) - minValue) / range) * chartHeight;
        return { ...point, x, y };
    });
    const selected = coords.find(point => point.key === options.selectedKey) || coords[coords.length - 1];
    const line = coords.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
    const area = `${paddingX},${chartBottom} ${line} ${width - paddingX},${chartBottom}`;
    const labelStep = Math.max(1, Math.ceil(coords.length / 7));
    const maxPoint = coords.reduce((best, point) => Number(point.value || 0) > Number(best.value || 0) ? point : best, coords[0]);
    const minPoint = coords.reduce((best, point) => Number(point.value || 0) < Number(best.value || 0) ? point : best, coords[0]);
    const shouldShowXLabel = (point, index) => (
        coords.length <= 8 ||
        index === 0 ||
        index === coords.length - 1 ||
        index % labelStep === 0
    );
    const shouldShowValueLabel = point => (
        coords.length <= 8 ||
        point.key === selected?.key ||
        point.key === maxPoint?.key ||
        point.key === minPoint?.key
    );
    const gridRows = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = paddingTop + ratio * chartHeight;
        const value = maxValue - ratio * range;
        return { y, value };
    });
    const valueFormatter = value => formatCompactNumber(Math.round(value));

    return `
        <svg class="${escapeHtml(options.className || 'admin-stat-modal-line-chart')}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(options.metricLabel || 'График')} по периоду">
            <defs>
                <linearGradient id="adminLineAreaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#0b7a75" stop-opacity="0.2"></stop>
                    <stop offset="100%" stop-color="#5ac8fa" stop-opacity="0.03"></stop>
                </linearGradient>
            </defs>
            ${gridRows.map(row => `
                <line x1="${paddingX}" y1="${row.y.toFixed(1)}" x2="${width - paddingX}" y2="${row.y.toFixed(1)}" class="admin-stat-modal-grid"></line>
                <text class="admin-stat-modal-y-label" x="${paddingX - 14}" y="${(row.y + 5).toFixed(1)}" text-anchor="end">${escapeHtml(valueFormatter(row.value))}</text>
            `).join('')}
            <line x1="${paddingX}" y1="${chartBottom}" x2="${width - paddingX}" y2="${chartBottom}" class="admin-stat-modal-axis"></line>
            <line x1="${paddingX}" y1="${paddingTop}" x2="${paddingX}" y2="${chartBottom}" class="admin-stat-modal-axis"></line>
            ${selected ? `<line x1="${selected.x.toFixed(1)}" y1="${paddingTop}" x2="${selected.x.toFixed(1)}" y2="${chartBottom}" class="admin-stat-modal-selected-line"></line>` : ''}
            <polygon points="${area}" class="admin-stat-modal-line-area"></polygon>
            <polyline points="${line}" class="admin-stat-modal-line"></polyline>
            ${coords.map(point => {
                const showValue = options.showPointValues && shouldShowValueLabel(point);
                return `
                ${showValue ? `<text class="admin-stat-modal-value-label" x="${point.x.toFixed(1)}" y="${Math.max(18, point.y - 18).toFixed(1)}" text-anchor="middle">${escapeHtml(formatCompactNumber(point.value))}</text>` : ''}
                <g class="admin-stat-modal-point ${point.key === selected?.key ? 'is-selected' : ''} ${options.includeHotspots ? 'admin-chart-hotspot' : ''}" tabindex="0"
                    data-tooltip="${escapeHtml(`${point.label}: ${point.body}`)}"
                    data-insight-title="${escapeHtml(point.label)}"
                    data-insight-body="${escapeHtml(point.body)}"
                    data-insight-meta="${escapeHtml(buildPointDetailMeta(point))}"
                    data-detail-type="${escapeHtml(point.detailType || 'timeline')}"
                    data-detail-key="${escapeHtml(point.key)}"
                    data-detail-group="${escapeHtml(point.detailGroup || currentStatMetric)}"
                    data-modal-point-title="${escapeHtml(point.label)}"
                    data-modal-point-body="${escapeHtml(point.body)}"
                    data-modal-point-meta="${escapeHtml(buildPointDetailMeta(point))}"
                    transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})">
                    <circle r="17"></circle>
                    <circle r="6"></circle>
                    <title>${escapeHtml(point.label)}: ${escapeHtml(point.body)}</title>
                </g>
                `;
            }).join('')}
            ${coords.map((point, index) => shouldShowXLabel(point, index) ? `
                <text class="admin-stat-modal-x-label" x="${point.x.toFixed(1)}" y="${height - 26}" text-anchor="middle">${escapeHtml(point.label)}</text>
            ` : '').join('')}
        </svg>
    `;
}

function selectStatModalPoint(point) {
    document.querySelectorAll('.admin-stat-modal-point.is-selected').forEach(item => {
        item.classList.remove('is-selected');
    });
    point.classList.add('is-selected');
    const detail = document.getElementById('adminStatModalPointDetail');
    if (!detail) return;
    detail.innerHTML = `
        <span>${escapeHtml(point.dataset.modalPointTitle || 'Точка графика')}</span>
        <strong>${escapeHtml(point.dataset.modalPointBody || '')}</strong>
        <p>${escapeHtml(point.dataset.modalPointMeta || '')}</p>
    `;
}

function getChartPointTooltip() {
    if (chartPointTooltip) return chartPointTooltip;
    chartPointTooltip = document.createElement('div');
    chartPointTooltip.className = 'admin-chart-point-tooltip';
    chartPointTooltip.setAttribute('role', 'tooltip');
    document.body.appendChild(chartPointTooltip);
    return chartPointTooltip;
}

function showChartPointTooltip(point) {
    const tooltip = getChartPointTooltip();
    tooltip.innerHTML = `
        <span>${escapeHtml(point.dataset.modalPointTitle || point.dataset.insightTitle || 'Точка графика')}</span>
        <strong>${escapeHtml(point.dataset.modalPointBody || point.dataset.insightBody || '')}</strong>
        <p>${escapeHtml(point.dataset.modalPointMeta || point.dataset.insightMeta || point.dataset.tooltip || '')}</p>
    `;
    tooltip.classList.add('active');
    const rect = point.getBoundingClientRect();
    positionChartPointTooltip(rect.left + rect.width / 2, rect.top);
}

function positionChartPointTooltip(x, y) {
    const tooltip = getChartPointTooltip();
    const offset = 18;
    const rect = tooltip.getBoundingClientRect();
    const left = Math.min(
        window.innerWidth - rect.width - 12,
        Math.max(12, x - rect.width / 2)
    );
    const top = y - rect.height - offset > 12
        ? y - rect.height - offset
        : y + offset;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.min(window.innerHeight - rect.height - 12, Math.max(12, top))}px`;
}

function hideChartPointTooltip() {
    chartPointTooltip?.classList.remove('active');
}

function formatCompactNumber(value) {
    const number = Number(value || 0);
    if (Math.abs(number) >= 1000000) {
        return `${(number / 1000000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн`;
    }
    if (Math.abs(number) >= 1000) {
        return `${(number / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} тыс.`;
    }
    return number.toLocaleString('ru-RU');
}

function formatDelta(delta) {
    if (delta === null || delta === undefined || Number.isNaN(Number(delta))) {
        return 'первая точка периода';
    }
    const sign = Number(delta) > 0 ? '+' : '';
    return `${sign}${Number(delta).toLocaleString('ru-RU')}`;
}

function buildPointDetailMeta(point) {
    const deltaText = formatDelta(point.delta);
    if (!point.meta) return `Изменение к предыдущей точке: ${deltaText}.`;
    return `${point.meta}; изменение к предыдущей точке: ${deltaText}.`;
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
                    <div class="small-text">${escapeHtml(formatOrderDateTime(order.date))}</div>
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
                <strong>${escapeHtml(product.name)}</strong>
                <div class="small-text">${product.active ? 'Активен' : 'Скрыт'} · популярность ${escapeHtml(product.popularity || 0)}</div>
            </td>
            <td>${escapeHtml(getCategoryText(product.category))}</td>
            <td>${Number(product.price).toLocaleString()} руб.</td>
            <td>
                <span class="${Number(product.stock || 0) > 0 ? 'admin-stock-badge' : 'admin-stock-badge out'}">
                    ${Number(product.stock || 0) > 0 ? `${Number(product.stock || 0).toLocaleString('ru-RU')} в наличии` : 'Нет в наличии'}
                </span>
            </td>
            <td>
                <div class="admin-product-row-actions">
                    <button class="btn btn-outline admin-product-edit" type="button" data-product-id="${product.id}">
                        <i class="fas fa-pen"></i> Изменить
                    </button>
                    <button class="btn btn-outline admin-product-stockout" type="button" data-product-id="${product.id}" ${Number(product.stock || 0) <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-ban"></i> Нет в наличии
                    </button>
                    <button class="btn btn-outline admin-product-delete" type="button" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.admin-product-edit').forEach(button => {
        button.addEventListener('click', () => fillProductForm(button.dataset.productId));
    });
    tbody.querySelectorAll('.admin-product-stockout').forEach(button => {
        button.addEventListener('click', () => markProductOutOfStock(button.dataset.productId));
    });
    tbody.querySelectorAll('.admin-product-delete').forEach(button => {
        button.addEventListener('click', () => deleteProduct(button.dataset.productId));
    });
}

async function markProductOutOfStock(productId) {
    const product = adminProducts.find(item => Number(item.id) === Number(productId));
    if (!product) return;
    const confirmed = confirm(`Отметить «${product.name}» как нет в наличии?`);
    if (!confirmed) return;

    const updatedProduct = await window.FishSite.request('/admin/products/out-of-stock', {
        method: 'POST',
        body: JSON.stringify({ id: Number(productId) })
    });
    const index = adminProducts.findIndex(item => Number(item.id) === Number(productId));
    if (index >= 0) adminProducts[index] = updatedProduct;
    renderProductsTable();
}

async function deleteProduct(productId) {
    const product = adminProducts.find(item => Number(item.id) === Number(productId));
    if (!product) return;
    const confirmed = confirm(`Удалить товар «${product.name}» из активного каталога?`);
    if (!confirmed) return;

    await window.FishSite.request('/admin/products/delete', {
        method: 'POST',
        body: JSON.stringify({ id: Number(productId) })
    });
    const index = adminProducts.findIndex(item => Number(item.id) === Number(productId));
    if (index >= 0) {
        adminProducts[index] = {
            ...adminProducts[index],
            active: false
        };
    }
    renderProductsTable();
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

function parseOrderDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatOrderDateTime(value) {
    const date = parseOrderDate(value);
    if (!date) return value || 'Дата не указана';
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(',', '');
}

function getMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthKey(key) {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('ru-RU', {
        month: 'short',
        year: '2-digit'
    });
}

function buildPeriodLabel(orders) {
    if (!orders.length) return 'Нет данных';
    const timestamps = orders.map(order => order.parsedDate.getTime());
    const minDate = new Date(Math.min(...timestamps));
    const maxDate = new Date(Math.max(...timestamps));
    const formatDate = date => date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
}

function formatStatisticsBucket(value, bucket = 'month') {
    const date = parseOrderDate(value);
    if (!date) return '';
    if (bucket === 'day') {
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'short'
        });
    }
    return date.toLocaleDateString('ru-RU', {
        month: 'short',
        year: '2-digit'
    });
}

function buildStatisticsPeriodLabel(statistics) {
    const from = parseOrderDate(statistics.dateFrom);
    const to = parseOrderDate(statistics.dateTo);
    if (!from || !to) return 'Нет данных за выбранный период';
    const formatDate = date => date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    return `${formatDate(from)} - ${formatDate(to)}`;
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
