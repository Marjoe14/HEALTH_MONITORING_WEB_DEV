<?php
// ========================================
// BHW REPORT HANDLER - AJAX Endpoint
// ========================================

session_start();

// Check if user is logged in as BHW
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'bhw') {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Unauthorized access.']);
    exit();
}

// Check if action is set
if (!isset($_POST['action']) || $_POST['action'] !== 'generate_report') {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Invalid action.']);
    exit();
}

// Include database configuration
require_once __DIR__ . '/../../config/database.php';

// Include report functions
require_once __DIR__ . '/../bhw_report_functions.php';

$pdo = getDBConnection();

if (!$pdo) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

$reportType = $_POST['report_type'] ?? '';

if (empty($reportType)) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Report type required.']);
    exit();
}

// Generate the report
$result = generateBhwReport($pdo, $reportType, $_SESSION['user_id']);

header('Content-Type: application/json');
echo json_encode($result);
exit();
?>