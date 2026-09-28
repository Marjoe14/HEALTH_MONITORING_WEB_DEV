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

$id = (int)($_POST['id'] ?? 0);

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Vaccine ID required']);
    exit();
}

try {
    $check = $pdo->prepare("SELECT COUNT(*) FROM immunization_records WHERE vaccine = (SELECT name FROM vaccines WHERE id = ?)");
    $check->execute([$id]);
    $used = $check->fetchColumn();

    if ($used > 0) {
        echo json_encode(['success' => false, 'message' => 'Cannot delete: This vaccine is being used in immunization records']);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM vaccines WHERE id = ?");
    $result = $stmt->execute([$id]);

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Vaccine deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Vaccine not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>