// Инициализация Яндекс Карты
let yandexMapLoading = false;

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    if (typeof ymaps !== 'undefined') {
        ymaps.ready(function() {
            if (mapElement.dataset.mapReady === 'true') return;

            mapElement.dataset.mapReady = 'true';

            var myMap = new ymaps.Map("map", {
                center: [56.838011, 60.597465],
                zoom: 16,
                controls: ['zoomControl', 'fullscreenControl']
            });

            var myPlacemark = new ymaps.Placemark([56.838011, 60.597465], {
                balloonContent: 'Морские Дары<br>ИП Чепурнова О.И.<br>ул. Репина, 15'
            }, {
                preset: 'islands#blueFoodIcon'
            });

            myMap.geoObjects.add(myPlacemark);
        });
        return;
    }

    if (yandexMapLoading) return;
    yandexMapLoading = true;

    const loadMap = () => {
        if (typeof ymaps !== 'undefined') {
            initMap();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.async = true;
        script.onload = initMap;
        script.onerror = renderMapFallback;
        document.head.appendChild(script);
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                observer.disconnect();
                loadMap();
            }
        }, { rootMargin: '160px' });
        observer.observe(mapElement);
    } else {
        loadMap();
    }
}

function renderMapFallback() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    mapElement.innerHTML = `
        <div class="map-fallback">
            <i class="fas fa-map-marker-alt"></i>
            <p>г. Екатеринбург, ул. Репина, д. 15</p>
            <span>Карта временно недоступна</span>
            <div>
                <a href="https://yandex.ru/maps/?text=Екатеринбург%2C%20ул.%20Репина%2C%2015" target="_blank" rel="noopener">Открыть в Яндекс.Картах</a>
            </div>
        </div>
    `;
}

function escapeHtml(value) {
    if (window.FishSite?.escapeHtml) {
        return window.FishSite.escapeHtml(value);
    }
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function requireFishSite(methodName) {
    const api = window.FishSite;
    if (!api || typeof api[methodName] !== 'function') {
        const message = 'Ядро сайта не загружено. Откройте проект через backend-сервер и обновите страницу.';
        if (typeof showNotification === 'function') {
            showNotification(message, 'error');
        }
        throw new Error(message);
    }
    return api;
}

// Генерация анимированных рыб и пузырьков
function generateUnderwaterScene() {
    const blowingBubbles = document.querySelector('.blowing-bubbles');
    const swimingFishes = document.querySelector('.swiming-fishes');
    
    if (!blowingBubbles || !swimingFishes) return;
    
    // Генерация пузырьков
    for (let i = 1; i <= 40; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        const size = Math.random() * 20 + 10;
        const left = Math.random() * 80 - 40;
        const duration = Math.random() * 4000 + 3000;
        const delay = Math.random() * 10000 * -1;
        
        bubble.style.left = left + 'px';
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.animationDuration = duration + 'ms';
        bubble.style.animationDelay = delay + 'ms';
        
        blowingBubbles.appendChild(bubble);
    }
    
    // Генерация рыб
    for (let i = 1; i <= 10; i++) {
        const swim = document.createElement('div');
        swim.className = 'swim';
        
        const rotate = document.createElement('div');
        rotate.className = 'rotate';
        
        const depth = document.createElement('div');
        depth.className = 'depth';
        
        const fishComponent = document.createElement('div');
        fishComponent.className = 'fish-component';
        
        const shadow = document.createElement('div');
        shadow.className = 'shadow';
        
        const fish = document.createElement('div');
        fish.className = 'fish';
        
        const fishBody = document.createElement('div');
        fishBody.className = 'fish-body';
        
        const halfLeft = document.createElement('div');
        halfLeft.className = 'half -left';
        
        const halfRight = document.createElement('div');
        halfRight.className = 'half -right';
        
        const fishTail = document.createElement('div');
        fishTail.className = 'fish-tail';
        
        // Создаем чешую для тела рыбы
        function createBodyScales(container) {
            for (let j = 0; j < 4; j++) {
                const scale1 = document.createElement('div');
                scale1.className = 'scale -top -front';
                container.appendChild(scale1);
                
                const scale2 = document.createElement('div');
                scale2.className = 'scale -top -back';
                container.appendChild(scale2);
                
                const scale3 = document.createElement('div');
                scale3.className = 'scale -bottom -front';
                container.appendChild(scale3);
                
                const scale4 = document.createElement('div');
                scale4.className = 'scale -bottom -back';
                container.appendChild(scale4);
            }
        }
        
        // Добавляем чешую для обеих половинок
        createBodyScales(halfLeft);
        createBodyScales(halfRight);
        
        // Добавляем хвост
        const tailTop = document.createElement('div');
        tailTop.className = 'scale -top';
        fishTail.appendChild(tailTop);
        
        const tailBottom = document.createElement('div');
        tailBottom.className = 'scale -bottom';
        fishTail.appendChild(tailBottom);
        
        // Собираем структуру рыбы
        fishBody.appendChild(halfLeft);
        fishBody.appendChild(halfRight);
        fish.appendChild(fishBody);
        fish.appendChild(fishTail);
        fishComponent.appendChild(shadow);
        fishComponent.appendChild(fish);
        depth.appendChild(fishComponent);
        rotate.appendChild(depth);
        swim.appendChild(rotate);
        swimingFishes.appendChild(swim);
        
        // Устанавливаем случайные параметры для каждой рыбы
        const rotateWidth = Math.random() * 600 + 200;
        const rotateDuration = Math.random() * 6000 + 8000;
        const rotateDelay = Math.random() * 10000 * -1;
        const depthValue = Math.random() * 700;
        const fishDelay = Math.random() * 2000;
        
        rotate.style.width = rotateWidth + 'px';
        rotate.style.animationDuration = rotateDuration + 'ms';
        rotate.style.animationDelay = rotateDelay + 'ms';
        
        depth.style.transform = `translateY(-${depthValue}px)`;
        shadow.style.transform = `translate(-50px, ${depthValue + 200}px) rotateX(90deg)`;
        fish.style.animationDelay = `-${fishDelay + 300}ms`;
        fishTail.style.animationDelay = `-${fishDelay}ms`;
    }
}

// Данные товаров
let products = window.FishSite?.fallbackProducts || [
    {
        id: 1,
        name: "Сёмга охлажденная",
        category: "fresh",
        price: 1200,
        image: "🐟",
        popular: true,
        description: "Свежая охлажденная сёмга высшего качества. Идеально подходит для засолки, приготовления на гриле или в духовке. Доставка осуществляется в термокоробах для сохранения свежести.",
        weight: "1 кг",
        shelfLife: "5 дней",
        origin: "Норвегия",
        storage: "0°C до +2°C"
    },
    {
        id: 2,
        name: "Форель радужная",
        category: "fresh",
        price: 900,
        image: "🐠",
        popular: true,
        description: "Радужная форель, выращенная в экологически чистых условиях. Нежное мясо с минимальным количеством костей. Отлично подходит для ухи, запекания и приготовления на пару.",
        weight: "1 кг",
        shelfLife: "5 дней",
        origin: "Карелия",
        storage: "0°C до +2°C"
    },
    {
        id: 3,
        name: "Креветки тигровые",
        category: "seafood",
        price: 1800,
        image: "🦐",
        popular: false,
        description: "Крупные тигровые креветки, замороженные свежими. Идеальны для гриля, пасты, салатов и азиатской кухни. Размер: 16-20 шт/кг.",
        weight: "1 кг",
        shelfLife: "12 месяцев",
        origin: "Вьетнам",
        storage: "-18°C и ниже"
    },
    {
        id: 4,
        name: "Кальмар замороженный",
        category: "frozen",
        price: 700,
        image: "🦑",
        popular: true,
        description: "Филе кальмара, очищенное от кожи и внутренностей. Быстрая заморозка позволяет сохранить все полезные свойства. Подходит для жарки, салатов и фарширования.",
        weight: "1 кг",
        shelfLife: "18 месяцев",
        origin: "Перу",
        storage: "-18°C и ниже"
    },
    {
        id: 5,
        name: "Филе трески",
        category: "fillets",
        price: 650,
        image: "🐟",
        popular: false,
        description: "Филе трески без кожи и костей. Диетический продукт с высоким содержанием белка. Отлично подходит для детского и диетического питания.",
        weight: "1 кг",
        shelfLife: "12 месяцев",
        origin: "Баренцево море",
        storage: "-18°C и ниже"
    },
    {
        id: 6,
        name: "Мидии в раковинах",
        category: "seafood",
        price: 850,
        image: "🐚",
        popular: true,
        description: "Мидии в раковинах, приготовленные на пару и замороженные. Уже готовы к употреблению после разморозки. Идеальны для пасты, супов и самостоятельных блюд.",
        weight: "1 кг",
        shelfLife: "12 месяцев",
        origin: "Чили",
        storage: "-18°C и ниже"
    },
    {
        id: 7,
        name: "Стейки лосося",
        category: "fillets",
        price: 1100,
        image: "🥩",
        popular: false,
        description: "Стейки лосося нарезанные поперек тушки. Идеальная толщина для приготовления на гриле или сковороде. Каждый стейк упакован индивидуально.",
        weight: "1 шт (~200г)",
        shelfLife: "12 месяцев",
        origin: "Норвегия",
        storage: "-18°C и ниже"
    },
    {
        id: 8,
        name: "Осьминог",
        category: "seafood",
        price: 2200,
        image: "🐙",
        popular: false,
        description: "Осьминог средиземноморский, предварительно очищенный. Нежное мясо, которое становится мягким при правильном приготовлении. Деликатес для истинных гурманов.",
        weight: "1 кг",
        shelfLife: "12 месяцев",
        origin: "Марокко",
        storage: "-18°C и ниже"
    },
    {
        id: 9,
        name: "Дорадо",
        category: "fresh",
        price: 950,
        image: "🐟",
        popular: true,
        description: "Свежая дорадо (морской карась). Мясо белое, нежное, с минимальным количеством костей. Идеальна для запекания целиком с травами и лимоном.",
        weight: "1 кг",
        shelfLife: "5 дней",
        origin: "Греция",
        storage: "0°C до +2°C"
    },
    {
        id: 10,
        name: "Камбала",
        category: "frozen",
        price: 750,
        image: "🐟",
        popular: false,
        description: "Камбала дальневосточная. Нежное диетическое мясо с уникальным вкусом. Отлично подходит для жарки и запекания. Поставляется в потрошеном виде.",
        weight: "1 кг",
        shelfLife: "12 месяцев",
        origin: "Дальний Восток",
        storage: "-18°C и ниже"
    },
    {
        id: 11,
        name: "Икра лососевая",
        category: "seafood",
        price: 2500,
        image: "🥫",
        popular: true,
        description: "Икра лососевая зернистая. Натуральный продукт без искусственных красителей. Идеальна для бутербродов, блинчиков и украшения блюд.",
        weight: "100 г",
        shelfLife: "6 месяцев",
        origin: "Камчатка",
        storage: "0°C до +4°C"
    },
    {
        id: 12,
        name: "Филе пангасиуса",
        category: "fillets",
        price: 450,
        image: "🐟",
        popular: false,
        description: "Филе пангасиуса без кожи и костей. Экономичный вариант для ежедневного питания. Подходит для жарки, запекания и приготовления котлет.",
        weight: "1 кг",
        shelfLife: "12 месяцев",
        origin: "Вьетнам",
        storage: "-18°C и ниже"
    }
];

const featuredProductIds = [11, 1, 3, 8, 9, 6];

// Корзина
let cart = window.FishSite?.getCart() || [];
let cartCount = 0;

// Избранное
let favorites = window.FishSite?.getFavoriteIds ? window.FishSite.getFavoriteIds() : [];

// DOM элементы
const productsGrid = document.querySelector('.products-grid');
const featuredCarouselTrack = document.querySelector('.featured-carousel-track');
const featuredCarouselDots = document.querySelector('.featured-carousel-dots');
const featuredCarouselPrev = document.querySelector('.carousel-prev');
const featuredCarouselNext = document.querySelector('.carousel-next');
const cartIcon = document.querySelector('.cart-icon');
const cartCountElement = document.querySelector('.cart-count');
const cartModal = document.getElementById('cart-modal');
const closeModal = document.querySelector('.close-modal');
const cartItems = document.querySelector('.cart-items');
const totalPriceElement = document.querySelector('.total-price');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort');
const catalogSearchInput = document.getElementById('catalog-search');
const priceRangeInput = document.getElementById('price-range');
const priceRangeValue = document.getElementById('price-range-value');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('.nav');
const catalogSearchScores = new Map();
let catalogSearchRequestId = 0;

const SEARCH_SYNONYM_GROUPS = [
    ['семга', 'сёмга', 'лосось', 'лососевый', 'salmon'],
    ['форель', 'trout'],
    ['треска', 'cod'],
    ['пангасиус', 'pangasius'],
    ['дорадо', 'дорада', 'dorade', 'sea bream'],
    ['камбала', 'flounder'],
    ['креветка', 'креветки', 'shrimp', 'prawn'],
    ['кальмар', 'squid', 'calamari'],
    ['мидия', 'мидии', 'mussel', 'mussels'],
    ['осьминог', 'octopus'],
    ['икра', 'caviar'],
    ['рыба', 'рыбка', 'рыбный'],
    ['филе', 'филейный', 'fillet'],
    ['стейк', 'стейки', 'steak'],
    ['морепродукт', 'морепродукты', 'дары моря', 'seafood'],
    ['охлажденный', 'охлажденная', 'охлажденное', 'свежий', 'свежая', 'fresh'],
    ['замороженный', 'замороженная', 'замороженное', 'мороженый', 'мороз', 'frozen'],
    ['премиум', 'премиальный', 'premium'],
    ['ресторан', 'ресторана', 'restaurant', 'chef'],
    ['гриль', 'сковорода', 'жарка', 'запекание', 'духовка']
];

const SEARCH_SYNONYMS = SEARCH_SYNONYM_GROUPS.reduce((dictionary, group) => {
    const normalizedGroup = [...new Set(group.flatMap(term => tokenizeSearchText(term)))];
    normalizedGroup.forEach(term => {
        dictionary[term] = normalizedGroup.filter(alias => alias !== term);
    });
    return dictionary;
}, {});

// DOM элементы для авторизации
const loginBtn = document.getElementById('login-btn');
const authModal = document.getElementById('auth-modal');
const authCloseBtn = document.querySelector('.auth-close');
const authForm = document.getElementById('auth-form');
const userMenu = document.getElementById('user-menu');
const userAvatar = document.getElementById('user-avatar');
const userDropdown = document.getElementById('user-dropdown');
const logoutBtn = document.getElementById('logout-btn');
const togglePasswordBtn = document.getElementById('toggle-password');
const forgotPasswordLink = document.querySelector('.forgot-password');
const registerLink = document.querySelector('.register-link');

// DOM элементы для оформления заказа
const checkoutBtn = document.querySelector('.checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutBtn = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');
const checkoutTotal = document.querySelector('.checkout-total');
let checkoutStep = 0;
let checkoutWizardReady = false;
const checkoutSteps = [
    { key: 'cart', label: 'Корзина' },
    { key: 'contacts', label: 'Контакты' },
    { key: 'delivery', label: 'Доставка' },
    { key: 'confirm', label: 'Подтверждение' }
];

// DOM элементы для модального окна товара
const productModal = document.createElement('div');
productModal.className = 'modal';
productModal.id = 'product-modal';
productModal.innerHTML = `
    <div class="modal-content product-modal-content">
        <button class="close-modal" id="close-product-modal">&times;</button>
        <div class="product-modal-body">
            <div class="product-modal-container">
                <!-- Контент будет добавляться динамически -->
            </div>
        </div>
    </div>
`;
document.body.appendChild(productModal);
const closeProductModal = document.getElementById('close-product-modal');
const productModalContainer = document.querySelector('.product-modal-container');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    initMap();
    generateUnderwaterScene();
    await window.FishSite?.init?.();
    cart = window.FishSite?.getCart ? window.FishSite.getCart() : [];
    favorites = window.FishSite?.getFavoriteIds ? window.FishSite.getFavoriteIds() : [];
    await loadProducts();
    renderFeaturedCarousel();
    initEventListeners();
    if (productsGrid) {
        renderProductSkeletons();
        window.setTimeout(() => {
            renderProducts(products);
            applyInitialCategoryFilter();
        }, 160);
    }
    updateCartCount();
    checkAuth();
    updateFavoritesCount();
    handleAuthRedirectMessage();
    initInputMasks(document);
    initConsultantChat();
});

function handleAuthRedirectMessage() {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('auth_error');
    if (!error) return;

    const messages = {
        oauth_not_configured: 'Вход через Google/VK не настроен: нужны OAuth-ключи в переменных окружения.'
    };
    showNotification(messages[error] || 'Не удалось выполнить вход через внешний сервис', 'error');
    params.delete('auth_error');
    const cleanQuery = params.toString();
    const nextUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', nextUrl);
}

async function loadProducts() {
    if (!window.FishSite?.getProducts) return;
    products = await window.FishSite.getProducts();
    window.products = products;
    if (products.offline) {
        showNotification('API недоступен, каталог открыт в демо-режиме', 'warning');
    }
}

function productImageMarkup(product, className = '') {
    if (window.FishSite?.formatProductImage) {
        return window.FishSite.formatProductImage(product, className);
    }
    return `<span>${escapeHtml(product.image || product.imageSymbol || '')}</span>`;
}

function normalizeEmailInputValue(value) {
    return String(value || '').replace(/\s+/g, '').toLowerCase();
}

function normalizePhoneDigits(value) {
    let digits = String(value || '').replace(/\D+/g, '');
    if (digits.length > 11) digits = digits.slice(0, 11);
    if (digits.length === 11 && digits.startsWith('8')) {
        digits = `7${digits.slice(1)}`;
    }
    if (digits.length === 10) {
        digits = `7${digits}`;
    }
    if (digits && !digits.startsWith('7')) {
        digits = `7${digits.slice(-10)}`;
    }
    return digits.slice(0, 11);
}

function formatPhoneInputValue(value) {
    const digits = normalizePhoneDigits(value);
    if (!digits) return '';

    const national = digits.startsWith('7') ? digits.slice(1) : digits;
    const part1 = national.slice(0, 3);
    const part2 = national.slice(3, 6);
    const part3 = national.slice(6, 8);
    const part4 = national.slice(8, 10);

    let formatted = '+7';
    if (part1) formatted += ` (${part1}`;
    if (part1.length === 3) formatted += ')';
    if (part2) formatted += ` ${part2}`;
    if (part3) formatted += `-${part3}`;
    if (part4) formatted += `-${part4}`;
    return formatted;
}

function normalizePhoneForSubmit(value) {
    const digits = normalizePhoneDigits(value);
    return digits.length === 11 ? `+${digits}` : '';
}

function initInputMasks(root = document) {
    root.querySelectorAll('input[type="tel"]').forEach(input => {
        input.placeholder = '+7 (___) ___-__-__';
        input.inputMode = 'tel';
        input.autocomplete = input.autocomplete || 'tel';
        input.pattern = '^\\+7 \\([0-9]{3}\\) [0-9]{3}-[0-9]{2}-[0-9]{2}$';
        input.maxLength = 18;
        input.addEventListener('input', () => {
            input.value = formatPhoneInputValue(input.value);
        });
        input.addEventListener('blur', () => {
            input.value = formatPhoneInputValue(input.value);
        });
    });

    root.querySelectorAll('input[type="email"]').forEach(input => {
        input.inputMode = 'email';
        input.autocomplete = input.autocomplete || 'email';
        input.addEventListener('blur', () => {
            input.value = normalizeEmailInputValue(input.value);
        });
    });
}

function getNormalizedEmailInput(id) {
    const input = document.getElementById(id);
    if (!input) return '';
    input.value = normalizeEmailInputValue(input.value);
    return input.value;
}

function getNormalizedPhoneInput(id) {
    const input = document.getElementById(id);
    if (!input) return '';
    const phone = normalizePhoneForSubmit(input.value);
    input.value = formatPhoneInputValue(input.value);
    return phone;
}

// Инициализация обработчиков событий
function initEventListeners() {
    // Мобильное меню
    mobileMenuToggle?.addEventListener('click', toggleMobileMenu);
    
    // Корзина
    cartIcon?.addEventListener('click', openCartModal);
    closeModal?.addEventListener('click', closeCartModal);
    document.querySelector('.close-cart')?.addEventListener('click', closeCartModal);
    
    // Фильтры
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });
    
    // Сортировка
    sortSelect?.addEventListener('change', handleSortChange);
    catalogSearchInput?.addEventListener('input', () => renderCurrentCatalogView());
    catalogSearchInput?.addEventListener('search', () => renderCurrentCatalogView());
    priceRangeInput?.addEventListener('input', () => {
        if (priceRangeValue) priceRangeValue.textContent = priceRangeInput.value;
        renderCurrentCatalogView();
    });
    initCatalogSearchSuggestions();

    initFeaturedCarouselControls();
    
    // Закрытие модального окна при клике вне его
    cartModal?.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });
    
    // Формы
    document.getElementById('contact-form')?.addEventListener('submit', handleContactFormSubmit);
    document.getElementById('delivery-calculator')?.addEventListener('submit', handleDeliveryFormSubmit);
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Интерактивность для аквариума
    const fishBowl = document.getElementById('fishBowl');
    if (fishBowl) {
        fishBowl.addEventListener('click', function() {
            createSplashEffect(this);
        });
    }
    
    // Авторизация
    loginBtn?.addEventListener('click', openAuthModal);
    authCloseBtn?.addEventListener('click', closeAuthModal);
    authForm?.addEventListener('submit', handleAuthSubmit);
    
    // Меню пользователя
    userAvatar?.addEventListener('click', toggleUserDropdown);
    logoutBtn?.addEventListener('click', handleLogout);
    
    // Переключение видимости пароля
    togglePasswordBtn?.addEventListener('click', togglePasswordVisibility);
    
    // Ссылки в форме авторизации
    forgotPasswordLink?.addEventListener('click', handleForgotPassword);
    registerLink?.addEventListener('click', handleRegister);
    document.querySelectorAll('.btn-social').forEach(button => {
        button.addEventListener('click', () => {
            const text = button.textContent.toLowerCase();
            window.FishSite?.startOAuth?.(text.includes('vk') ? 'vk' : 'google');
        });
    });
    
    // Закрытие меню пользователя при клике вне его
    document.addEventListener('click', function(e) {
        if (userAvatar && userDropdown && !userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
    
    // Закрытие модального окна авторизации при клике вне его
    authModal?.addEventListener('click', function(e) {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });
    
    // Оформление заказа
    checkoutBtn?.addEventListener('click', openCheckoutModal);
    closeCheckoutBtn?.addEventListener('click', closeCheckoutModal);
    checkoutForm?.addEventListener('submit', handleCheckoutSubmit);
    checkoutForm?.addEventListener('click', handleCheckoutWizardClick);
    
    checkoutModal?.addEventListener('click', function(e) {
        if (e.target === checkoutModal) {
            closeCheckoutModal();
        }
    });
    
    // Модальное окно товара
    closeProductModal?.addEventListener('click', closeProductModalWindow);
    
    productModal?.addEventListener('click', function(e) {
        if (e.target === productModal) {
            closeProductModalWindow();
        }
    });
}

function initConsultantChat() {
    if (document.querySelector('.consultant-chat-widget')) return;

    const widget = document.createElement('div');
    widget.className = 'consultant-chat-widget';
    widget.innerHTML = `
        <div class="consultant-chat-popover" role="button" tabindex="0" aria-label="Открыть чат с консультантом">
            <button class="consultant-popover-close" type="button" aria-label="Скрыть уведомление">
                <i class="fas fa-times"></i>
            </button>
            <div class="consultant-avatar" aria-hidden="true">
                <i class="fas fa-headset"></i>
            </div>
            <div class="consultant-popover-copy">
                <span>Консультант онлайн</span>
                <strong>Помочь с выбором?</strong>
                <p>Подберем рыбу, упаковку и удобное окно доставки.</p>
            </div>
        </div>

        <section class="consultant-chat-panel" aria-label="Чат с консультантом" aria-hidden="true">
            <header class="consultant-chat-header">
                <div class="consultant-avatar" aria-hidden="true">
                    <i class="fas fa-headset"></i>
                </div>
                <div>
                    <span>Private seafood concierge</span>
                    <strong>Консультант Морские Дары</strong>
                </div>
                <button class="consultant-chat-close" type="button" aria-label="Закрыть чат">
                    <i class="fas fa-times"></i>
                </button>
            </header>
            <div class="consultant-chat-body">
                <div class="consultant-message consultant-message-bot">
                    Добрый день. Подскажу по свежести, разделке, доставке и подборке под ужин.
                </div>
                <div class="consultant-quick-actions" aria-label="Быстрые вопросы">
                    <button type="button" data-message="Помогите подобрать рыбу на ужин">Подбор на ужин</button>
                    <button type="button" data-message="Какая доставка доступна сегодня?">Доставка сегодня</button>
                    <button type="button" data-message="Нужна подборка для ресторана">Для ресторана</button>
                </div>
            </div>
            <form class="consultant-chat-form">
                <label class="sr-only" for="consultant-message">Сообщение консультанту</label>
                <input id="consultant-message" type="text" placeholder="Напишите вопрос..." autocomplete="off">
                <button type="submit" aria-label="Отправить сообщение">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </form>
        </section>

        <button class="consultant-chat-trigger" type="button" aria-label="Открыть чат с консультантом">
            <i class="fas fa-comments"></i>
            <span class="consultant-chat-dot" aria-hidden="true"></span>
        </button>
    `;

    document.body.appendChild(widget);

    const popover = widget.querySelector('.consultant-chat-popover');
    const popoverClose = widget.querySelector('.consultant-popover-close');
    const panel = widget.querySelector('.consultant-chat-panel');
    const trigger = widget.querySelector('.consultant-chat-trigger');
    const closeButton = widget.querySelector('.consultant-chat-close');
    const form = widget.querySelector('.consultant-chat-form');
    const input = widget.querySelector('#consultant-message');
    const body = widget.querySelector('.consultant-chat-body');
    const quickButtons = widget.querySelectorAll('.consultant-quick-actions button');
    let currentThreadId = null;
    let chatPollTimer = null;
    let renderedMessagesSignature = '';

    const openChat = async () => {
        widget.classList.add('chat-open');
        widget.classList.remove('chat-popover-visible');
        panel.setAttribute('aria-hidden', 'false');
        window.setTimeout(() => input?.focus(), 120);
        await loadChatThread();
        startChatPolling();
    };

    const closeChat = () => {
        widget.classList.remove('chat-open');
        panel.setAttribute('aria-hidden', 'true');
        stopChatPolling();
        trigger?.focus();
    };

    const hidePopover = () => {
        widget.classList.remove('chat-popover-visible');
        sessionStorage.setItem('consultantChatPopoverClosed', 'true');
    };

    const addMessage = (message, type = 'user') => {
        const messageElement = document.createElement('div');
        messageElement.className = `consultant-message consultant-message-${type}`;
        messageElement.textContent = message;
        body.appendChild(messageElement);
        body.scrollTop = body.scrollHeight;
    };

    const bindQuickActions = (container) => {
        container.querySelectorAll('.consultant-quick-actions button').forEach(button => {
            button.addEventListener('click', () => {
                sendMessage(button.dataset.message || button.textContent);
            });
        });
    };

    const renderMessages = (messages = []) => {
        const signature = JSON.stringify(messages.map(item => [item.id, item.senderRole, item.body, item.createdAt]));
        if (signature === renderedMessagesSignature) return;
        renderedMessagesSignature = signature;

        body.innerHTML = '';
        if (!messages.length) {
            body.innerHTML = `
                <div class="consultant-message consultant-message-bot">
                    Добрый день. Подскажу по свежести, разделке, доставке и подборке под ужин.
                </div>
                <div class="consultant-quick-actions" aria-label="Быстрые вопросы">
                    <button type="button" data-message="Помогите подобрать рыбу на ужин">Подбор на ужин</button>
                    <button type="button" data-message="Какая доставка доступна сегодня?">Доставка сегодня</button>
                    <button type="button" data-message="Нужна подборка для ресторана">Для ресторана</button>
                </div>
            `;
            bindQuickActions(body);
            return;
        }

        messages.forEach(item => {
            addMessage(item.body, item.senderRole === 'customer' ? 'user' : 'bot');
        });
    };

    const loadChatThread = async () => {
        if (!window.FishSite?.request) return;
        try {
            const data = await window.FishSite.request('/chat/thread');
            currentThreadId = data.thread?.id || null;
            renderMessages(data.messages || []);
        } catch {
            body.innerHTML = '';
            addMessage('Не удалось загрузить чат. Проверьте подключение к серверу и попробуйте еще раз.', 'bot');
        }
    };

    const refreshChatMessages = async () => {
        if (!window.FishSite?.request || !widget.classList.contains('chat-open')) return;
        try {
            const data = await window.FishSite.request('/chat/messages');
            currentThreadId = data.thread?.id || currentThreadId;
            renderMessages(data.messages || []);
        } catch {
            stopChatPolling();
        }
    };

    const startChatPolling = () => {
        stopChatPolling();
        chatPollTimer = window.setInterval(refreshChatMessages, 6000);
    };

    const stopChatPolling = () => {
        if (!chatPollTimer) return;
        window.clearInterval(chatPollTimer);
        chatPollTimer = null;
    };

    const sendMessage = async (message) => {
        const cleanMessage = message.trim();
        if (!cleanMessage) return;

        addMessage(cleanMessage, 'user');
        input.value = '';
        input.disabled = true;

        try {
            await window.FishSite.request('/chat/messages', {
                method: 'POST',
                body: JSON.stringify({ message: cleanMessage, threadId: currentThreadId })
            });
            const data = await window.FishSite.request('/chat/messages');
            currentThreadId = data.thread?.id || currentThreadId;
            renderMessages(data.messages || []);
        } catch {
            addMessage('Сообщение не отправилось. Попробуйте еще раз через несколько секунд.', 'bot');
        } finally {
            input.disabled = false;
            input.focus();
        }
    };

    trigger?.addEventListener('click', openChat);
    closeButton?.addEventListener('click', closeChat);

    popover?.addEventListener('click', openChat);
    popover?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openChat();
        }
    });

    window.addEventListener('beforeunload', stopChatPolling);

    popoverClose?.addEventListener('click', (event) => {
        event.stopPropagation();
        hidePopover();
    });

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        sendMessage(input.value);
    });

    bindQuickActions(widget);

    window.setTimeout(() => {
        if (!sessionStorage.getItem('consultantChatPopoverClosed') && !widget.classList.contains('chat-open')) {
            widget.classList.add('chat-popover-visible');
        }
    }, 1800);
}

function initCatalogSearchSuggestions() {
    if (!catalogSearchInput || document.querySelector('.catalog-search-suggestions')) return;

    const suggestions = [
        { label: 'семга', value: 'семга' },
        { label: 'креветки', value: 'креветки' },
        { label: 'икра', value: 'икра' },
        { label: 'для гриля', value: 'гриль' },
        { label: 'до 1000 руб.', value: 'до 1000' }
    ];
    const row = catalogSearchInput.closest('.catalog-search-row');
    const panel = document.createElement('div');
    panel.className = 'catalog-search-suggestions';
    panel.setAttribute('aria-label', 'Подсказки поиска');
    panel.innerHTML = suggestions.map(item => `
        <button type="button" data-search="${item.value}">${item.label}</button>
    `).join('');

    row?.insertAdjacentElement('afterend', panel);
    panel.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            catalogSearchInput.value = button.dataset.search || '';
            catalogSearchInput.focus();
            renderCurrentCatalogView();
        });
    });
}

function getFeaturedProducts() {
    return featuredProductIds
        .map(id => products.find(product => product.id === id))
        .filter(Boolean);
}

function renderFeaturedCarousel() {
    if (!featuredCarouselTrack) return;

    featuredCarouselTrack.innerHTML = '';

    getFeaturedProducts().forEach(product => {
        const card = createFeaturedProductCard(product);
        featuredCarouselTrack.appendChild(card);
    });

    requestAnimationFrame(() => {
        renderFeaturedCarouselDots();
        updateFeaturedCarouselState();
    });
}

function createFeaturedProductCard(product) {
    const card = document.createElement('article');
    card.className = 'featured-product-card';
    card.dataset.id = product.id;
    card.dataset.category = product.category;
    card.innerHTML = `
        <div class="featured-product-visual featured-product-visual-${escapeHtml(product.category)}">
            <span class="featured-product-icon" aria-hidden="true">${productImageMarkup(product, 'product-art-image')}</span>
            <button class="favorite-btn ${favorites.includes(product.id) ? 'active' : ''}" data-id="${product.id}" aria-label="Добавить в избранное">
                <i class="fas fa-heart"></i>
            </button>
        </div>
        <div class="featured-product-content">
            <span class="product-category">${escapeHtml(getCategoryName(product.category))}</span>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.description)}</p>
            <div class="featured-product-meta">
                <span>${escapeHtml(product.origin)}</span>
                <span>${escapeHtml(product.storage)}</span>
            </div>
            <div class="featured-product-footer">
                <strong>${escapeHtml(product.price)} руб./кг</strong>
                <div class="featured-product-actions">
                    <button class="btn btn-outline featured-details" type="button" data-id="${product.id}">Подробнее</button>
                    <button class="btn btn-primary featured-add" type="button" data-id="${product.id}" aria-label="Добавить в корзину">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    card.querySelector('.favorite-btn')?.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleFavorite(product.id, event.currentTarget);
    });

    card.querySelector('.featured-details')?.addEventListener('click', (event) => {
        event.stopPropagation();
        openProductModal(product.id);
    });

    card.querySelector('.featured-add')?.addEventListener('click', (event) => {
        event.stopPropagation();
        addToCart(product.id, 1);
    });

    card.addEventListener('click', () => openProductModal(product.id));
    return card;
}

function renderFeaturedCarouselDots() {
    if (!featuredCarouselDots) return;

    featuredCarouselDots.innerHTML = '';
    const featuredCount = getFeaturedProducts().length;
    const maxScroll = Math.max(0, featuredCarouselTrack.scrollWidth - featuredCarouselTrack.clientWidth);
    const step = getFeaturedCarouselStep();
    const dotCount = Math.max(1, Math.min(featuredCount, Math.ceil(maxScroll / step) + 1));

    Array.from({ length: dotCount }).forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'featured-carousel-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Показать позицию ${index + 1}`);
        dot.addEventListener('click', () => scrollFeaturedCarouselTo(index));
        featuredCarouselDots.appendChild(dot);
    });
}

function initFeaturedCarouselControls() {
    if (!featuredCarouselTrack) return;

    featuredCarouselPrev?.addEventListener('click', () => {
        featuredCarouselTrack.scrollBy({ left: -getFeaturedCarouselStep(), behavior: 'smooth' });
    });

    featuredCarouselNext?.addEventListener('click', () => {
        featuredCarouselTrack.scrollBy({ left: getFeaturedCarouselStep(), behavior: 'smooth' });
    });

    featuredCarouselTrack.addEventListener('scroll', updateFeaturedCarouselState, { passive: true });
    window.addEventListener('resize', () => {
        renderFeaturedCarouselDots();
        updateFeaturedCarouselState();
    });
}

function getFeaturedCarouselStep() {
    const firstCard = featuredCarouselTrack?.querySelector('.featured-product-card');
    if (!firstCard) return 320;

    const trackStyles = window.getComputedStyle(featuredCarouselTrack);
    const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || 0);
    return firstCard.getBoundingClientRect().width + gap;
}

function scrollFeaturedCarouselTo(index) {
    if (!featuredCarouselTrack) return;

    featuredCarouselTrack.scrollTo({
        left: getFeaturedCarouselStep() * index,
        behavior: 'smooth'
    });
}

function updateFeaturedCarouselState() {
    if (!featuredCarouselTrack) return;

    const step = getFeaturedCarouselStep();
    const dots = [...(featuredCarouselDots?.querySelectorAll('.featured-carousel-dot') || [])];
    const activeIndex = Math.min(
        dots.length - 1,
        Math.round(featuredCarouselTrack.scrollLeft / step)
    );
    const maxScroll = featuredCarouselTrack.scrollWidth - featuredCarouselTrack.clientWidth;

    if (featuredCarouselPrev) {
        featuredCarouselPrev.disabled = featuredCarouselTrack.scrollLeft <= 4;
    }

    if (featuredCarouselNext) {
        featuredCarouselNext.disabled = featuredCarouselTrack.scrollLeft >= maxScroll - 4;
    }

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}

// Рендер товаров
function renderProducts(productsToRender) {
    if (!productsGrid) return;

    productsGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">Товары не найдены</div>';
        return;
    }
    
    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function renderProductSkeletons() {
    if (!productsGrid) return;

    productsGrid.innerHTML = Array.from({ length: 6 }, () => `
        <div class="product-card product-card-skeleton" aria-hidden="true">
            <div class="skeleton-image"></div>
            <div class="skeleton-body">
                <span></span>
                <strong></strong>
                <p></p>
                <p></p>
            </div>
        </div>
    `).join('');
}

// Создание карточки товара
function createProductCard(product) {
    const stockRaw = product.stock ?? product.stockQuantity ?? product.stock_quantity;
    const hasStockValue = stockRaw !== undefined && stockRaw !== null && stockRaw !== '';
    const stockValue = Number(stockRaw);
    const isOutOfStock = hasStockValue && Number.isFinite(stockValue) && stockValue <= 0;
    const stockLabel = isOutOfStock ? 'Нет в наличии' : 'В наличии';
    const card = document.createElement('div');
    card.className = `product-card${isOutOfStock ? ' product-card--unavailable' : ''}`;
    card.dataset.id = product.id;
    
    card.innerHTML = `
        <button class="favorite-btn ${favorites.includes(product.id) ? 'active' : ''}" data-id="${Number(product.id)}">
            <i class="fas fa-heart"></i>
        </button>
        <div class="product-card-content">
            <div class="product-image">
                <span>${productImageMarkup(product, 'product-art-image')}</span>
                <div class="product-card-status">
                    <small class="product-badge">${escapeHtml(getProductBadge(product))}</small>
                    <small class="product-stock-chip">${escapeHtml(stockLabel)}</small>
                </div>
            </div>
            <div class="product-info">
                <div class="product-topline">
                    <span class="product-category">${escapeHtml(getCategoryName(product.category))}</span>
                    <span class="product-origin">${escapeHtml(product.origin)}</span>
                </div>
                <h3 class="product-title">${escapeHtml(product.name)}</h3>
                <p class="product-description">${escapeHtml(product.description)}</p>
                <div class="product-meta">
                    <span><i class="fas fa-box"></i>${escapeHtml(product.weight)}</span>
                    <span><i class="fas fa-temperature-low"></i>${escapeHtml(product.storage)}</span>
                </div>
                <div class="product-price-block">
                    <span>Цена за кг</span>
                    <div class="product-price">${escapeHtml(product.price)} руб.</div>
                </div>
                <div class="product-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${product.id}">-</button>
                        <input type="text" class="quantity-input" value="1" readonly data-id="${product.id}">
                        <button class="quantity-btn plus" data-id="${product.id}">+</button>
                    </div>
                    <a class="product-details-link" href="${getProductPageHref(product)}" aria-label="Открыть страницу товара">
                        <i class="fas fa-arrow-up-right-from-square"></i>
                    </a>
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}" ${isOutOfStock ? 'disabled aria-disabled="true"' : ''}>
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Обработчики для кнопок количества и добавления в корзину
    const minusBtn = card.querySelector('.minus');
    const plusBtn = card.querySelector('.plus');
    const quantityInput = card.querySelector('.quantity-input');
    const addToCartBtn = card.querySelector('.add-to-cart');
    const favoriteBtn = card.querySelector('.favorite-btn');
    const detailsLink = card.querySelector('.product-details-link');
    const productContent = card.querySelector('.product-card-content');
    
    minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        changeQuantity(product.id, -1, quantityInput);
    });
    
    plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        changeQuantity(product.id, 1, quantityInput);
    });
    
    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product.id, parseInt(quantityInput.value));
    });
    
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(product.id, favoriteBtn);
    });

    detailsLink.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Открытие карточки товара при клике на контент
    productContent.addEventListener('click', () => {
        openProductModal(product.id);
    });
    
    return card;
}

// Изменение количества товара
function changeQuantity(productId, change, inputElement) {
    let quantity = parseInt(inputElement.value);
    quantity += change;
    
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    
    inputElement.value = quantity;
}

// Добавление в корзину
async function addToCart(productId, quantity) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;

    try {
        cart = window.FishSite?.addToCart ? await window.FishSite.addToCart(product, quantity) : [...cart, { ...product, quantity }];
        updateCartCount();
        showNotification(`Товар "${product.name}" добавлен в корзину!`);
    } catch (error) {
        showNotification(error.message || 'Не удалось добавить товар в корзину', 'error');
    }
}

// Обновление счетчика корзины
function updateCartCount() {
    cart = window.FishSite?.getCart ? window.FishSite.getCart() : cart;
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = cartCount;
    window.FishSite?.updateCartBadges?.();
}

// Открытие модального окна корзины
function openCartModal() {
    renderCartItems();
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна корзины
function closeCartModal() {
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Рендер товаров в корзине
function renderCartItems() {
    cart = window.FishSite?.getCart ? window.FishSite.getCart() : cart;
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        totalPriceElement.textContent = '0';
        return;
    }
    
    let totalPrice = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-image">
                    ${productImageMarkup(item, 'cart-item-art')}
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${item.price} руб./кг</div>
                </div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="text" class="quantity-input" value="${item.quantity}" readonly data-id="${item.id}">
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
        
        // Обработчики для кнопок в корзине
        const minusBtn = cartItem.querySelector('.minus');
        const plusBtn = cartItem.querySelector('.plus');
        const quantityInput = cartItem.querySelector('.quantity-input');
        const removeBtn = cartItem.querySelector('.remove-item');
        
        minusBtn.addEventListener('click', () => updateCartItemQuantity(item.id, -1));
        plusBtn.addEventListener('click', () => updateCartItemQuantity(item.id, 1));
        removeBtn.addEventListener('click', () => removeFromCart(item.id));
    });
    
    totalPriceElement.textContent = totalPrice;
}

// Обновление количества товара в корзине
async function updateCartItemQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity < 1) {
        await removeFromCart(productId);
    } else {
        if (window.FishSite?.updateCartItem) {
            cart = await window.FishSite.updateCartItem(productId, change);
        } else if (window.FishSite?.setCart) {
            cart = await window.FishSite.setCart(cart);
        }
        updateCartCount();
        renderCartItems();
    }
}

// Удаление из корзины
async function removeFromCart(productId) {
    cart = window.FishSite?.removeFromCart ? await window.FishSite.removeFromCart(productId) : cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCartItems();
    showNotification('Товар удален из корзины');
}

// Обработчик фильтров
function handleFilterClick(e) {
    const button = e.target.closest('.filter-btn');
    const category = button?.dataset.category;
    
    // Обновляем активную кнопку
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button?.classList.add('active');
    renderCurrentCatalogView(category);
}

// Обработчик сортировки
function handleSortChange() {
    renderCurrentCatalogView();
}

async function renderCurrentCatalogView(forcedCategory) {
    const currentFilter = forcedCategory || document.querySelector('.filter-btn.active')?.dataset.category || 'all';
    let sourceProducts = products;
    const search = catalogSearchInput?.value.trim() || '';
    const requestId = ++catalogSearchRequestId;

    if (search && window.FishSite?.searchProducts) {
        try {
            sourceProducts = await window.FishSite.searchProducts(search);
            if (requestId !== catalogSearchRequestId) return;
        } catch {
            sourceProducts = products;
        }
    }

    const filteredProducts = applyCatalogControls(filterProductsByCategory(currentFilter, sourceProducts));
    renderProducts(applySorting(filteredProducts, sortSelect?.value || 'popular'));
}

function applyCatalogControls(items) {
    const search = catalogSearchInput?.value.trim() || '';
    const query = buildCatalogSearchQuery(search);
    const maxPrice = Number(priceRangeInput?.value || Infinity);

    catalogSearchScores.clear();

    return items.filter(product => {
        const searchScore = query ? scoreCatalogProduct(product, query) : 0;
        const matchesSearch = !query || searchScore > 0;
        if (matchesSearch && query) {
            catalogSearchScores.set(product.id, searchScore);
        }
        return matchesSearch && Number(product.price) <= maxPrice;
    });
}

function buildCatalogSearchQuery(search) {
    const normalized = normalizeSearchText(search);
    const tokens = tokenizeSearchText(search);

    if (!tokens.length) return null;

    return {
        phrase: normalized,
        phraseVariants: expandSearchPhrase(normalized),
        tokens: tokens.map(token => ({
            value: token,
            variants: expandSearchToken(token)
        }))
    };
}

function expandSearchPhrase(phrase) {
    return [...new Set([
        phrase,
        normalizeSearchText(convertKeyboardLayout(phrase, 'enToRu')),
        normalizeSearchText(convertKeyboardLayout(phrase, 'ruToEn'))
    ].filter(Boolean))];
}

function expandSearchToken(token) {
    const variants = new Set([
        token,
        stemSearchToken(token),
        normalizeSearchText(convertKeyboardLayout(token, 'enToRu')),
        normalizeSearchText(convertKeyboardLayout(token, 'ruToEn'))
    ]);

    (SEARCH_SYNONYMS[token] || []).forEach(alias => {
        variants.add(alias);
        variants.add(stemSearchToken(alias));
    });

    return [...variants].filter(value => value && value.length > 1);
}

function scoreCatalogProduct(product, query) {
    const index = getCatalogSearchIndex(product);
    let totalScore = 0;

    query.phraseVariants.forEach(phrase => {
        if (phrase.length > 2 && index.full.includes(phrase)) {
            totalScore += phrase.length > 8 ? 120 : 70;
        }
    });

    const tokenScores = query.tokens.map(tokenQuery => scoreCatalogToken(index, tokenQuery.variants));

    if (tokenScores.some(score => score <= 0)) {
        return 0;
    }

    totalScore += tokenScores.reduce((sum, score) => sum + score, 0);
    return totalScore;
}

function scoreCatalogToken(index, variants) {
    let bestScore = 0;

    index.fields.forEach(field => {
        variants.forEach(variant => {
            if (!variant) return;

            if (field.text.includes(variant)) {
                bestScore = Math.max(bestScore, field.weight);
            }

            if (field.tokens.has(variant)) {
                bestScore = Math.max(bestScore, field.weight + 18);
            }

            field.tokenList.forEach(token => {
                if (token.startsWith(variant) || variant.startsWith(token)) {
                    bestScore = Math.max(bestScore, field.weight * 0.82);
                }

                if (isCloseSearchToken(token, variant)) {
                    bestScore = Math.max(bestScore, field.weight * 0.68);
                }
            });
        });
    });

    return bestScore;
}

function getCatalogSearchIndex(product) {
    const categoryName = getCategoryName(product.category);
    const badge = getProductBadge(product);
    const fields = [
        { value: product.name, weight: 64 },
        { value: categoryName, weight: 42 },
        { value: badge, weight: 30 },
        { value: product.origin, weight: 28 },
        { value: product.description, weight: 24 },
        { value: product.weight, weight: 14 },
        { value: product.storage, weight: 12 },
        { value: `${product.price} ${product.price}руб ${product.price} рублей`, weight: 10 }
    ].map(field => {
        const text = normalizeSearchText(field.value);
        const tokenList = tokenizeSearchText(text).flatMap(token => [token, stemSearchToken(token)]);
        const uniqueTokens = [...new Set(tokenList.filter(Boolean))];
        return {
            ...field,
            text,
            tokenList: uniqueTokens,
            tokens: new Set(uniqueTokens)
        };
    });

    return {
        fields,
        full: fields.map(field => field.text).join(' ')
    };
}

function normalizeSearchText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/[#№]/g, ' ')
        .replace(/[^a-zа-я0-9]+/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenizeSearchText(value) {
    return normalizeSearchText(value)
        .split(' ')
        .map(token => token.trim())
        .filter(token => token.length > 1);
}

function stemSearchToken(token) {
    if (!token || token.length < 5) return token;

    return token.replace(
        /(ами|ями|ого|ему|ыми|ими|ая|яя|ое|ее|ые|ие|ый|ий|ой|ом|ем|ам|ям|ах|ях|ов|ев|ей|ую|юю|а|я|ы|и|у|ю|е|о)$/i,
        ''
    );
}

function isCloseSearchToken(token, query) {
    if (!token || !query || token.length < 4 || query.length < 4) return false;

    const lengthDelta = Math.abs(token.length - query.length);
    const maxDistance = Math.min(token.length, query.length) >= 7 ? 2 : 1;

    return lengthDelta <= maxDistance && levenshteinDistance(token, query, maxDistance) <= maxDistance;
}

function levenshteinDistance(source, target, limit = Infinity) {
    if (source === target) return 0;
    if (Math.abs(source.length - target.length) > limit) return limit + 1;

    let previous = Array.from({ length: target.length + 1 }, (_, index) => index);

    for (let i = 1; i <= source.length; i += 1) {
        const current = [i];
        let rowMin = current[0];

        for (let j = 1; j <= target.length; j += 1) {
            const cost = source[i - 1] === target[j - 1] ? 0 : 1;
            const value = Math.min(
                previous[j] + 1,
                current[j - 1] + 1,
                previous[j - 1] + cost
            );
            current[j] = value;
            rowMin = Math.min(rowMin, value);
        }

        if (rowMin > limit) return limit + 1;
        previous = current;
    }

    return previous[target.length];
}

function convertKeyboardLayout(value, direction) {
    const en = "`qwertyuiop[]asdfghjkl;'zxcvbnm,.";
    const ru = "ёйцукенгшщзхъфывапролджэячсмитьбю";
    const from = direction === 'enToRu' ? en : ru;
    const to = direction === 'enToRu' ? ru : en;
    const map = new Map([...from].map((char, index) => [char, to[index] || char]));

    return String(value || '')
        .toLowerCase()
        .split('')
        .map(char => map.get(char) || char)
        .join('');
}

function applyInitialCategoryFilter() {
    if (!productsGrid || !filterButtons.length) return;

    const selectedCategory = new URLSearchParams(window.location.search).get('category');
    if (!selectedCategory) return;

    const selectedButton = document.querySelector(`.filter-btn[data-category="${selectedCategory}"]`);

    if (!selectedButton) return;

    filterButtons.forEach(button => button.classList.remove('active'));
    selectedButton.classList.add('active');

    const filteredProducts = applyCatalogControls(filterProductsByCategory(selectedCategory));

    renderProducts(applySorting(filteredProducts, sortSelect?.value || 'popular'));
}

function filterProductsByCategory(category, sourceProducts = products) {
    switch (category) {
        case 'premium':
            return sourceProducts.filter(product => product.price >= 1100 || [3, 8, 11].includes(product.id));
        case 'restaurant':
            return sourceProducts.filter(product => ['seafood', 'fillets'].includes(product.category) || product.weight.includes('кг'));
        case 'fresh-catch':
            return sourceProducts.filter(product => product.category === 'fresh');
        case 'all':
        default:
            if (!category || category === 'all') return sourceProducts;
            return sourceProducts.filter(product => product.category === category);
    }
}

// Применение сортировки
function applySorting(productsToSort, sortType) {
    const sorted = [...productsToSort];
    const hasActiveSearch = Boolean(catalogSearchInput?.value.trim());
    const compareBySearchRelevance = (a, b) => {
        if (!hasActiveSearch) return 0;
        return (catalogSearchScores.get(b.id) || 0) - (catalogSearchScores.get(a.id) || 0);
    };
    
    switch (sortType) {
        case 'price-asc':
            return sorted.sort((a, b) => compareBySearchRelevance(a, b) || a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => compareBySearchRelevance(a, b) || b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => compareBySearchRelevance(a, b) || a.name.localeCompare(b.name));
        case 'popular':
        default:
            return sorted.sort((a, b) => compareBySearchRelevance(a, b) || (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }
}

// Получение названия категории
function getCategoryName(category) {
    const categories = {
        'fresh': 'Охлажденная рыба',
        'frozen': 'Замороженная рыба',
        'seafood': 'Морепродукты',
        'fillets': 'Филе и стейки',
        'premium': 'Премиум',
        'restaurant': 'Для ресторана',
        'fresh-catch': 'Свежий улов'
    };
    return categories[category] || category;
}

function getProductBadge(product) {
    if (product.price >= 1800 || product.id === 11) return 'Premium';
    if (product.popular) return 'Bestseller';
    if (product.category === 'fresh') return 'Fresh catch';
    return 'Chef pick';
}

// Мобильное меню
function toggleMobileMenu() {
    mobileMenuToggle.classList.toggle('active');
    nav.classList.toggle('active');
}

// Обработчик формы обратной связи
async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = getNormalizedEmailInput('email');
    const message = document.getElementById('message').value;
    
    try {
        await requireFishSite('request').request('/contact-requests', {
            method: 'POST',
            body: JSON.stringify({ name, email, message })
        });
        showNotification('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
        e.target.reset();
    } catch (error) {
        showNotification(error.message || 'Не удалось отправить сообщение', 'error');
    }
}

// Обработчик формы доставки
async function handleDeliveryFormSubmit(e) {
    e.preventDefault();
    
    const address = document.getElementById('address').value;
    const deliveryTime = document.getElementById('delivery-time').value;
    
    try {
        const result = await requireFishSite('request').request('/delivery-requests', {
            method: 'POST',
            body: JSON.stringify({ address, deliveryTime })
        });
        showNotification(`Предварительная стоимость доставки: ${result.estimatedPrice} руб. Менеджер уточнит детали.`);
        e.target.reset();
    } catch (error) {
        showNotification(error.message || 'Не удалось рассчитать доставку', 'error');
    }
}

// Создание эффекта всплеска для аквариума
function createSplashEffect(bowlElement) {
    const splash = document.createElement('div');
    splash.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: splash 0.6s ease-out forwards;
        pointer-events: none;
        z-index: 20;
    `;
    
    bowlElement.appendChild(splash);
    
    setTimeout(() => {
        splash.remove();
    }, 600);
}

// Функции для авторизации
function openAuthModal() {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    
    const email = getNormalizedEmailInput('auth-email');
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }

    try {
        const api = requireFishSite('login');
        const userData = await api.login(email, password);
        updateUserInterface(userData);
        favorites = api.getFavoriteIds ? api.getFavoriteIds() : [];
        cart = api.getCart ? api.getCart() : cart;
        renderFeaturedCarousel();
        renderCurrentCatalogView();
        updateCartCount();
        updateFavoritesCount();
        closeAuthModal();
        showNotification('Вы успешно вошли в систему!');
        authForm.reset();
    } catch (error) {
        showNotification(error.message || 'Не удалось войти', 'error');
    }
}

function toggleUserDropdown() {
    userDropdown.classList.toggle('active');
}

async function handleLogout() {
    await window.FishSite?.logout?.();
    cart = window.FishSite?.getCart ? window.FishSite.getCart() : [];
    favorites = window.FishSite?.getFavoriteIds ? window.FishSite.getFavoriteIds() : [];
    updateUserInterface(null);
    userDropdown.classList.remove('active');
    updateCartCount();
    updateFavoritesCount();
    renderFeaturedCarousel();
    renderCurrentCatalogView();
    showNotification('Вы успешно вышли из системы');
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('auth-password');
    const icon = togglePasswordBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function handleForgotPassword(e) {
    e.preventDefault();
    
    // Закрываем текущее модальное окно
    closeAuthModal();
    
    // Показываем модальное окно восстановления пароля
    showPasswordResetModal();
}

function handleRegister(e) {
    e.preventDefault();
    
    // Закрываем текущее модальное окно
    closeAuthModal();
    
    // Показываем модальное окно регистрации
    showRegistrationModal();
}

function updateUserInterface(userData) {
    if (userData) {
        // Пользователь авторизован
        loginBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        
        // Обновляем данные пользователя
        document.getElementById('user-name').textContent = userData.name;
        document.getElementById('user-email').textContent = userData.email;
        document.getElementById('user-avatar').textContent = userData.initials;
        updateAdminNavigation(userData);
    } else {
        // Пользователь не авторизован
        loginBtn.style.display = 'block';
        userMenu.style.display = 'none';
        updateAdminNavigation(null);
    }
}

function updateAdminNavigation(userData) {
    const userLinks = document.querySelector('.user-links');
    if (!userLinks) return;

    let adminLink = userLinks.querySelector('.admin-dashboard-link');

    if (userData?.role === 'admin') {
        if (!adminLink) {
            adminLink = document.createElement('a');
            adminLink.href = window.location.pathname.includes('/pages/') ? 'admin.html' : 'pages/admin.html';
            adminLink.className = 'admin-dashboard-link';
            adminLink.innerHTML = '<i class="fas fa-chart-line"></i> CRM админа';
            userLinks.insertBefore(adminLink, userLinks.firstChild);
        }
    } else if (adminLink) {
        adminLink.remove();
    }
}

function showPasswordResetModal() {
    const modalHTML = `
        <div class="modal active" id="password-reset-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Восстановление пароля</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="password-reset-info">
                        Введите email, указанный при регистрации. Мы отправим вам ссылку для восстановления пароля.
                    </div>
                    <form id="password-reset-form">
                        <div class="form-group">
                            <label for="reset-email">Email</label>
                            <input type="email" id="reset-email" placeholder="Введите ваш email" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Отправить ссылку</button>
                    </form>
                    <div class="auth-links" style="justify-content: center; margin-top: 20px;">
                        <a href="#" class="back-to-login">Вернуться ко входу</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    const modal = document.getElementById('password-reset-modal');
    initInputMasks(modal);
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('password-reset-form');
    const backLink = modal.querySelector('.back-to-login');
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
        openAuthModal();
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = getNormalizedEmailInput('reset-email');
        
        if (email) {
            showNotification('Ссылка для восстановления пароля отправлена на вашу почту');
            modal.remove();
        } else {
            showNotification('Пожалуйста, введите email', 'error');
        }
    });
    
    backLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.remove();
        openAuthModal();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function showRegistrationModal() {
    const modalHTML = `
        <div class="modal active" id="registration-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Регистрация</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="registration-form">
                        <div class="form-group">
                            <label for="reg-name">Имя</label>
                            <input type="text" id="reg-name" placeholder="Введите ваше имя" required>
                        </div>
                        <div class="form-group">
                            <label for="reg-email">Email</label>
                            <input type="email" id="reg-email" placeholder="Введите ваш email" required>
                        </div>
                        <div class="form-group">
                            <label for="reg-phone">Телефон</label>
                            <input type="tel" id="reg-phone" placeholder="+7 (___) ___-__-__" required>
                        </div>
                        <div class="form-group">
                            <label for="reg-password">Пароль</label>
                            <input type="password" id="reg-password" placeholder="Придумайте пароль" required>
                        </div>
                        <div class="form-group">
                            <label for="reg-confirm-password">Подтверждение пароля</label>
                            <input type="password" id="reg-confirm-password" placeholder="Повторите пароль" required>
                        </div>
                        <div class="form-group remember-me">
                            <input type="checkbox" id="reg-terms" required>
                            <label for="reg-terms">Я согласен с <a href="#" style="color: var(--primary-color);">условиями использования</a></label>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Зарегистрироваться</button>
                    </form>
                    <div class="auth-links" style="justify-content: center; margin-top: 20px;">
                        <a href="#" class="back-to-login">Уже есть аккаунт? Войти</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    const modal = document.getElementById('registration-modal');
    initInputMasks(modal);
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('registration-form');
    const backLink = modal.querySelector('.back-to-login');
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
        openAuthModal();
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('reg-name').value;
        const email = getNormalizedEmailInput('reg-email');
        const phone = getNormalizedPhoneInput('reg-phone');
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (!phone) {
            showNotification('Введите телефон в формате +7 (999) 123-45-67', 'error');
            return;
        }

        if (name && email && phone && password) {
            try {
                const api = requireFishSite('registerUser');
                const userData = await api.registerUser({ name, email, phone, password });
                updateUserInterface(userData);
                favorites = api.getFavoriteIds ? api.getFavoriteIds() : [];
                updateFavoritesCount();
                showNotification('Регистрация прошла успешно! Добро пожаловать!');
                modal.remove();
            } catch (error) {
                showNotification(error.message || 'Не удалось зарегистрироваться', 'error');
            }
        }
    });
    
    backLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.remove();
        openAuthModal();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Проверяем авторизацию при загрузке страницы
function checkAuth() {
    updateUserInterface(window.FishSite?.getCurrentUser ? window.FishSite.getCurrentUser() : null);
}

// Избранное
async function toggleFavorite(productId, button) {
    const api = requireFishSite('toggleFavorite');
    const result = await api.toggleFavorite(productId);
    favorites = api.getFavoriteIds ? api.getFavoriteIds() : [];

    document.querySelectorAll(`.favorite-btn[data-id="${productId}"]`).forEach(favoriteButton => {
        favoriteButton.classList.toggle('active', favorites.includes(productId));
    });

    updateFavoritesCount();
    showNotification(result.active ? 'Товар добавлен в избранное' : 'Товар удален из избранного');
}

function updateFavoritesCount() {
    const favoritesCount = favorites.length;
    const favoritesCountElements = document.querySelectorAll('.favorites-count');
    
    favoritesCountElements.forEach(el => {
        el.textContent = favoritesCount;
    });
    
    // Обновляем в меню пользователя
    const favoritesMenuItem = document.querySelector('.user-links a[href*="favorites"]');
    if (favoritesMenuItem) {
        favoritesMenuItem.innerHTML = `<i class="fas fa-heart"></i> Избранное <span class="favorites-count">(${favoritesCount})</span>`;
    }
}

// Оформление заказа
function setupCheckoutWizard() {
    if (!checkoutForm || checkoutWizardReady) return;

    checkoutWizardReady = true;
    checkoutForm.classList.add('checkout-wizard-form');

    const stepper = document.createElement('div');
    stepper.className = 'checkout-stepper';
    stepper.innerHTML = checkoutSteps.map((step, index) => `
        <button type="button" class="checkout-step" data-step="${index}">
            <span>${index + 1}</span>
            ${step.label}
        </button>
    `).join('');
    checkoutForm.prepend(stepper);

    const cartReview = document.createElement('section');
    cartReview.className = 'checkout-step-panel checkout-cart-review';
    cartReview.dataset.checkoutStep = '0';
    checkoutForm.insertBefore(cartReview, stepper.nextSibling);

    const fields = [
        ['checkout-name', 1],
        ['checkout-phone', 1],
        ['checkout-email', 1],
        ['checkout-address', 2],
        ['checkout-comment', 2],
        ['checkout-payment', 2]
    ];
    fields.forEach(([id, step]) => {
        const field = document.getElementById(id)?.closest('.form-group');
        if (field) {
            field.classList.add('checkout-step-panel');
            field.dataset.checkoutStep = step;
        }
    });

    const orderSummary = checkoutForm.querySelector('.order-summary');
    orderSummary?.classList.add('checkout-step-panel', 'checkout-confirm-panel');
    if (orderSummary) orderSummary.dataset.checkoutStep = '3';

    const submitButton = checkoutForm.querySelector('button[type="submit"]');
    submitButton?.classList.add('checkout-submit-btn');

    const navigation = document.createElement('div');
    navigation.className = 'checkout-wizard-actions';
    navigation.innerHTML = `
        <button type="button" class="btn btn-outline checkout-prev">Назад</button>
        <button type="button" class="btn btn-primary checkout-next">Продолжить</button>
    `;
    checkoutForm.insertBefore(navigation, submitButton);
}

function updateCheckoutWizard() {
    if (!checkoutForm) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartReview = checkoutForm.querySelector('.checkout-cart-review');
    if (cartReview) {
        cartReview.innerHTML = `
            <h3>Проверьте корзину</h3>
            <div class="checkout-cart-items">
                ${cart.map(item => `
                    <div class="checkout-cart-item">
                        ${productImageMarkup(item, 'checkout-cart-image')}
                        <div>
                            <strong>${item.name}</strong>
                            <span>${item.quantity} x ${item.price} руб.</span>
                        </div>
                        <b>${(item.quantity * item.price).toLocaleString()} руб.</b>
                    </div>
                `).join('')}
            </div>
            <div class="checkout-cart-total">
                <span>Итого</span>
                <strong>${total.toLocaleString()} руб.</strong>
            </div>
        `;
    }

    checkoutForm.querySelectorAll('.checkout-step-panel').forEach(panel => {
        panel.classList.toggle('active', Number(panel.dataset.checkoutStep) === checkoutStep);
    });
    checkoutForm.querySelectorAll('.checkout-step').forEach(button => {
        const index = Number(button.dataset.step);
        button.classList.toggle('active', index === checkoutStep);
        button.classList.toggle('completed', index < checkoutStep);
    });

    checkoutForm.querySelector('.checkout-prev')?.toggleAttribute('disabled', checkoutStep === 0);
    const nextButton = checkoutForm.querySelector('.checkout-next');
    if (nextButton) nextButton.style.display = checkoutStep === checkoutSteps.length - 1 ? 'none' : '';
    const submitButton = checkoutForm.querySelector('.checkout-submit-btn');
    if (submitButton) submitButton.style.display = checkoutStep === checkoutSteps.length - 1 ? '' : 'none';
}

function validateCheckoutStep() {
    const activeFields = checkoutForm?.querySelectorAll(`.checkout-step-panel[data-checkout-step="${checkoutStep}"] input[required], .checkout-step-panel[data-checkout-step="${checkoutStep}"] textarea[required], .checkout-step-panel[data-checkout-step="${checkoutStep}"] select[required]`) || [];
    for (const field of activeFields) {
        if (!field.checkValidity()) {
            field.reportValidity();
            return false;
        }
    }
    return true;
}

function handleCheckoutWizardClick(event) {
    const stepButton = event.target.closest('.checkout-step');
    const prevButton = event.target.closest('.checkout-prev');
    const nextButton = event.target.closest('.checkout-next');

    if (stepButton) {
        const nextStep = Number(stepButton.dataset.step);
        if (nextStep <= checkoutStep || validateCheckoutStep()) {
            checkoutStep = nextStep;
            updateCheckoutWizard();
        }
    }

    if (prevButton) {
        checkoutStep = Math.max(0, checkoutStep - 1);
        updateCheckoutWizard();
    }

    if (nextButton && validateCheckoutStep()) {
        checkoutStep = Math.min(checkoutSteps.length - 1, checkoutStep + 1);
        updateCheckoutWizard();
    }
}

function openCheckoutModal() {
    cart = window.FishSite?.getCart ? window.FishSite.getCart() : cart;
    if (!cart.length) {
        showNotification('Добавьте товары в корзину перед оформлением', 'warning');
        return;
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.textContent = total + ' руб.';
    setupCheckoutWizard();
    checkoutStep = 0;
    updateCheckoutWizard();
    closeCartModal();
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('checkout-name').value;
    const phone = getNormalizedPhoneInput('checkout-phone');
    const email = getNormalizedEmailInput('checkout-email');
    const address = document.getElementById('checkout-address').value;
    const comment = document.getElementById('checkout-comment').value;
    const payment = document.getElementById('checkout-payment').value;
    
    try {
        if (!phone) {
            showNotification('Введите телефон в формате +7 (999) 123-45-67', 'error');
            return;
        }
        const api = requireFishSite('request');
        cart = api.getCart ? api.getCart() : cart;
        const order = await api.request('/orders', {
            method: 'POST',
            body: JSON.stringify({ name, phone, email, address, comment, payment })
        });
        cart = api.clearCart ? await api.clearCart() : [];
        updateCartCount();
        closeCheckoutModal();
        showNotification(`Заказ ${order.id} оформлен! Мы свяжемся с вами для подтверждения.`);
        checkoutForm.reset();
    } catch (error) {
        showNotification(error.message || 'Не удалось оформить заказ', 'error');
    }
}

// Модальное окно товара
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    productModalContainer.innerHTML = `
        <div class="product-modal-hero-row">
        <div class="product-modal-media-panel">
            <div class="product-modal-image">
                <button class="favorite-btn ${favorites.includes(product.id) ? 'active' : ''}" data-id="${product.id}" aria-label="Добавить в избранное">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="product-image-large">
                    ${productImageMarkup(product, 'product-modal-art')}
                </div>
                <div class="product-modal-image-caption">
                    <span>${escapeHtml(getProductBadge(product))}</span>
                    <strong>${escapeHtml(product.storage)}</strong>
                </div>
            </div>
            <div class="product-modal-assurance" aria-label="Гарантии по товару">
                <span><i class="fas fa-temperature-low"></i> Холодная цепь</span>
                <span><i class="fas fa-location-dot"></i> ${escapeHtml(product.origin)}</span>
            </div>
        </div>
        <div class="product-modal-info">
            <div class="product-header">
                <span class="product-category">${escapeHtml(getCategoryName(product.category))}</span>
                <h2 class="product-title">${escapeHtml(product.name)}</h2>
                <p class="product-modal-lead">${escapeHtml(product.description)}</p>
                <div class="product-modal-tags" aria-label="Ключевые свойства товара">
                    <span>${escapeHtml(product.weight)}</span>
                    <span>${escapeHtml(product.shelfLife)}</span>
                    <span>${escapeHtml(product.origin)}</span>
                </div>
                <a class="product-page-link" href="${getProductPageHref(product)}">
                    Открыть полную страницу товара <i class="fas fa-arrow-right"></i>
                </a>
            </div>

            <div class="product-details">
                <h3>Характеристики</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Вес упаковки</span>
                        <span class="detail-value">${escapeHtml(product.weight)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Срок годности</span>
                        <span class="detail-value">${escapeHtml(product.shelfLife)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Страна происхождения</span>
                        <span class="detail-value">${escapeHtml(product.origin)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Условия хранения</span>
                        <span class="detail-value">${escapeHtml(product.storage)}</span>
                    </div>
                </div>
            </div>
            
            <div class="product-price-section">
                <div class="price-info">
                    <span class="price-label">Цена</span>
                    <span class="product-price-large">${escapeHtml(product.price)} руб./кг</span>
                </div>
                <div class="product-quantity">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${product.id}">-</button>
                        <input type="text" class="quantity-input" value="1" readonly data-id="${product.id}">
                        <button class="quantity-btn plus" data-id="${product.id}">+</button>
                    </div>
                </div>
            </div>
            
            <div class="product-actions-modal">
                <button class="btn btn-primary add-to-cart-modal" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Добавить в корзину
                </button>
                <button class="btn btn-secondary buy-now" data-id="${product.id}">
                    <i class="fas fa-bolt"></i> Купить сейчас
                </button>
            </div>
        </div>
        </div>
            
        <div class="product-modal-extra-grid">
            <div class="product-tips">
                <div class="product-tip-icon"><i class="fas fa-utensils"></i></div>
                <div>
                    <h3>Совет от шефа</h3>
                    <p>${getCookingTip(product.category)}</p>
                </div>
            </div>
            <div class="product-tips">
                <div class="product-tip-icon"><i class="fas fa-leaf"></i></div>
                <div>
                    <h3>КБЖУ и состав</h3>
                    <p>${getNutritionInfo(product.category)}</p>
                </div>
            </div>
            <div class="product-tips">
                <div class="product-tip-icon"><i class="fas fa-scissors"></i></div>
                <div>
                    <h3>Разделка</h3>
                    <p>${getCuttingInfo(product.category)}</p>
                </div>
            </div>
        </div>
    `;
    
    // Обработчики для модального окна товара
    const modalFavoriteBtn = productModalContainer.querySelector('.favorite-btn');
    const modalMinusBtn = productModalContainer.querySelector('.minus');
    const modalPlusBtn = productModalContainer.querySelector('.plus');
    const modalQuantityInput = productModalContainer.querySelector('.quantity-input');
    const modalAddToCartBtn = productModalContainer.querySelector('.add-to-cart-modal');
    const modalBuyNowBtn = productModalContainer.querySelector('.buy-now');
    
    modalFavoriteBtn.addEventListener('click', () => {
        toggleFavorite(product.id, modalFavoriteBtn);
        // Обновляем кнопку в карточке товара
        const cardFavoriteBtn = document.querySelector(`.product-card[data-id="${product.id}"] .favorite-btn`);
        if (cardFavoriteBtn) {
            cardFavoriteBtn.classList.toggle('active', favorites.includes(product.id));
        }
    });
    
    modalMinusBtn.addEventListener('click', () => changeQuantity(product.id, -1, modalQuantityInput));
    modalPlusBtn.addEventListener('click', () => changeQuantity(product.id, 1, modalQuantityInput));
    
    modalAddToCartBtn.addEventListener('click', () => {
        addToCart(product.id, parseInt(modalQuantityInput.value));
        closeProductModalWindow();
    });
    
    modalBuyNowBtn.addEventListener('click', () => {
        addToCart(product.id, parseInt(modalQuantityInput.value));
        closeProductModalWindow();
        openCartModal();
    });
    
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function getProductPageHref(product) {
    const prefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
    return `${prefix}product.html?id=${encodeURIComponent(product.id)}`;
}

function getNutritionInfo(category) {
    const info = {
        fresh: 'Натуральная рыба без добавок. В среднем 18-22 г белка на 100 г, жирность зависит от вида и партии.',
        frozen: 'Состав: рыба, быстрая заморозка. Белок 16-20 г на 100 г, без искусственных усилителей вкуса.',
        seafood: 'Морепродукты с высоким содержанием белка и минералов. Точные значения зависят от позиции.',
        fillets: 'Филе без лишней обработки, подходит для диетического рациона и быстрого приготовления.'
    };
    return info[category] || 'Состав и пищевая ценность уточняются по партии поставки.';
}

function getCuttingInfo(category) {
    const info = {
        fresh: 'По запросу подскажем формат: целиком, стейки, филе или подготовка под запекание.',
        frozen: 'Поставляется в стабильной заморозке, формат зависит от конкретной позиции.',
        seafood: 'Перед приготовлением достаточно корректно разморозить или прогреть по инструкции.',
        fillets: 'Удобный формат без лишней подготовки: разморозить, обсушить и готовить.'
    };
    return info[category] || 'Формат разделки уточняется при подтверждении заказа.';
}

function closeProductModalWindow() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
}

function getCookingTip(category) {
    const tips = {
        'fresh': 'Для сохранения сочности при запекании заверните рыбу в фольгу с дольками лимона и зеленью. Температура в духовке: 180°C, время: 20-25 минут.',
        'frozen': 'Размораживайте рыбу постепенно в холодильнике, а не при комнатной температуре. Это сохранит текстуру и вкус продукта.',
        'seafood': 'Морепродукты готовятся очень быстро - обычно 2-5 минут. Переваренными они становятся жесткими. Добавляйте их в блюдо в последнюю очередь.',
        'fillets': 'Перед жаркой обсушите филе бумажным полотенцем и слегка посолите за 10 минут до готовки. Это сделает корочку более хрустящей.'
    };
    return tips[category] || 'Подавайте с дольками лимона и свежей зеленью для подчеркивания натурального вкуса.';
}

// Показать уведомление
function showNotification(message, type = 'success') {
    // Удаляем существующее уведомление
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else if (type === 'warning') {
        notification.style.background = '#ff9800';
    } else if (type === 'info') {
        notification.style.background = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Обработка ошибок загрузки карты
window.addEventListener('error', function(e) {
    if (e.target.src && e.target.src.includes('api-maps.yandex.ru')) {
        console.warn('Яндекс Карты не загрузились. Проверьте подключение к интернету.');
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; border-radius: 12px; color: #666;">
                    <div style="text-align: center;">
                        <i class="fas fa-map-marker-alt" style="font-size: 48px; margin-bottom: 16px;"></i>
                        <p>г. Екатеринбург, ул. Репина, д. 15</p>
                        <p style="font-size: 14px; margin-top: 8px;">Карта временно недоступна</p>
                    </div>
                </div>
            `;
        }
    }
});

// Добавляем стили для анимации всплеска
const style = document.createElement('style');
style.textContent = `
    @keyframes splash {
        0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
