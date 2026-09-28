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

$childId = $_POST['child_id'] ?? 0;
$vaccine = $_POST['vaccine'] ?? '';
$dose = $_POST['dose'] ?? '';
$dateAdministered = $_POST['date_administered'] ?? '';
$nextDose = $_POST['next_dose'] ?? '';
$notes = $_POST['notes'] ?? '';

// Determine status based on date
$today = date('Y-m-d');
$status = 'Upcoming';

if ($dateAdministered <= $today) {
    $status = 'Completed';
    if ($nextDose && $nextDose < $today) {
        $status = 'Overdue';
    }
} elseif ($dateAdministered > $today) {
    $status = 'Upcoming';
}

try {
    // FIXED: Use 'resident_id' instead of 'child_id' since that's what the table expects
    $stmt = $pdo->prepare("
        INSERT INTO immunization_records 
        (resident_id, vaccine, dose, date_administered, next_dose_date, status, recorded_by, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $result = $stmt->execute([
        $childId, $vaccine, $dose, $dateAdministered, 
        $nextDose ?: null, $status, $_SESSION['user_id'], $notes
    ]);

    if ($result) {
        echo json_encode([
            'success' => true, 
            'id' => $pdo->lastInsertId(), 
            'message' => 'Immunization recorded successfully',
            'child_id' => $childId
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to record immunization']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>