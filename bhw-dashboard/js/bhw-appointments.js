// ========================================
// BHW APPOINTMENTS - Appointments & Cancellations
// ========================================

// ========================================
// RENDER APPOINTMENTS
// ========================================
function renderAppointments() {
    console.log('📋 Rendering appointments...', appointments);

    const tbody = document.getElementById('appointmentTableBody');
    const resultsCount = document.getElementById('appointmentResults');
    const dateFilter = document.getElementById('appointmentDateFilter') ? document.getElementById('appointmentDateFilter').value : '';
    const statusFilter = document.getElementById('appointmentStatusFilter') ? document.getElementById('appointmentStatusFilter').value : '';

    if (!tbody) return;

    let filtered = [...appointments];

    if (dateFilter) {
        filtered = filtered.filter(function(r) {
            return r.date === dateFilter;
        });
    }

    if (statusFilter) {
        filtered = filtered.filter(function(r) {
            return r.status === statusFilter;
        });
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <span>No appointments scheduled</span>
                    <p class="empty-sub">Schedule appointments to organize your health visits.</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = filtered.map(function(r) {
            var dateDisplay = r.date && r.date !== '—' ? r.date : '—';
            var timeDisplay = r.time && r.time !== '—' ? r.time : '—';

            var hasPendingCancellation = r.cancellation_requested === true && r.cancellation_status === 'pending';

            var statusDisplay = r.status || 'Upcoming';
            var statusBadgeClass = statusDisplay.toLowerCase();

            if (hasPendingCancellation) {
                statusDisplay = 'Under Review';
                statusBadgeClass = 'warning';
            }

            var cancellationReasonDisplay = '';
            if (hasPendingCancellation && r.cancellation_reason) {
                cancellationReasonDisplay = '<br><small style="color: var(--gray);">Reason: ' + r.cancellation_reason + '</small>';
            }

            var actionsHtml = '';
            if (hasPendingCancellation) {
                actionsHtml = `
                    <button class="btn btn-warning btn-sm review-cancellation-btn" data-id="${r.id}" style="background: #FF9800; color: white; border-color: #FF9800;">
                        <i class="fas fa-clipboard-check"></i> Review
                    </button>
                `;
            } else {
                actionsHtml = `
                    <button class="btn btn-outline btn-sm edit-appointment" data-id="${r.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${r.status !== 'Completed' && r.status !== 'Cancelled' ?
                        `<button class="btn btn-success btn-sm complete-appointment" data-id="${r.id}">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                    <button class="btn btn-danger btn-sm delete-appointment" data-id="${r.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
            }

            return `
                <tr>
                    <td>${dateDisplay} ${timeDisplay}</td>
                    <td><strong>${r.residentName || 'Unknown'}</strong></td>
                    <td>${r.type || 'General Check-up'}</td>
                    <td>${r.location || 'Barangay Health Center'}</td>
                    <td><span class="status-badge ${statusBadgeClass}">${statusDisplay}</span>${cancellationReasonDisplay}</td>
                    <td>
                        <button class="btn btn-outline btn-sm view-appointment" data-id="${r.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                    <td>${actionsHtml}</td>
                </tr>
            `;
        }).join('');
    }

    if (resultsCount) {
        resultsCount.textContent = filtered.length + ' appointments';
    }

    document.querySelectorAll('.view-appointment').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(this.dataset.id);
            viewAppointment(id);
        });
    });

    document.querySelectorAll('.review-cancellation-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(this.dataset.id);
            openReviewCancellationModal(id);
        });
    });

    document.querySelectorAll('.edit-appointment').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(this.dataset.id);
            editAppointment(id);
        });
    });

    document.querySelectorAll('.complete-appointment').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(this.dataset.id);
            completeAppointment(id);
        });
    });

    document.querySelectorAll('.delete-appointment').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(this.dataset.id);
            deleteAppointment(id);
        });
    });
}

// ========================================
// VIEW APPOINTMENT
// ========================================
function viewAppointment(recordId) {
    const record = appointments.find(function(r) { return r.id === recordId; });
    if (!record) {
        showToast('Appointment not found.', 'error');
        return;
    }

    const statusClass = record.status.toLowerCase();
    const html = `
        <div class="resident-detail">
            <div class="detail-header">
                <div class="detail-avatar">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="detail-name">
                    <span class="detail-type status-badge ${statusClass}">${record.status}</span>
                </div>
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Resident</span>
                    <span class="detail-value"><strong>${record.residentName}</strong></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">${record.date}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Time</span>
                    <span class="detail-value">${record.time}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Type</span>
                    <span class="detail-value">${record.type}</span>
                </div>
            </div>
            ${record.notes ? `
                <div class="detail-section">
                    <h4><i class="fas fa-sticky-note"></i> Notes</h4>
                    <p class="detail-medical">${record.notes}</p>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('residentDetailContent').innerHTML = html;
    openModal(viewResidentModal);
}

// ========================================
// COMPLETE APPOINTMENT
// ========================================
function completeAppointment(recordId) {
    if (!confirm('⚠️ Mark this appointment as Completed?')) {
        return;
    }

    fetch('ajax/complete_appointment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + recordId
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            showToast('Appointment marked as completed!', 'success');
            fetchAllRecords();
        } else {
            showToast(data.message || 'Failed to complete appointment.', 'error');
        }
    })
    .catch(function() {
        showToast('Error connecting to server.', 'error');
    });
}

// ========================================
// DELETE APPOINTMENT
// ========================================
function deleteAppointment(recordId) {
    if (!confirm('⚠️ Are you sure you want to delete this appointment?\n\nThis action cannot be undone.')) {
        return;
    }

    fetch('ajax/delete_appointment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + recordId
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            showToast('Appointment deleted successfully!', 'success');
            fetchAllRecords();
        } else {
            showToast(data.message || 'Delete failed.', 'error');
        }
    })
    .catch(function() {
        showToast('Error connecting to server.', 'error');
    });
}

// ========================================
// EDIT APPOINTMENT
// ========================================
function editAppointment(recordId) {
    const record = appointments.find(function(r) { return r.id === recordId; });
    if (!record) {
        showToast('Appointment not found.', 'error');
        return;
    }

    document.getElementById('editAppointmentId').value = record.id;
    document.getElementById('editAppointmentResident').value = record.residentId || '';
    document.getElementById('editAppointmentDate').value = record.date || '';
    document.getElementById('editAppointmentTime').value = record.time || '';
    document.getElementById('editAppointmentType').value = record.type || '';
    document.getElementById('editAppointmentLocation').value = record.location || 'Barangay Health Center';
    document.getElementById('editAppointmentStatus').value = record.status || 'Upcoming';
    document.getElementById('editAppointmentNotes').value = record.notes || '';

    populateEditAppointmentResidents(record.residentId);

    openModal(editAppointmentModal);
}

// ========================================
// POPULATE EDIT APPOINTMENT RESIDENTS
// ========================================
function populateEditAppointmentResidents(selectedId) {
    const select = document.getElementById('editAppointmentResident');
    if (!select) return;
    select.innerHTML = '<option value="">Select resident...</option>';

    if (residents.length === 0) {
        select.innerHTML = '<option value="">No residents available</option>';
    } else {
        residents.forEach(function(r) {
            const option = document.createElement('option');
            option.value = r.id;
            if (selectedId && selectedId == r.id) {
                option.selected = true;
            }
            const ageDisplay = r.age_display || r.age || 'Unknown age';
            const contact = r.isMinor ? (r.parentContact || r.mobile) : r.mobile;
            option.textContent = r.fullName + ' (' + ageDisplay + ', ' + r.purok + ')' + (contact !== '—' ? ' 📱' + contact : '');
            select.appendChild(option);
        });
    }
}

// ========================================
// ADD APPOINTMENT BUTTON
// ========================================
function initAddAppointmentButton() {
    if (!addAppointmentBtn) return;

    addAppointmentBtn.addEventListener('click', function() {
        populateAppointmentResidents();
        addAppointmentForm.reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').value = today;
        const statusInput = document.getElementById('appointmentStatus');
        if (statusInput) statusInput.value = 'Upcoming';
        const submitBtn = addAppointmentForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Schedule Appointment';
        submitBtn.disabled = false;
        openModal(addAppointmentModal);
    });
}

// ========================================
// POPULATE APPOINTMENT RESIDENTS
// ========================================
function populateAppointmentResidents() {
    const select = document.getElementById('appointmentResident');
    if (!select) return;
    select.innerHTML = '<option value="">Select resident...</option>';

    if (residents.length === 0) {
        select.innerHTML = '<option value="">No residents available</option>';
        showToast('Please add residents first before scheduling appointments.', 'info');
    } else {
        residents.forEach(function(r) {
            const option = document.createElement('option');
            option.value = r.id;
            const ageDisplay = r.age_display || r.age || 'Unknown age';
            const contact = r.isMinor ? (r.parentContact || r.mobile) : r.mobile;
            option.textContent = r.fullName + ' (' + ageDisplay + ', ' + r.purok + ')' + (contact !== '—' ? ' 📱' + contact : '');
            select.appendChild(option);
        });
    }
}

// ========================================
// ADD APPOINTMENT FORM SUBMIT
// ========================================
function initAddAppointmentForm() {
    if (!addAppointmentForm) return;

    addAppointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const residentId = parseInt(document.getElementById('appointmentResident').value);
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        const type = document.getElementById('appointmentType').value;
        const status = 'Upcoming';
        const notes = document.getElementById('appointmentNotes').value;

        if (!residentId || !date || !time || !type) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const resident = residents.find(function(r) { return r.id === residentId; });
        const residentName = resident ? resident.fullName : 'Unknown';

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const appData = {
            resident_id: residentId,
            date: date,
            time: time,
            type: type,
            status: status,
            notes: notes || ''
        };

        fetch('ajax/add_appointment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(appData).toString()
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast('Appointment scheduled for ' + residentName + '!', 'success');
                closeModal(addAppointmentModal);
                addAppointmentForm.reset();
                submitBtn.textContent = 'Schedule Appointment';
                submitBtn.disabled = false;

                fetchAllRecords();

                setTimeout(function() {
                    navigateTo('notifications');
                    fetchBhwNotifications();
                }, 500);
            } else {
                showToast(data.message || 'Failed to schedule appointment.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Schedule Appointment';
            }
        })
        .catch(function() {
            showToast('Error connecting to server.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Schedule Appointment';
        });
    });
}

// ========================================
// EDIT APPOINTMENT FORM SUBMIT
// ========================================
function initEditAppointmentForm() {
    if (!editAppointmentForm) return;

    editAppointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const id = document.getElementById('editAppointmentId').value;
        const residentId = parseInt(document.getElementById('editAppointmentResident').value);
        const date = document.getElementById('editAppointmentDate').value;
        const time = document.getElementById('editAppointmentTime').value;
        const type = document.getElementById('editAppointmentType').value;
        const location = document.getElementById('editAppointmentLocation').value;
        const status = document.getElementById('editAppointmentStatus').value;
        const notes = document.getElementById('editAppointmentNotes').value;

        if (!residentId || !date || !time || !type) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';

        const data = new URLSearchParams({
            id: id,
            resident_id: residentId,
            date: date,
            time: time,
            type: type,
            location: location || 'Barangay Health Center',
            status: status,
            notes: notes || ''
        }).toString();

        fetch('ajax/update_appointment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast('Appointment updated successfully!', 'success');
                closeModal(editAppointmentModal);
                fetchAllRecords();
            } else {
                showToast(data.message || 'Update failed.', 'error');
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Appointment';
        })
        .catch(function() {
            showToast('Error connecting to server.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Appointment';
        });
    });
}

// ========================================
// FETCH PENDING CANCELLATIONS
// ========================================
function fetchPendingCancellations() {
    fetch('ajax/get_pending_cancellations.php')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                renderPendingCancellations(data.requests);
            }
        })
        .catch(function() { /* silent fail */ });
}

// ========================================
// RENDER PENDING CANCELLATIONS
// ========================================
function renderPendingCancellations(requests) {
    const tbody = document.getElementById('pendingCancellationsBody');
    const countBadge = document.getElementById('pendingCancellationCount');

    if (!tbody) return;

    if (requests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <span>No pending cancellation requests</span>
                </td>
            </tr>
        `;
        if (countBadge) countBadge.textContent = '0';
        return;
    }

    if (countBadge) countBadge.textContent = requests.length;

    let html = '';
    requests.forEach(function(req) {
        html += `
            <tr>
                <td><strong>${req.resident_name}</strong></td>
                <td>${req.appointment_date} ${req.appointment_time}</td>
                <td>
                    <span class="cancellation-reason">${req.cancellation_reason}</span>
                    ${req.cancellation_notes ? `<br><small>${req.cancellation_notes}</small>` : ''}
                </td>
                <td>${getTimeAgo(req.cancellation_requested_at)}</td>
                <td>
                    <button class="btn btn-primary btn-sm review-cancellation" data-id="${req.id}">
                        <i class="fas fa-clipboard-check"></i> Review
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    document.querySelectorAll('.review-cancellation').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            openReviewCancellationModal(id);
        });
    });
}

// ========================================
// OPEN REVIEW CANCELLATION MODAL
// ========================================
function openReviewCancellationModal(appointmentId) {
    console.log('🔍 Opening review modal for appointment ID:', appointmentId);

    fetch('ajax/get_cancellation_request.php?id=' + appointmentId)
        .then(function(response) {
            console.log('📡 Response status:', response.status);
            return response.json();
        })
        .then(function(data) {
            console.log('📦 Cancellation data:', data);
            if (data.success) {
                const req = data.request;
                const detailsDiv = document.getElementById('reviewCancellationDetails');
                const appointmentIdInput = document.getElementById('reviewAppointmentId');

                if (appointmentIdInput) {
                    appointmentIdInput.value = req.id;
                }

                if (detailsDiv) {
                    detailsDiv.innerHTML = `
                        <div class="review-cancellation-info">
                            <div class="info-row" style="display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <span class="info-label" style="font-weight: 600; color: var(--gray); width: 130px;">Resident:</span>
                                <span class="info-value"><strong>${req.resident_name}</strong></span>
                            </div>
                            <div class="info-row" style="display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <span class="info-label" style="font-weight: 600; color: var(--gray); width: 130px;">Appointment:</span>
                                <span class="info-value">${req.appointment_date} ${req.appointment_time || ''}</span>
                            </div>
                            <div class="info-row" style="display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <span class="info-label" style="font-weight: 600; color: var(--gray); width: 130px;">Type:</span>
                                <span class="info-value">${req.type || 'General Check-up'}</span>
                            </div>
                            <div class="info-row" style="display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <span class="info-label" style="font-weight: 600; color: var(--gray); width: 130px;">Location:</span>
                                <span class="info-value">${req.location || 'Barangay Health Center'}</span>
                            </div>
                            <div class="info-row" style="display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                <span class="info-label" style="font-weight: 600; color: var(--gray); width: 130px;">Cancellation Reason:</span>
                                <span class="info-value" style="color: #E65100; font-weight: 600;">${req.cancellation_reason}</span>
                            </div>
                            ${req.cancellation_notes ? `
                                <div class="info-row" style="display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                                    <span class="info-label" style="font-weight: 600; color: var(--gray); width: 130px;">Additional Details:</span>
                                    <span class="info-value">${req.cancellation_notes}</span>
                                </div>
                            ` : ''}
                            <div class="info-row" style="display: flex; padding: 8px 0;">
                                <span class="info-label" style="font-weight: 600; color: var(--gray); width: 130px;">Requested:</span>
                                <span class="info-value">${getTimeAgo(req.cancellation_requested_at)}</span>
                            </div>
                        </div>
                    `;
                }

                document.getElementById('bhwCancellationNotes').value = '';

                openModal(document.getElementById('reviewCancellationModal'));

            } else {
                showToast('Failed to load cancellation request.', 'error');
            }
        })
        .catch(function(error) {
            console.log('❌ Fetch error:', error);
            showToast('Error connecting to server.', 'error');
        });
}

// ========================================
// REVIEW CANCELLATION DECISION HANDLERS
// ========================================
function initCancellationDecisionButtons() {
    document.querySelectorAll('.btn-decision').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const decision = this.dataset.decision;
            const appointmentId = document.getElementById('reviewAppointmentId').value;
            const notes = document.getElementById('bhwCancellationNotes').value;

            if (!appointmentId) {
                showToast('Invalid appointment.', 'error');
                return;
            }

            const confirmMessage = decision === 'approve' ?
                `⚠️ ARE YOU SURE?\n\nYou are about to APPROVE this cancellation request.\n\nThis will CANCEL the appointment and the resident will be notified.\n\n${notes ? 'Notes: ' + notes : ''}\n\nClick OK to confirm.` :
                `⚠️ ARE YOU SURE?\n\nYou are about to REJECT this cancellation request.\n\nThe appointment will remain SCHEDULED and the resident will be notified.\n\n${notes ? 'Notes: ' + notes : ''}\n\nClick OK to confirm.`;

            if (!confirm(confirmMessage)) {
                return;
            }

            const submitBtn = this;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            fetch('ajax/process_cancellation.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    appointment_id: appointmentId,
                    decision: decision,
                    notes: notes || ''
                }).toString()
            })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    showToast(data.message || 'Cancellation ' + (decision === 'approve' ? 'approved' : 'rejected') + ' successfully!', 'success');
                    closeModal(document.getElementById('reviewCancellationModal'));
                    fetchPendingCancellations();
                    fetchAllRecords();
                } else {
                    showToast(data.message || 'Failed to process request.', 'error');
                }
                submitBtn.disabled = false;
                submitBtn.innerHTML = decision === 'approve' ?
                    '<i class="fas fa-check"></i> Approve Cancellation' :
                    '<i class="fas fa-times"></i> Reject Cancellation';
            })
            .catch(function() {
                showToast('Error connecting to server.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = decision === 'approve' ?
                    '<i class="fas fa-check"></i> Approve Cancellation' :
                    '<i class="fas fa-times"></i> Reject Cancellation';
            });
        });
    });
}

// ========================================
// INIT APPOINTMENT FILTER EVENTS
// ========================================
function initAppointmentFilterEvents() {
    document.getElementById('appointmentDateFilter')?.addEventListener('change', renderAppointments);
    document.getElementById('appointmentStatusFilter')?.addEventListener('change', renderAppointments);
}