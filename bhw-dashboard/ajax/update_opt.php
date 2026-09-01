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
$childId = $_POST['child_id'] ?? 0;
$weight = $_POST['weight'] ?? 0;
$height = $_POST['height'] ?? 0;
$date = $_POST['date'] ?? date('Y-m-d');
$nutritionalStatus = $_POST['nutritional_status'] ?? 'Normal';
$notes = $_POST['notes'] ?? '';

try {
    $stmt = $pdo->prepare("
        UPDATE opt_records 
        SET resident_id = ?, weight = ?, height = ?, recorded_date = ?, 
            nutritional_status = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $result = $stmt->execute([
        $childId, $weight, $height, $date,
        $nutritionalStatus, $notes, $id
    ]);

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'OPT record updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No changes made or record not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>