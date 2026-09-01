<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'bhw') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

$today = date('Y-m-d');

try {
    // Get today's appointments
    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.appointment_time,
            a.type,
            a.status,
            CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name) AS resident_name
        FROM appointments a
        LEFT JOIN residents r ON a.resident_id = r.id
        WHERE a.appointment_date = ?
        ORDER BY a.appointment_time ASC
    ");
    $stmt->execute([$today]);
    $todayAppointments = $stmt->fetchAll();

    // Get counts for dashboard stats
    $stmt = $pdo->query("SELECT COUNT(*) FROM residents");
    $totalResidents = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(DISTINCT resident_id) FROM prenatal_records WHERE status = 'Active'");
    $pregnantCount = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) FROM immunization_records WHERE status IN ('Upcoming', 'Overdue')");
    $immunizationDue = $stmt->fetchColumn();
    
    // Get SMS stats
    $stmt = $pdo->query("SELECT COUNT(*) FROM sms_logs WHERE status = 'Sent'");
    $totalSmsSent = $stmt->fetchColumn();
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM sms_logs WHERE status = 'Failed'");
    $totalSmsFailed = $stmt->fetchColumn();

    echo json_encode([
        'success' => true,
        'today_appointments' => $todayAppointments,
        'count' => count($todayAppointments),
        'total_residents' => (int)$totalResidents,
        'pregnant_count' => (int)$pregnantCount,
        'immunization_due' => (int)$immunizationDue,
        'total_sms_sent' => (int)$totalSmsSent,
        'total_sms_failed' => (int)$totalSmsFailed
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>