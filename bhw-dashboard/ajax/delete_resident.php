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

$id = $_POST['id'] ?? 0;

try {
    // Start transaction
    $pdo->beginTransaction();
    
    // First, get the user_id associated with this resident
    $stmt = $pdo->prepare("SELECT user_id FROM residents WHERE id = ?");
    $stmt->execute([$id]);
    $resident = $stmt->fetch();
    
    if (!$resident) {
        echo json_encode(['success' => false, 'message' => 'Resident not found']);
        exit();
    }
    
    $userId = $resident['user_id'];
    
    // Delete the resident
    $stmt = $pdo->prepare("DELETE FROM residents WHERE id = ?");
    $result = $stmt->execute([$id]);
    
    // If resident had a user account, delete it too
    if ($userId) {
        $userStmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $userStmt->execute([$userId]);
    }
    
    // Commit transaction
    $pdo->commit();

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Resident and associated user account deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Resident not found']);
    }
} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>