// ========================================
// BHW MANAGEMENT ACTIONS
// View, Edit, Reactivate BHW
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========================================
    // DOM REFS
    // ========================================
    const viewBhwModal = document.getElementById('viewBhwModal');
    const editBhwModal = document.getElementById('editBhwModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // View BHW
    const viewBhwBtns = document.querySelectorAll('.view-bhw');
    const viewBhwName = document.getElementById('viewBhwName');
    const viewBhwUsername = document.getElementById('viewBhwUsername');
    const viewBhwContact = document.getElementById('viewBhwContact');
    const viewBhwEmail = document.getElementById('viewBhwEmail');
    const viewBhwPurok = document.getElementById('viewBhwPurok');
    const viewBhwStatus = document.getElementById('viewBhwStatus');
    const viewBhwRole = document.getElementById('viewBhwRole');
    const viewBhwCreated = document.getElementById('viewBhwCreated');
    
    // Edit BHW
    const editBhwBtns = document.querySelectorAll('.edit-bhw');
    const editBhwForm = document.getElementById('editBhwForm');
    const editBhwId = document.getElementById('editBhwId');
    const editBhwFirstName = document.getElementById('editBhwFirstName');
    const editBhwMiddleName = document.getElementById('editBhwMiddleName');
    const editBhwLastName = document.getElementById('editBhwLastName');
    const editBhwContact = document.getElementById('editBhwContact');
    const editBhwEmail = document.getElementById('editBhwEmail');
    const editBhwPurok = document.getElementById('editBhwPurok');
    const editBhwStatus = document.getElementById('editBhwStatus');
    const submitEditBhwBtn = document.getElementById('submitEditBhwBtn');
    
    // Reactivate BHW
    const reactivateBhwBtns = document.querySelectorAll('.reactivate-bhw');

    // ========================================
    // MODAL FUNCTIONS
    // ========================================
    function openModal(modal) {
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Close modal buttons
    closeModalBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.show').forEach(function(modal) {
                closeModal(modal);
            });
        }
    });

    // ========================================
    // VIEW BHW
    // ========================================
    viewBhwBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const bhwId = this.dataset.id;
            
            if (!bhwId) {
                showToast('BHW ID not found.', 'error');
                return;
            }
            
            // Show loading state
            viewBhwName.textContent = 'Loading...';
            viewBhwUsername.textContent = 'Loading...';
            viewBhwContact.textContent = 'Loading...';
            viewBhwEmail.textContent = 'Loading...';
            viewBhwPurok.textContent = 'Loading...';
            viewBhwStatus.textContent = 'Loading...';
            viewBhwRole.textContent = 'Loading...';
            viewBhwCreated.textContent = 'Loading...';
            
            openModal(viewBhwModal);
            
            // Fetch BHW details
            fetch('ajax_handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=get_bhw&bhw_id=' + bhwId
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const bhw = data.data;
                    viewBhwName.textContent = bhw.first_name + ' ' + (bhw.middle_name || '') + ' ' + bhw.last_name;
                    viewBhwUsername.textContent = bhw.username || '—';
                    viewBhwContact.textContent = bhw.contact_number || '—';
                    viewBhwEmail.textContent = bhw.email || '—';
                    viewBhwPurok.textContent = bhw.assigned_purok || 'All Puroks';
                    
                    // Status badge
                    const statusBadge = document.createElement('span');
                    statusBadge.className = 'status-badge ' + (bhw.status === 'active' ? 'active' : 'inactive');
                    statusBadge.textContent = bhw.status || 'Unknown';
                    viewBhwStatus.innerHTML = '';
                    viewBhwStatus.appendChild(statusBadge);
                    
                    viewBhwRole.textContent = bhw.role || 'BHW';
                    viewBhwCreated.textContent = bhw.created_at || '—';
                } else {
                    showToast(data.message || 'Failed to load BHW details.', 'error');
                    closeModal(viewBhwModal);
                }
            })
            .catch(function() {
                showToast('Network error. Please try again.', 'error');
                closeModal(viewBhwModal);
            });
        });
    });

    // ========================================
    // EDIT BHW
    // ========================================
    editBhwBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const bhwId = this.dataset.id;
            
            if (!bhwId) {
                showToast('BHW ID not found.', 'error');
                return;
            }
            
            // Reset form
            editBhwForm.reset();
            document.getElementById('editFormError').style.display = 'none';
            document.querySelectorAll('#editBhwForm .error').forEach(function(el) {
                el.classList.remove('error');
            });
            
            // Show loading state
            submitEditBhwBtn.innerHTML = 'Loading...';
            submitEditBhwBtn.disabled = true;
            
            openModal(editBhwModal);
            
            // Fetch BHW details
            fetch('ajax_handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=get_bhw&bhw_id=' + bhwId
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const bhw = data.data;
                    editBhwId.value = bhw.id;
                    editBhwFirstName.value = bhw.first_name || '';
                    editBhwMiddleName.value = bhw.middle_name || '';
                    editBhwLastName.value = bhw.last_name || '';
                    editBhwContact.value = bhw.contact_number || '';
                    editBhwEmail.value = bhw.email || '';
                    editBhwPurok.value = bhw.assigned_purok || '';
                    editBhwStatus.value = bhw.status || 'active';
                    
                    submitEditBhwBtn.innerHTML = 'Update BHW';
                    submitEditBhwBtn.disabled = false;
                } else {
                    showToast(data.message || 'Failed to load BHW details.', 'error');
                    closeModal(editBhwModal);
                }
            })
            .catch(function() {
                showToast('Network error. Please try again.', 'error');
                closeModal(editBhwModal);
            });
        });
    });

    // ========================================
    // EDIT BHW FORM SUBMIT
    // ========================================
    if (editBhwForm) {
        editBhwForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const bhwId = editBhwId.value;
            const firstName = editBhwFirstName.value.trim();
            const lastName = editBhwLastName.value.trim();
            const contact = editBhwContact.value.trim();
            const email = editBhwEmail.value.trim();
            const purok = editBhwPurok.value;
            const status = editBhwStatus.value;
            
            const errorDiv = document.getElementById('editFormError');
            const errorMsg = document.getElementById('editFormErrorMessage');
            
            // Clear previous errors
            document.querySelectorAll('#editBhwForm .error').forEach(function(el) {
                el.classList.remove('error');
            });
            errorDiv.style.display = 'none';
            
            // Validate
            if (!firstName) {
                editBhwFirstName.classList.add('error');
                errorMsg.textContent = 'First name is required.';
                errorDiv.style.display = 'block';
                editBhwFirstName.focus();
                return;
            }
            
            if (!lastName) {
                editBhwLastName.classList.add('error');
                errorMsg.textContent = 'Last name is required.';
                errorDiv.style.display = 'block';
                editBhwLastName.focus();
                return;
            }
            
            // Submit
            const formData = new FormData();
            formData.append('action', 'update_bhw');
            formData.append('bhw_id', bhwId);
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('contact', contact);
            formData.append('email', email);
            formData.append('purok', purok);
            formData.append('status', status);
            
            submitEditBhwBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            submitEditBhwBtn.disabled = true;
            
            // Convert to URLSearchParams
            const params = new URLSearchParams();
            for (const [key, value] of formData.entries()) {
                params.append(key, value);
            }
            
            fetch('ajax_handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    closeModal(editBhwModal);
                    setTimeout(function() {
                        window.location.reload();
                    }, 1500);
                } else {
                    showToast(data.message, 'error');
                }
            })
            .catch(function() {
                showToast('Network error. Please try again.', 'error');
            })
            .finally(function() {
                submitEditBhwBtn.innerHTML = 'Update BHW';
                submitEditBhwBtn.disabled = false;
            });
        });
    }

    // ========================================
    // REACTIVATE BHW
    // ========================================
    reactivateBhwBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const userId = this.dataset.id;
            
            if (!userId) {
                showToast('User ID not found.', 'error');
                return;
            }
            
            if (confirm('Are you sure you want to reactivate this BHW?')) {
                fetch('ajax_handler.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'action=reactivate_bhw&user_id=' + userId
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast(data.message, 'success');
                        window.location.reload();
                    } else {
                        showToast(data.message, 'error');
                    }
                })
                .catch(function() {
                    showToast('Network error.', 'error');
                });
            }
        });
    });

    // ========================================
    // TOAST NOTIFICATION (if not already defined)
    // ========================================
    if (typeof showToast === 'undefined') {
        window.showToast = function(message, type) {
            const toast = document.createElement('div');
            toast.className = 'toast toast-' + (type || 'info');
            toast.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            `;
            document.body.appendChild(toast);

            setTimeout(function() {
                toast.style.animation = 'slideDown 0.3s ease forwards';
                setTimeout(function() {
                    toast.remove();
                }, 300);
            }, 3000);
        };
    }

    console.log('👔 BHW Actions loaded successfully!');
});