<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'bhw') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized', 'requests' => []]);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'requests' => []]);
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
            a.cancellation_reason,
            a.cancellation_notes,
            a.cancellation_requested_at,
            CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name) AS resident_name
        FROM appointments a
        JOIN residents r ON a.resident_id = r.id
        WHERE a.cancellation_status = 'pending'
        ORDER BY a.cancellation_requested_at ASC
    ";

    $stmt = $pdo->query($sql);
    $requests = $stmt->fetchAll();

    echo json_encode(['success' => true, 'requests' => $requests]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'requests' => []]);
}
?>