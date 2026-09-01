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

// Change: Use 'resident_id' instead of 'child_id'
$residentId = $_POST['child_id'] ?? 0;  // Keep receiving as child_id from JS
$weight = $_POST['weight'] ?? 0;
$height = $_POST['height'] ?? 0;
$nutritionalStatus = $_POST['nutritional_status'] ?? 'Normal';
$recordedDate = $_POST['date'] ?? date('Y-m-d');
$notes = $_POST['notes'] ?? '';
$recordedBy = $_SESSION['user_id'];

if (!$residentId || !$weight || !$height) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit();
}

try {
    // Change: Use 'resident_id' column name
    $stmt = $pdo->prepare("
        INSERT INTO opt_records 
        (resident_id, weight, height, nutritional_status, recorded_date, recorded_by, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $result = $stmt->execute([
        $residentId,
        $weight,
        $height,
        $nutritionalStatus,
        $recordedDate,
        $recordedBy,
        $notes
    ]);

    if ($result) {
        echo json_encode([
            'success' => true, 
            'id' => $pdo->lastInsertId(), 
            'message' => 'OPT record added successfully'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add OPT record']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>