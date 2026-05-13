document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('luxury-ready');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('.header');
    const hero = document.querySelector('.hero');
    let lastScrollY = window.scrollY;
    const tiltSelector = [
        '.luxury-hero-card',
        '.advantage-card',
        '.product-card',
        '.favorite-item',
        '.order-card',
        '.stat-card',
        '.category-card',
        '.delivery-form',
        '.contact-form',
        '.advantages-stage',
        '.advantages-editorial-media',
        '.featured-showcase',
        '.featured-product-card',
        '.proof-card',
        '.footer-cta'
    ].join(',');

    document.addEventListener('click', (event) => {
        const emptyAnchor = event.target.closest('a[href="#"]');
        if (emptyAnchor) {
            event.preventDefault();
        }
    }, true);

    function updateHeader() {
        if (!header) return;
        const currentScrollY = Math.max(0, window.scrollY);
        const scrollDelta = currentScrollY - lastScrollY;
        const navIsOpen = document.querySelector('.nav.active') || document.querySelector('.mobile-menu-toggle.active');

        header.classList.toggle('luxury-scrolled', currentScrollY > 12);

        if (currentScrollY < 92 || navIsOpen) {
            header.classList.remove('luxury-hidden');
        } else if (scrollDelta > 6) {
            header.classList.add('luxury-hidden');
        } else if (scrollDelta < -6) {
            header.classList.remove('luxury-hidden');
        }

        lastScrollY = currentScrollY;
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
            '.hero-kicker',
            '.hero-text h2',
            '.hero-text p',
            '.hero-actions',
            '.hero-proof-item',
            '.hero-image',
            '.hero-card-tags',
            '.section-heading',
            '.section-eyebrow',
            '.advantages-editorial',
            '.advantages-editorial-media',
            '.advantages-editorial-content',
            '.advantages-list',
            '.advantage-row',
            '.advantages-showcase',
            '.advantages-copy',
            '.advantages-proof-line',
            '.advantages-stage',
            '.advantages-stage-card',
            '.advantages-temperature',
            '.advantage-visual',
            '.advantage-card-footer',
            '.featured-showcase',
            '.featured-product-card',
            '.featured-showcase-header',
            '.quality-proof-copy',
            '.proof-card',
            '.advantage-card',
            '.catalog-controls',
            '.catalog-quick-filters',
            '.catalog-proof-row',
            '.filter-section',
            '.sort-section',
            '.product-card',
            '.about-text',
            '.about-text p',
            '.about-signature',
            '.stat',
            '.about-image',
            '.delivery-step',
            '.delivery-note',
            '.delivery-form',
            '.form-group',
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
            '.favorites-filters',
            '.footer-section',
            '.footer-bottom'
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

    function bindMagneticButton(button) {
        if (prefersReducedMotion || button.dataset.luxuryMagneticBound === 'true') return;
        button.dataset.luxuryMagneticBound = 'true';
        button.classList.add('luxury-magnetic');

        button.addEventListener('pointermove', (event) => {
            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;

            button.style.setProperty('--magnetic-x', `${(x * 0.14).toFixed(2)}px`);
            button.style.setProperty('--magnetic-y', `${(y * 0.18).toFixed(2)}px`);
        });

        button.addEventListener('pointerleave', () => {
            button.style.setProperty('--magnetic-x', '0px');
            button.style.setProperty('--magnetic-y', '0px');
        });
    }

    function setupMagneticButtons() {
        document.querySelectorAll('.btn, .carousel-btn, .filter-btn').forEach(bindMagneticButton);
    }

    function setupConceptScroll() {
        if (document.querySelector('.scroll-current')) return;

        const current = document.createElement('div');
        current.className = 'scroll-current';
        current.setAttribute('aria-hidden', 'true');
        current.innerHTML = `
            <span class="scroll-current-line"></span>
            <span class="scroll-current-glow"></span>
            <span class="scroll-current-orb"></span>
            <span class="scroll-current-particle particle-one"></span>
            <span class="scroll-current-particle particle-two"></span>
            <span class="scroll-current-particle particle-three"></span>
        `;
        document.body.appendChild(current);

        const sections = [...document.querySelectorAll('section, .map-section, footer')];
        const orb = current.querySelector('.scroll-current-orb');
        const line = current.querySelector('.scroll-current-line');

        function updateCurrent() {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / scrollable));
            const checkpoint = window.scrollY + window.innerHeight * 0.42;
            let activeIndex = 0;

            sections.forEach((section, index) => {
                if (section.offsetTop <= checkpoint) {
                    activeIndex = index;
                }
            });

            document.body.style.setProperty('--scroll-progress', progress.toFixed(4));
            document.body.dataset.scrollStage = String(activeIndex);
            orb.style.top = `${progress * 100}%`;
            line.style.transform = `scaleY(${progress})`;
        }

        window.addEventListener('scroll', updateCurrent, { passive: true });
        updateCurrent();
    }

    setupReveal();
    setupTilt();
    setupMagneticButtons();
    setupConceptScroll();
    updateHeader();
    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });

    const mutationObserver = new MutationObserver(() => {
        setupReveal();
        setupTilt();
        setupMagneticButtons();
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});
