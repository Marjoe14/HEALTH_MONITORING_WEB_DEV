// ========================================
// RESIDENT HELPERS - Utility functions
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
// TOAST NOTIFICATION
// ========================================
function showToast(message, type) {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(function(t) { t.remove(); });

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    const icon = type === 'success' ? 'fa-check-circle' :
                 type === 'error' ? 'fa-exclamation-circle' :
                 'fa-info-circle';
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(function() {
        toast.style.animation = 'slideDown 0.3s ease forwards';
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}

// ========================================
// TIME AGO
// ========================================
function getTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + 'm ago';
    if (diffHours < 24) return diffHours + 'h ago';
    if (diffDays < 7) return diffDays + 'd ago';
    return past.toLocaleDateString();
}

// ========================================
// AUTO-UPPERCASE FOR INPUT FIELDS
// ========================================
function applyUppercase(input) {
    if (input && input.value) {
        const cursorPosition = input.selectionStart;
        const uppercaseValue = input.value.toUpperCase();
        if (input.value !== uppercaseValue) {
            input.value = uppercaseValue;
            input.setSelectionRange(cursorPosition, cursorPosition);
        }
    }
}

function initUppercaseInputs() {
    document.querySelectorAll('#editFirstName, #editLastName, #editMiddleName, #editAddress, #editHousehold').forEach(function(input) {
        if (input) {
            input.addEventListener('input', function() {
                applyUppercase(this);
            });
            input.addEventListener('blur', function() {
                applyUppercase(this);
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