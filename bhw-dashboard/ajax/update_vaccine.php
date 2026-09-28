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
$name = trim($_POST['name'] ?? '');
$description = trim($_POST['description'] ?? '');
$dosesRequired = (int)($_POST['doses_required'] ?? 1);

if (!$id || empty($name)) {
    echo json_encode(['success' => false, 'message' => 'Vaccine ID and name are required']);
    exit();
}

try {
    $check = $pdo->prepare("SELECT id FROM vaccines WHERE name = ? AND id != ?");
    $check->execute([$name, $id]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Vaccine "' . $name . '" already exists']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE vaccines SET name = ?, description = ?, doses_required = ?, updated_at = NOW() WHERE id = ?");
    $result = $stmt->execute([$name, $description, $dosesRequired, $id]);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Vaccine updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update vaccine']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>