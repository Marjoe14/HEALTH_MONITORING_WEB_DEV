<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'resident') {
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
    // Verify notification belongs to this user
    $stmt = $pdo->prepare("
        SELECT id FROM notifications 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$notificationId, $userId]);
    
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Notification not found or unauthorized']);
        exit();
    }
    
    // Mark as unread
    $stmt = $pdo->prepare("
        UPDATE notifications 
        SET is_read = 0 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$notificationId, $userId]);

    echo json_encode(['success' => true, 'message' => 'Notification marked as unread']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>