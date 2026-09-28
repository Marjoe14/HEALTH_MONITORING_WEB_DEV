// ========================================
// BHW RESIDENTS - Resident CRUD & Management
// ========================================

// ========================================
// ADULT DOB - Auto Age
// ========================================
function initAdultAgeCalculation() {
    const adultDob = document.getElementById('adultDob');
    const adultAge = document.getElementById('adultAge');

    if (adultDob) {
        adultDob.addEventListener('change', function() {
            if (this.value) {
                const age = calculateAge(this.value);
                if (adultAge) {
                    adultAge.value = age !== '—' ? age : '';
                }
            }
        });
    }
}

// ========================================
// CHILD DOB - Auto Age
// ========================================
function initChildAgeCalculation() {
    const childDob = document.getElementById('childDob');
    const childAge = document.getElementById('childAge');

    if (childDob) {
        childDob.addEventListener('change', function() {
            if (this.value) {
                const age = calculateAge(this.value);
                if (childAge) {
                    childAge.value = age !== '—' ? age : '';
                }
            }
        });
    }
}

// ========================================
// ADD ADULT RESIDENT
// ========================================
function initAddAdultButton() {
    if (!addAdultBtn) return;

    addAdultBtn.addEventListener('click', function() {
        addAdultForm.reset();
        const adultAge = document.getElementById('adultAge');
        if (adultAge) adultAge.value = '';
        delete addAdultForm.dataset.editId;
        delete addAdultForm.dataset.mode;
        const submitBtn = addAdultForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Save Adult Resident';
        submitBtn.disabled = false;
        openModal(addAdultModal);
    });
}

// ========================================
// ADULT FORM SUBMIT
// ========================================
function initAddAdultForm() {
    if (!addAdultForm) return;

    addAdultForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const mode = this.dataset.mode || 'add';
        const editId = this.dataset.editId || null;

        const firstName = document.getElementById('adultFirstName').value.toUpperCase().trim();
        const middleName = document.getElementById('adultMiddleName').value.toUpperCase().trim();
        const lastName = document.getElementById('adultLastName').value.toUpperCase().trim();
        const dob = document.getElementById('adultDob').value;
        const sex = document.getElementById('adultSex').value;
        const purok = document.getElementById('adultPurok').value;
        const address = document.getElementById('adultAddress').value.toUpperCase().trim();
        const mobile = document.getElementById('adultMobile').value.trim();
        const household = document.getElementById('adultHousehold').value.toUpperCase().trim();
        const emergencyContact = document.getElementById('adultEmergencyContact').value.toUpperCase().trim();
        const emergencyNumber = document.getElementById('adultEmergencyNumber').value.trim();
        const medicalHistory = document.getElementById('adultMedicalHistory').value.toUpperCase().trim();

        if (!firstName || !lastName || !dob || !sex || !purok) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        const age = calculateAge(dob);

        if (age !== '—' && isMinor(age)) {
            showToast('This resident is under 18. Please use "Add Child" option.', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const residentData = {
            first_name: firstName,
            middle_name: middleName || '—',
            last_name: lastName,
            dob: dob,
            age: age,
            sex: sex,
            purok: purok,
            address: address || '—',
            mobile: mobile || '—',
            household: household || '—',
            emergency_contact: emergencyContact || '—',
            emergency_number: emergencyNumber || '—',
            medical_history: medicalHistory || '—'
        };

        let url = 'ajax/add_resident.php';
        if (mode === 'edit' && editId) {
            url = 'ajax/update_resident.php';
            residentData.id = editId;
        }

        const data = new URLSearchParams(residentData).toString();
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast(mode === 'edit' ? 'Resident updated successfully!' : 'Adult resident added successfully!', 'success');
                closeModal(addAdultModal);
                addAdultForm.reset();
                const adultAge = document.getElementById('adultAge');
                if (adultAge) adultAge.value = '';
                delete addAdultForm.dataset.editId;
                delete addAdultForm.dataset.mode;
                submitBtn.textContent = 'Save Adult Resident';
                submitBtn.disabled = false;
                fetchAllRecords();
            } else {
                showToast(data.message || (mode === 'edit' ? 'Update failed.' : 'Add failed.'), 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = mode === 'edit' ? 'Update Resident' : 'Save Adult Resident';
            }
        })
        .catch(function() {
            showToast('Error connecting to server.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = mode === 'edit' ? 'Update Resident' : 'Save Adult Resident';
        });
    });
}

// ========================================
// ADD CHILD BUTTON
// ========================================
function initAddChildButton() {
    if (!addChildBtn) return;

    addChildBtn.addEventListener('click', function() {
        clearChildParentFields();
        addChildForm.reset();
        const childAge = document.getElementById('childAge');
        if (childAge) childAge.value = '';
        if (selectedParentDisplay) selectedParentDisplay.style.display = 'none';
        if (saveChildBtn) saveChildBtn.disabled = true;
        if (relationshipGroup) relationshipGroup.style.display = 'none';
        if (relationshipSelect) relationshipSelect.value = '';
        delete addChildForm.dataset.mode;
        delete addChildForm.dataset.editId;
        const submitBtn = addChildForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Save Child Resident';
        submitBtn.disabled = false;
        openModal(addChildModal);
    });
}

// ========================================
// CLEAR CHILD PARENT FIELDS
// ========================================
function clearChildParentFields() {
    if (childParentSearch) childParentSearch.value = '';
    if (childSelectedParentId) childSelectedParentId.value = '';
    if (childParentSearchResults) {
        childParentSearchResults.style.display = 'none';
        childParentSearchResults.innerHTML = '';
    }
    if (selectedParentDisplay) selectedParentDisplay.style.display = 'none';
    if (selectedParentName) selectedParentName.textContent = '';
    if (selectedParentDetails) selectedParentDetails.textContent = '';
    if (saveChildBtn) saveChildBtn.disabled = true;
    if (relationshipGroup) relationshipGroup.style.display = 'none';
    if (relationshipSelect) relationshipSelect.value = '';
}

// ========================================
// PARENT SEARCH
// ========================================
function initParentSearch() {
    if (childSearchParentBtn) {
        childSearchParentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            performParentSearch();
        });
    }

    if (childParentSearch) {
        childParentSearch.addEventListener('input', function() {
            const searchTerm = this.value.toUpperCase().trim();
            if (searchTerm.length >= 2) {
                if (childSearchParentBtn) {
                    childSearchParentBtn.click();
                }
            } else if (searchTerm.length === 0) {
                childParentSearchResults.style.display = 'none';
                childParentSearchResults.innerHTML = '';
            }
        });

        childParentSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (childSearchParentBtn) {
                    childSearchParentBtn.click();
                }
            }
        });
    }

    if (childClearParentSearch) {
        childClearParentSearch.addEventListener('click', function() {
            clearChildParentFields();
        });
    }

    if (changeParentBtn) {
        changeParentBtn.addEventListener('click', function() {
            clearChildParentFields();
            if (childParentSearch) childParentSearch.focus();
            if (relationshipGroup) relationshipGroup.style.display = 'none';
        });
    }

    // Select parent from search results
    document.addEventListener('click', function(e) {
        if (e.target.closest('.parent-result')) {
            const btn = e.target.closest('.parent-result');
            const parentId = parseInt(btn.dataset.id);
            const parent = residents.find(function(r) { return r.id === parentId; });
            if (parent) {
                childSelectedParentId.value = parentId;
                childParentSearch.value = parent.fullName;

                if (selectedParentName) selectedParentName.textContent = parent.fullName;
                if (selectedParentDetails) {
                    selectedParentDetails.textContent = (parent.age_display || parent.age) + ' · ' + parent.purok + ' · ' + (parent.sex || 'N/A') + ' · ' + (parent.account_status || 'No Account');
                }
                if (selectedParentDisplay) selectedParentDisplay.style.display = 'flex';
                if (saveChildBtn) saveChildBtn.disabled = false;

                if (relationshipGroup) relationshipGroup.style.display = 'block';
                if (relationshipSelect) relationshipSelect.value = '';

                childParentSearchResults.style.display = 'none';
                childParentSearchResults.innerHTML = '';

                showToast('Parent selected: ' + parent.fullName, 'success');
            }
        }
    });
}

function performParentSearch() {
    const searchTerm = childParentSearch.value.toUpperCase().trim();
    if (!searchTerm) {
        showToast('Please enter a parent name to search.', 'error');
        return;
    }

    const results = residents.filter(function(r) {
        const ageNum = parseInt(r.age);
        const fullNameUpper = (r.fullName || '').toUpperCase();
        const firstNameUpper = (r.firstName || '').toUpperCase();
        const lastNameUpper = (r.lastName || '').toUpperCase();

        return !isNaN(ageNum) && ageNum >= 18 &&
            (fullNameUpper.includes(searchTerm) ||
             firstNameUpper.includes(searchTerm) ||
             lastNameUpper.includes(searchTerm));
    });

    if (results.length === 0) {
        childParentSearchResults.innerHTML = `
            <div class="parent-search-empty">
                <i class="fas fa-user-slash"></i>
                <span>No existing parent found matching "${searchTerm}".</span>
                <small>Only residents 18 years or older can be selected as parents.</small>
            </div>
        `;
        childParentSearchResults.style.display = 'block';
    } else {
        childParentSearchResults.innerHTML = results.map(function(r) {
            const childCount = getChildren(r.id).length;
            const accountStatus = r.account_status || 'No Account';
            return `
                <button type="button" class="parent-result" data-id="${r.id}">
                    <div class="parent-result-info">
                        <strong>${r.fullName}</strong>
                        <span class="parent-result-details">
                            ${r.age_display || r.age} · ${r.purok} · ${r.sex || 'N/A'} · ${accountStatus}
                            ${childCount > 0 ? ' · 👨‍👩‍👧‍👦 ' + childCount + ' child(ren)' : ''}
                        </span>
                    </div>
                    <span class="parent-result-select"><i class="fas fa-check-circle"></i> Select</span>
                </button>
            `;
        }).join('');
        childParentSearchResults.style.display = 'block';
    }
}

// ========================================
// CHILD FORM SUBMIT
// ========================================
function initAddChildForm() {
    if (!addChildForm) return;

    addChildForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const mode = this.dataset.mode || 'add';
        const editId = this.dataset.editId || null;

        const firstName = document.getElementById('childFirstName').value.toUpperCase().trim();
        const middleName = document.getElementById('childMiddleName').value.toUpperCase().trim();
        const lastName = document.getElementById('childLastName').value.toUpperCase().trim();
        const dob = document.getElementById('childDob').value;
        const sex = document.getElementById('childSex').value;
        const purok = document.getElementById('childPurok').value;
        const address = document.getElementById('childAddress').value.toUpperCase().trim();

        if (!firstName || !lastName || !dob || !sex || !purok) {
            showToast('Please fill in all child required fields.', 'error');
            return;
        }

        const age = calculateAge(dob);

        if (age !== '—' && !isMinor(age)) {
            showToast('This resident is 18 or older. Please use "Add Adult" option.', 'error');
            return;
        }

        const parentId = childSelectedParentId.value;

        if (!parentId) {
            showToast('Please search and select a parent/guardian first.', 'error');
            return;
        }

        const relationship = relationshipSelect ? relationshipSelect.value : '';
        if (!relationship) {
            showToast('Please select the relationship to the child.', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const childData = {
            first_name: firstName,
            middle_name: middleName || '—',
            last_name: lastName,
            dob: dob,
            sex: sex,
            purok: purok,
            address: address || '—',
            parent_id: parentId,
            relationship: relationship
        };

        let url = 'ajax/add_child.php';
        if (mode === 'edit' && editId) {
            url = 'ajax/update_child.php';
            childData.id = editId;
        }

        const data = new URLSearchParams(childData).toString();
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast(mode === 'edit' ? 'Child updated successfully!' : 'Child added successfully!', 'success');

                clearChildParentFields();
                addChildForm.reset();
                const childAge = document.getElementById('childAge');
                if (childAge) childAge.value = '';
                if (selectedParentDisplay) selectedParentDisplay.style.display = 'none';
                if (saveChildBtn) saveChildBtn.disabled = true;
                if (relationshipGroup) relationshipGroup.style.display = 'none';
                delete addChildForm.dataset.mode;
                delete addChildForm.dataset.editId;
                const submitBtnReset = addChildForm.querySelector('button[type="submit"]');
                submitBtnReset.textContent = 'Save Child Resident';
                submitBtnReset.disabled = false;

                closeModal(addChildModal);
                fetchAllRecords();
            } else {
                showToast(data.message || (mode === 'edit' ? 'Update failed.' : 'Add child failed.'), 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = mode === 'edit' ? 'Update Child' : 'Save Child Resident';
            }
        })
        .catch(function() {
            showToast('Error connecting to server.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = mode === 'edit' ? 'Update Child' : 'Save Child Resident';
        });
    });
}

// ========================================
// VIEW RESIDENT DETAIL
// ========================================
function viewResidentDetail(residentId) {
    const resident = residents.find(function(r) { return r.id === residentId; });
    if (!resident) {
        showToast('Resident not found.', 'error');
        return;
    }

    const children = getChildren(resident.id);
    const parent = getParent(resident.id);

    let bmiRecordsForResident = bmiRecords.filter(function(r) { return r.residentId === resident.id; });
    let prenatalRecordsForResident = prenatalRecords.filter(function(r) { return r.residentId === resident.id; });
    let immunizationRecordsForResident = immunizationRecords.filter(function(r) { return r.residentId === resident.id; });
    let optRecordsForResident = optRecords.filter(function(r) { return r.residentId === resident.id; });

    const isParent = !resident.isMinor && children.length > 0;
    const isChild = resident.isMinor;
    const isFemale = resident.sex === 'Female';
    const ageNum = parseInt(resident.age);

    let html = `
        <div class="resident-detail">
            <div class="detail-header">
                <div class="detail-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="detail-name">
                    <h2>${resident.fullName}</h2>
                    <span class="detail-type status-badge ${resident.type.toLowerCase()}">${resident.type}</span>
                    <span class="detail-type status-badge ${resident.isMinor ? 'child' : 'active'}" style="margin-left: 8px;">
                        ${resident.account_status || 'No Account'}
                    </span>
                </div>
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Age</span>
                    <span class="detail-value">${resident.age_display || resident.age}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Sex</span>
                    <span class="detail-value">${resident.sex || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Purok</span>
                    <span class="detail-value">${resident.purok || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Mobile</span>
                    <span class="detail-value">${resident.mobile || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Address</span>
                    <span class="detail-value">${resident.address || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Household</span>
                    <span class="detail-value">${resident.household || '—'}</span>
                </div>
            </div>
    `;

    if (isChild) {
        html += `
            <div class="detail-section">
                <h4><i class="fas fa-user-tie"></i> Parent/Guardian Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Name</span>
                        <span class="detail-value">${resident.parentName || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Contact</span>
                        <span class="detail-value">${resident.parentContact || '—'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Relationship</span>
                        <span class="detail-value">${resident.relationship || '—'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    if (isParent) {
        html += `
            <div class="detail-section">
                <h4><i class="fas fa-child"></i> Children (${children.length})</h4>
                <div class="children-list">
                    ${children.map(function(child) {
                        return `
                            <div class="child-item">
                                <span class="child-name">${child.fullName}</span>
                                <span class="child-details">${child.age_display || child.age} · ${child.sex} · ${child.purok}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    html += `
        <div class="detail-section">
            <h4><i class="fas fa-weight"></i> BMI Records</h4>
            ${bmiRecordsForResident.length === 0 ? `
                <p class="detail-empty">No BMI records found for this resident.</p>
            ` : `
                <div class="table-responsive">
                    <table class="records-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Height (cm)</th>
                                <th>Weight (kg)</th>
                                <th>BMI</th>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bmiRecordsForResident.map(function(r) {
                                const statusClass = r.category ? r.category.toLowerCase() : 'normal';
                                return `
                                    <tr>
                                        <td>${r.date || '—'}</td>
                                        <td>${r.height || '—'}</td>
                                        <td>${r.weight || '—'}</td>
                                        <td><strong>${r.bmi || '—'}</strong></td>
                                        <td><span class="status-badge ${statusClass}">${r.category || 'Normal'}</span></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;

    if (isFemale && ageNum >= 13 && ageNum <= 49) {
        html += `
            <div class="detail-section">
                <h4><i class="fas fa-baby-carriage"></i> Prenatal Records</h4>
                ${prenatalRecordsForResident.length === 0 ? `
                    <p class="detail-empty">No prenatal records found for this resident.</p>
                ` : `
                    <div class="table-responsive">
                        <table class="records-table">
                            <thead>
                                <tr>
                                    <th>LMP</th>
                                    <th>Due Date</th>
                                    <th>Gestational Age</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${prenatalRecordsForResident.map(function(r) {
                                    const statusClass = r.status ? r.status.toLowerCase() : 'active';
                                    return `
                                        <tr>
                                            <td>${r.lmp || '—'}</td>
                                            <td>${r.dueDate || '—'}</td>
                                            <td>${r.gestationalAge || '—'} weeks</td>
                                            <td><span class="status-badge ${statusClass}">${r.status || 'Active'}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    }

    if (isChild) {
        html += `
            <div class="detail-section">
                <h4><i class="fas fa-syringe"></i> Immunization Records</h4>
                ${immunizationRecordsForResident.length === 0 ? `
                    <p class="detail-empty">No immunization records found for this child.</p>
                ` : `
                    <div class="table-responsive">
                        <table class="records-table">
                            <thead>
                                <tr>
                                    <th>Vaccine</th>
                                    <th>Dose</th>
                                    <th>Date Administered</th>
                                    <th>Next Dose</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${immunizationRecordsForResident.map(function(r) {
                                    const statusClass = r.status ? r.status.toLowerCase() : 'upcoming';
                                    return `
                                        <tr>
                                            <td>${r.vaccine || '—'}</td>
                                            <td>${r.dose || '—'}</td>
                                            <td>${r.date_administered || '—'}</td>
                                            <td>${r.next_dose || '—'}</td>
                                            <td><span class="status-badge ${statusClass}">${r.status || 'Upcoming'}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    }

    if (isChild) {
        html += `
            <div class="detail-section">
                <h4><i class="fas fa-child"></i> Operation Timbang (OPT) Records</h4>
                ${optRecordsForResident.length === 0 ? `
                    <p class="detail-empty">No OPT records found for this child.</p>
                ` : `
                    <div class="table-responsive">
                        <table class="records-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Weight (kg)</th>
                                    <th>Height (cm)</th>
                                    <th>Nutritional Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${optRecordsForResident.map(function(r) {
                                    const statusClass = r.nutritionalStatus ? r.nutritionalStatus.toLowerCase() : 'normal';
                                    return `
                                        <tr>
                                            <td>${r.date || '—'}</td>
                                            <td>${r.weight || '—'}</td>
                                            <td>${r.height || '—'}</td>
                                            <td><span class="status-badge ${statusClass}">${r.nutritionalStatus || 'Normal'}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    }

    html += `
        <div class="detail-section">
            <h4><i class="fas fa-notes-medical"></i> Medical History</h4>
            <p class="detail-medical">${resident.medicalHistory || 'No medical history recorded.'}</p>
        </div>
    </div>
    `;

    document.getElementById('residentDetailContent').innerHTML = html;
    openModal(viewResidentModal);
}

// ========================================
// EDIT RESIDENT
// ========================================
function editResident(residentId) {
    const resident = residents.find(function(r) { return r.id === residentId; });
    if (!resident) {
        showToast('Resident not found.', 'error');
        return;
    }

    const ageNum = parseInt(resident.age);
    if (!isNaN(ageNum) && ageNum < 18) {
        if (document.getElementById('editChildModal')) {
            openEditChildModal(resident);
            return;
        } else {
            showToast('Editing children is not yet implemented. Please use the adult form.', 'info');
            return;
        }
    }

    document.getElementById('adultFirstName').value = resident.firstName;
    document.getElementById('adultMiddleName').value = resident.middleName !== '—' ? resident.middleName : '';
    document.getElementById('adultLastName').value = resident.lastName;
    document.getElementById('adultDob').value = resident.dob || '';
    document.getElementById('adultSex').value = resident.sex;
    document.getElementById('adultPurok').value = resident.purok;
    document.getElementById('adultAddress').value = resident.address !== '—' ? resident.address : '';
    document.getElementById('adultMobile').value = resident.mobile !== '—' ? resident.mobile : '';
    document.getElementById('adultHousehold').value = resident.household !== '—' ? resident.household : '';
    document.getElementById('adultEmergencyContact').value = resident.emergencyContact !== '—' ? resident.emergencyContact : '';
    document.getElementById('adultEmergencyNumber').value = resident.emergencyNumber !== '—' ? resident.emergencyNumber : '';
    document.getElementById('adultMedicalHistory').value = resident.medicalHistory !== '—' ? resident.medicalHistory : '';
    document.getElementById('adultAge').value = resident.age !== '—' ? resident.age : '';

    const form = document.getElementById('addAdultForm');
    form.dataset.editId = residentId;
    form.dataset.mode = 'edit';

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Update Resident';
    submitBtn.disabled = false;

    openModal(addAdultModal);
}

// ========================================
// DELETE RESIDENT
// ========================================
function deleteResident(residentId) {
    if (!confirm('⚠️ Are you sure you want to delete this resident?\n\nThis action cannot be undone and will also remove:\n• All health records (BMI, Prenatal, Immunization, OPT)\n• All appointments\n• Associated user account')) {
        return;
    }

    fetch('ajax/delete_resident.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + residentId
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            fetchAllRecords();
            showToast(data.message || 'Resident and all associated records deleted successfully!', 'success');
        } else {
            showToast(data.message || 'Delete failed.', 'error');
        }
    })
    .catch(function() {
        showToast('Error connecting to server.', 'error');
    });
}

// ========================================
// RENDER RESIDENTS
// ========================================
function renderResidents() {
    const tbody = document.getElementById('residentTableBody');
    const resultsCount = document.getElementById('residentResults');

    if (!tbody) return;

    if (residents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <span>No residents registered yet</span>
                    <p class="empty-sub">Click "Add Adult" or "Add Child" to start building your community health records.</p>
                </td>
            </tr>
        `;
        if (resultsCount) resultsCount.textContent = '0 residents';
        return;
    }

    tbody.innerHTML = residents.map(function(r) {
        const ageDisplay = r.age_display || r.age || '—';
        const type = r.type || getResidentType(r.age);
        let accountStatus = r.account_status || 'No Account';
        let statusBadge = accountStatus === 'Has Account' ? 'active' : 'inactive';

        return `
            <tr>
                <td><strong>${r.fullName || r.firstName + ' ' + r.lastName}</strong></td>
                <td>${r.purok || '—'}</td>
                <td>${ageDisplay}</td>
                <td>${r.sex || '—'}</td>
                <td><span class="status-badge ${type.toLowerCase()}">${type}</span></td>
                <td><span class="status-badge ${statusBadge}">${accountStatus}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm view-resident" data-id="${r.id}">View</button>
                    <button class="btn btn-outline btn-sm edit-resident-btn" data-id="${r.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-resident-btn" data-id="${r.id}">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    if (resultsCount) resultsCount.textContent = residents.length + ' residents';

    document.querySelectorAll('.view-resident').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            viewResidentDetail(id);
        });
    });

    document.querySelectorAll('.edit-resident-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            editResident(id);
        });
    });

    document.querySelectorAll('.delete-resident-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            deleteResident(id);
        });
    });
}

// ========================================
// FILTER RESIDENTS
// ========================================
function filterResidents() {
    const searchTerm = residentSearch ? residentSearch.value.toLowerCase().trim() : '';
    const typeVal = residentTypeFilter ? residentTypeFilter.value : '';
    const purokVal = purokFilter ? purokFilter.value : '';
    const ageVal = ageFilter ? ageFilter.value : '';

    const rows = document.querySelectorAll('#residentTableBody tr:not(.empty-state)');
    let visibleCount = 0;

    rows.forEach(function(row) {
        const name = row.querySelector('td:first-child')?.textContent?.toLowerCase() || '';
        const purok = row.querySelector('td:nth-child(2)')?.textContent || '';
        const ageText = row.querySelector('td:nth-child(3)')?.textContent || '';
        const ageMatch = ageText.match(/(\d+)/);
        const age = ageMatch ? parseInt(ageMatch[1]) : 0;
        const type = row.querySelector('td:nth-child(5)')?.textContent?.toLowerCase() || '';

        let show = true;

        if (searchTerm && !name.includes(searchTerm) && !purok.toLowerCase().includes(searchTerm)) {
            show = false;
        }

        if (typeVal && type !== typeVal) {
            show = false;
        }

        if (purokVal && purok !== purokVal) {
            show = false;
        }

        if (ageVal) {
            const ageRanges = {
                '0-5': age >= 0 && age <= 5,
                '6-12': age >= 6 && age <= 12,
                '13-17': age >= 13 && age <= 17,
                '18-30': age >= 18 && age <= 30,
                '31-45': age >= 31 && age <= 45,
                '46-59': age >= 46 && age <= 59,
                '60+': age >= 60
            };
            if (!ageRanges[ageVal]) {
                show = false;
            }
        }

        row.style.display = show ? '' : 'none';
        if (show) visibleCount++;
    });

    const resultsCount = document.getElementById('residentResults');
    if (resultsCount) {
        resultsCount.textContent = visibleCount + ' residents';
    }
}

// ========================================
// INIT RESIDENT FILTER EVENTS
// ========================================
function initResidentFilterEvents() {
    if (residentSearch) {
        residentSearch.addEventListener('input', filterResidents);
    }

    if (residentTypeFilter) {
        residentTypeFilter.addEventListener('change', filterResidents);
    }

    if (purokFilter) {
        purokFilter.addEventListener('change', filterResidents);
    }

    if (ageFilter) {
        ageFilter.addEventListener('change', filterResidents);
    }

    if (clearFilters) {
        clearFilters.addEventListener('click', function() {
            if (residentSearch) residentSearch.value = '';
            if (residentTypeFilter) residentTypeFilter.value = '';
            if (purokFilter) purokFilter.value = '';
            if (ageFilter) ageFilter.value = '';
            filterResidents();
        });
    }
}