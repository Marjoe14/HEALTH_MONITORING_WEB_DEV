// ========================================
// RESIDENT HEALTH RECORDS
// Separate JS for loading health records
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========================================
    // DOM REFS
    // ========================================
    const recordTabs = document.querySelectorAll('.record-tab');
    const recordContents = document.querySelectorAll('.record-content');

    // ========================================
    // FETCH HEALTH RECORDS
    // ========================================
    function fetchHealthRecords() {
        console.log('📡 Fetching health records...');
        fetch('ajax/get_resident_health_records.php')
            .then(function(response) { 
                console.log('📡 Response status:', response.status);
                return response.json(); 
            })
            .then(function(data) {
                console.log('📦 Data received:', data);
                if (data.success) {
                    console.log('BMI records:', data.bmi_records ? data.bmi_records.length : 0);
                    console.log('Prenatal records:', data.prenatal_records ? data.prenatal_records.length : 0);
                    console.log('Immunization records:', data.immunization_records ? data.immunization_records.length : 0);
                    console.log('OPT records:', data.opt_records ? data.opt_records.length : 0);
                    renderBMIRecords(data.bmi_records || []);
                    renderPrenatalRecords(data.prenatal_records || []);
                    renderImmunizationRecords(data.immunization_records || []);
                    renderOPTRecords(data.opt_records || []);
                } else {
                    console.log('❌ Error fetching health records:', data.message);
                }
            })
            .catch(function(error) {
                console.log('❌ Fetch error:', error);
            });
    }

    // ========================================
    // RENDER BMI RECORDS
    // ========================================
    function renderBMIRecords(records) {
        const tbody = document.querySelector('#tab-bmi .records-table tbody');
        if (!tbody) return;

        if (!records || records.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-weight"></i>
                        <span>No BMI records found</span>
                        <p class="empty-sub">Visit the Barangay Health Center for BMI assessment.</p>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        records.forEach(function(record) {
            const categoryClass = record.category ? record.category.toLowerCase() : 'normal';
            // Get the person name and relationship
            let personDisplay = record.resident_name || 'You';
            let relationshipDisplay = record.relationship || '—';
            
            html += `
                <tr>
                    <td>${formatDate(record.date)}</td>
                    <td><strong>${personDisplay}</strong></td>
                    <td>${relationshipDisplay}</td>
                    <td>${record.height}</td>
                    <td>${record.weight}</td>
                    <td><strong>${record.bmi}</strong></td>
                    <td><span class="status-badge ${categoryClass}">${record.category || 'Normal'}</span></td>
                    <td>${record.bhw_name || '—'}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    // ========================================
    // RENDER PRENATAL RECORDS
    // ========================================
    function renderPrenatalRecords(records) {
        const tbody = document.querySelector('#tab-prenatal .records-table tbody');
        if (!tbody) return;

        if (!records || records.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-baby"></i>
                        <span>No prenatal records found</span>
                        <p class="empty-sub">If you are pregnant, please visit the Barangay Health Center.</p>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        records.forEach(function(record) {
            const statusClass = record.status ? record.status.toLowerCase() : 'active';
            let personDisplay = record.resident_name || 'You';
            let relationshipDisplay = record.relationship || '—';
            
            html += `
                <tr>
                    <td>${formatDate(record.date)}</td>
                    <td><strong>${personDisplay}</strong></td>
                    <td>${relationshipDisplay}</td>
                    <td>${record.lmp || '—'}</td>
                    <td>${record.due_date || '—'}</td>
                    <td>${record.gestational_age || '—'} weeks</td>
                    <td><span class="status-badge ${statusClass}">${record.status || 'Active'}</span></td>
                    <td>${record.bhw_name || '—'}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    // ========================================
    // RENDER IMMUNIZATION RECORDS
    // ========================================
    function renderImmunizationRecords(records) {
        const tbody = document.querySelector('#tab-immunization .records-table tbody');
        if (!tbody) return;

        if (!records || records.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-syringe"></i>
                        <span>No immunization records found</span>
                        <p class="empty-sub">Visit the Barangay Health Center for vaccinations.</p>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        records.forEach(function(record) {
            const statusClass = record.status ? record.status.toLowerCase() : 'upcoming';
            let personDisplay = record.resident_name || 'You';
            let relationshipDisplay = record.relationship || '—';
            
            html += `
                <tr>
                    <td>${formatDate(record.date)}</td>
                    <td><strong>${personDisplay}</strong></td>
                    <td>${relationshipDisplay}</td>
                    <td>${record.vaccine || '—'}</td>
                    <td>${record.dose || '—'}</td>
                    <td><span class="status-badge ${statusClass}">${record.status || 'Upcoming'}</span></td>
                    <td>${record.bhw_name || '—'}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    // ========================================
    // RENDER OPT RECORDS
    // ========================================
    function renderOPTRecords(records) {
        const tbody = document.querySelector('#tab-opt .records-table tbody');
        if (!tbody) return;

        if (!records || records.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-child"></i>
                        <span>No OPT records found</span>
                        <p class="empty-sub">For children under 5 years old, visit the Barangay Health Center.</p>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        records.forEach(function(record) {
            const status = record.nutritional_status || 'Normal';
            let personDisplay = record.resident_name || 'You';
            let relationshipDisplay = record.relationship || '—';
            
            html += `
                <tr>
                    <td>${formatDate(record.date)}</td>
                    <td><strong>${personDisplay}</strong></td>
                    <td>${relationshipDisplay}</td>
                    <td>${record.weight}</td>
                    <td>${record.height || '—'}</td>
                    <td><span class="status-badge ${status.toLowerCase()}">${status}</span></td>
                    <td>${record.bhw_name || '—'}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    // ========================================
    // HELPER: FORMAT DATE
    // ========================================
    function formatDate(dateString) {
        if (!dateString) return '—';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '—';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return '—';
        }
    }

    // ========================================
    // UPDATE TABLE HEADERS
    // ========================================
    function updateTableHeaders() {
        // BMI Table - Add "Relationship" column
        const bmiHeaders = document.querySelector('#tab-bmi .records-table thead tr');
        if (bmiHeaders) {
            bmiHeaders.innerHTML = `
                <th>Date</th>
                <th>Person</th>
                <th>Relationship</th>
                <th>Height (cm)</th>
                <th>Weight (kg)</th>
                <th>BMI</th>
                <th>Category</th>
                <th>BHW</th>
            `;
        }

        // Prenatal Table - Add "Relationship" column
        const prenatalHeaders = document.querySelector('#tab-prenatal .records-table thead tr');
        if (prenatalHeaders) {
            prenatalHeaders.innerHTML = `
                <th>Date</th>
                <th>Person</th>
                <th>Relationship</th>
                <th>LMP</th>
                <th>Due Date</th>
                <th>Gestational Age</th>
                <th>Status</th>
                <th>BHW</th>
            `;
        }

        // Immunization Table - Add "Relationship" column
        const immunizationHeaders = document.querySelector('#tab-immunization .records-table thead tr');
        if (immunizationHeaders) {
            immunizationHeaders.innerHTML = `
                <th>Date</th>
                <th>Person</th>
                <th>Relationship</th>
                <th>Vaccine</th>
                <th>Dose</th>
                <th>Status</th>
                <th>BHW</th>
            `;
        }

        // OPT Table - Add "Relationship" column
        const optHeaders = document.querySelector('#tab-opt .records-table thead tr');
        if (optHeaders) {
            optHeaders.innerHTML = `
                <th>Date</th>
                <th>Person</th>
                <th>Relationship</th>
                <th>Weight (kg)</th>
                <th>Height (cm)</th>
                <th>Nutritional Status</th>
                <th>BHW</th>
            `;
        }
    }

    // ========================================
    // RECORD TAB SWITCHING (REUSE EXISTING LOGIC)
    // ========================================
    if (recordTabs.length > 0) {
        recordTabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                const tabName = this.dataset.tab;

                recordTabs.forEach(function(t) {
                    t.classList.toggle('active', t.dataset.tab === tabName);
                });

                recordContents.forEach(function(content) {
                    content.classList.toggle('active', content.id === 'tab-' + tabName);
                });
            });
        });
    }

    // ========================================
    // INIT - FETCH RECORDS WHEN PAGE LOADS
    // ========================================
    // Update table headers first
    updateTableHeaders();

    // Wait for navigation to health-records page
    const observer = new MutationObserver(function() {
        const healthRecordsPage = document.getElementById('page-health-records');
        if (healthRecordsPage && healthRecordsPage.classList.contains('active')) {
            fetchHealthRecords();
        }
    });

    // Observe page sections for class changes
    document.querySelectorAll('.page-section').forEach(function(section) {
        observer.observe(section, {
            attributes: true,
            attributeFilter: ['class']
        });
    });

    // Also fetch if health-records is already active on load
    setTimeout(function() {
        const healthRecordsPage = document.getElementById('page-health-records');
        if (healthRecordsPage && healthRecordsPage.classList.contains('active')) {
            fetchHealthRecords();
        }
    }, 1000);

    // Also listen for navigation events from resident.js
    document.addEventListener('navigateToHealthRecords', function() {
        fetchHealthRecords();
    });

    console.log('📋 Resident Health Records JS loaded');

    // Expose fetchHealthRecords globally
    window.fetchHealthRecords = fetchHealthRecords;
});