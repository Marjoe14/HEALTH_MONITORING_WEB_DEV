// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// BHW DASHBOARD - JavaScript (FULLY FIXED)
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========================================
    // DOM REFS
    // ========================================
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const pageSections = document.querySelectorAll('.page-section');
    const pageTitle = document.getElementById('pageTitle');
    const globalSearch = document.getElementById('globalSearch');
    const residentSearch = document.getElementById('residentSearch');
    const residentTypeFilter = document.getElementById('residentTypeFilter');
    const purokFilter = document.getElementById('purokFilter');
    const ageFilter = document.getElementById('ageFilter');
    const clearFilters = document.getElementById('clearFilters');

// Modals
const addAdultModal = document.getElementById('addAdultModal');
const addChildModal = document.getElementById('addChildModal');
const recordBmiModal = document.getElementById('recordBmiModal');
const recordImmunizationModal = document.getElementById('recordImmunizationModal');
const editImmunizationModal = document.getElementById('editImmunizationModal');
const addPrenatalModal = document.getElementById('addPrenatalModal');
const editPrenatalModal = document.getElementById('editPrenatalModal');
const addOptModal = document.getElementById('addOptModal');
const editOptModal = document.getElementById('editOptModal');
const addAppointmentModal = document.getElementById('addAppointmentModal');
const editAppointmentModal = document.getElementById('editAppointmentModal'); // ← ADD THIS
const viewResidentModal = document.getElementById('viewResidentModal');

// Forms
const addAdultForm = document.getElementById('addAdultForm');
const addChildForm = document.getElementById('addChildForm');
const recordBmiForm = document.getElementById('recordBmiForm');
const recordImmunizationForm = document.getElementById('recordImmunizationForm');
const editImmunizationForm = document.getElementById('editImmunizationForm');
const addPrenatalForm = document.getElementById('addPrenatalForm');
const addOptForm = document.getElementById('addOptForm');
const editOptForm = document.getElementById('editOptForm');
const addAppointmentForm = document.getElementById('addAppointmentForm');
const editAppointmentForm = document.getElementById('editAppointmentForm'); // ← ADD THIS

    // Buttons
    const addAdultBtn = document.getElementById('addAdultBtn');
    const addChildBtn = document.getElementById('addChildBtn');
    const addBmiBtn = document.getElementById('addBmiBtn');
    const addPrenatalBtn = document.getElementById('addPrenatalBtn');
    const addImmunizationBtn = document.getElementById('addImmunizationBtn');
    const addOptBtn = document.getElementById('addOptBtn');
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    const sendSmsBtn = document.getElementById('sendSmsBtn');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    // Child Parent fields
    const childParentSearch = document.getElementById('childParentSearch');
    const childSearchParentBtn = document.getElementById('childSearchParentBtn');
    const childClearParentSearch = document.getElementById('childClearParentSearch');
    const childParentSearchResults = document.getElementById('childParentSearchResults');
    const childSelectedParentId = document.getElementById('childSelectedParentId');
    const selectedParentDisplay = document.getElementById('selectedParentDisplay');
    const selectedParentName = document.getElementById('selectedParentName');
    const selectedParentDetails = document.getElementById('selectedParentDetails');
    const changeParentBtn = document.getElementById('changeParentBtn');
    const saveChildBtn = document.getElementById('saveChildBtn');
    const relationshipGroup = document.getElementById('relationshipGroup');
    const relationshipSelect = document.getElementById('childParentRelationship');

    // SMS
    const smsRecipient = document.getElementById('smsRecipient');
    const smsSpecificResident = document.getElementById('smsSpecificResident');
    const smsTemplate = document.getElementById('smsTemplate');
    const smsMessage = document.getElementById('smsMessage');
    const charCount = document.getElementById('charCount');

    // OPT fields
    const optWeightInput = document.getElementById('optWeight');
    const optHeightInput = document.getElementById('optHeight');
    const optChildSelect = document.getElementById('optChild');
    const optStatusSelect = document.getElementById('optNutritionalStatus');

    // ========================================
    // STATE
    // ========================================
    let currentPage = 'dashboard';
    let residents = [];
    let bmiRecords = [];
    let prenatalRecords = [];
    let immunizationRecords = [];
    let optRecords = [];
    let appointments = [];
    let smsHistory = [];
    let currentId = 1;

    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    function calculateAge(dob) {
        if (!dob) return '—';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function isMinor(age) {
        return age !== '—' && age < 18;
    }

    function getResidentType(age) {
        if (age === '—') return 'Unknown';
        if (age < 18) return 'Child';
        if (age >= 60) return 'Elderly';
        return 'Adult';
    }

    function getChildren(residentId) {
        return residents.filter(function(r) {
            return r.parentId === residentId;
        });
    }

    function getParent(residentId) {
        const resident = residents.find(function(r) { return r.id === residentId; });
        if (resident && resident.parentId) {
            return residents.find(function(r) { return r.id === resident.parentId; });
        }
        return null;
    }
    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    function calculateAge(dob) {
        if (!dob) return '—';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function isMinor(age) {
        return age !== '—' && age < 18;
    }

    function getResidentType(age) {
        if (age === '—') return 'Unknown';
        if (age < 18) return 'Child';
        if (age >= 60) return 'Elderly';
        return 'Adult';
    }

    function getChildren(residentId) {
        return residents.filter(function(r) {
            return r.parentId === residentId;
        });
    }

    function getParent(residentId) {
        const resident = residents.find(function(r) { return r.id === residentId; });
        if (resident && resident.parentId) {
            return residents.find(function(r) { return r.id === resident.parentId; });
        }
        return null;
    }

    // ========================================
    // GET TIME AGO (FOR CANCELLATION REQUESTS)
    // ========================================
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
        'residents': 'Residents',
        'bmi': 'BMI Assessment',
        'prenatal': 'Prenatal Care',
        'immunization': 'Immunization',
        'vaccine-management': 'Vaccine Management',
        'opt': 'Operation Timbang',
        'appointments': 'Appointments',
        'notifications': 'Notifications',
        'sms': 'SMS Notifications',
        'reports': 'Reports',
        'settings': 'Settings'
    };
    pageTitle.textContent = pageNames[page] || 'Dashboard';

    currentPage = page;

    if (page === 'bmi') renderBmi();
    if (page === 'prenatal') renderPrenatal();
    if (page === 'immunization') renderImmunization();
    if (page === 'vaccine-management') {
    if (typeof loadVaccineManagement === 'function') {
        loadVaccineManagement();
    }
}
    if (page === 'opt') renderOpt();
    if (page === 'appointments') {
        renderAppointments();
        fetchPendingCancellations();
    }
    if (page === 'sms') populateSmsResidents();
    if (page === 'notifications') {
        fetchBhwNotifications();
    }
}

    navItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            navigateTo(page);
        });
    });

    // Quick actions navigation
    document.querySelectorAll('.quick-action').forEach(function(action) {
        action.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            const actionType = this.dataset.action;
            if (page === 'residents') {
                navigateTo('residents');
                if (actionType === 'adult') {
                    openModal(addAdultModal);
                } else if (actionType === 'child') {
                    clearChildParentFields();
                    openModal(addChildModal);
                }
            } else if (page) {
                navigateTo(page);
                if (page === 'bmi') openModal(recordBmiModal);
                if (page === 'immunization') {
                    populateImmunizationChildren();
                    openModal(recordImmunizationModal);
                }
                if (page === 'prenatal') {
                    populatePrenatalResidents();
                    openModal(addPrenatalModal);
                }
                if (page === 'opt') {
                    populateOptChildren();
                    openModal(addOptModal);
                }
            }
        });
    });

    document.querySelectorAll('.view-all').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });

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

    closeModalBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.show').forEach(function(modal) {
                closeModal(modal);
            });
        }
    });

    // ========================================
    // TOAST NOTIFICATION
    // ========================================
    function showToast(message, type) {
        type = type || 'info';
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification toast-' + type;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;
        document.body.appendChild(toast);

        setTimeout(function() {
            toast.classList.add('show');
        }, 10);

        const timeoutId = setTimeout(function() {
            toast.classList.remove('show');
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, 4000);

        toast.querySelector('.toast-close').addEventListener('click', function() {
            clearTimeout(timeoutId);
            toast.classList.remove('show');
            setTimeout(function() {
                toast.remove();
            }, 300);
        });

        toast.addEventListener('click', function(e) {
            if (e.target === toast) {
                clearTimeout(timeoutId);
                toast.classList.remove('show');
                setTimeout(function() {
                    toast.remove();
                }, 300);
            }
        });
    }
    // ========================================
// FETCH DASHBOARD DATA
// ========================================
function fetchDashboardData() {
    console.log('📊 Fetching dashboard data...');
    
    fetch('ajax/get_dashboard_data.php')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            console.log('📦 Dashboard data:', data);
            
            if (data.success) {
                // Update stats
                document.getElementById('totalResidents').textContent = data.total_residents || 0;
                document.getElementById('pregnantCount').textContent = data.pregnant_count || 0;
                document.getElementById('immunizationDue').textContent = data.immunization_due || 0;
                document.getElementById('todayAppointments').textContent = data.count || 0;
                
                // Render today's appointments
                renderTodayAppointments(data.today_appointments || []);
            }
        })
        .catch(function(error) {
            console.log('❌ Error fetching dashboard data:', error);
        });
}

// ========================================
// RENDER TODAY'S APPOINTMENTS
// ========================================
function renderTodayAppointments(appointments) {
    const tbody = document.getElementById('todayAppointmentsBody');
    if (!tbody) return;

    if (!appointments || appointments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <span>No appointments scheduled for today</span>
                    <p class="empty-sub">Schedule appointments to keep track of your visits.</p>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    appointments.forEach(function(app) {
        const statusClass = app.status ? app.status.toLowerCase() : 'upcoming';
        const timeDisplay = app.appointment_time || '—';
        
        html += `
            <tr>
                <td>${timeDisplay}</td>
                <td><strong>${app.resident_name || 'Unknown'}</strong></td>
                <td>${app.type || 'General Check-up'}</td>
                <td><span class="status-badge ${statusClass}">${app.status || 'Upcoming'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary view-today-appointment" data-id="${app.id}">
                        View
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    // Event listeners for view buttons
    document.querySelectorAll('.view-today-appointment').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(this.dataset.id);
            viewAppointment(id);
        });
    });
}
    // ========================================
    // ADULT DOB - Auto Age
    // ========================================
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

    // ========================================
    // CHILD DOB - Auto Age
    // ========================================
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

    // ========================================
    // ADD ADULT RESIDENT
    // ========================================
    if (addAdultBtn) {
        addAdultBtn.addEventListener('click', function() {
            addAdultForm.reset();
            adultAge.value = '';
            delete addAdultForm.dataset.editId;
            delete addAdultForm.dataset.mode;
            const submitBtn = addAdultForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Save Adult Resident';
            submitBtn.disabled = false;
            openModal(addAdultModal);
        });
    }

    if (addAdultForm) {
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
                    adultAge.value = '';
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
    // ADD CHILD RESIDENT
    // ========================================
    if (addChildBtn) {
        addChildBtn.addEventListener('click', function() {
            clearChildParentFields();
            addChildForm.reset();
            childAge.value = '';
            selectedParentDisplay.style.display = 'none';
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

    function clearChildParentFields() {
        childParentSearch.value = '';
        childSelectedParentId.value = '';
        childParentSearchResults.style.display = 'none';
        childParentSearchResults.innerHTML = '';
        if (selectedParentDisplay) selectedParentDisplay.style.display = 'none';
        if (selectedParentName) selectedParentName.textContent = '';
        if (selectedParentDetails) selectedParentDetails.textContent = '';
        if (saveChildBtn) saveChildBtn.disabled = true;
        if (relationshipGroup) relationshipGroup.style.display = 'none';
        if (relationshipSelect) relationshipSelect.value = '';
    }

    // ========================================
    // SEARCH EXISTING PARENT (Child Modal)
    // ========================================
    if (childSearchParentBtn) {
        childSearchParentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
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
        });
    }

    // Live search on input
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

    if (changeParentBtn) {
        changeParentBtn.addEventListener('click', function() {
            clearChildParentFields();
            if (childParentSearch) childParentSearch.focus();
            if (relationshipGroup) relationshipGroup.style.display = 'none';
        });
    }

    if (childClearParentSearch) {
        childClearParentSearch.addEventListener('click', function() {
            clearChildParentFields();
        });
    }

    // Submit Child Form
    if (addChildForm) {
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
                    childAge.value = '';
                    selectedParentDisplay.style.display = 'none';
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

        // BMI Records
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

        // Prenatal Records
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

        // Immunization Records
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

        // OPT Records
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

        // Medical History
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
    // DELETE RESIDENT - WITH CONFIRMATION
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
    // RECORD BMI
    // ========================================
    if (addBmiBtn) {
        addBmiBtn.addEventListener('click', function() {
            populateBmiResidents();
            recordBmiForm.reset();
            document.getElementById('bmiResultDisplay').style.display = 'none';
            const submitBtn = recordBmiForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Save BMI';
            submitBtn.disabled = false;
            openModal(recordBmiModal);
        });
    }

    function populateBmiResidents() {
        const select = document.getElementById('bmiResident');
        select.innerHTML = '<option value="">Select resident...</option>';
        residents.forEach(function(r) {
            const option = document.createElement('option');
            option.value = r.id;
            option.textContent = r.fullName + ' (' + r.purok + ', ' + (r.age_display || r.age) + ')';
            select.appendChild(option);
        });
    }

    const bmiHeight = document.getElementById('bmiHeight');
    const bmiWeight = document.getElementById('bmiWeight');

    function calculateBmi() {
        const height = parseFloat(bmiHeight.value);
        const weight = parseFloat(bmiWeight.value);
        const display = document.getElementById('bmiResultDisplay');

        if (height && weight && height > 0 && weight > 0) {
            const heightM = height / 100;
            const bmi = weight / (heightM * heightM);
            const bmiRounded = bmi.toFixed(1);

            let category = '';
            let categoryClass = '';
            if (bmi < 18.5) {
                category = 'Underweight';
                categoryClass = 'underweight';
            } else if (bmi < 25) {
                category = 'Normal';
                categoryClass = 'normal';
            } else if (bmi < 30) {
                category = 'Overweight';
                categoryClass = 'overweight';
            } else {
                category = 'Obese';
                categoryClass = 'obese';
            }

            document.getElementById('bmiResultNumber').textContent = bmiRounded;
            const catEl = document.getElementById('bmiResultCategory');
            catEl.textContent = category;
            catEl.className = 'bmi-category ' + categoryClass;

            display.style.display = 'block';
        } else {
            display.style.display = 'none';
        }
    }

    if (bmiHeight && bmiWeight) {
        bmiHeight.addEventListener('input', calculateBmi);
        bmiWeight.addEventListener('input', calculateBmi);
    }

    if (recordBmiForm) {
        recordBmiForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const residentId = parseInt(document.getElementById('bmiResident').value);
            const height = parseFloat(document.getElementById('bmiHeight').value);
            const weight = parseFloat(document.getElementById('bmiWeight').value);

            if (!residentId || !height || !weight) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            const heightM = height / 100;
            const bmi = weight / (heightM * heightM);
            const bmiRounded = parseFloat(bmi.toFixed(1));

            let category = '';
            if (bmi < 18.5) category = 'Underweight';
            else if (bmi < 25) category = 'Normal';
            else if (bmi < 30) category = 'Overweight';
            else category = 'Obese';

            const resident = residents.find(function(r) { return r.id === residentId; });
            const residentName = resident ? (resident.fullName || resident.firstName + ' ' + resident.lastName) : 'Unknown';

            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            const bmiData = {
                resident_id: residentId,
                height: height,
                weight: weight,
                bmi: bmiRounded,
                category: category,
                date: new Date().toISOString().split('T')[0]
            };

            fetch('ajax/add_bmi.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(bmiData).toString()
            })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    showToast('BMI recorded successfully!', 'success');
                    closeModal(recordBmiModal);
                    recordBmiForm.reset();
                    document.getElementById('bmiResultDisplay').style.display = 'none';
                    submitBtn.textContent = 'Save BMI';
                    submitBtn.disabled = false;
                    fetchAllRecords();
                } else {
                    showToast(data.message || 'BMI recording failed.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save BMI';
                }
            })
            .catch(function() {
                showToast('Error connecting to server.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save BMI';
            });
        });
    }

    function renderBmi() {
        const tbody = document.getElementById('bmiTableBody');
        const resultsCount = document.getElementById('bmiResults');
        const searchTerm = document.getElementById('bmiSearch') ? document.getElementById('bmiSearch').value.toLowerCase().trim() : '';
        const categoryFilter = document.getElementById('bmiCategoryFilter') ? document.getElementById('bmiCategoryFilter').value : '';

        let filtered = [...bmiRecords];

        if (searchTerm) {
            filtered = filtered.filter(function(r) {
                return r.residentName.toLowerCase().includes(searchTerm);
            });
        }

        if (categoryFilter) {
            filtered = filtered.filter(function(r) {
                return r.category === categoryFilter;
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-weight"></i>
                        <span>No BMI records found</span>
                        <p class="empty-sub">${bmiRecords.length === 0 ? 'Record BMI assessments to monitor residents\' nutritional status.' : 'Try adjusting your search filters.'}</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = filtered.map(function(r) {
                const statusClass = r.category.toLowerCase();
                return `
                    <tr>
                        <td>${r.date}</td>
                        <td>${r.residentName}</td>
                        <td>${r.height}</td>
                        <td>${r.weight}</td>
                        <td><strong>${r.bmi}</strong></td>
                        <td><span class="status-badge ${statusClass}">${r.category}</span></td>
                        <td>
                            <button class="btn btn-outline btn-sm view-bmi" data-id="${r.id}">View</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        resultsCount.textContent = filtered.length + ' records';
    }

    // ========================================
    // PRENATAL - ADD WITH MODAL
    // ========================================
    if (addPrenatalBtn) {
        addPrenatalBtn.addEventListener('click', function() {
            populatePrenatalResidents();
            addPrenatalForm.reset();
            const submitBtn = addPrenatalForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Save Prenatal Record';
            submitBtn.disabled = false;
            openModal(addPrenatalModal);
        });
    }

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

    // Auto-calculate gestational age and due date
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

   if (addPrenatalForm) {
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
function editPrenatalRecord(recordId) {
    const record = prenatalRecords.find(function(r) { return r.id === recordId; });
    if (!record) {
        showToast('Record not found.', 'error');
        return;
    }

    // Populate the edit modal
    document.getElementById('editPrenatalId').value = record.id;
    document.getElementById('editPrenatalResident').value = record.residentId || '';
    document.getElementById('editPrenatalLmp').value = record.lmp || '';
    document.getElementById('editPrenatalDueDate').value = record.dueDate || '';
    document.getElementById('editPrenatalGestationalAge').value = record.gestationalAge || '';
    document.getElementById('editPrenatalStatus').value = record.status || 'Active';
    document.getElementById('editPrenatalVitalSigns').value = record.vitalSigns || '';
    document.getElementById('editPrenatalMilestoneNotes').value = record.milestoneNotes || '';
    document.getElementById('editPrenatalNextCheckup').value = record.nextCheckup || '';

    // Populate resident dropdown
    populateEditPrenatalResidents(record.residentId);

    // Auto-calculate gestational age on LMP change
    const editLmp = document.getElementById('editPrenatalLmp');
    const editDueDate = document.getElementById('editPrenatalDueDate');
    const editGestationalAge = document.getElementById('editPrenatalGestationalAge');

    // Remove existing event listener to avoid duplicates
    editLmp.removeEventListener('change', editLmp._listener);
    
    // Add new event listener with reference
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

    function renderPrenatal() {
    const tbody = document.getElementById('prenatalTableBody');
    const resultsCount = document.getElementById('prenatalResults');
    const searchTerm = document.getElementById('prenatalSearch') ? document.getElementById('prenatalSearch').value.toLowerCase().trim() : '';
    const statusFilter = document.getElementById('prenatalStatusFilter') ? document.getElementById('prenatalStatusFilter').value : '';

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
            
            // Show delivery date if delivered
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

    resultsCount.textContent = filtered.length + ' records';

    // Event listeners for prenatal actions
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
function markPrenatalDelivered(recordId) {
    const record = prenatalRecords.find(function(r) { return r.id === recordId; });
    if (!record) {
        showToast('Record not found.', 'error');
        return;
    }

    // Ask for delivery date
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
const editPrenatalForm = document.getElementById('editPrenatalForm');

if (editPrenatalForm) {
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
    // ========================================
    // OPT - WITH AUTO-CALCULATE NUTRITIONAL STATUS & EDIT/DELETE
    // ========================================
    if (addOptBtn) {
        addOptBtn.addEventListener('click', function() {
            populateOptChildren();
            addOptForm.reset();
            const submitBtn = addOptForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Save OPT Record';
            submitBtn.disabled = false;
            const statusPreview = document.querySelector('.opt-status-preview');
            if (statusPreview) statusPreview.style.display = 'none';
            openModal(addOptModal);
        });
    }

    function populateOptChildren() {
        const select = document.getElementById('optChild');
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
            select.innerHTML = '<option value="">No children (0-5 years old)</option>';
            showToast('No children (0-5 years old) found. Please add a child first.', 'info');
        } else {
            children.forEach(function(r) {
                const option = document.createElement('option');
                option.value = r.id;
                const ageDisplay = r.age_display || r.age || 'Unknown age';
                const parentInfo = r.parentName ? ' · Parent: ' + r.parentName : '';
                const purokInfo = r.purok ? ', ' + r.purok : '';
                option.textContent = r.fullName + ' (' + ageDisplay + purokInfo + ')' + parentInfo;
                select.appendChild(option);
            });
        }
    }

    // Auto-calculate nutritional status
    function calculateOptNutritionalStatus(weight, height, age) {
        if (!weight || !height || !age) return 'Normal';
        
        let ageMonths = 0;
        if (typeof age === 'string') {
            const ageLower = age.toLowerCase();
            if (ageLower.includes('mos') || ageLower.includes('month')) {
                const match = ageLower.match(/(\d+)/);
                if (match) {
                    ageMonths = parseInt(match[1]);
                }
            } else if (ageLower.includes('yr') || ageLower.includes('year')) {
                const match = ageLower.match(/(\d+)/);
                if (match) {
                    ageMonths = parseInt(match[1]) * 12;
                }
            }
        } else if (typeof age === 'number') {
            ageMonths = age * 12;
        }
        
        if (ageMonths === 0) ageMonths = 36;
        
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        
        let status = 'Normal';
        
        if (ageMonths <= 12) {
            if (bmi < 13) status = 'Underweight';
            else if (bmi > 18) status = 'Overweight';
            else status = 'Normal';
        } else if (ageMonths <= 24) {
            if (bmi < 14) status = 'Underweight';
            else if (bmi > 19) status = 'Overweight';
            else status = 'Normal';
        } else if (ageMonths <= 36) {
            if (bmi < 14.5) status = 'Underweight';
            else if (bmi > 19.5) status = 'Overweight';
            else status = 'Normal';
        } else if (ageMonths <= 48) {
            if (bmi < 15) status = 'Underweight';
            else if (bmi > 20) status = 'Overweight';
            else status = 'Normal';
        } else if (ageMonths <= 60) {
            if (bmi < 15.5) status = 'Underweight';
            else if (bmi > 20.5) status = 'Overweight';
            else status = 'Normal';
        } else {
            if (bmi < 16) status = 'Underweight';
            else if (bmi > 21) status = 'Overweight';
            else status = 'Normal';
        }
        
        return status;
    }

    // Real-time status preview for OPT
    const optStatusPreview = document.createElement('div');
    optStatusPreview.className = 'opt-status-preview';
    optStatusPreview.style.cssText = `
        margin-top: 8px;
        padding: 8px 12px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.85rem;
        display: none;
    `;

    if (optStatusSelect) {
        optStatusSelect.parentNode.appendChild(optStatusPreview);
    }

    function updateOptStatusPreview() {
        const weight = parseFloat(optWeightInput ? optWeightInput.value : 0);
        const height = parseFloat(optHeightInput ? optHeightInput.value : 0);
        const childId = parseInt(optChildSelect ? optChildSelect.value : 0);
        
        if (weight && height && childId) {
            const child = residents.find(function(r) { return r.id === childId; });
            if (child) {
                const childAge = child.age_display || child.age;
                const status = calculateOptNutritionalStatus(weight, height, childAge);
                
                if (optStatusSelect) optStatusSelect.value = status;
                
                optStatusPreview.style.display = 'block';
                
                let color = '';
                let bgColor = '';
                if (status === 'Normal') {
                    color = '#2E7D32';
                    bgColor = '#E8F5E9';
                } else if (status === 'Underweight') {
                    color = '#E65100';
                    bgColor = '#FFF3E0';
                } else if (status === 'Overweight') {
                    color = '#C62828';
                    bgColor = '#FDEDEC';
                }
                
                optStatusPreview.style.color = color;
                optStatusPreview.style.backgroundColor = bgColor;
                optStatusPreview.style.border = '1px solid ' + color;
                optStatusPreview.innerHTML = '<i class="fas fa-thermometer-half"></i> Nutritional Status: <strong>' + status + '</strong> (auto-calculated)';
            }
        } else {
            optStatusPreview.style.display = 'none';
        }
    }

    if (optWeightInput) {
        optWeightInput.addEventListener('input', updateOptStatusPreview);
    }

    if (optHeightInput) {
        optHeightInput.addEventListener('input', updateOptStatusPreview);
    }

    if (optChildSelect) {
        optChildSelect.addEventListener('change', updateOptStatusPreview);
    }

    if (addOptForm) {
        addOptForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const childId = parseInt(document.getElementById('optChild').value);
            const weight = parseFloat(document.getElementById('optWeight').value);
            const height = parseFloat(document.getElementById('optHeight').value);
            const date = document.getElementById('optDate').value;

            if (!childId || !weight || !height || !date) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            const child = residents.find(function(r) { return r.id === childId; });
            const childAge = child ? (child.age_display || child.age) : 'Unknown';
            
            const nutritionalStatus = calculateOptNutritionalStatus(weight, height, childAge);
            if (optStatusSelect) optStatusSelect.value = nutritionalStatus;

            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            const optData = {
                child_id: childId,
                weight: weight,
                height: height,
                date: date,
                nutritional_status: nutritionalStatus,
                notes: document.getElementById('optNotes').value || ''
            };

            fetch('ajax/add_opt.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(optData).toString()
            })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    showToast('OPT record added successfully! Status: ' + nutritionalStatus, 'success');
                    closeModal(addOptModal);
                    addOptForm.reset();
                    if (optStatusPreview) optStatusPreview.style.display = 'none';
                    submitBtn.textContent = 'Save OPT Record';
                    submitBtn.disabled = false;
                    fetchAllRecords();
                } else {
                    showToast(data.message || 'Failed to add OPT record.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save OPT Record';
                }
            })
            .catch(function() {
                showToast('Error connecting to server.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save OPT Record';
            });
        });
    }

    // ========================================
    // EDIT OPT RECORD
    // ========================================
    function populateEditOptChildren(selectedId) {
    const select = document.getElementById('editOptChild');
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
        select.innerHTML = '<option value="">No children (0-5 years old)</option>';
    } else {
        children.forEach(function(r) {
            const option = document.createElement('option');
            option.value = r.id;
            if (selectedId && selectedId == r.id) {
                option.selected = true;
            }
            const ageDisplay = r.age_display || r.age || 'Unknown age';
            const parentInfo = r.parentName ? ' · Parent: ' + r.parentName : '';
            const purokInfo = r.purok ? ', ' + r.purok : '';
            option.textContent = r.fullName + ' (' + ageDisplay + purokInfo + ')' + parentInfo;
            select.appendChild(option);
        });
    }
}

function editOptRecord(recordId) {
    const record = optRecords.find(function(r) { return r.id === recordId; });
    if (!record) {
        showToast('Record not found.', 'error');
        return;
    }

    document.getElementById('editOptId').value = record.id;
    document.getElementById('editOptChild').value = record.residentId || '';
    document.getElementById('editOptWeight').value = record.weight || '';
    document.getElementById('editOptHeight').value = record.height || '';
    document.getElementById('editOptDate').value = record.date || '';
    document.getElementById('editOptNutritionalStatus').value = record.nutritionalStatus || 'Normal';
    document.getElementById('editOptNotes').value = record.notes || '';

    populateEditOptChildren(record.residentId);
    openModal(editOptModal);

    // Auto-calculate status when weight/height changes in edit modal
    setupEditOptAutoCalculate();
}
// ========================================
// EDIT OPT - AUTO-CALCULATE NUTRITIONAL STATUS
// ========================================
function setupEditOptAutoCalculate() {
    const editOptWeight = document.getElementById('editOptWeight');
    const editOptHeight = document.getElementById('editOptHeight');
    const editOptChild = document.getElementById('editOptChild');
    const editOptStatus = document.getElementById('editOptNutritionalStatus');
    
    // Create status preview for edit modal
    const editStatusPreview = document.createElement('div');
    editStatusPreview.className = 'edit-opt-status-preview';
    editStatusPreview.style.cssText = `
        margin-top: 8px;
        padding: 8px 12px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.85rem;
        display: none;
        transition: all 0.3s ease;
    `;
    
    // Remove existing preview if any
    const existingPreview = document.querySelector('.edit-opt-status-preview');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    // Insert preview after status dropdown
    if (editOptStatus) {
        editOptStatus.parentNode.appendChild(editStatusPreview);
    }

    function updateEditOptStatusPreview() {
        const weight = parseFloat(editOptWeight ? editOptWeight.value : 0);
        const height = parseFloat(editOptHeight ? editOptHeight.value : 0);
        const childId = parseInt(editOptChild ? editOptChild.value : 0);
        
        if (weight && height && childId) {
            const child = residents.find(function(r) { return r.id === childId; });
            if (child) {
                const childAge = child.age_display || child.age;
                const status = calculateOptNutritionalStatus(weight, height, childAge);
                
                if (editOptStatus) editOptStatus.value = status;
                
                editStatusPreview.style.display = 'block';
                
                let color = '';
                let bgColor = '';
                if (status === 'Normal') {
                    color = '#2E7D32';
                    bgColor = '#E8F5E9';
                } else if (status === 'Underweight') {
                    color = '#E65100';
                    bgColor = '#FFF3E0';
                } else if (status === 'Overweight') {
                    color = '#C62828';
                    bgColor = '#FDEDEC';
                }
                
                editStatusPreview.style.color = color;
                editStatusPreview.style.backgroundColor = bgColor;
                editStatusPreview.style.border = '1px solid ' + color;
                editStatusPreview.innerHTML = '<i class="fas fa-thermometer-half"></i> Nutritional Status: <strong>' + status + '</strong> (auto-calculated)';
            }
        } else {
            editStatusPreview.style.display = 'none';
        }
    }

    // Add event listeners
    if (editOptWeight) {
        editOptWeight.addEventListener('input', updateEditOptStatusPreview);
    }

    if (editOptHeight) {
        editOptHeight.addEventListener('input', updateEditOptStatusPreview);
    }

    if (editOptChild) {
        editOptChild.addEventListener('change', function() {
            // Trigger update when child changes
            setTimeout(updateEditOptStatusPreview, 100);
        });
    }

    // Trigger initial calculation if fields have values
    setTimeout(updateEditOptStatusPreview, 200);
}
    // ========================================
    // DELETE OPT RECORD - WITH CONFIRMATION
    // ========================================
    function deleteOptRecord(recordId) {
        if (!confirm('⚠️ Are you sure you want to delete this OPT record?\n\nThis action cannot be undone.')) {
            return;
        }

        fetch('ajax/delete_opt.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'id=' + recordId
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast('OPT record deleted successfully!', 'success');
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
// EDIT OPT FORM SUBMIT
// ========================================
if (editOptForm) {
    editOptForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const id = document.getElementById('editOptId').value;
        const childId = parseInt(document.getElementById('editOptChild').value);
        const weight = parseFloat(document.getElementById('editOptWeight').value);
        const height = parseFloat(document.getElementById('editOptHeight').value);
        const date = document.getElementById('editOptDate').value;
        
        // Get the auto-calculated status from the dropdown
        const nutritionalStatus = document.getElementById('editOptNutritionalStatus').value;
        const notes = document.getElementById('editOptNotes').value;

        if (!childId || !weight || !height || !date) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        // Validate the status is set
        if (!nutritionalStatus) {
            showToast('Please wait for nutritional status to be calculated.', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';

        const data = new URLSearchParams({
            id: id,
            child_id: childId,
            weight: weight,
            height: height,
            date: date,
            nutritional_status: nutritionalStatus,
            notes: notes || ''
        }).toString();

        fetch('ajax/update_opt.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                showToast('OPT record updated successfully! Status: ' + nutritionalStatus, 'success');
                closeModal(editOptModal);
                // Remove preview
                const preview = document.querySelector('.edit-opt-status-preview');
                if (preview) preview.remove();
                fetchAllRecords();
            } else {
                showToast(data.message || 'Update failed.', 'error');
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update OPT Record';
        })
        .catch(function() {
            showToast('Error connecting to server.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update OPT Record';
        });
    });
}

    // ========================================
    // RENDER OPT - WITH EDIT & DELETE BUTTONS
    // ========================================
    function renderOpt() {
    const tbody = document.getElementById('optTableBody');
    const resultsCount = document.getElementById('optResults');
    const searchTerm = document.getElementById('optSearch') ? document.getElementById('optSearch').value.toLowerCase().trim() : '';
    const statusFilter = document.getElementById('optStatusFilter') ? document.getElementById('optStatusFilter').value : '';

    let filtered = [...optRecords];

    if (searchTerm) {
        filtered = filtered.filter(function(r) {
            return r.childName.toLowerCase().includes(searchTerm);
        });
    }

    if (statusFilter) {
        filtered = filtered.filter(function(r) {
            return r.nutritionalStatus === statusFilter;
        });
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-child"></i>
                    <span>No OPT records found</span>
                    <p class="empty-sub">${optRecords.length === 0 ? 'Monitor children\'s growth through regular weighing.' : 'Try adjusting your search filters.'}</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = filtered.map(function(r) {
            const statusClass = r.nutritionalStatus.toLowerCase();
            
            // ✅ Format the age in JavaScript (ONLY HERE)
            let ageDisplay = r.childAge || '—';
            
            // Check if it's a number and add proper suffix
            if (ageDisplay !== '—' && !isNaN(ageDisplay)) {
                const num = parseInt(ageDisplay);
                // If age is less than 1 year (in months), show as months
                // Note: This depends on how you store it. If child_age is in years, use years.
                // If you want to detect months, you'd need a separate flag.
                if (num < 1) {
                    // This is a fallback - ideally you'd have a separate field for months
                    ageDisplay = num + ' mos';
                } else {
                    ageDisplay = num + ' yr' + (num > 1 ? 's' : '');
                }
            }
            
            return `
                <tr>
                    <td>${r.childName}</td>
                    <td>${ageDisplay}</td>
                    <td>${r.parentName}</td>
                    <td>${r.date}</td>
                    <td>${r.weight}</td>
                    <td>${r.height || '—'}</td>
                    <td><span class="status-badge ${statusClass}">${r.nutritionalStatus}</span></td>
                    <td>
                        <button class="btn btn-outline btn-sm edit-opt" data-id="${r.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-opt" data-id="${r.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    resultsCount.textContent = filtered.length + ' records';

    document.querySelectorAll('.edit-opt').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            editOptRecord(id);
        });
    });

    document.querySelectorAll('.delete-opt').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            deleteOptRecord(id);
        });
    });
}

    // ========================================
    // IMMUNIZATION - ADD
    // ========================================
    if (addImmunizationBtn) {
        addImmunizationBtn.addEventListener('click', function() {
            populateImmunizationChildren();
            recordImmunizationForm.reset();
            const submitBtn = recordImmunizationForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Save Immunization';
            submitBtn.disabled = false;
            openModal(recordImmunizationModal);
        });
    }

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

    if (recordImmunizationForm) {
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
    // EDIT IMMUNIZATION
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

    // Submit Edit Immunization Form
    if (editImmunizationForm) {
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
    // DELETE IMMUNIZATION - WITH CONFIRMATION
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
    // IMMUNIZATION FILTERS
    // ========================================
    document.getElementById('immunizationSearch')?.addEventListener('input', function() {
        applyImmunizationFilters();
    });

    document.getElementById('immunizationPurokFilter')?.addEventListener('change', function() {
        applyImmunizationFilters();
    });

    document.getElementById('immunizationVaccineFilter')?.addEventListener('change', function() {
        applyImmunizationFilters();
    });

    document.getElementById('immunizationDoseFilter')?.addEventListener('change', function() {
        applyImmunizationFilters();
    });

    document.getElementById('immunizationDateFilter')?.addEventListener('change', function() {
        applyImmunizationFilters();
    });

    document.getElementById('immunizationStatusFilter')?.addEventListener('change', function() {
        applyImmunizationFilters();
    });

    document.getElementById('clearImmunizationFilters')?.addEventListener('click', function() {
        document.getElementById('immunizationSearch').value = '';
        document.getElementById('immunizationPurokFilter').value = '';
        document.getElementById('immunizationVaccineFilter').value = '';
        document.getElementById('immunizationDoseFilter').value = '';
        document.getElementById('immunizationDateFilter').value = '';
        document.getElementById('immunizationStatusFilter').value = '';
        applyImmunizationFilters();
    });

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
    // APPOINTMENTS
    // ========================================
function renderAppointments() {
    console.log('📋 Rendering appointments...', appointments);
    
    const tbody = document.getElementById('appointmentTableBody');
    const resultsCount = document.getElementById('appointmentResults');
    const dateFilter = document.getElementById('appointmentDateFilter') ? document.getElementById('appointmentDateFilter').value : '';
    const statusFilter = document.getElementById('appointmentStatusFilter') ? document.getElementById('appointmentStatusFilter').value : '';

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
            console.log('📅 Appointment:', r.id, 'Date:', r.date, 'Time:', r.time);
            
            // 🔥 Display date and time - FIXED
            var dateDisplay = r.date && r.date !== '—' ? r.date : '—';
            var timeDisplay = r.time && r.time !== '—' ? r.time : '—';
            
            // Check for pending cancellation
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
                        </button>` : ''
                    }
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

    // Event listeners
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
                    <h2>Appointment Details</h2>
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

    // Populate the edit modal
    document.getElementById('editAppointmentId').value = record.id;
    document.getElementById('editAppointmentResident').value = record.residentId || '';
    document.getElementById('editAppointmentDate').value = record.date || '';
    document.getElementById('editAppointmentTime').value = record.time || '';
    document.getElementById('editAppointmentType').value = record.type || '';
    document.getElementById('editAppointmentLocation').value = record.location || 'Barangay Health Center';
    document.getElementById('editAppointmentStatus').value = record.status || 'Upcoming';
    document.getElementById('editAppointmentNotes').value = record.notes || '';

    // Populate resident dropdown
    populateEditAppointmentResidents(record.residentId);

    openModal(editAppointmentModal);
}

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
// APPOINTMENTS - ADD WITH MODAL
// ========================================
if (addAppointmentBtn) {
    addAppointmentBtn.addEventListener('click', function() {
        populateAppointmentResidents();
        addAppointmentForm.reset();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').value = today;
        document.getElementById('appointmentStatus').value = 'Upcoming';
        const submitBtn = addAppointmentForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Schedule Appointment';
        submitBtn.disabled = false;
        openModal(addAppointmentModal);
    });
}

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
if (addAppointmentForm) {
    addAppointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const residentId = parseInt(document.getElementById('appointmentResident').value);
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        const type = document.getElementById('appointmentType').value;
        const status = document.getElementById('appointmentStatus').value;
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
if (editAppointmentForm) {
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
// FETCH PENDING CANCELLATIONS (BHW)
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
// OPEN REVIEW CANCELLATION MODAL (BHW)
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

                // Reset notes field
                document.getElementById('bhwCancellationNotes').value = '';
                
                // Open the modal
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
// REVIEW CANCELLATION - DECISION HANDLERS
// ========================================
document.querySelectorAll('.btn-decision').forEach(function(btn) {
    btn.addEventListener('click', function() {
        const decision = this.dataset.decision;
        const appointmentId = document.getElementById('reviewAppointmentId').value;
        const notes = document.getElementById('bhwCancellationNotes').value;

        if (!appointmentId) {
            showToast('Invalid appointment.', 'error');
            return;
        }

        const actionText = decision === 'approve' ? 'APPROVE' : 'REJECT';
        if (!confirm(`Are you sure you want to ${actionText} this cancellation request?`)) {
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
// ========================================
// BHW NOTIFICATIONS
// ========================================

// Fetch BHW notifications
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

// Update notification badge
function updateBhwNotificationBadge(count) {
    const badge = document.getElementById('bhwNotificationBadge');
    if (badge) {
        badge.textContent = count > 0 ? count : '0';
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
}

// Render BHW notifications
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

    // Mark single notification as read
    document.querySelectorAll('#bhwNotificationsList .notification-mark-read').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id);
            markBhwNotificationRead(id);
        });
    });

    // Mark single notification as unread
    document.querySelectorAll('#bhwNotificationsList .notification-mark-unread').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id);
            markBhwNotificationUnread(id);
        });
    });

    // Click on notification to navigate
    document.querySelectorAll('#bhwNotificationsList .notification-item').forEach(function(item) {
        item.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            const link = this.dataset.link;
            
            // Mark as read if unread
            if (!this.classList.contains('read')) {
                markBhwNotificationRead(id);
            }
            
            // Navigate to link if exists
            if (link) {
                navigateTo('appointments');
                // The link will be handled by the button click
            }
        });
    });

    // Handle notification link buttons
    document.querySelectorAll('#bhwNotificationsList .notification-link-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.closest('.notification-item');
            const id = parseInt(item.dataset.id);
            const link = item.dataset.link;
            
            if (!item.classList.contains('read')) {
                markBhwNotificationRead(id);
            }
            
            navigateTo('appointments');
        });
    });

    // Mark all as read
    const markAllBtn = document.getElementById('bhwMarkAllReadBtn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', function() {
            markBhwNotificationRead(null);
        });
    }

    // Clear all
    const clearAllBtn = document.getElementById('bhwClearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all notifications?')) {
                clearBhwNotifications();
            }
        });
    }
}

// Mark BHW notification as read
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

// Mark BHW notification as unread
function markBhwNotificationUnread(notificationId) {
    if (!notificationId) {
        return;
    }

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

// Clear BHW notifications
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

// Get time ago string (if not already defined)
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
    // SMS
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

    function updateCharCount() {
        if (!smsMessage || !charCount) return;
        const len = smsMessage.value.length;
        charCount.textContent = len + ' / 160';
        charCount.className = 'char-count';
        if (len > 140) charCount.classList.add('warning');
        if (len > 160) charCount.classList.add('danger');
    }

    if (sendSmsBtn) {
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
    // UPDATE STATS
    // ========================================
    function updateStats() {
        const totalResidents = residents.length;
        const pregnantCount = prenatalRecords.filter(function(r) { return r.status === 'Active'; }).length;
        const immunizationDue = immunizationRecords.filter(function(r) { return r.status === 'Upcoming' || r.status === 'Overdue'; }).length;
        const todayAppointments = appointments.filter(function(r) {
            return r.date === new Date().toISOString().split('T')[0] && r.status === 'Upcoming';
        }).length;

        document.getElementById('totalResidents').textContent = totalResidents;
        document.getElementById('pregnantCount').textContent = pregnantCount;
        document.getElementById('immunizationDue').textContent = immunizationDue;
        document.getElementById('todayAppointments').textContent = todayAppointments;
        document.getElementById('residentCount').textContent = totalResidents;
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
    // SEARCH & FILTER EVENTS
    // ========================================
    if (residentSearch) {
        residentSearch.addEventListener('input', function() {
            filterResidents();
        });
    }

    if (residentTypeFilter) {
        residentTypeFilter.addEventListener('change', function() {
            filterResidents();
        });
    }

    if (purokFilter) {
        purokFilter.addEventListener('change', function() {
            filterResidents();
        });
    }

    if (ageFilter) {
        ageFilter.addEventListener('change', function() {
            filterResidents();
        });
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

    if (globalSearch) {
        globalSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    navigateTo('residents');
                    if (residentSearch) {
                        residentSearch.value = query;
                        filterResidents();
                    }
                }
            }
        });
    }

    // ========================================
    // FETCH ALL RECORDS FROM DATABASE
    // ========================================
    function fetchAllRecords() {
        fetch('ajax/get_residents.php')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    residents = data.records.map(function(r) {
                        let accountStatus = r.account_status || 'No Account';
                        return {
                            id: r.id,
                            firstName: r.first_name || '',
                            middleName: r.middle_name || '—',
                            lastName: r.last_name || '',
                            fullName: (r.first_name || '') + (r.middle_name ? ' ' + r.middle_name : '') + ' ' + (r.last_name || ''),
                            dob: r.dob || '',
                            age: r.age_years || '—',
                            age_display: r.age_display || r.age_years || '—',
                            type: r.type || 'Unknown',
                            age_months: r.age_months || 0,
                            sex: r.sex || '—',
                            purok: r.purok || '—',
                            address: r.address || '—',
                            mobile: r.mobile || '—',
                            household: r.household || '—',
                            emergencyContact: r.emergency_contact || '—',
                            emergencyNumber: r.emergency_number || '—',
                            medicalHistory: r.medical_history || '—',
                            isMinor: r.age_years < 18,
                            parentId: r.parent_id || null,
                            parentName: r.parent_name || null,
                            parentContact: r.parent_contact || null,
                            relationship: r.relationship || null,
                            account_status: accountStatus,
                            children: [],
                            createdAt: r.created_at || new Date().toISOString()
                        };
                    });
                    currentId = residents.length + 1;
                    updateStats();
                    renderResidents();
                }
            })
            .catch(function() { /* silent fail */ });

        fetch('ajax/get_bmi.php')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    bmiRecords = data.records.map(function(r) {
                        return {
                            id: r.id,
                            residentId: r.resident_id,
                            residentName: r.resident_name || 'Unknown',
                            height: r.height,
                            weight: r.weight,
                            bmi: r.bmi,
                            category: r.category,
                            date: r.date,
                            notes: r.notes || ''
                        };
                    });
                    renderBmi();
                }
            })
            .catch(function() { /* silent fail */ });

        fetch('ajax/get_prenatal.php')
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            prenatalRecords = data.records.map(function(r) {
                return {
                    id: r.id,
                    residentId: r.residentId,
                    residentName: r.residentName || 'Unknown',
                    lmp: r.lmp || '—',
                    dueDate: r.dueDate || '—',
                    gestationalAge: r.gestationalAge || 0,
                    status: r.status || 'Active',
                    vitalSigns: r.vitalSigns || '',
                    milestoneNotes: r.milestoneNotes || '',
                    nextCheckup: r.nextCheckup || '',
                    deliveryDate: r.deliveryDate || null,
                    createdAt: r.created_at || new Date().toISOString()
                };
            });
            renderPrenatal();
        }
    })
    .catch(function() { /* silent fail */ });

        fetch('ajax/get_immunization.php')
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
                    updateStats();
                }
            })
            .catch(function() { /* silent fail */ });

        fetch('ajax/get_opt.php')
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            optRecords = data.records.map(function(r) {
                // Get age display - prioritize age_display, fallback to age_years
                let ageDisplay = r.age_display || r.child_age_display || r.child_age || r.age_years || '—';
                
                // Remove any duplicate "yrs" or "yr" strings
                if (typeof ageDisplay === 'string') {
                    // If it already contains 'yrs' or 'yr', remove duplicate suffixes
                    if (ageDisplay.includes('yrs') || ageDisplay.includes('yr')) {
                        // Extract just the number
                        const match = ageDisplay.match(/(\d+)/);
                        if (match) {
                            const num = parseInt(match[1]);
                            ageDisplay = num + ' yr' + (num > 1 ? 's' : '');
                        }
                    }
                }
                
                return {
                    id: r.id,
                    residentId: r.resident_id,
                    childName: r.child_name || 'Unknown',
                    childAge: ageDisplay,
                    parentName: r.parent_name || '—',
                    date: r.date || '—',
                    weight: r.weight || '—',
                    height: r.height || '—',
                    nutritionalStatus: r.nutritional_status || 'Normal',
                    notes: r.notes || ''
                };
            });
            renderOpt();
        }
    })
    .catch(function() { /* silent fail */ });

        fetch('ajax/get_appointments.php')
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            appointments = data.records.map(function(r) {
                return {
                    id: r.id,
                    residentId: r.resident_id,
                    residentName: r.resident_name || 'Unknown',
                    date: r.date || '—',
                    time: r.time || '—',
                    type: r.type || 'General Check-up',
                    location: r.location || 'Barangay Health Center',
                    status: r.status || 'Upcoming',
                    notes: r.notes || '',
                    scheduledBy: r.scheduled_by || null,
                    createdAt: r.created_at || new Date().toISOString(),
                    cancellation_requested: r.cancellation_requested || false,
                    cancellation_reason: r.cancellation_reason || '',
                    cancellation_notes: r.cancellation_notes || '',
                    cancellation_status: r.cancellation_status || '',
                    cancellation_requested_at: r.cancellation_requested_at || null,
                    cancellation_approved_at: r.cancellation_approved_at || null
                };
            });
            renderAppointments();
        }
    })
    .catch(function() { /* silent fail */ });
    }

    // ========================================
    // INIT - LOAD FROM PHP DATABASE
    // ========================================
    if (typeof phpResidents !== 'undefined' && phpResidents.length > 0) {
        residents = phpResidents.map(function(r) {
            let accountStatus = r.account_status || 'No Account';
            return {
                id: r.id,
                firstName: r.first_name || '',
                middleName: r.middle_name || '—',
                lastName: r.last_name || '',
                fullName: (r.first_name || '') + (r.middle_name ? ' ' + r.middle_name : '') + ' ' + (r.last_name || ''),
                dob: r.dob || '',
                age: r.age_years || '—',
                age_display: r.age_display || r.age_years || '—',
                type: r.type || 'Unknown',
                age_months: r.age_months || 0,
                sex: r.sex || '—',
                purok: r.purok || '—',
                address: r.address || '—',
                mobile: r.mobile || '—',
                household: r.household || '—',
                emergencyContact: r.emergency_contact || '—',
                emergencyNumber: r.emergency_number || '—',
                medicalHistory: r.medical_history || '—',
                isMinor: r.age_years < 18,
                parentId: r.parent_id || null,
                parentName: r.parent_name || null,
                parentContact: r.parent_contact || null,
                relationship: r.relationship || null,
                account_status: accountStatus,
                children: [],
                createdAt: r.created_at || new Date().toISOString()
            };
        });
        currentId = residents.length + 1;
    }

    // ========================================
    // INIT
    // ========================================
    updateStats();
    renderResidents();
    renderBmi();
    renderPrenatal();
    renderImmunization();
    renderOpt();
    renderAppointments();
    renderSmsHistory();
    navigateTo('dashboard');

    fetchAllRecords();

    // ========================================
// REVIEW CANCELLATION - DECISION HANDLERS
// ========================================
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
    console.log('👩‍⚕️ Smart Community Health Monitoring System · BHW Dashboard');
    console.log('📱 Fully responsive BHW portal');
    console.log('👤 Add Adult: For 18+ years old');
    console.log('🧒 Add Child: For under 18 years old with parent/guardian');
    console.log('🔍 Filters: Parents, Child, Purok, Child Ages, Adult Ages');
    console.log('💙 Age display: 2 mos, 1 yr, 15 yrs, 35 yrs, 65 yrs');
    console.log('💙 Account Status: Has Account / No Account');
    console.log('💙 Delete Resident: Confirmation popup with warning');
    console.log('💙 Delete Immunization: Confirmation popup');
    console.log('💙 Prenatal: Modal with form for adding records');
    console.log('💙 OPT: Modal with form and auto-calculated nutritional status');
    console.log('💙 Relationship dropdown in Add Child');
    console.log('💙 Color scheme: Soft Blue · White');

    window.openModal = openModal;
    window.closeModal = closeModal;
    window.showToast = showToast;
});