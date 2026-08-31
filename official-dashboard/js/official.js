// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// OFFICIAL DASHBOARD - SIMPLIFIED
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========================================
    // DOM REFS
    // ========================================
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const pageSections = document.querySelectorAll('.page-section');
    const pageTitle = document.getElementById('pageTitle');

    // Modals
    const addBhwModal = document.getElementById('addBhwModal');
    const addBhwForm = document.getElementById('addBhwForm');
    const addBhwBtn = document.getElementById('addBhwBtn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const submitBhwBtn = document.getElementById('submitBhwBtn');

    // Search & Filters
    const globalSearch = document.getElementById('globalSearch');
    const residentSearch = document.getElementById('residentSearch');
    const purokFilter = document.getElementById('purokFilter');
    const clearFilters = document.getElementById('clearFilters');
    const bhwSearch = document.getElementById('bhwSearch');
    const residentTypeFilter = document.getElementById('residentTypeFilter');
    const ageRangeFilter = document.getElementById('ageRangeFilter');

    // Quick Actions
    const quickActions = document.querySelectorAll('.quick-action');
    const viewAllLinks = document.querySelectorAll('.view-all');

    // Toggle Password
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    // Report generation
    const generateReportBtns = document.querySelectorAll('.generate-report');
    const closePreview = document.getElementById('closePreview');
    const reportPreview = document.getElementById('reportPreview');

    // ========================================
    // PREVENT BACK BUTTON AFTER LOGOUT
    // ========================================
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            window.location.reload();
        }
    });

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
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    // ========================================
    // NAVIGATION
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
            'bhw-management': 'BHW Management',
            'reports': 'Reports',
            'settings': 'Settings'
        };
        pageTitle.textContent = pageNames[page] || 'Dashboard';
    }

    navItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            navigateTo(page);
        });
    });

    quickActions.forEach(function(action) {
        action.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                navigateTo(page);
                if (page === 'bhw-management') {
                    openModal(addBhwModal);
                }
            }
        });
    });

    viewAllLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });

    // ========================================
    // MODAL FUNCTIONS
    // ========================================
    function openModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    closeModalBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.show').forEach(function(modal) {
                closeModal(modal);
            });
        }
    });

    // ========================================
    // TOGGLE PASSWORD VISIBILITY
    // ========================================
    togglePasswordBtns.forEach(function(btn) {
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
            }
        });
    });

    // ========================================
    // ADD BHW - SIMPLEST VERSION
    // ========================================
    if (addBhwBtn) {
        addBhwBtn.addEventListener('click', function() {
            addBhwForm.reset();
            document.getElementById('formError').style.display = 'none';
            document.querySelectorAll('#addBhwForm .error').forEach(function(el) {
                el.classList.remove('error');
            });
            openModal(addBhwModal);
        });
    }

    if (addBhwForm) {
        addBhwForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get required fields
            const firstName = document.getElementById('bhwFirstName').value.trim();
            const lastName = document.getElementById('bhwLastName').value.trim();
            const username = document.getElementById('bhwUsername').value.trim();
            const password = document.getElementById('bhwPassword').value;
            const confirmPassword = document.getElementById('bhwConfirmPassword').value;
            
            // Show error div
            const errorDiv = document.getElementById('formError');
            const errorMsg = document.getElementById('formErrorMessage');
            
            // Clear previous errors
            document.querySelectorAll('#addBhwForm .error').forEach(function(el) {
                el.classList.remove('error');
            });
            errorDiv.style.display = 'none';
            
            // Validate
            if (!firstName) {
                document.getElementById('bhwFirstName').classList.add('error');
                errorMsg.textContent = 'Please enter first name.';
                errorDiv.style.display = 'block';
                document.getElementById('bhwFirstName').focus();
                return;
            }
            
            if (!lastName) {
                document.getElementById('bhwLastName').classList.add('error');
                errorMsg.textContent = 'Please enter last name.';
                errorDiv.style.display = 'block';
                document.getElementById('bhwLastName').focus();
                return;
            }
            
            if (!username) {
                document.getElementById('bhwUsername').classList.add('error');
                errorMsg.textContent = 'Please enter username.';
                errorDiv.style.display = 'block';
                document.getElementById('bhwUsername').focus();
                return;
            }
            
            if (!password) {
                document.getElementById('bhwPassword').classList.add('error');
                errorMsg.textContent = 'Please enter password.';
                errorDiv.style.display = 'block';
                document.getElementById('bhwPassword').focus();
                return;
            }
            
            if (!confirmPassword) {
                document.getElementById('bhwConfirmPassword').classList.add('error');
                errorMsg.textContent = 'Please confirm password.';
                errorDiv.style.display = 'block';
                document.getElementById('bhwConfirmPassword').focus();
                return;
            }
            
            if (password !== confirmPassword) {
                document.getElementById('bhwConfirmPassword').classList.add('error');
                errorMsg.textContent = 'Passwords do not match.';
                errorDiv.style.display = 'block';
                document.getElementById('bhwConfirmPassword').focus();
                return;
            }
            
            if (password.length < 6) {
                document.getElementById('bhwPassword').classList.add('error');
                errorMsg.textContent = 'Password must be at least 6 characters.';
                errorDiv.style.display = 'block';
                document.getElementById('bhwPassword').focus();
                return;
            }
            
            // If all valid, submit
            const formData = new FormData(this);
            formData.append('action', 'add_bhw');
            
            submitBhwBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            submitBhwBtn.disabled = true;
            
            fetch('ajax_handler.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    closeModal(addBhwModal);
                    addBhwForm.reset();
                    setTimeout(function() {
                        window.location.reload();
                    }, 1500);
                } else {
                    showToast(data.message, 'error');
                }
            })
            .catch(function(error) {
                console.error('Fetch error:', error);
                showToast('Network error. Please try again.', 'error');
            })
            .finally(function() {
                submitBhwBtn.innerHTML = 'Create BHW Account';
                submitBhwBtn.disabled = false;
            });
        });
    }

    // ========================================
    // DEACTIVATE BHW
    // ========================================
    document.querySelectorAll('.deactivate-bhw').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const userId = this.dataset.id;
            if (confirm('Are you sure you want to deactivate this BHW?')) {
                fetch('ajax_handler.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'action=deactivate_bhw&user_id=' + userId
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast(data.message, 'success');
                        window.location.reload();
                    } else {
                        showToast(data.message, 'error');
                    }
                })
                .catch(function(error) {
                    console.error('Fetch error:', error);
                    showToast('Network error.', 'error');
                });
            }
        });
    });

    // ========================================
    // VIEW/EDIT BHW
    // ========================================
    document.querySelectorAll('.view-bhw').forEach(function(btn) {
        btn.addEventListener('click', function() {
            showToast('View BHW details - Coming soon', 'info');
        });
    });

    document.querySelectorAll('.edit-bhw').forEach(function(btn) {
        btn.addEventListener('click', function() {
            showToast('Edit BHW - Coming soon', 'info');
        });
    });

    // ========================================
    // SEARCH & FILTER - Residents (UPDATED)
    // ========================================
    function filterResidents() {
        const searchTerm = residentSearch ? residentSearch.value.toLowerCase().trim() : '';
        const purokVal = purokFilter ? purokFilter.value : '';
        const typeVal = residentTypeFilter ? residentTypeFilter.value : '';
        const ageRangeVal = ageRangeFilter ? ageRangeFilter.value : '';
        
        const rows = document.querySelectorAll('#residentTableBody tr:not(.empty-state)');
        let visibleCount = 0;
        
        rows.forEach(function(row) {
            const name = row.dataset.name || '';
            const purok = row.dataset.purok || '';
            const type = row.dataset.type || '';
            const age = parseFloat(row.dataset.age) || 0;
            
            let show = true;
            
            // Search by name
            if (searchTerm && !name.includes(searchTerm)) {
                show = false;
            }
            
            // Filter by purok
            if (purokVal && purok !== purokVal) {
                show = false;
            }
            
            // Filter by type (Adult/Child)
            if (typeVal && type !== typeVal) {
                show = false;
            }
            
            // Filter by age range
            if (ageRangeVal) {
                let ageMin = 0;
                let ageMax = 999;
                
                switch(ageRangeVal) {
                    case '0-1':
                        ageMin = 0;
                        ageMax = 1;
                        break;
                    case '1-5':
                        ageMin = 1;
                        ageMax = 5;
                        break;
                    case '6-12':
                        ageMin = 6;
                        ageMax = 12;
                        break;
                    case '13-17':
                        ageMin = 13;
                        ageMax = 17;
                        break;
                    case '18-30':
                        ageMin = 18;
                        ageMax = 30;
                        break;
                    case '31-50':
                        ageMin = 31;
                        ageMax = 50;
                        break;
                    case '51+':
                        ageMin = 51;
                        ageMax = 999;
                        break;
                }
                
                if (age < ageMin || age > ageMax) {
                    show = false;
                }
            }
            
            row.style.display = show ? '' : 'none';
            if (show) visibleCount++;
        });
        
        const resultsCount = document.getElementById('residentResults');
        if (resultsCount) {
            resultsCount.textContent = visibleCount + ' resident' + (visibleCount !== 1 ? 's' : '');
        }
    }

    // ========================================
    // SEARCH & FILTER - BHWs
    // ========================================
    function filterBHWs() {
        const searchTerm = bhwSearch ? bhwSearch.value.toLowerCase().trim() : '';
        const rows = document.querySelectorAll('#bhwTableBody tr:not(.empty-state)');
        let visibleCount = 0;
        
        rows.forEach(function(row) {
            const name = row.querySelector('td:first-child')?.textContent?.toLowerCase() || '';
            const username = row.querySelector('td:nth-child(2)')?.textContent?.toLowerCase() || '';
            
            let show = true;
            
            if (searchTerm && !name.includes(searchTerm) && !username.includes(searchTerm)) {
                show = false;
            }
            
            row.style.display = show ? '' : 'none';
            if (show) visibleCount++;
        });
        
        const resultsCount = document.getElementById('bhwResults');
        if (resultsCount) {
            resultsCount.textContent = visibleCount + ' BHWs';
        }
    }

    // ========================================
    // SEARCH EVENTS (UPDATED)
    // ========================================
    if (residentSearch) {
        residentSearch.addEventListener('input', filterResidents);
    }

    if (purokFilter) {
        purokFilter.addEventListener('change', filterResidents);
    }

    if (residentTypeFilter) {
        residentTypeFilter.addEventListener('change', filterResidents);
    }

    if (ageRangeFilter) {
        ageRangeFilter.addEventListener('change', filterResidents);
    }

    if (clearFilters) {
        clearFilters.addEventListener('click', function() {
            if (residentSearch) residentSearch.value = '';
            if (purokFilter) purokFilter.value = '';
            if (residentTypeFilter) residentTypeFilter.value = '';
            if (ageRangeFilter) ageRangeFilter.value = '';
            filterResidents();
        });
    }

    if (bhwSearch) {
        bhwSearch.addEventListener('input', filterBHWs);
    }

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

    // ========================================
    // REPORT GENERATION
    // ========================================
    generateReportBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const reportType = this.dataset.report;
            const reportNames = {
                'resident': 'Resident Demographics Report',
                'prenatal': 'Prenatal Summary Report',
                'immunization': 'Immunization Coverage Report',
                'bmi': 'BMI Status Report',
                'opt': 'OPT Report',
                'monthly': 'Monthly Health Summary Report',
                'bhw': 'BHW Performance Report',
                'appointments': 'Appointments Summary Report',
                'sms': 'SMS Activity Report'
            };
            
            const title = reportNames[reportType] || 'Report';
            showReportPreview(title);
            showToast('Generating ' + title + '...', 'info');
            
            setTimeout(function() {
                showToast('Report generated successfully!', 'success');
            }, 1500);
        });
    });

    function showReportPreview(title) {
        const preview = document.getElementById('reportPreview');
        const previewTitle = document.getElementById('reportPreviewTitle');
        if (preview && previewTitle) {
            previewTitle.textContent = title;
            preview.style.display = 'block';
            preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    if (closePreview) {
        closePreview.addEventListener('click', function() {
            reportPreview.style.display = 'none';
        });
    }

    // ========================================
    // TOAST NOTIFICATION
    // ========================================
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + (type || 'info');
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
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
    // USER AVATAR CLICK
    // ========================================
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            showToast('Official Profile', 'info');
        });
    }

    // ========================================
    // INIT
    // ========================================
    navigateTo('dashboard');
    filterResidents();
    filterBHWs();

    console.log('👔 Smart Community Health Monitoring System · Official Dashboard');
});