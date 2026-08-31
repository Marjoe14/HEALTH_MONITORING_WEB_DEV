<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'bhw') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized', 'vaccines' => []]);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

$pdo = getDBConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'vaccines' => []]);
    exit();
}

try {
    $stmt = $pdo->query("SELECT id, name, description, doses_required FROM vaccines ORDER BY name ASC");
    $vaccines = $stmt->fetchAll();
    echo json_encode(['success' => true, 'vaccines' => $vaccines]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage(), 'vaccines' => []]);
}
?>