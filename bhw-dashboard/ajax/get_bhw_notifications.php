<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'bhw') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized', 'notifications' => []]);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'notifications' => []]);
    exit();
}

// 🔥 Use the BHW user ID from session
$userId = $_SESSION['user_id'];

try {
    // 🔥 Get notifications for THIS BHW user
    $stmt = $pdo->prepare("
        SELECT 
            id,
            type,
            title,
            message,
            link,
            is_read,
            created_at
        FROM bhw_notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
    ");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();

    // Get unread count for THIS BHW user
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as unread_count
        FROM bhw_notifications
        WHERE user_id = ? AND is_read = 0
    ");
    $stmt->execute([$userId]);
    $unreadCount = $stmt->fetch()['unread_count'] ?? 0;

    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unread_count' => (int)$unreadCount
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage(), 
        'notifications' => []
    ]);
}
?>