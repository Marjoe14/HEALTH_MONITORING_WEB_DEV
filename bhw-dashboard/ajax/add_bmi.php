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

$residentId = $_POST['resident_id'] ?? 0;
$height = $_POST['height'] ?? 0;
$weight = $_POST['weight'] ?? 0;
$bmi = $_POST['bmi'] ?? 0;
$category = $_POST['category'] ?? '';
$recordedAt = $_POST['date'] ?? date('Y-m-d');
$notes = $_POST['notes'] ?? '';

try {
    $stmt = $pdo->prepare("
        INSERT INTO bmi_records 
        (resident_id, height, weight, bmi, category, recorded_by, recorded_at, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $result = $stmt->execute([
        $residentId, $height, $weight, $bmi, $category, $_SESSION['user_id'], $recordedAt, $notes
    ]);

    if ($result) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'BMI recorded successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to record BMI']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>