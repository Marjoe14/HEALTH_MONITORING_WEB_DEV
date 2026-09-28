// ========================================
// BHW BMI - BMI Assessment Records
// ========================================

// ========================================
// ADD BMI BUTTON
// ========================================
function initAddBmiButton() {
    if (!addBmiBtn) return;

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

// ========================================
// POPULATE BMI RESIDENTS DROPDOWN
// ========================================
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

// ========================================
// BMI CALCULATION
// ========================================
function calculateBmi() {
    const bmiHeight = document.getElementById('bmiHeight');
    const bmiWeight = document.getElementById('bmiWeight');
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

// ========================================
// INIT BMI INPUT LISTENERS
// ========================================
function initBmiInputListeners() {
    const bmiHeight = document.getElementById('bmiHeight');
    const bmiWeight = document.getElementById('bmiWeight');

    if (bmiHeight && bmiWeight) {
        bmiHeight.addEventListener('input', calculateBmi);
        bmiWeight.addEventListener('input', calculateBmi);
    }
}

// ========================================
// BMI FORM SUBMIT
// ========================================
function initBmiFormSubmit() {
    if (!recordBmiForm) return;

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

// ========================================
// RENDER BMI RECORDS
// ========================================
function renderBmi() {
    const tbody = document.getElementById('bmiTableBody');
    const resultsCount = document.getElementById('bmiResults');
    const searchTerm = document.getElementById('bmiSearch') ? document.getElementById('bmiSearch').value.toLowerCase().trim() : '';
    const categoryFilter = document.getElementById('bmiCategoryFilter') ? document.getElementById('bmiCategoryFilter').value : '';

    if (!tbody) return;

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

    if (resultsCount) resultsCount.textContent = filtered.length + ' records';
}