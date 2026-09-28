<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'bhw') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized', 'records' => []]);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'records' => []]);
    exit();
}

try {
    $stmt = $pdo->query("
        SELECT 
            b.id,
            b.resident_id,
            b.height,
            b.weight,
            b.bmi,
            b.category,
            b.recorded_at AS date,
            b.notes,
            CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name) AS resident_name
        FROM bmi_records b
        LEFT JOIN residents r ON b.resident_id = r.id
        ORDER BY b.recorded_at DESC
    ");
    $records = $stmt->fetchAll();
    echo json_encode(['success' => true, 'records' => $records]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'records' => []]);
}
?>