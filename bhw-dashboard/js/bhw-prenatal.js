// ========================================
// BHW PRENATAL - Prenatal Care Records
// ========================================

// ========================================
// ADD PRENATAL BUTTON
// ========================================
function initAddPrenatalButton() {
    if (!addPrenatalBtn) return;

    addPrenatalBtn.addEventListener('click', function() {
        populatePrenatalResidents();
        addPrenatalForm.reset();
        const submitBtn = addPrenatalForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Save Prenatal Record';
        submitBtn.disabled = false;
        openModal(addPrenatalModal);
    });
}

// ========================================
// POPULATE PRENATAL RESIDENTS DROPDOWN
// ========================================
function populatePrenatalResidents() {
    const select = document.getElementById('prenatalResident');
    if (!select) return;
    select.innerHTML = '<option value="">Select resident...</option>';

    const eligible = residents.filter(function(r) {
        const ageNum = parseInt(r.age);
        return r.sex === 'Female' && !isNaN(ageNum) && ageNum >= 13 && ageNum <= 49;
    });

    if (eligible.length === 0) {
        select.innerHTML = '<option value="">No eligible women (13-49 years old)</option>';
    } else {
        eligible.forEach(function(r) {
            const option = document.createElement('option');
            option.value = r.id;
            option.textContent = r.fullName + ' (' + (r.age_display || r.age) + ', ' + r.purok + ')';
            select.appendChild(option);
        });
    }
}

// ========================================
// AUTO-CALCULATE GESTATIONAL AGE
// ========================================
function initPrenatalLmpCalculation() {
    const prenatalLmp = document.getElementById('prenatalLmp');
    const prenatalDueDate = document.getElementById('prenatalDueDate');
    const prenatalGestationalAge = document.getElementById('prenatalGestationalAge');

    if (prenatalLmp) {
        prenatalLmp.addEventListener('change', function() {
            if (this.value) {
                const lmpDate = new Date(this.value);
                const today = new Date();
                const diffTime = today - lmpDate;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const weeks = Math.floor(diffDays / 7);
                if (weeks >= 0) {
                    prenatalGestationalAge.value = weeks;
                }

                // Auto-calculate due date (LMP + 280 days)
                const dueDate = new Date(lmpDate);
                dueDate.setDate(dueDate.getDate() + 280);
                const dueDateStr = dueDate.toISOString().split('T')[0];
                prenatalDueDate.value = dueDateStr;
            }
        });
    }
}

// ========================================
// PRENATAL FORM SUBMIT
// ========================================
function initAddPrenatalForm() {
    if (!addPrenatalForm) return;

    addPrenatalForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const residentId = parseInt(document.getElementById('prenatalResident').value);
        const lmp = document.getElementById('prenatalLmp').value;
        const dueDate = document.getElementById('prenatalDueDate').value;
        const gestationalAge = document.getElementById('prenatalGestationalAge').value || 0;
        const status = document.getElementById('prenatalStatus').value;
        const vitalSigns = document.getElementById('prenatalVitalSigns').value;
        const milestoneNotes = document.getElementById('prenatalMilestoneNotes').value;
        const nextCheckup = document.getElementById('prenatalNextCheckup').value;

        if (!residentId || !lmp || !dueDate) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const prenatalData = {
            resident_id: residentId,
            lmp: lmp,
            due_date: dueDate,
            gestational_age: gestationalAge,
            status: status,
            vital_signs: vitalSigns || '',
            milestone_notes: milestoneNotes || '',
            next_checkup: nextCheckup || ''
        };

        fetch('ajax/add_prenatal.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(prenatalData).toString()
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast('Prenatal record added successfully!', 'success');
                closeModal(addPrenatalModal);
                addPrenatalForm.reset();
                submitBtn.textContent = 'Save Prenatal Record';
                submitBtn.disabled = false;
                fetchAllRecords();
            } else {
                showToast(data.message || 'Failed to add prenatal record.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Prenatal Record';
            }
        })
        .catch(function() {
            showToast('Error connecting to server.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Prenatal Record';
        });
    });
}

// ========================================
// EDIT PRENATAL RECORD
// ========================================
function editPrenatalRecord(recordId) {
    const record = prenatalRecords.find(function(r) { return r.id === recordId; });
    if (!record) {
        showToast('Record not found.', 'error');
        return;
    }

    document.getElementById('editPrenatalId').value = record.id;
    document.getElementById('editPrenatalResident').value = record.residentId || '';
    document.getElementById('editPrenatalLmp').value = record.lmp || '';
    document.getElementById('editPrenatalDueDate').value = record.dueDate || '';
    document.getElementById('editPrenatalGestationalAge').value = record.gestationalAge || '';
    document.getElementById('editPrenatalStatus').value = record.status || 'Active';
    document.getElementById('editPrenatalVitalSigns').value = record.vitalSigns || '';
    document.getElementById('editPrenatalMilestoneNotes').value = record.milestoneNotes || '';
    document.getElementById('editPrenatalNextCheckup').value = record.nextCheckup || '';

    populateEditPrenatalResidents(record.residentId);

    const editLmp = document.getElementById('editPrenatalLmp');
    const editDueDate = document.getElementById('editPrenatalDueDate');
    const editGestationalAge = document.getElementById('editPrenatalGestationalAge');

    editLmp.removeEventListener('change', editLmp._listener);

    editLmp._listener = function() {
        if (this.value) {
            const lmpDate = new Date(this.value);
            const today = new Date();
            const diffTime = today - lmpDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(diffDays / 7);
            if (weeks >= 0) {
                editGestationalAge.value = weeks;
            }
            const dueDate = new Date(lmpDate);
            dueDate.setDate(dueDate.getDate() + 280);
            editDueDate.value = dueDate.toISOString().split('T')[0];
        }
    };

    editLmp.addEventListener('change', editLmp._listener);

    openModal(editPrenatalModal);
}

// ========================================
// POPULATE EDIT PRENATAL RESIDENTS
// ========================================
function populateEditPrenatalResidents(selectedId) {
    const select = document.getElementById('editPrenatalResident');
    if (!select) return;
    select.innerHTML = '<option value="">Select resident...</option>';

    const eligible = residents.filter(function(r) {
        const ageNum = parseInt(r.age);
        return r.sex === 'Female' && !isNaN(ageNum) && ageNum >= 13 && ageNum <= 49;
    });

    if (eligible.length === 0) {
        select.innerHTML = '<option value="">No eligible women (13-49 years old)</option>';
    } else {
        eligible.forEach(function(r) {
            const option = document.createElement('option');
            option.value = r.id;
            if (selectedId && selectedId == r.id) {
                option.selected = true;
            }
            option.textContent = r.fullName + ' (' + (r.age_display || r.age) + ', ' + r.purok + ')';
            select.appendChild(option);
        });
    }
}

// ========================================
// RENDER PRENATAL RECORDS
// ========================================
function renderPrenatal() {
    const tbody = document.getElementById('prenatalTableBody');
    const resultsCount = document.getElementById('prenatalResults');
    const searchTerm = document.getElementById('prenatalSearch') ? document.getElementById('prenatalSearch').value.toLowerCase().trim() : '';
    const statusFilter = document.getElementById('prenatalStatusFilter') ? document.getElementById('prenatalStatusFilter').value : '';

    if (!tbody) return;

    let filtered = [...prenatalRecords];

    if (searchTerm) {
        filtered = filtered.filter(function(r) {
            return r.residentName.toLowerCase().includes(searchTerm);
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
                <td colspan="10" class="empty-state">
                    <i class="fas fa-baby-carriage"></i>
                    <span>No prenatal records found</span>
                    <p class="empty-sub">Track pregnant women to ensure proper maternal care.</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = filtered.map(function(r) {
            const statusClass = r.status.toLowerCase();
            const milestonePreview = r.milestoneNotes ?
                (r.milestoneNotes.length > 40 ? r.milestoneNotes.substring(0, 40) + '...' : r.milestoneNotes) :
                '—';
            const vitalPreview = r.vitalSigns ?
                (r.vitalSigns.length > 30 ? r.vitalSigns.substring(0, 30) + '...' : r.vitalSigns) :
                '—';

            const deliveryInfo = r.status === 'Delivered' && r.deliveryDate ?
                ' (Delivered: ' + r.deliveryDate + ')' : '';

            return `
                <tr>
                    <td><strong>${r.residentName}</strong></td>
                    <td>${r.lmp}</td>
                    <td>${r.dueDate}</td>
                    <td>${r.gestationalAge} weeks</td>
                    <td><span class="status-badge ${statusClass}">${r.status}${deliveryInfo}</span></td>
                    <td><span title="${r.vitalSigns || ''}" style="cursor:help;">${vitalPreview}</span></td>
                    <td><span title="${r.milestoneNotes || ''}" style="cursor:help;">${milestonePreview}</span></td>
                    <td>${r.nextCheckup || '—'}</td>
                    <td>
                        <button class="btn btn-outline btn-sm view-prenatal" data-id="${r.id}">View</button>
                    </td>
                    <td>
                        <button class="btn btn-outline btn-sm edit-prenatal" data-id="${r.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${r.status === 'Active' ?
                            `<button class="btn btn-success btn-sm mark-delivered" data-id="${r.id}">
                                <i class="fas fa-check"></i>
                            </button>` :
                            `<button class="btn btn-warning btn-sm reactivate-prenatal" data-id="${r.id}">
                                <i class="fas fa-undo"></i>
                            </button>`
                        }
                        <button class="btn btn-danger btn-sm delete-prenatal" data-id="${r.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    if (resultsCount) resultsCount.textContent = filtered.length + ' records';

    document.querySelectorAll('.view-prenatal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            viewPrenatalRecord(id);
        });
    });

    document.querySelectorAll('.edit-prenatal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            editPrenatalRecord(id);
        });
    });

    document.querySelectorAll('.mark-delivered').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            markPrenatalDelivered(id);
        });
    });

    document.querySelectorAll('.reactivate-prenatal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            reactivatePrenatal(id);
        });
    });

    document.querySelectorAll('.delete-prenatal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            deletePrenatalRecord(id);
        });
    });
}

// ========================================
// VIEW PRENATAL RECORD
// ========================================
function viewPrenatalRecord(recordId) {
    const record = prenatalRecords.find(function(r) { return r.id === recordId; });
    if (!record) {
        showToast('Record not found.', 'error');
        return;
    }

    const statusClass = record.status.toLowerCase();
    const deliveryInfo = record.status === 'Delivered' && record.deliveryDate ?
        'Delivered on: ' + record.deliveryDate : '';

    const html = `
        <div class="resident-detail">
            <div class="detail-header">
                <div class="detail-avatar">
                    <i class="fas fa-baby-carriage"></i>
                </div>
                <div class="detail-name">
                    <h2>${record.residentName}</h2>
                    <span class="detail-type status-badge ${statusClass}">${record.status}</span>
                    ${deliveryInfo ? `<span style="margin-left:8px;font-size:0.8rem;color:var(--gray);">${deliveryInfo}</span>` : ''}
                </div>
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">LMP</span>
                    <span class="detail-value">${record.lmp}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Due Date</span>
                    <span class="detail-value">${record.dueDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Gestational Age</span>
                    <span class="detail-value">${record.gestationalAge} weeks</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Next Checkup</span>
                    <span class="detail-value">${record.nextCheckup || '—'}</span>
                </div>
            </div>
            <div class="detail-section">
                <h4><i class="fas fa-heartbeat"></i> Vital Signs</h4>
                <p class="detail-medical">${record.vitalSigns || 'No vital signs recorded.'}</p>
            </div>
            <div class="detail-section">
                <h4><i class="fas fa-flag-checkered"></i> Milestone Notes</h4>
                <p class="detail-medical">${record.milestoneNotes || 'No milestone notes recorded.'}</p>
            </div>
        </div>
    `;

    document.getElementById('residentDetailContent').innerHTML = html;
    openModal(viewResidentModal);
}

// ========================================
// MARK PRENATAL DELIVERED
// ========================================
function markPrenatalDelivered(recordId) {
    const record = prenatalRecords.find(function(r) { return r.id === recordId; });
    if (!record) {
        showToast('Record not found.', 'error');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const deliveryDate = prompt('Enter delivery date (YYYY-MM-DD):', today);
    if (!deliveryDate) return;

    if (!confirm('⚠️ Mark this pregnancy as Delivered?\n\nResident: ' + record.residentName + '\nDelivery Date: ' + deliveryDate + '\n\nThis will change the status to "Delivered".')) {
        return;
    }

    fetch('ajax/mark_delivered.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            id: recordId,
            delivery_date: deliveryDate
        }).toString()
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            showToast(data.message || 'Marked as delivered successfully!', 'success');
            fetchAllRecords();
        } else {
            showToast(data.message || 'Failed to mark as delivered.', 'error');
        }
    })
    .catch(function() {
        showToast('Error connecting to server.', 'error');
    });
}

// ========================================
// REACTIVATE PRENATAL
// ========================================
function reactivatePrenatal(recordId) {
    const record = prenatalRecords.find(function(r) { return r.id === recordId; });
    if (!record) {
        showToast('Record not found.', 'error');
        return;
    }

    if (!confirm('⚠️ Reactivate this prenatal record?\n\nResident: ' + record.residentName + '\n\nThis will change the status back to "Active".')) {
        return;
    }

    fetch('ajax/reactivate_prenatal.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + recordId
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            showToast(data.message || 'Record reactivated successfully!', 'success');
            fetchAllRecords();
        } else {
            showToast(data.message || 'Failed to reactivate record.', 'error');
        }
    })
    .catch(function() {
        showToast('Error connecting to server.', 'error');
    });
}

// ========================================
// DELETE PRENATAL RECORD
// ========================================
function deletePrenatalRecord(recordId) {
    if (!confirm('⚠️ Are you sure you want to delete this prenatal record?\n\nThis action cannot be undone.')) {
        return;
    }

    fetch('ajax/delete_prenatal.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + recordId
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            showToast('Prenatal record deleted successfully!', 'success');
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
// EDIT PRENATAL FORM SUBMIT
// ========================================
function initEditPrenatalForm() {
    const editPrenatalForm = document.getElementById('editPrenatalForm');
    if (!editPrenatalForm) return;

    editPrenatalForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const id = document.getElementById('editPrenatalId').value;
        const residentId = parseInt(document.getElementById('editPrenatalResident').value);
        const lmp = document.getElementById('editPrenatalLmp').value;
        const dueDate = document.getElementById('editPrenatalDueDate').value;
        const gestationalAge = document.getElementById('editPrenatalGestationalAge').value || 0;
        const status = document.getElementById('editPrenatalStatus').value;
        const vitalSigns = document.getElementById('editPrenatalVitalSigns').value;
        const milestoneNotes = document.getElementById('editPrenatalMilestoneNotes').value;
        const nextCheckup = document.getElementById('editPrenatalNextCheckup').value;

        if (!residentId || !lmp || !dueDate) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';

        const data = new URLSearchParams({
            id: id,
            resident_id: residentId,
            lmp: lmp,
            due_date: dueDate,
            gestational_age: gestationalAge,
            status: status,
            vital_signs: vitalSigns || '',
            milestone_notes: milestoneNotes || '',
            next_checkup: nextCheckup || ''
        }).toString();

        fetch('ajax/update_prenatal.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast('Prenatal record updated successfully!', 'success');
                closeModal(editPrenatalModal);
                fetchAllRecords();
            } else {
                showToast(data.message || 'Update failed.', 'error');
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Prenatal Record';
        })
        .catch(function() {
            showToast('Error connecting to server.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Prenatal Record';
        });
    });
}