// ========================================
// BHW SMS - SMS Notifications
// ========================================

// ========================================
// POPULATE SMS RESIDENTS DROPDOWN
// ========================================
function populateSmsResidents() {
    const select = document.getElementById('smsSpecificResident');
    if (!select) return;
    select.innerHTML = '<option value="">Select a resident...</option>';
    residents.forEach(function(r) {
        const option = document.createElement('option');
        option.value = r.id;
        const contact = r.isMinor ? (r.parentContact || r.mobile) : r.mobile;
        option.textContent = r.fullName + ' (' + (r.age_display || r.age) + ', ' + r.purok + ')' + (contact !== '—' ? ' 📱' + contact : '');
        select.appendChild(option);
    });
}

// ========================================
// UPDATE CHARACTER COUNT
// ========================================
function updateCharCount() {
    if (!smsMessage || !charCount) return;
    const len = smsMessage.value.length;
    charCount.textContent = len + ' / 160';
    charCount.className = 'char-count';
    if (len > 140) charCount.classList.add('warning');
    if (len > 160) charCount.classList.add('danger');
}

// ========================================
// SEND SMS
// ========================================
function initSendSmsButton() {
    if (!sendSmsBtn) return;

    sendSmsBtn.addEventListener('click', function() {
        const recipient = smsRecipient ? smsRecipient.value : '';
        const message = smsMessage ? smsMessage.value.trim() : '';

        if (!message) {
            showToast('Please enter a message.', 'error');
            return;
        }

        if (residents.length === 0) {
            showToast('No residents to send SMS to. Please add residents first.', 'error');
            return;
        }

        let recipientLabel = '';
        let recipientIds = [];

        if (recipient === 'all') {
            recipientLabel = 'All Residents';
            recipientIds = residents.map(function(r) { return r.id; });
        } else if (recipient === 'pregnant') {
            recipientLabel = 'Pregnant Women';
            const pregnant = prenatalRecords.filter(function(r) { return r.status === 'Active'; });
            recipientIds = pregnant.map(function(r) { return r.residentId; });
        } else if (recipient === 'immunization') {
            recipientLabel = 'Immunization Due';
            const due = immunizationRecords.filter(function(r) { return r.status === 'Upcoming' || r.status === 'Overdue'; });
            recipientIds = due.map(function(r) { return r.residentId; });
        } else if (recipient === 'specific') {
            const select = document.getElementById('smsSpecificResident');
            const id = parseInt(select.value);
            const name = select ? select.options[select.selectedIndex]?.text || 'Unknown' : 'Unknown';
            recipientLabel = name;
            recipientIds = [id];
        }

        if (recipientIds.length === 0) {
            showToast('No recipients found for this group.', 'error');
            return;
        }

        const smsData = {
            recipient_ids: recipientIds.join(','),
            message: message,
            recipient_label: recipientLabel
        };

        const sendBtn = this;
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        fetch('ajax/send_sms.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(smsData).toString()
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast('SMS sent successfully!', 'success');
                if (smsMessage) smsMessage.value = '';
                updateCharCount();
                fetchAllRecords();
            } else {
                showToast(data.message || 'SMS sending failed.', 'error');
            }
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send SMS';
        })
        .catch(function() {
            showToast('Error connecting to server.', 'error');
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send SMS';
        });
    });
}

// ========================================
// RENDER SMS HISTORY
// ========================================
function renderSmsHistory() {
    const tbody = document.getElementById('smsHistoryBody');
    if (!tbody) return;

    if (smsHistory.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <i class="fas fa-sms"></i>
                    <span>No SMS history</span>
                    <p class="empty-sub">Sent SMS notifications will appear here.</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = smsHistory.map(function(s) {
            return `
                <tr>
                    <td>${s.date}</td>
                    <td>${s.recipient}</td>
                    <td>${s.message.length > 50 ? s.message.substring(0, 50) + '...' : s.message}</td>
                    <td><span class="status-badge completed">${s.status}</span></td>
                </tr>
            `;
        }).join('');
    }
}

// ========================================
// INIT SMS EVENT LISTENERS
// ========================================
function initSmsEventListeners() {
    if (smsRecipient) {
        smsRecipient.addEventListener('change', function() {
            const specificGroup = document.getElementById('specificResidentGroup');
            if (this.value === 'specific') {
                specificGroup.style.display = 'block';
            } else {
                specificGroup.style.display = 'none';
            }
        });
    }

    if (smsTemplate) {
        smsTemplate.addEventListener('change', function() {
            const templates = {
                'appointment': 'Reminder: You have an appointment at the Barangay Health Center on [DATE]. Please come on time.',
                'immunization': 'Reminder: Your child is due for immunization on [DATE]. Please visit the Barangay Health Center.',
                'prenatal': 'Reminder: Your prenatal check-up is scheduled on [DATE]. Please visit the Barangay Health Center.',
                'health_advisory': 'Health Advisory: [MESSAGE]. Stay safe and healthy!'
            };
            if (this.value && templates[this.value]) {
                smsMessage.value = templates[this.value];
                updateCharCount();
            }
        });
    }

    if (smsMessage) {
        smsMessage.addEventListener('input', updateCharCount);
    }
}