// ========================================
// RESIDENT NAVIGATION - Page routing & sidebar
// ========================================

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
        'profile': 'My Profile',
        'health-records': 'Health Records',
        'appointments': 'Appointments',
        'notifications': 'Notifications',
        'settings': 'Settings'
    };
    pageTitle.textContent = pageNames[page] || 'Dashboard';

    currentPage = page;

    if (page === 'notifications' || page === 'dashboard') {
        fetchNotifications();
    }

    if (page === 'dashboard') {
        fetchDashboardData();
    }

    if (page === 'appointments') {
        fetchResidentAppointments();
    }

    if (page === 'health-records') {
        if (typeof window.fetchHealthRecords === 'function') {
            window.fetchHealthRecords();
        } else {
            setTimeout(function() {
                if (typeof window.fetchHealthRecords === 'function') {
                    window.fetchHealthRecords();
                }
            }, 500);
        }
    }
}

// ========================================
// INIT NAV EVENT LISTENERS
// ========================================
function initNavigationEventListeners() {
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    navItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            navigateTo(page);
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            navigateTo('profile');
        });
    }
}

// ========================================
// RECORD TABS
// ========================================
function initRecordTabs() {
    recordTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;

            recordTabs.forEach(function(t) {
                t.classList.toggle('active', t.dataset.tab === tabName);
            });

            recordContents.forEach(function(content) {
                content.classList.toggle('active', content.id === 'tab-' + tabName);
            });
        });
    });
}