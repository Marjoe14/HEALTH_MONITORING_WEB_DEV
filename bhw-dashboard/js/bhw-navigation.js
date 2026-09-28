// ========================================
// BHW NAVIGATION - Page routing
// ========================================

// ========================================
// NAVIGATE TO PAGE
// ========================================
function navigateTo(page) {
    navItems.forEach(function(item) {
        item.classList.toggle('active', item.dataset.page === page);
    });

    pageSections.forEach(function(section) {
        section.classList.toggle('active', section.id === 'page-' + page);
    });

    const pageNames = {
        'dashboard': 'Dashboard',
        'residents': 'Residents',
        'bmi': 'BMI Assessment',
        'prenatal': 'Prenatal Care',
        'immunization': 'Immunization',
        'vaccine-management': 'Vaccine Management',
        'opt': 'Operation Timbang',
        'appointments': 'Appointments',
        'notifications': 'Notifications',
        'sms': 'SMS Notifications',
        'reports': 'Reports',
        'settings': 'Settings'
    };
    pageTitle.textContent = pageNames[page] || 'Dashboard';

    currentPage = page;

    // Page-specific rendering
    if (page === 'bmi') renderBmi();
    if (page === 'prenatal') renderPrenatal();
    if (page === 'immunization') renderImmunization();
    if (page === 'vaccine-management') {
        if (typeof loadVaccineManagement === 'function') {
            loadVaccineManagement();
        }
    }
    if (page === 'opt') renderOpt();
    if (page === 'appointments') {
        renderAppointments();
        fetchPendingCancellations();
    }
    if (page === 'sms') populateSmsResidents();
    if (page === 'notifications') {
        fetchBhwNotifications();
    }
}

// ========================================
// NAV EVENT LISTENERS
// ========================================
function initNavigationEventListeners() {
    navItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            navigateTo(page);
        });
    });

    document.querySelectorAll('.quick-action').forEach(function(action) {
        action.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            const actionType = this.dataset.action;
            if (page === 'residents') {
                navigateTo('residents');
                if (actionType === 'adult') {
                    openModal(addAdultModal);
                } else if (actionType === 'child') {
                    clearChildParentFields();
                    openModal(addChildModal);
                }
            } else if (page) {
                navigateTo(page);
                if (page === 'bmi') openModal(recordBmiModal);
                if (page === 'immunization') {
                    populateImmunizationChildren();
                    openModal(recordImmunizationModal);
                }
                if (page === 'prenatal') {
                    populatePrenatalResidents();
                    openModal(addPrenatalModal);
                }
                if (page === 'opt') {
                    populateOptChildren();
                    openModal(addOptModal);
                }
            }
        });
    });

    document.querySelectorAll('.view-all').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });

    if (globalSearch) {
        globalSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    navigateTo('residents');
                    if (residentSearch) {
                        residentSearch.value = query;
                        filterResidents();
                    }
                }
            }
        });
    }
}