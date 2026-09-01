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
$deliveryDate = $_POST['delivery_date'] ?? date('Y-m-d');

try {
    $stmt = $pdo->prepare("
        UPDATE prenatal_records 
        SET status = 'Delivered', delivery_date = ?
        WHERE id = ?
    ");
    $result = $stmt->execute([$deliveryDate, $id]);

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true, 
            'message' => 'Pregnancy marked as delivered successfully!'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Record not found or already delivered']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>