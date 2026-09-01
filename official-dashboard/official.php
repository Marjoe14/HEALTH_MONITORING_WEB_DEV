<?php
// ========================================
// SMART COMMUNITY HEALTH MONITORING SYSTEM
// OFFICIAL DASHBOARD - PHP
// ========================================

// Start session
session_start();

// ============================================================
// 🔥 CHECK IF USER IS LOGGED IN AS OFFICIAL
// ============================================================
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'official') {
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
$fullName = $_SESSION['full_name'] ?? 'Official';

// Include database configuration
require_once __DIR__ . '/../config/database.php';

// Fetch stats and data
try {
    $pdo = getDBConnection();
    
    if ($pdo) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM residents");
        $residentCount = $stmt->fetchColumn();
        
        $stmt = $pdo->query("SELECT COUNT(*) FROM bhw b JOIN users u ON b.user_id = u.id WHERE u.status = 'active'");
$bhwCount = $stmt->fetchColumn();
        
        $stmt = $pdo->query("SELECT COUNT(DISTINCT resident_id) FROM prenatal_records WHERE status = 'Active'");
        $pregnantCount = $stmt->fetchColumn();
        
        $stmt = $pdo->query("SELECT COUNT(*) FROM immunization_records WHERE status IN ('Upcoming', 'Overdue')");
        $immunizationDue = $stmt->fetchColumn();
        
       $bhwStmt = $pdo->query("
    SELECT b.*, u.username, u.status 
    FROM bhw b 
    JOIN users u ON b.user_id = u.id 
    ORDER BY b.first_name
");
$bhws = $bhwStmt->fetchAll();
        
        $residentStmt = $pdo->query("
    SELECT 
        r.*, 
        u.username,
        p.first_name as parent_first_name,
        p.middle_name as parent_middle_name,
        p.last_name as parent_last_name,
        p.relationship as parent_relationship
    FROM residents r 
    LEFT JOIN users u ON r.user_id = u.id 
    LEFT JOIN residents p ON r.parent_id = p.id
    WHERE (u.status = 'active' OR u.status IS NULL OR u.status IS NULL)
    ORDER BY r.first_name
");
$residentsList = $residentStmt->fetchAll();
$residentCountDisplay = count($residentsList);
    }
} catch (PDOException $e) {
    $residentCountDisplay = 0;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>Official Dashboard · Smart Community Health Monitoring</title>
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Google Font: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/official.css">
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
            <p class="brand-sub">Official Portal</p>
        </div>

        <nav class="sidebar-nav">
            <a href="#" class="nav-item active" data-page="dashboard">
                <i class="fas fa-th-large"></i>
                <span>Dashboard</span>
            </a>
            <a href="#" class="nav-item" data-page="residents">
                <i class="fas fa-users"></i>
                <span>Residents</span>
            </a>
            <a href="#" class="nav-item" data-page="bhw-management">
                <i class="fas fa-user-md"></i>
                <span>BHW Management</span>
                <span class="badge" id="bhwCount"><?php echo isset($bhwCount) ? $bhwCount : 0; ?></span>
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
                        <h2>Welcome to your <span>Official Dashboard</span></h2>
                        <p>Monitor community health data and manage Barangay Health Workers.</p>
                    </div>
                    <div class="welcome-icon">
                        <i class="fas fa-users"></i>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon blue">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="totalResidents"><?php echo isset($residentCount) ? $residentCount : 0; ?></span>
                            <span class="stat-label">Total Residents</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon green">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="totalBHWs"><?php echo isset($bhwCount) ? $bhwCount : 0; ?></span>
                            <span class="stat-label">Active BHWs</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange">
                            <i class="fas fa-baby-carriage"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="pregnantCount"><?php echo isset($pregnantCount) ? $pregnantCount : 0; ?></span>
                            <span class="stat-label">Pregnant Women</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon purple">
                            <i class="fas fa-syringe"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="immunizationDue"><?php echo isset($immunizationDue) ? $immunizationDue : 0; ?></span>
                            <span class="stat-label">Immunizations Due</span>
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
                            <a href="#" class="quick-action" data-page="bhw-management">
                                <i class="fas fa-user-plus"></i>
                                <span>Add BHW</span>
                            </a>
                            <a href="#" class="quick-action" data-page="reports">
                                <i class="fas fa-chart-bar"></i>
                                <span>Generate Reports</span>
                            </a>
                            <a href="#" class="quick-action" data-page="residents">
                                <i class="fas fa-users"></i>
                                <span>View Residents</span>
                            </a>
                            <a href="#" class="quick-action" data-page="settings">
                                <i class="fas fa-cog"></i>
                                <span>Settings</span>
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
                                    <span class="activity-time">Health data will appear here as BHWs record information</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Community Health Summary -->
                <div class="dashboard-card full-width">
                    <div class="card-header">
                        <h3><i class="fas fa-heartbeat"></i> Community Health Summary</h3>
                        <a href="#" class="view-all" data-page="reports">View Full Report</a>
                    </div>
                    <div class="table-responsive">
                        <table class="summary-table">
                            <thead>
                                <tr>
                                    <th>Indicator</th>
                                    <th>Count</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Total Residents</td>
                                    <td id="summaryTotalResidents"><?php echo isset($residentCount) ? $residentCount : 0; ?></td>
                                    <td><span class="status-badge active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Pregnant Women</td>
                                    <td id="summaryPregnant"><?php echo isset($pregnantCount) ? $pregnantCount : 0; ?></td>
                                    <td><span class="status-badge active">Active</span></td>
                                </tr>
                                <tr>
                                    <td>Immunizations Due</td>
                                    <td id="summaryImmunizationDue"><?php echo isset($immunizationDue) ? $immunizationDue : 0; ?></td>
                                    <td><span class="status-badge upcoming">Action Needed</span></td>
                                </tr>
                                <tr>
                                    <td>Active BHWs</td>
                                    <td id="summaryActiveBHWs"><?php echo isset($bhwCount) ? $bhwCount : 0; ?></td>
                                    <td><span class="status-badge completed">Operational</span></td>
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
                        <h2><i class="fas fa-users"></i> Residents</h2>
                        <p>View all residents in Barangay Garsika</p>
                    </div>
                </div>

                <div class="filters-bar">
    <div class="filter-group">
        <input type="text" placeholder="Search by name or purok..." id="residentSearch">
        
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
        
        <select id="residentTypeFilter">
            <option value="">All Types</option>
            <option value="adult">Adult</option>
            <option value="child">Child</option>
        </select>
        
        <select id="ageRangeFilter">
            <option value="">All Ages</option>
            <option value="0-1">Newborn - 1 yr</option>
            <option value="1-5">1 - 5 yrs</option>
            <option value="6-12">6 - 12 yrs</option>
            <option value="13-17">13 - 17 yrs</option>
            <option value="18-30">18 - 30 yrs</option>
            <option value="31-50">31 - 50 yrs</option>
            <option value="51+">51+ yrs</option>
        </select>
        
        <button class="btn btn-outline btn-sm" id="clearFilters">
            <i class="fas fa-times"></i> Clear
        </button>
    </div>
    <span class="results-count" id="residentResults">
        <?php echo isset($residentCountDisplay) ? $residentCountDisplay : 0; ?> residents
    </span>
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
                <th>Status</th>
            </tr>
        </thead>
        <tbody id="residentTableBody">
    <?php if (isset($residentsList) && count($residentsList) > 0): ?>
        <?php foreach ($residentsList as $res): ?>
            <?php 
                // Calculate age properly
                $ageDisplay = '—';
                $ageNumeric = null;
                $isChild = false;
                
                if (!empty($res['date_of_birth'])) {
                    $dob = new DateTime($res['date_of_birth']);
                    $now = new DateTime();
                    $diff = $dob->diff($now);
                    
                    // Get numeric age for filtering
                    $ageNumeric = $diff->y + ($diff->m / 12);
                    
                    // Check if age is less than 1 year (12 months)
                    if ($diff->y == 0) {
                        // Less than 1 year - show months
                        if ($diff->m == 0 && $diff->d < 30) {
                            // Less than 1 month - show days or "Newborn"
                            if ($diff->d <= 7) {
                                $ageDisplay = 'Newborn';
                            } else {
                                $ageDisplay = $diff->d . ' day' . ($diff->d > 1 ? 's' : '');
                            }
                        } else {
                            // Show months
                            $months = $diff->m + ($diff->y * 12);
                            $ageDisplay = $months . ' month' . ($months > 1 ? 's' : '');
                        }
                        $isChild = true;
                    } else {
                        // 1 year or older - show years
                        $years = $diff->y;
                        $ageDisplay = $years . ' yr' . ($years > 1 ? 's' : '');
                        $isChild = ($years < 18);
                        $ageNumeric = $years;
                    }
                } elseif (!empty($res['age'])) {
                    // Fallback to stored age if DOB not available
                    $ageDisplay = $res['age'];
                    $ageNumeric = intval($res['age']);
                    $isChild = ($res['age'] < 18);
                }
                
                // Determine if adult or child
                $type = $isChild ? 'Child' : 'Adult';
                $typeClass = $isChild ? 'child' : 'adult';
                $typeValue = $isChild ? 'child' : 'adult';
                
                // Get parent/guardian name
                $parentName = '—';
                if ($isChild && !empty($res['parent_first_name'])) {
                    $parentName = htmlspecialchars($res['parent_first_name'] . ' ' . ($res['parent_middle_name'] ?? '') . ' ' . $res['parent_last_name']);
                    if (!empty($res['parent_relationship'])) {
                        $parentName .= ' (' . htmlspecialchars($res['parent_relationship']) . ')';
                    }
                }
            ?>
            <tr 
                data-name="<?php echo strtolower(htmlspecialchars($res['first_name'] . ' ' . $res['last_name'])); ?>"
                data-purok="<?php echo htmlspecialchars($res['purok'] ?? ''); ?>"
                data-type="<?php echo $typeValue; ?>"
                data-age="<?php echo $ageNumeric !== null ? $ageNumeric : ''; ?>"
            >
                <td>
                    <strong><?php echo htmlspecialchars($res['first_name'] . ' ' . ($res['middle_name'] ?? '') . ' ' . $res['last_name']); ?></strong>
                    <?php if ($isChild && $parentName !== '—'): ?>
                        <br><small style="color: var(--gray-light); font-size: 0.7rem;">
                            <i class="fas fa-user-friends"></i> Guardian: <?php echo $parentName; ?>
                        </small>
                    <?php endif; ?>
                </td>
                <td><?php echo htmlspecialchars($res['purok'] ?? '—'); ?></td>
                <td><?php echo $ageDisplay; ?></td>
                <td><?php echo htmlspecialchars($res['sex'] ?? '—'); ?></td>
                <td>
                    <span class="resident-type <?php echo $typeClass; ?>">
                        <i class="fas fa-<?php echo $isChild ? 'child' : 'user'; ?>"></i>
                        <?php echo $type; ?>
                    </span>
                </td>
                <td><span class="status-badge active">Active</span></td>
            </tr>
        <?php endforeach; ?>
    <?php else: ?>
        <tr>
            <td colspan="6" class="empty-state">
                <i class="fas fa-users-slash"></i>
                <span>No residents registered yet</span>
                <p class="empty-sub">Residents will appear here once BHWs add them to the system.</p>
            </td>
        </tr>
    <?php endif; ?>
</tbody>
    </table>
</div>
            </section>

            <!-- ===== BHW MANAGEMENT PAGE ===== -->
            <section class="page-section" id="page-bhw-management">
                <div class="page-header">
                    <div class="header-title">
                        <h2><i class="fas fa-user-md"></i> BHW Management</h2>
                        <p>Manage Barangay Health Workers in Barangay Garsika</p>
                    </div>
                    <button class="btn btn-primary" id="addBhwBtn">
                        <i class="fas fa-user-plus"></i> Add BHW
                    </button>
                </div>

                <div class="filters-bar">
                    <div class="filter-group">
                        <input type="text" placeholder="Search BHW..." id="bhwSearch">
                    </div>
                    <span class="results-count" id="bhwResults"><?php echo isset($bhwCount) ? $bhwCount : 0; ?> BHWs</span>
                </div>

                <div class="table-responsive">
                    <table class="bhw-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Contact</th>
                                <th>Assigned Purok</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="bhwTableBody">
                            <?php if (isset($bhws) && count($bhws) > 0): ?>
                                <?php foreach ($bhws as $bhw): ?>
                                    <tr>
                                        <td><strong><?php echo htmlspecialchars($bhw['first_name'] . ' ' . $bhw['last_name']); ?></strong></td>
                                        <td><?php echo htmlspecialchars($bhw['username']); ?></td>
                                        <td><?php echo htmlspecialchars($bhw['contact_number'] ?? '—'); ?></td>
                                        <td><?php echo htmlspecialchars($bhw['assigned_purok'] ?? 'All Puroks'); ?></td>
                                        <td><span class="status-badge <?php echo $bhw['status'] === 'active' ? 'active' : 'inactive'; ?>"><?php echo ucfirst($bhw['status']); ?></span></td>
                                        <td>
                                            <button class="btn btn-outline btn-sm view-bhw" data-id="<?php echo $bhw['id']; ?>">
                                                <i class="fas fa-eye"></i> View
                                            </button>
                                            <button class="btn btn-outline btn-sm edit-bhw" data-id="<?php echo $bhw['id']; ?>">
                                                <i class="fas fa-edit"></i> Edit
                                            </button>
                                            <?php if ($bhw['status'] === 'active'): ?>
                                                <button class="btn btn-danger btn-sm deactivate-bhw" data-id="<?php echo $bhw['user_id']; ?>">
                                                    <i class="fas fa-user-slash"></i> Deactivate
                                                </button>
                                            <?php else: ?>
                                                <button class="btn btn-success btn-sm reactivate-bhw" data-id="<?php echo $bhw['user_id']; ?>">
                                                    <i class="fas fa-user-check"></i> Reactivate
                                                </button>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="6" class="empty-state">
                                        <i class="fas fa-user-md"></i>
                                        <span>No BHWs registered yet</span>
                                        <p class="empty-sub">Click "Add BHW" to create accounts for Barangay Health Workers.</p>
                                    </td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
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
                        <h4>Resident Demographics</h4>
                        <p>Age, sex, and purok distribution</p>
                        <button class="btn btn-outline btn-sm generate-report" data-report="resident">Generate</button>
                    </div>
                    <div class="report-card">
                        <div class="report-icon green">
                            <i class="fas fa-baby-carriage"></i>
                        </div>
                        <h4>Prenatal Summary</h4>
                        <p>Maternal health overview</p>
                        <button class="btn btn-outline btn-sm generate-report" data-report="prenatal">Generate</button>
                    </div>
                    <div class="report-card">
                        <div class="report-icon orange">
                            <i class="fas fa-syringe"></i>
                        </div>
                        <h4>Immunization Coverage</h4>
                        <p>Vaccination rates and trends</p>
                        <button class="btn btn-outline btn-sm generate-report" data-report="immunization">Generate</button>
                    </div>
                    <div class="report-card">
                        <div class="report-icon purple">
                            <i class="fas fa-weight"></i>
                        </div>
                        <h4>BMI Status Report</h4>
                        <p>Nutritional status of residents</p>
                        <button class="btn btn-outline btn-sm generate-report" data-report="bmi">Generate</button>
                    </div>
                    <div class="report-card">
                        <div class="report-icon red">
                            <i class="fas fa-child"></i>
                        </div>
                        <h4>OPT Report</h4>
                        <p>Children's growth monitoring</p>
                        <button class="btn btn-outline btn-sm generate-report" data-report="opt">Generate</button>
                    </div>
                    <div class="report-card">
                        <div class="report-icon teal">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <h4>Monthly Health Summary</h4>
                        <p>Comprehensive barangay health report</p>
                        <button class="btn btn-primary btn-sm generate-report" data-report="monthly">Generate</button>
                    </div>
                    <div class="report-card">
                        <div class="report-icon blue">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <h4>BHW Performance</h4>
                        <p>BHW activity and coverage report</p>
                        <button class="btn btn-outline btn-sm generate-report" data-report="bhw">Generate</button>
                    </div>
                    <div class="report-card">
                        <div class="report-icon green">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <h4>Appointments Summary</h4>
                        <p>Health visit statistics</p>
                        <button class="btn btn-outline btn-sm generate-report" data-report="appointments">Generate</button>
                    </div>
                    <div class="report-card">
                        <div class="report-icon purple">
                            <i class="fas fa-sms"></i>
                        </div>
                        <h4>SMS Activity Report</h4>
                        <p>Notification delivery statistics</p>
                        <button class="btn btn-outline btn-sm generate-report" data-report="sms">Generate</button>
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
                            <span class="empty-sub">This is a preview of the generated report.</span>
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
                <h4><i class="fas fa-globe"></i> Language & Region</h4>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <span class="settings-label">Language</span>
                        <span class="settings-desc">Select your preferred language</span>
                    </div>
                    <select class="settings-select">
                        <option value="en">English</option>
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
        </div>
    </div>
</section>

        </div>

        <!-- ===== FOOTER ===== -->
        <footer class="dashboard-footer">
            <p>&copy; 2026 Barangay Garsika · Smart Community Health Monitoring System</p>
        </footer>

    </main>

    <!-- ===== ADD BHW MODAL ===== -->
    <div class="modal-overlay" id="addBhwModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-plus"></i> Add BHW Account</h3>
                <button class="modal-close close-modal">&times;</button>
            </div>
            <form id="addBhwForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="bhwFirstName">First Name <span class="required">*</span></label>
                        <input type="text" id="bhwFirstName" name="first_name" placeholder="Enter first name">
                    </div>
                    <div class="form-group">
                        <label for="bhwMiddleName">Middle Name <span class="optional">(Optional)</span></label>
                        <input type="text" id="bhwMiddleName" name="middle_name" placeholder="Enter middle name">
                    </div>
                    <div class="form-group">
                        <label for="bhwLastName">Last Name <span class="required">*</span></label>
                        <input type="text" id="bhwLastName" name="last_name" placeholder="Enter last name">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="bhwUsername">Username <span class="required">*</span></label>
                        <input type="text" id="bhwUsername" name="username" placeholder="Choose username">
                    </div>
                    <div class="form-group">
                        <label for="bhwPassword">Password <span class="required">*</span></label>
                        <div class="password-wrapper">
                            <input type="password" id="bhwPassword" name="password" placeholder="Create password">
                            <button type="button" class="toggle-password" data-target="bhwPassword">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="bhwConfirmPassword">Confirm Password <span class="required">*</span></label>
                        <div class="password-wrapper">
                            <input type="password" id="bhwConfirmPassword" name="confirm_password" placeholder="Confirm password">
                            <button type="button" class="toggle-password" data-target="bhwConfirmPassword">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="bhwContact">Contact Number <span class="optional">(Optional)</span></label>
                        <input type="tel" id="bhwContact" name="contact" placeholder="09XX-XXX-XXXX">
                    </div>
                    <div class="form-group">
                        <label for="bhwEmail">Email <span class="optional">(Optional)</span></label>
                        <input type="email" id="bhwEmail" name="email" placeholder="Enter email address">
                    </div>
                    <div class="form-group">
                        <label for="bhwPurok">Assigned Purok <span class="optional">(Optional)</span></label>
                        <select id="bhwPurok" name="purok">
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
                    </div>
                </div>
                <div class="form-group">
                    <label for="bhwRole">Role <span class="required">*</span></label>
                    <select id="bhwRole" name="role">
                        <option value="bhw">Barangay Health Worker (BHW)</option>
                        <option value="head_bhw">Head BHW</option>
                    </select>
                </div>
                <div id="formError" style="display:none; background:#FDEDEC; color:#C62828; padding:10px 14px; border-radius:8px; margin-bottom:16px; border:1px solid #F5C6CB;">
                    <i class="fas fa-exclamation-circle"></i> <span id="formErrorMessage"></span>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="submitBhwBtn">Create BHW Account</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ===== VIEW BHW MODAL ===== -->
    <div class="modal-overlay" id="viewBhwModal">
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3><i class="fas fa-user-md"></i> BHW Details</h3>
                <button class="modal-close close-modal">&times;</button>
            </div>
            <div class="view-bhw-details">
                <div class="view-row">
                    <span class="view-label"><i class="fas fa-user"></i> Name</span>
                    <span class="view-value" id="viewBhwName">—</span>
                </div>
                <div class="view-row">
                    <span class="view-label"><i class="fas fa-user-tag"></i> Username</span>
                    <span class="view-value" id="viewBhwUsername">—</span>
                </div>
                <div class="view-row">
                    <span class="view-label"><i class="fas fa-phone"></i> Contact</span>
                    <span class="view-value" id="viewBhwContact">—</span>
                </div>
                <div class="view-row">
                    <span class="view-label"><i class="fas fa-envelope"></i> Email</span>
                    <span class="view-value" id="viewBhwEmail">—</span>
                </div>
                <div class="view-row">
                    <span class="view-label"><i class="fas fa-map-marker-alt"></i> Assigned Purok</span>
                    <span class="view-value" id="viewBhwPurok">—</span>
                </div>
                <div class="view-row">
                    <span class="view-label"><i class="fas fa-circle"></i> Status</span>
                    <span class="view-value" id="viewBhwStatus">—</span>
                </div>
                <div class="view-row">
                    <span class="view-label"><i class="fas fa-briefcase"></i> Role</span>
                    <span class="view-value" id="viewBhwRole">—</span>
                </div>
                <div class="view-row">
                    <span class="view-label"><i class="fas fa-calendar"></i> Created</span>
                    <span class="view-value" id="viewBhwCreated">—</span>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-outline close-modal">Close</button>
            </div>
        </div>
    </div>

    <!-- ===== EDIT BHW MODAL ===== -->
    <div class="modal-overlay" id="editBhwModal">
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Edit BHW</h3>
                <button class="modal-close close-modal">&times;</button>
            </div>
            <form id="editBhwForm">
                <input type="hidden" id="editBhwId" name="bhw_id">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editBhwFirstName">First Name <span class="required">*</span></label>
                        <input type="text" id="editBhwFirstName" name="first_name" placeholder="Enter first name">
                    </div>
                    <div class="form-group">
                        <label for="editBhwMiddleName">Middle Name <span class="optional">(Optional)</span></label>
                        <input type="text" id="editBhwMiddleName" name="middle_name" placeholder="Enter middle name">
                    </div>
                    <div class="form-group">
                        <label for="editBhwLastName">Last Name <span class="required">*</span></label>
                        <input type="text" id="editBhwLastName" name="last_name" placeholder="Enter last name">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editBhwContact">Contact Number <span class="optional">(Optional)</span></label>
                        <input type="tel" id="editBhwContact" name="contact" placeholder="09XX-XXX-XXXX">
                    </div>
                    <div class="form-group">
                        <label for="editBhwEmail">Email <span class="optional">(Optional)</span></label>
                        <input type="email" id="editBhwEmail" name="email" placeholder="Enter email address">
                    </div>
                    <div class="form-group">
                        <label for="editBhwPurok">Assigned Purok <span class="optional">(Optional)</span></label>
                        <select id="editBhwPurok" name="purok">
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
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editBhwStatus">Status</label>
                        <select id="editBhwStatus" name="status">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                <div id="editFormError" style="display:none; background:#FDEDEC; color:#C62828; padding:10px 14px; border-radius:8px; margin-bottom:16px; border:1px solid #F5C6CB;">
                    <i class="fas fa-exclamation-circle"></i> <span id="editFormErrorMessage"></span>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="submitEditBhwBtn">Update BHW</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/official.js"></script>
    <script src="js/bhw-actions.js"></script>
</body>
</html>