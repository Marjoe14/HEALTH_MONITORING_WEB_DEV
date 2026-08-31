// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// RESIDENT DASHBOARD - JavaScript (FIXED)
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
    const userName = document.getElementById('userName');

    // Modals
    const editProfileModal = document.getElementById('editProfileModal');
    const cancelAppointmentModal = document.getElementById('cancelAppointmentModal');
    const viewResidentModal = document.getElementById('viewResidentModal');

    // Quick Actions
    const quickActions = document.querySelectorAll('.quick-action');
    const viewAllLinks = document.querySelectorAll('.view-all');

    // Edit Profile
    const editProfileBtn = document.getElementById('editProfileBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const editProfileForm = document.getElementById('editProfileForm');

    // Notifications
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const notificationBadge = document.getElementById('notificationBadge');

    // Record Tabs
    const recordTabs = document.querySelectorAll('.record-tab');
    const recordContents = document.querySelectorAll('.record-content');

    // Appointment Filters
    const appointmentStatusFilter = document.getElementById('appointmentStatusFilter');
    const appointmentDateFilter = document.getElementById('appointmentDateFilter');
    const clearAppointmentFilters = document.getElementById('clearAppointmentFilters');

    // ========================================
    // STATE
    // ========================================
    let currentPage = 'dashboard';

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
        'profile': 'My Profile',
        'health-records': 'Health Records',
        'appointments': 'Appointments',
        'notifications': 'Notifications',
        'settings': 'Settings'
    };
    pageTitle.textContent = pageNames[page] || 'Dashboard';

    currentPage = page;

    // Fetch data when specific pages are opened
    if (page === 'notifications' || page === 'dashboard') {
        fetchNotifications();
    }

    if (page === 'dashboard') {
        fetchDashboardData();
    }

    if (page === 'appointments') {
        fetchResidentAppointments();
    }

    // Fetch health records when health-records page is opened
    if (page === 'health-records') {
        // Use window.fetchHealthRecords (defined in resident-health-records.js)
        if (typeof window.fetchHealthRecords === 'function') {
            setTimeout(function() {
                window.fetchHealthRecords();
            }, 300);
        } else {
            // Wait longer for the other script to load
            console.log('⏳ Waiting for fetchHealthRecords to load...');
            setTimeout(function() {
                if (typeof window.fetchHealthRecords === 'function') {
                    window.fetchHealthRecords();
                } else {
                    console.log('❌ fetchHealthRecords still not available');
                }
            }, 1000);
        }
    }
}

// This navItems.forEach should be OUTSIDE the navigateTo function
navItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.dataset.page;
        navigateTo(page);
    });
});

    // ========================================
    // RECORD TABS
    // ========================================
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

    // ========================================
    // EDIT PROFILE MODAL
    // ========================================
    function openEditProfileModal() {
        openModal(editProfileModal);
    }

    function closeEditProfileModal() {
        closeModal(editProfileModal);
    }

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditProfileModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditProfileModal);
    }

    if (cancelEdit) {
        cancelEdit.addEventListener('click', closeEditProfileModal);
    }

    if (editProfileModal) {
        editProfileModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditProfileModal();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (editProfileModal && editProfileModal.classList.contains('show')) {
                closeEditProfileModal();
            }
            if (cancelAppointmentModal && cancelAppointmentModal.classList.contains('show')) {
                closeModal(cancelAppointmentModal);
            }
            if (viewResidentModal && viewResidentModal.classList.contains('show')) {
                closeModal(viewResidentModal);
            }
        }
    });

    // ========================================
    // EDIT PROFILE FORM (CLIENT-SIDE ONLY)
    // ========================================
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const data = {
                firstName: document.getElementById('editFirstName').value.toUpperCase() || '—',
                middleName: document.getElementById('editMiddleName').value.toUpperCase() || '—',
                lastName: document.getElementById('editLastName').value.toUpperCase() || '—',
                mobile: document.getElementById('editMobile').value || '—',
                email: document.getElementById('editEmail').value || '—',
                purok: document.getElementById('editPurok').value || '—',
                address: document.getElementById('editAddress').value.toUpperCase() || '—',
                household: document.getElementById('editHousehold').value.toUpperCase() || '—'
            };

            const fullName = data.firstName + (data.middleName && data.middleName !== '—' ? ' ' + data.middleName : '') + ' ' + data.lastName;

            document.getElementById('profileFirstName').textContent = data.firstName;
            document.getElementById('profileMiddleName').textContent = data.middleName;
            document.getElementById('profileLastName').textContent = data.lastName;
            document.getElementById('profileMobile').textContent = data.mobile;
            document.getElementById('profileEmail').textContent = data.email;
            document.getElementById('profilePurok').textContent = data.purok;
            document.getElementById('profileAddress').textContent = data.address;
            document.getElementById('profileHousehold').textContent = data.household;

            if (userName) userName.textContent = fullName;

            closeEditProfileModal();
            showToast('Profile updated successfully!', 'success');
        });
    }

    // ========================================
    // NOTIFICATION FUNCTIONS
    // ========================================

    // Fetch notifications
    function fetchNotifications() {
        fetch('ajax/get_notifications.php')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    renderNotifications(data.notifications, data.unread_count);
                } else {
                    console.log('Error fetching notifications:', data.message);
                }
            })
            .catch(function(error) {
                console.log('Fetch error:', error);
            });
    }

    // Render notifications
    function renderNotifications(notifications, unreadCount) {
        const notifList = document.querySelector('.notifications-list');
        const notifBadge = document.getElementById('notificationBadge');
        const unreadNotifCount = document.getElementById('unreadNotifications');
        const markAllBtn = document.getElementById('markAllReadBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');

        // Update badge
        if (notifBadge) {
            notifBadge.textContent = unreadCount > 0 ? unreadCount : '0';
        }

        // Update stats
        if (unreadNotifCount) {
            unreadNotifCount.textContent = unreadCount;
        }

        if (!notifications || notifications.length === 0) {
            if (notifList) {
                notifList.innerHTML = `
                    <div class="notification-empty">
                        <div class="notification-empty-icon">
                            <i class="fas fa-bell-slash"></i>
                        </div>
                        <h4>No Notifications</h4>
                        <p>You don't have any notifications yet.</p>
                        <p class="empty-sub">Notifications will appear here when your BHW sends updates.</p>
                    </div>
                `;
            }
            if (markAllBtn) markAllBtn.disabled = true;
            if (clearAllBtn) clearAllBtn.disabled = true;
            return;
        }

        let html = '';
        notifications.forEach(function(notif) {
            const isRead = notif.is_read == 1;
            const iconMap = {
                'appointment': 'fa-calendar-check',
                'immunization': 'fa-syringe',
                'prenatal': 'fa-baby-carriage',
                'health_advisory': 'fa-heartbeat',
                'general': 'fa-bell'
            };
            const icon = iconMap[notif.type] || 'fa-bell';
            const timeAgo = getTimeAgo(notif.created_at);
            const notifClass = isRead ? 'notification-item read' : 'notification-item unread';

            let linkHtml = '';
            if (notif.link) {
                if (notif.link.includes('#appointments')) {
                    linkHtml = `<button class="notification-link-btn" data-page="appointments">View Details →</button>`;
                } else {
                    linkHtml = `<a href="${notif.link}" class="notification-link">View Details →</a>`;
                }
            }

            html += `
                <div class="${notifClass}" data-id="${notif.id}" data-type="${notif.type}">
                    <div class="notification-icon ${notif.type}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-header">
                            <span class="notification-title">${notif.title}</span>
                            <span class="notification-time">${timeAgo}</span>
                        </div>
                        <p class="notification-message">${notif.message}</p>
                        ${linkHtml}
                    </div>
                    <div class="notification-actions">
                        ${isRead ? 
                            `<button class="notification-mark-unread" data-id="${notif.id}" title="Mark as Unread"><i class="fas fa-undo"></i></button>` :
                            `<button class="notification-mark-read" data-id="${notif.id}" title="Mark as Read"><i class="fas fa-check"></i></button>`
                        }
                    </div>
                </div>
            `;
        });

        if (notifList) {
            notifList.innerHTML = html;
        }

        if (markAllBtn) markAllBtn.disabled = false;
        if (clearAllBtn) clearAllBtn.disabled = false;

        // Mark single notification as read
        document.querySelectorAll('.notification-mark-read').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                markNotificationRead(id);
            });
        });

        // Mark single notification as unread
        document.querySelectorAll('.notification-mark-unread').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                markNotificationUnread(id);
            });
        });

        // Click on notification to mark as read
        document.querySelectorAll('.notification-item').forEach(function(item) {
            item.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                const linkBtn = this.querySelector('.notification-link-btn');
                if (!this.classList.contains('read')) {
                    markNotificationRead(id);
                }
                if (linkBtn) {
                    navigateTo('appointments');
                }
            });
        });

        // Handle notification link buttons
        document.querySelectorAll('.notification-link-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const item = this.closest('.notification-item');
                const id = parseInt(item.dataset.id);
                if (!item.classList.contains('read')) {
                    markNotificationRead(id);
                }
                navigateTo('appointments');
            });
        });

        // Mark all as read
        if (markAllBtn) {
            markAllBtn.addEventListener('click', function() {
                markNotificationRead(null);
            });
        }

        // Clear all (delete all notifications)
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear all notifications?')) {
                    clearAllNotifications();
                }
            });
        }
    }

    // Mark notification as read
    function markNotificationRead(notificationId) {
        const data = notificationId ? { notification_id: notificationId } : {};

        fetch('ajax/mark_notification_read.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data).toString()
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                fetchNotifications();
            }
        })
        .catch(function() { /* silent fail */ });
    }

    // Mark notification as unread
    function markNotificationUnread(notificationId) {
        if (!notificationId) {
            showToast('Invalid notification.', 'error');
            return;
        }

        fetch('ajax/mark_notification_unread.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ notification_id: notificationId }).toString()
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                fetchNotifications();
                showToast('Notification marked as unread.', 'info');
            } else {
                showToast(data.message || 'Failed to mark as unread.', 'error');
            }
        })
        .catch(function() {
            showToast('Error connecting to server.', 'error');
        });
    }

    // Clear all notifications
    function clearAllNotifications() {
        fetch('ajax/clear_notifications.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                fetchNotifications();
            }
        })
        .catch(function() { /* silent fail */ });
    }

    // Get time ago string
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
    // FETCH DASHBOARD DATA
    // ========================================
    function fetchDashboardData() {
        fetch('ajax/get_resident_dashboard_data.php')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    // Update upcoming appointments count
                    const upcomingEl = document.getElementById('upcomingAppointments');
                    if (upcomingEl) {
                        upcomingEl.textContent = data.upcoming_appointments;
                    }

                    // Update unread notifications count
                    const unreadEl = document.getElementById('unreadNotifications');
                    if (unreadEl) {
                        unreadEl.textContent = data.unread_notifications;
                    }

                    // Update notification badge
                    const badge = document.getElementById('notificationBadge');
                    if (badge) {
                        badge.textContent = data.unread_notifications > 0 ? data.unread_notifications : '0';
                    }

                    // Update last BMI
                    const lastBmiEl = document.getElementById('lastBMI');
                    if (lastBmiEl) {
                        lastBmiEl.textContent = data.last_bmi || '—';
                    }

                    // Render upcoming appointments in dashboard
                    renderUpcomingAppointments(data.appointments);
                }
            })
            .catch(function() { /* silent fail */ });
    }

    // ========================================
    // RENDER UPCOMING APPOINTMENTS
    // ========================================
    function renderUpcomingAppointments(appointments) {
        const tbody = document.querySelector('#page-dashboard .appointments-table tbody');
        if (!tbody) return;

        if (!appointments || appointments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-calendar-plus"></i>
                        <span>No upcoming appointments</span>
                        <p class="empty-sub">Visit the Barangay Health Center to schedule an appointment.</p>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        appointments.forEach(function(app) {
            const statusClass = app.status.toLowerCase();
            html += `
                <tr>
                    <td>${app.appointment_date} ${app.appointment_time || ''}</td>
                    <td>${app.type || 'General Check-up'}</td>
                    <td>—</td>
                    <td><span class="status-badge ${statusClass}">${app.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary view-appointment" data-id="${app.id}">
                            View
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        document.querySelectorAll('#page-dashboard .view-appointment').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                viewResidentAppointmentDetail(id);
            });
        });
    }

    // ========================================
    // FETCH RESIDENT APPOINTMENTS
    // ========================================
    function fetchResidentAppointments() {
        const statusFilter = appointmentStatusFilter ? appointmentStatusFilter.value : '';
        const dateFilter = appointmentDateFilter ? appointmentDateFilter.value : '';

        let url = 'ajax/get_resident_appointments.php';
        let params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (dateFilter) params.append('date', dateFilter);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        fetch(url)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    renderResidentAppointments(data.appointments);
                } else {
                    console.log('Error fetching appointments:', data.message);
                    renderResidentAppointments([]);
                }
            })
            .catch(function(error) {
                console.log('Fetch error:', error);
                renderResidentAppointments([]);
            });
    }

    // ========================================
    // APPOINTMENT FILTERS
    // ========================================
    if (appointmentStatusFilter) {
        appointmentStatusFilter.addEventListener('change', function() {
            fetchResidentAppointments();
        });
    }

    if (appointmentDateFilter) {
        appointmentDateFilter.addEventListener('change', function() {
            fetchResidentAppointments();
        });
    }

    if (clearAppointmentFilters) {
        clearAppointmentFilters.addEventListener('click', function() {
            if (appointmentStatusFilter) appointmentStatusFilter.value = '';
            if (appointmentDateFilter) appointmentDateFilter.value = '';
            fetchResidentAppointments();
        });
    }

    // ========================================
    // RENDER RESIDENT APPOINTMENTS
    // ========================================
    function renderResidentAppointments(appointments) {
    const tbody = document.getElementById('residentAppointmentTableBody');
    const resultsCount = document.getElementById('appointmentResults');

    if (!tbody) return;

    if (!appointments || appointments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <span>No appointments found</span>
                    <p class="empty-sub">You don't have any appointments scheduled yet.</p>
                </td>
            </tr>
        `;
        if (resultsCount) resultsCount.textContent = '0 appointments';
        return;
    }

    let html = '';
    appointments.forEach(function(app) {
        const dateTime = app.appointment_date + ' ' + (app.appointment_time || '');
        
        // Check if cancellation is pending
        const isPending = app.cancellation_status === 'pending';
        const isRequested = app.cancellation_requested == 1;

        let statusDisplay = app.status;
        let statusBadgeClass = 'status-badge ' + app.status.toLowerCase();

        // If cancellation is pending, show "Under Review"
        if (isPending && isRequested) {
            statusDisplay = 'Under Review';
            statusBadgeClass = 'status-badge warning';
        }

        // Show cancellation reason if pending
        const reasonDisplay = (isPending && isRequested && app.cancellation_reason) ?
            `<br><small style="color: var(--gray);">Reason: ${app.cancellation_reason}</small>` : '';

        html += `
            <tr>
                <td>${dateTime}</td>
                <td>${app.type || 'General Check-up'}</td>
                <td>${app.location || 'Barangay Health Center'}</td>
                <td><span class="${statusBadgeClass}">${statusDisplay}</span>${reasonDisplay}</td>
                <td>
                    <button class="btn btn-outline btn-sm view-appointment-detail" data-id="${app.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${app.status === 'Upcoming' && !isPending ? 
                        `<button class="btn btn-danger btn-sm cancel-appointment-request" data-id="${app.id}">
                            <i class="fas fa-times"></i> Cancel
                        </button>` : ''
                    }
                    ${isPending ? 
                        `<span class="pending-badge" style="display: inline-block; padding: 4px 12px; background: #FFF3E0; color: #E65100; border-radius: 50px; font-size: 0.7rem; font-weight: 600;">
                            <i class="fas fa-clock"></i> Waiting for BHW
                        </span>` : ''
                    }
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    if (resultsCount) resultsCount.textContent = appointments.length + ' appointments';

    // View appointment detail
    document.querySelectorAll('#residentAppointmentTableBody .view-appointment-detail').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            viewResidentAppointmentDetail(id);
        });
    });

    // Cancel appointment request
    document.querySelectorAll('#residentAppointmentTableBody .cancel-appointment-request').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            openCancelAppointmentModal(id);
        });
    });
}

// ========================================
// VIEW RESIDENT APPOINTMENT DETAIL
// ========================================
function viewResidentAppointmentDetail(appointmentId) {
    fetch('ajax/get_resident_appointment_detail.php?id=' + appointmentId)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                const app = data.appointment;
                const statusClass = app.status.toLowerCase();

                const html = `
                    <div class="resident-detail">
                        <div class="detail-header">
                            <div class="detail-avatar">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="detail-name">
                                <h2>Appointment Details</h2>
                                <span class="detail-type status-badge ${statusClass}">${app.status}</span>
                            </div>
                        </div>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Date</span>
                                <span class="detail-value">${app.appointment_date}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Time</span>
                                <span class="detail-value">${app.appointment_time || '—'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Type</span>
                                <span class="detail-value">${app.type || 'General Check-up'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Location</span>
                                <span class="detail-value">${app.location || 'Barangay Health Center'}</span>
                            </div>
                        </div>
                        ${app.notes ? `
                            <div class="detail-section">
                                <h4><i class="fas fa-sticky-note"></i> Notes</h4>
                                <p class="detail-medical">${app.notes}</p>
                            </div>
                        ` : ''}
                    </div>
                `;

                const content = document.getElementById('residentDetailContent');
                if (content) {
                    content.innerHTML = html;
                }
                
                // Open modal
                const modal = viewResidentModal;
                if (modal) {
                    openModal(modal);
                    
                    // Force close buttons to work
                    setTimeout(function() {
                        const closeBtns = modal.querySelectorAll('.close-modal, .modal-close, .btn-outline');
                        closeBtns.forEach(function(btn) {
                            btn.onclick = function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                closeModal(modal);
                            };
                        });
                        // Overlay click
                        modal.onclick = function(e) {
                            if (e.target === this) {
                                closeModal(this);
                            }
                        };
                    }, 100);
                }
            } else {
                showToast('Appointment not found.', 'error');
            }
        })
        .catch(function() {
            showToast('Error fetching appointment details.', 'error');
        });
}

// ========================================
// ATTACH RESIDENT MODAL CLOSE LISTENERS (FIX)
// ========================================
function attachResidentModalCloseListeners(modal) {
    if (!modal) return;
    
    // Get all close buttons in the modal
    const closeBtns = modal.querySelectorAll('.modal-close, .btn-outline');
    
    closeBtns.forEach(function(btn) {
        // Remove existing listeners to avoid duplicates
        btn.removeEventListener('click', handleResidentModalClose);
        btn.addEventListener('click', handleResidentModalClose);
    });
    
    // Also handle overlay click
    modal.removeEventListener('click', handleResidentOverlayClose);
    modal.addEventListener('click', handleResidentOverlayClose);
}

function handleResidentModalClose(e) {
    const modal = this.closest('.modal-overlay');
    if (modal) {
        closeModal(modal);
    }
}

function handleResidentOverlayClose(e) {
    if (e.target === this) {
        closeModal(this);
    }
}
    // ========================================
    // OPEN CANCEL APPOINTMENT MODAL
    // ========================================
    function openCancelAppointmentModal(appointmentId) {
        // Fetch appointment details
        fetch('ajax/get_resident_appointment_detail.php?id=' + appointmentId)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    const app = data.appointment;
                    const modal = document.getElementById('cancelAppointmentModal');
                    const detailsDiv = document.getElementById('cancelAppointmentDetails');
                    const cancelIdInput = document.getElementById('cancelAppointmentId');

                    if (cancelIdInput) {
                        cancelIdInput.value = app.id;
                    }

                    if (detailsDiv) {
                        detailsDiv.innerHTML = `
                            <div class="cancel-appointment-info">
                                <div class="info-row">
                                    <span class="info-label">Date:</span>
                                    <span class="info-value">${app.appointment_date}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Time:</span>
                                    <span class="info-value">${app.appointment_time || '—'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Type:</span>
                                    <span class="info-value">${app.type || 'General Check-up'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Location:</span>
                                    <span class="info-value">${app.location || 'Barangay Health Center'}</span>
                                </div>
                            </div>
                        `;
                    }

                    openModal(modal);

                    // Reset form
                    const form = document.getElementById('cancelAppointmentForm');
                    if (form) {
                        form.reset();
                        const reasonSelect = document.getElementById('cancellationReason');
                        if (reasonSelect) reasonSelect.value = '';
                    }
                } else {
                    showToast('Error fetching appointment details.', 'error');
                }
            })
            .catch(function() {
                showToast('Error fetching appointment details.', 'error');
            });
    }

    // ========================================
    // SUBMIT CANCELLATION REQUEST
    // ========================================
    const cancelAppointmentForm = document.getElementById('cancelAppointmentForm');
    if (cancelAppointmentForm) {
        cancelAppointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const appointmentId = document.getElementById('cancelAppointmentId') ? document.getElementById('cancelAppointmentId').value : '';
            const reason = document.getElementById('cancellationReason') ? document.getElementById('cancellationReason').value : '';
            const details = document.getElementById('cancellationReasonDetails') ? document.getElementById('cancellationReasonDetails').value : '';

            if (!reason) {
                showToast('Please select a reason for cancellation.', 'error');
                return;
            }

            if (!confirm('Are you sure you want to request cancellation for this appointment?\n\nYour BHW will review your request.')) {
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            fetch('ajax/request_cancellation.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    appointment_id: appointmentId,
                    reason: reason,
                    details: details || ''
                }).toString()
            })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    showToast('Cancellation request submitted! Please wait for BHW approval.', 'success');
                    closeModal(document.getElementById('cancelAppointmentModal'));
                    fetchResidentAppointments();
                } else {
                    showToast(data.message || 'Failed to submit cancellation request.', 'error');
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Cancellation Request';
                }
            })
            .catch(function() {
                showToast('Error connecting to server.', 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Cancellation Request';
                }
            });
        });
    }

    // Close cancel modal
    document.querySelectorAll('.close-cancel-modal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            closeModal(document.getElementById('cancelAppointmentModal'));
        });
    });

    // ========================================
    // TOAST NOTIFICATION
    // ========================================
    function showToast(message, type) {
        // Remove existing toasts
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

    // ========================================
    // USER AVATAR CLICK
    // ========================================
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            navigateTo('profile');
        });
    }

    // ========================================
    // UPDATE NOTIFICATION BADGE EVERY 30 SECONDS
    // ========================================
    setInterval(function() {
        if (currentPage === 'notifications' || currentPage === 'dashboard') {
            fetchNotifications();
        }
    }, 30000);

    // ========================================
    // INIT
    // ========================================
    navigateTo('dashboard');

    // Fetch dashboard data on load
    setTimeout(function() {
        fetchDashboardData();
    }, 500);

    console.log('🏠 Smart Community Health Monitoring System · Resident Dashboard');
    console.log('📋 All data is empty (no records found)');
    console.log('📱 Fully responsive resident portal');
    console.log('💚 Color scheme: Light Green · Soft Blue · White');

}); // ← CLOSES THE DOMContentLoaded EVENT LISTENER