// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// REGISTRATION PAGE - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========================================
    // DOM REFS
    // ========================================
    const form = document.getElementById('registerForm');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');
    const progressFill = document.getElementById('progressFill');
    const stepTitle = document.getElementById('stepTitle');
    const stepDescription = document.getElementById('stepDescription');
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const confirmCheck = document.getElementById('confirmCheck');

    // Name fields
    const firstName = document.getElementById('firstName');
    const middleName = document.getElementById('middleName');
    const lastName = document.getElementById('lastName');
    const nameError = document.getElementById('nameError');

    // Other Condition
    const otherConditionCheck = document.getElementById('otherConditionCheck');
    const otherConditionInput = document.getElementById('otherConditionInput');

    // Step info
    const stepInfo = {
        1: { title: 'Account Information', description: 'Create your login credentials to get started.' },
        2: { title: 'Personal Information', description: 'Tell us more about yourself.' },
        3: { title: 'Health Information', description: 'Provide your health details for better care.' },
        4: { title: 'Review & Confirm', description: 'Verify your information before submitting.' }
    };

    let currentStep = 1;
    const totalSteps = 4;
    let isSubmitting = false;

    // ========================================
    // AUTO-UPPERCASE FUNCTION
    // ========================================
    function applyUppercase(input) {
        if (input.id === 'username' || input.id === 'password' || 
            input.id === 'confirmPassword' || input.id === 'email' || 
            input.id === 'mobileNumber' || input.id === 'emergencyNumber') {
            return;
        }
        
        if (input && input.value) {
            const cursorPosition = input.selectionStart;
            const uppercaseValue = input.value.toUpperCase();
            if (input.value !== uppercaseValue) {
                input.value = uppercaseValue;
                input.setSelectionRange(cursorPosition, cursorPosition);
            }
        }
    }

    const uppercaseInputs = [
        'firstName', 'middleName', 'lastName',
        'address', 'household',
        'emergencyContact', 'medicalHistory'
    ];

    uppercaseInputs.forEach(function(id) {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                applyUppercase(this);
            });
            input.addEventListener('blur', function() {
                applyUppercase(this);
            });
        }
    });

    // ========================================
    // OTHER CONDITION HANDLING
    // ========================================
    if (otherConditionCheck && otherConditionInput) {
        otherConditionCheck.addEventListener('change', function() {
            if (this.checked) {
                otherConditionInput.disabled = false;
                otherConditionInput.focus();
            } else {
                otherConditionInput.disabled = true;
                otherConditionInput.value = '';
                otherConditionInput.classList.remove('error');
            }
        });

        const noneCheckbox = document.querySelector('.checkbox-group input[value="None"]');
        if (noneCheckbox) {
            noneCheckbox.addEventListener('change', function() {
                if (this.checked && otherConditionCheck.checked) {
                    otherConditionCheck.checked = false;
                    otherConditionInput.disabled = true;
                    otherConditionInput.value = '';
                }
            });
        }

        const conditionCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:not([value="None"])');
        conditionCheckboxes.forEach(function(cb) {
            cb.addEventListener('change', function() {
                if (this.checked && noneCheckbox && noneCheckbox.checked) {
                    noneCheckbox.checked = false;
                }
            });
        });
    }

    // ========================================
    // TOGGLE PASSWORD VISIBILITY
    // ========================================
    document.querySelectorAll('.toggle-password').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            if (input) {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                const icon = this.querySelector('i');
                if (icon) {
                    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
                }
                this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
            }
        });
    });

    // ========================================
    // AUTO-CALCULATE AGE FROM DOB
    // ========================================
    const dobInput = document.getElementById('dob');
    const ageInput = document.getElementById('age');

    dobInput.addEventListener('change', function() {
        if (this.value) {
            const birthDate = new Date(this.value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            ageInput.value = age > 0 ? age : '';
        }
    });

    // ========================================
    // NAVIGATION FUNCTIONS
    // ========================================
    function goToStep(step) {
        if (step > currentStep && !validateStep(currentStep)) {
            return;
        }

        currentStep = step;

        steps.forEach(function(s, index) {
            const stepNum = index + 1;
            s.classList.toggle('active', stepNum === currentStep);
        });

        updateProgress(currentStep);

        stepTitle.textContent = stepInfo[currentStep].title;
        stepDescription.textContent = stepInfo[currentStep].description;

        prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
        
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }

        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateProgress(step) {
        const progress = ((step - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = progress + '%';

        progressSteps.forEach(function(ps, index) {
            const stepNum = index + 1;
            ps.classList.remove('active', 'completed');
            if (stepNum === step) {
                ps.classList.add('active');
            } else if (stepNum < step) {
                ps.classList.add('completed');
            }
        });

        progressLines.forEach(function(pl, index) {
            const stepNum = index + 1;
            pl.classList.toggle('completed', stepNum < step);
        });
    }

    // ========================================
    // STEP VALIDATION
    // ========================================
    function validateStep(step) {
        const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        if (!stepElement) return true;

        if (step === 1) {
            applyUppercase(firstName);
            applyUppercase(middleName);
            applyUppercase(lastName);

            if (!firstName.value.trim() || !lastName.value.trim()) {
                nameError.textContent = 'Please enter your first and last name';
                nameError.classList.add('visible');
                firstName.classList.add('error');
                lastName.classList.add('error');
                return false;
            } else {
                nameError.classList.remove('visible');
                firstName.classList.remove('error');
                lastName.classList.remove('error');
            }
        }

        uppercaseInputs.forEach(function(id) {
            const input = document.getElementById(id);
            if (input) {
                applyUppercase(input);
            }
        });

        const inputs = stepElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        let firstError = null;

        inputs.forEach(function(input) {
            const errorEl = input.parentElement.querySelector('.error-message');
            const value = input.value.trim();

            if (input.id === 'firstName' || input.id === 'lastName') {
                return;
            }

            if (input.id === 'middleName') {
                return;
            }

            if (input.type === 'hidden' || input.disabled || input.readOnly) {
                return;
            }

            if (input.type === 'checkbox') {
                return;
            }

            if (input.id === 'email' && value && !isValidEmail(value)) {
                input.classList.add('error');
                if (errorEl) {
                    errorEl.textContent = 'Please enter a valid email address';
                    errorEl.classList.add('visible');
                }
                isValid = false;
                if (!firstError) firstError = input;
                return;
            }

            if (input.id === 'mobileNumber' && value && !isValidMobile(value)) {
                input.classList.add('error');
                if (errorEl) {
                    errorEl.textContent = 'Please enter a valid mobile number (e.g., 0912-345-6789)';
                    errorEl.classList.add('visible');
                }
                isValid = false;
                if (!firstError) firstError = input;
                return;
            }

            if (input.id === 'confirmPassword') {
                const password = document.getElementById('password').value;
                if (value !== password) {
                    input.classList.add('error');
                    if (errorEl) {
                        errorEl.textContent = 'Passwords do not match';
                        errorEl.classList.add('visible');
                    }
                    isValid = false;
                    if (!firstError) firstError = input;
                    return;
                }
            }

            if (input.id === 'username' && value) {
                if (value.length < 3) {
                    input.classList.add('error');
                    if (errorEl) {
                        errorEl.textContent = 'Username must be at least 3 characters';
                        errorEl.classList.add('visible');
                    }
                    isValid = false;
                    if (!firstError) firstError = input;
                    return;
                }
                if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    input.classList.add('error');
                    if (errorEl) {
                        errorEl.textContent = 'Username can only contain letters, numbers, and underscores';
                        errorEl.classList.add('visible');
                    }
                    isValid = false;
                    if (!firstError) firstError = input;
                    return;
                }
            }

            if (input.id === 'password' && value) {
                if (value.length < 6) {
                    input.classList.add('error');
                    if (errorEl) {
                        errorEl.textContent = 'Password must be at least 6 characters';
                        errorEl.classList.add('visible');
                    }
                    isValid = false;
                    if (!firstError) firstError = input;
                    return;
                }
            }

            if (!value && input.id !== 'email' && input.id !== 'middleName') {
                input.classList.add('error');
                if (errorEl) {
                    errorEl.classList.add('visible');
                }
                isValid = false;
                if (!firstError) firstError = input;
                return;
            }

            input.classList.remove('error');
            if (errorEl) {
                errorEl.classList.remove('visible');
            }
        });

        if (step === 3 && otherConditionCheck && otherConditionCheck.checked) {
            if (!otherConditionInput.value.trim()) {
                otherConditionInput.classList.add('error');
                isValid = false;
                if (!firstError) firstError = otherConditionInput;
            } else {
                otherConditionInput.classList.remove('error');
            }
        }

        if (step === 4) {
            const confirmError = document.getElementById('confirmError');
            if (!confirmCheck.checked) {
                confirmError.classList.add('visible');
                isValid = false;
                if (!firstError) firstError = confirmCheck;
            } else {
                confirmError.classList.remove('visible');
            }
        }

        if (!isValid && firstError) {
            firstError.focus();
            if (firstError.type === 'checkbox') {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return isValid;
    }

    // ========================================
    // VALIDATION HELPERS
    // ========================================
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidMobile(mobile) {
        return /^(\+?63|0)?[0-9]{10,13}$/.test(mobile.replace(/[\s-]/g, ''));
    }

    // ========================================
    // REAL-TIME VALIDATION
    // ========================================
    [firstName, lastName].forEach(function(input) {
        input.addEventListener('input', function() {
            applyUppercase(this);
            if (firstName.value.trim() && lastName.value.trim()) {
                nameError.classList.remove('visible');
                firstName.classList.remove('error');
                lastName.classList.remove('error');
            }
        });
    });

    if (middleName) {
        middleName.addEventListener('input', function() {
            applyUppercase(this);
        });
    }

    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            if (this.value && this.value.length < 3) {
                this.classList.add('error');
                const errorEl = this.parentElement.querySelector('.error-message');
                if (errorEl) {
                    errorEl.textContent = 'Username must be at least 3 characters';
                    errorEl.classList.add('visible');
                }
            } else if (this.value && !/^[a-zA-Z0-9_]+$/.test(this.value)) {
                this.classList.add('error');
                const errorEl = this.parentElement.querySelector('.error-message');
                if (errorEl) {
                    errorEl.textContent = 'Username can only contain letters, numbers, and underscores';
                    errorEl.classList.add('visible');
                }
            } else if (this.value) {
                this.classList.remove('error');
                const errorEl = this.parentElement.querySelector('.error-message');
                if (errorEl) {
                    errorEl.classList.remove('visible');
                }
            }
        });
    }

    document.querySelectorAll('input[required], select[required], textarea[required]').forEach(function(input) {
        if (input.id === 'firstName' || input.id === 'lastName' || input.id === 'middleName') {
            return;
        }

        input.addEventListener('focus', function() {
            this.classList.remove('error');
            const errorEl = this.parentElement.querySelector('.error-message');
            if (errorEl) {
                errorEl.classList.remove('visible');
            }
        });

        input.addEventListener('blur', function() {
            if (this.type === 'text' || this.type === 'textarea' || this.tagName === 'TEXTAREA') {
                applyUppercase(this);
            }

            if (this.value.trim() && this.id !== 'confirmPassword' && this.id !== 'mobileNumber' && this.id !== 'username' && this.id !== 'password') {
                this.classList.remove('error');
                const errorEl = this.parentElement.querySelector('.error-message');
                if (errorEl) {
                    errorEl.classList.remove('visible');
                }
            }
        });

        if (input.id === 'confirmPassword') {
            input.addEventListener('input', function() {
                const password = document.getElementById('password').value;
                if (this.value && this.value !== password) {
                    this.classList.add('error');
                    const errorEl = this.parentElement.querySelector('.error-message');
                    if (errorEl) {
                        errorEl.textContent = 'Passwords do not match';
                        errorEl.classList.add('visible');
                    }
                } else if (this.value) {
                    this.classList.remove('error');
                    const errorEl = this.parentElement.querySelector('.error-message');
                    if (errorEl) {
                        errorEl.classList.remove('visible');
                    }
                }
            });
        }

        if (input.id === 'password') {
            input.addEventListener('input', function() {
                const confirm = document.getElementById('confirmPassword');
                if (confirm.value && confirm.value !== this.value) {
                    confirm.classList.add('error');
                    const errorEl = confirm.parentElement.querySelector('.error-message');
                    if (errorEl) {
                        errorEl.textContent = 'Passwords do not match';
                        errorEl.classList.add('visible');
                    }
                } else if (confirm.value) {
                    confirm.classList.remove('error');
                    const errorEl = confirm.parentElement.querySelector('.error-message');
                    if (errorEl) {
                        errorEl.classList.remove('visible');
                    }
                }

                if (this.value && this.value.length < 6) {
                    this.classList.add('error');
                    const errorEl = this.parentElement.querySelector('.error-message');
                    if (errorEl) {
                        errorEl.textContent = 'Password must be at least 6 characters';
                        errorEl.classList.add('visible');
                    }
                } else if (this.value) {
                    this.classList.remove('error');
                    const errorEl = this.parentElement.querySelector('.error-message');
                    if (errorEl) {
                        errorEl.classList.remove('visible');
                    }
                }
            });
        }

        if (input.id === 'mobileNumber') {
            input.addEventListener('input', function() {
                if (this.value && !isValidMobile(this.value)) {
                    this.classList.add('error');
                    const errorEl = this.parentElement.querySelector('.error-message');
                    if (errorEl) {
                        errorEl.textContent = 'Please enter a valid mobile number (e.g., 0912-345-6789)';
                        errorEl.classList.add('visible');
                    }
                } else if (this.value) {
                    this.classList.remove('error');
                    const errorEl = this.parentElement.querySelector('.error-message');
                    if (errorEl) {
                        errorEl.classList.remove('visible');
                    }
                }
            });
        }

        if (input.type === 'text' && input.id !== 'username' && input.id !== 'email' && input.id !== 'mobileNumber') {
            input.addEventListener('blur', function() {
                applyUppercase(this);
            });
        }
    });

    // ========================================
    // NAVIGATION BUTTONS
    // ========================================
    prevBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    });

    nextBtn.addEventListener('click', function() {
        if (currentStep < totalSteps) {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
                if (currentStep === 4) {
                    populateReview();
                }
            }
        }
    });

    // ========================================
    // POPULATE REVIEW
    // ========================================
    function populateReview() {
        const getVal = (id) => document.getElementById(id)?.value || '-';
        const getSelectText = (id) => {
            const el = document.getElementById(id);
            return el ? el.options[el.selectedIndex]?.text || '-' : '-';
        };

        const first = firstName.value.trim();
        const middle = middleName.value.trim();
        const last = lastName.value.trim();
        let fullName = first;
        if (middle) fullName += ' ' + middle;
        fullName += ' ' + last;

        document.getElementById('reviewFullName').textContent = fullName;
        document.getElementById('reviewUsername').textContent = getVal('username');
        document.getElementById('reviewMobile').textContent = getVal('mobileNumber') || '-';
        document.getElementById('reviewEmail').textContent = getVal('email') || '-';

        const dob = getVal('dob');
        document.getElementById('reviewDob').textContent = dob ? formatDate(dob) : '-';
        document.getElementById('reviewAge').textContent = getVal('age') || '-';
        document.getElementById('reviewSex').textContent = getSelectText('sex');
        document.getElementById('reviewPurok').textContent = getSelectText('purok');
        document.getElementById('reviewAddress').textContent = getVal('address');
        document.getElementById('reviewHousehold').textContent = getVal('household') || '-';

        document.getElementById('reviewMedicalHistory').textContent = getVal('medicalHistory') || 'None provided';
        
        const selectedConditions = [];
        document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(function(cb) {
            selectedConditions.push(cb.value);
        });
        if (otherConditionCheck && otherConditionCheck.checked && otherConditionInput.value.trim()) {
            selectedConditions.push(otherConditionInput.value.trim());
        }
        document.getElementById('reviewConditions').textContent = selectedConditions.length > 0 ? selectedConditions.join(', ') : 'None';
        
        document.getElementById('reviewEmergencyContact').textContent = getVal('emergencyContact');
        document.getElementById('reviewEmergencyNumber').textContent = getVal('emergencyNumber');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // ========================================
    // FORM SUBMISSION - PHP BACKEND
    // ========================================
    form.addEventListener('submit', function(e) {
        // Let the form submit normally to PHP
        // JavaScript validation still runs but doesn't prevent form submission
        // The PHP backend will handle the actual registration

        // Run validation to show errors if any
        let allValid = true;
        for (let i = 1; i <= totalSteps; i++) {
            if (!validateStep(i)) {
                allValid = false;
                goToStep(i);
                break;
            }
        }

        if (!allValid) {
            e.preventDefault(); // Prevent submission if validation fails
            return;
        }

        // If validation passes, allow normal form submission to PHP
        // Show loading state on submit button
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-text"><i class="fas fa-spinner fa-spin"></i> Submitting...</span>';
        }
    });

    // ========================================
    // CHECK FOR SUCCESS MESSAGE FROM PHP
    // ========================================
    // If the success message is already visible (from PHP redirect), hide the form
    const successMsg = document.getElementById('successMessage');
    if (successMsg && successMsg.style.display !== 'none') {
        form.style.display = 'none';
        successMsg.style.display = 'block';
    }

    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const activeStep = document.querySelector('.form-step.active');
            if (activeStep) {
                const stepNum = parseInt(activeStep.dataset.step);
                if (stepNum === totalSteps) {
                    if (confirmCheck.checked) {
                        form.dispatchEvent(new Event('submit'));
                    }
                } else if (nextBtn.style.display !== 'none') {
                    nextBtn.click();
                }
            }
        }
    });

    // ========================================
    // INIT
    // ========================================
    goToStep(1);

    console.log('📝 Smart Community Health Monitoring System · Registration Page');
    console.log('📋 Step-by-step registration flow with 4 steps');
    console.log('🔠 Text inputs auto-uppercase (except username)');
    console.log('📝 Name fields: First Name (required), Middle Name (optional), Last Name (required)');
    console.log('➕ "Other" condition input available');
    console.log('🔗 PHP Backend: auth/register.php');
});
// ========================================
// MOBILE NUMBER VALIDATION (11 digits)
// ========================================
const mobileInput = document.getElementById('mobileNumber');
const mobileError = document.getElementById('mobileError');

function validateMobileNumber() {
    if (!mobileInput) return;
    
    const value = mobileInput.value.trim();
    // Remove spaces, dashes, and plus sign for validation
    const cleaned = value.replace(/[\s-]/g, '');
    
    // Check if it matches 11 digits (09XXXXXXXXX) or +63XXXXXXXXXX
    const isValid = /^(\+63|0)?[0-9]{10}$/.test(cleaned);
    
    if (value && !isValid) {
        mobileInput.classList.add('error');
        if (mobileError) {
            mobileError.classList.add('visible');
        }
    } else {
        mobileInput.classList.remove('error');
        if (mobileError) {
            mobileError.classList.remove('visible');
        }
    }
    
    return isValid;
}

// Real-time validation
if (mobileInput) {
    mobileInput.addEventListener('input', function() {
        validateMobileNumber();
    });
    
    mobileInput.addEventListener('blur', function() {
        validateMobileNumber();
    });
}

// Also validate on submit
const originalSubmit = form ? form.addEventListener('submit', function(e) {
    if (!validateMobileNumber()) {
        e.preventDefault();
        goToStep(1);
        showToast('Please enter a valid 11-digit mobile number.', 'error');
    }
}) : null;