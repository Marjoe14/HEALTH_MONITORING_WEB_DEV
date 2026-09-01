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

$name = trim($_POST['name'] ?? '');
$description = trim($_POST['description'] ?? '');
$dosesRequired = (int)($_POST['doses_required'] ?? 1);

if (empty($name)) {
    echo json_encode(['success' => false, 'message' => 'Vaccine name is required']);
    exit();
}

try {
    $check = $pdo->prepare("SELECT id FROM vaccines WHERE name = ?");
    $check->execute([$name]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Vaccine "' . $name . '" already exists']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO vaccines (name, description, doses_required, created_at) VALUES (?, ?, ?, NOW())");
    $result = $stmt->execute([$name, $description, $dosesRequired]);

    if ($result) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Vaccine added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add vaccine']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>