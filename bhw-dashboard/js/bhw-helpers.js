// ========================================
// BHW HELPERS - Utility functions
// ========================================

// ========================================
// AGE CALCULATION
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

// ========================================
// RELATIONSHIP HELPERS
// ========================================
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
// TIME AGO
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