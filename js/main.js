// Main JavaScript for interactive features

document.addEventListener('DOMContentLoaded', function () {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Add animation classes to cards and timeline items
    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.animationDelay = `${0.1 + index * 0.1}s`;
    });

    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.animationDelay = `${0.1 + index * 0.1}s`;
    });

    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header nav').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL hash
                history.pushState(null, null, targetId);
            }
        });
    });

    // Form handling (if forms are added later)
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // Add form submission logic here
            console.log('Form submitted');
        });
    }

    // Add hover effect to cards with delay
    document.querySelectorAll('.card').forEach(card => {
        let hoverTimeout;

        card.addEventListener('mouseenter', function () {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            }, 50);
        });

        card.addEventListener('mouseleave', function () {
            clearTimeout(hoverTimeout);
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click animation to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });

    // Initialize animations
    setTimeout(() => {
        document.body.classList.add('loaded');

        // Animate in hero content
        const introContent = document.querySelector('.intro-content');
        const introImage = document.querySelector('.intro-image');

        if (introContent) {
            introContent.style.opacity = '0';
            introContent.style.transform = 'translateY(20px)';
            introContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

            setTimeout(() => {
                introContent.style.opacity = '1';
                introContent.style.transform = 'translateY(0)';
            }, 300);
        }

        if (introImage) {
            introImage.style.opacity = '0';
            introImage.style.transform = 'scale(0.8)';
            introImage.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

            setTimeout(() => {
                introImage.style.opacity = '1';
                introImage.style.transform = 'scale(1)';
            }, 500);
        }
    }, 100);

    // Add keyboard navigation for menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Preload images
    const imagesToPreload = [
        './img/img.jpg',
        './img/logo.png',
        './img/lxs.png',
        './img/itnrw_logo.png',
        './img/uni.png',
        './img/cgi_logo.jpg',
        './img/github.svg'
    ];

    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});