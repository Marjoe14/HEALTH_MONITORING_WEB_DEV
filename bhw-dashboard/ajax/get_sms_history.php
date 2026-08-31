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
            id,
            recipient,
            message,
            status,
            sent_at AS date
        FROM sms_logs 
        ORDER BY sent_at DESC 
        LIMIT 50
    ");
    $records = $stmt->fetchAll();
    echo json_encode(['success' => true, 'records' => $records]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'records' => []]);
}
?>