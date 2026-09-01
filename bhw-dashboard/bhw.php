<?php
// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// BHW DASHBOARD - PHP (FULLY FUNCTIONAL & FIXED)
// ========================================

// Start session
session_start();
// 🔥 DEBUG - Check session user ID
error_log("BHW Session User ID: " . ($_SESSION['user_id'] ?? 'NOT SET'));
// ============================================================
// 🔥 CHECK IF USER IS LOGGED IN AS BHW
// ============================================================
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'bhw') {
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
$userId = $_SESSION['user_id'];
$fullName = $_SESSION['full_name'] ?? 'BHW';
$firstName = $_SESSION['first_name'] ?? '';
$lastName = $_SESSION['last_name'] ?? '';

// Include database configuration
require_once __DIR__ . '/../config/database.php';

// ============================================================
// 🔥 HELPER FUNCTIONS (DEFINED BEFORE USE)
// ============================================================
function formatAge($ageYears, $ageMonths) {
    if ($ageYears === null || $ageYears === '') {
        return '—';
    }
    
    if ($ageYears == 0) {
        if ($ageMonths == 0) {
            return '0 mos';
        }
        return $ageMonths . ' mos';
    } else {
        return $ageYears . ' yr' . ($ageYears > 1 ? 's' : '');
    }
}

function getResidentType($ageYears) {
    if ($ageYears === null || $ageYears === '') {
        return 'Unknown';
    }
    if ($ageYears < 18) {
        return 'Child';
    }
    if ($ageYears >= 60) {
        return 'Elderly';
    }
    return 'Adult';
}

// Initialize variables
$residentCount = 0;
$pregnantCount = 0;
$immunizationDue = 0;
$todayAppointments = 0;
$residentsList = [];
$residentCountDisplay = 0;

// Fetch stats and data
try {
    $pdo = getDBConnection();
    
    if ($pdo) {
        // Count residents
        $stmt = $pdo->query("SELECT COUNT(*) FROM residents");
        $residentCount = $stmt->fetchColumn();
        
        // Count pregnant women
        $stmt = $pdo->query("SELECT COUNT(DISTINCT resident_id) FROM prenatal_records WHERE status = 'Active'");
        $pregnantCount = $stmt->fetchColumn();
        
        // Count immunizations due
        $stmt = $pdo->query("SELECT COUNT(*) FROM immunization_records WHERE status IN ('Upcoming', 'Overdue')");
        $immunizationDue = $stmt->fetchColumn();
        
        // Count today's appointments
        $today = date('Y-m-d');
        $stmt = $pdo->query("SELECT COUNT(*) FROM appointments WHERE appointment_date = '$today' AND status = 'Upcoming'");
        $todayAppointments = $stmt->fetchColumn();
        
        // ============================================================
        // 🔥 FETCH ALL RESIDENTS WITH AGE CALCULATION & ACCOUNT STATUS
        // ============================================================
        $residentStmt = $pdo->query("
            SELECT 
                r.id,
                r.first_name,
                r.middle_name,
                r.last_name,
                r.date_of_birth AS dob,
                TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) AS age_years,
                TIMESTAMPDIFF(MONTH, r.date_of_birth, CURDATE()) AS age_months,
                r.sex,
                r.purok,
                r.address,
                r.mobile_number AS mobile,
                r.household,
                r.emergency_contact,
                r.emergency_number,
                r.medical_history,
                r.created_at,
                r.parent_id,
                r.relationship,
                u.id AS user_id,
                u.username,
                CASE 
                    WHEN u.id IS NOT NULL THEN 'Has Account'
                    WHEN TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) < 18 AND r.parent_id IS NOT NULL THEN (
                        SELECT CASE WHEN u2.id IS NOT NULL THEN 'Has Account' ELSE 'No Account' END 
                        FROM residents r2 
                        LEFT JOIN users u2 ON r2.user_id = u2.id 
                        WHERE r2.id = r.parent_id
                    )
                    ELSE 'No Account'
                END AS account_status
            FROM residents r 
            LEFT JOIN users u ON r.user_id = u.id 
            ORDER BY r.first_name
        ");
        $residentsList = $residentStmt->fetchAll();
        $residentCountDisplay = count($residentsList);
        
        // Add formatted age and type to each resident
        foreach ($residentsList as &$res) {
            $ageYears = $res['age_years'] ?? 0;
            $ageMonths = $res['age_months'] ?? 0;
            $res['age_display'] = formatAge($ageYears, $ageMonths);
            $res['type'] = getResidentType($ageYears);
        }
    }
} catch (PDOException $e) {
    // Silent fail - use default values
    $residentCount = 0;
    $pregnantCount = 0;
    $immunizationDue = 0;
    $todayAppointments = 0;
    $residentCountDisplay = 0;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>BHW Dashboard · Smart Community Health Monitoring</title>
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Google Font: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/bhw.css">
    <meta name="theme-color" content="#4A90D9">
</head>
<body>

    <!-- ===== SIDEBAR ===== -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
            <div class="brand-logo">
                <i class="fas fa-heartbeat"></i>
                <span>Barangay<span class="brand-highlight">Garsika</span></span>
            </div>
            <p class="brand-sub">BHW Portal</p>
        </div>

        <nav class="sidebar-nav">
    <a href="#" class="nav-item active" data-page="dashboard">
        <i class="fas fa-th-large"></i>
        <span>Dashboard</span>
    </a>
    <a href="#" class="nav-item" data-page="residents">
        <i class="fas fa-users"></i>
        <span>Residents</span>
        <span class="badge" id="residentCount"><?php echo $residentCount; ?></span>
    </a>
    <a href="#" class="nav-item" data-page="bmi">
        <i class="fas fa-weight"></i>
        <span>BMI Assessment</span>
    </a>
    <a href="#" class="nav-item" data-page="prenatal">
        <i class="fas fa-baby-carriage"></i>
        <span>Prenatal Care</span>
    </a>
    <a href="#" class="nav-item" data-page="immunization">
        <i class="fas fa-syringe"></i>
        <span>Immunization</span>
    </a>
    <a href="#" class="nav-item" data-page="vaccine-management">
    <i class="fas fa-syringe"></i>
    <span>Vaccine Management</span>
</a>
    <a href="#" class="nav-item" data-page="opt">
        <i class="fas fa-child"></i>
        <span>Operation Timbang</span>
    </a>
    <a href="#" class="nav-item" data-page="appointments">
        <i class="fas fa-calendar-check"></i>
        <span>Appointments</span>
    </a>
    <!-- ===== NOTIFICATIONS (ADD THIS) ===== -->
    <a href="#" class="nav-item" data-page="notifications">
        <i class="fas fa-bell"></i>
        <span>Notifications</span>
        <span class="badge" id="bhwNotificationBadge" style="background: #E74C3C;">0</span>
    </a>
    <a href="#" class="nav-item" data-page="sms">
        <i class="fas fa-sms"></i>
        <span>SMS Notifications</span>
    </a>
    <a href="#" class="nav-item" data-page="reports">
        <i class="fas fa-chart-bar"></i>
        <span>Reports</span>
    </a>
    <a href="#" class="nav-item" data-page="settings">
        <i class="fas fa-cog"></i>
        <span>Settings</span>
    </a>
</nav>

        <div class="sidebar-footer">
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
                    <input type="text" placeholder="Search residents..." id="globalSearch">
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
                        <h2>Welcome to your <span>BHW Dashboard</span></h2>
                        <p>Manage residents, record health data, and monitor community health.</p>
                    </div>
                    <div class="welcome-icon">
                        <i class="fas fa-user-md"></i>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon blue">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="totalResidents"><?php echo $residentCount; ?></span>
                            <span class="stat-label">Total Residents</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon green">
                            <i class="fas fa-baby-carriage"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="pregnantCount"><?php echo $pregnantCount; ?></span>
                            <span class="stat-label">Pregnant Women</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange">
                            <i class="fas fa-syringe"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="immunizationDue"><?php echo $immunizationDue; ?></span>
                            <span class="stat-label">Immunizations Due</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon purple">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="todayAppointments"><?php echo $todayAppointments; ?></span>
                            <span class="stat-label">Today's Appointments</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions & Recent Activity -->
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                        </div>
                        <div class="quick-actions">
                            <a href="#" class="quick-action" data-page="residents" data-action="adult">
                                <i class="fas fa-user-plus"></i>
                                <span>Add Adult</span>
                            </a>
                            <a href="#" class="quick-action" data-page="residents" data-action="child">
                                <i class="fas fa-child"></i>
                                <span>Add Child</span>
                            </a>
                            <a href="#" class="quick-action" data-page="bmi">
                                <i class="fas fa-weight"></i>
                                <span>Record BMI</span>
                            </a>
                            <a href="#" class="quick-action" data-page="prenatal">
                                <i class="fas fa-baby-carriage"></i>
                                <span>Prenatal Check</span>
                            </a>
                            <a href="#" class="quick-action" data-page="immunization">
                                <i class="fas fa-syringe"></i>
                                <span>Record Vaccination</span>
                            </a>
                            <a href="#" class="quick-action" data-page="opt">
                                <i class="fas fa-child"></i>
                                <span>Record OPT</span>
                            </a>
                            <a href="#" class="quick-action" data-page="appointments">
                                <i class="fas fa-calendar-plus"></i>
                                <span>Schedule Appointment</span>
                            </a>
                        </div>
                    </div>

                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-clock"></i> Recent Activity</h3>
                            <a href="#" class="view-all" data-page="reports">View All</a>
                        </div>
                        <div class="activity-list">
                            <div class="activity-item empty">
                                <div class="activity-icon gray">
                                    <i class="fas fa-inbox"></i>
                                </div>
                                <div class="activity-details">
                                    <p>No recent activity</p>
                                    <span class="activity-time">Start by adding residents and recording health data</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Appointments -->
                <div class="dashboard-card full-width">
                    <div class="card-header">
                        <h3><i class="fas fa-calendar-alt"></i> Today's Appointments</h3>
                        <a href="#" class="view-all" data-page="appointments">View All</a>
                    </div>
                    <div class="table-responsive">
                        <table class="appointments-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Resident</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="todayAppointmentsBody">
                                <tr>
                                    <td colspan="5" class="empty-state">
                                        <i class="fas fa-calendar-plus"></i>
                                        <span>No appointments scheduled for today</span>
                                        <p class="empty-sub">Schedule appointments to keep track of your visits.</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </section>

            <!-- ===== RESIDENTS PAGE ===== -->
            <section class="page-section" id="page-residents">
                <div class="page-header">
                    <div class="header-title">
                        <h2><i class="fas fa-users"></i> Resident Management</h2>
                        <p>Manage all residents in Barangay Garsika</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="addAdultBtn">
                            <i class="fas fa-user-plus"></i> Add Adult
                        </button>
                        <button class="btn btn-secondary" id="addChildBtn">
                            <i class="fas fa-child"></i> Add Child
                        </button>
                    </div>
                </div>

                <div class="filters-bar">
                    <div class="filter-group">
                        <input type="text" placeholder="Search by name..." id="residentSearch">
                        <select id="residentTypeFilter">
                            <option value="">All Types</option>
                            <option value="parent">Parents (18+)</option>
                            <option value="child">Children (0-17)</option>
                            <option value="elderly">Elderly (60+)</option>
                        </select>
                        <select id="purokFilter">
                            <option value="">All Puroks</option>
                            <option value="Purok 1">Purok 1</option>
                            <option value="Purok 2">Purok 2</option>
                            <option value="Purok 3">Purok 3</option>
                            <option value="Purok 4">Purok 4</option>
                            <option value="Purok 5">Purok 5</option>
                            <option value="Purok 6">Purok 6</option>
                            <option value="Purok 7">Purok 7</option>
                            <option value="Purok 8">Purok 8</option>
                        </select>
                        <select id="ageFilter">
                            <option value="">All Ages</option>
                            <option value="0-5">0-5 years (Child)</option>
                            <option value="6-12">6-12 years</option>
                            <option value="13-17">13-17 years</option>
                            <option value="18-30">18-30 years</option>
                            <option value="31-45">31-45 years</option>
                            <option value="46-59">46-59 years</option>
                            <option value="60+">60+ years (Elderly)</option>
                        </select>
                        <button class="btn btn-outline btn-sm" id="clearFilters">Clear</button>
                    </div>
                    <span class="results-count" id="residentResults"><?php echo $residentCountDisplay; ?> residents</span>
                </div>

                <div class="table-responsive">
                    <table class="residents-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Purok</th>
                                <th>Age</th>
                                <th>Sex</th>
                                <th>Type</th>
                                <th>Account Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="residentTableBody">
                            <?php if (!empty($residentsList) && count($residentsList) > 0): ?>
                                <?php foreach ($residentsList as $res): ?>
                                    <?php 
                                    $ageDisplay = $res['age_display'] ?? '—';
                                    $type = $res['type'] ?? 'Unknown';
                                    $accountStatus = $res['account_status'] ?? 'No Account';
                                    $statusBadge = $accountStatus === 'Has Account' ? 'active' : 'inactive';
                                    ?>
                                    <tr>
                                        <td><strong><?php echo htmlspecialchars($res['first_name'] . ' ' . ($res['middle_name'] ?? '') . ' ' . $res['last_name']); ?></strong></td>
                                        <td><?php echo htmlspecialchars($res['purok'] ?? '—'); ?></td>
                                        <td><?php echo $ageDisplay; ?></td>
                                        <td><?php echo htmlspecialchars($res['sex'] ?? '—'); ?></td>
                                        <td><span class="status-badge <?php echo strtolower($type); ?>"><?php echo $type; ?></span></td>
                                        <td><span class="status-badge <?php echo $statusBadge; ?>"><?php echo $accountStatus; ?></span></td>
                                        <td>
                                            <button class="btn btn-outline btn-sm view-resident" data-id="<?php echo $res['id']; ?>">View</button>
                                            <button class="btn btn-outline btn-sm edit-resident-btn" data-id="<?php echo $res['id']; ?>">Edit</button>
                                            <button class="btn btn-danger btn-sm delete-resident-btn" data-id="<?php echo $res['id']; ?>">Delete</button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="7" class="empty-state">
                                        <i class="fas fa-users-slash"></i>
                                        <span>No residents registered yet</span>
                                        <p class="empty-sub">Click "Add Adult" or "Add Child" to start building your community health records.</p>
                                    </td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- ===== BMI ASSESSMENT PAGE ===== -->
            <section class="page-section" id="page-bmi">
                <div class="page-header">
                    <div class="header-title">
                        <h2><i class="fas fa-weight"></i> BMI Assessment</h2>
                        <p>Record and monitor Body Mass Index of residents</p>
                    </div>
                    <button class="btn btn-primary" id="addBmiBtn">
                        <i class="fas fa-plus"></i> Record BMI
                    </button>
                </div>

                <div class="filters-bar">
                    <div class="filter-group">
                        <input type="text" placeholder="Search by name..." id="bmiSearch">
                        <select id="bmiCategoryFilter">
                            <option value="">All Categories</option>
                            <option value="Underweight">Underweight</option>
                            <option value="Normal">Normal</option>
                            <option value="Overweight">Overweight</option>
                            <option value="Obese">Obese</option>
                        </select>
                    </div>
                    <span class="results-count" id="bmiResults">0 records</span>
                </div>

                <div class="table-responsive">
                    <table class="records-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Resident</th>
                                <th>Height (cm)</th>
                                <th>Weight (kg)</th>
                                <th>BMI</th>
                                <th>Category</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="bmiTableBody">
                            <tr>
                                <td colspan="7" class="empty-state">
                                    <i class="fas fa-weight"></i>
                                    <span>No BMI records found</span>
                                    <p class="empty-sub">Record BMI assessments to monitor residents' nutritional status.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- ===== PRENATAL CARE PAGE ===== -->
            <section class="page-section" id="page-prenatal">
                <div class="page-header">
                    <div class="header-title">
                        <h2><i class="fas fa-baby-carriage"></i> Prenatal Care</h2>
                        <p>Track and monitor pregnant women in the community</p>
                    </div>
                    <button class="btn btn-primary" id="addPrenatalBtn">
                        <i class="fas fa-plus"></i> Add Prenatal Record
                    </button>
                </div>

                <div class="filters-bar">
                    <div class="filter-group">
                        <input type="text" placeholder="Search by name..." id="prenatalSearch">
                        <select id="prenatalStatusFilter">
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                    <span class="results-count" id="prenatalResults">0 records</span>
                </div>

                <div class="table-responsive">
                    <table class="records-table">
                        <thead>
    <tr>
        <th>Resident</th>
        <th>LMP</th>
        <th>Due Date</th>
        <th>Gestational Age</th>
        <th>Status</th>
        <th>Vital Signs</th>
        <th>Milestone Notes</th>
        <th>Next Checkup</th>
        <th>Actions</th>
    </tr>
</thead>
                        <tbody id="prenatalTableBody">
                            <tr>
                                <td colspan="9" class="empty-state">
                                    <i class="fas fa-baby-carriage"></i>
                                    <span>No prenatal records found</span>
                                    <p class="empty-sub">Track pregnant women to ensure proper maternal care.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- ===== IMMUNIZATION PAGE ===== -->
            <section class="page-section" id="page-immunization">
                <div class="page-header">
                    <div class="header-title">
                        <h2><i class="fas fa-syringe"></i> Immunization Tracking</h2>
                        <p>Track child vaccination schedules and records</p>
                    </div>
                    <button class="btn btn-primary" id="addImmunizationBtn">
                        <i class="fas fa-plus"></i> Record Vaccination
                    </button>
                </div>

                <div class="filters-bar">
                    <div class="filter-group">
                        <input type="text" placeholder="Search by child name..." id="immunizationSearch">
                        <select id="immunizationPurokFilter">
                            <option value="">All Puroks</option>
                            <option value="Purok 1">Purok 1</option>
                            <option value="Purok 2">Purok 2</option>
                            <option value="Purok 3">Purok 3</option>
                            <option value="Purok 4">Purok 4</option>
                            <option value="Purok 5">Purok 5</option>
                            <option value="Purok 6">Purok 6</option>
                            <option value="Purok 7">Purok 7</option>
                            <option value="Purok 8">Purok 8</option>
                        </select>
                        <select id="immunizationVaccineFilter">
                            <option value="">All Vaccines</option>
                            <option value="BCG">BCG</option>
                            <option value="Hepatitis B">Hepatitis B</option>
                            <option value="DPT">DPT</option>
                            <option value="Polio">Polio</option>
                            <option value="Measles">Measles</option>
                            <option value="MMR">MMR</option>
                            <option value="PCV">PCV</option>
                            <option value="Rotavirus">Rotavirus</option>
                        </select>
                        <select id="immunizationDoseFilter">
                            <option value="">All Doses</option>
                            <option value="1st Dose">1st Dose</option>
                            <option value="2nd Dose">2nd Dose</option>
                            <option value="3rd Dose">3rd Dose</option>
                            <option value="Booster">Booster</option>
                        </select>
                        <input type="date" id="immunizationDateFilter" placeholder="Date">
                        <select id="immunizationStatusFilter">
                            <option value="">All Status</option>
                            <option value="Completed">Completed</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                        <button class="btn btn-outline btn-sm" id="clearImmunizationFilters">Clear</button>
                    </div>
                    <span class="results-count" id="immunizationResults">0 records</span>
                </div>

                <div class="table-responsive">
                    <table class="records-table">
                        <thead>
                            <tr>
                                <th>Child Name</th>
                                <th>Purok</th>
                                <th>Age</th>
                                <th>Parent</th>
                                <th>Vaccine</th>
                                <th>Dose</th>
                                <th>Date Administered</th>
                                <th>Next Dose</th>
                                <th>Status</th>
                                <th colspan="2">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="immunizationTableBody">
                            <tr>
                                <td colspan="11" class="empty-state">
                                    <i class="fas fa-syringe"></i>
                                    <span>No immunization records found</span>
                                    <p class="empty-sub">Record vaccinations to ensure children are protected.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            <!-- ===== VACCINE MANAGEMENT PAGE ===== -->
<section class="page-section" id="page-vaccine-management">
    <div class="page-header">
        <div class="header-title">
            <h2><i class="fas fa-syringe"></i> Vaccine Management</h2>
            <p>Add, edit, or delete vaccine types used in immunization records</p>
        </div>
        <div class="header-actions">
            <button class="btn btn-primary" id="addVaccineBtn">
                <i class="fas fa-plus"></i> Add Vaccine
            </button>
        </div>
    </div>

    <div class="table-responsive">
        <table class="records-table">
            <thead>
                <tr>
                    <th>Vaccine Name</th>
                    <th>Description</th>
                    <th>Doses Required</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="vaccineTableBody">
                <tr>
                    <td colspan="4" class="empty-state">
                        <i class="fas fa-syringe"></i>
                        <span>No vaccines found</span>
                        <p class="empty-sub">Click "Add Vaccine" to get started.</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</section>
            <!-- ===== OPERATION TIMBANG PAGE ===== -->
            <section class="page-section" id="page-opt">
                <div class="page-header">
                    <div class="header-title">
                        <h2><i class="fas fa-child"></i> Operation Timbang (OPT)</h2>
                        <p>Monitor children's weight and nutritional status</p>
                    </div>
                    <button class="btn btn-primary" id="addOptBtn">
                        <i class="fas fa-plus"></i> Record OPT
                    </button>
                </div>

                <div class="filters-bar">
                    <div class="filter-group">
                        <input type="text" placeholder="Search by child name..." id="optSearch">
                        <select id="optStatusFilter">
                            <option value="">All Status</option>
                            <option value="Normal">Normal</option>
                            <option value="Underweight">Underweight</option>
                            <option value="Overweight">Overweight</option>
                        </select>
                    </div>
                    <span class="results-count" id="optResults">0 records</span>
                </div>

                <div class="table-responsive">
                    <table class="records-table">
                        <thead>
                            <tr>
                                <th>Child Name</th>
                                <th>Age</th>
                                <th>Parent</th>
                                <th>Date</th>
                                <th>Weight (kg)</th>
                                <th>Height (cm)</th>
                                <th>Nutritional Status</th>
                                <th colspan="2">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="optTableBody">
                            <tr>
                                <td colspan="9" class="empty-state">
                                    <i class="fas fa-child"></i>
                                    <span>No OPT records found</span>
                                    <p class="empty-sub">Monitor children's growth through regular weighing.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- ===== APPOINTMENTS PAGE ===== -->
            <section class="page-section" id="page-appointments">
                <div class="page-header">
                    <div class="header-title">
                        <h2><i class="fas fa-calendar-check"></i> Appointments</h2>
                        <p>Manage appointments and schedules</p>
                    </div>
                    <button class="btn btn-primary" id="addAppointmentBtn">
                        <i class="fas fa-calendar-plus"></i> Schedule Appointment
                    </button>
                </div>

                <div class="filters-bar">
                    <div class="filter-group">
                        <input type="date" id="appointmentDateFilter">
                        <select id="appointmentStatusFilter">
                            <option value="">All Status</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <span class="results-count" id="appointmentResults">0 appointments</span>
                </div>

                <div class="table-responsive">
                    <table class="appointments-table">
<thead>
    <tr>
        <th>Date & Time</th>
        <th>Resident</th>
        <th>Type</th>
        <th>Location</th>
        <th>Status</th>
        <th>View</th>
        <th>Actions</th>
    </tr>
</thead>
                        <tbody id="appointmentTableBody">
                            <tr>
                                <td colspan="7" class="empty-state">
                                    <i class="fas fa-calendar-plus"></i>
                                    <span>No appointments scheduled</span>
                                    <p class="empty-sub">Schedule appointments to organize your health visits.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            <!-- ===== NOTIFICATIONS PAGE ===== -->
<section class="page-section" id="page-notifications">
    <div class="page-header">
        <div class="header-title">
            <h2><i class="fas fa-bell"></i> Notifications</h2>
            <p>Stay updated with cancellation requests and other alerts</p>
        </div>
        <div class="header-actions">
            <button class="btn btn-outline btn-sm" id="bhwMarkAllReadBtn">
                <i class="fas fa-check-double"></i> Mark All as Read
            </button>
            <button class="btn btn-outline btn-sm" id="bhwClearAllBtn">
                <i class="fas fa-trash"></i> Clear All
            </button>
        </div>
    </div>

    <div class="notifications-list" id="bhwNotificationsList">
        <!-- Notifications will be rendered here -->
    </div>
</section>
            <!-- ===== SMS NOTIFICATIONS PAGE ===== -->
            <section class="page-section" id="page-sms">
                <div class="page-header">
                    <div class="header-title">
                        <h2><i class="fas fa-sms"></i> SMS Notifications</h2>
                        <p>Send appointment reminders and health alerts to residents</p>
                    </div>
                </div>

                <div class="sms-container">
                    <div class="sms-compose">
                        <h4><i class="fas fa-pen"></i> Compose SMS</h4>
                        <div class="form-group">
                            <label>Recipient</label>
                            <select id="smsRecipient">
                                <option value="all">All Residents</option>
                                <option value="pregnant">Pregnant Women</option>
                                <option value="immunization">Immunization Due</option>
                                <option value="specific">Specific Resident</option>
                            </select>
                        </div>
                        <div class="form-group" id="specificResidentGroup" style="display:none;">
                            <label>Select Resident</label>
                            <select id="smsSpecificResident">
                                <option value="">Select a resident...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Message Template</label>
                            <select id="smsTemplate">
                                <option value="">Custom Message</option>
                                <option value="appointment">Appointment Reminder</option>
                                <option value="immunization">Immunization Reminder</option>
                                <option value="prenatal">Prenatal Check-up Reminder</option>
                                <option value="health_advisory">Health Advisory</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Message</label>
                            <textarea id="smsMessage" rows="4" placeholder="Type your message here..."></textarea>
                            <span class="char-count" id="charCount">0 / 160</span>
                        </div>
                        <button class="btn btn-primary" id="sendSmsBtn">
                            <i class="fas fa-paper-plane"></i> Send SMS
                        </button>
                    </div>

                    <div class="sms-history">
                        <h4><i class="fas fa-history"></i> SMS History</h4>
                        <div class="table-responsive">
                            <table class="sms-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Recipient</th>
                                        <th>Message</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="smsHistoryBody">
                                    <tr>
                                        <td colspan="4" class="empty-state">
                                            <i class="fas fa-sms"></i>
                                            <span>No SMS history</span>
                                            <p class="empty-sub">Sent SMS notifications will appear here.</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ===== REPORTS PAGE ===== -->
<section class="page-section" id="page-reports">
    <div class="page-header">
        <div class="header-title">
            <h2><i class="fas fa-chart-bar"></i> Reports</h2>
            <p>Generate and view health reports for Barangay Garsika</p>
        </div>
    </div>

    <div class="reports-grid">
        <div class="report-card">
            <div class="report-icon blue">
                <i class="fas fa-users"></i>
            </div>
            <h4>Resident Statistics</h4>
            <p>Demographic breakdown of residents</p>
            <button class="btn btn-outline btn-sm generate-report" data-report="resident">Generate</button>
        </div>
        <div class="report-card">
            <div class="report-icon green">
                <i class="fas fa-baby-carriage"></i>
            </div>
            <h4>Prenatal Report</h4>
            <p>Summary of prenatal care activities</p>
            <button class="btn btn-outline btn-sm generate-report" data-report="prenatal">Generate</button>
        </div>
        <div class="report-card">
            <div class="report-icon orange">
                <i class="fas fa-syringe"></i>
            </div>
            <h4>Immunization Report</h4>
            <p>Vaccination coverage report</p>
            <button class="btn btn-outline btn-sm generate-report" data-report="immunization">Generate</button>
        </div>
        <div class="report-card">
            <div class="report-icon purple">
                <i class="fas fa-weight"></i>
            </div>
            <h4>BMI Report</h4>
            <p>BMI categories and trends</p>
            <button class="btn btn-outline btn-sm generate-report" data-report="bmi">Generate</button>
        </div>
        <div class="report-card">
            <div class="report-icon red">
                <i class="fas fa-child"></i>
            </div>
            <h4>OPT Report</h4>
            <p>Children's nutritional status</p>
            <button class="btn btn-outline btn-sm generate-report" data-report="opt">Generate</button>
        </div>
        <div class="report-card">
            <div class="report-icon teal">
                <i class="fas fa-file-alt"></i>
            </div>
            <h4>Monthly Health Report</h4>
            <p>Comprehensive monthly summary</p>
            <button class="btn btn-primary btn-sm generate-report" data-report="monthly">Generate</button>
        </div>
    </div>

    <!-- Report Preview Area -->
    <div class="report-preview" id="reportPreview" style="display:none;">
        <div class="report-preview-header">
            <h3 id="reportPreviewTitle">Report Preview</h3>
            <button class="btn btn-outline btn-sm" id="closePreview">Close</button>
        </div>
        <div class="report-preview-content">
            <div class="report-placeholder">
                <i class="fas fa-file-alt"></i>
                <p>Report content will appear here.</p>
                <span class="empty-sub">Click a report button above to generate.</span>
            </div>
        </div>
        <div class="report-preview-actions">
            <button class="btn btn-outline btn-sm"><i class="fas fa-print"></i> Print</button>
            <button class="btn btn-outline btn-sm"><i class="fas fa-file-pdf"></i> Export PDF</button>
            <button class="btn btn-primary btn-sm"><i class="fas fa-download"></i> Download</button>
        </div>
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
                                <button class="btn btn-outline btn-sm change-password-btn">Change</button>
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
                                <button class="btn btn-danger btn-sm delete-account-btn">Delete Account</button>
                            </div>
                            <div class="settings-item">
                                <div class="settings-item-info">
                                    <span class="settings-label">Export Data</span>
                                    <span class="settings-desc">Download all your health records</span>
                                </div>
                                <button class="btn btn-outline btn-sm export-data-btn">Export</button>
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

    <!-- ===== MODALS ===== -->
    <!-- Add Adult Modal -->
    <div class="modal-overlay" id="addAdultModal">
        <div class="modal-content modal-lg">
            <div class="modal-header">
                <h3><i class="fas fa-user-plus"></i> Add Adult Resident</h3>
                <button class="modal-close close-modal">&times;</button>
            </div>
            <form id="addAdultForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="adultFirstName">First Name <span class="required">*</span></label>
                        <input type="text" id="adultFirstName" placeholder="Enter first name" required>
                    </div>
                    <div class="form-group">
                        <label for="adultMiddleName">Middle Name <span class="optional">(Optional)</span></label>
                        <input type="text" id="adultMiddleName" placeholder="Enter middle name">
                    </div>
                    <div class="form-group">
                        <label for="adultLastName">Last Name <span class="required">*</span></label>
                        <input type="text" id="adultLastName" placeholder="Enter last name" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="adultDob">Date of Birth <span class="required">*</span></label>
                        <input type="date" id="adultDob" required>
                    </div>
                    <div class="form-group">
                        <label for="adultAge">Age</label>
                        <input type="number" id="adultAge" placeholder="Auto-calculated" readonly>
                    </div>
                    <div class="form-group">
                        <label for="adultSex">Sex <span class="required">*</span></label>
                        <select id="adultSex" required>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="adultPurok">Purok <span class="required">*</span></label>
                        <select id="adultPurok" required>
                            <option value="">Select</option>
                            <option value="Purok 1">Purok 1</option>
                            <option value="Purok 2">Purok 2</option>
                            <option value="Purok 3">Purok 3</option>
                            <option value="Purok 4">Purok 4</option>
                            <option value="Purok 5">Purok 5</option>
                            <option value="Purok 6">Purok 6</option>
                            <option value="Purok 7">Purok 7</option>
                            <option value="Purok 8">Purok 8</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="adultMobile">Mobile Number</label>
                        <input type="tel" id="adultMobile" placeholder="09XX-XXX-XXXX">
                    </div>
                    <div class="form-group">
                        <label for="adultHousehold">Household</label>
                        <input type="text" id="adultHousehold" placeholder="e.g., Family of 5">
                    </div>
                </div>
                <div class="form-group">
                    <label for="adultAddress">Address</label>
                    <input type="text" id="adultAddress" placeholder="Complete address">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="adultEmergencyContact">Emergency Contact</label>
                        <input type="text" id="adultEmergencyContact" placeholder="Full name">
                    </div>
                    <div class="form-group">
                        <label for="adultEmergencyNumber">Emergency Number</label>
                        <input type="tel" id="adultEmergencyNumber" placeholder="09XX-XXX-XXXX">
                    </div>
                </div>
                <div class="form-group">
                    <label for="adultMedicalHistory">Medical History</label>
                    <textarea id="adultMedicalHistory" rows="2" placeholder="Any existing conditions or medical history..."></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Adult Resident</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ===== ADD CHILD MODAL ===== -->
    <div class="modal-overlay" id="addChildModal">
        <div class="modal-content modal-lg">
            <div class="modal-header">
                <h3><i class="fas fa-child"></i> Add Child Resident</h3>
                <button class="modal-close close-modal">&times;</button>
            </div>
            <form id="addChildForm">
                <!-- Child Information -->
                <div class="section-title">
                    <i class="fas fa-child"></i> Child Information
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="childFirstName">First Name <span class="required">*</span></label>
                        <input type="text" id="childFirstName" placeholder="Enter child's first name" required>
                    </div>
                    <div class="form-group">
                        <label for="childMiddleName">Middle Name <span class="optional">(Optional)</span></label>
                        <input type="text" id="childMiddleName" placeholder="Enter middle name">
                    </div>
                    <div class="form-group">
                        <label for="childLastName">Last Name <span class="required">*</span></label>
                        <input type="text" id="childLastName" placeholder="Enter child's last name" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="childDob">Date of Birth <span class="required">*</span></label>
                        <input type="date" id="childDob" required>
                    </div>
                    <div class="form-group">
                        <label for="childAge">Age</label>
                        <input type="number" id="childAge" placeholder="Auto-calculated" readonly>
                    </div>
                    <div class="form-group">
                        <label for="childSex">Sex <span class="required">*</span></label>
                        <select id="childSex" required>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="childPurok">Purok <span class="required">*</span></label>
                        <select id="childPurok" required>
                            <option value="">Select</option>
                            <option value="Purok 1">Purok 1</option>
                            <option value="Purok 2">Purok 2</option>
                            <option value="Purok 3">Purok 3</option>
                            <option value="Purok 4">Purok 4</option>
                            <option value="Purok 5">Purok 5</option>
                            <option value="Purok 6">Purok 6</option>
                            <option value="Purok 7">Purok 7</option>
                            <option value="Purok 8">Purok 8</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="childAddress">Address</label>
                        <input type="text" id="childAddress" placeholder="Complete address">
                    </div>
                </div>

                <!-- Parent / Guardian Information -->
                <div class="section-title parent-section-title">
                    <i class="fas fa-user-tie"></i> Parent / Guardian Information
                </div>

                <div class="form-group">
                    <label>Search Existing Parent <span class="required">*</span></label>
                    <div class="parent-search-group">
                        <input type="text" id="childParentSearch" placeholder="Type parent name to search..." required>
                        <button type="button" class="btn btn-primary btn-sm" id="childSearchParentBtn">
                            <i class="fas fa-search"></i> Search
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" id="childClearParentSearch">
                            <i class="fas fa-times"></i> Clear
                        </button>
                    </div>
                    <div id="childParentSearchResults" style="display:none;"></div>
                    <span class="helper-text">Search for an existing resident who is 18 years or older.</span>
                </div>

                <!-- Selected Parent Display -->
                <div class="selected-parent-display" id="selectedParentDisplay" style="display:none; background: var(--light); padding: 16px; border-radius: var(--radius-sm); border: 2px solid var(--secondary);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-weight: 600; color: var(--secondary);"><i class="fas fa-check-circle"></i> Parent Selected:</span>
                            <span id="selectedParentName" style="font-weight: 600;"></span>
                            <span id="selectedParentDetails" style="color: var(--gray); font-size: 0.85rem;"></span>
                        </div>
                        <button type="button" class="btn btn-outline btn-sm" id="changeParentBtn">Change</button>
                    </div>
                </div>

                <!-- ===== RELATIONSHIP DROPDOWN ===== -->
                <div class="form-group" id="relationshipGroup" style="display:none; margin-top: 12px;">
                    <label for="childParentRelationship">Relationship to Child <span class="required">*</span></label>
                    <select id="childParentRelationship" required>
                        <option value="">Select relationship...</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Aunt">Aunt</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Cousin">Cousin</option>
                        <option value="Other">Other</option>
                    </select>
                    <span class="helper-text">Specify the relationship of the parent/guardian to the child.</span>
                </div>

                <input type="hidden" id="childSelectedParentId" value="">

                <div class="modal-actions">
                    <button type="button" class="btn btn-outline close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="saveChildBtn">Save Child Resident</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Record BMI Modal -->
    <div class="modal-overlay" id="recordBmiModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-weight"></i> Record BMI</h3>
                <button class="modal-close close-modal">&times;</button>
            </div>
            <form id="recordBmiForm">
                <div class="form-group">
                    <label for="bmiResident">Resident <span class="required">*</span></label>
                    <select id="bmiResident" required>
                        <option value="">Select resident...</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="bmiHeight">Height (cm) <span class="required">*</span></label>
                        <input type="number" id="bmiHeight" placeholder="e.g., 175" required>
                    </div>
                    <div class="form-group">
                        <label for="bmiWeight">Weight (kg) <span class="required">*</span></label>
                        <input type="number" id="bmiWeight" placeholder="e.g., 68.5" required step="0.1">
                    </div>
                </div>
                <div class="bmi-result-display" id="bmiResultDisplay" style="display:none;">
                    <h4>BMI Result</h4>
                    <div class="bmi-result-value">
                        <span class="bmi-number" id="bmiResultNumber">0.0</span>
                        <span class="bmi-category" id="bmiResultCategory">Normal</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save BMI</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Record Immunization Modal -->
    <div class="modal-overlay" id="recordImmunizationModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-syringe"></i> Record Immunization</h3>
                <button class="modal-close close-modal">&times;</button>
            </div>
            <form id="recordImmunizationForm">
                <div class="form-group">
                    <label for="immunizationChild">Child <span class="required">*</span></label>
                    <select id="immunizationChild" required>
                        <option value="">Select child...</option>
                    </select>
                    <span class="helper-text">Only children aged 0-5 years old are shown.</span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="immunizationVaccine">Vaccine <span class="required">*</span></label>
                        <select id="immunizationVaccine" required>
                            <option value="">Select vaccine...</option>
                            <option value="BCG">BCG</option>
                            <option value="Hepatitis B">Hepatitis B</option>
                            <option value="DPT">DPT</option>
                            <option value="Polio">Polio</option>
                            <option value="Measles">Measles</option>
                            <option value="MMR">MMR</option>
                            <option value="PCV">PCV</option>
                            <option value="Rotavirus">Rotavirus</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="immunizationDose">Dose <span class="required">*</span></label>
                        <select id="immunizationDose" required>
                            <option value="">Select dose...</option>
                            <option value="1st Dose">1st Dose</option>
                            <option value="2nd Dose">2nd Dose</option>
                            <option value="3rd Dose">3rd Dose</option>
                            <option value="Booster">Booster</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="immunizationDate">Date Administered <span class="required">*</span></label>
                        <input type="date" id="immunizationDate" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="immunizationNextDose">Next Dose Date</label>
                    <input type="date" id="immunizationNextDose">
                    <span class="helper-text">Optional: Schedule the next dose</span>
                </div>
                <div class="form-group">
                    <label for="immunizationNotes">Notes</label>
                    <textarea id="immunizationNotes" rows="2" placeholder="Additional notes..."></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Immunization</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ===== EDIT IMMUNIZATION MODAL ===== -->
    <div class="modal-overlay" id="editImmunizationModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-syringe"></i> Edit Immunization Record</h3>
                <button class="modal-close close-modal">&times;</button>
            </div>
            <form id="editImmunizationForm">
                <input type="hidden" id="editImmunizationId">
                <div class="form-group">
                    <label for="editImmunizationChild">Child <span class="required">*</span></label>
                    <select id="editImmunizationChild" required>
                        <option value="">Select child...</option>
                    </select>
                    <span class="helper-text">Only children aged 0-5 years old are shown.</span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editImmunizationVaccine">Vaccine <span class="required">*</span></label>
                        <select id="editImmunizationVaccine" required>
                            <option value="">Select vaccine...</option>
                            <option value="BCG">BCG</option>
                            <option value="Hepatitis B">Hepatitis B</option>
                            <option value="DPT">DPT</option>
                            <option value="Polio">Polio</option>
                            <option value="Measles">Measles</option>
                            <option value="MMR">MMR</option>
                            <option value="PCV">PCV</option>
                            <option value="Rotavirus">Rotavirus</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editImmunizationDose">Dose <span class="required">*</span></label>
                        <select id="editImmunizationDose" required>
                            <option value="">Select dose...</option>
                            <option value="1st Dose">1st Dose</option>
                            <option value="2nd Dose">2nd Dose</option>
                            <option value="3rd Dose">3rd Dose</option>
                            <option value="Booster">Booster</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editImmunizationDate">Date Administered <span class="required">*</span></label>
                        <input type="date" id="editImmunizationDate" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="editImmunizationNextDose">Next Dose Date</label>
                    <input type="date" id="editImmunizationNextDose">
                    <span class="helper-text">Optional: Schedule the next dose</span>
                </div>
                <div class="form-group">
                    <label for="editImmunizationNotes">Notes</label>
                    <textarea id="editImmunizationNotes" rows="2" placeholder="Additional notes..."></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Immunization</button>
                </div>
            </form>
        </div>
    </div>
    <!-- ===== ADD/EDIT VACCINE MODAL ===== -->
<div class="modal-overlay" id="addEditVaccineModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="addEditVaccineTitle"><i class="fas fa-plus"></i> Add Vaccine</h3>
            <button class="modal-close close-vaccine-modal">&times;</button>
        </div>
        <form id="addEditVaccineForm">
            <input type="hidden" id="editVaccineId">
            <div class="form-group">
                <label for="vaccineName">Vaccine Name <span class="required">*</span></label>
                <input type="text" id="vaccineName" placeholder="e.g., Hepatitis B" required>
            </div>
            <div class="form-group">
                <label for="vaccineDescription">Description <span class="optional">(Optional)</span></label>
                <textarea id="vaccineDescription" rows="2" placeholder="Brief description of the vaccine..."></textarea>
            </div>
            <div class="form-group">
                <label for="vaccineDoses">Doses Required <span class="required">*</span></label>
                <select id="vaccineDoses" required>
                    <option value="1">1 Dose</option>
                    <option value="2">2 Doses</option>
                    <option value="3">3 Doses</option>
                    <option value="4">4 Doses</option>
                    <option value="5">5 Doses</option>
                </select>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-outline close-vaccine-modal">Cancel</button>
                <button type="submit" class="btn btn-primary" id="saveVaccineBtn">Save Vaccine</button>
            </div>
        </form>
    </div>
</div>
    <!-- ===== ADD PRENATAL MODAL ===== -->
<div class="modal-overlay" id="addPrenatalModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-baby-carriage"></i> Add Prenatal Record</h3>
            <button class="modal-close close-modal">&times;</button>
        </div>
        <form id="addPrenatalForm">
            <div class="form-group">
                <label for="prenatalResident">Resident <span class="required">*</span></label>
                <select id="prenatalResident" required>
                    <option value="">Select resident...</option>
                </select>
                <span class="helper-text">Only women aged 13-49 years old are shown.</span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="prenatalLmp">LMP (Last Menstrual Period) <span class="required">*</span></label>
                    <input type="date" id="prenatalLmp" required>
                </div>
                <div class="form-group">
                    <label for="prenatalDueDate">Due Date <span class="required">*</span></label>
                    <input type="date" id="prenatalDueDate" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="prenatalGestationalAge">Gestational Age (weeks)</label>
                    <input type="number" id="prenatalGestationalAge" placeholder="Auto-calculated" readonly>
                </div>
                <div class="form-group">
                    <label for="prenatalStatus">Status <span class="required">*</span></label>
                    <select id="prenatalStatus" required>
                        <option value="Active">Active</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </div>
            </div>
            <!-- ===== VITAL SIGNS ===== -->
            <div class="form-group">
                <label for="prenatalVitalSigns">
                    <i class="fas fa-heartbeat"></i> Vital Signs
                </label>
                <textarea id="prenatalVitalSigns" rows="2" placeholder="e.g., BP: 120/80, Weight: 65kg, FHR: 140 bpm..."></textarea>
                <span class="helper-text">Record blood pressure, weight, fetal heart rate, and other vital signs.</span>
            </div>
            <!-- ===== MILESTONE NOTES ===== -->
            <div class="form-group">
                <label for="prenatalMilestoneNotes">
                    <i class="fas fa-flag-checkered"></i> Milestone Notes
                </label>
                <textarea id="prenatalMilestoneNotes" rows="3" placeholder="Record fetal development milestones, pregnancy progress observations..."></textarea>
                <span class="helper-text">Track fetal movement, growth milestones, and other pregnancy developments.</span>
            </div>
            <!-- ===== NEXT CHECKUP ===== -->
            <div class="form-group">
                <label for="prenatalNextCheckup">
                    <i class="fas fa-calendar-plus"></i> Next Checkup Date
                </label>
                <input type="date" id="prenatalNextCheckup">
                <span class="helper-text">Schedule the next prenatal checkup date.</span>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-outline close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Prenatal Record</button>
            </div>
        </form>
    </div>
</div>
<!-- ===== EDIT PRENATAL MODAL ===== -->
<div class="modal-overlay" id="editPrenatalModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-baby-carriage"></i> Edit Prenatal Record</h3>
            <button class="modal-close close-modal">&times;</button>
        </div>
        <form id="editPrenatalForm">
            <input type="hidden" id="editPrenatalId">
            <div class="form-group">
                <label for="editPrenatalResident">Resident <span class="required">*</span></label>
                <select id="editPrenatalResident" required>
                    <option value="">Select resident...</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editPrenatalLmp">LMP <span class="required">*</span></label>
                    <input type="date" id="editPrenatalLmp" required>
                </div>
                <div class="form-group">
                    <label for="editPrenatalDueDate">Due Date <span class="required">*</span></label>
                    <input type="date" id="editPrenatalDueDate" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editPrenatalGestationalAge">Gestational Age (weeks)</label>
                    <input type="number" id="editPrenatalGestationalAge" readonly>
                </div>
                <div class="form-group">
                    <label for="editPrenatalStatus">Status <span class="required">*</span></label>
                    <select id="editPrenatalStatus" required>
                        <option value="Active">Active</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="editPrenatalVitalSigns">Vital Signs</label>
                <textarea id="editPrenatalVitalSigns" rows="2"></textarea>
            </div>
            <div class="form-group">
                <label for="editPrenatalMilestoneNotes">Milestone Notes</label>
                <textarea id="editPrenatalMilestoneNotes" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="editPrenatalNextCheckup">Next Checkup</label>
                <input type="date" id="editPrenatalNextCheckup">
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-outline close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Prenatal Record</button>
            </div>
        </form>
    </div>
</div>
    <!-- ===== ADD OPT MODAL ===== -->
    <div class="modal-overlay" id="addOptModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-child"></i> Record Operation Timbang (OPT)</h3>
                <button class="modal-close close-modal">&times;</button>
            </div>
            <form id="addOptForm">
                <div class="form-group">
                    <label for="optChild">Child <span class="required">*</span></label>
                    <select id="optChild" required>
                        <option value="">Select child...</option>
                    </select>
                    <span class="helper-text">Only children aged 0-5 years old are shown.</span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="optWeight">Weight (kg) <span class="required">*</span></label>
                        <input type="number" id="optWeight" placeholder="e.g., 12.5" required step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="optHeight">Height (cm) <span class="required">*</span></label>
                        <input type="number" id="optHeight" placeholder="e.g., 85" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="optDate">Date <span class="required">*</span></label>
                        <input type="date" id="optDate" required>
                    </div>
                    <div class="form-group">
                        <label for="optNutritionalStatus">Nutritional Status <span class="required">*</span></label>
                        <select id="optNutritionalStatus" required>
                            <option value="Normal">Normal</option>
                            <option value="Underweight">Underweight</option>
                            <option value="Overweight">Overweight</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="optNotes">Notes</label>
                    <textarea id="optNotes" rows="2" placeholder="Additional notes..."></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save OPT Record</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ===== EDIT OPT MODAL ===== -->
    <div class="modal-overlay" id="editOptModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-child"></i> Edit OPT Record</h3>
                <button class="modal-close close-modal">&times;</button>
            </div>
            <form id="editOptForm">
                <input type="hidden" id="editOptId">
                <div class="form-group">
                    <label for="editOptChild">Child <span class="required">*</span></label>
                    <select id="editOptChild" required>
                        <option value="">Select child...</option>
                    </select>
                    <span class="helper-text">Only children aged 0-5 years old are shown.</span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editOptWeight">Weight (kg) <span class="required">*</span></label>
                        <input type="number" id="editOptWeight" placeholder="e.g., 12.5" required step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="editOptHeight">Height (cm) <span class="required">*</span></label>
                        <input type="number" id="editOptHeight" placeholder="e.g., 85" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editOptDate">Date <span class="required">*</span></label>
                        <input type="date" id="editOptDate" required>
                    </div>
                    <div class="form-group">
                        <label for="editOptNutritionalStatus">Nutritional Status <span class="required">*</span></label>
                        <select id="editOptNutritionalStatus" required>
                            <option value="Normal">Normal</option>
                            <option value="Underweight">Underweight</option>
                            <option value="Overweight">Overweight</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="editOptNotes">Notes</label>
                    <textarea id="editOptNotes" rows="2" placeholder="Additional notes..."></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update OPT Record</button>
                </div>
            </form>
        </div>
    </div>
<!-- ===== ADD APPOINTMENT MODAL ===== -->
<div class="modal-overlay" id="addAppointmentModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-calendar-plus"></i> Schedule Appointment</h3>
            <button class="modal-close close-modal">&times;</button>
        </div>
        <form id="addAppointmentForm">
            <div class="form-group">
                <label for="appointmentResident">Resident <span class="required">*</span></label>
                <select id="appointmentResident" required>
                    <option value="">Select resident...</option>
                </select>
                <span class="helper-text">Select the resident for this appointment.</span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="appointmentDate">Date <span class="required">*</span></label>
                    <input type="date" id="appointmentDate" required>
                </div>
                <div class="form-group">
                    <label for="appointmentTime">Time <span class="required">*</span></label>
                    <select id="appointmentTime" required>
                        <option value="">Select time...</option>
                        <option value="8:00 AM">8:00 AM</option>
                        <option value="8:30 AM">8:30 AM</option>
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="9:30 AM">9:30 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="1:30 PM">1:30 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="2:30 PM">2:30 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="3:30 PM">3:30 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                        <option value="4:30 PM">4:30 PM</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="appointmentType">Appointment Type <span class="required">*</span></label>
                    <select id="appointmentType" required>
                        <option value="">Select type...</option>
                        <option value="Prenatal Check-up">Prenatal Check-up</option>
                        <option value="Immunization">Immunization</option>
                        <option value="BMI Monitoring">BMI Monitoring</option>
                        <option value="General Check-up">General Check-up</option>
                        <option value="OPT">OPT</option>
                        <option value="Dental Check-up">Dental Check-up</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="appointmentLocation">Location</label>
                    <select id="appointmentLocation">
                        <option value="Barangay Health Center">Barangay Health Center</option>
                        <option value="Resident's Home">Resident's Home</option>
                        <option value="Barangay Hall">Barangay Hall</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="appointmentStatus">Status <span class="required">*</span></label>
                <select id="appointmentStatus" required>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-group">
                <label for="appointmentNotes">Notes</label>
                <textarea id="appointmentNotes" rows="2" placeholder="Additional notes or special instructions..."></textarea>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-outline close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Schedule Appointment</button>
            </div>
        </form>
    </div>
</div>
<!-- ===== EDIT APPOINTMENT MODAL ===== -->
<div class="modal-overlay" id="editAppointmentModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-calendar-edit"></i> Edit Appointment</h3>
            <button class="modal-close close-modal">&times;</button>
        </div>
        <form id="editAppointmentForm">
            <input type="hidden" id="editAppointmentId">
            <div class="form-group">
                <label for="editAppointmentResident">Resident <span class="required">*</span></label>
                <select id="editAppointmentResident" required>
                    <option value="">Select resident...</option>
                </select>
                <span class="helper-text">Select the resident for this appointment.</span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editAppointmentDate">Date <span class="required">*</span></label>
                    <input type="date" id="editAppointmentDate" required>
                </div>
                <div class="form-group">
                    <label for="editAppointmentTime">Time <span class="required">*</span></label>
                    <select id="editAppointmentTime" required>
                        <option value="">Select time...</option>
                        <option value="8:00 AM">8:00 AM</option>
                        <option value="8:30 AM">8:30 AM</option>
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="9:30 AM">9:30 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="1:30 PM">1:30 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="2:30 PM">2:30 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="3:30 PM">3:30 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                        <option value="4:30 PM">4:30 PM</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editAppointmentType">Appointment Type <span class="required">*</span></label>
                    <select id="editAppointmentType" required>
                        <option value="">Select type...</option>
                        <option value="Prenatal Check-up">Prenatal Check-up</option>
                        <option value="Immunization">Immunization</option>
                        <option value="BMI Monitoring">BMI Monitoring</option>
                        <option value="General Check-up">General Check-up</option>
                        <option value="OPT">OPT</option>
                        <option value="Dental Check-up">Dental Check-up</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editAppointmentLocation">Location</label>
                    <select id="editAppointmentLocation">
                        <option value="Barangay Health Center">Barangay Health Center</option>
                        <option value="Resident's Home">Resident's Home</option>
                        <option value="Barangay Hall">Barangay Hall</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="editAppointmentStatus">Status <span class="required">*</span></label>
                <select id="editAppointmentStatus" required>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-group">
                <label for="editAppointmentNotes">Notes</label>
                <textarea id="editAppointmentNotes" rows="2" placeholder="Additional notes or special instructions..."></textarea>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-outline close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Appointment</button>
            </div>
        </form>
    </div>
</div>
    <!-- View Resident Modal -->
    <div class="modal-overlay" id="viewResidentModal">
        <div class="modal-content modal-lg">
            <div class="modal-header">
                <h3><i class="fas fa-user-circle"></i> Resident Details</h3>
                <button class="modal-close close-modal">&times;</button>
            </div>
            <div id="residentDetailContent">
                <!-- Dynamically populated -->
            </div>
            <div class="modal-actions">
                <button class="btn btn-outline close-modal">Close</button>
            </div>
        </div>
    </div>
<!-- ===== REVIEW CANCELLATION MODAL ===== -->
<div class="modal-overlay" id="reviewCancellationModal">
    <div class="modal-content modal-lg">
        <div class="modal-header">
            <h3><i class="fas fa-clipboard-check"></i> Review Cancellation Request</h3>
            <button class="modal-close close-review-modal">&times;</button>
        </div>
        <form id="reviewCancellationForm">
            <input type="hidden" id="reviewAppointmentId" value="">
            
            <!-- Cancellation Details -->
            <div class="review-cancellation-info" id="reviewCancellationDetails">
                <!-- Dynamically populated -->
            </div>

            <!-- BHW Notes -->
            <div class="form-group" style="margin-top: 16px;">
                <label for="bhwCancellationNotes">BHW Notes <span class="optional">(Optional)</span></label>
                <textarea id="bhwCancellationNotes" rows="3" placeholder="Add any notes or reason for your decision..."></textarea>
                <span class="helper-text">These notes will be sent to the resident.</span>
            </div>

            <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #E8EEF4;">
                <button type="button" class="btn btn-outline close-review-modal">Close</button>
                <button type="button" class="btn btn-danger btn-decision" data-decision="reject">
                    <i class="fas fa-times"></i> Reject Cancellation
                </button>
                <button type="button" class="btn btn-primary btn-decision" data-decision="approve">
                    <i class="fas fa-check"></i> Approve Cancellation
                </button>
            </div>
        </form>
    </div>
</div>
<!-- ===== VACCINE MANAGEMENT MODAL ===== -->
<div class="modal-overlay" id="vaccineManagementModal">
    <div class="modal-content modal-lg">
        <div class="modal-header">
            <h3><i class="fas fa-syringe"></i> Manage Vaccines</h3>
            <button class="modal-close close-vaccine-modal">&times;</button>
        </div>
        <div style="margin-bottom: 16px;">
            <button class="btn btn-primary btn-sm" id="addVaccineBtn">
                <i class="fas fa-plus"></i> Add New Vaccine
            </button>
        </div>
        <div class="table-responsive">
            <table class="records-table">
                <thead>
                    <tr>
                        <th>Vaccine Name</th>
                        <th>Description</th>
                        <th>Doses Required</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="vaccineTableBody">
                    <tr>
                        <td colspan="4" class="empty-state">
                            <i class="fas fa-syringe"></i>
                            <span>No vaccines found</span>
                            <p class="empty-sub">Click "Add New Vaccine" to get started.</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- ===== ADD/EDIT VACCINE MODAL ===== -->
<div class="modal-overlay" id="addEditVaccineModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="addEditVaccineTitle"><i class="fas fa-plus"></i> Add Vaccine</h3>
            <button class="modal-close close-add-vaccine">&times;</button>
        </div>
        <form id="addEditVaccineForm">
            <input type="hidden" id="editVaccineId">
            <div class="form-group">
                <label for="vaccineName">Vaccine Name <span class="required">*</span></label>
                <input type="text" id="vaccineName" placeholder="e.g., Hepatitis B" required>
            </div>
            <div class="form-group">
                <label for="vaccineDescription">Description <span class="optional">(Optional)</span></label>
                <textarea id="vaccineDescription" rows="2" placeholder="Brief description of the vaccine..."></textarea>
            </div>
            <div class="form-group">
                <label for="vaccineDoses">Doses Required <span class="required">*</span></label>
                <select id="vaccineDoses" required>
                    <option value="1">1 Dose</option>
                    <option value="2">2 Doses</option>
                    <option value="3">3 Doses</option>
                    <option value="4">4 Doses</option>
                    <option value="5">5 Doses</option>
                </select>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-outline close-add-vaccine">Cancel</button>
                <button type="submit" class="btn btn-primary" id="saveVaccineBtn">Save Vaccine</button>
            </div>
        </form>
    </div>
</div>
    <!-- ===== PASS PHP RESIDENTS DATA TO JAVASCRIPT ===== -->
    <script>
        const phpResidents = <?php echo json_encode($residentsList); ?>;
    </script>
    <script src="js/bhw.js"></script>
    <script src="js/vaccine_management.js"></script>
    <script src="js/bhw_reports.js"></script>
</body>
</html>