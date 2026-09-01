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
$residentId = $_POST['resident_id'] ?? 0;
$lmp = $_POST['lmp'] ?? '';
$dueDate = $_POST['due_date'] ?? '';
$gestationalAge = $_POST['gestational_age'] ?? 0;
$status = $_POST['status'] ?? 'Active';
$vitalSigns = $_POST['vital_signs'] ?? '';
$milestoneNotes = $_POST['milestone_notes'] ?? '';
$nextCheckup = $_POST['next_checkup'] ?? null;

if (!$residentId || !$lmp || !$dueDate) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        UPDATE prenatal_records 
        SET resident_id = ?, lmp = ?, due_date = ?, gestational_age = ?, 
            status = ?, vital_signs = ?, milestone_notes = ?, next_checkup = ?
        WHERE id = ?
    ");
    $result = $stmt->execute([
        $residentId, $lmp, $dueDate, $gestationalAge,
        $status, $vitalSigns, $milestoneNotes, $nextCheckup,
        $id
    ]);

    if ($result) {
        echo json_encode([
            'success' => true, 
            'message' => 'Prenatal record updated successfully'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update prenatal record']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>