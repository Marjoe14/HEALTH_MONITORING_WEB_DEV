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
            s.id,
            s.resident_id,
            CONCAT(r.first_name, ' ', r.last_name) AS resident_name,
            s.recipient_number,
            s.message,
            s.status,
            DATE_FORMAT(s.sent_at, '%Y-%m-%d %h:%i %p') AS date,
            s.sent_by,
            u.username AS sent_by_name
        FROM sms_logs s
        LEFT JOIN residents r ON s.resident_id = r.id
        LEFT JOIN users u ON s.sent_by = u.id
        ORDER BY s.sent_at DESC 
        LIMIT 50
    ");
    $records = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'records' => $records]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'records' => []]);
}
?>