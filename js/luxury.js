document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('luxury-ready');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
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
        '.contact-item',
        '.catalog-service-panel',
        '.account-concierge-card',
        '.advantages-stage',
        '.advantages-editorial-media',
        '.featured-showcase',
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

    function updateFooterParallax() {
        if (prefersReducedMotion) return;
        document.querySelectorAll('.site-footer').forEach((footer) => {
            const rect = footer.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            if (rect.bottom < 0 || rect.top > viewportHeight) return;

            const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
            footer.style.setProperty('--footer-video-y', `${((progress - 0.5) * -52).toFixed(2)}px`);
        });
    }

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateHeader();
            updateParallax();
            updateFooterParallax();
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
            '.catalog-hero',
            '.catalog-service-panel',
            '.catalog-workspace',
            '.catalog-results-head',
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
            '.contact-primary',
            '.contact-actions',
            '.contact-list',
            '.contact-item',
            '.contact-form',
            '.contact-form-note',
            '.map-copy',
            '.map-contact-item',
            '.map-card-footer',
            '#map',
            '.account-page-hero',
            '.account-sidebar',
            '.account-content',
            '.account-concierge-card',
            '.account-orders-panel',
            '.account-orders-head',
            '.stat-card',
            '.order-card',
            '.favorite-item',
            '.category-card',
            '.order-filters',
            '.favorites-filters',
            '.footer-cta-copy',
            '.footer-cta-actions',
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

    function resetFishParallax(stage) {
        stage.style.setProperty('--fish-shift-x', '0px');
        stage.style.setProperty('--fish-shift-y', '0px');
        stage.style.setProperty('--fish-rotate-x', '0deg');
        stage.style.setProperty('--fish-rotate-y', '0deg');
        stage.style.setProperty('--fish-glare-x', '50%');
        stage.style.setProperty('--fish-glare-y', '42%');
        stage.style.setProperty('--fish-shadow-x', '50%');
        stage.style.setProperty('--fish-shadow-y', '79%');
        stage.style.setProperty('--fish-shadow-scale-x', '1');
        stage.style.setProperty('--fish-shadow-scale-y', '1');
        stage.style.setProperty('--fish-shadow-opacity', '0.34');
    }

    function bindFishParallax(stage) {
        if (prefersReducedMotion || !hasFinePointer || stage.dataset.fishParallaxBound === 'true') return;
        stage.dataset.fishParallaxBound = 'true';

        stage.addEventListener('pointermove', (event) => {
            const rect = stage.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
            const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
            const offsetX = (x - 0.5) * 2;
            const offsetY = (y - 0.5) * 2;
            const depth = Math.min(1, Math.hypot(offsetX, offsetY));

            stage.style.setProperty('--fish-shift-x', `${(offsetX * 18).toFixed(2)}px`);
            stage.style.setProperty('--fish-shift-y', `${(offsetY * 14).toFixed(2)}px`);
            stage.style.setProperty('--fish-rotate-x', `${(-offsetY * 6.5).toFixed(2)}deg`);
            stage.style.setProperty('--fish-rotate-y', `${(offsetX * 9).toFixed(2)}deg`);
            stage.style.setProperty('--fish-glare-x', `${(x * 100).toFixed(1)}%`);
            stage.style.setProperty('--fish-glare-y', `${(y * 100).toFixed(1)}%`);
            stage.style.setProperty('--fish-shadow-x', `${(50 + offsetX * 5).toFixed(2)}%`);
            stage.style.setProperty('--fish-shadow-y', `${(79 + offsetY * 2.2).toFixed(2)}%`);
            stage.style.setProperty('--fish-shadow-scale-x', `${(1.04 + depth * 0.16).toFixed(3)}`);
            stage.style.setProperty('--fish-shadow-scale-y', `${(0.9 + Math.abs(offsetX) * 0.08 + Math.max(0, offsetY) * 0.05).toFixed(3)}`);
            stage.style.setProperty('--fish-shadow-opacity', `${(0.28 + depth * 0.08).toFixed(3)}`);
        }, { passive: true });

        stage.addEventListener('pointerleave', () => resetFishParallax(stage));
        stage.addEventListener('pointercancel', () => resetFishParallax(stage));
    }

    function setupFishParallax() {
        document.querySelectorAll('.advantages-editorial-media').forEach(bindFishParallax);
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

    function setupFooterVideo() {
        document.querySelectorAll('.site-footer').forEach((footer) => {
            if (footer.dataset.footerVideoBound === 'true') return;
            footer.dataset.footerVideoBound = 'true';

            const video = footer.querySelector('.footer-video-layer video');
            if (video && !prefersReducedMotion) {
                video.muted = true;
                video.playsInline = true;
                video.play().catch(() => {
                    video.controls = false;
                });
            }

            footer.style.setProperty('--footer-rotate-x', '0deg');
            footer.style.setProperty('--footer-rotate-y', '0deg');
        });
    }

    setupReveal();
    setupTilt();
    setupFishParallax();
    setupMagneticButtons();
    setupConceptScroll();
    setupFooterVideo();
    updateHeader();
    updateParallax();
    updateFooterParallax();
    window.addEventListener('scroll', onScroll, { passive: true });

    const mutationObserver = new MutationObserver(() => {
        setupReveal();
        setupTilt();
        setupFishParallax();
        setupMagneticButtons();
        setupFooterVideo();
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});
