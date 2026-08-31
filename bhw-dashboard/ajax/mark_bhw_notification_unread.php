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

$userId = $_SESSION['user_id'];
$notificationId = $_POST['notification_id'] ?? 0;

if (!$notificationId) {
    echo json_encode(['success' => false, 'message' => 'Notification ID required']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        UPDATE bhw_notifications 
        SET is_read = 0 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$notificationId, $userId]);

    echo json_encode(['success' => true, 'message' => 'Notification marked as unread']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>