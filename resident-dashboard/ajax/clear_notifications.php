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

try {
    // Delete all notifications for this user
    $stmt = $pdo->prepare("
        DELETE FROM notifications 
        WHERE user_id = ?
    ");
    $stmt->execute([$userId]);

    echo json_encode(['success' => true, 'message' => 'All notifications cleared']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>