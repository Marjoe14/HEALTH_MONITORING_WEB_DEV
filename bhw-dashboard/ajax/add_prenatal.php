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
$lmp = $_POST['lmp'] ?? '';
$dueDate = $_POST['due_date'] ?? '';
$gestationalAge = $_POST['gestational_age'] ?? 0;
$status = $_POST['status'] ?? 'Active';
$milestoneNotes = $_POST['milestone_notes'] ?? '';
$vitalSigns = $_POST['vital_signs'] ?? '';
$nextCheckup = $_POST['next_checkup'] ?? null;
$recordedBy = $_SESSION['user_id'];

if (!$residentId || !$lmp || !$dueDate) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO prenatal_records 
        (resident_id, lmp, due_date, gestational_age, status, milestone_notes, vital_signs, next_checkup, recorded_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $result = $stmt->execute([
        $residentId,
        $lmp,
        $dueDate,
        $gestationalAge,
        $status,
        $milestoneNotes,
        $vitalSigns,
        $nextCheckup,
        $recordedBy
    ]);

    if ($result) {
        echo json_encode([
            'success' => true, 
            'id' => $pdo->lastInsertId(), 
            'message' => 'Prenatal record added successfully'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add prenatal record']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>