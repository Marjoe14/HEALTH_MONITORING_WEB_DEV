// ========================================
// BHW INIT - Bootstrap, Data Fetching, Dashboard, Reports
// ========================================

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

    const totalResidentsEl = document.getElementById('totalResidents');
    const pregnantEl = document.getElementById('pregnantCount');
    const immunizationEl = document.getElementById('immunizationDue');
    const todayApptsEl = document.getElementById('todayAppointments');
    const residentCountEl = document.getElementById('residentCount');

    if (totalResidentsEl) totalResidentsEl.textContent = totalResidents;
    if (pregnantEl) pregnantEl.textContent = pregnantCount;
    if (immunizationEl) immunizationEl.textContent = immunizationDue;
    if (todayApptsEl) todayApptsEl.textContent = todayAppointments;
    if (residentCountEl) residentCountEl.textContent = totalResidents;
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
                const totalResidentsEl = document.getElementById('totalResidents');
                const pregnantEl = document.getElementById('pregnantCount');
                const immunizationEl = document.getElementById('immunizationDue');
                const todayApptsEl = document.getElementById('todayAppointments');

                if (totalResidentsEl) totalResidentsEl.textContent = data.total_residents || 0;
                if (pregnantEl) pregnantEl.textContent = data.pregnant_count || 0;
                if (immunizationEl) immunizationEl.textContent = data.immunization_due || 0;
                if (todayApptsEl) todayApptsEl.textContent = data.count || 0;

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

    document.querySelectorAll('.view-today-appointment').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = parseInt(this.dataset.id);
            viewAppointment(id);
        });
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
                    let ageDisplay = r.age_display || r.child_age_display || r.child_age || r.age_years || '—';

                    if (typeof ageDisplay === 'string') {
                        if (ageDisplay.includes('yrs') || ageDisplay.includes('yr')) {
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
// BHW REPORT GENERATION
// ========================================
function handleBhwReportGeneration(e) {
    e.preventDefault();
    const reportType = this.dataset.report;
    const reportNames = {
        'resident': 'Resident Statistics Report',
        'prenatal': 'Prenatal Care Report',
        'immunization': 'Immunization Report',
        'bmi': 'BMI Assessment Report',
        'opt': 'Operation Timbang (OPT) Report',
        'monthly': 'Monthly Health Report'
    };

    const title = reportNames[reportType] || 'Report';

    const preview = document.getElementById('reportPreview');
    const previewTitle = document.getElementById('reportPreviewTitle');
    const previewContent = document.querySelector('.report-preview-content');

    if (preview) {
        preview.style.display = 'block';
        preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (previewTitle) {
        previewTitle.textContent = 'Generating ' + title + '...';
    }

    if (previewContent) {
        previewContent.innerHTML = `
            <div class="report-placeholder">
                <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; color: var(--primary);"></i>
                <p>Generating report...</p>
                <span class="empty-sub">Please wait while we compile the data.</span>
            </div>
        `;
    }

    const formData = new FormData();
    formData.append('action', 'generate_report');
    formData.append('report_type', reportType);

    fetch('ajax/bhw_report_handler.php', {
        method: 'POST',
        body: formData
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            if (previewTitle) {
                previewTitle.textContent = data.title || title;
            }
            if (previewContent) {
                previewContent.innerHTML = data.html;
                const printBtn = document.querySelector('.report-preview-actions .btn-outline:first-child');
                if (printBtn) {
                    printBtn.onclick = function() {
                        window.print();
                    };
                }
            }
            showToast('Report generated successfully!', 'success');
        } else {
            showToast(data.message || 'Failed to generate report.', 'error');
            if (previewContent) {
                previewContent.innerHTML = `
                    <div class="report-placeholder">
                        <i class="fas fa-exclamation-circle" style="font-size: 2.5rem; color: var(--danger);"></i>
                        <p>${data.message || 'Failed to generate report.'}</p>
                        <span class="empty-sub">Please try again or contact support.</span>
                    </div>
                `;
            }
        }
    })
    .catch(function(error) {
        console.error('Report generation error:', error);
        showToast('Network error. Please try again.', 'error');
        if (previewContent) {
            previewContent.innerHTML = `
                <div class="report-placeholder">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: var(--danger);"></i>
                    <p>Network error occurred.</p>
                    <span class="empty-sub">Please check your connection and try again.</span>
                </div>
            `;
        }
    });
}

// ========================================
// INIT REPORT BUTTONS
// ========================================
function initReportButtons() {
    document.querySelectorAll('.generate-report').forEach(function(btn) {
        btn.removeEventListener('click', handleBhwReportGeneration);
        btn.addEventListener('click', handleBhwReportGeneration);
    });

    const closePreviewBtn = document.getElementById('closePreview');
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', function() {
            const preview = document.getElementById('reportPreview');
            if (preview) {
                preview.style.display = 'none';
                const content = document.querySelector('.report-preview-content');
                if (content) {
                    content.innerHTML = `
                        <div class="report-placeholder">
                            <i class="fas fa-file-alt"></i>
                            <p>Report content will appear here.</p>
                            <span class="empty-sub">Click a report button above to generate.</span>
                        </div>
                    `;
                }
            }
        });
    }
}

// ========================================
// LOAD PHP RESIDENTS INTO STATE
// ========================================
function loadPhpResidents() {
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
}

    // ========================================
    // MAIN INIT
    // ========================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Initializing BHW Dashboard...');

        // Init UI
        initUIEventListeners();

        // Init navigation
        initNavigationEventListeners();

        // Init resident listeners
        initAdultAgeCalculation();
        initChildAgeCalculation();
        initAddAdultButton();
        initAddAdultForm();
        initAddChildButton();
        initParentSearch();
        initAddChildForm();
        initResidentFilterEvents();

        // Init BMI
        initAddBmiButton();
        initBmiInputListeners();
        initBmiFormSubmit();

        // Init Prenatal
        initAddPrenatalButton();
        initPrenatalLmpCalculation();
        initAddPrenatalForm();
        initEditPrenatalForm();

        // Init Immunization
        initAddImmunizationButton();
        initRecordImmunizationForm();
        initEditImmunizationForm();
        initImmunizationFilterEvents();

        // Init OPT
        initAddOptButton();
        initOptStatusPreview();
        initAddOptForm();
        initEditOptForm();

        // Init Appointments
        initAddAppointmentButton();
        initAddAppointmentForm();
        initEditAppointmentForm();
        initAppointmentFilterEvents();
        initCancellationDecisionButtons();

        // Init Notifications
        initNotificationButtons();

        // Init SMS
        initSmsEventListeners();
        initSendSmsButton();

        // Init Reports
        initReportButtons();

        // Load PHP residents into global state
        loadPhpResidents();

        // Initial renders
        updateStats();
        renderResidents();
        renderBmi();
        renderPrenatal();
        renderImmunization();
        renderOpt();
        renderAppointments();
        renderSmsHistory();
        navigateTo('dashboard');

        // Fetch all records, then re-render current page
        fetchAllRecordsAndRefresh();
    });

    // ========================================
    // FETCH ALL RECORDS - THEN RE-RENDER
    // ========================================
    function fetchAllRecordsAndRefresh() {
        console.log('📥 Fetching all records...');

        Promise.all([
            fetch('ajax/get_residents.php').then(function(r) { return r.json(); }),
            fetch('ajax/get_bmi.php').then(function(r) { return r.json(); }),
            fetch('ajax/get_prenatal.php').then(function(r) { return r.json(); }),
            fetch('ajax/get_immunization.php').then(function(r) { return r.json(); }),
            fetch('ajax/get_opt.php').then(function(r) { return r.json(); }),
            fetch('ajax/get_appointments.php').then(function(r) { return r.json(); })
        ])
        .then(function(results) {
            // RESIDENTS
            if (results[0].success) {
                residents = results[0].records.map(function(r) {
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
                renderResidents();
            }

            // BMI
            if (results[1].success) {
                bmiRecords = results[1].records.map(function(r) {
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

            // PRENATAL
            if (results[2].success) {
                prenatalRecords = results[2].records.map(function(r) {
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

            // IMMUNIZATION
            if (results[3].success) {
                immunizationRecords = results[3].records.map(function(r) {
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

            // OPT
            if (results[4].success) {
                optRecords = results[4].records.map(function(r) {
                    let ageDisplay = r.age_display || r.child_age_display || r.child_age || r.age_years || '—';
                    if (typeof ageDisplay === 'string') {
                        if (ageDisplay.includes('yrs') || ageDisplay.includes('yr')) {
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

            // APPOINTMENTS
            if (results[5].success) {
                appointments = results[5].records.map(function(r) {
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

            // Update stats after everything loads
            updateStats();

            // Re-render current page to reflect new data
            console.log('✅ All records loaded. Current page:', currentPage);
            if (currentPage === 'appointments') {
                renderAppointments();
            }

            console.log('✅ BHW Dashboard fully initialized');
        })
        .catch(function(error) {
            console.error('❌ Error fetching records:', error);
        });
    }