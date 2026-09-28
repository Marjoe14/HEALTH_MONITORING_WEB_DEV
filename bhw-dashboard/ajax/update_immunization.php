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
$vaccine = $_POST['vaccine'] ?? '';
$dose = $_POST['dose'] ?? '';
$dateAdministered = $_POST['date_administered'] ?? '';
$nextDose = $_POST['next_dose'] ?? '';
$notes = $_POST['notes'] ?? '';

// Determine status
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
    $stmt = $pdo->prepare("
        UPDATE immunization_records 
        SET resident_id = ?, vaccine = ?, dose = ?, date_administered = ?, 
            next_dose_date = ?, status = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $result = $stmt->execute([
        $childId, $vaccine, $dose, $dateAdministered,
        $nextDose ?: null, $status, $notes, $id
    ]);

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Immunization record updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No changes made or record not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>