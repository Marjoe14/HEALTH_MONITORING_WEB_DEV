// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// LANDING PAGE - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========================================
    // MOBILE MENU TOGGLE
    // ========================================
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = mobileMenu.classList.toggle('open');
            
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
            }
            
            mobileToggle.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });

        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileToggle.focus();
            }
        });
    }

    // ========================================
    // NAVBAR SCROLL EFFECT
    // ========================================
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', function() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollY > 30) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 24px rgba(74, 144, 217, 0.08)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }, { passive: true });

    // ========================================
    // SMOOTH SCROLL FOR NAV LINKS
    // ========================================
    const allNavLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
    
    allNavLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const navbarHeight = navbar.offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ========================================
    // LOGO CLICK - SCROLL TO TOP
    // ========================================
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========================================
    // CONTACT FORM HANDLING
    // ========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inputs = this.querySelectorAll('input, textarea');
            let isValid = true;
            let firstInvalid = null;
            
            inputs.forEach(function(input) {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#e74c3c';
                    if (!firstInvalid) firstInvalid = input;
                } else {
                    input.style.borderColor = '#E8EEF4';
                }
            });
            
            if (!isValid && firstInvalid) {
                firstInvalid.focus();
                firstInvalid.style.animation = 'shake 0.4s ease';
                setTimeout(function() {
                    firstInvalid.style.animation = '';
                }, 400);
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            setTimeout(function() {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
                submitBtn.style.background = '#5CB85C';
                
                setTimeout(function() {
                    contactForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    
                    const successMsg = document.createElement('div');
                    successMsg.style.cssText = `
                        padding: 12px 16px;
                        background: #D4EDDA;
                        color: #155724;
                        border-radius: 8px;
                        font-weight: 500;
                        text-align: center;
                        margin-top: 8px;
                        border: 1px solid #C3E6CB;
                        font-size: 0.9rem;
                    `;
                    successMsg.textContent = '✅ Your message has been sent to the Barangay Health Workers!';
                    contactForm.appendChild(successMsg);
                    
                    setTimeout(function() {
                        successMsg.remove();
                    }, 4000);
                }, 1500);
            }, 1500);
        });
        
        contactForm.querySelectorAll('input, textarea').forEach(function(input) {
            input.addEventListener('focus', function() {
                this.style.borderColor = '#4A90D9';
            });
        });
    }

    // ========================================
    // ADD SHAKE ANIMATION
    // ========================================
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
        }
    `;
    document.head.appendChild(shakeStyle);

    // ========================================
    // INTERSECTION OBSERVER - SCROLL ANIMATIONS
    // ========================================
    const animateItems = document.querySelectorAll('.feature-item, .benefit-card, .illustration-card');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry, index) {
                if (entry.isIntersecting) {
                    setTimeout(function() {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 60);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });
        
        animateItems.forEach(function(el, index) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            el.style.transitionDelay = (index * 0.04) + 's';
            observer.observe(el);
        });
    } else {
        animateItems.forEach(function(el) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }

    // ========================================
    // PWA INSTALL PROMPT
    // ========================================
    let deferredPrompt;
    const pwaInstall = document.getElementById('pwaInstall');
    const installBtn = document.getElementById('installBtn');
    const closeInstall = document.getElementById('closeInstall');

    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        
        if (window.innerWidth <= 768 && pwaInstall) {
            pwaInstall.style.display = 'flex';
        }
    });

    if (installBtn) {
        installBtn.addEventListener('click', function() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function(choiceResult) {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('✅ User accepted the install prompt');
                    } else {
                        console.log('❌ User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                    if (pwaInstall) {
                        pwaInstall.style.display = 'none';
                    }
                });
            }
        });
    }

    if (closeInstall) {
        closeInstall.addEventListener('click', function() {
            if (pwaInstall) {
                pwaInstall.style.display = 'none';
            }
        });
    }

    window.addEventListener('resize', function() {
        if (pwaInstall && window.innerWidth > 768) {
            pwaInstall.style.display = 'none';
        }
    });

    // ========================================
    // KEYBOARD ACCESSIBILITY
    // ========================================
    document.querySelectorAll('.feature-item, .benefit-card, .illustration-card').forEach(function(el) {
        el.setAttribute('tabindex', '0');
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    console.log('🏥 Smart Community Health Monitoring System · Barangay Garsika');
    console.log('🎨 Color palette: Light Blue · Soft Green · Clean White');
    console.log('📱 Fully responsive for all screen sizes');
});