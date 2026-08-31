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

try {
    // 🔥 Get all shared notifications
    $stmt = $pdo->prepare("
        SELECT 
            id,
            type,
            title,
            message,
            link,
            is_read,
            created_at
        FROM bhw_shared_notifications
        ORDER BY created_at DESC
        LIMIT 50
    ");
    $stmt->execute();
    $notifications = $stmt->fetchAll();

    // Get unread count
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as unread_count
        FROM bhw_shared_notifications
        WHERE is_read = 0
    ");
    $stmt->execute();
    $unreadCount = $stmt->fetch()['unread_count'] ?? 0;

    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unread_count' => (int)$unreadCount
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'notifications' => []]);
}
?>