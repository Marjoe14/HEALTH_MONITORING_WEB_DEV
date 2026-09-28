// ========================================
// RESIDENT APPOINTMENTS
// ========================================

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
                renderResidentAppointments([]);
            }
        })
        .catch(function() {
            renderResidentAppointments([]);
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

        const isPending = app.cancellation_status === 'pending';
        const isRequested = app.cancellation_requested == 1;

        let statusDisplay = app.status;
        let statusBadgeClass = 'status-badge ' + app.status.toLowerCase();

        if (isPending && isRequested) {
            statusDisplay = 'Under Review';
            statusBadgeClass = 'status-badge warning';
        }

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

    document.querySelectorAll('#residentAppointmentTableBody .view-appointment-detail').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            viewResidentAppointmentDetail(id);
        });
    });

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

                const modal = viewResidentModal;
                if (modal) {
                    openModal(modal);

                    setTimeout(function() {
                        const closeBtns = modal.querySelectorAll('.close-modal, .modal-close, .btn-outline');
                        closeBtns.forEach(function(btn) {
                            btn.onclick = function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                closeModal(modal);
                            };
                        });
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
// OPEN CANCEL APPOINTMENT MODAL
// ========================================
function openCancelAppointmentModal(appointmentId) {
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
// INIT APPOINTMENT FILTERS + CANCEL FORM
// ========================================
function initAppointmentEventListeners() {
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

    document.querySelectorAll('.close-cancel-modal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            closeModal(document.getElementById('cancelAppointmentModal'));
        });
    });
}