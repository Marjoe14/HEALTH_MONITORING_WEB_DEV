// ========================================
// BHW UI - Modal, Toast, Sidebar utilities
// ========================================

// ========================================
// MODAL FUNCTIONS
// ========================================
function openModal(modal) {
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// ========================================
// SIDEBAR TOGGLE (Mobile)
// ========================================
function toggleSidebar() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('show');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
}

// ========================================
// TOAST NOTIFICATION
// ========================================
function showToast(message, type) {
    type = type || 'info';
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-' + type;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;
    document.body.appendChild(toast);

    setTimeout(function() {
        toast.classList.add('show');
    }, 10);

    const timeoutId = setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 4000);

    toast.querySelector('.toast-close').addEventListener('click', function() {
        clearTimeout(timeoutId);
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 300);
    });

    toast.addEventListener('click', function(e) {
        if (e.target === toast) {
            clearTimeout(timeoutId);
            toast.classList.remove('show');
            setTimeout(function() {
                toast.remove();
            }, 300);
        }
    });
}

// ========================================
// EVENT LISTENERS - Modals & Sidebar
// ========================================
function initUIEventListeners() {
    // Sidebar toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    navItems.forEach(function(item) {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    // Close modal buttons
    closeModalBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    // ESC key closes modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.show').forEach(function(modal) {
                closeModal(modal);
            });
        }
    });
}

// ========================================
// EXPOSE GLOBAL FUNCTIONS
// ========================================
window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;