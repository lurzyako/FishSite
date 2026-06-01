(function () {
    const isPagesPath = window.location.pathname.includes('/pages/');
    const assetPrefix = isPagesPath ? '../' : '';
    const isLocalHttp = ['127.0.0.1', 'localhost', ''].includes(window.location.hostname);
    const sameOriginApiBase = `${window.location.origin}/api`;
    const localApiBase = window.location.port && window.location.port !== '8000'
        ? 'http://127.0.0.1:8000/api'
        : sameOriginApiBase;
    const API_BASE = window.FISHSITE_API_BASE || (window.location.protocol === 'file:' || isLocalHttp ? localApiBase : sameOriginApiBase);

    const CATEGORY_IMAGES = {
        fresh: `${assetPrefix}assets/images/product-fresh-fish.png`,
        frozen: `${assetPrefix}assets/images/product-frozen-fish.png`,
        seafood: `${assetPrefix}assets/images/product-seafood.png`,
        fillets: `${assetPrefix}assets/images/product-fillet.png`
    };

    const PRODUCT_IMAGES = {
        1: `${assetPrefix}assets/images/product-01-salmon.png`,
        2: `${assetPrefix}assets/images/product-02-trout.png`,
        3: `${assetPrefix}assets/images/product-03-tiger-shrimp.png`,
        4: `${assetPrefix}assets/images/product-04-squid.png`,
        5: `${assetPrefix}assets/images/product-05-cod-fillet.png`,
        6: `${assetPrefix}assets/images/product-06-mussels.png`,
        7: `${assetPrefix}assets/images/product-07-salmon-steaks.png`,
        8: `${assetPrefix}assets/images/product-08-octopus.png`,
        9: `${assetPrefix}assets/images/product-09-dorado.png`,
        10: `${assetPrefix}assets/images/product-10-flounder.png`,
        11: `${assetPrefix}assets/images/product-11-salmon-caviar.png`,
        12: `${assetPrefix}assets/images/product-12-pangasius-fillet.png`
    };

    const CONTACTS = {
        phoneDisplay: '+7 (343) 302-18-64',
        phoneHref: '+73433021864',
        email: 'orders@morskie-dary.example',
        address: 'г. Екатеринбург, ул. Репина, д. 15',
        social: {
            vk: 'https://vk.com/morskie_dary_demo',
            telegram: 'https://t.me/morskie_dary_demo'
        }
    };

    const fallbackProducts = [
        { id: 1, name: 'Сёмга охлажденная', category: 'fresh', price: 1200, imageSymbol: '•', popular: true, description: 'Свежая охлажденная сёмга высшего качества. Идеально подходит для засолки, приготовления на гриле или в духовке.', weight: '1 кг', shelfLife: '5 дней', origin: 'Норвегия', storage: '0°C до +2°C' },
        { id: 2, name: 'Форель радужная', category: 'fresh', price: 900, imageSymbol: '•', popular: true, description: 'Радужная форель, выращенная в экологически чистых условиях. Нежное мясо с минимальным количеством костей.', weight: '1 кг', shelfLife: '5 дней', origin: 'Карелия', storage: '0°C до +2°C' },
        { id: 3, name: 'Креветки тигровые', category: 'seafood', price: 1800, imageSymbol: '•', popular: false, description: 'Крупные тигровые креветки, замороженные свежими. Идеальны для гриля, пасты и салатов.', weight: '1 кг', shelfLife: '12 месяцев', origin: 'Вьетнам', storage: '-18°C и ниже' },
        { id: 4, name: 'Кальмар замороженный', category: 'frozen', price: 700, imageSymbol: '•', popular: true, description: 'Филе кальмара, очищенное от кожи и внутренностей. Быстрая заморозка сохраняет текстуру.', weight: '1 кг', shelfLife: '18 месяцев', origin: 'Перу', storage: '-18°C и ниже' },
        { id: 5, name: 'Филе трески', category: 'fillets', price: 650, imageSymbol: '•', popular: false, description: 'Филе трески без кожи и костей. Диетический продукт с высоким содержанием белка.', weight: '1 кг', shelfLife: '12 месяцев', origin: 'Баренцево море', storage: '-18°C и ниже' },
        { id: 6, name: 'Мидии в раковинах', category: 'seafood', price: 850, imageSymbol: '•', popular: true, description: 'Мидии в раковинах, приготовленные на пару и замороженные.', weight: '1 кг', shelfLife: '12 месяцев', origin: 'Чили', storage: '-18°C и ниже' },
        { id: 7, name: 'Стейки лосося', category: 'fillets', price: 1100, imageSymbol: '•', popular: false, description: 'Стейки лосося идеальной толщины для гриля или сковороды.', weight: '1 шт (~200г)', shelfLife: '12 месяцев', origin: 'Норвегия', storage: '-18°C и ниже' },
        { id: 8, name: 'Осьминог', category: 'seafood', price: 2200, imageSymbol: '•', popular: false, description: 'Осьминог средиземноморский, предварительно очищенный.', weight: '1 кг', shelfLife: '12 месяцев', origin: 'Марокко', storage: '-18°C и ниже' },
        { id: 9, name: 'Дорадо', category: 'fresh', price: 950, imageSymbol: '•', popular: true, description: 'Свежая дорадо с белым нежным мясом.', weight: '1 кг', shelfLife: '5 дней', origin: 'Греция', storage: '0°C до +2°C' },
        { id: 10, name: 'Камбала', category: 'frozen', price: 750, imageSymbol: '•', popular: false, description: 'Камбала дальневосточная с нежным диетическим мясом.', weight: '1 кг', shelfLife: '12 месяцев', origin: 'Дальний Восток', storage: '-18°C и ниже' },
        { id: 11, name: 'Икра лососевая', category: 'seafood', price: 2500, imageSymbol: '•', popular: true, description: 'Икра лососевая зернистая, натуральный продукт без искусственных красителей.', weight: '100 г', shelfLife: '6 месяцев', origin: 'Камчатка', storage: '0°C до +4°C' },
        { id: 12, name: 'Филе пангасиуса', category: 'fillets', price: 450, imageSymbol: '•', popular: false, description: 'Филе пангасиуса без кожи и костей для ежедневного питания.', weight: '1 кг', shelfLife: '12 месяцев', origin: 'Вьетнам', storage: '-18°C и ниже' }
    ].map(normalizeProduct);

    let productsCache = null;
    let cartCache = [];
    let favoritesCache = [];
    let currentUser = null;

    function normalizeProduct(product) {
        const category = product.category || product.category_slug || 'fresh';
        return {
            ...product,
            category,
            price: Number(product.price ?? product.price_rub ?? 0),
            image: product.image && !isSymbol(product.image) ? resolveAssetPath(product.image) : PRODUCT_IMAGES[product.id] || CATEGORY_IMAGES[category] || CATEGORY_IMAGES.fresh,
            imageSymbol: product.imageSymbol || product.image_symbol || (isSymbol(product.image) ? product.image : ''),
            popular: Boolean(product.popular ?? product.is_popular),
            shelfLife: product.shelfLife || product.shelf_life || product.shelfLife
        };
    }

    function isSymbol(value) {
        return typeof value === 'string' && value.length <= 4 && !value.includes('/') && !value.includes('.');
    }

    function resolveAssetPath(path) {
        if (!path || path.startsWith('http') || path.startsWith('../') || path.startsWith('/')) return path;
        return `${assetPrefix}${path}`;
    }

    async function request(path, options = {}) {
        const response = await fetch(`${API_BASE}${path}`, {
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            credentials: 'include',
            ...options
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload.error || payload.detail || 'Сервер временно недоступен');
        }
        return payload;
    }

    async function init() {
        try {
            const { user } = await request('/me');
            const [cart, favorites] = await Promise.all([
                request('/cart'),
                request('/favorites')
            ]);
            currentUser = user || null;
            cartCache = cart.map(normalizeProduct);
            favoritesCache = favorites.ids || [];
        } catch {
            currentUser = null;
            cartCache = [];
            favoritesCache = [];
        }
        updateCartBadges();
        updateFavoritesBadges();
        window.dispatchEvent(new CustomEvent('fishsite:session-ready', {
            detail: { user: currentUser, cart: cartCache, favorites: favoritesCache }
        }));
        return { user: currentUser, cart: cartCache, favorites: favoritesCache };
    }

    async function getProducts() {
        if (productsCache) return productsCache;
        try {
            const products = await request('/products');
            productsCache = products.map(normalizeProduct);
        } catch (error) {
            productsCache = fallbackProducts;
            productsCache.offline = true;
        }
        window.products = productsCache;
        return productsCache;
    }

    async function searchProducts(query) {
        const search = String(query || '').trim();
        if (!search) return getProducts();
        const products = await request(`/products/search?q=${encodeURIComponent(search)}`);
        return products.map(normalizeProduct);
    }

    function getCart() {
        return [...cartCache];
    }

    async function setCart(cart) {
        await request('/cart/clear', { method: 'POST', body: '{}' });
        cartCache = [];
        for (const item of cart) {
            cartCache = (await request('/cart/items', {
                method: 'POST',
                body: JSON.stringify({ productId: item.id, quantity: item.quantity || 1 })
            })).map(normalizeProduct);
        }
        updateCartBadges();
        window.dispatchEvent(new CustomEvent('fishsite:cart-updated', { detail: cartCache }));
        return getCart();
    }

    async function addToCart(product, quantity = 1) {
        const cleanQuantity = Math.max(1, Number(quantity) || 1);
        const normalized = normalizeProduct(product);
        cartCache = (await request('/cart/items', {
            method: 'POST',
            body: JSON.stringify({ productId: normalized.id, quantity: cleanQuantity })
        })).map(normalizeProduct);
        updateCartBadges();
        window.dispatchEvent(new CustomEvent('fishsite:cart-updated', { detail: cartCache }));
        return getCart();
    }

    async function updateCartItem(productId, change) {
        const existing = cartCache.find(item => Number(item.id) === Number(productId));
        const quantity = Math.max(0, Number(existing?.quantity || 0) + Number(change || 0));
        cartCache = (await request('/cart/items/update', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        })).map(normalizeProduct);
        updateCartBadges();
        window.dispatchEvent(new CustomEvent('fishsite:cart-updated', { detail: cartCache }));
        return getCart();
    }

    async function removeFromCart(productId) {
        cartCache = (await request('/cart/items/remove', {
            method: 'POST',
            body: JSON.stringify({ productId })
        })).map(normalizeProduct);
        updateCartBadges();
        window.dispatchEvent(new CustomEvent('fishsite:cart-updated', { detail: cartCache }));
        return getCart();
    }

    async function clearCart() {
        cartCache = (await request('/cart/clear', { method: 'POST', body: '{}' })).map(normalizeProduct);
        updateCartBadges();
        window.dispatchEvent(new CustomEvent('fishsite:cart-updated', { detail: cartCache }));
        return getCart();
    }

    function updateCartBadges() {
        const total = cartCache.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = total;
        });
    }

    async function login(email, password) {
        const { user } = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        currentUser = user;
        await init();
        return currentUser;
    }

    async function registerUser(data) {
        const { user } = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        currentUser = user;
        await init();
        return currentUser;
    }

    async function logout() {
        await request('/auth/logout', { method: 'POST', body: '{}' });
        currentUser = null;
        await init();
    }

    function startOAuth(provider) {
        const safeProvider = provider === 'vk' ? 'vk' : 'google';
        const returnTo = encodeURIComponent(window.location.href);
        window.location.href = `${API_BASE}/auth/${safeProvider}/start?returnTo=${returnTo}`;
    }

    function getCurrentUser() {
        return currentUser;
    }

    function getFavoriteIds() {
        return [...favoritesCache];
    }

    async function loadFavorites() {
        const favorites = await request('/favorites');
        favoritesCache = favorites.ids || [];
        updateFavoritesBadges();
        return favorites;
    }

    async function toggleFavorite(productId) {
        const result = await request('/favorites/toggle', {
            method: 'POST',
            body: JSON.stringify({ productId })
        });
        favoritesCache = result.ids || [];
        updateFavoritesBadges();
        window.dispatchEvent(new CustomEvent('fishsite:favorites-updated', { detail: favoritesCache }));
        return result;
    }

    async function removeFavorite(productId) {
        const result = await request('/favorites/remove', {
            method: 'POST',
            body: JSON.stringify({ productId })
        });
        favoritesCache = result.ids || [];
        updateFavoritesBadges();
        window.dispatchEvent(new CustomEvent('fishsite:favorites-updated', { detail: favoritesCache }));
        return result;
    }

    async function clearFavorites() {
        const result = await request('/favorites/clear', { method: 'POST', body: '{}' });
        favoritesCache = result.ids || [];
        updateFavoritesBadges();
        window.dispatchEvent(new CustomEvent('fishsite:favorites-updated', { detail: favoritesCache }));
        return result;
    }

    function updateFavoritesBadges() {
        const total = favoritesCache.length;
        document.querySelectorAll('.favorites-count').forEach(element => {
            element.textContent = element.textContent.trim().startsWith('(') ? `(${total})` : total;
        });
    }

    function updateContacts() {
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.href = `tel:${CONTACTS.phoneHref}`;
        });
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.href = `mailto:${CONTACTS.email}`;
        });
        document.querySelectorAll('.contact-details').forEach(details => {
            const title = details.querySelector('h3')?.textContent.trim();
            const paragraph = details.querySelector('p');
            if (title === 'Телефон' && paragraph) paragraph.textContent = CONTACTS.phoneDisplay;
            if (title === 'Email' && paragraph) paragraph.textContent = CONTACTS.email;
        });
        const phoneButton = document.querySelector('.contact-actions a[href^="tel:"]');
        const emailButton = document.querySelector('.contact-actions a[href^="mailto:"]');
        if (phoneButton) phoneButton.setAttribute('aria-label', `Позвонить ${CONTACTS.phoneDisplay}`);
        if (emailButton) emailButton.setAttribute('aria-label', `Написать ${CONTACTS.email}`);
        const socialLinks = document.querySelectorAll('.social-links a');
        const socialKeys = ['vk', 'telegram'];
        socialLinks.forEach((link, index) => {
            const key = socialKeys[index];
            if (CONTACTS.social[key]) {
                link.href = CONTACTS.social[key];
                link.target = '_blank';
                link.rel = 'noopener';
            }
        });
    }

    function formatProductImage(product, className = '') {
        const image = normalizeProduct(product).image;
        return `<img src="${image}" alt="${product.name}" class="${className}" loading="lazy" decoding="async" sizes="(max-width: 640px) 82vw, 360px">`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        updateCartBadges();
        updateContacts();
    });

    window.FishSite = {
        API_BASE,
        CONTACTS,
        PRODUCT_IMAGES,
        CATEGORY_IMAGES,
        fallbackProducts,
        init,
        request,
        login,
        registerUser,
        logout,
        startOAuth,
        getCurrentUser,
        getProducts,
        searchProducts,
        normalizeProduct,
        formatProductImage,
        getCart,
        setCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        updateCartBadges,
        getFavoriteIds,
        loadFavorites,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
        updateFavoritesBadges
    };
})();
