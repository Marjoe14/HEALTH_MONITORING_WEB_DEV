// ========================================
// VACCINE MANAGEMENT - Separate Module
// ========================================

(function() {
    'use strict';

    // ========================================
    // LOAD VACCINES FROM DATABASE
    // ========================================
function loadVaccineDropdowns() {
    fetch('ajax/get_vaccines.php')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                // Store vaccines globally for dose calculation
                window.vaccines = data.vaccines;

                // Update Add Immunization dropdown
                var addSelect = document.getElementById('immunizationVaccine');
                if (addSelect) {
                    var currentValue = addSelect.value;
                    addSelect.innerHTML = '<option value="">Select vaccine...</option>';
                    data.vaccines.forEach(function(v) {
                        var option = document.createElement('option');
                        option.value = v.name;
                        option.textContent = v.name + ' (' + v.doses_required + ' dose' + (v.doses_required > 1 ? 's' : '') + ')';
                        option.dataset.doses = v.doses_required;
                        addSelect.appendChild(option);
                    });
                    if (currentValue) {
                        addSelect.value = currentValue;
                        updateDoseDropdown(addSelect.value);
                    }
                }

                // Update Edit Immunization dropdown
                var editSelect = document.getElementById('editImmunizationVaccine');
                if (editSelect) {
                    var currentValue = editSelect.value;
                    editSelect.innerHTML = '<option value="">Select vaccine...</option>';
                    data.vaccines.forEach(function(v) {
                        var option = document.createElement('option');
                        option.value = v.name;
                        option.textContent = v.name + ' (' + v.doses_required + ' dose' + (v.doses_required > 1 ? 's' : '') + ')';
                        option.dataset.doses = v.doses_required;
                        editSelect.appendChild(option);
                    });
                    if (currentValue) {
                        editSelect.value = currentValue;
                        updateEditDoseDropdown(currentValue);
                    }
                }

                // Update Filter dropdown
                var filterSelect = document.getElementById('immunizationVaccineFilter');
                if (filterSelect) {
                    var currentValue = filterSelect.value;
                    filterSelect.innerHTML = '<option value="">All Vaccines</option>';
                    data.vaccines.forEach(function(v) {
                        var option = document.createElement('option');
                        option.value = v.name;
                        option.textContent = v.name;
                        filterSelect.appendChild(option);
                    });
                    if (currentValue) filterSelect.value = currentValue;
                }

                // Add event listeners for vaccine change
                if (addSelect) {
                    addSelect.removeEventListener('change', handleVaccineChange);
                    addSelect.addEventListener('change', handleVaccineChange);
                }
                if (editSelect) {
                    editSelect.removeEventListener('change', handleEditVaccineChange);
                    editSelect.addEventListener('change', handleEditVaccineChange);
                }
            }
        })
        .catch(function() { /* silent fail */ });
}
// ========================================
// UPDATE DOSE DROPDOWN (ADD MODAL)
// ========================================
function updateDoseDropdown(vaccineName) {
    var doseSelect = document.getElementById('immunizationDose');
    if (!doseSelect) return;

    var doses = 1;
    if (window.vaccines) {
        var found = window.vaccines.find(function(v) {
            return v.name === vaccineName;
        });
        if (found) {
            doses = found.doses_required;
        }
    }

    var currentValue = doseSelect.value;
    doseSelect.innerHTML = '<option value="">Select dose...</option>';
    
    var doseLabels = ['1st Dose', '2nd Dose', '3rd Dose', '4th Dose', '5th Dose'];
    for (var i = 0; i < doses; i++) {
        var option = document.createElement('option');
        option.value = doseLabels[i];
        option.textContent = doseLabels[i];
        doseSelect.appendChild(option);
    }
    
    // Add Booster option
    var boosterOption = document.createElement('option');
    boosterOption.value = 'Booster';
    boosterOption.textContent = 'Booster';
    doseSelect.appendChild(boosterOption);

    if (currentValue) {
        doseSelect.value = currentValue;
    }
}

// ========================================
// UPDATE DOSE DROPDOWN (EDIT MODAL)
// ========================================
function updateEditDoseDropdown(vaccineName) {
    var doseSelect = document.getElementById('editImmunizationDose');
    if (!doseSelect) return;

    var doses = 1;
    if (window.vaccines) {
        var found = window.vaccines.find(function(v) {
            return v.name === vaccineName;
        });
        if (found) {
            doses = found.doses_required;
        }
    }

    var currentValue = doseSelect.value;
    doseSelect.innerHTML = '<option value="">Select dose...</option>';
    
    var doseLabels = ['1st Dose', '2nd Dose', '3rd Dose', '4th Dose', '5th Dose'];
    for (var i = 0; i < doses; i++) {
        var option = document.createElement('option');
        option.value = doseLabels[i];
        option.textContent = doseLabels[i];
        doseSelect.appendChild(option);
    }
    
    var boosterOption = document.createElement('option');
    boosterOption.value = 'Booster';
    boosterOption.textContent = 'Booster';
    doseSelect.appendChild(boosterOption);

    if (currentValue) {
        doseSelect.value = currentValue;
    }
}

// ========================================
// HANDLE VACCINE CHANGE (ADD MODAL)
// ========================================
function handleVaccineChange() {
    updateDoseDropdown(this.value);
}

// ========================================
// HANDLE VACCINE CHANGE (EDIT MODAL)
// ========================================
function handleEditVaccineChange() {
    updateEditDoseDropdown(this.value);
}
    // ========================================
    // VACCINE MANAGEMENT PAGE
    // ========================================
    function loadVaccineManagement() {
        fetchVaccines();
    }

    function fetchVaccines() {
        var tbody = document.getElementById('vaccineTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Loading vaccines...</span>
                    </td>
                </tr>
            `;
        }

        fetch('ajax/get_vaccines.php')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    renderVaccines(data.vaccines);
                    // Also update immunization dropdowns
                    loadVaccineDropdowns();
                } else {
                    showToast('Failed to load vaccines', 'error');
                }
            })
            .catch(function() {
                showToast('Error connecting to server', 'error');
            });
    }

    function renderVaccines(vaccines) {
        var tbody = document.getElementById('vaccineTableBody');
        if (!tbody) return;

        if (!vaccines || vaccines.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <i class="fas fa-syringe"></i>
                        <span>No vaccines found</span>
                        <p class="empty-sub">Click "Add Vaccine" to get started.</p>
                    </td>
                </tr>
            `;
            return;
        }

        var html = '';
        vaccines.forEach(function(v) {
            html += `
                <tr>
                    <td><strong>${v.name}</strong></td>
                    <td>${v.description || '—'}</td>
                    <td>${v.doses_required} dose${v.doses_required > 1 ? 's' : ''}</td>
                    <td>
                        <button class="btn btn-outline btn-sm edit-vaccine" data-id="${v.id}" data-name="${v.name}" data-description="${v.description || ''}" data-doses="${v.doses_required}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-vaccine" data-id="${v.id}" data-name="${v.name}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        // Edit vaccine button
        document.querySelectorAll('.edit-vaccine').forEach(function(btn) {
            btn.addEventListener('click', function() {
                openAddEditVaccineModal(
                    this.dataset.id,
                    this.dataset.name,
                    this.dataset.description,
                    this.dataset.doses
                );
            });
        });

        // Delete vaccine button
        document.querySelectorAll('.delete-vaccine').forEach(function(btn) {
            btn.addEventListener('click', function() {
                deleteVaccine(this.dataset.id, this.dataset.name);
            });
        });
    }

    function openAddEditVaccineModal(id, name, description, doses) {
        var modal = document.getElementById('addEditVaccineModal');
        var title = document.getElementById('addEditVaccineTitle');
        var form = document.getElementById('addEditVaccineForm');
        var saveBtn = document.getElementById('saveVaccineBtn');

        if (id) {
            title.innerHTML = '<i class="fas fa-edit"></i> Edit Vaccine';
            document.getElementById('editVaccineId').value = id;
            document.getElementById('vaccineName').value = name;
            document.getElementById('vaccineDescription').value = description || '';
            document.getElementById('vaccineDoses').value = doses || 1;
            saveBtn.textContent = 'Update Vaccine';
        } else {
            title.innerHTML = '<i class="fas fa-plus"></i> Add Vaccine';
            document.getElementById('editVaccineId').value = '';
            form.reset();
            document.getElementById('vaccineDoses').value = 1;
            saveBtn.textContent = 'Save Vaccine';
        }

        openModal(modal);
    }

    function deleteVaccine(id, name) {
        if (!confirm('⚠️ Are you sure you want to delete vaccine "' + name + '"?\n\nThis will only work if no immunization records are using this vaccine.')) {
            return;
        }

        fetch('ajax/delete_vaccine.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'id=' + id
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast(data.message, 'success');
                fetchVaccines();
            } else {
                showToast(data.message || 'Failed to delete vaccine', 'error');
            }
        })
        .catch(function() {
            showToast('Error connecting to server', 'error');
        });
    }

    // ========================================
    // ADD VACCINE BUTTON
    // ========================================
    document.getElementById('addVaccineBtn')?.addEventListener('click', function() {
        openAddEditVaccineModal();
    });

    // ========================================
    // CLOSE VACCINE MODAL
    // ========================================
    document.querySelectorAll('.close-vaccine-modal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            closeModal(document.getElementById('addEditVaccineModal'));
        });
    });

    // ========================================
    // SUBMIT ADD/EDIT VACCINE FORM
    // ========================================
    document.getElementById('addEditVaccineForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        var id = document.getElementById('editVaccineId').value;
        var name = document.getElementById('vaccineName').value.trim();
        var description = document.getElementById('vaccineDescription').value.trim();
        var dosesRequired = document.getElementById('vaccineDoses').value;

        if (!name) {
            showToast('Vaccine name is required', 'error');
            return;
        }

        var submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        var url = id ? 'ajax/update_vaccine.php' : 'ajax/add_vaccine.php';
        var data = new URLSearchParams({
            id: id,
            name: name,
            description: description,
            doses_required: dosesRequired
        }).toString();

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast(data.message, 'success');
                closeModal(document.getElementById('addEditVaccineModal'));
                fetchVaccines();
            } else {
                showToast(data.message || 'Failed to save vaccine', 'error');
            }
            submitBtn.disabled = false;
            submitBtn.textContent = id ? 'Update Vaccine' : 'Save Vaccine';
        })
        .catch(function() {
            showToast('Error connecting to server', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = id ? 'Update Vaccine' : 'Save Vaccine';
        });
    });

    // ========================================
    // EXPOSE FUNCTIONS TO GLOBAL SCOPE
    // ========================================
    window.loadVaccineDropdowns = loadVaccineDropdowns;
    window.loadVaccineManagement = loadVaccineManagement;

})();