// favorites.js - Логика для страницы Избранное

// Данные избранных товаров
let favoritesData = [];

// DOM элементы
const favoritesContainer = document.getElementById('favoritesContainer');
const emptyFavoritesState = document.getElementById('emptyFavoritesState');
const totalFavoritesCount = document.getElementById('total-favorites-count');
const discountFavoritesCount = document.getElementById('discount-favorites-count');
const totalFavoritesPrice = document.getElementById('total-favorites-price');
const filterTabs = document.querySelectorAll('.filter-tab');
const favoritesSort = document.getElementById('favorites-sort');
const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
const categoryCards = document.querySelectorAll('.category-card');

// Функция загрузки данных избранного
function loadFavoritesData() {
    // Загружаем данные из localStorage
    const savedFavorites = localStorage.getItem('favorites');
    
    if (savedFavorites) {
        const favoriteIds = JSON.parse(savedFavorites);
        // Получаем данные товаров из script.js
        const allProducts = window.products || getDefaultProducts();
        
        // Фильтруем товары, которые находятся в избранном
        favoritesData = allProducts.filter(product => favoriteIds.includes(product.id));
    } else {
        favoritesData = [];
    }
    
    // Первоначальная отрисовка
    renderFavorites();
}

// Функция получения товаров по умолчанию (если window.products не определен)
function getDefaultProducts() {
    return [
        {
            id: 1,
            name: "Сёмга охлажденная",
            category: "fresh",
            price: 1200,
            image: "🐟",
            popular: true,
            description: "Свежая охлажденная сёмга высшего качества.",
            weight: "1 кг",
            shelfLife: "5 дней",
            origin: "Норвегия",
            storage: "0°C до +2°C",
            hasDiscount: true,
            discountPrice: 1000
        },
        {
            id: 2,
            name: "Форель радужная",
            category: "fresh",
            price: 900,
            image: "🐠",
            popular: true,
            description: "Радужная форель, выращенная в экологически чистых условиях.",
            weight: "1 кг",
            shelfLife: "5 дней",
            origin: "Карелия",
            storage: "0°C до +2°C",
            hasDiscount: false
        },
        {
            id: 3,
            name: "Креветки тигровые",
            category: "seafood",
            price: 1800,
            image: "🦐",
            popular: false,
            description: "Крупные тигровые креветки, замороженные свежими.",
            weight: "1 кг",
            shelfLife: "12 месяцев",
            origin: "Вьетнам",
            storage: "-18°C и ниже",
            hasDiscount: true,
            discountPrice: 1500
        },
        {
            id: 11,
            name: "Икра лососевая",
            category: "seafood",
            price: 2500,
            image: "🥫",
            popular: true,
            description: "Икра лососевая зернистая.",
            weight: "100 г",
            shelfLife: "6 месяцев",
            origin: "Камчатка",
            storage: "0°C до +4°C",
            hasDiscount: false
        }
    ];
}

// Функция отображения избранных товаров
function renderFavorites(filter = 'all', sortBy = 'date') {
    let filteredFavorites = [...favoritesData];
    
    // Фильтрация
    if (filter !== 'all') {
        switch(filter) {
            case 'available':
                // В нашей структуре все товары считаем в наличии
                break;
            case 'discount':
                filteredFavorites = filteredFavorites.filter(item => item.hasDiscount);
                break;
            case 'fresh':
                filteredFavorites = filteredFavorites.filter(item => item.category === 'fresh');
                break;
            case 'seafood':
                filteredFavorites = filteredFavorites.filter(item => item.category === 'seafood');
                break;
        }
    }
    
    // Сортировка
    filteredFavorites.sort((a, b) => {
        switch(sortBy) {
            case 'price-asc':
                const priceA = a.hasDiscount ? a.discountPrice : a.price;
                const priceB = b.hasDiscount ? b.discountPrice : b.price;
                return priceA - priceB;
            case 'price-desc':
                const priceA2 = a.hasDiscount ? a.discountPrice : a.price;
                const priceB2 = b.hasDiscount ? b.discountPrice : b.price;
                return priceB2 - priceA2;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'date':
            default:
                // Для демонстрации сортируем по ID
                return a.id - b.id;
        }
    });
    
    // Обновляем статистику
    updateFavoritesStats(filteredFavorites);
    
    // Очищаем контейнер
    favoritesContainer.innerHTML = '';
    
    // Если нет избранных товаров
    if (filteredFavorites.length === 0) {
        emptyFavoritesState.style.display = 'block';
        return;
    }
    
    emptyFavoritesState.style.display = 'none';
    
    // Отображаем товары
    filteredFavorites.forEach(product => {
        const favoriteCard = createFavoriteCard(product);
        favoritesContainer.appendChild(favoriteCard);
    });
}

// Функция создания карточки избранного товара
function createFavoriteCard(product) {
    const card = document.createElement('div');
    card.className = 'favorite-item';
    card.dataset.id = product.id;
    
    const price = product.hasDiscount ? product.discountPrice : product.price;
    const oldPrice = product.hasDiscount ? product.price : null;
    
    card.innerHTML = `
        <button class="favorite-remove" data-id="${product.id}">
            <i class="fas fa-times"></i>
        </button>
        <div class="favorite-image">
            ${product.image}
            ${product.hasDiscount ? '<div class="discount-badge">СКИДКА</div>' : ''}
        </div>
        <div class="favorite-info">
            <div class="product-category">${getCategoryName(product.category)}</div>
            <h3 class="favorite-title">${product.name}</h3>
            <p class="product-description" style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 15px;">
                ${product.description}
            </p>
            <div class="product-details-mini" style="display: flex; gap: 15px; margin-bottom: 15px; font-size: 0.85rem; color: var(--text-light);">
                <span>${product.weight}</span>
                <span>${product.origin}</span>
            </div>
            <div class="price-section" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                ${oldPrice ? `<span class="old-price" style="text-decoration: line-through; color: var(--text-light);">${oldPrice} руб.</span>` : ''}
                <span class="current-price" style="font-size: 1.2rem; font-weight: 600; color: var(--primary-color);">
                    ${price} руб./кг
                </span>
            </div>
            <div class="favorite-actions">
                <button class="btn btn-primary add-to-cart-fav" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> В корзину
                </button>
                <button class="btn btn-outline view-details" data-id="${product.id}">
                    <i class="fas fa-eye"></i> Подробнее
                </button>
            </div>
        </div>
    `;
    
    // Обработчики событий
    const removeBtn = card.querySelector('.favorite-remove');
    const addToCartBtn = card.querySelector('.add-to-cart-fav');
    const viewDetailsBtn = card.querySelector('.view-details');
    
    removeBtn.addEventListener('click', () => removeFromFavorites(product.id));
    addToCartBtn.addEventListener('click', () => addToCartFromFavorites(product.id));
    viewDetailsBtn.addEventListener('click', () => viewProductDetails(product.id));
    
    return card;
}

// Функция обновления статистики
function updateFavoritesStats(favorites) {
    const totalCount = favorites.length;
    const discountCount = favorites.filter(item => item.hasDiscount).length;
    const totalPrice = favorites.reduce((sum, item) => {
        const price = item.hasDiscount ? item.discountPrice : item.price;
        return sum + price;
    }, 0);
    
    totalFavoritesCount.textContent = totalCount;
    discountFavoritesCount.textContent = discountCount;
    totalFavoritesPrice.textContent = totalPrice.toLocaleString();
}

// Функция получения названия категории
function getCategoryName(categoryCode) {
    const categories = {
        'fresh': 'Свежая рыба',
        'seafood': 'Морепродукты',
        'caviar': 'Икра',
        'smoked': 'Копченая рыба',
        'frozen': 'Замороженная рыба',
        'fillets': 'Филе и стейки'
    };
    return categories[categoryCode] || categoryCode;
}

// Функция удаления из избранного
function removeFromFavorites(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(id => id !== productId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Обновляем данные
    favoritesData = favoritesData.filter(item => item.id !== productId);
    
    // Получаем текущие значения фильтров
    const activeFilter = document.querySelector('.filter-tab.active').dataset.filter;
    const sortBy = favoritesSort.value;
    
    // Перерисовываем
    renderFavorites(activeFilter, sortBy);
    
    showNotification('Товар удален из избранного');
    
    // Обновляем счетчик в навигации
    updateFavoritesCountInNav();
}

// Функция добавления в корзину из избранного
function addToCartFromFavorites(productId) {
    const product = favoritesData.find(p => p.id === productId);
    if (!product) return;
    
    // Используем функцию из script.js, если она доступна
    if (typeof window.addToCart === 'function') {
        window.addToCart(productId, 1);
    } else {
        // Локальная реализация
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification(`Товар "${product.name}" добавлен в корзину!`);
    }
}

// Функция просмотра деталей товара
function viewProductDetails(productId) {
    // Если есть модальное окно товара из script.js, используем его
    if (typeof window.openProductModal === 'function') {
        window.openProductModal(productId);
    } else {
        // Простая реализация
        const product = favoritesData.find(p => p.id === productId);
        if (product) {
            alert(`Детали товара: ${product.name}\n\n${product.description}\n\nЦена: ${product.price} руб./кг`);
        }
    }
}

// Функция обновления счетчика корзины
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
}

// Функция обновления счетчика избранного в навигации
function updateFavoritesCountInNav() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesCountElements = document.querySelectorAll('.favorites-count');
    
    favoritesCountElements.forEach(el => {
        el.textContent = favorites.length;
    });
}

// Функция очистки всех избранных
function clearAllFavorites() {
    if (favoritesData.length === 0) {
        showNotification('В избранном уже нет товаров', 'info');
        return;
    }
    
    if (confirm(`Вы уверены, что хотите очистить все избранное?\n\nБудет удалено ${favoritesData.length} товаров`)) {
        localStorage.removeItem('favorites');
        favoritesData = [];
        
        // Перерисовываем
        const activeFilter = document.querySelector('.filter-tab.active').dataset.filter;
        const sortBy = favoritesSort.value;
        renderFavorites(activeFilter, sortBy);
        
        showNotification('Все товары удалены из избранного');
        
        // Обновляем счетчик в навигации
        updateFavoritesCountInNav();
    }
}

// Функция перехода к категории
function browseCategory(category) {
    // В реальном приложении здесь был бы переход в каталог с фильтром
    showNotification(`Переход в категорию "${getCategoryName(category)}"`);
    
    // Сохраняем выбранную категорию
    localStorage.setItem('selectedCategory', category);
    
    // Перенаправляем в каталог
    window.location.href = 'catalog.html';
}

// Функция показа уведомления
function showNotification(message, type = 'success') {
    // Используем функцию из script.js, если она доступна
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Локальная реализация
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#38a169';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e53e3e';
    } else if (type === 'info') {
        notification.style.backgroundColor = '#4299e1';
    }
    
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '6px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.zIndex = '1000';
    notification.style.maxWidth = '350px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Функции из account.js
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user')) || {
        name: "Ольга Ивановна",
        email: "olga@example.com",
        initials: "ОИ"
    };
    
    const userNameElements = document.querySelectorAll('#user-name');
    const userEmailElements = document.querySelectorAll('#user-email');
    const userAvatarElements = document.querySelectorAll('#user-avatar');
    
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Настраиваем навигацию
    loadUserData();
    setupNavigation();
    updateCartCount();
    updateFavoritesCountInNav();
    
    // Загружаем данные избранного
    loadFavoritesData();
    
    // Обработчики для фильтров
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Обновляем активную вкладку
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Применяем фильтр
            const filter = this.dataset.filter;
            const sortBy = favoritesSort.value;
            renderFavorites(filter, sortBy);
        });
    });
    
    // Обработчик сортировки
    favoritesSort.addEventListener('change', function() {
        const activeFilter = document.querySelector('.filter-tab.active').dataset.filter;
        renderFavorites(activeFilter, this.value);
    });
    
    // Обработчик для кнопки очистки
    clearFavoritesBtn.addEventListener('click', clearAllFavorites);
    
    // Обработчики для карточек категорий
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            browseCategory(category);
        });
    });
});

// Добавляем стили для бейджа скидки
const style = document.createElement('style');
style.textContent = `
    .discount-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background: #f56565;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1;
    }
    
    .favorites-filters {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding: 20px;
        background: var(--white);
        border-radius: 12px;
        box-shadow: var(--shadow);
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .favorites-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin-top: 20px;
    }
    
    .category-card {
        background: var(--white);
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        box-shadow: var(--shadow);
        cursor: pointer;
        transition: var(--transition);
    }
    
    .category-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(30, 136, 229, 0.2);
    }
    
    .category-icon {
        font-size: 2.5rem;
        margin-bottom: 10px;
    }
    
    .category-name {
        font-weight: 600;
        color: var(--text-dark);
        margin-bottom: 5px;
    }
    
    .category-count {
        color: var(--text-light);
        font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
        .favorites-filters {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .filter-tabs {
            width: 100%;
            flex-wrap: wrap;
        }
        
        .sort-section {
            width: 100%;
        }
        
        .favorites-stats {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);
