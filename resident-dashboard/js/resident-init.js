// ========================================
// RESIDENT INIT - Bootstrap, dashboard data, timing fix
// ========================================

// ========================================
// FETCH DASHBOARD DATA
// ========================================
function fetchDashboardData() {
    fetch('ajax/get_resident_dashboard_data.php')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                const upcomingEl = document.getElementById('upcomingAppointments');
                if (upcomingEl) {
                    upcomingEl.textContent = data.upcoming_appointments;
                }

                const unreadEl = document.getElementById('unreadNotifications');
                if (unreadEl) {
                    unreadEl.textContent = data.unread_notifications;
                }

                const badge = document.getElementById('notificationBadge');
                if (badge) {
                    badge.textContent = data.unread_notifications > 0 ? data.unread_notifications : '0';
                }

                const lastBmiEl = document.getElementById('lastBMI');
                if (lastBmiEl) {
                    lastBmiEl.textContent = data.last_bmi || '—';
                }

                renderUpcomingAppointments(data.appointments);
            }
        })
        .catch(function() { /* silent fail */ });
}

// ========================================
// RENDER UPCOMING APPOINTMENTS (Dashboard)
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
// FETCH ALL RESIDENT DATA - THEN RE-RENDER
// Fixes: "need to refresh to see records"
// ========================================
function fetchResidentDataAndRefresh() {
    Promise.all([
        fetch('ajax/get_notifications.php').then(function(r) { return r.json(); }),
        fetch('ajax/get_resident_dashboard_data.php').then(function(r) { return r.json(); })
    ])
    .then(function(results) {
        if (results[0].success) {
            renderNotifications(results[0].notifications, results[0].unread_count);
        }

        if (results[1].success) {
            const data = results[1];

            const upcomingEl = document.getElementById('upcomingAppointments');
            if (upcomingEl) upcomingEl.textContent = data.upcoming_appointments;

            const unreadEl = document.getElementById('unreadNotifications');
            if (unreadEl) unreadEl.textContent = data.unread_notifications;

            const badge = document.getElementById('notificationBadge');
            if (badge) badge.textContent = data.unread_notifications > 0 ? data.unread_notifications : '0';

            const lastBmiEl = document.getElementById('lastBMI');
            if (lastBmiEl) lastBmiEl.textContent = data.last_bmi || '—';

            renderUpcomingAppointments(data.appointments);
        }

        // Re-render current page
        if (currentPage === 'notifications') {
            fetchNotifications();
        }
        if (currentPage === 'appointments') {
            fetchResidentAppointments();
        }
    })
    .catch(function() { /* silent fail */ });
}

// ========================================
// MAIN INIT
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Initializing Resident Dashboard...');

    initNavigationEventListeners();
    initRecordTabs();
    initProfileModal();
    initEditProfileForm();
    initUppercaseInputs();
    initAppointmentEventListeners();

    // Start on dashboard
    navigateTo('dashboard');

    // Fetch all data + re-render (no refresh needed)
    fetchResidentDataAndRefresh();

    // Auto-refresh notification badge every 30 seconds
    setInterval(function() {
        if (currentPage === 'notifications' || currentPage === 'dashboard') {
            fetchNotifications();
        }
    }, 30000);

    console.log('🏠 Smart Community Health Monitoring System · Resident Dashboard');
    console.log('✅ Timing fix applied — no refresh needed');
});