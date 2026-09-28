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

$appointmentId = $_GET['id'] ?? 0;

if (!$appointmentId) {
    echo json_encode(['success' => false, 'message' => 'Appointment ID required']);
    exit();
}

try {
    $sql = "
        SELECT 
            a.id,
            a.resident_id,
            a.appointment_date,
            a.appointment_time,
            a.type,
            a.location,
            a.status,
            a.cancellation_reason,
            a.cancellation_notes,
            a.cancellation_requested_at,
            CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name) AS resident_name,
            r.purok,
            r.mobile_number
        FROM appointments a
        JOIN residents r ON a.resident_id = r.id
        WHERE a.id = ? AND a.cancellation_status = 'pending'
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$appointmentId]);
    $request = $stmt->fetch();

    if ($request) {
        echo json_encode(['success' => true, 'request' => $request]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Cancellation request not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>