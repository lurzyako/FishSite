document.addEventListener('DOMContentLoaded', async () => {
    await window.FishSite?.init?.();
    const root = document.getElementById('product-page-root');
    const productId = Number(new URLSearchParams(window.location.search).get('id'));
    const api = window.FishSite;

    if (!api?.getProducts || !api?.formatProductImage) {
        if (root) {
            root.innerHTML = '<div class="no-products">Ядро сайта не загружено. Откройте проект через backend-сервер и обновите страницу.</div>';
        }
        return;
    }

    const escapeHtml = api.escapeHtml || ((value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char])));

    const products = await api.getProducts();
    const product = products.find(item => Number(item.id) === productId) || products[0];

    if (!root || !product) return;

    document.title = `${product.name} | Морские Дары`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', product.description || product.name);
    const isOutOfStock = Number(product.stock || 0) <= 0;

    root.innerHTML = `
        <article class="product-page-card">
            <section class="product-page-media">
                ${api.formatProductImage(product, 'product-page-image')}
                <div class="product-page-media-badge">
                    <span>${product.popular ? 'Bestseller' : 'Seafood selection'}</span>
                    <strong>${escapeHtml(product.storage)}</strong>
                </div>
            </section>
            <section class="product-page-copy">
                <a class="product-page-back" href="catalog.html"><i class="fas fa-arrow-left"></i> Каталог</a>
                <span class="product-category">${escapeHtml(getCategoryName(product.category))}</span>
                <h1>${escapeHtml(product.name)}</h1>
                <p>${escapeHtml(product.description)}</p>
                <div class="product-modal-tags">
                    <span>${escapeHtml(product.weight)}</span>
                    <span>${escapeHtml(product.shelfLife)}</span>
                    <span>${escapeHtml(product.origin)}</span>
                </div>
                <div class="details-grid">
                    <div class="detail-item"><span class="detail-label">Вес</span><span class="detail-value">${escapeHtml(product.weight)}</span></div>
                    <div class="detail-item"><span class="detail-label">Срок годности</span><span class="detail-value">${escapeHtml(product.shelfLife)}</span></div>
                    <div class="detail-item"><span class="detail-label">Происхождение</span><span class="detail-value">${escapeHtml(product.origin)}</span></div>
                    <div class="detail-item"><span class="detail-label">Хранение</span><span class="detail-value">${escapeHtml(product.storage)}</span></div>
                </div>
                <div class="product-page-order">
                    <div>
                        <span>Цена</span>
                        <strong>${Number(product.price).toLocaleString()} руб./кг</strong>
                    </div>
                    <button class="btn btn-primary" type="button" id="product-page-add" ${isOutOfStock ? 'disabled aria-disabled="true"' : ''}>
                        <i class="fas fa-cart-plus"></i> ${isOutOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
                    </button>
                </div>
            </section>
        </article>
    `;

    document.getElementById('product-page-add')?.addEventListener('click', async () => {
        try {
            await api.addToCart(product, 1);
            alert('Товар добавлен в корзину');
        } catch (error) {
            alert(error.message || 'Не удалось добавить товар в корзину');
        }
    });

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: new URL(product.image, window.location.href).href,
        brand: { '@type': 'Brand', name: 'Морские Дары' },
        offers: {
            '@type': 'Offer',
            priceCurrency: 'RUB',
            price: product.price,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder'
        }
    });
    document.head.appendChild(schema);
});

function getCategoryName(category) {
    return {
        fresh: 'Охлажденная рыба',
        frozen: 'Замороженная рыба',
        seafood: 'Морепродукты',
        fillets: 'Филе и стейки'
    }[category] || category;
}
