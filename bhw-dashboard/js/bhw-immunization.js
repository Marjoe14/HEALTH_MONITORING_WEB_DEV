// ========================================
// BHW IMMUNIZATION - Immunization Records
// ========================================

// ========================================
// ADD IMMUNIZATION BUTTON
// ========================================
function initAddImmunizationButton() {
    if (!addImmunizationBtn) return;

    addImmunizationBtn.addEventListener('click', function() {
        populateImmunizationChildren();
        recordImmunizationForm.reset();
        const submitBtn = recordImmunizationForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Save Immunization';
        submitBtn.disabled = false;
        openModal(recordImmunizationModal);
    });
}

// ========================================
// POPULATE IMMUNIZATION CHILDREN DROPDOWN
// ========================================
function populateImmunizationChildren() {
    const select = document.getElementById('immunizationChild');
    if (!select) return;

    select.innerHTML = '<option value="">Select child...</option>';

    const children = residents.filter(function(r) {
        let ageNum = parseInt(r.age);

        if (isNaN(ageNum) && r.age_display) {
            const ageMatch = String(r.age_display).match(/(\d+)/);
            if (ageMatch) {
                ageNum = parseInt(ageMatch[1]);
            }
        }

        let isInfant = false;
        if (r.age_display && typeof r.age_display === 'string') {
            const ageDisplayLower = r.age_display.toLowerCase();
            if (ageDisplayLower.includes('mos') || ageDisplayLower.includes('month')) {
                const mosMatch = ageDisplayLower.match(/(\d+)/);
                if (mosMatch) {
                    const months = parseInt(mosMatch[1]);
                    isInfant = months <= 60;
                }
            }
        }

        return !isNaN(ageNum) && ageNum >= 0 && ageNum <= 5 || isInfant;
    });

    if (children.length === 0) {
        select.innerHTML = '<option value="">No children registered (0-5 years old)</option>';
        showToast('No children (0-5 years old) found. Please add a child first.', 'info');
    } else {
        children.forEach(function(r) {
            const option = document.createElement('option');
            option.value = r.id;
            const ageDisplay = r.age_display || r.age || 'Unknown age';
            const parentInfo = r.parentName ? ' · Parent: ' + r.parentName : ' · No Parent';
            const purokInfo = r.purok ? ', ' + r.purok : '';
            option.textContent = r.fullName + ' (' + ageDisplay + purokInfo + ')' + parentInfo;
            select.appendChild(option);
        });
        if (typeof loadVaccineDropdowns === 'function') {
            loadVaccineDropdowns();
        }
    }
}

// ========================================
// IMMUNIZATION FORM SUBMIT
// ========================================
function initRecordImmunizationForm() {
    if (!recordImmunizationForm) return;

    recordImmunizationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const childId = parseInt(document.getElementById('immunizationChild').value);
        const vaccine = document.getElementById('immunizationVaccine').value;
        const dose = document.getElementById('immunizationDose').value;
        const dateAdministered = document.getElementById('immunizationDate').value;
        const nextDose = document.getElementById('immunizationNextDose').value;
        const notes = document.getElementById('immunizationNotes').value;

        if (!childId || !vaccine || !dose || !dateAdministered) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const child = residents.find(function(r) { return r.id === childId; });

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const immData = {
            child_id: childId,
            vaccine: vaccine,
            dose: dose,
            date_administered: dateAdministered,
            next_dose: nextDose || '',
            notes: notes || ''
        };

        fetch('ajax/add_immunization.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(immData).toString()
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast('Immunization recorded for ' + (child ? child.fullName : 'child'), 'success');
                closeModal(recordImmunizationModal);
                recordImmunizationForm.reset();
                submitBtn.textContent = 'Save Immunization';
                submitBtn.disabled = false;
                fetchAllRecords();
            } else {
                showToast(data.message || 'Immunization recording failed.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Immunization';
            }
        })
        .catch(function() {
            showToast('Error connecting to server.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Immunization';
        });
    });
}

// ========================================
// EDIT IMMUNIZATION RECORD
// ========================================
function editImmunizationRecord(recordId) {
    const record = immunizationRecords.find(function(r) { return r.id === recordId; });
    if (!record) {
        showToast('Record not found.', 'error');
        return;
    }

    document.getElementById('editImmunizationId').value = record.id;
    document.getElementById('editImmunizationChild').value = record.child_id || record.residentId || '';
    document.getElementById('editImmunizationVaccine').value = record.vaccine || '';
    document.getElementById('editImmunizationDose').value = record.dose || '';
    document.getElementById('editImmunizationDate').value = record.date_administered || record.dateAdministered || '';
    document.getElementById('editImmunizationNextDose').value = record.next_dose || record.nextDose || '';
    document.getElementById('editImmunizationNotes').value = record.notes || '';

    populateEditImmunizationChildren(record.child_id || record.residentId);
    openModal(editImmunizationModal);
}

// ========================================
// POPULATE EDIT IMMUNIZATION CHILDREN
// ========================================
function populateEditImmunizationChildren(selectedId) {
    const select = document.getElementById('editImmunizationChild');
    if (!select) return;

    select.innerHTML = '<option value="">Select child...</option>';

    const children = residents.filter(function(r) {
        let ageNum = parseInt(r.age);
        if (isNaN(ageNum) && r.age_display) {
            const ageMatch = String(r.age_display).match(/(\d+)/);
            if (ageMatch) {
                ageNum = parseInt(ageMatch[1]);
            }
        }
        let isInfant = false;
        if (r.age_display && typeof r.age_display === 'string') {
            const ageDisplayLower = r.age_display.toLowerCase();
            if (ageDisplayLower.includes('mos') || ageDisplayLower.includes('month')) {
                const mosMatch = ageDisplayLower.match(/(\d+)/);
                if (mosMatch) {
                    const months = parseInt(mosMatch[1]);
                    isInfant = months <= 60;
                }
            }
        }
        return !isNaN(ageNum) && ageNum >= 0 && ageNum <= 5 || isInfant;
    });

    if (children.length === 0) {
        select.innerHTML = '<option value="">No children registered (0-5 years old)</option>';
    } else {
        children.forEach(function(r) {
            const option = document.createElement('option');
            option.value = r.id;
            if (selectedId && selectedId == r.id) {
                option.selected = true;
            }
            const ageDisplay = r.age_display || r.age || 'Unknown age';
            const parentInfo = r.parentName ? ' · Parent: ' + r.parentName : ' · No Parent';
            const purokInfo = r.purok ? ', ' + r.purok : '';
            option.textContent = r.fullName + ' (' + ageDisplay + purokInfo + ')' + parentInfo;
            select.appendChild(option);
        });
    }

    setTimeout(function() {
        var vaccineSelect = document.getElementById('editImmunizationVaccine');
        if (vaccineSelect && vaccineSelect.value) {
            if (typeof updateEditDoseDropdown === 'function') {
                updateEditDoseDropdown(vaccineSelect.value);
            }
        }
    }, 100);
}

// ========================================
// EDIT IMMUNIZATION FORM SUBMIT
// ========================================
function initEditImmunizationForm() {
    if (!editImmunizationForm) return;

    editImmunizationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const id = document.getElementById('editImmunizationId').value;
        const childId = parseInt(document.getElementById('editImmunizationChild').value);
        const vaccine = document.getElementById('editImmunizationVaccine').value;
        const dose = document.getElementById('editImmunizationDose').value;
        const dateAdministered = document.getElementById('editImmunizationDate').value;
        const nextDose = document.getElementById('editImmunizationNextDose').value;
        const notes = document.getElementById('editImmunizationNotes').value;

        if (!childId || !vaccine || !dose || !dateAdministered) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';

        const data = new URLSearchParams({
            id: id,
            child_id: childId,
            vaccine: vaccine,
            dose: dose,
            date_administered: dateAdministered,
            next_dose: nextDose || '',
            notes: notes || ''
        }).toString();

        fetch('ajax/update_immunization.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast('Immunization record updated successfully!', 'success');
                closeModal(editImmunizationModal);
                fetchAllRecords();
            } else {
                showToast(data.message || 'Update failed.', 'error');
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Immunization';
        })
        .catch(function() {
            showToast('Error connecting to server.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Immunization';
        });
    });
}

// ========================================
// DELETE IMMUNIZATION RECORD
// ========================================
function deleteImmunizationRecord(recordId) {
    if (!confirm('⚠️ Are you sure you want to delete this immunization record?\n\nThis action cannot be undone.')) {
        return;
    }

    fetch('ajax/delete_immunization.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + recordId
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            showToast('Immunization record deleted successfully!', 'success');
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
// RENDER IMMUNIZATION
// ========================================
function renderImmunization() {
    const tbody = document.getElementById('immunizationTableBody');
    const resultsCount = document.getElementById('immunizationResults');

    if (!tbody) return;

    if (immunizationRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="empty-state">
                    <i class="fas fa-syringe"></i>
                    <span>No immunization records found</span>
                    <p class="empty-sub">Record vaccinations to ensure children are protected.</p>
                </td>
            </tr>
        `;
        if (resultsCount) resultsCount.textContent = '0 records';
        return;
    }

    tbody.innerHTML = immunizationRecords.map(function(r) {
        const statusClass = r.status ? r.status.toLowerCase() : 'upcoming';

        let parentDisplay = '—';
        if (r.parent_name && r.parent_name !== '—' && r.parent_name !== '') {
            parentDisplay = r.parent_name;
        } else if (r.parentName && r.parentName !== '—' && r.parentName !== '') {
            parentDisplay = r.parentName;
        } else {
            if (r.parent_id) {
                const parent = residents.find(function(res) {
                    return res.id === parseInt(r.parent_id);
                });
                if (parent) {
                    parentDisplay = parent.fullName || parent.firstName + ' ' + parent.lastName;
                }
            }
            if (r.child_id) {
                const child = residents.find(function(res) {
                    return res.id === parseInt(r.child_id);
                });
                if (child && child.parentName) {
                    parentDisplay = child.parentName;
                }
            }
        }

        const childPurok = r.child_purok || r.purok || '—';
        const ageDisplay = r.child_age_display || r.child_age || '—';

        return `
            <tr>
                <td><strong>${r.child_name || r.childName || 'Unknown'}</strong></td>
                <td>${childPurok}</td>
                <td>${ageDisplay}</td>
                <td>${parentDisplay}</td>
                <td>${r.vaccine || '—'}</td>
                <td>${r.dose || '—'}</td>
                <td>${r.date_administered || r.dateAdministered || '—'}</td>
                <td>${r.next_dose || r.nextDose || '—'}</td>
                <td><span class="status-badge ${statusClass}">${r.status || 'Upcoming'}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm edit-immunization" data-id="${r.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm delete-immunization" data-id="${r.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    if (resultsCount) resultsCount.textContent = immunizationRecords.length + ' records';

    document.querySelectorAll('.edit-immunization').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            editImmunizationRecord(id);
        });
    });

    document.querySelectorAll('.delete-immunization').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            deleteImmunizationRecord(id);
        });
    });
}

// ========================================
// APPLY IMMUNIZATION FILTERS
// ========================================
function applyImmunizationFilters() {
    const search = document.getElementById('immunizationSearch')?.value.trim() || '';
    const purok = document.getElementById('immunizationPurokFilter')?.value || '';
    const vaccine = document.getElementById('immunizationVaccineFilter')?.value || '';
    const dose = document.getElementById('immunizationDoseFilter')?.value || '';
    const date = document.getElementById('immunizationDateFilter')?.value || '';
    const status = document.getElementById('immunizationStatusFilter')?.value || '';

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (purok) params.append('purok', purok);
    if (vaccine) params.append('vaccine_type', vaccine);
    if (dose) params.append('dose', dose);
    if (date) params.append('date', date);
    if (status) params.append('status', status);

    fetch('ajax/get_immunization.php?' + params.toString())
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                immunizationRecords = data.records.map(function(r) {
                    let parentName = r.parent_name || '—';

                    if (!parentName || parentName === '—' || parentName === '') {
                        if (r.child_id) {
                            const child = residents.find(function(res) {
                                return res.id === parseInt(r.child_id);
                            });
                            if (child && child.parentName) {
                                parentName = child.parentName;
                            }
                        }

                        if (r.parent_id && !parentName) {
                            const parent = residents.find(function(res) {
                                return res.id === parseInt(r.parent_id);
                            });
                            if (parent) {
                                parentName = parent.fullName || parent.firstName + ' ' + parent.lastName;
                            }
                        }
                    }

                    return {
                        id: r.id,
                        residentId: r.resident_id,
                        child_id: r.child_id || r.resident_id,
                        child_name: r.child_name || 'Unknown',
                        child_age: r.child_age || '—',
                        child_age_display: r.child_age_display || (r.child_age !== '—' && r.child_age !== undefined ? r.child_age + ' yrs' : '—'),
                        child_purok: r.child_purok || '—',
                        parent_id: r.parent_id || null,
                        parent_name: parentName,
                        parent_contact: r.parent_contact || '—',
                        vaccine: r.vaccine || '—',
                        dose: r.dose || '—',
                        date_administered: r.date_administered || '—',
                        next_dose: r.next_dose || '—',
                        status: r.status || 'Upcoming',
                        notes: r.notes || '',
                        created_at: r.created_at || new Date().toISOString()
                    };
                });
                renderImmunization();
            }
        })
        .catch(function() { /* silent fail */ });
}

// ========================================
// INIT IMMUNIZATION FILTER EVENTS
// ========================================
function initImmunizationFilterEvents() {
    document.getElementById('immunizationSearch')?.addEventListener('input', applyImmunizationFilters);
    document.getElementById('immunizationPurokFilter')?.addEventListener('change', applyImmunizationFilters);
    document.getElementById('immunizationVaccineFilter')?.addEventListener('change', applyImmunizationFilters);
    document.getElementById('immunizationDoseFilter')?.addEventListener('change', applyImmunizationFilters);
    document.getElementById('immunizationDateFilter')?.addEventListener('change', applyImmunizationFilters);
    document.getElementById('immunizationStatusFilter')?.addEventListener('change', applyImmunizationFilters);

    document.getElementById('clearImmunizationFilters')?.addEventListener('click', function() {
        document.getElementById('immunizationSearch').value = '';
        document.getElementById('immunizationPurokFilter').value = '';
        document.getElementById('immunizationVaccineFilter').value = '';
        document.getElementById('immunizationDoseFilter').value = '';
        document.getElementById('immunizationDateFilter').value = '';
        document.getElementById('immunizationStatusFilter').value = '';
        applyImmunizationFilters();
    });
}