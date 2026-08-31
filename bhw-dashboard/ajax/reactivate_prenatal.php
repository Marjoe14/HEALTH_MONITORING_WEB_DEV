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
    $stmt = $pdo->prepare("
        UPDATE prenatal_records 
        SET status = 'Active', delivery_date = NULL
        WHERE id = ?
    ");
    $result = $stmt->execute([$id]);

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true, 
            'message' => 'Prenatal record reactivated successfully!'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Record not found or already active']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>