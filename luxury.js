document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('luxury-ready');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('.header');
    const hero = document.querySelector('.hero');
    const tiltSelector = [
        '.luxury-hero-card',
        '.advantage-card',
        '.product-card',
        '.favorite-item',
        '.order-card',
        '.stat-card',
        '.category-card',
        '.delivery-form',
        '.contact-form'
    ].join(',');

    document.addEventListener('click', (event) => {
        const emptyAnchor = event.target.closest('a[href="#"]');
        if (emptyAnchor) {
            event.preventDefault();
        }
    }, true);

    function updateHeader() {
        if (!header) return;
        header.classList.toggle('luxury-scrolled', window.scrollY > 18);
    }

    function updateParallax() {
        if (!hero || prefersReducedMotion) return;
        const rect = hero.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        if (rect.bottom < 0 || rect.top > viewportHeight) return;

        const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
        hero.style.setProperty('--hero-parallax', `${(progress - 0.5) * 46}px`);

        document.querySelectorAll('[data-parallax-speed]').forEach((layer) => {
            const speed = Number(layer.dataset.parallaxSpeed || 0.12);
            layer.style.setProperty('--parallax-offset', `${((progress - 0.5) * speed * -120).toFixed(2)}px`);
        });
    }

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateHeader();
            updateParallax();
            ticking = false;
        });
    }

    function setupReveal() {
        const revealTargets = [
            '.section-title',
            '.advantage-card',
            '.catalog-controls',
            '.product-card',
            '.about-text',
            '.about-image',
            '.delivery-step',
            '.delivery-form',
            '.contact-item',
            '.contact-form',
            '#map',
            '.account-sidebar',
            '.account-content',
            '.stat-card',
            '.order-card',
            '.favorite-item',
            '.category-card',
            '.order-filters',
            '.favorites-filters'
        ];

        const elements = [...document.querySelectorAll(revealTargets.join(','))]
            .filter((element) => !element.classList.contains('reveal-up'));

        elements.forEach((element, index) => {
            element.classList.add('reveal-up');
            element.style.setProperty('--reveal-delay', `${Math.min(index % 8, 7) * 55}ms`);
        });

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            elements.forEach((element) => element.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.14,
            rootMargin: '0px 0px -8% 0px'
        });

        elements.forEach((element) => observer.observe(element));
    }

    function bindTiltCard(card) {
        if (prefersReducedMotion || card.dataset.luxuryTiltBound === 'true') return;
        card.dataset.luxuryTiltBound = 'true';

        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const rotateY = ((x / rect.width) - 0.5) * 7;
            const rotateX = ((0.5 - (y / rect.height)) * 7);

            card.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
            card.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
            card.style.setProperty('--mx', `${((x / rect.width) * 100).toFixed(1)}%`);
            card.style.setProperty('--my', `${((y / rect.height) * 100).toFixed(1)}%`);
        });

        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
            card.style.setProperty('--mx', '50%');
            card.style.setProperty('--my', '50%');
        });
    }

    function setupTilt() {
        document.querySelectorAll(tiltSelector).forEach(bindTiltCard);
    }

    setupReveal();
    setupTilt();
    updateHeader();
    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });

    const mutationObserver = new MutationObserver(() => {
        setupReveal();
        setupTilt();
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});
