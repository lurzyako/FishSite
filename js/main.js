// Инициализация Яндекс Карты
function initMap() {
    if (typeof ymaps !== 'undefined') {
        ymaps.ready(function() {
            var myMap = new ymaps.Map("map", {
                center: [56.838011, 60.597465], // Координаты Екатеринбурга, ул. Репина, 15
                zoom: 16,
                controls: ['zoomControl', 'fullscreenControl']
            });

            // Добавляем метку
            var myPlacemark = new ymaps.Placemark([56.838011, 60.597465], {
                balloonContent: 'Морские Дары<br>ИП Чепурнова О.И.<br>ул. Репина, 15'
            }, {
                preset: 'islands#blueFoodIcon'
            });

            myMap.geoObjects.add(myPlacemark);
        });
    }
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
const products = [
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
let cart = [];
let cartCount = 0;

// Избранное
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

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
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('.nav');

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
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    generateUnderwaterScene();
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
});

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
        <div class="featured-product-visual featured-product-visual-${product.category}">
            <span class="featured-product-icon" aria-hidden="true">${product.image}</span>
            <button class="favorite-btn ${favorites.includes(product.id) ? 'active' : ''}" data-id="${product.id}" aria-label="Добавить в избранное">
                <i class="fas fa-heart"></i>
            </button>
        </div>
        <div class="featured-product-content">
            <span class="product-category">${getCategoryName(product.category)}</span>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="featured-product-meta">
                <span>${product.origin}</span>
                <span>${product.storage}</span>
            </div>
            <div class="featured-product-footer">
                <strong>${product.price} руб./кг</strong>
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
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;
    
    card.innerHTML = `
        <button class="favorite-btn ${favorites.includes(product.id) ? 'active' : ''}" data-id="${product.id}">
            <i class="fas fa-heart"></i>
        </button>
        <div class="product-card-content">
            <div class="product-image">
                <span>${product.image}</span>
                <small class="product-badge">${getProductBadge(product)}</small>
            </div>
            <div class="product-info">
                <div class="product-topline">
                    <span class="product-category">${getCategoryName(product.category)}</span>
                    <span class="product-origin">${product.origin}</span>
                </div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <span><i class="fas fa-box"></i>${product.weight}</span>
                    <span><i class="fas fa-temperature-low"></i>${product.storage}</span>
                </div>
                <div class="product-price">${product.price} руб./кг</div>
                <div class="product-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${product.id}">-</button>
                        <input type="text" class="quantity-input" value="1" readonly data-id="${product.id}">
                        <button class="quantity-btn plus" data-id="${product.id}">+</button>
                    </div>
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}">
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
function addToCart(productId, quantity) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    updateCartCount();
    showNotification(`Товар "${product.name}" добавлен в корзину!`);
}

// Обновление счетчика корзины
function updateCartCount() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = cartCount;
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
                    ${item.image}
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
function updateCartItemQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity < 1) {
        removeFromCart(productId);
    } else {
        updateCartCount();
        renderCartItems();
    }
}

// Удаление из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCartItems();
    showNotification('Товар удален из корзины');
}

// Обработчик фильтров
function handleFilterClick(e) {
    const category = e.target.dataset.category;
    
    // Обновляем активную кнопку
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    const filteredProducts = filterProductsByCategory(category);
    
    // Применяем сортировку
    const sortedProducts = applySorting(filteredProducts, sortSelect?.value || 'popular');
    renderProducts(sortedProducts);
}

// Обработчик сортировки
function handleSortChange() {
    const currentFilter = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
    const filteredProducts = filterProductsByCategory(currentFilter);
    
    const sortedProducts = applySorting(filteredProducts, sortSelect?.value || 'popular');
    renderProducts(sortedProducts);
}

function applyInitialCategoryFilter() {
    if (!productsGrid || !filterButtons.length) return;

    const selectedCategory = localStorage.getItem('selectedCategory');
    if (!selectedCategory) return;

    const selectedButton = document.querySelector(`.filter-btn[data-category="${selectedCategory}"]`);
    localStorage.removeItem('selectedCategory');

    if (!selectedButton) return;

    filterButtons.forEach(button => button.classList.remove('active'));
    selectedButton.classList.add('active');

    const filteredProducts = filterProductsByCategory(selectedCategory);

    renderProducts(applySorting(filteredProducts, sortSelect?.value || 'popular'));
}

function filterProductsByCategory(category) {
    switch (category) {
        case 'premium':
            return products.filter(product => product.price >= 1100 || [3, 8, 11].includes(product.id));
        case 'restaurant':
            return products.filter(product => ['seafood', 'fillets'].includes(product.category) || product.weight.includes('кг'));
        case 'fresh-catch':
            return products.filter(product => product.category === 'fresh');
        case 'all':
        default:
            if (!category || category === 'all') return products;
            return products.filter(product => product.category === category);
    }
}

// Применение сортировки
function applySorting(productsToSort, sortType) {
    const sorted = [...productsToSort];
    
    switch (sortType) {
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'popular':
        default:
            return sorted.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
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
function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Здесь должна быть логика отправки формы
    console.log('Данные формы:', { name, email, message });
    
    showNotification('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
    e.target.reset();
}

// Обработчик формы доставки
function handleDeliveryFormSubmit(e) {
    e.preventDefault();
    
    const address = document.getElementById('address').value;
    const deliveryTime = document.getElementById('delivery-time').value;
    
    // Здесь должна быть логика расчета доставки
    console.log('Данные доставки:', { address, deliveryTime });
    
    showNotification('Стоимость доставки рассчитана! Менеджер свяжется с вами для уточнения деталей.');
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

function handleAuthSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Здесь должна быть реальная логика авторизации
    // Для примера используем простую проверку
    if (email && password) {
        // Симуляция успешной авторизации
        const userData = {
            name: "Ольга Ивановна",
            email: email,
            initials: email.substring(0, 2).toUpperCase()
        };
        
        // Сохраняем данные пользователя
        localStorage.setItem('user', JSON.stringify(userData));
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Обновляем интерфейс
        updateUserInterface(userData);
        
        // Закрываем модальное окно
        closeAuthModal();
        
        // Показываем уведомление
        showNotification('Вы успешно вошли в систему!');
        
        // Очищаем форму
        authForm.reset();
    } else {
        showNotification('Пожалуйста, заполните все поля', 'error');
    }
}

function toggleUserDropdown() {
    userDropdown.classList.toggle('active');
}

function handleLogout() {
    // Удаляем данные пользователя
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    
    // Обновляем интерфейс
    updateUserInterface(null);
    
    // Закрываем меню
    userDropdown.classList.remove('active');
    
    // Показываем уведомление
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
    } else {
        // Пользователь не авторизован
        loginBtn.style.display = 'block';
        userMenu.style.display = 'none';
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
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('password-reset-form');
    const backLink = modal.querySelector('.back-to-login');
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
        openAuthModal();
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        
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
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('registration-form');
    const backLink = modal.querySelector('.back-to-login');
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
        openAuthModal();
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (name && email && phone && password) {
            // Симуляция успешной регистрации
            const userData = {
                name: name,
                email: email,
                initials: name.substring(0, 2).toUpperCase()
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            updateUserInterface(userData);
            
            showNotification('Регистрация прошла успешно! Добро пожаловать!');
            modal.remove();
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
    const userData = localStorage.getItem('user');
    if (userData) {
        updateUserInterface(JSON.parse(userData));
    }
}

// Избранное
function toggleFavorite(productId, button) {
    const index = favorites.indexOf(productId);
    
    if (index === -1) {
        // Добавляем в избранное
        favorites.push(productId);
        button.classList.add('active');
        showNotification('Товар добавлен в избранное');
    } else {
        // Удаляем из избранного
        favorites.splice(index, 1);
        button.classList.remove('active');
        showNotification('Товар удален из избранного');
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    document.querySelectorAll(`.favorite-btn[data-id="${productId}"]`).forEach(favoriteButton => {
        favoriteButton.classList.toggle('active', favorites.includes(productId));
    });
    
    // Обновляем счетчик в меню пользователя
    updateFavoritesCount();
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
function openCheckoutModal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.textContent = total + ' руб.';
    closeCartModal();
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const email = document.getElementById('checkout-email').value;
    const address = document.getElementById('checkout-address').value;
    const comment = document.getElementById('checkout-comment').value;
    const payment = document.getElementById('checkout-payment').value;
    
    // Здесь должна быть логика отправки заказа
    console.log('Данные заказа:', { name, phone, email, address, comment, payment, cart });
    
    // Очищаем корзину после оформления заказа
    cart = [];
    updateCartCount();
    
    closeCheckoutModal();
    showNotification('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время для подтверждения.');
    
    // Очищаем форму
    checkoutForm.reset();
}

// Модальное окно товара
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    productModalContainer.innerHTML = `
        <div class="product-modal-image">
            <button class="favorite-btn ${favorites.includes(product.id) ? 'active' : ''}" data-id="${product.id}">
                <i class="fas fa-heart"></i>
            </button>
            <div class="product-image-large">
                ${product.image}
            </div>
        </div>
        <div class="product-modal-info">
            <div class="product-header">
                <span class="product-category">${getCategoryName(product.category)}</span>
                <h2 class="product-title">${product.name}</h2>
                <div class="product-rating">
                    <div class="stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                    </div>
                    <span class="rating-value">4.5</span>
                    <span class="reviews-count">(24 отзыва)</span>
                </div>
            </div>
            
            <div class="product-description">
                <h3>Описание</h3>
                <p>${product.description}</p>
            </div>
            
            <div class="product-details">
                <h3>Характеристики</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Вес упаковки</span>
                        <span class="detail-value">${product.weight}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Срок годности</span>
                        <span class="detail-value">${product.shelfLife}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Страна происхождения</span>
                        <span class="detail-value">${product.origin}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Условия хранения</span>
                        <span class="detail-value">${product.storage}</span>
                    </div>
                </div>
            </div>
            
            <div class="product-price-section">
                <div class="price-info">
                    <span class="price-label">Цена:</span>
                    <span class="product-price-large">${product.price} руб./кг</span>
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
            
            <div class="product-tips">
                <h3>Совет от шефа</h3>
                <p>${getCookingTip(product.category)}</p>
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
