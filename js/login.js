// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// LOGIN PAGE - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========================================
    // DOM REFS
    // ========================================
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const rememberMe = document.getElementById('rememberMe');
    const registerLink = document.getElementById('registerLink');
    const signInLabel = document.getElementById('signInLabel');
    const signInSubLabel = document.getElementById('signInSubLabel');
    const btnText = document.getElementById('btnText');
    const roleInput = document.getElementById('roleInput');

    // Role buttons
    const roleBtns = document.querySelectorAll('.role-btn');

    // ========================================
    // STATE
    // ========================================
    let selectedRole = roleInput ? roleInput.value : 'resident';

    // ========================================
    // ROLE LABELS
    // ========================================
    const roleLabels = {
        'bhw': {
            label: 'Sign In as BHW',
            subLabel: 'Enter your BHW credentials to access the dashboard.',
            btnText: 'Sign In as BHW',
            placeholder: 'Enter your BHW username or email'
        },
        'official': {
            label: 'Sign In as Official',
            subLabel: 'Enter your Official credentials to access the dashboard.',
            btnText: 'Sign In as Official',
            placeholder: 'Enter your Official username or email'
        },
        'resident': {
            label: 'Sign In as Resident',
            subLabel: 'Enter your Resident credentials to access your health records.',
            btnText: 'Sign In as Resident',
            placeholder: 'Enter your Resident username or email'
        }
    };

    // ========================================
    // UPDATE UI BASED ON ROLE
    // ========================================
    function updateRoleUI(role) {
        const labels = roleLabels[role];
        
        signInLabel.textContent = labels.label;
        signInSubLabel.textContent = labels.subLabel;
        btnText.textContent = labels.btnText;
        usernameInput.placeholder = labels.placeholder;
        
        // Show/hide register link
if (role === 'resident') {
    registerLink.style.display = 'block';
} else {
    registerLink.style.display = 'none';
}
        
        // Update role buttons
        roleBtns.forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.dataset.role === role) {
                btn.classList.add('active');
            }
        });
        
        // Update hidden input
        if (roleInput) {
            roleInput.value = role;
        }
        
        // Clear errors
        clearFieldErrors();
    }

    // ========================================
    // ROLE SELECTOR
    // ========================================
    roleBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const role = this.dataset.role;
            selectedRole = role;
            updateRoleUI(role);
        });
    });

    // ========================================
    // TOGGLE PASSWORD VISIBILITY
    // ========================================
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        if (icon) {
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        }
    });

    // ========================================
    // REAL-TIME VALIDATION
    // ========================================
    usernameInput.addEventListener('input', function() {
        if (this.value.trim()) {
            this.classList.remove('error');
            usernameError.classList.remove('visible');
        }
    });

    passwordInput.addEventListener('input', function() {
        if (this.value.trim()) {
            this.classList.remove('error');
            passwordError.classList.remove('visible');
        }
    });

    // ========================================
    // FORM VALIDATION
    // ========================================
    function validateForm() {
        let isValid = true;
        let firstError = null;
        
        if (!usernameInput.value.trim()) {
            usernameInput.classList.add('error');
            usernameError.textContent = 'Please enter your username or email';
            usernameError.classList.add('visible');
            isValid = false;
            if (!firstError) firstError = usernameInput;
        } else if (usernameInput.value.trim().length < 3) {
            usernameInput.classList.add('error');
            usernameError.textContent = 'Username must be at least 3 characters';
            usernameError.classList.add('visible');
            isValid = false;
            if (!firstError) firstError = usernameInput;
        } else {
            usernameInput.classList.remove('error');
            usernameError.classList.remove('visible');
        }
        
        if (!passwordInput.value.trim()) {
            passwordInput.classList.add('error');
            passwordError.textContent = 'Please enter your password';
            passwordError.classList.add('visible');
            isValid = false;
            if (!firstError) firstError = passwordInput;
        } else if (passwordInput.value.trim().length < 6) {
            passwordInput.classList.add('error');
            passwordError.textContent = 'Password must be at least 6 characters';
            passwordError.classList.add('visible');
            isValid = false;
            if (!firstError) firstError = passwordInput;
        } else {
            passwordInput.classList.remove('error');
            passwordError.classList.remove('visible');
        }
        
        if (!isValid && firstError) {
            firstError.focus();
        }
        
        return isValid;
    }

    function clearFieldErrors() {
        usernameInput.classList.remove('error');
        passwordInput.classList.remove('error');
        usernameError.classList.remove('visible');
        passwordError.classList.remove('visible');
    }

    // ========================================
    // FORM SUBMISSION
    // ========================================
    loginForm.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
        }
        // If valid, form submits normally to PHP
    });

    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================
    usernameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput.focus();
        }
    });

    // ========================================
    // INIT
    // ========================================
    updateRoleUI(selectedRole);

    console.log('🔐 Smart Community Health Monitoring System · Login Page');
});