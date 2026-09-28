// ========================================
// RESIDENT PROFILE - Edit profile modal
// ========================================

// ========================================
// OPEN/CLOSE EDIT PROFILE MODAL
// ========================================
function openEditProfileModal() {
    openModal(editProfileModal);
}

function closeEditProfileModal() {
    closeModal(editProfileModal);
}

// ========================================
// INIT PROFILE MODAL
// ========================================
function initProfileModal() {
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditProfileModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditProfileModal);
    }

    if (cancelEdit) {
        cancelEdit.addEventListener('click', closeEditProfileModal);
    }

    if (editProfileModal) {
        editProfileModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditProfileModal();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (editProfileModal && editProfileModal.classList.contains('show')) {
                closeEditProfileModal();
            }
            if (cancelAppointmentModal && cancelAppointmentModal.classList.contains('show')) {
                closeModal(cancelAppointmentModal);
            }
            if (viewResidentModal && viewResidentModal.classList.contains('show')) {
                closeModal(viewResidentModal);
            }
        }
    });
}

// ========================================
// EDIT PROFILE FORM SUBMIT
// ========================================
function initEditProfileForm() {
    if (!editProfileForm) return;

    editProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const data = {
            firstName: document.getElementById('editFirstName').value.toUpperCase() || '—',
            middleName: document.getElementById('editMiddleName').value.toUpperCase() || '—',
            lastName: document.getElementById('editLastName').value.toUpperCase() || '—',
            mobile: document.getElementById('editMobile').value || '—',
            email: document.getElementById('editEmail').value || '—',
            purok: document.getElementById('editPurok').value || '—',
            address: document.getElementById('editAddress').value.toUpperCase() || '—',
            household: document.getElementById('editHousehold').value.toUpperCase() || '—'
        };

        const fullName = data.firstName + (data.middleName && data.middleName !== '—' ? ' ' + data.middleName : '') + ' ' + data.lastName;

        document.getElementById('profileFirstName').textContent = data.firstName;
        document.getElementById('profileMiddleName').textContent = data.middleName;
        document.getElementById('profileLastName').textContent = data.lastName;
        document.getElementById('profileMobile').textContent = data.mobile;
        document.getElementById('profileEmail').textContent = data.email;
        document.getElementById('profilePurok').textContent = data.purok;
        document.getElementById('profileAddress').textContent = data.address;
        document.getElementById('profileHousehold').textContent = data.household;

        if (userName) userName.textContent = fullName;

        closeEditProfileModal();
        showToast('Profile updated successfully!', 'success');
    });
}