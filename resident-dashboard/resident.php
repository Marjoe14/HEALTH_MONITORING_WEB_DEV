<?php
// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// RESIDENT DASHBOARD - PHP
// ========================================

// Start session
session_start();

// ============================================================
// 🔥 CHECK IF USER IS LOGGED IN AS RESIDENT
// ============================================================
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'resident') {
    header('Location: ../auth/login.php');
    exit();
}

// ============================================================
// 🔥 HANDLE LOGOUT
// ============================================================
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ../auth/login.php');
    exit();
}

// Get user data from session
$fullName = $_SESSION['full_name'] ?? 'Resident';
$firstName = $_SESSION['first_name'] ?? '';
$lastName = $_SESSION['last_name'] ?? '';
$userId = $_SESSION['user_id'];

// Include database configuration
require_once __DIR__ . '/../config/database.php';

// Fetch resident data
try {
    $pdo = getDBConnection();
    
    if ($pdo) {
        $stmt = $pdo->prepare("
            SELECT r.*, u.username, u.role 
            FROM residents r
            JOIN users u ON r.user_id = u.id
            WHERE r.user_id = ?
        ");
        $stmt->execute([$userId]);
        $residentData = $stmt->fetch();
        
        if ($residentData) {
            $fullName = $residentData['first_name'] . ' ' . $residentData['last_name'];
            $firstName = $residentData['first_name'];
            $lastName = $residentData['last_name'];
        }
    }
} catch (PDOException $e) {
    // Silent fail
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>Resident Dashboard · Smart Community Health Monitoring</title>
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Google Font: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/resident.css">
    <meta name="theme-color" content="#5CB85C">
</head>
<body>

    <!-- ===== SIDEBAR ===== -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
            <div class="brand-logo">
                <i class="fas fa-heartbeat"></i>
                <span>Barangay<span class="brand-highlight">Garsika</span></span>
            </div>
            <p class="brand-sub">Resident Portal</p>
        </div>

        <nav class="sidebar-nav">
            <a href="#" class="nav-item active" data-page="dashboard">
                <i class="fas fa-th-large"></i>
                <span>Dashboard</span>
            </a>
            <a href="#" class="nav-item" data-page="profile">
                <i class="fas fa-user"></i>
                <span>My Profile</span>
            </a>
            <a href="#" class="nav-item" data-page="health-records">
                <i class="fas fa-notes-medical"></i>
                <span>Health Records</span>
            </a>
            <a href="#" class="nav-item" data-page="appointments">
                <i class="fas fa-calendar-check"></i>
                <span>Appointments</span>
            </a>
            <a href="#" class="nav-item" data-page="notifications">
                <i class="fas fa-bell"></i>
                <span>Notifications</span>
                <span class="badge" id="notificationBadge">0</span>
            </a>
            <a href="#" class="nav-item" data-page="settings">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
            </a>
        </nav>

        <div class="sidebar-footer">
            <!-- 🔥 LOGOUT WITH ?logout=1 -->
            <a href="?logout=1" class="nav-item logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </a>
        </div>

        <button class="sidebar-toggle" id="sidebarToggle">
            <i class="fas fa-bars"></i>
        </button>
    </aside>

    <!-- ===== OVERLAY (for mobile) ===== -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- ===== MAIN CONTENT ===== -->
    <main class="main-content" id="mainContent">

        <!-- ===== TOP HEADER ===== -->
        <header class="top-header">
            <div class="header-left">
                <button class="mobile-menu-btn" id="mobileMenuBtn">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 id="pageTitle">Dashboard</h1>
            </div>
            <div class="header-right">
                <div class="header-search">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search...">
                </div>
                <div class="header-user">
                    <span class="user-name" id="userName"><?php echo htmlspecialchars($fullName); ?></span>
                    <div class="user-avatar" id="userAvatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                </div>
            </div>
        </header>

        <!-- ===== PAGE CONTENT ===== -->
        <div class="page-content">

            <!-- ===== DASHBOARD PAGE ===== -->
            <section class="page-section active" id="page-dashboard">

                <!-- Welcome Banner -->
                <div class="welcome-banner">
                    <div class="welcome-text">
                        <h2>Welcome to your <span>Health Dashboard</span></h2>
                        <p>No health records found yet. Visit the Barangay Health Center to get started.</p>
                    </div>
                    <div class="welcome-icon">
                        <i class="fas fa-hand-holding-heart"></i>
                    </div>
                </div>

                <!-- Stats Cards - All Zero -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon blue">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="upcomingAppointments">0</span>
                            <span class="stat-label">Upcoming Appointments</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon green">
                            <i class="fas fa-syringe"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="immunizationsDue">0</span>
                            <span class="stat-label">Immunizations Due</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange">
                            <i class="fas fa-weight"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="lastBMI">—</span>
                            <span class="stat-label">Last BMI</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon purple">
                            <i class="fas fa-bell"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="unreadNotifications">0</span>
                            <span class="stat-label">Unread Notifications</span>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity & Quick Actions -->
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-clock"></i> Recent Activity</h3>
                            <a href="#" class="view-all" data-page="health-records">View All</a>
                        </div>
                        <div class="activity-list">
                            <div class="activity-item empty">
                                <div class="activity-icon gray">
                                    <i class="fas fa-inbox"></i>
                                </div>
                                <div class="activity-details">
                                    <p>No recent activity</p>
                                    <span class="activity-time">Visit the health center to start your records</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                        </div>
                        <div class="quick-actions">
                            <a href="#" class="quick-action" data-page="profile">
                                <i class="fas fa-user-edit"></i>
                                <span>Update Profile</span>
                            </a>
                            <a href="#" class="quick-action" data-page="appointments">
                                <i class="fas fa-calendar-plus"></i>
                                <span>View Appointments</span>
                            </a>
                            <a href="#" class="quick-action" data-page="health-records">
                                <i class="fas fa-file-medical"></i>
                                <span>Health Records</span>
                            </a>
                            <a href="#" class="quick-action" data-page="notifications">
                                <i class="fas fa-bell"></i>
                                <span>Notifications</span>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Appointments Table - Empty -->
                <div class="dashboard-card full-width">
                    <div class="card-header">
                        <h3><i class="fas fa-calendar-alt"></i> Upcoming Appointments</h3>
                        <a href="#" class="view-all" data-page="appointments">View All</a>
                    </div>
                    <div class="table-responsive">
                        <table class="appointments-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>BHW</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="5" class="empty-state">
                                        <i class="fas fa-calendar-plus"></i>
                                        <span>No appointments scheduled</span>
                                        <p class="empty-sub">Visit the Barangay Health Center to schedule an appointment.</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </section>

            <!-- ===== MY PROFILE PAGE ===== -->
            <section class="page-section" id="page-profile">
                <div class="profile-container">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="profile-title">
                            <h2>My Profile</h2>
                            <p>View and manage your personal information</p>
                        </div>
                        <button class="btn btn-primary" id="editProfileBtn">
                            <i class="fas fa-edit"></i> Edit Profile
                        </button>
                    </div>

                    <div class="profile-grid">
                        <div class="profile-card">
                            <h4><i class="fas fa-user"></i> Personal Information</h4>
                            <div class="profile-field">
                                <span class="field-label">First Name</span>
                                <span class="field-value" id="profileFirstName"><?php echo htmlspecialchars($firstName ?: '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Middle Name</span>
                                <span class="field-value" id="profileMiddleName"><?php echo htmlspecialchars($residentData['middle_name'] ?? '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Last Name</span>
                                <span class="field-value" id="profileLastName"><?php echo htmlspecialchars($lastName ?: '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Date of Birth</span>
                                <span class="field-value" id="profileDob"><?php echo htmlspecialchars($residentData['date_of_birth'] ?? '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Age</span>
                                <span class="field-value" id="profileAge"><?php echo htmlspecialchars($residentData['age'] ?? '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Sex</span>
                                <span class="field-value" id="profileSex"><?php echo htmlspecialchars($residentData['sex'] ?? '—'); ?></span>
                            </div>
                        </div>

                        <div class="profile-card">
                            <h4><i class="fas fa-address-card"></i> Contact & Address</h4>
                            <div class="profile-field">
                                <span class="field-label">Mobile Number</span>
                                <span class="field-value" id="profileMobile"><?php echo htmlspecialchars($residentData['mobile_number'] ?? '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Email</span>
                                <span class="field-value" id="profileEmail"><?php echo htmlspecialchars($residentData['email'] ?? '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Purok</span>
                                <span class="field-value" id="profilePurok"><?php echo htmlspecialchars($residentData['purok'] ?? '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Address</span>
                                <span class="field-value" id="profileAddress"><?php echo htmlspecialchars($residentData['address'] ?? '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Household</span>
                                <span class="field-value" id="profileHousehold"><?php echo htmlspecialchars($residentData['household'] ?? '—'); ?></span>
                            </div>
                        </div>

                        <div class="profile-card full-width">
                            <h4><i class="fas fa-heartbeat"></i> Health Information</h4>
                            <div class="profile-field">
                                <span class="field-label">Medical History</span>
                                <span class="field-value" id="profileMedicalHistory"><?php echo htmlspecialchars($residentData['medical_history'] ?? '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Existing Conditions</span>
                                <span class="field-value" id="profileConditions">—</span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Emergency Contact</span>
                                <span class="field-value" id="profileEmergencyContact"><?php echo htmlspecialchars($residentData['emergency_contact'] ?? '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Emergency Number</span>
                                <span class="field-value" id="profileEmergencyNumber"><?php echo htmlspecialchars($residentData['emergency_number'] ?? '—'); ?></span>
                            </div>
                            <div class="profile-field">
                                <span class="field-label">Assigned BHW</span>
                                <span class="field-value" id="profileAssignedBHW">—</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ===== HEALTH RECORDS PAGE ===== -->
            <section class="page-section" id="page-health-records">
                <div class="records-header">
                    <h2><i class="fas fa-notes-medical"></i> My Health Records</h2>
                    <p>View your complete health history and records</p>
                </div>

                <div class="records-tabs">
                    <button class="record-tab active" data-tab="bmi">BMI History</button>
                    <button class="record-tab" data-tab="prenatal">Prenatal Records</button>
                    <button class="record-tab" data-tab="immunization">Immunization Records</button>
                    <button class="record-tab" data-tab="opt">OPT Records</button>
                </div>

                <!-- BMI Records - Empty -->
                <div class="record-content active" id="tab-bmi">
                    <div class="record-card">
                        <h4><i class="fas fa-weight"></i> Body Mass Index (BMI) History</h4>
                        <div class="table-responsive">
                            <table class="records-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Height (cm)</th>
                                        <th>Weight (kg)</th>
                                        <th>BMI</th>
                                        <th>Category</th>
                                        <th>BHW</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="6" class="empty-state">
                                            <i class="fas fa-weight"></i>
                                            <span>No BMI records found</span>
                                            <p class="empty-sub">Visit the Barangay Health Center for BMI assessment.</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Prenatal Records - Empty -->
                <div class="record-content" id="tab-prenatal">
                    <div class="record-card">
                        <h4><i class="fas fa-baby-carriage"></i> Prenatal Records</h4>
                        <div class="table-responsive">
                            <table class="records-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>LMP</th>
                                        <th>Due Date</th>
                                        <th>Gestational Age</th>
                                        <th>BHW</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="6" class="empty-state">
                                            <i class="fas fa-baby"></i>
                                            <span>No prenatal records found</span>
                                            <p class="empty-sub">If you are pregnant, please visit the Barangay Health Center.</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Immunization Records - Empty -->
                <div class="record-content" id="tab-immunization">
                    <div class="record-card">
                        <h4><i class="fas fa-syringe"></i> Immunization Records</h4>
                        <div class="table-responsive">
                            <table class="records-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Vaccine</th>
                                        <th>Dose</th>
                                        <th>BHW</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="5" class="empty-state">
                                            <i class="fas fa-syringe"></i>
                                            <span>No immunization records found</span>
                                            <p class="empty-sub">Visit the Barangay Health Center for vaccinations.</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- OPT Records - Empty -->
                <div class="record-content" id="tab-opt">
                    <div class="record-card">
                        <h4><i class="fas fa-weight"></i> Operation Timbang (OPT) Records</h4>
                        <div class="table-responsive">
                            <table class="records-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Weight (kg)</th>
                                        <th>Height (cm)</th>
                                        <th>Nutritional Status</th>
                                        <th>BHW</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="5" class="empty-state">
                                            <i class="fas fa-child"></i>
                                            <span>No OPT records found</span>
                                            <p class="empty-sub">For children under 5 years old, visit the Barangay Health Center.</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

           <!-- ===== APPOINTMENTS PAGE ===== -->
<section class="page-section" id="page-appointments">
    <div class="appointments-header">
        <h2><i class="fas fa-calendar-check"></i> My Appointments</h2>
        <p>View and manage your scheduled appointments</p>
    </div>

    <!-- Appointment Filters -->
    <div class="appointments-filters">
        <div class="filter-group">
            <select id="appointmentStatusFilter">
                <option value="">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
            <input type="date" id="appointmentDateFilter">
            <button class="btn btn-outline btn-sm" id="clearAppointmentFilters">Clear</button>
        </div>
        <span class="results-count" id="appointmentResults">0 appointments</span>
    </div>

    <!-- Appointments Table -->
    <div class="table-responsive">
        <table class="appointments-table">
            <thead>
                <tr>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="residentAppointmentTableBody">
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-calendar-plus"></i>
                        <span>No appointments found</span>
                        <p class="empty-sub">You don't have any appointments scheduled yet.</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</section>

            <!-- ===== NOTIFICATIONS PAGE ===== -->
<section class="page-section" id="page-notifications">
    <div class="notifications-header">
        <h2><i class="fas fa-bell"></i> Notifications</h2>
        <p>Stay updated with health advisories and reminders from your BHWs</p>
    </div>

    <!-- THIS MUST EXIST -->
    <div class="notifications-list">
        <!-- Notifications will be rendered here -->
    </div>

    <div class="notifications-actions">
        <button class="btn btn-outline" id="markAllReadBtn" disabled>
            <i class="fas fa-check-double"></i> Mark All as Read
        </button>
        <button class="btn btn-outline" id="clearAllBtn" disabled>
            <i class="fas fa-trash"></i> Clear All
        </button>
    </div>
</section>

            <!-- ===== SETTINGS PAGE ===== -->
            <section class="page-section" id="page-settings">
                <div class="settings-container">
                    <div class="settings-header">
                        <h2><i class="fas fa-cog"></i> Settings</h2>
                        <p>Manage your account preferences and settings</p>
                    </div>

                    <div class="settings-grid">
                        <div class="settings-card">
                            <h4><i class="fas fa-user-lock"></i> Account Security</h4>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <span class="settings-label">Change Password</span>
                                    <span class="settings-desc">Update your password regularly for security</span>
                                </div>
                                <button class="btn btn-outline btn-sm">Change</button>
                            </div>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <span class="settings-label">Two-Factor Authentication</span>
                                    <span class="settings-desc">Add an extra layer of security to your account</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="settings-card">
                            <h4><i class="fas fa-bell"></i> Notification Preferences</h4>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <span class="settings-label">SMS Notifications</span>
                                    <span class="settings-desc">Receive appointment reminders via SMS</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <span class="settings-label">Email Notifications</span>
                                    <span class="settings-desc">Receive health advisories via email</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <span class="settings-label">Health Alerts</span>
                                    <span class="settings-desc">Receive urgent health alerts and advisories</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="settings-card">
                            <h4><i class="fas fa-globe"></i> Language & Region</h4>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <span class="settings-label">Language</span>
                                    <span class="settings-desc">Select your preferred language</span>
                                </div>
                                <select class="settings-select">
                                    <option value="en">English</option>
                                    <option value="tl">Tagalog</option>
                                    <option value="ceb">Cebuano</option>
                                </select>
                            </div>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <span class="settings-label">Time Zone</span>
                                    <span class="settings-desc">Philippine Standard Time (PST)</span>
                                </div>
                                <span class="settings-value">UTC +8</span>
                            </div>
                        </div>

                        <div class="settings-card">
                            <h4><i class="fas fa-trash"></i> Account Management</h4>
                            <div class="settings-item danger">
                                <div class="settings-item-info">
                                    <span class="settings-label">Delete Account</span>
                                    <span class="settings-desc">Permanently delete your account and all data</span>
                                </div>
                                <button class="btn btn-danger btn-sm">Delete Account</button>
                            </div>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <span class="settings-label">Export Data</span>
                                    <span class="settings-desc">Download all your health records</span>
                                </div>
                                <button class="btn btn-outline btn-sm">Export</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>

        <!-- ===== FOOTER ===== -->
        <footer class="dashboard-footer">
            <p>&copy; 2026 Barangay Garsika · Smart Community Health Monitoring System</p>
        </footer>

    </main>

    <!-- ===== EDIT PROFILE MODAL ===== -->
    <div class="modal-overlay" id="editProfileModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> Edit Profile</h3>
                <button class="modal-close" id="closeModal">&times;</button>
            </div>
            <form id="editProfileForm" method="POST" action="update_profile.php">
                <div class="form-row">
                    <div class="form-group">
                        <label>First Name</label>
                        <input type="text" id="editFirstName" name="first_name" value="<?php echo htmlspecialchars($firstName); ?>">
                    </div>
                    <div class="form-group">
                        <label>Middle Name <span class="optional">(Optional)</span></label>
                        <input type="text" id="editMiddleName" name="middle_name" value="<?php echo htmlspecialchars($residentData['middle_name'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label>Last Name</label>
                        <input type="text" id="editLastName" name="last_name" value="<?php echo htmlspecialchars($lastName); ?>">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Mobile Number</label>
                        <input type="tel" id="editMobile" name="mobile" value="<?php echo htmlspecialchars($residentData['mobile_number'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="editEmail" name="email" value="<?php echo htmlspecialchars($residentData['email'] ?? ''); ?>">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Purok</label>
                        <select id="editPurok" name="purok">
                            <option value="">Select Purok</option>
                            <option value="Purok 1" <?php echo ($residentData['purok'] ?? '') === 'Purok 1' ? 'selected' : ''; ?>>Purok 1</option>
                            <option value="Purok 2" <?php echo ($residentData['purok'] ?? '') === 'Purok 2' ? 'selected' : ''; ?>>Purok 2</option>
                            <option value="Purok 3" <?php echo ($residentData['purok'] ?? '') === 'Purok 3' ? 'selected' : ''; ?>>Purok 3</option>
                            <option value="Purok 4" <?php echo ($residentData['purok'] ?? '') === 'Purok 4' ? 'selected' : ''; ?>>Purok 4</option>
                            <option value="Purok 5" <?php echo ($residentData['purok'] ?? '') === 'Purok 5' ? 'selected' : ''; ?>>Purok 5</option>
                            <option value="Purok 6" <?php echo ($residentData['purok'] ?? '') === 'Purok 6' ? 'selected' : ''; ?>>Purok 6</option>
                            <option value="Purok 7" <?php echo ($residentData['purok'] ?? '') === 'Purok 7' ? 'selected' : ''; ?>>Purok 7</option>
                            <option value="Purok 8" <?php echo ($residentData['purok'] ?? '') === 'Purok 8' ? 'selected' : ''; ?>>Purok 8</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <input type="text" id="editAddress" name="address" value="<?php echo htmlspecialchars($residentData['address'] ?? ''); ?>">
                    </div>
                </div>
                <div class="form-group">
                    <label>Household Information</label>
                    <input type="text" id="editHousehold" name="household" value="<?php echo htmlspecialchars($residentData['household'] ?? ''); ?>">
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" id="cancelEdit">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>
    <!-- ===== CANCEL APPOINTMENT MODAL ===== -->
<div class="modal-overlay" id="cancelAppointmentModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-times-circle"></i> Cancel Appointment</h3>
            <button class="modal-close close-cancel-modal">&times;</button>
        </div>
        <form id="cancelAppointmentForm">
            <input type="hidden" id="cancelAppointmentId">
            
            <!-- Appointment Details -->
            <div class="cancel-appointment-details" id="cancelAppointmentDetails">
                <!-- Dynamically populated -->
            </div>

            <!-- Cancellation Reason -->
            <div class="form-group">
                <label for="cancellationReason">Reason for Cancellation <span class="required">*</span></label>
                <select id="cancellationReason" required>
                    <option value="">Select reason...</option>
                    <option value="Schedule Conflict">Schedule Conflict</option>
                    <option value="Health Issue">Health Issue</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Transportation Problem">Transportation Problem</option>
                    <option value="Already Resolved">Already Resolved</option>
                    <option value="Weather">Weather</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div class="form-group">
                <label for="cancellationReasonDetails">Detailed Reason</label>
                <textarea id="cancellationReasonDetails" rows="3" placeholder="Please provide more details about why you need to cancel..."></textarea>
                <span class="helper-text">This will be sent to your BHW for approval.</span>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn btn-outline close-cancel-modal">Close</button>
                <button type="submit" class="btn btn-danger">Submit Cancellation Request</button>
            </div>
        </form>
    </div>
</div>
<!-- ===== VIEW RESIDENT MODAL (for appointment details) ===== -->
<div class="modal-overlay" id="viewResidentModal">
    <div class="modal-content modal-lg">
        <div class="modal-header">
            <h3><i class="fas fa-calendar-check"></i> Appointment Details</h3>
            <button class="modal-close close-modal" id="closeViewModal">&times;</button>
        </div>
        <div id="residentDetailContent">
            <!-- Dynamically populated -->
        </div>
        <div class="modal-actions">
            <button class="btn btn-outline close-modal" id="closeViewModalBtn">Close</button>
        </div>
    </div>
</div>

    <script src="js/resident.js"></script>
<script src="js/resident-health-records.js"></script>
</body>
</html>