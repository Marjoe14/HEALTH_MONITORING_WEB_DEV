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

$notificationId = $_POST['notification_id'] ?? 0;

try {
    if ($notificationId) {
        // Mark single notification as read
        $stmt = $pdo->prepare("
            UPDATE bhw_shared_notifications 
            SET is_read = 1 
            WHERE id = ?
        ");
        $stmt->execute([$notificationId]);
    } else {
        // Mark all as read
        $stmt = $pdo->prepare("
            UPDATE bhw_shared_notifications 
            SET is_read = 1 
            WHERE is_read = 0
        ");
        $stmt->execute();
    }

    echo json_encode(['success' => true, 'message' => 'Notifications marked as read']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>