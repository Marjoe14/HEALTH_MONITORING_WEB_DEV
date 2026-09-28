// ========================================
// BHW NOTIFICATIONS - Notification System
// ========================================

// ========================================
// FETCH BHW NOTIFICATIONS
// ========================================
function fetchBhwNotifications() {
    console.log('🔔 Fetching BHW notifications...');

    fetch('ajax/get_bhw_notifications.php')
        .then(function(response) {
            console.log('📡 Response status:', response.status);
            return response.json();
        })
        .then(function(data) {
            console.log('📦 Notifications data:', data);
            if (data.success) {
                renderBhwNotifications(data.notifications, data.unread_count);
                updateBhwNotificationBadge(data.unread_count);
            } else {
                console.log('❌ Error fetching notifications:', data.message);
            }
        })
        .catch(function(error) {
            console.log('❌ Fetch error:', error);
        });
}

// ========================================
// UPDATE NOTIFICATION BADGE
// ========================================
function updateBhwNotificationBadge(count) {
    const badge = document.getElementById('bhwNotificationBadge');
    if (badge) {
        badge.textContent = count > 0 ? count : '0';
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
}

// ========================================
// RENDER BHW NOTIFICATIONS
// ========================================
function renderBhwNotifications(notifications, unreadCount) {
    const notifList = document.getElementById('bhwNotificationsList');
    if (!notifList) return;

    if (notifications.length === 0) {
        notifList.innerHTML = `
            <div class="notification-empty" style="text-align: center; padding: 40px 20px; background: var(--white); border-radius: var(--radius-sm); border: 1px solid #E8EEF4;">
                <div style="font-size: 3rem; color: var(--gray-lighter); margin-bottom: 16px;">
                    <i class="fas fa-bell-slash"></i>
                </div>
                <h4 style="color: var(--dark); font-size: 1.1rem; margin-bottom: 4px;">No Notifications</h4>
                <p style="color: var(--gray); font-size: 0.9rem;">You don't have any notifications yet.</p>
                <p style="color: var(--gray-light); font-size: 0.8rem; margin-top: 4px;">Notifications will appear here when residents request actions.</p>
            </div>
        `;
        return;
    }

    let html = '';
    notifications.forEach(function(notif) {
        const isRead = notif.is_read == 1;
        const iconMap = {
            'cancellation': 'fa-clock',
            'approved': 'fa-check-circle',
            'rejected': 'fa-times-circle',
            'general': 'fa-bell'
        };
        const icon = iconMap[notif.type] || 'fa-bell';
        const timeAgo = getTimeAgo(notif.created_at);
        const notifClass = isRead ? 'notification-item read' : 'notification-item unread';

        let linkHtml = '';
        if (notif.link) {
            linkHtml = `<button class="notification-link-btn" data-link="${notif.link}">View Details →</button>`;
        }

        html += `
            <div class="${notifClass}" data-id="${notif.id}" data-type="${notif.type}" data-link="${notif.link || ''}">
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

    notifList.innerHTML = html;

    document.querySelectorAll('#bhwNotificationsList .notification-mark-read').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id);
            markBhwNotificationRead(id);
        });
    });

    document.querySelectorAll('#bhwNotificationsList .notification-mark-unread').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id);
            markBhwNotificationUnread(id);
        });
    });

    document.querySelectorAll('#bhwNotificationsList .notification-item').forEach(function(item) {
        item.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            const link = this.dataset.link;

            if (!this.classList.contains('read')) {
                markBhwNotificationRead(id);
            }

            if (link) {
                navigateTo('appointments');
            }
        });
    });

    document.querySelectorAll('#bhwNotificationsList .notification-link-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.notification-item');
            const id = parseInt(item.dataset.id);

            if (!item.classList.contains('read')) {
                markBhwNotificationRead(id);
            }

            navigateTo('appointments');
        });
    });
}

// ========================================
// MARK NOTIFICATION AS READ
// ========================================
function markBhwNotificationRead(notificationId) {
    const data = notificationId ? { notification_id: notificationId } : {};

    fetch('ajax/mark_bhw_notification_read.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            fetchBhwNotifications();
        }
    })
    .catch(function() { /* silent fail */ });
}

// ========================================
// MARK NOTIFICATION AS UNREAD
// ========================================
function markBhwNotificationUnread(notificationId) {
    if (!notificationId) return;

    fetch('ajax/mark_bhw_notification_unread.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ notification_id: notificationId }).toString()
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            fetchBhwNotifications();
        }
    })
    .catch(function() { /* silent fail */ });
}

// ========================================
// CLEAR ALL NOTIFICATIONS
// ========================================
function clearBhwNotifications() {
    fetch('ajax/clear_bhw_notifications.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            fetchBhwNotifications();
        }
    })
    .catch(function() { /* silent fail */ });
}

// ========================================
// INIT NOTIFICATION BUTTONS
// ========================================
function initNotificationButtons() {
    const markAllBtn = document.getElementById('bhwMarkAllReadBtn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', function() {
            markBhwNotificationRead(null);
        });
    }

    const clearAllBtn = document.getElementById('bhwClearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all notifications?')) {
                clearBhwNotifications();
            }
        });
    }
}