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
            
            fetch('ajax/ajax_handler.php', {
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
                fetch('ajax/ajax_handler.php', {
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
    // VIEW/EDIT BHW - Now handled by bhw-actions.js
    // ========================================
    // The view and edit BHW functionality is now handled by bhw-actions.js
    // We'll keep these as fallbacks

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
    // REPORT GENERATION - ACTUAL AJAX IMPLEMENTATION
    // ========================================
    
    // Remove existing listeners and add new ones
    generateReportBtns.forEach(function(btn) {
        // Remove any existing listeners (to avoid duplicates)
        btn.removeEventListener('click', handleReportGeneration);
        btn.addEventListener('click', handleReportGeneration);
    });

    function handleReportGeneration(e) {
        e.preventDefault();
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
        const preview = document.getElementById('reportPreview');
        const previewTitle = document.getElementById('reportPreviewTitle');
        const previewContent = document.querySelector('.report-preview-content');
        
        // Show preview with loading state
        if (preview) {
            preview.style.display = 'block';
            preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        if (previewTitle) {
            previewTitle.textContent = 'Generating ' + title + '...';
        }
        
        if (previewContent) {
            previewContent.innerHTML = `
                <div class="report-placeholder">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; color: var(--primary);"></i>
                    <p>Generating report...</p>
                    <span class="empty-sub">Please wait while we compile the data.</span>
                </div>
            `;
        }
        
        // Make AJAX request to ajax_handler.php
        const formData = new FormData();
        formData.append('action', 'generate_report');
        formData.append('report_type', reportType);
        
        fetch('ajax/ajax_handler.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (previewTitle) {
                    previewTitle.textContent = data.title || title;
                }
                if (previewContent) {
                    previewContent.innerHTML = data.html;
                    
                    // Store current report for export
                    window.currentReportHTML = data.html;
                    window.currentReportTitle = data.title || title;
                    
                    // Add print button functionality (First button)
                    const printBtn = document.querySelector('.report-preview-actions .btn-outline:first-child');
                    if (printBtn) {
                        printBtn.onclick = function(e) {
                            e.preventDefault();
                            printReport();
                        };
                    }
                    
                    // Add PDF export button functionality (Second button - now auto-downloads)
                    const pdfBtn = document.querySelector('.report-preview-actions .btn-outline:nth-child(2)');
                    if (pdfBtn) {
                        pdfBtn.textContent = ' Export PDF';
                        pdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export PDF';
                        pdfBtn.onclick = function(e) {
                            e.preventDefault();
                            exportToPDF();
                        };
                    }
                    
                    // Remove Download button (Third button - btn-primary)
                    const downloadBtn = document.querySelector('.report-preview-actions .btn-primary');
                    if (downloadBtn) {
                        downloadBtn.style.display = 'none';
                    }
                }
                showToast('Report generated successfully!', 'success');
            } else {
                showToast(data.message || 'Failed to generate report.', 'error');
                if (previewContent) {
                    previewContent.innerHTML = `
                        <div class="report-placeholder">
                            <i class="fas fa-exclamation-circle" style="font-size: 2.5rem; color: var(--danger);"></i>
                            <p>${data.message || 'Failed to generate report.'}</p>
                            <span class="empty-sub">Please try again or contact support.</span>
                        </div>
                    `;
                }
            }
        })
        .catch(function(error) {
            console.error('Report generation error:', error);
            showToast('Network error. Please try again.', 'error');
            if (previewContent) {
                previewContent.innerHTML = `
                    <div class="report-placeholder">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: var(--danger);"></i>
                        <p>Network error occurred.</p>
                        <span class="empty-sub">Please check your connection and try again.</span>
                    </div>
                `;
            }
        });
    }

    // ========================================
    // PRINT REPORT
    // ========================================
    function printReport() {
        const content = document.querySelector('.report-preview-content');
        if (!content) {
            showToast('No report content to print.', 'error');
            return;
        }
        
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            showToast('Please allow popups for printing.', 'error');
            return;
        }
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${window.currentReportTitle || 'Health Report'}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                        padding: 40px;
                        color: #1A2A3A;
                        line-height: 1.6;
                        max-width: 1100px;
                        margin: 0 auto;
                    }
                    .report-print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #4A90D9;
                        padding-bottom: 20px;
                    }
                    .report-print-header h1 { font-size: 24px; color: #1A2A3A; font-weight: 700; }
                    .report-print-header .barangay-name { font-size: 16px; color: #4A90D9; font-weight: 600; }
                    .report-print-header .report-date { font-size: 12px; color: #5A6C7D; margin-top: 4px; }
                    .report-print-footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #E8EEF4;
                        font-size: 12px;
                        color: #5A6C7D;
                    }
                    .report-content { padding: 10px 0; }
                    .report-content h2 { font-size: 20px; font-weight: 700; color: #1A2A3A; margin-bottom: 4px; }
                    .report-content h3 { font-size: 16px; font-weight: 600; color: #1A2A3A; margin: 20px 0 12px 0; }
                    .report-content hr { border: none; border-top: 2px solid #E8EEF4; margin: 12px 0 20px 0; }
                    .report-stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 12px;
                        margin-bottom: 20px;
                    }
                    .report-stat {
                        background: #F5FAFF;
                        padding: 14px 16px;
                        border-radius: 8px;
                        text-align: center;
                        border: 1px solid #E8EEF4;
                    }
                    .report-stat strong { display: block; font-size: 11px; color: #5A6C7D; text-transform: uppercase; letter-spacing: 0.5px; }
                    .report-stat .stat-number { font-size: 24px; font-weight: 700; color: #1A2A3A; }
                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                        margin: 8px 0 16px 0;
                    }
                    .report-table th {
                        background: #EBF3FB;
                        text-align: left;
                        padding: 8px 12px;
                        font-weight: 600;
                        color: #1A2A3A;
                        border-bottom: 2px solid #90CAF9;
                    }
                    .report-table td {
                        padding: 6px 12px;
                        border-bottom: 1px solid #E8EEF4;
                    }
                    .report-table tr:nth-child(even) td { background: #FAFCFE; }
                    .status-badge {
                        display: inline-block;
                        padding: 2px 12px;
                        border-radius: 50px;
                        font-size: 11px;
                        font-weight: 600;
                    }
                    .status-badge.status-completed { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-upcoming { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-overdue { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-active { background: #EBF3FB; color: #4A90D9; }
                    .status-badge.status-inactive { background: #EEEEEE; color: #757575; }
                    .status-badge.status-normal { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-underweight,
                    .status-badge.status-overweight { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-obese,
                    .status-badge.status-severely-underweight { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-sent { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-failed { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-pending { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-cancelled { background: #EEEEEE; color: #757575; }
                    @media print {
                        body { padding: 20px; }
                        .report-print-header { margin-bottom: 20px; padding-bottom: 15px; }
                        .report-print-header h1 { font-size: 20px; }
                        .report-stats-grid { break-inside: avoid; }
                        .report-table { font-size: 11px; }
                        .report-table th, .report-table td { padding: 4px 8px; }
                    }
                </style>
            </head>
            <body>
                <div class="report-print-header">
                    <div class="barangay-name">Barangay Garsika</div>
                    <h1>${window.currentReportTitle || 'Health Report'}</h1>
                    <div class="report-date">Generated: ${dateStr}</div>
                </div>
                <div class="report-content">${content.innerHTML}</div>
                <div class="report-print-footer">
                    <p>Barangay Garsika · Smart Community Health Monitoring System</p>
                    <p>Generated on ${dateStr}</p>
                </div>
                <script>
                    window.onload = function() { window.print(); };
                <\/script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    // ========================================
    // EXPORT TO PDF - AUTO DOWNLOAD
    // ========================================
    function exportToPDF() {
        const content = document.querySelector('.report-preview-content');
        if (!content) {
            showToast('No report content to export.', 'error');
            return;
        }
        
        showToast('Generating PDF...', 'info');
        
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Build complete HTML for PDF
        const pdfHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${window.currentReportTitle || 'Health Report'}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                        padding: 40px;
                        color: #1A2A3A;
                        line-height: 1.6;
                        max-width: 1100px;
                        margin: 0 auto;
                    }
                    .report-print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #4A90D9;
                        padding-bottom: 20px;
                    }
                    .report-print-header h1 { font-size: 24px; color: #1A2A3A; font-weight: 700; }
                    .report-print-header .barangay-name { font-size: 16px; color: #4A90D9; font-weight: 600; }
                    .report-print-header .report-date { font-size: 12px; color: #5A6C7D; margin-top: 4px; }
                    .report-print-footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #E8EEF4;
                        font-size: 12px;
                        color: #5A6C7D;
                    }
                    .report-content { padding: 10px 0; }
                    .report-content h2 { font-size: 20px; font-weight: 700; color: #1A2A3A; margin-bottom: 4px; }
                    .report-content h3 { font-size: 16px; font-weight: 600; color: #1A2A3A; margin: 20px 0 12px 0; }
                    .report-content hr { border: none; border-top: 2px solid #E8EEF4; margin: 12px 0 20px 0; }
                    .report-stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 12px;
                        margin-bottom: 20px;
                    }
                    .report-stat {
                        background: #F5FAFF;
                        padding: 14px 16px;
                        border-radius: 8px;
                        text-align: center;
                        border: 1px solid #E8EEF4;
                    }
                    .report-stat strong { display: block; font-size: 11px; color: #5A6C7D; text-transform: uppercase; letter-spacing: 0.5px; }
                    .report-stat .stat-number { font-size: 24px; font-weight: 700; color: #1A2A3A; }
                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                        margin: 8px 0 16px 0;
                    }
                    .report-table th {
                        background: #EBF3FB;
                        text-align: left;
                        padding: 8px 12px;
                        font-weight: 600;
                        color: #1A2A3A;
                        border-bottom: 2px solid #90CAF9;
                    }
                    .report-table td {
                        padding: 6px 12px;
                        border-bottom: 1px solid #E8EEF4;
                    }
                    .report-table tr:nth-child(even) td { background: #FAFCFE; }
                    .status-badge {
                        display: inline-block;
                        padding: 2px 12px;
                        border-radius: 50px;
                        font-size: 11px;
                        font-weight: 600;
                    }
                    .status-badge.status-completed { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-upcoming { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-overdue { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-active { background: #EBF3FB; color: #4A90D9; }
                    .status-badge.status-inactive { background: #EEEEEE; color: #757575; }
                    .status-badge.status-normal { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-underweight,
                    .status-badge.status-overweight { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-obese,
                    .status-badge.status-severely-underweight { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-sent { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-failed { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-pending { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-cancelled { background: #EEEEEE; color: #757575; }
                    @media print {
                        body { padding: 20px; }
                        .report-print-header { margin-bottom: 20px; padding-bottom: 15px; }
                        .report-print-header h1 { font-size: 20px; }
                        .report-stats-grid { break-inside: avoid; }
                        .report-table { font-size: 11px; }
                        .report-table th, .report-table td { padding: 4px 8px; }
                    }
                </style>
                <!-- html2pdf library for PDF generation -->
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"><\/script>
            </head>
            <body>
                <div id="report-content-wrapper">
                    <div class="report-print-header">
                        <div class="barangay-name">Barangay Garsika</div>
                        <h1>${window.currentReportTitle || 'Health Report'}</h1>
                        <div class="report-date">Generated: ${dateStr}</div>
                    </div>
                    <div class="report-content">${content.innerHTML}</div>
                    <div class="report-print-footer">
                        <p>Barangay Garsika · Smart Community Health Monitoring System</p>
                        <p>Generated on ${dateStr}</p>
                    </div>
                </div>
                <script>
                    // Auto-download PDF when page loads
                    window.onload = function() {
                        const element = document.getElementById('report-content-wrapper');
                        const opt = {
                            margin:        [10, 10, 10, 10],
                            filename:     '${(window.currentReportTitle || 'report').replace(/\s+/g, '_')}_${now.toISOString().slice(0,10)}.pdf',
                            image:        { type: 'jpeg', quality: 0.98 },
                            html2canvas:  { scale: 2, letterRendering: true, useCORS: true, logging: false },
                            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                        };
                        html2pdf().set(opt).from(element).save().then(function() {
                            window.close();
                        });
                    };
                <\/script>
            </body>
            </html>
        `;
        
        // Open in new window with PDF auto-download
        const pdfWindow = window.open('', '_blank', 'width=800,height=600');
        if (!pdfWindow) {
            showToast('Please allow popups for PDF export.', 'error');
            return;
        }
        
        pdfWindow.document.write(pdfHTML);
        pdfWindow.document.close();
    }

    // Fix close preview button to clear content properly
    if (closePreview) {
        closePreview.addEventListener('click', function() {
            const preview = document.getElementById('reportPreview');
            if (preview) {
                preview.style.display = 'none';
                // Reset content to placeholder
                const content = document.querySelector('.report-preview-content');
                if (content) {
                    content.innerHTML = `
                        <div class="report-placeholder">
                            <i class="fas fa-file-alt"></i>
                            <p>Report content will appear here.</p>
                            <span class="empty-sub">Click a report button above to generate.</span>
                        </div>
                    `;
                }
            }
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
    console.log('📊 Report system initialized successfully!');
});